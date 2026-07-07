import * as React from "react";
import { createPortal } from "react-dom";
import {
  Plus, HelpCircle, Bell, ChevronDown, ChevronRight, User, KeyRound,
  Trash2, LogOut, Check, Loader2, Building2, AlertTriangle,
} from "lucide-react";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// TOP BAR  breadcrumb · global search · quick-create · bell · help · ACCOUNT
//
// The avatar on the right is the entry point to the account menu — an on-demand
// overlay (built below) that does three jobs for the signed-in user:
//   1. who am I        → identity readout (name · email · live active context)
//   2. WHERE am I      → tenant/role chooser  ← the primary action of the menu
//   3. account utility → profile · password · clear cache · sign out
//
// Everything materialises at OPEN time: opening the menu (re)fetches the user's
// tenant→role options fresh each time. The profile image loads asynchronously
// after mount (placeholder first, real image swapped in, silent on failure).
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// LIVE SESSION + WORKSPACE DATA  (mock — in production these come from the
// session store + a per-user "my tenants" request fired on each menu open)
// ════════════════════════════════════════════════════════════════════════════

const SESSION = { name: "Manas Silwal", email: "manas.silwal@bizak.com" };

type Workspace = { org: string; roles: string[] };

// Every tenant/organisation the user belongs to, expanded into its roles.
// Enough rows to overflow the chooser's bounded height → the list scrolls.
const WORKSPACES: Workspace[] = [
  { org: "Himalaya Group", roles: ["Owner", "Accountant", "Auditor"] },
  { org: "Everest Trading Pvt. Ltd.", roles: ["Administrator", "Sales Manager", "Store Keeper"] },
  { org: "Annapurna Retail", roles: ["Branch Manager", "Cashier"] },
  { org: "Sagarmatha Logistics", roles: ["Administrator", "Dispatch Lead", "Finance Lead", "Auditor"] },
];

// The user's currently-active (tenant, role) at boot. Held as live state in
// TopBar so the chooser's current-context markers recompute when it changes.
const ACTIVE_AT_BOOT = { org: "Himalaya Group", role: "Owner" };

// One option deliberately rejects re-auth, to exercise the surfaced-error path.
const wsKey = (org: string, role: string) => `${org}::${role}`;
const RESTRICTED = new Set([wsKey("Sagarmatha Logistics", "Finance Lead")]);

// ════════════════════════════════════════════════════════════════════════════
// PROFILE IMAGE  async-loaded after init · generic silhouette placeholder until
// then · silent fallback to the placeholder on failure (no retry, no message)
// ════════════════════════════════════════════════════════════════════════════

function monogram(name: string) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  // Generated avatar "photo" (data-URI SVG). Hex lives inside image content,
  // not component styling — there is no token mechanism inside an SVG string.
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>` +
    `<rect width='96' height='96' rx='48' fill='%231A2D20'/>` +
    `<text x='50%25' y='52%25' text-anchor='middle' dominant-baseline='middle' ` +
    `font-family='Inter, sans-serif' font-size='36' font-weight='600' fill='%23d3f969'>${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${svg}`;
}

function useProfileImage(name: string) {
  const [src, setSrc] = React.useState<string | null>(null);
  React.useEffect(() => {
    let alive = true;
    // The real image arrives after initial render — placeholder shows until now.
    const t = window.setTimeout(() => {
      if (alive) setSrc(monogram(name)); // prod: fetch avatar URL; null = silent fallback
    }, 750);
    return () => { alive = false; window.clearTimeout(t); };
  }, [name]);
  return src;
}

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  const [broken, setBroken] = React.useState(false);
  React.useEffect(() => setBroken(false), [src]);
  const show = src && !broken;
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-bz-pill bg-bz-paper-warm ring-1 ring-bz-line-soft"
      style={{ width: size, height: size }}
    >
      <User size={Math.round(size * 0.52)} className="text-bz-text-soft" />
      {show && (
        <img
          src={src!}
          alt={name}
          onError={() => setBroken(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TRANSIENT FEEDBACK  toast (only a failed switch is loud) + full-screen scrim
// (the honest stand-in for the hard reload a successful switch / sign-out does)
// ════════════════════════════════════════════════════════════════════════════

type ToastTone = "neutral" | "positive" | "danger";

function Toast({ tone, text }: { tone: ToastTone; text: string }) {
  const danger = tone === "danger";
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto flex max-w-[420px] items-center gap-2.5 rounded-bz-md border px-3.5 py-2.5 text-[12.5px] font-medium shadow-[0_18px_44px_-20px_rgba(15,20,17,0.3)]",
          danger
            ? "border-[#F0C5C0] bg-[#FBE5E2] text-[#9A2E29]"
            : tone === "positive"
            ? "border-bz-line-soft bg-bz-surface text-bz-text"
            : "border-bz-line-soft bg-bz-surface text-bz-text",
        )}
      >
        {danger ? (
          <AlertTriangle size={14} className="shrink-0" />
        ) : tone === "positive" ? (
          <span className="flex size-4 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire text-bz-text">
            <Check size={11} strokeWidth={3} />
          </span>
        ) : (
          <Loader2 size={14} className="shrink-0 animate-spin text-bz-text-muted" />
        )}
        <span>{text}</span>
      </div>
    </div>,
    document.body,
  );
}

function BlockingScrim({ label }: { label: string }) {
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(10,16,13,0.55)] px-4">
      <div className="flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-5 py-4 shadow-[0_24px_60px_-24px_rgba(15,20,17,0.4)]">
        <Loader2 size={16} className="animate-spin text-bz-text-muted" />
        <span className="text-[13px] font-medium text-bz-text">{label}</span>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ANCHORED POSITION  right-aligned under the trigger, clamped to the viewport
// ════════════════════════════════════════════════════════════════════════════

function useMenuPos(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) { setPos(null); return; }
    const update = () => {
      const r = anchorRef.current!.getBoundingClientRect();
      const margin = 12;
      const width = Math.min(320, window.innerWidth - margin * 2);
      const left = Math.max(margin, Math.min(r.right - width, window.innerWidth - width - margin));
      setPos({ top: r.bottom + 8, left, width });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open, anchorRef]);
  return pos;
}

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNT MENU ATOMS
// ════════════════════════════════════════════════════════════════════════════

const SECTION_LABEL = "px-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";

function ActionRow({
  icon: Icon, label, onClick, danger, trailing,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-bz-md px-2.5 py-2 text-[12.5px] font-medium transition-colors",
        danger ? "text-[#9A2E29] hover:bg-[#FBE5E2]" : "text-bz-text hover:bg-bz-paper-warm",
      )}
    >
      <Icon size={14} className={danger ? "shrink-0" : "shrink-0 text-bz-text-muted"} />
      <span className="flex-1 text-left">{label}</span>
      {trailing}
    </button>
  );
}

// One selectable (tenant, role) row inside the chooser.
function RoleRow({
  org, role, active, busy, disabled, onSelect,
}: {
  org: string;
  role: string;
  active: boolean;   // this exact row is the live (tenant, role)
  busy: boolean;     // re-auth in flight for this row
  disabled: boolean; // a switch is committing somewhere → lock the list
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={active || disabled}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-bz-md px-2.5 py-1.5 text-left transition-colors",
        active ? "bg-bz-fire/[0.16] cursor-default" : "hover:bg-bz-paper-warm disabled:opacity-50",
      )}
      title={`${role} · ${org}`}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-bz-pill",
          active ? "bg-bz-fire text-bz-text" : "border border-bz-line",
        )}
      >
        {active && <Check size={10} strokeWidth={3} />}
      </span>
      <span className={cn("flex-1 truncate text-[12.5px]", active ? "font-semibold text-bz-text" : "font-medium text-bz-text")}>
        {role}
      </span>
      {busy ? (
        <Loader2 size={13} className="shrink-0 animate-spin text-bz-text-muted" />
      ) : active ? (
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-leaf-deep">Current</span>
      ) : (
        <ChevronRight size={13} className="shrink-0 text-bz-text-soft" />
      )}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNT MENU  the overlay surface (portal). Re-fetches workspaces on mount
// (i.e. on each open). Owns: loading / empty / populated chooser states, the
// commit-switch flow (re-auth → persist → hard reload), and the utility actions.
// ════════════════════════════════════════════════════════════════════════════

type LoadState = "loading" | "ready" | "empty";

function AccountMenu({
  anchorRef,
  active,
  onClose,
  onCommit,
  onBlock,
  onToast,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  active: { org: string; role: string };
  onClose: () => void;
  onCommit: (next: { org: string; role: string }) => void;
  onBlock: (label: string | null) => void;
  onToast: (tone: ToastTone, text: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const pos = useMenuPos(true, anchorRef);
  const img = useProfileImage(SESSION.name);
  const timers = React.useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };

  const [load, setLoad] = React.useState<LoadState>("loading");
  const [options, setOptions] = React.useState<Workspace[]>([]);
  const [switching, setSwitching] = React.useState<string | null>(null);
  const [cleared, setCleared] = React.useState(false);

  // Open-time fetch: the option set is loaded fresh every open, never cached.
  React.useEffect(() => {
    setLoad("loading");
    setOptions([]);
    // ~1-in-8 opens the per-user request fails silently → list stays empty.
    after(620, () => {
      const failed = Math.random() < 0.12;
      if (failed) { setLoad("empty"); return; } // silent: no error surfaced
      setOptions(WORKSPACES);
      setLoad("ready");
    });
    return () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dismiss on outside-click / Esc / scroll outside the menu.
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    const onScroll = (e: Event) => { if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return; onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose, anchorRef]);

  // Current-context markers, recomputed against live session state.
  const isCurrentTenant = (org: string) => org === active.org;
  const isCurrentRole = (org: string, role: string) => org === active.org && role === active.role;

  // Commit a role selection: re-authenticate → persist tenant context → hard
  // reload into the new context. Does NOT dismiss via the overlay mechanism.
  function commit(org: string, role: string) {
    if (isCurrentRole(org, role) || switching) return;
    setSwitching(wsKey(org, role));
    after(850, () => {
      if (RESTRICTED.has(wsKey(org, role))) {
        // Only surfaced failure in the whole menu. Context unchanged.
        setSwitching(null);
        onToast("danger", `Couldn't switch to ${role} · ${org}. Please try again.`);
        return;
      }
      // success → re-auth ok, tenant context persisted, app hard-reloads.
      setSwitching(null);
      onBlock(`Switching to ${role} · ${org}…`); // stand-in for window.location.reload()
      after(1100, () => {
        onBlock(null);
        onCommit({ org, role }); // live session now reflects the new context
        onClose();
        onToast("positive", `Now operating as ${role} · ${org}.`);
      });
    });
  }

  function clearCache() {
    // In place: no confirmation, no message. A quiet inline ack only.
    setCleared(true);
    after(1300, () => setCleared(false));
  }

  function navTo(what: string) {
    onClose(); // navigational actions dismiss the overlay
    onToast("neutral", `Opening ${what}…`);
  }

  function signOut() {
    onClose(); // explicitly dismiss the overlay BEFORE tearing down the session
    onBlock("Signing you out…");
    after(1100, () => { onBlock(null); onToast("neutral", "Signed out · redirecting to sign in…"); });
  }

  if (!pos) return null;

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width }}
      role="menu"
      aria-label="Account menu"
      className="z-50 overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_24px_60px_-24px_rgba(15,20,17,0.32)]"
    >
      {/* ── Identity readout ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-3.5">
        <Avatar src={img} name={SESSION.name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-bz-text">{SESSION.name}</div>
          <div className="truncate text-[11.5px] text-bz-text-muted">{SESSION.email}</div>
          <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[10px] font-semibold text-bz-text">
            <Building2 size={10} className="shrink-0" />
            <span className="truncate">{active.role} · {active.org}</span>
          </div>
        </div>
      </div>

      {/* ── Tenant / role chooser (the primary action) ──────────────────── */}
      <div className="border-t border-bz-line-soft pt-2.5">
        <div className={cn(SECTION_LABEL, "mb-1.5 flex items-center justify-between")}>
          <span>Switch workspace</span>
          {load === "loading" && <Loader2 size={11} className="animate-spin text-bz-text-soft" />}
        </div>

        <div
          className="max-h-[228px] overflow-y-auto px-1.5 pb-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-bz-line [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {load === "loading" ? (
            <div className="space-y-1 px-1 py-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-7 animate-pulse rounded-bz-md bg-bz-paper-warm" />
              ))}
            </div>
          ) : load === "empty" ? (
            <div className="flex flex-col items-center gap-1.5 px-3 py-7 text-center">
              <Building2 size={18} className="text-bz-text-soft" />
              <div className="text-[12px] font-medium text-bz-text-muted">No workspaces available</div>
              <div className="text-[11px] text-bz-text-soft">Reopen the menu to try again.</div>
            </div>
          ) : (
            options.map((ws) => (
              <div key={ws.org} className="mb-1 last:mb-0">
                <div className="flex items-center gap-1.5 px-2.5 pb-0.5 pt-1.5">
                  <span className="truncate text-[10.5px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">
                    {ws.org}
                  </span>
                  {isCurrentTenant(ws.org) && (
                    <span className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-leaf-deep">
                      <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
                      Current
                    </span>
                  )}
                </div>
                {ws.roles.map((role) => (
                  <RoleRow
                    key={role}
                    org={ws.org}
                    role={role}
                    active={isCurrentRole(ws.org, role)}
                    busy={switching === wsKey(ws.org, role)}
                    disabled={switching !== null}
                    onSelect={() => commit(ws.org, role)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Account actions ─────────────────────────────────────────────── */}
      <div className="border-t border-bz-line-soft p-1.5">
        <ActionRow icon={User} label="View profile" onClick={() => navTo("Profile")} />
        <ActionRow icon={KeyRound} label="Change password" onClick={() => navTo("Change password")} />
        <div className="my-1 h-px bg-bz-line-soft" />
        <ActionRow
          icon={Trash2}
          label="Clear cached data"
          onClick={clearCache}
          trailing={
            cleared ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-bz-leaf-deep">
                <Check size={11} strokeWidth={3} /> Cleared
              </span>
            ) : undefined
          }
        />
        <ActionRow icon={LogOut} label="Sign out" onClick={signOut} danger />
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOP BAR
// ════════════════════════════════════════════════════════════════════════════

export function TopBar({
  breadcrumb,
  tone = "paper",
}: {
  breadcrumb: React.ReactNode;
  tone?: "paper" | "section";
}) {
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(ACTIVE_AT_BOOT);
  const [block, setBlock] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ tone: ToastTone; text: string; n: number } | null>(null);

  // Avatar shown in the trigger — same async-loaded image as the menu header.
  const img = useProfileImage(SESSION.name);

  function pushToast(t: ToastTone, text: string) {
    setToast((prev) => ({ tone: t, text, n: (prev?.n ?? 0) + 1 }));
  }
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <header
      className={`flex h-14 shrink-0 items-center gap-3 border-b border-bz-line px-4 md:px-6 ${
        tone === "section" ? "bg-bz-section-b" : "bg-bz-paper"
      }`}
    >
      {/* Breadcrumb */}
      <nav className="flex min-w-0 items-center gap-1.5 text-[12px]">{breadcrumb}</nav>

      <div className="ml-auto flex items-center gap-1">
        <button className="flex size-9 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm">
          <Plus size={14} />
        </button>
        <button className="flex size-9 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm">
          <HelpCircle size={14} />
        </button>
        <button className="relative flex size-9 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm">
          <Bell size={14} />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-bz-pill bg-bz-fire ring-2 ring-bz-paper" />
        </button>
      </div>

      {/* Account trigger — avatar everywhere; name + chevron on desktop only.
          Activating it toggles the overlay AND (via the menu mounting) kicks
          off a fresh fetch of the user's tenant/role options. */}
      <button
        ref={anchorRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "ml-1 flex items-center gap-2 rounded-bz-pill border p-1 transition-colors md:pr-2.5",
          open ? "border-bz-text bg-bz-paper-warm" : "border-bz-line bg-bz-surface hover:bg-bz-paper-warm",
        )}
      >
        <Avatar src={img} name={SESSION.name} size={24} />
        <span className="hidden text-[11.5px] font-medium text-bz-text md:inline">
          {SESSION.name.split(" ")[0]}
        </span>
        <ChevronDown
          size={11}
          className={cn("hidden text-bz-text-muted transition-transform md:inline", open && "rotate-180")}
        />
      </button>

      {open && (
        <AccountMenu
          anchorRef={anchorRef}
          active={active}
          onClose={() => setOpen(false)}
          onCommit={setActive}
          onBlock={setBlock}
          onToast={pushToast}
        />
      )}

      {block && <BlockingScrim label={block} />}
      {toast && <Toast key={toast.n} tone={toast.tone} text={toast.text} />}
    </header>
  );
}
