import { Builder, onceMs, parseCron, runsBetween, toExpr, zoneById } from "./cron";

// ════════════════════════════════════════════════════════════════════════════
// JOBS — model + seed for the scheduled-jobs page
//
// History is DERIVED from each job's own schedule, so the recent-runs list,
// the last-run chip and the success ratio always agree with the expression the
// page is showing — a hand-typed timestamp would drift the first time a seed
// schedule is edited.
// ════════════════════════════════════════════════════════════════════════════

/** 2026-09-17 10:42 in Kathmandu. Every zone derives its wall clock from this. */
export const NOW_UTC = Date.UTC(2026, 8, 17, 4, 57);
export const wallNow = (offsetMin: number) => NOW_UTC + offsetMin * 60000;

export type RunStatus = "succeeded" | "failed" | "running" | "stopped";
export type Run = {
  id: string;
  at: number;
  status: RunStatus;
  ms: number;
  trigger: "schedule" | "manual";
  log: string[];
  /** Real clock start of a live run, for the elapsed counter. */
  startedAt?: number;
  /** Stop was asked for and the worker has not let go yet. */
  stopping?: boolean;
};

export type Method = "GET" | "POST" | "PUT" | "DELETE";
export type Action = {
  kind: "http" | "task";
  method: Method;
  url: string;
  headers: { id: number; key: string; value: string }[];
  body: string;
  task: string;
  args: string;
};

export type Overlap = "skip" | "queue" | "allow";

export type Job = {
  id: string;
  name: string;
  note: string;
  enabled: boolean;
  isNew?: boolean;
  builder: Builder;
  zone: string;
  action: Action;
  timeoutSec: number;
  retries: number;
  retryDelay: string;
  overlap: Overlap;
  notify: string[];
  /** Once-only: the job deletes itself after its run. */
  disposable: boolean;
  runs: Run[];
};

export const TASKS = [
  { value: "backup.database", label: "Back up the database", hint: "Full snapshot to cold storage" },
  { value: "invoices.remind", label: "Send overdue invoice reminders", hint: "Emails customers past their due date" },
  { value: "sessions.purge", label: "Purge expired sessions", hint: "Signs out tokens past their lifetime" },
  { value: "ledger.snapshot", label: "Snapshot ledger balances", hint: "Freezes balances for every organisation" },
  { value: "stock.revalue", label: "Revalue stock", hint: "Recomputes cost layers for moved items" },
  { value: "reports.usage", label: "Build usage report", hint: "Seats, storage and API calls per tenant" },
  { value: "search.reindex", label: "Rebuild the search index", hint: "Re-reads every document into search" },
];
export const taskLabel = (v: string) => TASKS.find((t) => t.value === v)?.label ?? v;

export const RETRY_DELAYS = [
  { value: "30s", label: "30 s apart" },
  { value: "1m", label: "1 min apart" },
  { value: "5m", label: "5 min apart" },
  { value: "15m", label: "15 min apart" },
];

const B = (b: Partial<Builder>): Builder => ({
  mode: "daily",
  every: 30,
  unit: "minutes",
  minute: 0,
  hour: 9,
  weekdays: [1, 2, 3, 4, 5],
  monthDay: 1,
  date: "2026-09-18",
  custom: "0 9 * * *",
  ...b,
});

const A = (a: Partial<Action>): Action => ({ kind: "http", method: "GET", url: "", headers: [], body: "", task: TASKS[0].value, args: "{}", ...a });

type Seed = Omit<Job, "runs" | "disposable"> & { disposable?: boolean; window: number; failAt: number[]; baseMs: number };

const SEED: Seed[] = [
  {
    id: "JOB-101",
    name: "Sync exchange rates",
    note: "Pulls the day's reference rates for multi-currency documents.",
    enabled: true,
    builder: B({ mode: "interval", every: 30, unit: "minutes" }),
    zone: "Asia/Kathmandu",
    action: A({ kind: "http", method: "GET", url: "https://rates.bizak.io/v1/latest?base=NPR", headers: [{ id: 1, key: "Accept", value: "application/json" }] }),
    timeoutSec: 30,
    retries: 3,
    retryDelay: "30s",
    overlap: "skip",
    notify: ["EMP-121"],
    window: 1,
    failAt: [5],
    baseMs: 640,
  },
  {
    id: "JOB-102",
    name: "Send overdue invoice reminders",
    note: "",
    enabled: true,
    builder: B({ mode: "weekly", hour: 9, minute: 30, weekdays: [1, 2, 3, 4, 5] }),
    zone: "Asia/Kathmandu",
    action: A({ kind: "task", task: "invoices.remind", args: '{\n  "daysOverdue": 7,\n  "skipDisputed": true\n}' }),
    timeoutSec: 300,
    retries: 2,
    retryDelay: "5m",
    overlap: "queue",
    notify: ["EMP-118", "EMP-101"],
    window: 14,
    failAt: [0],
    baseMs: 18400,
  },
  {
    id: "JOB-103",
    name: "Nightly database backup",
    note: "Keeps 30 days of snapshots.",
    enabled: true,
    builder: B({ mode: "daily", hour: 2, minute: 0 }),
    zone: "Asia/Kathmandu",
    action: A({ kind: "task", task: "backup.database", args: '{\n  "retainDays": 30\n}' }),
    timeoutSec: 1800,
    retries: 1,
    retryDelay: "15m",
    overlap: "skip",
    notify: ["EMP-121", "EMP-112"],
    window: 14,
    failAt: [],
    baseMs: 412000,
  },
  {
    id: "JOB-104",
    name: "Purge expired sessions",
    note: "",
    enabled: true,
    builder: B({ mode: "hourly", minute: 15 }),
    zone: "UTC",
    action: A({ kind: "task", task: "sessions.purge", args: "{}" }),
    timeoutSec: 60,
    retries: 0,
    retryDelay: "30s",
    overlap: "skip",
    notify: [],
    window: 1,
    failAt: [],
    baseMs: 1200,
  },
  {
    id: "JOB-105",
    name: "Snapshot ledger balances",
    note: "Opening balances for the month, before anyone posts.",
    enabled: false,
    builder: B({ mode: "monthly", monthDay: 1, hour: 0, minute: 30 }),
    zone: "Asia/Kathmandu",
    action: A({ kind: "task", task: "ledger.snapshot", args: '{\n  "allOrganisations": true\n}' }),
    timeoutSec: 900,
    retries: 2,
    retryDelay: "5m",
    overlap: "queue",
    notify: ["EMP-118"],
    window: 240,
    failAt: [],
    baseMs: 96000,
  },
  {
    id: "JOB-106",
    name: "Weekly usage report",
    note: "Posted to the platform channel.",
    enabled: true,
    builder: B({ mode: "custom", custom: "0 7 * * 1" }),
    zone: "Europe/London",
    action: A({
      kind: "http",
      method: "POST",
      url: "https://hooks.bizak.io/platform/usage",
      headers: [
        { id: 1, key: "Content-Type", value: "application/json" },
        { id: 2, key: "Authorization", value: "Bearer ••••••••" },
      ],
      body: '{\n  "period": "last_week"\n}',
    }),
    timeoutSec: 120,
    retries: 1,
    retryDelay: "1m",
    overlap: "skip",
    notify: ["EMP-101"],
    window: 70,
    failAt: [3],
    baseMs: 3100,
  },
  {
    id: "JOB-107",
    name: "Send launch announcement",
    note: "Deletes itself once it has sent.",
    enabled: true,
    builder: B({ mode: "once", date: "2026-09-19", hour: 10, minute: 0 }),
    zone: "Asia/Kathmandu",
    action: A({ kind: "http", method: "POST", url: "https://hooks.bizak.io/announce/v2-launch", headers: [{ id: 1, key: "Content-Type", value: "application/json" }], body: '{\n  "audience": "all_tenants"\n}' }),
    timeoutSec: 60,
    retries: 2,
    retryDelay: "1m",
    overlap: "skip",
    notify: ["EMP-101"],
    disposable: true,
    window: 0,
    failAt: [],
    baseMs: 900,
  },
  {
    id: "JOB-108",
    name: "Rebuild search after migration",
    note: "One-off after the 16 Sep data move.",
    enabled: true,
    builder: B({ mode: "once", date: "2026-09-16", hour: 22, minute: 0 }),
    zone: "Asia/Kathmandu",
    action: A({ kind: "task", task: "search.reindex", args: '{\n  "organisations": "all"\n}' }),
    timeoutSec: 3600,
    retries: 1,
    retryDelay: "15m",
    overlap: "skip",
    notify: ["EMP-112"],
    window: 0,
    failAt: [],
    baseMs: 184000,
  },
];

// ── History ─────────────────────────────────────────────────────────────────

export function successLog(job: Pick<Job, "action">, ms: number): string[] {
  const a = job.action;
  if (a.kind === "http") return [`${a.method} ${a.url || "—"}`, `200 OK in ${ms} ms`];
  return [`Started ${a.task}`, a.task === "invoices.remind" ? "Queued 23 reminders" : "Nothing left to do", "Finished"];
}

function failureLog(job: Seed): string[] {
  if (job.action.kind === "http") return [`${job.action.method} ${job.action.url}`, "503 Service Unavailable", `Retried ${job.retries} of ${job.retries}, then stopped`];
  return [`Started ${job.action.task}`, "SMTP connection timed out after 30 s", `Retried ${job.retries} of ${job.retries}, then stopped`];
}

function history(s: Seed): Run[] {
  const now = wallNow(zoneById(s.zone).offset);
  // A paused job stopped running a while ago — its history ends there.
  const until = s.enabled ? now : now - 20 * 86400000;
  let times: number[];
  if (s.builder.mode === "once") {
    const at = onceMs(s.builder);
    times = at !== null && at <= until ? [at] : [];
  } else {
    const parsed = parseCron(toExpr(s.builder));
    if (!parsed.ok) return [];
    times = runsBetween(parsed.cron, until - s.window * 86400000, until).slice(-8).reverse();
  }
  return times.map((at, i) => {
    const failed = s.failAt.includes(i);
    const ms = Math.round(s.baseMs * (0.82 + (((at / 60000) % 37) / 37) * 0.4));
    return { id: `${s.id}-${at}`, at, status: failed ? "failed" : "succeeded", ms: failed ? s.timeoutSec * 1000 : ms, trigger: "schedule", log: failed ? failureLog(s) : successLog(s, ms) };
  });
}

export const JOBS: Job[] = SEED.map(({ window: _w, failAt: _f, baseMs: _b, disposable, ...job }, i) => ({ ...job, disposable: disposable ?? false, runs: history(SEED[i]) }));

export function blankJob(id: string): Job {
  return {
    id,
    name: "",
    note: "",
    enabled: true,
    isNew: true,
    builder: B({ mode: "daily", hour: 9, minute: 0 }),
    zone: "Asia/Kathmandu",
    action: A({}),
    timeoutSec: 60,
    retries: 1,
    retryDelay: "1m",
    overlap: "skip",
    notify: [],
    disposable: false,
    runs: [],
  };
}

/** The part of a job the editor changes — runs and the pause switch act at once. */
export const editable = (j: Job) => JSON.stringify({ ...j, runs: 0, enabled: 0, isNew: 0 });

export const lastDone = (j: Job) => j.runs.find((r) => r.status !== "running");
export const isRunning = (j: Job) => j.runs.some((r) => r.status === "running");
export const isFailing = (j: Job) => lastDone(j)?.status === "failed";

/** A once-job whose one scheduled run has happened. Moving its date re-arms it. */
export function isDone(j: Job) {
  if (j.builder.mode !== "once") return false;
  const at = onceMs(j.builder);
  return at !== null && j.runs.some((r) => r.trigger === "schedule" && r.at === at && r.status !== "running");
}
