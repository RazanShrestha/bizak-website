import * as React from "react";
import { Link } from "react-router";
import {
  Search,
  LayoutDashboard,
  LayoutGrid,
  ShoppingCart,
  Receipt,
  Truck,
  Users,
  Boxes,
  ShoppingBag,
  Landmark,
  ListChecks,
  FolderKanban,
  CalendarDays,
  BarChart3,
  Settings,
  Moon,
  Sun,
  CircleHelp,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "../ui/utils";
import { FrameContext, Avatar } from "./bzw";
import { ME } from "../productivity/shared";

// ════════════════════════════════════════════════════════════════════════════
// APP FRAME — the shell as bizak-app draws it today
//
// A collapsed icon rail (the sidebar's default `sm` state) and a top bar that
// carries the PAGE TITLE, so no page repeats its own name in a band. The top
// bar takes paper while a bzw surface is open, and the moon / sun lives there
// because dark mode belongs to the layer, not to a page.
//
// Dark mode is a token scope on this frame root (`.bzw-dark`, theme.css), and
// every popover portals into `#frame-portal` INSIDE it — a portal on <body>
// would render a light menu over a dark page.
// ════════════════════════════════════════════════════════════════════════════

const RAIL: { icon: React.ComponentType<{ size?: number }>; label: string; href?: string; active?: boolean }[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: LayoutGrid, label: "Workspaces" },
  { icon: ListChecks, label: "My tasks", href: "/design/work" },
  { icon: FolderKanban, label: "Projects", href: "/design/work/projects" },
  { icon: CalendarDays, label: "Schedule" },
  { icon: ShoppingCart, label: "Sales orders", href: "/design/sales/orders", active: true },
  { icon: Truck, label: "Deliveries" },
  { icon: Receipt, label: "Invoices" },
  { icon: Users, label: "Customers" },
  { icon: ShoppingBag, label: "Purchasing" },
  { icon: Boxes, label: "Inventory" },
  { icon: Landmark, label: "Accounts" },
  { icon: BarChart3, label: "Reports" },
];

const THEME_KEY = "bzw.theme";

export function AppFrame({ title, titleAside, rail, children }: { title: string; titleAside?: React.ReactNode; /** The rail entry to light up; defaults to Sales orders. */ rail?: string; children: React.ReactNode }) {
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

  React.useEffect(() => {
    const prev = document.title;
    document.title = `${title} · Bizak`;
    return () => {
      document.title = prev;
    };
  }, [title]);

  return (
    <FrameContext.Provider value={{ portal, dark, setDark }}>
      <div
        className={cn("bzw-frame relative flex h-screen w-full overflow-hidden bg-bz-section-b text-[13px] leading-normal text-bz-text antialiased", dark && "bzw-dark")}
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {/* ── Rail ─────────────────────────────────────────────────────── */}
        <nav className={cn("hidden w-[58px] shrink-0 flex-col items-center bg-bz-rail py-3 md:flex", dark && "border-r border-bz-line-soft")}>
          <span className="mb-4 flex size-8 items-center justify-center rounded-bz-md text-[15px] font-bold text-bz-text-on-dark">b</span>
          <button type="button" className="mb-3 flex h-7 w-10 items-center justify-center rounded-bz-md border border-white/10 text-white/60 hover:text-white" aria-label="Search">
            <Search size={13} />
          </button>
          <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto">
            {RAIL.map((r) => {
              const Icon = r.icon;
              const body = (
                <span
                  title={r.label}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-bz-md transition-colors",
                    (rail ? r.label === rail : r.active) ? "bg-white/[0.08] text-bz-fire" : "text-white/55 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  <Icon size={16} />
                </span>
              );
              return r.href ? (
                <Link key={r.label} to={r.href} aria-label={r.label}>
                  {body}
                </Link>
              ) : (
                <span key={r.label}>{body}</span>
              );
            })}
          </div>
          <span title="Settings" className={cn("mt-2 flex size-9 items-center justify-center rounded-bz-md", rail === "Settings" ? "bg-white/[0.08] text-bz-fire" : "text-white/55")}>
            <Settings size={16} />
          </span>
          <span className="mt-2">
            <Avatar person={ME} size={28} />
          </span>
        </nav>

        {/* ── Page ─────────────────────────────────────────────────────── */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-bz-line bg-bz-paper px-4 md:px-6">
            <h1 className="m-0 truncate text-[17px] font-semibold tracking-tight text-bz-text">{title}</h1>
            {titleAside}
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDark(!dark)}
                title={dark ? "Light mode" : "Dark mode"}
                className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button type="button" className="hidden size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm sm:flex" aria-label="Help">
                <CircleHelp size={15} />
              </button>
              <button type="button" className="relative flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm" aria-label="Notifications">
                <Bell size={15} />
                <span className="absolute right-2 top-1.5 size-1.5 rounded-bz-pill bg-bz-fire" />
              </button>
              <span className="ml-1 hidden items-center gap-1.5 rounded-bz-pill border border-bz-line-soft py-0.5 pl-0.5 pr-2 sm:inline-flex">
                <Avatar person={ME} size={24} />
                <span className="text-[12px] font-medium text-bz-text">{ME.name.split(" ")[0]}</span>
                <ChevronDown size={12} className="text-bz-text-soft" />
              </span>
            </div>
          </header>
          <main className="relative min-h-0 flex-1">{children}</main>
        </div>
        <div id="frame-portal" ref={setPortal} />
      </div>
    </FrameContext.Provider>
  );
}
