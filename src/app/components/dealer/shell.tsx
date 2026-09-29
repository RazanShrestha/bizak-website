import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ClipboardList, Ellipsis, FileText, Gift, Home, LogOut, Moon, Package, ShoppingBag, ShoppingCart, Store, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { FrameContext, MenuItem, MenuLabel, MenuSep, NUM, Popover, Switch, ToastHost } from "../sales/bzw";
import { useStore } from "../sales/store";
import { cartStore } from "../salesforce/store";
import { COMPANY, dealer, dpPath, sessionStore, toastStore, usePortalUser } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// DEALER PORTAL · SHELL
//
// Not the ERP frame: a dealer sees the tenant's brand, seven plain words across
// the top and its cart — no rail, no module menus. It still provides the
// FrameContext portal root INSIDE its own root, so bzw popovers and dialogs
// render in the portal's theme (a portal on <body> would escape `.bzw-dark`).
// On a phone the top links fold into a bottom tab bar.
// ════════════════════════════════════════════════════════════════════════════

export type DpPage = "home" | "order" | "orders" | "account" | "claims" | "business" | "offers" | "quotes";

type NavItem = { key: DpPage; label: string; path: string; icon: LucideIcon };
const NAV: NavItem[] = [
  { key: "home", label: "Home", path: "", icon: Home },
  { key: "order", label: "Order", path: "order", icon: ShoppingBag },
  { key: "orders", label: "Orders", path: "orders", icon: Package },
  { key: "account", label: "Account", path: "account", icon: Wallet },
  { key: "claims", label: "Claims", path: "claims", icon: ClipboardList },
  { key: "business", label: "My business", path: "business", icon: Store },
  { key: "offers", label: "Offers", path: "offers", icon: Gift },
];
const QUOTES: NavItem = { key: "quotes", label: "Quotations", path: "quotes", icon: FileText };
const PHONE_TABS: DpPage[] = ["home", "order", "orders", "account"];
const MORE: NavItem[] = [...NAV.filter((n) => !PHONE_TABS.includes(n.key)), QUOTES];

const THEME_KEY = "dsp.theme";

/** The tenant's mark — a monogram, never a product logo. */
export function Monogram({ size = 32 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-bz-md bg-bz-olive font-bold tracking-tight text-bz-fire" style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }} aria-hidden>
      BN
    </span>
  );
}

function Initials({ text, size = 32 }: { text: string; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm font-semibold text-bz-text" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }} aria-hidden>
      {text}
    </span>
  );
}

/** bzw MenuItem types its icon narrower than lucide's; the glyph rides inside the label instead. */
function MenuGlyph({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon size={13} className="shrink-0 text-bz-text-muted" />
      {children}
    </span>
  );
}

function CartLink({ count }: { count: number }) {
  return (
    <Link to={dpPath("order")} className="relative flex size-10 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" aria-label={`Cart, ${count} items`} title="Cart">
      <ShoppingCart size={18} />
      {count > 0 && <span className={cn("absolute right-0.5 top-0.5 min-w-[18px] rounded-bz-pill bg-bz-fire px-1 text-center text-[10px] font-bold leading-[18px] text-bz-olive", NUM)}>{count}</span>}
    </Link>
  );
}

function UserMenu({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const user = usePortalUser();
  const d = dealer();
  return (
    <>
      <button ref={ref} type="button" onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 rounded-bz-pill py-1 pl-1 pr-1 hover:bg-bz-paper-warm md:pr-3" aria-label="Your account menu">
        <Initials text={user.initials} size={32} />
        <span className="hidden min-w-0 text-left lg:block">
          <span className="block max-w-[180px] truncate text-[12px] font-semibold leading-tight text-bz-text">{d.name}</span>
          <span className="block text-[10.5px] leading-tight text-bz-text-soft">{user.name}</span>
        </span>
      </button>
      <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} align="right" width={264}>
        <div className="px-2 pb-2 pt-1.5">
          <p className="m-0 text-[12.5px] font-semibold text-bz-text">{user.name}</p>
          <p className="m-0 text-[11px] text-bz-text-soft">
            {user.role} · {d.name}
          </p>
        </div>
        <MenuSep />
        <MenuItem
          onClick={() => {
            setOpen(false);
            navigate(dpPath("quotes"));
          }}
        >
          <MenuGlyph icon={FileText}>Ask for a quotation</MenuGlyph>
        </MenuItem>
        <div className="flex items-center gap-2 rounded-bz-sm px-2 py-1.5 text-[12.5px] text-bz-text">
          <Moon size={13} className="text-bz-text-muted" />
          <span className="flex-1">Dark mode</span>
          <Switch on={dark} onChange={setDark} label="Dark mode" />
        </div>
        <MenuSep />
        <MenuLabel>Switch user (prototype)</MenuLabel>
        {user.all.map((u, i) => (
          <MenuItem
            key={u.name}
            active={i === user.index}
            hint={u.role}
            onClick={() => {
              sessionStore.set(() => ({ userIndex: i }));
              setOpen(false);
            }}
          >
            {u.name}
          </MenuItem>
        ))}
        <MenuSep />
        <MenuItem disabled title="Not in the prototype">
          <MenuGlyph icon={LogOut}>Sign out</MenuGlyph>
        </MenuItem>
      </Popover>
    </>
  );
}

/** The pages that do not fit: a tab on a phone, a word in the top bar on a tablet. */
function MoreMenu({ current, tab }: { current: DpPage; tab?: boolean }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const on = MORE.some((m) => m.key === current);
  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          tab ? "flex h-full flex-1 flex-col items-center justify-center gap-1 text-[10.5px]" : "flex h-10 items-center rounded-bz-md px-2.5 text-[12.5px] hover:bg-bz-paper-warm",
          on ? "font-semibold text-bz-text" : "text-bz-text-muted",
        )}
        aria-label="More pages"
      >
        {tab && <Ellipsis size={19} />}
        More
      </button>
      <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} align={tab ? "right" : "left"} width={220}>
        {MORE.map((m) => (
          <MenuItem
            key={m.key}
            active={m.key === current}
            onClick={() => {
              setOpen(false);
              navigate(dpPath(m.path));
            }}
          >
            <MenuGlyph icon={m.icon}>{m.label}</MenuGlyph>
          </MenuItem>
        ))}
      </Popover>
    </>
  );
}

/** Every portal page renders inside this: the 1080px column, the top bar, and the phone tab bar. */
export function DealerShell({ page, children }: { page: DpPage; children: React.ReactNode }) {
  const [dark, setDarkState] = React.useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark";
    } catch {
      return false;
    }
  });
  const setDark = React.useCallback((v: boolean) => {
    setDarkState(v);
    try {
      localStorage.setItem(THEME_KEY, v ? "dark" : "light");
    } catch {
      /* a private window keeps it for the session */
    }
  }, []);
  const [portal, setPortal] = React.useState<HTMLElement | null>(null);
  const cart = useStore(cartStore);
  const toast = useStore(toastStore);
  const count = cart.filter((l) => l.qty > 0).length;

  React.useEffect(() => {
    const prev = document.title;
    document.title = `Dealer portal · ${COMPANY}`;
    return () => {
      document.title = prev;
    };
  }, []);
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => toastStore.set(() => null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const moreKeys = MORE.map((m) => m.key);
  return (
    <FrameContext.Provider value={{ portal, dark, setDark }}>
      <div className={cn("bzw-frame relative min-h-screen w-full bg-bz-paper text-[13px] leading-normal text-bz-text antialiased", dark && "bzw-dark")} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 border-b border-bz-line-soft bg-bz-surface/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1080px] items-center gap-2 px-4 md:px-8">
            <Link to={dpPath()} className="mr-3 flex shrink-0 items-center gap-2.5" aria-label={`${COMPANY} dealer portal, home`}>
              <Monogram />
              <span className="leading-tight">
                <span className="block text-[13px] font-semibold text-bz-text">{COMPANY}</span>
                <span className="block text-[10.5px] text-bz-text-soft">Dealer portal</span>
              </span>
            </Link>
            <nav aria-label="Dealer portal" className="hidden min-w-0 flex-1 items-center gap-0.5 md:flex">
              {NAV.map((n) => {
                const active = n.key === page;
                return (
                  <Link
                    key={n.key}
                    to={dpPath(n.path)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-10 shrink-0 items-center rounded-bz-md px-2.5 text-[12.5px] transition-colors lg:px-3",
                      active ? "font-semibold text-bz-text after:absolute after:inset-x-2.5 after:-bottom-[13px] after:h-0.5 after:rounded-bz-pill after:bg-bz-fire after:content-['']" : "text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
                      // Seven words fit from 1024px; on a tablet the last three wait under "More".
                      moreKeys.includes(n.key) && "hidden lg:flex",
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}
              <span className="lg:hidden">
                <MoreMenu current={page} />
              </span>
            </nav>
            <div className="ml-auto flex items-center gap-1 md:ml-2">
              <CartLink count={count} />
              <UserMenu dark={dark} setDark={setDark} />
            </div>
          </div>
        </header>

        {/* ── Page ──────────────────────────────────────────────────────── */}
        <main className="mx-auto w-full max-w-[1080px] px-4 pb-32 pt-6 md:px-8 md:pb-20 md:pt-10">{children}</main>

        {/* ── Phone tab bar ─────────────────────────────────────────────── */}
        <nav aria-label="Dealer portal" className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-bz-line-soft bg-bz-surface pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV.filter((n) => PHONE_TABS.includes(n.key)).map((n) => {
            const active = n.key === page;
            return (
              <Link key={n.key} to={dpPath(n.path)} aria-current={active ? "page" : undefined} className={cn("relative flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px]", active ? "font-semibold text-bz-text" : "text-bz-text-muted")}>
                {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-bz-pill bg-bz-fire" />}
                <span className="relative">
                  <n.icon size={19} />
                  {n.key === "order" && count > 0 && <span className={cn("absolute -right-2.5 -top-1.5 min-w-4 rounded-bz-pill bg-bz-fire px-1 text-center text-[9.5px] font-bold leading-4 text-bz-olive", NUM)}>{count}</span>}
                </span>
                {n.label}
              </Link>
            );
          })}
          <MoreMenu current={page} tab />
        </nav>

        <ToastHost toast={toast} onDismiss={() => toastStore.set(() => null)} lifted />
        <div id="frame-portal" ref={setPortal} />
      </div>
    </FrameContext.Provider>
  );
}
