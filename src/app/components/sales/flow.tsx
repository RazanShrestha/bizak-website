import * as React from "react";
import { Link } from "react-router";
import { cn } from "../ui/utils";
import {
  Approval,
  Attachment,
  AuditRow,
  ChildDoc,
  Comment,
  Customer,
  HistoryEvent,
  ME,
  Order,
  OrderLine,
  SEED_ORDERS,
  TODAY,
  customerById,
  daysBetween,
  fmtShort,
  itemById,
  lineNet,
  needsMyApproval,
  totalsOf,
  stageLabel,
  pendingOn,
  readyToInvoice,
  remainingToInvoice,
  STAGE_TONE,
} from "./orders";
import { createStore, ordersStore, useStore } from "./store";
import { tdsById } from "./master";
import type { Tone } from "./bzw";
import type { BillLine } from "./OrderComposer";

// ════════════════════════════════════════════════════════════════════════════
// THE SALES FLOW — estimate → order → delivery → invoice → receipt → return
//
// Every document is a thin record plus LINKS; where a document stands is
// DERIVED from the documents downstream of it, the way bizak-app derives it
// (DocumentStatusServiceImpl):
//
//   estimate  "Ordered" is a live ORDER with REF_TYPE = estimate — never a
//             stored flag. One estimate can be ordered in parts. Its pipeline
//             STATUS (Proposal, Negotiation…) is the rep's own reading.
//   delivery  CHALLAN. Stock moves only when it is APPROVED.
//   invoice   Paid = payment taken at save + Σ approved receipt lines.
//             Returned = Σ approved credit memos. Returned outranks Paid.
//             TDS withheld by the customer reduces what is receivable.
//   receipt   PAYMENT_FORM. Allocations may leave a remainder — it is kept as
//             an ADVANCE, the way the app keeps "N unapplied". TDS is per line.
//   return    CREDIT_MEMO with REF_INVOICE_ID — restocks because it is linked
//             to an invoice; its credit is APPLIED to invoices or refunded.
//
// An invoice raised with no order still lives on an order record internally
// (`direct: true`) so every rollup reads one shape; the desks never show it.
// ════════════════════════════════════════════════════════════════════════════

type Meta = { created: { byId: string; on: string }; audit: AuditRow[]; attachments: Attachment[]; comments: Comment[]; history: HistoryEvent[] };

// ── Estimate ────────────────────────────────────────────────────────────────

export const ESTIMATE_STATUSES = ["In discussion", "Identified decision maker", "Proposal", "In negotiation", "Purchasing"] as const;

export type Estimate = Meta & {
  id: string;
  no: string;
  subsidiaryId: string;
  customerId: string;
  date: string;
  validTill: string | null;
  expectedClose: string | null;
  status: (typeof ESTIMATE_STATUSES)[number];
  opportunity: string | null;
  repId: string;
  locationId: string;
  termId: string;
  currency: string;
  exchangeRate: number;
  memo: string;
  probability: number;
  lines: OrderLine[];
  dims: Order["dims"];
  custom: Record<string, string>;
  approval: Approval;
  closed: { reason: string; on: string } | null;
  cancelled: { reason: string; on: string } | null;
};

let seq = 900;
const ln = (itemId: string, qty: number, discountPct = 0, rate?: number): OrderLine => {
  const it = itemById(itemId)!;
  return { id: `EL-${++seq}`, itemId, qty, rate: rate ?? it.rate, discountPct, tax: it.tax, unit: it.unit, delivered: 0, invoiced: 0, custom: {} };
};
const ok = (on: string): Approval => ({ state: "approved", byId: "EMP-101", on });
const est = (x: Partial<Estimate> & Pick<Estimate, "no" | "customerId" | "date" | "lines">): Estimate => {
  const c = customerById(x.customerId)!;
  return {
    id: x.no,
    subsidiaryId: "NP-01",
    validTill: null,
    expectedClose: null,
    status: "In discussion",
    opportunity: null,
    repId: "EMP-104",
    locationId: "L-KTM",
    termId: c.termId,
    currency: c.currency,
    exchangeRate: c.currency === "USD" ? 133.42 : 1,
    memo: "",
    probability: 50,
    dims: {},
    custom: { channel: "Field sales" },
    approval: ok(x.date),
    closed: null,
    cancelled: null,
    comments: [],
    history: [],
    attachments: [],
    audit: [],
    created: { byId: x.repId ?? "EMP-104", on: x.date },
    ...x,
  };
};

export const SEED_ESTIMATES: Estimate[] = [
  est({
    no: "EST-0425", subsidiaryId: "NP-02", customerId: "C-1088", date: "2026-09-04", validTill: "2026-09-19", expectedClose: "2026-09-15", repId: "EMP-107", probability: 60, status: "Proposal", locationId: "L-PKR",
    lines: [ln("I-07", 300, 5), ln("I-08", 1000, 2)],
    memo: "Monsoon restock — dealer asked for the same rebate as last quarter.",
    history: [{ id: "h1", whoId: "EMP-107", when: "Sep 4, 10:12", what: "created the estimate" }],
  }),
  est({
    no: "EST-0423", customerId: "C-2003", date: "2026-09-03", validTill: "2026-10-03", expectedClose: "2026-09-20", repId: "EMP-104", probability: 40, status: "In negotiation",
    approval: { state: "pending", stateName: "Manager review", approverId: "EMP-101", since: "2026-09-03" },
    lines: [{ ...ln("I-06", 200, 0, 21.5), tax: "ZERO" }],
    memo: "Export pricing, FOB Kakarbhitta.",
    history: [{ id: "h1", whoId: "EMP-104", when: "Sep 3, 15:40", what: "sent it to Manager review" }],
  }),
  est({
    no: "EST-0421", customerId: "C-1072", date: "2026-09-01", validTill: "2026-09-15", expectedClose: "2026-09-12", repId: "EMP-126", probability: 70, status: "Identified decision maker", opportunity: "OPP-0088",
    lines: [ln("I-06", 60, 5), ln("I-05", 20)],
    comments: [{ id: "c1", authorId: "EMP-126", when: "Sep 2, 11:05", title: "Tasting visit", direction: "Outbound", body: "They'll confirm after tasting the new Arabica lot." }],
    history: [{ id: "h1", whoId: "EMP-126", when: "Sep 1, 09:30", what: "created the estimate from OPP-0088" }],
  }),
  est({
    no: "EST-0419", customerId: "C-1061", date: "2026-08-18", validTill: "2026-09-01", expectedClose: "2026-08-22", repId: "EMP-121", probability: 90, status: "Purchasing",
    lines: [ln("I-09", 25), ln("I-12", 40), ln("I-04", 16)],
    history: [{ id: "h1", whoId: "EMP-121", when: "Aug 20, 11:10", what: "ordered the hardware as SO-1043" }],
  }),
  est({ no: "EST-0418", customerId: "C-1093", date: "2026-08-29", validTill: "2026-09-12", expectedClose: "2026-09-02", repId: "EMP-121", probability: 100, status: "Purchasing", lines: [ln("I-09", 40, 8), ln("I-12", 60), ln("I-04", 24)] }),
  est({ no: "EST-0412", customerId: "C-1029", date: "2026-08-20", validTill: "2026-09-03", expectedClose: "2026-08-24", repId: "EMP-104", probability: 100, status: "Purchasing", lines: [ln("I-01", 12), ln("I-02", 4), ln("I-03", 30), ln("I-04", 30)] }),
  est({
    no: "EST-0409", customerId: "C-1044", date: "2026-08-10", validTill: "2026-08-24", expectedClose: "2026-08-14", repId: "EMP-126", probability: 0,
    lines: [ln("I-05", 100)],
    closed: { reason: "Bought locally at a lower price.", on: "2026-08-16" },
  }),
];

export const estimatesStore = createStore<Estimate[]>(SEED_ESTIMATES);

export const ordersFrom = (orders: Order[], e: Estimate) => orders.filter((o) => o.source?.kind === "Estimate" && o.source.no === e.no && !o.cancelled);

/** Ordered against each estimate line (the app matches ORDER_DETAIL.REF_DETAIL_ID; the design matches item). */
export function orderedQty(orders: Order[], e: Estimate, l: OrderLine) {
  return ordersFrom(orders, e).reduce((s, o) => s + o.lines.filter((x) => x.itemId === l.itemId).reduce((a, x) => a + x.qty, 0), 0);
}

export type EstimateStage = "approval" | "rejected" | "open" | "partly" | "ordered" | "closed" | "cancelled";

export function estimateStage(orders: Order[], e: Estimate): EstimateStage {
  if (e.cancelled) return "cancelled";
  if (e.approval.state === "rejected") return "rejected";
  if (e.approval.state === "pending") return "approval";
  const made = ordersFrom(orders, e).length > 0;
  const all = e.lines.every((l) => orderedQty(orders, e, l) >= l.qty);
  if (made && all) return "ordered";
  if (e.closed) return "closed";
  if (made) return "partly";
  return "open";
}

export const ESTIMATE_LABEL: Record<EstimateStage, string> = {
  approval: "Pending approval",
  rejected: "Rejected",
  open: "Open",
  partly: "Partly ordered",
  ordered: "Ordered",
  closed: "Closed",
  cancelled: "Cancelled",
};
export const ESTIMATE_TONE: Record<EstimateStage, Tone> = {
  approval: "pending",
  rejected: "danger",
  open: "neutral",
  partly: "partial",
  ordered: "positive",
  closed: "neutral",
  cancelled: "neutral",
};
export const isExpired = (e: Estimate) => !!e.validTill && daysBetween(TODAY, e.validTill) < 0;

// ── Delivery & invoice — records that live on their order ───────────────────

export type DocRef = { doc: ChildDoc; order: Order; customer: Customer };

export const docsOf = (orders: Order[], kind: "delivery" | "invoice"): DocRef[] =>
  orders.flatMap((o) => o.docs.filter((d) => d.kind === kind).map((doc) => ({ doc, order: o, customer: customerById(o.customerId)! })));

export const docLines = (r: DocRef) =>
  r.doc.lines.map((x) => ({ ...x, line: r.order.lines.find((l) => l.id === x.lineId)! })).filter((x) => !!x.line);

export const docTotals = (r: DocRef) =>
  totalsOf(
    docLines(r).map((x) => ({ ...x.line, qty: x.qty, discountAmt: x.line.discountAmt ? (x.line.discountAmt * x.qty) / x.line.qty : undefined })),
    { billDiscount: r.doc.billDiscount, onNet: r.doc.billOnNet, tdsRate: tdsById(r.doc.tdsCode)?.rate },
  );
export const docValue = (r: DocRef) => docTotals(r).total;

/** The batches that actually shipped on an order line — what a return picks from. */
export function batchesShipped(order: Order, lineId: string) {
  const out = new Map<string, { batch: string; expiry: string | null; qty: number }>();
  order.docs
    .filter((d) => d.kind === "delivery" && !d.cancelled && d.state === "approved")
    .forEach((d) => (d.batches ?? []).filter((b) => b.lineId === lineId).forEach((b) => {
      const prev = out.get(b.batch);
      out.set(b.batch, { batch: b.batch, expiry: b.expiry, qty: (prev?.qty ?? 0) + b.qty });
    }));
  return [...out.values()];
}

/** The serials that actually shipped on an order line — what a return picks from. */
export function serialsShipped(order: Order, lineId: string) {
  return order.docs
    .filter((d) => d.kind === "delivery" && !d.cancelled && d.state === "approved")
    .flatMap((d) => (d.serials ?? []).filter((s) => s.lineId === lineId).flatMap((s) => s.serials.map((serial) => ({ serial, batch: s.batch, locationId: d.locationId ?? order.locationId }))));
}

// ── Receipt ─────────────────────────────────────────────────────────────────

export type Receipt = Meta & {
  id: string;
  no: string;
  subsidiaryId: string;
  customerId: string;
  date: string;
  methodId: string;
  methodFields: Record<string, string>;
  /** "Undeposited funds" or a cash-equivalent ledger. */
  depositTo: string;
  currency: string;
  exchangeRate: number;
  amount: number;
  allocations: { invoiceNo: string; amount: number; tdsCode?: string; tds?: number }[];
  state: "approved" | "pending";
  rejected?: { reason: string; byId: string; on: string };
  /** FORM_STATUS "Posted" — false while it sits in undeposited funds. */
  posted: boolean;
  cancelled: { reason: string; on: string } | null;
  dims: Order["dims"];
  custom: Record<string, string>;
  byId: string;
  memo: string;
  sourceOrder: string | null;
};

const meta = (byId: string, on: string, history: HistoryEvent[] = []): Meta => ({ created: { byId, on }, audit: [], attachments: [], comments: [], history });

export const receiptsStore = createStore<Receipt[]>([
  {
    id: "RCP-0417", no: "RCP-0417", subsidiaryId: "NP-02", customerId: "C-1088", date: "2026-09-03", methodId: "CASH", methodFields: {}, depositTo: "Undeposited funds", currency: "NPR", exchangeRate: 1,
    amount: 100_000, allocations: [{ invoiceNo: "INV-8820", amount: 100_000 }], state: "pending", posted: false, cancelled: null, dims: {}, custom: {}, byId: "EMP-107", memo: "Collected at the counter in Pokhara.", sourceOrder: "SO-1041",
    ...meta("EMP-107", "2026-09-03", [{ id: "h1", whoId: "EMP-107", when: "Sep 3, 17:20", what: "recorded the receipt — awaiting approval" }]),
  },
  {
    id: "RCP-0415", no: "RCP-0415", subsidiaryId: "NP-01", customerId: "C-1101", date: "2026-08-30", methodId: "CHQ", methodFields: { bank: "Rastriya Banijya Bank", chequeNo: "004512", chequeDate: "2026-09-02" }, depositTo: "Undeposited funds", currency: "NPR", exchangeRate: 1,
    amount: 515_000, allocations: [{ invoiceNo: "INV-8801", amount: 500_000 }], state: "approved", posted: false, cancelled: null, dims: {}, custom: {}, byId: "EMP-118", memo: "15,000 kept as advance for the October order.", sourceOrder: "SO-1040",
    ...meta("EMP-118", "2026-08-30", [{ id: "h1", whoId: "EMP-118", when: "Aug 30, 12:00", what: "recorded the cheque" }]),
  },
  {
    id: "RCP-0412", no: "RCP-0412", subsidiaryId: "NP-01", customerId: "C-1061", date: "2026-09-01", methodId: "BANK", methodFields: { reference: "NB-TT-778120" }, depositTo: "Nabil Bank · 0145-xx-221", currency: "NPR", exchangeRate: 1,
    amount: 914_300, allocations: [{ invoiceNo: "INV-8809", amount: 914_300, tdsCode: "TDS-SVC", tds: 12_300 }], state: "approved", posted: true, cancelled: null, dims: {}, custom: {}, byId: "EMP-118", memo: "", sourceOrder: "SO-1042",
    ...meta("EMP-118", "2026-09-01", [{ id: "h1", whoId: "EMP-118", when: "Sep 1, 14:12", what: "recorded the transfer" }]),
  },
  {
    id: "RCP-0409", no: "RCP-0409", subsidiaryId: "NP-01", customerId: "C-1029", date: "2026-08-25", methodId: "BANK", methodFields: { reference: "HB-55120" }, depositTo: "Himalayan Bank · 0192-xx-887", currency: "NPR", exchangeRate: 1,
    amount: 294_252, allocations: [{ invoiceNo: "INV-8795", amount: 294_252 }], state: "approved", posted: true, cancelled: null, dims: {}, custom: {}, byId: "EMP-118", memo: "", sourceOrder: "SO-1039",
    ...meta("EMP-118", "2026-08-25", [{ id: "h1", whoId: "EMP-118", when: "Aug 25, 10:40", what: "recorded the transfer" }]),
  },
]);

export const receiptApplied = (r: Receipt) => r.allocations.reduce((s, a) => s + a.amount, 0);
export const receiptTds = (r: Receipt) => r.allocations.reduce((s, a) => s + (a.tds ?? 0), 0);
export const receiptAdvance = (r: Receipt) => Math.max(0, Math.round((r.amount - receiptApplied(r)) * 100) / 100);

// ── Credit memo (sales return) ──────────────────────────────────────────────

export type CreditMemo = Meta & {
  id: string;
  no: string;
  subsidiaryId: string;
  customerId: string;
  invoiceNo: string;
  orderNo: string;
  date: string;
  reason: string;
  memo: string;
  repId: string | null;
  lines: { lineId: string; qty: number }[];
  locationId: string;
  state: "approved" | "pending";
  rejected?: { reason: string; byId: string; on: string };
  approverId: string | null;
  applications: { invoiceNo: string; amount: number }[];
  refunded: number;
  cancelled: { reason: string; on: string } | null;
  dims: Order["dims"];
  custom: Record<string, string>;
  byId: string;
};

export const RETURN_REASONS = ["Damaged in transit", "Wrong item or size", "Excess quantity", "Quality complaint"];

const lineOf = (orderNo: string, i: number) => SEED_ORDERS.find((o) => o.no === orderNo)!.lines[i].id;

export const creditsStore = createStore<CreditMemo[]>([
  {
    id: "CN-0035", no: "CN-0035", subsidiaryId: "NP-02", customerId: "C-1088", invoiceNo: "INV-8820", orderNo: "SO-1041", date: "2026-09-02", reason: "Wrong item or size", memo: "10 lengths were 90mm, not 110mm.", repId: "EMP-107",
    lines: [{ lineId: lineOf("SO-1041", 0), qty: 10 }], locationId: "L-PKR", state: "pending", approverId: "EMP-101", applications: [], refunded: 0, cancelled: null, dims: {}, custom: {}, byId: "EMP-107",
    ...meta("EMP-107", "2026-09-02", [{ id: "h1", whoId: "EMP-107", when: "Sep 2, 16:30", what: "raised the return" }]),
  },
  {
    id: "CN-0031", no: "CN-0031", subsidiaryId: "NP-01", customerId: "C-1029", invoiceNo: "INV-8795", orderNo: "SO-1039", date: "2026-08-19", reason: "Damaged in transit", memo: "", repId: "EMP-104",
    lines: [{ lineId: lineOf("SO-1039", 0), qty: 2 }], locationId: "L-KTM", state: "approved", approverId: null, applications: [{ invoiceNo: "INV-8795", amount: 41_810 }], refunded: 0, cancelled: null, dims: {}, custom: {}, byId: "EMP-104",
    ...meta("EMP-104", "2026-08-19", [{ id: "h1", whoId: "EMP-104", when: "Aug 19, 11:00", what: "returned 2 couplings cracked in transit" }]),
  },
]);

export function creditLines(orders: Order[], c: CreditMemo) {
  const o = orders.find((x) => x.no === c.orderNo);
  if (!o) return [];
  return c.lines.map((x) => ({ ...x, line: o.lines.find((y) => y.id === x.lineId)! })).filter((x) => !!x.line);
}
export const creditTotals = (orders: Order[], c: CreditMemo) => totalsOf(creditLines(orders, c).map((x) => ({ ...x.line, qty: x.qty, discountAmt: x.line.discountAmt ? (x.line.discountAmt * x.qty) / x.line.qty : undefined })));
export const creditValue = (orders: Order[], c: CreditMemo) => creditTotals(orders, c).total;
export const creditApplied = (c: CreditMemo) => c.applications.reduce((s, a) => s + a.amount, 0) + c.refunded;

// ── Invoice view — the whole money picture, derived ─────────────────────────

export type InvoiceStage = "approval" | "notPaid" | "partPaid" | "paid" | "partReturned" | "returned" | "cancelled";

export type InvoiceView = DocRef & {
  totals: ReturnType<typeof totalsOf>;
  total: number;
  receivable: number;
  paid: number;
  paidAtSave: number;
  pendingPaid: number;
  tdsReceived: number;
  returned: number;
  credited: number;
  balance: number;
  stage: InvoiceStage;
  overdueDays: number;
};

export function invoiceViews(orders: Order[], receipts: Receipt[], credits: CreditMemo[]): InvoiceView[] {
  return docsOf(orders, "invoice").map((r) => {
    const totals = docTotals(r);
    const live = receipts.filter((x) => x.state === "approved" && !x.cancelled);
    const alloc = (rs: Receipt[]) => rs.flatMap((x) => x.allocations.filter((a) => a.invoiceNo === r.doc.no));
    const paidAtSave = r.doc.paidAtSave?.amount ?? 0;
    const tdsReceived = alloc(live).reduce((s, a) => s + (a.tds ?? 0), 0);
    const paid = alloc(live).reduce((s, a) => s + a.amount, 0) + paidAtSave;
    const pendingPaid = alloc(receipts.filter((x) => x.state === "pending" && !x.cancelled)).reduce((s, a) => s + a.amount, 0);
    const mine = credits.filter((c) => c.invoiceNo === r.doc.no && c.state === "approved" && !c.cancelled);
    const returned = mine.reduce((s, c) => s + creditValue(orders, c), 0);
    const credited = credits.filter((c) => c.state === "approved" && !c.cancelled).reduce((s, c) => s + c.applications.filter((a) => a.invoiceNo === r.doc.no).reduce((a, b) => a + b.amount, 0), 0);
    // TDS set on the invoice and TDS recorded on its receipt are the same withholding — count it once.
    const balance = Math.max(0, Math.round((totals.total - Math.max(totals.tds, tdsReceived) - paid - credited) * 100) / 100);
    let stage: InvoiceStage;
    if (r.doc.cancelled) stage = "cancelled";
    else if (r.doc.state === "pending") stage = "approval";
    else if (returned >= totals.total - 0.005) stage = "returned";
    else if (returned > 0) stage = "partReturned";
    else if (balance <= 0.005) stage = "paid";
    else if (paid > 0) stage = "partPaid";
    else stage = "notPaid";
    const overdueDays = stage !== "cancelled" && r.doc.state === "approved" && balance > 0.005 && r.doc.due ? Math.max(0, daysBetween(r.doc.due, TODAY)) : 0;
    return { ...r, totals, total: totals.total, receivable: totals.receivable, paid, paidAtSave, pendingPaid, tdsReceived, returned, credited, balance, stage, overdueDays };
  });
}

export const INVOICE_LABEL: Record<InvoiceStage, string> = {
  approval: "Pending approval",
  notPaid: "Not paid",
  partPaid: "Partly paid",
  paid: "Paid",
  partReturned: "Partly returned",
  returned: "Returned",
  cancelled: "Cancelled",
};
export const invoiceTone = (v: InvoiceView): Tone =>
  v.stage === "approval" ? "pending" : v.overdueDays > 0 ? "danger" : v.stage === "paid" ? "positive" : v.stage === "partPaid" || v.stage === "partReturned" ? "partial" : "neutral";

// ── Hooks ───────────────────────────────────────────────────────────────────

export function useSales() {
  const orders = useStore(ordersStore);
  const estimates = useStore(estimatesStore);
  const receipts = useStore(receiptsStore);
  const credits = useStore(creditsStore);
  const invoices = React.useMemo(() => invoiceViews(orders, receipts, credits), [orders, receipts, credits]);
  const deliveries = React.useMemo(() => docsOf(orders, "delivery"), [orders]);
  return { orders, estimates, receipts, credits, invoices, deliveries };
}

// ── Actions ─────────────────────────────────────────────────────────────────

export function stamp() {
  const d = new Date();
  return `${fmtShort(TODAY)}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
export const ev = (what: string): HistoryEvent => ({ id: `h${Date.now()}${Math.random()}`, whoId: ME.id, when: stamp(), what });

export function nextNo(prefix: string, existing: string[], pad = 4) {
  const n = Math.max(0, ...existing.filter((x) => x.startsWith(prefix)).map((x) => Number(x.replace(/\D/g, ""))));
  return `${prefix}${String(n + 1).padStart(pad, "0")}`;
}

const allDocNos = () => ordersStore.get().flatMap((o) => o.docs.map((d) => d.no));

export function updateOrder(no: string, fn: (o: Order) => Order) {
  ordersStore.set((os) => os.map((o) => (o.no === no ? fn(o) : o)));
}
export function updateChildDoc(orderNo: string, docNo: string, fn: (d: ChildDoc) => ChildDoc, what?: string) {
  updateOrder(orderNo, (o) => ({ ...o, docs: o.docs.map((d) => (d.no === docNo ? fn(d) : d)), history: what ? [...o.history, ev(what)] : o.history }));
}

/** Approving a delivery or invoice is what makes it COUNT on its order. */
export function approveChildDoc(orderNo: string, docNo: string) {
  updateOrder(orderNo, (o) => {
    const d = o.docs.find((x) => x.no === docNo);
    if (!d || d.state !== "pending") return o;
    return {
      ...o,
      lines: o.lines.map((l) => {
        const q = d.lines.filter((x) => x.lineId === l.id).reduce((s, x) => s + x.qty, 0);
        return d.kind === "delivery" ? { ...l, delivered: l.delivered + q } : { ...l, invoiced: l.invoiced + q };
      }),
      docs: o.docs.map((x) => (x.no === docNo ? { ...x, state: "approved" as const, approverId: undefined } : x)),
      history: [...o.history, ev(`approved ${docNo}`)],
    };
  });
}

/** Cancelling reverses what approval counted: stock (delivery) or billing (invoice). */
export function cancelChildDoc(orderNo: string, docNo: string, reason: string) {
  updateOrder(orderNo, (o) => {
    const d = o.docs.find((x) => x.no === docNo);
    if (!d) return o;
    const counted = d.state === "approved";
    return {
      ...o,
      lines: counted
        ? o.lines.map((l) => {
            const q = d.lines.filter((x) => x.lineId === l.id).reduce((s, x) => s + x.qty, 0);
            return d.kind === "delivery" ? { ...l, delivered: Math.max(0, l.delivered - q) } : { ...l, invoiced: Math.max(0, l.invoiced - q) };
          })
        : o.lines,
      docs: o.docs.map((x) => (x.no === docNo ? { ...x, cancelled: { reason, on: TODAY } } : x)),
      history: [...o.history, ev(`cancelled ${docNo} — “${reason}”`)],
    };
  });
}

export function deleteChildDoc(orderNo: string, docNo: string) {
  updateOrder(orderNo, (o) => {
    const d = o.docs.find((x) => x.no === docNo);
    const counted = !!d && d.state === "approved" && !d.cancelled;
    return { ...o, lines: counted ? o.lines.map((l) => countOn(l, d!, -1)) : o.lines, docs: o.docs.filter((x) => x.no !== docNo), history: [...o.history, ev(`deleted ${docNo}`)] };
  });
}

/**
 * An invoice raised with no order. It is stored on a hidden order container so
 * payments, returns and every rollup read the same shape as an order invoice.
 */
export function addDirectInvoice(o: Omit<Order, "id" | "no">, doc: Omit<ChildDoc, "id" | "no" | "lines">) {
  const no = nextNo("INV-", allDocNos());
  const holder = `DIR-${no}`;
  ordersStore.set((os) => [
    {
      ...o,
      id: holder,
      no: holder,
      direct: true,
      lines: o.lines.map((l) => ({ ...l, delivered: l.qty, invoiced: doc.state === "approved" ? l.qty : 0 })),
      docs: [{ ...doc, id: `D-${no}`, no, lines: o.lines.map((l) => ({ lineId: l.id, qty: l.qty })) }],
      history: [...o.history, ev(`raised ${no} with no order`)],
    },
    ...os,
  ]);
  return no;
}

export function addReceipt(r: Omit<Receipt, "id" | "no" | "history" | "created" | "audit" | "comments">) {
  const no = nextNo("RCP-", receiptsStore.get().map((x) => x.no));
  receiptsStore.set((rs) => [{ ...r, id: no, no, comments: [], audit: [], created: { byId: ME.id, on: TODAY }, history: [ev(`recorded the receipt${r.allocations.length ? ` — ${r.allocations.map((a) => a.invoiceNo).join(", ")}` : " as an advance"}`)] }, ...rs]);
  return no;
}
export const updateReceipt = (no: string, fn: (r: Receipt) => Receipt, what?: string) =>
  receiptsStore.set((rs) => rs.map((r) => (r.no === no ? { ...fn(r), history: what ? [...r.history, ev(what)] : fn(r).history } : r)));
export const postReceipt = (no: string, ledger: string) => updateReceipt(no, (r) => ({ ...r, posted: true, depositTo: ledger }), `deposited it to ${ledger.split(" · ")[0]}`);
export const approveReceipt = (no: string) => updateReceipt(no, (r) => ({ ...r, state: "approved" }), "approved it");
export const cancelReceipt = (no: string, reason: string) => updateReceipt(no, (r) => ({ ...r, cancelled: { reason, on: TODAY } }), `cancelled it — “${reason}”`);
export const deleteReceipt = (no: string) => receiptsStore.set((rs) => rs.filter((r) => r.no !== no));

export function addCredit(c: Omit<CreditMemo, "id" | "no" | "history" | "created" | "audit" | "comments">) {
  const no = nextNo("CN-", creditsStore.get().map((x) => x.no));
  creditsStore.set((cs) => [{ ...c, id: no, no, comments: [], audit: [], created: { byId: ME.id, on: TODAY }, history: [ev(`raised the return against ${c.invoiceNo}`)] }, ...cs]);
  return no;
}
export const updateCredit = (no: string, fn: (c: CreditMemo) => CreditMemo, what?: string) =>
  creditsStore.set((cs) => cs.map((c) => (c.no === no ? { ...fn(c), history: what ? [...c.history, ev(what)] : fn(c).history } : c)));
export const approveCredit = (no: string) => updateCredit(no, (c) => ({ ...c, state: "approved", approverId: null }), "approved it — the customer is credited");
export const applyCredit = (no: string, invoiceNo: string, amount: number) =>
  updateCredit(no, (c) => ({ ...c, applications: [...c.applications, { invoiceNo, amount }] }), `applied ${amount.toLocaleString("en-US")} to ${invoiceNo}`);
export const refundCredit = (no: string, amount: number) => updateCredit(no, (c) => ({ ...c, refunded: c.refunded + amount }), `refunded ${amount.toLocaleString("en-US")}`);
export const cancelCredit = (no: string, reason: string) => updateCredit(no, (c) => ({ ...c, cancelled: { reason, on: TODAY } }), `cancelled it — “${reason}”`);
export const deleteCredit = (no: string) => creditsStore.set((cs) => cs.filter((c) => c.no !== no));

export function updateEstimate(no: string, fn: (e: Estimate) => Estimate, what?: string) {
  estimatesStore.set((es) => es.map((e) => (e.no === no ? { ...fn(e), history: what ? [...e.history, ev(what)] : fn(e).history } : e)));
}
export function addEstimate(e: Omit<Estimate, "id" | "no" | "history" | "comments" | "created" | "audit">) {
  const no = nextNo("EST-", estimatesStore.get().map((x) => x.no));
  estimatesStore.set((es) => [{ ...e, id: no, no, comments: [], audit: [], created: { byId: ME.id, on: TODAY }, history: [ev("created the estimate")] }, ...es]);
  return no;
}
export const deleteEstimate = (no: string) => estimatesStore.set((es) => es.filter((e) => e.no !== no));

export const estimateNeedsMe = (e: Estimate) => e.approval.state === "pending" && e.approval.approverId === ME.id && !e.cancelled;

// ── Lifecycle — approve · send back · move · cancel · delete · notes ─────────

/** What a document's status chip says, for anything with a state, a rejection and a cancellation. */
export function docStatus(d: { state: "approved" | "pending"; rejected?: { reason: string } | null; cancelled?: { reason: string } | null }, approvedLabel = "Approved"): { label: string; tone: Tone } {
  if (d.cancelled) return { label: "Cancelled", tone: "neutral" };
  if (d.rejected) return { label: "Rejected", tone: "danger" };
  if (d.state === "pending") return { label: "Awaiting approval", tone: "pending" };
  return { label: approvedLabel, tone: "positive" };
}

const note = (n: Omit<Comment, "id" | "authorId" | "when">): Comment => ({ ...n, id: `c${Date.now()}`, authorId: ME.id, when: stamp() });
const file = (name: string): Attachment => ({ name, size: "212 KB", byId: ME.id, on: stamp() });

export const approveOrder = (no: string) => updateOrder(no, (o) => ({ ...o, approval: { state: "approved", byId: ME.id, on: TODAY }, history: [...o.history, ev("approved it")] }));
export const rejectOrder = (no: string, reason: string) =>
  updateOrder(no, (o) => ({ ...o, approval: { state: "rejected", byId: ME.id, on: TODAY, reason }, history: [...o.history, ev(`sent it back — “${reason}”`)] }));
export const moveOrder = (no: string, to: string) =>
  updateOrder(no, (o) => ({ ...o, approval: { state: "pending", stateName: to, approverId: "EMP-118", since: TODAY }, history: [...o.history, ev(`moved it to ${to}`)] }));
export const closeOrder = (no: string) => updateOrder(no, (o) => ({ ...o, closed: true, history: [...o.history, ev("closed the order")] }));
export const cancelOrder = (no: string, reason: string) => updateOrder(no, (o) => ({ ...o, cancelled: { reason, on: TODAY }, history: [...o.history, ev(`cancelled the order — “${reason}”`)] }));
export const deleteOrder = (no: string) => ordersStore.set((os) => os.filter((o) => o.no !== no));
export const noteOrder = (no: string, n: Omit<Comment, "id" | "authorId" | "when">) => updateOrder(no, (o) => ({ ...o, comments: [...o.comments, note(n)] }));
export const attachOrder = (no: string) => updateOrder(no, (o) => ({ ...o, attachments: [...o.attachments, file(`scan-${o.attachments.length + 1}.pdf`)] }));

/** A new delivery or invoice on an order. Approved ones count at once; pending ones wait. */
export function addChildDoc(orderNo: string, d: Omit<ChildDoc, "id" | "no">) {
  const no = nextNo(d.kind === "delivery" ? "DN-" : "INV-", allDocNos());
  updateOrder(orderNo, (o) => ({
    ...o,
    lines: d.state === "approved" ? o.lines.map((l) => countOn(l, d, 1)) : o.lines,
    docs: [...o.docs, { ...d, id: `D-${no}`, no }],
    history: [...o.history, ev(`${d.kind === "delivery" ? "delivered" : "invoiced"} ${no}${d.state === "pending" ? " — awaiting approval" : ""}`)],
  }));
  return no;
}
const countOn = (l: OrderLine, d: Pick<ChildDoc, "kind" | "lines">, sign: 1 | -1): OrderLine => {
  const q = d.lines.filter((x) => x.lineId === l.id).reduce((s, x) => s + x.qty, 0) * sign;
  return d.kind === "delivery" ? { ...l, delivered: Math.max(0, l.delivered + q) } : { ...l, invoiced: Math.max(0, l.invoiced + q) };
};

/** Editing a delivery or invoice: undo what the old version counted, count the new one. */
export function replaceChildDoc(orderNo: string, docNo: string, next: Partial<ChildDoc>) {
  updateOrder(orderNo, (o) => {
    const old = o.docs.find((x) => x.no === docNo);
    if (!old) return o;
    const merged = { ...old, ...next, rejected: undefined };
    let lines = old.state === "approved" ? o.lines.map((l) => countOn(l, old, -1)) : o.lines;
    if (merged.state === "approved") lines = lines.map((l) => countOn(l, merged, 1));
    return { ...o, lines, docs: o.docs.map((x) => (x.no === docNo ? merged : x)), history: [...o.history, ev(`edited ${docNo}`)] };
  });
}
export const rejectChildDoc = (orderNo: string, docNo: string, reason: string) =>
  updateChildDoc(orderNo, docNo, (d) => ({ ...d, rejected: { reason, byId: ME.id, on: TODAY }, approverId: undefined }), `sent ${docNo} back — “${reason}”`);
export const noteChildDoc = (orderNo: string, docNo: string, n: Omit<Comment, "id" | "authorId" | "when">) => updateChildDoc(orderNo, docNo, (d) => ({ ...d, comments: [...(d.comments ?? []), note(n)] }));
export const attachChildDoc = (orderNo: string, docNo: string) => updateChildDoc(orderNo, docNo, (d) => ({ ...d, attachments: [...(d.attachments ?? []), file(`${docNo.toLowerCase()}-signed.pdf`)] }));

export const replaceReceipt = (no: string, r: Partial<Receipt>) => updateReceipt(no, (x) => ({ ...x, ...r, rejected: undefined }), "edited it");
export const rejectReceipt = (no: string, reason: string) => updateReceipt(no, (r) => ({ ...r, rejected: { reason, byId: ME.id, on: TODAY } }), `sent it back — “${reason}”`);
export const noteReceipt = (no: string, n: Omit<Comment, "id" | "authorId" | "when">) => updateReceipt(no, (r) => ({ ...r, comments: [...r.comments, note(n)] }));
export const attachReceipt = (no: string) => updateReceipt(no, (r) => ({ ...r, attachments: [...r.attachments, file(`${no.toLowerCase()}-slip.jpg`)] }));

export const replaceCredit = (no: string, c: Partial<CreditMemo>) => updateCredit(no, (x) => ({ ...x, ...c, rejected: undefined }), "edited it");
export const rejectCredit = (no: string, reason: string) => updateCredit(no, (c) => ({ ...c, rejected: { reason, byId: ME.id, on: TODAY }, approverId: null }), `sent it back — “${reason}”`);
export const noteCredit = (no: string, n: Omit<Comment, "id" | "authorId" | "when">) => updateCredit(no, (c) => ({ ...c, comments: [...c.comments, note(n)] }));
export const attachCredit = (no: string) => updateCredit(no, (c) => ({ ...c, attachments: [...c.attachments, file(`${no.toLowerCase()}-photos.jpg`)] }));

export const approveEstimate = (no: string) => updateEstimate(no, (e) => ({ ...e, approval: { state: "approved", byId: ME.id, on: TODAY } }), "approved it");
export const rejectEstimate = (no: string, reason: string) => updateEstimate(no, (e) => ({ ...e, approval: { state: "rejected", byId: ME.id, on: TODAY, reason } }), `sent it back — “${reason}”`);
export const moveEstimate = (no: string, to: string) => updateEstimate(no, (e) => ({ ...e, approval: { state: "pending", stateName: to, approverId: "EMP-118", since: TODAY } }), `moved it to ${to}`);
export const cancelEstimate = (no: string, reason: string) => updateEstimate(no, (e) => ({ ...e, cancelled: { reason, on: TODAY } }), `cancelled it — “${reason}”`);
export const noteEstimate = (no: string, n: Omit<Comment, "id" | "authorId" | "when">) => updateEstimate(no, (e) => ({ ...e, comments: [...e.comments, note(n)] }));
export const attachEstimate = (no: string) => updateEstimate(no, (e) => ({ ...e, attachments: [...e.attachments, file(`${no.toLowerCase()}-brief.pdf`)] }));

/**
 * What an order offers an invoice, line by line: the quantity to start from,
 * the cap while billing only what is delivered, and the cap when billing
 * everything ordered. `docNo` is the invoice being EDITED — what it already
 * holds is added back, so it can be kept or changed.
 */
export function billableLines(o: Order, docNo?: string): BillLine[] {
  const existing = docNo ? o.docs.find((d) => d.no === docNo) : undefined;
  const mine = (l: OrderLine) => existing?.lines.filter((x) => x.lineId === l.id).reduce((s, x) => s + x.qty, 0) ?? 0;
  const counted = existing?.state === "approved";
  return o.lines
    .map((line) => {
      const back = counted ? mine(line) : 0;
      const pend = pendingOn(o, line, "invoice", docNo);
      return {
        line,
        qty: existing ? mine(line) : Math.max(0, readyToInvoice(line) - pend),
        ready: Math.max(0, readyToInvoice(line) + back - pend),
        all: Math.max(0, remainingToInvoice(line) + back - pend),
        delivered: Math.min(line.delivered, line.qty),
        billed: Math.min(line.invoiced, line.qty),
      };
    })
    .filter((b) => b.all > 0 || b.qty > 0);
}

// ── Links ───────────────────────────────────────────────────────────────────

export const SECTIONS = [
  { key: "estimates", label: "Estimates", prefix: "EST-" },
  { key: "orders", label: "Orders", prefix: "SO-" },
  { key: "deliveries", label: "Deliveries", prefix: "DN-" },
  { key: "invoices", label: "Invoices", prefix: "INV-" },
  { key: "receipts", label: "Receipts", prefix: "RCP-" },
  { key: "returns", label: "Returns", prefix: "CN-" },
] as const;
export type SectionKey = (typeof SECTIONS)[number]["key"];

export function hrefFor(no: string) {
  const s = SECTIONS.find((x) => no.startsWith(x.prefix));
  return s ? `/design/sales/${s.key}/${no}` : "#";
}

/** Every document linked to `no`, in both directions — the Related records section. */
export type RelatedRow = { no: string; kind: string; date: string; party: string; status: string; tone: Tone };
export function relatedFor(no: string, data: ReturnType<typeof useSales>): RelatedRow[] {
  const { orders, estimates, receipts, credits, invoices } = data;
  const rows: RelatedRow[] = [];
  const party = (id: string) => customerById(id)?.name ?? "";
  const pushOrder = (o: Order) => !o.direct && rows.push({ no: o.no, kind: "Sales order", date: o.date, party: party(o.customerId), status: stageLabel(o), tone: STAGE_TONE[stageOfSafe(o)] });
  const pushDoc = (o: Order, d: ChildDoc) => {
    const v = invoices.find((x) => x.doc.no === d.no);
    rows.push({ no: d.no, kind: d.kind === "delivery" ? "Delivery" : "Invoice", date: d.date, party: party(o.customerId), status: d.cancelled ? "Cancelled" : d.state === "pending" ? "Pending approval" : v ? INVOICE_LABEL[v.stage] : "Approved", tone: d.cancelled ? "neutral" : d.state === "pending" ? "pending" : v ? invoiceTone(v) : "positive" });
  };
  const e = estimates.find((x) => x.no === no);
  const o = orders.find((x) => x.no === no) ?? orders.find((x) => x.docs.some((d) => d.no === no));
  if (e) {
    if (e.opportunity) rows.push({ no: e.opportunity, kind: "Opportunity", date: e.date, party: party(e.customerId), status: "Won", tone: "positive" });
    ordersFrom(orders, e).forEach(pushOrder);
  }
  if (o) {
    if (o.source) rows.push({ no: o.source.no, kind: o.source.kind, date: o.date, party: party(o.customerId), status: "Converted", tone: "neutral" });
    if (o.no !== no) pushOrder(o);
    o.docs.filter((d) => d.no !== no).forEach((d) => pushDoc(o, d));
    const invNos = o.docs.filter((d) => d.kind === "invoice").map((d) => d.no);
    receipts.filter((r) => r.no !== no && r.allocations.some((a) => invNos.includes(a.invoiceNo))).forEach((r) => rows.push({ no: r.no, kind: "Receipt", date: r.date, party: party(r.customerId), status: r.state === "pending" ? "Pending approval" : r.posted ? "Posted" : "Undeposited", tone: r.state === "pending" ? "pending" : r.posted ? "positive" : "partial" }));
    credits.filter((c) => c.no !== no && invNos.includes(c.invoiceNo)).forEach((c) => rows.push({ no: c.no, kind: "Return", date: c.date, party: party(c.customerId), status: c.state === "pending" ? "Pending approval" : "Approved", tone: c.state === "pending" ? "pending" : "positive" }));
  }
  const r = receipts.find((x) => x.no === no);
  if (r) r.allocations.forEach((a) => { const ov = orders.find((x) => x.docs.some((d) => d.no === a.invoiceNo)); if (ov) { pushDoc(ov, ov.docs.find((d) => d.no === a.invoiceNo)!); pushOrder(ov); } });
  const c = credits.find((x) => x.no === no);
  if (c) { const ov = orders.find((x) => x.no === c.orderNo); if (ov) { pushDoc(ov, ov.docs.find((d) => d.no === c.invoiceNo)!); pushOrder(ov); } }
  const seen = new Set<string>();
  return rows.filter((x) => (seen.has(x.no) ? false : (seen.add(x.no), true))).sort((a, b) => a.date.localeCompare(b.date));
}
import { stageOf as stageOfSafe } from "./orders";

/**
 * The six desks as ONE module. Each count is the work waiting there, so the
 * switcher doubles as the flow's to-do list: a number is never decoration.
 */
export function SalesNav({ current }: { current: SectionKey }) {
  const { orders, estimates, receipts, credits, invoices, deliveries } = useSales();
  const counts: Record<SectionKey, { n: number; danger?: boolean; title: string }> = {
    estimates: { n: estimates.filter(estimateNeedsMe).length, title: "Waiting on your approval" },
    orders: { n: orders.filter((o) => !o.direct && needsMyApproval(o)).length, title: "Waiting on your approval" },
    deliveries: { n: deliveries.filter((d) => !d.doc.cancelled && d.doc.state === "pending" && d.doc.approverId === ME.id).length, title: "Waiting on your approval" },
    invoices: { n: invoices.filter((v) => v.overdueDays > 0).length, danger: true, title: "Overdue" },
    receipts: { n: receipts.filter((r) => r.state === "approved" && !r.posted && !r.cancelled).length, title: "Undeposited" },
    returns: { n: credits.filter((c) => c.state === "pending" && c.approverId === ME.id && !c.cancelled).length, title: "Waiting on your approval" },
  };
  return (
    <nav className="-mb-px ml-2 flex h-full min-w-0 items-stretch gap-0.5 overflow-x-auto [scrollbar-width:none]" aria-label="Sales">
      {SECTIONS.map((s) => {
        const on = s.key === current;
        const c = counts[s.key];
        return (
          <Link
            key={s.key}
            to={`/design/sales/${s.key}`}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 px-2.5 text-[12.5px] transition-colors",
              on ? "font-semibold text-bz-text after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:rounded-bz-pill after:bg-bz-fire after:content-['']" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {s.label}
            {c.n > 0 && (
              <span title={c.title} className={cn("min-w-4 rounded-bz-pill px-1 text-center text-[10px] font-semibold leading-4 tabular-nums", c.danger ? "bg-bz-red-soft text-bz-red" : "bg-bz-paper-warm text-bz-text-muted")}>
                {c.n}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export { totalsOf };
