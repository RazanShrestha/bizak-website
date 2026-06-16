import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router";
import {
  Landmark,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Check,
  Calendar,
  RotateCw,
  History,
  Upload,
  Wand2,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  Link2,
  FilePlus2,
  ListChecks,
  Info,
  Ban,
  Unlink,
  Inbox,
  CheckCircle2,
  TriangleAlert,
  Pencil,
  Sparkles,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  BookText,
  Layers,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// BANK RECONCILIATION · WORKSPACE
//
// Primary action: drive the gap between the bank's statement and the books to
// zero — for each imported bank line, LINK it to existing voucher(s), CREATE a
// voucher from it, or INSPECT / cancel it.
//
// Shape = a SCOREBOARD on top (balances + the live difference you're closing)
// over a MASTER–DETAIL body:
//   • master = the imported bank transactions (scan / filter / select / act)
//   • detail = a working panel on the selected line (Match / Create / Manage)
// A docked bulk bar appears when several lines are checkbox-selected.
//
// Everything is LIVE: changing the account or period reloads the set + every
// balance; any reconcile / create / unlink / bulk re-derives the balances,
// reloads the set, and clears the active line. Hands off to (and returns from)
// the Bank Statement Import wizard — its sibling page.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtAD(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
const toInt = (iso: string) => Number(iso.replace(/-/g, ""));
const grp = (n: number) => Math.round(Math.abs(n)).toLocaleString("en-US");
/** Signed money with a unicode minus, no currency. */
function signed(n: number) {
  if (n > 0) return `+${grp(n)}`;
  if (n < 0) return `−${grp(n)}`;
  return grp(0);
}

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNTS  (exported — the import wizard pulls its account source from here)
// ════════════════════════════════════════════════════════════════════════════

export type BankAccount = {
  id: string;
  name: string;
  number: string;
  bank: string;
  currency: string;
  openingCleared: number;
};

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
// TRANSACTION MODEL
//
// amount is SIGNED: deposits positive (money in), withdrawals negative.
// allocations drive everything — allocated = Σ amount; status is derived.
// Balances reconcile: when every line is fully allocated, clearedBalance lands
// exactly on the seeded statement-closing figure (difference → 0).
// ════════════════════════════════════════════════════════════════════════════

type AllocOrigin = "matched" | "created";
type Allocation = { id: string; voucher: string; voucherType: string; amount: number; origin: AllocOrigin };

type BankTxn = {
  id: string;
  dateISO: string;
  valueDateISO: string;
  description: string;
  reference: string | null;
  party: string | null;
  amount: number; // signed
  allocations: Allocation[];
  cancelled?: boolean;
  cancelReason?: string;
  statementLine: number;
  /** internal-transfer mirror leg auto-detected on another account */
  mirror?: { account: string; line: string };
  hint?: string;
};

const SEED_TXNS: BankTxn[] = [
  { id: "BT-1042", dateISO: "2026-06-03", valueDateISO: "2026-06-03", description: "Inward clearing — Himalayan Traders", reference: "CHQ-88231", party: "Himalayan Traders", amount: 480_000, statementLine: 42, allocations: [{ id: "al-1", voucher: "SI-2048", voucherType: "Sales Invoice", amount: 480_000, origin: "matched" }] },
  { id: "BT-1041", dateISO: "2026-06-03", valueDateISO: "2026-06-04", description: "NEFT credit — Everest Hardware Supplies", reference: "NEFT-7741", party: "Everest Hardware Supplies", amount: 312_500, statementLine: 43, allocations: [] },
  { id: "BT-1040", dateISO: "2026-06-04", valueDateISO: "2026-06-04", description: "Cheque paid — Shivam Cement Ltd", reference: "CHQ-5567", party: "Shivam Cement Ltd", amount: -185_400, statementLine: 44, allocations: [] },
  { id: "BT-1039", dateISO: "2026-06-05", valueDateISO: "2026-06-05", description: "Deposit — Annapurna Distributors", reference: "DEP-2290", party: "Annapurna Distributors", amount: 96_200, statementLine: 45, allocations: [] },
  { id: "BT-1038", dateISO: "2026-06-06", valueDateISO: "2026-06-07", description: "NEA — electricity (Jaishtha)", reference: "BILL-44120", party: "Nepal Electricity Authority", amount: -742_000, statementLine: 46, allocations: [{ id: "al-2", voucher: "PMT-3391", voucherType: "Payment", amount: 400_000, origin: "matched" }] },
  { id: "BT-1037", dateISO: "2026-06-07", valueDateISO: "2026-06-07", description: "POS PURCHASE KATHMANDU 4471", reference: null, party: null, amount: -58_750, statementLine: 47, allocations: [], hint: "No party on the statement line — describe it on the voucher you create." },
  { id: "BT-1036", dateISO: "2026-06-09", valueDateISO: "2026-06-09", description: "RTGS credit — Sagarmatha Steel Udyog", reference: "RTGS-9981", party: "Sagarmatha Steel Udyog", amount: 1_250_000, statementLine: 48, allocations: [{ id: "al-3", voucher: "RCPT-7720", voucherType: "Customer Receipt", amount: 1_250_000, origin: "created" }] },
  { id: "BT-1035", dateISO: "2026-06-10", valueDateISO: "2026-06-10", description: "Transfer out — to Himalayan Savings", reference: "TRF-3320", party: null, amount: -350_000, statementLine: 49, allocations: [], mirror: { account: "Himalayan Bank — Savings", line: "Line 18 · +350,000" }, hint: "A matching +350,000 leg was detected on Himalayan Bank — Savings." },
  { id: "BT-1034", dateISO: "2026-06-11", valueDateISO: "2026-06-11", description: "Interest credit — Q1 savings", reference: "INT-0601", party: null, amount: 28_900, statementLine: 50, allocations: [], hint: "Bank-originated — best posted as a journal entry to interest income." },
  { id: "BT-1033", dateISO: "2026-06-12", valueDateISO: "2026-06-12", description: "Refund paid — Gandaki Auto Parts", reference: "CHQ-5571", party: "Gandaki Auto Parts", amount: -124_600, statementLine: 51, allocations: [] },
  { id: "BT-1032", dateISO: "2026-06-13", valueDateISO: "2026-06-13", description: "Payroll — June salaries", reference: "PAYR-06", party: null, amount: -890_000, statementLine: 52, allocations: [{ id: "al-4", voucher: "JE-5567", voucherType: "Journal Entry", amount: 500_000, origin: "created" }] },
  { id: "BT-1031", dateISO: "2026-06-14", valueDateISO: "2026-06-14", description: "Reversed deposit — Pokhara Electronics", reference: "DEP-2301", party: "Pokhara Electronics", amount: 67_400, statementLine: 53, allocations: [], cancelled: true, cancelReason: "Duplicate of statement line 39 — already imported in May." },
];

// ── candidate voucher pool (the books) — ranked per active line in Match view ──

type Voucher = { id: string; type: string; party: string | null; dateISO: string; amount: number; open: number; reference: string | null };

const VOUCHER_POOL: Voucher[] = [
  { id: "SI-2051", type: "Sales Invoice", party: "Everest Hardware Supplies", dateISO: "2026-06-02", amount: 312_500, open: 312_500, reference: "NEFT-7741" },
  { id: "SI-2049", type: "Sales Invoice", party: "Everest Hardware Supplies", dateISO: "2026-05-28", amount: 188_000, open: 188_000, reference: null },
  { id: "SI-2053", type: "Sales Invoice", party: "Annapurna Distributors", dateISO: "2026-06-04", amount: 96_200, open: 96_200, reference: "DEP-2290" },
  { id: "PI-882", type: "Purchase Invoice", party: "Shivam Cement Ltd", dateISO: "2026-06-01", amount: 185_400, open: 185_400, reference: "CHQ-5567" },
  { id: "PI-879", type: "Purchase Invoice", party: "Shivam Cement Ltd", dateISO: "2026-05-22", amount: 240_000, open: 240_000, reference: null },
  { id: "PMT-3402", type: "Payment", party: "Nepal Electricity Authority", dateISO: "2026-06-06", amount: 342_000, open: 342_000, reference: "BILL-44120" },
  { id: "PMT-3399", type: "Payment", party: "Gandaki Auto Parts", dateISO: "2026-06-12", amount: 124_600, open: 124_600, reference: "CHQ-5571" },
  { id: "JE-5571", type: "Journal Entry", party: null, dateISO: "2026-06-11", amount: 28_900, open: 28_900, reference: "INT-0601" },
  { id: "JE-5569", type: "Journal Entry", party: null, dateISO: "2026-06-13", amount: 390_000, open: 390_000, reference: "PAYR-06" },
  { id: "PMT-3405", type: "Payment", party: "Janaki Textiles", dateISO: "2026-06-08", amount: 58_750, open: 58_750, reference: null },
];

const CANDIDATE_TYPES = ["Sales Invoice", "Purchase Invoice", "Payment", "Journal Entry"] as const;
type CandidateType = (typeof CANDIDATE_TYPES)[number];

// ── derive helpers ──

const EPSILON = 0.5;
const allocatedOf = (t: BankTxn) => t.allocations.reduce((s, a) => s + a.amount, 0);
type TxnStatus = "unreconciled" | "partial" | "reconciled" | "cancelled";
function statusOf(t: BankTxn): TxnStatus {
  if (t.cancelled) return "cancelled";
  const alloc = allocatedOf(t);
  if (alloc <= EPSILON) return "unreconciled";
  if (alloc >= Math.abs(t.amount) - EPSILON) return "reconciled";
  return "partial";
}
const remainingOf = (t: BankTxn) => Math.abs(t.amount) - allocatedOf(t);

// ════════════════════════════════════════════════════════════════════════════
// SMALL ATOMS
// ════════════════════════════════════════════════════════════════════════════

const PRIMARY_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50";
const GHOST_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-50";

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
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", CHIP_BG[tone])}>
      {dot && <span className={cn("size-1.5 shrink-0 rounded-bz-pill", DOT_BG[tone])} />}
      {label}
    </span>
  );
}
const STATUS_META: Record<TxnStatus, { label: string; tone: Tone }> = {
  unreconciled: { label: "Unreconciled", tone: "pending" },
  partial: { label: "Partial", tone: "partial" },
  reconciled: { label: "Reconciled", tone: "positive" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

/** signed amount with a directional glyph */
function Amount({ value, currency, size = "md" }: { value: number; currency: string; size?: "sm" | "md" | "lg" }) {
  const isIn = value >= 0;
  const text = size === "lg" ? "text-[16px]" : size === "sm" ? "text-[12px]" : "text-[13.5px]";
  return (
    <span className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
      <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-bz-sm", isIn ? "bg-bz-fire/[0.18] text-bz-leaf-deep" : "bg-bz-paper-warm text-bz-text-muted")}>
        {isIn ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
      </span>
      <span className="text-[9.5px] font-semibold uppercase tracking-[0.04em] text-bz-text-soft">{currency}</span>
      <span className={cn("font-semibold text-bz-text", text, NUM)}>{signed(value)}</span>
    </span>
  );
}

function MeterBar({ pct, fill = "var(--bz-olive)" }: { pct: number; fill?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
      <div className="h-full rounded-bz-pill transition-[width]" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: fill }} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">{children}</p>;
}

// ── anchored portal dropdown ──

function useAnchored(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !ref.current) { setPos(null); return; }
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, ref]);
  return pos;
}

function Dropdown({
  anchorRef, open, onClose, children, width,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const pos = useAnchored(open, anchorRef);
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
  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: width ?? Math.max(pos.width, 260) }}
      className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
    >
      {children}
    </div>,
    document.body,
  );
}

// ── confirm dialog (guards destructive actions) ──

function ConfirmDialog({
  open, title, body, confirmLabel, danger, busy, onConfirm, onClose,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div onClick={onClose} className="absolute inset-0 bg-bz-olive/40 backdrop-blur-[1px]" aria-hidden />
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_24px_60px_-20px_rgba(15,20,17,0.4)]">
        <div className="flex items-start gap-3 px-5 pb-3 pt-5">
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md", danger ? "bg-[#FBE7E5] text-[#9A2E29]" : "bg-bz-fire/[0.18] text-bz-text")}>
            {danger ? <TriangleAlert size={16} /> : <Info size={16} />}
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-bz-text">{title}</p>
            <div className="mt-1 text-[12px] leading-relaxed text-bz-text-muted">{body}</div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/50 px-5 py-3">
          <button onClick={onClose} className={cn(GHOST_BTN, "h-8")}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-bz-md px-3.5 text-[12px] font-semibold disabled:opacity-60",
              danger ? "bg-[#C0413A] text-white hover:opacity-95" : "bg-bz-deep text-bz-text-on-dark hover:opacity-95",
            )}
          >
            {busy && <Loader2 size={12} className="animate-spin" />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1 · ACCOUNT & PERIOD CONTROL BAR
// ════════════════════════════════════════════════════════════════════════════

const DATE_PRESETS: { label: string; from: string; to: string }[] = [
  { label: "This month", from: "2026-06-01", to: "2026-06-30" },
  { label: "Last 30 days", from: "2026-05-16", to: "2026-06-15" },
  { label: "This quarter", from: "2026-04-01", to: "2026-06-30" },
];

function AccountPicker({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const acc = accountById(value);
  const query = q.trim().toLowerCase();
  const filtered = query
    ? BANK_ACCOUNTS.filter((a) => a.name.toLowerCase().includes(query) || a.bank.toLowerCase().includes(query) || a.number.toLowerCase().includes(query))
    : BANK_ACCOUNTS;
  return (
    <>
      <button
        ref={btnRef}
        onClick={() => { setOpen((v) => !v); setQ(""); }}
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-bz-md border px-3 text-left transition-colors md:w-[320px]",
          open ? "border-bz-text bg-bz-surface" : value ? "border-bz-line bg-bz-surface hover:border-bz-text-muted" : "border-bz-fire bg-bz-fire/[0.10] hover:bg-bz-fire/[0.16]",
        )}
      >
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-sm", value ? "bg-bz-olive text-bz-fire" : "bg-bz-fire text-bz-olive")}>
          <Landmark size={14} />
        </span>
        <span className="min-w-0 flex-1">
          {acc ? (
            <>
              <span className="block truncate text-[13px] font-semibold text-bz-text">{acc.name}</span>
              <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{acc.number} · {acc.currency}</span>
            </>
          ) : (
            <span className="block text-[13px] font-semibold text-bz-text">Choose a bank account</span>
          )}
        </span>
        <ChevronDown size={14} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      <Dropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)} width={340}>
        <div className="border-b border-bz-line-soft p-2">
          <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5">
            <Search size={12} className="shrink-0 text-bz-text-muted" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search accounts…" className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
          </div>
        </div>
        <div className="max-h-[280px] overflow-y-auto py-1">
          {value && (
            <>
              <button onClick={() => { onChange(null); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-bz-text-muted hover:bg-bz-paper-warm">
                <X size={12} /> Clear selection (show inert state)
              </button>
              <div className="my-1 h-px bg-bz-line-soft" />
            </>
          )}
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-[12px] text-bz-text-muted">No accounts match “{q}”.</p>
          ) : (
            filtered.map((a) => {
              const sel = a.id === value;
              return (
                <button key={a.id} onClick={() => { onChange(a.id); setOpen(false); }} className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left", sel ? "bg-bz-fire/[0.08]" : "hover:bg-bz-paper-warm")}>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted"><Landmark size={13} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-bz-text">{a.name}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{a.number}</span>
                  </span>
                  <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text-muted">{a.currency}</span>
                  {sel && <Check size={13} className="shrink-0 text-bz-text" />}
                </button>
              );
            })
          )}
        </div>
      </Dropdown>
    </>
  );
}

type Period = { from: string; to: string; refMode: boolean };

function IconBtn({ icon: Icon, onClick, disabled, title, spinning }: { icon: React.ComponentType<{ size?: number; className?: string }>; onClick: () => void; disabled?: boolean; title: string; spinning?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} aria-label={title} className="flex size-9 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text disabled:cursor-not-allowed disabled:opacity-40">
      <Icon size={15} className={spinning ? "animate-spin" : ""} />
    </button>
  );
}

function ControlBar({
  account, onAccount, period, onPeriod,
  onRefresh, onPullOlder, onImport, onAuto, autoBusy, refreshing,
}: {
  account: string | null;
  onAccount: (id: string | null) => void;
  period: Period;
  onPeriod: (p: Period) => void;
  onRefresh: () => void;
  onPullOlder: () => void;
  onImport: () => void;
  onAuto: () => void;
  autoBusy: boolean;
  refreshing: boolean;
}) {
  const inert = !account;
  return (
    <div className="px-4 pt-6 md:px-8">
      {/* identity + actions */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <AccountPicker value={account} onChange={onAccount} />

        <div className="flex shrink-0 items-center gap-1">
          <IconBtn icon={RotateCw} onClick={onRefresh} disabled={inert || refreshing} title="Refresh" spinning={refreshing} />
          <IconBtn icon={History} onClick={onPullOlder} disabled={inert} title="Pull in older unreconciled items" />
          <IconBtn icon={Upload} onClick={onImport} disabled={inert} title="Import a bank statement" />
          <span className="mx-1.5 h-5 w-px bg-bz-line-soft" aria-hidden />
          <button onClick={onAuto} disabled={inert || autoBusy} className={PRIMARY_BTN}>
            {autoBusy ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />} Auto-reconcile
          </button>
        </div>
      </div>

      {/* period */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <div className="flex items-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
          {DATE_PRESETS.map((p) => {
            const active = period.from === p.from && period.to === p.to;
            return (
              <button
                key={p.label}
                disabled={inert}
                onClick={() => onPeriod({ ...period, from: p.from, to: p.to })}
                className={cn(
                  "h-7 rounded-bz-sm px-2.5 text-[11.5px] font-medium transition-colors disabled:opacity-40",
                  active ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex h-9 items-center gap-2 rounded-bz-md bg-bz-paper-warm px-3">
          <Calendar size={13} className="shrink-0 text-bz-text-soft" />
          <input type="date" value={period.from} disabled={inert} onChange={(e) => onPeriod({ ...period, from: e.target.value })} className={cn("bg-transparent text-[12px] text-bz-text outline-none disabled:opacity-40", NUM)} />
          <span className="text-bz-text-soft">→</span>
          <input type="date" value={period.to} disabled={inert} onChange={(e) => onPeriod({ ...period, to: e.target.value })} className={cn("bg-transparent text-[12px] text-bz-text outline-none disabled:opacity-40", NUM)} />
        </div>

        <button onClick={() => onPeriod({ ...period, refMode: !period.refMode })} disabled={inert} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-bz-md px-2.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm disabled:opacity-40" title="Swap which date drives the window">
          <ArrowLeftRight size={12} /> {period.refMode ? "Value date" : "Transaction date"}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2 · BALANCE SCOREBOARD  (quiet figures + one emphasized difference)
// ════════════════════════════════════════════════════════════════════════════

function Stat({ label, value, loading, editable, onCommit }: { label: string; value: number; loading?: boolean; editable?: boolean; onCommit?: (n: number) => void }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const begin = () => { setDraft(String(Math.round(value))); setEditing(true); window.setTimeout(() => inputRef.current?.select(), 10); };
  const commit = () => { const n = Number(draft.replace(/[^0-9.-]/g, "")); if (!Number.isNaN(n)) onCommit?.(n); setEditing(false); };
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-bz-text-soft">
        {label}{editable && !editing && !loading && <Pencil size={9} className="text-bz-text-soft" />}
      </p>
      {loading ? (
        <span className="mt-2 block h-[20px] w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
      ) : editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className={cn("mt-1.5 h-7 w-full max-w-[140px] rounded-bz-sm border border-bz-text bg-bz-paper px-1.5 text-[18px] font-semibold text-bz-text outline-none", NUM)}
        />
      ) : editable ? (
        <button onClick={begin} className={cn("mt-1.5 block text-[20px] font-semibold leading-none text-bz-text decoration-bz-line decoration-dotted underline-offset-[5px] hover:underline", NUM)}>{grp(value)}</button>
      ) : (
        <p className={cn("mt-1.5 text-[20px] font-semibold leading-none text-bz-text", NUM)}>{grp(value)}</p>
      )}
    </div>
  );
}

function DifferenceBlock({ diff, matched, currency, loading }: { diff: number; matched: boolean; currency: string; loading?: boolean }) {
  return (
    <div className="mt-5 flex items-center gap-4 border-t border-bz-line-soft pt-5 lg:mt-0 lg:shrink-0 lg:border-t-0 lg:pt-0">
      <span className={cn("hidden h-11 w-px shrink-0 lg:block", matched ? "bg-bz-leaf-deep" : "bg-bz-line")} aria-hidden />
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-bz-text-soft">
          Difference
          {!loading && (matched ? (
            <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-fire px-1.5 py-[3px] text-[9.5px] font-semibold normal-case tracking-normal text-bz-olive">
              <CheckCircle2 size={10} /> Reconciled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-paper-warm px-1.5 py-[3px] text-[9.5px] font-semibold normal-case tracking-normal text-bz-text-muted">
              <span className="size-1 rounded-bz-pill bg-bz-text-soft" /> Not matched
            </span>
          ))}
        </p>
        {loading ? (
          <span className="mt-2 block h-7 w-32 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
        ) : (
          <p className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[11px] font-semibold text-bz-text-soft">{currency}</span>
            <span className={cn("text-[26px] font-semibold leading-none", matched ? "text-bz-leaf-deep" : "text-bz-text", NUM)}>{signed(diff)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function Scoreboard({
  opening, cleared, system, statementClosing, currency, loading, matched, diff, onCommitClosing,
}: {
  opening: number; cleared: number; system: number; statementClosing: number;
  currency: string; loading: boolean; matched: boolean; diff: number;
  onCommitClosing: (n: number) => void;
}) {
  const cells: { label: string; value: number; editable?: boolean }[] = [
    { label: "Opening", value: opening },
    { label: "Cleared", value: cleared },
    { label: "System", value: system },
    { label: "Statement closing", value: statementClosing, editable: true },
  ];
  return (
    <div className="mt-6 flex flex-col border-t border-bz-line-soft pt-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 lg:flex lg:items-center lg:gap-0">
        {cells.map((c, i) => (
          <div key={c.label} className={cn("min-w-0", i > 0 && "lg:ml-5 lg:border-l lg:border-bz-line-soft lg:pl-5")}>
            <Stat label={c.label} value={c.value} loading={loading} editable={c.editable} onCommit={c.editable ? onCommitClosing : undefined} />
          </div>
        ))}
      </div>
      <DifferenceBlock diff={diff} matched={matched} currency={currency} loading={loading} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3 · TRANSACTION BROWSER  (master list)
// ════════════════════════════════════════════════════════════════════════════

type Scope = "unreconciled" | "partial" | "all";
const SCOPES: { key: Scope; label: string }[] = [
  { key: "unreconciled", label: "Unreconciled" },
  { key: "partial", label: "Partial" },
  { key: "all", label: "All" },
];

function TxnRow({
  txn, currency, active, checked, onOpen, onCheck,
}: {
  txn: BankTxn;
  currency: string;
  active: boolean;
  checked: boolean;
  onOpen: () => void;
  onCheck: (v: boolean) => void;
}) {
  const st = statusOf(txn);
  const meta = STATUS_META[st];
  const alloc = allocatedOf(txn);
  return (
    <div
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 border-b border-bz-line-soft px-3 py-3 transition-colors last:border-b-0",
        active ? "bg-bz-fire/[0.07]" : "hover:bg-bz-paper-warm/50",
      )}
    >
      <span className={cn("absolute left-0 top-0 h-full w-[3px] rounded-r-bz-pill bg-bz-fire transition-opacity", active ? "opacity-100" : "opacity-0")} aria-hidden />
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={(e) => { e.stopPropagation(); onCheck(!checked); }}
        className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors", checked ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface hover:border-bz-text-muted")}
      >
        {checked && <Check size={11} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("truncate text-[13px] font-medium", txn.cancelled ? "text-bz-text-soft line-through" : "text-bz-text")}>{txn.description}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-bz-text-soft">
          <span className={NUM}>{fmtAD(txn.dateISO)}</span>
          {txn.party && <><span>·</span><span className="truncate text-bz-text-muted">{txn.party}</span></>}
          {txn.reference && <><span>·</span><span className={cn("rounded-bz-sm bg-bz-paper-warm px-1 py-px text-bz-text-muted", NUM)}>{txn.reference}</span></>}
        </div>
        {st === "partial" && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className={cn("text-[10px] text-bz-text-muted", NUM)}>{grp(alloc)} / {grp(Math.abs(txn.amount))} allocated</span>
            <div className="h-1 w-20 overflow-hidden rounded-bz-pill bg-bz-line-soft"><div className="h-full rounded-bz-pill bg-bz-fire" style={{ width: `${(alloc / Math.abs(txn.amount)) * 100}%` }} /></div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Amount value={txn.amount} currency={currency} size="sm" />
        <StatusChip label={meta.label} tone={meta.tone} />
      </div>
    </div>
  );
}

function TxnBrowser({
  txns, currency, loading, search, onSearch, scope, onScope, activeId, checkedIds, onOpen, onCheck, onCheckAll, counts,
}: {
  txns: BankTxn[];
  currency: string;
  loading: boolean;
  search: string;
  onSearch: (v: string) => void;
  scope: Scope;
  onScope: (s: Scope) => void;
  activeId: string | null;
  checkedIds: Set<string>;
  onOpen: (id: string) => void;
  onCheck: (id: string, v: boolean) => void;
  onCheckAll: (on: boolean) => void;
  counts: { unrec: number; partial: number; unalloc: number };
}) {
  const allChecked = txns.length > 0 && txns.every((t) => checkedIds.has(t.id));
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-bz-line-soft px-3 py-2.5">
        <div className="relative min-w-0 flex-1">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search description, reference or party…" className="h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper pl-8 pr-8 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted" />
          {search && <button onClick={() => onSearch("")} aria-label="Clear" className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={12} /></button>}
        </div>
        <div className="flex items-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
          {SCOPES.map((s) => (
            <button key={s.key} onClick={() => onScope(s.key)} className={cn("h-7 rounded-bz-sm px-2.5 text-[11.5px] font-medium transition-colors", scope === s.key ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text")}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* slim count + select-all row */}
      {!loading && txns.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft px-3 py-2 text-[11px]">
          <button role="checkbox" aria-checked={allChecked} onClick={() => onCheckAll(!allChecked)} className="flex items-center gap-2 text-bz-text-muted hover:text-bz-text">
            <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border", allChecked ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface")}>{allChecked && <Check size={11} />}</span>
            <span><span className={cn("font-semibold text-bz-text", NUM)}>{counts.unrec}</span> unreconciled · <span className={cn("font-semibold text-bz-text", NUM)}>{counts.partial}</span> partial</span>
          </button>
          <span className={cn("text-bz-text-soft", NUM)}><span className="font-semibold text-bz-text">{grp(counts.unalloc)}</span> unallocated</span>
        </div>
      )}

      {/* list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-2 py-5 text-bz-text-muted"><Loader2 size={15} className="animate-spin text-bz-fire" /> <span className="text-[12px] font-medium">Loading statement lines…</span></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-t border-bz-line-soft px-3 py-3.5">
                <div className="size-[18px] shrink-0 animate-pulse rounded-[5px] bg-bz-paper-warm" />
                <div className="flex-1 space-y-1.5"><div className="h-3 w-2/3 animate-pulse rounded-bz-sm bg-bz-paper-warm" /><div className="h-2.5 w-1/3 animate-pulse rounded-bz-sm bg-bz-paper-warm" /></div>
                <div className="h-4 w-20 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
              </div>
            ))}
          </div>
        ) : txns.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <span className="flex size-11 items-center justify-center rounded-bz-md bg-bz-fire/[0.16] text-bz-leaf-deep"><CheckCircle2 size={20} /></span>
            <p className="text-[13.5px] font-medium text-bz-text-muted">{search ? "No matches" : scope === "unreconciled" ? "All caught up" : "Nothing here"}</p>
          </div>
        ) : (
          txns.map((t) => (
            <TxnRow key={t.id} txn={t} currency={currency} active={t.id === activeId} checked={checkedIds.has(t.id)} onOpen={() => onOpen(t.id)} onCheck={(v) => onCheck(t.id, v)} />
          ))
        )}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5 · WORKING PANEL  (Match / Create / Manage over the selected line)
// ════════════════════════════════════════════════════════════════════════════

type WorkTab = "match" | "create" | "details";

function PanelEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-soft"><Layers size={20} /></span>
      <p className="text-[13px] font-medium text-bz-text-muted">Select a line to work on</p>
    </div>
  );
}

function TxnHeadline({ txn, currency }: { txn: BankTxn; currency: string }) {
  const st = statusOf(txn);
  return (
    <div className="border-b border-bz-line-soft px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-[11px] font-semibold text-bz-text-soft", NUM)}>{txn.id}</span>
            <StatusChip label={STATUS_META[st].label} tone={STATUS_META[st].tone} />
          </div>
          <p className="mt-1 truncate text-[14px] font-semibold text-bz-text">{txn.description}</p>
          <p className={cn("mt-0.5 text-[11px] text-bz-text-muted", NUM)}>{fmtAD(txn.dateISO)}{txn.party ? ` · ${txn.party}` : ""}{txn.reference ? ` · ${txn.reference}` : ""}</p>
        </div>
        <div className="shrink-0 text-right">
          <Amount value={txn.amount} currency={currency} size="md" />
          <p className={cn("mt-1 text-[10.5px] text-bz-text-muted", NUM)}>{remainingOf(txn) > EPSILON ? <><span className="text-bz-text">{grp(remainingOf(txn))}</span> remaining</> : "fully allocated"}</p>
        </div>
      </div>
    </div>
  );
}

// ── Match view ──

function confidenceOf(score: number): { label: string; tone: Tone } {
  if (score >= 80) return { label: "High match", tone: "positive" };
  if (score >= 50) return { label: "Likely", tone: "partial" };
  return { label: "Possible", tone: "neutral" };
}

function rankCandidate(txn: BankTxn, v: Voucher): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 20;
  const txnAbs = Math.abs(txn.amount);
  if (Math.abs(v.amount - txnAbs) < EPSILON) { score += 45; reasons.push("Exact amount"); }
  else if (Math.abs(v.amount - txnAbs) / txnAbs < 0.2) { score += 18; reasons.push("Amount within 20%"); }
  if (txn.party && v.party === txn.party) { score += 25; reasons.push("Same party"); }
  if (txn.reference && v.reference === txn.reference) { score += 22; reasons.push("Reference match"); }
  const dd = Math.abs(toInt(v.dateISO) - toInt(txn.dateISO));
  if (dd <= 3) { score += 8; reasons.push("Within 3 days"); }
  if (reasons.length === 0) reasons.push("Open on the account");
  return { score: Math.min(score, 99), reasons };
}

function MatchView({ txn, currency, onConfirm, onUnlinkAll, locked }: { txn: BankTxn; currency: string; onConfirm: (allocs: Allocation[]) => void; onUnlinkAll: () => void; locked: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [types, setTypes] = React.useState<Set<CandidateType>>(new Set(CANDIDATE_TYPES));
  const [exactOnly, setExactOnly] = React.useState(false);
  const [samePartyOnly, setSamePartyOnly] = React.useState(false);
  const [picked, setPicked] = React.useState<Record<string, number>>({}); // voucherId -> allocated
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setLoading(true); setPicked({});
    const t = window.setTimeout(() => setLoading(false), 480);
    return () => window.clearTimeout(t);
  }, [txn.id]);

  const target = remainingOf(txn); // amount still to allocate on this line
  const ranked = React.useMemo(() => {
    return VOUCHER_POOL
      .map((v) => ({ v, ...rankCandidate(txn, v) }))
      .filter(({ v, reasons }) => {
        if (!types.has(v.type as CandidateType)) return false;
        if (exactOnly && !reasons.includes("Exact amount")) return false;
        if (samePartyOnly && (!txn.party || v.party !== txn.party)) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [txn, types, exactOnly, samePartyOnly]);

  const allocatedNow = Object.values(picked).reduce((s, n) => s + n, 0);
  const remaining = target - allocatedNow;
  const over = allocatedNow > target + EPSILON;
  const canConfirm = allocatedNow > EPSILON && !over && !locked;

  const toggleType = (t: CandidateType) => setTypes((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });

  const togglePick = (v: Voucher) => {
    setPicked((prev) => {
      const n = { ...prev };
      if (v.id in n) { delete n[v.id]; return n; }
      const auto = Math.min(v.open, Math.max(0, target - Object.values(prev).reduce((s, x) => s + x, 0)));
      n[v.id] = auto > 0 ? auto : Math.min(v.open, target);
      return n;
    });
  };

  const setAlloc = (id: string, raw: string) => {
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    setPicked((prev) => ({ ...prev, [id]: Number.isNaN(n) ? 0 : n }));
  };

  const confirm = () => {
    if (!canConfirm) return;
    setSubmitting(true);
    const allocs: Allocation[] = Object.entries(picked).map(([id, amount], i) => {
      const v = VOUCHER_POOL.find((x) => x.id === id)!;
      return { id: `m-${id}-${i}`, voucher: v.id, voucherType: v.type, amount, origin: "matched" as AllocOrigin };
    });
    window.setTimeout(() => onConfirm(allocs), 650);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* filters */}
      <div className="border-b border-bz-line-soft px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {CANDIDATE_TYPES.map((t) => {
            const on = types.has(t);
            return (
              <button key={t} onClick={() => toggleType(t)} className={cn("rounded-bz-pill border px-2 py-0.5 text-[10.5px] font-medium transition-colors", on ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm")}>
                {t}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-bz-text-muted">
            <button role="checkbox" aria-checked={exactOnly} onClick={() => setExactOnly((v) => !v)} className={cn("flex size-4 items-center justify-center rounded-[4px] border", exactOnly ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface")}>{exactOnly && <Check size={10} />}</button>
            Exact amount only
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-bz-text-muted">
            <button role="checkbox" aria-checked={samePartyOnly} onClick={() => setSamePartyOnly((v) => !v)} disabled={!txn.party} className={cn("flex size-4 items-center justify-center rounded-[4px] border disabled:opacity-40", samePartyOnly ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface")}>{samePartyOnly && <Check size={10} />}</button>
            Same party only
          </label>
        </div>
      </div>

      {/* candidates */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {locked ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <Ban size={20} className="text-bz-text-soft" />
            <p className="text-[12.5px] font-medium text-bz-text-muted">This line is {statusOf(txn) === "cancelled" ? "cancelled" : "fully reconciled"} — nothing to match.</p>
            {txn.allocations.length > 0 && <button onClick={onUnlinkAll} className={cn(GHOST_BTN, "mt-1 h-8")}><Unlink size={12} /> Unlink everything</button>}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-bz-text-muted"><Loader2 size={15} className="animate-spin text-bz-fire" /> <span className="text-[12px]">Ranking candidate vouchers…</span></div>
        ) : ranked.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Search size={18} className="text-bz-text-soft" />
            <p className="text-[12.5px] font-medium text-bz-text-muted">No candidates match these filters</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ranked.map(({ v, score, reasons }) => {
              const conf = confidenceOf(score);
              const on = v.id in picked;
              return (
                <div key={v.id} className={cn("rounded-bz-md border transition-colors", on ? "border-bz-text bg-bz-fire/[0.06]" : "border-bz-line-soft bg-bz-surface hover:border-bz-line")}>
                  <button onClick={() => togglePick(v)} className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left">
                    <span className={cn("mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border", on ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface")}>{on && <Check size={11} />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={cn("text-[12.5px] font-semibold text-bz-text", NUM)}>{v.id}</span>
                        <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-px text-[10px] font-medium text-bz-text-muted">{v.type}</span>
                      </span>
                      <span className={cn("mt-0.5 block text-[10.5px] text-bz-text-soft", NUM)}>{v.party ?? "No party"} · {fmtAD(v.dateISO)}{v.reference ? ` · ${v.reference}` : ""}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1">
                        <StatusChip label={conf.label} tone={conf.tone} dot />
                        {reasons.slice(0, 3).map((r) => <span key={r} className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-px text-[9.5px] font-medium text-bz-text-muted">{r}</span>)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className={cn("block text-[10px] font-semibold text-bz-text-soft", NUM)}>{currency}</span>
                      <span className={cn("block text-[13px] font-semibold text-bz-text", NUM)}>{grp(v.amount)}</span>
                      <span className={cn("block text-[9.5px] text-bz-text-soft", NUM)}>open {grp(v.open)}</span>
                    </span>
                  </button>
                  {on && (
                    <div className="flex items-center gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2">
                      <span className="text-[10.5px] font-medium text-bz-text-muted">Allocate</span>
                      <div className="flex h-7 items-center gap-1 rounded-bz-sm border border-bz-line bg-bz-surface px-2">
                        <span className="text-[9.5px] font-semibold text-bz-text-soft">{currency}</span>
                        <input value={String(Math.round(picked[v.id]))} onChange={(e) => setAlloc(v.id, e.target.value)} className={cn("w-24 bg-transparent text-[12px] font-semibold text-bz-text outline-none", NUM)} />
                      </div>
                      <span className="text-[10px] text-bz-text-soft">of {grp(v.open)} open</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* allocation footer */}
      {!locked && (
        <div className="border-t border-bz-line-soft bg-bz-paper px-4 py-3">
          <div className="mb-2 grid grid-cols-3 gap-2 text-center">
            <div><p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">Allocated</p><p className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{grp(allocatedNow)}</p></div>
            <div><p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">To allocate</p><p className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{grp(target)}</p></div>
            <div><p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">{over ? "Over by" : "Remaining"}</p><p className={cn("text-[13px] font-semibold", over ? "text-[#9A2E29]" : "text-bz-text", NUM)}>{grp(over ? allocatedNow - target : remaining)}</p></div>
          </div>
          <MeterBar pct={target > 0 ? (allocatedNow / target) * 100 : 0} fill={over ? "#C0413A" : "var(--bz-fire)"} />
          <div className="mt-3 flex items-center gap-2">
            {txn.allocations.length > 0 && (
              <button onClick={onUnlinkAll} className={cn(GHOST_BTN, "h-9")}><Unlink size={12} /> Unlink all</button>
            )}
            <button onClick={confirm} disabled={!canConfirm || submitting} className={cn(PRIMARY_BTN, "flex-1")}>
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
              {remaining <= EPSILON && allocatedNow > EPSILON ? "Reconcile in full" : "Link & partially reconcile"}
            </button>
          </div>
          {over && <p className="mt-1.5 text-center text-[10.5px] text-[#9A2E29]">Allocation exceeds the line amount — reduce it to continue.</p>}
        </div>
      )}
    </div>
  );
}

// ── Create view ──

type VoucherKind = "receipt" | "check" | "journal" | "transfer";
const KIND_META: Record<VoucherKind, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; for: "in" | "out" | "any" }> = {
  receipt: { label: "Customer receipt", icon: Receipt, for: "in" },
  check: { label: "Vendor check", icon: CreditCard, for: "out" },
  journal: { label: "Journal entry", icon: BookText, for: "any" },
  transfer: { label: "Internal transfer", icon: ArrowLeftRight, for: "any" },
};

function CreateField({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-bz-text-muted">{label}{required && <span className="ml-0.5 text-bz-text">*</span>}</label>
      <div className={cn(error && "rounded-bz-md ring-1 ring-[#C0413A]")}>{children}</div>
    </div>
  );
}

const FIELD_INPUT = "h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text";

function CreateView({ txn, currency, onCreate, locked }: { txn: BankTxn; currency: string; onCreate: (alloc: Allocation) => void; locked: boolean }) {
  const isIn = txn.amount >= 0;
  const suggested: VoucherKind = txn.mirror ? "transfer" : isIn ? "receipt" : "check";
  const [kind, setKind] = React.useState<VoucherKind>(suggested);
  const [party, setParty] = React.useState(txn.party ?? "");
  const [date, setDate] = React.useState(txn.dateISO);
  const [amount, setAmount] = React.useState(String(Math.round(remainingOf(txn))));
  const [memo, setMemo] = React.useState(txn.description);
  const [acctA, setAcctA] = React.useState(kind === "transfer" ? "Nabil Bank — Current" : "");
  const [acctB, setAcctB] = React.useState(kind === "transfer" && txn.mirror ? txn.mirror.account : "");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setKind(suggested); setParty(txn.party ?? ""); setDate(txn.dateISO); setAmount(String(Math.round(remainingOf(txn)))); setMemo(txn.description);
    setAcctA("Nabil Bank — Current"); setAcctB(txn.mirror?.account ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn.id]);

  const amt = Number(amount.replace(/[^0-9.]/g, "")) || 0;
  const valid = (() => {
    if (locked || amt <= 0) return false;
    if (kind === "receipt" || kind === "check") return party.trim().length > 0;
    if (kind === "journal") return memo.trim().length > 0;
    if (kind === "transfer") return acctA.trim() && acctB.trim() && acctA !== acctB;
    return false;
  })();

  const submit = () => {
    if (!valid) return;
    setSubmitting(true);
    const vno = kind === "receipt" ? "RCPT" : kind === "check" ? "CHK" : kind === "journal" ? "JE" : "TRF";
    const alloc: Allocation = { id: `c-${Date.now()}`, voucher: `${vno}-${Math.floor(7000 + Math.random() * 999)}`, voucherType: KIND_META[kind].label, amount: amt, origin: "created" };
    window.setTimeout(() => onCreate(alloc), 700);
  };

  if (locked) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <Ban size={20} className="text-bz-text-soft" />
        <p className="text-[12.5px] font-medium text-bz-text-muted">{statusOf(txn) === "cancelled" ? "Cancelled" : "Fully reconciled"}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-2"><SectionLabel>Voucher kind</SectionLabel></div>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(KIND_META) as VoucherKind[]).map((k) => {
            const m = KIND_META[k]; const Icon = m.icon; const on = kind === k; const sug = k === suggested;
            return (
              <button key={k} onClick={() => setKind(k)} className={cn("flex items-center gap-2 rounded-bz-md border px-2.5 py-2 text-left transition-colors", on ? "border-bz-text bg-bz-fire/[0.08]" : "border-bz-line-soft bg-bz-surface hover:border-bz-line")}>
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-sm", on ? "bg-bz-olive text-bz-fire" : "bg-bz-paper-warm text-bz-text-muted")}><Icon size={14} /></span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-bz-text">{m.label}</span>
                  {sug && <span className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-leaf-deep">Suggested</span>}
                </span>
              </button>
            );
          })}
        </div>

        {txn.mirror && kind === "transfer" && (
          <div className="mt-3 flex items-start gap-2 rounded-bz-md border border-bz-fire/40 bg-bz-fire/[0.10] px-3 py-2.5">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-bz-leaf-deep" />
            <p className="text-[11px] leading-relaxed text-bz-text"><span className="font-semibold">Mirror leg detected.</span> {txn.mirror.line} on <span className="font-medium">{txn.mirror.account}</span> — both sides will be linked on save.</p>
          </div>
        )}

        <div className="mt-3 flex flex-col gap-3">
          {(kind === "receipt" || kind === "check") && (
            <CreateField label={kind === "receipt" ? "Customer" : "Vendor"} required error={!party.trim()}>
              <input value={party} onChange={(e) => setParty(e.target.value)} placeholder={kind === "receipt" ? "Search customers…" : "Search vendors…"} className={FIELD_INPUT} />
            </CreateField>
          )}
          {kind === "transfer" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CreateField label="From account" required><input value={acctA} onChange={(e) => setAcctA(e.target.value)} className={FIELD_INPUT} /></CreateField>
              <CreateField label="To account" required error={!!acctB && acctA === acctB}><input value={acctB} onChange={(e) => setAcctB(e.target.value)} placeholder="Search accounts…" className={FIELD_INPUT} /></CreateField>
            </div>
          )}
          {kind === "journal" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CreateField label={isIn ? "Credit account" : "Debit account"} required><input defaultValue={isIn ? "Interest income" : "Bank charges"} className={FIELD_INPUT} /></CreateField>
              <CreateField label="Bank account" required><input value="Nabil Bank — Current" readOnly className={cn(FIELD_INPUT, "bg-bz-paper-warm text-bz-text-muted")} /></CreateField>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <CreateField label="Date" required><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(FIELD_INPUT, NUM)} /></CreateField>
            <CreateField label="Amount" required error={amt <= 0}>
              <div className="flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 focus-within:border-bz-text">
                <span className="text-[10px] font-semibold text-bz-text-soft">{currency}</span>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} className={cn("h-full w-full bg-transparent text-[13px] font-semibold text-bz-text outline-none", NUM)} />
              </div>
            </CreateField>
          </div>
          <CreateField label="Memo / description"><textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2 text-[13px] leading-relaxed text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text" /></CreateField>
        </div>
      </div>

      <div className="border-t border-bz-line-soft bg-bz-paper px-4 py-3">
        <button onClick={submit} disabled={!valid || submitting} className={cn(PRIMARY_BTN, "w-full")}>
          {submitting ? <Loader2 size={13} className="animate-spin" /> : <FilePlus2 size={13} />}
          Create {KIND_META[kind].label.toLowerCase()} & reconcile
        </button>
        {!valid && amt <= 0 && <p className="mt-1.5 text-center text-[10.5px] text-bz-text-muted">Enter an amount to continue.</p>}
      </div>
    </div>
  );
}

// ── Details / manage view ──

function DetailsView({ txn, currency, onReverse, onCancel }: { txn: BankTxn; currency: string; onReverse: (allocId: string) => void; onCancel: (reason: string) => void }) {
  const st = statusOf(txn);
  const locked = st === "cancelled" || st === "reconciled";
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [reverseId, setReverseId] = React.useState<string | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {/* detail grid */}
        <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <Detail label="Transaction date" value={fmtAD(txn.dateISO)} mono />
            <Detail label="Value date" value={fmtAD(txn.valueDateISO)} mono />
            <Detail label="Party" value={txn.party ?? "—"} />
            <Detail label="Reference" value={txn.reference ?? "—"} mono />
            <Detail label="Direction" value={txn.amount >= 0 ? "Deposit (money in)" : "Withdrawal (money out)"} />
            <Detail label="Statement line" value={`#${txn.statementLine}`} mono />
          </div>
        </div>

        {txn.hint && (
          <div className="mt-3 flex items-start gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2.5">
            <Info size={13} className="mt-0.5 shrink-0 text-bz-text-muted" />
            <p className="text-[11px] leading-relaxed text-bz-text-muted">{txn.hint}</p>
          </div>
        )}

        {txn.cancelled && txn.cancelReason && (
          <div className="mt-3 flex items-start gap-2 rounded-bz-md border border-[#F0C9C4] bg-[#FBE7E5] px-3 py-2.5">
            <Ban size={13} className="mt-0.5 shrink-0 text-[#9A2E29]" />
            <p className="text-[11px] leading-relaxed text-[#9A2E29]"><span className="font-semibold">Cancelled.</span> {txn.cancelReason}</p>
          </div>
        )}

        {/* linked vouchers */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <SectionLabel>Linked vouchers</SectionLabel>
            <span className={cn("text-[10.5px] text-bz-text-muted", NUM)}>{txn.allocations.length} linked · {grp(allocatedOf(txn))} of {grp(Math.abs(txn.amount))}</span>
          </div>
          {txn.allocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line py-7 text-center">
              <Inbox size={16} className="text-bz-text-soft" />
              <p className="text-[11.5px] font-medium text-bz-text-muted">No vouchers linked yet</p>
              <p className="text-[10.5px] text-bz-text-soft">Use Match or Create to reconcile this line.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {txn.allocations.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2">
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-sm", a.origin === "created" ? "bg-bz-fire/[0.18] text-bz-leaf-deep" : "bg-bz-paper-warm text-bz-text-muted")}>
                    {a.origin === "created" ? <FilePlus2 size={13} /> : <Link2 size={13} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[12.5px] font-semibold text-bz-text", NUM)}>{a.voucher}</p>
                    <p className="text-[10.5px] text-bz-text-soft">{a.voucherType} · {a.origin === "created" ? "Newly created" : "Matched"}</p>
                  </div>
                  <span className="shrink-0 text-right"><span className="text-[9.5px] font-semibold text-bz-text-soft">{currency} </span><span className={cn("text-[12.5px] font-semibold text-bz-text", NUM)}>{grp(a.amount)}</span></span>
                  <button onClick={() => setReverseId(a.id)} disabled={txn.cancelled} className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-[#FBE7E5] hover:text-[#9A2E29] disabled:opacity-30" title="Reverse this allocation"><Unlink size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* manage footer */}
      <div className="border-t border-bz-line-soft bg-bz-paper px-4 py-3">
        {txn.cancelled ? (
          <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-bz-text-muted"><Ban size={12} /> Cancelled lines are locked from further action.</p>
        ) : st === "reconciled" ? (
          <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-bz-text-muted"><CheckCircle2 size={12} className="text-bz-leaf-deep" /> Fully reconciled — reverse an allocation to make changes.</p>
        ) : (
          <button onClick={() => setCancelOpen(true)} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-bz-md border border-[#E7B7B1] bg-[#FBE7E5] px-3 text-[12px] font-semibold text-[#9A2E29] hover:bg-[#f7dad6]">
            <Ban size={13} /> Cancel this transaction
          </button>
        )}
      </div>

      {/* reverse confirm */}
      <ConfirmDialog
        open={!!reverseId}
        title="Reverse this allocation?"
        body="The voucher will be unlinked from this bank line and the cleared balance will recompute. The voucher itself is not deleted."
        confirmLabel="Reverse allocation"
        danger
        onConfirm={() => { if (reverseId) onReverse(reverseId); setReverseId(null); }}
        onClose={() => setReverseId(null)}
      />

      {/* cancel dialog */}
      {cancelOpen && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div onClick={() => setCancelOpen(false)} className="absolute inset-0 bg-bz-olive/40 backdrop-blur-[1px]" aria-hidden />
          <div className="relative w-full max-w-[420px] overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_24px_60px_-20px_rgba(15,20,17,0.4)]">
            <div className="flex items-start gap-3 px-5 pb-3 pt-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-[#FBE7E5] text-[#9A2E29]"><Ban size={16} /></span>
              <div>
                <p className="text-[14px] font-semibold text-bz-text">Cancel this transaction</p>
                <p className="mt-1 text-[12px] leading-relaxed text-bz-text-muted">Cancelling removes this line from reconciliation and unlinks any vouchers. Give a reason for the audit trail.</p>
              </div>
            </div>
            <div className="px-5">
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="e.g. Duplicate of an earlier import…" className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text" />
            </div>
            <div className="mt-3 flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/50 px-5 py-3">
              <button onClick={() => setCancelOpen(false)} className={cn(GHOST_BTN, "h-8")}>Keep it</button>
              <button onClick={() => { onCancel(reason.trim() || "No reason given"); setCancelOpen(false); }} className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-[#C0413A] px-3.5 text-[12px] font-semibold text-white hover:opacity-95">
                <Ban size={12} /> Cancel transaction
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-bz-text-soft">{label}</p>
      <p className={cn("mt-0.5 truncate text-[12px] text-bz-text", mono && NUM)}>{value}</p>
    </div>
  );
}

function WorkingPanel({
  txn, currency, onReconcile, onUnlinkAll, onReverse, onCancel,
}: {
  txn: BankTxn | null;
  currency: string;
  onReconcile: (allocs: Allocation[]) => void;
  onUnlinkAll: () => void;
  onReverse: (allocId: string) => void;
  onCancel: (reason: string) => void;
}) {
  const st = txn ? statusOf(txn) : null;
  const locked = st === "cancelled" || st === "reconciled";
  const [tab, setTab] = React.useState<WorkTab>("match");

  React.useEffect(() => {
    if (!txn) return;
    setTab(locked ? "details" : "match");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn?.id]);

  if (!txn) {
    return (
      <section className="flex min-h-[360px] flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface lg:sticky lg:top-4 lg:h-[calc(100vh-7.5rem)]">
        <PanelEmpty />
      </section>
    );
  }

  const TABS: { key: WorkTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; disabled?: boolean }[] = [
    { key: "match", label: "Match", icon: Link2, disabled: locked },
    { key: "create", label: "Create", icon: FilePlus2, disabled: locked },
    { key: "details", label: "Manage", icon: ListChecks },
  ];

  return (
    <section className="flex min-h-[360px] flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface lg:sticky lg:top-4 lg:h-[calc(100vh-7.5rem)]">
      <TxnHeadline txn={txn} currency={currency} />
      <div className="flex items-center gap-1 border-b border-bz-line-soft bg-bz-paper-warm/40 px-2 py-1.5">
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => !t.disabled && setTab(t.key)}
              disabled={t.disabled}
              title={t.disabled ? "Locked — this line is reconciled or cancelled" : undefined}
              className={cn("inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-bz-sm text-[12px] font-medium transition-colors", on ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : t.disabled ? "cursor-not-allowed text-bz-text-soft" : "text-bz-text-muted hover:text-bz-text")}
            >
              <t.icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "match" && <MatchView txn={txn} currency={currency} onConfirm={onReconcile} onUnlinkAll={onUnlinkAll} locked={!!locked} />}
      {tab === "create" && <CreateView txn={txn} currency={currency} onCreate={(a) => onReconcile([a])} locked={!!locked} />}
      {tab === "details" && <DetailsView txn={txn} currency={currency} onReverse={onReverse} onCancel={onCancel} />}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6 · CONTEXTUAL BULK-ACTION BAR  (docked — appears when ≥2 lines are checked)
// ════════════════════════════════════════════════════════════════════════════

type BulkAction = { key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; disabledReason?: string };

function BulkBar({ selected, currency, onClear, onRun }: { selected: BankTxn[]; currency: string; onClear: () => void; onRun: (label: string) => void }) {
  const count = selected.length;
  const allIn = selected.every((t) => t.amount >= 0);
  const allOut = selected.every((t) => t.amount < 0);
  const direction = allIn ? "All deposits" : allOut ? "All withdrawals" : "Mixed directions";
  const net = selected.reduce((s, t) => s + t.amount, 0);

  const sameParty = selected.every((t) => t.party && t.party === selected[0].party);
  const pair = count === 2;
  const opposite = pair && selected[0].amount * selected[1].amount < 0 && Math.abs(Math.abs(selected[0].amount) - Math.abs(selected[1].amount)) < EPSILON;

  const actions: BulkAction[] = [
    { key: "receipt", label: "Bulk customer receipt", icon: Receipt, disabledReason: !allIn ? "Needs all deposits" : !sameParty ? "Needs one party" : undefined },
    { key: "check", label: "Bulk vendor check", icon: CreditCard, disabledReason: !allOut ? "Needs all withdrawals" : !sameParty ? "Needs one party" : undefined },
    { key: "transfer", label: "Internal transfer", icon: ArrowLeftRight, disabledReason: !opposite ? "Needs a matching opposite pair" : undefined },
  ];

  const [confirm, setConfirm] = React.useState<BulkAction | null>(null);
  const [busy, setBusy] = React.useState(false);

  return (
    <>
      <div className="border-t border-bz-line bg-bz-olive px-3 py-2.5 text-bz-text-on-dark md:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-bz-md bg-bz-fire text-[12px] font-bold text-bz-olive">{count}</span>
            <div className="leading-tight">
              <p className="text-[12.5px] font-semibold">{count} lines selected</p>
              <p className={cn("text-[10.5px] text-white/60", NUM)}>{direction} · net {currency} {signed(net)}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
            {actions.map((a) => {
              const disabled = !!a.disabledReason;
              return (
                <button
                  key={a.key}
                  onClick={() => !disabled && setConfirm(a)}
                  disabled={disabled}
                  title={a.disabledReason}
                  className={cn("inline-flex h-8 items-center gap-1.5 rounded-bz-md px-2.5 text-[11.5px] font-semibold transition-colors", disabled ? "cursor-not-allowed bg-white/[0.06] text-white/35" : "bg-white/[0.12] text-bz-text-on-dark hover:bg-white/[0.18]")}
                >
                  <a.icon size={12} /> <span className="hidden sm:inline">{a.label}</span><span className="sm:hidden">{a.label.replace("Bulk ", "")}</span>
                  {disabled && <span className="hidden text-[9.5px] font-medium text-white/45 lg:inline">· {a.disabledReason}</span>}
                </button>
              );
            })}
            <button onClick={onClear} className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-white/15 px-2.5 text-[11.5px] font-medium text-white/75 hover:bg-white/[0.08]">
              <X size={12} /> Clear
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.label ?? ""}
        body={<>This will create one voucher across the <span className="font-semibold text-bz-text">{count}</span> selected lines and reconcile them together. Balances will refresh and the selection will clear.</>}
        confirmLabel="Run bulk action"
        busy={busy}
        onConfirm={() => {
          if (!confirm) return;
          setBusy(true);
          window.setTimeout(() => { onRun(confirm.label); setBusy(false); setConfirm(null); }, 700);
        }}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST  +  AUTO-RECONCILE RESULT BANNER
// ════════════════════════════════════════════════════════════════════════════

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => { const t = window.setTimeout(onClose, 3800); return () => window.clearTimeout(t); }, [message, onClose]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className="flex size-7 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18]"><Check size={13} className="text-bz-leaf-deep" /></span>
        <p className="text-[12.5px] font-medium text-bz-text">{message}</p>
        <button onClick={onClose} className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EMPTY (no account chosen)
// ════════════════════════════════════════════════════════════════════════════

function NoAccountState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-28 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-lg bg-bz-paper-warm text-bz-text-soft"><Landmark size={22} /></span>
      <p className="text-[13.5px] font-medium text-bz-text-muted">Choose a bank account to begin</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function BankReconciliationDesignPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // account / period (remembered across re-renders)
  const [account, setAccount] = React.useState<string | null>(params.get("account") ?? "acc-nabil-cur");
  const [period, setPeriod] = React.useState<Period>({ from: "2026-06-01", to: "2026-06-30", refMode: false });

  const acc = accountById(account);
  const currency = acc?.currency ?? "NPR";

  // transaction set (only the default Nabil account carries the rich seed; others demo the empty state)
  const [txns, setTxns] = React.useState<BankTxn[]>(account === "acc-nabil-cur" ? SEED_TXNS : []);
  const [statementClosing, setStatementClosing] = React.useState<number>(2_266_850);

  // ui
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [autoBusy, setAutoBusy] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [scope, setScope] = React.useState<Scope>("unreconciled");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [checkedIds, setCheckedIds] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<string | null>(null);
  const [autoResult, setAutoResult] = React.useState<{ matched: number; partial: number; review: number } | null>(null);

  const notify = (m: string) => setToast(m);

  // live reload whenever account / period changes (debounced, de-duplicated)
  const queryKey = `${account}|${period.from}|${period.to}|${period.refMode}`;
  const lastKey = React.useRef<string>("");
  React.useEffect(() => {
    if (!account) { setLoading(false); return; }
    if (lastKey.current === queryKey) return;
    lastKey.current = queryKey;
    setLoading(true);
    setActiveId(null);
    setCheckedIds(new Set());
    const t = window.setTimeout(() => {
      setTxns(account === "acc-nabil-cur" ? SEED_TXNS : []);
      setStatementClosing(account === "acc-nabil-cur" ? 2_266_850 : (acc?.openingCleared ?? 0));
      setLoading(false);
    }, 520);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, account]);

  // auto-dismiss the auto-reconcile banner
  React.useEffect(() => { if (!autoResult) return; const t = window.setTimeout(() => setAutoResult(null), 6000); return () => window.clearTimeout(t); }, [autoResult]);

  // ── derived balances (reconcile live from the txn state) ──
  const opening = acc?.openingCleared ?? 0;
  const nonCancelled = txns.filter((t) => !t.cancelled);
  const moves = nonCancelled.reduce((s, t) => s + t.amount, 0);
  const system = opening + moves;
  const cleared = opening + txns.reduce((s, t) => s + (t.cancelled ? 0 : (t.amount >= 0 ? 1 : -1) * allocatedOf(t)), 0);
  const diff = statementClosing - cleared;
  const matched = Math.abs(diff) < EPSILON;

  // counts
  const unrecCount = txns.filter((t) => statusOf(t) === "unreconciled").length;
  const partialCount = txns.filter((t) => statusOf(t) === "partial").length;
  const unalloc = txns.filter((t) => { const s = statusOf(t); return s === "unreconciled" || s === "partial"; }).reduce((s, t) => s + remainingOf(t), 0);

  // ── filtered view ──
  const q = search.trim().toLowerCase();
  const visible = React.useMemo(() => txns.filter((t) => {
    const s = statusOf(t);
    if (scope === "unreconciled" && s !== "unreconciled") return false;
    if (scope === "partial" && s !== "partial") return false;
    if (q) {
      const hay = `${t.description} ${t.reference ?? ""} ${t.party ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [txns, scope, q]);

  // prune selections that no longer exist in the visible set
  React.useEffect(() => {
    setCheckedIds((prev) => {
      const ids = new Set(visible.map((t) => t.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => { if (ids.has(id)) next.add(id); else changed = true; });
      return changed ? next : prev;
    });
    if (activeId && !txns.some((t) => t.id === activeId)) setActiveId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.length, txns]);

  const activeTxn = txns.find((t) => t.id === activeId) ?? null;
  const selectedTxns = txns.filter((t) => checkedIds.has(t.id));

  // ── coordinated post-action refresh ──
  const postAction = (mutate: (list: BankTxn[]) => BankTxn[], message: string, keepActive = false) => {
    setTxns((prev) => mutate(prev));
    if (!keepActive) setActiveId(null);
    setCheckedIds(new Set());
    setLoading(true);
    window.setTimeout(() => setLoading(false), 420);
    notify(message);
  };

  const reconcileActive = (allocs: Allocation[]) => {
    if (!activeTxn) return;
    const id = activeTxn.id;
    postAction((list) => list.map((t) => t.id === id ? { ...t, allocations: [...t.allocations, ...allocs] } : t), `${activeTxn.id} reconciled · balances updated`);
  };
  const unlinkActive = () => {
    if (!activeTxn) return; const id = activeTxn.id;
    postAction((list) => list.map((t) => t.id === id ? { ...t, allocations: [] } : t), `${activeTxn.id} unlinked`);
  };
  const reverseAlloc = (allocId: string) => {
    if (!activeTxn) return; const id = activeTxn.id;
    postAction((list) => list.map((t) => t.id === id ? { ...t, allocations: t.allocations.filter((a) => a.id !== allocId) } : t), "Allocation reversed", true);
  };
  const cancelActive = (reason: string) => {
    if (!activeTxn) return; const id = activeTxn.id;
    postAction((list) => list.map((t) => t.id === id ? { ...t, cancelled: true, cancelReason: reason, allocations: [] } : t), `${activeTxn.id} cancelled`, true);
  };
  const runBulk = (label: string) => {
    const ids = new Set(checkedIds);
    postAction((list) => list.map((t) => ids.has(t.id) && !t.cancelled ? { ...t, allocations: [{ id: `b-${t.id}`, voucher: `BLK-${t.statementLine}`, voucherType: label, amount: Math.abs(t.amount), origin: "created" as AllocOrigin }] } : t), `${label} · ${ids.size} lines reconciled`);
  };

  const onCheck = (id: string, v: boolean) => setCheckedIds((prev) => { const n = new Set(prev); v ? n.add(id) : n.delete(id); return n; });
  const onCheckAll = (on: boolean) => setCheckedIds(on ? new Set(visible.map((t) => t.id)) : new Set());

  const refresh = () => { setRefreshing(true); setLoading(true); window.setTimeout(() => { setRefreshing(false); setLoading(false); notify("Data re-run for this account & period"); }, 640); };
  const pullOlder = () => { setLoading(true); window.setTimeout(() => { setLoading(false); notify("Pulled in older unreconciled items (none outstanding)"); }, 560); };
  const importStatement = () => navigate(`/design/bank-import?account=${account}`);

  const autoReconcile = () => {
    setAutoBusy(true);
    window.setTimeout(() => {
      // auto-match lines whose description/ref/amount line up with a single high-confidence voucher
      let matchedN = 0, partialN = 0, reviewN = 0;
      setTxns((prev) => prev.map((t) => {
        if (t.cancelled || statusOf(t) !== "unreconciled") return t;
        const best = VOUCHER_POOL.map((v) => ({ v, ...rankCandidate(t, v) })).sort((a, b) => b.score - a.score)[0];
        if (best && best.score >= 80) {
          matchedN++;
          return { ...t, allocations: [{ id: `auto-${t.id}`, voucher: best.v.id, voucherType: best.v.type, amount: Math.min(best.v.open, Math.abs(t.amount)), origin: "matched" as AllocOrigin }] };
        }
        if (best && best.score >= 50) { partialN++; return t; }
        reviewN++; return t;
      }));
      setAutoBusy(false);
      setActiveId(null);
      setCheckedIds(new Set());
      setLoading(true);
      window.setTimeout(() => setLoading(false), 420);
      setAutoResult({ matched: matchedN, partial: partialN, review: reviewN });
    }, 1100);
  };

  // welcome toast when returning from the import wizard
  React.useEffect(() => {
    if (params.get("imported") === "1") {
      const n = params.get("count") ?? "12";
      notify(`${n} imported transactions are ready to reconcile`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Finance</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Bank Reconciliation</span>
        </>
      }
      overlay={
        <>
          {selectedTxns.length >= 2 && <BulkBar selected={selectedTxns} currency={currency} onClear={() => setCheckedIds(new Set())} onRun={runBulk} />}
          {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </>
      }
    >
      <div className="border-b border-bz-line bg-bz-paper pb-6">
        <ControlBar
          account={account}
          onAccount={setAccount}
          period={period}
          onPeriod={setPeriod}
          onRefresh={refresh}
          onPullOlder={pullOlder}
          onImport={importStatement}
          onAuto={autoReconcile}
          autoBusy={autoBusy}
          refreshing={refreshing}
        />
        {account && (
          <div className="px-4 md:px-8">
            <Scoreboard
              opening={opening}
              cleared={cleared}
              system={system}
              statementClosing={statementClosing}
              currency={currency}
              loading={loading}
              matched={matched}
              diff={diff}
              onCommitClosing={setStatementClosing}
            />
          </div>
        )}
      </div>

      {!account ? (
        <NoAccountState />
      ) : (
        <div className="flex flex-col gap-3 px-4 pb-10 pt-5 md:px-8">
          {autoResult && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-bz-md border border-bz-fire/40 bg-bz-fire/[0.10] px-3.5 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-bz-text"><Wand2 size={13} className="text-bz-leaf-deep" /> Auto-reconcile pass complete</span>
              <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}><span className="font-semibold text-bz-text">{autoResult.matched}</span> matched · <span className="font-semibold text-bz-text">{autoResult.partial}</span> partially matched · <span className="font-semibold text-bz-text">{autoResult.review}</span> need review</span>
              <button onClick={() => setAutoResult(null)} className="ml-auto flex size-5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/30"><X size={11} /></button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,480px)]">
            <div className="flex min-h-[420px] flex-col lg:max-h-[calc(100vh-7.5rem)]">
              <TxnBrowser
                txns={visible}
                currency={currency}
                loading={loading}
                search={search}
                onSearch={setSearch}
                scope={scope}
                onScope={setScope}
                activeId={activeId}
                checkedIds={checkedIds}
                onOpen={(id) => { setActiveId(id); if (typeof window !== "undefined" && window.innerWidth < 1024) requestAnimationFrame(() => document.getElementById("bz-working-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })); }}
                onCheck={onCheck}
                onCheckAll={onCheckAll}
                counts={{ unrec: unrecCount, partial: partialCount, unalloc }}
              />
            </div>

            <div id="bz-working-panel" className="scroll-mt-4">
              <WorkingPanel
                txn={activeTxn}
                currency={currency}
                onReconcile={reconcileActive}
                onUnlinkAll={unlinkActive}
                onReverse={reverseAlloc}
                onCancel={cancelActive}
              />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
