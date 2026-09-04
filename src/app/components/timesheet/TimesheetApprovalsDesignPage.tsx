import * as React from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock3,
  CornerUpLeft,
  ExternalLink,
  Loader2,
  PartyPopper,
  X,
} from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import {
  BulkProgress,
  CARD,
  Checkbox,
  Confirm,
  Crumb,
  ExplainDot,
  FailedBlock,
  GHOST_BTN_SM,
  LABEL,
  LoadingRows,
  NUM,
  Nil,
  PRIMARY_BTN,
  ReadState,
  StateBlock,
  StatePreview,
  Toast,
  fmtDate,
  fmtDateShort,
  fmtH,
  personById,
  useBulkRunner,
  useDocumentTitle,
  useToast,
  weekdayOf,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// TIMESHEET · APPROVALS  (surface C — the endorser's queue)
//
// PRIMARY ACTION: clear the queue. So the queue's SIZE is the page's headline,
// each row carries its own Endorse button (only that row goes busy — a fast
// approver is never blocked by someone else's request), and the evidence you
// are endorsing opens inside the row rather than on another screen.
//
// Send-back is the module's only correction channel — approvers cannot edit
// hours — so its reason capture is a first-class panel that refuses to proceed
// empty, not an afterthought prompt.
//
// Bulk endorsement is deliberately built on the SAME sequential runner as the
// personal record's bulk destruction: live progress, no re-trigger mid-run, and
// an honest completion split. The two surfaces now behave identically.
// ════════════════════════════════════════════════════════════════════════════

type PreviewDay = { iso: string; bs: number };
type PreviewStream = { task: string | null; project: string | null; activity: string; hours: Record<string, number> };

type QueueEntry = {
  id: string;
  personId: string;
  periodLabel: string;
  rangeFrom: string;
  rangeTo: string;
  total: number;
  overtime: number;
  submittedISO: string;
  waitingDays: number;
  days: PreviewDay[];
  streams: PreviewStream[];
  /** Stated on attempt — never pre-disabled. */
  endorseRefusal?: string;
};

const wk = (from: string, bsFrom: number, n: number): PreviewDay[] => {
  const [y, m, d] = from.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    const iso = dt.toISOString().slice(0, 10);
    return { iso, bs: bsFrom + i };
  });
};

const W1 = wk("2026-06-07", 24, 7); // a week-length period
const M1 = wk("2026-05-24", 10, 7); // one stretch of a month-length period

const QUEUE_SEED: QueueEntry[] = [
  {
    id: "TS-0157-2083-W24", personId: "EMP-0157", periodLabel: "Week 24 · 2083", rangeFrom: "2026-06-07", rangeTo: "2026-06-13",
    total: 42, overtime: 2, submittedISO: "2026-06-14", waitingDays: 1, days: W1,
    streams: [
      { task: "Sprint 14 — POS receipts", project: "Himalayan POS Deployment", activity: "Development", hours: { "2026-06-07": 8, "2026-06-08": 8, "2026-06-09": 6, "2026-06-10": 8 } },
      { task: null, project: "Internal R&D", activity: "Internal admin", hours: { "2026-06-09": 2, "2026-06-11": 4 } },
      { task: "Costing engine spike", project: "Internal R&D", activity: "Development", hours: { "2026-06-11": 4, "2026-06-12": 2 } },
    ],
  },
  {
    id: "TS-0163-2083-W24", personId: "EMP-0163", periodLabel: "Week 24 · 2083", rangeFrom: "2026-06-07", rangeTo: "2026-06-13",
    total: 38.5, overtime: 0, submittedISO: "2026-06-14", waitingDays: 1, days: W1,
    streams: [
      { task: "Client training — batch 2", project: "Everest Portal Revamp", activity: "Training", hours: { "2026-06-08": 8, "2026-06-09": 8, "2026-06-10": 6.5 } },
      { task: null, project: "Everest Portal Revamp", activity: "Consulting", hours: { "2026-06-11": 8, "2026-06-12": 8 } },
    ],
  },
  {
    id: "TS-0171-2083-W24", personId: "EMP-0171", periodLabel: "Week 24 · 2083", rangeFrom: "2026-06-07", rangeTo: "2026-06-13",
    total: 46, overtime: 6, submittedISO: "2026-06-13", waitingDays: 2, days: W1,
    streams: [
      { task: "Warehouse bin mapping", project: "Warehouse cutover", activity: "Consulting", hours: { "2026-06-07": 10, "2026-06-08": 10, "2026-06-09": 8, "2026-06-10": 8 } },
      { task: null, project: null, activity: "Travel", hours: { "2026-06-11": 10 } },
    ],
  },
  {
    id: "TS-0188-2083-02", personId: "EMP-0188", periodLabel: "Jestha 2083", rangeFrom: "2026-05-15", rangeTo: "2026-06-14",
    total: 171.5, overtime: 3.5, submittedISO: "2026-06-15", waitingDays: 0, days: M1,
    streams: [
      { task: "Stock take procedure", project: "Phase 2 · Inventory", activity: "QA testing", hours: { "2026-05-24": 8, "2026-05-25": 8, "2026-05-26": 8, "2026-05-27": 8, "2026-05-28": 8 } },
      { task: null, project: "Phase 1 · Finance", activity: "QA testing", hours: { "2026-05-29": 3.5 } },
    ],
  },
  {
    id: "TS-0203-2083-02", personId: "EMP-0203", periodLabel: "Jestha 2083", rangeFrom: "2026-05-15", rangeTo: "2026-06-14",
    total: 160, overtime: 0, submittedISO: "2026-06-15", waitingDays: 0, days: M1,
    streams: [
      { task: "Support rota — May", project: null, activity: "Support", hours: { "2026-05-24": 8, "2026-05-25": 8, "2026-05-26": 8, "2026-05-27": 8, "2026-05-28": 8 } },
    ],
    endorseRefusal: "Periods up to 31 Baishakh 2083 are administratively closed — endorsement is refused until the closure is lifted.",
  },
  {
    id: "TS-0209-2083-01", personId: "EMP-0209", periodLabel: "Baishakh 2083", rangeFrom: "2026-04-14", rangeTo: "2026-05-14",
    total: 152, overtime: 0, submittedISO: "2026-05-16", waitingDays: 30, days: M1,
    streams: [
      { task: "Terminal hardware pilot", project: "Himalayan POS Deployment", activity: "Development", hours: { "2026-05-24": 8, "2026-05-25": 8 } },
    ],
    endorseRefusal: "The filer voided this document after submitting it — there is nothing left to endorse.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// EVIDENCE PREVIEW  —  fetched on demand, so it has a real loading state
// ════════════════════════════════════════════════════════════════════════════

function EvidencePreview({ entry, state }: { entry: QueueEntry; state: "loading" | "loaded" }) {
  if (state === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-8">
        <Loader2 size={15} className="animate-spin text-bz-fire" />
        <span className="text-[12px] text-bz-text-muted">Fetching the hours behind {entry.id}…</span>
      </div>
    );
  }
  const dayTotal = (iso: string) => entry.streams.reduce((s, st) => s + (st.hours[iso] ?? 0), 0);
  return (
    <div className="overflow-x-auto rounded-bz-md border border-bz-line-soft bg-bz-surface">
      <table className="w-full border-collapse text-left" style={{ minWidth: 680 }}>
        <thead>
          <tr className="border-b border-bz-line-soft bg-bz-paper-warm/60">
            <th className="px-3 py-2 text-left">
              <span className={LABEL}>Work stream</span>
            </th>
            {entry.days.map((d) => (
              <th key={d.iso} className="min-w-[54px] border-l border-bz-line-soft px-1 py-1.5 text-center">
                <span className="block text-[9px] uppercase tracking-[0.06em] text-bz-text-soft">{weekdayOf(d.iso)}</span>
                <span className={cn("block text-[11.5px] font-semibold text-bz-text", NUM)}>{d.bs}</span>
              </th>
            ))}
            <th className="min-w-[62px] border-l border-bz-line px-2 py-2 text-right">
              <span className={LABEL}>Total</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entry.streams.map((st, i) => {
            const t = Object.values(st.hours).reduce((a, b) => a + b, 0);
            return (
              <tr key={i} className="border-b border-bz-line-soft last:border-0">
                <td className="px-3 py-2.5">
                  <span className="block text-[12px] font-medium text-bz-text">{st.task ?? <span className="italic text-bz-text-soft">No task</span>}</span>
                  <span className="block text-[10.5px] text-bz-text-muted">
                    {st.project ?? <span className="italic">No project</span>} · {st.activity}
                  </span>
                </td>
                {entry.days.map((d) => {
                  const h = st.hours[d.iso] ?? 0;
                  return (
                    <td key={d.iso} className={cn("border-l border-bz-line-soft px-1 py-2.5 text-center text-[12px]", NUM, h ? "text-bz-text" : "text-bz-text-soft")}>
                      {h ? fmtH(h) : "—"}
                    </td>
                  );
                })}
                <td className={cn("border-l border-bz-line px-2 py-2.5 text-right text-[12px] font-semibold text-bz-text", NUM)}>{fmtH(t)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-bz-line bg-bz-paper-warm/50">
            <td className="px-3 py-2 text-[11.5px] font-medium text-bz-text-muted">Per day</td>
            {entry.days.map((d) => (
              <td key={d.iso} className={cn("border-l border-bz-line-soft px-1 py-2 text-center text-[11.5px] font-semibold text-bz-text", NUM)}>
                {dayTotal(d.iso) ? fmtH(dayTotal(d.iso)) : "—"}
              </td>
            ))}
            <td className={cn("border-l border-bz-line px-2 py-2 text-right text-[12px] font-semibold text-bz-text", NUM)}>
              {fmtH(entry.streams.reduce((s, st) => s + Object.values(st.hours).reduce((a, b) => a + b, 0), 0))}
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="border-t border-bz-line-soft px-3 py-2 text-[10.5px] text-bz-text-soft">
        This stretch only — the period runs {fmtDate(entry.rangeFrom)} to {fmtDate(entry.rangeTo)} and totals{" "}
        <span className={cn("font-semibold text-bz-text-muted", NUM)}>{fmtH(entry.total)}</span> hours. The day axis comes from the
        document’s own calendar, because period shape varies per person.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SEND-BACK  — the mandatory reason
// ════════════════════════════════════════════════════════════════════════════

function SendBackPanel({ entry, onCancel, onSend }: { entry: QueueEntry; onCancel: () => void; onSend: (reason: string) => void }) {
  const [reason, setReason] = React.useState("");
  const [refused, setRefused] = React.useState(false);
  const person = personById(entry.personId);
  return (
    <div className="rounded-bz-md border border-[#F0CFCB] bg-[#FDF3F2] p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-[#FBE5E2] text-[#9A2E29]">
          <CornerUpLeft size={13} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-bz-text">Send {entry.id} back to {person?.name}</p>
          <p className="mt-0.5 text-[11.5px] leading-[1.5] text-bz-text-muted">
            You cannot edit their hours — this note is the entire correction instruction they will receive, and it stays pinned to
            their document until they resubmit.
          </p>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setRefused(false);
            }}
            rows={3}
            placeholder="Say exactly what must change, and why…"
            className={cn(
              "mt-2.5 w-full resize-none rounded-bz-md border bg-bz-surface px-2.5 py-2 text-[12px] leading-[1.55] text-bz-text outline-none placeholder:text-bz-text-soft",
              refused ? "border-[#C0413A]" : "border-bz-line focus:border-bz-text-muted",
            )}
          />
          {refused && (
            <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] font-medium text-[#9A2E29]">
              <Ban size={12} className="mt-0.5 shrink-0" />
              A reason is required. Without one the filer has no idea what to change.
            </p>
          )}
          <div className="mt-2.5 flex items-center justify-end gap-2">
            <button onClick={onCancel} className={GHOST_BTN_SM}>
              Cancel
            </button>
            <button
              onClick={() => (reason.trim() ? onSend(reason.trim()) : setRefused(true))}
              className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3.5 text-[12px] font-semibold text-white hover:opacity-95"
            >
              <CornerUpLeft size={12} /> Send it back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// QUEUE ROW
// ════════════════════════════════════════════════════════════════════════════

function QueueRow({
  entry,
  marked,
  onMark,
  open,
  onToggle,
  previewState,
  busy,
  refusal,
  onEndorse,
  onOpenFull,
  sendBackOpen,
  onSendBackOpen,
  onSendBack,
  onCancelSendBack,
}: {
  entry: QueueEntry;
  marked: boolean;
  onMark: (v: boolean) => void;
  open: boolean;
  onToggle: () => void;
  previewState: "loading" | "loaded";
  busy: boolean;
  refusal: string | null;
  onEndorse: () => void;
  onOpenFull: () => void;
  sendBackOpen: boolean;
  onSendBackOpen: () => void;
  onSendBack: (reason: string) => void;
  onCancelSendBack: () => void;
}) {
  const person = personById(entry.personId)!;
  const initials = person.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div className={cn("border-b border-bz-line-soft last:border-0", marked && "bg-bz-fire/[0.06]", busy && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 px-3 py-3 md:px-4">
        <Checkbox checked={marked} onChange={onMark} ariaLabel={`Mark ${entry.id}`} />

        <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-[10.5px] font-bold text-bz-text-muted">
          {initials}
        </span>

        <div className="min-w-[160px] flex-1">
          <p className="truncate text-[13px] font-medium text-bz-text">{person.name}</p>
          <p className={cn("truncate text-[10.5px] text-bz-text-soft", NUM)}>
            {entry.id} · {person.team}
          </p>
        </div>

        <div className="min-w-[132px]">
          <p className="text-[12px] text-bz-text">{entry.periodLabel}</p>
          <p className={cn("text-[10.5px] text-bz-text-soft", NUM)}>
            {fmtDateShort(entry.rangeFrom)} – {fmtDateShort(entry.rangeTo)}
          </p>
        </div>

        <div className="w-[74px] text-right">
          <p className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{fmtH(entry.total)}</p>
          <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">hours</p>
        </div>

        <div className="w-[74px] text-right">
          {entry.overtime === 0 ? (
            <Nil />
          ) : (
            <span className={cn("inline-flex items-center rounded-bz-sm bg-bz-fire/[0.20] px-1.5 py-0.5 text-[11.5px] font-semibold text-bz-text", NUM)}>
              {fmtH(entry.overtime)}
            </span>
          )}
          <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">overtime</p>
        </div>

        <div className="hidden w-[110px] lg:block">
          <p className={cn("text-[11.5px] text-bz-text-muted", NUM)}>{fmtDate(entry.submittedISO)}</p>
          <p className={cn("text-[10px] text-bz-text-soft", NUM)}>
            {entry.waitingDays === 0 ? "submitted today" : `waiting ${entry.waitingDays}d`}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-1.5">
          <button onClick={onToggle} className={cn(GHOST_BTN_SM, open && "border-bz-text-muted bg-bz-paper-warm")}>
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Evidence
          </button>
          <button onClick={onSendBackOpen} className={GHOST_BTN_SM}>
            <CornerUpLeft size={12} /> Send back
          </button>
          <button onClick={onEndorse} disabled={busy} className={cn(PRIMARY_BTN, "h-8")}>
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Endorse
          </button>
        </div>
      </div>

      {refusal && (
        <div className="mx-3 mb-3 flex items-start gap-2 rounded-bz-sm bg-[#FBE5E2] px-2.5 py-2 md:mx-4">
          <Ban size={12} className="mt-0.5 shrink-0 text-[#9A2E29]" />
          <p className="text-[11.5px] leading-[1.5] text-[#9A2E29]">
            <span className="font-semibold">Not endorsed.</span> {refusal}
          </p>
        </div>
      )}

      {sendBackOpen && (
        <div className="px-3 pb-3 md:px-4">
          <SendBackPanel entry={entry} onCancel={onCancelSendBack} onSend={onSendBack} />
        </div>
      )}

      {open && (
        <div className="bg-bz-paper-warm/40 px-3 pb-3.5 md:px-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className={LABEL}>What you are endorsing</p>
            <button onClick={onOpenFull} className={GHOST_BTN_SM}>
              <ExternalLink size={11} /> Open the full record (read-only)
            </button>
          </div>
          <EvidencePreview entry={entry} state={previewState} />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function TimesheetApprovalsDesignPage() {
  useDocumentTitle("Approvals");
  const navigate = useNavigate();
  const { toast, show, clear } = useToast();

  const [read, setRead] = React.useState<ReadState>("loading");
  const [preview, setPreview] = React.useState<"ready" | "loading" | "empty" | "failed">("ready");
  const [queue, setQueue] = React.useState<QueueEntry[]>(QUEUE_SEED);
  const [marked, setMarked] = React.useState<Set<string>>(new Set());
  const [openId, setOpenId] = React.useState<string | null>(null); // at most ONE preview
  const [previewState, setPreviewState] = React.useState<Record<string, "loading" | "loaded">>({});
  const [busyId, setBusyId] = React.useState<string | null>(null); // only THAT entry is busy
  const [refusals, setRefusals] = React.useState<Record<string, string>>({});
  const [sendBackId, setSendBackId] = React.useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = React.useState(false);
  const { run, start, clear: clearRun } = useBulkRunner();

  React.useEffect(() => {
    if (preview === "loading") return setRead("loading");
    if (preview === "empty") setQueue([]);
    if (preview === "ready") setQueue(QUEUE_SEED);
    setRead("loading");
    const t = window.setTimeout(() => setRead(preview), 520);
    return () => window.clearTimeout(t);
  }, [preview]);

  const togglePreview = (id: string) => {
    setOpenId((cur) => {
      if (cur === id) return null;
      if (!previewState[id]) {
        setPreviewState((m) => ({ ...m, [id]: "loading" }));
        window.setTimeout(() => setPreviewState((m) => ({ ...m, [id]: "loaded" })), 620);
      }
      return id;
    });
  };

  const endorse = (entry: QueueEntry) => {
    setBusyId(entry.id);
    setRefusals((r) => {
      const n = { ...r };
      delete n[entry.id];
      return n;
    });
    window.setTimeout(() => {
      setBusyId(null);
      if (entry.endorseRefusal) {
        setRefusals((r) => ({ ...r, [entry.id]: entry.endorseRefusal! }));
        return;
      }
      setQueue((q) => q.filter((e) => e.id !== entry.id));
      setMarked((m) => {
        const n = new Set(m);
        n.delete(entry.id);
        return n;
      });
      show("success", `${entry.id} endorsed — ${fmtH(entry.total)} hours are now approved fact.`);
    }, 720);
  };

  const sendBack = (entry: QueueEntry, reason: string) => {
    setQueue((q) => q.filter((e) => e.id !== entry.id));
    setSendBackId(null);
    show("success", `${entry.id} sent back to ${personById(entry.personId)?.name}. Your reason is now pinned to their document: “${reason.slice(0, 60)}${reason.length > 60 ? "…" : ""}”`);
  };

  const markedIds = React.useMemo(() => queue.filter((e) => marked.has(e.id)).map((e) => e.id), [queue, marked]);
  const totalHours = React.useMemo(() => queue.reduce((s, e) => s + e.total, 0), [queue]);
  const totalOvertime = React.useMemo(() => queue.reduce((s, e) => s + e.overtime, 0), [queue]);
  const oldest = React.useMemo(() => queue.reduce((m, e) => Math.max(m, e.waitingDays), 0), [queue]);
  const people = React.useMemo(() => new Set(queue.map((e) => e.personId)).size, [queue]);

  const runBulk = () => {
    setConfirmBulk(false);
    const ids = [...markedIds];
    start(
      ids,
      "Endorsing timesheets",
      (id) => queue.find((e) => e.id === id)?.endorseRefusal ?? null,
      (id, reason) => {
        if (reason) setRefusals((r) => ({ ...r, [id]: reason }));
        else setQueue((q) => q.filter((e) => e.id !== id));
      },
    );
    setMarked(new Set());
  };

  return (
    <AppShell
      breadcrumb={<Crumb page="Approvals" />}
      overlay={
        <>
          {run && <BulkProgress run={run} onDismiss={clearRun} />}
          {!run && markedIds.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
              <p className="flex min-w-0 items-center gap-2 text-[12px] text-bz-text">
                <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />
                <span className="truncate">
                  <span className={cn("font-semibold", NUM)}>{markedIds.length}</span> marked ·{" "}
                  <span className={NUM}>{fmtH(queue.filter((e) => marked.has(e.id)).reduce((s, e) => s + e.total, 0))}</span> hours
                </span>
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => setMarked(new Set())} className={GHOST_BTN_SM}>
                  <X size={11} /> Clear
                </button>
                <button onClick={() => setConfirmBulk(true)} className={cn(PRIMARY_BTN, "h-8")}>
                  <CheckCheck size={12} /> Endorse {markedIds.length}
                </button>
              </div>
            </div>
          )}
          <Toast toast={toast} onDismiss={clear} offset={markedIds.length > 0 || run ? "bottom-24" : "bottom-6"} />
        </>
      }
    >
      {/* ── header: the queue's size IS the reading ────────────────────── */}
      <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <p className={LABEL}>Awaiting your endorsement</p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className={cn("text-[34px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>{queue.length}</h1>
              <p className="text-[14px] text-bz-text-muted">
                {queue.length === 1 ? "timesheet is" : "timesheets are"} waiting on you
              </p>
            </div>
            <p className={cn("mt-2 text-[12px] text-bz-text-muted", NUM)}>
              <span className="font-semibold text-bz-text">{fmtH(totalHours)}</span> hours from{" "}
              <span className="font-semibold text-bz-text">{people}</span> {people === 1 ? "person" : "people"} ·{" "}
              <span className="font-semibold text-bz-text">{fmtH(totalOvertime)}</span> of it overtime
              {oldest > 0 && (
                <>
                  {" · oldest has waited "}
                  <span className="font-semibold text-bz-text">{oldest}</span> {oldest === 1 ? "day" : "days"}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="hidden max-w-[280px] text-[11px] leading-[1.5] text-bz-text-soft md:block">
              Endorsing does not lock a document. It stays editable for its filer — what freezes is per-row, once hours are invoiced
              or taken by payroll.
            </p>
            <StatePreview
              value={preview}
              onChange={(v) => {
                setPreview(v);
                setMarked(new Set());
                setOpenId(null);
                setRefusals({});
              }}
              options={[
                { value: "ready", label: "Queue loaded" },
                { value: "loading", label: "Loading" },
                { value: "empty", label: "Cleared queue" },
                { value: "failed", label: "Failed read" },
              ]}
            />
          </div>
        </div>
      </header>

      <div className="px-4 pb-10 pt-4 md:px-8">
        <section className={cn(CARD, "overflow-hidden")}>
          {queue.length > 0 && read === "ready" && (
            <div className="flex items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-2.5 md:px-4">
              <Checkbox
                checked={queue.length > 0 && markedIds.length === queue.length}
                indeterminate={markedIds.length > 0 && markedIds.length < queue.length}
                onChange={(v) => setMarked(v ? new Set(queue.map((e) => e.id)) : new Set())}
                ariaLabel="Mark the whole queue"
              />
              <p className={cn(LABEL, "flex items-center gap-1.5")}>
                Mark all
                <ExplainDot
                  title="Bulk endorsement runs one at a time"
                  body="Marked timesheets are endorsed sequentially, with live progress. A refusal on one never stops the rest, and the completion message reports the split with each distinct reason named."
                />
              </p>
              <p className={cn("ml-auto text-[11.5px] text-bz-text-muted", NUM)}>
                <span className="font-semibold text-bz-text">{queue.length}</span> in the queue
              </p>
            </div>
          )}

          {read === "loading" ? (
            <LoadingRows rows={4} label="Loading your queue…" />
          ) : read === "failed" ? (
            <FailedBlock
              what="the approval queue"
              detail="TIMESHEET_APPROVAL_QUEUE · 503 from the workflow service."
              onRetry={() => setPreview("ready")}
            />
          ) : queue.length === 0 ? (
            <StateBlock
              tone="positive"
              icon={<PartyPopper size={22} />}
              title="Nothing is waiting on you"
              body={
                <>
                  Every timesheet routed to you has been endorsed or sent back. This is the finished state of this queue — there is
                  nothing here to create.
                </>
              }
              action={
                <button onClick={() => navigate("/design/timesheet/register")} className={cn(GHOST_BTN_SM, "mt-1 h-9")}>
                  <Clock3 size={12} /> See who has not filed yet
                </button>
              }
            />
          ) : (
            queue.map((e) => (
              <QueueRow
                key={e.id}
                entry={e}
                marked={marked.has(e.id)}
                onMark={(v) =>
                  setMarked((prev) => {
                    const n = new Set(prev);
                    v ? n.add(e.id) : n.delete(e.id);
                    return n;
                  })
                }
                open={openId === e.id}
                onToggle={() => togglePreview(e.id)}
                previewState={previewState[e.id] ?? "loading"}
                busy={busyId === e.id || (!!run && !run.finished)}
                refusal={refusals[e.id] ?? null}
                onEndorse={() => endorse(e)}
                onOpenFull={() => navigate(`/design/timesheet/entry?doc=${e.id}&mode=readonly&person=${e.personId}`)}
                sendBackOpen={sendBackId === e.id}
                onSendBackOpen={() => setSendBackId(e.id)}
                onSendBack={(reason) => sendBack(e, reason)}
                onCancelSendBack={() => setSendBackId(null)}
              />
            ))
          )}
        </section>

        {queue.length > 0 && read === "ready" && (
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-[1.5] text-bz-text-soft">
            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
            Endorsement is immediate and unconfirmed — only the row you act on goes busy, so you are never blocked waiting on someone
            else’s request. A refusal keeps the row where it is, with the reason attached.
          </p>
        )}
      </div>

      <Confirm
        open={confirmBulk}
        tone="normal"
        title={`Endorse ${markedIds.length} ${markedIds.length === 1 ? "timesheet" : "timesheets"}?`}
        body={
          <>
            <span className={NUM}>{fmtH(queue.filter((e) => marked.has(e.id)).reduce((s, e) => s + e.total, 0))}</span> hours become
            approved fact. They are processed one at a time with live progress; anything refused stays in the queue with its reason.
          </>
        }
        confirmLabel={`Endorse ${markedIds.length}`}
        onCancel={() => setConfirmBulk(false)}
        onConfirm={runBulk}
      />
    </AppShell>
  );
}
