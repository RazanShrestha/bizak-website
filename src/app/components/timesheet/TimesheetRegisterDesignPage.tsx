import * as React from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  Ban,
  Download,
  Eye,
  Lock,
  LockOpen,
  SearchX,
  UserX,
  X,
} from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import {
  CARD,
  Confirm,
  Crumb,
  DocFacts,
  ExplainDot,
  FailedBlock,
  GHOST_BTN,
  GHOST_BTN_SM,
  INPUT,
  LABEL,
  LoadingRows,
  Lookup,
  NUM,
  Nil,
  PEOPLE_OPTIONS,
  ReadState,
  Segmented,
  StateBlock,
  StateChip,
  StatePreview,
  Switch,
  Toast,
  fmtDate,
  fmtH,
  personById,
  resolveState,
  useDocumentTitle,
  useToast,
  VolumeFoot,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// TIMESHEET · REGISTER  (surface D — organisation-wide, read-only)
//
// PRIMARY ACTION: find out who has NOT filed. That job is buried in the current
// product as one option in a status dropdown; here it is a first-class view
// with its own headline, its own columns (how long overdue, hours the calendar
// expected) and its own empty state. The general register is the other tab.
//
// Period closure is the other reason people come here. Its STATE is shown to
// everyone — anyone affected by a closure deserves to know it exists — while
// the control to set or lift it appears only with the grant. Lifting is
// confirmed, because of what it re-opens.
// ════════════════════════════════════════════════════════════════════════════

type RegisterRow = DocFacts & {
  id: string;
  personId: string;
  periodLabel: string;
  rangeFrom: string;
  rangeTo: string;
  total: number | null; // null ⇒ no document exists at all (never filed)
  overtime: number | null;
  expected: number;
  overdueDays?: number;
};

const R = (
  id: string,
  personId: string,
  periodLabel: string,
  rangeFrom: string,
  rangeTo: string,
  total: number | null,
  overtime: number | null,
  expected: number,
  facts: DocFacts,
  overdueDays?: number,
): RegisterRow => ({ id, personId, periodLabel, rangeFrom, rangeTo, total, overtime, expected, overdueDays, ...facts });

const JESTHA: [string, string] = ["2026-05-15", "2026-06-14"];
const BAISHAKH: [string, string] = ["2026-04-14", "2026-05-14"];

const ORG_ROWS: RegisterRow[] = [
  R("TS-0142-2083-02", "EMP-0142", "Jestha 2083", ...JESTHA, 163, 11, 184, { submittedISO: null }, 1),
  R("TS-0157-2083-02", "EMP-0157", "Jestha 2083", ...JESTHA, 178, 4, 184, { submittedISO: "2026-06-15" }),
  R("TS-0163-2083-02", "EMP-0163", "Jestha 2083", ...JESTHA, 184, 0, 184, { submittedISO: "2026-06-15", endorsed: true, consumption: "open" }),
  R("TS-0171-2083-02", "EMP-0171", "Jestha 2083", ...JESTHA, 196, 12, 184, { submittedISO: "2026-06-15", endorsed: true, consumption: "partly_invoiced" }),
  R("—", "EMP-0188", "Jestha 2083", ...JESTHA, null, null, 184, { submittedISO: null }, 1),
  R("TS-0194-2083-02", "EMP-0194", "Jestha 2083", ...JESTHA, 172, 2, 184, { submittedISO: "2026-06-15", endorsed: true, consumption: "invoiced" }),
  R("TS-0203-2083-02", "EMP-0203", "Jestha 2083", ...JESTHA, 160, 0, 184, { submittedISO: "2026-06-15" }),
  R("—", "EMP-0209", "Jestha 2083", ...JESTHA, null, null, 184, { submittedISO: null }, 1),
  R("TS-0215-2083-02", "EMP-0215", "Jestha 2083", ...JESTHA, 152, 0, 184, { submittedISO: "2026-06-15", workflowState: "With finance review" }),
  R("TS-0221-2083-02", "EMP-0221", "Jestha 2083", ...JESTHA, 96, 0, 184, { submittedISO: null }, 1),
  R("TS-0230-2083-02", "EMP-0230", "Jestha 2083", ...JESTHA, 180, 0, 184, { submittedISO: "2026-06-15", endorsed: true, consumption: "not_chargeable" }),
  R("—", "EMP-0238", "Jestha 2083", ...JESTHA, null, null, 184, { submittedISO: null }, 1),
  R("TS-0244-2083-02", "EMP-0244", "Jestha 2083", ...JESTHA, 168, 0, 184, { submittedISO: "2026-06-15", sentBack: true }),
  R("TS-0251-2083-02", "EMP-0251", "Jestha 2083", ...JESTHA, 40, 0, 184, { submittedISO: null }, 1),
  R("TS-0142-2083-01", "EMP-0142", "Baishakh 2083", ...BAISHAKH, 176, 4, 176, { submittedISO: "2026-05-16", sentBack: true }),
  R("TS-0157-2083-01", "EMP-0157", "Baishakh 2083", ...BAISHAKH, 176, 0, 176, { submittedISO: "2026-05-16", endorsed: true, consumption: "invoiced" }),
  R("TS-0163-2083-01", "EMP-0163", "Baishakh 2083", ...BAISHAKH, 168, 0, 176, { submittedISO: "2026-05-16", endorsed: true, consumption: "invoiced" }),
  R("TS-0171-2083-01", "EMP-0171", "Baishakh 2083", ...BAISHAKH, 0, 0, 176, { submittedISO: "2026-05-16", voided: true }),
  R("TS-0188-2083-01", "EMP-0188", "Baishakh 2083", ...BAISHAKH, 180, 6, 176, { submittedISO: "2026-05-16", endorsed: true, consumption: "partly_invoiced" }),
  R("TS-0194-2083-01", "EMP-0194", "Baishakh 2083", ...BAISHAKH, 176, 0, 176, { submittedISO: "2026-05-16", endorsed: true, consumption: "open" }),
];

type Axis = "all" | "notfiled" | "awaiting" | "settled";

function axisOf(r: RegisterRow): Exclude<Axis, "all"> {
  const st = resolveState(r);
  if (!r.submittedISO) return "notfiled";
  if (st.severity === "settled" || r.voided) return "settled";
  return "awaiting";
}

// ── closure ─────────────────────────────────────────────────────────────────
type Closure = { throughISO: string; reason: string } | null;
const SEED_CLOSURE: Closure = {
  throughISO: "2026-05-14",
  reason: "Year-end audit — books frozen until the statutory filing clears.",
};

function ClosureBand({
  closure,
  canAdminister,
  onSet,
  onLift,
}: {
  closure: Closure;
  canAdminister: boolean;
  onSet: () => void;
  onLift: () => void;
}) {
  if (!closure) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-bz-line-soft bg-bz-paper px-4 py-2.5 md:px-8">
        <LockOpen size={13} className="shrink-0 text-bz-text-muted" />
        <p className="text-[12px] text-bz-text">
          <span className="font-semibold">No period is closed.</span>{" "}
          <span className="text-bz-text-muted">Every period is open for filing and editing across the organisation.</span>
        </p>
        {canAdminister && (
          <button onClick={onSet} className={cn(GHOST_BTN_SM, "ml-auto")}>
            <Lock size={11} /> Close periods…
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="border-b border-bz-line bg-bz-olive px-4 py-3 md:px-8">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-white/[0.08] text-bz-fire">
          <Lock size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-bz-text-on-dark">
            Periods are closed through{" "}
            <span className={NUM}>{fmtDate(closure.throughISO)}</span>
          </p>
          <p className="mt-0.5 max-w-[720px] text-[11.5px] leading-[1.55] text-bz-text-on-dark-muted">
            “{closure.reason}” — inside a closed period the system refuses new filings and edits, and every hour already recorded
            there is frozen.
          </p>
        </div>
        {canAdminister ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onSet}
              className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-white/[0.14] bg-white/[0.06] px-2.5 text-[11.5px] font-medium text-bz-text-on-dark hover:bg-white/[0.12]"
            >
              <Lock size={11} /> Change the date
            </button>
            <button
              onClick={onLift}
              className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-fire px-2.5 text-[11.5px] font-semibold text-bz-olive hover:opacity-95"
            >
              <LockOpen size={11} /> Lift the closure
            </button>
          </div>
        ) : (
          <p className="shrink-0 text-[10.5px] text-bz-text-on-dark-soft">Only a closure administrator can change this.</p>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

const PAGE = 10;

export function TimesheetRegisterDesignPage() {
  useDocumentTitle("Timesheet Register");
  const navigate = useNavigate();
  const { toast, show, clear } = useToast();

  const [read, setRead] = React.useState<ReadState>("loading");
  const [preview, setPreview] = React.useState<"ready" | "loading" | "failed">("ready");
  const [axis, setAxis] = React.useState<Axis>("all");
  const [personId, setPersonId] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState<string | null>(null);
  const [visible, setVisible] = React.useState(PAGE);
  const [requerying, setRequerying] = React.useState(false);

  // the person lookup's own data arrives after the register does, so a chip
  // shows the raw identifier first and upgrades itself to the name
  const [directoryReady, setDirectoryReady] = React.useState(false);

  const [closure, setClosure] = React.useState<Closure>(SEED_CLOSURE);
  const [canAdminister, setCanAdminister] = React.useState(true);
  const [closureOpen, setClosureOpen] = React.useState(false);
  const [liftOpen, setLiftOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState(SEED_CLOSURE?.throughISO ?? "");
  const [draftReason, setDraftReason] = React.useState(SEED_CLOSURE?.reason ?? "");
  const [closureRefusal, setClosureRefusal] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRead("loading");
    const t = window.setTimeout(() => setRead(preview === "loading" ? "loading" : preview), 520);
    const d = window.setTimeout(() => setDirectoryReady(true), 1600);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(d);
    };
  }, [preview]);

  // narrowing takes effect immediately — debounced so each change is not a
  // round trip of its own
  React.useEffect(() => {
    if (read !== "ready") return;
    setRequerying(true);
    const t = window.setTimeout(() => setRequerying(false), 260);
    return () => window.clearTimeout(t);
  }, [axis, personId, period, read]);

  const periods = React.useMemo(() => Array.from(new Set(ORG_ROWS.map((r) => r.periodLabel))), []);

  const counts = React.useMemo(() => {
    const scope = ORG_ROWS.filter((r) => (!personId || r.personId === personId) && (!period || r.periodLabel === period));
    return {
      all: scope.length,
      notfiled: scope.filter((r) => axisOf(r) === "notfiled").length,
      awaiting: scope.filter((r) => axisOf(r) === "awaiting").length,
      settled: scope.filter((r) => axisOf(r) === "settled").length,
    };
  }, [personId, period]);

  const rows = React.useMemo(() => {
    return ORG_ROWS.filter(
      (r) =>
        (!personId || r.personId === personId) &&
        (!period || r.periodLabel === period) &&
        (axis === "all" || axisOf(r) === axis),
    );
  }, [axis, personId, period]);

  const shown = rows.slice(0, visible);
  const notFiledPeople = React.useMemo(
    () => new Set(ORG_ROWS.filter((r) => r.periodLabel === "Jestha 2083" && axisOf(r) === "notfiled").map((r) => r.personId)).size,
    [],
  );

  const chips: { key: string; kind: string; value: string; clear: () => void }[] = [];
  if (personId)
    chips.push({
      key: "p",
      kind: "Person",
      value: directoryReady ? personById(personId)?.name ?? personId : personId,
      clear: () => setPersonId(null),
    });
  if (period) chips.push({ key: "per", kind: "Period", value: period, clear: () => setPeriod(null) });
  if (axis !== "all")
    chips.push({
      key: "ax",
      kind: "State",
      value: axis === "notfiled" ? "Not submitted" : axis === "awaiting" ? "Awaiting endorsement" : "Settled",
      clear: () => setAxis("all"),
    });

  const applyClosure = () => {
    if (!draftDate) {
      setClosureRefusal("A closing date is required — there is nothing to close without one.");
      return;
    }
    setClosureRefusal(null);
    setClosureOpen(false);
    // the state is re-read from the server rather than assumed
    show("info", "Applying the closure…");
    window.setTimeout(() => {
      setClosure({ throughISO: draftDate, reason: draftReason.trim() || "No reason was recorded." });
      show("success", `Periods are now closed through ${fmtDate(draftDate)}. The register has re-read the closure from the server.`);
    }, 700);
  };

  const isNotFiledView = axis === "notfiled";

  return (
    <AppShell
      breadcrumb={<Crumb page="Register" />}
      overlay={<Toast toast={toast} onDismiss={clear} offset="bottom-6" />}
    >
      {/* ── header ─────────────────────────────────────────────────────── */}
      <header className="bg-bz-paper px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Timesheet Register</h1>
            <p className="mt-1 max-w-[640px] text-[12.5px] leading-[1.55] text-bz-text-muted">
              Every person’s timesheets across the organisation. This surface only reads — opening a record shows the hours exactly
              as they were filed, read-only.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-1.5">
              <span className={cn(LABEL, "whitespace-nowrap")}>Closure grant</span>
              <Switch value={canAdminister} onChange={setCanAdminister} ariaLabel="Preview with or without the closure grant" />
              <ExplainDot
                title="One deliberate exception"
                body="A person without a grant does not see a disabled control — the capability is simply not there. Period closure is the exception: its STATE is shown to everyone, because everyone affected by a closure deserves to know it exists. Only the control is gated."
                exit="Flip this to see the band exactly as a non-administrator does."
              />
            </div>
            <button
              onClick={() => show("info", `Extracting ${rows.length} records — the file honours the narrowing you have applied here.`)}
              className={GHOST_BTN}
            >
              <Download size={14} /> Extract what I’m reading
            </button>
            <StatePreview
              value={preview}
              onChange={setPreview}
              options={[
                { value: "ready", label: "Loaded" },
                { value: "loading", label: "Loading" },
                { value: "failed", label: "Failed read" },
              ]}
            />
          </div>
        </div>
      </header>

      <ClosureBand
        closure={closure}
        canAdminister={canAdminister}
        onSet={() => {
          setDraftDate(closure?.throughISO ?? "");
          setDraftReason(closure?.reason ?? "");
          setClosureRefusal(null);
          setClosureOpen(true);
        }}
        onLift={() => setLiftOpen(true)}
      />

      <div className="flex flex-col gap-3 px-4 pb-10 pt-4 md:px-8">
        {/* ── the two jobs this surface does ───────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Segmented
            value={axis}
            onChange={(v) => {
              setAxis(v);
              setVisible(PAGE);
            }}
            options={[
              { value: "all", label: "All records", count: counts.all },
              { value: "notfiled", label: "Not filed", count: counts.notfiled },
              { value: "awaiting", label: "Awaiting endorsement", count: counts.awaiting },
              { value: "settled", label: "Settled", count: counts.settled },
            ]}
          />
          <div className="min-w-[220px] flex-1" style={{ maxWidth: 300 }}>
            <Lookup
              value={personId}
              options={PEOPLE_OPTIONS}
              placeholder="Any person"
              searchPlaceholder="Search the directory…"
              clearLabel="Everyone"
              width={320}
              onChange={(v) => {
                setPersonId(v);
                setVisible(PAGE);
              }}
            />
          </div>
          <div className="min-w-[168px]" style={{ maxWidth: 220 }}>
            <Lookup
              value={period}
              options={periods.map((p) => ({ id: p, label: p }))}
              placeholder="Any period"
              searchPlaceholder="Search periods…"
              clearLabel="Every period"
              onChange={(v) => {
                setPeriod(v);
                setVisible(PAGE);
              }}
            />
          </div>
        </div>

        {/* the "who has not filed" headline — its own job, not a filter option */}
        {isNotFiledView && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-bz-lg border border-[#F0CFCB] bg-[#FDF3F2] px-4 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-[#FBE5E2] text-[#9A2E29]">
              <UserX size={15} />
            </span>
            <p className="min-w-0 text-[12.5px] text-bz-text">
              <span className={cn("text-[16px] font-semibold text-[#9A2E29]", NUM)}>{notFiledPeople}</span>{" "}
              <span className="font-semibold">people have not filed Jestha 2083</span> — some have no document at all, others have
              started one and never submitted it. Both count as not filed, because submission is what makes a record a claim.
            </p>
          </div>
        )}

        {/* ── active narrowing ─────────────────────────────────────────── */}
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-bz-line-soft px-4 py-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {chips.length > 0 ? (
                <>
                  {chips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1.5 rounded-bz-sm bg-bz-fire/[0.16] py-1 pl-2 pr-1 text-[11.5px]">
                      <span className="text-bz-text-muted">{c.kind}:</span>
                      <span className={cn("font-medium text-bz-text", c.key === "p" && !directoryReady && NUM)}>{c.value}</span>
                      <button
                        onClick={c.clear}
                        aria-label={`Remove the ${c.kind} narrowing`}
                        className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/40 hover:text-bz-text"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      setPersonId(null);
                      setPeriod(null);
                      setAxis("all");
                    }}
                    className="ml-0.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"
                  >
                    Clear everything
                  </button>
                </>
              ) : (
                <span className="text-[11.5px] text-bz-text-soft">Reading the whole organisation — nothing is being excluded.</span>
              )}
            </div>
            <p className={cn("shrink-0 text-[11.5px] text-bz-text-muted", NUM)}>
              {requerying ? (
                <span className="text-bz-text-soft">re-querying…</span>
              ) : (
                <>
                  <span className="font-semibold text-bz-text">{rows.length}</span> {rows.length === 1 ? "record" : "records"}
                </>
              )}
            </p>
          </div>

          {read === "loading" ? (
            <LoadingRows label="Loading the register…" />
          ) : read === "failed" ? (
            <FailedBlock what="the register" detail="TIMESHEET_REGISTER · the gateway closed the connection." onRetry={() => setPreview("ready")} />
          ) : rows.length === 0 ? (
            <StateBlock
              icon={<SearchX size={22} />}
              title="Nothing is left after this narrowing"
              body={
                <>
                  Records exist, but none of them survive the narrowing you have applied. Remove one of the chips above to widen the
                  reading. Nothing is created from this surface.
                </>
              }
              action={
                <button
                  onClick={() => {
                    setPersonId(null);
                    setPeriod(null);
                    setAxis("all");
                  }}
                  className={cn(GHOST_BTN, "mt-1")}
                >
                  Clear everything
                </button>
              }
            />
          ) : (
            <>
              {/* desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left" style={{ minWidth: 960 }}>
                  <thead>
                    <tr className="border-b border-bz-line bg-bz-paper-warm">
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Person</th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Document</th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Period</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">
                        {isNotFiledView ? "Expected" : "Total h"}
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">
                        {isNotFiledView ? "Filed so far" : "Overtime"}
                      </th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">
                        {isNotFiledView ? "Overdue" : "Submitted"}
                      </th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">State</th>
                      <th className="w-10 px-2 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((r, i) => {
                      const st = resolveState(r);
                      const person = personById(r.personId)!;
                      const noDoc = r.total === null;
                      return (
                        <tr
                          key={`${r.id}-${r.personId}-${i}`}
                          onClick={() =>
                            noDoc
                              ? show("info", `${person.name} has no ${r.periodLabel} document at all — there is nothing to open.`)
                              : navigate(`/design/timesheet/entry?doc=${r.id}&mode=readonly&person=${r.personId}`)
                          }
                          className={cn("border-b border-bz-line-soft hover:bg-bz-paper-warm/50", noDoc ? "cursor-default" : "cursor-pointer")}
                        >
                          <td className="px-3 py-3">
                            <span className="block text-[13px] font-medium text-bz-text">{person.name}</span>
                            <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
                              {person.id} · {person.team}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {noDoc ? (
                              <span className="inline-flex items-center gap-1 text-[11.5px] italic text-bz-text-soft">
                                <Ban size={10} /> never created
                              </span>
                            ) : (
                              <span className={cn("text-[12.5px] font-semibold tracking-tight text-bz-text", NUM)}>{r.id}</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="block text-[12.5px] text-bz-text">{r.periodLabel}</span>
                            <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
                              {fmtDate(r.rangeFrom)} – {fmtDate(r.rangeTo)}
                            </span>
                          </td>
                          <td className={cn("px-3 py-3 text-right text-[12.5px] font-semibold text-bz-text", NUM)}>
                            {isNotFiledView ? fmtH(r.expected) : r.total === null ? <Nil /> : fmtH(r.total)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {isNotFiledView ? (
                              r.total === null || r.total === 0 ? (
                                <Nil />
                              ) : (
                                <span className={cn("text-[12px] text-bz-text-muted", NUM)}>{fmtH(r.total)}</span>
                              )
                            ) : r.overtime === null || r.overtime === 0 ? (
                              <Nil />
                            ) : (
                              <span className={cn("inline-flex items-center rounded-bz-sm bg-bz-fire/[0.20] px-1.5 py-0.5 text-[11.5px] font-semibold text-bz-text", NUM)}>
                                {fmtH(r.overtime)}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {isNotFiledView ? (
                              <span className={cn("inline-flex items-center gap-1 rounded-bz-sm bg-[#FBE5E2] px-1.5 py-0.5 text-[11px] font-semibold text-[#9A2E29]", NUM)}>
                                <AlertTriangle size={10} /> {r.overdueDays ?? 0}d past the period end
                              </span>
                            ) : r.submittedISO ? (
                              <span className={cn("text-[12px] text-bz-text", NUM)}>{fmtDate(r.submittedISO)}</span>
                            ) : (
                              <span className="text-[12px] text-bz-text-soft">Never</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <StateChip label={st.label} severity={st.severity} />
                          </td>
                          <td className="px-2 py-3 text-right">
                            {!noDoc && <Eye size={13} className="ml-auto text-bz-text-soft" />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* mobile */}
              <div className="flex flex-col gap-2.5 p-3 md:hidden">
                {shown.map((r, i) => {
                  const st = resolveState(r);
                  const person = personById(r.personId)!;
                  const noDoc = r.total === null;
                  return (
                    <button
                      key={`${r.id}-${r.personId}-m${i}`}
                      onClick={() =>
                        noDoc
                          ? show("info", `${person.name} has no ${r.periodLabel} document at all.`)
                          : navigate(`/design/timesheet/entry?doc=${r.id}&mode=readonly&person=${r.personId}`)
                      }
                      className="rounded-bz-md border border-bz-line-soft bg-bz-surface p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-medium text-bz-text">{person.name}</p>
                          <p className={cn("truncate text-[10.5px] text-bz-text-soft", NUM)}>{person.id}</p>
                        </div>
                        <StateChip label={st.label} severity={st.severity} size="sm" />
                      </div>
                      <p className="mt-2.5 text-[12.5px] text-bz-text">{r.periodLabel}</p>
                      <div className="mt-2.5 grid grid-cols-3 gap-2">
                        {[
                          { l: isNotFiledView ? "Expected" : "Total", v: isNotFiledView ? fmtH(r.expected) : r.total === null ? "—" : fmtH(r.total) },
                          { l: isNotFiledView ? "Filed" : "Overtime", v: isNotFiledView ? (r.total ? fmtH(r.total) : "—") : r.overtime ? fmtH(r.overtime) : "—" },
                          { l: "Submitted", v: r.submittedISO ? fmtDate(r.submittedISO).replace(/, \d+$/, "") : "Never" },
                        ].map((m) => (
                          <div key={m.l} className="rounded-bz-sm bg-bz-paper-warm px-2 py-1.5">
                            <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">{m.l}</p>
                            <p className={cn("mt-0.5 text-[12px] font-semibold text-bz-text", NUM)}>{m.v}</p>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <VolumeFoot
                shown={shown.length}
                total={rows.length}
                noun="records"
                note="The fetch is capped — narrow by person, period or state to reach what is beyond it."
                onMore={() => setVisible((v) => v + PAGE)}
              />
            </>
          )}
        </section>
      </div>

      {/* ── closure composer ───────────────────────────────────────────── */}
      <Confirm
        open={closureOpen}
        tone="normal"
        title="Close periods through a date"
        body="Inside a closed period the system refuses new filings and edits, and every hour already recorded there becomes frozen. This is what makes cells immutable elsewhere in the module."
        confirmLabel="Apply the closure"
        onCancel={() => {
          setClosureOpen(false);
          setClosureRefusal(null);
        }}
        onConfirm={applyClosure}
        extra={
          <div className="flex flex-col gap-3">
            <div>
              <p className={cn(LABEL, "mb-1.5")}>Closed through · required</p>
              <input
                type="date"
                value={draftDate}
                onChange={(e) => {
                  setDraftDate(e.target.value);
                  setClosureRefusal(null);
                }}
                className={cn(INPUT, NUM, closureRefusal && "border-[#C0413A]")}
              />
            </div>
            <div>
              <p className={cn(LABEL, "mb-1.5")}>Stated reason</p>
              <textarea
                value={draftReason}
                onChange={(e) => setDraftReason(e.target.value)}
                rows={2}
                placeholder="Everyone on the register will read this."
                className={cn(INPUT, "h-auto py-2 leading-[1.5]")}
              />
            </div>
            {closureRefusal && (
              <p className="flex items-start gap-1.5 rounded-bz-sm bg-[#FBE5E2] px-2.5 py-1.5 text-[11.5px] text-[#9A2E29]">
                <Ban size={12} className="mt-0.5 shrink-0" />
                {closureRefusal}
              </p>
            )}
          </div>
        }
      />

      <Confirm
        open={liftOpen}
        title="Lift the closure?"
        body={
          <>
            Every period back through <span className={cn("font-semibold text-bz-text", NUM)}>{closure ? fmtDate(closure.throughISO) : ""}</span>{" "}
            becomes editable again for the whole organisation, and hours frozen only by the closure unfreeze. Hours frozen because
            they were invoiced or taken by payroll stay frozen.
          </>
        }
        confirmLabel="Lift it"
        onCancel={() => setLiftOpen(false)}
        onConfirm={() => {
          setLiftOpen(false);
          show("info", "Lifting the closure…");
          window.setTimeout(() => {
            setClosure(null);
            show("success", "The closure is lifted. The register has re-read the state from the server.");
          }, 700);
        }}
      />
    </AppShell>
  );
}
