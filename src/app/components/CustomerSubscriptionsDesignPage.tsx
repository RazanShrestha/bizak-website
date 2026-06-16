import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  Search,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Loader2,
  Bell,
  BarChart3,
  Wallet,
  Pencil,
  ArrowUpRight,
  Ban,
  Zap,
  Gift,
  Clock,
  AlertTriangle,
  CalendarX,
  PauseCircle,
  Inbox,
  Repeat,
  Receipt,
  Info,
  Tag,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMER SUBSCRIPTIONS · (browse customers → act on the live ones)
//
// Primary action = scan the book of customers who hold recurring subscriptions
// and act on the LIVE ones (record a payment · edit billing lines · change plan ·
// cancel). The grouping unit is the CUSTOMER; subscriptions nest inside.
//
// Entirely server-driven: a single debounced name search, a single-select
// lifecycle filter, and prev/next paging each re-fetch one server-prepared page
// (no client filtering / sorting). Search + status reset to page 1; paging
// preserves both. Every successful mutation re-fetches so the view stays current;
// emptying a non-first page steps back one page.
//
// This file also seeds the lifecycle-status vocabulary (normalize → label/glyph/
// tone), the NPR money formatter, and the avatar monogram + name-hash variant
// that the sibling subscription pages reuse.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";

function money(code: string, n: number | undefined | null): string {
  const v = n == null || !isFinite(n) ? 0 : n;
  return `${code ? code + " " : ""}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// ── identity (monogram + deterministic name-hash variant) ───────────────────
const AVATARS: { bg: string; text: string }[] = [
  { bg: "bg-bz-olive", text: "text-bz-fire" },
  { bg: "bg-bz-fire/[0.20]", text: "text-bz-text" },
  { bg: "bg-bz-leaf/60", text: "text-bz-text" },
  { bg: "bg-bz-deep", text: "text-bz-text-on-dark" },
  { bg: "bg-bz-leaf-deep/25", text: "text-bz-text" },
  { bg: "bg-bz-paper-warm", text: "text-bz-text-muted" },
];
function hashName(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function avatarOf(name: string) {
  return AVATARS[hashName(name || "#") % AVATARS.length];
}
function initials(name: string): string {
  const t = (name || "").trim();
  if (!t) return "#";
  const parts = t.split(/\s+/);
  const a = parts[0][0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] ?? "";
  return (a + b).toUpperCase().slice(0, 2) || "#";
}

// ── dates ────────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// ── billing cycle (named → short, raw fallback) ──────────────────────────────
const CYCLE_SHORT: Record<string, string> = { daily: "day", weekly: "wk", monthly: "mo", quarterly: "qtr", yearly: "yr" };
const cycleShort = (raw: string) => CYCLE_SHORT[raw] ?? raw;

// ════════════════════════════════════════════════════════════════════════════
// LIFECYCLE STATUS  normalize(raw, trial, grace) → key → {label, tone, glyph}
// (shared across the subscription pages — keep the mapping identical)
// ════════════════════════════════════════════════════════════════════════════

type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";
type StatusKey = "active" | "trial" | "grace" | "pastdue" | "suspended" | "expired" | "upgraded" | "cancelled";

const STATUS_META: Record<StatusKey, { label: string; tone: Tone; glyph: React.ComponentType<{ size?: number; className?: string }> }> = {
  active: { label: "Active", tone: "positive", glyph: Zap },
  trial: { label: "In trial", tone: "partial", glyph: Gift },
  grace: { label: "Grace period", tone: "pending", glyph: Clock },
  pastdue: { label: "Past due", tone: "danger", glyph: AlertTriangle },
  suspended: { label: "Suspended", tone: "danger", glyph: PauseCircle },
  expired: { label: "Expired", tone: "neutral", glyph: CalendarX },
  upgraded: { label: "Upgraded", tone: "neutral", glyph: ArrowUpRight },
  cancelled: { label: "Cancelled", tone: "neutral", glyph: Ban },
};

// rule chain: grace flag wins → active+trial folds to trial → raw aliases → raw
function normalizeStatus(raw: string, trial: boolean, grace: boolean): StatusKey {
  if (grace || raw === "ingraceperiod") return "grace";
  if (raw === "active" && trial) return "trial";
  if (raw === "intrial") return "trial";
  if (raw === "pastdue" || raw === "past_due") return "pastdue";
  return (["active", "expired", "upgraded", "cancelled", "suspended"].includes(raw) ? raw : "active") as StatusKey;
}
// active-like = the only subscriptions that expose the per-subscription actions
const ACTIVE_LIKE: StatusKey[] = ["active", "pastdue", "grace", "trial"];
const isActiveLike = (k: StatusKey) => ACTIVE_LIKE.includes(k);

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

function StatusChip({ statusKey }: { statusKey: StatusKey }) {
  const m = STATUS_META[statusKey];
  const Glyph = m.glyph;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", CHIP_BG[m.tone])}>
      <Glyph size={11} className="shrink-0" />
      {m.label}
    </span>
  );
}

// status filter domain (all-inclusive + the distinguished states)
const STATUS_FILTERS: { key: "all" | StatusKey; label: string }[] = [
  { key: "all", label: "All statuses" },
  { key: "active", label: "Active" },
  { key: "trial", label: "In trial" },
  { key: "grace", label: "Grace" },
  { key: "expired", label: "Expired" },
  { key: "upgraded", label: "Upgraded" },
  { key: "cancelled", label: "Cancelled" },
];

// ════════════════════════════════════════════════════════════════════════════
// DATA MODEL + SEED
// ════════════════════════════════════════════════════════════════════════════

type Sub = {
  id: string;
  plan: string;
  raw: string;
  trial: boolean;
  grace: boolean;
  activatedAt: string | null;
  renewalAt: string | null;
  currency: string;
  billingAmount: number;
  netPayable: number | null;
  cycle: string;
  discount: number;
  taxExempt: boolean;
  noInvoice?: boolean; // record-payment can't resolve a payable invoice → warns
};
type Customer = { id: string; name: string; partyType?: string; subs: Sub[] };

const CURRENCY = "NPR";
function sub(p: Partial<Sub> & Pick<Sub, "id" | "plan" | "raw" | "billingAmount" | "cycle">): Sub {
  return {
    trial: false, grace: false, activatedAt: null, renewalAt: null, currency: CURRENCY,
    netPayable: null, discount: 0, taxExempt: false, ...p,
  };
}

const SEED: Customer[] = [
  { id: "C-1001", name: "Himalayan Java Coffee", partyType: "Customer", subs: [
    sub({ id: "S-5001", plan: "Pro", raw: "active", billingAmount: 6500, netPayable: 6500, cycle: "monthly", activatedAt: "2025-09-01", renewalAt: "2026-07-01", discount: 500 }),
    sub({ id: "S-5002", plan: "POS Add-on", raw: "active", billingAmount: 1500, cycle: "monthly", activatedAt: "2025-10-01", renewalAt: "2026-07-01" }),
  ] },
  { id: "C-1002", name: "Annapurna Logistics", partyType: "Customer", subs: [
    sub({ id: "S-5003", plan: "Scale", raw: "active", trial: false, billingAmount: 12000, netPayable: 11400, cycle: "monthly", activatedAt: "2025-04-12", renewalAt: "2026-07-12" }),
  ] },
  { id: "C-1003", name: "Sherpa Adventures", partyType: "Lead", subs: [
    sub({ id: "S-5004", plan: "Growth", raw: "active", trial: true, billingAmount: 3500, cycle: "monthly", activatedAt: "2026-06-01", renewalAt: "2026-06-15" }),
  ] },
  { id: "C-1004", name: "Everest Bank Pvt. Ltd.", partyType: "Customer", subs: [
    sub({ id: "S-5005", plan: "Enterprise", raw: "active", grace: true, billingAmount: 48000, netPayable: 48000, cycle: "yearly", activatedAt: "2024-07-01", renewalAt: "2026-07-01", taxExempt: true }),
    sub({ id: "S-5006", plan: "Analytics Add-on", raw: "active", billingAmount: 9000, cycle: "yearly", activatedAt: "2024-07-01", renewalAt: "2026-07-01", taxExempt: true }),
  ] },
  { id: "C-1005", name: "Pokhara Handmade Paper Co.", partyType: "Customer", subs: [
    sub({ id: "S-5007", plan: "Starter", raw: "pastdue", billingAmount: 1500, netPayable: 1500, cycle: "monthly", activatedAt: "2025-12-01", renewalAt: "2026-06-01" }),
  ] },
  { id: "C-1006", name: "Kathmandu Crafts Export", partyType: "Customer", subs: [
    sub({ id: "S-5008", plan: "Pro", raw: "active", billingAmount: 6500, cycle: "monthly", activatedAt: "2025-11-20", renewalAt: "2026-07-20", noInvoice: true }),
    sub({ id: "S-5009", plan: "Growth", raw: "upgraded", billingAmount: 3500, cycle: "monthly", activatedAt: "2025-02-01", renewalAt: null }),
  ] },
  { id: "C-1007", name: "Lumbini Organic Farms", partyType: "Prospect", subs: [
    sub({ id: "S-5010", plan: "Starter", raw: "expired", billingAmount: 1500, cycle: "monthly", activatedAt: "2025-01-10", renewalAt: "2025-12-10" }),
  ] },
  { id: "C-1008", name: "Chitwan Resorts & Spa", partyType: "Customer", subs: [
    sub({ id: "S-5011", plan: "Scale", raw: "active", billingAmount: 12000, netPayable: 12000, cycle: "monthly", activatedAt: "2025-08-05", renewalAt: "2026-07-05" }),
  ] },
  { id: "C-1009", name: "Mustang Trading House", partyType: "Customer", subs: [
    sub({ id: "S-5012", plan: "Growth", raw: "cancelled", billingAmount: 3500, cycle: "monthly", activatedAt: "2024-09-01", renewalAt: null }),
  ] },
  { id: "C-1010", name: "Bhaktapur Pottery Guild", partyType: "Customer", subs: [
    sub({ id: "S-5013", plan: "Pro", raw: "active", billingAmount: 6500, netPayable: 6175, cycle: "monthly", activatedAt: "2026-01-15", renewalAt: "2026-07-15", discount: 325 }),
  ] },
  { id: "C-1011", name: "Gorkha Brewery", partyType: "Customer", subs: [
    sub({ id: "S-5014", plan: "Enterprise", raw: "active", billingAmount: 48000, netPayable: 48000, cycle: "yearly", activatedAt: "2025-07-01", renewalAt: "2026-07-01" }),
  ] },
  { id: "C-1012", name: "Dhulikhel Medical Centre", partyType: "Customer", subs: [
    sub({ id: "S-5015", plan: "Scale", raw: "active", trial: true, billingAmount: 12000, cycle: "monthly", activatedAt: "2026-06-08", renewalAt: "2026-06-22" }),
  ] },
];

// ── reference data for the modals ────────────────────────────────────────────
type PlanOpt = { id: string; label: string; price: number; cycle: string; custom?: boolean };
const PLAN_OPTIONS: PlanOpt[] = [
  { id: "PLAN-STARTER", label: "Starter (Standard)", price: 1500, cycle: "monthly" },
  { id: "PLAN-GROWTH", label: "Growth (Standard)", price: 3500, cycle: "monthly" },
  { id: "PLAN-PRO", label: "Pro (Standard)", price: 6500, cycle: "monthly" },
  { id: "PLAN-SCALE", label: "Scale (Standard)", price: 12000, cycle: "monthly" },
  { id: "PLAN-ENT", label: "Enterprise (Custom)", price: 0, cycle: "yearly", custom: true },
];
const CYCLE_OPTS = [
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
];
type RevItem = { id: string; label: string };
const REV_ITEMS: RevItem[] = [
  { id: "RI-BASE", label: "Base platform" },
  { id: "RI-SEAT", label: "Additional seat" },
  { id: "RI-POS", label: "POS terminal" },
  { id: "RI-API", label: "API usage" },
  { id: "RI-SUPPORT", label: "Priority support" },
  { id: "RI-ANALYTICS", label: "Analytics module" },
];
const UNIT_OPTS: RevItem[] = ["seat", "user", "month", "device", "unit"].map((u) => ({ id: u, label: u }));
type TaxOpt = { id: string; label: string; rate: number };
const TAX_OPTS: TaxOpt[] = [
  { id: "VAT", label: "VAT 13%", rate: 13 },
  { id: "DST", label: "Digital Service Tax 2%", rate: 2 },
  { id: "EXM", label: "Exempt", rate: 0 },
];

// ════════════════════════════════════════════════════════════════════════════
// SERVER SIMULATION  (search + status + page → one prepared page)
// ════════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 5;

type ServerPage = { rows: Customer[]; totalCustomers: number; totalPages: number };
function serverQuery(query: string, status: "all" | StatusKey, page: number): ServerPage {
  const q = query.trim().toLowerCase();
  const matched: Customer[] = [];
  for (const c of SEED) {
    if (q && !c.name.toLowerCase().includes(q)) continue;
    const subs = status === "all" ? c.subs : c.subs.filter((s) => normalizeStatus(s.raw, s.trial, s.grace) === status);
    if (subs.length === 0) continue;
    matched.push({ ...c, subs });
  }
  const totalCustomers = matched.length;
  const totalPages = Math.max(1, Math.ceil(totalCustomers / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  return { rows: matched.slice(start, start + PAGE_SIZE), totalCustomers, totalPages };
}

// ════════════════════════════════════════════════════════════════════════════
// PRIMITIVES  (portal dropdown · toast · confirm · modal shell · number/qty)
// ════════════════════════════════════════════════════════════════════════════

function useAnchoredPos(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !ref.current) { setPos(null); return; }
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, ref]);
  return pos;
}

function Dropdown<T extends string>({ value, options, onChange, icon: Icon, minWidth = 180 }: {
  value: T; options: { key: T; label: string }[]; onChange: (v: T) => void; icon?: React.ComponentType<{ size?: number; className?: string }>; minWidth?: number;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchoredPos(open, ref);
  const cur = options.find((o) => o.key === value) ?? options[0];
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { const t = e.target as Node; if (!ref.current?.contains(t) && !document.getElementById("dd-pop")?.contains(t)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = (e: Event) => { if (document.getElementById("dd-pop")?.contains(e.target as Node)) return; setOpen(false); };
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey); window.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll, true); };
  }, [open]);
  return (
    <div className="min-w-0">
      <button ref={ref} type="button" onClick={() => setOpen((v) => !v)}
        className={cn("flex h-9 w-full items-center gap-2 rounded-bz-md border bg-bz-surface px-2.5 text-left text-[12.5px] transition-colors", open ? "border-bz-text" : "border-bz-line hover:border-bz-line")}>
        {Icon && <Icon size={13} className="shrink-0 text-bz-text-muted" />}
        <span className="min-w-0 flex-1 truncate text-bz-text">{cur.label}</span>
        <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && pos && createPortal(
        <div id="dd-pop" style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, minWidth) }}
          className="z-[90] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          {options.map((o) => (
            <button key={o.key} onClick={() => { onChange(o.key); setOpen(false); }}
              className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] hover:bg-bz-paper-warm", o.key === value ? "bg-bz-fire/[0.06] text-bz-text" : "text-bz-text-muted")}>
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              {o.key === value && <Check size={13} className="shrink-0 text-bz-text" />}
            </button>
          ))}
        </div>, document.body)}
    </div>
  );
}

type ToastState = { kind: "success" | "warning" | "info"; message: string; id: number } | null;
function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => { if (!toast) return; const t = window.setTimeout(onDismiss, 4000); return () => window.clearTimeout(t); }, [toast, onDismiss]);
  if (!toast) return null;
  const k = toast.kind;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[97] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", k === "success" ? "bg-bz-fire/[0.18]" : k === "warning" ? "bg-[#FBE5E2]" : "bg-bz-paper-warm")}>
          {k === "success" ? <Check size={13} className="text-bz-leaf-deep" /> : k === "warning" ? <AlertTriangle size={12} className="text-[#9A2E29]" /> : <Info size={13} className="text-bz-text-muted" />}
        </span>
        <p className="max-w-[440px] text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

type ConfirmState = { title: string; body: React.ReactNode; confirmLabel: string; onConfirm: () => void } | null;
function ConfirmDialog({ state, onClose, posting }: { state: ConfirmState; onClose: () => void; posting: boolean }) {
  React.useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !posting && onClose();
    document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey);
  }, [state, onClose, posting]);
  if (!state) return null;
  return createPortal(
    <div className="fixed inset-0 z-[98] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bz-olive/40 backdrop-blur-[1px]" onClick={() => !posting && onClose()} aria-hidden />
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_24px_60px_-20px_rgba(15,20,17,0.30)]">
        <div className="flex items-start gap-3 p-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-[#FBE5E2] text-[#9A2E29]"><Ban size={16} /></span>
          <div className="min-w-0"><p className="text-[14px] font-semibold text-bz-text">{state.title}</p><div className="mt-1 text-[12px] leading-relaxed text-bz-text-muted">{state.body}</div></div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-5 py-3">
          <button onClick={onClose} disabled={posting} className="inline-flex h-8 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-50">Keep subscription</button>
          <button onClick={state.onConfirm} disabled={posting} className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-[#C0413A] px-3.5 text-[12px] font-semibold text-white hover:opacity-95 disabled:opacity-60">
            {posting ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />} {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>, document.body);
}

function ModalShell({ title, subtitle, onClose, locked, footer, children, width = 560 }: {
  title: string; subtitle?: React.ReactNode; onClose: () => void; locked: boolean; footer: React.ReactNode; children: React.ReactNode; width?: number;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !locked && onClose();
    document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey);
  }, [onClose, locked]);
  return createPortal(
    <div className="fixed inset-0 z-[96] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="absolute inset-0 bg-bz-olive/40 backdrop-blur-[1px]" onClick={() => !locked && onClose()} aria-hidden />
      <div className="relative my-auto w-full overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_70px_-24px_rgba(15,20,17,0.34)]" style={{ maxWidth: width }}>
        <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft bg-bz-paper px-5 py-4">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-tight text-bz-text">{title}</p>
            {subtitle && <div className="mt-0.5 text-[12px] text-bz-text-muted">{subtitle}</div>}
          </div>
          <button onClick={() => !locked && onClose()} disabled={locked} className="flex size-8 shrink-0 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-40"><X size={16} /></button>
        </div>
        <div className="max-h-[64vh] overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-5 py-3.5">{footer}</div>
      </div>
    </div>, document.body);
}

function QtyInput({ value, onChange, align = "right", prefix, disabled, invalid }: {
  value: number | undefined; onChange: (v: number | undefined) => void; align?: "left" | "right"; prefix?: string; disabled?: boolean; invalid?: boolean;
}) {
  const [raw, setRaw] = React.useState(value == null ? "" : String(value));
  React.useEffect(() => { setRaw(value == null ? "" : String(value)); }, [value]);
  return (
    <div className={cn("flex h-9 items-center rounded-bz-md border bg-bz-surface px-2.5 transition-colors focus-within:border-bz-text", invalid ? "border-[#C0413A]" : "border-bz-line-soft", disabled && "bg-bz-paper-warm")}>
      {prefix && <span className="mr-1 text-[11px] text-bz-text-soft">{prefix}</span>}
      <input inputMode="decimal" value={raw} disabled={disabled}
        onChange={(e) => { const v = e.target.value; if (v === "" || /^\d*\.?\d*$/.test(v)) { setRaw(v); onChange(v === "" || v === "." ? undefined : Number(v)); } }}
        onBlur={() => { if (raw === "" || raw === ".") { onChange(undefined); return; } onChange(round2(Math.max(0, Number(raw)))); }}
        className={cn("h-full w-full bg-transparent text-[12.5px] text-bz-text outline-none", NUM, align === "right" && "text-right", disabled && "text-bz-text-muted")} />
    </div>
  );
}

function MiniSelect<T extends string>({ value, options, onChange, placeholder, invalid }: {
  value: T | null; options: { id: T; label: string }[]; onChange: (v: T) => void; placeholder?: string; invalid?: boolean;
}) {
  return (
    <div className="relative">
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value as T)}
        className={cn("h-9 w-full appearance-none rounded-bz-md border bg-bz-surface pl-2.5 pr-8 text-[12.5px] outline-none focus:border-bz-text", invalid ? "border-[#C0413A]" : "border-bz-line-soft", value ? "text-bz-text" : "text-bz-text-soft")}>
        <option value="" disabled>{placeholder ?? "Select…"}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
    </div>
  );
}

function Segmented<T extends string>({ options, value, onChange, disabled }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className={cn("inline-grid w-full grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5", disabled && "opacity-50")}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} type="button" disabled={disabled} onClick={() => onChange(o.id)}
            className={cn("h-8 rounded-bz-sm px-3 text-[12px] font-medium transition-colors", on ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <p className="mb-1.5 text-[11px] font-medium text-bz-text-muted">{children}{required && <span className="ml-0.5 text-bz-fire">*</span>}</p>;
}

// ════════════════════════════════════════════════════════════════════════════
// CHANGE-PLAN MODAL  (ends current period as "upgraded", starts a new one)
// ════════════════════════════════════════════════════════════════════════════

type Proration = { credit: number; newPlanPrice: number; daysRemaining: number; finalDue: number };

function ChangePlanModal({ target, plans, posting, onClose, onSubmit }: {
  target: { customer: Customer; sub: Sub }; plans: PlanOpt[]; posting: boolean; onClose: () => void; onSubmit: (planLabel: string) => void;
}) {
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [cycle, setCycle] = React.useState<string>("");
  const [discount, setDiscount] = React.useState<number | undefined>(undefined);
  const [timing, setTiming] = React.useState<"now" | "next">("now");
  const [preview, setPreview] = React.useState<Proration | null>(null);
  const [previewState, setPreviewState] = React.useState<"idle" | "loading" | "shown" | "unavailable">("idle");

  const currentNet = target.sub.netPayable ?? target.sub.billingAmount;
  const plan = plans.find((p) => p.id === planId) ?? null;

  // reactively (re)compute the proration preview when plan / cycle changes
  React.useEffect(() => {
    if (!plan) { setPreviewState("idle"); setPreview(null); return; }
    setPreviewState("loading"); setPreview(null);
    const t = window.setTimeout(() => {
      if (plan.custom) { setPreviewState("unavailable"); setPreview(null); return; }
      const daysRemaining = 18;
      const cyMult = cycle === "yearly" ? 12 : cycle === "quarterly" ? 3 : 1;
      const newPlanPrice = round2(plan.price * cyMult);
      const credit = round2((currentNet * daysRemaining) / 30);
      const disc = discount ?? 0;
      const finalDue = Math.max(0, round2(newPlanPrice - credit - disc));
      setPreview({ credit, newPlanPrice, daysRemaining, finalDue });
      setPreviewState("shown");
    }, 600);
    return () => window.clearTimeout(t);
  }, [planId, cycle, discount, plan, currentNet]);

  const canSubmit = !!plan && !posting;
  const submit = () => { if (!plan) return; onSubmit(plan.label); };
  const curKey = normalizeStatus(target.sub.raw, target.sub.trial, target.sub.grace);

  return (
    <ModalShell title="Change plan" locked={posting} onClose={onClose} width={560}
      subtitle={<span>Move <span className="font-medium text-bz-text">{target.customer.name}</span> off <span className="font-medium text-bz-text">{target.sub.plan}</span> — the current period closes as <span className="font-medium text-bz-text">Upgraded</span> and a new one begins.</span>}
      footer={<>
        <button onClick={onClose} disabled={posting} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-50">Cancel</button>
        <button onClick={submit} disabled={!canSubmit} title={!plan ? "Choose a new plan first" : undefined}
          className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50">
          {posting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {posting ? "Applying…" : "Apply change"}
        </button>
      </>}>
      <div className="flex flex-col gap-4">
        {/* current period context */}
        <div className="flex items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Current period</p>
            <p className="mt-1 truncate text-[13px] font-medium text-bz-text">{target.sub.plan}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusChip statusKey={curKey} />
            <span className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{money(target.sub.currency, currentNet)}<span className="ml-0.5 text-[10px] font-normal text-bz-text-soft">/{cycleShort(target.sub.cycle)}</span></span>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-bz-lg border border-dashed border-bz-line bg-bz-paper-warm/30 py-10 text-center">
            <Inbox size={20} className="text-bz-text-soft" />
            <p className="text-[13px] font-medium text-bz-text-muted">No active plans available</p>
            <p className="max-w-[300px] text-[11.5px] text-bz-text-muted">There are no published plans to move this subscription onto.</p>
          </div>
        ) : (
          <>
            <div>
              <FieldLabel required>New plan</FieldLabel>
              <MiniSelect value={planId as string | null} options={plans.map((p) => ({ id: p.id, label: p.label }))} onChange={setPlanId} placeholder="Choose a plan to move to…" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Billing cycle override</FieldLabel>
                <MiniSelect value={(cycle || null) as string | null} options={CYCLE_OPTS} onChange={setCycle} placeholder="Keep plan default" />
              </div>
              <div>
                <FieldLabel>Discount</FieldLabel>
                <QtyInput value={discount} onChange={setDiscount} prefix={target.sub.currency} />
              </div>
            </div>
            <div>
              <FieldLabel>Apply</FieldLabel>
              <Segmented options={[{ id: "now", label: "Immediately" }, { id: "next", label: "At next billing cycle" }]} value={timing} onChange={setTiming} />
            </div>

            {/* proration preview — silently absent when it can't be computed */}
            {previewState === "loading" && (
              <div className="flex items-center justify-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 py-6 text-bz-text-muted">
                <Loader2 size={14} className="animate-spin text-bz-fire" /> <span className="text-[12px]">Calculating proration…</span>
              </div>
            )}
            {previewState === "shown" && preview && (
              <div className="overflow-hidden rounded-bz-lg bg-bz-olive p-4 text-bz-text-on-dark">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-fire">Proration preview</p>
                <div className="mt-3 flex flex-col gap-2">
                  <PreviewRow label={`Unused credit · ${preview.daysRemaining} days left`} value={`− ${money(target.sub.currency, preview.credit)}`} />
                  <PreviewRow label="New plan price" value={money(target.sub.currency, preview.newPlanPrice)} />
                  {(discount ?? 0) > 0 && <PreviewRow label="Discount" value={`− ${money(target.sub.currency, discount ?? 0)}`} />}
                  <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2.5">
                    <span className="text-[12.5px] font-medium text-bz-text-on-dark">{timing === "now" ? "Due today" : "Due next cycle"}</span>
                    <span className={cn("text-[18px] font-semibold text-bz-fire", NUM)}>{money(target.sub.currency, preview.finalDue)}</span>
                  </div>
                </div>
              </div>
            )}
            {previewState === "unavailable" && (
              <div className="flex gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3">
                <Info size={14} className="mt-0.5 shrink-0 text-bz-text-muted" />
                <p className="text-[11.5px] leading-relaxed text-bz-text-muted">A proration preview isn't available for a custom-negotiated plan. The change can still be applied — billing is settled out-of-band.</p>
              </div>
            )}
          </>
        )}
      </div>
    </ModalShell>
  );
}
function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <span className="text-bz-text-on-dark-muted">{label}</span>
      <span className={cn("font-medium text-bz-text-on-dark", NUM)}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EDIT-LINES MODAL  (recurring billing lines — applies to the NEXT cycle)
// ════════════════════════════════════════════════════════════════════════════

type EditLine = { id: string; item: string | null; unit: string; tax: string; qty: number | undefined; price: number | undefined };
let _lid = 0;
const newLine = (): EditLine => ({ id: `el-${++_lid}`, item: null, unit: "seat", tax: "VAT", qty: 1, price: undefined });

function seedLines(s: Sub): EditLine[] {
  const base = s.billingAmount;
  return [
    { id: `el-${++_lid}`, item: "RI-BASE", unit: "month", tax: s.taxExempt ? "EXM" : "VAT", qty: 1, price: round2(base * 0.7) },
    { id: `el-${++_lid}`, item: "RI-SEAT", unit: "seat", tax: s.taxExempt ? "EXM" : "VAT", qty: 5, price: round2((base * 0.3) / 5) },
  ];
}
const lineAmount = (l: EditLine) => round2((l.qty ?? 0) * (l.price ?? 0));
const taxRateOf = (id: string) => TAX_OPTS.find((t) => t.id === id)?.rate ?? 0;
const lineValid = (l: EditLine) => !!l.item && (l.qty ?? -1) >= 0 && (l.price ?? -1) >= 0;

function EditLinesModal({ target, posting, onClose, onSubmit }: {
  target: { customer: Customer; sub: Sub }; posting: boolean; onClose: () => void; onSubmit: () => void;
}) {
  const [loading, setLoading] = React.useState(true);
  const [lines, setLines] = React.useState<EditLine[]>([]);
  const [touched, setTouched] = React.useState(false);
  const taxExempt = target.sub.taxExempt;
  const flatDiscount = target.sub.discount;

  React.useEffect(() => {
    const t = window.setTimeout(() => { setLines(seedLines(target.sub)); setLoading(false); }, 520);
    return () => window.clearTimeout(t);
  }, [target.sub]);

  const set = (id: string, patch: Partial<EditLine>) => setLines((xs) => xs.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const remove = (id: string) => setLines((xs) => xs.filter((l) => l.id !== id));
  const add = () => setLines((xs) => [...xs, newLine()]);

  // live totals: subtotal → capped flat discount (pro-rata) → post-discount tax → grand
  const totals = React.useMemo(() => {
    const subtotal = round2(lines.reduce((s, l) => s + lineAmount(l), 0));
    const discount = Math.min(flatDiscount, subtotal);
    let tax = 0;
    if (!taxExempt && subtotal > 0) {
      for (const l of lines) {
        const amt = lineAmount(l);
        const share = discount * (amt / subtotal);
        tax += (amt - share) * (taxRateOf(l.tax) / 100);
      }
    }
    tax = round2(tax);
    const grand = round2(subtotal - discount + tax);
    return { subtotal, discount, tax, grand };
  }, [lines, taxExempt, flatDiscount]);

  const allValid = lines.length > 0 && lines.every(lineValid);
  const submit = () => { if (!allValid) { setTouched(true); return; } onSubmit(); };

  return (
    <ModalShell title="Edit billing lines" locked={posting} onClose={onClose} width={720}
      subtitle={<span><span className="font-medium text-bz-text">{target.sub.plan}</span> · {target.customer.name} — changes apply to the <span className="font-medium text-bz-text">next billing cycle</span> only.</span>}
      footer={<>
        <button onClick={onClose} disabled={posting} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-50">Cancel</button>
        <button onClick={submit} disabled={posting || loading} title={!allValid ? "Complete every line first" : undefined}
          className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50">
          {posting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {posting ? "Saving…" : "Save lines"}
        </button>
      </>}>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-14 text-bz-text-muted"><Loader2 size={15} className="animate-spin text-bz-fire" /> <span className="text-[12.5px]">Loading current lines…</span></div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {taxExempt && (
            <div className="flex gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3">
              <Info size={14} className="mt-0.5 shrink-0 text-bz-text-muted" />
              <p className="text-[11.5px] leading-relaxed text-bz-text-muted">This subscription is <span className="font-medium text-bz-text">tax-exempt</span> — no tax is applied regardless of each line's tax class.</p>
            </div>
          )}

          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-bz-lg border border-dashed border-bz-line bg-bz-paper-warm/30 py-10 text-center">
              <Receipt size={20} className="text-bz-text-soft" />
              <p className="text-[13px] font-medium text-bz-text-muted">No billing lines</p>
              <p className="max-w-[320px] text-[11.5px] text-bz-text-muted">Add at least one line so the customer can be billed next cycle.</p>
              <button onClick={add} className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95"><Plus size={14} /> Add line</button>
            </div>
          ) : (
            <>
              {/* column header (desktop) */}
              <div className="hidden grid-cols-[1.6fr_0.7fr_0.7fr_1fr_0.9fr_auto] gap-2 px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-bz-text-soft sm:grid">
                <span>Revenue item</span><span className="text-right">Qty</span><span>Unit</span><span>Tax class</span><span className="text-right">Amount</span><span />
              </div>
              <div className="flex flex-col gap-2">
                {lines.map((l) => {
                  const invalid = touched && !lineValid(l);
                  return (
                    <div key={l.id} className={cn("rounded-bz-md border bg-bz-surface p-2.5", invalid ? "border-[#C0413A]/45 bg-[#FBE7E5]/20" : "border-bz-line-soft")}>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.6fr_0.7fr_0.7fr_1fr_0.9fr_auto] sm:items-center">
                        <div className="col-span-2 sm:col-span-1">
                          <MiniSelect value={l.item as string | null} options={REV_ITEMS} onChange={(v) => set(l.id, { item: v })} placeholder="Pick item…" invalid={touched && !l.item} />
                        </div>
                        <QtyInput value={l.qty} onChange={(v) => set(l.id, { qty: v })} invalid={touched && (l.qty ?? -1) < 0} />
                        <MiniSelect value={l.unit} options={UNIT_OPTS} onChange={(v) => set(l.id, { unit: v })} />
                        <MiniSelect value={taxExempt ? "EXM" : l.tax} options={TAX_OPTS} onChange={(v) => set(l.id, { tax: v })} />
                        <div className="flex items-center justify-end gap-1.5">
                          <QtyInput value={l.price} onChange={(v) => set(l.id, { price: v })} prefix={target.sub.currency} invalid={touched && (l.price ?? -1) < 0} />
                        </div>
                        <button onClick={() => remove(l.id)} className="hidden size-8 items-center justify-center justify-self-end rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29] sm:flex"><X size={14} /></button>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between sm:hidden">
                        <span className={cn("text-[11px] text-bz-text-muted", NUM)}>= {money(target.sub.currency, lineAmount(l))}</span>
                        <button onClick={() => remove(l.id)} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9A2E29]"><X size={12} /> Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={add} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-surface text-[12.5px] font-semibold text-bz-text-muted transition-colors hover:border-bz-text hover:text-bz-text"><Plus size={14} /> Add line</button>

              {/* live totals */}
              <div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/40 p-4">
                <TotalRow label="Subtotal" value={money(target.sub.currency, totals.subtotal)} />
                <TotalRow label={`Discount${flatDiscount > totals.subtotal ? " (capped at subtotal)" : ""}`} value={`− ${money(target.sub.currency, totals.discount)}`} muted />
                <TotalRow label={taxExempt ? "Tax (exempt)" : "Tax"} value={money(target.sub.currency, totals.tax)} muted />
                <div className="mt-2 flex items-center justify-between border-t border-bz-line pt-2.5">
                  <span className="text-[12.5px] font-semibold text-bz-text">Grand total / cycle</span>
                  <span className={cn("text-[17px] font-semibold text-bz-text", NUM)}>{money(target.sub.currency, totals.grand)}</span>
                </div>
              </div>
              {touched && !allValid && (
                <p className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#9A2E29]"><AlertTriangle size={12} /> Every line needs a revenue item, a non-negative quantity and price.</p>
              )}
            </>
          )}
        </div>
      )}
    </ModalShell>
  );
}
function TotalRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5 text-[12.5px]">
      <span className="text-bz-text-muted">{label}</span>
      <span className={cn(muted ? "text-bz-text-muted" : "font-medium text-bz-text", NUM)}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION ROW + CUSTOMER GROUP
// ════════════════════════════════════════════════════════════════════════════

function ActionBtn({ icon: Icon, label, onClick, disabled, danger }: {
  icon: React.ComponentType<{ size?: number; className?: string }>; label: string; onClick: () => void; disabled: boolean; danger?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={label}
      className={cn("inline-flex h-8 items-center gap-1.5 rounded-bz-md border px-2.5 text-[11.5px] font-medium transition-colors disabled:opacity-40",
        danger ? "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-[#C0413A]/40 hover:bg-[#FBE5E2] hover:text-[#9A2E29]" : "border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm")}>
      <Icon size={13} /> <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function SubscriptionRow({ s, posting, onPay, onEdit, onChange, onCancel }: {
  s: Sub; posting: boolean; onPay: () => void; onEdit: () => void; onChange: () => void; onCancel: () => void;
}) {
  const key = normalizeStatus(s.raw, s.trial, s.grace);
  const price = s.netPayable ?? s.billingAmount;
  const hasDates = !!s.activatedAt || !!s.renewalAt;
  return (
    <div className="flex flex-col gap-3 px-4 py-3.5 md:flex-row md:items-center md:gap-4 md:px-5">
      {/* plan + dates */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-[13.5px] font-medium text-bz-text">{s.plan}</span>
          <span className={cn("text-[10.5px] text-bz-text-soft", NUM)}>{s.id}</span>
        </div>
        <p className={cn("mt-0.5 text-[11px] text-bz-text-muted", NUM)}>
          {hasDates ? (
            <>
              {s.activatedAt && <>Started {fmtDate(s.activatedAt)}</>}
              {s.activatedAt && s.renewalAt && <span className="px-1 text-bz-text-soft">·</span>}
              {s.renewalAt && <>Renews {fmtDate(s.renewalAt)}</>}
            </>
          ) : <span className="text-bz-text-soft">No billing dates set</span>}
        </p>
      </div>

      {/* status */}
      <div className="shrink-0 md:w-[130px]"><StatusChip statusKey={key} /></div>

      {/* price */}
      <div className="shrink-0 md:w-[150px] md:text-right">
        <span className={cn("text-[13.5px] font-semibold text-bz-text", NUM)}>{money(s.currency, price)}</span>
        <span className="text-[10.5px] text-bz-text-soft">/{cycleShort(s.cycle)}</span>
      </div>

      {/* actions — only for active-like */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 md:w-[300px] md:justify-end">
        {isActiveLike(key) ? (
          <>
            <ActionBtn icon={Wallet} label="Record payment" onClick={onPay} disabled={posting} />
            <ActionBtn icon={Pencil} label="Edit lines" onClick={onEdit} disabled={posting} />
            <ActionBtn icon={Repeat} label="Change plan" onClick={onChange} disabled={posting} />
            <ActionBtn icon={Ban} label="Cancel" onClick={onCancel} disabled={posting} danger />
          </>
        ) : (
          <span className="text-[11px] text-bz-text-soft">No actions</span>
        )}
      </div>
    </div>
  );
}

function CustomerGroup({ c, posting, onAct }: {
  c: Customer; posting: boolean; onAct: (kind: "pay" | "edit" | "change" | "cancel", s: Sub) => void;
}) {
  const av = avatarOf(c.name);
  const count = c.subs.length;
  return (
    <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      {/* customer header */}
      <div className="flex items-center gap-3 border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3 md:px-5">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md text-[12px] font-semibold", av.bg, av.text)}>{initials(c.name)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-[14px] font-semibold text-bz-text" title={c.name}>{c.name}</span>
            {c.partyType && <span className="rounded-bz-sm bg-bz-surface px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted ring-1 ring-bz-line-soft">{c.partyType}</span>}
          </div>
          <p className={cn("mt-0.5 text-[11px] text-bz-text-muted", NUM)}>{count} {count === 1 ? "subscription" : "subscriptions"}</p>
        </div>
      </div>
      {/* subscription rows */}
      <div className="divide-y divide-bz-line-soft">
        {c.subs.map((s) => (
          <SubscriptionRow key={s.id} s={s} posting={posting}
            onPay={() => onAct("pay", s)} onEdit={() => onAct("edit", s)} onChange={() => onAct("change", s)} onCancel={() => onAct("cancel", s)} />
        ))}
      </div>
    </div>
  );
}

// ── loading / empty / pagination ─────────────────────────────────────────────
function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-2 py-1 text-bz-text-muted"><Loader2 size={15} className="animate-spin text-bz-fire" /> <span className="text-[12.5px] font-medium">Loading subscriptions…</span></div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          <div className="flex items-center gap-3 border-b border-bz-line-soft bg-bz-paper-warm/40 px-5 py-3">
            <div className="size-9 shrink-0 animate-pulse rounded-bz-md bg-bz-paper-warm" />
            <div className="flex-1"><div className="h-3 w-44 animate-pulse rounded-bz-sm bg-bz-paper-warm" /><div className="mt-1.5 h-2.5 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm" /></div>
          </div>
          {Array.from({ length: 2 }).map((__, j) => (
            <div key={j} className="flex items-center gap-4 border-t border-bz-line-soft px-5 py-4 first:border-t-0">
              <div className="h-3 flex-1 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
              <div className="h-5 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
              <div className="h-3 w-20 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasQuery, onNew }: { hasQuery: boolean; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Inbox size={22} /></span>
      <p className="text-[14px] font-semibold text-bz-text">No customer subscriptions found</p>
      <p className="max-w-sm text-[12px] text-bz-text-muted">{hasQuery ? "No customers match the current search and status filter. Try widening them." : "No customers hold a subscription yet. Subscribe one to get started."}</p>
      <button onClick={onNew} className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"><Plus size={14} /> New subscription</button>
    </div>
  );
}

function Pagination({ page, totalPages, totalCustomers, onPage }: { page: number; totalPages: number; totalCustomers: number; onPage: (p: number) => void }) {
  const step = (p: number) => { const n = clamp(p, 1, totalPages); if (n !== page) onPage(n); };
  const Btn = ({ onClick, disabled, children, label }: { onClick: () => void; disabled: boolean; children: React.ReactNode; label: string }) => (
    <button onClick={onClick} disabled={disabled} aria-label={label} className="flex size-8 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-35">{children}</button>
  );
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
      <p className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
        Page <span className="font-semibold text-bz-text">{page}</span> of {totalPages} · {totalCustomers} {totalCustomers === 1 ? "customer" : "customers"}
      </p>
      <div className="flex items-center gap-1.5">
        <Btn onClick={() => {}} disabled label="First page"><ChevronsLeft size={14} /></Btn>
        <Btn onClick={() => step(page - 1)} disabled={page <= 1} label="Previous page"><ChevronLeft size={14} /></Btn>
        <Btn onClick={() => step(page + 1)} disabled={page >= totalPages} label="Next page"><ChevronRight size={14} /></Btn>
        <Btn onClick={() => {}} disabled label="Last page"><ChevronsRight size={14} /></Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function CustomerSubscriptionsDesignPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | StatusKey>("all");
  const [page, setPage] = React.useState(1);

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [reloadKey, setReloadKey] = React.useState(0);

  const [posting, setPosting] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const notify = (kind: "success" | "warning" | "info", message: string) => setToast({ kind, message, id: ++toastId.current });

  const [changeTarget, setChangeTarget] = React.useState<{ customer: Customer; sub: Sub } | null>(null);
  const [editTarget, setEditTarget] = React.useState<{ customer: Customer; sub: Sub } | null>(null);
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);

  // debounce + de-dupe the name search (≈350ms); never filter locally
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim().toLowerCase();
      setQuery((prev) => (prev === next ? prev : next));
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  // any effective search / status change resets to the first page
  React.useEffect(() => { setPage(1); }, [query, status]);

  // the single server fetch — search + status + page → one prepared page
  React.useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      const res = serverQuery(query, status, page);
      if (page > res.totalPages) { setPage(res.totalPages); return; } // auto step-back; effect re-runs
      setRows(res.rows); setTotalCustomers(res.totalCustomers); setTotalPages(res.totalPages); setLoading(false);
    }, 450);
    return () => window.clearTimeout(t);
  }, [query, status, page, reloadKey]);

  const refetch = () => setReloadKey((k) => k + 1);

  // one posting flag gates every mutating action; success → notify + re-fetch
  const recordPayment = (customer: Customer, s: Sub) => {
    setPosting(true);
    window.setTimeout(() => {
      setPosting(false);
      if (s.noInvoice) { notify("warning", `No outstanding invoice could be resolved for ${s.plan} · ${customer.name}.`); return; }
      notify("info", `Opening a receipt for ${customer.name} — ${money(s.currency, s.netPayable ?? s.billingAmount)} on ${s.plan}.`);
    }, 600);
  };
  const submitChangePlan = (planLabel: string) => {
    setPosting(true);
    window.setTimeout(() => { setPosting(false); setChangeTarget(null); notify("success", `Plan changed to ${planLabel}.`); refetch(); }, 750);
  };
  const submitEditLines = () => {
    setPosting(true);
    window.setTimeout(() => { setPosting(false); setEditTarget(null); notify("success", "Billing lines updated for the next cycle."); refetch(); }, 750);
  };
  const askCancel = (customer: Customer, s: Sub) => {
    setConfirm({
      title: "Cancel this subscription?",
      body: <>Cancelling <span className="font-medium text-bz-text">{s.plan}</span> for <span className="font-medium text-bz-text">{customer.name}</span> stops all future billing immediately. This can't be undone.</>,
      confirmLabel: "Cancel subscription",
      onConfirm: () => {
        setPosting(true);
        window.setTimeout(() => { setPosting(false); setConfirm(null); notify("success", `${s.plan} for ${customer.name} was cancelled.`); refetch(); }, 750);
      },
    });
  };

  const onAct = (customer: Customer) => (kind: "pay" | "edit" | "change" | "cancel", s: Sub) => {
    if (kind === "pay") recordPayment(customer, s);
    else if (kind === "edit") setEditTarget({ customer, sub: s });
    else if (kind === "change") setChangeTarget({ customer, sub: s });
    else askCancel(customer, s);
  };

  const isEmpty = !loading && rows.length === 0;

  return (
    <AppShell
      breadcrumb={<>
        <span className="text-bz-text-muted">Subscriptions</span>
        <ChevronRight size={11} className="text-bz-text-soft" />
        <span className="font-semibold text-bz-text">Customer Subscriptions</span>
      </>}
      overlay={<>
        {changeTarget && <ChangePlanModal target={changeTarget} plans={PLAN_OPTIONS} posting={posting} onClose={() => !posting && setChangeTarget(null)} onSubmit={submitChangePlan} />}
        {editTarget && <EditLinesModal target={editTarget} posting={posting} onClose={() => !posting && setEditTarget(null)} onSubmit={submitEditLines} />}
        <ConfirmDialog state={confirm} posting={posting} onClose={() => setConfirm(null)} />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>}
    >
      {/* header */}
      <header className="px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Customer Subscriptions</h1>
              {!loading && (
                <span className={cn("inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold text-bz-text-muted", NUM)}>{totalCustomers}</span>
              )}
            </div>
            <p className="mt-1 text-[12.5px] text-bz-text-muted">Every customer holding a recurring plan — record payments, edit lines, change plans or cancel the live ones.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => notify("info", "Opening subscription notification settings…")} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm">
              <Bell size={14} /> <span className="hidden sm:inline">Notifications</span>
            </button>
            <button onClick={() => navigate("/design/subscription-revenue")} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm">
              <BarChart3 size={14} /> <span className="hidden sm:inline">Revenue</span>
            </button>
            <button onClick={() => navigate("/design/subscribe-party")} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95">
              <Plus size={14} /> New Subscription
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-10 md:px-8">
        {/* toolbar: search + status + result-count */}
        <div className="flex flex-col gap-2.5 rounded-bz-lg border border-bz-line-soft bg-bz-surface p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-muted" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search customers by name…"
              className="h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper py-2 pl-9 pr-8 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted" />
            {searchInput && <button onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={12} /></button>}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-[170px]">
              <Dropdown<"all" | StatusKey> value={status} options={STATUS_FILTERS} onChange={(v) => setStatus(v)} icon={Tag} />
            </div>
            {!loading && (
              <span className={cn("hidden whitespace-nowrap text-[12px] text-bz-text-muted sm:inline", NUM)}>
                <span className="font-semibold text-bz-text">{totalCustomers}</span> {totalCustomers === 1 ? "customer" : "customers"}
              </span>
            )}
          </div>
        </div>

        {/* list region */}
        {loading ? (
          <ListSkeleton />
        ) : isEmpty ? (
          <EmptyState hasQuery={query.length > 0 || status !== "all"} onNew={() => navigate("/design/subscribe-party")} />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {rows.map((c) => <CustomerGroup key={c.id} c={c} posting={posting} onAct={onAct(c)} />)}
            </div>
            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} totalCustomers={totalCustomers} onPage={setPage} />}
          </>
        )}
      </div>
    </AppShell>
  );
}
