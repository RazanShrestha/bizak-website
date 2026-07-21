import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router";
import {
  FileUp,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  Upload,
  FileText,
  FileSpreadsheet,
  FileDown,
  X,
  Loader2,
  Landmark,
  ArrowLeft,
  ArrowRight,
  Search,
  Info,
  TriangleAlert,
  CircleSlash,
  RotateCw,
  Clock,
  XCircle,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { BANK_ACCOUNTS, accountById } from "./BankReconciliationDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// BANK STATEMENT IMPORT · GUIDED CANVAS
//
// Primary action = thread ONE statement file through a gated, forward-chained
// flow — Source → Mapping → Preview → Import — until it lands validated,
// de-duplicated bank transactions for a single account.
//
// The centre of gravity is therefore the FLOW itself. Structure:
//   • a vertical PHASE RAIL (left) — the spine; every phase's node + a short
//     "good to know" card scoped to the active phase. Backward-only re-visit.
//   • a calm WORKSPACE (right) — only the active phase's controls exist, and
//     only once its upstream input exists (conditional presence throughout).
//   • a docked ACTION BAR (AppShell overlay) — back + the one gated advance
//     control, relabelled per phase; toasts stack above it.
//
// The UI never tallies or validates: row counts, per-row new/duplicate/error
// classification and progress are all "server-computed" seeds. The UI renders,
// classifies-by-state, gates, and — on the final phase — self-refreshes on a
// timer until the import reaches a terminal outcome.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";

const PRIMARY_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45";
const GHOST_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-semibold text-bz-text transition-colors hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40";
const LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";

// ════════════════════════════════════════════════════════════════════════════
// PHASE MODEL  (stage descriptors — key + label + one-line sub)
// ════════════════════════════════════════════════════════════════════════════

type PhaseKey = "source" | "mapping" | "preview" | "import";
const PHASES: { key: PhaseKey; label: string; sub: string }[] = [
  { key: "source", label: "Source", sub: "Account & file" },
  { key: "mapping", label: "Mapping", sub: "Match the columns" },
  { key: "preview", label: "Preview", sub: "Review parsed rows" },
  { key: "import", label: "Import", sub: "Run & watch" },
];
const PHASE_IDX: Record<PhaseKey, number> = { source: 0, mapping: 1, preview: 2, import: 3 };

// ════════════════════════════════════════════════════════════════════════════
// TARGET-FIELD VOCABULARY + DATA-DRIVEN TRANSFORMS
// (extension → format · column-name heuristic → guessed field)
// ════════════════════════════════════════════════════════════════════════════

const TARGETS: { key: string; label: string }[] = [
  { key: "date", label: "Transaction date" },
  { key: "deposit", label: "Deposit (credit)" },
  { key: "withdrawal", label: "Withdrawal (debit)" },
  { key: "description", label: "Description" },
  { key: "reference", label: "Reference no." },
  { key: "txn_id", label: "Transaction ID" },
  { key: "txn_type", label: "Transaction type" },
  { key: "cp_name", label: "Counterparty name" },
  { key: "cp_account", label: "Counterparty account no." },
  { key: "cp_iban", label: "Counterparty IBAN" },
  { key: "ignore", label: "Ignore this column" },
];
const TARGET_LABEL: Record<string, string> = Object.fromEntries(TARGETS.map((t) => [t.key, t.label]));

// Heuristic auto-guess seeded from a column's name (overridable by the user).
function guessTarget(header: string): string {
  const h = header.toLowerCase();
  if (/(value|posting)\s*date/.test(h)) return "ignore";
  if (/date/.test(h)) return "date";
  if (/(withdraw|debit|\bdr\b|outflow|paid out)/.test(h)) return "withdrawal";
  if (/(deposit|credit|\bcr\b|inflow|paid in)/.test(h)) return "deposit";
  if (/(balance|running)/.test(h)) return "ignore";
  if (/(iban)/.test(h)) return "cp_iban";
  if (/(a\/c|acc(oun)?t\s*(no|number))/.test(h)) return "cp_account";
  if (/(cheque|ref|utr|rrn)/.test(h)) return "reference";
  if (/(txn\s*id|transaction\s*id|tran\s*id|\bid\b)/.test(h)) return "txn_id";
  if (/(type|mode|channel)/.test(h)) return "txn_type";
  if (/(narration|desc|particular|detail|remark)/.test(h)) return "description";
  if (/(counter|party|payee|beneficiary|name)/.test(h)) return "cp_name";
  return "ignore";
}

type FileFormat = "CSV" | "XLSX";
function detectFormat(name: string): FileFormat | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return "CSV";
  if (ext === "xlsx" || ext === "xls") return "XLSX";
  return null;
}
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── "server" parse output: detected header row of a real-shaped NP bank CSV ──
const DETECTED_HEADERS = [
  "Tran Date", "Value Date", "Cheque/Ref No", "Narration",
  "Withdrawal Amt", "Deposit Amt", "Running Balance", "Transaction Id", "Counterparty",
];

// Per-account mapping memory — a saved mapping lets future imports skip this
// phase. The context account (Nabil) already has one; others fall to heuristics.
const SAVED_MAPPINGS: Record<string, Record<string, string>> = {
  "acc-nabil-cur": {
    "Tran Date": "date", "Value Date": "ignore", "Cheque/Ref No": "reference",
    "Narration": "description", "Withdrawal Amt": "withdrawal", "Deposit Amt": "deposit",
    "Running Balance": "ignore", "Transaction Id": "txn_id", "Counterparty": "cp_name",
  },
};

// ── server-computed tallies for the WHOLE parsed file (not the preview sample) ──
const SERVER_COUNTS = { total: 214, new: 176, duplicate: 32, error: 6 }; // 176+32+6 = 214

// the import job touches new + duplicates (error rows are never queued);
// during the run a few new rows fail to post. Everything reconciles to queued.
const IMPORT_JOB = {
  queued: SERVER_COUNTS.new + SERVER_COUNTS.duplicate, // 208
  imported: 173,
  skipped: SERVER_COUNTS.duplicate, // 32
  failed: 3, // 173 + 3 = 176 new
};
const ERROR_LOG = [
  { row: 47, text: 'row 47 · amount field "N/A" is not numeric — row not posted' },
  { row: 118, text: 'row 118 · ledger for counterparty could not be resolved — skipped' },
  { row: 201, text: 'row 201 · value date 2026-13-02 is out of range — rejected' },
];

// ── preview sample: the first N rows only (server-classified) ──
type Klass = "new" | "duplicate" | "error";
type PreviewRow = {
  seq: number;
  dateISO: string | null;
  deposit: number | null;
  withdrawal: number | null;
  description: string;
  reference: string | null;
  klass: Klass;
  reason?: string;
};
const PREVIEW_N = 12;
const PREVIEW_ROWS: PreviewRow[] = [
  { seq: 1, dateISO: "2026-06-16", deposit: 412000, withdrawal: null, description: "NEFT credit — Buddha Air Pvt Ltd", reference: "NEFT-8120", klass: "new" },
  { seq: 2, dateISO: "2026-06-16", deposit: null, withdrawal: 96500, description: "Cheque paid — Laxmi Stationers", reference: "CHQ-5588", klass: "new" },
  { seq: 3, dateISO: "2026-06-17", deposit: 312500, withdrawal: null, description: "NEFT credit — Everest Hardware Supplies", reference: "NEFT-7741", klass: "duplicate", reason: "Transaction ID already imported (BT-1041)" },
  { seq: 4, dateISO: "2026-06-17", deposit: null, withdrawal: 248000, description: "Standing order — office rent", reference: "SO-RENT-06", klass: "new" },
  { seq: 5, dateISO: "2026-06-18", deposit: 89400, withdrawal: null, description: "Deposit — Annapurna Distributors", reference: "DEP-2310", klass: "new" },
  { seq: 6, dateISO: "2026-06-18", deposit: 1250000, withdrawal: null, description: "RTGS credit — Sagarmatha Steel Udyog", reference: "RTGS-9981", klass: "duplicate", reason: "Transaction ID already imported (BT-1036)" },
  { seq: 7, dateISO: null, deposit: null, withdrawal: 18750, description: "POS PURCHASE KATHMANDU 4471", reference: "POS-44910", klass: "error", reason: 'Date "31/13/2026" could not be parsed' },
  { seq: 8, dateISO: "2026-06-19", deposit: null, withdrawal: 54200, description: "Bank charges — quarterly", reference: "CHG-Q1", klass: "new" },
  { seq: 9, dateISO: "2026-06-19", deposit: 486000, withdrawal: null, description: "NEFT credit — Himalayan Traders", reference: "NEFT-8144", klass: "new" },
  { seq: 10, dateISO: "2026-06-20", deposit: null, withdrawal: 742000, description: "NEA — electricity (Jaishtha)", reference: "BILL-44120", klass: "new" },
  { seq: 11, dateISO: "2026-06-20", deposit: 67400, withdrawal: null, description: "Deposit — Pokhara Electronics", reference: "DEP-2301", klass: "duplicate", reason: "Transaction ID already imported (BT-1031)" },
  { seq: 12, dateISO: "2026-06-21", deposit: null, withdrawal: 124600, description: "Refund paid — Gandaki Auto Parts", reference: "CHQ-5571", klass: "new" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtAD(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
const grp = (n: number | null) => (n == null ? "—" : Math.round(n).toLocaleString("en-US"));

// ════════════════════════════════════════════════════════════════════════════
// TOASTS  (success / warning — the flow's notification feedback)
// ════════════════════════════════════════════════════════════════════════════

type ToastKind = "success" | "warning";
type ToastItem = { id: number; kind: ToastKind; text: string };

function useToasts() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);
  const push = React.useCallback((kind: ToastKind, text: string) => {
    setToasts((t) => [...t, { id: ++idRef.current, kind, text }].slice(-3));
  }, []);
  const dismiss = React.useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  return { toasts, push, dismiss };
}

function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastRow({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const { id } = toast;
  // both `id` and `onDismiss` (a stable useCallback) are stable, so the timer
  // is scheduled once and isn't reset by unrelated parent re-renders (e.g. the
  // import-phase poll tick).
  React.useEffect(() => {
    const t = window.setTimeout(() => onDismiss(id), 4200);
    return () => window.clearTimeout(t);
  }, [id, onDismiss]);
  const ok = toast.kind === "success";
  return (
    <div className="pointer-events-auto flex w-full max-w-[420px] items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.24)]">
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-pill", ok ? "bg-bz-fire/[0.22]" : "bg-[#FBE7E5]")}>
        {ok ? <Check size={13} className="text-bz-leaf-deep" /> : <TriangleAlert size={13} className="text-[#9A2E29]" />}
      </span>
      <p className="min-w-0 flex-1 text-[12.5px] font-medium text-bz-text">{toast.text}</p>
      <button onClick={() => onDismiss(id)} aria-label="Dismiss" className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
        <X size={11} />
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PORTAL HELPERS  (anchored position + outside/esc/scroll dismiss)
// ════════════════════════════════════════════════════════════════════════════

function useAnchorPos(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) { setPos(null); return; }
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, anchorRef]);
  return pos;
}

function useDismiss(
  open: boolean,
  onClose: () => void,
  innerRef: React.RefObject<HTMLElement | null>,
  anchorRef: React.RefObject<HTMLElement | null>,
) {
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (innerRef.current && !innerRef.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onScroll = (e: Event) => {
      if (innerRef.current && e.target instanceof Node && innerRef.current.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, innerRef, anchorRef]);
}

// ════════════════════════════════════════════════════════════════════════════
// BANK-ACCOUNT PICKER  searchable · lazy-loaded · keyboard-navigable single-select
// ════════════════════════════════════════════════════════════════════════════

function AccountPicker({
  value, onChange, locked, invalid, onToast,
}: {
  value: string | null;
  onChange: (id: string) => void;
  locked: boolean;
  invalid: boolean;
  onToast: (kind: ToastKind, text: string) => void;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const acc = accountById(value);
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={locked}
        onClick={() => setOpen((v) => !v)}
        aria-invalid={invalid}
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-bz-md border px-3 text-left transition-colors",
          locked
            ? "cursor-default border-bz-line-soft bg-bz-paper-warm"
            : invalid
            ? "border-[#C0413A] bg-bz-surface"
            : open
            ? "border-bz-text bg-bz-surface"
            : "border-bz-line bg-bz-surface hover:border-bz-text-muted",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-olive text-bz-fire">
          <Landmark size={15} />
        </span>
        <span className="min-w-0 flex-1">
          {acc ? (
            <>
              <span className="block truncate text-[13px] font-semibold text-bz-text">{acc.name}</span>
              <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{acc.number} · {acc.currency}</span>
            </>
          ) : (
            <span className="text-[13px] text-bz-text-soft">Choose the account to import into…</span>
          )}
        </span>
        {locked ? (
          <span className="shrink-0 rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[9.5px] font-semibold text-bz-text">From reconciliation</span>
        ) : (
          <ChevronDown size={15} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
        )}
      </button>
      <AccountDropdown
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
        value={value}
        onChange={(id) => { onChange(id); setOpen(false); onToast("success", `Importing into ${accountById(id)?.name}.`); }}
      />
    </>
  );
}

function AccountDropdown({
  anchorRef, open, onClose, value, onChange,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  value: string | null;
  onChange: (id: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const pos = useAnchorPos(open, anchorRef);
  const [raw, setRaw] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [loaded, setLoaded] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  useDismiss(open, onClose, ref, anchorRef);

  // Reset the search only when the picker opens (not when loading resolves,
  // which would wipe text typed during the load).
  React.useEffect(() => {
    if (open) { setRaw(""); setHi(0); }
  }, [open]);

  // Lazy load: the option set is fetched the first time the picker opens.
  React.useEffect(() => {
    if (!open) return;
    if (loaded) { setLoading(false); return; }
    setLoading(true);
    const t = window.setTimeout(() => { setLoading(false); setLoaded(true); }, 480);
    return () => window.clearTimeout(t);
  }, [open, loaded]);

  if (!open || !pos) return null;

  const q = raw.trim().toLowerCase();
  const options = q
    ? BANK_ACCOUNTS.filter((a) => `${a.name} ${a.number} ${a.bank}`.toLowerCase().includes(q))
    : BANK_ACCOUNTS;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const o = options[hi]; if (o) onChange(o.id); }
  };

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 300) }}
      className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
      onKeyDown={onKey}
    >
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input
            autoFocus
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setHi(0); }}
            placeholder="Search bank accounts…"
            className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {raw && (
            <button onClick={() => setRaw("")} aria-label="Clear" className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface">
              <X size={10} />
            </button>
          )}
        </div>
      </div>
      <div className="max-h-[264px] overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-7 text-bz-text-muted">
            <Loader2 size={13} className="animate-spin text-bz-fire" /> <span className="text-[11.5px]">Loading accounts…</span>
          </div>
        ) : options.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-3 py-7 text-center">
            <Search size={15} className="text-bz-text-soft" />
            <p className="text-[11.5px] font-medium text-bz-text-muted">No accounts match “{raw}”.</p>
          </div>
        ) : (
          options.map((a, i) => {
            const selected = a.id === value;
            const active = i === hi;
            return (
              <button
                key={a.id}
                onMouseEnter={() => setHi(i)}
                onClick={() => onChange(a.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm",
                  selected && "bg-bz-fire/[0.06]",
                )}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted">
                  <Landmark size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-bz-text">{a.name}</span>
                  <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{a.number} · opening {grp(a.openingCleared)}</span>
                </span>
                <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text-muted">{a.currency}</span>
                {selected && <Check size={13} className="shrink-0 text-bz-text" />}
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TARGET-FIELD SELECT  (per mapping row — fixed vocabulary + Ignore)
// ════════════════════════════════════════════════════════════════════════════

function FieldSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchorPos(open, btnRef);
  useDismiss(open, () => setOpen(false), ref, btnRef);
  const ignored = value === "ignore";
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface hover:border-bz-text-muted",
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate text-[12.5px]", ignored ? "text-bz-text-soft" : "font-medium text-bz-text")}>
          {TARGET_LABEL[value] ?? "Ignore this column"}
        </span>
        <ChevronDown size={13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && pos && createPortal(
        <div
          ref={ref}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 220) }}
          className="z-50 max-h-[292px] overflow-y-auto rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
        >
          {TARGETS.map((t) => {
            const selected = t.key === value;
            const isIgnore = t.key === "ignore";
            return (
              <React.Fragment key={t.key}>
                {isIgnore && <div className="my-1 h-px bg-bz-line-soft" />}
                <button
                  onClick={() => { onChange(t.key); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-bz-paper-warm",
                    selected && "bg-bz-fire/[0.06]",
                  )}
                >
                  <span className={cn("min-w-0 flex-1 truncate text-[12px]", isIgnore ? "text-bz-text-muted" : "text-bz-text")}>{t.label}</span>
                  {selected && <Check size={12} className="shrink-0 text-bz-text" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE RAIL  (vertical spine · done / active / upcoming · backward-only jump)
// ════════════════════════════════════════════════════════════════════════════

function PhaseRail({ current, visited, onJump }: { current: PhaseKey; visited: Set<PhaseKey>; onJump: (p: PhaseKey) => void }) {
  const curIdx = PHASE_IDX[current];
  return (
    <ol className="flex flex-col">
      {PHASES.map((p, i) => {
        const done = i < curIdx;
        const active = i === curIdx;
        const clickable = done && visited.has(p.key);
        const last = i === PHASES.length - 1;
        return (
          <li key={p.key} className="relative">
            {!last && (
              <span
                aria-hidden
                className={cn("absolute left-[15px] top-8 h-[calc(100%-16px)] w-px", i < curIdx ? "bg-bz-leaf-deep/50" : "bg-bz-line")}
              />
            )}
            <button
              type="button"
              onClick={() => clickable && onJump(p.key)}
              disabled={!clickable}
              aria-current={active ? "step" : undefined}
              title={clickable ? `Back to ${p.label}` : i > curIdx ? "Not yet reached" : undefined}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-bz-md px-1.5 py-2 text-left transition-colors",
                clickable ? "cursor-pointer hover:bg-bz-paper-warm/60" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "z-[1] flex size-8 shrink-0 items-center justify-center rounded-bz-pill border text-[12px] font-semibold transition-colors",
                  active
                    ? "border-bz-olive bg-bz-olive text-bz-fire"
                    : done
                    ? "border-bz-leaf-deep/40 bg-bz-fire/[0.18] text-bz-leaf-deep"
                    : "border-bz-line bg-bz-surface text-bz-text-soft",
                )}
              >
                {done ? <Check size={15} /> : <span className={NUM}>{i + 1}</span>}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-[13px] font-semibold leading-tight", active || done ? "text-bz-text" : "text-bz-text-soft")}>{p.label}</span>
                <span className="block text-[10.5px] leading-tight text-bz-text-muted">{p.sub}</span>
              </span>
              {active && <span className="ml-auto size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function MobilePhaseBar({ current }: { current: PhaseKey }) {
  const curIdx = PHASE_IDX[current];
  return (
    <div className="flex items-center justify-between gap-3 border-b border-bz-line bg-bz-paper px-4 py-2.5 lg:hidden">
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-bz-md bg-bz-olive text-[11px] font-bold text-bz-fire">{curIdx + 1}</span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-bz-text">{PHASES[curIdx].label}</p>
          <p className={cn("text-[10.5px] text-bz-text-muted", NUM)}>Step {curIdx + 1} of {PHASES.length}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {PHASES.map((p, i) => (
          <span key={p.key} className={cn("h-1.5 rounded-bz-pill transition-all", i === curIdx ? "w-5 bg-bz-fire" : i < curIdx ? "w-1.5 bg-bz-leaf-deep" : "w-1.5 bg-bz-line")} />
        ))}
      </div>
    </div>
  );
}

// phase-scoped instructional / help copy (rendered in the rail on desktop,
// inline under the workspace on mobile)
const HELP: Record<PhaseKey, { title: string; body: React.ReactNode }> = {
  source: {
    title: "Good to know",
    body: (
      <>Accepted formats are CSV and Excel (<span className={NUM}>.xlsx</span> / <span className={NUM}>.xls</span>). The <span className="font-medium text-bz-text">first row must be a header row</span> — column names are read from it. Not sure of the layout? Download the sample template.</>
    ),
  },
  mapping: {
    title: "Mapping rule",
    body: (
      <>Map at least a <span className="font-medium text-bz-text">Transaction date</span> and one amount column (<span className="font-medium text-bz-text">Deposit or Withdrawal</span>). Everything else is optional. Your mapping is <span className="font-medium text-bz-text">saved per account</span>, so future imports of it skip this step.</>
    ),
  },
  preview: {
    title: "About this preview",
    body: (
      <>Only the first <span className={NUM}>{PREVIEW_N}</span> rows are shown — the whole file is imported. Rows already in the system are matched by <span className="font-medium text-bz-text">Transaction ID</span> and skipped automatically.</>
    ),
  },
  import: {
    title: "While it runs",
    body: (
      <>Keep this open — it refreshes on its own until the import finishes. New rows are written, duplicates are skipped, and any failures are listed at the end.</>
    ),
  },
};

function PhaseHelp({ phase, className }: { phase: PhaseKey; className?: string }) {
  const h = HELP[phase];
  return (
    <div className={cn("rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4", className)}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-bz-text">
        <Info size={12} className="text-bz-text-muted" /> {h.title}
      </p>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-bz-text-muted">{h.body}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WORKSPACE SHELL  (calm titled card container per phase)
// ════════════════════════════════════════════════════════════════════════════

function Workspace({ title, desc, aside, children }: { title: string; desc?: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold tracking-tight text-bz-text">{title}</h2>
          {desc && <p className="mt-0.5 text-[12px] text-bz-text-muted">{desc}</p>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className={cn(LABEL, "mb-2 flex items-center gap-1")}>
      {children}
      {required && <span className="text-bz-fire" title="Required">*</span>}
    </p>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE 1 · SOURCE  (account · file · format · template)
// ════════════════════════════════════════════════════════════════════════════

type PickedFile = { name: string; size: number };

function downloadTemplate() {
  const csv = DETECTED_HEADERS.join(",") + "\n2026-06-16,2026-06-16,NEFT-8120,NEFT credit — Buddha Air Pvt Ltd,,412000,3862000,TXN90021,Buddha Air Pvt Ltd\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bank-statement-template.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function SourcePhase({
  account, onAccount, accountLocked, format, onFormat, file, onFile, uploading, showErrors, onToast,
}: {
  account: string | null;
  onAccount: (id: string) => void;
  accountLocked: boolean;
  format: FileFormat | null;
  onFormat: (f: FileFormat) => void;
  file: PickedFile | null;
  onFile: (f: PickedFile | null) => void;
  uploading: boolean;
  showErrors: boolean;
  onToast: (kind: ToastKind, text: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);
  const pick = (name: string, size: number) => {
    onFile({ name, size });
    const f = detectFormat(name);
    if (f) onFormat(f); // extension → format (still overridable)
  };
  return (
    <Workspace
      title="Choose account & upload"
      desc="Pick the bank account this statement belongs to, then upload the file to parse it."
      aside={
        <button onClick={() => { downloadTemplate(); onToast("success", "Sample template downloaded."); }} className="inline-flex items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-1.5 text-[11.5px] font-medium text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text">
          <FileDown size={13} /> Template
        </button>
      }
    >
      <div className="flex flex-col gap-6 rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5 md:p-6">
        {/* account */}
        <div>
          <FieldLabel required>Bank account</FieldLabel>
          <AccountPicker value={account} onChange={onAccount} locked={accountLocked} invalid={showErrors && !account} onToast={onToast} />
        </div>

        {/* file */}
        <div>
          <FieldLabel required>Statement file</FieldLabel>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f.name, f.size); }}
          />
          {file ? (
            <div className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3.5 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted">
                {format === "XLSX" ? <FileSpreadsheet size={18} /> : <FileText size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-bz-text">{file.name}</p>
                <p className={cn("text-[11px] text-bz-text-soft", NUM)}>{fmtSize(file.size)}{format ? ` · ${format}` : ""}</p>
              </div>
              <button onClick={() => { onFile(null); if (inputRef.current) inputRef.current.value = ""; }} aria-label="Remove file" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface hover:text-bz-text">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) pick(f.name, f.size); }}
              className={cn(
                "flex flex-col items-center rounded-bz-md border border-dashed px-5 py-9 text-center transition-colors",
                showErrors ? "border-[#C0413A] bg-[#FBE7E5]/30" : drag ? "border-bz-olive bg-bz-fire/[0.08]" : "border-bz-line bg-bz-paper-warm/30",
              )}
            >
              <span className="mb-3 flex size-11 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted"><Upload size={19} /></span>
              <p className="text-[13px] font-medium text-bz-text">Drop your statement here</p>
              <p className="mt-0.5 text-[11px] text-bz-text-muted">CSV or Excel, with a header row</p>
              <div className="mt-3 flex items-center gap-2.5">
                <button onClick={() => inputRef.current?.click()} className={cn(GHOST_BTN, "h-8")}>Browse files</button>
                <button onClick={() => pick("nabil_statement_jun2026.csv", 48213)} className="text-[11.5px] font-medium text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline">Use a sample</button>
              </div>
            </div>
          )}
        </div>

        {/* format */}
        <div>
          <FieldLabel required>File format</FieldLabel>
          <div className="inline-flex overflow-hidden rounded-bz-md border border-bz-line-soft">
            {(["CSV", "XLSX"] as const).map((f, i) => {
              const on = format === f;
              const Icon = f === "XLSX" ? FileSpreadsheet : FileText;
              return (
                <button
                  key={f}
                  onClick={() => onFormat(f)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 px-4 text-[12px] font-medium transition-colors",
                    i > 0 && "border-l border-bz-line-soft",
                    on ? "bg-bz-fire/[0.14] text-bz-text" : "bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm",
                  )}
                >
                  <Icon size={13} /> {f === "XLSX" ? "Excel" : "CSV"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {uploading && (
        <p className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-medium text-bz-text-muted">
          <Loader2 size={15} className="animate-spin text-bz-fire" /> Parsing {file?.name}…
        </p>
      )}
    </Workspace>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE 2 · MAPPING  (one editable row per detected column + unmet-req alert)
// ════════════════════════════════════════════════════════════════════════════

function MappingPhase({
  headers, mapping, onMap, hadSaved, accountName, missing, saving,
}: {
  headers: string[];
  mapping: Record<string, string>;
  onMap: (header: string, target: string) => void;
  hadSaved: boolean;
  accountName: string;
  missing: string[];
  saving: boolean;
}) {
  const used = (key: string) => headers.filter((h) => mapping[h] === key);
  const mappedCount = headers.filter((h) => (mapping[h] ?? "ignore") !== "ignore").length;
  return (
    <Workspace
      title="Map the columns"
      desc={<span className={NUM}>{headers.length} columns detected · {mappedCount} mapped</span>}
      aside={
        missing.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted"><CheckCircle2 size={13} className="text-bz-leaf-deep" /> Required fields covered</span>
        ) : null
      }
    >
      {/* saved-mapping memory banner */}
      {hadSaved && (
        <div className="mb-3 flex items-start gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-fire/[0.07] px-3.5 py-2.5">
          <RotateCw size={13} className="mt-0.5 shrink-0 text-bz-leaf-deep" />
          <p className="text-[11.5px] leading-relaxed text-bz-text">
            Loaded the saved mapping for <span className="font-semibold">{accountName}</span>. Adjust anything below — changes are remembered for next time.
          </p>
        </div>
      )}

      {/* unmet-requirements alert — present only while the rule is unmet */}
      {missing.length > 0 && (
        <div className="mb-3 rounded-bz-md border border-[#F0C5C0] bg-[#FBE7E5] px-3.5 py-2.5">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#9A2E29]"><TriangleAlert size={13} /> Still needed to continue</p>
          <ul className="mt-1 space-y-0.5 pl-5 text-[11px] text-[#9A2E29]">
            {missing.map((m) => <li key={m} className="list-disc">{m}</li>)}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <div className="grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] items-center gap-2 border-b border-bz-line bg-bz-paper-warm px-4 py-2 text-[9.5px] font-bold uppercase tracking-[0.1em] text-bz-text-muted">
          <span>Source column</span><span /><span>Maps to</span>
        </div>
        {headers.map((h, i) => {
          const target = mapping[h] ?? "ignore";
          const ignored = target === "ignore";
          const dupe = !ignored && used(target).length > 1;
          return (
            <div key={h} className={cn("grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] items-center gap-2 border-b border-bz-line-soft px-4 py-2.5 last:border-b-0", ignored && "opacity-60")}>
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-[9.5px] font-bold text-bz-text-muted", NUM)}>{i + 1}</span>
                <span className="truncate text-[12.5px] font-medium text-bz-text">{h}</span>
              </div>
              <ArrowRight size={13} className="justify-self-center text-bz-text-soft" />
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1"><FieldSelect value={target} onChange={(v) => onMap(h, v)} /></div>
                {dupe && <span title="Also mapped by another column" className="shrink-0"><Info size={13} className="text-bz-text-soft" /></span>}
              </div>
            </div>
          );
        })}
      </div>

      {saving && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted"><Loader2 size={13} className="animate-spin text-bz-fire" /> Saving mapping & building preview…</p>
      )}
    </Workspace>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE 3 · PREVIEW  (whole-file summary + first-N listing, server-classified)
// ════════════════════════════════════════════════════════════════════════════

const KLASS_META: Record<Klass, { label: string; chip: string; dot: string; rowTint: string }> = {
  new: { label: "New", chip: "bg-bz-fire/[0.18] text-bz-text", dot: "bg-bz-leaf-deep", rowTint: "" },
  duplicate: { label: "Duplicate", chip: "bg-bz-paper-warm text-bz-text-muted", dot: "bg-bz-text-soft", rowTint: "bg-bz-paper-warm/30" },
  error: { label: "Error", chip: "bg-[#FBE5E2] text-[#9A2E29]", dot: "bg-[#C0413A]", rowTint: "bg-[#FBE7E5]/30" },
};

function SummaryTile({ value, label, dot, muted }: { value: number; label: string; dot?: string; muted?: boolean }) {
  return (
    <div className={cn("rounded-bz-md border border-bz-line-soft p-3.5", muted ? "bg-bz-paper-warm/30" : "bg-bz-surface")}>
      <p className={cn("text-[24px] font-semibold leading-none text-bz-text", NUM)}>{value.toLocaleString("en-US")}</p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.04em] text-bz-text-muted">
        {dot && <span className={cn("size-1.5 rounded-bz-pill", dot)} />} {label}
      </p>
    </div>
  );
}

function PreviewPhase({ currency }: { currency: string }) {
  const c = SERVER_COUNTS;
  return (
    <Workspace title="Preview the parsed rows" desc="Every count below is computed by the server for the whole file.">
      {/* import-count summary — the error tile appears only when errors > 0 */}
      <div className={cn("mb-5 grid gap-2.5", c.error > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
        <SummaryTile value={c.total} label="Total rows" muted />
        <SummaryTile value={c.new} label="New" dot={KLASS_META.new.dot} />
        <SummaryTile value={c.duplicate} label="Duplicate" dot={KLASS_META.duplicate.dot} />
        {c.error > 0 && <SummaryTile value={c.error} label="Error" dot={KLASS_META.error.dot} />}
      </div>

      {c.new === 0 && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-bz-md bg-[#FBE7E5] px-3.5 py-2 text-[11.5px] font-medium text-[#9A2E29]">
          <CircleSlash size={13} /> Nothing new to import — every row is a duplicate or error.
        </div>
      )}

      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left" style={{ minWidth: 780 }}>
            <thead>
              <tr className="border-b border-bz-line bg-bz-paper-warm text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">
                <th className="w-9 px-3 py-2">#</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Deposit</th>
                <th className="px-3 py-2 text-right">Withdrawal</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Reference</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {PREVIEW_ROWS.map((r) => {
                const meta = KLASS_META[r.klass];
                return (
                  <tr key={r.seq} className={cn("border-b border-bz-line-soft last:border-0", meta.rowTint)}>
                    <td className={cn("px-3 py-2.5 text-[11px] text-bz-text-soft", NUM)}>{r.seq}</td>
                    <td className={cn("px-3 py-2.5 text-[12px] text-bz-text", NUM)}>{fmtAD(r.dateISO)}</td>
                    <td className={cn("px-3 py-2.5 text-right text-[12px] text-bz-text", NUM)}>{grp(r.deposit)}</td>
                    <td className={cn("px-3 py-2.5 text-right text-[12px] text-bz-text-muted", NUM)}>{grp(r.withdrawal)}</td>
                    <td className="px-3 py-2.5"><span className="block max-w-[240px] truncate text-[12px] text-bz-text" title={r.description}>{r.description}</span></td>
                    <td className={cn("px-3 py-2.5 text-[11px] text-bz-text-muted", NUM)}>{r.reference ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-bz-sm px-2 py-0.5 text-[10.5px] font-medium", meta.chip)} title={r.reason}>
                        <span className={cn("size-1.5 rounded-bz-pill", meta.dot)} /> {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm/30 px-4 py-2">
          <p className={cn("text-[11px] text-bz-text-soft", NUM)}>Showing the first {PREVIEW_ROWS.length} of {c.total} parsed rows · {currency}</p>
          <p className="inline-flex items-center gap-1.5 text-[11px] text-bz-text-soft"><Info size={11} /> Duplicates are detected by Transaction ID and skipped on import.</p>
        </div>
      </div>
    </Workspace>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE 4 · IMPORT  (lifecycle badge · progress · counters · error log — polls)
// ════════════════════════════════════════════════════════════════════════════

type Outcome = "pending" | "running" | "success" | "partial" | "error";
type Sev = "pending" | "run" | "positive" | "partial" | "danger";
const OUTCOME_META: Record<Outcome, { label: string; sev: Sev }> = {
  pending: { label: "Queued", sev: "pending" },
  running: { label: "Importing…", sev: "run" },
  success: { label: "Import complete", sev: "positive" },
  partial: { label: "Completed with failures", sev: "partial" },
  error: { label: "Import failed", sev: "danger" },
};

function StatusBadge({ outcome, total }: { outcome: Outcome; total: number }) {
  const meta = OUTCOME_META[outcome];
  const chip =
    meta.sev === "positive" ? "bg-bz-fire/[0.18] text-bz-text"
    : meta.sev === "partial" ? "bg-bz-leaf/50 text-bz-text"
    : meta.sev === "danger" ? "bg-[#FBE5E2] text-[#9A2E29]"
    : "bg-bz-paper-warm text-bz-text-muted";
  const dot =
    meta.sev === "positive" ? "bg-bz-leaf-deep"
    : meta.sev === "partial" ? "bg-bz-fire"
    : meta.sev === "danger" ? "bg-[#C0413A]"
    : "bg-bz-text-soft";
  const running = outcome === "pending" || outcome === "running";
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-pill px-2.5 py-1 text-[11.5px] font-semibold", chip)}>
      {running ? <Loader2 size={11} className="animate-spin" /> : <span className={cn("size-1.5 rounded-bz-pill", dot)} />}
      {meta.label}
      <span className={cn("text-bz-text-muted", NUM)}>· {total} rows</span>
    </span>
  );
}

function ImportPhase({
  outcome, processed, queued, imported, skipped, failed, accountName,
}: {
  outcome: Outcome;
  processed: number;
  queued: number;
  imported: number;
  skipped: number;
  failed: number;
  accountName: string;
}) {
  const [logOpen, setLogOpen] = React.useState(false);
  const meta = OUTCOME_META[outcome];
  const pct = queued ? Math.round((processed / queued) * 100) : 0;
  const running = outcome === "pending" || outcome === "running";
  const terminal = outcome === "success" || outcome === "partial" || outcome === "error";
  const iconWrap =
    meta.sev === "positive" ? "bg-bz-fire/[0.18] text-bz-leaf-deep"
    : meta.sev === "partial" ? "bg-bz-leaf/50 text-bz-text"
    : meta.sev === "danger" ? "bg-[#FBE5E2] text-[#9A2E29]"
    : "bg-bz-paper-warm text-bz-text-muted";
  return (
    <Workspace title="Run the import" desc={<>Importing into <span className="font-medium text-bz-text">{accountName}</span>.</>}>
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        {/* lifecycle head */}
        <div className="flex items-center gap-3.5 border-b border-bz-line-soft px-5 py-4">
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-bz-lg", iconWrap)}>
            {outcome === "pending" ? <Clock size={20} />
              : outcome === "running" ? <Loader2 size={20} className="animate-spin" />
              : outcome === "success" ? <CheckCircle2 size={20} />
              : outcome === "partial" ? <TriangleAlert size={20} />
              : <XCircle size={20} />}
          </span>
          <div className="min-w-0 flex-1">
            <StatusBadge outcome={outcome} total={queued} />
            <p className={cn("mt-1 text-[11.5px] text-bz-text-muted", NUM)}>
              {outcome === "pending" ? "Waiting for the import to start…" : `${processed} of ${queued} rows processed`}
            </p>
          </div>
          {/* live progress % — hidden while merely pending */}
          {outcome !== "pending" && <span className={cn("text-[22px] font-semibold text-bz-text", NUM)}>{pct}%</span>}
        </div>

        {/* live progress bar — appears once running or finished */}
        {outcome !== "pending" && (
          <div className="px-5 pt-4">
            <div className="h-2 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
              <div
                className={cn("h-full rounded-bz-pill transition-[width] duration-500", meta.sev === "danger" ? "bg-[#C0413A]" : "bg-bz-fire")}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* outcome counters */}
        <div className="grid grid-cols-3 gap-2.5 p-5">
          {[
            { label: "Imported", value: imported, dot: "bg-bz-leaf-deep" },
            { label: "Skipped — duplicate", value: skipped, dot: "bg-bz-text-soft" },
            { label: "Failed", value: failed, dot: "bg-[#C0413A]" },
          ].map((k) => (
            <div key={k.label} className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3 text-center">
              <p className={cn("text-[22px] font-semibold leading-none text-bz-text", NUM)}>{k.value}</p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.03em] text-bz-text-muted">
                <span className={cn("size-1.5 rounded-bz-pill", k.dot)} /> {k.label}
              </p>
            </div>
          ))}
        </div>

        {/* error-detail disclosure — only on a terminal outcome carrying a log */}
        {terminal && failed > 0 && (
          <div className="border-t border-bz-line-soft">
            <button onClick={() => setLogOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 px-5 py-3 transition-colors hover:bg-bz-paper-warm/40">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-bz-text">
                <TriangleAlert size={13} className="text-[#9A2E29]" /> Error log
                <span className={cn("rounded-bz-sm bg-[#FBE5E2] px-1.5 py-0.5 text-[10px] text-[#9A2E29]", NUM)}>{ERROR_LOG.length} failed</span>
              </span>
              <ChevronDown size={14} className={cn("text-bz-text-muted transition-transform", logOpen && "rotate-180")} />
            </button>
            {logOpen && (
              <div className="border-t border-bz-line-soft bg-bz-paper-warm/30 px-5 py-3">
                <div className="flex flex-col gap-1.5">
                  {ERROR_LOG.map((e) => (
                    <p key={e.row} className={cn("text-[11.5px] leading-relaxed tracking-[0.01em] text-bz-text-muted", NUM)}>
                      <span className="text-[#9A2E29]">✗</span> {e.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {running && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
          <RotateCw size={11} className="animate-spin" /> Refreshing status every few seconds…
        </p>
      )}
    </Workspace>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED ACTION BAR  (AppShell overlay slot — back + gated advance / finish)
// ════════════════════════════════════════════════════════════════════════════

function ActionBar({
  phase, stepText, onBack, backLabel, showBack,
  primaryLabel, primaryBusy, primaryDisabled, onPrimary,
  terminal, finishLabel, onFinish, onClose,
}: {
  phase: PhaseKey;
  stepText: string;
  onBack: () => void;
  backLabel: string;
  showBack: boolean;
  primaryLabel: string;
  primaryBusy: boolean;
  primaryDisabled: boolean;
  onPrimary: () => void;
  terminal: boolean;
  finishLabel: string;
  onFinish: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-3 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {phase === "import" ? (
          terminal ? (
            <button onClick={onClose} className={GHOST_BTN}><X size={13} /> Close</button>
          ) : (
            <span className={cn("hidden text-[11.5px] text-bz-text-muted sm:inline", NUM)}>{stepText}</span>
          )
        ) : showBack ? (
          <button onClick={onBack} className={GHOST_BTN}><ArrowLeft size={13} /> {backLabel}</button>
        ) : (
          <span className={cn("hidden text-[11.5px] text-bz-text-muted sm:inline", NUM)}>{stepText}</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {phase === "import" ? (
          terminal ? (
            <button onClick={onFinish} className={PRIMARY_BTN}>{finishLabel} <ArrowRight size={14} /></button>
          ) : (
            <button disabled className={PRIMARY_BTN}><Loader2 size={14} className="animate-spin" /> Import running…</button>
          )
        ) : (
          <button onClick={onPrimary} disabled={primaryBusy || primaryDisabled} className={PRIMARY_BTN}>
            {primaryBusy ? <Loader2 size={14} className="animate-spin" /> : null}
            {primaryLabel}
            {!primaryBusy && <ArrowRight size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function BankStatementImportDesignPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const incomingAccount = params.get("account"); // set when launched from reconciliation

  const { toasts, push, dismiss } = useToasts();

  const [phase, setPhase] = React.useState<PhaseKey>("source");
  const [visited, setVisited] = React.useState<Set<PhaseKey>>(new Set(["source"]));

  // phase 1
  const [account, setAccount] = React.useState<string | null>(incomingAccount ?? null);
  const [format, setFormat] = React.useState<FileFormat | null>(null);
  const [file, setFile] = React.useState<PickedFile | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [showSourceErrors, setShowSourceErrors] = React.useState(false);

  // threaded forward
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [hadSaved, setHadSaved] = React.useState(false);
  const [savingMap, setSavingMap] = React.useState(false);

  // phase 4
  const [outcome, setOutcome] = React.useState<Outcome>("pending");
  const [processed, setProcessed] = React.useState(0);

  const acc = accountById(account);
  const currency = acc?.currency ?? "NPR";
  const accountLocked = !!incomingAccount;

  // guard simulated-async timers on unmount
  const timers = React.useRef<number[]>([]);
  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  React.useEffect(() => () => { timers.current.forEach(window.clearTimeout); timers.current = []; }, []);

  const markVisited = (p: PhaseKey) => setVisited((s) => new Set(s).add(p));

  // ── phase 1 → parse (validate on submit; warn on invalid instead of blocking) ──
  const sourceValid = !!account && !!format && !!file;
  const parse = () => {
    if (!sourceValid) {
      setShowSourceErrors(true);
      const need: string[] = [];
      if (!account) need.push("an account");
      if (!file) need.push("a file");
      if (!format) need.push("a format");
      push("warning", `Choose ${need.join(", ")} before parsing.`);
      return;
    }
    setUploading(true);
    later(1000, () => {
      setUploading(false);
      setHeaders(DETECTED_HEADERS);
      const saved = account ? SAVED_MAPPINGS[account] : undefined;
      if (saved) { setMapping({ ...saved }); setHadSaved(true); }
      else { setMapping(Object.fromEntries(DETECTED_HEADERS.map((h) => [h, guessTarget(h)]))); setHadSaved(false); }
      markVisited("mapping");
      setPhase("mapping");
      push("success", `Parsed ${SERVER_COUNTS.total} rows across ${DETECTED_HEADERS.length} columns.`);
    });
  };

  // ── phase 2 → save mapping (validate; warn on invalid) ──
  const used = (key: string) => headers.filter((h) => mapping[h] === key);
  const missing: string[] = [];
  if (headers.length) {
    if (used("date").length === 0) missing.push("Map a column to Transaction date");
    if (used("deposit").length === 0 && used("withdrawal").length === 0) missing.push("Map a column to Deposit or Withdrawal");
  }
  const mappingValid = missing.length === 0;
  const saveMapping = () => {
    if (!mappingValid) { push("warning", "Map a date and an amount column before continuing."); return; }
    setSavingMap(true);
    later(750, () => {
      if (account) SAVED_MAPPINGS[account] = { ...mapping };
      const n = headers.filter((h) => (mapping[h] ?? "ignore") !== "ignore").length;
      setSavingMap(false);
      markVisited("preview");
      setPhase("preview");
      push("success", `Mapping saved · ${n} columns mapped.`);
    });
  };

  // ── phase 3 → start import (hard-gated on ≥1 new row) ──
  const canImport = SERVER_COUNTS.new > 0;
  const startImport = () => {
    if (!canImport) return;
    markVisited("import");
    setOutcome("pending");
    setProcessed(0);
    setPhase("import");
  };

  // ── phase 4 → live polling, self-terminating & teardown-safe ──
  React.useEffect(() => {
    if (phase !== "import") return;
    if (outcome !== "pending" && outcome !== "running") return;
    const t = window.setTimeout(() => {
      setProcessed((p) => {
        const next = Math.min(p + Math.ceil(IMPORT_JOB.queued / 6), IMPORT_JOB.queued);
        if (next >= IMPORT_JOB.queued) setOutcome(IMPORT_JOB.failed > 0 ? "partial" : "success");
        else setOutcome("running");
        return next;
      });
    }, 900);
    return () => window.clearTimeout(t);
  }, [phase, outcome, processed]);

  const terminal = outcome === "success" || outcome === "partial" || outcome === "error";

  // outcome counters — interpolated during the run, exact at completion
  const ratio = IMPORT_JOB.queued ? processed / IMPORT_JOB.queued : 0;
  const imported = terminal ? IMPORT_JOB.imported : Math.round(IMPORT_JOB.imported * ratio);
  const skipped = terminal ? IMPORT_JOB.skipped : Math.round(IMPORT_JOB.skipped * ratio);
  const failed = terminal ? IMPORT_JOB.failed : Math.round(IMPORT_JOB.failed * ratio);

  const goBack = () => {
    if (phase === "preview") setPhase("mapping");
    else if (phase === "mapping") setPhase("source");
  };
  const jump = (p: PhaseKey) => { if (visited.has(p) && PHASE_IDX[p] < PHASE_IDX[phase]) setPhase(p); };

  const finish = () => {
    if (incomingAccount) navigate(`/design/bank-reconciliation?account=${account}&imported=${IMPORT_JOB.imported}`);
    else navigate("/design");
  };
  const close = () => navigate(incomingAccount ? "/design/bank-reconciliation" : "/design");

  const curIdx = PHASE_IDX[phase];
  const stepText = `Step ${curIdx + 1} of ${PHASES.length}`;

  const primaryLabel =
    phase === "source" ? "Upload & parse"
    : phase === "mapping" ? "Save & preview"
    : `Import ${SERVER_COUNTS.new} new rows`;
  const primaryBusy = phase === "source" ? uploading : phase === "mapping" ? savingMap : false;
  const primaryDisabled = phase === "preview" ? !canImport : false;
  const onPrimary = phase === "source" ? parse : phase === "mapping" ? saveMapping : startImport;

  const finishLabel = incomingAccount ? "Open reconciliation" : "Done";

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Finance</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <button onClick={() => navigate("/design/bank-reconciliation")} className="text-bz-text-muted hover:text-bz-text">Bank Reconciliation</button>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Statement Import</span>
        </>
      }
      overlay={
        <>
          <ActionBar
            phase={phase}
            stepText={stepText}
            onBack={goBack}
            backLabel={phase === "preview" ? "Back to mapping" : "Back"}
            showBack={phase === "mapping" || phase === "preview"}
            primaryLabel={primaryLabel}
            primaryBusy={primaryBusy}
            primaryDisabled={primaryDisabled}
            onPrimary={onPrimary}
            terminal={terminal}
            finishLabel={finishLabel}
            onFinish={finish}
            onClose={close}
          />
          <Toaster toasts={toasts} onDismiss={dismiss} />
        </>
      }
    >
      {/* header band */}
      <header className="border-b border-bz-line bg-bz-paper px-4 pb-5 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-bz-sm bg-bz-deep text-bz-fire"><FileUp size={11} /></span>
              <p className={LABEL}>Guided import</p>
            </div>
            <h1 className="mt-2 text-[23px] font-semibold tracking-tight text-bz-text">Bank statement import</h1>
            <p className="mt-1 text-[12.5px] text-bz-text-muted">Turn a CSV or Excel statement into reconciled bank transactions — one guided pass.</p>
          </div>
          {acc && (
            <div className="rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 py-2.5">
              <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                <Landmark size={11} /> Importing into
              </p>
              <p className="mt-1 text-[12.5px] font-semibold text-bz-text">{acc.name}</p>
              <p className={cn("text-[10.5px] text-bz-text-soft", NUM)}>{acc.number} · {acc.currency}</p>
              {accountLocked && <p className="mt-1 text-[10px] text-bz-text-muted">You'll return to Bank Reconciliation when done.</p>}
            </div>
          )}
        </div>
      </header>

      <MobilePhaseBar current={phase} />

      {/* guided canvas */}
      <div className="grid grid-cols-1 gap-6 px-4 py-6 md:px-8 lg:grid-cols-[288px_minmax(0,1fr)] lg:gap-8">
        {/* rail (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-6 flex flex-col gap-4">
            <PhaseRail current={phase} visited={visited} onJump={jump} />
            <PhaseHelp phase={phase} />
          </div>
        </div>

        {/* workspace */}
        <div className="min-w-0">
          {phase === "source" && (
            <SourcePhase
              account={account}
              onAccount={(id) => { setAccount(id); setShowSourceErrors(false); }}
              accountLocked={accountLocked}
              format={format}
              onFormat={setFormat}
              file={file}
              onFile={(f) => { setFile(f); setShowSourceErrors(false); }}
              uploading={uploading}
              showErrors={showSourceErrors}
              onToast={push}
            />
          )}

          {phase === "mapping" && headers.length > 0 && (
            <MappingPhase
              headers={headers}
              mapping={mapping}
              onMap={(h, t) => setMapping((m) => ({ ...m, [h]: t }))}
              hadSaved={hadSaved}
              accountName={acc?.name ?? "this account"}
              missing={missing}
              saving={savingMap}
            />
          )}

          {phase === "preview" && <PreviewPhase currency={currency} />}

          {phase === "import" && (
            <ImportPhase
              outcome={outcome}
              processed={processed}
              queued={IMPORT_JOB.queued}
              imported={imported}
              skipped={skipped}
              failed={failed}
              accountName={acc?.name ?? "the account"}
            />
          )}

          <PhaseHelp phase={phase} className="mt-6 lg:hidden" />
        </div>
      </div>
    </AppShell>
  );
}
