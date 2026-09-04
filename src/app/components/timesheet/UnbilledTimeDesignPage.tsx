import * as React from "react";
import {
  AlertTriangle,
  Ban,
  Check,
  Info,
  Link2,
  Loader2,
  Play,
  Receipt,
  SearchX,
  X,
} from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import {
  CARD,
  Checkbox,
  Confirm,
  Crumb,
  DefectChip,
  ExplainDot,
  FailedBlock,
  GHOST_BTN,
  GHOST_BTN_SM,
  GrantToggle,
  INPUT,
  LABEL,
  LoadingRows,
  Lookup,
  NUM,
  Nil,
  PROJECT_OPTIONS,
  PRIMARY_BTN,
  ReadState,
  SHADOW,
  StateBlock,
  StatePreview,
  Switch,
  Tile,
  Toast,
  Unresolved,
  clientById,
  fmtDateShort,
  fmtH,
  money,
  personById,
  useDocumentTitle,
  useToast,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// TIMESHEET · UNBILLED TIME  (surface F — the WIP pool and its composer)
//
// PRIMARY ACTION: turn recorded hours into a client invoice. Selection is the
// verb of this page, so the surprising rule that governs it — the FIRST pick
// binds the whole selection to one client — is announced the instant it takes
// effect, in a band that names the bound client and says exactly how many rows
// it just took out of reach. Without that, the surface simply looks broken.
//
// Three defects, three different consequences, and the difference between them
// is the whole reading:
//   no client       → cannot be acted on at all; fix it upstream
//   no sellable item→ can only be consumed without charge
//   no rate         → rescuable in place, in the composer
// None of them is filtered away.
// ════════════════════════════════════════════════════════════════════════════

type PoolEntry = {
  id: string;
  docId: string;
  personId: string;
  clientId: string | null;
  project: string;
  task: string | null;
  activity: string;
  sellable: boolean;
  from: string;
  to: string;
  hours: number;
  rate?: number; // absent without the money grant, or when none resolves
  rateResolves: boolean; // a data fact, not a money measure
};

const POOL_SEED: PoolEntry[] = [
  { id: "WIP-01", docId: "TS-0157-2083-01", personId: "EMP-0157", clientId: "C-1029", project: "Phase 1 · Finance", task: "Chart of accounts migration", activity: "Data migration", sellable: true, from: "2026-05-17", to: "2026-05-24", hours: 32, rate: 2600, rateResolves: true },
  { id: "WIP-02", docId: "TS-0142-2083-02", personId: "EMP-0142", clientId: "C-1029", project: "Phase 1 · Finance", task: "Opening balance reconciliation", activity: "Consulting", sellable: true, from: "2026-05-24", to: "2026-05-31", hours: 24, rate: 2400, rateResolves: true },
  { id: "WIP-03", docId: "TS-0163-2083-01", personId: "EMP-0163", clientId: "C-1029", project: "Phase 2 · Inventory", task: "Stock take procedure", activity: "QA testing", sellable: true, from: "2026-06-01", to: "2026-06-05", hours: 18, rateResolves: false },
  { id: "WIP-04", docId: "TS-0171-2083-02", personId: "EMP-0171", clientId: "C-1029", project: "Warehouse cutover", task: "Warehouse bin mapping", activity: "Consulting", sellable: true, from: "2026-06-07", to: "2026-06-11", hours: 36, rate: 2800, rateResolves: true },
  { id: "WIP-05", docId: "TS-0194-2083-02", personId: "EMP-0194", clientId: null, project: "Internal R&D", task: "Costing engine spike", activity: "Development", sellable: true, from: "2026-06-02", to: "2026-06-06", hours: 12, rate: 2300, rateResolves: true },
  { id: "WIP-06", docId: "TS-0188-2083-01", personId: "EMP-0188", clientId: "C-1003", project: "Himalayan POS Deployment", task: "Sprint 14 — POS receipts", activity: "Development", sellable: true, from: "2026-05-20", to: "2026-05-28", hours: 40, rate: 2500, rateResolves: true },
  { id: "WIP-07", docId: "TS-0221-2083-02", personId: "EMP-0221", clientId: "C-1003", project: "Himalayan POS Deployment", task: null, activity: "Travel", sellable: false, from: "2026-06-03", to: "2026-06-04", hours: 9, rate: 1800, rateResolves: true },
  { id: "WIP-08", docId: "TS-0230-2083-02", personId: "EMP-0230", clientId: "C-1044", project: "Everest Portal Revamp", task: "Client training — batch 2", activity: "Training", sellable: true, from: "2026-06-08", to: "2026-06-12", hours: 28, rate: 3000, rateResolves: true },
  { id: "WIP-09", docId: "TS-0244-2083-02", personId: "EMP-0244", clientId: "C-1044", project: "Everest Portal Revamp", task: null, activity: "Consulting", sellable: true, from: "2026-06-01", to: "2026-06-03", hours: 14, rate: 3000, rateResolves: true },
  { id: "WIP-10", docId: "TS-0251-2083-02", personId: "EMP-0251", clientId: "C-1029", project: "Phase 2 · Inventory", task: null, activity: "Support", sellable: true, from: "2026-06-09", to: "2026-06-12", hours: 20, rate: 2200, rateResolves: true },
];

const amountOf = (e: PoolEntry) => (e.rate === undefined ? undefined : e.rate * e.hours);

// ── per-line composition decisions ──────────────────────────────────────────
type LineDecision = { tax: "VAT" | "EXEMPT"; overrideRate: string; consume: boolean };

// ════════════════════════════════════════════════════════════════════════════
// INVOICE COMPOSER — deliberately non-dismissable
// ════════════════════════════════════════════════════════════════════════════

function Composer({
  entries,
  clientName,
  hasMoney,
  onClose,
  onDone,
}: {
  entries: PoolEntry[];
  clientName: string;
  hasMoney: boolean;
  onClose: () => void;
  onDone: (kind: "invoice" | "retire", ids: string[], invoiceNo?: string) => void;
}) {
  const [issue, setIssue] = React.useState("2026-06-15");
  const [due, setDue] = React.useState("2026-07-15");
  const [note, setNote] = React.useState("");
  const [dec, setDec] = React.useState<Record<string, LineDecision>>(() =>
    Object.fromEntries(entries.map((e) => [e.id, { tax: "VAT" as const, overrideRate: "", consume: !e.sellable }])),
  );
  const [committing, setCommitting] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [result, setResult] = React.useState<{ invoiceNo: string } | null>(null);

  const patch = (id: string, p: Partial<LineDecision>) => setDec((d) => ({ ...d, [id]: { ...d[id], ...p } }));

  /** A typed override that parses to a usable number. */
  const overrideOf = (e: PoolEntry): number | undefined => {
    const o = dec[e.id]?.overrideRate.trim();
    if (!o) return undefined;
    const n = Number(o);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  /** The rate this line will actually be billed at — a monetary measure. */
  const effectiveRate = (e: PoolEntry): number | undefined => overrideOf(e) ?? e.rate;

  /**
   * Whether the line CAN be priced is a data fact, independent of whether the
   * viewer is allowed to see money — so it is resolved from `rateResolves`,
   * never from the presence of a rate in the payload.
   */
  const isPriced = (e: PoolEntry) => e.rateResolves || overrideOf(e) !== undefined;

  const problemOf = (e: PoolEntry): { text: string; exit: string } | null => {
    if (dec[e.id]?.consume) return null; // the universal escape hatch
    if (!e.sellable)
      return {
        text: `“${e.activity}” has no sellable item behind it, so there is nothing to put on an invoice line.`,
        exit: "Consume it without charging — the hours still leave the pool.",
      };
    if (!isPriced(e))
      return {
        text: "No charge rate resolves for this line, so it cannot be priced.",
        exit: hasMoney ? "Type a rate below, or consume it without charging." : "Consume it without charging — rescuing a rate needs the money grant.",
      };
    return null;
  };

  const charged = entries.filter((e) => !dec[e.id]?.consume);
  const retired = entries.filter((e) => dec[e.id]?.consume);
  const blocked = entries.filter((e) => problemOf(e) !== null);

  const priceable = charged.filter((e) => isPriced(e) && effectiveRate(e) !== undefined);
  const anyPriceable = hasMoney && priceable.length > 0;
  const netValue = priceable.reduce((s, e) => s + (effectiveRate(e) ?? 0) * e.hours, 0);
  const taxValue = priceable.reduce((s, e) => (dec[e.id]?.tax === "VAT" ? s + (effectiveRate(e) ?? 0) * e.hours * 0.13 : s), 0);

  const willInvoice = charged.length > 0;

  const commit = () => {
    if (blocked.length > 0) {
      setRefusal(
        `${blocked.length} ${blocked.length === 1 ? "line still has" : "lines still have"} an unresolved problem: ${blocked
          .map((e) => e.id)
          .join(", ")}. Give each one a rate, or consume it without charging.`,
      );
      return;
    }
    if (!issue) {
      setRefusal("An issue date is required before this can be committed.");
      return;
    }
    setRefusal(null);
    setCommitting(true);
    window.setTimeout(() => {
      setCommitting(false);
      if (willInvoice) setResult({ invoiceNo: "INV-2093" });
      else onDone("retire", entries.map((e) => e.id));
    }, 950);
  };

  // ── outcome: an invoice exists now, and this step ends by leaving for it ──
  if (result) {
    return (
      <div className="fixed inset-0 z-[75] flex items-center justify-center bg-bz-olive/55 px-4">
        <div className={cn("w-full max-w-[460px] rounded-bz-lg border border-bz-line bg-bz-surface p-6 text-center", SHADOW)}>
          <span className="mx-auto flex size-12 items-center justify-center rounded-bz-md bg-bz-fire/[0.22] text-bz-text">
            <Receipt size={22} />
          </span>
          <p className="mt-3 text-[16px] font-semibold text-bz-text">{result.invoiceNo} created</p>
          <p className="mt-1.5 text-[12.5px] leading-[1.6] text-bz-text-muted">
            <span className={NUM}>{charged.length}</span> {charged.length === 1 ? "line" : "lines"} billed to {clientName}
            {retired.length > 0 && (
              <>
                , and <span className={NUM}>{retired.length}</span> more retired without charge
              </>
            )}
            . Those hours have left the unbilled pool for good.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={() => onDone("invoice", entries.map((e) => e.id), result.invoiceNo)} className={cn(PRIMARY_BTN, "h-10 w-full")}>
              <Link2 size={13} /> Open {result.invoiceNo}
            </button>
            <button onClick={() => onDone("invoice", entries.map((e) => e.id))} className={cn(GHOST_BTN, "w-full")}>
              Back to the pool
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[75] flex flex-col bg-bz-olive/55 px-0 py-0 md:px-6 md:py-6">
      <div className={cn("mx-auto flex h-full w-full max-w-[1040px] flex-col overflow-hidden rounded-none border-bz-line bg-bz-section-b md:rounded-bz-lg md:border", SHADOW)}>
        {/* head */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-bz-line bg-bz-paper px-4 py-3 md:px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-fire/[0.20] text-bz-text">
            <Receipt size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[14.5px] font-semibold text-bz-text">Compose an invoice</p>
            <p className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
              {entries.length} {entries.length === 1 ? "entry" : "entries"} · {fmtH(entries.reduce((s, e) => s + e.hours, 0))} hours ·{" "}
              {clientName}
            </p>
          </div>
          <button onClick={() => setDiscardOpen(true)} className={cn(GHOST_BTN_SM, "ml-auto")}>
            Discard the composition
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5">
          {/* invoice-level */}
          <div className={cn(CARD, "mb-3 grid gap-3 p-3.5 sm:grid-cols-2 lg:grid-cols-4")}>
            <div>
              <p className={cn(LABEL, "mb-1.5")}>Issue date · required</p>
              <input type="date" value={issue} onChange={(e) => setIssue(e.target.value)} className={cn(INPUT, NUM)} />
            </div>
            <div>
              <p className={cn(LABEL, "mb-1.5")}>Payment due</p>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={cn(INPUT, NUM)} />
            </div>
            <div className="sm:col-span-2">
              <p className={cn(LABEL, "mb-1.5")}>Note on the invoice</p>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional…" className={INPUT} />
            </div>
          </div>

          {/* lines */}
          <div className="flex flex-col gap-2.5">
            {entries.map((e) => {
              const d = dec[e.id];
              const problem = problemOf(e);
              const rate = effectiveRate(e);
              const person = personById(e.personId);
              return (
                <div
                  key={e.id}
                  className={cn(
                    "rounded-bz-lg border bg-bz-surface p-3.5",
                    d?.consume ? "border-bz-line-soft opacity-80" : problem ? "border-[#F0CFCB]" : "border-bz-line-soft",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-[220px] flex-1">
                      <p className="text-[12.5px] font-medium text-bz-text">
                        {e.task ?? <span className="italic text-bz-text-soft">No task</span>} · {e.activity}
                      </p>
                      <p className={cn("mt-0.5 text-[10.5px] text-bz-text-soft", NUM)}>
                        {e.project} · {person?.name} · {e.docId} · {fmtDateShort(e.from)}–{fmtDateShort(e.to)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{fmtH(e.hours)}</p>
                      <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">hours</p>
                    </div>
                    {hasMoney && (
                      <div className="w-[112px] text-right">
                        <p className={cn("text-[13px] font-semibold", NUM, rate === undefined ? "text-bz-text-soft" : "text-bz-text")}>
                          {d?.consume || rate === undefined ? "—" : money(rate * e.hours)}
                        </p>
                        <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">
                          {d?.consume ? "not charged" : rate === undefined ? "unpriced" : `NPR @ ${money(rate)}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-3">
                    <div>
                      <p className={cn(LABEL, "mb-1.5")}>Tax treatment</p>
                      <div className="inline-flex rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
                        {(["VAT", "EXEMPT"] as const).map((t) => (
                          <button
                            key={t}
                            disabled={d?.consume}
                            onClick={() => patch(e.id, { tax: t })}
                            className={cn(
                              "h-7 rounded-[7px] px-2.5 text-[11.5px] font-medium disabled:cursor-not-allowed disabled:opacity-40",
                              d?.tax === t ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
                            )}
                          >
                            {t === "VAT" ? "VAT 13%" : "Non-taxable"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {hasMoney && (
                      <div>
                        <p className={cn(LABEL, "mb-1.5 flex items-center gap-1.5")}>
                          Rate override
                          <ExplainDot
                            title="How a write-down, a write-up or a rescue is expressed"
                            body="Typing a rate here replaces whatever the system resolved. It is the only way to write a line down or up — and the only way to rescue a line for which no rate resolves at all."
                          />
                        </p>
                        <input
                          disabled={d?.consume}
                          value={d?.overrideRate ?? ""}
                          onChange={(ev) => {
                            patch(e.id, { overrideRate: ev.target.value });
                            setRefusal(null);
                          }}
                          inputMode="decimal"
                          placeholder={e.rateResolves ? money(e.rate ?? 0) : "no rate resolved"}
                          className={cn(INPUT, NUM, "h-8 w-[152px] disabled:cursor-not-allowed disabled:opacity-40")}
                        />
                      </div>
                    )}

                    <div>
                      <p className={cn(LABEL, "mb-1.5")}>Consume without charging</p>
                      <div className="flex h-8 items-center gap-2">
                        <Switch
                          value={!!d?.consume}
                          ariaLabel="Consume without charging"
                          onChange={(v) => {
                            patch(e.id, { consume: v });
                            setRefusal(null);
                          }}
                        />
                        <span className={cn("text-[11.5px]", d?.consume ? "font-medium text-bz-text" : "text-bz-text-muted")}>
                          {d?.consume ? "retired, not billed" : "billed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {problem && (
                    <p className="mt-3 flex items-start gap-2 rounded-bz-sm bg-[#FBE5E2] px-2.5 py-2 text-[11.5px] leading-[1.5] text-[#9A2E29]">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                      <span>
                        {problem.text} <span className="font-semibold">{problem.exit}</span>
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* foot */}
        <div className="border-t border-bz-line bg-bz-paper px-4 py-3 md:px-5">
          {refusal && (
            <p className="mb-2.5 flex items-start gap-2 rounded-bz-sm bg-[#FBE5E2] px-2.5 py-2 text-[11.5px] leading-[1.5] text-[#9A2E29]">
              <Ban size={12} className="mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold">Not committed.</span> {refusal} Nothing you typed was lost.
              </span>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <p className={cn("text-[12px] text-bz-text", NUM)}>
                <span className="font-semibold">{charged.length}</span> {charged.length === 1 ? "line" : "lines"} will be charged ·{" "}
                <span className="font-semibold">{retired.length}</span> will be retired without charge
              </p>
              {anyPriceable ? (
                <p className={cn("mt-0.5 text-[11.5px] text-bz-text-muted", NUM)}>
                  NPR {money(Math.round(netValue))} + {money(Math.round(taxValue))} tax ={" "}
                  <span className="font-semibold text-bz-text">NPR {money(Math.round(netValue + taxValue))}</span>
                </p>
              ) : (
                <p className="mt-0.5 text-[11.5px] text-bz-text-muted">
                  {hasMoney ? "Nothing in this composition can be priced." : "You have no money grant — this composition carries hours only."}
                </p>
              )}
            </div>
            <button onClick={commit} disabled={committing} className={cn(PRIMARY_BTN, "h-10 px-4")}>
              {committing ? <Loader2 size={13} className="animate-spin" /> : willInvoice ? <Receipt size={13} /> : <Check size={13} />}
              {committing
                ? "Committing…"
                : willInvoice
                ? anyPriceable
                  ? `Create the invoice · NPR ${money(Math.round(netValue + taxValue))}`
                  : `Create the invoice · ${charged.length} ${charged.length === 1 ? "line" : "lines"}`
                : `Retire ${retired.length} ${retired.length === 1 ? "entry" : "entries"} without charging`}
            </button>
          </div>
        </div>
      </div>

      <Confirm
        open={discardOpen}
        title="Discard this composition?"
        body="Every rate override, tax choice and note you have set here is thrown away. The entries stay selected in the pool."
        confirmLabel="Discard it"
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false);
          onClose();
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function UnbilledTimeDesignPage() {
  useDocumentTitle("Unbilled Time");
  const { toast, show, clear } = useToast();

  const [hasMoney, setHasMoney] = React.useState(true);
  const [read, setRead] = React.useState<ReadState>("loading");
  const [preview, setPreview] = React.useState<"ready" | "loading" | "empty" | "failed">("ready");
  const [pool, setPool] = React.useState<PoolEntry[]>(POOL_SEED);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [composerOpen, setComposerOpen] = React.useState(false);

  const [from, setFrom] = React.useState("2026-06-01");
  const [to, setTo] = React.useState("2026-06-15");
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [draftDirty, setDraftDirty] = React.useState(false);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    setRead("loading");
    if (preview === "empty") setPool([]);
    if (preview === "ready") setPool(POOL_SEED);
    const t = window.setTimeout(() => setRead(preview === "loading" ? "loading" : preview), 520);
    return () => window.clearTimeout(t);
  }, [preview]);

  // money is absent from the data itself without the grant
  const rows = React.useMemo(
    () => (hasMoney ? pool : pool.map(({ rate: _r, ...rest }) => rest as PoolEntry)),
    [pool, hasMoney],
  );

  // the FIRST selection binds the whole selection to one client
  const boundClientId = React.useMemo(() => {
    const first = rows.find((e) => selected.has(e.id));
    return first?.clientId ?? null;
  }, [rows, selected]);

  const blockedByBinding = React.useMemo(
    () => (boundClientId ? rows.filter((e) => e.clientId && e.clientId !== boundClientId).length : 0),
    [rows, boundClientId],
  );

  const selectableReason = (e: PoolEntry): string | null => {
    if (!e.clientId) return "noclient";
    if (boundClientId && e.clientId !== boundClientId) return "otherclient";
    return null;
  };

  const selectedEntries = rows.filter((e) => selected.has(e.id));
  const selHours = selectedEntries.reduce((s, e) => s + e.hours, 0);
  const selPriceable = selectedEntries.filter((e) => e.rate !== undefined);
  const selValue = selPriceable.reduce((s, e) => s + (e.rate ?? 0) * e.hours, 0);

  const totalHours = rows.reduce((s, e) => s + e.hours, 0);
  const pricedTotal = rows.filter((e) => e.rate !== undefined).reduce((s, e) => s + (e.rate ?? 0) * e.hours, 0);
  const unpricedCount = rows.filter((e) => e.rate === undefined).length;

  const toggle = (id: string, v: boolean) =>
    setSelected((prev) => {
      const n = new Set(prev);
      v ? n.add(id) : n.delete(id);
      return n;
    });

  const runQuery = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setDraftDirty(false);
      setSelected(new Set()); // a re-query drops the selection implicitly
      show("info", "Re-queried — the selection was released with it.");
    }, 600);
  };

  const finish = (kind: "invoice" | "retire", ids: string[], invoiceNo?: string) => {
    setPool((p) => p.filter((e) => !ids.includes(e.id)));
    setSelected(new Set());
    setComposerOpen(false);
    if (kind === "invoice") {
      show("success", invoiceNo ? `Opening ${invoiceNo}…` : "Invoice created — those hours have left the pool.");
    } else {
      show("success", `${ids.length} ${ids.length === 1 ? "entry" : "entries"} retired without charge. The pool has been re-read — they are gone from it.`);
    }
  };

  return (
    <AppShell
      breadcrumb={<Crumb page="Unbilled Time" />}
      overlay={
        <>
          {selected.size > 0 && !composerOpen && (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
                <p className={cn("text-[12px] text-bz-text", NUM)}>
                  <span className="font-semibold">{selected.size}</span> selected ·{" "}
                  <span className="font-semibold">{fmtH(selHours)}</span> hours
                </p>
                {hasMoney &&
                  (selPriceable.length > 0 ? (
                    <p className={cn("text-[12px] text-bz-text-muted", NUM)}>
                      worth <span className="font-semibold text-bz-text">NPR {money(selValue)}</span>
                      {selPriceable.length < selectedEntries.length && (
                        <span className="text-bz-text-soft"> · {selectedEntries.length - selPriceable.length} unpriced</span>
                      )}
                    </p>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Unresolved label="nothing here can be priced" />
                      <ExplainDot
                        title="Absent, not zero"
                        body="Not one line in this selection has a rate that resolves, so there is no monetary value to state. That is meaningfully different from a selection worth nothing — and it does not stop you: every line can still be consumed without charging."
                      />
                    </span>
                  ))}
                {boundClientId && (
                  <p className="text-[11.5px] text-bz-text-muted">
                    bound to <span className="font-semibold text-bz-text">{clientById(boundClientId)?.name}</span>
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => setSelected(new Set())} className={GHOST_BTN_SM}>
                  <X size={11} /> Release the selection
                </button>
                <button onClick={() => setComposerOpen(true)} className={cn(PRIMARY_BTN, "h-8")}>
                  <Receipt size={12} /> Compose invoice
                </button>
              </div>
            </div>
          )}
          {composerOpen && boundClientId && (
            <Composer
              entries={selectedEntries}
              clientName={clientById(boundClientId)?.name ?? "—"}
              hasMoney={hasMoney}
              onClose={() => setComposerOpen(false)}
              onDone={finish}
            />
          )}
          <Toast toast={toast} onDismiss={clear} offset={selected.size > 0 ? "bottom-24" : "bottom-6"} />
        </>
      }
    >
      <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Unbilled Time</h1>
            <p className="mt-1 max-w-[640px] text-[12.5px] leading-[1.55] text-bz-text-muted">
              Chargeable, settled hours that have not been invoiced yet, one entry per document and work stream.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GrantToggle value={hasMoney} onChange={setHasMoney} />
            <StatePreview
              value={preview}
              onChange={(v) => {
                setPreview(v);
                setSelected(new Set());
              }}
              options={[
                { value: "ready", label: "Loaded" },
                { value: "loading", label: "Loading" },
                { value: "empty", label: "Nothing unbilled" },
                { value: "failed", label: "Failed read" },
              ]}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-10 pt-4 md:px-8">
        {/* narrowing */}
        <div className={cn(CARD, "flex flex-wrap items-end gap-3 p-3.5")}>
          <div>
            <p className={cn(LABEL, "mb-1.5")}>From</p>
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setDraftDirty(true); }} className={cn(INPUT, NUM, "w-[152px]")} />
          </div>
          <div>
            <p className={cn(LABEL, "mb-1.5")}>To</p>
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setDraftDirty(true); }} className={cn(INPUT, NUM, "w-[152px]")} />
          </div>
          <div className="min-w-[220px] flex-1" style={{ maxWidth: 340 }}>
            <p className={cn(LABEL, "mb-1.5")}>Focus on one project</p>
            <Lookup
              value={projectId}
              options={PROJECT_OPTIONS}
              placeholder="Every project"
              clearLabel="Every project"
              width={340}
              onChange={(v) => { setProjectId(v); setDraftDirty(true); }}
            />
          </div>
          <button onClick={runQuery} disabled={running} className={cn(PRIMARY_BTN, "h-9")}>
            <Play size={12} /> {running ? "Running…" : "Run"}
          </button>
          {draftDirty && (
            <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text">
              <span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Narrowing changed — run to update the pool.
            </p>
          )}
        </div>

        {/* aggregate */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Tile label="Unbilled hours">
            <p className={cn("text-[19px] font-semibold leading-none text-bz-text", NUM)}>{fmtH(totalHours)}</p>
            <p className={cn("mt-1.5 text-[10.5px] text-bz-text-muted", NUM)}>
              across {rows.length} {rows.length === 1 ? "entry" : "entries"}
            </p>
          </Tile>
          {hasMoney ? (
            <Tile
              label="Value at current rates"
              hint={
                <ExplainDot
                  title="A management reading, not a balance"
                  body="This is work in progress valued at whatever rates resolve right now. It is not an accounting balance, it is not posted anywhere, and it will change the moment a rate does. Money is only frozen onto a record when that record is actually invoiced."
                />
              }
            >
              <p className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-[11px] font-semibold text-bz-text-muted">NPR</span>
                <span className={cn("text-[19px] font-semibold leading-none text-bz-text", NUM)}>{money(pricedTotal)}</span>
              </p>
              <p className={cn("mt-1.5 text-[10.5px]", unpricedCount > 0 ? "text-[#9A2E29]" : "text-bz-text-muted")}>
                {unpricedCount > 0 ? `${unpricedCount} entries could not be priced and are not in this figure` : "every entry is priced"}
              </p>
            </Tile>
          ) : (
            <Tile label="Value at current rates" tone="quiet">
              <Unresolved label="not part of your reading" />
              <p className="mt-1.5 text-[10.5px] leading-[1.5] text-bz-text-muted">
                Rates and amounts were never sent to you. Everything below works on hours alone.
              </p>
            </Tile>
          )}
          <Tile label="Cannot be acted on" tone={rows.some((e) => !e.clientId) ? "attention" : "normal"}>
            <p className={cn("text-[19px] font-semibold leading-none", NUM, rows.some((e) => !e.clientId) ? "text-[#9A2E29]" : "text-bz-text")}>
              {rows.filter((e) => !e.clientId).length}
            </p>
            <p className="mt-1.5 text-[10.5px] leading-[1.5] text-bz-text-muted">
              entries have no client, so they can neither be invoiced nor consumed — they must be fixed upstream
            </p>
          </Tile>
        </div>

        {/* the binding — announced the instant it takes effect */}
        {boundClientId && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-bz-lg border border-bz-olive bg-bz-olive px-4 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-white/[0.08] text-bz-fire">
              <Link2 size={15} />
            </span>
            <p className="min-w-0 flex-1 text-[12.5px] leading-[1.55] text-bz-text-on-dark">
              This selection is bound to <span className="font-semibold">{clientById(boundClientId)?.name}</span> — one invoice bills
              exactly one client.{" "}
              {blockedByBinding > 0 && (
                <span className="text-bz-text-on-dark-muted">
                  <span className={NUM}>{blockedByBinding}</span>{" "}
                  {blockedByBinding === 1 ? "entry belongs" : "entries belong"} to a different client and cannot be picked while this
                  selection stands.
                </span>
              )}
            </p>
            <button
              onClick={() => setSelected(new Set())}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-bz-md border border-white/[0.14] bg-white/[0.06] px-2.5 text-[11.5px] font-medium text-bz-text-on-dark hover:bg-white/[0.12]"
            >
              <X size={11} /> Release the binding
            </button>
          </div>
        )}

        {/* pool */}
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-bz-line-soft px-4 py-2.5">
            <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-bz-text">
              Work in progress
              <ExplainDot
                title="What this list is"
                body="Chargeable hours that are settled but not yet invoiced, aggregated to one row per document and work stream. It is a management reading of work in progress — not an accounting balance."
              />
            </p>
            <p className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
              <span className="font-semibold text-bz-text">{rows.length}</span> {rows.length === 1 ? "entry" : "entries"}
            </p>
          </div>

          {read === "loading" ? (
            <LoadingRows label="Reading the unbilled pool…" />
          ) : read === "failed" ? (
            <FailedBlock what="the unbilled pool" detail="TIMESHEET_WIP · the billing service returned 500." onRetry={() => setPreview("ready")} />
          ) : rows.length === 0 ? (
            <StateBlock
              icon={<SearchX size={22} />}
              title="Nothing is unbilled in this range"
              body="Every chargeable, settled hour inside these dates has already been invoiced or consumed. Widen the range and run again to look further back."
              action={
                <button onClick={() => setPreview("ready")} className={cn(GHOST_BTN, "mt-1")}>
                  Re-run over the seeded range
                </button>
              }
            />
          ) : (
            <>
              {/* desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full border-collapse text-left" style={{ minWidth: hasMoney ? 1120 : 940 }}>
                  <thead>
                    <tr className="border-b border-bz-line bg-bz-paper-warm">
                      <th className="w-10 px-3 py-2.5" />
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Work</th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Client · project</th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Person · document</th>
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Dates</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Hours</th>
                      {hasMoney && (
                        <>
                          <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Rate</th>
                          <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Amount</th>
                        </>
                      )}
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e) => {
                      const block = selectableReason(e);
                      const picked = selected.has(e.id);
                      return (
                        <tr
                          key={e.id}
                          className={cn(
                            "border-b border-bz-line-soft",
                            picked && "bg-bz-fire/[0.08]",
                            block === "noclient" && "bg-[#FDF3F2]",
                            block === "otherclient" && "opacity-45",
                          )}
                        >
                          <td className="px-3 py-3">
                            {block ? (
                              <span className="flex size-4 items-center justify-center text-bz-text-soft">
                                <Ban size={12} />
                              </span>
                            ) : (
                              <Checkbox checked={picked} onChange={(v) => toggle(e.id, v)} ariaLabel={`Select ${e.id}`} />
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="block text-[12.5px] font-medium text-bz-text">
                              {e.task ?? <span className="italic text-bz-text-soft">No task</span>}
                            </span>
                            <span className="block text-[10.5px] text-bz-text-soft">{e.activity}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="block text-[12px] text-bz-text">
                              {e.clientId ? clientById(e.clientId)?.name : <span className="italic text-[#9A2E29]">No client</span>}
                            </span>
                            <span className="block text-[10.5px] text-bz-text-soft">{e.project}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="block text-[12px] text-bz-text">{personById(e.personId)?.name}</span>
                            <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{e.docId}</span>
                          </td>
                          <td className={cn("px-3 py-3 text-[11.5px] text-bz-text-muted", NUM)}>
                            {fmtDateShort(e.from)} – {fmtDateShort(e.to)}
                          </td>
                          <td className={cn("px-3 py-3 text-right text-[12.5px] font-semibold text-bz-text", NUM)}>{fmtH(e.hours)}</td>
                          {hasMoney && (
                            <>
                              <td className={cn("px-3 py-3 text-right text-[12px] text-bz-text-muted", NUM)}>
                                {e.rate === undefined ? <Unresolved label="no rate" /> : money(e.rate)}
                              </td>
                              <td className={cn("px-3 py-3 text-right text-[12.5px] font-semibold text-bz-text", NUM)}>
                                {amountOf(e) === undefined ? <Nil /> : money(amountOf(e)!)}
                              </td>
                            </>
                          )}
                          <td className="px-3 py-3">
                            <span className="flex flex-wrap gap-1">
                              {!e.clientId && (
                                <DefectChip
                                  label="no client"
                                  tone="attention"
                                  title="This entry cannot be acted on"
                                  body="The client is derived from the project, and this project has none. Without a client the hours can neither be put on an invoice nor consumed without charge."
                                  exit="Attach the project to a client, or move the hours to a project that has one. Nothing here can fix it."
                                />
                              )}
                              {!e.sellable && (
                                <DefectChip
                                  label="no sellable item"
                                  tone="neutral"
                                  title="Nothing to put on an invoice line"
                                  body={`The activity “${e.activity}” has no sellable item behind it, so there is no line to bill. The entry can still be selected.`}
                                  exit="Consume it without charging in the composer — the hours leave the pool either way."
                                />
                              )}
                              {!e.rateResolves && (
                                <DefectChip
                                  label="no rate"
                                  tone="attention"
                                  title="No charge rate resolves"
                                  body="Neither the client, the project, the activity nor the person yields a charge rate for these dates, so the entry cannot be priced as it stands."
                                  exit="Select it anyway and type a rate in the composer — or consume it without charging."
                                />
                              )}
                              {block === "otherclient" && (
                                <DefectChip
                                  label="other client"
                                  tone="neutral"
                                  title="Held back by the client binding"
                                  body={`Your selection is bound to ${clientById(boundClientId!)?.name} because one invoice bills exactly one client. This entry belongs to ${clientById(e.clientId!)?.name}.`}
                                  exit="Release the selection to pick this client instead."
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

              {/* mobile / tablet */}
              <div className="flex flex-col gap-2.5 p-3 lg:hidden">
                {rows.map((e) => {
                  const block = selectableReason(e);
                  const picked = selected.has(e.id);
                  return (
                    <div
                      key={e.id}
                      className={cn(
                        "rounded-bz-md border p-4",
                        picked ? "border-bz-fire bg-bz-fire/[0.07]" : block === "noclient" ? "border-[#F0CFCB] bg-[#FDF3F2]" : "border-bz-line-soft bg-bz-surface",
                        block === "otherclient" && "opacity-55",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          {block ? (
                            <span className="flex size-4 items-center justify-center text-bz-text-soft">
                              <Ban size={12} />
                            </span>
                          ) : (
                            <Checkbox checked={picked} onChange={(v) => toggle(e.id, v)} ariaLabel={`Select ${e.id}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-bz-text">{e.task ?? "No task"}</p>
                          <p className="mt-0.5 text-[11px] text-bz-text-muted">
                            {e.activity} · {e.clientId ? clientById(e.clientId)?.name : "No client"}
                          </p>
                          <p className={cn("mt-0.5 text-[10.5px] text-bz-text-soft", NUM)}>
                            {personById(e.personId)?.name} · {e.docId} · {fmtDateShort(e.from)}–{fmtDateShort(e.to)}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            <span className={cn("text-[15px] font-semibold text-bz-text", NUM)}>{fmtH(e.hours)} h</span>
                            {hasMoney &&
                              (amountOf(e) === undefined ? <Unresolved label="no rate" /> : <span className={cn("text-[13px] text-bz-text-muted", NUM)}>NPR {money(amountOf(e)!)}</span>)}
                          </div>
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {!e.clientId && (
                              <DefectChip label="no client" tone="attention" title="This entry cannot be acted on" body="The client is derived from the project, and this project has none." exit="Attach the project to a client upstream." />
                            )}
                            {!e.sellable && (
                              <DefectChip label="no sellable item" tone="neutral" title="Nothing to put on an invoice line" body={`“${e.activity}” has no sellable item behind it.`} exit="Consume it without charging." />
                            )}
                            {!e.rateResolves && (
                              <DefectChip label="no rate" tone="attention" title="No charge rate resolves" body="Nothing yields a charge rate for these dates." exit="Type a rate in the composer, or consume it without charging." />
                            )}
                            {block === "otherclient" && (
                              <DefectChip label="other client" tone="neutral" title="Held back by the client binding" body="One invoice bills exactly one client, and this selection is already bound elsewhere." exit="Release the selection." />
                            )}
                          </div>
                        </div>
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
          Every defective entry is shown rather than filtered away — a pool that quietly drops hours is a pool nobody can trust. Tap
          any flag to read why it is there and what the way out is.
        </p>
      </div>
    </AppShell>
  );
}
