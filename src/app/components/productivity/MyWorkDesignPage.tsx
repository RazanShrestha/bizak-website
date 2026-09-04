import * as React from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Lock,
  CalendarClock,
  CheckCheck,
  Inbox,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Flame,
  MoveVertical,
} from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import { TaskPanel } from "./TaskPanel";
import {
  Task,
  TimeEntry,
  Priority,
  SEED_TASKS,
  SEED_TIME_ENTRIES,
  SECTIONS,
  PROJECTS,
  PRIORITY_LABEL,
  TODAY,
  ME,
  Avatar,
  AvatarStack,
  Chip,
  CompleteToggle,
  Crumb,
  DueChip,
  EmptyBlock,
  LinkedDocChip,
  MeterBar,
  MenuItem,
  MenuLabel,
  MetaCount,
  MessageSquare,
  Paperclip,
  MilestoneMark,
  Popover,
  PriorityMark,
  Toast,
  useToast,
  useDocumentTitle,
  personById,
  projectById,
  childrenOf,
  openBlockers,
  isDone,
  subtaskProgress,
  dueBand,
  addDays,
  fmtDate,
  weekdayOf,
  daysBetween,
  entryLockReason,
  canRemoveEntry,
  useAttendanceSource,
  NUM,
  CARD,
  LABEL,
  PRIMARY_BTN,
  GHOST_BTN_SM,
  DANGER_BG,
  DANGER_TEXT,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// MY WORK  one person's queue, across every project
//
// PRIMARY ACTION: decide what happens today — tick a thing off, or drag it to
// a different day. So the page is a single scheduled column, not a table: five
// time buckets (Overdue → Today → This week → Later → No date), and dropping a
// task into a bucket RESCHEDULES it. That is the whole interaction.
//
// It reads across projects, which is the half a project board can never show
// and the half a person actually lives in. The project a task belongs to is
// therefore on every row, and it is a link out.
//
// Deliberately NOT here: sections, board columns, timeline. Those belong to a
// project. A personal queue that also tried to be a project tool would be
// neither.
// ════════════════════════════════════════════════════════════════════════════

type BucketId = "overdue" | "today" | "week" | "later" | "none";

const BUCKETS: { id: BucketId; name: string; hint: string; droppable: boolean }[] = [
  { id: "overdue", name: "Overdue", hint: "past its date — re-date it or finish it", droppable: false },
  { id: "today", name: "Today", hint: "what you are actually doing now", droppable: true },
  { id: "week", name: "This week", hint: "the next seven days", droppable: true },
  { id: "later", name: "Later", hint: "dated, but not yet", droppable: true },
  { id: "none", name: "No date", hint: "decide when, or it never happens", droppable: true },
];

const bucketOf = (t: Task): BucketId => {
  const b = dueBand(t.due);
  if (b === "none") return "none";
  if (b === "overdue") return "overdue";
  if (b === "today") return "today";
  if (b === "soon") return "week";
  return "later";
};

/** Dropping into a bucket is a reschedule — this is the date it writes. */
const dateForBucket = (id: BucketId): string | null => {
  if (id === "today") return TODAY;
  if (id === "week") return addDays(TODAY, 3);
  if (id === "later") return addDays(TODAY, 21);
  return null;
};

export function MyWorkDesignPage() {
  const [tasks, setTasks] = React.useState<Task[]>(SEED_TASKS);
  const [entries, setEntries] = React.useState<TimeEntry[]>(SEED_TIME_ENTRIES);
  const [q, setQ] = React.useState("");
  const [projectFilter, setProjectFilter] = React.useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = React.useState<Priority[]>([]);
  const [showDone, setShowDone] = React.useState(false);
  const [openTaskId, setOpenTaskId] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState<BucketId[]>([]);
  const [drag, setDrag] = React.useState<string | null>(null);
  const [overBucket, setOverBucket] = React.useState<BucketId | null>(null);
  const { toast, push, dismiss } = useToast();
  const attendanceSource = useAttendanceSource();

  useDocumentTitle("My Work · Bizak");

  const filterBtn = React.useRef<HTMLButtonElement>(null);
  const [fOpen, setFOpen] = React.useState(false);

  // ── Mutations ────────────────────────────────────────────────────────────

  const patch = React.useCallback((id: string, p: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));
  }, []);

  const toggleComplete = React.useCallback(
    (id: string) => {
      setTasks((prev) => {
        const t = prev.find((x) => x.id === id);
        if (!t) return prev;
        if (!isDone(t) && openBlockers(prev, t).length > 0) {
          push("error", `“${t.title}” is blocked — finish its blockers first.`);
          return prev;
        }
        return prev.map((x) => (x.id === id ? { ...x, status: isDone(t) ? "in_progress" : "completed" } : x));
      });
    },
    [push],
  );

  const reschedule = React.useCallback(
    (id: string, bucket: BucketId) => {
      const date = dateForBucket(bucket);
      patch(id, { due: date });
      const t = tasks.find((x) => x.id === id);
      push(
        "success",
        date ? `“${t?.title ?? "Task"}” moved to ${fmtDate(date)}.` : `Due date cleared on “${t?.title ?? "Task"}”.`,
      );
    },
    [patch, push, tasks],
  );

  // ── My queue ─────────────────────────────────────────────────────────────

  const mine = React.useMemo(
    () =>
      tasks.filter((t) => {
        if (!t.assigneeIds.includes(ME.id)) return false;
        if (!showDone && isDone(t)) return false;
        if (q && !t.title.toLowerCase().includes(q.toLowerCase()) && !t.docNo.toLowerCase().includes(q.toLowerCase()))
          return false;
        if (projectFilter.length && !projectFilter.includes(t.projectId)) return false;
        if (priorityFilter.length && !priorityFilter.includes(t.priority)) return false;
        return true;
      }),
    [tasks, showDone, q, projectFilter, priorityFilter],
  );

  const buckets = React.useMemo(
    () =>
      BUCKETS.map((b) => ({
        ...b,
        tasks: mine
          .filter((t) => bucketOf(t) === b.id)
          .sort((a, z) => (a.due ?? "9999").localeCompare(z.due ?? "9999")),
      })),
    [mine],
  );

  const counts = React.useMemo(() => {
    const open = tasks.filter((t) => t.assigneeIds.includes(ME.id) && !isDone(t));
    return {
      open: open.length,
      overdue: open.filter((t) => dueBand(t.due) === "overdue").length,
      today: open.filter((t) => dueBand(t.due) === "today").length,
      blocked: open.filter((t) => openBlockers(tasks, t).length > 0).length,
      doneToday: tasks.filter((t) => t.assigneeIds.includes(ME.id) && isDone(t)).length,
    };
  }, [tasks]);

  // Work I handed to other people and am still waiting on.
  const waitingOn = React.useMemo(
    () =>
      tasks
        .filter((t) => !t.assigneeIds.includes(ME.id) && !isDone(t) && t.projectId === "PRJ-014" && t.priority !== "low")
        .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"))
        .slice(0, 4),
    [tasks],
  );

  const upcomingMilestones = React.useMemo(
    () =>
      tasks
        .filter((t) => t.isMilestone && !isDone(t))
        .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"))
        .slice(0, 4),
    [tasks],
  );

  const nFilters = projectFilter.length + priorityFilter.length + (q ? 1 : 0) + (showDone ? 1 : 0);
  const openTask = openTaskId ? tasks.find((t) => t.id === openTaskId) : null;
  const empty = mine.length === 0;

  return (
    <AppShell
      breadcrumb={<Crumb trail={["Work", "My Work"]} />}
      overlay={
        <>
          {openTask && (
            <TaskPanel
              task={openTask}
              tasks={tasks}
              sections={SECTIONS}
              entries={entries}
              onAddEntry={(e) => setEntries((prev) => [...prev, { ...e, id: `TE-N${prev.length + 1}` }])}
              onDeleteEntry={(id) =>
                setEntries((prev) => {
                  const e = prev.find((x) => x.id === id);
                  if (!e) return prev;
                  if (!canRemoveEntry(e, attendanceSource)) {
                    push("error", entryLockReason(e, attendanceSource) ?? "That entry cannot be removed.");
                    return prev;
                  }
                  push("success", "Entry removed. Every total above it has been recalculated.");
                  return prev.filter((x) => x.id !== id);
                })
              }
              onPatch={patch}
              onToggleComplete={toggleComplete}
              onAddSubtask={() => push("info", "Subtasks are added from the project workspace.")}
              onOpenTask={setOpenTaskId}
              onClose={() => setOpenTaskId(null)}
            />
          )}
          <Toast toast={toast} onDismiss={dismiss} />
        </>
      }
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-6 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar person={ME} size={40} />
            <div>
              <p className={cn("text-[11px] text-bz-text-soft", NUM)}>
                {weekdayOf(TODAY)}, {fmtDate(TODAY)}
              </p>
              <h1 className="mt-0.5 text-[22px] font-semibold leading-tight tracking-tight text-bz-text md:text-[25px]">
                My work
              </h1>
            </div>
          </div>
          <button type="button" className={PRIMARY_BTN}>
            <Plus size={12} /> New task
          </button>
        </div>

        {/* Counters — the four numbers that decide the day */}
        <div className="mt-4 flex flex-wrap items-stretch gap-px overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-line-soft">
          <Counter label="Open" value={counts.open} sub="assigned to you" />
          <Counter label="Due today" value={counts.today} sub="finish before you log off" accent />
          <Counter label="Overdue" value={counts.overdue} sub="needs a decision" danger />
          <Counter label="Blocked" value={counts.blocked} sub="waiting on someone else" />
        </div>
      </header>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1 md:max-w-[300px]">
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search my tasks…"
              className="h-8 w-full rounded-bz-md border border-bz-line bg-bz-surface pl-8 pr-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
            />
          </div>

          <button
            ref={filterBtn}
            type="button"
            onClick={() => setFOpen(true)}
            className={cn(GHOST_BTN_SM, nFilters > 0 && "border-bz-text-muted font-semibold")}
          >
            <SlidersHorizontal size={11} /> Filter
            {nFilters > 0 && (
              <span className={cn("ml-0.5 rounded-bz-pill bg-bz-fire px-1.5 text-[10px] font-bold text-bz-olive", NUM)}>
                {nFilters}
              </span>
            )}
          </button>

          <Popover open={fOpen} anchor={filterBtn.current} onClose={() => setFOpen(false)} width={270}>
            <MenuLabel>Project</MenuLabel>
            {PROJECTS.map((p) => (
              <MenuItem
                key={p.id}
                active={projectFilter.includes(p.id)}
                onClick={() =>
                  setProjectFilter((f) => (f.includes(p.id) ? f.filter((x) => x !== p.id) : [...f, p.id]))
                }
              >
                {p.name}
              </MenuItem>
            ))}
            <MenuLabel>Priority</MenuLabel>
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <MenuItem
                key={p}
                active={priorityFilter.includes(p)}
                onClick={() => setPriorityFilter((f) => (f.includes(p) ? f.filter((x) => x !== p) : [...f, p]))}
              >
                {PRIORITY_LABEL[p]}
              </MenuItem>
            ))}
            <div className="mt-1 border-t border-bz-line-soft pt-1">
              <MenuItem active={showDone} onClick={() => setShowDone((v) => !v)}>
                Show completed
              </MenuItem>
            </div>
          </Popover>

          {nFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setProjectFilter([]);
                setPriorityFilter([]);
                setShowDone(false);
              }}
              className="text-[11px] font-medium text-bz-text-muted underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}

          <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-bz-text-soft md:flex">
            <MoveVertical size={11} /> Drag a task into another bucket to re-date it
          </span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 p-4 md:p-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div
          className="min-w-0 space-y-3"
          onDragEnd={() => {
            setDrag(null);
            setOverBucket(null);
          }}
        >
          {empty ? (
            <div className={CARD}>
              <EmptyBlock
                icon={nFilters > 0 ? Inbox : CheckCheck}
                title={nFilters > 0 ? "Nothing matches these filters" : "Your queue is clear"}
                body={
                  nFilters > 0
                    ? "Drop a filter to see the rest of your queue."
                    : "No open task is assigned to you. Work assigned from a document — an invoice, a support ticket — lands here automatically."
                }
                action={
                  nFilters > 0 ? (
                    <button
                      type="button"
                      className={GHOST_BTN_SM}
                      onClick={() => {
                        setQ("");
                        setProjectFilter([]);
                        setPriorityFilter([]);
                        setShowDone(false);
                      }}
                    >
                      <X size={12} /> Clear filters
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            buckets.map((b) => {
              const isCollapsed = collapsed.includes(b.id);
              const isOver = overBucket === b.id && drag !== null && b.droppable;
              return (
                <section
                  key={b.id}
                  className={cn(
                    CARD,
                    "overflow-hidden transition-colors",
                    isOver && "border-bz-fire ring-2 ring-bz-fire/40",
                  )}
                  onDragOver={(e) => {
                    if (!drag || !b.droppable) return;
                    e.preventDefault();
                    setOverBucket(b.id);
                  }}
                  onDragLeave={() => setOverBucket((x) => (x === b.id ? null : x))}
                  onDrop={(e) => {
                    if (!drag || !b.droppable) return;
                    e.preventDefault();
                    reschedule(drag, b.id);
                    setDrag(null);
                    setOverBucket(null);
                  }}
                >
                  <header
                    className={cn(
                      "flex items-center gap-2 border-b border-bz-line-soft px-3.5 py-2.5",
                      b.id === "overdue" && b.tasks.length > 0 ? "" : "bg-bz-surface",
                    )}
                    style={b.id === "overdue" && b.tasks.length > 0 ? { background: DANGER_BG } : undefined}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setCollapsed((c) => (isCollapsed ? c.filter((x) => x !== b.id) : [...c, b.id]))
                      }
                      className="text-bz-text-soft hover:text-bz-text"
                    >
                      {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                    </button>
                    {b.id === "overdue" && b.tasks.length > 0 && <Flame size={12} style={{ color: DANGER_TEXT }} />}
                    <h2
                      className="text-[12.5px] font-semibold text-bz-text"
                      style={b.id === "overdue" && b.tasks.length > 0 ? { color: DANGER_TEXT } : undefined}
                    >
                      {b.name}
                    </h2>
                    <span className={cn("rounded-bz-sm bg-bz-surface/70 px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>
                      {b.tasks.length}
                    </span>
                    <span className="ml-auto hidden text-[10.5px] text-bz-text-soft sm:inline">
                      {isOver ? `Drop to move to ${b.name.toLowerCase()}` : b.hint}
                    </span>
                  </header>

                  {!isCollapsed && (
                    <div>
                      {b.tasks.length === 0 ? (
                        <p className="px-3.5 py-4 text-[11.5px] text-bz-text-soft">
                          {b.droppable ? "Nothing here. Drag a task in to schedule it." : "Nothing overdue."}
                        </p>
                      ) : (
                        b.tasks.map((t) => (
                          <MyRow
                            key={t.id}
                            task={t}
                            tasks={tasks}
                            dragging={drag === t.id}
                            onDragStart={() => setDrag(t.id)}
                            onOpen={() => setOpenTaskId(t.id)}
                            onToggle={() => toggleComplete(t.id)}
                          />
                        ))
                      )}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>

        {/* ── Rail ──────────────────────────────────────────────────────── */}
        <aside className="space-y-4">
          <section className={cn(CARD, "overflow-hidden")}>
            <header className="flex items-center gap-2 border-b border-bz-line-soft px-4 py-2.5">
              <CalendarClock size={13} className="text-bz-text-muted" />
              <h2 className="text-[12.5px] font-semibold text-bz-text">Milestones ahead</h2>
            </header>
            <div className="divide-y divide-bz-line-soft">
              {upcomingMilestones.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setOpenTaskId(m.id)}
                  className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left hover:bg-bz-paper-warm"
                >
                  <span className="mt-1"><MilestoneMark size={11} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-bz-text">{m.title}</span>
                    <span className="mt-0.5 block truncate text-[10.5px] text-bz-text-soft">
                      {projectById(m.projectId)?.code} · in {daysBetween(TODAY, m.due ?? TODAY)}d
                    </span>
                  </span>
                  <DueChip due={m.due} />
                </button>
              ))}
            </div>
          </section>

          <section className={cn(CARD, "overflow-hidden")}>
            <header className="flex items-center gap-2 border-b border-bz-line-soft px-4 py-2.5">
              <h2 className="text-[12.5px] font-semibold text-bz-text">Waiting on others</h2>
              <span className="ml-auto text-[10.5px] text-bz-text-soft">Everest Retail</span>
            </header>
            <div className="divide-y divide-bz-line-soft">
              {waitingOn.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOpenTaskId(t.id)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-bz-paper-warm"
                >
                  <AvatarStack ids={t.assigneeIds} size={20} max={2} />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">{t.title}</span>
                  <DueChip due={t.due} done={isDone(t)} />
                </button>
              ))}
            </div>
          </section>

          <section className={cn(CARD, "overflow-hidden")}>
            <header className="border-b border-bz-line-soft px-4 py-2.5">
              <h2 className="text-[12.5px] font-semibold text-bz-text">My projects</h2>
            </header>
            <div className="divide-y divide-bz-line-soft">
              {PROJECTS.filter((p) => p.memberIds.includes(ME.id)).map((p) => {
                const rows = tasks.filter((t) => t.projectId === p.id);
                const done = rows.filter(isDone).length;
                const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;
                return (
                  <Link
                    key={p.id}
                    to={`/design/work/project/${p.id}`}
                    className="block px-4 py-2.5 hover:bg-bz-paper-warm"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[12px] font-medium text-bz-text">{p.name}</span>
                      <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{pct}%</span>
                    </div>
                    <div className="mt-1.5">
                      <MeterBar pct={pct} height="h-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link
              to="/design/work/projects"
              className="flex items-center justify-center gap-1.5 border-t border-bz-line-soft px-4 py-2.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
            >
              All projects <ArrowRight size={11} />
            </Link>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

// ── Atoms ───────────────────────────────────────────────────────────────────

function Counter({
  label,
  value,
  sub,
  danger,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="min-w-[130px] flex-1 bg-bz-surface px-3.5 py-3">
      <p className={LABEL}>{label}</p>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={cn("text-[20px] font-semibold leading-none tracking-tight text-bz-text", NUM)}
          style={danger && value > 0 ? { color: DANGER_TEXT } : undefined}
        >
          {value}
        </span>
        {accent && value > 0 && <span className="size-1.5 rounded-bz-pill bg-bz-fire" />}
      </div>
      <p className="mt-1.5 text-[10.5px] text-bz-text-soft">{sub}</p>
    </div>
  );
}

function MyRow({
  task,
  tasks,
  dragging,
  onDragStart,
  onOpen,
  onToggle,
}: {
  task: Task;
  tasks: Task[];
  dragging: boolean;
  onDragStart: () => void;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const done = isDone(task);
  const blockers = openBlockers(tasks, task);
  const project = projectById(task.projectId);
  const prog = subtaskProgress(tasks, task.id);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className={cn(
        "group flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-bz-line-soft px-3.5 py-2.5 last:border-0 hover:bg-bz-paper-warm",
        dragging && "opacity-35",
      )}
    >
      <CompleteToggle done={done} blocked={blockers.length > 0} onToggle={onToggle} />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {task.isMilestone && <MilestoneMark />}
        <span className={cn("truncate text-[12.5px]", done ? "text-bz-text-soft line-through" : "font-medium text-bz-text")}>
          {task.title}
        </span>
        {blockers.length > 0 && (
          <span
            className="inline-flex shrink-0 items-center gap-0.5 rounded-bz-sm px-1 py-0.5 text-[10px] font-semibold"
            style={{ background: DANGER_BG, color: DANGER_TEXT }}
            title={`Blocked by: ${blockers.map((b) => b.title).join(", ")}`}
          >
            <Lock size={8} /> {blockers.length}
          </span>
        )}
        {prog && (
          <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>
            {prog.done}/{prog.total}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {task.linkedDoc && <span className="hidden sm:block"><LinkedDocChip doc={task.linkedDoc} compact /></span>}
        <Link
          to={`/design/work/project/${task.projectId}`}
          onClick={(e) => e.stopPropagation()}
          className="hidden max-w-[150px] truncate rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted hover:text-bz-text md:block"
        >
          {project?.name}
        </Link>
        <span className="hidden items-center gap-1.5 lg:flex">
          <MetaCount icon={MessageSquare} n={task.comments} />
          <MetaCount icon={Paperclip} n={task.attachments} />
        </span>
        <PriorityMark p={task.priority} withLabel={false} />
        <span className="w-[76px] text-right">
          <DueChip due={task.due} done={done} />
        </span>
      </div>
    </div>
  );
}
