import { createStore, useStore } from "../sales/store";
import type { ToastMsg } from "../sales/bzw";
import { DEALER_ID, DEALER_LEDGER, SF_NOW, SF_TODAY } from "../salesforce/data";
import type { Customer, HubOrder, HubStatus, LedgerRow, Scheme } from "../salesforce/data";
import { customerById, day, daysUntil, eligible, evaluate, npr, productById } from "../salesforce/engine";
import type { CartLine, Evaluation } from "../salesforce/engine";
import { cartStore, customersStore, hubStore, schemesStore } from "../salesforce/store";
import { approveHubOrder, openPendingSalesOrder } from "../salesforce/orders-parts";

// ════════════════════════════════════════════════════════════════════════════
// DEALER PORTAL · STATE — what only the portal keeps
//
// Orders, claims, branding and RSVPs go to the SHARED stores (salesforce/store)
// so the company sees them. What stays here is the dealer's side of things the
// seed does not carry: its older, already-delivered orders, payments it has
// recorded, quotation requests, notes, and the price snapshot each order got.
// ════════════════════════════════════════════════════════════════════════════

export const COMPANY = "Bizak Nepal";
export const dpPath = (p = "") => `/design/dealer${p ? `/${p}` : ""}`;
export const dealer = () => customerById(DEALER_ID)!;

// ── Who is signed in ────────────────────────────────────────────────────────

export const sessionStore = createStore<{ userIndex: number }>({ userIndex: 0 });

export function usePortalUser() {
  const { userIndex } = useStore(sessionStore);
  useStore(customersStore);
  const users = dealer().portalUsers;
  const u = users[userIndex] ?? users[0];
  return { ...u, first: u.name.split(" ")[0], initials: initialsOf(u.name), index: userIndex, all: users };
}
export const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
export const portalUserName = () => {
  const users = dealer().portalUsers;
  return (users[sessionStore.get().userIndex] ?? users[0]).name;
};

// ── Toast (the shell shows it, so it survives a navigation) ─────────────────

export const toastStore = createStore<ToastMsg | null>(null);
export const notify = (text: string, kind: ToastMsg["kind"] = "success") => toastStore.set(() => ({ id: Date.now(), kind, text }));

// ── Numbering ───────────────────────────────────────────────────────────────

export function nextNo(ids: (string | null | undefined)[], prefix: string, pad = 0) {
  const n = Math.max(0, ...ids.filter((i): i is string => !!i && i.startsWith(prefix)).map((i) => Number(i.slice(prefix.length)) || 0)) + 1;
  return prefix + String(n).padStart(pad, "0");
}

export const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

// ── The dealer's older orders (already sales orders — delivered or on the way) ─

export type Stage = 0 | 1 | 2 | 3 | 4;
export const STEPS = ["Placed", "Approved", "Packed", "On the way", "Delivered"] as const;

type PastOrder = {
  id: string;
  at: string;
  byName: string;
  soNo: string;
  lines: CartLine[];
  stage: Stage;
  /** When each step happened — index = STEPS index. */
  steps: (string | null)[];
  invoiceNo: string | null;
  deliveryNo: string | null;
  deliverBy: string;
  vehicle?: string;
  driver?: string;
  eta?: string;
  note: string;
};

const PAST: PastOrder[] = [
  { id: "ORD-2196", at: "2026-09-03 10:12", byName: "Kiran Thapa", soNo: "SO-1084", lines: [{ productId: "P-141", qty: 150 }, { productId: "P-142", qty: 60 }, { productId: "P-151", qty: 40 }], stage: 2, steps: ["2026-09-03 10:12", "2026-09-03 11:40", "2026-09-04 09:15", null, null], invoiceNo: null, deliveryNo: null, deliverBy: "2026-09-06", note: "" },
  { id: "ORD-2186", at: "2026-08-31 16:05", byName: "Kiran Thapa", soNo: "SO-1079", lines: [{ productId: "P-101", qty: 50 }, { productId: "P-111", qty: 60 }, { productId: "P-121", qty: 20 }, { productId: "P-131", qty: 4 }], stage: 3, steps: ["2026-08-31 16:05", "2026-09-01 09:30", "2026-09-02 15:10", "2026-09-03 08:30", null], invoiceNo: "INV-8831", deliveryNo: "DN-0412", deliverBy: "2026-09-05", vehicle: "Lu 1 Kha 4521", driver: "Hari B.K. · 9847012345", eta: "5 Sep, before noon", note: "Unload at the back gate." },
  { id: "ORD-2171", at: "2026-08-18 12:20", byName: "Ramesh Adhikari", soNo: "SO-1071", lines: [{ productId: "P-101", qty: 40 }, { productId: "P-102", qty: 20 }, { productId: "P-111", qty: 50 }, { productId: "P-141", qty: 120 }], stage: 4, steps: ["2026-08-18 12:20", "2026-08-18 15:05", "2026-08-19 11:00", "2026-08-20 07:45", "2026-08-21 13:20"], invoiceNo: "INV-8790", deliveryNo: "DN-0377", deliverBy: "2026-08-22", note: "" },
  { id: "ORD-2148", at: "2026-08-05 15:40", byName: "Kiran Thapa", soNo: "SO-1062", lines: [{ productId: "P-101", qty: 60 }, { productId: "P-111", qty: 80 }, { productId: "P-121", qty: 30 }, { productId: "P-131", qty: 6 }, { productId: "P-151", qty: 40 }], stage: 4, steps: ["2026-08-05 15:40", "2026-08-05 17:10", "2026-08-06 10:30", "2026-08-07 08:00", "2026-08-08 12:45"], invoiceNo: "INV-8744", deliveryNo: "DN-0331", deliverBy: "2026-08-09", note: "" },
  { id: "ORD-2117", at: "2026-07-21 11:05", byName: "Ramesh Adhikari", soNo: "SO-1058", lines: [{ productId: "P-101", qty: 45 }, { productId: "P-112", qty: 30 }, { productId: "P-121", qty: 25 }, { productId: "P-141", qty: 100 }], stage: 4, steps: ["2026-07-21 11:05", "2026-07-21 14:30", "2026-07-22 10:00", "2026-07-23 07:30", "2026-07-24 11:15"], invoiceNo: "INV-8702", deliveryNo: "DN-0298", deliverBy: "2026-07-25", note: "" },
];

/** What the portal keeps about an order it sent: the delivery date asked for and the price snapshot it got. */
type OrderMeta = { deliverBy: string | null; quoteId: string | null; snapshot: Evaluation };
export const orderMetaStore = createStore<Record<string, OrderMeta>>({});

// A document keeps the schemes it got (blueprint §2 "snapshot, never recompute") — a seeded order with no
// snapshot is priced once, at its own date, and then held.
const heldSnapshots = new Map<string, Evaluation>();
export function snapshotOf(id: string, lines: CartLine[], at: string): Evaluation {
  const kept = orderMetaStore.get()[id]?.snapshot ?? heldSnapshots.get(id);
  if (kept) return kept;
  const ev = evaluate(DEALER_ID, lines, schemesStore.get(), { date: at.slice(0, 10) });
  heldSnapshots.set(id, ev);
  return ev;
}

export type DealerOrder = {
  id: string;
  at: string;
  byName: string;
  lines: CartLine[];
  note: string;
  hubStatus: HubStatus | null;
  stage: Stage;
  declined: boolean;
  reason: string | null;
  soNo: string | null;
  invoiceNo: string | null;
  deliveryNo: string | null;
  steps: (string | null)[];
  deliverBy: string | null;
  quoteId: string | null;
  vehicle?: string;
  driver?: string;
  eta?: string;
};

function fromHub(o: HubOrder, meta: OrderMeta | undefined): DealerOrder {
  // The hub knows placed / approved / rejected. Packing and dispatch happen later on the sales desk, so a
  // fresh portal order stops at Approved until the warehouse moves it.
  const stage: Stage = o.status === "approved" ? 1 : 0;
  return {
    id: o.id,
    at: o.at,
    byName: o.byName,
    lines: o.lines,
    note: o.note,
    hubStatus: o.status,
    stage,
    declined: o.status === "rejected",
    reason: o.rejectReason ?? null,
    soNo: o.soNo,
    invoiceNo: null,
    deliveryNo: null,
    steps: [o.at, o.status === "approved" ? o.at : null, null, null, null],
    deliverBy: meta?.deliverBy ?? null,
    quoteId: meta?.quoteId ?? null,
  };
}

export function useDealerOrders(): DealerOrder[] {
  const hub = useStore(hubStore);
  const meta = useStore(orderMetaStore);
  const live = hub.filter((o) => o.customerId === DEALER_ID).map((o) => fromHub(o, meta[o.id]));
  const past: DealerOrder[] = PAST.map((p) => ({ ...p, hubStatus: null, declined: false, reason: null, quoteId: null }));
  return [...live, ...past].sort((a, b) => b.at.localeCompare(a.at));
}

export type OrderState = { label: string; tone: "good" | "warn" | "danger" | "neutral" | "info" };
export function orderState(o: DealerOrder): OrderState {
  if (o.declined) return { label: "Not accepted", tone: "danger" };
  if (o.stage === 0) return o.hubStatus === "review" ? { label: "Waiting for approval", tone: "warn" } : { label: "Placed", tone: "neutral" };
  if (o.stage === 1) return { label: "Approved", tone: "info" };
  if (o.stage === 2) return { label: "Packed", tone: "info" };
  if (o.stage === 3) return { label: "On the way", tone: "info" };
  return { label: "Delivered", tone: "good" };
}
/** One line on where an open order is. */
export function onTheWayLine(o: DealerOrder) {
  if (o.declined) return o.reason ?? "Not accepted";
  if (o.stage === 3) return `On the way${o.eta ? ` · arrives ${o.eta}` : ""}`;
  if (o.stage === 2) return `Packed${o.deliverBy ? ` · due ${day(o.deliverBy)}` : ""}`;
  if (o.stage === 1) return `Approved${o.soNo ? ` as ${o.soNo}` : ""} · being packed next`;
  return o.hubStatus === "review" ? "Waiting for approval" : "Placed · being checked";
}
export const isOpen = (o: DealerOrder) => !o.declined && o.stage < 4;

/** The products this dealer buys most often, at the quantity it bought last. */
export function usualItems(orders: DealerOrder[]) {
  const seen = new Map<string, { productId: string; times: number; lastQty: number }>();
  for (const o of orders.filter((x) => !x.declined)) {
    for (const l of o.lines) {
      const s = seen.get(l.productId);
      if (s) s.times++;
      else seen.set(l.productId, { productId: l.productId, times: 1, lastQty: l.qty });
    }
  }
  return [...seen.values()].filter((s) => s.times >= 2).sort((a, b) => b.times - a.times);
}

// ── Cart helpers ────────────────────────────────────────────────────────────

export function setQty(productId: string, qty: number) {
  cartStore.set((c) => {
    const q = Math.max(0, Math.round(qty));
    if (q === 0) return c.filter((l) => l.productId !== productId);
    return c.some((l) => l.productId === productId) ? c.map((l) => (l.productId === productId ? { ...l, qty: q } : l)) : [...c, { productId, qty: q }];
  });
}
export function addToCart(lines: CartLine[]) {
  cartStore.set((c) => {
    const next = c.map((l) => ({ ...l }));
    for (const l of lines) {
      const hit = next.find((x) => x.productId === l.productId);
      if (hit) {
        hit.qty += l.qty;
        if (l.price != null) hit.price = l.price;
      } else next.push({ ...l });
    }
    return next;
  });
}

export const draftStore = createStore<{ deliverBy: string; note: string; quoteId: string | null }>({ deliverBy: addDays(SF_TODAY, 3), note: "", quoteId: null });

/** Orders this size or smaller, from a customer with no overdue and room in its credit, are approved on arrival. */
export const AUTO_APPROVE_UPTO = 200_000;

export function submitOrder(ev: Evaluation, lines: CartLine[]): HubOrder {
  const d = draftStore.get();
  const hub = hubStore.get();
  const id = nextNo(hub.map((o) => o.id), "ORD-");
  const autoApprove = ev.credit.ok && ev.total <= AUTO_APPROVE_UPTO;
  const status: HubStatus = ev.credit.ok ? "ready" : "review";
  const quote = d.quoteId ? quotesStore.get().find((q) => q.id === d.quoteId) : null;
  const note = [d.note.trim(), d.deliverBy ? `Deliver by ${day(d.deliverBy)}.` : "", quote ? `Quotation ${quote.id}${quote.estimateNo ? ` (${quote.estimateNo})` : ""} accepted — priced as quoted.` : ""].filter(Boolean).join(" ");
  const order: HubOrder = {
    id,
    customerId: DEALER_ID,
    source: "portal",
    byName: portalUserName(),
    repId: dealer().repId,
    at: `${SF_TODAY} ${SF_NOW}`,
    lines: lines.filter((l) => l.qty > 0).map((l) => ({ ...l })),
    note,
    status,
    soNo: null,
  };
  hubStore.set((h) => [order, ...h]);
  // A pending sales order from the moment of submit (owner decision #5); an auto-approved one is then approved in place
  // by the same call the Orders hub makes, which also spends the scheme budgets.
  const soNo = openPendingSalesOrder(order);
  if (autoApprove) approveHubOrder({ ...order, soNo });
  orderMetaStore.set((m) => ({ ...m, [id]: { deliverBy: d.deliverBy || null, quoteId: d.quoteId, snapshot: ev } }));
  if (quote) quotesStore.set((qs) => qs.map((q) => (q.id === quote.id ? { ...q, orderId: id } : q)));
  cartStore.set(() => []);
  draftStore.set(() => ({ deliverBy: addDays(SF_TODAY, 3), note: "", quoteId: null }));
  return hubStore.get().find((o) => o.id === id) ?? order;
}

// ── Account: the statement, open invoices, ageing ───────────────────────────

export type PayMethod = "bank" | "wallet" | "cheque";
export const METHOD_LABEL: Record<PayMethod, string> = { bank: "Bank transfer", wallet: "eSewa / Khalti", cheque: "Cheque" };

export type StatementRow = LedgerRow & { id: string; pending?: boolean; method?: PayMethod; reference?: string; by?: string; applies?: { doc: string; amount: number }[] };
export const ledgerAddsStore = createStore<StatementRow[]>([]);

export type OpenInvoice = { doc: string; date: string; due: string | null; amount: number; open: number; late: number; /** Sent by the dealer, not yet confirmed. */ waiting: number };

export function computeAccount(adds: StatementRow[], c: Customer) {
  const rows: StatementRow[] = [...DEALER_LEDGER.map((r, i) => ({ ...r, id: `L-${i}` })), ...adds].sort((a, b) => a.date.localeCompare(b.date));
  let bal = 0;
  const statement = rows.map((r) => {
    if (!r.pending) bal += r.debit - r.credit;
    return { ...r, balance: bal };
  });

  // Receipts recorded here name the invoices they pay; the seed's receipts do not, so they settle the
  // oldest debt first.
  const debits: OpenInvoice[] = rows.filter((r) => r.debit > 0).map((r) => ({ doc: r.doc, date: r.date, due: r.due, amount: r.debit, open: r.debit, late: r.due ? -daysUntil(r.due) : 0, waiting: rows.filter((x) => x.pending).flatMap((x) => x.applies ?? []).filter((a) => a.doc === r.doc).reduce((s, a) => s + a.amount, 0) }));
  let pool = 0;
  for (const r of rows.filter((x) => x.credit > 0 && !x.pending)) {
    if (!r.applies) {
      pool += r.credit;
      continue;
    }
    for (const a of r.applies) {
      const d = debits.find((x) => x.doc === a.doc);
      const take = d ? Math.min(d.open, a.amount) : 0;
      if (d) d.open -= take;
      pool += a.amount - take;
    }
  }
  for (const d of debits) {
    const take = Math.min(d.open, pool);
    d.open -= take;
    pool -= take;
  }
  const open = debits.filter((d) => d.open > 0);
  const invoices = open.filter((d) => d.due);
  const overdue = invoices.filter((d) => d.late > 0).reduce((s, d) => s + d.open, 0);
  const ageing = [
    { label: "Not due yet", amount: invoices.filter((d) => d.late <= 0).reduce((s, d) => s + d.open, 0) },
    { label: "1–30 days late", amount: invoices.filter((d) => d.late > 0 && d.late <= 30).reduce((s, d) => s + d.open, 0) },
    { label: "31–60 days late", amount: invoices.filter((d) => d.late > 30 && d.late <= 60).reduce((s, d) => s + d.open, 0) },
    { label: "Over 60 days", amount: invoices.filter((d) => d.late > 60).reduce((s, d) => s + d.open, 0) + open.filter((d) => !d.due).reduce((s, d) => s + d.open, 0) },
  ];
  const nextDue = invoices.filter((d) => d.late <= 0).sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""))[0] ?? null;
  const pending = adds.filter((r) => r.pending && r.kind === "Receipt");
  return { statement, balance: bal, open: invoices, overdue, ageing, nextDue, limit: c.creditLimit, available: Math.max(0, c.creditLimit - bal), pending };
}

export function useAccount() {
  const adds = useStore(ledgerAddsStore);
  useStore(customersStore);
  return computeAccount(adds, dealer());
}

export function recordPayment(p: { invoices: OpenInvoice[]; amount: number; method: PayMethod; reference: string; discounts: { doc: string; amount: number }[] }) {
  const adds = ledgerAddsStore.get();
  const all = [...DEALER_LEDGER.map((r) => r.doc), ...adds.map((r) => r.doc)];
  const pending = p.method !== "wallet";
  const discounted = new Map(p.discounts.map((d) => [d.doc, d.amount]));
  let left = p.amount;
  const applies = [...p.invoices]
    .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""))
    .map((inv) => {
      const take = Math.min(left, inv.open - (discounted.get(inv.doc) ?? 0));
      left -= take;
      return { doc: inv.doc, amount: take };
    })
    .filter((a) => a.amount > 0);
  const rcp: StatementRow = { id: `A-${adds.length + 1}`, date: SF_TODAY, doc: nextNo(all, "RCP-", 4), kind: "Receipt", debit: 0, credit: p.amount, due: null, pending, method: p.method, reference: p.reference, by: portalUserName(), applies };
  const rows: StatementRow[] = [rcp];
  const disc = p.discounts.reduce((s, d) => s + d.amount, 0);
  if (disc > 0) rows.push({ id: `A-${adds.length + 2}`, date: SF_TODAY, doc: nextNo([...all, rcp.doc], "CM-EP-", 3), kind: "Credit note", debit: 0, credit: disc, due: null, pending, by: "Early payment 2%", applies: p.discounts });
  ledgerAddsStore.set((a) => [...a, ...rows]);

  if (!pending) {
    const c = dealer();
    const after = computeAccount(ledgerAddsStore.get(), c);
    customersStore.set((list) => list.map((x) => (x.id === c.id ? { ...x, outstanding: Math.max(0, c.outstanding - p.amount - disc), overdue: Math.min(c.overdue, after.overdue) } : x)));
  }
  return rcp;
}

// ── Schemes in plain words ──────────────────────────────────────────────────

function itemsPhrase(ids: string[]) {
  const ps = ids.map(productById);
  if (ps.length >= 3 && ps.every((p) => p.brand === ps[0].brand)) return `any ${ps[0].brand} ${ps[0].category.toLowerCase()}`;
  return ps.map((p) => p.name).join(" or ");
}

export function schemeSentence(s: Scheme): string {
  const m = s.mechanic;
  switch (m.kind) {
    case "free-goods": {
      const p = productById(m.buyItemIds[0]);
      const get = m.getItemId === "same" ? "free" : `${productById(m.getItemId).name} free`;
      return `Buy ${m.buyQty} ${p.unit}s of ${itemsPhrase(m.buyItemIds)}, get ${m.getQty} ${get}.`;
    }
    case "slab": {
      const unit = productById(m.itemIds[0]).unit;
      return `Buy ${itemsPhrase(m.itemIds)} — all count together. ${m.slabs.map((x) => `${x.minQty}+ ${unit}s: ${x.pct}% off`).join(", ")}.`;
    }
    case "combo": {
      const g = productById(m.getItemId);
      return `Buy ${m.needs.map((n) => `${n.qty} ${productById(n.itemIds[0]).unit}s of ${itemsPhrase(n.itemIds)}`).join(" and ")}, get ${m.getQty} ${g.unit} of ${g.name} free.`;
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
  if (m.kind === "slab") return m.slabs.length > 1 ? `${m.slabs[0].pct}–${m.slabs[m.slabs.length - 1].pct}% off from ${m.slabs[0].minQty}` : `${m.slabs[0].pct}% off from ${m.slabs[0].minQty}`;
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
export const liveForMe = (schemes: Scheme[]) => schemes.filter((s) => eligible(s, dealer()) === null);
/** Schemes that will apply once they start. */
export const soonForMe = (schemes: Scheme[]) => schemes.filter((s) => s.from > SF_TODAY && eligible(s, dealer()) !== null && eligible(s, dealer(), s.from) === null);

// ── Quotations (RFQ → the company's estimate) ───────────────────────────────

export type QuoteLine = { productId: string; qty: number; price: number | null };
export type Quote = { id: string; at: string; byName: string; lines: QuoteLine[]; note: string; status: "requested" | "quoted" | "accepted"; estimateNo: string | null; validTill: string | null; reply: string | null; orderId: string | null; quotedOn: string | null; acceptedAt: string | null };

export const quotesStore = createStore<Quote[]>([
  { id: "QR-015", at: "2026-09-03 17:40", byName: "Ramesh Adhikari", lines: [{ productId: "P-131", qty: 40, price: null }, { productId: "P-132", qty: 30, price: null }], note: "A hotel group in Butwal wants tea for Dashain. Can you do a better price on 40+ cartons?", status: "requested", estimateNo: null, validTill: null, reply: null, orderId: null, quotedOn: null, acceptedAt: null },
  { id: "QR-013", at: "2026-08-29 11:15", byName: "Kiran Thapa", lines: [{ productId: "P-101", qty: 200, price: 1_420 }, { productId: "P-102", qty: 120, price: 1_420 }], note: "School canteen supply for the whole term.", status: "quoted", estimateNo: "EST-0418", validTill: "2026-09-12", reply: "Special term price, held until 12 Sep.", orderId: null, quotedOn: "2026-08-30", acceptedAt: null },
  { id: "QR-010", at: "2026-08-12 09:50", byName: "Ramesh Adhikari", lines: [{ productId: "P-121", qty: 80, price: 1_740 }], note: "Bulk detergent for a cooperative.", status: "accepted", estimateNo: "EST-0391", validTill: "2026-08-25", reply: "Price for 80 cartons, one delivery.", orderId: null, quotedOn: "2026-08-13", acceptedAt: "2026-08-14 10:30" },
]);

export function acceptQuote(q: Quote) {
  quotesStore.set((qs) => qs.map((x) => (x.id === q.id ? { ...x, status: "accepted", acceptedAt: `${SF_TODAY} ${SF_NOW}` } : x)));
  addToCart(q.lines.map((l) => ({ productId: l.productId, qty: l.qty, price: l.price ?? undefined })));
  draftStore.set((d) => ({ ...d, quoteId: q.id }));
}

// ── Notes on any record (the portal's side of History + Notes) ──────────────

export type Note = { id: string; who: string; when: string; body: string };
export const notesStore = createStore<Record<string, Note[]>>({
  "ORD-2186": [{ id: "n1", who: "Pooja Gurung (Bizak Nepal)", when: "2026-09-03 08:40", body: "Truck left the Bhairahawa depot. Hari will call 30 minutes before." }],
  "CL-551": [{ id: "n2", who: "Sita Adhikari", when: "2026-09-02 16:20", body: "Retailer-wise list attached to the email as well." }],
});
export function addNote(recordId: string, body: string) {
  notesStore.set((n) => ({ ...n, [recordId]: [...(n[recordId] ?? []), { id: `n${Date.now()}`, who: portalUserName(), when: `${SF_TODAY} ${SF_NOW}`, body }] }));
}

// ── RSVPs ───────────────────────────────────────────────────────────────────

export const rsvpStore = createStore<Record<string, boolean>>({ "EV-41": true });

/** What the dealer bought (invoiced) between two dates — a target rebate's progress. */
export const purchasedBetween = (from: string, to: string) => DEALER_LEDGER.filter((r) => r.kind === "Invoice" && r.date >= from && r.date <= to).reduce((s, r) => s + r.debit, 0);
