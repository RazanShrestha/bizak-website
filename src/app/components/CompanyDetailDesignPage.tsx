import * as React from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useLocation, Link } from "react-router";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  RefreshCw,
  Building2,
  GitBranch,
  Landmark,
  Contact,
  Settings2,
  AlertTriangle,
  Loader2,
  Info,
  ArrowUpRight,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// COMPANY · DETAIL (read-only viewer) — master-data administration
//
// Judgement:
//   • This screen is a VIEWER, not an editor. The user is here to read &
//     verify one company's stored profile, then decide: edit it, or remove it.
//   • Primary focus  = the read-only attribute set (the centre of gravity).
//   • Primary action = "Edit company" (the one filled button); delete is
//     guarded behind the overflow menu + a confirm prompt.
//
// Structure (deliberately NOT the SO-detail shape — no lifecycle bars / tabs):
//   1. Header   record-type label + name + LIVE parent→child hierarchy line +
//               status chips + back-nav + Edit + overflow (Edit / Delete)
//   2. Body     independently-collapsible disclosure sections of captioned,
//               read-only attribute displays (+ checkbox-style flags), beside
//               a hierarchy rail whose parent is a real navigation hop.
//
// Cross-cutting behaviours that are built for real:
//   • Init-time single-record load keyed off the route id → a skeleton/empty
//     state is a first-class variant of every value (re-triggerable via the
//     Refresh control, and on every parent↔child navigation).
//   • Hierarchy awareness: /design/companies (no id) opens the ROOT company
//     (parent blank); the sidebar deep-links a SUBSIDIARY (parent populated).
//     Clicking the parent navigates into the parent's own viewer.
//   • One interactive flag (Inactive) flips an in-memory value that the header
//     status chip reflects live — but nothing here persists (read-only posture).
//   • Confirmation-gated delete → spinner → success toast → back to the list.
// ════════════════════════════════════════════════════════════════════════════

const COMPANIES_PATH = "/design/companies";

// ════════════════════════════════════════════════════════════════════════════
// DATA  a small slice of a parent→child company tree (Nepal / NPR house data)
// ════════════════════════════════════════════════════════════════════════════

type Company = {
  id: string;
  name: string; // human name (required in the edit form)
  kind: "Root company" | "Subsidiary";
  parent: { id: string; name: string } | null; // blank for top-level records
  abbreviation: string | null; // short code (required)
  code: string | null; // company code
  docPrefix: string | null; // document-number prefix
  taxId: string | null; // tax identifier (PAN / VAT)
  address: string | null; // postal address
  phone: string | null;
  email: string | null;
  contactPerson: string | null;
  currencyCode: string | null; // resolved default-currency code (server-resolved)
  inactive: boolean; // archived flag (interactive in this view)
  isBaseCurrency: boolean; // currency-default preference (inert display)
};

const ROOT: Company = {
  id: "COMP-GRP",
  name: "Bizak Group Holdings Ltd.",
  kind: "Root company",
  parent: null,
  abbreviation: "BGH",
  code: "GRP-00",
  docPrefix: "BGH-",
  taxId: "301 992 145",
  address: "Hattisar Road, Kathmandu 44600, Bagmati, Nepal",
  phone: "+977 1 4412200",
  email: "corporate@bizakgroup.com",
  contactPerson: "Anjali Shrestha",
  currencyCode: "NPR",
  inactive: false,
  isBaseCurrency: true,
};

const COMPANIES: Record<string, Company> = {
  "COMP-GRP": ROOT,
  "COMP-NP02": {
    id: "COMP-NP02",
    name: "Bizak Nepal Pokhara Pvt. Ltd.",
    kind: "Subsidiary",
    parent: { id: "COMP-GRP", name: "Bizak Group Holdings Ltd." },
    abbreviation: "BNP",
    code: "NP-02",
    docPrefix: "NP02-",
    taxId: "600 455 782",
    address: "Industrial Area Sector 7, Pokhara 33700, Gandaki, Nepal",
    phone: "+977 61 538810",
    email: "pokhara@bizaknepal.com",
    contactPerson: null, // ← demonstrates the empty/absent field variant
    currencyCode: "NPR",
    inactive: false,
    isBaseCurrency: false,
  },
  "COMP-NP03": {
    id: "COMP-NP03",
    name: "Bizak Nepal Birgunj Pvt. Ltd.",
    kind: "Subsidiary",
    parent: { id: "COMP-GRP", name: "Bizak Group Holdings Ltd." },
    abbreviation: "BNB",
    code: "NP-03",
    docPrefix: "NP03-",
    taxId: "604 118 309",
    address: "Adarsha Nagar, Birgunj 44300, Madhesh, Nepal",
    phone: "+977 51 522410",
    email: "birgunj@bizaknepal.com",
    contactPerson: "Sito Ram Yadav",
    currencyCode: "NPR",
    inactive: true, // ← seeded archived record (status chip "Archived")
    isBaseCurrency: false,
  },
};

const DEFAULT_ID = "COMP-GRP";
const lookup = (id: string): Company | null => COMPANIES[id] ?? null;

// ════════════════════════════════════════════════════════════════════════════
// STATUS VOCABULARY  (the same five-tone chip the list / detail pages use)
// ════════════════════════════════════════════════════════════════════════════

type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";

const CHIP_BG: Record<Tone, string> = {
  positive: "bg-bz-fire/[0.18] text-bz-text",
  partial: "bg-bz-leaf/50 text-bz-text",
  pending: "bg-bz-paper-warm text-bz-text-muted",
  danger: "bg-[#FBE5E2] text-[#9A2E29]",
  neutral: "bg-bz-paper-warm text-bz-text",
};
const DOT_BG: Record<Tone, string> = {
  positive: "bg-bz-leaf-deep",
  partial: "bg-bz-fire",
  pending: "bg-bz-line",
  danger: "bg-[#C0413A]",
  neutral: "bg-bz-text-soft",
};

function StatusChip({ label, tone, dot = true }: { label: string; tone: Tone; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium ${CHIP_BG[tone]}`}>
      {dot && <span className={`size-1.5 shrink-0 rounded-bz-pill ${DOT_BG[tone]}`} />}
      {label}
    </span>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-bz-text-muted">{children}</p>;
}

// ════════════════════════════════════════════════════════════════════════════
// READ-ONLY ATTRIBUTE DISPLAY  the repeating workhorse — caption + static value
// States: loading (skeleton) · populated · empty/absent (placeholder)
// ════════════════════════════════════════════════════════════════════════════

function Field({
  caption,
  value,
  required,
  code,
  loading,
  span,
  empty = "—",
}: {
  caption: string;
  value?: string | null;
  required?: boolean;
  code?: boolean; // identifiers / codes → tabular-nums
  loading?: boolean;
  span?: boolean; // full width inside the 2-col grid
  empty?: string;
}) {
  return (
    <div className={cn(span && "sm:col-span-2")}>
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.07em] text-bz-text-soft">
        {caption}
        {required && (
          <span title="Required in the edit form" className="text-bz-leaf-deep">
            *
          </span>
        )}
      </p>
      {loading ? (
        <div className="mt-1.5 h-[15px] w-28 max-w-full animate-pulse rounded-bz-sm bg-bz-paper-warm" />
      ) : value ? (
        <p className={cn("mt-1 text-[13px] leading-snug text-bz-text", code && "tabular-nums tracking-[0.01em]")}>{value}</p>
      ) : (
        <p className="mt-1 text-[13px] text-bz-text-soft">{empty}</p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COLLAPSIBLE DISCLOSURE SECTION  expanded by default · each independent
// ════════════════════════════════════════════════════════════════════════════

function CollapsibleSection({
  icon: Icon,
  title,
  hint,
  defaultOpen = true,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-bz-paper-warm/40"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text">
          <Icon size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-bz-text">{title}</span>
          {hint && <span className="mt-0.5 block text-[11px] text-bz-text-muted">{hint}</span>}
        </span>
        <ChevronDown size={15} className={cn("shrink-0 text-bz-text-muted transition-transform", !open && "-rotate-90")} />
      </button>
      {open && <div className="border-t border-bz-line-soft px-5 py-5">{children}</div>}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BOOLEAN FLAG  checkbox-style status reflection (interactive | inert)
// ════════════════════════════════════════════════════════════════════════════

function CheckboxFlag({
  checked,
  label,
  hint,
  interactive,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint?: string;
  interactive?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const box = (
    <span
      className={cn(
        "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-bz-sm border transition-colors",
        checked ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface text-transparent",
      )}
    >
      <Check size={12} strokeWidth={3} />
    </span>
  );
  const body = (
    <span className="min-w-0 flex-1">
      <span className="block text-[12.5px] font-medium text-bz-text">{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] leading-snug text-bz-text-muted">{hint}</span>}
    </span>
  );

  if (!interactive) {
    return (
      <div className="flex items-start gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3">
        {box}
        {body}
        <span className="shrink-0 self-center text-[9.5px] font-semibold uppercase tracking-[0.07em] text-bz-text-soft">Inert</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className="flex w-full items-start gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface px-4 py-3 text-left hover:bg-bz-paper-warm/60"
    >
      {box}
      {body}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RECORD-ACTION MENU  collapsed overflow → Edit / Delete (extensible)
// ════════════════════════════════════════════════════════════════════════════

function OverflowMenu({ onEdit, onDelete, disabled }: { onEdit: () => void; onDelete: () => void; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex size-9 items-center justify-center rounded-bz-md border text-bz-text disabled:opacity-50",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:bg-bz-paper-warm",
        )}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && !disabled && (
        <div
          role="menu"
          className="absolute right-0 top-[42px] z-30 w-52 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm"
          >
            <Pencil size={13} className="text-bz-text" />
            <span className="text-[12px] font-medium text-bz-text">Edit company</span>
          </button>
          <div className="my-1 h-px bg-bz-line-soft" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FBE5E2]"
          >
            <Trash2 size={13} className="text-[#9A2E29]" />
            <span className="text-[12px] font-medium text-[#9A2E29]">Delete company</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG  generic confirm/cancel — subsidiary-framed delete copy
// ════════════════════════════════════════════════════════════════════════════

function ConfirmDeleteDialog({
  open,
  record,
  deleting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  record: Company | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  const name = record?.name ?? "this company";
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-24">
      <div onClick={deleting ? undefined : onClose} className="absolute inset-0 bg-bz-olive/35 backdrop-blur-[1px]" aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-[460px] overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-bz-line-soft bg-[#FBE5E2] px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#9A2E29]" />
            <p className="text-[13px] font-semibold text-[#9A2E29]">Delete company?</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex size-7 items-center justify-center rounded-bz-sm border border-[#9A2E29]/25 bg-bz-surface text-[#9A2E29] hover:bg-[#FBE5E2] disabled:opacity-40"
          >
            <X size={11} />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-[12.5px] leading-relaxed text-bz-text">
            Removing <span className="font-semibold">{name}</span>{" "}
            {record?.parent ? (
              <>
                detaches this subsidiary from its parent{" "}
                <span className="font-semibold">{record.parent.name}</span> and permanently deletes its company profile,
                document series and contact details.
              </>
            ) : (
              <>
                permanently deletes this top-level company along with its profile and document series. Any subsidiaries
                beneath it are left without a parent.
              </>
            )}{" "}
            This can't be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-9 min-w-[120px] items-center justify-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3.5 text-[12px] font-semibold text-white hover:opacity-95 disabled:opacity-70"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            {deleting ? "Deleting…" : "Delete company"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST  transient, auto-dismissing success notification
// ════════════════════════════════════════════════════════════════════════════

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-[420px] items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18]">
          <Check size={13} className="text-bz-leaf-deep" />
        </span>
        <p className="min-w-0 break-words text-[12.5px] font-medium text-bz-text">{message}</p>
        <button type="button" onClick={onClose} className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER  record-type label · name · live hierarchy line · status · actions
// ════════════════════════════════════════════════════════════════════════════

function RecordHeader({
  record,
  loading,
  inactive,
  onEdit,
  onDelete,
  onRefresh,
  onOpenParent,
}: {
  record: Company | null;
  loading: boolean;
  inactive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onOpenParent: () => void;
}) {
  return (
    <header className="border-b border-bz-line-soft bg-bz-paper px-4 pb-6 pt-6 md:px-8">
      <Link
        to={COMPANIES_PATH}
        title="Back to all companies"
        className="inline-flex items-center gap-1 text-[12px] text-bz-text-muted hover:text-bz-text"
      >
        <ChevronLeft size={13} /> Companies
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          {/* record-type identity label (non-interactive) */}
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">Company</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {loading ? (
              <div className="h-7 w-64 max-w-full animate-pulse rounded-bz-sm bg-bz-paper-warm" />
            ) : record ? (
              <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">{record.name}</h1>
            ) : (
              <h1 className="text-[24px] font-semibold tracking-tight text-bz-text-soft">Company not found</h1>
            )}
            {!loading && record && (
              <>
                <StatusChip
                  label={inactive ? "Archived" : "Active"}
                  tone={inactive ? "neutral" : "positive"}
                />
                <StatusChip label={record.kind} tone="pending" dot={false} />
              </>
            )}
          </div>

          {/* live parent → child hierarchy line */}
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-bz-text-muted">
            <GitBranch size={12} className="shrink-0 text-bz-text-soft" />
            {loading ? (
              <span className="h-3 w-48 max-w-full animate-pulse rounded-bz-sm bg-bz-paper-warm" />
            ) : record?.parent ? (
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <button onClick={onOpenParent} className="font-medium text-bz-text hover:underline">
                  {record.parent.name}
                </button>
                <ChevronDown size={11} className="-rotate-90 text-bz-text-soft" />
                <span className="text-bz-text-muted">{record.name}</span>
              </span>
            ) : record ? (
              <span>
                Top-level company — <span className="tabular-nums">{record.code ?? record.id}</span> · no parent in the hierarchy
              </span>
            ) : (
              <span className="text-bz-text-soft">No record loaded</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Reload record"
            title="Reload this record"
            className="flex size-9 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50"
            disabled={loading || !record}
          >
            <Pencil size={13} /> Edit company
          </button>
          <OverflowMenu onEdit={onEdit} onDelete={onDelete} disabled={loading || !record} />
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RAIL  hierarchy (parent → current) + at-a-glance
// ════════════════════════════════════════════════════════════════════════════

function HierNode({
  name,
  caption,
  current,
  onClick,
}: {
  name: string;
  caption: string;
  current?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-bz-md",
          current ? "bg-bz-fire/[0.18] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted",
        )}
      >
        <Building2 size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">{caption}</span>
        <span className={cn("flex items-center gap-1 truncate text-[12.5px] font-medium", current ? "text-bz-text" : "text-bz-text")}>
          <span className="truncate">{name}</span>
          {onClick && <ArrowUpRight size={11} className="shrink-0 text-bz-text-muted" />}
        </span>
      </span>
    </>
  );
  const base = "flex items-center gap-3 rounded-bz-md px-2 py-1.5";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(base, "w-full text-left hover:bg-bz-paper-warm")}>
        {inner}
      </button>
    );
  }
  return <div className={cn(base, current && "bg-bz-fire/[0.07] ring-1 ring-bz-fire/30")}>{inner}</div>;
}

function HierarchyRail({ record, loading, onOpenParent }: { record: Company | null; loading: boolean; onOpenParent: () => void }) {
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
      <div className="flex items-center gap-2">
        <GitBranch size={13} className="text-bz-text-muted" />
        <CardLabel>Hierarchy</CardLabel>
      </div>
      {loading ? (
        <div className="mt-4 flex flex-col gap-2">
          <div className="h-10 w-full animate-pulse rounded-bz-md bg-bz-paper-warm" />
          <div className="ml-[15px] h-4 w-px bg-bz-line" />
          <div className="h-10 w-full animate-pulse rounded-bz-md bg-bz-paper-warm" />
        </div>
      ) : record ? (
        <div className="mt-4 flex flex-col">
          {record.parent ? (
            <>
              <HierNode caption="Parent company" name={record.parent.name} onClick={onOpenParent} />
              <div className="ml-[19px] h-4 w-px bg-bz-line" />
              <HierNode caption="This company" name={record.name} current />
            </>
          ) : (
            <>
              <HierNode caption="This company" name={record.name} current />
              <p className="mt-3 inline-flex items-start gap-1.5 text-[11px] leading-relaxed text-bz-text-muted">
                <Info size={12} className="mt-0.5 shrink-0 text-bz-text-soft" />
                Top-level company — it sits at the root of the group tree and has no parent.
              </p>
            </>
          )}
        </div>
      ) : (
        <p className="mt-4 text-[12px] text-bz-text-soft">No hierarchy to show.</p>
      )}
    </div>
  );
}

function GlanceRow({ label, value, loading, code }: { label: string; value?: string | null; loading?: boolean; code?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line-soft py-2.5 first:border-t-0 first:pt-0">
      <span className="text-[11.5px] text-bz-text-muted">{label}</span>
      {loading ? (
        <span className="h-3 w-16 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
      ) : (
        <span className={cn("text-[12.5px] font-medium text-bz-text", code && "tabular-nums")}>{value || <span className="text-bz-text-soft">—</span>}</span>
      )}
    </div>
  );
}

function GlanceRail({ record, loading, inactive }: { record: Company | null; loading: boolean; inactive: boolean }) {
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
      <div className="flex items-center gap-2">
        <Info size={13} className="text-bz-text-muted" />
        <CardLabel>At a glance</CardLabel>
      </div>
      <div className="mt-3">
        <GlanceRow label="Record ID" value={record?.id} loading={loading} code />
        <GlanceRow label="Type" value={record?.kind} loading={loading} />
        <GlanceRow label="Default currency" value={record?.currencyCode} loading={loading} code />
        <div className="flex items-center justify-between gap-3 border-t border-bz-line-soft py-2.5">
          <span className="text-[11.5px] text-bz-text-muted">Status</span>
          {loading ? (
            <span className="h-4 w-16 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          ) : record ? (
            <StatusChip label={inactive ? "Archived" : "Active"} tone={inactive ? "neutral" : "positive"} />
          ) : (
            <span className="text-bz-text-soft">—</span>
          )}
        </div>
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
      <span className="text-bz-text-muted">Administration</span>
      <ChevronDown size={11} className="-rotate-90 text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Companies</span>
    </>
  );
}

export function CompanyDetailDesignPage() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const id = params.id ?? DEFAULT_ID;

  // ── init-time single-record load (skeleton → resolved) ──
  const [record, setRecord] = React.useState<Company | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    setRecord(null);
    const t = setTimeout(() => {
      setRecord(lookup(id));
      setLoading(false);
    }, 750);
    return () => clearTimeout(t);
  }, [id, reloadKey]);

  // ── interactive Inactive flag (in-memory only; reflected live in the header) ──
  const [inactiveLocal, setInactiveLocal] = React.useState(false);
  React.useEffect(() => {
    if (record) setInactiveLocal(record.inactive);
  }, [record]);

  // ── delete flow + toast ──
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  // surface a toast handed over by a redirect (e.g. after delete)
  React.useEffect(() => {
    const handed = (location.state as { toast?: string } | null)?.toast;
    if (handed) {
      setToast(handed);
      window.history.replaceState({}, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (msg: string) => setToast(msg);
  const goEdit = () => notify(`Opening the edit form for ${record?.name ?? "this company"}…`);
  const openParent = () => {
    if (record?.parent) navigate(`${COMPANIES_PATH}/${record.parent.id}`);
  };

  const confirmDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setConfirmOpen(false);
      navigate(COMPANIES_PATH, { state: { toast: `${record?.name ?? "Company"} deleted.` } });
    }, 750);
  };

  const notFound = !loading && !record;

  return (
    <AppShell
      breadcrumb={<Breadcrumb />}
      overlay={
        <>
          <ConfirmDeleteDialog
            open={confirmOpen}
            record={record}
            deleting={deleting}
            onClose={() => !deleting && setConfirmOpen(false)}
            onConfirm={confirmDelete}
          />
          {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </>
      }
    >
      <RecordHeader
        record={record}
        loading={loading}
        inactive={inactiveLocal}
        onEdit={goEdit}
        onDelete={() => setConfirmOpen(true)}
        onRefresh={() => setReloadKey((k) => k + 1)}
        onOpenParent={openParent}
      />

      {notFound && (
        <div className="px-4 pt-5 md:px-8">
          <div className="flex items-start gap-2.5 rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/50 px-4 py-3 text-[12px] text-bz-text-muted">
            <Info size={14} className="mt-0.5 shrink-0 text-bz-text-soft" />
            <span>
              We couldn't load a company for <span className="font-semibold tabular-nums text-bz-text">{id}</span>. Every field
              below shows its empty state.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 px-4 py-6 md:px-8 lg:grid-cols-[1fr_320px]">
        {/* ── main: collapsible attribute groups ── */}
        <div className="flex flex-col gap-4">
          <CollapsibleSection icon={Building2} title="Profile" hint="Identity & numbering">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field caption="Parent company" value={record?.parent?.name} loading={loading} empty={record ? "No parent (root company)" : "—"} />
              <Field caption="Company name" required value={record?.name} loading={loading} />
              <Field caption="Abbreviation" required code value={record?.abbreviation} loading={loading} />
              <Field caption="Document no. prefix" code value={record?.docPrefix} loading={loading} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon={Landmark} title="Registration & currency" hint="Codes, tax identity & reporting currency">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field caption="Company code" code value={record?.code} loading={loading} />
              <Field caption="Tax identification no. (PAN)" code value={record?.taxId} loading={loading} />
              <Field caption="Default currency" code value={record?.currencyCode} loading={loading} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon={Contact} title="Contact & address" hint="Where to reach this company">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field caption="Registered address" span value={record?.address} loading={loading} />
              <Field caption="Phone" code value={record?.phone} loading={loading} />
              <Field caption="Email" value={record?.email} loading={loading} />
              <Field caption="Contact person" value={record?.contactPerson} loading={loading} empty="Not set" />
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon={Settings2} title="Status & preferences" hint="Boolean flags on this record">
            {loading ? (
              <div className="flex flex-col gap-3">
                <div className="h-14 w-full animate-pulse rounded-bz-md bg-bz-paper-warm" />
                <div className="h-14 w-full animate-pulse rounded-bz-md bg-bz-paper-warm" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <CheckboxFlag
                  interactive
                  checked={inactiveLocal}
                  onChange={setInactiveLocal}
                  label="Inactive / archived"
                  hint="Hidden from selection lists and blocked on new transactions."
                />
                <CheckboxFlag
                  checked={!!record?.isBaseCurrency}
                  label="Use as the group's base reporting currency"
                  hint="Display-only — set on the parent company that anchors consolidation."
                />
                <p className="inline-flex items-start gap-1.5 text-[11px] leading-relaxed text-bz-text-soft">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  This is a read-only viewer — toggling a flag changes it on screen only and is never saved. Use{" "}
                  <span className="font-medium text-bz-text-muted">Edit company</span> to make persistent changes.
                </p>
              </div>
            )}
          </CollapsibleSection>
        </div>

        {/* ── rail: hierarchy + at-a-glance ── */}
        <aside className="flex flex-col gap-4">
          <HierarchyRail record={record} loading={loading} onOpenParent={openParent} />
          <GlanceRail record={record} loading={loading} inactive={inactiveLocal} />
        </aside>
      </div>
    </AppShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPANY · LIST  the parent listing — where the viewer's back-nav and the
// post-delete redirect actually land. Rows open the read-only detail viewer.
// ════════════════════════════════════════════════════════════════════════════

const LTH = "px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted whitespace-nowrap";

function ListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-bz-line-soft px-4 py-4 first:border-t-0">
          <div className="size-8 shrink-0 animate-pulse rounded-bz-md bg-bz-paper-warm" />
          <div className="h-3 w-40 max-w-[40%] animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="ml-auto h-5 w-20 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
        </div>
      ))}
    </div>
  );
}

export function CompanyListDesignPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);
  const rows = React.useMemo(() => Object.values(COMPANIES), []);

  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // surface a toast handed over by a redirect (e.g. after a delete on the detail page)
  React.useEffect(() => {
    const handed = (location.state as { toast?: string } | null)?.toast;
    if (handed) {
      setToast(handed);
      window.history.replaceState({}, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const open = (id: string) => navigate(`${COMPANIES_PATH}/${id}`);

  return (
    <AppShell breadcrumb={<Breadcrumb />} overlay={toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}>
      <header className="border-b border-bz-line-soft bg-bz-paper px-4 pb-6 pt-6 md:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">Master data</p>
        <div className="mt-1.5 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Companies</h1>
              <span className="inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold tabular-nums text-bz-text-muted">
                {rows.length}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-bz-text-muted">
              The group's legal entities and their subsidiaries — open one to review its profile.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToast("Opening the new company form…")}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
          >
            <Plus size={14} /> New company
          </button>
        </div>
      </header>

      <div className="px-4 py-6 md:px-8">
        <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          {loading ? (
            <ListSkeleton />
          ) : (
            <>
              {/* desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left" style={{ minWidth: 820 }}>
                  <thead>
                    <tr className="border-b border-bz-line bg-bz-paper-warm">
                      <th className={LTH}>Company</th>
                      <th className={LTH}>Parent</th>
                      <th className={LTH}>Type</th>
                      <th className={LTH}>Tax ID (PAN)</th>
                      <th className={LTH}>Currency</th>
                      <th className={LTH}>Status</th>
                      <th className="w-9 px-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => open(c.id)}
                        className="cursor-pointer border-b border-bz-line-soft last:border-0 hover:bg-bz-paper-warm/50"
                      >
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
                              <Building2 size={15} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-medium text-bz-text">{c.name}</span>
                              <span className="block text-[10.5px] tabular-nums text-bz-text-soft">
                                {c.id}
                                {c.code ? ` · ${c.code}` : ""}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-bz-text-muted">
                          {c.parent ? c.parent.name : <span className="text-bz-text-soft">— Root</span>}
                        </td>
                        <td className="px-3 py-3">
                          <StatusChip label={c.kind} tone="pending" dot={false} />
                        </td>
                        <td className="px-3 py-3 text-[12px] tabular-nums text-bz-text-muted">{c.taxId ?? "—"}</td>
                        <td className="px-3 py-3 text-[12px] tabular-nums text-bz-text-muted">{c.currencyCode ?? "—"}</td>
                        <td className="px-3 py-3">
                          <StatusChip label={c.inactive ? "Archived" : "Active"} tone={c.inactive ? "neutral" : "positive"} />
                        </td>
                        <td className="px-2 py-3 text-right">
                          <ChevronRight size={15} className="text-bz-text-soft" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* mobile cards */}
              <div className="flex flex-col gap-2.5 p-3 md:hidden">
                {rows.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => open(c.id)}
                    className="rounded-bz-md border border-bz-line-soft bg-bz-surface p-4 text-left hover:bg-bz-paper-warm/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
                          <Building2 size={15} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13.5px] font-medium text-bz-text">{c.name}</span>
                          <span className="block text-[10.5px] tabular-nums text-bz-text-soft">
                            {c.id}
                            {c.code ? ` · ${c.code}` : ""}
                          </span>
                        </span>
                      </span>
                      <StatusChip label={c.inactive ? "Archived" : "Active"} tone={c.inactive ? "neutral" : "positive"} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-bz-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <GitBranch size={11} className="text-bz-text-soft" /> {c.parent ? c.parent.name : "Root company"}
                      </span>
                      <span className="tabular-nums">PAN {c.taxId ?? "—"}</span>
                      <span className="tabular-nums">{c.currencyCode ?? "—"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
