import * as React from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Phone,
  RefreshCw,
  Rocket,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// AUTH · SPOTLIGHT  ·  a SECOND design direction for the three public doors
// (sign-in / sign-up / forgot-password). The first, "Split", lives in
// AuthDesignPage.tsx: a bright horizontal split with an olive statement panel.
//
// Spotlight is the CENTRED, EDITORIAL take. Where Split is asymmetric — a side
// panel on the left, the form on a stage to the right — Spotlight is perfectly
// symmetric: one white card, floated dead-centre on a warm paper field, brand
// above it and a single quiet line below. The calm of the centred composition
// is the whole idea; lime is the one accent thread running through it (the
// eyebrow tick, the focus ring, the strength meter, the switch, the selection).
//
// The BEHAVIOUR is identical to Split and deliberately so — same nine sign-in
// verdicts, same as-built-by-default contract with one "proposed fixes" switch,
// same dual-hosted sign-up, same gated three-phase recovery. Only the surface
// and the composition are new.
//
// Self-contained on purpose: it shares no code with Split, so iterating on one
// never disturbs the other.
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// PROPOSED FIXES  — what the dock's one switch turns on. Each is a BEHAVIOUR
// change, not a reskin. Default: OFF (the doors behave exactly as built).
// ════════════════════════════════════════════════════════════════════════════

const FIXES: { id: string; ref: string; text: string }[] = [
  { id: "commit", ref: "A7", text: "Sign-in's commit stays armed and names why it refuses (adopts sign-up's contract)." },
  { id: "pwrules", ref: "A4", text: "Sign-in stops applying composition rules to an existing password — identity only." },
  { id: "creds", ref: "FLOW", text: "Wrong credentials get a credible, persistent inline error instead of raw toasts (or silence)." },
  { id: "sticky", ref: "A8", text: "Leaving the suspended state clears the verdict and the rejected credentials." },
  { id: "pwmsg", ref: "B4", text: "Sign-up's password gets the required / too-short message it never had." },
  { id: "server", ref: "B8", text: "Sign-up's server rejections populate the inline refusal surface, not just a toast." },
];

// ════════════════════════════════════════════════════════════════════════════
// RULES + TRANSFORMS  (identical logic to Split — the surface is the only thing
// that changed between the two designs)
// ════════════════════════════════════════════════════════════════════════════

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[A-Za-z ]+$/;

/** Sign-in: ONE message at a time, by a fixed precedence. Composition rules on a
 *  secret the user already owns — preserved; see FIXES[pwrules]. */
function signInPasswordError(v: string, fixed: boolean): string | null {
  if (!v) return "Password is required";
  if (fixed) return null;
  if (!/[A-Z]/.test(v)) return "Password must have a capital letter";
  if (!/[^A-Za-z0-9]/.test(v)) return "Password must have a special character";
  if (!/\d/.test(v)) return "Password must have at least one number";
  if (v.length < 6) return "Password must be at least 6 characters";
  return null;
}

const signInEmailError = (v: string) =>
  !v.trim() ? "Email is required" : !EMAIL_RE.test(v) ? "Email is invalid" : null;

/** Sign-up: five independent rules. Array order IS the hint order
 *  (uppercase → lowercase → digit → symbol → length). */
const PW_RULES: { key: string; label: string; test: (v: string) => boolean }[] = [
  { key: "upper", label: "an uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "a lowercase letter", test: (v) => /[a-z]/.test(v) },
  { key: "digit", label: "a number", test: (v) => /\d/.test(v) },
  { key: "symbol", label: "a symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
  { key: "len", label: "at least 8 characters", test: (v) => v.length >= 8 },
];

function nameError(v: string, what: string): string | null {
  if (!v.trim()) return `${what} is required.`;
  if (v.trim().length < 2) return `${what} must be at least 2 characters.`;
  if (!NAME_RE.test(v)) return `${what} can only contain letters and spaces.`;
  return null;
}

const signUpEmailError = (v: string) =>
  !v.trim() ? "Email is required" : !EMAIL_RE.test(v) ? "Enter a valid email address." : null;

const SUSPEND_FALLBACK = "Your account has been temporarily suspended.";
function parseSuspension(raw: string): { message: string; reason: string | null } {
  const [head = "", tail = ""] = raw.split("|");
  return { message: head.trim() || SUSPEND_FALLBACK, reason: tail.trim() || null };
}

function registrationPayload(f: { first: string; last: string; email: string; pw: string; pw2: string; consent: boolean }) {
  const email = f.email.trim();
  return {
    FirstName: f.first.trim(),
    LastName: f.last.trim(),
    Email: email,
    UserName: email, // derived — never a separate field
    Password: f.pw,
    ConfirmPassword: f.pw2,
    IsAgreeTermsAndConditions: f.consent,
    UserType: "O", // organisation user   ┐
    FromRegister: "S", // self-registration │ fixed in code, never shown
    SubscriptionType: "Trial", //           ┘
  };
}

// ════════════════════════════════════════════════════════════════════════════
// OUTCOMES  (the same branch set)
// ════════════════════════════════════════════════════════════════════════════

type Outcome =
  | "authenticated"
  | "password-change"
  | "two-factor"
  | "two-factor-degraded"
  | "choose-org"
  | "onboarding"
  | "subscription"
  | "suspended"
  | "suspended-bare"
  | "bad-noisy"
  | "bad-silent"
  | "unknown"
  | "unknown-empty"
  | "hangs";

const LEAVES: { k: Outcome; label: string }[] = [
  { k: "authenticated", label: "Authenticated" },
  { k: "password-change", label: "Password change required" },
  { k: "two-factor", label: "Two-factor required" },
  { k: "two-factor-degraded", label: "Two-factor · prefetch fails" },
  { k: "choose-org", label: "Role / organisation choice" },
  { k: "onboarding", label: "Onboarding incomplete" },
  { k: "subscription", label: "Subscription expired" },
];

const STAYS: { k: Outcome; label: string }[] = [
  { k: "suspended", label: "Account suspended" },
  { k: "suspended-bare", label: "Suspended · no reason given" },
  { k: "bad-noisy", label: "Wrong credentials · transport" },
  { k: "bad-silent", label: "Wrong credentials · in-band (silent)" },
  { k: "unknown", label: "Unrecognised status" },
  { k: "unknown-empty", label: "Unrecognised · empty response" },
  { k: "hangs", label: "Never settles (commit sticks)" },
];

type RecoverOutcome = "plain" | "questions" | "unknown" | "answers-rejected" | "expired";

const RECOVER_OUTCOMES: { k: RecoverOutcome; label: string }[] = [
  { k: "plain", label: "Code emailed · no questions" },
  { k: "questions", label: "Account has security questions" },
  { k: "answers-rejected", label: "Security answers rejected" },
  { k: "expired", label: "Code expired / incorrect" },
  { k: "unknown", label: "No account with that email" },
];

const SECURITY_QUESTIONS = [
  "What was the name of your first school?",
  "Which city were you born in?",
];

type SignUpOutcome = "created" | "rejected" | "rejected-double";

const SIGNUP_OUTCOMES: { k: SignUpOutcome; label: string }[] = [
  { k: "created", label: "Created" },
  { k: "rejected", label: "Rejected · email already registered" },
  { k: "rejected-double", label: "Rejected · two notifications" },
];

const SUSPEND_RAW =
  "Your account has been suspended pending a compliance review.|Repeated chargebacks on the last two invoices. Settle the balance and we'll restore access.";

const SALES_EMAIL = "sales@bizak.io";
const SALES_TEL = "+977-1-0000000"; // ⚠ placeholder-looking — confirm before shipping
const SALES_TEL_LABEL = "+977-1-000-0000";
const TERMS_URL = "https://bizakerp.com/terms";
const PRIVACY_URL = "https://bizakerp.com/privacy";

// ════════════════════════════════════════════════════════════════════════════
// SESSION  — module-scoped, stands in for the service that OUTLIVES the page.
// Its own store, kept separate from Split's so the two designs never interfere.
// ════════════════════════════════════════════════════════════════════════════

const session = {
  suspended: null as string | null,
  stuck: false,
  outcome: "authenticated" as Outcome,
  signUpOutcome: "created" as SignUpOutcome,
  recoverOutcome: "plain" as RecoverOutcome,
  fixes: false,
  embedded: false,
};

// ════════════════════════════════════════════════════════════════════════════
// ATOMS  (light surface; lime is the accent — the focus ring, the meter, the on
// state — while the primary stays the canonical dark pill)
// ════════════════════════════════════════════════════════════════════════════

/** Focus is a clear dark border PLUS a soft lime halo — the halo is the
 *  Spotlight accent, the border is what guarantees the focus is visible. */
const INPUT =
  "h-11 w-full rounded-bz-md border bg-bz-surface px-3.5 text-[13px] text-bz-text outline-none transition-[colors,box-shadow] placeholder:text-bz-text-soft focus:border-bz-text focus:ring-2 focus:ring-bz-fire/40";

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  action,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-1.5">
        <label htmlFor={htmlFor} className="text-[11.5px] font-semibold text-bz-text">
          {label}
        </label>
        {required && <span className="text-[11.5px] leading-none text-[#C0413A]">*</span>}
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-start gap-1 text-[11px] font-medium text-[#9A2E29]">
          <AlertCircle size={11} className="mt-px shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-bz-text-soft">{hint}</p>
      ) : null}
    </div>
  );
}

function TextInput({
  invalid,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(INPUT, invalid ? "border-[#C0413A]" : "border-bz-line-soft hover:border-bz-line", className)}
    />
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete: string;
  invalid?: boolean;
}) {
  const [shown, setShown] = React.useState(false);
  return (
    <div className="relative">
      <TextInput
        id={id}
        type={shown ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        invalid={invalid}
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text"
      >
        {shown ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function Switch({
  value,
  onChange,
  ariaLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
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

/** Primary = the canonical dark pill — the strong-contrast CTA on a light
 *  surface (lime is reserved for the accents, where it reads best). */
function Primary({
  children,
  onClick,
  busy,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  busy?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={busy || disabled}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[13px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-35",
        className,
      )}
    >
      {busy && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

function TextLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-semibold text-bz-text underline decoration-bz-line underline-offset-[3px] transition-colors hover:decoration-bz-text"
    >
      {children}
    </button>
  );
}

/** The persistent, page-owned refusal surface — a light danger chip. */
function Refusal({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-1.5 rounded-bz-md bg-[#FBE7E5] px-3 py-2.5 text-[11.5px] font-medium leading-relaxed text-[#9A2E29]"
    >
      <AlertCircle size={13} className="mt-px shrink-0" />
      {message}
    </p>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOASTS  — light cards, top-right. Stacks (two when texts differ); exact
// duplicates suppressed; each lives ~2.6s from mount.
// ════════════════════════════════════════════════════════════════════════════

type Toast = { id: number; tone: "ok" | "error" | "info"; text: string };

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(370px,calc(100vw-32px))] flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const dismiss = React.useRef(onDismiss);
  dismiss.current = onDismiss;
  React.useEffect(() => {
    const t = window.setTimeout(() => dismiss.current(), 2600);
    return () => window.clearTimeout(t);
  }, []);
  const err = toast.tone === "error";
  return (
    <div className="pointer-events-auto flex items-start gap-2.5 rounded-bz-lg border border-bz-line-soft bg-bz-surface py-2.5 pl-3 pr-2 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.3)]">
      <span
        className={cn(
          "mt-px flex size-6 shrink-0 items-center justify-center rounded-bz-pill",
          err ? "bg-[#FBE7E5]" : toast.tone === "ok" ? "bg-bz-fire/[0.22]" : "bg-bz-paper-warm",
        )}
      >
        {err ? (
          <AlertCircle size={12} className="text-[#9A2E29]" />
        ) : toast.tone === "ok" ? (
          <Check size={12} className="text-bz-leaf-deep" strokeWidth={3} />
        ) : (
          <Loader2 size={12} className="animate-spin text-bz-text-muted" />
        )}
      </span>
      <p className="min-h-[18px] min-w-0 flex-1 break-words pt-0.5 text-[12px] font-medium leading-relaxed text-bz-text">
        {toast.text}
      </p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BRAND + FRAME
// ════════════════════════════════════════════════════════════════════════════

function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-7 items-center justify-center rounded-bz-sm bg-bz-fire text-[13px] font-bold text-bz-olive">
        B
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-bz-text">
        Bizak<sup className="ml-0.5 text-[8px] opacity-50">®</sup>
      </span>
    </span>
  );
}

/** Small centred marker above the heading — the door's name, or the recovery
 *  step. A hairline lime tick sits under it as the one accent in the header. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-bz-text-soft">{children}</span>
      <span className="mt-2.5 h-px w-7 bg-bz-fire" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HAND-OFF  — six verdicts leave the page.
// ════════════════════════════════════════════════════════════════════════════

type HandOffSpec = {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
  carries: string;
  to?: { href: string; label: string };
};

function HandOff({ spec, onBack }: { spec: HandOffSpec; onBack: () => void }) {
  const Icon = spec.icon;
  return (
    <div className="text-center">
      <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm text-bz-text-muted">
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-bz-text">{spec.title}</h1>
      <p className="mx-auto mt-2.5 max-w-[340px] text-[13px] leading-relaxed text-bz-text-muted">{spec.body}</p>

      {spec.to ? (
        <Link
          to={spec.to.href}
          className="mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-5 text-[13px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95"
        >
          {spec.to.label}
          <ArrowRight size={14} />
        </Link>
      ) : (
        <p className="mt-6 inline-flex items-center gap-2 text-[12.5px] font-medium text-bz-text-muted">
          <Loader2 size={14} className="animate-spin text-bz-leaf-deep" />
          Redirecting…
        </p>
      )}

      <p className="mx-auto mt-7 max-w-[320px] border-t border-bz-line-soft pt-4 text-[11px] leading-relaxed text-bz-text-soft">
        Carries: {spec.carries}
      </p>
      <button
        onClick={onBack}
        className="mt-2 text-[11px] font-medium text-bz-text-soft underline-offset-2 hover:text-bz-text-muted hover:underline"
      >
        Demo only — back to sign in
      </button>
    </div>
  );
}

const HANDOFFS: Partial<Record<Outcome, HandOffSpec>> = {
  authenticated: {
    icon: Check,
    title: "You're signed in",
    body: "Taking you to Himalayan Retail Group. Your workspace lives on its own subdomain, so this is a full browser navigation — not an in-app route change.",
    carries: "a one-time hand-off token in the URL → himalayan.bizakerp.com",
  },
  "password-change": {
    icon: KeyRound,
    title: "Set a new password",
    body: "Your password has to be changed before you can sign in. We're taking you to the reset screen.",
    carries: "a one-time code, so you don't have to ask for another",
  },
  "two-factor": {
    icon: Fingerprint,
    title: "Confirm it's you",
    body: "This account has two-factor turned on. We're loading your authenticator, then you'll enter the code.",
    carries: "your authenticator data, fetched before the hand-off",
  },
  "two-factor-degraded": {
    icon: Fingerprint,
    title: "Confirm it's you",
    body: "We couldn't load your authenticator, so you'll go through in verify-only mode — you can still enter a code, you just won't be able to re-pair a device.",
    carries: "nothing — the prefetch failed, and the hand-off happens anyway",
  },
  "choose-org": {
    icon: Building2,
    title: "Choose an organisation",
    body: "Your account can reach more than one organisation. Pick the one you want — and the role you'll act as. That choice re-enters this same table of outcomes, so it can resolve to any branch on it.",
    carries: "your identity, and the organisations you can reach",
    to: { href: "/design/tenant-selection", label: "Continue" },
  },
  onboarding: {
    icon: Rocket,
    title: "Finish setting up",
    body: "Your workspace isn't built yet. The session we just granted lasts only as long as this browser session — abandon onboarding and you'll sign in again from scratch.",
    carries: "a browser-session-only token, deliberately",
    to: { href: "/design/onboarding", label: "Continue setup" },
  },
  subscription: {
    icon: CreditCard,
    title: "Your subscription has ended",
    body: "The trial on this account is over, so we can't sign you in. You can reactivate it without signing in first.",
    carries: "the account identity, so reactivation knows who to bill",
  },
};

// ════════════════════════════════════════════════════════════════════════════
// SUSPENDED  — in-place transformation. Heading, form, recovery and sign-up all
// vanish; only the brand (above the card) survives.
// ════════════════════════════════════════════════════════════════════════════

function Suspended({ raw, onEscape }: { raw: string; onEscape: () => void }) {
  const { message, reason } = parseSuspension(raw);
  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <span className="mb-5 flex size-12 items-center justify-center rounded-bz-lg bg-[#FBE5E2] text-[#9A2E29]">
          <ShieldAlert size={21} strokeWidth={1.9} />
        </span>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-bz-pill bg-[#FBE5E2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A2E29]">
          <span className="size-1.5 rounded-bz-pill bg-[#C0413A]" />
          Account suspended
        </span>
        <h1 className="text-[20px] font-semibold leading-snug tracking-tight text-bz-text">{message}</h1>
      </div>

      {reason && (
        <div className="mt-5 rounded-bz-md border border-l-2 border-bz-line-soft border-l-[#C0413A] bg-[#FBE7E5]/50 py-2.5 pl-3.5 pr-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A2E29]">Reason from our team</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-bz-text">{reason}</p>
        </div>
      )}

      <p className="mt-5 text-center text-[12.5px] leading-relaxed text-bz-text-muted">
        If you believe this is a mistake or need further assistance, please reach out to our sales team.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        <a
          href={`mailto:${SALES_EMAIL}`}
          className="flex items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 transition-colors hover:bg-bz-paper-warm"
        >
          <Mail size={14} className="shrink-0 text-bz-text-muted" />
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-bz-text">Contact Sales Team</span>
            <span className="block truncate text-[11.5px] text-bz-text-muted">{SALES_EMAIL}</span>
          </span>
          <ArrowRight size={13} className="shrink-0 text-bz-text-soft" />
        </a>
        <a
          href={`tel:${SALES_TEL}`}
          className="flex items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 transition-colors hover:bg-bz-paper-warm"
        >
          <Phone size={14} className="shrink-0 text-bz-text-muted" />
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-bz-text">Call us</span>
            {/* ⚠ this number looks like a placeholder — confirm before shipping */}
            <span className="block truncate text-[11.5px] tabular-nums text-bz-text-muted">{SALES_TEL_LABEL}</span>
          </span>
          <ArrowRight size={13} className="shrink-0 text-bz-text-soft" />
        </a>
      </div>

      <button
        onClick={onEscape}
        className="mt-6 w-full border-t border-bz-line-soft pt-4 text-center text-[12px] font-semibold text-bz-text underline decoration-bz-line underline-offset-[3px] hover:decoration-bz-text"
      >
        Try a different account
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOOR A · SIGN IN
// ════════════════════════════════════════════════════════════════════════════

function SignIn({
  fixes,
  outcome,
  onToast,
  onSignUp,
  onRecover,
  onSuspend,
  onStuck,
}: {
  fixes: boolean;
  outcome: Outcome;
  onToast: (tone: Toast["tone"], text: string) => void;
  onSignUp: () => void;
  onRecover: () => void;
  onSuspend: (raw: string) => void;
  onStuck: () => void;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true); // renders permanently on
  const [touched, setTouched] = React.useState<{ email?: boolean; password?: boolean }>({});
  const [busy, setBusy] = React.useState(session.stuck);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [handoff, setHandoff] = React.useState<Outcome | null>(null);
  const [preparing, setPreparing] = React.useState(false);

  const timers = React.useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const errEmail = signInEmailError(email);
  const errPassword = signInPasswordError(password, fixes);
  const valid = !errEmail && !errPassword;

  const showEmail = touched.email ? errEmail : null;
  const showPassword = touched.password ? errPassword : null;

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;

    if (!valid) {
      if (!fixes) return; // AS BUILT: commit not armed → a silent no-op, no reason given
      setTouched({ email: true, password: true });
      setRefusal(errEmail ?? errPassword);
      return;
    }

    setRefusal(null);
    setBusy(true);

    if (outcome === "hangs") {
      session.stuck = true;
      onStuck();
      return;
    }

    const settle = outcome === "two-factor" || outcome === "two-factor-degraded" ? 900 : 700;
    if (outcome === "two-factor" || outcome === "two-factor-degraded") setPreparing(true);

    after(settle, () => {
      setBusy(false);
      setPreparing(false);
      switch (outcome) {
        case "suspended":
          onSuspend(SUSPEND_RAW);
          return;
        case "suspended-bare":
          onSuspend("");
          return;
        case "bad-noisy":
          if (fixes) {
            setRefusal("That email and password don't match. Check them and try again.");
            return;
          }
          onToast("error", "Http failure response for https://api.bizakerp.com/account/login: 400 Bad Request");
          onToast("error", "Invalid login attempt.");
          return;
        case "bad-silent":
          if (fixes) {
            setRefusal("That email and password don't match. Check them and try again.");
            return;
          }
          return; // in-band rejection → re-navigates to itself, nothing rendered
        case "unknown":
          onToast("error", "Account state cannot be determined (code 87).");
          return;
        case "unknown-empty":
          onToast("error", ""); // server said nothing → an empty notification
          return;
        case "onboarding":
          onToast("info", "Let's finish setting up your workspace.");
          setHandoff(outcome);
          return;
        case "subscription":
          onToast("error", "Your subscription has expired.");
          setHandoff(outcome);
          return;
        case "two-factor-degraded":
          onToast("error", "We couldn't load your authenticator.");
          setHandoff(outcome);
          return;
        default:
          setHandoff(outcome);
      }
    });
  }

  if (handoff && HANDOFFS[handoff]) {
    return <HandOff spec={HANDOFFS[handoff]!} onBack={() => setHandoff(null)} />;
  }

  const armed = fixes || valid; // the two opposite commit contracts, in one line

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <Eyebrow>Sign in</Eyebrow>
        <h1 className="mt-5 text-[27px] font-semibold leading-tight tracking-tight text-bz-text">
          Welcome back
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-bz-text-muted">
          Sign in to pick up where you left off.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4" noValidate>
        <Field label="Email" htmlFor="si-email" required error={showEmail}>
          <TextInput
            id="si-email"
            type="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            placeholder="you@company.com"
            invalid={!!showEmail}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="si-password"
          required
          error={showPassword}
          action={
            <button
              type="button"
              onClick={onRecover}
              className="text-[11.5px] font-medium text-bz-text-muted underline-offset-[3px] hover:text-bz-text hover:underline"
            >
              Forgot password?
            </button>
          }
        >
          <PasswordInput
            id="si-password"
            value={password}
            autoComplete="current-password"
            placeholder="Enter your password"
            invalid={!!showPassword}
            onChange={setPassword}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          />
        </Field>

        <div className="flex items-center gap-2.5">
          <Switch
            value={remember}
            // ⚠ INERT as built — bound to no state, never sent. Responds only with fixes on.
            onChange={(v) => fixes && setRemember(v)}
            ariaLabel="Stay signed in"
          />
          <span className="text-[12px] text-bz-text-muted">Stay signed in</span>
        </div>

        <Refusal message={refusal} />

        <Primary busy={busy} disabled={!armed} className="mt-1">
          {busy ? (preparing ? "Preparing your authenticator…" : "Signing you in…") : "Sign in"}
          {!busy && <ArrowRight size={14} />}
        </Primary>
      </form>

      <p className="mt-7 border-t border-bz-line-soft pt-5 text-center text-[12.5px] text-bz-text-muted">
        Don't have an account yet? <TextLink onClick={onSignUp}>Sign up</TextLink>
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOOR B · SIGN UP  — dual-hosted. `embedded` drops the outer frame (the host
// supplies it); the step, the commit and the "sign in" escape render in both.
// ════════════════════════════════════════════════════════════════════════════

function SignUp({
  embedded,
  fixes,
  outcome,
  onToast,
  onSignIn,
  onBusy,
}: {
  embedded: boolean;
  fixes: boolean;
  outcome: SignUpOutcome;
  onToast: (tone: Toast["tone"], text: string) => void;
  onSignIn: () => void;
  onBusy: (v: boolean) => void;
}) {
  const [first, setFirst] = React.useState("");
  const [last, setLast] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [busy, setBusy] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState<string | null>(null);

  const timers = React.useRef<number[]>([]);
  const release = React.useRef(onBusy);
  release.current = onBusy;
  React.useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      release.current(false); // watchdog: never leave the overlay stuck on
    },
    [],
  );

  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const shown = (k: string) => !!touched[k];

  const passed = PW_RULES.filter((r) => r.test(pw)).length;
  const firstUnmet = PW_RULES.find((r) => !r.test(pw)) ?? null;
  const pwOk = passed === PW_RULES.length;
  const match = pw.length > 0 && pw === pw2;

  const errFirst = nameError(first, "First name");
  const errLast = nameError(last, "Last name");
  const errEmail = signUpEmailError(email);
  const errPw2 = !pw2 ? "Please confirm your password." : null;

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;

    const reason =
      errFirst ??
      errLast ??
      errEmail ??
      (!pwOk ? `Your password still needs ${firstUnmet?.label}.` : null) ??
      (!match ? "The two passwords don't match." : null) ??
      (!consent ? "You must agree to the terms and conditions." : null);

    if (reason) {
      setTouched({ first: true, last: true, email: true, pw: true, pw2: true, consent: true });
      setRefusal(reason);
      return;
    }

    setRefusal(null);
    setBusy(true);
    onBusy(true);
    void registrationPayload({ first, last, email, pw, pw2, consent });

    timers.current.push(
      window.setTimeout(() => {
        setBusy(false);
        onBusy(false);
        if (outcome === "created") {
          onToast("ok", "Account created — check your email.");
          setSent(email.trim());
          return;
        }
        const text = "An account with this email already exists.";
        if (outcome === "rejected-double") onToast("error", "Registration failed.");
        onToast("error", text);
        if (fixes) setRefusal(text);
      }, 1100),
    );
  }

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-bz-lg bg-bz-fire/[0.2] text-bz-leaf-deep">
          <Mail size={20} strokeWidth={1.9} />
        </span>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-bz-text">
          Check your email
        </h1>
        <p className="mx-auto mt-2.5 max-w-[340px] text-[13px] leading-relaxed text-bz-text-muted">
          We sent an activation link to <span className="font-semibold text-bz-text">{sent}</span>. Open it
          to finish setting up — the link expires in <span className="tabular-nums">24</span> hours.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            onClick={() => onToast("ok", "We've sent another link.")}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-4 text-[13px] font-medium text-bz-text transition-colors hover:bg-bz-paper-warm"
          >
            <RefreshCw size={13} /> Resend link
          </button>
          <button
            onClick={onSignIn}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-bz-md px-4 text-[13px] font-medium text-bz-text-muted transition-colors hover:text-bz-text"
          >
            Back to sign in
          </button>
        </div>
        <p className="mx-auto mt-7 max-w-[340px] border-t border-bz-line-soft pt-4 text-[11px] leading-relaxed text-bz-text-soft">
          {embedded
            ? "Even embedded in the journey, a successful sign-up EXITS it — the step-complete output the journey listens for is never emitted."
            : "Landing here cold — a pasted URL, a new tab — bounces back to the form: the email lives only in navigation state."}
        </p>
      </div>
    );
  }

  const pwTooShortMsg = shown("pw") && !pw ? "Password is required." : null;

  return (
    <div>
      <div className={cn("flex flex-col", embedded ? "items-start text-left" : "items-center text-center")}>
        <Eyebrow>{embedded ? "Step 1 · Create account" : "Create account"}</Eyebrow>
        <h1 className="mt-5 text-[24px] font-semibold leading-tight tracking-tight text-bz-text">
          Create your Bizak account
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-bz-text-muted">
          This is the account you'll administer the workspace with.
        </p>
      </div>

      <form onSubmit={submit} className="mt-7 flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="su-first" required error={shown("first") ? errFirst : null}>
            <TextInput
              id="su-first"
              autoComplete="given-name"
              value={first}
              placeholder="Anjali"
              invalid={shown("first") && !!errFirst}
              onChange={(e) => setFirst(e.target.value)}
              onBlur={() => touch("first")}
            />
          </Field>
          <Field label="Last name" htmlFor="su-last" required error={shown("last") ? errLast : null}>
            <TextInput
              id="su-last"
              autoComplete="family-name"
              value={last}
              placeholder="Shrestha"
              invalid={shown("last") && !!errLast}
              onChange={(e) => setLast(e.target.value)}
              onBlur={() => touch("last")}
            />
          </Field>
        </div>

        <Field
          label="Work email"
          htmlFor="su-email"
          required
          hint="This is also your username"
          error={shown("email") ? errEmail : null}
        >
          <TextInput
            id="su-email"
            type="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            placeholder="you@company.com"
            invalid={shown("email") && !!errEmail}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
          />
        </Field>

        {/* B4 — as built this control has NO error surface; the message below appears
            only with the fixes on. */}
        <Field label="Password" htmlFor="su-pw" required error={fixes ? pwTooShortMsg : null}>
          <PasswordInput
            id="su-pw"
            value={pw}
            autoComplete="new-password"
            placeholder="Create a strong password"
            invalid={fixes && !!pwTooShortMsg}
            onChange={(v) => {
              setPw(v);
              touch("pw");
            }}
          />
        </Field>

        {shown("pw") && (
          <div className="-mt-2">
            <div className="flex gap-1" aria-hidden>
              {PW_RULES.map((r, i) => (
                <span
                  key={r.key}
                  className={cn(
                    "h-[3px] flex-1 rounded-bz-pill transition-colors",
                    i < passed ? "bg-bz-fire" : "bg-bz-line-soft",
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-bz-text-muted">
              {pwOk ? (
                <span className="inline-flex items-center gap-1 font-medium text-bz-leaf-deep">
                  <Check size={11} strokeWidth={3} /> Strong password
                </span>
              ) : (
                <>
                  <span className="tabular-nums">{passed}</span> of{" "}
                  <span className="tabular-nums">{PW_RULES.length}</span> — still needs{" "}
                  <span className="font-medium text-bz-text">{firstUnmet?.label}</span>.
                </>
              )}
            </p>
          </div>
        )}

        <Field
          label="Confirm password"
          htmlFor="su-pw2"
          required
          error={shown("pw2") && !pw2 ? errPw2 : null}
        >
          <PasswordInput
            id="su-pw2"
            value={pw2}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            invalid={shown("pw2") && pw2.length > 0 && !match}
            onChange={(v) => {
              setPw2(v);
              touch("pw2");
            }}
          />
        </Field>

        {shown("pw2") && pw2.length > 0 && (
          <p
            className={cn(
              "-mt-2 flex items-center gap-1 text-[11px] font-medium",
              match ? "text-bz-leaf-deep" : "text-[#9A2E29]",
            )}
          >
            {match ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
            {match ? "Passwords match" : "Passwords don't match"}
          </p>
        )}

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 p-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                touch("consent");
              }}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-px flex size-4 shrink-0 items-center justify-center rounded-bz-sm border transition-colors",
                consent ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface",
              )}
            >
              {consent && <Check size={11} strokeWidth={3} />}
            </span>
            <span className="text-[12px] leading-relaxed text-bz-text-muted">
              I agree to the{" "}
              <a
                href={TERMS_URL}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-bz-text underline underline-offset-2"
              >
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a
                href={PRIVACY_URL}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-bz-text underline underline-offset-2"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {shown("consent") && !consent && (
            <p className="mt-1.5 flex items-start gap-1 text-[11px] font-medium text-[#9A2E29]">
              <AlertCircle size={11} className="mt-px shrink-0" />
              You must agree to the terms and conditions.
            </p>
          )}
        </div>

        <Refusal message={refusal} />

        <Primary busy={busy}>
          {busy ? "Creating your account…" : "Create account"}
          {!busy && <ArrowRight size={14} />}
        </Primary>
      </form>

      <p className="mt-7 border-t border-bz-line-soft pt-5 text-center text-[12.5px] text-bz-text-muted">
        Already have an account? <TextLink onClick={onSignIn}>Sign in</TextLink>
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOOR C · RECOVERY  — the gated door. Each phase is its own round-trip; the
// questions phase exists only when the account has them. Borrows sign-up's
// always-armed contract. Returns to sign in on success.
// ════════════════════════════════════════════════════════════════════════════

type Phase = "identify" | "questions" | "reset";
const RESEND_COOLDOWN = 30;

function Recover({
  outcome,
  onToast,
  onSignIn,
}: {
  outcome: RecoverOutcome;
  onToast: (tone: Toast["tone"], text: string) => void;
  onSignIn: () => void;
}) {
  const [phase, setPhase] = React.useState<Phase>("identify");
  const [email, setEmail] = React.useState("");
  const [answers, setAnswers] = React.useState<string[]>(() => SECURITY_QUESTIONS.map(() => ""));
  const [code, setCode] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [busy, setBusy] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const after = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const shown = (k: string) => !!touched[k];

  const hasQuestions = outcome === "questions" || outcome === "answers-rejected";
  const steps: Phase[] = hasQuestions ? ["identify", "questions", "reset"] : ["identify", "reset"];
  const stepIndex = steps.indexOf(phase);

  const errEmail = signUpEmailError(email);
  const passed = PW_RULES.filter((r) => r.test(pw)).length;
  const firstUnmet = PW_RULES.find((r) => !r.test(pw)) ?? null;
  const pwOk = passed === PW_RULES.length;
  const match = pw.length > 0 && pw === pw2;

  function sendCode(resend = false) {
    if (busy || resending) return;
    if (errEmail) {
      touch("email");
      setRefusal(errEmail);
      return;
    }
    setRefusal(null);
    const flight = resend ? setResending : setBusy;
    flight(true);
    after(800, () => {
      flight(false);
      if (outcome === "unknown") {
        setRefusal("We couldn't find an account with that email.");
        return;
      }
      setCooldown(RESEND_COOLDOWN);
      onToast("ok", resend ? "We've sent another code." : "Code sent — check your email.");
      if (!resend) setPhase(hasQuestions ? "questions" : "reset");
    });
  }

  function answerQuestions() {
    if (busy) return;
    if (answers.some((a) => !a.trim())) {
      setTouched((t) => ({
        ...t,
        ...Object.fromEntries(SECURITY_QUESTIONS.map((_, i) => [`a${i}`, true])),
      }));
      setRefusal("Answer both questions to continue.");
      return;
    }
    setRefusal(null);
    setBusy(true);
    after(800, () => {
      setBusy(false);
      if (outcome === "answers-rejected") {
        setRefusal("Those answers don't match what we have on file.");
        onToast("error", "Security answers rejected.");
        return;
      }
      setPhase("reset");
    });
  }

  function resetPassword() {
    if (busy) return;
    const reason =
      (code.trim().length !== 6 ? "Enter the 6-digit code we emailed you." : null) ??
      (!pwOk ? `Your new password still needs ${firstUnmet?.label}.` : null) ??
      (!match ? "The two passwords don't match." : null);
    if (reason) {
      setTouched({ code: true, pw: true, pw2: true });
      setRefusal(reason);
      return;
    }
    setRefusal(null);
    setBusy(true);
    after(1000, () => {
      setBusy(false);
      if (outcome === "expired") {
        setRefusal("That code has expired or is incorrect. Send yourself a new one.");
        onToast("error", "Invalid or expired code.");
        return;
      }
      onToast("ok", "Password updated.");
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-bz-lg bg-bz-fire/[0.2] text-bz-leaf-deep">
          <Check size={21} strokeWidth={2.6} />
        </span>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-bz-text">
          Your password is updated
        </h1>
        <p className="mx-auto mt-2.5 max-w-[340px] text-[13px] leading-relaxed text-bz-text-muted">
          Sign in with your new password. We've signed you out everywhere else.
        </p>
        <button
          onClick={onSignIn}
          className="mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-5 text-[13px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95"
        >
          Back to sign in <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <Eyebrow>Reset password</Eyebrow>
        <h1 className="mt-5 text-[24px] font-semibold leading-tight tracking-tight text-bz-text">
          {phase === "identify"
            ? "Reset your password"
            : phase === "questions"
              ? "A couple of security questions"
              : "Set a new password"}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-bz-text-muted">
          {phase === "identify" ? (
            "Tell us the email you sign in with and we'll send you a one-time code."
          ) : phase === "questions" ? (
            "This account keeps security questions. Answer them and we'll let you set a new password."
          ) : (
            <>
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-bz-text">{email.trim()}</span>. Enter it, then choose a
              new password.
            </>
          )}
        </p>
      </div>

      {phase !== "identify" && (
        <div className="mt-6 flex items-center gap-2.5">
          <div className="flex flex-1 gap-1">
            {steps.map((s, i) => (
              <span
                key={s}
                className={cn(
                  "h-[3px] flex-1 rounded-bz-pill transition-colors",
                  i <= stepIndex ? "bg-bz-fire" : "bg-bz-line-soft",
                )}
              />
            ))}
          </div>
          <span className="shrink-0 text-[10.5px] font-medium tabular-nums text-bz-text-soft">
            Step {stepIndex + 1} of {steps.length}
          </span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (phase === "identify") sendCode();
          else if (phase === "questions") answerQuestions();
          else resetPassword();
        }}
        className="mt-6 flex flex-col gap-4"
        noValidate
      >
        {phase === "identify" && (
          <Field label="Email" htmlFor="rc-email" required error={shown("email") ? errEmail : null}>
            <TextInput
              id="rc-email"
              type="email"
              inputMode="email"
              autoComplete="username"
              value={email}
              placeholder="you@company.com"
              invalid={shown("email") && !!errEmail}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch("email")}
            />
          </Field>
        )}

        {phase === "questions" &&
          SECURITY_QUESTIONS.map((q, i) => (
            <Field
              key={q}
              label={q}
              htmlFor={`rc-a${i}`}
              required
              error={shown(`a${i}`) && !answers[i].trim() ? "This answer is required." : null}
            >
              <TextInput
                id={`rc-a${i}`}
                autoComplete="off"
                value={answers[i]}
                placeholder="Your answer"
                invalid={shown(`a${i}`) && !answers[i].trim()}
                onChange={(e) => setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))}
                onBlur={() => touch(`a${i}`)}
              />
            </Field>
          ))}

        {phase === "reset" && (
          <>
            <Field
              label="One-time code"
              htmlFor="rc-code"
              required
              error={shown("code") && code.trim().length !== 6 ? "Enter all 6 digits." : null}
              action={
                <button
                  type="button"
                  disabled={cooldown > 0 || busy || resending}
                  onClick={() => sendCode(true)}
                  className="inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-muted underline-offset-[3px] hover:text-bz-text hover:underline disabled:cursor-not-allowed disabled:text-bz-text-soft disabled:no-underline"
                >
                  {resending ? (
                    <>
                      <Loader2 size={11} className="animate-spin" /> Sending…
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      Resend in <span className="tabular-nums">{cooldown}</span>s
                    </>
                  ) : (
                    "Resend code"
                  )}
                </button>
              }
            >
              <TextInput
                id="rc-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                placeholder="000000"
                invalid={shown("code") && code.trim().length !== 6}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onBlur={() => touch("code")}
                className="tracking-[0.5em] tabular-nums"
              />
            </Field>

            <Field label="New password" htmlFor="rc-pw" required>
              <PasswordInput
                id="rc-pw"
                value={pw}
                autoComplete="new-password"
                placeholder="Create a strong password"
                onChange={(v) => {
                  setPw(v);
                  touch("pw");
                }}
              />
            </Field>

            {shown("pw") && (
              <div className="-mt-2">
                <div className="flex gap-1" aria-hidden>
                  {PW_RULES.map((r, i) => (
                    <span
                      key={r.key}
                      className={cn(
                        "h-[3px] flex-1 rounded-bz-pill transition-colors",
                        i < passed ? "bg-bz-fire" : "bg-bz-line-soft",
                      )}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-bz-text-muted">
                  {pwOk ? (
                    <span className="inline-flex items-center gap-1 font-medium text-bz-leaf-deep">
                      <Check size={11} strokeWidth={3} /> Strong password
                    </span>
                  ) : (
                    <>
                      <span className="tabular-nums">{passed}</span> of{" "}
                      <span className="tabular-nums">{PW_RULES.length}</span> — still needs{" "}
                      <span className="font-medium text-bz-text">{firstUnmet?.label}</span>.
                    </>
                  )}
                </p>
              </div>
            )}

            <Field label="Confirm new password" htmlFor="rc-pw2" required>
              <PasswordInput
                id="rc-pw2"
                value={pw2}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                invalid={shown("pw2") && pw2.length > 0 && !match}
                onChange={(v) => {
                  setPw2(v);
                  touch("pw2");
                }}
              />
            </Field>

            {shown("pw2") && pw2.length > 0 && (
              <p
                className={cn(
                  "-mt-2 flex items-center gap-1 text-[11px] font-medium",
                  match ? "text-bz-leaf-deep" : "text-[#9A2E29]",
                )}
              >
                {match ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                {match ? "Passwords match" : "Passwords don't match"}
              </p>
            )}
          </>
        )}

        <Refusal message={refusal} />

        <Primary busy={busy} className="mt-1">
          {busy
            ? phase === "identify"
              ? "Sending your code…"
              : phase === "questions"
                ? "Checking your answers…"
                : "Updating your password…"
            : phase === "identify"
              ? "Send code"
              : phase === "questions"
                ? "Continue"
                : "Reset password"}
          {!busy && <ArrowRight size={14} />}
        </Primary>
      </form>

      <p className="mt-7 border-t border-bz-line-soft pt-5 text-center text-[12.5px] text-bz-text-muted">
        Remembered it? <TextLink onClick={onSignIn}>Sign in</TextLink>
      </p>
    </div>
  );
}

/** X3 — sign-up only. A global overlay blocks input while the create-account
 *  request is in flight. Sign-in has none. */
function BlockingOverlay() {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(10,16,13,0.35)]">
      <div className="flex items-center gap-2.5 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_24px_60px_-24px_rgba(15,20,17,0.4)]">
        <Loader2 size={15} className="animate-spin text-bz-text-muted" />
        <span className="text-[12.5px] font-medium text-bz-text">Please wait…</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DEMO DOCK  — everything unreachable by clicking forward.
// ════════════════════════════════════════════════════════════════════════════

const DOCK_LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";

function DockRow({ active, label, onPick }: { active: boolean; label: string; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className={cn(
        "flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[11.5px] transition-colors",
        active ? "bg-bz-paper-warm font-semibold text-bz-text" : "text-bz-text-muted hover:bg-bz-paper-warm/60",
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-bz-pill", active ? "bg-bz-fire" : "bg-bz-line")} />
      {label}
    </button>
  );
}

function Dock({
  mode,
  outcome,
  signUpOutcome,
  recoverOutcome,
  fixes,
  embedded,
  suspended,
  stuck,
  onOutcome,
  onSignUpOutcome,
  onRecoverOutcome,
  onFixes,
  onEmbedded,
  onReset,
  onClose,
}: {
  mode: Mode;
  outcome: Outcome;
  signUpOutcome: SignUpOutcome;
  recoverOutcome: RecoverOutcome;
  fixes: boolean;
  embedded: boolean;
  suspended: boolean;
  stuck: boolean;
  onOutcome: (o: Outcome) => void;
  onSignUpOutcome: (o: SignUpOutcome) => void;
  onRecoverOutcome: (o: RecoverOutcome) => void;
  onFixes: (v: boolean) => void;
  onEmbedded: (v: boolean) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const dirty = suspended || stuck;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[115] inline-flex h-9 items-center gap-2 rounded-bz-pill border border-bz-line-soft bg-bz-surface pl-3 pr-3.5 text-[11.5px] font-semibold text-bz-text-muted shadow-[0_14px_36px_-18px_rgba(15,20,17,0.35)] transition-colors hover:text-bz-text"
      >
        <SlidersHorizontal size={13} />
        Preview
        {dirty && <span className="size-1.5 rounded-bz-pill bg-[#C0413A]" />}
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[115] flex max-h-[calc(100dvh-40px)] w-[min(310px,calc(100vw-32px))] flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_24px_60px_-24px_rgba(15,20,17,0.4)]">
      <header className="flex shrink-0 items-center gap-2 border-b border-bz-line-soft px-3 py-2.5">
        <SlidersHorizontal size={13} className="text-bz-text-muted" />
        <span className={cn(DOCK_LABEL, "flex-1")}>Preview · Spotlight</span>
        <button
          onClick={() => setOpen(false)}
          aria-label="Collapse"
          className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <X size={12} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <p className={cn("mb-1.5", DOCK_LABEL)}>
          {mode === "signin" ? "Server verdict · navigates away" : "Server verdict"}
        </p>

        {mode === "signin" ? (
          <>
            <div className="flex flex-col">
              {LEAVES.map((o) => (
                <DockRow key={o.k} active={outcome === o.k} label={o.label} onPick={() => onOutcome(o.k)} />
              ))}
            </div>
            <p className={cn("mb-1.5 mt-3", DOCK_LABEL)}>Stays on this page</p>
            <div className="flex flex-col">
              {STAYS.map((o) => (
                <DockRow key={o.k} active={outcome === o.k} label={o.label} onPick={() => onOutcome(o.k)} />
              ))}
            </div>
          </>
        ) : mode === "recover" ? (
          <>
            <div className="flex flex-col">
              {RECOVER_OUTCOMES.map((o) => (
                <DockRow key={o.k} active={recoverOutcome === o.k} label={o.label} onPick={() => onRecoverOutcome(o.k)} />
              ))}
            </div>
            <p className="mt-2.5 text-[10.5px] leading-relaxed text-bz-text-soft">
              Whether the questions phase exists is the ACCOUNT's property. Picking a verdict restarts the
              flow from the top.
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col">
              {SIGNUP_OUTCOMES.map((o) => (
                <DockRow key={o.k} active={signUpOutcome === o.k} label={o.label} onPick={() => onSignUpOutcome(o.k)} />
              ))}
            </div>
            <p className={cn("mb-2 mt-4", DOCK_LABEL)}>Host</p>
            <div className="flex items-start gap-2.5">
              <Switch value={embedded} onChange={onEmbedded} ariaLabel="Embed in the onboarding journey" />
              <p className="text-[11px] leading-relaxed text-bz-text-muted">
                Embed in the onboarding journey. The host supplies the frame — the step renders bare.
              </p>
            </div>
          </>
        )}

        <p className={cn("mb-2 mt-4 border-t border-bz-line-soft pt-3", DOCK_LABEL)}>Behaviour</p>
        <div className="flex items-start gap-2.5">
          <Switch value={fixes} onChange={onFixes} ariaLabel="Apply proposed fixes" />
          <p className="text-[11px] leading-relaxed text-bz-text-muted">
            Apply proposed fixes.{" "}
            <span className="text-bz-text-soft">Off = exactly as built, including the two opposite commit contracts.</span>
          </p>
        </div>
        {fixes && (
          <ul className="mt-2.5 flex flex-col gap-1.5 rounded-bz-md bg-bz-paper-warm/60 p-2.5">
            {FIXES.map((f) => (
              <li key={f.id} className="flex gap-1.5 text-[10.5px] leading-relaxed text-bz-text-muted">
                <span className="shrink-0 font-bold text-bz-text-soft">{f.ref}</span>
                {f.text}
              </li>
            ))}
          </ul>
        )}

        <p className={cn("mb-2 mt-4 border-t border-bz-line-soft pt-3", DOCK_LABEL)}>Session</p>
        <p className="text-[11px] leading-relaxed text-bz-text-muted">
          The suspension verdict and the busy flag live on a service that OUTLIVES the page — they replay
          across both doors.
        </p>
        <div className="mt-2 flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-[11px] text-bz-text-muted">
            <span className={cn("size-1.5 rounded-bz-pill", suspended ? "bg-[#C0413A]" : "bg-bz-line")} />
            Suspension held: <span className="font-semibold text-bz-text">{suspended ? "yes" : "no"}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-bz-text-muted">
            <span className={cn("size-1.5 rounded-bz-pill", stuck ? "bg-[#C0413A]" : "bg-bz-line")} />
            Commit stuck busy: <span className="font-semibold text-bz-text">{stuck ? "yes" : "no"}</span>
          </span>
        </div>
        <button
          onClick={onReset}
          className="mt-2.5 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface text-[11.5px] font-medium text-bz-text transition-colors hover:bg-bz-paper-warm"
        >
          <RefreshCw size={12} /> Reset session (a full reload)
        </button>

        <p className="mt-4 border-t border-bz-line-soft pt-3 text-[10.5px] leading-relaxed text-bz-text-soft">
          {mode === "signin"
            ? "Sends { email, password } — nothing else. “Stay signed in” is never sent."
            : mode === "recover"
              ? "Three round-trips: request the code, answer the questions (when the account has them), then submit the code with the new password. Success returns to sign in."
              : "Stamped in code, never shown: UserType O · FromRegister S · SubscriptionType Trial. UserName is the email."}
        </p>
      </div>

      <button
        onClick={onClose}
        className="shrink-0 border-t border-bz-line-soft px-3 py-2.5 text-left text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"
      >
        Close preview →
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export type Mode = "signin" | "signup" | "recover";

export function AuthSpotlightDesignPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(true);
  const [outcome, setOutcome] = React.useState<Outcome>(session.outcome);
  const [signUpOutcome, setSignUpOutcome] = React.useState<SignUpOutcome>(session.signUpOutcome);
  const [recoverOutcome, setRecoverOutcome] = React.useState<RecoverOutcome>(session.recoverOutcome);
  const [fixes, setFixes] = React.useState(session.fixes);
  const [embedded, setEmbedded] = React.useState(session.embedded);

  const [suspended, setSuspended] = React.useState<string | null>(session.suspended);
  const [stuck, setStuck] = React.useState(session.stuck);
  const [nonce, setNonce] = React.useState(0);

  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const toastId = React.useRef(0);
  const [busySignUp, setBusySignUp] = React.useState(false);

  const pushToast = React.useCallback((tone: Toast["tone"], text: string) => {
    setToasts((prev) => {
      if (prev.some((t) => t.text === text)) return prev;
      return [...prev, { id: ++toastId.current, tone, text }].slice(-2);
    });
  }, []);

  const set = <T,>(key: keyof typeof session, v: T, apply: (v: T) => void) => {
    (session as Record<string, unknown>)[key] = v;
    apply(v);
  };

  const reset = () => {
    session.suspended = null;
    session.stuck = false;
    setSuspended(null);
    setStuck(false);
    setNonce((n) => n + 1);
    setToasts([]);
    setBusySignUp(false);
    navigate("/design/sign-in-alt");
  };

  const suspend = (raw: string) => {
    session.suspended = raw;
    setSuspended(raw);
  };

  const escape = () => {
    if (fixes) {
      session.suspended = null;
      setNonce((n) => n + 1);
    }
    setSuspended(null);
  };

  const door =
    mode === "signin" ? (
      <>
        <div className={suspended !== null ? "hidden" : undefined}>
          <SignIn
            key={nonce}
            fixes={fixes}
            outcome={outcome}
            onToast={pushToast}
            onSignUp={() => navigate("/design/sign-up-alt")}
            onRecover={() => navigate("/design/forgot-password-alt")}
            onSuspend={suspend}
            onStuck={() => setStuck(true)}
          />
        </div>
        {suspended !== null && <Suspended raw={suspended} onEscape={escape} />}
      </>
    ) : mode === "recover" ? (
      <Recover
        key={nonce}
        outcome={recoverOutcome}
        onToast={pushToast}
        onSignIn={() => navigate("/design/sign-in-alt")}
      />
    ) : (
      <SignUp
        embedded={embedded}
        fixes={fixes}
        outcome={signUpOutcome}
        onToast={pushToast}
        onSignIn={() => navigate("/design/sign-in-alt")}
        onBusy={setBusySignUp}
      />
    );

  // embedded sign-up drops the brand + the editorial frame — the journey host
  // supplies both. Everything else renders the same.
  const embeddedNow = mode === "signup" && embedded;

  return (
    <AppShell
      topBarTone="section"
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Account</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Spotlight</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">
            {mode === "signin" ? "Sign in" : mode === "recover" ? "Reset password" : "Create account"}
          </span>
        </>
      }
      overlay={
        open
          ? createPortal(
              <div
                className="fixed inset-0 z-[90] overflow-y-auto bg-bz-section-b"
                style={{ fontFamily: "var(--bz-body-font)" }}
              >
                {embeddedNow ? (
                  // the EMBEDDED host, stood in for: a neutral container the journey
                  // supplies, with the step rendered bare inside it.
                  <div className="flex min-h-full items-center justify-center px-5 py-14">
                    <div className="w-full max-w-[560px]">
                      <p className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-bz-text-soft">
                        Rendered inside the onboarding journey — host supplies the frame
                      </p>
                      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-8 shadow-[0_24px_60px_-40px_rgba(15,20,17,0.25)] sm:px-9">
                        <div className="mx-auto w-full max-w-[400px]">{door}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col items-center justify-center px-5 py-14">
                    <div className="mb-7 flex justify-center">
                      <BrandMark />
                    </div>
                    <div className="w-full max-w-[420px] rounded-bz-xl border border-bz-line-soft bg-bz-surface p-7 shadow-[0_28px_70px_-40px_rgba(15,20,17,0.3)] sm:p-8">
                      {door}
                    </div>
                    <p className="mt-8 text-center text-[10.5px] tracking-wide text-bz-text-soft">
                      The operating system for modern business.
                    </p>
                  </div>
                )}

                {busySignUp && <BlockingOverlay />}
                <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
                <Dock
                  mode={mode}
                  outcome={outcome}
                  signUpOutcome={signUpOutcome}
                  recoverOutcome={recoverOutcome}
                  fixes={fixes}
                  embedded={embedded}
                  suspended={session.suspended !== null}
                  stuck={stuck}
                  onOutcome={(o) => set("outcome", o, setOutcome)}
                  onSignUpOutcome={(o) => set("signUpOutcome", o, setSignUpOutcome)}
                  onRecoverOutcome={(o) => {
                    set("recoverOutcome", o, setRecoverOutcome);
                    setNonce((n) => n + 1);
                  }}
                  onFixes={(v) => set("fixes", v, setFixes)}
                  onEmbedded={(v) => set("embedded", v, setEmbedded)}
                  onReset={reset}
                  onClose={() => setOpen(false)}
                />
              </div>,
              document.body,
            )
          : null
      }
    >
      <ShellNote mode={mode} open={open} onOpen={() => setOpen(true)} />
    </AppShell>
  );
}

function ShellNote({ mode, open, onOpen }: { mode: Mode; open: boolean; onOpen: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-12 md:py-16">
      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-6 shadow-[0_20px_50px_-36px_rgba(15,20,17,0.28)]">
        <span className="flex size-10 items-center justify-center rounded-bz-md bg-bz-deep text-bz-fire">
          {mode === "signin" ? (
            <LogIn size={18} strokeWidth={1.9} />
          ) : mode === "recover" ? (
            <Lock size={18} strokeWidth={1.9} />
          ) : (
            <KeyRound size={18} strokeWidth={1.9} />
          )}
        </span>
        <h1 className="mt-4 text-[19px] font-semibold tracking-tight text-bz-text">
          {mode === "signin" ? "Sign in" : mode === "recover" ? "Reset password" : "Create account"}
          <span className="ml-2 rounded-bz-sm bg-bz-deep px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-fire">
            Spotlight
          </span>
        </h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-bz-text-muted">
          The second design direction — a centred, editorial take on the same door: one card, floated on
          a paper field. It renders into a bare outlet, so the preview covers the viewport. Every server
          verdict lives in the preview dock, bottom-right.
        </p>
        {!open && (
          <button
            onClick={onOpen}
            className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95"
          >
            Open the door <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
