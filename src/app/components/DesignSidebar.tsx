import * as React from "react";
import { useLocation, Link } from "react-router";
import {
  ChevronDown,
  ChevronsLeft,
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Boxes,
  Factory,
  Wallet,
  Users,
  BarChart3,
  Sparkles,
  Settings,
  Building2,
  ShieldCheck,
  Hash,
  CreditCard,
  LayoutGrid,
  MapPin,
  DatabaseZap,
  LifeBuoy,
  TicketPlus,
  Repeat,
  UserPlus,
  TrendingUp,
  ArrowUpCircle,
  Library,
  ScanLine,
  PlayCircle,
  SlidersHorizontal,
  Workflow,
  CalendarClock,
  FolderArchive,
  Rocket,
  KeyRound,
} from "lucide-react";

// ════════════════════════════════════════════════════════════════════════════
// SIDEBAR full-height olive nav with module groups. Shared across the
// design preview pages (sales order list / detail / form, custom fields
// builder) via <AppShell> in SalesOrderListDesignPage.tsx.
// ════════════════════════════════════════════════════════════════════════════

type SidebarChildModel = { label: string; href?: string; count?: number };
type SidebarItemModel = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href?: string;
  children?: SidebarChildModel[];
};
type SidebarGroupModel = { section: string; items: SidebarItemModel[] };

const SIDEBAR_GROUPS: SidebarGroupModel[] = [
  {
    section: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/design/dashboard" },
      { icon: CalendarClock, label: "My Schedule", href: "/design/calendar" },
      { icon: FolderArchive, label: "File Cabinet", href: "/design/file-cabinet" },
    ],
  },
  {
    section: "Operations",
    items: [
      {
        icon: ShoppingCart,
        label: "Sales & CRM",
        children: [
          { label: "Quotation" },
          { label: "Sales Order", href: "/design/sales-order-list", count: 152 },
          { label: "Order Record", href: "/design/sales-order-record" },
          { label: "Order Register", href: "/design/sales-order-register" },
          { label: "Sales Invoice" },
          { label: "Customers" },
          { label: "Returns" },
        ],
      },
      { icon: ShoppingBag, label: "Purchasing" },
      { icon: MapPin, label: "Route Mapping", href: "/design/party-route-mapping" },
      {
        icon: Boxes,
        label: "Inventory",
        children: [
          { label: "Items", href: "/design/item/IT-2042" },
          { label: "New Item", href: "/design/item/new" },
          { label: "Item Groups" },
          { label: "Stock Levels" },
          { label: "Adjustments" },
        ],
      },
      { icon: Factory,     label: "Manufacturing" },
    ],
  },
  {
    section: "Point of Sale",
    items: [
      { icon: ScanLine, label: "Terminal", href: "/design/pos-terminal" },
      { icon: PlayCircle, label: "Start Session", href: "/design/pos-session" },
      { icon: SlidersHorizontal, label: "Setup", href: "/design/pos-setup" },
    ],
  },
  {
    section: "Subscriptions",
    items: [
      { icon: Repeat, label: "Customer Subscriptions", href: "/design/customer-subscriptions" },
      { icon: UserPlus, label: "Subscribe a Party", href: "/design/subscribe-party" },
      { icon: TrendingUp, label: "Revenue", href: "/design/subscription-revenue" },
      { icon: ArrowUpCircle, label: "Upgrade Plan", href: "/design/plan-upgrade" },
    ],
  },
  {
    section: "Support",
    items: [
      { icon: LifeBuoy, label: "Tickets", href: "/design/support-tickets" },
      { icon: TicketPlus, label: "New Ticket", href: "/design/support-tickets/new" },
    ],
  },
  {
    section: "Back office",
    items: [
      {
        icon: Wallet,
        label: "Finance",
        children: [
          { label: "Bank Reconciliation", href: "/design/bank-reconciliation" },
          { label: "Statement Import", href: "/design/bank-import" },
          { label: "Journal Entry" },
          { label: "Payments" },
          { label: "Chart of Accounts" },
        ],
      },
      { icon: Users,     label: "HR"        },
      {
        icon: BarChart3,
        label: "Reports",
        children: [
          { label: "Trial Balance", href: "/design/trial-balance" },
          { label: "Balance Sheet", href: "/design/balance-sheet" },
          { label: "Profit & Loss" },
          { label: "General Ledger" },
          { label: "Aging Summary" },
        ],
      },
    ],
  },
  {
    section: "Customize",
    items: [
      { icon: Sparkles, label: "Custom Form", href: "/design/custom-fields" },
      { icon: LayoutGrid, label: "Dashboard Sections", href: "/design/dashboard-attributes" },
    ],
  },
  {
    section: "Administration",
    items: [
      {
        icon: KeyRound,
        label: "Sign In & Sign Up",
        children: [
          { label: "Sign in", href: "/design/sign-in" },
          { label: "Create account", href: "/design/sign-up" },
          { label: "Forgot password", href: "/design/forgot-password" },
        ],
      },
      { icon: Rocket, label: "Onboarding", href: "/design/onboarding" },
      { icon: Building2, label: "Companies", href: "/design/companies" },
      { icon: Library, label: "Master Records", href: "/design/master-record" },
      { icon: DatabaseZap, label: "Data Import", href: "/design/data-imports" },
      {
        icon: ShieldCheck,
        label: "Access Control",
        children: [
          { label: "Roles & Permissions", href: "/design/roles" },
          { label: "Tenant Selection", href: "/design/tenant-selection" },
          { label: "Users" },
          { label: "Audit Log" },
        ],
      },
      { icon: Workflow, label: "Workflow", href: "/design/workflow" },
      {
        icon: CreditCard,
        label: "Subscription Plans",
        children: [
          { label: "New Plan", href: "/design/subscription-plan/new" },
          { label: "Edit: Pro tier", href: "/design/subscription-plan/PLAN-PRO/edit" },
        ],
      },
      {
        icon: Hash,
        label: "Setup",
        children: [
          { label: "Global Defaults", href: "/design/preferences" },
          { label: "Auto Number", href: "/design/auto-number" },
          { label: "Number Series" },
          { label: "Company Profile" },
        ],
      },
    ],
  },
];

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden h-full w-[252px] shrink-0 flex-col bg-bz-olive text-bz-text-on-dark md:flex">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-5">
        <span className="flex size-7 items-center justify-center rounded-bz-sm bg-bz-fire text-[13px] font-bold text-bz-olive">
          B
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-bz-text-on-dark">
          Bizak<sup className="ml-0.5 text-[8px] opacity-60">®</sup>
        </span>
        <button className="ml-auto flex size-7 items-center justify-center rounded-bz-sm text-white/45 hover:bg-white/[0.06]">
          <ChevronsLeft size={13} />
        </button>
      </div>

      {/* Subsidiary switcher */}
      <div className="px-3 py-3">
        <button className="flex w-full items-center gap-2.5 rounded-bz-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-left">
          <Building2 size={13} className="text-bz-fire" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-white/55 leading-none">Subsidiary</p>
            <p className="mt-1 truncate text-[12.5px] font-medium text-bz-text-on-dark">
              NP-01 · Bizak Nepal
            </p>
          </div>
          <ChevronDown size={12} className="text-white/45" />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {SIDEBAR_GROUPS.map((g) => (
          <div key={g.section} className="mt-4 first:mt-1">
            <p className="mb-1.5 px-2.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/35">
              {g.section}
            </p>
            <div className="flex flex-col gap-0.5">
              {g.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / settings */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2.5 rounded-bz-md px-2.5 py-2 hover:bg-white/[0.04]">
          <Settings size={13} className="text-white/55" />
          <span className="flex-1 text-[12.5px] text-white/75">Settings</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2.5 px-2.5 py-2">
          <span className="flex size-7 items-center justify-center rounded-bz-pill bg-bz-fire/30 text-[10.5px] font-semibold text-bz-text-on-dark">
            MS
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-bz-text-on-dark">
              Manas Singh
            </p>
            <p className="text-[10px] text-white/45">Operations · Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function pathMatches(href: string | undefined, pathname: string): boolean {
  if (!href) return false;
  // Treat /design/sales-order-list as active for any /design/sales-order-list/*
  // so the sidebar stays highlighted on detail / form pages.
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(href + "/")) return true;
  return false;
}

function SidebarItem({
  item,
  pathname,
}: {
  item: SidebarItemModel;
  pathname: string;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children && item.children.length > 0;
  const itemActive = pathMatches(item.href, pathname);
  const childActive = hasChildren
    ? item.children!.some((c) => pathMatches(c.href, pathname))
    : false;
  const groupActive = itemActive || childActive;

  // Auto-open groups whose child is active; allow manual toggle otherwise.
  const [open, setOpen] = React.useState(groupActive);
  React.useEffect(() => {
    if (groupActive) setOpen(true);
  }, [groupActive]);

  const headerCls = `flex w-full items-center gap-2.5 rounded-bz-md px-2.5 py-2 text-left ${
    groupActive ? "bg-white/[0.04]" : "hover:bg-white/[0.04]"
  }`;
  const iconCls = groupActive ? "text-bz-fire" : "text-white/55";
  const labelCls = `flex-1 text-[12.5px] ${
    groupActive ? "font-semibold text-bz-text-on-dark" : "text-white/75"
  }`;

  const innerHeader = (
    <>
      <Icon size={13} className={iconCls} />
      <span className={labelCls}>{item.label}</span>
      {hasChildren && (
        <ChevronDown
          size={11}
          className={`text-white/45 transition-transform ${
            open ? "" : "-rotate-90"
          }`}
        />
      )}
    </>
  );

  return (
    <div>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={headerCls}
        >
          {innerHeader}
        </button>
      ) : item.href ? (
        <Link to={item.href} className={headerCls}>
          {innerHeader}
        </Link>
      ) : (
        <button type="button" className={headerCls}>
          {innerHeader}
        </button>
      )}

      {hasChildren && open && (
        <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-white/[0.08] pl-3">
          {item.children!.map((c) => {
            const cActive = pathMatches(c.href, pathname);
            const childCls = `flex w-full items-center gap-2 rounded-bz-md px-2.5 py-1.5 text-left ${
              cActive ? "bg-bz-fire/[0.12]" : "hover:bg-white/[0.04]"
            }`;
            const dotCls = `size-1 rounded-bz-pill ${
              cActive ? "bg-bz-fire" : "bg-white/25"
            }`;
            const cLabelCls = `flex-1 text-[11.5px] ${
              cActive ? "font-semibold text-bz-text-on-dark" : "text-white/65"
            }`;
            const innerChild = (
              <>
                <span className={dotCls} />
                <span className={cLabelCls}>{c.label}</span>
                {c.count !== undefined && (
                  <span
                    className={`text-[10px] tabular-nums ${
                      cActive ? "text-bz-fire" : "text-white/35"
                    }`}
                  >
                    {c.count}
                  </span>
                )}
              </>
            );
            if (c.href) {
              return (
                <Link key={c.label} to={c.href} className={childCls}>
                  {innerChild}
                </Link>
              );
            }
            return (
              <button key={c.label} type="button" className={childCls}>
                {innerChild}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
