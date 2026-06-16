import * as React from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Check,
  Loader2,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Lock,
  Gauge,
  CalendarRange,
  Inbox,
  SearchX,
  Info,
  RotateCcw,
  CircleCheck,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD · METRIC CARD CONFIGURATOR  (define one KPI card → commit)
//
// Primary action = reconfigure ONE dashboard card: pick the metric it measures,
// the current window it computes over, and the prior window it compares against
// — then commit, which recomputes the card in place.
//
// The page is therefore a HOST DASHBOARD (a grid of live KPI cards) whose star
// interaction is a CONFIGURATOR DIALOG opened from any card. The dialog leads
// with a LIVE PREVIEW of the resulting card (the value/label split + the
// period-over-period delta made visible) above the three searchable selectors,
// so the user sees what the card becomes before anything is written back.
//
// Nothing on the real card changes until Commit. Different seed cards open the
// dialog in different states (configured · blank/placeholder · system-locked)
// so every named selector state is reachable.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const g = (n: number) => Math.round(n).toLocaleString("en-US");
const strip = (x: number) => x.toFixed(2).replace(/\.?0+$/, "");

// compact money/count formatter for the card face (premium dashboard feel)
function compact(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return strip(n / 1e9) + "B";
  if (a >= 1e6) return strip(n / 1e6) + "M";
  if (a >= 1e3) return strip(n / 1e3) + "K";
  return g(n);
}

// ════════════════════════════════════════════════════════════════════════════
// METRIC CATALOGUE  — what the server returns for a dashboard section. Each
// option carries BOTH a query key (id) and a human label, plus enough seed
// economics that the query result reconciles and changes with the window.
// ════════════════════════════════════════════════════════════════════════════

type Unit = "currency" | "count" | "percent" | "ratio";

type Metric = {
  key: string;
  label: string;
  section: string;
  unit: Unit;
  base: number; // value over a single "this month" window
  growth: number; // baseline period-over-period change
  inverse?: boolean; // true → a rise is bad (refund / churn / open POs)
  sparse?: boolean; // true → only resolves for month/quarter/year windows
};

const SECTIONS: { id: string; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "sales", label: "Sales" },
  { id: "operations", label: "Operations" },
  { id: "customers", label: "Customers" },
  { id: "custom", label: "Custom" }, // intentionally has no metrics → empty-state demo
];
const SECTION_LABEL: Record<string, string> = Object.fromEntries(SECTIONS.map((s) => [s.id, s.label]));

const UNIT_HINT: Record<Unit, string> = {
  currency: "Currency · NPR",
  count: "Count",
  percent: "Percentage",
  ratio: "Ratio",
};

const METRICS: Metric[] = [
  // Revenue
  { key: "net_revenue", label: "Net Revenue", section: "revenue", unit: "currency", base: 4_820_000, growth: 0.124 },
  { key: "gross_sales", label: "Gross Sales", section: "revenue", unit: "currency", base: 5_640_000, growth: 0.098 },
  { key: "avg_order_value", label: "Average Order Value", section: "revenue", unit: "currency", base: 31_700, growth: 0.043 },
  { key: "refund_rate", label: "Refund Rate", section: "revenue", unit: "percent", base: 3.2, growth: 0.06, inverse: true },
  { key: "tax_collected", label: "Tax Collected", section: "revenue", unit: "currency", base: 612_000, growth: 0.11 },
  // Sales
  { key: "orders_created", label: "Orders Created", section: "sales", unit: "count", base: 152, growth: 0.087 },
  { key: "orders_fulfilled", label: "Orders Fulfilled", section: "sales", unit: "count", base: 138, growth: 0.102 },
  { key: "win_rate", label: "Win Rate", section: "sales", unit: "percent", base: 42.5, growth: 0.035, sparse: true },
  { key: "pipeline_value", label: "Pipeline Value", section: "sales", unit: "currency", base: 18_400_000, growth: -0.046 },
  { key: "quote_to_order", label: "Quote-to-Order", section: "sales", unit: "percent", base: 56.0, growth: 0.021 },
  // Operations
  { key: "inventory_value", label: "Inventory Value", section: "operations", unit: "currency", base: 24_900_000, growth: -0.032 },
  { key: "stock_turnover", label: "Stock Turnover", section: "operations", unit: "ratio", base: 4.6, growth: 0.054 },
  { key: "ontime_dispatch", label: "On-time Dispatch", section: "operations", unit: "percent", base: 94.2, growth: 0.018 },
  { key: "open_pos", label: "Open Purchase Orders", section: "operations", unit: "count", base: 27, growth: -0.09, inverse: true },
  // Customers
  { key: "new_customers", label: "New Customers", section: "customers", unit: "count", base: 64, growth: 0.143 },
  { key: "active_customers", label: "Active Customers", section: "customers", unit: "count", base: 1_280, growth: 0.067 },
  { key: "churn_rate", label: "Churn Rate", section: "customers", unit: "percent", base: 2.4, growth: 0.05, inverse: true },
  { key: "customer_ltv", label: "Customer Lifetime Value", section: "customers", unit: "currency", base: 184_000, growth: 0.078 },
];
const METRIC_BY_KEY: Record<string, Metric> = Object.fromEntries(METRICS.map((m) => [m.key, m]));

// ── time windows fetched for the "current" and "prior" sets ──
type Opt = { id: string; label: string; sub?: string };

const PERIODS: Opt[] = [
  { id: "this_month", label: "This month", sub: "Jun 2026" },
  { id: "this_quarter", label: "This quarter", sub: "Apr – Jun 2026" },
  { id: "this_year", label: "This year", sub: "FY 2026" },
  { id: "ytd", label: "Year to date", sub: "Jan 1 – Jun 10" },
  { id: "last_7", label: "Last 7 days", sub: "Jun 4 – Jun 10" },
  { id: "last_30", label: "Last 30 days", sub: "May 12 – Jun 10" },
  { id: "last_90", label: "Last 90 days", sub: "Mar 12 – Jun 10" },
  { id: "today", label: "Today", sub: "Jun 10, 2026" },
  { id: "wtd", label: "Week to date", sub: "Jun 8 – Jun 10" },
  { id: "rolling_12", label: "Rolling 12 months", sub: "Jul 2025 – Jun 2026" },
];

const COMPARISONS: Opt[] = [
  { id: "prev_period", label: "Previous period", sub: "Immediately preceding window" },
  { id: "prev_month", label: "Previous month", sub: "May 2026" },
  { id: "prev_quarter", label: "Previous quarter", sub: "Jan – Mar 2026" },
  { id: "prev_year", label: "Previous year", sub: "FY 2025" },
  { id: "same_last_year", label: "Same period last year", sub: "Same window, 2025" },
  { id: "trailing_3", label: "Trailing 3-period average", sub: "Mean of the last 3 windows" },
  { id: "two_ago", label: "Two periods ago", sub: "Window before last" },
];

const PERIOD_FACTOR: Record<string, number> = {
  this_month: 1, this_quarter: 3.05, this_year: 11.8, ytd: 9.6, last_7: 0.24,
  last_30: 1.0, last_90: 3.0, today: 0.034, wtd: 0.18, rolling_12: 12.1,
};
const COMPARISON_FACTOR: Record<string, number> = {
  prev_period: 1, prev_month: 1, prev_quarter: 1.15, prev_year: 2.2,
  same_last_year: 2.0, trailing_3: 0.7, two_ago: 1.4, custom: 1,
};
// short framing label the card surfaces next to its delta
const SHORT_COMPARE: Record<string, string> = {
  prev_period: "vs prev. period", prev_month: "vs last month", prev_quarter: "vs last quarter",
  prev_year: "vs last year", same_last_year: "vs same period last yr", trailing_3: "vs 3-period avg",
  two_ago: "vs two periods ago", custom: "vs custom range",
};

type QueryResult = { current: number; prior: number; deltaPct: number; improving: boolean };

// "runs the metric query" — deterministic, reconciles with the bars in the face.
function runQuery(metricKey: string | null, periodKey: string | null, comparisonKey: string | null): QueryResult | null {
  if (!metricKey || !periodKey) return null;
  const m = METRIC_BY_KEY[metricKey];
  if (!m) return null;
  if (m.sparse && !["this_month", "this_quarter", "this_year", "ytd"].includes(periodKey)) return null; // no source data
  const pf = m.unit === "percent" || m.unit === "ratio" ? 1 : PERIOD_FACTOR[periodKey] ?? 1;
  const current = m.unit === "percent" || m.unit === "ratio" ? m.base : Math.round(m.base * pf);
  const cf = comparisonKey ? COMPARISON_FACTOR[comparisonKey] ?? 1 : 1;
  const growthEff = m.growth * cf;
  const prior = current / (1 + growthEff);
  const deltaPct = prior === 0 ? 0 : ((current - prior) / prior) * 100;
  const improving = m.inverse ? deltaPct < 0 : deltaPct > 0;
  return { current, prior, deltaPct, improving };
}

function formatValue(unit: Unit, n: number): { prefix?: string; value: string } {
  if (unit === "currency") return { prefix: "NPR", value: compact(n) };
  if (unit === "percent") return { value: n.toFixed(1) + "%" };
  if (unit === "ratio") return { value: n.toFixed(1) + "×" };
  return { value: g(n) };
}

// ════════════════════════════════════════════════════════════════════════════
// CARD MODEL  — the live object the dashboard renders; the dialog writes here.
// ════════════════════════════════════════════════════════════════════════════

type CardModel = {
  id: string;
  sectionId: string;
  metricKey: string | null;
  metricLabel: string | null; // becomes the card title
  periodKey: string | null;
  periodLabel: string | null;
  comparisonKey: string | null;
  comparisonLabel: string | null;
  custom?: { from: string; to: string };
  readOnly?: boolean; // system-managed → opens the configurator read-only
};

const SEED_CARDS: CardModel[] = [
  { id: "card-rev", sectionId: "revenue", metricKey: "net_revenue", metricLabel: "Net Revenue", periodKey: "this_month", periodLabel: "This month", comparisonKey: "prev_month", comparisonLabel: "Previous month" },
  { id: "card-orders", sectionId: "sales", metricKey: "orders_created", metricLabel: "Orders Created", periodKey: "this_month", periodLabel: "This month", comparisonKey: "prev_month", comparisonLabel: "Previous month" },
  { id: "card-pipeline", sectionId: "sales", metricKey: "pipeline_value", metricLabel: "Pipeline Value", periodKey: "this_quarter", periodLabel: "This quarter", comparisonKey: "prev_quarter", comparisonLabel: "Previous quarter" },
  { id: "card-newcust", sectionId: "customers", metricKey: "new_customers", metricLabel: "New Customers", periodKey: "this_month", periodLabel: "This month", comparisonKey: "same_last_year", comparisonLabel: "Same period last year" },
  { id: "card-churn", sectionId: "customers", metricKey: "churn_rate", metricLabel: "Churn Rate", periodKey: "this_quarter", periodLabel: "This quarter", comparisonKey: "prev_quarter", comparisonLabel: "Previous quarter" },
  // placeholder / unconfigured → metric picker opens empty (section "custom" has no metrics)
  { id: "card-blank", sectionId: "custom", metricKey: null, metricLabel: null, periodKey: null, periodLabel: null, comparisonKey: null, comparisonLabel: null },
  // system-managed → configurator opens read-only (disabled selectors, no commit)
  { id: "card-system", sectionId: "operations", metricKey: "open_pos", metricLabel: "Open Purchase Orders", periodKey: "this_month", periodLabel: "This month", comparisonKey: "prev_month", comparisonLabel: "Previous month", readOnly: true },
];

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
// MICRO-VIZ  — two flat meter bars (prior vs now): the house viz language.
// ════════════════════════════════════════════════════════════════════════════

function MeterBar({ pct, fill }: { pct: number; fill: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
      <div className="h-full rounded-bz-pill" style={{ width: `${Math.max(2, Math.min(100, pct))}%`, background: fill }} />
    </div>
  );
}

function DeltaChip({ deltaPct, improving, size = "md" }: { deltaPct: number; improving: boolean; size?: "sm" | "md" }) {
  const up = deltaPct >= 0;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-bz-sm font-semibold",
        size === "sm" ? "px-1 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[11px]",
        NUM,
        improving ? "bg-bz-fire/[0.20] text-bz-text" : "bg-[#FBE5E2] text-[#9A2E29]",
      )}
    >
      <Arrow size={size === "sm" ? 10 : 11} className={improving ? "text-bz-leaf-deep" : "text-[#C0413A]"} />
      {Math.abs(deltaPct).toFixed(1)}%
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD FACE  — the presentational KPI, shared by the dashboard tile and the
// dialog's live preview. Renders the value/label split + period-over-period.
// ════════════════════════════════════════════════════════════════════════════

function CardFace({ card, dense = false }: { card: CardModel; dense?: boolean }) {
  const metric = card.metricKey ? METRIC_BY_KEY[card.metricKey] : null;
  const q = runQuery(card.metricKey, card.periodKey, card.custom ? "custom" : card.comparisonKey);

  if (!metric) {
    return (
      <div className="flex flex-col items-start gap-1 py-1">
        <p className="text-[14px] font-semibold tracking-tight text-bz-text-soft">No metric configured</p>
        <p className="text-[11.5px] text-bz-text-muted">Configure this card to choose what it measures.</p>
      </div>
    );
  }

  const compareShort = card.custom ? SHORT_COMPARE.custom : SHORT_COMPARE[card.comparisonKey ?? "prev_period"] ?? "vs prior";

  // metric chosen but the window isn't set yet → neutral prompt (not an error)
  if (!card.periodKey) {
    return (
      <div>
        <p className={cn("truncate font-semibold tracking-tight text-bz-text", dense ? "text-[13.5px]" : "text-[14px]")}>{metric.label}</p>
        <div className="mt-3 flex items-center gap-2 rounded-bz-md bg-bz-paper-warm px-2.5 py-2 text-[11.5px] font-medium text-bz-text-muted">
          <CalendarRange size={13} className="shrink-0 text-bz-text-soft" />
          Select a window to preview the value.
        </div>
      </div>
    );
  }

  // window set but the query found no source data for it → genuine empty result
  if (!q) {
    return (
      <div>
        <p className={cn("truncate font-semibold tracking-tight text-bz-text", dense ? "text-[13.5px]" : "text-[14px]")}>{metric.label}</p>
        <div className="mt-3 flex items-center gap-2 rounded-bz-md bg-[#FBE5E2]/60 px-2.5 py-2 text-[11.5px] font-medium text-[#9A2E29]">
          <Info size={13} className="shrink-0" />
          No data for this window — try another period.
        </div>
      </div>
    );
  }

  const cur = formatValue(metric.unit, q.current);
  const maxv = Math.max(q.current, q.prior) || 1;
  return (
    <div>
      <p className={cn("truncate font-semibold tracking-tight text-bz-text", dense ? "text-[13.5px]" : "text-[14px]")}>{metric.label}</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        {cur.prefix && <span className="text-[12px] font-semibold text-bz-text-muted">{cur.prefix}</span>}
        <span className={cn("font-semibold leading-none tracking-tight text-bz-text", NUM, dense ? "text-[26px]" : "text-[30px]")}>{cur.value}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <DeltaChip deltaPct={q.deltaPct} improving={q.improving} size={dense ? "sm" : "md"} />
        <span className="text-[11px] text-bz-text-muted">{compareShort}</span>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-[9px] uppercase tracking-[0.06em] text-bz-text-soft">Prior</span>
          <MeterBar pct={(q.prior / maxv) * 100} fill="var(--bz-leaf-deep)" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-[9px] uppercase tracking-[0.06em] text-bz-text-soft">Now</span>
          <MeterBar pct={(q.current / maxv) * 100} fill="var(--bz-olive)" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t border-bz-line-soft pt-2.5 text-[10.5px] text-bz-text-muted">
        <CalendarRange size={11} className="shrink-0 text-bz-text-soft" />
        <span className="truncate">{card.periodLabel}{card.custom ? ` · ${card.custom.from} → ${card.custom.to}` : ` · ${card.comparisonLabel}`}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SELECT FIELD  — the generic searchable single-select used for all three
// pickers. type-to-filter · keyboard · clearable · lazy/paged · simulated fetch
// with loading / empty (no-data) / no-results states · disabled/read-only.
// ════════════════════════════════════════════════════════════════════════════

const PAGE = 6;

function SelectField({
  value, onChange, options, placeholder = "Select…", icon: Icon, disabled, clearable = true, emptyLabel = "No options available", ariaLabel,
}: {
  value: Opt | null;
  onChange: (o: Opt | null) => void;
  options: Opt[];
  placeholder?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  disabled?: boolean;
  clearable?: boolean;
  emptyLabel?: string;
  ariaLabel?: string;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-w-0">
      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-bz-md border px-3 text-left transition-colors",
          disabled ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        )}
      >
        {Icon && <Icon size={14} className={cn("shrink-0", value ? "text-bz-text-muted" : "text-bz-text-soft")} />}
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-[13px]", value ? "font-medium text-bz-text" : "text-bz-text-soft")}>
            {value ? value.label : placeholder}
          </span>
          {value?.sub && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{value.sub}</span>}
        </span>
        {value && clearable && !disabled ? (
          <span
            role="button"
            aria-label="Clear selection"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
          >
            <X size={12} />
          </span>
        ) : (
          !disabled && <ChevronDown size={14} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
        )}
        {disabled && <Lock size={12} className="shrink-0 text-bz-text-soft" />}
      </button>

      <SelectDropdown
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
        options={options}
        value={value}
        onChange={onChange}
        emptyLabel={emptyLabel}
      />
    </div>
  );
}

function SelectDropdown({
  anchorRef, open, onClose, options, value, onChange, emptyLabel,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  options: Opt[];
  value: Opt | null;
  onChange: (o: Opt | null) => void;
  emptyLabel: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pos = useAnchoredPos(open, anchorRef);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [fetching, setFetching] = React.useState(false); // first server fetch on open
  const [filtering, setFiltering] = React.useState(false); // re-fetch on type
  const [more, setMore] = React.useState(false); // next-page fetch
  const [hi, setHi] = React.useState(0);

  // simulate the server fetch for the section's options each time the list opens
  React.useEffect(() => {
    if (!open) return;
    setRaw(""); setQuery(""); setPages(1); setHi(0); setFetching(true);
    const f = window.setTimeout(() => setFetching(false), 480);
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => { window.clearTimeout(f); window.clearTimeout(t); };
  }, [open]);

  // debounced filter (case-insensitive substring) → simulated re-fetch
  React.useEffect(() => {
    if (!open || fetching) return;
    setFiltering(true);
    const t = window.setTimeout(() => { setQuery(raw.trim().toLowerCase()); setPages(1); setHi(0); setFiltering(false); }, 200);
    return () => window.clearTimeout(t);
  }, [raw, open, fetching]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    const onScroll = (e: Event) => { if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return; onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  const busy = fetching || filtering;
  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query) || (o.sub ?? "").toLowerCase().includes(query)) : options;
  const visible = filtered.slice(0, pages * PAGE);
  const hasMore = visible.length < filtered.length;

  const onScrollList = () => {
    const el = listRef.current;
    if (!el || more || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setMore(true);
      window.setTimeout(() => { setPages((p) => p + 1); setMore(false); }, 360);
    }
  };

  const pick = (o: Opt) => { onChange(o); onClose(); };
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, visible.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const o = visible[hi]; if (o) pick(o); }
  };

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 260) }}
      className="z-[90] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.28)]"
      onKeyDown={onListKey}
    >
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input
            ref={inputRef}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Type to filter…"
            className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {raw && (
            <button onClick={() => setRaw("")} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface" aria-label="Clear filter">
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      <div ref={listRef} onScroll={onScrollList} className="max-h-[244px] overflow-y-auto py-1">
        {busy ? (
          <div className="flex items-center justify-center gap-2 py-7 text-bz-text-muted">
            <Loader2 size={14} className="animate-spin text-bz-fire" />
            <span className="text-[11.5px]">{fetching ? "Loading options…" : "Searching…"}</span>
          </div>
        ) : options.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-8 text-center">
            <Inbox size={17} className="text-bz-text-soft" />
            <p className="text-[11.5px] font-medium text-bz-text-muted">{emptyLabel}</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-8 text-center">
            <SearchX size={16} className="text-bz-text-soft" />
            <p className="text-[11.5px] font-medium text-bz-text-muted">No matches for “{raw}”</p>
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
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                  active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm",
                  selected && "bg-bz-fire/[0.07]",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                  {o.sub && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{o.sub}</span>}
                </span>
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
        {!busy && !more && !hasMore && visible.length > 0 && filtered.length > PAGE && (
          <p className={cn("px-3 py-2 text-center text-[10px] text-bz-text-soft", NUM)}>{filtered.length} options · end of list</p>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIELD LABEL  — small section label + optional helper, used in the dialog.
// ════════════════════════════════════════════════════════════════════════════

function FieldLabel({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">{children}</span>
      {helper && <span className="text-[10.5px] text-bz-text-muted">{helper}</span>}
    </div>
  );
}

function MiniSwitch({ value, onChange, disabled, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
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

// ════════════════════════════════════════════════════════════════════════════
// THE CONFIGURATOR DIALOG  — pre-seeds from the card · live preview · commit.
// ════════════════════════════════════════════════════════════════════════════

const GHOST_BTN = "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm";
const SOLID_BTN = "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45";

type CommitResult = Omit<CardModel, "id" | "sectionId" | "readOnly">;

function MetricConfigDialog({ card, onClose, onCommit }: {
  card: CardModel | null;
  onClose: () => void;
  onCommit: (id: string, result: CommitResult) => void;
}) {
  const open = !!card;
  useEscClose(open, onClose);

  const [metric, setMetric] = React.useState<Opt | null>(null);
  const [period, setPeriod] = React.useState<Opt | null>(null);
  const [comparison, setComparison] = React.useState<Opt | null>(null);
  const [customMode, setCustomMode] = React.useState(false);
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [committing, setCommitting] = React.useState(false);

  const readOnly = !!card?.readOnly;

  // pre-seed every selector + the metric label from the card's saved config
  React.useEffect(() => {
    if (!card) return;
    setMetric(card.metricKey ? { id: card.metricKey, label: card.metricLabel ?? card.metricKey } : null);
    setPeriod(card.periodKey ? { id: card.periodKey, label: card.periodLabel ?? card.periodKey } : null);
    setComparison(!card.custom && card.comparisonKey ? { id: card.comparisonKey, label: card.comparisonLabel ?? card.comparisonKey } : null);
    setCustomMode(!!card.custom);
    setFrom(card.custom?.from ?? "");
    setTo(card.custom?.to ?? "");
    setCommitting(false);
  }, [card]);

  const metricOptions = React.useMemo<Opt[]>(() => {
    if (!card) return [];
    return METRICS.filter((m) => m.section === card.sectionId).map((m) => ({ id: m.key, label: m.label, sub: UNIT_HINT[m.unit] }));
  }, [card]);

  // assemble a provisional card to drive the live preview (NOT written back yet)
  const previewCard: CardModel | null = card && {
    ...card,
    metricKey: metric?.id ?? null,
    metricLabel: metric?.label ?? null,
    periodKey: period?.id ?? null,
    periodLabel: period?.label ?? null,
    comparisonKey: customMode ? null : comparison?.id ?? null,
    comparisonLabel: customMode ? null : comparison?.label ?? null,
    custom: customMode && from && to ? { from, to } : undefined,
  };

  const previewQ = runQuery(metric?.id ?? null, period?.id ?? null, customMode ? "custom" : comparison?.id ?? null);
  const comparisonReady = customMode ? !!(from && to) : !!comparison;
  const missingData = !!metric && !!period && comparisonReady && previewQ === null;
  const canCommit = !readOnly && !!metric && !!period && comparisonReady && previewQ !== null && !committing;

  const commit = () => {
    if (!card || !canCommit) return;
    setCommitting(true);
    window.setTimeout(() => {
      onCommit(card.id, {
        metricKey: metric!.id,
        metricLabel: metric!.label,
        periodKey: period!.id,
        periodLabel: period!.label,
        comparisonKey: customMode ? "custom" : comparison!.id,
        comparisonLabel: customMode ? `Custom range` : comparison!.label,
        custom: customMode ? { from, to } : undefined,
      });
    }, 720);
  };

  if (!open || !card) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-bz-olive-dark/45 p-4 py-[6vh]"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 540 }}
        className="overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_40px_90px_-24px_rgba(15,20,17,0.38)]"
      >
        {/* header */}
        <div className="flex items-start gap-3 border-b border-bz-line-soft bg-bz-paper-warm/40 px-5 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper">
            <Gauge size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold tracking-tight text-bz-text">Configure metric</h3>
            <p className="mt-0.5 text-[11.5px] text-bz-text-muted">
              {readOnly ? "This card is managed by the system." : "Define what this card measures. Nothing changes until you apply."}
            </p>
          </div>
          <button onClick={onClose} aria-label="Dismiss" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[64vh] overflow-y-auto">
          {/* live preview */}
          <div className="px-5 pt-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">
                <span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Live preview
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] text-bz-text-muted">
                <TrendingUp size={11} className="text-bz-leaf-deep" /> updates as you choose
              </span>
            </div>
            <div className="mt-2 rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/50 p-4">
              <CardFace card={previewCard!} dense />
            </div>
          </div>

          {/* controls */}
          <div className="flex flex-col gap-4 px-5 py-4">
            {/* metric */}
            <div>
              <FieldLabel helper="Becomes the card title">Metric</FieldLabel>
              <SelectField
                value={metric}
                onChange={setMetric}
                options={metricOptions}
                placeholder="Choose a metric to measure"
                icon={Gauge}
                disabled={readOnly}
                ariaLabel="Metric"
                emptyLabel="No metrics published for this section"
              />
              {metric && (
                <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10.5px] text-bz-text-muted">
                  Title <span className="font-medium text-bz-text">“{metric.label}”</span>
                  <span className="text-bz-text-soft">·</span>
                  query key
                  <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 font-semibold tracking-tight text-bz-text", NUM)}>{metric.id}</span>
                </p>
              )}
            </div>

            {/* time comparison */}
            <div>
              <FieldLabel helper="Current window vs a prior one">Time comparison</FieldLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <span className="mb-1 block text-[11px] font-medium text-bz-text-muted">Current window</span>
                  <SelectField
                    value={period}
                    onChange={setPeriod}
                    options={PERIODS}
                    placeholder="Select window"
                    icon={CalendarRange}
                    disabled={readOnly}
                    ariaLabel="Current window"
                    emptyLabel="No windows available"
                  />
                </div>
                <div>
                  <span className="mb-1 block text-[11px] font-medium text-bz-text-muted">Compared to</span>
                  <SelectField
                    value={comparison}
                    onChange={setComparison}
                    options={COMPARISONS}
                    placeholder="Select prior window"
                    icon={CalendarRange}
                    disabled={readOnly || customMode}
                    ariaLabel="Comparison window"
                    emptyLabel="No comparisons available"
                  />
                </div>
              </div>

              {/* latent custom-range capability, surfaced as an explicit toggle */}
              <div className="mt-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-bz-text">Custom date range</p>
                    <p className="text-[10.5px] text-bz-text-muted">Compare against an explicit from–to range instead of a preset.</p>
                  </div>
                  <MiniSwitch value={customMode} onChange={setCustomMode} disabled={readOnly} ariaLabel="Use a custom date range" />
                </div>
                {customMode && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <span className="mb-1 block text-[10.5px] font-medium text-bz-text-muted">From</span>
                      <input
                        type="date"
                        value={from}
                        disabled={readOnly}
                        onChange={(e) => setFrom(e.target.value)}
                        className={cn("h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12.5px] text-bz-text outline-none focus:border-bz-text", NUM)}
                      />
                    </div>
                    <div>
                      <span className="mb-1 block text-[10.5px] font-medium text-bz-text-muted">To</span>
                      <input
                        type="date"
                        value={to}
                        disabled={readOnly}
                        onChange={(e) => setTo(e.target.value)}
                        className={cn("h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12.5px] text-bz-text outline-none focus:border-bz-text", NUM)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* footer — guard + two non-committing exits + the commit */}
        <div className="flex items-center justify-between gap-3 border-t border-bz-line-soft bg-bz-paper-warm/30 px-5 py-3.5">
          <p className="min-w-0 flex-1 text-[11px] text-bz-text-muted">
            {readOnly ? (
              <span className="inline-flex items-center gap-1.5"><Lock size={12} className="text-bz-text-soft" /> Managed automatically — can't be reconfigured.</span>
            ) : !metric ? (
              <span className="inline-flex items-center gap-1.5"><Info size={12} className="text-bz-text-soft" /> Pick a metric to enable apply.</span>
            ) : missingData ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#9A2E29]"><Info size={12} /> No source data for this window.</span>
            ) : !comparisonReady ? (
              <span className="inline-flex items-center gap-1.5"><Info size={12} className="text-bz-text-soft" /> Choose a comparison window.</span>
            ) : (
              <span className="inline-flex items-center gap-1.5"><CircleCheck size={12} className="text-bz-leaf-deep" /> Ready to apply.</span>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={onClose} className={GHOST_BTN}>Cancel</button>
            <button onClick={commit} disabled={!canCommit} className={SOLID_BTN}>
              {committing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {committing ? "Applying…" : "Apply to card"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD TILE  — a live KPI card with a configure affordance.
// ════════════════════════════════════════════════════════════════════════════

function KpiTile({ card, onConfigure }: { card: CardModel; onConfigure: () => void }) {
  const blank = !card.metricKey;
  return (
    <div className="group relative flex flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 transition-colors hover:border-bz-line">
      <button
        onClick={onConfigure}
        aria-label={card.readOnly ? "Inspect card configuration" : "Configure card"}
        className={cn(
          "absolute right-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-bz-sm border px-2 text-[11px] font-medium transition-colors",
          card.readOnly
            ? "border-bz-line-soft bg-bz-paper-warm text-bz-text-muted hover:text-bz-text"
            : "border-transparent text-bz-text-muted opacity-0 group-hover:opacity-100 hover:border-bz-line hover:bg-bz-paper-warm hover:text-bz-text focus-visible:opacity-100",
        )}
      >
        {card.readOnly ? <Lock size={12} /> : <SlidersHorizontal size={12} />}
        {card.readOnly ? "System" : "Configure"}
      </button>
      <div className={cn(blank && "min-h-[148px]")}>
        <CardFace card={card} />
      </div>
      {blank && (
        <button onClick={onConfigure} className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/40 text-[12px] font-medium text-bz-text-muted hover:border-bz-text hover:text-bz-text">
          <SlidersHorizontal size={13} /> Configure this card
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE  — host dashboard + section filter + the configurator dialog overlay.
// ════════════════════════════════════════════════════════════════════════════

export function MetricCardConfigDesignPage() {
  const [cards, setCards] = React.useState<CardModel[]>(SEED_CARDS);
  const [section, setSection] = React.useState<string>("all");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const editingCard = cards.find((c) => c.id === editingId) ?? null;

  const counts = React.useMemo(() => {
    const map: Record<string, number> = { all: cards.length };
    for (const s of SECTIONS) map[s.id] = cards.filter((c) => c.sectionId === s.id).length;
    return map;
  }, [cards]);

  const visible = section === "all" ? cards : cards.filter((c) => c.sectionId === section);

  const commit = (id: string, result: CommitResult) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...result } : c)));
    setEditingId(null);
    setToast(`“${result.metricLabel}” applied — card recomputed for ${result.periodLabel}.`);
    window.setTimeout(() => setToast(null), 3600);
  };

  const TABS = [{ id: "all", label: "All" }, ...SECTIONS];

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Workspace</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Dashboard</span>
        </>
      }
      overlay={
        toast && (
          <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-2.5 rounded-bz-md border border-bz-line bg-bz-olive px-4 py-2.5 text-bz-text-on-dark shadow-[0_18px_44px_-18px_rgba(15,20,17,0.5)]">
              <CircleCheck size={15} className="text-bz-fire" />
              <span className="text-[12.5px] font-medium">{toast}</span>
            </div>
          </div>
        )
      }
    >
      {/* header */}
      <header className="px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper"><LayoutDashboard size={16} /></span>
              <h1 className="text-[23px] font-semibold tracking-tight text-bz-text">Sales Dashboard</h1>
            </div>
            <p className="mt-1.5 text-[12.5px] text-bz-text-muted">
              A customizable board of KPI cards. Configure any card to change what it measures and how it compares.
            </p>
          </div>
          <button
            onClick={() => setEditingId("card-rev")}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95"
          >
            <SlidersHorizontal size={14} /> Configure a card
          </button>
        </div>
      </header>

      {/* section filter */}
      <div className="border-y border-bz-line-soft bg-bz-paper px-4 py-2.5 md:px-8">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {TABS.map((t) => {
            const active = section === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSection(t.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-bz-pill px-3 py-1.5 text-[12px] font-medium transition-colors",
                  active ? "bg-bz-deep text-bz-text-on-dark" : "text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
                )}
              >
                {t.label}
                <span className={cn("rounded-bz-pill px-1.5 text-[10px] font-semibold", NUM, active ? "bg-white/15 text-bz-text-on-dark" : "bg-bz-paper-warm text-bz-text-muted")}>
                  {counts[t.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* card grid */}
      <div className="px-4 py-5 md:px-8">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-bz-lg border border-dashed border-bz-line bg-bz-surface px-6 py-16 text-center">
            <Inbox size={20} className="text-bz-text-soft" />
            <p className="text-[13px] font-semibold text-bz-text">No cards in this section</p>
            <p className="text-[12px] text-bz-text-muted">Switch sections to see the rest of the board.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((c) => (
              <KpiTile key={c.id} card={c} onConfigure={() => setEditingId(c.id)} />
            ))}
          </div>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-bz-text-soft">
          <RotateCcw size={11} /> Tip: hover any card and hit <span className="font-medium text-bz-text-muted">Configure</span>. The blank card and the
          <span className="font-medium text-bz-text-muted"> System</span> card open the dialog in their own states.
        </p>
      </div>

      <MetricConfigDialog card={editingCard} onClose={() => setEditingId(null)} onCommit={commit} />
    </AppShell>
  );
}
