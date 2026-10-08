import * as React from "react";
import { createStore, ordersStore, useStore } from "../sales/store";
import type { ToastMsg } from "../sales/bzw";
import { latestVersion, offerExpired, offerOf } from "../sales/estimate-offer";
import { estimatesStore } from "../sales/flow";
import type { Estimate } from "../sales/flow";
import { progressOf } from "../sales/orders";
import type { ChildDoc, Order } from "../sales/orders";
import { SF_NOW, SF_TODAY } from "../salesforce/data";
import type { Customer, CustomerType, HubOrder, HubStatus, LedgerEntry, LogRow, Opportunity, PayMethod, PortalSettings, Rep, Scheme } from "../salesforce/data";
import { accountOf, creditCheck, day, eligible, evaluate, isCharge, npr, productById, typeOf } from "../salesforce/engine";
import type { CartLine, Evaluation } from "../salesforce/engine";
import { persistentStore } from "../salesforce/persist";
import { LEGACY_ORDER_IDS, cartsStore, customersStore, historyStore, hubStore, ledgerStore, opportunitiesStore, portalSessionStore, portalSettingsStore, repsStore, schemesStore, typesStore } from "../salesforce/store";
import { logEvent } from "../salesforce/records";
import { takeReceipt } from "../salesforce/receipts";
import type { Line } from "../salesforce/receipts";
import { approveHubOrder, placeHubOrder } from "../salesforce/orders-parts";
import { estimateOpen, estimatesOf, sentTo } from "../salesforce/estimates";

// ════════════════════════════════════════════════════════════════════════════
// DEALER PORTAL · STATE
//
// The portal owns almost nothing: orders, price requests, claims and payments all
// go to the SHARED stores (salesforce/store), so the company sees them the moment
// they are sent. What is kept here is the dealer's own side — the cart draft, the
// price snapshot each order got, its event RSVPs, its stock notebook — each a
// persistentStore under "portal.*", keyed by the dealer where it is per dealer.
// ════════════════════════════════════════════════════════════════════════════

export const dpPath = (p = "") => `/design/dealer${p ? `/${p}` : ""}`;
export const CUSTOMERS_SETUP_PATH = "/design/salesforce/customers";

export const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
export const daysBetween = (from: string, to: string) => Math.round((Date.parse(to.slice(0, 10)) - Date.parse(from.slice(0, 10))) / 86_400_000);
export const stamp = () => `${SF_TODAY} ${SF_NOW}`;
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ── Brand ───────────────────────────────────────────────────────────────────

/** "Bizak Nepal · Dealer portal" → "Bizak Nepal". A brand that is only "Dealer portal" names no company. */
export function companyOf(brand: string) {
  const first = brand.split("·")[0].trim();
  return !first || first.toLowerCase() === "dealer portal" ? "the company" : first;
}
/** The top bar's two lines: the tenant's name, then what this is. */
export function brandParts(brand: string) {
  const [name, ...rest] = brand.split("·").map((x) => x.trim());
  const plain = !name || name.toLowerCase() === "dealer portal";
  return { name: plain ? "Dealer portal" : name, sub: rest.join(" · ") || (plain ? "" : "Dealer portal") };
}
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "DP";

// ── Who is signed in ────────────────────────────────────────────────────────

export type PortalUser = Customer["portalUsers"][number];
export type DealerSession = {
  c: Customer;
  type: CustomerType;
  user: PortalUser;
  userName: string;
  first: string;
  settings: PortalSettings;
  /** The tenant's name for copy: "Bizak Nepal will deliver". */
  company: string;
};

/** A customer can use the portal when its type opens the dealer portal and someone has been invited. */
export const qualifies = (c: Customer, types: CustomerType[]) => types.find((t) => t.id === c.typeId)?.portal === "dealer" && c.portalUsers.length > 0;

/** The signed-in dealer, or null when nobody is signed in or the customer, its type or the user is gone. */
export function useSessionOrNull(): DealerSession | null {
  const s = useStore(portalSessionStore);
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const settings = useStore(portalSettingsStore);
  return React.useMemo(() => {
    const c = customers.find((x) => x.id === s.customerId);
    if (!c || !qualifies(c, types)) return null;
    const user = c.portalUsers.find((u) => u.name === s.userName);
    if (!user) return null;
    return { c, type: typeOf(c), user, userName: user.name, first: user.name.split(" ")[0], settings, company: companyOf(settings.brand) };
  }, [s, customers, types, settings]);
}

export const DealerContext = React.createContext<DealerSession | null>(null);

/** Only pages rendered inside DealerShell call this — the shell shows the sign-in screen when there is no session. */
export function useDealer(): DealerSession {
  const s = React.useContext(DealerContext);
  if (!s) throw new Error("useDealer() outside DealerShell");
  return s;
}

export function signIn(customerId: string, userName: string) {
  customersStore.set((cs) => cs.map((c) => (c.id === customerId ? { ...c, portalUsers: c.portalUsers.map((u) => (u.name === userName ? { ...u, lastSeen: SF_TODAY } : u)) } : c)));
  portalSessionStore.set(() => ({ customerId, userName }));
}
export const signOut = () => portalSessionStore.set(() => ({ customerId: null, userName: null }));

// ── Toast (the shell shows it, so it survives a navigation) ─────────────────

export const toastStore = createStore<ToastMsg | null>(null);
export const notify = (text: string, kind: ToastMsg["kind"] = "success") => toastStore.set(() => ({ id: Date.now(), kind, text }));

// ── Cart and order draft, per dealer ────────────────────────────────────────

const NO_LINES: CartLine[] = [];
export function useCart(customerId: string): CartLine[] {
  return useStore(cartsStore)[customerId] ?? NO_LINES;
}
const writeCart = (customerId: string, fn: (lines: CartLine[]) => CartLine[]) => cartsStore.set((cs) => ({ ...cs, [customerId]: fn(cs[customerId] ?? []) }));

export function setQty(customerId: string, productId: string, qty: number) {
  writeCart(customerId, (c) => {
    const q = Math.max(0, Math.round(qty));
    if (q === 0) return c.filter((l) => l.productId !== productId);
    return c.some((l) => l.productId === productId) ? c.map((l) => (l.productId === productId ? { ...l, qty: q } : l)) : [...c, { productId, qty: q }];
  });
}
export function addToCart(customerId: string, lines: { productId: string; qty: number }[]) {
  writeCart(customerId, (c) => {
    const next = c.map((l) => ({ ...l }));
    for (const l of lines.filter((x) => x.qty > 0)) {
      const hit = next.find((x) => x.productId === l.productId);
      if (hit) hit.qty += l.qty;
      else next.push({ productId: l.productId, qty: l.qty });
    }
    return next;
  });
}

// A cart line never carries a price of its own: an agreed price reaches an order only through an accepted estimate
// (decision #27). Carts saved while "accept a quotation" still filled the cart go back to the dealer's usual price.
(function dropCartPrices() {
  if (!Object.values(cartsStore.get()).some((ls) => ls.some((l) => l.price != null))) return;
  cartsStore.set((cs) => Object.fromEntries(Object.entries(cs).map(([id, ls]) => [id, ls.map((l) => ({ productId: l.productId, qty: l.qty }))])));
})();

/** The products an order is for — not its charges, nor the free goods agreed on its estimate (a fixed line at 0). */
export const boughtLines = (lines: CartLine[]) => lines.filter((l) => l.qty > 0 && !isCharge(l.productId) && !(l.fixed && l.price === 0)).map((l) => ({ productId: l.productId, qty: l.qty }));

export type Draft = { deliverBy: string; note: string };
const draftsStore = persistentStore<Record<string, Draft>>("portal.drafts", {});
const freshDraft = (): Draft => ({ deliverBy: addDays(SF_TODAY, 3), note: "" });
export function useDraft(customerId: string): Draft {
  const d = useStore(draftsStore)[customerId];
  if (!d) return freshDraft();
  // A draft saved days ago may ask for a date that has passed.
  return d.deliverBy > SF_TODAY ? d : { ...d, deliverBy: addDays(SF_TODAY, 3) };
}
export const setDraft = (customerId: string, patch: Partial<Draft>) => draftsStore.set((ds) => ({ ...ds, [customerId]: { ...(ds[customerId] ?? freshDraft()), ...patch } }));

// ── Orders: the hub orders of this dealer, and where each one is ────────────

/** What the portal keeps about an order it sent: the date asked for and the price snapshot it got. */
type OrderMeta = { deliverBy: string | null; snapshot: Evaluation };
const orderMetaStore = persistentStore<Record<string, OrderMeta>>("portal.orders", {});
// An order saved before decision #31 was kept under a number of its own; it took its sales order's on load (store.ts).
if (Object.keys(orderMetaStore.get()).some((id) => LEGACY_ORDER_IDS[id])) orderMetaStore.set((m) => Object.fromEntries(Object.entries(m).map(([id, meta]) => [LEGACY_ORDER_IDS[id] ?? id, meta])));

const samePaidLines = (ev: Evaluation, lines: CartLine[]) => {
  const paid = ev.lines.filter((l) => !l.free);
  return paid.length === lines.filter((l) => l.qty > 0).length && paid.every((l) => lines.some((x) => x.productId === l.product.id && x.qty === l.qty));
};
const heldSnapshots = new Map<string, Evaluation>();
/**
 * A document keeps the prices and schemes it got (blueprint §2 "snapshot, never recompute"). An order sent from
 * the portal carries its snapshot; any other order — or one whose quantities the company changed — is priced
 * once at its own date and held.
 */
export function snapshotOf(o: HubOrder): Evaluation {
  const kept = orderMetaStore.get()[o.id]?.snapshot;
  if (kept && samePaidLines(kept, o.lines)) return kept;
  const key = `${o.id}|${JSON.stringify(o.lines)}`;
  const held = heldSnapshots.get(key);
  if (held) return held;
  const ev = evaluate(o.customerId, o.lines, schemesStore.get(), { date: o.at.slice(0, 10) });
  heldSnapshots.set(key, ev);
  return ev;
}

export type Tone = "good" | "warn" | "danger" | "neutral" | "info" | "off";
export type Step = { label: string; at: string | null };
export type DealerOrder = {
  hub: HubOrder;
  id: string;
  at: string;
  byName: string;
  lines: CartLine[];
  note: string;
  status: HubStatus;
  /** The order as the sales desk holds it — the same record, under the same number — once approved. */
  so: Order | null;
  label: string;
  tone: Tone;
  /** One line on where it is. */
  line: string;
  steps: Step[];
  /** Index of the step reached (−1 when not accepted). */
  reached: number;
  waiting: boolean;
  declined: boolean;
  delivered: boolean;
  open: boolean;
  deliveries: ChildDoc[];
  invoices: ChildDoc[];
  deliverBy: string | null;
  /**
   * The shop our rep took this order at, when it is billed to this dealer to supply (owner decision #26). It is
   * still the dealer's own purchase; the name falls back when the shop was deleted.
   */
  forShop: { id: string; name: string } | null;
  /** Who placed it: the rep's current name, else the name stamped on the order. */
  repName: string;
};

/** "For Laxmi Store · ordered by your rep Pooja Gurung" — null for the dealer's own orders. */
export const forShopMark = (o: DealerOrder) => (o.forShop ? `For ${o.forShop.name} · ordered by your rep ${o.repName}` : null);

function toDealerOrder(o: HubOrder, meta: OrderMeta | undefined, sales: Order[], history: Record<string, LogRow[]>, company: string, customers: Customer[], reps: Rep[]): DealerOrder {
  const found = sales.find((x) => x.no === o.id && x.customerId === o.customerId);
  const so = o.status === "approved" && found && found.approval.state !== "pending" && found.approval.state !== "rejected" ? found : null;
  const live = (d: ChildDoc) => d.state === "approved" && !d.cancelled;
  const deliveries = so ? so.docs.filter((d) => d.kind === "delivery" && live(d)) : [];
  const invoices = so ? so.docs.filter((d) => d.kind === "invoice" && live(d)) : [];
  const p = so ? progressOf(so) : null;
  const delivered = !!p && p.deliveredPct >= 100;
  const partly = !!p && p.deliveredPct > 0 && !delivered;
  const approvedAt = [...(history[o.id] ?? [])].reverse().find((h) => /^approved/.test(h.what))?.when ?? (so && so.approval.state === "approved" ? so.approval.on : null);
  const lastDelivery = deliveries.map((d) => d.date).sort().pop() ?? null;
  const declined = o.status === "rejected";
  const stopped = !!so && (!!so.cancelled || so.closed);

  let label: string;
  let tone: Tone;
  let line: string;
  if (declined) [label, tone, line] = ["Not accepted", "danger", o.rejectReason ? `Not accepted — ${o.rejectReason}` : "Not accepted"];
  else if (o.status === "review") [label, tone, line] = ["Waiting for approval", "warn", `Waiting for ${company} to approve it`];
  else if (o.status === "ready") [label, tone, line] = ["Placed", "neutral", `Placed · ${company} is checking it`];
  else if (so?.cancelled) [label, tone, line] = ["Cancelled", "off", `Cancelled — ${so.cancelled.reason}`];
  else if (delivered) [label, tone, line] = ["Delivered", "good", `Delivered${lastDelivery ? ` ${lastDelivery.slice(0, 10) === SF_TODAY ? "today" : `on ${day(lastDelivery)}`}` : ""}${invoices.length ? " · billed" : ""}`];
  else if (so?.closed) [label, tone, line] = ["Closed", "off", "Closed by the company"];
  else if (partly) [label, tone, line] = ["Part delivered", "info", `${p!.deliveredPct}% delivered · the rest is coming`];
  else [label, tone, line] = ["Approved", "info", `Approved — ${company} will deliver`];

  const steps: Step[] = [
    { label: "Placed", at: o.at },
    { label: "Approved", at: o.status === "approved" ? approvedAt : null },
    { label: partly ? "Part delivered" : "Delivered", at: delivered || partly ? lastDelivery : null },
  ];
  const reached = declined ? -1 : o.status !== "approved" ? 0 : delivered || partly ? 2 : 1;
  return {
    hub: o,
    id: o.id,
    at: o.at,
    byName: o.byName,
    lines: o.lines,
    note: o.note,
    status: o.status,
    so,
    label,
    tone,
    line,
    steps,
    reached,
    waiting: o.status === "review",
    declined,
    delivered,
    open: !declined && !delivered && !stopped,
    deliveries,
    invoices,
    deliverBy: meta?.deliverBy ?? o.terms?.deliverBy ?? null,
    forShop: o.forCustomerId ? { id: o.forCustomerId, name: customers.find((c) => c.id === o.forCustomerId)?.name ?? "a shop you serve" } : null,
    repName: reps.find((r) => r.id === o.repId)?.name ?? o.byName,
  };
}

export function useDealerOrders(customerId: string, company: string): DealerOrder[] {
  const hub = useStore(hubStore);
  const meta = useStore(orderMetaStore);
  const sales = useStore(ordersStore);
  const history = useStore(historyStore);
  const customers = useStore(customersStore);
  const reps = useStore(repsStore);
  return React.useMemo(
    () =>
      hub
        .filter((o) => o.customerId === customerId)
        .map((o) => toDealerOrder(o, meta[o.id], sales, history, company, customers, reps))
        .sort((a, b) => b.at.localeCompare(a.at)),
    [hub, meta, sales, history, customerId, company, customers, reps],
  );
}

/** The products this dealer buys most often, at the quantity it bought last. */
export function usualItems(orders: DealerOrder[]) {
  const seen = new Map<string, { productId: string; times: number; lastQty: number }>();
  for (const o of orders.filter((x) => !x.declined)) {
    for (const l of boughtLines(o.lines)) {
      const s = seen.get(l.productId);
      if (s) s.times++;
      else seen.set(l.productId, { productId: l.productId, times: 1, lastQty: l.qty });
    }
  }
  return [...seen.values()].filter((s) => s.times >= 2).sort((a, b) => b.times - a.times);
}

/** First order = nothing earlier that was not turned down (the first-order scheme). */
export const isFirstOrder = (customerId: string, hub: HubOrder[] = hubStore.get()) => !hub.some((o) => o.customerId === customerId && o.status !== "rejected");

/**
 * Send the cart: the order (source "portal") is a sales order from the moment it is sent — pending, under the number
 * the dealer sees (owner decisions #5 and #31). Within credit and at most the Setup amount (decision #4) it is
 * approved on arrival by the same call Orders makes, which bills it; otherwise it waits — "review" when the credit
 * check fails, "ready" when it passes.
 */
export function submitOrder(s: DealerSession, ev: Evaluation, lines: CartLine[], draft: Draft): HubOrder {
  const autoApprove = ev.credit.ok && ev.total <= s.settings.autoApproveUpTo;
  const note = [draft.note.trim(), draft.deliverBy ? `Deliver by ${draft.deliverBy}.` : ""].filter(Boolean).join(" ");
  const order = placeHubOrder({
    customerId: s.c.id,
    source: "portal",
    byName: s.userName,
    repId: s.c.repId,
    at: stamp(),
    lines: lines.filter((l) => l.qty > 0).map((l) => ({ productId: l.productId, qty: l.qty })),
    note,
    status: ev.credit.ok ? "ready" : "review",
  });
  const id = order.id;
  orderMetaStore.set((m) => ({ ...m, [id]: { deliverBy: draft.deliverBy || null, snapshot: ev } }));
  logEvent(id, ev.credit.ok ? "placed it in the dealer portal" : `placed it in the dealer portal — ${ev.credit.reason ?? "the credit check failed"}`, s.userName);
  if (autoApprove) approveHubOrder(order, undefined, "Auto-approved (within credit)");
  cartsStore.set((cs) => ({ ...cs, [s.c.id]: [] }));
  draftsStore.set((ds) => ({ ...ds, [s.c.id]: freshDraft() }));
  return hubStore.get().find((o) => o.id === id) ?? order;
}

// ── Account: the statement and the payments a dealer sends ──────────────────

export const METHOD_LABEL: Record<PayMethod, string> = { bank: "Bank transfer", cheque: "Cheque", cash: "Cash", wallet: "eSewa / Khalti" };

export type StatementRow = LedgerEntry & { balance: number };
/** This customer's ledger, oldest first, with a running balance. Pending rows count for nothing until confirmed. */
export function statementOf(customerId: string, ledger: LedgerEntry[]): StatementRow[] {
  let bal = 0;
  return ledger
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.customerId === customerId)
    .sort((a, b) => a.r.date.localeCompare(b.r.date) || a.i - b.i)
    .map(({ r }) => {
      if (!r.pending) bal += r.debit - r.credit;
      return { ...r, balance: bal };
    });
}

export function useAccount(c: Customer) {
  const ledger = useStore(ledgerStore);
  const types = useStore(typesStore);
  return React.useMemo(() => {
    const a = accountOf(c.id, ledger);
    const credit = creditCheck(c, 0);
    const notDue = a.invoices.filter((i) => i.late <= 0);
    return {
      ...a,
      credit,
      statement: statementOf(c.id, ledger),
      pendingRows: ledger.filter((r) => r.customerId === c.id && r.pending),
      nextDue: [...notDue].sort((x, y) => (x.due ?? x.date).localeCompare(y.due ?? y.date))[0] ?? null,
      ageing: [
        { label: "Not due yet", amount: notDue.reduce((s, i) => s + i.open, 0) },
        { label: "1–30 days late", amount: a.invoices.filter((i) => i.late > 0 && i.late <= 30).reduce((s, i) => s + i.open, 0) },
        { label: "31–60 days late", amount: a.invoices.filter((i) => i.late > 30 && i.late <= 60).reduce((s, i) => s + i.open, 0) },
        { label: "Over 60 days", amount: a.invoices.filter((i) => i.late > 60).reduce((s, i) => s + i.open, 0) },
      ],
    };
    // The engine reads the type from the store; `types` is here so a grace-day change recounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c, ledger, types]);
}

/**
 * A payment the dealer sent IS a customer receipt on the sales desk (RCP-…, owner decision #31), waiting for accounts
 * to approve it; its pending row on the dealer's account follows from the receipt (salesforce/receipts.ts). The
 * receipt says which sales orders the money is for (decision #33) — a reference: nothing is applied, the company does
 * that. An early-payment discount is not written here: it is the order's, given on its first invoice when the company
 * applies the money (decision #34). Returns the receipt.
 */
export function recordPayment(s: DealerSession, p: { amount: number; method: PayMethod; reference: string; /** The sales orders it is for, each with its amount. */ tags: Line[]; /** Old bills with no order it was sent for, in words. */ note?: string }) {
  const rcp = takeReceipt({ customerId: s.c.id, amount: p.amount, method: p.method, reference: p.reference, via: "portal", by: s.userName, pending: true, tags: p.tags, note: p.note });
  logEvent(rcp.no, `sent NPR ${npr(p.amount)} by ${METHOD_LABEL[p.method].toLowerCase()}${p.reference ? ` (${p.reference})` : ""}`, s.userName);
  return rcp;
}

/**
 * The shop an invoice was billed to this dealer for (owner decision #26), or null for its own orders. The ledger
 * row's note is read first ("For Laxmi Store"); failing that, the order it bills — the invoice's doc is the order's
 * number.
 */
export function shopOfInvoice(row: Pick<LedgerEntry, "kind" | "doc" | "note" | "customerId">, hub: HubOrder[], customers: Customer[]): string | null {
  if (row.kind !== "Invoice") return null;
  const said = row.note ? /\bfor\s+([^·;()]+?)\s*\.?\s*(?:[·;()]|$)/i.exec(row.note)?.[1]?.trim() : undefined;
  if (said) return said;
  const o = hub.find((h) => h.customerId === row.customerId && h.id === row.doc);
  if (!o?.forCustomerId) return null;
  return customers.find((c) => c.id === o.forCustomerId)?.name ?? "a shop you serve";
}

/** What the dealer was billed between two dates — a target rebate's progress. */
export const billedBetween = (ledger: LedgerEntry[], customerId: string, from: string, to: string) =>
  ledger.filter((r) => r.customerId === customerId && r.kind === "Invoice" && !r.pending && r.date >= from && r.date <= to).reduce((s, r) => s + r.debit, 0);

// ── Schemes in plain words ──────────────────────────────────────────────────

function itemsPhrase(ids: string[]) {
  const ps = ids.map(productById);
  if (!ps.length) return "the listed items";
  if (ps.length >= 3 && ps.every((p) => p.brand && p.brand === ps[0].brand)) return `any ${ps[0].brand} ${ps[0].category.toLowerCase()}`;
  return ps.map((p) => p.name).join(" or ");
}
const unitOf = (id: string | undefined) => (id ? productById(id).unit : "") || "unit";

export function schemeSentence(s: Scheme): string {
  const m = s.mechanic;
  switch (m.kind) {
    case "free-goods": {
      const get = m.getItemId === "same" ? "free" : `${productById(m.getItemId).name} free`;
      return `Buy ${m.buyQty} ${unitOf(m.buyItemIds[0])}s of ${itemsPhrase(m.buyItemIds)}, get ${m.getQty} ${get}.`;
    }
    case "slab": {
      const unit = unitOf(m.itemIds[0]);
      return `Buy ${itemsPhrase(m.itemIds)} — all count together. ${m.slabs.map((x) => `${x.minQty}+ ${unit}s: ${x.pct}% off`).join(", ")}.`;
    }
    case "combo": {
      const g = productById(m.getItemId);
      return `Buy ${m.needs.map((n) => `${n.qty} ${unitOf(n.itemIds[0])}s of ${itemsPhrase(n.itemIds)}`).join(" and ")}, get ${m.getQty} ${g.unit || "unit"} of ${g.name} free.`;
    }
    case "invoice-value":
      return `${m.pct}% off any order over NPR ${npr(m.minValue)}.`;
    case "first-order":
      return `${m.pct}% off your first order.`;
    case "target-rebate":
      return `Buy NPR ${npr(m.target)} worth in ${m.period} and get ${m.pct}% of it back.`;
    case "display":
      return `NPR ${npr(m.amount)} a ${m.per} for keeping our display up in your shop.`;
    case "early-payment":
      return `Pay an invoice in full within ${m.withinDays} days of its date and get ${m.pct}% off it.`;
  }
}

/** The short tag on a catalogue row. */
export function schemeTag(s: Scheme): string | null {
  const m = s.mechanic;
  if (m.kind === "free-goods") return `Buy ${m.buyQty} get ${m.getQty} free`;
  if (m.kind === "slab" && m.slabs.length) return m.slabs.length > 1 ? `${m.slabs[0].pct}–${m.slabs[m.slabs.length - 1].pct}% off from ${m.slabs[0].minQty}` : `${m.slabs[0].pct}% off from ${m.slabs[0].minQty}`;
  if (m.kind === "combo") return "Combo offer";
  return null;
}

export function schemeItemIds(s: Scheme): string[] {
  const m = s.mechanic;
  if (m.kind === "free-goods") return m.buyItemIds;
  if (m.kind === "slab") return m.itemIds;
  if (m.kind === "combo") return m.needs.flatMap((n) => n.itemIds);
  return [];
}

/** Schemes this dealer gets today (engine.eligible returns null when a scheme applies). */
export const liveFor = (schemes: Scheme[], c: Customer) => schemes.filter((s) => eligible(s, c) === null);
/** Schemes that will apply once they start. */
export const soonFor = (schemes: Scheme[], c: Customer) => schemes.filter((s) => s.from > SF_TODAY && eligible(s, c) !== null && eligible(s, c, s.from) === null);

// ── Price requests and estimates (decisions #27, #32) ───────────────────────
//
// A price request is the tenant's opportunity; its answer is the sales desk's estimate, sent in versions. The rules —
// who may do what, what happens on accept — live in sales/estimate-offer.ts and salesforce/estimates.ts. Here is only
// how a dealer READS them: always a version that was sent, never the estimate's working lines.

export type RequestState = "waiting" | "received" | "changes-asked" | "new-version" | "accepted" | "declined" | "expired" | "closed";
export type DealerRequest = {
  /** The request, or what the company noted of the deal. null when it sent an estimate with no opportunity behind it. */
  opp: Opportunity | null;
  /** The estimate the dealer answers: the accepted one, else the one in play, else the newest. */
  est: Estimate | null;
  /** Other estimates on the same request (one that was declined before a fresh start), newest first. */
  earlier: Estimate[];
  /** What the link carries and the dealer reads: RFQ-0001, or EST-0001 when the company sent it unasked. */
  key: string;
  /** False when the company raised the estimate itself — its own note of the deal is not shown to the dealer. */
  asked: boolean;
  title: string;
  at: string;
  /** For the list's order: the last thing either side did. */
  last: string;
  state: RequestState;
  label: string;
  tone: Tone;
  /** One sentence on where it is and what to do. */
  line: string;
  /** The dealer can accept, decline or ask for changes now. */
  toAnswer: boolean;
  open: boolean;
};

/** `sent` = the estimates this dealer was sent for the request (an estimate still being written is the company's own business), newest first. */
function toDealerRequest(o: Opportunity | null, sent: Estimate[], company: string): DealerRequest | null {
  const asked = o?.source === "portal-rfq";
  // What the tenant logged for itself is its own business until it sends this dealer an estimate.
  if (!asked && !sent.length) return null;
  const est = sent.find((e) => offerOf(e).status === "accepted") ?? sent.find(estimateOpen) ?? sent[0] ?? null;
  const offer = est ? offerOf(est) : null;
  const v = est ? latestVersion(est) : undefined;
  const ended = !!est && offer?.status !== "accepted" && !estimateOpen(est);
  // The dealer said no, as against the company giving the deal up.
  const declinedByDealer = offer?.status === "declined" && offer.declined?.by === "customer";

  let state: RequestState;
  if (offer?.status === "accepted" || o?.stage === "won") state = "accepted";
  else if (o ? o.stage === "lost" : ended) state = declinedByDealer ? "declined" : "closed";
  else if (!est || ended) state = "waiting";
  else if (offerExpired(est)) state = "expired";
  else if (offer?.status === "changes-requested") state = "changes-asked";
  else state = (offer?.versions.length ?? 0) > 1 ? "new-version" : "received";

  const orderId = offer?.accepted?.orderNo ?? o?.orderId;
  const [label, tone, line]: [string, Tone, string] =
    state === "waiting"
      ? [asked ? "Sent — waiting for a price" : "Waiting for a new estimate", "neutral", `${cap(company)} will reply with an estimate.`]
      : state === "received"
        ? ["Estimate received", "warn", "Read it, then accept it, decline it or ask for changes."]
        : state === "changes-asked"
          ? ["You asked for changes", "info", `${cap(company)} will answer with a new version. You can still accept version ${v?.no ?? 1} as it is.`]
          : state === "new-version"
            ? ["New version received", "warn", `Version ${v?.no ?? 2} is here. See what changed, then accept it, decline it or ask again.`]
            : state === "accepted"
              ? [orderId ? `Accepted — order ${orderId}` : "Accepted", "good", orderId ? `You accepted ${offer?.accepted ? `version ${offer.accepted.version}` : "it"}. It is now order ${orderId}.` : "You accepted it."]
              : state === "declined"
                ? ["Declined", "off", `You declined this estimate${offer?.declined?.reason ? ` — “${offer.declined.reason}”` : ""}.`]
                : state === "expired"
                  ? ["Expired", "off", `This offer ran out on ${v ? day(v.validTill) : "its last day"}.`]
                  : [`Closed by ${company}`, "off", `${cap(company)} closed this ${asked ? "request" : "estimate"}.`];

  const firstSent = est ? offerOf(est).versions[0]?.at : undefined;
  const begun = o?.createdAt ?? firstSent ?? "";
  return {
    opp: o,
    est,
    earlier: sent.filter((e) => e.no !== est?.no),
    key: o?.rfqNo ?? est?.no ?? o?.id ?? "",
    asked,
    title: asked && o ? o.title : `Estimate from ${company}`,
    at: asked && o ? (o.request?.at ?? o.createdAt) : (firstSent ?? begun),
    last: [begun, ...sent.flatMap((e) => [...offerOf(e).versions.map((x) => x.at), ...offerOf(e).requests.map((x) => x.at)])].sort().pop() ?? begun,
    state,
    label,
    tone,
    line,
    toAnswer: state === "received" || state === "new-version" || state === "changes-asked",
    open: state === "waiting" || state === "received" || state === "new-version" || state === "changes-asked",
  };
}

/** This dealer's price requests, and the estimates the company sent it unasked — the latest activity first. */
export function useDealerRequests(customerId: string, company: string): DealerRequest[] {
  const opps = useStore(opportunitiesStore);
  const ests = useStore(estimatesStore);
  return React.useMemo(() => {
    const sent = sentTo(customerId, ests);
    const mine = opps.filter((o) => o.customerId === customerId);
    const answering = new Set(mine.flatMap((o) => estimatesOf(o.id, sent).map((e) => e.no)));
    return (
      [
        ...mine.map((o) => toDealerRequest(o, estimatesOf(o.id, sent), company)),
        // An estimate made on the sales desk with no opportunity behind it is read on its own.
        ...sent.filter((e) => !answering.has(e.no)).map((e) => toDealerRequest(null, [e], company)),
      ]
        .filter((r): r is DealerRequest => !!r)
        // The stores keep the newest first; a stable sort keeps that order among requests touched in the same minute.
        .sort((a, b) => b.last.localeCompare(a.last))
    );
  }, [opps, ests, customerId, company]);
}

/** A request by anything a link may carry: its RFQ number, an estimate's number (also an earlier one), its own id. */
export const findRequest = (all: DealerRequest[], key: string | null | undefined) =>
  key ? all.find((r) => r.key === key || r.opp?.rfqNo === key || r.est?.no === key || r.opp?.id === key || r.earlier.some((e) => e.no === key)) : undefined;

// ── My business: the dealer's own notebook ─────────────────────────────────

/**
 * A stock count the dealer typed in — one row per product, the latest count wins. The notebook is the dealer's
 * alone (owner decision #26): nothing here is derived from, or feeds, the company's orders, stock or books.
 */
export type StockCount = { id: string; productId: string; qty: number; countedOn: string };
export const stockCountsStore = persistentStore<Record<string, StockCount[]>>("portal.stock", {});

// ── Events: who is going, per dealer ────────────────────────────────────────

export const rsvpStore = persistentStore<Record<string, Record<string, boolean>>>("portal.rsvp", {});

// ── Theme: a per-viewer convenience ─────────────────────────────────────────

export const themeStore = persistentStore<"light" | "dark">("portal.theme", "light");
