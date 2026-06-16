import * as React from "react";
import { createPortal } from "react-dom";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ArrowUpRight,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Layers,
  Loader2,
  Inbox,
  AlertTriangle,
  Check,
  X,
  Filter,
  Tag,
  LifeBuoy,
  Rows3,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// USER SUPPORT · TICKET LIST  (browse & act, server-driven)
//
// Read of the page: the operator is here to SURVEY a collection of support
// tickets and act on it — page it, re-order it, cluster it, drill into one.
// The defining trait (vs. the sales-order list) is that the page is a THIN
// CONTROLLER over a backend query: every paging / sort / grouping change emits
// a new composite query state, the page maps it to a fetch, and a BLOCKING
// progress indicator gates the grid until the response lands. Nothing is sorted,
// filtered or grouped client-side in spirit — the grid is a pure controlled
// component driven by the query state the page owns.
//
// Hierarchy invented for THIS page:
//   1. Header        Support identity + live total + the create-ticket trigger
//   2. Control bar   SHAPE the query  → sort · group · (latent) filter · refresh
//   3. Grid          the controlled dataset grid, with a blocking fetch overlay,
//                    grouped / ungrouped rendering, and the empty state
//   4. Pager         TRAVERSE the result → range readout · page size · page nav
//
// Latent capabilities (present in behaviour, surfaced quietly): a per-record
// delete behind the row's ⋯ menu → a binary confirm dialog → backend → a
// success / warning toast → list refresh. A field=value filter folds into the
// query (no dedicated filter surface; demonstrated by clicking a priority /
// category value).
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// FORMAT  raw timestamp → short calendar date
// ════════════════════════════════════════════════════════════════════════════

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
function truncate(s: string, n = 44) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

// ════════════════════════════════════════════════════════════════════════════
// MODEL
// ════════════════════════════════════════════════════════════════════════════

type Priority = "urgent" | "high" | "normal" | "low";

const PRIORITY: Record<Priority, { label: string; rank: number; level: number; danger?: boolean }> = {
  urgent: { label: "Urgent", rank: 0, level: 3, danger: true },
  high: { label: "High", rank: 1, level: 3 },
  normal: { label: "Normal", rank: 2, level: 2 },
  low: { label: "Low", rank: 3, level: 1 },
};

type Ticket = {
  id: string;
  subject: string;
  requester: string;
  priority: Priority;
  category: string;
  openedISO: string; // raw timestamp
  closedISO: string | null; // null → still open
};

const T = (
  id: string,
  subject: string,
  requester: string,
  priority: Priority,
  category: string,
  openedISO: string,
  closedISO: string | null,
): Ticket => ({ id, subject, requester, priority, category, openedISO, closedISO });

// Seed queue — Nepal / ERP support desk. Numbers, dates and open/closed all
// self-consistent so the pager range, group counts and delete rule reconcile.
// "Integration" intentionally holds a single (closed) ticket so the no-results
// state is reachable: filter → Integration → delete its one ticket → empty.
const SEED: Ticket[] = [
  T("TK-3092", "App stuck on loading screen after login", "Apex Manufacturing", "urgent", "Technical", "2026-06-13T08:42:00", null),
  T("TK-3091", "Subscription invoice charged twice in May", "Himalayan Traders", "high", "Billing", "2026-06-12T14:10:00", null),
  T("TK-3090", "Bank statement import skips some rows", "Annapurna Distributors", "high", "Data import", "2026-06-12T09:05:00", null),
  T("TK-3089", "Add a bulk-approve action for sales orders", "Everest Hardware Supplies", "normal", "Feature request", "2026-06-11T16:30:00", null),
  T("TK-3088", "Trial balance is off by NPR 1,200", "Sagarmatha Steel Udyog", "urgent", "Reporting", "2026-06-11T11:22:00", null),
  T("TK-3087", "Can't reset password — no email arrives", "Gandaki Auto Parts", "high", "Account", "2026-06-10T10:15:00", null),
  T("TK-3086", "Export to Excel times out on big registers", "Pashupati Enterprises", "normal", "Technical", "2026-06-10T13:48:00", null),
  T("TK-3085", "Khalti payment webhook not firing", "Pokhara Electronics", "high", "Integration", "2026-06-09T09:31:00", "2026-06-12T15:20:00"),
  T("TK-3084", "PDF invoices missing the company logo", "Lumbini Agro Pvt Ltd", "normal", "Technical", "2026-06-09T08:05:00", "2026-06-11T12:00:00"),
  T("TK-3083", "Upgrade to Pro tier didn't take effect", "Bagmati Builders", "high", "Billing", "2026-06-08T15:40:00", null),
  T("TK-3082", "Aging summary still shows closed invoices", "Janaki Textiles", "normal", "Reporting", "2026-06-08T10:12:00", "2026-06-10T09:45:00"),
  T("TK-3081", "Add a new user to the NP-02 subsidiary", "Mechi Trade Concern", "low", "Account", "2026-06-07T14:25:00", "2026-06-09T11:30:00"),
  T("TK-3080", "Item import fails on a duplicate SKU", "Karnali Pharma", "normal", "Data import", "2026-06-06T09:50:00", null),
  T("TK-3079", "Support recurring journal entries", "Manakamana Stores", "low", "Feature request", "2026-06-06T11:05:00", "2026-06-09T16:40:00"),
  T("TK-3078", "Session expires every few minutes", "Siddhartha Glass Works", "high", "Technical", "2026-06-05T08:20:00", "2026-06-07T10:10:00"),
  T("TK-3077", "P&L is missing a cost center", "Dhaulagiri Cement", "normal", "Reporting", "2026-06-05T13:15:00", "2026-06-08T14:00:00"),
  T("TK-3076", "Refund not reflected on the account", "Rara Foods Pvt Ltd", "high", "Billing", "2026-06-04T10:40:00", "2026-06-06T12:30:00"),
  T("TK-3075", "Help migrating our books from Tally", "Bhrikuti Paper Mills", "normal", "Onboarding", "2026-06-04T09:00:00", "2026-06-10T15:00:00"),
  T("TK-3074", "Customer CSV import maps the wrong columns", "Himalayan Traders", "normal", "Data import", "2026-06-03T15:35:00", "2026-06-05T11:20:00"),
  T("TK-3073", "Locked out after an MFA reset", "Apex Manufacturing", "urgent", "Account", "2026-06-03T08:10:00", "2026-06-03T13:50:00"),
  T("TK-3072", "Balance sheet won't export to PDF", "Annapurna Distributors", "normal", "Reporting", "2026-06-02T11:25:00", "2026-06-04T10:05:00"),
  T("TK-3071", "Dark mode for the dashboard", "Everest Hardware Supplies", "low", "Feature request", "2026-06-02T14:00:00", null),
  T("TK-3070", "VAT not added to the renewal invoice", "Sagarmatha Steel Udyog", "high", "Billing", "2026-06-01T09:45:00", "2026-06-03T16:15:00"),
  T("TK-3069", "Search returns no results under Items", "Gandaki Auto Parts", "normal", "Technical", "2026-06-01T10:30:00", "2026-06-02T09:20:00"),
  T("TK-3068", "Stock count mismatch in Pokhara warehouse", "Pokhara Electronics", "high", "Technical", "2026-05-30T13:10:00", "2026-06-01T11:00:00"),
  T("TK-3067", "Change the account owner's email", "Pashupati Enterprises", "low", "Account", "2026-05-29T15:20:00", "2026-06-01T10:40:00"),
  T("TK-3066", "Set up the initial chart of accounts", "Lumbini Agro Pvt Ltd", "normal", "Onboarding", "2026-05-29T09:15:00", "2026-06-04T14:30:00"),
  T("TK-3065", "Invoice email bounces for some customers", "Bagmati Builders", "normal", "Technical", "2026-05-28T11:50:00", "2026-05-30T13:25:00"),
  T("TK-3064", "Add multi-currency to purchase orders", "Janaki Textiles", "low", "Feature request", "2026-05-28T14:35:00", null),
  T("TK-3063", "Reconciliation won't match a split payment", "Mechi Trade Concern", "high", "Reporting", "2026-05-27T10:05:00", "2026-05-29T15:45:00"),
  T("TK-3062", "Tax report shows the wrong total for May", "Karnali Pharma", "urgent", "Reporting", "2026-05-27T08:40:00", "2026-05-28T17:10:00"),
  T("TK-3061", "Bulk import wizard freezes at 80%", "Manakamana Stores", "high", "Data import", "2026-05-26T13:30:00", "2026-05-28T11:15:00"),
  T("TK-3060", "Need a read-only role for auditors", "Siddhartha Glass Works", "normal", "Account", "2026-05-26T09:25:00", "2026-05-29T10:50:00"),
  T("TK-3059", "Renewal charged on the old card", "Dhaulagiri Cement", "normal", "Billing", "2026-05-25T14:10:00", "2026-05-27T09:35:00"),
  T("TK-3058", "Dashboard widgets won't load on mobile", "Rara Foods Pvt Ltd", "low", "Technical", "2026-05-25T10:00:00", "2026-05-27T12:20:00"),
  T("TK-3057", "General ledger export missing narration", "Bhrikuti Paper Mills", "low", "Reporting", "2026-05-24T11:40:00", "2026-05-26T15:00:00"),
  T("TK-3056", "Can't delete a draft sales order", "Himalayan Traders", "normal", "Technical", "2026-05-24T09:10:00", "2026-05-25T14:45:00"),
  T("TK-3055", "Add SMS alerts for low stock", "Apex Manufacturing", "low", "Feature request", "2026-05-23T15:05:00", "2026-05-28T10:25:00"),
  T("TK-3054", "Statement import duplicates one transaction", "Annapurna Distributors", "normal", "Data import", "2026-05-23T08:55:00", "2026-05-25T11:10:00"),
  T("TK-3053", "Price level not applied on a quotation", "Everest Hardware Supplies", "normal", "Technical", "2026-05-22T13:20:00", "2026-05-24T09:50:00"),
  T("TK-3052", "Downgrade plan at end of billing cycle", "Gandaki Auto Parts", "low", "Billing", "2026-05-22T10:35:00", "2026-05-24T16:30:00"),
  T("TK-3051", "Onboarding webinar access not working", "Pokhara Electronics", "low", "Onboarding", "2026-05-21T09:40:00", "2026-05-23T13:15:00"),
];

// ════════════════════════════════════════════════════════════════════════════
// QUERY STATE  (composite state the page owns; the grid only emits changes)
// ════════════════════════════════════════════════════════════════════════════

type SortField = "subject" | "priority" | "category" | "opened" | "closed";
type Sort = { field: SortField; dir: "asc" | "desc" };
type GroupField = "priority" | "category";
type Filter = { field: "priority" | "category"; value: string; label: string } | null;

// Each field declares its width and whether it participates in sorting /
// filtering, independently — the grid renders columns straight from this config.
const COLUMNS: { key: SortField; label: string; sortable: boolean; filterable: boolean; width?: number }[] = [
  { key: "subject", label: "Subject", sortable: true, filterable: false },
  { key: "priority", label: "Priority", sortable: true, filterable: true, width: 150 },
  { key: "category", label: "Category", sortable: true, filterable: true, width: 172 },
  { key: "opened", label: "Opened", sortable: true, filterable: false, width: 132 },
  { key: "closed", label: "Closed", sortable: true, filterable: false, width: 132 },
];
const SORTABLE = COLUMNS.filter((c) => c.sortable);

const SORT_LABEL: Record<SortField, string> = {
  subject: "Subject", priority: "Priority", category: "Category", opened: "Opened", closed: "Closed",
};
const SORT_HINT: Record<SortField, string> = {
  subject: "A → Z", priority: "Severity", category: "A → Z", opened: "Date opened", closed: "Date closed",
};
const GROUP_LABEL: Record<GroupField, string> = { priority: "Priority", category: "Category" };
const FILTER_FIELD_LABEL: Record<"priority" | "category", string> = { priority: "Priority", category: "Category" };

const PAGE_SIZES = [10, 20, 50];

function matchesFilter(t: Ticket, f: Filter) {
  if (!f) return true;
  return f.field === "priority" ? t.priority === f.value : t.category === f.value;
}
function cmpStr(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function comparator(field: SortField): (a: Ticket, b: Ticket) => number {
  switch (field) {
    case "subject": return (a, b) => a.subject.localeCompare(b.subject);
    case "category": return (a, b) => a.category.localeCompare(b.category);
    case "priority": return (a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank;
    case "opened": return (a, b) => cmpStr(a.openedISO, b.openedISO);
    case "closed": return (a, b) => cmpStr(a.closedISO ?? "", b.closedISO ?? "");
  }
}
// group key as a string so the primary cluster sort is type-stable (priority
// rank "0".."3" sorts urgent→low; category sorts A→Z).
function groupKeyVal(t: Ticket, group: GroupField) {
  return group === "priority" ? String(PRIORITY[t.priority].rank) : t.category;
}
function orderRows(rows: Ticket[], sort: Sort, group: GroupField | null) {
  const cmp = comparator(sort.field);
  const sign = sort.dir === "asc" ? 1 : -1;
  const arr = [...rows];
  if (group) {
    arr.sort((a, b) => {
      const ga = groupKeyVal(a, group);
      const gb = groupKeyVal(b, group);
      if (ga < gb) return -1;
      if (ga > gb) return 1;
      return sign * cmp(a, b);
    });
  } else {
    arr.sort((a, b) => sign * cmp(a, b));
  }
  return arr;
}
type Cluster = { key: string; label: string; rows: Ticket[] };
function clusterRows(rows: Ticket[], group: GroupField): Cluster[] {
  const map = new Map<string, Ticket[]>();
  for (const t of rows) {
    const key = group === "priority" ? t.priority : t.category;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries()).map(([key, rs]) => ({
    key,
    label: group === "priority" ? PRIORITY[key as Priority].label : key,
    rows: rs,
  }));
}

function pageList(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const wanted = new Set([1, totalPages, page, page - 1, page + 1]);
  const nums = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED CLASSES
// ════════════════════════════════════════════════════════════════════════════

const PRIMARY_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm";
const CONTROL_BTN =
  "inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm";

// ════════════════════════════════════════════════════════════════════════════
// PORTAL MENU  anchored off the trigger, closes on outside-click / Esc / scroll
// ════════════════════════════════════════════════════════════════════════════

function useAnchoredPos(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; right: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !ref.current) {
      setPos(null);
      return;
    }
    const update = () => {
      const r = ref.current!.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, right: r.right, width: r.width });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open, ref]);
  return pos;
}

function useDismiss(
  open: boolean,
  setOpen: (v: boolean) => void,
  btnRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
) {
  React.useEffect(() => {
    if (!open) return;
    const inside = (t: Node) => !!btnRef.current?.contains(t) || !!panelRef.current?.contains(t);
    const onDown = (e: MouseEvent) => {
      if (!inside(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (panelRef.current && e.target instanceof Node && panelRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, setOpen, btnRef, panelRef]);
}

type MenuOpt = {
  key: string;
  label: string;
  sub?: string;
  active?: boolean;
  trailing?: React.ReactNode;
  onSelect: () => void;
};

function SelectMenu({
  icon: Icon, label, value, options, align = "left", panelWidth = 224, disabled,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  options: MenuOpt[];
  align?: "left" | "right";
  panelWidth?: number;
  disabled?: boolean;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchoredPos(open, btnRef);
  useDismiss(open, setOpen, btnRef, panelRef);

  const rawLeft = align === "right" && pos ? pos.right - panelWidth : pos?.left ?? 0;
  const left = pos ? Math.max(8, Math.min(rawLeft, window.innerWidth - panelWidth - 8)) : 0;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(CONTROL_BTN, open && "border-bz-text", disabled && "cursor-not-allowed opacity-50")}
      >
        <Icon size={13} className="text-bz-text-muted" />
        <span className="hidden text-bz-text-muted sm:inline">{label}</span>
        <span className="font-semibold text-bz-text">{value}</span>
        <ChevronDown size={12} className="text-bz-text-muted" />
      </button>
      {open && pos &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: pos.top, left, width: panelWidth }}
            className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
          >
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => { o.onSelect(); setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm",
                  o.active && "bg-bz-fire/[0.06]",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                  {o.sub && <span className="block truncate text-[10.5px] text-bz-text-soft">{o.sub}</span>}
                </span>
                {o.trailing}
                {o.active && !o.trailing && <Check size={13} className="shrink-0 text-bz-text" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIELD DISPLAYS  priority pips · category tag
// ════════════════════════════════════════════════════════════════════════════

// Severity as flat signal-bars (the app's "thin bars only" viz language) — count
// encodes level, red is reserved for Urgent. No hue ramp, no gradients.
function PriorityPips({ p }: { p: Priority }) {
  const m = PRIORITY[p];
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-end gap-[2px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-[1px]",
              i === 0 ? "h-1.5" : i === 1 ? "h-2" : "h-2.5",
              i < m.level ? (m.danger ? "bg-[#C0413A]" : "bg-bz-olive") : "bg-bz-line",
            )}
          />
        ))}
      </span>
      <span className={cn("text-[12px] font-medium", m.danger ? "text-[#9A2E29]" : "text-bz-text")}>{m.label}</span>
    </span>
  );
}

function CategoryTag({ value, onClick }: { value: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      title={`Filter by ${value}`}
      className="inline-flex items-center gap-1.5 rounded-bz-sm bg-bz-paper-warm px-2 py-1 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-fire/[0.16] hover:text-bz-text"
    >
      <Tag size={10} className="text-bz-text-soft" /> {value}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PER-RECORD ACTIONS  (open = the prominent control; edit / delete are latent)
// ════════════════════════════════════════════════════════════════════════════

function RowMenu({
  t, onOpen, onEdit, onDelete,
}: {
  t: Ticket;
  onOpen: (t: Ticket) => void;
  onEdit: (t: Ticket) => void;
  onDelete: (t: Ticket) => void;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchoredPos(open, btnRef);
  useDismiss(open, setOpen, btnRef, panelRef);
  const W = 184;
  const left = pos ? Math.max(8, Math.min(pos.right - W, window.innerWidth - W - 8)) : 0;

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="Row actions"
        className={cn(
          "flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
          open && "bg-bz-paper-warm text-bz-text",
        )}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && pos &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: pos.top, left, width: W }}
            onClick={(e) => e.stopPropagation()}
            className="z-[55] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
          >
            <button
              onClick={() => { setOpen(false); onOpen(t); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm"
            >
              <ArrowUpRight size={13} className="text-bz-text-muted" />
              <span className="text-[12px] font-medium text-bz-text">Open ticket</span>
            </button>
            <button
              onClick={() => { setOpen(false); onEdit(t); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm"
            >
              <Pencil size={13} className="text-bz-text-muted" />
              <span className="text-[12px] font-medium text-bz-text">Edit ticket</span>
            </button>
            <div className="my-1 h-px bg-bz-line-soft" />
            <button
              onClick={() => { setOpen(false); onDelete(t); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-[#FBE7E5]"
            >
              <Trash2 size={13} className="text-[#9A2E29]" />
              <span className="text-[12px] font-medium text-[#9A2E29]">Delete ticket</span>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1 · HEADER
// ════════════════════════════════════════════════════════════════════════════

function PageHeader({ total, onNew }: { total: number; onNew: () => void }) {
  return (
    <header className="px-4 pb-4 pt-5 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
            <LifeBuoy size={11} /> Support
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Support tickets</h1>
            <span className="inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold tabular-nums text-bz-text-muted">
              {total}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] text-bz-text-muted">
            Browse and manage the requests your users have submitted — page, re-order and cluster the queue, then open a ticket to work it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onNew} className={PRIMARY_BTN}>
            <Plus size={14} /> New ticket
          </button>
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2 · CONTROL BAR  shape the query (sort · group · filter · refresh)
// ════════════════════════════════════════════════════════════════════════════

function ControlBar({
  sort, group, filter, loading, onSort, onGroup, onClearFilter, onRefresh,
}: {
  sort: Sort;
  group: GroupField | null;
  filter: Filter;
  loading: boolean;
  onSort: (f: SortField) => void;
  onGroup: (g: GroupField | null) => void;
  onClearFilter: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-bz-line-soft px-4 py-3">
      <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft sm:inline">View</span>

      <SelectMenu
        icon={ArrowUpDown}
        label="Sort"
        value={`${SORT_LABEL[sort.field]} ${sort.dir === "asc" ? "↑" : "↓"}`}
        disabled={loading}
        options={SORTABLE.map((col) => ({
          key: col.key,
          label: col.label,
          sub: SORT_HINT[col.key],
          active: col.key === sort.field,
          trailing:
            col.key === sort.field
              ? sort.dir === "asc"
                ? <ArrowUp size={13} className="shrink-0 text-bz-text" />
                : <ArrowDown size={13} className="shrink-0 text-bz-text" />
              : undefined,
          onSelect: () => onSort(col.key),
        }))}
      />

      <SelectMenu
        icon={Layers}
        label="Group"
        value={group ? GROUP_LABEL[group] : "None"}
        disabled={loading}
        options={[
          { key: "none", label: "No grouping", sub: "Flat list", active: !group, onSelect: () => onGroup(null) },
          { key: "priority", label: "Priority", sub: "Cluster by severity", active: group === "priority", onSelect: () => onGroup("priority") },
          { key: "category", label: "Category", sub: "Cluster by classification", active: group === "category", onSelect: () => onGroup("category") },
        ]}
      />

      {filter && (
        <span className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-fire/[0.16] pl-2.5 pr-1 text-[12px]">
          <Filter size={11} className="text-bz-text-muted" />
          <span className="text-bz-text-muted">{FILTER_FIELD_LABEL[filter.field]}:</span>
          <span className="font-semibold text-bz-text">{filter.label}</span>
          <button
            onClick={onClearFilter}
            disabled={loading}
            aria-label="Clear filter"
            className="flex size-5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/40 hover:text-bz-text disabled:opacity-50"
          >
            <X size={11} />
          </button>
        </span>
      )}

      <button
        onClick={onRefresh}
        disabled={loading}
        title="Re-run the query"
        className={cn(CONTROL_BTN, "ml-auto disabled:opacity-50")}
      >
        <RotateCcw size={13} className={cn("text-bz-text-muted", loading && "animate-spin")} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3 · GRID  (desktop table + mobile cards, grouped or flat) · loading · empty
// ════════════════════════════════════════════════════════════════════════════

function SortHead({
  col, sort, onSort, disabled,
}: {
  col: (typeof COLUMNS)[number];
  sort: Sort;
  onSort: (f: SortField) => void;
  disabled: boolean;
}) {
  const HEAD = "text-[10px] font-semibold uppercase tracking-[0.06em]";
  if (!col.sortable) return <span className={cn(HEAD, "text-bz-text-muted")}>{col.label}</span>;
  const active = sort.field === col.key;
  return (
    <button
      disabled={disabled}
      onClick={() => onSort(col.key)}
      className={cn(
        "group inline-flex items-center gap-1",
        HEAD,
        active ? "text-bz-text" : "text-bz-text-muted hover:text-bz-text",
        disabled && "cursor-default",
      )}
    >
      {col.label}
      {active ? (
        sort.dir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />
      ) : (
        <ChevronsUpDown size={12} className="text-bz-text-soft" />
      )}
    </button>
  );
}

function TicketRow({
  t, onOpen, onEdit, onDelete, onFilter,
}: {
  t: Ticket;
  onOpen: (t: Ticket) => void;
  onEdit: (t: Ticket) => void;
  onDelete: (t: Ticket) => void;
  onFilter: (field: "priority" | "category", value: string, label: string) => void;
}) {
  return (
    <tr
      onClick={() => onOpen(t)}
      className="cursor-pointer border-b border-bz-line-soft last:border-0 hover:bg-bz-paper-warm/50"
    >
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
            <LifeBuoy size={13} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-bz-text">{t.subject}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-bz-text-muted">
              <span className="font-semibold tabular-nums">{t.id}</span>
              <span className="size-1 rounded-bz-pill bg-bz-text-soft" />
              <span className="truncate">{t.requester}</span>
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <button
          onClick={(e) => { e.stopPropagation(); onFilter("priority", t.priority, PRIORITY[t.priority].label); }}
          title={`Filter by ${PRIORITY[t.priority].label}`}
          className="-mx-1 rounded-bz-sm px-1 py-0.5 hover:bg-bz-paper-warm"
        >
          <PriorityPips p={t.priority} />
        </button>
      </td>
      <td className="px-3 py-3">
        <CategoryTag value={t.category} onClick={(e) => { e.stopPropagation(); onFilter("category", t.category, t.category); }} />
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-[12px] tabular-nums text-bz-text">{fmtDate(t.openedISO)}</td>
      <td className="whitespace-nowrap px-3 py-3">
        {t.closedISO ? (
          <span className="text-[12px] tabular-nums text-bz-text-muted">{fmtDate(t.closedISO)}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-leaf-deep">
            <span className="size-1.5 rounded-bz-pill bg-bz-leaf-deep" /> Open
          </span>
        )}
      </td>
      <td className="py-3 pl-3 pr-4">
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onOpen(t)}
            className="inline-flex h-7 items-center gap-1 rounded-bz-sm border border-bz-line bg-bz-surface px-2 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"
          >
            Open <ArrowUpRight size={12} />
          </button>
          <RowMenu t={t} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </td>
    </tr>
  );
}

function GroupHeadInner({ group, cl }: { group: GroupField; cl: Cluster }) {
  return (
    <>
      {group === "priority" ? (
        <PriorityPips p={cl.key as Priority} />
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-bz-text">
          <Tag size={11} className="text-bz-text-soft" /> {cl.label}
        </span>
      )}
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-bz-pill bg-bz-surface px-1.5 text-[11px] font-semibold tabular-nums text-bz-text-muted">
        {cl.rows.length}
      </span>
      <span className="text-[11px] text-bz-text-soft">on this page</span>
    </>
  );
}

function TicketTable({
  rows, group, clusters, collapsed, sort, loading, onSort, onToggleGroup, onOpen, onEdit, onDelete, onFilter,
}: {
  rows: Ticket[];
  group: GroupField | null;
  clusters: Cluster[] | null;
  collapsed: Set<string>;
  sort: Sort;
  loading: boolean;
  onSort: (f: SortField) => void;
  onToggleGroup: (key: string) => void;
  onOpen: (t: Ticket) => void;
  onEdit: (t: Ticket) => void;
  onDelete: (t: Ticket) => void;
  onFilter: (field: "priority" | "category", value: string, label: string) => void;
}) {
  const colCount = COLUMNS.length + 1;
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left" style={{ minWidth: 920 }}>
        <colgroup>
          {COLUMNS.map((c) => (
            <col key={c.key} style={c.width ? { width: c.width } : undefined} />
          ))}
          <col style={{ width: 138 }} />
        </colgroup>
        <thead>
          <tr className="border-b border-bz-line bg-bz-paper-warm">
            {COLUMNS.map((c, i) => (
              <th key={c.key} className={cn("px-3 py-2.5", i === 0 && "pl-4")}>
                <SortHead col={c} sort={sort} onSort={onSort} disabled={loading} />
              </th>
            ))}
            <th className="px-3 py-2.5 pr-4 text-right text-[10px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {group && clusters
            ? clusters.map((cl) => {
                const isCol = collapsed.has(cl.key);
                return (
                  <React.Fragment key={cl.key}>
                    <tr className="border-b border-bz-line-soft bg-bz-paper-warm/60">
                      <td colSpan={colCount} className="px-4 py-2">
                        <button onClick={() => onToggleGroup(cl.key)} className="flex items-center gap-2 text-left">
                          {isCol ? (
                            <ChevronRight size={14} className="text-bz-text-muted" />
                          ) : (
                            <ChevronDown size={14} className="text-bz-text-muted" />
                          )}
                          <GroupHeadInner group={group} cl={cl} />
                        </button>
                      </td>
                    </tr>
                    {!isCol &&
                      cl.rows.map((t) => (
                        <TicketRow key={t.id} t={t} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onFilter={onFilter} />
                      ))}
                  </React.Fragment>
                );
              })
            : rows.map((t) => (
                <TicketRow key={t.id} t={t} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} onFilter={onFilter} />
              ))}
        </tbody>
      </table>
    </div>
  );
}

function TicketCard({
  t, onOpen, onEdit, onDelete,
}: {
  t: Ticket;
  onOpen: (t: Ticket) => void;
  onEdit: (t: Ticket) => void;
  onDelete: (t: Ticket) => void;
}) {
  return (
    <div className="rounded-bz-md border border-bz-line-soft bg-bz-surface">
      <button onClick={() => onOpen(t)} className="block w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13.5px] font-medium leading-snug text-bz-text">{t.subject}</p>
          {t.closedISO ? (
            <span className="shrink-0 text-[10.5px] tabular-nums text-bz-text-soft">Closed</span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 text-[10.5px] font-medium text-bz-leaf-deep">
              <span className="size-1.5 rounded-bz-pill bg-bz-leaf-deep" /> Open
            </span>
          )}
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-bz-text-muted">
          <span className="font-semibold tabular-nums">{t.id}</span>
          <span className="size-1 rounded-bz-pill bg-bz-text-soft" />
          <span className="truncate">{t.requester}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PriorityPips p={t.priority} />
          <span className="inline-flex items-center gap-1.5 rounded-bz-sm bg-bz-paper-warm px-2 py-1 text-[11px] font-medium text-bz-text-muted">
            <Tag size={10} className="text-bz-text-soft" /> {t.category}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] tabular-nums text-bz-text-muted">
          <span>Opened {fmtDate(t.openedISO)}</span>
          {t.closedISO && <span>Closed {fmtDate(t.closedISO)}</span>}
        </div>
      </button>
      <div className="flex items-center justify-between border-t border-bz-line-soft px-3 py-2">
        <button
          onClick={() => onOpen(t)}
          className="inline-flex items-center gap-1.5 rounded-bz-sm px-1.5 py-1 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"
        >
          Open ticket <ArrowUpRight size={12} />
        </button>
        <RowMenu t={t} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

function TicketCards({
  rows, group, clusters, collapsed, onToggleGroup, onOpen, onEdit, onDelete,
}: {
  rows: Ticket[];
  group: GroupField | null;
  clusters: Cluster[] | null;
  collapsed: Set<string>;
  onToggleGroup: (key: string) => void;
  onOpen: (t: Ticket) => void;
  onEdit: (t: Ticket) => void;
  onDelete: (t: Ticket) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 p-3 md:hidden">
      {group && clusters
        ? clusters.map((cl) => {
            const isCol = collapsed.has(cl.key);
            return (
              <div key={cl.key} className="flex flex-col gap-2.5">
                <button
                  onClick={() => onToggleGroup(cl.key)}
                  className="flex items-center gap-2 rounded-bz-md bg-bz-paper-warm/70 px-3 py-2 text-left"
                >
                  {isCol ? (
                    <ChevronRight size={14} className="text-bz-text-muted" />
                  ) : (
                    <ChevronDown size={14} className="text-bz-text-muted" />
                  )}
                  <GroupHeadInner group={group} cl={cl} />
                </button>
                {!isCol &&
                  cl.rows.map((t) => (
                    <TicketCard key={t.id} t={t} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />
                  ))}
              </div>
            );
          })
        : rows.map((t) => <TicketCard key={t.id} t={t} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div
      className="absolute inset-0 z-20 flex items-start justify-center bg-bz-surface/65 backdrop-blur-[1px]"
      aria-hidden
    >
      <div className="mt-20 inline-flex items-center gap-2 rounded-bz-pill border border-bz-line-soft bg-bz-surface px-4 py-2 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <Loader2 size={15} className="animate-spin text-bz-fire" />
        <span className="text-[12px] font-medium text-bz-text-muted">Fetching tickets…</span>
      </div>
    </div>
  );
}

function EmptyState({ hasFilter, onClear }: { hasFilter: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <Inbox size={22} />
      </span>
      <p className="text-[14px] font-semibold text-bz-text">Nothing to display</p>
      <p className="max-w-sm text-[12px] text-bz-text-muted">
        {hasFilter
          ? "No tickets match the current filter. Clear it to see the full queue."
          : "There are no support tickets in the queue right now."}
      </p>
      {hasFilter && (
        <button onClick={onClear} className={cn(GHOST_BTN, "mt-1")}>
          <X size={13} /> Clear filter
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4 · PAGER  traverse the result (range · page size · page nav)
// ════════════════════════════════════════════════════════════════════════════

function PagerBtn({
  children, disabled, onClick, label,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-40 disabled:hover:bg-bz-surface"
    >
      {children}
    </button>
  );
}

function Pager({
  page, pageSize, total, loading, onPage, onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  loading: boolean;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const nums = pageList(page, totalPages);
  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-bz-line-soft px-4 py-3 sm:flex-row">
      <p className="text-[11.5px] tabular-nums text-bz-text-muted">
        Showing <span className="font-semibold text-bz-text">{start}–{end}</span> of{" "}
        <span className="font-semibold text-bz-text">{total}</span> tickets
      </p>

      <div className="flex items-center gap-2">
        <SelectMenu
          icon={Rows3}
          label="Show"
          value={`${pageSize} / page`}
          align="right"
          panelWidth={168}
          disabled={loading}
          options={PAGE_SIZES.map((n) => ({
            key: String(n),
            label: `${n} per page`,
            active: n === pageSize,
            onSelect: () => onPageSize(n),
          }))}
        />

        <div className="flex items-center gap-1">
          <PagerBtn disabled={loading || page <= 1} onClick={() => onPage(page - 1)} label="Previous page">
            <ChevronLeft size={15} />
          </PagerBtn>

          <div className="hidden items-center gap-1 sm:flex">
            {nums.map((n, i) =>
              n === "…" ? (
                <span key={`e${i}`} className="px-1 text-[11.5px] text-bz-text-soft">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  disabled={loading}
                  onClick={() => onPage(n)}
                  className={cn(
                    "flex h-8 min-w-8 items-center justify-center rounded-bz-md border px-2 text-[12px] font-medium tabular-nums",
                    n === page
                      ? "border-bz-deep bg-bz-deep text-bz-text-on-dark"
                      : "border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm",
                    loading && "opacity-50",
                  )}
                >
                  {n}
                </button>
              ),
            )}
          </div>
          <span className="text-[11.5px] tabular-nums text-bz-text-muted sm:hidden">
            Page {page} / {totalPages}
          </span>

          <PagerBtn disabled={loading || page >= totalPages} onClick={() => onPage(page + 1)} label="Next page">
            <ChevronRight size={15} />
          </PagerBtn>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG (binary yes/no) + TOAST (success / warning / info)
// ════════════════════════════════════════════════════════════════════════════

function ConfirmDialog({
  ticket, onCancel, onConfirm,
}: {
  ticket: Ticket | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  React.useEffect(() => {
    if (!ticket) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ticket, onCancel]);

  if (!ticket) return null;
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center px-4">
      <div onClick={onCancel} className="absolute inset-0 bg-bz-olive/40 backdrop-blur-[1px]" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[400px] rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5 shadow-[0_24px_60px_-24px_rgba(15,20,17,0.35)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-[#FBE5E2] text-[#9A2E29]">
            <Trash2 size={16} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-bz-text">Delete this ticket?</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-bz-text-muted">
              <span className="font-semibold tabular-nums text-bz-text">{ticket.id}</span> — “{ticket.subject}” will be
              permanently removed. This can’t be undone.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onCancel} className={GHOST_BTN}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-[#C0413A] px-3.5 text-[12px] font-semibold text-white hover:opacity-95"
          >
            <Trash2 size={13} /> Delete ticket
          </button>
        </div>
      </div>
    </div>
  );
}

type ToastKind = "success" | "warning" | "info";
type ToastState = { id: number; kind: ToastKind; message: string };

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    const t = window.setTimeout(() => closeRef.current(), 4200);
    return () => window.clearTimeout(t);
  }, [toast.id]);

  const wrap =
    toast.kind === "success" ? "bg-bz-fire/[0.18]" : toast.kind === "warning" ? "bg-[#FBE7E5]" : "bg-bz-paper-warm";
  const icon =
    toast.kind === "success" ? (
      <Check size={13} className="text-bz-leaf-deep" />
    ) : toast.kind === "warning" ? (
      <AlertTriangle size={13} className="text-[#9A2E29]" />
    ) : (
      <ArrowUpRight size={13} className="text-bz-text-muted" />
    );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", wrap)}>{icon}</span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

function Breadcrumb() {
  return (
    <>
      <span className="text-bz-text-muted">Support</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Tickets</span>
    </>
  );
}

export function SupportTicketListDesignPage() {
  // the dataset (mutable so a delete can refresh the list)
  const [tickets, setTickets] = React.useState<Ticket[]>(SEED);
  // composite query state the page owns
  const [sort, setSort] = React.useState<Sort>({ field: "opened", dir: "desc" });
  const [group, setGroup] = React.useState<GroupField | null>(null);
  const [filter, setFilter] = React.useState<Filter>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [nonce, setNonce] = React.useState(0); // manual refresh

  // the "server response" + the in-flight flag
  const [result, setResult] = React.useState<{ rows: Ticket[]; total: number }>({ rows: [], total: 0 });
  const [loading, setLoading] = React.useState(true);

  // view-only / latent state
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [confirm, setConfirm] = React.useState<Ticket | null>(null);
  const [toast, setToast] = React.useState<ToastState | null>(null);
  const toastId = React.useRef(0);
  const notify = (kind: ToastKind, message: string) =>
    setToast({ id: (toastId.current += 1), kind, message });

  // Server-driven re-query: any change to the composite query state — or the
  // dataset after a delete — flips loading on, "fetches" the current slice, and
  // recomputes total + the page window from the response.
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = window.setTimeout(() => {
      if (cancelled) return;
      const matched = tickets.filter((tk) => matchesFilter(tk, filter));
      const total = matched.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      if (page > totalPages) {
        setPage(totalPages); // clamp → re-runs the query for the valid page
        return;
      }
      const ordered = orderRows(matched, sort, group);
      const startIdx = (page - 1) * pageSize;
      setResult({ rows: ordered.slice(startIdx, startIdx + pageSize), total });
      setLoading(false);
    }, 480);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [tickets, sort, group, filter, page, pageSize, nonce]);

  // ── change emitters (the grid hands these back; the page maps them to a query) ──
  const changeSort = (field: SortField) => {
    setSort((s) =>
      s.field === field
        ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
        : { field, dir: field === "opened" || field === "closed" ? "desc" : "asc" },
    );
    setPage(1);
  };
  const changeGroup = (g: GroupField | null) => {
    setGroup(g);
    setPage(1);
    setCollapsed(new Set());
  };
  const applyFilter = (field: "priority" | "category", value: string, label: string) => {
    setFilter({ field, value, label });
    setPage(1);
  };
  const clearFilter = () => {
    setFilter(null);
    setPage(1);
  };
  const changePageSize = (n: number) => {
    setPageSize(n);
    setPage(1);
  };
  const toggleGroup = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // ── navigation hand-offs (leave this surface) — stubbed as toasts here ──
  const openTicket = (t: Ticket) => notify("info", `Opening ${t.id} — “${truncate(t.subject)}”…`);
  const editTicket = (t: Ticket) => notify("info", `Opening ${t.id} in the editor…`);
  const newTicket = () => notify("info", "Opening the new-ticket form…");

  // ── latent delete: confirm → backend → success / warning → refresh ──
  const doDelete = () => {
    const t = confirm;
    if (!t) return;
    setConfirm(null);
    if (!t.closedISO) {
      // backend rejects: an open ticket can't be removed
      notify("warning", `Couldn’t delete ${t.id} — resolve the open ticket first.`);
      return;
    }
    setTickets((prev) => prev.filter((x) => x.id !== t.id)); // refreshes via the fetch effect
    notify("success", `Ticket ${t.id} deleted.`);
  };

  const clusters = group ? clusterRows(result.rows, group) : null;
  const isEmpty = !loading && result.total === 0;

  return (
    <AppShell
      breadcrumb={<Breadcrumb />}
      overlay={
        <>
          <ConfirmDialog ticket={confirm} onCancel={() => setConfirm(null)} onConfirm={doDelete} />
          {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
        </>
      }
    >
      <PageHeader total={result.total} onNew={newTicket} />

      <div className="px-4 pb-8 md:px-8">
        <section className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          <ControlBar
            sort={sort}
            group={group}
            filter={filter}
            loading={loading}
            onSort={changeSort}
            onGroup={changeGroup}
            onClearFilter={clearFilter}
            onRefresh={() => setNonce((n) => n + 1)}
          />

          <div className="relative min-h-[440px]" aria-busy={loading}>
            {isEmpty ? (
              <EmptyState hasFilter={!!filter} onClear={clearFilter} />
            ) : (
              <>
                <TicketTable
                  rows={result.rows}
                  group={group}
                  clusters={clusters}
                  collapsed={collapsed}
                  sort={sort}
                  loading={loading}
                  onSort={changeSort}
                  onToggleGroup={toggleGroup}
                  onOpen={openTicket}
                  onEdit={editTicket}
                  onDelete={(t) => setConfirm(t)}
                  onFilter={applyFilter}
                />
                <TicketCards
                  rows={result.rows}
                  group={group}
                  clusters={clusters}
                  collapsed={collapsed}
                  onToggleGroup={toggleGroup}
                  onOpen={openTicket}
                  onEdit={editTicket}
                  onDelete={(t) => setConfirm(t)}
                />
              </>
            )}
            {loading && <LoadingOverlay />}
          </div>

          <Pager
            page={page}
            pageSize={pageSize}
            total={result.total}
            loading={loading}
            onPage={setPage}
            onPageSize={changePageSize}
          />
        </section>
      </div>
    </AppShell>
  );
}
