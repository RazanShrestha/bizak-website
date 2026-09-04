import * as React from "react";
import { Info, Play, SearchX, Scale } from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import {
  CARD,
  Crumb,
  DefectChip,
  ExplainDot,
  FailedBlock,
  GHOST_BTN,
  INPUT,
  LABEL,
  LoadingRows,
  Lookup,
  NUM,
  Nil,
  PEOPLE_OPTIONS,
  PRIMARY_BTN,
  ReadState,
  StateBlock,
  StatePreview,
  Tile,
  Toast,
  fmtDate,
  fmtDateShort,
  fmtH,
  personById,
  useDocumentTitle,
  useToast,
  weekdayOf,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// TIMESHEET · PRESENCE CHECK  (surface G — attendance against booked hours)
//
// PRIMARY ACTION: read where the two sources disagree. Attendance records THAT
// someone was there; the timesheet records HOW that time was spent. This page
// exists only to expose the gap, so the DIFFERENCE column is the anchor of the
// row and its severity is resolved in a fixed precedence — with an incomplete
// clock pair outranking everything, because then the difference is not large,
// it is unknowable.
//
// There is no selection, no expansion and no action here. It never shows money.
// ════════════════════════════════════════════════════════════════════════════

type Entry = {
  personId: string;
  iso: string;
  clockIn: string | null;
  clockOut: string | null;
  present: number | null; // null ⇒ the pair is incomplete, or there was no record
  booked: number;
  holiday?: string;
  leave?: string;
  noAttendance?: boolean;
};

const E = (personId: string, iso: string, clockIn: string | null, clockOut: string | null, present: number | null, booked: number, extra: Partial<Entry> = {}): Entry => ({
  personId, iso, clockIn, clockOut, present, booked, ...extra,
});

const ENTRIES: Entry[] = [
  E("EMP-0142", "2026-06-08", "09:12", "17:40", 8.47, 8),
  E("EMP-0142", "2026-06-09", "09:04", "18:55", 9.85, 8),
  E("EMP-0142", "2026-06-10", "09:20", null, null, 8, {}),
  E("EMP-0142", "2026-06-11", null, null, null, 6, { noAttendance: true }),
  E("EMP-0157", "2026-06-08", "08:55", "17:05", 8.17, 8),
  E("EMP-0157", "2026-06-09", "08:58", "17:12", 8.23, 10),
  E("EMP-0157", "2026-06-10", "09:02", "16:30", 7.47, 0),
  E("EMP-0163", "2026-06-08", "09:30", "18:00", 8.5, 8.5),
  E("EMP-0163", "2026-06-09", "09:28", "17:50", 8.37, 8),
  E("EMP-0163", "2026-06-11", "10:05", "14:20", 4.25, 8.5),
  E("EMP-0171", "2026-06-08", "07:50", "19:10", 11.33, 10),
  E("EMP-0171", "2026-06-09", "07:55", "18:40", 10.75, 12),
  E("EMP-0171", "2026-06-12", null, null, null, 4, { noAttendance: true }),
  E("EMP-0188", "2026-05-29", "10:00", "14:00", 4, 3.5, { holiday: "Republic Day (Ganatantra Diwas) — a public holiday on the company calendar." }),
  E("EMP-0188", "2026-06-04", null, null, null, 2, { leave: "Annual leave — approved on 12 Baishakh.", noAttendance: true }),
  E("EMP-0188", "2026-06-09", "09:10", "17:15", 8.08, 8),
  E("EMP-0203", "2026-06-09", "09:45", "17:30", 7.75, 0),
  E("EMP-0203", "2026-06-10", "09:15", null, null, 7, {}),
];

// ── the graded discrepancy, in a FIXED precedence ───────────────────────────
type Grade = "unknowable" | "informational" | "reconciled" | "over" | "unaccounted";

const TOLERANCE = 0.5;

function gradeOf(e: Entry): Grade {
  // an incomplete clock pair outranks everything: the presence figure is
  // untrustworthy, so the discrepancy is unknowable rather than large
  if ((e.clockIn && !e.clockOut) || (!e.clockIn && e.clockOut)) return "unknowable";
  if (e.present === null) return "informational";
  const diff = e.booked - e.present;
  if (Math.abs(diff) <= TOLERANCE) return "reconciled";
  return diff > 0 ? "over" : "unaccounted";
}

const GRADE: Record<Grade, { label: string; chip: string; dot: string; note: string }> = {
  unknowable: {
    label: "Unknowable",
    chip: "bg-bz-olive text-bz-text-on-dark",
    dot: "bg-white/45",
    note: "One half of the clock pair is missing, so hours present cannot be derived at all.",
  },
  informational: {
    label: "No presence record",
    chip: "bg-bz-paper-warm text-bz-text-muted",
    dot: "bg-bz-line",
    note: "There is no attendance record for this day, so there is nothing to compare the booking against.",
  },
  reconciled: {
    label: "Reconciled",
    chip: "bg-bz-fire/[0.18] text-bz-text",
    dot: "bg-bz-leaf-deep",
    note: "Presence and booking agree within half an hour.",
  },
  over: {
    label: "Over-allocated",
    chip: "bg-[#FBE5E2] text-[#9A2E29]",
    dot: "bg-[#C0413A]",
    note: "More hours are booked than the person was recorded present for. This is the serious case.",
  },
  unaccounted: {
    label: "Unaccounted presence",
    chip: "bg-bz-leaf/50 text-bz-text",
    dot: "bg-bz-fire",
    note: "The person was present for longer than they booked. A lesser case, but capacity nobody has attributed.",
  },
};

/** Precedence order — also the order the legend reads in. */
const GRADE_ORDER: Grade[] = ["unknowable", "over", "unaccounted", "reconciled", "informational"];

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function PresenceReconciliationDesignPage() {
  useDocumentTitle("Presence Check");
  const { toast, show, clear } = useToast();

  const [read, setRead] = React.useState<ReadState>("loading");
  const [preview, setPreview] = React.useState<"ready" | "loading" | "empty" | "failed">("ready");
  const [from, setFrom] = React.useState("2026-06-01");
  const [to, setTo] = React.useState("2026-06-15");
  const [personId, setPersonId] = React.useState<string | null>(null);
  const [threshold, setThreshold] = React.useState("0.5");
  const [draftDirty, setDraftDirty] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [applied, setApplied] = React.useState({ personId: null as string | null, threshold: 0.5 });

  React.useEffect(() => {
    setRead("loading");
    const t = window.setTimeout(() => setRead(preview === "loading" ? "loading" : preview), 520);
    return () => window.clearTimeout(t);
  }, [preview]);

  const rows = React.useMemo(
    () => (preview === "empty" ? [] : ENTRIES.filter((e) => !applied.personId || e.personId === applied.personId)),
    [applied.personId, preview],
  );

  // The magnitude threshold suppresses trivial differences — but never a day
  // whose difference cannot be derived, because its problem is not that the
  // gap is small.
  const visible = React.useMemo(() => {
    if (applied.threshold <= 0) return rows;
    return rows.filter((e) => {
      const g = gradeOf(e);
      if (g === "unknowable" || g === "informational" || e.present === null) return true;
      return Math.abs(e.booked - e.present) >= applied.threshold;
    });
  }, [rows, applied.threshold]);

  const totals = React.useMemo(() => {
    const present = visible.reduce((s, e) => s + (e.present ?? 0), 0);
    const booked = visible.reduce((s, e) => s + e.booked, 0);
    // DAY counts, not hour sums
    const brokenClock = visible.filter((e) => gradeOf(e) === "unknowable").length;
    const bookedNoAttendance = visible.filter((e) => e.noAttendance && e.booked > 0).length;
    const presentNothingBooked = visible.filter((e) => e.present !== null && e.present > 0 && e.booked === 0).length;
    return { present, booked, brokenClock, bookedNoAttendance, presentNothingBooked };
  }, [visible]);

  const runQuery = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setDraftDirty(false);
      setApplied({ personId, threshold: Number(threshold) || 0 });
      show("info", "Re-queried against attendance.");
    }, 600);
  };

  return (
    <AppShell breadcrumb={<Crumb page="Presence Check" />} overlay={<Toast toast={toast} onDismiss={clear} offset="bottom-6" />}>
      <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Presence Check</h1>
            <p className="mt-1 max-w-[680px] text-[12.5px] leading-[1.55] text-bz-text-muted">
              Attendance read against booked hours, one row per person per day. The two sources answer different questions —
              attendance records <span className="font-medium text-bz-text">that</span> someone was there, the timesheet records{" "}
              <span className="font-medium text-bz-text">how</span> that time was spent. This page exists to expose where they
              disagree.
            </p>
          </div>
          <StatePreview
            value={preview}
            onChange={setPreview}
            options={[
              { value: "ready", label: "Loaded" },
              { value: "loading", label: "Loading" },
              { value: "empty", label: "Nothing in range" },
              { value: "failed", label: "Failed read" },
            ]}
          />
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-10 pt-4 md:px-8">
        {/* narrowing with an explicit run */}
        <div className={cn(CARD, "flex flex-wrap items-end gap-3 p-3.5")}>
          <div>
            <p className={cn(LABEL, "mb-1.5")}>From</p>
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setDraftDirty(true); }} className={cn(INPUT, NUM, "w-[152px]")} />
          </div>
          <div>
            <p className={cn(LABEL, "mb-1.5")}>To</p>
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setDraftDirty(true); }} className={cn(INPUT, NUM, "w-[152px]")} />
          </div>
          <div className="min-w-[220px] flex-1" style={{ maxWidth: 320 }}>
            <p className={cn(LABEL, "mb-1.5")}>Person</p>
            <Lookup
              value={personId}
              options={PEOPLE_OPTIONS}
              placeholder="Everyone"
              searchPlaceholder="Search the directory…"
              clearLabel="Everyone"
              width={320}
              onChange={(v) => { setPersonId(v); setDraftDirty(true); }}
            />
          </div>
          <div>
            <p className={cn(LABEL, "mb-1.5 flex items-center gap-1.5")}>
              Ignore under
              <ExplainDot
                title="A capability the query always had"
                body="The reading has always supported a magnitude threshold that suppresses trivial differences — it was simply never offered as a control. Days whose difference cannot be derived are never suppressed by it, because their problem is not that the gap is small."
              />
            </p>
            <div className="relative">
              <input
                value={threshold}
                onChange={(e) => { setThreshold(e.target.value); setDraftDirty(true); }}
                inputMode="decimal"
                className={cn(INPUT, NUM, "w-[104px] pr-6")}
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-bz-text-muted">h</span>
            </div>
          </div>
          <button onClick={runQuery} disabled={running} className={cn(PRIMARY_BTN, "h-9")}>
            <Play size={12} /> {running ? "Running…" : "Run"}
          </button>
          {draftDirty && (
            <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text">
              <span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Narrowing changed — run to update the reading.
            </p>
          )}
        </div>

        {/* aggregates — hour sums for the two sources, DAY counts for exceptions */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <Tile label="Hours present">
            <p className={cn("text-[19px] font-semibold leading-none text-bz-text", NUM)}>{fmtH(totals.present)}</p>
            <p className="mt-1.5 text-[10.5px] leading-[1.5] text-bz-text-muted">from attendance — that they were there</p>
          </Tile>
          <Tile label="Hours booked">
            <p className={cn("text-[19px] font-semibold leading-none text-bz-text", NUM)}>{fmtH(totals.booked)}</p>
            <p className="mt-1.5 text-[10.5px] leading-[1.5] text-bz-text-muted">from timesheets — how it was spent</p>
          </Tile>
          <Tile label="Broken clock pairs" tone={totals.brokenClock > 0 ? "attention" : "normal"}>
            <p className={cn("text-[19px] font-semibold leading-none", NUM, totals.brokenClock > 0 ? "text-[#9A2E29]" : "text-bz-text")}>
              {totals.brokenClock}
            </p>
            <p className="mt-1.5 text-[10.5px] leading-[1.5] text-bz-text-muted">days · not hours</p>
          </Tile>
          <Tile label="Booked, never present" tone={totals.bookedNoAttendance > 0 ? "attention" : "normal"}>
            <p className={cn("text-[19px] font-semibold leading-none", NUM, totals.bookedNoAttendance > 0 ? "text-[#9A2E29]" : "text-bz-text")}>
              {totals.bookedNoAttendance}
            </p>
            <p className="mt-1.5 text-[10.5px] leading-[1.5] text-bz-text-muted">days with hours but no attendance record at all</p>
          </Tile>
          <Tile label="Present, nothing booked" tone="quiet">
            <p className={cn("text-[19px] font-semibold leading-none text-bz-text-muted", NUM)}>{totals.presentNothingBooked}</p>
            <p className="mt-1.5 text-[10.5px] leading-[1.5] text-bz-text-soft">days of unaccounted capacity</p>
          </Tile>
        </div>

        {/* the legend is the reading's key, so it stands rather than hides */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 py-2.5">
          <span className={cn(LABEL, "whitespace-nowrap")}>Severity</span>
          {GRADE_ORDER.map((g) => (
            <span key={g} className="inline-flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-bz-pill", GRADE[g].dot)} />
              <span className="text-[11px] text-bz-text-muted">{GRADE[g].label}</span>
              <ExplainDot title={GRADE[g].label} body={GRADE[g].note} />
            </span>
          ))}
          <span className={cn("ml-auto text-[10.5px] text-bz-text-soft", NUM)}>
            resolved in precedence — a broken clock pair outranks every other reading
          </span>
        </div>

        {/* the reading */}
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-bz-line-soft px-4 py-2.5">
            <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-bz-text">
              <Scale size={13} className="text-bz-text-muted" /> Presence against allocation
            </p>
            <p className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
              <span className="font-semibold text-bz-text">{visible.length}</span> {visible.length === 1 ? "day" : "days"}
              {applied.threshold > 0 && <span className="text-bz-text-soft"> · differences under {applied.threshold}h suppressed</span>}
            </p>
          </div>

          {read === "loading" ? (
            <LoadingRows rows={5} label="Reading attendance against timesheets…" />
          ) : read === "failed" ? (
            <FailedBlock what="the reconciliation" detail="ATTENDANCE_VS_TIMESHEET · the attendance service did not answer." onRetry={() => setPreview("ready")} />
          ) : visible.length === 0 ? (
            <StateBlock
              icon={<SearchX size={22} />}
              title="Nothing to reconcile in this range"
              body="Either no attendance and no hours were recorded inside these dates, or every difference fell under the threshold you set. Widen the range or lower the threshold and run again."
              action={
                <button
                  onClick={() => {
                    setPreview("ready");
                    setThreshold("0");
                    setApplied((a) => ({ ...a, threshold: 0 }));
                  }}
                  className={cn(GHOST_BTN, "mt-1")}
                >
                  Show every day, however small the difference
                </button>
              }
            />
          ) : (
            <>
              {/* desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left" style={{ minWidth: 940 }}>
                  <thead>
                    <tr className="border-b border-bz-line bg-bz-paper-warm">
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Person</th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Day</th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Clock in · out</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Present</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Booked</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text">Difference</th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Reading</th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((e, i) => {
                      const g = gradeOf(e);
                      const person = personById(e.personId)!;
                      const diff = e.present === null ? null : e.booked - e.present;
                      return (
                        <tr key={`${e.personId}-${e.iso}-${i}`} className="border-b border-bz-line-soft last:border-0">
                          <td className="px-3 py-3">
                            <span className="block text-[12.5px] font-medium text-bz-text">{person.name}</span>
                            <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{person.id}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={cn("block text-[12px] text-bz-text", NUM)}>{fmtDate(e.iso)}</span>
                            <span className="block text-[10.5px] text-bz-text-soft">{weekdayOf(e.iso)}</span>
                          </td>
                          <td className={cn("px-3 py-3 text-[12px]", NUM)}>
                            {e.clockIn || e.clockOut ? (
                              <span className={e.clockIn && e.clockOut ? "text-bz-text-muted" : "font-medium text-bz-text"}>
                                {e.clockIn ?? "—"} · {e.clockOut ?? "—"}
                              </span>
                            ) : (
                              <Nil />
                            )}
                          </td>
                          <td className={cn("px-3 py-3 text-right text-[12.5px]", NUM)}>
                            {e.present === null ? <Nil /> : <span className="text-bz-text">{fmtH(e.present)}</span>}
                          </td>
                          <td className={cn("px-3 py-3 text-right text-[12.5px]", NUM)}>
                            <span className={e.booked === 0 ? "text-bz-text-soft" : "text-bz-text"}>{fmtH(e.booked)}</span>
                          </td>
                          <td className={cn("px-3 py-3 text-right text-[13px] font-semibold", NUM)}>
                            {diff === null ? (
                              <Nil />
                            ) : (
                              <span className={g === "over" ? "text-[#9A2E29]" : g === "reconciled" ? "text-bz-text-muted" : "text-bz-text"}>
                                {diff > 0 ? "+" : diff < 0 ? "−" : ""}
                                {fmtH(Math.abs(diff))}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", GRADE[g].chip)}>
                              <span className={cn("size-1.5 shrink-0 rounded-bz-pill", GRADE[g].dot)} />
                              {GRADE[g].label}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="flex flex-wrap gap-1">
                              {g === "unknowable" && (
                                <DefectChip
                                  label="clock pair incomplete"
                                  tone="blocked"
                                  title="The presence figure cannot be derived"
                                  body="Only one half of the clock pair was recorded, so hours present is unknown. The difference here is not large — it is unknowable, which is why it outranks every other reading."
                                  exit="Have the missing punch corrected in attendance, then run this again."
                                />
                              )}
                              {e.noAttendance && e.booked > 0 && (
                                <DefectChip
                                  label="no attendance record"
                                  tone="attention"
                                  title="Hours booked on a day with no attendance at all"
                                  body="The timesheet claims work on a day attendance never saw. This is the strongest signal on the surface — it does not judge, but it is the first thing worth asking about."
                                  exit="Confirm whether the person worked off-site, or whether the booking belongs to another day."
                                />
                              )}
                              {e.present !== null && e.present > 0 && e.booked === 0 && (
                                <DefectChip
                                  label="nothing booked"
                                  tone="neutral"
                                  title="Presence with nothing booked against it"
                                  body="The person was recorded present but attributed none of that time to a work stream. It is capacity nobody has accounted for."
                                  exit="Ask them to fill the day in on their timesheet."
                                />
                              )}
                              {e.holiday && (
                                <DefectChip
                                  label="public holiday"
                                  tone="neutral"
                                  title="A public holiday"
                                  body={e.holiday + " A difference on a holiday is expected rather than suspicious."}
                                />
                              )}
                              {e.leave && (
                                <DefectChip
                                  label="approved leave"
                                  tone="neutral"
                                  title="Approved leave"
                                  body={e.leave + " A difference on a leave day is expected rather than suspicious."}
                                />
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* mobile */}
              <div className="flex flex-col gap-2.5 p-3 md:hidden">
                {visible.map((e, i) => {
                  const g = gradeOf(e);
                  const person = personById(e.personId)!;
                  const diff = e.present === null ? null : e.booked - e.present;
                  return (
                    <div key={`${e.personId}-${e.iso}-m${i}`} className="rounded-bz-md border border-bz-line-soft bg-bz-surface p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-bz-text">{person.name}</p>
                          <p className={cn("text-[11px] text-bz-text-muted", NUM)}>
                            {weekdayOf(e.iso)} · {fmtDateShort(e.iso)}
                          </p>
                        </div>
                        <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-bz-sm px-2 py-0.5 text-[10.5px] font-medium", GRADE[g].chip)}>
                          <span className={cn("size-1.5 rounded-bz-pill", GRADE[g].dot)} />
                          {GRADE[g].label}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                          { l: "Present", v: e.present === null ? "—" : fmtH(e.present) },
                          { l: "Booked", v: fmtH(e.booked) },
                          { l: "Difference", v: diff === null ? "—" : `${diff > 0 ? "+" : diff < 0 ? "−" : ""}${fmtH(Math.abs(diff))}` },
                        ].map((m, k) => (
                          <div key={m.l} className={cn("rounded-bz-sm px-2 py-1.5", k === 2 && g === "over" ? "bg-[#FBE5E2]" : "bg-bz-paper-warm")}>
                            <p className={cn("text-[9.5px] uppercase tracking-[0.06em]", k === 2 && g === "over" ? "text-[#9A2E29]" : "text-bz-text-soft")}>{m.l}</p>
                            <p className={cn("mt-0.5 text-[13px] font-semibold", NUM, k === 2 && g === "over" ? "text-[#9A2E29]" : "text-bz-text")}>{m.v}</p>
                          </div>
                        ))}
                      </div>
                      <p className={cn("mt-2.5 text-[11px] text-bz-text-muted", NUM)}>
                        Clock {e.clockIn ?? "—"} · {e.clockOut ?? "—"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {g === "unknowable" && (
                          <DefectChip label="clock pair incomplete" tone="blocked" title="The presence figure cannot be derived" body="Only one half of the clock pair was recorded." exit="Have the missing punch corrected in attendance." />
                        )}
                        {e.noAttendance && e.booked > 0 && (
                          <DefectChip label="no attendance record" tone="attention" title="Hours booked on a day attendance never saw" body="The strongest signal on this surface." exit="Confirm whether the work was off-site." />
                        )}
                        {e.present !== null && e.present > 0 && e.booked === 0 && (
                          <DefectChip label="nothing booked" tone="neutral" title="Presence with nothing booked" body="Capacity nobody has accounted for." exit="Ask them to fill the day in." />
                        )}
                        {e.holiday && <DefectChip label="public holiday" tone="neutral" title="A public holiday" body={e.holiday} />}
                        {e.leave && <DefectChip label="approved leave" tone="neutral" title="Approved leave" body={e.leave} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <p className="flex items-start gap-1.5 text-[10.5px] leading-[1.6] text-bz-text-soft">
          <Info size={11} className="mt-0.5 shrink-0" />
          This reading never shows money — it compares two records of time, nothing more. Flags explain rather than judge, and
          several can apply to the same day at once.
        </p>
      </div>
    </AppShell>
  );
}
