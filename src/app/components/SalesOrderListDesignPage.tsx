import * as React from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  // Brand / chrome
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  ChevronsLeft,
  // Sidebar modules
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Boxes,
  Factory,
  Wallet,
  Users,
  BarChart3,
  Settings,
  // Page toolbar
  Plus,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  MoreHorizontal,
  X,
  Check,
  // Analytics + states
  TrendingUp,
  Loader2,
  FileText,
  CalendarRange,
  MapPin,
  Building2,
} from "lucide-react";

// ════════════════════════════════════════════════════════════════════════════
// MOCK DATA every list in the page lives at the top so the layout below
// stays composition + tokens.
// ════════════════════════════════════════════════════════════════════════════

const TOTAL_RECORDS = 152;
const PAGE_SIZE = 20;

const SIDEBAR_GROUPS = [
  {
    section: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    section: "Operations",
    items: [
      {
        icon: ShoppingCart,
        label: "Sales & CRM",
        open: true,
        children: [
          { label: "Quotation" },
          { label: "Sales Order", active: true, count: 152 },
          { label: "Sales Invoice" },
          { label: "Customers" },
          { label: "Returns" },
        ],
      },
      { icon: ShoppingBag, label: "Purchasing" },
      { icon: Boxes,       label: "Inventory"  },
      { icon: Factory,     label: "Manufacturing" },
    ],
  },
  {
    section: "Back office",
    items: [
      { icon: Wallet,    label: "Finance"   },
      { icon: Users,     label: "HR"        },
      { icon: BarChart3, label: "Reports"   },
    ],
  },
] as const;

export const ORDERS = [
  {
    id: "SO-1048",
    party: "Himalayan Beverages Co.",
    date: "May 18, 2026",
    nepDate: "2083/02/05",
    location: "Kathmandu",
    subsidiary: "NP-01",
    approval: "Pending",
    fulfill: "Pending Deliver",
    bill: "Pending Bill",
    amount: "NPR 482,500",
  },
  {
    id: "SO-1047",
    party: "Apex Manufacturing Pvt Ltd",
    date: "May 17, 2026",
    nepDate: "2083/02/04",
    location: "Pokhara",
    subsidiary: "NP-02",
    approval: "Approved",
    fulfill: "Partial Fulfill",
    bill: "Partial Bill",
    amount: "NPR 1,240,000",
  },
  {
    id: "SO-1046",
    party: "Helio Distribution",
    date: "May 17, 2026",
    nepDate: "2083/02/04",
    location: "Biratnagar",
    subsidiary: "IN-01",
    approval: "Approved",
    fulfill: "Delivered",
    bill: "Invoiced",
    amount: "INR 880,400",
  },
  {
    id: "SO-1045",
    party: "Northwind Retail",
    date: "May 16, 2026",
    nepDate: "2083/02/03",
    location: "Lalitpur",
    subsidiary: "NP-01",
    approval: "Rejected",
    fulfill: "Pending Deliver",
    bill: "Pending Bill",
    amount: "NPR 124,800",
  },
  {
    id: "SO-1044",
    party: "Sagar Trading House",
    date: "May 15, 2026",
    nepDate: "2083/02/02",
    location: "Bharatpur",
    subsidiary: "NP-03",
    approval: "Approved",
    fulfill: "Delivered",
    bill: "Invoiced",
    amount: "NPR 296,100",
  },
  {
    id: "SO-1043",
    party: "Everest Tea Estates",
    date: "May 14, 2026",
    nepDate: "2083/02/01",
    location: "Ilam",
    subsidiary: "NP-03",
    approval: "Approved",
    fulfill: "Partial Fulfill",
    bill: "Partial Bill",
    amount: "NPR 614,200",
  },
  {
    id: "SO-1042",
    party: "Annapurna Foods Pvt Ltd",
    date: "May 14, 2026",
    nepDate: "2083/02/01",
    location: "Kathmandu",
    subsidiary: "NP-01",
    approval: "Pending",
    fulfill: "Pending Deliver",
    bill: "Pending Bill",
    amount: "NPR 372,900",
  },
] as const;

const SO_1047_LINES = [
  { line: 1, item: "Industrial Coupling A-220",    qty: 12, rate: "NPR 18,500",  amount: "NPR 222,000" },
  { line: 2, item: "Hydraulic Pump HP-7",           qty:  4, rate: "NPR 142,000", amount: "NPR 568,000" },
  { line: 3, item: "Mounting Plate Set (pkg of 6)", qty: 30, rate: "NPR 11,200",  amount: "NPR 336,000" },
  { line: 4, item: "Service & Installation",         qty:  1, rate: "NPR 114,000", amount: "NPR 114,000" },
];

const ACTIVE_FILTERS = [
  { kind: "Approval",   label: "Approved"       },
  { kind: "Location",   label: "Pokhara"        },
  { kind: "Date range", label: "May 1 – May 18" },
  { kind: "Party",      label: "Apex Mfg"       },
];

const COLUMNS = [
  { label: "Action",       sort: null,    width: 76  },
  { label: "Document No.", sort: "desc",  width: 124 },
  { label: "Party Name",   sort: null,    width: 0   }, // flex
  { label: "Txn Date",     sort: "idle",  width: 116 },
  { label: "Nep Date",     sort: null,    width: 116 },
  { label: "Location",     sort: null,    width: 124 },
  { label: "Sub.",         sort: null,    width: 74  },
  { label: "Approval",     sort: null,    width: 124 },
  { label: "Fulfillment",  sort: null,    width: 148 },
  { label: "Bill",         sort: null,    width: 124 },
] as const;

const FULFILL_BREAKDOWN = [
  { key: "Delivered",       pct: 58, color: "var(--bz-fire)"       },
  { key: "Partial Fulfill", pct: 26, color: "var(--bz-leaf-deep)"  },
  { key: "Pending Deliver", pct: 16, color: "var(--bz-line)"       },
];

const TREND_LAST_6  = [1.6, 1.8, 2.1, 1.9, 2.2, 1.6];
const TREND_PRIOR_6 = [1.3, 1.5, 1.4, 1.7, 1.6, 2.1];

// ════════════════════════════════════════════════════════════════════════════
// SHARED PIECES status pills, sort glyph, mini-viz
// ════════════════════════════════════════════════════════════════════════════

function ApprovalDot({ status }: { status: string }) {
  const color =
    status === "Approved" ? "bg-bz-leaf-deep" :
    status === "Pending"  ? "bg-bz-fire"      :
                            "bg-[#C0413A]";
  const text =
    status === "Rejected" ? "text-[#9A2E29]" : "text-bz-text";
  return (
    <div className="flex items-center gap-2">
      <span className={`size-1.5 rounded-bz-pill ${color}`} />
      <span className={`text-[12px] font-medium ${text}`}>{status}</span>
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "delivered" | "partial" | "pending" | "invoiced" | "pendingBill" | "partialBill";
}) {
  const styles: Record<string, string> = {
    delivered:   "bg-bz-fire/[0.18] text-bz-text",
    partial:     "bg-bz-leaf/40    text-bz-text",
    pending:     "bg-bz-paper-warm  text-bz-text-muted",
    invoiced:    "bg-bz-fire/[0.18] text-bz-text",
    pendingBill: "bg-bz-paper-warm  text-bz-text-muted",
    partialBill: "bg-bz-leaf/40    text-bz-text",
  };
  return (
    <span className={`inline-flex items-center rounded-bz-pill px-2 py-0.5 text-[10.5px] font-medium tabular-nums ${styles[tone]}`}>
      {label}
    </span>
  );
}

function SortIcon({ sort }: { sort: "asc" | "desc" | "idle" | null }) {
  const cls = "ml-1 inline-block shrink-0";
  if (sort === "asc")  return <ChevronUp     size={12} className={`${cls} text-bz-text`}      />;
  if (sort === "desc") return <ChevronDown   size={12} className={`${cls} text-bz-text`}      />;
  if (sort === "idle") return <ChevronsUpDown size={12} className={`${cls} text-bz-text-soft`} />;
  return null;
}

function DonutMini({
  size,
  thickness,
  segments,
}: {
  size: number;
  thickness: number;
  segments: { key: string; pct: number; color: string }[];
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bz-line-soft)" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * c;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

function SparkArea({ last, prior }: { last: number[]; prior: number[] }) {
  const W = 200;
  const H = 44;
  const all = [...last, ...prior];
  const max = Math.max(...all);
  const min = Math.min(...all);
  const range = max - min || 1;
  const toPath = (vals: number[]) => {
    const step = W / (vals.length - 1);
    return vals
      .map((v, i) => {
        const x = i * step;
        const y = H - ((v - min) / range) * (H - 6) - 3;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  };
  const lastPath = toPath(last);
  const priorPath = toPath(prior);
  const lastFill = `${lastPath} L ${W} ${H} L 0 ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" aria-hidden>
      <path d={lastFill}  fill="var(--bz-fire)" opacity="0.18" />
      <path d={priorPath} fill="none" stroke="var(--bz-line)"  strokeWidth="1"   strokeDasharray="2 2" />
      <path d={lastPath}  fill="none" stroke="var(--bz-text)" strokeWidth="1.4" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SIDEBAR full-height olive nav with module groups
// ════════════════════════════════════════════════════════════════════════════

function Sidebar() {
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
                <SidebarItem key={item.label} item={item} />
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

type SidebarItemModel = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  open?: boolean;
  children?: ReadonlyArray<{ label: string; active?: boolean; count?: number }>;
};

function SidebarItem({ item }: { item: SidebarItemModel | (typeof SIDEBAR_GROUPS[number]["items"][number]) }) {
  const Icon = item.icon;
  const hasChildren = "children" in item && item.children;
  const isOpen = "open" in item && item.open;
  const groupActive = hasChildren && item.children?.some((c) => "active" in c && c.active);

  return (
    <div>
      <button
        className={`flex w-full items-center gap-2.5 rounded-bz-md px-2.5 py-2 text-left ${
          groupActive ? "bg-white/[0.04]" : "hover:bg-white/[0.04]"
        }`}
      >
        <Icon size={13} className={groupActive ? "text-bz-fire" : "text-white/55"} />
        <span
          className={`flex-1 text-[12.5px] ${
            groupActive ? "font-semibold text-bz-text-on-dark" : "text-white/75"
          }`}
        >
          {item.label}
        </span>
        {hasChildren && (
          <ChevronDown
            size={11}
            className={`text-white/45 transition-transform ${isOpen ? "" : "-rotate-90"}`}
          />
        )}
      </button>

      {hasChildren && isOpen && (
        <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-white/[0.08] pl-3">
          {item.children!.map((c) => (
            <button
              key={c.label}
              className={`flex w-full items-center gap-2 rounded-bz-md px-2.5 py-1.5 text-left ${
                c.active ? "bg-bz-fire/[0.12]" : "hover:bg-white/[0.04]"
              }`}
            >
              <span
                className={`size-1 rounded-bz-pill ${
                  c.active ? "bg-bz-fire" : "bg-white/25"
                }`}
              />
              <span
                className={`flex-1 text-[11.5px] ${
                  c.active ? "font-semibold text-bz-text-on-dark" : "text-white/65"
                }`}
              >
                {c.label}
              </span>
              {c.count !== undefined && (
                <span className={`text-[10px] tabular-nums ${c.active ? "text-bz-fire" : "text-white/35"}`}>
                  {c.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOP BAR breadcrumb · global search · quick-create · bell · help
// ════════════════════════════════════════════════════════════════════════════

function TopBar({ breadcrumb }: { breadcrumb: React.ReactNode }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-bz-line bg-bz-paper px-4 md:px-6">
      {/* Breadcrumb */}
      <nav className="flex min-w-0 items-center gap-1.5 text-[12px]">
        {breadcrumb}
      </nav>

      {/* Global search */}
      <div className="ml-auto hidden h-9 min-w-0 max-w-[360px] flex-1 items-center gap-2 rounded-bz-md border border-bz-line bg-bz-surface px-3 lg:flex">
        <Search size={13} className="shrink-0 text-bz-text-muted" />
        <span className="truncate text-[12px] text-bz-text-muted">
          Search across orders, customers, invoices…
        </span>
        <span className="ml-auto inline-flex items-center rounded-bz-sm border border-bz-line bg-bz-paper-warm px-1.5 text-[10px] font-semibold text-bz-text-muted">
          ⌘K
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1 lg:ml-3">
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

      {/* User chip */}
      <button className="ml-1 hidden items-center gap-2 rounded-bz-pill border border-bz-line bg-bz-surface px-1.5 py-1 md:flex">
        <span className="flex size-6 items-center justify-center rounded-bz-pill bg-bz-fire/30 text-[10px] font-semibold text-bz-text">
          MS
        </span>
        <span className="text-[11.5px] font-medium text-bz-text">Manas</span>
        <ChevronDown size={11} className="text-bz-text-muted" />
      </button>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE HEADER title + actions
// ════════════════════════════════════════════════════════════════════════════

function PageHeader({ onOpenFilters }: { onOpenFilters: () => void }) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-2 pt-5 md:flex-row md:items-center md:px-6">
      <div className="flex items-baseline gap-2.5">
        <h1 className="text-[22px] font-semibold tracking-tight text-bz-text">
          Sales Order
        </h1>
        <span className="text-[12px] text-bz-text-muted tabular-nums">
          · {TOTAL_RECORDS}
        </span>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-1.5 md:justify-end">
        {/* Search */}
        <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 md:max-w-[280px]">
          <Search size={13} className="shrink-0 text-bz-text-muted" />
          <span className="truncate text-[12px] text-bz-text-muted">
            Search orders or customers…
          </span>
        </div>

        {/* Filter */}
        <button
          onClick={onOpenFilters}
          className="relative inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
        >
          <Filter size={13} />
          Filters
          <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire px-1 text-[9.5px] font-semibold text-bz-olive tabular-nums">
            {ACTIVE_FILTERS.length}
          </span>
        </button>

        {/* Export menu */}
        <button className="inline-flex h-9 items-center gap-1.5 rounded-bz-md px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
          <Download size={13} />
          Export
          <ChevronDown size={11} className="text-bz-text-muted" />
        </button>

        {/* Import */}
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
          <Upload size={13} />
          <span className="hidden xl:inline">Import</span>
        </button>

        {/* Template */}
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
          <FileSpreadsheet size={13} />
          <span className="hidden xl:inline">Template</span>
        </button>

        {/* Primary CTA */}
        <Link
          to="/design/sales-order-list/new"
          className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark"
        >
          <Plus size={13} />
          New Sales Order
        </Link>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ANALYTICS STRIP four insight cards across the top of the list
// ════════════════════════════════════════════════════════════════════════════

function AnalyticsStrip() {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-5 md:grid-cols-2 md:px-6 xl:grid-cols-4">
      {/* Total Sales Value */}
      <div className="flex flex-col justify-between rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11.5px] text-bz-text-muted">Total Sales Value</p>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-bz-text">
            <TrendingUp size={11} className="text-bz-leaf-deep" /> 12.4%
          </span>
        </div>
        <p className="mt-3 text-[26px] font-semibold leading-none tabular-nums text-bz-text">
          NPR 18.42M
        </p>
        <p className="mt-1.5 text-[11px] text-bz-text-muted">YTD · 2026</p>
      </div>

      {/* Fulfillment */}
      <div className="flex flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
        <p className="text-[11.5px] text-bz-text-muted">Fulfillment Status</p>
        <div className="mt-3 flex flex-1 items-center gap-4">
          <DonutMini size={64} thickness={11} segments={FULFILL_BREAKDOWN} />
          <div className="flex flex-1 flex-col gap-1.5">
            {FULFILL_BREAKDOWN.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-bz-pill" style={{ background: s.color }} />
                  <span className="text-[11px] text-bz-text">{s.key}</span>
                </div>
                <span className="text-[11px] font-medium tabular-nums text-bz-text">
                  {s.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approval Pipeline */}
      <div className="flex flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
        <p className="text-[11.5px] text-bz-text-muted">Approval Pipeline</p>
        <div className="mt-3 flex items-baseline gap-6">
          <div>
            <p className="text-[26px] font-semibold leading-none tabular-nums text-bz-text">84</p>
            <p className="mt-1.5 text-[11px] text-bz-text-muted">Approved</p>
          </div>
          <div>
            <p className="text-[20px] font-semibold leading-none tabular-nums text-bz-text">19</p>
            <p className="mt-1.5 text-[11px] text-bz-text-muted">Pending</p>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10.5px] text-bz-text-muted">
            <span>81.5% approved</span>
            <span className="tabular-nums">103 total</span>
          </div>
          <div className="flex h-1.5 overflow-hidden rounded-bz-pill bg-bz-line-soft">
            <div className="h-full bg-bz-leaf-deep" style={{ width: "81.5%" }} />
            <div className="h-full bg-bz-fire"      style={{ width: "18.5%" }} />
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="flex flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11.5px] text-bz-text-muted">Monthly Sales Trend</p>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-bz-text">
            <TrendingUp size={11} className="text-bz-leaf-deep" /> 16.7%
          </span>
        </div>
        <div className="mt-3 flex-1">
          <SparkArea last={TREND_LAST_6} prior={TREND_PRIOR_6} />
          <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-bz-text-muted">
            <span>Jun–Nov 2025</span>
            <span>Dec–May 2026</span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-[11px] text-bz-text-muted">Prior 6</p>
            <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-bz-text">NPR 9.6M</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-bz-text-muted">Last 6</p>
            <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-bz-text">NPR 11.2M</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ACTIVE FILTERS BAR + RECORD COUNT
// ════════════════════════════════════════════════════════════════════════════

function FiltersAndCountBar() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 pb-3 md:px-6">
      {ACTIVE_FILTERS.map((f) => (
        <span
          key={f.label}
          className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-surface px-2.5 py-1 text-[11px] text-bz-text"
        >
          <span className="text-bz-text-muted">{f.kind}:</span>
          <span className="font-medium">{f.label}</span>
          <X size={10} className="text-bz-text-muted" />
        </span>
      ))}
      <button className="text-[11px] font-medium text-bz-text-muted hover:text-bz-text">
        Clear all
      </button>
      <span className="ml-auto text-[11.5px] text-bz-text-muted">
        <span className="tabular-nums font-semibold text-bz-text">{TOTAL_RECORDS}</span>{" "}
        active records
        <span className="mx-2 text-bz-text-soft">·</span>
        Sorted by Doc No. desc
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ORDER TABLE the centerpiece. One row expanded with line items.
// ════════════════════════════════════════════════════════════════════════════

function OrderTable() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(["SO-1047"]));

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="px-4 pb-5 md:px-6">
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left" style={{ minWidth: 1180 }}>
            <thead>
              <tr className="border-b border-bz-line-soft">
                {COLUMNS.map((c) => (
                  <th
                    key={c.label}
                    className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted"
                    style={c.width ? { width: c.width } : undefined}
                  >
                    <span className="inline-flex items-center">
                      {c.label}
                      <SortIcon sort={c.sort as "asc" | "desc" | "idle" | null} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bz-line-soft">
              {ORDERS.map((o) => {
                const isExpanded = expanded.has(o.id);
                return (
                <React.Fragment key={o.id}>
                  <tr
                    onClick={() => navigate(`/design/sales-order-list/${o.id}`)}
                    className={`cursor-pointer transition-colors ${
                      isExpanded ? "bg-bz-fire/[0.05]" : "bg-bz-surface hover:bg-bz-paper-warm/60"
                    }`}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleExpand(o.id)}
                          aria-label={isExpanded ? "Collapse row" : "Expand row"}
                          className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
                        >
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        <button className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
                          <MoreHorizontal size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[12.5px] font-semibold tabular-nums text-bz-text">
                        {o.id}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block truncate text-[12.5px] font-medium text-bz-text">
                        {o.party}
                      </span>
                      <span className="block text-[10.5px] tabular-nums text-bz-text-muted">
                        {o.amount}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[11.5px] tabular-nums text-bz-text-muted">{o.date}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[11.5px] tabular-nums text-bz-text-muted">{o.nepDate}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[11.5px] text-bz-text-muted">{o.location}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10.5px] font-semibold text-bz-text-muted">{o.subsidiary}</span>
                    </td>
                    <td className="px-3 py-3">
                      <ApprovalDot status={o.approval} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill
                        label={o.fulfill}
                        tone={
                          o.fulfill === "Delivered"      ? "delivered" :
                          o.fulfill === "Partial Fulfill" ? "partial"  :
                                                            "pending"
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill
                        label={o.bill}
                        tone={
                          o.bill === "Invoiced"     ? "invoiced"    :
                          o.bill === "Partial Bill" ? "partialBill" :
                                                      "pendingBill"
                        }
                      />
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-bz-fire/[0.04]">
                      <td colSpan={COLUMNS.length} className="px-3 pb-5 pt-1">
                        <div className="ml-7 rounded-bz-md bg-bz-surface">
                          <div className="flex items-center justify-between px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <FileText size={11} className="text-bz-text-muted" />
                              <p className="text-[11px] text-bz-text-muted">
                                Order line items · {SO_1047_LINES.length}
                              </p>
                            </div>
                            <p className="text-[11px] text-bz-text-muted">
                              Total{" "}
                              <span className="font-semibold text-bz-text tabular-nums">{o.amount}</span>
                            </p>
                          </div>
                          <table className="w-full table-fixed">
                            <thead>
                              <tr className="border-y border-bz-line-soft">
                                <th className="w-10 px-3 py-2 text-left text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">#</th>
                                <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Item</th>
                                <th className="w-16 px-3 py-2 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Qty</th>
                                <th className="w-32 px-3 py-2 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Rate</th>
                                <th className="w-32 px-3 py-2 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-bz-line-soft">
                              {SO_1047_LINES.map((l) => (
                                <tr key={l.line}>
                                  <td className="px-3 py-2 text-[11px] tabular-nums text-bz-text-muted">{l.line}</td>
                                  <td className="px-3 py-2 text-[11.5px] font-medium text-bz-text">{l.item}</td>
                                  <td className="px-3 py-2 text-right text-[11px] tabular-nums text-bz-text">{l.qty}</td>
                                  <td className="px-3 py-2 text-right text-[11px] tabular-nums text-bz-text-muted">{l.rate}</td>
                                  <td className="px-3 py-2 text-right text-[11.5px] font-semibold tabular-nums text-bz-text">{l.amount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="flex flex-col gap-2 border-t border-bz-line-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <span className="text-[11.5px] text-bz-text-muted tabular-nums">
            Showing <span className="font-semibold text-bz-text">{PAGE_SIZE}</span> of{" "}
            <span className="font-semibold text-bz-text">{TOTAL_RECORDS}</span>
          </span>
          <span className="inline-flex items-center gap-2 text-[11.5px] text-bz-text-muted">
            <Loader2 size={12} className="animate-spin text-bz-fire" />
            Loading more…
          </span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FILTER DRAWER right-side slide-in, shown OPEN with backdrop
// ════════════════════════════════════════════════════════════════════════════

function FilterDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 z-10 bg-bz-olive/35 backdrop-blur-[1px]"
        aria-hidden
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 z-20 flex h-full w-full max-w-[400px] flex-col border-l border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bz-line bg-bz-paper-warm px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-bz-text" />
            <p className="text-[14px] font-semibold text-bz-text">Filters</p>
            <span className="inline-flex h-5 items-center rounded-bz-pill bg-bz-fire/[0.18] px-2 text-[10px] font-semibold text-bz-text tabular-nums">
              {ACTIVE_FILTERS.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[11px] font-semibold text-bz-text underline decoration-bz-line underline-offset-2">
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-bz-sm border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            <FilterField icon={Building2} label="Subsidiary" hint="Cascades · changes Location + Party">
              <FieldPicker value="NP-01 · Bizak Nepal" />
            </FilterField>

            <FilterField icon={CalendarRange} label="Date range">
              <div className="grid grid-cols-2 gap-2">
                <FieldPicker value="May 1, 2026"  small />
                <FieldPicker value="May 18, 2026" small />
              </div>
            </FilterField>

            <FilterField icon={MapPin} label="Location">
              <FieldPicker value="Pokhara" />
            </FilterField>

            <FilterField icon={Users} label="Party / Customer">
              <FieldPicker value="Apex Manufacturing Pvt Ltd" />
            </FilterField>

            <FilterField label="Approval Status">
              <CheckboxRow items={[
                { label: "Approved", on: true  },
                { label: "Pending",  on: false },
                { label: "Rejected", on: false },
              ]} />
            </FilterField>

            <FilterField label="Fulfillment Status">
              <CheckboxRow items={[
                { label: "Delivered",       on: false },
                { label: "Partial Fulfill", on: true  },
                { label: "Pending Deliver", on: false },
              ]} />
            </FilterField>

            <FilterField label="Bill Status">
              <CheckboxRow items={[
                { label: "Invoiced",     on: false },
                { label: "Partial Bill", on: true  },
                { label: "Pending Bill", on: false },
              ]} />
            </FilterField>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-bz-line bg-bz-paper-warm px-4 py-3">
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}

function FilterField({
  icon: Icon,
  label,
  hint,
  children,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={11} className="text-bz-text-muted" />}
          <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">
            {label}
          </p>
        </div>
        {hint && <p className="text-[9.5px] text-bz-text-soft">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldPicker({ value, small }: { value: string; small?: boolean }) {
  return (
    <button
      className={`flex w-full items-center justify-between rounded-bz-md border border-bz-line bg-bz-paper-warm px-3 text-left text-bz-text ${
        small ? "h-9 text-[11.5px]" : "h-10 text-[12.5px]"
      }`}
    >
      <span className="truncate">{value}</span>
      <ChevronDown size={12} className="text-bz-text-muted" />
    </button>
  );
}

function CheckboxRow({ items }: { items: { label: string; on: boolean }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => (
        <label key={it.label} className="flex cursor-default items-center gap-2.5 text-[12.5px] text-bz-text">
          <span
            className={`flex size-[18px] items-center justify-center rounded-bz-sm border ${
              it.on ? "border-bz-text bg-bz-text" : "border-bz-line bg-bz-paper-warm"
            }`}
          >
            {it.on && <TickGlyph />}
          </span>
          {it.label}
        </label>
      ))}
    </div>
  );
}

function TickGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.5L5 9L9.5 3.5" stroke="var(--bz-fire)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE shell: sidebar + top bar + main + drawer overlay
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// APP SHELL exported so the detail page reuses the exact same chrome
// ════════════════════════════════════════════════════════════════════════════

export function AppShell({
  breadcrumb,
  overlay,
  children,
}: {
  breadcrumb: React.ReactNode;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-bz-section-b text-bz-text">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto bg-bz-section-b">{children}</main>
        {overlay}
      </div>
    </div>
  );
}

function ListBreadcrumb() {
  return (
    <>
      <span className="text-bz-text-muted">Sales &amp; CRM</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Sales Order</span>
    </>
  );
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className="flex size-7 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18]">
          <Check size={13} className="text-bz-leaf-deep" />
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

export function SalesOrderListDesignPage() {
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const location = useLocation();
  const initialToast = (location.state as { toast?: string } | null)?.toast ?? null;
  const [toast, setToast] = React.useState<string | null>(initialToast);

  // Clear the navigation state so the toast doesn't reappear on back/forward.
  React.useEffect(() => {
    if (initialToast) {
      window.history.replaceState({}, "");
    }
  }, [initialToast]);

  // Auto-dismiss after 4.5s.
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <AppShell
      breadcrumb={<ListBreadcrumb />}
      overlay={<FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />}
    >
      <PageHeader onOpenFilters={() => setFiltersOpen(true)} />
      <AnalyticsStrip />
      <FiltersAndCountBar />
      <OrderTable />
      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
