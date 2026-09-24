import { itemById, lineGross } from "./orders";
import type { GLRow } from "./parts";
import { CreditMemo, DocRef, InvoiceView, Receipt, creditTotals, docLines, receiptAdvance, receiptApplied, receiptTds } from "./flow";
import type { Order } from "./orders";

// ════════════════════════════════════════════════════════════════════════════
// GL IMPACT — the postings each document makes, drawn from its own figures
// (the app's GL Impact tab reads GL_TRANSACTION; here they are derived so they
// always balance with what the record shows). Orders and estimates post
// nothing, so they have no GL section at all.
// ════════════════════════════════════════════════════════════════════════════

export function glInvoice(v: InvoiceView): GLRow[] {
  if (v.doc.state !== "approved" || v.doc.cancelled) return [];
  const t = v.totals;
  const rows: GLRow[] = [
    { account: "Accounts receivable · " + v.customer.name, debit: t.receivable, credit: 0 },
    ...(t.tds > 0 ? [{ account: "TDS receivable", debit: t.tds, credit: 0 }] : []),
    { account: "Sales revenue", debit: 0, credit: t.gross - t.bill },
    ...t.byTax.filter((x) => x.tax > 0).map((x) => ({ account: `${x.label} payable`, debit: 0, credit: x.tax })),
  ];
  const p = v.doc.paidAtSave;
  if (p) rows.push({ account: p.depositTo, debit: p.amount, credit: 0 }, { account: "Accounts receivable · " + v.customer.name, debit: 0, credit: p.amount });
  return rows;
}

export function glDelivery(r: DocRef): GLRow[] {
  if (r.doc.state !== "approved" || r.doc.cancelled) return [];
  const cost = docLines(r).reduce((s, x) => s + x.qty * (itemById(x.line.itemId)?.cost ?? 0), 0);
  if (!cost) return [];
  return [
    { account: "Cost of goods sold", debit: cost, credit: 0 },
    { account: "Inventory · finished goods", debit: 0, credit: cost },
  ];
}

export function glReceipt(r: Receipt): GLRow[] {
  if (r.state !== "approved" || r.cancelled) return [];
  const tds = receiptTds(r);
  const adv = receiptAdvance(r);
  return [
    { account: r.depositTo, debit: r.amount, credit: 0 },
    ...(tds > 0 ? [{ account: "TDS receivable", debit: tds, credit: 0 }] : []),
    { account: "Accounts receivable", debit: 0, credit: receiptApplied(r) + tds },
    ...(adv > 0 ? [{ account: "Customer advances", debit: 0, credit: adv }] : []),
  ];
}

/**
 * A return is MONEY ONLY: the item's own account head and the tax come back, the
 * customer is credited. It never touches inventory or COGS — the goods come back
 * on an ITEM RECEIPT, which is what moves stock and posts the asset (see
 * purchase/receipts). Before, the credit memo did both and the stock came back
 * with no batch or serial against it.
 */
export function glCredit(orders: Order[], c: CreditMemo): GLRow[] {
  if (c.state !== "approved" || c.cancelled) return [];
  const t = creditTotals(orders, c);
  return [
    { account: "Sales returns · item account head", debit: t.gross, credit: 0 },
    ...t.byTax.filter((x) => x.tax > 0).map((x) => ({ account: `${x.label} payable`, debit: x.tax, credit: 0 })),
    { account: "Accounts receivable", debit: 0, credit: t.total },
  ];
}

export { lineGross };
