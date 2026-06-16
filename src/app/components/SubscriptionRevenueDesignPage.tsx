import * as React from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  RefreshCw,
  Loader2,
  Plus,
  Settings2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  CalendarRange,
  Users,
  Coins,
  Zap,
  Gift,
  PauseCircle,
  CalendarX,
  Ban,
  X,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMER SUBSCRIPTION REVENUE · READ-ONLY KPI DASHBOARD
//
// A calm at-a-glance recurring-revenue board for tenant finance/admin. ONE
// simulated server fetch drives every readout; everything reconciles off the
// same payload (ARR = MRR×12, avg = MRR÷active, past-due appears as both a
// lifecycle tally and the at-risk movement stat — kept equal by construction).
//
// Three mutually-exclusive states for the readouts:
//   • loading  → spinner + caption + pulse placeholder tiles
//   • resolved → all readouts rendered from the payload
//   • failed   → readouts fall back to ZERO + a dismissible danger banner
//
// Read-only: the only effects are Refresh (re-fetch) and outbound navigation.
// A subtle ghost icon-button (AlertTriangle) forces the *next* refresh to fail,
// so the failure + zero-fallback states are reachable for design review.
// ════════════════════════════════════════════════════════════════════════════

// ── shared helpers (kept verbatim across sibling pages) ──────────────────────
const NUM = "tabular-nums";
function money(code: string, n: number | undefined | null): string {
  const v = n == null || !isFinite(n) ? 0 : n;
  return `${code ? code + " " : ""}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const intf = (n: number | undefined | null) => (n == null || !isFinite(n) ? 0 : Math.round(n)).toLocaleString("en-US");

const CODE = "NPR";

// ════════════════════════════════════════════════════════════════════════════
// PAYLOAD MODEL  (the shape the "server" returns)
// ════════════════════════════════════════════════════════════════════════════

type StatusKey = "active" | "in_trial" | "past_due" | "suspended" | "expired" | "cancelled";

type RevenuePayload = {
  currency: string;
  mrr: number;
  activeCustomers: number;
  movement: { added: number; churned: number; atRisk: number }; // trailing 30 days
  statuses: Record<StatusKey, number>;
};

// One seeded payload. Numbers reconcile:
//   ARR    = MRR × 12
//   avg    = MRR ÷ activeCustomers
//   atRisk = statuses.past_due  (same number, two framings)
const SEED: RevenuePayload = {
  currency: CODE,
  mrr: 1240000,
  activeCustomers: 86,
  movement: { added: 9, churned: 4, atRisk: 5 },
  statuses: {
    active: 86,
    in_trial: 12,
    past_due: 5,
    suspended: 3,
    expired: 7,
    cancelled: 18,
  },
};

// What the readouts read when no data is available (failure → zero-fallback).
const ZERO: RevenuePayload = {
  currency: CODE,
  mrr: 0,
  activeCustomers: 0,
  movement: { added: 0, churned: 0, atRisk: 0 },
  statuses: { active: 0, in_trial: 0, past_due: 0, suspended: 0, expired: 0, cancelled: 0 },
};

const FAIL_MESSAGE = "Couldn’t reach the billing service. Showing zeros — figures may be stale until the next successful refresh.";

// derived figures (single source of truth for the reconciliation)
const arrOf = (mrr: number) => mrr * 12;
const avgOf = (mrr: number, active: number) => (active > 0 ? mrr / active : 0);

// ════════════════════════════════════════════════════════════════════════════
// STATUS VOCABULARY  (tone + icon mapping shared with sibling pages)
// ════════════════════════════════════════════════════════════════════════════

type DotTone = "lime" | "leaf" | "danger" | "neutral-soft" | "neutral-line";
const DOT_BG: Record<DotTone, string> = {
  lime: "bg-bz-leaf-deep",
  leaf: "bg-bz-fire",
  danger: "bg-[#C0413A]",
  "neutral-soft": "bg-bz-text-soft",
  "neutral-line": "bg-bz-line",
};

const STATUS_META: {
  key: StatusKey;
  label: string;
  dot: DotTone;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  note?: string;
}[] = [
  { key: "active", label: "Active", dot: "lime", icon: Zap },
  { key: "in_trial", label: "In-trial", dot: "leaf", icon: Gift },
  { key: "past_due", label: "Past-due", dot: "danger", icon: AlertTriangle, note: "= at-risk" },
  { key: "suspended", label: "Suspended", dot: "danger", icon: PauseCircle },
  { key: "expired", label: "Expired", dot: "neutral-soft", icon: CalendarX },
  { key: "cancelled", label: "Cancelled", dot: "neutral-line", icon: Ban },
];

// ════════════════════════════════════════════════════════════════════════════
// BUTTON PRIMITIVES  (verbatim from the list page)
// ════════════════════════════════════════════════════════════════════════════

const PRIMARY_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95";
const GHOST_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm";

const SECTION_LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

// the list page's <Stat> tile pattern: uppercase icon label + value block
function StatTile({
  icon: Icon,
  label,
  className,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 md:p-5", className)}>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-bz-text-muted">
        <Icon size={11} className="text-bz-text-soft" /> {label}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

// a currency value rendered as "NPR" prefix + big tabular number
function MoneyValue({ value, size = "lg" }: { value: number; size?: "lg" | "md" }) {
  const big = size === "lg" ? "text-[26px] md:text-[28px]" : "text-[20px]";
  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      <span className="text-[12px] font-semibold text-bz-text-muted">{CODE}</span>
      <span className={cn("font-semibold leading-none tracking-tight text-bz-text", big, NUM)}>{formatted}</span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER  title + subtitle + refresh / simulate-error / nav actions
// ════════════════════════════════════════════════════════════════════════════

function PageHeader({
  loading,
  willFail,
  onRefresh,
  onToggleFail,
}: {
  loading: boolean;
  willFail: boolean;
  onRefresh: () => void;
  onToggleFail: () => void;
}) {
  const navigate = useNavigate();
  return (
    <header className="px-4 pb-4 pt-5 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[23px] font-semibold tracking-tight text-bz-text md:text-[24px]">
            Customer Subscription Revenue
          </h1>
          <p className="mt-1 text-[12.5px] text-bz-text-muted">
            Recurring-revenue health across your customer base — at a glance, refreshed on demand.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* simulate-error affordance — forces the NEXT refresh to fail */}
          <button
            onClick={onToggleFail}
            title="Simulate fetch error (next refresh)"
            aria-pressed={willFail}
            className={cn(
              "flex size-9 items-center justify-center rounded-bz-md border text-bz-text-muted transition-colors",
              willFail
                ? "border-[#C0413A] bg-[#FBE5E2] text-[#9A2E29]"
                : "border-bz-line bg-bz-surface hover:bg-bz-paper-warm hover:text-bz-text",
            )}
          >
            <AlertTriangle size={14} />
          </button>

          <button onClick={onRefresh} disabled={loading} className={cn(GHOST_BTN, "disabled:opacity-60")}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{loading ? "Refreshing…" : "Refresh"}</span>
          </button>

          <button onClick={() => navigate("/design/customer-subscriptions")} className={GHOST_BTN}>
            <Settings2 size={14} />
            <span className="hidden sm:inline">Manage Subscriptions</span>
          </button>

          <button onClick={() => navigate("/design/subscribe-party")} className={PRIMARY_BTN}>
            <Plus size={14} /> Subscribe a Party
          </button>
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FAILURE BANNER  (danger literals · dismissible)
// ════════════════════════════════════════════════════════════════════════════

function FailureBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-bz-lg border border-[#C0413A]/35 bg-[#FBE5E2] p-3.5 md:p-4">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-[#C0413A]/15 text-[#9A2E29]">
        <AlertTriangle size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-[#9A2E29]">Couldn’t refresh revenue metrics</p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#9A2E29]/85">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-[#9A2E29] hover:bg-[#C0413A]/15"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LOADING STATE  (spinner + caption + pulse placeholder tiles)
// ════════════════════════════════════════════════════════════════════════════

function PulseTile({ tall }: { tall?: boolean }) {
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 md:p-5">
      <div className="h-2.5 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
      <div className={cn("mt-4 animate-pulse rounded-bz-sm bg-bz-paper-warm", tall ? "h-8 w-40" : "h-6 w-28")} />
      <div className="mt-3 h-2.5 w-32 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
    </div>
  );
}

function LoadingBoard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2 py-1 text-bz-text-muted">
        <Loader2 size={15} className="animate-spin text-bz-fire" />
        <span className="text-[12.5px] font-medium">Loading metrics…</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <PulseTile tall />
        <PulseTile tall />
        <PulseTile />
        <PulseTile />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PulseTile />
        <PulseTile />
        <PulseTile />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// KPI GRID  (olive MRR hero · ARR · active customers + derived avg)
// ════════════════════════════════════════════════════════════════════════════

function KpiGrid({ data }: { data: RevenuePayload }) {
  const arr = arrOf(data.mrr);
  const avg = avgOf(data.mrr, data.activeCustomers);
  const mrrFmt = data.mrr.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      {/* headline MRR — premium olive hero (spans 2 on desktop) */}
      <div className="rounded-bz-lg bg-bz-olive p-5 text-bz-text-on-dark shadow-[0_24px_60px_-30px_rgba(10,16,13,0.5)] md:col-span-2">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-fire">
          <Wallet size={11} /> Monthly Recurring Revenue
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="mb-1 text-[14px] font-semibold text-bz-text-on-dark-muted">{CODE}</span>
          <span className={cn("text-[38px] font-semibold leading-none tracking-tight text-bz-fire md:text-[44px]", NUM)}>
            {mrrFmt}
          </span>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-bz-text-on-dark-muted">
          Normalised recurring revenue billed each month across all active subscriptions.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-bz-pill bg-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-bz-text-on-dark-muted">
          <Coins size={11} className="text-bz-fire" />
          <span className={NUM}>{money(CODE, avg)}</span> avg / customer
        </div>
      </div>

      {/* ARR */}
      <StatTile icon={CalendarRange} label="Annual Recurring Revenue">
        <MoneyValue value={arr} />
        <p className="mt-3 text-[11.5px] leading-relaxed text-bz-text-muted">
          MRR projected over twelve months <span className={cn("text-bz-text-soft", NUM)}>(MRR × 12)</span>.
        </p>
      </StatTile>

      {/* Active customers + derived average */}
      <StatTile icon={Users} label="Active customers">
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-[26px] font-semibold leading-none tracking-tight text-bz-text md:text-[28px]", NUM)}>
            {intf(data.activeCustomers)}
          </span>
          <span className="text-[11.5px] text-bz-text-muted">paying</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-bz-line-soft pt-2.5">
          <Coins size={12} className="shrink-0 text-bz-leaf-deep" />
          <p className="text-[11.5px] text-bz-text-muted">
            <span className={cn("font-semibold text-bz-text", NUM)}>{money(CODE, avgOf(data.mrr, data.activeCustomers))}</span>{" "}
            avg revenue / customer
          </p>
        </div>
      </StatTile>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MOVEMENT STRIP  (trailing-30-day deltas · signed + semantic colour)
// ════════════════════════════════════════════════════════════════════════════

function MovementCard({
  icon: Icon,
  label,
  display,
  caption,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  display: string;
  caption: string;
  accent: "lime" | "danger" | "amber";
}) {
  const chip =
    accent === "lime"
      ? "bg-bz-fire/[0.18] text-bz-text"
      : accent === "danger"
        ? "bg-[#FBE5E2] text-[#9A2E29]"
        : "bg-bz-leaf/50 text-bz-text";
  const iconColor =
    accent === "lime" ? "text-bz-leaf-deep" : accent === "danger" ? "text-[#C0413A]" : "text-bz-leaf-deep";
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-bz-text-muted">
          <Icon size={11} className="text-bz-text-soft" /> {label}
        </p>
        <span className={cn("inline-flex items-center rounded-bz-sm px-1.5 py-0.5 text-[10.5px] font-semibold", chip, NUM)}>
          {display}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <Icon size={16} className={cn("shrink-0", iconColor)} />
        <span className={cn("text-[22px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>{display}</span>
      </div>
      <p className="mt-2.5 text-[11px] text-bz-text-muted">{caption}</p>
    </div>
  );
}

function MovementStrip({ data }: { data: RevenuePayload }) {
  const m = data.movement;
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <p className={SECTION_LABEL}>Movement</p>
        <span className="text-[10.5px] text-bz-text-soft">· trailing 30 days</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MovementCard
          icon={TrendingUp}
          label="New subscriptions"
          display={`+${intf(m.added)}`}
          caption="Customers who started paying"
          accent="lime"
        />
        <MovementCard
          icon={TrendingDown}
          label="Churned"
          display={`−${intf(m.churned)}`}
          caption="Subscriptions cancelled or lapsed"
          accent="danger"
        />
        <MovementCard
          icon={AlertTriangle}
          label="At-risk"
          display={intf(m.atRisk)}
          caption="Past-due — recovery needed"
          accent="amber"
        />
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIFECYCLE BREAKDOWN  (fixed six-state tag wrap)
// ════════════════════════════════════════════════════════════════════════════

function StatusTag({
  meta,
  count,
}: {
  meta: (typeof STATUS_META)[number];
  count: number;
}) {
  const { label, dot, icon: Icon, note } = meta;
  return (
    <div className="flex items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 py-2.5">
      <span className={cn("size-1.5 shrink-0 rounded-bz-pill", DOT_BG[dot])} />
      <Icon size={13} className="shrink-0 text-bz-text-muted" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium text-bz-text">{label}</span>
        {note && <span className="block text-[9.5px] text-bz-text-soft">{note}</span>}
      </span>
      <span className={cn("shrink-0 text-[15px] font-semibold tracking-tight text-bz-text", NUM)}>{intf(count)}</span>
    </div>
  );
}

function LifecycleBreakdown({ data }: { data: RevenuePayload }) {
  const total = STATUS_META.reduce((s, m) => s + data.statuses[m.key], 0);
  return (
    <section className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className={SECTION_LABEL}>Subscriptions by lifecycle state</p>
        <p className={cn("text-[11px] text-bz-text-muted", NUM)}>
          <span className="font-semibold text-bz-text">{intf(total)}</span> total
        </p>
      </div>
      <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {STATUS_META.map((meta) => (
          <StatusTag key={meta.key} meta={meta} count={data.statuses[meta.key]} />
        ))}
      </div>
      <p className="mt-3.5 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-bz-text-soft">
        <AlertTriangle size={11} className="mt-px shrink-0 text-[#C0413A]" />
        <span>
          “Past-due” appears here and as the <span className="font-medium text-bz-text-muted">At-risk</span> movement stat
          above — the same{" "}
          <span className={cn("font-medium text-bz-text-muted", NUM)}>{intf(data.statuses.past_due)}</span> subscriptions,
          framed two ways.
        </span>
      </p>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

const FETCH_MS = 700;

export function SubscriptionRevenueDesignPage() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<RevenuePayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // when true, the NEXT fetch resolves to a failure (toggled by the header affordance)
  const failNext = React.useRef(false);
  const [willFail, setWillFail] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  const runFetch = React.useCallback(() => {
    window.clearTimeout(timer.current);
    setLoading(true);
    setError(null);
    const shouldFail = failNext.current;
    timer.current = window.setTimeout(() => {
      if (shouldFail) {
        failNext.current = false;
        setWillFail(false);
        setData(null);
        setError(FAIL_MESSAGE);
      } else {
        setData(SEED);
        setError(null);
      }
      setLoading(false);
    }, FETCH_MS);
  }, []);

  // initial fetch (succeeds by default → loading is the on-mount state)
  React.useEffect(() => {
    runFetch();
    return () => window.clearTimeout(timer.current);
  }, [runFetch]);

  const toggleFail = () => {
    failNext.current = !failNext.current;
    setWillFail(failNext.current);
  };

  // failed → render readouts in zero-fallback; resolved → the payload
  const board: RevenuePayload = data ?? ZERO;
  const failed = !loading && error != null;

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Subscriptions</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Revenue</span>
        </>
      }
    >
      <PageHeader loading={loading} willFail={willFail} onRefresh={runFetch} onToggleFail={toggleFail} />

      <div className="flex flex-col gap-4 px-4 pb-10 md:gap-5 md:px-8">
        {failed && <FailureBanner message={error!} onDismiss={() => setError(null)} />}

        {loading ? (
          <LoadingBoard />
        ) : (
          <>
            <KpiGrid data={board} />
            <MovementStrip data={board} />
            <LifecycleBreakdown data={board} />
          </>
        )}
      </div>
    </AppShell>
  );
}
