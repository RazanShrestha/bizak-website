import * as React from "react";
import { Link } from "react-router";
import {
  BarChart3,
  Boxes,
  CalendarRange,
  ClipboardCheck,
  Footprints,
  Gift,
  Home,
  Inbox,
  LayoutGrid,
  Map as MapIcon,
  Megaphone,
  Menu,
  Network,
  PartyPopper,
  Settings2,
  Store,
  Target,
  Users,
  Workflow,
  ExternalLink,
} from "lucide-react";
import { cn } from "../ui/utils";
import { AppFrame } from "../sales/AppFrame";
import { NUM, Popover } from "../sales/bzw";
import { useStore } from "../sales/store";
import { claimsStore, hubStore, modulesStore, brandingStore } from "./store";
import type { ModuleKey } from "./data";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE v2 · SHELL
//
// A module this broad does not fit in top-bar tabs (v1 had six and was already
// crowded). A quiet grouped sub-nav on the left, the page title in the top bar,
// the page itself with room to breathe. Switching a module off in Setup takes
// its pages out of the nav.
// ════════════════════════════════════════════════════════════════════════════

export type SfPage =
  | "home"
  | "today"
  | "plan"
  | "visits"
  | "orders"
  | "customers"
  | "territories"
  | "schemes"
  | "campaigns"
  | "branding"
  | "events"
  | "claims"
  | "team"
  | "targets"
  | "insights"
  | "setup";

type NavItem = { key: SfPage; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; module?: ModuleKey; path: string };
type NavGroup = { label: string | null; items: NavItem[] };

const NAV: NavGroup[] = [
  { label: null, items: [{ key: "home", label: "Home", icon: Home, path: "" }] },
  {
    label: "Field",
    items: [
      { key: "today", label: "Today", icon: Footprints, module: "field", path: "today" },
      { key: "plan", label: "Plan", icon: CalendarRange, module: "field", path: "plan" },
      { key: "visits", label: "Visits", icon: MapIcon, module: "field", path: "visits" },
    ],
  },
  { label: "Sell", items: [{ key: "orders", label: "Orders", icon: Inbox, module: "orders", path: "orders" }] },
  {
    label: "Network",
    items: [
      { key: "customers", label: "Customers", icon: Store, path: "customers" },
      { key: "territories", label: "Territories", icon: Network, path: "territories" },
    ],
  },
  {
    label: "Growth",
    items: [
      { key: "schemes", label: "Schemes", icon: Gift, module: "schemes", path: "schemes" },
      { key: "campaigns", label: "Campaigns", icon: Megaphone, module: "campaigns", path: "campaigns" },
      { key: "branding", label: "Branding", icon: LayoutGrid, module: "branding", path: "branding" },
      { key: "events", label: "Events", icon: PartyPopper, module: "events", path: "events" },
    ],
  },
  { label: "Money", items: [{ key: "claims", label: "Claims", icon: ClipboardCheck, module: "claims", path: "claims" }] },
  {
    label: "Team",
    items: [
      { key: "team", label: "Reps", icon: Users, path: "team" },
      { key: "targets", label: "Targets", icon: Target, module: "targets", path: "targets" },
    ],
  },
  {
    label: null,
    items: [
      { key: "insights", label: "Insights", icon: BarChart3, path: "insights" },
      { key: "setup", label: "Setup", icon: Settings2, path: "setup" },
    ],
  },
];

export const TITLES: Record<SfPage, string> = {
  home: "Sales force",
  today: "Today",
  plan: "Plan",
  visits: "Visits",
  orders: "Orders",
  customers: "Customers",
  territories: "Territories",
  schemes: "Schemes",
  campaigns: "Campaigns",
  branding: "Branding",
  events: "Events",
  claims: "Claims",
  team: "Reps",
  targets: "Targets",
  insights: "Insights",
  setup: "Setup",
};

export const sfPath = (p: string) => `/design/salesforce${p ? `/${p}` : ""}`;

function useCounts(): Partial<Record<SfPage, { n: number; danger?: boolean }>> {
  const hub = useStore(hubStore);
  const claims = useStore(claimsStore);
  const branding = useStore(brandingStore);
  return {
    orders: { n: hub.filter((o) => o.status === "review").length, danger: true },
    claims: { n: claims.filter((c) => c.status === "submitted").length },
    branding: { n: branding.filter((b) => b.stage === "requested").length },
  };
}

function NavList({ current, onPick }: { current: SfPage; onPick?: () => void }) {
  const modules = useStore(modulesStore);
  const counts = useCounts();
  const on = (m?: ModuleKey) => !m || modules.find((x) => x.key === m)?.on !== false;
  return (
    <nav aria-label="Sales force" className="flex flex-col gap-5">
      {NAV.map((g, gi) => {
        const items = g.items.filter((i) => on(i.module));
        if (!items.length) return null;
        return (
          <div key={gi}>
            {g.label && <p className="m-0 mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">{g.label}</p>}
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {items.map((i) => {
                const active = i.key === current;
                const c = counts[i.key];
                const Icon = i.icon;
                return (
                  <li key={i.key}>
                    <Link
                      to={sfPath(i.path)}
                      onClick={onPick}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-8 items-center gap-2.5 rounded-bz-md px-2.5 text-[12.5px] transition-colors",
                        active ? "bg-bz-paper-warm font-semibold text-bz-text" : "text-bz-text-muted hover:bg-bz-paper-warm/60 hover:text-bz-text",
                      )}
                    >
                      {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-bz-pill bg-bz-fire" />}
                      <Icon size={14} className={active ? "text-bz-text" : "text-bz-text-soft"} />
                      <span className="min-w-0 flex-1 truncate">{i.label}</span>
                      {c && c.n > 0 && <span className={cn("rounded-bz-pill px-1.5 text-[10px] font-semibold leading-4", NUM, c.danger ? "bg-bz-red-soft text-bz-red" : "bg-bz-paper-warm text-bz-text-muted")}>{c.n}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <Link to="/design/dealer" className="mx-2.5 mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-soft hover:text-bz-text">
        <ExternalLink size={12} /> Open the dealer portal
      </Link>
    </nav>
  );
}

/**
 * The module frame. `panel` docks at the right of the page (≥1280) — a register's record sits there, not in a
 * modal. `bare` gives the page the whole content area with no padding (a board, a map).
 */
export function SfShell({ page, title, children, panel, bare }: { page: SfPage; title?: string; children: React.ReactNode; panel?: React.ReactNode; bare?: boolean }) {
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = React.useState(false);
  return (
    <AppFrame
      title={title ?? TITLES[page]}
      rail="Sales force"
      titleAside={
        <>
          <button ref={menuRef} type="button" onClick={() => setMenu(true)} className="ml-1 inline-flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm lg:hidden" aria-label="Sales force menu">
            <Menu size={15} />
          </button>
          <Popover open={menu} anchor={menuRef.current} onClose={() => setMenu(false)} width={240} className="p-3">
            <NavList current={page} onPick={() => setMenu(false)} />
          </Popover>
        </>
      }
    >
      <div className="absolute inset-0 flex">
        <aside className="hidden w-[216px] shrink-0 overflow-y-auto border-r border-bz-line-soft bg-bz-paper px-3 py-5 [scrollbar-width:thin] lg:block">
          <NavList current={page} />
        </aside>
        <div className="relative flex min-w-0 flex-1">
          <main className={cn("min-w-0 flex-1", bare ? "relative" : "overflow-y-auto [scrollbar-width:thin]")}>{children}</main>
          {panel}
        </div>
      </div>
    </AppFrame>
  );
}

export { Boxes, Workflow };
