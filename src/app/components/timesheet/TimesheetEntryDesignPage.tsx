import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Eye,
  Info,
  Loader2,
  Lock,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import {
  ACCEPTED_HOURS_FORMS,
  ACTIVITIES,
  Activity,
  CARD,
  Confirm,
  Crumb,
  Day,
  Explain,
  ExplainDot,
  GHOST_BTN,
  GHOST_BTN_SM,
  HOUR_INCREMENT,
  LABEL,
  Lookup,
  MAX_DAY_HOURS,
  ME,
  MeterBar,
  NUM,
  Nil,
  PERIOD_DAYS,
  PERIOD_EXPECTED,
  PERIOD_LABEL,
  PERIOD_RANGE,
  PRIMARY_BTN,
  PROJECT_OPTIONS,
  SHADOW,
  StateBlock,
  StateChip,
  StatePreview,
  Switch,
  TASK_OPTIONS,
  Toast,
  activityById,
  buildStretches,
  dayNum,
  fmtDate,
  fmtDateShort,
  fmtH,
  fmtHShort,
  isNonWorking,
  parseHours,
  personById,
  projectById,
  resolveState,
  roundToIncrement,
  taskById,
  useDocumentTitle,
  useToast,
  weekdayOf,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// TIMESHEET · HOURS  (surface B — the one place in the product hours are typed)
//
// PRIMARY ACTION: put a number in a cell, fast, and trust that it stuck.
// Everything is arranged around that:
//   • the matrix is the page; the chrome above it is one band, not a stack;
//   • the period is cut into week-sized STRETCHES so the grid is never wider
//     than a week — the whole-period reading lives in its own card so a
//     stretch subtotal is never mistaken for the period's total;
//   • the save-state is a permanent readout (the brief's weakest point today),
//     the browser is held back while a change is in flight, and the server's
//     corrections arrive as a NAMED list instead of silently rewriting you;
//   • advisories accumulate in a standing panel rather than bursting as toasts.
//
// Mobile is a different design, not a squeezed one: pick a day, then fill the
// streams for that day in one column.
// ════════════════════════════════════════════════════════════════════════════

// ── document modes ──────────────────────────────────────────────────────────
type Mode = "edit" | "readonly" | "pertask" | "unavailable";

// The organisation's approver for this filer. Absent ⇒ commit auto-settles.
const APPROVER = "Rajesh Maharjan";

// A project window, used to raise the "booked outside the project's dates"
// advisory. Server-side knowledge; the matrix only reports it.
const PROJECT_WINDOWS: Record<string, { from: string; to: string }> = {
  "PRJ-021": { from: "2025-11-01", to: "2026-06-05" },
};

// ════════════════════════════════════════════════════════════════════════════
// WORK STREAMS
// A stream needs a task OR a project — not necessarily both. The activity is
// mandatory before any hours can be recorded. When the task owns a project the
// project is FORCED and becomes a read-only echo.
// ════════════════════════════════════════════════════════════════════════════

type Stream = {
  key: string;
  taskId: string | null;
  projectId: string | null;
  activityId: string | null;
  chargeable: boolean;
  hours: Record<string, number>;
  /** iso → why those hours are frozen. Per-CELL, never a document mode. */
  frozen: Record<string, string>;
  /** iso → derived overtime within that cell. Server-side; a readout. */
  overtime: Record<string, number>;
  /** iso → the narrative that becomes the invoice line detail. */
  notes: Record<string, string>;
};

const INVOICED = "These hours are already on invoice INV-2091 (Everest Hardware Supplies, 2 Jestha).";

const SEED_STREAMS: Stream[] = [
  {
    key: "s1", taskId: "TSK-4410", projectId: "PRJ-014-1", activityId: "ACT-MIG", chargeable: true,
    hours: { "2026-05-15": 6, "2026-05-19": 4, "2026-05-20": 4, "2026-05-24": 8, "2026-05-25": 8, "2026-05-26": 6, "2026-05-31": 8, "2026-06-01": 8, "2026-06-07": 8, "2026-06-08": 4 },
    frozen: {}, overtime: {},
    notes: { "2026-05-24": "Migrated the 2082/83 opening balances for the Apex finance entity and reconciled 412 accounts against the legacy trial balance." },
  },
  {
    key: "s2", taskId: null, projectId: "PRJ-014-2", activityId: "ACT-CON", chargeable: true,
    hours: { "2026-05-20": 4, "2026-05-21": 6, "2026-05-27": 8, "2026-05-29": 5, "2026-06-02": 8, "2026-06-09": 8 },
    frozen: {}, overtime: { "2026-05-29": 5 },
    notes: {},
  },
  {
    key: "s3", taskId: "TSK-4489", projectId: "PRJ-021", activityId: "ACT-DEV", chargeable: true,
    hours: { "2026-05-16": 4, "2026-05-21": 4, "2026-05-22": 8, "2026-05-28": 8, "2026-06-03": 8, "2026-06-08": 4 },
    frozen: {}, overtime: { "2026-05-16": 4, "2026-05-21": 2 },
    notes: { "2026-05-22": "Receipt printer driver for the Himalayan terminals — ESC/POS profile plus the Nepali numeral fallback." },
  },
  {
    key: "s4", taskId: null, projectId: "PRJ-002", activityId: "ACT-ADM", chargeable: false,
    hours: { "2026-05-15": 2, "2026-05-26": 2 },
    frozen: {}, overtime: {}, notes: {},
  },
  {
    key: "s5", taskId: "TSK-4502", projectId: "PRJ-030", activityId: "ACT-TRN", chargeable: true,
    hours: { "2026-05-17": 8, "2026-05-18": 8, "2026-05-19": 4 },
    frozen: { "2026-05-17": INVOICED, "2026-05-18": INVOICED, "2026-05-19": INVOICED },
    overtime: {},
    notes: { "2026-05-18": "Batch 2 training — inventory counting and the receiving desk, 11 participants at the Everest Lalitpur store." },
  },
];

const streamTotal = (s: Stream) => Object.values(s.hours).reduce((a, b) => a + b, 0);
const streamHasFrozen = (s: Stream) => Object.keys(s.frozen).length > 0;
const noteCount = (s: Stream) => Object.values(s.notes).filter((n) => n.trim()).length;

// ════════════════════════════════════════════════════════════════════════════
// SUPPLEMENTARY FIELDS  (organisation-defined; the control follows the type)
// ════════════════════════════════════════════════════════════════════════════

type FieldType = "number" | "text" | "longtext" | "date" | "datetime" | "time" | "percent" | "select" | "multiselect" | "bool";

type Supp = {
  key: string;
  label: string;
  type: FieldType;
  mandatory?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  options?: string[];
  help?: string;
};

const SUPP_FIELDS: Supp[] = [
  { key: "clientRef", label: "Client reference", type: "text", mandatory: true, help: "Printed on the client invoice line." },
  { key: "costCentre", label: "Cost centre", type: "select", mandatory: true, options: ["Delivery", "Consulting", "Support", "Quality"] },
  { key: "engagement", label: "Engagement code", type: "text", readOnly: true },
  { key: "utilisation", label: "Utilisation target", type: "percent" },
  { key: "siteVisit", label: "Site visit date", type: "date" },
  { key: "shiftStart", label: "Usual shift start", type: "time" },
  { key: "attestations", label: "Compliance attestations", type: "multiselect", options: ["Safety briefing", "Data handling", "Client NDA"] },
  { key: "onSite", label: "Worked from a client site", type: "bool" },
  { key: "summary", label: "Period summary", type: "longtext" },
  { key: "lastTouch", label: "Last server touch", type: "datetime", readOnly: true },
  { key: "otRef", label: "Overtime pre-approval ref", type: "number", hidden: true },
];

type SuppValues = Record<string, string | string[] | boolean | null>;

const SEED_SUPP: SuppValues = {
  clientRef: "",
  costCentre: "Delivery",
  engagement: "ENG-2026-014",
  utilisation: "85",
  siteVisit: null,
  shiftStart: "09:30",
  attestations: ["Safety briefing"],
  onSite: true,
  summary: "",
  lastTouch: "2026-06-15T09:12",
  otRef: "OTP-4471",
};

const isFilled = (v: SuppValues[string]) => (Array.isArray(v) ? v.length > 0 : typeof v === "boolean" ? true : !!v && String(v).trim() !== "");

// ════════════════════════════════════════════════════════════════════════════
// SAVE STATE  — continuous persistence made legible
// ════════════════════════════════════════════════════════════════════════════

type SaveState = "clean" | "dirty" | "saving" | "saved" | "failed";

function SaveReadout({ state, at }: { state: SaveState; at: string | null }) {
  const map: Record<SaveState, { icon: React.ReactNode; text: React.ReactNode; cls: string }> = {
    clean: { icon: <Check size={12} className="text-bz-leaf-deep" />, text: "No changes to save", cls: "text-bz-text-muted" },
    dirty: { icon: <span className="size-1.5 rounded-bz-pill bg-bz-fire" />, text: "Unsaved edit — saving in a moment", cls: "text-bz-text" },
    saving: { icon: <Loader2 size={12} className="animate-spin text-bz-fire" />, text: "Saving…", cls: "text-bz-text" },
    saved: { icon: <Check size={12} className="text-bz-leaf-deep" />, text: <>Saved{at ? ` at ${at}` : ""}</>, cls: "text-bz-text-muted" },
    failed: { icon: <AlertTriangle size={12} className="text-[#C0413A]" />, text: "Save failed — your last edit is not stored", cls: "text-[#9A2E29]" },
  };
  const m = map[state];
  return (
    <p className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-[11.5px] font-medium", m.cls)}>
      {m.icon}
      {m.text}
    </p>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DAY HEADER  — non-working treatment plus a way to reach the reason
// ════════════════════════════════════════════════════════════════════════════

function dayReason(d: Day): { label: string; title: string; body: string } | null {
  if (d.holiday) return { label: "Holiday", title: "Public holiday", body: d.holiday };
  if (d.leave) return { label: "Leave", title: "Approved leave", body: d.leave };
  if (d.nonWorking) return { label: "Off", title: "Non-working day", body: d.nonWorking };
  return null;
}

function DayHead({ d, actual }: { d: Day; actual: number }) {
  const reason = dayReason(d);
  const over = actual > d.expected;
  return (
    <div className={cn("flex flex-col items-center gap-0.5 px-1 py-2", isNonWorking(d) && "bg-bz-paper-warm")}>
      <span className="text-[9.5px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">{weekdayOf(d.iso)}</span>
      <span className={cn("text-[13px] font-semibold leading-none text-bz-text", NUM)}>{d.bs}</span>
      <span className={cn("text-[9px] text-bz-text-soft", NUM)}>{fmtDateShort(d.iso)}</span>
      {reason ? (
        <Explain
          title={reason.title}
          body={reason.body}
          exit="You can still book hours here — real work happens on non-working days, and the calendar simply expects nothing from you."
          className="mt-0.5 inline-flex items-center gap-0.5 rounded-bz-sm bg-bz-surface px-1 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.05em] text-bz-text-muted hover:text-bz-text"
        >
          {reason.label}
          <Info size={8} className="opacity-70" />
        </Explain>
      ) : (
        <span className={cn("mt-0.5 text-[9px] text-bz-text-soft", NUM)}>exp {fmtHShort(d.expected) || "0"}</span>
      )}
      <span
        className={cn(
          "mt-0.5 rounded-bz-sm px-1 text-[10px] font-semibold",
          NUM,
          actual === 0 ? "text-bz-text-soft" : over ? "bg-bz-fire/[0.28] text-bz-text" : "text-bz-text",
        )}
      >
        {actual === 0 ? "—" : fmtH(actual)}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HOURS CELL
// ════════════════════════════════════════════════════════════════════════════

function HoursCell({
  value,
  frozenReason,
  overtime,
  hasNote,
  nonWorking,
  readOnly,
  blockedReason,
  r,
  c,
  onCommit,
  onMove,
}: {
  value: number;
  frozenReason?: string;
  overtime?: number;
  hasNote: boolean;
  nonWorking: boolean;
  readOnly: boolean;
  blockedReason: string | null;
  r: number;
  c: number;
  onCommit: (raw: string) => boolean;
  onMove: (dr: number, dc: number) => void;
}) {
  const [raw, setRaw] = React.useState<string>(fmtHShort(value));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setRaw(fmtHShort(value));
  }, [value, focused]);

  if (frozenReason) {
    return (
      <Explain
        title="These hours are frozen"
        body={frozenReason}
        exit="Reverse the downstream document first. The rest of this timesheet stays editable — freezing is per cell, not per document."
        tone="blocked"
        className={cn(
          "flex h-9 w-full items-center justify-center gap-1 border-l border-bz-line-soft bg-bz-paper-warm text-[12.5px] font-semibold text-bz-text-muted",
          NUM,
        )}
      >
        <Lock size={9} className="opacity-70" />
        {fmtH(value)}
      </Explain>
    );
  }

  if (readOnly) {
    return (
      <div
        className={cn(
          "flex h-9 w-full items-center justify-center border-l border-bz-line-soft text-[12.5px]",
          NUM,
          nonWorking && "bg-bz-paper-warm/70",
          value === 0 ? "text-bz-text-soft" : "font-medium text-bz-text",
        )}
      >
        {value === 0 ? "—" : fmtH(value)}
      </div>
    );
  }

  return (
    <div className={cn("relative border-l border-bz-line-soft", nonWorking && "bg-bz-paper-warm/70")}>
      <input
        data-cell={`${r}-${c}`}
        inputMode="decimal"
        value={raw}
        aria-label={`Hours, row ${r + 1} day ${c + 1}`}
        onFocus={(e) => {
          setFocused(true);
          e.currentTarget.select();
        }}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={() => {
          setFocused(false);
          const ok = onCommit(raw);
          if (!ok) setRaw(fmtHShort(value));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (onCommit(raw)) onMove(1, 0);
            else setRaw(fmtHShort(value));
          } else if (e.key === "Escape") {
            setRaw(fmtHShort(value));
            e.currentTarget.blur();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onCommit(raw);
            onMove(1, 0);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            onCommit(raw);
            onMove(-1, 0);
          } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
            e.preventDefault();
            onCommit(raw);
            onMove(0, -1);
          } else if (e.key === "ArrowRight" && e.currentTarget.selectionStart === raw.length) {
            e.preventDefault();
            onCommit(raw);
            onMove(0, 1);
          }
        }}
        className={cn(
          "h-9 w-full bg-transparent text-center text-[12.5px] text-bz-text outline-none",
          NUM,
          "focus:bg-bz-fire/[0.14] focus:ring-1 focus:ring-inset focus:ring-bz-olive",
          blockedReason && "text-bz-text-soft",
          value > 0 && "font-medium",
        )}
        placeholder="·"
      />
      {overtime ? (
        <Explain
          title="Overtime, derived"
          body={`${fmtH(overtime)} of these hours fall past what your working calendar expects for this day. Overtime is resolved server-side from the calendar — it is a readout, never something you assert.`}
          className="absolute left-0.5 top-0.5 rounded-[3px] bg-bz-fire px-0.5 text-[7.5px] font-bold uppercase leading-[1.5] tracking-[0.04em] text-bz-olive"
        >
          OT
        </Explain>
      ) : null}
      {hasNote && <span className="pointer-events-none absolute right-0.5 top-0.5 size-1.5 rounded-bz-pill bg-bz-leaf-deep" aria-hidden />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STREAM IDENTITY  — the subtlest control on the surface
// ════════════════════════════════════════════════════════════════════════════

function ActivityPicker({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const act = value ? activityById(value) : null;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-6 max-w-full items-center gap-1 rounded-bz-sm px-1.5 text-[11px] font-medium",
          act ? "bg-bz-paper-warm text-bz-text hover:bg-bz-line-soft" : "bg-[#FBE5E2] text-[#9A2E29] hover:bg-[#F7D8D4]",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="truncate">{act ? act.name : "Activity required"}</span>
        {!disabled && <ChevronDown size={9} className="shrink-0 opacity-60" />}
      </button>
      {open && (
        <div className={cn("absolute left-0 top-[28px] z-40 w-[208px] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1", SHADOW)}>
          {value && (
            <>
              <button
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#FBE5E2]"
              >
                <span className="flex-1 text-[12px] text-[#9A2E29]">Clear — no activity</span>
              </button>
              <div className="my-1 h-px bg-bz-line-soft" />
            </>
          )}
          {ACTIVITIES.map((a: Activity) => (
            <button
              key={a.id}
              onClick={() => {
                onChange(a.id);
                setOpen(false);
              }}
              className={cn("flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-bz-paper-warm", a.id === value && "bg-bz-fire/[0.08]")}
            >
              <span className="flex-1 truncate text-[12px] text-bz-text">{a.name}</span>
              {!a.sellable && <span className="text-[9px] uppercase tracking-[0.05em] text-bz-text-soft">no item</span>}
              {a.id === value && <Check size={11} className="text-bz-text" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StreamIdentity({
  s,
  readOnly,
  onPatch,
  onRemove,
  notesOpen,
  onToggleNotes,
  onRefuse,
}: {
  s: Stream;
  readOnly: boolean;
  onPatch: (patch: Partial<Stream>) => void;
  onRemove: () => void;
  notesOpen: boolean;
  onToggleNotes: () => void;
  onRefuse: (msg: string) => void;
}) {
  const task = s.taskId ? taskById(s.taskId) : null;
  const forced = !!task?.projectId;
  const project = s.projectId ? projectById(s.projectId) : null;
  const notes = noteCount(s);

  return (
    <div className="flex min-w-0 flex-col gap-1.5 px-3 py-2.5">
      {/* task */}
      <div className="flex min-w-0 items-center gap-1.5">
        {task ? (
          <>
            <span className="truncate text-[12.5px] font-medium text-bz-text">{task.name}</span>
            <span className={cn("shrink-0 text-[10px] text-bz-text-soft", NUM)}>{task.id}</span>
            {task.completed && (
              <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1 text-[9px] font-semibold uppercase tracking-[0.05em] text-bz-text-muted">
                done
              </span>
            )}
          </>
        ) : (
          <span className="text-[12.5px] italic text-bz-text-soft">No task</span>
        )}
      </div>

      {/* project — forced echo, or the filer's to choose */}
      <div className="flex min-w-0 items-center gap-1.5">
        {forced ? (
          <Explain
            title="This project is forced by the task"
            body={`${task!.name} already belongs to ${project?.name}. Moving it would move historical cost between projects, so it is a read-only echo here.`}
            exit="Change the task if the hours belong somewhere else."
            className="inline-flex min-w-0 items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[11px] text-bz-text-muted hover:text-bz-text"
          >
            <Lock size={9} className="shrink-0 opacity-70" />
            <span className="truncate">{project?.name}</span>
          </Explain>
        ) : readOnly ? (
          <span className="truncate text-[11px] text-bz-text-muted">{project ? project.name : "No project"}</span>
        ) : (
          <div className="min-w-0 max-w-[188px] flex-1">
            <Lookup
              value={s.projectId}
              options={PROJECT_OPTIONS}
              placeholder="Choose a project"
              searchPlaceholder="Search projects…"
              clearLabel="No project"
              className="h-6 rounded-bz-sm border-bz-line-soft bg-bz-paper-warm px-1.5 text-[11px]"
              width={280}
              onChange={(v) => {
                // clearing the project forces chargeability off
                if (!v && s.chargeable) {
                  onPatch({ projectId: null, chargeable: false });
                  onRefuse("Chargeability was switched off: the client is derived from the project, and this stream no longer has one.");
                } else {
                  onPatch({ projectId: v });
                }
              }}
            />
          </div>
        )}
      </div>

      {/* activity · chargeable · notes · remove */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <ActivityPicker
          value={s.activityId}
          disabled={readOnly}
          onChange={(v) => onPatch({ activityId: v })}
        />

        <span className="inline-flex items-center gap-1.5">
          <Switch
            value={s.chargeable}
            disabled={readOnly}
            ariaLabel="Chargeable to the client"
            onChange={(v) => {
              if (v && !s.projectId) {
                onRefuse("This stream cannot be made chargeable: the client is derived from the project, and no project is set.");
                return;
              }
              onPatch({ chargeable: v });
            }}
          />
          <span className={cn("text-[10px] font-semibold uppercase tracking-[0.06em]", s.chargeable ? "text-bz-text" : "text-bz-text-soft")}>
            Chargeable
          </span>
        </span>

        <button
          onClick={onToggleNotes}
          className={cn(
            "inline-flex h-6 items-center gap-1 rounded-bz-sm px-1.5 text-[10.5px] font-medium",
            notes > 0 ? "bg-bz-leaf/50 text-bz-text" : "text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text",
          )}
        >
          <MessageSquareText size={10} />
          {notes > 0 ? <span className={NUM}>{notes}</span> : "Notes"}
          {notesOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
        </button>

        {!readOnly && (
          <button
            onClick={onRemove}
            aria-label="Remove this stream"
            className="ml-auto flex size-6 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE5E2] hover:text-[#9A2E29]"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STREAM COMPOSER
// ════════════════════════════════════════════════════════════════════════════

function StreamComposer({ onAdd, onCancel, existing }: { onAdd: (s: Stream) => void; onCancel: () => void; existing: Stream[] }) {
  const [taskId, setTaskId] = React.useState<string | null>(null);
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [activityId, setActivityId] = React.useState<string | null>(null);
  const [refusal, setRefusal] = React.useState<string | null>(null);

  const forcedProject = taskId ? taskById(taskId)?.projectId ?? null : null;
  const effProject = forcedProject ?? projectId;

  const submit = () => {
    if (!taskId && !effProject) return setRefusal("Choose a task or a project — a stream needs at least one of them.");
    if (!activityId) return setRefusal("Choose an activity. Hours on a stream without one would be discarded when the document saves.");
    const dup = existing.some((s) => s.taskId === taskId && s.projectId === effProject && s.activityId === activityId);
    if (dup) return setRefusal("That exact combination of task, project and activity is already on this timesheet.");
    onAdd({
      key: `s${Date.now()}`,
      taskId,
      projectId: effProject,
      activityId,
      chargeable: false,
      hours: {},
      frozen: {},
      overtime: {},
      notes: {},
    });
  };

  return (
    <div className="border-t border-bz-line bg-bz-paper-warm/50 px-4 py-3.5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <p className={cn(LABEL, "mb-1.5")}>Task</p>
          <Lookup
            value={taskId}
            options={TASK_OPTIONS}
            placeholder="Search a task…"
            clearLabel="No task"
            width={320}
            onChange={(v) => {
              setTaskId(v);
              setRefusal(null);
              const fp = v ? taskById(v)?.projectId ?? null : null;
              if (fp) setProjectId(fp);
            }}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <p className={cn(LABEL, "mb-1.5 flex items-center gap-1.5")}>
            Project
            {forcedProject && (
              <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1 text-[9px] font-bold uppercase tracking-[0.05em] text-bz-text-muted">
                <Lock size={8} /> forced by the task
              </span>
            )}
          </p>
          {forcedProject ? (
            <div className="flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-2.5">
              <Lock size={11} className="shrink-0 text-bz-text-soft" />
              <span className="truncate text-[12.5px] text-bz-text-muted">{projectById(forcedProject)?.name}</span>
            </div>
          ) : (
            <Lookup
              value={projectId}
              options={PROJECT_OPTIONS}
              placeholder="Search a project…"
              clearLabel="No project"
              width={320}
              onChange={(v) => {
                setProjectId(v);
                setRefusal(null);
              }}
            />
          )}
        </div>
        <div className="min-w-[168px]">
          <p className={cn(LABEL, "mb-1.5")}>Activity · required</p>
          <div className="flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-paper px-2">
            <ActivityPicker value={activityId} onChange={(v) => { setActivityId(v); setRefusal(null); }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className={GHOST_BTN}>
            Cancel
          </button>
          <button onClick={submit} className={PRIMARY_BTN}>
            <Plus size={13} /> Add stream
          </button>
        </div>
      </div>
      {refusal && (
        <p className="mt-2.5 flex items-start gap-1.5 rounded-bz-sm bg-[#FBE5E2] px-2.5 py-1.5 text-[11.5px] leading-[1.5] text-[#9A2E29]">
          <Ban size={12} className="mt-0.5 shrink-0" />
          {refusal}
        </p>
      )}
      <p className="mt-2 text-[10.5px] text-bz-text-soft">
        A stream is not stored until it carries something — either an identity you finish here, or the first hour you type into it.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ADVISORY PANEL — several full sentences at once, standing, not a burst
// ════════════════════════════════════════════════════════════════════════════

function Advisories({ items, onDismiss, onDismissAll }: { items: string[]; onDismiss: (i: number) => void; onDismissAll: () => void }) {
  const [open, setOpen] = React.useState(true);
  if (items.length === 0) return null;
  return (
    <div className="border-b border-bz-line-soft bg-bz-leaf/[0.28]">
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 md:px-6">
        <Sparkles size={13} className="shrink-0 text-bz-text-muted" />
        <p className="text-[12px] font-semibold text-bz-text">
          <span className={NUM}>{items.length}</span> {items.length === 1 ? "advisory" : "advisories"} from the last save
        </p>
        <span className="text-[11.5px] text-bz-text-muted">— allowed, but worth knowing. Nothing was refused.</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={onDismissAll} className="text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">
            Dismiss all
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"
            aria-label={open ? "Collapse advisories" : "Expand advisories"}
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>
      {open && (
        <ul className="flex flex-col gap-1 px-4 pb-2.5 md:px-6">
          {items.map((a, i) => (
            <li key={a} className="flex items-start gap-2 rounded-bz-sm bg-bz-surface/70 px-2.5 py-1.5">
              <span className="mt-1.5 size-1 shrink-0 rounded-bz-pill bg-bz-leaf-deep" />
              <span className="min-w-0 flex-1 text-[11.5px] leading-[1.55] text-bz-text">{a}</span>
              <button onClick={() => onDismiss(i)} aria-label="Dismiss" className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text">
                <X size={10} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUPPLEMENTARY PANEL
// ════════════════════════════════════════════════════════════════════════════

function SuppControl({
  f,
  value,
  onChange,
  invalid,
}: {
  f: Supp;
  value: SuppValues[string];
  onChange: (v: SuppValues[string]) => void;
  invalid: boolean;
}) {
  const base = cn(
    "h-9 w-full rounded-bz-md border bg-bz-paper px-2.5 text-[12.5px] text-bz-text outline-none focus:border-bz-text-muted",
    invalid ? "border-[#C0413A]" : "border-bz-line",
    f.readOnly && "cursor-not-allowed border-bz-line-soft bg-bz-paper-warm text-bz-text-muted",
  );
  if (f.type === "bool") {
    return (
      <div className="flex h-9 items-center gap-2">
        <Switch value={!!value} onChange={onChange} disabled={f.readOnly} ariaLabel={f.label} />
        <span className="text-[12px] text-bz-text-muted">{value ? "Yes" : "No"}</span>
      </div>
    );
  }
  if (f.type === "multiselect") {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-1.5">
        {(f.options ?? []).map((o) => {
          const on = arr.includes(o);
          return (
            <button
              key={o}
              disabled={f.readOnly}
              onClick={() => onChange(on ? arr.filter((x) => x !== o) : [...arr, o])}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-bz-md border px-2.5 text-[11.5px] font-medium",
                on ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm",
              )}
            >
              {on && <Check size={11} />}
              {o}
            </button>
          );
        })}
      </div>
    );
  }
  if (f.type === "select") {
    return (
      <div className="relative">
        <select
          disabled={f.readOnly}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className={cn(base, "appearance-none pr-8")}
        >
          <option value="">Choose…</option>
          {(f.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
      </div>
    );
  }
  if (f.type === "longtext") {
    return (
      <textarea
        readOnly={f.readOnly}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Optional…"
        className={cn(base, "h-auto py-2 leading-[1.55]")}
      />
    );
  }
  const inputType = f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : f.type === "time" ? "time" : f.type === "number" || f.type === "percent" ? "number" : "text";
  return (
    <div className="relative">
      <input
        type={inputType}
        readOnly={f.readOnly}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={f.mandatory ? "Required" : "Optional"}
        className={cn(base, NUM, f.type === "percent" && "pr-7")}
      />
      {f.type === "percent" && <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-bz-text-muted">%</span>}
    </div>
  );
}

function SupplementaryPanel({
  open,
  setOpen,
  values,
  setValues,
  missing,
  readOnly,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  values: SuppValues;
  setValues: (v: SuppValues) => void;
  missing: string[];
  readOnly: boolean;
}) {
  const visible = SUPP_FIELDS.filter((f) => !f.hidden);
  const hiddenCount = SUPP_FIELDS.length - visible.length;
  return (
    <section className={cn(CARD, "overflow-hidden")}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-bz-paper-warm/50">
        <span className="flex size-7 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted">
          <Plus size={13} className={cn("transition-transform", open && "rotate-45")} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-bz-text">Supplementary fields</span>
          <span className="block text-[11px] text-bz-text-muted">
            Defined by your organisation · <span className={NUM}>{visible.length}</span> shown
            {hiddenCount > 0 && (
              <>
                {" · "}
                <span className={NUM}>{hiddenCount}</span> hidden but still holding a value
              </>
            )}
          </span>
        </span>
        {missing.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-bz-sm bg-[#FBE5E2] px-2 py-0.5 text-[10.5px] font-semibold text-[#9A2E29]">
            <AlertTriangle size={10} /> <span className={NUM}>{missing.length}</span> required
          </span>
        )}
        {open ? <ChevronUp size={14} className="text-bz-text-muted" /> : <ChevronDown size={14} className="text-bz-text-muted" />}
      </button>
      {open && (
        <div className="grid gap-4 border-t border-bz-line-soft p-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((f) => {
            const invalid = missing.includes(f.key);
            return (
              <div key={f.key} className={cn(f.type === "longtext" && "sm:col-span-2 lg:col-span-3")}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="text-[11.5px] font-medium text-bz-text">{f.label}</span>
                  {f.mandatory && <span className="text-[11.5px] font-semibold text-[#9A2E29]">✱</span>}
                  {f.readOnly && (
                    <span className="inline-flex items-center gap-0.5 rounded-bz-sm bg-bz-paper-warm px-1 text-[9px] font-bold uppercase tracking-[0.05em] text-bz-text-soft">
                      <Lock size={8} /> read-only
                    </span>
                  )}
                  {f.help && <ExplainDot title={f.label} body={f.help} />}
                </div>
                <SuppControl
                  f={{ ...f, readOnly: f.readOnly || readOnly }}
                  value={values[f.key]}
                  onChange={(v) => setValues({ ...values, [f.key]: v })}
                  invalid={invalid}
                />
                {invalid && <p className="mt-1 text-[10.5px] font-medium text-[#9A2E29]">This field must be filled before the document can be committed.</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

const STRETCHES = buildStretches(PERIOD_DAYS);

export function TimesheetEntryDesignPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { toast, show, clear } = useToast();

  const modeParam = (params.get("mode") as Mode | null) ?? "edit";
  const mode: Mode = ["edit", "readonly", "pertask", "unavailable"].includes(modeParam) ? modeParam : "edit";
  const readOnly = mode === "readonly";
  const perTask = mode === "pertask";
  const docId = params.get("doc") ?? "TS-0142-2083-02";
  const asPersonId = params.get("person");
  const person = asPersonId ? personById(asPersonId) ?? ME : ME;
  const sentBackDoc = docId === "TS-0142-2083-01";

  useDocumentTitle(perTask ? "Timesheet · TSK-4517" : readOnly ? `Timesheet · ${person.name}` : `Timesheet · ${PERIOD_LABEL}`);

  // ── document state ──
  const [streams, setStreams] = React.useState<Stream[]>(SEED_STREAMS);
  const [stretchKey, setStretchKey] = React.useState(STRETCHES[1].key);
  const [composing, setComposing] = React.useState(false);
  const [notesOpen, setNotesOpen] = React.useState<Set<string>>(new Set());
  const [supp, setSupp] = React.useState<SuppValues>(SEED_SUPP);
  const [suppOpen, setSuppOpen] = React.useState(false);
  const [missing, setMissing] = React.useState<string[]>([]);
  const [save, setSave] = React.useState<SaveState>("clean");
  const [savedAt, setSavedAt] = React.useState<string | null>("09:12");
  const [advisories, setAdvisories] = React.useState<string[]>([]);
  const [corrections, setCorrections] = React.useState<string[]>([]);
  const [confirmVoid, setConfirmVoid] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState<Stream | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState<null | { routed: boolean }>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileDay, setMobileDay] = React.useState<string>(STRETCHES[1].days[0].iso);

  const stretch = STRETCHES.find((s) => s.key === stretchKey) ?? STRETCHES[0];
  const dirty = save === "dirty" || save === "saving";

  // ── continuous persistence: debounce → save → replace with the server's copy ─
  const saveTimer = React.useRef<number | null>(null);
  // the advisory pass reads the document as it stands WHEN THE SAVE LANDS, so
  // the streams are held in a ref rather than captured in a stale closure
  const streamsRef = React.useRef(streams);
  React.useEffect(() => {
    streamsRef.current = streams;
  }, [streams]);

  const runSave = () => {
    setSave("saving");
    window.setTimeout(() => {
      setSave("saved");
      setSavedAt("09:20");
      setAdvisories(buildAdvisories(streamsRef.current));
    }, 780);
  };

  const markDirty = () => {
    if (readOnly) return;
    setSave("dirty");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => runSave(), 1100);
  };

  // hold the browser back while an edit is still in flight
  React.useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // ── derived readings ──
  const dayActual = React.useCallback(
    (iso: string) => streams.reduce((sum, s) => sum + (s.hours[iso] ?? 0), 0),
    [streams],
  );
  const periodTotal = React.useMemo(() => streams.reduce((s, st) => s + streamTotal(st), 0), [streams]);
  const periodChargeable = React.useMemo(
    () => streams.filter((s) => s.chargeable).reduce((s, st) => s + streamTotal(st), 0),
    [streams],
  );
  const periodOvertime = React.useMemo(
    () => streams.reduce((s, st) => s + Object.values(st.overtime).reduce((a, b) => a + b, 0), 0),
    [streams],
  );
  const stretchTotal = React.useMemo(() => stretch.days.reduce((s, d) => s + dayActual(d.iso), 0), [stretch, dayActual]);
  const stretchExpected = React.useMemo(() => stretch.days.reduce((s, d) => s + d.expected, 0), [stretch]);

  // ── cell commit ──
  const commitCell = (streamKey: string, iso: string, raw: string): boolean => {
    const s = streams.find((x) => x.key === streamKey);
    if (!s) return false;
    if (s.frozen[iso]) return false;
    if (!s.activityId) {
      show("error", "Choose an activity for this stream first — hours on a stream without one would be discarded when the document saves.");
      return false;
    }
    const parsed = parseHours(raw);
    if (parsed === null) {
      show("error", `“${raw}” could not be read as hours. Accepted forms: ${ACCEPTED_HOURS_FORMS}.`);
      return false;
    }
    if (parsed > MAX_DAY_HOURS) {
      show("error", `A single day cannot exceed ${MAX_DAY_HOURS} hours.`);
      return false;
    }
    const rounded = roundToIncrement(parsed);
    if (rounded !== (s.hours[iso] ?? 0)) {
      if (Math.abs(rounded - parsed) > 0.001) {
        setCorrections((c) =>
          Array.from(new Set([...c, `${fmtH(parsed)} h on ${fmtDate(iso)} was rounded to ${fmtH(rounded)} — this organisation records time in ${HOUR_INCREMENT}-hour steps.`])),
        );
      }
      setStreams((prev) =>
        prev.map((x) => {
          if (x.key !== streamKey) return x;
          const hours = { ...x.hours };
          if (rounded === 0) delete hours[iso];
          else hours[iso] = rounded;
          return { ...x, hours };
        }),
      );
      markDirty();
    }
    return true;
  };

  const patchStream = (key: string, patch: Partial<Stream>) => {
    setStreams((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
    markDirty();
  };

  const removeStream = (s: Stream) => {
    if (streamHasFrozen(s)) {
      show("error", "This stream cannot be removed: some of its hours are already invoiced. Reverse the downstream document first.");
      setConfirmRemove(null);
      return;
    }
    setStreams((prev) => prev.filter((x) => x.key !== s.key));
    setConfirmRemove(null);
    markDirty();
    show("success", "Stream removed.");
  };

  const moveFocus = (r: number, c: number) => {
    const el = document.querySelector<HTMLInputElement>(`[data-cell="${r}-${c}"]`);
    if (el) {
      el.focus();
      el.select();
    }
  };

  /**
   * Copies the previous period's streams and hours forward. It OVERWRITES
   * overlapping cells without asking, silently drops source days with no
   * landing day here, and never carries frozen hours or derived overtime over.
   */
  const replicate = () => {
    setStreams((prev) =>
      prev.map((s, i) => {
        if (i !== 0) return s; // the previous period's shape: everything on the lead stream
        const hours = { ...s.hours };
        PERIOD_DAYS.forEach((d) => {
          if (d.expected <= 0) return;
          if (s.frozen[d.iso]) return; // frozen hours never take a copy
          hours[d.iso] = d.expected;
        });
        return { ...s, hours };
      }),
    );
    show(
      "info",
      "Baishakh 2083 copied forward. Overlapping cells were overwritten without asking, 2 source days had no landing day in this shorter period and were dropped, and neither overtime nor frozen hours carried over.",
    );
    markDirty();
  };

  const commitForApproval = () => {
    const miss = SUPP_FIELDS.filter((f) => f.mandatory && !f.hidden && !isFilled(supp[f.key])).map((f) => f.key);
    if (miss.length > 0) {
      setMissing(miss);
      setSuppOpen(true);
      show("error", `Cannot commit yet: ${miss.length} required supplementary ${miss.length === 1 ? "field is" : "fields are"} unfilled. They are revealed below.`);
      return;
    }
    if (periodTotal === 0) {
      show("error", "The server refused: an empty timesheet cannot be submitted.");
      return;
    }
    setMissing([]);
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted({ routed: true });
    }, 900);
  };

  // ── UNAVAILABLE ─────────────────────────────────────────────────────────
  if (mode === "unavailable") {
    return (
      <AppShell breadcrumb={<Crumb page="Hours" />}>
        <div className="px-4 py-6 md:px-8">
          <div className={cn(CARD, "mx-auto max-w-[560px] overflow-hidden")}>
            <StateBlock
              tone="danger"
              icon={<Lock size={22} />}
              title="There is no document to open"
              body={
                <>
                  Periods up to <span className={cn("font-semibold text-bz-text", NUM)}>31 Baishakh 2083</span> are administratively
                  closed, so a timesheet cannot be created or edited inside one. The stated reason is “Year-end audit — books frozen
                  until the statutory filing clears.”
                </>
              }
              action={
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setParams({ doc: "TS-0142-2083-02" })} className={PRIMARY_BTN}>
                    Open {PERIOD_LABEL} instead
                  </button>
                  <button onClick={() => navigate("/design/timesheet/register")} className={GHOST_BTN}>
                    See the closure on the register
                  </button>
                </div>
              }
            />
          </div>
        </div>
      </AppShell>
    );
  }

  const state = resolveState(
    sentBackDoc
      ? { sentBack: true, submittedISO: "2026-05-16" }
      : submitted
      ? { submittedISO: "2026-06-15" }
      : { submittedISO: null },
  );

  const rowsForMatrix = streams;

  return (
    <AppShell
      breadcrumb={<Crumb page={perTask ? "Hours · per task" : readOnly ? `Hours · ${person.name}` : "Hours"} />}
      overlay={
        <>
          {/* docked period reading + the one lifecycle transition */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="flex items-baseline gap-1.5">
                <span className={cn(LABEL, "not-italic")}>Period</span>
                <span className={cn("text-[15px] font-semibold text-bz-text", NUM)}>{fmtH(periodTotal)}</span>
                <span className={cn("text-[11px] text-bz-text-muted", NUM)}>/ {fmtH(PERIOD_EXPECTED)} expected</span>
              </span>
              <span className={cn("text-[11px] text-bz-text-muted", NUM)}>
                Chargeable <span className="font-semibold text-bz-text">{fmtH(periodChargeable)}</span>
              </span>
              <span className={cn("text-[11px] text-bz-text-muted", NUM)}>
                Overtime <span className="font-semibold text-bz-text">{fmtH(periodOvertime)}</span>
              </span>
              {!readOnly && <SaveReadout state={save} at={savedAt} />}
            </div>
            {!readOnly && (
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <button onClick={() => runSave()} disabled={save === "saving"} className={GHOST_BTN_SM}>
                  {save === "saving" ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save now
                </button>
                <button onClick={commitForApproval} disabled={submitting || !!submitted} className={cn(PRIMARY_BTN, "h-8")}>
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {submitted ? "Submitted" : "Submit for approval"}
                </button>
              </div>
            )}
            {readOnly && (
              <p className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted">
                <Eye size={12} /> Read-only — you are looking at {person.name}’s record
              </p>
            )}
          </div>
          <Toast toast={toast} onDismiss={clear} offset="bottom-24" />
        </>
      }
    >
      {/* ── document band ───────────────────────────────────────────────── */}
      <header className="border-b border-bz-line bg-bz-paper">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 pb-3 pt-4 md:px-6">
          <button
            onClick={() => navigate(readOnly ? "/design/timesheet/approvals" : "/design/timesheet")}
            className="flex size-8 shrink-0 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
            aria-label="Back"
          >
            <ArrowLeft size={14} />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="text-[20px] font-semibold tracking-tight text-bz-text">
                {perTask ? "Accessibility audit" : PERIOD_LABEL}
              </h1>
              <StateChip label={state.label} severity={state.severity} size="sm" />
              {readOnly && (
                <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-olive px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-bz-text-on-dark">
                  <Eye size={9} /> read-only
                </span>
              )}
            </div>
            <p className={cn("mt-0.5 text-[11.5px] text-bz-text-muted", NUM)}>
              {perTask ? "TSK-4517 · no fixed period" : PERIOD_RANGE} · {docId} · {person.name}
            </p>
          </div>

          {/* period traversal — absent in per-task mode, where the document is
              scoped to a task rather than a period */}
          {!perTask && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => show("info", "Resolving the previous period on the server — it is created if it does not exist yet.")}
                className="flex size-8 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
                aria-label="Previous period"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => show("info", "Resolving the next period on the server — it is created if it does not exist yet.")}
                className="flex size-8 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
                aria-label="Next period"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <StatePreview
              value={mode}
              onChange={(m) => setParams(m === "edit" ? { doc: docId } : { doc: docId, mode: m, ...(m === "readonly" ? { person: "EMP-0157" } : {}) })}
              options={[
                { value: "edit", label: "Editable (my own)" },
                { value: "readonly", label: "Read-only (someone else)" },
                { value: "pertask", label: "Per-task document" },
                { value: "unavailable", label: "No document · closed" },
              ]}
            />
            {!readOnly && !perTask && (
              <button onClick={replicate} className={GHOST_BTN}>
                <Copy size={13} /> Replicate previous period
              </button>
            )}
            {!readOnly && (
              <div className="relative">
                <button onClick={() => setMenuOpen((v) => !v)} aria-label="More actions" className={cn(GHOST_BTN, "px-2")}>
                  <MoreHorizontal size={15} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} aria-hidden />
                    <div className={cn("absolute right-0 top-[42px] z-30 w-[236px] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1", SHADOW)}>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmVoid(true);
                        }}
                        className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FBE5E2]"
                      >
                        <Ban size={13} className="mt-0.5 shrink-0 text-[#9A2E29]" />
                        <span>
                          <span className="block text-[12px] font-medium text-[#9A2E29]">Void this document</span>
                          <span className="block text-[10.5px] text-bz-text-muted">Terminal — the surface becomes read-only for good.</span>
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* the ONLY correction channel in the module — impossible to miss */}
        {sentBackDoc && (
          <div className="border-t border-[#F0CFCB] bg-[#FDF3F2] px-4 py-3 md:px-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-[#FBE5E2] text-[#9A2E29]">
                <AlertTriangle size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-[#9A2E29]">
                  {APPROVER} sent this back on 18 Baishakh — correct it and resubmit.
                </p>
                <p className="mt-1 max-w-[820px] text-[12px] leading-[1.6] text-bz-text">
                  “Three days in the second week are booked to Phase 1 · Finance, but the Apex cutover moved to Phase 2 · Inventory
                  on 24 Baishakh. Please re-attribute 24 hours and resubmit.”
                </p>
                <p className="mt-1.5 text-[10.5px] text-bz-text-muted">
                  Approvers cannot edit your hours — this note is the whole instruction, and it stays here until you resubmit.
                </p>
              </div>
            </div>
          </div>
        )}

        {advisories.length > 0 && (
          <Advisories
            items={advisories}
            onDismiss={(i) => setAdvisories((a) => a.filter((_, x) => x !== i))}
            onDismissAll={() => setAdvisories([])}
          />
        )}

        {/* server-derived corrections arrive named, so they do not feel like loss */}
        {corrections.length > 0 && (
          <div className="border-t border-bz-line-soft bg-bz-paper-warm px-4 py-2.5 md:px-6">
            <div className="flex items-start gap-2.5">
              <Info size={13} className="mt-0.5 shrink-0 text-bz-text-muted" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-bz-text">The server adjusted what you typed</p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {corrections.map((c) => (
                    <li key={c} className="text-[11.5px] leading-[1.55] text-bz-text-muted">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setCorrections([])} className={GHOST_BTN_SM}>
                Got it
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div className="border-t border-bz-line-soft bg-bz-fire/[0.16] px-4 py-2.5 md:px-6">
            <p className="flex items-start gap-2 text-[12px] text-bz-text">
              <Check size={13} className="mt-0.5 shrink-0 text-bz-leaf-deep" />
              {submitted.routed ? (
                <span>
                  Submitted and <span className="font-semibold">routed to {APPROVER}</span> for endorsement. It stays visible here,
                  read-only for the transition, until they act.
                </span>
              ) : (
                <span>
                  Submitted and <span className="font-semibold">settled automatically</span> — no approver is configured for your
                  team, so the hours are already approved fact.
                </span>
              )}
            </p>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-3 px-4 pb-10 pt-4 md:px-6">
        {/* ── stretch selector ─────────────────────────────────────────── */}
        {!perTask && (
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {STRETCHES.map((st) => {
              const filled = st.days.reduce((s, d) => s + dayActual(d.iso), 0);
              const exp = st.days.reduce((s, d) => s + d.expected, 0);
              const active = st.key === stretchKey;
              return (
                <button
                  key={st.key}
                  onClick={() => {
                    setStretchKey(st.key);
                    setMobileDay(st.days[0].iso);
                  }}
                  className={cn(
                    "flex shrink-0 flex-col items-start gap-0.5 rounded-bz-md border px-3 py-2 text-left",
                    active ? "border-bz-olive bg-bz-surface" : "border-bz-line-soft bg-bz-surface/60 hover:bg-bz-surface",
                  )}
                >
                  <span className={cn("text-[11px] font-semibold", active ? "text-bz-text" : "text-bz-text-muted")}>{st.label}</span>
                  <span className={cn("text-[10px] text-bz-text-soft", NUM)}>
                    {dayNum(st.days[0].iso)}–{dayNum(st.days[st.days.length - 1].iso)} {fmtDateShort(st.days[0].iso).split(" ")[0]}
                  </span>
                  <span className={cn("text-[11px]", NUM, filled > exp ? "font-semibold text-bz-text" : "text-bz-text-muted")}>
                    {fmtH(filled)} <span className="text-bz-text-soft">/ {fmtH(exp)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── the matrix ───────────────────────────────────────────────── */}
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-bz-line-soft px-4 py-2.5">
            <p className="text-[12.5px] font-semibold text-bz-text">
              {perTask ? "All recorded days" : stretch.label}
              <span className="ml-2 text-[11px] font-normal text-bz-text-muted">
                {fmtDate(stretch.days[0].iso)} – {fmtDate(stretch.days[stretch.days.length - 1].iso)}
              </span>
            </p>
            <p className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
              Stretch subtotal <span className="font-semibold text-bz-text">{fmtH(stretchTotal)}</span> of{" "}
              {fmtH(stretchExpected)} expected
              <ExplainDot
                title="This is a stretch subtotal"
                body="A month-length period is cut into week-sized stretches so the grid never gets wider than one week. This figure covers this stretch only — the whole-period reading is stated separately in the docked bar and in the period card below."
              />
            </p>
            <p className="ml-auto hidden items-center gap-1.5 text-[10.5px] text-bz-text-soft lg:flex">
              Arrow keys move between cells · Enter commits and drops down · accepts {ACCEPTED_HOURS_FORMS}
            </p>
          </div>

          {/* desktop matrix */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse" style={{ minWidth: 720 }}>
              <thead>
                <tr className="border-b border-bz-line bg-bz-paper-warm/60">
                  <th className="sticky left-0 z-10 w-[300px] min-w-[300px] border-r border-bz-line bg-bz-paper-warm px-3 py-2 text-left">
                    <span className={LABEL}>Work stream</span>
                  </th>
                  {stretch.days.map((d) => (
                    <th key={d.iso} className="min-w-[62px] border-l border-bz-line-soft p-0 align-top">
                      <DayHead d={d} actual={dayActual(d.iso)} />
                    </th>
                  ))}
                  <th className="min-w-[74px] border-l border-bz-line bg-bz-paper-warm px-2 py-2 text-right">
                    <span className={LABEL}>Stretch</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rowsForMatrix.map((s, r) => {
                  const rowStretchTotal = stretch.days.reduce((a, d) => a + (s.hours[d.iso] ?? 0), 0);
                  return (
                    <React.Fragment key={s.key}>
                      <tr className="border-b border-bz-line-soft">
                        <td className="sticky left-0 z-10 w-[300px] min-w-[300px] border-r border-bz-line bg-bz-surface align-top">
                          <StreamIdentity
                            s={s}
                            readOnly={readOnly}
                            onPatch={(p) => patchStream(s.key, p)}
                            onRemove={() => setConfirmRemove(s)}
                            notesOpen={notesOpen.has(s.key)}
                            onToggleNotes={() =>
                              setNotesOpen((prev) => {
                                const n = new Set(prev);
                                n.has(s.key) ? n.delete(s.key) : n.add(s.key);
                                return n;
                              })
                            }
                            onRefuse={(m) => show("error", m)}
                          />
                        </td>
                        {stretch.days.map((d, c) => (
                          <td key={d.iso} className="p-0">
                            <HoursCell
                              value={s.hours[d.iso] ?? 0}
                              frozenReason={s.frozen[d.iso]}
                              overtime={s.overtime[d.iso]}
                              hasNote={!!s.notes[d.iso]?.trim()}
                              nonWorking={isNonWorking(d)}
                              readOnly={readOnly}
                              blockedReason={s.activityId ? null : "no activity"}
                              r={r}
                              c={c}
                              onCommit={(raw) => commitCell(s.key, d.iso, raw)}
                              onMove={(dr, dc) => moveFocus(Math.max(0, Math.min(rowsForMatrix.length - 1, r + dr)), Math.max(0, Math.min(stretch.days.length - 1, c + dc)))}
                            />
                          </td>
                        ))}
                        <td className={cn("border-l border-bz-line bg-bz-paper-warm/40 px-2 text-right text-[12.5px] font-semibold text-bz-text", NUM)}>
                          {rowStretchTotal === 0 ? <Nil /> : fmtH(rowStretchTotal)}
                        </td>
                      </tr>

                      {notesOpen.has(s.key) && (
                        <tr className="border-b border-bz-line-soft bg-bz-paper-warm/40">
                          <td colSpan={stretch.days.length + 2} className="px-3 py-3">
                            <p className={cn(LABEL, "mb-2")}>
                              Per-day narrative — becomes the line detail on the client invoice
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                              {stretch.days
                                .filter((d) => (s.hours[d.iso] ?? 0) > 0)
                                .map((d) => (
                                  <div key={d.iso} className="rounded-bz-sm border border-bz-line-soft bg-bz-surface p-2">
                                    <p className={cn("mb-1 text-[10.5px] font-semibold text-bz-text-muted", NUM)}>
                                      {weekdayOf(d.iso)} {d.bs} · {fmtH(s.hours[d.iso] ?? 0)} h
                                    </p>
                                    <textarea
                                      readOnly={readOnly || !!s.frozen[d.iso]}
                                      value={s.notes[d.iso] ?? ""}
                                      onChange={(e) => patchStream(s.key, { notes: { ...s.notes, [d.iso]: e.target.value } })}
                                      rows={2}
                                      placeholder="Optional…"
                                      className="w-full resize-none rounded-bz-sm border border-bz-line-soft bg-bz-paper px-2 py-1.5 text-[11.5px] leading-[1.5] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
                                    />
                                  </div>
                                ))}
                              {stretch.days.every((d) => (s.hours[d.iso] ?? 0) === 0) && (
                                <p className="text-[11.5px] text-bz-text-muted">No hours on this stream in this stretch — nothing to describe yet.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* the expected series, parallel to the actuals */}
                <tr className="border-b border-bz-line bg-bz-paper-warm/60">
                  <td className="sticky left-0 z-10 border-r border-bz-line bg-bz-paper-warm px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-bz-text">
                      Expected by the calendar
                      <ExplainDot
                        title="Where the calendar puts you"
                        body="Expected hours come from your own working calendar — the organisation's week, its holidays, and your approved leave. It sits under the actuals so under- and over-filing is readable without arithmetic."
                      />
                    </span>
                  </td>
                  {stretch.days.map((d) => {
                    const a = dayActual(d.iso);
                    const excess = a > d.expected;
                    return (
                      <td key={d.iso} className={cn("border-l border-bz-line-soft px-1 py-1.5 text-center", isNonWorking(d) && "bg-bz-paper-warm")}>
                        <span className={cn("block text-[11px]", NUM, "text-bz-text-muted")}>{fmtH(d.expected)}</span>
                        {excess && (
                          <span className={cn("mt-0.5 inline-block rounded-bz-sm bg-bz-fire/[0.3] px-1 text-[9.5px] font-semibold text-bz-text", NUM)}>
                            +{fmtH(a - d.expected)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className={cn("border-l border-bz-line px-2 py-1.5 text-right text-[11.5px] text-bz-text-muted", NUM)}>
                    {fmtH(stretchExpected)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* mobile — a day at a time, one column, roomier */}
          <div className="md:hidden">
            <div className="flex gap-1.5 overflow-x-auto border-b border-bz-line-soft px-3 py-2.5">
              {stretch.days.map((d) => {
                const a = dayActual(d.iso);
                const active = d.iso === mobileDay;
                return (
                  <button
                    key={d.iso}
                    onClick={() => setMobileDay(d.iso)}
                    className={cn(
                      "flex w-[54px] shrink-0 flex-col items-center gap-0.5 rounded-bz-md border py-1.5",
                      active ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : isNonWorking(d) ? "border-bz-line-soft bg-bz-paper-warm" : "border-bz-line-soft bg-bz-surface",
                    )}
                  >
                    <span className={cn("text-[9px] uppercase tracking-[0.06em]", active ? "text-white/60" : "text-bz-text-soft")}>
                      {weekdayOf(d.iso)}
                    </span>
                    <span className={cn("text-[14px] font-semibold leading-none", NUM, active ? "text-bz-text-on-dark" : "text-bz-text")}>{d.bs}</span>
                    <span className={cn("text-[10px]", NUM, active ? "text-white/70" : a > d.expected ? "font-semibold text-bz-text" : "text-bz-text-soft")}>
                      {a === 0 ? "—" : fmtH(a)}
                    </span>
                  </button>
                );
              })}
            </div>

            {(() => {
              const d = stretch.days.find((x) => x.iso === mobileDay) ?? stretch.days[0];
              const reason = dayReason(d);
              const a = dayActual(d.iso);
              return (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-bz-paper-warm/60 px-4 py-2.5">
                    <div>
                      <p className="text-[13px] font-semibold text-bz-text">
                        {weekdayOf(d.iso)} {d.bs} {PERIOD_LABEL.split(" ")[0]}
                      </p>
                      <p className={cn("text-[11px] text-bz-text-muted", NUM)}>{fmtDate(d.iso)}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-[15px] font-semibold text-bz-text", NUM)}>{fmtH(a)}</p>
                      <p className={cn("text-[10.5px] text-bz-text-muted", NUM)}>of {fmtH(d.expected)} expected</p>
                    </div>
                  </div>
                  {reason && (
                    <div className="border-b border-bz-line-soft bg-bz-paper-warm px-4 py-2">
                      <p className="text-[11.5px] leading-[1.5] text-bz-text-muted">
                        <span className="font-semibold text-bz-text">{reason.title}.</span> {reason.body} You can still book hours here.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col gap-2.5 p-3">
                    {rowsForMatrix.map((s) => {
                      const frozenReason = s.frozen[d.iso];
                      const task = s.taskId ? taskById(s.taskId) : null;
                      const project = s.projectId ? projectById(s.projectId) : null;
                      return (
                        <div key={s.key} className="rounded-bz-md border border-bz-line-soft bg-bz-surface p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[12.5px] font-medium text-bz-text">{task ? task.name : project?.name ?? "Untitled stream"}</p>
                              <p className="mt-0.5 truncate text-[11px] text-bz-text-muted">
                                {task ? project?.name ?? "No project" : "No task"} · {s.activityId ? activityById(s.activityId)?.name : "Activity required"}
                              </p>
                            </div>
                            {frozenReason ? (
                              <Explain
                                title="These hours are frozen"
                                body={frozenReason}
                                exit="Reverse the downstream document first — the rest of this timesheet stays editable."
                                tone="blocked"
                                className={cn("flex h-11 w-[84px] shrink-0 items-center justify-center gap-1 rounded-bz-md bg-bz-paper-warm text-[15px] font-semibold text-bz-text-muted", NUM)}
                              >
                                <Lock size={11} />
                                {fmtH(s.hours[d.iso] ?? 0)}
                              </Explain>
                            ) : readOnly ? (
                              <div className={cn("flex h-11 w-[84px] shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-[15px] font-semibold text-bz-text", NUM)}>
                                {fmtHShort(s.hours[d.iso] ?? 0) || "—"}
                              </div>
                            ) : (
                              <input
                                inputMode="decimal"
                                aria-label={`Hours for ${task?.name ?? project?.name}`}
                                defaultValue={fmtHShort(s.hours[d.iso] ?? 0)}
                                key={`${s.key}-${d.iso}-${s.hours[d.iso] ?? 0}`}
                                onBlur={(e) => {
                                  if (!commitCell(s.key, d.iso, e.target.value)) e.target.value = fmtHShort(s.hours[d.iso] ?? 0);
                                }}
                                placeholder="·"
                                className={cn(
                                  "h-11 w-[84px] shrink-0 rounded-bz-md border border-bz-line bg-bz-paper text-center text-[15px] font-semibold text-bz-text outline-none focus:border-bz-olive focus:bg-bz-fire/[0.12]",
                                  NUM,
                                )}
                              />
                            )}
                          </div>
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <span className="inline-flex items-center gap-1.5">
                              <Switch
                                value={s.chargeable}
                                disabled={readOnly}
                                ariaLabel="Chargeable"
                                onChange={(v) => {
                                  if (v && !s.projectId) return show("error", "This stream cannot be made chargeable: the client is derived from the project, and no project is set.");
                                  patchStream(s.key, { chargeable: v });
                                }}
                              />
                              <span className={cn("text-[10px] font-semibold uppercase tracking-[0.06em]", s.chargeable ? "text-bz-text" : "text-bz-text-soft")}>
                                Chargeable
                              </span>
                            </span>
                            {s.overtime[d.iso] ? (
                              <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-fire px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] text-bz-olive">
                                OT {fmtH(s.overtime[d.iso])}
                              </span>
                            ) : null}
                            {noteCount(s) > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-leaf/50 px-1.5 py-0.5 text-[10px] font-medium text-bz-text">
                                <MessageSquareText size={9} /> {noteCount(s)} note{noteCount(s) === 1 ? "" : "s"}
                              </span>
                            )}
                            <span className={cn("ml-auto text-[10.5px] text-bz-text-muted", NUM)}>
                              period {fmtH(streamTotal(s))}
                            </span>
                          </div>
                          {!readOnly && !frozenReason && (
                            <textarea
                              value={s.notes[d.iso] ?? ""}
                              onChange={(e) => patchStream(s.key, { notes: { ...s.notes, [d.iso]: e.target.value } })}
                              rows={2}
                              placeholder="Narrative for this day (optional — it becomes the invoice line detail)"
                              className="mt-2.5 w-full resize-none rounded-bz-sm border border-bz-line-soft bg-bz-paper px-2 py-1.5 text-[11.5px] leading-[1.5] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>

          {/* add a stream */}
          {!readOnly &&
            (composing ? (
              <StreamComposer
                existing={streams}
                onCancel={() => setComposing(false)}
                onAdd={(s) => {
                  setStreams((prev) => [...prev, s]);
                  setComposing(false);
                  show("success", "Stream added. It is not stored until it carries hours or a finished identity.");
                }}
              />
            ) : (
              <button
                onClick={() => setComposing(true)}
                className="flex w-full items-center justify-center gap-1.5 border-t border-bz-line-soft bg-bz-paper-warm/40 py-3 text-[12px] font-semibold text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
              >
                <Plus size={13} /> Add a work stream
              </button>
            ))}
        </section>

        {/* ── whole-period reading, stated separately ───────────────────── */}
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-bz-line-soft px-4 py-2.5">
            <p className="text-[12.5px] font-semibold text-bz-text">
              Whole period · {perTask ? "TSK-4517" : PERIOD_LABEL}
            </p>
            <p className={cn("text-[11px] text-bz-text-muted", NUM)}>
              {fmtH(periodTotal)} filed of {fmtH(PERIOD_EXPECTED)} expected ·{" "}
              <span className={cn("font-semibold", periodTotal < PERIOD_EXPECTED ? "text-[#9A2E29]" : "text-bz-text")}>
                {periodTotal < PERIOD_EXPECTED ? `${fmtH(PERIOD_EXPECTED - periodTotal)} short` : "on target"}
              </span>
            </p>
          </div>
          <div className="divide-y divide-bz-line-soft">
            {streams.map((s) => {
              const t = streamTotal(s);
              const task = s.taskId ? taskById(s.taskId) : null;
              const project = s.projectId ? projectById(s.projectId) : null;
              return (
                <div key={s.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-bz-text">{task ? task.name : project?.name ?? "Untitled stream"}</span>
                    <span className="block truncate text-[10.5px] text-bz-text-soft">
                      {project ? project.name : "No project"} · {s.activityId ? activityById(s.activityId)?.name : "No activity"}
                      {s.chargeable ? " · chargeable" : ""}
                    </span>
                  </span>
                  <span className="w-[120px] shrink-0">
                    <MeterBar pct={(t / Math.max(1, periodTotal)) * 100} fill={s.chargeable ? "var(--bz-olive)" : "var(--bz-leaf-deep)"} />
                  </span>
                  <span className={cn("w-[64px] shrink-0 text-right text-[12.5px] font-semibold text-bz-text", NUM)}>{fmtH(t)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 border-t border-bz-line bg-bz-paper-warm/50 px-4 py-2.5">
            <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
              Chargeable <span className="font-semibold text-bz-text">{fmtH(periodChargeable)}</span>
            </span>
            <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
              Overtime <span className="font-semibold text-bz-text">{fmtH(periodOvertime)}</span>
            </span>
            <span className={cn("text-[13px] font-semibold text-bz-text", NUM)}>Period total {fmtH(periodTotal)}</span>
          </div>
        </section>

        <SupplementaryPanel open={suppOpen} setOpen={setSuppOpen} values={supp} setValues={(v) => { setSupp(v); markDirty(); }} missing={missing} readOnly={readOnly} />
      </div>

      <Confirm
        open={confirmVoid}
        title="Void this timesheet?"
        body="Voiding is terminal. The document is frozen permanently and this surface becomes read-only for good — the hours stay on record but can never be edited again."
        confirmLabel="Void it permanently"
        onCancel={() => setConfirmVoid(false)}
        onConfirm={() => {
          setConfirmVoid(false);
          show("success", "The document is voided. It is now read-only for good.");
        }}
      />

      <Confirm
        open={confirmRemove !== null}
        title="Remove this work stream?"
        body={
          confirmRemove && streamHasFrozen(confirmRemove)
            ? "Some of this stream's hours are already invoiced, so it cannot be removed — you will be told why."
            : "Its hours in every stretch of this period go with it."
        }
        confirmLabel="Remove it"
        onCancel={() => setConfirmRemove(null)}
        onConfirm={() => confirmRemove && removeStream(confirmRemove)}
      />
    </AppShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ADVISORIES — warn, never block. Full sentences, computed from the document.
// ════════════════════════════════════════════════════════════════════════════

function buildAdvisories(streams: Stream[]): string[] {
  const out: string[] = [];
  streams.forEach((s) => {
    const task = s.taskId ? taskById(s.taskId) : null;
    const project = s.projectId ? projectById(s.projectId) : null;
    Object.entries(s.hours).forEach(([iso, h]) => {
      if (h <= 0) return;
      const d = PERIOD_DAYS.find((x) => x.iso === iso);
      if (d?.holiday) {
        out.push(
          `${fmtH(h)} hours are booked on ${fmtDate(iso)}, a public holiday (${d.holiday.split("—")[0].trim()}). That is allowed — the day simply expects nothing from you.`,
        );
      }
      if (d?.leave) {
        out.push(`${fmtH(h)} hours are booked on ${fmtDate(iso)}, a day of approved leave. Allowed, but worth confirming with your approver.`);
      }
      const win = s.projectId ? PROJECT_WINDOWS[s.projectId] : undefined;
      if (win && (iso < win.from || iso > win.to)) {
        out.push(
          `${fmtDate(iso)} falls outside ${project?.name}'s dates (${fmtDate(win.from)} – ${fmtDate(win.to)}). The hours are kept and will still roll up to the project.`,
        );
      }
    });
    if (task?.completed && streamTotal(s) > 0) {
      out.push(`${task.name} (${task.id}) is marked completed, but ${fmtH(streamTotal(s))} hours are booked against it this period.`);
    }
    if (s.chargeable && !s.projectId) {
      out.push("Chargeability was switched off on a stream with no project — the client is derived from the project.");
    }
  });
  return Array.from(new Set(out));
}
