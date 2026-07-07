import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router";
import {
  ChevronRight, ChevronDown, ChevronLeft, Check, Loader2, X, Wand2, Upload,
  RotateCcw, Landmark, Plus, Search, RefreshCw, Star, SlidersHorizontal,
  ArrowDownLeft, ArrowUpRight, Ban, Link2, Info, Receipt, FileText,
  ArrowLeftRight, PenLine, CheckCircle2,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// BANK RECONCILIATION WORKSPACE
//
// A live working surface for clearing imported bank-statement lines against the
// ledger's own vouchers. Primary action: RECONCILE THE FOCUSED TRANSACTION —
// match it to existing vouchers, create-and-reconcile a new one, or inspect and
// reverse it — one after another, keeping the numbers honest.
//
// Master–detail, deliberately calm: a quiet scope header + a balances strip on
// top; a queue of transactions on the left; one focused working panel on the
// right; a batch bar that only materialises once two rows are checked. Selection
// is dual-track — exactly one row is FOCUSED (drives the modes) while an
// independent multi-check set drives batch ops. Any successful mutation raises a
// single refresh: the list re-loads, the balances recompute, and focus resets.
//
// (Exports BANK_ACCOUNTS / accountById for the sibling Statement Import wizard.)
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const EPSILON = 0.5;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmtDay = (iso: string) => { const [, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]}`; };
const fmtFull = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const toInt = (iso: string) => Number(iso.replace(/-/g, ""));
const grp = (n: number) => Math.round(Math.abs(n)).toLocaleString("en-US");
const money = (n: number, ccy: string) => `${ccy} ${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const signed = (n: number, ccy: string) => `${n < -EPSILON ? "−" : ""}${money(n, ccy)}`;

// ── accounts (EXPORTED — the sibling import wizard imports these) ──

export type BankAccount = { id: string; name: string; number: string; bank: string; currency: string; openingCleared: number };
export const BANK_ACCOUNTS: BankAccount[] = [
  { id: "acc-nabil-cur", name: "Nabil Bank — Current", number: "019-0123456-01", bank: "Nabil Bank", currency: "NPR", openingCleared: 2_450_000 },
  { id: "acc-himalayan-sav", name: "Himalayan Bank — Savings", number: "007-552210-02", bank: "Himalayan Bank", currency: "NPR", openingCleared: 1_180_000 },
  { id: "acc-nic-usd", name: "NIC Asia — USD Operating", number: "301-99281-USD", bank: "NIC Asia", currency: "USD", openingCleared: 84_500 },
  { id: "acc-scb-cur", name: "Standard Chartered — Current", number: "112-8890021-00", bank: "Standard Chartered", currency: "NPR", openingCleared: 5_620_000 },
];
export function accountById(id: string | null): BankAccount | null {
  return BANK_ACCOUNTS.find((a) => a.id === id) ?? null;
}

// ════════════════════════════════════════════════════════════════════════════
// MODEL + SEED DATA (numbers reconcile: cleared = opening + Σ sign·allocated)
// ════════════════════════════════════════════════════════════════════════════

type AllocOrigin = "matched" | "created";
type Allocation = { id: string; voucher: string; voucherType: string; amount: number; origin: AllocOrigin };
type BankHints = { counterparty?: string; bankRef?: string; channel?: string };
type BankTxn = {
  id: string; accountId: string; dateISO: string; refDateISO?: string;
  description: string; reference: string | null; party: string | null;
  amount: number; allocations: Allocation[]; hints?: BankHints;
  cancelled?: boolean; cancelReason?: string;
};

const NABIL = "acc-nabil-cur", HIMAL = "acc-himalayan-sav", NICUSD = "acc-nic-usd";

const SEED_TXNS: BankTxn[] = [
  { id: "BT-1042", accountId: NABIL, dateISO: "2026-06-03", refDateISO: "2026-06-02", description: "Inward clearing — Himalayan Traders", reference: "CHQ-88231", party: "Himalayan Traders", amount: 480_000, allocations: [{ id: "al-1", voucher: "SI-2048", voucherType: "Sales Invoice", amount: 480_000, origin: "matched" }], hints: { counterparty: "Himalayan Traders Pvt Ltd", bankRef: "CHQ-88231", channel: "Cheque clearing" } },
  { id: "BT-1041", accountId: NABIL, dateISO: "2026-06-03", refDateISO: "2026-06-03", description: "NEFT credit — Everest Hardware Supplies", reference: "NEFT-7741", party: "Everest Hardware Supplies", amount: 312_500, allocations: [], hints: { counterparty: "Everest Hardware Supplies", bankRef: "NEFT-7741", channel: "NEFT inward" } },
  { id: "BT-1040", accountId: NABIL, dateISO: "2026-06-04", refDateISO: "2026-06-04", description: "Cheque paid — Shivam Cement Ltd", reference: "CHQ-5567", party: "Shivam Cement Ltd", amount: -185_400, allocations: [] },
  { id: "BT-1039", accountId: NABIL, dateISO: "2026-06-05", description: "Deposit — Annapurna Distributors", reference: "DEP-2290", party: "Annapurna Distributors", amount: 96_200, allocations: [] },
  { id: "BT-1038", accountId: NABIL, dateISO: "2026-06-06", description: "NEA — electricity (Jaishtha)", reference: "BILL-44120", party: "Nepal Electricity Authority", amount: -742_000, allocations: [{ id: "al-2", voucher: "PMT-3391", voucherType: "Payment", amount: 400_000, origin: "matched" }] },
  { id: "BT-1037", accountId: NABIL, dateISO: "2026-06-07", description: "POS purchase — Kathmandu 4471", reference: null, party: null, amount: -58_750, allocations: [], hints: { bankRef: "POS-4471", channel: "Card / POS" } },
  { id: "BT-1036", accountId: NABIL, dateISO: "2026-06-09", description: "RTGS credit — Sagarmatha Steel Udyog", reference: "RTGS-9981", party: "Sagarmatha Steel Udyog", amount: 1_250_000, allocations: [{ id: "al-3", voucher: "RCPT-7720", voucherType: "Customer Receipt", amount: 1_250_000, origin: "created" }] },
  { id: "BT-1035", accountId: NABIL, dateISO: "2026-06-10", description: "Transfer out — to Himalayan Savings", reference: "TRF-3320", party: null, amount: -350_000, allocations: [], hints: { channel: "Internal transfer", bankRef: "TRF-3320" } },
  { id: "BT-1034", accountId: NABIL, dateISO: "2026-06-11", description: "Interest credit — Q1 savings", reference: "INT-0601", party: null, amount: 28_900, allocations: [] },
  { id: "BT-1033", accountId: NABIL, dateISO: "2026-06-12", description: "Refund paid — Gandaki Auto Parts", reference: "CHQ-5571", party: "Gandaki Auto Parts", amount: -124_600, allocations: [] },
  { id: "BT-1032", accountId: NABIL, dateISO: "2026-06-13", description: "Payroll — June salaries", reference: "PAYR-06", party: null, amount: -890_000, allocations: [{ id: "al-4", voucher: "JE-5567", voucherType: "Journal Entry", amount: 500_000, origin: "created" }] },
  { id: "BT-1031", accountId: NABIL, dateISO: "2026-06-14", description: "Reversed deposit — Pokhara Electronics", reference: "DEP-2301", party: "Pokhara Electronics", amount: 67_400, allocations: [], cancelled: true, cancelReason: "Duplicate of an earlier import." },

  { id: "BT-2018", accountId: HIMAL, dateISO: "2026-06-10", description: "Transfer in — from Nabil Current", reference: "TRF-3320", party: null, amount: 350_000, allocations: [], hints: { channel: "Internal transfer", bankRef: "TRF-3320" } },
  { id: "BT-2019", accountId: HIMAL, dateISO: "2026-06-12", description: "NEFT credit — Lumbini Textiles", reference: "NEFT-8890", party: "Lumbini Textiles", amount: 214_000, allocations: [] },
  { id: "BT-2020", accountId: HIMAL, dateISO: "2026-06-13", description: "Bank charges — Jaishtha", reference: null, party: null, amount: -3_400, allocations: [] },

  { id: "BT-3007", accountId: NICUSD, dateISO: "2026-06-08", description: "Inward remittance — Optima LLC", reference: "SWIFT-55120", party: "Optima LLC", amount: 12_500, allocations: [] },
  { id: "BT-3008", accountId: NICUSD, dateISO: "2026-06-11", description: "Wire out — AWS Inc", reference: "SWIFT-55133", party: "Amazon Web Services", amount: -3_200, allocations: [] },
];

type Voucher = { id: string; type: string; party: string | null; dateISO: string; open: number; total: number; reference: string | null };
const VOUCHER_POOL: Voucher[] = [
  { id: "SI-2051", type: "Sales Invoice", party: "Everest Hardware Supplies", dateISO: "2026-06-02", open: 312_500, total: 312_500, reference: "NEFT-7741" },
  { id: "SI-2049", type: "Sales Invoice", party: "Everest Hardware Supplies", dateISO: "2026-05-28", open: 188_000, total: 260_000, reference: null },
  { id: "SI-2053", type: "Sales Invoice", party: "Annapurna Distributors", dateISO: "2026-06-04", open: 96_200, total: 96_200, reference: "DEP-2290" },
  { id: "PI-882", type: "Purchase Invoice", party: "Shivam Cement Ltd", dateISO: "2026-06-01", open: 185_400, total: 185_400, reference: "CHQ-5567" },
  { id: "PMT-3402", type: "Payment", party: "Nepal Electricity Authority", dateISO: "2026-06-06", open: 342_000, total: 742_000, reference: "BILL-44120" },
  { id: "PMT-3399", type: "Payment", party: "Gandaki Auto Parts", dateISO: "2026-06-12", open: 124_600, total: 124_600, reference: "CHQ-5571" },
  { id: "JE-5571", type: "Journal Entry", party: null, dateISO: "2026-06-11", open: 28_900, total: 28_900, reference: "INT-0601" },
  { id: "JE-5569", type: "Journal Entry", party: null, dateISO: "2026-06-13", open: 390_000, total: 890_000, reference: "PAYR-06" },
  { id: "PMT-3405", type: "Payment", party: "Janaki Textiles", dateISO: "2026-06-08", open: 58_750, total: 58_750, reference: null },
  { id: "RCPT-7801", type: "Customer Receipt", party: "Optima LLC", dateISO: "2026-06-08", open: 12_500, total: 12_500, reference: "SWIFT-55120" },
];

const VOUCHER_SIDE: Record<string, "in" | "out" | "any"> = { "Sales Invoice": "in", "Customer Receipt": "in", "Purchase Invoice": "out", Payment: "out", "Journal Entry": "any" };
const TYPE_SHORT: Record<string, string> = { "Sales Invoice": "Invoice", "Customer Receipt": "Receipt", "Purchase Invoice": "Bill", Payment: "Payment", "Journal Entry": "Journal" };
const DOC_TYPES = ["Sales Invoice", "Purchase Invoice", "Payment", "Customer Receipt", "Journal Entry"] as const;

// reference lists for the create forms
const PARTIES = [
  { id: "p-everest", label: "Everest Hardware Supplies", sub: "Customer" },
  { id: "p-annapurna", label: "Annapurna Distributors", sub: "Customer" },
  { id: "p-sagarmatha", label: "Sagarmatha Steel Udyog", sub: "Customer" },
  { id: "p-shivam", label: "Shivam Cement Ltd", sub: "Supplier" },
  { id: "p-gandaki", label: "Gandaki Auto Parts", sub: "Supplier" },
  { id: "p-nea", label: "Nepal Electricity Authority", sub: "Supplier" },
  { id: "p-optima", label: "Optima LLC", sub: "Customer" },
];
const LEDGERS = [
  { id: "l-ar", label: "Accounts Receivable", sub: "1200 · Asset" },
  { id: "l-sales", label: "Sales Revenue", sub: "4000 · Income" },
  { id: "l-bankchg", label: "Bank Charges", sub: "6120 · Expense" },
  { id: "l-interest", label: "Interest Income", sub: "4200 · Income" },
  { id: "l-suspense", label: "Suspense", sub: "9990 · Control" },
];
const ENTITY_TYPES = [
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
  { value: "employee", label: "Employee" },
];

// ── derivations ──

const allocatedOf = (t: BankTxn) => t.allocations.reduce((s, a) => s + a.amount, 0);
const remainingOf = (t: BankTxn) => Math.abs(t.amount) - allocatedOf(t);
const isIn = (t: BankTxn) => t.amount >= 0;
type Status = "open" | "partial" | "done" | "cancelled";
function statusOf(t: BankTxn): Status {
  if (t.cancelled) return "cancelled";
  const a = allocatedOf(t);
  if (a <= EPSILON) return "open";
  if (a >= Math.abs(t.amount) - EPSILON) return "done";
  return "partial";
}

type Match = { v: Voucher; stars: number; reasons: string[] };
function matchOf(v: Voucher, t: BankTxn): Match {
  const reasons: string[] = [];
  let s = 1;
  const rem = remainingOf(t);
  if (Math.abs(v.open - rem) < EPSILON) { s += 2; reasons.push("Amount matches exactly"); }
  else if (rem > 0 && Math.abs(v.open - rem) / rem < 0.15) { s += 1; reasons.push("Amount is close"); }
  if (t.party && v.party === t.party) { s += 1; reasons.push("Same party"); }
  if (t.reference && v.reference === t.reference) { s += 1; reasons.push("Reference matches"); }
  if (reasons.length === 0) reasons.push("Same direction");
  return { v, stars: Math.min(5, s), reasons };
}
type CandFilters = { types: Record<string, boolean>; exactOnly: boolean; samePartyOnly: boolean };
function candidatesFor(t: BankTxn, f: CandFilters): Match[] {
  const dir = isIn(t) ? "in" : "out";
  const rem = remainingOf(t);
  return VOUCHER_POOL.filter((v) => {
    const side = VOUCHER_SIDE[v.type] ?? "any";
    if (side !== "any" && side !== dir) return false;
    if (!f.types[v.type]) return false;
    if (f.samePartyOnly && v.party !== t.party) return false;
    if (f.exactOnly && Math.abs(v.open - rem) >= EPSILON) return false;
    return true;
  })
    .map((v) => matchOf(v, t))
    .sort((a, b) => b.stars - a.stars || b.v.open - a.v.open);
}
function suggestionFor(t: BankTxn): Voucher | null {
  if (statusOf(t) !== "open") return null;
  const rem = remainingOf(t);
  const dir = isIn(t) ? "in" : "out";
  return (
    VOUCHER_POOL.find((x) => {
      const side = VOUCHER_SIDE[x.type] ?? "any";
      if (side !== "any" && side !== dir) return false;
      return !!t.reference && x.reference === t.reference && Math.abs(x.open - rem) < EPSILON;
    }) ?? null
  );
}

// ════════════════════════════════════════════════════════════════════════════
// hooks + atoms
// ════════════════════════════════════════════════════════════════════════════

function useTimers() {
  const ref = React.useRef<number[]>([]);
  React.useEffect(() => () => { ref.current.forEach(window.clearTimeout); ref.current = []; }, []);
  return { later: (ms: number, fn: () => void) => ref.current.push(window.setTimeout(fn, ms)) };
}
function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => { const h = window.setTimeout(() => setV(value), ms); return () => window.clearTimeout(h); }, [value, ms]);
  return v;
}

type ToastItem = { id: number; kind: "success" | "warning"; message: string; undo?: () => void };
function useToasts() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);
  const dismiss = React.useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = React.useCallback((kind: "success" | "warning", message: string, undo?: () => void) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-2), { id, kind, message, undo }]);
  }, []);
  return { toasts, push, dismiss };
}
function Toaster({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => <ToastRow key={t.id} toast={t} dismiss={dismiss} />)}
    </div>
  );
}
function ToastRow({ toast, dismiss }: { toast: ToastItem; dismiss: (id: number) => void }) {
  const { id } = toast;
  React.useEffect(() => {
    const h = window.setTimeout(() => dismiss(id), toast.undo ? 6000 : 4200);
    return () => window.clearTimeout(h);
  }, [id, dismiss, toast.undo]);
  const ok = toast.kind === "success";
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-bz-pill border border-bz-line-soft bg-bz-surface px-4 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
      <span className={cn("size-1.5 rounded-bz-pill", ok ? "bg-bz-leaf-deep" : "bg-[#C0413A]")} />
      <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
      {toast.undo && (
        <button onClick={() => { toast.undo?.(); dismiss(id); }} className="ml-1 inline-flex items-center gap-1 rounded-bz-pill border border-bz-line-soft px-2.5 py-1 text-[11px] font-semibold text-bz-text hover:bg-bz-paper-warm">
          <RotateCcw size={11} /> Undo
        </button>
      )}
      <button onClick={() => dismiss(id)} aria-label="Dismiss" className="text-bz-text-soft hover:text-bz-text"><X size={12} /></button>
    </div>
  );
}

function Switch({ value, onChange, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; ariaLabel?: string }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={ariaLabel} onClick={() => onChange(!value)}
      className={cn("relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors", value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line")}>
      <span className={cn("pointer-events-none absolute size-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform", value ? "translate-x-[14px]" : "translate-x-[2px]")} />
    </button>
  );
}

const STATUS_CHIP: Record<Status, { label: string; cls: string; dot: string }> = {
  done: { label: "Reconciled", cls: "bg-bz-fire/[0.18] text-bz-text", dot: "bg-bz-leaf-deep" },
  partial: { label: "Partial", cls: "bg-bz-leaf/50 text-bz-text", dot: "bg-bz-fire" },
  open: { label: "Unreconciled", cls: "bg-bz-paper-warm text-bz-text-muted", dot: "bg-bz-text-soft" },
  cancelled: { label: "Cancelled", cls: "bg-[#FBE5E2] text-[#9A2E29]", dot: "bg-[#C0413A]" },
};
function StatusChip({ status }: { status: Status }) {
  const s = STATUS_CHIP[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", s.cls)}>
      <span className={cn("size-1.5 shrink-0 rounded-bz-pill", s.dot)} />{s.label}
    </span>
  );
}

function DirBadge({ credit }: { credit: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-bz-sm px-1.5 py-0.5 text-[10.5px] font-semibold", credit ? "bg-bz-fire/[0.16] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>
      {credit ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}{credit ? "Deposit" : "Withdrawal"}
    </span>
  );
}

function Stars({ n, reasons }: { n: number; reasons: string[] }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={reasons.join(" · ")}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} strokeWidth={2} className={i < n ? "fill-bz-fire text-bz-fire" : "text-bz-line"} />
      ))}
    </span>
  );
}

// portal single-select — placeholder ("select…"), type-ahead, outside/esc close,
// and (with no placeholder) auto-selects the first option once data arrives.
type Opt = { id: string; label: string; sub?: string };
function EntitySelect({ value, onChange, options, placeholder, width = 260, disabled, className }: { value: string | null; onChange: (id: string) => void; options: Opt[]; placeholder?: string; width?: number; disabled?: boolean; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const popRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; w: number } | null>(null);

  React.useEffect(() => { if (!placeholder && value == null && options.length) onChange(options[0].id); }, [placeholder, value, options, onChange]);

  const current = options.find((o) => o.id === value) ?? null;
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter((o) => o.label.toLowerCase().includes(s) || (o.sub ?? "").toLowerCase().includes(s));
  }, [options, q]);

  React.useLayoutEffect(() => {
    if (!open || !btnRef.current) { setPos(null); return; }
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, w: Math.max(width, r.width) });
  }, [open, width]);
  React.useEffect(() => {
    if (!open) return;
    setQ("");
    const onDown = (e: MouseEvent) => { const t = e.target as Node; if (popRef.current && !popRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <>
      <button ref={btnRef} type="button" disabled={disabled} onClick={() => setOpen((o) => !o)}
        className={cn("flex h-8 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-left text-[12.5px] outline-none hover:border-bz-line focus:border-bz-text disabled:opacity-50", className)}>
        <span className={cn("min-w-0 flex-1 truncate", current ? "text-bz-text" : "text-bz-text-soft")}>{current ? current.label : placeholder ?? "Select…"}</span>
        <ChevronDown size={13} className={cn("shrink-0 text-bz-text-soft transition-transform", open && "rotate-180")} />
      </button>
      {open && pos && createPortal(
        <div ref={popRef} style={{ position: "fixed", top: pos.top, left: Math.max(8, pos.left), width: pos.w }} className="z-[95] overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_20px_50px_-24px_rgba(15,20,17,0.3)]">
          <div className="flex items-center gap-2 border-b border-bz-line-soft px-2.5 py-1.5">
            <Search size={13} className="text-bz-text-soft" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-6 w-full bg-transparent text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft" />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {placeholder && (
              <button onClick={() => { onChange(""); setOpen(false); }} className="flex w-full items-center px-3 py-2 text-left text-[12.5px] text-bz-text-soft hover:bg-bz-paper-warm">{placeholder}</button>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-[11.5px] text-bz-text-soft">No matches.</p>
            ) : filtered.map((o) => (
              <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm", o.id === value && "bg-bz-fire/[0.06]")}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-bz-text">{o.label}</span>
                  {o.sub && <span className="block truncate text-[10.5px] text-bz-text-soft">{o.sub}</span>}
                </span>
                {o.id === value && <Check size={13} className="shrink-0 text-bz-text" />}
              </button>
            ))}
          </div>
        </div>, document.body,
      )}
    </>
  );
}

type SegOpt = { value: string; label: string; icon?: React.ReactNode };
function Segmented({ options, value, onChange, size = "md", className }: { options: SegOpt[]; value: string; onChange: (v: string) => void; size?: "sm" | "md"; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5", className)}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={cn("inline-flex items-center gap-1.5 rounded-bz-sm font-medium transition-colors", size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[12px]",
            value === o.value ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.08)]" : "text-bz-text-muted hover:text-bz-text")}>
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}

// small primary / ghost buttons
function Primary({ children, onClick, disabled, busy, className }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; busy?: boolean; className?: string }) {
  return (
    <button onClick={onClick} disabled={disabled || busy} className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-pill bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-45", className)}>
      {busy && <Loader2 size={13} className="animate-spin" />}{children}
    </button>
  );
}
function Ghost({ children, onClick, disabled, className, tone }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string; tone?: "default" | "danger" }) {
  return (
    <button onClick={onClick} disabled={disabled} className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-pill border bg-bz-surface px-3.5 text-[12.5px] font-medium hover:bg-bz-paper-warm disabled:opacity-45",
      tone === "danger" ? "border-[#E7C9C4] text-[#9A2E29] hover:bg-[#FBE7E5]" : "border-bz-line-soft text-bz-text", className)}>
      {children}
    </button>
  );
}

// labelled inputs for the create forms
function Labeled({ label, children, error }: { label: string; children: React.ReactNode; error?: boolean }) {
  return (
    <label className="block">
      <span className={cn("mb-1 block text-[10.5px] font-medium", error ? "text-[#9A2E29]" : "text-bz-text-soft")}>{label}</span>
      {children}
    </label>
  );
}
function TextInput({ value, onChange, placeholder, error }: { value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn("h-8 w-full rounded-bz-md border bg-bz-surface px-2.5 text-[12.5px] text-bz-text outline-none focus:border-bz-text", error ? "border-[#C0413A]" : "border-bz-line-soft")} />;
}
function MoneyInput({ value, onChange, ccy, error, className }: { value: string; onChange: (v: string) => void; ccy: string; error?: boolean; className?: string }) {
  return (
    <div className={cn("flex h-8 items-center rounded-bz-md border bg-bz-surface px-2 focus-within:border-bz-text", error ? "border-[#C0413A]" : "border-bz-line-soft", className)}>
      <span className="mr-1 shrink-0 text-[10px] text-bz-text-soft">{ccy}</span>
      <input value={value} inputMode="decimal" onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && onChange(e.target.value)} className={cn("h-full w-full bg-transparent text-right text-[12.5px] text-bz-text outline-none", NUM)} />
    </div>
  );
}
function DateField({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return <input type="date" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={cn("h-8 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2 text-[12px] text-bz-text outline-none focus:border-bz-text disabled:opacity-45", NUM)} />;
}

// ════════════════════════════════════════════════════════════════════════════
// SCOPE HEADER — the query-defining toolbar
// ════════════════════════════════════════════════════════════════════════════

type Scope = { accountId: string; dateMode: "posting" | "reference"; from: string; to: string };

function ScopeBar({ scope, onScope, onRefresh, onAuto, onImport, autoBusy, ccy }: {
  scope: Scope; onScope: (patch: Partial<Scope>) => void; onRefresh: () => void; onAuto: () => void; onImport: () => void; autoBusy: boolean; ccy: string | null;
}) {
  return (
    <div className="border-b border-bz-line bg-bz-paper">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-end gap-x-5 gap-y-3 px-4 py-3.5 md:px-6">
        <div className="min-w-[220px] flex-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Bank account</p>
          <div className="flex items-center gap-2">
            <Landmark size={15} className="shrink-0 text-bz-text-muted" />
            <EntitySelect value={scope.accountId} onChange={(id) => onScope({ accountId: id })} options={BANK_ACCOUNTS.map((a) => ({ id: a.id, label: a.name, sub: `${a.number} · ${a.currency}` }))} className="min-w-0 flex-1" width={300} />
            {ccy && <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-semibold text-bz-text-muted", NUM)}>{ccy}</span>}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Date window</p>
            <Segmented size="sm" value={scope.dateMode} onChange={(v) => onScope({ dateMode: v as Scope["dateMode"] })} options={[{ value: "posting", label: "Posting" }, { value: "reference", label: "Bank ref" }]} />
          </div>
          <div className="flex items-center gap-1.5">
            <DateField value={scope.from} onChange={(v) => onScope({ from: v })} />
            <span className="text-bz-text-soft">→</span>
            <DateField value={scope.to} onChange={(v) => onScope({ to: v })} />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 self-end">
          <button onClick={onRefresh} aria-label="Refresh" className="flex size-9 items-center justify-center rounded-bz-pill border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <RefreshCw size={14} />
          </button>
          <Ghost onClick={onAuto} disabled={autoBusy}>{autoBusy ? <Loader2 size={13} className="animate-spin text-bz-fire" /> : <Wand2 size={13} />} Auto-reconcile</Ghost>
          <Ghost onClick={onImport}><Upload size={13} /> Import statement</Ghost>
        </div>
      </div>
    </div>
  );
}

// ── balances strip + difference verdict ──

function EditableAmount({ value, ccy, onCommit }: { value: number | null; ccy: string; onCommit: (n: number) => void }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value == null ? "" : String(Math.round(value)));
  React.useEffect(() => setDraft(value == null ? "" : String(Math.round(value))), [value]);
  const commit = () => { const n = Number(draft); if (draft !== "" && n >= 0) onCommit(n); setEditing(false); };
  if (editing) return (
    <span className="flex h-7 w-40 items-center rounded-bz-sm border border-bz-text bg-bz-surface px-1.5">
      <span className="mr-1 text-[10px] text-bz-text-soft">{ccy}</span>
      <input autoFocus value={draft} inputMode="decimal" onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()} className={cn("h-full w-full bg-transparent text-right text-[15px] font-semibold text-bz-text outline-none", NUM)} />
    </span>
  );
  return (
    <button onClick={() => setEditing(true)} className={cn("border-b border-dashed border-bz-text-soft/60 text-[15px] font-semibold text-bz-text hover:border-bz-fire", NUM)}>
      {value == null ? "—" : money(value, ccy)}
    </button>
  );
}

function BalancesBar({ opening, cleared, stmtClosing, onCommitClosing, loading, ccy, fromISO }: {
  opening: number; cleared: number; stmtClosing: number | null; onCommitClosing: (n: number) => void; loading: boolean; ccy: string; fromISO: string;
}) {
  const difference = stmtClosing != null ? stmtClosing - cleared : 0;
  const balanced = Math.abs(difference) < EPSILON;
  const openDay = (() => { const d = new Date(fromISO); d.setDate(d.getDate() - 1); return fmtFull(d.toISOString().slice(0, 10)); })();
  const Val = ({ children }: { children: React.ReactNode }) => loading ? <span className="mt-1 block h-4 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm" /> : <span className={cn("mt-1 block text-[15px] font-semibold text-bz-text", NUM)}>{children}</span>;
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pt-4 md:px-6">
      <div className="flex flex-wrap items-stretch gap-x-8 gap-y-4 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-5 py-3.5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Opening balance</p>
          <Val>{money(opening, ccy)}</Val>
          <p className="mt-0.5 text-[10px] text-bz-text-soft">as of {openDay}</p>
        </div>
        <span className="hidden w-px self-stretch bg-bz-line-soft sm:block" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Cleared per books</p>
          <Val>{money(cleared, ccy)}</Val>
          <p className="mt-0.5 text-[10px] text-bz-text-soft">opening + reconciled movement</p>
        </div>
        <span className="hidden w-px self-stretch bg-bz-line-soft sm:block" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Statement closing</p>
          <div className="mt-1">{loading ? <span className="block h-4 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm" /> : <EditableAmount value={stmtClosing} ccy={ccy} onCommit={onCommitClosing} />}</div>
          <p className="mt-0.5 text-[10px] text-bz-text-soft">from your bank statement</p>
        </div>
        {!loading && stmtClosing != null && (
          <>
            <span className="hidden w-px self-stretch bg-bz-line-soft sm:block" />
            <div className={cn("ml-auto flex min-w-[180px] flex-col justify-center rounded-bz-md px-4 py-2", balanced ? "bg-bz-fire/[0.12]" : "bg-[#FBE7E5]")}>
              <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold", balanced ? "text-bz-text" : "text-[#9A2E29]")}>
                {balanced ? <><CheckCircle2 size={13} className="text-bz-leaf-deep" /> Reconciliation complete</> : <>Statement does not match</>}
              </span>
              <span className={cn("text-[16px] font-semibold", NUM, balanced ? "text-bz-text" : "text-[#9A2E29]")}>{balanced ? money(0, ccy) : signed(difference, ccy)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WORKING LIST (master) — the queue
// ════════════════════════════════════════════════════════════════════════════

type ListScope = "unrec" | "partial" | "all";

function WorkList({ rows, loading, hasAccount, focusedId, onFocus, checked, onToggleCheck, search, onSearch, scope, onScope, ccy, summary }: {
  rows: BankTxn[]; loading: boolean; hasAccount: boolean; focusedId: string | null; onFocus: (id: string) => void;
  checked: Set<string>; onToggleCheck: (id: string) => void; search: string; onSearch: (v: string) => void;
  scope: ListScope; onScope: (s: ListScope) => void; ccy: string; summary: { unrec: number; partial: number; unallocated: number };
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface lg:h-full">
      {/* toolbar */}
      <div className="border-b border-bz-line-soft p-3">
        <div className="flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/60 px-2.5">
          <Search size={14} className="shrink-0 text-bz-text-soft" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search description, reference, party…" className="h-8 w-full bg-transparent text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft" />
          {search && <button onClick={() => onSearch("")} className="text-bz-text-soft hover:text-bz-text"><X size={13} /></button>}
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <Segmented size="sm" value={scope} onChange={(v) => onScope(v as ListScope)} options={[{ value: "unrec", label: "Unreconciled" }, { value: "partial", label: "Partial" }, { value: "all", label: "All" }]} />
          <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{rows.length} line{rows.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* rows */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!hasAccount ? (
          <Empty icon={<Landmark size={20} />} title="Choose a bank account" body="Pick an account and date window above to load its statement lines." />
        ) : loading ? (
          <ListSkeleton />
        ) : rows.length === 0 ? (
          <Empty icon={<CheckCircle2 size={20} className="text-bz-leaf-deep" />} title={search || scope !== "all" ? "No matching lines" : "All caught up"} body={search || scope !== "all" ? "Try a different search or status filter." : "Every line in this window is reconciled."} />
        ) : (
          rows.map((t) => (
            <TxnRow key={t.id} txn={t} ccy={ccy} focused={focusedId === t.id} checked={checked.has(t.id)} onFocus={() => onFocus(t.id)} onToggleCheck={() => onToggleCheck(t.id)} />
          ))
        )}
      </div>

      {/* footer summary */}
      {hasAccount && !loading && rows.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-bz-line-soft px-4 py-2.5 text-[11px]">
          <span className="text-bz-text-muted"><span className={cn("font-semibold text-bz-text", NUM)}>{summary.unrec}</span> unreconciled · <span className={cn("font-semibold text-bz-text", NUM)}>{summary.partial}</span> partial</span>
          <span className="text-bz-text-soft">Unallocated <span className={cn("font-semibold text-bz-text", NUM)}>{money(summary.unallocated, ccy)}</span></span>
        </div>
      )}
    </section>
  );
}

function TxnRow({ txn, ccy, focused, checked, onFocus, onToggleCheck }: { txn: BankTxn; ccy: string; focused: boolean; checked: boolean; onFocus: () => void; onToggleCheck: () => void }) {
  const status = statusOf(txn);
  const credit = isIn(txn);
  const sub = status === "partial"
    ? <span className={NUM}>{grp(remainingOf(txn))} of {grp(Math.abs(txn.amount))} unallocated</span>
    : status === "cancelled" ? "cancelled" : (txn.reference ?? txn.party ?? "no reference");
  return (
    <div className={cn("group relative flex items-center gap-3 border-b border-bz-line-soft/70 pl-2 pr-3 transition-colors", focused ? "bg-bz-fire/[0.07]" : "hover:bg-bz-paper-warm/50")}>
      {focused && <span className="absolute inset-y-0 left-0 w-0.5 bg-bz-fire" />}
      <button onClick={(e) => { e.stopPropagation(); onToggleCheck(); }} aria-label="Select for batch" className="flex size-8 shrink-0 items-center justify-center">
        <span className={cn("flex size-4 items-center justify-center rounded-[5px] border transition-colors", checked ? "border-bz-fire bg-bz-fire text-bz-text" : "border-bz-line group-hover:border-bz-text-soft")}>
          {checked && <Check size={11} strokeWidth={3} />}
        </span>
      </button>
      <button onClick={onFocus} className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left">
        <span className={cn("w-11 shrink-0 text-[11px] text-bz-text-soft", NUM)}>{fmtDay(txn.dateISO)}</span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-[13px] text-bz-text", status === "cancelled" && "text-bz-text-soft line-through")}>{txn.description}</span>
          <span className="mt-0.5 block truncate text-[10.5px] text-bz-text-soft">{sub}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className={cn("text-[13px] font-medium", NUM, credit ? "text-bz-leaf-deep" : "text-bz-text")}>{credit ? "" : "−"}{grp(txn.amount)}</span>
          <StatusChip status={status} />
        </span>
      </button>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-bz-line-soft/70 px-4 py-3.5">
          <span className="size-4 shrink-0 animate-pulse rounded-[5px] bg-bz-paper-warm" />
          <span className="h-3 w-9 shrink-0 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <span className="h-3 flex-1 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <span className="h-3 w-16 shrink-0 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
        </div>
      ))}
    </div>
  );
}
function Empty({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted">{icon}</div>
      <p className="text-[13px] font-semibold text-bz-text">{title}</p>
      <p className="mt-1 max-w-[240px] text-[11.5px] text-bz-text-soft">{body}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FOCUS PANEL (detail) — mode switcher + the three working modes
// ════════════════════════════════════════════════════════════════════════════

type WorkMode = "match" | "create" | "details";

function FocusPanel({ txn, ccy, mode, onMode, onBackMobile, onReconcile, onUnreconcile, onCreate, onReverse, onCancel, nextVoucherId }: {
  txn: BankTxn | null; ccy: string; mode: WorkMode; onMode: (m: WorkMode) => void; onBackMobile: () => void;
  onReconcile: (allocs: { voucher: string; type: string; amount: number }[]) => void; onUnreconcile: () => void;
  onCreate: (voucher: string, type: string, amount: number) => void; onReverse: (allocId: string) => void; onCancel: (reason: string) => void; nextVoucherId: (p: string) => string;
}) {
  if (!txn) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-bz-lg border border-dashed border-bz-line bg-bz-surface px-6 text-center">
        <div className="mb-3 flex size-11 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted"><ArrowLeftRight size={19} /></div>
        <p className="text-[13px] font-semibold text-bz-text">Pick a transaction to reconcile</p>
        <p className="mt-1 max-w-[260px] text-[11.5px] text-bz-text-soft">Select a line from the list to match it to vouchers, create a new voucher, or inspect its reconciliation.</p>
      </section>
    );
  }
  const credit = isIn(txn);
  const status = statusOf(txn);
  return (
    <section className="flex min-h-0 flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      {/* focused summary header */}
      <div className="border-b border-bz-line-soft p-4">
        <div className="flex items-start gap-3">
          <button onClick={onBackMobile} className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md border border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm lg:hidden" aria-label="Back to list"><ChevronLeft size={15} /></button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{txn.id}</span>
              <span className="text-[11px] text-bz-text-soft">·</span>
              <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{fmtFull(txn.dateISO)}</span>
              <DirBadge credit={credit} />
              <StatusChip status={status} />
            </div>
            <p className="mt-1 truncate text-[13px] text-bz-text">{txn.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className={cn("text-[17px] font-semibold", NUM, credit ? "text-bz-leaf-deep" : "text-bz-text")}>{credit ? "" : "−"}{money(txn.amount, ccy)}</p>
            {allocatedOf(txn) > EPSILON && <p className={cn("text-[10.5px] text-bz-text-soft", NUM)}>{money(remainingOf(txn), ccy)} unallocated</p>}
          </div>
        </div>
        <div className="mt-3">
          <Segmented value={mode} onChange={(m) => onMode(m as WorkMode)} options={[
            { value: "match", label: "Match", icon: <Link2 size={13} /> },
            { value: "create", label: "Create", icon: <Plus size={13} /> },
            { value: "details", label: "Details", icon: <FileText size={13} /> },
          ]} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {mode === "match" && <MatchMode key={txn.id} txn={txn} ccy={ccy} onReconcile={onReconcile} onUnreconcile={onUnreconcile} />}
        {mode === "create" && <CreateMode key={txn.id} txn={txn} ccy={ccy} onCreate={onCreate} nextVoucherId={nextVoucherId} />}
        {mode === "details" && <DetailsMode key={txn.id} txn={txn} ccy={ccy} onReverse={onReverse} onCancel={onCancel} />}
      </div>
    </section>
  );
}

// ── MATCH MODE ──

const ALL_TYPES_ON = (): Record<string, boolean> => Object.fromEntries(DOC_TYPES.map((t) => [t, true]));

function MatchMode({ txn, ccy, onReconcile, onUnreconcile }: { txn: BankTxn; ccy: string; onReconcile: (a: { voucher: string; type: string; amount: number }[]) => void; onUnreconcile: () => void }) {
  const [filters, setFilters] = React.useState<CandFilters>({ types: ALL_TYPES_ON(), exactOnly: false, samePartyOnly: false });
  const [showFilters, setShowFilters] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [cands, setCands] = React.useState<Match[]>([]);
  const [sel, setSel] = React.useState<Record<string, string>>({}); // voucherId -> alloc string
  const [submitting, setSubmitting] = React.useState(false);

  // fetch (and re-fetch on filter change) — discards any in-progress selection
  React.useEffect(() => {
    setLoading(true);
    setSel({});
    const h = window.setTimeout(() => { setCands(candidatesFor(txn, filters)); setLoading(false); }, 420);
    return () => window.clearTimeout(h);
  }, [txn, filters]);

  const existing = allocatedOf(txn);
  const selectedNew = Object.entries(sel);
  const totalNew = selectedNew.reduce((s, [, v]) => s + (Number(v) || 0), 0);
  const remaining = Math.abs(txn.amount) - existing - totalNew;
  const remTone = Math.abs(remaining) < EPSILON ? "ok" : remaining > 0 ? "under" : "over";

  const toggle = (m: Match) => {
    setSel((prev) => {
      if (prev[m.v.id] != null) { const n = { ...prev }; delete n[m.v.id]; return n; }
      const already = Object.entries(prev).reduce((s, [, v]) => s + (Number(v) || 0), 0);
      const remNow = Math.abs(txn.amount) - existing - already;
      const fill = Math.max(0, Math.min(m.v.open, remNow));
      return { ...prev, [m.v.id]: String(Math.round(fill)) };
    });
  };
  const editAlloc = (m: Match, raw: string) => {
    if (!/^\d*\.?\d*$/.test(raw)) return;
    setSel((prev) => ({ ...prev, [m.v.id]: raw }));
  };

  const boundsOk = selectedNew.every(([id, v]) => { const c = cands.find((x) => x.v.id === id); const n = Number(v); return c && n >= 0 && n <= c.v.open + EPSILON; });
  const canReconcile = selectedNew.length > 0 && totalNew > EPSILON && existing + totalNew <= Math.abs(txn.amount) + EPSILON && boundsOk;

  const submit = () => {
    if (!canReconcile) return;
    setSubmitting(true);
    window.setTimeout(() => {
      onReconcile(selectedNew.map(([id, v]) => { const c = cands.find((x) => x.v.id === id)!; return { voucher: id, type: c.v.type, amount: Number(v) }; }));
    }, 480);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Matching vouchers</p>
        <button onClick={() => setShowFilters((s) => !s)} className={cn("inline-flex items-center gap-1.5 rounded-bz-pill border px-2.5 py-1 text-[11px] font-medium", showFilters ? "border-bz-text bg-bz-paper-warm text-bz-text" : "border-bz-line-soft text-bz-text-muted hover:text-bz-text")}>
          <SlidersHorizontal size={12} /> Refine
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Include document types</p>
          <div className="flex flex-wrap gap-1.5">
            {DOC_TYPES.map((dt) => (
              <button key={dt} onClick={() => setFilters((f) => ({ ...f, types: { ...f.types, [dt]: !f.types[dt] } }))}
                className={cn("rounded-bz-pill border px-2.5 py-1 text-[11px] font-medium transition-colors", filters.types[dt] ? "border-bz-fire bg-bz-fire/[0.14] text-bz-text" : "border-bz-line-soft text-bz-text-soft hover:text-bz-text")}>
                {TYPE_SHORT[dt] ?? dt}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-bz-line-soft pt-3">
            <label className="flex items-center justify-between gap-3"><span className="text-[12px] text-bz-text">Exact amount only</span><Switch value={filters.exactOnly} onChange={(v) => setFilters((f) => ({ ...f, exactOnly: v }))} ariaLabel="Exact amount only" /></label>
            <label className="flex items-center justify-between gap-3"><span className="text-[12px] text-bz-text">Same party only</span><Switch value={filters.samePartyOnly} onChange={(v) => setFilters((f) => ({ ...f, samePartyOnly: v }))} ariaLabel="Same party only" /></label>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-1.5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-bz-md bg-bz-paper-warm/70" />)}</div>
      ) : cands.length === 0 ? (
        <div className="rounded-bz-md border border-dashed border-bz-line px-4 py-8 text-center">
          <p className="text-[12.5px] font-medium text-bz-text">No candidate vouchers</p>
          <p className="mt-1 text-[11px] text-bz-text-soft">Loosen the filters, or switch to <span className="font-medium text-bz-text-muted">Create</span> to make a new voucher.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {cands.map((m) => {
            const picked = sel[m.v.id] != null;
            const consumed = m.v.total - m.v.open;
            const vin = (VOUCHER_SIDE[m.v.type] ?? "any") === "in";
            return (
              <div key={m.v.id} className={cn("rounded-bz-md border transition-colors", picked ? "border-bz-fire bg-bz-fire/[0.05]" : "border-bz-line-soft hover:border-bz-line")}>
                <button onClick={() => toggle(m)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
                  <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-[5px] border", picked ? "border-bz-fire bg-bz-fire text-bz-text" : "border-bz-line")}>{picked && <Check size={11} strokeWidth={3} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn("text-[12.5px] font-semibold text-bz-text", NUM)}>{m.v.id}</span>
                      <span className="text-[10.5px] text-bz-text-soft">{TYPE_SHORT[m.v.type] ?? m.v.type}</span>
                      <Stars n={m.stars} reasons={m.reasons} />
                    </span>
                    <span className="mt-0.5 block truncate text-[10.5px] text-bz-text-soft">{m.v.party ?? "No party"} · {consumed > EPSILON ? `${money(m.v.open, ccy)} of ${money(m.v.total, ccy)} available` : "fully available"}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className={cn("text-[12.5px] font-medium", NUM, vin ? "text-bz-leaf-deep" : "text-bz-text")}>{money(m.v.open, ccy)}</span>
                    <span className="block text-[10px] text-bz-text-soft">{vin ? "credits" : "debits"}</span>
                  </span>
                </button>
                {picked && (
                  <div className="flex items-center justify-between gap-3 border-t border-bz-fire/25 px-3 py-2">
                    <span className="text-[11px] text-bz-text-muted">Allocate <span className="text-bz-text-soft">(max {money(m.v.open, ccy)})</span></span>
                    <MoneyInput value={sel[m.v.id]} onChange={(v) => editAlloc(m, v)} ccy={ccy} className="w-36" error={Number(sel[m.v.id]) > m.v.open + EPSILON} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* running math */}
      {(selectedNew.length > 0 || existing > EPSILON) && (
        <div className="mt-4 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 p-3">
          {existing > EPSILON && <Row label="Already allocated" value={money(existing, ccy)} />}
          <Row label={`Selected (${selectedNew.length})`} value={money(totalNew, ccy)} />
          <div className="mt-1.5 flex items-center justify-between border-t border-bz-line-soft pt-2">
            <span className={cn("text-[12px] font-semibold", remTone === "ok" ? "text-bz-text" : "text-[#9A2E29]")}>{remTone === "over" ? "Over-allocated by" : remTone === "under" ? "Remaining" : "Balanced"}</span>
            <span className={cn("text-[13px] font-semibold", NUM, remTone === "ok" ? "text-bz-leaf-deep" : "text-[#9A2E29]")}>{remTone === "ok" ? money(0, ccy) : money(remaining, ccy)}</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        {existing > EPSILON ? (
          <button onClick={onUnreconcile} className="text-[11.5px] font-medium text-bz-text-soft hover:text-[#9A2E29]">Unreconcile everything</button>
        ) : <span />}
        <Primary onClick={submit} disabled={!canReconcile} busy={submitting}><Check size={14} strokeWidth={2.5} /> Reconcile</Primary>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between py-0.5 text-[12px]"><span className="text-bz-text-muted">{label}</span><span className={cn("text-bz-text", NUM)}>{value}</span></div>;
}

// ── CREATE MODE ──

type CreateKind = "receipt" | "check" | "journal" | "transfer";
const KIND_META: Record<CreateKind, { label: string; icon: React.ReactNode; type: string; prefix: string }> = {
  receipt: { label: "Receipt", icon: <Receipt size={13} />, type: "Customer Receipt", prefix: "RCPT" },
  check: { label: "Check", icon: <PenLine size={13} />, type: "Payment", prefix: "PMT" },
  journal: { label: "Journal", icon: <FileText size={13} />, type: "Journal Entry", prefix: "JE" },
  transfer: { label: "Transfer", icon: <ArrowLeftRight size={13} />, type: "Internal Transfer", prefix: "TRF" },
};

function findCounterpart(txn: BankTxn): BankTxn | null {
  return SEED_TXNS.find((o) => o.accountId !== txn.accountId && Math.sign(o.amount) === -Math.sign(txn.amount) && Math.abs(Math.abs(o.amount) - Math.abs(txn.amount)) < EPSILON && (o.reference === txn.reference || !txn.reference)) ?? null;
}

function CreateMode({ txn, ccy, onCreate, nextVoucherId }: { txn: BankTxn; ccy: string; onCreate: (voucher: string, type: string, amount: number) => void; nextVoucherId: (p: string) => string }) {
  const credit = isIn(txn);
  const [kind, setKind] = React.useState<CreateKind>(credit ? "receipt" : "check");
  const rem = Math.round(remainingOf(txn));

  // shared prefilled fields
  const [amount, setAmount] = React.useState(String(rem));
  const [date, setDate] = React.useState(txn.dateISO);
  const [memo, setMemo] = React.useState(txn.description);
  const [party, setParty] = React.useState<string | null>(PARTIES.find((p) => p.label === txn.party)?.id ?? null);
  const [ledger, setLedger] = React.useState<string | null>(credit ? "l-ar" : null);
  const [entityType, setEntityType] = React.useState("supplier");
  const [touched, setTouched] = React.useState(false);

  // transfer sides — the known account seeds onto the correct side
  const other = React.useMemo(() => (kind === "transfer" ? findCounterpart(txn) : null), [kind, txn]);
  const [fromAcc, setFromAcc] = React.useState<string | null>(credit ? null : txn.accountId);
  const [toAcc, setToAcc] = React.useState<string | null>(credit ? txn.accountId : null);
  React.useEffect(() => {
    if (kind !== "transfer" || !other) return;
    if (credit && fromAcc == null) setFromAcc(other.accountId);
    if (!credit && toAcc == null) setToAcc(other.accountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, other]);

  const amt = Number(amount);
  const amtErr = touched && !(amt > 0);
  const needParty = kind === "receipt" || kind === "check";
  const needLedger = kind === "receipt" || kind === "journal";
  const partyErr = touched && needParty && !party;
  const ledgerErr = touched && needLedger && !ledger;
  const transferErr = touched && kind === "transfer" && (!fromAcc || !toAcc || fromAcc === toAcc);
  const valid = amt > 0 && (!needParty || !!party) && (!needLedger || !!ledger) && (kind !== "transfer" || (!!fromAcc && !!toAcc && fromAcc !== toAcc));
  const [submitting, setSubmitting] = React.useState(false);

  const submit = () => {
    if (!valid) { setTouched(true); return; }
    setSubmitting(true);
    const meta = KIND_META[kind];
    window.setTimeout(() => onCreate(nextVoucherId(meta.prefix), meta.type, amt), 480);
  };

  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Create &amp; reconcile</p>
      <Segmented className="mb-4 flex-wrap" value={kind} onChange={(k) => { setKind(k as CreateKind); setTouched(false); }} options={(Object.keys(KIND_META) as CreateKind[]).map((k) => ({ value: k, label: KIND_META[k].label, icon: KIND_META[k].icon }))} />

      <div className="space-y-3">
        {kind === "check" && (
          <Labeled label="Entity type">
            <Segmented size="sm" value={entityType} onChange={setEntityType} options={ENTITY_TYPES} />
          </Labeled>
        )}
        {needParty && (
          <Labeled label={kind === "receipt" ? "Received from" : "Paid to"} error={partyErr}>
            <EntitySelect value={party} onChange={(v) => setParty(v || null)} options={PARTIES} placeholder="Select party…" className="w-full" />
          </Labeled>
        )}
        {kind === "receipt" && (
          <Labeled label="Receivable ledger" error={ledgerErr}>
            <EntitySelect value={ledger} onChange={(v) => setLedger(v || null)} options={LEDGERS} placeholder="Select ledger…" className="w-full" />
          </Labeled>
        )}
        {kind === "journal" && (
          <Labeled label="Contra ledger" error={ledgerErr}>
            <EntitySelect value={ledger} onChange={(v) => setLedger(v || null)} options={LEDGERS} placeholder="Select ledger…" className="w-full" />
          </Labeled>
        )}
        {kind === "transfer" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Labeled label="From account" error={transferErr}>
              <EntitySelect value={fromAcc} onChange={(v) => setFromAcc(v || null)} options={BANK_ACCOUNTS.map((a) => ({ id: a.id, label: a.name, sub: a.number }))} placeholder="Source…" className="w-full" />
            </Labeled>
            <Labeled label="To account" error={transferErr}>
              <EntitySelect value={toAcc} onChange={(v) => setToAcc(v || null)} options={BANK_ACCOUNTS.map((a) => ({ id: a.id, label: a.name, sub: a.number }))} placeholder="Destination…" className="w-full" />
            </Labeled>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Amount" error={amtErr}><MoneyInput value={amount} onChange={setAmount} ccy={ccy} error={amtErr} /></Labeled>
          <Labeled label="Date"><DateField value={date} onChange={setDate} /></Labeled>
        </div>
        <Labeled label="Memo"><TextInput value={memo} onChange={setMemo} /></Labeled>

        {kind === "transfer" && other && (
          <div className="flex items-start gap-2 rounded-bz-md border border-bz-line-soft bg-bz-fire/[0.06] px-3 py-2.5">
            <Info size={14} className="mt-0.5 shrink-0 text-bz-text-muted" />
            <p className="text-[11.5px] text-bz-text-muted">Matched counterpart <span className={cn("font-semibold text-bz-text", NUM)}>{other.id}</span> on {accountById(other.accountId)?.bank}. Both legs will reconcile together.</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Primary onClick={submit} busy={submitting}><Plus size={14} /> Create &amp; reconcile</Primary>
      </div>
    </div>
  );
}

// ── DETAILS MODE ──

function DetailsMode({ txn, ccy, onReverse, onCancel }: { txn: BankTxn; ccy: string; onReverse: (allocId: string) => void; onCancel: (reason: string) => void }) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => { setLoading(true); const h = window.setTimeout(() => setLoading(false), 460); return () => window.clearTimeout(h); }, [txn.id]);

  const status = statusOf(txn);
  const credit = isIn(txn);
  const locked = status === "done" || status === "cancelled";
  const hints = txn.hints && (txn.hints.counterparty || txn.hints.bankRef || txn.hints.channel) ? txn.hints : null;

  const reverse = (a: Allocation) => { if (window.confirm(`Reverse ${a.voucher} (${money(a.amount, ccy)})? This unlinks it from ${txn.id}.`)) onReverse(a.id); };
  const cancel = () => { const r = window.prompt("Void this transaction — type a reason:"); if (r && r.trim()) onCancel(r.trim()); };

  return (
    <div>
      {locked && (
        <div className={cn("mb-4 flex items-start gap-2 rounded-bz-md border px-3 py-2.5", status === "cancelled" ? "border-[#E7C9C4] bg-[#FBE7E5]" : "border-bz-line-soft bg-bz-fire/[0.06]")}>
          {status === "cancelled" ? <Ban size={14} className="mt-0.5 shrink-0 text-[#9A2E29]" /> : <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-bz-leaf-deep" />}
          <p className={cn("text-[11.5px]", status === "cancelled" ? "text-[#9A2E29]" : "text-bz-text-muted")}>
            {status === "cancelled" ? <>This transaction was voided. <span className="font-medium">{txn.cancelReason}</span></> : <>Fully reconciled. Reverse a linked voucher below to make changes.</>}
          </p>
        </div>
      )}

      {/* read-only summary */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3.5">
        <Field label="Document" value={txn.id} />
        <Field label="Date" value={fmtFull(txn.dateISO)} />
        <Field label="Type" node={<DirBadge credit={credit} />} />
        <Field label="Amount" value={`${credit ? "" : "−"}${money(txn.amount, ccy)}`} strong />
        <Field label="Reference" value={txn.reference ?? "—"} />
        <Field label="Party" value={txn.party ?? "—"} />
        <Field label="Allocated" value={money(allocatedOf(txn), ccy)} />
        <Field label="Unallocated" value={money(remainingOf(txn), ccy)} />
        <div className="col-span-2"><Field label="Description" value={txn.description} /></div>
      </div>

      {/* bank-statement hints — only when present */}
      {hints && (
        <div className="mt-3 rounded-bz-md border border-bz-line-soft p-3.5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Bank statement hints</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {hints.counterparty && <Field label="Counterparty" value={hints.counterparty} />}
            {hints.bankRef && <Field label="Bank reference" value={hints.bankRef} />}
            {hints.channel && <Field label="Channel" value={hints.channel} />}
          </div>
        </div>
      )}

      {/* linked vouchers */}
      <div className="mt-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-bz-text-soft">Linked vouchers</p>
        {loading ? (
          <div className="space-y-1.5">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-11 animate-pulse rounded-bz-md bg-bz-paper-warm/70" />)}</div>
        ) : txn.allocations.length === 0 ? (
          <p className="rounded-bz-md border border-dashed border-bz-line px-4 py-6 text-center text-[11.5px] text-bz-text-soft">No vouchers linked yet.</p>
        ) : (
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
            {txn.allocations.map((a, i) => (
              <div key={a.id} className={cn("flex items-center gap-3 px-3 py-2.5", i > 0 && "border-t border-bz-line-soft")}>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn("text-[12.5px] font-semibold text-bz-text", NUM)}>{a.voucher}</span>
                    <span className={cn("rounded-bz-sm px-1.5 py-0.5 text-[10px] font-medium", a.origin === "created" ? "bg-bz-leaf/50 text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>{a.origin === "created" ? "Voucher created" : "Matched"}</span>
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-bz-text-soft">{TYPE_SHORT[a.voucherType] ?? a.voucherType}</span>
                </span>
                <span className={cn("text-[12.5px] font-medium text-bz-text", NUM)}>{money(a.amount, ccy)}</span>
                <button onClick={() => reverse(a)} disabled={status === "cancelled"} className="inline-flex items-center gap-1 rounded-bz-pill border border-bz-line-soft px-2 py-1 text-[10.5px] font-medium text-bz-text-muted hover:text-[#9A2E29] disabled:opacity-40" aria-label={`Reverse ${a.voucher}`}>
                  <RotateCcw size={11} /> Reverse
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {status !== "cancelled" && (
        <div className="mt-4 flex justify-end border-t border-bz-line-soft pt-4">
          <Ghost tone="danger" onClick={cancel}><Ban size={13} /> Void transaction</Ghost>
        </div>
      )}
    </div>
  );
}
function Field({ label, value, node, strong }: { label: string; value?: string; node?: React.ReactNode; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">{label}</p>
      {node ? <div className="mt-1">{node}</div> : <p className={cn("mt-0.5 truncate text-[12.5px]", strong ? "font-semibold text-bz-text" : "text-bz-text", NUM)}>{value}</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BATCH BAR (docked in the overlay slot — only when ≥ 2 checked)
// ════════════════════════════════════════════════════════════════════════════

function BatchBar({ checkedTxns, posting, onClear, onCreateReceipts, onTransfer }: {
  checkedTxns: BankTxn[]; posting: boolean; onClear: () => void; onCreateReceipts: () => void; onTransfer: () => void;
}) {
  if (checkedTxns.length < 2) return null;
  const allIn = checkedTxns.every((t) => isIn(t));
  const allOut = checkedTxns.every((t) => !isIn(t));
  const shape = allIn ? "All money-in" : allOut ? "All money-out" : "Mixed directions";
  const accounts = new Set(checkedTxns.map((t) => t.accountId));
  const transferOk = checkedTxns.length === 2 && accounts.size === 2 && Math.abs(Math.abs(checkedTxns[0].amount) - Math.abs(checkedTxns[1].amount)) < EPSILON && Math.sign(checkedTxns[0].amount) !== Math.sign(checkedTxns[1].amount);

  return (
    <div className="border-t border-bz-line bg-bz-olive text-bz-text-on-dark">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-fire px-2.5 py-0.5 text-[11px] font-semibold text-bz-text"><span className={NUM}>{checkedTxns.length}</span> selected</span>
          <span className="text-[11.5px] text-bz-text-on-dark-muted">{shape}{accounts.size > 1 ? ` · ${accounts.size} accounts` : ""}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <BatchBtn disabled={!allIn || posting} onClick={onCreateReceipts}><Receipt size={13} /> Create receipts</BatchBtn>
          <BatchBtn disabled={!transferOk || posting} onClick={onTransfer}><ArrowLeftRight size={13} /> Internal transfer</BatchBtn>
          {posting && <Loader2 size={15} className="animate-spin text-bz-fire" />}
          <button onClick={onClear} className="ml-1 inline-flex items-center gap-1 rounded-bz-pill px-2.5 py-1.5 text-[11.5px] font-medium text-bz-text-on-dark-muted hover:text-bz-text-on-dark"><X size={13} /> Clear</button>
        </div>
      </div>
    </div>
  );
}
function BatchBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="inline-flex h-8 items-center gap-1.5 rounded-bz-pill bg-bz-fire px-3 text-[12px] font-semibold text-bz-text hover:opacity-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-bz-text-on-dark-muted">
      {children}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

const LS_KEY = "bz.bankRecon.scope.v2";
const LS_CLOSING = "bz.bankRecon.closing.v2";

export function BankReconciliationDesignPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toasts, push, dismiss } = useToasts();
  const timers = useTimers();

  // ── scope (persisted) ──
  const [scope, setScope] = React.useState<Scope>(() => {
    const urlAcc = params.get("account");
    let base: Scope = { accountId: NABIL, dateMode: "posting", from: "2026-06-01", to: "2026-06-30" };
    try { const s = window.localStorage.getItem(LS_KEY); if (s) base = { ...base, ...JSON.parse(s) }; } catch { /* ignore */ }
    if (urlAcc && accountById(urlAcc)) base.accountId = urlAcc;
    if (!accountById(base.accountId)) base.accountId = NABIL;
    return base;
  });
  React.useEffect(() => { try { window.localStorage.setItem(LS_KEY, JSON.stringify(scope)); } catch { /* ignore */ } }, [scope]);
  const patchScope = (patch: Partial<Scope>) => setScope((s) => ({ ...s, ...patch }));

  const account = accountById(scope.accountId)!;
  const ccy = account.currency;

  // ── data + selection tracks ──
  const [allTxns, setAllTxns] = React.useState<BankTxn[]>(() => SEED_TXNS.map((t) => ({ ...t, allocations: [...t.allocations] })));
  const [closingByAcc, setClosingByAcc] = React.useState<Record<string, number>>(() => {
    try { const s = window.localStorage.getItem(LS_CLOSING); if (s) return JSON.parse(s); } catch { /* ignore */ }
    return {};
  });
  React.useEffect(() => { try { window.localStorage.setItem(LS_CLOSING, JSON.stringify(closingByAcc)); } catch { /* ignore */ } }, [closingByAcc]);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [checked, setChecked] = React.useState<Set<string>>(new Set());
  const [mode, setMode] = React.useState<WorkMode>("match");
  const [refreshTok, setRefreshTok] = React.useState(0);
  const [listLoading, setListLoading] = React.useState(true);
  const [balLoading, setBalLoading] = React.useState(true);
  const [autoBusy, setAutoBusy] = React.useState(false);
  const [posting, setPosting] = React.useState(false);

  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebounced(searchInput, 250);
  const [listScope, setListScope] = React.useState<ListScope>("unrec");

  const vcount = React.useRef(7800);
  const nextVoucherId = (p: string) => `${p}-${++vcount.current}`;

  // one-time import handoff toast
  const noted = React.useRef(false);
  React.useEffect(() => {
    if (noted.current) return; noted.current = true;
    const n = Number(params.get("imported") ?? 0);
    if (n > 0) push("success", `${n} imported line${n > 1 ? "s" : ""} landed — ready to reconcile.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SCOPE / REFRESH → list re-loads, balances recompute, focus resets
  React.useEffect(() => {
    setListLoading(true); setBalLoading(true); setFocusedId(null);
    const h1 = window.setTimeout(() => setListLoading(false), 340);
    const h2 = window.setTimeout(() => setBalLoading(false), 460);
    return () => { window.clearTimeout(h1); window.clearTimeout(h2); };
  }, [scope.accountId, scope.from, scope.to, scope.dateMode, refreshTok]);

  const bump = React.useCallback(() => { setFocusedId(null); setRefreshTok((t) => t + 1); }, []);

  // ── rows in scope (account + date window), then self-heal checks ──
  const inWindow = React.useCallback((t: BankTxn) => {
    const d = toInt(scope.dateMode === "reference" ? (t.refDateISO ?? t.dateISO) : t.dateISO);
    return d >= toInt(scope.from) && d <= toInt(scope.to);
  }, [scope.dateMode, scope.from, scope.to]);

  const accountRows = React.useMemo(
    () => allTxns.filter((t) => t.accountId === scope.accountId && inWindow(t)).sort((a, b) => toInt(a.dateISO) - toInt(b.dateISO) || a.id.localeCompare(b.id)),
    [allTxns, scope.accountId, inWindow],
  );

  // prune checks to still-existing txns whenever the dataset changes
  React.useEffect(() => {
    setChecked((prev) => { const next = new Set([...prev].filter((id) => allTxns.some((t) => t.id === id))); return next.size === prev.size ? prev : next; });
  }, [allTxns]);

  // visible rows = search + status scope (client-side)
  const visibleRows = React.useMemo(() => {
    let r = accountRows;
    if (listScope === "unrec") r = r.filter((t) => statusOf(t) === "open" || statusOf(t) === "partial");
    else if (listScope === "partial") r = r.filter((t) => statusOf(t) === "partial");
    const s = search.trim().toLowerCase();
    if (s) r = r.filter((t) => [t.description, t.reference, t.party].some((f) => (f ?? "").toLowerCase().includes(s)));
    return r;
  }, [accountRows, listScope, search]);

  // ── balances ──
  const activeRows = accountRows.filter((t) => !t.cancelled);
  const cleared = account.openingCleared + activeRows.reduce((s, t) => s + Math.sign(t.amount) * allocatedOf(t), 0);
  const seededClosing = account.openingCleared + activeRows.reduce((s, t) => s + t.amount, 0);
  const stmtClosing = closingByAcc[scope.accountId] ?? seededClosing;

  const summary = React.useMemo(() => {
    const un = accountRows.filter((t) => statusOf(t) === "open").length;
    const pa = accountRows.filter((t) => statusOf(t) === "partial").length;
    const unallocated = accountRows.filter((t) => !t.cancelled && statusOf(t) !== "done").reduce((s, t) => s + remainingOf(t), 0);
    return { unrec: un, partial: pa, unallocated };
  }, [accountRows]);

  const focused = focusedId ? allTxns.find((t) => t.id === focusedId) ?? null : null;
  const checkedTxns = React.useMemo(() => [...checked].map((id) => allTxns.find((t) => t.id === id)).filter(Boolean) as BankTxn[], [checked, allTxns]);

  // ── mutations ──
  const mutate = (fn: (t: BankTxn[]) => BankTxn[]) => setAllTxns((prev) => fn(prev));
  const addAllocs = (id: string, allocs: { voucher: string; type: string; amount: number; origin: AllocOrigin }[]) =>
    mutate((txns) => txns.map((t) => (t.id === id ? { ...t, allocations: [...t.allocations, ...allocs.map((a, i) => ({ id: `${a.origin[0]}-${id}-${vcount.current}-${i}`, voucher: a.voucher, voucherType: a.type, amount: a.amount, origin: a.origin }))] } : t)));

  const reconcile = (id: string, allocs: { voucher: string; type: string; amount: number }[]) => {
    const snap = allTxns;
    addAllocs(id, allocs.map((a) => ({ ...a, origin: "matched" as AllocOrigin })));
    push("success", `Reconciled ${id} · ${allocs.length} voucher${allocs.length > 1 ? "s" : ""}`, () => setAllTxns(snap));
    bump();
  };
  const unreconcile = (id: string) => {
    if (!window.confirm(`Unreconcile ${id}? This reverses all its allocations.`)) return;
    const snap = allTxns;
    mutate((txns) => txns.map((t) => (t.id === id ? { ...t, allocations: [] } : t)));
    push("success", `${id} unreconciled`, () => setAllTxns(snap));
    bump();
  };
  const create = (id: string, voucher: string, type: string, amount: number) => {
    const snap = allTxns;
    addAllocs(id, [{ voucher, type, amount, origin: "created" }]);
    push("success", `Created ${voucher} & reconciled ${id}`, () => setAllTxns(snap));
    bump();
  };
  const reverse = (id: string, allocId: string) => {
    const snap = allTxns;
    mutate((txns) => txns.map((t) => (t.id === id ? { ...t, allocations: t.allocations.filter((a) => a.id !== allocId) } : t)));
    push("success", `Allocation reversed on ${id}`, () => setAllTxns(snap));
    bump();
  };
  const cancelTxn = (id: string, reason: string) => {
    const snap = allTxns;
    mutate((txns) => txns.map((t) => (t.id === id ? { ...t, cancelled: true, cancelReason: reason, allocations: [] } : t)));
    push("success", `${id} voided`, () => setAllTxns(snap));
    bump();
  };

  const autoMatch = () => {
    if (!scope.accountId) { push("warning", "Choose a bank account first."); return; }
    setAutoBusy(true);
    timers.later(880, () => {
      let matched = 0, partial = 0, review = 0;
      const snap = allTxns;
      mutate((txns) => txns.map((t) => {
        if (t.accountId !== scope.accountId || !inWindow(t) || statusOf(t) !== "open") return t;
        const sug = suggestionFor(t);
        if (sug) { matched++; return { ...t, allocations: [...t.allocations, { id: `auto-${t.id}-${vcount.current}`, voucher: sug.id, voucherType: sug.type, amount: Math.min(sug.open, remainingOf(t)), origin: "matched" as AllocOrigin }] }; }
        const near = candidatesFor(t, { types: ALL_TYPES_ON(), exactOnly: false, samePartyOnly: false })[0];
        if (near && near.stars >= 3) partial++; else review++;
        return t;
      }));
      setAutoBusy(false);
      if (matched > 0) push("success", `Auto-reconcile · ${matched} matched · ${partial} partial · ${review} to review`, () => setAllTxns(snap));
      else push("warning", `No confident matches · ${partial} partial · ${review} to review`);
      bump();
    });
  };
  const openImport = () => navigate(`/design/bank-import?account=${scope.accountId}`);

  // batch ops
  const clearChecks = () => setChecked(new Set());
  const batchReceipts = () => {
    const id = window.prompt("Create receipt vouchers for the selected deposits — customer/party id:");
    if (!id || !id.trim()) return;
    setPosting(true);
    const targets = checkedTxns.filter((t) => isIn(t) && statusOf(t) !== "done");
    timers.later(760, () => {
      const snap = allTxns;
      mutate((txns) => txns.map((t) => (targets.some((x) => x.id === t.id) ? { ...t, allocations: [...t.allocations, { id: `b-${t.id}-${vcount.current}`, voucher: nextVoucherId("RCPT"), voucherType: "Customer Receipt", amount: remainingOf(t), origin: "created" as AllocOrigin }] } : t)));
      setPosting(false);
      push("success", `Created ${targets.length} receipt${targets.length > 1 ? "s" : ""} for ${id.trim()}`, () => setAllTxns(snap));
      clearChecks(); bump();
    });
  };
  const batchTransfer = () => {
    setPosting(true);
    const [a, b] = checkedTxns;
    timers.later(760, () => {
      const snap = allTxns;
      const vid = nextVoucherId("TRF");
      mutate((txns) => txns.map((t) => {
        if (t.id === a.id || t.id === b.id) return { ...t, allocations: [{ id: `b-${t.id}-${vcount.current}`, voucher: vid, voucherType: "Internal Transfer", amount: Math.abs(t.amount), origin: "created" as AllocOrigin }] };
        return t;
      }));
      setPosting(false);
      push("success", `Internal transfer ${vid} — both legs reconciled`, () => setAllTxns(snap));
      clearChecks(); bump();
    });
  };

  const toggleCheck = (id: string) => setChecked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const commitClosing = (n: number) => setClosingByAcc((m) => ({ ...m, [scope.accountId]: n }));

  const breadcrumb = (
    <>
      <span className="text-bz-text-muted">Finance</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Bank Reconciliation</span>
    </>
  );

  return (
    <AppShell breadcrumb={breadcrumb} overlay={<><BatchBar checkedTxns={checkedTxns} posting={posting} onClear={clearChecks} onCreateReceipts={batchReceipts} onTransfer={batchTransfer} /><Toaster toasts={toasts} dismiss={dismiss} /></>}>
      <ScopeBar scope={scope} onScope={patchScope} onRefresh={() => setRefreshTok((t) => t + 1)} onAuto={autoMatch} onImport={openImport} autoBusy={autoBusy} ccy={ccy} />
      <BalancesBar opening={account.openingCleared} cleared={cleared} stmtClosing={balLoading ? null : stmtClosing} onCommitClosing={commitClosing} loading={balLoading} ccy={ccy} fromISO={scope.from} />

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-4 px-4 py-4 md:px-6 lg:grid-cols-[minmax(360px,0.94fr)_minmax(0,1.06fr)] lg:items-start">
        <div className={cn("lg:sticky lg:top-4 lg:h-[calc(100vh-248px)]", focused && "hidden lg:block")}>
          <WorkList
            rows={visibleRows} loading={listLoading} hasAccount={!!scope.accountId} focusedId={focusedId}
            onFocus={(id) => setFocusedId(id)} checked={checked} onToggleCheck={toggleCheck}
            search={searchInput} onSearch={setSearchInput} scope={listScope} onScope={setListScope} ccy={ccy} summary={summary}
          />
        </div>
        <div className={cn(!focused && "hidden lg:block")}>
          <FocusPanel
            txn={focused} ccy={ccy} mode={mode} onMode={setMode} onBackMobile={() => setFocusedId(null)}
            onReconcile={(allocs) => focused && reconcile(focused.id, allocs)}
            onUnreconcile={() => focused && unreconcile(focused.id)}
            onCreate={(v, ty, amt) => focused && create(focused.id, v, ty, amt)}
            onReverse={(allocId) => focused && reverse(focused.id, allocId)}
            onCancel={(reason) => focused && cancelTxn(focused.id, reason)}
            nextVoucherId={nextVoucherId}
          />
        </div>
      </div>
    </AppShell>
  );
}
