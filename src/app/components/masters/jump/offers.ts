import { TAX_LABEL, itemById, unitsOf } from "../../sales/orders";
import type { TaxCode } from "../../sales/orders";
import { PRICE_LEVELS, levelRate } from "../../sales/master";
import { money } from "../items/model";
import type { Item } from "../seed/items";
import { lineTaxOf, lineUnitOf } from "./bridge";

// ════════════════════════════════════════════════════════════════════════════
// LINE OFFERS — a master saved after a line quoted it (spec §5.2):
//
//   Sell price is now 275.00 (line has 250.00).   Use 275.00 · Keep 250.00
//
// Offered, never written: one offer per line, for the fields THIS save
// changed (rate, tax code, unit); gone after Use / Keep or an edit of that
// field. A line priced by a level is offered the re-levelled rate through
// the composer's own rule; a line whose customer fixes the tax is offered no
// tax; delivered / billed lines get nothing. Names and codes are labels —
// they patch silently.
// ════════════════════════════════════════════════════════════════════════════

export type OfferLine = { key: string; itemId: string | null; qty: number; unit: string; rate: number; priceLevel?: string; tax: TaxCode; locked: boolean };
export type OfferPart = { rate?: { to: number; from: number }; tax?: { to: TaxCode; from: TaxCode }; unit?: { to: string; from: string; rate: number } };
export type LineOfferState = { itemId: string; parts: OfferPart };

const eq = (a: number, b: number) => Math.abs(a - b) < 0.005;
const round2 = (n: number) => Math.round(n * 100) / 100;
const levelText = (level: string) => {
  const p = PRICE_LEVELS.find((x) => x.id === level)?.pct ?? 0;
  return `${level} ${p > 0 ? "+" : p < 0 ? "−" : ""}${Math.abs(p)} %`;
};

/** What the composer's own pricing gives for this line at the master's current price. */
export function pricedRate(line: Pick<OfferLine, "itemId" | "unit" | "priceLevel">, sell: number) {
  const it = line.itemId ? itemById(line.itemId) : undefined;
  const factor = it ? unitsOf(it).find((u) => u.code === line.unit)?.factor ?? 1 : 1;
  return round2(levelRate(sell, line.priceLevel) * factor);
}

/**
 * The offer for one line after `master` was saved with `fields`. `customerTax` set = the customer
 * fixes the line's tax, so an item tax change is not the document's business.
 */
export function offerFor(line: OfferLine, master: Item, fields: Partial<Item>, customerTax: TaxCode | null | undefined, sell: number): OfferPart | null {
  if (line.locked || line.itemId !== master.id) return null;
  const parts: OfferPart = {};
  if ("sales_rate" in fields) {
    const to = pricedRate(line, sell);
    if (!eq(to, line.rate)) parts.rate = { to, from: line.rate };
  }
  if (("tax_id" in fields || "taxable" in fields) && !customerTax) {
    const to = lineTaxOf(master);
    if (to !== line.tax) parts.tax = { to, from: line.tax };
  }
  if ("sales_unit_id" in fields && fields.sales_unit_id) {
    const it = itemById(master.id);
    const label = it ? lineUnitOf(it, fields.sales_unit_id) : null;
    if (label && label !== line.unit) parts.unit = { to: label, from: line.unit, rate: pricedRate({ ...line, unit: label }, sell) };
  }
  return parts.rate || parts.tax || parts.unit ? parts : null;
}

/** The sentence and the two buttons — the new value first. */
export function offerWords(line: Pick<OfferLine, "priceLevel">, o: OfferPart, sell: number) {
  const bits: string[] = [];
  if (o.rate) {
    const lvl = line.priceLevel && PRICE_LEVELS.find((x) => x.id === line.priceLevel)?.pct ? ` · ${levelText(line.priceLevel)} = ${money(o.rate.to)}` : "";
    bits.push(`Sell price is now ${money(sell)}${lvl} (line has ${money(o.rate.from)})`);
  }
  if (o.tax) bits.push(`${bits.length ? "tax" : "Tax"} is now ${TAX_LABEL[o.tax.to]} (line has ${TAX_LABEL[o.tax.from]})`);
  if (o.unit) bits.push(`${bits.length ? "sales unit" : "Sales unit"} is now ${o.unit.to} (line has ${o.unit.from})`);
  const n = [o.rate, o.tax, o.unit].filter(Boolean).length;
  const one = n === 1;
  return {
    text: `${bits.join("; ")}.`,
    use: one ? (o.rate ? `Use ${money(o.rate.to)}` : o.tax ? `Use ${TAX_LABEL[o.tax.to]}` : `Use ${o.unit!.to}`) : "Use new values",
    keep: one ? (o.rate ? `Keep ${money(o.rate.from)}` : o.tax ? `Keep ${TAX_LABEL[o.tax.from]}` : `Keep ${o.unit!.from}`) : "Keep the line",
  };
}

/** Drop the parts an edit of the line has answered; null when nothing is left. */
export function afterEdit(o: LineOfferState | undefined, edited: { rate?: unknown; tax?: unknown; unit?: unknown; itemId?: unknown }): LineOfferState | undefined {
  if (!o) return o;
  if ("itemId" in edited && edited.itemId !== o.itemId) return undefined;
  const parts = { ...o.parts };
  if ("rate" in edited) delete parts.rate;
  if ("tax" in edited) delete parts.tax;
  if ("unit" in edited) delete parts.unit;
  return parts.rate || parts.tax || parts.unit ? { ...o, parts } : undefined;
}
