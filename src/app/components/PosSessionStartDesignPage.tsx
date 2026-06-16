import * as React from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  ScanLine,
  Store,
  Clock,
  Coins,
  Calculator,
  Hash,
  MessageSquare,
  Power,
  X,
  ArrowRight,
  Info,
  Lock,
  Wallet,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";
import {
  NUM,
  CURRENCY,
  fmt0,
  Money,
  SectionLabel,
  Field,
  Textarea,
  NumberInput,
  Select,
  Segmented,
  Spinner,
  Toast,
  useToast,
  PRIMARY_BTN,
  GHOST_BTN,
  CashCount,
  emptyCounts,
  cashTotal,
  countedPieces,
  type CashCounts,
} from "./PosKit";

// ════════════════════════════════════════════════════════════════════════════
// POS · START SESSION  (the gate to open a till)
//
// Primary action = enter the OPENING CASH and Start the session — which drops
// the cashier into the live terminal. This screen is deliberately a different
// SHAPE from its siblings (the two-column setup wizard, the split-workspace
// terminal): a FOCUSED, CALM single centred column — a gate, not a workspace.
//
//   Header band (title + subtitle)
//     → Session-context card   counter (read-only, inherited) + shift (optional)
//     → Opening-cash card      method switch + the active cash control +
//                              a prominent live derived-total readout (the focus)
//     → Remarks card           optional note
//     → docked footer commit   live opening-cash readout + Start Session / Cancel
//
// One DERIVED opening-cash value feeds everything: it is sourced from EITHER the
// single-total input OR cashTotal(counts) — never both — and switching the
// method re-derives it from the now-active source. The figure shown in the
// opening-cash card and pinned in the docked footer is always the same number.
//
// Named states (all reachable): initial-probe (on mount) · already-open variant
// (via a discreet preview control) · form · single-total method · count-drawer
// method · submitting · error. House context: Bizak Nepal, NPR.
// ════════════════════════════════════════════════════════════════════════════

// ── seed data (kept consistent with the sibling terminal's SESSION) ──
const COUNTER = "Counter 01 · Front Desk"; // inherited from POS setup; "" ⇒ none
const OPEN_SESSION = { id: "POS-0614-03", counter: COUNTER }; // the already-open fake

type Shift = { id: string; name: string; window: string };
const SHIFTS: Shift[] = [
  { id: "morning", name: "Morning", window: "08:00–16:00" },
  { id: "day", name: "Day", window: "10:00–18:00" },
  { id: "evening", name: "Evening", window: "16:00–23:00" },
];
const NO_SHIFT = { id: "__none", label: "No shift" } as const;

// auto-select rule: when EXACTLY ONE active shift exists, preselect it.
function initialShiftId(): string | null {
  return SHIFTS.length === 1 ? SHIFTS[0].id : null;
}

const SHIFT_OPTS = [
  ...SHIFTS.map((s) => ({ id: s.id, label: `${s.name} · ${s.window}`, sub: "Active shift" })),
  { id: NO_SHIFT.id, label: NO_SHIFT.label },
];

type CashMethod = "single" | "count";
type GateState = "probing" | "form" | "already-open";
type Phase = "ready" | "submitting" | "error";

// ════════════════════════════════════════════════════════════════════════════
// LOCAL ATOMS
// ════════════════════════════════════════════════════════════════════════════

/** Card shell — the calm, elevated surface every section sits on. */
function Card({
  title,
  icon: Icon,
  aside,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-bz-lg border border-bz-line-soft bg-bz-surface", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 gap-y-2 border-b border-bz-line-soft px-4 py-3 md:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
            <Icon size={14} />
          </span>
          <SectionLabel>{title}</SectionLabel>
        </div>
        {aside}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

/** Read-only reference field — inert, styled as inherited context. */
function ReadOnlyField({ value }: { value: string }) {
  const has = value.trim().length > 0;
  return (
    <div className="flex h-9 w-full items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
      <Hash size={13} className="shrink-0 text-bz-text-soft" />
      <span className={cn("min-w-0 flex-1 truncate text-[13px]", has ? "text-bz-text-muted" : "text-bz-text-soft")}>
        {has ? value : "Nothing selected"}
      </span>
      <Lock size={12} className="shrink-0 text-bz-text-soft" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GATE: INITIAL PROBE  (transient busy state on mount)
// ════════════════════════════════════════════════════════════════════════════

function ProbeCard() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted">
          <Spinner size={20} className="text-bz-fire" />
        </span>
        <div>
          <p className="text-[14px] font-semibold tracking-tight text-bz-text">Checking for an open session…</p>
          <p className="mt-1 text-[12px] text-bz-text-muted">Confirming this till is free before you begin.</p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GATE: ALREADY OPEN  (calm — a session is already live on this counter)
// ════════════════════════════════════════════════════════════════════════════

function AlreadyOpenCard({ onGo, onBack }: { onGo: () => void; onBack: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-[480px] rounded-bz-lg border border-bz-line-soft bg-bz-surface p-6 text-center md:p-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18] text-bz-text">
          <ScanLine size={20} />
        </span>
        <h2 className="mt-4 text-[18px] font-semibold tracking-tight text-bz-text">A session is already open</h2>
        <p className="mx-auto mt-1.5 max-w-[340px] text-[12.5px] leading-relaxed text-bz-text-muted">
          This counter already has a live till. Pick up where it left off, or close it from the terminal before starting a
          new one.
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/60 px-4 py-3 text-left">
          <div className="min-w-0">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Open session</p>
            <p className={cn("mt-0.5 truncate text-[14px] font-semibold tracking-tight text-bz-text", NUM)}>{OPEN_SESSION.id}</p>
          </div>
          <span className="shrink-0 rounded-bz-sm bg-bz-surface px-2 py-1 text-[11px] font-medium text-bz-text-muted">
            {OPEN_SESSION.counter}
          </span>
        </div>

        <button onClick={onGo} className={cn(PRIMARY_BTN, "mt-5 w-full")}>
          <ArrowRight size={14} /> Go to terminal
        </button>
        <button
          onClick={onBack}
          className="mt-2 inline-flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"
        >
          Start a different session instead
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED FOOTER  (overlay slot — the commit stays pinned while the form scrolls)
// ════════════════════════════════════════════════════════════════════════════

function CommitBar({
  openingCash,
  phase,
  onStart,
  onCancel,
}: {
  openingCash: number;
  phase: Phase;
  onStart: () => void;
  onCancel: () => void;
}) {
  const busy = phase === "submitting";
  return (
    <div className="flex items-center justify-between gap-4 border-t border-bz-line bg-bz-paper px-4 py-3 md:px-6">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">Opening cash</p>
        <Money n={openingCash} dp={0} className="text-[20px] font-semibold leading-tight text-bz-text" symbolClassName="text-[11px]" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={onCancel} disabled={busy} className={cn(GHOST_BTN, "h-9")}>
          <X size={14} /> <span className="hidden sm:inline">Cancel</span>
        </button>
        <button onClick={onStart} disabled={busy} className={cn(PRIMARY_BTN, "h-9 px-4")}>
          {busy ? <Spinner size={14} /> : <Power size={14} />}
          {busy ? "Starting…" : "Start session"}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function PosSessionStartDesignPage() {
  const navigate = useNavigate();
  const { toast, show, clear } = useToast();

  const [gate, setGate] = React.useState<GateState>("probing");
  const [phase, setPhase] = React.useState<Phase>("ready");

  // form state
  const [shiftId, setShiftId] = React.useState<string | null>(initialShiftId);
  const [method, setMethod] = React.useState<CashMethod>("single");
  const [directCash, setDirectCash] = React.useState<number | undefined>(undefined);
  const [counts, setCounts] = React.useState<CashCounts>(emptyCounts);
  const [remarks, setRemarks] = React.useState("");

  // demo affordances: exercise the failure path on submit, and the
  // "counter not configured" fallback (counter is otherwise inherited).
  const [failMode, setFailMode] = React.useState(false);
  const [noCounter, setNoCounter] = React.useState(false);

  // ── the single DERIVED opening-cash value (active source only) ──
  const openingCash = React.useMemo(
    () => (method === "single" ? directCash ?? 0 : cashTotal(counts)),
    [method, directCash, counts],
  );

  // ── initial probe: resolve to the FORM after ~800ms ──
  React.useEffect(() => {
    const t = window.setTimeout(() => setGate("form"), 800);
    return () => window.clearTimeout(t);
  }, []);

  const shiftOpt = SHIFT_OPTS.find((o) => o.id === shiftId) ?? null;

  const onStart = () => {
    if (phase === "submitting") return;
    if (!Number.isFinite(openingCash) || openingCash < 0) {
      show("error", "Opening cash must be zero or more.");
      return;
    }
    setPhase("submitting");
    window.setTimeout(() => {
      if (failMode) {
        setPhase("error");
        show("error", "Couldn't open the till — the counter is locked by another device. Try again.");
        return;
      }
      setPhase("ready");
      show("success", "Session started · routing to the terminal…");
      window.setTimeout(() => navigate("/design/pos-terminal"), 700);
    }, 900);
  };

  const onCancel = () => {
    if (phase === "submitting") return;
    navigate("/design/pos-setup");
  };

  const breadcrumb = (
    <>
      <span className="text-bz-text-muted">Point of Sale</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Start Session</span>
    </>
  );

  // probe + already-open are full-bleed gates — no docked footer.
  if (gate !== "form") {
    return (
      <AppShell breadcrumb={breadcrumb} overlay={<Toast toast={toast} onDismiss={clear} />}>
        {gate === "probing" ? (
          <ProbeCard />
        ) : (
          <AlreadyOpenCard onGo={() => navigate("/design/pos-terminal")} onBack={() => setGate("form")} />
        )}
      </AppShell>
    );
  }

  const busy = phase === "submitting";

  return (
    <AppShell
      breadcrumb={breadcrumb}
      overlay={
        <>
          <CommitBar openingCash={openingCash} phase={phase} onStart={onStart} onCancel={onCancel} />
          <Toast toast={toast} onDismiss={clear} />
        </>
      }
    >
      {/* ── header band ── */}
      <header className="border-b border-bz-line bg-bz-paper px-4 py-5 md:px-6">
        <div className="mx-auto flex max-w-[600px] items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-fire">
            <ScanLine size={18} />
          </span>
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold tracking-tight text-bz-text md:text-[22px]">Start POS session</h1>
            <p className="mt-0.5 text-[12.5px] text-bz-text-muted">
              Enter the opening cash for this till, then start ringing up sales.
            </p>
          </div>
        </div>
      </header>

      {/* ── centred single column ── */}
      <div className="mx-auto w-full max-w-[600px] px-4 pb-32 pt-5 md:px-6">
        <div className="flex flex-col gap-4">
          {/* ── session context ── */}
          <Card title="Session context" icon={Store}>
            <div className="flex flex-col gap-4">
              <Field label="Counter" hint="Inherited from POS setup · optional">
                <ReadOnlyField value={noCounter ? "" : COUNTER} />
              </Field>
              <Field label="Shift" hint="Optional">
                <Select
                  value={shiftOpt}
                  onChange={(o) => setShiftId(o.id)}
                  options={SHIFT_OPTS}
                  placeholder="Select a shift…"
                  icon={Clock}
                />
              </Field>
            </div>
          </Card>

          {/* ── opening cash (the focus) ── */}
          <Card
            title="Opening cash"
            icon={Wallet}
            aside={
              <Segmented<CashMethod>
                value={method}
                onChange={setMethod}
                size="sm"
                options={[
                  { id: "single", label: "Single total", icon: Coins },
                  { id: "count", label: "Count drawer", icon: Calculator },
                ]}
              />
            }
          >
            {/* the active cash control — exactly one present at a time */}
            {method === "single" ? (
              <Field label="Total opening cash" required hint="Cash in the drawer at open">
                <NumberInput
                  value={directCash}
                  onChange={setDirectCash}
                  placeholder="0"
                  prefix={CURRENCY}
                  min={0}
                />
              </Field>
            ) : (
              <div>
                <p className="mb-2 text-[11px] text-bz-text-muted">Count the drawer by denomination — the total updates live.</p>
                <CashCount counts={counts} onChange={setCounts} />
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-bz-text-soft">
                  <Info size={12} className="shrink-0" />
                  <span>
                    <span className={cn("font-medium text-bz-text-muted", NUM)}>{fmt0(countedPieces(counts))}</span> notes & coins
                    counted.
                  </span>
                </p>
              </div>
            )}

            {/* the prominent live derived readout — reconciles with the active method */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-bz-md border border-bz-line bg-bz-paper-warm/60 px-4 py-3">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">
                <Coins size={13} className="text-bz-leaf-deep" /> Opening cash
              </span>
              <Money n={openingCash} dp={0} className="text-[20px] font-semibold text-bz-text" symbolClassName="text-[11px]" />
            </div>
          </Card>

          {/* ── remarks ── */}
          <Card title="Remarks" icon={MessageSquare}>
            <Field label="Note" hint="Optional">
              <Textarea
                value={remarks}
                onChange={setRemarks}
                rows={3}
                placeholder="Anything worth noting about this session — short float, handover, etc."
              />
            </Field>
          </Card>

          {/* ── error notice (failure path) ── */}
          {phase === "error" && (
            <div role="alert" className="flex items-start gap-2.5 rounded-bz-md border border-[#E7B9B3] bg-[#FBE7E5] px-4 py-3">
              <Power size={14} className="mt-0.5 shrink-0 text-[#9A2E29]" />
              <p className="text-[12px] leading-relaxed text-[#9A2E29]">
                The till didn't open — the counter is locked by another device. Resolve the lock, then start again.
              </p>
            </div>
          )}

          {/* ── discreet reviewer controls (reachability of hidden states) ── */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-1 text-center">
            <button
              onClick={() => setGate("already-open")}
              disabled={busy}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-bz-text-soft hover:text-bz-text-muted disabled:opacity-40"
            >
              Preview: a session is already open <ArrowRight size={11} />
            </button>
            <span className="hidden text-bz-line sm:inline">·</span>
            <button
              onClick={() => setNoCounter((v) => !v)}
              disabled={busy}
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium hover:text-bz-text-muted disabled:opacity-40",
                noCounter ? "text-bz-text-muted" : "text-bz-text-soft",
              )}
            >
              Preview: counter not configured {noCounter ? "(on)" : "(off)"}
            </button>
            <span className="hidden text-bz-line sm:inline">·</span>
            <button
              onClick={() => setFailMode((v) => !v)}
              disabled={busy}
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium hover:text-bz-text-muted disabled:opacity-40",
                failMode ? "text-[#9A2E29]" : "text-bz-text-soft",
              )}
            >
              Preview: make the next start fail {failMode ? "(on)" : "(off)"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
