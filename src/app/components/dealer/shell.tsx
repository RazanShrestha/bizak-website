import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ClipboardList, Ellipsis, FileText, Gift, Home, LogOut, Moon, Package, ShoppingBag, ShoppingCart, Store, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { FrameContext, MenuItem, MenuLabel, MenuSep, NUM, Popover, Switch, ToastHost } from "../sales/bzw";
import { estimatesStore } from "../sales/flow";
import { useStore } from "../sales/store";
import { sentTo } from "../salesforce/estimates";
import { opportunitiesStore, portalSettingsStore } from "../salesforce/store";
import { DealerSignIn } from "./SignIn";
import { DealerContext, brandParts, dpPath, initialsOf, signIn, signOut, themeStore, toastStore, useCart, useSessionOrNull } from "./portal";
import type { DealerSession } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// DEALER PORTAL · SHELL
//
// Not the ERP frame: a dealer sees the tenant's brand, a few plain words across
// the top and its cart — no rail, no module menus. It still provides the
// FrameContext portal root INSIDE its own root, so bzw popovers and dialogs
// render in the portal's theme (a portal on <body> would escape `.bzw-dark`).
// On a phone the top links fold into a bottom tab bar.
//
// The shell is also the door: with nobody signed in (or the customer, its type
// or the user gone) it shows the sign-in screen instead of the page, so every
// page below can rely on useDealer().
// ════════════════════════════════════════════════════════════════════════════

export type DpPage = "home" | "order" | "orders" | "account" | "claims" | "business" | "offers" | "requests";

type NavItem = { key: DpPage; label: string; path: string; icon: LucideIcon };
const ALL_NAV: NavItem[] = [
  { key: "home", label: "Home", path: "", icon: Home },
  { key: "order", label: "Order", path: "order", icon: ShoppingBag },
  { key: "orders", label: "Orders", path: "orders", icon: Package },
  { key: "account", label: "Account", path: "account", icon: Wallet },
  { key: "claims", label: "Claims", path: "claims", icon: ClipboardList },
  { key: "business", label: "My business", path: "business", icon: Store },
  { key: "offers", label: "Offers", path: "offers", icon: Gift },
  { key: "requests", label: "Price requests", path: "requests", icon: FileText },
];
const PHONE_TABS: DpPage[] = ["home", "order", "orders", "account"];

/** Which pages this dealer has — Setup's portal switches and the customer type decide. */
export function pagesFor(s: DealerSession): Set<DpPage> {
  const can = s.settings.can;
  const on = new Set<DpPage>(["home", "orders", "offers"]);
  if (can.order) on.add("order");
  if (can.statement || can.pay) on.add("account");
  if (can.claims) on.add("claims");
  if (can.dms && s.type.ownCustomers) on.add("business");
  // With asking switched off, an estimate the company sent must still be answerable and a request already sent
  // still readable.
  if (can.rfq || sentTo(s.c.id).length > 0 || opportunitiesStore.get().some((o) => o.customerId === s.c.id && o.source === "portal-rfq")) on.add("requests");
  return on;
}

/** The tenant's mark — its initials, never a product logo. */
function Monogram({ text, size = 32 }: { text: string; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-bz-md bg-bz-olive font-bold tracking-tight text-bz-fire" style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }} aria-hidden>
      {initialsOf(text)}
    </span>
  );
}

function Initials({ text, size = 32 }: { text: string; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm font-semibold text-bz-text" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }} aria-hidden>
      {initialsOf(text)}
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

function UserMenu({ s, dark, setDark }: { s: DealerSession; dark: boolean; setDark: (v: boolean) => void }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const others = s.c.portalUsers.filter((u) => u.name !== s.userName);
  return (
    <>
      <button ref={ref} type="button" onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 rounded-bz-pill py-1 pl-1 pr-1 hover:bg-bz-paper-warm md:pr-3" aria-label="Your account menu">
        <Initials text={s.userName} size={32} />
        {/* From 1280px only: between 1024 and 1280 the top bar's eight words need the room. */}
        <span className="hidden min-w-0 text-left xl:block">
          <span className="block max-w-[140px] truncate text-[12px] font-semibold leading-tight text-bz-text">{s.c.name}</span>
          <span className="block text-[10.5px] leading-tight text-bz-text-soft">{s.userName}</span>
        </span>
      </button>
      <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} align="right" width={264}>
        <div className="px-2 pb-2 pt-1.5">
          <p className="m-0 text-[12.5px] font-semibold text-bz-text">{s.userName}</p>
          <p className="m-0 text-[11px] text-bz-text-soft">
            {s.user.role} · {s.c.name}
          </p>
        </div>
        <MenuSep />
        {s.settings.can.rfq && (
          <MenuItem
            onClick={() => {
              setOpen(false);
              navigate(dpPath("requests/new"));
            }}
          >
            <MenuGlyph icon={FileText}>Ask for a price</MenuGlyph>
          </MenuItem>
        )}
        <div className="flex items-center gap-2 rounded-bz-sm px-2 py-1.5 text-[12.5px] text-bz-text">
          <Moon size={13} className="text-bz-text-muted" />
          <span className="flex-1">Dark mode</span>
          <Switch on={dark} onChange={setDark} label="Dark mode" />
        </div>
        {others.length > 0 && (
          <>
            <MenuSep />
            <MenuLabel>Switch user</MenuLabel>
            {others.map((u) => (
              <MenuItem
                key={u.name}
                hint={u.role}
                onClick={() => {
                  signIn(s.c.id, u.name);
                  setOpen(false);
                }}
              >
                <MenuGlyph icon={Users}>{u.name}</MenuGlyph>
              </MenuItem>
            ))}
          </>
        )}
        <MenuSep />
        <MenuItem
          onClick={() => {
            setOpen(false);
            signOut();
            navigate(dpPath());
          }}
        >
          <MenuGlyph icon={LogOut}>Sign out / switch dealer</MenuGlyph>
        </MenuItem>
      </Popover>
    </>
  );
}

/** The pages that do not fit: a tab on a phone, a word in the top bar on a tablet. */
function MoreMenu({ current, items, tab }: { current: DpPage; items: NavItem[]; tab?: boolean }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const on = items.some((m) => m.key === current);
  if (!items.length) return null;
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
        {items.map((m) => (
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

function Brand({ brand }: { brand: string }) {
  const b = brandParts(brand);
  return (
    <Link to={dpPath()} className="mr-3 flex shrink-0 items-center gap-2.5" aria-label={`${b.name}, home`}>
      <Monogram text={b.name} />
      <span className="leading-tight">
        <span className="block max-w-[180px] truncate text-[13px] font-semibold text-bz-text">{b.name}</span>
        {b.sub && <span className="block text-[10.5px] text-bz-text-soft">{b.sub}</span>}
      </span>
    </Link>
  );
}

/** Every portal page renders inside this: the 1080px column, the top bar, and the phone tab bar. */
export function DealerShell({ page, children }: { page: DpPage; children: React.ReactNode }) {
  const theme = useStore(themeStore);
  const dark = theme === "dark";
  const setDark = React.useCallback((v: boolean) => themeStore.set(() => (v ? "dark" : "light")), []);
  const [portal, setPortal] = React.useState<HTMLElement | null>(null);
  const settings = useStore(portalSettingsStore);
  const session = useSessionOrNull();
  const toast = useStore(toastStore);
  const b = brandParts(settings.brand);

  React.useEffect(() => {
    const prev = document.title;
    document.title = b.sub ? `${b.sub} · ${b.name}` : b.name;
    return () => {
      document.title = prev;
    };
  }, [b.name, b.sub]);
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => toastStore.set(() => null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <FrameContext.Provider value={{ portal, dark, setDark }}>
      <div className={cn("bzw-frame relative min-h-screen w-full bg-bz-paper text-[13px] leading-normal text-bz-text antialiased", dark && "bzw-dark")} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {session ? (
          <DealerContext.Provider value={session}>
            <Chrome page={page} s={session} dark={dark} setDark={setDark}>
              {children}
            </Chrome>
          </DealerContext.Provider>
        ) : (
          <>
            <header className="sticky top-0 z-40 border-b border-bz-line-soft bg-bz-surface/95 backdrop-blur">
              <div className="mx-auto flex h-16 max-w-[1080px] items-center gap-2 px-4 md:px-8">
                <Brand brand={settings.brand} />
              </div>
            </header>
            <main className="mx-auto w-full max-w-[1080px] px-4 pb-20 pt-10 md:px-8">
              <DealerSignIn />
            </main>
          </>
        )}
        <ToastHost toast={toast} onDismiss={() => toastStore.set(() => null)} lifted={!!session} />
        <div id="frame-portal" ref={setPortal} />
      </div>
    </FrameContext.Provider>
  );
}

function Chrome({ page, s, dark, setDark, children }: { page: DpPage; s: DealerSession; dark: boolean; setDark: (v: boolean) => void; children: React.ReactNode }) {
  const cart = useCart(s.c.id);
  const count = cart.filter((l) => l.qty > 0).length;
  // pagesFor reads the estimates; subscribing shows "Price requests" the moment the first estimate arrives.
  useStore(estimatesStore);
  const pages = pagesFor(s);
  const nav = ALL_NAV.filter((n) => pages.has(n.key));
  const phoneTabs = nav.filter((n) => PHONE_TABS.includes(n.key));
  const more = nav.filter((n) => !PHONE_TABS.includes(n.key));
  const moreKeys = more.map((m) => m.key);

  return (
    <>
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-bz-line-soft bg-bz-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center gap-2 px-4 md:px-8">
          <Brand brand={s.settings.brand} />
          <nav aria-label="Dealer portal" className="hidden min-w-0 flex-1 items-center gap-0.5 md:flex">
            {nav.map((n) => {
              const active = n.key === page;
              return (
                <Link
                  key={n.key}
                  to={dpPath(n.path)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-10 shrink-0 items-center rounded-bz-md px-2.5 text-[12.5px] transition-colors lg:px-3",
                    active ? "font-semibold text-bz-text after:absolute after:inset-x-2.5 after:-bottom-[13px] after:h-0.5 after:rounded-bz-pill after:bg-bz-fire after:content-['']" : "text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
                    // All words fit from 1024px; on a tablet the ones past the phone tabs wait under "More".
                    moreKeys.includes(n.key) && "hidden lg:flex",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
            <span className="lg:hidden">
              <MoreMenu current={page} items={more} />
            </span>
          </nav>
          <div className="ml-auto flex items-center gap-1 md:ml-2">
            {pages.has("order") && <CartLink count={count} />}
            <UserMenu s={s} dark={dark} setDark={setDark} />
          </div>
        </div>
      </header>

      {/* ── Page ──────────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-[1080px] px-4 pb-32 pt-6 md:px-8 md:pb-20 md:pt-10">{children}</main>

      {/* ── Phone tab bar ─────────────────────────────────────────────── */}
      <nav aria-label="Dealer portal" className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-bz-line-soft bg-bz-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {phoneTabs.map((n) => {
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
        <MoreMenu current={page} items={more} tab />
      </nav>
    </>
  );
}
