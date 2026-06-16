import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Search,
  X,
  Check,
  Plus,
  Loader2,
  RotateCcw,
  Pencil,
  AlertTriangle,
  Info,
  Globe,
  Factory,
  ListChecks,
  ArrowUpRight,
  ShieldCheck,
  Inbox,
  Library,
  Layers,
  CreditCard,
  CalendarClock,
  Tag,
  Tags,
  Briefcase,
  Activity,
  Receipt,
  Ship,
  PiggyBank,
  Users,
  MessageSquare,
  Truck,
  Shapes,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNTING MASTER RECORD · CREATE  (one page, many record types)
//
// Primary action = create ONE accounting reference-data record of the active
// TYPE and commit it. Everything is arranged to serve that commit:
//
//   • Type-context header   the TYPE *is* the document identity. Switching it
//                           recomputes the whole field set live (the soul of a
//                           polymorphic form). A "Viewing as" toggle simulates
//                           the platform-level "host" role (real product reads
//                           it from the session, not the UI).
//   • Composition column    a Details card whose fields are DATA-DRIVEN from a
//                           type→fields dictionary, plus a host-only Scope card
//                           (geo/industry scoping whose changes cascade to
//                           re-query a dependent reference picker).
//   • Saved-records rail     host + "mapped" types only — a live browser of
//                           records already saved for the active type; flat
//                           (record × industry × country) rows collapse to one
//                           row per record, ids resolve to names once the lookup
//                           maps load, and it refreshes after every save.
//   • Docked commit footer   the always-visible Save. Gated on validity, shows a
//                           shared busy state, and diverges on success (host
//                           stays + resets + refreshes; others route to a list).
//
// Layout-agnostic brief → this layout is invented for THIS page; it is not a
// relabel of the Sales-Order form. The shared vocabulary is the AppShell, the
// bz-* tokens and the atom idioms.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
let _seq = 0;
const nextId = (p: string) => `${p}-${(++_seq).toString().padStart(3, "0")}`;

// ════════════════════════════════════════════════════════════════════════════
// ICON  (component 8) — resolve a semantic name through a registry, or take a
// raw glyph; decorative (aria-hidden) unless given an accessible label.
// ════════════════════════════════════════════════════════════════════════════

const ICON_REGISTRY: Record<string, LucideIcon> = {
  Layers, CreditCard, CalendarClock, Tag, Tags, Briefcase, Activity,
  Receipt, Ship, PiggyBank, Users, MessageSquare, Truck, Shapes,
};

function Icon({
  name, glyph: Glyph, label, size = 16, className,
}: {
  name?: string;
  glyph?: LucideIcon;
  label?: string;
  size?: number;
  className?: string;
}) {
  const Cmp: LucideIcon = Glyph ?? (name ? ICON_REGISTRY[name] : undefined) ?? Shapes;
  return (
    <Cmp
      size={size}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA  (seeded to reconcile with the house Nepal / NPR ERP context)
// ════════════════════════════════════════════════════════════════════════════

type Lookup = { id: string; name: string };

const INDUSTRIES: Lookup[] = [
  { id: "IND-MFG", name: "Manufacturing" },
  { id: "IND-RET", name: "Retail & Trading" },
  { id: "IND-CON", name: "Construction" },
  { id: "IND-AGR", name: "Agriculture" },
  { id: "IND-PHA", name: "Pharmaceuticals" },
  { id: "IND-TEX", name: "Textiles" },
  { id: "IND-FMC", name: "FMCG" },
  { id: "IND-AUT", name: "Automotive" },
  { id: "IND-LOG", name: "Logistics" },
  { id: "IND-HOS", name: "Hospitality" },
];

const COUNTRIES: Lookup[] = [
  { id: "NP", name: "Nepal" },
  { id: "IN", name: "India" },
  { id: "BD", name: "Bangladesh" },
  { id: "LK", name: "Sri Lanka" },
  { id: "BT", name: "Bhutan" },
  { id: "AE", name: "United Arab Emirates" },
  { id: "SG", name: "Singapore" },
  { id: "GB", name: "United Kingdom" },
  { id: "US", name: "United States" },
  { id: "CN", name: "China" },
];

const SUBSIDIARIES: Lookup[] = [
  { id: "NP-01", name: "Bizak Nepal" },
  { id: "NP-02", name: "Bizak Nepal Pokhara" },
  { id: "IN-01", name: "Bizak India Pvt" },
  { id: "AE-01", name: "Bizak Gulf FZE" },
];

// large-ish server-backed lists (the lazy reference picker)
const GL_ACCOUNTS: Opt[] = [
  { id: "GL-4100", label: "Sales Revenue", sub: "4100 · Income" },
  { id: "GL-4200", label: "Service Revenue", sub: "4200 · Income" },
  { id: "GL-4300", label: "Freight Recovered", sub: "4300 · Income" },
  { id: "GL-5100", label: "Cost of Goods Sold", sub: "5100 · Expense" },
  { id: "GL-5200", label: "Carriage Inward", sub: "5200 · Expense" },
  { id: "GL-6100", label: "Handling Charges", sub: "6100 · Expense" },
  { id: "GL-6200", label: "Installation Income", sub: "6200 · Income" },
  { id: "GL-6300", label: "Packing & Forwarding", sub: "6300 · Expense" },
  { id: "GL-7100", label: "Discount Allowed", sub: "7100 · Expense" },
  { id: "GL-7200", label: "Rounding Difference", sub: "7200 · Expense" },
  { id: "GL-2100", label: "VAT Payable", sub: "2100 · Liability" },
  { id: "GL-2200", label: "TDS Payable", sub: "2200 · Liability" },
  { id: "GL-1200", label: "Trade Receivables", sub: "1200 · Asset" },
  { id: "GL-1300", label: "Advance to Suppliers", sub: "1300 · Asset" },
];

const BUDGET_PARENTS: Opt[] = [
  { id: "BC-OPEX", label: "Operating Expenditure", sub: "OPEX" },
  { id: "BC-CAPEX", label: "Capital Expenditure", sub: "CAPEX" },
  { id: "BC-REV", label: "Revenue Budget", sub: "REV" },
  { id: "BC-PAY", label: "Payroll & Benefits", sub: "PAY" },
  { id: "BC-MKT", label: "Marketing & Growth", sub: "MKT" },
  { id: "BC-RND", label: "Research & Development", sub: "RND" },
  { id: "BC-ADM", label: "Administration", sub: "ADM" },
  { id: "BC-FAC", label: "Facilities & Utilities", sub: "FAC" },
];

// the cascading dependent picker — tax authorities tagged by country
const TAX_AUTHORITIES: (Opt & { country: string })[] = [
  { id: "TA-NP-IRD", label: "Inland Revenue Department", sub: "Nepal", country: "NP" },
  { id: "TA-NP-LTO", label: "Large Taxpayers Office", sub: "Nepal", country: "NP" },
  { id: "TA-IN-GST", label: "GST Network", sub: "India", country: "IN" },
  { id: "TA-IN-CBIC", label: "CBIC", sub: "India", country: "IN" },
  { id: "TA-AE-FTA", label: "Federal Tax Authority", sub: "UAE", country: "AE" },
  { id: "TA-SG-IRAS", label: "IRAS", sub: "Singapore", country: "SG" },
  { id: "TA-GB-HMRC", label: "HM Revenue & Customs", sub: "United Kingdom", country: "GB" },
  { id: "TA-BD-NBR", label: "National Board of Revenue", sub: "Bangladesh", country: "BD" },
  { id: "TA-LK-IRD", label: "Inland Revenue (LK)", sub: "Sri Lanka", country: "LK" },
];

const INDUSTRY_MAP = Object.fromEntries(INDUSTRIES.map((x) => [x.id, x.name]));
const COUNTRY_MAP = Object.fromEntries(COUNTRIES.map((x) => [x.id, x.name]));

const toOpt = (l: Lookup): Opt => ({ id: l.id, label: l.name });

// ════════════════════════════════════════════════════════════════════════════
// TYPE → FIELDS DICTIONARY  (the data-driven core, component 2 + cross-cutting)
// ════════════════════════════════════════════════════════════════════════════

type FieldKind = "text" | "textarea" | "number" | "choice" | "ref" | "multi" | "switch";

type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  compact?: boolean; // half-width in the responsive grid
  placeholder?: string;
  hint?: string;
  suffix?: string;
  helper?: string; // switch helper line
  options?: string[]; // choice (in-memory)
  noneLabel?: string; // choice optional "no selection" entry
  source?: "gl" | "budget"; // ref-picker source
};

const FIELDS: Record<string, FieldDef> = {
  code: { key: "code", label: "Code", kind: "text", required: true, compact: true, placeholder: "e.g. FOB", hint: "Short identifier" },
  name: { key: "name", label: "Name", kind: "text", required: true, placeholder: "Give this record a clear name" },
  description: { key: "description", label: "Description", kind: "textarea", placeholder: "Optional notes shown to back-office staff" },
  message: { key: "message", label: "Message text", kind: "textarea", required: true, placeholder: "The message shown on customer documents" },
  rate: { key: "rate", label: "Rate", kind: "number", compact: true, suffix: "%", placeholder: "0.00", hint: "Leave blank for none" },
  days: { key: "days", label: "Net days", kind: "number", required: true, compact: true, suffix: "days", placeholder: "0" },
  costType: {
    key: "costType", label: "Cost type", kind: "choice", required: true, compact: true,
    options: ["Direct", "Indirect", "Overhead", "Capitalised"],
  },
  statusClass: {
    key: "statusClass", label: "Status class", kind: "choice", compact: true,
    options: ["Open", "In progress", "On hold", "Won", "Lost", "Closed"],
    noneLabel: "No class",
  },
  parent: { key: "parent", label: "Parent budget category", kind: "ref", required: true, source: "budget", placeholder: "Select a parent…" },
  glAccount: { key: "glAccount", label: "Linked GL account", kind: "ref", source: "gl", placeholder: "Search accounts…" },
  subsidiary: { key: "subsidiary", label: "Subsidiary scope", kind: "multi", placeholder: "All subsidiaries", hint: "Optional" },
  active: { key: "active", label: "Active", kind: "switch", helper: "Inactive records are hidden from new transactions." },
};

type RecordType = {
  id: string;
  label: string;
  group: string;
  icon: string;
  mapped?: boolean; // host gets scope + the saved-records browser
  fields: string[];
  blurb: string;
};

const TYPES: RecordType[] = [
  { id: "cost-category", label: "Cost Category", group: "Costing", icon: "Layers", fields: ["name", "costType", "description", "subsidiary", "active"], blurb: "Buckets that classify expenditure across the ledger." },
  { id: "payment-method", label: "Payment Method", group: "Receivables", icon: "CreditCard", fields: ["name", "description", "active"], blurb: "How customers settle — cash, cheque, wallet, transfer." },
  { id: "payment-term", label: "Payment Term", group: "Receivables", icon: "CalendarClock", fields: ["name", "days", "description", "active"], blurb: "Credit windows that derive document due dates." },
  { id: "price-level", label: "Price Level", group: "Pricing", icon: "Tag", fields: ["name", "rate", "description", "active"], blurb: "Tiered price adjustments applied to items." },
  { id: "price-group", label: "Price Group", group: "Pricing", icon: "Tags", fields: ["name", "description", "active"], blurb: "Group customers that share a price list." },
  { id: "job-type", label: "Job Type", group: "Jobs", icon: "Briefcase", fields: ["name", "description", "active"], blurb: "Classify project & service jobs." },
  { id: "job-status", label: "Job Status", group: "Jobs", icon: "Activity", fields: ["name", "statusClass", "description", "active"], blurb: "Lifecycle stages a job moves through." },
  { id: "charge-type", label: "Charge Type", group: "Billing", icon: "Receipt", fields: ["name", "rate", "glAccount", "description", "active"], blurb: "Freight, handling & other line charges." },
  { id: "incoterm", label: "Incoterm", group: "Trade", icon: "Ship", fields: ["code", "name", "description", "active"], blurb: "International commercial delivery terms." },
  { id: "budget-category", label: "Budget Category", group: "Budgeting", icon: "PiggyBank", fields: ["name", "parent", "description", "active"], blurb: "Hierarchy that budgets roll up into." },
  { id: "customer-category", label: "Customer Category", group: "Parties", icon: "Users", mapped: true, fields: ["name", "description", "subsidiary", "active"], blurb: "Segment customers for pricing & reporting." },
  { id: "customer-message", label: "Customer Message", group: "Parties", icon: "MessageSquare", fields: ["name", "message", "active"], blurb: "Reusable notes printed on customer documents." },
  { id: "vendor-category", label: "Vendor Category", group: "Parties", icon: "Truck", mapped: true, fields: ["name", "description", "subsidiary", "active"], blurb: "Segment vendors for sourcing & analysis." },
  { id: "other-category", label: "Other Category", group: "Misc", icon: "Shapes", fields: ["name", "description", "active"], blurb: "A catch-all reference list." },
];

const TYPE_BY_ID = Object.fromEntries(TYPES.map((t) => [t.id, t]));

// ── seeded saved records (flat: one row per record × industry × country) ──
type RawRecord = { recId: string; name: string; industryId: string; countryId: string; active: boolean };

const SEED_RECORDS: Record<string, RawRecord[]> = {
  "customer-category": [
    { recId: "CC-01", name: "Key Accounts", industryId: "IND-MFG", countryId: "NP", active: true },
    { recId: "CC-01", name: "Key Accounts", industryId: "IND-MFG", countryId: "IN", active: true },
    { recId: "CC-01", name: "Key Accounts", industryId: "IND-RET", countryId: "NP", active: true },
    { recId: "CC-02", name: "Distributors", industryId: "IND-FMC", countryId: "NP", active: true },
    { recId: "CC-02", name: "Distributors", industryId: "IND-LOG", countryId: "IN", active: true },
    { recId: "CC-03", name: "Walk-in Retail", industryId: "IND-RET", countryId: "NP", active: false },
    { recId: "CC-04", name: "Government & PSU", industryId: "IND-CON", countryId: "NP", active: true },
    { recId: "CC-04", name: "Government & PSU", industryId: "IND-CON", countryId: "BD", active: true },
  ],
  // vendor-category seeded empty → demonstrates the "create the first record" state
  "vendor-category": [],
};

// ════════════════════════════════════════════════════════════════════════════
// SHARED PICKER HOOKS  anchored portal + dismiss-on-outside/esc/scroll
// ════════════════════════════════════════════════════════════════════════════

type Opt = { id: string; label: string; sub?: string; meta?: string };

function useAnchoredPos(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) { setPos(null); return; }
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, anchorRef]);
  return pos;
}

function useDismiss(
  open: boolean,
  onClose: () => void,
  panelRef: React.RefObject<HTMLElement | null>,
  anchorRef: React.RefObject<HTMLElement | null>,
) {
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    const onScroll = (e: Event) => { if (panelRef.current && e.target instanceof Node && panelRef.current.contains(e.target)) return; onClose(); };
    const onResize = () => onClose(); // the panel is positioned at fixed coords — close rather than float detached
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, onClose, panelRef, anchorRef]);
}

const PANEL = "z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]";

// ════════════════════════════════════════════════════════════════════════════
// LABELLED FIELD  (component 7) — label + optional required marker + slot
// ════════════════════════════════════════════════════════════════════════════

function Req() {
  return <span className="ml-0.5 text-bz-fire" title="Required">*</span>;
}

function Field({
  label, required, hint, htmlFor, className, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[11px] font-medium text-bz-text-muted">
          {label}{required && <Req />}
        </label>
        {hint && <span className="text-[10px] text-bz-text-soft">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── plain inputs ──
const INPUT_BASE = "h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[13px] text-bz-text outline-none transition-colors placeholder:text-bz-text-soft focus:border-bz-text";

function TextInput({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder?: string; id?: string }) {
  return <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT_BASE} />;
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2 text-[13px] leading-relaxed text-bz-text outline-none transition-colors placeholder:text-bz-text-soft focus:border-bz-text"
    />
  );
}

// numeric input — empty string coerces to null/undefined
function NumberInput({
  value, onChange, placeholder, suffix, id,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  suffix?: string;
  id?: string;
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
    <div className="flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 transition-colors focus-within:border-bz-text">
      <input
        id={id}
        inputMode="decimal"
        value={raw}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || /^-?\d*\.?\d*$/.test(v)) {
            setRaw(v);
            onChange(v === "" || v === "-" || v === "." ? undefined : Number(v));
          }
        }}
        className={cn("h-full w-full bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft", NUM)}
      />
      {suffix && <span className="ml-1.5 shrink-0 text-[11px] text-bz-text-soft">{suffix}</span>}
    </div>
  );
}

// ── boolean switch (component 6) with optional cascade hook ──
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

// a switch presented as a full-width settings row (label + helper + switch)
function ToggleRow({
  label, helper, value, onChange, disabled,
}: {
  label: string;
  helper?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-bz-text">{label}</p>
        {helper && <p className="mt-0.5 text-[11px] text-bz-text-muted">{helper}</p>}
      </div>
      <Switch value={value} onChange={onChange} disabled={disabled} ariaLabel={label} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CHOICE SELECT  (component 3) — single-select, client-filtered, in-memory,
// optional "no selection" entry. States: empty · selected · no-match · disabled.
// ════════════════════════════════════════════════════════════════════════════

function ChoiceSelect({
  value, onChange, options, placeholder = "Select…", noneLabel, disabled, error,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: string[];
  placeholder?: string;
  noneLabel?: string;
  disabled?: boolean;
  error?: boolean;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const pos = useAnchoredPos(open, btnRef);
  useDismiss(open, () => setOpen(false), panelRef, btnRef);
  React.useEffect(() => { if (open) { setQ(""); const t = window.setTimeout(() => inputRef.current?.focus(), 10); return () => window.clearTimeout(t); } }, [open]);

  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q.toLowerCase())) : options;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-3 text-left transition-colors",
          disabled ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
          error && "border-[#C0413A]",
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate text-[13px]", value ? "text-bz-text" : "text-bz-text-soft")}>{value ?? placeholder}</span>
        {value && !disabled ? (
          <span role="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={11} />
          </span>
        ) : (!disabled && <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />)}
      </button>

      {open && pos && createPortal(
        <div ref={panelRef} style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 200) }} className={PANEL}>
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={12} className="shrink-0 text-bz-text-muted" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {noneLabel && !q && (
              <button onClick={() => { onChange(null); setOpen(false); }} className="flex w-full items-center px-3 py-2 text-left text-[12.5px] text-bz-text-muted italic hover:bg-bz-paper-warm">{noneLabel}</button>
            )}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-3 py-6 text-center">
                <Search size={15} className="text-bz-text-soft" />
                <p className="text-[11.5px] font-medium text-bz-text-muted">No matches for “{q}”</p>
              </div>
            ) : (
              filtered.map((o) => {
                const sel = o === value;
                return (
                  <button key={o} onClick={() => { onChange(o); setOpen(false); }} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-bz-text hover:bg-bz-paper-warm", sel && "bg-bz-fire/[0.06]")}>
                    <span className="min-w-0 flex-1 truncate">{o}</span>
                    {sel && <Check size={13} className="shrink-0 text-bz-text" />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE PICKER  (component 4) — searchable, debounced re-query, lazy
// paginate on scroll, auto-select-first when required, view / add / advanced.
// States: loading · loading-more · empty · selected · disabled · (re-querying).
// ════════════════════════════════════════════════════════════════════════════

const REF_PAGE = 6;

function RefPicker({
  value, onChange, options, placeholder = "Select…",
  required, disabled, error, autoFirst, requerying, sourceLabel,
  onAddNew, onAdvanced, onView,
}: {
  value: Opt | null;
  onChange: (o: Opt | null) => void;
  options: Opt[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  autoFirst?: boolean;
  requerying?: boolean;
  sourceLabel?: string;
  onAddNew?: () => void;
  onAdvanced?: () => void;
  onView?: () => void;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [more, setMore] = React.useState(false);
  const pos = useAnchoredPos(open, btnRef);
  useDismiss(open, () => setOpen(false), panelRef, btnRef);

  // auto-select first option when the field is required and still unset
  React.useEffect(() => {
    if (autoFirst && required && !value && !disabled && options.length) onChange(options[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFirst, required, value, disabled, options.length]);

  React.useEffect(() => { if (open) { setRaw(""); setQuery(""); setPages(1); const t = window.setTimeout(() => inputRef.current?.focus(), 10); return () => window.clearTimeout(t); } }, [open]);

  // debounced search → simulated re-query
  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = window.setTimeout(() => { setQuery(raw.trim().toLowerCase()); setPages(1); setLoading(false); }, 230);
    return () => window.clearTimeout(t);
  }, [raw, open]);

  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query) || (o.sub ?? "").toLowerCase().includes(query)) : options;
  const visible = filtered.slice(0, pages * REF_PAGE);
  const hasMore = visible.length < filtered.length;

  const onScrollList = () => {
    const el = listRef.current;
    if (!el || more || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setMore(true);
      window.setTimeout(() => { setPages((p) => p + 1); setMore(false); }, 360);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-3 text-left transition-colors",
          disabled ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
          error && "border-[#C0413A]",
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate text-[13px]", value ? "text-bz-text" : "text-bz-text-soft")}>
          {value ? value.label : placeholder}
        </span>
        {requerying && !disabled ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-bz-text-muted">
            <Loader2 size={11} className="animate-spin text-bz-fire" /> Updating
          </span>
        ) : value && !required && !disabled ? (
          <span role="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={11} />
          </span>
        ) : (!disabled && <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />)}
      </button>

      {value && onView && (
        <button onClick={onView} className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-medium text-bz-text-muted hover:text-bz-text">
          <ArrowUpRight size={10} /> Open {value.label}
        </button>
      )}

      {open && pos && createPortal(
        <div ref={panelRef} style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 260) }} className={PANEL}>
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={12} className="shrink-0 text-bz-text-muted" />
              <input ref={inputRef} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={sourceLabel ? `Search ${sourceLabel.toLowerCase()}…` : "Search…"} className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
              {raw && <button onClick={() => setRaw("")} aria-label="Clear" className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"><X size={10} /></button>}
            </div>
          </div>

          <div ref={listRef} onScroll={onScrollList} className="max-h-[252px] overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-bz-text-muted"><Loader2 size={13} className="animate-spin text-bz-fire" /> <span className="text-[11.5px]">Searching…</span></div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-3 py-7 text-center"><Search size={15} className="text-bz-text-soft" /><p className="text-[11.5px] font-medium text-bz-text-muted">{raw ? `No matches for “${raw}”` : "No options available"}</p></div>
            ) : (
              visible.map((o) => {
                const sel = value?.id === o.id;
                return (
                  <button key={o.id} onClick={() => { onChange(o); setOpen(false); }} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm", sel && "bg-bz-fire/[0.06]")}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                      {o.sub && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{o.sub}</span>}
                    </span>
                    {sel && <Check size={13} className="shrink-0 text-bz-text" />}
                  </button>
                );
              })
            )}
            {more && <div className="flex items-center justify-center gap-2 py-2.5 text-bz-text-muted"><Loader2 size={12} className="animate-spin text-bz-fire" /> <span className="text-[11px]">Loading more…</span></div>}
            {!more && !hasMore && !loading && visible.length > 0 && filtered.length > REF_PAGE && <p className={cn("px-3 py-2 text-center text-[10px] text-bz-text-soft", NUM)}>{filtered.length} results · end of list</p>}
          </div>

          {(onAddNew || onAdvanced) && (
            <div className="flex items-center gap-1 border-t border-bz-line-soft bg-bz-paper-warm/40 p-1.5">
              {onAddNew && <button onClick={() => { setOpen(false); onAddNew(); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-bz-sm px-2 py-1.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-surface"><Plus size={12} className="text-bz-leaf-deep" /> Add new</button>}
              {onAdvanced && <button onClick={() => { setOpen(false); onAdvanced(); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-bz-sm px-2 py-1.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-surface hover:text-bz-text"><ListChecks size={12} /> Advanced</button>}
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MULTI-SELECT  (component 5) — chips with +N overflow, clear-all, type-ahead.
// States: empty · selected (chips + overflow) · open/closed · no-data · disabled.
// ════════════════════════════════════════════════════════════════════════════

const CHIP_CAP = 3;

function MultiPicker({
  value, onChange, options, placeholder = "Select…", disabled, icon: LeadIcon,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: Opt[];
  placeholder?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  const btnRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const pos = useAnchoredPos(open, btnRef);
  useDismiss(open, () => setOpen(false), panelRef, btnRef);
  React.useEffect(() => { if (open) { setQ(""); const t = window.setTimeout(() => inputRef.current?.focus(), 10); return () => window.clearTimeout(t); } }, [open]);

  const byId = React.useMemo(() => Object.fromEntries(options.map((o) => [o.id, o])), [options]);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : options;

  const shown = value.slice(0, CHIP_CAP);
  const extra = value.length - shown.length;

  return (
    <>
      <div
        ref={btnRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen((v) => !v); } }}
        className={cn(
          "flex min-h-9 w-full items-center gap-1.5 rounded-bz-md border px-2 py-1.5 text-left transition-colors",
          disabled ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        )}
      >
        {LeadIcon && <LeadIcon size={13} className="ml-0.5 shrink-0 text-bz-text-muted" />}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {value.length === 0 ? (
            <span className="px-1 text-[13px] text-bz-text-soft">{placeholder}</span>
          ) : (
            <>
              {shown.map((id) => (
                <span key={id} className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm py-0.5 pl-2 pr-1 text-[11.5px] font-medium text-bz-text">
                  {byId[id]?.label ?? id}
                  {!disabled && (
                    <span role="button" aria-label={`Remove ${byId[id]?.label ?? id}`} onClick={(e) => { e.stopPropagation(); toggle(id); }} className="flex size-3.5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/60 hover:text-bz-text">
                      <X size={10} />
                    </span>
                  )}
                </span>
              ))}
              {extra > 0 && <span className={cn("rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[11px] font-semibold text-bz-text", NUM)}>+{extra} more</span>}
            </>
          )}
        </div>
        {value.length > 0 && !disabled && (
          <span role="button" aria-label="Clear all" onClick={(e) => { e.stopPropagation(); onChange([]); }} className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={12} />
          </span>
        )}
        {!disabled && <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />}
      </div>

      {open && pos && createPortal(
        <div ref={panelRef} style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 240) }} className={PANEL}>
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={12} className="shrink-0 text-bz-text-muted" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-3 py-7 text-center"><Inbox size={15} className="text-bz-text-soft" /><p className="text-[11.5px] font-medium text-bz-text-muted">No options to choose from</p></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-3 py-6 text-center"><Search size={15} className="text-bz-text-soft" /><p className="text-[11.5px] font-medium text-bz-text-muted">No matches for “{q}”</p></div>
            ) : (
              filtered.map((o) => {
                const on = value.includes(o.id);
                return (
                  <button key={o.id} onClick={() => toggle(o.id)} className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm", on && "bg-bz-fire/[0.06]")}>
                    <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-bz-sm border transition-colors", on ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface text-transparent")}><Check size={12} strokeWidth={3} /></span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-bz-text">{o.label}</span>
                  </button>
                );
              })
            )}
          </div>
          {value.length > 0 && (
            <div className="flex items-center justify-between border-t border-bz-line-soft bg-bz-paper-warm/40 px-3 py-1.5">
              <span className={cn("text-[10.5px] text-bz-text-muted", NUM)}>{value.length} selected</span>
              <button onClick={() => onChange([])} className="text-[11px] font-medium text-bz-text-muted hover:text-bz-text">Clear all</button>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STATUS INDICATOR  (component 10) — binary active / inactive marker
// ════════════════════════════════════════════════════════════════════════════

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[10.5px] font-medium", active ? "bg-bz-fire/[0.18] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>
      <span className={cn("size-1.5 rounded-bz-pill", active ? "bg-bz-leaf-deep" : "bg-bz-text-soft")} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TYPE SWITCHER  the record type IS the document identity. A grouped, filterable
// chooser (component 3 applied to the type) — switching recomputes the field set.
// ════════════════════════════════════════════════════════════════════════════

function TypeSwitcher({ type, onPick, disabled }: { type: RecordType; onPick: (t: RecordType) => void; disabled?: boolean }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const pos = useAnchoredPos(open, btnRef);
  useDismiss(open, () => setOpen(false), panelRef, btnRef);
  React.useEffect(() => { if (open) { setQ(""); const t = window.setTimeout(() => inputRef.current?.focus(), 10); return () => window.clearTimeout(t); } }, [open]);

  const query = q.trim().toLowerCase();
  const matches = query ? TYPES.filter((t) => t.label.toLowerCase().includes(query) || t.group.toLowerCase().includes(query)) : TYPES;
  const groups = React.useMemo(() => {
    const m = new Map<string, RecordType[]>();
    matches.forEach((t) => { const a = m.get(t.group) ?? []; a.push(t); m.set(t.group, a); });
    return Array.from(m.entries());
  }, [matches]);

  return (
    <div className="min-w-0">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex min-w-0 items-center gap-3 rounded-bz-lg border border-transparent px-1.5 py-1 text-left transition-colors",
          disabled ? "cursor-default opacity-60" : "hover:bg-bz-paper-warm",
        )}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-bz-lg bg-bz-fire/[0.18] text-bz-text">
          <Icon name={type.icon} label={type.label} size={20} />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-[20px] font-semibold tracking-tight text-bz-text">New {type.label}</span>
            <ChevronDown size={15} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
            <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-muted">{type.group}</span>
            <span className="truncate">{type.blurb}</span>
          </span>
        </span>
      </button>

      {open && pos && createPortal(
        <div ref={panelRef} style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 320) }} className={PANEL}>
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={12} className="shrink-0 text-bz-text-muted" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a record type…" className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
            </div>
          </div>
          <div className="max-h-[360px] overflow-y-auto py-1">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-3 py-7 text-center"><Search size={15} className="text-bz-text-soft" /><p className="text-[11.5px] font-medium text-bz-text-muted">No types match “{q}”</p></div>
            ) : (
              groups.map(([group, items]) => (
                <div key={group} className="mb-1 last:mb-0">
                  <p className="px-3 pb-1 pt-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">{group}</p>
                  {items.map((t) => {
                    const sel = t.id === type.id;
                    return (
                      <button key={t.id} onClick={() => { onPick(t); setOpen(false); }} className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm", sel && "bg-bz-fire/[0.06]")}>
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted"><Icon name={t.icon} size={14} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-medium text-bz-text">{t.label}</span>
                          <span className={cn("block text-[10px] text-bz-text-soft", NUM)}>{t.fields.length} fields{t.mapped ? " · scoped" : ""}</span>
                        </span>
                        {t.mapped && <span className="shrink-0 rounded-bz-sm bg-bz-leaf/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-bz-text">Mapped</span>}
                        {sel && <Check size={13} className="shrink-0 text-bz-text" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SAVED-RECORDS BROWSER  (components 9 / 10 / 11) — host + mapped types only
// ════════════════════════════════════════════════════════════════════════════

type Grouped = { recId: string; name: string; industries: string[]; countries: string[]; active: boolean };

function groupRows(rows: RawRecord[]): Grouped[] {
  const m = new Map<string, Grouped>();
  rows.forEach((r) => {
    const g = m.get(r.recId) ?? { recId: r.recId, name: r.name, industries: [], countries: [], active: r.active };
    if (!g.industries.includes(r.industryId)) g.industries.push(r.industryId);
    if (!g.countries.includes(r.countryId)) g.countries.push(r.countryId);
    m.set(r.recId, g);
  });
  return Array.from(m.values());
}

function ScopeChips({ icon: LeadIcon, ids, map, ready }: { icon: LucideIcon; ids: string[]; map: Record<string, string>; ready: boolean }) {
  if (ids.length === 0) return null;
  const shown = ids.slice(0, 2);
  const extra = ids.length - shown.length;
  return (
    <span className="inline-flex items-center gap-1.5">
      <LeadIcon size={11} className="shrink-0 text-bz-text-soft" />
      {shown.map((id) => (
        <span key={id} className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] text-bz-text-muted", !ready && NUM)}>
          {ready ? (map[id] ?? id) : id}
        </span>
      ))}
      {extra > 0 && <span className={cn("text-[10.5px] font-medium text-bz-text-soft", NUM)}>+{extra}</span>}
    </span>
  );
}

function RecordsBrowser({
  type, records, state, lookupsReady, onRefresh, onEdit,
}: {
  type: RecordType;
  records: Grouped[];
  state: "loading" | "ready";
  lookupsReady: boolean;
  onRefresh: () => void;
  onEdit: (g: Grouped) => void;
}) {
  return (
    <aside className="flex flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex items-center justify-between gap-2 border-b border-bz-line-soft bg-bz-paper-warm/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-[12.5px] font-semibold text-bz-text">Saved {type.label.toLowerCase()} records</p>
          <span className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-bz-pill bg-bz-paper-warm px-1.5 text-[10.5px] font-semibold text-bz-text-muted", NUM)}>
            {state === "loading" ? "…" : records.length}
          </span>
        </div>
        <button onClick={onRefresh} disabled={state === "loading"} aria-label="Refresh" title="Refresh" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-50">
          <RotateCcw size={13} className={state === "loading" ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="min-h-0 flex-1">
        {state === "loading" ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-bz-md border border-bz-line-soft p-3">
                <div className="h-3 w-1/2 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
                <div className="mt-2.5 h-2.5 w-3/4 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Inbox size={20} /></span>
            <p className="text-[13px] font-semibold text-bz-text">No records yet</p>
            <p className="max-w-[220px] text-[11.5px] text-bz-text-muted">Create the first {type.label.toLowerCase()} with the form — it’ll appear here the moment it’s saved.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-bz-line-soft">
            {records.map((g) => (
              <div key={g.recId} className="group flex items-start justify-between gap-2 px-4 py-3 transition-colors hover:bg-bz-paper-warm/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[12.5px] font-medium text-bz-text">{g.name}</span>
                    <StatusDot active={g.active} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <ScopeChips icon={Factory} ids={g.industries} map={INDUSTRY_MAP} ready={lookupsReady} />
                    <ScopeChips icon={Globe} ids={g.countries} map={COUNTRY_MAP} ready={lookupsReady} />
                  </div>
                </div>
                <button onClick={() => onEdit(g)} aria-label={`Edit ${g.name}`} title="Edit" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted opacity-0 transition-opacity hover:bg-bz-paper-warm hover:text-bz-text group-hover:opacity-100">
                  <Pencil size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!lookupsReady && state === "ready" && records.length > 0 && (
        <div className="flex items-center gap-1.5 border-t border-bz-line-soft px-4 py-2 text-[10.5px] text-bz-text-soft">
          <Loader2 size={10} className="animate-spin" /> Resolving industry &amp; country names…
        </div>
      )}
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

type ToastState = { kind: "success" | "error"; message: string; id: number } | null;

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const ok = toast.kind === "success";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", ok ? "bg-bz-fire/[0.22]" : "bg-[#FBE7E5]")}>
          {ok ? <Check size={13} className="text-bz-leaf-deep" /> : <AlertTriangle size={12} className="text-[#9A2E29]" />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED COMMIT FOOTER  (component 1) — validity gate + shared busy state
// ════════════════════════════════════════════════════════════════════════════

function CommitFooter({
  saving, valid, statusText, onCancel, onSave,
}: {
  saving: boolean;
  valid: boolean;
  statusText: string;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="border-t border-bz-line bg-bz-paper px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3">
        <p className={cn("flex min-w-0 items-center gap-1.5 text-[11.5px]", saving ? "text-bz-text-muted" : valid ? "text-bz-text-muted" : "text-[#9A2E29]")}>
          {saving ? <Loader2 size={12} className="shrink-0 animate-spin text-bz-fire" /> : valid ? <Check size={12} className="shrink-0 text-bz-leaf-deep" /> : <AlertTriangle size={12} className="shrink-0" />}
          <span className="truncate">{statusText}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={onCancel} disabled={saving} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-semibold text-bz-text transition-colors hover:bg-bz-paper-warm disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onSave} disabled={!valid || saving} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {saving ? "Saving…" : "Save record"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION SHELL
// ════════════════════════════════════════════════════════════════════════════

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface", className)}>{children}</div>;
}

function CardHead({ label, desc, badge, icon: LeadIcon }: { label: string; desc?: string; badge?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-3.5">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
          {LeadIcon && <LeadIcon size={11} />} {label}
        </p>
        {desc && <p className="mt-1 text-[11.5px] text-bz-text-muted">{desc}</p>}
      </div>
      {badge}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIELD RENDERER  maps a FieldDef → the right control, bound to form state
// ════════════════════════════════════════════════════════════════════════════

function fieldSpan(def: FieldDef) {
  return def.kind === "switch" ? "" : def.compact ? "" : "sm:col-span-2";
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

const DEFAULT_TYPE = TYPE_BY_ID["customer-category"];

function defaultsFor(type: RecordType): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  type.fields.forEach((k) => {
    const def = FIELDS[k];
    if (def.kind === "switch") v[k] = k === "active";
    else if (def.kind === "multi") v[k] = [];
    else if (def.kind === "number") v[k] = undefined;
    else if (def.kind === "ref" || def.kind === "choice") v[k] = null;
    else v[k] = "";
  });
  return v;
}

function isFilled(def: FieldDef, val: unknown): boolean {
  switch (def.kind) {
    case "text": case "textarea": return typeof val === "string" && val.trim().length > 0;
    case "number": return val != null;
    case "choice": return val != null && val !== "";
    case "ref": return !!val;
    case "multi": return Array.isArray(val) && val.length > 0;
    case "switch": return true;
  }
}

type Scope = { industries: string[]; countries: string[]; taxAuthority: Opt | null; applyToChild: boolean };
const EMPTY_SCOPE: Scope = { industries: [], countries: [], taxAuthority: null, applyToChild: false };

function computeTaxOptions(countries: string[]): Opt[] {
  const pool = countries.length === 0 ? TAX_AUTHORITIES : TAX_AUTHORITIES.filter((t) => countries.includes(t.country));
  return pool.map(({ id, label, sub }) => ({ id, label, sub }));
}

export function MasterRecordFormDesignPage() {
  const navigate = useNavigate();

  // ── active type (route/query param in production; switchable here) ──
  const [type, setType] = React.useState<RecordType>(DEFAULT_TYPE);
  // ── simulated platform-level "host" role (session-derived in production) ──
  const [isHost, setIsHost] = React.useState(true);

  // ── data-driven form state ──
  const [values, setValues] = React.useState<Record<string, unknown>>(() => defaultsFor(DEFAULT_TYPE));
  const [scope, setScope] = React.useState<Scope>(EMPTY_SCOPE);
  const setVal = (k: string, v: unknown) => setValues((prev) => ({ ...prev, [k]: v }));

  const showScope = isHost && !!type.mapped; // scope card + browser gated on role + type class
  const showBrowser = showScope;

  // recompute the field set whenever the active type changes (locked mid-save)
  const switchType = (t: RecordType) => {
    if (saving) return;
    setType(t);
    setValues(defaultsFor(t));
    setScope(EMPTY_SCOPE);
  };

  // ── title management (global title service) ──
  React.useEffect(() => { document.title = `New ${type.label} · Bizak`; }, [type.label]);
  React.useEffect(() => () => { document.title = "Bizak"; }, []);

  // ── cascading re-query: countries → tax-authority options ──
  const [taxOptions, setTaxOptions] = React.useState<Opt[]>(() => computeTaxOptions([]));
  const [taxRequerying, setTaxRequerying] = React.useState(false);
  React.useEffect(() => {
    if (!showScope) return;
    setTaxRequerying(true);
    const t = window.setTimeout(() => {
      const opts = computeTaxOptions(scope.countries);
      setTaxOptions(opts);
      setScope((s) => (s.taxAuthority && !opts.some((o) => o.id === s.taxAuthority!.id) ? { ...s, taxAuthority: null } : s));
      setTaxRequerying(false);
    }, 480);
    return () => window.clearTimeout(t);
  }, [scope.countries, showScope]);

  // ── saved-records browser store + lifecycle ──
  const storeRef = React.useRef<Record<string, Grouped[]>>(
    Object.fromEntries(Object.entries(SEED_RECORDS).map(([k, rows]) => [k, groupRows(rows)])),
  );
  const [records, setRecords] = React.useState<Grouped[]>([]);
  const [recordsState, setRecordsState] = React.useState<"loading" | "ready">("loading");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!showBrowser) return;
    setRecordsState("loading");
    const t = window.setTimeout(() => {
      setRecords([...(storeRef.current[type.id] ?? [])]);
      setRecordsState("ready");
    }, 700);
    return () => window.clearTimeout(t);
  }, [showBrowser, type.id, reloadKey]);

  // ── lookup maps load asynchronously (id→name); list re-renders once ready ──
  const [lookupsReady, setLookupsReady] = React.useState(false);
  React.useEffect(() => {
    const t = window.setTimeout(() => setLookupsReady(true), 1400);
    return () => window.clearTimeout(t);
  }, []);

  // ── flow ──
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const showToast = (kind: "success" | "error", message: string) => setToast({ kind, message, id: ++toastId.current });

  // ── validation (live) ──
  const missing = React.useMemo(
    () => type.fields.map((k) => FIELDS[k]).filter((d) => d.required && !isFilled(d, values[d.key])),
    [type, values],
  );
  const valid = missing.length === 0;
  const fieldCount = type.fields.length + (showScope ? 4 : 0);

  const statusText = saving
    ? "Posting the record…"
    : valid
      ? showScope
        ? "Ready — saving keeps you here for the next record"
        : "Ready to save"
      : missing.length === 1
        ? `${missing[0].label} is required`
        : `${missing.length} required fields remaining`;

  // ── commit ──
  const handleSave = () => {
    if (!valid || saving) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      if (showScope) {
        // host + mapped → append, keep on page, reset, refresh browser
        const g: Grouped = {
          recId: nextId(type.id.slice(0, 2).toUpperCase()),
          name: String(values.name ?? "").trim() || "Untitled",
          industries: [...scope.industries],
          countries: [...scope.countries],
          active: values.active === true,
        };
        storeRef.current[type.id] = [g, ...(storeRef.current[type.id] ?? [])];
        setValues(defaultsFor(type));
        setScope(EMPTY_SCOPE);
        setReloadKey((k) => k + 1);
        showToast("success", `${type.label} saved — the form is cleared for the next one.`);
      } else {
        // everyone else → route to the records list
        showToast("success", `${type.label} created — taking you to the records list…`);
      }
    }, 1100);
  };

  const handleBack = () => navigate(-1);

  // ── ref-picker option sources ──
  const refOptions = (def: FieldDef): Opt[] => (def.source === "gl" ? GL_ACCOUNTS : def.source === "budget" ? BUDGET_PARENTS : []);
  const refSourceLabel = (def: FieldDef) => (def.source === "gl" ? "GL accounts" : def.source === "budget" ? "budget categories" : "records");

  // render one data-driven field
  const renderField = (def: FieldDef) => {
    if (def.kind === "switch") {
      return (
        <div key={def.key} className="sm:col-span-2">
          <ToggleRow label={def.label} helper={def.helper} value={values[def.key] === true} onChange={(v) => setVal(def.key, v)} />
        </div>
      );
    }
    const control = (() => {
      switch (def.kind) {
        case "text":
          return <TextInput id={def.key} value={(values[def.key] as string) ?? ""} onChange={(v) => setVal(def.key, v)} placeholder={def.placeholder} />;
        case "textarea":
          return <Textarea value={(values[def.key] as string) ?? ""} onChange={(v) => setVal(def.key, v)} placeholder={def.placeholder} />;
        case "number":
          return <NumberInput id={def.key} value={values[def.key] as number | undefined} onChange={(v) => setVal(def.key, v)} placeholder={def.placeholder} suffix={def.suffix} />;
        case "choice":
          return <ChoiceSelect value={(values[def.key] as string | null) ?? null} onChange={(v) => setVal(def.key, v)} options={def.options ?? []} noneLabel={def.noneLabel} placeholder={def.placeholder} disabled={saving} />;
        case "ref":
          return (
            <RefPicker
              value={(values[def.key] as Opt | null) ?? null}
              onChange={(o) => setVal(def.key, o)}
              options={refOptions(def)}
              required={def.required}
              autoFirst={def.required}
              disabled={saving}
              placeholder={def.placeholder}
              sourceLabel={refSourceLabel(def)}
              onAddNew={() => showToast("success", `Opening the “add new” form for ${refSourceLabel(def)}…`)}
              onAdvanced={() => showToast("success", "Opening advanced search…")}
              onView={() => showToast("success", "Opening the selected record…")}
            />
          );
        case "multi":
          return <MultiPicker value={(values[def.key] as string[]) ?? []} onChange={(v) => setVal(def.key, v)} options={SUBSIDIARIES.map(toOpt)} placeholder={def.placeholder} disabled={saving} />;
        default:
          return null;
      }
    })();
    return (
      <Field key={def.key} label={def.label} required={def.required} hint={def.hint} htmlFor={def.key} className={fieldSpan(def)}>
        {control}
      </Field>
    );
  };

  const inputFields = type.fields.map((k) => FIELDS[k]).filter((d) => d.kind !== "switch");
  const switchFields = type.fields.map((k) => FIELDS[k]).filter((d) => d.kind === "switch");

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Administration</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Master Records</span>
        </>
      }
      overlay={
        <>
          <CommitFooter saving={saving} valid={valid} statusText={statusText} onCancel={handleBack} onSave={handleSave} />
          <Toast toast={toast} onDismiss={() => setToast(null)} />
        </>
      }
    >
      {/* ── type-context header — the type IS the document identity ── */}
      <header className="border-b border-bz-line bg-bz-paper px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button onClick={handleBack} aria-label="Back" className="flex size-9 shrink-0 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text">
              <ArrowLeft size={16} />
            </button>
            <TypeSwitcher type={type} onPick={switchType} disabled={saving} />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[11px] text-bz-text-muted sm:flex">
              <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 font-medium text-bz-text-soft">Draft</span>
              <span className={NUM}>{fieldCount} fields</span>
              {type.mapped && <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-leaf/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-bz-text">Mapped</span>}
            </span>
            <RoleToggle isHost={isHost} setIsHost={setIsHost} disabled={saving} />
          </div>
        </div>
      </header>

      {/* ── body ── */}
      <div className={cn("mx-auto grid w-full gap-5 px-4 pb-28 pt-5 md:px-6", showBrowser ? "max-w-[1180px] lg:grid-cols-[minmax(0,1fr)_360px]" : "max-w-[760px]")}>
        {/* composition column */}
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHead
              label="Details"
              desc={`Fields are defined by the ${type.label} record type.`}
              icon={Library}
              badge={<span className="hidden shrink-0 items-center gap-1.5 rounded-bz-md bg-bz-paper-warm px-2 py-1 text-[10.5px] text-bz-text-muted sm:flex"><Icon name={type.icon} size={12} /> {type.label}</span>}
            />
            <div className="p-5">
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                {inputFields.map(renderField)}
              </div>
              {switchFields.length > 0 && (
                <div className="mt-4 flex flex-col gap-2.5">
                  {switchFields.map(renderField)}
                </div>
              )}
            </div>
          </Card>

          {/* host-only platform scope */}
          {showScope && (
            <Card>
              <CardHead
                label="Platform scope"
                desc="Where this record applies. Changing the country re-queries the tax authority."
                icon={ShieldCheck}
                badge={<span className="shrink-0 rounded-bz-sm bg-bz-olive px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-on-dark">Host only</span>}
              />
              <div className="p-5">
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                  <Field label="Industries" hint="Optional" className="sm:col-span-2">
                    <MultiPicker value={scope.industries} onChange={(v) => setScope((s) => ({ ...s, industries: v }))} options={INDUSTRIES.map(toOpt)} placeholder="All industries" icon={Factory} disabled={saving} />
                  </Field>
                  <Field label="Countries" hint="Drives the tax authority" className="sm:col-span-2">
                    <MultiPicker value={scope.countries} onChange={(v) => setScope((s) => ({ ...s, countries: v }))} options={COUNTRIES.map(toOpt)} placeholder="All countries" icon={Globe} disabled={saving} />
                  </Field>
                  <Field label="Default tax authority" hint={scope.countries.length ? `${taxOptions.length} in scope` : "Select countries first"} className="sm:col-span-2">
                    <RefPicker
                      value={scope.taxAuthority}
                      onChange={(o) => setScope((s) => ({ ...s, taxAuthority: o }))}
                      options={taxOptions}
                      requerying={taxRequerying}
                      disabled={saving || scope.countries.length === 0}
                      placeholder={scope.countries.length === 0 ? "Select a country to enable" : "Select a tax authority…"}
                      sourceLabel="tax authorities"
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <ToggleRow
                    label="Apply to child organisations"
                    helper="Cascade this record to every subsidiary beneath the current entity."
                    value={scope.applyToChild}
                    onChange={(v) => { setScope((s) => ({ ...s, applyToChild: v })); if (v) showToast("success", "This record will cascade to child organisations."); }}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* host-only saved-records rail */}
        {showBrowser && (
          <RecordsBrowser
            type={type}
            records={records}
            state={recordsState}
            lookupsReady={lookupsReady}
            onRefresh={() => setReloadKey((k) => k + 1)}
            onEdit={(g) => showToast("success", `Opening ${g.name} for editing…`)}
          />
        )}
      </div>
    </AppShell>
  );
}

// ── "Viewing as" role simulation (host unlocks scope + the records browser) ──
function RoleToggle({ isHost, setIsHost, disabled }: { isHost: boolean; setIsHost: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-soft md:flex">
        Viewing as
        <span title="Simulates the session role. The platform-level host gets geo/industry scoping and the saved-records browser." className="cursor-help"><Info size={11} /></span>
      </span>
      <div className={cn("grid grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5", disabled && "opacity-60")}>
        {([["Staff", false], ["Host", true]] as const).map(([label, host]) => {
          const active = isHost === host;
          return (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => setIsHost(host)}
              className={cn("h-7 rounded-bz-sm px-3 text-[12px] font-medium transition-colors", active ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text", disabled && "cursor-default")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
