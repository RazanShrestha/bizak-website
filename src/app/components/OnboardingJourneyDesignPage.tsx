import * as React from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Minus,
  Plus,
  QrCode,
  RefreshCw,
  Rocket,
  Sliders,
  TimerReset,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// TENANT ONBOARDING JOURNEY  ·  the self-serve path from "an account exists" to
// "a provisioned ERP workspace you are signed into".
//
// This is NOT an in-app screen. It is a full-viewport journey that replaces the
// application entirely — no sidebar, no top bar, no breadcrumb. The only way out
// is signing out. So the design page below is a LAUNCHER: it lives in the app
// shell, and the journey itself is a portal that covers the viewport.
//
//   Primary action = FINISH THE STEP IN FRONT OF YOU.
//   Exactly one step is on screen. Everything else — the progress rail, the
//   value-prop, the sign-out — is quiet chrome in a left rail that never
//   competes with the step.
//
// DELIBERATE DECISIONS (the brief left these open; these are the answers):
//   • The step is server-named. The shell resolves it and owns FOUR outcomes:
//     resolving → ready → soft-failure (real error + re-check) → already-complete.
//   • A step whose progress entry would be "removed" is kept VISIBLE instead
//     (payment reads "Not required" on a free plan). The rail therefore always
//     has exactly one active entry — never a blank model.
//   • ONE commit rule everywhere: the commit control is always available and
//     REFUSES imperatively, naming the reason. Never a dead disabled button.
//   • Answers persist when you step back into a completed step (the legacy flow
//     re-blanked every form).
//   • Locale (currency / timezone / dial code) is a DERIVED readout of the
//     chosen country — not three pre-filled selects pretending to be the user's
//     choice. Clearing the country blanks it; it never stands stale.
//   • The scan artefact is INLINE, not modal — retreats stay reachable, and
//     leaving mid-watch asks for the same confirmation dismissing the code does.
//   • Expiry / watch-interruption / cancellation each read as THEMSELVES, with
//     their own recovery path. None of them is presented as a decline.
//   • Payment completing freezes the whole rail (the one-way ratchet).
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// FORMAT
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const CUR_SYMBOL: Record<string, string> = { NPR: "Rs", INR: "₹", USD: "$", EUR: "€" };
const sym = (code: string) => CUR_SYMBOL[code] ?? code;
const money = (n: number, code = "NPR") => `${sym(code)} ${Math.round(n).toLocaleString("en-US")}`;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const TODAY = new Date().toISOString().slice(0, 10);

/** yyyy-MM-dd + 1 year − 1 day. The value contract is STRINGS end to end. */
function yearMinusDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y + 1, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}
/** The fiscal window CONTAINING today, for a country's "MM-DD" fiscal start. */
function fiscalWindow(startMMDD: string) {
  const y = Number(TODAY.slice(0, 4));
  const thisYear = `${y}-${startMMDD}`;
  const start = TODAY >= thisYear ? thisYear : `${y - 1}-${startMMDD}`;
  return { start, end: yearMinusDay(start) };
}
/** Base period name = a slice of the YEAR parts — mirrors what the server stores. */
const basePeriod = (start: string, end: string) =>
  start && end ? `${start.slice(0, 4)}/${end.slice(0, 4)}` : "—";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

// ════════════════════════════════════════════════════════════════════════════
// JOURNEY MODEL
// ════════════════════════════════════════════════════════════════════════════

type StepId = "account" | "tenant" | "plan" | "payment" | "defaults" | "done";

type StepDef = {
  id: StepId;
  label: string;
  /** backed short description — surfaced only on the ACTIVE rail entry */
  blurb: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const STEPS: StepDef[] = [
  { id: "account", label: "Create account", blurb: "Your name, email and a password.", icon: Users },
  { id: "tenant", label: "Company profile", blurb: "Who you are and where you operate.", icon: Building2 },
  { id: "plan", label: "Choose a plan", blurb: "Seats, billing term and what's included.", icon: Layers },
  { id: "payment", label: "Payment", blurb: "Settle your first subscription charge.", icon: CreditCard },
  { id: "defaults", label: "System defaults", blurb: "Fiscal year and the data we seed.", icon: Sliders },
  { id: "done", label: "Finish", blurb: "We build your workspace and sign you in.", icon: Rocket },
];

/** The server's status record. Completion is read from each step's OWN flag. */
type Status = {
  step: StepId;
  tenantDone: boolean;
  planDone: boolean;
  paymentDone: boolean;
  defaultsDone: boolean;
  complete: boolean;
};

/** The four outcomes of resolving the step. The legacy shell rendered only one. */
type Resolution = "resolving" | "ready" | "failed" | "complete";

// ════════════════════════════════════════════════════════════════════════════
// PLAN CATALOGUE
// ════════════════════════════════════════════════════════════════════════════

type Term = "monthly" | "annual";
const TERM_MONTHS: Record<Term, number> = { monthly: 1, annual: 12 };
const TERM_LABEL: Record<Term, string> = { monthly: "per month", annual: "per year" };
/** The longer term is discounted — a real rate, applied identically to every plan. */
const ANNUAL_FACTOR = 0.8;

type Plan = {
  id: string;
  name: string;
  desc: string;
  /** base price for ONE month, before seats. 0 = free. */
  monthly: number;
  free?: boolean;
  popular?: boolean;
  trialDays?: number;
  includedSeats: number;
  /** charge per seat beyond the allowance, per month. 0 = extras are free. */
  extraSeat: number;
  /** optional second seat axis — only some plans expose one */
  addOn?: { label: string; blurb: string; monthly: number };
  features: { label: string; on: boolean }[];
};

const PLANS: Plan[] = [
  {
    id: "PLN-START",
    name: "Starter",
    desc: "For a first team getting off spreadsheets.",
    monthly: 0,
    free: true,
    includedSeats: 3,
    extraSeat: 0,
    features: [
      { label: "Sales, purchasing & inventory", on: true },
      { label: "Single company", on: true },
      { label: "Multi-subsidiary consolidation", on: false },
      { label: "Priority support", on: false },
    ],
  },
  {
    id: "PLN-GROWTH",
    name: "Growth",
    desc: "For a growing business running its books in Bizak.",
    monthly: 4500,
    popular: true,
    trialDays: 14,
    includedSeats: 10,
    extraSeat: 450,
    addOn: { label: "POS terminal", blurb: "Each till running the point-of-sale app.", monthly: 900 },
    features: [
      { label: "Everything in Starter", on: true },
      { label: "Point of sale & payments", on: true },
      { label: "Multi-subsidiary consolidation", on: true },
      { label: "Priority support", on: false },
    ],
  },
  {
    id: "PLN-SCALE",
    name: "Scale",
    desc: "For groups consolidating several entities.",
    monthly: 12000,
    includedSeats: 25,
    extraSeat: 380,
    addOn: { label: "Warehouse device", blurb: "Each handheld scanner on the floor.", monthly: 700 },
    features: [
      { label: "Everything in Growth", on: true },
      { label: "Unlimited subsidiaries", on: true },
      { label: "Advanced approvals & audit", on: true },
      { label: "Priority support", on: true },
    ],
  },
];

const planById = (id: string | null) => PLANS.find((p) => p.id === id) ?? null;
/** Free / trial verdict — the one predicate. It decides whether payment EXISTS. */
const isFree = (p: Plan | null) => !!p && (p.free || p.monthly === 0);

/** Every price in the catalogue, converted from the plan's month rate to a term. */
const atTerm = (monthly: number, term: Term) =>
  term === "annual" ? monthly * TERM_MONTHS.annual * ANNUAL_FACTOR : monthly;

type Quote = {
  plan: Plan;
  term: Term;
  seats: number;
  addOnSeats: number;
  base: number;
  extraSeats: number;
  extraCharge: number;
  addOnCharge: number;
  total: number;
  currency: string;
};

function quoteFor(plan: Plan, term: Term, seats: number, addOnSeats: number): Quote {
  const base = atTerm(plan.monthly, term);
  const extraSeats = Math.max(0, seats - plan.includedSeats);
  const extraCharge = extraSeats * atTerm(plan.extraSeat, term);
  const addOnCharge = plan.addOn ? addOnSeats * atTerm(plan.addOn.monthly, term) : 0;
  return {
    plan, term, seats, addOnSeats,
    base, extraSeats, extraCharge, addOnCharge,
    total: base + extraCharge + addOnCharge,
    currency: "NPR",
  };
}

// ════════════════════════════════════════════════════════════════════════════
// LOCALE  (country is the cascade root — everything below is DERIVED from it)
// ════════════════════════════════════════════════════════════════════════════

type Country = { name: string; dial: string; tz: string; currency: string; fiscalStart: string };

const COUNTRIES: Country[] = [
  { name: "Nepal", dial: "+977", tz: "Asia/Kathmandu", currency: "NPR", fiscalStart: "07-16" },
  { name: "India", dial: "+91", tz: "Asia/Kolkata", currency: "INR", fiscalStart: "04-01" },
  { name: "Singapore", dial: "+65", tz: "Asia/Singapore", currency: "USD", fiscalStart: "01-01" },
  { name: "United Kingdom", dial: "+44", tz: "Europe/London", currency: "EUR", fiscalStart: "04-06" },
  { name: "United States", dial: "+1", tz: "America/New_York", currency: "USD", fiscalStart: "01-01" },
];
const countryByName = (n: string) => COUNTRIES.find((c) => c.name === n) ?? null;

const INDUSTRIES = ["Retail & distribution", "Manufacturing", "Wholesale", "Professional services", "Hospitality"];
const CURRENCIES = ["NPR", "INR", "USD", "EUR"];
const TIMEZONES = ["Asia/Kathmandu", "Asia/Kolkata", "Asia/Singapore", "Europe/London", "America/New_York"];

// ════════════════════════════════════════════════════════════════════════════
// SEED MANIFEST  (what the workspace is created with)
// ════════════════════════════════════════════════════════════════════════════

type SeedCategory = {
  id: string;
  label: string;
  count: number;
  reason: string;
  /** disabled when the default ledger is opted out — these two hang off it */
  taxLinked?: boolean;
  records: { value: string; code?: string }[];
};

const MANIFEST: SeedCategory[] = [
  {
    id: "tax-rates", label: "Tax rates", count: 6, taxLinked: true,
    reason: "Matched to Nepal's VAT regime.",
    records: [
      { value: "VAT 13%", code: "VAT13" }, { value: "VAT 0% (exempt)", code: "VAT0" },
      { value: "Excise 5%", code: "EXC5" }, { value: "TDS 1.5%", code: "TDS15" },
      { value: "TDS 15%", code: "TDS15A" }, { value: "No tax" },
    ],
  },
  {
    id: "tax-groups", label: "Tax groups", count: 4, taxLinked: true,
    reason: "Matched to Nepal's VAT regime.",
    records: [
      { value: "Standard goods", code: "TG-STD" }, { value: "Exempt goods", code: "TG-EXM" },
      { value: "Services", code: "TG-SVC" }, { value: "Imports", code: "TG-IMP" },
    ],
  },
  {
    id: "uom", label: "Units of measure", count: 12,
    reason: "Standard set for retail & distribution.",
    records: [
      { value: "Piece", code: "PCS" }, { value: "Box", code: "BOX" }, { value: "Carton", code: "CTN" },
      { value: "Kilogram", code: "KG" }, { value: "Gram", code: "G" }, { value: "Litre", code: "L" },
      { value: "Metre", code: "M" }, { value: "Dozen", code: "DZN" }, { value: "Pack" },
      { value: "Pair", code: "PR" }, { value: "Set", code: "SET" }, { value: "Roll", code: "ROL" },
    ],
  },
  {
    id: "item-groups", label: "Item groups", count: 9,
    reason: "Matched to your industry.",
    records: [
      { value: "Beverages", code: "BEV" }, { value: "Confectionery", code: "CNF" },
      { value: "Dairy", code: "DRY" }, { value: "Household", code: "HHD" },
      { value: "Personal care", code: "PRC" }, { value: "Packaged food", code: "PKF" },
      { value: "Stationery", code: "STA" }, { value: "Electronics", code: "ELC" }, { value: "Other" },
    ],
  },
  {
    id: "payment-terms", label: "Payment terms", count: 5,
    reason: "Common terms for your country.",
    records: [
      { value: "Cash on delivery", code: "COD" }, { value: "Net 7", code: "N7" },
      { value: "Net 15", code: "N15" }, { value: "Net 30", code: "N30" }, { value: "Advance" },
    ],
  },
  {
    id: "warehouses", label: "Warehouses", count: 2,
    reason: "Every workspace starts with a main store.",
    records: [{ value: "Main Store", code: "WH-01" }, { value: "Damaged Goods", code: "WH-99" }],
  },
];

/** The ledger is NOT a generic manifest entry — it is the parent of the tax sets. */
const LEDGER = {
  id: "coa",
  label: "Chart of accounts",
  count: 48,
  reason: "Nepal-standard chart, ready to post against.",
  records: [
    { value: "Cash in hand", code: "1000" }, { value: "Bank accounts", code: "1010" },
    { value: "Accounts receivable", code: "1100" }, { value: "Inventory", code: "1200" },
    { value: "Accounts payable", code: "2000" }, { value: "VAT payable", code: "2100" },
    { value: "Share capital", code: "3000" }, { value: "Sales revenue", code: "4000" },
    { value: "Cost of goods sold", code: "5000" }, { value: "Operating expenses", code: "6000" },
  ],
};

/** Records the backend creates unconditionally — no opt-out, no detail view. */
const ALWAYS_CREATED_TAX = "Default tax record";

// ════════════════════════════════════════════════════════════════════════════
// PAYMENT METHODS  (availability-derived from the tenant's currency + country)
// ════════════════════════════════════════════════════════════════════════════

type MethodKind = "scan" | "redirect" | "card";
type Method = { id: string; name: string; desc: string; kind: MethodKind; mark: string };

const METHODS: Method[] = [
  { id: "esewa", name: "eSewa", desc: "Scan with the eSewa app, or pay on their page.", kind: "scan", mark: "e" },
  { id: "khalti", name: "Khalti", desc: "You'll finish the payment on Khalti.", kind: "redirect", mark: "K" },
  { id: "card", name: "Card", desc: "Visa, Mastercard and American Express.", kind: "card", mark: "C" },
];

type PayOutcome = "success" | "declined" | "expired" | "interrupted";

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

const LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";

function Field({
  label, required, hint, error, children,
}: {
  label: string; required?: boolean; hint?: string; error?: string | null; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5">
        <span className="text-[11.5px] font-semibold text-bz-text">{label}</span>
        {required && <span className="text-[11.5px] text-[#C0413A]">*</span>}
        {hint && <span className="ml-auto text-[10.5px] text-bz-text-soft">{hint}</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 flex items-start gap-1 text-[11px] font-medium text-[#9A2E29]">
          <AlertCircle size={11} className="mt-px shrink-0" />
          {error}
        </span>
      )}
    </label>
  );
}

const INPUT_BASE =
  "h-9 w-full rounded-bz-md border bg-bz-surface px-2.5 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text";

function TextInput({
  invalid, className, ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      className={cn(INPUT_BASE, invalid ? "border-[#C0413A]" : "border-bz-line-soft", className)}
    />
  );
}

function Select({
  value, onChange, options, placeholder, invalid, disabled,
}: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder?: string; invalid?: boolean; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          INPUT_BASE, "appearance-none pr-8 disabled:opacity-55",
          invalid ? "border-[#C0413A]" : "border-bz-line-soft",
          value ? "text-bz-text" : "text-bz-text-soft",
        )}
      >
        <option value="">{placeholder ?? "Select…"}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
    </div>
  );
}

function Switch({
  value, onChange, disabled, ariaLabel,
}: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onChange(!value); }}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute size-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          value ? "translate-x-[16px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

function Primary({
  children, onClick, busy, disabled, className,
}: {
  children: React.ReactNode; onClick?: () => void; busy?: boolean; disabled?: boolean; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
    >
      {busy && <Loader2 size={13} className="animate-spin" />}
      {children}
    </button>
  );
}

function Ghost({
  children, onClick, disabled, className,
}: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text transition-colors hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** The one refusal channel. The commit control never disables on invalidity —
 *  it activates, force-reveals every error, and NAMES the reason here. */
function Refusal({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-1.5 rounded-bz-md bg-[#FBE7E5] px-2.5 py-2 text-[11.5px] font-medium text-[#9A2E29]">
      <AlertCircle size={13} className="mt-px shrink-0" />
      {message}
    </p>
  );
}

function StepHead({ step, title, sub }: { step: StepDef; title: string; sub: string }) {
  const Icon = step.icon;
  return (
    <header className="mb-7">
      <span className="mb-3.5 flex size-9 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted">
        <Icon size={16} strokeWidth={1.9} />
      </span>
      <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-bz-text">{title}</h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-bz-text-muted">{sub}</p>
    </header>
  );
}

/** Section divider inside a step — hairline + quiet label, never a nested box. */
function Band({ label, children, aside }: { label: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border-t border-bz-line-soft pt-5">
      <div className="mb-3.5 flex items-center gap-3">
        <span className={LABEL}>{label}</span>
        {aside && <span className="ml-auto">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, strong }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className={cn("text-[12px]", strong ? "font-semibold text-bz-text" : "text-bz-text-muted")}>{label}</span>
      <span className={cn("text-[12.5px]", NUM, strong ? "font-semibold text-bz-text" : "text-bz-text")}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST  — the flow's transient channel. One at a time; dismissible.
// ════════════════════════════════════════════════════════════════════════════

type Toast = { id: number; tone: "ok" | "warn" | "info"; text: string } | null;

function ToastDock({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const warn = toast.tone === "warn";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-7 z-[130] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[440px] items-center gap-2.5 rounded-bz-lg border border-bz-line-soft bg-bz-surface py-2.5 pl-3 pr-2 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.28)]">
        <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-bz-pill", warn ? "bg-[#FBE7E5]" : "bg-bz-fire/[0.22]")}>
          {warn ? <AlertCircle size={12} className="text-[#9A2E29]" /> : <Check size={12} className="text-bz-leaf-deep" strokeWidth={3} />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.text}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM  — the ONE confirmation in the journey: you are about to lose the
// automatic confirmation of a payment we are still watching.
// ════════════════════════════════════════════════════════════════════════════

function ConfirmLeaveWatch({ onKeep, onLeave }: { onKeep: () => void; onLeave: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(10,16,13,0.5)] px-4">
      <div className="w-full max-w-[380px] rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5 shadow-[0_24px_60px_-24px_rgba(15,20,17,0.4)]">
        <p className="text-[14px] font-semibold text-bz-text">Stop watching this payment?</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-bz-text-muted">
          We're still waiting on the provider to confirm it. If you leave now we can't confirm it
          automatically — and if the money has already left your account, you'll need support to
          reconcile it.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Ghost onClick={onKeep}>Keep waiting</Ghost>
          <Primary onClick={onLeave}>Stop and leave</Primary>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROGRESS RAIL  — one entry per step. Four orthogonal signals: complete /
// active / locked / not-required. An entry that is CURRENT is never hidden, so
// the model always has exactly one active entry. Frozen once payment completes.
// ════════════════════════════════════════════════════════════════════════════

type RailEntry = {
  step: StepDef;
  complete: boolean;
  active: boolean;
  notRequired: boolean;
  activatable: boolean;
};

function Rail({ entries, onJump }: { entries: RailEntry[]; onJump: (id: StepId) => void }) {
  return (
    <ol className="flex flex-col">
      {entries.map((e, i) => {
        const last = i === entries.length - 1;
        return (
          <li key={e.step.id} className="relative">
            {!last && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%-16px)] w-px",
                  e.complete ? "bg-bz-fire/40" : "bg-white/10",
                )}
              />
            )}
            <button
              type="button"
              disabled={!e.activatable}
              onClick={() => onJump(e.step.id)}
              className={cn(
                "relative flex w-full items-start gap-3 rounded-bz-md py-2 pl-0 pr-2 text-left transition-colors",
                e.activatable ? "hover:bg-white/[0.05]" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "mt-px flex size-[23px] shrink-0 items-center justify-center rounded-bz-pill border text-[10px] font-bold",
                  e.complete
                    ? "border-bz-fire bg-bz-fire text-bz-olive"
                    : e.active
                    ? "border-bz-fire text-bz-fire"
                    : "border-white/20 text-white/35",
                )}
              >
                {e.complete ? <Check size={12} strokeWidth={3} /> : <span className={NUM}>{i + 1}</span>}
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "truncate text-[12.5px]",
                      e.active ? "font-semibold text-bz-text-on-dark" : e.complete ? "text-white/70" : "text-white/40",
                    )}
                  >
                    {e.step.label}
                  </span>
                  {e.notRequired && (
                    <span className="shrink-0 rounded-bz-sm bg-white/[0.08] px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-white/50">
                      Not required
                    </span>
                  )}
                </span>
                {/* the backed per-step description — surfaced only where it helps */}
                {e.active && (
                  <span className="mt-0.5 block text-[11px] leading-snug text-white/45">{e.step.blurb}</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP · ACCOUNT CREATION
// Uniquely, this step does not advance the journey — it EXITS to an email
// verification surface. There is no in-place path past it.
// ════════════════════════════════════════════════════════════════════════════

const PW_RULES: { key: string; label: string; test: (v: string) => boolean }[] = [
  { key: "len", label: "at least 8 characters", test: (v) => v.length >= 8 },
  { key: "upper", label: "an uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "a lowercase letter", test: (v) => /[a-z]/.test(v) },
  { key: "digit", label: "a number", test: (v) => /\d/.test(v) },
  { key: "special", label: "a symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const NAME_OK = /^[A-Za-z ]+$/;

function nameError(v: string, what: string) {
  if (!v.trim()) return `${what} is required.`;
  if (v.trim().length < 2) return `${what} must be at least 2 characters.`;
  if (!NAME_OK.test(v)) return `${what} can only contain letters and spaces.`;
  return null;
}
const emailError = (v: string) =>
  !v.trim() ? "Email is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address." : null;

function AccountStep({ onToast }: { onToast: (t: "ok" | "warn" | "info", s: string) => void }) {
  const [first, setFirst] = React.useState("");
  const [last, setLast] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [showPw2, setShowPw2] = React.useState(false);
  const [consent, setConsent] = React.useState(false);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [busy, setBusy] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState<string | null>(null);
  const timer = React.useRef<number | null>(null);
  React.useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const show = (k: string) => !!touched[k];

  const passed = PW_RULES.filter((r) => r.test(pw));
  const firstUnmet = PW_RULES.find((r) => !r.test(pw)) ?? null;   // one hint at a time
  const pwOk = passed.length === PW_RULES.length;
  const match = pw.length > 0 && pw === pw2;

  const errFirst = nameError(first, "First name");
  const errLast = nameError(last, "Last name");
  const errEmail = emailError(email);
  const valid = !errFirst && !errLast && !errEmail && pwOk && match && consent;

  // The account-creation step never reports completion. Success LEAVES.
  function submit() {
    if (busy) return;
    if (!valid) {
      setTouched({ first: true, last: true, email: true, pw: true, pw2: true, consent: true });
      setRefusal(
        errFirst || errLast || errEmail ||
        (!pwOk ? `Your password still needs ${firstUnmet?.label}.` : null) ||
        (!match ? "The two passwords don't match." : null) ||
        "You need to accept the terms before we can create your account.",
      );
      return;
    }
    setRefusal(null);
    setBusy(true);
    timer.current = window.setTimeout(() => {
      setBusy(false);
      setSent(email.trim());
      onToast("ok", "Account created — check your email.");
    }, 1100);
  }

  if (sent) {
    // The exit surface. Not a step of the journey — the journey resumes from the link.
    return (
      <div className="py-6">
        <span className="mb-4 flex size-11 items-center justify-center rounded-bz-lg bg-bz-fire/[0.2] text-bz-leaf-deep">
          <Mail size={20} />
        </span>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-bz-text">Check your email</h1>
        <p className="mt-2 max-w-[420px] text-[13px] leading-relaxed text-bz-text-muted">
          We sent a verification link to <span className="font-semibold text-bz-text">{sent}</span>. Open it to
          verify your address — the link brings you straight back here, at the next step.
        </p>
        <p className="mt-5 border-t border-bz-line-soft pt-4 text-[11.5px] text-bz-text-soft">
          Didn't get it? Check your spam folder, or resend it from the verification page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <StepHead
        step={STEPS[0]}
        title="Create your Bizak account"
        sub="This is the account you'll administer the workspace with."
      />

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required error={show("first") ? errFirst : null}>
            <TextInput
              value={first} placeholder="Mira" invalid={show("first") && !!errFirst}
              onChange={(e) => setFirst(e.target.value)} onBlur={() => touch("first")}
            />
          </Field>
          <Field label="Last name" required error={show("last") ? errLast : null}>
            <TextInput
              value={last} placeholder="Silwal" invalid={show("last") && !!errLast}
              onChange={(e) => setLast(e.target.value)} onBlur={() => touch("last")}
            />
          </Field>
        </div>

        <Field label="Work email" required hint="This is also your username" error={show("email") ? errEmail : null}>
          <TextInput
            type="email" value={email} placeholder="mira@company.com" invalid={show("email") && !!errEmail}
            onChange={(e) => setEmail(e.target.value)} onBlur={() => touch("email")}
          />
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <TextInput
              type={showPw ? "text" : "password"} value={pw} className="pr-9"
              onChange={(e) => { setPw(e.target.value); touch("pw"); }}
            />
            <button
              type="button" onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </Field>

        {/* Five independent rules → a five-segment meter + ONE hint at a time. */}
        {show("pw") && (
          <div className="-mt-1.5">
            <div className="flex gap-1">
              {PW_RULES.map((r, i) => (
                <span
                  key={r.key}
                  className={cn(
                    "h-[3px] flex-1 rounded-bz-pill transition-colors",
                    i < passed.length ? "bg-bz-fire" : "bg-bz-line-soft",
                  )}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-bz-text-muted">
              {pwOk ? (
                <span className="inline-flex items-center gap-1 font-medium text-bz-leaf-deep">
                  <Check size={11} strokeWidth={3} /> Strong password
                </span>
              ) : (
                <>Still needs <span className="font-medium text-bz-text">{firstUnmet?.label}</span>.</>
              )}
            </p>
          </div>
        )}

        <Field label="Confirm password" required>
          <div className="relative">
            <TextInput
              type={showPw2 ? "text" : "password"} value={pw2} className="pr-9"
              invalid={show("pw2") && pw2.length > 0 && !match}
              onChange={(e) => { setPw2(e.target.value); touch("pw2"); }}
            />
            <button
              type="button" onClick={() => setShowPw2((v) => !v)}
              aria-label={showPw2 ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
            >
              {showPw2 ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </Field>
        {show("pw2") && pw2.length > 0 && (
          <p className={cn("-mt-2 flex items-center gap-1 text-[11px] font-medium", match ? "text-bz-leaf-deep" : "text-[#9A2E29]")}>
            {match ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
            {match ? "Passwords match" : "Passwords don't match"}
          </p>
        )}

        <button
          type="button"
          onClick={() => { setConsent((v) => !v); touch("consent"); }}
          className="flex w-full items-start gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 p-3 text-left"
        >
          <span
            className={cn(
              "mt-px flex size-4 shrink-0 items-center justify-center rounded-bz-sm border transition-colors",
              consent ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface",
            )}
          >
            {consent && <Check size={11} strokeWidth={3} />}
          </span>
          <span className="text-[12px] leading-relaxed text-bz-text-muted">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="font-semibold text-bz-text underline underline-offset-2">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="font-semibold text-bz-text underline underline-offset-2">Privacy Policy</a>.
          </span>
        </button>
        {show("consent") && !consent && (
          <p className="-mt-2 text-[11px] font-medium text-[#9A2E29]">You need to accept the terms to continue.</p>
        )}

        <Refusal message={refusal} />

        <div className="flex flex-col gap-3 border-t border-bz-line-soft pt-5 sm:flex-row sm:items-center">
          <Primary onClick={submit} busy={busy} className="w-full sm:w-auto">
            {busy ? "Creating your account…" : "Create account"}
            {!busy && <ArrowRight size={13} />}
          </Primary>
          <p className="text-[11.5px] text-bz-text-muted sm:ml-auto">
            Already have an account?{" "}
            <span className="cursor-pointer font-semibold text-bz-text underline underline-offset-2">Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP · TENANT / COMPANY PROFILE
// The locale (currency · timezone · dial code) is a DERIVED READOUT of the
// country — never three pre-filled selects pretending to be the user's choice.
// ════════════════════════════════════════════════════════════════════════════

export type TenantState = {
  org: string; address: string; email: string; phone: string;
  country: string; industry: string; currency: string; tz: string;
  multiSub: boolean;
};

const TENANT_INIT: TenantState = {
  org: "", address: "", email: "", phone: "",
  country: "", industry: "", currency: "", tz: "",
  multiSub: false,
};

function TenantStep({
  value, onChange, onCommit, onToast,
}: {
  value: TenantState;
  onChange: (v: TenantState) => void;
  onCommit: () => void;
  onToast: (t: "ok" | "warn" | "info", s: string) => void;
}) {
  const [loadingOpts, setLoadingOpts] = React.useState(value.country === "");
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [editLocale, setEditLocale] = React.useState(false);
  const timers = React.useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  // The option source loads once on entry — and SAYS SO while it loads.
  React.useEffect(() => {
    if (!loadingOpts) return;
    after(700, () => setLoadingOpts(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const show = (k: string) => !!touched[k];

  const c = countryByName(value.country);
  const errOrg = value.org.trim() ? null : "Company name is required.";
  const errPhone = value.phone.trim() ? null : "Phone number is required.";
  const errCountry = value.country ? null : "Country is required — it sets your locale and fiscal year.";
  const errEmail = value.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)
    ? "That doesn't look like a valid email address." : null;
  const valid = !errOrg && !errPhone && !errCountry && !errEmail;

  // Country is the cascade root: it re-derives the dial code, the timezone and
  // the currency. Clearing it BLANKS them — they never stand stale.
  function setCountry(name: string) {
    touch("country");
    const next = countryByName(name);
    const overridden = value.currency && c && value.currency !== c.currency;
    onChange({
      ...value,
      country: name,
      currency: next ? next.currency : "",
      tz: next ? next.tz : "",
    });
    if (next && overridden) onToast("info", `Locale updated to match ${next.name}.`);
  }

  function commit() {
    if (busy) return;
    if (!valid) {
      setTouched({ org: true, phone: true, country: true, email: true });
      setRefusal(errOrg || errPhone || errCountry || errEmail);
      return;
    }
    setRefusal(null);
    setBusy(true);
    after(1000, () => { setBusy(false); onCommit(); });
  }

  return (
    <div>
      <StepHead
        step={STEPS[1]}
        title="Tell us about your company"
        sub="This names your workspace and sets its locale. Only an administrator can change it later."
      />

      <div className="space-y-4">
        <Field label="Company name" required error={show("org") ? errOrg : null}>
          <TextInput
            value={value.org} placeholder="Himalayan Retail Group" invalid={show("org") && !!errOrg}
            onChange={(e) => onChange({ ...value, org: e.target.value })} onBlur={() => touch("org")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country" required error={show("country") ? errCountry : null}>
            {loadingOpts ? (
              <div className="flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/60 px-2.5 text-[12px] text-bz-text-soft">
                <Loader2 size={12} className="animate-spin" /> Loading countries…
              </div>
            ) : (
              <Select
                value={value.country} onChange={setCountry} options={COUNTRIES.map((x) => x.name)}
                placeholder="Select a country" invalid={show("country") && !!errCountry}
              />
            )}
          </Field>
          <Field label="Industry" hint="Optional">
            <Select
              value={value.industry} disabled={loadingOpts}
              onChange={(v) => onChange({ ...value, industry: v })}
              options={INDUSTRIES} placeholder={loadingOpts ? "Loading…" : "Select an industry"}
            />
          </Field>
        </div>

        <Field label="Phone" required error={show("phone") ? errPhone : null}>
          <div className="flex">
            {/* Presentation only — derived from the country, never merged into the value. */}
            <span
              className={cn(
                "flex h-9 min-w-[58px] items-center justify-center rounded-l-bz-md border border-r-0 border-bz-line-soft bg-bz-paper-warm px-2 text-[12.5px] font-medium",
                NUM, c ? "text-bz-text" : "text-bz-text-soft",
              )}
            >
              {c ? c.dial : "—"}
            </span>
            <TextInput
              value={value.phone} placeholder="9800000000" className="rounded-l-none"
              invalid={show("phone") && !!errPhone}
              onChange={(e) => onChange({ ...value, phone: e.target.value })} onBlur={() => touch("phone")}
            />
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Billing email" hint="Optional" error={show("email") ? errEmail : null}>
            <TextInput
              type="email" value={value.email} placeholder="accounts@company.com"
              invalid={show("email") && !!errEmail}
              onChange={(e) => onChange({ ...value, email: e.target.value })} onBlur={() => touch("email")}
            />
          </Field>
          <Field label="Address" hint="Optional">
            <TextInput
              value={value.address} placeholder="Durbar Marg, Kathmandu"
              onChange={(e) => onChange({ ...value, address: e.target.value })}
            />
          </Field>
        </div>

        {/* Derived locale — the honest readout. Blank until a country is chosen. */}
        <Band
          label="Locale"
          aside={
            c && (
              <button
                type="button"
                onClick={() => setEditLocale((v) => !v)}
                className="text-[11px] font-semibold text-bz-text underline underline-offset-2 hover:text-bz-text-muted"
              >
                {editLocale ? "Done" : "Change"}
              </button>
            )
          }
        >
          {!c ? (
            <p className="text-[12px] text-bz-text-soft">
              Choose a country and we'll set your currency, timezone and dialling code.
            </p>
          ) : editLocale ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Currency">
                <Select value={value.currency} onChange={(v) => onChange({ ...value, currency: v })} options={CURRENCIES} />
              </Field>
              <Field label="Timezone">
                <Select value={value.tz} onChange={(v) => onChange({ ...value, tz: v })} options={TIMEZONES} />
              </Field>
            </div>
          ) : (
            <p className={cn("text-[12.5px] text-bz-text", NUM)}>
              {value.currency} <span className="text-bz-text-soft">·</span> {value.tz}{" "}
              <span className="text-bz-text-soft">·</span> {c.dial}
              <span className="ml-2 text-[11px] font-normal text-bz-text-muted">derived from {c.name}</span>
            </p>
          )}
        </Band>

        <Band label="Structure">
          <div className="flex items-start gap-3">
            <Switch
              value={value.multiSub}
              onChange={(v) => onChange({ ...value, multiSub: v })}
              ariaLabel="Run more than one company"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-bz-text">Run more than one company</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">
                Turn this on if you'll keep separate books for subsidiaries or branches and consolidate
                across them. You can add the entities after setup.
              </p>
            </div>
          </div>
        </Band>

        <Refusal message={refusal} />

        <div className="flex border-t border-bz-line-soft pt-5">
          <Primary onClick={commit} busy={busy} className="w-full sm:w-auto">
            {busy ? "Saving your company…" : "Save and continue"}
            {!busy && <ArrowRight size={13} />}
          </Primary>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP · PLAN SELECTION
// Two modes — CHOOSE (the catalogue) and CONFIGURE (seats + total). Unlike the
// legacy step, the billing term stays reachable in BOTH: a term you can't change
// once you've picked a plan is a trap. A free plan commits in one click.
// ════════════════════════════════════════════════════════════════════════════

export type PlanChoice = {
  planId: string | null; term: Term; seats: number; addOnSeats: number; autoRenew: boolean;
};

const PLAN_INIT: PlanChoice = { planId: null, term: "monthly", seats: 0, addOnSeats: 0, autoRenew: true };

function TermSwitch({ term, onChange, saving }: { term: Term; onChange: (t: Term) => void; saving: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="inline-flex overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
        {(["monthly", "annual"] as Term[]).map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={cn(
              "px-3 py-1.5 text-[11.5px] font-medium capitalize transition-colors",
              i > 0 && "border-l border-bz-line-soft",
              term === t ? "bg-bz-deep text-bz-text-on-dark" : "text-bz-text-muted hover:bg-bz-paper-warm",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {saving > 0 && (
        <span className={cn("text-[11px] font-semibold text-bz-leaf-deep", NUM)}>Save {saving}% yearly</span>
      )}
    </div>
  );
}

function PlanCard({
  plan, term, selected, onSelect,
}: { plan: Plan; term: Term; selected: boolean; onSelect: () => void }) {
  const price = atTerm(plan.monthly, term);
  const free = isFree(plan);
  const label = free ? "Start free" : plan.trialDays ? `Start ${plan.trialDays}-day trial` : "Choose plan";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col rounded-bz-lg border bg-bz-surface p-4 text-left transition-colors",
        selected ? "border-bz-text" : "border-bz-line-soft hover:border-bz-line",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[13.5px] font-semibold text-bz-text">{plan.name}</span>
        {plan.popular && (
          <span className="rounded-bz-sm bg-bz-fire px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-bz-olive">
            Popular
          </span>
        )}
        {selected && <Check size={13} className="ml-auto text-bz-leaf-deep" strokeWidth={3} />}
      </div>

      <p className="mt-1 text-[11.5px] leading-relaxed text-bz-text-muted">{plan.desc}</p>

      <p className="mt-3.5 flex items-baseline gap-1.5">
        <span className={cn("text-[21px] font-semibold tracking-tight text-bz-text", NUM)}>
          {free ? "Free" : money(price)}
        </span>
        {!free && <span className="text-[11px] text-bz-text-muted">{TERM_LABEL[term]}</span>}
      </p>
      <p className={cn("mt-1 text-[11px] text-bz-text-soft", NUM)}>
        {plural(plan.includedSeats, "user")} included
      </p>

      <ul className="mt-3.5 space-y-1.5 border-t border-bz-line-soft pt-3.5">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-start gap-1.5">
            {f.on ? (
              <Check size={12} className="mt-px shrink-0 text-bz-leaf-deep" strokeWidth={2.6} />
            ) : (
              <Minus size={12} className="mt-px shrink-0 text-bz-text-soft" />
            )}
            <span className={cn("text-[11.5px]", f.on ? "text-bz-text-muted" : "text-bz-text-soft line-through")}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      <span
        className={cn(
          "mt-4 inline-flex h-8 items-center justify-center gap-1.5 rounded-bz-md px-3 text-[12px] font-semibold transition-colors",
          selected ? "bg-bz-deep text-bz-text-on-dark" : "border border-bz-line bg-bz-surface text-bz-text",
        )}
      >
        {selected ? "Selected" : label}
      </span>
    </button>
  );
}

function Stepper({
  value, min, onChange, onBlurCorrect, disabled,
}: {
  value: number; min: number; onChange: (v: number) => void; onBlurCorrect: () => void; disabled?: boolean;
}) {
  const btn =
    "flex size-8 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted transition-colors hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className={btn} disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label="Fewer">
        <Minus size={13} />
      </button>
      {/* free typing — the floor is enforced on blur, never mid-keystroke */}
      <input
        type="text"
        inputMode="numeric"
        value={Number.isNaN(value) ? "" : String(value)}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value.replace(/\D/g, "")))}
        onBlur={onBlurCorrect}
        className={cn(
          "h-8 w-14 rounded-bz-md border border-bz-line-soft bg-bz-surface text-center text-[12.5px] font-semibold text-bz-text outline-none focus:border-bz-text",
          NUM,
        )}
      />
      <button type="button" className={btn} disabled={disabled} onClick={() => onChange((Number.isNaN(value) ? min : value) + 1)} aria-label="More">
        <Plus size={13} />
      </button>
    </div>
  );
}

function PlanStep({
  value, onChange, onCommit, failFirst, onToast,
}: {
  value: PlanChoice;
  onChange: (v: PlanChoice) => void;
  /** free = the plan costs nothing, so no payment step will exist */
  onCommit: (free: boolean) => void;
  failFirst: boolean;
  onToast: (t: "ok" | "warn" | "info", s: string) => void;
}) {
  const [load, setLoad] = React.useState<"loading" | "ready" | "failed">("loading");
  const [mode, setMode] = React.useState<"choose" | "configure">(value.planId ? "configure" : "choose");
  const [busy, setBusy] = React.useState(false);
  const failedOnce = React.useRef(false);
  const committing = React.useRef(false);   // idempotence guard for the free auto-commit
  const timers = React.useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const fetchPlans = React.useCallback(() => {
    setLoad("loading");
    after(750, () => {
      if (failFirst && !failedOnce.current) { failedOnce.current = true; setLoad("failed"); return; }
      setLoad("ready");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failFirst]);

  React.useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const plan = planById(value.planId);
  const quote = plan && !isFree(plan)
    ? quoteFor(plan, value.term, Number.isNaN(value.seats) ? plan.includedSeats : value.seats, value.addOnSeats)
    : null;

  // The advertised saving is shown only when it is genuinely positive.
  const saving = Math.round((1 - ANNUAL_FACTOR) * 100);

  function pick(p: Plan) {
    if (isFree(p)) {
      if (committing.current) return;            // the select action must not double-fire
      committing.current = true;
      onChange({ ...value, planId: p.id, seats: p.includedSeats, addOnSeats: 0 });
      setBusy(true);
      after(800, () => { setBusy(false); onCommit(true); });
      return;
    }
    onChange({ ...value, planId: p.id, seats: p.includedSeats, addOnSeats: 0 });
    setMode("configure");
  }

  function commit() {
    if (busy || !plan || !quote) return;
    if (!(quote.seats >= 1)) { onToast("warn", "You need at least one user."); return; }
    setBusy(true);
    after(900, () => { setBusy(false); onCommit(false); });
  }

  if (load === "loading") {
    return (
      <div>
        <StepHead step={STEPS[2]} title="Choose your plan" sub="Loading the plans available to you…" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[268px] animate-pulse rounded-bz-lg bg-bz-paper-warm" />
          ))}
        </div>
      </div>
    );
  }

  if (load === "failed") {
    return (
      <div>
        <StepHead step={STEPS[2]} title="Choose your plan" sub="We couldn't load the plan catalogue." />
        <div className="flex flex-col items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-bz-lg bg-bz-paper-warm text-bz-text-muted">
            <WifiOff size={20} />
          </span>
          <p className="text-[14px] font-semibold text-bz-text">No plans came back</p>
          <p className="max-w-[320px] text-[12.5px] leading-relaxed text-bz-text-muted">
            The request didn't reach us. Nothing is lost — try again, or contact support if it keeps failing.
          </p>
          <Ghost onClick={fetchPlans} className="mt-1">
            <RefreshCw size={13} /> Try again
          </Ghost>
        </div>
      </div>
    );
  }

  // ── CONFIGURE ─────────────────────────────────────────────────────────────
  if (mode === "configure" && plan && quote) {
    const perExtra = atTerm(plan.extraSeat, value.term);
    const over = quote.extraSeats > 0;
    return (
      <div>
        <StepHead
          step={STEPS[2]}
          title={`Size up ${plan.name}`}
          sub="Add the users you need. The total below is exactly what you'll pay at the next step."
        />

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMode("choose")}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-bz-text underline underline-offset-2 hover:text-bz-text-muted"
          >
            <ArrowLeft size={12} /> Change plan
          </button>
          <span className="ml-auto">
            {/* the term stays reachable while configuring — every price re-derives */}
            <TermSwitch term={value.term} onChange={(t) => onChange({ ...value, term: t })} saving={saving} />
          </span>
        </div>

        <div className="space-y-5">
          <Band label="Users">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-bz-text">Named users</p>
                <p className={cn("mt-0.5 text-[11.5px] text-bz-text-muted", NUM)}>
                  {plural(plan.includedSeats, "user")} included
                  {plan.extraSeat > 0 && <> · {money(perExtra)} each beyond that, {TERM_LABEL[value.term]}</>}
                </p>
              </div>
              <Stepper
                value={value.seats}
                min={plan.includedSeats}
                onChange={(v) => onChange({ ...value, seats: v })}
                onBlurCorrect={() => {
                  const v = Number.isNaN(value.seats) ? plan.includedSeats : Math.max(plan.includedSeats, value.seats);
                  onChange({ ...value, seats: v });
                }}
              />
            </div>
            {over && (
              <p className="mt-3 flex items-start gap-1.5 rounded-bz-md bg-bz-fire/[0.14] px-2.5 py-2 text-[11.5px] font-medium text-bz-text">
                <AlertCircle size={12} className="mt-px shrink-0 text-bz-leaf-deep" />
                <span className={NUM}>
                  {plural(quote.extraSeats, "extra user")} beyond the allowance — {money(quote.extraCharge)} added.
                </span>
              </p>
            )}
          </Band>

          {plan.addOn && (
            <Band label={plan.addOn.label}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-bz-text">{plan.addOn.label}s</p>
                  <p className={cn("mt-0.5 text-[11.5px] text-bz-text-muted", NUM)}>
                    {plan.addOn.blurb} {money(atTerm(plan.addOn.monthly, value.term))} each, {TERM_LABEL[value.term]}
                  </p>
                </div>
                <Stepper
                  value={value.addOnSeats}
                  min={0}
                  onChange={(v) => onChange({ ...value, addOnSeats: v })}
                  onBlurCorrect={() =>
                    onChange({ ...value, addOnSeats: Number.isNaN(value.addOnSeats) ? 0 : Math.max(0, value.addOnSeats) })
                  }
                />
              </div>
            </Band>
          )}

          <Band label="Renewal">
            <div className="flex items-start gap-3">
              <Switch
                value={value.autoRenew}
                onChange={(v) => onChange({ ...value, autoRenew: v })}
                ariaLabel="Renew automatically"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-bz-text">Renew automatically</p>
                <p className="mt-0.5 text-[11.5px] text-bz-text-muted">
                  {value.autoRenew
                    ? `We'll renew ${plan.name} ${value.term === "annual" ? "each year" : "each month"} until you cancel.`
                    : "Your subscription will lapse at the end of the term unless you renew it."}
                </p>
              </div>
            </div>
          </Band>

          <Band label="Total">
            <div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/50 px-4 py-3">
              <Row
                label={<>{plan.name} · {value.term} <span className="text-bz-text-soft">({plural(plan.includedSeats, "user")} included)</span></>}
                value={money(quote.base)}
              />
              {quote.extraSeats > 0 && (
                <Row
                  label={<span className={NUM}>{plural(quote.extraSeats, "extra user")} × {money(perExtra)}</span>}
                  value={money(quote.extraCharge)}
                />
              )}
              {plan.addOn && quote.addOnSeats > 0 && (
                <Row
                  label={<span className={NUM}>{plural(quote.addOnSeats, plan.addOn.label.toLowerCase())} × {money(atTerm(plan.addOn.monthly, value.term))}</span>}
                  value={money(quote.addOnCharge)}
                />
              )}
              <div className="mt-1.5 border-t border-bz-line-soft pt-1.5">
                <Row label={`Due today · ${TERM_LABEL[value.term]}`} value={money(quote.total)} strong />
              </div>
            </div>
          </Band>

          <div className="flex border-t border-bz-line-soft pt-5">
            <Primary onClick={commit} busy={busy} className="w-full sm:w-auto">
              {busy ? "Saving your plan…" : `Continue to payment · ${money(quote.total)}`}
              {!busy && <ArrowRight size={13} />}
            </Primary>
          </div>
        </div>
      </div>
    );
  }

  // ── CHOOSE ────────────────────────────────────────────────────────────────
  return (
    <div>
      <StepHead
        step={STEPS[2]}
        title="Choose your plan"
        sub="Pick the plan that fits. You can change it any time from the workspace."
      />
      <div className="mb-4 flex justify-end">
        <TermSwitch term={value.term} onChange={(t) => onChange({ ...value, term: t })} saving={saving} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {PLANS.map((p) => (
          <PlanCard
            key={p.id}
            plan={p}
            term={value.term}
            selected={value.planId === p.id}
            onSelect={() => pick(p)}
          />
        ))}
      </div>
      {busy && (
        <p className="mt-5 flex items-center gap-2 text-[12px] font-medium text-bz-text-muted">
          <Loader2 size={13} className="animate-spin" /> Activating your free plan…
        </p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAYMENT · scan artefact  (a deterministic stand-in for the provider-rendered
// code — no gradients, one flat mark)
// ════════════════════════════════════════════════════════════════════════════

function QrMark({ seed, size = 132 }: { seed: string; size?: number }) {
  const cells = React.useMemo(() => {
    // deterministic LCG from the transaction id — the same txn always renders the same mark
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    const n = 21;
    const out: { x: number; y: number }[] = [];
    const finder = (x: number, y: number) =>
      (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (finder(x, y)) {
          const fx = x > n - 8 ? x - (n - 7) : x;
          const fy = y > n - 8 ? y - (n - 7) : y;
          const edge = fx === 0 || fx === 6 || fy === 0 || fy === 6;
          const core = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
          if (edge || core) out.push({ x, y });
          continue;
        }
        s = (s * 1103515245 + 12345) >>> 0;
        if ((s >>> 16) % 2 === 0) out.push({ x, y });
      }
    }
    return out;
  }, [seed]);

  return (
    <svg viewBox="0 0 21 21" width={size} height={size} className="shrink-0 text-bz-deep" role="img" aria-label="Payment code">
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill="currentColor" />
      ))}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAYMENT · the record of an attempt that did not complete. Persistent and
// dismissible — the ONLY durable trace of a failed outcome. Four tones, and
// expiry / interruption / cancellation NEVER read as a decline.
// ════════════════════════════════════════════════════════════════════════════

type Attempt = {
  outcome: "declined" | "expired" | "interrupted" | "cancelled";
  txn: string; ref: string; method: string; amount: number; at: string;
};

const ATTEMPT_COPY: Record<Attempt["outcome"], { title: string; body: string; action: string }> = {
  declined: {
    title: "The payment was declined",
    body: "Your provider turned the charge down. Nothing was taken. Try a different method, or check with your bank.",
    action: "Try again",
  },
  expired: {
    title: "The payment code expired",
    body: "The code timed out before it was used. This says nothing about whether money moved — if it did, quote the reference below to support.",
    action: "Get a new code",
  },
  interrupted: {
    title: "We lost contact while confirming",
    body: "We couldn't reach the payment service to check on your transaction. The payment may still be going through — re-check before you pay again.",
    action: "Check again",
  },
  cancelled: {
    title: "You cancelled the payment",
    body: "We stopped watching this transaction. If you'd already paid in the app, quote the reference below to support.",
    action: "Start again",
  },
};

function AttemptRecord({
  attempt, onRetry, onDismiss, onToast,
}: {
  attempt: Attempt;
  onRetry: () => void;
  onDismiss: () => void;
  onToast: (t: "ok" | "warn" | "info", s: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const copy = ATTEMPT_COPY[attempt.outcome];
  const danger = attempt.outcome === "declined";

  const details = `Transaction: ${attempt.txn}\nReference: ${attempt.ref}\nMethod: ${attempt.method}\nAmount: ${money(attempt.amount)}\nTime: ${attempt.at}`;

  return (
    <div
      className={cn(
        "rounded-bz-lg border p-4",
        danger ? "border-[#F0C5C0] bg-[#FBE7E5]" : "border-bz-line bg-bz-paper-warm/70",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className={cn("mt-px shrink-0", danger ? "text-[#9A2E29]" : "text-bz-text-muted")}>
          {attempt.outcome === "interrupted" ? <WifiOff size={15} /> : attempt.outcome === "expired" ? <TimerReset size={15} /> : <AlertCircle size={15} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("text-[13px] font-semibold", danger ? "text-[#9A2E29]" : "text-bz-text")}>{copy.title}</p>
          <p className={cn("mt-1 text-[12px] leading-relaxed", danger ? "text-[#9A2E29]" : "text-bz-text-muted")}>{copy.body}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Ghost onClick={onRetry} className="h-8">
              <RefreshCw size={12} /> {copy.action}
            </Ghost>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-[11.5px] font-semibold text-bz-text underline underline-offset-2 hover:text-bz-text-muted"
            >
              {open ? "Hide reference" : "Reference details"}
            </button>
          </div>

          {open && (
            <dl className="mt-3 space-y-1 border-t border-bz-line-soft pt-2.5">
              {[
                ["Transaction", attempt.txn],
                ["Reference", attempt.ref],
                ["Method", attempt.method],
                ["Amount", money(attempt.amount)],
                ["Time", attempt.at],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="text-[11px] text-bz-text-muted">{k}</dt>
                  <dd className={cn("text-[11.5px] font-medium text-bz-text", NUM)}>{v}</dd>
                </div>
              ))}
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(details);
                    onToast("ok", "Reference copied — send it to support if money was deducted.");
                  }}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-bz-text underline underline-offset-2"
                >
                  <Copy size={11} /> Copy for support
                </button>
              </div>
            </dl>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={cn("flex size-6 shrink-0 items-center justify-center rounded-bz-sm", danger ? "text-[#9A2E29] hover:bg-[#F5D5D1]" : "text-bz-text-muted hover:bg-bz-line-soft")}
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP · PAYMENT
// ════════════════════════════════════════════════════════════════════════════

type Watch = { txn: string; ref: string; method: Method; mode: "scan" | "redirect" | "card"; scanned: boolean };

const PROMOS: Record<string, { off: number; message: string }> = {
  BIZAK20: { off: 0.2, message: "20% off your first term — applied." },
  // A server-accepted coupon worth nothing: it reads as applied, and the price
  // does not move. Two different predicates, honestly surfaced.
  WELCOME: { off: 0, message: "Welcome code accepted — no discount on this plan." },
};

/** Registered with the shell while a watch is live: any attempt to leave the
 *  step routes through the same confirmation dismissing the code does. */
type LeaveGuard = ((proceed: () => void) => void) | null;

function PaymentStep({
  quote, outcome, failFirst, onBack, onDone, onToast, onGuardLeave,
}: {
  quote: Quote;
  outcome: PayOutcome;
  failFirst: boolean;
  onBack: () => void;
  onDone: () => void;
  onToast: (t: "ok" | "warn" | "info", s: string) => void;
  onGuardLeave: (guard: LeaveGuard) => void;
}) {
  const [boot, setBoot] = React.useState<"loading" | "ready" | "failed">("loading");
  const [methodId, setMethodId] = React.useState<string | null>(null);
  const [scanMode, setScanMode] = React.useState<"scan" | "redirect">("scan");
  const [cardName, setCardName] = React.useState("");
  const [promo, setPromo] = React.useState("");
  const [applied, setApplied] = React.useState<{ code: string; off: number; message: string } | null>(null);
  const [checkingPromo, setCheckingPromo] = React.useState(false);
  const [initiating, setInitiating] = React.useState(false);
  const [watch, setWatch] = React.useState<Watch | null>(null);
  const [left, setLeft] = React.useState(0);           // countdown seconds on the code
  const [attempt, setAttempt] = React.useState<Attempt | null>(null);
  const [paid, setPaid] = React.useState(false);
  const [confirmLeave, setConfirmLeave] = React.useState<null | (() => void)>(null);
  const [refusal, setRefusal] = React.useState<string | null>(null);

  const failedOnce = React.useRef(false);
  const timers = React.useRef<number[]>([]);
  const txnSeq = React.useRef(0);
  const after = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const killTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  React.useEffect(() => () => killTimers(), []);

  const method = METHODS.find((m) => m.id === methodId) ?? null;
  const discount = applied ? Math.round(quote.total * applied.off) : 0;
  const payable = quote.total - discount;

  // the live transaction, readable from callbacks without stale closures
  const watchRef = React.useRef<Watch | null>(null);
  React.useEffect(() => { watchRef.current = watch; }, [watch]);

  // ── bootstrap: the tenant's currency/country, then the methods available for it
  const bootstrap = React.useCallback(() => {
    killTimers();
    setBoot("loading");
    after(900, () => {
      if (failFirst && !failedOnce.current) { failedOnce.current = true; setBoot("failed"); return; }
      setBoot("ready");
      setMethodId((cur) => cur ?? METHODS[0].id);   // preselect, without hiding the rest
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failFirst]);

  React.useEffect(() => { bootstrap(); }, [bootstrap]);

  // ── the countdown on a live code. Expiry tears the watch down WITH it — one
  //    watch per transaction, never a stale one left running.
  React.useEffect(() => {
    if (!watch || watch.mode !== "scan" || left <= 0) return;
    const t = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [watch, left]);

  React.useEffect(() => {
    if (watch && watch.mode === "scan" && left === 0 && !paid) endWatch("expired");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  // A watch is running ⇒ leaving the step by ANY route must be confirmed,
  // exactly as dismissing the code is. Register the guard with the shell.
  React.useEffect(() => {
    onGuardLeave(
      watch && !paid
        ? (proceed: () => void) =>
            setConfirmLeave(() => () => { killTimers(); setWatch(null); setLeft(0); proceed(); })
        : null,
    );
    return () => onGuardLeave(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, paid]);

  /** Tear the watch down and record the attempt. One watch per transaction —
   *  nothing is ever left running against a reference we've replaced. */
  function endWatch(o: Attempt["outcome"]) {
    killTimers();
    const w = watchRef.current;
    if (w) {
      setAttempt({
        outcome: o,
        txn: w.txn,
        ref: w.ref,
        method: w.method.name,
        amount: payable,
        at: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
      });
    }
    setWatch(null);
    setLeft(0);
  }

  /** The one initiation path. Every method goes through it. */
  function pay() {
    if (!method || initiating || watch || paid) return;
    if (method.kind === "card" && !cardName.trim()) {
      setRefusal("Add the name on the card before you pay.");
      return;
    }
    setRefusal(null);
    setAttempt(null);
    setInitiating(true);
    const n = ++txnSeq.current;
    const txn = `TXN-${String(80412 + n).padStart(6, "0")}`;
    const ref = `${method.id.toUpperCase()}-${String(2049 + n)}`;
    const mode: Watch["mode"] = method.kind === "scan" ? scanMode : method.kind === "redirect" ? "redirect" : "card";

    after(900, () => {
      setInitiating(false);
      setWatch({ txn, ref, method, mode, scanned: false });
      if (mode === "scan") setLeft(outcome === "expired" ? 14 : 120);
      if (mode === "redirect") onToast("info", `We opened ${method.name} in a new tab — finish the payment there.`);

      if (outcome === "expired" && mode === "scan") return;    // the countdown resolves it

      if (outcome === "success") {
        // the provider's live channel reports the code being scanned first —
        // real, backed data, and the only intermediate state that exists
        if (mode === "scan") after(2600, () => setWatch((w) => (w ? { ...w, scanned: true } : w)));
        after(mode === "scan" ? 5200 : 3400, () => {
          killTimers();
          setWatch(null);
          setLeft(0);
          setPaid(true);
          onToast("ok", `Payment received — ${money(payable)}.`);
          window.setTimeout(onDone, 1400);
        });
      } else if (outcome === "declined") {
        after(3600, () => endWatch("declined"));
      } else if (outcome === "interrupted") {
        after(3600, () => endWatch("interrupted"));
      } else {
        after(3600, () => endWatch("expired"));
      }
    });
  }

  function applyPromo() {
    const code = promo.trim().toUpperCase();
    if (!code || checkingPromo) return;
    setCheckingPromo(true);
    after(800, () => {
      setCheckingPromo(false);
      const hit = PROMOS[code];
      if (!hit) { onToast("warn", `“${code}” isn't a valid code.`); return; }
      setApplied({ code, off: hit.off, message: hit.message });
      setPromo("");
    });
  }

  // ── bootstrap states ──────────────────────────────────────────────────────
  if (boot === "loading") {
    return (
      <div>
        <StepHead step={STEPS[3]} title="Payment" sub="Loading the payment options for your country…" />
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-bz-lg bg-bz-paper-warm" />)}
        </div>
        <div className="mt-6 border-t border-bz-line-soft pt-5">
          <Ghost onClick={onBack}><ArrowLeft size={13} /> Back to plans</Ghost>
        </div>
      </div>
    );
  }

  if (boot === "failed") {
    return (
      <div>
        <StepHead step={STEPS[3]} title="Payment" sub="We couldn't load your payment options." />
        <div className="flex flex-col items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-bz-lg bg-bz-paper-warm text-bz-text-muted">
            <WifiOff size={20} />
          </span>
          <p className="text-[14px] font-semibold text-bz-text">Couldn't load payment options</p>
          <p className="max-w-[330px] text-[12.5px] leading-relaxed text-bz-text-muted">
            We need your country and currency before we can show the ways you can pay. Nothing has been
            charged.
          </p>
          <div className="mt-1 flex gap-2">
            <Primary onClick={bootstrap}><RefreshCw size={13} /> Try again</Primary>
            <Ghost onClick={onBack}>Back to plans</Ghost>
          </div>
        </div>
      </div>
    );
  }

  // ── paid ──────────────────────────────────────────────────────────────────
  if (paid) {
    return (
      <div>
        <StepHead step={STEPS[3]} title="Payment" sub="That's the last thing we needed from you." />
        <div className="flex flex-col items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22] text-bz-leaf-deep">
            <CheckCircle2 size={24} />
          </span>
          <p className="text-[15px] font-semibold text-bz-text">Payment received</p>
          <p className={cn("text-[12.5px] text-bz-text-muted", NUM)}>
            {money(payable)} · {quote.plan.name} · {quote.term}
          </p>
          <p className="mt-2 flex items-center gap-2 text-[12px] font-medium text-bz-text-muted">
            <Loader2 size={13} className="animate-spin text-bz-fire" /> Taking you to the last step…
          </p>
        </div>
      </div>
    );
  }

  // ── live ──────────────────────────────────────────────────────────────────
  const urgent = left > 0 && left <= 20;

  return (
    <div>
      <StepHead
        step={STEPS[3]}
        title="Pay for your subscription"
        sub="One charge, then we build your workspace. You can change plan any time afterwards."
      />

      <div className="space-y-5">
        {/* Amount — the TRUE payable, seat charges and promo included. */}
        <div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/50 px-4 py-3">
          <Row
            label={<>{quote.plan.name} · {quote.term} <span className={cn("text-bz-text-soft", NUM)}>({plural(quote.seats, "user")})</span></>}
            value={money(quote.base)}
          />
          {quote.extraCharge > 0 && <Row label={<span className={NUM}>{plural(quote.extraSeats, "extra user")}</span>} value={money(quote.extraCharge)} />}
          {quote.addOnCharge > 0 && quote.plan.addOn && (
            <Row label={<span className={NUM}>{plural(quote.addOnSeats, quote.plan.addOn.label.toLowerCase())}</span>} value={money(quote.addOnCharge)} />
          )}
          {discount > 0 && (
            <Row
              label={<span className="text-bz-leaf-deep">Discount · {applied?.code}</span>}
              value={<span className="text-bz-leaf-deep">− {money(discount)}</span>}
            />
          )}
          <div className="mt-1.5 border-t border-bz-line-soft pt-1.5">
            <Row label="You pay today" value={money(payable, quote.currency)} strong />
          </div>
        </div>

        {/* Promo */}
        {applied ? (
          <div className="flex items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2">
            <Check size={13} className="shrink-0 text-bz-leaf-deep" strokeWidth={3} />
            <p className="min-w-0 flex-1 text-[12px] text-bz-text">
              <span className="font-semibold">{applied.code}</span>
              <span className="text-bz-text-muted"> — {applied.message}</span>
            </p>
            <button
              type="button"
              onClick={() => setApplied(null)}
              className="shrink-0 text-[11.5px] font-semibold text-bz-text-muted underline underline-offset-2 hover:text-bz-text"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <TextInput
              value={promo}
              placeholder="Promo code"
              disabled={checkingPromo}
              onChange={(e) => setPromo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }}
            />
            <Ghost onClick={applyPromo} disabled={!promo.trim() || checkingPromo} className="shrink-0">
              {checkingPromo ? <Loader2 size={13} className="animate-spin" /> : null}
              {checkingPromo ? "Checking…" : "Apply"}
            </Ghost>
          </div>
        )}

        {attempt && (
          <AttemptRecord
            attempt={attempt}
            onDismiss={() => setAttempt(null)}
            onToast={onToast}
            onRetry={() => { setAttempt(null); pay(); }}
          />
        )}

        {/* Methods — every available method stays offered, always. */}
        <Band label="How you'd like to pay">
          <div className="space-y-2">
            {METHODS.map((m) => {
              const on = methodId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={!!watch || initiating}
                  onClick={() => { setMethodId(m.id); setRefusal(null); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-bz-lg border bg-bz-surface px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    on ? "border-bz-text" : "border-bz-line-soft hover:border-bz-line",
                  )}
                >
                  {/* the provider's identity — its mark, and its name */}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-[13px] font-bold text-bz-fire">
                    {m.mark}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold text-bz-text">{m.name}</span>
                    <span className="block truncate text-[11.5px] text-bz-text-muted">{m.desc}</span>
                  </span>
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-bz-pill border",
                      on ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line",
                    )}
                  >
                    {on && <Check size={10} strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scan-capable → how you'd like to complete it. Nothing initiates yet. */}
          {method?.kind === "scan" && !watch && (
            <div className="mt-3 flex gap-2">
              {([["scan", "Scan a code"], ["redirect", `Open ${method.name}`]] as const).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setScanMode(k)}
                  className={cn(
                    "flex-1 rounded-bz-md border px-3 py-2 text-[12px] font-medium transition-colors",
                    scanMode === k ? "border-bz-text bg-bz-paper-warm text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Hosted card entry — the middle box is the provider's, not ours. */}
          {method?.kind === "card" && !watch && (
            <div className="mt-3 space-y-3">
              <Field label="Name on card" required>
                <TextInput
                  value={cardName}
                  placeholder="MIRA SILWAL"
                  invalid={!!refusal && !cardName.trim()}
                  onChange={(e) => { setCardName(e.target.value); setRefusal(null); }}
                />
              </Field>
              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-bz-text">Card details</p>
                <div className="flex h-9 items-center gap-2 rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/50 px-2.5">
                  <Lock size={12} className="shrink-0 text-bz-text-soft" />
                  <span className="text-[12px] text-bz-text-soft">
                    Card number · expiry · CVC — rendered by our payment provider
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-bz-text-soft">
                  Your card never touches Bizak. Visa, Mastercard and American Express accepted.
                </p>
              </div>
            </div>
          )}
        </Band>

        {/* The live code — inline, never a scrim. Everything else stays reachable. */}
        {watch && watch.mode === "scan" && (
          <div className="rounded-bz-lg border border-bz-line bg-bz-surface p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="mx-auto shrink-0 rounded-bz-md border border-bz-line-soft bg-bz-surface p-2 sm:mx-0">
                <QrMark seed={watch.txn} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-bz-text">Scan with {watch.method.name}</p>
                <p className={cn("mt-0.5 text-[12px] text-bz-text-muted", NUM)}>
                  Pay {money(payable)} · code expires in{" "}
                  <span className={cn("font-semibold", urgent ? "text-[#9A2E29]" : "text-bz-text")}>
                    {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
                  </span>
                </p>

                <p className={cn("mt-3 flex items-center gap-2 rounded-bz-md px-2.5 py-2 text-[11.5px] font-medium", watch.scanned ? "bg-bz-fire/[0.16] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>
                  <Loader2 size={12} className="shrink-0 animate-spin" />
                  {watch.scanned ? "Code scanned — confirm it in the app." : "Waiting for you to scan the code…"}
                </p>

                <dl className={cn("mt-3 space-y-0.5 border-t border-bz-line-soft pt-2.5 text-[11px]", NUM)}>
                  <div className="flex justify-between gap-3">
                    <dt className="text-bz-text-muted">Transaction</dt>
                    <dd className="font-medium text-bz-text">{watch.txn}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-bz-text-muted">Reference</dt>
                    <dd className="font-medium text-bz-text">{watch.ref}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Ghost className="h-8" onClick={() => setConfirmLeave(() => () => endWatch("cancelled"))}>
                    Cancel payment
                  </Ghost>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Watch on the redirect / card paths — no code to carry the state, so it
            gets its own strip. */}
        {watch && watch.mode !== "scan" && (
          <div className="rounded-bz-lg border border-bz-line bg-bz-surface p-4">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-bz-text">
              <Loader2 size={14} className="animate-spin text-bz-fire" />
              {watch.mode === "redirect" ? `Finish in the ${watch.method.name} window` : "Confirming your card…"}
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-bz-text-muted">
              {watch.mode === "redirect"
                ? `We opened ${watch.method.name} in a new tab. Complete the payment there — we're watching this transaction and will move you on the moment it clears.`
                : "Your provider is authorising the charge. This usually takes a few seconds."}
            </p>
            <p className={cn("mt-2.5 text-[11px] text-bz-text-soft", NUM)}>
              {watch.txn} · {watch.ref}
            </p>
            <div className="mt-3">
              <Ghost className="h-8" onClick={() => setConfirmLeave(() => () => endWatch("cancelled"))}>
                Cancel payment
              </Ghost>
            </div>
          </div>
        )}

        <Refusal message={refusal} />

        {/* The commit stays VISIBLE during a watch — disabled, and saying why.
            Retreat stays reachable too: the shell's leave-guard (registered above)
            raises the confirmation, so it is asked exactly once. */}
        <div className="flex flex-wrap items-center gap-3 border-t border-bz-line-soft pt-5">
          <Ghost onClick={onBack}>
            <ArrowLeft size={13} /> Change plan
          </Ghost>
          <Primary onClick={pay} busy={initiating} disabled={!method || !!watch} className="ml-auto">
            {initiating
              ? "Starting the payment…"
              : watch
              ? "Waiting for confirmation…"
              : method?.kind === "scan" && scanMode === "scan"
              ? <><QrCode size={13} /> Show code · {money(payable)}</>
              : `Pay ${money(payable)}`}
          </Primary>
        </div>
      </div>

      {confirmLeave && (
        <ConfirmLeaveWatch
          onKeep={() => setConfirmLeave(null)}
          onLeave={() => { const go = confirmLeave; setConfirmLeave(null); go(); }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP · NO PAYMENT REQUIRED  (the free/trial complement — never both)
// ════════════════════════════════════════════════════════════════════════════

function FreePassStep({ planName, onBack, onContinue }: { planName: string; onBack: () => void; onContinue: () => void }) {
  const [busy, setBusy] = React.useState(false);
  const t = React.useRef<number | null>(null);
  React.useEffect(() => () => { if (t.current) window.clearTimeout(t.current); }, []);
  return (
    <div>
      <StepHead step={STEPS[3]} title="Nothing to pay" sub="Your plan is free — there's no charge to settle." />
      <div className="flex flex-col items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22] text-bz-leaf-deep">
          <CheckCircle2 size={24} />
        </span>
        <p className="text-[15px] font-semibold text-bz-text">
          {planName} is active
        </p>
        <p className="max-w-[340px] text-[12.5px] leading-relaxed text-bz-text-muted">
          We've activated your subscription already. Add a card later from the workspace whenever you
          want to move up a plan.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-bz-line-soft pt-5">
        <Ghost onClick={onBack}><ArrowLeft size={13} /> Change plan</Ghost>
        <Primary
          className="ml-auto"
          busy={busy}
          onClick={() => { setBusy(true); t.current = window.setTimeout(onContinue, 700); }}
        >
          {busy ? "Checking…" : "Continue"}
          {!busy && <ArrowRight size={13} />}
        </Primary>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP · SYSTEM DEFAULTS  (the terminal interactive step)
// ════════════════════════════════════════════════════════════════════════════

function CategoryRow({
  cat, included, disabled, open, onToggleIncluded, onOpen,
}: {
  cat: SeedCategory; included: boolean; disabled: boolean; open: boolean;
  onToggleIncluded: (v: boolean) => void; onOpen: () => void;
}) {
  return (
    <div className="border-b border-bz-line-soft last:border-b-0">
      <div className="flex items-center gap-3 py-2.5">
        {/* activating the row opens the detail; the switch NEVER does */}
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span
            className={cn(
              "truncate text-[12.5px] font-medium transition-colors",
              included ? "text-bz-text" : "text-bz-text-soft line-through",
            )}
          >
            {cat.label}
          </span>
          <span className={cn("shrink-0 text-[11px] text-bz-text-soft", NUM)}>
            {plural(cat.count, "record")}
          </span>
          <ChevronRight size={12} className={cn("shrink-0 text-bz-text-soft transition-transform", open && "rotate-90")} />
        </button>
        <Switch value={included} onChange={onToggleIncluded} disabled={disabled} ariaLabel={`Include ${cat.label}`} />
      </div>

      {open && (
        <div className="mb-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 p-3">
          <div className="mb-2 flex items-start gap-2">
            <p className="min-w-0 flex-1 text-[11px] italic leading-relaxed text-bz-text-muted">{cat.reason}</p>
            <button type="button" onClick={onOpen} aria-label="Close" className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line-soft">
              <X size={11} />
            </button>
          </div>
          {cat.records.length === 0 ? (
            <p className="text-[11.5px] text-bz-text-soft">Nothing to show for this category.</p>
          ) : (
            <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
              {cat.records.map((r) => (
                <li key={r.value} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                  <span className="truncate text-bz-text">{r.value}</span>
                  <span className={cn("shrink-0 text-bz-text-soft", NUM)}>{r.code ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function DefaultsStep({
  country, planName, failFirst, onDone, onBack,
}: {
  country: string;
  planName: string;
  failFirst: boolean;
  onDone: () => void;
  /** absent once a real payment has landed — the one-way ratchet refuses retreat */
  onBack: (() => void) | null;
}) {
  const cal = { start: `${TODAY.slice(0, 4)}-01-01`, end: `${TODAY.slice(0, 4)}-12-31` };
  const [start, setStart] = React.useState(cal.start);
  const [end, setEnd] = React.useState(cal.end);
  const [lock, setLock] = React.useState(true);
  const [ledger, setLedger] = React.useState(true);
  const [ledgerOpen, setLedgerOpen] = React.useState(false);
  const [manifest, setManifest] = React.useState<"loading" | "ready" | "failed" | "empty">("loading");
  const [excluded, setExcluded] = React.useState<Set<string>>(new Set());
  const [openCat, setOpenCat] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [pct, setPct] = React.useState(0);
  const [stage, setStage] = React.useState("");
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const failedOnce = React.useRef(false);

  // Real, persisted, and deliberately not surfaced: the default role the chosen
  // plan carries. It rides along in the commit payload.
  const planRole = React.useRef({ id: "ROL-ADM", name: "Administrator" });

  const timers = React.useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const kill = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  React.useEffect(() => () => kill(), []);

  // The fiscal window arrives from the tenant's stored country, moments after
  // the placeholder — so we say where it came from rather than let it just move.
  const [derived, setDerived] = React.useState(false);
  React.useEffect(() => {
    after(800, () => {
      const c = countryByName(country);
      if (c) {
        const w = fiscalWindow(c.fiscalStart);
        setStart(w.start);
        setEnd(w.end);
      }
      setDerived(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadManifest = React.useCallback(() => {
    setManifest("loading");
    after(950, () => {
      if (failFirst && !failedOnce.current) { failedOnce.current = true; setManifest("failed"); return; }
      setManifest(MANIFEST.length ? "ready" : "empty");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failFirst]);
  React.useEffect(() => { loadManifest(); }, [loadManifest]);

  // The ledger is the PARENT of the two tax sets — turning it off excludes them
  // and takes their switches away. Turning it back on restores both.
  function setLedgerMaster(v: boolean) {
    setLedger(v);
    setExcluded((prev) => {
      const next = new Set(prev);
      for (const c of MANIFEST) {
        if (!c.taxLinked) continue;
        if (v) next.delete(c.id);
        else next.add(c.id);
      }
      return next;
    });
  }

  // yyyy-MM-dd strings end to end: the rule is a lexical compare, the base
  // period a slice of the year parts. Swapping in a date object breaks both.
  const rangeBad = !!start && !!end && !(end > start);
  const listed = manifest === "ready";
  // A failed manifest is NON-FATAL: the step still commits, and we send no
  // exclusions — the standard set for the country goes in.
  const included = listed ? MANIFEST.filter((c) => !excluded.has(c.id)) : [];
  const totalRecords =
    (ledger ? LEDGER.count : 0) + included.reduce((n, c) => n + c.count, 0);

  function commit() {
    if (saving) return;
    if (rangeBad) {
      setRefusal("The fiscal year must end after it starts. Fix the dates and try again.");
      return;
    }
    setRefusal(null);
    setSaving(true);
    setPct(0);

    // Honest stage names — derived from what is actually being seeded. The
    // percentage is a comfort value: it never gates or delays the request.
    const stages = [
      ...(ledger ? [LEDGER.label] : []),
      ...(listed ? included.map((c) => c.label) : ["Standard starter data"]),
      `${planRole.current.name} role`,
    ];
    stages.forEach((s, i) => after(340 * (i + 1), () => setStage(s)));
    const tick = window.setInterval(() => setPct((p) => (p < 92 ? p + (92 - p) * 0.12 : p)), 160);
    timers.current.push(tick);

    after(340 * stages.length + 900, () => {
      window.clearInterval(tick);
      setPct(100);
      setStage("Signing you in");
      after(500, onDone);
    });
  }

  if (saving) {
    return (
      <div className="py-6">
        <span className="mb-4 flex size-11 items-center justify-center rounded-bz-lg bg-bz-fire/[0.2] text-bz-leaf-deep">
          <Loader2 size={20} className="animate-spin" />
        </span>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-bz-text">
          Building your workspace
        </h1>
        <p className="mt-2 text-[13px] text-bz-text-muted">
          {listed ? (
            <>Creating <span className={cn("font-semibold text-bz-text", NUM)}>{plural(totalRecords, "record")}</span> for {planName}.</>
          ) : (
            <>Seeding the standard set for {country}, on {planName}.</>
          )}
        </p>
        <div className="mt-6 h-1 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
          <div className="h-full rounded-bz-pill bg-bz-fire transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2.5 flex items-center gap-2 text-[12px] font-medium text-bz-text-muted">
          <Check size={12} className="text-bz-leaf-deep" strokeWidth={3} /> {stage}…
        </p>
      </div>
    );
  }

  return (
    <div>
      <StepHead
        step={STEPS[4]}
        title="Set up your defaults"
        sub="Everything here already has a sensible default, and all of it can be changed later."
      />

      <div className="space-y-5">
        <Band label="Fiscal year" aside={!derived && <Loader2 size={12} className="animate-spin text-bz-text-soft" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts">
              <TextInput type="date" value={start} invalid={rangeBad} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="Ends">
              <TextInput type="date" value={end} invalid={rangeBad} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
          {/* persistent and always-on — not gated on having touched the field */}
          {rangeBad && (
            <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] font-medium text-[#9A2E29]">
              <AlertCircle size={12} className="mt-px shrink-0" />
              The fiscal year must end after it starts.
            </p>
          )}
          {derived && countryByName(country) && (
            <p className="mt-2.5 text-[11px] text-bz-text-soft">
              Derived from {country}'s fiscal calendar. Edit either date if yours differs.
            </p>
          )}

          <div className="mt-4 flex items-start gap-3 border-t border-bz-line-soft pt-4">
            <Switch value={lock} onChange={setLock} ariaLabel="Lock closed periods" />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-bz-text">Lock closed periods</p>
              <p className="mt-0.5 text-[11.5px] text-bz-text-muted">
                Stop anyone posting into a period that's already been closed.
              </p>
            </div>
          </div>
        </Band>

        {/* Always created — decoupled from the manifest, live off the dates. */}
        <Band label="Always created">
          <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 px-3 py-2">
            {[
              ["Tax record", ALWAYS_CREATED_TAX],
              ["Fiscal year", `${fmtDate(start)} — ${fmtDate(end)}`],
              ["Base period", basePeriod(start, end)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 py-1">
                <span className="flex items-center gap-1.5 text-[12px] text-bz-text-muted">
                  <Lock size={10} className="text-bz-text-soft" /> {k}
                </span>
                <span className={cn("text-[12px] font-medium text-bz-text", NUM)}>{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-bz-text-soft">
            These are created with every workspace and can't be skipped.
          </p>
        </Band>

        <Band
          label="Starter data"
          aside={
            manifest === "ready" && (
              <span className={cn("text-[11px] text-bz-text-soft", NUM)}>
                {plural(totalRecords, "record")} selected
              </span>
            )
          }
        >
          {/* the ledger master — the parent of the two tax sets */}
          <div className="flex items-start gap-3 pb-3">
            <Switch value={ledger} onChange={setLedgerMaster} ariaLabel="Seed the default chart of accounts" />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-bz-text">
                Default chart of accounts{" "}
                <span className={cn("font-normal text-bz-text-soft", NUM)}>· {plural(LEDGER.count, "account")}</span>
              </p>
              <p className="mt-0.5 text-[11.5px] text-bz-text-muted">
                {ledger
                  ? "Your tax rates and tax groups post against these accounts."
                  : "Without the ledger we can't seed tax rates or tax groups — you'll build both by hand."}
              </p>
              <button
                type="button"
                disabled={manifest === "loading"}
                onClick={() => setLedgerOpen((v) => !v)}
                className="mt-1 text-[11.5px] font-semibold text-bz-text underline underline-offset-2 disabled:opacity-40"
              >
                {ledgerOpen ? "Hide accounts" : "View accounts"}
              </button>
            </div>
          </div>

          {ledgerOpen && (
            <div className="mb-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 p-3">
              <div className="mb-2 flex items-start gap-2">
                <p className="min-w-0 flex-1 text-[11px] italic text-bz-text-muted">{LEDGER.reason}</p>
                <button type="button" onClick={() => setLedgerOpen(false)} aria-label="Close" className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line-soft">
                  <X size={11} />
                </button>
              </div>
              <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
                {LEDGER.records.map((r) => (
                  <li key={r.code} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                    <span className="truncate text-bz-text">{r.value}</span>
                    <span className={cn("shrink-0 text-bz-text-soft", NUM)}>{r.code}</span>
                  </li>
                ))}
              </ul>
              <p className={cn("mt-2 text-[11px] text-bz-text-soft", NUM)}>
                …and {LEDGER.count - LEDGER.records.length} more.
              </p>
            </div>
          )}

          {manifest === "loading" ? (
            <div className="space-y-2 border-t border-bz-line-soft pt-3">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-8 animate-pulse rounded-bz-md bg-bz-paper-warm" />)}
            </div>
          ) : manifest === "failed" ? (
            <div className="flex items-start gap-2.5 rounded-bz-md border border-bz-line bg-bz-paper-warm/70 p-3">
              <AlertCircle size={14} className="mt-px shrink-0 text-bz-text-muted" />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-bz-text">We couldn't list the starter data</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-bz-text-muted">
                  You can still finish — we'll seed the standard set for your country. Or re-check to
                  choose exactly what goes in.
                </p>
                <Ghost onClick={loadManifest} className="mt-2.5 h-8">
                  <RefreshCw size={12} /> Check again
                </Ghost>
              </div>
            </div>
          ) : manifest === "empty" ? (
            <p className="border-t border-bz-line-soft pt-3 text-[12px] text-bz-text-muted">
              Nothing matched your country and industry — we'll create the workspace empty.
            </p>
          ) : (
            <div className="border-t border-bz-line-soft">
              {MANIFEST.map((c) => (
                <CategoryRow
                  key={c.id}
                  cat={c}
                  included={!excluded.has(c.id)}
                  disabled={!!c.taxLinked && !ledger}
                  open={openCat === c.id}
                  onOpen={() => setOpenCat((o) => (o === c.id ? null : c.id))}
                  onToggleIncluded={(v) =>
                    setExcluded((prev) => {
                      const next = new Set(prev);
                      if (v) next.delete(c.id);
                      else next.add(c.id);
                      return next;
                    })
                  }
                />
              ))}
            </div>
          )}
        </Band>

        <Refusal message={refusal} />

        <div className="flex flex-wrap items-center gap-3 border-t border-bz-line-soft pt-5">
          {onBack && <Ghost onClick={onBack}><ArrowLeft size={13} /> Back</Ghost>}
          <Primary onClick={commit} className="ml-auto">
            Create my workspace <ArrowRight size={13} />
          </Primary>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP · DONE  (one terminal surface — the legacy flow told two contradictory
// stories here: "redirecting to your dashboard" and "pending approval")
// ════════════════════════════════════════════════════════════════════════════

function DoneStep({ planName, onExit }: { planName: string | null; onExit: () => void }) {
  return (
    <div className="py-6">
      <span className="mb-4 flex size-12 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22] text-bz-leaf-deep">
        <CheckCircle2 size={24} />
      </span>
      <h1 className="text-[24px] font-semibold leading-tight tracking-tight text-bz-text">
        Your workspace is ready
      </h1>
      <p className="mt-2 max-w-[420px] text-[13px] leading-relaxed text-bz-text-muted">
        Everything's provisioned{planName ? <> on <span className="font-semibold text-bz-text">{planName}</span></> : null}.
        We're signing you in now — you'll land on your dashboard.
      </p>
      <p className="mt-6 flex items-center gap-2 text-[12.5px] font-medium text-bz-text-muted">
        <Loader2 size={14} className="animate-spin text-bz-fire" /> Taking you to Bizak…
      </p>
      <button
        onClick={onExit}
        className="mt-6 border-t border-bz-line-soft pt-4 text-[11.5px] font-medium text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline"
      >
        In production this hands off to your workspace · close the preview
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SHELL STATES · resolving · soft failure (a real error, with a re-check)
// ════════════════════════════════════════════════════════════════════════════

function Resolving() {
  return (
    <div className="py-6">
      <div className="h-9 w-9 animate-pulse rounded-bz-md bg-bz-paper-warm" />
      <div className="mt-4 h-6 w-64 max-w-full animate-pulse rounded-bz-sm bg-bz-paper-warm" />
      <div className="mt-2.5 h-3.5 w-80 max-w-full animate-pulse rounded-bz-sm bg-bz-paper-warm" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-9 animate-pulse rounded-bz-md bg-bz-paper-warm" />)}
      </div>
      <p className="mt-6 flex items-center gap-2 text-[12px] font-medium text-bz-text-muted">
        <Loader2 size={13} className="animate-spin" /> Picking up where you left off…
      </p>
    </div>
  );
}

function SoftFailure({ onRetry, onSignOut }: { onRetry: () => void; onSignOut: () => void }) {
  return (
    <div className="py-6">
      <span className="mb-4 flex size-11 items-center justify-center rounded-bz-lg bg-bz-paper-warm text-bz-text-muted">
        <WifiOff size={20} />
      </span>
      <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-bz-text">
        We couldn't find your place
      </h1>
      <p className="mt-2 max-w-[420px] text-[13px] leading-relaxed text-bz-text-muted">
        Your setup is safe — it's stored on our side, not in this browser. We just couldn't read where
        you'd got to. Check again, and you'll land exactly where you left off.
      </p>
      <div className="mt-5 flex gap-2">
        <Primary onClick={onRetry}><RefreshCw size={13} /> Check again</Primary>
        <Ghost onClick={onSignOut}>Sign out</Ghost>
      </div>
    </div>
  );
}

function AlreadyComplete({ onExit }: { onExit: () => void }) {
  return (
    <div className="py-6">
      <span className="mb-4 flex size-11 items-center justify-center rounded-bz-lg bg-bz-fire/[0.2] text-bz-leaf-deep">
        <CheckCircle2 size={20} />
      </span>
      <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-bz-text">
        This account is already set up
      </h1>
      <p className="mt-2 max-w-[420px] text-[13px] leading-relaxed text-bz-text-muted">
        There's nothing left to do here. Sign in and you'll go straight to your workspace.
      </p>
      <div className="mt-5">
        <Primary onClick={onExit}>Go to sign in <ArrowRight size={13} /></Primary>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// THE JOURNEY  (full viewport — no sidebar, no top bar, no breadcrumb)
// ════════════════════════════════════════════════════════════════════════════

type Scenario = {
  key: string;
  label: string;
  status: Status | null;      // null = the resolve fails
  seed?: "paid" | "free";
};

const freshStatus = (step: StepId, done: Partial<Status> = {}): Status => ({
  step,
  tenantDone: false, planDone: false, paymentDone: false, defaultsDone: false,
  complete: false,
  ...done,
});

const SCENARIOS: Scenario[] = [
  { key: "account", label: "Create account", status: freshStatus("account") },
  { key: "tenant", label: "Company profile", status: freshStatus("tenant") },
  { key: "plan", label: "Choose a plan", status: freshStatus("plan", { tenantDone: true }) },
  { key: "payment", label: "Payment", status: freshStatus("payment", { tenantDone: true, planDone: true }), seed: "paid" },
  { key: "free", label: "Free plan · no payment", status: freshStatus("payment", { tenantDone: true, planDone: true }), seed: "free" },
  { key: "defaults", label: "System defaults", status: freshStatus("defaults", { tenantDone: true, planDone: true, paymentDone: true }), seed: "paid" },
  { key: "failed", label: "Resolve failed", status: null },
  { key: "complete", label: "Already complete", status: freshStatus("done", { tenantDone: true, planDone: true, paymentDone: true, defaultsDone: true, complete: true }), seed: "paid" },
];

const SEED_TENANT: TenantState = {
  org: "Himalayan Retail Group",
  address: "Durbar Marg, Kathmandu",
  email: "accounts@himalayan.com.np",
  phone: "9801234567",
  country: "Nepal",
  industry: "Retail & distribution",
  currency: "NPR",
  tz: "Asia/Kathmandu",
  multiSub: true,
};

function Journey({
  scenario, failFirst, payOutcome, onExit,
}: {
  scenario: Scenario; failFirst: boolean; payOutcome: PayOutcome; onExit: () => void;
}) {
  const [res, setRes] = React.useState<Resolution>("resolving");
  const [status, setStatus] = React.useState<Status | null>(null);
  const [step, setStep] = React.useState<StepId>("tenant");

  // Answers live for the length of the journey — stepping back into a completed
  // step shows what you entered, not a blank form.
  const [tenant, setTenant] = React.useState<TenantState>(
    scenario.seed ? SEED_TENANT : TENANT_INIT,
  );
  const [plan, setPlan] = React.useState<PlanChoice>(
    scenario.seed === "paid"
      ? { planId: "PLN-GROWTH", term: "monthly", seats: 12, addOnSeats: 2, autoRenew: true }
      : scenario.seed === "free"
      ? { planId: "PLN-START", term: "monthly", seats: 3, addOnSeats: 0, autoRenew: true }
      : PLAN_INIT,
  );
  const [toast, setToast] = React.useState<Toast>(null);
  const toastId = React.useRef(0);
  const leaveGuard = React.useRef<LeaveGuard>(null);

  const say = React.useCallback(
    (tone: "ok" | "warn" | "info", text: string) => setToast({ id: ++toastId.current, tone, text }),
    [],
  );

  const timers = React.useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  // Lock the page behind the journey — it is inescapable but for signing out.
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── STEP RESOLUTION. Four outcomes, all of them presented.
  const resolve = React.useCallback(() => {
    setRes("resolving");
    after(1000, () => {
      if (!scenario.status) { setRes("failed"); return; }        // the server named no step
      if (scenario.status.complete) { setRes("complete"); return; }
      setStatus(scenario.status);
      setStep(scenario.status.step);
      setRes("ready");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  React.useEffect(() => { resolve(); }, [resolve]);

  // The amount the payment step settles is DERIVED from the plan choice, so it
  // can never drift from what the plan step promised — the legacy payment step
  // showed a different number than the one it charged.
  const activePlan = planById(plan.planId);
  const liveQuote =
    activePlan && !isFree(activePlan)
      ? quoteFor(activePlan, plan.term, plan.seats || activePlan.includedSeats, plan.addOnSeats || 0)
      : null;

  const paymentRequired = !isFree(activePlan);
  // The one-way ratchet: once money has actually moved, nothing is re-openable.
  // A free plan sets paymentDone too, but nothing was charged — so it does NOT
  // freeze the journey.
  const ratchet = !!status?.paymentDone && paymentRequired;

  // ── the rail. An entry that is CURRENT is never hidden.
  const entries: RailEntry[] = React.useMemo(() => {
    const done: Record<StepId, boolean> = {
      account: step !== "account",     // you cannot be past here without an account
      tenant: !!status?.tenantDone,
      plan: !!status?.planDone,
      payment: !!status?.paymentDone,
      defaults: !!status?.defaultsDone,
      done: !!status?.complete,
    };
    return STEPS.map((s) => {
      const complete = done[s.id];
      const active = res === "ready" && s.id === step;
      const notRequired = s.id === "payment" && !paymentRequired;
      // account + tenant are permanently non-returnable; the ratchet freezes all
      const activatable =
        !ratchet && complete && !active && s.id !== "account" && s.id !== "tenant" && s.id !== "done";
      return { step: s, complete, active, notRequired, activatable };
    });
  }, [status, step, res, paymentRequired, ratchet]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const doneCount = entries.filter((e) => e.complete).length;

  /** Every route out of a step passes through here, so a live payment watch can
   *  demand the same confirmation whether you jump, retreat or sign out. */
  function leave(proceed: () => void) {
    if (leaveGuard.current) { leaveGuard.current(proceed); return; }
    proceed();
  }

  const jump = (id: StepId) => leave(() => setStep(id));

  function back() {
    // payment → plan; defaults → payment (or straight to plan when it's free)
    if (step === "payment") leave(() => setStep("plan"));
    else if (step === "defaults") setStep(paymentRequired ? "payment" : "plan");
  }

  function completeStep(id: StepId, next: StepId, patch: Partial<Status>) {
    setStatus((s) => ({ ...(s ?? freshStatus(id)), ...patch, step: next }));
    setStep(next);
  }

  function signOut() {
    leave(() => {
      say("info", "Signed out — your progress is saved.");
      after(600, onExit);
    });
  }

  const content = (() => {
    if (res === "resolving") return <Resolving />;
    if (res === "failed") return <SoftFailure onRetry={resolve} onSignOut={signOut} />;
    if (res === "complete") return <AlreadyComplete onExit={onExit} />;

    switch (step) {
      case "account":
        return <AccountStep onToast={say} />;
      case "tenant":
        return (
          <TenantStep
            value={tenant}
            onChange={setTenant}
            onToast={say}
            onCommit={() => {
              say("ok", "Company profile saved.");
              completeStep("tenant", "plan", { tenantDone: true });
            }}
          />
        );
      case "plan":
        return (
          <PlanStep
            value={plan}
            onChange={setPlan}
            failFirst={failFirst}
            onToast={say}
            onCommit={(free) => {
              say("ok", free ? "Free plan activated." : "Plan saved.");
              completeStep("plan", "payment", { planDone: true });
            }}
          />
        );
      case "payment":
        if (!paymentRequired) {
          return (
            <FreePassStep
              planName={activePlan?.name ?? "Your plan"}
              onBack={() => setStep("plan")}
              onContinue={() => completeStep("payment", "defaults", { paymentDone: true })}
            />
          );
        }
        if (!liveQuote) {
          return <SoftFailure onRetry={() => setStep("plan")} onSignOut={signOut} />;
        }
        return (
          <PaymentStep
            quote={liveQuote}
            outcome={payOutcome}
            failFirst={failFirst}
            onBack={back}
            onToast={say}
            onGuardLeave={(g) => { leaveGuard.current = g; }}
            onDone={() => completeStep("payment", "defaults", { paymentDone: true })}
          />
        );
      case "defaults":
        return (
          <DefaultsStep
            country={tenant.country || "Nepal"}
            planName={activePlan?.name ?? "your plan"}
            failFirst={failFirst}
            onBack={ratchet ? null : back}
            onDone={() => completeStep("defaults", "done", { defaultsDone: true, complete: true })}
          />
        );
      case "done":
        return <DoneStep planName={activePlan?.name ?? null} onExit={onExit} />;
    }
  })();

  const showRailChrome = res !== "complete";

  return createPortal(
    <div className="fixed inset-0 z-[90] flex bg-bz-section-a text-bz-text" style={{ fontFamily: "var(--bz-body-font)" }}>
      {/* ── Rail: brand · why you're here · where you are · the way out ─────── */}
      <aside className="hidden w-[286px] shrink-0 flex-col bg-bz-olive px-6 py-7 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-bz-sm bg-bz-fire text-[13px] font-bold text-bz-olive">B</span>
          <span className="text-[15px] font-semibold tracking-tight text-bz-text-on-dark">
            Bizak<sup className="ml-0.5 text-[8px] opacity-60">®</sup>
          </span>
        </div>

        <div className="mt-9">
          <h2 className="text-[17px] font-semibold leading-snug tracking-tight text-bz-text-on-dark">
            One system for your
            <br />
            whole business.
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-white/45">
            Finance, inventory, sales and operations on a single ledger. Most teams are live in a day.
          </p>
          <span className="mt-5 block h-px w-8 bg-bz-fire" />
        </div>

        <div className="mt-9 flex-1">
          <Rail entries={entries} onJump={jump} />
        </div>

        {showRailChrome && (
          <button
            onClick={signOut}
            className="mt-6 inline-flex items-center gap-2 self-start rounded-bz-md px-2 py-1.5 text-[11.5px] font-medium text-white/45 transition-colors hover:bg-white/[0.06] hover:text-bz-text-on-dark"
          >
            <LogOut size={12} /> Save and sign out
          </button>
        )}
      </aside>

      {/* ── The step. One at a time, always. ─────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile chrome — the rail compressed into one line */}
        <header className="flex shrink-0 items-center gap-3 border-b border-bz-line bg-bz-paper px-4 py-3 lg:hidden">
          <span className="flex size-6 items-center justify-center rounded-bz-sm bg-bz-deep text-[11px] font-bold text-bz-fire">B</span>
          <div className="min-w-0 flex-1">
            <p className={cn("text-[11px] font-semibold text-bz-text", NUM)}>
              {res === "ready" ? `Step ${stepIndex + 1} of ${STEPS.length}` : "Setting up"}
            </p>
            <div className="mt-1 h-[3px] w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
              <div
                className="h-full rounded-bz-pill bg-bz-fire transition-[width] duration-300"
                style={{ width: `${Math.round((doneCount / STEPS.length) * 100)}%` }}
              />
            </div>
          </div>
          {showRailChrome && (
            <button onClick={signOut} aria-label="Sign out" className="flex size-8 shrink-0 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm">
              <LogOut size={14} />
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[620px] px-5 py-9 sm:px-8 md:py-14">{content}</div>
        </main>
      </div>

      <ToastDock toast={toast} onDismiss={() => setToast(null)} />
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LAUNCHER  (the design page itself — the journey has no home in the app shell,
// so the shell only holds the trigger)
// ════════════════════════════════════════════════════════════════════════════

const OUTCOMES: { k: PayOutcome; label: string }[] = [
  { k: "success", label: "Succeeds" },
  { k: "declined", label: "Declined" },
  { k: "expired", label: "Expires" },
  { k: "interrupted", label: "Interrupted" },
];

export function OnboardingJourneyDesignPage() {
  const [open, setOpen] = React.useState(true);       // land straight in the journey
  const [scenarioKey, setScenarioKey] = React.useState("tenant");
  const [failFirst, setFailFirst] = React.useState(false);
  const [payOutcome, setPayOutcome] = React.useState<PayOutcome>("success");
  const [run, setRun] = React.useState(0);            // remount the journey on each launch

  const scenario = SCENARIOS.find((s) => s.key === scenarioKey) ?? SCENARIOS[1];

  const launch = (key: string) => {
    setScenarioKey(key);
    setRun((n) => n + 1);
    setOpen(true);
  };

  return (
    <AppShell
      topBarTone="section"
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Administration</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Onboarding</span>
        </>
      }
      overlay={
        open ? (
          <Journey
            key={`${scenarioKey}-${run}`}
            scenario={scenario}
            failFirst={failFirst}
            payOutcome={payOutcome}
            onExit={() => setOpen(false)}
          />
        ) : null
      }
    >
      <div className="mx-auto w-full max-w-[720px] px-4 py-10 md:py-14">
        {/* the trigger */}
        <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-6 shadow-[0_20px_50px_-36px_rgba(15,20,17,0.28)] md:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex size-10 items-center justify-center rounded-bz-md bg-bz-deep text-bz-fire">
              <Rocket size={18} strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[19px] font-semibold tracking-tight text-bz-text">Tenant onboarding</h1>
              <p className="mt-1.5 max-w-[440px] text-[12.5px] leading-relaxed text-bz-text-muted">
                The self-serve journey from a fresh sign-up to a provisioned workspace. It replaces the
                app entirely — no sidebar, no top bar. The server decides which step you land on.
              </p>
            </div>
            <Primary onClick={() => launch(scenarioKey)} className="h-9 w-full shrink-0 sm:w-auto">
              <Rocket size={13} /> Launch journey
            </Primary>
          </div>

          <ol className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-bz-line-soft pt-5">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-bz-pill border border-bz-line-soft bg-bz-paper-warm/60 py-1 pl-1.5 pr-2.5">
                  <span className={cn("flex size-4 items-center justify-center rounded-bz-pill bg-bz-deep text-[9px] font-bold text-bz-fire", NUM)}>
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-medium text-bz-text">{s.label}</span>
                </span>
                {i < STEPS.length - 1 && <ChevronRight size={11} className="text-bz-text-soft" />}
              </li>
            ))}
          </ol>
        </div>

        {/* the demo inspector — the states you can't reach by clicking forward */}
        <div className="mt-8 border-t border-bz-line-soft pt-6">
          <p className={LABEL}>Preview a state</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {SCENARIOS.map((s) => (
              <button
                key={s.key}
                onClick={() => launch(s.key)}
                className={cn(
                  "rounded-bz-md border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
                  scenarioKey === s.key
                    ? "border-bz-text bg-bz-deep text-bz-text-on-dark"
                    : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-2.5">
              <Switch value={failFirst} onChange={setFailFirst} ariaLabel="Fail the first load" />
              <span className="text-[11.5px] text-bz-text-muted">
                First load of plans / payment options <span className="font-medium text-bz-text">fails once</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11.5px] text-bz-text-muted">Payment</span>
              <div className="inline-flex overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
                {OUTCOMES.map((o, i) => (
                  <button
                    key={o.k}
                    onClick={() => setPayOutcome(o.k)}
                    className={cn(
                      "px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                      i > 0 && "border-l border-bz-line-soft",
                      payOutcome === o.k ? "bg-bz-deep text-bz-text-on-dark" : "text-bz-text-muted hover:bg-bz-paper-warm",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-4 text-[10.5px] leading-relaxed text-bz-text-soft">
            Demo only. In production the step comes from the server and the payment outcome from the
            provider — cancellation is reachable by hand from the live code.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
