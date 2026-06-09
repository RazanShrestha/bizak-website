import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  // chrome
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  MoreHorizontal,
  Loader2,
  Search,
  X,
  Check,
  Info,
  RotateCcw,
  Ban,
  ShieldCheck,
  ShieldOff,
  Layers,
  KeyRound,
  // module icons
  ShoppingCart,
  ShoppingBag,
  Boxes,
  Wallet,
  Users,
  BarChart3,
  Settings,
  // action icons
  Eye,
  Plus,
  Pencil,
  Trash2,
  CircleCheck,
  CircleSlash,
  Printer,
  Download,
  Circle,
  // table chrome
  CheckSquare,
  Square,
  SearchX,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// ROLE & PERMISSION MANAGEMENT  (create / edit an org role + its access)
//
// Primary action = grant / revoke access. So the permission MATRIX is the
// centre of gravity: a quiet role-identity band up top, a module navigator on
// the left, and the live access editor filling the rest. Every toggle
// recomputes the counts and cascades downward — flipping a higher scope on
// turns on everything beneath it (full → module → group → action).
//
// Built in the app design language (AppShell + bz-* tokens), a sibling to the
// Custom-Form builder. State variants present: loading (save spinner),
// no-results (search), empty (nothing selected / row with no actions),
// selected, expanded/collapsed, partial/full.
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// ACTION VOCABULARY  icon + label mapping, and the two text transforms
// ════════════════════════════════════════════════════════════════════════════

type ActionKey =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "reject"
  | "print"
  | "export";

const ACTION_META: Record<
  ActionKey,
  { label: string; Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }
> = {
  view:    { label: "View",    Icon: Eye },
  create:  { label: "Create",  Icon: Plus },
  edit:    { label: "Edit",    Icon: Pencil },
  delete:  { label: "Delete",  Icon: Trash2 },
  approve: { label: "Approve", Icon: CircleCheck },
  reject:  { label: "Reject",  Icon: CircleSlash },
  print:   { label: "Print",   Icon: Printer },
  export:  { label: "Export",  Icon: Download },
};

// Transform 1 — strip the qualifier prefix: "sales_order.create" → "create".
function cleanActionName(raw: string): string {
  return raw.includes(".") ? raw.slice(raw.lastIndexOf(".") + 1) : raw;
}
// Transform 2 — raw permission token → human label / icon (with a default).
function actionLabel(raw: string): string {
  const key = cleanActionName(raw) as ActionKey;
  return ACTION_META[key]?.label ?? cleanActionName(raw);
}
function actionIcon(raw: string) {
  const key = cleanActionName(raw) as ActionKey;
  return ACTION_META[key]?.Icon ?? Circle;
}

// ════════════════════════════════════════════════════════════════════════════
// DATA  module → group → row → actions  (matrix), plus one report-access table
// ════════════════════════════════════════════════════════════════════════════

type Row = { key: string; label: string; actions: ActionKey[] };
type Group = { key: string; label: string; rows: Row[] };
type TableSection = { section: string; rows: { key: string; label: string }[] };

type ModuleBase = {
  key: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};
type MatrixModule = ModuleBase & { kind: "matrix"; groups: Group[] };
type TableModule = ModuleBase & { kind: "table"; sections: TableSection[] };
type Module = MatrixModule | TableModule;

const row = (key: string, label: string, actions: ActionKey[]): Row => ({ key, label, actions });
const grp = (key: string, label: string, rows: Row[]): Group => ({ key, label, rows });

const MODULES: Module[] = [
  {
    key: "sales",
    label: "Sales & CRM",
    desc: "Quotes, orders, invoices and customer records.",
    Icon: ShoppingCart,
    kind: "matrix",
    groups: [
      grp("orders", "Order documents", [
        row("quotation", "Quotation", ["view", "create", "edit", "delete", "approve", "print", "export"]),
        row("sales_order", "Sales Order", ["view", "create", "edit", "delete", "approve", "reject", "print", "export"]),
        row("sales_invoice", "Sales Invoice", ["view", "create", "edit", "print", "export"]),
      ]),
      grp("masters", "Master data", [
        row("customer", "Customer", ["view", "create", "edit", "delete", "export"]),
        row("price_list", "Price List", ["view", "edit"]),
      ]),
      grp("after", "After-sales", [
        row("sales_return", "Sales Return", ["view", "create", "approve", "reject"]),
        row("credit_note", "Credit Note", ["view", "create", "print"]),
      ]),
    ],
  },
  {
    key: "purchasing",
    label: "Purchasing",
    desc: "Purchase orders, bills and supplier management.",
    Icon: ShoppingBag,
    kind: "matrix",
    groups: [
      grp("procurement", "Procurement", [
        row("purchase_order", "Purchase Order", ["view", "create", "edit", "delete", "approve", "reject", "print"]),
        row("purchase_bill", "Purchase Bill", ["view", "create", "edit", "approve", "print", "export"]),
      ]),
      grp("suppliers", "Suppliers", [
        row("supplier", "Supplier", ["view", "create", "edit", "delete", "export"]),
      ]),
    ],
  },
  {
    key: "inventory",
    label: "Inventory",
    desc: "Items, stock movements and warehouse control.",
    Icon: Boxes,
    kind: "matrix",
    groups: [
      grp("catalog", "Catalog", [
        row("item", "Item", ["view", "create", "edit", "delete", "export"]),
        row("category", "Category", ["view", "create", "edit", "delete"]),
      ]),
      grp("moves", "Stock movements", [
        row("transfer", "Transfer Order", ["view", "create", "edit", "approve", "reject"]),
        row("adjustment", "Stock Adjustment", ["view", "create", "approve", "reject"]),
      ]),
    ],
  },
  {
    key: "finance",
    label: "Finance",
    desc: "Journals, payments and period close.",
    Icon: Wallet,
    kind: "matrix",
    groups: [
      grp("ledger", "Ledger", [
        row("journal", "Journal Entry", ["view", "create", "edit", "delete", "approve", "reject"]),
        row("payment", "Payment", ["view", "create", "edit", "approve", "print", "export"]),
      ]),
      grp("close", "Period close", [
        row("reconciliation", "Bank Reconciliation", ["view", "create", "edit", "approve"]),
        // intentional no-action row → exercises the per-row empty state
        row("fiscal_lock", "Fiscal Period Lock", []),
      ]),
    ],
  },
  {
    key: "hr",
    label: "Human Resources",
    desc: "Employees, leave and payroll.",
    Icon: Users,
    kind: "matrix",
    groups: [
      grp("people", "People", [
        row("employee", "Employee", ["view", "create", "edit", "delete", "export"]),
        row("leave", "Leave Request", ["view", "create", "approve", "reject"]),
      ]),
      grp("payroll", "Payroll", [
        row("payslip", "Payslip", ["view", "create", "print", "export"]),
      ]),
    ],
  },
  {
    key: "reports",
    label: "Reports & Analytics",
    desc: "Grant access to individual reports and dashboards.",
    Icon: BarChart3,
    kind: "table",
    sections: [
      {
        section: "Financial",
        rows: [
          { key: "trial_balance", label: "Trial Balance" },
          { key: "balance_sheet", label: "Balance Sheet" },
          { key: "pnl", label: "Profit & Loss" },
          { key: "general_ledger", label: "General Ledger" },
          { key: "cash_flow", label: "Cash Flow Statement" },
        ],
      },
      {
        section: "Sales",
        rows: [
          { key: "sales_register", label: "Sales Register" },
          { key: "customer_aging", label: "Customer Aging" },
          { key: "sales_by_item", label: "Sales by Item" },
          { key: "rep_performance", label: "Rep Performance" },
        ],
      },
      {
        section: "Inventory",
        rows: [
          { key: "stock_summary", label: "Stock Summary" },
          { key: "valuation", label: "Stock Valuation" },
          { key: "reorder", label: "Reorder Report" },
        ],
      },
    ],
  },
  {
    key: "admin",
    label: "Administration",
    desc: "Users, roles and system configuration.",
    Icon: Settings,
    kind: "matrix",
    groups: [
      grp("access", "Access control", [
        row("user", "User", ["view", "create", "edit", "delete"]),
        row("role", "Role", ["view", "create", "edit", "delete"]),
      ]),
      grp("config", "Configuration", [
        row("company", "Company Profile", ["view", "edit"]),
        row("custom_form", "Custom Form", ["view", "create", "edit", "delete"]),
      ]),
    ],
  },
];

// ── permission id helpers + precomputed scope → id lists ───────────────────────
const matrixPerm = (m: string, g: string, r: string, a: ActionKey) => `${m}/${g}/${r}.${a}`;
const tablePerm = (m: string, r: string) => `${m}/@report/${r}`;

const MODULE_PERMS: Record<string, string[]> = {};
const GROUP_PERMS: Record<string, string[]> = {};
const ROW_PERMS: Record<string, string[]> = {};
for (const mod of MODULES) {
  if (mod.kind === "table") {
    MODULE_PERMS[mod.key] = mod.sections.flatMap((s) => s.rows.map((r) => tablePerm(mod.key, r.key)));
  } else {
    const ids: string[] = [];
    for (const g of mod.groups) {
      const gids: string[] = [];
      for (const r of g.rows) {
        const rids = r.actions.map((a) => matrixPerm(mod.key, g.key, r.key, a));
        ROW_PERMS[`${mod.key}/${g.key}/${r.key}`] = rids;
        gids.push(...rids);
      }
      GROUP_PERMS[`${mod.key}/${g.key}`] = gids;
      ids.push(...gids);
    }
    MODULE_PERMS[mod.key] = ids;
  }
}
const ALL_PERMS = Object.values(MODULE_PERMS).flat();
const TOTAL_PERMS = ALL_PERMS.length;

const countIn = (set: Set<string>, ids: string[]) => ids.reduce((n, id) => (set.has(id) ? n + 1 : n), 0);

// believable starting grant set for the seeded role
function buildSeed(): Set<string> {
  const seed = new Set<string>();
  const grantModules = new Set(["sales", "purchasing", "inventory"]);
  for (const mod of MODULES) {
    if (mod.kind === "table") continue;
    for (const g of mod.groups) {
      for (const r of g.rows) {
        for (const a of r.actions) {
          if (a === "view") seed.add(matrixPerm(mod.key, g.key, r.key, a));
          else if ((a === "create" || a === "edit") && grantModules.has(mod.key))
            seed.add(matrixPerm(mod.key, g.key, r.key, a));
          else if (a === "approve" && ["sales_order", "purchase_order", "sales_return"].includes(r.key))
            seed.add(matrixPerm(mod.key, g.key, r.key, a));
        }
      }
    }
  }
  ["trial_balance", "balance_sheet", "pnl", "sales_register", "customer_aging", "stock_summary"].forEach((r) =>
    seed.add(tablePerm("reports", r)),
  );
  return seed;
}

// ── parent-role pool (for the lazy/paginated inherit-from picker) ─────────────
const ROLE_POOL = [
  "Administrator", "Operations Staff", "Sales Executive", "Sales Manager", "Finance Officer",
  "Accountant", "Warehouse Clerk", "Warehouse Manager", "Procurement Officer", "HR Officer",
  "Payroll Admin", "Auditor (read-only)", "Branch Manager", "Regional Director", "Cashier",
  "Store Keeper", "Quality Inspector", "Dispatch Coordinator", "Customer Support", "CRM Specialist",
  "Inventory Analyst", "Tax Consultant", "Compliance Officer", "IT Administrator", "Data Analyst",
  "Front Desk", "Shift Supervisor", "Logistics Lead", "Treasury Officer", "Internal Audit",
  "Vendor Manager", "Service Engineer",
];

// ════════════════════════════════════════════════════════════════════════════
// SMALL UTILITIES
// ════════════════════════════════════════════════════════════════════════════

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  return ref;
}

type Tone = "full" | "partial" | "none";
function ratioTone(granted: number, total: number): Tone {
  if (total === 0 || granted === 0) return "none";
  return granted >= total ? "full" : "partial";
}

// ════════════════════════════════════════════════════════════════════════════
// ATOMS  switch · ratio chip · status pill
// ════════════════════════════════════════════════════════════════════════════

function Switch({
  value,
  onChange,
  size = "sm",
  ariaLabel,
  indeterminate,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
  indeterminate?: boolean;
}) {
  const dims = size === "md" ? "h-5 w-9" : "h-[18px] w-8";
  const knob = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  const on = value;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-bz-pill border transition-colors",
        dims,
        on
          ? "border-bz-fire bg-bz-fire"
          : indeterminate
          ? "border-bz-leaf-deep bg-bz-leaf/60"
          : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          knob,
          on
            ? size === "md" ? "translate-x-[18px]" : "translate-x-[14px]"
            : indeterminate ? "translate-x-[8px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

function RatioChip({ granted, total }: { granted: number; total: number }) {
  const tone = ratioTone(granted, total);
  const cls =
    tone === "full"
      ? "bg-bz-fire/[0.18] text-bz-text"
      : tone === "partial"
      ? "bg-bz-leaf/50 text-bz-text"
      : "bg-bz-paper-warm text-bz-text-soft";
  return (
    <span className={cn("inline-flex items-center rounded-bz-pill px-2 py-0.5 text-[10.5px] font-semibold tabular-nums", cls)}>
      {granted}/{total}
    </span>
  );
}

function ScopeStatePill({ granted, total }: { granted: number; total: number }) {
  const tone = ratioTone(granted, total);
  const label = tone === "full" ? "Full access" : tone === "partial" ? "Partial access" : "No access";
  const dot = tone === "full" ? "bg-bz-leaf-deep" : tone === "partial" ? "bg-bz-fire" : "bg-bz-text-soft";
  const bg =
    tone === "full"
      ? "bg-bz-fire/[0.18] text-bz-text"
      : tone === "partial"
      ? "bg-bz-leaf/50 text-bz-text"
      : "bg-bz-paper-warm text-bz-text-muted";
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-pill px-2.5 py-1 text-[11px] font-semibold", bg)}>
      <span className={cn("size-1.5 rounded-bz-pill", dot)} />
      {label}
      <span className="tabular-nums text-bz-text-muted">· {granted}/{total}</span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PARENT-ROLE PICKER  searchable · paginated · lazy-loading (optional)
// ════════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 7;

function ParentRolePicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-bz-md border px-2.5 text-[11.5px] transition-colors",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        )}
      >
        <Layers size={12} className="text-bz-text-muted" />
        <span className="text-bz-text-soft">Inherits from</span>
        <span className="font-semibold text-bz-text">{value ?? "None"}</span>
        <ChevronDown size={11} className={cn("text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      <ParentRoleDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)} value={value} onChange={onChange} />
    </>
  );
}

function ParentRoleDropdown({
  anchorRef,
  open,
  onClose,
  value,
  onChange,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  // position under anchor
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    setRaw("");
    setQuery("");
    setPages(1);
  }, [open, anchorRef]);

  // debounced search → resets pagination
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setQuery(raw.trim().toLowerCase());
      setPages(1);
    }, 250);
    return () => window.clearTimeout(t);
  }, [raw]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  const filtered = query ? ROLE_POOL.filter((r) => r.toLowerCase().includes(query)) : ROLE_POOL;
  const visible = filtered.slice(0, pages * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  // lazy load next page on scroll-to-bottom
  const onScroll = () => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setLoading(true);
      window.setTimeout(() => {
        setPages((p) => p + 1);
        setLoading(false);
      }, 450);
    }
  };

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 260) }}
      className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
    >
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
          <Search size={11} className="shrink-0 text-bz-text-muted" />
          <input
            autoFocus
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Search roles to inherit…"
            className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {raw && (
            <button onClick={() => setRaw("")} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface">
              <X size={10} />
            </button>
          )}
        </div>
      </div>
      <div ref={listRef} onScroll={onScroll} className="max-h-[248px] overflow-y-auto py-1">
        <button
          onClick={() => { onChange(null); onClose(); }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm"
        >
          <span className="flex size-5 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted">
            <ShieldOff size={11} />
          </span>
          <span className="flex-1 text-[12.5px] text-bz-text">No inheritance</span>
          {value === null && <Check size={12} className="text-bz-text" />}
        </button>
        <div className="my-1 h-px bg-bz-line-soft" />
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-[11.5px] text-bz-text-muted">No roles match “{raw}”.</p>
        ) : (
          visible.map((r) => {
            const selected = r === value;
            return (
              <button
                key={r}
                onClick={() => { onChange(r); onClose(); }}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}
              >
                <span className="flex size-5 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-[9px] font-bold text-bz-text-muted">
                  {r.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <span className="flex-1 truncate text-[12.5px] text-bz-text">{r}</span>
                {selected && <Check size={12} className="shrink-0 text-bz-text" />}
              </button>
            );
          })
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-3 text-bz-text-muted">
            <Loader2 size={12} className="animate-spin text-bz-fire" />
            <span className="text-[11px]">Loading more…</span>
          </div>
        )}
        {!loading && !hasMore && visible.length > 0 && (
          <p className="px-3 py-2 text-center text-[10.5px] text-bz-text-soft">
            {filtered.length} role{filtered.length === 1 ? "" : "s"} · end of list
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER  identity band — eyebrow · role name · active · inherit · actions · metrics
// ════════════════════════════════════════════════════════════════════════════

function IdentityHeader({
  roleName,
  setRoleName,
  active,
  setActive,
  parent,
  setParent,
  saving,
  dirty,
  visible,
  total,
  granted,
  onSave,
  onReset,
  onRevokeAll,
}: {
  roleName: string;
  setRoleName: (v: string) => void;
  active: boolean;
  setActive: (v: boolean) => void;
  parent: string | null;
  setParent: (v: string | null) => void;
  saving: boolean;
  dirty: boolean;
  visible: number;
  total: number;
  granted: number;
  onSave: () => void;
  onReset: () => void;
  onRevokeAll: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="border-b border-bz-line bg-bz-paper px-4 pb-5 pt-5 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* identity */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-bz-sm bg-bz-deep text-bz-paper">
              <KeyRound size={11} strokeWidth={2} />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">Role &amp; permissions</p>
          </div>

          {/* required, inline-editable role name */}
          <div className="mt-2 flex items-center gap-1">
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Untitled role"
              aria-label="Role name"
              className={cn(
                "min-w-0 max-w-full rounded-bz-md border border-transparent bg-transparent px-1 py-0.5 text-[24px] font-semibold tracking-tight text-bz-text outline-none transition-colors",
                "hover:border-bz-line-soft focus:border-bz-text focus:bg-bz-surface",
                !roleName.trim() && "border-[#C0413A]/60",
              )}
              style={{ width: `${Math.max(12, roleName.length + 1)}ch` }}
            />
            <span className="text-[16px] text-bz-fire" title="Required">*</span>
          </div>
          {!roleName.trim() && (
            <p className="mt-1 text-[11px] font-medium text-[#9A2E29]">A role name is required.</p>
          )}

          {/* active + inherit-from */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="inline-flex items-center gap-2">
              <Switch value={active} onChange={setActive} size="md" ariaLabel="Role active" />
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-bz-pill px-2 py-0.5 text-[11px] font-semibold",
                  active ? "bg-bz-fire/[0.18] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted",
                )}
              >
                <span className={cn("size-1.5 rounded-bz-pill", active ? "bg-bz-leaf-deep" : "bg-bz-text-soft")} />
                {active ? "Active" : "Inactive"}
              </span>
            </div>
            <span className="hidden h-4 w-px bg-bz-line-soft sm:block" />
            <ParentRolePicker value={parent} onChange={setParent} />
          </div>
        </div>

        {/* action cluster + live metrics */}
        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(-1)}
              title="Back"
              aria-label="Back"
              className="flex size-9 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              onClick={onSave}
              disabled={saving || !roleName.trim()}
              title="Save role"
              className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? "Saving…" : "Save role"}
            </button>
            <OverflowMenu onReset={onReset} onRevokeAll={onRevokeAll} />
          </div>

          <MetricStrip visible={visible} total={total} granted={granted} dirty={dirty} saving={saving} />
        </div>
      </div>
    </div>
  );
}

function OverflowMenu({ onReset, onRevokeAll }: { onReset: () => void; onRevokeAll: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="More actions"
        aria-label="More actions"
        className={cn(
          "flex size-9 items-center justify-center rounded-bz-md border text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface",
        )}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-[42px] z-30 w-56 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <button
            onClick={() => { setOpen(false); onReset(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm"
          >
            <RotateCcw size={13} className="text-bz-text-muted" />
            <span className="text-[12px] font-medium text-bz-text">Reset to last saved</span>
          </button>
          <div className="my-1 h-px bg-bz-line-soft" />
          <button
            onClick={() => { setOpen(false); onRevokeAll(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FBE7E5]"
          >
            <Ban size={13} className="text-[#9A2E29]" />
            <span className="text-[12px] font-medium text-[#9A2E29]">Revoke all access</span>
          </button>
        </div>
      )}
    </div>
  );
}

function MetricStrip({
  visible, total, granted, dirty, saving,
}: { visible: number; total: number; granted: number; dirty: boolean; saving: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Metric label="Modules" value={`${visible}/${MODULES.length}`} hint="in view" />
      <Metric label="Permissions" value={total.toLocaleString()} />
      <Metric label="Granted" value={granted.toLocaleString()} accent />
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-bz-md border px-2.5 py-1 text-[11px] font-medium",
          saving
            ? "border-bz-line-soft bg-bz-surface text-bz-text-muted"
            : dirty
            ? "border-bz-fire/40 bg-bz-fire/[0.10] text-bz-text"
            : "border-bz-line-soft bg-bz-surface text-bz-text-muted",
        )}
      >
        {saving ? (
          <><Loader2 size={11} className="animate-spin" /> Saving</>
        ) : dirty ? (
          <><span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Unsaved</>
        ) : (
          <><Check size={11} className="text-bz-leaf-deep" /> Saved</>
        )}
      </span>
    </div>
  );
}

function Metric({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="inline-flex items-baseline gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-1">
      <span className={cn("text-[13px] font-semibold tabular-nums", accent ? "text-bz-text" : "text-bz-text")}>{value}</span>
      <span className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">{label}</span>
      {hint && <span className="text-[10px] text-bz-text-soft">· {hint}</span>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NAVIGATOR  full-access switch · search · module list · help note
// ════════════════════════════════════════════════════════════════════════════

function Navigator({
  modules,
  search,
  setSearch,
  selectedKey,
  onSelect,
  granted,
  allGranted,
  onToggleAll,
}: {
  modules: Module[];
  search: string;
  setSearch: (v: string) => void;
  selectedKey: string;
  onSelect: (k: string) => void;
  granted: Set<string>;
  allGranted: boolean;
  onToggleAll: (v: boolean) => void;
}) {
  const grantedAll = countIn(granted, ALL_PERMS);
  return (
    <aside className="flex flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface lg:sticky lg:top-4 lg:max-h-[calc(100vh-12rem)]">
      {/* full-access master switch */}
      <div className="flex items-center gap-3 border-b border-bz-line-soft bg-bz-paper-warm/50 px-4 py-3">
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-bz-md", allGranted ? "bg-bz-fire text-bz-olive" : "bg-bz-surface text-bz-text-muted")}>
          <ShieldCheck size={15} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-bz-text">Full access</p>
          <p className="text-[10.5px] text-bz-text-muted">Grant or revoke everything at once</p>
        </div>
        <Switch
          value={allGranted}
          indeterminate={!allGranted && grantedAll > 0}
          onChange={onToggleAll}
          ariaLabel="Grant full access"
        />
      </div>

      {/* search */}
      <div className="border-b border-bz-line-soft p-2.5">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter modules, menus, actions…"
            className="h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-paper py-2 pl-8 pr-8 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear filter"
              className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* module list */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
              <SearchX size={16} />
            </span>
            <p className="text-[12.5px] font-semibold text-bz-text">No modules match</p>
            <p className="max-w-[200px] text-[11px] text-bz-text-muted">Nothing matches “{search}”. Try a different term.</p>
            <button onClick={() => setSearch("")} className="mt-1 text-[11.5px] font-medium text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline">
              Clear filter
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {modules.map((m) => (
              <ModuleRow
                key={m.key}
                module={m}
                selected={m.key === selectedKey}
                granted={countIn(granted, MODULE_PERMS[m.key])}
                total={MODULE_PERMS[m.key].length}
                onSelect={() => onSelect(m.key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* contextual help note */}
      <div className="border-t border-bz-line-soft p-3">
        <div className="flex gap-2.5 rounded-bz-md bg-bz-paper-warm/60 p-3">
          <Info size={13} className="mt-0.5 shrink-0 text-bz-text-muted" />
          <p className="text-[10.5px] leading-relaxed text-bz-text-muted">
            Turning on a module, group, or full access cascades to every action beneath it. Pick a module to fine-tune individual actions.
          </p>
        </div>
      </div>
    </aside>
  );
}

function ModuleRow({
  module,
  selected,
  granted,
  total,
  onSelect,
}: {
  module: Module;
  selected: boolean;
  granted: number;
  total: number;
  onSelect: () => void;
}) {
  const Icon = module.Icon;
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex items-center gap-3 rounded-bz-md border py-2.5 pl-3 pr-2.5 text-left transition-colors",
        selected
          ? "border-bz-text bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.06)]"
          : "border-transparent hover:border-bz-line-soft hover:bg-bz-paper-warm/50",
      )}
    >
      <span
        className={cn("absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-bz-pill bg-bz-fire transition-opacity", selected ? "opacity-100" : "opacity-0")}
        aria-hidden
      />
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-bz-md", selected ? "bg-bz-deep text-bz-paper" : "bg-bz-paper-warm text-bz-text-muted group-hover:text-bz-text")}>
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-bz-text">{module.label}</p>
        <p className="truncate text-[10.5px] text-bz-text-muted">
          {module.kind === "table" ? "Report access" : `${module.groups.length} groups`}
        </p>
      </div>
      <RatioChip granted={granted} total={total} />
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DETAIL — empty placeholder
// ════════════════════════════════════════════════════════════════════════════

function DetailPlaceholder() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-lg bg-bz-paper-warm text-bz-text-muted">
        <KeyRound size={20} strokeWidth={1.6} />
      </span>
      <p className="mt-4 text-[15px] font-semibold text-bz-text">Pick a module to configure</p>
      <p className="mt-1.5 max-w-[320px] text-[12.5px] leading-relaxed text-bz-text-muted">
        Select a module on the left to grant or revoke its actions. Use the search above to jump straight to a menu or an action.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DETAIL — header with scope-level bulk controls
// ════════════════════════════════════════════════════════════════════════════

function DetailHeader({
  module,
  granted,
  total,
  onGrantAll,
  onRevokeAll,
}: {
  module: Module;
  granted: number;
  total: number;
  onGrantAll: () => void;
  onRevokeAll: () => void;
}) {
  const Icon = module.Icon;
  return (
    <div className="flex flex-col gap-3 border-b border-bz-line-soft bg-bz-paper-warm/30 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper">
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[16px] font-semibold tracking-tight text-bz-text">{module.label}</h2>
          <p className="truncate text-[12px] text-bz-text-muted">{module.desc}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <ScopeStatePill granted={granted} total={total} />
        <div className="inline-flex overflow-hidden rounded-bz-md border border-bz-line-soft">
          <button
            onClick={onGrantAll}
            disabled={granted >= total}
            className="inline-flex h-8 items-center gap-1.5 bg-bz-surface px-2.5 text-[11.5px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-40"
          >
            <CircleCheck size={12} className="text-bz-leaf-deep" /> Grant all
          </button>
          <span className="w-px self-stretch bg-bz-line-soft" />
          <button
            onClick={onRevokeAll}
            disabled={granted === 0}
            className="inline-flex h-8 items-center gap-1.5 bg-bz-surface px-2.5 text-[11.5px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-40"
          >
            <CircleSlash size={12} className="text-bz-text-muted" /> Revoke all
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DETAIL — per-action toggle + permission row + collapsible group  (matrix)
// ════════════════════════════════════════════════════════════════════════════

function ActionToggle({
  rawToken,
  on,
  onToggle,
}: {
  rawToken: string; // e.g. "sales_order.create" — exercises the cleanup transform
  on: boolean;
  onToggle: () => void;
}) {
  const Icon = actionIcon(rawToken);
  const label = actionLabel(rawToken);
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-bz-md border px-2.5 text-[11.5px] font-medium transition-colors",
        on
          ? "border-bz-fire bg-bz-fire text-bz-olive"
          : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-bz-line hover:text-bz-text",
      )}
    >
      <Icon size={12} strokeWidth={2} />
      {label}
    </button>
  );
}

function PermissionRow({
  moduleKey,
  groupKey,
  row,
  granted,
  onToggleAction,
}: {
  moduleKey: string;
  groupKey: string;
  row: Row;
  granted: Set<string>;
  onToggleAction: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-bz-line-soft px-4 py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-bz-text">{row.label}</p>
        <p className="text-[10.5px] tabular-nums text-bz-text-soft">{moduleKey}.{row.key}</p>
      </div>
      {row.actions.length === 0 ? (
        <span className="inline-flex items-center gap-1.5 rounded-bz-md bg-bz-paper-warm px-2.5 py-1 text-[11px] text-bz-text-soft">
          <CircleSlash size={11} /> No actions available
        </span>
      ) : (
        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          {row.actions.map((a) => {
            const id = matrixPerm(moduleKey, groupKey, row.key, a);
            return (
              <ActionToggle
                key={a}
                rawToken={`${row.key}.${a}`}
                on={granted.has(id)}
                onToggle={() => onToggleAction(id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function PermissionGroup({
  moduleKey,
  group,
  granted,
  expanded,
  onToggleExpand,
  onToggleAction,
  onSetGroup,
}: {
  moduleKey: string;
  group: Group;
  granted: Set<string>;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleAction: (id: string) => void;
  onSetGroup: (on: boolean) => void;
}) {
  const gids = GROUP_PERMS[`${moduleKey}/${group.key}`];
  const g = countIn(granted, gids);
  const total = gids.length;
  const full = total > 0 && g >= total;
  return (
    <section className="overflow-hidden rounded-bz-md border border-bz-line-soft">
      <div className={cn("flex items-center gap-2 px-3 py-2.5 transition-colors", expanded ? "bg-bz-paper-warm/50" : "bg-bz-surface hover:bg-bz-paper-warm/30")}>
        <button onClick={onToggleExpand} aria-expanded={expanded} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <ChevronDown size={14} className={cn("shrink-0 text-bz-text-muted transition-transform", expanded ? "" : "-rotate-90")} />
          <span className="truncate text-[12.5px] font-semibold text-bz-text">{group.label}</span>
          <span className="shrink-0 rounded-bz-pill bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-bz-text-muted">
            {group.rows.length} {group.rows.length === 1 ? "item" : "items"}
          </span>
          <RatioChip granted={g} total={total} />
        </button>
        <div className="flex shrink-0 items-center gap-2 pl-1">
          <span className="hidden text-[10px] uppercase tracking-[0.05em] text-bz-text-soft sm:inline">All</span>
          <Switch value={full} indeterminate={!full && g > 0} onChange={onSetGroup} ariaLabel={`Grant all in ${group.label}`} />
        </div>
      </div>
      {expanded && (
        <div className="bg-bz-surface">
          {group.rows.map((r) => (
            <PermissionRow
              key={r.key}
              moduleKey={moduleKey}
              groupKey={group.key}
              row={r}
              granted={granted}
              onToggleAction={onToggleAction}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MatrixDetail({
  module,
  granted,
  expanded,
  onToggleExpand,
  onToggleAction,
  onSetGroup,
}: {
  module: MatrixModule;
  granted: Set<string>;
  expanded: Set<string>;
  onToggleExpand: (groupKey: string) => void;
  onToggleAction: (id: string) => void;
  onSetGroup: (groupKey: string, on: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 p-4 md:p-5">
      {module.groups.map((g) => (
        <PermissionGroup
          key={g.key}
          moduleKey={module.key}
          group={g}
          granted={granted}
          expanded={expanded.has(`${module.key}/${g.key}`)}
          onToggleExpand={() => onToggleExpand(g.key)}
          onToggleAction={onToggleAction}
          onSetGroup={(on) => onSetGroup(g.key, on)}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DETAIL — advanced data table (conditional, only for the report module)
// ════════════════════════════════════════════════════════════════════════════

function ReportTable({
  module,
  granted,
  onToggleRow,
  onSetRows,
}: {
  module: TableModule;
  granted: Set<string>;
  onToggleRow: (id: string) => void;
  onSetRows: (ids: string[], on: boolean) => void;
}) {
  const [q, setQ] = React.useState("");
  const query = q.trim().toLowerCase();

  const sections = module.sections
    .map((s) => ({
      ...s,
      rows: s.rows.filter((r) => !query || r.label.toLowerCase().includes(query) || s.section.toLowerCase().includes(query)),
    }))
    .filter((s) => s.rows.length > 0);

  const visibleIds = sections.flatMap((s) => s.rows.map((r) => tablePerm(module.key, r.key)));
  const allVisibleOn = visibleIds.length > 0 && visibleIds.every((id) => granted.has(id));
  const noData = module.sections.every((s) => s.rows.length === 0);

  return (
    <div className="p-4 md:p-5">
      {/* table toolbar: search + select-all */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1" style={{ maxWidth: 320 }}>
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reports…"
            disabled={noData}
            className="h-8 w-full rounded-bz-md border border-bz-line-soft bg-bz-paper py-1.5 pl-8 pr-7 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text disabled:opacity-50"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-2 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
              <X size={10} />
            </button>
          )}
        </div>
        <button
          onClick={() => onSetRows(visibleIds, !allVisibleOn)}
          disabled={visibleIds.length === 0}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-40"
        >
          {allVisibleOn ? <Square size={12} className="text-bz-text-muted" /> : <CheckSquare size={12} className="text-bz-leaf-deep" />}
          {allVisibleOn ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* grouped rows */}
      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/30 py-12 text-center">
          <SearchX size={18} className="text-bz-text-soft" />
          <p className="text-[12.5px] font-medium text-bz-text-muted">{noData ? "No reports available" : `No reports match “${q}”`}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          {sections.map((s) => {
            const secIds = s.rows.map((r) => tablePerm(module.key, r.key));
            const on = countIn(granted, secIds);
            return (
              <div key={s.section} className="border-b border-bz-line-soft last:border-b-0">
                <div className="flex items-center justify-between gap-2 bg-bz-paper-warm/60 px-4 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-muted">{s.section}</span>
                  <RatioChip granted={on} total={secIds.length} />
                </div>
                {s.rows.map((r) => {
                  const id = tablePerm(module.key, r.key);
                  const isOn = granted.has(id);
                  return (
                    <div
                      key={r.key}
                      className={cn(
                        "flex items-center justify-between gap-3 border-t border-bz-line-soft px-4 py-2.5 transition-colors first:border-t-0",
                        isOn ? "bg-bz-fire/[0.05]" : "bg-bz-surface",
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className={cn("size-1.5 shrink-0 rounded-bz-pill", isOn ? "bg-bz-leaf-deep" : "bg-bz-line")} />
                        <span className="truncate text-[12.5px] text-bz-text">{r.label}</span>
                      </div>
                      <Switch value={isOn} onChange={() => onToggleRow(id)} ariaLabel={`Access ${r.label}`} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PERSISTENT ACTION FOOTER  (docked — content scrolls above it)
// ════════════════════════════════════════════════════════════════════════════

function ActionFooter({
  saving,
  dirty,
  granted,
  users,
  canSave,
  onDiscard,
  onSave,
}: {
  saving: boolean;
  dirty: boolean;
  granted: number;
  users: number;
  canSave: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <p className="flex min-w-0 items-center gap-2 text-[11.5px] text-bz-text-muted">
        {saving ? (
          <><Loader2 size={12} className="shrink-0 animate-spin text-bz-fire" /> Saving the role…</>
        ) : dirty ? (
          <><span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" /> <span className="truncate">Unsaved changes · <span className="tabular-nums text-bz-text">{granted}</span> permissions granted</span></>
        ) : (
          <><ShieldCheck size={12} className="shrink-0 text-bz-leaf-deep" /> <span className="truncate">All changes saved · applies to <span className="tabular-nums text-bz-text">{users}</span> users in this role</span></>
        )}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onDiscard}
          disabled={!dirty || saving}
          className="inline-flex h-8 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={!canSave || saving}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Save role
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
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4">
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
// ROOT
// ════════════════════════════════════════════════════════════════════════════

const USERS_IN_ROLE = 14;

export function RolePermissionDesignPage() {
  // role identity
  const [roleName, setRoleName] = React.useState("Branch Operations Manager");
  const [active, setActive] = React.useState(true);
  const [parent, setParent] = React.useState<string | null>("Operations Staff");

  // permission set
  const seedRef = React.useRef<Set<string>>(buildSeed());
  const [granted, setGranted] = React.useState<Set<string>>(() => new Set(seedRef.current));
  const [savedSnapshot, setSavedSnapshot] = React.useState<Set<string>>(() => new Set(seedRef.current));

  // navigation / view
  const [search, setSearch] = React.useState("");
  const [selectedKey, setSelectedKey] = React.useState<string>(MODULES[0].key);
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set([`${MODULES[0].key}/${(MODULES[0] as MatrixModule).groups[0].key}`]));

  // flow
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const showToast = (kind: "success" | "error", message: string) =>
    setToast({ kind, message, id: ++toastId.current });

  // derived
  const query = search.trim().toLowerCase();
  const visibleModules = React.useMemo(() => MODULES.filter((m) => moduleMatches(m, query)), [query]);
  const grantedCount = granted.size;
  const selectedModule = MODULES.find((m) => m.key === selectedKey) ?? null;

  // first group auto-expands when a module is selected
  const selectModule = (key: string) => {
    setSelectedKey(key);
    const mod = MODULES.find((m) => m.key === key);
    if (mod && mod.kind === "matrix") {
      setExpanded(new Set([`${key}/${mod.groups[0].key}`]));
    }
  };

  // mutation helpers (cascading)
  const apply = (mutate: (s: Set<string>) => void) => {
    setGranted((prev) => {
      const next = new Set(prev);
      mutate(next);
      return next;
    });
    setDirty(true);
  };
  const setMany = (ids: string[], on: boolean) =>
    apply((s) => ids.forEach((id) => (on ? s.add(id) : s.delete(id))));
  const toggleOne = (id: string) =>
    apply((s) => (s.has(id) ? s.delete(id) : s.add(id)));

  const toggleExpand = (groupKey: string) => {
    const id = `${selectedKey}/${groupKey}`;
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // flow handlers
  const handleSave = React.useCallback(() => {
    if (saving || !roleName.trim()) {
      if (!roleName.trim()) showToast("error", "Add a role name before saving.");
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setDirty(false);
      setSavedSnapshot(new Set(granted));
      showToast("success", `“${roleName.trim()}” saved · ${granted.size} permissions`);
    }, 850);
  }, [saving, roleName, granted]);

  const handleDiscard = () => {
    setGranted(new Set(savedSnapshot));
    setDirty(false);
    showToast("success", "Reverted to the last saved state.");
  };

  // Cmd/Ctrl+S to save
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSave]);

  const allGranted = grantedCount >= TOTAL_PERMS;
  const moduleGranted = selectedModule ? countIn(granted, MODULE_PERMS[selectedModule.key]) : 0;
  const moduleTotal = selectedModule ? MODULE_PERMS[selectedModule.key].length : 0;

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Administration</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Roles &amp; Permissions</span>
        </>
      }
      overlay={
        <>
          <ActionFooter
            saving={saving}
            dirty={dirty}
            granted={grantedCount}
            users={USERS_IN_ROLE}
            canSave={!!roleName.trim() && dirty}
            onDiscard={handleDiscard}
            onSave={handleSave}
          />
          <Toast toast={toast} onDismiss={() => setToast(null)} />
        </>
      }
    >
      <IdentityHeader
        roleName={roleName}
        setRoleName={(v) => { setRoleName(v); setDirty(true); }}
        active={active}
        setActive={(v) => { setActive(v); setDirty(true); }}
        parent={parent}
        setParent={(v) => { setParent(v); setDirty(true); }}
        saving={saving}
        dirty={dirty}
        visible={visibleModules.length}
        total={TOTAL_PERMS}
        granted={grantedCount}
        onSave={handleSave}
        onReset={handleDiscard}
        onRevokeAll={() => { setMany(ALL_PERMS, false); showToast("success", "All access revoked."); }}
      />

      <div className="grid grid-cols-1 gap-5 px-4 pb-10 pt-5 md:px-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[368px_minmax(0,1fr)]">
        {/* navigator */}
        <Navigator
          modules={visibleModules}
          search={search}
          setSearch={setSearch}
          selectedKey={selectedKey}
          onSelect={selectModule}
          granted={granted}
          allGranted={allGranted}
          onToggleAll={(v) => setMany(ALL_PERMS, v)}
        />

        {/* detail / editor */}
        <div className="min-w-0">
          {!selectedModule ? (
            <DetailPlaceholder />
          ) : (
            <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
              <DetailHeader
                module={selectedModule}
                granted={moduleGranted}
                total={moduleTotal}
                onGrantAll={() => setMany(MODULE_PERMS[selectedModule.key], true)}
                onRevokeAll={() => setMany(MODULE_PERMS[selectedModule.key], false)}
              />
              {selectedModule.kind === "matrix" ? (
                <MatrixDetail
                  module={selectedModule}
                  granted={granted}
                  expanded={expanded}
                  onToggleExpand={toggleExpand}
                  onToggleAction={toggleOne}
                  onSetGroup={(groupKey, on) => setMany(GROUP_PERMS[`${selectedModule.key}/${groupKey}`], on)}
                />
              ) : (
                <ReportTable
                  module={selectedModule}
                  granted={granted}
                  onToggleRow={toggleOne}
                  onSetRows={setMany}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// multi-depth, case-insensitive search across module / group / row labels
function moduleMatches(mod: Module, q: string): boolean {
  if (!q) return true;
  const hay: string[] = [mod.label, mod.desc];
  if (mod.kind === "table") {
    mod.sections.forEach((s) => {
      hay.push(s.section);
      s.rows.forEach((r) => hay.push(r.label));
    });
  } else {
    mod.groups.forEach((g) => {
      hay.push(g.label);
      g.rows.forEach((r) => {
        hay.push(r.label);
        r.actions.forEach((a) => hay.push(ACTION_META[a].label));
      });
    });
  }
  return hay.some((h) => h.toLowerCase().includes(q));
}
