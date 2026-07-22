import * as React from "react";
import { createPortal } from "react-dom";
import {
  Upload, FileSpreadsheet, FileText, File as FileIcon, X, Check, ChevronDown,
  ChevronRight, ChevronUp, Search, Loader2, RotateCw, TriangleAlert, Download,
  Trash2, RefreshCw, Settings2, Users, Package, Truck, Receipt, BookOpen,
  Building2, Wallet, Contact, Tag, ArrowRight, History, Play, Ban, Info,
  CircleCheck, CircleAlert, Landmark, Sparkles,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// BULK DATA IMPORT  ·  /design/data-imports
// ────────────────────────────────────────────────────────────────────────────
// A self-service importer. One continuous, reload-free session: choose a
// document type, attach a spreadsheet, map its columns to the system's fields,
// run, read the outcome, and correct-and-retry the failures until everything is
// in. The whole thing is one PROGRESSIVE WORKSHEET — setup at the top, mapping
// as the body, an inline outcome when a run settles, a thin session tally that
// accumulates every attempt, and one docked Run control that is always the
// primary action. No wizard rail; nothing is a modal; the session is ephemeral.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const g = (n: number) => n.toLocaleString("en-US");
const LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";
const PRIMARY_BTN =
  "inline-flex h-9 items-center justify-center gap-2 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark transition-colors hover:bg-bz-olive disabled:cursor-not-allowed disabled:opacity-45";
const GHOST_BTN =
  "inline-flex h-9 items-center justify-center gap-2 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text transition-colors hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-45";

// ════════════════════════════════════════════════════════════════════════════
// DATA-DRIVEN FIELD SET  ·  fields, labels, required-ness + grouping all come
// from the chosen document type — not a hand-built form.
// ════════════════════════════════════════════════════════════════════════════

type FieldDef = { key: string; label: string; required?: boolean; aliases: string[] };
type FieldGroup = { group: string; fields: FieldDef[] };

const CUSTOMER_FIELDS: FieldGroup[] = [
  {
    group: "Identity",
    fields: [
      { key: "name", label: "Customer Name", required: true, aliases: ["name", "full name", "customer", "customer name", "party name"] },
      { key: "pan", label: "PAN / Tax No.", required: true, aliases: ["pan", "pan no", "tax", "tax no", "vat", "tax id"] },
      { key: "subsidiary", label: "Subsidiary", required: true, aliases: ["subsidiary", "company", "company code", "branch", "legal entity"] },
    ],
  },
  {
    group: "Contact",
    fields: [
      { key: "email", label: "Email", aliases: ["email", "e-mail", "email address", "mail"] },
      { key: "phone", label: "Phone", aliases: ["phone", "phone no", "phone number", "tel", "mobile", "contact number"] },
      { key: "address", label: "Billing Address", aliases: ["address", "billing address", "street", "st address", "st. address"] },
      { key: "website", label: "Website", aliases: ["website", "url", "web"] },
    ],
  },
  {
    group: "Commercial",
    fields: [
      { key: "currency", label: "Currency", aliases: ["currency", "curr", "ccy"] },
      { key: "credit", label: "Credit Limit", aliases: ["credit", "credit limit", "limit"] },
      { key: "group", label: "Customer Group", aliases: ["group", "customer group", "category", "segment"] },
      { key: "opening", label: "Opening Balance", aliases: ["opening", "opening balance", "balance"] },
    ],
  },
];

const SUPPLIER_FIELDS: FieldGroup[] = [
  {
    group: "Identity",
    fields: [
      { key: "name", label: "Supplier Name", required: true, aliases: ["name", "supplier", "supplier name", "vendor", "party name"] },
      { key: "pan", label: "PAN / Tax No.", required: true, aliases: ["pan", "pan no", "tax", "vat"] },
      { key: "subsidiary", label: "Subsidiary", required: true, aliases: ["subsidiary", "company", "branch"] },
    ],
  },
  {
    group: "Contact",
    fields: [
      { key: "email", label: "Email", aliases: ["email", "e-mail", "mail"] },
      { key: "phone", label: "Phone", aliases: ["phone", "tel", "mobile"] },
      { key: "terms", label: "Payment Terms", aliases: ["terms", "payment terms", "credit days"] },
    ],
  },
];

const ITEM_FIELDS: FieldGroup[] = [
  {
    group: "Identity",
    fields: [
      { key: "code", label: "Item Code", required: true, aliases: ["code", "item code", "sku", "item"] },
      { key: "name", label: "Item Name", required: true, aliases: ["name", "item name", "description"] },
    ],
  },
  {
    group: "Classification",
    fields: [
      { key: "uom", label: "Unit of Measure", required: true, aliases: ["uom", "unit", "unit of measure"] },
      { key: "group", label: "Item Group", aliases: ["group", "item group", "category"] },
      { key: "rate", label: "Standard Rate", aliases: ["rate", "price", "standard rate", "mrp"] },
    ],
  },
];

// The importable set — filter-as-you-type over this. A few carry rich field
// sets; the rest fall back to a generic set so changing type still re-derives.
const GENERIC_FIELDS: FieldGroup[] = [
  { group: "Fields", fields: [
    { key: "name", label: "Name", required: true, aliases: ["name", "title"] },
    { key: "code", label: "Reference / Code", aliases: ["code", "ref", "id"] },
    { key: "subsidiary", label: "Subsidiary", required: true, aliases: ["subsidiary", "company", "branch"] },
  ] },
];

type DocType = { key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; fields: FieldGroup[] };

const DOC_TYPES: DocType[] = [
  { key: "customers", label: "Customers", icon: Users, fields: CUSTOMER_FIELDS },
  { key: "suppliers", label: "Suppliers", icon: Truck, fields: SUPPLIER_FIELDS },
  { key: "items", label: "Items / Products", icon: Package, fields: ITEM_FIELDS },
  { key: "contacts", label: "Contacts", icon: Contact, fields: GENERIC_FIELDS },
  { key: "leads", label: "Leads", icon: Sparkles, fields: GENERIC_FIELDS },
  { key: "sales_orders", label: "Sales Orders", icon: Receipt, fields: GENERIC_FIELDS },
  { key: "purchase_orders", label: "Purchase Orders", icon: FileText, fields: GENERIC_FIELDS },
  { key: "invoices", label: "Sales Invoices", icon: Receipt, fields: GENERIC_FIELDS },
  { key: "journals", label: "Journal Entries", icon: BookOpen, fields: GENERIC_FIELDS },
  { key: "coa", label: "Chart of Accounts", icon: Landmark, fields: GENERIC_FIELDS },
  { key: "employees", label: "Employees", icon: Building2, fields: GENERIC_FIELDS },
  { key: "price_list", label: "Price List", icon: Tag, fields: GENERIC_FIELDS },
  { key: "warehouses", label: "Warehouses", icon: Building2, fields: GENERIC_FIELDS },
  { key: "bank_txns", label: "Bank Transactions", icon: Wallet, fields: GENERIC_FIELDS },
];
const docByKey = (k: string | null) => DOC_TYPES.find((d) => d.key === k) ?? null;
const flatFields = (fg: FieldGroup[]) => fg.flatMap((g) => g.fields);

// ════════════════════════════════════════════════════════════════════════════
// SAMPLE FILES  ·  every state is reachable by picking one of these — no
// dev-only toggle. Each maps to a scenario the run / detection resolves to.
// ════════════════════════════════════════════════════════════════════════════

type Scenario = "clean" | "messy" | "wrongshape" | "unreadable" | "failstart" | "corrected";
type Column = { name: string; samples: string[] };

const CLEAN_COLUMNS: Column[] = [
  { name: "Customer Name", samples: ["Everest Traders Pvt Ltd", "Himalayan Foods", "Sunrise Suppliers"] },
  { name: "PAN No", samples: ["301234567", "302554120", "305998211"] },
  { name: "Subsidiary", samples: ["Bizak Nepal", "Bizak Nepal", "Bizak Trading"] },
  { name: "Email", samples: ["info@everest.com.np", "sales@himalayanfoods.np", "hello@sunrise.np"] },
  { name: "Phone", samples: ["01-4412200", "9801234567", "01-5321100"] },
  { name: "Billing Address", samples: ["Thamel, Kathmandu", "Lakeside, Pokhara", "Biratnagar-8"] },
  { name: "Currency", samples: ["NPR", "NPR", "USD"] },
  { name: "Credit Limit", samples: ["500000", "250000", "1200000"] },
  { name: "Customer Group", samples: ["Wholesale", "Retail", "Wholesale"] },
];

const MESSY_COLUMNS: Column[] = [
  { name: "Full Name", samples: ["Everest Traders Pvt Ltd", "Himalayan Foods", "Sunrise Suppliers"] },
  { name: "PAN No", samples: ["301234567", "—", "305998211"] },
  { name: "Entity ID", samples: ["NP-01", "NP-01", "NP-02"] },
  { name: "Email Address", samples: ["info@everest.com.np", "sales@himalayanfoods.np", "—"] },
  { name: "Phone", samples: ["01-4412200", "9801234567", "01-5321100"] },
  { name: "St. Address", samples: ["Thamel, Kathmandu", "Pokhara-8", "Biratnagar"] },
  { name: "Curr", samples: ["NPR", "NPR", "Rs"] },
  { name: "Credit", samples: ["500000", "N/A", "1200000"] },
  { name: "Category", samples: ["Wholesale", "Retail", "Wholesale"] },
];

const WRONG_COLUMNS: Column[] = [
  { name: "Voucher No", samples: ["JV-0091", "JV-0092", "JV-0093"] },
  { name: "Debit", samples: ["12,000", "4,500", "88,000"] },
  { name: "Credit", samples: ["0", "4,500", "0"] },
  { name: "Narration", samples: ["Opening entry", "Bank charge", "Depreciation"] },
];

type SampleFile = { name: string; scenario: Scenario; size: string; unsupported?: boolean };
const SAMPLE_FILES: SampleFile[] = [
  { name: "customers-clean.xlsx", scenario: "clean", size: "88 KB" },
  { name: "customers-messy.csv", scenario: "messy", size: "142 KB" },
  { name: "gl-export-2019.csv", scenario: "wrongshape", size: "61 KB" },
  { name: "export-locked.xlsx", scenario: "unreadable", size: "2.4 MB" },
  { name: "customers-full-8k.xlsx", scenario: "failstart", size: "14.2 MB" },
  { name: "annual-report.pdf", scenario: "clean", size: "3.1 MB", unsupported: true },
];

// Whole-file, server-computed run results (they reconcile: imported = total − failed).
type RunResult = { total: number; failed: RawProblem[]; liveChannel: boolean };
type RawProblem = { row: number | null; raw: string };

const MESSY_PROBLEMS: RawProblem[] = [
  { row: 12, raw: "UNIQUE constraint failed: customer.pan_no = 305998211" },
  { row: 45, raw: "NOT NULL constraint failed: customer.name" },
  { row: 78, raw: "invalid currency 'Rs'" },
  { row: 90, raw: "UNIQUE constraint failed: customer.pan_no = 301100200" },
  { row: 133, raw: "type error: credit_limit 'N/A' is not numeric" },
  { row: 201, raw: "NOT NULL constraint failed: customer.subsidiary_id" },
];
const RUN_RESULTS: Record<string, RunResult> = {
  clean: { total: 340, failed: [], liveChannel: false }, // live channel unavailable — still settles
  messy: { total: 214, failed: MESSY_PROBLEMS, liveChannel: true },
};

// ════════════════════════════════════════════════════════════════════════════
// PLAIN-LANGUAGE SURFACING  ·  raw system wording → friendly guidance.
// ════════════════════════════════════════════════════════════════════════════

function humanize(raw: string, typeLabel: string): string {
  let m: RegExpExecArray | null;
  if ((m = /UNIQUE constraint failed:.*?=\s*([\w-]+)/i.exec(raw)))
    return `A ${typeLabel} with PAN ${m[1]} already exists — skipped to avoid a duplicate.`;
  if (/NOT NULL constraint failed:.*name/i.test(raw))
    return `The name is blank. Every ${typeLabel.toLowerCase()} needs a name.`;
  if (/NOT NULL constraint failed:.*subsidiary/i.test(raw))
    return `Subsidiary is blank. Point the row at a company.`;
  if ((m = /invalid currency '([^']+)'/i.exec(raw)))
    return `“${m[1]}” isn’t a currency we recognise. Use a code like NPR or USD.`;
  if ((m = /credit_limit '([^']+)'/i.exec(raw)))
    return `Credit Limit “${m[1]}” isn’t a number.`;
  return raw; // fallback: never happens for seeded data
}
const typeLabelSingular = (label: string) => label.replace(/s$/, "").replace(" / Products", "");

// ════════════════════════════════════════════════════════════════════════════
// CONFIDENT-ONLY AUTO-MATCH  ·  binds a column to a field only on a strong name
// match; never binds a column two fields could both claim; never a column the
// file doesn't contain.
// ════════════════════════════════════════════════════════════════════════════

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function sim(a: string, b: string): number {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.length > 2 && nb.length > 2 && (na.includes(nb) || nb.includes(na))) return 0.82;
  const ta = new Set(a.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const tb = new Set(b.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const inter = [...ta].filter((t) => tb.has(t)).length;
  const uni = new Set([...ta, ...tb]).size;
  return uni ? inter / uni : 0;
}
const fieldScore = (f: FieldDef, col: string) => Math.max(sim(f.label, col), ...f.aliases.map((a) => sim(a, col)));

const CONF = 0.6;
function autoMatch(fields: FieldDef[], columns: Column[]): Record<string, string> {
  // A column is ambiguous if two different fields both claim it strongly and close.
  const ambiguous = new Set<string>();
  for (const c of columns) {
    const strong = fields.map((f) => fieldScore(f, c.name)).filter((s) => s >= CONF).sort((a, b) => b - a);
    if (strong.length >= 2 && strong[0] - strong[1] < 0.12) ambiguous.add(c.name);
  }
  // Each field takes its best non-ambiguous column ≥ threshold.
  const picks: { key: string; col: string; s: number }[] = [];
  for (const f of fields) {
    let best: { col: string; s: number } | null = null;
    for (const c of columns) {
      if (ambiguous.has(c.name)) continue;
      const s = fieldScore(f, c.name);
      if (s >= CONF && (!best || s > best.s)) best = { col: c.name, s };
    }
    if (best) picks.push({ key: f.key, col: best.col, s: best.s });
  }
  // If two fields pick the same column, keep the stronger; drop the weaker.
  const byCol = new Map<string, { key: string; s: number }>();
  for (const p of picks) {
    const prev = byCol.get(p.col);
    if (!prev || p.s > prev.s) byCol.set(p.col, { key: p.key, s: p.s });
  }
  const out: Record<string, string> = {};
  for (const [col, { key }] of byCol) out[key] = col;
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

function Switch({ value, onChange, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; ariaLabel: string }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span className={cn(
        "pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
        value ? "translate-x-[14px]" : "translate-x-[2px]",
      )} />
    </button>
  );
}

// ── portal position + dismiss helpers ─────────────────────────────────────────
function useAnchorPos(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !ref.current) { setPos(null); return; }
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, ref]);
  return pos;
}
function useDismiss(open: boolean, onClose: () => void, inner: React.RefObject<HTMLElement | null>, anchor: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (inner.current && !inner.current.contains(t) && anchor.current && !anchor.current.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onScroll = (e: Event) => { if (inner.current && e.target instanceof Node && inner.current.contains(e.target)) return; onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, inner, anchor]);
}

// ── toasts ────────────────────────────────────────────────────────────────────
type ToastKind = "success" | "warning";
type ToastItem = { id: number; kind: ToastKind; text: string };
function useToasts() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);
  const push = React.useCallback((kind: ToastKind, text: string) => {
    setToasts((t) => [...t, { id: ++idRef.current, kind, text }].slice(-3));
  }, []);
  const dismiss = React.useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  return { toasts, push, dismiss };
}
function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => <ToastRow key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}
function ToastRow({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const { id } = toast;
  React.useEffect(() => {
    const t = window.setTimeout(() => onDismiss(id), 4200);
    return () => window.clearTimeout(t);
  }, [id, onDismiss]);
  const ok = toast.kind === "success";
  return (
    <div className="pointer-events-auto flex w-full max-w-[420px] items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.24)]">
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-pill", ok ? "bg-bz-fire/[0.22]" : "bg-[#FBE7E5]")}>
        {ok ? <Check size={13} className="text-bz-leaf-deep" /> : <TriangleAlert size={13} className="text-[#9A2E29]" />}
      </span>
      <p className="min-w-0 flex-1 text-[12.5px] font-medium text-bz-text">{toast.text}</p>
      <button onClick={() => onDismiss(id)} aria-label="Dismiss" className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
        <X size={11} />
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT-TYPE CHOOSER  ·  single choice, filter-as-you-type.
// ════════════════════════════════════════════════════════════════════════════

function TypePicker({ value, onChange }: { value: string | null; onChange: (k: string) => void }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [raw, setRaw] = React.useState("");
  const pos = useAnchorPos(open, btnRef);
  useDismiss(open, () => setOpen(false), ref, btnRef);
  React.useEffect(() => { if (open) setRaw(""); }, [open]);
  const chosen = docByKey(value);
  const q = raw.trim().toLowerCase();
  const opts = q ? DOC_TYPES.filter((d) => d.label.toLowerCase().includes(q)) : DOC_TYPES;
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 w-full items-center gap-2.5 rounded-bz-md border px-3 text-left transition-colors",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface hover:border-bz-text-muted",
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-olive text-bz-fire">
          {chosen ? <chosen.icon size={14} /> : <FileSpreadsheet size={14} />}
        </span>
        <span className="min-w-0 flex-1">
          {chosen
            ? <span className="block truncate text-[13px] font-semibold text-bz-text">{chosen.label}</span>
            : <span className="text-[13px] text-bz-text-soft">Choose what you’re importing…</span>}
        </span>
        <ChevronDown size={15} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && pos && createPortal(
        <div
          ref={ref}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 300) }}
          className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
        >
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={12} className="shrink-0 text-bz-text-muted" />
              <input autoFocus value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Filter document types…"
                className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
            </div>
          </div>
          <div className="max-h-[280px] overflow-y-auto py-1">
            {opts.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-3 py-7 text-center">
                <Search size={15} className="text-bz-text-soft" />
                <p className="text-[11.5px] font-medium text-bz-text-muted">No types match “{raw}”.</p>
              </div>
            ) : opts.map((d) => {
              const selected = d.key === value;
              const Icon = d.icon;
              return (
                <button key={d.key} onClick={() => { onChange(d.key); setOpen(false); }}
                  className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted"><Icon size={13} /></span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-bz-text">{d.label}</span>
                  {selected && <Check size={13} className="shrink-0 text-bz-text" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COLUMN SELECT  ·  per mapping row — pick one of the file's columns or leave
// unmapped.
// ════════════════════════════════════════════════════════════════════════════

function ColumnSelect({ value, columns, onChange }: { value: string | null; columns: Column[]; onChange: (v: string | null) => void }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchorPos(open, btnRef);
  useDismiss(open, () => setOpen(false), ref, btnRef);
  return (
    <>
      <button ref={btnRef} type="button" onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-bz-sm border px-2.5 text-left transition-colors",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface hover:border-bz-text-muted",
        )}>
        <span className={cn("min-w-0 flex-1 truncate text-[12px]", value ? "font-medium text-bz-text" : "text-bz-text-soft")}>
          {value ?? "Leave unmapped"}
        </span>
        <ChevronDown size={12} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && pos && createPortal(
        <div ref={ref} style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 240) }}
          className="z-50 max-h-[300px] overflow-y-auto rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          <button onClick={() => { onChange(null); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-bz-text-soft transition-colors hover:bg-bz-paper-warm">
            <Ban size={12} /> Leave unmapped
          </button>
          <div className="my-1 border-t border-bz-line-soft" />
          {columns.map((c) => {
            const selected = c.name === value;
            return (
              <button key={c.name} onClick={() => { onChange(c.name); setOpen(false); }}
                className={cn("flex w-full items-start gap-2 px-3 py-1.5 text-left transition-colors hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-bz-text">{c.name}</span>
                  <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{c.samples.slice(0, 3).join(" · ")}</span>
                </span>
                {selected && <Check size={12} className="mt-0.5 shrink-0 text-bz-text" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SETUP CARD  ·  the "what to import" recipe: type · mode · file · options.
// ════════════════════════════════════════════════════════════════════════════

function ModeToggle({ value, onChange }: { value: "create" | "update" | null; onChange: (m: "create" | "update") => void }) {
  const opt = (m: "create" | "update", label: string, sub: string) => {
    const on = value === m;
    return (
      <button onClick={() => onChange(m)}
        className={cn(
          "flex-1 rounded-bz-sm border px-3 py-2 text-left transition-colors",
          on ? "border-bz-fire bg-bz-fire/[0.14]" : "border-bz-line bg-bz-surface hover:border-bz-text-muted",
        )}>
        <span className="flex items-center gap-1.5">
          <span className={cn("flex size-3.5 items-center justify-center rounded-bz-pill border", on ? "border-bz-leaf-deep bg-bz-leaf-deep" : "border-bz-line")}>
            {on && <Check size={9} className="text-bz-surface" />}
          </span>
          <span className="text-[12.5px] font-semibold text-bz-text">{label}</span>
        </span>
        <span className="mt-0.5 block pl-5 text-[11px] text-bz-text-muted">{sub}</span>
      </button>
    );
  };
  return (
    <div className="flex gap-2">
      {opt("create", "Create new", "Add records that don’t exist yet")}
      {opt("update", "Update existing", "Match and overwrite by key")}
    </div>
  );
}

function OptionsPopover({ checkOnly, notify, onCheckOnly, onNotify }: {
  checkOnly: boolean; notify: boolean; onCheckOnly: (v: boolean) => void; onNotify: (v: boolean) => void;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchorPos(open, btnRef);
  useDismiss(open, () => setOpen(false), ref, btnRef);
  return (
    <>
      <button ref={btnRef} type="button" onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-bz-md border px-2.5 text-[11.5px] font-medium transition-colors",
          checkOnly ? "border-bz-fire bg-bz-fire/[0.14] text-bz-text" : "border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm",
        )}>
        <Settings2 size={13} /> {checkOnly ? "Check-only" : "Options"}
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && pos && createPortal(
        <div ref={ref} style={{ position: "fixed", top: pos.top, left: Math.max(12, pos.left - 180), width: 280 }}
          className="z-50 rounded-bz-md border border-bz-line bg-bz-surface p-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          <OptionRow label="Check only (dry run)" sub="Inspect for problems and save nothing." value={checkOnly} onChange={onCheckOnly} />
          <div className="mx-2 border-t border-bz-line-soft" />
          <OptionRow label="Notify me when it finishes" sub="Useful for long imports." value={notify} onChange={onNotify} />
        </div>,
        document.body,
      )}
    </>
  );
}
function OptionRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3 rounded-bz-sm px-2.5 py-2">
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold text-bz-text">{label}</span>
        <span className="mt-0.5 block text-[10.5px] text-bz-text-muted">{sub}</span>
      </span>
      <div className="pt-0.5"><Switch value={value} onChange={onChange} ariaLabel={label} /></div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FILE DROP  ·  none / attached / replaced; refuses unsupported formats.
// ════════════════════════════════════════════════════════════════════════════

const fileGlyph = (name: string) => name.endsWith(".csv") ? FileText : name.endsWith(".pdf") ? FileIcon : FileSpreadsheet;

function FileDrop({ file, onPick, onReplace, onClear }: {
  file: SampleFile | null;
  onPick: (f: SampleFile) => void;
  onReplace: () => void;
  onClear: () => void;
}) {
  if (file) {
    const Glyph = fileGlyph(file.name);
    return (
      <div className="flex items-center gap-3 rounded-bz-md border border-bz-line bg-bz-surface px-3 py-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-leaf/50 text-bz-text"><Glyph size={15} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-semibold text-bz-text">{file.name}</span>
          <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{file.size} · staged, not yet imported</span>
        </span>
        <button onClick={onReplace} className="inline-flex h-7 items-center gap-1.5 rounded-bz-sm border border-bz-line px-2 text-[11px] font-medium text-bz-text hover:bg-bz-paper-warm">
          <RefreshCw size={11} /> Replace
        </button>
        <button onClick={onClear} aria-label="Remove file" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={13} /></button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex flex-col items-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/50 px-4 py-6 text-center">
        <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted shadow-[0_1px_2px_rgba(15,20,17,0.06)]"><Upload size={16} /></span>
        <p className="text-[12.5px] font-medium text-bz-text">Drop a spreadsheet, or pick a sample below</p>
        <p className="text-[10.5px] text-bz-text-soft">Accepts .csv and .xlsx</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SAMPLE_FILES.map((s) => {
          const Glyph = fileGlyph(s.name);
          return (
            <button key={s.name} onClick={() => onPick(s)}
              className="inline-flex items-center gap-1.5 rounded-bz-pill border border-bz-line-soft bg-bz-surface px-2.5 py-1 text-[11px] font-medium text-bz-text-muted transition-colors hover:border-bz-text-muted hover:text-bz-text">
              <Glyph size={11} /> {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COVERAGE METER  ·  how much of the required set is still unmapped.
// ════════════════════════════════════════════════════════════════════════════

function CoverageMeter({ mapped, total }: { mapped: number; total: number }) {
  const pct = total ? Math.round((mapped / total) * 100) : 100;
  const done = mapped >= total;
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-28 overflow-hidden rounded-bz-pill bg-bz-line-soft">
        <div className={cn("h-full rounded-bz-pill transition-all", done ? "bg-bz-leaf-deep" : "bg-bz-fire")} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("text-[11.5px] font-medium", done ? "text-bz-text" : "text-bz-text-muted", NUM)}>
        {mapped} of {total} required mapped
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAPPING ROW
// ════════════════════════════════════════════════════════════════════════════

function MappingRow({ field, value, columns, onChange }: {
  field: FieldDef; value: string | null; columns: Column[]; onChange: (v: string | null) => void;
}) {
  const col = columns.find((c) => c.name === value) ?? null;
  const status: "mapped" | "needed" | "optional" = value ? "mapped" : field.required ? "needed" : "optional";
  const dot = status === "mapped" ? "bg-bz-leaf-deep" : status === "needed" ? "bg-[#C0413A]" : "bg-bz-line";
  return (
    <div className="flex items-center gap-2.5 py-2.5 sm:gap-3">
      {/* target field (left) */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className={cn("size-1.5 shrink-0 rounded-bz-pill", dot)} />
        <span className="truncate text-[12.5px] font-medium text-bz-text">{field.label}</span>
        {field.required && <span className="shrink-0 text-[12px] leading-none text-[#C0413A]">*</span>}
        {status === "needed" && <span className="shrink-0 text-[10px] font-medium text-[#9A2E29]">needed</span>}
        {status === "optional" && <span className="shrink-0 text-[10px] text-bz-text-soft">optional</span>}
      </div>
      {/* connector */}
      <ArrowRight size={13} className="shrink-0 text-bz-text-soft" />
      {/* source column (right) */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="min-w-0 flex-1"><ColumnSelect value={value} columns={columns} onChange={onChange} /></div>
        {col && (
          <span className={cn("hidden max-w-[42%] shrink truncate text-[10.5px] text-bz-text-soft md:block", NUM)}>
            {col.samples.slice(0, 2).join(" · ")}
          </span>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIVE PROGRESS + OUTCOME
// ════════════════════════════════════════════════════════════════════════════

type Progress = { total: number; processed: number; succeeded: number; failed: number };
type OutcomeKind = "success" | "partial" | "none" | "failstart" | "mismatch";
type Outcome = {
  kind: OutcomeKind;
  checkOnly: boolean;
  total: number;
  ok: number;
  bad: number;
  problems: RawProblem[];
  typeLabel: string;
  hasFailedFile: boolean;
};

function RunningPanel({ p, phrase }: { p: Progress; phrase: string }) {
  const pct = p.total ? Math.round((p.processed / p.total) * 100) : 0;
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-bz-text">
        <Loader2 size={15} className="animate-spin text-bz-fire" /> {phrase}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-bz-pill bg-bz-line-soft">
        <div className="h-full rounded-bz-pill bg-bz-fire transition-all duration-200" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11.5px]">
        <Legend dot="bg-bz-line" label="Processed" value={`${g(p.processed)} / ${g(p.total)}`} />
        <Legend dot="bg-bz-leaf-deep" label="Succeeded" value={g(p.succeeded)} />
        <Legend dot="bg-[#C0413A]" label="Failed" value={g(p.failed)} />
      </div>
    </div>
  );
}
function Legend({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-bz-text-muted">
      <span className={cn("size-1.5 rounded-bz-pill", dot)} />
      {label} <span className={cn("font-semibold text-bz-text", NUM)}>{value}</span>
    </span>
  );
}

const VERDICT: Record<OutcomeKind, { title: (o: Outcome) => string; tone: "positive" | "partial" | "danger" | "neutral"; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  success: { title: (o) => o.checkOnly ? "File is clean — no problems found" : "Fully imported", tone: "positive", icon: CircleCheck },
  partial: { title: (o) => o.checkOnly ? "Some rows have problems" : "Partially imported", tone: "partial", icon: TriangleAlert },
  none: { title: (o) => o.checkOnly ? "Every row has a problem" : "Nothing imported", tone: "danger", icon: CircleAlert },
  failstart: { title: () => "The import couldn’t start", tone: "danger", icon: Ban },
  mismatch: { title: () => "These columns don’t match", tone: "danger", icon: FileText },
};

function OutcomePanel({ outcome, mismatchHeaders, onDownload, onFixRetry, onDismissFile, failedFileState }: {
  outcome: Outcome;
  mismatchHeaders?: string[];
  onDownload: () => void;
  onFixRetry: () => void;
  onDismissFile: () => void;
  failedFileState: "none" | "ready" | "discarded";
}) {
  const v = VERDICT[outcome.kind];
  const Icon = v.icon;
  const okLabel = outcome.checkOnly ? "Valid" : "Imported";
  const badLabel = outcome.checkOnly ? "With problems" : "Failed";
  const tint = v.tone === "positive" ? "bg-bz-fire/[0.14]" : v.tone === "partial" ? "bg-bz-leaf/40" : "bg-[#FBE5E2]";
  const iconTint = v.tone === "positive" ? "text-bz-leaf-deep" : v.tone === "danger" ? "text-[#9A2E29]" : "text-bz-text";

  if (outcome.kind === "mismatch") {
    return (
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <div className={cn("flex items-start gap-3 border-b border-bz-line-soft px-5 py-4", tint)}>
          <span className={cn("mt-0.5", iconTint)}><Icon size={18} /></span>
          <div>
            <p className="text-[14px] font-semibold text-bz-text">{v.title(outcome)}</p>
            <p className="mt-0.5 text-[12px] text-bz-text-muted">
              This file doesn’t look like <span className="font-medium text-bz-text">{outcome.typeLabel}</span> data — none of its columns line up with the expected fields. Nothing was imported.
            </p>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className={LABEL}>Found in the file</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(mismatchHeaders ?? []).map((h) => (
              <span key={h} className="rounded-bz-sm bg-bz-paper-warm px-2 py-0.5 text-[11px] font-medium text-bz-text-muted">{h}</span>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-bz-text-muted">Attach a file whose first row is column headers for {outcome.typeLabel}, or start from a template.</p>
          <button onClick={onFixRetry} className={cn(GHOST_BTN, "mt-3")}><RefreshCw size={13} /> Attach a different file</button>
        </div>
      </div>
    );
  }

  if (outcome.kind === "failstart") {
    return (
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <div className={cn("flex items-start gap-3 px-5 py-4", tint)}>
          <span className={cn("mt-0.5", iconTint)}><Icon size={18} /></span>
          <div>
            <p className="text-[14px] font-semibold text-bz-text">{v.title(outcome)}</p>
            <p className="mt-0.5 text-[12px] text-bz-text-muted">The file is larger than the importer accepts in one run. Split it into smaller files and import them one after another.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className={cn("flex items-center gap-3 border-b border-bz-line-soft px-5 py-4", tint)}>
        <span className={iconTint}><Icon size={18} /></span>
        <p className="flex-1 text-[14px] font-semibold text-bz-text">{v.title(outcome)}</p>
        <span className={cn("text-[11px] font-medium text-bz-text-muted", NUM)}>{outcome.checkOnly ? "Dry run · nothing saved" : "Live import"}</span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-bz-line-soft border-b border-bz-line-soft">
        <Count value={outcome.total} label="Records in file" tone="neutral" />
        <Count value={outcome.ok} label={okLabel} tone="positive" />
        <Count value={outcome.bad} label={badLabel} tone={outcome.bad ? "danger" : "neutral"} />
      </div>
      {outcome.problems.length > 0 && (
        <div className="px-5 py-4">
          <p className={LABEL}>What went wrong</p>
          <ul className="mt-2 space-y-1.5">
            {outcome.problems.slice(0, 4).map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-bz-text">
                {p.row != null
                  ? <span className={cn("mt-px shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text-muted", NUM)}>Row {p.row}</span>
                  : <span className="mt-px shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text-muted">Whole file</span>}
                <span className="text-bz-text-muted">{humanize(p.raw, outcome.typeLabel)}</span>
              </li>
            ))}
          </ul>
          {outcome.problems.length > 4 && (
            <p className={cn("mt-2 text-[11px] text-bz-text-soft", NUM)}>+ {outcome.problems.length - 4} more in the downloadable file below</p>
          )}
        </div>
      )}
      {outcome.hasFailedFile && !outcome.checkOnly && (
        <div className="flex flex-wrap items-center gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-5 py-3.5">
          {failedFileState !== "discarded" ? (
            <>
              <button onClick={onDownload} className={GHOST_BTN}><Download size={13} /> Download failed rows</button>
              <button onClick={onFixRetry} className={PRIMARY_BTN}><RefreshCw size={13} /> Fix &amp; retry</button>
              {failedFileState === "ready" && (
                <button onClick={onDismissFile} className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted hover:text-[#9A2E29]">
                  <Trash2 size={12} /> Discard failed file
                </button>
              )}
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-soft"><Trash2 size={12} /> Failed file discarded</span>
              <button onClick={onFixRetry} className={cn(PRIMARY_BTN, "ml-auto")}><RefreshCw size={13} /> Fix &amp; retry</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
function Count({ value, label, tone }: { value: number; label: string; tone: "positive" | "danger" | "neutral" }) {
  const color = tone === "positive" ? "text-bz-text" : tone === "danger" ? "text-[#9A2E29]" : "text-bz-text";
  return (
    <div className="px-5 py-4">
      <p className={cn("text-[24px] font-semibold leading-none tracking-tight", color, NUM)}>{g(value)}</p>
      <p className="mt-1.5 text-[11px] font-medium text-bz-text-muted">{label}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SESSION TALLY  ·  a thin, expandable record of every attempt in this session.
// ════════════════════════════════════════════════════════════════════════════

type Attempt = { n: number; file: string; total: number; imported: number; failed: number; tone: "all" | "partial" | "none"; checkOnly: boolean };

function SessionTally({ attempts, imported, failing, complete, onStartOver }: {
  attempts: Attempt[]; imported: number; failing: number; complete: boolean; onStartOver: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  if (attempts.length === 0) return null;
  const latest = attempts[attempts.length - 1];
  return (
    <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className={cn("flex size-6 items-center justify-center rounded-bz-pill", complete ? "bg-bz-fire/[0.22] text-bz-leaf-deep" : "bg-bz-paper-warm text-bz-text-muted")}>
          {complete ? <Check size={13} /> : <History size={12} />}
        </span>
        <div className="flex-1 text-[12px]">
          <span className="font-semibold text-bz-text">
            {complete ? "Import complete" : `Attempt ${latest.n}`}
          </span>
          <span className={cn("text-bz-text-muted", NUM)}>
            {" · "}{g(imported)} imported{failing > 0 ? ` · ${g(failing)} still failing` : " · nothing failing"}
          </span>
        </div>
        <button onClick={onStartOver} className="inline-flex items-center gap-1 text-[11px] font-medium text-bz-text-muted hover:text-bz-text">
          <RotateCw size={11} /> Start over
        </button>
        <button onClick={() => setOpen((v) => !v)} aria-label="Toggle attempts" className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-bz-line-soft">
          {attempts.map((a) => {
            const tone = a.tone === "all" ? "bg-bz-leaf-deep" : a.tone === "partial" ? "bg-bz-fire" : "bg-[#C0413A]";
            return (
              <div key={a.n} className="flex items-center gap-3 px-4 py-2 text-[11.5px] odd:bg-bz-paper-warm/30">
                <span className={cn("size-1.5 shrink-0 rounded-bz-pill", tone)} />
                <span className={cn("w-10 shrink-0 font-semibold text-bz-text-muted", NUM)}>#{a.n}</span>
                <span className="min-w-0 flex-1 truncate text-bz-text">{a.file}{a.checkOnly && <span className="ml-1.5 text-bz-text-soft">(check)</span>}</span>
                <span className={cn("shrink-0 text-bz-text-muted", NUM)}>{g(a.imported)} in · {g(a.failed)} failed</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DETECTION STATES  ·  reading / unreadable(retry).
// ════════════════════════════════════════════════════════════════════════════

function DetectionReading({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-5 py-6 text-[12.5px] font-medium text-bz-text-muted">
      <Loader2 size={15} className="animate-spin text-bz-fire" /> Reading columns from {name}…
    </div>
  );
}
function DetectionError({ reason, onRetry }: { reason: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-bz-lg border border-[#F1C7C2] bg-[#FBE5E2]/40 px-5 py-4">
      <span className="mt-0.5 text-[#9A2E29]"><TriangleAlert size={16} /></span>
      <div className="flex-1">
        <p className="text-[12.5px] font-semibold text-bz-text">Couldn’t read this file</p>
        <p className="mt-0.5 text-[12px] text-bz-text-muted">{reason}</p>
        <button onClick={onRetry} className={cn(GHOST_BTN, "mt-2.5")}><RotateCw size={13} /> Try reading again</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

type DetState =
  | { status: "idle" }
  | { status: "reading" }
  | { status: "ready"; columns: Column[] }
  | { status: "error"; reason: string }
  | { status: "mismatch"; headers: string[] };

export function BulkDataImportDesignPage() {
  const { toasts, push, dismiss } = useToasts();

  // ── session state ───────────────────────────────────────────────────────────
  const [docType, setDocType] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"create" | "update" | null>(null);
  const [checkOnly, setCheckOnly] = React.useState(false);
  const [notify, setNotify] = React.useState(false);
  const [file, setFile] = React.useState<SampleFile | null>(null);
  const [det, setDet] = React.useState<DetState>({ status: "idle" });
  const [mapping, setMapping] = React.useState<Record<string, string | null>>({});
  const [progress, setProgress] = React.useState<Progress | null>(null);
  const [running, setRunning] = React.useState(false);
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);
  const [attempts, setAttempts] = React.useState<Attempt[]>([]);
  const [failedFile, setFailedFile] = React.useState<"none" | "ready" | "discarded">("none");
  const [mapEditing, setMapEditing] = React.useState(true); // recede once an outcome lands

  const doc = docByKey(docType);
  const groups = doc?.fields ?? [];
  const fields = React.useMemo(() => flatFields(groups), [groups]);
  const columns = det.status === "ready" ? det.columns : [];

  const reqFields = fields.filter((f) => f.required);
  const reqMapped = reqFields.filter((f) => mapping[f.key]).length;
  const missingReq = reqFields.filter((f) => !mapping[f.key]);
  const coverageDone = missingReq.length === 0 && reqFields.length > 0;

  // ── COLUMN DETECTION ·· re-reads on type / file / mode change, with an
  // out-of-order guard: a stale read can never overwrite a newer one. ──────────
  const reqIdRef = React.useRef(0);
  const retryRef = React.useRef(0); // bump to force a re-read of the same file
  React.useEffect(() => {
    if (!docType || !file) { setDet({ status: "idle" }); return; }
    const myId = ++reqIdRef.current;
    setDet({ status: "reading" });
    setMapping({});
    const t = window.setTimeout(() => {
      if (reqIdRef.current !== myId) return; // superseded — drop this result
      const scn = file.scenario;
      if (scn === "unreadable" && retryRef.current === 0) {
        setDet({ status: "error", reason: "It may be password-protected or corrupt. Remove the protection, re-save it, and try again." });
        return;
      }
      if (scn === "wrongshape") {
        setDet({ status: "mismatch", headers: WRONG_COLUMNS.map((c) => c.name) });
        return;
      }
      const cols = scn === "messy" ? MESSY_COLUMNS : CLEAN_COLUMNS;
      setDet({ status: "ready", columns: cols });
      setMapping(autoMatch(fields, cols));
    }, 950);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docType, file, mode]);

  // When detection lands on a real mismatch, surface it as an outcome (no run).
  React.useEffect(() => {
    if (det.status === "mismatch" && doc) {
      setOutcome({ kind: "mismatch", checkOnly, total: 0, ok: 0, bad: 0, problems: [], typeLabel: typeLabelSingular(doc.label), hasFailedFile: false });
      setMapEditing(false);
    } else if (det.status === "reading" || det.status === "ready") {
      // a fresh read clears a stale mismatch outcome
      setOutcome((o) => (o && o.kind === "mismatch" ? null : o));
      if (det.status === "ready") setMapEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [det.status]);

  const retryDetection = () => {
    retryRef.current += 1;
    if (!file) return;
    const myId = ++reqIdRef.current;
    setDet({ status: "reading" });
    window.setTimeout(() => {
      if (reqIdRef.current !== myId) return;
      setDet({ status: "ready", columns: CLEAN_COLUMNS });
      setMapping(autoMatch(fields, CLEAN_COLUMNS));
      push("success", "Read the file on the second try.");
    }, 950);
  };

  // ── RUN TRIGGER guard ───────────────────────────────────────────────────────
  const blockReason: string | null =
    det.status === "reading" ? "Reading the file’s columns…"
    : !docType ? "Choose a document type"
    : !mode ? "Choose create or update"
    : !file ? "Attach a file"
    : det.status === "error" ? "The file couldn’t be read"
    : det.status === "mismatch" ? "The file’s columns don’t match"
    : !coverageDone ? `Map ${missingReq.length} required field${missingReq.length > 1 ? "s" : ""}: ${missingReq.map((f) => f.label).join(", ")}`
    : null;
  const canRun = blockReason === null && !running;

  // ── RUN simulation (two-source progress, single authority) ───────────────────
  type Pending = { scn: Scenario; frozenCheckOnly: boolean; total: number; failed: RawProblem[]; liveChannel: boolean; typeLabel: string; fileName: string };
  const [pending, setPending] = React.useState<Pending | null>(null);

  const startRun = () => {
    if (!canRun || !file || !doc) return;
    const frozen = checkOnly; // capture the value in effect at run start
    const typeLabel = typeLabelSingular(doc.label);
    if (file.scenario === "failstart") {
      setOutcome({ kind: "failstart", checkOnly: frozen, total: 0, ok: 0, bad: 0, problems: [], typeLabel, hasFailedFile: false });
      setMapEditing(false);
      push("warning", "The import couldn’t start — file too large.");
      return;
    }
    const isCorrected = file.scenario === "corrected";
    const stillFailing = attempts.length ? attempts[attempts.length - 1].failed : 0;
    const base = isCorrected
      ? { total: stillFailing, failed: [] as RawProblem[], liveChannel: true }
      : RUN_RESULTS[file.scenario] ?? RUN_RESULTS.clean;
    setOutcome(null);
    setRunning(true);
    setProgress({ total: base.total, processed: 0, succeeded: 0, failed: 0 });
    setPending({ scn: file.scenario, frozenCheckOnly: frozen, total: base.total, failed: base.failed, liveChannel: base.liveChannel, typeLabel, fileName: file.name });
  };

  // Drive the live progress + settle authoritatively. Teardown-safe.
  React.useEffect(() => {
    if (!pending) return;
    const { total, failed, liveChannel, frozenCheckOnly, typeLabel, fileName } = pending;
    const failCount = failed.length;
    let interval: number | undefined;
    if (liveChannel) {
      const step = Math.max(1, Math.ceil(total / 14));
      interval = window.setInterval(() => {
        setProgress((p) => {
          if (!p) return p;
          const processed = Math.min(total, p.processed + step);
          const failedSoFar = Math.round((processed / total) * failCount);
          return { total, processed, succeeded: processed - failedSoFar, failed: failedSoFar };
        });
      }, 130);
    }
    // Authoritative settle — always fires, even if no live update ever arrived.
    const settle = window.setTimeout(() => {
      if (interval) window.clearInterval(interval);
      const ok = total - failCount; // consistent-grain: succeeded = attempted − failed
      setProgress({ total, processed: total, succeeded: ok, failed: failCount });
      const kind: OutcomeKind = failCount === 0 ? "success" : ok === 0 ? "none" : "partial";
      setOutcome({
        kind, checkOnly: frozenCheckOnly, total, ok, bad: failCount,
        problems: failed, typeLabel, hasFailedFile: failCount > 0,
      });
      setAttempts((prev) => [...prev, {
        n: prev.length + 1, file: fileName, total, imported: frozenCheckOnly ? 0 : ok, failed: failCount,
        tone: failCount === 0 ? "all" : ok === 0 ? "none" : "partial", checkOnly: frozenCheckOnly,
      }]);
      setFailedFile(failCount > 0 && !frozenCheckOnly ? "ready" : "none");
      setRunning(false);
      setMapEditing(false);
      if (notify) push("success", "Import finished — you’ve been notified.");
      setPending(null);
    }, liveChannel ? 2100 : 900);
    return () => { if (interval) window.clearInterval(interval); window.clearTimeout(settle); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  // ── correct-and-retry vs start-over ─────────────────────────────────────────
  const fixAndRetry = () => {
    // stage a corrected file that already carries the system's field names → it
    // maps itself automatically. Continues the session (attempt N+1).
    setFailedFile("none");
    setFile({ name: "customers-corrected.csv", scenario: "corrected", size: "9 KB" });
    push("success", "Corrected file attached — it mapped itself. Run when ready.");
  };
  const startOver = () => {
    setDocType(null); setMode(null); setCheckOnly(false); setNotify(false);
    setFile(null); setDet({ status: "idle" }); setMapping({});
    setProgress(null); setRunning(false); setOutcome(null); setAttempts([]);
    setFailedFile("none"); setMapEditing(true); retryRef.current = 0;
    push("success", "Started a fresh import session.");
  };

  // ── file attach / replace / unsupported refusal ─────────────────────────────
  const pickFile = (f: SampleFile) => {
    if (f.unsupported) {
      push("warning", `${f.name} isn’t a spreadsheet. Export it as .csv or .xlsx and attach that.`);
      return;
    }
    retryRef.current = 0;
    setFile(f);
    setOutcome((o) => (o && (o.kind === "failstart" || o.kind === "mismatch") ? null : o));
  };

  // ── session tally derivation ────────────────────────────────────────────────
  const sessionImported = attempts.reduce((s, a) => s + a.imported, 0);
  const stillFailing = attempts.length ? attempts[attempts.length - 1].failed : 0;
  const sessionComplete = attempts.length > 0 && stillFailing === 0 && attempts.some((a) => !a.checkOnly && a.imported > 0);

  // ── render ──────────────────────────────────────────────────────────────────
  const showSetup = !running;
  const showMapping = det.status === "ready" && !running;
  const primaryLabel = checkOnly ? "Check file" : mode === "update" ? "Update records" : "Import records";

  return (
    <AppShell
      breadcrumb={<Breadcrumb />}
      overlay={
        <>
          <RunBar
            label={primaryLabel}
            reason={blockReason}
            canRun={canRun}
            running={running}
            checkOnly={checkOnly}
            onRun={startRun}
          />
          <Toaster toasts={toasts} onDismiss={dismiss} />
        </>
      }
    >
      <div className="mx-auto w-full max-w-[860px] px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
        {/* header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-bz-text sm:text-[25px]">Import data</h1>
            <p className="mt-1 text-[12.5px] text-bz-text-muted">Load a spreadsheet, match its columns to Bizak fields, run, and fix what didn’t take — all on this page.</p>
          </div>
          <a href="/design" className="mt-1 hidden shrink-0 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 py-1.5 text-[11.5px] font-medium text-bz-text-muted transition-colors hover:bg-bz-paper-warm sm:inline-flex">
            <History size={13} /> Past imports
          </a>
        </div>

        <div className="space-y-4">
          {/* session tally — accumulates every attempt */}
          <SessionTally
            attempts={attempts}
            imported={sessionImported}
            failing={stillFailing}
            complete={sessionComplete}
            onStartOver={startOver}
          />

          {/* SETUP — the recipe */}
          {showSetup && (
            <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className={cn(LABEL, "mb-2")}>Document type</p>
                  <TypePicker value={docType} onChange={(k) => { setDocType(k); }} />
                </div>
                <div>
                  <p className={cn(LABEL, "mb-2")}>Mode</p>
                  <ModeToggle value={mode} onChange={setMode} />
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className={LABEL}>Spreadsheet</p>
                  <OptionsPopover checkOnly={checkOnly} notify={notify} onCheckOnly={setCheckOnly} onNotify={setNotify} />
                </div>
                <FileDrop
                  file={file}
                  onPick={pickFile}
                  onReplace={() => setFile(null)}
                  onClear={() => { setFile(null); setDet({ status: "idle" }); }}
                />
              </div>
            </div>
          )}

          {/* OUTCOME — inline, prominent when a run (or mismatch) settles */}
          {outcome && (
            <OutcomePanel
              outcome={outcome}
              mismatchHeaders={det.status === "mismatch" ? det.headers : undefined}
              onDownload={() => push("success", "failed-rows.csv downloaded — each row carries its exact reason.")}
              onFixRetry={fixAndRetry}
              onDismissFile={() => { setFailedFile("discarded"); push("success", "Failed-rows file discarded."); }}
              failedFileState={failedFile}
            />
          )}

          {/* DETECTION in-progress / error */}
          {det.status === "reading" && file && <DetectionReading name={file.name} />}
          {det.status === "error" && <DetectionError reason={(det as { reason: string }).reason} onRetry={retryDetection} />}

          {/* MAPPING — the body (or a receded one-line summary once an outcome exists) */}
          {showMapping && !mapEditing && (
            <button onClick={() => setMapEditing(true)}
              className="flex w-full items-center gap-2.5 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 text-left transition-colors hover:bg-bz-paper-warm">
              <CircleCheck size={15} className="shrink-0 text-bz-leaf-deep" />
              <span className={cn("flex-1 text-[12.5px] text-bz-text", NUM)}>
                <span className="font-semibold">{Object.values(mapping).filter(Boolean).length} columns mapped</span>
                <span className="text-bz-text-muted"> · {doc?.label}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-muted">Edit mapping <ChevronRight size={13} /></span>
            </button>
          )}

          {showMapping && mapEditing && (
            <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bz-line-soft px-5 py-3.5">
                <div>
                  <p className="text-[13px] font-semibold text-bz-text">Match columns to fields</p>
                  <p className="mt-0.5 text-[11.5px] text-bz-text-muted">We pre-filled confident matches. Fill anything still needed.</p>
                </div>
                <CoverageMeter mapped={reqMapped} total={reqFields.length} />
              </div>
              {/* two-column mapping header: target field ← → source column */}
              <div className="flex items-center gap-2.5 border-b border-bz-line-soft bg-bz-paper-warm/40 px-5 py-2 sm:gap-3">
                <span className={cn(LABEL, "flex-1")}>Bizak field</span>
                <span className="w-[13px] shrink-0" />
                <span className={cn(LABEL, "flex-1")}>Column in your file</span>
              </div>
              <div className="px-5 py-1">
                {groups.map((grp, gi) => (
                  <div key={grp.group} className={cn(gi > 0 && "border-t border-bz-line-soft")}>
                    <p className={cn(LABEL, "pb-1 pt-3.5")}>{grp.group}</p>
                    <div className="divide-y divide-bz-line-soft/70">
                      {grp.fields.map((f) => (
                        <MappingRow key={f.key} field={f} value={mapping[f.key] ?? null} columns={columns}
                          onChange={(v) => setMapping((m) => ({ ...m, [f.key]: v }))} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RUNNING */}
          {running && progress && (
            <RunningPanel p={progress} phrase={checkOnly ? "Checking the file…" : mode === "update" ? "Updating records…" : "Importing records…"} />
          )}

          {/* empty prompt */}
          {det.status === "idle" && !outcome && (
            <div className="flex flex-col items-center gap-2 rounded-bz-lg border border-dashed border-bz-line bg-bz-surface/60 px-6 py-10 text-center">
              <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Info size={16} /></span>
              <p className="text-[12.5px] font-medium text-bz-text">Choose a document type and attach a file to begin</p>
              <p className="max-w-[340px] text-[11.5px] text-bz-text-soft">Once both are set, Bizak reads the file’s columns and lines them up with the fields for that record type.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Breadcrumb() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px]">
      <span className="text-bz-text-muted">Administration</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Import Data</span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED RUN BAR  ·  the one primary action; always visible; gated with reason.
// ════════════════════════════════════════════════════════════════════════════

function RunBar({ label, reason, canRun, running, checkOnly, onRun }: {
  label: string; reason: string | null; canRun: boolean; running: boolean; checkOnly: boolean; onRun: () => void;
}) {
  return (
    <div className="border-t border-bz-line bg-bz-paper px-4 py-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-[860px] items-center gap-3">
        <div className="min-w-0 flex-1">
          {running ? (
            <span className="inline-flex items-center gap-2 text-[12px] font-medium text-bz-text-muted"><Loader2 size={13} className="animate-spin text-bz-fire" /> Run in progress…</span>
          ) : reason ? (
            <span className="inline-flex items-center gap-2 text-[12px] text-bz-text-muted">
              <CircleAlert size={13} className="shrink-0 text-bz-text-soft" /> <span className="truncate">{reason}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-[12px] font-medium text-bz-text">
              <CircleCheck size={13} className="shrink-0 text-bz-leaf-deep" /> Ready {checkOnly ? "to check" : "to import"} — nothing runs until you press.
            </span>
          )}
        </div>
        <button onClick={onRun} disabled={!canRun} className={PRIMARY_BTN}>
          {running ? <Loader2 size={14} className="animate-spin" /> : checkOnly ? <Check size={14} /> : <Play size={14} />}
          {label}
        </button>
      </div>
    </div>
  );
}
