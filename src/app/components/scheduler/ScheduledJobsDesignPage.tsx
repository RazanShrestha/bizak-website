import * as React from "react";
import {
  AlarmClock,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Copy,
  CopyPlus,
  Ellipsis,
  Globe,
  Loader2,
  Pause,
  Play,
  Plus,
  Search,
  Square,
  SquareTerminal,
  Timer,
  Trash2,
  Webhook,
  X,
} from "lucide-react";
import { cn } from "../ui/utils";
import { AppFrame } from "../sales/AppFrame";
import {
  Avatar,
  BTN,
  CARD,
  Chip,
  Clear,
  CountMark,
  DANGER_BTN,
  Dialog,
  Empty,
  Field,
  GHOST,
  GHOST_SM,
  ICON_BTN,
  ICON_BTN_SM,
  INPUT_SM,
  Kbd,
  LABEL,
  MenuItem,
  MenuSep,
  NUM,
  NumberField,
  Popover,
  SearchField,
  Segmented,
  Select,
  Stat,
  Statline,
  Switch,
  TEXTAREA,
  ToastHost,
  useToast,
} from "../sales/bzw";
import { ME, PEOPLE, personById } from "../productivity/shared";
import {
  Builder,
  DAY_SHORT,
  EXAMPLES,
  FIELDS,
  Mode,
  ZONES,
  clock,
  describe,
  describeBuilder,
  fmtClock,
  fmtDuration,
  fmtIn,
  fmtRun,
  nextRuns,
  offsetLabel,
  onceMs,
  parseCron,
  toExpr,
  zoneById,
} from "./cron";
import {
  JOBS,
  Job,
  Method,
  Overlap,
  RETRY_DELAYS,
  Run,
  TASKS,
  blankJob,
  editable,
  isDone,
  isFailing,
  isRunning,
  lastDone,
  successLog,
  taskLabel,
  wallNow,
} from "./jobs";

// ════════════════════════════════════════════════════════════════════════════
// SCHEDULED JOBS — set up the work that runs on its own
//
// The primary act is "make this run at the right time, and be sure of it". So
// the schedule block is the centre of gravity: whatever the user builds (a
// friendly builder, or a raw expression) is read back three ways at once — a
// sentence, the five cron fields, and the next five real run times in the
// job's own zone. Nobody should have to decode `30 9 * * 1-5` in their head.
//
// Edits are DRAFTS kept per job, so moving between jobs never loses work and
// never needs a "discard changes?" prompt; the list marks the edited ones.
// Pause and Run now are operations, not edits — they act immediately.
// ════════════════════════════════════════════════════════════════════════════

const VIEWER_ZONE = "Asia/Kathmandu";

type Filter = "all" | "failing" | "paused";

const MODES: { value: Mode; label: string }[] = [
  { value: "once", label: "Once" },
  { value: "interval", label: "Interval" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

const METHODS: { value: Method; label: string }[] = (["GET", "POST", "PUT", "DELETE"] as Method[]).map((m) => ({ value: m, label: m }));

const OVERLAP: { value: Overlap; label: string; hint: string }[] = [
  { value: "skip", label: "Skip this run", hint: "The next run is dropped; the one after it goes ahead." },
  { value: "queue", label: "Wait, then run", hint: "The run starts as soon as the previous one ends." },
  { value: "allow", label: "Run alongside", hint: "Both runs go at once. Only for work that is safe to repeat." },
];

const WEEK = [1, 2, 3, 4, 5, 6, 0];
const MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(n) || lo));

// ── Rules ───────────────────────────────────────────────────────────────────

function scheduleError(j: Job): { field: number; error: string } | null {
  const b = j.builder;
  // A once-job has no cron fields, so field -1 points at the date instead of a cell.
  if (b.mode === "once") {
    const at = onceMs(b);
    if (at === null) return { field: -1, error: "Pick a date." };
    if (at <= wallNow(zoneById(j.zone).offset) && !isDone(j)) return { field: -1, error: "Pick a time in the future." };
    return null;
  }
  if (b.mode === "custom") {
    const cells = b.custom.split(" ");
    const blank = cells.findIndex((c) => !c.trim());
    if (cells.length === 5 && blank >= 0) return { field: blank, error: `${FIELDS[blank].label} can't be empty.` };
  }
  const r = parseCron(toExpr(b));
  if (!r.ok) return { field: r.field, error: r.error };
  if (nextRuns(r.cron, wallNow(0), 1).length === 0) return { field: 2, error: "This schedule never runs." };
  return null;
}

const validJson = (s: string) => {
  if (!s.trim()) return true;
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
};

function issuesOf(j: Job): string[] {
  const out: string[] = [];
  if (!j.name.trim()) out.push("Name the job.");
  if (j.builder.mode === "weekly" && j.builder.weekdays.length === 0) out.push("Pick at least one day.");
  else {
    const e = scheduleError(j);
    if (e) out.push(e.error);
  }
  if (j.action.kind === "http") {
    const url = j.action.url.trim();
    if (!url) out.push("Add a URL to call.");
    else if (!/^https?:\/\/[^\s.]+\.\S+$/.test(url)) out.push("The URL must start with https://.");
  } else if (!validJson(j.action.args)) out.push("Arguments must be valid JSON.");
  return out;
}

const nextOf = (j: Job) => {
  const now = wallNow(zoneById(j.zone).offset);
  if (j.builder.mode === "once") {
    const at = onceMs(j.builder);
    return { at: at !== null && at > now && !isDone(j) ? at : undefined, now };
  }
  const r = parseCron(toExpr(j.builder));
  return r.ok ? { at: nextRuns(r.cron, now, 1)[0] as number | undefined, now } : { at: undefined, now };
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function ScheduledJobsDesignPage() {
  const [jobs, setJobs] = React.useState<Job[]>(JOBS);
  const [drafts, setDrafts] = React.useState<Record<string, Job>>({});
  const [selId, setSelId] = React.useState<string | null>("JOB-102");
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [q, setQ] = React.useState("");
  const [mobileEditor, setMobileEditor] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Job | null>(null);
  const [stopAsk, setStopAsk] = React.useState<{ jobId: string; runId: string; name: string } | null>(null);
  // Runs a user stopped — their pending "finished" timer must not overwrite the stop.
  const stopRequested = React.useRef(new Set<string>());
  const { toast, show, dismiss } = useToast();
  const seq = React.useRef(107);

  React.useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(id);
  }, []);

  // A draft never carries the operational fields — those always come from the saved job.
  const viewOf = React.useCallback(
    (j: Job): Job => {
      const d = drafts[j.id];
      return d ? { ...d, enabled: j.enabled, runs: j.runs, isNew: j.isNew } : j;
    },
    [drafts],
  );

  const saved = jobs.find((j) => j.id === selId) ?? null;
  const view = saved ? viewOf(saved) : null;
  const dirty = !!saved && (saved.isNew || (!!drafts[saved.id] && editable(drafts[saved.id]) !== editable(saved)));
  const issues = view ? issuesOf(view) : [];

  const edit = (id: string, fn: (j: Job) => Job) => {
    const base = jobs.find((j) => j.id === id);
    if (!base) return;
    setDrafts((d) => {
      const next = fn(d[id] ?? base);
      if (!base.isNew && editable(next) === editable(base)) {
        const { [id]: _drop, ...rest } = d;
        return rest;
      }
      return { ...d, [id]: next };
    });
  };
  const patchSaved = (id: string, fn: (j: Job) => Job) => setJobs((js) => js.map((j) => (j.id === id ? fn(j) : j)));
  const dropDraft = (id: string) =>
    setDrafts((d) => {
      const { [id]: _drop, ...rest } = d;
      return rest;
    });

  const pick = (id: string) => {
    setSelId(id);
    setMobileEditor(true);
  };

  const create = () => {
    const job = blankJob(`JOB-${seq.current++}`);
    setJobs((js) => [job, ...js]);
    setDrafts((d) => ({ ...d, [job.id]: job }));
    setFilter("all");
    setQ("");
    pick(job.id);
  };

  const save = React.useCallback(() => {
    if (!view || !dirty || issuesOf(view).length || saving) return;
    const wasNew = !!view.isNew;
    const draft = view;
    setSaving(true);
    window.setTimeout(() => {
      setJobs((js) => js.map((j) => (j.id === draft.id ? { ...draft, enabled: j.enabled, runs: j.runs, isNew: false } : j)));
      dropDraft(draft.id);
      setSaving(false);
      const n = nextOf(draft).at;
      show("success", wasNew ? `Scheduled. First run ${n ? `${fmtRun(n)} at ${fmtClock(n)}` : "not planned"}.` : "Changes saved.");
    }, 700);
  }, [view, dirty, saving, show]);

  const discard = () => {
    if (!saved) return;
    if (saved.isNew) {
      const rest = jobs.filter((j) => j.id !== saved.id);
      setJobs(rest);
      setSelId(rest[0]?.id ?? null);
      setMobileEditor(false);
    }
    dropDraft(saved.id);
  };

  const toggle = (on: boolean) => {
    if (!view) return;
    patchSaved(view.id, (j) => ({ ...j, enabled: on }));
    if (view.isNew) return;
    const n = nextOf(view).at;
    show("info", on ? `Resumed. Next run ${n ? `${fmtRun(n)} at ${fmtClock(n)}` : "not planned"}.` : "Paused. It won't run until you resume it.");
  };

  const runNow = () => {
    if (!saved || saved.isNew || isRunning(saved)) return;
    const id = saved.id;
    const name = saved.name;
    const runId = `${id}-manual-${Date.now()}`;
    const at = wallNow(zoneById(saved.zone).offset);
    const startedAt = Date.now();
    patchSaved(id, (j) => ({ ...j, runs: [{ id: runId, at, status: "running", ms: 0, trigger: "manual", startedAt, log: [`Started by ${ME.name}`] }, ...j.runs] }));
    show("info", `Running “${name}” now…`);
    window.setTimeout(() => {
      if (stopRequested.current.has(runId)) return;
      const ms = Date.now() - startedAt;
      patchSaved(id, (j) => ({
        ...j,
        runs: j.runs.map((r): Run => (r.id === runId ? { ...r, status: "succeeded", ms, log: [`Started by ${ME.name}`, ...successLog(j, ms)] } : r)),
      }));
      show("success", `“${name}” finished in ${fmtDuration(ms)}.`);
    }, 14000 + Math.round(Math.random() * 4000));
  };

  const stopRun = () => {
    if (!stopAsk) return;
    const { jobId, runId, name } = stopAsk;
    setStopAsk(null);
    stopRequested.current.add(runId);
    patchSaved(jobId, (j) => ({ ...j, runs: j.runs.map((r) => (r.id === runId ? { ...r, stopping: true } : r)) }));
    window.setTimeout(() => {
      patchSaved(jobId, (j) => ({
        ...j,
        runs: j.runs.map((r): Run => {
          if (r.id !== runId) return r;
          const ms = r.startedAt ? Date.now() - r.startedAt : r.ms;
          return { ...r, status: "stopped", stopping: false, ms, log: [...r.log, `Stopped by ${ME.name} after ${fmtDuration(ms)}`] };
        }),
      }));
      show("info", `Stopped “${name}”.`);
    }, 900);
  };

  const duplicate = () => {
    if (!view) return;
    const copy: Job = { ...view, id: `JOB-${seq.current++}`, name: `${view.name || "Untitled"} (copy)`, enabled: false, isNew: false, runs: [] };
    setJobs((js) => {
      const i = js.findIndex((j) => j.id === view.id);
      return [...js.slice(0, i + 1), copy, ...js.slice(i + 1)];
    });
    setSelId(copy.id);
    show("info", "Duplicated as a paused job.");
  };

  const remove = (job: Job) => {
    const index = jobs.findIndex((j) => j.id === job.id);
    const rest = jobs.filter((j) => j.id !== job.id);
    const draft = drafts[job.id];
    setJobs(rest);
    dropDraft(job.id);
    setSelId(rest[Math.min(index, rest.length - 1)]?.id ?? null);
    setDeleting(null);
    setMobileEditor(false);
    show("info", `Deleted “${job.name}”.`, {
      label: "Undo",
      run: () => {
        setJobs((js) => [...js.slice(0, index), job, ...js.slice(index)]);
        if (draft) setDrafts((d) => ({ ...d, [job.id]: draft }));
        setSelId(job.id);
      },
    });
  };

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [save]);

  const active = jobs.filter((j) => j.enabled && !j.isNew && !isDone(j)).length;
  const paused = jobs.filter((j) => !j.enabled).length;

  return (
    <AppFrame
      title="Scheduled jobs"
      rail="Settings"
      titleAside={
        !loading && jobs.length > 0 ? (
          <span className={cn("hidden text-[12px] text-bz-text-soft sm:inline", NUM)}>
            {active} active · {paused} paused
          </span>
        ) : null
      }
    >
      {!loading && jobs.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Empty
            icon={AlarmClock}
            title="No scheduled jobs yet"
            action={
              <button type="button" className={BTN} onClick={create}>
                <Plus size={13} /> New job
              </button>
            }
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex">
          <JobList
            hidden={mobileEditor}
            loading={loading}
            jobs={jobs}
            viewOf={viewOf}
            drafts={drafts}
            selId={selId}
            onPick={pick}
            filter={filter}
            setFilter={setFilter}
            q={q}
            setQ={setQ}
            onNew={create}
          />
          <div className={cn("relative min-w-0 flex-1", !mobileEditor && "hidden md:block")}>
            <div className="h-full overflow-y-auto">
              {loading ? (
                <EditorSkeleton />
              ) : view ? (
                <JobEditor
                  key={view.id}
                  job={view}
                  edit={(fn) => edit(view.id, fn)}
                  onToggle={toggle}
                  onRunNow={runNow}
                  onStop={(run) => setStopAsk({ jobId: view.id, runId: run.id, name: view.name })}
                  onDuplicate={duplicate}
                  onDelete={() => (view.isNew ? discard() : setDeleting(view))}
                  onBack={() => setMobileEditor(false)}
                  onCopy={(expr) => {
                    navigator.clipboard?.writeText(expr).catch(() => {});
                    show("info", `Copied ${expr}`);
                  }}
                />
              ) : (
                <Empty icon={AlarmClock} title="Pick a job to see its schedule." />
              )}
            </div>
            {view && dirty && <SaveBar isNew={!!view.isNew} issues={issues} saving={saving} onSave={save} onDiscard={discard} />}
          </div>
        </div>
      )}

      <Dialog
        open={!!deleting}
        size="sm"
        eyebrow={deleting?.id}
        title={`Delete “${deleting?.name}”?`}
        onClose={() => setDeleting(null)}
        foot={
          <>
            <button type="button" className={GHOST} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button type="button" className={DANGER_BTN} onClick={() => deleting && remove(deleting)}>
              Delete job
            </button>
          </>
        }
      >
        Its schedule and run history go with it. A run already in progress still finishes.
      </Dialog>
      <Dialog
        open={!!stopAsk}
        size="sm"
        eyebrow="Running now"
        title={`Stop “${stopAsk?.name}”?`}
        onClose={() => setStopAsk(null)}
        foot={
          <>
            <button type="button" className={GHOST} onClick={() => setStopAsk(null)}>
              Keep running
            </button>
            <button type="button" className={DANGER_BTN} onClick={stopRun}>
              Stop run
            </button>
          </>
        }
      >
        The run ends where it is. Anything it has already done is not undone, and the schedule stays as it is.
      </Dialog>
      <ToastHost toast={toast} onDismiss={dismiss} lifted={dirty} />
    </AppFrame>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIST
// ════════════════════════════════════════════════════════════════════════════

function JobList({
  hidden,
  loading,
  jobs,
  viewOf,
  drafts,
  selId,
  onPick,
  filter,
  setFilter,
  q,
  setQ,
  onNew,
}: {
  hidden: boolean;
  loading: boolean;
  jobs: Job[];
  viewOf: (j: Job) => Job;
  drafts: Record<string, Job>;
  selId: string | null;
  onPick: (id: string) => void;
  filter: Filter;
  setFilter: (f: Filter) => void;
  q: string;
  setQ: (v: string) => void;
  onNew: () => void;
}) {
  const views = React.useMemo(() => jobs.map(viewOf), [jobs, viewOf]);
  const counts = { all: views.length, failing: views.filter(isFailing).length, paused: views.filter((j) => !j.enabled).length };
  const needle = q.trim().toLowerCase();
  const shown = views.filter(
    (j) =>
      (filter === "all" || (filter === "failing" ? isFailing(j) : !j.enabled)) &&
      (!needle || `${j.id} ${j.name} ${describeBuilder(j.builder)}`.toLowerCase().includes(needle)),
  );

  return (
    <aside className={cn("flex w-full min-w-0 flex-col border-r border-bz-line bg-bz-paper md:w-[340px] md:shrink-0", hidden ? "hidden md:flex" : "flex")}>
      <div className="flex items-center gap-2 px-3 pb-2.5 pt-3">
        <SearchField value={q} onChange={setQ} placeholder="Search jobs" className="min-w-0 flex-1" />
        <button type="button" className={cn(BTN, "h-8 px-2.5")} onClick={onNew}>
          <Plus size={13} /> New job
        </button>
      </div>
      <div className="border-b border-bz-line-soft px-3 pb-3">
        <Segmented<Filter>
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "failing", label: "Failing", count: counts.failing },
            { value: "paused", label: "Paused", count: counts.paused },
          ]}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <ListSkeleton />
        ) : shown.length === 0 ? (
          needle ? (
            <Empty icon={Search} title={`No job matches “${q.trim()}”.`} action={<Clear label="Clear search" onClear={() => setQ("")} />} />
          ) : (
            <Empty icon={filter === "failing" ? CircleCheck : Pause} title={filter === "failing" ? "Nothing is failing." : "No paused jobs."} />
          )
        ) : (
          <ul className="m-0 list-none p-0">
            {shown.map((j) => (
              <JobRow key={j.id} job={j} on={j.id === selId} edited={!!drafts[j.id] && !j.isNew} onPick={() => onPick(j.id)} />
            ))}
          </ul>
        )}
      </div>

      <p className="m-0 hidden border-t border-bz-line-soft px-4 py-2.5 text-[11px] text-bz-text-soft md:block">Times are shown in each job's own zone.</p>
    </aside>
  );
}

function JobRow({ job, on, edited, onPick }: { job: Job; on: boolean; edited: boolean; onPick: () => void }) {
  const running = isRunning(job);
  const failing = isFailing(job);
  const finished = isDone(job);
  const invalid = !!scheduleError(job);
  const { at, now } = nextOf(job);

  const dot = running
    ? "bg-bz-fire animate-pulse"
    : finished
      ? "bg-bz-text-soft"
      : !job.enabled
      ? "border border-bz-text-soft"
      : failing
        ? "bg-bz-red-mark"
        : "bg-bz-leaf-deep";

  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className={cn(
          "relative flex w-full items-start gap-3 border-b border-bz-line-soft px-4 py-3 text-left transition-colors",
          on ? "bg-bz-fire/10 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-bz-fire before:content-['']" : "hover:bg-bz-paper-warm",
        )}
      >
        <span className={cn("mt-[5px] size-2 shrink-0 rounded-bz-pill", dot)} title={running ? "Running" : finished ? "Ran once" : !job.enabled ? "Paused" : failing ? "Last run failed" : "Healthy"} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className={cn("truncate text-[12.5px] text-bz-text", on ? "font-semibold" : "font-medium", !job.name && "text-bz-text-soft")}>{job.name || "Untitled job"}</span>
            {job.isNew && <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1 text-[10px] font-semibold text-bz-text-muted">New</span>}
            {edited && <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-amber" title="Unsaved changes" />}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] text-bz-text-muted">{invalid ? "Schedule needs fixing" : `${describeBuilder(job.builder)}${job.builder.mode === "once" && job.disposable ? ", then deleted" : ""}`}</span>
        </span>
        <span className={cn("shrink-0 text-right text-[11px] leading-tight", NUM)}>
          {running ? (
            <span className="inline-flex items-center gap-1 font-medium text-bz-text">
              <Loader2 size={11} className="animate-spin" /> {job.runs.some((r) => r.stopping) ? "Stopping" : "Running"}
            </span>
          ) : finished ? (
            <span className="text-bz-text-soft">Done</span>
          ) : !job.enabled ? (
            <span className="text-bz-text-soft">Paused</span>
          ) : at && !invalid ? (
            <>
              <span className="block font-medium text-bz-text">{fmtIn(at - now)}</span>
              <span className="mt-0.5 block text-bz-text-soft">{fmtClock(at)}</span>
            </>
          ) : (
            <span className="text-bz-text-soft">—</span>
          )}
        </span>
      </button>
    </li>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EDITOR
// ════════════════════════════════════════════════════════════════════════════

type Edit = (fn: (j: Job) => Job) => void;

function JobEditor({
  job,
  edit,
  onToggle,
  onRunNow,
  onDuplicate,
  onDelete,
  onBack,
  onCopy,
  onStop,
}: {
  job: Job;
  edit: Edit;
  onToggle: (on: boolean) => void;
  onRunNow: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStop: (run: Run) => void;
  onBack: () => void;
  onCopy: (expr: string) => void;
}) {
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = React.useState(false);
  const closeMenu = React.useCallback(() => setMenu(false), []);
  const nameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (job.isNew) nameRef.current?.focus();
    // Only on arrival — refocusing on every keystroke would fight the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expr = toExpr(job.builder);
  const finished = isDone(job);
  const { at, now } = nextOf(job);
  const invalid = !!scheduleError(job);
  const done = job.runs.filter((r) => r.status !== "running");
  const ok = done.filter((r) => r.status === "succeeded").length;
  const last = lastDone(job);
  const current = job.runs.find((r) => r.status === "running");

  return (
    <div className="mx-auto w-full max-w-[880px] px-4 pb-32 pt-4 md:px-8 md:pt-7">
      <button type="button" onClick={onBack} className={cn(GHOST_SM, "mb-4 md:hidden")}>
        <ArrowLeft size={13} /> All jobs
      </button>

      {/* ── Identity + operations ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <div className="min-w-0 flex-[1_1_320px]">
          <div className="flex items-center gap-2">
            <span className={cn(LABEL, NUM)}>{job.id}</span>
            {job.isNew && (
              <Chip tone="pending" dot={false}>
                Not saved
              </Chip>
            )}
            {!job.isNew && isFailing(job) && <Chip tone="danger">Last run failed</Chip>}
          </div>
          <input
            ref={nameRef}
            value={job.name}
            onChange={(e) => edit((j) => ({ ...j, name: e.target.value }))}
            placeholder="Name this job"
            aria-label="Job name"
            className="-ml-2 mt-1 block w-[calc(100%+8px)] rounded-bz-md border border-transparent bg-transparent px-2 py-0.5 text-[22px] font-semibold tracking-tight text-bz-text outline-none transition-colors placeholder:text-bz-text-soft hover:border-bz-line-soft focus:border-bz-line focus:bg-bz-surface"
          />
          <input
            value={job.note}
            onChange={(e) => edit((j) => ({ ...j, note: e.target.value }))}
            placeholder="Add a short description"
            aria-label="Description"
            className="-ml-2 block w-[calc(100%+8px)] rounded-bz-md border border-transparent bg-transparent px-2 py-0.5 text-[12.5px] text-bz-text-muted outline-none transition-colors placeholder:text-bz-text-soft hover:border-bz-line-soft focus:border-bz-line focus:bg-bz-surface"
          />
        </div>

        <div className="flex items-center gap-2 pt-0 sm:pt-5">
          {finished ? (
            <Chip tone="neutral" className="mr-1">
              Ran once
            </Chip>
          ) : (
            <span className="mr-1 inline-flex items-center gap-2 text-[12px] font-medium text-bz-text-muted">
              <Switch on={job.enabled} onChange={onToggle} label={job.enabled ? "Pause job" : "Resume job"} />
              {job.enabled ? "Active" : "Paused"}
            </span>
          )}
          {current ? (
            <button type="button" className={cn(GHOST, "text-bz-red hover:bg-bz-red-soft")} onClick={() => onStop(current)} disabled={current.stopping}>
              {current.stopping ? <Loader2 size={13} className="animate-spin" /> : <Square size={10} className="fill-current" />}
              {current.stopping ? "Stopping…" : "Stop"}
            </button>
          ) : (
            <button
              type="button"
              className={GHOST}
              onClick={onRunNow}
              disabled={job.isNew}
              title={job.isNew ? "Save the job first" : "Runs the saved version once, outside the schedule"}
            >
              <Play size={12} /> Run now
            </button>
          )}
          <button ref={menuRef} type="button" className={ICON_BTN} onClick={() => setMenu(true)} aria-label="More actions">
            <Ellipsis size={15} />
          </button>
          <Popover open={menu} anchor={menuRef.current} onClose={closeMenu} align="right" width={200}>
            <MenuItem icon={CopyPlus} disabled={job.isNew} onClick={() => (closeMenu(), onDuplicate())}>
              Duplicate
            </MenuItem>
            <MenuItem icon={Copy} disabled={invalid || job.builder.mode === "once"} onClick={() => (closeMenu(), onCopy(expr))}>
              Copy expression
            </MenuItem>
            <MenuSep />
            <MenuItem icon={Trash2} danger onClick={() => (closeMenu(), onDelete())}>
              {job.isNew ? "Discard job" : "Delete job"}
            </MenuItem>
          </Popover>
        </div>
      </div>

      {!job.isNew && (
        <Statline className="mt-3 border-y border-bz-line-soft py-1.5">
          {current && <Stat label="Running for" value={<Elapsed since={current.startedAt} />} />}
          <Stat
            label="Next run"
            value={finished ? "None, it ran once" : !job.enabled ? "Paused" : at && !invalid ? `${fmtRun(at)}, ${fmtClock(at)}` : "—"}
            sub={job.enabled && at && !invalid ? fmtIn(at - now) : undefined}
          />
          <Stat label="Last run" value={last ? fmtIn(last.at - now) : "Never"} sub={last?.status === "failed" ? "failed" : last?.status === "stopped" ? "stopped" : undefined} danger={last?.status === "failed"} />
          {done.length > 0 && <Stat label="Succeeded" meter={(ok / done.length) * 100} value={`${ok} of ${done.length}`} title="Across the recent runs below" />}
        </Statline>
      )}

      <ScheduleBlock job={job} edit={edit} onCopy={onCopy} />
      <ActionBlock job={job} edit={edit} />
      <ReliabilityBlock job={job} edit={edit} />
      <RunsBlock job={job} ok={ok} done={done.length} onStop={onStop} />
    </div>
  );
}

function Block({ title, aside, flush, children }: { title: string; aside?: React.ReactNode; flush?: boolean; children: React.ReactNode }) {
  return (
    <section className={cn(CARD, "mt-4")}>
      <header className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-bz-line-soft px-4 py-2">
        <h2 className="m-0 text-[12.5px] font-semibold text-bz-text">{title}</h2>
        {aside && <div className="ml-auto flex items-center gap-2">{aside}</div>}
      </header>
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}

const Word = ({ children }: { children: React.ReactNode }) => <span className="text-[12.5px] text-bz-text-muted">{children}</span>;

function TimeField({ h, m, onChange }: { h: number; m: number; onChange: (h: number, m: number) => void }) {
  return (
    <input
      type="time"
      aria-label="Time"
      value={clock(h, m)}
      onChange={(e) => {
        const [hh, mm] = e.target.value.split(":").map(Number);
        if (Number.isFinite(hh) && Number.isFinite(mm)) onChange(hh, mm);
      }}
      className={cn(INPUT_SM, "w-[112px] font-semibold", NUM)}
    />
  );
}

// ── Schedule ────────────────────────────────────────────────────────────────

function ScheduleBlock({ job, edit, onCopy }: { job: Job; edit: Edit; onCopy: (expr: string) => void }) {
  const b = job.builder;
  const setB = (p: Partial<Builder>) => edit((j) => ({ ...j, builder: { ...j.builder, ...p } }));
  const zone = zoneById(job.zone);
  const viewer = zoneById(VIEWER_ZONE);
  const now = wallNow(zone.offset);
  const expr = toExpr(b);
  const noDays = b.mode === "weekly" && b.weekdays.length === 0;
  const err = noDays ? { field: 4, error: "Pick at least one day." } : scheduleError(job);
  const parsed = parseCron(expr);
  const once = b.mode === "once";
  const onceAt = once ? onceMs(b) : null;
  const finished = isDone(job);
  const runs = once ? (onceAt !== null && !err && !finished && onceAt > now ? [onceAt] : []) : parsed.ok && !err ? nextRuns(parsed.cron, now, 5) : [];
  const custom = b.mode === "custom";
  const cells = custom ? Array.from({ length: 5 }, (_, i) => b.custom.split(" ")[i] ?? "") : expr.split(" ");

  const cellRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [focusCell, setFocusCell] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (focusCell === null || !custom) return;
    cellRefs.current[focusCell]?.focus();
    cellRefs.current[focusCell]?.select();
    setFocusCell(null);
  }, [focusCell, custom]);

  const toMode = (mode: Mode) => setB(mode === "custom" && !custom ? { mode, custom: expr } : { mode });
  const setCell = (i: number, v: string) => {
    const next = cells.map((c, k) => (k === i ? v.replace(/\s+/g, "") : c || "*"));
    setB({ custom: next.join(" ") });
  };

  const uneven = b.mode === "interval" && (b.unit === "minutes" ? 60 % b.every !== 0 : 24 % b.every !== 0);

  return (
    <Block
      title="Schedule"
      aside={
        <Select
          value={job.zone}
          onChange={(z) => edit((j) => ({ ...j, zone: z }))}
          options={ZONES.map((z) => ({ value: z.id, label: z.label, hint: z.id, meta: offsetLabel(z.offset) }))}
          icon={Globe}
          label={`${zone.label} · ${offsetLabel(zone.offset)}`}
          width={260}
          align="right"
          searchable={false}
          title="Time zone the schedule runs in"
        />
      }
    >
      <div className="-mx-4 overflow-x-auto px-4">
        <Segmented<Mode> value={b.mode} onChange={toMode} options={MODES} size="sm" />
      </div>

      {/* The builder for the chosen mode. Min height keeps the readout from jumping. */}
      <div className="mt-4 flex min-h-9 flex-wrap items-center gap-x-2.5 gap-y-2.5">
        {once && (
          <>
            <Word>On</Word>
            <input
              type="date"
              aria-label="Date"
              value={b.date}
              min={new Date(now).toISOString().slice(0, 10)}
              onChange={(e) => setB({ date: e.target.value })}
              className={cn(INPUT_SM, "w-[148px] font-semibold", NUM, err && "border-bz-red-mark hover:border-bz-red-mark")}
            />
            <Word>at</Word>
            <TimeField h={b.hour} m={b.minute} onChange={(hour, minute) => setB({ hour, minute })} />
            <span className="flex basis-full flex-wrap items-center gap-2.5 sm:ml-auto sm:basis-auto">
              <Word>After it runs</Word>
              <Segmented<"keep" | "delete">
                size="sm"
                value={job.disposable ? "delete" : "keep"}
                onChange={(v) => edit((j) => ({ ...j, disposable: v === "delete" }))}
                options={[
                  { value: "keep", label: "Keep the job" },
                  { value: "delete", label: "Delete it" },
                ]}
              />
            </span>
          </>
        )}
        {b.mode === "interval" && (
          <>
            <Word>Every</Word>
            <NumberField
              ariaLabel="Interval"
              value={b.every}
              min={1}
              max={b.unit === "minutes" ? 59 : 23}
              onChange={(v) => setB({ every: clamp(v, 1, b.unit === "minutes" ? 59 : 23) })}
              className="w-[92px]"
            />
            <Segmented<"minutes" | "hours">
              size="sm"
              value={b.unit}
              onChange={(u) => setB({ unit: u, every: clamp(b.every, 1, u === "minutes" ? 59 : 23) })}
              options={[
                { value: "minutes", label: "minutes" },
                { value: "hours", label: "hours" },
              ]}
            />
          </>
        )}
        {b.mode === "hourly" && (
          <>
            <Word>At minute</Word>
            <NumberField ariaLabel="Minute" value={b.minute} min={0} max={59} onChange={(v) => setB({ minute: clamp(v, 0, 59) })} className="w-[92px]" />
            <Word>of every hour</Word>
          </>
        )}
        {b.mode === "daily" && (
          <>
            <Word>Every day at</Word>
            <TimeField h={b.hour} m={b.minute} onChange={(hour, minute) => setB({ hour, minute })} />
          </>
        )}
        {b.mode === "weekly" && (
          <>
            <div className="flex gap-1" role="group" aria-label="Days">
              {WEEK.map((d) => {
                const on = b.weekdays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setB({ weekdays: on ? b.weekdays.filter((x) => x !== d) : [...b.weekdays, d] })}
                    className={cn(
                      "h-8 w-9 rounded-bz-md border text-[11.5px] transition-colors sm:w-10",
                      on ? "border-bz-olive bg-bz-olive font-semibold text-bz-fire" : "border-bz-line bg-bz-surface font-medium text-bz-text-muted hover:border-bz-text-soft hover:text-bz-text",
                    )}
                  >
                    {DAY_SHORT[d].slice(0, 2)}
                  </button>
                );
              })}
            </div>
            <Word>at</Word>
            <TimeField h={b.hour} m={b.minute} onChange={(hour, minute) => setB({ hour, minute })} />
            <span className="flex basis-full gap-3 sm:ml-1 sm:basis-auto">
              <Clear label="Weekdays" onClear={() => setB({ weekdays: [1, 2, 3, 4, 5] })} />
              <Clear label="Every day" onClear={() => setB({ weekdays: [0, 1, 2, 3, 4, 5, 6] })} />
            </span>
          </>
        )}
        {b.mode === "monthly" && (
          <>
            <Word>On day</Word>
            <NumberField ariaLabel="Day of month" value={b.monthDay} min={1} max={31} onChange={(v) => setB({ monthDay: clamp(v, 1, 31) })} className="w-[92px]" />
            <Word>of every month, at</Word>
            <TimeField h={b.hour} m={b.minute} onChange={(hour, minute) => setB({ hour, minute })} />
          </>
        )}
        {custom && (
          <>
            <Word>Edit the five fields below, or start from</Word>
            <Select
              value={null}
              onChange={(v) => setB({ custom: v })}
              options={EXAMPLES.map((x) => ({ value: x.expr, label: x.label, meta: x.expr }))}
              label="an example"
              width={280}
              searchable={false}
            />
          </>
        )}
      </div>
      {uneven && (
        <p className="mb-0 mt-2 text-[11px] text-bz-text-soft">
          The count restarts {b.unit === "minutes" ? "on the hour" : "at midnight"}, so the last gap is shorter.
        </p>
      )}
      {b.mode === "monthly" && b.monthDay > 28 && <p className="mb-0 mt-2 text-[11px] text-bz-text-soft">Months without a day {b.monthDay} are skipped.</p>}

      {/* ── Read-back ─────────────────────────────────────────────────── */}
      <div className="mt-4 grid gap-5 border-t border-bz-line-soft pt-4 md:grid-cols-[minmax(0,1fr)_236px]">
        <div className="min-w-0">
          <p className={cn(LABEL, "m-0")}>Reads as</p>
          <p className={cn("m-0 mt-1 text-[15px] font-semibold tracking-tight", err ? "text-bz-text-soft" : "text-bz-text")}>{err ? "Not a valid schedule yet" : describeBuilder(b)}</p>

          {once ? (
            <p className="mb-0 mt-3 rounded-bz-md bg-bz-well px-3 py-2.5 text-[12px] leading-relaxed text-bz-text-muted">
              {finished
                ? "It has run. Move the date forward to run it again."
                : job.disposable
                  ? "Runs one time, then the job and its run history are deleted."
                  : "Runs one time, then stays here as a record."}
            </p>
          ) : (
          <div className="mt-3 flex items-start gap-1.5">
            <div className="grid min-w-0 flex-1 grid-cols-5 gap-1.5">
              {cells.map((c, i) => (
                <div key={i} className="min-w-0">
                  {custom ? (
                    <input
                      ref={(el) => {
                        cellRefs.current[i] = el;
                      }}
                      value={c}
                      aria-label={FIELDS[i].label}
                      spellCheck={false}
                      onChange={(e) => setCell(i, e.target.value)}
                      onPaste={(e) => {
                        const text = e.clipboardData.getData("text").trim();
                        if (text.split(/\s+/).length === 5) {
                          e.preventDefault();
                          setB({ custom: text.replace(/\s+/g, " ") });
                        }
                      }}
                      className={cn(
                        "h-10 w-full min-w-0 rounded-bz-md border bg-bz-paper px-1 text-center text-[14px] font-semibold text-bz-text outline-none transition-colors focus:border-bz-text-muted",
                        NUM,
                        err?.field === i ? "border-bz-red-mark" : "border-bz-line hover:border-bz-text-soft",
                      )}
                    />
                  ) : (
                    <button
                      type="button"
                      title="Edit as an expression"
                      onClick={() => {
                        toMode("custom");
                        setFocusCell(i);
                      }}
                      className={cn(
                        "flex h-10 w-full min-w-0 items-center justify-center truncate rounded-bz-md border bg-bz-well px-1 text-[14px] font-semibold text-bz-text transition-colors hover:border-bz-line",
                        NUM,
                        err?.field === i ? "border-bz-red-mark" : "border-bz-line-soft",
                      )}
                    >
                      {c}
                    </button>
                  )}
                  <span className="mt-1 block truncate text-center text-[10px] text-bz-text-soft">{FIELDS[i].label}</span>
                </div>
              ))}
            </div>
            <button type="button" className={cn(ICON_BTN, "mt-1 size-8")} onClick={() => onCopy(expr)} disabled={!!err} aria-label="Copy expression" title="Copy expression">
              <Copy size={13} />
            </button>
          </div>
          )}
          {err && (
            <p role="alert" className="mb-0 mt-2 flex items-center gap-1.5 text-[11.5px] text-bz-red">
              <CircleAlert size={12} className="shrink-0" />
              {err.error}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className={cn(LABEL, "m-0 flex items-baseline justify-between")}>
            {once ? "Runs at" : "Next runs"}
            <span className="text-[10.5px] font-medium normal-case tracking-normal text-bz-text-soft">{zone.label} time</span>
          </p>
          {!job.enabled && runs.length > 0 && <p className="mb-0 mt-1.5 rounded-bz-sm bg-bz-paper-warm px-2 py-1 text-[11px] text-bz-text-muted">{once ? "Paused, so it won't run." : "Paused, so none of these will run."}</p>}
          {runs.length === 0 ? (
            <p className="mb-0 mt-2 text-[12px] text-bz-text-soft">{err ? "Fix the schedule to see when it runs." : finished && onceAt !== null ? `Ran ${fmtRun(onceAt)}, ${fmtClock(onceAt)}.` : "This schedule never runs."}</p>
          ) : (
            <ol className={cn("m-0 mt-1 list-none p-0", !job.enabled && "opacity-50")}>
              {runs.map((t, i) => (
                <li key={t} className={cn("flex items-baseline gap-2 border-b border-bz-line-soft py-1.5 text-[12px] last:border-0", NUM)}>
                  <span className="w-[84px] shrink-0 text-bz-text-muted">{fmtRun(t)}</span>
                  <span className={cn("text-bz-text", i === 0 ? "font-semibold" : "font-medium")}>{fmtClock(t)}</span>
                  <span className="ml-auto text-[11px] text-bz-text-soft">{fmtIn(t - now)}</span>
                </li>
              ))}
            </ol>
          )}
          {runs.length > 0 && zone.id !== viewer.id && (
            <p className="mb-0 mt-1.5 text-[11px] text-bz-text-soft">
              {once ? "That run is" : "That first run is"} <span className={cn("font-medium text-bz-text-muted", NUM)}>{fmtClock(runs[0] + (viewer.offset - zone.offset) * 60000)}</span> in {viewer.label}.
            </p>
          )}
        </div>
      </div>
    </Block>
  );
}

// ── Action ──────────────────────────────────────────────────────────────────

function ActionBlock({ job, edit }: { job: Job; edit: Edit }) {
  const a = job.action;
  const setA = (p: Partial<Job["action"]>) => edit((j) => ({ ...j, action: { ...j.action, ...p } }));
  const [more, setMore] = React.useState(a.headers.length > 0 || !!a.body);
  const url = a.url.trim();
  const badUrl = !!url && !/^https?:\/\/[^\s.]+\.\S+$/.test(url);
  const badArgs = a.kind === "task" && !validJson(a.args);
  const task = TASKS.find((t) => t.value === a.task);
  const hasBody = a.method === "POST" || a.method === "PUT";

  return (
    <Block
      title="What it runs"
      aside={
        <Segmented<"http" | "task">
          size="sm"
          value={a.kind}
          onChange={(kind) => setA({ kind })}
          options={[
            {
              value: "http",
              label: (
                <>
                  <Webhook size={12} /> HTTP request
                </>
              ),
            },
            {
              value: "task",
              label: (
                <>
                  <SquareTerminal size={12} /> System task
                </>
              ),
            },
          ]}
        />
      }
    >
      {a.kind === "http" ? (
        <>
          <Field label="Request" required hint={badUrl ? <span className="text-bz-red">The URL must start with https://.</span> : undefined}>
            <div
              className={cn(
                "flex h-9 items-stretch overflow-hidden rounded-bz-md border bg-bz-paper transition-colors focus-within:border-bz-text-muted",
                badUrl ? "border-bz-red-mark" : "border-bz-line hover:border-bz-text-soft",
              )}
            >
              <Select value={a.method} onChange={(m) => setA({ method: m as Method })} options={METHODS} trigger="plain" width={140} searchable={false} className="h-full rounded-none">
                <span className="flex h-full items-center gap-1 border-r border-bz-line-soft px-3 text-[11px] font-bold tracking-[0.04em] text-bz-text">
                  {a.method}
                  <ChevronDown size={11} className="text-bz-text-soft" />
                </span>
              </Select>
              <input
                value={a.url}
                onChange={(e) => setA({ url: e.target.value })}
                placeholder="https://"
                aria-label="URL"
                spellCheck={false}
                className="min-w-0 flex-1 border-0 bg-transparent px-3 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft"
              />
            </div>
          </Field>

          <button type="button" onClick={() => setMore(!more)} className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">
            <ChevronRight size={12} className={cn("transition-transform", more && "rotate-90")} />
            Headers and body
            {a.headers.length > 0 && <CountMark>{a.headers.length}</CountMark>}
          </button>

          {more && (
            <div className="mt-2.5 rounded-bz-md bg-bz-well p-3">
              <p className={cn(LABEL, "m-0 mb-2")}>Headers</p>
              <div className="flex flex-col gap-1.5">
                {a.headers.map((h) => (
                  <div key={h.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-center gap-1.5">
                    <input
                      value={h.key}
                      placeholder="Name"
                      aria-label="Header name"
                      spellCheck={false}
                      onChange={(e) => setA({ headers: a.headers.map((x) => (x.id === h.id ? { ...x, key: e.target.value } : x)) })}
                      className={cn(INPUT_SM, "bg-bz-surface")}
                    />
                    <input
                      value={h.value}
                      placeholder="Value"
                      aria-label="Header value"
                      spellCheck={false}
                      onChange={(e) => setA({ headers: a.headers.map((x) => (x.id === h.id ? { ...x, value: e.target.value } : x)) })}
                      className={cn(INPUT_SM, "bg-bz-surface")}
                    />
                    <button type="button" className={ICON_BTN_SM} aria-label="Remove header" onClick={() => setA({ headers: a.headers.filter((x) => x.id !== h.id) })}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setA({ headers: [...a.headers, { id: Date.now(), key: "", value: "" }] })}
                className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"
              >
                <Plus size={12} /> Add header
              </button>

              <p className={cn(LABEL, "m-0 mb-2 mt-4")}>Body</p>
              {hasBody ? (
                <textarea value={a.body} onChange={(e) => setA({ body: e.target.value })} placeholder="{ }" spellCheck={false} aria-label="Body" className={cn(TEXTAREA, "bg-bz-surface")} />
              ) : (
                <p className="m-0 text-[11.5px] text-bz-text-soft">A {a.method} request sends no body.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-4">
          <Field label="Task" required hint={task?.hint}>
            <Select
              value={a.task}
              onChange={(t) => setA({ task: t })}
              options={TASKS}
              width={320}
              searchable
              placeholder="Search tasks…"
              className="h-9 w-full rounded-bz-md border-bz-line bg-bz-paper px-3 text-[12.5px] hover:border-bz-text-soft hover:bg-bz-paper"
            >
              <span className="flex w-full min-w-0 items-center gap-2">
                <SquareTerminal size={13} className="shrink-0 text-bz-text-muted" />
                <span className="min-w-0 flex-1 truncate text-left font-medium">{taskLabel(a.task)}</span>
                <span className="hidden shrink-0 text-[11px] text-bz-text-soft sm:inline">{a.task}</span>
                <ChevronDown size={12} className="shrink-0 text-bz-text-soft" />
              </span>
            </Select>
          </Field>
          <Field label="Arguments" hint={badArgs ? <span className="text-bz-red">Arguments must be valid JSON.</span> : "JSON, passed to the task as it is."}>
            <textarea
              value={a.args}
              onChange={(e) => setA({ args: e.target.value })}
              spellCheck={false}
              aria-label="Arguments"
              className={cn(TEXTAREA, badArgs && "border-bz-red-mark hover:border-bz-red-mark")}
            />
          </Field>
        </div>
      )}
    </Block>
  );
}

// ── Reliability ─────────────────────────────────────────────────────────────

function ReliabilityBlock({ job, edit }: { job: Job; edit: Edit }) {
  const set = (p: Partial<Job>) => edit((j) => ({ ...j, ...p }));
  const overlap = OVERLAP.find((o) => o.value === job.overlap)!;

  return (
    <Block title="When things go wrong">
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <Field label="Stop a run after" hint="A run that takes longer is marked failed.">
          <span className="flex items-center gap-2">
            <NumberField ariaLabel="Timeout" value={job.timeoutSec} min={1} max={86400} onChange={(v) => set({ timeoutSec: clamp(v, 1, 86400) })} className="w-[112px]" />
            <Word>seconds</Word>
          </span>
        </Field>

        <Field label="Retry a failed run" hint={job.retries === 0 ? "Failures are not retried." : `Up to ${job.retries} more attempt${job.retries === 1 ? "" : "s"}.`}>
          <span className="flex flex-wrap items-center gap-2">
            <NumberField ariaLabel="Retries" value={job.retries} min={0} max={5} onChange={(v) => set({ retries: Math.max(0, Math.min(5, Math.round(v) || 0)) })} className="w-[92px]" />
            <Select
              value={job.retryDelay}
              onChange={(v) => set({ retryDelay: v })}
              options={RETRY_DELAYS}
              label={RETRY_DELAYS.find((d) => d.value === job.retryDelay)?.label}
              disabled={job.retries === 0}
              searchable={false}
              width={160}
            />
          </span>
        </Field>

        <Field className="sm:col-span-2" label="If the previous run is still going" hint={overlap.hint}>
          <div className="overflow-x-auto">
            <Segmented<Overlap> size="sm" value={job.overlap} onChange={(v) => set({ overlap: v })} options={OVERLAP.map(({ value, label }) => ({ value, label }))} />
          </div>
        </Field>

        <Field className="sm:col-span-2" label="Tell people when it fails" hint={job.notify.length === 0 ? "Nobody is told. Failures still show under recent runs." : undefined}>
          <div className="flex flex-wrap items-center gap-1.5">
            {job.notify.map((id) => {
              const p = personById(id);
              return (
                <span key={id} className="inline-flex h-7 items-center gap-1.5 rounded-bz-pill border border-bz-line-soft bg-bz-surface py-0.5 pl-0.5 pr-1 text-[11.5px] font-medium text-bz-text">
                  <Avatar person={p} size={22} />
                  {p?.name ?? id}
                  <button type="button" className={cn(ICON_BTN_SM, "size-5 rounded-bz-pill")} aria-label={`Remove ${p?.name ?? id}`} onClick={() => set({ notify: job.notify.filter((x) => x !== id) })}>
                    <X size={11} />
                  </button>
                </span>
              );
            })}
            <Select
              multiple
              value={job.notify}
              onChange={(v) => set({ notify: v })}
              options={PEOPLE.map((p) => ({ value: p.id, label: p.name, hint: p.team, person: p }))}
              icon={Plus}
              label={job.notify.length ? "Add" : "Add people"}
              width={260}
              searchable
              placeholder="Search people…"
              className="rounded-bz-pill"
            />
          </div>
        </Field>
      </div>
    </Block>
  );
}

// ── Recent runs ─────────────────────────────────────────────────────────────

function RunsBlock({ job, ok, done, onStop }: { job: Job; ok: number; done: number; onStop: (run: Run) => void }) {
  return (
    <Block
      title="Recent runs"
      flush
      aside={
        done > 0 ? (
          <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
            {ok} of {done} succeeded
          </span>
        ) : undefined
      }
    >
      {job.runs.length === 0 ? (
        <Empty icon={Timer} title={job.isNew ? "Runs show here once the job is saved." : "No runs yet."} />
      ) : (
        <ul className="m-0 list-none p-0">
          {job.runs.map((r) => (
            <RunRow key={r.id} run={r} onStop={onStop} />
          ))}
        </ul>
      )}
    </Block>
  );
}

function RunRow({ run, onStop }: { run: Run; onStop: (run: Run) => void }) {
  const [open, setOpen] = React.useState(false);
  const failed = run.status === "failed";
  const step = run.ms / Math.max(1, run.log.length - 1);
  const when = (
    <span className={cn("block text-[12px] text-bz-text", NUM)}>
      {fmtRun(run.at)}, {fmtClock(run.at)}
      {run.trigger === "manual" && <span className="text-bz-text-soft"> · Run by hand</span>}
    </span>
  );

  // A live run has nothing to expand yet — its one action is to stop it.
  if (run.status === "running")
    return (
      <li className="flex items-center gap-3 border-b border-bz-line-soft bg-bz-fire/[0.06] px-4 py-2 last:border-0">
        <span className="w-[92px] shrink-0">
          <Chip tone="partial" dot={false}>
            <Loader2 size={10} className="animate-spin" /> {run.stopping ? "Stopping" : "Running"}
          </Chip>
        </span>
        <span className="min-w-0 flex-1">{when}</span>
        <span className={cn("shrink-0 text-[11.5px] text-bz-text-muted", NUM)}>
          <Elapsed since={run.startedAt} />
        </span>
        <button type="button" onClick={() => onStop(run)} disabled={run.stopping} className={cn(GHOST_SM, "h-7 text-bz-red hover:bg-bz-red-soft")}>
          <Square size={9} className="fill-current" /> Stop
        </button>
      </li>
    );

  return (
    <li className="border-b border-bz-line-soft last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-bz-paper-warm"
      >
        <span className="w-[92px] shrink-0">
          {failed ? <Chip tone="danger">Failed</Chip> : run.status === "stopped" ? <Chip tone="neutral">Stopped</Chip> : <Chip tone="positive">Succeeded</Chip>}
        </span>
        <span className="min-w-0 flex-1">
          {when}
          {failed && <span className="block truncate text-[11px] text-bz-red">{run.log[1]}</span>}
        </span>
        <span className={cn("shrink-0 text-[11.5px] text-bz-text-muted", NUM)}>{fmtDuration(run.ms)}</span>
        <ChevronDown size={12} className={cn("shrink-0 text-bz-text-soft transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mx-4 mb-3 rounded-bz-md bg-bz-well px-3 py-2.5">
          {run.log.map((line, i) => (
            <p key={i} className="m-0 flex gap-3 text-[11.5px] leading-relaxed">
              <span className={cn("w-12 shrink-0 text-bz-text-soft", NUM)}>+{((step * i) / 1000).toFixed(1)}s</span>
              <span className={cn("min-w-0 break-words", failed && i === 1 ? "font-medium text-bz-red" : "text-bz-text")}>{line}</span>
            </p>
          ))}
        </div>
      )}
    </li>
  );
}

/** m:ss since a run started, ticking. */
function Elapsed({ since }: { since?: number }) {
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (!since) return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [since]);
  if (!since) return <>—</>;
  const s = Math.max(0, Math.floor((Date.now() - since) / 1000));
  return <>{`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`}</>;
}

// ── Save bar — a draft is a mode ────────────────────────────────────────────

function SaveBar({ isNew, issues, saving, onSave, onDiscard }: { isNew: boolean; issues: string[]; saving: boolean; onSave: () => void; onDiscard: () => void }) {
  const blocked = issues.length > 0;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-[560px] items-center gap-2.5 rounded-bz-lg border border-white/10 bg-bz-raised py-2 pl-3.5 pr-2 text-bz-text-on-dark shadow-[var(--bz-shadow-panel)]">
        <span className={cn("size-1.5 shrink-0 rounded-bz-pill", blocked ? "bg-bz-red-mark" : "bg-bz-amber")} />
        <p className="m-0 min-w-0 flex-1 truncate text-[12px]">
          {blocked ? (
            <>
              {issues[0]}
              {issues.length > 1 && <span className="text-white/55"> +{issues.length - 1} more</span>}
            </>
          ) : isNew ? (
            "New job, not saved yet"
          ) : (
            "Unsaved changes"
          )}
        </p>
        <button type="button" onClick={onDiscard} className="shrink-0 px-1.5 text-[11.5px] font-medium text-white/60 underline underline-offset-2 hover:text-white">
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={blocked || saving}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-bz-md bg-bz-fire px-3 text-[12px] font-semibold text-bz-olive transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          {isNew ? "Schedule job" : "Save"}
          <span className="hidden sm:inline-flex">
            <Kbd>{MAC ? "⌘S" : "Ctrl S"}</Kbd>
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Loading ─────────────────────────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div aria-busy>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 border-b border-bz-line-soft px-4 py-3.5">
          <span className="mt-1 size-2 shrink-0 animate-pulse rounded-bz-pill bg-bz-line-soft" />
          <span className="flex-1">
            <span className="block h-2.5 animate-pulse rounded-bz-pill bg-bz-line-soft" style={{ width: `${46 + ((i * 17) % 34)}%` }} />
            <span className="mt-2 block h-2 w-2/5 animate-pulse rounded-bz-pill bg-bz-line-soft" />
          </span>
          <span className="h-2.5 w-10 animate-pulse rounded-bz-pill bg-bz-line-soft" />
        </div>
      ))}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[880px] px-4 pt-4 md:px-8 md:pt-7" aria-busy>
      <span className="block h-2 w-16 animate-pulse rounded-bz-pill bg-bz-line-soft" />
      <span className="mt-3 block h-5 w-72 max-w-full animate-pulse rounded-bz-pill bg-bz-line-soft" />
      <span className="mt-3 block h-2.5 w-52 animate-pulse rounded-bz-pill bg-bz-line-soft" />
      {[180, 120, 150].map((h, i) => (
        <div key={i} className={cn(CARD, "mt-4 animate-pulse")} style={{ height: h }} />
      ))}
      <p className="mt-4 flex items-center justify-center gap-2 text-[11.5px] text-bz-text-soft">
        <Loader2 size={12} className="animate-spin" /> Loading jobs…
      </p>
    </div>
  );
}
