import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router";
import {
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Printer,
  Copy,
  Trash2,
  AlertTriangle,
  Check,
  Minus,
  X,
  Loader2,
  Lock,
  Eye,
  ImageOff,
  ExternalLink,
  Filter,
  ArrowUpRight,
  Inbox,
  PackageOpen,
  // section icons
  Package,
  Landmark,
  Boxes,
  ShoppingCart,
  Tag,
  Percent,
  GitBranch,
  Paperclip,
  // file icons
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  Download,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// ITEM MASTER · DETAIL / VIEWER  (read-only — inspect one item, then act on it)
//
// Same SHELL as the Item create/edit form (ItemFormDesignPage): identity header
// → left section-navigator rail → active section panel → docked footer. The only
// difference is that every value here is READ-ONLY — fields render as resolved
// label/value pairs, the many behavioural flags render as read-only Yes/No
// INDICATORS (never editable switches), the image is view-only, and the footer's
// Save becomes Edit.
//
// Behaviour (fetch-once, hydrate-everything):
//   • One load-by-id on entry populates every field, flag, the image (via its file
//     id) and the file list. No id → nothing loads.
//   • ONE whole-page busy overlay blocks the view during the initial load AND
//     during an in-flight delete (both feed the same state).
//   • The section navigator switches one domain into view at a time; ALL panels
//     stay MOUNTED (toggled with `hidden`), so the related-records / files / image
//     widgets keep their loaded state across switches.
//   • Delete is gated behind a confirm dialog and reports its outcome via a toast
//     (success, or a warning if the API fails) before returning to the list.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const MULTI_ORG = true; // tenant multi-organisation mode → subsidiary field present

const SOLID_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95";
const GHOST_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm";
const MENU_PANEL =
  "absolute right-0 top-[42px] z-30 w-56 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}`;
}

// ════════════════════════════════════════════════════════════════════════════
// STATUS TONE  (five-tone chip shared with the list / detail pages)
// ════════════════════════════════════════════════════════════════════════════

type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";

const CHIP_BG: Record<Tone, string> = {
  positive: "bg-bz-fire/[0.18] text-bz-text",
  partial: "bg-bz-leaf/50 text-bz-text",
  pending: "bg-bz-paper-warm text-bz-text-muted",
  danger: "bg-[#FBE5E2] text-[#9A2E29]",
  neutral: "bg-bz-paper-warm text-bz-text",
};
const DOT_BG: Record<Tone, string> = {
  positive: "bg-bz-leaf-deep",
  partial: "bg-bz-fire",
  pending: "bg-bz-line",
  danger: "bg-[#C0413A]",
  neutral: "bg-bz-text-soft",
};

function StatusChip({ label, tone, dot = true }: { label: string; tone: Tone; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", CHIP_BG[tone])}>
      {dot && <span className={cn("size-1.5 shrink-0 rounded-bz-pill", DOT_BG[tone])} />}
      {label}
    </span>
  );
}

// map a related-record status string → semantic tone (order matters)
function relTone(status: string): Tone {
  const s = status.toLowerCase();
  if (["cancel", "reject", "void", "fail", "return"].some((k) => s.includes(k))) return "danger";
  if (["partial", "partly"].some((k) => s.includes(k))) return "partial";
  if (["draft", "pending", "await", "hold"].some((k) => s.includes(k))) return "pending";
  if (["approv", "deliver", "complet", "receiv", "invoic", "paid", "fulfil", "posted", "success"].some((k) => s.includes(k)))
    return "positive";
  if (["closed", "converted"].some((k) => s.includes(k))) return "neutral";
  return "neutral";
}

// ════════════════════════════════════════════════════════════════════════════
// SEED RECORD  (one fetch hydrates all of this — reconciles with the Item form)
// ════════════════════════════════════════════════════════════════════════════

const ITEM = {
  id: "IT-2042",
  name: "Paracetamol 500mg Tablet",
  description:
    "Analgesic & antipyretic. 500 mg paracetamol tablets, blister-packed 10×10. For relief of mild-to-moderate pain and fever. Store below 30 °C, away from direct light.",
  itemType: "Stock Item",
  stocked: true,
  inactive: false,
  imageFileId: "F-IMG-2042",
  imageName: "paracetamol-500.jpg",

  // audit (rail summary)
  createdOn: "2026-03-14",
  createdBy: "Priya Maharjan",
  updatedOn: "2026-06-18",
  updatedBy: "Sandeep Rai",

  // general & classification
  category: "Pharmaceuticals",
  brand: "Square Pharma",
  parent: "", // empty → renders "—"
  subType: "",
  subsidiary: "NP-01 · Bizak Nepal", // conditional on MULTI_ORG
  barcode: "8901234500425",

  // accounting ledgers
  incomeAccount: "4001 · Sales Revenue — Goods",
  inventoryAccount: "1201 · Inventory — Trading Goods",
  cogsAccount: "5001 · Cost of Goods Sold",
  expenseAccount: "",
  gainLossAccount: "5301 · Inventory Gain / Loss",

  // inventory / stock controls
  valuation: "FIFO — First-in, first-out",
  baseUnit: "Tablet",
  salesUnit: "Strip",
  stockUnit: "Box",
  consumptionUnit: "Tablet",
  safetyStock: 500,
  reorderPoint: 1000,
  minOrderQty: 100,
  stockLeadTime: 7,

  // purchasing
  vendor: "Square Pharma Ltd",
  purchaseRate: "NPR 2.40",
  purchaseMOQ: 1000,
  purchaseLeadTime: 7,
  hsCode: "3004.90.00",

  // sales
  salesRate: "NPR 4.00",
  discount: "5%",
  minSalesQty: 1,
  maxSalesQty: 5000,
  commission: "2%",

  // tax
  taxCode: "Exempt",
  taxRate: "0%",

  // read-only state flags (surfaced as indicators, never editable here)
  maintainStock: true,
  flagInactive: false,
  nonPosting: false,
  trackLandedCost: false,
  serialized: false,
  batchTracked: true,
  allowNegativeStock: false,
  hasWarranty: false,
  discountAllowed: true,
  grantCommission: true,
  taxable: false,
};

// a flat SVG that stands in for the resolved image blob (no gradients)
const IMG_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='480' viewBox='0 0 480 480'>
<rect width='480' height='480' fill='#F4F5EF'/>
<rect x='84' y='168' width='216' height='84' rx='42' fill='#FFFFFF' stroke='#D8D9D3' stroke-width='4'/>
<line x1='192' y1='168' x2='192' y2='252' stroke='#D8D9D3' stroke-width='4'/>
<circle cx='312' cy='304' r='62' fill='#DBE9B8' stroke='#A8C76C' stroke-width='4'/>
<rect x='280' y='300' width='64' height='8' rx='4' fill='#1A2D20'/>
<text x='240' y='400' font-family='Inter, sans-serif' font-size='26' fill='#5A6053' text-anchor='middle'>Paracetamol 500mg</text>
</svg>`;
const IMG_SRC = `data:image/svg+xml,${encodeURIComponent(IMG_SVG)}`;

// ════════════════════════════════════════════════════════════════════════════
// PER-SECTION read-only field / flag config
// ════════════════════════════════════════════════════════════════════════════

type DomainField = { label: string; value?: string | number | null; required?: boolean; isDate?: boolean };
type DomainFlag = { label: string; value: boolean; warnWhenOn?: boolean };

const GENERAL_FIELDS: DomainField[] = [
  { label: "Item name", value: ITEM.name, required: true },
  { label: "Item code", value: ITEM.id, required: true },
  { label: "Category", value: ITEM.category, required: true },
  { label: "Brand", value: ITEM.brand },
  { label: "Parent item", value: ITEM.parent },
  { label: "Item type", value: ITEM.itemType, required: true },
  { label: "Sub-type", value: ITEM.subType },
  ...(MULTI_ORG ? [{ label: "Subsidiary / Organisation", value: ITEM.subsidiary } as DomainField] : []),
  { label: "Barcode", value: ITEM.barcode },
  { label: "Created on", value: ITEM.createdOn, isDate: true },
];

const FIELD_DOMAINS: Record<string, { description?: string; fields: DomainField[]; flags: DomainFlag[] }> = {
  general: {
    description: ITEM.description,
    fields: GENERAL_FIELDS,
    flags: [
      { label: "Maintain stock", value: ITEM.maintainStock },
      { label: "Inactive", value: ITEM.flagInactive, warnWhenOn: true },
    ],
  },
  accounting: {
    fields: [
      { label: "Income / Revenue account", value: ITEM.incomeAccount, required: true },
      { label: "Inventory asset account", value: ITEM.inventoryAccount, required: true },
      { label: "COGS account", value: ITEM.cogsAccount, required: true },
      { label: "Expense account", value: ITEM.expenseAccount },
      { label: "Inventory gain / loss account", value: ITEM.gainLossAccount },
    ],
    flags: [
      { label: "Non-posting item", value: ITEM.nonPosting },
      { label: "Track landed cost", value: ITEM.trackLandedCost },
    ],
  },
  inventory: {
    fields: [
      { label: "Valuation method", value: ITEM.valuation },
      { label: "Base unit", value: ITEM.baseUnit, required: true },
      { label: "Sales unit", value: ITEM.salesUnit },
      { label: "Stock unit", value: ITEM.stockUnit },
      { label: "Consumption unit", value: ITEM.consumptionUnit },
      { label: "Safety stock", value: ITEM.safetyStock },
      { label: "Reorder point", value: ITEM.reorderPoint },
      { label: "Minimum order qty", value: ITEM.minOrderQty },
      { label: "Lead time (days)", value: ITEM.stockLeadTime },
    ],
    flags: [
      { label: "Serialized tracking", value: ITEM.serialized },
      { label: "Batch tracked", value: ITEM.batchTracked },
      { label: "Allow negative stock", value: ITEM.allowNegativeStock, warnWhenOn: true },
    ],
  },
  purchasing: {
    fields: [
      { label: "Default vendor", value: ITEM.vendor },
      { label: "Purchase rate", value: ITEM.purchaseRate },
      { label: "Purchase MOQ", value: ITEM.purchaseMOQ },
      { label: "Lead time (days)", value: ITEM.purchaseLeadTime },
      { label: "HS / customs code", value: ITEM.hsCode },
    ],
    flags: [{ label: "Has warranty", value: ITEM.hasWarranty }],
  },
  sales: {
    fields: [
      { label: "Sales rate", value: ITEM.salesRate, required: true },
      { label: "Default discount", value: ITEM.discount },
      { label: "Minimum sales qty", value: ITEM.minSalesQty },
      { label: "Maximum sales qty", value: ITEM.maxSalesQty },
      { label: "Commission rate", value: ITEM.commission },
    ],
    flags: [
      { label: "Discount allowed", value: ITEM.discountAllowed },
      { label: "Grant commission", value: ITEM.grantCommission },
    ],
  },
  tax: {
    fields: [
      { label: "Tax code", value: ITEM.taxCode },
      { label: "Tax rate", value: ITEM.taxRate },
      { label: "HS / customs code", value: ITEM.hsCode },
    ],
    flags: [{ label: "Taxable", value: ITEM.taxable }],
  },
};

// ── related transactions (separate fetch: form-type + id) ──
type RelatedRow = { date: string; type: string; doc: string; party: string; status: string; href?: string };
const RELATED: RelatedRow[] = [
  { date: "May 02, 2026", type: "Sales Order", doc: "SO-1041", party: "Karnali Pharma", status: "Invoiced", href: "/design/sales-order-list/SO-1041" },
  { date: "Apr 28, 2026", type: "Purchase Order", doc: "PO-3088", party: "Square Pharma Ltd", status: "Received" },
  { date: "Apr 22, 2026", type: "Sales Order", doc: "SO-1029", party: "Manakamana Stores", status: "Cancelled", href: "/design/sales-order-list/SO-1029" },
  { date: "Apr 20, 2026", type: "Delivery", doc: "DLV-0771", party: "Manakamana Stores", status: "Delivered" },
  { date: "Apr 11, 2026", type: "Stock Adjustment", doc: "ADJ-0233", party: "Kathmandu Warehouse", status: "Posted" },
  { date: "Mar 30, 2026", type: "Sales Invoice", doc: "INV-2031", party: "Karnali Pharma", status: "Partially Paid" },
  { date: "Mar 22, 2026", type: "Sales Invoice", doc: "INV-2018", party: "Bheri Pharmacy", status: "Draft" },
  { date: "Mar 14, 2026", type: "Purchase Order", doc: "PO-3066", party: "Square Pharma Ltd", status: "Closed" },
];
// master-mode type filter: every scopeable type (Quotation / Payment have zero rows → empty state)
const REL_TYPES = ["All", "Sales Order", "Purchase Order", "Sales Invoice", "Delivery", "Stock Adjustment", "Quotation", "Payment"] as const;
const relCount = (t: string) => (t === "All" ? RELATED.length : RELATED.filter((r) => r.type === t).length);

// ── attached files (mapped from the record's file collection) ──
type FileRow = { id: string; name: string; folder: string; size: string; ext: string; fails?: boolean };
const FILES: FileRow[] = [
  { id: "f1", name: "paracetamol-500.jpg", folder: "Items / Images", size: "184 KB", ext: "jpg" },
  { id: "f2", name: "msds-paracetamol.pdf", folder: "Items / Compliance", size: "512 KB", ext: "pdf" },
  { id: "f3", name: "dav-registration.pdf", folder: "Items / Compliance", size: "240 KB", ext: "pdf", fails: true },
  { id: "f4", name: "spec-sheet.docx", folder: "Engineering / Specs", size: "332 KB", ext: "docx" },
  { id: "f5", name: "price-history.xlsx", folder: "Sales / Pricing", size: "126 KB", ext: "xlsx" },
  { id: "f6", name: "carton-label.txt", folder: "Items / Labels", size: "4 KB", ext: "txt" },
];
const OPENABLE = ["png", "jpg", "jpeg", "gif", "webp", "pdf", "txt"];
function fileIcon(ext: string) {
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return FileImage;
  if (["xlsx", "xls", "csv"].includes(ext)) return FileSpreadsheet;
  if (["pdf", "docx", "doc", "txt"].includes(ext)) return FileText;
  return FileIcon;
}

// ── section navigator model ──
type SectionDef = { key: string; label: string; sub: string; icon: React.ComponentType<{ size?: number; className?: string }>; count?: number };
const SECTIONS: SectionDef[] = [
  { key: "general", label: "General & Classification", sub: "Identity, type, classification", icon: Package },
  { key: "accounting", label: "Accounting", sub: "Ledger accounts", icon: Landmark },
  { key: "inventory", label: "Inventory & Stock", sub: "Stock rules & units", icon: Boxes },
  { key: "purchasing", label: "Purchasing", sub: "Vendor & buy terms", icon: ShoppingCart },
  { key: "sales", label: "Sales", sub: "Pricing & discount", icon: Tag },
  { key: "tax", label: "Tax", sub: "Tax treatment", icon: Percent },
  { key: "related", label: "Related records", sub: "Linked transactions", icon: GitBranch, count: RELATED.length },
  { key: "files", label: "Attachments", sub: "Documents & files", icon: Paperclip, count: FILES.length },
];

type ToastMsg = { msg: string; tone: "success" | "warning" } | null;

// ════════════════════════════════════════════════════════════════════════════
// ATOMS  read-only field · read-only boolean indicator · chip · fetch / empty
// ════════════════════════════════════════════════════════════════════════════

function Req() {
  return <span className="ml-0.5 text-bz-fire" title="Required">*</span>;
}

function ReadField({ label, value, required, isDate }: DomainField) {
  const empty = value === undefined || value === null || value === "" || value === "—";
  const display = empty ? "—" : isDate ? fmtDate(String(value)) : String(value);
  return (
    <div className="min-w-0">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-bz-text-soft">
        {label}
        {required && <Req />}
      </p>
      <p className={cn("mt-1 text-[13px]", NUM, empty ? "text-bz-text-soft" : "text-bz-text")}>{display}</p>
    </div>
  );
}

// the page's read-only on/off atom — clearly NOT an editable switch
function BoolIndicator({ label, value, warnWhenOn }: DomainFlag) {
  const danger = !!warnWhenOn && value;
  return (
    <div className="flex items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2.5">
      <span className="min-w-0 truncate text-[12px] text-bz-text-muted">{label}</span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-bz-sm px-1.5 py-0.5 text-[10.5px] font-semibold",
          danger ? "bg-[#FBE5E2] text-[#9A2E29]" : value ? "bg-bz-fire/[0.18] text-bz-text" : "border border-bz-line-soft bg-bz-surface text-bz-text-muted",
        )}
      >
        {value ? <Check size={11} className={danger ? "text-[#C0413A]" : "text-bz-leaf-deep"} /> : <Minus size={11} className="text-bz-text-soft" />}
        {value ? "Yes" : "No"}
      </span>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "fire" | "leaf" | "danger" }) {
  const cls =
    tone === "fire"
      ? "bg-bz-fire/[0.18] text-bz-text"
      : tone === "leaf"
        ? "bg-bz-leaf/50 text-bz-text"
        : tone === "danger"
          ? "bg-[#FBE5E2] text-[#9A2E29]"
          : "bg-bz-paper-warm text-bz-text-muted";
  return <span className={cn("inline-flex items-center rounded-bz-sm px-1.5 py-0.5 text-[10.5px] font-medium", cls)}>{children}</span>;
}

function FetchState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-14 text-bz-text-muted">
      <Loader2 size={15} className="animate-spin text-bz-fire" />
      <span className="text-[12.5px]">{label}</span>
    </div>
  );
}

function EmptyBlock({ icon: Icon, title, body }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <Icon size={20} />
      </span>
      <p className="text-[13px] font-semibold text-bz-text">{title}</p>
      <p className="max-w-xs text-[12px] text-bz-text-muted">{body}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line-soft py-2 first:border-t-0 first:pt-0">
      <span className="shrink-0 text-[11px] text-bz-text-muted">{label}</span>
      <span className={cn("min-w-0 truncate text-right text-[11.5px] font-medium text-bz-text", NUM)}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// IMAGE PREVIEW  resolves the item's one image (loading → resolved / empty)
// ════════════════════════════════════════════════════════════════════════════

function ItemImage() {
  const [state, setState] = React.useState<"loading" | "ready" | "empty">(ITEM.imageFileId ? "loading" : "empty");
  React.useEffect(() => {
    if (!ITEM.imageFileId) {
      setState("empty");
      return;
    }
    const t = setTimeout(() => setState("ready"), 700); // simulate downloading the blob → object URL
    return () => clearTimeout(t);
  }, []);

  const box = "size-12 shrink-0 overflow-hidden rounded-bz-md border border-bz-line-soft sm:size-14";
  if (state === "loading") {
    return (
      <div className={cn(box, "flex items-center justify-center bg-bz-paper-warm")}>
        <Loader2 size={15} className="animate-spin text-bz-fire" />
      </div>
    );
  }
  if (state === "empty") {
    return (
      <div className={cn(box, "flex flex-col items-center justify-center gap-0.5 border-dashed bg-bz-paper-warm/60")}>
        <ImageOff size={15} className="text-bz-text-soft" />
        <span className="text-[8px] font-medium text-bz-text-soft">No image</span>
      </div>
    );
  }
  return (
    <button
      onClick={() => window.open(IMG_SRC, "_blank", "noopener,noreferrer")}
      className={cn(box, "group relative bg-bz-paper-warm")}
      title="Open full image in a new tab"
      aria-label="Open full image in a new tab"
    >
      <img src={IMG_SRC} alt={ITEM.name} className="size-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-bz-olive/0 opacity-0 transition-opacity group-hover:bg-bz-olive/35 group-hover:opacity-100">
        <ExternalLink size={14} className="text-bz-text-on-dark" />
      </span>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIELD SECTION  read-only values + read-only state-flag indicators
// ════════════════════════════════════════════════════════════════════════════

function FieldSection({ description, fields, flags }: { description?: string; fields: DomainField[]; flags: DomainFlag[] }) {
  return (
    <div className="flex flex-col gap-7">
      {description && (
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-bz-text-soft">Description</p>
          <p className="mt-1.5 max-w-3xl text-[12.5px] leading-relaxed text-bz-text">{description}</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <ReadField key={f.label} {...f} />
        ))}
      </div>
      {flags.length > 0 && (
        <div>
          <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-bz-text-muted">State flags</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {flags.map((fl) => (
              <BoolIndicator key={fl.label} {...fl} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RELATED RECORDS  self-fetching (loading / empty) + master-mode type filter
// ════════════════════════════════════════════════════════════════════════════

function RelatedRecords({ active, onOpen }: { active: boolean; onOpen: (r: RelatedRow) => void }) {
  const [state, setState] = React.useState<"idle" | "loading" | "loaded">("idle");
  const [filter, setFilter] = React.useState<(typeof REL_TYPES)[number]>("All");

  // first time this panel is revealed → fetch once; state then persists (the panel
  // stays mounted across section switches). A ref gates re-entry so the loading→
  // loaded timer isn't cancelled by the synchronous re-render that "loading" causes;
  // the timer is only torn down on real unmount.
  const started = React.useRef(false);
  const fetchTimer = React.useRef<number | null>(null);
  React.useEffect(() => () => { if (fetchTimer.current) clearTimeout(fetchTimer.current); }, []);
  React.useEffect(() => {
    if (active && !started.current) {
      started.current = true;
      setState("loading");
      fetchTimer.current = window.setTimeout(() => setState("loaded"), 800);
    }
  }, [active]);

  const rows = filter === "All" ? RELATED : RELATED.filter((r) => r.type === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Filter size={12} className="mr-0.5 text-bz-text-muted" />
        {REL_TYPES.map((t) => {
          const on = t === filter;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-bz-sm px-2.5 py-1 text-[11px] font-medium",
                on ? "bg-bz-olive text-bz-text-on-dark" : "border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm",
              )}
            >
              {t}
              <span className={cn("text-[10px]", NUM, on ? "text-bz-fire" : "text-bz-text-soft")}>{relCount(t)}</span>
            </button>
          );
        })}
      </div>

      {state !== "loaded" ? (
        <FetchState label="Loading related records…" />
      ) : rows.length === 0 ? (
        <EmptyBlock icon={Inbox} title="No related records" body={`No ${filter} documents are linked to ${ITEM.id}.`} />
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-bz-line-soft text-[10px] uppercase tracking-[0.06em] text-bz-text-muted">
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Document</th>
                  <th className="px-3 py-2 font-medium">Party</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="w-8 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-bz-line-soft">
                {rows.map((r) => {
                  const linkable = !!r.href;
                  return (
                    <tr key={r.doc} className={linkable ? "cursor-pointer hover:bg-bz-paper-warm/50" : ""} onClick={() => linkable && onOpen(r)}>
                      <td className={cn("py-3 pr-3 text-[11px] text-bz-text-muted", NUM)}>{r.date}</td>
                      <td className="px-3 py-3 text-[12px] text-bz-text">{r.type}</td>
                      <td className={cn("px-3 py-3 text-[12px] font-semibold text-bz-text", NUM)}>
                        {linkable ? (
                          <span className="inline-flex items-center gap-1 hover:underline">
                            {r.doc}
                            <ArrowUpRight size={11} className="text-bz-text-muted" />
                          </span>
                        ) : (
                          r.doc
                        )}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-bz-text-muted">{r.party}</td>
                      <td className="px-3 py-3">
                        <StatusChip label={r.status} tone={relTone(r.status)} dot={false} />
                      </td>
                      <td className="px-3 py-3">{linkable && <ArrowUpRight size={12} className="text-bz-text-muted" />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {rows.map((r) => {
              const linkable = !!r.href;
              return (
                <button
                  key={r.doc}
                  onClick={() => linkable && onOpen(r)}
                  disabled={!linkable}
                  className={cn("flex flex-col gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 p-3 text-left", linkable && "hover:bg-bz-paper-warm")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-bz-text-muted">{r.type}</span>
                    {linkable && <ArrowUpRight size={12} className="text-bz-text-muted" />}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{r.doc}</span>
                    <StatusChip label={r.status} tone={relTone(r.status)} dot={false} />
                  </div>
                  <span className={cn("text-[10.5px] text-bz-text-soft", NUM)}>{r.date} · {r.party}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ATTACHED FILES  per-file download · conditional preview · empty state
// ════════════════════════════════════════════════════════════════════════════

function AttachedFiles({ onToast }: { onToast: (t: ToastMsg) => void }) {
  if (FILES.length === 0) {
    return <EmptyBlock icon={Paperclip} title="No files attached" body="This item has no documents attached to it yet." />;
  }
  const download = (f: FileRow) =>
    onToast(f.fails ? { msg: `Couldn't download “${f.name}”. The file may be unavailable.`, tone: "warning" } : { msg: `Downloading “${f.name}”…`, tone: "success" });
  const preview = (f: FileRow) => {
    if (f.fails) {
      onToast({ msg: `Couldn't open a preview of “${f.name}”.`, tone: "warning" });
      return;
    }
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(f.ext)) {
      window.open(IMG_SRC, "_blank", "noopener,noreferrer");
      return;
    }
    onToast({ msg: `Opening a preview of “${f.name}”…`, tone: "success" });
  };

  return (
    <div className="flex flex-col gap-2.5">
      {FILES.map((f) => {
        const Icon = fileIcon(f.ext);
        const openable = OPENABLE.includes(f.ext);
        return (
          <div key={f.id} className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 px-3 py-2.5">
            <Icon size={16} className="shrink-0 text-bz-text-muted" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-bz-text">{f.name}</p>
              <p className={cn("text-[10.5px] text-bz-text-muted", NUM)}>{f.folder} · {f.size}</p>
            </div>
            {openable && (
              <button onClick={() => preview(f)} aria-label={`Preview ${f.name}`} title="Preview" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface hover:text-bz-text">
                <Eye size={14} />
              </button>
            )}
            <button onClick={() => download(f)} aria-label={`Download ${f.name}`} title="Download" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface hover:text-bz-text">
              <Download size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERFLOW MENU  Edit · Print (disabled) · Copy (disabled) · Delete
// ════════════════════════════════════════════════════════════════════════════

function OverflowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        className={cn(
          "flex size-9 items-center justify-center rounded-bz-md border text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface",
        )}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className={MENU_PANEL}>
          <button onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm">
            <Pencil size={13} className="text-bz-text" />
            <span className="text-[12px] font-medium text-bz-text">Edit item</span>
          </button>
          <div className="flex cursor-not-allowed items-center gap-2.5 px-3.5 py-2.5 opacity-55" title="Not available yet">
            <Printer size={13} className="text-bz-text-muted" />
            <span className="text-[12px] font-medium text-bz-text">Print</span>
          </div>
          <div className="flex cursor-not-allowed items-center gap-2.5 px-3.5 py-2.5 opacity-55" title="Not available yet">
            <Copy size={13} className="text-bz-text-muted" />
            <span className="text-[12px] font-medium text-bz-text">Duplicate</span>
          </div>
          <div className="my-1 h-px bg-bz-line-soft" />
          <button onClick={() => { setOpen(false); onDelete(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FBE5E2]">
            <Trash2 size={13} className="text-[#9A2E29]" />
            <span className="text-[12px] font-medium text-[#9A2E29]">Delete item</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG · TOAST · WHOLE-PAGE BUSY OVERLAY
// ════════════════════════════════════════════════════════════════════════════

function ConfirmDelete({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-24">
      <div onClick={onClose} className="absolute inset-0 bg-bz-olive/35 backdrop-blur-[1px]" aria-hidden />
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <div className="flex items-center justify-between border-b border-bz-line-soft bg-[#FBE5E2] px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#9A2E29]" />
            <p className="text-[13px] font-semibold text-[#9A2E29]">Delete item?</p>
          </div>
          <button onClick={onClose} aria-label="Cancel" title="Cancel" className="flex size-7 items-center justify-center rounded-bz-sm border border-[#9A2E29]/25 bg-bz-surface text-[#9A2E29] hover:bg-[#FBE5E2]">
            <X size={11} />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-[12.5px] leading-relaxed text-bz-text">
            Are you sure you want to delete <span className="font-semibold tabular-nums">{ITEM.id}</span> —{" "}
            <span className="font-semibold">{ITEM.name}</span>? This permanently removes the item master record. This can't be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-4 py-3">
          <button onClick={onClose} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
            Cancel
          </button>
          <button onClick={onConfirm} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3.5 text-[12px] font-semibold text-white hover:opacity-95">
            <Trash2 size={12} /> Delete item
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Toast({ toast, onClose }: { toast: ToastMsg; onClose: () => void }) {
  if (!toast) return null;
  const warn = toast.tone === "warning";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", warn ? "bg-[#FBE5E2]" : "bg-bz-fire/[0.18]")}>
          {warn ? <AlertTriangle size={13} className="text-[#C0413A]" /> : <Check size={13} className="text-bz-leaf-deep" />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.msg}</p>
        <button onClick={onClose} aria-label="Dismiss notification" className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

function BusyOverlay({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-bz-olive/25 backdrop-blur-[1px]">
      <div className="flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-5 py-4 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <Loader2 size={18} className="animate-spin text-bz-fire" />
        <span className="text-[13px] font-medium text-bz-text">{label}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER  back · image · concept label + name + code + status · actions
// ════════════════════════════════════════════════════════════════════════════

function DocumentHeader({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-4 md:px-6">
      <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">
        <ArrowLeft size={13} /> Items
      </button>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* identity */}
        <div className="flex min-w-0 items-center gap-3.5">
          <ItemImage />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Item</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-[20px] font-semibold tracking-tight text-bz-text md:text-[22px]">{ITEM.name}</h1>
              <span className={cn("rounded-bz-pill bg-bz-deep px-2 py-0.5 text-[11px] font-semibold text-bz-paper", NUM)}>{ITEM.id}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {ITEM.inactive ? <Chip tone="danger">Inactive</Chip> : <Chip tone="leaf">Active</Chip>}
              <Chip>{ITEM.itemType}</Chip>
              <Chip tone={ITEM.stocked ? "fire" : undefined}>{ITEM.stocked ? "Stocked" : "Not stocked"}</Chip>
              {MULTI_ORG && <Chip>{ITEM.subsidiary.split(" · ")[0]}</Chip>}
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button onClick={onEdit} className={SOLID_BTN}>
            <Pencil size={14} /> Edit
          </button>
          <OverflowMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NAVIGATOR  read-only Record card + section rail (desktop) / strip (mobile)
// ════════════════════════════════════════════════════════════════════════════

function RecordCard() {
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Record</p>
        <span className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-medium text-bz-text-muted">
          <Eye size={11} /> Read-only
        </span>
      </div>
      <div className="mt-3 flex flex-col">
        <MetaRow label="Status" value={<Chip tone={ITEM.inactive ? "danger" : "leaf"}>{ITEM.inactive ? "Inactive" : "Active"}</Chip>} />
        <MetaRow label="Created" value={`${fmtDate(ITEM.createdOn)} · ${ITEM.createdBy}`} />
        <MetaRow label="Last updated" value={`${fmtDate(ITEM.updatedOn)} · ${ITEM.updatedBy}`} />
      </div>
    </div>
  );
}

function NavRail({ active, onSelect }: { active: string; onSelect: (k: string) => void }) {
  return (
    <nav className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      {SECTIONS.map((s, i) => {
        const on = s.key === active;
        const Icon = s.icon;
        return (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={cn("relative flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors", i > 0 && "border-t border-bz-line-soft", on ? "bg-bz-fire/[0.08]" : "hover:bg-bz-paper-warm/50")}
          >
            {on && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-bz-pill bg-bz-fire" />}
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-bz-md", on ? "bg-bz-fire/[0.22] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>
              <Icon size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate text-[12.5px]", on ? "font-semibold text-bz-text" : "font-medium text-bz-text")}>{s.label}</span>
              <span className="block truncate text-[10.5px] text-bz-text-soft">{s.sub}</span>
            </span>
            {s.count !== undefined ? (
              <span className={cn("flex h-5 min-w-5 shrink-0 items-center justify-center rounded-bz-pill px-1 text-[10px] font-semibold", NUM, on ? "bg-bz-fire/[0.22] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>{s.count}</span>
            ) : (
              <ChevronRight size={13} className={cn("shrink-0", on ? "text-bz-text-muted" : "text-bz-text-soft")} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function NavStrip({ active, onSelect }: { active: string; onSelect: (k: string) => void }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SECTIONS.map((s) => {
        const on = s.key === active;
        const Icon = s.icon;
        return (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-bz-pill border px-3 py-1.5 text-[12px] font-medium transition-colors", on ? "border-bz-text bg-bz-surface text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-muted")}
          >
            <Icon size={13} className={on ? "text-bz-text" : "text-bz-text-soft"} />
            {s.label.split(" ")[0]}
            {s.count !== undefined && (
              <span className={cn("ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-bz-pill px-1 text-[9px] font-bold", NUM, on ? "bg-bz-fire/[0.22] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>{s.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PanelNav({ active, onSelect }: { active: string; onSelect: (k: string) => void }) {
  const idx = SECTIONS.findIndex((s) => s.key === active);
  const prev = idx > 0 ? SECTIONS[idx - 1] : null;
  const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;
  return (
    <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm/20 px-4 py-2.5 md:px-5">
      {prev ? (
        <button onClick={() => onSelect(prev.key)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">
          <ChevronLeft size={14} /> {prev.label}
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button onClick={() => onSelect(next.key)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">
          {next.label} <ChevronRight size={14} />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED FOOTER  (overlay slot) — read-only context + Edit mirror
// ════════════════════════════════════════════════════════════════════════════

function DockedFooter({ onEdit, onBack }: { onEdit: () => void; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <p className="flex min-w-0 items-center gap-2 text-[12px] text-bz-text-muted">
        <Lock size={13} className="shrink-0 text-bz-text-soft" />
        <span className="truncate">
          Read-only record · last updated <span className={NUM}>{fmtDate(ITEM.updatedOn)}</span>
        </span>
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={onBack} className={GHOST_BTN}>Back to Items</button>
        <button onClick={onEdit} className={cn(SOLID_BTN, "h-9")}>
          <Pencil size={14} /> Edit item
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

function Breadcrumb() {
  return (
    <>
      <span className="text-bz-text-muted">Inventory</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="text-bz-text-muted">Items</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">{ITEM.id}</span>
    </>
  );
}

export function ItemDetailDesignPage() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const hasId = !!params.id;

  // one fetch on entry hydrates everything; no id → nothing loads
  const [phase, setPhase] = React.useState<"loading" | "ready" | "idle">(hasId ? "loading" : "idle");
  const [deleting, setDeleting] = React.useState(false);
  const [active, setActive] = React.useState<string>("general");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toast, setToast] = React.useState<ToastMsg>(null);
  const deleteTimers = React.useRef<number[]>([]);
  React.useEffect(() => () => deleteTimers.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    if (!hasId) {
      setPhase("idle");
      return;
    }
    setPhase("loading");
    const t = setTimeout(() => setPhase("ready"), 900);
    return () => clearTimeout(t);
  }, [hasId]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // both the initial load and the delete feed the one whole-page busy overlay
  const busy = phase === "loading" || deleting;

  const goEdit = () => navigate(`/design/item/${ITEM.id}/edit`);

  function confirmDelete() {
    setConfirmOpen(false);
    setDeleting(true);
    const t1 = window.setTimeout(() => {
      setDeleting(false);
      // simulated API result — success path. (A false result raises a warning toast.)
      const ok = true;
      if (ok) {
        setToast({ msg: `Item ${ITEM.id} deleted.`, tone: "success" });
        const t2 = window.setTimeout(() => navigate(-1), 1100); // report outcome, then return to the list
        deleteTimers.current.push(t2);
      } else {
        setToast({ msg: `Couldn't delete ${ITEM.id}. Please try again.`, tone: "warning" });
      }
    }, 1100);
    deleteTimers.current.push(t1);
  }

  const activeDef = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];

  const overlay = (
    <>
      {busy && <BusyOverlay label={deleting ? "Deleting item…" : "Loading item…"} />}
      {phase === "ready" && <DockedFooter onEdit={goEdit} onBack={() => navigate(-1)} />}
      <ConfirmDelete open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );

  return (
    <AppShell breadcrumb={<Breadcrumb />} overlay={overlay}>
      {phase === "idle" ? (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <EmptyBlock icon={PackageOpen} title="No item selected" body="Open an item from the list to view its full record." />
        </div>
      ) : phase === "loading" ? (
        // overlay carries the visuals; reserve height so the shell doesn't collapse
        <div className="min-h-[60vh]" />
      ) : (
        <>
          <DocumentHeader onEdit={goEdit} onDelete={() => setConfirmOpen(true)} />

          <div className="px-4 pb-10 pt-5 md:px-6">
            {/* mobile: record summary + section strip */}
            <div className="mb-4 lg:hidden">
              <RecordCard />
              <div className="mt-3">
                <NavStrip active={active} onSelect={setActive} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[296px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
              {/* navigator (desktop) */}
              <div className="hidden lg:block lg:sticky lg:top-4 lg:self-start">
                <div className="flex flex-col gap-3">
                  <RecordCard />
                  <NavRail active={active} onSelect={setActive} />
                </div>
              </div>

              {/* active section panel */}
              <div className="min-w-0">
                <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
                  <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3 md:px-5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper">
                        <activeDef.icon size={14} />
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-[13.5px] font-semibold tracking-tight text-bz-text">{activeDef.label}</h2>
                        <p className="truncate text-[11px] text-bz-text-muted">{activeDef.sub}</p>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[10.5px] font-medium text-bz-text-muted">
                      <Lock size={11} /> Read-only
                    </span>
                  </div>

                  {/* every section stays mounted; only the active one is visible, so the
                      related-records / files / image widgets keep their loaded state */}
                  <div className="p-4 md:p-5">
                    {SECTIONS.map((s) => (
                      <div key={s.key} className={cn(active !== s.key && "hidden")}>
                        {s.key === "related" ? (
                          <RelatedRecords active={active === "related"} onOpen={(r) => r.href && navigate(r.href)} />
                        ) : s.key === "files" ? (
                          <AttachedFiles onToast={setToast} />
                        ) : (
                          <FieldSection {...FIELD_DOMAINS[s.key]} />
                        )}
                      </div>
                    ))}
                  </div>

                  <PanelNav active={active} onSelect={setActive} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
