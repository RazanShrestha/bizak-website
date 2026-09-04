import * as React from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Inbox,
  MoreHorizontal,
  Pencil,
  Search,
  SearchX,
  Trash2,
  X,
  AlertTriangle,
  Clock3,
} from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import {
  BulkProgress,
  CARD,
  Checkbox,
  Confirm,
  Crumb,
  DocFacts,
  ExplainDot,
  FailedBlock,
  GHOST_BTN,
  GHOST_BTN_SM,
  H,
  LABEL,
  LoadingRows,
  ME,
  MeterBar,
  NUM,
  Nil,
  PERIOD_EXPECTED,
  PERIOD_LABEL,
  PERIOD_RANGE,
  PRIMARY_BTN,
  ReadState,
  SHADOW,
  StateBlock,
  StatePreview,
  StateChip,
  Tile,
  Toast,
  VolumeFoot,
  fmtDate,
  fmtH,
  resolveState,
  useBulkRunner,
  useDocumentTitle,
  useToast,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// TIMESHEET · MY RECORD  (surface A — the filer's own documents)
//
// PRIMARY ACTION: get into the period I am in now. Everything else on this
// screen is history. So the current period is not a row in the table — it is a
// standing band at the top carrying the one filled button on the page, its
// fill-against-expectation, and what is still owed. The table below is the
// archive, and its own job is bulk hygiene (mark → destroy) plus a way back
// into any past document.
//
// Two gaps in the brief are answered here rather than preserved:
//   • a FAILED read is its own state, never an empty-looking success;
//   • the capped fetch gets a search and a fetch-more, so records beyond the
//     cap are reachable instead of merely counted.
// ════════════════════════════════════════════════════════════════════════════

type MyDoc = DocFacts & {
  id: string;
  periodLabel: string | null; // null ⇒ fall back to the start/end pair
  rangeFrom: string;
  rangeTo: string;
  total: number;
  chargeable: number;
  overtime: number;
  perTask?: string;
  sentBackReason?: string;
  /** Why destruction is refused, when it is. Stated on attempt, never pre-disabled. */
  destroyRefusal?: string;
};

const CURRENT_ID = "TS-0142-2083-02";

const MY_DOCS: MyDoc[] = [
  {
    id: CURRENT_ID, periodLabel: "Jestha 2083", rangeFrom: "2026-05-15", rangeTo: "2026-06-14",
    total: 163, chargeable: 159, overtime: 11, submittedISO: null,
  },
  {
    id: "TS-0142-2083-01", periodLabel: "Baishakh 2083", rangeFrom: "2026-04-14", rangeTo: "2026-05-14",
    total: 176, chargeable: 121, overtime: 4, submittedISO: "2026-05-16", sentBack: true,
    sentBackReason:
      "Three days in the second week are booked to Phase 1 · Finance, but the Apex cutover moved to Phase 2 · Inventory on 24 Baishakh. Please re-attribute 24 hours and resubmit.",
  },
  {
    id: "TS-0142-2082-12", periodLabel: "Chaitra 2082", rangeFrom: "2026-03-15", rangeTo: "2026-04-13",
    total: 168, chargeable: 132, overtime: 0, submittedISO: "2026-04-14",
  },
  {
    id: "TS-0142-2082-11", periodLabel: "Falgun 2082", rangeFrom: "2026-02-13", rangeTo: "2026-03-14",
    total: 160, chargeable: 118.5, overtime: 2, submittedISO: "2026-03-15",
    workflowState: "With finance review",
  },
  {
    id: "TS-0142-2082-10", periodLabel: "Magh 2082", rangeFrom: "2026-01-15", rangeTo: "2026-02-12",
    total: 172, chargeable: 140, overtime: 8, submittedISO: "2026-02-13", endorsed: true, consumption: "partly_invoiced",
    destroyRefusal: "Some hours have already been invoiced — reverse the downstream invoice first.",
  },
  {
    id: "TS-0142-2082-09", periodLabel: "Poush 2082", rangeFrom: "2025-12-16", rangeTo: "2026-01-14",
    total: 152, chargeable: 128, overtime: 0, submittedISO: "2026-01-15", endorsed: true, consumption: "invoiced",
    destroyRefusal: "Some hours have already been invoiced — reverse the downstream invoice first.",
  },
  {
    id: "TS-0142-2082-08", periodLabel: "Mangsir 2082", rangeFrom: "2025-11-17", rangeTo: "2025-12-15",
    total: 168, chargeable: 96, overtime: 0, submittedISO: "2025-12-16", endorsed: true, consumption: "open",
  },
  {
    id: "TS-0142-2082-07", periodLabel: "Kartik 2082", rangeFrom: "2025-10-18", rangeTo: "2025-11-16",
    total: 0, chargeable: 0, overtime: 0, submittedISO: "2025-11-17", voided: true,
    destroyRefusal: "The document is already voided — a voided document cannot be destroyed again.",
  },
  {
    id: "TS-0142-2082-06", periodLabel: "Ashwin 2082", rangeFrom: "2025-09-17", rangeTo: "2025-10-17",
    total: 144, chargeable: 0, overtime: 0, submittedISO: "2025-10-18", endorsed: true, consumption: "not_chargeable",
  },
  {
    id: "TS-0142-TSK-4517", periodLabel: null, rangeFrom: "2026-04-01", rangeTo: "2026-04-22",
    total: 46.5, chargeable: 0, overtime: 0, submittedISO: "2026-04-23", endorsed: true, consumption: "not_chargeable",
    perTask: "TSK-4517 · Accessibility audit",
  },
  {
    id: "TS-0142-2082-05", periodLabel: "Bhadra 2082", rangeFrom: "2025-08-17", rangeTo: "2025-09-16",
    total: 176, chargeable: 150, overtime: 6, submittedISO: "2025-09-17", endorsed: true, consumption: "invoiced",
    destroyRefusal: "Some hours have already been invoiced — reverse the downstream invoice first.",
  },
  {
    id: "TS-0142-2082-04", periodLabel: "Shrawan 2082", rangeFrom: "2025-07-17", rangeTo: "2025-08-16",
    total: 160, chargeable: 128, overtime: 0, submittedISO: "2025-08-17", endorsed: true, consumption: "invoiced",
    destroyRefusal: "Some hours have already been invoiced — reverse the downstream invoice first.",
  },
];

const CURRENT = MY_DOCS[0];
const SENT_BACK = MY_DOCS.find((d) => d.sentBack)!;
const AWAITING = MY_DOCS.filter((d) => d.submittedISO && !d.endorsed && !d.voided && !d.sentBack);

/** The period closed yesterday, so the full expectation is now due. */
const FILL_PCT = Math.round((CURRENT.total / PERIOD_EXPECTED) * 100);

const periodOf = (d: MyDoc) => d.periodLabel ?? `${fmtDate(d.rangeFrom)} – ${fmtDate(d.rangeTo)}`;

// ════════════════════════════════════════════════════════════════════════════
// CURRENT PERIOD — the primary action, given the whole top of the page
// ════════════════════════════════════════════════════════════════════════════

function CurrentPeriodBand({ onOpen }: { onOpen: () => void }) {
  const owed = Math.max(0, PERIOD_EXPECTED - CURRENT.total);
  const state = resolveState(CURRENT);
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="flex flex-col gap-5 p-4 md:flex-row md:items-center md:gap-8 md:p-5">
        <div className="min-w-0 md:w-[240px] md:shrink-0">
          <p className={LABEL}>Current period</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h2 className="text-[21px] font-semibold tracking-tight text-bz-text">{PERIOD_LABEL}</h2>
            <StateChip label={state.label} severity={state.severity} size="sm" />
          </div>
          <p className={cn("mt-1 text-[11.5px] text-bz-text-muted", NUM)}>
            {PERIOD_RANGE} · {CURRENT.id}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="flex items-baseline gap-1.5">
              <span className={cn("text-[22px] font-semibold leading-none text-bz-text", NUM)}>{fmtH(CURRENT.total)}</span>
              <span className={cn("text-[12px] text-bz-text-muted", NUM)}>of {fmtH(PERIOD_EXPECTED)} h expected</span>
            </p>
            <p className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
              <span className="font-semibold text-[#9A2E29]">{fmtH(owed)}</span> h short · the period closed yesterday
            </p>
          </div>
          <div className="mt-2.5">
            <MeterBar pct={FILL_PCT} fill="var(--bz-olive)" height="h-2" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] text-bz-text-muted">
              <span className="h-2 w-2 rounded-bz-pill bg-bz-olive" /> Filed{" "}
              <span className={cn("font-semibold text-bz-text", NUM)}>{fmtH(CURRENT.total)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] text-bz-text-muted">
              Chargeable <span className={cn("font-semibold text-bz-text", NUM)}>{fmtH(CURRENT.chargeable)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] text-bz-text-muted">
              Overtime <span className={cn("font-semibold text-bz-text", NUM)}>{fmtH(CURRENT.overtime)}</span>
              <ExplainDot
                title="Overtime is a readout, never a claim"
                body="Overtime is derived server-side from your working calendar — hours past the day's expectation, and every hour booked on a day the calendar expects nothing from you."
              />
            </span>
          </div>
        </div>

        <div className="md:w-[212px] md:shrink-0">
          <button onClick={onOpen} className={cn(PRIMARY_BTN, "h-10 w-full")}>
            <Clock3 size={14} /> Open current period <ArrowRight size={13} />
          </button>
          <p className="mt-2 text-center text-[10.5px] leading-[1.5] text-bz-text-soft md:text-left">
            Resolved and created server-side — if the period is closed or unanchored, it says so on arrival.
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROW MENU
// ════════════════════════════════════════════════════════════════════════════

function RowMenu({ onOpen, onDestroy }: { onOpen: () => void; onDestroy: () => void }) {
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
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Row actions"
        className={cn(
          "flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
          open && "bg-bz-paper-warm text-bz-text",
        )}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn("absolute right-0 top-[34px] z-30 w-48 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1", SHADOW)}
        >
          <button
            onClick={() => {
              setOpen(false);
              onOpen();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm"
          >
            <Pencil size={13} className="text-bz-text-muted" />
            <span className="text-[12px] font-medium text-bz-text">Open the document</span>
          </button>
          <div className="my-1 h-px bg-bz-line-soft" />
          <button
            onClick={() => {
              setOpen(false);
              onDestroy();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FBE5E2]"
          >
            <Trash2 size={13} className="text-[#9A2E29]" />
            <span className="text-[12px] font-medium text-[#9A2E29]">Destroy…</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TABLE + CARDS
// ════════════════════════════════════════════════════════════════════════════

const TH = "px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted whitespace-nowrap";
const TD = "px-3 py-3";

function DocRowSummary({ d }: { d: MyDoc }) {
  const state = resolveState(d);
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-[12.5px] font-semibold tracking-tight text-bz-text", NUM)}>{d.id}</span>
        <StateChip label={state.label} severity={state.severity} size="sm" />
      </div>
      <p className="mt-1.5 text-[13px] font-medium text-bz-text">{periodOf(d)}</p>
      <p className={cn("text-[10.5px] text-bz-text-soft", NUM)}>
        {d.perTask ? d.perTask : `${fmtDate(d.rangeFrom)} – ${fmtDate(d.rangeTo)}`}
      </p>
    </>
  );
}

function RecordTable({
  rows,
  marked,
  onMark,
  onMarkAll,
  onOpen,
  onDestroy,
}: {
  rows: MyDoc[];
  marked: Set<string>;
  onMark: (id: string, v: boolean) => void;
  onMarkAll: (v: boolean) => void;
  onOpen: (id: string) => void;
  onDestroy: (d: MyDoc) => void;
}) {
  const allMarked = rows.length > 0 && rows.every((r) => marked.has(r.id));
  const someMarked = rows.some((r) => marked.has(r.id));
  return (
    <>
      {/* desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left" style={{ minWidth: 940 }}>
          <thead>
            <tr className="border-b border-bz-line bg-bz-paper-warm">
              <th className="w-10 px-3 py-2.5">
                <Checkbox checked={allMarked} indeterminate={!allMarked && someMarked} onChange={onMarkAll} ariaLabel="Mark every shown timesheet" />
              </th>
              <th className={TH}>Document</th>
              <th className={TH}>Period</th>
              <th className={cn(TH, "text-right")}>Total h</th>
              <th className={cn(TH, "text-right")}>Chargeable</th>
              <th className={cn(TH, "text-right")}>Overtime</th>
              <th className={TH}>Submitted</th>
              <th className={TH}>State</th>
              <th className="w-10 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const state = resolveState(d);
              return (
                <tr
                  key={d.id}
                  onClick={() => onOpen(d.id)}
                  className={cn(
                    "cursor-pointer border-b border-bz-line-soft hover:bg-bz-paper-warm/50",
                    marked.has(d.id) && "bg-bz-fire/[0.07] hover:bg-bz-fire/[0.10]",
                  )}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={marked.has(d.id)} onChange={(v) => onMark(d.id, v)} ariaLabel={`Mark ${d.id}`} />
                  </td>
                  <td className={TD}>
                    <span className={cn("text-[12.5px] font-semibold tracking-tight text-bz-text", NUM)}>{d.id}</span>
                    {d.perTask && <span className="block text-[10.5px] text-bz-text-soft">Per-task document</span>}
                  </td>
                  <td className={TD}>
                    <span className="block text-[13px] font-medium text-bz-text">{periodOf(d)}</span>
                    <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
                      {d.perTask ?? `${fmtDate(d.rangeFrom)} – ${fmtDate(d.rangeTo)}`}
                    </span>
                  </td>
                  <td className={cn(TD, "text-right text-[12.5px] font-semibold")}>
                    <H v={d.total} />
                  </td>
                  <td className={cn(TD, "text-right text-[12px]")}>{d.chargeable === 0 ? <Nil /> : <H v={d.chargeable} className="text-bz-text-muted" />}</td>
                  <td className={cn(TD, "text-right text-[12px]")}>
                    {d.overtime === 0 ? (
                      <Nil />
                    ) : (
                      <span className={cn("inline-flex items-center rounded-bz-sm bg-bz-fire/[0.20] px-1.5 py-0.5 text-[11.5px] font-semibold text-bz-text", NUM)}>
                        {fmtH(d.overtime)}
                      </span>
                    )}
                  </td>
                  <td className={cn(TD, "text-[12px]", d.submittedISO ? "text-bz-text" : "text-bz-text-soft")}>
                    {d.submittedISO ? <span className={NUM}>{fmtDate(d.submittedISO)}</span> : "Never"}
                  </td>
                  <td className={TD}>
                    <StateChip label={state.label} severity={state.severity} />
                  </td>
                  <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end">
                      <RowMenu onOpen={() => onOpen(d.id)} onDestroy={() => onDestroy(d)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile — one card per document, looser than the desktop row */}
      <div className="flex flex-col gap-2.5 p-3 md:hidden">
        {rows.map((d) => (
          <div
            key={d.id}
            className={cn(
              "rounded-bz-md border bg-bz-surface",
              marked.has(d.id) ? "border-bz-fire bg-bz-fire/[0.06]" : "border-bz-line-soft",
            )}
          >
            <div className="flex items-start gap-3 p-4">
              <div className="pt-0.5">
                <Checkbox checked={marked.has(d.id)} onChange={(v) => onMark(d.id, v)} ariaLabel={`Mark ${d.id}`} />
              </div>
              <button onClick={() => onOpen(d.id)} className="min-w-0 flex-1 text-left">
                <DocRowSummary d={d} />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { l: "Total", v: fmtH(d.total) },
                    { l: "Chargeable", v: d.chargeable === 0 ? "—" : fmtH(d.chargeable) },
                    { l: "Overtime", v: d.overtime === 0 ? "—" : fmtH(d.overtime) },
                  ].map((m) => (
                    <div key={m.l} className="rounded-bz-sm bg-bz-paper-warm px-2 py-1.5">
                      <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">{m.l}</p>
                      <p className={cn("mt-0.5 text-[12.5px] font-semibold text-bz-text", NUM)}>{m.v}</p>
                    </div>
                  ))}
                </div>
                <p className={cn("mt-2.5 text-[11px] text-bz-text-muted", NUM)}>
                  Submitted {d.submittedISO ? fmtDate(d.submittedISO) : "— never"}
                </p>
              </button>
              <RowMenu onOpen={() => onOpen(d.id)} onDestroy={() => onDestroy(d)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SELECTION FOOTER (docked in the shell's overlay slot)
// ════════════════════════════════════════════════════════════════════════════

function SelectionFooter({ n, onClear, onDestroy }: { n: number; onClear: () => void; onDestroy: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <p className="flex min-w-0 items-center gap-2 text-[12px] text-bz-text">
        <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />
        <span className="truncate">
          <span className={cn("font-semibold", NUM)}>{n}</span> {n === 1 ? "timesheet" : "timesheets"} marked
        </span>
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={onClear} className={GHOST_BTN_SM}>
          <X size={11} /> Clear
        </button>
        <button
          onClick={onDestroy}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3.5 text-[12px] font-semibold text-white hover:opacity-95"
        >
          <Trash2 size={12} /> Destroy {n}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

const FETCH_CAP = 8;

export function TimesheetRecordDesignPage() {
  useDocumentTitle("My Timesheets");
  const navigate = useNavigate();
  const { toast, show, clear } = useToast();

  const [read, setRead] = React.useState<ReadState>("loading");
  const [preview, setPreview] = React.useState<"ready" | "loading" | "empty" | "failed">("ready");
  const [search, setSearch] = React.useState("");
  const [visible, setVisible] = React.useState(FETCH_CAP);
  const [fetchingMore, setFetchingMore] = React.useState(false);
  const [docs, setDocs] = React.useState<MyDoc[]>(MY_DOCS);
  const [marked, setMarked] = React.useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = React.useState(false);
  const [confirmOne, setConfirmOne] = React.useState<MyDoc | null>(null);
  const [exportOpen, setExportOpen] = React.useState(false);
  const { run, start, clear: clearRun } = useBulkRunner();

  // initial read
  React.useEffect(() => {
    const t = window.setTimeout(() => setRead(preview === "loading" ? "loading" : preview), 520);
    return () => window.clearTimeout(t);
  }, [preview]);

  React.useEffect(() => {
    if (preview === "loading") setRead("loading");
    else if (preview === "empty") setDocs([]);
    else if (preview === "ready") setDocs(MY_DOCS);
  }, [preview]);

  const openEntry = (id: string) => navigate(`/design/timesheet/entry?doc=${id}`);
  const openCurrent = () => navigate(`/design/timesheet/entry?doc=${CURRENT_ID}`);

  const matched = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) => d.id.toLowerCase().includes(q) || periodOf(d).toLowerCase().includes(q) || (d.perTask ?? "").toLowerCase().includes(q),
    );
  }, [docs, search]);

  const shown = matched.slice(0, visible);
  const markedIds = React.useMemo(() => shown.filter((d) => marked.has(d.id)).map((d) => d.id), [shown, marked]);

  const mark = (id: string, v: boolean) =>
    setMarked((prev) => {
      const next = new Set(prev);
      v ? next.add(id) : next.delete(id);
      return next;
    });
  const markAll = (v: boolean) =>
    setMarked(() => (v ? new Set(shown.map((d) => d.id)) : new Set()));

  const destroyOne = (d: MyDoc) => {
    if (d.destroyRefusal) {
      show("error", `${d.id} was not destroyed. ${d.destroyRefusal}`);
      setConfirmOne(null);
      return;
    }
    setDocs((prev) => prev.filter((x) => x.id !== d.id));
    setMarked((prev) => {
      const n = new Set(prev);
      n.delete(d.id);
      return n;
    });
    setConfirmOne(null);
    show("success", `${d.id} destroyed.`);
  };

  const runBulk = () => {
    setConfirmBulk(false);
    const ids = [...markedIds];
    start(ids, "Destroying timesheets", (id) => docs.find((d) => d.id === id)?.destroyRefusal ?? null, (id, reason) => {
      if (!reason) setDocs((prev) => prev.filter((x) => x.id !== id));
    });
    setMarked(new Set());
  };

  const hasSearch = search.trim().length > 0;

  return (
    <AppShell
      breadcrumb={<Crumb page="My Timesheets" />}
      overlay={
        <>
          {run && <BulkProgress run={run} onDismiss={clearRun} />}
          {!run && markedIds.length > 0 && (
            <SelectionFooter n={markedIds.length} onClear={() => setMarked(new Set())} onDestroy={() => setConfirmBulk(true)} />
          )}
          <Toast toast={toast} onDismiss={clear} offset={markedIds.length > 0 || run ? "bottom-20" : "bottom-6"} />
        </>
      }
    >
      {/* ── header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">My Timesheets</h1>
            <p className="mt-1 text-[12.5px] text-bz-text-muted">
              {ME.name} · {ME.id} — every period you have filed, and the one you are in now.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button onClick={() => setExportOpen((v) => !v)} className={GHOST_BTN}>
                <Download size={14} /> Extract <ChevronDown size={11} className="text-bz-text-muted" />
              </button>
              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setExportOpen(false)} aria-hidden />
                  <div className={cn("absolute right-0 top-[42px] z-30 w-[292px] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1", SHADOW)}>
                    <button
                      onClick={() => {
                        setExportOpen(false);
                        show("info", "Preparing your timesheet extract — the file is defined server-side.");
                      }}
                      className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm"
                    >
                      <FileSpreadsheet size={14} className="mt-0.5 shrink-0 text-bz-text-muted" />
                      <span className="min-w-0">
                        <span className="block text-[12px] font-medium text-bz-text">Download my timesheets</span>
                        <span className="block text-[10.5px] leading-[1.5] text-bz-text-muted">
                          The columns are defined server-side. It covers <span className="font-semibold">all</span> your
                          records — it is not narrowed by what is marked or searched here.
                        </span>
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-10 pt-4 md:px-8">
        {/* ── the primary action ───────────────────────────────────────── */}
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <CurrentPeriodBand onOpen={openCurrent} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-bz-lg border border-[#F0CFCB] bg-[#FDF3F2] p-3.5">
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={12} className="shrink-0 text-[#9A2E29]" />
                <p className={cn(LABEL, "text-[#9A2E29]")}>Sent back to you</p>
              </div>
              <p className="mt-2 text-[13px] font-medium text-bz-text">{SENT_BACK.periodLabel}</p>
              <p className="mt-1 line-clamp-2 text-[11.5px] leading-[1.5] text-bz-text-muted">{SENT_BACK.sentBackReason}</p>
              <button
                onClick={() => openEntry(SENT_BACK.id)}
                className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#9A2E29] hover:underline"
              >
                Correct and resubmit <ArrowRight size={12} />
              </button>
            </div>
            <Tile
              label="Awaiting endorsement"
              hint={
                <ExplainDot
                  title="Still with your approver"
                  body="These are submitted and out of your hands. An endorsed document stays editable — endorsement is not a lock. What freezes is per-row: hours already invoiced or already taken by a payroll run."
                />
              }
            >
              <p className="flex items-baseline gap-1.5">
                <span className={cn("text-[19px] font-semibold leading-none text-bz-text", NUM)}>{AWAITING.length}</span>
                <span className="text-[10.5px] text-bz-text-muted">documents</span>
              </p>
              <p className={cn("mt-1.5 text-[11px] text-bz-text-muted", NUM)}>
                {fmtH(AWAITING.reduce((s, d) => s + d.total, 0))} h submitted and unendorsed
              </p>
            </Tile>
          </div>
        </div>

        {/* ── the archive ──────────────────────────────────────────────── */}
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex flex-wrap items-center gap-2.5 border-b border-bz-line-soft px-4 py-3">
            <div className="relative min-w-0 flex-1" style={{ maxWidth: 400 }}>
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-muted" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(FETCH_CAP);
                }}
                placeholder="Search by document number or period…"
                className="h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper py-2 pl-9 pr-8 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
              />
              {hasSearch && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <p className={cn("ml-auto text-[11.5px] text-bz-text-muted", NUM)}>
              <span className="font-semibold text-bz-text">{matched.length}</span> {matched.length === 1 ? "record" : "records"}
            </p>
            <StatePreview
              value={preview}
              onChange={(v) => {
                setPreview(v);
                setMarked(new Set());
              }}
              options={[
                { value: "ready", label: "Loaded" },
                { value: "loading", label: "Loading" },
                { value: "empty", label: "No records yet" },
                { value: "failed", label: "Failed read" },
              ]}
            />
          </div>

          {read === "loading" ? (
            <LoadingRows label="Loading your timesheets…" />
          ) : read === "failed" ? (
            <FailedBlock
              what="your timesheets"
              detail="TIMESHEET_LIST · the request timed out after 30s."
              onRetry={() => {
                setPreview("ready");
                setRead("loading");
              }}
            />
          ) : matched.length === 0 && hasSearch ? (
            <StateBlock
              icon={<SearchX size={22} />}
              title="Nothing matches that search"
              body={<>No document number or period contains “{search.trim()}”. Widen the search to see the rest of your record.</>}
              action={
                <button onClick={() => setSearch("")} className={cn(GHOST_BTN, "mt-1")}>
                  Clear the search
                </button>
              }
            />
          ) : matched.length === 0 ? (
            <StateBlock
              icon={<Inbox size={22} />}
              title="No timesheets yet"
              body="You have not filed a single period. Start with the one you are in — the document is created for you when you open it."
              action={
                <button onClick={openCurrent} className={cn(PRIMARY_BTN, "mt-1")}>
                  <CalendarClock size={14} /> Open {PERIOD_LABEL} <ArrowRight size={13} />
                </button>
              }
            />
          ) : (
            <>
              <RecordTable
                rows={shown}
                marked={marked}
                onMark={mark}
                onMarkAll={markAll}
                onOpen={openEntry}
                onDestroy={(d) => setConfirmOne(d)}
              />
              <VolumeFoot
                shown={shown.length}
                total={matched.length}
                noun="records"
                loadingMore={fetchingMore}
                note="The fetch is capped — search or fetch more to reach older periods."
                onMore={() => {
                  setFetchingMore(true);
                  window.setTimeout(() => {
                    setVisible((v) => v + 10);
                    setFetchingMore(false);
                  }, 480);
                }}
              />
            </>
          )}
        </section>
      </div>

      <Confirm
        open={confirmBulk}
        title={`Destroy ${markedIds.length} ${markedIds.length === 1 ? "timesheet" : "timesheets"}?`}
        body={
          <>
            They are processed one at a time and you will see the progress. A refusal on one does not stop the rest — anything
            already invoiced or already voided will be reported back to you by name.
          </>
        }
        confirmLabel={`Destroy ${markedIds.length}`}
        onCancel={() => setConfirmBulk(false)}
        onConfirm={runBulk}
      />

      <Confirm
        open={confirmOne !== null}
        title={`Destroy ${confirmOne?.id}?`}
        body={
          <>
            {confirmOne ? periodOf(confirmOne) : ""} — <span className={NUM}>{confirmOne ? fmtH(confirmOne.total) : ""}</span> hours.
            This cannot be undone.
          </>
        }
        confirmLabel="Destroy it"
        onCancel={() => setConfirmOne(null)}
        onConfirm={() => confirmOne && destroyOne(confirmOne)}
      />
    </AppShell>
  );
}
