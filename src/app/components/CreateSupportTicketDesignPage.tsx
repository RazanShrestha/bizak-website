// ─────────────────────────────────────────────────────────────────────────────
// CreateSupportTicketDesignPage
//
// A CREATE-ONLY authoring screen: an internal support/CRM operator logs a new
// customer-support ticket, then commits it. The page opens blank, has no
// edit/prefill path, and on a successful commit it clears itself and leaves.
//
// Primary action  →  COMMIT THE TICKET.
//   The single hard gate is a filled contact-email; everything else is optional.
//   Two submit instances (sticky header + docked footer) read ONE shared
//   `posting` stream, so they flip to the busy/disabled state in lockstep.
//
// Layout (invented for this page, not a relabel of the sales-order form):
//   sticky form header (Back · overflow · Create)
//   → full-width COMPOSE HEAD (Subject title + the email gate)
//   → BODY / PROPERTIES split
//        left  : tabbed content switcher (Description WYSIWYG · Internal notes)
//        right : Properties rail (priority · issue type · dates) + Screenshot
//   → docked footer (live validity + the second Create instance)
// ─────────────────────────────────────────────────────────────────────────────
import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  ArrowLeft, MoreHorizontal, RotateCcw, Check, Loader2, X, ChevronDown,
  ChevronLeft, ChevronRight, Search, Plus, ListChecks, CalendarDays, ImagePlus,
  Trash2, Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlertTriangle, Mail, Gauge, Tag, FileText, StickyNote, SlidersHorizontal,
  Paperclip, Info, RefreshCw,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

const NUM = "tabular-nums";
const TICKET_LIST_HREF = "/design/support-tickets";

// ── Option shape — both single-select pickers bind a primitive id, never the object
type Opt = { id: string; label: string; sub?: string; dot?: string };

// ── Seed data (each list is "fetched once" on page init, see useEffect below) ──
const PRIORITY_SEED: Opt[] = [
  { id: "pri-urgent", label: "Urgent", sub: "Production blocked · respond now", dot: "bg-[#C0413A]" },
  { id: "pri-high", label: "High", sub: "Significant impact", dot: "bg-bz-fire" },
  { id: "pri-normal", label: "Normal", sub: "Standard turnaround", dot: "bg-bz-leaf-deep" },
  { id: "pri-low", label: "Low", sub: "Minor · whenever", dot: "bg-bz-text-soft" },
];

const CATEGORY_LABELS = [
  "Technical support", "Billing & invoicing", "Feature request", "Data import",
  "Account access", "Reporting & dashboards", "Onboarding", "Integration / API",
  "Bug report", "Performance", "POS terminal", "Inventory sync",
  "Bank reconciliation", "Tax & compliance", "Subscription / plan", "Email & notifications",
  "Mobile app", "Permissions & roles", "Document management", "Workflow automation",
  "Multi-currency", "Payroll",
];
const CATEGORY_SEED: Opt[] = CATEGORY_LABELS.map((label) => ({
  id: "cat-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  label,
}));

const PICKER_PAGE = 6;
const SEARCH_THRESHOLD = 3;

// ── Date helpers ──────────────────────────────────────────────────────────────
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const TODAY_ISO = toISO(new Date());
function parseISO(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}
function fmtDate(iso: string): string {
  const d = parseISO(iso);
  if (!d) return iso;
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}

// ── Record shape — pickers store primitive ids, not objects ────────────────────
type TicketDraft = {
  subject: string;
  contactEmail: string;
  priorityId: string | null;
  categoryId: string | null;
  openDate: string | null;
  closeDate: string | null;
  screenshot: string | null;     // base64 data URL
  screenshotName: string | null;
  descriptionHtml: string;       // from the WYSIWYG
  internalNotes: string;         // plain text, second tab pane
};
const blankDraft = (): TicketDraft => ({
  subject: "",
  contactEmail: "",
  priorityId: null,
  categoryId: null,
  openDate: TODAY_ISO,           // open date seeds to today
  closeDate: null,
  screenshot: null,
  screenshotName: null,
  descriptionHtml: "",
  internalNotes: "",
});

// ── Shared hooks ──────────────────────────────────────────────────────────────
function useAnchoredPos(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) { setPos(null); return; }
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, anchorRef]);
  return pos;
}

function useDismiss(open: boolean, onClose: () => void, refs: React.RefObject<HTMLElement | null>[], closeOnScroll = false) {
  React.useEffect(() => {
    if (!open) return;
    const inside = (t: Node) => refs.some((r) => r.current && r.current.contains(t));
    const onDown = (e: MouseEvent) => { if (!inside(e.target as Node)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    const onScroll = (e: Event) => {
      // ignore scrolls that originate inside the floating surface itself
      if (e.target instanceof Node && refs.some((r) => r.current && r.current.contains(e.target as Node))) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    if (closeOnScroll) window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      if (closeOnScroll) window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose, closeOnScroll]);
}

// ── Atoms ─────────────────────────────────────────────────────────────────────
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-bz-lg border border-bz-line-soft bg-bz-surface", className)}>{children}</div>;
}

function CardHead({ icon: Icon, title, hint }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-bz-line-soft px-4 py-2.5">
      <Icon size={14} className="shrink-0 text-bz-text-muted" />
      <h2 className="text-[12.5px] font-semibold text-bz-text">{title}</h2>
      {hint && <span className="ml-auto truncate text-[10.5px] text-bz-text-soft">{hint}</span>}
    </div>
  );
}

function Field({ label, required, hint, htmlFor, className, children }: {
  label?: string; required?: boolean; hint?: React.ReactNode; htmlFor?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <label htmlFor={htmlFor} className="text-[11px] font-medium text-bz-text-muted">
            {label}{required && <span className="ml-0.5 text-bz-fire" title="Required">*</span>}
          </label>
          {hint ? <span className="text-[10px] text-bz-text-soft">{hint}</span> : null}
        </div>
      )}
      {children}
    </div>
  );
}

const GHOST_BTN = "inline-flex items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

// The submit / commit control. Multiple instances share `posting` + `disabled`.
function CreateButton({ posting, disabled, onClick, size = "md", label = "Create ticket", className }: {
  posting: boolean; disabled: boolean; onClick: () => void; size?: "sm" | "md"; label?: string; className?: string;
}) {
  const px = size === "md" ? "h-9 px-3.5 text-[12.5px]" : "h-8 px-3 text-[12px]";
  const ic = size === "md" ? 14 : 12;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || posting}
      aria-busy={posting}
      className={cn("inline-flex items-center gap-1.5 rounded-bz-md bg-bz-deep font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-45 disabled:cursor-not-allowed transition-opacity", px, className)}
    >
      {posting ? <Loader2 size={ic} className="animate-spin" /> : <Check size={ic} />}
      {posting ? "Posting…" : label}
    </button>
  );
}

// ── Overflow action menu (toggle-open; currently surfaces "Reset form") ─────────
function OverflowMenu({ onReset, disabled }: { onReset: () => void; disabled: boolean }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchoredPos(open, btnRef);
  useDismiss(open, () => setOpen(false), [btnRef, menuRef], true);
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn("flex size-9 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text transition-colors", open && "border-bz-text text-bz-text")}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ position: "fixed", top: pos.top, right: window.innerWidth - (pos.left + pos.width) }}
          className="z-50 w-44 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
        >
          <button
            role="menuitem"
            disabled={disabled}
            onClick={() => { setOpen(false); onReset(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-bz-text hover:bg-bz-paper-warm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} className="text-bz-text-muted" /> Reset the form
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}

// ── Short free-text input ───────────────────────────────────────────────────────
function TextInput({ id, value, onChange, placeholder, disabled, type = "text", trailing }: {
  id?: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; type?: string; trailing?: React.ReactNode;
}) {
  return (
    <div className={cn("flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 transition-colors focus-within:border-bz-text", disabled && "bg-bz-paper-warm")}>
      <input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-full min-w-0 flex-1 bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft", disabled && "text-bz-text-muted")}
      />
      {trailing}
    </div>
  );
}

// ── Static single-select picker (priority) — small fixed list, no search ─────────
function StaticSelect({ value, options, loading, disabled, placeholder, onChange, icon: Icon }: {
  value: Opt | null; options: Opt[]; loading: boolean; disabled: boolean; placeholder: string;
  onChange: (id: string | null) => void; icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchoredPos(open, btnRef);
  useDismiss(open, () => setOpen(false), [btnRef, menuRef], true);
  const locked = disabled || loading;
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={locked}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          locked ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        )}
      >
        {loading ? <Loader2 size={13} className="shrink-0 animate-spin text-bz-fire" /> : value?.dot ? <span className={cn("size-2 shrink-0 rounded-bz-pill", value.dot)} /> : <Icon size={13} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("min-w-0 flex-1 truncate text-[13px]", value ? "text-bz-text" : "text-bz-text-soft")}>
          {loading ? "Loading priorities…" : value ? value.label : placeholder}
        </span>
        {!locked && (
          value
            ? <span role="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={11} /></span>
            : <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
        )}
      </button>
      {open && pos && createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 220) }} className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          {options.map((o) => {
            const selected = value?.id === o.id;
            return (
              <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }} className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}>
                <span className={cn("size-2 shrink-0 rounded-bz-pill", o.dot ?? "bg-bz-text-soft")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                  {o.sub && <span className="block truncate text-[10.5px] text-bz-text-soft">{o.sub}</span>}
                </span>
                {selected && <Check size={13} className="shrink-0 text-bz-text" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}

// ── Searchable, paginated single-select picker (issue type / category) ──────────
function SearchSelect({ value, options, loading, disabled, placeholder, onChange, onAddNew }: {
  value: Opt | null; options: Opt[]; loading: boolean; disabled: boolean; placeholder: string;
  onChange: (id: string | null) => void; onAddNew: (label: string) => void;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchoredPos(open, btnRef);
  const [raw, setRaw] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [more, setMore] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  const locked = disabled || loading;

  useDismiss(open, () => setOpen(false), [btnRef, panelRef], true);
  React.useEffect(() => {
    if (open) {
      setRaw(""); setPages(1); setHi(0); setMore(false);
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const q = raw.trim().toLowerCase();
  const filterActive = q.length >= SEARCH_THRESHOLD;              // type-to-filter only past 3 chars
  const filtered = filterActive ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const visible = filtered.slice(0, pages * PICKER_PAGE);
  const hasMore = visible.length < filtered.length;
  const canAddNew = raw.trim().length > 0 && !options.some((o) => o.label.toLowerCase() === q);

  const onScrollList = () => {
    const el = listRef.current;
    if (!el || more || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setMore(true);
      window.setTimeout(() => { setPages((p) => p + 1); setMore(false); }, 420);  // lazy-extend on scroll
    }
  };
  const pick = (o: Opt) => { onChange(o.id); setOpen(false); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, visible.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const o = visible[hi]; if (o) pick(o); }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={locked}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          locked ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        )}
      >
        {loading ? <Loader2 size={13} className="shrink-0 animate-spin text-bz-fire" /> : <Tag size={13} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("min-w-0 flex-1 truncate text-[13px]", value ? "text-bz-text" : "text-bz-text-soft")}>
          {loading ? "Loading categories…" : value ? value.label : placeholder}
        </span>
        {!locked && (
          value
            ? <span role="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={11} /></span>
            : <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
        )}
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          onKeyDown={onKey}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 268) }}
          className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
        >
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={12} className="shrink-0 text-bz-text-muted" />
              <input
                ref={inputRef}
                value={raw}
                onChange={(e) => { setRaw(e.target.value); setPages(1); setHi(0); }}
                placeholder="Search issue types…"
                className="min-w-0 flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
              />
              {raw && <button onClick={() => setRaw("")} aria-label="Clear search" className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"><X size={10} /></button>}
            </div>
            {raw.trim().length > 0 && !filterActive && (
              <p className="mt-1.5 px-0.5 text-[10px] text-bz-text-soft">Type {SEARCH_THRESHOLD - raw.trim().length} more character{SEARCH_THRESHOLD - raw.trim().length === 1 ? "" : "s"} to filter · showing all</p>
            )}
          </div>

          <div ref={listRef} onScroll={onScrollList} className="max-h-[252px] overflow-y-auto py-1">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-7 text-center">
                <Search size={15} className="text-bz-text-soft" />
                <p className="text-[11.5px] font-medium text-bz-text-muted">{filterActive ? `No matches for “${raw.trim()}”` : "No issue types available"}</p>
                {canAddNew && <p className="text-[10.5px] text-bz-text-soft">Add it as a new entry below.</p>}
              </div>
            ) : (
              visible.map((o, i) => {
                const selected = value?.id === o.id;
                const active = i === hi;
                return (
                  <button
                    key={o.id}
                    onMouseEnter={() => setHi(i)}
                    onClick={() => pick(o)}
                    className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors", active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}
                  >
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-bz-text">{o.label}</span>
                    {selected && <Check size={13} className="shrink-0 text-bz-text" />}
                  </button>
                );
              })
            )}
            {more && (
              <div className="flex items-center justify-center gap-2 py-2.5 text-bz-text-muted">
                <Loader2 size={12} className="animate-spin text-bz-fire" /> <span className="text-[11px]">Loading more…</span>
              </div>
            )}
            {!more && !hasMore && visible.length > 0 && filtered.length > PICKER_PAGE && (
              <p className={cn("px-3 py-2 text-center text-[10px] text-bz-text-soft", NUM)}>{filtered.length} results · end of list</p>
            )}
          </div>

          <div className="flex items-center gap-1 border-t border-bz-line-soft bg-bz-paper-warm/40 p-1.5">
            <button
              disabled={!canAddNew}
              onClick={() => { const label = raw.trim(); setOpen(false); onAddNew(label); }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-bz-sm px-2 py-1.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={12} className="text-bz-leaf-deep" /> {canAddNew ? `Add “${raw.trim()}”` : "Add new"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-bz-sm px-2 py-1.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-surface hover:text-bz-text"
            >
              <ListChecks size={12} /> Advanced search
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ── Date-picker input (popover calendar) ────────────────────────────────────────
function DateField({ value, onChange, disabled, derivedHint }: {
  value: string | null; onChange: (iso: string | null) => void; disabled?: boolean; derivedHint?: string;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const popRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchoredPos(open, btnRef);
  useDismiss(open, () => setOpen(false), [btnRef, popRef], true);
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          disabled ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        )}
      >
        <CalendarDays size={13} className="shrink-0 text-bz-text-muted" />
        <span className={cn("min-w-0 flex-1 truncate text-[13px]", NUM, value ? "text-bz-text" : "text-bz-text-soft")}>{value ? fmtDate(value) : "Pick a date"}</span>
        {derivedHint && !disabled && <span className="shrink-0 rounded-bz-sm bg-bz-leaf/40 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text">{derivedHint}</span>}
        {value && !disabled && <span role="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={11} /></span>}
      </button>
      {open && pos && createPortal(
        <div ref={popRef} style={{ position: "fixed", top: pos.top, left: pos.left }} className="z-50 w-[268px] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface p-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          <input
            defaultValue={value ?? ""}
            placeholder="YYYY-MM-DD"
            onBlur={(e) => { const d = parseISO(e.target.value); if (d) onChange(toISO(d)); }}
            onKeyDown={(e) => { if (e.key === "Enter") { const d = parseISO((e.target as HTMLInputElement).value); if (d) { onChange(toISO(d)); setOpen(false); } } }}
            className={cn("mb-2 h-8 w-full rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5 text-[12.5px] text-bz-text outline-none focus:border-bz-text", NUM)}
          />
          <Calendar valueISO={value} onPick={(iso) => { onChange(iso); setOpen(false); }} />
        </div>,
        document.body,
      )}
    </>
  );
}

function Calendar({ valueISO, onPick }: { valueISO: string | null; onPick: (iso: string) => void }) {
  const sel = valueISO ? parseISO(valueISO) : null;
  const init = sel ?? new Date();
  const [view, setView] = React.useState({ y: init.getFullYear(), m: init.getMonth() });
  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const shift = (n: number) => setView((v) => { const d = new Date(v.y, v.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <button onClick={() => shift(-1)} aria-label="Previous month" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><ChevronLeft size={14} /></button>
        <span className="text-[12.5px] font-semibold text-bz-text">{MONTHS[view.m]} {view.y}</span>
        <button onClick={() => shift(1)} aria-label="Next month" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {DOW.map((d) => <span key={d} className="flex h-6 items-center justify-center text-[9.5px] font-semibold uppercase text-bz-text-soft">{d}</span>)}
        {cells.map((d, i) => {
          if (d == null) return <span key={i} />;
          const iso = `${view.y}-${pad(view.m + 1)}-${pad(d)}`;
          const isSel = !!sel && sel.getFullYear() === view.y && sel.getMonth() === view.m && sel.getDate() === d;
          const isToday = iso === TODAY_ISO;
          return (
            <button key={i} onClick={() => onPick(iso)} className={cn("flex h-7 items-center justify-center rounded-bz-sm text-[12px] transition-colors", NUM, isSel ? "bg-bz-fire font-semibold text-bz-olive" : isToday ? "bg-bz-paper-warm font-semibold text-bz-text" : "text-bz-text hover:bg-bz-paper-warm")}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── Image upload with inline preview (file → base64 data URL) ───────────────────
function ImageUpload({ value, name, onPick, onClear, disabled }: {
  value: string | null; name: string | null; onPick: (dataUrl: string, name: string) => void; onClear: () => void; disabled: boolean;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const read = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") onPick(reader.result, file.name); };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) read(f); e.target.value = ""; }}
      />
      {value ? (
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          {/* dynamic data URL — inline style is the only way to feed the src/bg */}
          <img src={value} alt="Screenshot preview" className="block max-h-44 w-full bg-bz-paper-warm object-contain" />
          <div className="flex items-center gap-2 border-t border-bz-line-soft px-2.5 py-2">
            <Paperclip size={12} className="shrink-0 text-bz-text-muted" />
            <span className="min-w-0 flex-1 truncate text-[11.5px] text-bz-text">{name ?? "screenshot"}</span>
            <button disabled={disabled} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded-bz-sm px-1.5 py-1 text-[11px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-40"><RefreshCw size={11} /> Replace</button>
            <button disabled={disabled} onClick={onClear} className="inline-flex items-center gap-1 rounded-bz-sm px-1.5 py-1 text-[11px] font-medium text-[#9A2E29] hover:bg-[#FBE7E5] disabled:opacity-40"><Trash2 size={11} /> Remove</button>
          </div>
        </div>
      ) : (
        <button
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/30 px-4 py-7 text-center transition-colors hover:border-bz-line hover:bg-bz-paper-warm/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted"><ImagePlus size={15} /></span>
          <span className="text-[12px] font-medium text-bz-text">Add a screenshot</span>
          <span className="text-[10.5px] text-bz-text-soft">PNG or JPG · attached inline to the ticket</span>
        </button>
      )}
    </div>
  );
}

// ── Rich-text (WYSIWYG) editor — produces HTML, retained when its tab is hidden ──
function RichTextEditor({ disabled, onChange }: { disabled: boolean; onChange: (html: string) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [focused, setFocused] = React.useState(false);
  const [empty, setEmpty] = React.useState(true);
  const sync = () => {
    const html = ref.current?.innerHTML ?? "";
    const plain = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    setEmpty(plain.length === 0);
    onChange(html);
  };
  const exec = (cmd: string) => { if (disabled) return; document.execCommand(cmd, false); ref.current?.focus(); sync(); };
  const TOOLS: { cmd: string; icon: React.ComponentType<{ size?: number; className?: string }>; label: string }[] = [
    { cmd: "bold", icon: Bold, label: "Bold" },
    { cmd: "italic", icon: Italic, label: "Italic" },
    { cmd: "underline", icon: Underline, label: "Underline" },
    { cmd: "strikeThrough", icon: Strikethrough, label: "Strikethrough" },
    { cmd: "insertUnorderedList", icon: List, label: "Bulleted list" },
    { cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
  ];
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden rounded-bz-md border transition-colors", disabled ? "border-bz-line-soft bg-bz-paper-warm" : focused ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface")}>
      <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-bz-line-soft bg-bz-paper-warm/40 px-1.5 py-1">
        {TOOLS.map((t) => (
          <button
            key={t.cmd}
            type="button"
            title={t.label}
            aria-label={t.label}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd)}
            className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface hover:text-bz-text disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <t.icon size={13} />
          </button>
        ))}
        <span className="ml-auto px-1.5 text-[10px] text-bz-text-soft">Rich text</span>
      </div>
      <div className="relative flex-1">
        <div
          ref={ref}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={sync}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn("h-full min-h-[176px] w-full overflow-y-auto px-3.5 py-3 text-[13px] leading-relaxed text-bz-text outline-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5", disabled && "text-bz-text-muted")}
        />
        {empty && (
          <span className="pointer-events-none absolute left-3.5 top-3 text-[13px] text-bz-text-soft">
            Describe the issue — what happened, steps to reproduce, what the customer expected…
          </span>
        )}
      </div>
    </div>
  );
}

// ── Toast — success (after commit) + warning (non-success server messages) ──────
type ToastState = { kind: "success" | "warning"; message: string; messages?: string[] } | null;
function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, toast.kind === "warning" ? 6000 : 3200);
    return () => window.clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const warn = toast.kind === "warning";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[72px] z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[440px] items-start gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("mt-px flex size-7 shrink-0 items-center justify-center rounded-bz-pill", warn ? "bg-[#FBE7E5]" : "bg-bz-fire/[0.18]")}>
          {warn ? <AlertTriangle size={13} className="text-[#9A2E29]" /> : <Check size={13} className="text-bz-leaf-deep" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-bz-text">{toast.message}</p>
          {toast.messages?.length ? (
            <ul className="mt-1 space-y-0.5">
              {toast.messages.map((m, i) => <li key={i} className="text-[11.5px] leading-snug text-bz-text-muted">• {m}</li>)}
            </ul>
          ) : null}
        </div>
        <button onClick={onClose} aria-label="Dismiss" className="-mr-1 flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ── Docked footer — live validity + the second shared submit instance ───────────
function ActionFooter({ valid, posting, onCreate, onCancel }: { valid: boolean; posting: boolean; onCreate: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <p className="flex min-w-0 items-center gap-2 text-[11.5px] text-bz-text-muted">
        {posting ? (
          <><Loader2 size={12} className="shrink-0 animate-spin text-bz-fire" /> <span className="truncate">Posting the ticket…</span></>
        ) : valid ? (
          <><span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" /> <span className="truncate">Ready to create.</span></>
        ) : (
          <><span className="size-1.5 shrink-0 rounded-bz-pill bg-[#C0413A]" /> <span className="truncate">Contact email required.</span></>
        )}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={onCancel} disabled={posting} className={cn(GHOST_BTN, "h-8 px-3")}>Cancel</button>
        <CreateButton posting={posting} disabled={!valid} onClick={onCreate} />
      </div>
    </div>
  );
}

function Breadcrumb() {
  return (
    <>
      <span className="text-bz-text-muted">Support</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="text-bz-text-muted">Tickets</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">New ticket</span>
    </>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────────
type TabId = "description" | "notes";

export function CreateSupportTicketDesignPage() {
  const navigate = useNavigate();

  const [draft, setDraft] = React.useState<TicketDraft>(blankDraft);
  const set = React.useCallback((patch: Partial<TicketDraft>) => setDraft((d) => ({ ...d, ...patch })), []);
  // stable setter for the high-frequency WYSIWYG stream (avoids a fresh closure per keystroke)
  const setDescription = React.useCallback((html: string) => setDraft((d) => ({ ...d, descriptionHtml: html })), []);

  // posting is the single shared stream every submit instance reads from
  const [posting, setPosting] = React.useState(false);
  const busyRef = React.useRef(false);                 // synchronous re-entry guard for submit
  const navTimer = React.useRef<number | null>(null);  // post-success navigate handle (cancelled on unmount)
  React.useEffect(() => () => { if (navTimer.current) window.clearTimeout(navTimer.current); }, []);
  const [toast, setToast] = React.useState<ToastState>(null);
  const [activeTab, setActiveTab] = React.useState<TabId>("description");
  const [editorKey, setEditorKey] = React.useState(0);   // bump → remount the WYSIWYG empty on reset

  // priority + issue-type lists are each fetched once on page init (null = loading)
  const [priorityOptions, setPriorityOptions] = React.useState<Opt[] | null>(null);
  const [categoryOptions, setCategoryOptions] = React.useState<Opt[] | null>(null);
  React.useEffect(() => {
    const t1 = window.setTimeout(() => setPriorityOptions(PRIORITY_SEED), 480);
    const t2 = window.setTimeout(() => setCategoryOptions(CATEGORY_SEED), 760);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  // derived
  const valid = draft.contactEmail.trim().length > 0;              // the ONLY hard gate
  const priorityValue = (priorityOptions ?? []).find((o) => o.id === draft.priorityId) ?? null;
  const categoryValue = (categoryOptions ?? []).find((o) => o.id === draft.categoryId) ?? null;

  const resetForm = React.useCallback(() => {
    setDraft(blankDraft());
    setActiveTab("description");
    setEditorKey((k) => k + 1);
  }, []);

  const onCancel = () => navigate(TICKET_LIST_HREF);

  const handleAddCategory = (label: string) => {
    const id = "cat-custom-" + Date.now().toString(36);
    const opt: Opt = { id, label };
    setCategoryOptions((prev) => [opt, ...(prev ?? CATEGORY_SEED)]);
    set({ categoryId: id });
  };

  const handleCreate = async () => {
    if (busyRef.current) return;   // synchronous guard — survives rapid double-clicks before state commits
    // validate → log which controls are invalid, otherwise send the payload
    const invalid: string[] = [];
    if (!draft.contactEmail.trim()) invalid.push("contactEmail");
    if (invalid.length) {
      // eslint-disable-next-line no-console
      console.warn("[CreateSupportTicket] cannot submit — invalid controls:", invalid);
      return;
    }
    busyRef.current = true;
    setPosting(true);
    try {
      await new Promise((r) => window.setTimeout(r, 1300));   // simulated POST
      // simulated server-side validation (client only gates on email)
      const serverMessages: string[] = [];
      const o = draft.openDate ? parseISO(draft.openDate) : null;
      const c = draft.closeDate ? parseISO(draft.closeDate) : null;
      if (o && c && c < o) serverMessages.push("Close date cannot be earlier than the open date.");

      if (serverMessages.length) {
        busyRef.current = false;
        setPosting(false);
        setToast({ kind: "warning", message: "Ticket wasn’t created", messages: serverMessages });
        return;
      }
      // success → notify, clear the form, leave for the list
      busyRef.current = false;
      setPosting(false);
      resetForm();
      setToast({ kind: "success", message: "Support ticket created" });
      navTimer.current = window.setTimeout(() => navigate(TICKET_LIST_HREF), 1100);
    } catch {
      busyRef.current = false;
      setPosting(false);   // errors simply clear the busy state
    }
  };

  return (
    <AppShell
      breadcrumb={<Breadcrumb />}
      overlay={
        <>
          <ActionFooter valid={valid} posting={posting} onCreate={handleCreate} onCancel={onCancel} />
          <Toast toast={toast} onClose={() => setToast(null)} />
        </>
      }
    >
      {/* sticky form-header chrome — holds Back, overflow, and submit instance #1 */}
      <div className="sticky top-0 z-20 border-b border-bz-line bg-bz-paper">
        <div className="mx-auto flex w-full max-w-[1180px] items-center gap-3 px-4 py-3 md:px-6">
          <button onClick={onCancel} disabled={posting} className={cn(GHOST_BTN, "h-9 px-3")}>
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Back to tickets</span><span className="sm:hidden">Back</span>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-semibold tracking-tight text-bz-text md:text-[19px]">New support ticket</h1>
            <p className="hidden text-[11.5px] text-bz-text-muted sm:block">Log a customer-support request · NP-01 · Bizak Nepal</p>
          </div>
          <OverflowMenu onReset={resetForm} disabled={posting} />
          <CreateButton posting={posting} disabled={!valid} onClick={handleCreate} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 md:px-6 md:pt-6">
        {/* ── COMPOSE HEAD — subject as a title field + the email gate ───────────── */}
        <Card className="p-4 md:p-5">
          <Field htmlFor="ticket-subject" label="Subject" hint="Optional">
            <input
              id="ticket-subject"
              value={draft.subject}
              disabled={posting}
              onChange={(e) => set({ subject: e.target.value })}
              placeholder="Short summary of the issue…"
              className={cn("h-11 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[16px] font-medium tracking-tight text-bz-text outline-none transition-colors placeholder:font-normal placeholder:text-bz-text-soft focus:border-bz-text", posting && "bg-bz-paper-warm text-bz-text-muted")}
            />
          </Field>
          <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
            <Field
              htmlFor="ticket-email"
              label="Contact email"
              required
              hint={valid ? <span className="inline-flex items-center gap-1 font-medium text-bz-leaf-deep"><Check size={10} /> captured</span> : "gates submit"}
            >
              <TextInput
                id="ticket-email"
                value={draft.contactEmail}
                onChange={(v) => set({ contactEmail: v })}
                disabled={posting}
                placeholder="customer@company.com"
                trailing={
                  <span className="shrink-0">
                    {valid
                      ? <span className="flex size-4 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22]"><Check size={10} className="text-bz-leaf-deep" /></span>
                      : <Mail size={13} className="text-bz-text-soft" />}
                  </span>
                }
              />
            </Field>
            <Field label="Priority" hint="Loaded on init">
              <StaticSelect
                value={priorityValue}
                options={priorityOptions ?? []}
                loading={priorityOptions === null}
                disabled={posting}
                placeholder="Select priority"
                onChange={(id) => set({ priorityId: id })}
                icon={Gauge}
              />
            </Field>
          </div>
        </Card>

        {/* ── BODY / PROPERTIES split ───────────────────────────────────────────── */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* left — tabbed content switcher (panes retain state when hidden) */}
          <div className="flex lg:col-span-8">
            <Card className="flex w-full flex-col">
              <div className="flex shrink-0 items-center gap-0.5 border-b border-bz-line-soft bg-bz-paper-warm/30 px-2">
                {([
                  { id: "description", label: "Description", icon: FileText },
                  { id: "notes", label: "Internal notes", icon: StickyNote },
                ] as { id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[]).map((t) => {
                  const on = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={cn("relative inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium transition-colors", on ? "text-bz-text" : "text-bz-text-muted hover:text-bz-text")}
                    >
                      <t.icon size={13} className={on ? "text-bz-text" : "text-bz-text-soft"} /> {t.label}
                      {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-bz-pill bg-bz-fire" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-1 flex-col p-4">
                {/* both panes stay mounted; inactive one is hidden, not destroyed; active pane fills the card */}
                <div className={activeTab === "description" ? "flex flex-1 flex-col" : "hidden"}>
                  <RichTextEditor key={editorKey} disabled={posting} onChange={setDescription} />
                  <p className="mt-2 flex shrink-0 items-center gap-1.5 text-[10.5px] text-bz-text-soft"><Info size={11} /> Formatting is saved as HTML on the ticket. This field is optional.</p>
                </div>
                <div className={activeTab === "notes" ? "flex flex-1 flex-col" : "hidden"}>
                  <textarea
                    value={draft.internalNotes}
                    disabled={posting}
                    onChange={(e) => set({ internalNotes: e.target.value })}
                    placeholder="Context for the support team — not shown to the customer…"
                    className={cn("min-h-[176px] w-full flex-1 resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 py-3 text-[13px] leading-relaxed text-bz-text outline-none transition-colors placeholder:text-bz-text-soft focus:border-bz-text", posting && "bg-bz-paper-warm text-bz-text-muted")}
                  />
                  <p className="mt-2 flex shrink-0 items-center gap-1.5 text-[10.5px] text-bz-text-soft"><Info size={11} /> Internal-only · retained when you switch back to Description.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* right — properties rail + screenshot */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            <Card>
              <CardHead icon={SlidersHorizontal} title="Properties" />
              <div className="space-y-3.5 p-4">
                <Field label="Issue type" hint="Searchable">
                  <SearchSelect
                    value={categoryValue}
                    options={categoryOptions ?? []}
                    loading={categoryOptions === null}
                    disabled={posting}
                    placeholder="Select issue type"
                    onChange={(id) => set({ categoryId: id })}
                    onAddNew={handleAddCategory}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Open date">
                    <DateField value={draft.openDate} onChange={(iso) => set({ openDate: iso })} disabled={posting} derivedHint={draft.openDate === TODAY_ISO ? "Today" : undefined} />
                  </Field>
                  <Field label="Close date">
                    <DateField value={draft.closeDate} onChange={(iso) => set({ closeDate: iso })} disabled={posting} />
                  </Field>
                </div>
              </div>
            </Card>

            <Card>
              <CardHead icon={ImagePlus} title="Screenshot" hint="Optional" />
              <div className="p-4">
                <ImageUpload
                  value={draft.screenshot}
                  name={draft.screenshotName}
                  onPick={(dataUrl, name) => set({ screenshot: dataUrl, screenshotName: name })}
                  onClear={() => set({ screenshot: null, screenshotName: null })}
                  disabled={posting}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
