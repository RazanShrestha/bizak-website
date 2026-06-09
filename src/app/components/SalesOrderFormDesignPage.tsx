import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ArrowLeft,
  ArrowUpRight,
  Search,
  X,
  Check,
  Plus,
  Trash2,
  Loader2,
  CalendarDays,
  Info,
  AlertTriangle,
  MoreHorizontal,
  RotateCcw,
  Building2,
  MapPin,
  UserRound,
  UserPlus,
  Wallet,
  Package,
  Boxes,
  ClipboardList,
  StickyNote,
  Paperclip,
  Upload,
  Download,
  Eye,
  Link2,
  Tag,
  Hash,
  PhoneOutgoing,
  PhoneIncoming,
  Sparkles,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  CornerDownLeft,
  ScanLine,
  ListChecks,
  PlusCircle,
} from "lucide-react";
import { AppShell, ORDERS } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// SALES ORDER · CREATE  (assemble a valid order → commit)
//
// Primary action = compose a sales order and persist it. So the page is a
// DOCUMENT-COMPOSITION workspace, not a list/master-detail:
//   • A quiet document header  identity + org scope + Save / overflow.
//   • A wide composition column customer cascade card, then a tab strip
//     (Items · Activity · Billing · Files) that keeps every surface mounted.
//   • A sticky review rail      live totals + a validation checklist that
//     gates the save, recomputed from state.
//   • A docked action bar       the always-visible commit (second access
//     point; shares the posting state with the header Save).
//
// Whole-page reactivity wired for real: master-customer cascade, org re-scope,
// live totals, term→due derivation, per-row mutual exclusions, lazy/paginated
// pickers, validation gating, and the async submit lifecycle (success →
// navigate, business-rule rejection → stay).
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// FORMAT  the configurable rounding/format transform from the brief:
//   round to DECIMALS · strip trailing zeros · NO thousands separators · no
//   currency symbol. Ordinary numeric inputs round to DECIMALS on blur; the
//   exchange-rate input opts out and preserves full precision.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const DECIMALS = 2; // configurable money precision

function roundDp(n: number, dp = DECIMALS): number {
  const f = Math.pow(10, dp);
  return Math.round((n + Number.EPSILON) * f) / f;
}

/** value → display string: rounded, trailing zeros stripped, no separators/symbol. */
function fmtAmount(n: number | undefined | null, dp = DECIMALS): string {
  if (n == null || !isFinite(n)) return "0";
  let s = roundDp(n, dp).toFixed(dp);
  if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s;
}

// ── dates ──
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function parseISO(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}
function fmtDate(iso: string | null): string {
  const d = iso ? parseISO(iso) : null;
  return d ? `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : "";
}
function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso);
  if (!d) return iso;
  d.setDate(d.getDate() + days);
  return toISO(d);
}
const TODAY_ISO = toISO(new Date());

// stable ids for new client-side records
let _uid = 0;
const uid = (p: string) => `${p}-${(++_uid).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA  (scoped by subsidiary where the brief calls for it; seeded so
// it reconciles with the house Sales-Order data in the list/detail pages)
// ════════════════════════════════════════════════════════════════════════════

type Sub = { id: string; name: string; currency: string };
const SUBSIDIARIES: Sub[] = [
  { id: "NP-01", name: "Bizak Nepal", currency: "NPR" },
  { id: "NP-02", name: "Bizak Nepal Pokhara", currency: "NPR" },
];
const BASE_CURRENCY = "NPR";
const MULTI_ORG = true; // multi-organisation mode ON → org picker is present

type Currency = { id: string; name: string };
const CURRENCIES: Currency[] = [
  { id: "NPR", name: "Nepalese Rupee" },
  { id: "USD", name: "US Dollar" },
  { id: "INR", name: "Indian Rupee" },
  { id: "EUR", name: "Euro" },
  { id: "CNY", name: "Chinese Yuan" },
];

type Location = { id: string; name: string; sub: string };
const LOCATIONS: Location[] = [
  { id: "LOC-KTM", name: "Kathmandu Warehouse", sub: "NP-01" },
  { id: "LOC-LAL", name: "Lalitpur Store", sub: "NP-01" },
  { id: "LOC-BIR", name: "Biratnagar Depot", sub: "NP-01" },
  { id: "LOC-BRG", name: "Birgunj Hub", sub: "NP-01" },
  { id: "LOC-BTW", name: "Butwal Branch", sub: "NP-01" },
  { id: "LOC-PKR", name: "Pokhara Warehouse 02", sub: "NP-02" },
  { id: "LOC-PKC", name: "Pokhara Central Store", sub: "NP-02" },
];

type Rep = { id: string; name: string; sub: string };
const SALES_REPS: Rep[] = [
  { id: "SR-01", name: "Rajesh Shrestha", sub: "NP-01" },
  { id: "SR-02", name: "Sita Gurung", sub: "NP-01" },
  { id: "SR-03", name: "Bishnu Thapa", sub: "NP-01" },
  { id: "SR-04", name: "Kamala Adhikari", sub: "NP-01" },
  { id: "SR-05", name: "Hari Bhandari", sub: "NP-01" },
  { id: "SR-06", name: "Priya Maharjan", sub: "NP-02" },
  { id: "SR-07", name: "Anjali Karki", sub: "NP-02" },
  { id: "SR-08", name: "Deepak Pun", sub: "NP-02" },
  { id: "SR-09", name: "Manju Rana", sub: "NP-02" },
];

type Term = { id: string; name: string; days: number };
const TERMS: Term[] = [
  { id: "T-COD", name: "Due on Receipt", days: 0 },
  { id: "T-ADV", name: "Advance Payment", days: 0 },
  { id: "T-N15", name: "Net 15", days: 15 },
  { id: "T-N30", name: "Net 30", days: 30 },
  { id: "T-N45", name: "Net 45", days: 45 },
  { id: "T-N60", name: "Net 60", days: 60 },
];

type TaxCode = { id: string; name: string; rate: number };
const TAX_CODES: TaxCode[] = [
  { id: "VAT", name: "VAT 13%", rate: 13 },
  { id: "EXM", name: "Exempt", rate: 0 },
  { id: "VAT-EXP", name: "Export 0%", rate: 0 },
  { id: "VAT-7", name: "VAT 7.5%", rate: 7.5 },
];

type Charge = { id: string; name: string; rate: number };
const CHARGES: Charge[] = [
  { id: "NONE", name: "No charge", rate: 0 },
  { id: "FRT", name: "Freight", rate: 2 },
  { id: "HND", name: "Handling", rate: 1.5 },
  { id: "INS", name: "Installation", rate: 5 },
];

type PriceLevel = { id: string; name: string; factor: number };
const PRICE_LEVELS: PriceLevel[] = [
  { id: "PL-STD", name: "Standard", factor: 1 },
  { id: "PL-WHL", name: "Wholesale", factor: 0.92 },
  { id: "PL-RET", name: "Retail", factor: 1.08 },
  { id: "PL-DIST", name: "Distributor", factor: 0.88 },
];

const UNITS = ["kg", "bag", "pcs", "roll", "sheet", "unit", "box", "hrs", "pkg", "ltr", "mtr", "set"];

type Product = { id: string; name: string; unit: string; rate: number; tax: string; desc?: string };
const PRODUCTS: Product[] = [
  { id: "TMT-12", name: "TMT Steel Rod 12mm", unit: "kg", rate: 145, tax: "VAT", desc: "Fe-500 grade, ribbed reinforcement bar" },
  { id: "CEM-OPC", name: "Portland Cement OPC", unit: "bag", rate: 980, tax: "VAT", desc: "53-grade ordinary Portland cement, 50kg bag" },
  { id: "PVC-4", name: "PVC Pipe 4in", unit: "pcs", rate: 1250, tax: "VAT" },
  { id: "LED-40", name: "LED Panel 40W", unit: "pcs", rate: 1450, tax: "VAT" },
  { id: "SH-01", name: "Safety Helmet", unit: "pcs", rate: 850, tax: "VAT" },
  { id: "CW-25", name: "Copper Wire 2.5sqmm", unit: "roll", rate: 8600, tax: "VAT", desc: "90m roll, FR insulation" },
  { id: "GLS-5", name: "Glass Sheet 5mm", unit: "sheet", rate: 2200, tax: "VAT" },
  { id: "DG-25", name: "Diesel Generator 25kVA", unit: "unit", rate: 685000, tax: "VAT", desc: "Silent canopy, 3-phase" },
  { id: "FRT-UREA", name: "Fertilizer Urea 50kg", unit: "bag", rate: 1850, tax: "EXM" },
  { id: "MED-PAR", name: "Paracetamol 500mg", unit: "box", rate: 320, tax: "EXM" },
  { id: "CFR-10", name: "Cotton Fabric Roll", unit: "roll", rate: 4200, tax: "VAT" },
  { id: "MPS-006", name: "Mounting Plate Set", unit: "pkg", rate: 11200, tax: "VAT" },
  { id: "HP7", name: "Hydraulic Pump HP-7", unit: "pcs", rate: 142000, tax: "VAT", desc: "7-series, 220-bar rating" },
  { id: "ICP-A220", name: "Industrial Coupling A-220", unit: "pcs", rate: 18500, tax: "VAT", desc: "Standard-duty coupling, zinc-plated" },
  { id: "SVC-INS", name: "Service & Installation", unit: "hrs", rate: 2500, tax: "EXM" },
  { id: "PNT-EM", name: "Emulsion Paint 20L", unit: "unit", rate: 5400, tax: "VAT" },
  { id: "TILE-60", name: "Ceramic Tile 60x60", unit: "box", rate: 1680, tax: "VAT" },
  { id: "RBR-GSK", name: "Rubber Gasket Set", unit: "set", rate: 740, tax: "VAT" },
];

// ── customers (cover every order party so edit-mode pre-fill resolves; a few
// foreign-currency, one credit-hold, one tax-exempt to exercise the branches) ──
type Customer = {
  id: string;
  name: string;
  type: string;
  sub: string;
  currency: string;
  pan: string;
  vat?: string;
  address: string;
  repId: string;
  termId: string;
  creditHold?: boolean;
  taxOverride?: string; // forces a tax code onto every line
};

const SEED_CUSTOMERS: Customer[] = [
  { id: "C-1003", name: "Himalayan Traders", type: "Wholesale", sub: "NP-01", currency: "NPR", pan: "301245678", address: "New Road, Kathmandu 44600, Nepal", repId: "SR-01", termId: "T-N30" },
  { id: "C-1044", name: "Everest Hardware Supplies", type: "Retail", sub: "NP-01", currency: "NPR", pan: "302887541", address: "Pulchowk, Lalitpur 44700, Nepal", repId: "SR-02", termId: "T-N15" },
  { id: "C-1011", name: "Annapurna Distributors", type: "Distribution", sub: "NP-01", currency: "NPR", pan: "304112900", address: "Main Road, Biratnagar 56613, Nepal", repId: "SR-03", termId: "T-N45" },
  { id: "C-1029", name: "Apex Manufacturing Pvt Ltd", type: "Industrial", sub: "NP-02", currency: "NPR", pan: "600455782", address: "Industrial Area Sector 7, Pokhara 33700, Nepal", repId: "SR-06", termId: "T-N30" },
  { id: "C-1061", name: "Gandaki Auto Parts", type: "Automotive", sub: "NP-02", currency: "NPR", pan: "601224537", address: "Prithvi Chowk, Pokhara 33700, Nepal", repId: "SR-07", termId: "T-N30" },
  { id: "C-1018", name: "Lumbini Agro Pvt Ltd", type: "Agriculture", sub: "NP-01", currency: "NPR", pan: "305991233", address: "Bypass Road, Butwal 32907, Nepal", repId: "SR-05", termId: "T-N30", taxOverride: "EXM" },
  { id: "C-1090", name: "Karnali Pharma", type: "Pharma", sub: "NP-01", currency: "NPR", pan: "307445120", address: "Bishal Bazar, Kathmandu 44600, Nepal", repId: "SR-04", termId: "T-N30" },
  { id: "C-1052", name: "Sagarmatha Steel Udyog", type: "Manufacturing", sub: "NP-01", currency: "NPR", pan: "306778231", address: "Adarsha Nagar, Birgunj 44300, Nepal", repId: "SR-01", termId: "T-N45", creditHold: true },
  { id: "C-1007", name: "Pashupati Enterprises", type: "Trading", sub: "NP-01", currency: "NPR", pan: "300114589", address: "Teku, Kathmandu 44600, Nepal", repId: "SR-02", termId: "T-N15" },
  { id: "C-1202", name: "Gulf Steel Trading LLC", type: "Industrial", sub: "NP-01", currency: "USD", pan: "AE-228451", address: "Jebel Ali Free Zone, Dubai, UAE", repId: "SR-03", termId: "T-N60" },
  { id: "C-1203", name: "Patna Distributors Pvt", type: "Wholesale", sub: "NP-01", currency: "INR", pan: "IN-AAFCP9", address: "Gandhi Maidan, Patna 800001, India", repId: "SR-04", termId: "T-N30" },
  { id: "C-1201", name: "Lhasa Imports Co.", type: "Distribution", sub: "NP-02", currency: "CNY", pan: "CN-553120", address: "Barkhor Street, Lhasa, China", repId: "SR-08", termId: "T-N45" },
  { id: "C-1130", name: "Bagmati Builders", type: "Construction", sub: "NP-01", currency: "NPR", pan: "308220471", address: "Koteshwor, Kathmandu 44600, Nepal", repId: "SR-05", termId: "T-N30" },
  { id: "C-1140", name: "Pokhara Electronics", type: "Retail", sub: "NP-02", currency: "NPR", pan: "602998130", address: "Mahendrapul, Pokhara 33700, Nepal", repId: "SR-09", termId: "T-N15" },
];

// default base exchange rates → blank for the user to confirm; shown as a hint
const FX_HINT: Record<string, string> = { USD: "133.48", INR: "1.6", EUR: "144.20", CNY: "18.62" };

// ── custom fields the Sales Order record type defines (component 12). Renderer
// maps each declared type → an input kind, honouring required + default. ──
type CFType =
  | "number" | "text" | "longtext" | "date" | "datetime" | "time"
  | "percent" | "select" | "multiselect" | "boolean";
type CustomFieldDef = {
  key: string;
  label: string;
  type: CFType;
  required?: boolean;
  disabled?: boolean;
  def?: string | boolean | string[];
  options?: string[];
  hint?: string;
};
const SO_CUSTOM_FIELDS: CustomFieldDef[] = [
  { key: "po_number", label: "Customer PO Number", type: "text", required: true, hint: "Buyer's purchase-order reference" },
  { key: "loyalty_tier", label: "Loyalty Tier", type: "select", options: ["Bronze", "Silver", "Gold", "Platinum"], def: "Silver" },
  { key: "margin_target", label: "Margin Target", type: "percent", def: "18" },
  { key: "campaign", label: "Campaign Tags", type: "multiselect", options: ["Dashain", "Tihar", "New Year", "Clearance"] },
  { key: "site_visit", label: "Site Visit Date", type: "date" },
  { key: "callback_at", label: "Callback At", type: "datetime" },
  { key: "dispatch_time", label: "Preferred Dispatch Time", type: "time" },
  { key: "priority_score", label: "Priority Score", type: "number" },
  { key: "gift_wrap", label: "Gift Wrap", type: "boolean", def: false },
  { key: "channel_locked", label: "Channel Locked (system)", type: "boolean", def: true, disabled: true, hint: "Set by the channel sync — read-only here" },
  { key: "special_instructions", label: "Special Instructions", type: "longtext" },
];

function defaultCFValue(f: CustomFieldDef): string | boolean | string[] {
  if (f.type === "boolean") return typeof f.def === "boolean" ? f.def : false;
  if (f.type === "multiselect") return Array.isArray(f.def) ? f.def : [];
  return typeof f.def === "string" ? f.def : "";
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

// ════════════════════════════════════════════════════════════════════════════
// PRIMITIVE ATOMS  required marker · field shell · text / number inputs ·
// segmented · switch · checkbox
// ════════════════════════════════════════════════════════════════════════════

const INPUT_BASE =
  "h-9 w-full rounded-bz-md border bg-bz-surface px-3 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft transition-colors";
const INPUT_OK = "border-bz-line-soft focus:border-bz-text";
const INPUT_ERR = "border-[#C0413A] focus:border-[#9A2E29]";

function Req() {
  return <span className="ml-0.5 text-bz-fire" title="Required">*</span>;
}

function Field({
  label, required, hint, error, htmlFor, className, children,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <label htmlFor={htmlFor} className="text-[11px] font-medium text-bz-text-muted">
            {label}
            {required && <Req />}
          </label>
          {error ? (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#9A2E29]">
              <AlertTriangle size={10} /> {error}
            </span>
          ) : hint ? (
            <span className="text-[10px] text-bz-text-soft">{hint}</span>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, error, disabled, readOnly, id, type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={cn(INPUT_BASE, error ? INPUT_ERR : INPUT_OK, (disabled || readOnly) && "bg-bz-paper-warm text-bz-text-muted")}
    />
  );
}

function Textarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2 text-[13px] leading-relaxed text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
    />
  );
}

/**
 * Numeric input. On blur, ordinary inputs round to DECIMALS; setting
 * `preservePrecision` opts OUT of rounding (used for the exchange rate).
 */
function NumberInput({
  value, onChange, placeholder, error, disabled, preservePrecision, min = 0, align = "left", suffix, prefix, id,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  preservePrecision?: boolean;
  min?: number;
  align?: "left" | "right";
  suffix?: string;
  prefix?: string;
  id?: string;
}) {
  const [raw, setRaw] = React.useState(value == null ? "" : String(value));
  React.useEffect(() => {
    // sync from outside (cascades, recompute) — but keep the user's in-progress
    // text (e.g. a trailing "." while typing a decimal) when it already equals
    // the external value numerically.
    setRaw((prev) => {
      const prevNum = prev === "" || prev === "-" || prev === "." ? undefined : Number(prev);
      if (prevNum === value || (prevNum == null && value == null)) return prev;
      return value == null ? "" : String(value);
    });
  }, [value]);
  return (
    <div
      className={cn(
        "flex h-9 items-center rounded-bz-md border bg-bz-surface px-2.5 transition-colors focus-within:border-bz-text",
        error ? INPUT_ERR : "border-bz-line-soft",
        disabled && "bg-bz-paper-warm",
      )}
    >
      {prefix && <span className="mr-1 text-[11px] text-bz-text-soft">{prefix}</span>}
      <input
        id={id}
        inputMode="decimal"
        value={raw}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || /^-?\d*\.?\d*$/.test(v)) {
            setRaw(v);
            onChange(v === "" || v === "-" || v === "." ? undefined : Number(v));
          }
        }}
        onBlur={() => {
          if (raw === "" || raw === "-" || raw === ".") {
            onChange(undefined);
            setRaw("");
            return;
          }
          let n = Number(raw);
          if (min != null && n < min) n = min;
          if (!preservePrecision) n = roundDp(n);
          onChange(n);
          setRaw(String(n));
        }}
        className={cn(
          "h-full w-full bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft",
          NUM,
          align === "right" && "text-right",
          disabled && "text-bz-text-muted",
        )}
      />
      {suffix && <span className="ml-1 text-[11px] text-bz-text-soft">{suffix}</span>}
    </div>
  );
}

function Segmented<T extends string>({
  options, value, onChange, size = "md",
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="grid grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-bz-sm font-medium transition-colors",
              size === "sm" ? "h-6 px-2 text-[11px]" : "h-7 px-2.5 text-[12px]",
              active ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Switch({ value, onChange, disabled, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
        disabled && "opacity-50",
      )}
    >
      <span className={cn("pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform", value ? "translate-x-[14px]" : "translate-x-[2px]")} />
    </button>
  );
}

function Checkbox({ value, onChange, label, disabled }: { value: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn("inline-flex items-center gap-2 text-left", disabled && "opacity-50")}
    >
      <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-bz-sm border transition-colors", value ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface text-transparent")}>
        <Check size={12} strokeWidth={3} />
      </span>
      {label && <span className="text-[12.5px] text-bz-text">{label}</span>}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PORTAL POSITIONING  shared anchored-dropdown hook
// ════════════════════════════════════════════════════════════════════════════

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
// ENTITY PICKER  the workhorse: searchable · debounced · paginated (lazy
// scroll) · keyboard-highlightable · add-new / advanced-search / view-detail ·
// auto-select-first-when-required. Used for every reference on the page.
// ════════════════════════════════════════════════════════════════════════════

type Opt = { id: string; label: string; sub?: string; meta?: string; disabled?: boolean };
const PICKER_PAGE = 6;

function EntityField({
  value, onChange, options,
  placeholder = "Select…",
  required, disabled, readOnly, error, autoFirst,
  bare, size = "md", icon: Icon,
  addNewLabel, onAddNew, onAdvanced, onView,
  title,
}: {
  value: Opt | null;
  onChange: (o: Opt | null) => void;
  options: Opt[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  autoFirst?: boolean;
  bare?: boolean;
  size?: "sm" | "md";
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  addNewLabel?: string;
  onAddNew?: () => void;
  onAdvanced?: () => void;
  onView?: () => void;
  title?: string;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  // auto-select first available option when required & still unset
  React.useEffect(() => {
    if (autoFirst && required && !value && !disabled && !readOnly && options.length) {
      onChange(options[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFirst, required, value, disabled, readOnly, options.length]);

  const locked = disabled || readOnly;
  const h = size === "sm" ? "h-8" : "h-9";
  const text = size === "sm" ? "text-[12px]" : "text-[13px]";

  return (
    <div className={bare ? "" : "min-w-0"}>
      <button
        ref={btnRef}
        type="button"
        disabled={locked}
        onClick={() => setOpen((v) => !v)}
        title={title}
        className={cn(
          "flex w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          h,
          locked ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "bg-bz-surface hover:border-bz-line",
          error ? "border-[#C0413A]" : open || locked ? "" : "border-bz-line-soft",
        )}
      >
        {Icon && <Icon size={size === "sm" ? 12 : 13} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("min-w-0 flex-1 truncate", text, value ? "text-bz-text" : "text-bz-text-soft")}>
          {value ? value.label : placeholder}
        </span>
        {value && value.meta && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{value.meta}</span>}
        {value && !required && !locked ? (
          <span
            role="button"
            aria-label="Clear"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
          >
            <X size={11} />
          </span>
        ) : (
          !locked && <ChevronDown size={size === "sm" ? 12 : 13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
        )}
      </button>

      {value && onView && !bare && (
        <button onClick={onView} className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-medium text-bz-text-muted hover:text-bz-text">
          <ArrowUpRight size={10} /> Open {value.label}
        </button>
      )}

      <EntityDropdown
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
        options={options}
        value={value}
        onChange={onChange}
        addNewLabel={addNewLabel}
        onAddNew={onAddNew}
        onAdvanced={onAdvanced}
        placeholder={title}
      />
    </div>
  );
}

function EntityDropdown({
  anchorRef, open, onClose, options, value, onChange, addNewLabel, onAddNew, onAdvanced, placeholder,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  options: Opt[];
  value: Opt | null;
  onChange: (o: Opt | null) => void;
  addNewLabel?: string;
  onAddNew?: () => void;
  onAdvanced?: () => void;
  placeholder?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pos = useAnchoredPos(open, anchorRef);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false); // first-fetch on type
  const [more, setMore] = React.useState(false); // next-page fetch
  const [hi, setHi] = React.useState(0);

  // focus restores the full list; reset paging on (re)open
  React.useEffect(() => {
    if (open) { setRaw(""); setQuery(""); setPages(1); setHi(0); const t = window.setTimeout(() => inputRef.current?.focus(), 10); return () => window.clearTimeout(t); }
  }, [open]);

  // debounced search → simulated fetch, resets pagination
  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = window.setTimeout(() => {
      setQuery(raw.trim().toLowerCase());
      setPages(1);
      setHi(0);
      setLoading(false);
    }, 220);
    return () => window.clearTimeout(t);
  }, [raw, open]);

  // close on outside-click / esc / scroll
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    const onScroll = (e: Event) => { if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return; onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query) || (o.sub ?? "").toLowerCase().includes(query)) : options;
  const visible = filtered.slice(0, pages * PICKER_PAGE);
  const hasMore = visible.length < filtered.length;

  const onScrollList = () => {
    const el = listRef.current;
    if (!el || more || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setMore(true);
      window.setTimeout(() => { setPages((p) => p + 1); setMore(false); }, 380);
    }
  };

  const pick = (o: Opt) => { if (o.disabled) return; onChange(o); onClose(); };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, visible.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const o = visible[hi]; if (o) pick(o); }
  };

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 248) }}
      className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
      onKeyDown={onListKey}
    >
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input
            ref={inputRef}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={placeholder ? `Search ${placeholder.toLowerCase()}…` : "Search…"}
            className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {raw && (
            <button onClick={() => setRaw("")} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface" aria-label="Clear search">
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      <div ref={listRef} onScroll={onScrollList} className="max-h-[252px] overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-bz-text-muted">
            <Loader2 size={13} className="animate-spin text-bz-fire" /> <span className="text-[11.5px]">Searching…</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-7 text-center">
            <Search size={15} className="text-bz-text-soft" />
            <p className="text-[11.5px] font-medium text-bz-text-muted">{raw ? `No matches for “${raw}”` : "No options available"}</p>
          </div>
        ) : (
          visible.map((o, i) => {
            const selected = value?.id === o.id;
            const active = i === hi;
            return (
              <button
                key={o.id}
                onMouseEnter={() => setHi(i)}
                onClick={() => pick(o)}
                disabled={o.disabled}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                  o.disabled ? "cursor-not-allowed opacity-45" : active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm",
                  selected && "bg-bz-fire/[0.06]",
                )}
              >
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
        {more && (
          <div className="flex items-center justify-center gap-2 py-2.5 text-bz-text-muted">
            <Loader2 size={12} className="animate-spin text-bz-fire" /> <span className="text-[11px]">Loading more…</span>
          </div>
        )}
        {!more && !hasMore && visible.length > 0 && filtered.length > PICKER_PAGE && (
          <p className={cn("px-3 py-2 text-center text-[10px] text-bz-text-soft", NUM)}>{filtered.length} results · end of list</p>
        )}
      </div>

      {(onAddNew || onAdvanced) && (
        <div className="flex items-center gap-1 border-t border-bz-line-soft bg-bz-paper-warm/40 p-1.5">
          {onAddNew && (
            <button onClick={() => { onClose(); onAddNew(); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-bz-sm px-2 py-1.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-surface">
              <Plus size={12} className="text-bz-leaf-deep" /> {addNewLabel ?? "Add new"}
            </button>
          )}
          {onAdvanced && (
            <button onClick={() => { onClose(); onAdvanced(); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-bz-sm px-2 py-1.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-surface hover:text-bz-text">
              <ListChecks size={12} /> Advanced search
            </button>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DATE FIELD  typed field + togglable calendar popup. Optionally shows a
// "derived" hint and stays manually overridable (the due date).
// ════════════════════════════════════════════════════════════════════════════

function DateField({
  value, onChange, required, error, disabled, derivedHint, icon = true,
}: {
  value: string | null;
  onChange: (iso: string) => void;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  derivedHint?: string;
  icon?: boolean;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchoredPos(open, btnRef);
  const ref = React.useRef<HTMLDivElement>(null);
  useEscClose(open, () => setOpen(false));
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          disabled ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
          error && "border-[#C0413A]",
        )}
      >
        {icon && <CalendarDays size={13} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("flex-1 truncate text-[13px]", NUM, value ? "text-bz-text" : "text-bz-text-soft")}>
          {value ? fmtDate(value) : "Pick a date"}
        </span>
        {derivedHint && !disabled && <span className="shrink-0 rounded-bz-sm bg-bz-leaf/40 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text">{derivedHint}</span>}
      </button>
      {open && pos && createPortal(
        <div ref={ref} style={{ position: "fixed", top: pos.top, left: pos.left }} className="z-50 w-[268px] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface p-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          <div className="mb-2">
            <input
              defaultValue={value ?? ""}
              placeholder="YYYY-MM-DD"
              onBlur={(e) => { const d = parseISO(e.target.value.trim()); if (d) onChange(toISO(d)); }}
              onKeyDown={(e) => { if (e.key === "Enter") { const d = parseISO((e.target as HTMLInputElement).value.trim()); if (d) { onChange(toISO(d)); setOpen(false); } } }}
              className={cn("h-8 w-full rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5 text-[12.5px] text-bz-text outline-none focus:border-bz-text", NUM)}
            />
          </div>
          <Calendar valueISO={value} onPick={(iso) => { onChange(iso); setOpen(false); }} />
        </div>,
        document.body,
      )}
    </div>
  );
}

function Calendar({ valueISO, onPick }: { valueISO: string | null; onPick: (iso: string) => void }) {
  const sel = valueISO ? parseISO(valueISO) : null;
  const init = sel ?? new Date();
  const [view, setView] = React.useState({ y: init.getFullYear(), m: init.getMonth() });
  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const shift = (n: number) => setView((v) => { const d = new Date(v.y, v.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm" aria-label="Previous month"><ChevronLeft size={14} /></button>
        <span className="text-[12.5px] font-semibold text-bz-text">{MONTHS[view.m]} {view.y}</span>
        <button onClick={() => shift(1)} className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm" aria-label="Next month"><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {DOW.map((d) => <span key={d} className="flex h-6 items-center justify-center text-[9.5px] font-semibold uppercase text-bz-text-soft">{d}</span>)}
        {cells.map((d, i) => {
          if (d == null) return <span key={i} />;
          const iso = `${view.y}-${pad(view.m + 1)}-${pad(d)}`;
          const isSel = sel && sel.getFullYear() === view.y && sel.getMonth() === view.m && sel.getDate() === d;
          const isToday = iso === TODAY_ISO;
          return (
            <button
              key={i}
              onClick={() => onPick(iso)}
              className={cn(
                "flex h-7 items-center justify-center rounded-bz-sm text-[12px] transition-colors",
                NUM,
                isSel ? "bg-bz-fire font-semibold text-bz-olive" : isToday ? "bg-bz-paper-warm font-semibold text-bz-text" : "text-bz-text hover:bg-bz-paper-warm",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODAL SHELL  + the add-new / advanced-search / customer-create / inventory
// popups the pickers spawn (component 19/20) and the line-row lot capture.
// ════════════════════════════════════════════════════════════════════════════

function Modal({ open, onClose, title, subtitle, icon: Icon, width = 460, children, footer }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEscClose(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-bz-olive-dark/40 p-4 py-[7vh]" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: width }}
        className="overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_70px_-20px_rgba(15,20,17,0.32)]"
      >
        <div className="flex items-start gap-3 border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3.5">
          {Icon && <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper"><Icon size={16} /></span>}
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-semibold tracking-tight text-bz-text">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-bz-text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={15} /></button>
        </div>
        <div className="max-h-[58vh] overflow-y-auto p-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

const GHOST_BTN = "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm";
const SOLID_BTN = "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50";

function CustomerCreateModal({ open, onClose, onCreate, defaultSub }: {
  open: boolean;
  onClose: () => void;
  onCreate: (c: Customer) => void;
  defaultSub: string;
}) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("Wholesale");
  const [currency, setCurrency] = React.useState<Opt | null>({ id: "NPR", label: "Nepalese Rupee", meta: "NPR" });
  const [pan, setPan] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [term, setTerm] = React.useState<Opt | null>({ id: "T-N30", label: "Net 30" });
  React.useEffect(() => { if (open) { setName(""); setType("Wholesale"); setCurrency({ id: "NPR", label: "Nepalese Rupee", meta: "NPR" }); setPan(""); setAddress(""); setTerm({ id: "T-N30", label: "Net 30" }); } }, [open]);
  const valid = name.trim().length > 0;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New customer"
      subtitle="Create a customer, then drop it straight onto this order."
      icon={UserPlus}
      width={520}
      footer={
        <>
          <button onClick={onClose} className={GHOST_BTN}>Cancel</button>
          <button
            disabled={!valid}
            onClick={() => onCreate({
              id: `C-${1300 + Math.floor(Math.random() * 600)}`,
              name: name.trim(), type, sub: defaultSub, currency: currency?.id ?? "NPR",
              pan: pan.trim() || "—", address: address.trim() || "—",
              repId: SALES_REPS.find((r) => r.sub === defaultSub)?.id ?? SALES_REPS[0].id,
              termId: term?.id ?? "T-N30",
            })}
            className={SOLID_BTN}
          >
            <Check size={14} /> Create &amp; select
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Customer name" required className="sm:col-span-2"><TextInput value={name} onChange={setName} placeholder="e.g. Nepal Trade House" error={!valid && name.length > 0} /></Field>
        <Field label="Type"><Segmented value={type} onChange={setType} options={[{ id: "Wholesale", label: "Wholesale" }, { id: "Retail", label: "Retail" }, { id: "Distribution", label: "Distribution" }]} /></Field>
        <Field label="Currency"><EntityField value={currency} onChange={setCurrency} options={CURRENCIES.map((c) => ({ id: c.id, label: c.name, meta: c.id }))} title="currency" icon={Wallet} /></Field>
        <Field label="PAN / Tax ID"><TextInput value={pan} onChange={setPan} placeholder="300 000 000" /></Field>
        <Field label="Default payment term"><EntityField value={term} onChange={setTerm} options={TERMS.map((t) => ({ id: t.id, label: t.name, sub: t.days ? `${t.days} days` : "Immediate" }))} title="term" icon={Wallet} /></Field>
        <Field label="Billing address" className="sm:col-span-2"><Textarea value={address} onChange={setAddress} rows={2} placeholder="Street, city, country" /></Field>
      </div>
    </Modal>
  );
}

/** Lightweight create flow the non-customer pickers spawn. */
function GenericCreateModal({ open, onClose, onCreate, label }: {
  open: boolean;
  onClose: () => void;
  onCreate: (o: Opt) => void;
  label: string;
}) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  React.useEffect(() => { if (open) { setName(""); setCode(""); } }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`New ${label.toLowerCase()}`}
      subtitle={`Create a ${label.toLowerCase()} record and select it on this order.`}
      icon={PlusCircle}
      footer={
        <>
          <button onClick={onClose} className={GHOST_BTN}>Cancel</button>
          <button disabled={!name.trim()} onClick={() => onCreate({ id: uid("new"), label: name.trim(), sub: code.trim() || undefined })} className={SOLID_BTN}>
            <Check size={14} /> Create &amp; select
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <Field label={`${label} name`} required><TextInput value={name} onChange={setName} placeholder={`Name this ${label.toLowerCase()}`} /></Field>
        <Field label="Code / reference" hint="optional"><TextInput value={code} onChange={setCode} placeholder="e.g. SKU-0001" /></Field>
      </div>
    </Modal>
  );
}

/** Advanced search-and-pick over a field's option pool (component 19, search mode). */
function AdvancedSearchModal({ open, onClose, options, onPick, label }: {
  open: boolean;
  onClose: () => void;
  options: Opt[];
  onPick: (o: Opt) => void;
  label: string;
}) {
  const [q, setQ] = React.useState("");
  React.useEffect(() => { if (open) setQ(""); }, [open]);
  const query = q.trim().toLowerCase();
  const rows = query ? options.filter((o) => o.label.toLowerCase().includes(query) || (o.sub ?? "").toLowerCase().includes(query) || (o.meta ?? "").toLowerCase().includes(query)) : options;
  return (
    <Modal open={open} onClose={onClose} title={`Find ${label.toLowerCase()}`} subtitle="Search the full catalogue, then pick a record to insert." icon={Search} width={560}>
      <div className="mb-3 flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
        <Search size={14} className="text-bz-text-muted" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${label.toLowerCase()} by name, code or attribute…`} className="flex-1 bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-muted" />
        <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{rows.length}</span>
      </div>
      <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-10 text-center"><Search size={16} className="text-bz-text-soft" /><p className="text-[12px] text-bz-text-muted">No {label.toLowerCase()} match “{q}”.</p></div>
        ) : (
          <div className="max-h-[40vh] overflow-y-auto">
            {rows.map((o) => (
              <button key={o.id} onClick={() => { onPick(o); onClose(); }} className="flex w-full items-center gap-3 border-b border-bz-line-soft px-3 py-2.5 text-left last:border-0 hover:bg-bz-paper-warm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-bz-text">{o.label}</span>
                  {o.sub && <span className={cn("block truncate text-[11px] text-bz-text-soft", NUM)}>{o.sub}</span>}
                </span>
                {o.meta && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>{o.meta}</span>}
                <CornerDownLeft size={13} className="shrink-0 text-bz-text-soft" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

type Lot = { batch: string; serial: string; location: string; qty: string };
function InventoryModal({ open, onClose, line, onSave }: {
  open: boolean;
  onClose: () => void;
  line: { name: string; qty: number } | null;
  onSave: (lot: Lot) => void;
}) {
  const [lot, setLot] = React.useState<Lot>({ batch: "", serial: "", location: "", qty: "" });
  React.useEffect(() => { if (open) setLot({ batch: "", serial: "", location: "", qty: line ? String(line.qty) : "" }); }, [open, line]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Inventory detail"
      subtitle={line ? `Batch / serial / bin for ${line.name}` : ""}
      icon={ScanLine}
      footer={<><button onClick={onClose} className={GHOST_BTN}>Cancel</button><button onClick={() => { onSave(lot); onClose(); }} className={SOLID_BTN}><Check size={14} /> Save detail</button></>}
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Batch no."><TextInput value={lot.batch} onChange={(v) => setLot((l) => ({ ...l, batch: v }))} placeholder="BC-0000" /></Field>
        <Field label="Serial no."><TextInput value={lot.serial} onChange={(v) => setLot((l) => ({ ...l, serial: v }))} placeholder="SN-0000" /></Field>
        <Field label="Bin / location"><TextInput value={lot.location} onChange={(v) => setLot((l) => ({ ...l, location: v }))} placeholder="Rack A-12" /></Field>
        <Field label="Quantity"><TextInput value={lot.qty} onChange={(v) => setLot((l) => ({ ...l, qty: v }))} placeholder="0" /></Field>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DISCLOSURE  collapsible region with one-open-at-a-time support
// ════════════════════════════════════════════════════════════════════════════

function Disclosure({ id, openId, setOpenId, icon: Icon, title, summary, children }: {
  id: string;
  openId: string | null;
  setOpenId: (v: string | null) => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
}) {
  const open = openId === id;
  return (
    <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
      <button
        type="button"
        onClick={() => setOpenId(open ? null : id)}
        className={cn("flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors", open ? "bg-bz-paper-warm/60" : "bg-bz-surface hover:bg-bz-paper-warm/40")}
      >
        <Icon size={14} className="shrink-0 text-bz-text-muted" />
        <span className="flex-1 truncate text-[12.5px] font-semibold text-bz-text">{title}</span>
        {summary}
        <ChevronDown size={14} className={cn("shrink-0 text-bz-text-muted transition-transform", open ? "" : "-rotate-90")} />
      </button>
      {open && <div className="border-t border-bz-line-soft bg-bz-surface p-3.5">{children}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CUSTOM-FIELD RENDERER  metadata-driven: maps each declared type → input kind,
// honours required + default + disabled (component 12).
// ════════════════════════════════════════════════════════════════════════════

function CustomFieldRenderer({ fields, values, onChange }: {
  fields: CustomFieldDef[];
  values: Record<string, string | boolean | string[]>;
  onChange: (key: string, v: string | boolean | string[]) => void;
}) {
  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/30 py-8 text-center">
        <Sparkles size={16} className="text-bz-text-soft" />
        <p className="text-[12px] text-bz-text-muted">No custom fields defined for Sales Orders.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {fields.map((f) => {
        const v = values[f.key];
        const missing = !!f.required && (v == null || v === "" || (Array.isArray(v) && v.length === 0));
        const span = f.type === "longtext" || f.type === "multiselect" ? "sm:col-span-2" : "";
        return (
          <Field key={f.key} label={f.label} required={f.required} hint={f.hint} error={missing ? "Required" : undefined} className={span}>
            <CustomFieldInput field={f} value={v} onChange={(val) => onChange(f.key, val)} error={missing} />
          </Field>
        );
      })}
    </div>
  );
}

function CustomFieldInput({ field, value, onChange, error }: {
  field: CustomFieldDef;
  value: string | boolean | string[];
  onChange: (v: string | boolean | string[]) => void;
  error?: boolean;
}) {
  const dis = field.disabled;
  switch (field.type) {
    case "longtext":
      return <Textarea value={(value as string) ?? ""} onChange={onChange} rows={2} placeholder="Type here…" />;
    case "number":
      return <NumberInput value={value === "" || value == null ? undefined : Number(value)} onChange={(n) => onChange(n == null ? "" : String(n))} disabled={dis} placeholder="0" />;
    case "percent":
      return <NumberInput value={value === "" || value == null ? undefined : Number(value)} onChange={(n) => onChange(n == null ? "" : String(n))} disabled={dis} suffix="%" placeholder="0" />;
    case "date":
      return <input type="date" disabled={dis} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={cn(INPUT_BASE, error ? INPUT_ERR : INPUT_OK, NUM, dis && "bg-bz-paper-warm text-bz-text-muted")} />;
    case "datetime":
      return <input type="datetime-local" disabled={dis} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={cn(INPUT_BASE, error ? INPUT_ERR : INPUT_OK, NUM, dis && "bg-bz-paper-warm text-bz-text-muted")} />;
    case "time":
      return <input type="time" disabled={dis} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={cn(INPUT_BASE, error ? INPUT_ERR : INPUT_OK, NUM, dis && "bg-bz-paper-warm text-bz-text-muted")} />;
    case "boolean":
      return (
        <div className="flex h-9 items-center">
          <Switch value={!!value} onChange={onChange} disabled={dis} ariaLabel={field.label} />
          <span className="ml-2 text-[12px] text-bz-text-muted">{value ? "Yes" : "No"}</span>
        </div>
      );
    case "select":
      return (
        <EntityField
          value={value ? { id: value as string, label: value as string } : null}
          onChange={(o) => onChange(o?.id ?? "")}
          options={(field.options ?? []).map((o) => ({ id: o, label: o }))}
          disabled={dis}
          error={error}
          title={field.label}
          required={field.required}
        />
      );
    case "multiselect":
      return <MultiSelect options={field.options ?? []} value={(value as string[]) ?? []} onChange={onChange} disabled={dis} />;
    case "text":
    default:
      return <TextInput value={(value as string) ?? ""} onChange={onChange} disabled={dis} error={error} placeholder="Type here…" />;
  }
}

function MultiSelect({ options, value, onChange, disabled }: { options: string[]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" disabled={disabled} onClick={() => toggle(o)} className={cn("inline-flex items-center gap-1 rounded-bz-pill border px-2.5 py-1 text-[11.5px] font-medium transition-colors", on ? "border-bz-fire bg-bz-fire/[0.18] text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-bz-line hover:text-bz-text", disabled && "opacity-50")}>
            {on && <Check size={11} />} {o}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LINE-ITEM MODEL + LIVE COMPUTE
// ════════════════════════════════════════════════════════════════════════════

type Line = {
  id: string;
  product: Opt | null;
  description: string;
  unitId: string | null;
  qty: number | undefined;
  priceLevelId: string | null;
  priceLevelLinked: boolean;
  rate: number | undefined;
  discMode: "pct" | "amt";
  discPct: number | undefined;
  discAmt: number | undefined;
  taxId: string | null;
  taxRate: number | undefined;
  taxLinked: boolean;
  chargeId: string | null;
  chargeRate: number | undefined;
  lot: Lot | null;
};

function blankLine(): Line {
  return {
    id: uid("ln"), product: null, description: "", unitId: null, qty: undefined,
    priceLevelId: "PL-STD", priceLevelLinked: true, rate: undefined,
    discMode: "pct", discPct: undefined, discAmt: undefined,
    taxId: null, taxRate: undefined, taxLinked: true,
    chargeId: "NONE", chargeRate: 0, lot: null,
  };
}

type LineCalc = { gross: number; discAmt: number; taxable: number; chargeAmt: number; taxAmt: number; net: number };
function computeLine(l: Line): LineCalc {
  const qty = l.qty ?? 0;
  const rate = l.rate ?? 0;
  const gross = qty * rate;
  const discAmt = l.discMode === "pct" ? (gross * (l.discPct ?? 0)) / 100 : Math.min(l.discAmt ?? 0, gross);
  const taxable = Math.max(0, gross - discAmt);
  const chargeAmt = (taxable * (l.chargeRate ?? 0)) / 100;
  const taxAmt = ((taxable + chargeAmt) * (l.taxRate ?? 0)) / 100;
  const net = taxable + chargeAmt + taxAmt;
  return { gross, discAmt, taxable, chargeAmt, taxAmt, net };
}
const isLineValid = (l: Line) => !!l.product && (l.qty ?? 0) > 0 && l.rate != null && l.rate >= 0;
const isLineEmpty = (l: Line) => !l.product && l.qty == null && l.rate == null && !l.description;

const UNIT_OPTS: Opt[] = UNITS.map((u) => ({ id: u, label: u }));
const PRICE_OPTS: Opt[] = PRICE_LEVELS.map((p) => ({ id: p.id, label: p.name, sub: `× ${p.factor}` }));
const TAX_OPTS: Opt[] = TAX_CODES.map((t) => ({ id: t.id, label: t.name, meta: `${t.rate}%` }));
const CHARGE_OPTS: Opt[] = CHARGES.map((c) => ({ id: c.id, label: c.name, meta: c.rate ? `${c.rate}%` : undefined }));

const COL = "text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft";

// ════════════════════════════════════════════════════════════════════════════
// LINE COLLECTION  (component 13)
// ════════════════════════════════════════════════════════════════════════════

function LineCollection({
  lines, productOptions, currency,
  onSelectProduct, onUpdate, onRemove, onAdd, onAddProduct, onAdvancedProduct, onOpenLot,
}: {
  lines: Line[];
  productOptions: Opt[];
  currency: string;
  onSelectProduct: (id: string, product: Opt | null) => void;
  onUpdate: (id: string, patch: Partial<Line>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onAddProduct: (lineId: string) => void;
  onAdvancedProduct: (lineId: string) => void;
  onOpenLot: (id: string) => void;
}) {
  const canAdd = lines.every(isLineValid) && !lines.some(isLineEmpty);

  const addRow = (
    <button
      onClick={onAdd}
      disabled={!canAdd}
      title={canAdd ? "Add another item" : "Complete the current item first"}
      className="flex w-full items-center justify-center gap-1.5 px-4 py-3 text-[12.5px] font-semibold text-bz-text-muted transition-colors hover:bg-bz-paper-warm/50 hover:text-bz-text disabled:cursor-not-allowed disabled:text-bz-text-soft disabled:hover:bg-transparent"
    >
      <span className="flex size-5 items-center justify-center rounded-bz-pill border border-current"><Plus size={12} /></span>
      Add item
    </button>
  );

  return (
    <div>
      {/* DESKTOP table */}
      <div className="hidden overflow-x-auto lg:block">
        <div className="min-w-[1300px]">
          <div className="flex items-center gap-2 border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-2">
            <span className={cn("w-6 shrink-0", COL)}>#</span>
            <span className={cn("min-w-[140px] flex-[1.6]", COL)}>Item</span>
            <span className={cn("min-w-[110px] flex-[1.1]", COL)}>Description</span>
            <span className={cn("w-[76px] shrink-0", COL)}>Unit</span>
            <span className={cn("w-[68px] shrink-0 text-right", COL)}>Qty</span>
            <span className={cn("w-[112px] shrink-0", COL)}>Price level</span>
            <span className={cn("w-[96px] shrink-0 text-right", COL)}>Rate</span>
            <span className={cn("w-[120px] shrink-0", COL)}>Discount</span>
            <span className={cn("w-[148px] shrink-0", COL)}>Tax · %</span>
            <span className={cn("w-[112px] shrink-0", COL)}>Charge</span>
            <span className={cn("w-[110px] shrink-0 text-right", COL)}>Net</span>
            <span className="w-[58px] shrink-0" />
          </div>
          {lines.map((l, i) => (
            <LineRowDesktop
              key={l.id}
              line={l}
              index={i}
              currency={currency}
              productOptions={productOptions}
              onSelectProduct={onSelectProduct}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAddProduct={onAddProduct}
              onAdvancedProduct={onAdvancedProduct}
              onOpenLot={onOpenLot}
            />
          ))}
          <div className="border-t border-bz-line-soft">{addRow}</div>
        </div>
      </div>

      {/* MOBILE cards */}
      <div className="flex flex-col gap-3 p-3 lg:hidden">
        {lines.map((l, i) => (
          <LineCardMobile
            key={l.id}
            line={l}
            index={i}
            currency={currency}
            productOptions={productOptions}
            onSelectProduct={onSelectProduct}
            onUpdate={onUpdate}
            onRemove={onRemove}
            onAddProduct={onAddProduct}
            onAdvancedProduct={onAdvancedProduct}
            onOpenLot={onOpenLot}
          />
        ))}
        <div className="overflow-hidden rounded-bz-md border border-dashed border-bz-line">{addRow}</div>
      </div>
    </div>
  );
}

// shared row logic ── cascade-breaking edits live here
function useLineHandlers(line: Line, onUpdate: (id: string, patch: Partial<Line>) => void) {
  const base = line.product ? PRODUCTS.find((p) => p.id === line.product!.id)?.rate : undefined;
  const selectPriceLevel = (o: Opt | null) => {
    const pl = PRICE_LEVELS.find((p) => p.id === o?.id);
    const rate = pl && base != null ? roundDp(base * pl.factor) : line.rate;
    onUpdate(line.id, { priceLevelId: o?.id ?? null, priceLevelLinked: !!pl, rate });
  };
  const setRate = (v: number | undefined) => onUpdate(line.id, { rate: v, priceLevelLinked: false }); // manual rate breaks the price-level link
  const selectTax = (o: Opt | null) => {
    const tc = TAX_CODES.find((t) => t.id === o?.id);
    onUpdate(line.id, { taxId: o?.id ?? null, taxRate: tc?.rate ?? line.taxRate, taxLinked: true });
  };
  const setTaxRate = (v: number | undefined) => onUpdate(line.id, { taxRate: v, taxLinked: false }); // manual tax breaks the tax-code link
  const selectCharge = (o: Opt | null) => {
    const ch = CHARGES.find((c) => c.id === o?.id);
    onUpdate(line.id, { chargeId: o?.id ?? "NONE", chargeRate: ch?.rate ?? 0 });
  };
  const setDiscPct = (v: number | undefined) => onUpdate(line.id, { discMode: "pct", discPct: v, discAmt: undefined }); // % clears amount
  const setDiscAmt = (v: number | undefined) => onUpdate(line.id, { discMode: "amt", discAmt: v, discPct: undefined }); // amount clears %
  const setDiscMode = (m: "pct" | "amt") => onUpdate(line.id, { discMode: m, ...(m === "pct" ? { discAmt: undefined } : { discPct: undefined }) });
  return { selectPriceLevel, setRate, selectTax, setTaxRate, selectCharge, setDiscPct, setDiscAmt, setDiscMode };
}

function LineRowDesktop(props: LineRowProps) {
  const { line: l, index, currency, productOptions, onSelectProduct, onUpdate, onRemove, onAddProduct, onAdvancedProduct, onOpenLot } = props;
  const c = computeLine(l);
  const h = useLineHandlers(l, onUpdate);
  const invalid = !isLineValid(l) && !isLineEmpty(l);
  const tax = TAX_CODES.find((t) => t.id === l.taxId);
  const charge = CHARGES.find((x) => x.id === l.chargeId);
  const pl = PRICE_LEVELS.find((p) => p.id === l.priceLevelId);

  return (
    <div className={cn("group flex items-center gap-2 border-b border-bz-line-soft px-4 py-2.5 transition-colors hover:bg-bz-paper-warm/20", invalid && "bg-[#FBE7E5]/25")}>
      <span className={cn("w-6 shrink-0 text-[11px] font-semibold text-bz-text-soft", NUM)}>{index + 1}</span>

      {/* item */}
      <div className="min-w-[140px] flex-[1.6]">
        <EntityField value={l.product} onChange={(o) => onSelectProduct(l.id, o)} options={productOptions} placeholder="Search item…" icon={Package} title="item" error={invalid && !l.product} addNewLabel="New item" onAddNew={() => onAddProduct(l.id)} onAdvanced={() => onAdvancedProduct(l.id)} />
      </div>

      {/* description */}
      <div className="min-w-[110px] flex-[1.1]">
        <input value={l.description} onChange={(e) => onUpdate(l.id, { description: e.target.value })} placeholder="—" className="h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text" />
      </div>

      {/* unit */}
      <div className="w-[76px] shrink-0">
        <EntityField value={l.unitId ? { id: l.unitId, label: l.unitId } : null} onChange={(o) => onUpdate(l.id, { unitId: o?.id ?? null })} options={UNIT_OPTS} placeholder="unit" title="unit" />
      </div>

      {/* qty */}
      <div className="w-[68px] shrink-0">
        <NumberInput value={l.qty} onChange={(v) => onUpdate(l.id, { qty: v })} align="right" error={l.product != null && (l.qty ?? 0) <= 0} placeholder="0" />
      </div>

      {/* price level */}
      <div className="w-[112px] shrink-0">
        <EntityField value={pl ? { id: pl.id, label: pl.name } : null} onChange={h.selectPriceLevel} options={PRICE_OPTS} placeholder="level" title="price level" />
      </div>

      {/* rate (dot marks manual override vs price-level link) */}
      <div className="relative w-[96px] shrink-0">
        <NumberInput value={l.rate} onChange={h.setRate} align="right" placeholder="0" />
        {!l.priceLevelLinked && l.rate != null ? (
          <span title="Manual rate — price-level link broken" className="absolute right-1 top-1 size-1.5 rounded-bz-pill bg-bz-text-soft" />
        ) : l.priceLevelLinked && pl && pl.id !== "PL-STD" ? (
          <span title={`Rate from ${pl.name}`} className="absolute right-1 top-1 size-1.5 rounded-bz-pill bg-bz-leaf-deep" />
        ) : null}
      </div>

      {/* discount */}
      <div className="w-[120px] shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => h.setDiscMode(l.discMode === "pct" ? "amt" : "pct")} className="flex h-9 w-8 shrink-0 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm text-[11px] font-semibold text-bz-text-muted hover:text-bz-text" title="Toggle percentage / amount">
            {l.discMode === "pct" ? "%" : "Rs"}
          </button>
          {l.discMode === "pct" ? (
            <NumberInput value={l.discPct} onChange={h.setDiscPct} align="right" placeholder="0" suffix="%" />
          ) : (
            <NumberInput value={l.discAmt} onChange={h.setDiscAmt} align="right" placeholder="0" />
          )}
        </div>
      </div>

      {/* tax code + rate */}
      <div className="flex w-[148px] shrink-0 items-center gap-1">
        <div className="min-w-0 flex-1">
          <EntityField value={tax ? { id: tax.id, label: tax.id } : null} onChange={h.selectTax} options={TAX_OPTS} placeholder="tax" title="tax code" />
        </div>
        <div className="relative w-[54px] shrink-0">
          <NumberInput value={l.taxRate} onChange={h.setTaxRate} align="right" suffix="%" placeholder="0" />
          {!l.taxLinked && l.taxRate != null && <span title="Manual tax rate" className="absolute right-1 top-1 size-1.5 rounded-bz-pill bg-bz-text-soft" />}
        </div>
      </div>

      {/* charge */}
      <div className="w-[112px] shrink-0">
        <EntityField value={charge && charge.id !== "NONE" ? { id: charge.id, label: charge.name } : null} onChange={h.selectCharge} options={CHARGE_OPTS} placeholder="charge" title="charge" />
      </div>

      {/* net (computed) */}
      <div className="w-[110px] shrink-0 text-right" title={`Gross ${fmtAmount(c.gross)} · Discount ${fmtAmount(c.discAmt)} · Charge ${fmtAmount(c.chargeAmt)} · Tax ${fmtAmount(c.taxAmt)}`}>
        <span className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{fmtAmount(c.net)}</span>
        <span className="ml-1 text-[8.5px] uppercase tracking-[0.04em] text-bz-text-soft">{currency}</span>
      </div>

      {/* actions */}
      <div className="flex w-[58px] shrink-0 items-center justify-end gap-0.5">
        <button onClick={() => onOpenLot(l.id)} title="Inventory detail (batch / serial)" className={cn("flex size-7 items-center justify-center rounded-bz-sm hover:bg-bz-paper-warm", l.lot ? "text-bz-leaf-deep" : "text-bz-text-soft hover:text-bz-text")}>
          <ScanLine size={13} />
        </button>
        <button onClick={() => onRemove(l.id)} title="Remove item" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

type LineRowProps = {
  line: Line;
  index: number;
  currency: string;
  productOptions: Opt[];
  onSelectProduct: (id: string, product: Opt | null) => void;
  onUpdate: (id: string, patch: Partial<Line>) => void;
  onRemove: (id: string) => void;
  onAddProduct: (lineId: string) => void;
  onAdvancedProduct: (lineId: string) => void;
  onOpenLot: (id: string) => void;
};

function LineCardMobile(props: LineRowProps) {
  const { line: l, index, currency, productOptions, onSelectProduct, onUpdate, onRemove, onAddProduct, onAdvancedProduct, onOpenLot } = props;
  const c = computeLine(l);
  const h = useLineHandlers(l, onUpdate);
  const valid = isLineValid(l);
  const tax = TAX_CODES.find((t) => t.id === l.taxId);
  const charge = CHARGES.find((x) => x.id === l.chargeId);
  const pl = PRICE_LEVELS.find((p) => p.id === l.priceLevelId);

  return (
    <div className={cn("overflow-hidden rounded-bz-md border bg-bz-surface", valid ? "border-bz-line-soft" : isLineEmpty(l) ? "border-bz-line-soft" : "border-[#C0413A]/40")}>
      <div className="flex items-center justify-between gap-2 border-b border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2">
        <span className={cn("text-[11px] font-semibold text-bz-text-muted", NUM)}>Line {index + 1}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onOpenLot(l.id)} className={cn("flex size-7 items-center justify-center rounded-bz-sm hover:bg-bz-surface", l.lot ? "text-bz-leaf-deep" : "text-bz-text-soft")}><ScanLine size={13} /></button>
          <button onClick={() => onRemove(l.id)} className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]"><Trash2 size={13} /></button>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-3">
        <Field label="Item" required>
          <EntityField value={l.product} onChange={(o) => onSelectProduct(l.id, o)} options={productOptions} placeholder="Search item…" icon={Package} title="item" addNewLabel="New item" onAddNew={() => onAddProduct(l.id)} onAdvanced={() => onAdvancedProduct(l.id)} />
        </Field>
        <Field label="Description"><TextInput value={l.description} onChange={(v) => onUpdate(l.id, { description: v })} placeholder="Optional description" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit"><EntityField value={l.unitId ? { id: l.unitId, label: l.unitId } : null} onChange={(o) => onUpdate(l.id, { unitId: o?.id ?? null })} options={UNIT_OPTS} placeholder="unit" title="unit" /></Field>
          <Field label="Qty" required><NumberInput value={l.qty} onChange={(v) => onUpdate(l.id, { qty: v })} align="right" error={l.product != null && (l.qty ?? 0) <= 0} placeholder="0" /></Field>
          <Field label="Price level"><EntityField value={pl ? { id: pl.id, label: pl.name } : null} onChange={h.selectPriceLevel} options={PRICE_OPTS} placeholder="level" title="price level" /></Field>
          <Field label="Rate" required hint={l.priceLevelLinked && pl && pl.id !== "PL-STD" ? pl.name : !l.priceLevelLinked && l.rate != null ? "manual" : undefined}><NumberInput value={l.rate} onChange={h.setRate} align="right" placeholder="0" /></Field>
          <Field label={`Discount (${l.discMode === "pct" ? "%" : "amount"})`}>
            <div className="flex items-center gap-1">
              <button onClick={() => h.setDiscMode(l.discMode === "pct" ? "amt" : "pct")} className="flex h-9 w-8 shrink-0 items-center justify-center rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm text-[12px] font-semibold text-bz-text-muted">{l.discMode === "pct" ? "%" : "₨"}</button>
              {l.discMode === "pct" ? <NumberInput value={l.discPct} onChange={h.setDiscPct} align="right" suffix="%" placeholder="0" /> : <NumberInput value={l.discAmt} onChange={h.setDiscAmt} align="right" placeholder="0" />}
            </div>
          </Field>
          <Field label="Tax code"><EntityField value={tax ? { id: tax.id, label: tax.name } : null} onChange={h.selectTax} options={TAX_OPTS} placeholder="tax" title="tax code" /></Field>
          <Field label="Tax rate" hint={!l.taxLinked && l.taxRate != null ? "manual" : undefined}><NumberInput value={l.taxRate} onChange={h.setTaxRate} align="right" suffix="%" placeholder="0" /></Field>
          <Field label="Service charge"><EntityField value={charge && charge.id !== "NONE" ? { id: charge.id, label: charge.name } : null} onChange={h.selectCharge} options={CHARGE_OPTS} placeholder="charge" title="charge" /></Field>
        </div>
        {/* computed summary */}
        <div className="rounded-bz-md bg-bz-paper-warm/50 p-2.5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <Row label="Gross" v={fmtAmount(c.gross)} />
            <Row label="Discount" v={c.discAmt ? `−${fmtAmount(c.discAmt)}` : "—"} />
            <Row label="Charge" v={c.chargeAmt ? `+${fmtAmount(c.chargeAmt)}` : "—"} />
            <Row label="Tax" v={c.taxAmt ? fmtAmount(c.taxAmt) : "—"} />
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-bz-line-soft pt-1.5">
            <span className="text-[11px] font-semibold text-bz-text">Net</span>
            <span className={cn("text-[13.5px] font-semibold text-bz-text", NUM)}>{fmtAmount(c.net)} <span className="text-[9px] font-normal uppercase text-bz-text-soft">{currency}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, v }: { label: string; v: string }) {
  return (
    <span className="flex items-center justify-between gap-2">
      <span className="text-bz-text-muted">{label}</span>
      <span className={cn("font-medium text-bz-text", NUM)}>{v}</span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ACTIVITY / NOTES EDITOR  (component 14) — title + body + date + time +
// direction. Once any field in an entry is touched, title + direction become
// required. Always keeps ≥1 entry. Owns its state (kept alive while hidden).
// ════════════════════════════════════════════════════════════════════════════

type Direction = "out" | "in" | "note";
type Activity = { id: string; title: string; body: string; date: string; time: string; direction: Direction | null };
const blankActivity = (): Activity => ({ id: uid("act"), title: "", body: "", date: "", time: "", direction: null });
const activityTouched = (a: Activity) => !!(a.title || a.body || a.date || a.time || a.direction);
const DIRS: { id: Direction; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "out", label: "Outgoing", icon: PhoneOutgoing },
  { id: "in", label: "Incoming", icon: PhoneIncoming },
  { id: "note", label: "Note", icon: StickyNote },
];

function ActivityEditor({ onCountChange }: { onCountChange: (n: number) => void }) {
  const [items, setItems] = React.useState<Activity[]>([blankActivity()]);
  React.useEffect(() => { onCountChange(items.filter(activityTouched).length); }, [items, onCountChange]);
  const update = (id: string, patch: Partial<Activity>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const add = () => setItems((xs) => [...xs, blankActivity()]);
  const remove = (id: string) => setItems((xs) => (xs.length === 1 ? [blankActivity()] : xs.filter((x) => x.id !== id)));

  return (
    <div className="flex flex-col gap-3 p-3.5 md:p-5">
      <p className="text-[12px] text-bz-text-muted">Log calls, follow-ups and internal notes against this order. Optional — but once you start an entry, give it a title and a direction.</p>
      {items.map((a, i) => {
        const touched = activityTouched(a);
        const needTitle = touched && !a.title.trim();
        const needDir = touched && !a.direction;
        return (
          <div key={a.id} className="overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
            <div className="flex items-center justify-between border-b border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2">
              <span className={cn("text-[11px] font-semibold text-bz-text-muted", NUM)}>Entry {i + 1}</span>
              <button onClick={() => remove(a.id)} className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]"><Trash2 size={12} /></button>
            </div>
            <div className="flex flex-col gap-3 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                <Field label="Title" required={touched} error={needTitle ? "Required once started" : undefined}><TextInput value={a.title} onChange={(v) => update(a.id, { title: v })} placeholder="e.g. Confirmed delivery window" error={needTitle} /></Field>
                <Field label="Direction" required={touched} error={needDir ? "Pick one" : undefined}>
                  <div className="flex gap-1">
                    {DIRS.map((d) => {
                      const on = a.direction === d.id;
                      const D = d.icon;
                      return (
                        <button key={d.id} onClick={() => update(a.id, { direction: on ? null : d.id })} title={d.label} className={cn("inline-flex h-9 items-center gap-1.5 rounded-bz-md border px-2.5 text-[11.5px] font-medium transition-colors", on ? "border-bz-fire bg-bz-fire text-bz-olive" : needDir ? "border-[#C0413A]/50 bg-bz-surface text-bz-text-muted" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:text-bz-text")}>
                          <D size={12} /> <span className="hidden sm:inline">{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
              <Field label="Note"><Textarea value={a.body} onChange={(v) => update(a.id, { body: v })} rows={2} placeholder="Add detail…" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date"><input type="date" value={a.date} onChange={(e) => update(a.id, { date: e.target.value })} className={cn(INPUT_BASE, INPUT_OK, NUM)} /></Field>
                <Field label="Time"><input type="time" value={a.time} onChange={(e) => update(a.id, { time: e.target.value })} className={cn(INPUT_BASE, INPUT_OK, NUM)} /></Field>
              </div>
            </div>
          </div>
        );
      })}
      <button onClick={add} className="inline-flex h-9 w-fit items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm"><Plus size={13} /> Add entry</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FILE-ATTACHMENT MANAGER  (component 15) — browse / drag-drop · upload progress
// · preview / download / delete. Owns its state (alive while hidden).
// ════════════════════════════════════════════════════════════════════════════

type Upload = { id: string; name: string; size: number; uploader: string; ts: string; status: "uploading" | "done" | "error"; progress: number };
const SEED_FILES: Upload[] = [
  { id: "att-1", name: "purchase-order-scan.pdf", size: 248_400, uploader: "Manas Singh", ts: "Today, 10:24", status: "done", progress: 100 },
  { id: "att-2", name: "site-photo.jpg", size: 1_204_900, uploader: "Manas Singh", ts: "Today, 10:25", status: "done", progress: 100 },
  { id: "att-3", name: "spec-sheet.xlsx", size: 86_200, uploader: "Manas Singh", ts: "Today, 10:26", status: "error", progress: 0 },
];
function fileKind(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return { Icon: FileText, tint: "var(--bz-file-pdf)", preview: true };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return { Icon: FileImage, tint: "var(--bz-file-img)", preview: true };
  if (["xls", "xlsx", "csv"].includes(ext)) return { Icon: FileSpreadsheet, tint: "var(--bz-file-xls)", preview: false };
  if (["txt", "md", "doc", "docx"].includes(ext)) return { Icon: FileText, tint: "var(--bz-file-doc)", preview: true };
  return { Icon: FileIcon, tint: "var(--bz-text-muted)", preview: false };
}
function fmtSize(b: number) { return b < 1024 ? `${b} B` : b < 1_048_576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1_048_576).toFixed(1)} MB`; }

function FileManager({ onCountChange, onToast }: { onCountChange: (n: number) => void; onToast: (m: string) => void }) {
  const [files, setFiles] = React.useState<Upload[]>(SEED_FILES);
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { onCountChange(files.filter((f) => f.status === "done").length); }, [files, onCountChange]);

  const intervals = React.useRef<Record<string, number>>({});
  React.useEffect(() => () => { Object.values(intervals.current).forEach((i) => window.clearInterval(i)); }, []);

  const ingest = (list: { name: string; size: number }[]) => {
    const added = list.map((f) => ({ id: uid("att"), name: f.name, size: f.size, uploader: "Manas Singh", ts: "Just now", status: "uploading" as const, progress: 8 }));
    setFiles((xs) => [...xs, ...added]);
    added.forEach((a) => {
      const iv = window.setInterval(() => {
        setFiles((xs) => xs.map((f) => {
          if (f.id !== a.id) return f;
          const next = Math.min(100, f.progress + 18 + Math.floor(Math.random() * 16));
          if (next >= 100) { window.clearInterval(intervals.current[a.id]); delete intervals.current[a.id]; return { ...f, progress: 100, status: "done", ts: "Just now" }; }
          return { ...f, progress: next };
        }));
      }, 260);
      intervals.current[a.id] = iv;
    });
  };
  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files; if (!fl?.length) return;
    ingest(Array.from(fl).map((f) => ({ name: f.name, size: f.size }))); e.target.value = "";
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const fl = e.dataTransfer.files;
    if (fl?.length) ingest(Array.from(fl).map((f) => ({ name: f.name, size: f.size })));
    else ingest([{ name: `dropped-file-${Math.floor(Math.random() * 900 + 100)}.pdf`, size: 120_000 + Math.floor(Math.random() * 800_000) }]);
  };
  const remove = (id: string) => { setFiles((xs) => xs.filter((f) => f.id !== id)); onToast("Attachment removed."); };
  const retry = (id: string) => setFiles((xs) => xs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 10 } : f)));

  return (
    <div className="flex flex-col gap-3 p-3.5 md:p-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn("flex flex-col items-center justify-center gap-2 rounded-bz-lg border-2 border-dashed px-4 py-8 text-center transition-colors", drag ? "border-bz-fire bg-bz-fire/[0.08]" : "border-bz-line bg-bz-paper-warm/30")}
      >
        <span className={cn("flex size-10 items-center justify-center rounded-bz-md", drag ? "bg-bz-fire text-bz-olive" : "bg-bz-surface text-bz-text-muted")}><Upload size={18} /></span>
        <p className="text-[13px] font-medium text-bz-text">{drag ? "Drop to upload" : "Drag files here, or browse"}</p>
        <p className="text-[11px] text-bz-text-muted">PDF, images, spreadsheets — up to 20 MB each</p>
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
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-bz-pill bg-bz-line-soft"><span className="block h-full rounded-bz-pill bg-bz-fire transition-all" style={{ width: `${f.progress}%` }} /></span>
                      <span className={cn("text-[10px] text-bz-text-muted", NUM)}>{f.progress}%</span>
                    </div>
                  ) : f.status === "error" ? (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-medium text-[#9A2E29]"><AlertTriangle size={10} /> Upload failed</p>
                  ) : (
                    <p className={cn("mt-0.5 truncate text-[10.5px] text-bz-text-soft", NUM)}>{fmtSize(f.size)} · {f.uploader} · {f.ts}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {f.status === "done" && k.preview && <button onClick={() => onToast(`Previewing ${f.name}`)} title="Preview" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><Eye size={13} /></button>}
                  {f.status === "done" && <button onClick={() => onToast(`Downloading ${f.name}`)} title="Download" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><Download size={13} /></button>}
                  {f.status === "error" && <button onClick={() => retry(f.id)} title="Retry" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><RotateCcw size={13} /></button>}
                  <button onClick={() => remove(f.id)} title="Delete" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]"><Trash2 size={13} /></button>
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
// BILLING DETAILS  (component 17) — read-only customer reflections + payment
// term (which derives the due date) + the due date itself (overridable).
// ════════════════════════════════════════════════════════════════════════════

function BillingDetails({ customer, term, onTerm, due, onDue, orderDate }: {
  customer: Customer | null;
  term: Opt | null;
  onTerm: (o: Opt | null) => void;
  due: string | null;
  onDue: (iso: string) => void;
  orderDate: string | null;
}) {
  return (
    <div className="flex flex-col gap-4 p-3.5 md:p-5">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Bill to (from customer)</p>
        {customer ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ReadRow label="Customer" value={customer.name} />
            <ReadRow label="PAN / Tax ID" value={customer.pan} mono />
            <ReadRow label="VAT no." value={customer.vat ?? "—"} mono />
            <ReadRow label="Currency" value={customer.currency} mono />
            <div className="sm:col-span-2"><ReadRow label="Billing address" value={customer.address} /></div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/30 px-3 py-4 text-[12px] text-bz-text-muted"><Info size={13} className="text-bz-text-soft" /> Pick a customer to reflect their tax ID and address here.</div>
        )}
      </div>
      <div className="border-t border-bz-line-soft pt-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Payment</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Payment term" hint="sets the due date">
            <EntityField value={term} onChange={onTerm} options={TERMS.map((t) => ({ id: t.id, label: t.name, sub: t.days ? `${t.days} days` : "Immediate" }))} icon={Wallet} title="payment term" placeholder="Select term" />
          </Field>
          <Field label="Due date" hint={orderDate ? "order date + term" : undefined}>
            <DateField value={due} onChange={onDue} derivedHint={term ? "Derived" : undefined} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function ReadRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">{label}</p>
      <p className={cn("mt-0.5 text-[12.5px] text-bz-text", mono && NUM)}>{value}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION CARD + TAB BAR
// ════════════════════════════════════════════════════════════════════════════

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface", className)}>{children}</div>;
}

function CardHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3">
      <h2 className="min-w-0 truncate text-[13.5px] font-semibold tracking-tight text-bz-text">{title}</h2>
      {right}
    </div>
  );
}

type TabId = "items" | "activity" | "billing" | "files";
function TabBar({ active, onSelect, counts }: {
  active: TabId;
  onSelect: (t: TabId) => void;
  counts: Record<TabId, number>;
}) {
  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "items", label: "Line Items", icon: Boxes },
    { id: "activity", label: "Activity", icon: ClipboardList },
    { id: "billing", label: "Billing", icon: Wallet },
    { id: "files", label: "Files", icon: Paperclip },
  ];
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-b border-bz-line-soft bg-bz-paper-warm/30 px-2">
      {tabs.map((t) => {
        const on = active === t.id;
        const n = counts[t.id];
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn("relative inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium transition-colors", on ? "text-bz-text" : "text-bz-text-muted hover:text-bz-text")}
          >
            <t.icon size={13} className={on ? "text-bz-text" : "text-bz-text-soft"} />
            {t.label}
            {n > 0 && <span className={cn("inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill px-1 text-[10px] font-semibold", on ? "bg-bz-fire/[0.22] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted", NUM)}>{n}</span>}
            {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-bz-pill bg-bz-fire" />}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REVIEW RAIL  live totals (component 18) · validation checklist (gates save) ·
// advisory text (component 23). Sticky beside the composition column.
// ════════════════════════════════════════════════════════════════════════════

type Totals = { subtotal: number; discount: number; charges: number; tax: number; total: number; rows: number };

function TotalsRail({ totals, currency, isForeign, fxRate }: { totals: Totals; currency: string; isForeign: boolean; fxRate: number | undefined }) {
  return (
    <Card>
      <CardHead title="Order totals" right={<span className="rounded-bz-sm bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold text-bz-text-muted">{currency}</span>} />
      <div className="flex flex-col gap-2 p-4">
        <TotalRow label="Subtotal" value={fmtAmount(totals.subtotal)} />
        <TotalRow label="Discount" value={totals.discount ? `−${fmtAmount(totals.discount)}` : "0"} muted />
        <TotalRow label="Service charge" value={totals.charges ? `+${fmtAmount(totals.charges)}` : "0"} muted />
        <TotalRow label="Tax / VAT" value={fmtAmount(totals.tax)} muted />
        <div className="mt-1 flex items-baseline justify-between border-t border-bz-line pt-3">
          <span className="text-[12.5px] font-semibold text-bz-text">Order total</span>
          <span className="text-right">
            <span className="mr-1 text-[10px] font-semibold uppercase text-bz-text-soft">{currency}</span>
            <span className={cn("text-[20px] font-semibold tracking-tight text-bz-text", NUM)}>{fmtAmount(totals.total)}</span>
          </span>
        </div>
        {isForeign && (
          <div className="mt-1 flex items-center justify-between rounded-bz-md bg-bz-paper-warm/50 px-2.5 py-1.5">
            <span className="text-[11px] text-bz-text-muted">≈ in {BASE_CURRENCY}</span>
            <span className={cn("text-[12px] font-medium text-bz-text", NUM)}>
              {fxRate ? fmtAmount(totals.total * fxRate) : "—"} <span className="text-[9.5px] text-bz-text-soft">@ {fxRate ?? "?"}</span>
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

function TotalRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-bz-text-muted">{label}</span>
      <span className={cn("text-[12.5px]", NUM, muted ? "text-bz-text-muted" : "font-medium text-bz-text")}>{value}</span>
    </div>
  );
}

type Check = { label: string; ok: boolean };
function ValidationChecklist({ checks, canSave }: { checks: Check[]; canSave: boolean }) {
  return (
    <Card>
      <CardHead
        title="Ready to save?"
        right={
          <span className={cn("inline-flex items-center gap-1.5 rounded-bz-pill px-2.5 py-1 text-[11px] font-semibold", canSave ? "bg-bz-fire/[0.18] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>
            <span className={cn("size-1.5 rounded-bz-pill", canSave ? "bg-bz-leaf-deep" : "bg-bz-text-soft")} />
            {canSave ? "Valid" : "Incomplete"}
          </span>
        }
      />
      <div className="flex flex-col gap-1.5 p-3.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2.5">
            <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-bz-pill", c.ok ? "bg-bz-fire/[0.22] text-bz-leaf-deep" : "bg-bz-paper-warm text-bz-text-soft")}>
              {c.ok ? <Check size={11} strokeWidth={3} /> : <span className="size-1.5 rounded-bz-pill bg-bz-text-soft" />}
            </span>
            <span className={cn("text-[12px]", c.ok ? "text-bz-text-muted" : "font-medium text-bz-text")}>{c.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AdvisoryNote({ creditHold, customerName }: { creditHold: boolean; customerName?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      {creditHold && (
        <div className="flex gap-2.5 rounded-bz-md border border-[#C0413A]/30 bg-[#FBE7E5] p-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#9A2E29]" />
          <p className="text-[11px] leading-relaxed text-[#9A2E29]"><span className="font-semibold">{customerName} is on credit hold.</span> Saving will route this order to Finance for a limit review before it can be confirmed.</p>
        </div>
      )}
      <div className="flex gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3">
        <Info size={14} className="mt-0.5 shrink-0 text-bz-text-muted" />
        <p className="text-[11px] leading-relaxed text-bz-text-muted">Orders above your approval limit may need <span className="font-medium text-bz-text">sales-manager approval</span> before fulfilment can begin. You can still save and submit for review.</p>
      </div>
    </div>
  );
}

// Linked source document (component 22) — now lives below the advisory in the rail.
function LinkedSource({ source }: { source: { type: string; ref: string } | null }) {
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Source document</p>
      {source ? (
        <button className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-bz-text hover:underline">
          <Link2 size={13} className="text-bz-text-muted" /> {source.type} {source.ref} <ArrowUpRight size={11} className="text-bz-text-muted" />
        </button>
      ) : (
        <p className="inline-flex items-center gap-1.5 text-[12px] text-bz-text-soft"><Link2 size={13} /> No linked source document</p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMER & CONTEXT CARD  the master cascade source + order context + a
// one-open-at-a-time classification / custom-fields accordion.
// ════════════════════════════════════════════════════════════════════════════

type CtxProps = {
  customerOpt: Opt | null;
  customer: Customer | null;
  onSelectCustomer: (o: Opt | null) => void;
  customerOptions: Opt[];
  onAddCustomer: () => void;
  onAdvancedCustomer: () => void;
  onViewCustomer: () => void;
  repOpt: Opt | null;
  onRep: (o: Opt | null) => void;
  repOptions: Opt[];
  repLoading: boolean;
  orderDate: string | null;
  onOrderDate: (iso: string) => void;
  expectedDate: string | null;
  onExpectedDate: (iso: string) => void;
  locationOpt: Opt | null;
  onLocation: (o: Opt | null) => void;
  locationOptions: Opt[];
  onAdvancedLocation: () => void;
  isForeign: boolean;
  currencyOpt: Opt | null;
  fxRate: number | undefined;
  onFx: (v: number | undefined) => void;
  fxHint?: string;
  deptOpt: Opt | null; onDept: (o: Opt | null) => void;
  classOpt: Opt | null; onClass: (o: Opt | null) => void;
  projectOpt: Opt | null; onProject: (o: Opt | null) => void;
  partnerOpt: Opt | null; onPartner: (o: Opt | null) => void;
  cfValues: Record<string, string | boolean | string[]>;
  onCF: (k: string, v: string | boolean | string[]) => void;
  cfMissing: number;
  openDisc: string | null;
  setOpenDisc: (v: string | null) => void;
  errors: { customer: boolean; date: boolean; location: boolean; currency: boolean; fx: boolean };
};

const DEPARTMENTS: Opt[] = ["Sales", "Trading", "Projects", "Retail", "Exports"].map((x) => ({ id: x, label: x }));
const CLASSES: Opt[] = ["Domestic", "Export", "Government", "Internal"].map((x) => ({ id: x, label: x }));
const PROJECTS: Opt[] = ["Bharatpur Plant Ph-2", "KTM Ring Road", "Pokhara Expansion", "Butwal Depot Fit-out"].map((x) => ({ id: x, label: x }));
const PARTNERS: Opt[] = ["ChannelCo Nepal", "Reseller North", "Reseller East", "Direct"].map((x) => ({ id: x, label: x }));

function CustomerContextCard(p: CtxProps) {
  return (
    <Card>
      <CardHead title="Customer & order context" />
      <div className="flex flex-col gap-4 p-4">
        {/* master customer */}
        <Field label="Customer" required error={p.errors.customer ? "Select a customer" : undefined}>
          <EntityField
            value={p.customerOpt}
            onChange={p.onSelectCustomer}
            options={p.customerOptions}
            placeholder="Search customers…"
            icon={UserRound}
            required
            error={p.errors.customer}
            title="customer"
            addNewLabel="New customer"
            onAddNew={p.onAddCustomer}
            onAdvanced={p.onAdvancedCustomer}
            onView={p.onViewCustomer}
          />
        </Field>

        {/* cascaded customer snapshot */}
        {p.customer && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-bz-md bg-bz-paper-warm/50 px-3 py-2 text-[11px]">
            <Snap label="PAN" value={p.customer.pan} mono />
            <Snap label="Currency" value={p.customer.currency} mono />
            <Snap label="Address" value={p.customer.address} />
            {p.isForeign && <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-leaf/50 px-1.5 py-0.5 text-[10px] font-semibold text-bz-text">Foreign currency</span>}
            {p.customer.taxOverride && <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text-muted">Tax override · {p.customer.taxOverride}</span>}
          </div>
        )}

        {/* context grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Sales representative" hint={p.repLoading ? "applying…" : undefined}>
            {p.repLoading ? (
              <div className="flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 text-[12.5px] text-bz-text-muted"><Loader2 size={13} className="animate-spin text-bz-fire" /> Fetching rep…</div>
            ) : (
              <EntityField value={p.repOpt} onChange={p.onRep} options={p.repOptions} placeholder="Assign a rep" icon={UserRound} title="sales rep" />
            )}
          </Field>
          <Field label="Fulfilment location" required error={p.errors.location ? "Required" : undefined}>
            <EntityField value={p.locationOpt} onChange={p.onLocation} options={p.locationOptions} placeholder="Where it ships from" icon={MapPin} required error={p.errors.location} title="location" onAdvanced={p.onAdvancedLocation} />
          </Field>
          <Field label="Order date" required error={p.errors.date ? "Required" : undefined}>
            <DateField value={p.orderDate} onChange={p.onOrderDate} required error={p.errors.date} />
          </Field>
          <Field label="Expected delivery">
            <DateField value={p.expectedDate} onChange={p.onExpectedDate} />
          </Field>

          {/* conditional currency + FX (foreign only) */}
          {p.isForeign && (
            <>
              <Field label="Currency" required hint="locked to customer">
                <EntityField value={p.currencyOpt} onChange={() => { /* locked */ }} options={p.currencyOpt ? [p.currencyOpt] : []} disabled title="currency" icon={Wallet} />
              </Field>
              <Field label="Exchange rate" required hint={p.fxHint ? `~ ${p.fxHint}` : undefined} error={p.errors.fx ? "Required" : undefined}>
                <NumberInput value={p.fxRate} onChange={p.onFx} preservePrecision error={p.errors.fx} placeholder={p.fxHint ?? "0.0000"} prefix={`1 ${p.currencyOpt?.id ?? ""} =`} suffix={BASE_CURRENCY} />
              </Field>
            </>
          )}
        </div>

        {/* classification + custom fields accordion (one open at a time) */}
        <div className="flex flex-col gap-2">
          <Disclosure
            id="classification"
            openId={p.openDisc}
            setOpenId={p.setOpenDisc}
            icon={Tag}
            title="Classification"
            summary={<span className="hidden text-[10.5px] text-bz-text-soft sm:inline">Department · Class · Project · Partner</span>}
          >
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="Department"><EntityField value={p.deptOpt} onChange={p.onDept} options={DEPARTMENTS} placeholder="Optional" title="department" /></Field>
              <Field label="Class"><EntityField value={p.classOpt} onChange={p.onClass} options={CLASSES} placeholder="Optional" title="class" /></Field>
              <Field label="Project"><EntityField value={p.projectOpt} onChange={p.onProject} options={PROJECTS} placeholder="Optional" title="project" /></Field>
              <Field label="Partner"><EntityField value={p.partnerOpt} onChange={p.onPartner} options={PARTNERS} placeholder="Optional" title="partner" /></Field>
            </div>
          </Disclosure>

          <Disclosure
            id="custom"
            openId={p.openDisc}
            setOpenId={p.setOpenDisc}
            icon={Sparkles}
            title="Custom fields"
            summary={
              p.cfMissing > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-bz-pill bg-[#FBE7E5] px-1.5 py-0.5 text-[10px] font-semibold text-[#9A2E29]">{p.cfMissing} required</span>
              ) : (
                <span className="hidden text-[10.5px] text-bz-text-soft sm:inline">{SO_CUSTOM_FIELDS.length} fields</span>
              )
            }
          >
            <CustomFieldRenderer fields={SO_CUSTOM_FIELDS} values={p.cfValues} onChange={p.onCF} />
          </Disclosure>
        </div>
      </div>
    </Card>
  );
}

function Snap({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-baseline gap-1">
      <span className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">{label}</span>
      <span className={cn("max-w-[220px] truncate text-bz-text", mono && NUM)}>{value}</span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT HEADER  identity + auto number + org scope + Save / overflow / reset
// ════════════════════════════════════════════════════════════════════════════

function DocumentHeader({
  mode, docNumber, subOpt, onSub, saving, canSave, onSave, onReset,
}: {
  mode: "create" | "edit";
  docNumber: string;
  subOpt: Opt | null;
  onSub: (o: Opt | null) => void;
  saving: boolean;
  canSave: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-4 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* identity */}
        <div className="min-w-0">
          <button onClick={() => navigate("/design/sales-order-list")} className="mb-2 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">
            <ArrowLeft size={13} /> Sales Orders
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] font-semibold tracking-tight text-bz-text md:text-[24px]">{mode === "edit" ? "Edit Sales Order" : "New Sales Order"}</h1>
            <span className={cn("inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-deep px-2.5 py-1 text-[11.5px] font-semibold text-bz-paper", NUM)} title="System-assigned, not editable">
              <Hash size={11} /> {docNumber}
              <span className="rounded-bz-sm bg-white/15 px-1 py-px text-[8.5px] font-bold uppercase tracking-[0.08em] text-bz-fire">Auto</span>
            </span>
          </div>
        </div>

        {/* scope + actions */}
        <div className="flex shrink-0 flex-col items-stretch gap-2.5 lg:items-end">
          {MULTI_ORG && (
            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft sm:inline">Organisation</span>
              <div className="w-[230px]">
                <EntityField value={subOpt} onChange={onSub} options={SUBSIDIARIES.map((s) => ({ id: s.id, label: s.name, meta: s.id }))} icon={Building2} required autoFirst title="subsidiary" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <button onClick={onSave} disabled={!canSave || saving} className={cn(SOLID_BTN, "h-9")}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? "Posting…" : mode === "edit" ? "Save changes" : "Save order"}
            </button>
            <HeaderOverflow onReset={onReset} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderOverflow({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label="More actions" className={cn("flex size-9 items-center justify-center rounded-bz-md border text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text", open ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface")}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-[42px] z-30 w-52 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <button onClick={() => { setOpen(false); onReset(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm">
            <RotateCcw size={13} className="text-bz-text-muted" />
            <span className="text-[12px] font-medium text-bz-text">Reset form</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED ACTION BAR (overlay) + TOAST
// ════════════════════════════════════════════════════════════════════════════

function DockedActionBar({ total, currency, rows, dirty, saving, canSave, onReset, onSave, mode }: {
  total: number;
  currency: string;
  rows: number;
  dirty: boolean;
  saving: boolean;
  canSave: boolean;
  onReset: () => void;
  onSave: () => void;
  mode: "create" | "edit";
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">Order total</p>
          <p className="truncate">
            <span className="mr-1 text-[10px] font-semibold uppercase text-bz-text-muted">{currency}</span>
            <span className={cn("text-[17px] font-semibold tracking-tight text-bz-text", NUM)}>{fmtAmount(total)}</span>
          </p>
        </div>
        <span className="hidden h-8 w-px bg-bz-line-soft sm:block" />
        <p className="hidden items-center gap-2 text-[11.5px] text-bz-text-muted sm:flex">
          {saving ? (
            <><Loader2 size={12} className="animate-spin text-bz-fire" /> Posting the order…</>
          ) : dirty ? (
            <><span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Unsaved · <span className={cn(NUM)}>{rows}</span> {rows === 1 ? "line" : "lines"}</>
          ) : (
            <><Check size={12} className="text-bz-leaf-deep" /> No changes yet</>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={onReset} disabled={!dirty || saving} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40">
          <RotateCcw size={13} /> <span className="hidden sm:inline">Reset</span>
        </button>
        <button onClick={onSave} disabled={!canSave || saving} className={cn(SOLID_BTN, "h-9")}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? "Posting…" : mode === "edit" ? "Save changes" : "Save order"}
        </button>
      </div>
    </div>
  );
}

type ToastState = { kind: "success" | "warning" | "error"; message: string; id: number } | null;
function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4400);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const tone = toast.kind;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", tone === "success" ? "bg-bz-fire/[0.22]" : tone === "warning" ? "bg-bz-leaf/50" : "bg-[#FBE7E5]")}>
          {tone === "success" ? <Check size={13} className="text-bz-leaf-deep" /> : tone === "warning" ? <AlertTriangle size={12} className="text-bz-text" /> : <X size={13} className="text-[#9A2E29]" />}
        </span>
        <p className="max-w-[420px] text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SEED HELPERS  (create blanks · edit pre-fill from the house order data)
// ════════════════════════════════════════════════════════════════════════════

const MAX_ID = Math.max(...ORDERS.map((o) => Number(o.id.replace(/\D/g, ""))));
const NEXT_DOC = `SO-${MAX_ID + 1}`;

const custToOpt = (c: Customer): Opt => ({ id: c.id, label: c.name, sub: `${c.id} · ${c.type}`, meta: c.currency });
const repToOpt = (id: string | null): Opt | null => { const r = SALES_REPS.find((x) => x.id === id); return r ? { id: r.id, label: r.name, sub: r.sub } : null; };
const termToOpt = (id: string | null): Opt | null => { const t = TERMS.find((x) => x.id === id); return t ? { id: t.id, label: t.name, sub: t.days ? `${t.days} days` : "Immediate" } : null; };
const locNameToOpt = (name: string): Opt | null => { const l = LOCATIONS.find((x) => x.name === name); return l ? { id: l.id, label: l.name, sub: l.sub } : null; };
const cfEmpty = (v: string | boolean | string[] | undefined) => v == null || v === "" || (Array.isArray(v) && v.length === 0);

type Seed = {
  sub: Opt;
  customer: Customer | null;
  rep: Opt | null;
  term: Opt | null;
  orderDate: string;
  expectedDate: string;
  due: string | null;
  location: Opt | null;
  fxRate: number | undefined;
  lines: Line[];
  cf: Record<string, string | boolean | string[]>;
  source: { type: string; ref: string } | null;
  docNumber: string;
};

function defaultCF(): Record<string, string | boolean | string[]> {
  const o: Record<string, string | boolean | string[]> = {};
  SO_CUSTOM_FIELDS.forEach((f) => (o[f.key] = defaultCFValue(f)));
  return o;
}

function buildSeed(mode: "create" | "edit", id?: string): Seed {
  const subOpt = (s: Sub): Opt => ({ id: s.id, label: s.name, meta: s.id });
  if (mode === "edit" && id) {
    const order = ORDERS.find((o) => o.id === id);
    if (order) {
      const cust = SEED_CUSTOMERS.find((c) => c.name === order.party) ?? null;
      const sub = SUBSIDIARIES.find((s) => order.subsidiary.startsWith(s.id)) ?? SUBSIDIARIES[0];
      const term = cust ? termToOpt(cust.termId) : null;
      const due = term ? addDaysISO(order.dateISO, TERMS.find((t) => t.id === term.id)?.days ?? 0) : null;
      const lines: Line[] = order.lines.length
        ? order.lines.map((ol) => {
            const pl = PRICE_LEVELS.find((p) => p.name === ol.priceLevel);
            return {
              ...blankLine(),
              product: { id: ol.code, label: ol.item },
              unitId: ol.unit,
              qty: ol.qty,
              priceLevelId: pl?.id ?? "PL-STD",
              priceLevelLinked: true,
              rate: ol.rate,
              discMode: "pct",
              discPct: ol.discPct || undefined,
              taxId: ol.taxCode,
              taxRate: ol.taxRate,
              taxLinked: true,
            };
          })
        : [blankLine()];
      const cf = defaultCF();
      cf.po_number = `PO-${order.id}`;
      return {
        sub: subOpt(sub), customer: cust, rep: cust ? repToOpt(cust.repId) : null, term,
        orderDate: order.dateISO, expectedDate: addDaysISO(order.dateISO, 13), due,
        location: locNameToOpt(order.location), fxRate: cust && cust.currency !== BASE_CURRENCY ? undefined : 1,
        lines, cf, source: { type: "Estimate", ref: "EST-" + (2200 + (MAX_ID - Number(order.id.replace(/\D/g, "")))) }, docNumber: order.id,
      };
    }
  }
  return {
    sub: subOpt(SUBSIDIARIES[0]), customer: null, rep: null, term: null,
    orderDate: TODAY_ISO, expectedDate: addDaysISO(TODAY_ISO, 7), due: null,
    location: null, fxRate: 1, lines: [blankLine()], cf: defaultCF(), source: null, docNumber: NEXT_DOC,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function SalesOrderFormDesignPage({ mode = "create" }: { mode?: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const seedRef = React.useRef<Seed | null>(null);
  if (!seedRef.current) seedRef.current = buildSeed(mode, id);
  const seed = seedRef.current;

  // ── scope + context ──
  const [subOpt, setSubOpt] = React.useState<Opt | null>(seed.sub);
  const [customer, setCustomer] = React.useState<Customer | null>(seed.customer);
  const [customerPool, setCustomerPool] = React.useState<Customer[]>(SEED_CUSTOMERS);
  const [productPool, setProductPool] = React.useState<Product[]>(PRODUCTS);
  const [repOpt, setRepOpt] = React.useState<Opt | null>(seed.rep);
  const [repLoading, setRepLoading] = React.useState(false);
  const [orderDate, setOrderDate] = React.useState<string | null>(seed.orderDate);
  const [expectedDate, setExpectedDate] = React.useState<string | null>(seed.expectedDate);
  const [due, setDue] = React.useState<string | null>(seed.due);
  const [term, setTerm] = React.useState<Opt | null>(seed.term);
  const [locationOpt, setLocationOpt] = React.useState<Opt | null>(seed.location);
  const [fxRate, setFxRate] = React.useState<number | undefined>(seed.fxRate);
  const [deptOpt, setDeptOpt] = React.useState<Opt | null>(null);
  const [classOpt, setClassOpt] = React.useState<Opt | null>(null);
  const [projectOpt, setProjectOpt] = React.useState<Opt | null>(null);
  const [partnerOpt, setPartnerOpt] = React.useState<Opt | null>(null);
  const [cfValues, setCfValues] = React.useState(seed.cf);
  const [memo, setMemo] = React.useState("");

  // ── lines + secondary surfaces ──
  const [lines, setLines] = React.useState<Line[]>(seed.lines);
  const [openDisc, setOpenDisc] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabId>("items");
  const [activityCount, setActivityCount] = React.useState(0);
  const [filesCount, setFilesCount] = React.useState(SEED_FILES.filter((f) => f.status === "done").length);

  // ── flow ──
  const [posting, setPosting] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const showToast = React.useCallback((kind: "success" | "warning" | "error", message: string) => setToast({ kind, message, id: ++toastId.current }), []);

  // ── modals ──
  const [custCreateOpen, setCustCreateOpen] = React.useState(false);
  const [prodCreate, setProdCreate] = React.useState<{ lineId: string } | null>(null);
  const [advanced, setAdvanced] = React.useState<{ kind: "customer" | "product" | "location"; options: Opt[]; label: string; lineId?: string } | null>(null);
  const [inventory, setInventory] = React.useState<{ lineId: string } | null>(null);

  const repTimer = React.useRef<number | null>(null);
  React.useEffect(() => () => { if (repTimer.current) window.clearTimeout(repTimer.current); }, []);

  const touch = () => setDirty(true);

  // ── derived: scoped pools ──
  const activeSub = subOpt?.id ?? SUBSIDIARIES[0].id;
  const scopedCustomers = React.useMemo(() => customerPool.filter((c) => c.sub === activeSub), [customerPool, activeSub]);
  const customerOptions = React.useMemo(() => scopedCustomers.map(custToOpt), [scopedCustomers]);
  const locationOptions = React.useMemo(() => LOCATIONS.filter((l) => l.sub === activeSub).map((l) => ({ id: l.id, label: l.name, sub: l.sub })), [activeSub]);
  const repOptions = React.useMemo(() => SALES_REPS.filter((r) => r.sub === activeSub).map((r) => ({ id: r.id, label: r.name, sub: r.sub })), [activeSub]);
  const productOptions = React.useMemo(() => productPool.map((p) => ({ id: p.id, label: p.name, sub: `${p.id} · ${p.unit}`, meta: fmtAmount(p.rate) })), [productPool]);

  const isForeign = !!customer && customer.currency !== BASE_CURRENCY;
  const currencyOpt: Opt | null = customer ? { id: customer.currency, label: CURRENCIES.find((c) => c.id === customer.currency)?.name ?? customer.currency, meta: customer.currency } : { id: BASE_CURRENCY, label: "Nepalese Rupee", meta: BASE_CURRENCY };
  const activeCurrency = customer ? customer.currency : BASE_CURRENCY;
  const fxHint = isForeign ? FX_HINT[customer!.currency] : undefined;

  // ── derived: totals (live) ──
  const totals = React.useMemo<Totals>(() => {
    let subtotal = 0, discount = 0, charges = 0, tax = 0, total = 0;
    for (const l of lines) { const c = computeLine(l); subtotal += c.gross; discount += c.discAmt; charges += c.chargeAmt; tax += c.taxAmt; total += c.net; }
    return { subtotal, discount, charges, tax, total, rows: lines.length };
  }, [lines]);

  // ── derived: validation ──
  const validLines = lines.filter(isLineValid).length;
  const cfMissing = SO_CUSTOM_FIELDS.filter((f) => f.required && cfEmpty(cfValues[f.key])).length;
  const checks: Check[] = [
    { label: "Customer selected", ok: !!customer },
    { label: "Order date set", ok: !!orderDate },
    { label: "Fulfilment location set", ok: !!locationOpt },
    { label: "Currency confirmed", ok: !!currencyOpt },
    ...(isForeign ? [{ label: "Exchange rate entered", ok: (fxRate ?? 0) > 0 }] : []),
    { label: "At least one complete line", ok: validLines > 0 },
    { label: "Required custom fields filled", ok: cfMissing === 0 },
  ];
  const errors = { customer: !customer, date: !orderDate, location: !locationOpt, currency: !currencyOpt, fx: isForeign && !((fxRate ?? 0) > 0) };
  const canSave = checks.every((c) => c.ok) && !posting;

  // ── cascade: apply a customer (reset → repopulate dependents) ──
  const applyCustomer = (cust: Customer) => {
    setCustomer(cust);
    // payment term + derived due date
    const t = termToOpt(cust.termId);
    setTerm(t);
    setDue(orderDate ? addDaysISO(orderDate, TERMS.find((x) => x.id === cust.termId)?.days ?? 0) : null);
    // foreign vs base currency → reveal/hide FX, set rate
    if (cust.currency !== BASE_CURRENCY) setFxRate(undefined); else setFxRate(1);
    // sales rep — lazily fetched, then applied
    setRepLoading(true);
    setRepOpt(null);
    if (repTimer.current) window.clearTimeout(repTimer.current);
    repTimer.current = window.setTimeout(() => { setRepOpt(repToOpt(cust.repId)); setRepLoading(false); }, 620);
    // customer-level tax override cascades onto every existing line
    if (cust.taxOverride) {
      const tc = TAX_CODES.find((x) => x.id === cust.taxOverride);
      setLines((xs) => xs.map((l) => (l.product ? { ...l, taxId: cust.taxOverride!, taxRate: tc?.rate ?? 0, taxLinked: true } : l)));
    }
    touch();
  };
  const selectCustomer = (o: Opt | null) => {
    if (!o) { setCustomer(null); setRepOpt(null); setRepLoading(false); setTerm(null); setDue(null); setFxRate(1); touch(); return; }
    const cust = customerPool.find((c) => c.id === o.id);
    if (cust) applyCustomer(cust);
  };

  // ── cascade: organisation scope re-scopes lookups + resets the rest ──
  const selectSubsidiary = (o: Opt | null) => {
    if (!o || o.id === subOpt?.id) { if (o) setSubOpt(o); return; }
    setSubOpt(o);
    setCustomer(null); setRepOpt(null); setRepLoading(false); setTerm(null); setDue(null);
    setLocationOpt(null); setFxRate(1);
    setDeptOpt(null); setClassOpt(null); setProjectOpt(null); setPartnerOpt(null);
    setCfValues(defaultCF());
    setLines([blankLine()]);
    touch();
    showToast("success", `Reference data re-scoped to ${o.label}. The form was reset.`);
  };

  // ── line handlers ──
  const selectProduct = (lineId: string, o: Opt | null) => {
    setLines((xs) => xs.map((l) => {
      if (l.id !== lineId) return l;
      if (!o) return { ...l, product: null };
      const prod = productPool.find((p) => p.id === o.id);
      if (!prod) return { ...l, product: o };
      const pl = PRICE_LEVELS.find((p) => p.id === l.priceLevelId) ?? PRICE_LEVELS[0];
      const taxCodeId = customer?.taxOverride ?? prod.tax;
      const tc = TAX_CODES.find((t) => t.id === taxCodeId);
      return {
        ...l, product: o, description: prod.desc ?? "", unitId: prod.unit,
        rate: roundDp(prod.rate * pl.factor), priceLevelLinked: true,
        taxId: taxCodeId, taxRate: tc?.rate ?? 0, taxLinked: true,
      };
    }));
    touch();
  };
  const updateLine = (lineId: string, patch: Partial<Line>) => { setLines((xs) => xs.map((l) => (l.id === lineId ? { ...l, ...patch } : l))); touch(); };
  const addLine = () => { setLines((xs) => [...xs, blankLine()]); touch(); };
  const removeLine = (lineId: string) => { setLines((xs) => (xs.length === 1 ? [blankLine()] : xs.filter((l) => l.id !== lineId))); touch(); };

  // ── term → due derivation ──
  const onTerm = (o: Opt | null) => { setTerm(o); const days = TERMS.find((t) => t.id === o?.id)?.days ?? 0; if (orderDate && o) setDue(addDaysISO(orderDate, days)); touch(); };
  const onOrderDate = (iso: string) => { setOrderDate(iso); if (term) setDue(addDaysISO(iso, TERMS.find((t) => t.id === term.id)?.days ?? 0)); touch(); };

  // ── advanced-search / add-new round-trips ──
  const onAdvancedPick = (o: Opt) => {
    if (!advanced) return;
    if (advanced.kind === "customer") selectCustomer(o);
    else if (advanced.kind === "product" && advanced.lineId) selectProduct(advanced.lineId, o);
    else if (advanced.kind === "location") { setLocationOpt(o); touch(); }
  };
  const createCustomer = (c: Customer) => { setCustomerPool((xs) => [c, ...xs]); setCustCreateOpen(false); applyCustomer(c); showToast("success", `${c.name} created and selected.`); };
  const createProduct = (o: Opt) => {
    if (!prodCreate) return;
    const prod: Product = { id: o.id, name: o.label, unit: "pcs", rate: 0, tax: "VAT" };
    setProductPool((xs) => [prod, ...xs]);
    const lineId = prodCreate.lineId;
    setProdCreate(null);
    selectProduct(lineId, o);
    showToast("success", `${o.label} created and added to the line.`);
  };

  // ── reset ──
  const resetForm = () => {
    const fresh = buildSeed("create", undefined);
    setCustomer(null); setRepOpt(null); setRepLoading(false); setTerm(null); setDue(null);
    setOrderDate(fresh.orderDate); setExpectedDate(fresh.expectedDate); setLocationOpt(null); setFxRate(1);
    setDeptOpt(null); setClassOpt(null); setProjectOpt(null); setPartnerOpt(null);
    setCfValues(defaultCF()); setMemo(""); setLines([blankLine()]); setOpenDisc(null); setActiveTab("items");
    setDirty(false);
    showToast("success", "Form reset to a blank order.");
  };

  // ── async submit lifecycle ──
  const handleSave = React.useCallback(() => {
    if (posting) return;
    if (!canSave) { showToast("error", "Complete the required fields before saving."); if (cfMissing > 0) setOpenDisc("custom"); return; }
    setPosting(true);
    window.setTimeout(() => {
      // business-rule rejection: credit-hold customer is bounced to Finance
      if (customer?.creditHold) {
        setPosting(false);
        showToast("warning", `${customer.name} is on credit hold — order routed to Finance for approval.`);
        return;
      }
      setPosting(false);
      setDirty(false);
      showToast("success", `${seed.docNumber} ${mode === "edit" ? "updated" : "created"} — opening the order…`);
      window.setTimeout(() => navigate(`/design/sales-order-list/${seed.docNumber}`), 850);
    }, 950);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posting, canSave, customer, cfMissing, mode, navigate, seed.docNumber, showToast]);

  // Cmd/Ctrl+S to save
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); handleSave(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSave]);

  const counts: Record<TabId, number> = { items: lines.length, activity: activityCount, billing: 0, files: filesCount };

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Sales</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="text-bz-text-muted">Sales Orders</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">{mode === "edit" ? seed.docNumber : "New"}</span>
        </>
      }
      overlay={
        <>
          <DockedActionBar total={totals.total} currency={activeCurrency} rows={validLines} dirty={dirty} saving={posting} canSave={canSave} onReset={resetForm} onSave={handleSave} mode={mode} />
          <Toast toast={toast} onDismiss={() => setToast(null)} />
        </>
      }
    >
      <DocumentHeader
        mode={mode}
        docNumber={seed.docNumber}
        subOpt={subOpt}
        onSub={selectSubsidiary}
        saving={posting}
        canSave={canSave}
        onSave={handleSave}
        onReset={resetForm}
      />

      <div className="grid grid-cols-1 gap-5 px-4 pb-10 pt-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_344px] xl:grid-cols-[minmax(0,1fr)_368px]">
        {/* composition column */}
        <div className="flex min-w-0 flex-col gap-5">
          <CustomerContextCard
            customerOpt={customer ? custToOpt(customer) : null}
            customer={customer}
            onSelectCustomer={selectCustomer}
            customerOptions={customerOptions}
            onAddCustomer={() => setCustCreateOpen(true)}
            onAdvancedCustomer={() => setAdvanced({ kind: "customer", options: customerOptions, label: "Customer" })}
            onViewCustomer={() => customer && showToast("success", `Opening ${customer.name}…`)}
            repOpt={repOpt}
            onRep={(o) => { setRepOpt(o); touch(); }}
            repOptions={repOptions}
            repLoading={repLoading}
            orderDate={orderDate}
            onOrderDate={onOrderDate}
            expectedDate={expectedDate}
            onExpectedDate={(iso) => { setExpectedDate(iso); touch(); }}
            locationOpt={locationOpt}
            onLocation={(o) => { setLocationOpt(o); touch(); }}
            locationOptions={locationOptions}
            onAdvancedLocation={() => setAdvanced({ kind: "location", options: locationOptions, label: "Location" })}
            isForeign={isForeign}
            currencyOpt={currencyOpt}
            fxRate={fxRate}
            onFx={(v) => { setFxRate(v); touch(); }}
            fxHint={fxHint}
            deptOpt={deptOpt} onDept={(o) => { setDeptOpt(o); touch(); }}
            classOpt={classOpt} onClass={(o) => { setClassOpt(o); touch(); }}
            projectOpt={projectOpt} onProject={(o) => { setProjectOpt(o); touch(); }}
            partnerOpt={partnerOpt} onPartner={(o) => { setPartnerOpt(o); touch(); }}
            cfValues={cfValues}
            onCF={(k, v) => { setCfValues((s) => ({ ...s, [k]: v })); touch(); }}
            cfMissing={cfMissing}
            openDisc={openDisc}
            setOpenDisc={setOpenDisc}
            errors={errors}
          />

          {/* content-set switcher — all surfaces stay mounted */}
          <Card>
            <CardHead title="Order contents" />
            <TabBar active={activeTab} onSelect={setActiveTab} counts={counts} />
            <div className={activeTab === "items" ? "" : "hidden"}>
              <LineCollection
                lines={lines}
                productOptions={productOptions}
                currency={activeCurrency}
                onSelectProduct={selectProduct}
                onUpdate={updateLine}
                onRemove={removeLine}
                onAdd={addLine}
                onAddProduct={(lineId) => setProdCreate({ lineId })}
                onAdvancedProduct={(lineId) => setAdvanced({ kind: "product", options: productOptions, label: "Item", lineId })}
                onOpenLot={(lineId) => setInventory({ lineId })}
              />
            </div>
            <div className={activeTab === "activity" ? "" : "hidden"}>
              <div className="border-b border-bz-line-soft p-3.5 md:px-5 md:pt-5">
                <Field label="Order memo / remarks" hint="optional"><Textarea value={memo} onChange={(v) => { setMemo(v); touch(); }} rows={2} placeholder="A short note that travels with the order…" /></Field>
              </div>
              <ActivityEditor onCountChange={setActivityCount} />
            </div>
            <div className={activeTab === "billing" ? "" : "hidden"}>
              <BillingDetails customer={customer} term={term} onTerm={onTerm} due={due} onDue={(iso) => { setDue(iso); touch(); }} orderDate={orderDate} />
            </div>
            <div className={activeTab === "files" ? "" : "hidden"}>
              <FileManager onCountChange={setFilesCount} onToast={(m) => showToast("success", m)} />
            </div>
          </Card>
        </div>

        {/* sticky review rail */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <TotalsRail totals={totals} currency={activeCurrency} isForeign={isForeign} fxRate={fxRate} />
          <ValidationChecklist checks={checks} canSave={canSave} />
          <AdvisoryNote creditHold={!!customer?.creditHold} customerName={customer?.name} />
          <LinkedSource source={seed.source} />
        </div>
      </div>

      {/* modals (component 19/20 + inventory) */}
      <CustomerCreateModal open={custCreateOpen} onClose={() => setCustCreateOpen(false)} onCreate={createCustomer} defaultSub={activeSub} />
      <GenericCreateModal open={!!prodCreate} onClose={() => setProdCreate(null)} onCreate={createProduct} label="Item" />
      <AdvancedSearchModal open={!!advanced} onClose={() => setAdvanced(null)} options={advanced?.options ?? []} onPick={onAdvancedPick} label={advanced?.label ?? "record"} />
      <InventoryModal
        open={!!inventory}
        onClose={() => setInventory(null)}
        line={inventory ? (() => { const l = lines.find((x) => x.id === inventory.lineId); return l ? { name: l.product?.label ?? "this line", qty: l.qty ?? 0 } : null; })() : null}
        onSave={(lot) => { if (inventory) updateLine(inventory.lineId, { lot }); showToast("success", "Inventory detail saved to the line."); }}
      />
    </AppShell>
  );
}

