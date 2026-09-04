import * as React from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronRight,
  Diamond,
  Lock,
  Paperclip,
  MessageSquare,
  X,
  Loader2,
  Inbox,
  SearchX,
  FileText,
  GitBranch,
} from "lucide-react";
import { cn } from "../ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// PRODUCTIVITY · SHARED KERNEL
//
// One module, four surfaces (My Work · Portfolio · Project workspace · Task
// panel). Everything the surfaces must agree on lives here:
//   • the work grammar        (a task, its subtasks, its dependencies)
//   • the section grammar     (a project's own ordered buckets — Asana sections)
//   • the schedule vocabulary (overdue → today → soon → later, one tone ladder)
//   • the seed universe       (people · clients · projects · sections · tasks)
//
// Three rules are encoded structurally rather than by convention:
//   1. A TASK'S POSITION IS DATA. `order` inside `sectionId` is what drag-and-
//      drop writes. Nothing re-sorts silently behind the user's back.
//   2. A BLOCKED TASK CANNOT BE COMPLETED. `blockedBy` is resolved live from
//      the task set, so finishing a blocker unblocks its dependents on screen.
//   3. WORK KNOWS ITS DOCUMENT. Every task may carry `linkedDoc` — the ERP
//      record it exists because of. That link is what makes this Bizak's
//      productivity module and not a standalone to-do app.
// ════════════════════════════════════════════════════════════════════════════

// ── Paint constants ─────────────────────────────────────────────────────────

export const NUM = "tabular-nums";
export const CARD = "rounded-bz-lg border border-bz-line-soft bg-bz-surface";
export const SHADOW = "shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]";
export const SHADOW_SOFT = "shadow-[0_10px_28px_-18px_rgba(15,20,17,0.28)]";
export const LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";
export const PRIMARY_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-45";
export const GHOST_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-45";
export const GHOST_BTN_SM =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-45";
export const ICON_BTN =
  "inline-flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text";
export const INPUT =
  "h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper px-3 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted";

/** Danger is the one sanctioned literal in this system (see /CLAUDE.md). */
export const DANGER_BG = "#FBE5E2";
export const DANGER_TEXT = "#9A2E29";
export const DANGER_DOT = "#C0413A";

// ── Dates ───────────────────────────────────────────────────────────────────

export const TODAY = "2026-09-04";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const toInt = (iso: string) => Number(iso.replace(/-/g, ""));
export const g = (n: number) => n.toLocaleString("en-US");
export const money = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
export function fmtShort(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}
export function weekdayOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
export function daysBetween(a: string, b: string) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/** The one schedule ladder every surface reads. `null` = no due date. */
export type DueBand = "overdue" | "today" | "soon" | "later" | "none";

export function dueBand(due: string | null | undefined, today = TODAY): DueBand {
  if (!due) return "none";
  const delta = daysBetween(today, due);
  if (delta < 0) return "overdue";
  if (delta === 0) return "today";
  if (delta <= 6) return "soon";
  return "later";
}

export function dueLabel(due: string | null | undefined, today = TODAY) {
  if (!due) return "—";
  const delta = daysBetween(today, due);
  if (delta === 0) return "Today";
  if (delta === 1) return "Tomorrow";
  if (delta === -1) return "Yesterday";
  if (delta < 0 && delta >= -13) return `${-delta}d overdue`;
  if (delta > 1 && delta <= 6) return weekdayOf(due);
  return fmtShort(due);
}

// ════════════════════════════════════════════════════════════════════════════
// THE UNIVERSE
// ════════════════════════════════════════════════════════════════════════════

export type Person = { id: string; name: string; initials: string; team: string };

export const PEOPLE: Person[] = [
  { id: "EMP-101", name: "Manas Singh", initials: "MS", team: "Operations" },
  { id: "EMP-104", name: "Prakriti Adhikari", initials: "PA", team: "Implementation" },
  { id: "EMP-107", name: "Aayush Shrestha", initials: "AS", team: "Implementation" },
  { id: "EMP-112", name: "Bibek Thapa", initials: "BT", team: "Data & Migration" },
  { id: "EMP-118", name: "Sneha Maharjan", initials: "SM", team: "Finance" },
  { id: "EMP-121", name: "Rohan Gurung", initials: "RG", team: "Engineering" },
  { id: "EMP-126", name: "Nabin Karki", initials: "NK", team: "Support" },
];
export const ME = PEOPLE[0];
export const personById = (id: string) => PEOPLE.find((p) => p.id === id);

export type Client = { id: string; name: string };
export const CLIENTS: Client[] = [
  { id: "CUS-2201", name: "Everest Retail Pvt. Ltd." },
  { id: "CUS-2244", name: "Himalayan Java" },
  { id: "CUS-2118", name: "Nepal Telecom" },
  { id: "CUS-2307", name: "Sagarmatha Bank" },
];
export const clientById = (id: string | null) => (id ? CLIENTS.find((c) => c.id === id) : undefined);

export type ProjectHealth = "on_track" | "at_risk" | "off_track" | "not_started";

export type Project = {
  id: string;
  code: string;
  name: string;
  clientId: string | null;
  ownerId: string;
  memberIds: string[];
  start: string;
  end: string;
  health: ProjectHealth;
  status: string;
  /**
   * Hours SOLD — the commercial commitment, not a plan and not an actual.
   * Planned hours (the sum of task estimates) and logged hours (the sum of
   * timesheet lines) are both derived; keeping a third stored number here that
   * pretends to be either is how the three stop agreeing.
   */
  budgetHours: number;
  billedValue: number;
  contractValue: number;
  summary: string;
};

export const PROJECTS: Project[] = [
  {
    id: "PRJ-014",
    code: "EVR-ERP",
    name: "Everest Retail — ERP Rollout",
    clientId: "CUS-2201",
    ownerId: "EMP-104",
    memberIds: ["EMP-104", "EMP-107", "EMP-112", "EMP-118", "EMP-101"],
    start: "2026-07-06",
    end: "2026-11-28",
    health: "at_risk",
    status: "Awarded",
    budgetHours: 520,
    billedValue: 700_000,
    contractValue: 1_350_000,
    summary:
      "Full Bizak rollout across 9 outlets — finance, inventory and POS. Phase 2 (data migration) is the critical path; UAT cannot start until opening balances reconcile.",
  },
  {
    id: "PRJ-021",
    code: "HJ-POS",
    name: "Himalayan Java — POS Migration",
    clientId: "CUS-2244",
    ownerId: "EMP-107",
    memberIds: ["EMP-107", "EMP-126", "EMP-121"],
    start: "2026-08-11",
    end: "2026-10-17",
    health: "on_track",
    status: "In Progress",
    budgetHours: 175,
    billedValue: 165_000,
    contractValue: 455_000,
    summary: "Terminal-by-terminal cutover for 14 cafés with offline-first sync.",
  },
  {
    id: "PRJ-009",
    code: "NT-PAY",
    name: "Nepal Telecom — Payroll Integration",
    clientId: "CUS-2118",
    ownerId: "EMP-118",
    memberIds: ["EMP-118", "EMP-112", "EMP-101"],
    start: "2026-05-18",
    end: "2026-09-19",
    health: "off_track",
    status: "In Billing",
    budgetHours: 118,
    billedValue: 295_000,
    contractValue: 310_000,
    summary: "Attendance-to-payroll bridge. Over budget — scope change pending sign-off.",
  },
  {
    id: "PRJ-030",
    code: "BZK-42",
    name: "Bizak 4.2 — Product Release",
    clientId: null,
    ownerId: "EMP-121",
    memberIds: ["EMP-121", "EMP-101", "EMP-126"],
    start: "2026-08-01",
    end: "2026-12-12",
    health: "on_track",
    status: "In Progress",
    budgetHours: 190,
    billedValue: 0,
    contractValue: 0,
    summary: "Internal release train — dynamic forms, workflow v2, productivity module.",
  },
  {
    id: "PRJ-027",
    code: "SGB-CON",
    name: "Sagarmatha Bank — Statement Connector",
    clientId: "CUS-2307",
    ownerId: "EMP-121",
    memberIds: ["EMP-121", "EMP-112"],
    start: "2026-10-05",
    end: "2027-01-30",
    health: "not_started",
    status: "Awarded",
    budgetHours: 130,
    billedValue: 0,
    contractValue: 340_000,
    summary: "Direct bank feed for reconciliation. Kick-off blocked on client IT sign-off.",
  },
];
export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);

export const HEALTH_LABEL: Record<ProjectHealth, string> = {
  on_track: "On track",
  at_risk: "At risk",
  off_track: "Off track",
  not_started: "Not started",
};

// ── Sections (a project's own ordered buckets) ──────────────────────────────

export type Section = { id: string; projectId: string; name: string };

export const SECTIONS: Section[] = [
  { id: "SEC-1", projectId: "PRJ-014", name: "Discovery" },
  { id: "SEC-2", projectId: "PRJ-014", name: "Configuration" },
  { id: "SEC-3", projectId: "PRJ-014", name: "Data migration" },
  { id: "SEC-4", projectId: "PRJ-014", name: "UAT" },
  { id: "SEC-5", projectId: "PRJ-014", name: "Go-live" },
];

// ── Tasks ───────────────────────────────────────────────────────────────────

export type TaskStatus = "not_started" | "in_progress" | "on_hold" | "completed";
export type Priority = "low" | "medium" | "high" | "urgent";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
};
export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
export const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export type LinkedDoc = { kind: string; no: string };

export type Task = {
  id: string;
  docNo: string;
  projectId: string;
  sectionId: string;
  parentId: string | null;
  title: string;
  assigneeIds: string[];
  status: TaskStatus;
  priority: Priority;
  start: string | null;
  due: string | null;
  /**
   * Budgeted hours for THIS task. A task with subtasks does not carry its own —
   * its estimate is the sum of its children (see `estimateOf`), which is the only
   * way a roll-up cannot double-count.
   */
  estimatedHours: number | null;
  isMilestone?: boolean;
  billable?: boolean;
  blockedBy: string[];
  tags: string[];
  linkedDoc?: LinkedDoc;
  comments: number;
  attachments: number;
  note?: string;
  order: number;
};

// ── Activities · the billing dimension a timesheet line carries ────────────
export type Activity = { id: string; name: string; billable: boolean };

export const ACTIVITIES: Activity[] = [
  { id: "ACT-01", name: "Consulting", billable: true },
  { id: "ACT-02", name: "Data migration", billable: true },
  { id: "ACT-03", name: "Development", billable: true },
  { id: "ACT-04", name: "Training", billable: true },
  { id: "ACT-05", name: "Project management", billable: false },
];
export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id);

/**
 * One timesheet line. THIS is where hours live — a task never stores a logged
 * total, it is summed from these. That is the whole point: the number on screen
 * has to be openable, or nobody can argue with it when it looks wrong.
 */
export type TimeEntry = {
  id: string;
  taskId: string;
  personId: string;
  date: string;
  hours: number;
  /** Null for internal time. Required only when `billable` — see `activityRequired`. */
  activityId: string | null;
  billable: boolean;

  // Three INDEPENDENT facts, because they are three independent columns and two
  // unrelated consumers. A line can be paid to the employee and not yet invoiced
  // to the customer, or the reverse. Folding them into one status would force a
  // ranking between billing and payroll that does not exist.
  /** The timesheet period was approved — it now feeds project costing. */
  approved: boolean;
  /** INVOICED_DETAIL_ID is set — the customer has been billed for this hour. */
  invoiced: boolean;
  /** PAYROLL_REF_ID is stamped — payroll has already paid for this hour. */
  paid: boolean;
};

// ════════════════════════════════════════════════════════════════════════════
// ATTENDANCE SOURCE  (GLOBAL_DEFAULTS.ATTENDANCE_SOURCE)
//
// Which half of the HR product the tenant bought into — and it changes what a
// timesheet hour IS:
//
//   attendance  people punch in and out; punches decide pay. The timesheet is
//               a costing and billing tool, so typing an hour here is cheap.
//   timesheet   nobody punches; the typed hours ARE the record of the day, and
//               the attendance run reads them instead of the punch table. From
//               that point an hour decides somebody's PAY.
//
// So the same control cannot be offered in both. Under `timesheet` hours are
// entered and corrected on the timesheet screen, where the period lock, the
// approval and the payroll consume all live; the task panel reads them only.
// ════════════════════════════════════════════════════════════════════════════

export type AttendanceSource = "attendance" | "timesheet";

const SOURCE_KEY = "bz.attendanceSource";

function readSource(): AttendanceSource {
  try {
    return localStorage.getItem(SOURCE_KEY) === "timesheet" ? "timesheet" : "attendance";
  } catch {
    return "attendance";
  }
}

let currentSource: AttendanceSource = readSource();
const sourceListeners = new Set<() => void>();

export function setAttendanceSource(v: AttendanceSource) {
  currentSource = v;
  try {
    localStorage.setItem(SOURCE_KEY, v);
  } catch {
    /* a private window just keeps it for this session */
  }
  sourceListeners.forEach((l) => l());
}

/** Tenant-wide, so every surface reads the same value and re-renders together. */
export function useAttendanceSource(): AttendanceSource {
  return React.useSyncExternalStore(
    (cb) => {
      sourceListeners.add(cb);
      return () => sourceListeners.delete(cb);
    },
    () => currentSource,
    () => "attendance" as AttendanceSource,
  );
}

/**
 * The strongest thing that has happened to this line, for the chip. Ordered by
 * how hard it is to undo: you can reopen a period, you can credit an invoice,
 * you cannot un-pay a salary.
 */
export function entryStatusChip(e: TimeEntry): string | null {
  if (e.paid) return "Paid";
  if (e.invoiced) return "Invoiced";
  if (e.approved) return "Approved";
  return null;
}

/** Why a line cannot be removed — phrased for the person looking at it. */
export function entryLockReason(e: TimeEntry, source: AttendanceSource): string | null {
  if (e.paid)
    return "Paid — payroll has already consumed these hours (PAYROLL_REF_ID is stamped). Release the payroll period before touching them.";
  if (e.invoiced)
    return "Invoiced — the customer has already been billed for this hour. Credit the invoice instead.";
  if (e.approved) return `Approved — ${approvedMeans(source)}. Reopen the timesheet period to change it.`;
  if (source === "timesheet")
    return "Hours decide pay in this tenant, so they are entered and corrected on the timesheet — where the period lock and approvals are.";
  return null;
}

/**
 * An hour can be removed from here only when removing it is cheap: nothing has
 * consumed it, and it is not the thing that pays somebody.
 */
export const canRemoveEntry = (e: TimeEntry, source: AttendanceSource) =>
  entryLockReason(e, source) === null;

/** What "approved" costs, which is not the same in the two modes. */
export const approvedMeans = (source: AttendanceSource) =>
  source === "timesheet"
    ? "counted in project costing and in what payroll paid for the period"
    : "counted in project costing";

// ── The two billing rules, stated once so no screen can forget one ─────────

/**
 * An hour can only be charged to somebody. The customer is the PROJECT's party,
 * so a task on a project with no customer — an internal project — can never be
 * billable, however the switch is set.
 */
export function billableEligible(projectId: string): { ok: boolean; customer?: string; why?: string } {
  const project = projectById(projectId);
  if (!project) return { ok: false, why: "This task has no project, so there is no customer to bill." };
  const client = clientById(project.clientId);
  if (!client) return { ok: false, why: `${project.name} is internal — there is no customer to bill.` };
  return { ok: true, customer: client.name };
}

/**
 * A billable hour becomes an invoice line, and that line's service item IS the
 * activity's item. Billable without an activity could never be invoiced — so the
 * activity is required exactly when the hour is billable, and optional otherwise.
 */
export const activityRequired = (billable: boolean) => billable;

/** Collected while the seed is declared, expanded into entries below. */
const RAW_TIME: { taskId: string; personId: string; hours: number; activityId: string; end: string }[] = [];

const activityFor = (tags: string[], sectionId: string): string => {
  if (tags.includes("migration")) return "ACT-02";
  if (tags.includes("training") || tags.includes("uat")) return "ACT-04";
  if (tags.includes("finance")) return "ACT-01";
  if (sectionId === "SEC-X") return "ACT-03";
  return "ACT-01";
};

let seq = 0;
const t = (x: Omit<Task, "order" | "docNo"> & { docNo?: string; logged?: number }): Task => {
  const { logged, ...task } = x;
  if (logged) {
    RAW_TIME.push({
      taskId: x.id,
      personId: x.assigneeIds[0] ?? ME.id,
      hours: logged,
      activityId: activityFor(x.tags, x.sectionId),
      end: x.due ?? TODAY,
    });
  }
  return {
    ...task,
    docNo: x.docNo ?? `TSK-${String(4100 + seq).padStart(4, "0")}`,
    order: seq++,
  };
};

/**
 * Filler for the projects the design does not open — same shape as a real task,
 * just terser to declare. `SEC-X` is deliberately not a section of any project,
 * so none of these can leak onto a board.
 */
const bulk = (
  projectId: string,
  ownerId: string,
  rows: [title: string, status: TaskStatus, due: string][],
): Task[] =>
  rows.map(([title, status, due], i) =>
    t({
      id: `${projectId}-F${i}`,
      projectId,
      sectionId: "SEC-X",
      parentId: null,
      title,
      assigneeIds: [ownerId],
      status,
      priority: "medium",
      start: null,
      due,
      estimatedHours: 16,
      logged: status === "completed" ? 16 : status === "in_progress" ? 7 : 0,
      blockedBy: [],
      tags: [],
      comments: 0,
      attachments: 0,
    }),
  );

export const SEED_TASKS: Task[] = [
  // ── Discovery ────────────────────────────────────────────────────────────
  t({
    id: "T-01", projectId: "PRJ-014", sectionId: "SEC-1", parentId: null,
    title: "Outlet process walkthrough — 9 stores",
    assigneeIds: ["EMP-104"], status: "completed", priority: "high",
    start: "2026-07-06", due: "2026-07-24", estimatedHours: 60, logged: 64,
    blockedBy: [], tags: ["discovery"], comments: 6, attachments: 3,
  }),
  t({
    id: "T-02", projectId: "PRJ-014", sectionId: "SEC-1", parentId: null,
    title: "Chart of accounts mapping signed off",
    assigneeIds: ["EMP-118"], status: "completed", priority: "urgent",
    start: "2026-07-14", due: "2026-08-01", estimatedHours: 24, logged: 27,
    isMilestone: true, blockedBy: [], tags: ["finance"], comments: 12, attachments: 5,
    linkedDoc: { kind: "Chart of Accounts", no: "COA-2026" },
  }),
  t({
    id: "T-03", projectId: "PRJ-014", sectionId: "SEC-1", parentId: null,
    title: "Approval matrix for purchase above Rs 200,000",
    assigneeIds: ["EMP-104", "EMP-101"], status: "completed", priority: "medium",
    start: "2026-07-20", due: "2026-08-08", estimatedHours: 16, logged: 14,
    blockedBy: [], tags: ["workflow"], comments: 3, attachments: 1,
  }),

  // ── Configuration ────────────────────────────────────────────────────────
  t({
    id: "T-10", projectId: "PRJ-014", sectionId: "SEC-2", parentId: null,
    title: "Configure subsidiaries & outlet locations",
    assigneeIds: ["EMP-107"], status: "completed", priority: "high",
    start: "2026-08-04", due: "2026-08-22", estimatedHours: 40, logged: 43,
    blockedBy: [], tags: ["setup"], comments: 4, attachments: 0,
  }),
  t({
    id: "T-11", projectId: "PRJ-014", sectionId: "SEC-2", parentId: null,
    title: "Auto-numbering series per outlet & fiscal year",
    assigneeIds: ["EMP-107"], status: "in_progress", priority: "high",
    start: "2026-08-25", due: "2026-09-05", estimatedHours: 18, logged: 11,
    blockedBy: [], tags: ["setup"], comments: 2, attachments: 1,
    note: "Boundary case: FY-crossing documents must draw from the new year's counter.",
  }),
  t({
    id: "T-11a", projectId: "PRJ-014", sectionId: "SEC-2", parentId: "T-11",
    title: "Define prefix convention with client finance",
    assigneeIds: ["EMP-118"], status: "completed", priority: "medium",
    start: null, due: "2026-08-29", estimatedHours: 4, logged: 4,
    blockedBy: [], tags: [], comments: 1, attachments: 0,
  }),
  t({
    id: "T-11b", projectId: "PRJ-014", sectionId: "SEC-2", parentId: "T-11",
    title: "Seed series for FY 2083/84",
    assigneeIds: ["EMP-107"], status: "in_progress", priority: "high",
    start: null, due: "2026-09-04", estimatedHours: 6, logged: 3,
    blockedBy: [], tags: [], comments: 0, attachments: 0,
  }),
  t({
    id: "T-11c", projectId: "PRJ-014", sectionId: "SEC-2", parentId: "T-11",
    title: "Verify on a back-dated purchase order",
    assigneeIds: ["EMP-101"], status: "not_started", priority: "medium",
    start: null, due: "2026-09-09", estimatedHours: 3, logged: 0,
    blockedBy: ["T-11b"], tags: [], comments: 0, attachments: 0,
  }),
  t({
    id: "T-12", projectId: "PRJ-014", sectionId: "SEC-2", parentId: null,
    title: "Purchase approval workflow — 3 states, 2 approvers",
    assigneeIds: ["EMP-101"], status: "in_progress", priority: "urgent",
    start: "2026-08-28", due: "2026-09-02", estimatedHours: 22, logged: 19,
    blockedBy: [], tags: ["workflow"], comments: 8, attachments: 2,
    linkedDoc: { kind: "Purchase Order", no: "PO-3318" },
  }),
  t({
    id: "T-13", projectId: "PRJ-014", sectionId: "SEC-2", parentId: null,
    title: "Role & permission matrix for 42 store users",
    assigneeIds: ["EMP-104", "EMP-126"], status: "in_progress", priority: "high",
    start: "2026-09-01", due: "2026-09-12", estimatedHours: 30, logged: 8,
    blockedBy: [], tags: ["access"], comments: 1, attachments: 0,
  }),
  t({
    id: "T-14", projectId: "PRJ-014", sectionId: "SEC-2", parentId: null,
    title: "Print templates — invoice, challan, POS receipt",
    assigneeIds: ["EMP-107"], status: "not_started", priority: "medium",
    start: "2026-09-08", due: "2026-09-22", estimatedHours: 26, logged: 0,
    blockedBy: [], tags: ["setup"], comments: 0, attachments: 4,
  }),

  // ── Data migration ───────────────────────────────────────────────────────
  t({
    id: "T-20", projectId: "PRJ-014", sectionId: "SEC-3", parentId: null,
    title: "Item master import — 11,480 SKUs",
    assigneeIds: ["EMP-112"], status: "in_progress", priority: "urgent",
    start: "2026-08-18", due: "2026-09-03", estimatedHours: 48, logged: 52,
    blockedBy: [], tags: ["migration"], comments: 14, attachments: 7,
    note: "Third pass. 214 rows still rejected on duplicate barcode.",
  }),
  t({
    id: "T-20a", projectId: "PRJ-014", sectionId: "SEC-3", parentId: "T-20",
    title: "De-duplicate barcodes across outlets",
    assigneeIds: ["EMP-112"], status: "in_progress", priority: "urgent",
    start: null, due: "2026-09-03", estimatedHours: 12, logged: 9,
    blockedBy: [], tags: [], comments: 3, attachments: 1,
  }),
  t({
    id: "T-20b", projectId: "PRJ-014", sectionId: "SEC-3", parentId: "T-20",
    title: "Re-run import & publish rejection report",
    assigneeIds: ["EMP-112"], status: "not_started", priority: "high",
    start: null, due: "2026-09-05", estimatedHours: 6, logged: 0,
    blockedBy: ["T-20a"], tags: [], comments: 0, attachments: 0,
  }),
  t({
    id: "T-21", projectId: "PRJ-014", sectionId: "SEC-3", parentId: null,
    title: "Opening balances — AR / AP / stock valuation",
    assigneeIds: ["EMP-118", "EMP-112"], status: "not_started", priority: "urgent",
    start: "2026-09-05", due: "2026-09-18", estimatedHours: 44, logged: 0,
    blockedBy: ["T-20"], tags: ["finance", "migration"], comments: 2, attachments: 0,
    linkedDoc: { kind: "Journal Entry", no: "JE-1042" },
  }),
  t({
    id: "T-22", projectId: "PRJ-014", sectionId: "SEC-3", parentId: null,
    title: "Migration sign-off from client finance",
    assigneeIds: ["EMP-104"], status: "not_started", priority: "urgent",
    start: null, due: "2026-09-25", estimatedHours: 8, logged: 0,
    isMilestone: true, blockedBy: ["T-21"], tags: ["milestone"], comments: 0, attachments: 0,
  }),

  // ── UAT ──────────────────────────────────────────────────────────────────
  t({
    id: "T-30", projectId: "PRJ-014", sectionId: "SEC-4", parentId: null,
    title: "Write 84 UAT scripts across 6 modules",
    assigneeIds: ["EMP-126"], status: "in_progress", priority: "medium",
    start: "2026-09-01", due: "2026-09-26", estimatedHours: 52, logged: 14,
    blockedBy: [], tags: ["uat"], comments: 1, attachments: 2,
  }),
  t({
    id: "T-31", projectId: "PRJ-014", sectionId: "SEC-4", parentId: null,
    title: "Train 42 store users — 3 cohorts",
    assigneeIds: ["EMP-104", "EMP-126"], status: "not_started", priority: "high",
    start: "2026-09-29", due: "2026-10-17", estimatedHours: 72, logged: 0,
    blockedBy: ["T-22"], tags: ["training"], comments: 0, attachments: 1,
  }),
  t({
    id: "T-32", projectId: "PRJ-014", sectionId: "SEC-4", parentId: null,
    title: "UAT complete — client acceptance",
    assigneeIds: ["EMP-104"], status: "not_started", priority: "urgent",
    start: null, due: "2026-10-31", estimatedHours: 10, logged: 0,
    isMilestone: true, blockedBy: ["T-30", "T-31"], tags: ["milestone"], comments: 0, attachments: 0,
  }),

  // ── Go-live ──────────────────────────────────────────────────────────────
  t({
    id: "T-40", projectId: "PRJ-014", sectionId: "SEC-5", parentId: null,
    title: "Cutover runbook & rollback plan",
    assigneeIds: ["EMP-101"], status: "not_started", priority: "high",
    start: "2026-10-20", due: "2026-11-07", estimatedHours: 20, logged: 0,
    blockedBy: [], tags: ["cutover"], comments: 0, attachments: 0,
  }),
  t({
    id: "T-41", projectId: "PRJ-014", sectionId: "SEC-5", parentId: null,
    title: "Go-live — all 9 outlets",
    assigneeIds: ["EMP-104", "EMP-107"], status: "not_started", priority: "urgent",
    start: null, due: "2026-11-14", estimatedHours: 40, logged: 0,
    isMilestone: true, blockedBy: ["T-32", "T-40"], tags: ["milestone"], comments: 1, attachments: 0,
  }),
  t({
    id: "T-42", projectId: "PRJ-014", sectionId: "SEC-5", parentId: null,
    title: "Hypercare — 2 weeks on-site support",
    assigneeIds: ["EMP-126"], status: "not_started", priority: "medium",
    start: "2026-11-16", due: "2026-11-28", estimatedHours: 60, logged: 0,
    blockedBy: ["T-41"], tags: ["support"], comments: 0, attachments: 0,
  }),
  t({
    id: "T-43", projectId: "PRJ-014", sectionId: "SEC-5", parentId: null,
    title: "Final invoice & project close",
    assigneeIds: ["EMP-118"], status: "on_hold", priority: "low",
    start: null, due: "2026-12-05", estimatedHours: 6, logged: 0,
    blockedBy: ["T-42"], tags: ["finance"], comments: 0, attachments: 0,
    linkedDoc: { kind: "Sales Invoice", no: "INV-8842" },
  }),

  // ── Cross-project work (feeds My Work, never the Everest board) ──────────
  t({
    id: "X-01", projectId: "PRJ-021", sectionId: "SEC-X", parentId: null,
    title: "Offline sync conflict on terminal 4",
    assigneeIds: ["EMP-101"], status: "in_progress", priority: "urgent",
    start: "2026-09-01", due: "2026-09-02", estimatedHours: 8, logged: 6,
    blockedBy: [], tags: ["defect"], comments: 5, attachments: 2,
    linkedDoc: { kind: "Support Ticket", no: "SUP-771" },
  }),
  t({
    id: "X-02", projectId: "PRJ-021", sectionId: "SEC-X", parentId: null,
    title: "Sign off café #7 terminal config",
    assigneeIds: ["EMP-101"], status: "not_started", priority: "medium",
    start: null, due: "2026-09-04", estimatedHours: 2, logged: 0,
    blockedBy: [], tags: [], comments: 0, attachments: 0,
  }),
  t({
    id: "X-03", projectId: "PRJ-009", sectionId: "SEC-X", parentId: null,
    title: "Approve August payroll variance report",
    assigneeIds: ["EMP-101"], status: "not_started", priority: "high",
    start: null, due: "2026-09-04", estimatedHours: 1.5, logged: 0,
    blockedBy: [], tags: ["approval"], comments: 2, attachments: 1,
    linkedDoc: { kind: "Attendance Run", no: "ATT-2083-05" },
  }),
  t({
    id: "X-04", projectId: "PRJ-030", sectionId: "SEC-X", parentId: null,
    title: "Review productivity module design with Rohan",
    assigneeIds: ["EMP-101", "EMP-121"], status: "not_started", priority: "medium",
    start: null, due: "2026-09-08", estimatedHours: 2, logged: 0,
    blockedBy: [], tags: [], comments: 0, attachments: 0,
  }),
  t({
    id: "X-05", projectId: "PRJ-030", sectionId: "SEC-X", parentId: null,
    title: "Write release notes for 4.2 beta",
    assigneeIds: ["EMP-101"], status: "not_started", priority: "low",
    start: null, due: "2026-09-19", estimatedHours: 4, logged: 0,
    blockedBy: [], tags: [], comments: 0, attachments: 0,
  }),
  t({
    id: "X-06", projectId: "PRJ-009", sectionId: "SEC-X", parentId: null,
    title: "Scope-change memo for Nepal Telecom overrun",
    assigneeIds: ["EMP-101", "EMP-118"], status: "on_hold", priority: "urgent",
    start: "2026-08-20", due: "2026-08-29", estimatedHours: 6, logged: 2,
    blockedBy: [], tags: ["escalation"], comments: 9, attachments: 3,
  }),

  // ── Body of the other projects ───────────────────────────────────────────
  // Not shown on the Everest board (different project), but the portfolio's
  // percentages are only honest if every project carries a real task set — a
  // two-task project reads as 0% and slanders a healthy team.
  ...bulk("PRJ-021", "EMP-107", [
    ["Terminal hardware audit — 14 cafés", "completed", "2026-08-22"],
    ["Menu & modifier data mapping", "completed", "2026-08-29"],
    ["Offline-first sync spike", "completed", "2026-09-01"],
    ["Pilot cutover — Thamel branch", "completed", "2026-09-02"],
    ["Cashier training deck", "in_progress", "2026-09-11"],
    ["Loyalty balance carry-over", "not_started", "2026-09-25"],
    ["Roll out remaining 12 terminals", "not_started", "2026-10-10"],
  ]),
  ...bulk("PRJ-009", "EMP-118", [
    ["Attendance device feed mapping", "completed", "2026-06-05"],
    ["Shift & overtime rule matrix", "completed", "2026-06-26"],
    ["Payroll component mapping", "completed", "2026-07-10"],
    ["Provident fund & CIT deductions", "completed", "2026-07-24"],
    ["Parallel run — Ashad payroll", "completed", "2026-08-07"],
    ["Parallel run — Shrawan payroll", "completed", "2026-08-21"],
    ["Variance sign-off with client HR", "completed", "2026-08-28"],
    ["Cut over to live payroll", "in_progress", "2026-09-12"],
  ]),
  ...bulk("PRJ-030", "EMP-121", [
    ["Dynamic forms — child grids", "completed", "2026-08-15"],
    ["Workflow v2 — transition rules", "completed", "2026-08-29"],
    ["Productivity module — data model", "completed", "2026-09-02"],
    ["Productivity module — board & list", "in_progress", "2026-09-19"],
    ["Timeline & dependencies", "not_started", "2026-10-03"],
    ["Mobile queue", "not_started", "2026-10-24"],
    ["Beta with three tenants", "not_started", "2026-11-14"],
    ["Release 4.2", "not_started", "2026-12-12"],
  ]),
];

// ════════════════════════════════════════════════════════════════════════════
// TIME ENTRIES
//
// Built from the seed's per-task totals rather than typed out, so the entry
// list and the total it rolls up to cannot drift apart. Hours are laid down
// backwards from the task's due date over working days, in shifts of at most 8h.
// ════════════════════════════════════════════════════════════════════════════

function expandTime(): TimeEntry[] {
  const out: TimeEntry[] = [];
  let n = 0;
  for (const r of RAW_TIME) {
    let remaining = r.hours;
    let day = r.end;
    let guard = 0;
    while (remaining > 0.001 && guard++ < 40) {
      const wd = weekdayOf(day);
      if (wd === "Sat" || wd === "Sun") {
        day = addDays(day, -1);
        continue;
      }
      const hours = Math.min(8, Math.round(remaining * 4) / 4);
      const seedBillable =
        billableEligible(SEED_TASKS.find((t) => t.id === r.taskId)?.projectId ?? "").ok &&
        (activityById(r.activityId)?.billable ?? false);
      const age = daysBetween(day, TODAY);
      out.push({
        id: `TE-${String(++n).padStart(4, "0")}`,
        taskId: r.taskId,
        personId: r.personId,
        date: day,
        hours,
        activityId: r.activityId,
        // Seeded lines follow the same rule as typed ones.
        billable: seedBillable,
        // Age stands in for the real lifecycle. The three run on their own
        // clocks: approval is weekly, invoicing follows the billing run, payroll
        // closes a month behind — so an old line can be paid but not yet billed.
        approved: age > 7,
        invoiced: age > 28 && seedBillable,
        paid: age > 35,
      });
      remaining -= hours;
      day = addDays(day, -1);
    }
  }
  return out;
}

export const SEED_TIME_ENTRIES: TimeEntry[] = expandTime();

// ════════════════════════════════════════════════════════════════════════════
// DERIVATIONS  (everything the surfaces read is computed, never stored twice)
// ════════════════════════════════════════════════════════════════════════════

export const isDone = (t: Task) => t.status === "completed";

export const childrenOf = (tasks: Task[], id: string) =>
  tasks.filter((x) => x.parentId === id).sort((a, b) => a.order - b.order);

export const rootsOf = (tasks: Task[]) => tasks.filter((x) => x.parentId === null);

/** Direct-subtask completion, the number the row and the card both show. */
export function subtaskProgress(tasks: Task[], id: string) {
  const kids = childrenOf(tasks, id);
  if (!kids.length) return null;
  const done = kids.filter(isDone).length;
  return { done, total: kids.length, pct: Math.round((done / kids.length) * 100) };
}

/** A task is blocked while any of its blockers is unfinished. Live, not stored. */
export function openBlockers(tasks: Task[], t: Task) {
  return t.blockedBy.map((id) => tasks.find((x) => x.id === id)).filter((x): x is Task => !!x && !isDone(x));
}
export const isBlocked = (tasks: Task[], t: Task) => openBlockers(tasks, t).length > 0;

/** The other half of the edge — what this task is holding up. */
export const blocking = (tasks: Task[], id: string) => tasks.filter((x) => x.blockedBy.includes(id));

export function projectProgress(tasks: Task[], projectId: string) {
  const rows = tasks.filter((x) => x.projectId === projectId);
  const total = rows.length;
  const done = rows.filter(isDone).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

// ── Hours ───────────────────────────────────────────────────────────────────

/** The entries booked directly against one task, newest first. */
export const entriesFor = (entries: TimeEntry[], taskId: string) =>
  entries.filter((e) => e.taskId === taskId).sort((a, b) => b.date.localeCompare(a.date));

/** Hours booked directly against one task. */
export const loggedOn = (entries: TimeEntry[], taskId: string) =>
  entries.reduce((s, e) => (e.taskId === taskId ? s + e.hours : s), 0);

/** Every task beneath this one, at any depth. */
export function descendantIds(tasks: Task[], id: string): string[] {
  const kids = tasks.filter((t) => t.parentId === id);
  return kids.flatMap((k) => [k.id, ...descendantIds(tasks, k.id)]);
}

/** Hours on this task PLUS everything under it. */
export function loggedRollup(tasks: Task[], entries: TimeEntry[], id: string) {
  const ids = new Set([id, ...descendantIds(tasks, id)]);
  return entries.reduce((s, e) => (ids.has(e.taskId) ? s + e.hours : s), 0);
}

/**
 * The estimate that counts for this task. A parent NEVER contributes its own
 * number on top of its children — if it has subtasks, its estimate IS their sum.
 * Any other rule double-counts the moment someone estimates both levels.
 * Returns null when nothing in the subtree is estimated.
 */
export function estimateOf(tasks: Task[], id: string): number | null {
  const kids = tasks.filter((t) => t.parentId === id);
  if (kids.length) {
    const parts = kids.map((k) => estimateOf(tasks, k.id)).filter((x): x is number => x !== null);
    return parts.length ? parts.reduce((a, b) => a + b, 0) : null;
  }
  return tasks.find((t) => t.id === id)?.estimatedHours ?? null;
}

/** True when this task's estimate is owned by its subtasks, not by itself. */
export const estimateIsRolledUp = (tasks: Task[], id: string) =>
  tasks.some((t) => t.parentId === id);

/** Planned hours for a project: the roots' roll-ups, so nothing counts twice. */
export function projectPlanned(tasks: Task[], projectId: string) {
  return tasks
    .filter((t) => t.projectId === projectId && t.parentId === null)
    .reduce((s, t) => s + (estimateOf(tasks, t.id) ?? 0), 0);
}

export function projectLogged(tasks: Task[], entries: TimeEntry[], projectId: string) {
  const ids = new Set(tasks.filter((t) => t.projectId === projectId).map((t) => t.id));
  return entries.reduce((s, e) => (ids.has(e.taskId) ? s + e.hours : s), 0);
}

/**
 * Leaf tasks carrying no estimate. A "planned" total that quietly omits them
 * reads as complete and is not — so every surface that shows planned hours
 * shows this next to it.
 */
export function unestimatedTasks(tasks: Task[], projectId: string) {
  return tasks.filter(
    (t) =>
      t.projectId === projectId &&
      !tasks.some((c) => c.parentId === t.id) &&
      (t.estimatedHours === null || t.estimatedHours === undefined),
  );
}

export const fmtH = (n: number) => n.toFixed(2);
export const fmtHShort = (n: number) => (n === 0 ? "—" : String(Number(n.toFixed(2))));

// ── The working calendar (onboarding default: Sun–Fri, 8h) ────────────────

export const EXPECTED_HOURS_PER_DAY = 8;
export const isWorkingDay = (iso: string) => weekdayOf(iso) !== "Sat";

/**
 * TIMESHEET_BLOCK_PAYROLL_ON_MISSING. When true the payroll run refuses to
 * proceed while a working day is unfilled, rather than warning and paying
 * anyway. Modelled as on so the stronger consequence is visible.
 */
export const BLOCK_PAYROLL_ON_MISSING = true;

/** The current weekly period (TIMESHEET_PERIOD_TYPE = Weekly, week starts Sunday). */
export function currentPeriodDays(today = TODAY): string[] {
  const back = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekdayOf(today));
  const start = addDays(today, -back);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const hoursOnDay = (entries: TimeEntry[], personId: string, iso: string) =>
  entries.reduce((s, e) => (e.personId === personId && e.date === iso ? s + e.hours : s), 0);

/**
 * Working days in the period, up to today, that carry no hours at all. In
 * timesheet mode these are not untidiness — they are somebody's missing pay.
 */
export function unfilledDays(entries: TimeEntry[], personId: string, today = TODAY) {
  return currentPeriodDays(today).filter(
    (d) => isWorkingDay(d) && d <= today && hoursOnDay(entries, personId, d) === 0,
  );
}

export function periodFiled(entries: TimeEntry[], personId: string, today = TODAY) {
  const days = currentPeriodDays(today).filter((d) => d <= today);
  const filed = days.reduce((s, d) => s + hoursOnDay(entries, personId, d), 0);
  const expected = days.filter(isWorkingDay).length * EXPECTED_HOURS_PER_DAY;
  return { filed, expected, days };
}

export function overdueCount(tasks: Task[], projectId?: string) {
  return tasks.filter(
    (x) => (!projectId || x.projectId === projectId) && !isDone(x) && dueBand(x.due) === "overdue",
  ).length;
}

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

const AVATAR_TONE = [
  "bg-bz-olive text-bz-text-on-dark",
  "bg-bz-leaf text-bz-text",
  "bz-avatar-fire",
  "bg-bz-paper-warm text-bz-text",
  "bg-bz-olive-soft text-bz-text-on-dark",
];

export function Avatar({
  person,
  size = 22,
  ring,
}: {
  person: Person | undefined;
  size?: number;
  ring?: boolean;
}) {
  if (!person) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-bz-pill border border-dashed border-bz-line text-bz-text-soft"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        title="Unassigned"
      >
        ?
      </span>
    );
  }
  const idx = PEOPLE.findIndex((p) => p.id === person.id) % AVATAR_TONE.length;
  const tone = AVATAR_TONE[idx];
  const fire = tone === "bz-avatar-fire";
  return (
    <span
      title={`${person.name} · ${person.team}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-bz-pill font-semibold",
        fire ? "bg-bz-fire text-bz-olive" : tone,
        ring && "ring-2 ring-bz-surface",
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {person.initials}
    </span>
  );
}

export function AvatarStack({ ids, size = 22, max = 3 }: { ids: string[]; size?: number; max?: number }) {
  if (!ids.length) return <Avatar person={undefined} size={size} />;
  const shown = ids.slice(0, max);
  const rest = ids.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((id, i) => (
        <span key={id} className={i === 0 ? "" : "-ml-1.5"}>
          <Avatar person={personById(id)} size={size} ring={shown.length > 1} />
        </span>
      ))}
      {rest > 0 && (
        <span
          className="-ml-1.5 inline-flex items-center justify-center rounded-bz-pill bg-bz-paper-warm font-semibold text-bz-text-muted ring-2 ring-bz-surface"
          style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
        >
          +{rest}
        </span>
      )}
    </span>
  );
}

// ── Chips ───────────────────────────────────────────────────────────────────

export type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";

const CHIP_BG: Record<Tone, string> = {
  positive: "bg-bz-fire/[0.20] text-bz-text",
  partial: "bg-bz-leaf/50 text-bz-text",
  pending: "bg-bz-paper-warm text-bz-text-muted",
  danger: "",
  neutral: "bg-bz-paper-warm text-bz-text",
};
const DOT_BG: Record<Tone, string> = {
  positive: "bg-bz-leaf-deep",
  partial: "bg-bz-fire",
  pending: "bg-bz-line",
  danger: "",
  neutral: "bg-bz-text-soft",
};

export function Chip({
  label,
  tone,
  dot = true,
  className,
}: {
  label: React.ReactNode;
  tone: Tone;
  dot?: boolean;
  className?: string;
}) {
  const danger = tone === "danger";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium",
        CHIP_BG[tone],
        className,
      )}
      style={danger ? { background: DANGER_BG, color: DANGER_TEXT } : undefined}
    >
      {dot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-bz-pill", DOT_BG[tone])}
          style={danger ? { background: DANGER_DOT } : undefined}
        />
      )}
      {label}
    </span>
  );
}

export const STATUS_TONE: Record<TaskStatus, Tone> = {
  not_started: "pending",
  in_progress: "partial",
  on_hold: "neutral",
  completed: "positive",
};

export function StatusChip({ status }: { status: TaskStatus }) {
  return <Chip label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />;
}

/** Priority is a rank, so it reads as a bar-mark, not another coloured pill. */
export function PriorityMark({ p, withLabel = true }: { p: Priority; withLabel?: boolean }) {
  const filled = 4 - PRIORITY_RANK[p];
  const urgent = p === "urgent";
  return (
    <span className="inline-flex items-center gap-1.5" title={`Priority · ${PRIORITY_LABEL[p]}`}>
      <span className="inline-flex items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-[1px]",
              i < filled ? (urgent ? "" : "bg-bz-text-muted") : "bg-bz-line",
            )}
            style={{
              height: 4 + i * 2.5,
              ...(i < filled && urgent ? { background: DANGER_DOT } : {}),
            }}
          />
        ))}
      </span>
      {withLabel && (
        <span
          className={cn("text-[11px] font-medium", urgent ? "" : "text-bz-text-muted")}
          style={urgent ? { color: DANGER_TEXT } : undefined}
        >
          {PRIORITY_LABEL[p]}
        </span>
      )}
    </span>
  );
}

export function DueChip({ due, done }: { due: string | null | undefined; done?: boolean }) {
  const band = dueBand(due);
  if (band === "none") return <span className="text-[11.5px] text-bz-text-soft">—</span>;
  if (done)
    return <span className={cn("text-[11.5px] text-bz-text-soft", NUM)}>{fmtShort(due!)}</span>;
  if (band === "overdue")
    return (
      <span
        className={cn("inline-flex items-center gap-1 rounded-bz-sm px-1.5 py-0.5 text-[11px] font-semibold", NUM)}
        style={{ background: DANGER_BG, color: DANGER_TEXT }}
      >
        {dueLabel(due)}
      </span>
    );
  if (band === "today")
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-bz-sm bg-bz-fire/[0.28] px-1.5 py-0.5 text-[11px] font-semibold text-bz-text", NUM)}>
        Today
      </span>
    );
  return (
    <span className={cn("text-[11.5px]", band === "soon" ? "text-bz-text" : "text-bz-text-muted", NUM)}>
      {dueLabel(due)}
    </span>
  );
}

export function MilestoneMark({ size = 12 }: { size?: number }) {
  return <Diamond size={size} className="shrink-0 fill-bz-fire text-bz-olive" strokeWidth={1.5} />;
}

export function BlockedMark({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-bz-sm px-1.5 py-0.5 text-[10.5px] font-semibold"
      style={{ background: DANGER_BG, color: DANGER_TEXT }}
      title={`Blocked by ${count} unfinished task${count > 1 ? "s" : ""}`}
    >
      <Lock size={9} />
      {count}
    </span>
  );
}

export function LinkedDocChip({ doc, compact }: { doc: LinkedDoc; compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted"
      title={`${doc.kind} ${doc.no}`}
    >
      <FileText size={10} className="shrink-0" />
      <span className={NUM}>{doc.no}</span>
      {!compact && <span className="text-bz-text-soft">· {doc.kind}</span>}
    </span>
  );
}

export function TagChip({ label }: { label: string }) {
  return (
    <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted">
      {label}
    </span>
  );
}

export function MetaCount({ icon: Icon, n }: { icon: React.ComponentType<{ size?: number; className?: string }>; n: number }) {
  if (!n) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10.5px] text-bz-text-soft">
      <Icon size={11} />
      <span className={NUM}>{n}</span>
    </span>
  );
}
export { MessageSquare, Paperclip, GitBranch };

// ── Completion control ──────────────────────────────────────────────────────

export function CompleteToggle({
  done,
  blocked,
  size = 17,
  onToggle,
}: {
  done: boolean;
  blocked?: boolean;
  size?: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={done ? "Mark incomplete" : "Mark complete"}
      title={blocked && !done ? "Blocked — finish its blockers first" : done ? "Mark incomplete" : "Mark complete"}
      onClick={(e) => {
        e.stopPropagation();
        if (blocked && !done) return;
        onToggle();
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-bz-pill border transition-colors",
        done
          ? "border-bz-leaf-deep bg-bz-leaf-deep text-bz-olive"
          : blocked
            ? "border-dashed border-bz-line text-transparent"
            : "border-bz-line text-transparent hover:border-bz-leaf-deep hover:bg-bz-fire/25 hover:text-bz-olive",
      )}
      style={{ width: size, height: size }}
    >
      <Check size={Math.round(size * 0.6)} strokeWidth={3} />
    </button>
  );
}

// ── Bars ────────────────────────────────────────────────────────────────────

export function MeterBar({
  pct,
  height = "h-1.5",
  fill = "bg-bz-leaf-deep",
  track = "bg-bz-line-soft",
}: {
  pct: number;
  height?: string;
  fill?: string;
  track?: string;
}) {
  return (
    <div className={cn("w-full overflow-hidden rounded-bz-pill", track, height)}>
      <div className={cn("h-full rounded-bz-pill", fill)} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function StackBar({ segments, height = "h-1.5" }: { segments: { value: number; color: string }[]; height?: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className={cn("flex w-full overflow-hidden rounded-bz-pill bg-bz-line-soft", height)}>
      {segments.map((s, i) => (
        <div key={i} className={s.color} style={{ width: `${(s.value / total) * 100}%` }} />
      ))}
    </div>
  );
}

// ── Segmented control ───────────────────────────────────────────────────────

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; count?: number }[];
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-bz-sm font-medium transition-colors",
              size === "sm" ? "h-7 px-2 text-[11.5px]" : "h-8 px-2.5 text-[12px]",
              on ? "bg-bz-surface font-semibold text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.08)]" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn("text-[10.5px]", on ? "text-bz-text-muted" : "text-bz-text-soft", NUM)}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        checked ? "border-bz-leaf-deep bg-bz-fire" : "border-bz-line bg-bz-paper-warm",
      )}
    >
      <span
        className={cn(
          "absolute size-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.25)] transition-all",
          checked ? "left-[16px]" : "left-[2px]",
        )}
      />
    </button>
  );
}

export function Checkbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
        checked || indeterminate ? "border-bz-olive bg-bz-olive text-bz-fire" : "border-bz-line bg-bz-surface hover:border-bz-text-muted",
      )}
    >
      {indeterminate ? <span className="h-[2px] w-2 rounded-bz-pill bg-bz-fire" /> : checked ? <Check size={11} strokeWidth={3} /> : null}
    </button>
  );
}

// ── Portal popover (anchored, closes on outside click / Esc / scroll) ───────

export function Popover({
  open,
  anchor,
  onClose,
  align = "left",
  width = 240,
  children,
}: {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
  align?: "left" | "right";
  width?: number;
  children: React.ReactNode;
}) {
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!open || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const left = align === "right" ? r.right - width : r.left;
    setPos({
      top: r.bottom + 6,
      left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
    });
  }, [open, anchor, align, width]);

  // Flip ABOVE the anchor when the menu would run off the bottom. Clamping the
  // top instead (what this used to do) just pins the menu to the edge and lets
  // its content spill off-screen — which reads as "the button does nothing".
  React.useLayoutEffect(() => {
    const el = panelRef.current;
    if (!open || !anchor || !pos || !el) return;
    const h = el.offsetHeight;
    const maxTop = window.innerHeight - h - 8;
    if (pos.top <= maxTop) return;
    const r = anchor.getBoundingClientRect();
    const above = r.top - h - 6;
    const next = above >= 8 ? above : Math.max(8, maxTop);
    if (Math.abs(next - pos.top) > 1) setPos((prev) => (prev ? { ...prev, top: next } : prev));
  }, [open, anchor, pos]);

  React.useEffect(() => {
    if (!open) return;
    const close = () => onClose();
    // The menu closes when the PAGE moves under it, because it is anchored to an
    // element that just moved. But a scroll INSIDE the menu is the user reading
    // its own list — capture-phase `scroll` sees both, so they must be told apart
    // or a long menu becomes impossible to scroll.
    const onScroll = (e: Event) => {
      const t = e.target as Node | null;
      const panel = panelRef.current;
      if (t && panel && (panel === t || panel.contains(t))) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !pos) return null;
  return createPortal(
    <>
      <div className="fixed inset-0 z-[70]" onMouseDown={onClose} />
      <div
        ref={panelRef}
        className={cn("fixed z-[71] overflow-y-auto rounded-bz-lg border border-bz-line bg-bz-surface p-1.5", SHADOW)}
        style={{ top: pos.top, left: pos.left, width, maxHeight: "calc(100vh - 16px)" }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

export function MenuItem({
  children,
  onClick,
  active,
  danger,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12px] hover:bg-bz-paper-warm",
        active ? "font-semibold text-bz-text" : "text-bz-text-muted",
      )}
      style={danger ? { color: DANGER_TEXT } : undefined}
    >
      {Icon && <Icon size={12} className="shrink-0" />}
      <span className="flex-1 truncate">{children}</span>
      {active && <Check size={12} className="shrink-0 text-bz-leaf-deep" />}
    </button>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return <p className={cn(LABEL, "px-2 pb-1 pt-1.5")}>{children}</p>;
}

/** Anchor helper — every menu in this module opens the same way. */
export function useAnchor() {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return { ref, open, setOpen, anchor: ref.current };
}

// ── States ──────────────────────────────────────────────────────────────────

export function LoadingRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="p-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-bz-line-soft px-2 py-3 last:border-0">
          <span className="size-4 shrink-0 rounded-bz-pill bg-bz-line-soft" />
          <span className="h-2.5 rounded-bz-pill bg-bz-line-soft" style={{ width: `${34 + ((i * 13) % 42)}%` }} />
          <span className="ml-auto h-2.5 w-16 rounded-bz-pill bg-bz-line-soft" />
        </div>
      ))}
      <p className="flex items-center justify-center gap-2 pt-3 text-[11.5px] text-bz-text-soft">
        <Loader2 size={12} className="animate-spin" /> Loading work…
      </p>
    </div>
  );
}

export function EmptyBlock({
  icon: Icon = Inbox,
  title,
  body,
  action,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-soft">
        <Icon size={16} />
      </span>
      <p className="text-[13px] font-semibold text-bz-text">{title}</p>
      {body && <p className="mt-1 max-w-[380px] text-[12px] leading-relaxed text-bz-text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <EmptyBlock
      icon={SearchX}
      title="No task matches these filters"
      body="Narrow the search term or drop a filter — the board and the list share one filter set, so this applies everywhere in the project."
      action={
        <button type="button" className={GHOST_BTN_SM} onClick={onClear}>
          <X size={12} /> Clear all filters
        </button>
      }
    />
  );
}

// ── Toast ───────────────────────────────────────────────────────────────────

export type ToastState = { kind: "success" | "info" | "error"; message: string; id: number } | null;

export function useToast() {
  const [toast, setToast] = React.useState<ToastState>(null);
  const push = React.useCallback((kind: "success" | "info" | "error", message: string) => {
    setToast({ kind, message, id: Date.now() });
  }, []);
  React.useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(id);
  }, [toast]);
  return { toast, push, dismiss: () => setToast(null) };
}

export function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[80] w-full max-w-[420px] -translate-x-1/2 px-4">
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-2.5 rounded-bz-lg border border-white/10 bg-bz-deep px-3.5 py-2.5 text-bz-text-on-dark",
          SHADOW,
        )}
      >
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-bz-pill",
            toast.kind === "success" ? "bg-bz-fire" : toast.kind === "error" ? "" : "bg-bz-leaf",
          )}
          style={toast.kind === "error" ? { background: DANGER_DOT } : undefined}
        />
        <p className="flex-1 text-[12px]">{toast.message}</p>
        <button type="button" onClick={onDismiss} className="text-white/50 hover:text-white">
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Breadcrumb ──────────────────────────────────────────────────────────────

export function Crumb({ trail }: { trail: string[] }) {
  return (
    <>
      {trail.map((x, i) => (
        <React.Fragment key={x + i}>
          {i > 0 && <ChevronRight size={11} className="text-bz-text-soft" />}
          <span className={i === trail.length - 1 ? "font-semibold text-bz-text" : "text-bz-text-muted"}>{x}</span>
        </React.Fragment>
      ))}
    </>
  );
}

export function useDocumentTitle(title: string) {
  React.useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
}

// ════════════════════════════════════════════════════════════════════════════
// FILTERS  one filter model, shared by every surface of the module
// ════════════════════════════════════════════════════════════════════════════

export type FilterModel = {
  q: string;
  assignees: string[];
  priorities: Priority[];
  statuses: TaskStatus[];
  tags: string[];
  dueWindow: "any" | "overdue" | "today" | "week";
  onlyBlocked: boolean;
  onlyMilestones: boolean;
  showCompleted: boolean;
};

export const EMPTY_FILTERS: FilterModel = {
  q: "",
  assignees: [],
  priorities: [],
  statuses: [],
  tags: [],
  dueWindow: "any",
  onlyBlocked: false,
  onlyMilestones: false,
  showCompleted: true,
};

export function filterCount(f: FilterModel) {
  return (
    (f.q ? 1 : 0) +
    f.assignees.length +
    f.priorities.length +
    f.statuses.length +
    f.tags.length +
    (f.dueWindow !== "any" ? 1 : 0) +
    (f.onlyBlocked ? 1 : 0) +
    (f.onlyMilestones ? 1 : 0) +
    (f.showCompleted ? 0 : 1)
  );
}

export function matchesFilter(all: Task[], t: Task, f: FilterModel): boolean {
  if (!f.showCompleted && isDone(t)) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    if (!t.title.toLowerCase().includes(q) && !t.docNo.toLowerCase().includes(q)) return false;
  }
  if (f.assignees.length && !t.assigneeIds.some((a) => f.assignees.includes(a))) return false;
  if (f.priorities.length && !f.priorities.includes(t.priority)) return false;
  if (f.statuses.length && !f.statuses.includes(t.status)) return false;
  if (f.tags.length && !t.tags.some((x) => f.tags.includes(x))) return false;
  if (f.onlyBlocked && !isBlocked(all, t)) return false;
  if (f.onlyMilestones && !t.isMilestone) return false;
  if (f.dueWindow !== "any") {
    const band = dueBand(t.due);
    if (f.dueWindow === "overdue" && band !== "overdue") return false;
    if (f.dueWindow === "today" && !(band === "today" || band === "overdue")) return false;
    if (f.dueWindow === "week" && !(band === "overdue" || band === "today" || band === "soon")) return false;
  }
  return true;
}

/**
 * A parent survives when it matches OR any of its subtasks does — otherwise a
 * search for a subtask would hand back an orphan the tree cannot show.
 */
export function visibleTaskIds(all: Task[], scope: Task[], f: FilterModel): Set<string> {
  const keep = new Set<string>();
  for (const t of scope) {
    if (matchesFilter(all, t, f)) {
      keep.add(t.id);
      if (t.parentId) keep.add(t.parentId);
    }
  }
  return keep;
}

// ── Drag & drop kernel ──────────────────────────────────────────────────────

export type DragPayload = { taskId: string; fromSection: string } | null;

/** Where a drop would land: before `beforeId`, or at the end of `sectionId`. */
export type DropTarget = { sectionId: string; beforeId: string | null } | null;

export const sameTarget = (a: DropTarget, b: DropTarget) =>
  a?.sectionId === b?.sectionId && a?.beforeId === b?.beforeId;

/**
 * Move `taskId` so it sits immediately before `beforeId` in `sectionId`
 * (or last when `beforeId` is null), rewriting `order` densely for that
 * section only. Position is data — this is the only writer of it.
 */
export function reorderTasks(tasks: Task[], taskId: string, target: { sectionId: string; beforeId: string | null }): Task[] {
  const moving = tasks.find((x) => x.id === taskId);
  if (!moving) return tasks;
  if (target.beforeId === taskId) return tasks;

  const section = tasks
    .filter((x) => x.sectionId === target.sectionId && x.parentId === null && x.id !== taskId)
    .sort((a, b) => a.order - b.order);

  const idx = target.beforeId ? section.findIndex((x) => x.id === target.beforeId) : section.length;
  const at = idx < 0 ? section.length : idx;
  const next = [...section.slice(0, at), moving, ...section.slice(at)];

  const orderById = new Map<string, number>();
  next.forEach((x, i) => orderById.set(x.id, i));

  return tasks.map((x) => {
    if (x.id === taskId) return { ...x, sectionId: target.sectionId, order: orderById.get(x.id) ?? x.order };
    // A subtask always travels with its parent.
    if (x.parentId === taskId) return { ...x, sectionId: target.sectionId };
    if (orderById.has(x.id)) return { ...x, order: orderById.get(x.id)! };
    return x;
  });
}

/** Move a section so it sits before `beforeId` (or last). */
export function reorderSections(sections: Section[], id: string, beforeId: string | null): Section[] {
  const moving = sections.find((s) => s.id === id);
  if (!moving || beforeId === id) return sections;
  const rest = sections.filter((s) => s.id !== id);
  const idx = beforeId ? rest.findIndex((s) => s.id === beforeId) : rest.length;
  const at = idx < 0 ? rest.length : idx;
  return [...rest.slice(0, at), moving, ...rest.slice(at)];
}
