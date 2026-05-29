import * as React from "react";
import { ChevronRight } from "lucide-react";
import {
  // identity / chrome
  CheckCircle2,
  AlertTriangle,
  // control bar
  CalendarRange,
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
  // table nav
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  // consume actions
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  FileType2,
  // states
  Loader2,
  SearchX,
  Info,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";

// ════════════════════════════════════════════════════════════════════════════
// TRIAL BALANCE · REPORT
//
// A report the user CONFIGURES → RUNS → READS / PRINTS / EXPORTS (not a form).
//
// Screen judgement:
//   • Primary focus  = the balances + the balanced/unbalanced check (in the foot).
//   • Primary action = Run report (turns the chosen period + filters into output).
//
// Layout (top → bottom):
//   1. Header     identity + currency + header actions (depth · filter · print · export)
//   2. Filters    a right-side drawer (header Filter button) + an applied-filter
//                 chip bar above the results; primary action = Run report
//   3. Results    account-tree table + grand-total foot (or loading / empty state)
//                 (the grand-total foot carries the balanced / out-of-balance check)
//   4. Footnote   provenance (timestamp · ref · pagination)
//
// The figures are NOT hardcoded totals — every leaf account carries its
// opening + period movement; closing balances, group subtotals, the grand
// total and the balance check are all DERIVED, so the books genuinely balance.
// ════════════════════════════════════════════════════════════════════════════

// ── Money model ──────────────────────────────────────────────────────────────

type Figures = {
  openDr: number; openCr: number;
  periodDr: number; periodCr: number;
  closeDr: number; closeCr: number;
};

type AccountLeaf = {
  kind: "leaf";
  id: string;
  code: string;
  name: string;
  openDr: number; openCr: number;
  periodDr: number; periodCr: number;
};

type AccountGroup = {
  kind: "group";
  id: string;
  code: string;
  name: string;
  children: AccountNode[];
};

type AccountNode = AccountLeaf | AccountGroup;

// ── Chart of accounts (leaf entries reconcile: ΣopenDr=ΣopenCr, ΣperiodDr=ΣperiodCr) ──

const ROOTS: AccountNode[] = [
  {
    kind: "group", id: "assets", code: "1000", name: "Assets",
    children: [
      {
        kind: "group", id: "ca", code: "1100", name: "Current Assets",
        children: [
          { kind: "leaf", id: "cash", code: "1101", name: "Cash in Hand",            openDr: 320000,  openCr: 0, periodDr: 0,       periodCr: 148000 },
          { kind: "leaf", id: "nic",  code: "1102", name: "Bank — NIC Asia",          openDr: 1850000, openCr: 0, periodDr: 3500000, periodCr: 2878000 },
          { kind: "leaf", id: "nabil",code: "1103", name: "Bank — Nabil",             openDr: 640000,  openCr: 0, periodDr: 0,       periodCr: 360000 },
          { kind: "leaf", id: "ar",   code: "1110", name: "Accounts Receivable",      openDr: 980000,  openCr: 0, periodDr: 4158400, periodCr: 3500000 },
          { kind: "leaf", id: "inv",  code: "1120", name: "Inventory",                openDr: 1420000, openCr: 0, periodDr: 2000000, periodCr: 2180000 },
        ],
      },
      {
        kind: "group", id: "fa", code: "1200", name: "Fixed Assets",
        children: [
          { kind: "leaf", id: "fe",     code: "1201", name: "Furniture & Equipment",     openDr: 850000, openCr: 0,      periodDr: 0, periodCr: 0 },
          { kind: "leaf", id: "accdep", code: "1202", name: "Accumulated Depreciation",  openDr: 0,      openCr: 210000, periodDr: 0, periodCr: 95000 },
        ],
      },
    ],
  },
  {
    kind: "group", id: "liabilities", code: "2000", name: "Liabilities",
    children: [
      {
        kind: "group", id: "cl", code: "2100", name: "Current Liabilities",
        children: [
          { kind: "leaf", id: "ap",  code: "2101", name: "Accounts Payable", openDr: 0, openCr: 760000, periodDr: 1400000, periodCr: 2260000 },
          { kind: "leaf", id: "vat", code: "2102", name: "VAT Payable",      openDr: 0, openCr: 145000, periodDr: 260000,  periodCr: 478400 },
          { kind: "leaf", id: "tds", code: "2103", name: "TDS Payable",      openDr: 0, openCr: 38000,  periodDr: 0,       periodCr: 62000 },
        ],
      },
      {
        kind: "group", id: "ltl", code: "2200", name: "Long-term Liabilities",
        children: [
          { kind: "leaf", id: "loan", code: "2201", name: "Bank Loan — NIC Asia", openDr: 0, openCr: 1500000, periodDr: 300000, periodCr: 0 },
        ],
      },
    ],
  },
  {
    kind: "group", id: "equity", code: "3000", name: "Equity",
    children: [
      { kind: "leaf", id: "share", code: "3101", name: "Share Capital",     openDr: 0, openCr: 2500000, periodDr: 0, periodCr: 0 },
      { kind: "leaf", id: "re",    code: "3201", name: "Retained Earnings",  openDr: 0, openCr: 907000,  periodDr: 0, periodCr: 0 },
    ],
  },
  {
    kind: "group", id: "income", code: "4000", name: "Income",
    children: [
      { kind: "leaf", id: "sales",   code: "4101", name: "Sales Revenue",  openDr: 0, openCr: 0, periodDr: 0, periodCr: 3200000 },
      { kind: "leaf", id: "service", code: "4102", name: "Service Income", openDr: 0, openCr: 0, periodDr: 0, periodCr: 480000 },
    ],
  },
  {
    kind: "group", id: "expenses", code: "5000", name: "Expenses",
    children: [
      { kind: "leaf", id: "cogs", code: "5101", name: "Cost of Goods Sold",   openDr: 0, openCr: 0, periodDr: 2180000, periodCr: 0 },
      { kind: "leaf", id: "sal",  code: "5201", name: "Salaries & Wages",     openDr: 0, openCr: 0, periodDr: 1240000, periodCr: 0 },
      { kind: "leaf", id: "rent", code: "5202", name: "Rent",                 openDr: 0, openCr: 0, periodDr: 360000,  periodCr: 0 },
      { kind: "leaf", id: "util", code: "5203", name: "Utilities",            openDr: 0, openCr: 0, periodDr: 148000,  periodCr: 0 },
      { kind: "leaf", id: "dep",  code: "5204", name: "Depreciation Expense", openDr: 0, openCr: 0, periodDr: 95000,   periodCr: 0 },
    ],
  },
];

// ── Derivation helpers (closing, aggregates, grand total are all computed) ────

function leafFigures(l: AccountLeaf): Figures {
  const net = l.openDr - l.openCr + (l.periodDr - l.periodCr);
  return {
    openDr: l.openDr, openCr: l.openCr,
    periodDr: l.periodDr, periodCr: l.periodCr,
    closeDr: net > 0 ? net : 0,
    closeCr: net < 0 ? -net : 0,
  };
}

const ZERO: Figures = { openDr: 0, openCr: 0, periodDr: 0, periodCr: 0, closeDr: 0, closeCr: 0 };

function add(a: Figures, b: Figures): Figures {
  return {
    openDr: a.openDr + b.openDr, openCr: a.openCr + b.openCr,
    periodDr: a.periodDr + b.periodDr, periodCr: a.periodCr + b.periodCr,
    closeDr: a.closeDr + b.closeDr, closeCr: a.closeCr + b.closeCr,
  };
}

function aggregate(node: AccountNode): Figures {
  if (node.kind === "leaf") return leafFigures(node);
  return node.children.map(aggregate).reduce(add, ZERO);
}

const GRAND: Figures = ROOTS.map(aggregate).reduce(add, ZERO);

// Tree metadata for the depth controls.
const GROUP_DEPTH: Record<string, number> = {};
const GROUP_ANCESTORS: Record<string, string[]> = {};
const ALL_GROUP_IDS: string[] = [];
(function walk(nodes: AccountNode[], depth: number, ancestors: string[]) {
  for (const n of nodes) {
    if (n.kind === "group") {
      GROUP_DEPTH[n.id] = depth;
      GROUP_ANCESTORS[n.id] = ancestors;
      ALL_GROUP_IDS.push(n.id);
      walk(n.children, depth + 1, [...ancestors, n.id]);
    }
  }
})(ROOTS, 0, []);

// ── Formatting ───────────────────────────────────────────────────────────────

const group = (n: number) => Math.round(n).toLocaleString("en-US");
const cell = (n: number) => (n === 0 ? "—" : group(n));

// ════════════════════════════════════════════════════════════════════════════
// SMALL HOOKS / ATOMS
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

// ════════════════════════════════════════════════════════════════════════════
// 1 · HEADER  identity + currency + consume actions (Print / Export)
// ════════════════════════════════════════════════════════════════════════════

function ReportHeader({
  onPrint, onExport, expanded, setExpanded, onOpenFilters, activeCount, dirty,
}: {
  onPrint: () => void;
  onExport: (fmt: string) => void;
  expanded: Set<string>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  onOpenFilters: () => void;
  activeCount: number;
  dirty: boolean;
}) {
  return (
    <header className="bg-bz-section-b px-4 pb-4 pt-6 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Trial Balance</h1>
              <span className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-bz-text-muted">
                All amounts in NPR
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFilters}
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
          <DepthControls expanded={expanded} setExpanded={setExpanded} />
          <span className="mx-0.5 h-5 w-px bg-bz-line-soft" aria-hidden />
          <button
            onClick={onPrint}
            aria-label="Print"
            className="inline-flex size-9 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm"
          >
            <Printer size={14} />
          </button>
          <ExportMenu onExport={onExport} />
        </div>
      </div>
    </header>
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

// ════════════════════════════════════════════════════════════════════════════
// 2 · FILTERS  parameter data + applied-filter chips + the right-side filter drawer
// ════════════════════════════════════════════════════════════════════════════

const PRESETS = [
  { key: "month", label: "This month",   from: "May 1, 2026",  to: "May 31, 2026" },
  { key: "last",  label: "Last month",   from: "Apr 1, 2026",  to: "Apr 30, 2026" },
  { key: "qtr",   label: "This quarter", from: "Apr 1, 2026",  to: "Jun 30, 2026" },
  { key: "fy",    label: "This FY",      from: "Jul 16, 2025", to: "Jul 15, 2026" },
] as const;
type Preset = (typeof PRESETS)[number];

const COMPANIES: Option[] = [
  { id: "np01", name: "NP-01 · Bizak Nepal",   meta: "Kathmandu · base entity" },
  { id: "np02", name: "NP-02 · Bizak Pokhara",  meta: "Pokhara branch" },
  { id: "in01", name: "IN-01 · Bizak India",    meta: "Foreign subsidiary · INR" },
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

type Filters = {
  company: Option | null;
  location: Option | null;
  department: Option | null;
  clazz: Option | null;
  project: Option | null;
};

// ── Filter UI a right-side drawer holding every report parameter (primary
//    action "Run report"), plus an applied-filter chip bar above the results. ──

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

// Dimension field icon + label (with an "Active" tag when set) + a select.
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

// Applied-filter chips above the results: bordered "scope" chips (period · company,
// click to edit) + soft-fire removable "dimension" chips (× clears and re-runs).
function FilterChips({
  preset, filters, onEdit, onRemove, onClearAll,
}: {
  preset: Preset | null;
  filters: Filters;
  onEdit: () => void;
  onRemove: (key: keyof Filters) => void;
  onClearAll: () => void;
}) {
  const dims = (
    [
      { key: "location", kind: "Location", val: filters.location },
      { key: "department", kind: "Department", val: filters.department },
      { key: "clazz", kind: "Class", val: filters.clazz },
      { key: "project", kind: "Project", val: filters.project },
    ] as { key: keyof Filters; kind: string; val: Option | null }[]
  ).filter((d) => d.val);

  // Hide the whole row until something is actually applied.
  if (!preset && !filters.company && dims.length === 0) return null;

  const scopeChip =
    "inline-flex items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 py-1 text-[11.5px] text-bz-text hover:bg-bz-paper-warm";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter size={12} className="text-bz-text-muted" />
      <button onClick={onEdit} className={scopeChip} title="Edit reporting period">
        <CalendarRange size={11} className="text-bz-text-muted" />
        {preset ? (
          <span className="tabular-nums">{preset.from} – {preset.to}</span>
        ) : (
          <span className="text-bz-text-muted">Select period</span>
        )}
      </button>
      <button onClick={onEdit} className={scopeChip} title="Edit company">
        <Building2 size={11} className="text-bz-text-muted" />
        <span>{filters.company?.name ?? "All entities"}</span>
      </button>

      {dims.length > 0 && <span className="mx-0.5 h-4 w-px bg-bz-line-soft" aria-hidden />}

      {dims.map((d) => (
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

      {dims.length > 0 && (
        <button onClick={onClearAll} className="ml-0.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">
          Clear all
        </button>
      )}
    </div>
  );
}

// Right-side filter drawer redesigned interior: grouped sections (period · scope ·
// dimensions) separated by spacing (no divider lines), a selectable preset grid +
// resolved-range summary, per-dimension "Active" tags, sticky Run-report footer.
function FilterDrawer({
  open, onClose, preset, onPreset, filters, setFilter, onRun, activeCount, onClearAll,
}: {
  open: boolean;
  onClose: () => void;
  preset: Preset | null;
  onPreset: (p: Preset) => void;
  filters: Filters;
  setFilter: <K extends keyof Filters>(k: K, v: Filters[K]) => void;
  onRun: () => void;
  activeCount: number;
  onClearAll: () => void;
}) {
  if (!open) return null;
  const sectionLabel =
    "flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted";
  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-10 bg-bz-olive/35 backdrop-blur-[1px]" aria-hidden />
      <aside className="absolute right-0 top-0 z-20 flex h-full w-full max-w-[420px] flex-col border-l border-bz-line-soft bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire/[0.18] text-bz-text">
              <Filter size={16} />
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-bz-text">Report parameters</p>
              <p className="text-[11.5px] text-bz-text-muted">Scope the trial balance, then run it.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Reporting period */}
          <p className={sectionLabel}>
            <CalendarRange size={12} /> Reporting period
            <span className="ml-1 rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[8.5px] tracking-[0.06em] text-bz-text">Required</span>
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            {PRESETS.map((p) => {
              const active = preset?.key === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => onPreset(p)}
                  className={`rounded-bz-md border px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                    active ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 py-2">
            <CalendarRange size={13} className="shrink-0 text-bz-text-muted" />
            {preset ? (
              <span className="text-[12px] tabular-nums text-bz-text">
                {preset.from} <span className="text-bz-text-soft">→</span> {preset.to}
              </span>
            ) : (
              <span className="text-[12px] text-bz-text-soft">Select a period above</span>
            )}
          </div>

          {/* Scope */}
          <p className={`${sectionLabel} mt-6`}><Building2 size={12} /> Scope</p>
          <div className="mt-2.5">
            <FilterField icon={Building2} label="Company" hint="Defaults to all entities">
              <SelectPicker value={filters.company} options={COMPANIES} placeholder="All entities" onChange={(o) => setFilter("company", o)} clearable />
            </FilterField>
          </div>

          {/* Dimensions */}
          <p className={`${sectionLabel} mt-6`}>
            Dimensions <span className="font-medium normal-case tracking-normal text-bz-text-soft">· optional</span>
            {activeCount > 0 && (
              <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18] px-1 text-[10px] font-semibold tabular-nums text-bz-text">{activeCount}</span>
            )}
          </p>
          <div className="mt-2.5 flex flex-col gap-3.5">
            <DimField icon={MapPin} label="Location" value={filters.location} options={LOCATIONS} placeholder="All locations" onChange={(o) => setFilter("location", o)} />
            <DimField icon={Layers} label="Department" value={filters.department} options={DEPARTMENTS} placeholder="All departments" onChange={(o) => setFilter("department", o)} />
            <DimField icon={Tag} label="Class" value={filters.clazz} options={CLASSES} placeholder="All classes" onChange={(o) => setFilter("clazz", o)} />
            <DimField icon={FolderKanban} label="Project" value={filters.project} options={PROJECTS} placeholder="All projects" onChange={(o) => setFilter("project", o)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm px-5 py-3.5">
          <button onClick={onClearAll} disabled={activeCount === 0} className="text-[12px] font-medium text-bz-text-muted hover:text-bz-text disabled:opacity-40">
            Clear all{activeCount > 0 ? ` · ${activeCount}` : ""}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
              Cancel
            </button>
            <button onClick={onRun} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95">
              <Play size={13} className="fill-current" /> Run report
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3 · RESULTS  detail-level controls + account-tree table (+ grand total foot).
//   The grand-total foot carries the balanced / out-of-balance check (derived).
// ════════════════════════════════════════════════════════════════════════════

function DepthControls({
  expanded, setExpanded,
}: {
  expanded: Set<string>;
  setExpanded: (s: Set<string>) => void;
}) {
  const expandAll = () => setExpanded(new Set(ALL_GROUP_IDS));
  const collapseAll = () => setExpanded(new Set());

  const visible = (id: string) => GROUP_ANCESTORS[id].every((a) => expanded.has(a));

  const expandOne = () => {
    const collapsedVisible = ALL_GROUP_IDS.filter((id) => !expanded.has(id) && visible(id));
    if (collapsedVisible.length === 0) return;
    const minDepth = Math.min(...collapsedVisible.map((id) => GROUP_DEPTH[id]));
    const next = new Set(expanded);
    collapsedVisible.filter((id) => GROUP_DEPTH[id] === minDepth).forEach((id) => next.add(id));
    setExpanded(next);
  };
  const collapseOne = () => {
    const open = [...expanded];
    if (open.length === 0) return;
    const maxDepth = Math.max(...open.map((id) => GROUP_DEPTH[id]));
    const next = new Set(expanded);
    open.filter((id) => GROUP_DEPTH[id] === maxDepth).forEach((id) => next.delete(id));
    setExpanded(next);
  };

  // Icon-only, sized to sit beside the Print / Export buttons in the header.
  const btn = "flex h-full w-9 items-center justify-center text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text";
  return (
    <div className="inline-flex h-9 items-center divide-x divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface">
      <button onClick={expandAll} className={btn} title="Expand all" aria-label="Expand all"><Maximize2 size={14} /></button>
      <button onClick={collapseAll} className={btn} title="Collapse all" aria-label="Collapse all"><Minimize2 size={14} /></button>
      <button onClick={expandOne} className={btn} title="Expand one level" aria-label="Expand one level"><Plus size={14} /></button>
      <button onClick={collapseOne} className={btn} title="Collapse one level" aria-label="Collapse one level"><Minus size={14} /></button>
    </div>
  );
}

// ── desktop money cells (Closing pair tinted as the headline state) ──
function MoneyCells({ f, weight = "normal" }: { f: Figures; weight?: "normal" | "medium" | "bold" }) {
  const w = weight === "bold" ? "font-semibold" : weight === "medium" ? "font-medium" : "";
  const base = `px-3 py-2.5 text-right text-[12px] tabular-nums ${w}`;
  const c = (v: number) => (v === 0 ? "text-bz-text-soft" : "text-bz-text");
  return (
    <>
      <td className={`${base} border-l border-bz-line ${c(f.openDr)}`}>{cell(f.openDr)}</td>
      <td className={`${base} ${c(f.openCr)}`}>{cell(f.openCr)}</td>
      <td className={`${base} border-l border-bz-line ${c(f.periodDr)}`}>{cell(f.periodDr)}</td>
      <td className={`${base} ${c(f.periodCr)}`}>{cell(f.periodCr)}</td>
      <td className={`${base} border-l border-bz-line bg-bz-fire/[0.04] ${c(f.closeDr)}`}>{cell(f.closeDr)}</td>
      <td className={`${base} bg-bz-fire/[0.04] ${c(f.closeCr)}`}>{cell(f.closeCr)}</td>
    </>
  );
}

function renderRows(
  nodes: AccountNode[],
  depth: number,
  expanded: Set<string>,
  toggle: (id: string) => void,
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  for (const node of nodes) {
    const pad = 16 + depth * 18;
    if (node.kind === "leaf") {
      const f = leafFigures(node);
      out.push(
        <tr key={node.id} className="border-t border-bz-line-soft hover:bg-bz-paper-warm/40">
          <td className="py-2.5 pr-3" style={{ paddingLeft: pad + 22 }}>
            <span className="text-[12.5px] text-bz-text">{node.name}</span>
            <span className="ml-2 text-[10.5px] tabular-nums text-bz-text-soft">{node.code}</span>
          </td>
          <MoneyCells f={f} />
        </tr>,
      );
    } else {
      const f = aggregate(node);
      const isOpen = expanded.has(node.id);
      const rowBg = depth === 0 ? "bg-bz-paper-warm/60" : "bg-bz-paper-warm/30";
      out.push(
        <tr key={node.id} className={`border-t border-bz-line-soft ${rowBg}`}>
          <td className="py-2.5 pr-3" style={{ paddingLeft: pad }}>
            <button
              onClick={() => toggle(node.id)}
              aria-expanded={isOpen}
              className="inline-flex items-center gap-1.5 text-left"
            >
              <span className="flex size-[18px] items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/50">
                {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
              <span className={`${depth === 0 ? "text-[13px] font-semibold" : "text-[12.5px] font-semibold"} text-bz-text`}>
                {node.name}
              </span>
              <span className="text-[10.5px] tabular-nums text-bz-text-soft">{node.code}</span>
            </button>
          </td>
          <MoneyCells f={f} weight="medium" />
        </tr>,
      );
      if (isOpen) {
        out.push(...renderRows(node.children, depth + 1, expanded, toggle));
        // distinct subtotal entry repeating the six figures for the group
        out.push(
          <tr key={`${node.id}-sub`} className="border-t border-bz-line-soft bg-bz-paper-warm">
            <td className="py-2 pr-3" style={{ paddingLeft: pad + 22 }}>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">
                Subtotal · {node.name}
              </span>
            </td>
            <MoneyCells f={f} weight="bold" />
          </tr>,
        );
      }
    }
  }
  return out;
}

const TH = "px-3 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted";
const TH_EMPHASIS = "px-3 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text";

// ── mobile: account tree, closing balance prominent, tap a leaf for full Dr/Cr ──
function MobileTree({ expanded, toggle }: { expanded: Set<string>; toggle: (id: string) => void }) {
  const [openLeaf, setOpenLeaf] = React.useState<Set<string>>(new Set());
  const toggleLeaf = (id: string) =>
    setOpenLeaf((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const closingTag = (f: Figures) => {
    if (f.closeDr > 0) return { v: group(f.closeDr), t: "Dr" };
    if (f.closeCr > 0) return { v: group(f.closeCr), t: "Cr" };
    return { v: "—", t: "" };
  };

  const rows: React.ReactNode[] = [];
  const walk = (nodes: AccountNode[], depth: number) => {
    for (const node of nodes) {
      const pad = 12 + depth * 14;
      const f = node.kind === "leaf" ? leafFigures(node) : aggregate(node);
      const tag = closingTag(f);
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
            <span className="text-[12px] font-semibold tabular-nums text-bz-text">{tag.v}</span>
            <span className="w-4 text-[9.5px] font-semibold uppercase text-bz-text-soft">{tag.t}</span>
          </button>,
        );
        if (isOpen) walk(node.children, depth + 1);
      } else {
        const isOpen = openLeaf.has(node.id);
        rows.push(
          <button
            key={node.id}
            onClick={() => toggleLeaf(node.id)}
            aria-expanded={isOpen}
            aria-label={`${node.name}, closing ${tag.v} ${tag.t}, show opening and period detail`}
            className="flex w-full items-center gap-2 border-t border-bz-line-soft py-2.5 pr-4 text-left"
            style={{ paddingLeft: pad + 20 }}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] text-bz-text">{node.name}</span>
              <span className="text-[10px] tabular-nums text-bz-text-soft">{node.code}</span>
            </span>
            <span className="text-[12px] font-medium tabular-nums text-bz-text">{tag.v}</span>
            <span className="w-4 text-[9.5px] font-semibold uppercase text-bz-text-soft">{tag.t}</span>
          </button>,
        );
        if (isOpen) {
          rows.push(
            <div key={`${node.id}-d`} className="grid grid-cols-2 gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3 sm:grid-cols-3">
              <MobileKV label="Opening" dr={f.openDr} cr={f.openCr} />
              <MobileKV label="Period" dr={f.periodDr} cr={f.periodCr} />
              <MobileKV label="Closing" dr={f.closeDr} cr={f.closeCr} />
            </div>,
          );
        }
      }
    }
  };
  walk(ROOTS, 0);
  return <div>{rows}</div>;
}

function MobileKV({ label, dr, cr }: { label: string; dr: number; cr: number }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">{label}</p>
      <p className="mt-0.5 text-[11px] tabular-nums text-bz-text">Dr {cell(dr)}</p>
      <p className="text-[11px] tabular-nums text-bz-text">Cr {cell(cr)}</p>
    </div>
  );
}

// ── loading + empty states ──
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Loader2 size={26} className="animate-spin text-bz-fire" />
      <p className="text-[13px] font-medium text-bz-text">Loading report data…</p>
      <p className="text-[11.5px] text-bz-text-muted">Computing balances for the selected period.</p>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <SearchX size={22} />
      </span>
      <p className="text-[14px] font-semibold text-bz-text">No data found for the selected period.</p>
      <p className="max-w-sm text-[12px] text-bz-text-muted">
        The report ran successfully but no transactions matched the chosen period and filters.
      </p>
      <button
        onClick={onClear}
        className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
      >
        Clear filters
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4 · FOOTNOTE  provenance
// ════════════════════════════════════════════════════════════════════════════

function MetaFootnote({ period }: { period: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[10.5px] text-bz-text-soft">
      <Info size={11} />
      <span className="tabular-nums">Generated May 31, 2026 · 4:42 PM</span>
      <span className="text-bz-line">·</span>
      <span className="tabular-nums">Ref TB-2026-0531-014</span>
      <span className="text-bz-line">·</span>
      <span className="tabular-nums">Period {period}</span>
      <span className="ml-auto tabular-nums">Page 1 of 1</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

function Breadcrumb() {
  return (
    <>
      <span className="text-bz-text-muted">Reports</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Trial Balance</span>
    </>
  );
}

export function TrialBalanceDesignPage() {
  const [preset, setPreset] = React.useState<Preset | null>(null);
  const [filters, setFilters] = React.useState<Filters>({
    company: null, location: null, department: null, clazz: null, project: null,
  });
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(["assets", "ca", "fa"]));
  const [status, setStatus] = React.useState<"ready" | "loading" | "empty">("ready");
  const [dirty, setDirty] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  const setFilter = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };
  const onPreset = (p: Preset) => { setPreset(p); setDirty(true); };

  const toggle = (id: string) =>
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // A project with no postings yields the empty state — a real, reachable path.
  const computeEmpty = (f: Filters) => f.project?.id === "solar";
  const applyFilters = (next: Filters) => {
    setFilters(next);
    setDirty(false);
    setStatus("loading");
    window.setTimeout(() => setStatus(computeEmpty(next) ? "empty" : "ready"), 700);
  };
  const runReport = () => { setFiltersOpen(false); applyFilters(filters); };
  const removeFilter = (key: keyof Filters) => applyFilters({ ...filters, [key]: null });
  const clearAllFilters = () =>
    applyFilters({ ...filters, location: null, department: null, clazz: null, project: null });
  // Inside the drawer, "Clear all" just clears the selections (run happens on Run report).
  const clearDimSelections = () => {
    setFilters((f) => ({ ...f, location: null, department: null, clazz: null, project: null }));
    setDirty(true);
  };

  const periodLabel = preset ? `${preset.from} – ${preset.to}` : "—";
  const activeCount = [filters.location, filters.department, filters.clazz, filters.project].filter(Boolean).length;

  return (
    <AppShell
      breadcrumb={<Breadcrumb />}
      topBarTone="section"
      overlay={
        <FilterDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          preset={preset} onPreset={onPreset}
          filters={filters} setFilter={setFilter}
          onRun={runReport}
          activeCount={activeCount}
          onClearAll={clearDimSelections}
        />
      }
    >
      <ReportHeader
        onPrint={() => setToast("Preparing a print-ready copy of the trial balance…")}
        onExport={(f) => setToast(`Exporting the trial balance as ${f}…`)}
        expanded={expanded} setExpanded={setExpanded}
        onOpenFilters={() => setFiltersOpen(true)}
        activeCount={activeCount} dirty={dirty}
      />

      <div className="flex flex-col gap-4 px-4 pb-6 pt-0 md:px-8">
        <FilterChips
          preset={preset} filters={filters}
          onEdit={() => setFiltersOpen(true)}
          onRemove={removeFilter}
          onClearAll={clearAllFilters}
        />
        <TrialBalanceTableWithControls
          status={status} expanded={expanded}
          toggle={toggle} onClear={clearAllFilters}
        />

        {status === "ready" && <MetaFootnote period={periodLabel} />}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}

// The results card: the account-tree table (or the loading / empty state).
// Report parameters live in the FilterDrawer, opened from the header.
function TrialBalanceTableWithControls({
  status, expanded, toggle, onClear,
}: {
  status: "ready" | "loading" | "empty";
  expanded: Set<string>;
  toggle: (id: string) => void;
  onClear: () => void;
}) {
  const diff = GRAND.closeDr - GRAND.closeCr;
  const openDiff = GRAND.openDr - GRAND.openCr;
  const periodDiff = GRAND.periodDr - GRAND.periodCr;
  const balanced = diff === 0;
  return (
    <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">


      {status === "loading" && <LoadingState />}
      {status === "empty" && <EmptyState onClear={onClear} />}
      {status === "ready" && (
       <>

      {/* desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left" style={{ minWidth: 940 }}>
          <thead>
            <tr className="border-b border-bz-line-soft">
              <th rowSpan={2} className={`${TH} align-top`} style={{ minWidth: 260 }}>Account</th>
              <th colSpan={2} className={`${TH} border-l border-bz-line text-center`}>Opening balance</th>
              <th colSpan={2} className={`${TH} border-l border-bz-line text-center`}>Current period</th>
              <th colSpan={2} className={`${TH_EMPHASIS} border-l border-bz-line bg-bz-fire/[0.04] text-center`}>Closing balance</th>
            </tr>
            <tr className="border-b border-bz-line-soft">
              <th className={`${TH} border-l border-bz-line text-right`}>Dr</th>
              <th className={`${TH} text-right`}>Cr</th>
              <th className={`${TH} border-l border-bz-line text-right`}>Dr</th>
              <th className={`${TH} text-right`}>Cr</th>
              <th className={`${TH} border-l border-bz-line bg-bz-fire/[0.04] text-right`}>Dr</th>
              <th className={`${TH} bg-bz-fire/[0.04] text-right`}>Cr</th>
            </tr>
          </thead>
          <tbody>{renderRows(ROOTS, 0, expanded, toggle)}</tbody>
          <tfoot>
            <tr className="border-t-2 border-bz-text bg-bz-paper-warm">
              <td className="px-4 py-3 text-[12.5px] font-semibold text-bz-text">Grand total</td>
              <MoneyCells f={GRAND} weight="bold" />
            </tr>
            <tr className="border-t border-bz-line-soft bg-bz-paper-warm">
              <td className="px-4 py-2.5">
                <span className={`inline-flex items-center gap-1.5 rounded-bz-sm px-2 py-0.5 text-[10.5px] font-semibold ${balanced ? "bg-bz-fire/[0.18] text-bz-text" : "bg-[#9A2E29]/10 text-[#9A2E29]"}`}>
                  {balanced ? <CheckCircle2 size={12} className="text-bz-leaf-deep" /> : <AlertTriangle size={12} />}
                  {balanced ? "Balanced" : "Out of balance"}
                </span>
              </td>
              <td className="px-3 py-2.5 text-right text-[11px] tabular-nums text-bz-text-soft border-l border-bz-line" colSpan={2}>Diff {group(openDiff)}</td>
              <td className="px-3 py-2.5 text-right text-[11px] tabular-nums text-bz-text-soft border-l border-bz-line" colSpan={2}>Diff {group(periodDiff)}</td>
              <td className={`border-l border-bz-line bg-bz-fire/[0.04] px-3 py-2.5 text-right text-[11px] font-semibold tabular-nums ${balanced ? "text-bz-leaf-deep" : "text-[#9A2E29]"}`} colSpan={2}>
                Difference {group(diff)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* mobile tree */}
      <div className="md:hidden">
        <MobileTree expanded={expanded} toggle={toggle} />
        <div className="border-t-2 border-bz-text bg-bz-paper-warm px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-bz-text">Grand total (closing)</span>
            <span className={`inline-flex items-center gap-1.5 rounded-bz-sm px-2 py-0.5 text-[10px] font-semibold ${balanced ? "bg-bz-fire/[0.18] text-bz-text" : "bg-[#9A2E29]/10 text-[#9A2E29]"}`}>
              {balanced ? <CheckCircle2 size={11} className="text-bz-leaf-deep" /> : <AlertTriangle size={11} />}
              {balanced ? "Balanced" : "Out of balance"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px] tabular-nums">
            <span className="text-bz-text-muted">Dr <span className="font-semibold text-bz-text">{group(GRAND.closeDr)}</span></span>
            <span className="text-bz-text-muted">Cr <span className="font-semibold text-bz-text">{group(GRAND.closeCr)}</span></span>
            <span className="text-bz-text-muted">Diff <span className={`font-semibold ${balanced ? "text-bz-leaf-deep" : "text-[#9A2E29]"}`}>{group(diff)}</span></span>
          </div>
        </div>
      </div>
       </>
      )}
    </div>
  );
}
