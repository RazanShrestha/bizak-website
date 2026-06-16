import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownToLine,
  RefreshCw,
  RotateCw,
  Plus,
  Search,
  X,
  Check,
  MoreHorizontal,
  Eye,
  Trash2,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  CircleDashed,
  Layers,
  ArrowDownUp,
  Clock,
  Inbox,
  SearchX,
  Database,
  TriangleAlert,
  Info,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// DATA IMPORT · HISTORY  (browse & triage the record of bulk-import artifacts)
//
// Primary focus  = the artifact collection (scan / sort / filter / group / act).
// Primary action = New Import (the one filled button — a route handoff to the
//                  importer at /design/data-imports/new).
//
// The collection is treated as SERVER-DRIVEN: every browse interaction
// (page · sort · filter · group) emits a single query snapshot and the page
// "re-queries" (a busy bar fires, then the committed rows refresh). Every
// mutation (delete · download) runs busy → re-fetch, so derived values — the
// download count, the presence of a row — stay accurate without a manual reload.
//
// Layout (top → bottom):
//   1. Header        identity + live count + Refresh / New Import
//   2. Lifecycle rail one slim segmented strip over the current result set
//   3. Collection    one surface: toolbar (search · filters · group · sort) →
//                    busy bar → table (or skeleton / empty / grouped) → pager
//   4. Modals        one shared dialog reused as a delete-confirm gate AND a
//                    read-only record-details viewer
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const g = (n: number) => n.toLocaleString("en-US");

// ── dates ──
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TODAY_ISO = "2026-06-14";
const toInt = (iso: string) => Number(iso.slice(0, 10).replace(/-/g, ""));
function fmtDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
function fmtTime(iso: string) {
  const t = iso.slice(11, 16);
  return t || "";
}
/** whole-day delta from today (negative = past) */
function daysFromToday(iso: string) {
  const a = new Date(TODAY_ISO + "T00:00:00").getTime();
  const b = new Date(iso.slice(0, 10) + "T00:00:00").getTime();
  return Math.round((b - a) / 86_400_000);
}
function relativeDays(iso: string) {
  const d = daysFromToday(iso);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  if (d > 0) return `in ${d} days`;
  return `${-d} days ago`;
}

// ════════════════════════════════════════════════════════════════════════════
// STATUS / ACTION VOCABULARY  data-driven transforms over the raw record
//   • status code → friendly label + a distinct lifecycle icon + tone
//   • action code → insert / update meaning
// (unrecognised codes fall through to their raw value)
// ════════════════════════════════════════════════════════════════════════════

type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";

const CHIP_BG: Record<Tone, string> = {
  positive: "bg-bz-fire/[0.18] text-bz-text",
  partial: "bg-bz-leaf/50 text-bz-text",
  pending: "bg-bz-paper-warm text-bz-text-muted",
  danger: "bg-[#FBE5E2] text-[#9A2E29]",
  neutral: "bg-bz-paper-warm text-bz-text",
};
const ICON_TINT: Record<Tone, string> = {
  positive: "text-bz-leaf-deep",
  partial: "text-bz-leaf-deep",
  pending: "text-bz-text-soft",
  danger: "text-[#C0413A]",
  neutral: "text-bz-text-muted",
};
const SEG_COLOR: Record<Tone, string> = {
  positive: "var(--bz-leaf-deep)",
  partial: "var(--bz-fire)",
  pending: "var(--bz-leaf)",
  danger: "#C0413A",
  neutral: "var(--bz-line)",
};

type IconC = React.ComponentType<{ size?: number; className?: string }>;

function statusMeta(code: string): { label: string; tone: Tone; icon: IconC; spin?: boolean } {
  switch (code) {
    case "completed": return { label: "Completed", tone: "positive", icon: CheckCircle2 };
    case "processing": return { label: "Processing", tone: "pending", icon: Loader2, spin: true };
    case "failed": return { label: "Failed records", tone: "danger", icon: AlertTriangle };
    case "source": return { label: "Source file", tone: "neutral", icon: FileText };
    default: return { label: code, tone: "neutral", icon: CircleDashed }; // raw fallback
  }
}
const LIFECYCLE_ORDER = ["completed", "processing", "failed", "source"];

function actionMeta(code: string): { label: string; icon: IconC; cls: string } {
  return code === "insert"
    ? { label: "Insert", icon: ArrowDownToLine, cls: "bg-bz-leaf/45 text-bz-text" }
    : { label: "Update", icon: RefreshCw, cls: "bg-bz-paper-warm text-bz-text-muted" };
}

function StatusBadge({ code }: { code: string }) {
  const m = statusMeta(code);
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", CHIP_BG[m.tone])}>
      <Icon size={11} className={cn("shrink-0", ICON_TINT[m.tone], m.spin && "animate-spin")} />
      {m.label}
    </span>
  );
}

function ActionPill({ code }: { code: string }) {
  const m = actionMeta(code);
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-bz-sm px-1.5 py-0.5 text-[10.5px] font-medium", m.cls)}>
      <Icon size={10} /> {m.label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DATA  the import-artifact set (seeded to exercise every renderer + branch)
// ════════════════════════════════════════════════════════════════════════════

type FileKind = "CSV" | "XLSX";
type ImportRecord = {
  id: string;
  fileName: string;
  fileType: FileKind;
  sizeKb: number | null;
  target: string;
  status: string;
  action: "insert" | "update";
  downloads: number;
  uploadedISO: string | null; // null → fallback marker
  autoDeleteISO: string | null; // null → "Never"
  fileRef: boolean; // downloadable?
  rows: number | null;
};

const SEED: ImportRecord[] = [
  { id: "IMP-2098", fileName: "customers_master_2026-05.csv", fileType: "CSV", sizeKb: 482, target: "Customers", status: "completed", action: "insert", downloads: 6, uploadedISO: "2026-06-12T14:32", autoDeleteISO: "2026-09-10", fileRef: true, rows: 1240 },
  { id: "IMP-2097", fileName: "items_pricing_update_q2.xlsx", fileType: "XLSX", sizeKb: 1180, target: "Items", status: "processing", action: "update", downloads: 0, uploadedISO: "2026-06-14T09:05", autoDeleteISO: "2026-07-14", fileRef: false, rows: null },
  { id: "IMP-2096", fileName: "leads_dashain_campaign_failed-rows.csv", fileType: "CSV", sizeKb: 64, target: "Leads", status: "failed", action: "insert", downloads: 3, uploadedISO: "2026-06-11T17:48", autoDeleteISO: "2026-06-18", fileRef: true, rows: 38 },
  { id: "IMP-2095", fileName: "ledger_accounts_restructure.csv", fileType: "CSV", sizeKb: 96, target: "Ledger Accounts", status: "completed", action: "update", downloads: 11, uploadedISO: "2026-06-10T11:20", autoDeleteISO: null, fileRef: true, rows: 312 },
  { id: "IMP-2094", fileName: "suppliers_onboarding_batch3.xlsx", fileType: "XLSX", sizeKb: 740, target: "Suppliers", status: "source", action: "insert", downloads: 2, uploadedISO: "2026-06-09T08:14", autoDeleteISO: "2026-08-08", fileRef: true, rows: 86 },
  { id: "IMP-2093", fileName: "currencies_fx_seed.csv", fileType: "CSV", sizeKb: 8, target: "Currencies", status: "completed", action: "insert", downloads: 0, uploadedISO: "2026-06-08T19:02", autoDeleteISO: "2026-09-06", fileRef: true, rows: 12 },
  { id: "IMP-2092", fileName: "items_new_skus_warehouse02.csv", fileType: "CSV", sizeKb: 256, target: "Items", status: "completed", action: "insert", downloads: 4, uploadedISO: "2026-06-06T13:40", autoDeleteISO: "2026-09-04", fileRef: true, rows: 540 },
  { id: "IMP-2091", fileName: "units_of_measure.csv", fileType: "CSV", sizeKb: 4, target: "Units", status: "completed", action: "insert", downloads: 1, uploadedISO: null, autoDeleteISO: "2026-09-02", fileRef: true, rows: 24 },
  { id: "IMP-2090", fileName: "customers_credit_terms_update.xlsx", fileType: "XLSX", sizeKb: 388, target: "Customers", status: "failed", action: "update", downloads: 5, uploadedISO: "2026-06-03T10:11", autoDeleteISO: "2026-06-17", fileRef: true, rows: 71 },
  { id: "IMP-2089", fileName: "tax_codes_2083.csv", fileType: "CSV", sizeKb: 6, target: "Tax Codes", status: "completed", action: "insert", downloads: 0, uploadedISO: "2026-06-01T15:55", autoDeleteISO: null, fileRef: true, rows: 9 },
  { id: "IMP-2088", fileName: "price_lists_wholesale.xlsx", fileType: "XLSX", sizeKb: 920, target: "Price Lists", status: "processing", action: "update", downloads: 0, uploadedISO: "2026-05-31T12:30", autoDeleteISO: "2026-06-30", fileRef: false, rows: null },
  { id: "IMP-2087", fileName: "leads_q1_import.csv", fileType: "CSV", sizeKb: 142, target: "Leads", status: "completed", action: "insert", downloads: 9, uploadedISO: "2026-05-28T09:48", autoDeleteISO: "2026-08-26", fileRef: true, rows: 410 },
  { id: "IMP-2086", fileName: "employees_payroll_seed.xlsx", fileType: "XLSX", sizeKb: 512, target: "Employees", status: "source", action: "insert", downloads: 2, uploadedISO: "2026-05-25T16:20", autoDeleteISO: "2026-07-24", fileRef: true, rows: 64 },
  { id: "IMP-2085", fileName: "ledger_opening_balances.csv", fileType: "CSV", sizeKb: 78, target: "Ledger Accounts", status: "completed", action: "insert", downloads: 14, uploadedISO: "2026-05-22T11:02", autoDeleteISO: "2026-08-20", fileRef: true, rows: 198 },
  { id: "IMP-2084", fileName: "items_legacy_archive.csv", fileType: "CSV", sizeKb: 1024, target: "Items", status: "archived", action: "update", downloads: 0, uploadedISO: "2026-05-18T08:00", autoDeleteISO: null, fileRef: false, rows: 2100 },
  { id: "IMP-2083", fileName: "customers_dedupe_failed-rows.csv", fileType: "CSV", sizeKb: 22, target: "Customers", status: "failed", action: "update", downloads: 7, uploadedISO: "2026-05-15T14:15", autoDeleteISO: "2026-06-16", fileRef: true, rows: 19 },
];

// ════════════════════════════════════════════════════════════════════════════
// QUERY SNAPSHOT  the single state object the "server" re-queries on
// ════════════════════════════════════════════════════════════════════════════

type SortField = "fileName" | "target" | "status" | "uploaded" | "autoDelete" | "downloads";
type GroupField = "none" | "target" | "status" | "action";
type Query = {
  search: string;
  target: string | null;
  status: string | null;
  action: string | null;
  sortField: SortField;
  sortDir: "asc" | "desc";
  group: GroupField;
  page: number;
  pageSize: number;
};
const PAGE_SIZES = [8, 12, 24];
const INITIAL_QUERY: Query = {
  search: "", target: null, status: null, action: null,
  sortField: "uploaded", sortDir: "desc", group: "none", page: 0, pageSize: 8,
};

const SORT_LABELS: Record<SortField, string> = {
  fileName: "file name", target: "target", status: "status",
  uploaded: "uploaded date", autoDelete: "auto-delete", downloads: "downloads",
};
const GROUP_LABELS: Record<GroupField, string> = {
  none: "None", target: "Target", status: "Status", action: "Action type",
};

function sortValue(r: ImportRecord, f: SortField): number | string {
  switch (f) {
    case "fileName": return r.fileName.toLowerCase();
    case "target": return r.target.toLowerCase();
    case "status": return statusMeta(r.status).label.toLowerCase();
    case "uploaded": return r.uploadedISO ? toInt(r.uploadedISO) : 0;
    case "autoDelete": return r.autoDeleteISO ? toInt(r.autoDeleteISO) : Number.MAX_SAFE_INTEGER;
    case "downloads": return r.downloads;
  }
}

function groupValue(r: ImportRecord, f: Exclude<GroupField, "none">): { key: string; label: string } {
  if (f === "target") return { key: r.target, label: r.target };
  if (f === "status") return { key: r.status, label: statusMeta(r.status).label };
  return { key: r.action, label: actionMeta(r.action).label };
}

// ════════════════════════════════════════════════════════════════════════════
// ANCHORED DROPDOWN  (single-select filter / group menu — portal positioned)
// ════════════════════════════════════════════════════════════════════════════

function useAnchored(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !ref.current) { setPos(null); return; }
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, ref]);
  return pos;
}

type Choice = { value: string | null; label: string; hint?: string };

function SelectMenu({
  label, icon: Icon, value, options, onChange, align = "left", minWidth = 200,
}: {
  label: string;
  icon?: IconC;
  value: string | null;
  options: Choice[];
  onChange: (v: string | null) => void;
  align?: "left" | "right";
  minWidth?: number;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchored(open, btnRef);
  const active = options.find((o) => o.value === value) ?? options[0];
  const isSet = value != null;

  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-bz-md border px-3 text-[12px] font-medium transition-colors",
          isSet ? "border-bz-text bg-bz-surface text-bz-text" : open ? "border-bz-text bg-bz-surface text-bz-text" : "border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm",
        )}
      >
        {Icon && <Icon size={13} className="text-bz-text-muted" />}
        {label && <span className="text-bz-text-muted">{label}:</span>}
        <span className="max-w-[120px] truncate font-semibold">{active.label}</span>
        <ChevronDown size={12} className={cn("text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: align === "right" ? undefined : pos.left, right: align === "right" ? window.innerWidth - pos.left - pos.width : undefined, minWidth: Math.max(pos.width, minWidth) }}
          className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.2)]"
        >
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <button
                key={o.label}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn("flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-bz-paper-warm", sel && "bg-bz-fire/[0.06]")}
              >
                <span className="flex flex-col">
                  <span className="text-[12.5px] text-bz-text">{o.label}</span>
                  {o.hint && <span className={cn("text-[10.5px] text-bz-text-soft", NUM)}>{o.hint}</span>}
                </span>
                {sel && <Check size={13} className="shrink-0 text-bz-text" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PER-RECORD ACTION MENU  download (disabled when no file) · details · delete
// ════════════════════════════════════════════════════════════════════════════

function RowMenu({
  record, onDownload, onView, onDelete,
}: {
  record: ImportRecord;
  onDownload: (r: ImportRecord) => void;
  onView: (r: ImportRecord) => void;
  onDelete: (r: ImportRecord) => void;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchored(open, btnRef);

  React.useEffect(() => {
    if (!open) return;
    const closeFn = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", closeFn, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", closeFn, true);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Record actions"
        className={cn("flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text", open && "bg-bz-paper-warm text-bz-text")}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left - 168 + pos.width }}
          className="z-50 w-[200px] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.2)]"
        >
          {record.fileRef ? (
            <button onClick={() => { close(); onDownload(record); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm">
              <Download size={14} className="text-bz-text-muted" />
              <span className="text-[12.5px] text-bz-text">Download file</span>
            </button>
          ) : (
            <div className="flex cursor-not-allowed items-center gap-2.5 px-3 py-2 opacity-45" title="No downloadable file for this record">
              <Download size={14} className="text-bz-text-muted" />
              <span className="text-[12.5px] text-bz-text">Download file</span>
            </div>
          )}
          <button onClick={() => { close(); onView(record); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm">
            <Eye size={14} className="text-bz-text-muted" />
            <span className="text-[12.5px] text-bz-text">View details</span>
          </button>
          <div className="my-1 h-px bg-bz-line-soft" />
          <button onClick={() => { close(); onDelete(record); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-[#FBE5E2]/60">
            <Trash2 size={14} className="text-[#C0413A]" />
            <span className="text-[12.5px] text-[#9A2E29]">Delete record</span>
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PER-FIELD RENDERERS  file-identity · downloads · uploaded · auto-delete
// ════════════════════════════════════════════════════════════════════════════

function FileIdentity({ record }: { record: ImportRecord }) {
  const Icon = record.fileType === "XLSX" ? FileSpreadsheet : FileText;
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <Icon size={15} />
      </span>
      <span className="min-w-0">
        <span className="block max-w-[260px] truncate text-[12.5px] font-medium text-bz-text" title={record.fileName}>
          {record.fileName}
        </span>
        <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
          {record.fileType}
          {record.sizeKb != null && <> · {record.sizeKb >= 1024 ? `${(record.sizeKb / 1024).toFixed(1)} MB` : `${record.sizeKb} KB`}</>}
        </span>
      </span>
    </div>
  );
}

function Downloads({ n }: { n: number }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px]", n > 0 ? "text-bz-text" : "text-bz-text-soft", NUM)}>
      <Download size={11} className="text-bz-text-soft" /> {n}
    </span>
  );
}

function Uploaded({ iso }: { iso: string | null }) {
  if (!iso) return <span className="text-[11.5px] text-bz-text-soft">— not recorded</span>;
  return (
    <span className="block">
      <span className={cn("block text-[12px] text-bz-text", NUM)}>{fmtDate(iso)}</span>
      <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{fmtTime(iso)}</span>
    </span>
  );
}

function AutoDelete({ iso }: { iso: string | null }) {
  if (!iso) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-muted">
        <CircleDashed size={11} className="text-bz-text-soft" /> Never
      </span>
    );
  }
  const days = daysFromToday(iso);
  const soon = days >= 0 && days <= 7;
  return (
    <span className="block">
      <span className={cn("block text-[12px]", soon ? "font-medium text-[#9A2E29]" : "text-bz-text", NUM)}>{fmtDate(iso)}</span>
      <span className={cn("flex items-center gap-1 text-[10.5px]", soon ? "text-[#C0413A]" : "text-bz-text-soft")}>
        {soon && <Clock size={9} />} {relativeDays(iso)}
      </span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SORTABLE COLUMN HEADER
// ════════════════════════════════════════════════════════════════════════════

function SortHead({
  label, field, query, onSort, align = "left",
}: {
  label: string;
  field: SortField;
  query: Query;
  onSort: (f: SortField) => void;
  align?: "left" | "right";
}) {
  const active = query.sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "group inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.06em]",
        active ? "text-bz-text" : "text-bz-text-muted hover:text-bz-text",
        align === "right" && "flex-row-reverse",
      )}
    >
      {label}
      {active ? (query.sortDir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />) : <ChevronsUpDown size={12} className="text-bz-text-soft" />}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// THE TABLE (desktop)  +  CARDS (mobile)
// ════════════════════════════════════════════════════════════════════════════

const TH = "px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted whitespace-nowrap";
const TD = "px-3 py-3 align-middle";

function Row({
  r, onDownload, onView, onDelete,
}: {
  r: ImportRecord;
  onDownload: (r: ImportRecord) => void;
  onView: (r: ImportRecord) => void;
  onDelete: (r: ImportRecord) => void;
}) {
  return (
    <tr className="border-b border-bz-line-soft last:border-0 hover:bg-bz-paper-warm/40">
      <td className={TD}><FileIdentity record={r} /></td>
      <td className={cn(TD, "text-[12px] text-bz-text-muted")}>{r.target}</td>
      <td className={TD}><StatusBadge code={r.status} /></td>
      <td className={TD}><ActionPill code={r.action} /></td>
      <td className={cn(TD, "text-right")}><Downloads n={r.downloads} /></td>
      <td className={TD}><Uploaded iso={r.uploadedISO} /></td>
      <td className={TD}><AutoDelete iso={r.autoDeleteISO} /></td>
      <td className="px-2 py-3 text-right">
        <div className="flex justify-end"><RowMenu record={r} onDownload={onDownload} onView={onView} onDelete={onDelete} /></div>
      </td>
    </tr>
  );
}

function CollectionTable({
  rows, query, onSort, group, collapsed, onToggleGroup, groups, onDownload, onView, onDelete,
}: {
  rows: ImportRecord[];
  query: Query;
  onSort: (f: SortField) => void;
  group: GroupField;
  collapsed: Set<string>;
  onToggleGroup: (k: string) => void;
  groups: { key: string; label: string; items: ImportRecord[] }[];
  onDownload: (r: ImportRecord) => void;
  onView: (r: ImportRecord) => void;
  onDelete: (r: ImportRecord) => void;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left" style={{ minWidth: 1040 }}>
        <thead>
          <tr className="border-b border-bz-line bg-bz-paper-warm">
            <th className={TH}><SortHead label="File" field="fileName" query={query} onSort={onSort} /></th>
            <th className={TH}><SortHead label="Target" field="target" query={query} onSort={onSort} /></th>
            <th className={TH}><SortHead label="Status" field="status" query={query} onSort={onSort} /></th>
            <th className={TH}>Action</th>
            <th className={cn(TH, "text-right")}><SortHead label="Downloads" field="downloads" query={query} onSort={onSort} align="right" /></th>
            <th className={TH}><SortHead label="Uploaded" field="uploaded" query={query} onSort={onSort} /></th>
            <th className={TH}><SortHead label="Auto-delete" field="autoDelete" query={query} onSort={onSort} /></th>
            <th className="w-10 px-2 py-2.5" />
          </tr>
        </thead>
        {group === "none" ? (
          <tbody>
            {rows.map((r) => <Row key={r.id} r={r} onDownload={onDownload} onView={onView} onDelete={onDelete} />)}
          </tbody>
        ) : (
          groups.map((grp) => {
            const isCollapsed = collapsed.has(grp.key);
            return (
              <tbody key={grp.key} className="border-b border-bz-line-soft last:border-0">
                <tr className="bg-bz-paper-warm/60">
                  <td colSpan={8} className="px-3 py-2">
                    <button onClick={() => onToggleGroup(grp.key)} className="inline-flex items-center gap-2 text-left">
                      <span className="flex size-5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/50">
                        {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">{GROUP_LABELS[group]}</span>
                      <span className="text-[12.5px] font-semibold text-bz-text">{grp.label}</span>
                      <span className={cn("rounded-bz-pill bg-bz-surface px-1.5 py-0.5 text-[10px] font-semibold text-bz-text-muted", NUM)}>{grp.items.length}</span>
                    </button>
                  </td>
                </tr>
                {!isCollapsed && grp.items.map((r) => <Row key={r.id} r={r} onDownload={onDownload} onView={onView} onDelete={onDelete} />)}
              </tbody>
            );
          })
        )}
      </table>
    </div>
  );
}

function MobileCards({
  rows, onDownload, onView, onDelete,
}: {
  rows: ImportRecord[];
  onDownload: (r: ImportRecord) => void;
  onView: (r: ImportRecord) => void;
  onDelete: (r: ImportRecord) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 p-3 md:hidden">
      {rows.map((r) => (
        <div key={r.id} className="rounded-bz-md border border-bz-line-soft bg-bz-surface p-4">
          <div className="flex items-start justify-between gap-2">
            <FileIdentity record={r} />
            <RowMenu record={r} onDownload={onDownload} onView={onView} onDelete={onDelete} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <StatusBadge code={r.status} />
            <ActionPill code={r.action} />
            <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] text-bz-text-muted">{r.target}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-bz-line-soft pt-3">
            <div>
              <p className="text-[9.5px] font-medium uppercase tracking-[0.06em] text-bz-text-soft">Uploaded</p>
              <div className="mt-0.5"><Uploaded iso={r.uploadedISO} /></div>
            </div>
            <div>
              <p className="text-[9.5px] font-medium uppercase tracking-[0.06em] text-bz-text-soft">Auto-delete</p>
              <div className="mt-0.5"><AutoDelete iso={r.autoDeleteISO} /></div>
            </div>
            <div>
              <p className="text-[9.5px] font-medium uppercase tracking-[0.06em] text-bz-text-soft">Downloads</p>
              <div className="mt-0.5"><Downloads n={r.downloads} /></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── loading / empty ──

function Skeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center gap-2 py-5 text-bz-text-muted">
        <Loader2 size={16} className="animate-spin text-bz-fire" />
        <span className="text-[12.5px] font-medium">Loading import history…</span>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-bz-line-soft px-4 py-3.5">
          <div className="size-8 shrink-0 animate-pulse rounded-bz-md bg-bz-paper-warm" />
          <div className="h-3 w-48 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="h-5 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="ml-auto h-3 w-28 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        {filtered ? <SearchX size={22} /> : <Inbox size={22} />}
      </span>
      <p className="text-[14px] font-semibold text-bz-text">{filtered ? "No imports match" : "No import history yet"}</p>
      <p className="max-w-sm text-[12px] text-bz-text-muted">
        {filtered
          ? "No artifacts match the current search and filters. Try widening them."
          : "Bulk imports you run will be recorded here, ready to download, inspect or purge."}
      </p>
      {filtered && (
        <button onClick={onClear} className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm">
          <X size={13} /> Clear search & filters
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIFECYCLE RAIL  one slim segmented strip over the current result set
// ════════════════════════════════════════════════════════════════════════════

function LifecycleRail({ records }: { records: ImportRecord[] }) {
  const counts = React.useMemo(() => {
    const c: Record<string, number> = {};
    records.forEach((r) => { c[r.status] = (c[r.status] ?? 0) + 1; });
    return c;
  }, [records]);
  const total = records.length || 1;
  const known = LIFECYCLE_ORDER;
  const otherCount = records.length - known.reduce((s, k) => s + (counts[k] ?? 0), 0);
  const expiring = records.filter((r) => r.autoDeleteISO && daysFromToday(r.autoDeleteISO) >= 0 && daysFromToday(r.autoDeleteISO) <= 7).length;

  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-bz-md bg-bz-fire/[0.18] text-bz-text"><Database size={15} /></span>
          <div>
            <p className={cn("text-[15px] font-semibold leading-none text-bz-text", NUM)}>{g(records.length)} <span className="text-[11.5px] font-medium text-bz-text-muted">artifacts</span></p>
            <p className="mt-1 text-[11px] text-bz-text-muted">in the current view</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={cn("text-[14px] font-semibold leading-none", expiring > 0 ? "text-[#9A2E29]" : "text-bz-text", NUM)}>{expiring}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-bz-text-muted"><Clock size={10} /> expiring ≤ 7d</p>
          </div>
          <div className="text-right">
            <p className={cn("text-[14px] font-semibold leading-none text-bz-text", NUM)}>{counts["processing"] ?? 0}</p>
            <p className="mt-1 text-[10.5px] text-bz-text-muted">processing now</p>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex h-2 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
        {known.map((k) => {
          const n = counts[k] ?? 0;
          if (!n) return null;
          return <div key={k} className="h-full" style={{ width: `${(n / total) * 100}%`, background: SEG_COLOR[statusMeta(k).tone] }} />;
        })}
        {otherCount > 0 && <div className="h-full" style={{ width: `${(otherCount / total) * 100}%`, background: SEG_COLOR.neutral }} />}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {known.map((k) => {
          const m = statusMeta(k);
          return (
            <span key={k} className="inline-flex items-center gap-1.5 text-[11px] text-bz-text-muted">
              <span className="size-1.5 rounded-bz-pill" style={{ background: SEG_COLOR[m.tone] }} />
              {m.label} <span className={cn("font-semibold text-bz-text", NUM)}>{counts[k] ?? 0}</span>
            </span>
          );
        })}
        {otherCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-bz-text-muted">
            <span className="size-1.5 rounded-bz-pill" style={{ background: SEG_COLOR.neutral }} />
            Other <span className={cn("font-semibold text-bz-text", NUM)}>{otherCount}</span>
          </span>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGER
// ════════════════════════════════════════════════════════════════════════════

function Pager({
  page, pageSize, total, onPage, onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bz-line-soft px-4 py-3">
      <div className="flex items-center gap-2 text-[11.5px] text-bz-text-muted">
        <span>Rows</span>
        <SelectMenu
          label="" icon={undefined} value={String(pageSize)}
          options={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))}
          onChange={(v) => onPageSize(Number(v))}
          minWidth={84}
        />
        <span className={NUM}>{from}–{to} of {total}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 0}
          className="inline-flex h-8 items-center gap-1 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={13} className="rotate-180" /> Prev
        </button>
        <span className={cn("px-2 text-[11.5px] text-bz-text-muted", NUM)}>Page {page + 1} of {pages}</span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages - 1}
          className="inline-flex h-8 items-center gap-1 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED MODAL  one building block · two intents:
//   • mode="confirm"  → destructive gate: title + message + Cancel / Delete
//   • mode="details"  → read-only viewer: full metadata, single Close, no result
// ════════════════════════════════════════════════════════════════════════════

type ModalState =
  | { mode: "confirm"; record: ImportRecord }
  | { mode: "details"; record: ImportRecord }
  | null;

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-bz-line-soft py-2.5 last:border-0">
      <span className="text-[11.5px] font-medium uppercase tracking-[0.05em] text-bz-text-soft">{label}</span>
      <span className="text-right text-[12.5px] text-bz-text">{children}</span>
    </div>
  );
}

function RecordModal({ state, deleting, onClose, onConfirmDelete }: {
  state: ModalState;
  deleting: boolean;
  onClose: () => void;
  onConfirmDelete: (r: ImportRecord) => void;
}) {
  React.useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, onClose]);

  if (!state) return null;
  const { record } = state;
  const confirm = state.mode === "confirm";

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-bz-olive-dark/40 p-4 py-[10vh]" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: confirm ? 460 : 520 }}
        className="overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_70px_-20px_rgba(15,20,17,0.32)]"
      >
        <div className="flex items-start gap-3 border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3.5">
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md", confirm ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-deep text-bz-paper")}>
            {confirm ? <TriangleAlert size={16} /> : <Eye size={16} />}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-semibold tracking-tight text-bz-text">{confirm ? "Delete import record?" : "Import record details"}</h3>
            <p className="mt-0.5 truncate text-[11.5px] text-bz-text-muted">{confirm ? "This permanently removes the record and its file." : record.id}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"><X size={15} /></button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {confirm ? (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] leading-relaxed text-bz-text-muted">
                You're about to delete <span className="font-semibold text-bz-text">{record.fileName}</span> ({statusMeta(record.status).label} · {record.target}). This action cannot be undone.
              </p>
              <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 px-3 py-2 text-[11.5px] text-bz-text-muted">
                The collection will re-fetch after deletion so counts stay accurate.
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <DetailRow label="File name"><span className="font-medium">{record.fileName}</span></DetailRow>
              <DetailRow label="File type"><span className={NUM}>{record.fileType}{record.sizeKb != null && ` · ${record.sizeKb} KB`}</span></DetailRow>
              <DetailRow label="Target"><span>{record.target}</span></DetailRow>
              <DetailRow label="Status"><StatusBadge code={record.status} /></DetailRow>
              <DetailRow label="Action type"><ActionPill code={record.action} /></DetailRow>
              <DetailRow label="Rows"><span className={NUM}>{record.rows != null ? g(record.rows) : "—"}</span></DetailRow>
              <DetailRow label="Download count"><span className={NUM}>{record.downloads}</span></DetailRow>
              <DetailRow label="Uploaded"><span className={NUM}>{record.uploadedISO ? `${fmtDate(record.uploadedISO)} · ${fmtTime(record.uploadedISO)}` : "— not recorded"}</span></DetailRow>
              <DetailRow label="Auto-delete"><span className={NUM}>{record.autoDeleteISO ? `${fmtDate(record.autoDeleteISO)} · ${relativeDays(record.autoDeleteISO)}` : "Never"}</span></DetailRow>
              <DetailRow label="Downloadable"><span>{record.fileRef ? "Yes" : "No file reference"}</span></DetailRow>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3">
          {confirm ? (
            <>
              <button onClick={onClose} disabled={deleting} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-50">Cancel</button>
              <button
                onClick={() => onConfirmDelete(record)}
                disabled={deleting}
                className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3.5 text-[12.5px] font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete record
              </button>
            </>
          ) : (
            <button onClick={onClose} className="inline-flex h-9 items-center rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95">Close</button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST  (success / warning / info)
// ════════════════════════════════════════════════════════════════════════════

type ToastTone = "success" | "warning" | "info";
type ToastState = { tone: ToastTone; message: string; id: number } | null;

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, 3600);
    return () => window.clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const Icon = toast.tone === "success" ? Check : toast.tone === "warning" ? TriangleAlert : Info;
  const tint =
    toast.tone === "success" ? "bg-bz-fire/[0.18] text-bz-leaf-deep"
    : toast.tone === "warning" ? "bg-[#FBE5E2] text-[#C0413A]"
    : "bg-bz-paper-warm text-bz-text-muted";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.2)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", tint)}><Icon size={13} /></span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onClose} className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function DataImportHistoryDesignPage() {
  const navigate = useNavigate();

  const [dataset, setDataset] = React.useState<ImportRecord[]>(SEED);
  const [query, setQuery] = React.useState<Query>(INITIAL_QUERY);
  const [busy, setBusy] = React.useState(true); // collection is talking to the server
  const [firstLoad, setFirstLoad] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [modal, setModal] = React.useState<ModalState>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);

  const notify = (tone: ToastTone, message: string) => setToast({ tone, message, id: ++toastId.current });

  // ── server "re-query" whenever the browse snapshot changes ──
  const queryKey = `${query.search}|${query.target}|${query.status}|${query.action}|${query.sortField}|${query.sortDir}|${query.group}|${query.page}|${query.pageSize}`;
  React.useEffect(() => {
    setBusy(true);
    const t = window.setTimeout(() => { setBusy(false); setFirstLoad(false); }, firstLoad ? 600 : 420);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  // ── patch a single field of the snapshot; structural changes reset to page 0 ──
  const patch = (p: Partial<Query>, resetPage = true) =>
    setQuery((q) => ({ ...q, ...p, page: resetPage ? 0 : (p.page ?? q.page) }));

  const onSort = (field: SortField) =>
    setQuery((q) => ({
      ...q,
      sortField: field,
      sortDir: q.sortField === field ? (q.sortDir === "asc" ? "desc" : "asc") : "asc",
      page: 0,
    }));

  // ── derive filtered + sorted results from the live dataset ──
  const filtered = React.useMemo(() => {
    const s = query.search.trim().toLowerCase();
    return dataset.filter((r) => {
      if (s && !r.fileName.toLowerCase().includes(s) && !r.target.toLowerCase().includes(s) && !r.id.toLowerCase().includes(s)) return false;
      if (query.target && r.target !== query.target) return false;
      if (query.status && r.status !== query.status) return false;
      if (query.action && r.action !== query.action) return false;
      return true;
    });
  }, [dataset, query.search, query.target, query.status, query.action]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = sortValue(a, query.sortField);
      const vb = sortValue(b, query.sortField);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return query.sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, query.sortField, query.sortDir]);

  const grouped = query.group !== "none";
  const pages = Math.max(1, Math.ceil(sorted.length / query.pageSize));
  const page = Math.min(query.page, pages - 1);
  const paged = grouped ? sorted : sorted.slice(page * query.pageSize, (page + 1) * query.pageSize);

  // group blocks (over the full sorted set when grouping)
  const groups = React.useMemo(() => {
    if (!grouped) return [];
    const map = new Map<string, { key: string; label: string; items: ImportRecord[] }>();
    sorted.forEach((r) => {
      const gv = groupValue(r, query.group as Exclude<GroupField, "none">);
      if (!map.has(gv.key)) map.set(gv.key, { key: gv.key, label: gv.label, items: [] });
      map.get(gv.key)!.items.push(r);
    });
    return Array.from(map.values());
  }, [sorted, grouped, query.group]);

  const filtersActive = !!(query.search.trim() || query.target || query.status || query.action);
  const clearFilters = () => patch({ search: "", target: null, status: null, action: null });

  const toggleGroup = (k: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  // ── mutations: busy → mutate dataset → re-fetch (derived values refresh) ──
  const onDownload = (r: ImportRecord) => {
    setBusy(true);
    window.setTimeout(() => {
      setDataset((d) => d.map((x) => (x.id === r.id ? { ...x, downloads: x.downloads + 1 } : x)));
      setBusy(false);
      notify("success", `Downloaded ${r.fileName} · download count now ${r.downloads + 1}.`);
    }, 600);
  };
  const onView = (r: ImportRecord) => setModal({ mode: "details", record: r });
  const askDelete = (r: ImportRecord) => setModal({ mode: "confirm", record: r });
  const confirmDelete = (r: ImportRecord) => {
    setDeleting(true);
    setBusy(true);
    window.setTimeout(() => {
      setDataset((d) => d.filter((x) => x.id !== r.id));
      setDeleting(false);
      setBusy(false);
      setModal(null);
      notify("success", `Deleted ${r.fileName}.`);
    }, 700);
  };
  const refresh = () => {
    setBusy(true);
    window.setTimeout(() => { setBusy(false); notify("info", "Import history refreshed."); }, 500);
  };

  // option lists for filter menus
  const targetOpts = React.useMemo(() => Array.from(new Set(dataset.map((r) => r.target))).sort(), [dataset]);
  const statusOpts = React.useMemo(() => Array.from(new Set(dataset.map((r) => r.status))), [dataset]);

  const isEmpty = !firstLoad && sorted.length === 0;
  const summary = `${sorted.length} ${sorted.length === 1 ? "record" : "records"} · ${grouped ? `grouped by ${GROUP_LABELS[query.group].toLowerCase()} · ` : ""}sorted by ${SORT_LABELS[query.sortField]} (${query.sortDir === "asc" ? "asc" : "desc"})`;

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Administration</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Data Imports</span>
        </>
      }
      overlay={
        <>
          <RecordModal state={modal} deleting={deleting} onClose={() => !deleting && setModal(null)} onConfirmDelete={confirmDelete} />
          <Toast toast={toast} onClose={() => setToast(null)} />
        </>
      }
    >
      {/* 1 · HEADER */}
      <header className="px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Data Imports</h1>
              <span className={cn("inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold text-bz-text-muted", NUM)}>{dataset.length}</span>
            </div>
            <p className="mt-1 text-[12.5px] text-bz-text-muted">Every bulk-import file you've generated or uploaded — download, inspect, or purge each artifact.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} disabled={busy} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-60">
              <RotateCw size={14} className={cn(busy && "animate-spin")} /> <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={() => navigate("/design/data-imports/new")} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95">
              <Plus size={14} /> New Import
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-10 md:px-8">
        {/* 2 · LIFECYCLE RAIL */}
        <LifecycleRail records={sorted} />

        {/* 3 · COLLECTION */}
        <section className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          {/* toolbar */}
          <div className="flex flex-col gap-2.5 border-b border-bz-line-soft p-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-0 flex-1" style={{ maxWidth: 360 }}>
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-muted" />
                <input
                  value={query.search}
                  onChange={(e) => patch({ search: e.target.value })}
                  placeholder="Search by file, target or ID…"
                  className="h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper py-2 pl-9 pr-8 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
                />
                {query.search && (
                  <button onClick={() => patch({ search: "" })} aria-label="Clear search" className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={12} /></button>
                )}
              </div>

              <SelectMenu
                label="Target" value={query.target}
                options={[{ value: null, label: "All targets" }, ...targetOpts.map((t) => ({ value: t, label: t }))]}
                onChange={(v) => patch({ target: v })}
              />
              <SelectMenu
                label="Status" value={query.status}
                options={[{ value: null, label: "All statuses" }, ...statusOpts.map((s) => ({ value: s, label: statusMeta(s).label }))]}
                onChange={(v) => patch({ status: v })}
              />
              <SelectMenu
                label="Action" value={query.action}
                options={[{ value: null, label: "All actions" }, { value: "insert", label: "Insert" }, { value: "update", label: "Update" }]}
                onChange={(v) => patch({ action: v })}
              />
              <div className="ml-auto flex items-center gap-2.5">
                <SelectMenu
                  label="Group" icon={Layers} value={query.group === "none" ? null : query.group}
                  options={(["none", "target", "status", "action"] as GroupField[]).map((gf) => ({ value: gf === "none" ? null : gf, label: GROUP_LABELS[gf] }))}
                  onChange={(v) => { patch({ group: (v as GroupField) ?? "none" }); setCollapsed(new Set()); }}
                  align="right"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
              <p className={cn("flex items-center gap-1.5 text-[11.5px] text-bz-text-muted", NUM)}>
                <ArrowDownUp size={11} className="text-bz-text-soft" /> {summary}
              </p>
              {filtersActive && (
                <button onClick={clearFilters} className="inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">
                  <X size={11} /> Clear filters
                </button>
              )}
            </div>
          </div>

          {/* busy bar — the server round-trip made visible */}
          <div className="h-0.5 w-full overflow-hidden">
            {busy && <div className="h-full w-full animate-pulse bg-bz-fire" />}
          </div>

          {/* body */}
          {firstLoad ? (
            <Skeleton />
          ) : isEmpty ? (
            <EmptyState filtered={filtersActive} onClear={clearFilters} />
          ) : (
            <div className={cn("transition-opacity", busy && "pointer-events-none opacity-60")}>
              <CollectionTable
                rows={paged} query={query} onSort={onSort}
                group={query.group} collapsed={collapsed} onToggleGroup={toggleGroup} groups={groups}
                onDownload={onDownload} onView={onView} onDelete={askDelete}
              />
              <MobileCards rows={paged} onDownload={onDownload} onView={onView} onDelete={askDelete} />
              {grouped ? (
                <div className={cn("flex items-center justify-center gap-1.5 border-t border-bz-line-soft px-4 py-3 text-[11.5px] text-bz-text-muted", NUM)}>
                  <Layers size={12} className="text-bz-text-soft" /> {sorted.length} records in {groups.length} {groups.length === 1 ? "group" : "groups"}
                </div>
              ) : (
                <Pager page={page} pageSize={query.pageSize} total={sorted.length} onPage={(p) => patch({ page: p }, false)} onPageSize={(n) => patch({ pageSize: n })} />
              )}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
