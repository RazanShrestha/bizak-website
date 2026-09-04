import * as React from "react";
import { useParams, Link } from "react-router";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  X,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  GripVertical,
  Trash2,
  Pencil,
  ListTree,
  Columns3,
  GanttChartSquare,
  Gauge,
  Lock,
  CheckCheck,
  CalendarClock,
  Users,
  Sparkles,
  EyeOff,
  Loader2,
  FolderPlus,
} from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import { TaskPanel } from "./TaskPanel";
import {
  Task,
  TimeEntry,
  Section,
  Priority,
  TaskStatus,
  FilterModel,
  EMPTY_FILTERS,
  SEED_TASKS,
  SEED_TIME_ENTRIES,
  SECTIONS,
  PEOPLE,
  PRIORITY_LABEL,
  STATUS_LABEL,
  PRIORITY_RANK,
  HEALTH_LABEL,
  TODAY,
  Avatar,
  AvatarStack,
  Chip,
  Checkbox,
  CompleteToggle,
  Crumb,
  DueChip,
  EmptyBlock,
  LinkedDocChip,
  LoadingRows,
  MeterBar,
  StackBar,
  MenuItem,
  MenuLabel,
  MetaCount,
  MilestoneMark,
  MessageSquare,
  Paperclip,
  NoResults,
  Popover,
  PriorityMark,
  Segmented,
  StatusChip,
  Switch,
  TagChip,
  Toast,
  useToast,
  useDocumentTitle,
  personById,
  projectById,
  clientById,
  childrenOf,
  estimateOf,
  loggedRollup,
  projectPlanned,
  projectLogged,
  unestimatedTasks,
  fmtH,
  fmtHShort,
  entryLockReason,
  isBlocked,
  openBlockers,
  isDone,
  subtaskProgress,
  matchesFilter,
  filterCount,
  reorderTasks,
  reorderSections,
  dueBand,
  daysBetween,
  addDays,
  fmtShort,
  fmtDate,
  money,
  NUM,
  CARD,
  LABEL,
  SHADOW,
  SHADOW_SOFT,
  PRIMARY_BTN,
  GHOST_BTN,
  GHOST_BTN_SM,
  ICON_BTN,
  DANGER_BG,
  DANGER_TEXT,
  DANGER_DOT,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// PROJECT WORKSPACE  one project, four ways of looking at it
//
// PRIMARY ACTION: move work forward — re-place a task (drag it to another
// section / another position) and tick it off. Everything is arranged around
// that: the board is the default view because dragging is the verb, the filter
// set is shared across all four views so a filter survives a view switch, and
// the record opens as a right-hand PANEL so you never leave the place you were
// working.
//
// The four views are not four pages. They are four projections of ONE task set
// held in this component, so a drag on the board moves the row in the list, a
// completed subtask moves the parent's progress bar, and completing a blocker
// unlocks its dependents in every view at once.
//
//   Overview  the read — health, milestones, workload, budget
//   List      the edit — sections, subtasks, every column, bulk select
//   Board     the move — sections as columns, drag within and across
//   Timeline  the shape — bars, milestone diamonds, dependency arrows
// ════════════════════════════════════════════════════════════════════════════

type ViewKey = "overview" | "list" | "board" | "timeline";
type GroupKey = "section" | "assignee" | "priority" | "due";
type SortKey = "manual" | "due" | "priority" | "title";
type Preview = "ready" | "loading" | "empty";

const DEFAULT_SECTIONS = (projectId: string): Section[] => [
  { id: `${projectId}-A`, projectId, name: "To do" },
  { id: `${projectId}-B`, projectId, name: "In progress" },
  { id: `${projectId}-C`, projectId, name: "Done" },
];

export function ProjectWorkspaceDesignPage() {
  const params = useParams();
  const projectId = params.id ?? "PRJ-014";
  const project = projectById(projectId) ?? projectById("PRJ-014")!;

  const seededSections = React.useMemo(
    () => SECTIONS.filter((s) => s.projectId === project.id),
    [project.id],
  );
  const hasSeed = seededSections.length > 0;

  const [sections, setSections] = React.useState<Section[]>(
    hasSeed ? seededSections : DEFAULT_SECTIONS(project.id),
  );
  const [tasks, setTasks] = React.useState<Task[]>(
    hasSeed ? SEED_TASKS.filter((t) => t.projectId === project.id) : [],
  );
  // The hour ledger. Every "logged" figure on this screen is summed from here.
  const [entries, setEntries] = React.useState<TimeEntry[]>(
    hasSeed ? SEED_TIME_ENTRIES.filter((e) => SEED_TASKS.some((t) => t.id === e.taskId && t.projectId === project.id)) : [],
  );

  const [view, setView] = React.useState<ViewKey>("board");
  const [filters, setFilters] = React.useState<FilterModel>(EMPTY_FILTERS);
  const [group, setGroup] = React.useState<GroupKey>("section");
  const [sort, setSort] = React.useState<SortKey>("manual");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [openTaskId, setOpenTaskId] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState<string[]>([]);
  const [expanded, setExpanded] = React.useState<string[]>(["T-11", "T-20"]);
  const [preview, setPreview] = React.useState<Preview>(hasSeed ? "ready" : "empty");
  const { toast, push, dismiss } = useToast();

  useDocumentTitle(`${project.name} · Bizak`);

  // ── Mutations (one writer per verb, so every view agrees) ────────────────

  const addEntry = React.useCallback((e: Omit<TimeEntry, "id">) => {
    setEntries((prev) => [...prev, { ...e, id: `TE-N${prev.length + 1}` }]);
  }, []);

  const deleteEntry = React.useCallback(
    (id: string) => {
      setEntries((prev) => {
        const e = prev.find((x) => x.id === id);
        if (!e) return prev;
        if (e.status !== "open") {
          push("error", entryLockReason(e) ?? "That entry cannot be removed.");
          return prev;
        }
        push("success", `${fmtH(e.hours)}h removed. Every total above it has been recalculated.`);
        return prev.filter((x) => x.id !== id);
      });
    },
    [push],
  );

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
        const next = isDone(t) ? "in_progress" : "completed";
        if (next === "completed") {
          const freed = prev.filter((x) => x.blockedBy.includes(id) && openBlockers(prev, x).length === 1);
          if (freed.length) push("success", `Completed. ${freed.length} dependent task${freed.length > 1 ? "s" : ""} unblocked.`);
        }
        return prev.map((x) => (x.id === id ? { ...x, status: next as TaskStatus } : x));
      });
    },
    [push],
  );

  const addTask = React.useCallback(
    (sectionId: string, title: string, parentId: string | null = null) => {
      if (!title.trim()) return;
      const id = `N-${Math.random().toString(36).slice(2, 7)}`;
      setTasks((prev) => [
        ...prev,
        {
          id,
          docNo: `TSK-${4200 + prev.length}`,
          projectId: project.id,
          sectionId,
          parentId,
          title: title.trim(),
          assigneeIds: [],
          status: "not_started",
          priority: "medium",
          start: null,
          due: null,
          estimatedHours: null,
          blockedBy: [],
          tags: [],
          comments: 0,
          attachments: 0,
          order: Math.max(0, ...prev.filter((t) => t.sectionId === sectionId).map((t) => t.order)) + 1,
        },
      ]);
    },
    [project.id],
  );

  const addSection = React.useCallback(() => {
    const id = `S-${Math.random().toString(36).slice(2, 6)}`;
    setSections((prev) => [...prev, { id, projectId: project.id, name: `Section ${prev.length + 1}` }]);
    push("info", "Section added. Drag its header to re-order the board.");
  }, [project.id, push]);

  const renameSection = React.useCallback((id: string, name: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const removeSection = React.useCallback(
    (id: string) => {
      const count = tasks.filter((t) => t.sectionId === id).length;
      if (count > 0) {
        push("error", `That section still holds ${count} task${count > 1 ? "s" : ""}. Move them first.`);
        return;
      }
      setSections((prev) => prev.filter((s) => s.id !== id));
    },
    [tasks, push],
  );

  const moveTask = React.useCallback((taskId: string, target: { sectionId: string; beforeId: string | null }) => {
    setTasks((prev) => reorderTasks(prev, taskId, target));
  }, []);

  const bulk = React.useCallback(
    (fn: (t: Task) => Partial<Task>, message: string) => {
      setTasks((prev) => prev.map((t) => (selected.includes(t.id) ? { ...t, ...fn(t) } : t)));
      push("success", message.replace("{n}", String(selected.length)));
      setSelected([]);
    },
    [selected, push],
  );

  // ── Derivations ──────────────────────────────────────────────────────────

  const roots = React.useMemo(() => tasks.filter((t) => t.parentId === null), [tasks]);

  const visibleRoots = React.useMemo(() => {
    const kept = roots.filter((t) => {
      if (matchesFilter(tasks, t, filters)) return true;
      // A parent survives when a subtask matched — otherwise a search for the
      // subtask would hand back nothing to hang it on.
      return childrenOf(tasks, t.id).some((k) => matchesFilter(tasks, k, filters));
    });
    const sorted = [...kept];
    if (sort === "due")
      sorted.sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));
    else if (sort === "priority")
      sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    else if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else sorted.sort((a, b) => a.order - b.order);
    return sorted;
  }, [roots, tasks, filters, sort]);

  const stats = React.useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(isDone).length;
    const overdue = tasks.filter((t) => !isDone(t) && dueBand(t.due) === "overdue").length;
    const blocked = tasks.filter((t) => !isDone(t) && isBlocked(tasks, t)).length;
    const milestones = tasks.filter((t) => t.isMilestone);
    return {
      total,
      done,
      pct: total ? Math.round((done / total) * 100) : 0,
      overdue,
      blocked,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      milestones,
      milestonesDone: milestones.filter(isDone).length,
    };
  }, [tasks]);

  const nFilters = filterCount(filters);
  const openTask = openTaskId ? tasks.find((t) => t.id === openTaskId) : null;

  const groups = React.useMemo(
    () => buildGroups(visibleRoots, group, sections),
    [visibleRoots, group, sections],
  );

  const showEmpty = preview === "empty" || tasks.length === 0;
  const showLoading = preview === "loading";
  const showNoResults = !showEmpty && !showLoading && visibleRoots.length === 0;

  // ── Overlay (panel + bulk bar + toast) ───────────────────────────────────

  const overlay = (
    <>
      {selected.length > 0 && (
        <BulkBar
          n={selected.length}
          onClear={() => setSelected([])}
          onComplete={() => bulk(() => ({ status: "completed" }), "{n} tasks completed.")}
          onPriority={(p) => bulk(() => ({ priority: p }), `{n} tasks set to ${PRIORITY_LABEL[p]}.`)}
          onSection={(sid) => bulk(() => ({ sectionId: sid }), "{n} tasks moved.")}
          sections={sections}
        />
      )}
      {openTask && (
        <TaskPanel
          task={openTask}
          tasks={tasks}
          sections={sections}
          entries={entries}
          onAddEntry={addEntry}
          onDeleteEntry={deleteEntry}
          onPatch={patch}
          onToggleComplete={toggleComplete}
          onAddSubtask={(pid, title) => {
            const parent = tasks.find((t) => t.id === pid);
            if (parent) addTask(parent.sectionId, title, pid);
          }}
          onOpenTask={setOpenTaskId}
          onClose={() => setOpenTaskId(null)}
        />
      )}
      <Toast toast={toast} onDismiss={dismiss} />
    </>
  );

  return (
    <AppShell
      breadcrumb={<Crumb trail={["Work", "Projects", project.code]} />}
      overlay={overlay}
    >
      <ProjectHeader project={project} stats={stats} preview={preview} onPreview={setPreview} />

      {/* ── View tabs + toolbar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-bz-line bg-bz-paper">
        <div className="flex items-center gap-1 overflow-x-auto px-4 md:px-6">
          {(
            [
              { k: "overview", label: "Overview", icon: Gauge },
              { k: "list", label: "List", icon: ListTree },
              { k: "board", label: "Board", icon: Columns3 },
              { k: "timeline", label: "Timeline", icon: GanttChartSquare },
            ] as const
          ).map((v) => {
            const on = view === v.k;
            const Icon = v.icon;
            return (
              <button
                key={v.k}
                type="button"
                onClick={() => setView(v.k)}
                className={cn(
                  "relative inline-flex h-11 shrink-0 items-center gap-1.5 px-3 text-[12.5px] transition-colors",
                  on ? "font-semibold text-bz-text" : "text-bz-text-muted hover:text-bz-text",
                )}
              >
                <Icon size={13} />
                {v.label}
                {on && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-bz-pill bg-bz-fire" />}
              </button>
            );
          })}
        </div>

        {view !== "overview" && (
          <Toolbar
            filters={filters}
            setFilters={setFilters}
            nFilters={nFilters}
            group={group}
            setGroup={setGroup}
            sort={sort}
            setSort={setSort}
            view={view}
            tasks={tasks}
            shown={visibleRoots.length}
            total={roots.length}
            onAdd={() => addTask(sections[0]?.id ?? "", "Untitled task")}
            onAddSection={addSection}
          />
        )}
      </div>

      {/* ── Views ───────────────────────────────────────────────────────── */}
      {view === "overview" ? (
        <Overview project={project} tasks={tasks} entries={entries} sections={sections} stats={stats} onOpenTask={setOpenTaskId} />
      ) : showLoading ? (
        <div className="p-4 md:p-6">
          <div className={CARD}>
            <LoadingRows rows={7} />
          </div>
        </div>
      ) : showEmpty ? (
        <div className="p-4 md:p-6">
          <div className={CARD}>
            <EmptyBlock
              icon={FolderPlus}
              title="This project has no work yet"
              body="Start with sections — the stages this project actually moves through — then add the first task under each. Sections become the board's columns and the list's groups."
              action={
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button type="button" className={PRIMARY_BTN} onClick={() => { setPreview("ready"); addTask(sections[0].id, "First task"); }}>
                    <Plus size={12} /> Add first task
                  </button>
                  <button type="button" className={GHOST_BTN} onClick={addSection}>
                    <Layers size={12} /> Add a section
                  </button>
                </div>
              }
            />
          </div>
        </div>
      ) : showNoResults ? (
        <div className="p-4 md:p-6">
          <div className={CARD}>
            <NoResults onClear={() => setFilters(EMPTY_FILTERS)} />
          </div>
        </div>
      ) : view === "list" ? (
        <ListView
          groups={groups}
          tasks={tasks}
          entries={entries}
          filters={filters}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          expanded={expanded}
          setExpanded={setExpanded}
          selected={selected}
          setSelected={setSelected}
          onOpen={setOpenTaskId}
          onToggle={toggleComplete}
          onMove={moveTask}
          onMoveSection={(id, before) => setSections((prev) => reorderSections(prev, id, before))}
          onAdd={addTask}
          groupKey={group}
        />
      ) : view === "board" ? (
        <BoardView
          sections={sections}
          tasks={tasks}
          visible={visibleRoots}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onOpen={setOpenTaskId}
          onToggle={toggleComplete}
          onMove={moveTask}
          onMoveSection={(id, before) => setSections((prev) => reorderSections(prev, id, before))}
          onAdd={addTask}
          onAddSection={addSection}
          onRenameSection={renameSection}
          onRemoveSection={removeSection}
        />
      ) : (
        <TimelineView
          project={project}
          sections={sections}
          tasks={tasks}
          visible={visibleRoots}
          onOpen={setOpenTaskId}
        />
      )}
    </AppShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER
// ════════════════════════════════════════════════════════════════════════════

const HEALTH_TONE = {
  on_track: "positive",
  at_risk: "partial",
  off_track: "danger",
  not_started: "pending",
} as const;

function ProjectHeader({
  project,
  stats,
  preview,
  onPreview,
}: {
  project: ReturnType<typeof projectById> & {};
  stats: { total: number; done: number; pct: number; overdue: number; blocked: number; milestones: Task[]; milestonesDone: number };
  preview: Preview;
  onPreview: (p: Preview) => void;
}) {
  const p = project!;
  const client = clientById(p.clientId);
  const previewBtn = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-5 md:px-6">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <div className="w-full min-w-0 md:flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/design/work/projects" className="text-[11.5px] text-bz-text-muted hover:text-bz-text">
              Projects
            </Link>
            <ChevronRight size={11} className="text-bz-text-soft" />
            <span className={cn("text-[11.5px] font-medium text-bz-text-soft", NUM)}>{p.code}</span>
          </div>
          <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-bz-text md:text-[25px]">
            {p.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Chip label={HEALTH_LABEL[p.health]} tone={HEALTH_TONE[p.health]} />
            {client && <span className="text-[11.5px] text-bz-text-muted">{client.name}</span>}
            <span className="hidden text-bz-line sm:inline">·</span>
            <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
              {fmtShort(p.start)} – {fmtShort(p.end)}
            </span>
            <span className="hidden text-bz-line sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5">
              <AvatarStack ids={p.memberIds} size={20} max={4} />
              <button type="button" className="text-[11.5px] text-bz-text-muted hover:text-bz-text">
                Members
              </button>
            </span>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <button
            ref={previewBtn}
            type="button"
            onClick={() => setOpen(true)}
            className={cn(GHOST_BTN_SM, preview !== "ready" && "border-bz-text-muted")}
            title="Preview a screen state"
          >
            {preview === "loading" ? <Loader2 size={11} className="animate-spin" /> : <EyeOff size={11} />}
            {preview === "ready" ? "State" : preview === "loading" ? "Loading" : "Empty"}
          </button>
          <Popover open={open} anchor={previewBtn.current} onClose={() => setOpen(false)} align="right" width={210}>
            <MenuLabel>Preview state</MenuLabel>
            {(["ready", "loading", "empty"] as Preview[]).map((s) => (
              <MenuItem key={s} active={preview === s} onClick={() => { onPreview(s); setOpen(false); }}>
                {s === "ready" ? "Ready (seeded)" : s === "loading" ? "Loading" : "Empty project"}
              </MenuItem>
            ))}
          </Popover>
          <button type="button" className={GHOST_BTN}>
            <Sparkles size={12} /> Status update
          </button>
          <button type="button" className={ICON_BTN}>
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Pulse strip — four facts, all derived from the task set below */}
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-line-soft md:grid-cols-4">
        <Pulse label="Progress" value={`${stats.pct}%`} sub={`${stats.done} of ${stats.total} tasks`}>
          <MeterBar pct={stats.pct} />
        </Pulse>
        <Pulse
          label="Overdue"
          value={String(stats.overdue)}
          sub={stats.overdue ? "needs a new date or an owner" : "nothing past its date"}
          tone={stats.overdue ? "danger" : undefined}
        />
        <Pulse
          label="Blocked"
          value={String(stats.blocked)}
          sub={stats.blocked ? "waiting on an unfinished task" : "no dependency is holding work"}
        />
        <Pulse
          label="Milestones"
          value={`${stats.milestonesDone}/${stats.milestones.length}`}
          sub={
            stats.milestones.find((m) => !isDone(m))
              ? `next · ${fmtShort(stats.milestones.find((m) => !isDone(m))!.due ?? p.end)}`
              : "all reached"
          }
        />
      </div>
    </header>
  );
}

function Pulse({
  label,
  value,
  sub,
  tone,
  children,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "danger";
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-bz-surface px-3.5 py-3">
      <p className={LABEL}>{label}</p>
      <p
        className={cn("mt-1.5 text-[20px] font-semibold leading-none tracking-tight text-bz-text", NUM)}
        style={tone === "danger" && value !== "0" ? { color: DANGER_TEXT } : undefined}
      >
        {value}
      </p>
      {children && <div className="mt-2">{children}</div>}
      <p className="mt-1.5 text-[10.5px] text-bz-text-soft">{sub}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOOLBAR  one filter set, shared by list · board · timeline
// ════════════════════════════════════════════════════════════════════════════

function Toolbar({
  filters,
  setFilters,
  nFilters,
  group,
  setGroup,
  sort,
  setSort,
  view,
  tasks,
  shown,
  total,
  onAdd,
  onAddSection,
}: {
  filters: FilterModel;
  setFilters: React.Dispatch<React.SetStateAction<FilterModel>>;
  nFilters: number;
  group: GroupKey;
  setGroup: (g: GroupKey) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  view: ViewKey;
  tasks: Task[];
  shown: number;
  total: number;
  onAdd: () => void;
  onAddSection: () => void;
}) {
  const filterBtn = React.useRef<HTMLButtonElement>(null);
  const groupBtn = React.useRef<HTMLButtonElement>(null);
  const sortBtn = React.useRef<HTMLButtonElement>(null);
  const [fOpen, setFOpen] = React.useState(false);
  const [gOpen, setGOpen] = React.useState(false);
  const [sOpen, setSOpen] = React.useState(false);

  const allTags = React.useMemo(
    () => Array.from(new Set(tasks.flatMap((t) => t.tags))).sort(),
    [tasks],
  );

  const toggle = <K extends keyof FilterModel>(key: K, value: any) =>
    setFilters((f) => {
      const arr = f[key] as unknown as any[];
      return { ...f, [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] } as FilterModel;
    });

  const chips: { label: string; clear: () => void }[] = [];
  if (filters.q) chips.push({ label: `“${filters.q}”`, clear: () => setFilters((f) => ({ ...f, q: "" })) });
  filters.assignees.forEach((a) =>
    chips.push({ label: personById(a)?.name ?? a, clear: () => toggle("assignees", a) }),
  );
  filters.priorities.forEach((p) => chips.push({ label: PRIORITY_LABEL[p], clear: () => toggle("priorities", p) }));
  filters.statuses.forEach((s) => chips.push({ label: STATUS_LABEL[s], clear: () => toggle("statuses", s) }));
  filters.tags.forEach((t) => chips.push({ label: `#${t}`, clear: () => toggle("tags", t) }));
  if (filters.dueWindow !== "any")
    chips.push({
      label: { overdue: "Overdue", today: "Due today", week: "Due this week" }[filters.dueWindow]!,
      clear: () => setFilters((f) => ({ ...f, dueWindow: "any" })),
    });
  if (filters.onlyBlocked) chips.push({ label: "Blocked only", clear: () => setFilters((f) => ({ ...f, onlyBlocked: false })) });
  if (filters.onlyMilestones) chips.push({ label: "Milestones only", clear: () => setFilters((f) => ({ ...f, onlyMilestones: false })) });
  if (!filters.showCompleted) chips.push({ label: "Completed hidden", clear: () => setFilters((f) => ({ ...f, showCompleted: true })) });

  return (
    <div className="border-t border-bz-line-soft px-4 py-2.5 md:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1 md:max-w-[300px]">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-soft" />
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Search tasks…"
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

        {view === "list" && (
          <button ref={groupBtn} type="button" onClick={() => setGOpen(true)} className={GHOST_BTN_SM}>
            <Layers size={11} /> Group: {{ section: "Section", assignee: "Assignee", priority: "Priority", due: "Due" }[group]}
          </button>
        )}

        <button ref={sortBtn} type="button" onClick={() => setSOpen(true)} className={GHOST_BTN_SM}>
          <ArrowUpDown size={11} /> {sort === "manual" ? "Manual order" : { due: "Due date", priority: "Priority", title: "Name" }[sort]}
        </button>

        <span className={cn("hidden text-[11.5px] text-bz-text-soft md:inline", NUM)}>
          {shown === total ? `${total} tasks` : `${shown} of ${total}`}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {view !== "timeline" && (
            <button type="button" onClick={onAddSection} className={GHOST_BTN_SM}>
              <Layers size={11} /> Add section
            </button>
          )}
          <button type="button" onClick={onAdd} className={cn(PRIMARY_BTN, "h-8")}>
            <Plus size={12} /> Add task
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={LABEL}>Filtered by</span>
          {chips.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={c.clear}
              className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[11px] font-medium text-bz-text hover:bg-bz-line-soft"
            >
              {c.label}
              <X size={9} className="text-bz-text-soft" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-[11px] font-medium text-bz-text-muted underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter menu */}
      <Popover open={fOpen} anchor={filterBtn.current} onClose={() => setFOpen(false)} width={280}>
        <MenuLabel>Assignee</MenuLabel>
        <div className="max-h-[150px] overflow-y-auto">
          {PEOPLE.map((p) => (
            <MenuItem key={p.id} active={filters.assignees.includes(p.id)} onClick={() => toggle("assignees", p.id)}>
              <span className="flex items-center gap-2">
                <Avatar person={p} size={17} /> {p.name}
              </span>
            </MenuItem>
          ))}
        </div>
        <MenuLabel>Priority</MenuLabel>
        {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
          <MenuItem key={p} active={filters.priorities.includes(p)} onClick={() => toggle("priorities", p)}>
            {PRIORITY_LABEL[p]}
          </MenuItem>
        ))}
        <MenuLabel>Status</MenuLabel>
        {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
          <MenuItem key={s} active={filters.statuses.includes(s)} onClick={() => toggle("statuses", s)}>
            {STATUS_LABEL[s]}
          </MenuItem>
        ))}
        {allTags.length > 0 && (
          <>
            <MenuLabel>Tag</MenuLabel>
            {allTags.map((t) => (
              <MenuItem key={t} active={filters.tags.includes(t)} onClick={() => toggle("tags", t)}>
                #{t}
              </MenuItem>
            ))}
          </>
        )}
        <MenuLabel>Due</MenuLabel>
        {([
          ["any", "Any date"],
          ["overdue", "Overdue"],
          ["today", "Due today or earlier"],
          ["week", "Due within 7 days"],
        ] as const).map(([k, label]) => (
          <MenuItem key={k} active={filters.dueWindow === k} onClick={() => setFilters((f) => ({ ...f, dueWindow: k }))}>
            {label}
          </MenuItem>
        ))}
        <div className="mt-1 border-t border-bz-line-soft pt-1.5">
          <ToggleRow label="Blocked only" checked={filters.onlyBlocked} onChange={(v) => setFilters((f) => ({ ...f, onlyBlocked: v }))} />
          <ToggleRow label="Milestones only" checked={filters.onlyMilestones} onChange={(v) => setFilters((f) => ({ ...f, onlyMilestones: v }))} />
          <ToggleRow label="Show completed" checked={filters.showCompleted} onChange={(v) => setFilters((f) => ({ ...f, showCompleted: v }))} />
        </div>
      </Popover>

      <Popover open={gOpen} anchor={groupBtn.current} onClose={() => setGOpen(false)} width={200}>
        <MenuLabel>Group tasks by</MenuLabel>
        {([
          ["section", "Section"],
          ["assignee", "Assignee"],
          ["priority", "Priority"],
          ["due", "Due window"],
        ] as const).map(([k, label]) => (
          <MenuItem key={k} active={group === k} onClick={() => { setGroup(k); setGOpen(false); }}>
            {label}
          </MenuItem>
        ))}
      </Popover>

      <Popover open={sOpen} anchor={sortBtn.current} onClose={() => setSOpen(false)} width={220}>
        <MenuLabel>Sort</MenuLabel>
        {([
          ["manual", "Manual — drag to re-order"],
          ["due", "Due date"],
          ["priority", "Priority"],
          ["title", "Name"],
        ] as const).map(([k, label]) => (
          <MenuItem key={k} active={sort === k} onClick={() => { setSort(k); setSOpen(false); }}>
            {label}
          </MenuItem>
        ))}
        {sort !== "manual" && (
          <p className="px-2 pb-1 pt-1.5 text-[10.5px] leading-relaxed text-bz-text-soft">
            Drag-to-re-order is disabled while a sort is applied — position is data, and a sort would overwrite it.
          </p>
        )}
      </Popover>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-bz-sm px-2 py-1.5 hover:bg-bz-paper-warm">
      <span className="flex-1 text-[12px] text-bz-text-muted">{label}</span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GROUPING
// ════════════════════════════════════════════════════════════════════════════

type Group = { id: string; name: string; meta?: string; tasks: Task[]; droppable: boolean };

function buildGroups(rows: Task[], key: GroupKey, sections: Section[]): Group[] {
  if (key === "section")
    return sections.map((s) => ({
      id: s.id,
      name: s.name,
      tasks: rows.filter((t) => t.sectionId === s.id),
      droppable: true,
    }));

  if (key === "assignee") {
    const out: Group[] = PEOPLE.map((p) => ({
      id: p.id,
      name: p.name,
      meta: p.team,
      tasks: rows.filter((t) => t.assigneeIds.includes(p.id)),
      droppable: false,
    })).filter((gp) => gp.tasks.length > 0);
    const none = rows.filter((t) => t.assigneeIds.length === 0);
    if (none.length) out.push({ id: "none", name: "Unassigned", tasks: none, droppable: false });
    return out;
  }

  if (key === "priority")
    return (["urgent", "high", "medium", "low"] as Priority[])
      .map((p) => ({ id: p, name: PRIORITY_LABEL[p], tasks: rows.filter((t) => t.priority === p), droppable: false }))
      .filter((gp) => gp.tasks.length > 0);

  const bands: { id: string; name: string; test: (t: Task) => boolean }[] = [
    { id: "overdue", name: "Overdue", test: (t) => dueBand(t.due) === "overdue" && !isDone(t) },
    { id: "today", name: "Today", test: (t) => dueBand(t.due) === "today" },
    { id: "soon", name: "Next 7 days", test: (t) => dueBand(t.due) === "soon" },
    { id: "later", name: "Later", test: (t) => dueBand(t.due) === "later" },
    { id: "none", name: "No due date", test: (t) => !t.due },
  ];
  const used = new Set<string>();
  return bands
    .map((b) => {
      const list = rows.filter((t) => !used.has(t.id) && b.test(t));
      list.forEach((t) => used.add(t.id));
      return { id: b.id, name: b.name, tasks: list, droppable: false };
    })
    .filter((gp) => gp.tasks.length > 0);
}

// ════════════════════════════════════════════════════════════════════════════
// LIST VIEW
// ════════════════════════════════════════════════════════════════════════════

function ListView({
  groups,
  tasks,
  entries,
  filters,
  collapsed,
  setCollapsed,
  expanded,
  setExpanded,
  selected,
  setSelected,
  onOpen,
  onToggle,
  onMove,
  onMoveSection,
  onAdd,
  groupKey,
}: {
  groups: Group[];
  tasks: Task[];
  entries: TimeEntry[];
  filters: FilterModel;
  collapsed: string[];
  setCollapsed: React.Dispatch<React.SetStateAction<string[]>>;
  expanded: string[];
  setExpanded: React.Dispatch<React.SetStateAction<string[]>>;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, target: { sectionId: string; beforeId: string | null }) => void;
  onMoveSection: (id: string, beforeId: string | null) => void;
  onAdd: (sectionId: string, title: string) => void;
  groupKey: GroupKey;
}) {
  const [drag, setDrag] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<{ sectionId: string; beforeId: string | null } | null>(null);
  // A section drag is a second, independent gesture over the same surface —
  // kept apart from the task drag so neither can half-fire the other.
  const [dragSection, setDragSection] = React.useState<string | null>(null);
  const [overSection, setOverSection] = React.useState<string | null>(null);

  const drop = () => {
    if (drag && over) onMove(drag, over);
    setDrag(null);
    setOver(null);
  };

  const dropSection = (beforeId: string | null) => {
    if (dragSection && dragSection !== beforeId) onMoveSection(dragSection, beforeId);
    setDragSection(null);
    setOverSection(null);
  };

  const clearAll = () => {
    setDrag(null);
    setOver(null);
    setDragSection(null);
    setOverSection(null);
  };

  return (
    <div className="p-4 md:p-6" onDragEnd={clearAll}>
      <div className={cn(CARD, "overflow-hidden")}>
        {/* Column heads — desktop only; the row becomes a card below md */}
        <div className="hidden items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-2 lg:flex">
          <span className="-ml-1 w-3" />
          <span className="w-4" />
          <span className="w-[17px]" />
          <span className={cn(LABEL, "flex-1")}>Task</span>
          <span className={cn(LABEL, "w-[92px]")}>Assignee</span>
          <span className={cn(LABEL, "w-[86px]")}>Due</span>
          <span className={cn(LABEL, "w-[84px]")}>Priority</span>
          <span className={cn(LABEL, "w-[96px]")}>Status</span>
          <span className={cn(LABEL, "w-[64px] text-right")}>Hours</span>
          <span className="w-5" />
        </div>

        {groups.map((gp) => {
          const isCollapsed = collapsed.includes(gp.id);
          const done = gp.tasks.filter(isDone).length;
          return (
            <section
              key={gp.id}
              onDragOver={(e) => {
                if (!dragSection || dragSection === gp.id || !gp.droppable) return;
                e.preventDefault();
                setOverSection(gp.id);
              }}
              onDrop={(e) => {
                if (!dragSection || dragSection === gp.id || !gp.droppable) return;
                e.preventDefault();
                dropSection(gp.id);
              }}
            >
              <header
                draggable={gp.droppable}
                onDragStart={() => setDragSection(gp.id)}
                className={cn(
                  "group/head flex select-none items-center gap-2 border-b border-bz-line-soft bg-bz-surface px-3 py-2",
                  gp.droppable && "cursor-grab",
                  dragSection === gp.id && "opacity-40",
                  // A dragged section lands BEFORE the group it is dropped on.
                  overSection === gp.id && "border-t-2 border-t-bz-fire",
                )}
                onDragOver={(e) => {
                  if (dragSection) return; // handled by the <section> above
                  if (!drag || !gp.droppable) return;
                  e.preventDefault();
                  setOver({ sectionId: gp.id, beforeId: gp.tasks[0]?.id ?? null });
                }}
              >
                {gp.droppable && (
                  <GripVertical
                    size={13}
                    className="-ml-1 shrink-0 cursor-grab text-bz-line-soft transition-colors group-hover/head:text-bz-text-soft"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => (isCollapsed ? c.filter((x) => x !== gp.id) : [...c, gp.id]))}
                  className="text-bz-text-soft hover:text-bz-text"
                >
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </button>
                <h3 className="text-[12.5px] font-semibold text-bz-text">{gp.name}</h3>
                {gp.meta && <span className="text-[11px] text-bz-text-soft">{gp.meta}</span>}
                <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>
                  {done}/{gp.tasks.length}
                </span>
                <div className="w-20">
                  <MeterBar pct={gp.tasks.length ? Math.round((done / gp.tasks.length) * 100) : 0} height="h-1" />
                </div>
                <span className="ml-auto" />
              </header>

              {!isCollapsed && (
                <div>
                  {gp.tasks.map((t) => (
                    <React.Fragment key={t.id}>
                      <ListRow
                        task={t}
                        tasks={tasks}
                        entries={entries}
                        depth={0}
                        selected={selected.includes(t.id)}
                        onSelect={(v) =>
                          setSelected((s) => (v ? [...s, t.id] : s.filter((x) => x !== t.id)))
                        }
                        expanded={expanded.includes(t.id)}
                        onExpand={() =>
                          setExpanded((e) => (e.includes(t.id) ? e.filter((x) => x !== t.id) : [...e, t.id]))
                        }
                        onOpen={() => onOpen(t.id)}
                        onToggle={() => onToggle(t.id)}
                        draggable={gp.droppable}
                        sectionDrag={dragSection !== null}
                        dragging={drag === t.id}
                        dropBefore={over?.sectionId === gp.id && over.beforeId === t.id}
                        onDragStart={() => setDrag(t.id)}
                        onDragOver={(before) => setOver({ sectionId: gp.id, beforeId: before ? t.id : null })}
                        onDrop={drop}
                      />
                      {expanded.includes(t.id) &&
                        childrenOf(tasks, t.id)
                          .filter((k) => filters.showCompleted || !isDone(k))
                          .map((k) => (
                            <ListRow
                              key={k.id}
                              task={k}
                              tasks={tasks}
                              entries={entries}
                              depth={1}
                              selected={selected.includes(k.id)}
                              onSelect={(v) => setSelected((s) => (v ? [...s, k.id] : s.filter((x) => x !== k.id)))}
                              expanded={false}
                              onOpen={() => onOpen(k.id)}
                              onToggle={() => onToggle(k.id)}
                              draggable={false}
                              sectionDrag={dragSection !== null}
                              dragging={false}
                              dropBefore={false}
                              onDragStart={() => {}}
                              onDragOver={() => {}}
                              onDrop={() => {}}
                            />
                          ))}
                    </React.Fragment>
                  ))}

                  {/* end-of-group drop zone + inline add */}
                  <div
                    className={cn(
                      "border-b border-bz-line-soft",
                      over?.sectionId === gp.id && over.beforeId === null && "border-t-2 border-t-bz-fire",
                    )}
                    onDragOver={(e) => {
                      if (dragSection) return;
                      if (!drag || !gp.droppable) return;
                      e.preventDefault();
                      setOver({ sectionId: gp.id, beforeId: null });
                    }}
                    onDrop={(e) => {
                      if (dragSection) return;
                      drop();
                    }}
                  >
                    {gp.droppable ? (
                      <InlineAdd onAdd={(title) => onAdd(gp.id, title)} />
                    ) : (
                      <div className="h-2" />
                    )}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {dragSection && groupKey === "section" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOverSection("__end");
          }}
          onDrop={(e) => {
            e.preventDefault();
            dropSection(null);
          }}
          className={cn(
            "mt-2 flex h-11 items-center justify-center rounded-bz-lg border border-dashed text-[11.5px] font-medium",
            overSection === "__end"
              ? "border-bz-fire bg-bz-fire/[0.10] text-bz-text"
              : "border-bz-line text-bz-text-soft",
          )}
        >
          Drop here to make it the last section
        </div>
      )}

      {groupKey !== "section" && (
        <p className="mt-2.5 text-[11px] text-bz-text-soft">
          Drag-to-re-order is available when grouped by section — position belongs to a section, so it can only be
          written there.
        </p>
      )}
    </div>
  );
}

function ListRow({
  task,
  tasks,
  entries,
  depth,
  selected,
  onSelect,
  expanded,
  onExpand,
  onOpen,
  onToggle,
  draggable,
  sectionDrag,
  dragging,
  dropBefore,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  task: Task;
  tasks: Task[];
  entries: TimeEntry[];
  depth: number;
  selected: boolean;
  onSelect: (v: boolean) => void;
  expanded: boolean;
  onExpand?: () => void;
  onOpen: () => void;
  onToggle: () => void;
  draggable: boolean;
  /** True while a SECTION is being dragged — the row must then let the event
      through to its group, or it becomes a dead zone over its own section. */
  sectionDrag: boolean;
  dragging: boolean;
  dropBefore: boolean;
  onDragStart: () => void;
  onDragOver: (beforeThis: boolean) => void;
  onDrop: () => void;
}) {
  const done = isDone(task);
  const blockers = openBlockers(tasks, task);
  const prog = subtaskProgress(tasks, task.id);
  const kids = childrenOf(tasks, task.id);
  const logged = loggedRollup(tasks, entries, task.id);
  const estimate = estimateOf(tasks, task.id);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        if (sectionDrag || !draggable) return;
        e.preventDefault();
        const r = e.currentTarget.getBoundingClientRect();
        onDragOver(e.clientY < r.top + r.height / 2);
      }}
      onDrop={(e) => {
        if (sectionDrag) return;
        e.preventDefault();
        onDrop();
      }}
      onClick={onOpen}
      className={cn(
        "group flex cursor-pointer select-none flex-wrap items-center gap-x-3 gap-y-2 border-b border-bz-line-soft px-3 py-2.5 transition-colors lg:flex-nowrap",
        selected ? "bg-bz-fire/[0.10]" : "bg-bz-surface hover:bg-bz-paper-warm",
        dragging && "opacity-35",
        dropBefore && "border-t-2 border-t-bz-fire",
      )}
      style={depth ? { paddingLeft: 12 + depth * 26 } : undefined}
    >
      <span className="-ml-1 flex w-3 shrink-0 items-center">
        {draggable && (
          <GripVertical
            size={13}
            className="cursor-grab text-bz-line-soft transition-colors group-hover:text-bz-text-soft"
          />
        )}
      </span>

      <span className="flex w-4 shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selected} onChange={onSelect} />
      </span>

      <CompleteToggle done={done} blocked={blockers.length > 0} onToggle={onToggle} />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {kids.length > 0 && depth === 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExpand?.();
            }}
            className="shrink-0 text-bz-text-soft hover:text-bz-text"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {task.isMilestone && <MilestoneMark />}
        <span
          className={cn(
            "truncate text-[12.5px]",
            done ? "text-bz-text-soft line-through" : "font-medium text-bz-text",
          )}
        >
          {task.title}
        </span>
        {blockers.length > 0 && (
          <span
            className="inline-flex shrink-0 items-center gap-0.5 rounded-bz-sm px-1 py-0.5 text-[10px] font-semibold"
            style={{ background: DANGER_BG, color: DANGER_TEXT }}
            title={`Blocked by: ${blockers.map((b) => b.title).join(", ")}`}
          >
            <Lock size={8} />
            {blockers.length}
          </span>
        )}
        {prog && (
          <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>
            {prog.done}/{prog.total}
          </span>
        )}
        {task.linkedDoc && <span className="hidden shrink-0 xl:block"><LinkedDocChip doc={task.linkedDoc} compact /></span>}
        <span className="hidden shrink-0 items-center gap-1 xl:flex">
          {task.tags.slice(0, 2).map((t) => (
            <TagChip key={t} label={t} />
          ))}
        </span>
        <span className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          <MetaCount icon={MessageSquare} n={task.comments} />
          <MetaCount icon={Paperclip} n={task.attachments} />
        </span>
      </div>

      <span className="w-[92px] shrink-0">
        <AvatarStack ids={task.assigneeIds} size={20} max={2} />
      </span>
      <span className="w-[86px] shrink-0">
        <DueChip due={task.due} done={done} />
      </span>
      <span className="hidden w-[84px] shrink-0 lg:block">
        <PriorityMark p={task.priority} />
      </span>
      <span className="hidden w-[96px] shrink-0 lg:block">
        <StatusChip status={task.status} />
      </span>
      <span
        className={cn("hidden w-[64px] shrink-0 text-right text-[11.5px] text-bz-text-muted lg:block", NUM)}
        title={
          kids.length
            ? "Logged / estimated, including subtasks"
            : "Logged / estimated"
        }
      >
        {fmtHShort(logged)}
        {estimate !== null ? <span className="text-bz-text-soft">/{estimate}</span> : null}
      </span>

      <span className="hidden w-5 shrink-0 lg:block" />
    </div>
  );
}

function InlineAdd({ onAdd, placeholder = "Add task…" }: { onAdd: (title: string) => void; placeholder?: string }) {
  const [value, setValue] = React.useState("");
  const [active, setActive] = React.useState(false);

  if (!active)
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text"
      >
        <Plus size={12} /> {placeholder}
      </button>
    );

  return (
    <form
      className="flex items-center gap-2 px-3 py-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onAdd(value.trim());
        setValue("");
      }}
    >
      <Plus size={12} className="shrink-0 text-bz-text-soft" />
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => !value && setActive(false)}
        onKeyDown={(e) => e.key === "Escape" && setActive(false)}
        placeholder="Task name, then Enter"
        className="h-7 min-w-0 flex-1 border-0 bg-transparent p-0 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft"
      />
    </form>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BOARD VIEW  sections are columns; drag is the verb
// ════════════════════════════════════════════════════════════════════════════

function BoardView({
  sections,
  tasks,
  visible,
  collapsed,
  setCollapsed,
  onOpen,
  onToggle,
  onMove,
  onMoveSection,
  onAdd,
  onAddSection,
  onRenameSection,
  onRemoveSection,
}: {
  sections: Section[];
  tasks: Task[];
  visible: Task[];
  collapsed: string[];
  setCollapsed: React.Dispatch<React.SetStateAction<string[]>>;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, target: { sectionId: string; beforeId: string | null }) => void;
  onMoveSection: (id: string, beforeId: string | null) => void;
  onAdd: (sectionId: string, title: string) => void;
  onAddSection: () => void;
  onRenameSection: (id: string, name: string) => void;
  onRemoveSection: (id: string) => void;
}) {
  const [drag, setDrag] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<{ sectionId: string; beforeId: string | null } | null>(null);
  const [dragSection, setDragSection] = React.useState<string | null>(null);
  const [overSection, setOverSection] = React.useState<string | null>(null);

  const drop = () => {
    if (drag && over) onMove(drag, over);
    setDrag(null);
    setOver(null);
  };

  return (
    <div
      className="h-[68vh] overflow-x-auto overflow-y-hidden p-4 md:h-[calc(100vh-233px)] md:p-6"
      onDragEnd={() => {
        setDrag(null);
        setOver(null);
        setDragSection(null);
        setOverSection(null);
      }}
    >
      <div className="flex h-full items-start gap-3">
        {sections.map((s) => {
          const rows = visible.filter((t) => t.sectionId === s.id);
          const isCollapsed = collapsed.includes(s.id);
          const done = rows.filter(isDone).length;

          if (isCollapsed)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCollapsed((c) => c.filter((x) => x !== s.id))}
                className={cn(CARD, "flex h-full w-11 shrink-0 flex-col items-center gap-3 py-3 hover:border-bz-line")}
                title={`Expand ${s.name}`}
              >
                <ChevronRight size={13} className="text-bz-text-soft" />
                <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1 py-0.5 text-[10px] font-semibold text-bz-text-muted", NUM)}>
                  {rows.length}
                </span>
                <span
                  className="whitespace-nowrap text-[11.5px] font-semibold text-bz-text-muted"
                  style={{ writingMode: "vertical-rl" }}
                >
                  {s.name}
                </span>
              </button>
            );

          return (
            <div
              key={s.id}
              className={cn(
                "relative flex h-full w-[260px] shrink-0 flex-col sm:w-[282px]",
                // A section being dragged lands BEFORE the column it is dropped on,
                // so the indicator belongs on that column's leading edge.
                overSection === s.id && "before:absolute before:-left-1.5 before:top-0 before:h-full before:w-[3px] before:rounded-bz-pill before:bg-bz-fire before:content-['']",
              )}
              onDragOver={(e) => {
                if (!dragSection || dragSection === s.id) return;
                e.preventDefault();
                setOverSection(s.id);
              }}
              onDrop={(e) => {
                if (!dragSection || dragSection === s.id) return;
                e.preventDefault();
                onMoveSection(dragSection, s.id);
                setDragSection(null);
                setOverSection(null);
              }}
            >
              <BoardColumnHead
                section={s}
                count={rows.length}
                done={done}
                onCollapse={() => setCollapsed((c) => [...c, s.id])}
                onRename={(name) => onRenameSection(s.id, name)}
                onRemove={() => onRemoveSection(s.id)}
                onDragStart={() => setDragSection(s.id)}
                dragging={dragSection === s.id}
              />

              <div
                className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-b-bz-lg border border-t-0 border-bz-line-soft bg-bz-paper-warm/60 p-2"
                onDragOver={(e) => {
                  // A section drag passes straight through to the wrapper above.
                  if (dragSection) return;
                  if (!drag) return;
                  e.preventDefault();
                  setOver({ sectionId: s.id, beforeId: null });
                }}
                onDrop={(e) => {
                  if (dragSection) return;
                  e.preventDefault();
                  drop();
                }}
              >
                {rows.length === 0 && !drag && (
                  <p className="px-2 py-6 text-center text-[11.5px] leading-relaxed text-bz-text-soft">
                    Nothing here yet.
                    <br />
                    Drag a card in, or add one below.
                  </p>
                )}

                {rows.map((t) => (
                  <BoardCard
                    key={t.id}
                    task={t}
                    tasks={tasks}
                    dragging={drag === t.id}
                    dropBefore={over?.sectionId === s.id && over.beforeId === t.id}
                    sectionDrag={dragSection !== null}
                    onDragStart={() => setDrag(t.id)}
                    onDragOver={(before) => setOver({ sectionId: s.id, beforeId: before ? t.id : null })}
                    onDrop={drop}
                    onOpen={() => onOpen(t.id)}
                    onToggle={() => onToggle(t.id)}
                  />
                ))}

                {over?.sectionId === s.id && over.beforeId === null && drag && (
                  <div className="h-[3px] rounded-bz-pill bg-bz-fire" />
                )}

                <BoardAdd onAdd={(title) => onAdd(s.id, title)} />
              </div>
            </div>
          );
        })}

        {/* Add-section column */}
        <button
          type="button"
          onClick={onAddSection}
          onDragOver={(e) => {
            if (!dragSection) return;
            e.preventDefault();
            setOverSection("__end");
          }}
          onDrop={(e) => {
            if (!dragSection) return;
            e.preventDefault();
            onMoveSection(dragSection, null);
            setDragSection(null);
            setOverSection(null);
          }}
          className={cn(
            "flex h-full w-[240px] shrink-0 flex-col items-center justify-center gap-2 rounded-bz-lg border border-dashed text-bz-text-soft hover:border-bz-text-muted hover:text-bz-text",
            overSection === "__end" ? "border-bz-fire bg-bz-fire/[0.10] text-bz-text" : "border-bz-line",
          )}
        >
          <Plus size={16} />
          <span className="text-[12px] font-medium">
            {dragSection ? "Drop to move here" : "Add section"}
          </span>
          <span className="max-w-[180px] text-center text-[10.5px] leading-relaxed">
            {dragSection ? "This section becomes the last column" : "A stage this project moves through"}
          </span>
        </button>
      </div>
    </div>
  );
}

function BoardColumnHead({
  section,
  count,
  done,
  onCollapse,
  onRename,
  onRemove,
  onDragStart,
  dragging,
}: {
  section: Section;
  count: number;
  done: number;
  onCollapse: () => void;
  onRename: (name: string) => void;
  onRemove: () => void;
  onDragStart: () => void;
  dragging: boolean;
}) {
  const btn = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(section.name);

  React.useEffect(() => setName(section.name), [section.name]);

  return (
    <header
      draggable
      onDragStart={onDragStart}
      className={cn(
        "group/head flex cursor-grab select-none items-center gap-2 rounded-t-bz-lg border border-bz-line-soft bg-bz-surface px-2.5 py-2",
        dragging && "opacity-40",
      )}
    >
      <GripVertical size={13} className="shrink-0 cursor-grab text-bz-line-soft transition-colors group-hover/head:text-bz-text-soft" />
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            onRename(name.trim() || section.name);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onRename(name.trim() || section.name);
              setEditing(false);
            }
            if (e.key === "Escape") {
              setName(section.name);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[12.5px] font-semibold text-bz-text outline-none"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={() => setEditing(true)}
          className="min-w-0 flex-1 truncate text-left text-[12.5px] font-semibold text-bz-text"
          title="Double-click to rename"
        >
          {section.name}
        </button>
      )}
      <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>
        {done}/{count}
      </span>
      <button ref={btn} type="button" onClick={() => setOpen(true)} className="text-bz-text-soft hover:text-bz-text">
        <MoreHorizontal size={14} />
      </button>
      <Popover open={open} anchor={btn.current} onClose={() => setOpen(false)} align="right" width={190}>
        <MenuItem icon={Pencil} onClick={() => { setEditing(true); setOpen(false); }}>Rename section</MenuItem>
        <MenuItem icon={ChevronRight} onClick={() => { onCollapse(); setOpen(false); }}>Collapse column</MenuItem>
        <MenuItem icon={Trash2} danger onClick={() => { onRemove(); setOpen(false); }}>Delete section</MenuItem>
      </Popover>
    </header>
  );
}

function BoardCard({
  task,
  tasks,
  dragging,
  dropBefore,
  sectionDrag,
  onDragStart,
  onDragOver,
  onDrop,
  onOpen,
  onToggle,
}: {
  task: Task;
  tasks: Task[];
  dragging: boolean;
  dropBefore: boolean;
  /** True while a COLUMN is being dragged — the card must then be transparent
      to drag events, or it becomes a dead zone over its own column. */
  sectionDrag: boolean;
  onDragStart: () => void;
  onDragOver: (before: boolean) => void;
  onDrop: () => void;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const done = isDone(task);
  const blockers = openBlockers(tasks, task);
  const prog = subtaskProgress(tasks, task.id);
  const band = dueBand(task.due);

  return (
    <>
      {dropBefore && <div className="h-[3px] rounded-bz-pill bg-bz-fire" />}
      <article
        draggable
        onDragStart={onDragStart}
        onDragOver={(e) => {
          if (sectionDrag) return;
          e.preventDefault();
          e.stopPropagation();
          const r = e.currentTarget.getBoundingClientRect();
          onDragOver(e.clientY < r.top + r.height / 2);
        }}
        onDrop={(e) => {
          if (sectionDrag) return;
          e.preventDefault();
          e.stopPropagation();
          onDrop();
        }}
        onClick={onOpen}
        className={cn(
          "group cursor-pointer select-none rounded-bz-md border border-bz-line-soft bg-bz-surface p-2.5 transition-shadow hover:border-bz-line",
          SHADOW_SOFT,
          dragging && "opacity-35",
          done && "bg-bz-paper-warm",
        )}
      >
        <div className="flex items-start gap-2">
          <div className="pt-[1px]">
            <CompleteToggle done={done} blocked={blockers.length > 0} size={15} onToggle={onToggle} />
          </div>
          <div className="min-w-0 flex-1">
            {(task.isMilestone || blockers.length > 0) && (
              <div className="mb-1 flex flex-wrap items-center gap-1">
                {task.isMilestone && (
                  <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-fire/[0.28] px-1.5 py-0.5 text-[10px] font-semibold text-bz-text">
                    <MilestoneMark size={9} /> Milestone
                  </span>
                )}
                {blockers.length > 0 && (
                  <span
                    className="inline-flex items-center gap-1 rounded-bz-sm px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ background: DANGER_BG, color: DANGER_TEXT }}
                    title={blockers.map((b) => b.title).join(", ")}
                  >
                    <Lock size={8} /> Blocked
                  </span>
                )}
              </div>
            )}
            <p className={cn("text-[12.5px] leading-snug", done ? "text-bz-text-soft line-through" : "font-medium text-bz-text")}>
              {task.title}
            </p>
            {task.linkedDoc && (
              <div className="mt-1.5">
                <LinkedDocChip doc={task.linkedDoc} compact />
              </div>
            )}
            {prog && (
              <div className="mt-2 flex items-center gap-2">
                <MeterBar pct={prog.pct} height="h-1" />
                <span className={cn("shrink-0 text-[10px] text-bz-text-soft", NUM)}>
                  {prog.done}/{prog.total}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2 pl-[23px]">
          <PriorityMark p={task.priority} withLabel={false} />
          {task.due && (
            <span
              className={cn("text-[10.5px] font-medium", NUM)}
              style={
                band === "overdue" && !done
                  ? { color: DANGER_TEXT }
                  : undefined
              }
            >
              {fmtShort(task.due)}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5">
            <MetaCount icon={MessageSquare} n={task.comments} />
            <MetaCount icon={Paperclip} n={task.attachments} />
            <AvatarStack ids={task.assigneeIds} size={19} max={2} />
          </span>
        </div>
      </article>
    </>
  );
}

function BoardAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = React.useState("");
  const [active, setActive] = React.useState(false);

  if (!active)
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="flex w-full items-center gap-1.5 rounded-bz-md px-2 py-2 text-left text-[11.5px] text-bz-text-soft hover:bg-bz-surface hover:text-bz-text"
      >
        <Plus size={12} /> Add task
      </button>
    );

  return (
    <form
      className="rounded-bz-md border border-bz-line bg-bz-surface p-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onAdd(value.trim());
        setValue("");
      }}
    >
      <textarea
        autoFocus
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
              onAdd(value.trim());
              setValue("");
            }
          }
          if (e.key === "Escape") setActive(false);
        }}
        onBlur={() => !value && setActive(false)}
        placeholder="Task name — Enter to add, Esc to close"
        className="w-full resize-none border-0 bg-transparent p-0 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft"
      />
    </form>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TIMELINE VIEW  bars, milestone diamonds, dependency arrows
// ════════════════════════════════════════════════════════════════════════════

const ROW_H = 30;
/** Name gutter. Narrow on a phone — the bars are the point, not the labels. */
const NAME_COL = "w-[132px] md:w-[232px]";

function TimelineView({
  project,
  sections,
  tasks,
  visible,
  onOpen,
}: {
  project: ReturnType<typeof projectById> & {};
  sections: Section[];
  tasks: Task[];
  visible: Task[];
  onOpen: (id: string) => void;
}) {
  const [zoom, setZoom] = React.useState<"week" | "month">("week");
  const dayW = zoom === "week" ? 12 : 5;
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const p = project!;
  const start = React.useMemo(() => {
    const dates = visible.flatMap((t) => [t.start, t.due]).filter(Boolean) as string[];
    const min = dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : p.start;
    return addDays(min < p.start ? min : p.start, -3);
  }, [visible, p.start]);

  const end = React.useMemo(() => {
    const dates = visible.flatMap((t) => [t.start, t.due]).filter(Boolean) as string[];
    const max = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : p.end;
    return addDays(max > p.end ? max : p.end, 4);
  }, [visible, p.end]);

  const totalDays = Math.max(1, daysBetween(start, end));
  const width = totalDays * dayW;
  const x = (iso: string) => daysBetween(start, iso) * dayW;

  // Rows, in section order, so the bar chart reads like the board.
  const rows = React.useMemo(() => {
    const out: { kind: "section"; id: string; name: string }[] | any[] = [];
    sections.forEach((s) => {
      const list = visible.filter((t) => t.sectionId === s.id);
      if (!list.length) return;
      out.push({ kind: "section", id: s.id, name: s.name });
      list.forEach((t) => out.push({ kind: "task", id: t.id, task: t }));
    });
    return out as ({ kind: "section"; id: string; name: string } | { kind: "task"; id: string; task: Task })[];
  }, [sections, visible]);

  const yOf = (taskId: string) => {
    const i = rows.findIndex((r) => r.kind === "task" && r.id === taskId);
    return i < 0 ? null : i * ROW_H + ROW_H / 2;
  };

  const barOf = (t: Task) => {
    const s = t.start ?? t.due;
    const e = t.due ?? t.start;
    if (!s || !e) return null;
    const left = x(s);
    const right = x(e) + dayW;
    return { left, width: Math.max(dayW, right - left) };
  };

  // Dependency edges — only drawn when both ends have a bar in view.
  const edges = React.useMemo(() => {
    const out: { d: string; blocked: boolean; key: string }[] = [];
    visible.forEach((t) => {
      t.blockedBy.forEach((bid) => {
        const from = tasks.find((z) => z.id === bid);
        if (!from) return;
        const fb = barOf(from);
        const tb = barOf(t);
        const fy = yOf(from.id);
        const ty = yOf(t.id);
        if (!fb || !tb || fy === null || ty === null) return;
        const x1 = fb.left + fb.width;
        const x2 = tb.left;
        const mid = x2 - 8 > x1 + 8 ? (x1 + x2) / 2 : x1 + 10;
        out.push({
          key: `${bid}->${t.id}`,
          blocked: !isDone(from),
          d: `M ${x1} ${fy} H ${mid} V ${ty} H ${x2 - 5}`,
        });
      });
    });
    return out;
  }, [visible, tasks, rows, dayW, start]);

  const todayX = x(TODAY);

  // Land the viewport on TODAY, not on the project's first day — the question a
  // timeline is opened with is "what is happening now", not "how did it start".
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, todayX - el.clientWidth * 0.35);
  }, [todayX, dayW]);

  const months = React.useMemo(() => buildMonthTicks(start, totalDays, dayW), [start, totalDays, dayW]);

  return (
    <div className="p-4 md:p-6">
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-2 border-b border-bz-line-soft bg-bz-paper-warm px-3 py-2">
          <h3 className="text-[12px] font-semibold text-bz-text">Timeline</h3>
          <span className="text-[11px] text-bz-text-soft">
            Bars run start → due. Diamonds are milestones. Arrows are dependencies — red while the blocker is open.
          </span>
          <div className="ml-auto">
            <Segmented
              size="sm"
              value={zoom}
              onChange={setZoom}
              options={[
                { value: "week", label: "Weeks" },
                { value: "month", label: "Months" },
              ]}
            />
          </div>
        </div>

        <div className="flex">
          {/* Names */}
          <div className={cn("shrink-0 border-r border-bz-line-soft bg-bz-surface", NAME_COL)}>
            <div className="h-9 border-b border-bz-line-soft bg-bz-paper-warm" />
            {rows.map((r) =>
              r.kind === "section" ? (
                <div
                  key={r.id}
                  className="flex items-center border-b border-bz-line-soft bg-bz-paper-warm px-3"
                  style={{ height: ROW_H }}
                >
                  <span className={LABEL}>{r.name}</span>
                </div>
              ) : (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onOpen(r.id)}
                  className="flex w-full items-center gap-1.5 border-b border-bz-line-soft px-3 text-left hover:bg-bz-paper-warm"
                  style={{ height: ROW_H }}
                >
                  {r.task.isMilestone && <MilestoneMark size={10} />}
                  <span
                    className={cn(
                      "truncate text-[11.5px]",
                      isDone(r.task) ? "text-bz-text-soft line-through" : "text-bz-text",
                    )}
                  >
                    {r.task.title}
                  </span>
                </button>
              ),
            )}
          </div>

          {/* Chart */}
          <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto">
            <div className="relative" style={{ width }}>
              {/* Month scale */}
              <div className="sticky top-0 flex h-9 border-b border-bz-line-soft bg-bz-paper-warm">
                {months.map((m) => (
                  <div
                    key={m.label}
                    className="flex flex-col justify-center border-r border-bz-line-soft px-2"
                    style={{ width: m.width }}
                  >
                    <span className="text-[10.5px] font-semibold text-bz-text">{m.label}</span>
                    {zoom === "week" && <span className={cn("text-[9.5px] text-bz-text-soft", NUM)}>{m.days}d</span>}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="relative">
                {/* Week gridlines — a bar is only readable against a ruler */}
                <div className="pointer-events-none absolute inset-0 flex">
                  {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => (
                    <span key={i} className="border-r border-bz-line-soft/70" style={{ width: dayW * 7 }} />
                  ))}
                </div>

                {rows.map((r) =>
                  r.kind === "section" ? (
                    <div key={r.id} className="border-b border-bz-line-soft bg-bz-paper-warm" style={{ height: ROW_H }} />
                  ) : (
                    <div key={r.id} className="relative border-b border-bz-line-soft" style={{ height: ROW_H }}>
                      <TimelineBar task={r.task} tasks={tasks} bar={barOf(r.task)} dayW={dayW} onOpen={() => onOpen(r.id)} />
                    </div>
                  ),
                )}

                {/* Dependency arrows */}
                <svg className="pointer-events-none absolute inset-0" width={width} height={rows.length * ROW_H}>
                  <defs>
                    <marker id="arw" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#707064" />
                    </marker>
                    <marker id="arw-danger" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill={DANGER_DOT} />
                    </marker>
                  </defs>
                  {edges.map((e) => (
                    <path
                      key={e.key}
                      d={e.d}
                      fill="none"
                      stroke={e.blocked ? DANGER_DOT : "#707064"}
                      strokeWidth={1.25}
                      strokeDasharray={e.blocked ? "3 2" : undefined}
                      markerEnd={e.blocked ? "url(#arw-danger)" : "url(#arw)"}
                      opacity={0.75}
                    />
                  ))}
                </svg>

                {/* Today line */}
                {todayX >= 0 && todayX <= width && (
                  <div className="pointer-events-none absolute inset-y-0" style={{ left: todayX }}>
                    <div className="h-full w-[1.5px] bg-bz-olive/45" />
                    <span className="absolute left-0 top-1 -translate-x-1/2 whitespace-nowrap rounded-bz-sm bg-bz-olive px-1.5 py-0.5 text-[9.5px] font-semibold text-bz-text-on-dark">
                      Today
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-[11px] text-bz-text-soft">
        Scroll the chart horizontally. A task with neither a start nor a due date has no bar — give it a date in the
        panel and it appears here.
      </p>
    </div>
  );
}

function TimelineBar({
  task,
  tasks,
  bar,
  dayW,
  onOpen,
}: {
  task: Task;
  tasks: Task[];
  bar: { left: number; width: number } | null;
  dayW: number;
  onOpen: () => void;
}) {
  if (!bar)
    return (
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10.5px] italic text-bz-text-soft">
        no dates
      </span>
    );

  const done = isDone(task);
  const blocked = openBlockers(tasks, task).length > 0;
  const overdue = !done && dueBand(task.due) === "overdue";
  const prog = subtaskProgress(tasks, task.id);

  if (task.isMilestone)
    return (
      <button
        type="button"
        onClick={onOpen}
        className="absolute top-1/2 -translate-y-1/2"
        style={{ left: bar.left + bar.width - dayW / 2 - 7 }}
        title={`${task.title} · ${task.due ? fmtDate(task.due) : ""}`}
      >
        <span
          className={cn(
            "block size-3.5 rotate-45 rounded-[2px] border",
            done ? "border-bz-leaf-deep bg-bz-leaf-deep" : "border-bz-olive bg-bz-fire",
          )}
        />
      </button>
    );

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "absolute top-1/2 flex h-[15px] -translate-y-1/2 items-center overflow-hidden rounded-bz-sm border px-1.5",
        done
          ? "border-bz-leaf-deep bg-bz-leaf/60"
          : blocked
            ? "border-transparent"
            : "border-bz-olive/25 bg-bz-olive/[0.12] hover:bg-bz-olive/20",
      )}
      style={{
        left: bar.left,
        width: bar.width,
        ...(blocked && !done ? { background: DANGER_BG, borderColor: DANGER_DOT } : {}),
      }}
      title={`${task.title}${task.due ? ` · due ${fmtDate(task.due)}` : ""}`}
    >
      {prog && !done && (
        <span
          className="absolute inset-y-0 left-0 bg-bz-leaf-deep/40"
          style={{ width: `${prog.pct}%` }}
        />
      )}
      <span
        className={cn("relative truncate text-[9.5px] font-medium", overdue ? "" : "text-bz-text")}
        style={overdue ? { color: DANGER_TEXT } : undefined}
      >
        {bar.width > 54 ? task.title : ""}
      </span>
    </button>
  );
}

function buildMonthTicks(start: string, totalDays: number, dayW: number) {
  const out: { label: string; width: number; days: number }[] = [];
  let cursor = start;
  let remaining = totalDays;
  while (remaining > 0) {
    const [y, m] = cursor.split("-").map(Number);
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const dayOfMonth = Number(cursor.split("-")[2]);
    const daysInTick = Math.min(remaining, dim - dayOfMonth + 1);
    out.push({
      label: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${y}`,
      width: daysInTick * dayW,
      days: daysInTick,
    });
    cursor = addDays(cursor, daysInTick);
    remaining -= daysInTick;
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// OVERVIEW
// ════════════════════════════════════════════════════════════════════════════

function Overview({
  project,
  tasks,
  entries,
  sections,
  stats,
  onOpenTask,
}: {
  project: ReturnType<typeof projectById> & {};
  tasks: Task[];
  entries: TimeEntry[];
  sections: Section[];
  stats: { total: number; done: number; pct: number; overdue: number; blocked: number; inProgress: number; milestones: Task[]; milestonesDone: number };
  onOpenTask: (id: string) => void;
}) {
  const p = project!;
  // Three different questions, three different numbers — none of them stored twice.
  const logged = projectLogged(tasks, entries, p.id);   // actual: summed timesheets
  const planned = projectPlanned(tasks, p.id);          // plan: summed task estimates
  const budget = p.budgetHours;                          // commercial: hours sold
  const hoursPct = budget ? Math.round((logged / budget) * 100) : 0;
  const overrun = logged > budget;
  const overPlanned = planned > budget;
  const missing = unestimatedTasks(tasks, p.id);

  const workload = React.useMemo(
    () =>
      p.memberIds
        .map((id) => {
          const mine = tasks.filter((t) => t.assigneeIds.includes(id) && !isDone(t));
          return {
            person: personById(id)!,
            open: mine.length,
            overdue: mine.filter((t) => dueBand(t.due) === "overdue").length,
            hours: mine.reduce((s, t) => s + (t.estimatedHours ?? 0), 0),
          };
        })
        .sort((a, b) => b.open - a.open),
    [p.memberIds, tasks],
  );

  const maxOpen = Math.max(1, ...workload.map((w) => w.open));

  const bySection = sections.map((s) => {
    const rows = tasks.filter((t) => t.sectionId === s.id);
    return { s, total: rows.length, done: rows.filter(isDone).length };
  });

  const attention = tasks
    .filter((t) => !isDone(t) && (dueBand(t.due) === "overdue" || isBlocked(tasks, t)))
    .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-4 lg:col-span-2">
        <section className={cn(CARD, "p-4 md:p-5")}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire text-bz-olive">
              <Sparkles size={13} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[13px] font-semibold text-bz-text">Latest status</h2>
                <Chip label={HEALTH_LABEL[p.health]} tone={HEALTH_TONE[p.health]} />
                <span className={cn("text-[11px] text-bz-text-soft", NUM)}>Sep 2, 2026 · {personById(p.ownerId)?.name}</span>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-bz-text-muted">{p.summary}</p>
            </div>
          </div>
        </section>

        <section className={cn(CARD, "overflow-hidden")}>
          <header className="flex items-center gap-2 border-b border-bz-line-soft px-4 py-2.5">
            <CalendarClock size={13} className="text-bz-text-muted" />
            <h2 className="text-[12.5px] font-semibold text-bz-text">Milestones</h2>
            <span className={cn("ml-auto text-[11px] text-bz-text-soft", NUM)}>
              {stats.milestonesDone} of {stats.milestones.length} reached
            </span>
          </header>
          <div className="divide-y divide-bz-line-soft">
            {stats.milestones.length === 0 && (
              <p className="px-4 py-6 text-center text-[11.5px] text-bz-text-soft">
                No milestone marked yet. Flag the dates a client actually signs against.
              </p>
            )}
            {stats.milestones.map((m) => {
              const done = isDone(m);
              const blockers = openBlockers(tasks, m);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onOpenTask(m.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-bz-paper-warm"
                >
                  <span
                    className={cn(
                      "size-2.5 shrink-0 rotate-45 rounded-[1px] border",
                      done ? "border-bz-leaf-deep bg-bz-leaf-deep" : "border-bz-olive bg-bz-fire",
                    )}
                  />
                  <span className={cn("min-w-0 flex-1 truncate text-[12.5px]", done ? "text-bz-text-soft line-through" : "font-medium text-bz-text")}>
                    {m.title}
                  </span>
                  {blockers.length > 0 && (
                    <span className="text-[10.5px]" style={{ color: DANGER_TEXT }}>
                      waiting on {blockers.length}
                    </span>
                  )}
                  <DueChip due={m.due} done={done} />
                </button>
              );
            })}
          </div>
        </section>

        <section className={cn(CARD, "overflow-hidden")}>
          <header className="flex items-center gap-2 border-b border-bz-line-soft px-4 py-2.5">
            <Lock size={13} className="text-bz-text-muted" />
            <h2 className="text-[12.5px] font-semibold text-bz-text">Needs attention</h2>
            <span className="ml-auto text-[11px] text-bz-text-soft">overdue or blocked</span>
          </header>
          {attention.length === 0 ? (
            <EmptyBlock icon={CheckCheck} title="Nothing is overdue or blocked" body="Every open task has a date it can still meet." />
          ) : (
            <div className="divide-y divide-bz-line-soft">
              {attention.map((t) => {
                const blockers = openBlockers(tasks, t);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onOpenTask(t.id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-bz-paper-warm"
                  >
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-bz-text">{t.title}</span>
                    {blockers.length > 0 && (
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-bz-sm px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: DANGER_BG, color: DANGER_TEXT }}
                      >
                        <Lock size={8} /> {blockers.length}
                      </span>
                    )}
                    <AvatarStack ids={t.assigneeIds} size={19} max={2} />
                    <DueChip due={t.due} />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Right rail */}
      <div className="space-y-4">
        <section className={cn(CARD, "p-4")}>
          <p className={LABEL}>Hours</p>

          {/* Sold vs planned vs spent. Three numbers that answer three different
              questions, so all three are shown rather than averaged into one. */}
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={cn("text-[20px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>
              {fmtH(logged)}
            </span>
            <span className="text-[11.5px] text-bz-text-soft">
              logged of {budget.toLocaleString()} sold
            </span>
          </div>
          <div className="mt-2.5">
            <MeterBar pct={hoursPct} fill={overrun ? "bg-[#C0413A]" : "bg-bz-leaf-deep"} />
          </div>
          <p
            className="mt-1.5 text-[10.5px]"
            style={overrun ? { color: DANGER_TEXT } : undefined}
          >
            {overrun
              ? `${fmtH(logged - budget)}h over the hours sold`
              : `${hoursPct}% consumed`}
            <span className="text-bz-text-soft"> · summed from timesheet entries</span>
          </p>

          <div className="mt-3 space-y-1.5 border-t border-bz-line-soft pt-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-bz-text-muted">Planned (sum of estimates)</span>
              <span
                className={cn("text-[11.5px] font-semibold text-bz-text", NUM)}
                style={overPlanned ? { color: DANGER_TEXT } : undefined}
              >
                {fmtH(planned)}
              </span>
            </div>
            {!overPlanned && (
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-bz-text-muted">Left to plan</span>
                <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
                  {fmtH(budget - planned)}
                </span>
              </div>
            )}
            {overPlanned && (
              <p className="text-[10.5px] leading-relaxed" style={{ color: DANGER_TEXT }}>
                The plan is {fmtH(planned - budget)}h larger than what was sold. Either the scope or the
                contract has to move.
              </p>
            )}
            {missing.length > 0 && (
              <p className="text-[10.5px] leading-relaxed text-bz-text-soft">
                {missing.length} task{missing.length > 1 ? "s have" : " has"} no estimate, so the planned
                figure is a floor, not a total.
              </p>
            )}
          </div>

          {p.contractValue > 0 && (
            <>
              <div className="mt-4 border-t border-bz-line-soft pt-3">
                <p className={LABEL}>Billing</p>
                <div className="mt-2">
                  <StackBar
                    segments={[
                      { value: p.billedValue, color: "bg-bz-leaf-deep" },
                      { value: Math.max(0, p.contractValue - p.billedValue), color: "bg-bz-line" },
                    ]}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-bz-text-muted">
                    Billed <span className={cn("font-semibold text-bz-text", NUM)}>Rs {money(p.billedValue)}</span>
                  </span>
                  <span className={cn("text-bz-text-soft", NUM)}>of Rs {money(p.contractValue)}</span>
                </div>
              </div>
            </>
          )}
        </section>

        <section className={cn(CARD, "overflow-hidden")}>
          <header className="flex items-center gap-2 border-b border-bz-line-soft px-4 py-2.5">
            <Users size={13} className="text-bz-text-muted" />
            <h2 className="text-[12.5px] font-semibold text-bz-text">Workload</h2>
            <span className="ml-auto text-[11px] text-bz-text-soft">open tasks</span>
          </header>
          <div className="space-y-2.5 p-4">
            {workload.map((w) => (
              <div key={w.person.id} className="flex items-center gap-2.5">
                <Avatar person={w.person} size={22} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[11.5px] font-medium text-bz-text">{w.person.name}</span>
                    <span className={cn("shrink-0 text-[11px] text-bz-text-muted", NUM)}>{w.open}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="flex-1">
                      <MeterBar
                        pct={(w.open / maxOpen) * 100}
                        height="h-1"
                        fill={w.overdue > 0 ? "bg-[#C0413A]" : "bg-bz-olive/60"}
                      />
                    </div>
                    {w.overdue > 0 && (
                      <span className="text-[9.5px] font-semibold" style={{ color: DANGER_TEXT }}>
                        {w.overdue} late
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={cn(CARD, "overflow-hidden")}>
          <header className="border-b border-bz-line-soft px-4 py-2.5">
            <h2 className="text-[12.5px] font-semibold text-bz-text">Sections</h2>
          </header>
          <div className="space-y-3 p-4">
            {bySection.map(({ s, total, done }) => (
              <div key={s.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[11.5px] text-bz-text">{s.name}</span>
                  <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>
                    {done}/{total}
                  </span>
                </div>
                <div className="mt-1">
                  <MeterBar pct={total ? (done / total) * 100 : 0} height="h-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BULK BAR  (docked in the shell's overlay slot, so it survives main scrolling)
// ════════════════════════════════════════════════════════════════════════════

function BulkBar({
  n,
  onClear,
  onComplete,
  onPriority,
  onSection,
  sections,
}: {
  n: number;
  onClear: () => void;
  onComplete: () => void;
  onPriority: (p: Priority) => void;
  onSection: (id: string) => void;
  sections: Section[];
}) {
  const pBtn = React.useRef<HTMLButtonElement>(null);
  const sBtn = React.useRef<HTMLButtonElement>(null);
  const [pOpen, setPOpen] = React.useState(false);
  const [sOpen, setSOpen] = React.useState(false);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[55] w-full max-w-[560px] -translate-x-1/2 px-4">
      <div className={cn("pointer-events-auto flex flex-wrap items-center gap-2 rounded-bz-lg border border-white/10 bg-bz-deep px-3 py-2 text-bz-text-on-dark", SHADOW)}>
        <span className={cn("rounded-bz-sm bg-bz-fire px-1.5 py-0.5 text-[11px] font-bold text-bz-olive", NUM)}>{n}</span>
        <span className="text-[12px] text-white/80">selected</span>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={onComplete} className="inline-flex h-7 items-center gap-1.5 rounded-bz-md bg-white/[0.08] px-2.5 text-[11.5px] font-medium hover:bg-white/[0.14]">
            <CheckCheck size={12} /> Complete
          </button>
          <button ref={sBtn} type="button" onClick={() => setSOpen(true)} className="inline-flex h-7 items-center gap-1.5 rounded-bz-md bg-white/[0.08] px-2.5 text-[11.5px] font-medium hover:bg-white/[0.14]">
            <Layers size={12} /> Move
          </button>
          <button ref={pBtn} type="button" onClick={() => setPOpen(true)} className="inline-flex h-7 items-center gap-1.5 rounded-bz-md bg-white/[0.08] px-2.5 text-[11.5px] font-medium hover:bg-white/[0.14]">
            Priority
          </button>
          <button type="button" onClick={onClear} className="ml-1 text-white/50 hover:text-white">
            <X size={13} />
          </button>
        </div>
      </div>

      <Popover open={sOpen} anchor={sBtn.current} onClose={() => setSOpen(false)} width={200}>
        <MenuLabel>Move to section</MenuLabel>
        {sections.map((s) => (
          <MenuItem key={s.id} onClick={() => { onSection(s.id); setSOpen(false); }}>
            {s.name}
          </MenuItem>
        ))}
      </Popover>
      <Popover open={pOpen} anchor={pBtn.current} onClose={() => setPOpen(false)} width={170}>
        <MenuLabel>Set priority</MenuLabel>
        {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
          <MenuItem key={p} onClick={() => { onPriority(p); setPOpen(false); }}>
            {PRIORITY_LABEL[p]}
          </MenuItem>
        ))}
      </Popover>
    </div>
  );
}
