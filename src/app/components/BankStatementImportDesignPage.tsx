import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  Check,
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  X,
  Loader2,
  Landmark,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  TriangleAlert,
  CheckCircle2,
  Columns3,
  ListChecks,
  CircleSlash,
  RotateCw,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { BANK_ACCOUNTS, accountById } from "./BankReconciliationDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// BANK STATEMENT IMPORT · WIZARD
//
// Primary action: thread one statement file through a gated, SEQUENTIAL flow —
//   upload → mapping → preview → status
// — to land validated, de-duplicated bank transactions for ONE account. Each
// stage produces what the next consumes; completed stages can be revisited but
// forward skips are blocked; only the final stage live-polls to a terminal
// outcome. Feeds (and returns to) the Bank Reconciliation Workspace.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";

const PRIMARY_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45";
const GHOST_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-45";

// ════════════════════════════════════════════════════════════════════════════
// STAGE MODEL
// ════════════════════════════════════════════════════════════════════════════

type StageKey = "upload" | "mapping" | "preview" | "status";
const STAGES: { key: StageKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "mapping", label: "Map columns", icon: Columns3 },
  { key: "preview", label: "Preview", icon: ListChecks },
  { key: "status", label: "Import", icon: CheckCircle2 },
];
const STAGE_INDEX: Record<StageKey, number> = { upload: 0, mapping: 1, preview: 2, status: 3 };

// ── threaded data ──

type Parsed = { importId: string; headers: string[]; rowCount: number; delimiter: string };
type Mapping = Record<string, string>; // header -> target key

type PreviewRow = {
  idx: number;
  dateISO: string | null;
  deposit: number | null;
  withdrawal: number | null;
  description: string;
  reference: string | null;
  klass: "new" | "duplicate" | "error";
  reason?: string;
};

// ════════════════════════════════════════════════════════════════════════════
// TARGET FIELDS + TRANSFORMS (header → guessed field; ext → format)
// ════════════════════════════════════════════════════════════════════════════

const TARGETS: { key: string; label: string }[] = [
  { key: "date", label: "Transaction date" },
  { key: "deposit", label: "Deposit (credit)" },
  { key: "withdrawal", label: "Withdrawal (debit)" },
  { key: "description", label: "Description" },
  { key: "reference", label: "Reference" },
  { key: "txnId", label: "Transaction ID" },
  { key: "party", label: "Party / counterparty" },
  { key: "ignore", label: "— Ignore this column" },
];
const TARGET_LABEL: Record<string, string> = Object.fromEntries(TARGETS.map((t) => [t.key, t.label]));

function guessTarget(header: string): string {
  const h = header.toLowerCase();
  if (/(value|posting)\s*date/.test(h)) return "ignore";
  if (/date/.test(h)) return "date";
  if (/(deposit|credit|cr\b|inflow|paid in)/.test(h)) return "deposit";
  if (/(withdraw|debit|dr\b|outflow|paid out)/.test(h)) return "withdrawal";
  if (/(balance|running)/.test(h)) return "ignore";
  if (/(cheque|ref|utility|utr|rrn)/.test(h)) return "reference";
  if (/(txn\s*id|transaction\s*id|tran\s*id|id$)/.test(h)) return "txnId";
  if (/(desc|narration|particular|detail|remark)/.test(h)) return "description";
  if (/(party|counter|payee|beneficiary|name)/.test(h)) return "party";
  return "ignore";
}

function detectFormat(name: string): "CSV" | "XLSX" | null {
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

// simulated parse output for any picked file
const SAMPLE_HEADERS = ["Txn Date", "Value Date", "Cheque/Ref No", "Description / Narration", "Withdrawal (Dr)", "Deposit (Cr)", "Balance", "Counterparty"];

// simulated preview rows (parsed against the mapping) — duplicates detected via reference/id
const SAMPLE_ROWS: PreviewRow[] = [
  { idx: 1, dateISO: "2026-06-16", deposit: 412000, withdrawal: null, description: "NEFT credit — Buddha Air Pvt Ltd", reference: "NEFT-8120", klass: "new" },
  { idx: 2, dateISO: "2026-06-16", deposit: null, withdrawal: 96500, description: "Cheque paid — Laxmi Stationers", reference: "CHQ-5588", klass: "new" },
  { idx: 3, dateISO: "2026-06-17", deposit: 312500, withdrawal: null, description: "NEFT credit — Everest Hardware", reference: "NEFT-7741", klass: "duplicate", reason: "Reference already imported (BT-1041)" },
  { idx: 4, dateISO: "2026-06-17", deposit: null, withdrawal: 248000, description: "Standing order — office rent", reference: "SO-RENT-06", klass: "new" },
  { idx: 5, dateISO: null, deposit: null, withdrawal: 18750, description: "POS PURCHASE — unreadable date field", reference: "POS-44910", klass: "error", reason: "Date “31/13/2026” could not be parsed" },
  { idx: 6, dateISO: "2026-06-18", deposit: 1250000, withdrawal: null, description: "RTGS credit — Sagarmatha Steel", reference: "RTGS-9981", klass: "duplicate", reason: "Reference already imported (BT-1036)" },
  { idx: 7, dateISO: "2026-06-18", deposit: null, withdrawal: 54200, description: "Bank charges — quarterly", reference: "CHG-Q1", klass: "new" },
  { idx: 8, dateISO: "2026-06-19", deposit: 89400, withdrawal: null, description: "Deposit — Mechi Trade Concern", reference: "DEP-2310", klass: "new" },
];

// per-account mapping memory (persists across imports of the same account this session)
const SAVED_MAPPINGS: Record<string, Mapping> = {
  "acc-nabil-cur": {
    "Txn Date": "date", "Value Date": "ignore", "Cheque/Ref No": "reference",
    "Description / Narration": "description", "Withdrawal (Dr)": "withdrawal",
    "Deposit (Cr)": "deposit", "Balance": "ignore", "Counterparty": "party",
  },
};

// ════════════════════════════════════════════════════════════════════════════
// FORMAT HELPERS
// ════════════════════════════════════════════════════════════════════════════

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtAD(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
const grp = (n: number | null) => (n == null ? "—" : Math.round(n).toLocaleString("en-US"));

// ════════════════════════════════════════════════════════════════════════════
// STEPPER  (done / active / not-yet-reached — back to completed only)
// ════════════════════════════════════════════════════════════════════════════

function Stepper({ current, completed, onJump }: { current: StageKey; completed: Set<StageKey>; onJump: (s: StageKey) => void }) {
  const curIdx = STAGE_INDEX[current];
  return (
    <div className="border-b border-bz-line bg-bz-paper px-4 py-3 md:px-8">
      {/* mobile compact */}
      <div className="flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-bz-md bg-bz-olive text-[11px] font-bold text-bz-fire">{curIdx + 1}</span>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-bz-text">{STAGES[curIdx].label}</p>
            <p className={cn("text-[10.5px] text-bz-text-muted", NUM)}>Step {curIdx + 1} of {STAGES.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {STAGES.map((s, i) => <span key={s.key} className={cn("h-1.5 rounded-bz-pill transition-all", i === curIdx ? "w-5 bg-bz-fire" : i < curIdx ? "w-1.5 bg-bz-leaf-deep" : "w-1.5 bg-bz-line")} />)}
        </div>
      </div>

      {/* desktop rail */}
      <div className="hidden items-center md:flex">
        {STAGES.map((s, i) => {
          const done = completed.has(s.key) && i < curIdx;
          const active = s.key === current;
          const reachable = done || i <= curIdx;
          return (
            <React.Fragment key={s.key}>
              <button
                onClick={() => reachable && i < curIdx && onJump(s.key)}
                disabled={!reachable || i >= curIdx}
                className={cn("group flex items-center gap-2.5 rounded-bz-md px-2 py-1 transition-colors", done ? "cursor-pointer hover:bg-bz-paper-warm" : "cursor-default")}
                title={done ? `Back to ${s.label}` : i > curIdx ? "Not yet reached" : undefined}
              >
                <span className={cn("flex size-7 items-center justify-center rounded-bz-pill border text-[11px] font-semibold transition-colors", active ? "border-bz-olive bg-bz-olive text-bz-fire" : done ? "border-bz-leaf-deep/40 bg-bz-fire/[0.16] text-bz-leaf-deep" : "border-bz-line bg-bz-surface text-bz-text-soft")}>
                  {done ? <Check size={14} /> : <span className={NUM}>{i + 1}</span>}
                </span>
                <span className={cn("text-[12.5px] font-semibold", active ? "text-bz-text" : done ? "text-bz-text" : "text-bz-text-soft")}>{s.label}</span>
              </button>
              {i < STAGES.length - 1 && <span className={cn("mx-2 h-px flex-1", i < curIdx ? "bg-bz-leaf-deep/40" : "bg-bz-line")} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// shared atoms
// ════════════════════════════════════════════════════════════════════════════

function StageShell({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-8 md:px-6 md:py-10">
      <div className="mb-6 flex items-end justify-between gap-3">
        <h1 className="text-[19px] font-semibold tracking-tight text-bz-text">{title}</h1>
        {aside}
      </div>
      {children}
    </div>
  );
}

function AccountSelect({ value, onChange, locked }: { value: string | null; onChange: (id: string) => void; locked?: boolean }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const acc = accountById(value);
  React.useLayoutEffect(() => {
    if (!open || !btnRef.current) { setPos(null); return; }
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { const t = e.target as Node; if (ref.current && !ref.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <>
      <button ref={btnRef} disabled={locked} onClick={() => setOpen((v) => !v)} className={cn("flex h-10 w-full items-center gap-2.5 rounded-bz-md border px-3 text-left transition-colors", locked ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface hover:border-bz-text-muted")}>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm bg-bz-olive text-bz-fire"><Landmark size={14} /></span>
        <span className="min-w-0 flex-1">
          {acc ? <><span className="block truncate text-[13px] font-semibold text-bz-text">{acc.name}</span><span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{acc.number} · {acc.currency}</span></> : <span className="text-[13px] text-bz-text-soft">Choose the account to import into…</span>}
        </span>
        {locked ? <span className="shrink-0 rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[9.5px] font-semibold text-bz-text">From reconciliation</span> : <ChevronDown size={14} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />}
      </button>
      {open && pos && createPortal(
        <div ref={ref} style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width }} className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          {BANK_ACCOUNTS.map((a) => (
            <button key={a.id} onClick={() => { onChange(a.id); setOpen(false); }} className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left", a.id === value ? "bg-bz-fire/[0.08]" : "hover:bg-bz-paper-warm")}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted"><Landmark size={13} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-medium text-bz-text">{a.name}</span><span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{a.number}</span></span>
              <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text-muted">{a.currency}</span>
              {a.id === value && <Check size={13} className="text-bz-text" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 1 · UPLOAD & SOURCE
// ════════════════════════════════════════════════════════════════════════════

type PickedFile = { name: string; size: number };

function UploadStep({
  account, onAccount, accountLocked, format, onFormat, file, onFile, uploading, error,
}: {
  account: string | null;
  onAccount: (id: string) => void;
  accountLocked: boolean;
  format: "CSV" | "XLSX" | null;
  onFormat: (f: "CSV" | "XLSX") => void;
  file: PickedFile | null;
  onFile: (f: PickedFile | null) => void;
  uploading: boolean;
  error: string | null;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);

  const pickFile = (name: string, size: number) => {
    onFile({ name, size });
    const f = detectFormat(name);
    if (f) onFormat(f);
  };

  return (
    <StageShell
      title="Upload statement"
      aside={<button className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"><Download size={12} /> Sample.csv</button>}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-bz-text-soft">Account</p>
          <AccountSelect value={account} onChange={onAccount} locked={accountLocked} />
        </div>

        <div>
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f.name, f.size); }} />
          {file ? (
            <div className={cn("flex items-center gap-3 rounded-bz-lg border bg-bz-surface px-4 py-3.5", error ? "border-[#C0413A]" : "border-bz-line-soft")}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">{format === "XLSX" ? <FileSpreadsheet size={18} /> : <FileText size={18} />}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-bz-text">{file.name}</p>
                <p className={cn("text-[11px] text-bz-text-soft", NUM)}>{fmtSize(file.size)}{format ? ` · ${format}` : ""}</p>
              </div>
              <button onClick={() => { onFile(null); if (inputRef.current) inputRef.current.value = ""; }} className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={14} /></button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) pickFile(f.name, f.size); }}
              className={cn("flex flex-col items-center rounded-bz-lg border border-dashed px-5 py-10 text-center transition-colors", error ? "border-[#C0413A] bg-[#FBE7E5]/30" : drag ? "border-bz-olive bg-bz-fire/[0.08]" : "border-bz-line bg-bz-paper-warm/30")}
            >
              <span className="mb-3 flex size-11 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted"><Upload size={20} /></span>
              <p className="text-[13px] font-medium text-bz-text">Drop a CSV or Excel file</p>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => inputRef.current?.click()} className={cn(GHOST_BTN, "h-8")}>Browse</button>
                <button onClick={() => pickFile("nabil_statement_jun2026.csv", 48213)} className="text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">Use sample</button>
              </div>
            </div>
          )}
          {error && <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#9A2E29]"><AlertCircle size={12} /> {error}</p>}
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-bz-text-soft">Format</p>
          <div className="flex items-center gap-1.5">
            {(["CSV", "XLSX"] as const).map((f) => {
              const on = format === f; const Icon = f === "XLSX" ? FileSpreadsheet : FileText;
              return (
                <button key={f} onClick={() => onFormat(f)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-bz-md border px-4 text-[12px] font-medium transition-colors", on ? "border-bz-text bg-bz-fire/[0.08] text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm")}>
                  <Icon size={13} /> {f}{f === "XLSX" ? " / XLS" : ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-5 flex items-center gap-2.5 text-[12.5px] font-medium text-bz-text-muted">
          <Loader2 size={15} className="animate-spin text-bz-fire" /> Parsing {file?.name}…
        </div>
      )}
    </StageShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 2 · COLUMN MAPPING
// ════════════════════════════════════════════════════════════════════════════

function MappingStep({ parsed, mapping, onMap, hadSaved, saving }: { parsed: Parsed; mapping: Mapping; onMap: (header: string, target: string) => void; hadSaved: boolean; saving: boolean }) {
  const used = (key: string) => parsed.headers.filter((h) => mapping[h] === key);
  const hasDate = used("date").length > 0;
  const hasAmount = used("deposit").length > 0 || used("withdrawal").length > 0;
  const missing: string[] = [];
  if (!hasDate) missing.push("a Transaction date");
  if (!hasAmount) missing.push("a Deposit or Withdrawal");

  return (
    <StageShell
      title="Map columns"
      aside={
        missing.length ? (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#9A2E29]"><TriangleAlert size={12} /> Map {missing.join(" & ")}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted"><CheckCircle2 size={12} className="text-bz-leaf-deep" /> {hadSaved ? "Saved mapping applied" : "Required fields covered"}</span>
        )
      }
    >
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <div className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-2 border-b border-bz-line bg-bz-paper-warm px-4 py-2 text-[9.5px] font-bold uppercase tracking-[0.1em] text-bz-text-muted">
          <span>Source column</span><span /><span>Maps to</span>
        </div>
        {parsed.headers.map((h, i) => {
          const target = mapping[h] ?? "ignore";
          const dupe = target !== "ignore" && used(target).length > 1;
          const ignored = target === "ignore";
          return (
            <div key={h} className={cn("grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-2 border-b border-bz-line-soft px-4 py-2.5 last:border-b-0", ignored && "opacity-70")}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-[9.5px] font-bold text-bz-text-muted", NUM)}>{i + 1}</span>
                <span className="truncate text-[12.5px] font-medium text-bz-text">{h}</span>
              </div>
              <ArrowRight size={13} className="text-bz-text-soft" />
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <select
                    value={target}
                    onChange={(e) => onMap(h, e.target.value)}
                    className={cn("h-9 w-full appearance-none rounded-bz-md border bg-bz-surface pl-2.5 pr-8 text-[12.5px] outline-none focus:border-bz-text", ignored ? "border-bz-line-soft text-bz-text-soft" : "border-bz-line text-bz-text")}
                  >
                    {TARGETS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
                </div>
                {dupe && <span title="Mapped more than once" className="shrink-0"><AlertCircle size={14} className="text-[#C0413A]" /></span>}
              </div>
            </div>
          );
        })}
      </div>

      {saving && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-bz-text-muted"><Loader2 size={12} className="animate-spin" /> Saving mapping…</div>
      )}
    </StageShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 3 · PREVIEW & CONFIRM
// ════════════════════════════════════════════════════════════════════════════

const KLASS_META: Record<PreviewRow["klass"], { label: string; chip: string; dot: string }> = {
  new: { label: "New", chip: "bg-bz-fire/[0.18] text-bz-text", dot: "bg-bz-leaf-deep" },
  duplicate: { label: "Duplicate", chip: "bg-bz-paper-warm text-bz-text-muted", dot: "bg-bz-text-soft" },
  error: { label: "Error", chip: "bg-[#FBE5E2] text-[#9A2E29]", dot: "bg-[#C0413A]" },
};

function PreviewStep({ rows, currency }: { rows: PreviewRow[]; currency: string }) {
  const total = rows.length;
  const news = rows.filter((r) => r.klass === "new").length;
  const dups = rows.filter((r) => r.klass === "duplicate").length;
  const errs = rows.filter((r) => r.klass === "error").length;

  return (
    <StageShell title="Preview">
      {/* summary */}
      <div className="mb-5 flex flex-wrap items-center gap-x-8 gap-y-3">
        {[
          { label: "rows", value: total, dot: null },
          { label: "new", value: news, dot: KLASS_META.new.dot },
          { label: "duplicate", value: dups, dot: KLASS_META.duplicate.dot },
          { label: "error", value: errs, dot: KLASS_META.error.dot },
        ].map((s) => (
          <div key={s.label} className="flex items-baseline gap-1.5">
            <span className={cn("text-[20px] font-semibold leading-none text-bz-text", NUM)}>{s.value}</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-bz-text-muted">{s.dot && <span className={cn("size-1.5 rounded-bz-pill", s.dot)} />}{s.label}</span>
          </div>
        ))}
      </div>

      {news === 0 && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-bz-md bg-[#FBE7E5] px-3.5 py-2 text-[11.5px] font-medium text-[#9A2E29]">
          <CircleSlash size={13} /> Nothing new to import
        </div>
      )}

      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left" style={{ minWidth: 720 }}>
            <thead>
              <tr className="border-b border-bz-line bg-bz-paper-warm text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">
                <th className="px-3 py-2 w-8">#</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Deposit</th>
                <th className="px-3 py-2 text-right">Withdrawal</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Reference</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.idx} className={cn("border-b border-bz-line-soft last:border-0", r.klass === "error" && "bg-[#FBE7E5]/30", r.klass === "duplicate" && "bg-bz-paper-warm/30")}>
                  <td className={cn("px-3 py-2.5 text-[11px] text-bz-text-soft", NUM)}>{r.idx}</td>
                  <td className={cn("px-3 py-2.5 text-[12px] text-bz-text", NUM)}>{fmtAD(r.dateISO)}</td>
                  <td className={cn("px-3 py-2.5 text-right text-[12px] text-bz-text", NUM)}>{r.deposit != null ? grp(r.deposit) : "—"}</td>
                  <td className={cn("px-3 py-2.5 text-right text-[12px] text-bz-text-muted", NUM)}>{r.withdrawal != null ? grp(r.withdrawal) : "—"}</td>
                  <td className="px-3 py-2.5"><span className="block max-w-[220px] truncate text-[12px] text-bz-text">{r.description}</span></td>
                  <td className={cn("px-3 py-2.5 text-[11px] text-bz-text-muted", NUM)}>{r.reference ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-bz-sm px-2 py-0.5 text-[10.5px] font-medium", KLASS_META[r.klass].chip)} title={r.reason}>
                      <span className={cn("size-1.5 rounded-bz-pill", KLASS_META[r.klass].dot)} /> {KLASS_META[r.klass].label}
                    </span>
                    {r.reason && <span className="mt-0.5 block max-w-[200px] truncate text-[9.5px] text-bz-text-soft" title={r.reason}>{r.reason}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className={cn("mt-2.5 text-[11px] text-bz-text-soft", NUM)}>All {total} rows · {currency}</p>
    </StageShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 4 · IMPORT PROGRESS & RESULT  (polls until terminal)
// ════════════════════════════════════════════════════════════════════════════

type Outcome = "pending" | "running" | "success" | "partial" | "error";
const OUTCOME_META: Record<Outcome, { label: string; tone: "run" | "ok" | "warn" | "bad" }> = {
  pending: { label: "Queued", tone: "run" },
  running: { label: "Importing…", tone: "run" },
  success: { label: "Import complete", tone: "ok" },
  partial: { label: "Imported with skips", tone: "warn" },
  error: { label: "Import failed", tone: "bad" },
};

function ImportStatusStep({
  outcome, processed, total, imported, skipped, failed, errors, accountName,
}: {
  outcome: Outcome; processed: number; total: number; imported: number; skipped: number; failed: number; errors: { row: number; reason: string }[]; accountName: string;
}) {
  const [logOpen, setLogOpen] = React.useState(false);
  const pct = total ? Math.round((processed / total) * 100) : 0;
  const meta = OUTCOME_META[outcome];
  const running = outcome === "pending" || outcome === "running";

  const ring = meta.tone === "ok" ? "bg-bz-fire/[0.18] text-bz-leaf-deep" : meta.tone === "warn" ? "bg-bz-leaf/50 text-bz-text" : meta.tone === "bad" ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text-muted";

  return (
    <StageShell title="Import">
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        {/* status head */}
        <div className="flex items-center gap-3 border-b border-bz-line-soft px-5 py-4">
          <span className={cn("flex size-11 items-center justify-center rounded-bz-lg", ring)}>
            {running ? <Loader2 size={20} className="animate-spin" /> : meta.tone === "ok" ? <CheckCircle2 size={20} /> : meta.tone === "warn" ? <TriangleAlert size={20} /> : <AlertCircle size={20} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-bz-text">{meta.label}</p>
            <p className={cn("text-[11.5px] text-bz-text-muted", NUM)}>{accountName} · {running ? `processing ${processed} of ${total}…` : `${processed} of ${total} rows processed`}</p>
          </div>
          <span className={cn("text-[20px] font-semibold text-bz-text", NUM)}>{pct}%</span>
        </div>

        {/* progress bar */}
        <div className="px-5 pt-4">
          <div className="h-2 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
            <div className={cn("h-full rounded-bz-pill transition-[width] duration-500", meta.tone === "bad" ? "bg-[#C0413A]" : "bg-bz-fire")} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* counters */}
        <div className="grid grid-cols-3 gap-2 p-5">
          {[
            { label: "Imported", value: imported, dot: "bg-bz-leaf-deep" },
            { label: "Skipped — duplicate", value: skipped, dot: "bg-bz-text-soft" },
            { label: "Failed", value: failed, dot: "bg-[#C0413A]" },
          ].map((c) => (
            <div key={c.label} className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3 text-center">
              <p className={cn("text-[22px] font-semibold leading-none text-bz-text", NUM)}>{c.value}</p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.04em] text-bz-text-muted"><span className={cn("size-1.5 rounded-bz-pill", c.dot)} /> {c.label}</p>
            </div>
          ))}
        </div>

        {/* error log (only when there are failures) */}
        {failed > 0 && !running && (
          <div className="border-t border-bz-line-soft">
            <button onClick={() => setLogOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 px-5 py-3 hover:bg-bz-paper-warm/40">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-bz-text"><AlertCircle size={13} className="text-[#9A2E29]" /> Error log <span className={cn("rounded-bz-sm bg-[#FBE5E2] px-1.5 py-0.5 text-[10px] text-[#9A2E29]", NUM)}>{errors.length}</span></span>
              <ChevronDown size={14} className={cn("text-bz-text-muted transition-transform", logOpen && "rotate-180")} />
            </button>
            {logOpen && (
              <div className="border-t border-bz-line-soft bg-bz-paper-warm/30 px-5 py-3">
                <div className="flex flex-col gap-1.5">
                  {errors.map((e) => (
                    <div key={e.row} className="flex items-start gap-2 text-[11.5px]">
                      <span className={cn("mt-px shrink-0 rounded-bz-sm bg-[#FBE5E2] px-1.5 py-px font-semibold text-[#9A2E29]", NUM)}>Row {e.row}</span>
                      <span className="text-bz-text-muted">{e.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {running && <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted"><RotateCw size={11} className="animate-spin" /> Polling for updates every few seconds…</p>}
    </StageShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED FOOTER  (lives in the AppShell overlay slot — back + gated primary)
// ════════════════════════════════════════════════════════════════════════════

function WizardFooter({
  stage, canAdvance, advanceLabel, advanceBusy, gateReason, terminal, onBack, onAdvance, onDone, backLabel,
}: {
  stage: StageKey;
  canAdvance: boolean;
  advanceLabel: string;
  advanceBusy: boolean;
  gateReason: string | null;
  terminal: boolean;
  onBack: () => void;
  onAdvance: () => void;
  onDone: () => void;
  backLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-3 md:px-8">
      <button onClick={onBack} disabled={stage === "upload" || stage === "status"} className={cn(GHOST_BTN, "disabled:opacity-40")}>
        <ArrowLeft size={13} /> {backLabel}
      </button>

      <div className="flex items-center gap-3">
        {gateReason && !canAdvance && stage !== "status" && (
          <span className="hidden items-center gap-1.5 text-[11px] text-bz-text-muted sm:inline-flex"><AlertCircle size={12} /> {gateReason}</span>
        )}
        {stage === "status" ? (
          <button onClick={onDone} disabled={!terminal} className={PRIMARY_BTN}>
            {terminal ? <><CheckCircle2 size={14} /> Done — back to reconciliation</> : <><Loader2 size={14} className="animate-spin" /> Import running…</>}
          </button>
        ) : (
          <button onClick={onAdvance} disabled={!canAdvance || advanceBusy} className={PRIMARY_BTN}>
            {advanceBusy && <Loader2 size={14} className="animate-spin" />} {advanceLabel} {!advanceBusy && <ArrowRight size={14} />}
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
  const incomingAccount = params.get("account");

  const [stage, setStage] = React.useState<StageKey>("upload");
  const [completed, setCompleted] = React.useState<Set<StageKey>>(new Set());

  // stage 1
  const [account, setAccount] = React.useState<string | null>(incomingAccount ?? null);
  const [format, setFormat] = React.useState<"CSV" | "XLSX" | null>(null);
  const [file, setFile] = React.useState<PickedFile | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // threaded
  const [parsed, setParsed] = React.useState<Parsed | null>(null);
  const [mapping, setMapping] = React.useState<Mapping>({});
  const [hadSaved, setHadSaved] = React.useState(false);
  const [savingMap, setSavingMap] = React.useState(false);

  // stage 4
  const [outcome, setOutcome] = React.useState<Outcome>("pending");
  const [processed, setProcessed] = React.useState(0);

  const acc = accountById(account);
  const currency = acc?.currency ?? "NPR";
  const accountLocked = !!incomingAccount;

  // preview counts
  const newRows = SAMPLE_ROWS.filter((r) => r.klass === "new").length;
  const dupRows = SAMPLE_ROWS.filter((r) => r.klass === "duplicate").length;
  const errRows = SAMPLE_ROWS.filter((r) => r.klass === "error").length;
  const total = SAMPLE_ROWS.length;
  const errorLog = SAMPLE_ROWS.filter((r) => r.klass === "error").map((r) => ({ row: r.idx, reason: r.reason ?? "Unparseable row" }));

  // ── stage 1: parse/upload (gated: account + format + file) ──
  const canUpload = !!account && !!format && !!file;
  const doUpload = () => {
    if (!canUpload) return;
    setUploading(true); setUploadError(null);
    window.setTimeout(() => {
      setUploading(false);
      const importId = `IMP-${Math.floor(40000 + Math.random() * 9999)}`;
      setParsed({ importId, headers: SAMPLE_HEADERS, rowCount: 248, delimiter: format === "CSV" ? "," : "tab" });
      // mapping: saved overlay or auto-guess
      const saved = account ? SAVED_MAPPINGS[account] : undefined;
      if (saved) { setMapping({ ...saved }); setHadSaved(true); }
      else { setMapping(Object.fromEntries(SAMPLE_HEADERS.map((h) => [h, guessTarget(h)]))); setHadSaved(false); }
      setCompleted((p) => new Set(p).add("upload"));
      setStage("mapping");
    }, 1000);
  };

  // ── stage 2: save mapping (gated: date + one amount) ──
  const used = (key: string) => parsed ? parsed.headers.filter((h) => mapping[h] === key) : [];
  const mappingValid = used("date").length > 0 && (used("deposit").length > 0 || used("withdrawal").length > 0);
  const saveMapping = () => {
    if (!mappingValid) return;
    setSavingMap(true);
    window.setTimeout(() => {
      if (account) SAVED_MAPPINGS[account] = { ...mapping };
      setSavingMap(false);
      setCompleted((p) => new Set(p).add("mapping"));
      setStage("preview");
    }, 750);
  };

  // ── stage 3: start import (gated: ≥1 new row) ──
  const canStart = newRows > 0;
  const startImport = () => {
    if (!canStart) return;
    setCompleted((p) => new Set(p).add("preview"));
    setOutcome("pending");
    setProcessed(0);
    setStage("status");
  };

  // ── stage 4: live polling, self-terminating ──
  React.useEffect(() => {
    if (stage !== "status") return;
    if (outcome !== "pending" && outcome !== "running") return;
    const t = window.setTimeout(() => {
      setProcessed((p) => {
        const next = Math.min(p + Math.max(1, Math.round(total / 6)), total);
        if (next >= total) {
          setOutcome(errRows > 0 ? "partial" : "success");
        } else {
          setOutcome("running");
        }
        return next;
      });
    }, 700);
    return () => window.clearTimeout(t);
  }, [stage, outcome, processed, total, errRows]);

  const terminal = outcome === "success" || outcome === "partial" || outcome === "error";

  const goBack = () => {
    if (stage === "preview") setStage("mapping");
    else if (stage === "mapping") setStage("upload");
  };
  const jump = (s: StageKey) => { if (completed.has(s)) setStage(s); };

  const finish = () => {
    if (incomingAccount) navigate(`/design/bank-reconciliation?account=${account}&imported=1&count=${imported}`);
    else navigate(`/design/bank-reconciliation`);
  };

  // counters for status stage
  const ratio = total ? processed / total : 0;
  const imported = Math.round(newRows * ratio);
  const skipped = Math.round(dupRows * ratio);
  const failed = Math.round(errRows * ratio);

  // gate reason copy
  const gateReason =
    stage === "upload" ? (!account ? "Choose an account" : !file ? "Pick a statement file" : !format ? "Set the file format" : null)
    : stage === "mapping" ? (!mappingValid ? "Map a date and an amount column" : null)
    : stage === "preview" ? (!canStart ? "No new rows to import" : null)
    : null;

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
        <WizardFooter
          stage={stage}
          canAdvance={stage === "upload" ? canUpload : stage === "mapping" ? mappingValid : stage === "preview" ? canStart : false}
          advanceLabel={stage === "upload" ? "Parse file" : stage === "mapping" ? "Save & preview" : "Start import"}
          advanceBusy={stage === "upload" ? uploading : stage === "mapping" ? savingMap : false}
          gateReason={gateReason}
          terminal={terminal}
          backLabel={stage === "preview" ? "Back to mapping" : "Back"}
          onBack={goBack}
          onAdvance={stage === "upload" ? doUpload : stage === "mapping" ? saveMapping : startImport}
          onDone={finish}
        />
      }
    >
      <Stepper current={stage} completed={completed} onJump={jump} />

      {stage === "upload" && (
        <UploadStep
          account={account}
          onAccount={setAccount}
          accountLocked={accountLocked}
          format={format}
          onFormat={setFormat}
          file={file}
          onFile={(f) => { setFile(f); setUploadError(null); }}
          uploading={uploading}
          error={uploadError}
        />
      )}

      {stage === "mapping" && parsed && (
        <MappingStep parsed={parsed} mapping={mapping} onMap={(h, t) => setMapping((m) => ({ ...m, [h]: t }))} hadSaved={hadSaved} saving={savingMap} />
      )}

      {stage === "preview" && (
        <PreviewStep rows={SAMPLE_ROWS} currency={currency} />
      )}

      {stage === "status" && (
        <ImportStatusStep
          outcome={outcome}
          processed={processed}
          total={total}
          imported={imported}
          skipped={skipped}
          failed={failed}
          errors={errorLog}
          accountName={acc?.name ?? "the account"}
        />
      )}
    </AppShell>
  );
}
