import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  Search,
  ListFilter,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Download,
  FileText,
  FileSpreadsheet,
  X,
  Check,
  MoreHorizontal,
  Eye,
  Pencil,
  MapPin,
  Building2,
  Users,
  Calendar,
  Loader2,
  SearchX,
  Inbox,
  AlertTriangle,
  RotateCcw,
  PanelRightClose,
  PanelRightOpen,
  Lock,
} from "lucide-react";
import { AppShell, ORDERS, type Order } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// SALES ORDER · REGISTER  (scope → scan → drill → act)
//
// A working list of every sales order. This page is built around the SCOPING
// flow: a persistent left "scope console" (the filter surface as a draft → Apply
// query builder, with searchable cascading entity pickers) drives a right-hand
// results stage (sticky command bar + a streaming, lazily-expandable table).
//
// Deliberately NOT the existing sales-order list: no metrics dashboard, no
// right-side drawer. The register itself is the hero, and the behaviours the
// list page simplifies are foregrounded here —
//   • searchable / server-backed / cascading entity pickers (full state machine)
//   • drill-down PRE-SEEDING (the page opens already scoped, with an origin band)
//   • DEFERRED label resolution (an id-valued filter shows its raw id, then
//     upgrades to the human name once its option data "loads")
//   • a LOADING OVERLAY over stale rows on every fresh refetch (distinct from
//     the incremental "loading more" of infinite scroll)
//   • true infinite scroll via IntersectionObserver
//
// Reuses the shared <AppShell> + <ORDERS> seed exported by the list page; every
// other primitive on this page is local.
// ════════════════════════════════════════════════════════════════════════════

type OrderStatus = Order["status"];
type Line = Order["lines"][number];

// ════════════════════════════════════════════════════════════════════════════
// FORMAT
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const g = (n: number) => n.toLocaleString("en-US");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtAD(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
const toInt = (iso: string) => Number(iso.replace(/-/g, ""));

function computeLine(l: Line) {
  const gross = l.qty * l.rate;
  const disc = Math.round((gross * l.discPct) / 100);
  const taxable = gross - disc;
  const tax = Math.round((taxable * l.taxRate) / 100);
  return { gross, disc, taxable, tax, net: taxable + tax };
}

// ════════════════════════════════════════════════════════════════════════════
// STATUS VOCABULARY  status string → semantic tone (value→variant transform)
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

const STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending approval", tone: "pending" },
  approved: { label: "Approved", tone: "positive" },
  partly_delivered: { label: "Partially delivered", tone: "partial" },
  delivered: { label: "Delivered", tone: "positive" },
  partly_invoiced: { label: "Partially invoiced", tone: "partial" },
  invoiced: { label: "Invoiced", tone: "positive" },
  closed: { label: "Closed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

function StatusChip({ status }: { status: OrderStatus }) {
  const { label, tone } = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", CHIP_BG[tone])}>
      <span className={cn("size-1.5 shrink-0 rounded-bz-pill", DOT_BG[tone])} />
      {label}
    </span>
  );
}

// editable until billing / fulfilment / closure / cancellation lock the record
const isEditable = (s: OrderStatus) => !["closed", "cancelled", "delivered", "invoiced"].includes(s);

// the three filterable lifecycle axes (UI vocabulary)
function approvalOf(s: OrderStatus) {
  if (s === "pending") return "Pending approval";
  if (s === "cancelled") return "Cancelled";
  return "Approved";
}
function fulfilmentOf(s: OrderStatus) {
  if (s === "cancelled") return "Cancelled";
  if (s === "pending" || s === "approved") return "Not delivered";
  if (s === "partly_delivered") return "Partially delivered";
  return "Delivered";
}
function invoicingOf(s: OrderStatus) {
  if (s === "cancelled") return "Cancelled";
  if (s === "partly_invoiced") return "Partially invoiced";
  if (s === "invoiced" || s === "closed") return "Invoiced";
  return "Not invoiced";
}

// UI facet choice → backend status vocabulary (used when querying / exporting)
const BACKEND: Record<string, string> = {
  "Pending approval": "pending_approval",
  Approved: "approved",
  "Not delivered": "not_delivered",
  "Partially delivered": "partial_delivery",
  Delivered: "delivered",
  "Not invoiced": "not_billed",
  "Partially invoiced": "partial_billing",
  Invoiced: "billed",
};

const APPROVAL_OPTS = ["Pending approval", "Approved"];
const FULFILMENT_OPTS = ["Not delivered", "Partially delivered", "Delivered"];
const INVOICING_OPTS = ["Not invoiced", "Partially invoiced", "Invoiced"];

// ════════════════════════════════════════════════════════════════════════════
// OPTION POOLS  derived from the seed — the "server" the entity pickers query.
// Locations get synthesised ids so we can demonstrate deferred-label resolution
// (the id is known on a drill-down before its name has loaded).
// ════════════════════════════════════════════════════════════════════════════

const subCode = (s: string) => s.split(" · ")[0]; // "NP-01"
const subName = (s: string) => s.split(" · ")[1] ?? s; // "Bizak Nepal"
const partyCode = (meta: string) => meta.split(" · ")[0]; // "C-1003"
const partyCat = (meta: string) => meta.split(" · ")[1] ?? ""; // "Wholesale"
const locId = (loc: string) => "LOC-" + loc.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");

type EntOpt = { id: string; label: string; sub?: string };
type Kind = "Subsidiary" | "Location" | "Customer";

const SUB_POOL: { id: string; label: string }[] = [];
const LOC_POOL: { id: string; label: string; subId: string }[] = [];
const PARTY_POOL: { id: string; label: string; cat: string; subId: string }[] = [];

(() => {
  const seenSub = new Set<string>();
  const seenLoc = new Set<string>();
  const seenParty = new Set<string>();
  for (const o of ORDERS) {
    const sc = subCode(o.subsidiary);
    if (!seenSub.has(sc)) {
      seenSub.add(sc);
      SUB_POOL.push({ id: sc, label: subName(o.subsidiary) });
    }
    if (!seenLoc.has(o.location)) {
      seenLoc.add(o.location);
      LOC_POOL.push({ id: locId(o.location), label: o.location, subId: sc });
    }
    const pc = partyCode(o.partyMeta);
    if (!seenParty.has(pc)) {
      seenParty.add(pc);
      PARTY_POOL.push({ id: pc, label: o.party, cat: partyCat(o.partyMeta), subId: sc });
    }
  }
})();

const MULTI_ENTITY_TENANT = SUB_POOL.length > 1;
const subLabel = (id: string) => SUB_POOL.find((s) => s.id === id)?.label ?? id;

// scoped sources (a chosen subsidiary narrows location + customer)
const subSource = (): EntOpt[] => SUB_POOL.map((s) => ({ id: s.id, label: s.label, sub: s.id }));
const locSource = (subId: string | null): EntOpt[] =>
  LOC_POOL.filter((l) => !subId || l.subId === subId).map((l) => ({ id: l.id, label: l.label, sub: subLabel(l.subId) }));
const partySource = (subId: string | null): EntOpt[] =>
  PARTY_POOL.filter((p) => !subId || p.subId === subId).map((p) => ({ id: p.id, label: p.label, sub: `${p.cat} · ${p.id}` }));

// ════════════════════════════════════════════════════════════════════════════
// SCOPE MODEL  (draft in the rail → Apply commits to `applied`, which drives the
// list and the chip strip)
// ════════════════════════════════════════════════════════════════════════════

type Scope = {
  subsidiary: string | null;
  location: string | null;
  party: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  approval: string[];
  fulfilment: string[];
  invoicing: string[];
};

const EMPTY_SCOPE: Scope = {
  subsidiary: null, location: null, party: null,
  dateFrom: null, dateTo: null,
  approval: [], fulfilment: [], invoicing: [],
};

const arrEq = (a: string[], b: string[]) => a.length === b.length && a.every((v) => b.includes(v));
const scopeEqual = (a: Scope, b: Scope) =>
  a.subsidiary === b.subsidiary && a.location === b.location && a.party === b.party &&
  a.dateFrom === b.dateFrom && a.dateTo === b.dateTo &&
  arrEq(a.approval, b.approval) && arrEq(a.fulfilment, b.fulfilment) && arrEq(a.invoicing, b.invoicing);

const countScope = (s: Scope) =>
  (s.subsidiary ? 1 : 0) + (s.location ? 1 : 0) + (s.party ? 1 : 0) +
  (s.dateFrom || s.dateTo ? 1 : 0) + s.approval.length + s.fulfilment.length + s.invoicing.length;

function matchScope(o: Order, s: Scope) {
  if (s.subsidiary && subCode(o.subsidiary) !== s.subsidiary) return false;
  if (s.location && locId(o.location) !== s.location) return false;
  if (s.party && partyCode(o.partyMeta) !== s.party) return false;
  if (s.dateFrom && toInt(o.dateISO) < toInt(s.dateFrom)) return false;
  if (s.dateTo && toInt(o.dateISO) > toInt(s.dateTo)) return false;
  if (s.approval.length && !s.approval.includes(approvalOf(o.status))) return false;
  if (s.fulfilment.length && !s.fulfilment.includes(fulfilmentOf(o.status))) return false;
  if (s.invoicing.length && !s.invoicing.includes(invoicingOf(o.status))) return false;
  return true;
}

// ── drill-down seed: the page opens scoped to one warehouse, exactly as if a
// dashboard tile was clicked through. The location is carried as an id whose
// name has not yet resolved (see DEFERRED labels below). ──
const SEED_LOCATION = locId("Kathmandu Warehouse");
const SEED_SCOPE: Scope = { ...EMPTY_SCOPE, location: SEED_LOCATION };

// label cache (id → human name). Seeded ids resolve only once their option data
// "arrives", so chips & picker values upgrade from the raw id to the name.
type LabelCache = Record<string, string>;
const labelFromPools = (id: string): string | null => {
  const l = LOC_POOL.find((x) => x.id === id);
  if (l) return l.label;
  const p = PARTY_POOL.find((x) => x.id === id);
  if (p) return p.label;
  const s = SUB_POOL.find((x) => x.id === id);
  if (s) return s.label;
  return null;
};

type ChipModel = { key: string; kind: string; value: string; pending?: boolean; onRemove: () => void };

function buildChips(s: Scope, labels: LabelCache, patch: (p: Partial<Scope>) => void): ChipModel[] {
  const out: ChipModel[] = [];
  if (s.subsidiary)
    out.push({ key: "sub", kind: "Subsidiary", value: labels[s.subsidiary] ?? subLabel(s.subsidiary), onRemove: () => patch({ subsidiary: null, location: null, party: null }) });
  if (s.location)
    out.push({ key: "loc", kind: "Location", value: labels[s.location] ?? s.location, pending: !labels[s.location], onRemove: () => patch({ location: null }) });
  if (s.party)
    out.push({ key: "party", kind: "Customer", value: labels[s.party] ?? s.party, pending: !labels[s.party], onRemove: () => patch({ party: null }) });
  if (s.dateFrom || s.dateTo)
    out.push({ key: "date", kind: "Date", value: `${s.dateFrom ? fmtAD(s.dateFrom) : "…"} – ${s.dateTo ? fmtAD(s.dateTo) : "…"}`, onRemove: () => patch({ dateFrom: null, dateTo: null }) });
  s.approval.forEach((v) => out.push({ key: `a-${v}`, kind: "Approval", value: v, onRemove: () => patch({ approval: s.approval.filter((x) => x !== v) }) }));
  s.fulfilment.forEach((v) => out.push({ key: `f-${v}`, kind: "Fulfilment", value: v, onRemove: () => patch({ fulfilment: s.fulfilment.filter((x) => x !== v) }) }));
  s.invoicing.forEach((v) => out.push({ key: `i-${v}`, kind: "Invoicing", value: v, onRemove: () => patch({ invoicing: s.invoicing.filter((x) => x !== v) }) }));
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED HOOKS
// ════════════════════════════════════════════════════════════════════════════

function useAnchoredPos(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) { setPos(null); return; }
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, anchorRef]);
  return pos;
}

// ════════════════════════════════════════════════════════════════════════════
// BUTTON / MENU PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

const PRIMARY_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm";
const MENU_PANEL =
  "overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.20)]";

function MenuItem({ icon: Icon, title, sub, onClick }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm">
      <Icon size={14} className="mt-0.5 shrink-0 text-bz-text-muted" />
      <span className="min-w-0">
        <span className="block text-[12px] font-medium text-bz-text">{title}</span>
        {sub && <span className="block text-[10.5px] text-bz-text-muted">{sub}</span>}
      </span>
    </button>
  );
}

// portal menu anchored under a trigger; right-aligned, closes on outside / esc / scroll
function PortalMenu({
  open, onClose, anchorRef, width = 224, children,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  width?: number;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const pos = useAnchoredPos(open, anchorRef);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onScroll = (e: Event) => { if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return; onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, anchorRef]);
  if (!open || !pos) return null;
  const menuLeft = Math.max(8, Math.min(pos.left + pos.width - width, window.innerWidth - width - 8));
  return createPortal(
    <div ref={ref} style={{ position: "fixed", top: pos.top, left: menuLeft, width }} className={cn(MENU_PANEL, "z-[70]")}>
      {children}
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HIGHLIGHT  bold the matched substring inside a picker option
// ════════════════════════════════════════════════════════════════════════════

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-bz-fire/40 text-bz-text">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ENTITY PICKER  searchable · debounced · lazily paged · keyboard-navigable ·
// match-highlighting · clearable. Emits the chosen id. States: closed/open,
// searching, loading-more, no-results, empty, value-selected, clearable.
// ════════════════════════════════════════════════════════════════════════════

const PICKER_PAGE = 5;

function EntityPicker({
  kind, icon: Icon, value, source, onPick, placeholder, labels, registerLabels, disabled,
}: {
  kind: Kind;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string | null;
  source: EntOpt[];
  onPick: (id: string | null) => void;
  placeholder: string;
  labels: LabelCache;
  registerLabels: (opts: EntOpt[]) => void;
  disabled?: boolean;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const valueLabel = value ? labels[value] ?? value : null;
  const valuePending = !!value && !labels[value];

  return (
    <div className="min-w-0">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          disabled ? "cursor-not-allowed border-bz-line-soft bg-bz-paper-warm opacity-60" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        )}
      >
        <Icon size={13} className="shrink-0 text-bz-text-muted" />
        <span className={cn("min-w-0 flex-1 truncate text-[12.5px]", valueLabel ? "text-bz-text" : "text-bz-text-soft")}>
          {valueLabel ?? placeholder}
          {valuePending && <span className="ml-1.5 text-[10px] text-bz-text-soft">resolving…</span>}
        </span>
        {value && !disabled ? (
          <span
            role="button"
            aria-label="Clear"
            onClick={(e) => { e.stopPropagation(); onPick(null); }}
            className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
          >
            <X size={11} />
          </span>
        ) : (
          !disabled && <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
        )}
      </button>
      <PickerDropdown
        kind={kind}
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
        source={source}
        value={value}
        onPick={(id) => { onPick(id); setOpen(false); }}
        registerLabels={registerLabels}
      />
    </div>
  );
}

function PickerDropdown({
  kind, anchorRef, open, onClose, source, value, onPick, registerLabels,
}: {
  kind: Kind;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  source: EntOpt[];
  value: string | null;
  onPick: (id: string) => void;
  registerLabels: (opts: EntOpt[]) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pos = useAnchoredPos(open, anchorRef);

  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [searching, setSearching] = React.useState(false); // debounced first-fetch
  const [more, setMore] = React.useState(false); // next-page fetch
  const [hi, setHi] = React.useState(0);

  // opening the picker "loads" its option data → resolves deferred labels
  React.useEffect(() => {
    if (open) {
      setRaw(""); setQuery(""); setPages(1); setHi(0);
      registerLabels(source);
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // debounced search → simulated server query
  React.useEffect(() => {
    if (!open) return;
    setSearching(true);
    const t = window.setTimeout(() => {
      setQuery(raw.trim().toLowerCase());
      setPages(1); setHi(0); setSearching(false);
    }, 240);
    return () => window.clearTimeout(t);
  }, [raw, open]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    const onScroll = (e: Event) => { if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return; onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  const filtered = query ? source.filter((o) => o.label.toLowerCase().includes(query) || (o.sub ?? "").toLowerCase().includes(query)) : source;
  const visible = filtered.slice(0, pages * PICKER_PAGE);
  const hasMore = visible.length < filtered.length;

  const onScrollList = () => {
    const el = listRef.current;
    if (!el || more || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setMore(true);
      window.setTimeout(() => { setPages((p) => p + 1); setMore(false); }, 360);
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, visible.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const o = visible[hi]; if (o) onPick(o.id); }
  };

  const ddWidth = Math.max(pos.width, 260);
  const ddLeft = Math.max(8, Math.min(pos.left, window.innerWidth - ddWidth - 8));
  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: ddLeft, width: ddWidth }}
      className="z-[70] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
      onKeyDown={onListKey}
      role="listbox"
    >
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input
            ref={inputRef}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={`Search ${kind.toLowerCase()}…`}
            className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {raw && (
            <button onClick={() => setRaw("")} aria-label="Clear search" className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface">
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      <div ref={listRef} onScroll={onScrollList} className="max-h-[248px] overflow-y-auto py-1">
        {searching ? (
          <div className="flex items-center justify-center gap-2 py-7 text-bz-text-muted">
            <Loader2 size={13} className="animate-spin text-bz-fire" /> <span className="text-[11.5px]">Searching…</span>
          </div>
        ) : source.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-7 text-center">
            <Inbox size={15} className="text-bz-text-soft" />
            <p className="text-[11.5px] font-medium text-bz-text-muted">No options in this scope</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-7 text-center">
            <SearchX size={15} className="text-bz-text-soft" />
            <p className="text-[11.5px] font-medium text-bz-text-muted">No matches for “{raw}”</p>
          </div>
        ) : (
          visible.map((o, i) => {
            const selected = value === o.id;
            const active = i === hi;
            return (
              <button
                key={o.id}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHi(i)}
                onClick={() => onPick(o.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                  active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm",
                  selected && "bg-bz-fire/[0.08]",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-bz-text"><Highlight text={o.label} q={query} /></span>
                  {o.sub && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{o.sub}</span>}
                </span>
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
        {!searching && !more && !hasMore && visible.length > 0 && filtered.length > PICKER_PAGE && (
          <p className={cn("px-3 py-2 text-center text-[10px] text-bz-text-soft", NUM)}>{filtered.length} results · end of list</p>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FACET GROUP  multi-select toggle chips (one lifecycle axis)
// ════════════════════════════════════════════════════════════════════════════

function FacetGroup({
  label, icon: Icon, options, selected, onChange,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
        <Icon size={11} /> {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              onClick={() => toggle(o)}
              aria-pressed={on}
              className={cn(
                "inline-flex items-center gap-1 rounded-bz-pill border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                on ? "border-bz-olive bg-bz-fire/[0.18] text-bz-text" : "border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm",
              )}
            >
              {on && <Check size={11} className="text-bz-leaf-deep" />}
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCOPE PANEL  (the filter surface — used inline in the rail and in the
// mobile sheet). draft → Apply commits; Reset clears every control.
// ════════════════════════════════════════════════════════════════════════════

function ScopePanel({
  draft, patch, setSubsidiary, multiEntity, labels, registerLabels, dirty, count, onApply, onReset,
}: {
  draft: Scope;
  patch: (p: Partial<Scope>) => void;
  setSubsidiary: (id: string | null) => void;
  multiEntity: boolean;
  labels: LabelCache;
  registerLabels: (opts: EntOpt[]) => void;
  dirty: boolean;
  count: number;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        {multiEntity && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
              <Building2 size={11} /> Subsidiary
            </p>
            <EntityPicker
              kind="Subsidiary" icon={Building2} value={draft.subsidiary} source={subSource()}
              onPick={setSubsidiary} placeholder="All entities" labels={labels} registerLabels={registerLabels}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
              <MapPin size={11} /> Location
            </p>
            <EntityPicker
              kind="Location" icon={MapPin} value={draft.location} source={locSource(draft.subsidiary)}
              onPick={(id) => patch({ location: id })} placeholder="All locations" labels={labels} registerLabels={registerLabels}
            />
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
              <Users size={11} /> Customer
            </p>
            <EntityPicker
              kind="Customer" icon={Users} value={draft.party} source={partySource(draft.subsidiary)}
              onPick={(id) => patch({ party: id })} placeholder="All customers" labels={labels} registerLabels={registerLabels}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
            <Calendar size={11} /> Transaction date
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">From</p>
              <input
                type="date" value={draft.dateFrom ?? ""} onChange={(e) => patch({ dateFrom: e.target.value || null })}
                className={cn("h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper-warm px-2.5 text-[12px] text-bz-text outline-none focus:border-bz-text", NUM)}
              />
            </div>
            <div>
              <p className="mb-1 text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">To</p>
              <input
                type="date" value={draft.dateTo ?? ""} onChange={(e) => patch({ dateTo: e.target.value || null })}
                className={cn("h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper-warm px-2.5 text-[12px] text-bz-text outline-none focus:border-bz-text", NUM)}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-bz-line-soft" />

        <FacetGroup label="Approval" icon={Check} options={APPROVAL_OPTS} selected={draft.approval} onChange={(v) => patch({ approval: v })} />
        <FacetGroup label="Fulfilment" icon={MapPin} options={FULFILMENT_OPTS} selected={draft.fulfilment} onChange={(v) => patch({ fulfilment: v })} />
        <FacetGroup label="Invoicing" icon={FileText} options={INVOICING_OPTS} selected={draft.invoicing} onChange={(v) => patch({ invoicing: v })} />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm px-4 py-3">
        <button onClick={onReset} disabled={count === 0} className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text disabled:opacity-40", NUM)}>
          <RotateCcw size={12} /> Clear all{count > 0 ? ` · ${count}` : ""}
        </button>
        <button
          onClick={onApply}
          disabled={!dirty}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-bz-md px-3.5 text-[12px] font-semibold transition-colors disabled:cursor-default",
            dirty ? "bg-bz-deep text-bz-text-on-dark hover:opacity-95" : "border border-bz-line bg-bz-surface text-bz-text-soft",
          )}
        >
          {dirty ? <><Check size={13} /> Apply scope</> : <>Scope applied</>}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMMAND BAR  applied-filter chips (left) + live readout + mobile filters +
// actions (right). The free-text search now lives in the top bar.
// ════════════════════════════════════════════════════════════════════════════

function CommandBar({
  chips, onClearAll, sortLabel, shown, found, activeCount, currentScope, onOpenMobileFilters, onToast,
}: {
  chips: ChipModel[];
  onClearAll: () => void;
  sortLabel: string;
  shown: number;
  found: number;
  activeCount: number;
  currentScope: Scope;
  onOpenMobileFilters: () => void;
  onToast: (m: string) => void;
}) {
  const navigate = useNavigate();
  const exportRef = React.useRef<HTMLButtonElement>(null);
  const [exportOpen, setExportOpen] = React.useState(false);

  // the export carries exactly the scope currently applied to the grid
  const scopeNote = () => {
    const codes = [
      ...currentScope.approval.map((v) => BACKEND[v]),
      ...currentScope.fulfilment.map((v) => BACKEND[v]),
      ...currentScope.invoicing.map((v) => BACKEND[v]),
    ];
    const bits = [
      currentScope.subsidiary && `subsidiary=${currentScope.subsidiary}`,
      currentScope.location && `location=${currentScope.location}`,
      currentScope.party && `customer=${currentScope.party}`,
      codes.length && `status=${codes.join(",")}`,
    ].filter(Boolean);
    return bits.length ? ` · ${bits.join(" · ")}` : " · no filters";
  };

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-bz-line-soft bg-bz-surface/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-bz-surface/80">
      {/* applied-filter chips — in place of the search (which now lives in the top bar) */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {chips.length > 0 ? (
          <>
            <span className="mr-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Scoped by</span>
            {chips.map((c) => (
              <span key={c.key} className="inline-flex items-center gap-1.5 rounded-bz-sm bg-bz-fire/[0.16] py-1 pl-2 pr-1 text-[11.5px]">
                <span className="text-bz-text-muted">{c.kind}:</span>
                <span className={cn("font-medium text-bz-text", c.pending && "italic text-bz-text-muted")}>
                  {c.pending ? "resolving…" : c.value}
                </span>
                <button onClick={c.onRemove} aria-label={`Remove ${c.kind} filter`} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/40 hover:text-bz-text">
                  <X size={11} />
                </button>
              </span>
            ))}
            <button onClick={onClearAll} className="ml-0.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">Clear all</button>
          </>
        ) : (
          <span className="text-[11.5px] text-bz-text-soft">No filters applied</span>
        )}
      </div>

      {/* right cluster: live readout + actions */}
      <div className="ml-auto flex items-center gap-2">
        <p className={cn("mr-1 hidden shrink-0 items-center gap-1.5 text-[11.5px] text-bz-text-muted md:inline-flex", NUM)}>
          <span className="hidden text-bz-text-soft lg:inline">{sortLabel} ·</span>
          Showing <span className={cn("font-semibold text-bz-text", NUM)}>{shown}</span> of {found}
        </p>

        {/* mobile filters trigger (the rail is desktop-only) */}
        <button onClick={onOpenMobileFilters} className={cn(GHOST_BTN, "lg:hidden", activeCount > 0 && "border-bz-text")}>
          <ListFilter size={14} />
          Filters
          {activeCount > 0 && (
            <span className={cn("ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire px-1 text-[10px] font-semibold text-bz-olive", NUM)}>{activeCount}</span>
          )}
        </button>

        <button ref={exportRef} onClick={() => setExportOpen((v) => !v)} className={cn(GHOST_BTN, exportOpen && "border-bz-text")}>
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
          <ChevronDown size={11} className="text-bz-text-muted" />
        </button>
        <PortalMenu open={exportOpen} onClose={() => setExportOpen(false)} anchorRef={exportRef} width={264}>
          <MenuItem icon={FileText} title="Summary export" sub="One row per order" onClick={() => { setExportOpen(false); onToast(`Exporting ${found} orders · summary${scopeNote()}`); }} />
          <MenuItem icon={FileSpreadsheet} title="Detailed export" sub="One row per line item" onClick={() => { setExportOpen(false); onToast(`Exporting ${found} orders · line-item detail${scopeNote()}`); }} />
        </PortalMenu>

        <button onClick={() => navigate("/design/sales-order-list/new")} className={PRIMARY_BTN}>
          <Plus size={14} />
          <span className="sm:hidden">New</span>
          <span className="hidden sm:inline">New Sales Order</span>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// expanded line items — lazy fetch with loading / loaded / empty / error states
// ════════════════════════════════════════════════════════════════════════════

type ItemState = "loading" | "loaded" | "empty" | "error";
const ITH = "px-3 py-2 text-[9.5px] font-medium uppercase tracking-[0.06em] text-bz-text-muted whitespace-nowrap";

function ExpandedLineItems({ order, state }: { order: Order; state: ItemState }) {
  if (state === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <Loader2 size={15} className="animate-spin text-bz-fire" />
        <span className="text-[12px] text-bz-text-muted">Loading line items…</span>
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
        <AlertTriangle size={17} className="text-bz-text-soft" />
        <span className="text-[12px] font-medium text-bz-text-muted">Couldn’t load item details</span>
      </div>
    );
  }
  if (state === "empty") {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
        <Inbox size={18} className="text-bz-text-soft" />
        <span className="text-[12px] font-medium text-bz-text-muted">No item details found</span>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-bz-md border border-bz-line-soft bg-bz-surface">
      <table className="w-full border-collapse text-left" style={{ minWidth: 760 }}>
        <thead>
          <tr className="border-b border-bz-line-soft bg-bz-paper-warm/60">
            <th className={ITH}>Item</th>
            <th className={ITH}>Price level</th>
            <th className={cn(ITH, "text-right")}>Qty</th>
            <th className={cn(ITH, "text-right")}>Rate</th>
            <th className={cn(ITH, "text-right")}>Disc</th>
            <th className={cn(ITH, "text-right")}>Gross</th>
            <th className={ITH}>Tax</th>
            <th className={cn(ITH, "text-right")}>Tax amt</th>
            <th className={cn(ITH, "text-right")}>Net</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l, i) => {
            const c = computeLine(l);
            return (
              <tr key={i} className="border-b border-bz-line-soft last:border-0">
                <td className="px-3 py-2.5">
                  <span className="text-[12px] font-medium text-bz-text">{l.item}</span>
                  <span className={cn("ml-1.5 text-[10.5px] text-bz-text-soft", NUM)}>{l.code} · {l.unit}</span>
                </td>
                <td className="px-3 py-2.5 text-[11.5px] text-bz-text-muted">{l.priceLevel}</td>
                <td className={cn("px-3 py-2.5 text-right text-[12px] text-bz-text", NUM)}>{g(l.qty)}</td>
                <td className={cn("px-3 py-2.5 text-right text-[12px] text-bz-text-muted", NUM)}>{g(l.rate)}</td>
                <td className={cn("px-3 py-2.5 text-right text-[12px] text-bz-text-muted", NUM)}>{l.discPct ? `${l.discPct}%` : "—"}</td>
                <td className={cn("px-3 py-2.5 text-right text-[12px] text-bz-text-muted", NUM)}>{g(c.gross)}</td>
                <td className={cn("px-3 py-2.5 text-[11px] text-bz-text-muted", NUM)}>{l.taxCode} · {l.taxRate}%</td>
                <td className={cn("px-3 py-2.5 text-right text-[12px] text-bz-text-muted", NUM)}>{c.tax ? g(c.tax) : "—"}</td>
                <td className={cn("px-3 py-2.5 text-right text-[12px] font-semibold text-bz-text", NUM)}>{g(c.net)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-bz-line bg-bz-paper-warm/40">
            <td colSpan={8} className="px-3 py-2.5 text-right text-[11.5px] font-medium text-bz-text-muted">Order total</td>
            <td className={cn("px-3 py-2.5 text-right text-[12.5px] font-semibold text-bz-text", NUM)}>{g(order.amount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// per-row action menu (View always · Edit only while editable)
// ════════════════════════════════════════════════════════════════════════════

function RowMenu({ order }: { order: Order }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const editable = isEditable(order.status);
  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="Row actions"
        className={cn("flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text", open && "bg-bz-paper-warm text-bz-text")}
      >
        <MoreHorizontal size={15} />
      </button>
      <PortalMenu open={open} onClose={() => setOpen(false)} anchorRef={btnRef} width={180}>
        <MenuItem icon={Eye} title="View order" onClick={() => { setOpen(false); navigate(`/design/sales-order-list/${order.id}`); }} />
        {editable ? (
          <MenuItem icon={Pencil} title="Edit order" onClick={() => { setOpen(false); navigate(`/design/sales-order-list/${order.id}/edit`); }} />
        ) : (
          <div className="flex cursor-not-allowed items-center gap-2.5 px-3.5 py-2.5 opacity-50" title="Locked once delivered, invoiced, closed or cancelled">
            <Lock size={13} className="text-bz-text-muted" />
            <span className="text-[12px] font-medium text-bz-text">Edit locked</span>
          </div>
        )}
      </PortalMenu>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// sortable column header (tri-state)
// ════════════════════════════════════════════════════════════════════════════

type SortField = "id" | "date";
type Sort = { field: SortField; dir: "asc" | "desc" };

function SortHead({ label, field, sort, onSort }: { label: string; field: SortField; sort: Sort; onSort: (f: SortField) => void }) {
  const active = sort.field === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={cn("inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.06em]", active ? "text-bz-text" : "text-bz-text-muted hover:text-bz-text")}
    >
      {label}
      {active ? (sort.dir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />) : <ChevronsUpDown size={12} className="text-bz-text-soft" />}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// the table (desktop) + cards (mobile)
// ════════════════════════════════════════════════════════════════════════════

const TD = "px-3 py-3";

function OrdersTable({
  rows, expanded, itemLoad, multiEntity, onToggle, onOpen, sort, onSort,
}: {
  rows: Order[];
  expanded: Set<string>;
  itemLoad: Record<string, ItemState>;
  multiEntity: boolean;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  sort: Sort;
  onSort: (f: SortField) => void;
}) {
  const cols = multiEntity ? 8 : 7;
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left" style={{ minWidth: multiEntity ? 1000 : 900 }}>
        <thead>
          <tr className="border-b border-bz-line bg-bz-paper-warm">
            <th className="w-9 px-2 py-2.5" />
            <th className="px-3 py-2.5"><SortHead label="Order #" field="id" sort={sort} onSort={onSort} /></th>
            <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Customer</th>
            <th className="px-3 py-2.5"><SortHead label="Date" field="date" sort={sort} onSort={onSort} /></th>
            <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Location</th>
            {multiEntity && <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Subsidiary</th>}
            <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Status</th>
            <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Amount</th>
            <th className="w-10 px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const isOpen = expanded.has(o.id);
            return (
              <React.Fragment key={o.id}>
                <tr onClick={() => onOpen(o.id)} className={cn("cursor-pointer border-b border-bz-line-soft hover:bg-bz-paper-warm/50", isOpen && "bg-bz-paper-warm/40")}>
                  <td className="px-2 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggle(o.id); }}
                      aria-label={isOpen ? "Collapse line items" : "Expand line items"}
                      aria-expanded={isOpen}
                      className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/50 hover:text-bz-text"
                    >
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </td>
                  <td className={TD}><span className={cn("text-[12.5px] font-semibold tracking-tight text-bz-text", NUM)}>{o.id}</span></td>
                  <td className={TD}>
                    <span className="block text-[13px] font-medium text-bz-text">{o.party}</span>
                    <span className="block text-[10.5px] text-bz-text-muted">{o.partyMeta}</span>
                  </td>
                  <td className={TD}>
                    <span className={cn("block text-[12px] text-bz-text", NUM)}>{fmtAD(o.dateISO)}</span>
                    <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>BS {o.dateBS}</span>
                  </td>
                  <td className={cn(TD, "text-[12px] text-bz-text-muted")}>
                    <span className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-bz-text-soft" /> {o.location}</span>
                  </td>
                  {multiEntity && <td className={cn(TD, "text-[12px] text-bz-text-muted", NUM)}>{subCode(o.subsidiary)}</td>}
                  <td className={TD}><StatusChip status={o.status} /></td>
                  <td className={cn(TD, "whitespace-nowrap text-right")}>
                    <span className="text-[10px] font-semibold text-bz-text-muted">NPR </span>
                    <span className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{g(o.amount)}</span>
                  </td>
                  <td className="px-2 py-3 text-right"><div className="flex justify-end"><RowMenu order={o} /></div></td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={cols + 1} className="bg-bz-paper-warm/40 px-4 py-3 md:pl-11">
                      <ExpandedLineItems order={o} state={itemLoad[o.id] ?? "loading"} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OrderCards({
  rows, expanded, itemLoad, multiEntity, onToggle, onOpen,
}: {
  rows: Order[];
  expanded: Set<string>;
  itemLoad: Record<string, ItemState>;
  multiEntity: boolean;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 p-3 md:hidden">
      {rows.map((o) => {
        const isOpen = expanded.has(o.id);
        return (
          <div key={o.id} className="rounded-bz-md border border-bz-line-soft bg-bz-surface">
            <button onClick={() => onOpen(o.id)} className="block w-full p-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-[13px] font-semibold tracking-tight text-bz-text", NUM)}>{o.id}</span>
                <StatusChip status={o.status} />
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-bz-text">{o.party}</p>
                  <p className="truncate text-[11px] text-bz-text-muted">{o.partyMeta}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-right">
                  <span className="text-[10px] font-semibold text-bz-text-muted">NPR </span>
                  <span className={cn("text-[14px] font-semibold text-bz-text", NUM)}>{g(o.amount)}</span>
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-bz-text-muted">
                <span className={cn("inline-flex items-center gap-1", NUM)}><Calendar size={11} className="text-bz-text-soft" /> {fmtAD(o.dateISO)} · BS {o.dateBS}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={11} className="text-bz-text-soft" /> {o.location}</span>
                {multiEntity && <span className={cn("inline-flex items-center gap-1", NUM)}><Building2 size={11} className="text-bz-text-soft" /> {subCode(o.subsidiary)}</span>}
              </div>
            </button>
            <div className="flex items-center justify-between border-t border-bz-line-soft px-3 py-2">
              <button onClick={() => onToggle(o.id)} aria-expanded={isOpen} className="inline-flex items-center gap-1.5 rounded-bz-sm px-1.5 py-1 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
                {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Line items
              </button>
              <RowMenu order={o} />
            </div>
            {isOpen && (
              <div className="border-t border-bz-line-soft bg-bz-paper-warm/30 p-3">
                <ExpandedLineItems order={o} state={itemLoad[o.id] ?? "loading"} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// loading overlay · skeleton · empty · stream footer
// ════════════════════════════════════════════════════════════════════════════

function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center bg-bz-surface/55 backdrop-blur-[1px]">
      <div className="mt-16 inline-flex items-center gap-2 rounded-bz-pill border border-bz-line-soft bg-bz-surface px-3.5 py-2 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <Loader2 size={14} className="animate-spin text-bz-fire" />
        <span className="text-[12px] font-medium text-bz-text">{label}</span>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-bz-line-soft px-4 py-3.5">
          <div className="size-5 shrink-0 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="h-3 w-20 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="h-3 flex-1 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="hidden h-3 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm sm:block" />
          <div className="h-5 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="h-3 w-20 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><SearchX size={22} /></span>
      <p className="text-[14px] font-semibold text-bz-text">No sales orders in this scope</p>
      <p className="max-w-sm text-[12px] text-bz-text-muted">Nothing matches the current search and scope. Widen the filters or clear them to see the full book.</p>
      <button onClick={onClear} className={cn(GHOST_BTN, "mt-1")}><RotateCcw size={13} /> Clear search & scope</button>
    </div>
  );
}

function StreamFooter({ shown, found, appending, allLoaded, sentinelRef }: { shown: number; found: number; appending: boolean; allLoaded: boolean; sentinelRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="flex flex-col items-center gap-2 border-t border-bz-line-soft px-4 py-4">
      {appending ? (
        <p className="inline-flex items-center gap-2 text-[11.5px] text-bz-text-muted">
          <Loader2 size={13} className="animate-spin text-bz-fire" /> Loading more orders…
        </p>
      ) : allLoaded ? (
        <p className={cn("inline-flex items-center gap-1.5 text-[11px] text-bz-text-soft", NUM)}><Check size={12} className="text-bz-leaf-deep" /> All {found} orders loaded</p>
      ) : (
        <p className={cn("text-[11px] text-bz-text-soft", NUM)}>Scroll for more · {shown} of {found}</p>
      )}
      {/* infinite-scroll sentinel — observed to append the next page */}
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// mobile scope sheet (the filter surface as a slide-over on small screens)
// ════════════════════════════════════════════════════════════════════════════

function MobileScopeSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div onClick={onClose} className="absolute inset-0 bg-bz-olive/35 backdrop-blur-[1px]" aria-hidden />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[380px] flex-col border-l border-bz-line-soft bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <div className="flex items-center justify-between border-b border-bz-line-soft px-4 py-3.5">
          <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-bz-text"><ListFilter size={15} /> Scope orders</p>
          <button onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={15} /></button>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </aside>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[92vw] items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18]"><Check size={13} className="text-bz-leaf-deep" /></span>
        <p className={cn("text-[12px] font-medium text-bz-text", NUM)}>{message}</p>
        <button onClick={onClose} className="ml-2 flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// Breadcrumb + the free-text search, injected into the shared top bar via the
// AppShell `breadcrumb` slot (the search refetches the list from the first page).
function TopBreadcrumb({ search, setSearch, searching }: { search: string; setSearch: (v: string) => void; searching: boolean }) {
  return (
    <>
      <span className="hidden text-bz-text-muted sm:inline">Sales &amp; CRM</span>
      <ChevronRight size={11} className="hidden text-bz-text-soft sm:inline" />
      <span className="shrink-0 font-semibold text-bz-text">Register</span>
      <div className="relative ml-2 w-[140px] shrink-0 sm:ml-4 sm:w-[240px] lg:w-[300px]">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders…"
          className="h-8 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface py-1.5 pl-8 pr-8 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
        />
        <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
          {searching ? (
            <Loader2 size={13} className="animate-spin text-bz-fire" />
          ) : search ? (
            <button onClick={() => setSearch("")} aria-label="Clear search" className="flex size-5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
              <X size={11} />
            </button>
          ) : null}
        </span>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 4;
const ERROR_ORDER_ID = "SO-1037"; // forces the "silent error" detail fallback

export function SalesOrderRegisterDesignPage() {
  const navigate = useNavigate();

  // search (raw input → debounced committed query, kept in sync with chips)
  const [search, setSearch] = React.useState("");
  const [committed, setCommitted] = React.useState("");

  // scope: applied drives the list; draft is the rail's working copy
  const [applied, setApplied] = React.useState<Scope>(SEED_SCOPE);
  const [draft, setDraft] = React.useState<Scope>(SEED_SCOPE);

  const multiEntity = MULTI_ENTITY_TENANT; // subsidiary picker + column show only for a multi-entity tenant
  const [sort, setSort] = React.useState<Sort>({ field: "date", dir: "desc" });

  // deferred label resolution
  const [labels, setLabels] = React.useState<LabelCache>({});
  const registerLabels = React.useCallback((opts: EntOpt[]) => {
    setLabels((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const o of opts) if (next[o.id] !== o.label) { next[o.id] = o.label; changed = true; }
      return changed ? next : prev;
    });
  }, []);

  // load state
  const [listLoading, setListLoading] = React.useState(true); // first ever fetch
  const [refetching, setRefetching] = React.useState(false); // fresh from-first-page refetch
  const [appending, setAppending] = React.useState(false); // infinite-scroll append
  const [page, setPage] = React.useState(1);

  // expansion + lazy line-item fetch
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [itemLoad, setItemLoad] = React.useState<Record<string, ItemState>>({});

  // chrome
  const [railCollapsed, setRailCollapsed] = React.useState(false);
  const [mobileScope, setMobileScope] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const notify = (m: string) => setToast(m);

  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const appendLockRef = React.useRef(false); // guards against a double page-append from one intersection

  // ── initial fetch ──
  React.useEffect(() => {
    const t = window.setTimeout(() => setListLoading(false), 560);
    return () => window.clearTimeout(t);
  }, []);

  // ── deferred labels: the seeded location id resolves once its option data
  // "arrives" (≈900ms after open), upgrading the chip and rail value ──
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setLabels((prev) => {
        const next = { ...prev };
        for (const id of [applied.location, applied.party, applied.subsidiary]) {
          if (id && !next[id]) { const l = labelFromPools(id); if (l) next[id] = l; }
        }
        return next;
      });
    }, 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── auto-dismiss toast ──
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // ── debounced search → commit + fresh refetch ──
  React.useEffect(() => {
    const next = search.trim();
    if (next === committed) return;
    const t = window.setTimeout(() => {
      setCommitted(next);
      runRefetch();
    }, 320);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // a fresh, from-first-page load (overlay, not "loading more")
  const runRefetch = () => {
    setRefetching(true);
    setPage(1);
    window.setTimeout(() => setRefetching(false), 460);
  };

  // ── derived list ──
  const matched = React.useMemo(() => {
    const q = committed.toLowerCase();
    return ORDERS.filter((o) => {
      if (q && !o.id.toLowerCase().includes(q) && !o.party.toLowerCase().includes(q)) return false;
      return matchScope(o, applied);
    });
  }, [committed, applied]);

  const sorted = React.useMemo(() => {
    const arr = [...matched];
    arr.sort((a, b) => {
      const cmp = sort.field === "id" ? Number(a.id.replace(/\D/g, "")) - Number(b.id.replace(/\D/g, "")) : toInt(a.dateISO) - toInt(b.dateISO);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [matched, sort]);

  const shown = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = shown.length < sorted.length;
  const freshLoading = listLoading || refetching;
  const isEmpty = !freshLoading && sorted.length === 0;

  // ── infinite scroll ──
  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || freshLoading || !hasMore || appending) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !appendLockRef.current) {
          appendLockRef.current = true;
          setAppending(true);
          window.setTimeout(() => { setPage((p) => p + 1); setAppending(false); appendLockRef.current = false; }, 420);
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [freshLoading, hasMore, appending, sorted.length]);

  // ── interactions ──
  const onSort = (field: SortField) => {
    setSort((s) => (s.field === field ? { field, dir: s.dir === "asc" ? "desc" : "asc" } : { field, dir: field === "date" ? "desc" : "asc" }));
    runRefetch();
  };

  const onToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        if (!itemLoad[id]) {
          setItemLoad((m) => ({ ...m, [id]: "loading" }));
          const order = ORDERS.find((o) => o.id === id);
          window.setTimeout(() => {
            setItemLoad((m) => ({ ...m, [id]: id === ERROR_ORDER_ID ? "error" : (order && order.lines.length === 0 ? "empty" : "loaded") }));
          }, 560);
        }
      }
      return next;
    });
  };

  const patchDraft = (p: Partial<Scope>) => setDraft((d) => ({ ...d, ...p }));
  const setSubsidiary = (id: string | null) => setDraft((d) => ({ ...d, subsidiary: id, location: null, party: null }));

  const applyScope = () => {
    setApplied(draft);
    setMobileScope(false);
    runRefetch();
  };
  // dismissing the surface abandons any uncommitted draft edits
  const closeMobileScope = () => { setDraft(applied); setMobileScope(false); };

  // chip removal acts on the applied scope (and syncs the draft), then refetches
  const removeFromApplied = (p: Partial<Scope>) => {
    const next = { ...applied, ...p };
    setApplied(next);
    setDraft(next);
    runRefetch();
  };
  const clearAll = () => {
    setApplied(EMPTY_SCOPE);
    setDraft(EMPTY_SCOPE);
    setSearch("");
    setCommitted("");
    runRefetch();
  };

  const chips = buildChips(applied, labels, removeFromApplied);
  if (committed) chips.unshift({ key: "search", kind: "Search", value: `“${committed}”`, onRemove: () => { setSearch(""); setCommitted(""); runRefetch(); } });
  const activeCount = chips.length;

  const dirty = !scopeEqual(draft, applied);
  const draftCount = countScope(draft);

  const sortLabel = sort.field === "date" ? `Date ${sort.dir === "desc" ? "↓ newest" : "↑ oldest"}` : `Order # ${sort.dir === "desc" ? "↓ high" : "↑ low"}`;

  const scopePanel = (
    <ScopePanel
      draft={draft}
      patch={patchDraft}
      setSubsidiary={setSubsidiary}
      multiEntity={multiEntity}
      labels={labels}
      registerLabels={registerLabels}
      dirty={dirty}
      count={Math.max(draftCount, activeCount)}
      onApply={applyScope}
      onReset={clearAll}
    />
  );

  return (
    <AppShell
      breadcrumb={<TopBreadcrumb search={search} setSearch={setSearch} searching={search.trim() !== committed} />}
      overlay={
        <>
          <MobileScopeSheet open={mobileScope} onClose={closeMobileScope}>{scopePanel}</MobileScopeSheet>
          {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </>
      }
    >
      {/* the console: results stage + right-docked scope rail */}
      <div className="flex flex-row-reverse items-stretch">
        {/* scope rail — docked right (mirrors the mobile filter sheet) */}
        <aside className={cn("sticky top-0 hidden h-[calc(100vh-56px)] shrink-0 flex-col self-start border-l border-bz-line-soft bg-bz-surface lg:flex", railCollapsed ? "w-[52px]" : "w-[300px]")}>
          <div className="flex items-center justify-between gap-2 border-b border-bz-line-soft px-3 py-3">
            {!railCollapsed && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                <ListFilter size={12} /> Scope
                {activeCount > 0 && <span className={cn("ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire px-1 text-[10px] font-semibold text-bz-olive", NUM)}>{activeCount}</span>}
              </span>
            )}
            <button
              onClick={() => setRailCollapsed((v) => !v)}
              aria-label={railCollapsed ? "Expand scope" : "Collapse scope"}
              className={cn("flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text", railCollapsed && "mx-auto")}
            >
              {railCollapsed ? <PanelRightOpen size={15} /> : <PanelRightClose size={15} />}
            </button>
          </div>
          {railCollapsed ? (
            <button onClick={() => setRailCollapsed(false)} className="flex flex-1 flex-col items-center gap-2 pt-4 text-bz-text-muted hover:text-bz-text">
              <ListFilter size={16} />
              {activeCount > 0 && <span className={cn("inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire px-1 text-[10px] font-semibold text-bz-olive", NUM)}>{activeCount}</span>}
            </button>
          ) : (
            <div className="min-h-0 flex-1">{scopePanel}</div>
          )}
        </aside>

        {/* results stage */}
        <div className="flex min-w-0 flex-1 flex-col">
          <CommandBar
            chips={chips}
            onClearAll={clearAll}
            sortLabel={sortLabel}
            shown={shown.length}
            found={matched.length}
            activeCount={activeCount}
            currentScope={applied}
            onOpenMobileFilters={() => setMobileScope(true)}
            onToast={notify}
          />

          <div className="relative min-h-[360px]">
            {listLoading ? (
              <SkeletonRows />
            ) : isEmpty ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <>
                <OrdersTable rows={shown} expanded={expanded} itemLoad={itemLoad} multiEntity={multiEntity} onToggle={onToggle} onOpen={(id) => navigate(`/design/sales-order-list/${id}`)} sort={sort} onSort={onSort} />
                <OrderCards rows={shown} expanded={expanded} itemLoad={itemLoad} multiEntity={multiEntity} onToggle={onToggle} onOpen={(id) => navigate(`/design/sales-order-list/${id}`)} />
                <StreamFooter shown={shown.length} found={sorted.length} appending={appending} allLoaded={!hasMore} sentinelRef={sentinelRef} />
              </>
            )}
            {freshLoading && <LoadingOverlay label={listLoading ? "Loading orders…" : "Refreshing results…"} />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
