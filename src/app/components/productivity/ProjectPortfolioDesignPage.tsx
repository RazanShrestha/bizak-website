import * as React from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  LayoutGrid,
  Rows3,
  Lock,
  ArrowRight,
  Building2,
  X,
} from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import {
  Project,
  ProjectHealth,
  Task,
  TimeEntry,
  SEED_TASKS,
  SEED_TIME_ENTRIES,
  PROJECTS,
  HEALTH_LABEL,
  TODAY,
  Avatar,
  AvatarStack,
  Chip,
  Crumb,
  DueChip,
  EmptyBlock,
  MeterBar,
  StackBar,
  MilestoneMark,
  NoResults,
  Segmented,
  useDocumentTitle,
  personById,
  clientById,
  isDone,
  dueBand,
  isBlocked,
  projectPlanned,
  projectLogged,
  unestimatedTasks,
  fmtH,
  fmtShort,
  daysBetween,
  money,
  NUM,
  CARD,
  LABEL,
  PRIMARY_BTN,
  GHOST_BTN_SM,
  SHADOW_SOFT,
  DANGER_TEXT,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// PROJECT PORTFOLIO  every project, ranked by what needs a decision
//
// PRIMARY ACTION: find the project that is going wrong, and open it. Not
// "browse projects" — a delivery lead already knows what they run; what they
// cannot see is which one slipped this week. So the default sort is BY RISK
// (off track → at risk → on track), health is the loudest thing on a card,
// and every card carries the three numbers that argue with each other:
// task progress, hours against budget, and value billed against contract.
//
// Two representations, one data set: cards (scan) and a table (compare). The
// table exists because "which project has the worst hours-vs-progress gap" is
// a column question, not a card question.
// ════════════════════════════════════════════════════════════════════════════

const HEALTH_TONE = {
  on_track: "positive",
  at_risk: "partial",
  off_track: "danger",
  not_started: "pending",
} as const;

const HEALTH_RANK: Record<ProjectHealth, number> = { off_track: 0, at_risk: 1, on_track: 2, not_started: 3 };

type Shape = "cards" | "table";

export function ProjectPortfolioDesignPage() {
  const [tasks] = React.useState<Task[]>(SEED_TASKS);
  const [entries] = React.useState<TimeEntry[]>(SEED_TIME_ENTRIES);
  const [shape, setShape] = React.useState<Shape>("cards");
  const [q, setQ] = React.useState("");
  const [health, setHealth] = React.useState<ProjectHealth[]>([]);

  useDocumentTitle("Projects · Bizak");

  const rows = React.useMemo(() => {
    return PROJECTS.map((p) => {
      const mine = tasks.filter((t) => t.projectId === p.id);
      const done = mine.filter(isDone).length;
      const overdue = mine.filter((t) => !isDone(t) && dueBand(t.due) === "overdue").length;
      const blocked = mine.filter((t) => !isDone(t) && isBlocked(tasks, t)).length;
      const milestones = mine.filter((t) => t.isMilestone);
      const nextMilestone = milestones.filter((m) => !isDone(m)).sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"))[0];
      const pct = mine.length ? Math.round((done / mine.length) * 100) : 0;
      const logged = projectLogged(tasks, entries, p.id);
      const planned = projectPlanned(tasks, p.id);
      const hoursPct = p.budgetHours ? Math.round((logged / p.budgetHours) * 100) : 0;
      return {
        p,
        total: mine.length,
        done,
        pct,
        overdue,
        blocked,
        logged,
        planned,
        unestimated: unestimatedTasks(tasks, p.id).length,
        hoursPct,
        // The gap that matters: hours burned ahead of work finished.
        gap: hoursPct - pct,
        nextMilestone,
        milestones: milestones.length,
        milestonesDone: milestones.filter(isDone).length,
      };
    })
      .filter((r) => {
        if (q && !r.p.name.toLowerCase().includes(q.toLowerCase()) && !r.p.code.toLowerCase().includes(q.toLowerCase()))
          return false;
        if (health.length && !health.includes(r.p.health)) return false;
        return true;
      })
      .sort((a, b) => HEALTH_RANK[a.p.health] - HEALTH_RANK[b.p.health] || b.overdue - a.overdue);
  }, [tasks, entries, q, health]);

  const totals = React.useMemo(() => {
    const active = PROJECTS.filter((p) => p.health !== "not_started");
    return {
      projects: PROJECTS.length,
      active: active.length,
      atRisk: PROJECTS.filter((p) => p.health === "at_risk" || p.health === "off_track").length,
      hours: PROJECTS.reduce((s, p) => s + projectLogged(SEED_TASKS, SEED_TIME_ENTRIES, p.id), 0),
      budget: PROJECTS.reduce((s, p) => s + p.budgetHours, 0),
      billed: PROJECTS.reduce((s, p) => s + p.billedValue, 0),
      contract: PROJECTS.reduce((s, p) => s + p.contractValue, 0),
    };
  }, []);

  const nFilters = health.length + (q ? 1 : 0);

  return (
    <AppShell breadcrumb={<Crumb trail={["Work", "Projects"]} />}>
      <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-5 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-bz-text md:text-[25px]">
              Projects
            </h1>
            <p className="mt-1 text-[12px] text-bz-text-muted">
              {totals.active} active · sorted by risk, so the one that needs you is first.
            </p>
          </div>
          <button type="button" className={PRIMARY_BTN}>
            <Plus size={12} /> New project
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-line-soft md:grid-cols-4">
          <Stat label="Projects" value={String(totals.projects)} sub={`${totals.atRisk} need attention`} />
          <Stat
            label="Hours"
            value={totals.hours.toLocaleString()}
            sub={`of ${totals.budget.toLocaleString()} budgeted`}
          >
            <MeterBar pct={(totals.hours / totals.budget) * 100} />
          </Stat>
          <Stat label="Billed" value={`Rs ${money(totals.billed)}`} sub={`of Rs ${money(totals.contract)} contracted`}>
            <StackBar
              segments={[
                { value: totals.billed, color: "bg-bz-leaf-deep" },
                { value: Math.max(0, totals.contract - totals.billed), color: "bg-bz-line" },
              ]}
            />
          </Stat>
          <Stat
            label="Overdue tasks"
            value={String(rows.reduce((s, r) => s + r.overdue, 0))}
            sub="across all projects"
            danger
          />
        </div>
      </header>

      <div className="sticky top-0 z-30 border-b border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1 md:max-w-[280px]">
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects…"
              className="h-8 w-full rounded-bz-md border border-bz-line bg-bz-surface pl-8 pr-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(HEALTH_LABEL) as ProjectHealth[]).map((h) => {
              const on = health.includes(h);
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHealth((f) => (f.includes(h) ? f.filter((x) => x !== h) : [...f, h]))}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-bz-md border px-2.5 text-[11.5px] font-medium",
                    on ? "border-bz-text-muted bg-bz-surface text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:text-bz-text",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-bz-pill",
                      h === "on_track" ? "bg-bz-leaf-deep" : h === "at_risk" ? "bg-bz-fire" : h === "off_track" ? "" : "bg-bz-line",
                    )}
                    style={h === "off_track" ? { background: DANGER_TEXT } : undefined}
                  />
                  {HEALTH_LABEL[h]}
                </button>
              );
            })}
            {nFilters > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setHealth([]);
                }}
                className={GHOST_BTN_SM}
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>

          <div className="ml-auto">
            <Segmented
              size="sm"
              value={shape}
              onChange={setShape}
              options={[
                { value: "cards", label: <><LayoutGrid size={11} className="inline" /> <span className="ml-1">Cards</span></> },
                { value: "table", label: <><Rows3 size={11} className="inline" /> <span className="ml-1">Table</span></> },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {rows.length === 0 ? (
          <div className={CARD}>
            <NoResults
              onClear={() => {
                setQ("");
                setHealth([]);
              }}
            />
          </div>
        ) : shape === "cards" ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((r) => (
              <ProjectCard key={r.p.id} row={r} />
            ))}
          </div>
        ) : (
          <ProjectTable rows={rows} />
        )}
      </div>
    </AppShell>
  );
}

type Row = {
  p: Project;
  total: number;
  done: number;
  pct: number;
  overdue: number;
  blocked: number;
  logged: number;
  planned: number;
  unestimated: number;
  hoursPct: number;
  gap: number;
  nextMilestone?: Task;
  milestones: number;
  milestonesDone: number;
};

function Stat({
  label,
  value,
  sub,
  danger,
  children,
}: {
  label: string;
  value: string;
  sub: string;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-bz-surface px-3.5 py-3">
      <p className={LABEL}>{label}</p>
      <p
        className={cn("mt-1.5 text-[19px] font-semibold leading-none tracking-tight text-bz-text", NUM)}
        style={danger && value !== "0" ? { color: DANGER_TEXT } : undefined}
      >
        {value}
      </p>
      {children && <div className="mt-2">{children}</div>}
      <p className="mt-1.5 text-[10.5px] text-bz-text-soft">{sub}</p>
    </div>
  );
}

function ProjectCard({ row }: { row: Row }) {
  const { p } = row;
  const client = clientById(p.clientId);
  const owner = personById(p.ownerId);
  const daysLeft = daysBetween(TODAY, p.end);

  return (
    <Link
      to={`/design/work/project/${p.id}`}
      className={cn(CARD, SHADOW_SOFT, "group block p-4 transition-colors hover:border-bz-line")}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-[10.5px] font-semibold text-bz-text-soft", NUM)}>{p.code}</span>
            <Chip label={HEALTH_LABEL[p.health]} tone={HEALTH_TONE[p.health]} />
          </div>
          <h2 className="mt-1.5 truncate text-[14px] font-semibold leading-snug tracking-tight text-bz-text">
            {p.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 truncate text-[11.5px] text-bz-text-muted">
            {client ? (
              <>
                <Building2 size={10} className="shrink-0" /> {client.name}
              </>
            ) : (
              "Internal"
            )}
          </p>
        </div>
        <ArrowRight size={14} className="mt-1 shrink-0 text-bz-text-soft transition-transform group-hover:translate-x-0.5" />
      </div>

      {/* Progress vs hours — the two bars that argue with each other */}
      <div className="mt-3.5 space-y-2.5">
        <TwinBar
          label="Tasks"
          value={`${row.done}/${row.total}`}
          pct={row.pct}
          fill="bg-bz-leaf-deep"
        />
        <TwinBar
          label="Hours"
          value={`${fmtH(row.logged)}/${p.budgetHours.toLocaleString()}`}
          pct={row.hoursPct}
          fill={row.hoursPct > 100 ? "bg-[#C0413A]" : "bg-bz-olive/60"}
        />
      </div>

      <p className="mt-2 text-[10.5px] text-bz-text-soft">
        Planned <span className={cn("font-medium text-bz-text-muted", NUM)}>{fmtH(row.planned)}h</span> of estimates
        {row.unestimated > 0 && ` · ${row.unestimated} task${row.unestimated > 1 ? "s" : ""} unestimated`}
      </p>

      {row.planned > p.budgetHours && (
        <p className="mt-1 text-[10.5px] font-medium" style={{ color: DANGER_TEXT }}>
          Plan is {fmtH(row.planned - p.budgetHours)}h larger than the hours sold
        </p>
      )}

      {row.gap > 12 && row.total > 0 && (
        <p className="mt-1 text-[10.5px] font-medium" style={{ color: DANGER_TEXT }}>
          Burning {row.gap} points of budget ahead of delivery
        </p>
      )}

      <div className="mt-3.5 flex items-center gap-2 border-t border-bz-line-soft pt-3">
        <AvatarStack ids={p.memberIds} size={20} max={4} />
        <span className="truncate text-[10.5px] text-bz-text-soft">{owner?.name}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {row.overdue > 0 && (
            <span className={cn("rounded-bz-sm px-1.5 py-0.5 text-[10px] font-semibold", NUM)} style={{ background: "#FBE5E2", color: DANGER_TEXT }}>
              {row.overdue} late
            </span>
          )}
          {row.blocked > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted">
              <Lock size={8} /> {row.blocked}
            </span>
          )}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        {row.nextMilestone ? (
          <>
            <MilestoneMark size={10} />
            <span className="min-w-0 flex-1 truncate text-[11px] text-bz-text-muted">{row.nextMilestone.title}</span>
            <DueChip due={row.nextMilestone.due} />
          </>
        ) : (
          <span className={cn("text-[11px] text-bz-text-soft", NUM)}>
            {daysLeft > 0 ? `${daysLeft} days to ${fmtShort(p.end)}` : `Ended ${fmtShort(p.end)}`}
          </span>
        )}
      </div>
    </Link>
  );
}

function TwinBar({ label, value, pct, fill }: { label: string; value: string; pct: number; fill: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10.5px] font-medium text-bz-text-muted">{label}</span>
        <span className={cn("text-[10.5px] text-bz-text-soft", NUM)}>
          {value} · {pct}%
        </span>
      </div>
      <div className="mt-1">
        <MeterBar pct={pct} fill={fill} height="h-1.5" />
      </div>
    </div>
  );
}

function ProjectTable({ rows }: { rows: Row[] }) {
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-bz-line bg-bz-paper-warm">
              <Th className="w-[260px]">Project</Th>
              <Th className="w-[150px]">Client</Th>
              <Th>Health</Th>
              <Th className="w-[150px]">Task progress</Th>
              <Th className="w-[150px]">Hours vs sold</Th>
              <Th className="text-right">Planned</Th>
              <Th className="text-right">Gap</Th>
              <Th className="text-right">Late</Th>
              <Th className="text-right">Milestones</Th>
              <Th className="w-[110px]">Owner</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.p.id} className="border-b border-bz-line-soft last:border-0 hover:bg-bz-paper-warm">
                <Td>
                  <Link to={`/design/work/project/${r.p.id}`} className="block">
                    <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{r.p.code}</span>
                    <span className="block truncate text-[12.5px] font-medium text-bz-text">{r.p.name}</span>
                  </Link>
                </Td>
                <Td className="text-[11.5px] text-bz-text-muted">{clientById(r.p.clientId)?.name ?? "Internal"}</Td>
                <Td>
                  <Chip label={HEALTH_LABEL[r.p.health]} tone={HEALTH_TONE[r.p.health]} />
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-[70px]">
                      <MeterBar pct={r.pct} height="h-1" />
                    </div>
                    <span className={cn("text-[11px] text-bz-text-muted", NUM)}>
                      {r.done}/{r.total}
                    </span>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-[70px]">
                      <MeterBar pct={r.hoursPct} height="h-1" fill={r.hoursPct > 100 ? "bg-[#C0413A]" : "bg-bz-olive/60"} />
                    </div>
                    <span className={cn("text-[11px] text-bz-text-muted", NUM)}>{r.hoursPct}%</span>
                  </div>
                </Td>
                <Td className="text-right">
                  <span
                    className={cn("text-[11.5px]", NUM)}
                    style={r.planned > r.p.budgetHours ? { color: DANGER_TEXT } : undefined}
                    title={r.unestimated ? `${r.unestimated} task(s) unestimated — this is a floor` : undefined}
                  >
                    {fmtH(r.planned)}
                    {r.unestimated > 0 && <span className="text-bz-text-soft">+</span>}
                  </span>
                </Td>
                <Td className="text-right">
                  <span
                    className={cn("text-[11.5px] font-semibold", NUM)}
                    style={r.gap > 12 ? { color: DANGER_TEXT } : undefined}
                  >
                    {r.gap > 0 ? `+${r.gap}` : r.gap}
                  </span>
                </Td>
                <Td className="text-right">
                  <span className={cn("text-[11.5px]", NUM)} style={r.overdue > 0 ? { color: DANGER_TEXT } : undefined}>
                    {r.overdue || "—"}
                  </span>
                </Td>
                <Td className="text-right">
                  <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
                    {r.milestones ? `${r.milestonesDone}/${r.milestones}` : "—"}
                  </span>
                </Td>
                <Td>
                  <span className="flex items-center gap-1.5">
                    <Avatar person={personById(r.p.ownerId)} size={20} />
                    <span className="truncate text-[11px] text-bz-text-muted">{personById(r.p.ownerId)?.name.split(" ")[0]}</span>
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-bz-line-soft px-4 py-2.5 text-[11px] text-bz-text-soft">
        <strong className="font-semibold text-bz-text-muted">Planned</strong> = the sum of task estimates; a trailing
        <span className={NUM}> +</span> means some tasks carry no estimate, so it is a floor, not a total.{" "}
        <strong className="font-semibold text-bz-text-muted">Gap</strong> = percentage points of sold hours burned ahead
        of task completion. Above ~12 the project is spending faster than it is delivering.
      </p>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-3 py-2 text-left", LABEL, className)}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-2.5 align-middle", className)}>{children}</td>;
}
