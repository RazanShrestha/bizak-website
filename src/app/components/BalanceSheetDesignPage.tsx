import * as React from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import {
  ChevronRight,
  // control bar
  CalendarRange,
  CalendarClock,
  Building2,
  MapPin,
  Layers,
  Tag,
  FolderKanban,
  Filter,
  ChevronDown,
  X,
  Check,
  Play,
  Search,
  // table nav
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  // consume / navigate actions
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  FileType2,
  ListTree,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  // states
  Loader2,
  SearchX,
  Info,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";

// ════════════════════════════════════════════════════════════════════════════
// BALANCE SHEET · REPORT (summary) + BALANCE SHEET — DETAIL (separate page)
//
// A sibling of the Trial Balance report — SAME visual language, toolbar, filter
// drawer, chip bar, tree table, states and footnote. Only the data-driven
// specifics differ:
//
//   • Two snapshot dates ("As of" + "Prior as of") instead of a From/To period.
//   • Four value columns — Current · Prior · Variance · % Change — instead of the
//     six Dr/Cr columns. Variance and % Change are visually signed using the same
//     leaf-deep-green / fire-red treatment the Trial Balance uses for its check.
//   • No balanced / out-of-balance indicator (that belongs to the Trial Balance).
//   • A print-only header block (company · title · As of/Prior · currency).
//   • A "View detail" action that drills to the companion detail screen, carrying
//     the As of / Prior / Company scope — and a "Back to summary" action that
//     returns. This round-trip is the one genuinely new interaction.
//
// Money model: every leaf account carries a Current + Prior balance; subtotals,
// group totals and the grand total are all DERIVED. The two sides of the sheet
// (Assets · Liabilities & equity) foot to the same figure by construction — the
// balance-sheet total IS that figure (not the arithmetic sum of both sides, which
// would double-count), so the grand total is the report's reconciled bottom line.
// ════════════════════════════════════════════════════════════════════════════

// ── Formatting (mirrors the Trial Balance: 0 → em-dash, en-US grouping) ────────

const gnum = (n: number) => Math.round(n).toLocaleString("en-US");
const cellNum = (n: number) => (n === 0 ? "—" : gnum(n)); // negatives keep their minus sign

// Signed-value treatment, reusing the design system's two semantic colours
// (leaf-deep for a rise, fire-red for a fall) — the same pair the Trial Balance
// uses for Balanced / Out-of-balance.
const POS = "text-bz-leaf-deep";
const NEG = "text-[#9A2E29]";
const varCls = (n: number) => (n > 0 ? POS : n < 0 ? NEG : "text-bz-text-soft");
function pctText(cur: number, prior: number): string {
  if (prior === 0) return cur === 0 ? "—" : "n/a";
  return `${(((cur - prior) / Math.abs(prior)) * 100).toFixed(1)}%`;
}
function pctCls(cur: number, prior: number): string {
  if (prior === 0) return "text-bz-text-soft";
  const d = cur - prior;
  return d > 0 ? POS : d < 0 ? NEG : "text-bz-text-soft";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtISO(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS  (used by both screens — identical look to the Trial Balance)
// ════════════════════════════════════════════════════════════════════════════

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  return ref;
}

type Option = { id: string; name: string; meta?: string };

const COMPANIES: Option[] = [
  { id: "np01", name: "NP-01 · Bizak Nepal", meta: "Kathmandu · base entity" },
  { id: "np02", name: "NP-02 · Bizak Pokhara", meta: "Pokhara branch" },
  { id: "in01", name: "IN-01 · Bizak India", meta: "Foreign subsidiary · INR" },
];
const LOCATIONS: Option[] = [
  { id: "ktm", name: "Kathmandu HQ" }, { id: "pkr", name: "Pokhara Warehouse" },
  { id: "brt", name: "Biratnagar Depot" }, { id: "ltp", name: "Lalitpur Office" },
];
const DEPARTMENTS: Option[] = [
  { id: "sal", name: "Sales" }, { id: "ops", name: "Operations" },
  { id: "fin", name: "Finance" }, { id: "adm", name: "Administration" },
];
const CLASSES: Option[] = [
  { id: "whl", name: "Wholesale" }, { id: "ret", name: "Retail" },
  { id: "prj", name: "Project" }, { id: "svc", name: "Service" },
];
const PROJECTS: Option[] = [
  { id: "apex", name: "Apex Phase-2" }, { id: "brt", name: "Bharatpur Expansion" },
  { id: "solar", name: "Solar Rollout", meta: "No postings in this period" },
];
const companyFromId = (id: string | null) => COMPANIES.find((c) => c.id === id) ?? null;

type Dimensions = {
  location: Option | null;
  department: Option | null;
  clazz: Option | null;
  project: Option | null;
};
const NO_DIMS: Dimensions = { location: null, department: null, clazz: null, project: null };

const sectionLabel =
  "flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted";

function FilterField({
  icon: Icon, label, hint, children,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={11} className="text-bz-text-muted" />}
          <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">{label}</p>
        </div>
        {hint && <p className="text-[9.5px] text-bz-text-soft">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function SelectPicker({
  value, options, placeholder, onChange, clearable,
}: {
  value: Option | null;
  options: Option[];
  placeholder?: string;
  onChange: (o: Option | null) => void;
  clearable?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value?.id ?? ""}
        onChange={(e) => onChange(options.find((o) => o.id === e.target.value) ?? null)}
        className="h-10 w-full appearance-none rounded-bz-md border border-bz-line bg-bz-paper-warm pl-3 pr-9 text-[12.5px] text-bz-text outline-none focus:border-bz-text"
      >
        {(clearable || !value) && <option value="">{placeholder ?? "Select…"}</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bz-text-muted" />
    </div>
  );
}

function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full appearance-none rounded-bz-md border border-bz-line bg-bz-paper-warm px-3 text-[12.5px] tabular-nums text-bz-text outline-none [color-scheme:light] focus:border-bz-text"
    />
  );
}

// Dimension field: icon + label (with an "Active" tag when set) + a select.
function DimField({
  icon: Icon, label, value, options, placeholder, onChange,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: Option | null;
  options: Option[];
  placeholder: string;
  onChange: (o: Option | null) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <Icon size={12} className="text-bz-text-muted" />
        <span className="text-[12px] font-medium text-bz-text">{label}</span>
        {value && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.05em] text-bz-text">
            <span className="size-1 rounded-bz-pill bg-bz-leaf-deep" /> Active
          </span>
        )}
      </div>
      <SelectPicker value={value} options={options} placeholder={placeholder} onChange={onChange} clearable />
    </div>
  );
}

// The four dimension rows — identical in both drawers.
function DimensionFields({
  dims, setDim,
}: {
  dims: Dimensions;
  setDim: <K extends keyof Dimensions>(k: K, v: Dimensions[K]) => void;
}) {
  return (
    <div className="mt-2.5 flex flex-col gap-3.5">
      <DimField icon={MapPin} label="Location" value={dims.location} options={LOCATIONS} placeholder="All locations" onChange={(o) => setDim("location", o)} />
      <DimField icon={Layers} label="Department" value={dims.department} options={DEPARTMENTS} placeholder="All departments" onChange={(o) => setDim("department", o)} />
      <DimField icon={Tag} label="Class" value={dims.clazz} options={CLASSES} placeholder="All classes" onChange={(o) => setDim("clazz", o)} />
      <DimField icon={FolderKanban} label="Project" value={dims.project} options={PROJECTS} placeholder="All projects" onChange={(o) => setDim("project", o)} />
    </div>
  );
}

function ExportMenu({ onExport }: { onExport: (fmt: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const items = [
    { key: "PDF", label: "PDF document", icon: FileText },
    { key: "Excel", label: "Excel workbook", icon: FileSpreadsheet },
    { key: "CSV", label: "CSV file", icon: FileType2 },
  ];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-bz-md border bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm ${open ? "border-bz-text" : "border-bz-line"}`}
      >
        <Download size={14} />
        <ChevronDown size={11} className="text-bz-text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-[42px] z-30 w-52 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          {items.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setOpen(false); onExport(key); }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm"
            >
              <Icon size={14} className="text-bz-text-muted" />
              <span className="text-[12px] font-medium text-bz-text">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Tree depth controls. The summary uses all four; the detail passes only
// expand-all / collapse-all (its tree is one ledger level deep).
function DepthControls({
  onExpandAll, onCollapseAll, onExpandOne, onCollapseOne,
}: {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExpandOne?: () => void;
  onCollapseOne?: () => void;
}) {
  const btn = "flex h-full w-9 items-center justify-center text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text";
  return (
    <div className="inline-flex h-9 items-center divide-x divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface">
      <button onClick={onExpandAll} className={btn} title="Expand all" aria-label="Expand all"><Maximize2 size={14} /></button>
      <button onClick={onCollapseAll} className={btn} title="Collapse all" aria-label="Collapse all"><Minimize2 size={14} /></button>
      {onExpandOne && <button onClick={onExpandOne} className={btn} title="Expand one level" aria-label="Expand one level"><Plus size={14} /></button>}
      {onCollapseOne && <button onClick={onCollapseOne} className={btn} title="Collapse one level" aria-label="Collapse one level"><Minus size={14} /></button>}
    </div>
  );
}

function FilterButton({ onClick, activeCount, dirty }: { onClick: () => void; activeCount: number; dirty: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label="Filters"
      className="relative inline-flex size-9 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm"
    >
      <Filter size={14} />
      {activeCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire px-1 text-[9.5px] font-semibold text-bz-olive tabular-nums ring-2 ring-bz-paper">{activeCount}</span>
      ) : dirty ? (
        <span className="absolute -right-1 -top-1 size-2 rounded-bz-pill bg-bz-fire ring-2 ring-bz-paper" />
      ) : null}
    </button>
  );
}

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm"
    >
      {children}
    </button>
  );
}

const DRAWER_HEADER =
  "flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-4";

function DrawerShell({
  title, subtitle, onClose, children, footer,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-10 bg-bz-olive/35 backdrop-blur-[1px]" aria-hidden />
      <aside className="absolute right-0 top-0 z-20 flex h-full w-full max-w-[420px] flex-col border-l border-bz-line-soft bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <div className={DRAWER_HEADER}>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire/[0.18] text-bz-text">
              <Filter size={16} />
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-bz-text">{title}</p>
              <p className="text-[11.5px] text-bz-text-muted">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm px-5 py-3.5">{footer}</div>
      </aside>
    </>
  );
}

function DrawerFooter({
  onClearAll, clearCount, onClose, onRun,
}: {
  onClearAll: () => void;
  clearCount: number;
  onClose: () => void;
  onRun: () => void;
}) {
  return (
    <>
      <button onClick={onClearAll} disabled={clearCount === 0} className="text-[12px] font-medium text-bz-text-muted hover:text-bz-text disabled:opacity-40">
        Clear all{clearCount > 0 ? ` · ${clearCount}` : ""}
      </button>
      <div className="flex items-center gap-2">
        <button onClick={onClose} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
          Cancel
        </button>
        <button onClick={onRun} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95">
          <Play size={13} className="fill-current" /> Run report
        </button>
      </div>
    </>
  );
}

function LoadingState({ note }: { note: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Loader2 size={26} className="animate-spin text-bz-fire" />
      <p className="text-[13px] font-medium text-bz-text">Loading report data…</p>
      <p className="text-[11.5px] text-bz-text-muted">{note}</p>
    </div>
  );
}

function EmptyState({ title, body, onClear, clearLabel = "Clear filters" }: { title: string; body: string; onClear?: () => void; clearLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <SearchX size={22} />
      </span>
      <p className="text-[14px] font-semibold text-bz-text">{title}</p>
      <p className="max-w-sm text-[12px] text-bz-text-muted">{body}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}

function MetaFootnote({ meta, ref_, children }: { meta: string; ref_: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[10.5px] text-bz-text-soft">
      <Info size={11} />
      <span className="tabular-nums">{meta}</span>
      <span className="text-bz-line">·</span>
      <span className="tabular-nums">Ref {ref_}</span>
      {children}
      <span className="ml-auto tabular-nums">Page 1 of 1</span>
    </div>
  );
}

// Print-only masthead — hidden on screen, shown when the report is printed.
function PrintHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="hidden print:mb-4 print:block">
      <p className="text-[15px] font-semibold text-bz-text">Bizak Nepal Pvt. Ltd.</p>
      <p className="mt-0.5 text-[20px] font-bold tracking-tight text-bz-text">{title}</p>
      <p className="mt-1 text-[12px] text-bz-text-muted">{meta}</p>
      <div className="mt-3 h-px w-full bg-bz-line" />
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className="flex size-7 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18]"><Check size={13} className="text-bz-leaf-deep" /></span>
        <p className="text-[12.5px] font-medium text-bz-text">{message}</p>
        <button onClick={onClose} className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

function useToast(): [string | null, (m: string) => void, () => void] {
  const [toast, setToast] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);
  return [toast, setToast, () => setToast(null)];
}

const TH = "px-3 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted";
const TH_EMPHASIS = "px-3 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text";
const TH_SUB = "mt-0.5 block text-[9.5px] font-normal normal-case tracking-normal text-bz-text-soft";

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 · BALANCE SHEET (SUMMARY)
// ════════════════════════════════════════════════════════════════════════════

// ── Money model: each leaf carries a Current + Prior balance ───────────────────

type BSLeaf = { kind: "leaf"; id: string; code: string; name: string; cur: number; prior: number };
type BSGroup = { kind: "group"; id: string; code: string; name: string; children: BSNode[] };
type BSNode = BSLeaf | BSGroup;

// Two sides that foot to the same figure at both dates (the sheet balances; we
// simply don't flag it). Contra accounts (e.g. Accumulated Depreciation) sit
// negative inside their section, as on a real statement.
const ROOTS_BS: BSNode[] = [
  {
    kind: "group", id: "assets", code: "1000", name: "Assets",
    children: [
      {
        kind: "group", id: "ca", code: "1100", name: "Current Assets",
        children: [
          { kind: "leaf", id: "cash",  code: "1101", name: "Cash in Hand",        cur: 172000,  prior: 210000 },
          { kind: "leaf", id: "nic",   code: "1102", name: "Bank — NIC Asia",      cur: 2472000, prior: 2100000 },
          { kind: "leaf", id: "nabil", code: "1103", name: "Bank — Nabil",         cur: 280000,  prior: 360000 },
          { kind: "leaf", id: "ar",    code: "1110", name: "Accounts Receivable",  cur: 1638400, prior: 1420000 },
          { kind: "leaf", id: "inv",   code: "1120", name: "Inventory",            cur: 1240000, prior: 1180000 },
        ],
      },
      {
        kind: "group", id: "fa", code: "1200", name: "Fixed Assets",
        children: [
          { kind: "leaf", id: "fe",     code: "1201", name: "Furniture & Equipment",    cur: 850000,   prior: 850000 },
          { kind: "leaf", id: "accdep", code: "1202", name: "Accumulated Depreciation", cur: -305000,  prior: -290000 },
        ],
      },
    ],
  },
  {
    kind: "group", id: "le", code: "2000–3000", name: "Liabilities & Equity",
    children: [
      {
        kind: "group", id: "liab", code: "2000", name: "Liabilities",
        children: [
          {
            kind: "group", id: "cl", code: "2100", name: "Current Liabilities",
            children: [
              { kind: "leaf", id: "ap",  code: "2101", name: "Accounts Payable", cur: 620000, prior: 760000 },
              { kind: "leaf", id: "vat", code: "2102", name: "VAT Payable",      cur: 218400, prior: 145000 },
              { kind: "leaf", id: "tds", code: "2103", name: "TDS Payable",      cur: 24000,  prior: 38000 },
            ],
          },
          {
            kind: "group", id: "ltl", code: "2200", name: "Long-term Liabilities",
            children: [
              { kind: "leaf", id: "loan", code: "2201", name: "Bank Loan — NIC Asia", cur: 1200000, prior: 1500000 },
            ],
          },
        ],
      },
      {
        kind: "group", id: "equity", code: "3000", name: "Equity",
        children: [
          { kind: "leaf", id: "share", code: "3101", name: "Share Capital",         cur: 2500000, prior: 2500000 },
          { kind: "leaf", id: "re",    code: "3201", name: "Retained Earnings",      cur: 887000,  prior: 887000 },
          { kind: "leaf", id: "cye",   code: "3202", name: "Current-Year Earnings",  cur: 898000,  prior: 0 },
        ],
      },
    ],
  },
];

type Bal = { cur: number; prior: number };
function agg(node: BSNode): Bal {
  if (node.kind === "leaf") return { cur: node.cur, prior: node.prior };
  return node.children.reduce<Bal>((a, c) => { const r = agg(c); return { cur: a.cur + r.cur, prior: a.prior + r.prior }; }, { cur: 0, prior: 0 });
}
// Both halves are equal by construction → the balance-sheet total is one side.
const GRAND_BS: Bal = agg(ROOTS_BS[0]);

const BS_GROUP_DEPTH: Record<string, number> = {};
const BS_GROUP_ANCESTORS: Record<string, string[]> = {};
const BS_ALL_GROUPS: string[] = [];
(function walk(nodes: BSNode[], depth: number, ancestors: string[]) {
  for (const n of nodes) {
    if (n.kind === "group") {
      BS_GROUP_DEPTH[n.id] = depth;
      BS_GROUP_ANCESTORS[n.id] = ancestors;
      BS_ALL_GROUPS.push(n.id);
      walk(n.children, depth + 1, [...ancestors, n.id]);
    }
  }
})(ROOTS_BS, 0, []);

// ── The four value cells (Current emphasised, like the TB's Closing pair) ──────
function BSMoneyCells({ cur, prior, weight = "normal", showPct = true }: { cur: number; prior: number; weight?: "normal" | "medium" | "bold"; showPct?: boolean }) {
  const variance = cur - prior;
  const w = weight === "bold" ? "font-semibold" : weight === "medium" ? "font-medium" : "";
  const base = `px-3 py-2.5 text-right text-[12px] tabular-nums ${w}`;
  const c = (v: number) => (v === 0 ? "text-bz-text-soft" : "text-bz-text");
  return (
    <>
      <td className={`${base} border-l border-bz-line bg-bz-fire/[0.04] ${c(cur)}`}>{cellNum(cur)}</td>
      <td className={`${base} border-l border-bz-line ${c(prior)}`}>{cellNum(prior)}</td>
      <td className={`${base} border-l border-bz-line ${varCls(variance)}`}>{cellNum(variance)}</td>
      {showPct ? (
        <td className={`${base} border-l border-bz-line ${pctCls(cur, prior)}`}>{pctText(cur, prior)}</td>
      ) : (
        <td className={`${base} border-l border-bz-line text-bz-text-soft`}>—</td>
      )}
    </>
  );
}

function renderRowsBS(nodes: BSNode[], depth: number, expanded: Set<string>, toggle: (id: string) => void): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  for (const node of nodes) {
    const pad = 16 + depth * 18;
    if (node.kind === "leaf") {
      out.push(
        <tr key={node.id} className="border-t border-bz-line-soft hover:bg-bz-paper-warm/40">
          <td className="py-2.5 pr-3" style={{ paddingLeft: pad + 22 }}>
            <span className="text-[12.5px] text-bz-text">{node.name}</span>
            <span className="ml-2 text-[10.5px] tabular-nums text-bz-text-soft">{node.code}</span>
          </td>
          <BSMoneyCells cur={node.cur} prior={node.prior} />
        </tr>,
      );
    } else {
      const f = agg(node);
      const isOpen = expanded.has(node.id);
      const rowBg = depth === 0 ? "bg-bz-paper-warm/60" : "bg-bz-paper-warm/30";
      out.push(
        <tr key={node.id} className={`border-t border-bz-line-soft ${rowBg}`}>
          <td className="py-2.5 pr-3" style={{ paddingLeft: pad }}>
            <button onClick={() => toggle(node.id)} aria-expanded={isOpen} className="inline-flex items-center gap-1.5 text-left">
              <span className="flex size-[18px] items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/50">
                {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
              <span className={`${depth === 0 ? "text-[13px] font-semibold" : "text-[12.5px] font-semibold"} text-bz-text`}>{node.name}</span>
              <span className="text-[10.5px] tabular-nums text-bz-text-soft">{node.code}</span>
            </button>
          </td>
          <BSMoneyCells cur={f.cur} prior={f.prior} weight="medium" />
        </tr>,
      );
      if (isOpen) {
        out.push(...renderRowsBS(node.children, depth + 1, expanded, toggle));
        out.push(
          <tr key={`${node.id}-sub`} className="border-t border-bz-line-soft bg-bz-paper-warm">
            <td className="py-2 pr-3" style={{ paddingLeft: pad + 22 }}>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">Subtotal · {node.name}</span>
            </td>
            <BSMoneyCells cur={f.cur} prior={f.prior} weight="bold" />
          </tr>,
        );
      }
    }
  }
  return out;
}

// ── mobile: account tree, Current prominent, tap a leaf for prior / variance ───
function BSMobileTree({ expanded, toggle }: { expanded: Set<string>; toggle: (id: string) => void }) {
  const [openLeaf, setOpenLeaf] = React.useState<Set<string>>(new Set());
  const toggleLeaf = (id: string) =>
    setOpenLeaf((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const rows: React.ReactNode[] = [];
  const walk = (nodes: BSNode[], depth: number) => {
    for (const node of nodes) {
      const pad = 12 + depth * 14;
      const f = node.kind === "leaf" ? { cur: node.cur, prior: node.prior } : agg(node);
      if (node.kind === "group") {
        const isOpen = expanded.has(node.id);
        rows.push(
          <button
            key={node.id}
            onClick={() => toggle(node.id)}
            aria-expanded={isOpen}
            className={`flex w-full items-center gap-2 border-t border-bz-line-soft py-2.5 pr-4 text-left ${depth === 0 ? "bg-bz-paper-warm/60" : "bg-bz-paper-warm/30"}`}
            style={{ paddingLeft: pad }}
          >
            {isOpen ? <ChevronDown size={13} aria-hidden className="shrink-0 text-bz-text-muted" /> : <ChevronRight size={13} aria-hidden className="shrink-0 text-bz-text-muted" />}
            <span className="flex-1 truncate text-[12.5px] font-semibold text-bz-text">{node.name}</span>
            <span className="text-[12px] font-semibold tabular-nums text-bz-text">{cellNum(f.cur)}</span>
          </button>,
        );
        if (isOpen) walk(node.children, depth + 1);
      } else {
        const isOpen = openLeaf.has(node.id);
        const variance = f.cur - f.prior;
        rows.push(
          <button
            key={node.id}
            onClick={() => toggleLeaf(node.id)}
            aria-expanded={isOpen}
            aria-label={`${node.name}, current ${cellNum(f.cur)}, show prior and variance`}
            className="flex w-full items-center gap-2 border-t border-bz-line-soft py-2.5 pr-4 text-left"
            style={{ paddingLeft: pad + 20 }}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] text-bz-text">{node.name}</span>
              <span className="text-[10px] tabular-nums text-bz-text-soft">{node.code}</span>
            </span>
            <span className="text-[12px] font-medium tabular-nums text-bz-text">{cellNum(f.cur)}</span>
          </button>,
        );
        if (isOpen) {
          rows.push(
            <div key={`${node.id}-d`} className="grid grid-cols-3 gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">Prior</p>
                <p className="mt-0.5 text-[11.5px] tabular-nums text-bz-text">{cellNum(f.prior)}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">Variance</p>
                <p className={`mt-0.5 text-[11.5px] font-medium tabular-nums ${varCls(variance)}`}>{cellNum(variance)}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">% Change</p>
                <p className={`mt-0.5 text-[11.5px] font-medium tabular-nums ${pctCls(f.cur, f.prior)}`}>{pctText(f.cur, f.prior)}</p>
              </div>
            </div>,
          );
        }
      }
    }
  };
  walk(ROOTS_BS, 0);
  return <div>{rows}</div>;
}

// ── summary applied-filter chip bar (As of · Prior · Company + dimensions) ─────
function BSChips({
  asOf, prior, company, dims, onEdit, onRemove, onClearAll,
}: {
  asOf: string;
  prior: string;
  company: Option | null;
  dims: Dimensions;
  onEdit: () => void;
  onRemove: (key: keyof Dimensions) => void;
  onClearAll: () => void;
}) {
  const list = (
    [
      { key: "location", kind: "Location", val: dims.location },
      { key: "department", kind: "Department", val: dims.department },
      { key: "clazz", kind: "Class", val: dims.clazz },
      { key: "project", kind: "Project", val: dims.project },
    ] as { key: keyof Dimensions; kind: string; val: Option | null }[]
  ).filter((d) => d.val);

  const scopeChip =
    "inline-flex items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 py-1 text-[11.5px] text-bz-text hover:bg-bz-paper-warm";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter size={12} className="text-bz-text-muted" />
      <button onClick={onEdit} className={scopeChip} title="Edit snapshot dates">
        <CalendarClock size={11} className="text-bz-text-muted" />
        <span className="tabular-nums">As of {fmtISO(asOf)}</span>
        <span className="text-bz-text-soft">vs</span>
        <span className="tabular-nums text-bz-text-muted">{fmtISO(prior)}</span>
      </button>
      <button onClick={onEdit} className={scopeChip} title="Edit company">
        <Building2 size={11} className="text-bz-text-muted" />
        <span>{company?.name ?? "All entities"}</span>
      </button>

      {list.length > 0 && <span className="mx-0.5 h-4 w-px bg-bz-line-soft" aria-hidden />}

      {list.map((d) => (
        <span key={d.key} className="inline-flex items-center gap-1.5 rounded-bz-sm bg-bz-fire/[0.16] py-1 pl-2.5 pr-1 text-[11.5px]">
          <span className="text-bz-text-muted">{d.kind}:</span>
          <span className="font-medium text-bz-text">{d.val!.name}</span>
          <button
            onClick={() => onRemove(d.key)}
            aria-label={`Remove ${d.kind} filter`}
            className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/40 hover:text-bz-text"
          >
            <X size={11} />
          </button>
        </span>
      ))}

      {list.length > 0 && (
        <button onClick={onClearAll} className="ml-0.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">Clear all</button>
      )}
    </div>
  );
}

// ── summary report parameters drawer (snapshot dates · scope · dimensions) ─────
const BS_PRESETS = [
  { key: "mom", label: "Month / prior month", asOf: "2026-05-31", prior: "2026-04-30" },
  { key: "qoq", label: "Quarter / prior quarter", asOf: "2026-03-31", prior: "2025-12-31" },
  { key: "yoy", label: "Year on year", asOf: "2026-05-31", prior: "2025-05-31" },
] as const;

function BSFilterDrawer({
  open, onClose, asOf, prior, setAsOf, setPrior, company, setCompany, dims, setDim, onRun, dimCount, onClearDims,
}: {
  open: boolean;
  onClose: () => void;
  asOf: string;
  prior: string;
  setAsOf: (v: string) => void;
  setPrior: (v: string) => void;
  company: Option | null;
  setCompany: (o: Option | null) => void;
  dims: Dimensions;
  setDim: <K extends keyof Dimensions>(k: K, v: Dimensions[K]) => void;
  onRun: () => void;
  dimCount: number;
  onClearDims: () => void;
}) {
  if (!open) return null;
  return (
    <DrawerShell
      title="Report parameters"
      subtitle="Scope the balance sheet, then run it."
      onClose={onClose}
      footer={<DrawerFooter onClearAll={onClearDims} clearCount={dimCount} onClose={onClose} onRun={onRun} />}
    >
      {/* Snapshot dates */}
      <p className={sectionLabel}>
        <CalendarClock size={12} /> Snapshot dates
        <span className="ml-1 rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[8.5px] tracking-[0.06em] text-bz-text">Required</span>
      </p>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {BS_PRESETS.map((p) => {
          const active = asOf === p.asOf && prior === p.prior;
          return (
            <button
              key={p.key}
              onClick={() => { setAsOf(p.asOf); setPrior(p.prior); }}
              className={`rounded-bz-md border px-2.5 py-2 text-left text-[11px] font-medium leading-tight transition-colors ${
                active ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <FilterField icon={CalendarRange} label="As of">
          <DateField value={asOf} onChange={setAsOf} />
        </FilterField>
        <FilterField icon={CalendarRange} label="Prior as of">
          <DateField value={prior} onChange={setPrior} />
        </FilterField>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 py-2">
        <CalendarClock size={13} className="shrink-0 text-bz-text-muted" />
        <span className="text-[12px] tabular-nums text-bz-text">
          {fmtISO(asOf)} <span className="text-bz-text-soft">compared to</span> {fmtISO(prior)}
        </span>
      </div>

      {/* Scope */}
      <p className={`${sectionLabel} mt-6`}><Building2 size={12} /> Scope</p>
      <div className="mt-2.5">
        <FilterField icon={Building2} label="Company" hint="Defaults to all entities">
          <SelectPicker value={company} options={COMPANIES} placeholder="All entities" onChange={setCompany} clearable />
        </FilterField>
      </div>

      {/* Dimensions */}
      <p className={`${sectionLabel} mt-6`}>
        Dimensions <span className="font-medium normal-case tracking-normal text-bz-text-soft">· optional</span>
        {dimCount > 0 && (
          <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18] px-1 text-[10px] font-semibold tabular-nums text-bz-text">{dimCount}</span>
        )}
      </p>
      <DimensionFields dims={dims} setDim={setDim} />
    </DrawerShell>
  );
}

// ── summary header (identity + currency + toolbar incl. the new View detail) ───
function BSHeader({
  onPrint, onExport, onViewDetail, onOpenFilters, expanded, setExpanded, activeCount, dirty,
}: {
  onPrint: () => void;
  onExport: (fmt: string) => void;
  onViewDetail: () => void;
  onOpenFilters: () => void;
  expanded: Set<string>;
  setExpanded: (s: Set<string>) => void;
  activeCount: number;
  dirty: boolean;
}) {
  const visible = (id: string) => BS_GROUP_ANCESTORS[id].every((a) => expanded.has(a));
  const expandOne = () => {
    const collapsedVisible = BS_ALL_GROUPS.filter((id) => !expanded.has(id) && visible(id));
    if (collapsedVisible.length === 0) return;
    const minDepth = Math.min(...collapsedVisible.map((id) => BS_GROUP_DEPTH[id]));
    const next = new Set(expanded);
    collapsedVisible.filter((id) => BS_GROUP_DEPTH[id] === minDepth).forEach((id) => next.add(id));
    setExpanded(next);
  };
  const collapseOne = () => {
    const openIds = [...expanded];
    if (openIds.length === 0) return;
    const maxDepth = Math.max(...openIds.map((id) => BS_GROUP_DEPTH[id]));
    const next = new Set(expanded);
    openIds.filter((id) => BS_GROUP_DEPTH[id] === maxDepth).forEach((id) => next.delete(id));
    setExpanded(next);
  };

  return (
    <header className="bg-bz-section-b px-4 pb-4 pt-6 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Balance Sheet</h1>
            <span className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-bz-text-muted">
              All amounts in NPR
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <FilterButton onClick={onOpenFilters} activeCount={activeCount} dirty={dirty} />
          <DepthControls
            onExpandAll={() => setExpanded(new Set(BS_ALL_GROUPS))}
            onCollapseAll={() => setExpanded(new Set())}
            onExpandOne={expandOne}
            onCollapseOne={collapseOne}
          />
          <span className="mx-0.5 hidden h-5 w-px bg-bz-line-soft sm:block" aria-hidden />
          <IconButton onClick={onPrint} label="Print"><Printer size={14} /></IconButton>
          <ExportMenu onExport={onExport} />
          <span className="mx-0.5 hidden h-5 w-px bg-bz-line-soft sm:block" aria-hidden />
          {/* ★ The defining new control — drills to the detail screen in scope. */}
          <button
            onClick={onViewDetail}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
          >
            <ListTree size={14} /> View detail <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}

function BSSummaryBreadcrumb() {
  return (
    <>
      <span className="text-bz-text-muted">Reports</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Balance Sheet</span>
    </>
  );
}

export function BalanceSheetDesignPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [asOf, setAsOf] = React.useState(() => params.get("asOf") || "2026-05-31");
  const [prior, setPrior] = React.useState(() => params.get("prior") || "2026-04-30");
  const [company, setCompany] = React.useState<Option | null>(() => companyFromId(params.get("company")));
  const [dims, setDims] = React.useState<Dimensions>(NO_DIMS);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(["assets", "ca", "fa", "le", "liab", "equity"]));
  const [status, setStatus] = React.useState<"ready" | "loading" | "empty">("ready");
  const [dirty, setDirty] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [toast, notify, dismiss] = useToast();

  const setDim = <K extends keyof Dimensions>(k: K, v: Dimensions[K]) => { setDims((d) => ({ ...d, [k]: v })); setDirty(true); };
  const markDirty = () => setDirty(true);
  const onSetAsOf = (v: string) => { setAsOf(v); markDirty(); };
  const onSetPrior = (v: string) => { setPrior(v); markDirty(); };
  const onSetCompany = (o: Option | null) => { setCompany(o); markDirty(); };

  const toggle = (id: string) =>
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // A project with no postings yields the empty state — a real, reachable path.
  const run = (nextDims: Dimensions) => {
    setDims(nextDims);
    setDirty(false);
    setStatus("loading");
    window.setTimeout(() => setStatus(nextDims.project?.id === "solar" ? "empty" : "ready"), 700);
  };
  const runReport = () => { setFiltersOpen(false); run(dims); };
  const removeDim = (key: keyof Dimensions) => run({ ...dims, [key]: null });
  const clearAll = () => run(NO_DIMS);
  const clearDimSelections = () => { setDims(NO_DIMS); setDirty(true); };

  const dimCount = [dims.location, dims.department, dims.clazz, dims.project].filter(Boolean).length;
  const printMeta = `As of ${fmtISO(asOf)}  ·  Prior ${fmtISO(prior)}  ·  ${company?.name ?? "All entities"}  ·  Amounts in NPR`;

  const onViewDetail = () => {
    const q = new URLSearchParams({ asOf, prior });
    if (company) q.set("company", company.id);
    navigate(`/design/balance-sheet/detail?${q.toString()}`);
  };

  return (
    <AppShell
      breadcrumb={<BSSummaryBreadcrumb />}
      topBarTone="section"
      overlay={
        <BSFilterDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          asOf={asOf} prior={prior} setAsOf={onSetAsOf} setPrior={onSetPrior}
          company={company} setCompany={onSetCompany}
          dims={dims} setDim={setDim}
          onRun={runReport} dimCount={dimCount} onClearDims={clearDimSelections}
        />
      }
    >
      <BSHeader
        onPrint={() => { window.print(); notify("Preparing a print-ready copy of the balance sheet…"); }}
        onExport={(f) => notify(`Exporting the balance sheet as ${f}…`)}
        onViewDetail={onViewDetail}
        onOpenFilters={() => setFiltersOpen(true)}
        expanded={expanded} setExpanded={setExpanded}
        activeCount={dimCount} dirty={dirty}
      />

      <div className="flex flex-col gap-4 px-4 pb-6 pt-0 md:px-8">
        <PrintHeader title="Balance Sheet" meta={printMeta} />

        <BSChips
          asOf={asOf} prior={prior} company={company} dims={dims}
          onEdit={() => setFiltersOpen(true)}
          onRemove={removeDim}
          onClearAll={clearAll}
        />

        <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          {status === "loading" && <LoadingState note="Computing balances as of the snapshot date." />}
          {status === "empty" && (
            <EmptyState
              title="No data found for the selected dates."
              body="The report ran successfully but no balances matched the chosen snapshot dates and filters."
              onClear={clearAll}
            />
          )}
          {status === "ready" && (
            <>
              {/* desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left" style={{ minWidth: 940 }}>
                  <thead>
                    <tr className="border-b border-bz-line-soft">
                      <th className={`${TH} align-bottom`} style={{ minWidth: 280 }}>Account</th>
                      <th className={`${TH_EMPHASIS} border-l border-bz-line bg-bz-fire/[0.04] text-right align-bottom`}>
                        Current<span className={TH_SUB}>As of {fmtISO(asOf)}</span>
                      </th>
                      <th className={`${TH} border-l border-bz-line text-right align-bottom`}>
                        Prior<span className={TH_SUB}>As of {fmtISO(prior)}</span>
                      </th>
                      <th className={`${TH} border-l border-bz-line text-right align-bottom`}>
                        Variance<span className={TH_SUB}>Current − Prior</span>
                      </th>
                      <th className={`${TH} border-l border-bz-line text-right align-bottom`}>
                        % Change<span className={TH_SUB}>vs prior</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>{renderRowsBS(ROOTS_BS, 0, expanded, toggle)}</tbody>
                  <tfoot>
                    <tr className="border-t-2 border-bz-text bg-bz-paper-warm">
                      <td className="px-4 py-3 text-[12.5px] font-semibold text-bz-text">Grand total</td>
                      <BSMoneyCells cur={GRAND_BS.cur} prior={GRAND_BS.prior} weight="bold" showPct={false} />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* mobile tree */}
              <div className="md:hidden">
                <BSMobileTree expanded={expanded} toggle={toggle} />
                <div className="border-t-2 border-bz-text bg-bz-paper-warm px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-bz-text">Grand total</span>
                    <span className="text-[13px] font-semibold tabular-nums text-bz-text">{cellNum(GRAND_BS.cur)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px] tabular-nums">
                    <span className="text-bz-text-muted">Prior <span className="font-semibold text-bz-text">{cellNum(GRAND_BS.prior)}</span></span>
                    <span className="text-bz-text-muted">Variance <span className={`font-semibold ${varCls(GRAND_BS.cur - GRAND_BS.prior)}`}>{cellNum(GRAND_BS.cur - GRAND_BS.prior)}</span></span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {status === "ready" && (
          <MetaFootnote meta="Generated May 31, 2026 · 4:42 PM" ref_="BS-2026-0531-007">
            <span className="text-bz-line">·</span>
            <span className="tabular-nums">As of {fmtISO(asOf)} vs {fmtISO(prior)}</span>
          </MetaFootnote>
        )}
      </div>

      {toast && <Toast message={toast} onClose={dismiss} />}
    </AppShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 · BALANCE SHEET — DETAIL  (drills from balances to transactions)
// ════════════════════════════════════════════════════════════════════════════

type Txn = {
  id: string;
  date: string;   // AD / Gregorian ISO
  bs: string;     // local Nepali (Bikram Sambat) calendar date
  doc: string;
  memo: string;
  party: string;
  debit: number;
  credit: number;
};
type Ledger = { id: string; name: string; type: string; txns: Txn[] };

const LEDGERS: Ledger[] = [
  {
    id: "nic", name: "Bank — NIC Asia", type: "Bank",
    txns: [
      { id: "n1", date: "2026-05-04", bs: "2083-01-21", doc: "JV-2026-0418",  memo: "Customer receipt — Himalayan Traders", party: "Himalayan Traders Pvt. Ltd.", debit: 540000, credit: 0 },
      { id: "n2", date: "2026-05-12", bs: "2083-01-29", doc: "PMT-2026-0902", memo: "Vendor payment — Everest Supplies",     party: "Everest Supplies",            debit: 0,      credit: 312000 },
      { id: "n3", date: "2026-05-20", bs: "2083-02-07", doc: "JV-2026-0457",  memo: "Loan EMI principal transfer",            party: "NIC Asia Bank",               debit: 0,      credit: 156000 },
      { id: "n4", date: "2026-05-28", bs: "2083-02-15", doc: "JV-2026-0489",  memo: "Customer receipt — Annapurna Retail",    party: "Annapurna Retail",            debit: 300000, credit: 0 },
    ],
  },
  {
    id: "ar", name: "Accounts Receivable", type: "Receivable",
    txns: [
      { id: "a1", date: "2026-05-06", bs: "2083-01-23", doc: "INV-2046",       memo: "Sales invoice — Annapurna Retail", party: "Annapurna Retail",  debit: 412400, credit: 0 },
      { id: "a2", date: "2026-05-15", bs: "2083-02-02", doc: "RCPT-2026-0771", memo: "Receipt against INV-2041",          party: "Himalayan Traders", debit: 0,      credit: 300000 },
      { id: "a3", date: "2026-05-25", bs: "2083-02-12", doc: "INV-2052",       memo: "Sales invoice — Pokhara Mart",      party: "Pokhara Mart",      debit: 226000, credit: 0 },
    ],
  },
  {
    id: "ap", name: "Accounts Payable", type: "Payable",
    txns: [
      { id: "p1", date: "2026-05-08", bs: "2083-01-25", doc: "BILL-2026-0331", memo: "Purchase bill — Everest Supplies", party: "Everest Supplies",        debit: 0,      credit: 280000 },
      { id: "p2", date: "2026-05-18", bs: "2083-02-05", doc: "PMT-2026-0915",  memo: "Payment against BILL-0318",        party: "Sagarmatha Distributors", debit: 420000, credit: 0 },
    ],
  },
  {
    id: "vat", name: "VAT Payable", type: "Tax",
    txns: [
      { id: "v1", date: "2026-05-31", bs: "2083-02-18", doc: "VAT-2026-05",  memo: "Output VAT on May sales", party: "Inland Revenue Dept.", debit: 0,     credit: 93400 },
      { id: "v2", date: "2026-05-31", bs: "2083-02-18", doc: "VAT-2026-05C", memo: "Input VAT credit — May",  party: "Inland Revenue Dept.", debit: 20000, credit: 0 },
    ],
  },
  {
    id: "loan", name: "Bank Loan — NIC Asia", type: "Loan",
    txns: [
      { id: "l1", date: "2026-05-20", bs: "2083-02-07", doc: "JV-2026-0457", memo: "EMI principal repayment", party: "NIC Asia Bank", debit: 156000, credit: 0 },
      { id: "l2", date: "2026-05-20", bs: "2083-02-07", doc: "JV-2026-0458", memo: "EMI interest accrual",    party: "NIC Asia Bank", debit: 0,      credit: 18000 },
    ],
  },
];

const ledgerDebit = (l: Ledger) => l.txns.reduce((s, t) => s + t.debit, 0);
const ledgerCredit = (l: Ledger) => l.txns.reduce((s, t) => s + t.credit, 0);

function TypeChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.05em] text-bz-text-muted">
      {label}
    </span>
  );
}

function DocLink({ doc, onOpen }: { doc: string; onOpen: (doc: string) => void }) {
  return (
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => { e.preventDefault(); onOpen(doc); }}
      className="inline-flex items-center gap-1 text-[12px] text-bz-text underline decoration-bz-line underline-offset-2 hover:decoration-bz-text"
      title="Open source document in a new tab"
    >
      <span className="tabular-nums">{doc}</span>
      <ExternalLink size={10} className="text-bz-text-muted" />
    </a>
  );
}

const TD = "px-3 py-2.5 text-[12px] text-bz-text";
const TDR = "px-3 py-2.5 text-right text-[12px] tabular-nums";

function renderLedgerRows(
  ledgers: Ledger[], expanded: Set<string>, toggle: (id: string) => void, onOpenDoc: (doc: string) => void,
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  for (const l of ledgers) {
    const debit = ledgerDebit(l);
    const credit = ledgerCredit(l);
    const net = debit - credit;
    const isOpen = expanded.has(l.id);
    out.push(
      <tr key={l.id} className="border-t border-bz-line-soft bg-bz-paper-warm/60">
        <td className="py-2.5 pr-3" style={{ paddingLeft: 16 }}>
          <button onClick={() => toggle(l.id)} aria-expanded={isOpen} className="inline-flex items-center gap-2 text-left">
            <span className="flex size-[18px] items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/50">
              {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
            <span className="text-[12.5px] font-semibold text-bz-text">{l.name}</span>
            <TypeChip label={l.type} />
            <span className="text-[10.5px] tabular-nums text-bz-text-soft">{l.txns.length} txns</span>
          </button>
        </td>
        <td colSpan={5} className="hidden md:table-cell" />
        <td className={`${TDR} border-l border-bz-line font-medium text-bz-text`}>{cellNum(debit)}</td>
        <td className={`${TDR} border-l border-bz-line font-medium text-bz-text`}>{cellNum(credit)}</td>
        <td className={`${TDR} border-l border-bz-line bg-bz-fire/[0.04] font-semibold ${varCls(net)}`}>{cellNum(net)}</td>
      </tr>,
    );
    if (isOpen) {
      for (const t of l.txns) {
        const tnet = t.debit - t.credit;
        out.push(
          <tr key={t.id} className="border-t border-bz-line-soft hover:bg-bz-paper-warm/40">
            <td className="py-2.5" style={{ paddingLeft: 38 }} />
            <td className={`${TD} whitespace-nowrap tabular-nums`}>{fmtISO(t.date)}</td>
            <td className={`${TD} whitespace-nowrap tabular-nums text-bz-text-muted`}>{t.bs}</td>
            <td className={TD}><DocLink doc={t.doc} onOpen={onOpenDoc} /></td>
            <td className={`${TD} max-w-[280px]`}>{t.memo}</td>
            <td className={`${TD} text-bz-text-muted`}>{t.party}</td>
            <td className={`${TDR} border-l border-bz-line ${t.debit === 0 ? "text-bz-text-soft" : "text-bz-text"}`}>{cellNum(t.debit)}</td>
            <td className={`${TDR} border-l border-bz-line ${t.credit === 0 ? "text-bz-text-soft" : "text-bz-text"}`}>{cellNum(t.credit)}</td>
            <td className={`${TDR} border-l border-bz-line bg-bz-fire/[0.04] ${varCls(tnet)}`}>{cellNum(tnet)}</td>
          </tr>,
        );
      }
    }
  }
  return out;
}

// ── mobile: ledger cards; expand a ledger to reveal its transactions ───────────
function DetailMobile({ ledgers, expanded, toggle, onOpenDoc }: { ledgers: Ledger[]; expanded: Set<string>; toggle: (id: string) => void; onOpenDoc: (doc: string) => void }) {
  return (
    <div>
      {ledgers.map((l) => {
        const debit = ledgerDebit(l);
        const credit = ledgerCredit(l);
        const net = debit - credit;
        const isOpen = expanded.has(l.id);
        return (
          <div key={l.id}>
            <button
              onClick={() => toggle(l.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-2 border-t border-bz-line-soft bg-bz-paper-warm/60 px-4 py-2.5 text-left"
            >
              {isOpen ? <ChevronDown size={13} className="shrink-0 text-bz-text-muted" /> : <ChevronRight size={13} className="shrink-0 text-bz-text-muted" />}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[12.5px] font-semibold text-bz-text">{l.name}</span>
                  <TypeChip label={l.type} />
                </span>
                <span className="text-[10px] tabular-nums text-bz-text-soft">{l.txns.length} transactions</span>
              </span>
              <span className={`text-[12px] font-semibold tabular-nums ${varCls(net)}`}>{cellNum(net)}</span>
            </button>
            {isOpen && (
              <div className="divide-y divide-bz-line-soft border-t border-bz-line-soft bg-bz-paper-warm/30">
                {l.txns.map((t) => {
                  const tnet = t.debit - t.credit;
                  return (
                    <div key={t.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <DocLink doc={t.doc} onOpen={onOpenDoc} />
                        <span className="text-[11px] tabular-nums text-bz-text-muted">{fmtISO(t.date)} · {t.bs}</span>
                      </div>
                      <p className="mt-1 text-[12px] text-bz-text">{t.memo}</p>
                      <p className="text-[11px] text-bz-text-muted">{t.party}</p>
                      <div className="mt-2 flex items-center justify-between text-[11.5px] tabular-nums">
                        <span className="text-bz-text-muted">Dr <span className="text-bz-text">{cellNum(t.debit)}</span></span>
                        <span className="text-bz-text-muted">Cr <span className="text-bz-text">{cellNum(t.credit)}</span></span>
                        <span className="text-bz-text-muted">Net <span className={`font-semibold ${varCls(tnet)}`}>{cellNum(tnet)}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── detail summary figures (Ledgers · Total Debit · Total Credit) ──────────────
function FiguresStrip({ ledgers, debit, credit }: { ledgers: number; debit: number; credit: number }) {
  const tiles = [
    { label: "Ledgers", value: gnum(ledgers), sub: "in this view" },
    { label: "Total debit", value: gnum(debit), sub: "NPR" },
    { label: "Total credit", value: gnum(credit), sub: "NPR" },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">{t.label}</p>
          <p className="mt-1 text-[19px] font-semibold tabular-nums text-bz-text">{t.value}</p>
          <p className="text-[10.5px] text-bz-text-soft">{t.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── detail applied-filter chip bar (From → As of · Company · Ledger · dims) ────
function DetailChips({
  from, asOf, company, search, dims, onEdit, onClearSearch, onRemove, onClearAll,
}: {
  from: string;
  asOf: string;
  company: Option | null;
  search: string;
  dims: Dimensions;
  onEdit: () => void;
  onClearSearch: () => void;
  onRemove: (key: keyof Dimensions) => void;
  onClearAll: () => void;
}) {
  const list = (
    [
      { key: "location", kind: "Location", val: dims.location },
      { key: "department", kind: "Department", val: dims.department },
      { key: "clazz", kind: "Class", val: dims.clazz },
      { key: "project", kind: "Project", val: dims.project },
    ] as { key: keyof Dimensions; kind: string; val: Option | null }[]
  ).filter((d) => d.val);

  const scopeChip =
    "inline-flex items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 py-1 text-[11.5px] text-bz-text hover:bg-bz-paper-warm";
  const hasDimChips = list.length > 0 || search.trim().length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter size={12} className="text-bz-text-muted" />
      <button onClick={onEdit} className={scopeChip} title="Edit reporting dates">
        <CalendarRange size={11} className="text-bz-text-muted" />
        <span className="tabular-nums">{fmtISO(from)}</span>
        <span className="text-bz-text-soft">→</span>
        <span className="tabular-nums">{fmtISO(asOf)}</span>
      </button>
      <button onClick={onEdit} className={scopeChip} title="Edit company">
        <Building2 size={11} className="text-bz-text-muted" />
        <span>{company?.name ?? "All entities"}</span>
      </button>

      {hasDimChips && <span className="mx-0.5 h-4 w-px bg-bz-line-soft" aria-hidden />}

      {search.trim().length > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-bz-sm bg-bz-fire/[0.16] py-1 pl-2.5 pr-1 text-[11.5px]">
          <span className="text-bz-text-muted">Ledger:</span>
          <span className="font-medium text-bz-text">“{search.trim()}”</span>
          <button onClick={onClearSearch} aria-label="Clear ledger search" className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/40 hover:text-bz-text">
            <X size={11} />
          </button>
        </span>
      )}

      {list.map((d) => (
        <span key={d.key} className="inline-flex items-center gap-1.5 rounded-bz-sm bg-bz-fire/[0.16] py-1 pl-2.5 pr-1 text-[11.5px]">
          <span className="text-bz-text-muted">{d.kind}:</span>
          <span className="font-medium text-bz-text">{d.val!.name}</span>
          <button onClick={() => onRemove(d.key)} aria-label={`Remove ${d.kind} filter`} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/40 hover:text-bz-text">
            <X size={11} />
          </button>
        </span>
      ))}

      {hasDimChips && (
        <button onClick={onClearAll} className="ml-0.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">Clear all</button>
      )}
    </div>
  );
}

// ── detail report parameters drawer ────────────────────────────────────────────
const DETAIL_PRESETS = [
  { key: "month", label: "This month", from: "2026-05-01", asOf: "2026-05-31" },
  { key: "qtr",   label: "This quarter", from: "2026-04-01", asOf: "2026-06-30" },
  { key: "fy",    label: "This FY", from: "2025-07-16", asOf: "2026-07-15" },
] as const;

function DetailFilterDrawer({
  open, onClose, from, asOf, setFrom, setAsOf, search, setSearch, company, setCompany, dims, setDim, onRun, dimCount, onClearDims,
}: {
  open: boolean;
  onClose: () => void;
  from: string;
  asOf: string;
  setFrom: (v: string) => void;
  setAsOf: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  company: Option | null;
  setCompany: (o: Option | null) => void;
  dims: Dimensions;
  setDim: <K extends keyof Dimensions>(k: K, v: Dimensions[K]) => void;
  onRun: () => void;
  dimCount: number;
  onClearDims: () => void;
}) {
  if (!open) return null;
  return (
    <DrawerShell
      title="Report parameters"
      subtitle="Scope the ledger detail, then run it."
      onClose={onClose}
      footer={<DrawerFooter onClearAll={onClearDims} clearCount={dimCount} onClose={onClose} onRun={onRun} />}
    >
      {/* Reporting dates */}
      <p className={sectionLabel}>
        <CalendarRange size={12} /> Reporting dates
        <span className="ml-1 rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[8.5px] tracking-[0.06em] text-bz-text">Required</span>
      </p>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {DETAIL_PRESETS.map((p) => {
          const active = from === p.from && asOf === p.asOf;
          return (
            <button
              key={p.key}
              onClick={() => { setFrom(p.from); setAsOf(p.asOf); }}
              className={`rounded-bz-md border px-2.5 py-2 text-[11px] font-medium leading-tight transition-colors ${
                active ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <FilterField icon={CalendarRange} label="From date">
          <DateField value={from} onChange={setFrom} />
        </FilterField>
        <FilterField icon={CalendarRange} label="As of">
          <DateField value={asOf} onChange={setAsOf} />
        </FilterField>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 py-2">
        <CalendarRange size={13} className="shrink-0 text-bz-text-muted" />
        <span className="text-[12px] tabular-nums text-bz-text">{fmtISO(from)} <span className="text-bz-text-soft">→</span> {fmtISO(asOf)}</span>
      </div>

      {/* Ledger search */}
      <p className={`${sectionLabel} mt-6`}><Search size={12} /> Ledger</p>
      <div className="mt-2.5">
        <FilterField icon={Search} label="Search ledger" hint="by name">
          <div className="relative">
            <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. NIC Asia, Receivable…"
              className="h-10 w-full rounded-bz-md border border-bz-line bg-bz-paper-warm pl-9 pr-9 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear" className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/50">
                <X size={12} />
              </button>
            )}
          </div>
        </FilterField>
      </div>

      {/* Scope */}
      <p className={`${sectionLabel} mt-6`}><Building2 size={12} /> Scope</p>
      <div className="mt-2.5">
        <FilterField icon={Building2} label="Company" hint="Defaults to all entities">
          <SelectPicker value={company} options={COMPANIES} placeholder="All entities" onChange={setCompany} clearable />
        </FilterField>
      </div>

      {/* Dimensions */}
      <p className={`${sectionLabel} mt-6`}>
        Dimensions <span className="font-medium normal-case tracking-normal text-bz-text-soft">· optional</span>
        {dimCount > 0 && (
          <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18] px-1 text-[10px] font-semibold tabular-nums text-bz-text">{dimCount}</span>
        )}
      </p>
      <DimensionFields dims={dims} setDim={setDim} />
    </DrawerShell>
  );
}

// ── detail header (Back to summary + identity + toolbar) ───────────────────────
function DetailHeader({
  onBack, onPrint, onExport, onOpenFilters, expanded, setExpanded, ledgerIds, activeCount, dirty,
}: {
  onBack: () => void;
  onPrint: () => void;
  onExport: (fmt: string) => void;
  onOpenFilters: () => void;
  expanded: Set<string>;
  setExpanded: (s: Set<string>) => void;
  ledgerIds: string[];
  activeCount: number;
  dirty: boolean;
}) {
  return (
    <header className="bg-bz-section-b px-4 pb-4 pt-5 md:px-8">
      {/* ★ Back to summary — the return half of the drill-through, one click. */}
      <button
        onClick={onBack}
        className="mb-3 inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
      >
        <ArrowLeft size={14} /> Back to summary
      </button>

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Balance Sheet — Detail</h1>
            <span className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-bz-text-muted">
              All amounts in NPR
            </span>
          </div>
          <p className="mt-1 text-[12px] text-bz-text-muted">Ledger-level transactions behind the balance sheet figures.</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <FilterButton onClick={onOpenFilters} activeCount={activeCount} dirty={dirty} />
          <DepthControls onExpandAll={() => setExpanded(new Set(ledgerIds))} onCollapseAll={() => setExpanded(new Set())} />
          <span className="mx-0.5 hidden h-5 w-px bg-bz-line-soft sm:block" aria-hidden />
          <IconButton onClick={onPrint} label="Print"><Printer size={14} /></IconButton>
          <ExportMenu onExport={onExport} />
        </div>
      </div>
    </header>
  );
}

function DetailBreadcrumb() {
  return (
    <>
      <span className="text-bz-text-muted">Reports</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <Link to="/design/balance-sheet" className="text-bz-text-muted hover:text-bz-text">Balance Sheet</Link>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Detail</span>
    </>
  );
}

export function BalanceSheetDetailDesignPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [from, setFrom] = React.useState(() => params.get("from") || "2025-07-16");
  const [asOf, setAsOf] = React.useState(() => params.get("asOf") || "2026-05-31");
  const [company, setCompany] = React.useState<Option | null>(() => companyFromId(params.get("company")));
  const [search, setSearch] = React.useState("");
  const [dims, setDims] = React.useState<Dimensions>(NO_DIMS);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(["nic"]));
  const [status, setStatus] = React.useState<"ready" | "loading" | "empty">("ready");
  const [dirty, setDirty] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  // Confirm the carried-over scope on arrival from the summary's View detail.
  const [toast, notify, dismiss] = useToast();
  React.useEffect(() => {
    if (params.get("asOf")) {
      notify(`Showing detail for ${companyFromId(params.get("company"))?.name ?? "all entities"} as of ${fmtISO(params.get("asOf")!)}.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDim = <K extends keyof Dimensions>(k: K, v: Dimensions[K]) => { setDims((d) => ({ ...d, [k]: v })); setDirty(true); };
  const markDirty = () => setDirty(true);

  const toggle = (id: string) =>
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const run = (nextDims: Dimensions) => {
    setDims(nextDims);
    setDirty(false);
    setStatus("loading");
    window.setTimeout(() => setStatus(nextDims.project?.id === "solar" ? "empty" : "ready"), 700);
  };
  const runReport = () => { setFiltersOpen(false); run(dims); };
  const removeDim = (key: keyof Dimensions) => run({ ...dims, [key]: null });
  const clearAll = () => { setSearch(""); run(NO_DIMS); };
  const clearDimSelections = () => { setDims(NO_DIMS); setDirty(true); };

  // Carry the full scope (incl. the summary's prior date) back, so the round-trip
  // returns the user to exactly the summary they drilled from.
  const carriedPrior = params.get("prior") || "";
  const onBack = () => {
    const q = new URLSearchParams({ asOf });
    if (carriedPrior) q.set("prior", carriedPrior);
    if (company) q.set("company", company.id);
    navigate(`/design/balance-sheet?${q.toString()}`);
  };

  // Ledger free-text search filters the rendered list live.
  const q = search.trim().toLowerCase();
  const visibleLedgers = q ? LEDGERS.filter((l) => l.name.toLowerCase().includes(q)) : LEDGERS;
  const totalDebit = visibleLedgers.reduce((s, l) => s + ledgerDebit(l), 0);
  const totalCredit = visibleLedgers.reduce((s, l) => s + ledgerCredit(l), 0);
  const grandNet = totalDebit - totalCredit;
  const ledgerIds = LEDGERS.map((l) => l.id);
  const dimCount = [dims.location, dims.department, dims.clazz, dims.project].filter(Boolean).length;

  const noLedgerMatch = status === "ready" && q.length > 0 && visibleLedgers.length === 0;
  const printMeta = `From ${fmtISO(from)}  ·  As of ${fmtISO(asOf)}  ·  ${company?.name ?? "All entities"}  ·  Amounts in NPR`;

  return (
    <AppShell
      breadcrumb={<DetailBreadcrumb />}
      topBarTone="section"
      overlay={
        <DetailFilterDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          from={from} asOf={asOf}
          setFrom={(v) => { setFrom(v); markDirty(); }}
          setAsOf={(v) => { setAsOf(v); markDirty(); }}
          search={search} setSearch={setSearch}
          company={company} setCompany={(o) => { setCompany(o); markDirty(); }}
          dims={dims} setDim={setDim}
          onRun={runReport} dimCount={dimCount} onClearDims={clearDimSelections}
        />
      }
    >
      <DetailHeader
        onBack={onBack}
        onPrint={() => { window.print(); notify("Preparing a print-ready copy of the detail report…"); }}
        onExport={(f) => notify(`Exporting the detail report as ${f}…`)}
        onOpenFilters={() => setFiltersOpen(true)}
        expanded={expanded} setExpanded={setExpanded} ledgerIds={ledgerIds}
        activeCount={dimCount} dirty={dirty}
      />

      <div className="flex flex-col gap-4 px-4 pb-6 pt-0 md:px-8">
        <PrintHeader title="Balance Sheet — Detail" meta={printMeta} />

        <DetailChips
          from={from} asOf={asOf} company={company} search={search} dims={dims}
          onEdit={() => setFiltersOpen(true)}
          onClearSearch={() => setSearch("")}
          onRemove={removeDim}
          onClearAll={clearAll}
        />

        {status === "ready" && !noLedgerMatch && (
          <FiguresStrip ledgers={visibleLedgers.length} debit={totalDebit} credit={totalCredit} />
        )}

        <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          {status === "loading" && <LoadingState note="Gathering ledger transactions for the selected period." />}
          {status === "empty" && (
            <EmptyState
              title="No transactions found for the selected period."
              body="The report ran successfully but no ledger postings fall within the chosen From and As of dates."
              onClear={clearAll}
            />
          )}
          {noLedgerMatch && (
            <EmptyState
              title="No ledgers match your search."
              body={`No ledger name contains “${search.trim()}”. Try a different term or clear the search.`}
              onClear={() => setSearch("")}
              clearLabel="Clear search"
            />
          )}
          {status === "ready" && !noLedgerMatch && (
            <>
              {/* desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left" style={{ minWidth: 1180 }}>
                  <thead>
                    <tr className="border-b border-bz-line-soft">
                      <th className={TH} style={{ minWidth: 240 }}>Ledger</th>
                      <th className={TH}>Date</th>
                      <th className={TH}>Type</th>
                      <th className={TH}>Doc No.</th>
                      <th className={TH}>Memo / Particulars</th>
                      <th className={TH}>Party</th>
                      <th className={`${TH} border-l border-bz-line text-right`}>Debit</th>
                      <th className={`${TH} border-l border-bz-line text-right`}>Credit</th>
                      <th className={`${TH_EMPHASIS} border-l border-bz-line bg-bz-fire/[0.04] text-right`}>Net</th>
                    </tr>
                  </thead>
                  <tbody>{renderLedgerRows(visibleLedgers, expanded, toggle, (doc) => notify(`Opening ${doc} in a new tab…`))}</tbody>
                  <tfoot>
                    <tr className="border-t-2 border-bz-text bg-bz-paper-warm">
                      <td colSpan={6} className="px-4 py-3 text-[12.5px] font-semibold text-bz-text">Grand total</td>
                      <td className={`${TDR} border-l border-bz-line font-semibold text-bz-text`}>{cellNum(totalDebit)}</td>
                      <td className={`${TDR} border-l border-bz-line font-semibold text-bz-text`}>{cellNum(totalCredit)}</td>
                      <td className={`${TDR} border-l border-bz-line bg-bz-fire/[0.04] font-semibold ${varCls(grandNet)}`}>{cellNum(grandNet)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* mobile cards */}
              <div className="md:hidden">
                <DetailMobile ledgers={visibleLedgers} expanded={expanded} toggle={toggle} onOpenDoc={(doc) => notify(`Opening ${doc} in a new tab…`)} />
                <div className="border-t-2 border-bz-text bg-bz-paper-warm px-4 py-3">
                  <span className="text-[12.5px] font-semibold text-bz-text">Grand total</span>
                  <div className="mt-2 flex items-center justify-between text-[12px] tabular-nums">
                    <span className="text-bz-text-muted">Debit <span className="font-semibold text-bz-text">{cellNum(totalDebit)}</span></span>
                    <span className="text-bz-text-muted">Credit <span className="font-semibold text-bz-text">{cellNum(totalCredit)}</span></span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {status === "ready" && !noLedgerMatch && (
          <MetaFootnote meta="Generated May 31, 2026 · 4:44 PM" ref_="BSD-2026-0531-031">
            <span className="text-bz-line">·</span>
            <span className="tabular-nums">{fmtISO(from)} → {fmtISO(asOf)}</span>
          </MetaFootnote>
        )}
      </div>

      {toast && <Toast message={toast} onClose={dismiss} />}
    </AppShell>
  );
}
