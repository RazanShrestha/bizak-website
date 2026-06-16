import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router";
import {
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Plus,
  Minus,
  Loader2,
  Info,
  AlertTriangle,
  RotateCcw,
  Pencil,
  Lock,
  Star,
  Gift,
  Repeat,
  Bell,
  Receipt,
  Hash,
  Layers,
  KeyRound,
  ShieldCheck,
  Users,
  Wallet,
  CalendarClock,
  Gauge,
  EyeOff,
  Search,
  Boxes,
  Sparkles,
  Building2,
  Puzzle,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION PLAN · GUIDED BUILDER  (create / edit a billable plan)
//
// Primary action = author a valid plan and persist it. Instead of a wall of
// fields, this is a GUIDED BUILDER: one focused decision-cluster at a time, on a
// calm centred canvas, with a connected step rail for orientation, big
// selectable cards / pills (not dropdowns) for the key choices, and a premium
// "pricing card" review as the payoff.
//
//   Details → Billing → Pricing → Access & rules → (edit: Seats) → Review
//
// • A connected vertical step rail (left) shows progress + completion live and
//   lets you jump to any step. A compact live summary sits at its foot.
// • Each step is spacious and minimal; the lime accent marks the single active
//   choice / primary action; olive is reserved for the review showcase.
// • A docked footer carries Back / Continue (and Create on the last step).
// • Author context (host vs tenant) reshapes the Access step and which fields
//   are required; validity is derived live and gates Create.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";

function g(n: number | undefined | null): string {
  if (n == null || !isFinite(n)) return "0";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
function roundDp(n: number, dp = 2): number {
  const f = Math.pow(10, dp);
  return Math.round((n + Number.EPSILON) * f) / f;
}
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

let _uid = 0;
const uid = (p: string) => `${p}-${(++_uid).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

// ════════════════════════════════════════════════════════════════════════════
// ENUMERATIONS + value→label / value→value TRANSFORMS
// ════════════════════════════════════════════════════════════════════════════

type Ctx = "host" | "tenant";

const PLAN_TYPES: { v: number; label: string; hint: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { v: 0, label: "Standard", hint: "A normal recurring paid plan", icon: Boxes },
  { v: 1, label: "Freemium", hint: "Free tier with paid add-ons", icon: Sparkles },
  { v: 2, label: "Enterprise", hint: "Custom-negotiated contract", icon: Building2 },
  { v: 3, label: "Add-on", hint: "Sold on top of a base plan", icon: Puzzle },
];

const BILLING_CYCLES: { v: number; label: string; unit: string; short: string }[] = [
  { v: 0, label: "Daily", unit: "day", short: "day" },
  { v: 1, label: "Weekly", unit: "week", short: "wk" },
  { v: 2, label: "Monthly", unit: "month", short: "mo" },
  { v: 3, label: "Quarterly", unit: "quarter", short: "qtr" },
  { v: 4, label: "Yearly", unit: "year", short: "yr" },
];

const PRICING_MODELS: { v: number; label: string; hint: string }[] = [
  { v: 0, label: "Flat fee", hint: "One price regardless of quantity" },
  { v: 1, label: "Per unit", hint: "Price × quantity" },
  { v: 2, label: "Tiered", hint: "Min/max band — quantity-bounded" },
  { v: 3, label: "Metered", hint: "Billed on measured usage" },
];
const TIERED = 2;

const planTypeLabel = (v: number) => PLAN_TYPES.find((t) => t.v === v)?.label ?? "—";
const cycleOf = (v: number) => BILLING_CYCLES.find((c) => c.v === v) ?? BILLING_CYCLES[2];

function toCode(name: string): string {
  const t = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
  if (!t) return "";
  return /^[A-Z]/.test(t) ? t : `PLAN_${t}`.slice(0, 40);
}

function billingPhrase(cycleVal: number, interval: number | undefined, free: boolean): string {
  if (free) return "Free — no recurring charge";
  const c = cycleOf(cycleVal);
  const n = interval ?? 1;
  return n <= 1 ? `Billed every ${c.unit}` : `Billed every ${n} ${c.unit}s`;
}

const CURRENCIES: { id: string; name: string; symbol: string }[] = [
  { id: "NPR", name: "Nepalese Rupee", symbol: "₨" },
  { id: "USD", name: "US Dollar", symbol: "$" },
  { id: "INR", name: "Indian Rupee", symbol: "₹" },
  { id: "EUR", name: "Euro", symbol: "€" },
  { id: "GBP", name: "Pound Sterling", symbol: "£" },
];
const symbolOf = (id: string) => CURRENCIES.find((c) => c.id === id)?.symbol ?? id;
const BASE_CURRENCY = "NPR";

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA  (seeded; some loaded "async" to exercise loading states)
// ════════════════════════════════════════════════════════════════════════════

type Opt = { id: string; label: string; sub?: string; meta?: string; disabled?: boolean };

const ROLE_POOL: Opt[] = [
  { id: "R-OWNER", label: "Account Owner", sub: "Full platform access" },
  { id: "R-ADMIN", label: "Workspace Admin", sub: "Manage workspace + billing" },
  { id: "R-MANAGER", label: "Operations Manager", sub: "Operational modules" },
  { id: "R-STAFF", label: "Operations Staff", sub: "Day-to-day data entry" },
  { id: "R-FINANCE", label: "Finance Officer", sub: "Finance + reports" },
  { id: "R-READONLY", label: "Auditor (read-only)", sub: "View everything, change nothing" },
  { id: "R-SUPPORT", label: "Support Agent", sub: "Customer records only" },
  { id: "R-SELF", label: "Self-service", sub: "Portal access only" },
];

const REVENUE_TARGETS: Opt[] = [
  { id: "REV-SAAS", label: "SaaS Subscription Revenue", sub: "4010 · Income", meta: "4010" },
  { id: "REV-SUPPORT", label: "Support & Success Revenue", sub: "4020 · Income", meta: "4020" },
  { id: "REV-USAGE", label: "Metered Usage Revenue", sub: "4030 · Income", meta: "4030" },
  { id: "REV-PRO", label: "Professional Services", sub: "4040 · Income", meta: "4040" },
  { id: "REV-ADDON", label: "Add-on Revenue", sub: "4050 · Income", meta: "4050" },
  { id: "REV-SETUP", label: "Onboarding & Setup Fees", sub: "4060 · Income", meta: "4060" },
];

const TAX_CODES: Opt[] = [
  { id: "VAT", label: "VAT 13%", meta: "13%" },
  { id: "EXM", label: "Exempt", meta: "0%" },
  { id: "DST", label: "Digital Service Tax", meta: "2%" },
  { id: "ZERO", label: "Zero-rated", meta: "0%" },
];

const UNIT_OPTS: Opt[] = ["seat", "user", "GB", "API call", "device", "site", "month", "unit"].map((u) => ({ id: u, label: u }));

const VISIBILITY: { id: string; label: string; hint: string }[] = [
  { id: "public", label: "Public", hint: "Listed on the pricing page" },
  { id: "private", label: "Private", hint: "Shareable by direct link only" },
  { id: "hidden", label: "Hidden", hint: "Hidden from subscription entirely" },
];

const LICENCE_CLASSES: Opt[] = [
  { id: "full", label: "Full", sub: "Every module, no limits" },
  { id: "standard", label: "Standard", sub: "Core modules" },
  { id: "restricted", label: "Restricted", sub: "Whitelisted permissions only" },
  { id: "readonly", label: "Read-only", sub: "View access across the board" },
  { id: "selfservice", label: "Self-service", sub: "Portal-only access" },
];
const DATA_SCOPES: Opt[] = [
  { id: "all", label: "All records" },
  { id: "subsidiary", label: "Subsidiary" },
  { id: "team", label: "Own team" },
  { id: "own", label: "Own records only" },
];
const ACCESS_MODES: Opt[] = [
  { id: "view", label: "View" },
  { id: "edit", label: "Edit" },
  { id: "approve", label: "Approve" },
  { id: "full", label: "Full" },
];
const RAW_PERMISSIONS = [
  "sales_order.view", "sales_order.create", "sales_order.approve", "sales_invoice.view",
  "customer.view", "customer.edit", "item.view", "item.edit", "payment.view",
  "payment.create", "journal.view", "report.trial_balance", "report.balance_sheet",
  "purchase_order.view", "purchase_order.create", "sales_order.view",
];
function formatPerm(raw: string): string {
  return raw.split(".").map((seg) => seg.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")).join(" · ");
}

const NOTIF_EVENTS: { key: string; label: string; def: number }[] = [
  { key: "renewal", label: "Upcoming renewal reminder", def: -7 },
  { key: "trial_end", label: "Trial ending", def: -3 },
  { key: "payment_failed", label: "Payment failed", def: 0 },
  { key: "expired", label: "Plan expired", def: 1 },
];

// ════════════════════════════════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════════════════════════════════

function useEscClose(open: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}
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
// FORM ATOMS
// ════════════════════════════════════════════════════════════════════════════

const INPUT_BASE =
  "h-10 w-full rounded-bz-md border bg-bz-surface px-3 text-[13.5px] text-bz-text outline-none placeholder:text-bz-text-soft transition-colors";
const INPUT_OK = "border-bz-line-soft focus:border-bz-text";
const INPUT_ERR = "border-[#C0413A] focus:border-[#9A2E29]";

function Field({
  label, required, hint, error, htmlFor, className, children,
}: {
  label?: string; required?: boolean; hint?: string; error?: string; htmlFor?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label htmlFor={htmlFor} className="text-[11.5px] font-medium text-bz-text-muted">
            {label}
            {required && <span className="ml-0.5 text-bz-fire" title="Required">*</span>}
          </label>
          {error ? (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#9A2E29]"><AlertTriangle size={10} /> {error}</span>
          ) : hint ? (
            <span className="text-[10px] text-bz-text-soft">{hint}</span>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, onBlur, placeholder, error, disabled, id }: {
  value: string; onChange: (v: string) => void; onBlur?: () => void; placeholder?: string; error?: boolean; disabled?: boolean; id?: string;
}) {
  return (
    <input id={id} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder} disabled={disabled}
      className={cn(INPUT_BASE, error ? INPUT_ERR : INPUT_OK, disabled && "bg-bz-paper-warm text-bz-text-muted")} />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2.5 text-[13.5px] leading-relaxed text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text" />
  );
}

function NumberInput({ value, onChange, onBlur, placeholder, error, disabled, min = 0, max, align = "left", suffix, prefix }: {
  value: number | undefined; onChange: (v: number | undefined) => void; onBlur?: () => void; placeholder?: string; error?: boolean; disabled?: boolean; min?: number; max?: number; align?: "left" | "right"; suffix?: string; prefix?: string;
}) {
  const [raw, setRaw] = React.useState(value == null ? "" : String(value));
  React.useEffect(() => {
    setRaw((prev) => {
      const prevNum = prev === "" || prev === "-" || prev === "." ? undefined : Number(prev);
      if (prevNum === value || (prevNum == null && value == null)) return prev;
      return value == null ? "" : String(value);
    });
  }, [value]);
  return (
    <div className={cn("flex h-10 items-center rounded-bz-md border bg-bz-surface px-2.5 transition-colors focus-within:border-bz-text", error ? INPUT_ERR : "border-bz-line-soft", disabled && "bg-bz-paper-warm")}>
      {prefix && <span className="mr-1 text-[11px] text-bz-text-soft">{prefix}</span>}
      <input inputMode="decimal" value={raw} disabled={disabled} placeholder={placeholder}
        onChange={(e) => { const v = e.target.value; if (v === "" || /^-?\d*\.?\d*$/.test(v)) { setRaw(v); onChange(v === "" || v === "-" || v === "." ? undefined : Number(v)); } }}
        onBlur={() => { if (raw === "" || raw === "-" || raw === ".") { onChange(undefined); setRaw(""); onBlur?.(); return; } let n = roundDp(Number(raw)); if (min != null && n < min) n = min; if (max != null && n > max) n = max; onChange(n); setRaw(String(n)); onBlur?.(); }}
        className={cn("h-full w-full bg-transparent text-[13.5px] text-bz-text outline-none placeholder:text-bz-text-soft", NUM, align === "right" && "text-right", disabled && "text-bz-text-muted")} />
      {suffix && <span className="ml-1 text-[11px] text-bz-text-soft">{suffix}</span>}
    </div>
  );
}

function Switch({ value, onChange, disabled, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={ariaLabel} disabled={disabled} onClick={() => onChange(!value)}
      className={cn("relative inline-flex h-[20px] w-9 shrink-0 items-center rounded-bz-pill border transition-colors", value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line", disabled && "opacity-50")}>
      <span className={cn("pointer-events-none absolute h-3.5 w-3.5 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform", value ? "translate-x-[18px]" : "translate-x-[2px]")} />
    </button>
  );
}

function Segmented<T extends string | number>({ options, value, onChange, disabled }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className={cn("inline-grid grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5", disabled && "opacity-50")}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button key={String(opt.id)} type="button" disabled={disabled} onClick={() => onChange(opt.id)}
            className={cn("h-8 rounded-bz-sm px-3.5 text-[12px] font-medium transition-colors", active ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text")}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── premium selection atoms ────────────────────────────────────────────────

// big selectable card (plan type) — monochrome selection with a single lime tick
function OptionCard({ selected, icon: Icon, label, hint, onClick }: {
  selected: boolean; icon: React.ComponentType<{ size?: number; className?: string }>; label: string; hint: string; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn("group relative flex items-start gap-3 rounded-bz-lg border p-3.5 text-left transition-all", selected ? "border-bz-text bg-bz-paper-warm/40 shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "border-bz-line-soft bg-bz-surface hover:border-bz-line")}>
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md transition-colors", selected ? "bg-bz-deep text-bz-paper" : "bg-bz-paper-warm text-bz-text-muted group-hover:text-bz-text")}><Icon size={16} /></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5"><span className="text-[13.5px] font-semibold text-bz-text">{label}</span>{selected && <Check size={13} className="text-bz-leaf-deep" strokeWidth={3} />}</span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-bz-text-muted">{hint}</span>
      </span>
    </button>
  );
}

// row of pills (billing cycle, visibility) — dark fill on the active pill
function PillSelect<T extends string | number>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={String(o.id)} type="button" onClick={() => onChange(o.id)}
            className={cn("h-9 rounded-bz-pill border px-4 text-[12.5px] font-medium transition-colors", on ? "border-bz-deep bg-bz-deep text-bz-text-on-dark" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-bz-line hover:text-bz-text")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// number stepper (interval, day counts)
function Stepper({ value, onChange, min, max, suffix, ariaLabel }: { value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string; ariaLabel?: string }) {
  const lo = min ?? -Infinity, hi = max ?? Infinity;
  return (
    <div className="inline-flex h-10 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface" role="group" aria-label={ariaLabel}>
      <button type="button" aria-label="Decrease" onClick={() => onChange(clamp(value - 1, lo, hi))} disabled={value <= lo} className="flex size-10 items-center justify-center text-bz-text-muted transition-colors hover:text-bz-text disabled:opacity-30"><Minus size={14} /></button>
      <span className={cn("flex min-w-[3.75rem] items-baseline justify-center gap-1 px-1 text-center text-[14.5px] font-semibold text-bz-text", NUM)}>
        {value}{suffix && <span className="text-[10.5px] font-normal text-bz-text-soft">{suffix}</span>}
      </span>
      <button type="button" aria-label="Increase" onClick={() => onChange(clamp(value + 1, lo, hi))} disabled={value >= hi} className="flex size-10 items-center justify-center text-bz-text-muted transition-colors hover:text-bz-text disabled:opacity-30"><Plus size={14} /></button>
    </div>
  );
}

// premium toggle card with optional revealed body
function ToggleCard({ icon: Icon, title, desc, value, onChange, children }: {
  icon: React.ComponentType<{ size?: number; className?: string }>; title: string; desc: string; value: boolean; onChange: (v: boolean) => void; children?: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-bz-lg border transition-colors", value ? "border-bz-fire/40 bg-bz-fire/[0.04]" : "border-bz-line-soft bg-bz-surface")}>
      <div className="flex items-center gap-3.5 p-4">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md", value ? "bg-bz-fire text-bz-olive" : "bg-bz-paper-warm text-bz-text-muted")}><Icon size={16} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-bz-text">{title}</p>
          <p className="text-[11px] text-bz-text-muted">{desc}</p>
        </div>
        <Switch value={value} onChange={onChange} ariaLabel={title} />
      </div>
      {value && children && <div className="border-t border-bz-line-soft bg-bz-surface/60 p-4">{children}</div>}
    </div>
  );
}

function StepHeading({ eyebrow, title, desc, aside }: { eyebrow: string; title: string; desc: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">{eyebrow}</p>
        <h2 className="text-[20px] font-semibold tracking-tight text-bz-text md:text-[23px]">{title}</h2>
        <p className="mt-1.5 max-w-[52ch] text-[13px] leading-relaxed text-bz-text-muted">{desc}</p>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">{children}</p>;
}

function InlineNote({ tone = "info", children }: { tone?: "info" | "warn"; children: React.ReactNode }) {
  if (tone === "warn") {
    return (
      <div className="flex gap-2.5 rounded-bz-md border border-[#C0413A]/30 bg-[#FBE7E5] p-3">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#9A2E29]" />
        <p className="text-[11.5px] leading-relaxed text-[#9A2E29]">{children}</p>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3">
      <Info size={14} className="mt-0.5 shrink-0 text-bz-text-muted" />
      <p className="text-[11.5px] leading-relaxed text-bz-text-muted">{children}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ENTITY PICKER  searchable · paginated · lazy-scroll · keyboard
// ════════════════════════════════════════════════════════════════════════════

const PICKER_PAGE = 6;

function EntityField({ value, onChange, options, placeholder = "Select…", required, disabled, error, size = "md", icon: Icon, loading, title }: {
  value: Opt | null; onChange: (o: Opt | null) => void; options: Opt[]; placeholder?: string; required?: boolean; disabled?: boolean; error?: boolean; size?: "sm" | "md"; icon?: React.ComponentType<{ size?: number; className?: string }>; loading?: boolean; title?: string;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const locked = disabled || loading;
  const h = size === "sm" ? "h-8" : "h-10";
  const text = size === "sm" ? "text-[12px]" : "text-[13.5px]";
  return (
    <div className="min-w-0">
      <button ref={btnRef} type="button" disabled={locked} onClick={() => setOpen((v) => !v)} title={title}
        className={cn("flex w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors", h,
          locked ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "bg-bz-surface hover:border-bz-line",
          error ? "border-[#C0413A]" : open || locked ? "" : "border-bz-line-soft")}>
        {loading ? <Loader2 size={size === "sm" ? 12 : 14} className="shrink-0 animate-spin text-bz-fire" /> : Icon && <Icon size={size === "sm" ? 12 : 14} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("min-w-0 flex-1 truncate", text, value ? "text-bz-text" : "text-bz-text-soft")}>{loading ? "Loading…" : value ? value.label : placeholder}</span>
        {value && value.meta && !locked && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{value.meta}</span>}
        {value && !required && !locked ? (
          <span role="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={11} /></span>
        ) : (!locked && <ChevronDown size={size === "sm" ? 12 : 14} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />)}
      </button>
      <EntityDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)} options={options} value={value} onChange={onChange} placeholder={title} />
    </div>
  );
}

function EntityDropdown({ anchorRef, open, onClose, options, value, onChange, placeholder }: {
  anchorRef: React.RefObject<HTMLButtonElement | null>; open: boolean; onClose: () => void; options: Opt[]; value: Opt | null; onChange: (o: Opt | null) => void; placeholder?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pos = useAnchoredPos(open, anchorRef);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [more, setMore] = React.useState(false);
  const [hi, setHi] = React.useState(0);

  React.useEffect(() => { if (open) { setRaw(""); setQuery(""); setPages(1); setHi(0); const t = window.setTimeout(() => inputRef.current?.focus(), 10); return () => window.clearTimeout(t); } }, [open]);
  React.useEffect(() => { if (!open) return; setLoading(true); const t = window.setTimeout(() => { setQuery(raw.trim().toLowerCase()); setPages(1); setHi(0); setLoading(false); }, 200); return () => window.clearTimeout(t); }, [raw, open]);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { const t = e.target as Node; if (ref.current && !ref.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    const onScroll = (e: Event) => { if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return; onClose(); };
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey); window.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll, true); };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;
  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query) || (o.sub ?? "").toLowerCase().includes(query)) : options;
  const visible = filtered.slice(0, pages * PICKER_PAGE);
  const hasMore = visible.length < filtered.length;
  const onScrollList = () => { const el = listRef.current; if (!el || more || !hasMore) return; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) { setMore(true); window.setTimeout(() => { setPages((p) => p + 1); setMore(false); }, 360); } };
  const pick = (o: Opt) => { if (o.disabled) return; onChange(o); onClose(); };
  const onListKey = (e: React.KeyboardEvent) => { if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, visible.length - 1)); } else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); } else if (e.key === "Enter") { e.preventDefault(); const o = visible[hi]; if (o) pick(o); } };

  return createPortal(
    <div ref={ref} style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 248) }} className="z-[90] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]" onKeyDown={onListKey}>
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input ref={inputRef} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={placeholder ? `Search ${placeholder.toLowerCase()}…` : "Search…"} className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
          {raw && <button onClick={() => setRaw("")} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface" aria-label="Clear search"><X size={10} /></button>}
        </div>
      </div>
      <div ref={listRef} onScroll={onScrollList} className="max-h-[252px] overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-bz-text-muted"><Loader2 size={13} className="animate-spin text-bz-fire" /> <span className="text-[11.5px]">Searching…</span></div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-7 text-center"><Search size={15} className="text-bz-text-soft" /><p className="text-[11.5px] font-medium text-bz-text-muted">{raw ? `No matches for “${raw}”` : "No options available"}</p></div>
        ) : (
          visible.map((o, i) => {
            const selected = value?.id === o.id; const active = i === hi;
            return (
              <button key={o.id} onMouseEnter={() => setHi(i)} onClick={() => pick(o)} disabled={o.disabled}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors", o.disabled ? "cursor-not-allowed opacity-45" : active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}>
                <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>{o.sub && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{o.sub}</span>}</span>
                {o.meta && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{o.meta}</span>}
                {selected && <Check size={13} className="shrink-0 text-bz-text" />}
              </button>
            );
          })
        )}
        {more && <div className="flex items-center justify-center gap-2 py-2.5 text-bz-text-muted"><Loader2 size={12} className="animate-spin text-bz-fire" /> <span className="text-[11px]">Loading more…</span></div>}
        {!more && !hasMore && visible.length > 0 && filtered.length > PICKER_PAGE && <p className={cn("px-3 py-2 text-center text-[10px] text-bz-text-soft", NUM)}>{filtered.length} results · end of list</p>}
      </div>
    </div>,
    document.body,
  );
}

function EnumSelect({ value, options, onChange, error, disabled, icon, title }: {
  value: number; options: { v: number; label: string }[]; onChange: (v: number) => void; error?: boolean; disabled?: boolean; icon?: React.ComponentType<{ size?: number; className?: string }>; title?: string;
}) {
  const cur = options.find((o) => o.v === value) ?? null;
  return (
    <EntityField value={cur ? { id: String(cur.v), label: cur.label } : null} onChange={(o) => o && onChange(Number(o.id))} options={options.map((o) => ({ id: String(o.v), label: o.label }))} required error={error} disabled={disabled} icon={icon} title={title} />
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG + TOAST
// ════════════════════════════════════════════════════════════════════════════

type ConfirmState = { title: string; body: string; confirmLabel: string; danger?: boolean; onConfirm: () => void } | null;
function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  useEscClose(!!state, onClose);
  if (!state) return null;
  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bz-olive/40 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_24px_60px_-20px_rgba(15,20,17,0.30)]">
        <div className="flex items-start gap-3 p-5">
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md", state.danger ? "bg-[#FBE7E5] text-[#9A2E29]" : "bg-bz-fire/[0.18] text-bz-text")}>{state.danger ? <X size={16} /> : <AlertTriangle size={16} />}</span>
          <div className="min-w-0"><p className="text-[14px] font-semibold text-bz-text">{state.title}</p><p className="mt-1 text-[12px] leading-relaxed text-bz-text-muted">{state.body}</p></div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-5 py-3">
          <button onClick={onClose} className="inline-flex h-8 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">Cancel</button>
          <button onClick={() => { state.onConfirm(); onClose(); }} className={cn("inline-flex h-8 items-center gap-1.5 rounded-bz-md px-3.5 text-[12px] font-semibold", state.danger ? "bg-[#C0413A] text-white hover:opacity-95" : "bg-bz-deep text-bz-text-on-dark hover:opacity-95")}>{state.confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type ToastState = { kind: "success" | "warning" | "error" | "info"; message: string; id: number } | null;
function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => { if (!toast) return; const t = window.setTimeout(onDismiss, 4200); return () => window.clearTimeout(t); }, [toast, onDismiss]);
  if (!toast) return null;
  const k = toast.kind;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[96] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", k === "success" ? "bg-bz-fire/[0.22]" : k === "warning" ? "bg-bz-leaf/50" : k === "error" ? "bg-[#FBE7E5]" : "bg-bz-paper-warm")}>{k === "success" ? <Check size={13} className="text-bz-leaf-deep" /> : k === "warning" ? <AlertTriangle size={12} className="text-bz-text" /> : k === "error" ? <X size={13} className="text-[#9A2E29]" /> : <Info size={13} className="text-bz-text-muted" />}</span>
        <p className="max-w-[440px] text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PLAN-LINE MODEL + LINE EDITOR  (priced features / tiers)
// ════════════════════════════════════════════════════════════════════════════

type PlanLine = {
  id: string; name: string; nameTouched: boolean; code: string; codeTouched: boolean; description: string;
  order: number; model: number; price: number | undefined; currency: string; qty: number | undefined;
  minQty: number | undefined; maxQty: number | undefined; tax: Opt | null; unit: Opt | null; revenue: Opt | null;
};
function blankLine(order: number): PlanLine {
  return { id: uid("ln"), name: "", nameTouched: false, code: "", codeTouched: false, description: "", order, model: 1, price: undefined, currency: BASE_CURRENCY, qty: 1, minQty: undefined, maxQty: undefined, tax: null, unit: { id: "seat", label: "seat" }, revenue: null };
}
const lineTotal = (l: PlanLine) => roundDp((l.price ?? 0) * (l.qty ?? 0));
const isLineComplete = (l: PlanLine) => !!l.name.trim() && l.price != null && l.price >= 0 && (l.qty ?? 0) > 0 && (l.model !== TIERED || ((l.minQty ?? 0) <= (l.maxQty ?? Infinity)));

function LineEditor({ lines, perLineRevenue, expanded, onToggleExpand, onUpdate, onRemove, onAdd, onNotice }: {
  lines: PlanLine[]; perLineRevenue: boolean; expanded: Set<string>; onToggleExpand: (id: string) => void; onUpdate: (id: string, patch: Partial<PlanLine>) => void; onRemove: (id: string) => void; onAdd: () => void; onNotice: (kind: "info" | "warning", msg: string) => void;
}) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-bz-lg border border-dashed border-bz-line bg-bz-paper-warm/30 py-12 text-center">
        <Layers size={20} className="text-bz-text-soft" />
        <p className="text-[13px] font-medium text-bz-text-muted">No priced lines yet</p>
        <p className="max-w-[300px] text-[11.5px] text-bz-text-muted">Add at least one feature or tier the plan charges for.</p>
        <button onClick={onAdd} className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95"><Plus size={14} /> Add line</button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {lines.map((l, i) => (
        <LineCard key={l.id} line={l} index={i} perLineRevenue={perLineRevenue} expanded={expanded.has(l.id)} onToggleExpand={() => onToggleExpand(l.id)} onUpdate={onUpdate} onRemove={() => onRemove(l.id)} onNotice={onNotice} />
      ))}
      <button onClick={onAdd} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-surface text-[12.5px] font-semibold text-bz-text-muted transition-colors hover:border-bz-text hover:text-bz-text"><Plus size={14} /> Add another line</button>
    </div>
  );
}

function LineCard({ line: l, index, perLineRevenue, expanded, onToggleExpand, onUpdate, onRemove, onNotice }: {
  line: PlanLine; index: number; perLineRevenue: boolean; expanded: boolean; onToggleExpand: () => void; onUpdate: (id: string, patch: Partial<PlanLine>) => void; onRemove: () => void; onNotice: (kind: "info" | "warning", msg: string) => void;
}) {
  const complete = isLineComplete(l);
  const invalid = !complete && (l.name.trim() !== "" || l.price != null);
  const model = PRICING_MODELS.find((m) => m.v === l.model)!;
  const sym = symbolOf(l.currency);
  const onNameBlur = () => { if (!l.codeTouched && !l.code) onUpdate(l.id, { code: toCode(l.name) }); };
  const setModel = (v: number) => { if (v === TIERED) onUpdate(l.id, { model: v, minQty: l.minQty ?? 1, maxQty: l.maxQty ?? Math.max(l.qty ?? 1, 1) }); else onUpdate(l.id, { model: v }); };
  const setMin = (v: number | undefined) => { if (v != null && l.maxQty != null && v > l.maxQty) { onUpdate(l.id, { minQty: v, maxQty: v }); onNotice("info", `Line ${index + 1}: max raised to match min (${v}).`); } else onUpdate(l.id, { minQty: v }); };
  const setMax = (v: number | undefined) => { if (v != null && l.minQty != null && v < l.minQty) { onUpdate(l.id, { maxQty: v, minQty: v }); onNotice("info", `Line ${index + 1}: min lowered to match max (${v}).`); } else onUpdate(l.id, { maxQty: v }); };
  const selectRevenue = (o: Opt | null) => { if (o && !l.nameTouched && !l.name.trim()) onUpdate(l.id, { revenue: o, name: o.label, code: toCode(o.label) }); else onUpdate(l.id, { revenue: o }); };

  return (
    <div className={cn("overflow-hidden rounded-bz-lg border transition-colors", invalid ? "border-[#C0413A]/45 bg-[#FBE7E5]/20" : expanded ? "border-bz-line bg-bz-surface" : "border-bz-line-soft bg-bz-surface")}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button onClick={onToggleExpand} aria-expanded={expanded} className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><ChevronDown size={14} className={cn("transition-transform", expanded ? "" : "-rotate-90")} /></button>
        <span className={cn("w-5 shrink-0 text-center text-[11px] font-semibold text-bz-text-soft", NUM)}>{index + 1}</span>
        <div className="min-w-0 flex-1">
          <input value={l.name} onChange={(e) => onUpdate(l.id, { name: e.target.value, nameTouched: true })} onBlur={onNameBlur} placeholder="Feature or tier name…"
            className={cn("w-full truncate rounded-bz-sm border border-transparent bg-transparent px-1.5 py-1 text-[13.5px] font-medium text-bz-text outline-none hover:border-bz-line-soft focus:border-bz-text focus:bg-bz-surface", invalid && !l.name.trim() && "border-[#C0413A]/50")} />
        </div>
        <span className="hidden shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted sm:inline">{model.label}</span>
        <div className="hidden w-[120px] shrink-0 text-right sm:block"><span className="text-[9px] font-semibold uppercase text-bz-text-soft">{sym}</span> <span className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{g(lineTotal(l))}</span></div>
        <button onClick={onRemove} title="Remove line" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]"><X size={14} /></button>
      </div>
      {expanded && (
        <div className="border-t border-bz-line-soft bg-bz-paper-warm/20 p-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Pricing model" className="sm:col-span-2 lg:col-span-1"><EnumSelect value={l.model} options={PRICING_MODELS} onChange={setModel} title="pricing model" /></Field>
            <Field label="Identifier code" hint={l.codeTouched ? undefined : "auto from name"}><TextInput value={l.code} onChange={(v) => onUpdate(l.id, { code: v.toUpperCase(), codeTouched: true })} placeholder="UPPER_SNAKE" /></Field>
            <Field label="Display order" hint="lower shows first"><NumberInput value={l.order} onChange={(v) => onUpdate(l.id, { order: v ?? 0 })} align="right" min={0} max={999} /></Field>
            <Field label="Unit price" required><NumberInput value={l.price} onChange={(v) => onUpdate(l.id, { price: v })} prefix={sym} align="right" error={invalid && l.price == null} placeholder="0" /></Field>
            <Field label="Currency"><EntityField value={{ id: l.currency, label: l.currency, meta: sym }} onChange={(o) => o && onUpdate(l.id, { currency: o.id })} options={CURRENCIES.map((c) => ({ id: c.id, label: `${c.symbol} ${c.id}`, sub: c.name }))} required title="currency" /></Field>
            <Field label="Default quantity" required><NumberInput value={l.qty} onChange={(v) => onUpdate(l.id, { qty: v })} align="right" min={0} error={invalid && (l.qty ?? 0) <= 0} placeholder="0" /></Field>
            <Field label="Min quantity" hint={l.model === TIERED ? undefined : "tiered only"}><NumberInput value={l.minQty} onChange={setMin} align="right" disabled={l.model !== TIERED} placeholder={l.model === TIERED ? "0" : "—"} /></Field>
            <Field label="Max quantity" hint={l.model === TIERED ? "0 = unlimited" : "tiered only"}><NumberInput value={l.maxQty} onChange={setMax} align="right" disabled={l.model !== TIERED} placeholder={l.model === TIERED ? "0" : "—"} /></Field>
            <Field label="Tax code"><EntityField value={l.tax} onChange={(o) => onUpdate(l.id, { tax: o })} options={TAX_CODES} placeholder="No tax" title="tax code" /></Field>
            <Field label="Unit of measure"><EntityField value={l.unit} onChange={(o) => onUpdate(l.id, { unit: o })} options={UNIT_OPTS} placeholder="unit" title="unit" /></Field>
            <Field label="Description" className="sm:col-span-2"><TextInput value={l.description} onChange={(v) => onUpdate(l.id, { description: v })} placeholder="Optional — shown to subscribers" /></Field>
            {perLineRevenue && <Field label="Revenue target" hint="per-line mapping" className="sm:col-span-2 lg:col-span-3"><EntityField value={l.revenue} onChange={selectRevenue} options={REVENUE_TARGETS} placeholder="Map this line to revenue…" icon={Wallet} title="revenue target" /></Field>}
          </div>
          <div className="mt-3.5 flex items-center justify-between border-t border-bz-line-soft pt-3"><span className="text-[10.5px] text-bz-text-muted">{model.hint}</span><span className="text-right"><span className="text-[10px] uppercase text-bz-text-soft">Line total</span> <span className={cn("text-[14px] font-semibold text-bz-text", NUM)}>{sym}{g(lineTotal(l))}</span></span></div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SEAT / LICENCE-TIER EDITOR  (edit-only, SELF-PERSISTING master-detail)
// ════════════════════════════════════════════════════════════════════════════

type PermRow = { id: string; perm: Opt | null; mode: string };
type SeatBundle = { id: string; klass: string; isDefault?: boolean; saved: boolean; label: string; seats: number; overage: number; scope: string; perms: PermRow[] };
function seatSeed(): SeatBundle[] {
  return [
    { id: "sb-default", klass: "standard", isDefault: true, saved: true, label: "Standard seat", seats: 5, overage: 1200, scope: "subsidiary", perms: [] },
    { id: "sb-restricted", klass: "restricted", saved: true, label: "Field agent", seats: 10, overage: 600, scope: "own", perms: [
      { id: uid("pr"), perm: { id: "sales_order.view", label: formatPerm("sales_order.view") }, mode: "view" },
      { id: uid("pr"), perm: { id: "customer.view", label: formatPerm("customer.view") }, mode: "view" },
    ] },
  ];
}

function SeatTierEditor({ planId, onToast }: { planId: string | null; onToast: (kind: "success" | "error" | "info", msg: string) => void }) {
  const [loading, setLoading] = React.useState(true);
  const [tiers, setTiers] = React.useState<SeatBundle[]>([]);
  const [editing, setEditing] = React.useState<string | "new" | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const permOptions = React.useMemo<Opt[]>(() => { const seen = new Map<string, Opt>(); for (const raw of RAW_PERMISSIONS) if (!seen.has(raw)) seen.set(raw, { id: raw, label: formatPerm(raw) }); return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label)); }, []);

  React.useEffect(() => { if (!planId) return; setLoading(true); const t = window.setTimeout(() => { setTiers(seatSeed()); setLoading(false); }, 600); return () => window.clearTimeout(t); }, [planId]);

  if (!planId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-bz-lg border border-dashed border-bz-line bg-bz-paper-warm/30 py-12 text-center">
        <Lock size={20} className="text-bz-text-soft" />
        <p className="text-[13px] font-semibold text-bz-text-muted">Available after the plan is created</p>
        <p className="max-w-[340px] text-[11.5px] leading-relaxed text-bz-text-muted">Seat & licence tiers are sold against a saved plan. Create the plan first, then return to define the tiers subscribers can buy.</p>
      </div>
    );
  }
  if (loading) return <div className="flex items-center justify-center gap-2 py-12 text-bz-text-muted"><Loader2 size={15} className="animate-spin text-bz-fire" /> <span className="text-[12px]">Loading seat tiers…</span></div>;

  const listLocked = editing !== null || saving;
  const remove = (b: SeatBundle) => {
    if (b.isDefault) { onToast("error", "The default seat tier can't be deleted."); return; }
    setConfirm({ title: "Delete this seat tier?", body: `“${b.label}” will stop being offered to new subscribers. Existing seats are unaffected.`, confirmLabel: "Delete tier", danger: true, onConfirm: () => { setSaving(true); window.setTimeout(() => { setTiers((xs) => xs.filter((x) => x.id !== b.id)); setSaving(false); onToast("success", `“${b.label}” deleted.`); }, 600); } });
  };
  const saveBundle = (draft: SeatBundle) => {
    setSaving(true);
    const cleaned: SeatBundle = { ...draft, saved: true, perms: draft.klass === "restricted" ? draft.perms.filter((p) => p.perm) : [] };
    window.setTimeout(() => { setTiers((xs) => (draft.id === "new" ? [...xs, { ...cleaned, id: uid("sb") }] : xs.map((x) => (x.id === draft.id ? cleaned : x)))); setSaving(false); setEditing(null); onToast("success", draft.id === "new" ? `“${cleaned.label}” added.` : `“${cleaned.label}” updated.`); }, 700);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {tiers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-bz-lg border border-dashed border-bz-line bg-bz-paper-warm/30 py-10 text-center"><Users size={20} className="text-bz-text-soft" /><p className="text-[13px] font-medium text-bz-text-muted">No seat tiers yet</p></div>
      ) : (
        tiers.map((b) => editing === b.id ? <BundleEditor key={b.id} initial={b} permOptions={permOptions} saving={saving} onCancel={() => setEditing(null)} onSave={saveBundle} /> : <BundleRow key={b.id} bundle={b} locked={listLocked} onEdit={() => setEditing(b.id)} onDelete={() => remove(b)} />)
      )}
      {editing === "new" ? (
        <BundleEditor initial={{ id: "new", klass: "standard", saved: false, label: "", seats: 1, overage: 0, scope: "own", perms: [] }} permOptions={permOptions} saving={saving} onCancel={() => setEditing(null)} onSave={saveBundle} />
      ) : (
        <button onClick={() => setEditing("new")} disabled={listLocked} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-surface text-[12.5px] font-semibold text-bz-text-muted transition-colors hover:border-bz-text hover:text-bz-text disabled:cursor-not-allowed disabled:opacity-50"><Plus size={14} /> Add seat tier</button>
      )}
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}

function BundleRow({ bundle: b, locked, onEdit, onDelete }: { bundle: SeatBundle; locked: boolean; onEdit: () => void; onDelete: () => void }) {
  const klass = LICENCE_CLASSES.find((c) => c.id === b.klass);
  const scope = DATA_SCOPES.find((s) => s.id === b.scope);
  return (
    <div className="flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><KeyRound size={14} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="text-[13px] font-medium text-bz-text">{b.label || "Untitled tier"}</p><span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted">{klass?.label ?? b.klass}</span>{b.isDefault && <span className="rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[10px] font-semibold text-bz-text">Default</span>}</div>
        <p className={cn("mt-0.5 text-[10.5px] text-bz-text-muted", NUM)}>{b.seats} seats · {symbolOf(BASE_CURRENCY)}{g(b.overage)}/extra seat · {scope?.label}{b.klass === "restricted" && ` · ${b.perms.length} permissions`}</p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button onClick={onEdit} disabled={locked} title="Edit tier" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-40"><Pencil size={13} /></button>
        <button onClick={onDelete} disabled={locked || b.isDefault} title={b.isDefault ? "The default tier can't be deleted" : "Delete tier"} className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29] disabled:cursor-not-allowed disabled:opacity-40"><X size={13} /></button>
      </div>
    </div>
  );
}

function BundleEditor({ initial, permOptions, saving, onCancel, onSave }: { initial: SeatBundle; permOptions: Opt[]; saving: boolean; onCancel: () => void; onSave: (b: SeatBundle) => void }) {
  const [b, setB] = React.useState<SeatBundle>(initial);
  const isRestricted = b.klass === "restricted";
  const classLocked = b.saved;
  const set = (patch: Partial<SeatBundle>) => setB((x) => ({ ...x, ...patch }));
  const addPerm = () => set({ perms: [...b.perms, { id: uid("pr"), perm: null, mode: "view" }] });
  const setPerm = (id: string, patch: Partial<PermRow>) => set({ perms: b.perms.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const removePerm = (id: string) => set({ perms: b.perms.filter((p) => p.id !== id) });
  const valid = !!b.label.trim() && b.seats >= 1;
  return (
    <div className="overflow-hidden rounded-bz-lg border border-bz-text bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.06)]">
      <div className="flex items-center justify-between border-b border-bz-line-soft bg-bz-paper-warm/40 px-3.5 py-2.5"><span className="text-[12px] font-semibold text-bz-text">{b.id === "new" ? "New seat tier" : "Edit seat tier"}</span>{b.isDefault && <span className="rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[10px] font-semibold text-bz-text">Default — can't be removed</span>}</div>
      <div className="flex flex-col gap-3.5 p-3.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Licence class" hint={classLocked ? "locked after first save" : undefined}><EntityField value={LICENCE_CLASSES.find((c) => c.id === b.klass) ?? null} onChange={(o) => o && set({ klass: o.id })} options={LICENCE_CLASSES} required disabled={classLocked} title="licence class" icon={KeyRound} /></Field>
          <Field label="Customer-facing label" required><TextInput value={b.label} onChange={(v) => set({ label: v })} placeholder="e.g. Power user seat" error={!b.label.trim()} /></Field>
          <Field label="Included seats" required><NumberInput value={b.seats} onChange={(v) => set({ seats: v ?? 0 })} align="right" min={1} suffix="seats" /></Field>
          <Field label="Overage / extra seat" hint="per billing period"><NumberInput value={b.overage} onChange={(v) => set({ overage: v ?? 0 })} prefix={symbolOf(BASE_CURRENCY)} align="right" min={0} /></Field>
          <Field label="Data scope" className="sm:col-span-2"><EntityField value={DATA_SCOPES.find((s) => s.id === b.scope) ?? null} onChange={(o) => o && set({ scope: o.id })} options={DATA_SCOPES} required title="data scope" icon={Gauge} /></Field>
        </div>
        {isRestricted && (
          <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 p-3">
            <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Permission whitelist</p><span className="text-[10px] text-bz-text-soft">scope: {DATA_SCOPES.find((s) => s.id === b.scope)?.label}</span></div>
            {b.perms.length === 0 ? (
              <p className="rounded-bz-sm border border-dashed border-bz-line bg-bz-surface px-3 py-3 text-center text-[11px] text-bz-text-muted">No permissions yet — add the actions this class may take.</p>
            ) : (
              <div className="flex flex-col gap-2">{b.perms.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1"><EntityField value={p.perm} onChange={(o) => setPerm(p.id, { perm: o })} options={permOptions} placeholder="Pick a permission…" size="sm" title="permission" /></div>
                  <div className="w-[120px] shrink-0"><EntityField value={ACCESS_MODES.find((m) => m.id === p.mode) ?? null} onChange={(o) => o && setPerm(p.id, { mode: o.id })} options={ACCESS_MODES} required size="sm" title="access mode" /></div>
                  <button onClick={() => removePerm(p.id)} className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]"><X size={13} /></button>
                </div>
              ))}</div>
            )}
            <button onClick={addPerm} className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-bz-sm border border-bz-line bg-bz-surface px-2.5 text-[11px] font-semibold text-bz-text hover:bg-bz-paper-warm"><Plus size={11} /> Add permission</button>
            <p className="mt-2 text-[10px] text-bz-text-soft">On save, the bundle scope is re-applied to every permission row; rows with no permission are dropped.</p>
          </div>
        )}
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft pt-3">
          <button onClick={onCancel} disabled={saving} className="inline-flex h-8 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-50">Cancel</button>
          <button onClick={() => onSave(b)} disabled={!valid || saving} className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50">{saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} {saving ? "Saving…" : "Save tier"}</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REVIEW PRICING CARD  (the premium olive showcase, lime accents)
// ════════════════════════════════════════════════════════════════════════════

type PreviewProps = {
  name: string; planType: number; featured: boolean; inactive: boolean; isFree: boolean; headline: number; sym: string; phrase: string;
  trialDays: number | null; graceDays: number | undefined; lineNames: { name: string; total: number }[]; context: Ctx; visibility: string; subscriberCap: number | undefined;
};
function ReviewPlanCard(p: PreviewProps) {
  return (
    <div className="overflow-hidden rounded-bz-2xl bg-bz-olive text-bz-text-on-dark shadow-[0_24px_60px_-24px_rgba(10,16,13,0.5)]">
      <div className="p-6 md:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bz-fire">{planTypeLabel(p.planType)}</p>
            <div className="mt-1.5 flex items-center gap-2"><p className="truncate text-[22px] font-semibold tracking-tight text-bz-text-on-dark">{p.name.trim() || "Untitled plan"}</p>{p.featured && <Star size={15} className="shrink-0 text-bz-fire" fill="currentColor" />}</div>
          </div>
          {p.inactive && <span className="shrink-0 rounded-bz-pill bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-bz-text-on-dark-muted">Inactive</span>}
        </div>

        <div className="mt-5 flex items-end gap-1.5">
          {p.isFree ? <span className="text-[34px] font-semibold leading-none tracking-tight text-bz-fire">Free</span> : (<>
            <span className="mb-1 text-[14px] font-semibold text-bz-text-on-dark-muted">{p.sym}</span>
            <span className={cn("text-[36px] font-semibold leading-none tracking-tight text-bz-fire", NUM)}>{g(p.headline)}</span>
          </>)}
        </div>
        <p className="mt-2 text-[12.5px] text-bz-text-on-dark-muted">{p.phrase}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.trialDays != null && p.trialDays > 0 && <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-fire/20 px-2.5 py-1 text-[11px] font-semibold text-bz-fire"><Gift size={11} /> {p.trialDays} days free</span>}
          {p.graceDays != null && p.graceDays > 0 && <span className="inline-flex items-center gap-1 rounded-bz-pill bg-white/10 px-2.5 py-1 text-[11px] font-medium text-bz-text-on-dark"><CalendarClock size={11} /> {p.graceDays}-day grace</span>}
          {p.context === "tenant" && p.visibility === "hidden" && <span className="inline-flex items-center gap-1 rounded-bz-pill bg-[#C0413A]/30 px-2.5 py-1 text-[11px] font-medium text-bz-text-on-dark"><EyeOff size={11} /> Hidden</span>}
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          {p.lineNames.length === 0 ? <p className="text-[12px] text-bz-text-on-dark-muted">No priced lines yet.</p> : (
            <ul className="flex flex-col gap-2">{p.lineNames.slice(0, 6).map((l, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-[12.5px]"><span className="flex min-w-0 items-center gap-2 text-bz-text-on-dark"><Check size={12} className="shrink-0 text-bz-fire" strokeWidth={3} /> <span className="truncate">{l.name || "Untitled line"}</span></span><span className={cn("shrink-0 text-bz-text-on-dark-muted", NUM)}>{p.sym}{g(l.total)}</span></li>
            ))}{p.lineNames.length > 6 && <li className="text-[11px] text-bz-text-on-dark-muted">+ {p.lineNames.length - 6} more</li>}</ul>
          )}
        </div>

        {p.context === "tenant" && p.subscriberCap != null && (
          <p className={cn("mt-4 text-[11px] text-bz-text-on-dark-muted", NUM)}>{p.subscriberCap > 0 ? `Capped at ${p.subscriberCap} subscribers` : "Unlimited subscribers"}</p>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, onEdit }: { label: string; value: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0"><p className="text-[10.5px] uppercase tracking-[0.06em] text-bz-text-soft">{label}</p><div className="mt-0.5 text-[12.5px] text-bz-text">{value}</div></div>
      <button onClick={onEdit} className="shrink-0 text-[11.5px] font-medium text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline">Edit</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP RAIL  (connected vertical stepper + live summary)
// ════════════════════════════════════════════════════════════════════════════

type StepId = "details" | "billing" | "pricing" | "access" | "seats" | "review";
const STEP_META: Record<StepId, { title: string; desc: string }> = {
  details: { title: "Details", desc: "Name & type" },
  billing: { title: "Billing", desc: "Cycle, trial & grace" },
  pricing: { title: "Pricing", desc: "Priced lines" },
  access: { title: "Access & rules", desc: "Capabilities & policy" },
  seats: { title: "Seat tiers", desc: "Sellable bundles" },
  review: { title: "Review", desc: "Confirm & create" },
};

function StepRail({ steps, current, valid, onGo, summary }: {
  steps: StepId[]; current: number; valid: (id: StepId) => boolean; onGo: (i: number) => void; summary: React.ReactNode;
}) {
  return (
    <div className="hidden lg:flex lg:flex-col lg:gap-6">
      <ol className="flex flex-col">
        {steps.map((id, i) => {
          const active = i === current;
          const done = valid(id) && i !== current;
          const last = i === steps.length - 1;
          return (
            <li key={id}>
              <button onClick={() => onGo(i)} className="group flex w-full items-start gap-3 text-left">
                <span className="flex flex-col items-center">
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-pill border text-[11.5px] font-semibold transition-colors",
                    active ? "border-bz-deep bg-bz-deep text-bz-paper" : done ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface text-bz-text-soft group-hover:border-bz-text-muted")}>
                    {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </span>
                  {!last && <span className={cn("my-1 h-7 w-px transition-colors", done ? "bg-bz-fire/60" : "bg-bz-line-soft")} />}
                </span>
                <span className={cn("pt-1", last ? "" : "pb-3")}>
                  <span className={cn("block text-[13px] font-semibold transition-colors", active ? "text-bz-text" : done ? "text-bz-text" : "text-bz-text-muted group-hover:text-bz-text")}>{STEP_META[id].title}</span>
                  <span className="mt-0.5 block text-[10.5px] text-bz-text-soft">{STEP_META[id].desc}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {summary}
    </div>
  );
}

function MobileStepper({ steps, current }: { steps: StepId[]; current: number }) {
  const pct = ((current + 1) / steps.length) * 100;
  return (
    <div className="lg:hidden">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-semibold text-bz-text">{STEP_META[steps[current]].title}</p>
        <p className={cn("text-[11px] text-bz-text-muted", NUM)}>Step {current + 1} of {steps.length}</p>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft"><div className="h-full rounded-bz-pill bg-bz-fire transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function LiveSummary({ name, planType, isFree, sym, headline, phrase, trialDays }: { name: string; planType: number; isFree: boolean; sym: string; headline: number; phrase: string; trialDays: number | null }) {
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-3.5">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Your plan</p>
      <p className="mt-1.5 truncate text-[13.5px] font-semibold text-bz-text">{name.trim() || "Untitled plan"}</p>
      <p className="text-[10.5px] text-bz-text-muted">{planTypeLabel(planType)}</p>
      <div className="mt-2.5 flex items-end gap-1">
        {isFree ? <span className="text-[18px] font-semibold text-bz-text">Free</span> : <><span className="text-[10px] font-semibold text-bz-text-muted">{sym}</span><span className={cn("text-[18px] font-semibold leading-none text-bz-text", NUM)}>{g(headline)}</span></>}
      </div>
      <p className="mt-1 text-[10px] text-bz-text-soft">{phrase}</p>
      {trialDays != null && trialDays > 0 && <span className="mt-2 inline-flex items-center gap-1 rounded-bz-pill bg-bz-fire/[0.18] px-2 py-0.5 text-[10px] font-semibold text-bz-text"><Gift size={10} /> {trialDays} days free</span>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SEED  (create blanks · edit hydration)
// ════════════════════════════════════════════════════════════════════════════

type PlanSeed = {
  context: Ctx; name: string; code: string; description: string; planType: number; category: string; featured: boolean; inactive: boolean;
  cycle: number; interval: number; discountMode: "pct" | "amt"; discountValue: number | undefined; trialEnabled: boolean; trialDays: number | undefined; graceDays: number | undefined;
  pastDue: boolean; renewable: boolean; invoiceLead: number | undefined; notifyCustom: boolean; notif: Record<string, { on: boolean; offset: number | undefined }>;
  roleId: string | null; seatLimit: number | undefined; overagePrice: number | undefined; allowCustomPricing: boolean;
  revenueStrategy: "plan" | "line"; revenueId: string | null; visibility: string; subscriberCap: number | undefined; lines: PlanLine[];
};
function defaultNotif(custom: boolean): Record<string, { on: boolean; offset: number | undefined }> {
  const o: Record<string, { on: boolean; offset: number | undefined }> = {};
  NOTIF_EVENTS.forEach((e) => (o[e.key] = { on: custom && e.key !== "expired", offset: e.def }));
  return o;
}
function buildSeed(mode: "create" | "edit", id?: string): PlanSeed {
  if (mode === "edit") {
    return {
      context: "host", name: id === "PLAN-TEAM" ? "Team" : "Pro", code: id === "PLAN-TEAM" ? "TEAM" : "PRO",
      description: "Everything a growing team needs — priority support, advanced reporting and unlimited workspaces.",
      planType: 0, category: "Growth", featured: true, inactive: false, cycle: 2, interval: 1, discountMode: "pct", discountValue: undefined,
      trialEnabled: true, trialDays: 14, graceDays: 5, pastDue: true, renewable: true, invoiceLead: 3, notifyCustom: true, notif: defaultNotif(true),
      roleId: "R-MANAGER", seatLimit: 25, overagePrice: 1200, allowCustomPricing: false, revenueStrategy: "plan", revenueId: "REV-SAAS", visibility: "public", subscriberCap: 0,
      lines: [
        { ...blankLine(0), name: "Base platform", code: "BASE_PLATFORM", description: "Core ERP access", model: 0, price: 2500, qty: 1, unit: { id: "month", label: "month" }, tax: TAX_CODES[0] },
        { ...blankLine(1), name: "Additional seat", code: "ADDL_SEAT", model: 1, price: 600, qty: 5, unit: { id: "seat", label: "seat" } },
        { ...blankLine(2), name: "Volume tier", code: "VOLUME_TIER", model: TIERED, price: 450, qty: 10, minQty: 10, maxQty: 50, unit: { id: "seat", label: "seat" } },
      ],
    };
  }
  return {
    context: "host", name: "", code: "", description: "", planType: 0, category: "", featured: false, inactive: false, cycle: 2, interval: 1, discountMode: "pct", discountValue: undefined,
    trialEnabled: false, trialDays: undefined, graceDays: 0, pastDue: true, renewable: true, invoiceLead: 3, notifyCustom: false, notif: defaultNotif(false),
    roleId: null, seatLimit: 0, overagePrice: 0, allowCustomPricing: false, revenueStrategy: "plan", revenueId: null, visibility: "public", subscriberCap: 0, lines: [blankLine(0)],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function SubscriptionPlanFormDesignPage({ mode = "create" }: { mode?: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const seedRef = React.useRef<PlanSeed | null>(null);
  if (!seedRef.current) seedRef.current = buildSeed(mode, id);
  const seed = seedRef.current;

  // context (master switch)
  const [context, setContext] = React.useState<Ctx>(seed.context);
  // identity
  const [name, setName] = React.useState(seed.name);
  const [code, setCode] = React.useState(seed.code);
  const [codeTouched, setCodeTouched] = React.useState(mode === "edit");
  const [description, setDescription] = React.useState(seed.description);
  const [planType, setPlanType] = React.useState(seed.planType);
  const [category, setCategory] = React.useState(seed.category);
  const [featured, setFeatured] = React.useState(seed.featured);
  const [inactive, setInactive] = React.useState(seed.inactive);
  // billing
  const [cycle, setCycle] = React.useState(seed.cycle);
  const [interval, setIntervalVal] = React.useState<number | undefined>(seed.interval);
  const [discountMode, setDiscountMode] = React.useState<"pct" | "amt">(seed.discountMode);
  const [discountValue, setDiscountValue] = React.useState<number | undefined>(seed.discountValue);
  const [trialEnabled, setTrialEnabled] = React.useState(seed.trialEnabled);
  const [trialDays, setTrialDays] = React.useState<number | undefined>(seed.trialDays);
  const [graceDays, setGraceDays] = React.useState<number | undefined>(seed.graceDays);
  // invoicing & notifications
  const [pastDue, setPastDue] = React.useState(seed.pastDue);
  const [renewable, setRenewable] = React.useState(seed.renewable);
  const [invoiceLead, setInvoiceLead] = React.useState<number | undefined>(seed.invoiceLead);
  const [notifyCustom, setNotifyCustom] = React.useState(seed.notifyCustom);
  const [notif, setNotif] = React.useState(seed.notif);
  // host-only
  const [roleOpt, setRoleOpt] = React.useState<Opt | null>(seed.roleId ? ROLE_POOL.find((r) => r.id === seed.roleId) ?? null : null);
  const [roleLoading, setRoleLoading] = React.useState(false);
  const [roleLoaded, setRoleLoaded] = React.useState(false);
  const [seatLimit, setSeatLimit] = React.useState<number | undefined>(seed.seatLimit);
  const [overagePrice, setOveragePrice] = React.useState<number | undefined>(seed.overagePrice);
  const [allowCustomPricing, setAllowCustomPricing] = React.useState(seed.allowCustomPricing);
  // tenant-only
  const [revenueStrategy, setRevenueStrategy] = React.useState<"plan" | "line">(seed.revenueStrategy);
  const [planRevenueOpt, setPlanRevenueOpt] = React.useState<Opt | null>(seed.revenueId ? REVENUE_TARGETS.find((r) => r.id === seed.revenueId) ?? null : null);
  const [visibility, setVisibility] = React.useState(seed.visibility);
  const [subscriberCap, setSubscriberCap] = React.useState<number | undefined>(seed.subscriberCap);
  // lines
  const [lines, setLines] = React.useState<PlanLine[]>(seed.lines);
  const [expandedLines, setExpandedLines] = React.useState<Set<string>>(() => { const s = new Set<string>(); if (mode === "create") seed.lines.forEach((l) => s.add(l.id)); return s; });
  // flow
  const [step, setStep] = React.useState(0);
  const [posting, setPosting] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [touched, setTouched] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<ToastState>(null);
  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const toastId = React.useRef(0);
  const planId = mode === "edit" ? (id ?? "PLAN-PRO") : null;

  const showToast = React.useCallback((kind: "success" | "warning" | "error" | "info", message: string) => setToast({ kind, message, id: ++toastId.current }), []);
  const touch = () => setDirty(true);
  const markTouched = (key: string) => setTouched((s) => (s.has(key) ? s : new Set(s).add(key)));

  React.useEffect(() => {
    if (context !== "host" || roleLoaded) return;
    setRoleLoading(true);
    const t = window.setTimeout(() => { setRoleLoading(false); setRoleLoaded(true); }, 650);
    return () => window.clearTimeout(t);
  }, [context, roleLoaded]);

  // derived
  const baseSym = symbolOf(BASE_CURRENCY);
  const aggregate = React.useMemo(() => lines.reduce((s, l) => s + lineTotal(l), 0), [lines]);
  const discountAmt = discountValue == null ? 0 : discountMode === "pct" ? roundDp((aggregate * discountValue) / 100) : Math.min(discountValue, aggregate);
  const netTotal = Math.max(0, aggregate - discountAmt);
  const isFree = planType === 1 ? false : netTotal === 0;
  const phrase = billingPhrase(cycle, interval, isFree);
  const validLines = lines.filter(isLineComplete).length;

  const errOf = (key: string): string => {
    switch (key) {
      case "name": return !name.trim() ? "Plan name is required" : name.trim().length < 3 ? "At least 3 characters" : name.length > 80 ? "Max 80 characters" : "";
      case "code": return !code.trim() ? "A plan code is required" : !/^[A-Z][A-Z0-9_]*$/.test(code) ? "UPPER_SNAKE_CASE only" : code.length > 40 ? "Max 40 characters" : "";
      case "category": return context === "tenant" && !category.trim() ? "Category is required" : "";
      case "interval": return interval == null || interval < 1 ? "Interval must be at least 1" : interval > 36 ? "Max 36" : "";
      case "trialDays": return trialEnabled && (trialDays == null || trialDays < 1) ? "Enable a trial of at least 1 day" : "";
      case "role": return context === "host" && !roleOpt && roleLoaded ? "Associate a role" : "";
      case "planRevenue": return context === "tenant" && revenueStrategy === "plan" && !planRevenueOpt ? "Pick a revenue target" : "";
      case "lines": return validLines < 1 ? "Add at least one complete line" : "";
      default: return "";
    }
  };
  const showErr = (key: string) => (submitted || touched.has(key)) && !!errOf(key);

  // steps
  const steps: StepId[] = mode === "edit" ? ["details", "billing", "pricing", "access", "seats", "review"] : ["details", "billing", "pricing", "access", "review"];
  const stepIndex = (s: StepId) => steps.indexOf(s);
  const STEP_KEYS: Record<StepId, string[]> = { details: ["name", "code", "category"], billing: ["interval", "trialDays"], pricing: ["lines"], access: ["role", "planRevenue"], seats: [], review: [] };
  const stepValid = (sid: StepId): boolean => {
    if (sid === "review") return steps.every((s) => s === "review" || stepValid(s));
    return STEP_KEYS[sid].every((k) => !errOf(k));
  };
  const stepFirstErr = (sid: StepId) => { for (const k of STEP_KEYS[sid]) { const e = errOf(k); if (e) return e; } return ""; };
  const canSave = steps.every((s) => s === "review" || stepValid(s)) && !posting;

  const goTo = (i: number) => setStep(clamp(i, 0, steps.length - 1));
  const goNext = () => {
    const sid = steps[step];
    setTouched((prev) => new Set([...prev, ...STEP_KEYS[sid]]));
    if (!stepValid(sid)) { showToast("error", stepFirstErr(sid) || "Complete this step before continuing."); return; }
    if (step < steps.length - 1) setStep(step + 1);
  };
  const goBack = () => { if (step > 0) setStep(step - 1); };

  const onNameBlur = () => { markTouched("name"); if (!codeTouched && !code.trim() && name.trim()) setCode(toCode(name)); };

  const switchContext = (c: Ctx) => {
    if (c === context) return;
    setContext(c);
    if (c === "tenant") setRoleOpt(null);
    if (c === "host") { setPlanRevenueOpt(null); setRevenueStrategy("plan"); setLines((xs) => xs.map((l) => ({ ...l, revenue: null }))); }
    touch();
    showToast("info", c === "host" ? "Authoring as a host operator — platform capabilities shown." : "Authoring as a tenant operator — tenant capabilities shown.");
  };
  const onRevenueStrategy = (s: "plan" | "line") => { setRevenueStrategy(s); if (s === "line") setPlanRevenueOpt(null); touch(); };

  // line handlers
  const updateLine = (lineId: string, patch: Partial<PlanLine>) => { setLines((xs) => xs.map((l) => (l.id === lineId ? { ...l, ...patch } : l))); touch(); };
  const addLine = () => { const order = lines.length ? Math.max(...lines.map((l) => l.order)) + 1 : 0; const nl = blankLine(order); setLines((xs) => [...xs, nl]); setExpandedLines((s) => new Set(s).add(nl.id)); touch(); };
  const removeLine = (lineId: string) => { if (lines.length === 1) { showToast("warning", "A plan needs at least one priced line."); return; } setLines((xs) => xs.filter((l) => l.id !== lineId)); touch(); };
  const toggleLineExpand = (lineId: string) => setExpandedLines((s) => { const n = new Set(s); if (n.has(lineId)) n.delete(lineId); else n.add(lineId); return n; });
  const setNotifEvent = (key: string, patch: Partial<{ on: boolean; offset: number | undefined }>) => { setNotif((n) => ({ ...n, [key]: { ...n[key], ...patch } })); touch(); };

  const resetForm = () => {
    setConfirm({ title: "Start over?", body: "Every field returns to its defaults and you'll go back to the first step.", confirmLabel: "Start over", onConfirm: () => {
      const fresh = buildSeed("create");
      setContext(fresh.context); setName(fresh.name); setCode(fresh.code); setCodeTouched(false); setDescription(fresh.description); setPlanType(fresh.planType); setCategory(fresh.category); setFeatured(fresh.featured); setInactive(fresh.inactive);
      setCycle(fresh.cycle); setIntervalVal(fresh.interval); setDiscountMode(fresh.discountMode); setDiscountValue(fresh.discountValue); setTrialEnabled(fresh.trialEnabled); setTrialDays(fresh.trialDays); setGraceDays(fresh.graceDays);
      setPastDue(fresh.pastDue); setRenewable(fresh.renewable); setInvoiceLead(fresh.invoiceLead); setNotifyCustom(fresh.notifyCustom); setNotif(fresh.notif);
      setRoleOpt(null); setSeatLimit(fresh.seatLimit); setOveragePrice(fresh.overagePrice); setAllowCustomPricing(fresh.allowCustomPricing); setRevenueStrategy(fresh.revenueStrategy); setPlanRevenueOpt(null); setVisibility(fresh.visibility); setSubscriberCap(fresh.subscriberCap);
      setLines(fresh.lines); setExpandedLines(new Set(fresh.lines.map((l) => l.id))); setStep(0); setDirty(false); setSubmitted(false); setTouched(new Set());
      showToast("success", "Form reset to a blank plan.");
    } });
  };

  const onExit = () => { if (dirty) setConfirm({ title: "Discard unsaved changes?", body: "You have unsaved changes to this plan. Leave without saving?", confirmLabel: "Discard & leave", danger: true, onConfirm: () => navigate(-1) }); else navigate(-1); };

  const handleSave = React.useCallback(() => {
    if (posting) return;
    setSubmitted(true);
    if (!canSave) {
      if (trialEnabled && (trialDays == null || trialDays < 1)) showToast("error", "Trial is enabled but has no days — set a trial length or turn it off.");
      else if (interval == null || interval < 1) showToast("error", "Billing interval must be at least 1.");
      else showToast("error", "Some required fields still need attention.");
      const firstBad = steps.find((s) => s !== "review" && !stepValid(s));
      if (firstBad) setStep(stepIndex(firstBad));
      return;
    }
    setPosting(true);
    window.setTimeout(() => {
      setPosting(false); setDirty(false);
      if (mode === "edit") { showToast("success", `${name || code} updated.`); window.setTimeout(() => navigate(-1), 800); }
      else { showToast("success", `${name || code} created — opening it to add seat tiers…`); window.setTimeout(() => navigate(`/design/subscription-plan/${code || "PLAN-NEW"}/edit`), 850); }
    }, 950);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posting, canSave, trialEnabled, trialDays, interval, code, mode, name, navigate, showToast]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); handleSave(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSave]);

  const lineNames = lines.map((l) => ({ name: l.name, total: lineTotal(l) }));
  const preview: PreviewProps = { name, planType, featured, inactive, isFree, headline: netTotal, sym: baseSym, phrase, trialDays: trialEnabled ? trialDays ?? null : null, graceDays, lineNames, context, visibility, subscriberCap: context === "tenant" ? subscriberCap : undefined };
  const sid = steps[step];
  const isReview = sid === "review";

  return (
    <AppShell
      breadcrumb={<>
        <span className="text-bz-text-muted">Administration</span>
        <ChevronRight size={11} className="text-bz-text-soft" />
        <span className="text-bz-text-muted">Subscription Plans</span>
        <ChevronRight size={11} className="text-bz-text-soft" />
        <span className="font-semibold text-bz-text">{mode === "edit" ? code || "Edit" : "New"}</span>
      </>}
      overlay={<>
        {/* docked footer — Back / progress / Continue|Create */}
        <div className="border-t border-bz-line bg-bz-paper">
          <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-4 py-3 md:px-6">
            <button onClick={step === 0 ? onExit : goBack} className="inline-flex h-10 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm">
              <ArrowLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
            </button>
            <p className={cn("hidden text-[11.5px] text-bz-text-muted sm:block", NUM)}>Step {step + 1} of {steps.length} · <span className="font-medium text-bz-text">{STEP_META[sid].title}</span></p>
            {isReview ? (
              <button onClick={handleSave} disabled={!canSave || posting} className="inline-flex h-10 items-center gap-1.5 rounded-bz-md bg-bz-deep px-5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50">
                {posting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {posting ? (mode === "edit" ? "Saving…" : "Creating…") : mode === "edit" ? "Save changes" : "Create plan"}
              </button>
            ) : (
              <button onClick={goNext} className="inline-flex h-10 items-center gap-1.5 rounded-bz-md bg-bz-deep px-5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95">Continue <ArrowRight size={14} /></button>
            )}
          </div>
        </div>
        <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>}
    >
      <div className="mx-auto max-w-[1080px] px-4 py-7 md:px-6 md:py-9">
        {/* page header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text md:text-[26px]">{mode === "edit" ? "Edit subscription plan" : "Create a subscription plan"}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-deep px-2.5 py-1 text-[11px] font-semibold text-bz-paper", NUM)} title="Auto-derived plan code"><Hash size={11} /> {code || "—"}{mode === "create" && <span className="rounded-bz-sm bg-white/15 px-1 py-px text-[8.5px] font-bold uppercase tracking-[0.08em] text-bz-fire">Auto</span>}</span>
              <span className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[11px] font-medium text-bz-text-muted">{context === "host" ? <ShieldCheck size={11} /> : <Users size={11} />}{context === "host" ? "Host-authored" : "Tenant-authored"}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-soft sm:inline" title="Simulates the operator context the app detects at load">Author as</span>
            <Segmented<Ctx> options={[{ id: "host", label: "Host" }, { id: "tenant", label: "Tenant" }]} value={context} onChange={switchContext} />
            {mode === "create" && <button onClick={resetForm} title="Start over" className="flex size-9 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><RotateCcw size={15} /></button>}
          </div>
        </div>

        <MobileStepper steps={steps} current={step} />

        <div className="mt-5 grid grid-cols-1 gap-7 lg:grid-cols-[208px_minmax(0,1fr)] lg:gap-9">
          <StepRail steps={steps} current={step} valid={stepValid} onGo={goTo} summary={<LiveSummary name={name} planType={planType} isFree={isFree} sym={baseSym} headline={netTotal} phrase={phrase} trialDays={trialEnabled ? trialDays ?? null : null} />} />

          <div className="min-w-0 rounded-bz-xl border border-bz-line-soft bg-bz-surface p-5 shadow-[0_1px_2px_rgba(15,20,17,0.04)] md:p-8 lg:p-10">
            {/* ─────────────────────── STEP: DETAILS ─────────────────────── */}
            {sid === "details" && (
              <div>
                <StepHeading eyebrow="Step 1" title="Name your plan" desc="Give the plan a clear name and pick what kind of plan it is. The code is generated for you and stays editable." />
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_240px]">
                    <Field label="Plan name" required error={showErr("name") ? errOf("name") : undefined}><TextInput value={name} onChange={(v) => { setName(v); touch(); }} onBlur={onNameBlur} placeholder="e.g. Pro" error={showErr("name")} /></Field>
                    <Field label="Plan code" required hint={!codeTouched ? "auto from name" : undefined} error={showErr("code") ? errOf("code") : undefined}><TextInput value={code} onChange={(v) => { setCode(v.toUpperCase()); setCodeTouched(true); touch(); }} onBlur={() => markTouched("code")} placeholder="UPPER_SNAKE" error={showErr("code")} /></Field>
                  </div>
                  <div>
                    <SubLabel>Plan type</SubLabel>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {PLAN_TYPES.map((t) => <OptionCard key={t.v} selected={planType === t.v} icon={t.icon} label={t.label} hint={t.hint} onClick={() => { setPlanType(t.v); touch(); }} />)}
                    </div>
                  </div>
                  {context === "tenant" && (
                    <Field label="Category" required hint="how subscribers group it" error={showErr("category") ? errOf("category") : undefined} className="sm:max-w-[320px]"><TextInput value={category} onChange={(v) => { setCategory(v); touch(); }} onBlur={() => markTouched("category")} placeholder="e.g. Growth" error={showErr("category")} /></Field>
                  )}
                  <Field label="Description" hint="optional"><Textarea value={description} onChange={(v) => { setDescription(v); touch(); }} rows={2} placeholder="A short line subscribers will read on the pricing page…" /></Field>
                  <div>
                    <SubLabel>Flags</SubLabel>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <ToggleCard icon={Star} title="Featured" desc="Highlight this plan on the pricing page" value={featured} onChange={(v) => { setFeatured(v); touch(); }} />
                      <ToggleCard icon={EyeOff} title="Inactive" desc="Keep editable but not subscribable" value={inactive} onChange={(v) => { setInactive(v); touch(); }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────── STEP: BILLING ─────────────────────── */}
            {sid === "billing" && (
              <div>
                <StepHeading eyebrow="Step 2" title="Set the billing rhythm" desc="Choose how often the plan bills, and whether it offers a trial or a grace period." />
                <div className="flex flex-col gap-6">
                  <div>
                    <SubLabel>Billing cycle</SubLabel>
                    <PillSelect<number> options={BILLING_CYCLES.map((c) => ({ id: c.v, label: c.label }))} value={cycle} onChange={(v) => { setCycle(v); touch(); }} />
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <SubLabel>Bill every</SubLabel>
                      <div className="flex items-center gap-3">
                        <Stepper value={interval ?? 1} onChange={(v) => { setIntervalVal(v); touch(); markTouched("interval"); }} min={1} max={36} suffix={cycleOf(cycle).unit + ((interval ?? 1) > 1 ? "s" : "")} ariaLabel="Billing interval" />
                      </div>
                      {showErr("interval") && <p className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-medium text-[#9A2E29]"><AlertTriangle size={10} /> {errOf("interval")}</p>}
                    </div>
                    <div className="flex flex-col justify-center rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">This plan</p>
                      <p className="mt-0.5 text-[16px] font-semibold tracking-tight text-bz-text">{phrase}</p>
                    </div>
                  </div>
                  <div>
                    <SubLabel>Promotional discount</SubLabel>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Segmented<"pct" | "amt"> options={[{ id: "pct", label: "% off" }, { id: "amt", label: `${baseSym} off` }]} value={discountMode} onChange={(m) => { setDiscountMode(m); touch(); }} />
                      <div className="w-[160px]"><NumberInput value={discountValue} onChange={(v) => { setDiscountValue(v); touch(); }} align="right" min={0} max={discountMode === "pct" ? 100 : undefined} suffix={discountMode === "pct" ? "%" : undefined} prefix={discountMode === "amt" ? baseSym : undefined} placeholder="None" /></div>
                    </div>
                  </div>
                  <ToggleCard icon={Gift} title="Free trial" desc="Let subscribers try the plan before they pay" value={trialEnabled} onChange={(v) => { setTrialEnabled(v); if (v && trialDays == null) setTrialDays(14); touch(); markTouched("trialDays"); }}>
                    <div className="flex flex-wrap items-end gap-4">
                      <div><SubLabel>Trial length</SubLabel><Stepper value={trialDays ?? 0} onChange={(v) => { setTrialDays(v); touch(); }} min={0} max={365} suffix="days" ariaLabel="Trial length" /></div>
                      {trialDays != null && trialDays > 0 ? <div className="flex h-10 items-center gap-1.5 rounded-bz-md bg-bz-fire/[0.14] px-3 text-[12.5px] font-semibold text-bz-text"><Gift size={13} className="text-bz-leaf-deep" /> {trialDays} {trialDays === 1 ? "day" : "days"} free</div> : <p className="pb-2.5 text-[11px] font-medium text-[#9A2E29]">Set at least one trial day.</p>}
                    </div>
                  </ToggleCard>
                  <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
                    <div className="flex flex-wrap items-end gap-4">
                      <div><SubLabel>Grace period</SubLabel><Stepper value={graceDays ?? 0} onChange={(v) => { setGraceDays(v); touch(); }} min={0} max={90} suffix="days" ariaLabel="Grace period" /></div>
                      <p className="flex-1 pb-2.5 text-[11.5px] text-bz-text-muted">{graceDays && graceDays > 0 ? <><span className={cn("font-semibold text-bz-text", NUM)}>{graceDays}</span> {graceDays === 1 ? "day" : "days"} after expiry before access is cut off.</> : "No grace — access ends the moment the plan expires."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────── STEP: PRICING ─────────────────────── */}
            {sid === "pricing" && (
              <div>
                <StepHeading eyebrow="Step 3" title="Price the plan" desc="Add the features and tiers this plan charges for. The plan price is the sum of every line."
                  aside={<div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/40 px-3.5 py-2 text-right"><p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">Plan total</p><p><span className="text-[10px] font-semibold text-bz-text-muted">{baseSym}</span> <span className={cn("text-[17px] font-semibold text-bz-text", NUM)}>{g(aggregate)}</span></p></div>} />
                <LineEditor lines={lines} perLineRevenue={context === "tenant" && revenueStrategy === "line"} expanded={expandedLines} onToggleExpand={toggleLineExpand} onUpdate={updateLine} onRemove={removeLine} onAdd={addLine} onNotice={(k, m) => showToast(k === "warning" ? "warning" : "info", m)} />
                {showErr("lines") && <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#9A2E29]"><AlertTriangle size={11} /> {errOf("lines")}</p>}
                {context === "tenant" && revenueStrategy === "line" && <p className="mt-3 text-[10.5px] text-bz-text-soft">Per-line revenue mapping is on — expand each line to assign its revenue target.</p>}
              </div>
            )}

            {/* ─────────────────────── STEP: ACCESS & RULES ─────────────────────── */}
            {sid === "access" && (
              <div>
                <StepHeading eyebrow="Step 4" title="Access & rules" desc={context === "host" ? "Set what the plan grants and how it's invoiced. These platform capabilities are only shown to host operators." : "Map revenue, control visibility, and set how the plan is invoiced. These workspace capabilities are only shown to tenant operators."} />
                <div className="flex flex-col gap-7">
                  {/* capabilities (context-gated) */}
                  <div>
                    <SubLabel>{context === "host" ? "Platform capabilities" : "Workspace capabilities"}</SubLabel>
                    {context === "host" ? (
                      <div className="flex flex-col gap-3.5">
                        <Field label="Associated role" required hint={roleLoading ? "loading roles…" : undefined} error={showErr("role") ? errOf("role") : undefined}><EntityField value={roleOpt} onChange={(o) => { setRoleOpt(o); touch(); markTouched("role"); }} options={ROLE_POOL} placeholder={roleLoading ? "Loading roles…" : "Select the role this plan grants"} icon={KeyRound} required loading={roleLoading} error={showErr("role")} title="role" /></Field>
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                          <Field label="Seats per subscriber" hint="0 = unlimited"><NumberInput value={seatLimit} onChange={(v) => { setSeatLimit(v); touch(); }} align="right" min={0} suffix="seats" placeholder="0" /></Field>
                          <Field label="Overage / extra seat" hint="per billing period"><NumberInput value={overagePrice} onChange={(v) => { setOveragePrice(v); touch(); }} prefix={baseSym} align="right" min={0} placeholder="0" /></Field>
                        </div>
                        <ToggleCard icon={Wallet} title="Allow custom pricing" desc="Let sales negotiate a per-account price for this plan" value={allowCustomPricing} onChange={(v) => { setAllowCustomPricing(v); touch(); }} />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3.5">
                        <Field label="Revenue mapping" hint="single target vs per-line"><Segmented<"plan" | "line"> options={[{ id: "plan", label: "Plan-level" }, { id: "line", label: "Per-line" }]} value={revenueStrategy} onChange={onRevenueStrategy} /></Field>
                        {revenueStrategy === "plan" && (REVENUE_TARGETS.length === 0 ? <InlineNote tone="warn">No eligible revenue accounts exist yet. Create an income account before mapping plan revenue.</InlineNote> : <Field label="Plan revenue target" required error={showErr("planRevenue") ? errOf("planRevenue") : undefined}><EntityField value={planRevenueOpt} onChange={(o) => { setPlanRevenueOpt(o); touch(); markTouched("planRevenue"); }} options={REVENUE_TARGETS} placeholder="Book all plan revenue to…" icon={Wallet} required error={showErr("planRevenue")} title="revenue target" /></Field>)}
                        {revenueStrategy === "line" && <InlineNote>Per-line mapping is on — each plan line carries its own revenue-target picker on the Pricing step.</InlineNote>}
                        <div>
                          <SubLabel>Visibility</SubLabel>
                          <PillSelect<string> options={VISIBILITY.map((v) => ({ id: v.id, label: v.label }))} value={visibility} onChange={(v) => { setVisibility(v); touch(); }} />
                          <p className="mt-2 text-[10.5px] text-bz-text-soft">{VISIBILITY.find((v) => v.id === visibility)?.hint}</p>
                        </div>
                        <Field label="Subscriber cap" hint="0 = unlimited" className="sm:max-w-[260px]"><NumberInput value={subscriberCap} onChange={(v) => { setSubscriberCap(v); touch(); }} align="right" min={0} suffix="subs" placeholder="0" /></Field>
                        {visibility === "hidden" && <InlineNote tone="warn">This plan is hidden — it won't appear anywhere subscribers can self-select it. Only direct provisioning can assign it.</InlineNote>}
                      </div>
                    )}
                  </div>

                  {/* invoicing */}
                  <div className="border-t border-bz-line-soft pt-7">
                    <SubLabel>Invoicing</SubLabel>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <ToggleCard icon={Receipt} title="Generate past-due invoices" desc="Raise invoices for periods that lapsed unpaid" value={pastDue} onChange={(v) => { setPastDue(v); touch(); }} />
                      <ToggleCard icon={Repeat} title="Auto-renew" desc="Roll the subscription into the next period" value={renewable} onChange={(v) => { setRenewable(v); touch(); }} />
                    </div>
                    <Field label="Invoice generation lead" hint="days before period end · max 30" className="mt-3.5 sm:max-w-[260px]"><NumberInput value={invoiceLead} onChange={(v) => { setInvoiceLead(v); touch(); }} align="right" min={0} max={30} suffix="days" placeholder="0" /></Field>
                  </div>

                  {/* notifications */}
                  <div className="border-t border-bz-line-soft pt-7">
                    <SubLabel>Notifications</SubLabel>
                    <ToggleCard icon={Bell} title="Custom notification policy" desc={notifyCustom ? "This plan sets its own reminders." : "Inherits the workspace's upstream defaults."} value={notifyCustom} onChange={(v) => { setNotifyCustom(v); touch(); }}>
                      <div className="flex flex-col gap-2">
                        {NOTIF_EVENTS.map((e) => { const state = notif[e.key]; return (
                          <div key={e.key} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-bz-md bg-bz-surface px-3 py-2">
                            <div className="flex min-w-0 flex-1 items-center gap-2.5"><Switch value={state.on} onChange={(v) => setNotifEvent(e.key, { on: v })} ariaLabel={e.label} /><span className={cn("text-[12px]", state.on ? "font-medium text-bz-text" : "text-bz-text-muted")}>{e.label}</span></div>
                            <div className="w-[140px] shrink-0"><NumberInput value={state.offset} onChange={(v) => setNotifEvent(e.key, { offset: v })} align="right" min={-90} max={90} disabled={!state.on} suffix="days" /></div>
                            <span className="w-full text-right text-[9.5px] text-bz-text-soft sm:w-auto">− before · + after</span>
                          </div>
                        ); })}
                        <p className="mt-1 text-[10px] text-bz-text-soft">When inheriting, these fields are nulled in the saved plan so it follows the workspace defaults.</p>
                      </div>
                    </ToggleCard>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────── STEP: SEATS (edit only) ─────────────────────── */}
            {sid === "seats" && (
              <div>
                <StepHeading eyebrow="Step 5" title="Seat & licence tiers" desc="Define the seat bundles subscribers can buy against this plan. Each tier saves on its own — changes here are independent of the plan." />
                <SeatTierEditor planId={planId} onToast={(kind, msg) => showToast(kind, msg)} />
              </div>
            )}

            {/* ─────────────────────── STEP: REVIEW ─────────────────────── */}
            {isReview && (
              <div>
                <StepHeading eyebrow={`Step ${steps.length}`} title="Review & create" desc="This is exactly what subscribers will see. Edit any detail before you create the plan." />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <ReviewPlanCard {...preview} />
                  <div>
                    <div className="divide-y divide-bz-line-soft">
                      <SummaryRow label="Plan" value={<span>{name.trim() || "Untitled plan"} · <span className="text-bz-text-muted">{planTypeLabel(planType)}</span></span>} onEdit={() => goTo(stepIndex("details"))} />
                      <SummaryRow label="Billing" value={<span className={NUM}>{phrase}{!isFree && <> · {baseSym}{g(netTotal)}</>}</span>} onEdit={() => goTo(stepIndex("billing"))} />
                      <SummaryRow label="Trial & grace" value={<span className={NUM}>{trialEnabled && trialDays ? `${trialDays}-day trial` : "No trial"} · {graceDays ? `${graceDays}-day grace` : "no grace"}</span>} onEdit={() => goTo(stepIndex("billing"))} />
                      <SummaryRow label="Priced lines" value={<span className={NUM}>{validLines} of {lines.length} ready · {baseSym}{g(aggregate)}</span>} onEdit={() => goTo(stepIndex("pricing"))} />
                      <SummaryRow label={context === "host" ? "Access (host)" : "Access (tenant)"} value={context === "host" ? <span>{roleOpt ? roleOpt.label : "No role"} · {seatLimit ? `${seatLimit} seats` : "unlimited seats"}</span> : <span>{revenueStrategy === "plan" ? (planRevenueOpt?.label ?? "No revenue target") : "Per-line revenue"} · {VISIBILITY.find((v) => v.id === visibility)?.label}</span>} onEdit={() => goTo(stepIndex("access"))} />
                      <SummaryRow label="Notifications" value={notifyCustom ? "Custom policy" : "Inherits defaults"} onEdit={() => goTo(stepIndex("access"))} />
                    </div>
                    {!canSave && <div className="mt-4"><InlineNote tone="warn">Some steps still need attention — the rail marks which. Fix them, then create the plan.</InlineNote></div>}
                    {mode === "create" && <div className="mt-4"><InlineNote>Seat &amp; licence tiers can be added once the plan is created — you'll land on the editor automatically.</InlineNote></div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
