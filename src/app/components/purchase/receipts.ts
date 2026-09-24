import {
  Attachment,
  AuditRow,
  Comment,
  HistoryEvent,
  ME,
  OrderLine,
  TODAY,
  TaxCode,
  addDays,
  itemById,
  lineGross,
  totalsOf,
} from "../sales/orders";
import { createStore, useStore } from "../sales/store";
import { CreditMemo, creditLines, creditsStore, ev, nextNo, stamp } from "../sales/flow";
import { ordersStore } from "../sales/store";

// ════════════════════════════════════════════════════════════════════════════
// PURCHASE · ITEM RECEIPT — the one document that brings stock IN
//
// Mirrors ITEM_RECEIPT / ITEM_RECEIPT_DETAIL and the PURCHASE_ORDER_DETAIL
// counters, because the receipt is the purchase side's twin of the challan:
//
//   • it is always received AGAINST something — ITEM_RECEIPT already stores
//     ENTITY_TYPE + ENTITY_REF_ID + REFRENCE_FROM, so a purchase order is not
//     the only possible source. Here it also receives a SALES RETURN: the
//     credit memo credits the customer against the item's own account head,
//     and the goods come back on a receipt, which is what touches stock.
//   • PARTIAL receipt is the norm: PURCHASE_ORDER_DETAIL.RECEIVE_QTY counts
//     what has arrived, the rest stays on the order. Receipts awaiting
//     approval are counted separately so the same carton is never received
//     twice while an approver is away.
//   • batches and serials are captured HERE, not on the order — a purchase
//     order promises 200 bags, the receipt says which batches turned up.
//   • it posts the ASSET: DR inventory / CR accrued purchase (a purchase), or
//     DR inventory / CR cost of goods sold (a sales return coming back).
// ════════════════════════════════════════════════════════════════════════════

export type Vendor = { id: string; code: string; name: string; pan: string; address: string; termId: string; currency: string; contact: string };

export const VENDORS: Vendor[] = [
  { id: "V-2001", code: "V-2001", name: "Sagarmatha Polymers Pvt. Ltd.", pan: "302884511", address: "Balaju Industrial District, Kathmandu", termId: "T30", currency: "NPR", contact: "Ramesh Shrestha · 01-4350221" },
  { id: "V-2004", code: "V-2004", name: "Everest Coffee Estate", pan: "601229870", address: "Aanbukhaireni, Tanahun", termId: "T15", currency: "NPR", contact: "Sunita Gurung · 065-540112" },
  { id: "V-2009", code: "V-2009", name: "Shenzhen Powergrid Co., Ltd.", pan: "—", address: "Bao'an District, Shenzhen, China", termId: "T45", currency: "USD", contact: "Li Wei · +86 755 8812 4400" },
  { id: "V-2012", code: "V-2012", name: "Nepal Cement Udyog", pan: "500713366", address: "Hetauda-4, Makwanpur", termId: "T30", currency: "NPR", contact: "Bikash Thapa · 057-522410" },
];
export const vendorById = (id: string | null | undefined) => VENDORS.find((v) => v.id === id);

// ── Purchase order (only what a receipt needs to read) ──────────────────────

export type PoLine = OrderLine & { received: number; billed: number };

export type PurchaseOrder = {
  id: string;
  no: string;
  vendorId: string;
  subsidiaryId: string;
  date: string;
  expected: string | null;
  locationId: string;
  termId: string;
  currency: string;
  exchangeRate: number;
  memo: string;
  custom: Record<string, string>;
  closed: boolean;
  lines: PoLine[];
};

let seq = 0;
const P = (itemId: string, qty: number, received = 0, rate?: number, discountPct = 0): PoLine => {
  const it = itemById(itemId)!;
  return { id: `PL-${++seq}`, itemId, qty, rate: rate ?? Math.round(it.cost * 100) / 100, discountPct, tax: it.tax, unit: it.unit, delivered: 0, invoiced: 0, received, billed: 0, custom: {} };
};

export const purchaseOrdersStore = createStore<PurchaseOrder[]>([
  {
    id: "PO-0231", no: "PO-0231", vendorId: "V-2001", subsidiaryId: "NP-01", date: "2026-08-29", expected: "2026-09-06", locationId: "L-KTM", termId: "T30", currency: "NPR", exchangeRate: 1,
    memo: "Monsoon restock — pipe and fittings.", custom: { channel: "Distributor" }, closed: false,
    lines: [P("I-07", 600, 200), P("I-11", 40)],
  },
  {
    id: "PO-0234", no: "PO-0234", vendorId: "V-2004", subsidiaryId: "NP-01", date: "2026-09-01", expected: "2026-09-08", locationId: "L-KTM", termId: "T15", currency: "NPR", exchangeRate: 1,
    memo: "New season arabica — batch-coded by the estate.", custom: { channel: "Distributor" }, closed: false,
    lines: [P("I-06", 120), P("I-05", 400)],
  },
  {
    id: "PO-0236", no: "PO-0236", vendorId: "V-2009", subsidiaryId: "NP-01", date: "2026-09-02", expected: "2026-09-20", locationId: "L-KTM", termId: "T45", currency: "USD", exchangeRate: 133.42,
    memo: "Inverters and meters — LC opened with Nabil.", custom: { channel: "Distributor" }, closed: false,
    lines: [P("I-13", 10, 0, 905), P("I-14", 60, 0, 132)],
  },
  {
    id: "PO-0229", no: "PO-0229", vendorId: "V-2012", subsidiaryId: "NP-02", date: "2026-08-24", expected: "2026-08-30", locationId: "L-PKR", termId: "T30", currency: "NPR", exchangeRate: 1,
    memo: "", custom: { channel: "Distributor" }, closed: false,
    lines: [P("I-08", 2_000, 2_000)],
  },
]);

export const poById = (no: string) => purchaseOrdersStore.get().find((p) => p.no === no);
export const remainingToReceive = (l: PoLine) => Math.max(0, l.qty - l.received);

// ── The receipt ─────────────────────────────────────────────────────────────

export type ReceiptBatch = { lineId: string; batch: string; mfg: string | null; expiry: string | null; qty: number };
export type ReceiptSerials = { lineId: string; batch?: string; serials: string[] };

export type ReceiptLine = {
  id: string;
  /** REF_DETAIL_ID — the purchase-order line, or the credit-memo line, this receives. */
  refLineId: string;
  itemId: string;
  unit: string;
  qty: number;
  rate: number;
  discountPct: number;
  tax: TaxCode;
  locationId: string;
  description?: string;
  custom?: Record<string, string>;
};

/** ITEM_RECEIPT.ENTITY_TYPE + ENTITY_REF_ID — what these goods are received against. */
export type ReceiptSource = { kind: "purchase"; no: string } | { kind: "return"; no: string };

export type ItemReceipt = {
  id: string;
  no: string;
  source: ReceiptSource;
  /** The party: the vendor on a purchase, the customer whose goods came back on a return. */
  partyId: string;
  subsidiaryId: string;
  date: string;
  /** Receive into. */
  locationId: string;
  currency: string;
  exchangeRate: number;
  /** Transport block — TRANSPORT / TRUCK_NO / DRIVER_NAME / TRANSPORT_AMOUNT. */
  transporter: string;
  truckNo: string;
  driver: string;
  transportAmount: number;
  /** Import papers — PP_NUMBER / PP_DATE / LC / CI_NUMBER. */
  ppNumber: string;
  ppDate: string | null;
  lc: string;
  ciNumber: string;
  vendorRef: string;
  memo: string;
  remarks: string;
  dims: { department?: string; class?: string; project?: string };
  custom: Record<string, string>;
  lines: ReceiptLine[];
  batches: ReceiptBatch[];
  serials: ReceiptSerials[];
  state: "approved" | "pending";
  approverId?: string;
  rejected?: { reason: string; byId: string; on: string };
  cancelled: { reason: string; on: string } | null;
  /** ITEM_RECEIPT.FORM_STATUS — the BILLING state of the receipt, not the receiving. */
  billing: "Open" | "Partly billed" | "Billed";
  /** The vendor's own bill against this receipt, once Enter Bill has run. */
  vendorBillNo: string | null;
  /** COST_ALLOCATION_METHOD — how freight and duty land on the lines. */
  costAllocation: "By value" | "By quantity" | "None";
  byId: string;
  created: { byId: string; on: string };
  audit: AuditRow[];
  attachments: Attachment[];
  comments: Comment[];
  history: HistoryEvent[];
};

const meta = (byId: string, on: string, history: HistoryEvent[] = []) => ({ created: { byId, on }, audit: [], attachments: [], comments: [], history });

export const receiptsStore = createStore<ItemReceipt[]>([
  {
    id: "IR-0118", no: "IR-0118", source: { kind: "purchase", no: "PO-0231" }, partyId: "V-2001", subsidiaryId: "NP-01", date: "2026-09-02", locationId: "L-KTM",
    currency: "NPR", exchangeRate: 1, transporter: "Himal Logistics", truckNo: "Ba 12 Kha 3390", driver: "Suresh Magar", transportAmount: 4_500,
    ppNumber: "", ppDate: null, lc: "", ciNumber: "", vendorRef: "SP/CH/1180", memo: "First lot of the pipe order.", remarks: "", dims: { department: "Industrial" }, custom: { channel: "Distributor" },
    lines: [{ id: "IRL-1", refLineId: purchaseOrdersStore.get()[0].lines[0].id, itemId: "I-07", unit: "len", qty: 200, rate: 1_610, discountPct: 0, tax: "VAT13", locationId: "L-KTM" }],
    batches: [], serials: [], state: "approved", cancelled: null, billing: "Billed", vendorBillNo: "SP-8841", costAllocation: "By value", byId: "EMP-112",
    ...meta("EMP-112", "2026-09-02", [{ id: "h1", whoId: "EMP-112", when: "Sep 2, 11:20", what: "received 200 len into Kathmandu WH" }]),
  },
  {
    id: "IR-0121", no: "IR-0121", source: { kind: "purchase", no: "PO-0229" }, partyId: "V-2012", subsidiaryId: "NP-02", date: "2026-08-28", locationId: "L-PKR",
    currency: "NPR", exchangeRate: 1, transporter: "", truckNo: "Na 4 Kha 1123", driver: "", transportAmount: 0,
    ppNumber: "", ppDate: null, lc: "", ciNumber: "", vendorRef: "", memo: "", remarks: "", dims: {}, custom: { channel: "Distributor" },
    lines: [{ id: "IRL-2", refLineId: purchaseOrdersStore.get()[3].lines[0].id, itemId: "I-08", unit: "bag", qty: 2_000, rate: 690, discountPct: 0, tax: "VAT13", locationId: "L-PKR" }],
    batches: [], serials: [], state: "approved", cancelled: null, billing: "Partly billed", vendorBillNo: "NCU/25-26/0912", costAllocation: "None", byId: "EMP-112",
    ...meta("EMP-112", "2026-08-28", [{ id: "h1", whoId: "EMP-112", when: "Aug 28, 09:10", what: "received 2,000 bag into Pokhara depot" }]),
  },
]);

export const useReceipts = () => useStore(receiptsStore);
export const usePurchaseOrders = () => useStore(purchaseOrdersStore);

// ── Derivations ─────────────────────────────────────────────────────────────

export const live = (r: ItemReceipt) => !r.cancelled;
export const receiptLines = (r: ItemReceipt) => r.lines;
export const receiptValue = (r: ItemReceipt) => totalsOf(r.lines.map((l) => ({ ...l, discountAmt: undefined }))).total;

/** Units of a source line already on a receipt that is awaiting approval. */
export function pendingOn(sourceNo: string, refLineId: string, except?: string) {
  return receiptsStore
    .get()
    .filter((r) => r.source.no === sourceNo && r.state === "pending" && !r.cancelled && !r.rejected && r.no !== except)
    .reduce((s, r) => s + r.lines.filter((l) => l.refLineId === refLineId).reduce((a, l) => a + l.qty, 0), 0);
}

/** Approved receipts count; a receipt awaiting approval does not (the stock has not been put away). */
export function receivedOn(sourceNo: string, refLineId: string, except?: string) {
  return receiptsStore
    .get()
    .filter((r) => r.source.no === sourceNo && r.state === "approved" && !r.cancelled && r.no !== except)
    .reduce((s, r) => s + r.lines.filter((l) => l.refLineId === refLineId).reduce((a, l) => a + l.qty, 0), 0);
}

export type ReceivableLine = { refLineId: string; itemId: string; unit: string; rate: number; tax: TaxCode; ordered: number; received: number; pending: number; left: number };

/** What a source document still has to be received, line by line. */
export function receivableFrom(source: ReceiptSource, except?: string): ReceivableLine[] {
  if (source.kind === "purchase") {
    const po = poById(source.no);
    if (!po) return [];
    return po.lines.map((l) => {
      const received = receivedOn(po.no, l.id, except);
      const pending = pendingOn(po.no, l.id, except);
      return { refLineId: l.id, itemId: l.itemId, unit: l.unit ?? itemById(l.itemId)!.unit, rate: l.rate, tax: l.tax, ordered: l.qty, received, pending, left: Math.max(0, l.qty - received - pending) };
    });
  }
  const credit = creditsStore.get().find((c) => c.no === source.no);
  if (!credit) return [];
  return creditLines(ordersStore.get(), credit).map((x) => {
    const received = receivedOn(credit.no, x.lineId, except);
    const pending = pendingOn(credit.no, x.lineId, except);
    const it = itemById(x.line.itemId)!;
    return { refLineId: x.lineId, itemId: x.line.itemId, unit: x.line.unit ?? it.unit, rate: it.cost, tax: x.line.tax, ordered: x.qty, received, pending, left: Math.max(0, x.qty - received - pending) };
  });
}

/** Where a source document stands: nothing in, some in, all in. */
export function receiveStage(source: ReceiptSource): "none" | "partly" | "full" {
  const rows = receivableFrom(source).filter((r) => r.ordered > 0);
  if (!rows.length) return "none";
  if (rows.every((r) => r.received >= r.ordered)) return "full";
  return rows.some((r) => r.received > 0) ? "partly" : "none";
}

/** A sales return waiting on its goods — the queue this desk exists for. */
export function returnsAwaitingGoods(credits: CreditMemo[]) {
  return credits.filter((c) => c.state === "approved" && !c.cancelled && receiveStage({ kind: "return", no: c.no }) !== "full");
}

/** The receipts that brought a return's goods back. */
export const receiptsForReturn = (no: string) => receiptsStore.get().filter((r) => r.source.kind === "return" && r.source.no === no && !r.cancelled);
/** How much of one credited line has actually come back. */
export const receivedFor = (returnNo: string, refLineId: string) => receivedOn(returnNo, refLineId);

export const receiptStatus = (r: ItemReceipt): { label: string; tone: "positive" | "pending" | "danger" | "neutral" | "partial" } =>
  r.cancelled ? { label: "Cancelled", tone: "neutral" } : r.rejected ? { label: "Sent back", tone: "danger" } : r.state === "pending" ? { label: "Awaiting approval", tone: "pending" } : { label: "Received", tone: "positive" };

// ── Actions ─────────────────────────────────────────────────────────────────

export function addReceipt(r: Omit<ItemReceipt, "id" | "no" | "created" | "audit" | "comments" | "history">) {
  const no = nextNo("IR-", receiptsStore.get().map((x) => x.no));
  receiptsStore.set((rs) => [
    { ...r, id: no, no, created: { byId: ME.id, on: TODAY }, audit: [], comments: [], history: [ev(`received it against ${r.source.no}`)] },
    ...rs,
  ]);
  return no;
}

export const updateReceipt = (no: string, fn: (r: ItemReceipt) => ItemReceipt, what?: string) =>
  receiptsStore.set((rs) => rs.map((r) => (r.no === no ? { ...fn(r), history: what ? [...r.history, ev(what)] : fn(r).history } : r)));

export const approveReceipt = (no: string) => updateReceipt(no, (r) => ({ ...r, state: "approved", approverId: undefined }), "approved it — stock put away");
export const rejectReceipt = (no: string, reason: string) => updateReceipt(no, (r) => ({ ...r, rejected: { reason, byId: ME.id, on: TODAY }, approverId: undefined }), `sent it back — “${reason}”`);
export const cancelReceipt = (no: string, reason: string) => updateReceipt(no, (r) => ({ ...r, cancelled: { reason, on: TODAY } }), `cancelled it — “${reason}”`);
export const deleteReceipt = (no: string) => receiptsStore.set((rs) => rs.filter((r) => r.no !== no));
export const replaceReceipt = (no: string, r: Partial<ItemReceipt>) => updateReceipt(no, (x) => ({ ...x, ...r, rejected: undefined }), "edited it");
export const noteReceipt = (no: string, n: Omit<Comment, "id" | "authorId" | "when">) =>
  updateReceipt(no, (r) => ({ ...r, comments: [...r.comments, { ...n, id: `c${Date.now()}`, authorId: ME.id, when: stamp() }] }));
export const attachReceipt = (no: string) =>
  updateReceipt(no, (r) => ({ ...r, attachments: [...r.attachments, { name: `${no.toLowerCase()}-grn.pdf`, size: "184 KB", byId: ME.id, on: stamp() }] }));

export { addDays, lineGross };
