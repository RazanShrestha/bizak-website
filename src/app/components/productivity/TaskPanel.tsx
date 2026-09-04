import * as React from "react";
import { Link } from "react-router";
import {
  X,
  Calendar,
  Flag,
  CircleDot,
  Lock,
  Unlock,
  Plus,
  Paperclip,
  Send,
  Clock3,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Layers,
  Trash2,
  CornerDownRight,
  ArrowRight,
} from "lucide-react";
import { cn } from "../ui/utils";
import {
  Task,
  TimeEntry,
  Section,
  Priority,
  TaskStatus,
  PRIORITY_LABEL,
  STATUS_LABEL,
  Avatar,
  AvatarStack,
  CompleteToggle,
  DueChip,
  LinkedDocChip,
  MeterBar,
  MilestoneMark,
  Popover,
  MenuItem,
  MenuLabel,
  PriorityMark,
  StatusChip,
  PEOPLE,
  personById,
  projectById,
  ACTIVITIES,
  activityById,
  billableEligible,
  canRemoveEntry,
  entryLockReason,
  useAttendanceSource,
  setAttendanceSource,
  AttendanceSource as AttendanceSourceType,
  ENTRY_STATUS_LABEL,
  entriesFor,
  loggedOn,
  loggedRollup,
  estimateOf,
  estimateIsRolledUp,
  unestimatedTasks,
  fmtH,
  Switch,
  MeterBar as Meter,
  childrenOf,
  openBlockers,
  blocking,
  isDone,
  subtaskProgress,
  fmtDate,
  TODAY,
  GHOST_BTN_SM,
  PRIMARY_BTN,
  LABEL,
  NUM,
  SHADOW,
  DANGER_BG,
  DANGER_TEXT,
  DANGER_DOT,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// TASK PANEL  the record, opened over whichever surface you came from
//
// It is a PANEL, not a page, because a task is almost never the reason you
// navigated — you were on a board or a list and needed one more fact. So it
// docks to the right, the surface behind it stays live, and every edit made
// here is written straight back to the shared task set (progress bars, blocked
// marks and column counts behind the panel recompute as you type).
//
// Order of the body is the order a real conversation about a task takes:
//   what it is → who/when → what stops it → what's under it → what was said.
// ════════════════════════════════════════════════════════════════════════════

type Comment = { id: number; authorId: string; when: string; body: string };

const SEED_COMMENTS: Record<string, Comment[]> = {
  "T-20": [
    { id: 1, authorId: "EMP-112", when: "Sep 1, 11:04", body: "Third pass done. 214 rows still rejected — all duplicate barcodes across outlets 3 and 7." },
    { id: 2, authorId: "EMP-104", when: "Sep 1, 14:22", body: "Can we take the outlet-3 barcode as canonical? Client confirmed outlet 7 was re-labelled last year." },
    { id: 3, authorId: "EMP-112", when: "Sep 2, 09:10", body: "Yes — de-dup subtask covers it. Re-run is queued behind it." },
  ],
  "T-12": [
    { id: 1, authorId: "EMP-101", when: "Aug 29, 16:41", body: "Second approver should be the outlet manager, not the regional head — otherwise every Rs 200k PO waits on one person." },
    { id: 2, authorId: "EMP-104", when: "Aug 30, 10:02", body: "Agreed. Changing the transition rule now." },
  ],
};

export function TaskPanel({
  task,
  tasks,
  sections,
  entries,
  onAddEntry,
  onDeleteEntry,
  onPatch,
  onToggleComplete,
  onAddSubtask,
  onOpenTask,
  onClose,
}: {
  task: Task;
  tasks: Task[];
  sections: Section[];
  entries: TimeEntry[];
  onAddEntry: (e: Omit<TimeEntry, "id">) => void;
  onDeleteEntry: (id: string) => void;
  onPatch: (id: string, patch: Partial<Task>) => void;
  onToggleComplete: (id: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onOpenTask: (id: string) => void;
  onClose: () => void;
}) {
  const project = projectById(task.projectId);
  const section = sections.find((s) => s.id === task.sectionId);
  const kids = childrenOf(tasks, task.id);
  const prog = subtaskProgress(tasks, task.id);
  const blockers = openBlockers(tasks, task);
  const allBlockers = task.blockedBy.map((id) => tasks.find((t) => t.id === id)).filter((x): x is Task => !!x);
  const blocks = blocking(tasks, task.id);
  const parent = task.parentId ? tasks.find((t) => t.id === task.parentId) : null;

  const [comments, setComments] = React.useState<Comment[]>(SEED_COMMENTS[task.id] ?? []);
  const [draft, setDraft] = React.useState("");
  const [newSub, setNewSub] = React.useState("");
  const [addingSub, setAddingSub] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Only when nothing is being typed into — Esc inside a field means
      // "abandon this value", not "throw the record away".
      const el = document.activeElement;
      const typing = el instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(el.tagName);
      if (e.key === "Escape" && !typing) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  React.useEffect(() => {
    setComments(SEED_COMMENTS[task.id] ?? []);
    setDraft("");
    setNewSub("");
    setAddingSub(false);
    setTagQuery("");
    setTagOpen(false);
    setShowEntries(false);
    setLogging(false);
  }, [task.id]);

  const assigneeBtn = React.useRef<HTMLButtonElement>(null);
  const [assigneeOpen, setAssigneeOpen] = React.useState(false);
  const priorityBtn = React.useRef<HTMLButtonElement>(null);
  const [priorityOpen, setPriorityOpen] = React.useState(false);
  const statusBtn = React.useRef<HTMLButtonElement>(null);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const sectionBtn = React.useRef<HTMLButtonElement>(null);
  const [sectionOpen, setSectionOpen] = React.useState(false);
  const depBtn = React.useRef<HTMLButtonElement>(null);
  const [depOpen, setDepOpen] = React.useState(false);
  const [showEntries, setShowEntries] = React.useState(false);
  const [logging, setLogging] = React.useState(false);
  const tagBtn = React.useRef<HTMLButtonElement>(null);
  const [tagOpen, setTagOpen] = React.useState(false);
  const [tagQuery, setTagQuery] = React.useState("");

  /** Every tag already in use, so the picker suggests rather than invents. */
  const allTags = React.useMemo(
    () => Array.from(new Set(tasks.flatMap((t) => t.tags))).sort(),
    [tasks],
  );
  const typed = tagQuery.trim().toLowerCase().replace(/\s+/g, "-");
  const suggestions = allTags.filter((t) => !task.tags.includes(t) && t.includes(typed));

  const addTag = (raw: string) => {
    const v = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!v || task.tags.includes(v)) return;
    onPatch(task.id, { tags: [...task.tags, v] });
    setTagQuery("");
    setTagOpen(false);
  };
  const removeTag = (v: string) => onPatch(task.id, { tags: task.tags.filter((x) => x !== v) });

  const toggleAssignee = (id: string) => {
    const has = task.assigneeIds.includes(id);
    onPatch(task.id, {
      assigneeIds: has ? task.assigneeIds.filter((x) => x !== id) : [...task.assigneeIds, id],
    });
  };

  const done = isDone(task);

  // Hours are DERIVED, in both directions: logged is summed from the entry list
  // below, and a parent's estimate is its children's, never its own on top.
  const rolledUp = estimateIsRolledUp(tasks, task.id);
  const estimate = estimateOf(tasks, task.id);
  const ownLogged = loggedOn(entries, task.id);
  const totalLogged = loggedRollup(tasks, entries, task.id);
  const logged = rolledUp ? totalLogged : ownLogged;
  const hoursPct = estimate ? Math.round((logged / estimate) * 100) : 0;
  const overrun = estimate !== null && logged > estimate;
  const myEntries = entriesFor(entries, task.id);
  const billing = billableEligible(task.projectId);
  // In timesheet mode the hours below decide pay, so this panel reads them only.
  const source = useAttendanceSource();
  const readOnlyHours = source === "timesheet";
  const unestimatedKids = kids.filter((k) => k.estimatedHours == null).length;

  const depCandidates = tasks.filter(
    (t) => t.id !== task.id && t.parentId === null && !task.blockedBy.includes(t.id) && t.projectId === task.projectId,
  );

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-bz-olive-dark/25" onClick={onClose} />

      <aside
        className={cn(
          "relative flex h-full w-full max-w-[520px] flex-col border-l border-bz-line bg-bz-surface",
          SHADOW,
        )}
      >
        {/* ── Head ───────────────────────────────────────────────────────── */}
        <header className="shrink-0 border-b border-bz-line-soft px-5 py-4">
          <div className="flex items-center gap-2">
            <span className={cn("text-[11px] font-semibold text-bz-text-soft", NUM)}>{task.docNo}</span>
            {task.isMilestone && (
              <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-fire/[0.28] px-1.5 py-0.5 text-[10.5px] font-semibold text-bz-text">
                <MilestoneMark size={10} /> Milestone
              </span>
            )}
            {blockers.length > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-bz-sm px-1.5 py-0.5 text-[10.5px] font-semibold"
                style={{ background: DANGER_BG, color: DANGER_TEXT }}
              >
                <Lock size={9} /> Blocked
              </span>
            )}
            <button type="button" onClick={onClose} className="ml-auto text-bz-text-soft hover:text-bz-text">
              <X size={15} />
            </button>
          </div>

          {parent && (
            <button
              type="button"
              onClick={() => onOpenTask(parent.id)}
              className="mt-2 inline-flex items-center gap-1 text-[11.5px] text-bz-text-muted hover:text-bz-text"
            >
              <CornerDownRight size={11} /> Subtask of <span className="font-medium">{parent.title}</span>
            </button>
          )}

          <div className="mt-2.5 flex items-start gap-2.5">
            <div className="pt-0.5">
              <CompleteToggle
                done={done}
                blocked={blockers.length > 0}
                size={20}
                onToggle={() => onToggleComplete(task.id)}
              />
            </div>
            <input
              value={task.title}
              onChange={(e) => onPatch(task.id, { title: e.target.value })}
              className={cn(
                "min-w-0 flex-1 border-0 bg-transparent p-0 text-[17px] font-semibold leading-snug tracking-tight text-bz-text outline-none",
                done && "text-bz-text-soft line-through",
              )}
            />
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11.5px] text-bz-text-muted">{project?.name}</span>
            <span className="hidden text-bz-line sm:inline">·</span>
            <button
              ref={sectionBtn}
              type="button"
              onClick={() => setSectionOpen(true)}
              className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[11px] font-medium text-bz-text-muted hover:text-bz-text"
            >
              <Layers size={10} /> {section?.name ?? "No section"}
            </button>
            {task.linkedDoc && <LinkedDocChip doc={task.linkedDoc} />}
          </div>
          <Popover open={sectionOpen} anchor={sectionBtn.current} onClose={() => setSectionOpen(false)} width={210}>
            <MenuLabel>Move to section</MenuLabel>
            {sections.map((s) => (
              <MenuItem
                key={s.id}
                active={s.id === task.sectionId}
                onClick={() => {
                  onPatch(task.id, { sectionId: s.id });
                  setSectionOpen(false);
                }}
              >
                {s.name}
              </MenuItem>
            ))}
          </Popover>
        </header>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Fields */}
          <div className="grid grid-cols-1 gap-px bg-bz-line-soft sm:grid-cols-2">
            <Field label="Assignees">
              <button
                ref={assigneeBtn}
                type="button"
                onClick={() => setAssigneeOpen(true)}
                className="flex w-full items-center gap-2 rounded-bz-sm px-1 py-0.5 text-left hover:bg-bz-paper-warm"
              >
                <AvatarStack ids={task.assigneeIds} size={20} />
                <span className="truncate text-[12px] text-bz-text">
                  {task.assigneeIds.length === 0
                    ? "Unassigned"
                    : task.assigneeIds.length === 1
                      ? personById(task.assigneeIds[0])?.name
                      : `${personById(task.assigneeIds[0])?.name} +${task.assigneeIds.length - 1}`}
                </span>
              </button>
              <Popover open={assigneeOpen} anchor={assigneeBtn.current} onClose={() => setAssigneeOpen(false)} width={250}>
                <MenuLabel>Assignees · first is primary</MenuLabel>
                {PEOPLE.map((p) => (
                  <MenuItem key={p.id} active={task.assigneeIds.includes(p.id)} onClick={() => toggleAssignee(p.id)}>
                    <span className="flex items-center gap-2">
                      <Avatar person={p} size={18} />
                      <span className="truncate">{p.name}</span>
                    </span>
                  </MenuItem>
                ))}
              </Popover>
            </Field>

            <Field label="Due date">
              <div className="flex items-center gap-2 px-1 py-0.5">
                <Calendar size={12} className="shrink-0 text-bz-text-soft" />
                <input
                  type="date"
                  value={task.due ?? ""}
                  onChange={(e) => onPatch(task.id, { due: e.target.value || null })}
                  className={cn("min-w-0 flex-1 border-0 bg-transparent p-0 text-[12px] text-bz-text outline-none", NUM)}
                />
              </div>
              <div className="mt-1 px-1">
                <DueChip due={task.due} done={done} />
              </div>
            </Field>

            <Field label="Status">
              <button
                ref={statusBtn}
                type="button"
                onClick={() => setStatusOpen(true)}
                className="flex w-full items-center gap-2 rounded-bz-sm px-1 py-0.5 text-left hover:bg-bz-paper-warm"
              >
                <StatusChip status={task.status} />
              </button>
              <Popover open={statusOpen} anchor={statusBtn.current} onClose={() => setStatusOpen(false)} width={190}>
                {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
                  <MenuItem
                    key={s}
                    icon={CircleDot}
                    active={s === task.status}
                    onClick={() => {
                      onPatch(task.id, { status: s });
                      setStatusOpen(false);
                    }}
                  >
                    {STATUS_LABEL[s]}
                  </MenuItem>
                ))}
              </Popover>
            </Field>

            <Field label="Priority">
              <button
                ref={priorityBtn}
                type="button"
                onClick={() => setPriorityOpen(true)}
                className="flex w-full items-center rounded-bz-sm px-1 py-0.5 text-left hover:bg-bz-paper-warm"
              >
                <PriorityMark p={task.priority} />
              </button>
              <Popover open={priorityOpen} anchor={priorityBtn.current} onClose={() => setPriorityOpen(false)} width={180}>
                {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                  <MenuItem
                    key={p}
                    icon={Flag}
                    active={p === task.priority}
                    onClick={() => {
                      onPatch(task.id, { priority: p });
                      setPriorityOpen(false);
                    }}
                  >
                    {PRIORITY_LABEL[p]}
                  </MenuItem>
                ))}
              </Popover>
            </Field>

            <Field label="Start date">
              <div className="flex items-center gap-2 px-1 py-0.5">
                <Calendar size={12} className="text-bz-text-soft" />
                <input
                  type="date"
                  value={task.start ?? ""}
                  onChange={(e) => onPatch(task.id, { start: e.target.value || null })}
                  className={cn("w-full border-0 bg-transparent p-0 text-[12px] text-bz-text outline-none", NUM)}
                />
              </div>
            </Field>

            <Field label="Billable by default">
              <div className={cn("flex items-start gap-2 px-1 py-0.5", !billing.ok && "opacity-55")}>
                <div className="pt-0.5">
                  <Switch
                    checked={billing.ok && (task.billable ?? false)}
                    onChange={(v) => billing.ok && onPatch(task.id, { billable: v })}
                    label="Billable"
                  />
                </div>
                <span className="text-[11.5px] leading-relaxed text-bz-text-muted">
                  {!billing.ok
                    ? billing.why
                    : task.billable
                      ? `Hours default to chargeable — ${billing.customer}`
                      : "Hours default to internal"}
                </span>
              </div>
            </Field>
          </div>

          {/* Dependencies */}
          <Block
            title="Dependencies"
            right={
              <button ref={depBtn} type="button" className={GHOST_BTN_SM} onClick={() => setDepOpen(true)}>
                <Plus size={11} /> Add blocker
              </button>
            }
          >
            <Popover open={depOpen} anchor={depBtn.current} onClose={() => setDepOpen(false)} width={300} align="right">
              <MenuLabel>This task is blocked by…</MenuLabel>
              <div className="max-h-[260px] overflow-y-auto">
                {depCandidates.length === 0 && (
                  <p className="px-2 py-3 text-[11.5px] text-bz-text-soft">Nothing else in this project to depend on.</p>
                )}
                {depCandidates.map((c) => (
                  <MenuItem
                    key={c.id}
                    onClick={() => {
                      onPatch(task.id, { blockedBy: [...task.blockedBy, c.id] });
                      setDepOpen(false);
                    }}
                  >
                    {c.title}
                  </MenuItem>
                ))}
              </div>
            </Popover>

            {allBlockers.length === 0 && blocks.length === 0 && (
              <p className="text-[11.5px] text-bz-text-soft">
                Nothing gates this task, and nothing waits on it.
              </p>
            )}

            {allBlockers.length > 0 && (
              <div className="space-y-1.5">
                <p className={LABEL}>Blocked by</p>
                {allBlockers.map((b) => (
                  <DepRow
                    key={b.id}
                    task={b}
                    onOpen={() => onOpenTask(b.id)}
                    onRemove={() => onPatch(task.id, { blockedBy: task.blockedBy.filter((x) => x !== b.id) })}
                  />
                ))}
                {blockers.length === 0 && (
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-bz-text-muted">
                    <Unlock size={11} className="text-bz-leaf-deep" /> All blockers are complete — this task is free to start.
                  </p>
                )}
              </div>
            )}

            {blocks.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className={LABEL}>Blocking</p>
                {blocks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onOpenTask(b.id)}
                    className="flex w-full items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-2.5 py-1.5 text-left hover:border-bz-line"
                  >
                    <ArrowRight size={11} className="shrink-0 text-bz-text-soft" />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">{b.title}</span>
                    <DueChip due={b.due} done={isDone(b)} />
                  </button>
                ))}
              </div>
            )}
          </Block>

          {/* Time — the estimate is typed here; the actual is summed, never typed */}
          <Block
            title="Time"
            right={
              readOnlyHours ? (
                <Link to="/design/timesheet/entry" className={GHOST_BTN_SM}>
                  <Clock3 size={11} /> Open timesheet <ArrowUpRight size={11} />
                </Link>
              ) : (
                <button type="button" className={GHOST_BTN_SM} onClick={() => setLogging((v) => !v)}>
                  <Clock3 size={11} /> Log time
                </button>
              )
            }
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={cn(LABEL, "mb-1.5")}>Estimate</p>
                {rolledUp ? (
                  <>
                    <p className={cn("text-[15px] font-semibold leading-none text-bz-text", NUM)}>
                      {estimate === null ? "—" : fmtH(estimate) + " h"}
                    </p>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-bz-text-soft">
                      Summed from {kids.length} subtask{kids.length > 1 ? "s" : ""} — estimate those, not this.
                      {unestimatedKids > 0 && (
                        <span style={{ color: DANGER_TEXT }}> {unestimatedKids} still unestimated.</span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <input
                        type="number"
                        step="any"
                        value={task.estimatedHours ?? ""}
                        onChange={(e) =>
                          onPatch(task.id, {
                            estimatedHours: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        placeholder="—"
                        className={cn(
                          "w-[74px] rounded-bz-md border border-bz-line bg-bz-paper px-2 py-1 text-[15px] font-semibold text-bz-text outline-none placeholder:font-normal placeholder:text-bz-text-soft focus:border-bz-text-muted",
                          NUM,
                        )}
                      />
                      <span className="text-[11px] text-bz-text-soft">hours</span>
                    </div>
                    <p className="mt-1 text-[10.5px] text-bz-text-soft">What you think it takes.</p>
                  </>
                )}
              </div>

              <div>
                <p className={cn(LABEL, "mb-1.5")}>Logged</p>
                <p className={cn("text-[15px] font-semibold leading-none text-bz-text", NUM)}>
                  {logged === 0 ? "—" : fmtH(logged) + " h"}
                </p>
                <p className="mt-1 text-[10.5px] text-bz-text-soft">
                  {myEntries.length === 0 && !rolledUp
                    ? "No time booked yet."
                    : rolledUp
                      ? "From the subtasks' timesheet entries."
                      : "From timesheet entries."}
                </p>
              </div>
            </div>

            {estimate !== null && (
              <div className="mt-3">
                <Meter pct={hoursPct} fill={overrun ? "bg-[#C0413A]" : "bg-bz-leaf-deep"} />
                <p className="mt-1.5 text-[10.5px]" style={overrun ? { color: DANGER_TEXT } : undefined}>
                  {overrun
                    ? fmtH(logged - estimate) + "h over estimate"
                    : hoursPct + "% consumed · " + fmtH(estimate - logged) + "h left"}
                </p>
              </div>
            )}

            {/* A parent's own bookings are real work too — but they are not the
                subtree total, so both are stated rather than silently merged. */}
            {rolledUp && ownLogged > 0 && (
              <p className="mt-2 text-[11px] text-bz-text-muted">
                <span className={NUM}>{fmtH(ownLogged)}h</span> of that was booked against this task
                directly; the rest against its subtasks.
              </p>
            )}

            {myEntries.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowEntries((v) => !v)}
                  className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"
                >
                  {showEntries ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {myEntries.length} timesheet {myEntries.length === 1 ? "entry" : "entries"}
                </button>

                {showEntries && (
                  <div className="mt-2 overflow-hidden rounded-bz-md border border-bz-line-soft">
                    {myEntries.map((e) => (
                      <div
                        key={e.id}
                        className="group/entry flex items-center gap-2.5 border-b border-bz-line-soft bg-bz-surface px-2.5 py-1.5 last:border-0"
                      >
                        <Avatar person={personById(e.personId)} size={18} />
                        <span className={cn("w-[52px] shrink-0 text-[11px] text-bz-text-muted", NUM)}>
                          {fmtDate(e.date).slice(0, 6)}
                        </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-[11.5px]",
                            e.activityId ? "text-bz-text" : "italic text-bz-text-soft",
                          )}
                        >
                          {e.activityId ? activityById(e.activityId)?.name : "Internal time"}
                        </span>
                        {e.status !== "open" && (
                          <span
                            className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted"
                            title={entryLockReason(e, source) ?? undefined}
                          >
                            {ENTRY_STATUS_LABEL[e.status]}
                          </span>
                        )}
                        {e.billable && (
                          <span className="shrink-0 rounded-bz-sm bg-bz-fire/[0.22] px-1.5 py-0.5 text-[10px] font-medium text-bz-text">
                            Billable
                          </span>
                        )}
                        <span className={cn("w-[42px] shrink-0 text-right text-[11.5px] font-semibold text-bz-text", NUM)}>
                          {fmtH(e.hours)}
                        </span>
                        <span className="flex w-4 shrink-0 justify-end">
                          {canRemoveEntry(e, source) ? (
                            <button
                              type="button"
                              onClick={() => onDeleteEntry(e.id)}
                              aria-label="Remove this entry"
                              title="Remove this entry"
                              className="text-bz-text-soft opacity-0 transition-opacity hover:opacity-100 group-hover/entry:opacity-60"
                            >
                              <Trash2 size={11} />
                            </button>
                          ) : (
                            // The reason travels with the icon — a control that
                            // cannot say why it is disabled is just a dead end.
                            <span title={entryLockReason(e, source) ?? undefined} className="text-bz-line">
                              <Lock size={10} />
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {logging && !readOnlyHours && (
              <LogTimeForm
                taskId={task.id}
                projectId={task.projectId}
                defaultPersonId={task.assigneeIds[0] ?? "EMP-101"}
                defaultBillable={task.billable ?? false}
                onCancel={() => setLogging(false)}
                onSubmit={(e) => {
                  onAddEntry(e);
                  setLogging(false);
                  setShowEntries(true);
                }}
              />
            )}

            <div className="mt-3 border-t border-bz-line-soft pt-2.5">
              <p className="text-[10.5px] leading-relaxed text-bz-text-soft">
                Logged hours are never typed onto a task — they are the sum of the timesheet lines
                booked against it.{" "}
                {readOnlyHours ? (
                  <>
                    This tenant runs <strong className="font-semibold text-bz-text-muted">timesheet</strong>{" "}
                    attendance: nobody punches, so these hours are what the attendance run reads and what
                    payroll pays. They are entered and corrected on the timesheet, where the period lock
                    and approvals live — never from a task.
                  </>
                ) : (
                  <>
                    This tenant runs <strong className="font-semibold text-bz-text-muted">punch</strong>{" "}
                    attendance, so the timesheet costs and bills work but does not decide pay — logging one
                    line from here is safe. An <strong className="font-semibold text-bz-text-muted">open</strong>{" "}
                    line can still be removed; once approved it feeds costing, and once invoiced the
                    customer has been charged for it.
                  </>
                )}
              </p>
              <ModeSwitch source={source} />
            </div>
          </Block>

          {/* Subtasks */}
          <Block
            title={
              <span className="inline-flex items-center gap-2">
                Subtasks
                {prog && (
                  <span className={cn("text-[11px] font-normal text-bz-text-soft", NUM)}>
                    {prog.done}/{prog.total}
                  </span>
                )}
              </span>
            }
            right={
              <button type="button" className={GHOST_BTN_SM} onClick={() => setAddingSub(true)}>
                <Plus size={11} /> Add subtask
              </button>
            }
          >
            {prog && (
              <div className="mb-2.5">
                <MeterBar pct={prog.pct} />
              </div>
            )}
            {kids.length === 0 && !addingSub && (
              <p className="text-[11.5px] text-bz-text-soft">No subtasks. Break this down when it needs more than one person or one day.</p>
            )}
            <div className="space-y-0.5">
              {kids.map((k) => {
                const kBlocked = openBlockers(tasks, k).length > 0;
                return (
                  <div key={k.id} className="group flex items-center gap-2.5 rounded-bz-md px-1.5 py-1.5 hover:bg-bz-paper-warm">
                    <CompleteToggle done={isDone(k)} blocked={kBlocked} size={15} onToggle={() => onToggleComplete(k.id)} />
                    <button
                      type="button"
                      onClick={() => onOpenTask(k.id)}
                      className={cn(
                        "min-w-0 flex-1 truncate text-left text-[12px]",
                        isDone(k) ? "text-bz-text-soft line-through" : "text-bz-text",
                      )}
                    >
                      {k.title}
                    </button>
                    {kBlocked && <Lock size={10} style={{ color: DANGER_TEXT }} />}
                    <DueChip due={k.due} done={isDone(k)} />
                    <AvatarStack ids={k.assigneeIds} size={18} max={2} />
                  </div>
                );
              })}
            </div>
            {addingSub && (
              <form
                className="mt-2 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newSub.trim()) return;
                  onAddSubtask(task.id, newSub.trim());
                  setNewSub("");
                }}
              >
                <input
                  autoFocus
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  onBlur={() => !newSub && setAddingSub(false)}
                  placeholder="Subtask name…"
                  className="h-8 min-w-0 flex-1 rounded-bz-md border border-bz-line bg-bz-paper px-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
                />
                <button type="submit" className={GHOST_BTN_SM} disabled={!newSub.trim()}>
                  Add
                </button>
              </form>
            )}
          </Block>

          {/* Notes / tags / attachments */}
          <Block title="Detail">
            <textarea
              value={task.note ?? ""}
              onChange={(e) => onPatch(task.id, { note: e.target.value })}
              placeholder="What does done look like? Add the constraint the code can't show."
              rows={3}
              className="w-full resize-none rounded-bz-md border border-bz-line bg-bz-paper px-3 py-2 text-[12px] leading-relaxed text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
            />
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {task.tags.map((t) => (
                <span
                  key={t}
                  className="group/tag inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove tag ${t}`}
                    className="text-bz-text-soft opacity-0 transition-opacity hover:text-bz-text group-hover/tag:opacity-100"
                  >
                    <X size={9} />
                  </button>
                </span>
              ))}
              <button
                ref={tagBtn}
                type="button"
                onClick={() => setTagOpen(true)}
                className="rounded-bz-sm border border-dashed border-bz-line px-1.5 py-0.5 text-[10.5px] text-bz-text-soft hover:border-bz-text-muted hover:text-bz-text"
              >
                + Tag
              </button>
            </div>

            <Popover open={tagOpen} anchor={tagBtn.current} onClose={() => setTagOpen(false)} width={240}>
              <div className="p-1">
                <input
                  autoFocus
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagQuery);
                    }
                    if (e.key === "Escape") setTagOpen(false);
                  }}
                  placeholder="Find or create a tag…"
                  className="h-8 w-full rounded-bz-md border border-bz-line bg-bz-paper px-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
                />
              </div>
              {suggestions.length > 0 && <MenuLabel>Existing</MenuLabel>}
              <div className="max-h-[180px] overflow-y-auto">
                {suggestions.map((t) => (
                  <MenuItem key={t} onClick={() => addTag(t)}>
                    {t}
                  </MenuItem>
                ))}
              </div>
              {typed && !allTags.includes(typed) && (
                <div className="border-t border-bz-line-soft pt-1">
                  <MenuItem icon={Plus} onClick={() => addTag(tagQuery)}>
                    Create “{typed}”
                  </MenuItem>
                </div>
              )}
              {!typed && suggestions.length === 0 && (
                <p className="px-2 py-2 text-[11.5px] text-bz-text-soft">
                  Every tag in this project is already on this task.
                </p>
              )}
            </Popover>
            <button type="button" className={cn(GHOST_BTN_SM, "mt-2.5")}>
              <Paperclip size={11} /> {task.attachments > 0 ? `${task.attachments} attachments` : "Attach a file"}
            </button>
          </Block>

          {/* Comments */}
          <Block title={`Comments${comments.length ? ` · ${comments.length}` : ""}`}>
            {comments.length === 0 && (
              <p className="text-[11.5px] text-bz-text-soft">No comments yet. The first one usually explains why the date moved.</p>
            )}
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar person={personById(c.authorId)} size={24} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-bz-text">{personById(c.authorId)?.name}</span>
                      <span className={cn("text-[10.5px] text-bz-text-soft", NUM)}>{c.when}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-bz-text-muted">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Block>

          <div className="px-5 pb-6 pt-1">
            <p className={cn(LABEL, "mb-2")}>Activity</p>
            <ul className="space-y-1.5 text-[11.5px] text-bz-text-soft">
              <li>Created {task.start ? fmtDate(task.start) : "Aug 18, 2026"} by {personById("EMP-104")?.name}</li>
              {task.estimatedHours && <li>Estimate set to {task.estimatedHours}h</li>}
              {task.blockedBy.length > 0 && <li>{task.blockedBy.length} dependency added</li>}
            </ul>
          </div>
        </div>

        {/* ── Composer (docked) ──────────────────────────────────────────── */}
        <footer className="shrink-0 border-t border-bz-line-soft bg-bz-paper-warm px-5 py-3">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              setComments((c) => [...c, { id: Date.now(), authorId: "EMP-101", when: "Just now", body: draft.trim() }]);
              setDraft("");
            }}
          >
            <Avatar person={personById("EMP-101")} size={26} />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Comment — @mention a teammate to notify them"
              rows={1}
              className="min-h-[36px] flex-1 resize-none rounded-bz-md border border-bz-line bg-bz-surface px-3 py-2 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
            />
            <button type="submit" className={PRIMARY_BTN} disabled={!draft.trim()}>
              <Send size={12} /> Send
            </button>
          </form>
        </footer>
      </aside>
    </div>
  );
}

// ── Panel atoms ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-bz-surface px-5 py-3">
      <p className={cn(LABEL, "mb-1.5")}>{label}</p>
      {children}
    </div>
  );
}

function Block({
  title,
  right,
  children,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-bz-line-soft px-5 py-4">
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="text-[12px] font-semibold text-bz-text">{title}</h3>
        <div className="ml-auto">{right}</div>
      </div>
      {children}
    </section>
  );
}

/**
 * A demo affordance, not a product control — GLOBAL_DEFAULTS.ATTENDANCE_SOURCE
 * is a tenant setting on the Preference screen. It sits here because here is
 * where its consequence is visible.
 */
function ModeSwitch({ source }: { source: AttendanceSourceType }) {
  return (
    <p className="mt-2 text-[10.5px] text-bz-text-soft">
      <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 font-medium text-bz-text-muted">
        ATTENDANCE_SOURCE = {source === "timesheet" ? "Timesheet" : "Attendance"}
      </span>{" "}
      <button
        type="button"
        onClick={() => setAttendanceSource(source === "timesheet" ? "attendance" : "timesheet")}
        className="font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text"
      >
        switch to {source === "timesheet" ? "punch" : "timesheet"} attendance
      </button>
    </p>
  );
}

function LogTimeForm({
  taskId,
  projectId,
  defaultPersonId,
  defaultBillable,
  onCancel,
  onSubmit,
}: {
  taskId: string;
  projectId: string;
  defaultPersonId: string;
  defaultBillable: boolean;
  onCancel: () => void;
  onSubmit: (e: Omit<TimeEntry, "id">) => void;
}) {
  const billing = billableEligible(projectId);
  const [date, setDate] = React.useState(TODAY);
  const [hours, setHours] = React.useState("");
  const [activityId, setActivityId] = React.useState<string>("");
  const [billable, setBillable] = React.useState(billing.ok && defaultBillable);

  const n = Number(hours);
  const hoursOk = hours !== "" && !Number.isNaN(n) && n > 0 && n <= 24;
  // Rule: the invoice line's service item IS the activity's item, so a billable
  // hour without one could never be invoiced. Internal time needs no activity.
  const needsActivity = billable && !activityId;
  const valid = hoursOk && !needsActivity;

  return (
    <form
      className="mt-3 rounded-bz-md border border-bz-line bg-bz-paper-warm p-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({
          taskId,
          personId: defaultPersonId,
          date,
          // Rounded to the organisation's increment, the way the timesheet does.
          hours: Math.round(n * 4) / 4,
          activityId: activityId || null,
          billable,
          status: "open",
        });
      }}
    >
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[120px] flex-1">
          <span className={cn(LABEL, "mb-1 block")}>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={cn(
              "h-8 w-full rounded-bz-md border border-bz-line bg-bz-surface px-2 text-[12px] text-bz-text outline-none focus:border-bz-text-muted",
              NUM,
            )}
          />
        </label>
        <label className="w-[80px]">
          <span className={cn(LABEL, "mb-1 block")}>Hours</span>
          <input
            autoFocus
            type="number"
            step="any"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="0.00"
            className={cn(
              "h-8 w-full rounded-bz-md border border-bz-line bg-bz-surface px-2 text-[12px] text-bz-text outline-none focus:border-bz-text-muted",
              NUM,
            )}
          />
        </label>
        <label className="min-w-[130px] flex-1">
          <span className={cn(LABEL, "mb-1 block")}>
            Activity{billable && <span style={{ color: DANGER_TEXT }}> *</span>}
          </span>
          <select
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            className={cn(
              "h-8 w-full rounded-bz-md border bg-bz-surface px-2 text-[12px] text-bz-text outline-none focus:border-bz-text-muted",
              needsActivity ? "" : "border-bz-line",
            )}
            style={needsActivity ? { borderColor: DANGER_DOT } : undefined}
          >
            <option value="">— none (internal time)</option>
            {ACTIVITIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Billable is a property of the HOUR, not of the activity. */}
      <div className={cn("mt-2.5 flex items-start gap-2", !billing.ok && "opacity-55")}>
        <div className="pt-0.5">
          <Switch
            checked={billable}
            onChange={(v) => billing.ok && setBillable(v)}
            label="Billable"
          />
        </div>
        <span className="text-[11px] leading-relaxed text-bz-text-muted">
          {!billing.ok
            ? billing.why
            : billable
              ? `Chargeable to ${billing.customer} — this hour can become an invoice line.`
              : "Internal time — worked and costed, but never invoiced."}
        </span>
      </div>

      {needsActivity && (
        <p className="mt-2 text-[10.5px] leading-relaxed" style={{ color: DANGER_TEXT }}>
          A billable hour needs an activity — the invoice line's service item comes from it, so
          without one this could never be billed.
        </p>
      )}
      <div className="mt-2.5 flex items-center gap-2">
        <p className="flex-1 text-[10.5px] text-bz-text-soft">
          {valid && Math.round(n * 4) / 4 !== n
            ? `Rounds to ${(Math.round(n * 4) / 4).toFixed(2)}h on save, like the timesheet.`
            : "Rounded to the nearest 0.25h on save, like the timesheet."}
        </p>
        <button type="button" className={GHOST_BTN_SM} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={cn(PRIMARY_BTN, "h-8")} disabled={!valid}>
          Log
        </button>
      </div>
    </form>
  );
}

function DepRow({ task, onOpen, onRemove }: { task: Task; onOpen: () => void; onRemove: () => void }) {
  const done = isDone(task);
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-bz-md border px-2.5 py-1.5",
        done ? "border-bz-line-soft bg-bz-surface" : "border-transparent",
      )}
      style={done ? undefined : { background: DANGER_BG }}
    >
      {done ? (
        <Unlock size={11} className="shrink-0 text-bz-leaf-deep" />
      ) : (
        <Lock size={11} className="shrink-0" style={{ color: DANGER_TEXT }} />
      )}
      <button
        type="button"
        onClick={onOpen}
        className={cn("min-w-0 flex-1 truncate text-left text-[12px]", done ? "text-bz-text-soft line-through" : "text-bz-text")}
      >
        {task.title}
      </button>
      <DueChip due={task.due} done={done} />
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-bz-text-soft opacity-0 transition-opacity hover:text-bz-text group-hover:opacity-100"
        title="Remove dependency"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

export { Clock3 };
