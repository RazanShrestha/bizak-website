import { addReceipt, approveReceipt, nextNo, receiptBook, receiptsStore, rejectReceipt as sendBackReceipt, updateReceipt } from "../sales/flow";
import type { Receipt, ReceiptInvoiceTarget, ReceiptMoney, ReceiptOrderTarget, ReceiptUse } from "../sales/flow";
import { PAYMENT_METHODS, methodById } from "../sales/master";
import { ME, TODAY, fmtShort, orderTotal, personById } from "../sales/orders";
import { ordersStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { LedgerEntry, PayMethod } from "./data";
import { accountOf, customerById, eligible, invoiceOf, npr, orderDead } from "./engine";
import { evaluateHub } from "./orders-parts";
import { nextId, persistentStore } from "./persist";
import { STAFF_NAME, logEvent } from "./records";
import { customersStore, historyStore, hubStore, ledgerStore, notesStore, repsStore, schemesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// RECEIPTS · KERNEL
//
// A payment from any channel — a rep's collection, a dealer's payment on the
// portal, one the office records — IS the sales desk's customer receipt
// (sales/flow.tsx `Receipt`, RCP-…): one record, one number, the desk's own
// (owner decision #31). Sales force adds no payment document. Confirming a
// payment is approving that receipt; rejecting it is sending the receipt back.
//
// What Sales force keeps is the customer's account (the ledger). Every live
// receipt of one of our customers has ONE Receipt row there, `pending` until
// the receipt is approved, so the credit check counts the money the moment
// accounts confirm it. The row FOLLOWS the receipt (the watcher below): a
// receipt typed, approved, sent back, cancelled or deleted on the sales desk
// reaches the account exactly as one confirmed here does.
//
// This file is the only place that takes, confirms or rejects a payment, and
// the only one that moves a Receipt row in the ledger.
//
// WHAT A RECEIPT IS FOR (owner decision #33). A receipt is only ever applied to
// invoices, and it is the office that applies it, by editing the receipt. A
// dealer pays for ORDERS, often before they are invoiced, so the receipt
// carries REFERENCES to sales orders, each with an amount (`Receipt.orders`).
// A reference applies nothing: the money stays an advance. It only says whose
// invoices may take that amount — the tagged order's. The untagged rest of the
// advance may go to any invoice. Dealer and office can both change the
// references while the money is unapplied; nothing is applied automatically.
// ════════════════════════════════════════════════════════════════════════════

export type Via = "rep" | "portal" | "office";

/** The sales desk mockup seeds receipts for its own customers; only a Sales force customer's receipts are ours. */
const ours = (customerId: string) => customersStore.get().some((c) => c.id === customerId);

/** Who sent a receipt: a rep (a cash collection), a portal user of the customer, or someone in the office. */
export function senderOf(r: Pick<LedgerEntry, "by" | "customerId">): { name: string; via: Via } | null {
  if (!r.by) return null;
  if (repsStore.get().some((x) => x.name === r.by)) return { name: r.by, via: "rep" };
  if (customerById(r.customerId)?.portalUsers.some((u) => u.name === r.by)) return { name: r.by, via: "portal" };
  return { name: r.by, via: "office" };
}

/**
 * A dealer who pays bills in full inside the early-payment window also gets a credit note, written by the portal
 * with the receipt (doc "CN-EP-…", reference = the receipt's number). It stands or falls with its receipt.
 */
export const linkedDiscounts = (r: Pick<LedgerEntry, "customerId" | "doc">, ledger: LedgerEntry[]) => ledger.filter((x) => x.kind === "Credit note" && x.customerId === r.customerId && x.doc.startsWith("CN-EP-") && x.reference === r.doc);

// ── What a receipt is for ───────────────────────────────────────────────────

/** A document and an amount: an invoice the receipt is applied to, or a sales order it is tagged to. */
export type Line = { doc: string; amount: number };

const isOrder = (customerId: string, doc: string) => hubStore.get().some((h) => h.id === doc && h.customerId === customerId);
/** The invoices a receipt is applied to. undefined = a receipt from before lines existed (it settles oldest first). */
const appliedOf = (r: Receipt): Line[] | undefined => (r.orders === undefined ? undefined : r.allocations.map((a) => ({ doc: a.invoiceNo, amount: a.amount })));
const tagsOf = (r: Receipt): Line[] => (r.orders ?? []).map((o) => ({ doc: o.orderNo, amount: o.amount }));
const says = (lines: Line[]) => lines.map((l) => `${l.doc} NPR ${npr(l.amount)}`).join(", ");

/** The account as it stands without one receipt (the one being edited), and what receipts still waiting already claim. */
function standing(customerId: string, exceptReceiptNo?: string) {
  const ledger = ledgerStore.get().filter((r) => !(exceptReceiptNo && r.kind === "Receipt" && r.doc === exceptReceiptNo));
  const a = accountOf(customerId, ledger);
  const waiting = ledger.filter((r) => r.customerId === customerId && r.pending);
  const promised = (doc: string) => waiting.reduce((sum, r) => sum + (r.applied ?? []).filter((l) => l.doc === doc).reduce((n, l) => n + l.amount, 0), 0);
  // A waiting receipt's tag, less what the same receipt already puts on that order's invoice.
  const promisedTag = (orderNo: string) =>
    waiting.reduce((sum, r) => sum + (r.tags ?? []).filter((t) => t.doc === orderNo).reduce((n, t) => n + Math.max(0, t.amount - (r.applied ?? []).filter((l) => invoiceOf(l.doc, orderNo)).reduce((x, l) => x + l.amount, 0)), 0), 0);
  return { ledger, a, promised, promisedTag };
}

/**
 * The sales orders a customer's payment can be tagged to. `need` is what the order still wants: its total (or what
 * its invoice still owes), less what other receipts — confirmed or still waiting — are already tagged to it for. So
 * a 5,000 order with 2,000 tagged takes 3,000 more, whichever receipt it comes on. `alsoTagged` = orders the receipt
 * being edited is tagged to: they are listed even when they need nothing, or are dead, so the tag can be seen and changed.
 */
export function orderTargets(customerId: string, exceptReceiptNo?: string, alsoTagged: string[] = []): ReceiptOrderTarget[] {
  const { ledger, a, promised, promisedTag } = standing(customerId, exceptReceiptNo);
  return hubStore
    .get()
    .filter((h) => h.customerId === customerId)
    .map((h) => {
      const bill = ledger.find((r) => r.kind === "Invoice" && !r.pending && r.customerId === customerId && invoiceOf(r.doc, h.id));
      const open = bill ? Math.max(0, (a.invoices.find((i) => i.doc === bill.doc)?.open ?? 0) - promised(bill.doc)) : 0;
      // Not billed yet: what its sales order comes to — the figure it will be billed at.
      const so = ordersStore.get().find((x) => x.no === h.id && x.customerId === customerId);
      const owed = bill ? open : so ? orderTotal(so) : evaluateHub(h).total;
      // Rejected or cancelled, and nothing of it left to pay.
      const dead = orderDead(customerId, h.id) && open <= 0;
      const need = dead ? 0 : Math.max(0, owed - (a.tagged.find((t) => t.doc === h.id)?.amount ?? 0) - promisedTag(h.id));
      return { orderNo: h.id, date: h.at.slice(0, 10), total: bill ? bill.debit : owed, need, invoiced: !!bill, dead };
    })
    .filter((t) => t.need > 0 || alsoTagged.includes(t.orderNo))
    .sort((x, y) => x.date.localeCompare(y.date) || x.orderNo.localeCompare(y.orderNo));
}

/**
 * The customer's open invoices, oldest due first. `open` is what a receipt may still apply: what is due, less what
 * receipts still waiting already say they pay, less what OTHER receipts are tagged to its order for (`reserved`).
 */
export function invoiceTargets(customerId: string, exceptReceiptNo?: string): ReceiptInvoiceTarget[] {
  const { a, promised, promisedTag } = standing(customerId, exceptReceiptNo);
  return a.invoices
    .map((i) => {
      const orderNo = isOrder(customerId, i.doc) ? i.doc : null;
      const due = Math.max(0, i.open - promised(i.doc));
      const reserved = orderNo ? Math.min(due, (a.tagged.find((t) => t.doc === orderNo)?.amount ?? 0) + promisedTag(orderNo)) : 0;
      return { invoiceNo: i.doc, orderNo, date: i.date, due: i.due, total: i.amount, open: due - reserved, reserved };
    })
    .filter((t) => t.open > 0);
}

/**
 * Where a receipt's money stands: the invoices it settled, the orders it is tagged to, and the advance with no tag.
 * A receipt still waiting is read as it will count once approved. null = a receipt from before lines existed.
 */
export function receiptUse(customerId: string, receiptNo: string): ReceiptUse | null {
  const ledger = ledgerStore.get().map((x) => (x.kind === "Receipt" && x.doc === receiptNo && x.customerId === customerId ? { ...x, pending: false } : x));
  const a = accountOf(customerId, ledger);
  const use = a.uses.find((u) => u.doc === receiptNo);
  if (!use) return null;
  const billed = (orderNo: string) => ledger.some((r) => r.kind === "Invoice" && !r.pending && r.customerId === customerId && invoiceOf(r.doc, orderNo));
  return {
    lines: use.lines.map((l) => ({ invoiceNo: l.doc, amount: l.amount, applied: l.applied })),
    tags: use.tags.map((t) => ({
      orderNo: t.doc,
      amount: t.amount,
      open: t.open,
      state: t.open <= 0 ? "applied" : t.dead ? "dead" : !billed(t.doc) ? "waiting" : a.invoices.some((i) => invoiceOf(i.doc, t.doc)) ? "invoiced" : "spare",
    })),
    free: use.free,
  };
}

/**
 * What the office still has to do with a receipt: `retag` = a tag's order was rejected or cancelled, or needs no more
 * money; `apply` = a tagged order is invoiced, or untagged advance sits beside an open invoice. Applying waits until
 * the receipt is confirmed; a tag can be changed before.
 */
export function receiptTodo(customerId: string, receiptNo: string): "retag" | "apply" | null {
  const row = ledgerStore.get().find((r) => r.kind === "Receipt" && r.doc === receiptNo && r.customerId === customerId);
  // A receipt from before lines existed settles oldest first: there is nothing to do with it.
  const use = row?.applied ? receiptUse(customerId, receiptNo) : null;
  if (!row || !use) return null;
  if (use.tags.some((t) => t.state === "dead" || t.state === "spare")) return "retag";
  if (row.pending) return null;
  if (use.tags.some((t) => t.state === "invoiced")) return "apply";
  return use.free > 0 && invoiceTargets(customerId).length > 0 ? "apply" : null;
}

/** The same, in a few words for a list row. */
export function receiptTodoText(customerId: string, receiptNo: string): string {
  const use = receiptUse(customerId, receiptNo);
  if (!use) return "";
  const dead = use.tags.filter((t) => t.state === "dead");
  if (dead.length) return `${dead.map((t) => t.orderNo).join(", ")} was rejected or cancelled`;
  const spare = use.tags.filter((t) => t.state === "spare");
  if (spare.length) return `${spare.map((t) => t.orderNo).join(", ")} needs no more money`;
  const ready = use.tags.filter((t) => t.state === "invoiced");
  if (ready.length) return `${ready.map((t) => t.orderNo).join(", ")} is invoiced`;
  return use.free > 0 ? `NPR ${npr(use.free)} not applied` : "";
}

/**
 * What customers' payments say about one sales order: `paid` = confirmed money tagged to it or applied to its
 * invoice; `waiting` = the same on receipts not confirmed yet.
 */
export function paidFor(customerId: string, orderNo: string, ledger = ledgerStore.get()): { paid: number; waiting: number; receipts: string[] } {
  const about = (r: (typeof ledger)[number]) => r.customerId === customerId && r.kind === "Receipt" && ((r.tags ?? []).some((t) => t.doc === orderNo) || (r.applied ?? []).some((l) => invoiceOf(l.doc, orderNo)));
  const mine = ledger.filter(about);
  const uses = accountOf(customerId, ledger).uses;
  const claim = (r: (typeof ledger)[number]) => Math.max((r.tags ?? []).filter((t) => t.doc === orderNo).reduce((n, t) => n + t.amount, 0), (r.applied ?? []).filter((l) => invoiceOf(l.doc, orderNo)).reduce((n, l) => n + l.amount, 0));
  return {
    paid: uses.reduce((sum, u) => sum + u.tags.filter((t) => t.doc === orderNo).reduce((n, t) => n + t.open, 0) + u.lines.filter((l) => invoiceOf(l.doc, orderNo)).reduce((n, l) => n + l.applied, 0), 0),
    waiting: mine.filter((r) => r.pending).reduce((sum, r) => sum + claim(r), 0),
    receipts: mine.map((r) => r.doc),
  };
}

/** A customer's receipts that still hold advance, oldest first — what the dealer can re-tag and the office applies. */
export function unapplied(customerId: string): { no: string; date: string; pending: boolean; amount: number; use: ReceiptUse }[] {
  return ledgerStore
    .get()
    .filter((r) => r.customerId === customerId && r.kind === "Receipt" && r.applied)
    .sort((x, y) => x.date.localeCompare(y.date) || x.doc.localeCompare(y.doc))
    .flatMap((r) => {
      const use = receiptUse(customerId, r.doc);
      const amount = use ? use.free + use.tags.reduce((sum, t) => sum + t.open, 0) : 0;
      return use && amount > 0 ? [{ no: r.doc, date: r.date, pending: !!r.pending, amount, use }] : [];
    });
}

/**
 * Change which sales orders a receipt is for. The tags may not add up to more than the receipt still holds as
 * advance, and an order takes no more than it needs. Returns a refusal, or null when it is done.
 */
// ── The early-payment discount of an order (owner decision #34) ─────────────

const plusDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/** The early-payment offer a customer gets today, if any. */
export function earlyOffer(customerId: string) {
  const c = customerById(customerId);
  const s = c ? schemesStore.get().find((x) => x.mechanic.kind === "early-payment" && eligible(x, c) === null) : undefined;
  return s && s.mechanic.kind === "early-payment" ? s.mechanic : null;
}

/**
 * The early-payment discount of one sales order. It is the ORDER's: pct of the order's total, earned when the order
 * is paid in full (its total less the discount) with money that arrived no later than `withinDays` after its FIRST
 * invoice — money paid before any invoice is on time. The whole discount is ONE credit note on that first invoice,
 * never spread over the order's invoices. It is given when the office applies the order's money to that invoice;
 * nothing gives it by itself. null = no offer, or no invoice yet.
 */
export function orderDiscount(customerId: string, orderNo: string, ledger = ledgerStore.get()) {
  const offer = earlyOffer(customerId);
  const bills = ledger.filter((r) => r.kind === "Invoice" && !r.pending && r.customerId === customerId && invoiceOf(r.doc, orderNo)).sort((a, b) => a.date.localeCompare(b.date));
  if (!offer || !bills.length) return null;
  const first = bills[0];
  const issued = ledger.find((r) => r.kind === "Credit note" && r.customerId === customerId && r.doc.startsWith("CN-EP-") && (r.applied ?? []).some((l) => l.doc === first.doc)) ?? null;
  // The prototype bills an order once, in full; the app adds up the order's invoices (or reads the order's total).
  const total = bills.reduce((sum, r) => sum + r.debit, 0);
  const amount = Math.round((total * offer.pct) / 100);
  const until = plusDays(first.date, offer.withinDays);
  // Money for the order that came on time: what each confirmed receipt says is for it, or put on its invoices — the larger.
  const onTime = ledger
    .filter((r) => r.kind === "Receipt" && !r.pending && r.customerId === customerId && r.date <= until)
    .reduce((sum, r) => sum + Math.max((r.tags ?? []).filter((t) => t.doc === orderNo).reduce((n, t) => n + t.amount, 0), (r.applied ?? []).filter((l) => invoiceOf(l.doc, orderNo)).reduce((n, l) => n + l.amount, 0)), 0);
  return { pct: offer.pct, amount, total, invoiceNo: first.doc, until, issued, earned: !!issued || onTime >= total - amount - 0.005 };
}

/**
 * Apply money of a confirmed receipt to one invoice. Money tagged to an order can only go to that order's invoices:
 * applying it elsewhere would need more than the receipt holds, so that is the check.
 */
export function applyToInvoice(receiptNo: string, invoiceNo: string, amount: number): string | null {
  const r = receiptsStore.get().find((x) => x.no === receiptNo);
  if (!r || !ours(r.customerId) || r.cancelled || r.rejected) return "This receipt can no longer be changed.";
  if (r.state !== "approved") return "Approve the receipt first.";
  if (!(amount > 0)) return "Enter an amount.";
  const target = invoiceTargets(r.customerId, receiptNo).find((t) => t.invoiceNo === invoiceNo);
  const had = r.allocations.find((a) => a.invoiceNo === invoiceNo)?.amount ?? 0;
  // The order's first invoice, with its early-payment discount earned and not given: this Apply gives it (decision #34).
  const orderNo = hubStore.get().find((h) => h.customerId === r.customerId && invoiceOf(invoiceNo, h.id))?.id ?? null;
  const d = orderNo ? orderDiscount(r.customerId, orderNo) : null;
  const disc = d && d.earned && !d.issued && d.invoiceNo === invoiceNo ? d.amount : 0;
  const room = Math.max(0, (target?.open ?? 0) - had - disc);
  if (amount > room + 0.005) return room > 0 ? `Only NPR ${npr(room)} can go on ${invoiceNo}.` : `Nothing more can go on ${invoiceNo}.`;
  const allocations = had ? r.allocations.map((a) => (a.invoiceNo === invoiceNo ? { ...a, amount: had + amount } : a)) : [...r.allocations, { invoiceNo, amount }];
  // With the discount the order needs that much less: what this receipt keeps for it above that is for no order now.
  let orders = r.orders ?? [];
  if (disc && orderNo && d) {
    const tagged = ledgerStore.get().filter((x) => x.kind === "Receipt" && x.customerId === r.customerId && x.doc !== receiptNo).reduce((sum, x) => sum + (x.tags ?? []).filter((t) => t.doc === orderNo).reduce((n, t) => n + t.amount, 0), 0);
    const mine = orders.find((o) => o.orderNo === orderNo)?.amount ?? 0;
    const excess = Math.max(0, Math.min(mine, tagged + mine - (d.total - disc)));
    if (excess > 0.005) orders = orders.map((o) => (o.orderNo === orderNo ? { ...o, amount: Math.round((o.amount - excess) * 100) / 100 } : o)).filter((o) => o.amount > 0.005);
  }
  const applied = allocations.reduce((sum, a) => sum + a.amount, 0);
  const reserved = orders.reduce((sum, o) => sum + Math.max(0, o.amount - allocations.filter((a) => invoiceOf(a.invoiceNo, o.orderNo)).reduce((n, a) => n + a.amount, 0)), 0);
  if (applied + reserved > amountOf(r) + 0.005) return "That money is for an order. It can only go on that order's invoice.";
  if (disc && d && orderNo) {
    const ledger = ledgerStore.get();
    const note: LedgerEntry = {
      id: nextId("L-", ledger.map((x) => x.id), 4),
      customerId: r.customerId,
      date: SF_TODAY,
      doc: nextId("CN-EP-", ledger.map((x) => x.doc), 4),
      kind: "Credit note",
      debit: 0,
      credit: disc,
      due: null,
      applied: [{ doc: invoiceNo, amount: disc }],
      // It stands or falls with the receipt whose Apply gave it (cancelling the receipt takes it back).
      reference: receiptNo,
      by: STAFF_NAME,
      note: `Early-payment discount on ${orderNo}: ${d.pct}% of NPR ${npr(d.total)}, on its first invoice ${invoiceNo}`,
    };
    ledgerStore.set((l) => [...l, note]);
    logEvent(r.customerId, `gave ${orderNo} its early-payment discount of NPR ${npr(disc)} (${note.doc}) on ${invoiceNo}`);
  }
  updateReceipt(receiptNo, (x) => ({ ...x, allocations, orders }), `applied NPR ${npr(amount)} to ${invoiceNo}${disc ? ` with its NPR ${npr(disc)} early-payment discount` : ""}`);
  return null;
}

/** Take a receipt's money off an invoice again: it is advance once more. */
export function unapplyFromInvoice(receiptNo: string, invoiceNo: string): string | null {
  const r = receiptsStore.get().find((x) => x.no === receiptNo);
  if (!r || !ours(r.customerId) || r.cancelled || r.rejected) return "This receipt can no longer be changed.";
  const line = r.allocations.find((a) => a.invoiceNo === invoiceNo);
  if (!line) return null;
  // The discount this receipt's Apply gave on that invoice goes with it; the next Apply gives it again.
  const given = new Set(ledgerStore.get().filter((x) => x.kind === "Credit note" && x.reference === receiptNo && x.doc.startsWith("CN-EP-") && (x.applied ?? []).some((l) => l.doc === invoiceNo)).map((x) => x.id));
  if (given.size) ledgerStore.set((l) => l.filter((x) => !given.has(x.id)));
  updateReceipt(receiptNo, (x) => ({ ...x, allocations: x.allocations.filter((a) => a.invoiceNo !== invoiceNo) }), `took NPR ${npr(line.amount)} off ${invoiceNo}`);
  return null;
}

/** One receipt's money, pot by pot (`ReceiptMoney`). null = not a receipt of ours that names its lines. */
export function receiptMoney(customerId: string, receiptNo: string, by: { name: string; via: Via } = { name: STAFF_NAME, via: "office" }): ReceiptMoney | null {
  const r = receiptsStore.get().find((x) => x.no === receiptNo && x.customerId === customerId);
  const use = r && r.orders !== undefined ? receiptUse(customerId, receiptNo) : null;
  if (!r || !use) return null;
  const ledger = ledgerStore.get();
  const targets = invoiceTargets(customerId, receiptNo);
  const lineOf = (inv: string) => r.allocations.find((a) => a.invoiceNo === inv)?.amount ?? 0;
  const roomOf = (inv: string) => Math.max(0, (targets.find((t) => t.invoiceNo === inv)?.open ?? 0) - lineOf(inv));
  // This receipt's invoice lines, shared out: an order's pot takes what went on its own invoices, up to its amount.
  const left = new Map<string, number>(r.allocations.map((a) => [a.invoiceNo, a.amount] as [string, number]));
  const billsOf = (orderNo: string) => ledger.filter((x) => x.kind === "Invoice" && !x.pending && x.customerId === customerId && invoiceOf(x.doc, orderNo)).map((x) => x.doc);
  const orders = use.tags.map((t) => {
    let share = t.amount;
    let rest = t.state === "dead" || t.state === "spare" ? 0 : t.open;
    const invoices = billsOf(t.orderNo).map((inv) => {
      const applied = Math.min(left.get(inv) ?? 0, share);
      share -= applied;
      left.set(inv, (left.get(inv) ?? 0) - applied);
      const canApply = Math.min(rest, roomOf(inv));
      rest -= canApply;
      return { invoiceNo: inv, applied, canApply };
    });
    const d = orderDiscount(customerId, t.orderNo);
    const discount = r.state === "approved" && d && d.earned && !d.issued ? { amount: d.amount, invoiceNo: d.invoiceNo } : null;
    // What can go on the first invoice is what it owes less the discount the same Apply gives.
    if (discount) for (const i of invoices) if (i.invoiceNo === discount.invoiceNo) i.canApply = Math.max(0, Math.min(i.canApply, roomOf(i.invoiceNo) - discount.amount));
    return { orderNo: t.orderNo, amount: t.amount, open: t.open, state: t.state, invoices, discount };
  });
  const received = amountOf(r);
  const mine = (orderNo: string) => (r.orders ?? []).find((o) => o.orderNo === orderNo)?.amount ?? 0;
  return {
    received,
    orders,
    loose: {
      amount: Math.max(0, received - use.tags.reduce((sum, t) => sum + t.amount, 0)),
      open: use.free,
      invoices: [...left].filter(([, n]) => n > 0.005).map(([invoiceNo, applied]) => ({ invoiceNo, applied })),
    },
    orderChoices: orderTargets(customerId, receiptNo)
      .filter((t) => !t.dead && t.need - mine(t.orderNo) > 0.005)
      .map((t) => ({ orderNo: t.orderNo, need: t.need - mine(t.orderNo), invoiced: t.invoiced })),
    invoiceChoices: targets.filter((t) => !(t.orderNo && mine(t.orderNo)) && roomOf(t.invoiceNo) > 0.005).map((t) => ({ invoiceNo: t.invoiceNo, room: roomOf(t.invoiceNo), due: t.due })),
    discount: (() => {
      const row = ledger.find((x) => x.kind === "Receipt" && x.doc === receiptNo && x.customerId === customerId);
      const notes = row ? linkedDiscounts(row, ledger) : [];
      if (!notes.length) return null;
      return {
        no: notes.map((x) => x.doc).join(", "),
        amount: notes.reduce((sum, x) => sum + x.credit, 0),
        pending: notes.some((x) => x.pending),
        invoices: notes.flatMap((x) => (x.applied ?? []).map((l) => ({ invoiceNo: l.doc, amount: l.amount }))),
      };
    })(),
    apply: (invoiceNo, amount) => applyToInvoice(receiptNo, invoiceNo, amount),
    unapply: (invoiceNo) => unapplyFromInvoice(receiptNo, invoiceNo),
    setOrders: (os) => setOrderTags(receiptNo, os.map((o) => ({ doc: o.orderNo, amount: o.amount })), by),
  };
}

export function setOrderTags(receiptNo: string, tags: Line[], by: { name: string; via: Via }): string | null {
  const r = receiptsStore.get().find((x) => x.no === receiptNo);
  if (!r || !ours(r.customerId) || r.cancelled) return "This receipt can no longer be changed.";
  // Typed in whole rupees: up to a rupee over what an order needs is taken as what it needs.
  const wanted = tags.filter((t) => t.amount > 0).map((t) => ({ ...t }));
  const targets = orderTargets(r.customerId, receiptNo, wanted.map((t) => t.doc));
  const used = (orderNo: string) => r.allocations.filter((a) => invoiceOf(a.invoiceNo, orderNo)).reduce((sum, a) => sum + a.amount, 0);
  for (const t of wanted) {
    // A reference kept as it was is not judged again: another order being gone must not block this change.
    if ((r.orders ?? []).some((o) => o.orderNo === t.doc && Math.abs(o.amount - t.amount) < 0.005)) continue;
    const target = targets.find((x) => x.orderNo === t.doc);
    if (!target || target.dead) return `${t.doc} can no longer take a payment.`;
    if (t.amount > target.need && t.amount - target.need < 1) t.amount = target.need;
    if (t.amount > target.need) return `${t.doc} only needs NPR ${npr(target.need)}.`;
  }
  const applied = r.allocations.reduce((sum, a) => sum + a.amount, 0);
  const open = wanted.reduce((sum, t) => sum + Math.max(0, t.amount - used(t.doc)), 0);
  if (applied + open > Math.round(r.amount * r.exchangeRate)) return "That is more than the receipt holds.";
  const text = wanted.length ? `for ${says(wanted)}` : "for no order";
  updateReceipt(receiptNo, (x) => ({ ...x, orders: wanted.map((t) => ({ orderNo: t.doc, amount: t.amount })) }), by.via === "portal" ? `got a change from the portal — ${by.name} marked it ${text}` : `marked it ${text}`);
  logEvent(r.customerId, `${receiptNo} is now ${text}`, by.name);
  return null;
}

// ── A payment as the desk's receipt ─────────────────────────────────────────

/** The sales header field "Sales channel" only offers these (sales/master.tsx). */
const CHANNEL: Record<Via, string> = { rep: "Field sales", portal: "Online", office: "Counter" };
/** The field of each desk payment method (sales/master.tsx `PAYMENT_METHODS`) that holds the reference; cash has none. */
const REFERENCE_FIELD: Record<PayMethod, string | null> = { bank: "reference", cheque: "chequeNo", wallet: "txn", cash: null };
const deskMethod = (m: PayMethod) => PAYMENT_METHODS.find((x) => x.kind === m) ?? PAYMENT_METHODS[0];

type NewReceipt = Parameters<typeof addReceipt>[0];

/**
 * The receipt as the desk's own form would save it: undeposited, not tagged to an invoice — an advance until back
 * office applies it — in the subsidiary the customer's sales orders are raised in.
 */
function receiptFields(p: { customerId: string; date: string; amount: number; method?: PayMethod; reference?: string; pending: boolean; via: Via; by: string; repId?: string; visitId?: string; tags?: Line[]; note?: string }): NewReceipt {
  const method = deskMethod(p.method ?? "bank");
  const field = REFERENCE_FIELD[method.kind];
  const from = !p.by ? "" : p.via === "rep" ? `Collected by ${p.by} on ${p.visitId ? `visit ${p.visitId}` : "a visit"}.` : p.via === "portal" ? `Sent in the dealer portal by ${p.by}.` : `Recorded in the office by ${p.by}.`;
  return {
    subsidiaryId: customerById(p.customerId)?.city === "Pokhara" ? "NP-02" : "NP-01",
    customerId: p.customerId,
    date: p.date,
    methodId: method.id,
    methodFields: p.reference && field ? { [field]: p.reference } : {},
    depositTo: "Undeposited funds",
    currency: "NPR",
    exchangeRate: 1,
    amount: p.amount,
    allocations: [],
    // No tags given = a payment from before order references existed (the sample's): it settles oldest first.
    ...(p.tags ? { orders: p.tags.filter((t) => t.amount > 0).map((t) => ({ orderNo: t.doc, amount: t.amount })) } : {}),
    state: p.pending ? "pending" : "approved",
    posted: false,
    cancelled: null,
    dims: {},
    custom: { channel: CHANNEL[p.via] },
    byId: p.repId ?? ME.id,
    memo: [from, p.reference && !field ? `Reference ${p.reference}.` : "", p.note ?? ""].filter(Boolean).join(" "),
    sourceOrder: null,
    attachments: [],
  };
}

/** What only the sender knows — who sent it, in whose words — while `takeReceipt` adds its receipt. */
let sending: Pick<LedgerEntry, "by" | "note" | "reference"> | null = null;

/**
 * Take a payment: the customer receipt on the sales desk, with the desk's own next number. A rep's collection and a
 * dealer's payment are `pending` — they wait for accounts and count for nothing until then. Its ledger row is
 * written by the watcher, as for any receipt. `tags` say which sales orders it is for (none = any invoice may take
 * it). Nothing is applied: the whole amount is the customer's advance until the office applies it.
 */
export function takeReceipt(p: { customerId: string; amount: number; method: PayMethod; reference?: string; via: Via; /** The person's name. */ by: string; repId?: string; pending: boolean; visitId?: string; tags: Line[]; /** The sender's own words on what it is for, kept in the memo. */ note?: string }): Receipt {
  const reference = p.reference?.trim() || undefined;
  sending = { by: p.by, reference, note: p.via === "rep" ? (p.visitId ? `Collected on visit ${p.visitId}` : undefined) : p.via === "portal" ? "Sent in the dealer portal" : undefined };
  try {
    const no = addReceipt(receiptFields({ ...p, reference, date: SF_TODAY }));
    return receiptsStore.get().find((r) => r.no === no)!;
  } finally {
    sending = null;
  }
}

const waiting = (no: string) => receiptsStore.get().find((r) => r.no === no && r.state === "pending" && !r.rejected && !r.cancelled && ours(r.customerId));

/** Confirming a payment is approving its receipt. The account follows through the watcher. */
export function confirmReceipt(no: string) {
  if (waiting(no)) approveReceipt(no);
}

/** Rejecting a payment sends its receipt back with the reason; the watcher takes it off the account. */
export function rejectReceipt(no: string, reason: string) {
  if (waiting(no)) sendBackReceipt(no, reason);
}

/** The receipt is on the sales desk, for the same customer. */
export const receiptOnDesk = (no: string, customerId: string) => receiptsStore.get().some((r) => r.no === no && r.customerId === customerId);
export const receiptPath = (no: string) => `/design/sales/receipts/${no}`;

/**
 * The office does not key a payment into Sales force: it uses Bizak's own receipt form (the sales desk), opened with
 * the customer already chosen. What is saved there reaches the customer's account through the watcher.
 */
export const newReceiptPath = (customerId?: string | null) => `/design/sales/receipts/new${customerId ? `?cust=${encodeURIComponent(customerId)}` : ""}`;

// ── The account follows the receipt ─────────────────────────────────────────

// To the paisa: a payment of a bill less its early-payment discount is rarely whole rupees, and rounding it here
// would leave a few paisa of it "for no order".
const amountOf = (r: Receipt) => Math.round(r.amount * r.exchangeRate * 100) / 100;

function rowOf(r: Receipt): LedgerEntry {
  const field = REFERENCE_FIELD[methodById(r.methodId).kind];
  const reference = sending ? sending.reference : (field && r.methodFields[field]) || undefined;
  const note = sending ? sending.note : r.memo || undefined;
  return {
    id: `L-${r.no}`,
    customerId: r.customerId,
    // The desk mockup's clock stands still on its own TODAY: a receipt typed there "today" is today's on the account.
    date: r.date === TODAY ? SF_TODAY : r.date,
    doc: r.no,
    kind: "Receipt",
    debit: 0,
    credit: amountOf(r),
    due: null,
    ...(r.state === "pending" ? { pending: true } : {}),
    ...(appliedOf(r) ? { applied: appliedOf(r), tags: tagsOf(r) } : {}),
    method: methodById(r.methodId).kind,
    ...(reference ? { reference } : {}),
    by: sending?.by ?? personById(r.byId)?.name ?? STAFF_NAME,
    ...(note ? { note } : {}),
  };
}

/** Our receipts on the desk as the last pass saw them, number → customer: one that is gone since was deleted there. */
let seen = new Map<string, string>();

/**
 * Make the ledger agree with the desk's receipts of our customers. It acts on a difference only, so it can run on
 * every change (and after its own writes) and still confirm, reject and log each receipt once:
 *   live, no row            → the row is added, pending while the receipt is;
 *   approved, row pending   → the mark comes off the row and its early-payment credit note — both now count;
 *   sent back or cancelled  → the row and its credit note leave the account, with the reason;
 *   deleted on the desk     → the same, with no reason to give;
 *   amount, lines or tags edited → the row takes the new amount, the invoices it is applied to and the orders it is for.
 * `quiet` writes no history — the pass at load only puts things in step.
 */
function sync(quiet = false) {
  const desk = receiptsStore.get().filter((r) => ours(r.customerId));
  const before = ledgerStore.get();
  let ledger = before;
  const say: (() => void)[] = [];
  const rowFor = (no: string, customerId: string) => ledger.find((x) => x.kind === "Receipt" && x.doc === no && x.customerId === customerId);
  const withDiscounts = (row: LedgerEntry) => {
    const linked = linkedDiscounts(row, ledger);
    return { ids: new Set([row.id, ...linked.map((x) => x.id)]), disc: linked.reduce((s, x) => s + x.credit, 0) };
  };
  const drop = (row: LedgerEntry, verb: string, why: string) => {
    const { ids, disc } = withDiscounts(row);
    ledger = ledger.filter((x) => !ids.has(x.id));
    say.push(() => {
      logEvent(row.id, `${verb} the payment${why}`);
      logEvent(row.customerId, `${verb} payment ${row.doc} of NPR ${npr(row.credit)}${disc ? ` and its NPR ${npr(disc)} early-payment discount` : ""}${why}`);
    });
  };

  for (const r of desk) {
    const row = rowFor(r.no, r.customerId);
    const gone = r.cancelled ? { verb: "cancelled", reason: r.cancelled.reason } : r.rejected ? { verb: "rejected", reason: r.rejected.reason } : null;
    if (gone) {
      if (row) drop(row, gone.verb, ` — “${gone.reason}”`);
      continue;
    }
    if (!row) {
      const added = rowOf(r);
      ledger = [...ledger, added];
      // Typed on the sales desk's own form — nobody sent it through `takeReceipt`, so the account says who recorded it.
      if (!sending && !added.pending)
        say.push(() => {
          logEvent(added.id, `recorded the payment in the office — ${methodById(r.methodId).name.toLowerCase()}`);
          logEvent(added.customerId, `recorded payment ${added.doc} of NPR ${npr(added.credit)}`);
        });
      continue;
    }
    if (r.state === "approved" && row.pending) {
      const { ids, disc } = withDiscounts(row);
      ledger = ledger.map((x) => {
        if (!ids.has(x.id)) return x;
        const { pending: _pending, ...rest } = x;
        return rest;
      });
      say.push(() => {
        logEvent(row.id, `confirmed the payment${disc ? ` and its NPR ${npr(disc)} early-payment discount` : ""}`);
        logEvent(row.customerId, `confirmed ${row.doc} — NPR ${npr(row.credit + disc)} now counts${disc ? ` (NPR ${npr(disc)} of it early-payment discount)` : ""}`);
      });
    }
    const applied = appliedOf(r);
    const tags = applied ? tagsOf(r) : undefined;
    if (row.credit !== amountOf(r) || JSON.stringify(row.applied) !== JSON.stringify(applied) || JSON.stringify(row.tags) !== JSON.stringify(tags)) {
      ledger = ledger.map((x) => {
        if (x.id !== row.id) return x;
        const { applied: _was, tags: _were, ...rest } = x;
        return { ...rest, credit: amountOf(r), ...(applied ? { applied, tags } : {}) };
      });
    }
  }
  for (const [no, customerId] of seen) {
    const row = desk.some((r) => r.no === no) ? undefined : rowFor(no, customerId);
    if (row) drop(row, "deleted", "");
  }
  seen = new Map(desk.map((r) => [r.no, r.customerId]));

  if (ledger !== before) ledgerStore.set(() => ledger);
  if (!quiet) say.forEach((f) => f());
}

// ── Kept across a reload, and in step across tabs ───────────────────────────

/** Every desk receipt of a Sales force customer. The desk's own store is in memory; the account they move is saved. */
const sfReceiptsStore = persistentStore<Receipt[]>("sales.receipts", []);
/** True while this tab writes `sfReceiptsStore` itself — any other change to it comes from another tab. */
let keeping = false;
/** True while another tab's receipts are put on this tab's desk — that tab already moved the ledger and wrote the history. */
let takingIn = false;

function keep() {
  const now = receiptsStore.get().filter((r) => ours(r.customerId));
  const saved = sfReceiptsStore.get();
  if (now.length === saved.length && now.every((r, i) => r === saved[i])) return;
  keeping = true;
  try {
    sfReceiptsStore.set(() => now);
  } finally {
    keeping = false;
  }
}

// ── Payments taken before a payment was a receipt ───────────────────────────

const refile = <T>(all: Record<string, T[]>, from: string, to: string): Record<string, T[]> => {
  if (from === to || !all[from]) return all;
  const { [from]: moved, ...rest } = all;
  return { ...rest, [to]: [...(rest[to] ?? []), ...moved] };
};

/** The desk already uses the number an old payment took from the ledger: the payment takes the desk's next number, and what was filed under the old one follows. */
function renumber(row: LedgerEntry, no: string) {
  const id = row.id === `L-${row.doc}` ? `L-${no}` : row.id;
  const discounts = new Set(linkedDiscounts(row, ledgerStore.get()).map((x) => x.id));
  ledgerStore.set((l) => l.map((x) => (x.id === row.id ? { ...x, id, doc: no } : discounts.has(x.id) ? { ...x, reference: no, ...(x.note ? { note: x.note.split(row.doc).join(no) } : {}) } : x)));
  const history = refile(refile(historyStore.get(), row.id, id), row.doc, no);
  if (history !== historyStore.get()) historyStore.set(() => history);
  const notes = refile(refile(notesStore.get(), row.id, id), row.doc, no);
  if (notes !== notesStore.get()) notesStore.set(() => notes);
}

/**
 * Until owner decision #31 a payment was only a ledger row with a number of its own; the sample ledger still starts
 * that way. Every Receipt row of our customers gets its desk receipt once, in the row's state and with the row's
 * number where the desk has not used it. Nothing is logged and no balance moves.
 */
function ensureDeskReceipts() {
  for (const row of ledgerStore.get()) {
    if (row.kind !== "Receipt" || !ours(row.customerId)) continue;
    const desk = receiptsStore.get();
    if (desk.some((r) => r.no === row.doc && r.customerId === row.customerId)) continue;
    const no = desk.some((r) => r.no === row.doc) ? nextNo("RCP-", desk.map((r) => r.no)) : row.doc;
    const sender = senderOf(row);
    const fields = receiptFields({
      customerId: row.customerId,
      date: row.date,
      amount: row.credit,
      method: row.method,
      reference: row.reference,
      pending: !!row.pending,
      via: sender?.via ?? "office",
      by: sender?.name ?? "",
      repId: sender?.via === "rep" ? repsStore.get().find((x) => x.name === sender.name)?.id : undefined,
      visitId: /visit ([\w-]+)/.exec(row.note ?? "")?.[1],
    });
    // `addReceipt` always takes the next number, so this one case builds what it builds.
    const receipt: Receipt = { ...fields, id: no, no, comments: [], audit: [], created: { byId: fields.byId, on: row.date }, history: [{ id: `h-${no}-1`, whoId: fields.byId, when: fmtShort(row.date), what: row.pending ? "recorded the receipt — awaiting approval" : "recorded the receipt as an advance" }] };
    receiptsStore.set((rs) => [receipt, ...rs]);
    if (no !== row.doc) renumber(row, no);
  }
}

// ── The sales desk asks us about our customers' accounts ────────────────────

receiptBook.targets = (customerId, exceptReceiptNo) => {
  if (!ours(customerId)) return null;
  const tagged = receiptsStore.get().find((r) => r.no === exceptReceiptNo)?.orders?.map((o) => o.orderNo) ?? [];
  return { orders: orderTargets(customerId, exceptReceiptNo, tagged), invoices: invoiceTargets(customerId, exceptReceiptNo) };
};
receiptBook.use = (r) => (ours(r.customerId) && r.orders !== undefined ? (receiptUse(r.customerId, r.no) ?? { lines: [], tags: [], free: 0 }) : null);
receiptBook.money = (r) => (ours(r.customerId) ? receiptMoney(r.customerId, r.no) : null);
receiptBook.todo = (r) => (ours(r.customerId) && r.orders !== undefined && !r.cancelled && !r.rejected ? receiptTodo(r.customerId, r.no) : null);

// ── At load, then on every change ───────────────────────────────────────────

// A saved receipt whose number the desk's seed has taken is left out; its ledger row is then given a new one below.
receiptsStore.set((rs) => [...sfReceiptsStore.get().filter((x) => ours(x.customerId) && !rs.some((r) => r.no === x.no)), ...rs]);
// Every page loads this file: saved data of a shape nobody foresaw must not take the three apps down with it.
try {
  ensureDeskReceipts();
} catch (e) {
  console.warn("[sf2] receipts: an old payment could not be given its receipt", e);
}
keep();
sync(true);

receiptsStore.subscribe(() => {
  if (takingIn) return;
  keep();
  sync();
});

// The prototype runs in several tabs (Sales force, rep app, dealer portal) and each has its own desk in memory: a
// receipt taken or decided in one must be on the desk of the others, or Confirm there would find nothing to approve.
sfReceiptsStore.subscribe(() => {
  if (keeping) return;
  const saved = sfReceiptsStore.get().filter((r) => ours(r.customerId));
  takingIn = true;
  try {
    receiptsStore.set((rs) => [...saved, ...rs.filter((r) => !ours(r.customerId))]);
  } finally {
    takingIn = false;
  }
  seen = new Map(saved.map((r) => [r.no, r.customerId]));
});
