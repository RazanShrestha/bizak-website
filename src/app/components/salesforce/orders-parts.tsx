import { ordersStore } from "../sales/store";
import { CHARGE_ITEM_ID, offerOf } from "../sales/estimate-offer";
import type { EstimateVersion } from "../sales/estimate-offer";
import { estimatesStore } from "../sales/flow";
import { ME, TERMS, addDays, customerById as salesCustomerById, fmtShort, orderTotal as salesOrderTotal, termById } from "../sales/orders";
import type { Order, OrderLine } from "../sales/orders";
import { SF_NOW, SF_TODAY } from "./data";
import type { HubOrder, HubStatus, LedgerEntry, Note, Scheme, Source } from "./data";
import { compact, customerById, evaluate, isCharge, npr, typeOf } from "./engine";
import type { Evaluation, PricedLine } from "./engine";
import { deskFollowsOtherTab, putSalesOrder } from "./bridge";
import { STAFF_NAME, logEvent } from "./records";
import { hubStore, ledgerStore, notesStore, schemesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// ORDERS · KERNEL
//
// An order from any channel — the rep app, the dealer portal, WhatsApp, an
// accepted estimate, the office — IS a Bizak sales order (owner decision #31):
// one record, one number (SO-…). A hub order is that sales order's channel and
// review side — who placed it, why it waits — and its `id` is the sales
// order's number. The sales order is on the sales desk from the moment the
// order is placed: pending while it waits here, then approved or rejected, and
// a decision taken on either desk reaches the other (the foot of this file).
//
// The hub never prices an order itself: every figure comes from `evaluate`, the
// same call the rep app and the dealer portal make, so what Orders shows and
// what the sales order says can never disagree. The sales order keeps the
// schemes it got as a snapshot (memo + line descriptions) because the scheme
// may change tomorrow.
//
// Approving also BILLS the order (a ledger Invoice row). In Bizak the invoice
// follows delivery; the prototype bills at approval so the credit loop — order,
// owe, pay, confirm, credit frees up — can be walked end to end.
// ════════════════════════════════════════════════════════════════════════════

export const SOURCE_NAME: Record<Source, string> = { rep: "Rep app", portal: "Dealer portal", whatsapp: "WhatsApp", "retailer-app": "Retailer app", "back-office": "Back office" };
/** The channel as a sales order's memo and history name it: "From the Dealer portal". */
const FROM: Record<Source, string> = { rep: "the Rep app", portal: "the Dealer portal", whatsapp: "WhatsApp", "retailer-app": "the Retailer app", "back-office": "the Back office" };

/** The sales header field "Sales channel" only offers these four (sales/master.tsx). */
const CHANNEL_OF: Record<Source, string> = { rep: "Field sales", portal: "Online", whatsapp: "Online", "retailer-app": "Online", "back-office": "Counter" };

export const STATUS_META: Record<HubStatus, { label: string; tone: "danger" | "info" | "good" | "off" }> = {
  review: { label: "Needs review", tone: "danger" },
  ready: { label: "Ready", tone: "info" },
  approved: { label: "Approved", tone: "good" },
  rejected: { label: "Rejected", tone: "off" },
};

// ── An order for a served shop (owner decision #26) ─────────────────────────

/**
 * The shop a hub order was taken FOR when it is billed to the distributor that serves that shop. customerId is
 * then the distributor — price, offers, credit, the first-order rule and the bill all follow the distributor —
 * and this is only the reference. undefined for a direct order (and for a stray forCustomerId equal to customerId).
 */
export const forShopId = (o: Pick<HubOrder, "customerId" | "forCustomerId">): string | undefined => (o.forCustomerId && o.forCustomerId !== o.customerId ? o.forCustomerId : undefined);
/** The shop's name, surviving a deleted shop. */
export const forShopName = (o: Pick<HubOrder, "customerId" | "forCustomerId">): string | undefined => {
  const id = forShopId(o);
  return id ? (customerById(id)?.name ?? "a removed shop") : undefined;
};
/** "for Laxmi Store" — the reference wherever the order is listed; "" for a direct order. */
export const forText = (o: Pick<HubOrder, "customerId" | "forCustomerId">) => {
  const n = forShopName(o);
  return n ? `for ${n}` : "";
};
/** The outlet an order reached: the shop it was for, else its customer. Counts outlets, never money. */
export const outletOf = (o: Pick<HubOrder, "customerId" | "forCustomerId">) => forShopId(o) ?? o.customerId;

// ── An order from an accepted estimate (owner decisions #27, #32) ───────────

type FromEstimate = Pick<HubOrder, "customerId" | "estimateId" | "estimateVersion">;
/** "EST-0001 v3" — the estimate and the accepted version an order came from; "" for any other order. */
export const estimateRef = (o: Pick<FromEstimate, "estimateId" | "estimateVersion">) => (o.estimateId ? `${o.estimateId}${o.estimateVersion ? ` v${o.estimateVersion}` : ""}` : "");
/** The sales desk's estimate an order came from — for the same customer, so a number the desk's own seed uses is never mistaken for it. */
const estimateOf = (o: FromEstimate) => (o.estimateId ? estimatesStore.get().find((e) => e.no === o.estimateId && e.customerId === o.customerId) : undefined);
/**
 * The accepted version itself, for what the order's lines do not carry: the note on each line and whether live
 * offers apply on top. Read straight from the desk — estimates.ts imports this file, so this file cannot import it.
 */
export const estimateVersionOf = (o: FromEstimate): EstimateVersion | undefined => {
  const e = estimateOf(o);
  return e ? offerOf(e).versions.find((v) => v.no === o.estimateVersion) : undefined;
};

// ── Why an order needs review ───────────────────────────────────────────────

export type Reason = { key: "credit" | "qty" | "scheme"; short: string; long: string };

/**
 * A line is unusual when it is three times what this customer (or, with no history, its customer type)
 * usually orders of that product. A secondary outlet with no history at all is unusual above 50 units.
 */
export function unusualLines(o: { id: string; customerId: string; lines: { productId: string; qty: number }[] }, hub: HubOrder[]) {
  const c = customerById(o.customerId);
  const others = hub.filter((h) => h.id !== o.id && h.status !== "rejected");
  return o.lines.flatMap((l) => {
    const qtys = (hs: HubOrder[]) => hs.flatMap((h) => h.lines.filter((x) => x.productId === l.productId).map((x) => x.qty));
    const own = qtys(others.filter((h) => h.customerId === o.customerId));
    const base = own.length ? own : qtys(others.filter((h) => customerById(h.customerId)?.typeId === c?.typeId));
    if (base.length) {
      const usual = base.reduce((s, q) => s + q, 0) / base.length;
      return l.qty >= usual * 3 && l.qty - usual >= 10 ? [{ productId: l.productId, qty: l.qty, usual: Math.round(usual) }] : [];
    }
    return typeOf(c).level !== "primary" && l.qty > 50 ? [{ productId: l.productId, qty: l.qty, usual: null as number | null }] : [];
  });
}

/** The credit reason is the engine's own sentence — never re-worded or re-checked here. */
export function reasonsFor(o: { id: string; customerId: string; lines: { productId: string; qty: number }[] }, ev: Evaluation, hub: HubOrder[]): Reason[] {
  const out: Reason[] = [];
  const cr = ev.credit;
  if (!cr.ok && cr.reason) {
    const short = cr.blocking > 0 ? `${compact(cr.blocking)} overdue` : cr.limit === 0 ? "Cash only" : cr.after !== null && cr.after < 0 ? `Over credit by ${compact(-cr.after)}` : "Credit";
    out.push({ key: "credit", short, long: cr.reason });
  }
  const odd = unusualLines(o, hub);
  if (odd.length) out.push({ key: "qty", short: "Unusual quantity", long: `${odd.length === 1 ? "One line is" : `${odd.length} lines are`} far above what this customer usually orders` });
  const clash = ev.skipped.filter((s) => s.reason === "Another exclusive scheme applied" || s.reason === "Budget used up");
  if (clash.length) out.push({ key: "scheme", short: "Offer conflict", long: clash.map((s) => `${s.name}: ${s.reason.toLowerCase()}`).join(" · ") });
  return out;
}

/** A failed check on a hard-stop type blocks the order until someone approves it over credit, with a reason (decision #3). */
export const creditStops = (ev: Evaluation) => !ev.credit.ok && ev.credit.stop === "hard";

/** Which applied schemes touched a line — the engine adds each discount per line but only tags free lines. */
export function schemesOnLine(l: PricedLine, ev: Evaluation, schemes: Scheme[]): string[] {
  if (l.free) return ev.applied.filter((a) => a.schemeId === l.schemeId).map((a) => a.name);
  const pid = l.product.id;
  return ev.applied
    .filter((a) => {
      const m = schemes.find((s) => s.id === a.schemeId)?.mechanic;
      if (!m) return false;
      if (m.kind === "slab") return m.itemIds.includes(pid);
      if (m.kind === "invoice-value" || m.kind === "first-order") return true;
      if (m.kind === "free-goods") return m.buyItemIds.includes(pid);
      if (m.kind === "combo") return m.needs.some((n) => n.itemIds.includes(pid));
      return false;
    })
    .map((a) => a.name);
}

/**
 * THE first-order rule, shared with the dealer portal's cart: the customer has no EARLIER hub order that isn't
 * rejected, not counting this one. "Earlier" keeps the answer stable — an order placed later never takes a
 * first-order offer away from one already priced with it. Leave `id`/`at` out for an order not placed yet.
 */
export function isFirstOrder(o: { customerId: string; id?: string; at?: string }, hub: HubOrder[] = hubStore.get()): boolean {
  const at = o.at ?? `${SF_TODAY} ${SF_NOW}`;
  return !hub.some((h) => h.customerId === o.customerId && h.id !== o.id && h.status !== "rejected" && (h.at < at || (h.at === at && (!o.id || h.id < o.id))));
}

/** How the hub prices an order — the engine, with the customer's first-order flag worked out. */
export const evaluateHub = (o: Pick<HubOrder, "id" | "customerId" | "lines" | "at">, schemes: Scheme[] = schemesStore.get()) => evaluate(o.customerId, o.lines, schemes, { firstOrder: isFirstOrder(o) });

// ── The sales order an order is ─────────────────────────────────────────────

// Sales force numbers its sales orders from SO-5001: the sales desk mockup seeds its own SO-10xx orders (some
// generated at load), and a clash would hide one order behind the other after a reload.
const SF_SO_BASE = 5000;
/** The next free sales order number, across the sales desk and the orders here (an order's id is its sales order's number). */
export function nextSoNo() {
  const nums = [...ordersStore.get().map((o) => o.no), ...hubStore.get().map((h) => h.id)]
    .filter((n) => /^SO-\d+$/.test(n))
    .map((n) => Number(n.slice(3)))
    .filter((n) => n > SF_SO_BASE);
  return `SO-${Math.max(SF_SO_BASE, ...nums) + 1}`;
}

/** The sales desk has a fixed list of payment terms: an agreed number of days takes the nearest one at or below it. */
export const termForDays = (days: number) => [...TERMS].sort((a, b) => b.days - a.days).find((t) => t.days <= days)?.id ?? "T0";
export const locationFor = (city: string | undefined) => (city === "Pokhara" ? "L-PKR" : city === "Butwal" || city === "Bhairahawa" ? "L-BTW" : "L-KTM");
const stamp = () => `${fmtShort(SF_TODAY)}, ${SF_NOW}`;

/** The order as the sales desk holds it — numbered `o.id`, waiting for approval (`pending`) or approved. */
export function buildSalesOrder(o: HubOrder, ev: Evaluation, schemes: Scheme[], opts: { overCredit?: string; notes: Note[]; pending?: boolean }): Order {
  const c = customerById(o.customerId);
  const sc = salesCustomerById(o.customerId);
  // The day the order was placed: it is the same record from then on, whenever it is approved.
  const placedOn = o.at.slice(0, 10);
  // Terms agreed on an estimate replace the customer's usual ones for this order (decision #27).
  const agreed = o.terms ?? null;
  const termId = agreed ? termForDays(agreed.paymentDays) : (sc?.termId ?? "T30");
  const locationId = locationFor(c?.city);
  const ref = estimateRef(o);
  const version = estimateVersionOf(o);
  const noteOf = (productId: string) => version?.lines.find((x) => x.itemId === productId && !x.freeOf)?.note?.trim() ?? "";
  // A charge (freight, loading) rides on the one non-stock charge item, named by its description, so the SO's total
  // equals the order and the bill.
  const charges = ev.lines.filter((l) => isCharge(l.product.id));
  const chargeLines: OrderLine[] = charges.map((l, i) => ({ id: `LN-${o.id}-C${i + 1}`, itemId: CHARGE_ITEM_ID, description: `${l.product.name} — agreed on ${ref || "the estimate"}`, qty: 1, rate: l.net, discountPct: 0, tax: "VAT13", unit: "", custom: {}, delivered: 0, invoiced: 0 }));
  const goodsLines: OrderLine[] = ev.lines
    .filter((l) => !isCharge(l.product.id))
    .map((l, i) => {
      const names = schemesOnLine(l, ev, schemes);
      const description = l.free
        ? l.fixed
          ? `Free goods — agreed on ${ref || "the estimate"}`
          : `Free goods — ${names.join(", ")}`
        : [ref ? `Price agreed on ${ref}` : "", ref ? noteOf(l.product.id) : "", l.discount > 0 && names.length ? `Scheme: ${names.join(", ")}` : ""].filter(Boolean).join(" · ") || undefined;
      return {
        id: `LN-${o.id}-${i + 1}`,
        itemId: l.product.id,
        description,
        qty: l.qty,
        // Free goods — from a scheme or negotiated on an estimate — are zero-priced lines that still move stock (blueprint §2).
        rate: l.free ? 0 : l.price,
        discountPct: 0,
        discountAmt: l.discount > 0 ? l.discount : undefined,
        tax: "VAT13",
        unit: l.product.unit,
        priceLevel: sc?.priceLevel,
        custom: {},
        delivered: 0,
        invoiced: 0,
      };
    });
  const snapshot = ev.applied.length
    ? `Schemes: ${ev.applied.map((a) => `${a.name} — ${a.text} (NPR ${npr(a.benefit)})`).join("; ")}.`
    : version && !version.terms.applyOffers
      ? "Prices are final on the estimate; no scheme applies."
      : "No scheme applied.";
  const fromEstimate = o.estimateId ? `From estimate ${o.estimateId}${o.estimateVersion ? ` version ${o.estimateVersion}` : ""}.` : "";
  const agreedParts = agreed ? [agreed.payment ? `payment: ${agreed.payment}` : "", agreed.delivery ? `delivery: ${agreed.delivery}` : "", agreed.deliverBy ? `deliver by ${agreed.deliverBy}` : ""].filter(Boolean) : [];
  const termsMemo = agreedParts.length ? `Agreed terms — ${agreedParts.join("; ")}.` : "";
  const lines: OrderLine[] = [...goodsLines, ...chargeLines];
  const chargesMemo = charges.length ? `Charges: ${charges.map((l) => `${l.product.name} NPR ${npr(l.net)}`).join(", ")}.` : "";
  const po = /^PO\s+(.+)$/i.exec(o.note.trim());
  const at = stamp();
  // The sales Order has no ship-to field, so an order for a served shop carries the shop at the top of the memo.
  const shopId = forShopId(o);
  const shop = shopId ? customerById(shopId) : undefined;
  const shopRef = shopId ? `${shop?.name ?? "a removed shop"}${shop?.city ? ` (${shop.city})` : ""}` : "";
  return {
    id: o.id,
    no: o.id,
    customerId: o.customerId,
    date: placedOn,
    expected: agreed?.deliverBy ?? null,
    locationId,
    repId: o.repId,
    termId,
    customerPo: po ? po[1] : null,
    currency: "NPR",
    exchangeRate: 1,
    subsidiaryId: locationId === "L-PKR" ? "NP-02" : "NP-01",
    due: addDays(SF_TODAY, agreed?.paymentDays ?? termById(termId)?.days ?? 0),
    billingAddress: sc?.address ?? c?.city ?? "",
    custom: { channel: CHANNEL_OF[o.source] },
    created: { byId: ME.id, on: placedOn },
    audit: [],
    memo: [shopRef ? `Deliver to / on behalf of ${shopRef}.` : "", `From ${FROM[o.source]} · placed by ${o.byName}.`, fromEstimate, termsMemo, chargesMemo, snapshot, po || o.estimateId ? "" : o.note, opts.overCredit ? `Approved over credit: ${opts.overCredit}` : ""].filter(Boolean).join("\n"),
    // The estimate's own record reads "Ordered" from this (sales/flow.tsx `ordersFrom`).
    source: o.estimateId ? { kind: "Estimate", no: o.estimateId } : null,
    approval: opts.pending ? { state: "pending", stateName: "Sales force review", approverId: ME.id, since: placedOn } : { state: "approved", byId: ME.id, on: SF_TODAY },
    closed: false,
    cancelled: null,
    lines,
    docs: [],
    dims: {},
    attachments: [],
    comments: opts.notes.map((n, i) => ({ id: `c-${o.id}-${i}`, authorId: ME.id, when: at, body: `${n.who}: ${n.body}` })),
    history: [
      { id: `h-${o.id}-1`, whoId: ME.id, when: at, what: `received the order from ${FROM[o.source]}, placed by ${o.byName}` },
      ...(ref ? [{ id: `h-${o.id}-e`, whoId: ME.id, when: at, what: `took its prices, free goods and terms from estimate ${ref}` }] : []),
      ...(shopRef ? [{ id: `h-${o.id}-f`, whoId: ME.id, when: at, what: `ordered for ${shopRef}, billed to ${c?.name ?? "the distributor"}` }] : []),
      ...(opts.pending ? [] : [{ id: `h-${o.id}-2`, whoId: ME.id, when: at, what: opts.overCredit ? `approved it over credit — “${opts.overCredit}”` : "approved it" }]),
    ],
    advance: 0,
  };
}

/** An order's notes go onto its sales order with it (records.tsx files them under the order's number). */
const notesOf = (o: HubOrder) => notesStore.get()[o.id] ?? [];

/** The order's sales order on the sales desk: the same number, for the same customer. */
const deskOrderOf = (o: Pick<HubOrder, "id" | "customerId">) => ordersStore.get().find((x) => x.no === o.id && x.customerId === o.customerId);
const pendingSo = (o: HubOrder) => {
  const so = deskOrderOf(o);
  return so?.approval.state === "pending" ? so : undefined;
};
/** A sales order of that number is on the desk for that customer — so a link to it lands on the same record. */
export const soOnDesk = (no: string, customerId: string) => !!deskOrderOf({ id: no, customerId });

/** True while this module itself writes a sales order — the desk watcher at the foot of this file has nothing to follow then. */
let writing = false;
function putOwn(so: Order) {
  writing = true;
  try {
    putSalesOrder(so);
  } finally {
    writing = false;
  }
}

/**
 * (Re)write a waiting order's sales order: pending, which commits no stock (owner decision #5), in the "Sales force
 * review" state — so the sales desk lists it under "Needs your approval" until one of the two desks decides it.
 */
function openPendingSalesOrder(o: HubOrder) {
  const schemes = schemesStore.get();
  putOwn(buildSalesOrder(o, evaluateHub(o, schemes), schemes, { notes: notesOf(o), pending: true }));
}

/**
 * Place an order from any channel. It takes the next sales order number, and its sales order — pending — is on the
 * sales desk before the order shows anywhere here: there is never an order without its sales order. `status` is the
 * caller's: "review" when the credit check failed, otherwise "ready".
 */
export function placeHubOrder(draft: Omit<HubOrder, "id">): HubOrder {
  const order: HubOrder = { ...draft, id: nextSoNo() };
  openPendingSalesOrder(order);
  hubStore.set((hs) => [order, ...hs]);
  return order;
}

// ── Approve, reject, change ─────────────────────────────────────────────────

/**
 * The invoice approval writes: debit = the order's total, due = today + the days to pay — the ones agreed on the
 * estimate when the order came from one, otherwise the customer type's credit days. Its document number is the
 * order's (the prototype has no invoice of its own; see the header).
 */
function billOrder(o: HubOrder, total: number, by: string) {
  if (ledgerStore.get().some((r) => r.kind === "Invoice" && r.doc === o.id)) return;
  const days = o.terms?.paymentDays ?? typeOf(customerById(o.customerId)).creditDays;
  const shop = forShopName(o);
  const row: LedgerEntry = { id: `L-${o.id}`, customerId: o.customerId, date: SF_TODAY, doc: o.id, kind: "Invoice", debit: total, credit: 0, due: addDays(SF_TODAY, days), ...(shop ? { note: `For ${shop}` } : {}) };
  ledgerStore.set((l) => [...l, row]);
  logEvent(o.customerId, `billed ${o.id} for NPR ${npr(total)}${shop ? ` for ${shop}` : ""}, due in ${days} ${days === 1 ? "day" : "days"}`, by);
  const shopId = forShopId(o);
  if (shopId) logEvent(shopId, `${o.id} for this shop billed to ${customerById(o.customerId)?.name ?? "its distributor"}`, by);
}

/**
 * What an approval does on this side, on whichever desk it was given: bill the order, count what it used against
 * the budget of each scheme it got, mark it approved and say so in its history (`said`). The sales order itself is
 * the caller's business.
 */
function becameApproved(o: HubOrder, ev: Evaluation, total: number, said: string, by: string) {
  billOrder(o, total, by);
  // Budgets with auto-stop: what this order used counts against each scheme it got.
  schemesStore.set((ss) =>
    ss.map((s) => {
      const a = ev.applied.find((x) => x.schemeId === s.id);
      if (!a || !s.budget) return s;
      const used = s.budget.kind === "value" ? a.benefit : ev.lines.filter((l) => l.free && l.schemeId === s.id).reduce((n, l) => n + l.qty, 0);
      return { ...s, budget: { ...s.budget, used: s.budget.used + used } };
    }),
  );
  hubStore.set((hs) => hs.map((h) => (h.id === o.id ? { ...h, status: "approved" } : h)));
  logEvent(o.id, said, by);
}

function becameRejected(o: HubOrder, reason: string, said: string) {
  hubStore.set((hs) => hs.map((h) => (h.id === o.id ? { ...h, status: "rejected", rejectReason: reason } : h)));
  logEvent(o.id, said);
}

/**
 * Approve one order: its sales order is written again as approved — at the prices and offers of this moment — and
 * the order is billed, counted against the scheme budgets, marked and logged. `overCredit` is the reason a
 * hard-stopped order was pushed through (decision #3); `by` names who approved it in the history — the portal
 * passes "Auto-approved (within credit)" (decision #4).
 */
export function approveHubOrder(o: HubOrder, overCredit?: string, by: string = STAFF_NAME) {
  const schemes = schemesStore.get();
  const current = hubStore.get().find((h) => h.id === o.id) ?? o;
  const ev = evaluateHub(current, schemes);
  const so = buildSalesOrder(current, ev, schemes, { overCredit, notes: notesOf(current) });
  // Billed at the sales order's own total (its VAT is not rounded to the rupee), so a payment tagged for the order
  // closes on its invoice exactly — the same figure the desk bills when it approves.
  const total = salesOrderTotal(so);
  // The order first, its sales order after: by the time the desk changes, this side already agrees with it.
  becameApproved(current, ev, total, overCredit ? `approved it over credit — “${overCredit}”` : `approved it and billed NPR ${npr(total)}`, by);
  putOwn(so);
}

export function rejectHubOrder(o: HubOrder, reason: string) {
  const so = pendingSo(o);
  becameRejected(o, reason, `rejected it — “${reason}”`);
  if (so) putOwn({ ...so, approval: { state: "rejected", byId: ME.id, on: SF_TODAY, reason } });
}

export function saveQuantities(o: HubOrder, next: { productId: string; qty: number }[], names: (id: string) => string) {
  const changes = next
    .map((l) => ({ l, was: o.lines.find((x) => x.productId === l.productId)?.qty ?? 0 }))
    .filter((x) => x.was !== x.l.qty)
    .map((x) => `${names(x.l.productId)} ${x.was} → ${x.l.qty}`);
  hubStore.set((hs) => hs.map((h) => (h.id === o.id ? { ...h, lines: next.filter((l) => l.qty > 0).map((l) => ({ ...l })) } : h)));
  const updated = hubStore.get().find((h) => h.id === o.id);
  if (updated && pendingSo(updated)) openPendingSalesOrder(updated);
  if (changes.length) logEvent(o.id, `changed quantities: ${changes.join(", ")}`);
}

// ── An order the office makes itself ────────────────────────────────────────

/**
 * The office does not key an order into Sales force: it uses Bizak's own sales order form (the sales desk), opened
 * with the customer already chosen — which brings its payment terms and price level — and the customer's rep named
 * as the sales rep (the form would otherwise name whoever is typing).
 */
export function newSalesOrderPath(customerId?: string | null): string {
  const repId = customerById(customerId ?? "")?.repId;
  const q = new URLSearchParams(customerId ? { cust: customerId, ...(repId ? { rep: repId } : {}), day: SF_TODAY } : {});
  const tail = q.toString();
  return `/design/sales/orders/new${tail ? `?${tail}` : ""}`;
}

// ── One record, two desks ───────────────────────────────────────────────────

/**
 * Every order here has its sales order on the desk. One that has none — the sample set's, or an order saved before
 * decision #31 that had not got that far — gets it now, in the state the order is in. Nothing is billed, logged or
 * counted against a budget: all of that happened when the order did; this only puts the one record on the desk.
 * (It is priced with the schemes of today — the prototype knows no better of an old order.)
 */
(function ensureSalesOrders() {
  const schemes = schemesStore.get();
  for (const o of hubStore.get()) {
    // A number someone else's sales order holds is never taken over; a removed customer has no place on the desk.
    if (ordersStore.get().some((x) => x.no === o.id) || !customerById(o.customerId)) continue;
    const so = buildSalesOrder(o, evaluateHub(o, schemes), schemes, { notes: notesOf(o), pending: o.status !== "approved" });
    putOwn(o.status === "rejected" ? { ...so, approval: { state: "rejected", byId: ME.id, on: SF_TODAY, reason: o.rejectReason ?? "" } } : so);
  }
})();

/**
 * The sales orders that were already approved when the page loaded — the desk's own seed, and ours from earlier
 * sessions. One still waiting for approval then is taken in when it is approved.
 */
const DESK_AT_LOAD = new Set(ordersStore.get().filter((o) => o.approval.state === "approved").map((o) => o.no));

/**
 * A waiting order shows on the sales desk under "Needs your approval", and can be decided there. What the desk
 * decided is taken in here: approved → billed and counted against the scheme budgets exactly as an approval given
 * here, the desk's sales order left as it stands; sent back → rejected with the desk's reason; cancelled while it
 * waited → rejected. (An order cancelled on the desk AFTER it was approved stays approved and billed here.)
 */
function followDeskDecisions() {
  const desk = ordersStore.get();
  for (const o of hubStore.get()) {
    if (o.status !== "review" && o.status !== "ready") continue;
    const so = desk.find((x) => x.no === o.id && x.customerId === o.customerId);
    if (!so) continue;
    if (so.cancelled) becameRejected(o, "Cancelled on the sales desk", `cancelled it on the sales desk — “${so.cancelled.reason}”`);
    else if (so.approval.state === "approved") {
      const total = salesOrderTotal(so);
      becameApproved(o, evaluateHub(o), total, `approved it on the sales desk and billed NPR ${npr(total)}`, STAFF_NAME);
    } else if (so.approval.state === "rejected") becameRejected(o, so.approval.reason, `rejected it on the sales desk — “${so.approval.reason}”`);
  }
}

/**
 * A sales order made on the sales desk's own form for one of our customers is that customer's order here too. Once
 * it is approved there, it joins the Orders list as a back-office order — the same number, already approved, at the
 * prices on the sales order (nothing is re-priced) — and is billed to the customer's account, so the credit figures
 * stay true.
 */
function adoptDeskOrders() {
  const known = new Set(hubStore.get().map((h) => h.id));
  for (const so of ordersStore.get()) {
    if (so.direct || so.cancelled || so.approval.state !== "approved") continue;
    // Ours already (an order here has that number), or the desk's own seed.
    if (known.has(so.no) || DESK_AT_LOAD.has(so.no)) continue;
    const c = customerById(so.customerId);
    if (!c) continue;
    const lines = so.lines
      .filter((l) => l.qty > 0)
      .map((l) => ({ productId: l.itemId, qty: l.qty, price: Math.max(0, (l.qty * l.rate * (1 - l.discountPct / 100) - (l.discountAmt ?? 0)) / l.qty), fixed: true }));
    const order: HubOrder = { id: so.no, customerId: c.id, source: "back-office", byName: STAFF_NAME, repId: c.repId ?? null, at: `${SF_TODAY} ${SF_NOW}`, lines, note: so.memo ?? "", status: "approved" };
    known.add(so.no);
    hubStore.set((hs) => [order, ...hs]);
    const total = salesOrderTotal(so);
    logEvent(order.id, `made on the sales desk and billed NPR ${npr(total)}`);
    billOrder(order, total, STAFF_NAME);
    // Keep it across reloads, like the sales orders this module writes itself.
    putOwn(so);
  }
}

// One pass per change on the desk: an order already here follows what was decided there, and an approved sales order
// of one of our customers that is not here yet is taken in. A sales order this module is writing, or one another
// tab saved, is not a decision taken on this desk — that tab does its own bookkeeping.
ordersStore.subscribe(() => {
  if (writing || deskFollowsOtherTab()) return;
  followDeskDecisions();
  adoptDeskOrders();
});
