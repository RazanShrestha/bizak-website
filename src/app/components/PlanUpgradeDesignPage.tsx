import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  ArrowLeft,
  Check,
  X,
  Plus,
  Minus,
  Loader2,
  Info,
  AlertTriangle,
  Star,
  Sparkles,
  Gift,
  RefreshCcw,
  Users,
  Tag,
  QrCode,
  Smartphone,
  CreditCard,
  Globe,
  Copy,
  CircleCheck,
  CircleX,
  Clock,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// PLAN UPGRADE · (choose → configure → pay → confirmed)
//
// Primary action = turn "I want a different plan" into an ACTIVATED subscription,
// charging only the difference owed after crediting unused time on the current
// plan. One guided progression of mutually-exclusive phases gated by a step
// value; retreating out of payment tears down all in-flight payment state.
//
// Whole-page reactivity: any change to plan / cadence / seats re-prices live;
// entering payment auto-derives a proration credit; the amount owed reflects that
// credit (and any promo); a simulated real-time signal advances the scan dialog,
// the processing overlay and the transition to confirmation. The premium olive
// cards intentionally echo the Subscription Plan builder's review card.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const CURRENCY = "NPR";
const YEARLY_DISCOUNT = 0.17; // longer cadence is cheaper over time

function money(n: number | undefined | null): string {
  const v = n == null || !isFinite(n) ? 0 : n;
  return `${CURRENCY} ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const periodLabel = (cadence: Cadence) => (cadence === "yearly" ? "yr" : "mo");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };

// ════════════════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════════════════

type Cadence = "monthly" | "yearly";
type Plan = {
  id: string; name: string; desc: string; monthly: number; bundledSeats: number; perSeatMonthly: number;
  popular?: boolean; current?: boolean; free?: boolean; features: { label: string; included: boolean }[];
};

const PLANS: Plan[] = [
  { id: "community", name: "Community", desc: "For evaluating Bizak with a single user.", monthly: 0, bundledSeats: 1, perSeatMonthly: 0, free: true,
    features: [{ label: "1 user seat", included: true }, { label: "Core ledger & invoicing", included: true }, { label: "Email support", included: false }, { label: "Advanced reporting", included: false }, { label: "API & integrations", included: false }] },
  { id: "growth", name: "Growth", desc: "Your current plan — the essentials for a growing team.", monthly: 3500, bundledSeats: 3, perSeatMonthly: 500, current: true,
    features: [{ label: "3 user seats", included: true }, { label: "Core ledger & invoicing", included: true }, { label: "Email support", included: true }, { label: "Advanced reporting", included: false }, { label: "API & integrations", included: false }] },
  { id: "pro", name: "Pro", desc: "Priority support, advanced reporting and unlimited workspaces.", monthly: 6500, bundledSeats: 5, perSeatMonthly: 600, popular: true,
    features: [{ label: "5 user seats", included: true }, { label: "Core ledger & invoicing", included: true }, { label: "Priority support", included: true }, { label: "Advanced reporting", included: true }, { label: "API & integrations", included: false }] },
  { id: "scale", name: "Scale", desc: "Everything in Pro plus API access and dedicated success.", monthly: 12000, bundledSeats: 10, perSeatMonthly: 700,
    features: [{ label: "10 user seats", included: true }, { label: "Core ledger & invoicing", included: true }, { label: "Dedicated success manager", included: true }, { label: "Advanced reporting", included: true }, { label: "API & integrations", included: true }] },
];

// current paid period (drives the proration credit)
const CURRENT = { planId: "growth", subscribedAt: "2026-03-01", expiryAt: "2026-08-28", paidAmount: 42000, daysTotal: 180, daysRemaining: 106 };

type Provider = { id: string; name: string; desc: string; scan: boolean; glyph: React.ComponentType<{ size?: number; className?: string }> };
const PROVIDERS: Provider[] = [
  { id: "esewa", name: "eSewa", desc: "Scan with the eSewa app, or pay on the web.", scan: true, glyph: QrCode },
  { id: "khalti", name: "Khalti", desc: "Scan with Khalti, or pay on the web.", scan: true, glyph: Smartphone },
  { id: "stripe", name: "Card / Stripe", desc: "Redirects to a secure card checkout.", scan: false, glyph: CreditCard },
];

function priceOf(plan: Plan, cadence: Cadence, seats: number) {
  const base = cadence === "yearly" ? round2(plan.monthly * 12 * (1 - YEARLY_DISCOUNT)) : plan.monthly;
  const perSeat = cadence === "yearly" ? round2(plan.perSeatMonthly * 12 * (1 - YEARLY_DISCOUNT)) : plan.perSeatMonthly;
  const extra = Math.max(0, seats - plan.bundledSeats);
  const extraCost = round2(extra * perSeat);
  return { base, perSeat, extra, extraCost, total: round2(base + extraCost) };
}
const savingsPct = Math.round(YEARLY_DISCOUNT * 100);

// ════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ════════════════════════════════════════════════════════════════════════════

function PhaseRail({ step }: { step: number }) {
  const phases = ["Choose plan", "Configure", "Payment", "Confirmed"];
  return (
    <div className="flex items-center justify-center">
      <ol className="flex items-center gap-1.5 sm:gap-2.5">
        {phases.map((p, i) => {
          const active = i === step; const done = i < step;
          return (
            <li key={p} className="flex items-center gap-1.5 sm:gap-2.5">
              <span className={cn("flex items-center gap-2 rounded-bz-pill border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                active ? "border-bz-deep bg-bz-deep text-bz-text-on-dark" : done ? "border-bz-fire/50 bg-bz-fire/[0.12] text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-soft")}>
                <span className={cn("flex size-4 items-center justify-center rounded-bz-pill text-[9.5px] font-bold", active ? "bg-bz-fire text-bz-olive" : done ? "bg-bz-fire text-bz-olive" : "bg-bz-paper-warm text-bz-text-soft", NUM)}>
                  {done ? <Check size={10} strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{p}</span>
              </span>
              {i < phases.length - 1 && <span className={cn("h-px w-3 sm:w-6", done ? "bg-bz-fire/50" : "bg-bz-line-soft")} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-bz-md border border-[#C0413A]/30 bg-[#FBE7E5] px-4 py-3">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#9A2E29]" />
      <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-[#9A2E29]">{message}</p>
      <button onClick={onDismiss} className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-[#9A2E29] hover:bg-[#F7D4CF]"><X size={13} /></button>
    </div>
  );
}

function Switch({ value, onChange, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; ariaLabel?: string }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={ariaLabel} onClick={() => onChange(!value)}
      className={cn("relative inline-flex h-[20px] w-9 shrink-0 items-center rounded-bz-pill border transition-colors", value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line")}>
      <span className={cn("pointer-events-none absolute h-3.5 w-3.5 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform", value ? "translate-x-[18px]" : "translate-x-[2px]")} />
    </button>
  );
}

function CadenceToggle({ cadence, onChange }: { cadence: Cadence; onChange: (c: Cadence) => void }) {
  return (
    <div className="inline-grid grid-flow-col rounded-bz-pill border border-bz-line-soft bg-bz-paper-warm p-0.5">
      {(["monthly", "yearly"] as Cadence[]).map((c) => {
        const on = c === cadence;
        return (
          <button key={c} onClick={() => onChange(c)} className={cn("h-8 rounded-bz-pill px-4 text-[12.5px] font-medium capitalize transition-colors", on ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text")}>
            {c}{c === "yearly" && <span className="ml-1.5 rounded-bz-pill bg-bz-fire/[0.22] px-1.5 py-0.5 text-[9.5px] font-bold text-bz-text">−{savingsPct}%</span>}
          </button>
        );
      })}
    </div>
  );
}

// deterministic faux-QR (no image, no gradient — olive cells on paper)
function FakeQR({ seed, dim }: { seed: string; dim?: boolean }) {
  const cells = React.useMemo(() => {
    let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const out: boolean[] = [];
    for (let i = 0; i < 25 * 25; i++) { h = (h * 1103515245 + 12345) & 0x7fffffff; out.push(((h >> 9) & 1) === 1); }
    // force the three finder squares (corners) for a believable QR silhouette
    const set = (r: number, c: number, v: boolean) => { out[r * 25 + c] = v; };
    const finder = (r0: number, c0: number) => { for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) set(r0 + r, c0 + c, r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)); };
    finder(0, 0); finder(0, 18); finder(18, 0);
    return out;
  }, [seed]);
  return (
    <div className={cn("grid overflow-hidden rounded-bz-sm bg-bz-paper p-2 transition-opacity", dim && "opacity-25")} style={{ gridTemplateColumns: "repeat(25,1fr)", width: 184, height: 184 }} aria-hidden>
      {cells.map((c, i) => <div key={i} className={c ? "bg-bz-olive" : "bg-transparent"} />)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE 0 — CHOOSE PLAN
// ════════════════════════════════════════════════════════════════════════════

function PlanCard({ plan, cadence, selected, onSelect }: { plan: Plan; cadence: Cadence; selected: boolean; onSelect: () => void }) {
  const price = priceOf(plan, cadence, plan.bundledSeats);
  const isCurrent = !!plan.current;
  const cta = isCurrent ? "Current plan" : plan.free ? "Switch to Community" : selected ? "Selected" : "Choose " + plan.name;
  // precedence: current overrides popular
  const badge = isCurrent ? null : plan.popular ? "Most popular" : null;
  return (
    <div className={cn("relative flex flex-col rounded-bz-xl border bg-bz-surface p-5 transition-all", selected ? "border-bz-text shadow-[0_1px_3px_rgba(15,20,17,0.08)] ring-1 ring-bz-fire" : isCurrent ? "border-bz-line-soft" : "border-bz-line-soft hover:border-bz-line")}>
      {badge && <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-bz-pill bg-bz-fire px-2.5 py-0.5 text-[10px] font-bold text-bz-olive"><Star size={10} fill="currentColor" /> {badge}</span>}
      {isCurrent && <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-bz-pill bg-bz-paper-warm px-2.5 py-0.5 text-[10px] font-bold text-bz-text-muted ring-1 ring-bz-line">Your plan</span>}
      {selected && <span className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-bz-pill bg-bz-fire text-bz-olive"><Check size={12} strokeWidth={3} /></span>}

      <p className="text-[15px] font-semibold tracking-tight text-bz-text">{plan.name}</p>
      <p className="mt-1 min-h-[32px] text-[11.5px] leading-snug text-bz-text-muted">{plan.desc}</p>

      <div className="mt-3 flex items-end gap-1">
        {plan.free ? <span className="text-[26px] font-semibold leading-none tracking-tight text-bz-text">Free</span> : (
          <>
            <span className="mb-0.5 text-[11px] font-semibold text-bz-text-muted">{CURRENCY}</span>
            <span className={cn("text-[26px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>{price.base.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            <span className="mb-0.5 text-[11.5px] text-bz-text-soft">/{periodLabel(cadence)}</span>
          </>
        )}
      </div>
      <p className={cn("mt-1 text-[10.5px] text-bz-text-soft", NUM)}>Includes {plan.bundledSeats} {plan.bundledSeats === 1 ? "seat" : "seats"}</p>

      <ul className="mt-4 flex flex-col gap-2 border-t border-bz-line-soft pt-4">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center gap-2 text-[12px]">
            {f.included ? <Check size={13} className="shrink-0 text-bz-leaf-deep" strokeWidth={3} /> : <X size={13} className="shrink-0 text-bz-text-soft" />}
            <span className={f.included ? "text-bz-text" : "text-bz-text-soft line-through decoration-bz-line"}>{f.label}</span>
          </li>
        ))}
      </ul>

      <button onClick={onSelect} disabled={isCurrent}
        className={cn("mt-5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-bz-md px-3.5 text-[12.5px] font-semibold transition-colors",
          isCurrent ? "cursor-not-allowed border border-bz-line-soft bg-bz-paper-warm text-bz-text-soft" : selected ? "bg-bz-deep text-bz-text-on-dark" : "border border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm")}>
        {selected && !isCurrent && <Check size={13} />} {cta}
      </button>
    </div>
  );
}

function ChoosePhase({ cadence, setCadence, plansLoading, plans, plansError, onClearError, selectedId, onSelect }: {
  cadence: Cadence; setCadence: (c: Cadence) => void; plansLoading: boolean; plans: Plan[]; plansError: string | null; onClearError: () => void; selectedId: string | null; onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-[22px] font-semibold tracking-tight text-bz-text">Choose your plan</h2>
        <p className="max-w-[52ch] text-[13px] text-bz-text-muted">Pick the plan you want to move onto. You'll only pay the difference after we credit the unused time on your current plan.</p>
        <CadenceToggle cadence={cadence} onChange={setCadence} />
        {cadence === "yearly" && <p className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text"><Sparkles size={12} className="text-bz-leaf-deep" /> Save {savingsPct}% paying yearly</p>}
      </div>

      {plansError && <ErrorBanner message={plansError} onDismiss={onClearError} />}

      {plansLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-bz-text-muted">
          <Loader2 size={22} className="animate-spin text-bz-fire" /><p className="text-[13px] font-medium">Loading plans…</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-bz-lg border border-dashed border-bz-line bg-bz-surface py-20 text-center">
          <Tag size={22} className="text-bz-text-soft" /><p className="text-[14px] font-semibold text-bz-text">No plans available</p>
          <p className="max-w-sm text-[12px] text-bz-text-muted">There are no upgrade plans offered for your account right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => <PlanCard key={p.id} plan={p} cadence={cadence} selected={selectedId === p.id} onSelect={() => onSelect(p.id)} />)}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE 1 — CONFIGURE
// ════════════════════════════════════════════════════════════════════════════

function SeatStepper({ value, floor, onChange }: { value: number; floor: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex h-10 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface">
      <button onClick={() => onChange(Math.max(floor, value - 1))} disabled={value <= floor} className="flex size-10 items-center justify-center text-bz-text-muted hover:text-bz-text disabled:opacity-30"><Minus size={15} /></button>
      <span className={cn("flex min-w-[3.5rem] justify-center px-1 text-[15px] font-semibold text-bz-text", NUM)}>{value}</span>
      <button onClick={() => onChange(value + 1)} className="flex size-10 items-center justify-center text-bz-text-muted hover:text-bz-text"><Plus size={15} /></button>
    </div>
  );
}

function ConfigurePhase({ plan, cadence, seats, setSeats, autoRenew, setAutoRenew, onBack, onContinue }: {
  plan: Plan; cadence: Cadence; seats: number; setSeats: (n: number) => void; autoRenew: boolean; setAutoRenew: (v: boolean) => void; onBack: () => void; onContinue: () => void;
}) {
  const price = priceOf(plan, cadence, seats);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h2 className="text-[22px] font-semibold tracking-tight text-bz-text">Configure {plan.name}</h2>
        <p className="text-[13px] text-bz-text-muted">Set your seats and renewal — the price updates live.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          {/* seats */}
          <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
            <div className="flex items-center gap-2.5"><Users size={15} className="text-bz-text-muted" /><p className="text-[13px] font-semibold text-bz-text">User seats</p></div>
            <p className={cn("mt-1 text-[11.5px] text-bz-text-muted", NUM)}>{plan.name} bundles {plan.bundledSeats} seats. Add more at {money(price.perSeat)} per seat / {periodLabel(cadence)}.</p>
            <div className="mt-3"><SeatStepper value={seats} floor={plan.bundledSeats} onChange={setSeats} /></div>
            <p className={cn("mt-2 text-[10.5px] text-bz-text-soft", NUM)}>Minimum {plan.bundledSeats} — you can't drop below the bundled seats.</p>
          </div>

          {/* cadence (read-only) + auto-renew */}
          <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5"><Clock size={15} className="text-bz-text-muted" /><p className="text-[13px] font-semibold text-bz-text">Billing cadence</p></div>
              <span className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[11.5px] font-medium capitalize text-bz-text">{cadence}</span>
            </div>
            <p className="mt-1.5 text-[11.5px] text-bz-text-muted">{cadence === "yearly" ? `Billed once a year — you're saving ${savingsPct}% versus monthly.` : "Billed every month. Switch to yearly on the plan step to save."}</p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
            <div className="flex items-center gap-2.5"><RefreshCcw size={15} className="text-bz-text-muted" /><div><p className="text-[12.5px] font-medium text-bz-text">Auto-renew</p><p className="text-[11px] text-bz-text-muted">{autoRenew ? "Renews automatically each cycle." : "Manual renewal required each cycle."}</p></div></div>
            <Switch value={autoRenew} onChange={setAutoRenew} ariaLabel="Auto-renew" />
          </div>
        </div>

        {/* price breakdown (olive showcase) */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="overflow-hidden rounded-bz-2xl bg-bz-olive p-5 text-bz-text-on-dark">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-fire">Price breakdown</p>
            <div className="mt-3.5 flex flex-col gap-2.5">
              <BreakRow label={<>Base · {plan.bundledSeats} seats</>} value={money(price.base)} />
              {price.extra > 0 && price.perSeat > 0 && <BreakRow label={<>Extra seats · {price.extra} × {money(price.perSeat)}</>} value={money(price.extraCost)} />}
              <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-[12.5px] font-medium">Total / {periodLabel(cadence)}</span>
                <span className={cn("text-[24px] font-semibold leading-none text-bz-fire", NUM)}>{money(price.total).replace(CURRENCY + " ", "")}</span>
              </div>
            </div>
            <p className="mt-3 text-[10.5px] text-bz-text-on-dark-muted">This amount carries forward to payment, where unused credit is applied.</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={onBack} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface text-[12.5px] font-semibold text-bz-text hover:bg-bz-paper-warm"><ArrowLeft size={14} /> Back</button>
            <button onClick={onContinue} className="inline-flex h-10 flex-[1.4] items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95">Continue to payment <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
function BreakRow({ label, value }: { label: React.ReactNode; value: string }) {
  return <div className="flex items-center justify-between gap-3 text-[12.5px]"><span className="text-bz-text-on-dark-muted">{label}</span><span className={cn("font-medium text-bz-text-on-dark", NUM)}>{value}</span></div>;
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE 2 — PAYMENT  (proration · promo · provider · scan/redirect · monitor)
// ════════════════════════════════════════════════════════════════════════════

type Proration = { newPrice: number; perDay: number; daysUsed: number; credit: number; due: number };
type PayStatus = "pending" | "scanned" | "verifying" | "completed" | "failed";
type OverlayStage = "received" | "verifying" | "completing" | "done" | "error";
type FailRef = { txnId: string; refNo: string; provider: string; amount: number; date: string };

function ProrationCard({ pr, loading, error, finalDue, plan, cadence }: { pr: Proration | null; loading: boolean; error: boolean; finalDue: number; plan: Plan; cadence: Cadence }) {
  if (loading) return <div className="flex items-center justify-center gap-2 rounded-bz-2xl bg-bz-olive py-12 text-bz-text-on-dark-muted"><Loader2 size={16} className="animate-spin text-bz-fire" /> <span className="text-[12.5px]">Calculating proration credit…</span></div>;
  if (error || !pr) {
    const fallback = priceOf(plan, cadence, plan.bundledSeats).total;
    return (
      <div className="overflow-hidden rounded-bz-2xl bg-bz-olive p-5 text-bz-text-on-dark">
        <div className="flex items-center gap-2 text-bz-fire"><AlertTriangle size={13} /><p className="text-[10px] font-bold uppercase tracking-[0.14em]">Proration unavailable</p></div>
        <p className="mt-2 text-[11.5px] text-bz-text-on-dark-muted">We couldn't compute your credit — falling back to the full plan price.</p>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3"><span className="text-[12.5px] font-medium">Pay today</span><span className={cn("text-[24px] font-semibold text-bz-fire", NUM)}>{money(fallback).replace(CURRENCY + " ", "")}</span></div>
      </div>
    );
  }
  const zero = finalDue <= 0;
  return (
    <div className="overflow-hidden rounded-bz-2xl bg-bz-olive p-5 text-bz-text-on-dark">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-fire">What you pay today</p>
      <div className="mt-3.5 flex flex-col gap-2.5">
        <BreakRow label={`New plan · ${plan.name}`} value={money(pr.newPrice)} />
        {CURRENT.daysRemaining > 0 && <BreakRow label={<>Days used · {pr.daysUsed} of {CURRENT.daysTotal}</>} value={money(round2(pr.perDay * pr.daysUsed))} />}
        {CURRENT.daysRemaining > 0 && <BreakRow label={`Unused credit · ${CURRENT.daysRemaining} days left`} value={`− ${money(pr.credit)}`} />}
        {finalDue < pr.due && <BreakRow label="Promo discount" value={`− ${money(round2(pr.due - finalDue))}`} />}
        <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-[12.5px] font-medium">{zero ? "No charge today" : "Pay today"}</span>
          <span className={cn("text-[26px] font-semibold leading-none text-bz-fire", NUM)}>{zero ? "—" : money(Math.max(0, finalDue)).replace(CURRENCY + " ", "")}</span>
        </div>
      </div>
      <p className="mt-3 text-[10.5px] text-bz-text-on-dark-muted">{money(round2(pr.perDay))}/day · your new plan activates immediately and the remaining days on Growth are credited.</p>
    </div>
  );
}

function PromoEntry({ applied, code, onApply, onRemove }: { applied: boolean; code: string; onApply: (c: string) => void; onRemove: () => void }) {
  const [input, setInput] = React.useState("");
  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-bz-md border border-bz-fire/40 bg-bz-fire/[0.06] px-3.5 py-2.5">
        <span className="inline-flex items-center gap-2 text-[12px] font-medium text-bz-text"><Tag size={13} className="text-bz-leaf-deep" /> <span className={NUM}>{code}</span> applied</span>
        <button onClick={onRemove} className="text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">Remove</button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) onApply(input.trim()); }}
        placeholder="Promo code" className={cn("h-9 flex-1 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text", NUM)} />
      <button onClick={() => input.trim() && onApply(input.trim())} disabled={!input.trim()} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-40">Apply</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCAN-CODE DIALOG + POST-CONFIRMATION OVERLAY
// ════════════════════════════════════════════════════════════════════════════

const STATUS_LINE: Record<PayStatus, { label: string; tone: string }> = {
  pending: { label: "Waiting for you to scan…", tone: "text-bz-text-muted" },
  scanned: { label: "Scanned — confirm in your app", tone: "text-bz-text" },
  verifying: { label: "Verifying payment…", tone: "text-bz-text" },
  completed: { label: "Payment confirmed", tone: "text-bz-leaf-deep" },
  failed: { label: "Payment failed", tone: "text-[#9A2E29]" },
};

function ScanDialog({ provider, amount, txnId, refNo, status, secondsLeft, onSwitchWeb, onCancel, onSimulateFail }: {
  provider: Provider; amount: number; txnId: string; refNo: string; status: PayStatus; secondsLeft: number; onSwitchWeb: () => void; onCancel: () => void; onSimulateFail: () => void;
}) {
  const near = secondsLeft <= 30;
  const mm = Math.floor(secondsLeft / 60); const ss = String(secondsLeft % 60).padStart(2, "0");
  const sl = STATUS_LINE[status];
  return createPortal(
    <div className="fixed inset-0 z-[96] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bz-olive/45 backdrop-blur-[1px]" onClick={onCancel} aria-hidden />
      <div className="relative w-full max-w-[380px] overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_70px_-24px_rgba(15,20,17,0.4)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-bz-line-soft bg-bz-paper px-5 py-3.5">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-bz-text"><provider.glyph size={15} className="text-bz-text-muted" /> Pay with {provider.name}</span>
          <span className={cn("inline-flex items-center gap-1 rounded-bz-pill px-2 py-0.5 text-[11px] font-semibold", near ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text-muted", NUM)}><Clock size={11} /> {mm}:{ss}</span>
        </div>
        <div className="flex flex-col items-center px-5 py-5">
          <div className="relative flex items-center justify-center">
            <FakeQR seed={txnId} dim={status !== "pending"} />
            {status !== "pending" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-14 items-center justify-center rounded-bz-pill bg-bz-surface shadow-[0_8px_24px_-8px_rgba(15,20,17,0.3)]">
                  {status === "completed" ? <CircleCheck size={30} className="text-bz-leaf-deep" /> : status === "failed" ? <CircleX size={30} className="text-[#9A2E29]" /> : <Loader2 size={26} className="animate-spin text-bz-fire" />}
                </span>
              </div>
            )}
          </div>
          <p className={cn("mt-4 text-[12.5px] font-medium", sl.tone)}>{sl.label}</p>
          <p className={cn("mt-3 text-[22px] font-semibold tracking-tight text-bz-text", NUM)}>{money(amount)}</p>
          <div className="mt-2 flex flex-col items-center gap-0.5 text-center">
            <p className={cn("text-[10.5px] text-bz-text-soft", NUM)}>Txn {txnId} · Ref {refNo}</p>
            <p className="text-[10.5px] text-bz-text-soft">Open {provider.name} → Scan to pay → confirm in-app.</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-5 py-3">
          <button onClick={onSwitchWeb} disabled={status !== "pending"} className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text disabled:opacity-40"><Globe size={13} /> Pay on web</button>
          <div className="flex items-center gap-3">
            {status === "pending" && <button onClick={onSimulateFail} title="Simulate a failed payment" className="text-[11px] text-bz-text-soft underline-offset-2 hover:text-[#9A2E29] hover:underline">Simulate failure</button>}
            <button onClick={onCancel} className="inline-flex h-8 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">Cancel</button>
          </div>
        </div>
      </div>
    </div>, document.body);
}

function ProcessingOverlay({ stage, txnId, amount, onExit }: { stage: OverlayStage; txnId: string; amount: number; onExit: () => void }) {
  const processing = stage === "received" || stage === "verifying" || stage === "completing";
  const meta: Record<OverlayStage, { title: string; sub: string }> = {
    received: { title: "Payment received", sub: "We've got your payment — finishing up." },
    verifying: { title: "Verifying with provider", sub: "Confirming the transaction is settled." },
    completing: { title: "Activating your plan", sub: "Switching you onto the new plan." },
    done: { title: "All set", sub: "Your upgrade is active." },
    error: { title: "Something went wrong", sub: "We received your payment but couldn't activate the plan automatically." },
  };
  const stageOrder: OverlayStage[] = ["received", "verifying", "completing"];
  const m = meta[stage];
  return createPortal(
    <div className="fixed inset-0 z-[97] flex items-center justify-center bg-bz-olive/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[400px] rounded-bz-lg border border-bz-line bg-bz-surface p-6 text-center shadow-[0_30px_70px_-24px_rgba(15,20,17,0.4)]">
        <span className="mx-auto flex size-14 items-center justify-center rounded-bz-pill bg-bz-paper-warm">
          {stage === "done" ? <CircleCheck size={30} className="text-bz-leaf-deep" /> : stage === "error" ? <CircleX size={30} className="text-[#9A2E29]" /> : <Loader2 size={28} className="animate-spin text-bz-fire" />}
        </span>
        <p className="mt-4 text-[15px] font-semibold tracking-tight text-bz-text">{m.title}</p>
        <p className="mt-1 text-[12px] text-bz-text-muted">{m.sub}</p>

        {processing && (
          <div className="mt-5 flex items-center justify-center gap-2">
            {stageOrder.map((s, i) => {
              const idx = stageOrder.indexOf(stage); const done = i < idx; const active = i === idx;
              return (
                <React.Fragment key={s}>
                  <span className={cn("flex size-6 items-center justify-center rounded-bz-pill text-[10px] font-bold", done ? "bg-bz-fire text-bz-olive" : active ? "bg-bz-deep text-bz-text-on-dark" : "bg-bz-paper-warm text-bz-text-soft", NUM)}>{done ? <Check size={11} strokeWidth={3} /> : i + 1}</span>
                  {i < stageOrder.length - 1 && <span className={cn("h-px w-6", done ? "bg-bz-fire/60" : "bg-bz-line-soft")} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div className="mt-5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-4 py-2.5 text-left">
          <div className="flex items-center justify-between text-[11.5px]"><span className="text-bz-text-soft">Transaction</span><span className={cn("font-medium text-bz-text", NUM)}>{txnId}</span></div>
          <div className="mt-1 flex items-center justify-between text-[11.5px]"><span className="text-bz-text-soft">Amount</span><span className={cn("font-medium text-bz-text", NUM)}>{money(amount)}</span></div>
        </div>

        {stage === "error" && (
          <button onClick={onExit} className="mt-5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface text-[12.5px] font-semibold text-bz-text hover:bg-bz-paper-warm">Exit to dashboard</button>
        )}
      </div>
    </div>, document.body);
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE 3 — CONFIRMATION
// ════════════════════════════════════════════════════════════════════════════

function ConfirmPhase({ plan, cadence, seats, amountPaid, credit, txnId, onExit }: {
  plan: Plan; cadence: Cadence; seats: number; amountPaid: number; credit: number; txnId: string; onExit: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-[520px] flex-col items-center gap-6 py-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18]"><CircleCheck size={36} className="text-bz-leaf-deep" /></span>
      <div>
        <h2 className="text-[24px] font-semibold tracking-tight text-bz-text">You're on {plan.name}</h2>
        <p className="mt-1.5 text-[13px] text-bz-text-muted">Your subscription is active and your team can use the new plan right away.</p>
      </div>
      <div className="w-full overflow-hidden rounded-bz-2xl bg-bz-olive p-5 text-left text-bz-text-on-dark">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-fire">Upgrade summary</p>
        <div className="mt-3.5 flex flex-col gap-2.5">
          <SumRow label="Plan" value={plan.name} />
          <SumRow label="Cadence" value={cadence === "yearly" ? "Yearly" : "Monthly"} />
          <SumRow label="Seats" value={String(seats)} />
          <SumRow label="Amount paid" value={money(amountPaid)} />
          {credit > 0 && <SumRow label="Credit applied" value={`− ${money(credit)}`} />}
          {txnId && <SumRow label="Transaction" value={txnId} />}
        </div>
      </div>
      <button onClick={onExit} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95"><LayoutDashboard size={15} /> Go to dashboard</button>
    </div>
  );
}
function SumRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 text-[12.5px]"><span className="text-bz-text-on-dark-muted">{label}</span><span className={cn("font-medium text-bz-text-on-dark", NUM)}>{value}</span></div>;
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function PlanUpgradeDesignPage() {
  const navigate = useNavigate();

  const [step, setStep] = React.useState(0);
  const [cadence, setCadence] = React.useState<Cadence>("yearly");

  // phase 0 — plan load
  const [plansLoading, setPlansLoading] = React.useState(true);
  const [plansError, setPlansError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // phase 1 — configure
  const [seats, setSeats] = React.useState(1);
  const [autoRenew, setAutoRenew] = React.useState(true);

  // phase 2 — payment
  const [pr, setPr] = React.useState<Proration | null>(null);
  const [prLoading, setPrLoading] = React.useState(false);
  const [prError, setPrError] = React.useState(false);
  const [promo, setPromo] = React.useState<{ code: string; discount: number } | null>(null);
  const [providerId, setProviderId] = React.useState<string | null>("esewa");
  const [paySub, setPaySub] = React.useState<"provider" | "method" | "redirecting">("provider");
  const [scanOpen, setScanOpen] = React.useState(false);
  const [payStatus, setPayStatus] = React.useState<PayStatus>("pending");
  const [secondsLeft, setSecondsLeft] = React.useState(180);
  const [overlay, setOverlay] = React.useState<OverlayStage | null>(null);
  const [failRef, setFailRef] = React.useState<FailRef | null>(null);
  const [payError, setPayError] = React.useState<string | null>(null);

  const txnRef = React.useRef("TXN-8841037");
  const refNoRef = React.useRef("REF-2026-0614-77");

  const selectedPlan = PLANS.find((p) => p.id === selectedId) ?? null;

  // initial plan fetch
  React.useEffect(() => {
    const t = window.setTimeout(() => setPlansLoading(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  const newPrice = selectedPlan ? priceOf(selectedPlan, cadence, seats).total : 0;
  const finalDue = pr ? Math.max(0, round2(pr.due - (promo?.discount ?? 0))) : Math.max(0, round2(newPrice - (promo?.discount ?? 0)));
  const isZero = step === 2 && !prLoading && finalDue <= 0;

  // selecting a plan seeds seats + advances
  const selectPlan = (id: string) => {
    const p = PLANS.find((x) => x.id === id); if (!p || p.current) return;
    setSelectedId(id); setSeats(p.bundledSeats); setStep(1);
  };

  // entering payment derives the proration credit
  const enterPayment = () => {
    setStep(2); setPaySub("provider"); setProviderId("esewa"); setPayError(null); setFailRef(null);
    setPrLoading(true); setPr(null); setPrError(false);
    window.setTimeout(() => {
      if (!selectedPlan) return;
      const price = priceOf(selectedPlan, cadence, seats).total;
      const perDay = round2(CURRENT.paidAmount / CURRENT.daysTotal);
      const daysUsed = CURRENT.daysTotal - CURRENT.daysRemaining;
      const credit = round2(perDay * CURRENT.daysRemaining);
      const due = Math.max(0, round2(price - credit));
      setPr({ newPrice: price, perDay, daysUsed, credit, due });
      setPrLoading(false);
    }, 850);
  };

  // leaving payment tears down all in-flight payment state
  const leavePayment = () => {
    setPaySub("provider"); setScanOpen(false); setPayStatus("pending"); setOverlay(null); setFailRef(null); setPayError(null); setProviderId("esewa");
    setStep(1);
  };

  // scan auto-advance (simulated socket/polling)
  React.useEffect(() => {
    if (!scanOpen || payStatus === "failed") return;
    if (payStatus === "completed") { const t = window.setTimeout(() => { setScanOpen(false); runOverlay(); }, 1000); return () => window.clearTimeout(t); }
    const next: Record<string, PayStatus> = { pending: "scanned", scanned: "verifying", verifying: "completed" };
    const t = window.setTimeout(() => setPayStatus(next[payStatus]), payStatus === "pending" ? 2800 : 2000);
    return () => window.clearTimeout(t);
  }, [scanOpen, payStatus]);

  // countdown while the scan dialog is open
  React.useEffect(() => {
    if (!scanOpen || payStatus !== "pending") return;
    const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [scanOpen, payStatus]);

  // post-confirmation overlay sequence → confirmation phase
  const runOverlay = () => {
    setOverlay("received");
    window.setTimeout(() => setOverlay("verifying"), 1000);
    window.setTimeout(() => setOverlay("completing"), 2000);
    window.setTimeout(() => { setOverlay(null); setStep(3); }, 3100);
  };

  // redirect-only / "pay on web" path
  const beginRedirect = () => {
    setPaySub("redirecting");
    window.setTimeout(() => { setPaySub("provider"); runOverlay(); }, 1600);
  };

  const startProvider = () => {
    const p = PROVIDERS.find((x) => x.id === providerId); if (!p) return;
    if (p.scan) setPaySub("method");
    else beginRedirect();
  };

  const openScan = () => { setScanOpen(true); setPayStatus("pending"); setSecondsLeft(180); };

  const failPayment = () => {
    setScanOpen(false); setPayStatus("failed"); setPaySub("provider");
    setFailRef({ txnId: txnRef.current, refNo: refNoRef.current, provider: PROVIDERS.find((p) => p.id === providerId)?.name ?? "—", amount: finalDue, date: "Jun 14, 2026" });
    setPayError("Your payment could not be completed. No money has been charged — you can try again.");
  };
  const retryPayment = () => { setPayStatus("pending"); setPaySub("provider"); setFailRef(null); setPayError(null); };

  const confirmZero = () => { setOverlay("received"); window.setTimeout(() => setOverlay("completing"), 900); window.setTimeout(() => { setOverlay(null); setStep(3); }, 1900); };

  const applyPromo = (code: string) => {
    // apply is informational (no validation) — demo discount drives the final amount
    const discount = /free|full|100/i.test(code) ? newPrice : code.length >= 8 ? round2(newPrice * 0.1) : 500;
    setPromo({ code, discount });
  };

  const copyRef = (r: FailRef) => { try { void navigator.clipboard?.writeText(`Txn ${r.txnId} · Ref ${r.refNo} · ${r.provider} · ${money(r.amount)} · ${r.date}`); } catch { /* noop */ } };

  const provider = PROVIDERS.find((p) => p.id === providerId) ?? null;
  const monitoring = scanOpen || paySub === "redirecting" || !!overlay;

  return (
    <AppShell
      breadcrumb={<>
        <span className="text-bz-text-muted">Billing</span>
        <ChevronRight size={11} className="text-bz-text-soft" />
        <span className="font-semibold text-bz-text">Upgrade Plan</span>
      </>}
      overlay={<>
        {scanOpen && provider && <ScanDialog provider={provider} amount={finalDue} txnId={txnRef.current} refNo={refNoRef.current} status={payStatus} secondsLeft={secondsLeft}
          onSwitchWeb={() => { setScanOpen(false); beginRedirect(); }} onCancel={() => setScanOpen(false)} onSimulateFail={failPayment} />}
        {overlay && <ProcessingOverlay stage={overlay} txnId={txnRef.current} amount={finalDue} onExit={() => { setOverlay(null); navigate("/design/subscription-revenue"); }} />}
      </>}
    >
      <div className="px-4 pb-16 pt-5 md:px-8">
        {/* phase rail + back-out */}
        <div className="mx-auto mb-7 flex max-w-[1080px] items-center justify-between gap-3">
          <button onClick={() => navigate("/design/subscription-revenue")} className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
            <ArrowLeft size={13} /> <span className="hidden sm:inline">Exit</span>
          </button>
          <PhaseRail step={step} />
          <div className="w-[64px]" aria-hidden />
        </div>

        <div className="mx-auto max-w-[1080px]">
          {step === 0 && (
            <ChoosePhase cadence={cadence} setCadence={setCadence} plansLoading={plansLoading} plans={PLANS} plansError={plansError}
              onClearError={() => setPlansError(null)} selectedId={selectedId} onSelect={selectPlan} />
          )}

          {step === 1 && selectedPlan && (
            <ConfigurePhase plan={selectedPlan} cadence={cadence} seats={seats} setSeats={setSeats} autoRenew={autoRenew} setAutoRenew={setAutoRenew} onBack={() => setStep(0)} onContinue={enterPayment} />
          )}

          {step === 2 && selectedPlan && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5 text-center">
                <h2 className="text-[22px] font-semibold tracking-tight text-bz-text">{isZero ? "Confirm your upgrade" : "Complete payment"}</h2>
                <p className="text-[13px] text-bz-text-muted">{isZero ? "Your accrued credit covers the new plan — no payment needed." : "Pay only the difference owed after crediting unused time on Growth."}</p>
              </div>

              {payError && <ErrorBanner message={payError} onDismiss={() => setPayError(null)} />}

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
                {/* left — proration + context + promo */}
                <div className="flex flex-col gap-4">
                  <ProrationCard pr={pr} loading={prLoading} error={prError} finalDue={finalDue} plan={selectedPlan} cadence={cadence} />
                  <div className="flex items-start gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3.5">
                    <Info size={14} className="mt-0.5 shrink-0 text-bz-text-muted" />
                    <p className="text-[11.5px] leading-relaxed text-bz-text-muted">You're currently on <span className="font-medium text-bz-text">Growth</span> · {fmtDate(CURRENT.subscribedAt)} → {fmtDate(CURRENT.expiryAt)}. The new plan activates immediately.</p>
                  </div>
                  <div><p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Promo code</p><PromoEntry applied={!!promo} code={promo?.code ?? ""} onApply={applyPromo} onRemove={() => setPromo(null)} /></div>
                  <button onClick={leavePayment} className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-40" disabled={monitoring}>
                    <ArrowLeft size={13} /> Change selection
                  </button>
                </div>

                {/* right — payment method */}
                <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
                  {isZero ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                      <span className="flex size-12 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18]"><Gift size={24} className="text-bz-leaf-deep" /></span>
                      <p className="text-[15px] font-semibold text-bz-text">No charge today</p>
                      <p className="max-w-sm text-[12px] text-bz-text-muted">Your unused credit fully covers the new plan. Confirm to activate {selectedPlan.name} immediately.</p>
                      <button onClick={confirmZero} disabled={!!overlay} className="mt-1 inline-flex h-10 items-center gap-1.5 rounded-bz-md bg-bz-deep px-5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-60"><Check size={15} /> Confirm & activate</button>
                    </div>
                  ) : prLoading ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-bz-text-muted"><Loader2 size={16} className="animate-spin text-bz-fire" /> <span className="text-[12.5px]">Preparing payment…</span></div>
                  ) : failRef ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col items-center gap-2 py-2 text-center">
                        <span className="flex size-12 items-center justify-center rounded-bz-pill bg-[#FBE5E2]"><CircleX size={24} className="text-[#9A2E29]" /></span>
                        <p className="text-[14px] font-semibold text-bz-text">Payment failed</p>
                        <p className="max-w-sm text-[12px] text-bz-text-muted">No money was charged. Keep these details for support, then try again.</p>
                      </div>
                      <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3.5">
                        <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Reference</p>
                          <button onClick={() => copyRef(failRef)} className="inline-flex items-center gap-1 text-[11px] font-medium text-bz-text-muted hover:text-bz-text"><Copy size={11} /> Copy</button></div>
                        <div className="mt-2 flex flex-col gap-1.5">
                          <RefRow label="Transaction" value={failRef.txnId} />
                          <RefRow label="Reference" value={failRef.refNo} />
                          <RefRow label="Provider" value={failRef.provider} />
                          <RefRow label="Amount" value={money(failRef.amount)} />
                          <RefRow label="Date" value={failRef.date} />
                        </div>
                      </div>
                      <button onClick={retryPayment} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95"><RefreshCcw size={14} /> Try again</button>
                    </div>
                  ) : paySub === "redirecting" ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-bz-text-muted">
                      <Loader2 size={22} className="animate-spin text-bz-fire" />
                      <p className="text-[12.5px] font-medium text-bz-text">Redirecting to {provider?.name}…</p>
                      <p className="text-[11px]">You're being taken to a secure checkout.</p>
                    </div>
                  ) : paySub === "method" && provider ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-semibold text-bz-text">How would you like to pay with {provider.name}?</p>
                        <button onClick={() => setPaySub("provider")} className="text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">Change</button>
                      </div>
                      <button onClick={openScan} className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface p-3.5 text-left transition-colors hover:border-bz-text">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><QrCode size={17} /></span>
                        <span className="min-w-0 flex-1"><span className="block text-[12.5px] font-medium text-bz-text">Scan a code</span><span className="block text-[11px] text-bz-text-muted">Scan with the {provider.name} mobile app</span></span>
                        <ChevronRight size={15} className="text-bz-text-soft" />
                      </button>
                      <button onClick={beginRedirect} className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface p-3.5 text-left transition-colors hover:border-bz-text">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Globe size={17} /></span>
                        <span className="min-w-0 flex-1"><span className="block text-[12.5px] font-medium text-bz-text">Continue on the web</span><span className="block text-[11px] text-bz-text-muted">Pay on the {provider.name} site</span></span>
                        <ChevronRight size={15} className="text-bz-text-soft" />
                      </button>
                    </div>
                  ) : PROVIDERS.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center"><CreditCard size={20} className="text-bz-text-soft" /><p className="text-[13px] font-medium text-bz-text-muted">No payment providers available</p><p className="max-w-xs text-[11.5px] text-bz-text-muted">No providers are configured for your account's region.</p></div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-[12px] font-semibold text-bz-text">Choose a payment method</p>
                      <div className="flex flex-col gap-2">
                        {PROVIDERS.map((p) => {
                          const on = providerId === p.id;
                          return (
                            <button key={p.id} onClick={() => setProviderId(p.id)} className={cn("flex items-center gap-3 rounded-bz-md border p-3.5 text-left transition-colors", on ? "border-bz-text bg-bz-paper-warm/40" : "border-bz-line-soft bg-bz-surface hover:border-bz-line")}>
                              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md", on ? "bg-bz-deep text-bz-paper" : "bg-bz-paper-warm text-bz-text-muted")}><p.glyph size={17} /></span>
                              <span className="min-w-0 flex-1"><span className="block text-[12.5px] font-medium text-bz-text">{p.name}</span><span className="block text-[11px] text-bz-text-muted">{p.desc}</span></span>
                              {on && <span className="flex size-5 items-center justify-center rounded-bz-pill bg-bz-fire text-bz-olive"><Check size={12} strokeWidth={3} /></span>}
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={startProvider} disabled={!providerId} className="mt-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50">
                        <Zap size={14} /> Pay {money(finalDue)}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && selectedPlan && (
            <ConfirmPhase plan={selectedPlan} cadence={cadence} seats={seats} amountPaid={finalDue} credit={pr?.credit ?? 0} txnId={txnRef.current} onExit={() => navigate("/design/subscription-revenue")} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
function RefRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 text-[11.5px]"><span className="text-bz-text-soft">{label}</span><span className={cn("font-medium text-bz-text", NUM)}>{value}</span></div>;
}
