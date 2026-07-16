import * as React from "react";
import {
  Building2,
  ChevronRight,
  Loader2,
  Check,
  CheckCircle2,
  LogOut,
  AlertCircle,
  Ban,
  Inbox,
  RefreshCw,
  Lock,
  WifiOff,
  X,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// TENANT & ROLE SELECTION  ·  post-login identity gate
//
// This is NOT an in-app workspace — it is the gate a signed-in user hits when
// their account can reach MORE THAN ONE organisation (or role). Its one job:
// resolve which (organisation, role) they act as this session.
//
//   • Primary action = COMMIT a role.  Each role row is a self-contained submit
//     that authenticates the chosen identity and hands the user off (a full
//     redirect off this screen). There is no "current" role — this is the FIRST
//     choice, so no context is active yet and only one commit can be in flight.
//   • Everything else serves that choice: a calm centred card of org groups,
//     each org's roles as the big tap targets, and one shared "remember this
//     choice as my default" preference read into the commit payload.
//
// The listing is data-driven off a fetched two-level tree (orgs → roles). The
// gate distinguishes the states a silent fetch can land in — resolving,
// available, no-access, and load-failed — which the legacy screen collapsed
// into one blank listing.
//
// Built in the app design language (AppShell + bz-* tokens); a sibling to the
// in-session switcher that lives in DesignTopBar's account menu.
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// IDENTITY + FETCHED TREE  (mock — in production the id resolves from the active
// session, else the login hand-off cookie, and drives a "my tenants" request)
// ════════════════════════════════════════════════════════════════════════════

const USER = {
  id: "USR-4821",
  name: "Mira Silwal",
  email: "mira.silwal22@gmail.com",
  // identity resolution precedence: prefer the live session, fall back to the
  // login hand-off cookie (the typical case on this immediately-post-login gate)
  source: "session" as "session" | "cookie",
};

type Role = { id: string; name: string; blurb: string };
type Org = {
  id: string; // tenant id
  name: string;
  place: string;
  suspended?: boolean; // tenant the change-role request will reject
  roles: Role[];
};

const ORG_TREE: Org[] = [
  {
    id: "TEN-1001",
    name: "Himalayan Retail Group",
    place: "Kathmandu · Retail & distribution",
    roles: [
      { id: "ROL-ADM", name: "Administrator", blurb: "Full access across every module" },
      { id: "ROL-SLS", name: "Sales Manager", blurb: "Orders, customers & pipeline" },
    ],
  },
  {
    id: "TEN-1002",
    name: "Bizak Nepal · Pokhara",
    place: "Pokhara · Wholesale",
    roles: [{ id: "ROL-ACC", name: "Accountant", blurb: "Ledger, payments & reports" }],
  },
  {
    id: "TEN-1003",
    name: "Annapurna Distributors",
    place: "Biratnagar · Distribution",
    suspended: true, // committing here fails → exercises the commit-error path
    roles: [
      { id: "ROL-BRN", name: "Branch Manager", blurb: "Branch operations & approvals" },
      { id: "ROL-STK", name: "Store Keeper", blurb: "Stock, transfers & adjustments" },
    ],
  },
  {
    id: "TEN-1004",
    name: "Sagarmatha Holdings",
    place: "Lalitpur · Group holding",
    roles: [], // access at the org level, but no role assigned yet (empty variant)
  },
];

const roleKey = (org: Org, role: Role) => `${org.id}::${role.id}`;
const initialsOf = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

function Switch({
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-bz-pill border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute h-3.5 w-3.5 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          value ? "translate-x-[18px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

function SuspendedChip() {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-bz-pill bg-[#FBE5E2] px-2 py-0.5 text-[10px] font-semibold text-[#9A2E29]">
      <Lock size={9} strokeWidth={2.4} />
      Suspended
    </span>
  );
}

function Monogram({ label, size = 40 }: { label: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-bz-pill bg-bz-deep font-semibold text-bz-fire"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER + IDENTITY
// ════════════════════════════════════════════════════════════════════════════

// signed-in identity — resolved from the session (or the hand-off cookie)
function IdentityChip({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 rounded-bz-pill border border-bz-line-soft bg-bz-surface py-1.5 pl-1.5 pr-3">
      <Monogram label={initialsOf(USER.name)} size={26} />
      <span className="text-[12px] text-bz-text-muted">
        Signed in as <span className="font-semibold text-bz-text">{USER.email}</span>
      </span>
      <span className="hidden h-3.5 w-px bg-bz-line-soft sm:block" />
      <button
        onClick={onSignOut}
        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"
      >
        <LogOut size={11} /> Not you? Sign out
      </button>
    </div>
  );
}

function GateHeader({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="text-center">
      <span className="inline-flex items-center gap-1.5 rounded-bz-pill border border-bz-line-soft bg-bz-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
        <Building2 size={11} className="text-bz-text-muted" />
        Multiple organisations
      </span>
      <h1 className="mt-4 text-[26px] font-semibold leading-tight tracking-tight text-bz-text">
        Choose an organisation
      </h1>
      <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] leading-relaxed text-bz-text-muted">
        Your account can reach several organisations. Pick the one you want to sign in to —
        and the role you'll act as.
      </p>
      <div className="mt-5">
        <IdentityChip onSignOut={onSignOut} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROLE ROW  — the commit target (idle / committing / error)
// ════════════════════════════════════════════════════════════════════════════

function RoleRow({
  org,
  role,
  committing,
  locked,
  errored,
  onCommit,
}: {
  org: Org;
  role: Role;
  committing: boolean; // this exact row is authenticating
  locked: boolean; // another row is committing (or a choice succeeded) → freeze
  errored: boolean; // this row's last commit failed → inline message
  onCommit: () => void;
}) {
  return (
    <div>
      <button
        onClick={onCommit}
        disabled={locked || committing}
        aria-label={`Sign in as ${role.name} in ${org.name}`}
        className={cn(
          "group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
          committing ? "bg-bz-fire/[0.06]" : "hover:bg-bz-paper-warm/60",
          locked && "opacity-45",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-bz-text">{role.name}</p>
          <p className="truncate text-[11.5px] text-bz-text-muted">
            {committing ? (
              <span className="text-bz-text">Signing you in…</span>
            ) : (
              <>
                {org.name} · {role.blurb}
              </>
            )}
          </p>
        </div>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-bz-pill border transition-colors",
            committing
              ? "border-transparent bg-bz-paper-warm"
              : "border-bz-line text-bz-text-soft group-hover:border-transparent group-hover:bg-bz-fire group-hover:text-bz-olive",
          )}
        >
          {committing ? (
            <Loader2 size={14} className="animate-spin text-bz-text-muted" />
          ) : (
            <ChevronRight size={15} />
          )}
        </span>
      </button>

      {errored && (
        <p className="mx-4 mb-3 -mt-1 flex items-start gap-1.5 rounded-bz-md bg-[#FBE7E5] px-2.5 py-2 text-[11.5px] font-medium text-[#9A2E29]">
          <AlertCircle size={13} className="mt-px shrink-0" />
          <span>
            {org.name} is suspended — the sign-in was declined. Contact your administrator, or
            choose another organisation.
          </span>
        </p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ORG GROUP  — quiet header + its role rows (or the per-org empty line)
// ════════════════════════════════════════════════════════════════════════════

function OrgGroup({
  org,
  committingKey,
  locked,
  erroredKey,
  onCommit,
}: {
  org: Org;
  committingKey: string | null;
  locked: boolean;
  erroredKey: string | null;
  onCommit: (org: Org, role: Role) => void;
}) {
  return (
    <section className="border-b border-bz-line-soft last:border-b-0">
      <header className="flex items-center gap-2.5 px-4 pb-1.5 pt-4">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
          <Building2 size={14} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold text-bz-text">{org.name}</p>
          <p className="truncate text-[11px] text-bz-text-muted">{org.place}</p>
        </div>
        {org.suspended ? (
          <SuspendedChip />
        ) : org.roles.length > 0 ? (
          <span className="shrink-0 text-[10.5px] font-medium tabular-nums text-bz-text-soft">
            {org.roles.length} {org.roles.length === 1 ? "role" : "roles"}
          </span>
        ) : null}
      </header>

      {org.roles.length === 0 ? (
        <div className="mx-4 mb-4 mt-1 flex items-center gap-2 rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/40 px-3 py-2.5 text-[11.5px] text-bz-text-muted">
          <Ban size={13} className="shrink-0 text-bz-text-soft" />
          No roles assigned in this organisation yet — contact your administrator.
        </div>
      ) : (
        <div className="pb-1">
          {org.roles.map((role) => {
            const key = roleKey(org, role);
            return (
              <RoleRow
                key={key}
                org={org}
                role={role}
                committing={committingKey === key}
                locked={locked && committingKey !== key}
                errored={erroredKey === key}
                onCommit={() => onCommit(org, role)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STATE VIEWS  — resolving / no-access / load-failed
// ════════════════════════════════════════════════════════════════════════════

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_20px_50px_-32px_rgba(15,20,17,0.28)]">
      {children}
    </div>
  );
}

function ResolvingView() {
  return (
    <>
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-bz-pill border border-bz-line-soft bg-bz-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
          <Loader2 size={11} className="animate-spin text-bz-text-muted" />
          Resolving access
        </span>
        <h1 className="mt-4 text-[26px] font-semibold leading-tight tracking-tight text-bz-text">
          One moment…
        </h1>
        <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] leading-relaxed text-bz-text-muted">
          Reading your identity from your active {USER.source === "session" ? "session" : "sign-in link"} and
          loading the organisations you can access.
        </p>
      </div>
      <CardShell>
        <div className="flex flex-col">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 border-b border-bz-line-soft px-4 py-4 last:border-b-0">
              <div className="size-7 shrink-0 animate-pulse rounded-bz-md bg-bz-paper-warm" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-40 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
                <div className="h-2.5 w-56 max-w-full animate-pulse rounded-bz-sm bg-bz-paper-warm" />
              </div>
              <div className="size-8 shrink-0 animate-pulse rounded-bz-pill bg-bz-paper-warm" />
            </div>
          ))}
        </div>
      </CardShell>
    </>
  );
}

function MessageView({
  icon: Icon,
  title,
  body,
  action,
  onSignOut,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
  action?: React.ReactNode;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="mb-1 text-center">
        <IdentityChip onSignOut={onSignOut} />
      </div>
      <CardShell>
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-bz-lg bg-bz-paper-warm text-bz-text-muted">
            <Icon size={22} />
          </span>
          <p className="text-[15px] font-semibold text-bz-text">{title}</p>
          <p className="max-w-[340px] text-[12.5px] leading-relaxed text-bz-text-muted">{body}</p>
          {action && <div className="mt-1">{action}</div>}
        </div>
      </CardShell>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUCCESS  — terminal hand-off scrim (stands in for the cross-subdomain redirect)
// ════════════════════════════════════════════════════════════════════════════

function RedirectOverlay({
  org,
  role,
  onBack,
}: {
  org: Org;
  role: Role;
  onBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(10,16,13,0.55)] px-4">
      <div className="w-full max-w-[360px] rounded-bz-lg border border-bz-line-soft bg-bz-surface p-6 text-center shadow-[0_24px_60px_-24px_rgba(15,20,17,0.4)]">
        <span className="mx-auto flex size-12 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22] text-bz-leaf-deep">
          <CheckCircle2 size={24} />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-bz-text">You're signed in</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-bz-text-muted">
          Taking you to <span className="font-semibold text-bz-text">{org.name}</span> as{" "}
          <span className="font-semibold text-bz-text">{role.name}</span>.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-[12px] font-medium text-bz-text-muted">
          <Loader2 size={14} className="animate-spin text-bz-fire" />
          Redirecting…
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 border-t border-bz-line-soft pt-3 text-[10.5px] text-bz-text-soft">
          <Check size={11} className="text-bz-leaf-deep" /> Session saved · other tabs synced
        </p>
        <button
          onClick={onBack}
          className="mt-3 text-[11.5px] font-medium text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline"
        >
          In production this hands off to your workspace · back to selection
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

type ToastState = { kind: "success" | "error"; message: string; id: number } | null;

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const ok = toast.kind === "success";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", ok ? "bg-bz-fire/[0.22]" : "bg-[#FBE7E5]")}>
          {ok ? <Check size={13} className="text-bz-leaf-deep" /> : <Ban size={12} className="text-[#9A2E29]" />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PREVIEW STATES  — demo-only inspector (this gate can render four fetch outcomes)
// ════════════════════════════════════════════════════════════════════════════

type DataState = "loading" | "ready" | "empty" | "failed";

const PREVIEW_OPTS: { k: DataState; label: string }[] = [
  { k: "loading", label: "Resolving" },
  { k: "ready", label: "Available" },
  { k: "empty", label: "No access" },
  { k: "failed", label: "Load failed" },
];

function PreviewSwitch({ current, onPick }: { current: DataState; onPick: (s: DataState) => void }) {
  return (
    <div className="mx-auto mt-12 flex flex-col items-center gap-2 border-t border-bz-line-soft pt-6">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Preview states</span>
      <div className="inline-flex overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
        {PREVIEW_OPTS.map((o, i) => {
          const active = current === o.k;
          return (
            <button
              key={o.k}
              onClick={() => onPick(o.k)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-medium transition-colors",
                i > 0 && "border-l border-bz-line-soft",
                active ? "bg-bz-deep text-bz-text-on-dark" : "text-bz-text-muted hover:bg-bz-paper-warm",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <span className="text-[10.5px] text-bz-text-soft">Demo only — the four outcomes a silent tenant fetch can land on.</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function TenantRoleSelectionDesignPage() {
  const [data, setData] = React.useState<DataState>("loading");
  const [remember, setRemember] = React.useState(false);
  const [committingKey, setCommittingKey] = React.useState<string | null>(null);
  const [erroredKey, setErroredKey] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<{ org: Org; role: Role } | null>(null);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);

  // teardown-safe timers (simulated async — never mutate after unmount)
  const timers = React.useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  React.useEffect(() => () => clearTimers(), []);

  const showToast = (kind: "success" | "error", message: string) =>
    setToast({ kind, message, id: ++toastId.current });

  // resolve the identity's tenant tree (session → cookie), then reveal the list
  const resolve = React.useCallback(() => {
    clearTimers();
    setCommittingKey(null);
    setErroredKey(null);
    setSuccess(null);
    setData("loading");
    after(950, () => setData("ready"));
  }, []);

  React.useEffect(() => {
    resolve();
  }, [resolve]);

  // preview inspector — force any of the four fetch outcomes
  const forceState = (s: DataState) => {
    clearTimers();
    setCommittingKey(null);
    setErroredKey(null);
    setSuccess(null);
    setToast(null);
    if (s === "loading") resolve();
    else setData(s);
  };

  // commit a (org, role): assemble payload {userId, roleId, tenantId, remember},
  // submit the change-role request, then hand off (success) or stay (error).
  const commit = (org: Org, role: Role) => {
    if (committingKey || success) return;
    const key = roleKey(org, role);
    setErroredKey(null);
    setCommittingKey(key);
    after(1000, () => {
      setCommittingKey(null);
      if (org.suspended) {
        setErroredKey(key);
        showToast("error", `Couldn't sign in to ${org.name} — the organisation is suspended.`);
        return;
      }
      setSuccess({ org, role });
      showToast(
        "success",
        `Signed in as ${role.name} · ${org.name}${remember ? " · set as your default" : ""}`,
      );
    });
  };

  const signOut = () => showToast("success", "Signing you out — returning to sign in…");

  const locked = committingKey !== null || success !== null;

  return (
    <AppShell
      topBarTone="section"
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Account</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Choose organisation</span>
        </>
      }
      overlay={
        <>
          {success && (
            <RedirectOverlay
              org={success.org}
              role={success.role}
              onBack={() => {
                setSuccess(null);
                setData("ready");
              }}
            />
          )}
          <Toast toast={toast} onDismiss={() => setToast(null)} />
        </>
      }
    >
      <div className="flex min-h-full flex-col">
        <div className="mx-auto w-full max-w-[608px] px-4 py-10 md:py-14">
          {data === "loading" ? (
            <ResolvingView />
          ) : data === "failed" ? (
            <MessageView
              icon={WifiOff}
              title="We couldn't load your organisations"
              body="Something went wrong reaching the server. Your session is fine — retry, or sign out and start again."
              onSignOut={signOut}
              action={
                <button
                  onClick={() => forceState("loading")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
                >
                  <RefreshCw size={13} /> Try again
                </button>
              }
            />
          ) : data === "empty" ? (
            <MessageView
              icon={Inbox}
              title="No organisations available"
              body="Your account isn't linked to any organisation yet. Ask an administrator to grant you access, then sign in again."
              onSignOut={signOut}
            />
          ) : (
            <>
              <GateHeader onSignOut={signOut} />
              <CardShell>
                {ORG_TREE.map((org) => (
                  <OrgGroup
                    key={org.id}
                    org={org}
                    committingKey={committingKey}
                    locked={locked}
                    erroredKey={erroredKey}
                    onCommit={commit}
                  />
                ))}

                {/* shared preference — read into the commit payload at submit time */}
                <div className="flex items-center gap-3 border-t border-bz-line bg-bz-paper-warm/40 px-4 py-3.5">
                  <Switch
                    value={remember}
                    onChange={setRemember}
                    disabled={locked}
                    ariaLabel="Remember this choice as my default"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-bz-text">Remember this choice</p>
                    <p className="text-[11px] text-bz-text-muted">
                      Skip this screen next time and sign in here automatically.
                    </p>
                  </div>
                </div>
              </CardShell>

              <p className="mt-4 text-center text-[11.5px] text-bz-text-muted">
                Can't find an organisation? Contact your administrator.
              </p>
            </>
          )}

          <PreviewSwitch current={data} onPick={forceState} />
        </div>
      </div>
    </AppShell>
  );
}
