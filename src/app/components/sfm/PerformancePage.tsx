import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowDown, ArrowUp, CalendarCheck, Route as RouteIcon, SlidersHorizontal, UserRound, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, CARD, Chip, Empty, GHOST_SM, Kbd, LABEL, Meter, NUM, Segmented, Select, SkeletonRows, Stat, Statline, Tabs, ToastHost, useToast } from "../sales/bzw";
import { Failed } from "../masters/kit/marks";
import { useKeys, useMedia } from "../sales/orders";
import { personById } from "../productivity/shared";
import { FIELD_TODAY, REPS, dayAdd, fmtDay, fmtDayShort, isWorkday, pct, relDayName, repDay, routeHealth, toMin, weekOf } from "./model";
import type { RepDay, RouteHealth } from "./model";
import { Money, OfCount, RepName, RouteChip, SfmFrame, useField, useSheetLinks } from "./kit";
import { SheetHost } from "./sheets";

// ════════════════════════════════════════════════════════════════════════════
// PERFORMANCE — who performs, which routes pay, which days closed how
//
// Every figure is summed from the same `repDay` the Today board reads, over the
// workdays of the period, so a rep's compliance here cannot disagree with the
// strip on their Today row. One definition per metric (spec §10), quoted in each
// column head's tooltip.
//
// Replaces: Eod, Eod Report (ranges), Salesman Activity, the per-rep summaries
// (research/01 §2.13 — the at-close figures the backend returns and no screen
// renders are the Day closes view).
// ════════════════════════════════════════════════════════════════════════════

type Period = "week" | "lastweek" | "month" | "30d";
type View = "reps" | "routes" | "closes";

const PERIODS: { value: Period; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "lastweek", label: "Last week" },
  { value: "month", label: "This month" },
  { value: "30d", label: "Last 30 days" },
];

/** Every period ends on or before today; the widest one bounds the memoised window. */
function rangeOf(p: Period): { from: string; to: string } {
  if (p === "week") return { from: weekOf(FIELD_TODAY)[0], to: FIELD_TODAY };
  if (p === "lastweek") {
    const w = weekOf(dayAdd(FIELD_TODAY, -7));
    return { from: w[0], to: w[6] };
  }
  if (p === "month") return { from: `${FIELD_TODAY.slice(0, 8)}01`, to: FIELD_TODAY };
  return { from: dayAdd(FIELD_TODAY, -29), to: FIELD_TODAY };
}
const WINDOW_FROM = [rangeOf("week"), rangeOf("lastweek"), rangeOf("month"), rangeOf("30d")].map((r) => r.from).sort()[0];

// TodayPage keeps its subsidiary options inline (not exported) — the same two, copied.
const SUBS = [
  { value: "NP-01", label: "Bizak Nepal", hint: "Kathmandu valley" },
  { value: "NP-02", label: "Bizak Gandaki", hint: "Pokhara" },
];
const subName = (id: string) => SUBS.find((s) => s.value === id)?.hint ?? id;

/** Spec §10 — the one definition of each metric; every head and stat quotes these. */
const DEF = {
  days: "Workdays with at least one check-in",
  planned: "Parties on the routes planned for the rep that day, summed over the period",
  visited: "Distinct planned parties with a check-in that day. Compliance = visited ÷ planned; unplanned visits never count",
  productive: "Visits whose party has a sales order by the rep that day ÷ all visits (planned + unplanned). Inferred: a visit is not linked to its order",
  orders: "Live sales orders by the rep (sales rep, else created by), dated by created date, in base currency (NPR)",
  lpc: "Distinct items on the day's orders ÷ productive visits",
  drop: "Order value ÷ productive visits, base currency (NPR)",
  received: "Receipts by the rep: collected (tagged to invoices) plus advance (the rest), live",
  firstIn: "Earliest of punch-in and first visit check-in — the median over worked days",
  closed: "Days closed, of worked days before today (today's close is still due)",
};

const LOOK_BELOW = 75;

// ── Aggregation ─────────────────────────────────────────────────────────────

type Score = {
  worked: number;
  planned: number;
  visited: number;
  allVisits: number;
  productive: number;
  value: number;
  lines: number;
  received: number;
  closed: number;
  closable: number;
  firstIn: string | null;
};

const median = (xs: string[]) => {
  const s = [...xs].sort();
  return s[Math.floor(s.length / 2)] ?? null;
};

function scoreOf(days: RepDay[]): Score {
  const worked = days.filter((d) => d.visits.length > 0);
  return {
    worked: worked.length,
    planned: days.reduce((s, d) => s + d.figures.planned, 0),
    visited: days.reduce((s, d) => s + d.figures.visited, 0),
    allVisits: days.reduce((s, d) => s + d.figures.visited + d.figures.unplanned, 0),
    productive: days.reduce((s, d) => s + d.figures.productive, 0),
    value: days.reduce((s, d) => s + d.figures.value, 0),
    lines: days.reduce((s, d) => s + d.orders.filter((o) => !o.cancelled).reduce((a, o) => a + o.lines, 0), 0),
    received: days.reduce((s, d) => s + d.figures.received, 0),
    closed: days.filter((d) => d.close).length,
    closable: worked.filter((d) => d.date < FIELD_TODAY).length,
    firstIn: median(worked.map((d) => d.figures.firstIn).filter((x): x is string => !!x)),
  };
}
const compliance = (s: Score) => pct(s.visited, s.planned);
const productivePct = (s: Score) => pct(s.productive, s.allVisits);
const lpc = (s: Score) => (s.productive ? s.lines / s.productive : 0);
const drop = (s: Score) => (s.productive ? s.value / s.productive : 0);

// ── The page ────────────────────────────────────────────────────────────────

export function PerformancePage() {
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const { routes, links, plans, orders, receipts } = useField();
  const sheets = useSheetLinks();
  const { toast, dismiss } = useToast();
  const wide = useMedia("(min-width: 1360px)");
  const mid = useMedia("(min-width: 1024px)");
  const tier = wide ? 2 : mid ? 1 : 0;

  const flag = (k: string) => search.get(k) === "1";
  const period = (PERIODS.some((p) => p.value === search.get("period")) ? search.get("period") : "30d") as Period;
  const view = (["reps", "routes", "closes"].includes(search.get("view") ?? "") ? search.get("view") : "reps") as View;
  const setParam = (k: string, v: string | null) => {
    const p = new URLSearchParams(search);
    if (v === null) p.delete(k);
    else p.set(k, v);
    setSearch(p, { replace: true });
  };
  const [sub, setSub] = React.useState<string[]>([]);
  const [repPick, setRepPick] = React.useState<string[]>([]);
  const [closePick, setClosePick] = React.useState<"changed" | "open" | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(flag("fail"));
  React.useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), flag("slow") ? 2400 : 380);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Every rep-day of the widest window, once per store change; a period only filters it.
  const byRep = React.useMemo(() => {
    const ctx = { routes, links, plans, orders, receipts };
    const dates: string[] = [];
    for (let d = WINDOW_FROM; d <= FIELD_TODAY; d = dayAdd(d, 1)) if (isWorkday(d)) dates.push(d);
    return new Map(REPS.map((r) => [r.id, dates.map((d) => repDay(r.id, d, ctx))]));
  }, [routes, links, plans, orders, receipts]);
  const health = React.useMemo(() => {
    const ctx = { routes, links, plans, orders };
    return new Map(routes.map((rt) => [rt.id, routeHealth(rt.id, ctx)]));
  }, [routes, links, plans, orders]);

  const range = rangeOf(period);
  const empty = flag("empty");
  const allReps = empty ? [] : REPS;
  const scoped = allReps.filter((r) => (!sub.length || sub.includes(r.subsidiaryId)) && (!repPick.length || repPick.includes(r.id)));
  const daysOf = (repId: string) => (byRep.get(repId) ?? []).filter((d) => d.date >= range.from && d.date <= range.to);
  const scopedDays = scoped.flatMap((r) => daysOf(r.id));
  const total = scoreOf(scopedDays);
  const clear = () => (setSub([]), setRepPick([]), setClosePick(null));

  useKeys({ escape: () => (!sheets.rep && !sheets.party && closePick ? setClosePick(null) : undefined) });

  const visitsLink = (repId: string) => navigate(`/design/sfm/visits?reps=${repId}&from=${range.from}&to=${range.to}`);
  const openDay = (repId: string, date: string) => navigate(`/design/sfm/today/${repId}${date !== FIELD_TODAY ? `?day=${date}` : ""}`);

  const body = () => {
    if (loading)
      return (
        <div className={cn(CARD, "overflow-hidden")}>
          <SkeletonRows rows={7} text="Reading the period…" />
        </div>
      );
    if (failed)
      return (
        <div className={CARD}>
          <Failed text="Couldn't read the figures for this period." onRetry={() => setFailed(false)} />
        </div>
      );
    if (!allReps.length)
      return (
        <div className={CARD}>
          <Empty title="No sales reps yet." icon={UserRound} action={<span className="text-[12px] text-bz-text-muted">Mark an employee as a sales rep (Employee › Sales rep) and they appear here.</span>} />
        </div>
      );
    if (!scoped.length)
      return (
        <div className={CARD}>
          <Empty title="No rep matches." action={<button type="button" className={GHOST_SM} onClick={clear}>Clear all</button>} />
        </div>
      );
    if (view === "routes") return <RoutesView reps={scoped.map((r) => r.id)} subs={sub} daysOf={daysOf} health={health} tier={tier} onClear={clear} />;
    if (view === "closes") return <ClosesView days={scopedDays} tier={tier} pick={closePick} setPick={setClosePick} onOpen={openDay} />;
    return <RepsView reps={scoped.map((r) => r.id)} daysOf={daysOf} tier={tier} onOpenRep={sheets.openRep} onVisits={visitsLink} />;
  };

  return (
    <SfmFrame tab="performance">
      <div className="h-full min-h-0 overflow-y-auto [scrollbar-width:thin]">
        <div className="border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">
          <Statline>
            <Stat label="Compliance" value={`${compliance(total)}%`} meter={compliance(total)} danger={total.planned > 0 && compliance(total) < LOOK_BELOW} title={DEF.visited} />
            <Stat label="Productive" value={`${productivePct(total)}%`} title={DEF.productive} />
            <Stat label="Orders" value={<Money value={total.value} />} title={DEF.orders} />
            <Stat label="Lines per call" value={lpc(total).toFixed(1)} title={DEF.lpc} />
            <Stat label="Drop size" value={<Money value={drop(total)} />} title={DEF.drop} />
            <Stat label="Received" value={<Money value={total.received} />} title={DEF.received} />
            <Stat label="First check-in" value={total.firstIn ?? "—"} sub="median" title={DEF.firstIn} />
            <Stat label="Days closed" value={`${total.closed} of ${total.closable}`} sub="worked" danger={total.closed < total.closable} title={DEF.closed} />
          </Statline>
        </div>

        <div className="sticky top-0 z-30 border-b border-bz-line bg-bz-paper">
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 md:px-6">
            <Segmented size={mid ? "md" : "sm"} value={period} onChange={(v) => setParam("period", v === "30d" ? null : v)} options={PERIODS} />
            <Select
              multiple
              label="Subsidiary"
              icon={SlidersHorizontal}
              badge={sub.length}
              applied={sub.length > 0}
              value={sub}
              onChange={setSub}
              options={SUBS}
              width={240}
            />
            <Select
              multiple
              label="Rep"
              icon={Users}
              badge={repPick.length}
              applied={repPick.length > 0}
              value={repPick}
              onChange={setRepPick}
              options={REPS.filter((r) => !sub.length || sub.includes(r.subsidiaryId)).map((r) => ({ value: r.id, label: r.name, hint: subName(r.subsidiaryId), person: personById(r.id) }))}
              width={260}
            />
            <span className={cn("ml-auto text-[11px] text-bz-text-soft", NUM)}>
              {range.from === range.to ? fmtDay(range.from) : `${fmtDayShort(range.from)} – ${fmtDayShort(range.to)}`}
            </span>
          </div>
          <div className="px-2 md:px-4">
            <Tabs
              value={view}
              onChange={(v) => setParam("view", v === "reps" ? null : v)}
              tabs={[
                { value: "reps", label: "Reps", icon: UserRound },
                { value: "routes", label: "Routes", icon: RouteIcon },
                { value: "closes", label: "Day closes", icon: CalendarCheck },
              ]}
            />
          </div>
        </div>

        <div className="p-4 pb-24 md:p-6 md:pb-24">{body()}</div>
      </div>
      <SheetHost onOpenDay={(id, d) => navigate(`/design/sfm/today/${id}?day=${d}`)} onOpenVisit={(id) => navigate(`/design/sfm/visits/${id}`)} />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SfmFrame>
  );
}

// ── The table (DocDesk's row grammar: warm LABEL head, banded rows) ─────────

type Col<T> = {
  key: string;
  label: string;
  title: string;
  width: string;
  /** 0 always shown · 1 from 1024px · 2 from 1360px. */
  tier?: 0 | 1 | 2;
  right?: boolean;
  sort?: (r: T) => number | string;
  render: (r: T) => React.ReactNode;
};
type Group<T> = { key: string; label?: string; right?: React.ReactNode; rows: T[] };
type SortState = { key: string; desc: boolean };

function Table<T>({ cols, groups, rowKey, onRow, rowTitle, tier, sort, setSort }: { cols: Col<T>[]; groups: Group<T>[]; rowKey: (r: T) => string; onRow: (r: T) => void; rowTitle?: (r: T) => string; tier: number; sort: SortState; setSort: (s: SortState) => void }) {
  const shown = cols.filter((c) => (c.tier ?? 0) <= tier);
  const template = shown.map((c) => c.width).join(" ");
  const by = cols.find((c) => c.key === sort.key)?.sort;
  const order = (rows: T[]) => (by ? [...rows].sort((a, b) => (by(a) < by(b) ? -1 : by(a) > by(b) ? 1 : 0) * (sort.desc ? -1 : 1)) : rows);
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className={cn("grid items-end gap-2.5 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5", LABEL)} style={{ gridTemplateColumns: template }}>
        {shown.map((c) => {
          const on = sort.key === c.key;
          const Arrow = sort.desc ? ArrowDown : ArrowUp;
          return c.sort ? (
            <button
              key={c.key}
              type="button"
              title={c.title}
              onClick={() => setSort({ key: c.key, desc: on ? !sort.desc : true })}
              className={cn("inline-flex min-w-0 items-center gap-1 text-left uppercase leading-[1.25] tracking-[inherit] hover:text-bz-text", c.right && "justify-end text-right", on && "text-bz-text")}
            >
              <span className="min-w-0">{c.label}</span>
              {on && <Arrow size={10} className="shrink-0" />}
            </button>
          ) : (
            <span key={c.key} title={c.title} className={cn("min-w-0 leading-[1.25]", c.right && "text-right")}>
              {c.label}
            </span>
          );
        })}
      </div>
      {groups.map((g) => (
        <section key={g.key}>
          {g.label && (
            <div className="flex items-center gap-2 border-b border-bz-line-soft bg-bz-paper-warm/60 px-3 py-2">
              <h3 className="m-0 text-[12.5px] font-semibold text-bz-text">{g.label}</h3>
              <span className={cn("rounded-bz-sm bg-bz-surface/70 px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>{g.rows.length}</span>
              {g.right && <span className="ml-auto whitespace-nowrap text-[11px] text-bz-text-soft">{g.right}</span>}
            </div>
          )}
          {order(g.rows).map((r) => (
            <div
              key={rowKey(r)}
              role="button"
              tabIndex={0}
              title={rowTitle?.(r)}
              onClick={() => onRow(r)}
              onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && onRow(r)}
              className="grid cursor-pointer items-center gap-2.5 border-b border-bz-line-soft bg-bz-surface px-3 py-2.5 transition-colors last:border-0 hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire"
              style={{ gridTemplateColumns: template }}
            >
              {shown.map((c) => (
                <div key={c.key} className={cn("min-w-0 text-[11.5px] text-bz-text-muted", NUM, c.right && "text-right")}>
                  {c.render(r)}
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

/** A figure beside a bar scaled to the top row — the one comparison a scorecard needs, no chart library. */
function BarFigure({ value, max, bar }: { value: number; max: number; bar: boolean }) {
  return (
    <span className="flex items-center justify-end gap-2">
      {bar && (
        <span className="flex h-1.5 w-[96px] min-w-0 shrink overflow-hidden rounded-bz-pill bg-bz-line-soft" aria-hidden>
          <span className="rounded-bz-pill bg-bz-leaf-deep" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
        </span>
      )}
      <Money value={value} code={false} className="shrink-0 text-[12px] font-semibold text-bz-text" />
    </span>
  );
}

// ── Reps ────────────────────────────────────────────────────────────────────

type RepRow = { repId: string; s: Score };

function RepsView({ reps, daysOf, tier, onOpenRep, onVisits }: { reps: string[]; daysOf: (repId: string) => RepDay[]; tier: number; onOpenRep: (id: string) => void; onVisits: (repId: string) => void }) {
  const [sort, setSort] = React.useState<SortState>({ key: "orders", desc: true });
  const rows: RepRow[] = reps.map((repId) => ({ repId, s: scoreOf(daysOf(repId)) }));
  const top = Math.max(0, ...rows.map((r) => r.s.value));
  const cols: Col<RepRow>[] = [
    {
      key: "rep",
      label: "Rep",
      title: "Opens the rep",
      width: "minmax(0,1.6fr)",
      sort: (r) => personById(r.repId)?.name ?? "",
      render: (r) => <RepName repId={r.repId} size={24} sub={subName(REPS.find((x) => x.id === r.repId)?.subsidiaryId ?? "")} />,
    },
    { key: "days", label: "Days", title: DEF.days, width: "48px", tier: 2, right: true, sort: (r) => r.s.worked, render: (r) => r.s.worked },
    { key: "planned", label: "Planned", title: DEF.planned, width: "60px", tier: 2, right: true, sort: (r) => r.s.planned, render: (r) => r.s.planned },
    {
      key: "visited",
      label: "Visited",
      title: DEF.visited,
      width: tier ? "100px" : "78px",
      sort: (r) => compliance(r.s),
      render: (r) => {
        const c = compliance(r.s);
        const look = r.s.planned > 0 && c < LOOK_BELOW;
        return (
          <button
            type="button"
            onClick={(e) => (e.stopPropagation(), onVisits(r.repId))}
            title={`${r.s.visited} of ${r.s.planned} planned stops — open these visits`}
            className="-mx-1 flex w-[calc(100%+8px)] flex-col items-start gap-1 rounded-bz-sm px-1 py-0.5 text-left hover:bg-bz-line-soft/60 focus-visible:outline-2 focus-visible:outline-bz-fire"
          >
            <span className="whitespace-nowrap text-[12px]">
              <span className={cn("font-semibold", look ? "text-bz-red" : "text-bz-text")}>{r.s.visited}</span>
              <span className={cn(look ? "text-bz-red" : "text-bz-text-soft")}> · {c}%</span>
            </span>
            <Meter pct={c} thin danger={look} className="w-14" />
          </button>
        );
      },
    },
    { key: "productive", label: "Productive", title: DEF.productive, width: "72px", tier: 1, right: true, sort: (r) => productivePct(r.s), render: (r) => `${productivePct(r.s)}%` },
    { key: "orders", label: "Orders", title: DEF.orders, width: tier ? "200px" : "76px", right: true, sort: (r) => r.s.value, render: (r) => <BarFigure value={r.s.value} max={top} bar={tier > 0} /> },
    { key: "lpc", label: "Lines / call", title: DEF.lpc, width: "56px", tier: 2, right: true, sort: (r) => lpc(r.s), render: (r) => lpc(r.s).toFixed(1) },
    { key: "drop", label: "Drop size", title: DEF.drop, width: "76px", tier: 1, right: true, sort: (r) => drop(r.s), render: (r) => <Money value={drop(r.s)} code={false} /> },
    { key: "received", label: "Received", title: DEF.received, width: tier ? "84px" : "72px", right: true, sort: (r) => r.s.received, render: (r) => <Money value={r.s.received} code={false} className="text-bz-text" /> },
    { key: "firstIn", label: "First in", title: DEF.firstIn, width: "56px", tier: 2, right: true, sort: (r) => (r.s.firstIn ? toMin(r.s.firstIn) : 9999), render: (r) => r.s.firstIn ?? "—" },
    {
      key: "closed",
      label: "Closed",
      title: DEF.closed,
      width: "60px",
      tier: 1,
      right: true,
      sort: (r) => r.s.closed - r.s.closable,
      render: (r) => <span className={r.s.closed < r.s.closable ? "font-semibold text-bz-red" : ""}>{`${r.s.closed}/${r.s.closable}`}</span>,
    },
  ];
  return (
    <>
      <Table cols={cols} groups={[{ key: "all", rows }]} rowKey={(r) => r.repId} onRow={(r) => onOpenRep(r.repId)} tier={tier} sort={sort} setSort={setSort} />
      <p className="m-0 mt-3 text-[10.5px] text-bz-text-soft">
        Red: compliance under {LOOK_BELOW}% or a worked day not closed. Money in NPR.
      </p>
    </>
  );
}

// ── Routes ──────────────────────────────────────────────────────────────────

type RouteRow = { h: RouteHealth; runs: number; planned: number; visited: number; productive: number; value: number };

const FLAG_LABEL: Record<RouteHealth["flags"][number], string> = {
  "no-rep": "No rep",
  "no-parties": "No parties",
  "unplanned-week": "Not planned in 7 days",
  quiet: "No run in 30 days",
};

function RoutesView({ reps, subs, daysOf, health, tier, onClear }: { reps: string[]; subs: string[]; daysOf: (repId: string) => RepDay[]; health: Map<string, RouteHealth>; tier: number; onClear: () => void }) {
  const navigate = useNavigate();
  const sheets = useSheetLinks();
  const [sort, setSort] = React.useState<SortState>({ key: "value", desc: true });
  const days = reps.flatMap(daysOf);
  const repFiltered = reps.length < REPS.length;
  const rows: RouteRow[] = [...health.values()]
    .filter((h) => !subs.length || subs.includes(h.route.subsidiaryId))
    .map((h) => {
      const runs = days.filter((d) => d.plans.some((p) => p.routeId === h.route.id));
      const stops = runs.flatMap((d) => d.stops.filter((s) => s.routeId === h.route.id));
      return {
        h,
        runs: runs.length,
        planned: stops.length,
        visited: stops.filter((s) => s.state === "productive" || s.state === "visited").length,
        productive: stops.filter((s) => s.state === "productive").length,
        value: stops.reduce((s, x) => s + x.orders.reduce((a, o) => a + o.value, 0), 0),
      };
    })
    // A rep filter keeps the routes those reps ran in the period or are on.
    .filter((r) => !repFiltered || r.runs > 0 || r.h.reps.some((x) => reps.includes(x.id)));
  if (!rows.length)
    return (
      <div className={CARD}>
        <Empty title="No routes in scope." icon={RouteIcon} action={<button type="button" className={GHOST_SM} onClick={onClear}>Clear all</button>} />
      </div>
    );
  const top = Math.max(0, ...rows.map((r) => r.value));
  const cols: Col<RouteRow>[] = [
    {
      key: "route",
      label: "Route",
      title: "Opens the route",
      width: "minmax(0,1.8fr)",
      sort: (r) => r.h.route.id,
      render: (r) => (
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          <RouteChip route={r.h.route} />
          {r.h.flags.map((f) => (
            <Chip key={f} tone="danger" className="px-1.5 text-[10.5px]">
              {FLAG_LABEL[f]}
            </Chip>
          ))}
        </span>
      ),
    },
    { key: "runs", label: "Runs", title: "Rep-days in the period with this route planned (today counts while it runs)", width: "52px", tier: 1, right: true, sort: (r) => r.runs, render: (r) => r.runs },
    { key: "parties", label: "Parties", title: "Parties on the route now", width: "60px", tier: 2, right: true, sort: (r) => r.h.parties.length, render: (r) => r.h.parties.length },
    {
      key: "visited",
      label: "Visited",
      title: "Planned stops of this route visited on its runs ÷ planned stops on its runs",
      width: tier ? "92px" : "64px",
      sort: (r) => pct(r.visited, r.planned),
      render: (r) =>
        r.planned ? (
          <span className="flex flex-col items-start gap-1">
            <span className={cn("whitespace-nowrap text-[12px] font-semibold", pct(r.visited, r.planned) < LOOK_BELOW ? "text-bz-red" : "text-bz-text")}>{pct(r.visited, r.planned)}%</span>
            <Meter pct={pct(r.visited, r.planned)} thin danger={pct(r.visited, r.planned) < LOOK_BELOW} className="w-14" />
          </span>
        ) : (
          <span className="text-bz-text-soft">—</span>
        ),
    },
    { key: "productive", label: "Productive", title: "Visited stops of this route with an order by the rep that day ÷ visited stops (unplanned visits have no route)", width: "72px", tier: 1, right: true, sort: (r) => pct(r.productive, r.visited), render: (r) => (r.visited ? `${pct(r.productive, r.visited)}%` : "—") },
    { key: "value", label: "Orders", title: "Live orders by the run's rep for this route's parties on its run days, base currency (NPR)", width: tier ? "190px" : "76px", right: true, sort: (r) => r.value, render: (r) => <BarFigure value={r.value} max={top} bar={tier > 0} /> },
    {
      key: "coverage",
      label: "Coverage 30d",
      title: "Parties on the route visited at least once in the last 30 days ÷ its parties",
      width: "96px",
      tier: 1,
      sort: (r) => r.h.coverage30,
      render: (r) => (
        <span className="flex items-center gap-2">
          <Meter pct={r.h.coverage30} thin className="w-12" />
          <span className="text-[11.5px] text-bz-text">{r.h.coverage30}%</span>
        </span>
      ),
    },
    {
      key: "reps",
      label: "Reps",
      title: "Reps on the route now",
      width: "72px",
      tier: 2,
      sort: (r) => r.h.reps.length,
      render: (r) =>
        r.h.reps.length ? (
          <span className="flex items-center -space-x-1">
            {r.h.reps.map((x) => (
              <button key={x.id} type="button" onClick={(e) => (e.stopPropagation(), sheets.openRep(x.id))} title={`Open ${x.name}`} className="rounded-bz-pill focus-visible:outline-2 focus-visible:outline-bz-fire">
                <Avatar person={personById(x.id)} size={20} ring />
              </button>
            ))}
          </span>
        ) : (
          <span className="text-bz-red">—</span>
        ),
    },
  ];
  return (
    <>
      <Table cols={cols} groups={[{ key: "all", rows }]} rowKey={(r) => r.h.route.id} onRow={(r) => navigate(`/design/sfm/routes/${r.h.route.id}`)} tier={tier} sort={sort} setSort={setSort} />
      <p className="m-0 mt-3 text-[10.5px] text-bz-text-soft">Runs, visits and orders are for the reps and period chosen; parties, coverage and reps are the route as it is today.</p>
    </>
  );
}

// ── Day closes ──────────────────────────────────────────────────────────────

const changedSinceClose = (d: RepDay) => !!d.close && (d.close.orders !== d.figures.orders || d.close.value !== d.figures.value || d.close.collected !== d.figures.collected || d.close.advance !== d.figures.advance);
const notClosed = (d: RepDay) => !d.close && d.date < FIELD_TODAY;

/** "at close → now" — one figure when nothing moved, the changed side in amber when it did. */
function AtNow({ at, now, money }: { at: number | null; now: number; money?: boolean }) {
  const fmt = (n: number) => (money ? <Money value={n} code={false} /> : n);
  if (at === null || at === now) return <span className="text-bz-text">{fmt(now)}</span>;
  return (
    <span className="whitespace-nowrap" title="At close → now">
      <span className="text-bz-text-soft">{fmt(at)}</span>
      <span className="text-bz-text-soft"> → </span>
      <span className="font-semibold text-bz-amber-ink">{fmt(now)}</span>
    </span>
  );
}

function ClosesView({ days, tier, pick, setPick, onOpen }: { days: RepDay[]; tier: number; pick: "changed" | "open" | null; setPick: (p: "changed" | "open" | null) => void; onOpen: (repId: string, date: string) => void }) {
  const [sort, setSort] = React.useState<SortState>({ key: "rep", desc: false });
  const all = days.filter((d) => d.visits.length > 0 || d.close);
  const changed = all.filter(changedSinceClose);
  const open = all.filter(notClosed);
  const rows = pick === "changed" ? changed : pick === "open" ? open : all;
  const dates = Array.from(new Set(rows.map((d) => d.date))).sort().reverse();
  const groups: Group<RepDay>[] = dates.map((date) => {
    const rs = rows.filter((d) => d.date === date);
    const rel = relDayName(date);
    return {
      key: date,
      label: rel === fmtDay(date) ? fmtDay(date) : `${rel} · ${fmtDay(date)}`,
      right: date === FIELD_TODAY ? "day running" : `${rs.filter((d) => d.close).length} closed`,
      rows: rs,
    };
  });
  const cols: Col<RepDay>[] = [
    { key: "rep", label: "Rep", title: "Opens the day", width: "minmax(0,1.4fr)", sort: (d) => d.rep.name, render: (d) => <RepName repId={d.rep.id} size={22} /> },
    {
      key: "closedAt",
      label: "Closed at",
      title: "When the rep closed the day (end-of-day)",
      width: "80px",
      sort: (d) => d.close?.closedAt ?? (d.date === FIELD_TODAY ? "~" : ""),
      render: (d) =>
        d.close ? (
          <span className="text-bz-text">{d.close.closedAt}</span>
        ) : d.date === FIELD_TODAY ? (
          <span className="text-bz-text-soft">Open</span>
        ) : (
          <span className="font-semibold text-bz-red">Not closed</span>
        ),
    },
    { key: "orders", label: "Orders", title: "Live orders at close → now (a cancelled or late order moves it)", width: "64px", tier: 1, right: true, sort: (d) => d.figures.orders, render: (d) => <AtNow at={d.close?.orders ?? null} now={d.figures.orders} /> },
    { key: "value", label: "Value", title: `Order value at close → now. ${DEF.orders}`, width: tier ? "128px" : "minmax(84px,1fr)", right: true, sort: (d) => d.figures.value, render: (d) => <AtNow at={d.close?.value ?? null} now={d.figures.value} money /> },
    { key: "collected", label: "Collected", title: "Receipts tagged to invoices, at close → now (back office tags after the close)", width: "128px", tier: 1, right: true, sort: (d) => d.figures.collected, render: (d) => <AtNow at={d.close?.collected ?? null} now={d.figures.collected} money /> },
    { key: "advance", label: "Advance", title: "Receipts not tagged to an invoice, at close → now", width: "128px", tier: 2, right: true, sort: (d) => d.figures.advance, render: (d) => <AtNow at={d.close?.advance ?? null} now={d.figures.advance} money /> },
    {
      key: "visited",
      label: "Visited",
      title: "Planned stops visited, of allocated — as closed; live while the day is open",
      width: "72px",
      sort: (d) => (d.close ? pct(d.close.visited, d.close.allocated) : pct(d.figures.visited, d.figures.planned)),
      render: (d) => (d.close ? <OfCount n={d.close.visited} of={d.close.allocated} className="text-[11.5px]" /> : <OfCount n={d.figures.visited} of={d.figures.planned} className="text-[11.5px]" />),
    },
    { key: "remarks", label: "Remarks", title: "The rep's remark at close", width: "minmax(0,1.2fr)", tier: 2, render: (d) => <span className="block truncate" title={d.close?.remarks || undefined}>{d.close?.remarks || <span className="text-bz-text-soft">—</span>}</span> },
  ];
  return (
    <>
      <div className="mb-3">
        <Statline>
          <Stat label="Changed since close" value={changed.length} active={pick === "changed"} onPick={() => setPick(pick === "changed" ? null : "changed")} title="Orders, value, collected or advance differ from the figures at close" />
          <Stat label="Not closed" value={open.length} danger={open.length > 0} active={pick === "open"} onPick={() => setPick(pick === "open" ? null : "open")} title="Worked days before today with no day close" />
          <Stat label="Closed" value={`${all.filter((d) => d.close).length} of ${all.filter((d) => d.date < FIELD_TODAY).length}`} title={DEF.closed} />
        </Statline>
      </div>
      {rows.length === 0 ? (
        <div className={CARD}>
          <Empty title={pick ? "Nothing here for this period." : "No worked days in this period."} action={pick ? <button type="button" className={GHOST_SM} onClick={() => setPick(null)}>Show all</button> : undefined} />
        </div>
      ) : (
        <Table
          cols={cols}
          groups={groups}
          rowKey={(d) => `${d.rep.id}|${d.date}`}
          rowTitle={(d) => `Open ${d.rep.name}'s day, ${fmtDay(d.date)}`}
          onRow={(d) => onOpen(d.rep.id, d.date)}
          tier={tier}
          sort={sort}
          setSort={setSort}
        />
      )}
      <p className="m-0 mt-3 text-[10.5px] text-bz-text-soft">
        <span className="font-semibold text-bz-amber-ink">Amber</span> is what changed after the close. <Kbd>Esc</Kbd> clears the pick.
      </p>
    </>
  );
}
