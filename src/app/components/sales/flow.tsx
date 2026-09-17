import * as React from "react";
import { Link } from "react-router";
import { cn } from "../ui/utils";
import {
  Approval,
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
} from "./orders";
import { createStore, ordersStore, useStore } from "./store";
import type { Tone } from "./bzw";

// ════════════════════════════════════════════════════════════════════════════
// THE SALES FLOW — estimate → order → delivery → invoice → receipt → return
//
// Every document here is a thin record plus LINKS; everything a screen shows
// about where a document stands is DERIVED from the documents downstream of
// it, the way bizak-app derives it (DocumentStatusServiceImpl):
//
//   estimate  "Ordered" is a live ORDER with REF_TYPE = estimate — never a
//             stored flag. One estimate can be ordered in parts.
//   delivery  CHALLAN. Stock moves only when it is APPROVED.
//   invoice   Paid = Σ receipt lines (approved receipts only). Returned = Σ
//             approved credit memos against it. Returned outranks Paid.
//   receipt   PAYMENT_FORM + CUSTOMER_PAYMENT_BILL_DETAIL allocations. Cash and
//             cheque sit "Undeposited" until they are posted to a bank.
//   return    CREDIT_MEMO with REF_INVOICE_ID — restocks only because it is
//             linked to an invoice; its credit is APPLIED to invoices.
//
// What Bizak does NOT store is not drawn: no estimate expiry, no customer
// credit balance from over-payment (a receipt must be fully applied), no
// dispatch status on a delivery.
// ════════════════════════════════════════════════════════════════════════════

// ── Estimate ────────────────────────────────────────────────────────────────

export type Estimate = {
  id: string;
  no: string;
  customerId: string;
  date: string;
  expectedClose: string | null;
  repId: string;
  locationId: string;
  termId: string;
  memo: string;
  probability: number;
  lines: OrderLine[];
  approval: Approval;
  closed: { reason: string; on: string } | null;
  cancelled: { reason: string; on: string } | null;
  comments: Comment[];
  history: HistoryEvent[];
};

let seq = 900;
const ln = (itemId: string, qty: number, discountPct = 0, rate?: number): OrderLine => {
  const it = itemById(itemId)!;
  return { id: `EL-${++seq}`, itemId, qty, rate: rate ?? it.rate, discountPct, tax: it.tax, delivered: 0, invoiced: 0 };
};
const ok = (on: string): Approval => ({ state: "approved", byId: "EMP-101", on });
const est = (x: Partial<Estimate> & Pick<Estimate, "no" | "customerId" | "date" | "lines">): Estimate => ({
  id: x.no,
  expectedClose: null,
  repId: "EMP-104",
  locationId: "L-KTM",
  termId: customerById(x.customerId)!.termId,
  memo: "",
  probability: 50,
  approval: ok(x.date),
  closed: null,
  cancelled: null,
  comments: [],
  history: [],
  ...x,
});

export const SEED_ESTIMATES: Estimate[] = [
  est({
    no: "EST-0425", customerId: "C-1088", date: "2026-09-04", expectedClose: "2026-09-15", repId: "EMP-107", probability: 60,
    lines: [ln("I-07", 300, 5), ln("I-08", 1000, 2)],
    memo: "Monsoon restock — dealer asked for the same rebate as last quarter.",
    history: [{ id: "h1", whoId: "EMP-107", when: "Sep 4, 10:12", what: "created the estimate" }],
  }),
  est({
    no: "EST-0423", customerId: "C-2003", date: "2026-09-03", expectedClose: "2026-09-20", repId: "EMP-104", probability: 40,
    approval: { state: "pending", stateName: "Manager review", approverId: "EMP-101", since: "2026-09-03" },
    lines: [ln("I-06", 200, 0, 21.5)],
    memo: "Export pricing, FOB Kakarbhitta.",
    history: [{ id: "h1", whoId: "EMP-104", when: "Sep 3, 15:40", what: "sent it to Manager review" }],
  }),
  est({
    no: "EST-0421", customerId: "C-1072", date: "2026-09-01", expectedClose: "2026-09-12", repId: "EMP-126", probability: 70,
    lines: [ln("I-06", 60, 5), ln("I-05", 20)],
    comments: [{ id: "c1", authorId: "EMP-126", when: "Sep 2, 11:05", body: "They'll confirm after tasting the new Arabica lot." }],
    history: [{ id: "h1", whoId: "EMP-126", when: "Sep 1, 09:30", what: "created the estimate" }],
  }),
  est({
    no: "EST-0419", customerId: "C-1061", date: "2026-08-18", expectedClose: "2026-08-22", repId: "EMP-121", probability: 90,
    lines: [ln("I-09", 25), ln("I-12", 40), ln("I-04", 16)],
    history: [{ id: "h1", whoId: "EMP-121", when: "Aug 20, 11:10", what: "ordered the hardware as SO-1043" }],
  }),
  est({
    no: "EST-0418", customerId: "C-1093", date: "2026-08-29", expectedClose: "2026-09-02", repId: "EMP-121", probability: 100,
    lines: [ln("I-09", 40, 8), ln("I-12", 60), ln("I-04", 24)],
  }),
  est({
    no: "EST-0412", customerId: "C-1029", date: "2026-08-20", expectedClose: "2026-08-24", repId: "EMP-104", probability: 100,
    lines: [ln("I-01", 12), ln("I-02", 4), ln("I-03", 30), ln("I-04", 30)],
  }),
  est({
    no: "EST-0409", customerId: "C-1044", date: "2026-08-10", expectedClose: "2026-08-14", repId: "EMP-126", probability: 0,
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
  open: "In discussion",
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

// ── Delivery & invoice — records that live on their order ───────────────────

export type DocRef = { doc: ChildDoc; order: Order; customer: Customer };

export const docsOf = (orders: Order[], kind: "delivery" | "invoice"): DocRef[] =>
  orders.flatMap((o) => o.docs.filter((d) => d.kind === kind).map((doc) => ({ doc, order: o, customer: customerById(o.customerId)! })));

export const docLines = (r: DocRef) =>
  r.doc.lines.map((x) => ({ ...x, line: r.order.lines.find((l) => l.id === x.lineId)! })).filter((x) => !!x.line);

export const docValue = (r: DocRef) => docLines(r).reduce((s, x) => s + lineNet({ ...x.line, qty: x.qty }), 0);

// ── Receipt ─────────────────────────────────────────────────────────────────

export type PayMode = "Cash" | "Bank transfer" | "Cheque";

export type Receipt = {
  id: string;
  no: string;
  customerId: string;
  date: string;
  mode: PayMode;
  bank: string | null;
  chequeNo: string | null;
  chequeDate: string | null;
  reference: string | null;
  amount: number;
  allocations: { invoiceNo: string; amount: number }[];
  state: "approved" | "pending";
  /** FORM_STATUS "Posted" — false is "Undeposited". */
  posted: boolean;
  byId: string;
  memo: string;
  history: HistoryEvent[];
};

export const BANKS = ["Nabil Bank · 0145-xx-221", "Himalayan Bank · 0192-xx-887", "NIC Asia · 3310-xx-015"];

export const receiptsStore = createStore<Receipt[]>([
  {
    id: "RCP-0417", no: "RCP-0417", customerId: "C-1088", date: "2026-09-03", mode: "Cash", bank: null, chequeNo: null, chequeDate: null, reference: null,
    amount: 100_000, allocations: [{ invoiceNo: "INV-8820", amount: 100_000 }], state: "pending", posted: false, byId: "EMP-107", memo: "Collected at the counter in Pokhara.",
    history: [{ id: "h1", whoId: "EMP-107", when: "Sep 3, 17:20", what: "recorded the receipt — awaiting approval" }],
  },
  {
    id: "RCP-0415", no: "RCP-0415", customerId: "C-1101", date: "2026-08-30", mode: "Cheque", bank: null, chequeNo: "004512", chequeDate: "2026-09-02", reference: null,
    amount: 500_000, allocations: [{ invoiceNo: "INV-8801", amount: 500_000 }], state: "approved", posted: false, byId: "EMP-118", memo: "",
    history: [{ id: "h1", whoId: "EMP-118", when: "Aug 30, 12:00", what: "recorded the cheque" }],
  },
  {
    id: "RCP-0412", no: "RCP-0412", customerId: "C-1061", date: "2026-09-01", mode: "Bank transfer", bank: BANKS[0], chequeNo: null, chequeDate: null, reference: "NB-TT-778120",
    amount: 926_600, allocations: [{ invoiceNo: "INV-8809", amount: 926_600 }], state: "approved", posted: true, byId: "EMP-118", memo: "",
    history: [{ id: "h1", whoId: "EMP-118", when: "Sep 1, 14:12", what: "recorded the transfer" }],
  },
  {
    id: "RCP-0409", no: "RCP-0409", customerId: "C-1029", date: "2026-08-25", mode: "Bank transfer", bank: BANKS[1], chequeNo: null, chequeDate: null, reference: "HB-55120",
    amount: 294_252, allocations: [{ invoiceNo: "INV-8795", amount: 294_252 }], state: "approved", posted: true, byId: "EMP-118", memo: "",
    history: [{ id: "h1", whoId: "EMP-118", when: "Aug 25, 10:40", what: "recorded the transfer" }],
  },
]);

// ── Credit memo (sales return) ──────────────────────────────────────────────

export type CreditMemo = {
  id: string;
  no: string;
  customerId: string;
  invoiceNo: string;
  orderNo: string;
  date: string;
  reason: string;
  lines: { lineId: string; qty: number }[];
  locationId: string;
  state: "approved" | "pending";
  approverId: string | null;
  applications: { invoiceNo: string; amount: number }[];
  byId: string;
  history: HistoryEvent[];
};

export const RETURN_REASONS = ["Damaged in transit", "Wrong item or size", "Excess quantity", "Quality complaint"];

const lineOf = (orderNo: string, i: number) => SEED_ORDERS.find((o) => o.no === orderNo)!.lines[i].id;

export const creditsStore = createStore<CreditMemo[]>([
  {
    id: "CN-0035", no: "CN-0035", customerId: "C-1088", invoiceNo: "INV-8820", orderNo: "SO-1041", date: "2026-09-02", reason: "Wrong item or size",
    lines: [{ lineId: lineOf("SO-1041", 0), qty: 10 }], locationId: "L-PKR", state: "pending", approverId: "EMP-101", applications: [], byId: "EMP-107",
    history: [{ id: "h1", whoId: "EMP-107", when: "Sep 2, 16:30", what: "raised the return — 10 lengths were 90mm, not 110mm" }],
  },
  {
    id: "CN-0031", no: "CN-0031", customerId: "C-1029", invoiceNo: "INV-8795", orderNo: "SO-1039", date: "2026-08-19", reason: "Damaged in transit",
    lines: [{ lineId: lineOf("SO-1039", 0), qty: 2 }], locationId: "L-KTM", state: "approved", approverId: null, applications: [{ invoiceNo: "INV-8795", amount: 41_810 }], byId: "EMP-104",
    history: [{ id: "h1", whoId: "EMP-104", when: "Aug 19, 11:00", what: "returned 2 couplings cracked in transit" }],
  },
]);

export function creditValue(orders: Order[], c: CreditMemo) {
  const o = orders.find((x) => x.no === c.orderNo);
  if (!o) return 0;
  return c.lines.reduce((s, x) => {
    const l = o.lines.find((y) => y.id === x.lineId);
    return l ? s + lineNet({ ...l, qty: x.qty }) : s;
  }, 0);
}
export const creditApplied = (c: CreditMemo) => c.applications.reduce((s, a) => s + a.amount, 0);

// ── Invoice view — the whole money picture, derived ─────────────────────────

export type InvoiceStage = "approval" | "notPaid" | "partPaid" | "paid" | "partReturned" | "returned";

export type InvoiceView = DocRef & {
  total: number;
  paid: number;
  pendingPaid: number;
  returned: number;
  credited: number;
  balance: number;
  stage: InvoiceStage;
  overdueDays: number;
};

export function invoiceViews(orders: Order[], receipts: Receipt[], credits: CreditMemo[]): InvoiceView[] {
  return docsOf(orders, "invoice").map((r) => {
    const total = docValue(r);
    const paid = receipts.filter((x) => x.state === "approved").reduce((s, x) => s + x.allocations.filter((a) => a.invoiceNo === r.doc.no).reduce((a, b) => a + b.amount, 0), 0);
    const pendingPaid = receipts.filter((x) => x.state === "pending").reduce((s, x) => s + x.allocations.filter((a) => a.invoiceNo === r.doc.no).reduce((a, b) => a + b.amount, 0), 0);
    const mine = credits.filter((c) => c.invoiceNo === r.doc.no && c.state === "approved");
    const returned = mine.reduce((s, c) => s + creditValue(orders, c), 0);
    const credited = credits.filter((c) => c.state === "approved").reduce((s, c) => s + c.applications.filter((a) => a.invoiceNo === r.doc.no).reduce((a, b) => a + b.amount, 0), 0);
    const balance = Math.max(0, Math.round((total - paid - credited) * 100) / 100);
    let stage: InvoiceStage;
    if (r.doc.state === "pending") stage = "approval";
    else if (returned >= total - 0.005) stage = "returned";
    else if (returned > 0) stage = "partReturned";
    else if (balance <= 0.005) stage = "paid";
    else if (paid > 0) stage = "partPaid";
    else stage = "notPaid";
    const overdueDays = r.doc.state === "approved" && balance > 0.005 && r.doc.due ? Math.max(0, daysBetween(r.doc.due, TODAY)) : 0;
    return { ...r, total, paid, pendingPaid, returned, credited, balance, stage, overdueDays };
  });
}

export const INVOICE_LABEL: Record<InvoiceStage, string> = {
  approval: "Pending approval",
  notPaid: "Not paid",
  partPaid: "Partly paid",
  paid: "Paid",
  partReturned: "Partly returned",
  returned: "Returned",
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
const ev = (what: string): HistoryEvent => ({ id: `h${Date.now()}${Math.random()}`, whoId: ME.id, when: stamp(), what });

/** Approving a delivery or invoice is what makes it COUNT on its order. */
export function approveChildDoc(orderNo: string, docNo: string) {
  ordersStore.set((os) =>
    os.map((o) => {
      if (o.no !== orderNo) return o;
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
    }),
  );
}

export function nextNo(prefix: string, existing: string[], pad = 4) {
  const n = Math.max(0, ...existing.filter((x) => x.startsWith(prefix)).map((x) => Number(x.replace(/\D/g, ""))));
  return `${prefix}${String(n + 1).padStart(pad, "0")}`;
}

export function addReceipt(r: Omit<Receipt, "id" | "no" | "history">) {
  const no = nextNo("RCP-", receiptsStore.get().map((x) => x.no));
  receiptsStore.set((rs) => [{ ...r, id: no, no, history: [ev(`recorded the receipt — ${r.allocations.map((a) => a.invoiceNo).join(", ")}`)] }, ...rs]);
  return no;
}

export function postReceipt(no: string, bank: string) {
  receiptsStore.set((rs) => rs.map((r) => (r.no === no ? { ...r, posted: true, bank, history: [...r.history, ev(`deposited it to ${bank.split(" · ")[0]}`)] } : r)));
}

export function approveReceipt(no: string) {
  receiptsStore.set((rs) => rs.map((r) => (r.no === no ? { ...r, state: "approved", history: [...r.history, ev("approved it")] } : r)));
}

export function addCredit(c: Omit<CreditMemo, "id" | "no" | "history">) {
  const no = nextNo("CN-", creditsStore.get().map((x) => x.no));
  creditsStore.set((cs) => [{ ...c, id: no, no, history: [ev(`raised the return against ${c.invoiceNo}`)] }, ...cs]);
  return no;
}

export function approveCredit(no: string) {
  creditsStore.set((cs) => cs.map((c) => (c.no === no ? { ...c, state: "approved", approverId: null, history: [...c.history, ev("approved it — stock returned")] } : c)));
}

export function applyCredit(no: string, invoiceNo: string, amount: number) {
  creditsStore.set((cs) =>
    cs.map((c) => (c.no === no ? { ...c, applications: [...c.applications, { invoiceNo, amount }], history: [...c.history, ev(`applied ${amount.toLocaleString("en-US")} to ${invoiceNo}`)] } : c)),
  );
}

export function updateEstimate(no: string, fn: (e: Estimate) => Estimate, what?: string) {
  estimatesStore.set((es) => es.map((e) => (e.no === no ? { ...fn(e), history: what ? [...e.history, ev(what)] : fn(e).history } : e)));
}

export function addEstimate(e: Omit<Estimate, "id" | "no" | "history" | "comments">) {
  const no = nextNo("EST-", estimatesStore.get().map((x) => x.no));
  estimatesStore.set((es) => [{ ...e, id: no, no, comments: [], history: [ev("created the estimate")] }, ...es]);
  return no;
}

export const estimateNeedsMe = (e: Estimate) => e.approval.state === "pending" && e.approval.approverId === ME.id && !e.cancelled;

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

/**
 * The six desks as ONE module. Each count is the work waiting there, so the
 * switcher doubles as the flow's to-do list: a number is never decoration.
 */
export function SalesNav({ current }: { current: SectionKey }) {
  const { orders, estimates, receipts, credits, invoices, deliveries } = useSales();
  const counts: Record<SectionKey, { n: number; danger?: boolean; title: string }> = {
    estimates: { n: estimates.filter(estimateNeedsMe).length, title: "Waiting on your approval" },
    orders: { n: orders.filter(needsMyApproval).length, title: "Waiting on your approval" },
    deliveries: { n: deliveries.filter((d) => d.doc.state === "pending" && d.doc.approverId === ME.id).length, title: "Waiting on your approval" },
    invoices: { n: invoices.filter((v) => v.overdueDays > 0).length, danger: true, title: "Overdue" },
    receipts: { n: receipts.filter((r) => r.state === "approved" && !r.posted && r.mode !== "Bank transfer").length, title: "Undeposited" },
    returns: { n: credits.filter((c) => c.state === "pending" && c.approverId === ME.id).length, title: "Waiting on your approval" },
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
