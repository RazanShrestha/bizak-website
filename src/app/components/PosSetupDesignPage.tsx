import * as React from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  X,
  LogOut,
  Building2,
  UserRound,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  Warehouse,
  MonitorSmartphone,
  LayoutDashboard,
  Rocket,
  Sparkles,
  CircleHelp,
  ArrowRight,
  RefreshCw,
  Zap,
  Receipt,
  Percent,
  Phone,
  MapPin,
  CircleSlash,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";
import {
  NUM,
  CURRENCY,
  StatusChip,
  SectionLabel,
  Toast,
  useToast,
  PRIMARY_BTN,
  GHOST_BTN,
  SUBTLE_BTN,
  Spinner,
  Kbd,
} from "./PosKit";

// ════════════════════════════════════════════════════════════════════════════
// POS · SETUP  (the guided gate before the terminal opens)
//
// Primary action = make the required choices and LAUNCH the session into the
// terminal. That commit is the centre of gravity: obviously primary, gated on
// three choices (Customer · Payment · Stock location), and always reachable from
// the docked footer.
//
// The page is a GATED, AUTO-ADVANCING multi-phase wizard:
//   Organisation → Customer → Payment method → Stock location → Counter → Display
// Required: Customer, Payment, Stock location. Optional & auto-skipped: org (one
// org), counter (no counters). Selecting a required item auto-advances; jumping
// or committing with a required gap surfaces a toast and routes back. Every
// instance of the commit (rail + footer + "use defaults") shares one gate.
//
// House context: Bizak Nepal · NPR (CURRENCY "Rs"). The reference data below is
// the same retail/trade world the sibling POS screens ring up against.
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA  (Bizak Nepal · NPR)
// ════════════════════════════════════════════════════════════════════════════

type Org = { id: string; name: string; code: string; place: string };
type Customer = { id: string; name: string; phone: string; address: string; walkIn?: boolean };
type Payment = { id: string; name: string; detail: string };
type Warehouse = { id: string; name: string; address: string };
type Counter = { id: string; name: string; lane: string };
type Layout = { id: string; name: string; desc: string; schematic: "split" | "grid" | "compact" };

const ORGS: Org[] = [
  { id: "NP-01", name: "Bizak Nepal", code: "NP-01", place: "Kathmandu · HQ" },
  { id: "NP-02", name: "Bizak Nepal Pokhara", code: "NP-02", place: "Pokhara · Branch" },
];

const CUSTOMERS: Customer[] = [
  { id: "WALK-IN", name: "Walk-in customer", phone: "—", address: "No member attached", walkIn: true },
  { id: "M-2041", name: "Sunita Rai", phone: "+977 98510 22041", address: "Baluwatar, Kathmandu" },
  { id: "M-2088", name: "Bikash Shrestha", phone: "+977 98410 55088", address: "Pulchowk, Lalitpur" },
  { id: "M-2102", name: "Anita Gurung", phone: "+977 98010 71102", address: "Lakeside, Pokhara" },
  { id: "M-2150", name: "Ramesh Thapa", phone: "+977 98610 09150", address: "Dharan, Sunsari" },
  { id: "M-2173", name: "Pooja Maharjan", phone: "+977 98450 33173", address: "Kirtipur, Kathmandu" },
];

const PAYMENTS: Payment[] = [
  { id: "PM-CASH", name: "Cash", detail: "Counter drawer · opening float required" },
  { id: "PM-CARD", name: "Card", detail: "Visa · Mastercard · domestic POS terminal" },
  { id: "PM-WALLET", name: "Mobile Wallet", detail: "eSewa · Khalti · IME Pay" },
  { id: "PM-BANK", name: "Bank Transfer", detail: "connectIPS · fund transfer reference" },
  { id: "PM-CREDIT", name: "Store Credit", detail: "Member balance · ledger settle" },
];

const WAREHOUSES: Warehouse[] = [
  { id: "WH-KTM", name: "Kathmandu Warehouse", address: "Balaju Industrial Area, Kathmandu" },
  { id: "WH-LAL", name: "Lalitpur Store", address: "Pulchowk Road, Lalitpur" },
  { id: "WH-PKR", name: "Pokhara Warehouse 02", address: "Birauta, Pokhara" },
  { id: "WH-BRT", name: "Biratnagar Depot", address: "Main Road, Biratnagar" },
];

const COUNTERS: Counter[] = [
  { id: "CT-01", name: "Counter 01", lane: "Front Desk · main till" },
  { id: "CT-02", name: "Counter 02", lane: "Express · ≤ 5 items" },
  { id: "CT-03", name: "Counter 03", lane: "Wholesale · trade billing" },
];

const LAYOUTS: Layout[] = [
  { id: "LO-SPLIT", name: "Classic split", desc: "Cart on the left, item search & money rail on the right.", schematic: "split" },
  { id: "LO-GRID", name: "Grid-first", desc: "Tap-to-add product grid up front for fast walk-in counters.", schematic: "grid" },
  { id: "LO-COMPACT", name: "Compact", desc: "Single dense column — best on small or tablet displays.", schematic: "compact" },
];

// preset admin defaults — seeded true; toggle to exercise the no-defaults path.
const HAS_ADMIN_DEFAULTS = true;
const PRESET = { currencyLabel: `${CURRENCY} · Nepalese Rupee`, taxLabel: "VAT · 13%" };

// derive a payment glyph from the method name (data-driven, no per-row config)
function paymentGlyph(name: string): React.ComponentType<{ size?: number; className?: string }> {
  const n = name.toLowerCase();
  if (n.includes("cash")) return Banknote;
  if (n.includes("card")) return CreditCard;
  if (n.includes("wallet") || n.includes("mobile")) return Smartphone;
  if (n.includes("bank")) return Landmark;
  return Wallet;
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE MODEL
// ════════════════════════════════════════════════════════════════════════════

type PhaseId = "org" | "customer" | "payment" | "warehouse" | "counter" | "display";

type PhaseDef = {
  id: PhaseId;
  node: string; // short label on the progress node
  title: string;
  subtitle: string;
  required: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const PHASES: PhaseDef[] = [
  { id: "org", node: "Org", title: "Choose organisation", subtitle: "Which entity this session bills under.", required: false, icon: Building2 },
  { id: "customer", node: "Customer", title: "Default customer", subtitle: "The party attached to new sales — change it any time at the till.", required: true, icon: UserRound },
  { id: "payment", node: "Payment", title: "Default payment method", subtitle: "How this counter collects by default.", required: true, icon: Wallet },
  { id: "warehouse", node: "Stock", title: "Stock location", subtitle: "Where this session draws inventory from.", required: true, icon: Warehouse },
  { id: "counter", node: "Counter", title: "Counter / till", subtitle: "Optional — pick the physical lane this session runs on.", required: false, icon: MonitorSmartphone },
  { id: "display", node: "Display", title: "Display layout", subtitle: "How the terminal arranges the till. Optional — a default is set.", required: false, icon: LayoutDashboard },
];

// ════════════════════════════════════════════════════════════════════════════
// LOCAL ATOMS
// ════════════════════════════════════════════════════════════════════════════

/** A selectable record row — label + optional secondary line, selected & glyph states. */
function PickRow({
  selected,
  onClick,
  glyph,
  glyphTone = "muted",
  title,
  detail,
  rightSlot,
}: {
  selected: boolean;
  onClick: () => void;
  glyph: React.ReactNode;
  glyphTone?: "muted" | "selected";
  title: React.ReactNode;
  detail?: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-bz-md border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-bz-text bg-bz-fire/[0.08]"
          : "border-bz-line-soft bg-bz-surface hover:border-bz-line hover:bg-bz-paper-warm/50",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-bz-md",
          selected || glyphTone === "selected" ? "bg-bz-deep text-bz-fire" : "bg-bz-paper-warm text-bz-text-muted",
        )}
      >
        {glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-bz-text">{title}</span>
        {detail && <span className={cn("mt-0.5 block truncate text-[11px] text-bz-text-soft", NUM)}>{detail}</span>}
      </span>
      {rightSlot}
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-bz-pill border transition-colors",
          selected ? "border-bz-leaf-deep bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface text-transparent",
        )}
      >
        <Check size={13} strokeWidth={3} />
      </span>
    </button>
  );
}

/** Picker shell: loading spinner · empty/no-results · the row list. */
function PickerBody({
  loading,
  empty,
  emptyLabel,
  children,
}: {
  loading: boolean;
  empty: boolean;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-bz-text-muted">
        <Spinner size={15} className="text-bz-fire" />
        <span className="text-[12.5px]">Loading…</span>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
          <CircleSlash size={20} />
        </span>
        <p className="text-[12.5px] font-medium text-bz-text-muted">{emptyLabel}</p>
      </div>
    );
  }
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

/** The confirmation hint that appears under a phase once its choice is set. */
function PhaseConfirm({ value }: { value: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-bz-md border border-bz-leaf-deep/40 bg-bz-fire/[0.07] px-3 py-2.5">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire text-bz-olive">
        <Check size={12} strokeWidth={3} />
      </span>
      <p className="text-[12px] text-bz-text">
        <span className="font-semibold">{value}</span> selected.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROGRESS INDICATOR  (discrete nodes · continuous fill · guarded jumps)
// ════════════════════════════════════════════════════════════════════════════

function PhaseProgress({
  phases,
  activeId,
  isComplete,
  onJump,
}: {
  phases: PhaseDef[];
  activeId: PhaseId;
  isComplete: (id: PhaseId) => boolean;
  onJump: (id: PhaseId) => void;
}) {
  const activeIdx = phases.findIndex((p) => p.id === activeId);
  // fill spans the centres of the first → active node
  const pct = phases.length > 1 ? (activeIdx / (phases.length - 1)) * 100 : 0;

  return (
    <div className="border-b border-bz-line bg-bz-paper px-4 py-4 md:px-6">
      <div className="relative mx-auto max-w-3xl">
        {/* track */}
        <div className="absolute left-0 right-0 top-[15px] mx-[15px]">
          <div className="h-[3px] rounded-bz-pill bg-bz-line-soft" />
          <div
            className="absolute left-0 top-0 h-[3px] rounded-bz-pill bg-bz-fire transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ol className="relative flex items-start justify-between">
          {phases.map((p, i) => {
            const done = isComplete(p.id);
            const current = p.id === activeId;
            const upcoming = !done && !current;
            return (
              <li key={p.id} className="flex min-w-0 flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onJump(p.id)}
                  aria-label={`Go to ${p.node}`}
                  className={cn(
                    "relative z-10 flex size-[30px] items-center justify-center rounded-bz-pill border-2 transition-colors",
                    done && "border-bz-leaf-deep bg-bz-fire text-bz-olive",
                    current && "border-bz-deep bg-bz-deep text-bz-fire shadow-[0_0_0_4px_rgba(211,249,105,0.35)]",
                    upcoming && "border-bz-line bg-bz-surface text-bz-text-soft hover:border-bz-text",
                  )}
                >
                  {done ? (
                    <Check size={15} strokeWidth={3} />
                  ) : (
                    <span className={cn("text-[12px] font-semibold", NUM)}>{i + 1}</span>
                  )}
                </button>
                <span
                  className={cn(
                    "max-w-[64px] truncate text-center text-[10.5px] font-medium md:max-w-none",
                    current ? "text-bz-text" : done ? "text-bz-text-muted" : "text-bz-text-soft",
                  )}
                >
                  {p.node}
                  {p.required && <span className="ml-0.5 text-bz-leaf-deep">*</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DISPLAY-LAYOUT SCHEMATIC  (flat wireframe preview — no gradients)
// ════════════════════════════════════════════════════════════════════════════

function LayoutSchematic({ kind, active }: { kind: Layout["schematic"]; active: boolean }) {
  const cell = active ? "bg-bz-fire/[0.35] border-bz-leaf-deep/50" : "bg-bz-paper-warm border-bz-line-soft";
  const box = (cls: string) => <div className={cn("rounded-[3px] border", cell, cls)} />;
  return (
    <div className={cn("h-[58px] w-full rounded-bz-sm border p-1.5", active ? "border-bz-leaf-deep/40 bg-bz-fire/[0.05]" : "border-bz-line-soft bg-bz-surface")}>
      {kind === "split" && (
        <div className="flex h-full gap-1">
          {box("flex-[1.4]")}
          <div className="flex flex-[1] flex-col gap-1">
            {box("flex-1")}
            {box("flex-1")}
          </div>
        </div>
      )}
      {kind === "grid" && (
        <div className="grid h-full grid-cols-3 grid-rows-2 gap-1">
          {box("")}
          {box("")}
          {box("")}
          {box("")}
          {box("")}
          {box("")}
        </div>
      )}
      {kind === "compact" && (
        <div className="flex h-full flex-col gap-1">
          {box("flex-1")}
          {box("flex-1")}
          {box("flex-1")}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY RAIL  (live selection summary · defaults notice · org switch · support)
// ════════════════════════════════════════════════════════════════════════════

function SummaryLine({
  label,
  value,
  active,
  placeholder,
}: {
  label: string;
  value?: string;
  active: boolean;
  placeholder: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-[11.5px] text-bz-text-muted">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5">
        {active ? (
          <Check size={12} className="shrink-0 text-bz-leaf-deep" />
        ) : (
          <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-line" />
        )}
        <span
          className={cn(
            "truncate text-right text-[12px]",
            active ? "font-medium text-bz-text" : "text-bz-text-soft",
          )}
        >
          {active ? value : placeholder}
        </span>
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function PosSetupDesignPage() {
  const navigate = useNavigate();
  const { toast, show, clear } = useToast();

  // org auto-resolves when there is exactly one; here there are two, so the
  // org phase + the inline switcher are both exercised.
  const singleOrg = ORGS.length === 1;
  const noCounters = COUNTERS.length === 0;

  // visible phases (org hidden with one org; counter hidden with no counters)
  const phases = React.useMemo(
    () => PHASES.filter((p) => (p.id === "org" ? !singleOrg : p.id === "counter" ? !noCounters : true)),
    [singleOrg, noCounters],
  );

  // ── selections ──
  const [org, setOrg] = React.useState<Org | null>(singleOrg ? ORGS[0] : null);
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [payment, setPayment] = React.useState<Payment | null>(null);
  const [warehouse, setWarehouse] = React.useState<Warehouse | null>(null);
  const [counter, setCounter] = React.useState<Counter | null>(null);
  const [layout, setLayout] = React.useState<Layout>(LAYOUTS[0]); // a default is set

  const [activeId, setActiveId] = React.useState<PhaseId>(phases[0].id);

  // ── initial probe overlay (~900ms, "checking for admin defaults") ──
  const [probing, setProbing] = React.useState(true);
  React.useEffect(() => {
    const t = window.setTimeout(() => setProbing(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  // ── per-phase picker loading (a short fetch each time a phase opens) ──
  const [pickLoading, setPickLoading] = React.useState(false);
  React.useEffect(() => {
    if (probing) return;
    setPickLoading(true);
    const t = window.setTimeout(() => setPickLoading(false), 360);
    return () => window.clearTimeout(t);
  }, [activeId, probing]);

  // ── customer debounced search ──
  const [custQuery, setCustQuery] = React.useState("");
  const [custSearching, setCustSearching] = React.useState(false);
  const [custTerm, setCustTerm] = React.useState("");
  React.useEffect(() => {
    const raw = custQuery.trim();
    if (raw.length < 2) {
      setCustTerm("");
      setCustSearching(false);
      return;
    }
    setCustSearching(true);
    const t = window.setTimeout(() => {
      setCustTerm(raw.toLowerCase());
      setCustSearching(false);
    }, 300);
    return () => window.clearTimeout(t);
  }, [custQuery]);

  const customerRows = React.useMemo(() => {
    if (!custTerm) return CUSTOMERS;
    return CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(custTerm) ||
        c.phone.toLowerCase().includes(custTerm) ||
        c.id.toLowerCase().includes(custTerm) ||
        c.address.toLowerCase().includes(custTerm),
    );
  }, [custTerm]);

  // ── submitting ──
  const [submitting, setSubmitting] = React.useState(false);

  // ── derived gating ──
  const requiredReady = !!customer && !!payment && !!warehouse;
  const isComplete = React.useCallback(
    (id: PhaseId): boolean => {
      switch (id) {
        case "org":
          return !!org;
        case "customer":
          return !!customer;
        case "payment":
          return !!payment;
        case "warehouse":
          return !!warehouse;
        case "counter":
          return !!counter;
        case "display":
          return !!layout;
      }
    },
    [org, customer, payment, warehouse, counter, layout],
  );

  // required choices that must exist before reaching a given phase index
  const priorRequiredMet = React.useCallback(
    (targetIdx: number): { ok: boolean; gap?: PhaseId } => {
      for (let i = 0; i < targetIdx; i++) {
        const p = phases[i];
        if (p.required && !isComplete(p.id)) return { ok: false, gap: p.id };
      }
      return { ok: true };
    },
    [phases, isComplete],
  );

  const activeIdx = phases.findIndex((p) => p.id === activeId);
  const activePhase = phases[activeIdx];

  const goToPhase = (id: PhaseId) => {
    setCustQuery("");
    setActiveId(id);
  };

  // guarded jump from a progress node
  const onJump = (id: PhaseId) => {
    const idx = phases.findIndex((p) => p.id === id);
    if (idx <= activeIdx) {
      goToPhase(id);
      return;
    }
    const gate = priorRequiredMet(idx);
    if (!gate.ok && gate.gap) {
      const gapPhase = PHASES.find((p) => p.id === gate.gap)!;
      show("error", `Choose a ${gapPhase.node.toLowerCase()} first — it's required.`);
      goToPhase(gate.gap);
      return;
    }
    goToPhase(id);
  };

  // advance to the next phase, skipping the counter phase when no counters
  const nextPhase = () => {
    const next = phases[activeIdx + 1];
    if (next) goToPhase(next.id);
  };
  const prevPhase = () => {
    const prev = phases[activeIdx - 1];
    if (prev) goToPhase(prev.id);
  };

  // required selections auto-advance; counter & display do not
  const selectCustomer = (c: Customer) => {
    setCustomer(c);
    setCustQuery("");
    nextPhase();
  };
  const selectPayment = (p: Payment) => {
    setPayment(p);
    nextPhase();
  };
  const selectWarehouse = (w: Warehouse) => {
    setWarehouse(w);
    nextPhase();
  };

  // ── the single commit (shared by rail · footer · use-defaults) ──
  // Accepts an optional override so the one-tap "use defaults" path can commit
  // with selections it sets in the same tick (React state isn't flushed yet).
  const launch = (
    viaDefaults = false,
    override?: { customer: Customer; payment: Payment; warehouse: Warehouse },
  ) => {
    if (submitting) return;
    const c = override?.customer ?? customer;
    const p = override?.payment ?? payment;
    const w = override?.warehouse ?? warehouse;
    if (!c || !p || !w) {
      const gap = !c ? "customer" : !p ? "payment" : "warehouse";
      const gapPhase = PHASES.find((ph) => ph.id === gap)!;
      show("error", `${gapPhase.node} is required before launching.`);
      goToPhase(gap as PhaseId);
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      show("success", viaDefaults ? "Defaults applied · launching terminal…" : "Session ready · launching terminal…");
      window.setTimeout(() => navigate("/design/pos-terminal"), 700);
    }, 900);
  };

  // one-tap: apply preset defaults (walk-in + cash + primary warehouse) & launch
  const useDefaultsAndSkip = () => {
    const c = CUSTOMERS[0], p = PAYMENTS[0], w = WAREHOUSES[0];
    setCustomer(c);
    setPayment(p);
    setWarehouse(w);
    launch(true, { customer: c, payment: p, warehouse: w });
  };

  const exitSetup = () => {
    show("info", "Setup exited — returning to terminal.");
    window.setTimeout(() => navigate("/design/pos-terminal"), 700);
  };

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Point of Sale</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Setup</span>
        </>
      }
      overlay={
        <>
          <LaunchFooter
            ready={requiredReady}
            submitting={submitting}
            layoutName={layout.name}
            onLaunch={() => launch(false)}
          />
          <Toast toast={toast} onDismiss={clear} />
        </>
      }
    >
      {/* ── component 1 · initial-probe blocking overlay ── */}
      {probing && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-bz-section-b/80 backdrop-blur-[1px]">
          <Spinner size={22} className="text-bz-fire" />
          <p className="text-[12.5px] font-medium text-bz-text-muted">Checking for admin defaults…</p>
        </div>
      )}

      {/* ── header band ── */}
      <header className="border-b border-bz-line bg-bz-paper px-4 py-3.5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-fire">
              <Rocket size={17} />
            </span>
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight text-bz-text">Set up POS session</h1>
              <p className="text-[12px] text-bz-text-muted">
                Confirm the till's defaults, then launch the terminal. Required choices are marked
                <span className="ml-1 text-bz-leaf-deep">*</span>.
              </p>
            </div>
          </div>
          {/* ── component 2 · exit setup ── */}
          <button onClick={exitSetup} className={cn(GHOST_BTN, "h-8")}>
            <LogOut size={14} /> Exit setup
          </button>
        </div>
      </header>

      {/* ── component 5 · phase-progress indicator ── */}
      <PhaseProgress phases={phases} activeId={activeId} isComplete={isComplete} onJump={onJump} />

      {/* ── two-column body ── */}
      <div className="grid grid-cols-1 gap-4 px-4 pb-28 pt-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── left · active phase ── */}
        <section className="min-w-0">
          <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 md:p-5">
            {/* phase heading */}
            <div className="mb-4 flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text">
                <activePhase.icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold tracking-tight text-bz-text">{activePhase.title}</h2>
                  {activePhase.required ? (
                    <StatusChip label="Required" tone="positive" dot={false} />
                  ) : (
                    <StatusChip label="Optional" tone="pending" dot={false} />
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-bz-text-muted">{activePhase.subtitle}</p>
              </div>
              <span className={cn("hidden shrink-0 text-[11px] font-medium text-bz-text-soft sm:block", NUM)}>
                Step {activeIdx + 1} / {phases.length}
              </span>
            </div>

            {/* ── component 7 · customer search (only on customer phase) ── */}
            {activeId === "customer" && (
              <div className="mb-3 flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
                <Search size={14} className="shrink-0 text-bz-text-muted" />
                <input
                  value={custQuery}
                  onChange={(e) => setCustQuery(e.target.value)}
                  placeholder="Search by name, member ID, phone or address…"
                  className="flex-1 bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-muted"
                />
                {custSearching ? (
                  <Spinner size={13} className="text-bz-fire" />
                ) : custQuery ? (
                  <button
                    onClick={() => setCustQuery("")}
                    aria-label="Clear search"
                    className="flex size-5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/40"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <span className="text-[10px] text-bz-text-soft">≥ 2 chars</span>
                )}
              </div>
            )}

            {/* ── component 6 · the record picker, per phase ── */}
            <div className="min-h-[180px]">
              {activeId === "org" && (
                <PickerBody loading={pickLoading} empty={ORGS.length === 0} emptyLabel="No organisations available.">
                  {ORGS.map((o) => (
                    <PickRow
                      key={o.id}
                      selected={org?.id === o.id}
                      onClick={() => {
                        setOrg(o);
                        nextPhase();
                      }}
                      glyph={<Building2 size={16} />}
                      title={o.name}
                      detail={`${o.code} · ${o.place}`}
                    />
                  ))}
                </PickerBody>
              )}

              {activeId === "customer" && (
                <PickerBody
                  loading={pickLoading || custSearching}
                  empty={customerRows.length === 0}
                  emptyLabel={`No members match “${custQuery.trim()}”.`}
                >
                  {customerRows.map((c) => (
                    <PickRow
                      key={c.id}
                      selected={customer?.id === c.id}
                      onClick={() => selectCustomer(c)}
                      glyph={<UserRound size={16} />}
                      title={
                        <span className="flex items-center gap-2">
                          {c.name}
                          {c.walkIn && (
                            <span className="rounded-bz-sm bg-bz-leaf/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-bz-text">
                              Default
                            </span>
                          )}
                        </span>
                      }
                      detail={
                        <span className="inline-flex items-center gap-2">
                          {!c.walkIn && (
                            <>
                              <Phone size={10} className="text-bz-text-soft" />
                              {c.phone}
                              <span className="text-bz-line">·</span>
                            </>
                          )}
                          <MapPin size={10} className="text-bz-text-soft" />
                          {c.address}
                        </span>
                      }
                      rightSlot={
                        !c.walkIn ? (
                          <span className={cn("hidden shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted sm:inline-block", NUM)}>
                            {c.id}
                          </span>
                        ) : undefined
                      }
                    />
                  ))}
                </PickerBody>
              )}

              {activeId === "payment" && (
                <PickerBody loading={pickLoading} empty={PAYMENTS.length === 0} emptyLabel="No payment methods configured.">
                  {PAYMENTS.map((p) => {
                    const Glyph = paymentGlyph(p.name);
                    return (
                      <PickRow
                        key={p.id}
                        selected={payment?.id === p.id}
                        onClick={() => selectPayment(p)}
                        glyph={<Glyph size={16} />}
                        title={p.name}
                        detail={p.detail}
                      />
                    );
                  })}
                </PickerBody>
              )}

              {activeId === "warehouse" && (
                <PickerBody loading={pickLoading} empty={WAREHOUSES.length === 0} emptyLabel="No stock locations available.">
                  {WAREHOUSES.map((w) => (
                    <PickRow
                      key={w.id}
                      selected={warehouse?.id === w.id}
                      onClick={() => selectWarehouse(w)}
                      glyph={<Warehouse size={16} />}
                      title={w.name}
                      detail={
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={10} className="text-bz-text-soft" />
                          {w.address}
                        </span>
                      }
                    />
                  ))}
                </PickerBody>
              )}

              {activeId === "counter" && (
                <PickerBody loading={pickLoading} empty={COUNTERS.length === 0} emptyLabel="No counters configured — this step is skipped.">
                  {COUNTERS.map((ct) => (
                    <PickRow
                      key={ct.id}
                      selected={counter?.id === ct.id}
                      onClick={() => setCounter(counter?.id === ct.id ? null : ct)}
                      glyph={<MonitorSmartphone size={16} />}
                      title={ct.name}
                      detail={ct.lane}
                    />
                  ))}
                </PickerBody>
              )}

              {/* ── component 8 · display-layout chooser ── */}
              {activeId === "display" && (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {LAYOUTS.map((lo) => {
                    const active = layout.id === lo.id;
                    return (
                      <button
                        key={lo.id}
                        type="button"
                        onClick={() => setLayout(lo)}
                        className={cn(
                          "flex flex-col gap-2.5 rounded-bz-md border p-3 text-left transition-colors",
                          active ? "border-bz-text bg-bz-fire/[0.06]" : "border-bz-line-soft bg-bz-surface hover:border-bz-line hover:bg-bz-paper-warm/40",
                        )}
                      >
                        <LayoutSchematic kind={lo.schematic} active={active} />
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-semibold text-bz-text">{lo.name}</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-bz-text-muted">{lo.desc}</p>
                          </div>
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-bz-pill border",
                              active ? "border-bz-leaf-deep bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface text-transparent",
                            )}
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* per-phase confirmation hint */}
            {activeId === "org" && org && <PhaseConfirm value={org.name} />}
            {activeId === "customer" && customer && <PhaseConfirm value={customer.name} />}
            {activeId === "payment" && payment && <PhaseConfirm value={payment.name} />}
            {activeId === "warehouse" && warehouse && <PhaseConfirm value={warehouse.name} />}
            {activeId === "counter" && counter && <PhaseConfirm value={`${counter.name} · ${counter.lane}`} />}
            {activeId === "display" && <PhaseConfirm value={layout.name} />}

            {/* ── component 9 · per-phase nav ── */}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-bz-line-soft pt-4">
              <button onClick={prevPhase} disabled={activeIdx === 0} className={cn(SUBTLE_BTN, "h-9")}>
                <ChevronLeft size={14} /> Back
              </button>
              {activeIdx < phases.length - 1 ? (
                <button
                  onClick={nextPhase}
                  disabled={activePhase.required && !isComplete(activePhase.id)}
                  className={cn(PRIMARY_BTN, "h-9")}
                >
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => launch(false)}
                  disabled={!requiredReady || submitting}
                  className={cn(PRIMARY_BTN, "h-9")}
                >
                  {submitting ? <Spinner size={14} className="text-bz-fire" /> : <Rocket size={14} className="text-bz-fire" />}
                  {submitting ? "Launching…" : "Launch terminal"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── right · sticky rail ── */}
        <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <div className="flex flex-col gap-4">
            {/* ── component 10 · inline org context switcher ── */}
            {!singleOrg && org && (
              <div className="flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
                  <Building2 size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">Organisation</p>
                  <p className={cn("truncate text-[12.5px] font-semibold text-bz-text", NUM)}>
                    {org.name} · {org.code}
                  </p>
                </div>
                <button
                  onClick={() => goToPhase("org")}
                  className="shrink-0 text-[11px] font-medium text-bz-text-muted hover:text-bz-text"
                >
                  Change
                </button>
              </div>
            )}

            {/* ── component 4 · preconfigured-defaults notice (only when present & probe done) ── */}
            {HAS_ADMIN_DEFAULTS && !probing && (
              <div className="rounded-bz-lg border border-bz-leaf-deep/40 bg-bz-fire/[0.06] p-3.5">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-bz-leaf-deep" />
                  <SectionLabel className="text-bz-text-muted">Preset defaults found</SectionLabel>
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2 py-1 text-[11px] font-medium text-bz-text">
                    <Receipt size={11} className="text-bz-text-muted" />
                    <span className={NUM}>{PRESET.currencyLabel}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2 py-1 text-[11px] font-medium text-bz-text">
                    <Percent size={11} className="text-bz-text-muted" />
                    <span className={NUM}>{PRESET.taxLabel}</span>
                  </span>
                </div>
                <button onClick={useDefaultsAndSkip} disabled={submitting} className={cn(GHOST_BTN, "h-8 w-full")}>
                  <Zap size={13} className="text-bz-leaf-deep" /> Use defaults & skip
                </button>
              </div>
            )}

            {/* ── component 11 · live selection summary + conditional commit ── */}
            <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
              <div className="mb-1 flex items-center justify-between">
                <SectionLabel>This session</SectionLabel>
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-bz-text-muted">
                  <span className={cn("size-1.5 rounded-bz-pill", requiredReady ? "bg-bz-leaf-deep" : "bg-bz-fire")} />
                  {requiredReady ? "Ready" : "In progress"}
                </span>
              </div>
              <div className="divide-y divide-bz-line-soft/70">
                <SummaryLine label="Client" active={!!customer} value={customer?.name} placeholder="Not selected" />
                <SummaryLine label="Payment" active={!!payment} value={payment?.name} placeholder="Not selected" />
                <SummaryLine label="Stock location" active={!!warehouse} value={warehouse?.name} placeholder="Not selected" />
                <SummaryLine label="Counter" active={!!counter} value={counter?.name} placeholder="Not assigned" />
                <SummaryLine label="Display" active={!!layout} value={layout.name} placeholder="Awaiting choice" />
              </div>

              {/* the commit appears in the rail only once all 3 required choices exist */}
              {requiredReady && (
                <button
                  onClick={() => launch(false)}
                  disabled={submitting}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-bz-md bg-bz-deep px-4 text-[13px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? <Spinner size={15} className="text-bz-fire" /> : <Rocket size={15} className="text-bz-fire" />}
                  {submitting ? "Launching…" : "Launch POS Terminal"}
                </button>
              )}
            </div>

            {/* ── component 12 · static support block ── */}
            <div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/50 p-3.5">
              <div className="mb-1.5 flex items-center gap-2">
                <CircleHelp size={14} className="text-bz-text-muted" />
                <p className="text-[12px] font-semibold text-bz-text">Stuck on a step?</p>
              </div>
              <p className="text-[11px] leading-relaxed text-bz-text-muted">
                Defaults are managed by your administrator under POS settings. We can help you wire a new counter or location.
              </p>
              <button className={cn(SUBTLE_BTN, "mt-2.5 h-8 w-full")}>
                <RefreshCw size={13} /> Request assistance
              </button>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED FOOTER  (overlay slot — always-visible primary commit · component 3)
// ════════════════════════════════════════════════════════════════════════════

function LaunchFooter({
  ready,
  submitting,
  layoutName,
  onLaunch,
}: {
  ready: boolean;
  submitting: boolean;
  layoutName: string;
  onLaunch: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-bz-line bg-bz-paper px-4 py-3 md:px-6">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">
          {ready ? "All required choices set" : "Customer · Payment · Stock location required"}
        </p>
        <p className="mt-0.5 truncate text-[12.5px] text-bz-text-muted">
          {ready ? (
            <span className="text-bz-text">Ready to launch · {layoutName} layout</span>
          ) : (
            "Complete the marked steps to launch the terminal."
          )}
        </p>
      </div>
      <button
        onClick={onLaunch}
        disabled={!ready || submitting}
        className="inline-flex h-12 shrink-0 items-center gap-2 rounded-bz-lg bg-bz-deep px-5 text-[14px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? <Spinner size={17} className="text-bz-fire" /> : <Rocket size={17} className="text-bz-fire" />}
        {submitting ? "Launching…" : "Launch POS Terminal"}
        {!submitting && (
          <span className="hidden items-center gap-1 border-l border-bz-text-on-dark/15 pl-2 text-[11px] font-normal text-bz-text-on-dark-soft sm:inline-flex">
            <Kbd className="border-bz-text-on-dark/20 bg-bz-text-on-dark/10 text-bz-text-on-dark-muted">↵</Kbd>
          </span>
        )}
      </button>
    </div>
  );
}
