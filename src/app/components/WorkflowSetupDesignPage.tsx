import * as React from "react";
import { createPortal } from "react-dom";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";
import {
  Workflow,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Plus,
  Trash2,
  Check,
  Loader2,
  MoreHorizontal,
  SlidersHorizontal,
  RotateCcw,
  Pencil,
  Info,
  AlertCircle,
  ArrowRight,
  Layers,
  GitBranch,
  Inbox,
  SearchX,
  Bell,
  CornerDownRight,
  Tag,
} from "lucide-react";

// ════════════════════════════════════════════════════════════════════════════
// WORKFLOW SETUP  ·  one console for the whole workflow domain
//
// The legacy product split this across five screens — a workflow list, a
// workflow editor, a state list, a state editor and an action list/editor.
// This page folds all of it into ONE feature with a top object-switcher:
//
//   Workflows · States · Actions
//
// Primary action = AUTHORING a workflow (its states + transitions). So
// "Workflows" is the default and the only object that earns a master-detail
// (list rail ⇄ editor). The two catalogs collapse their list + editor into a
// single inline-editable surface — the rows ARE the list, you edit any of them,
// add / remove, and commit the whole set in one save.
//
// Everything is genuinely live: the two collection editors stream their full
// contents into the draft on every change; picking the entity type re-drives
// the transition field options (cascade); from/next state pickers derive their
// options from the states you've defined; one commit assembles the whole thing.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA
// ════════════════════════════════════════════════════════════════════════════

type Opt = { value: string; label: string; sub?: string; meta?: string };

// Entity types a workflow can bind to. Selecting one re-drives the field picker.
const ENTITIES: Opt[] = [
  { value: "sales_invoice", label: "Sales Invoice", meta: "SI" },
  { value: "purchase_order", label: "Purchase Order", meta: "PO" },
  { value: "sales_order", label: "Sales Order", meta: "SO" },
  { value: "expense_claim", label: "Expense Claim", meta: "EXP" },
  { value: "journal_entry", label: "Journal Entry", meta: "JE" },
  { value: "payment_entry", label: "Payment Entry", meta: "PE" },
  { value: "leave_application", label: "Leave Application", meta: "LV" },
  { value: "material_request", label: "Material Request", meta: "MR" },
];
const entityLabel = (v: string | null) =>
  ENTITIES.find((e) => e.value === v)?.label ?? "—";

// The cascade: which fields a transition can stamp, per entity type.
const FIELDS_BY_ENTITY: Record<string, Opt[]> = {
  sales_invoice: [
    { value: "status", label: "Status" },
    { value: "approval_status", label: "Approval Status" },
    { value: "remarks", label: "Remarks" },
    { value: "hold_reason", label: "Hold Reason" },
    { value: "credit_check", label: "Credit Check" },
  ],
  purchase_order: [
    { value: "status", label: "Status" },
    { value: "approval_status", label: "Approval Status" },
    { value: "supplier_note", label: "Supplier Note" },
    { value: "priority", label: "Priority" },
  ],
  sales_order: [
    { value: "status", label: "Status" },
    { value: "delivery_status", label: "Delivery Status" },
    { value: "remarks", label: "Remarks" },
  ],
  expense_claim: [
    { value: "status", label: "Status" },
    { value: "approval_status", label: "Approval Status" },
    { value: "reimburse_to", label: "Reimburse To" },
    { value: "reviewer_note", label: "Reviewer Note" },
  ],
  journal_entry: [
    { value: "status", label: "Status" },
    { value: "review_note", label: "Review Note" },
  ],
  payment_entry: [
    { value: "status", label: "Status" },
    { value: "clearance_date", label: "Clearance Date" },
    { value: "remarks", label: "Remarks" },
  ],
  leave_application: [
    { value: "status", label: "Status" },
    { value: "approver_note", label: "Approver Note" },
  ],
  material_request: [
    { value: "status", label: "Status" },
    { value: "warehouse", label: "Target Warehouse" },
    { value: "priority", label: "Priority" },
  ],
};

const ROLES: Opt[] = [
  { value: "administrator", label: "Administrator" },
  { value: "accounts_manager", label: "Accounts Manager" },
  { value: "accounts_user", label: "Accounts User" },
  { value: "sales_manager", label: "Sales Manager" },
  { value: "purchase_manager", label: "Purchase Manager" },
  { value: "finance_head", label: "Finance Head" },
  { value: "store_keeper", label: "Store Keeper" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "approver_l1", label: "Approver · Level 1" },
  { value: "approver_l2", label: "Approver · Level 2" },
];

const USERS: Opt[] = [
  { value: "manas", label: "Manas Singh", sub: "manas@bizak.com" },
  { value: "sita", label: "Sita Sharma", sub: "sita@bizak.com" },
  { value: "ramesh", label: "Ramesh Thapa", sub: "ramesh@bizak.com" },
  { value: "anita", label: "Anita Gurung", sub: "anita@bizak.com" },
  { value: "bikash", label: "Bikash Rai", sub: "bikash@bizak.com" },
  { value: "puja", label: "Puja Karki", sub: "puja@bizak.com" },
];

const CHANNELS: Opt[] = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "in_app", label: "In-app" },
  { value: "webhook", label: "Webhook" },
  { value: "none", label: "No notification" },
];

const RELEASE_STATUS: Opt[] = [
  { value: "draft", label: "Draft" },
  { value: "released", label: "Released" },
  { value: "deprecated", label: "Deprecated" },
];

// Document-lifecycle stages — the enumerated set the inline help note decodes.
const LIFECYCLE_STAGES: Opt[] = [
  { value: "0", label: "Draft", sub: "Editable · not posted" },
  { value: "1", label: "Submitted", sub: "Posted to ledger" },
  { value: "2", label: "Cancelled", sub: "Reversed" },
];
const stageLabel = (v: string | null) =>
  LIFECYCLE_STAGES.find((s) => s.value === v)?.label ?? "—";

// Display-style catalog for actions (the legacy "css" token). Preview chips use
// only sanctioned palette tokens + the danger literals.
type ActionStyle = { value: string; label: string; chip: string };
const ACTION_STYLES: ActionStyle[] = [
  { value: "primary", label: "Primary", chip: "bg-bz-deep text-bz-text-on-dark" },
  { value: "success", label: "Success", chip: "bg-bz-fire text-bz-olive" },
  { value: "info", label: "Info", chip: "bg-bz-olive text-bz-text-on-dark" },
  { value: "warning", label: "Warning", chip: "bg-bz-leaf text-bz-text" },
  { value: "danger", label: "Danger", chip: "bg-[#FBE5E2] text-[#9A2E29]" },
  { value: "neutral", label: "Neutral", chip: "bg-bz-paper-warm text-bz-text" },
];
const actionStyle = (v: string | null) =>
  ACTION_STYLES.find((s) => s.value === v) ?? null;

// ════════════════════════════════════════════════════════════════════════════
// SEED — catalogs + the workflow list
// ════════════════════════════════════════════════════════════════════════════

type StateRow = { id: string; name: string; touched?: boolean };
type ActionRow = { id: string; name: string; style: string | null; touched?: boolean };

const SEED_STATES: StateRow[] = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Rejected",
  "On Hold",
  "Submitted",
  "Cancelled",
  "Completed",
].map((name, i) => ({ id: `st-${i}`, name }));

const SEED_ACTIONS: ActionRow[] = [
  { name: "Approve", style: "success" },
  { name: "Reject", style: "danger" },
  { name: "Submit", style: "primary" },
  { name: "Hold", style: "warning" },
  { name: "Resume", style: "info" },
  { name: "Review", style: "neutral" },
].map((a, i) => ({ id: `ac-${i}`, ...a }));

type WfState = {
  id: string;
  state: string | null;
  stage: string | null;
  role: string | null;
  enabled: boolean;
  inactive: boolean;
};
type WfTransition = {
  id: string;
  from: string | null;
  action: string | null;
  next: string | null;
  role: string | null;
  user: string | null;
  field: string | null;
  value: string;
  channel: string | null;
  enabled: boolean;
  inactive: boolean;
};

type Workflow = {
  id: string;
  name: string;
  entity: string;
  state: string;
  release: string;
  override: boolean;
  sendEmail: boolean;
  isPrivate: boolean;
  inactive: boolean;
  states?: WfState[];
  transitions?: WfTransition[];
};

const WORKFLOWS: Workflow[] = [
  {
    id: "WF-1001",
    name: "Sales Invoice Approval",
    entity: "sales_invoice",
    state: "Pending Approval",
    release: "released",
    override: true,
    sendEmail: true,
    isPrivate: false,
    inactive: false,
    states: [
      { id: "s1", state: "Draft", stage: "0", role: "accounts_user", enabled: true, inactive: false },
      { id: "s2", state: "Pending Approval", stage: "0", role: "accounts_manager", enabled: true, inactive: false },
      { id: "s3", state: "Approved", stage: "1", role: "finance_head", enabled: true, inactive: false },
      { id: "s4", state: "Rejected", stage: "0", role: "accounts_manager", enabled: true, inactive: false },
    ],
    transitions: [
      { id: "t1", from: "Draft", action: "Submit", next: "Pending Approval", role: "accounts_user", user: null, field: "approval_status", value: "Pending", channel: "in_app", enabled: true, inactive: false },
      { id: "t2", from: "Pending Approval", action: "Approve", next: "Approved", role: "accounts_manager", user: null, field: "approval_status", value: "Approved", channel: "email", enabled: true, inactive: false },
      { id: "t3", from: "Pending Approval", action: "Reject", next: "Rejected", role: "accounts_manager", user: null, field: "approval_status", value: "Rejected", channel: "email", enabled: true, inactive: false },
    ],
  },
  {
    id: "WF-1002",
    name: "Purchase Order Approval",
    entity: "purchase_order",
    state: "Approved",
    release: "released",
    override: true,
    sendEmail: true,
    isPrivate: false,
    inactive: false,
    states: [
      { id: "s1", state: "Draft", stage: "0", role: "purchase_manager", enabled: true, inactive: false },
      { id: "s2", state: "Pending Approval", stage: "0", role: "finance_head", enabled: true, inactive: false },
      { id: "s3", state: "Approved", stage: "1", role: "finance_head", enabled: true, inactive: false },
    ],
    transitions: [
      { id: "t1", from: "Draft", action: "Submit", next: "Pending Approval", role: "purchase_manager", user: null, field: "approval_status", value: "Pending", channel: "in_app", enabled: true, inactive: false },
      { id: "t2", from: "Pending Approval", action: "Approve", next: "Approved", role: "finance_head", user: null, field: "approval_status", value: "Approved", channel: "email", enabled: true, inactive: false },
    ],
  },
  {
    id: "WF-1003",
    name: "Expense Claim Review",
    entity: "expense_claim",
    state: "Pending Approval",
    release: "released",
    override: false,
    sendEmail: true,
    isPrivate: false,
    inactive: false,
  },
  {
    id: "WF-1004",
    name: "Journal Entry Review",
    entity: "journal_entry",
    state: "Draft",
    release: "draft",
    override: false,
    sendEmail: false,
    isPrivate: true,
    inactive: true,
  },
  {
    id: "WF-1005",
    name: "Leave Approval",
    entity: "leave_application",
    state: "Approved",
    release: "released",
    override: true,
    sendEmail: true,
    isPrivate: false,
    inactive: false,
  },
  {
    id: "WF-1006",
    name: "Payment Clearance",
    entity: "payment_entry",
    state: "Submitted",
    release: "released",
    override: false,
    sendEmail: true,
    isPrivate: false,
    inactive: false,
  },
  {
    id: "WF-1007",
    name: "Sales Order Hold",
    entity: "sales_order",
    state: "On Hold",
    release: "released",
    override: true,
    sendEmail: false,
    isPrivate: false,
    inactive: false,
  },
  {
    id: "WF-1008",
    name: "Material Request Approval",
    entity: "material_request",
    state: "Pending Approval",
    release: "draft",
    override: false,
    sendEmail: true,
    isPrivate: false,
    inactive: false,
  },
  {
    id: "WF-1009",
    name: "Credit Note Authorisation",
    entity: "sales_invoice",
    state: "Approved",
    release: "deprecated",
    override: true,
    sendEmail: true,
    isPrivate: true,
    inactive: true,
  },
  {
    id: "WF-1010",
    name: "Vendor Onboarding Sign-off",
    entity: "purchase_order",
    state: "Completed",
    release: "released",
    override: false,
    sendEmail: false,
    isPrivate: false,
    inactive: false,
  },
];

// ════════════════════════════════════════════════════════════════════════════
// ID + DRAFT helpers
// ════════════════════════════════════════════════════════════════════════════

let SEQ = 0;
const uid = (p: string) => `${p}-${++SEQ}-${Date.now().toString(36)}`;

const blankWfState = (): WfState => ({
  id: uid("s"),
  state: null,
  stage: "0",
  role: null,
  enabled: true,
  inactive: false,
});
const blankWfTransition = (): WfTransition => ({
  id: uid("t"),
  from: null,
  action: null,
  next: null,
  role: null,
  user: null,
  field: null,
  value: "",
  channel: "email",
  enabled: true,
  inactive: false,
});

type Draft = {
  id: string | null; // null ⇒ new workflow
  name: string;
  nameTouched: boolean;
  entity: string | null;
  isPrivate: boolean;
  suppressOverride: boolean;
  sendEmail: boolean;
  inactive: boolean;
  states: WfState[];
  transitions: WfTransition[];
};

function draftFromWorkflow(wf: Workflow): Draft {
  return {
    id: wf.id,
    name: wf.name,
    nameTouched: false,
    entity: wf.entity,
    isPrivate: wf.isPrivate,
    suppressOverride: wf.override,
    sendEmail: wf.sendEmail,
    inactive: wf.inactive,
    states:
      wf.states && wf.states.length
        ? wf.states.map((s) => ({ ...s }))
        : [
            { ...blankWfState(), state: "Draft", role: "accounts_user" },
            { ...blankWfState(), state: "Approved", stage: "1", role: "finance_head" },
          ],
    transitions:
      wf.transitions && wf.transitions.length
        ? wf.transitions.map((t) => ({ ...t }))
        : [{ ...blankWfTransition(), from: "Draft", action: "Submit", next: "Approved" }],
  };
}

function blankDraft(): Draft {
  return {
    id: null,
    name: "",
    nameTouched: false,
    entity: null,
    isPrivate: false,
    suppressOverride: false,
    sendEmail: true,
    inactive: false,
    states: [blankWfState()],
    transitions: [blankWfTransition()],
  };
}

// strip volatile keys before comparing for dirtiness
const stable = (d: Draft) => {
  const { nameTouched, ...rest } = d;
  return JSON.stringify(rest);
};

// ════════════════════════════════════════════════════════════════════════════
// ATOMS — Switch · field shells
// ════════════════════════════════════════════════════════════════════════════

function Switch({
  value,
  onChange,
  ariaLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          value ? "translate-x-[14px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

function FlagToggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex items-center justify-between gap-3 rounded-bz-md border px-3 py-2 text-left transition-colors",
        value ? "border-bz-line bg-bz-surface" : "border-bz-line-soft bg-bz-paper-warm/40 hover:border-bz-line",
      )}
    >
      <span className="min-w-0">
        <span className="block text-[12px] font-medium text-bz-text">{label}</span>
        {hint && <span className="block text-[10.5px] text-bz-text-soft">{hint}</span>}
      </span>
      <Switch value={value} onChange={onChange} ariaLabel={label} />
    </button>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
      {children}
      {required && <span className="ml-0.5 text-[#C0413A]">*</span>}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PICKER — the page's one searchable single-select. Portal-positioned, flips
// up when there's no room below, type-to-filter, keyboard nav, optional
// clearable (else auto-commits the first option), lazy "load more", plus
// loading / no-results / disabled states.
// ════════════════════════════════════════════════════════════════════════════

const PAGE = 8;

function Picker({
  value,
  onChange,
  options,
  placeholder = "Select…",
  clearable = true,
  disabled,
  loading,
  error,
  size = "md",
  emptyText = "No options available",
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: Opt[];
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  size?: "sm" | "md";
  emptyText?: string;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [raw, setRaw] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [hi, setHi] = React.useState(0);
  const [more, setMore] = React.useState(false);
  const [pos, setPos] = React.useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  // auto-commit first option when not clearable and still unset
  React.useEffect(() => {
    if (!clearable && !value && !disabled && !loading && options.length) {
      onChange(options[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearable, value, disabled, loading, options.length]);

  // position (flip up if no room below)
  React.useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setPos(null);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < 300 && r.top > spaceBelow;
    setPos(
      openUp
        ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 6 }
        : { left: r.left, width: r.width, top: r.bottom + 6 },
    );
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setRaw("");
      setPages(1);
      setHi(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
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
  }, [open]);

  const q = raw.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || (o.sub ?? "").toLowerCase().includes(q))
    : options;
  const visible = filtered.slice(0, pages * PAGE);
  const hasMore = visible.length < filtered.length;

  const onListScroll = () => {
    const el = listRef.current;
    if (!el || more || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setMore(true);
      window.setTimeout(() => {
        setPages((p) => p + 1);
        setMore(false);
      }, 320);
    }
  };

  const pick = (o: Opt) => {
    onChange(o.value);
    setOpen(false);
  };
  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => Math.min(h + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = visible[hi];
      if (o) pick(o);
    }
  };

  const h = size === "sm" ? "h-8" : "h-9";
  const txt = size === "sm" ? "text-[12px]" : "text-[12.5px]";
  const locked = disabled;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={locked}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          h,
          locked
            ? "cursor-not-allowed border-bz-line-soft bg-bz-paper-warm/60 text-bz-text-soft"
            : open
              ? "border-bz-text bg-bz-surface"
              : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
          error && !locked && "border-[#C0413A]",
        )}
      >
        {loading && <Loader2 size={12} className="shrink-0 animate-spin text-bz-fire" />}
        <span className={cn("min-w-0 flex-1 truncate", txt, selected ? "text-bz-text" : "text-bz-text-soft")}>
          {loading ? "Loading…" : selected ? selected.label : placeholder}
        </span>
        {selected && selected.meta && (
          <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[9.5px] font-semibold text-bz-text-muted", NUM)}>
            {selected.meta}
          </span>
        )}
        {selected && clearable && !locked ? (
          <span
            role="button"
            aria-label="Clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
          >
            <X size={11} />
          </span>
        ) : (
          !locked && <ChevronDown size={size === "sm" ? 12 : 13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
        )}
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            onKeyDown={onKeyNav}
            style={{ position: "fixed", left: pos.left, top: pos.top, bottom: pos.bottom, width: Math.max(pos.width, 220) }}
            className="z-[70] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
          >
            <div className="border-b border-bz-line-soft p-2">
              <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
                <Search size={12} className="shrink-0 text-bz-text-muted" />
                <input
                  ref={inputRef}
                  value={raw}
                  onChange={(e) => {
                    setRaw(e.target.value);
                    setPages(1);
                    setHi(0);
                  }}
                  placeholder="Search…"
                  className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
                />
                {raw && (
                  <button onClick={() => setRaw("")} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface" aria-label="Clear search">
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>

            <div ref={listRef} onScroll={onListScroll} className="max-h-[248px] overflow-y-auto py-1">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-bz-text-muted">
                  <Loader2 size={13} className="animate-spin text-bz-fire" /> <span className="text-[11.5px]">Loading options…</span>
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-7 text-center">
                  <SearchX size={15} className="text-bz-text-soft" />
                  <p className="text-[11.5px] font-medium text-bz-text-muted">{raw ? `No matches for “${raw}”` : emptyText}</p>
                </div>
              ) : (
                visible.map((o, i) => {
                  const isSel = o.value === value;
                  const active = i === hi;
                  return (
                    <button
                      key={o.value}
                      onMouseEnter={() => setHi(i)}
                      onClick={() => pick(o)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors",
                        active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm",
                        isSel && "bg-bz-fire/[0.06]",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                        {o.sub && <span className="block truncate text-[10.5px] text-bz-text-soft">{o.sub}</span>}
                      </span>
                      {o.meta && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[9.5px] font-semibold text-bz-text-muted", NUM)}>{o.meta}</span>}
                      {isSel && <Check size={13} className="shrink-0 text-bz-text" />}
                    </button>
                  );
                })
              )}
              {more && (
                <div className="flex items-center justify-center gap-2 py-2 text-bz-text-muted">
                  <Loader2 size={12} className="animate-spin text-bz-fire" /> <span className="text-[11px]">Loading more…</span>
                </div>
              )}
              {!more && !hasMore && filtered.length > PAGE && (
                <p className={cn("px-3 py-1.5 text-center text-[10px] text-bz-text-soft", NUM)}>{filtered.length} options · end of list</p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// style picker (special select with chip previews) — reuses Picker's shell idea
function StylePicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const cur = actionStyle(value);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        )}
      >
        {cur ? (
          <span className={cn("inline-flex items-center rounded-bz-sm px-2 py-0.5 text-[11px] font-semibold", cur.chip)}>{cur.label}</span>
        ) : (
          <span className="flex-1 text-[12.5px] text-bz-text-soft">Pick a style…</span>
        )}
        <ChevronDown size={13} className={cn("ml-auto shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-[40px] z-[70] w-full min-w-[200px] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface p-1.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          <div className="grid grid-cols-2 gap-1.5">
            {ACTION_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  onChange(s.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-center rounded-bz-sm border px-2 py-1.5 transition-colors",
                  value === s.value ? "border-bz-text" : "border-bz-line-soft hover:border-bz-line",
                )}
              >
                <span className={cn("inline-flex w-full items-center justify-center rounded-bz-sm px-2 py-1 text-[11px] font-semibold", s.chip)}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COLLECTION SCAFFOLD — sequence chip · remove · add-entry · never-empty
// ════════════════════════════════════════════════════════════════════════════

function SeqChip({ n }: { n: number }) {
  return (
    <span className={cn("inline-flex h-5 min-w-[22px] shrink-0 items-center justify-center rounded-bz-sm bg-bz-deep px-1.5 text-[10px] font-bold text-bz-paper", NUM)}>
      {n}
    </span>
  );
}

function RemoveBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm border border-transparent text-bz-text-soft transition-colors hover:border-[#F0C9C4] hover:bg-[#FBE7E5] hover:text-[#9A2E29]"
    >
      <Trash2 size={13} />
    </button>
  );
}

function AddEntryBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text-muted transition-colors hover:border-bz-text hover:text-bz-text"
    >
      <Plus size={13} /> {label}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WORKFLOW EDITOR — states tab + transitions tab
// ════════════════════════════════════════════════════════════════════════════

function StatesEditor({
  states,
  stateNameOptions,
  onUpdate,
  onAdd,
  onRemove,
}: {
  states: WfState[];
  stateNameOptions: Opt[];
  onUpdate: (id: string, patch: Partial<WfState>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* inline help — decodes the lifecycle-stage enum */}
      <div className="flex items-start gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 px-3 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-bz-leaf-deep" />
        <p className="text-[11px] leading-relaxed text-bz-text-muted">
          <span className="font-semibold text-bz-text">Lifecycle stage</span> sets the document's posting state while it sits in this workflow state —{" "}
          <span className="font-medium text-bz-text">Draft</span> (editable, not posted), <span className="font-medium text-bz-text">Submitted</span> (posted to the ledger),{" "}
          <span className="font-medium text-bz-text">Cancelled</span> (reversed). Each state must declare one.
        </p>
      </div>

      {/* column header (desktop) */}
      <div className="hidden grid-cols-[22px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto_28px] items-center gap-2.5 px-1 md:grid">
        <span />
        <FieldLabel required>State</FieldLabel>
        <FieldLabel required>Lifecycle stage</FieldLabel>
        <FieldLabel>Authorized role</FieldLabel>
        <span className="text-center"><FieldLabel>Flags</FieldLabel></span>
        <span />
      </div>

      <div className="flex flex-col gap-2">
        {states.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "rounded-bz-md border border-bz-line-soft bg-bz-surface p-2.5 md:grid md:grid-cols-[22px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto_28px] md:items-center md:gap-2.5 md:p-2",
              s.inactive && "opacity-60",
            )}
          >
            <div className="mb-2 flex items-center gap-2 md:mb-0">
              <SeqChip n={i + 1} />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft md:hidden">State {i + 1}</span>
            </div>

            <div className="mb-2 md:mb-0">
              <span className="mb-1 block md:hidden"><FieldLabel required>State</FieldLabel></span>
              <Picker value={s.state} onChange={(v) => onUpdate(s.id, { state: v })} options={stateNameOptions} placeholder="Pick a state…" size="sm" emptyText="Define states in the catalog" />
            </div>

            <div className="mb-2 md:mb-0">
              <span className="mb-1 block md:hidden"><FieldLabel required>Lifecycle stage</FieldLabel></span>
              <Picker value={s.stage} onChange={(v) => onUpdate(s.id, { stage: v })} options={LIFECYCLE_STAGES} clearable={false} size="sm" />
            </div>

            <div className="mb-2 md:mb-0">
              <span className="mb-1 block md:hidden"><FieldLabel>Authorized role</FieldLabel></span>
              <Picker value={s.role} onChange={(v) => onUpdate(s.id, { role: v })} options={ROLES} placeholder="Any role…" size="sm" />
            </div>

            <div className="mb-1 flex items-center gap-3 md:mb-0 md:justify-center">
              <label className="flex items-center gap-1.5 text-[11px] text-bz-text-muted">
                <Switch value={s.enabled} onChange={(v) => onUpdate(s.id, { enabled: v })} ariaLabel="Enabled" /> Enabled
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-bz-text-muted">
                <Switch value={s.inactive} onChange={(v) => onUpdate(s.id, { inactive: v })} ariaLabel="Inactive" /> Inactive
              </label>
            </div>

            <div className="flex justify-end">
              <RemoveBtn onClick={() => onRemove(s.id)} label="Remove state" />
            </div>
          </div>
        ))}
      </div>

      <div>
        <AddEntryBtn onClick={onAdd} label="Add state" />
      </div>
    </div>
  );
}

function TransitionsEditor({
  transitions,
  stateOptions,
  fieldOptions,
  fieldsLoading,
  hasEntity,
  onUpdate,
  onAdd,
  onRemove,
}: {
  transitions: WfTransition[];
  stateOptions: Opt[];
  fieldOptions: Opt[];
  fieldsLoading: boolean;
  hasEntity: boolean;
  onUpdate: (id: string, patch: Partial<WfTransition>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const actionOptions = SEED_ACTIONS.map((a) => ({ value: a.name, label: a.name }));
  return (
    <div className="flex flex-col gap-3">
      <p className="px-0.5 text-[11px] leading-relaxed text-bz-text-muted">
        Each rule moves a document from one state to another when an action fires. <span className="font-medium text-bz-text">From / Next</span> states are drawn from the
        states you defined above.
      </p>

      <div className="flex flex-col gap-2.5">
        {transitions.map((t, i) => (
          <div key={t.id} className={cn("rounded-bz-lg border border-bz-line-soft bg-bz-surface", t.inactive && "opacity-60")}>
            {/* rule headline: From → Action → Next */}
            <div className="flex items-center gap-2 border-b border-bz-line-soft bg-bz-paper-warm/40 px-2.5 py-2">
              <SeqChip n={i + 1} />
              <div className="grid flex-1 grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
                <Picker value={t.from} onChange={(v) => onUpdate(t.id, { from: v })} options={stateOptions} placeholder="From state…" size="sm" emptyText="Define states first" />
                <ArrowRight size={13} className="mx-auto hidden shrink-0 text-bz-text-soft sm:block" />
                <Picker value={t.action} onChange={(v) => onUpdate(t.id, { action: v })} options={actionOptions} placeholder="Action…" size="sm" />
                <ArrowRight size={13} className="mx-auto hidden shrink-0 text-bz-text-soft sm:block" />
                <Picker value={t.next} onChange={(v) => onUpdate(t.id, { next: v })} options={stateOptions} placeholder="Next state…" size="sm" emptyText="Define states first" />
              </div>
              <RemoveBtn onClick={() => onRemove(t.id)} label="Remove transition" />
            </div>

            {/* who can act + field update + channel */}
            <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 px-2.5 py-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="mb-1 block"><FieldLabel>Authorizing role</FieldLabel></span>
                <Picker value={t.role} onChange={(v) => onUpdate(t.id, { role: v })} options={ROLES} placeholder="Any role…" size="sm" />
              </div>
              <div>
                <span className="mb-1 block"><FieldLabel>Authorizing user</FieldLabel></span>
                <Picker value={t.user} onChange={(v) => onUpdate(t.id, { user: v })} options={USERS} placeholder="Any user…" size="sm" />
              </div>
              <div>
                <span className="mb-1 flex items-center gap-1"><FieldLabel>Set field</FieldLabel><CornerDownRight size={10} className="text-bz-text-soft" /></span>
                <Picker
                  value={t.field}
                  onChange={(v) => onUpdate(t.id, { field: v })}
                  options={fieldOptions}
                  placeholder={hasEntity ? "Field to update…" : "Pick entity type first"}
                  disabled={!hasEntity}
                  loading={fieldsLoading}
                  size="sm"
                  emptyText="No fields for this entity"
                />
              </div>
              <div>
                <span className="mb-1 block"><FieldLabel>New value</FieldLabel></span>
                <input
                  value={t.value}
                  onChange={(e) => onUpdate(t.id, { value: e.target.value })}
                  placeholder={t.field ? "Value to set…" : "—"}
                  disabled={!t.field}
                  className="h-8 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text disabled:cursor-not-allowed disabled:bg-bz-paper-warm/60 disabled:text-bz-text-soft"
                />
              </div>
            </div>

            {/* notification + per-entry flags */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-bz-line-soft px-2.5 py-2">
              <div className="flex items-center gap-2">
                <Bell size={12} className="text-bz-text-soft" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Notify via</span>
                <div className="w-[150px]">
                  <Picker value={t.channel} onChange={(v) => onUpdate(t.id, { channel: v })} options={CHANNELS} clearable={false} size="sm" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[11px] text-bz-text-muted">
                  <Switch value={t.enabled} onChange={(v) => onUpdate(t.id, { enabled: v })} ariaLabel="Enabled" /> Enabled
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-bz-text-muted">
                  <Switch value={t.inactive} onChange={(v) => onUpdate(t.id, { inactive: v })} ariaLabel="Inactive" /> Inactive
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <AddEntryBtn onClick={onAdd} label="Add transition" />
      </div>
    </div>
  );
}

// ── the editor shell (name + entity + flags + tabs) ──

function WorkflowEditor({
  draft,
  dispatch,
  fieldsLoading,
  catalogStateOptions,
  onBack,
}: {
  draft: Draft;
  dispatch: React.Dispatch<DraftAction>;
  fieldsLoading: boolean;
  catalogStateOptions: Opt[];
  onBack: () => void;
}) {
  const [tab, setTab] = React.useState<"states" | "transitions">("states");

  const stateOptions: Opt[] = React.useMemo(
    () =>
      draft.states
        .map((s) => s.state)
        .filter((v): v is string => !!v)
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((v) => ({ value: v, label: v })),
    [draft.states],
  );
  const fieldOptions = draft.entity ? FIELDS_BY_ENTITY[draft.entity] ?? [] : [];

  const nameError = draft.nameTouched && !draft.name.trim();

  return (
    <div className="flex min-w-0 flex-col">
      {/* editor header */}
      <div className="border-b border-bz-line bg-bz-paper px-4 py-4 md:px-6">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            title="List"
            aria-label="Back to workflow list"
            className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm lg:hidden"
          >
            <ChevronRight size={15} className="rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-muted">
                {draft.id ? <><Pencil size={9} /> Edit</> : <><Plus size={9} /> New</>}
              </span>
              {draft.id && <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{draft.id}</span>}
            </div>
            <input
              value={draft.name}
              onChange={(e) => dispatch({ k: "name", v: e.target.value })}
              onBlur={() => dispatch({ k: "touchName" })}
              placeholder="Untitled workflow"
              className={cn(
                "mt-1.5 w-full bg-transparent text-[22px] font-semibold tracking-tight text-bz-text outline-none placeholder:text-bz-text-soft",
                nameError && "placeholder:text-[#C0413A]",
              )}
            />
            {nameError && (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-[#9A2E29]">
                <AlertCircle size={11} /> A workflow name is required.
              </p>
            )}
          </div>
        </div>

        {/* entity + flags */}
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <div>
            <span className="mb-1 block"><FieldLabel required>Entity type</FieldLabel></span>
            <Picker
              value={draft.entity}
              onChange={(v) => dispatch({ k: "entity", v })}
              options={ENTITIES}
              placeholder="Bind to an entity…"
            />
            <p className="mt-1 text-[10.5px] text-bz-text-soft">Drives the fields a transition can update.</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FlagToggle label="Email alerts" hint="Send notifications on transition" value={draft.sendEmail} onChange={(v) => dispatch({ k: "flag", key: "sendEmail", v })} />
            <FlagToggle label="Don't override status" hint="Suppress status overriding" value={draft.suppressOverride} onChange={(v) => dispatch({ k: "flag", key: "suppressOverride", v })} />
            <FlagToggle label="Private workflow" hint="Visible only to its owner" value={draft.isPrivate} onChange={(v) => dispatch({ k: "flag", key: "isPrivate", v })} />
            <FlagToggle label="Inactive" hint="Disable without deleting" value={draft.inactive} onChange={(v) => dispatch({ k: "flag", key: "inactive", v })} />
          </div>
        </div>
      </div>

      {/* tab strip */}
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-bz-line-soft bg-bz-paper/95 px-4 py-2 backdrop-blur md:px-6">
        {([
          { id: "states", label: "States", n: draft.states.length, icon: Layers },
          { id: "transitions", label: "Transitions", n: draft.transitions.length, icon: GitBranch },
        ] as const).map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-bz-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                active ? "bg-bz-deep text-bz-text-on-dark" : "text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
              )}
            >
              <Icon size={13} /> {t.label}
              <span className={cn("inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill px-1 text-[10px] font-bold", active ? "bg-bz-fire/25 text-bz-text-on-dark" : "bg-bz-paper-warm text-bz-text-muted", NUM)}>
                {t.n}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-5 md:px-6">
        {tab === "states" ? (
          <StatesEditor
            states={draft.states}
            stateNameOptions={catalogStateOptions}
            onUpdate={(id, patch) => dispatch({ k: "stateUpdate", id, patch })}
            onAdd={() => dispatch({ k: "stateAdd" })}
            onRemove={(id) => dispatch({ k: "stateRemove", id })}
          />
        ) : (
          <TransitionsEditor
            transitions={draft.transitions}
            stateOptions={stateOptions}
            fieldOptions={fieldOptions}
            fieldsLoading={fieldsLoading}
            hasEntity={!!draft.entity}
            onUpdate={(id, patch) => dispatch({ k: "trUpdate", id, patch })}
            onAdd={() => dispatch({ k: "trAdd" })}
            onRemove={(id) => dispatch({ k: "trRemove", id })}
          />
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DRAFT REDUCER
// ════════════════════════════════════════════════════════════════════════════

type DraftAction =
  | { k: "load"; draft: Draft }
  | { k: "name"; v: string }
  | { k: "touchName" }
  | { k: "entity"; v: string | null }
  | { k: "flag"; key: "isPrivate" | "suppressOverride" | "sendEmail" | "inactive"; v: boolean }
  | { k: "stateAdd" }
  | { k: "stateRemove"; id: string }
  | { k: "stateUpdate"; id: string; patch: Partial<WfState> }
  | { k: "trAdd" }
  | { k: "trRemove"; id: string }
  | { k: "trUpdate"; id: string; patch: Partial<WfTransition> };

function draftReducer(state: Draft, a: DraftAction): Draft {
  switch (a.k) {
    case "load":
      return a.draft;
    case "name":
      return { ...state, name: a.v };
    case "touchName":
      return { ...state, nameTouched: true };
    case "entity":
      return { ...state, entity: a.v };
    case "flag":
      return { ...state, [a.key]: a.v };
    case "stateAdd":
      return { ...state, states: [...state.states, blankWfState()] };
    case "stateRemove": {
      const next = state.states.filter((s) => s.id !== a.id);
      return { ...state, states: next.length ? next : [blankWfState()] };
    }
    case "stateUpdate":
      return { ...state, states: state.states.map((s) => (s.id === a.id ? { ...s, ...a.patch } : s)) };
    case "trAdd":
      return { ...state, transitions: [...state.transitions, blankWfTransition()] };
    case "trRemove": {
      const next = state.transitions.filter((t) => t.id !== a.id);
      return { ...state, transitions: next.length ? next : [blankWfTransition()] };
    }
    case "trUpdate":
      return { ...state, transitions: state.transitions.map((t) => (t.id === a.id ? { ...t, ...a.patch } : t)) };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// WORKFLOW LIST RAIL  (search · filter surface · chips · rows · counts · paging)
// ════════════════════════════════════════════════════════════════════════════

type Filters = {
  name: string;
  state: string;
  entity: string | null;
  release: string | null;
  override: boolean;
  email: boolean;
  inactive: "any" | "active" | "inactive";
};
const EMPTY_FILTERS: Filters = { name: "", state: "", entity: null, release: null, override: false, email: false, inactive: "any" };

function matchWf(w: Workflow, f: Filters, search: string) {
  const s = search.trim().toLowerCase();
  if (s && !w.name.toLowerCase().includes(s)) return false;
  if (f.name && !w.name.toLowerCase().includes(f.name.toLowerCase())) return false;
  if (f.state && !w.state.toLowerCase().includes(f.state.toLowerCase())) return false;
  if (f.entity && w.entity !== f.entity) return false;
  if (f.release && w.release !== f.release) return false;
  if (f.override && !w.override) return false;
  if (f.email && !w.sendEmail) return false;
  if (f.inactive === "active" && w.inactive) return false;
  if (f.inactive === "inactive" && !w.inactive) return false;
  return true;
}

function activeFilterCount(f: Filters, search: string) {
  let n = 0;
  if (search.trim()) n++;
  if (f.name) n++;
  if (f.state) n++;
  if (f.entity) n++;
  if (f.release) n++;
  if (f.override) n++;
  if (f.email) n++;
  if (f.inactive !== "any") n++;
  return n;
}

function StatusDot({ inactive }: { inactive: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-bz-sm px-1.5 py-0.5 text-[10px] font-semibold", inactive ? "bg-bz-paper-warm text-bz-text-muted" : "bg-bz-fire/[0.18] text-bz-text")}>
      <span className={cn("size-1.5 rounded-bz-pill", inactive ? "bg-bz-text-soft" : "bg-bz-leaf-deep")} />
      {inactive ? "Inactive" : "Active"}
    </span>
  );
}

function WorkflowRail({
  workflows,
  selectedId,
  isNew,
  loading,
  onSelect,
  onNew,
  onDelete,
}: {
  workflows: Workflow[];
  selectedId: string | null;
  isNew: boolean;
  loading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [draftFilters, setDraftFilters] = React.useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS);
  const [visible, setVisible] = React.useState(6);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const matched = React.useMemo(() => workflows.filter((w) => matchWf(w, filters, search)), [workflows, filters, search]);
  const total = matched.length;
  const shown = matched.slice(0, visible);
  const hasMore = shown.length < total;
  const fCount = activeFilterCount(filters, search);

  // re-query (reset paging) whenever criteria change
  React.useEffect(() => {
    setVisible(6);
  }, [filters, search, workflows]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (loadingMore || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setLoadingMore(true);
      window.setTimeout(() => {
        setVisible((v) => v + 6);
        setLoadingMore(false);
      }, 420);
    }
  };

  // applied-filter chips
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (search.trim()) chips.push({ key: "q", label: `Search: ${search.trim()}`, clear: () => setSearch("") });
  if (filters.name) chips.push({ key: "name", label: `Name: ${filters.name}`, clear: () => apply({ ...filters, name: "" }) });
  if (filters.state) chips.push({ key: "state", label: `State: ${filters.state}`, clear: () => apply({ ...filters, state: "" }) });
  if (filters.entity) chips.push({ key: "entity", label: `Entity: ${entityLabel(filters.entity)}`, clear: () => apply({ ...filters, entity: null }) });
  if (filters.release) chips.push({ key: "rel", label: `Status: ${RELEASE_STATUS.find((r) => r.value === filters.release)?.label}`, clear: () => apply({ ...filters, release: null }) });
  if (filters.override) chips.push({ key: "ovr", label: "Override only", clear: () => apply({ ...filters, override: false }) });
  if (filters.email) chips.push({ key: "eml", label: "Email only", clear: () => apply({ ...filters, email: false }) });
  if (filters.inactive !== "any") chips.push({ key: "ina", label: filters.inactive === "active" ? "Active only" : "Inactive only", clear: () => apply({ ...filters, inactive: "any" }) });

  function apply(f: Filters) {
    setFilters(f);
    setDraftFilters(f);
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-bz-line bg-bz-paper lg:border-r">
      {/* rail header */}
      <div className="border-b border-bz-line-soft px-3 py-3">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold text-bz-text">Workflows</h2>
          <button onClick={onNew} className={cn("inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-2.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95", isNew && "ring-2 ring-bz-fire ring-offset-1")}>
            <Plus size={13} /> New
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workflows…"
              className="h-8 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface py-1.5 pl-8 pr-7 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
                <X size={11} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setDraftFilters(filters);
              setFilterOpen((v) => !v);
            }}
            className={cn(
              "relative flex size-8 shrink-0 items-center justify-center rounded-bz-md border text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
              fCount > 0 || filterOpen ? "border-bz-text bg-bz-surface text-bz-text" : "border-bz-line-soft bg-bz-surface",
            )}
            aria-label="Filters"
          >
            <SlidersHorizontal size={14} />
            {fCount > 0 && <span className={cn("absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire px-1 text-[9px] font-bold text-bz-olive", NUM)}>{fCount}</span>}
          </button>
        </div>

        {/* applied-filter chips */}
        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {chips.map((c) => (
              <span key={c.key} className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-fire/[0.16] py-0.5 pl-2 pr-1 text-[10.5px] text-bz-text">
                {c.label}
                <button onClick={c.clear} aria-label="Remove filter" className="flex size-3.5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/40 hover:text-bz-text">
                  <X size={9} />
                </button>
              </span>
            ))}
            <button onClick={() => apply(EMPTY_FILTERS)} className="text-[10.5px] font-medium text-bz-text-muted hover:text-bz-text">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* filter surface (collapsible) */}
      {filterOpen && (
        <div className="border-b border-bz-line-soft bg-bz-paper-warm/40 px-3 py-3">
          <div className="flex flex-col gap-2.5">
            <div>
              <span className="mb-1 block"><FieldLabel>Name contains</FieldLabel></span>
              <input value={draftFilters.name} onChange={(e) => setDraftFilters({ ...draftFilters, name: e.target.value })} placeholder="e.g. Approval" className="h-8 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text" />
            </div>
            <div>
              <span className="mb-1 block"><FieldLabel>Workflow state contains</FieldLabel></span>
              <input value={draftFilters.state} onChange={(e) => setDraftFilters({ ...draftFilters, state: e.target.value })} placeholder="e.g. Pending" className="h-8 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text" />
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <span className="mb-1 block"><FieldLabel>Entity type</FieldLabel></span>
                <Picker value={draftFilters.entity} onChange={(v) => setDraftFilters({ ...draftFilters, entity: v })} options={ENTITIES} placeholder="Any entity" size="sm" />
              </div>
              <div>
                <span className="mb-1 block"><FieldLabel>Release status</FieldLabel></span>
                <Picker value={draftFilters.release} onChange={(v) => setDraftFilters({ ...draftFilters, release: v })} options={RELEASE_STATUS} placeholder="Any status" size="sm" />
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface p-2.5">
              <label className="flex items-center justify-between gap-2 text-[12px] text-bz-text">
                Has override behaviour
                <Switch value={draftFilters.override} onChange={(v) => setDraftFilters({ ...draftFilters, override: v })} ariaLabel="Override" />
              </label>
              <label className="flex items-center justify-between gap-2 text-[12px] text-bz-text">
                Sends email
                <Switch value={draftFilters.email} onChange={(v) => setDraftFilters({ ...draftFilters, email: v })} ariaLabel="Email" />
              </label>
            </div>
            <div>
              <span className="mb-1 block"><FieldLabel>Active / inactive</FieldLabel></span>
              <div className="grid grid-cols-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
                {(["any", "active", "inactive"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDraftFilters({ ...draftFilters, inactive: opt })}
                    className={cn("h-7 rounded-bz-sm text-[11.5px] font-medium capitalize transition-colors", draftFilters.inactive === opt ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text")}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <button onClick={() => { apply(draftFilters); setFilterOpen(false); }} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-3 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95">
                <Check size={13} /> Apply
              </button>
              <button onClick={() => setDraftFilters(EMPTY_FILTERS)} className="inline-flex h-8 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* list */}
      <div onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="flex flex-col gap-2 p-1">
            <div className="flex items-center justify-center gap-2 py-3 text-bz-text-muted">
              <Loader2 size={14} className="animate-spin text-bz-fire" /> <span className="text-[12px]">Loading workflows…</span>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-bz-md bg-bz-paper-warm" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
            <span className="flex size-10 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
              <Inbox size={18} />
            </span>
            <p className="text-[12.5px] font-semibold text-bz-text">No workflows found</p>
            <p className="text-[11px] text-bz-text-muted">{fCount > 0 ? "Try widening the filters." : "Create one to get started."}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {shown.map((w) => {
              const active = !isNew && w.id === selectedId;
              return (
                <div
                  key={w.id}
                  onClick={() => onSelect(w.id)}
                  className={cn(
                    "group relative cursor-pointer rounded-bz-md border px-3 py-2.5 transition-colors",
                    active ? "border-bz-text bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
                  )}
                >
                  <span className={cn("absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-bz-pill bg-bz-fire transition-opacity", active ? "opacity-100" : "opacity-0")} />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-bz-text">{w.name}</p>
                      <p className={cn("mt-0.5 truncate text-[11px] text-bz-text-muted", NUM)}>
                        {entityLabel(w.entity)} · {w.state}
                      </p>
                    </div>
                    <RailRowMenu onEdit={() => onSelect(w.id)} onDelete={() => onDelete(w.id)} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <StatusDot inactive={w.inactive} />
                    {w.sendEmail && <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[9.5px] font-medium text-bz-text-muted"><Bell size={9} /> Email</span>}
                    {w.override && <span className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[9.5px] font-medium text-bz-text-muted">Override</span>}
                  </div>
                </div>
              );
            })}
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-3 text-bz-text-muted">
                <Loader2 size={13} className="animate-spin text-bz-fire" /> <span className="text-[11px]">Loading more…</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* count readouts */}
      <div className="flex items-center justify-between border-t border-bz-line-soft px-3 py-2">
        <p className={cn("text-[11px] text-bz-text-muted", NUM)}>
          Showing <span className="font-semibold text-bz-text">{shown.length}</span> of <span className="font-semibold text-bz-text">{total}</span>
        </p>
        <p className={cn("text-[11px] text-bz-text-soft", NUM)}>{workflows.length} total</p>
      </div>
    </div>
  );
}

function RailRowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Row actions"
        className={cn("flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text", open && "bg-bz-paper-warm text-bz-text")}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-7 z-30 w-36 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <button onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-bz-text hover:bg-bz-paper-warm">
            <Pencil size={12} className="text-bz-text-muted" /> Edit
          </button>
          <button onClick={() => { setOpen(false); onDelete(); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#9A2E29] hover:bg-[#FBE7E5]">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CATALOG EDITORS — States & Actions (list + editor folded into inline rows)
// ════════════════════════════════════════════════════════════════════════════

function CatalogHeader({ title, desc, count }: { title: string; desc: string; count: number }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[20px] font-semibold tracking-tight text-bz-text">{title}</h2>
          <span className={cn("inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold text-bz-text-muted", NUM)}>{count}</span>
        </div>
        <p className="mt-1 max-w-xl text-[12.5px] text-bz-text-muted">{desc}</p>
      </div>
    </div>
  );
}

function StatesCatalog({
  rows,
  onAdd,
  onRemove,
  onUpdate,
}: {
  rows: StateRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string, touched?: boolean) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-6 md:px-6">
      <CatalogHeader title="States" desc="The named stages a document can occupy. Every workflow's state list picks from this catalog." count={rows.length} />
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        {rows.map((r, i) => {
          const error = r.touched && !r.name.trim();
          return (
            <div key={r.id} className={cn("flex items-center gap-3 px-3 py-2.5", i > 0 && "border-t border-bz-line-soft")}>
              <SeqChip n={i + 1} />
              <div className="min-w-0 flex-1">
                <input
                  value={r.name}
                  onChange={(e) => onUpdate(r.id, e.target.value)}
                  onBlur={() => onUpdate(r.id, r.name, true)}
                  placeholder="State name…"
                  className={cn(
                    "h-9 w-full rounded-bz-md border bg-bz-surface px-3 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft transition-colors",
                    error ? "border-[#C0413A] focus:border-[#9A2E29]" : "border-bz-line-soft focus:border-bz-text",
                  )}
                />
                {error && <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#9A2E29]"><AlertCircle size={10} /> A state name is required.</p>}
              </div>
              <RemoveBtn onClick={() => onRemove(r.id)} label="Remove state" />
            </div>
          );
        })}
      </div>
      <div className="mt-3">
        <AddEntryBtn onClick={onAdd} label="Add state" />
      </div>
    </div>
  );
}

function ActionsCatalog({
  rows,
  onAdd,
  onRemove,
  onUpdate,
}: {
  rows: ActionRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ActionRow>) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-6 md:px-6">
      <CatalogHeader title="Actions" desc="The verbs a workflow can expose — approve, reject, hold. Each carries a display style used to render its button." count={rows.length} />
      <div className="hidden grid-cols-[22px_minmax(0,1.5fr)_minmax(0,1fr)_28px] items-center gap-3 px-3 pb-2 md:grid">
        <span />
        <FieldLabel required>Action name</FieldLabel>
        <FieldLabel>Display style</FieldLabel>
        <span />
      </div>
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        {rows.map((r, i) => {
          const error = r.touched && !r.name.trim();
          return (
            <div key={r.id} className={cn("gap-3 px-3 py-2.5 md:grid md:grid-cols-[22px_minmax(0,1.5fr)_minmax(0,1fr)_28px] md:items-center", i > 0 && "border-t border-bz-line-soft")}>
              <div className="mb-2 flex items-center gap-2 md:mb-0">
                <SeqChip n={i + 1} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft md:hidden">Action {i + 1}</span>
              </div>
              <div className="mb-2 min-w-0 md:mb-0">
                <input
                  value={r.name}
                  onChange={(e) => onUpdate(r.id, { name: e.target.value })}
                  onBlur={() => onUpdate(r.id, { touched: true })}
                  placeholder="e.g. Approve"
                  className={cn(
                    "h-9 w-full rounded-bz-md border bg-bz-surface px-3 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft transition-colors",
                    error ? "border-[#C0413A] focus:border-[#9A2E29]" : "border-bz-line-soft focus:border-bz-text",
                  )}
                />
                {error && <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#9A2E29]"><AlertCircle size={10} /> An action name is required.</p>}
              </div>
              <div className="mb-1 md:mb-0">
                <span className="mb-1 block md:hidden"><FieldLabel>Display style</FieldLabel></span>
                <StylePicker value={r.style} onChange={(v) => onUpdate(r.id, { style: v })} />
              </div>
              <div className="flex justify-end">
                <RemoveBtn onClick={() => onRemove(r.id)} label="Remove action" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3">
        <AddEntryBtn onClick={onAdd} label="Add action" />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED FOOTER (overlay) + OVERFLOW MENU + TOAST
// ════════════════════════════════════════════════════════════════════════════

function OverflowMenu({ onReset, disabled }: { onReset: () => void; disabled: boolean }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Action"
        aria-label="More actions"
        className={cn("flex size-9 items-center justify-center rounded-bz-md border text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text", open ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface")}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute bottom-[44px] right-0 z-30 w-48 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <button
            onClick={() => {
              setOpen(false);
              if (!disabled) onReset();
            }}
            disabled={disabled}
            className={cn("flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left", disabled ? "cursor-not-allowed text-bz-text-soft" : "text-bz-text hover:bg-bz-paper-warm")}
          >
            <RotateCcw size={13} className={disabled ? "text-bz-text-soft" : "text-bz-text-muted"} />
            <span className="text-[12px] font-medium">Reset form</span>
          </button>
        </div>
      )}
    </div>
  );
}

function DockedFooter({
  context,
  status,
  canSave,
  dirty,
  saving,
  saveLabel,
  onReset,
  onSave,
}: {
  context: React.ReactNode;
  status: React.ReactNode;
  canSave: boolean;
  dirty: boolean;
  saving: boolean;
  saveLabel: string;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">{context}</div>
        <span className="hidden h-7 w-px bg-bz-line-soft sm:block" />
        <p className="hidden items-center gap-1.5 text-[11.5px] text-bz-text-muted sm:flex">{status}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <OverflowMenu onReset={onReset} disabled={!dirty || saving} />
        <button
          onClick={onSave}
          disabled={!canSave || saving}
          className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? "Posting…" : saveLabel}
        </button>
      </div>
    </div>
  );
}

type ToastState = { kind: "success" | "warning" | "error"; message: string; id: number } | null;
function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const tone = toast.kind;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", tone === "success" ? "bg-bz-fire/[0.22]" : tone === "warning" ? "bg-bz-leaf/50" : "bg-[#FBE7E5]")}>
          {tone === "success" ? <Check size={13} className="text-bz-leaf-deep" /> : tone === "warning" ? <Info size={12} className="text-bz-text" /> : <X size={13} className="text-[#9A2E29]" />}
        </span>
        <p className="max-w-[420px] text-[12.5px] font-medium text-bz-text">{toast.message}</p>
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

type ObjectKind = "workflows" | "states" | "actions";

export function WorkflowSetupDesignPage() {
  const [object, setObject] = React.useState<ObjectKind>("workflows");
  const [toast, setToast] = React.useState<ToastState>(null);
  const [saving, setSaving] = React.useState(false);
  const fire = (kind: NonNullable<ToastState>["kind"], message: string) => setToast({ kind, message, id: Date.now() });

  // ── workflow list + selection ──
  const [workflows, setWorkflows] = React.useState<Workflow[]>(WORKFLOWS);
  const [listLoading, setListLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(WORKFLOWS[0].id);
  const [isNew, setIsNew] = React.useState(false);
  const [mobileEditor, setMobileEditor] = React.useState(false);

  // brief initial "server" load so the rail's loading state is real
  React.useEffect(() => {
    const t = window.setTimeout(() => setListLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  // ── workflow draft (edit-mode hydration) ──
  const [draft, dispatch] = React.useReducer(draftReducer, draftFromWorkflow(WORKFLOWS[0]));
  const pristineRef = React.useRef<string>(stable(draft));

  const loadWorkflow = (wf: Workflow) => {
    const d = draftFromWorkflow(wf);
    dispatch({ k: "load", draft: d });
    pristineRef.current = stable(d);
  };
  const startNew = () => {
    const d = blankDraft();
    dispatch({ k: "load", draft: d });
    pristineRef.current = stable(d);
    setIsNew(true);
    setSelectedId(null);
    setMobileEditor(true);
  };
  const selectWorkflow = (id: string) => {
    const wf = workflows.find((w) => w.id === id);
    if (!wf) return;
    setIsNew(false);
    setSelectedId(id);
    loadWorkflow(wf);
    setMobileEditor(true);
  };
  const deleteWorkflow = (id: string) => {
    const wf = workflows.find((w) => w.id === id);
    const next = workflows.filter((w) => w.id !== id);
    setWorkflows(next);
    fire("success", `Deleted “${wf?.name ?? id}”.`);
    if (selectedId === id) {
      if (next.length) selectWorkflow(next[0].id);
      else startNew();
    }
  };

  // ── entity → field cascade (loading shimmer on change) ──
  const [fieldsLoading, setFieldsLoading] = React.useState(false);
  const firstEntityRun = React.useRef(true);
  React.useEffect(() => {
    if (firstEntityRun.current) {
      firstEntityRun.current = false;
      return;
    }
    if (!draft.entity) return;
    setFieldsLoading(true);
    const t = window.setTimeout(() => setFieldsLoading(false), 600);
    return () => window.clearTimeout(t);
  }, [draft.entity]);

  // ── catalogs ──
  const [stateRows, setStateRows] = React.useState<StateRow[]>(SEED_STATES);
  const stateRowsPristine = React.useRef<string>(JSON.stringify(SEED_STATES.map((r) => r.name)));
  const [actionRows, setActionRows] = React.useState<ActionRow[]>(SEED_ACTIONS);
  const actionRowsPristine = React.useRef<string>(JSON.stringify(SEED_ACTIONS.map((r) => ({ name: r.name, style: r.style }))));

  // ── derived: dirty + validity per object ──
  const wfDirty = stable(draft) !== pristineRef.current;
  const wfValid = !!draft.name.trim();

  const statesDirty = JSON.stringify(stateRows.map((r) => r.name)) !== stateRowsPristine.current;
  const statesValid = stateRows.every((r) => r.name.trim());

  const actionsDirty = JSON.stringify(actionRows.map((r) => ({ name: r.name, style: r.style }))) !== actionRowsPristine.current;
  const actionsValid = actionRows.every((r) => r.name.trim());

  // ── save (one-shot assembly) ──
  const save = async () => {
    if (saving) return;
    if (object === "workflows") {
      if (!wfValid) {
        dispatch({ k: "touchName" });
        fire("error", "Add a workflow name before saving.");
        return;
      }
      setSaving(true);
      await new Promise((r) => setTimeout(r, 800));
      setSaving(false);
      // persist into the list (create or update)
      const assembled: Workflow = {
        id: draft.id ?? `WF-${1000 + workflows.length + 1}`,
        name: draft.name.trim(),
        entity: draft.entity ?? "sales_invoice",
        state: draft.states.find((s) => s.state)?.state ?? "Draft",
        release: "draft",
        override: draft.suppressOverride,
        sendEmail: draft.sendEmail,
        isPrivate: draft.isPrivate,
        inactive: draft.inactive,
        states: draft.states,
        transitions: draft.transitions,
      };
      setWorkflows((prev) => {
        const exists = prev.some((w) => w.id === assembled.id);
        return exists ? prev.map((w) => (w.id === assembled.id ? assembled : w)) : [assembled, ...prev];
      });
      pristineRef.current = stable({ ...draft, id: assembled.id });
      dispatch({ k: "load", draft: { ...draft, id: assembled.id } });
      setSelectedId(assembled.id);
      setIsNew(false);
      fire("success", `Saved “${assembled.name}”.`);
    } else if (object === "states") {
      if (!statesValid) {
        setStateRows((rows) => rows.map((r) => ({ ...r, touched: true })));
        fire("error", "Every state needs a name.");
        return;
      }
      setSaving(true);
      await new Promise((r) => setTimeout(r, 700));
      setSaving(false);
      stateRowsPristine.current = JSON.stringify(stateRows.map((r) => r.name));
      fire("success", `Saved ${stateRows.length} states.`);
    } else {
      if (!actionsValid) {
        setActionRows((rows) => rows.map((r) => ({ ...r, touched: true })));
        fire("error", "Every action needs a name.");
        return;
      }
      setSaving(true);
      await new Promise((r) => setTimeout(r, 700));
      setSaving(false);
      actionRowsPristine.current = JSON.stringify(actionRows.map((r) => ({ name: r.name, style: r.style })));
      fire("success", `Saved ${actionRows.length} actions.`);
    }
  };

  const reset = () => {
    if (object === "workflows") {
      const wf = workflows.find((w) => w.id === selectedId);
      if (isNew || !wf) {
        startNew();
      } else {
        loadWorkflow(wf);
      }
      fire("warning", "Reverted unsaved changes.");
    } else if (object === "states") {
      setStateRows(SEED_STATES.map((r) => ({ ...r })));
      fire("warning", "States reset.");
    } else {
      setActionRows(SEED_ACTIONS.map((r) => ({ ...r })));
      fire("warning", "Actions reset.");
    }
  };

  // footer wiring per object
  const footer = (() => {
    if (object === "workflows") {
      return {
        canSave: wfValid,
        dirty: wfDirty,
        saveLabel: draft.id ? "Save workflow" : "Create workflow",
        context: (
          <p className="truncate">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">{draft.id ? "Editing" : "New workflow"}</span>
            <span className="ml-2 text-[12.5px] font-semibold text-bz-text">{draft.name.trim() || "Untitled"}</span>
          </p>
        ),
        status: saving ? (
          <><Loader2 size={12} className="animate-spin text-bz-fire" /> Posting the definition…</>
        ) : wfDirty ? (
          <><span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Unsaved · <span className={NUM}>{draft.states.length}</span> states · <span className={NUM}>{draft.transitions.length}</span> transitions</>
        ) : (
          <><Check size={12} className="text-bz-leaf-deep" /> All changes saved</>
        ),
      };
    }
    if (object === "states") {
      return {
        canSave: statesValid,
        dirty: statesDirty,
        saveLabel: "Save states",
        context: (
          <p className="truncate">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">State catalog</span>
            <span className={cn("ml-2 text-[12.5px] font-semibold text-bz-text", NUM)}>{stateRows.length} states</span>
          </p>
        ),
        status: saving ? (
          <><Loader2 size={12} className="animate-spin text-bz-fire" /> Saving…</>
        ) : statesDirty ? (
          <><span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Unsaved changes</>
        ) : (
          <><Check size={12} className="text-bz-leaf-deep" /> All changes saved</>
        ),
      };
    }
    return {
      canSave: actionsValid,
      dirty: actionsDirty,
      saveLabel: "Save actions",
      context: (
        <p className="truncate">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">Action catalog</span>
          <span className={cn("ml-2 text-[12.5px] font-semibold text-bz-text", NUM)}>{actionRows.length} actions</span>
        </p>
      ),
      status: saving ? (
        <><Loader2 size={12} className="animate-spin text-bz-fire" /> Saving…</>
      ) : actionsDirty ? (
        <><span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Unsaved changes</>
      ) : (
        <><Check size={12} className="text-bz-leaf-deep" /> All changes saved</>
      ),
    };
  })();

  const SWITCHER = [
    { id: "workflows" as const, label: "Workflows", icon: Workflow, n: workflows.length },
    { id: "states" as const, label: "States", icon: Layers, n: stateRows.length },
    { id: "actions" as const, label: "Actions", icon: Tag, n: actionRows.length },
  ];

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Administration</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Workflow Setup</span>
        </>
      }
      overlay={
        <>
          <DockedFooter
            context={footer.context}
            status={footer.status}
            canSave={footer.canSave}
            dirty={footer.dirty}
            saving={saving}
            saveLabel={footer.saveLabel}
            onReset={reset}
            onSave={save}
          />
          <Toast toast={toast} onDismiss={() => setToast(null)} />
        </>
      }
    >
      {/* object switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bz-line bg-bz-paper px-4 py-3 md:px-6">
        <div className="inline-flex items-center gap-1 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
          {SWITCHER.map((s) => {
            const active = object === s.id;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setObject(s.id);
                  setMobileEditor(false);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-bz-sm px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                  active ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
                )}
              >
                <Icon size={13} className={active ? "text-bz-leaf-deep" : ""} /> {s.label}
                <span className={cn("inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-paper-warm px-1 text-[10px] font-bold text-bz-text-muted", active && "bg-bz-fire/20 text-bz-text", NUM)}>{s.n}</span>
              </button>
            );
          })}
        </div>
        <p className="hidden text-[11.5px] text-bz-text-muted md:block">
          {object === "workflows" ? "Author a workflow — its states & transition rules." : object === "states" ? "The lifecycle states workflows move documents through." : "The styled action verbs workflows can expose."}
        </p>
      </div>

      {/* body */}
      {object === "workflows" ? (
        <div className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)]" style={{ minHeight: "calc(100vh - 8.5rem)" }}>
          {/* rail — hidden on mobile once an editor is open */}
          <div className={cn("lg:sticky lg:top-0 lg:h-[calc(100vh-8.5rem)]", mobileEditor ? "hidden lg:block" : "block")}>
            <WorkflowRail
              workflows={workflows}
              selectedId={selectedId}
              isNew={isNew}
              loading={listLoading}
              onSelect={selectWorkflow}
              onNew={startNew}
              onDelete={deleteWorkflow}
            />
          </div>
          {/* editor */}
          <div className={cn("min-w-0", mobileEditor ? "block" : "hidden lg:block")}>
            <WorkflowEditor
              draft={draft}
              dispatch={dispatch}
              fieldsLoading={fieldsLoading}
              catalogStateOptions={stateRows.filter((r) => r.name.trim()).map((r) => ({ value: r.name, label: r.name }))}
              onBack={() => setMobileEditor(false)}
            />
          </div>
        </div>
      ) : object === "states" ? (
        <StatesCatalog
          rows={stateRows}
          onAdd={() => setStateRows((rows) => [...rows, { id: uid("st"), name: "" }])}
          onRemove={(id) => setStateRows((rows) => { const next = rows.filter((r) => r.id !== id); return next.length ? next : [{ id: uid("st"), name: "" }]; })}
          onUpdate={(id, name, touched) => setStateRows((rows) => rows.map((r) => (r.id === id ? { ...r, name, touched: touched || r.touched } : r)))}
        />
      ) : (
        <ActionsCatalog
          rows={actionRows}
          onAdd={() => setActionRows((rows) => [...rows, { id: uid("ac"), name: "", style: "neutral" }])}
          onRemove={(id) => setActionRows((rows) => { const next = rows.filter((r) => r.id !== id); return next.length ? next : [{ id: uid("ac"), name: "", style: "neutral" }]; })}
          onUpdate={(id, patch) => setActionRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))}
        />
      )}
    </AppShell>
  );
}
