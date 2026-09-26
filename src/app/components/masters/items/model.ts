import * as React from "react";
import { ITEMS as SALES_ITEMS, customerById, isOpen, readyToInvoice, remainingToDeliver } from "../../sales/orders";
import { ordersStore, useStore } from "../../sales/store";
import { purchaseOrdersStore, remainingToReceive, vendorById } from "../../purchase/receipts";
import { MASTERS_TODAY, MASTER_SUBSIDIARIES, baseOfOrg, currencyLabel, currencyStore } from "../seed/currencies";
import { locationStore } from "../seed/locations";
import { taxStore } from "../seed/taxes";
import { unitStore } from "../seed/units";
import { CATEGORIES, ITEM_CUSTOM_FIELDS, LEDGERS, PREFERENCE_DEFAULTS, attributeById, itemsStore, valueById } from "../seed/items";
import type { HistoryEntry, Item, ItemType, LedgerKind, OpenLine, StockRow, SubType } from "../seed/items";

// ════════════════════════════════════════════════════════════════════════════
// ITEM RULES — one definition per fact, read by the desk, the peek, the page
// and the create sheet alike (spec §3; ITEM-MASTER-MAP §1.2). A figure that
// the server would answer (B-I1 / B-I2 / B-I9) is derived HERE from the seed
// or, for the sales mockup's items, from the sales and purchase stores — so
// the item desk and the documents that quote the item agree.
// ════════════════════════════════════════════════════════════════════════════

export const TODAY = MASTERS_TODAY;
export const ME = "Arun Rai";
/** The org the desk reads in when the URL names none (the session org). */
export const DEFAULT_ORG = MASTER_SUBSIDIARIES[0].id;
export const orgName = (id: string) => MASTER_SUBSIDIARIES.find((s) => s.id === id)?.name ?? id;

export const useItems = () => useStore(itemsStore);
export const getItem = (id: string) => itemsStore.get().find((i) => i.id === id) ?? null;

// ── Type ────────────────────────────────────────────────────────────────────

export const TYPE_LABEL: Record<ItemType, string> = {
  inventory: "Stock item",
  non_inventory: "Non-stock",
  service: "Service",
  discount: "Discount",
  item_group: "Group",
  kit: "Kit",
};
export const SUB_LABEL: Record<Exclude<SubType, null>, string> = { resale: "Selling & buying", sale: "Selling only", purchase: "Buying only" };

/** HAS_CHILDREN && !IS_VARIANT — a template never transacts. */
export const isTemplate = (i: Item) => !!i.axes && !i.parent_id;
export const isVariant = (i: Item) => !!i.parent_id;
export const isStock = (i: Item) => i.type === "inventory";
/** Discount, group and kit carry no units, barcodes, stock or tracking. */
export const hasUnits = (i: Item) => !["discount", "item_group", "kit"].includes(i.type);
/** Sales pickers take ForSale · ForResale · null; purchase pickers ForPurchase · ForResale · null. */
export const sellable = (i: Item) => i.sub_type !== "purchase";
export const purchasable = (i: Item) => i.sub_type !== "sale";

export const typeText = (i: Item) => (isTemplate(i) ? "Template" : TYPE_LABEL[i.type]);

export const childrenOf = (all: Item[], id: string) => all.filter((x) => x.parent_id === id);
export const templateOf = (all: Item[], i: Item) => (i.parent_id ? all.find((x) => x.id === i.parent_id) ?? null : null);

/** "S · Red" — a variant's values in axis order. */
export function valuesText(all: Item[], i: Item) {
  const t = templateOf(all, i);
  if (!i.values) return "";
  const order = t?.axes?.map((a) => a.attribute_id) ?? Object.keys(i.values);
  return order.map((a) => (i.values![a] ? valueById(a, i.values![a])?.value : null)).filter(Boolean).join(" · ");
}
/** "ZZ-CLAUDE-Garment size M · ZZ-CLAUDE-Colour Red" — the variant band. */
export function valuesLong(all: Item[], i: Item) {
  const t = templateOf(all, i);
  if (!i.values) return "";
  const order = t?.axes?.map((a) => a.attribute_id) ?? Object.keys(i.values);
  return order.map((a) => (i.values![a] ? `${attributeById(a)?.name} ${valueById(a, i.values![a])?.value}` : null)).filter(Boolean).join(" · ");
}

// ── Lookups ─────────────────────────────────────────────────────────────────

export const unitName = (id: string | null | undefined) => (id ? unitStore.get().find((u) => u.id === id)?.name ?? id : null);
/** Units the item's subsidiaries reach (UNIT_MAP_ORGANISATION) — not `api/unit/all` (IMM §3.4). */
export const unitsFor = (orgs: string[]) => unitStore.get().filter((u) => !u.archived && u.orgs.some((o) => orgs.includes(o)));
export const taxName = (id: string | null | undefined) => (id ? taxStore.get().find((t) => t.id === id)?.name ?? null : null);
export const taxOptions = () => taxStore.get().filter((t) => !t.archived);
export const locationName = (id: string) => locationStore.get().find((l) => l.id === id)?.name ?? id;
export const locationsOf = (org: string) => locationStore.get().filter((l) => !l.archived && l.orgs.includes(org));
export const ledgerName = (id: string | null) => LEDGERS.find((l) => l.id === id)?.name ?? null;

/** The subsidiary's base code through `CurrencyLabel` — none when the base's code is not code-shaped (dev 186). */
export function baseCode(org: string) {
  return currencyLabel(baseOfOrg(currencyStore.get(), org));
}
/** Re-render when the currency seed changes (a Fix code in the hub turns "Nepalese Rupee" into NPR here too). */
export const useBaseCode = (org: string) => {
  useStore(currencyStore);
  return baseCode(org);
};

// ── Money and quantities ────────────────────────────────────────────────────

export const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const qty = (n: number) => (Number.isInteger(n) ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { maximumFractionDigits: 4 }));
/** A signed quantity as it is read: "−12", "+5". */
export const signed = (n: number) => (n > 0 ? `+${qty(n)}` : n < 0 ? `−${qty(-n)}` : "0");
/** Negative stock is always a sign AND a word (spec §7). */
export const negText = (n: number) => (n < 0 ? `−${qty(-n)}` : qty(n));

// ── Inherited values (ItemFamilyDefaults) ───────────────────────────────────

export type Src = "own" | "template" | "preference";
export type Eff<V> = { value: V; source: Src };

/** The five posting ledgers a variant fills from its template at read time when its own is null. */
export function effLedger(all: Item[], i: Item, kind: LedgerKind): Eff<string | null> {
  const key = `${kind}_id` as const;
  const own = i[key];
  if (own) return { value: own, source: "own" };
  const t = templateOf(all, i);
  if (t?.[key]) return { value: t[key], source: "template" };
  return { value: null, source: "own" };
}
/** A variant priced 0 reads its template's rate (the list fill); a variant with its own rate keeps it (D-6). */
export function effRate(all: Item[], i: Item, side: "sales_rate" | "purchase_rate"): Eff<number> {
  if (i[side] > 0) return { value: i[side], source: "own" };
  const t = templateOf(all, i);
  if (t && t[side] > 0) return { value: t[side], source: "template" };
  return { value: i[side], source: "own" };
}
/** Only a template has a picture; a variant shows its template's. */
export const effImage = (all: Item[], i: Item) => (i.parent_id ? templateOf(all, i)?.image ?? null : i.image);

// ── Accounts a type needs (IMM §1.2) ────────────────────────────────────────

export type LedgerNeed = { kind: LedgerKind; label: string; refuse: string };
const NEED: Record<LedgerKind, LedgerNeed> = {
  income: { kind: "income", label: "Income account", refuse: "Not set — invoices will refuse" },
  cogs: { kind: "cogs", label: "COGS account", refuse: "Not set — deliveries will refuse" },
  asset: { kind: "asset", label: "Asset account", refuse: "Not set — receipts will refuse" },
  expense: { kind: "expense", label: "Expense account", refuse: "Not set — bills will refuse" },
};

/** The ledgers a type (and its "Used for") posts to — the account pickers the page shows. Discount is inverted. */
export function ledgersFor(type: ItemType, sub: SubType): LedgerNeed[] {
  if (type === "inventory") return [NEED.income, NEED.cogs, NEED.asset];
  if (type === "item_group" || type === "kit") return [];
  const both = sub === "resale" || sub === null;
  if (type === "discount") return sub === "purchase" ? [NEED.income] : sub === "sale" ? [NEED.expense] : [NEED.income, NEED.expense];
  return sub === "purchase" ? [NEED.expense] : sub === "sale" ? [NEED.income] : both ? [NEED.income, NEED.expense] : [];
}
export const missingLedgers = (all: Item[], i: Item) => ledgersFor(i.type, i.sub_type).filter((n) => !effLedger(all, i, n.kind).value);
export const accountsMissing = (all: Item[], i: Item) => missingLedgers(all, i).length > 0;
export const preferenceLedger = (kind: LedgerKind) => PREFERENCE_DEFAULTS[kind];

// ── Stock (the ONE availability definition: on hand − committed) ────────────

const SALES_IDS = new Set(SALES_ITEMS.map((s) => s.id));
export const isSalesItem = (i: Item) => SALES_IDS.has(i.id);

/** Committed = approved, open sales-order lines not yet delivered, at their location. */
function committedFromOrders(itemId: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const o of ordersStore.get()) {
    if (o.direct || o.approval.state !== "approved" || !isOpen(o)) continue;
    for (const l of o.lines) if (l.itemId === itemId) out[o.locationId] = (out[o.locationId] ?? 0) + remainingToDeliver(l);
  }
  return out;
}

/** Stock rows for every location — the sales items read the sales mockup's on-hand. */
export function allStockRows(i: Item): StockRow[] {
  if (!isSalesItem(i)) return i.stock;
  const s = SALES_ITEMS.find((x) => x.id === i.id)!;
  const committed = committedFromOrders(i.id);
  return Object.entries(s.onHand).map(([loc, n]) => ({ location_id: loc, on_hand: n, committed: Math.min(Math.max(0, n), committed[loc] ?? 0) }));
}

export type LocStock = StockRow & { name: string; available: number };
/** Stock in one subsidiary's locations. */
export function stockIn(i: Item, org: string): LocStock[] {
  const locs = locationsOf(org).map((l) => l.id);
  return allStockRows(i)
    .filter((r) => locs.includes(r.location_id))
    .map((r) => ({ ...r, name: locationName(r.location_id), available: r.on_hand - r.committed }));
}

/** Σ available over the org's locations, base unit. A template's is its family's; a non-stock item has none. */
export function availableOf(all: Item[], i: Item, org: string): number | null {
  if (isTemplate(i)) return childrenOf(all, i.id).reduce((s, c) => s + (availableOf(all, c, org) ?? 0), 0);
  if (!isStock(i)) return null;
  return stockIn(i, org).reduce((s, r) => s + r.available, 0);
}
export function onHandOf(all: Item[], i: Item, org: string): number | null {
  if (isTemplate(i)) return childrenOf(all, i.id).reduce((s, c) => s + (onHandOf(all, c, org) ?? 0), 0);
  if (!isStock(i)) return null;
  return stockIn(i, org).reduce((s, r) => s + r.on_hand, 0);
}
/** The location that went furthest below zero — named in the negative fact's title. */
export const worstLocation = (i: Item, org: string) => stockIn(i, org).filter((r) => r.on_hand < 0).sort((a, b) => a.on_hand - b.on_hand)[0] ?? null;

// ── Open lines (B-I9) ───────────────────────────────────────────────────────

export type OpenRow = OpenLine & { href?: string };
export function openLinesOf(i: Item): OpenRow[] {
  const out: OpenRow[] = [...i.open_lines];
  if (!isSalesItem(i)) return out;
  for (const o of ordersStore.get()) {
    if (o.direct || o.approval.state !== "approved" || !isOpen(o)) continue;
    const party = customerById(o.customerId)?.name ?? o.customerId;
    for (const l of o.lines) {
      if (l.itemId !== i.id) continue;
      const d = remainingToDeliver(l);
      const inv = readyToInvoice(l);
      if (d > 0) out.push({ kind: "deliver", doc: o.no, party, qty: d, date: o.date, href: `/design/sales/orders/${o.no}` });
      if (inv > 0) out.push({ kind: "invoice", doc: o.no, party, qty: inv, date: o.date, href: `/design/sales/orders/${o.no}` });
    }
  }
  for (const p of purchaseOrdersStore.get()) {
    if (p.closed) continue;
    for (const l of p.lines) {
      if (l.itemId !== i.id) continue;
      const r = remainingToReceive(l);
      if (r > 0) out.push({ kind: "receive", doc: p.no, party: vendorById(p.vendorId)?.name ?? p.vendorId, qty: r, date: p.date, href: `/design/purchase/item-receipts` });
    }
  }
  return out;
}
export function openCounts(i: Item) {
  const rows = openLinesOf(i);
  const n = (k: OpenLine["kind"]) => rows.filter((r) => r.kind === k).length;
  return { deliver: n("deliver"), invoice: n("invoice"), receive: n("receive"), bill: n("bill"), transfer: n("transfer"), onOrder: rows.filter((r) => r.kind === "receive").reduce((s, r) => s + r.qty, 0) };
}
export const OPEN_LABEL: Record<OpenLine["kind"], string> = { deliver: "To deliver", invoice: "To invoice", receive: "To receive", bill: "To bill", transfer: "On transfer" };

// ── Gaps (Setup gaps view, statline) ────────────────────────────────────────

export const sameCode = (a: string | null | undefined, b: string | null | undefined) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
/** D-14: another item holding this code (case-insensitive, trimmed, tenant-wide). */
export const codeTakenBy = (all: Item[], code: string | null | undefined, exceptId?: string) => (code && code.trim() ? all.find((x) => x.id !== exceptId && sameCode(x.code, code)) ?? null : null);
export const duplicateCode = (all: Item[], i: Item) => !!codeTakenBy(all, i.code, i.id);
/** Sellable, not a template, and no rate after the template fill. */
export const noSellPrice = (all: Item[], i: Item) => sellable(i) && !isTemplate(i) && effRate(all, i, "sales_rate").value === 0;
/** Taxable with no code — the 13 % trap. */
export const noTaxCode = (i: Item) => i.taxable && !i.tax_id;
export const noUnit = (i: Item) => hasUnits(i) && !i.unit_id;
export const missingBarcodes = (all: Item[], t: Item) => childrenOf(all, t.id).filter((c) => !c.archived && c.barcodes.length === 0).length;

export type StockBand = "negative" | "out" | "below" | "in" | "none";
export function stockBand(all: Item[], i: Item, org: string): StockBand {
  const a = availableOf(all, i, org);
  if (a === null || isTemplate(i)) return "none";
  if (a < 0) return "negative";
  if (a === 0) return "out";
  if (i.reorder !== null && a < i.reorder) return "below";
  return "in";
}
export const belowReorder = (all: Item[], i: Item, org: string) => {
  if (isTemplate(i) || !isStock(i) || i.reorder === null) return false;
  const a = availableOf(all, i, org);
  return a !== null && a < i.reorder;
};

// ── Custom fields ───────────────────────────────────────────────────────────

export const missingCustom = (custom: Record<string, string>) => ITEM_CUSTOM_FIELDS.filter((f) => f.required && !custom[f.key]?.trim());

// ── Dates ───────────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "24 Sep" (this year) / "2 Apr 2025". */
export function shortDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return y === Number(TODAY.slice(0, 4)) ? `${d} ${MONTHS[m - 1]}` : `${d} ${MONTHS[m - 1]} ${y}`;
}
/** "14:02" today, "yesterday", "3d", else the date — the history's when. */
export function relTime(iso: string) {
  const day = iso.slice(0, 10);
  const diff = Math.round((Date.parse(TODAY) - Date.parse(day)) / 86_400_000);
  if (diff <= 0) return iso.slice(11, 16) || "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return `${diff}d`;
  return shortDate(iso);
}
export const nowIso = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;

// ── Writes (the mockup's server) ────────────────────────────────────────────

/** What each scalar field is called — the dock's list, the toasts and the history lines. */
export const FIELD_LABEL: Partial<Record<keyof Item, string>> = {
  name: "Name",
  code: "Code / SKU",
  short_cut: "Short name",
  type: "Type",
  sub_type: "Used for",
  subscription: "Subscription revenue item",
  category_id: "Category",
  brand_id: "Brand",
  description: "Description",
  sales_description: "Sales description",
  purchase_description: "Purchase description",
  hs_code: "HS code",
  weight: "Weight",
  manufacturer: "Manufacturer",
  mpn: "MPN",
  country: "Country",
  unit_id: "Base unit",
  purchase_unit_id: "Purchase unit",
  sales_unit_id: "Sales unit",
  stock_unit_id: "Stock unit",
  consumption_unit_id: "Consumption unit",
  sales_rate: "Sell price",
  purchase_rate: "Purchase price",
  discount_allowed: "Discount allowed",
  discount_pct: "Default discount %",
  discount_amt: "Default discount",
  min_sale_qty: "Min sale qty",
  max_sale_qty: "Max sale qty",
  grant_commission: "Grant commission",
  tax_id: "Tax code",
  wh_tax: "Withholding tax",
  non_posting: "Non-posting",
  income_id: "Income account",
  expense_id: "Expense account",
  asset_id: "Asset account",
  cogs_id: "COGS account",
  costing: "Costing method",
  reorder: "Reorder point",
  safety: "Safety stock",
  min_order: "Min order qty",
  max_order: "Max order qty",
  lead_days: "Lead time",
  vendor_id: "Preferred vendor",
  serial: "Serial numbers",
  batch: "Batches",
  shelf_life: "Shelf life",
  has_warranty: "Warranty",
  warranty: "Warranty period",
  end_of_life: "End of life",
  storage: "Storage condition",
  cold_chain: "Cold chain",
  controlled: "Controlled",
  apply_to_child: "Apply to child subsidiaries",
  archived: "Status",
  conversions: "Unit conversions",
  barcodes: "Barcodes",
  orgs: "Subsidiaries",
  custom: "Custom fields",
};

/** How a history line reads a value. */
export function showValue(key: keyof Item, v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (key === "archived") return v ? "Archived" : "Active";
  if (key === "orgs") return (v as string[]).map(orgName).join(", ") || "—";
  if (key === "custom") return Object.values(v as Record<string, string>).filter(Boolean).join(" · ") || "—";
  if (Array.isArray(v)) return `${v.length} row${v.length === 1 ? "" : "s"}`;
  if (key === "sales_rate" || key === "purchase_rate" || key === "discount_amt") return money(Number(v));
  if (key === "category_id") return CATEGORIES.find((c) => c.id === v)?.name ?? String(v);
  if (key === "tax_id") return taxName(v as string) ?? "—";
  if (key.endsWith("unit_id")) return unitName(v as string) ?? "—";
  if (key === "income_id" || key === "expense_id" || key === "asset_id" || key === "cogs_id") return ledgerName(v as string) ?? "—";
  if (key === "type") return TYPE_LABEL[v as ItemType];
  if (key === "sub_type") return SUB_LABEL[v as Exclude<SubType, null>];
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
/**
 * The PATCH (B-I3): only the named fields, in ONE transaction; history lines per changed field (B-I8,
 * PATCH goes through the change tracker). Returns the item as it was, for an Undo.
 */
export function patchItem(id: string, fields: Partial<Item>, who = ME): Item | null {
  const before = getItem(id);
  if (!before) return null;
  const when = nowIso();
  const lines: HistoryEntry[] = [];
  (Object.keys(fields) as (keyof Item)[]).forEach((k) => {
    const label = FIELD_LABEL[k];
    if (!label) return;
    const a = before[k];
    const b = fields[k];
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    lines.push({ id: `h-${Date.now()}-${String(k)}`, who, when, kind: "change", field: label, from: showValue(k, a), to: showValue(k, b) });
  });
  itemsStore.set((all) => all.map((x) => (x.id === id ? { ...x, ...fields, history: [...lines.reverse(), ...x.history], modified: { by: who, on: when } } : x)));
  return before;
}
/** Put a whole row back (Undo of a save). */
export const restoreItem = (prev: Item) => itemsStore.set((all) => all.map((x) => (x.id === prev.id ? prev : x)));

/** Wait like a request does, so pending states can be seen. */
export const latency = (ms = 450) => new Promise<void>((r) => window.setTimeout(r, ms));

/** Mockup switches read off the URL (`?slow=1`, `?fail=1`…): the states a reviewer asks for. */
export function useFlag(name: string) {
  const [on] = React.useState(() => new URLSearchParams(window.location.search).get(name) === "1");
  return on;
}
