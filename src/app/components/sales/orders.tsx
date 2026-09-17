import * as React from "react";
import { cn } from "../ui/utils";
import { NUM, TODAY, daysBetween, fmtShort, addDays, PEOPLE, ME, personById } from "../productivity/shared";
import type { Tone } from "./bzw";

// ════════════════════════════════════════════════════════════════════════════
// SALES ORDERS · KERNEL
//
// The order desk, the order panel, the fulfil sheet and the composer all read
// one order set through the derivations below. Four rules are encoded here so
// no surface can drift from another:
//
//   1. STAGE IS DERIVED, NEVER STORED BY A SCREEN. An order's stage comes from
//      its approval, its lines' delivered / invoiced quantities and its
//      cancelled / closed flags — the same inputs as ORDER.GetDisplayStatus and
//      ORDER_DETAIL.FULFILL_QTY / BILLED_QTY. That is why there is no board to
//      drag orders across: a stage is an outcome of documents, not a place.
//   2. A DOCUMENT IN FLIGHT IS NOT PROGRESS. A delivery or invoice waiting on
//      approval moved no stock and posted no GL, so it never advances the
//      delivered / invoiced figures — it is counted on its own
//      (PENDING_DELIVERY_COUNT / PENDING_INVOICE_COUNT).
//   3. AN INVOICE ALWAYS POINTS AT THE ORDER LINE, even when it is raised right
//      after a delivery. An invoice made FROM a delivery is invisible to every
//      order-side rollup today (bizak-document-status skill), so the UI never
//      offers that shape.
//   4. NOTHING IS INVENTED. Every figure here maps to a stored column; the few
//      that do not yet exist are marked `// needs:` where they are used.
// ════════════════════════════════════════════════════════════════════════════

export { TODAY, NUM, PEOPLE, ME, personById, fmtShort, addDays, daysBetween };

// ── Masters ─────────────────────────────────────────────────────────────────

export type Customer = {
  id: string;
  code: string;
  name: string;
  pan: string;
  address: string;
  termId: string;
  currency: "NPR" | "USD";
  priceLevel: string;
};

export const CUSTOMERS: Customer[] = [
  { id: "C-1029", code: "C-1029", name: "Apex Manufacturing Pvt. Ltd.", pan: "601284573", address: "Balaju Industrial Area, Kathmandu", termId: "T30", currency: "NPR", priceLevel: "Wholesale" },
  { id: "C-1044", code: "C-1044", name: "Tribhuvan Park Stores", pan: "302118904", address: "New Road, Kathmandu", termId: "T15", currency: "NPR", priceLevel: "Retail" },
  { id: "C-1061", code: "C-1061", name: "Everest Retail Pvt. Ltd.", pan: "605550129", address: "Lazimpat, Kathmandu", termId: "T30", currency: "NPR", priceLevel: "Wholesale" },
  { id: "C-1072", code: "C-1072", name: "Himalayan Java", pan: "600981337", address: "Thamel, Kathmandu", termId: "T7", currency: "NPR", priceLevel: "Retail" },
  { id: "C-1088", code: "C-1088", name: "Pokhara Hardware House", pan: "301774620", address: "Chipledhunga, Pokhara", termId: "T30", currency: "NPR", priceLevel: "Dealer" },
  { id: "C-1093", code: "C-1093", name: "Nepal Telecom", pan: "500046287", address: "Bhadrakali Plaza, Kathmandu", termId: "T45", currency: "NPR", priceLevel: "Standard" },
  { id: "C-1101", code: "C-1101", name: "Lumbini Agro Traders", pan: "303310985", address: "Butwal-8, Rupandehi", termId: "T15", currency: "NPR", priceLevel: "Dealer" },
  { id: "C-2003", code: "C-2003", name: "Kailash Exports (India)", pan: "—", address: "Siliguri, West Bengal", termId: "T30", currency: "USD", priceLevel: "Standard" },
];
export const customerById = (id: string | null | undefined) => CUSTOMERS.find((c) => c.id === id);

export type Term = { id: string; name: string; days: number };
export const TERMS: Term[] = [
  { id: "T0", name: "Due on receipt", days: 0 },
  { id: "T7", name: "Net 7", days: 7 },
  { id: "T15", name: "Net 15", days: 15 },
  { id: "T30", name: "Net 30", days: 30 },
  { id: "T45", name: "Net 45", days: 45 },
];
export const termById = (id: string) => TERMS.find((t) => t.id === id);

export type Location = { id: string; name: string };
export const LOCATIONS: Location[] = [
  { id: "L-KTM", name: "Kathmandu WH" },
  { id: "L-PKR", name: "Pokhara depot" },
  { id: "L-BTW", name: "Butwal depot" },
];
export const locationById = (id: string) => LOCATIONS.find((l) => l.id === id);

export type TaxCode = "VAT13" | "EXEMPT";
export const TAX_RATE: Record<TaxCode, number> = { VAT13: 0.13, EXEMPT: 0 };
export const TAX_LABEL: Record<TaxCode, string> = { VAT13: "VAT 13%", EXEMPT: "Exempt" };

export type Item = {
  id: string;
  code: string;
  name: string;
  unit: string;
  rate: number;
  tax: TaxCode;
  /** Lot-tracked items need lots picked on delivery. */
  lotTracked?: boolean;
  /** needs: on-hand by location — the transfer-order line already reads quantity_on_hand. */
  onHand: Record<string, number>;
};

export const ITEMS: Item[] = [
  { id: "I-01", code: "ICP-A220", name: "Industrial Coupling A-220", unit: "pcs", rate: 18_500, tax: "VAT13", onHand: { "L-KTM": 42, "L-PKR": 6, "L-BTW": 0 } },
  { id: "I-02", code: "HP7-2026", name: "Hydraulic Pump HP-7", unit: "pcs", rate: 142_000, tax: "VAT13", lotTracked: true, onHand: { "L-KTM": 3, "L-PKR": 1, "L-BTW": 0 } },
  { id: "I-03", code: "MPS-006", name: "Mounting Plate Set", unit: "pkg", rate: 11_200, tax: "VAT13", onHand: { "L-KTM": 120, "L-PKR": 18, "L-BTW": 40 } },
  { id: "I-04", code: "SVC-INS", name: "Service & Installation", unit: "hrs", rate: 3_800, tax: "EXEMPT", onHand: {} },
  { id: "I-05", code: "NDL-70G", name: "Instant Noodles 70g", unit: "ctn", rate: 1_440, tax: "VAT13", lotTracked: true, onHand: { "L-KTM": 860, "L-PKR": 210, "L-BTW": 390 } },
  { id: "I-06", code: "CFE-ARB1", name: "Arabica Beans 1kg", unit: "bag", rate: 2_950, tax: "VAT13", lotTracked: true, onHand: { "L-KTM": 74, "L-PKR": 0, "L-BTW": 0 } },
  { id: "I-07", code: "PVC-110", name: "PVC Pipe 110mm × 6m", unit: "len", rate: 2_180, tax: "VAT13", onHand: { "L-KTM": 510, "L-PKR": 260, "L-BTW": 140 } },
  { id: "I-08", code: "CEM-OPC", name: "OPC Cement 50kg", unit: "bag", rate: 865, tax: "VAT13", onHand: { "L-KTM": 2_400, "L-PKR": 900, "L-BTW": 1_750 } },
  { id: "I-09", code: "RTR-AX6", name: "Wi-Fi 6 Router AX6", unit: "pcs", rate: 9_900, tax: "VAT13", onHand: { "L-KTM": 64, "L-PKR": 0, "L-BTW": 0 } },
  { id: "I-10", code: "UREA-50", name: "Urea Fertiliser 50kg", unit: "bag", rate: 1_120, tax: "EXEMPT", onHand: { "L-KTM": 0, "L-PKR": 0, "L-BTW": 3_200 } },
  { id: "I-11", code: "SPR-KIT", name: "Pump Seal Spare Kit", unit: "kit", rate: 6_400, tax: "VAT13", onHand: { "L-KTM": 25, "L-PKR": 4, "L-BTW": 0 } },
  { id: "I-12", code: "FBR-24C", name: "Fibre Patch Cable 24-core", unit: "pcs", rate: 4_350, tax: "VAT13", onHand: { "L-KTM": 90, "L-PKR": 0, "L-BTW": 0 } },
];
export const itemById = (id: string) => ITEMS.find((i) => i.id === id);

/** Lots on hand for a lot-tracked item — what the fulfil sheet picks from. */
export const LOTS: Record<string, { lot: string; expiry: string | null; qty: number }[]> = {
  "I-02": [
    { lot: "HP7-2608-A", expiry: null, qty: 2 },
    { lot: "HP7-2609-B", expiry: null, qty: 1 },
  ],
  "I-05": [
    { lot: "NDL-0712", expiry: "2026-10-02", qty: 140 },
    { lot: "NDL-0803", expiry: "2026-11-20", qty: 720 },
  ],
  "I-06": [
    { lot: "ARB-2607", expiry: "2027-01-15", qty: 30 },
    { lot: "ARB-2608", expiry: "2027-02-28", qty: 44 },
  ],
};

// ── The order ───────────────────────────────────────────────────────────────

export type OrderLine = {
  id: string;
  itemId: string;
  description?: string;
  qty: number;
  rate: number;
  discountPct: number;
  tax: TaxCode;
  /** ORDER_DETAIL.FULFILL_QTY — approved deliveries only. */
  delivered: number;
  /** ORDER_DETAIL.BILLED_QTY — approved invoices only. */
  invoiced: number;
};

export type DocState = "approved" | "pending";

export type ChildDoc = {
  id: string;
  kind: "delivery" | "invoice";
  no: string;
  date: string;
  state: DocState;
  byId: string;
  locationId?: string;
  lines: { lineId: string; qty: number }[];
  /** INVOICE.DUE_DATE — from the payment term when the invoice is raised. */
  due?: string;
  /** Who the pending document is waiting on (NEXT_APPROVER). */
  approverId?: string;
  /** CHALLAN.DRIVER / TRUCK_NO. */
  driver?: string;
  truck?: string;
};

export type Approval =
  | { state: "none" }
  | { state: "pending"; stateName: string; approverId: string; since: string }
  | { state: "approved"; byId: string; on: string }
  | { state: "rejected"; byId: string; on: string; reason: string };

export type Comment = { id: string; authorId: string; when: string; body: string };
export type HistoryEvent = { id: string; whoId: string; when: string; what: string };

export type Order = {
  id: string;
  no: string;
  customerId: string;
  date: string;
  expected: string | null;
  locationId: string;
  repId: string | null;
  termId: string;
  customerPo: string | null;
  currency: "NPR" | "USD";
  exchangeRate: number;
  memo: string;
  source: { kind: "Estimate" | "Sales order"; no: string } | null;
  approval: Approval;
  closed: boolean;
  cancelled: { reason: string; on: string } | null;
  lines: OrderLine[];
  docs: ChildDoc[];
  dims: { department?: string; class?: string; project?: string; partner?: string };
  attachments: { name: string; size: string }[];
  comments: Comment[];
  history: HistoryEvent[];
  /** ORDER.BOOKING_AMOUNT / DOWN_PAYMENT_AMOUNT — only shown when non-zero. */
  advance: number;
};

// ── Line and order arithmetic ───────────────────────────────────────────────
// Mirrors OrderServiceImpl.ApplyOrderSummaryAsync: an order has no header
// discount, discount is per line, and tax is charged on the post-discount gross.

export function lineGross(l: Pick<OrderLine, "qty" | "rate" | "discountPct">) {
  return l.qty * l.rate * (1 - (l.discountPct || 0) / 100);
}
export const lineDiscount = (l: Pick<OrderLine, "qty" | "rate" | "discountPct">) => l.qty * l.rate - lineGross(l);
export const lineTax = (l: Pick<OrderLine, "qty" | "rate" | "discountPct" | "tax">) => lineGross(l) * TAX_RATE[l.tax];
export const lineNet = (l: Pick<OrderLine, "qty" | "rate" | "discountPct" | "tax">) => lineGross(l) + lineTax(l);

export function totalsOf(lines: Pick<OrderLine, "qty" | "rate" | "discountPct" | "tax">[]) {
  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const discount = lines.reduce((s, l) => s + lineDiscount(l), 0);
  const tax = lines.reduce((s, l) => s + lineTax(l), 0);
  const taxable = lines.filter((l) => TAX_RATE[l.tax] > 0).reduce((s, l) => s + lineGross(l), 0);
  const total = subtotal - discount + tax;
  return { subtotal, discount, tax, taxable, total };
}

export const orderTotal = (o: Order) => totalsOf(o.lines).total;

/** Quantity-weighted, like ORDER.RecomputeFulfillStatus. */
export function progressOf(o: Order) {
  const qty = o.lines.reduce((s, l) => s + l.qty, 0) || 1;
  const delivered = o.lines.reduce((s, l) => s + Math.min(l.delivered, l.qty), 0);
  const invoiced = o.lines.reduce((s, l) => s + Math.min(l.invoiced, l.qty), 0);
  const invoicedValue = o.lines.reduce((s, l) => s + lineNet({ ...l, qty: Math.min(l.invoiced, l.qty) }), 0);
  const deliveredValue = o.lines.reduce((s, l) => s + lineNet({ ...l, qty: Math.min(l.delivered, l.qty) }), 0);
  return {
    deliveredPct: Math.round((delivered / qty) * 100),
    invoicedPct: Math.round((invoiced / qty) * 100),
    linesOpenToDeliver: o.lines.filter((l) => l.delivered < l.qty).length,
    linesDelivered: o.lines.filter((l) => l.delivered >= l.qty).length,
    deliveredValue,
    invoicedValue,
    pendingDeliveries: o.docs.filter((d) => d.kind === "delivery" && d.state === "pending").length,
    pendingInvoices: o.docs.filter((d) => d.kind === "invoice" && d.state === "pending").length,
  };
}

export const remainingToDeliver = (l: OrderLine) => Math.max(0, l.qty - l.delivered);
/** Default invoicing policy: bill what has been delivered and not yet billed. */
export const readyToInvoice = (l: OrderLine) => Math.max(0, l.delivered - l.invoiced);
export const remainingToInvoice = (l: OrderLine) => Math.max(0, l.qty - l.invoiced);

// ── Stage ───────────────────────────────────────────────────────────────────

export type Stage = "approval" | "rejected" | "deliver" | "delivering" | "invoice" | "complete" | "closed" | "cancelled";

export function stageOf(o: Order): Stage {
  if (o.cancelled) return "cancelled";
  if (o.closed) return "closed";
  if (o.approval.state === "rejected") return "rejected";
  if (o.approval.state === "pending") return "approval";
  const p = progressOf(o);
  if (p.deliveredPct >= 100 && p.invoicedPct >= 100) return "complete";
  if (p.deliveredPct >= 100) return "invoice";
  if (p.deliveredPct > 0) return "delivering";
  return "deliver";
}

export const STAGE_TONE: Record<Stage, Tone> = {
  approval: "pending",
  rejected: "danger",
  deliver: "neutral",
  delivering: "partial",
  invoice: "partial",
  complete: "positive",
  closed: "neutral",
  cancelled: "neutral",
};

/** A workflow state keeps the tenant's own name ("Manager review"). */
export function stageLabel(o: Order) {
  const s = stageOf(o);
  if (s === "approval" && o.approval.state === "pending") return o.approval.stateName;
  return {
    approval: "Pending approval",
    rejected: "Rejected",
    deliver: "To deliver",
    delivering: "Partly delivered",
    invoice: "To invoice",
    complete: "Complete",
    closed: "Closed",
    cancelled: "Cancelled",
  }[s];
}

export const isOpen = (o: Order) => !["complete", "closed", "cancelled"].includes(stageOf(o));

/** Late = promised date passed and something is still undelivered. */
export function isLate(o: Order) {
  if (!o.expected || !isOpen(o) || stageOf(o) === "rejected") return false;
  return daysBetween(TODAY, o.expected) < 0 && progressOf(o).deliveredPct < 100;
}

export const needsMyApproval = (o: Order) =>
  o.approval.state === "pending" && o.approval.approverId === ME.id && !o.cancelled;

// ── The one queue grouping the desk uses ────────────────────────────────────

export type QueueKey = "mine" | "approval" | "deliver" | "delivering" | "invoice" | "rejected" | "complete" | "closed";

export const QUEUES: { key: QueueKey; label: string; defaultCollapsed?: boolean }[] = [
  { key: "mine", label: "Needs your approval" },
  { key: "approval", label: "Waiting for approval" },
  { key: "deliver", label: "To deliver" },
  { key: "delivering", label: "Partly delivered" },
  { key: "invoice", label: "To invoice" },
  { key: "rejected", label: "Rejected" },
  { key: "complete", label: "Complete", defaultCollapsed: true },
  { key: "closed", label: "Closed & cancelled", defaultCollapsed: true },
];

export function queueOf(o: Order): QueueKey {
  const s = stageOf(o);
  if (s === "approval") return needsMyApproval(o) ? "mine" : "approval";
  if (s === "cancelled" || s === "closed") return "closed";
  return s;
}

// ── Formatting ──────────────────────────────────────────────────────────────

export const fmtQty = (n: number) => (Number.isInteger(n) ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { maximumFractionDigits: 2 }));

/** Paisa are real, but they are not what a reader scans — so they sit quieter. */
export function Amount({ value, className, currency }: { value: number; className?: string; currency?: string }) {
  const [int, dec] = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split(".");
  return (
    <span className={cn("whitespace-nowrap", NUM, className)}>
      {currency && <span className="mr-1 text-[0.72em] font-medium text-bz-text-soft">{currency}</span>}
      {int}
      <span className="text-bz-text-soft">.{dec}</span>
    </span>
  );
}

export function relDay(iso: string) {
  const d = daysBetween(TODAY, iso);
  if (d === 0) return "Today";
  if (d === -1) return "Yesterday";
  if (d === 1) return "Tomorrow";
  return fmtShort(iso);
}

/** The expected-delivery read: late is the only state that earns colour. */
export function ExpectedMark({ o, quiet }: { o: Order; quiet?: boolean }) {
  if (!o.expected) return <span className="text-[11.5px] text-bz-text-soft">—</span>;
  if (isLate(o)) {
    const late = -daysBetween(TODAY, o.expected);
    return (
      <span className={cn("text-[11.5px] font-semibold text-bz-red", NUM)} title={`Expected ${fmtShort(o.expected)}`}>
        {late}d late
      </span>
    );
  }
  return (
    <span className={cn("text-[11.5px]", quiet || !isOpen(o) ? "text-bz-text-soft" : "text-bz-text-muted", NUM)}>
      {relDay(o.expected)}
    </span>
  );
}

/**
 * Delivered and invoiced as ONE mark: the track is the order, the leaf fill is
 * what left the warehouse, and the ink underline is what has been billed.
 * Two numbers, one glance — instead of two chips that read like a sentence.
 */
export function JourneyMark({ o, width = 64 }: { o: Order; width?: number }) {
  const p = progressOf(o);
  const s = stageOf(o);
  if (s === "approval" || s === "rejected" || s === "cancelled") {
    return <span className="inline-block h-1.5 rounded-bz-pill bg-bz-line-soft" style={{ width }} />;
  }
  return (
    <span
      className="inline-flex flex-col gap-[2px]"
      style={{ width }}
      title={`Delivered ${p.deliveredPct}% · Invoiced ${p.invoicedPct}%${p.pendingDeliveries ? ` · ${p.pendingDeliveries} delivery awaiting approval` : ""}`}
    >
      <span className="block h-1.5 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
        <span className="block h-full rounded-bz-pill bg-bz-leaf-deep" style={{ width: `${p.deliveredPct}%` }} />
      </span>
      <span className="block h-[2px] w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
        <span className="block h-full rounded-bz-pill bg-bz-text-muted" style={{ width: `${p.invoicedPct}%` }} />
      </span>
    </span>
  );
}

export function useMedia(query: string) {
  const get = () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  const [m, setM] = React.useState(get);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}

/** Keyboard shortcuts that never fire while the reader is typing. */
export function useKeys(map: Record<string, (e: KeyboardEvent) => void>, enabled = true) {
  const ref = React.useRef(map);
  ref.current = map;
  React.useEffect(() => {
    if (!enabled) return;
    const on = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable);
      const combo = `${e.metaKey || e.ctrlKey ? "mod+" : ""}${e.key.toLowerCase()}`;
      const fn = ref.current[combo];
      if (!fn) return;
      if (typing && !combo.startsWith("mod+") && combo !== "escape") return;
      fn(e);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [enabled]);
}

// ════════════════════════════════════════════════════════════════════════════
// SEED
// ════════════════════════════════════════════════════════════════════════════

let lineSeq = 0;
const L = (itemId: string, qty: number, delivered = 0, invoiced = 0, discountPct = 0, rate?: number): OrderLine => {
  const it = itemById(itemId)!;
  return { id: `LN-${++lineSeq}`, itemId, qty, rate: rate ?? it.rate, discountPct, tax: it.tax, delivered, invoiced };
};

const approved = (byId: string, on: string): Approval => ({ state: "approved", byId, on });

/** Seed documents name their lines by position ("#0", "#1") and are resolved to real ids here. */
function order(x: Partial<Order> & Pick<Order, "no" | "customerId" | "date" | "lines">): Order {
  const c = customerById(x.customerId)!;
  const docs = (x.docs ?? []).map((d) => ({
    ...d,
    lines: d.lines.map((y) => (y.lineId.startsWith("#") ? { ...y, lineId: x.lines[Number(y.lineId.slice(1))].id } : y)),
  }));
  return {
    id: x.no,
    expected: null,
    locationId: "L-KTM",
    repId: "EMP-104",
    termId: c.termId,
    customerPo: null,
    currency: c.currency,
    exchangeRate: c.currency === "USD" ? 133.42 : 1,
    memo: "",
    source: null,
    approval: approved("EMP-101", x.date),
    closed: false,
    cancelled: null,
    docs: [],
    dims: {},
    attachments: [],
    comments: [],
    history: [],
    advance: 0,
    ...x,
    docs,
  };
}

export const SEED_ORDERS: Order[] = [
  // ── Needs my approval ────────────────────────────────────────────────────
  order({
    no: "SO-1052", customerId: "C-1088", date: "2026-09-03", expected: "2026-09-10", locationId: "L-PKR", repId: "EMP-107",
    customerPo: "PHH/PO/2083-114",
    approval: { state: "pending", stateName: "Manager review", approverId: "EMP-101", since: "2026-09-03" },
    lines: [L("I-07", 120, 0, 0, 5), L("I-08", 400, 0, 0, 3), L("I-03", 20)],
    memo: "Dealer rebate agreed on phone — 5% on pipe, 3% on cement.",
    comments: [
      { id: "c1", authorId: "EMP-107", when: "Sep 3, 16:12", body: "Discounts are above the dealer grid — needs your OK before Pokhara can load the truck." },
    ],
    history: [
      { id: "h1", whoId: "EMP-107", when: "Sep 3, 16:08", what: "created the order" },
      { id: "h2", whoId: "EMP-107", when: "Sep 3, 16:09", what: "sent it to Manager review" },
    ],
  }),
  order({
    no: "SO-1051", customerId: "C-1093", date: "2026-09-02", expected: "2026-09-18", repId: "EMP-121",
    approval: { state: "pending", stateName: "Manager review", approverId: "EMP-101", since: "2026-09-02" },
    lines: [L("I-09", 40, 0, 0, 8), L("I-12", 60), L("I-04", 24)],
    source: { kind: "Estimate", no: "EST-0418" },
    attachments: [{ name: "NTC-tender-award.pdf", size: "412 KB" }],
    dims: { department: "Enterprise sales", project: "NTC Branch Wi-Fi" },
    history: [
      { id: "h1", whoId: "EMP-121", when: "Sep 2, 11:40", what: "created the order from EST-0418" },
      { id: "h2", whoId: "EMP-121", when: "Sep 2, 11:41", what: "sent it to Manager review" },
    ],
  }),

  // ── Waiting on someone else ──────────────────────────────────────────────
  order({
    no: "SO-1050", customerId: "C-2003", date: "2026-09-01", expected: "2026-09-25", repId: "EMP-104",
    approval: { state: "pending", stateName: "Finance check", approverId: "EMP-118", since: "2026-09-01" },
    lines: [L("I-06", 120, 0, 0, 0, 22.5)],
    memo: "Export — invoice in USD, LC pending from buyer's bank.",
    history: [{ id: "h1", whoId: "EMP-104", when: "Sep 1, 10:02", what: "sent it to Finance check" }],
  }),

  // ── To deliver ───────────────────────────────────────────────────────────
  order({
    no: "SO-1049", customerId: "C-1044", date: "2026-08-30", expected: "2026-09-02", repId: "EMP-126",
    lines: [L("I-05", 60), L("I-06", 12)],
    memo: "Booked during visit.",
    approval: approved("EMP-101", "2026-08-30"),
    history: [
      { id: "h1", whoId: "EMP-126", when: "Aug 30, 14:20", what: "created the order" },
      { id: "h2", whoId: "EMP-101", when: "Aug 30, 15:02", what: "approved it" },
    ],
  }),
  order({
    no: "SO-1048", customerId: "C-1101", date: "2026-09-02", expected: "2026-09-06", locationId: "L-BTW", repId: "EMP-107",
    lines: [L("I-10", 600), L("I-08", 150)],
    history: [{ id: "h1", whoId: "EMP-101", when: "Sep 2, 09:15", what: "approved it" }],
  }),
  order({
    no: "SO-1046", customerId: "C-1072", date: "2026-09-03", expected: "2026-09-05", repId: "EMP-126",
    lines: [L("I-06", 30), L("I-05", 10)],
    advance: 20_000,
  }),

  // ── Partly delivered ─────────────────────────────────────────────────────
  order({
    no: "SO-1047", customerId: "C-1029", date: "2026-08-24", expected: "2026-09-01", repId: "EMP-104",
    customerPo: "AMF-PO-7781",
    source: { kind: "Estimate", no: "EST-0412" },
    lines: [L("I-01", 12, 6, 0), L("I-02", 4, 4, 4), L("I-03", 30, 0, 0, 0, 11_200), L("I-04", 30, 0, 0)],
    dims: { department: "Industrial", class: "Capital goods" },
    attachments: [
      { name: "AMF-PO-7781.pdf", size: "188 KB" },
      { name: "site-drawing-rev2.png", size: "1.2 MB" },
    ],
    docs: [
      { id: "D1", kind: "delivery", no: "DN-0301", date: "2026-08-28", state: "approved", byId: "EMP-112", locationId: "L-KTM", driver: "Ram Bahadur", truck: "Ba 3 Kha 2291", lines: [{ lineId: "#1", qty: 4 }, { lineId: "#0", qty: 6 }] },
      { id: "D2", kind: "invoice", no: "INV-8842", date: "2026-08-29", due: "2026-09-28", state: "approved", byId: "EMP-118", lines: [{ lineId: "#1", qty: 4 }] },
      { id: "D3", kind: "delivery", no: "DN-0309", date: "2026-09-03", state: "pending", approverId: "EMP-101", byId: "EMP-112", locationId: "L-KTM", driver: "Ram Bahadur", truck: "Ba 3 Kha 2291", lines: [{ lineId: "#0", qty: 6 }] },
    ],
    comments: [
      { id: "c1", authorId: "EMP-104", when: "Aug 28, 17:30", body: "Pumps went out with DN-0301. Couplings split — 6 now, 6 when the Birgunj consignment lands." },
      { id: "c2", authorId: "EMP-112", when: "Sep 3, 12:05", body: "Remaining 6 couplings are on DN-0309, waiting on dispatch approval." },
    ],
    history: [
      { id: "h1", whoId: "EMP-104", when: "Aug 24, 10:10", what: "created the order from EST-0412" },
      { id: "h2", whoId: "EMP-101", when: "Aug 24, 12:40", what: "approved it" },
      { id: "h3", whoId: "EMP-112", when: "Aug 28, 16:55", what: "delivered DN-0301 (2 lines)" },
      { id: "h4", whoId: "EMP-118", when: "Aug 29, 10:20", what: "invoiced INV-8842" },
      { id: "h5", whoId: "EMP-112", when: "Sep 3, 12:01", what: "raised DN-0309 — awaiting approval" },
    ],
  }),
  order({
    no: "SO-1043", customerId: "C-1061", date: "2026-08-20", expected: "2026-09-09", locationId: "L-KTM", repId: "EMP-121",
    source: { kind: "Estimate", no: "EST-0419" },
    lines: [L("I-09", 25, 10, 10), L("I-12", 40, 40, 40)],
    docs: [
      { id: "D1", kind: "delivery", no: "DN-0294", date: "2026-08-25", state: "approved", byId: "EMP-112", lines: [{ lineId: "#0", qty: 10 }, { lineId: "#1", qty: 40 }] },
      { id: "D2", kind: "invoice", no: "INV-8831", date: "2026-08-25", due: "2026-09-24", state: "approved", byId: "EMP-118", lines: [{ lineId: "#0", qty: 10 }, { lineId: "#1", qty: 40 }] },
    ],
  }),

  // ── To invoice ───────────────────────────────────────────────────────────
  order({
    no: "SO-1045", customerId: "C-1044", date: "2026-08-27", expected: "2026-08-29", repId: "EMP-126",
    lines: [L("I-05", 80, 80, 0), L("I-07", 20, 20, 0)],
    docs: [{ id: "D1", kind: "delivery", no: "DN-0299", date: "2026-08-28", state: "approved", byId: "EMP-112", locationId: "L-KTM", driver: "Sunil Tamang", truck: "Ba 1 Pa 7730", lines: [{ lineId: "#0", qty: 80 }, { lineId: "#1", qty: 20 }] }],
  }),
  order({
    no: "SO-1041", customerId: "C-1088", date: "2026-08-18", expected: "2026-08-22", locationId: "L-PKR", repId: "EMP-107",
    lines: [L("I-07", 200, 200, 120, 5), L("I-11", 10, 10, 0)],
    docs: [
      { id: "D1", kind: "delivery", no: "DN-0287", date: "2026-08-21", state: "approved", byId: "EMP-112", lines: [{ lineId: "#0", qty: 200 }, { lineId: "#1", qty: 10 }] },
      { id: "D2", kind: "invoice", no: "INV-8820", date: "2026-08-22", due: "2026-09-21", state: "approved", byId: "EMP-118", lines: [{ lineId: "#0", qty: 120 }] },
      { id: "D3", kind: "invoice", no: "INV-8851", date: "2026-09-03", due: "2026-10-03", state: "pending", approverId: "EMP-118", byId: "EMP-107", lines: [{ lineId: "#0", qty: 80 }, { lineId: "#1", qty: 10 }] },
    ],
  }),

  // ── Rejected ─────────────────────────────────────────────────────────────
  order({
    no: "SO-1044", customerId: "C-1072", date: "2026-08-28", expected: "2026-09-04", repId: "EMP-126",
    approval: { state: "rejected", byId: "EMP-101", on: "2026-08-29", reason: "Price below cost on beans — re-quote at the retail level." },
    lines: [L("I-06", 50, 0, 0, 18)],
  }),

  // ── Complete ─────────────────────────────────────────────────────────────
  order({
    no: "SO-1042", customerId: "C-1061", date: "2026-08-14", expected: "2026-08-18",
    lines: [L("I-03", 60, 60, 60), L("I-01", 8, 8, 8)],
    docs: [
      { id: "D1", kind: "delivery", no: "DN-0280", date: "2026-08-17", state: "approved", byId: "EMP-112", locationId: "L-KTM", lines: [{ lineId: "#0", qty: 60 }, { lineId: "#1", qty: 8 }] },
      { id: "D2", kind: "invoice", no: "INV-8809", date: "2026-08-17", due: "2026-09-16", state: "approved", byId: "EMP-118", lines: [{ lineId: "#0", qty: 60 }, { lineId: "#1", qty: 8 }] },
    ],
  }),
  order({
    no: "SO-1040", customerId: "C-1101", date: "2026-08-11", expected: "2026-08-14", locationId: "L-BTW",
    lines: [L("I-10", 900, 900, 900)],
    docs: [
      { id: "D1", kind: "delivery", no: "DN-0276", date: "2026-08-13", state: "approved", byId: "EMP-112", locationId: "L-BTW", lines: [{ lineId: "#0", qty: 900 }] },
      { id: "D2", kind: "invoice", no: "INV-8801", date: "2026-08-13", due: "2026-08-28", state: "approved", byId: "EMP-118", lines: [{ lineId: "#0", qty: 900 }] },
    ],
  }),

  // ── Closed & cancelled ───────────────────────────────────────────────────
  order({
    no: "SO-1039", customerId: "C-1029", date: "2026-08-08", expected: "2026-08-15",
    lines: [L("I-01", 20, 14, 14), L("I-11", 6, 6, 6)],
    closed: true,
    docs: [
      { id: "D1", kind: "delivery", no: "DN-0270", date: "2026-08-11", state: "approved", byId: "EMP-112", locationId: "L-KTM", lines: [{ lineId: "#0", qty: 14 }, { lineId: "#1", qty: 6 }] },
      { id: "D2", kind: "invoice", no: "INV-8795", date: "2026-08-12", due: "2026-09-11", state: "approved", byId: "EMP-118", lines: [{ lineId: "#0", qty: 14 }, { lineId: "#1", qty: 6 }] },
    ],
    history: [{ id: "h1", whoId: "EMP-104", when: "Aug 20, 11:00", what: "closed the order — customer dropped the last 6 couplings" }],
  }),
  order({
    no: "SO-1038", customerId: "C-1044", date: "2026-08-06",
    lines: [L("I-05", 40)],
    cancelled: { reason: "Duplicate of SO-1037.", on: "2026-08-06" },
  }),
];

export const nextOrderNo = (orders: Order[]) =>
  `SO-${Math.max(...orders.map((o) => Number(o.no.replace(/\D/g, "")))) + 1}`;

/** The customer's most recent order — what "Repeat last order" copies. */
export function lastOrderFor(orders: Order[], customerId: string, excludeId?: string) {
  return orders
    .filter((o) => o.customerId === customerId && o.id !== excludeId && !o.cancelled)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export const openOrdersFor = (orders: Order[], customerId: string) =>
  orders.filter((o) => o.customerId === customerId && isOpen(o)).length;

export { PEOPLE as TEAM };
