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
  Loader2,
  Upload,
  Paperclip,
  FileText,
  FileSpreadsheet,
  FileDown,
  Download,
  Trash2,
  Info,
  AlertTriangle,
  TriangleAlert,
  CheckCircle2,
  Bell,
  BellOff,
  Database,
  ListChecks,
  Sparkles,
  Plus,
  RefreshCw,
  PlayCircle,
  CircleSlash,
  Rows3,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// BULK DATA IMPORT  (the guided round-trip → run an import)
//
// Primary action = RUN an import. So the page is a guided workspace, not a list:
//   1. Configure   pick document type + mode + notify flag.
//   2. Template    download a per-type CSV template (the FIELD-SELECTION DIALOG,
//                  whose entire body is data-driven by the chosen type's schema).
//   3. Attach      pick the filled CSV (the FILE-PICKER DIALOG).
//   4. Run         the docked "Run import" — validates at click, then streams.
//   • Conditional regions materialise only at their moment: a live PROGRESS
//     stream while running, a RESULTS report once finished, a VALIDATION-ERROR
//     table when the response carries row errors.
//
// Master input = document type: changing it clears the fetched field schema and
// any in-dialog selections, so the template + import re-derive from the new type.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const g = (n: number) => n.toLocaleString("en-US");

// ── shared button styles ──
const PRIMARY = "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50";
const GHOST = "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-50";

// ════════════════════════════════════════════════════════════════════════════
// DATA-DRIVEN TRANSFORMS  raw schema → readable; .NET errors → friendly wording
// ════════════════════════════════════════════════════════════════════════════

/** raw field / group key → human label ("customer_name" → "Customer Name") */
function humanize(raw: string): string {
  return raw
    .replace(/[_.]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .map((w) => (/^(id|pan|vat|csv|sku|uom)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function friendlyType(t: string): string {
  const map: Record<string, string> = {
    "System.Int32": "Whole number", "System.Int64": "Whole number",
    "System.Decimal": "Number", "System.Double": "Number",
    "System.DateTime": "Date", "System.Boolean": "Yes / No",
    "System.Guid": "Identifier", "System.String": "Text",
  };
  return map[t] ?? t;
}

function friendlyError(msg: string): string {
  if (/null|cannot be null/i.test(msg)) return "A required value is missing.";
  if (/correct format|not in a correct/i.test(msg)) return "The value isn't in the expected format.";
  if (/valid email/i.test(msg)) return "That isn't a valid email address.";
  if (/valid date/i.test(msg)) return "That isn't a real calendar date.";
  if (/duplicate|already exists/i.test(msg)) return "A record with this key already exists.";
  if (/out of.*range|range/i.test(msg)) return "The value is outside the allowed range.";
  if (/maximum length|exceeds/i.test(msg)) return "The value is longer than allowed.";
  if (/not valid|invalid/i.test(msg)) return "The value isn't valid for this field.";
  return msg;
}

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA  document types + per-type field schemas
// ════════════════════════════════════════════════════════════════════════════

type DocType = { id: string; label: string; withData: boolean };
const DOC_TYPES: DocType[] = [
  { id: "customers", label: "Customers", withData: true },
  { id: "items", label: "Items", withData: true },
  { id: "ledgers", label: "Ledger Accounts", withData: true },
  { id: "leads", label: "Leads", withData: false },
  { id: "suppliers", label: "Suppliers", withData: true },
  { id: "employees", label: "Employees", withData: true },
  { id: "pricelists", label: "Price Lists", withData: true },
  { id: "units", label: "Units of Measure", withData: false },
  { id: "currencies", label: "Currencies", withData: false },
  { id: "taxcodes", label: "Tax Codes", withData: false },
  { id: "salesorders", label: "Sales Orders", withData: false },
  { id: "projects", label: "Projects", withData: false },
  { id: "assets", label: "Fixed Assets", withData: false },
  { id: "warehouses", label: "Warehouses", withData: false }, // → empty schema (empty-state demo)
];

type RawField = { raw: string; required?: boolean };
type RawGroup = { raw: string; fields: RawField[] };

const SCHEMAS: Record<string, RawGroup[]> = {
  customers: [
    { raw: "basic_info", fields: [
      { raw: "customer_name", required: true },
      { raw: "display_name" },
      { raw: "customer_type", required: true },
      { raw: "phoneNumber" },
      { raw: "emailAddress" },
    ] },
    { raw: "tax_and_compliance", fields: [
      { raw: "panNo", required: true },
      { raw: "vatNo" },
      { raw: "registrationDate" },
    ] },
    { raw: "billingAddress", fields: [
      { raw: "billingAddress_line1", required: true },
      { raw: "billingAddress_city" },
      { raw: "billingAddress_country" },
      { raw: "postalCode" },
    ] },
    { raw: "commercial_terms", fields: [
      { raw: "creditLimit" },
      { raw: "paymentTerm_id" },
      { raw: "priceLevel_id" },
      { raw: "salesRep_id" },
      { raw: "openingBalance" },
    ] },
  ],
  items: [
    { raw: "identity", fields: [
      { raw: "item_code", required: true },
      { raw: "item_name", required: true },
      { raw: "description" },
      { raw: "barcode" },
    ] },
    { raw: "classification", fields: [
      { raw: "itemGroup_id", required: true },
      { raw: "baseUom", required: true },
      { raw: "brand" },
      { raw: "hsCode" },
    ] },
    { raw: "pricing_and_tax", fields: [
      { raw: "standardRate", required: true },
      { raw: "purchaseRate" },
      { raw: "taxCode_id" },
      { raw: "priceLevel_id" },
    ] },
    { raw: "stock", fields: [
      { raw: "maintainStock" },
      { raw: "reorderLevel" },
      { raw: "openingQty" },
      { raw: "defaultWarehouse_id" },
    ] },
  ],
  ledgers: [
    { raw: "account", fields: [
      { raw: "account_code", required: true },
      { raw: "account_name", required: true },
      { raw: "accountType", required: true },
      { raw: "parentAccount_id" },
    ] },
    { raw: "balances", fields: [
      { raw: "openingBalance" },
      { raw: "balanceType" },
      { raw: "currency_id" },
    ] },
    { raw: "tax", fields: [
      { raw: "taxApplicable" },
      { raw: "panNo" },
    ] },
  ],
  leads: [
    { raw: "contact", fields: [
      { raw: "lead_name", required: true },
      { raw: "company" },
      { raw: "phoneNumber", required: true },
      { raw: "emailAddress" },
    ] },
    { raw: "pipeline", fields: [
      { raw: "source" },
      { raw: "stage" },
      { raw: "estimatedValue" },
      { raw: "assignedTo_id" },
    ] },
  ],
};

const GENERIC_SCHEMA: RawGroup[] = [
  { raw: "general", fields: [
    { raw: "code", required: true },
    { raw: "name", required: true },
    { raw: "description" },
    { raw: "isActive" },
  ] },
];

function schemaFor(id: string): RawGroup[] {
  if (id === "warehouses") return []; // intentionally empty → exercises the empty state
  return SCHEMAS[id] ?? GENERIC_SCHEMA;
}

// keyed field model the dialog renders
type Field = { key: string; label: string; required: boolean };
type Group = { key: string; label: string; fields: Field[]; required: number };

function buildGroups(schema: RawGroup[]): Group[] {
  return schema.map((grp) => {
    const fields: Field[] = grp.fields.map((f) => ({
      key: `${grp.raw}::${f.raw}`,
      label: humanize(f.raw),
      required: !!f.required,
    }));
    return { key: grp.raw, label: humanize(grp.raw), fields, required: fields.filter((f) => f.required).length };
  });
}

// ════════════════════════════════════════════════════════════════════════════
// ATOMS  switch · segmented · checkbox · meter bar
// ════════════════════════════════════════════════════════════════════════════

function Switch({ value, onChange, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; ariaLabel?: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={value} aria-label={ariaLabel}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span className={cn("pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform", value ? "translate-x-[14px]" : "translate-x-[2px]")} />
    </button>
  );
}

function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: string; icon?: React.ComponentType<{ size?: number; className?: string }> }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
      {options.map((opt) => {
        const active = opt.id === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id} type="button" onClick={() => onChange(opt.id)}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-bz-sm px-3 text-[12.5px] font-medium transition-colors",
              active ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {Icon && <Icon size={13} />} {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldCheck({ checked, onToggle, label, required }: { checked: boolean; onToggle: () => void; label: string; required?: boolean }) {
  return (
    <button
      type="button" role="checkbox" aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-bz-md border px-2.5 py-2 text-left transition-colors",
        checked ? "border-bz-fire/60 bg-bz-fire/[0.08]" : "border-bz-line-soft bg-bz-surface hover:bg-bz-paper-warm",
      )}
    >
      <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-bz-sm border transition-colors", checked ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface text-transparent")}>
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-bz-text">{label}</span>
      {required && <span className="shrink-0 rounded-bz-sm bg-[#FBE5E2] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.05em] text-[#9A2E29]">Required</span>}
    </button>
  );
}

function MeterBar({ pct, tone }: { pct: number; tone: "fire" | "positive" | "danger" | "warning" }) {
  const fill = tone === "positive" ? "var(--bz-leaf-deep)" : tone === "danger" ? "#C0413A" : tone === "warning" ? "var(--bz-fire)" : "var(--bz-fire)";
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
      <div className="h-full rounded-bz-pill transition-[width] duration-300 ease-out" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: fill }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SEARCH SELECT  searchable · paginated (lazy scroll) · loading · empty ·
// clearable single-select (the document-type picker)
// ════════════════════════════════════════════════════════════════════════════

type Opt = { id: string; label: string; meta?: string };
const SEL_PAGE = 6;

function useAnchored(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !ref.current) { setPos(null); return; }
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, ref]);
  return pos;
}

function SearchSelect({
  value, onChange, options, placeholder = "Select…", icon: Icon,
}: {
  value: Opt | null;
  onChange: (o: Opt | null) => void;
  options: Opt[];
  placeholder?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchored(open, btnRef);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [more, setMore] = React.useState(false);
  const [hi, setHi] = React.useState(0);

  React.useEffect(() => {
    if (open) { setRaw(""); setQuery(""); setPages(1); setHi(0); const t = window.setTimeout(() => inputRef.current?.focus(), 10); return () => window.clearTimeout(t); }
  }, [open]);

  // type-to-filter → simulated server fetch, resets pagination
  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = window.setTimeout(() => { setQuery(raw.trim().toLowerCase()); setPages(1); setHi(0); setLoading(false); }, 200);
    return () => window.clearTimeout(t);
  }, [raw, open]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query)) : options;
  const visible = filtered.slice(0, pages * SEL_PAGE);
  const hasMore = visible.length < filtered.length;

  const onScroll = () => {
    const el = listRef.current;
    if (!el || more || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setMore(true);
      window.setTimeout(() => { setPages((p) => p + 1); setMore(false); }, 360);
    }
  };

  const pick = (o: Opt) => { onChange(o); setOpen(false); };
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, visible.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const o = visible[hi]; if (o) pick(o); }
  };

  return (
    <>
      <button
        ref={btnRef} type="button" onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        )}
      >
        {Icon && <Icon size={14} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("min-w-0 flex-1 truncate text-[13px]", value ? "text-bz-text" : "text-bz-text-soft")}>{value ? value.label : placeholder}</span>
        {value ? (
          <span role="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={11} /></span>
        ) : (
          <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
        )}
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 248) }}
          className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
          onKeyDown={onListKey}
        >
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={12} className="shrink-0 text-bz-text-muted" />
              <input ref={inputRef} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Search document types…" className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
              {raw && <button onClick={() => setRaw("")} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface" aria-label="Clear"><X size={10} /></button>}
            </div>
          </div>
          <div ref={listRef} onScroll={onScroll} className="max-h-[260px] overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-bz-text-muted"><Loader2 size={13} className="animate-spin text-bz-fire" /><span className="text-[11.5px]">Searching…</span></div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-7 text-center"><Search size={15} className="text-bz-text-soft" /><p className="text-[11.5px] font-medium text-bz-text-muted">{raw ? `No matches for “${raw}”` : "No document types"}</p></div>
            ) : (
              visible.map((o, i) => {
                const selected = value?.id === o.id;
                const active = i === hi;
                return (
                  <button
                    key={o.id} onMouseEnter={() => setHi(i)} onClick={() => pick(o)}
                    className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors", active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}
                  >
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-bz-text">{o.label}</span>
                    {o.meta && <span className="shrink-0 rounded-bz-sm bg-bz-leaf/40 px-1.5 py-0.5 text-[9.5px] font-medium text-bz-text">{o.meta}</span>}
                    {selected && <Check size={13} className="shrink-0 text-bz-text" />}
                  </button>
                );
              })
            )}
            {more && <div className="flex items-center justify-center gap-2 py-2.5 text-bz-text-muted"><Loader2 size={12} className="animate-spin text-bz-fire" /><span className="text-[11px]">Loading more…</span></div>}
            {!more && !hasMore && visible.length > 0 && filtered.length > SEL_PAGE && <p className={cn("px-3 py-2 text-center text-[10px] text-bz-text-soft", NUM)}>{filtered.length} types · end of list</p>}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FILE-PICKER DIALOG  stage one or more CSVs → commit hands the file back
// ════════════════════════════════════════════════════════════════════════════

type Picked = { name: string; sizeKb: number };
const RECENT_FILES: Picked[] = [
  { name: "customers_master_filled.csv", sizeKb: 412 },
  { name: "customers_template_2026.csv", sizeKb: 96 },
  { name: "items_pricing_q2.xlsx", sizeKb: 1180 }, // wrong type → exercises CSV validation
];

function FilePickerDialog({ open, onClose, onAttach }: { open: boolean; onClose: () => void; onAttach: (f: Picked) => void }) {
  const [staged, setStaged] = React.useState<Picked[]>([]);
  React.useEffect(() => { if (open) setStaged([]); }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;

  const add = (f: Picked) => setStaged((s) => (s.some((x) => x.name === f.name) ? s : [...s, f]));
  const remove = (name: string) => setStaged((s) => s.filter((x) => x.name !== name));
  const browse = () => add({ name: `import_upload_${staged.length + 1}.csv`, sizeKb: 280 });

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-bz-olive-dark/40 p-4 py-[10vh]" onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480 }} className="overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_70px_-20px_rgba(15,20,17,0.32)]">
        <div className="flex items-start gap-3 border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper"><Paperclip size={16} /></span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-semibold tracking-tight text-bz-text">Attach import file</h3>
            <p className="mt-0.5 text-[11.5px] text-bz-text-muted">Choose the filled CSV to import. Only .csv is accepted.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={15} /></button>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <button onClick={browse} className="flex flex-col items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/40 px-4 py-7 text-center transition-colors hover:border-bz-text-muted hover:bg-bz-paper-warm">
            <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted"><Upload size={16} /></span>
            <span className="text-[12.5px] font-medium text-bz-text">Click to browse or drop a file</span>
            <span className="text-[11px] text-bz-text-soft">CSV up to 10 MB</span>
          </button>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Recent exports</p>
            <div className="flex flex-col gap-1">
              {RECENT_FILES.map((f) => {
                const csv = f.name.toLowerCase().endsWith(".csv");
                const isStaged = staged.some((x) => x.name === f.name);
                return (
                  <button key={f.name} onClick={() => add(f)} disabled={isStaged} className="flex items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-2 text-left hover:bg-bz-paper-warm disabled:opacity-50">
                    {csv ? <FileText size={14} className="shrink-0 text-bz-text-muted" /> : <FileSpreadsheet size={14} className="shrink-0 text-bz-text-muted" />}
                    <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">{f.name}</span>
                    <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{f.sizeKb} KB</span>
                    {!csv && <span className="shrink-0 rounded-bz-sm bg-[#FBE5E2] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#9A2E29]">Not CSV</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {staged.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Selected · {staged.length}</p>
              <div className="flex flex-col gap-1">
                {staged.map((f) => (
                  <div key={f.name} className="flex items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-2.5 py-2">
                    <FileText size={14} className="shrink-0 text-bz-leaf-deep" />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">{f.name}</span>
                    <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{f.sizeKb} KB</span>
                    <button onClick={() => remove(f.name)} aria-label="Remove" className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface hover:text-[#9A2E29]"><X size={11} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3">
          <span className="text-[11px] text-bz-text-soft">{staged.length === 0 ? "Nothing selected yet" : "First file feeds the import"}</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className={GHOST}>Cancel</button>
            <button disabled={staged.length === 0} onClick={() => { onAttach(staged[0]); onClose(); }} className={PRIMARY}>
              <Check size={14} /> Attach {staged.length > 0 ? `(${staged.length})` : "file"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIELD-SELECTION DIALOG  per-type · data-driven · live counters · bulk toggles
// (static modal — no dismiss-on-outside-click; closing discards selections)
// ════════════════════════════════════════════════════════════════════════════

function FieldSelectionDialog({
  open, docType, schema, withDataSupported, onClose, onDownload,
}: {
  open: boolean;
  docType: DocType | null;
  schema: RawGroup[] | null;
  withDataSupported: boolean;
  onClose: () => void;
  onDownload: (variant: "headers" | "data", count: number) => void;
}) {
  const groups = React.useMemo(() => (schema ? buildGroups(schema) : []), [schema]);
  const allKeys = React.useMemo(() => groups.flatMap((g) => g.fields.map((f) => f.key)), [groups]);
  const requiredKeys = React.useMemo(() => groups.flatMap((g) => g.fields.filter((f) => f.required).map((f) => f.key)), [groups]);

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  // open with required fields pre-selected; re-init whenever the schema changes
  React.useEffect(() => { if (open) setSelected(new Set(requiredKeys)); }, [open, requiredKeys]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const total = selected.size;
  const empty = groups.length === 0;

  const toggleField = (k: string) => setSelected((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const selectAll = () => setSelected(new Set(allKeys));
  const clearAll = () => setSelected(new Set());
  const requiredOnly = () => setSelected(new Set(requiredKeys));
  const groupSelectedCount = (grp: Group) => grp.fields.reduce((n, f) => n + (selected.has(f.key) ? 1 : 0), 0);
  const groupFull = (grp: Group) => grp.fields.length > 0 && grp.fields.every((f) => selected.has(f.key));
  const toggleGroup = (grp: Group) => setSelected((s) => {
    const n = new Set(s);
    if (groupFull(grp)) grp.fields.forEach((f) => n.delete(f.key));
    else grp.fields.forEach((f) => n.add(f.key));
    return n;
  });

  return createPortal(
    // static modal: backdrop does NOT close
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-bz-olive-dark/45 p-4 py-[6vh]">
      <div style={{ width: "100%", maxWidth: 720 }} className="flex max-h-[88vh] flex-col overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_70px_-20px_rgba(15,20,17,0.32)]">
        {/* header */}
        <div className="flex items-start gap-3 border-b border-bz-line-soft bg-bz-paper-warm/40 px-5 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper"><FileDown size={16} /></span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold tracking-tight text-bz-text">Build the {docType?.label ?? ""} template</h3>
            <p className="mt-0.5 text-[11.5px] text-bz-text-muted">Pick the columns to include, then download the CSV template.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={15} /></button>
        </div>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><CircleSlash size={22} /></span>
            <p className="text-[14px] font-semibold text-bz-text">No fields available</p>
            <p className="max-w-sm text-[12px] text-bz-text-muted">This document type has no importable field schema yet. Pick another type to generate a template.</p>
          </div>
        ) : (
          <>
            {/* guide + bulk controls + live counter */}
            <div className="flex flex-col gap-3 border-b border-bz-line-soft px-5 py-3.5">
              <div className="flex items-start gap-2 rounded-bz-md bg-bz-leaf/25 px-3 py-2 text-[11.5px] leading-relaxed text-bz-text">
                <Info size={13} className="mt-0.5 shrink-0 text-bz-leaf-deep" />
                <span>Required fields are pre-selected and must stay in the template. Select at least one field to generate the file — add more to capture optional data.</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button onClick={selectAll} className="inline-flex h-7 items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"><Check size={12} /> Select all</button>
                  <button onClick={clearAll} className="inline-flex h-7 items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"><X size={12} /> Clear all</button>
                  <button onClick={requiredOnly} className="inline-flex h-7 items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"><Sparkles size={12} className="text-bz-leaf-deep" /> Required only</button>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-fire/[0.18] px-2.5 py-1 text-[11.5px] font-semibold text-bz-text">
                  <ListChecks size={12} /> <span className={NUM}>{total}</span> of {allKeys.length} selected
                </span>
              </div>
            </div>

            {/* grouped fields */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-5">
                {groups.map((grp) => {
                  const sel = groupSelectedCount(grp);
                  const full = groupFull(grp);
                  return (
                    <div key={grp.key}>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-semibold text-bz-text">{grp.label}</span>
                          <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{sel}/{grp.fields.length}</span>
                          <span className="text-[10.5px] text-bz-text-soft">{grp.required} required · {grp.fields.length - grp.required} optional</span>
                        </div>
                        <button onClick={() => toggleGroup(grp)} className="inline-flex h-7 items-center gap-1 rounded-bz-sm px-2 text-[11px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
                          {full ? <><X size={11} /> Unselect group</> : <><Check size={11} /> Select group</>}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {grp.fields.map((f) => (
                          <FieldCheck key={f.key} checked={selected.has(f.key)} onToggle={() => toggleField(f.key)} label={f.label} required={f.required} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* confirm / dismiss */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bz-line-soft bg-bz-paper-warm/30 px-5 py-3.5">
              <button onClick={onClose} className={GHOST}>Cancel</button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onDownload("data", total)}
                  disabled={total === 0}
                  title={withDataSupported ? "" : "Not supported for this type yet"}
                  className={cn(GHOST, !withDataSupported && "opacity-70")}
                >
                  <Download size={14} /> With data <span className={cn("ml-0.5 rounded-bz-sm bg-bz-paper-warm px-1.5 text-[10.5px]", NUM)}>{total}</span>
                </button>
                <button onClick={() => onDownload("headers", total)} disabled={total === 0} className={PRIMARY}>
                  <FileDown size={14} /> Headers only <span className={cn("ml-0.5 rounded-bz-sm bg-white/15 px-1.5 text-[10.5px]", NUM)}>{total}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROGRESS · RESULTS · VALIDATION  (conditional regions)
// ════════════════════════════════════════════════════════════════════════════

type Phase = "idle" | "uploading" | "processing" | "done";
type Progress = { total: number; processed: number; succeeded: number; failed: number };
type ValErr = { row: number; column: string; expectedType: string; actualValue: string; message: string };
type ImportResult = { total: number; succeeded: number; failed: number };

function Counter({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "positive" | "danger" }) {
  const color = tone === "positive" ? "text-bz-leaf-deep" : tone === "danger" ? "text-[#9A2E29]" : "text-bz-text";
  return (
    <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2.5">
      <p className={cn("text-[18px] font-semibold leading-none", color, NUM)}>{g(value)}</p>
      <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-[0.05em] text-bz-text-soft">{label}</p>
    </div>
  );
}

function ProgressPanel({ phase, progress }: { phase: Phase; progress: Progress }) {
  const pct = progress.total ? Math.round((progress.processed / progress.total) * 100) : 0;
  const running = phase === "uploading" || phase === "processing";
  const fullyFailed = phase === "done" && progress.failed === progress.total && progress.total > 0;
  const partial = phase === "done" && progress.failed > 0 && !fullyFailed;
  const success = phase === "done" && progress.failed === 0;

  const meterTone = running ? "fire" : success ? "positive" : fullyFailed ? "danger" : "warning";
  const statusText =
    phase === "uploading" ? "Uploading file…"
    : phase === "processing" ? "Processing rows…"
    : success ? "Import complete"
    : fullyFailed ? "Import failed — no rows imported"
    : "Completed with errors";
  const StatusIcon = running ? Loader2 : success ? CheckCircle2 : fullyFailed ? TriangleAlert : AlertTriangle;
  const iconColor = running ? "text-bz-fire" : success ? "text-bz-leaf-deep" : fullyFailed ? "text-[#C0413A]" : "text-[#C0413A]";

  return (
    <section className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusIcon size={16} className={cn(iconColor, running && "animate-spin")} />
          <span className="text-[13.5px] font-semibold text-bz-text">{statusText}</span>
        </div>
        <span className={cn("text-[15px] font-semibold text-bz-text", NUM)}>{pct}%</span>
      </div>
      <div className="mt-3"><MeterBar pct={pct} tone={meterTone} /></div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Counter label="Total" value={progress.total} />
        <Counter label="Processed" value={progress.processed} />
        <Counter label="Succeeded" value={progress.succeeded} tone="positive" />
        <Counter label="Failed" value={progress.failed} tone={progress.failed > 0 ? "danger" : "neutral"} />
      </div>
    </section>
  );
}

const ISSUE_CAP = 5;

function ResultsPanel({
  result, errors, fileExists, deleting, onDownloadResult, onDeleteResult,
}: {
  result: ImportResult;
  errors: ValErr[];
  fileExists: boolean;
  deleting: boolean;
  onDownloadResult: () => void;
  onDeleteResult: () => void;
}) {
  const warning = result.failed > 0;
  const issues = errors.slice(0, ISSUE_CAP);
  const moreIssues = errors.length - issues.length;

  return (
    <section className={cn("overflow-hidden rounded-bz-lg border bg-bz-surface", warning ? "border-[#F0C9C4]" : "border-bz-line-soft")}>
      <div className={cn("flex items-start gap-3 px-4 py-3.5 md:px-5", warning ? "bg-[#FBE5E2]/50" : "bg-bz-fire/[0.10]")}>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md", warning ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-fire/30 text-bz-leaf-deep")}>
          {warning ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold text-bz-text">{warning ? "Import finished with warnings" : "All records imported"}</h3>
          <p className={cn("mt-0.5 text-[11.5px] text-bz-text-muted", NUM)}>
            {warning
              ? <><span className="font-semibold text-bz-text">{g(result.succeeded)}</span> of {g(result.total)} rows imported · <span className="font-semibold text-[#9A2E29]">{g(result.failed)}</span> failed</>
              : <><span className="font-semibold text-bz-text">{g(result.total)}</span> rows imported successfully</>}
          </p>
        </div>
      </div>

      {warning && (
        <div className="border-t border-bz-line-soft px-4 py-3.5 md:px-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">What went wrong</p>
          <ul className="flex flex-col gap-1.5">
            {issues.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-bz-text">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-bz-pill bg-[#C0413A]" />
                <span>
                  <span className={cn("font-medium text-bz-text-muted", NUM)}>Row {e.row}, {humanize(e.column)}</span> — {friendlyError(e.message)}
                </span>
              </li>
            ))}
          </ul>
          {moreIssues > 0 && <p className={cn("mt-2 text-[11px] text-bz-text-soft", NUM)}>Showing first {ISSUE_CAP} of {errors.length} issues — see the result file for the rest.</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3 md:px-5">
        <span className="text-[11.5px] text-bz-text-muted">{fileExists ? "A result file with the full outcome is ready." : "Result file deleted."}</span>
        {fileExists ? (
          <div className="flex items-center gap-2">
            <button onClick={onDeleteResult} disabled={deleting} className={cn(GHOST, "text-[#9A2E29] hover:bg-[#FBE5E2]/50")}>
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete result file
            </button>
            <button onClick={onDownloadResult} className={PRIMARY}><Download size={14} /> Download result file</button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted"><Check size={12} className="text-bz-leaf-deep" /> Removed</span>
        )}
      </div>
    </section>
  );
}

const VAL_CAP = 8;
const VTH = "px-3 py-2 text-[9.5px] font-medium uppercase tracking-[0.06em] text-bz-text-muted whitespace-nowrap";

function ValidationTable({ errors }: { errors: ValErr[] }) {
  const rows = errors.slice(0, VAL_CAP);
  const more = errors.length - rows.length;
  return (
    <section className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex items-center gap-2 border-b border-bz-line-soft px-4 py-3 md:px-5">
        <Rows3 size={15} className="text-bz-text-muted" />
        <h3 className="text-[13px] font-semibold text-bz-text">Validation errors</h3>
        <span className={cn("rounded-bz-pill bg-[#FBE5E2] px-2 py-0.5 text-[10.5px] font-semibold text-[#9A2E29]", NUM)}>{errors.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth: 720 }}>
          <thead>
            <tr className="border-b border-bz-line-soft bg-bz-paper-warm/60">
              <th className={cn(VTH, "text-right")}>Row</th>
              <th className={VTH}>Column</th>
              <th className={VTH}>Expected</th>
              <th className={VTH}>Value</th>
              <th className={VTH}>Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e, i) => (
              <tr key={i} className="border-b border-bz-line-soft last:border-0">
                <td className={cn("px-3 py-2.5 text-right text-[12px] font-medium text-bz-text", NUM)}>{e.row}</td>
                <td className="px-3 py-2.5 text-[12px] text-bz-text">{humanize(e.column)}</td>
                <td className="px-3 py-2.5"><span className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[11px] text-bz-text-muted">{friendlyType(e.expectedType)}</span></td>
                <td className="px-3 py-2.5"><span className={cn("text-[12px] text-bz-text-muted", NUM)}>{e.actualValue === "" ? <span className="italic text-bz-text-soft">empty</span> : e.actualValue}</span></td>
                <td className="px-3 py-2.5 text-[12px] text-bz-text-muted">{friendlyError(e.message)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {more > 0 && <p className={cn("border-t border-bz-line-soft px-4 py-2.5 text-[11px] text-bz-text-soft md:px-5", NUM)}>Showing first {VAL_CAP} of {errors.length} rows — the result file lists them all.</p>}
    </section>
  );
}

// the deterministic outcome the demo import produces (counts reconcile)
const FAIL_ROWS: ValErr[] = [
  { row: 7, column: "creditLimit", expectedType: "System.Decimal", actualValue: "N/A", message: "Input string was not in a correct format." },
  { row: 14, column: "panNo", expectedType: "System.String", actualValue: "", message: "Value cannot be null." },
  { row: 23, column: "registrationDate", expectedType: "System.DateTime", actualValue: "31/02/2026", message: "The value '31/02/2026' is not a valid date." },
  { row: 31, column: "emailAddress", expectedType: "System.String", actualValue: "raju[at]mail", message: "The value is not a valid email." },
  { row: 42, column: "openingBalance", expectedType: "System.Decimal", actualValue: "1,20,000", message: "Input string was not in a correct format." },
  { row: 55, column: "customer_type", expectedType: "System.String", actualValue: "Wholsale", message: "The value 'Wholsale' is not valid." },
  { row: 68, column: "creditLimit", expectedType: "System.Decimal", actualValue: "-500", message: "The value is out of the allowed range." },
  { row: 77, column: "panNo", expectedType: "System.String", actualValue: "301245678", message: "Duplicate value: a record with this key already exists." },
  { row: 90, column: "phoneNumber", expectedType: "System.String", actualValue: "", message: "Value cannot be null." },
  { row: 103, column: "registrationDate", expectedType: "System.DateTime", actualValue: "2026-13-01", message: "The value '2026-13-01' is not a valid date." },
  { row: 118, column: "creditLimit", expectedType: "System.Decimal", actualValue: "abc", message: "Input string was not in a correct format." },
  { row: 131, column: "vatNo", expectedType: "System.String", actualValue: "6000000000000", message: "The value exceeds the maximum length." },
];
const RUN_TOTAL = 240;

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

type ToastTone = "success" | "warning" | "info";
type ToastState = { tone: ToastTone; message: string; id: number } | null;

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, 3600);
    return () => window.clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const Icon = toast.tone === "success" ? Check : toast.tone === "warning" ? TriangleAlert : Info;
  const tint = toast.tone === "success" ? "bg-bz-fire/[0.18] text-bz-leaf-deep" : toast.tone === "warning" ? "bg-[#FBE5E2] text-[#C0413A]" : "bg-bz-paper-warm text-bz-text-muted";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.2)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", tint)}><Icon size={13} /></span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onClose} className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LAYOUT HELPERS  step card · guidance rail · docked action footer
// ════════════════════════════════════════════════════════════════════════════

function StepCard({ n, title, desc, done, children }: { n: number; title: string; desc?: string; done?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-pill text-[12px] font-bold", done ? "bg-bz-fire text-bz-olive" : "bg-bz-paper-warm text-bz-text-muted", NUM)}>
          {done ? <Check size={14} /> : n}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-semibold tracking-tight text-bz-text">{title}</h2>
          {desc && <p className="mt-0.5 text-[12px] text-bz-text-muted">{desc}</p>}
          <div className="mt-3.5">{children}</div>
        </div>
      </div>
    </section>
  );
}

function GuidanceRail({ docType, mode, notify, attached }: { docType: DocType | null; mode: string; notify: boolean; attached: Picked | null }) {
  const steps = [
    "Choose what to import and whether you're adding or updating.",
    "Download a template shaped for that type.",
    "Fill it in, keeping the header row intact.",
    "Attach the CSV and run the import.",
    "Review the per-row outcome, then keep or discard the result file.",
  ];
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-4">
      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft"><ListChecks size={12} /> How importing works</p>
        <ol className="mt-3 flex flex-col gap-2.5">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-[10px] font-bold text-bz-text-muted", NUM)}>{i + 1}</span>
              <span className="text-[12px] leading-relaxed text-bz-text-muted">{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3.5 flex items-start gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 px-3 py-2 text-[11px] leading-relaxed text-bz-text-muted">
          <Info size={12} className="mt-0.5 shrink-0 text-bz-text-soft" />
          <span>Supported file: <span className="font-medium text-bz-text">.csv only</span>, up to <span className={cn("font-medium text-bz-text", NUM)}>10 MB</span>. Keep the template's header row unchanged.</span>
        </div>
      </div>

      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Your selection</p>
        <dl className="mt-2.5 flex flex-col gap-2 text-[12px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-bz-text-muted">Document type</dt>
            <dd className={cn("font-medium", docType ? "text-bz-text" : "text-bz-text-soft")}>{docType?.label ?? "Not chosen"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-bz-text-muted">Mode</dt>
            <dd className="font-medium text-bz-text">{mode === "insert" ? "Insert new" : "Update existing"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-bz-text-muted">Notify on finish</dt>
            <dd className={cn("font-medium", notify ? "text-bz-text" : "text-bz-text-soft")}>{notify ? "Yes" : "No"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-bz-text-muted">File</dt>
            <dd className={cn("max-w-[150px] truncate font-medium", attached ? "text-bz-text" : "text-bz-text-soft")} title={attached?.name}>{attached?.name ?? "Not attached"}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function ReadyChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-bz-pill px-2 py-0.5 text-[11px] font-medium", ok ? "bg-bz-fire/[0.18] text-bz-text" : "bg-bz-paper-warm text-bz-text-soft")}>
      {ok ? <Check size={11} className="text-bz-leaf-deep" /> : <CircleSlash size={10} />} {label}
    </span>
  );
}

function ActionFooter({
  phase, ready, onRun, onReset,
}: {
  phase: Phase;
  ready: { type: boolean; mode: boolean; file: boolean };
  onRun: () => void;
  onReset: () => void;
}) {
  const running = phase === "uploading" || phase === "processing";
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-8">
      <div className="hidden min-w-0 flex-wrap items-center gap-1.5 sm:flex">
        <ReadyChip ok={ready.type} label="Type" />
        <ReadyChip ok={ready.mode} label="Mode" />
        <ReadyChip ok={ready.file} label="File" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {phase === "done" ? (
          <button onClick={onReset} className={PRIMARY}><RefreshCw size={14} /> Start new import</button>
        ) : running ? (
          <button disabled className={PRIMARY}>
            <Loader2 size={14} className="animate-spin" /> {phase === "uploading" ? "Uploading…" : "Processing…"}
          </button>
        ) : (
          <button onClick={onRun} className={PRIMARY}><PlayCircle size={15} /> Run import</button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function BulkDataImportDesignPage() {
  const navigate = useNavigate();

  // configure
  const [docType, setDocType] = React.useState<DocType | null>(null);
  const [mode, setMode] = React.useState<"insert" | "update">("insert");
  const [notify, setNotify] = React.useState(false);

  // template / field dialog
  const [schemaLoading, setSchemaLoading] = React.useState(false);
  const [schema, setSchema] = React.useState<RawGroup[] | null>(null);
  const [fieldDialog, setFieldDialog] = React.useState(false);
  const [templateDownloaded, setTemplateDownloaded] = React.useState(false);

  // attach / file picker
  const [filePicker, setFilePicker] = React.useState(false);
  const [attached, setAttached] = React.useState<Picked | null>(null);

  // run lifecycle
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [progress, setProgress] = React.useState<Progress | null>(null);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const [errors, setErrors] = React.useState<ValErr[]>([]);
  const [resultFileExists, setResultFileExists] = React.useState(true);
  const [deletingResult, setDeletingResult] = React.useState(false);

  // toast
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const notifyToast = (tone: ToastTone, message: string) => setToast({ tone, message, id: ++toastId.current });

  const intervalRef = React.useRef<number | null>(null);
  const uploadTimer = React.useRef<number | null>(null);
  React.useEffect(() => () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (uploadTimer.current) window.clearTimeout(uploadTimer.current);
  }, []);

  // master input: changing the document type clears the fetched schema + template state
  const onChangeDocType = (o: Opt | null) => {
    setDocType(o ? DOC_TYPES.find((d) => d.id === o.id) ?? null : null);
    setSchema(null);
    setTemplateDownloaded(false);
  };

  // download-template action — guarded; loading state while schema "fetches"
  const onDownloadTemplate = () => {
    if (!docType) { notifyToast("warning", "Choose a document type before downloading a template."); return; }
    setSchemaLoading(true);
    window.setTimeout(() => {
      setSchema(schemaFor(docType.id));
      setSchemaLoading(false);
      setFieldDialog(true);
    }, 650);
  };

  const onTemplateConfirm = (variant: "headers" | "data", count: number) => {
    if (count === 0) { notifyToast("warning", "Select at least one field to generate a template."); return; }
    if (variant === "data" && !(docType?.withData)) { notifyToast("warning", `“With data” export isn't supported for ${docType?.label} yet.`); return; }
    setFieldDialog(false);
    setTemplateDownloaded(true);
    notifyToast("success", variant === "data" ? `Downloaded ${docType?.label} template with ${count} columns + existing data.` : `Downloaded ${docType?.label} template (${count} columns, headers only).`);
  };

  // run import — validates at click, then streams progress from the "server"
  const runImport = () => {
    if (!docType) { notifyToast("warning", "Choose a document type first."); return; }
    if (!attached) { notifyToast("warning", "Attach a CSV file to import."); return; }
    if (!attached.name.toLowerCase().endsWith(".csv")) { notifyToast("warning", "Only .csv files can be imported — that file isn't a CSV."); return; }

    setResult(null);
    setErrors([]);
    setResultFileExists(true);
    setPhase("uploading");
    const total = RUN_TOTAL;
    const failed = FAIL_ROWS.length;
    setProgress({ total, processed: 0, succeeded: 0, failed: 0 });

    uploadTimer.current = window.setTimeout(() => {
      setPhase("processing");
      intervalRef.current = window.setInterval(() => {
        setProgress((p) => {
          if (!p) return p;
          const step = Math.min(16, total - p.processed);
          const processed = p.processed + step;
          const f = Math.round((failed * processed) / total);
          const s = processed - f;
          if (processed >= total) {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            // settle exact final counts + emit the report on the next frame
            window.setTimeout(() => {
              setPhase("done");
              setErrors(FAIL_ROWS);
              setResult({ total, succeeded: total - failed, failed });
              notifyToast(failed > 0 ? "warning" : "success", failed > 0 ? `Import finished: ${total - failed} imported, ${failed} failed.` : `Import complete: all ${total} rows imported.`);
            }, 0);
            return { total, processed: total, succeeded: total - failed, failed };
          }
          return { total, processed, succeeded: s, failed: f };
        });
      }, 200);
    }, 700);
  };

  const resetRun = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (uploadTimer.current) window.clearTimeout(uploadTimer.current);
    setPhase("idle");
    setProgress(null);
    setResult(null);
    setErrors([]);
    setAttached(null);
    setResultFileExists(true);
    notifyToast("info", "Ready for a new import.");
  };

  const onDownloadResult = () => notifyToast("success", "Result file downloaded.");
  const onDeleteResult = () => {
    setDeletingResult(true);
    window.setTimeout(() => { setDeletingResult(false); setResultFileExists(false); notifyToast("success", "Result file deleted."); }, 700);
  };

  const ready = { type: !!docType, mode: true, file: !!attached && attached.name.toLowerCase().endsWith(".csv") };
  const showProgress = phase !== "idle" && progress != null;
  const showResults = phase === "done" && result != null;
  const showValidation = phase === "done" && errors.length > 0;
  const running = phase === "uploading" || phase === "processing";

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Administration</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <button onClick={() => navigate("/design/data-imports")} className="text-bz-text-muted hover:text-bz-text">Data Imports</button>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">New Import</span>
        </>
      }
      overlay={
        <>
          <ActionFooter phase={phase} ready={ready} onRun={runImport} onReset={resetRun} />
          <FilePickerDialog open={filePicker} onClose={() => setFilePicker(false)} onAttach={(f) => setAttached(f)} />
          <FieldSelectionDialog
            open={fieldDialog}
            docType={docType}
            schema={schema}
            withDataSupported={!!docType?.withData}
            onClose={() => setFieldDialog(false)}
            onDownload={onTemplateConfirm}
          />
          <Toast toast={toast} onClose={() => setToast(null)} />
        </>
      }
    >
      {/* header */}
      <header className="border-b border-bz-line bg-bz-paper px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/design/data-imports")} aria-label="Back to import history" className="flex size-9 shrink-0 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold tracking-tight text-bz-text">New Import</h1>
            <p className="mt-0.5 text-[12px] text-bz-text-muted">Bulk-load records from a CSV — pick a type, grab a template, then run it.</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-5 pb-28 md:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* MAIN COLUMN */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* STEP 1 — configure */}
            <StepCard n={1} title="Choose what to import" desc="Pick the record type and whether you're adding new records or updating existing ones." done={ready.type}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-bz-text-muted">Document type <span className="text-bz-fire">*</span></label>
                  <SearchSelect
                    value={docType ? { id: docType.id, label: docType.label } : null}
                    onChange={onChangeDocType}
                    options={DOC_TYPES.map((d) => ({ id: d.id, label: d.label, meta: d.withData ? "with-data" : undefined }))}
                    placeholder="Search & select a type…"
                    icon={Database}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-bz-text-muted">Import mode <span className="text-bz-fire">*</span></label>
                  <Segmented
                    value={mode}
                    onChange={setMode}
                    options={[{ id: "insert", label: "Insert new", icon: Plus }, { id: "update", label: "Update existing", icon: RefreshCw }]}
                  />
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted">{notify ? <Bell size={14} /> : <BellOff size={14} />}</span>
                  <div>
                    <p className="text-[12.5px] font-medium text-bz-text">Email me when it finishes</p>
                    <p className="text-[11px] text-bz-text-muted">Get a notification with the outcome once the import completes.</p>
                  </div>
                </div>
                <Switch value={notify} onChange={setNotify} ariaLabel="Notify on finish" />
              </div>
            </StepCard>

            {/* STEP 2 — template */}
            <StepCard n={2} title="Get the template" desc="Download a CSV shaped exactly for this type — its columns are driven by the type's field schema." done={templateDownloaded}>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={onDownloadTemplate} disabled={schemaLoading} className={GHOST}>
                  {schemaLoading ? <><Loader2 size={14} className="animate-spin" /> Loading schema…</> : <><FileDown size={14} /> Download template</>}
                </button>
                {!docType && <span className="inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-soft"><Info size={12} /> Choose a document type first.</span>}
                {templateDownloaded && <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-leaf-deep"><CheckCircle2 size={13} /> Template downloaded</span>}
              </div>
            </StepCard>

            {/* STEP 3 — attach */}
            <StepCard n={3} title="Attach the filled file" desc="Upload the completed CSV. The import below reads it together with your type and mode." done={ready.file}>
              {attached ? (
                <div className="flex items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted">
                      {attached.name.toLowerCase().endsWith(".csv") ? <FileText size={15} /> : <FileSpreadsheet size={15} />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-medium text-bz-text" title={attached.name}>{attached.name}</p>
                      <p className={cn("text-[11px]", attached.name.toLowerCase().endsWith(".csv") ? "text-bz-text-muted" : "text-[#9A2E29]")}>
                        {attached.name.toLowerCase().endsWith(".csv") ? `${attached.sizeKb} KB · ready` : "Not a CSV — pick a .csv file"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button onClick={() => setFilePicker(true)} className={GHOST}>Replace</button>
                    <button onClick={() => setAttached(null)} aria-label="Remove file" className="flex size-9 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-[#9A2E29]"><Trash2 size={15} /></button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setFilePicker(true)} className={GHOST}><Paperclip size={14} /> Attach CSV file</button>
              )}
              <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
                <Info size={12} className="text-bz-text-soft" /> When everything's ready, run the import from the bar at the bottom.
              </p>
            </StepCard>

            {/* CONDITIONAL — live progress */}
            {showProgress && progress && <ProgressPanel phase={phase} progress={progress} />}

            {/* CONDITIONAL — results report (after finish, not while uploading) */}
            {showResults && result && !running && (
              <ResultsPanel
                result={result}
                errors={errors}
                fileExists={resultFileExists}
                deleting={deletingResult}
                onDownloadResult={onDownloadResult}
                onDeleteResult={onDeleteResult}
              />
            )}

            {/* CONDITIONAL — validation-error table */}
            {showValidation && <ValidationTable errors={errors} />}
          </div>

          {/* RIGHT RAIL — guidance */}
          <GuidanceRail docType={docType} mode={mode} notify={notify} attached={attached} />
        </div>
      </div>
    </AppShell>
  );
}
