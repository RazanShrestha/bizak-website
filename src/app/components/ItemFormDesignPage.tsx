import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ArrowLeft,
  Search,
  X,
  Check,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Info,
  Building2,
  CalendarDays,
  RotateCcw,
  Package,
  Landmark,
  Boxes,
  Ruler,
  ShoppingCart,
  Tag,
  Paperclip,
  Image as ImageIcon,
  Upload,
  Lock,
  Percent,
  ListChecks,
  Eye,
  Download,
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  Sparkles,
  CircleSlash,
  ArrowRightLeft,
  MoreHorizontal,
  ScanLine,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// ITEM MASTER · CREATE / EDIT  (define a product/service record → commit)
//
// Primary action = author a complete, VALID item and save it. The whole page is
// "live and cascading" — classification, the maintain-stock flag and the owning
// company reshape which sections/fields/pickers exist and what each picker may
// even show.
//
// Hierarchy invented for THIS page (a sectioned-form shell, not a doc workspace
// or a record/master-detail):
//   • Identity header   image · name · code · live chips + the company SCOPE
//                       (the top-level cascade) + Save mirror.
//   • Section navigator (left rail) — the SWITCHER, and at the same time the
//                       live SETUP-PROGRESS and REQUIRED-FIELDS summary. One
//                       group is in view at a time; all data lives in root state
//                       so nothing is lost on switch-away. Conditional groups
//                       (Stock & Inventory) materialise in the rail in realtime.
//   • Active panel      the fields of the selected group.
//   • Docked footer     (overlay slot) the always-reachable Save, gated on
//                       validity, with a live "what's blocking" summary.
//
// Cascades wired for real: classification → account-field set; stock-flag ⇄
// classification (+ locks the type selector, adds/removes the stock group);
// company → re-scopes every reference picker; create-mode preference auto-fill
// of ledger accounts; multi-UOM reveal; two-way discount derivation w/ guard;
// parent-item → category inheritance. Save → posting → toast → reset/return.
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// FORMAT + DATE TRANSFORMS
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const TODAY_ISO = "2026-06-09";
const pad2 = (n: number) => String(n).padStart(2, "0");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const roundDp = (n: number, dp = 2) => { const f = Math.pow(10, dp); return Math.round((n + Number.EPSILON) * f) / f; };
function fmtNum(n: number | undefined | null) {
  if (n == null || !isFinite(n)) return "—";
  const r = roundDp(n);
  return r.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
const isISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
function fmtFriendly(iso: string) {
  if (!isISO(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  if (m < 1 || m > 12) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
function parseTyped(text: string): string | null {
  const t = text.trim();
  if (!t) return "";
  const iso = t.replace(/\//g, "-");
  const m1 = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m1) { const y = +m1[1], mo = +m1[2], d = +m1[3]; if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${y}-${pad2(mo)}-${pad2(d)}`; }
  const m2 = t.match(/^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m2) { const mo = MONTHS.findIndex((x) => x.toLowerCase() === m2[1].slice(0, 3).toLowerCase()); const d = +m2[2], y = +m2[3]; if (mo >= 0 && d >= 1 && d <= 31) return `${y}-${pad2(mo + 1)}-${pad2(d)}`; }
  return null;
}
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay();
const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1_048_576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1_048_576).toFixed(1)} MB`);

let _uid = 0;
const uid = (p: string) => `${p}-${(++_uid).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA  (Nepal / NPR, multi-subsidiary — reconciles with the house set)
// ════════════════════════════════════════════════════════════════════════════

type Opt = { id: string; label: string; sub?: string; meta?: string; disabled?: boolean };

const MULTI_COMPANY = true; // tenant capability → subsidiary multi-select is present

type Company = { id: string; name: string; code: string; meta: string };
const COMPANIES: Company[] = [
  { id: "NP-01", name: "Bizak Nepal", code: "NP01", meta: "Kathmandu HQ" },
  { id: "NP-02", name: "Bizak Nepal Pokhara", code: "NP02", meta: "Pokhara branch" },
  { id: "NP-03", name: "Bizak Nepal Terai", code: "NP03", meta: "Bharatpur branch" },
  { id: "IN-01", name: "Bizak India", code: "IN01", meta: "Patna regional" },
  { id: "IN-02", name: "Bizak India Delhi", code: "IN02", meta: "Delhi office" },
];
const companyOpt = (id: string): Opt | null => { const c = COMPANIES.find((x) => x.id === id); return c ? { id: c.id, label: c.name, sub: c.meta, meta: c.id } : null; };

// ── chart of accounts (kind drives which account picker may show it) ──
type AcctKind = "rev" | "exp" | "invasset" | "cogs" | "fixasset" | "contra" | "depexp" | "other";
type Ledger = { id: string; code: string; name: string; kind: AcctKind; companies: string[] };
const ALLC = COMPANIES.map((c) => c.id);
const LEDGERS: Ledger[] = [
  { id: "4001", code: "4001", name: "Sales Revenue — Goods", kind: "rev", companies: ALLC },
  { id: "4002", code: "4002", name: "Sales Revenue — Services", kind: "rev", companies: ALLC },
  { id: "4003", code: "4003", name: "Sales Revenue — Exports", kind: "rev", companies: ALLC },
  { id: "4021", code: "4021", name: "Subscription Revenue", kind: "rev", companies: ALLC },
  { id: "4099", code: "4099", name: "Pokhara Retail Income", kind: "rev", companies: ["NP-02"] },
  { id: "5001", code: "5001", name: "Cost of Goods Sold", kind: "cogs", companies: ALLC },
  { id: "5002", code: "5002", name: "COGS — Manufacturing", kind: "cogs", companies: ["NP-01", "NP-02"] },
  { id: "5101", code: "5101", name: "Purchase Expense", kind: "exp", companies: ALLC },
  { id: "5102", code: "5102", name: "Direct Materials", kind: "exp", companies: ALLC },
  { id: "5110", code: "5110", name: "Service Delivery Cost", kind: "exp", companies: ALLC },
  { id: "5201", code: "5201", name: "Depreciation Expense", kind: "depexp", companies: ALLC },
  { id: "1201", code: "1201", name: "Inventory — Trading Goods", kind: "invasset", companies: ALLC },
  { id: "1202", code: "1202", name: "Inventory — Raw Material", kind: "invasset", companies: ["NP-01", "NP-02"] },
  { id: "1203", code: "1203", name: "Inventory — Finished Goods", kind: "invasset", companies: ALLC },
  { id: "1501", code: "1501", name: "Fixed Assets — Plant & Machinery", kind: "fixasset", companies: ALLC },
  { id: "1510", code: "1510", name: "Fixed Assets — IT Equipment", kind: "fixasset", companies: ALLC },
  { id: "1502", code: "1502", name: "Accumulated Depreciation", kind: "contra", companies: ALLC },
  { id: "5301", code: "5301", name: "Inventory Gain / Loss", kind: "other", companies: ALLC },
];
const ledgerOpt = (id: string | undefined): Opt | null => { const a = LEDGERS.find((x) => x.id === id); return a ? { id: a.id, label: a.name, sub: `A/c ${a.code}`, meta: a.code } : null; };

// ── item-type classifier + sub-types (cascade source) ──
type ItemTypeId = "stock" | "nonstock" | "service" | "fixed" | "bundle";
type ItemType = { id: ItemTypeId; label: string; sub: string; stock: boolean; subtypes?: string[] };
const ITEM_TYPES: ItemType[] = [
  { id: "stock", label: "Stock Item", sub: "Tracked in inventory", stock: true },
  { id: "nonstock", label: "Non-Stock Item", sub: "Sold/bought, not stocked", stock: false, subtypes: ["Consumable", "Digital", "Packaging"] },
  { id: "service", label: "Service", sub: "Time / labour / subscription", stock: false, subtypes: ["Subscription", "One-off", "Billable", "Maintenance"] },
  { id: "fixed", label: "Fixed Asset", sub: "Capitalised & depreciated", stock: false },
  { id: "bundle", label: "Bundle / Kit", sub: "Composed of other items", stock: false, subtypes: ["Fixed bundle", "Dynamic kit"] },
];
const typeOpt = (id: ItemTypeId): Opt => { const t = ITEM_TYPES.find((x) => x.id === id)!; return { id: t.id, label: t.label, sub: t.sub }; };

// account-field set per classification (which ledger pickers exist + which are required)
type AcctKey = "income" | "expense" | "inventory" | "cogs" | "asset" | "accdep" | "depexp" | "gainloss";
const ACCT_META: Record<AcctKey, { label: string; kind: AcctKind; hint: string }> = {
  income: { label: "Income / Revenue account", kind: "rev", hint: "where sales of this item post" },
  expense: { label: "Expense account", kind: "exp", hint: "where purchases of this item post" },
  inventory: { label: "Inventory asset account", kind: "invasset", hint: "stock value on the balance sheet" },
  cogs: { label: "COGS account", kind: "cogs", hint: "cost recognised on sale" },
  asset: { label: "Fixed-asset account", kind: "fixasset", hint: "capitalised cost" },
  accdep: { label: "Accumulated depreciation", kind: "contra", hint: "contra-asset" },
  depexp: { label: "Depreciation expense", kind: "depexp", hint: "periodic depreciation" },
  gainloss: { label: "Inventory gain / loss", kind: "other", hint: "write-offs & adjustments" },
};
type AcctField = { key: AcctKey; required: boolean };
const TYPE_ACCOUNTS: Record<ItemTypeId, AcctField[]> = {
  stock: [{ key: "income", required: true }, { key: "inventory", required: true }, { key: "cogs", required: true }, { key: "gainloss", required: false }],
  nonstock: [{ key: "income", required: true }, { key: "expense", required: true }],
  service: [{ key: "income", required: true }, { key: "expense", required: false }],
  fixed: [{ key: "asset", required: true }, { key: "accdep", required: true }, { key: "depexp", required: true }],
  bundle: [{ key: "income", required: true }],
};

// company preference defaults (create-mode auto-fill source)
const COMPANY_PREFS: Record<string, Partial<Record<AcctKey, string>>> = {
  "NP-01": { income: "4001", expense: "5101", inventory: "1201", cogs: "5001", asset: "1501", accdep: "1502", depexp: "5201", gainloss: "5301" },
  "NP-02": { income: "4099", expense: "5101", inventory: "1203", cogs: "5002", asset: "1501", accdep: "1502", depexp: "5201", gainloss: "5301" },
};
const DEFAULT_PREFS = COMPANY_PREFS["NP-01"];

// ── reference lists (some company-scoped → exercise the re-scope cascade) ──
type Ref = { id: string; label: string; sub?: string; meta?: string; companies?: string[]; category?: string };
const CATEGORIES: Ref[] = [
  { id: "CAT-PHARMA", label: "Pharmaceuticals", sub: "Regulated goods" },
  { id: "CAT-HW", label: "Hardware & Tools", sub: "Trading" },
  { id: "CAT-ELEC", label: "Electronics", sub: "Trading" },
  { id: "CAT-CONS", label: "Construction Materials", sub: "Bulk" },
  { id: "CAT-FMCG", label: "FMCG", sub: "Fast-moving" },
  { id: "CAT-TEX", label: "Textiles", sub: "Trading" },
  { id: "CAT-AGRI", label: "Agriculture", sub: "Seasonal" },
  { id: "CAT-AUTO", label: "Automotive Parts", sub: "Trading" },
  { id: "CAT-SVC", label: "Services", sub: "Non-stock" },
  { id: "CAT-SW", label: "Software & Licences", sub: "Digital" },
  { id: "CAT-RETAIL", label: "Pokhara Retail", sub: "Branch-only", companies: ["NP-02"] },
];
const BRANDS: Ref[] = [
  { id: "BR-GEN", label: "Generic / Unbranded" },
  { id: "BR-SQ", label: "Square Pharma" },
  { id: "BR-HIM", label: "Himalaya" },
  { id: "BR-DAB", label: "Dabur" },
  { id: "BR-PHI", label: "Philips" },
  { id: "BR-TATA", label: "Tata" },
  { id: "BR-CG", label: "CG Electronics" },
  { id: "BR-ASIAN", label: "Asian Paints" },
];
const PARENTS: Ref[] = [
  { id: "P-PARA", label: "Paracetamol (group)", sub: "Pharmaceuticals", category: "CAT-PHARMA" },
  { id: "P-TMT", label: "TMT Steel Rod (group)", sub: "Construction Materials", category: "CAT-CONS" },
  { id: "P-LED", label: "LED Panel (group)", sub: "Electronics", category: "CAT-ELEC" },
  { id: "P-CEM", label: "Cement (group)", sub: "Construction Materials", category: "CAT-CONS" },
  { id: "P-AMOX", label: "Amoxicillin (group)", sub: "Pharmaceuticals", category: "CAT-PHARMA" },
];
const UNITS: Ref[] = ["Piece", "Box", "Strip", "Tablet", "Bottle", "Vial", "Sachet", "Carton", "Dozen", "Pack", "Kilogram", "Gram", "Litre", "Millilitre", "Metre", "Roll"].map((u) => ({ id: u.toLowerCase(), label: u }));
const VENDORS: Ref[] = [
  { id: "V-SQ", label: "Square Pharma Ltd", sub: "Pharma supplier", companies: ["NP-01", "NP-03"] },
  { id: "V-HIM", label: "Himalaya Distributors", sub: "FMCG", companies: ["NP-01"] },
  { id: "V-EVE", label: "Everest Hardware Supplies", sub: "Hardware", companies: ["NP-01", "NP-02"] },
  { id: "V-ANN", label: "Annapurna Distributors", sub: "General", companies: ["NP-01"] },
  { id: "V-POK", label: "Pokhara Trade House", sub: "Branch supplier", companies: ["NP-02"] },
  { id: "V-PAT", label: "Patna Wholesale Pvt", sub: "Imports", companies: ["IN-01", "IN-02"] },
  { id: "V-DEL", label: "Delhi Components Co.", sub: "Electronics", companies: ["IN-02"] },
];
const TAX_CODES: Ref[] = [
  { id: "VAT", label: "VAT 13%", meta: "13%" },
  { id: "EXM", label: "Exempt", meta: "0%" },
  { id: "EXP", label: "Export 0%", meta: "0%" },
  { id: "VAT7", label: "VAT 7.5%", meta: "7.5%" },
];
const VALUATION: Ref[] = [
  { id: "fifo", label: "FIFO", sub: "First-in, first-out" },
  { id: "wavg", label: "Weighted Average", sub: "Moving average cost" },
  { id: "lifo", label: "LIFO", sub: "Last-in, first-out" },
  { id: "spec", label: "Specific Identification", sub: "Per-lot cost" },
  { id: "std", label: "Standard Cost", sub: "Fixed standard + variance" },
];
const refToOpt = (r: Ref): Opt => ({ id: r.id, label: r.label, sub: r.sub, meta: r.meta });

// ════════════════════════════════════════════════════════════════════════════
// FORM MODEL
// ════════════════════════════════════════════════════════════════════════════

type ImageValue = { source: "url" | "file" | "path"; name: string; preview: string; status: "loading" | "ready" | "error" } | null;
type ConvRow = { id: string; unit: Opt | null; factor: number | undefined; rate: number | undefined };
type FileRec = { id: string; name: string; size: number; status: "uploading" | "done" | "error"; progress: number; ts: string };

type Form = {
  // scope
  companies: string[];
  applyToChildren: boolean;
  // identity & classification
  image: ImageValue;
  name: string;
  code: string;
  description: string;
  category: Opt | null;
  brand: Opt | null;
  parent: Opt | null;
  itemType: ItemTypeId;
  subType: string | null;
  maintainStock: boolean;
  inactive: boolean;
  subscription: boolean;
  // accounting
  accounts: Record<AcctKey, Opt | null>;
  taxable: boolean;
  taxCode: Opt | null;
  // stock & inventory
  valuation: string | null;
  safetyStock: number | undefined;
  reorderPoint: number | undefined;
  minOrderQty: number | undefined;
  leadTimeStock: number | undefined;
  allowNegative: boolean;
  hasSerial: boolean;
  hasBatch: boolean;
  // units
  baseUnit: Opt | null;
  multiUOM: boolean;
  salesUnit: Opt | null;
  stockUnit: Opt | null;
  consumptionUnit: Opt | null;
  conversions: ConvRow[];
  // purchasing
  vendor: Opt | null;
  purchaseRate: number | undefined;
  purchaseMOQ: number | undefined;
  leadTimeDays: number | undefined;
  // selling
  salesRate: number | undefined;
  defaultDiscount: boolean;
  discMode: "amt" | "pct";
  discAmt: number | undefined;
  discPct: number | undefined;
  minSalesQty: number | undefined;
  maxSalesQty: number | undefined;
  // customs / identity
  hsCode: string;
  // attachments
  files: FileRec[];
};

const emptyAccounts = (): Record<AcctKey, Opt | null> => ({ income: null, expense: null, inventory: null, cogs: null, asset: null, accdep: null, depexp: null, gainloss: null });
const blankConv = (): ConvRow => ({ id: uid("cv"), unit: null, factor: undefined, rate: undefined });

const MAX_ITEM = 2042;
const nextCode = () => `IT-${MAX_ITEM + 1}`;

function buildSeed(mode: "create" | "edit"): Form {
  if (mode === "edit") {
    return {
      companies: ["NP-01"], applyToChildren: false,
      image: { source: "path", name: "paracetamol-500.jpg", preview: "", status: "loading" },
      name: "Paracetamol 500mg Tablet", code: "IT-2042",
      description: "Analgesic & antipyretic. 500 mg paracetamol tablets, blister-packed 10×10. For relief of mild-to-moderate pain and fever.",
      category: refToOpt(CATEGORIES[0]), brand: refToOpt(BRANDS[1]), parent: null,
      itemType: "stock", subType: null, maintainStock: true, inactive: false, subscription: false,
      accounts: { ...emptyAccounts(), income: ledgerOpt("4001"), inventory: ledgerOpt("1201"), cogs: ledgerOpt("5001") },
      taxable: false, taxCode: refToOpt(TAX_CODES[1]),
      valuation: "fifo", safetyStock: 500, reorderPoint: 1000, minOrderQty: 100, leadTimeStock: 7, allowNegative: false, hasSerial: false, hasBatch: true,
      baseUnit: refToOpt(UNITS.find((u) => u.id === "tablet")!), multiUOM: true,
      salesUnit: refToOpt(UNITS.find((u) => u.id === "strip")!), stockUnit: refToOpt(UNITS.find((u) => u.id === "box")!), consumptionUnit: refToOpt(UNITS.find((u) => u.id === "tablet")!),
      conversions: [
        { id: uid("cv"), unit: refToOpt(UNITS.find((u) => u.id === "strip")!), factor: 10, rate: 4 },
        { id: uid("cv"), unit: refToOpt(UNITS.find((u) => u.id === "box")!), factor: 100, rate: 38 },
      ],
      vendor: refToOpt(VENDORS[0]), purchaseRate: 2.4, purchaseMOQ: 1000, leadTimeDays: 7,
      salesRate: 4, defaultDiscount: true, discMode: "pct", discPct: 5, discAmt: 0.2, minSalesQty: 1, maxSalesQty: 5000,
      hsCode: "3004.90.00",
      files: [{ id: uid("f"), name: "msds-paracetamol.pdf", size: 184_200, status: "done", progress: 100, ts: "Mar 14, 2026" }],
    };
  }
  return {
    companies: ["NP-01"], applyToChildren: false,
    image: null, name: "", code: nextCode(), description: "",
    category: null, brand: null, parent: null,
    itemType: "stock", subType: null, maintainStock: true, inactive: false, subscription: false,
    accounts: emptyAccounts(),
    taxable: true, taxCode: null,
    valuation: "fifo", safetyStock: undefined, reorderPoint: undefined, minOrderQty: undefined, leadTimeStock: undefined, allowNegative: false, hasSerial: false, hasBatch: false,
    baseUnit: null, multiUOM: false, salesUnit: null, stockUnit: null, consumptionUnit: null, conversions: [blankConv()],
    vendor: null, purchaseRate: undefined, purchaseMOQ: undefined, leadTimeDays: undefined,
    salesRate: undefined, defaultDiscount: false, discMode: "pct", discAmt: undefined, discPct: undefined, minSalesQty: undefined, maxSalesQty: undefined,
    hsCode: "",
    files: [],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════════════════════════════════

function useEscClose(open: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

function useAnchoredPos(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) { setPos(null); return; }
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, anchorRef]);
  return pos;
}

// ════════════════════════════════════════════════════════════════════════════
// ATOMS  field shell · text / number / textarea · switch
// ════════════════════════════════════════════════════════════════════════════

const INPUT_BASE = "h-9 w-full rounded-bz-md border bg-bz-surface px-3 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft transition-colors";
const INPUT_OK = "border-bz-line-soft focus:border-bz-text";
const INPUT_ERR = "border-[#C0413A] focus:border-[#9A2E29]";
const SOLID_BTN = "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50";
const GHOST_BTN = "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-40";

function Req() { return <span className="ml-0.5 text-bz-fire" title="Required">*</span>; }

function Field({ label, required, hint, error, htmlFor, className, children }: {
  label?: string; required?: boolean; hint?: React.ReactNode; error?: string; htmlFor?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <label htmlFor={htmlFor} className="text-[11px] font-medium text-bz-text-muted">{label}{required && <Req />}</label>
          {error ? (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#9A2E29]"><AlertTriangle size={10} /> {error}</span>
          ) : hint ? (
            <span className="text-[10px] text-bz-text-soft">{hint}</span>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, error, disabled, maxLength, mono, id }: {
  value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean; disabled?: boolean; maxLength?: number; mono?: boolean; id?: string;
}) {
  return (
    <input id={id} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      className={cn(INPUT_BASE, error ? INPUT_ERR : INPUT_OK, mono && NUM, disabled && "bg-bz-paper-warm text-bz-text-muted")} />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2 text-[13px] leading-relaxed text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text" />
  );
}

function NumberInput({ value, onChange, placeholder, error, disabled, min = 0, align = "left", suffix, prefix, id }: {
  value: number | undefined; onChange: (v: number | undefined) => void; placeholder?: string; error?: boolean; disabled?: boolean; min?: number; align?: "left" | "right"; suffix?: string; prefix?: string; id?: string;
}) {
  const [raw, setRaw] = React.useState(value == null ? "" : String(value));
  React.useEffect(() => {
    setRaw((prev) => {
      const prevNum = prev === "" || prev === "-" || prev === "." ? undefined : Number(prev);
      if (prevNum === value || (prevNum == null && value == null)) return prev;
      return value == null ? "" : String(value);
    });
  }, [value]);
  return (
    <div className={cn("flex h-9 items-center rounded-bz-md border bg-bz-surface px-2.5 transition-colors focus-within:border-bz-text", error ? INPUT_ERR : "border-bz-line-soft", disabled && "bg-bz-paper-warm")}>
      {prefix && <span className="mr-1 shrink-0 text-[11px] text-bz-text-soft">{prefix}</span>}
      <input id={id} inputMode="decimal" value={raw} disabled={disabled} placeholder={placeholder}
        onChange={(e) => { const v = e.target.value; if (v === "" || /^-?\d*\.?\d*$/.test(v)) { setRaw(v); onChange(v === "" || v === "-" || v === "." ? undefined : Number(v)); } }}
        onBlur={() => { if (raw === "" || raw === "-" || raw === ".") { onChange(undefined); setRaw(""); return; } let n = Number(raw); if (min != null && n < min) n = min; n = roundDp(n, 4); onChange(n); setRaw(String(n)); }}
        className={cn("h-full w-full bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft", NUM, align === "right" && "text-right", disabled && "text-bz-text-muted")} />
      {suffix && <span className="ml-1 shrink-0 text-[11px] text-bz-text-soft">{suffix}</span>}
    </div>
  );
}

function Switch({ value, onChange, disabled, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={ariaLabel} disabled={disabled} onClick={() => onChange(!value)}
      className={cn("relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors disabled:opacity-40", value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line")}>
      <span className={cn("pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform", value ? "translate-x-[14px]" : "translate-x-[2px]")} />
    </button>
  );
}

// a labelled on/off row (used for the many behavioural flags)
function ToggleRow({ icon: Icon, label, desc, value, onChange, disabled, lockHint }: {
  icon?: React.ComponentType<{ size?: number; className?: string }>; label: string; desc?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; lockHint?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2.5", disabled && "opacity-75")}>
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && <Icon size={14} className="mt-0.5 shrink-0 text-bz-text-muted" />}
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-bz-text">{label}{disabled && lockHint && <Lock size={10} className="text-bz-text-soft" />}</p>
          {desc && <p className="mt-0.5 text-[11px] leading-snug text-bz-text-muted">{disabled && lockHint ? lockHint : desc}</p>}
        </div>
      </div>
      <Switch value={value} onChange={onChange} disabled={disabled} ariaLabel={label} />
    </div>
  );
}

// inline over-limit / rule warning (component 18)
function InlineWarn({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 inline-flex items-center gap-1.5 rounded-bz-sm bg-[#FBE7E5] px-2 py-1 text-[10.5px] font-medium text-[#9A2E29]">
      <AlertTriangle size={11} /> {children}
    </p>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PICKER  searchable · debounced · paginated · clearable · add-new / advanced ·
// view-selected · auto-select-first. Serves both static lists and (company-
// scoped) server reference lists — the parent passes already-scoped options and
// a `loading` flag during a re-scope.
// ════════════════════════════════════════════════════════════════════════════

const PICKER_PAGE = 6;

function Picker({
  value, onChange, options, placeholder = "Select…", required, disabled, error, autoFirst, loading,
  icon: Icon, addNewLabel, onAddNew, onAdvanced, onView, title, size = "md", scopedNote,
}: {
  value: Opt | null; onChange: (o: Opt | null) => void; options: Opt[]; placeholder?: string;
  required?: boolean; disabled?: boolean; error?: boolean; autoFirst?: boolean; loading?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  addNewLabel?: string; onAddNew?: () => void; onAdvanced?: () => void; onView?: () => void; title?: string; size?: "sm" | "md"; scopedNote?: boolean;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (autoFirst && required && !value && !disabled && !loading && options.length) onChange(options[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFirst, required, value, disabled, loading, options.length]);

  const locked = disabled || loading;
  const h = size === "sm" ? "h-8" : "h-9";
  const text = size === "sm" ? "text-[12px]" : "text-[13px]";

  return (
    <div className="min-w-0">
      <button ref={btnRef} type="button" disabled={locked} onClick={() => setOpen((v) => !v)} title={title}
        className={cn("flex w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors", h,
          locked ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "bg-bz-surface hover:border-bz-line",
          error ? "border-[#C0413A]" : open || locked ? "" : "border-bz-line-soft")}>
        {Icon && <Icon size={size === "sm" ? 12 : 13} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("min-w-0 flex-1 truncate", text, value ? "text-bz-text" : "text-bz-text-soft")}>{loading ? "Loading…" : value ? value.label : placeholder}</span>
        {value && value.meta && !loading && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{value.meta}</span>}
        {loading ? (
          <Loader2 size={13} className="shrink-0 animate-spin text-bz-fire" />
        ) : value && !required && !locked ? (
          <span role="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={11} /></span>
        ) : (!locked && <ChevronDown size={size === "sm" ? 12 : 13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />)}
      </button>

      {value && onView && !locked && (
        <button onClick={onView} className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-medium text-bz-text-muted hover:text-bz-text"><Eye size={10} /> View {value.label}</button>
      )}

      <PickerDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)} options={options} value={value} onChange={onChange} addNewLabel={addNewLabel} onAddNew={onAddNew} onAdvanced={onAdvanced} title={title} scopedNote={scopedNote} />
    </div>
  );
}

function PickerDropdown({ anchorRef, open, onClose, options, value, onChange, addNewLabel, onAddNew, onAdvanced, title, scopedNote }: {
  anchorRef: React.RefObject<HTMLButtonElement | null>; open: boolean; onClose: () => void; options: Opt[]; value: Opt | null; onChange: (o: Opt | null) => void;
  addNewLabel?: string; onAddNew?: () => void; onAdvanced?: () => void; title?: string; scopedNote?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pos = useAnchoredPos(open, anchorRef);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [more, setMore] = React.useState(false);
  const [hi, setHi] = React.useState(0);

  React.useEffect(() => { if (open) { setRaw(""); setQuery(""); setPages(1); setHi(0); const t = window.setTimeout(() => inputRef.current?.focus(), 10); return () => window.clearTimeout(t); } }, [open]);
  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = window.setTimeout(() => { setQuery(raw.trim().toLowerCase()); setPages(1); setHi(0); setLoading(false); }, 200);
    return () => window.clearTimeout(t);
  }, [raw, open]);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { const t = e.target as Node; if (ref.current && !ref.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    const onScroll = (e: Event) => { if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return; onClose(); };
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey); window.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll, true); };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;
  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query) || (o.sub ?? "").toLowerCase().includes(query) || (o.meta ?? "").toLowerCase().includes(query)) : options;
  const visible = filtered.slice(0, pages * PICKER_PAGE);
  const hasMore = visible.length < filtered.length;

  const onScrollList = () => {
    const el = listRef.current; if (!el || more || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) { setMore(true); window.setTimeout(() => { setPages((p) => p + 1); setMore(false); }, 360); }
  };
  const pick = (o: Opt) => { if (o.disabled) return; onChange(o); onClose(); };
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, visible.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const o = visible[hi]; if (o) pick(o); }
  };

  return createPortal(
    <div ref={ref} style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 252) }}
      className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]" onKeyDown={onListKey}>
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input ref={inputRef} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={title ? `Search ${title.toLowerCase()}…` : "Search…"} className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
          {raw && <button onClick={() => setRaw("")} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface" aria-label="Clear search"><X size={10} /></button>}
        </div>
      </div>
      <div ref={listRef} onScroll={onScrollList} className="max-h-[252px] overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-bz-text-muted"><Loader2 size={13} className="animate-spin text-bz-fire" /> <span className="text-[11.5px]">Searching…</span></div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-7 text-center"><Search size={15} className="text-bz-text-soft" /><p className="text-[11.5px] font-medium text-bz-text-muted">{raw ? `No matches for “${raw}”` : "No options available"}</p></div>
        ) : (
          visible.map((o, i) => {
            const selected = value?.id === o.id; const active = i === hi;
            return (
              <button key={o.id} onMouseEnter={() => setHi(i)} onClick={() => pick(o)} disabled={o.disabled}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors", o.disabled ? "cursor-not-allowed opacity-45" : active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                  {o.sub && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{o.sub}</span>}
                </span>
                {o.meta && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{o.meta}</span>}
                {selected && <Check size={13} className="shrink-0 text-bz-text" />}
              </button>
            );
          })
        )}
        {more && <div className="flex items-center justify-center gap-2 py-2.5 text-bz-text-muted"><Loader2 size={12} className="animate-spin text-bz-fire" /> <span className="text-[11px]">Loading more…</span></div>}
        {!more && !hasMore && visible.length > 0 && filtered.length > PICKER_PAGE && <p className={cn("px-3 py-2 text-center text-[10px] text-bz-text-soft", NUM)}>{filtered.length} results · end of list</p>}
        {scopedNote && !raw && <p className="flex items-center gap-1 px-3 py-1.5 text-[9.5px] text-bz-text-soft"><Building2 size={9} /> scoped to the selected company</p>}
      </div>
      {(onAddNew || onAdvanced) && (
        <div className="flex items-center gap-1 border-t border-bz-line-soft bg-bz-paper-warm/40 p-1.5">
          {onAddNew && <button onClick={() => { onClose(); onAddNew(); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-bz-sm px-2 py-1.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-surface"><Plus size={12} className="text-bz-leaf-deep" /> {addNewLabel ?? "Add new"}</button>}
          {onAdvanced && <button onClick={() => { onClose(); onAdvanced(); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-bz-sm px-2 py-1.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-surface hover:text-bz-text"><ListChecks size={12} /> Advanced search</button>}
        </div>
      )}
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MULTI-COMPANY PICKER  chips · +N more · per-chip remove · clear-all · filter
// (re-scopes every other reference picker on change)
// ════════════════════════════════════════════════════════════════════════════

function MultiCompanyPicker({ value, onChange, disabled }: { value: string[]; onChange: (ids: string[]) => void; disabled?: boolean }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const pos = useAnchoredPos(open, btnRef);
  useEscClose(open, () => setOpen(false));
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { const t = e.target as Node; if (ref.current && !ref.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  React.useEffect(() => { if (open) setQ(""); }, [open]);

  const selected = COMPANIES.filter((c) => value.includes(c.id));
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  const filtered = q ? COMPANIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.id.toLowerCase().includes(q.toLowerCase())) : COMPANIES;
  const shownChips = selected.slice(0, 2);
  const extra = selected.length - shownChips.length;

  return (
    <div>
      <button ref={btnRef} type="button" disabled={disabled} onClick={() => setOpen((v) => !v)}
        className={cn("flex min-h-9 w-full items-center gap-1.5 rounded-bz-md border px-2 py-1 text-left transition-colors", open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line", disabled && "cursor-default bg-bz-paper-warm")}>
        <Building2 size={13} className="ml-0.5 shrink-0 text-bz-text-muted" />
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {selected.length === 0 ? (
            <span className="text-[12.5px] text-bz-text-soft">Select companies…</span>
          ) : (
            <>
              {shownChips.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-fire/[0.16] py-0.5 pl-1.5 pr-1 text-[11px] font-medium text-bz-text">
                  {c.id}
                  {!disabled && <span role="button" aria-label={`Remove ${c.name}`} onClick={(e) => { e.stopPropagation(); toggle(c.id); }} className="flex size-3.5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/40 hover:text-bz-text"><X size={9} /></span>}
                </span>
              ))}
              {extra > 0 && <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[11px] font-medium text-bz-text-muted", NUM)}>+{extra} more</span>}
            </>
          )}
        </span>
        <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && pos && createPortal(
        <div ref={ref} style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 260) }} className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={12} className="shrink-0 text-bz-text-muted" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter companies…" className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-[11.5px] text-bz-text-muted">No companies match “{q}”.</p>
            ) : filtered.map((c) => {
              const on = value.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggle(c.id)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm">
                  <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-[5px] border", on ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface")}>{on && <Check size={11} strokeWidth={3} />}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] text-bz-text">{c.name}</span><span className="block truncate text-[10.5px] text-bz-text-soft">{c.meta}</span></span>
                  <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{c.id}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2">
            <span className={cn("text-[10.5px] text-bz-text-muted", NUM)}>{value.length} selected</span>
            <button onClick={() => onChange([])} disabled={value.length === 0} className="text-[11px] font-medium text-bz-text-muted hover:text-bz-text disabled:opacity-40">Clear all</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DATE FIELD  typed input + popup calendar
// ════════════════════════════════════════════════════════════════════════════

function DateField({ value, onChange, disabled, error }: { value: string | null; onChange: (iso: string) => void; disabled?: boolean; error?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(value ?? "");
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const popRef = React.useRef<HTMLDivElement>(null);
  const pos = useAnchoredPos(open, wrapRef);
  React.useEffect(() => { setText(value ?? ""); }, [value]);
  useEscClose(open, () => setOpen(false));
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { const t = e.target as Node; if (popRef.current && !popRef.current.contains(t) && wrapRef.current && !wrapRef.current.contains(t)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  const commit = () => { const parsed = parseTyped(text); if (parsed === null) setText(value ?? ""); else onChange(parsed); };

  return (
    <div ref={wrapRef} className="relative">
      <input type="text" value={text} disabled={disabled} onChange={(e) => setText(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") { commit(); (e.target as HTMLInputElement).blur(); } }}
        placeholder="YYYY-MM-DD" title={value ? fmtFriendly(value) : undefined}
        className={cn("h-9 w-full rounded-bz-md border bg-bz-surface px-3 pr-9 text-[13px] tabular-nums text-bz-text outline-none placeholder:text-bz-text-soft", error ? INPUT_ERR : "border-bz-line-soft hover:border-bz-line focus:border-bz-text", disabled && "bg-bz-paper-warm text-bz-text-muted")} />
      <button type="button" disabled={disabled} onClick={() => setOpen((v) => !v)} aria-label="Open calendar" className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:text-bz-text disabled:opacity-40"><CalendarDays size={13} /></button>
      {open && pos && createPortal(
        <div ref={popRef} style={{ position: "fixed", top: pos.top, left: pos.left, width: 244 }} className="z-[70] rounded-bz-md border border-bz-line bg-bz-surface p-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.24)]">
          <CalendarBody value={value} onPick={(iso) => { onChange(iso); setOpen(false); }} />
          <div className="mt-2 flex items-center justify-between border-t border-bz-line-soft pt-2">
            <button onClick={() => { onChange(""); setOpen(false); }} className="text-[11px] font-medium text-bz-text-muted hover:text-bz-text">Clear</button>
            <button onClick={() => { onChange(TODAY_ISO); setOpen(false); }} className="text-[11px] font-medium text-bz-text-muted hover:text-bz-text">Today</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function CalendarBody({ value, onPick }: { value: string | null; onPick: (iso: string) => void }) {
  const seed = value && isISO(value) ? value : TODAY_ISO;
  const [view, setView] = React.useState(() => { const [y, m] = seed.split("-").map(Number); return { y, m: m - 1 }; });
  const { y, m } = view;
  const lead = firstWeekday(y, m);
  const total = daysInMonth(y, m);
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const prev = () => setView(m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
  const next = () => setView(m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 });
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button onClick={prev} aria-label="Previous month" className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><ChevronLeft size={14} /></button>
        <span className="text-[12px] font-semibold text-bz-text">{MONTHS_LONG[m]} {y}</span>
        <button onClick={next} aria-label="Next month" className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="flex h-6 items-center justify-center text-[9.5px] font-semibold uppercase text-bz-text-soft">{d}</span>)}
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const iso = `${y}-${pad2(m + 1)}-${pad2(d)}`;
          const sel = iso === value; const today = iso === TODAY_ISO;
          return (
            <button key={i} onClick={() => onPick(iso)} className={cn("flex h-7 items-center justify-center rounded-bz-sm text-[11.5px] tabular-nums transition-colors", sel ? "bg-bz-fire font-semibold text-bz-olive" : today ? "font-semibold text-bz-text ring-1 ring-inset ring-bz-line hover:bg-bz-paper-warm" : "text-bz-text hover:bg-bz-paper-warm")}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// IMAGE TILE + PICKER MODAL  (component 12 / 13)
// ════════════════════════════════════════════════════════════════════════════

// deterministic swatch colour for a name (no gradients — a flat tint)
const SWATCHES = ["#1A2D20", "#243A2D", "#5A6053", "#707064", "#0F1411"];
const swatchFor = (s: string) => SWATCHES[(s.charCodeAt(0) || 0) % SWATCHES.length];
const initials = (s: string) => s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "IT";

// vertical image card — fills the 25% identity column on the General section
function ImageTile({ image, name, onOpen, onRemove }: { image: ImageValue; name: string; onOpen: () => void; onRemove: () => void }) {
  const hasPreview = !!image && image.status === "ready" && /^(blob:|https?:|data:)/.test(image.preview);
  return (
    <div className="flex h-full flex-col">
      <button onClick={onOpen} aria-label="Set item image"
        className={cn("group relative flex min-h-[88px] flex-1 items-center justify-center overflow-hidden rounded-bz-md bg-bz-paper-warm", image ? "border border-bz-line-soft" : "border-2 border-dotted border-bz-line")}>
        {image && image.status === "loading" ? (
          <Loader2 size={20} className="animate-spin text-bz-fire" />
        ) : image && image.status === "error" ? (
          <span className="flex flex-col items-center gap-1 text-[#9A2E29]"><AlertTriangle size={18} /><span className="text-[9px] font-medium">load error</span></span>
        ) : hasPreview ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={image!.preview} alt="" className="size-full object-cover" />
        ) : image ? (
          <span className="flex size-full items-center justify-center text-[26px] font-semibold text-bz-text-on-dark" style={{ background: swatchFor(name || "Item") }}>{initials(name || "Item")}</span>
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-bz-text-soft"><ImageIcon size={20} /><span className="text-[10px] font-medium">Add image</span></span>
        )}
        <span className="absolute inset-x-0 bottom-0 hidden items-center justify-center bg-bz-olive/70 py-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-bz-paper group-hover:flex">{image ? "Change" : "Add"}</span>
      </button>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        {image && <button onClick={onRemove} className="shrink-0 text-[10.5px] font-medium text-bz-text-muted hover:text-[#9A2E29]">Remove</button>}
      </div>
    </div>
  );
}

function ImagePickerModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (img: ImageValue) => void }) {
  const [tab, setTab] = React.useState<"upload" | "url">("upload");
  const [pending, setPending] = React.useState<{ name: string; preview: string } | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [url, setUrl] = React.useState("");
  const [urlState, setUrlState] = React.useState<"idle" | "ok" | "bad">("idle");
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ivRef = React.useRef<number | null>(null);
  useEscClose(open, onClose);
  React.useEffect(() => {
    if (open) { setTab("upload"); setPending(null); setUploading(false); setProgress(0); setUrl(""); setUrlState("idle"); setDrag(false); }
    return () => { if (ivRef.current) window.clearInterval(ivRef.current); };
  }, [open]);

  const startUpload = (name: string, preview: string) => {
    setPending({ name, preview }); setUploading(true); setProgress(8);
    if (ivRef.current) window.clearInterval(ivRef.current);
    ivRef.current = window.setInterval(() => {
      setProgress((p) => { const n = Math.min(100, p + 16 + Math.floor(Math.random() * 14)); if (n >= 100) { if (ivRef.current) window.clearInterval(ivRef.current); setUploading(false); } return n; });
    }, 220);
  };
  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; startUpload(f.name, URL.createObjectURL(f)); e.target.value = ""; };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) startUpload(f.name, URL.createObjectURL(f));
    else startUpload(`item-photo-${Math.floor(Math.random() * 900 + 100)}.jpg`, "");
  };
  const checkUrl = (v: string) => { setUrl(v); setUrlState(v.trim() === "" ? "idle" : /^https?:\/\/.+/i.test(v.trim()) ? "ok" : "bad"); };

  const canConfirm = tab === "upload" ? !!pending && !uploading : urlState === "ok";
  const confirm = () => {
    if (tab === "upload" && pending) onConfirm({ source: "file", name: pending.name, preview: pending.preview || "swatch", status: pending.preview ? "ready" : "ready" });
    else if (tab === "url" && urlState === "ok") onConfirm({ source: "url", name: url.trim().split("/").pop() || "image", preview: url.trim(), status: "ready" });
    onClose();
  };

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-bz-olive-dark/40 p-4 py-[8vh]" onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480 }} className="overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_70px_-20px_rgba(15,20,17,0.32)]">
        <div className="flex items-start gap-3 border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper"><ImageIcon size={16} /></span>
          <div className="min-w-0 flex-1"><h3 className="text-[14.5px] font-semibold tracking-tight text-bz-text">Set item image</h3><p className="mt-0.5 text-[11.5px] text-bz-text-muted">Upload a file or link an image URL.</p></div>
          <button onClick={onClose} aria-label="Close" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={15} /></button>
        </div>
        <div className="p-4">
          <div className="mb-3 grid grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
            {(["upload", "url"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("h-7 rounded-bz-sm px-2.5 text-[12px] font-medium capitalize transition-colors", tab === t ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text")}>{t === "upload" ? "Upload file" : "Image URL"}</button>
            ))}
          </div>

          {tab === "upload" ? (
            pending ? (
              <div className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface p-3">
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-bz-sm bg-bz-paper-warm">
                  {pending.preview ? <img src={pending.preview} alt="" className="size-full object-cover" /> : <ImageIcon size={18} className="text-bz-text-soft" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-bz-text">{pending.name}</p>
                  {uploading ? (
                    <div className="mt-1.5 flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-bz-pill bg-bz-line-soft"><span className="block h-full rounded-bz-pill bg-bz-fire transition-all" style={{ width: `${progress}%` }} /></span><span className={cn("text-[10px] text-bz-text-muted", NUM)}>{progress}%</span></div>
                  ) : (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-medium text-bz-leaf-deep"><Check size={11} /> Uploaded</p>
                  )}
                </div>
                <button onClick={() => { setPending(null); setUploading(false); setProgress(0); }} className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text"><Trash2 size={13} /></button>
              </div>
            ) : (
              <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
                className={cn("flex flex-col items-center justify-center gap-2 rounded-bz-lg border-2 border-dashed px-4 py-8 text-center transition-colors", drag ? "border-bz-fire bg-bz-fire/[0.08]" : "border-bz-line bg-bz-paper-warm/30")}>
                <span className={cn("flex size-10 items-center justify-center rounded-bz-md", drag ? "bg-bz-fire text-bz-olive" : "bg-bz-surface text-bz-text-muted")}><Upload size={18} /></span>
                <p className="text-[13px] font-medium text-bz-text">{drag ? "Drop to upload" : "Drag an image here, or browse"}</p>
                <p className="text-[11px] text-bz-text-muted">PNG, JPG or WEBP — up to 5 MB</p>
                <button onClick={() => inputRef.current?.click()} className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm"><ImageIcon size={12} /> Browse</button>
                <input ref={inputRef} type="file" accept="image/*" hidden onChange={onBrowse} />
              </div>
            )
          ) : (
            <div>
              <Field label="Image URL" error={urlState === "bad" ? "Enter a valid http(s) URL" : undefined}>
                <TextInput value={url} onChange={checkUrl} placeholder="https://…/photo.jpg" error={urlState === "bad"} />
              </Field>
              {urlState === "ok" && (
                <div className="mt-3 flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface p-3">
                  <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-bz-sm bg-bz-paper-warm">
                    <img src={url} alt="" className="size-full object-cover" onError={() => setUrlState("bad")} />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[12px] text-bz-text-muted">{url}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3">
          <button onClick={onClose} className={GHOST_BTN}>Cancel</button>
          <button disabled={!canConfirm} onClick={confirm} className={SOLID_BTN}><Check size={14} /> Use this image</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// UNIT-CONVERSION EDITOR  (component 14) — repeating rows, collapsible
// ════════════════════════════════════════════════════════════════════════════

function UnitConversionEditor({ baseUnit, rows, onChange, unitOptions, attempted }: {
  baseUnit: Opt | null; rows: ConvRow[]; onChange: (rows: ConvRow[]) => void; unitOptions: Opt[]; attempted: boolean;
}) {
  const [openEditor, setOpenEditor] = React.useState(rows.some((r) => r.unit || r.factor != null));
  const set = (id: string, patch: Partial<ConvRow>) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const add = () => onChange([...rows, blankConv()]);
  const remove = (id: string) => { const next = rows.filter((r) => r.id !== id); onChange(next.length ? next : [blankConv()]); };
  const populated = rows.filter((r) => r.unit || r.factor != null).length;

  return (
    <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
      <button type="button" onClick={() => setOpenEditor((v) => !v)} className={cn("flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors", openEditor ? "bg-bz-paper-warm/60" : "bg-bz-surface hover:bg-bz-paper-warm/40")}>
        <ArrowRightLeft size={14} className="shrink-0 text-bz-text-muted" />
        <span className="flex-1 truncate text-[12.5px] font-semibold text-bz-text">Alternate units & conversions</span>
        {populated > 0 && <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{populated}</span>}
        <ChevronDown size={14} className={cn("shrink-0 text-bz-text-muted transition-transform", openEditor ? "" : "-rotate-90")} />
      </button>
      {openEditor && (
        <div className="border-t border-bz-line-soft bg-bz-surface p-3.5">
          <div className="mb-2.5 flex items-center gap-2 rounded-bz-md bg-bz-paper-warm/50 px-3 py-2 text-[11px] text-bz-text-muted">
            <Info size={12} className="shrink-0 text-bz-text-soft" />
            Base unit is <span className="font-semibold text-bz-text">{baseUnit ? baseUnit.label : "not set"}</span>. Each row says how many base units make one alternate unit.
          </div>
          <div className="flex flex-col gap-2.5">
            {rows.map((r, i) => {
              const touched = !!r.unit || r.factor != null;
              const needUnit = attempted && touched && !r.unit;
              const needFactor = attempted && touched && !((r.factor ?? 0) > 0);
              return (
                <div key={r.id} className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/20 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[10px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft", NUM)}>Conversion {i + 1}</span>
                    <button onClick={() => remove(r.id)} className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]" aria-label="Remove conversion"><Trash2 size={12} /></button>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-[1.4fr_1fr_1fr]">
                    <Field label="Alternate unit" error={needUnit ? "Pick a unit" : undefined}>
                      <Picker value={r.unit} onChange={(o) => set(r.id, { unit: o, factor: undefined, rate: undefined })} options={unitOptions} title="unit" placeholder="Select unit" error={needUnit} size="sm" />
                    </Field>
                    <Field label="= base units" error={needFactor ? "Must be > 0" : undefined}>
                      <NumberInput value={r.factor} onChange={(v) => set(r.id, { factor: v })} align="right" error={needFactor} placeholder="0" suffix={baseUnit?.label ?? ""} />
                    </Field>
                    <Field label="Rate / unit" hint="optional">
                      <NumberInput value={r.rate} onChange={(v) => set(r.id, { rate: v })} align="right" prefix="₨" placeholder="0" />
                    </Field>
                  </div>
                  {r.unit && (r.factor ?? 0) > 0 && (
                    <p className={cn("mt-2 text-[11px] text-bz-text-muted", NUM)}>1 {r.unit.label} = {fmtNum(r.factor)} {baseUnit?.label ?? "base units"}</p>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={add} className="mt-2.5 inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm"><Plus size={13} /> Add conversion</button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FILE ATTACHMENTS  (component 15) — controlled from root so it survives switch
// ════════════════════════════════════════════════════════════════════════════

function fileKind(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return { Icon: FileText, tint: "var(--bz-file-pdf)" };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return { Icon: FileImage, tint: "var(--bz-file-img)" };
  if (["xls", "xlsx", "csv"].includes(ext)) return { Icon: FileSpreadsheet, tint: "var(--bz-file-xls)" };
  if (["doc", "docx", "txt", "md"].includes(ext)) return { Icon: FileText, tint: "var(--bz-file-doc)" };
  return { Icon: FileIcon, tint: "var(--bz-text-muted)" };
}

function FileAttachments({ files, onAdd, onRemove, onRetry, onToast }: {
  files: FileRec[]; onAdd: (list: { name: string; size: number }[]) => void; onRemove: (id: string) => void; onRetry: (id: string) => void; onToast: (m: string) => void;
}) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => { const fl = e.target.files; if (!fl?.length) return; onAdd(Array.from(fl).map((f) => ({ name: f.name, size: f.size }))); e.target.value = ""; };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDrag(false); const fl = e.dataTransfer.files; if (fl?.length) onAdd(Array.from(fl).map((f) => ({ name: f.name, size: f.size }))); else onAdd([{ name: `document-${Math.floor(Math.random() * 900 + 100)}.pdf`, size: 120_000 + Math.floor(Math.random() * 600_000) }]); };

  return (
    <div className="flex flex-col gap-3">
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className={cn("flex flex-col items-center justify-center gap-2 rounded-bz-lg border-2 border-dashed px-4 py-7 text-center transition-colors", drag ? "border-bz-fire bg-bz-fire/[0.08]" : "border-bz-line bg-bz-paper-warm/30")}>
        <span className={cn("flex size-10 items-center justify-center rounded-bz-md", drag ? "bg-bz-fire text-bz-olive" : "bg-bz-surface text-bz-text-muted")}><Upload size={18} /></span>
        <p className="text-[13px] font-medium text-bz-text">{drag ? "Drop to upload" : "Drag files here, or browse"}</p>
        <p className="text-[11px] text-bz-text-muted">Spec sheets, certificates, MSDS — up to 20 MB each</p>
        <button onClick={() => inputRef.current?.click()} className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm"><Paperclip size={12} /> Browse files</button>
        <input ref={inputRef} type="file" multiple hidden onChange={onBrowse} />
      </div>
      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 py-8 text-center"><Paperclip size={16} className="text-bz-text-soft" /><p className="text-[12px] text-bz-text-muted">No attachments yet.</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((f) => {
            const k = fileKind(f.name);
            return (
              <div key={f.id} className={cn("flex items-center gap-3 rounded-bz-md border bg-bz-surface px-3 py-2.5", f.status === "error" ? "border-[#C0413A]/40" : "border-bz-line-soft")}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm" style={{ color: k.tint }}><k.Icon size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-bz-text">{f.name}</p>
                  {f.status === "uploading" ? (
                    <div className="mt-1 flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-bz-pill bg-bz-line-soft"><span className="block h-full rounded-bz-pill bg-bz-fire transition-all" style={{ width: `${f.progress}%` }} /></span><span className={cn("text-[10px] text-bz-text-muted", NUM)}>{f.progress}%</span></div>
                  ) : f.status === "error" ? (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-medium text-[#9A2E29]"><AlertTriangle size={10} /> Upload failed</p>
                  ) : (
                    <p className={cn("mt-0.5 truncate text-[10.5px] text-bz-text-soft", NUM)}>{fmtSize(f.size)} · {f.ts}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {f.status === "done" && <button onClick={() => onToast(`Downloading ${f.name}`)} title="Download" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><Download size={13} /></button>}
                  {f.status === "error" && <button onClick={() => onRetry(f.id)} title="Retry" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><RotateCcw size={13} /></button>}
                  <button onClick={() => onRemove(f.id)} title="Remove" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]"><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DERIVED TYPES + SHARED SECTION PROPS
// ════════════════════════════════════════════════════════════════════════════

type SectionKey = "general" | "accounting" | "stock" | "purchasing" | "selling" | "attachments";
type ReqItem = { section: SectionKey; label: string; ok: boolean };

type Derived = {
  typeMeta: ItemType;
  subTypeVisible: boolean;
  accountFields: AcctField[];
  options: {
    categories: Opt[]; brands: Opt[]; parents: Opt[]; units: Opt[]; vendors: Opt[]; tax: Opt[];
    ledgers: Record<AcctKey, Opt[]>; itemTypes: Opt[]; subTypes: Opt[];
  };
  rescoping: boolean;
  autofilled: Set<AcctKey>;
  disc: { amt: number | undefined; pct: number | undefined; over: boolean; valid: boolean };
};

type Helpers = {
  patch: (p: Partial<Form>) => void;
  setAccount: (k: AcctKey, o: Opt | null) => void;
  setItemType: (id: ItemTypeId) => void;
  setMaintainStock: (v: boolean) => void;
  setCompanies: (ids: string[]) => void;
  setApplyChildren: (v: boolean) => void;
  setParent: (o: Opt | null) => void;
  setSalesRate: (v: number | undefined) => void;
  setDiscPct: (v: number | undefined) => void;
  setDiscAmt: (v: number | undefined) => void;
  addFiles: (list: { name: string; size: number }[]) => void;
  removeFile: (id: string) => void;
  retryFile: (id: string) => void;
  openImage: () => void;
  removeImage: () => void;
  toast: (m: string) => void;
  goSection: (k: SectionKey) => void;
  mode: "create" | "edit";
};

type SP = { f: Form; d: Derived; h: Helpers; attempted: boolean };

// ════════════════════════════════════════════════════════════════════════════
// SECTION PANELS
// ════════════════════════════════════════════════════════════════════════════

function GeneralSection({ f, d, h, attempted }: SP) {
  return (
    <div className="flex flex-col gap-5">
      {/* identity — textfields (75%) + image (25%) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[3fr_1fr]">
        <div className="flex flex-col gap-4">
          <Field label="Item name" required error={attempted && !f.name.trim() ? "Required" : undefined}>
            <TextInput value={f.name} onChange={(v) => h.patch({ name: v })} placeholder="e.g. Paracetamol 500mg Tablet" maxLength={120} error={attempted && !f.name.trim()} />
          </Field>
          <Field label="Item code / SKU" hint= "" >
            <TextInput value={f.code} onChange={(v) => h.patch({ code: v })} placeholder="IT-0000" mono />
          </Field>
        </div>
        <ImageTile image={f.image} name={f.name} onOpen={h.openImage} onRemove={h.removeImage} />
      </div>

      {/* base unit — important: sits right after identity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Base unit of measure" required hint="" error={attempted && !f.baseUnit ? "Required" : undefined}>
          <Picker value={f.baseUnit} onChange={(o) => h.patch({ baseUnit: o })} options={d.options.units} title="base unit" placeholder="Select base unit" required autoFirst error={attempted && !f.baseUnit} icon={Ruler} loading={d.rescoping} addNewLabel="New unit" onAddNew={() => h.toast("Opening the units-of-measure form…")} />
        </Field>
        <Field label="HS code" hint="">
          <TextInput value={f.hsCode} onChange={(v) => h.patch({ hsCode: v })} placeholder="0000.00.00" mono />
        </Field>
      </div>

      <Field label="Description / specification">
        <Textarea value={f.description} onChange={(v) => h.patch({ description: v })} rows={3} placeholder="What this item is, its grade/spec, packing…" />
      </Field>

      {MULTI_COMPANY && (
        <>
          <div className="h-px bg-bz-line-soft" />
          <div>
            <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
              <Building2 size={11} /> Company scope
              {d.rescoping && <span className="inline-flex items-center gap-1 font-medium normal-case tracking-normal text-bz-text-muted"><Loader2 size={10} className="animate-spin text-bz-fire" /> re-scoping reference data…</span>}
            </p>
            <div className="flex flex-col gap-3">
              <Field label="Owning companies / subsidiaries" required hint="re-scopes every reference list" error={attempted && f.companies.length === 0 ? "Pick at least one" : undefined}>
                <MultiCompanyPicker value={f.companies} onChange={h.setCompanies} />
              </Field>
              <ToggleRow icon={Building2} label="Apply to child companies" desc="Cascade this item to subsidiaries beneath the selected companies." value={f.applyToChildren} onChange={h.setApplyChildren} />
            </div>
          </div>
        </>
      )}

      <div className="h-px bg-bz-line-soft" />

      {/* classification — the central cascade */}
      <div>
        <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft"><Tag size={11} /> Classification</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Item type" required hint={f.maintainStock ? "locked by stock flag" : undefined} error={attempted && !f.itemType ? "Required" : undefined}>
            <Picker value={typeOpt(f.itemType)} onChange={(o) => o && h.setItemType(o.id as ItemTypeId)} options={d.options.itemTypes} title="item type" required disabled={f.maintainStock} />
          </Field>
          {d.subTypeVisible ? (
            <Field label="Item sub-type" hint="optional">
              <Picker value={f.subType ? { id: f.subType, label: f.subType } : null} onChange={(o) => h.patch({ subType: o?.id ?? null })} options={d.options.subTypes} title="sub-type" placeholder="Select sub-type" />
            </Field>
          ) : (
            <div className="hidden sm:flex sm:flex-col sm:justify-end sm:pb-0.5">
              <p className="rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/30 px-3 py-2 text-[11px] text-bz-text-soft">Sub-type doesn't apply to {d.typeMeta.label.toLowerCase()}s.</p>
            </div>
          )}
          <Field label="Category" hint={f.parent ? "inherited from parent" : undefined}>
            <Picker value={f.category} onChange={(o) => h.patch({ category: o })} options={d.options.categories} title="category" placeholder="Pick a category" loading={d.rescoping} addNewLabel="New category" onAddNew={() => h.toast("Opening the new-category form…")} onAdvanced={() => h.toast("Opening advanced category search…")} scopedNote />
          </Field>
          <Field label="Brand">
            <Picker value={f.brand} onChange={(o) => h.patch({ brand: o })} options={d.options.brands} title="brand" placeholder="Pick a brand" addNewLabel="New brand" onAddNew={() => h.toast("Opening the new-brand form…")} />
          </Field>
          <Field label="Parent item" hint="inherits its category" className="sm:col-span-2">
            <Picker value={f.parent} onChange={h.setParent} options={d.options.parents} title="parent item" placeholder="Search a parent to inherit from" loading={d.rescoping} onView={() => f.parent && h.toast(`Opening ${f.parent.label}…`)} onAdvanced={() => h.toast("Opening advanced item search…")} scopedNote />
          </Field>
        </div>
      </div>

      <div className="h-px bg-bz-line-soft" />

      {/* flags */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <ToggleRow icon={Boxes} label="Maintain stock" desc="Track this item in inventory. Forces the type to Stock Item and reveals the Stock & Inventory group (where units of measure live)." value={f.maintainStock} onChange={h.setMaintainStock} />
        <ToggleRow icon={Sparkles} label="Subscription-eligible" desc="Item can be sold on a recurring subscription plan." value={f.subscription} onChange={(v) => h.patch({ subscription: v })} />
        <ToggleRow icon={CircleSlash} label="Inactive" desc="Hide from new transactions; keep for history & reports." value={f.inactive} onChange={(v) => h.patch({ inactive: v })} />
      </div>
    </div>
  );
}

function AccountingSection({ f, d, h, attempted }: SP) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2.5 rounded-bz-md bg-bz-paper-warm/50 px-3 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-bz-text-muted" />
        <p className="text-[11.5px] leading-relaxed text-bz-text-muted">Posting accounts depend on the classification — <span className="font-medium text-bz-text">{d.typeMeta.label}</span> needs {d.accountFields.length} account{d.accountFields.length === 1 ? "" : "s"}. {h.mode === "create" && "Defaults are pulled from the company's preferences as the pickers load."}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {d.accountFields.map((af) => {
          const meta = ACCT_META[af.key];
          const auto = d.autofilled.has(af.key);
          return (
            <Field key={af.key} label={meta.label} required={af.required} hint={auto ? <span className="inline-flex items-center gap-1 text-bz-leaf-deep"></span> : meta.hint} error={attempted && af.required && !f.accounts[af.key] ? "Required" : undefined}>
              <Picker value={f.accounts[af.key]} onChange={(o) => h.setAccount(af.key, o)} options={d.options.ledgers[af.key]} title={meta.label} placeholder="Select account" required={af.required} error={attempted && af.required && !f.accounts[af.key]} loading={d.rescoping} icon={Landmark} addNewLabel="New account" onAddNew={() => h.toast("Opening the chart of accounts…")} scopedNote />
            </Field>
          );
        })}
      </div>

      <div className="h-px bg-bz-line-soft" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ToggleRow icon={Percent} label="Taxable" desc="Apply tax when this item is bought or sold." value={f.taxable} onChange={(v) => h.patch({ taxable: v, taxCode: v ? f.taxCode : null })} />
        {f.taxable && (
          <Field label="Default tax code" required error={attempted && !f.taxCode ? "Required" : undefined}>
            <Picker value={f.taxCode} onChange={(o) => h.patch({ taxCode: o })} options={d.options.tax} title="tax code" placeholder="Select tax code" required error={attempted && !f.taxCode} loading={d.rescoping} icon={Percent} />
          </Field>
        )}
      </div>
    </div>
  );
}

function StockSection({ f, d, h, attempted }: SP) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Valuation / costing method">
          <Picker value={f.valuation ? (VALUATION.find((v) => v.id === f.valuation) ? refToOpt(VALUATION.find((v) => v.id === f.valuation)!) : { id: f.valuation, label: f.valuation }) : null} onChange={(o) => h.patch({ valuation: o?.id ?? null })} options={VALUATION.map(refToOpt)} title="valuation method" placeholder="Select method" />
        </Field>
        <Field label="Safety-stock level" hint="units"><NumberInput value={f.safetyStock} onChange={(v) => h.patch({ safetyStock: v })} align="right" placeholder="0" /></Field>
        <Field label="Reorder point" hint="units"><NumberInput value={f.reorderPoint} onChange={(v) => h.patch({ reorderPoint: v })} align="right" placeholder="0" /></Field>
        <Field label="Minimum order qty" hint="units"><NumberInput value={f.minOrderQty} onChange={(v) => h.patch({ minOrderQty: v })} align="right" placeholder="0" /></Field>
        <Field label="Replenishment lead time" hint="days"><NumberInput value={f.leadTimeStock} onChange={(v) => h.patch({ leadTimeStock: v })} align="right" suffix="days" placeholder="0" /></Field>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <ToggleRow icon={ScanLine} label="Track batch numbers" desc="Capture a batch / lot on every stock movement." value={f.hasBatch} onChange={(v) => h.patch({ hasBatch: v })} />
        <ToggleRow icon={ScanLine} label="Track serial numbers" desc="Capture a unique serial per unit." value={f.hasSerial} onChange={(v) => h.patch({ hasSerial: v })} />
        <ToggleRow icon={AlertTriangle} label="Allow negative stock" desc="Permit issuing more than is on hand (goes negative)." value={f.allowNegative} onChange={(v) => h.patch({ allowNegative: v })} />
      </div>

      <div className="h-px bg-bz-line-soft" />

      {/* units of measure — coupled to inventory: only configurable when stock is maintained */}
      <div>
        <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft"><ArrowRightLeft size={11} /> Units of measure</p>
        <div className="mb-3 flex items-center gap-2 rounded-bz-md bg-bz-paper-warm/50 px-3 py-2 text-[11px] text-bz-text-muted">
          <Info size={12} className="shrink-0 text-bz-text-soft" /> Base unit is <span className="font-semibold text-bz-text">{f.baseUnit?.label ?? "not set"}</span> (set in General). Define alternate units &amp; pack conversions here.
        </div>
        <ToggleRow icon={ArrowRightLeft} label="Multiple units of measure" desc="Buy, stock and sell this item in different units (e.g. tablet / strip / box)." value={f.multiUOM} onChange={(v) => h.patch({ multiUOM: v, salesUnit: v ? f.salesUnit : null, stockUnit: v ? f.stockUnit : null, consumptionUnit: v ? f.consumptionUnit : null })} />
        {f.multiUOM && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Sales unit"><Picker value={f.salesUnit} onChange={(o) => h.patch({ salesUnit: o })} options={d.options.units} title="sales unit" placeholder="Select" icon={Ruler} /></Field>
            <Field label="Stock unit"><Picker value={f.stockUnit} onChange={(o) => h.patch({ stockUnit: o })} options={d.options.units} title="stock unit" placeholder="Select" icon={Ruler} /></Field>
            <Field label="Consumption unit"><Picker value={f.consumptionUnit} onChange={(o) => h.patch({ consumptionUnit: o })} options={d.options.units} title="consumption unit" placeholder="Select" icon={Ruler} /></Field>
          </div>
        )}
        <div className="mt-4"><UnitConversionEditor baseUnit={f.baseUnit} rows={f.conversions} onChange={(rows) => h.patch({ conversions: rows })} unitOptions={d.options.units} attempted={attempted} /></div>
      </div>
    </div>
  );
}

function PurchasingSection({ f, d, h }: SP) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Preferred vendor" className="sm:col-span-2">
        <Picker value={f.vendor} onChange={(o) => h.patch({ vendor: o })} options={d.options.vendors} title="vendor" placeholder="Search vendors" icon={ShoppingCart} loading={d.rescoping} onView={() => f.vendor && h.toast(`Opening ${f.vendor.label}…`)} addNewLabel="New vendor" onAddNew={() => h.toast("Opening the new-vendor form…")} onAdvanced={() => h.toast("Opening advanced vendor search…")} scopedNote />
      </Field>
      <Field label="Standard purchase rate" hint="per base unit"><NumberInput value={f.purchaseRate} onChange={(v) => h.patch({ purchaseRate: v })} align="right" prefix="₨" placeholder="0.00" /></Field>
      <Field label="Lead time" hint="days"><NumberInput value={f.leadTimeDays} onChange={(v) => h.patch({ leadTimeDays: v })} align="right" suffix="days" placeholder="0" /></Field>
      <Field label="Minimum purchase qty"><NumberInput value={f.purchaseMOQ} onChange={(v) => h.patch({ purchaseMOQ: v })} align="right" placeholder="0" /></Field>
    </div>
  );
}

function SellingSection({ f, d, h }: SP) {
  const S = f.salesRate ?? 0;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Standard sales rate" hint="per base unit"><NumberInput value={f.salesRate} onChange={h.setSalesRate} align="right" prefix="₨" placeholder="0.00" /></Field>
        <div className="hidden sm:block" />
        <Field label="Min sales qty"><NumberInput value={f.minSalesQty} onChange={(v) => h.patch({ minSalesQty: v })} align="right" placeholder="0" /></Field>
        <Field label="Max sales qty"><NumberInput value={f.maxSalesQty} onChange={(v) => h.patch({ maxSalesQty: v })} align="right" placeholder="0" /></Field>
      </div>

      <div className="h-px bg-bz-line-soft" />

      <ToggleRow icon={Tag} label="Default discount" desc="Pre-set a standard discount that flows onto sales lines." value={f.defaultDiscount} onChange={(v) => h.patch({ defaultDiscount: v })} />

      {f.defaultDiscount && (
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Discount %" error={undefined}>
              <NumberInput value={d.disc.pct} onChange={h.setDiscPct} align="right" suffix="%" placeholder="0" error={d.disc.over} />
            </Field>
            <Field label="Discount amount" hint={S > 0 ? `of ₨ ${fmtNum(S)}` : "set a sales rate first"}>
              <NumberInput value={d.disc.amt} onChange={h.setDiscAmt} align="right" prefix="₨" placeholder="0.00" error={d.disc.over} />
            </Field>
          </div>
          {d.disc.over && <InlineWarn>Discount exceeds the sale value — keep it at or below {S > 0 ? `₨ ${fmtNum(S)} (100%)` : "the sales rate"}.</InlineWarn>}
          {!d.disc.over && (d.disc.pct ?? 0) > 0 && S > 0 && (
            <p className={cn("mt-1.5 text-[11px] text-bz-text-muted", NUM)}>Net price ≈ ₨ {fmtNum(S - (d.disc.amt ?? 0))} per {f.baseUnit?.label ?? "unit"}.</p>
          )}
        </div>
      )}
    </div>
  );
}

function AttachmentsSection({ f, h }: SP) {
  return <FileAttachments files={f.files} onAdd={h.addFiles} onRemove={h.removeFile} onRetry={h.retryFile} onToast={h.toast} />;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION REGISTRY + STATUS
// ════════════════════════════════════════════════════════════════════════════

type SectionDef = { key: SectionKey; label: string; sub: string; icon: React.ComponentType<{ size?: number; className?: string }>; render: (sp: SP) => React.ReactNode; conditional?: boolean };

const SECTION_DEFS: SectionDef[] = [
  { key: "general", label: "General & Classification", sub: "Identity, scope, type", icon: Package, render: (sp) => <GeneralSection {...sp} /> },
  { key: "accounting", label: "Accounting", sub: "Ledger accounts & tax", icon: Landmark, render: (sp) => <AccountingSection {...sp} /> },
  { key: "stock", label: "Stock & Inventory", sub: "Stock rules & units", icon: Boxes, render: (sp) => <StockSection {...sp} />, conditional: true },
  { key: "purchasing", label: "Purchasing", sub: "Vendor & buy terms", icon: ShoppingCart, render: (sp) => <PurchasingSection {...sp} /> },
  { key: "selling", label: "Selling", sub: "Price & discount", icon: Tag, render: (sp) => <SellingSection {...sp} /> },
  { key: "attachments", label: "Attachments", sub: "Documents & files", icon: Paperclip, render: (sp) => <AttachmentsSection {...sp} /> },
];

// ════════════════════════════════════════════════════════════════════════════
// NAVIGATOR  (the switcher + live setup-progress + required-summary)
// ════════════════════════════════════════════════════════════════════════════

function ProgressCard({ doneReq, totalReq, canSave }: { doneReq: number; totalReq: number; canSave: boolean }) {
  const pct = totalReq === 0 ? 100 : Math.round((doneReq / totalReq) * 100);
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Setup progress</p>
        <span className={cn("inline-flex items-center gap-1.5 rounded-bz-pill px-2 py-0.5 text-[10.5px] font-semibold", canSave ? "bg-bz-fire/[0.18] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>
          <span className={cn("size-1.5 rounded-bz-pill", canSave ? "bg-bz-leaf-deep" : "bg-bz-text-soft")} />{canSave ? "Ready" : "In progress"}
        </span>
      </div>
      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className={cn("text-[20px] font-semibold leading-none text-bz-text", NUM)}>{pct}%</span>
        <span className={cn("text-[11px] text-bz-text-muted", NUM)}>· {doneReq} of {totalReq} required</span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
        <div className="h-full rounded-bz-pill transition-all" style={{ width: `${pct}%`, background: canSave ? "var(--bz-leaf-deep)" : "var(--bz-fire)" }} />
      </div>
    </div>
  );
}

type SecStat = { remaining: number; total: number; complete: boolean; visited: boolean };

function NavRail({ sections, active, onSelect, stat, doneReq, totalReq, canSave, attempted }: {
  sections: SectionDef[]; active: SectionKey; onSelect: (k: SectionKey) => void; stat: Record<SectionKey, SecStat>; doneReq: number; totalReq: number; canSave: boolean; attempted: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ProgressCard doneReq={doneReq} totalReq={totalReq} canSave={canSave} />
      <nav className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        {sections.map((s, i) => {
          const st = stat[s.key];
          const isActive = s.key === active;
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => onSelect(s.key)}
              className={cn("relative flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors", i > 0 && "border-t border-bz-line-soft", isActive ? "bg-bz-fire/[0.08]" : "hover:bg-bz-paper-warm/50")}>
              {isActive && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-bz-pill bg-bz-fire" />}
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-bz-md", isActive ? "bg-bz-fire/[0.22] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}><Icon size={15} /></span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[12.5px]", isActive ? "font-semibold text-bz-text" : "font-medium text-bz-text")}>{s.label}</span>
                <span className="block truncate text-[10.5px] text-bz-text-soft">{s.sub}</span>
              </span>
              <SecBadge st={st} attempted={attempted} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function SecBadge({ st, attempted }: { st: SecStat; attempted: boolean }) {
  if (st.remaining > 0) {
    return (
      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-bz-pill text-[10px] font-bold", NUM, attempted ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text-muted")} title={`${st.remaining} required field${st.remaining === 1 ? "" : "s"} remaining`}>{st.remaining}</span>
    );
  }
  if (st.total > 0 || st.complete) {
    return <span className="flex size-5 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22] text-bz-leaf-deep" title="Section complete"><Check size={12} strokeWidth={3} /></span>;
  }
  return <span className={cn("size-1.5 shrink-0 rounded-bz-pill", st.visited ? "bg-bz-leaf-deep" : "bg-bz-line")} title={st.visited ? "Visited" : "Optional"} />;
}

// mobile: horizontal chip strip
function NavStrip({ sections, active, onSelect, stat, attempted }: {
  sections: SectionDef[]; active: SectionKey; onSelect: (k: SectionKey) => void; stat: Record<SectionKey, SecStat>; attempted: boolean;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {sections.map((s) => {
        const st = stat[s.key];
        const isActive = s.key === active;
        const Icon = s.icon;
        return (
          <button key={s.key} onClick={() => onSelect(s.key)} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-bz-pill border px-3 py-1.5 text-[12px] font-medium transition-colors", isActive ? "border-bz-text bg-bz-surface text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-muted")}>
            <Icon size={13} className={isActive ? "text-bz-text" : "text-bz-text-soft"} />
            {s.label.split(" ")[0]}
            {st.remaining > 0 ? (
              <span className={cn("ml-0.5 flex size-4 items-center justify-center rounded-bz-pill text-[9px] font-bold", NUM, attempted ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text-muted")}>{st.remaining}</span>
            ) : (st.total > 0 || st.complete) ? (
              <Check size={11} className="ml-0.5 text-bz-leaf-deep" strokeWidth={3} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER  identity + company scope + Save mirror + overflow
// ════════════════════════════════════════════════════════════════════════════

function DocumentHeader({ mode, f, rescoping, canSave, saving, onSave, onReset, onOpenImage }: {
  mode: "create" | "edit"; f: Form; rescoping: boolean; canSave: boolean; saving: boolean; onSave: () => void; onReset: () => void; onOpenImage: () => void;
}) {
  const navigate = useNavigate();
  const typeMeta = ITEM_TYPES.find((t) => t.id === f.itemType)!;
  const hasPreview = !!f.image && f.image.status === "ready" && /^(blob:|https?:|data:)/.test(f.image.preview);
  return (
    <div className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-4 md:px-6">
      <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"><ArrowLeft size={13} /> Items</button>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* identity */}
        <div className="flex min-w-0 items-center gap-3.5">
          <button onClick={onOpenImage} className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-paper-warm" aria-label="Set image">
            {f.image && f.image.status === "loading" ? <Loader2 size={15} className="animate-spin text-bz-fire" /> : hasPreview ? <img src={f.image!.preview} alt="" className="size-full object-cover" /> : f.image ? <span className="flex size-full items-center justify-center text-[15px] font-semibold text-bz-text-on-dark" style={{ background: swatchFor(f.name || "Item") }}>{initials(f.name || "Item")}</span> : <ImageIcon size={16} className="text-bz-text-soft" />}
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-[20px] font-semibold tracking-tight text-bz-text md:text-[22px]">{f.name.trim() || (mode === "edit" ? "Edit item" : "New item")}</h1>
              <span className={cn("inline-flex items-center gap-1 rounded-bz-pill bg-bz-deep px-2 py-0.5 text-[11px] font-semibold text-bz-paper", NUM)}>{f.code}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Chip>{typeMeta.label}</Chip>
              <Chip tone={f.maintainStock ? "fire" : undefined}>{f.maintainStock ? "Stocked" : "Not stocked"}</Chip>
              {MULTI_COMPANY && <Chip>{f.companies.length} compan{f.companies.length === 1 ? "y" : "ies"}</Chip>}
              {f.inactive ? <Chip tone="danger">Inactive</Chip> : <Chip tone="leaf">Active</Chip>}
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {rescoping && <span className="inline-flex items-center gap-1.5 text-[11px] text-bz-text-muted"><Loader2 size={12} className="animate-spin text-bz-fire" /> re-scoping…</span>}
          <button onClick={onSave} disabled={!canSave || saving} className={cn(SOLID_BTN, "h-9")}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{saving ? "Saving…" : mode === "edit" ? "Save changes" : "Save item"}</button>
          <HeaderOverflow onReset={onReset} />
        </div>
      </div>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "fire" | "leaf" | "danger" }) {
  const cls = tone === "fire" ? "bg-bz-fire/[0.18] text-bz-text" : tone === "leaf" ? "bg-bz-leaf/50 text-bz-text" : tone === "danger" ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text-muted";
  return <span className={cn("inline-flex items-center rounded-bz-sm px-1.5 py-0.5 text-[10.5px] font-medium", cls)}>{children}</span>;
}

function HeaderOverflow({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label="More actions" className={cn("flex size-9 items-center justify-center rounded-bz-md border text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text", open ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface")}><MoreHorizontal size={16} /></button>
      {open && (
        <div className="absolute right-0 top-[42px] z-30 w-52 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <button onClick={() => { setOpen(false); onReset(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm"><RotateCcw size={13} className="text-bz-text-muted" /><span className="text-[12px] font-medium text-bz-text">Reset form</span></button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED FOOTER  (overlay) — always-reachable Save, gated, with what's-blocking
// ════════════════════════════════════════════════════════════════════════════

function DockedFooter({ mode, saving, dirty, canSave, remaining, onCancel, onSave, onJump }: {
  mode: "create" | "edit"; saving: boolean; dirty: boolean; canSave: boolean; remaining: ReqItem[]; onCancel: () => void; onSave: () => void; onJump: (s: SectionKey) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  React.useEffect(() => { if (remaining.length === 0) setOpen(false); }, [remaining.length]);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <div className="relative flex min-w-0 items-center" ref={ref}>
        {saving ? (
          <p className="flex items-center gap-2 text-[12px] text-bz-text-muted"><Loader2 size={13} className="animate-spin text-bz-fire" /> Saving the item…</p>
        ) : remaining.length > 0 ? (
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 text-[12px] font-medium text-bz-text hover:opacity-80">
            <span className={cn("flex size-5 items-center justify-center rounded-bz-pill bg-[#FBE5E2] text-[10px] font-bold text-[#9A2E29]", NUM)}>{remaining.length}</span>
            <span className="truncate">required field{remaining.length === 1 ? "" : "s"} remaining</span>
            <ChevronDown size={12} className={cn("text-bz-text-muted transition-transform", open && "rotate-180")} />
          </button>
        ) : (
          <p className="flex items-center gap-2 text-[12px] text-bz-text-muted">{dirty ? <><span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Ready to save{mode === "edit" ? " — unsaved changes" : ""}</> : <><Check size={13} className="text-bz-leaf-deep" /> {mode === "edit" ? "No changes yet" : "All required fields complete"}</>}</p>
        )}
        {open && remaining.length > 0 && (
          <div className="absolute bottom-[36px] left-0 z-30 w-72 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_-18px_44px_-20px_rgba(15,20,17,0.22)]">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Complete to save</p>
            {remaining.map((r, i) => (
              <button key={i} onClick={() => { onJump(r.section); setOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm">
                <span className="size-1.5 shrink-0 rounded-bz-pill bg-[#C0413A]" />
                <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">{r.label}</span>
                <ChevronRight size={12} className="shrink-0 text-bz-text-soft" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={onCancel} disabled={saving} className={GHOST_BTN}>Cancel</button>
        <button onClick={onSave} disabled={!canSave || saving} className={cn(SOLID_BTN, "h-9")}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{saving ? "Saving…" : mode === "edit" ? "Save changes" : "Save item"}</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

type ToastState = { kind: "success" | "warning"; message: string; id: number } | null;
function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => { if (!toast) return; const t = window.setTimeout(onDismiss, 4200); return () => window.clearTimeout(t); }, [toast, onDismiss]);
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", toast.kind === "success" ? "bg-bz-fire/[0.22]" : "bg-bz-leaf/50")}>{toast.kind === "success" ? <Check size={13} className="text-bz-leaf-deep" /> : <AlertTriangle size={12} className="text-bz-text" />}</span>
        <p className="max-w-[440px] text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function ItemFormDesignPage({ mode = "create" }: { mode?: "create" | "edit" }) {
  const navigate = useNavigate();
  const seedRef = React.useRef<Form | null>(null);
  if (!seedRef.current) seedRef.current = buildSeed(mode);

  const [f, setF] = React.useState<Form>(seedRef.current);
  const [active, setActive] = React.useState<SectionKey>("general");
  const [visited, setVisited] = React.useState<Set<SectionKey>>(new Set(["general"]));
  const [attempted, setAttempted] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [rescoping, setRescoping] = React.useState(false);
  const [autofilled, setAutofilled] = React.useState<Set<AcctKey>>(new Set());
  const [imageOpen, setImageOpen] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const showToast = React.useCallback((message: string, kind: "success" | "warning" = "success") => setToast({ kind, message, id: ++toastId.current }), []);

  const autofillTouched = React.useRef<Set<string>>(new Set());
  const uploadIvs = React.useRef<Record<string, number>>({});
  const imageTimer = React.useRef<number | null>(null);
  React.useEffect(() => () => { Object.values(uploadIvs.current).forEach((i) => window.clearInterval(i)); if (imageTimer.current) window.clearTimeout(imageTimer.current); }, []);

  const patch = React.useCallback((p: Partial<Form>) => { setF((prev) => ({ ...prev, ...p })); setDirty(true); }, []);

  // ── edit-mode: simulate the async image-by-id download (component 12) ──
  React.useEffect(() => {
    if (mode === "edit" && f.image && f.image.status === "loading") {
      imageTimer.current = window.setTimeout(() => setF((prev) => (prev.image ? { ...prev, image: { ...prev.image, status: "ready", preview: "swatch" } } : prev)), 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── derived: classification ──
  const typeMeta = React.useMemo(() => ITEM_TYPES.find((t) => t.id === f.itemType)!, [f.itemType]);
  const subTypeVisible = !!typeMeta.subtypes && f.itemType !== "stock" && f.itemType !== "fixed";
  const accountFields = React.useMemo(() => TYPE_ACCOUNTS[f.itemType], [f.itemType]);

  // ── derived: company-scoped option pools ──
  const companies = f.companies;
  const inScope = React.useCallback((r: { companies?: string[] }) => !r.companies || r.companies.some((c) => companies.includes(c)) || companies.length === 0, [companies]);
  const options = React.useMemo(() => {
    const ledgers = {} as Record<AcctKey, Opt[]>;
    (Object.keys(ACCT_META) as AcctKey[]).forEach((k) => {
      ledgers[k] = LEDGERS.filter((a) => a.kind === ACCT_META[k].kind && (a.companies.some((c) => companies.includes(c)) || companies.length === 0)).map((a) => ({ id: a.id, label: a.name, sub: `A/c ${a.code}`, meta: a.code }));
    });
    return {
      categories: CATEGORIES.filter(inScope).map(refToOpt),
      brands: BRANDS.map(refToOpt),
      parents: PARENTS.filter(inScope).map(refToOpt),
      units: UNITS.map(refToOpt),
      vendors: VENDORS.filter(inScope).map(refToOpt),
      tax: TAX_CODES.map(refToOpt),
      ledgers,
      itemTypes: ITEM_TYPES.map((t) => ({ id: t.id, label: t.label, sub: t.sub })),
      subTypes: (typeMeta.subtypes ?? []).map((s) => ({ id: s, label: s })),
    };
  }, [companies, inScope, typeMeta]);

  // ── derived: discount two-way ──
  const disc = React.useMemo(() => {
    const S = f.salesRate ?? 0;
    const amt = f.discAmt;
    const pct = f.discPct;
    const over = f.defaultDiscount && (f.discMode === "pct" ? (pct ?? 0) > 100 : (amt ?? 0) > S);
    return { amt, pct, over, valid: !f.defaultDiscount || !over };
  }, [f.salesRate, f.discAmt, f.discPct, f.discMode, f.defaultDiscount]);

  // ── cascade: classification → account-field set ──
  const setItemType = React.useCallback((id: ItemTypeId) => {
    const meta = ITEM_TYPES.find((t) => t.id === id)!;
    setF((prev) => {
      const keepKeys = new Set(TYPE_ACCOUNTS[id].map((a) => a.key));
      const accounts = { ...prev.accounts };
      (Object.keys(accounts) as AcctKey[]).forEach((k) => { if (!keepKeys.has(k)) accounts[k] = null; });
      const becomingStock = meta.stock;
      return {
        ...prev,
        itemType: id,
        maintainStock: becomingStock,
        subType: meta.subtypes && id !== "stock" && id !== "fixed" ? prev.subType : null,
        accounts,
        ...(becomingStock ? {} : { safetyStock: undefined, reorderPoint: undefined, minOrderQty: undefined, leadTimeStock: undefined, allowNegative: false, hasSerial: false, hasBatch: false, multiUOM: false, salesUnit: null, stockUnit: null, consumptionUnit: null, conversions: [blankConv()] }),
      };
    });
    setAutofilled(new Set());
    setDirty(true);
  }, []);

  // ── cascade: stock flag ⇄ classification ──
  const setMaintainStock = React.useCallback((v: boolean) => {
    if (v) { setItemType("stock"); }
    else {
      setF((prev) => {
        const keepKeys = new Set(TYPE_ACCOUNTS["nonstock"].map((a) => a.key));
        const accounts = { ...prev.accounts };
        (Object.keys(accounts) as AcctKey[]).forEach((k) => { if (!keepKeys.has(k)) accounts[k] = null; });
        return { ...prev, maintainStock: false, itemType: "nonstock", accounts, safetyStock: undefined, reorderPoint: undefined, minOrderQty: undefined, leadTimeStock: undefined, allowNegative: false, hasSerial: false, hasBatch: false, multiUOM: false, salesUnit: null, stockUnit: null, consumptionUnit: null, conversions: [blankConv()] };
      });
      setAutofilled(new Set());
      setActive((a) => (a === "stock" ? "general" : a));
      setDirty(true);
    }
  }, [setItemType]);

  // ── cascade: account picker manual edit (don't auto-refill afterwards) ──
  const setAccount = React.useCallback((k: AcctKey, o: Opt | null) => {
    autofillTouched.current.add(k + (companies[0] ?? ""));
    setAutofilled((prev) => { const n = new Set(prev); n.delete(k); return n; });
    setF((prev) => ({ ...prev, accounts: { ...prev.accounts, [k]: o } }));
    setDirty(true);
  }, [companies]);

  // ── cascade: parent → category inheritance ──
  const setParent = React.useCallback((o: Opt | null) => {
    const parentRef = o ? PARENTS.find((p) => p.id === o.id) : null;
    const inheritedCat = parentRef?.category ? CATEGORIES.find((c) => c.id === parentRef.category) : null;
    setF((prev) => ({ ...prev, parent: o, category: inheritedCat ? refToOpt(inheritedCat) : prev.category }));
    setDirty(true);
    if (inheritedCat) showToast(`Category “${inheritedCat.label}” inherited from ${o!.label}.`);
  }, [showToast]);

  // ── cascade: subsidiary scoping → re-scope every reference picker ──
  const setCompanies = React.useCallback((ids: string[]) => {
    setF((prev) => ({ ...prev, companies: ids }));
    setDirty(true);
    setRescoping(true);
    autofillTouched.current = new Set();
    setAutofilled(new Set());
    window.setTimeout(() => { setRescoping(false); showToast(ids.length ? `Reference data re-scoped to ${ids.join(", ")}.` : "No company selected — reference lists cleared."); }, 650);
  }, [showToast]);

  // ── create-mode preference auto-fill (binds defaults as pickers "load") ──
  React.useEffect(() => {
    if (mode !== "create" || rescoping) return;
    const company = companies[0];
    const prefs = company ? COMPANY_PREFS[company] ?? DEFAULT_PREFS : undefined;
    if (!prefs) return;
    const toFill = accountFields.filter((af) => !f.accounts[af.key] && prefs[af.key] && !autofillTouched.current.has(af.key + company));
    if (!toFill.length) return;
    const t = window.setTimeout(() => {
      setF((prev) => {
        const accounts = { ...prev.accounts };
        toFill.forEach((af) => { if (!accounts[af.key] && prefs[af.key]) { accounts[af.key] = ledgerOpt(prefs[af.key]); autofillTouched.current.add(af.key + company); } });
        return { ...prev, accounts };
      });
      setAutofilled((prev) => { const n = new Set(prev); toFill.forEach((af) => n.add(af.key)); return n; });
    }, 500);
    return () => window.clearTimeout(t);
  }, [accountFields, companies, rescoping, mode, f.accounts]);

  // ── selling: sales rate + two-way discount ──
  const setSalesRate = React.useCallback((v: number | undefined) => {
    setF((prev) => {
      const S = v ?? 0;
      let discAmt = prev.discAmt, discPct = prev.discPct;
      if (prev.discMode === "pct" && prev.discPct != null) discAmt = S > 0 ? roundDp(S * prev.discPct / 100) : 0;
      else if (prev.discMode === "amt" && prev.discAmt != null) discPct = S > 0 ? roundDp(prev.discAmt / S * 100) : undefined;
      return { ...prev, salesRate: v, discAmt, discPct };
    });
    setDirty(true);
  }, []);
  const setDiscPct = React.useCallback((v: number | undefined) => { setF((prev) => { const S = prev.salesRate ?? 0; return { ...prev, discMode: "pct", discPct: v, discAmt: v != null && S > 0 ? roundDp(S * v / 100) : v != null ? 0 : undefined }; }); setDirty(true); }, []);
  const setDiscAmt = React.useCallback((v: number | undefined) => { setF((prev) => { const S = prev.salesRate ?? 0; return { ...prev, discMode: "amt", discAmt: v, discPct: v != null && S > 0 ? roundDp(v / S * 100) : v != null && v > 0 ? 100 : undefined }; }); setDirty(true); }, []);

  // ── attachments (controlled from root so progress survives switch-away) ──
  const addFiles = React.useCallback((list: { name: string; size: number }[]) => {
    const added: FileRec[] = list.map((x) => ({ id: uid("f"), name: x.name, size: x.size, status: "uploading", progress: 8, ts: "Just now" }));
    setF((prev) => ({ ...prev, files: [...prev.files, ...added] }));
    setDirty(true);
    added.forEach((a) => {
      const iv = window.setInterval(() => {
        setF((prev) => ({ ...prev, files: prev.files.map((fr) => { if (fr.id !== a.id) return fr; const next = Math.min(100, fr.progress + 18 + Math.floor(Math.random() * 14)); if (next >= 100) { window.clearInterval(uploadIvs.current[a.id]); delete uploadIvs.current[a.id]; return { ...fr, progress: 100, status: "done", ts: "Just now" }; } return { ...fr, progress: next }; }) }));
      }, 240);
      uploadIvs.current[a.id] = iv;
    });
  }, []);
  const removeFile = React.useCallback((id: string) => { if (uploadIvs.current[id]) { window.clearInterval(uploadIvs.current[id]); delete uploadIvs.current[id]; } setF((prev) => ({ ...prev, files: prev.files.filter((x) => x.id !== id) })); setDirty(true); }, []);
  const retryFile = React.useCallback((id: string) => { setF((prev) => ({ ...prev, files: prev.files.map((x) => (x.id === id ? { ...x, status: "uploading", progress: 12 } : x)) })); const iv = window.setInterval(() => { setF((prev) => ({ ...prev, files: prev.files.map((fr) => { if (fr.id !== id) return fr; const next = Math.min(100, fr.progress + 20); if (next >= 100) { window.clearInterval(uploadIvs.current[id]); delete uploadIvs.current[id]; return { ...fr, progress: 100, status: "done", ts: "Just now" }; } return { ...fr, progress: next }; }) })); }, 240); uploadIvs.current[id] = iv; }, []);

  // ── image ──
  const onConfirmImage = (img: ImageValue) => { patch({ image: img }); setImageOpen(false); };
  const removeImage = () => { patch({ image: null }); };

  // ── sections (conditional Stock group) ──
  const sections = React.useMemo(() => SECTION_DEFS.filter((s) => !s.conditional || f.maintainStock), [f.maintainStock]);

  // ── requirements (single source for footer + rail + progress) ──
  const requirements = React.useMemo<ReqItem[]>(() => {
    const r: ReqItem[] = [];
    r.push({ section: "general", label: "Item name", ok: f.name.trim().length > 0 });
    r.push({ section: "general", label: "Item type", ok: !!f.itemType });
    if (MULTI_COMPANY) r.push({ section: "general", label: "At least one company", ok: f.companies.length > 0 });
    accountFields.forEach((af) => { if (af.required) r.push({ section: "accounting", label: ACCT_META[af.key].label, ok: !!f.accounts[af.key] }); });
    if (f.taxable) r.push({ section: "accounting", label: "Default tax code", ok: !!f.taxCode });
    r.push({ section: "general", label: "Base unit", ok: !!f.baseUnit });
    if (f.maintainStock) {
      const convOk = f.conversions.every((c) => (!c.unit && c.factor == null) || (!!c.unit && (c.factor ?? 0) > 0));
      if (f.conversions.some((c) => c.unit || c.factor != null)) r.push({ section: "stock", label: "Unit conversions valid", ok: convOk });
    }
    if (f.defaultDiscount) r.push({ section: "selling", label: "Discount within range", ok: disc.valid });
    return r;
  }, [f, accountFields, disc.valid]);

  const remaining = requirements.filter((x) => !x.ok);
  const doneReq = requirements.length - remaining.length;
  const canSave = remaining.length === 0 && !saving && !rescoping;

  // per-section status
  const stat = React.useMemo(() => {
    const s = {} as Record<SectionKey, SecStat>;
    SECTION_DEFS.forEach((def) => {
      const reqs = requirements.filter((r) => r.section === def.key);
      s[def.key] = { total: reqs.length, remaining: reqs.filter((r) => !r.ok).length, complete: reqs.length > 0 && reqs.every((r) => r.ok), visited: visited.has(def.key) };
    });
    return s;
  }, [requirements, visited]);

  const goSection = React.useCallback((k: SectionKey) => { setActive(k); setVisited((prev) => new Set(prev).add(k)); }, []);

  // ── reset ──
  const resetForm = () => {
    const fresh = buildSeed(mode);
    setF(fresh); setActive("general"); setVisited(new Set(["general"])); setAttempted(false); setDirty(false); setAutofilled(new Set()); autofillTouched.current = new Set();
    showToast(mode === "edit" ? "Reverted to the saved record." : "Form reset to a blank item.");
  };

  // ── submit ──
  const handleSave = React.useCallback(() => {
    if (saving) return;
    if (remaining.length > 0) { setAttempted(true); goSection(remaining[0].section); showToast("Complete the required fields before saving.", "warning"); return; }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      if (mode === "create") {
        const code = f.code;
        showToast(`${code} — ${f.name.trim() || "Item"} created. Form cleared for the next item.`);
        const fresh = buildSeed("create");
        setF(fresh); setActive("general"); setVisited(new Set(["general"])); setAttempted(false); setDirty(false); setAutofilled(new Set()); autofillTouched.current = new Set();
      } else {
        setDirty(false);
        showToast(`${f.code} — ${f.name.trim() || "Item"} saved.`);
      }
    }, 950);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, remaining, mode, f.code, f.name, showToast, goSection]);

  // Cmd/Ctrl+S
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); handleSave(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSave]);

  const derived: Derived = { typeMeta, subTypeVisible, accountFields, options, rescoping, autofilled, disc };
  const helpers: Helpers = { patch, setAccount, setItemType, setMaintainStock, setCompanies, setApplyChildren: (v) => patch({ applyToChildren: v }), setParent, setSalesRate, setDiscPct, setDiscAmt, addFiles, removeFile, retryFile, openImage: () => setImageOpen(true), removeImage, toast: showToast, goSection, mode };
  const sp: SP = { f, d: derived, h: helpers, attempted };
  const activeDef = sections.find((s) => s.key === active) ?? sections[0];

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Inventory</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="text-bz-text-muted">Items</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">{mode === "edit" ? f.code : "New"}</span>
        </>
      }
      overlay={
        <>
          <DockedFooter mode={mode} saving={saving} dirty={dirty} canSave={canSave} remaining={remaining} onCancel={() => navigate(-1)} onSave={handleSave} onJump={(s) => { setAttempted(true); goSection(s); }} />
          <Toast toast={toast} onDismiss={() => setToast(null)} />
        </>
      }
    >
      <DocumentHeader mode={mode} f={f} rescoping={rescoping} canSave={canSave} saving={saving} onSave={handleSave} onReset={resetForm} onOpenImage={() => setImageOpen(true)} />

      <div className="px-4 pb-10 pt-5 md:px-6">
        {/* mobile section strip */}
        <div className="mb-4 lg:hidden">
          <ProgressCard doneReq={doneReq} totalReq={requirements.length} canSave={canSave} />
          <div className="mt-3"><NavStrip sections={sections} active={active} onSelect={goSection} stat={stat} attempted={attempted} /></div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[296px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* navigator (desktop) */}
          <div className="hidden lg:block lg:sticky lg:top-4 lg:self-start">
            <NavRail sections={sections} active={active} onSelect={goSection} stat={stat} doneReq={doneReq} totalReq={requirements.length} canSave={canSave} attempted={attempted} />
          </div>

          {/* active section panel */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
              <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3 md:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper"><activeDef.icon size={14} /></span>
                  <div className="min-w-0">
                    <h2 className="truncate text-[13.5px] font-semibold tracking-tight text-bz-text">{activeDef.label}</h2>
                    <p className="truncate text-[11px] text-bz-text-muted">{activeDef.sub}</p>
                  </div>
                </div>
                {stat[active].remaining > 0 ? (
                  <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-bz-pill px-2.5 py-1 text-[10.5px] font-semibold", attempted ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text-muted")}><span className={NUM}>{stat[active].remaining}</span> required left</span>
                ) : stat[active].total > 0 ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-bz-pill bg-bz-fire/[0.18] px-2.5 py-1 text-[10.5px] font-semibold text-bz-text"><Check size={11} strokeWidth={3} className="text-bz-leaf-deep" /> Complete</span>
                ) : (
                  <span className="shrink-0 rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[10.5px] font-medium text-bz-text-muted">Optional</span>
                )}
              </div>
              <div className="p-4 md:p-5">{activeDef.render(sp)}</div>

              {/* in-panel prev / next */}
              <PanelNav sections={sections} active={active} onSelect={goSection} />
            </div>
          </div>
        </div>
      </div>

      <ImagePickerModal open={imageOpen} onClose={() => setImageOpen(false)} onConfirm={onConfirmImage} />
    </AppShell>
  );
}

function PanelNav({ sections, active, onSelect }: { sections: SectionDef[]; active: SectionKey; onSelect: (k: SectionKey) => void }) {
  const idx = sections.findIndex((s) => s.key === active);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx < sections.length - 1 ? sections[idx + 1] : null;
  return (
    <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm/20 px-4 py-2.5 md:px-5">
      {prev ? (
        <button onClick={() => onSelect(prev.key)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text"><ChevronLeft size={14} /> {prev.label}</button>
      ) : <span />}
      {next ? (
        <button onClick={() => onSelect(next.key)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">{next.label} <ChevronRight size={14} /></button>
      ) : <span />}
    </div>
  );
}
