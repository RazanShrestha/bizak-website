import { createStore } from "../../sales/store";

// ════════════════════════════════════════════════════════════════════════════
// ITEMS — the item master's seed (spec §3, §9.2; ITEM-MASTER-MAP §1)
//
// One row = one MAST_ITEM_SETUP row plus what the new summary read (B-I2)
// answers beside it: stock by location, unit cost, open lines, recent
// movements, usage (B-I5) and history (B-I8). Field names follow the columns
// (comments name each); nothing here is a column the item does not have,
// except the figures B-I1 / B-I2 / B-I5 / B-I8 / B-I9 add, which are marked.
//
// Rows:
//   • the 14 sales ITEMS (`sales/orders.tsx`, same ids I-01…I-14) so the
//     composer and the desk agree — their open lines and committed stock are
//     DERIVED from the sales / purchase stores (items/model.ts), not seeded;
//   • the dev tenant's ZZ-CLAUDE items (spec §0; purchase R7 §3), keeping
//     their real ids, codes and stock: ZZ-CLAUDE-MX2 Tee 99753 (a template,
//     S M L XL × Red Blue Black, two children at 275 so the grid shows
//     overrides), ZZ-CLAUDE-INV2 99046 (−12 at WH1 East, +5 at LOC-A186, no
//     sell price, no income account), ZZ-CLAUDE-MXT 99745 (one axis, a −1
//     variant, variants with no own ledgers), the serial / batch / service
//     test items;
//   • spec §9.2's states: a second item holding the code MPS-006 (D-14), two
//     services, a buying-only non-stock item, an archived item, a discount
//     and a kit, an item with no base unit (a legacy row — the "No unit" gap
//     and the "Choose a base unit." refusal), and a fresh stock item with no
//     movements (nothing locked; "Make this a matrix item").
// ════════════════════════════════════════════════════════════════════════════

/** SPECIAL_TYPE: 0 inventory_item · 1 non_inventory · 2 item_group · 3 discount_item · 4 service_item · 5 kit. */
export type ItemType = "inventory" | "non_inventory" | "item_group" | "discount" | "service" | "kit";
/** SUB_TYPE: 0 ForPurchase · 1 ForSale · 2 ForResale · null (both sides). */
export type SubType = "purchase" | "sale" | "resale" | null;
/** COSTING_METHOD: 0 FIFO · 1 LIFO · 2 Average · 3 Standard. */
export type Costing = "FIFO" | "LIFO" | "Average" | "Standard";

/** ITEM_UNIT_CONVERSION_RATE_MAP: 1 POSSIBLE_UNIT = CONVERSION_RATE × the item's base unit. */
export type Conversion = { id: string; unit_id: string | null; rate: number | null };
/** ITEM_BAR_CODE: BARCODE, UNIT_ID, SALES_RATE (null = the item's price), DISCOUNT. */
export type Barcode = { id: string; barcode: string | null; unit_id: string | null; price: number | null; discount: number | null };
/** STOCK_ITEM_BALANCE per location, through the ONE availability definition (bizak-stock-costing). */
export type StockRow = { location_id: string; on_hand: number; committed: number };
/** A recent STOCK_ITEM_MOVEMENT (B-I2 `recent_movements`). */
export type Movement = { date: string; doc: string; kind: string; qty: number; location_id: string; balance: number };
/** B-I9 open lines, for items no sales / purchase mockup document carries. */
export type OpenLine = { kind: "deliver" | "invoice" | "receive" | "bill" | "transfer"; doc: string; party: string; qty: number; date: string };
/** B-I8 record history: a field change (old → new), a note, or the creation. */
export type HistoryEntry = { id: string; who: string; when: string; kind: "change" | "note" | "created"; field?: string; from?: string; to?: string; text?: string };
export type ItemFile = { name: string; size: string; by: string; on: string };

export type Item = {
  /** ITEM.ID */
  id: string;
  /** ITEM_CODE — free text, no numbering; ≤ 500. */
  code: string | null;
  /** ITEM_NAME */
  name: string;
  /** SHORT_CUT */
  short_cut: string | null;
  /** SPECIAL_TYPE (+ IS_MAINTAIN_STOCK, written by the server to match). */
  type: ItemType;
  /** SUB_TYPE — "Used for". */
  sub_type: SubType;
  /** IS_SUBSCRIPTION_TYPE */
  subscription: boolean;
  /** IS_INACTIVE */
  archived: boolean;
  /** PARENT_ID (a variant's template). */
  parent_id: string | null;
  /** ITEM_MATRIX_ATTRIBUTE + the ticked values — a template's axes. */
  axes: { attribute_id: string; value_ids: string[] }[] | null;
  /** ITEM_VARIANT_ATTRIBUTE_VALUE — a variant's combination (attribute → value). */
  values: Record<string, string> | null;
  /** ITEM_CATEGORY_ID */
  category_id: string | null;
  /** BRAND_ID (the server writes BRAND_NAME from it — B-I3). */
  brand_id: string | null;
  /** ITEM_DESCRIPTION · SALES_DESCRIPTION · PURCHASE_DESCRIPTION */
  description: string | null;
  sales_description: string | null;
  purchase_description: string | null;
  /** HS_CODE */
  hs_code: string | null;
  /** ITEM_WEIGHT — a string column; the unit is in the text. */
  weight: string | null;
  /** MANUFACTURER · MPN · MANUFACTURER_COUNTRY */
  manufacturer: string | null;
  mpn: string | null;
  country: string | null;
  /** STANDARD_UNIT_ID — the base unit. */
  unit_id: string | null;
  /** PURCHASE_UNIT_ID · SALES_UNIT_ID · STOCK_UNIT_ID · CONSUMPTION_OUT_UNIT_ID */
  purchase_unit_id: string | null;
  sales_unit_id: string | null;
  stock_unit_id: string | null;
  consumption_unit_id: string | null;
  conversions: Conversion[];
  /** INITIAL_SALES_RATE · INITIAL_PURCHASE_RATE */
  sales_rate: number;
  purchase_rate: number;
  /** IS_DISCOUNT_ALLOWED · DEFAULT_DISCOUNT_PERCENTAGE ⇄ DEFAULT_DISCOUNT_AMOUNT */
  discount_allowed: boolean;
  discount_pct: number;
  discount_amt: number;
  /** MINIMUN_SALES_QUANTITY · MAX_SALES_QUANTITY */
  min_sale_qty: number | null;
  max_sale_qty: number | null;
  /** IS_GRANT_COMISION */
  grant_commission: boolean;
  /** TAX_ID (the server re-reads TAX_PERCENTAGE). */
  tax_id: string | null;
  /** IS_TAXABLE — picking a code sets it and "None" clears both; legacy rows can be taxable with no code (the 13 % trap). */
  taxable: boolean;
  /** WH_TAX_CODE */
  wh_tax: string | null;
  /** IS_NON_POSTING */
  non_posting: boolean;
  /** INCOME_ / EXPENSE_ / ASSET_ / COGS_ACCOUNT_ID */
  income_id: string | null;
  expense_id: string | null;
  asset_id: string | null;
  cogs_id: string | null;
  /** The seven variance / WIP ledgers — shown read-only, only when set. */
  other_ledgers: { label: string; ledger_id: string }[];
  /** COSTING_METHOD (inventory only). */
  costing: Costing | null;
  /** REORDER_MINIMUN_QUANTITY (one value, all locations) · SAFETY_STOCK_LEVEL · MINIMUN_ / MAXIMUM_ORDER_QUANTITY · LEAD_TIME_IN_DAYS */
  reorder: number | null;
  safety: number | null;
  min_order: number | null;
  max_order: number | null;
  lead_days: number | null;
  /** VENDOR_ID — the preferred vendor. */
  vendor_id: string | null;
  /** IS_SERIALIZED · IS_BATCH_NO */
  serial: boolean;
  batch: boolean;
  /** LIFE_IN_DAYS · HAS_WARRANTY + WARRANTY_PERIOD · END_OF_LIFE */
  shelf_life: number | null;
  has_warranty: boolean;
  warranty: string | null;
  end_of_life: string | null;
  /** STORAGE_CONDITION · IS_COLD_CHAIN · IS_CONTROLLED */
  storage: string | null;
  cold_chain: boolean;
  controlled: boolean;
  barcodes: Barcode[];
  /** ITEM_MAP_ORGANISATION · APPLY_TO_CHILD */
  orgs: string[];
  apply_to_child: boolean;
  /** Custom field values (entity 41). */
  custom: Record<string, string>;
  /** The DEFAULT_FILE map row: a picture, a row whose file is gone from disk, or none. */
  image: "set" | "missing" | null;
  /** FILE_ENTITY_MAP rows, DEFAULT_FILE = false. */
  files: ItemFile[];

  // ── What the summary read answers (B-I2), not item columns ──────────────
  /** Stock rows — sales items take theirs from the sales mockup's ITEMS.onHand (model.ts). */
  stock: StockRow[];
  /** Unit cost through BuildValuationRowsAsync. */
  unit_cost: number | null;
  /** Any STOCK_ITEM_MOVEMENT — what locks type, base unit, costing and tracking (B-I4, D-8). */
  has_movements: boolean;
  open_lines: OpenLine[];
  /** B-I15 (nice): sold in the last 30 days; absent when not returned. */
  sold_30d: { qty: number; amount: number } | null;
  movements: Movement[];
  /** B-I5: documents that reference it. */
  usage: number;
  /** ITEM_PRICE rows (POS price list, read by POS only). */
  pos_prices: number;
  history: HistoryEntry[];
  created: { by: string; on: string };
  /** MODIFIED_DATE — the PATCH's `expected_modified_date`. */
  modified: { by: string; on: string };
};

// ── Lookups the item form picks from ────────────────────────────────────────

/** MAST_CATEGORY_SETUP — one per item, flat. "Uncategorised" is no category. */
export const CATEGORIES = [
  { id: "c-garments", name: "Garments" },
  { id: "c-groceries", name: "Groceries" },
  { id: "c-industrial", name: "Industrial" },
  { id: "c-networking", name: "Networking" },
];
export const categoryName = (id: string | null) => CATEGORIES.find((c) => c.id === id)?.name ?? null;

/** BRAND */
export const BRANDS = [
  { id: "b-everest", name: "Everest Pumps" },
  { id: "b-himalnet", name: "HimalNet" },
  { id: "b-sagarmatha", name: "Sagarmatha" },
  { id: "b-suryodaya", name: "Suryodaya Solar" },
];
export const brandName = (id: string | null) => BRANDS.find((b) => b.id === id)?.name ?? null;

/** LEDGER rows the account pickers offer (ids from dev org 186 where the ledger is real). */
export type LedgerKind = "income" | "expense" | "asset" | "cogs";
export const LEDGERS: { id: string; name: string; kind: LedgerKind }[] = [
  { id: "18103", name: "Sales Revenue", kind: "income" },
  { id: "18109", name: "Service Income", kind: "income" },
  { id: "18099", name: "Operating Income", kind: "income" },
  { id: "18046", name: "Inventory Adjustment", kind: "income" },
  { id: "18131", name: "Purchases", kind: "expense" },
  { id: "18134", name: "Packaging Expense", kind: "expense" },
  { id: "18140", name: "Discount Allowed", kind: "expense" },
  { id: "18086", name: "Inventory", kind: "asset" },
  { id: "18122", name: "Cost of Sales", kind: "cogs" },
  { id: "18125", name: "Cost of Goods Sold", kind: "cogs" },
];
export const ledgerName = (id: string | null) => LEDGERS.find((l) => l.id === id)?.name ?? null;

/** Preference Setup → GLOBAL_DEFAULTS (salesAccount, expenseAccount, assetAccount, cogsAccount). */
export const PREFERENCE_DEFAULTS: Record<LedgerKind, string> = { income: "18103", expense: "18131", asset: "18086", cogs: "18122" };

/** WITH_HOLDING_TAX_TYPE — the one TDS code dev has. */
export const WH_TAXES = [{ id: "21", name: "ZZ-CLAUDE-TDS-15" }];

/** ACCOUNTING_LIST type 8 — price levels; a level re-prices a line as rate × (100 − DISCOUNT_RATE) / 100. */
export const PRICE_LEVELS = [
  { id: "pl-retail", name: "Retail", discount: 0 },
  { id: "pl-wholesale", name: "Wholesale", discount: 5 },
  { id: "pl-dealer", name: "Dealer", discount: 8 },
];

/** ITEM_ATTRIBUTE + ITEM_ATTRIBUTE_VALUE (ABBREVIATION unique per attribute). */
export type Attribute = { id: string; name: string; values: { id: string; value: string; abbr: string }[] };
export const ATTRIBUTES: Attribute[] = [
  {
    id: "a-size",
    name: "ZZ-CLAUDE-Garment size",
    values: [
      { id: "v-s", value: "S", abbr: "S" },
      { id: "v-m", value: "M", abbr: "M" },
      { id: "v-l", value: "L", abbr: "L" },
      { id: "v-xl", value: "XL", abbr: "XL" },
      { id: "v-xxl", value: "XXL", abbr: "XXL" },
    ],
  },
  {
    id: "a-colour",
    name: "ZZ-CLAUDE-Colour",
    values: [
      { id: "v-red", value: "Red", abbr: "RED" },
      { id: "v-blue", value: "Blue", abbr: "BLU" },
      { id: "v-black", value: "Black", abbr: "BLK" },
      { id: "v-white", value: "White", abbr: "WHT" },
    ],
  },
  {
    id: "a-zzsize",
    name: "ZZ-CLAUDE-SIZE",
    values: [
      { id: "v-zzs", value: "ZZ-S", abbr: "ZZ-S" },
      { id: "v-zzm", value: "ZZ-M", abbr: "ZZ-M" },
      { id: "v-zzl", value: "ZZ-L", abbr: "ZZ-L" },
    ],
  },
];
export const attributeById = (id: string) => ATTRIBUTES.find((a) => a.id === id);
export const valueById = (attrId: string, valueId: string) => attributeById(attrId)?.values.find((v) => v.id === valueId);

/** The tenant's custom fields for entity 41 (`field-list?entityType=41`). */
export const ITEM_CUSTOM_FIELDS: { key: string; label: string; type: "text" | "select"; options?: string[]; required?: boolean }[] = [
  { key: "warranty_terms", label: "Warranty terms", type: "text", required: true },
  { key: "origin", label: "Country of origin", type: "select", options: ["Nepal", "India", "China", "Other"] },
];

// ── Seed ────────────────────────────────────────────────────────────────────

const BLANK: Omit<Item, "id" | "code" | "name" | "type"> = {
  short_cut: null,
  sub_type: null,
  subscription: false,
  archived: false,
  parent_id: null,
  axes: null,
  values: null,
  category_id: null,
  brand_id: null,
  description: null,
  sales_description: null,
  purchase_description: null,
  hs_code: null,
  weight: null,
  manufacturer: null,
  mpn: null,
  country: null,
  unit_id: null,
  purchase_unit_id: null,
  sales_unit_id: null,
  stock_unit_id: null,
  consumption_unit_id: null,
  conversions: [],
  sales_rate: 0,
  purchase_rate: 0,
  discount_allowed: false,
  discount_pct: 0,
  discount_amt: 0,
  min_sale_qty: null,
  max_sale_qty: null,
  grant_commission: true,
  tax_id: "t-vat13",
  taxable: true,
  wh_tax: null,
  non_posting: false,
  income_id: null,
  expense_id: null,
  asset_id: null,
  cogs_id: null,
  other_ledgers: [],
  costing: null,
  reorder: null,
  safety: null,
  min_order: null,
  max_order: null,
  lead_days: null,
  vendor_id: null,
  serial: false,
  batch: false,
  shelf_life: null,
  has_warranty: false,
  warranty: null,
  end_of_life: null,
  storage: null,
  cold_chain: false,
  controlled: false,
  barcodes: [],
  orgs: ["186"],
  apply_to_child: false,
  custom: { warranty_terms: "None" },
  image: null,
  files: [],
  stock: [],
  unit_cost: null,
  has_movements: false,
  open_lines: [],
  sold_30d: null,
  movements: [],
  usage: 0,
  pos_prices: 0,
  history: [],
  created: { by: "Yepa Sherpa", on: "2026-06-12T10:20" },
  modified: { by: "Yepa Sherpa", on: "2026-06-12T10:20" },
};

let bc = 0;
const barcode = (code: string, unit_id: string, price: number | null = null, discount: number | null = null): Barcode => ({ id: `bc-${++bc}`, barcode: code, unit_id, price, discount });
let cv = 0;
const conv = (unit_id: string, rate: number): Conversion => ({ id: `cv-${++cv}`, unit_id, rate });
let hs = 0;
const change = (who: string, when: string, field: string, from: string, to: string): HistoryEntry => ({ id: `h-${++hs}`, who, when, kind: "change", field, from, to });
const note = (who: string, when: string, text: string): HistoryEntry => ({ id: `h-${++hs}`, who, when, kind: "note", text });
const created = (who: string, when: string): HistoryEntry => ({ id: `h-${++hs}`, who, when, kind: "created" });

/** A stock item: inventory, FIFO, the three posting ledgers set from Preference. */
const stockItem = (p: Partial<Item> & Pick<Item, "id" | "code" | "name">): Item => ({
  ...BLANK,
  type: "inventory",
  costing: "FIFO",
  income_id: "18103",
  asset_id: "18086",
  cogs_id: "18122",
  has_movements: true,
  ...p,
});

/** A sales-mockup item: stock rows are read from sales ITEMS.onHand by the model; the rest is the item's own. */
const salesItem = (p: Partial<Item> & Pick<Item, "id" | "code" | "name">): Item =>
  stockItem({ orgs: ["186", "194"], apply_to_child: true, image: "set", custom: { warranty_terms: "12 months, parts only", origin: "India" }, ...p });

const SIZES = ["v-s", "v-m", "v-l", "v-xl"];
const COLOURS = ["v-red", "v-blue", "v-black"];
const MX2_IDS = Array.from({ length: 12 }, (_, i) => String(99754 + i));

function mx2Children(): Item[] {
  const out: Item[] = [];
  let i = 0;
  for (const s of SIZES) {
    for (const c of COLOURS) {
      const sv = valueById("a-size", s)!;
      const cvv = valueById("a-colour", c)!;
      const code = `ZZ-CLAUDE-MX2-${sv.abbr}-${cvv.abbr}`;
      const override = (s === "v-m" && c === "v-red") || (s === "v-l" && c === "v-blue");
      // Two XL children drifted from the template's tax (family-drift has no UI today).
      const drift = s === "v-xl" && (c === "v-red" || c === "v-black");
      out.push({
        ...BLANK,
        id: MX2_IDS[i++],
        code,
        name: `ZZ-CLAUDE-MX2 Tee-${sv.value}-${cvv.value}`,
        type: "inventory",
        costing: "FIFO",
        parent_id: "99753",
        values: { "a-size": s, "a-colour": c },
        category_id: "c-garments",
        unit_id: "u-box",
        sales_rate: override ? 275 : 250,
        purchase_rate: 120,
        tax_id: drift ? null : "t-vat13",
        taxable: true,
        barcodes: [barcode(code, "u-box")],
        stock: [{ location_id: "L-A186", on_hand: 0, committed: 0 }],
        unit_cost: null,
        has_movements: false,
        custom: { warranty_terms: "None" },
        history: [created("Arun Rai", "2026-09-21T15:40")],
        created: { by: "Arun Rai", on: "2026-09-21T15:40" },
        modified: { by: "Arun Rai", on: override ? "2026-09-23T11:05" : "2026-09-21T15:40" },
      });
    }
  }
  return out;
}

export const ITEM_SEED: Item[] = [
  // ── The sales mockup's items ──────────────────────────────────────────────
  salesItem({
    id: "I-01", code: "ICP-A220", name: "Industrial Coupling A-220", category_id: "c-industrial", unit_id: "u-pcs", conversions: [conv("u-box", 6)],
    sales_unit_id: "u-pcs", purchase_unit_id: "u-box", sales_rate: 18_500, purchase_rate: 13_200, unit_cost: 12_900, hs_code: "8483.60",
    reorder: 20, safety: 10, min_order: 12, lead_days: 14, weight: "2.4 kg", manufacturer: "Sagarmatha Engineering", mpn: "SE-ICP-220", country: "Nepal",
    barcodes: [barcode("8901234512205", "u-pcs"), barcode("8901234512212", "u-box", 108_000)],
    movements: [
      { date: "2026-09-22", doc: "DC-0051", kind: "Delivery", qty: -6, location_id: "L-KTM", balance: 42 },
      { date: "2026-09-10", doc: "GRN-0029", kind: "Item receipt", qty: 24, location_id: "L-KTM", balance: 48 },
    ],
    usage: 41, pos_prices: 2, sold_30d: { qty: 26, amount: 481_000 },
    history: [change("Sneha Maharjan", "2026-09-18T10:12", "Sell price", "17,900.00", "18,500.00"), created("Yepa Sherpa", "2026-03-02T09:00")],
    modified: { by: "Sneha Maharjan", on: "2026-09-18T10:12" },
  }),
  salesItem({
    id: "I-02", code: "HP7-2026", name: "Hydraulic Pump HP-7", category_id: "c-industrial", brand_id: "b-everest", unit_id: "u-pcs", batch: true,
    sales_rate: 142_000, purchase_rate: 104_000, unit_cost: 104_000, hs_code: "8413.70", reorder: 5, safety: 2, lead_days: 30, has_warranty: true, warranty: "2 years",
    other_ledgers: [{ label: "Price variance", ledger_id: "18046" }],
    barcodes: [barcode("8901234560022", "u-pcs")],
    movements: [{ date: "2026-09-19", doc: "DC-0050", kind: "Delivery", qty: -4, location_id: "L-KTM", balance: 3 }],
    usage: 12, history: [change("Manas Singh", "2026-09-02T16:45", "Reorder point", "3", "5"), created("Yepa Sherpa", "2026-02-11T11:30")],
    modified: { by: "Manas Singh", on: "2026-09-02T16:45" },
  }),
  salesItem({
    id: "I-03", code: "MPS-006", name: "Mounting Plate Set", category_id: "c-industrial", unit_id: "u-pkg", sales_rate: 11_200, purchase_rate: 7_600, unit_cost: 7_400, hs_code: "7326.90",
    reorder: 40, barcodes: [barcode("8901234571011", "u-pkg")], usage: 33, created: { by: "Yepa Sherpa", on: "2026-01-20T10:00" },
    history: [created("Yepa Sherpa", "2026-01-20T10:00")],
  }),
  salesItem({
    id: "I-04", code: "SVC-INS", name: "Service & Installation", type: "service", sub_type: "sale", costing: null, asset_id: null, cogs_id: null, income_id: "18109",
    unit_id: "u-hrs", sales_rate: 3_800, purchase_rate: 0, unit_cost: null, tax_id: "t-exempt", hs_code: "9987.00", has_movements: false, image: null,
    usage: 64, sold_30d: { qty: 46, amount: 174_800 }, custom: { warranty_terms: "Workmanship, 90 days" },
    history: [change("Sneha Maharjan", "2026-08-30T12:20", "Sell price", "3,500.00", "3,800.00"), created("Yepa Sherpa", "2026-01-05T09:30")],
    modified: { by: "Sneha Maharjan", on: "2026-08-30T12:20" },
  }),
  salesItem({
    id: "I-05", code: "NDL-70G", name: "Instant Noodles 70g", category_id: "c-groceries", unit_id: "u-ctn", conversions: [conv("u-pkt", 1 / 30)], batch: true,
    sales_rate: 1_440, purchase_rate: 1_080, unit_cost: 1_080, hs_code: "1902.30", shelf_life: 270, storage: "Cool, dry place", reorder: 200, country: "Nepal",
    barcodes: [barcode("8901058851472", "u-ctn"), barcode("8901058851489", "u-pkt", 52)], usage: 88, custom: { warranty_terms: "None", origin: "Nepal" },
  }),
  salesItem({
    id: "I-06", code: "CFE-ARB1", name: "Arabica Beans 1kg", category_id: "c-groceries", unit_id: "u-bag", batch: true, vendor_id: "V-2004",
    sales_rate: 2_950, purchase_rate: 2_100, unit_cost: 2_100, hs_code: "0901.11", reorder: 100, safety: 40, lead_days: 7, shelf_life: 365, storage: "Cool, dry place",
    barcodes: [barcode("8901234599015", "u-bag")], usage: 27, custom: { warranty_terms: "None", origin: "Nepal" },
    history: [note("Manas Singh", "2026-09-20T09:10", "New season beans arrive with PO-0234 — hold the Dealer quotes until then."), created("Yepa Sherpa", "2026-04-18T14:00")],
  }),
  salesItem({
    id: "I-07", code: "PVC-110", name: "PVC Pipe 110mm × 6m", category_id: "c-industrial", brand_id: "b-sagarmatha", unit_id: "u-len", conversions: [conv("u-bundle", 10)], vendor_id: "V-2001",
    sales_rate: 2_180, purchase_rate: 1_610, unit_cost: 1_610, hs_code: "3917.23", reorder: 150, min_order: 100, lead_days: 10, usage: 52,
  }),
  salesItem({
    id: "I-08", code: "CEM-OPC", name: "OPC Cement 50kg", unit_id: "u-bag", conversions: [conv("u-ton", 20)], vendor_id: "V-2012",
    sales_rate: 865, purchase_rate: 690, unit_cost: 690, hs_code: "2523.29", reorder: 500, usage: 71, country: "Nepal", custom: { warranty_terms: "None", origin: "Nepal" },
  }),
  salesItem({
    id: "I-09", code: "RTR-AX6", name: "Wi-Fi 6 Router AX6", category_id: "c-networking", brand_id: "b-himalnet", unit_id: "u-pcs", serial: true, vendor_id: "V-2009",
    sales_rate: 9_900, purchase_rate: 7_150, unit_cost: 7_150, hs_code: "8517.62", reorder: 20, has_warranty: true, warranty: "1 year", country: "China",
    barcodes: [barcode("6935364052781", "u-pcs")], usage: 23, custom: { warranty_terms: "1 year, replacement", origin: "China" },
  }),
  salesItem({
    id: "I-10", code: "UREA-50", name: "Urea Fertiliser 50kg", unit_id: "u-bag", tax_id: "t-exempt", sales_rate: 1_120, purchase_rate: 980, unit_cost: 980, hs_code: "3102.10", usage: 18,
  }),
  salesItem({
    id: "I-11", code: "SPR-KIT", name: "Pump Seal Spare Kit", category_id: "c-industrial", brand_id: "b-everest", unit_id: "u-kit", sales_rate: 6_400, purchase_rate: 4_300, unit_cost: 4_300,
    hs_code: "8484.90", reorder: 30, usage: 15,
  }),
  salesItem({
    id: "I-12", code: "FBR-24C", name: "Fibre Patch Cable 24-core", category_id: "c-networking", brand_id: "b-himalnet", unit_id: "u-pcs", sales_rate: 4_350, purchase_rate: 3_050, unit_cost: 3_050,
    hs_code: "8544.70", usage: 20,
    // The one seeded item without the required custom field — its page refuses a Save with "Fill Warranty terms.".
    custom: { origin: "China" },
  }),
  salesItem({
    id: "I-13", code: "SIN-5K", name: "Solar Inverter 5kVA", brand_id: "b-suryodaya", unit_id: "u-pcs", batch: true, serial: true, vendor_id: "V-2009",
    sales_rate: 168_000, purchase_rate: 121_000, unit_cost: 121_000, hs_code: "8504.40", reorder: 12, lead_days: 45, has_warranty: true, warranty: "5 years", usage: 9,
    custom: { warranty_terms: "5 years on the unit", origin: "China" },
  }),
  salesItem({
    id: "I-14", code: "SEM-3P", name: "Smart Energy Meter 3-phase", unit_id: "u-pcs", conversions: [conv("u-box", 10)], batch: true, serial: true, vendor_id: "V-2009",
    sales_rate: 24_500, purchase_rate: 17_800, unit_cost: 17_800, hs_code: "9028.30", usage: 14, custom: { warranty_terms: "2 years", origin: "China" },
  }),

  // ── D-14: a second item holding MPS-006 (an existing duplicate — flagged, never blocking) ──
  stockItem({
    id: "99812", code: "MPS-006", name: "Mounting Plate Set — Heavy", category_id: "c-industrial", unit_id: "u-pkg", sales_rate: 13_800, purchase_rate: 9_300, unit_cost: 9_150,
    orgs: ["186"], stock: [{ location_id: "L-KTM", on_hand: 12, committed: 0 }], usage: 3,
    movements: [{ date: "2026-09-12", doc: "GRN-0030", kind: "Item receipt", qty: 12, location_id: "L-KTM", balance: 12 }],
    history: [note("Bibek Thapa", "2026-09-12T13:00", "Imported from the old catalogue — same code as the light set."), created("Bibek Thapa", "2026-09-12T12:55")],
    created: { by: "Bibek Thapa", on: "2026-09-12T12:55" }, modified: { by: "Bibek Thapa", on: "2026-09-12T12:55" },
  }),

  // ── Dev: ZZ-CLAUDE-INV2 — negative, no price, no income account, has movements ──
  stockItem({
    id: "99046", code: "ZZ-CLAUDE-INV-2", name: "ZZ-CLAUDE-INV2", unit_id: "u-piece", conversions: [conv("u-carton-qa", 12)], income_id: null,
    orgs: ["186", "194"], sales_rate: 0, purchase_rate: 0, unit_cost: 820,
    stock: [
      { location_id: "L-WH1E", on_hand: -12, committed: 0 },
      { location_id: "L-A186", on_hand: 5, committed: 0 },
    ],
    movements: [
      { date: "2026-09-24", doc: "DC-0052", kind: "Delivery", qty: -3, location_id: "L-WH1E", balance: -12 },
      { date: "2026-09-22", doc: "DC-0049", kind: "Delivery", qty: -9, location_id: "L-WH1E", balance: -9 },
      { date: "2026-09-18", doc: "GRN-0031", kind: "Item receipt", qty: 5, location_id: "L-A186", balance: 5 },
    ],
    open_lines: [{ kind: "invoice", doc: "DC-0052", party: "Balkhu Wholesale Depot", qty: 3, date: "2026-09-24" }],
    usage: 14, custom: { warranty_terms: "6 months" },
    history: [
      note("Arun Rai", "2026-09-24T16:10", "Negative at WH1 East — DC-0052 went out before the receipt was posted."),
      change("Yepa Sherpa", "2026-09-19T10:05", "Costing method", "Average", "FIFO"),
      created("Yepa Sherpa", "2026-09-11T09:40"),
    ],
    created: { by: "Yepa Sherpa", on: "2026-09-11T09:40" }, modified: { by: "Arun Rai", on: "2026-09-24T16:10" },
  }),

  // ── Dev: ZZ-CLAUDE-MX2 Tee — template of 12; its picture's file is missing on disk ──
  stockItem({
    id: "99753", code: "ZZ-CLAUDE-MX2", name: "ZZ-CLAUDE-MX2 Tee", category_id: "c-garments", unit_id: "u-box", income_id: "18103", cogs_id: "18125",
    axes: [{ attribute_id: "a-size", value_ids: SIZES }, { attribute_id: "a-colour", value_ids: COLOURS }],
    sales_rate: 250, purchase_rate: 120, image: "missing", has_movements: false, stock: [], unit_cost: null, usage: 0,
    description: "Crew-neck tee, 180 gsm cotton.",
    history: [change("Arun Rai", "2026-09-21T15:38", "Sell price", "0.00", "250.00"), created("Arun Rai", "2026-09-21T15:31")],
    created: { by: "Arun Rai", on: "2026-09-21T15:31" }, modified: { by: "Arun Rai", on: "2026-09-21T15:38" },
  }),
  ...mx2Children(),

  // ── Dev: ZZ-CLAUDE-MXT — one axis; variants carry no ledgers of their own (they inherit) ──
  stockItem({
    id: "99745", code: "ZZ-CLAUDE-MXT", name: "ZZ-CLAUDE-MXT", unit_id: "u-box", income_id: "18103", cogs_id: "18125", tax_id: null, taxable: false,
    axes: [{ attribute_id: "a-zzsize", value_ids: ["v-zzs", "v-zzm"] }], sales_rate: 150, purchase_rate: 100, has_movements: false, stock: [],
    history: [change("Arun Rai", "2026-09-22T10:02", "Income account", "—", "Sales Revenue"), created("Arun Rai", "2026-09-20T13:15")],
    created: { by: "Arun Rai", on: "2026-09-20T13:15" }, modified: { by: "Arun Rai", on: "2026-09-22T10:02" },
  }),
  stockItem({
    id: "99746", code: "ZZ-CLAUDE-MXT-ZZ-S", name: "ZZ-CLAUDE-MXT-ZZ-S", parent_id: "99745", values: { "a-zzsize": "v-zzs" }, unit_id: "u-box", income_id: null, asset_id: null, cogs_id: null, tax_id: null, taxable: false,
    sales_rate: 150, purchase_rate: 100, unit_cost: 100, barcodes: [barcode("ZZ-CLAUDE-MXT-ZZS", "u-box")],
    stock: [{ location_id: "L-A186", on_hand: -1, committed: 0 }],
    movements: [{ date: "2026-09-23", doc: "DC-0048", kind: "Delivery", qty: -1, location_id: "L-A186", balance: -1 }],
    usage: 3, created: { by: "Arun Rai", on: "2026-09-20T13:16" }, modified: { by: "Arun Rai", on: "2026-09-20T13:16" }, history: [created("Arun Rai", "2026-09-20T13:16")],
  }),
  stockItem({
    id: "99747", code: "ZZ-CLAUDE-MXT-ZZ-M", name: "ZZ-CLAUDE-MXT-ZZ-M", parent_id: "99745", values: { "a-zzsize": "v-zzm" }, unit_id: "u-box", income_id: null, asset_id: null, cogs_id: null, tax_id: null, taxable: false,
    sales_rate: 150, purchase_rate: 100, has_movements: false, barcodes: [barcode("ZZ-CLAUDE-MXT-ZZM", "u-box")], stock: [],
    created: { by: "Arun Rai", on: "2026-09-20T13:16" }, modified: { by: "Arun Rai", on: "2026-09-20T13:16" }, history: [created("Arun Rai", "2026-09-20T13:16")],
  }),

  // ── Dev: tracked and plain test items ─────────────────────────────────────
  stockItem({
    id: "99741", code: "ZZ-CLAUDE-SERITEM", name: "ZZ-CLAUDE-SERITEM", unit_id: "u-piece", serial: true, sales_rate: 1_500, purchase_rate: 1_100, unit_cost: 1_100, cogs_id: "18125",
    stock: [{ location_id: "L-B186", on_hand: 3, committed: 0 }],
    movements: [{ date: "2026-09-16", doc: "GRN-0014", kind: "Item receipt", qty: 3, location_id: "L-B186", balance: 3 }], usage: 2,
  }),
  stockItem({
    id: "99115", code: "ZZ-CLAUDE-IAITEM", name: "ZZ-CLAUDE-IAITEM", unit_id: "u-piece", batch: true, income_id: "18046", cogs_id: "18046", orgs: ["186", "194"],
    sales_rate: 400, purchase_rate: 260, unit_cost: 260,
    stock: [
      { location_id: "L-A186", on_hand: 18, committed: 13 },
      { location_id: "L-B186", on_hand: 19, committed: 0 },
    ],
    open_lines: [{ kind: "deliver", doc: "SO-0041", party: "Balkhu Wholesale Depot", qty: 13, date: "2026-09-21" }, { kind: "receive", doc: "PO-0098", party: "ZZ-CLAUDE-VENDOR", qty: 2, date: "2026-09-19" }],
    movements: [{ date: "2026-09-15", doc: "GRN-0013", kind: "Item receipt", qty: 3, location_id: "L-A186", balance: 18 }], usage: 22,
  }),
  stockItem({
    id: "99750", code: "ZZC-ENG-1", name: "ZZ-CLAUDE-ENG-1", unit_id: "u-piece", sales_rate: 15, purchase_rate: 10, unit_cost: 10, cogs_id: "18125",
    stock: [{ location_id: "L-A186", on_hand: 3, committed: 0 }], usage: 4,
  }),
  stockItem({
    id: "99751", code: "ZZC-ENG-2", name: "ZZ-CLAUDE-ENG-2", unit_id: "u-piece", sales_rate: 30, purchase_rate: 20, unit_cost: 20, cogs_id: "18125",
    stock: [{ location_id: "L-A186", on_hand: 2, committed: 1 }], open_lines: [{ kind: "deliver", doc: "SO-0040", party: "Balkhu Wholesale Depot", qty: 1, date: "2026-09-20" }], usage: 5,
  }),

  // ── Services and non-stock ────────────────────────────────────────────────
  {
    ...BLANK, id: "99047", code: "ZZ-CLAUDE-SVC-1", name: "ZZ-CLAUDE-SVC", type: "non_inventory", sub_type: "resale", unit_id: "u-piece", orgs: ["186", "194"],
    income_id: "18099", expense_id: "18122", sales_rate: 0, purchase_rate: 250, usage: 6,
  },
  {
    ...BLANK, id: "99743", code: "ZZ-CLAUDE-QA-SVC-1", name: "ZZ-CLAUDE-QA-SVC-1", type: "service", sub_type: "resale", unit_id: "u-hrs",
    income_id: "18109", expense_id: null, sales_rate: 1_200, purchase_rate: 800, usage: 2,
  },
  {
    ...BLANK, id: "99820", code: "AMC-01", name: "Annual maintenance contract", type: "service", sub_type: "sale", subscription: true,
    // A legacy row with no base unit (STANDARD_UNIT_ID null) — the "No unit" gap.
    unit_id: null, income_id: "18109", sales_rate: 24_000, orgs: ["186", "194"], apply_to_child: true, usage: 11, sold_30d: { qty: 3, amount: 72_000 },
    description: "Two preventive visits and phone support for a year.", custom: { warranty_terms: "Per contract" },
    history: [created("Sneha Maharjan", "2025-11-03T11:20")], created: { by: "Sneha Maharjan", on: "2025-11-03T11:20" }, modified: { by: "Sneha Maharjan", on: "2026-07-14T09:00" },
  },
  {
    ...BLANK, id: "99821", code: "PKG-CTN-S", name: "Carton box (small)", type: "non_inventory", sub_type: "purchase", unit_id: "u-pcs",
    expense_id: "18134", purchase_rate: 45, vendor_id: "V-2001", usage: 9, purchase_description: "3-ply, 30 × 20 × 15 cm",
  },
  {
    ...BLANK, id: "99822", code: "DISC-FEST", name: "Dashain festival discount", type: "discount", sub_type: "sale", expense_id: "18140", tax_id: null, taxable: false, sales_rate: 1_000, usage: 31,
  },
  {
    ...BLANK, id: "99823", code: "KIT-SOLAR", name: "Solar starter kit", type: "kit", sub_type: "sale", sales_rate: 215_000, category_id: null, brand_id: "b-suryodaya", usage: 2,
    description: "Inverter, meter and installation, sold as one line.",
  },

  // ── Archived ──────────────────────────────────────────────────────────────
  stockItem({
    id: "99790", code: "RTR-AC12", name: "Wi-Fi 5 Router AC12", category_id: "c-networking", brand_id: "b-himalnet", unit_id: "u-pcs", archived: true,
    sales_rate: 6_200, purchase_rate: 4_450, unit_cost: 4_450, stock: [{ location_id: "L-KTM", on_hand: 0, committed: 0 }], usage: 14,
    barcodes: [barcode("6935364050015", "u-pcs")],
    history: [change("Manas Singh", "2026-07-01T10:30", "Status", "Active", "Archived"), created("Yepa Sherpa", "2025-04-02T10:00")],
    created: { by: "Yepa Sherpa", on: "2025-04-02T10:00" }, modified: { by: "Manas Singh", on: "2026-07-01T10:30" },
  }),

  // ── A fresh stock item: no movements yet, so nothing is locked ────────────
  stockItem({
    id: "99830", code: "MUG-350", name: "Ceramic Mug 350ml", unit_id: "u-pcs", sales_rate: 450, purchase_rate: 280, has_movements: false, stock: [], unit_cost: null,
    history: [created("Arun Rai", "2026-09-25T09:12")], created: { by: "Arun Rai", on: "2026-09-25T09:12" }, modified: { by: "Arun Rai", on: "2026-09-25T09:12" },
  }),
];

export const itemsStore = createStore<Item[]>(ITEM_SEED);

let seq = 0;
/** A new ITEM.ID — the server's identity; the mockup's starts past the seed's. */
export const newItemId = () => String(99900 + ++seq);
export const newRowId = (p: string) => `${p}-n${++seq}`;
