import { ITEMS, unitsOf } from "../../sales/orders";
import type { Item as SalesItem, TaxCode } from "../../sales/orders";
import { CURRENCIES } from "../../sales/master";
import { NR_BASE_ID, baseOfOrg, currencyStore, orgOfSales } from "../seed/currencies";
import type { Currency, CurrencyState } from "../seed/currencies";
import { itemsStore } from "../seed/items";
import type { Item } from "../seed/items";
import { unitStore } from "../seed/units";
import { allStockRows, effRate, getItem, isTemplate, unitName } from "../items/model";

// ════════════════════════════════════════════════════════════════════════════
// BRIDGE — the sales composer and the item / currency masters are ONE record
// in the app; in the mockup they are two seeds. This file is the only place
// that translates between them, so the composer prices a line from the item
// master and a document's base comes from its subsidiary (spec §5, B-F6).
//
//   items      the 14 sales ITEMS are the masters' I-01…I-14 (same ids). A
//              master item the sales seed lacks (ZZ-CLAUDE-INV2, the MX2
//              variants, an item created from the picker) is added to the
//              sales list the first time a document quotes it — the way the
//              composer's "New customer" already adds to CUSTOMERS.
//              Name, code, sell price and tax follow the master on every
//              store change, so a price saved anywhere is the composer's price.
//   tax        the sales seed has three codes; the masters' VAT 13 / Exempt /
//              Zero-rated are the same three rows.
//   currency   the sales "NPR" is dev's row 28146 (its SHORTCUT reads "Nepalese
//              Rupee" until Fix code); every other code is its SHORTCUT.
// ════════════════════════════════════════════════════════════════════════════

const TAX_OF_MASTER: Record<string, TaxCode> = { "t-vat13": "VAT13", "t-exempt": "EXEMPT", "t-zero": "ZERO" };
export const MASTER_TAX_OF: Record<TaxCode, string> = { VAT13: "t-vat13", EXEMPT: "t-exempt", ZERO: "t-zero" };

/** The tax code a document line takes from the item: its own code; taxable with no code bills at 13 % (the server's trap); none = exempt. */
export function lineTaxOf(i: Item): TaxCode {
  if (i.tax_id && TAX_OF_MASTER[i.tax_id]) return TAX_OF_MASTER[i.tax_id];
  return i.taxable ? "VAT13" : "EXEMPT";
}
/** The masters' tax rows a document can carry — the three the sales tax seed has. */
export const DOCUMENT_TAX_IDS = Object.keys(TAX_OF_MASTER);

// ── Items ───────────────────────────────────────────────────────────────────

/** The unit a line shows: the sales code for the sales items ("pcs"), else the master unit's name ("Piece"). */
function unitLabel(unitId: string | null) {
  return unitName(unitId) ?? "—";
}

function toSales(i: Item): SalesItem {
  const all = itemsStore.get();
  const onHand: Record<string, number> = {};
  if (i.type === "inventory") allStockRows(i).forEach((r) => (onHand[r.location_id] = r.on_hand));
  return {
    id: i.id,
    code: i.code ?? "",
    name: i.name,
    unit: unitLabel(i.unit_id),
    rate: effRate(all, i, "sales_rate").value,
    tax: lineTaxOf(i),
    hs: i.hs_code ?? "—",
    cost: i.unit_cost ?? 0,
    units: i.conversions.filter((c) => c.unit_id && c.rate).map((c) => ({ code: unitLabel(c.unit_id), factor: c.rate! })),
    lotTracked: i.batch || undefined,
    serialTracked: i.serial || undefined,
    onHand,
  };
}

/** Keep a sales ITEMS row in step with its master: labels patch silently (✔ renameMaster), the price and tax the composer quotes follow. */
function syncOne(i: Item) {
  const s = ITEMS.find((x) => x.id === i.id);
  if (!s) return;
  s.name = i.name;
  s.code = i.code ?? "";
  s.rate = effRate(itemsStore.get(), i, "sales_rate").value;
  s.tax = lineTaxOf(i);
}

let lastSynced = itemsStore.get();
itemsStore.subscribe(() => {
  const next = itemsStore.get();
  if (next === lastSynced) return;
  const prev = new Map(lastSynced.map((x) => [x.id, x]));
  next.forEach((x) => prev.get(x.id) !== x && syncOne(x));
  lastSynced = next;
});

/** Bring every mirrored row up to the master before the composer first reads it (a price saved on the item desk earlier in this tab). */
export function syncSalesItems() {
  itemsStore.get().forEach(syncOne);
  lastSynced = itemsStore.get();
}

/**
 * The composer's item for a master id — added to the sales list on first use. A template never
 * becomes a line (it goes through the variant picker), so it is returned as null here.
 */
export function ensureSalesItem(id: string): SalesItem | null {
  const master = getItem(id);
  const existing = ITEMS.find((x) => x.id === id);
  if (existing) {
    if (master) syncOne(master);
    return existing;
  }
  if (!master || isTemplate(master)) return null;
  const s = toSales(master);
  ITEMS.push(s);
  return s;
}

/** A master unit id (`?unit=u-box`) as the line's unit: the sales code with the same CODE, else the unit's name. */
export function lineUnitOf(salesItem: SalesItem, unitId: string | null | undefined): string {
  if (!unitId) return salesItem.unit;
  const u = unitStore.get().find((x) => x.id === unitId);
  if (!u) return salesItem.unit;
  const hit = unitsOf(salesItem).find((x) => x.code.toLowerCase() === u.code.toLowerCase() || x.code.toLowerCase() === u.name.toLowerCase());
  return hit?.code ?? salesItem.unit;
}

/** The master unit id behind a line's unit label. */
export function masterUnitOf(master: Item, label: string): string | null {
  const ids = [master.unit_id, ...master.conversions.map((c) => c.unit_id)].filter((x): x is string => !!x);
  return ids.find((id) => {
    const u = unitStore.get().find((x) => x.id === id);
    return !!u && (u.code.toLowerCase() === label.toLowerCase() || u.name.toLowerCase() === label.toLowerCase());
  }) ?? null;
}

// ── Currencies ──────────────────────────────────────────────────────────────

/** The masters' row behind a document's currency code. */
export function masterCurrencyOf(st: CurrencyState, code: string): Currency | null {
  if (code === "NPR") return st.currencies.find((c) => c.id === NR_BASE_ID) ?? null;
  return st.currencies.find((c) => !c.archived && c.shortcut.trim().toUpperCase() === code.toUpperCase()) ?? null;
}
/** A masters row as the document's currency code. */
export const salesCodeOf = (c: Currency | null | undefined) => (!c ? "NPR" : c.id === NR_BASE_ID ? "NPR" : c.shortcut.trim().toUpperCase());

/** The document's base, from ITS subsidiary (`api/currency/base?organisation_id=` — B-F6), never from the currency row. */
export function documentBase(st: CurrencyState, salesSubsidiaryId: string) {
  const org = orgOfSales(salesSubsidiaryId);
  const base = baseOfOrg(st, org) ?? null;
  return { org, base, code: salesCodeOf(base) };
}

/** The currencies the composer offers: the sales list, plus the subsidiary's base when the list lacks it (HTG for Pokhara). */
export function documentCurrencies(st: CurrencyState, baseCode: string) {
  const codes = Array.from(new Set([...CURRENCIES.map((c) => c.code), baseCode]));
  return codes.map((code) => ({ code, name: CURRENCIES.find((c) => c.code === code)?.name ?? masterCurrencyOf(st, code)?.name ?? code }));
}

export const currencyState = () => currencyStore.get();
