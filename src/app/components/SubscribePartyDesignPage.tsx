import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Search,
  X,
  Check,
  Plus,
  Loader2,
  Info,
  AlertTriangle,
  Wallet,
  Repeat,
  Ban,
  Gift,
  RefreshCcw,
  ShieldOff,
  Mail,
  Bell,
  CalendarClock,
  Building2,
  UserPlus,
  Zap,
  Clock,
  CalendarX,
  PauseCircle,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// SUBSCRIBE A PARTY · (enrol a party onto a plan → commit)
//
// Primary action = COMMIT a valid subscription. The page is one reactive form:
//   choosing a PARTY reveals its context + existing subscriptions; choosing a
//   PLAN snapshots that plan's billed lines into an editable set priced to the
//   active cycle; totals recompute live; a docked footer commits when valid.
//
// Layout: a wide form column (subscriber → plan & billing → lines → options) and
// a sticky context rail (party readout + existing subscriptions). The shared
// change-plan modal and the lifecycle-status vocabulary mirror the Customer
// Subscriptions listing.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const CURRENCY = "NPR";
function money(code: string, n: number | undefined | null): string {
  const v = n == null || !isFinite(n) ? 0 : n;
  return `${code ? code + " " : ""}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
let _uid = 0;
const uid = (p: string) => `${p}-${++_uid}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso?: string | null) => { if (!iso) return "—"; const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };

const CYCLE_SHORT: Record<string, string> = { monthly: "mo", quarterly: "qtr", yearly: "yr" };
const CYCLE_MULT: Record<string, number> = { monthly: 1, quarterly: 3, yearly: 12 };
const cycleShort = (c: string) => CYCLE_SHORT[c] ?? c;

// ── lifecycle status (identical mapping to the listing page) ──────────────────
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
const ACTIVE_LIKE: StatusKey[] = ["active", "pastdue", "grace", "trial"];
const CHIP_BG: Record<Tone, string> = {
  positive: "bg-bz-fire/[0.18] text-bz-text", partial: "bg-bz-leaf/50 text-bz-text", pending: "bg-bz-paper-warm text-bz-text-muted",
  danger: "bg-[#FBE5E2] text-[#9A2E29]", neutral: "bg-bz-paper-warm text-bz-text",
};
function StatusChip({ statusKey }: { statusKey: StatusKey }) {
  const m = STATUS_META[statusKey]; const Glyph = m.glyph;
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", CHIP_BG[m.tone])}><Glyph size={11} /> {m.label}</span>;
}

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA
// ════════════════════════════════════════════════════════════════════════════

type SubType = { id: string; label: string; master: string };
const SUBSCRIBER_TYPES: SubType[] = [
  { id: "customer", label: "Customer", master: "Customers master" },
  { id: "lead", label: "Lead", master: "Leads master" },
  { id: "prospect", label: "Prospect", master: "Prospects master" },
  { id: "vendor", label: "Vendor", master: "Vendors master" },
  { id: "employee", label: "Employee", master: "Employees master" },
];
const ORGS = [
  { id: "NP-01", label: "NP-01 · Bizak Nepal" },
  { id: "NP-02", label: "NP-02 · Bizak Pokhara" },
  { id: "IN-01", label: "IN-01 · Bizak India" },
];

type Party = { id: string; name: string; type: string; email?: string; phone?: string; address?: string; taxReg?: string };
const PARTY_POOL: Party[] = [
  { id: "P-01", name: "Himalayan Java Coffee", type: "customer", email: "billing@himalayanjava.com", phone: "+977-1-4412233", address: "Thamel, Kathmandu", taxReg: "601234567" },
  { id: "P-02", name: "Annapurna Logistics", type: "customer", email: "accounts@annapurnalog.com", phone: "+977-1-5523344", taxReg: "609988776" },
  { id: "P-03", name: "Sherpa Adventures", type: "lead", email: "info@sherpaadv.com", address: "Lakeside, Pokhara" },
  { id: "P-04", name: "Everest Bank Pvt. Ltd.", type: "customer", phone: "+977-1-4445566", address: "Lazimpat, Kathmandu", taxReg: "600112233" },
  { id: "P-05", name: "Pokhara Handmade Paper Co.", type: "prospect", email: "hello@pokharapaper.com" },
  { id: "P-06", name: "Kathmandu Crafts Export", type: "customer", email: "ar@ktmcrafts.com", phone: "+977-1-4778899", taxReg: "605544332" },
  { id: "P-07", name: "Lumbini Organic Farms", type: "prospect", address: "Rupandehi" },
  { id: "P-08", name: "Mustang Trading House", type: "vendor", email: "vendor@mustangtrade.com", phone: "+977-1-4334455" },
  { id: "P-09", name: "Gandaki Freight Services", type: "vendor", taxReg: "607766554" },
  { id: "P-10", name: "Rin Bahadur Thapa", type: "employee", email: "rin.thapa@bizak.com", phone: "+977-98-44112233" },
  { id: "P-11", name: "Chitwan Resorts & Spa", type: "customer", email: "finance@chitwanresorts.com", address: "Sauraha, Chitwan" },
  { id: "P-12", name: "Dolpa Wholesale Mart", type: "lead", phone: "+977-87-550022" },
];

type PlanLineTpl = { name: string; item: string; qty: number; unit: string; price: number; tax: string };
type Plan = { id: string; label: string; cycle: string; trial: boolean; lines: PlanLineTpl[] };
const PLANS: Plan[] = [
  { id: "PLAN-STARTER", label: "Starter (Standard)", cycle: "monthly", trial: false, lines: [{ name: "Base platform", item: "RI-BASE", qty: 1, unit: "month", price: 1500, tax: "VAT" }] },
  { id: "PLAN-GROWTH", label: "Growth (Standard)", cycle: "monthly", trial: true, lines: [{ name: "Base platform", item: "RI-BASE", qty: 1, unit: "month", price: 2500, tax: "VAT" }, { name: "Additional seat", item: "RI-SEAT", qty: 5, unit: "seat", price: 200, tax: "VAT" }] },
  { id: "PLAN-PRO", label: "Pro (Standard)", cycle: "monthly", trial: true, lines: [{ name: "Base platform", item: "RI-BASE", qty: 1, unit: "month", price: 4500, tax: "VAT" }, { name: "Additional seat", item: "RI-SEAT", qty: 10, unit: "seat", price: 200, tax: "VAT" }] },
  { id: "PLAN-SCALE", label: "Scale (Standard)", cycle: "monthly", trial: false, lines: [{ name: "Base platform", item: "RI-BASE", qty: 1, unit: "month", price: 9000, tax: "VAT" }, { name: "Analytics module", item: "RI-ANALYTICS", qty: 1, unit: "unit", price: 3000, tax: "VAT" }] },
  { id: "PLAN-ENT", label: "Enterprise (Custom)", cycle: "yearly", trial: false, lines: [{ name: "Base platform", item: "RI-BASE", qty: 1, unit: "year", price: 48000, tax: "EXM" }] },
];
type Ref = { id: string; label: string };
const REV_ITEMS: Ref[] = [
  { id: "RI-BASE", label: "Base platform" }, { id: "RI-SEAT", label: "Additional seat" }, { id: "RI-POS", label: "POS terminal" },
  { id: "RI-API", label: "API usage" }, { id: "RI-SUPPORT", label: "Priority support" }, { id: "RI-ANALYTICS", label: "Analytics module" },
];
const UNIT_OPTS: Ref[] = ["seat", "user", "month", "year", "device", "unit"].map((u) => ({ id: u, label: u }));
const TAX_OPTS: { id: string; label: string; rate: number }[] = [{ id: "VAT", label: "VAT 13%", rate: 13 }, { id: "DST", label: "DST 2%", rate: 2 }, { id: "EXM", label: "Exempt", rate: 0 }];
const NOTIF_EVENTS: Ref[] = [
  { id: "renewal", label: "Upcoming renewal reminder" }, { id: "trial_end", label: "Trial ending" },
  { id: "payment_failed", label: "Payment failed" }, { id: "expired", label: "Plan expired" },
];

// ── plan options for the change-plan modal ───────────────────────────────────
type PlanOpt = { id: string; label: string; price: number; cycle: string; custom?: boolean };
const PLAN_OPTIONS: PlanOpt[] = [
  { id: "PLAN-STARTER", label: "Starter (Standard)", price: 1500, cycle: "monthly" },
  { id: "PLAN-GROWTH", label: "Growth (Standard)", price: 3500, cycle: "monthly" },
  { id: "PLAN-PRO", label: "Pro (Standard)", price: 6500, cycle: "monthly" },
  { id: "PLAN-SCALE", label: "Scale (Standard)", price: 12000, cycle: "monthly" },
  { id: "PLAN-ENT", label: "Enterprise (Custom)", price: 0, cycle: "yearly", custom: true },
];

// ── existing subscriptions per party (simulated) ─────────────────────────────
type ExistingSub = { id: string; plan: string; raw: string; trial: boolean; grace: boolean; amount: number; cycle: string; expiry: string | null };
function existingFor(partyId: string): ExistingSub[] {
  const map: Record<string, ExistingSub[]> = {
    "P-01": [
      { id: "S-5001", plan: "Pro", raw: "active", trial: false, grace: false, amount: 6500, cycle: "monthly", expiry: "2026-07-01" },
      { id: "S-5002", plan: "POS Add-on", raw: "active", trial: false, grace: false, amount: 1500, cycle: "monthly", expiry: "2026-07-01" },
    ],
    "P-04": [{ id: "S-5005", plan: "Enterprise", raw: "active", trial: false, grace: true, amount: 48000, cycle: "yearly", expiry: "2026-07-01" }],
    "P-06": [{ id: "S-5008", plan: "Pro", raw: "active", trial: false, grace: false, amount: 6500, cycle: "monthly", expiry: "2026-07-20" }],
    "P-11": [{ id: "S-5011", plan: "Scale", raw: "pastdue", trial: false, grace: false, amount: 12000, cycle: "monthly", expiry: "2026-06-05" }],
  };
  return map[partyId] ?? [];
}
function normalizeExisting(s: ExistingSub): StatusKey {
  if (s.grace) return "grace";
  if (s.raw === "active" && s.trial) return "trial";
  return (["active", "pastdue", "expired", "upgraded", "cancelled", "suspended"].includes(s.raw) ? s.raw : "active") as StatusKey;
}

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

const INPUT = "h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text";

function Card({ title, desc, icon: Icon, children, rightSlot }: { title: string; desc?: string; icon: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode; rightSlot?: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft bg-bz-paper px-4 py-3 md:px-5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Icon size={14} /></span>
          <div className="min-w-0"><p className="text-[13.5px] font-semibold text-bz-text">{title}</p>{desc && <p className="mt-0.5 text-[11.5px] text-bz-text-muted">{desc}</p>}</div>
        </div>
        {rightSlot}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-[11px] font-medium text-bz-text-muted">{children}{required && <span className="ml-0.5 text-bz-fire">*</span>}</span>
      {hint && <span className="text-[10px] text-bz-text-soft">{hint}</span>}
    </div>
  );
}

function PillSelect<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)}
            className={cn("h-9 rounded-bz-pill border px-3.5 text-[12.5px] font-medium transition-colors", on ? "border-bz-deep bg-bz-deep text-bz-text-on-dark" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-bz-line hover:text-bz-text")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function MiniSelect<T extends string>({ value, options, onChange, placeholder, invalid, disabled }: {
  value: T | null; options: { id: T; label: string }[]; onChange: (v: T) => void; placeholder?: string; invalid?: boolean; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select value={value ?? ""} disabled={disabled} onChange={(e) => onChange(e.target.value as T)}
        className={cn("h-9 w-full appearance-none rounded-bz-md border bg-bz-surface pl-2.5 pr-8 text-[12.5px] outline-none focus:border-bz-text disabled:bg-bz-paper-warm", invalid ? "border-[#C0413A]" : "border-bz-line-soft", value ? "text-bz-text" : "text-bz-text-soft")}>
        <option value="" disabled>{placeholder ?? "Select…"}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
    </div>
  );
}

function NumInput({ value, onChange, prefix, suffix, placeholder, min = 0, max, align = "right", disabled, invalid }: {
  value: number | undefined; onChange: (v: number | undefined) => void; prefix?: string; suffix?: string; placeholder?: string; min?: number; max?: number; align?: "left" | "right"; disabled?: boolean; invalid?: boolean;
}) {
  const [raw, setRaw] = React.useState(value == null ? "" : String(value));
  React.useEffect(() => { setRaw(value == null ? "" : String(value)); }, [value]);
  return (
    <div className={cn("flex h-9 items-center rounded-bz-md border bg-bz-surface px-2.5 transition-colors focus-within:border-bz-text", invalid ? "border-[#C0413A]" : "border-bz-line-soft", disabled && "bg-bz-paper-warm")}>
      {prefix && <span className="mr-1 text-[11px] text-bz-text-soft">{prefix}</span>}
      <input inputMode="decimal" value={raw} placeholder={placeholder} disabled={disabled}
        onChange={(e) => { const v = e.target.value; if (v === "" || /^\d*\.?\d*$/.test(v)) { setRaw(v); onChange(v === "" || v === "." ? undefined : Number(v)); } }}
        onBlur={() => { if (raw === "" || raw === ".") { onChange(undefined); return; } let n = round2(Number(raw)); n = clamp(n, min, max ?? Infinity); onChange(n); setRaw(String(n)); }}
        className={cn("h-full w-full bg-transparent text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft", NUM, align === "right" && "text-right", disabled && "text-bz-text-muted")} />
      {suffix && <span className="ml-1 text-[11px] text-bz-text-soft">{suffix}</span>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, invalid }: { value: string; onChange: (v: string) => void; placeholder?: string; invalid?: boolean }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(INPUT, invalid && "border-[#C0413A]")} />;
}

function Switch({ value, onChange, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; ariaLabel?: string }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={ariaLabel} onClick={() => onChange(!value)}
      className={cn("relative inline-flex h-[20px] w-9 shrink-0 items-center rounded-bz-pill border transition-colors", value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line")}>
      <span className={cn("pointer-events-none absolute h-3.5 w-3.5 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform", value ? "translate-x-[18px]" : "translate-x-[2px]")} />
    </button>
  );
}

function ToggleCard({ icon: Icon, title, desc, value, onChange, children }: {
  icon: React.ComponentType<{ size?: number; className?: string }>; title: string; desc: string; value: boolean; onChange: (v: boolean) => void; children?: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-bz-lg border transition-colors", value ? "border-bz-fire/40 bg-bz-fire/[0.04]" : "border-bz-line-soft bg-bz-surface")}>
      <div className="flex items-center gap-3 p-3.5">
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-bz-md", value ? "bg-bz-fire text-bz-olive" : "bg-bz-paper-warm text-bz-text-muted")}><Icon size={15} /></span>
        <div className="min-w-0 flex-1"><p className="text-[12.5px] font-medium text-bz-text">{title}</p><p className="text-[11px] text-bz-text-muted">{desc}</p></div>
        <Switch value={value} onChange={onChange} ariaLabel={title} />
      </div>
      {value && children && <div className="border-t border-bz-line-soft bg-bz-surface/60 p-3.5">{children}</div>}
    </div>
  );
}

type ToastState = { kind: "success" | "warning" | "info"; message: string; id: number } | null;
function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => { if (!toast) return; const t = window.setTimeout(onDismiss, 4000); return () => window.clearTimeout(t); }, [toast, onDismiss]);
  if (!toast) return null;
  const k = toast.kind;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[97] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", k === "success" ? "bg-bz-fire/[0.18]" : k === "warning" ? "bg-[#FBE5E2]" : "bg-bz-paper-warm")}>
          {k === "success" ? <Check size={13} className="text-bz-leaf-deep" /> : k === "warning" ? <AlertTriangle size={12} className="text-[#9A2E29]" /> : <Info size={13} className="text-bz-text-muted" />}
        </span>
        <p className="max-w-[440px] text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ── party search-select (debounced · lazy paged) ─────────────────────────────
const PICK_PAGE = 5;
function PartyPicker({ value, candidates, loading, onPick, onClear }: {
  value: Party | null; candidates: Party[]; loading: boolean; onPick: (p: Party) => void; onClear: () => void;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [searching, setSearching] = React.useState(false);
  const [more, setMore] = React.useState(false);

  React.useLayoutEffect(() => { if (open && btnRef.current) { const r = btnRef.current.getBoundingClientRect(); setPos({ top: r.bottom + 6, left: r.left, width: r.width }); } else setPos(null); }, [open]);
  React.useEffect(() => { if (open) { setRaw(""); setQuery(""); setPages(1); const t = window.setTimeout(() => inputRef.current?.focus(), 10); return () => window.clearTimeout(t); } }, [open]);
  // debounce the typed search ≈300ms
  React.useEffect(() => { if (!open) return; setSearching(true); const t = window.setTimeout(() => { setQuery(raw.trim().toLowerCase()); setPages(1); setSearching(false); }, 300); return () => window.clearTimeout(t); }, [raw, open]);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { const t = e.target as Node; if (!btnRef.current?.contains(t) && !document.getElementById("pp-pop")?.contains(t)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = (e: Event) => { if (document.getElementById("pp-pop")?.contains(e.target as Node)) return; setOpen(false); };
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey); window.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll, true); };
  }, [open]);

  const filtered = query ? candidates.filter((c) => c.name.toLowerCase().includes(query)) : candidates;
  const visible = filtered.slice(0, pages * PICK_PAGE);
  const hasMore = visible.length < filtered.length;
  const onScrollList = () => { const el = listRef.current; if (!el || more || !hasMore) return; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) { setMore(true); window.setTimeout(() => { setPages((p) => p + 1); setMore(false); }, 320); } };

  return (
    <div className="min-w-0">
      <button ref={btnRef} type="button" onClick={() => setOpen((v) => !v)}
        className={cn("flex h-10 w-full items-center gap-2 rounded-bz-md border px-3 text-left transition-colors", open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line")}>
        {loading ? <Loader2 size={14} className="shrink-0 animate-spin text-bz-fire" /> : <Search size={14} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("min-w-0 flex-1 truncate text-[13px]", value ? "text-bz-text" : "text-bz-text-soft")}>{loading ? "Loading candidates…" : value ? value.name : "Search & select a party…"}</span>
        {value && !loading ? (
          <span role="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onClear(); }} className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={12} /></span>
        ) : <ChevronDown size={14} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />}
      </button>
      {open && pos && createPortal(
        <div id="pp-pop" style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 280) }}
          className="z-[90] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={12} className="shrink-0 text-bz-text-muted" />
              <input ref={inputRef} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Type a name…" className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
              {raw && <button onClick={() => setRaw("")} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"><X size={10} /></button>}
            </div>
          </div>
          <div ref={listRef} onScroll={onScrollList} className="max-h-[248px] overflow-y-auto py-1">
            {searching ? (
              <div className="flex items-center justify-center gap-2 py-6 text-bz-text-muted"><Loader2 size={13} className="animate-spin text-bz-fire" /> <span className="text-[11.5px]">Searching…</span></div>
            ) : candidates.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-3 py-7 text-center"><Info size={15} className="text-bz-text-soft" /><p className="text-[11.5px] font-medium text-bz-text-muted">No records found</p><p className="text-[10.5px] text-bz-text-soft">Create one in masters first.</p></div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-3 py-7 text-center"><Search size={15} className="text-bz-text-soft" /><p className="text-[11.5px] font-medium text-bz-text-muted">No matches for “{raw}”</p></div>
            ) : (
              visible.map((c) => (
                <button key={c.id} onClick={() => { onPick(c); setOpen(false); }} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm", value?.id === c.id && "bg-bz-fire/[0.06]")}>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] text-bz-text">{c.name}</span><span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{c.email ?? c.phone ?? c.id}</span></span>
                  {value?.id === c.id && <Check size={13} className="shrink-0 text-bz-text" />}
                </button>
              ))
            )}
            {more && <div className="flex items-center justify-center gap-2 py-2.5 text-bz-text-muted"><Loader2 size={12} className="animate-spin text-bz-fire" /> <span className="text-[11px]">Loading more…</span></div>}
          </div>
        </div>, document.body)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EDITABLE LINES
// ════════════════════════════════════════════════════════════════════════════

type Line = { id: string; name: string; item: string | null; qty: number | undefined; unit: string; price: number | undefined; tax: string; fromPlan: boolean };
const lineAmount = (l: Line) => round2((l.qty ?? 0) * (l.price ?? 0));
const taxRateOf = (id: string) => TAX_OPTS.find((t) => t.id === id)?.rate ?? 0;

function LineRow({ l, currency, onChange, onRemove }: { l: Line; currency: string; onChange: (patch: Partial<Line>) => void; onRemove: () => void }) {
  return (
    <div className="rounded-bz-md border border-bz-line-soft bg-bz-surface p-2.5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.5fr_1.3fr_0.7fr_0.8fr_1fr_0.9fr_auto] sm:items-center">
        <input value={l.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Line name…" className="col-span-2 h-9 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text sm:col-span-1" />
        <MiniSelect value={l.item as string | null} options={REV_ITEMS} onChange={(v) => onChange({ item: v })} placeholder="Item…" />
        <NumInput value={l.qty} onChange={(v) => onChange({ qty: v })} />
        <MiniSelect value={l.unit} options={UNIT_OPTS} onChange={(v) => onChange({ unit: v })} />
        <NumInput value={l.price} onChange={(v) => onChange({ price: v })} prefix={currency} />
        <MiniSelect value={l.tax} options={TAX_OPTS} onChange={(v) => onChange({ tax: v })} />
        <button onClick={onRemove} className="hidden size-8 items-center justify-center justify-self-end rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29] sm:flex"><X size={14} /></button>
      </div>
      <div className="mt-1.5 flex items-center justify-between sm:hidden">
        <span className={cn("text-[11px] text-bz-text-muted", NUM)}>= {money(currency, lineAmount(l))}</span>
        <button onClick={onRemove} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9A2E29]"><X size={12} /> Remove</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CHANGE-PLAN MODAL (shared contract)
// ════════════════════════════════════════════════════════════════════════════

function ModalShell({ title, subtitle, onClose, locked, footer, children }: { title: string; subtitle?: React.ReactNode; onClose: () => void; locked: boolean; footer: React.ReactNode; children: React.ReactNode }) {
  React.useEffect(() => { const onKey = (e: KeyboardEvent) => e.key === "Escape" && !locked && onClose(); document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [onClose, locked]);
  return createPortal(
    <div className="fixed inset-0 z-[96] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="absolute inset-0 bg-bz-olive/40 backdrop-blur-[1px]" onClick={() => !locked && onClose()} aria-hidden />
      <div className="relative my-auto w-full max-w-[540px] overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_70px_-24px_rgba(15,20,17,0.34)]">
        <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft bg-bz-paper px-5 py-4">
          <div className="min-w-0"><p className="text-[15px] font-semibold tracking-tight text-bz-text">{title}</p>{subtitle && <div className="mt-0.5 text-[12px] text-bz-text-muted">{subtitle}</div>}</div>
          <button onClick={() => !locked && onClose()} disabled={locked} className="flex size-8 shrink-0 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-40"><X size={16} /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-5 py-3.5">{footer}</div>
      </div>
    </div>, document.body);
}

function ChangePlanModal({ target, posting, onClose, onSubmit }: { target: ExistingSub; posting: boolean; onClose: () => void; onSubmit: (label: string) => void }) {
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [cycle, setCycle] = React.useState("");
  const [discount, setDiscount] = React.useState<number | undefined>(undefined);
  const [timing, setTiming] = React.useState<"now" | "next">("now");
  const [preview, setPreview] = React.useState<{ credit: number; price: number; days: number; due: number } | null>(null);
  const [pstate, setPstate] = React.useState<"idle" | "loading" | "shown" | "unavailable">("idle");
  const plan = PLAN_OPTIONS.find((p) => p.id === planId) ?? null;
  React.useEffect(() => {
    if (!plan) { setPstate("idle"); setPreview(null); return; }
    setPstate("loading"); setPreview(null);
    const t = window.setTimeout(() => {
      if (plan.custom) { setPstate("unavailable"); return; }
      const days = 18; const mult = cycle === "yearly" ? 12 : cycle === "quarterly" ? 3 : 1;
      const price = round2(plan.price * mult); const credit = round2((target.amount * days) / 30);
      setPreview({ credit, price, days, due: Math.max(0, round2(price - credit - (discount ?? 0))) }); setPstate("shown");
    }, 600);
    return () => window.clearTimeout(t);
  }, [planId, cycle, discount, plan, target.amount]);
  return (
    <ModalShell title="Change plan" locked={posting} onClose={onClose}
      subtitle={<>Move off <span className="font-medium text-bz-text">{target.plan}</span> — current period closes as Upgraded.</>}
      footer={<>
        <button onClick={onClose} disabled={posting} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-50">Cancel</button>
        <button onClick={() => plan && onSubmit(plan.label)} disabled={!plan || posting} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50">{posting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {posting ? "Applying…" : "Apply change"}</button>
      </>}>
      <div className="flex flex-col gap-4">
        <div><FieldLabel required>New plan</FieldLabel><MiniSelect value={planId as string | null} options={PLAN_OPTIONS.map((p) => ({ id: p.id, label: p.label }))} onChange={setPlanId} placeholder="Choose a plan…" /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><FieldLabel>Cycle override</FieldLabel><MiniSelect value={(cycle || null) as string | null} options={[{ id: "monthly", label: "Monthly" }, { id: "quarterly", label: "Quarterly" }, { id: "yearly", label: "Yearly" }]} onChange={setCycle} placeholder="Keep default" /></div>
          <div><FieldLabel>Discount</FieldLabel><NumInput value={discount} onChange={setDiscount} prefix={CURRENCY} /></div>
        </div>
        <div><FieldLabel>Apply</FieldLabel>
          <div className="inline-grid w-full grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
            {([["now", "Immediately"], ["next", "Next cycle"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTiming(id)} className={cn("h-8 rounded-bz-sm px-3 text-[12px] font-medium", timing === id ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted")}>{label}</button>
            ))}
          </div>
        </div>
        {pstate === "loading" && <div className="flex items-center justify-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 py-6 text-bz-text-muted"><Loader2 size={14} className="animate-spin text-bz-fire" /> <span className="text-[12px]">Calculating proration…</span></div>}
        {pstate === "shown" && preview && (
          <div className="overflow-hidden rounded-bz-lg bg-bz-olive p-4 text-bz-text-on-dark">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-fire">Proration preview</p>
            <div className="mt-3 flex flex-col gap-2 text-[12.5px]">
              <div className="flex justify-between"><span className="text-bz-text-on-dark-muted">Unused credit · {preview.days} days</span><span className={cn("font-medium", NUM)}>− {money(CURRENCY, preview.credit)}</span></div>
              <div className="flex justify-between"><span className="text-bz-text-on-dark-muted">New plan price</span><span className={cn("font-medium", NUM)}>{money(CURRENCY, preview.price)}</span></div>
              <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2.5"><span className="font-medium">{timing === "now" ? "Due today" : "Due next cycle"}</span><span className={cn("text-[17px] font-semibold text-bz-fire", NUM)}>{money(CURRENCY, preview.due)}</span></div>
            </div>
          </div>
        )}
        {pstate === "unavailable" && <div className="flex gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3"><Info size={14} className="mt-0.5 shrink-0 text-bz-text-muted" /><p className="text-[11.5px] leading-relaxed text-bz-text-muted">No proration preview for a custom plan — billing is settled out-of-band.</p></div>}
      </div>
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONTEXT RAIL
// ════════════════════════════════════════════════════════════════════════════

function ContextRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-baseline justify-between gap-3 py-1.5"><span className="text-[11px] text-bz-text-soft">{label}</span><span className={cn("min-w-0 truncate text-right text-[12px] text-bz-text", NUM)}>{value}</span></div>;
}

function ExistingSubRow({ s, posting, onPay, onChange, onCancel }: { s: ExistingSub; posting: boolean; onPay: () => void; onChange: () => void; onCancel: () => void }) {
  const key = normalizeExisting(s);
  const activeLike = ACTIVE_LIKE.includes(key);
  return (
    <div className="rounded-bz-md border border-bz-line-soft bg-bz-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0"><p className="truncate text-[12.5px] font-medium text-bz-text">{s.plan}</p><p className={cn("mt-0.5 text-[10.5px] text-bz-text-soft", NUM)}>Expires {fmtDate(s.expiry)}</p></div>
        <StatusChip statusKey={key} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={cn("text-[12.5px] font-semibold text-bz-text", NUM)}>{money(CURRENCY, s.amount)}<span className="text-[10px] font-normal text-bz-text-soft">/{cycleShort(s.cycle)}</span></span>
        {activeLike && (
          <div className="flex items-center gap-1">
            <button onClick={onPay} disabled={posting} title="Record payment" className="flex size-7 items-center justify-center rounded-bz-sm border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-40"><Wallet size={13} /></button>
            <button onClick={onChange} disabled={posting} title="Change plan" className="flex size-7 items-center justify-center rounded-bz-sm border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-40"><Repeat size={13} /></button>
            <button onClick={onCancel} disabled={posting} title="Cancel" className="flex size-7 items-center justify-center rounded-bz-sm border border-bz-line-soft bg-bz-surface text-bz-text-soft hover:border-[#C0413A]/40 hover:bg-[#FBE5E2] hover:text-[#9A2E29] disabled:opacity-40"><Ban size={13} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function SubscribePartyDesignPage() {
  const navigate = useNavigate();

  // subscriber
  const [subType, setSubType] = React.useState("customer");
  const [org, setOrg] = React.useState("NP-01");
  const [party, setParty] = React.useState<Party | null>(null);
  const [candLoading, setCandLoading] = React.useState(false);
  const [candidates, setCandidates] = React.useState<Party[]>([]);

  // party context-driven existing subs
  const [existing, setExisting] = React.useState<ExistingSub[]>([]);
  const [existingLoading, setExistingLoading] = React.useState(false);

  // plan & billing
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [cycle, setCycle] = React.useState("monthly");
  const [customPrice, setCustomPrice] = React.useState<number | undefined>(undefined);
  const [discount, setDiscount] = React.useState<number | undefined>(undefined);
  const [graceOverride, setGraceOverride] = React.useState<number | undefined>(undefined);
  const [lines, setLines] = React.useState<Line[]>([]);

  // options
  const [trialOn, setTrialOn] = React.useState(false);
  const [trialDays, setTrialDays] = React.useState<number | undefined>(14);
  const [autoRenew, setAutoRenew] = React.useState(true);
  const [taxExempt, setTaxExempt] = React.useState(false);
  const [emailInvoice, setEmailInvoice] = React.useState(false);
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [recipientName, setRecipientName] = React.useState("");
  const [notifyCustom, setNotifyCustom] = React.useState(false);
  const [notif, setNotif] = React.useState<Record<string, boolean>>({ renewal: true, trial_end: true, payment_failed: true, expired: false });
  const [invoiceTiming, setInvoiceTiming] = React.useState(false);
  const [invoiceOffset, setInvoiceOffset] = React.useState<number | undefined>(0);
  const [pastDueGen, setPastDueGen] = React.useState(false);

  // flow
  const [posting, setPosting] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const [changeTarget, setChangeTarget] = React.useState<ExistingSub | null>(null);
  const toastId = React.useRef(0);
  const notify = (kind: "success" | "warning" | "info", message: string) => setToast({ kind, message, id: ++toastId.current });

  const multiOrg = true; // tenant is multi-organisation → org selector shown

  // load candidates whenever type/org changes (clears the selected party)
  const reloadCandidates = React.useCallback((type: string) => {
    setParty(null); setExisting([]); setCandLoading(true);
    const t = window.setTimeout(() => { setCandidates(PARTY_POOL.filter((p) => p.type === type)); setCandLoading(false); }, 500);
    return () => window.clearTimeout(t);
  }, []);
  React.useEffect(() => reloadCandidates(subType), [subType, org, reloadCandidates]);

  // choosing a party → context + existing subscriptions; prefill invoice recipient
  const pickParty = (p: Party) => {
    setParty(p);
    setRecipientEmail(p.email ?? ""); setRecipientName(p.name);
    setExistingLoading(true); setExisting([]);
    window.setTimeout(() => { setExisting(existingFor(p.id)); setExistingLoading(false); }, 600);
  };
  const refreshExisting = () => { if (!party) return; setExistingLoading(true); window.setTimeout(() => { setExisting(existingFor(party.id)); setExistingLoading(false); }, 500); };

  // choosing a plan → snapshot its lines priced to the active cycle; pre-enable trial
  const pickPlan = (id: string) => {
    setPlanId(id);
    const plan = PLANS.find((p) => p.id === id); if (!plan) return;
    const mult = CYCLE_MULT[cycle] ?? 1;
    setLines(plan.lines.map((t) => ({ id: uid("ln"), name: t.name, item: t.item, qty: t.qty, unit: t.unit, price: round2(t.price * mult), tax: t.tax, fromPlan: true })));
    if (plan.trial) { setTrialOn(true); setTrialDays((d) => d ?? 14); }
  };
  // changing the cycle → re-price plan-snapshot lines (custom lines preserved)
  const changeCycle = (next: string) => {
    const prev = CYCLE_MULT[cycle] ?? 1; const mult = CYCLE_MULT[next] ?? 1;
    setCycle(next);
    setLines((xs) => xs.map((l) => (l.fromPlan ? { ...l, price: l.price == null ? l.price : round2((l.price / prev) * mult) } : l)));
  };
  const setLine = (id: string, patch: Partial<Line>) => setLines((xs) => xs.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const addLine = () => setLines((xs) => [...xs, { id: uid("ln"), name: "", item: null, qty: 1, unit: "unit", price: undefined, tax: taxExempt ? "EXM" : "VAT", fromPlan: false }]);
  const removeLine = (id: string) => setLines((xs) => xs.filter((l) => l.id !== id));

  // live totals
  const totals = React.useMemo(() => {
    const subtotal = round2(lines.reduce((s, l) => s + lineAmount(l), 0));
    const disc = Math.min(discount ?? 0, subtotal);
    let tax = 0;
    if (!taxExempt && subtotal > 0) for (const l of lines) { const amt = lineAmount(l); tax += (amt - disc * (amt / subtotal)) * (taxRateOf(l.tax) / 100); }
    tax = round2(tax);
    const grand = round2(subtotal - disc + tax);
    return { subtotal, disc, tax, grand };
  }, [lines, discount, taxExempt]);

  // form validity gates the commit
  const linesValid = lines.filter((l) => l.item).every((l) => (l.qty ?? -1) >= 0 && (l.price ?? -1) >= 0);
  const trialValid = !trialOn || (trialDays ?? 0) >= 1;
  const emailValid = !emailInvoice || recipientEmail.trim().length > 3;
  const formValid = !!party && !!planId && linesValid && trialValid && emailValid;

  const submit = () => {
    if (!formValid) { setTouched(true); notify("warning", "Resolve the highlighted fields before subscribing."); return; }
    setPosting(true);
    window.setTimeout(() => {
      setPosting(false);
      notify("success", `${party!.name} subscribed to ${PLANS.find((p) => p.id === planId)?.label}.`);
      // reset plan-related fields; keep the party + refresh its subscriptions
      setPlanId(null); setLines([]); setCustomPrice(undefined); setDiscount(undefined); setGraceOverride(undefined);
      setTrialOn(false); setInvoiceTiming(false);
      setTouched(false);
      refreshExisting();
    }, 800);
  };

  // existing-subscription mutations (single posting flag)
  const payExisting = (s: ExistingSub) => { setPosting(true); window.setTimeout(() => { setPosting(false); notify("info", `Opening a receipt for ${s.plan}…`); }, 500); };
  const cancelExisting = (s: ExistingSub) => { setPosting(true); window.setTimeout(() => { setPosting(false); notify("success", `${s.plan} cancelled.`); refreshExisting(); }, 700); };
  const submitChange = (label: string) => { setPosting(true); window.setTimeout(() => { setPosting(false); setChangeTarget(null); notify("success", `Plan changed to ${label}.`); refreshExisting(); }, 750); };

  const planObj = PLANS.find((p) => p.id === planId) ?? null;
  const typeLabel = SUBSCRIBER_TYPES.find((t) => t.id === subType)?.label ?? subType;

  return (
    <AppShell
      breadcrumb={<>
        <span className="text-bz-text-muted">Subscriptions</span>
        <ChevronRight size={11} className="text-bz-text-soft" />
        <span className="font-semibold text-bz-text">Subscribe a Party</span>
      </>}
      overlay={<>
        {changeTarget && <ChangePlanModal target={changeTarget} posting={posting} onClose={() => !posting && setChangeTarget(null)} onSubmit={submitChange} />}
        {/* docked footer — stays put while the form scrolls */}
        <div className="border-t border-bz-line bg-bz-paper px-4 py-3 md:px-8">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3">
            <button onClick={() => navigate("/design/customer-subscriptions")} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
              <ArrowLeft size={14} /> Back to list
            </button>
            <div className="flex items-center gap-3">
              {!formValid && <span className="hidden text-[11.5px] text-bz-text-soft sm:inline">{!party ? "Select a party" : !planId ? "Choose a plan" : "Complete required fields"}</span>}
              <button onClick={submit} disabled={!formValid || posting} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50">
                {posting ? <><Loader2 size={14} className="animate-spin" /> Subscribing…</> : <><Check size={14} /> Subscribe party</>}
              </button>
            </div>
          </div>
        </div>
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>}
    >
      <header className="px-4 pb-3 pt-5 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <h1 className="text-[23px] font-semibold tracking-tight text-bz-text">Subscribe a Party</h1>
          <p className="mt-1 text-[12.5px] text-bz-text-muted">Enrol a party onto a recurring plan, tune its billing and options, then commit — all without leaving the page.</p>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-4 pb-8 md:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          {/* ── form column ─────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-5">
            {/* subscriber */}
            <Card title="Subscriber" desc="Who is being subscribed — drawn from the matching master table." icon={UserPlus}>
              <div className="flex flex-col gap-4">
                <div>
                  <FieldLabel required>Subscriber type</FieldLabel>
                  <PillSelect options={SUBSCRIBER_TYPES.map((t) => ({ id: t.id, label: t.label }))} value={subType} onChange={setSubType} />
                </div>
                {multiOrg && (
                  <div>
                    <FieldLabel required hint="multi-organisation tenant">Billing organisation</FieldLabel>
                    <MiniSelect value={org} options={ORGS} onChange={setOrg} />
                  </div>
                )}
                <div>
                  <FieldLabel required>Party</FieldLabel>
                  <PartyPicker value={party} candidates={candidates} loading={candLoading} onPick={pickParty} onClear={() => { setParty(null); setExisting([]); }} />
                  {!candLoading && candidates.length === 0 && <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-bz-text-soft"><Info size={11} /> No {typeLabel.toLowerCase()} records — create one in masters first.</p>}
                </div>
              </div>
            </Card>

            {/* plan & billing */}
            <Card title="Plan & billing" desc="Pick a plan — its billed lines snapshot below, priced to the active cycle." icon={Layers}>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><FieldLabel required>Plan</FieldLabel><MiniSelect value={planId as string | null} options={PLANS.map((p) => ({ id: p.id, label: p.label }))} onChange={pickPlan} placeholder="Choose a plan…" /></div>
                  <div><FieldLabel required>Billing cycle</FieldLabel><MiniSelect value={cycle} options={[{ id: "monthly", label: "Monthly" }, { id: "quarterly", label: "Quarterly" }, { id: "yearly", label: "Yearly" }]} onChange={changeCycle} /></div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div><FieldLabel hint="optional">Custom flat price</FieldLabel><NumInput value={customPrice} onChange={setCustomPrice} prefix={CURRENCY} placeholder="Use lines" /></div>
                  <div><FieldLabel hint="≤ subtotal">Flat discount</FieldLabel><NumInput value={discount} onChange={setDiscount} prefix={CURRENCY} placeholder="0" /></div>
                  <div><FieldLabel hint="0–90">Grace days</FieldLabel><NumInput value={graceOverride} onChange={setGraceOverride} max={90} suffix="d" placeholder="Plan default" /></div>
                </div>
              </div>
            </Card>

            {/* line items (conditional) */}
            {planObj && (
              <Card title="Billing lines" desc="Copied from the plan and editable per customer." icon={Layers}
                rightSlot={<span className={cn("rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold text-bz-text-muted", NUM)}>{lines.length} {lines.length === 1 ? "line" : "lines"}</span>}>
                <div className="flex flex-col gap-3">
                  <div className="hidden grid-cols-[1.5fr_1.3fr_0.7fr_0.8fr_1fr_0.9fr_auto] gap-2 px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-bz-text-soft sm:grid">
                    <span>Name</span><span>Revenue item</span><span className="text-right">Qty</span><span>Unit</span><span className="text-right">Unit price</span><span>Tax</span><span />
                  </div>
                  {lines.length === 0 ? (
                    <p className="rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/30 px-3 py-4 text-center text-[11.5px] text-bz-text-muted">No lines yet — add one to bill the customer.</p>
                  ) : lines.map((l) => <LineRow key={l.id} l={l} currency={CURRENCY} onChange={(p) => setLine(l.id, p)} onRemove={() => removeLine(l.id)} />)}
                  <button onClick={addLine} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-surface text-[12.5px] font-semibold text-bz-text-muted transition-colors hover:border-bz-text hover:text-bz-text"><Plus size={14} /> Add line</button>
                  <p className="inline-flex items-center gap-1.5 text-[10.5px] text-bz-text-soft"><Info size={11} /> Lines without a revenue item are skipped at billing.</p>

                  <div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/40 p-4">
                    <Tot label="Subtotal" value={money(CURRENCY, totals.subtotal)} />
                    <Tot label="Discount" value={`− ${money(CURRENCY, totals.disc)}`} muted />
                    <Tot label={taxExempt ? "Tax (exempt)" : "Tax"} value={money(CURRENCY, totals.tax)} muted />
                    <div className="mt-2 flex items-center justify-between border-t border-bz-line pt-2.5"><span className="text-[12.5px] font-semibold text-bz-text">Grand total / {cycleShort(cycle)}</span><span className={cn("text-[17px] font-semibold text-bz-text", NUM)}>{money(CURRENCY, totals.grand)}</span></div>
                  </div>
                </div>
              </Card>
            )}

            {/* options */}
            <Card title="Options" desc="Each switch reveals only the inputs it needs." icon={Bell}>
              <div className="flex flex-col gap-3">
                <ToggleCard icon={Gift} title="Start with trial" desc="Begin in a free trial before the first charge." value={trialOn} onChange={setTrialOn}>
                  <div className="max-w-[220px]"><FieldLabel required>Trial length</FieldLabel><NumInput value={trialDays} onChange={setTrialDays} min={1} max={90} suffix="days" invalid={touched && trialOn && (trialDays ?? 0) < 1} /></div>
                </ToggleCard>
                <ToggleCard icon={RefreshCcw} title="Auto-renew" desc={autoRenew ? "Renews automatically each cycle." : "Manual renewal required each cycle."} value={autoRenew} onChange={setAutoRenew} />
                <ToggleCard icon={ShieldOff} title="Tax-exempt" desc="No tax applied regardless of per-line tax class." value={taxExempt} onChange={setTaxExempt} />
                <ToggleCard icon={Mail} title="Email the invoice" desc="Send each invoice to a recipient." value={emailInvoice} onChange={setEmailInvoice}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div><FieldLabel required>Recipient email</FieldLabel><TextInput value={recipientEmail} onChange={setRecipientEmail} placeholder="name@company.com" invalid={touched && emailInvoice && recipientEmail.trim().length <= 3} /></div>
                    <div><FieldLabel>Recipient name</FieldLabel><TextInput value={recipientName} onChange={setRecipientName} placeholder="Accounts payable" /></div>
                  </div>
                </ToggleCard>
                <ToggleCard icon={Bell} title="Customise notifications" desc="Override which lifecycle events notify the customer." value={notifyCustom} onChange={setNotifyCustom}>
                  <div className="flex flex-col gap-2">
                    {NOTIF_EVENTS.map((e) => (
                      <div key={e.id} className="flex items-center justify-between gap-3"><span className="text-[12px] text-bz-text">{e.label}</span><Switch value={!!notif[e.id]} onChange={(v) => setNotif((m) => ({ ...m, [e.id]: v }))} ariaLabel={e.label} /></div>
                    ))}
                  </div>
                </ToggleCard>
                <ToggleCard icon={CalendarClock} title="Invoice-timing override" desc={invoiceTiming ? "Custom offset from the billing date." : "Inherit the plan's default timing."} value={invoiceTiming} onChange={setInvoiceTiming}>
                  <div className="flex flex-col gap-3">
                    <div className="max-w-[260px]"><FieldLabel hint="− before / + after">Offset from billing date</FieldLabel><NumInput value={invoiceOffset} onChange={setInvoiceOffset} min={-30} max={30} suffix="days" align="left" /></div>
                    <div className="flex items-center justify-between gap-3"><span className="text-[12px] text-bz-text">Generate even past the due date</span><Switch value={pastDueGen} onChange={setPastDueGen} ariaLabel="Generate past due" /></div>
                  </div>
                </ToggleCard>
              </div>
            </Card>

            {/* footnote */}
            <div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/40 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Subscriber type → master table</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {SUBSCRIBER_TYPES.map((t) => <span key={t.id} className="text-[11px] text-bz-text-muted"><span className="font-medium text-bz-text">{t.label}</span> → {t.master}</span>)}
              </div>
            </div>
          </div>

          {/* ── context rail ────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
            {/* party context */}
            {party ? (
              <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
                <div className="border-b border-bz-line-soft bg-bz-paper px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13.5px] font-semibold text-bz-text" title={party.name}>{party.name}</p>
                    <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted">{typeLabel}</span>
                  </div>
                </div>
                <div className="px-4 py-2.5">
                  <ContextRow label="Email" value={party.email ?? "—"} />
                  <ContextRow label="Phone" value={party.phone ?? "—"} />
                  <ContextRow label="Address" value={party.address ?? "—"} />
                  <ContextRow label="Tax reg." value={party.taxReg ?? "—"} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-bz-lg border border-dashed border-bz-line bg-bz-surface px-4 py-9 text-center">
                <Building2 size={20} className="text-bz-text-soft" />
                <p className="text-[12.5px] font-medium text-bz-text-muted">No party selected</p>
                <p className="max-w-[240px] text-[11px] text-bz-text-soft">Pick a party to see its context and current subscriptions here.</p>
              </div>
            )}

            {/* existing subscriptions */}
            {party && (
              <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
                <div className="flex items-center justify-between border-b border-bz-line-soft bg-bz-paper px-4 py-3">
                  <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Current subscriptions</p>
                  {!existingLoading && existing.length > 0 && <span className={cn("rounded-bz-pill bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-semibold text-bz-text-muted", NUM)}>{existing.length}</span>}
                </div>
                <div className="p-3">
                  {existingLoading ? (
                    <div className="flex items-center justify-center gap-2 py-7 text-bz-text-muted"><Loader2 size={14} className="animate-spin text-bz-fire" /> <span className="text-[12px]">Loading…</span></div>
                  ) : existing.length === 0 ? (
                    <p className="rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/30 px-3 py-6 text-center text-[11.5px] text-bz-text-muted">This party has no subscriptions yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {existing.map((s) => <ExistingSubRow key={s.id} s={s} posting={posting} onPay={() => payExisting(s)} onChange={() => setChangeTarget(s)} onCancel={() => cancelExisting(s)} />)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* new-subscription summary */}
            {planObj && (
              <div className="overflow-hidden rounded-bz-2xl bg-bz-olive p-5 text-bz-text-on-dark">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-fire">New subscription</p>
                <p className="mt-1.5 truncate text-[18px] font-semibold tracking-tight">{planObj.label}</p>
                <div className="mt-3 flex items-end gap-1.5">
                  <span className="mb-0.5 text-[12px] font-semibold text-bz-text-on-dark-muted">{CURRENCY}</span>
                  <span className={cn("text-[28px] font-semibold leading-none text-bz-fire", NUM)}>{(customPrice ?? totals.grand).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="mb-1 text-[12px] text-bz-text-on-dark-muted">/{cycleShort(cycle)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {trialOn && (trialDays ?? 0) > 0 && <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-fire/20 px-2.5 py-1 text-[11px] font-semibold text-bz-fire"><Gift size={11} /> {trialDays} days free</span>}
                  {autoRenew && <span className="inline-flex items-center gap-1 rounded-bz-pill bg-white/10 px-2.5 py-1 text-[11px] font-medium"><RefreshCcw size={11} /> Auto-renew</span>}
                  {taxExempt && <span className="inline-flex items-center gap-1 rounded-bz-pill bg-white/10 px-2.5 py-1 text-[11px] font-medium"><ShieldOff size={11} /> Tax-exempt</span>}
                </div>
                <p className="mt-3 text-[11px] text-bz-text-on-dark-muted">{party ? `Billed to ${party.name}` : "Select a party to bill"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Tot({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return <div className="flex items-center justify-between gap-3 py-0.5 text-[12.5px]"><span className="text-bz-text-muted">{label}</span><span className={cn(muted ? "text-bz-text-muted" : "font-medium text-bz-text", NUM)}>{value}</span></div>;
}
