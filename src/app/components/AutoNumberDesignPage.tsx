import * as React from "react";
import { createPortal } from "react-dom";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Search,
  X,
  Check,
  Loader2,
  Hash,
  RotateCw,
  Building2,
  CalendarRange,
  Calendar,
  Info,
  Settings2,
  AlertTriangle,
  PackageOpen,
  CircleSlash,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// AUTO NUMBER  (configure document-numbering schemes for a scope)
//
// Primary action = persist every edited scheme in ONE commit. So the centre of
// gravity is the bulk inline editor (one wide row per document type) plus an
// always-visible docked commit bar that carries the Save. Two scope selectors
// up top gate what's loaded:
//   • Subsidiary — RELOADS the whole record set on change (discards edits).
//                  Conditional: present only when the tenant allows multiple orgs.
//   • Posting period — only RECORDS the choice; it's DEFERRED until the next
//                  reload (a known asymmetry, surfaced as a "reload to apply" hint).
//
// The signature element is a live "Next number" preview column derived from each
// row's affixes + counter + composition toggles — it reconciles with every field
// as you type, making the abstract numbering rule concrete.
//
// Built in the app design language (AppShell + bz-* tokens). Reachable states:
// save disabled (invalid scope / empty scope), enabled, busy; scope select
// placeholder / filtering / loading-more / empty / disabled; editor populated /
// empty / reloading; per-record date popup calendar; success toast (silent fail).
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// FORMAT + DATE TRANSFORMS  (backend string ⇄ real ISO date value)
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const TODAY_ISO = "2026-06-09";
const pad2 = (n: number) => String(n).padStart(2, "0");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const clampInt = (raw: string, lo: number, hi: number) => {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
};

// Backend keeps dates as "YYYY/MM/DD"; the controls work in ISO "YYYY-MM-DD".
const fromBackend = (s: string) => (s ? s.replace(/\//g, "-") : "");
const toBackend = (iso: string) => (iso ? iso.replace(/-/g, "/") : "");

const isISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
function fmtFriendly(iso: string) {
  if (!isISO(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  if (m < 1 || m > 12) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
// Lenient typed-date parse → ISO (accepts 2026-05-20, 2026/5/20, May 20 2026).
function parseTyped(text: string): string | null {
  const t = text.trim();
  if (!t) return "";
  const iso = t.replace(/\//g, "-");
  const m1 = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m1) {
    const y = +m1[1], mo = +m1[2], d = +m1[3];
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${y}-${pad2(mo)}-${pad2(d)}`;
  }
  const m2 = t.match(/^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m2) {
    const mo = MONTHS.findIndex((x) => x.toLowerCase() === m2[1].slice(0, 3).toLowerCase());
    const d = +m2[2], y = +m2[3];
    if (mo >= 0 && d >= 1 && d <= 31) return `${y}-${pad2(mo + 1)}-${pad2(d)}`;
  }
  return null;
}
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay();

// ════════════════════════════════════════════════════════════════════════════
// SCOPE OPTIONS  (subsidiaries + posting periods — long lists exercise lazy load)
// ════════════════════════════════════════════════════════════════════════════

type Subsidiary = { value: string; label: string; meta: string; code: string; loc: string };

const SUBSIDIARIES: Subsidiary[] = [
  { value: "NP-01", label: "NP-01 · Bizak Nepal",          meta: "Kathmandu HQ",        code: "NP01", loc: "KTM" },
  { value: "NP-02", label: "NP-02 · Bizak Nepal Pokhara",  meta: "Pokhara branch",      code: "NP02", loc: "PKR" },
  { value: "NP-03", label: "NP-03 · Bizak Nepal Terai",    meta: "Bharatpur branch",    code: "NP03", loc: "BRT" },
  { value: "NP-04", label: "NP-04 · Bizak Nepal Butwal",   meta: "Butwal branch",       code: "NP04", loc: "BTL" },
  { value: "NP-05", label: "NP-05 · Bizak Nepal Biratnagar", meta: "Biratnagar depot",  code: "NP05", loc: "BIR" },
  { value: "IN-01", label: "IN-01 · Bizak India",          meta: "Patna regional",      code: "IN01", loc: "PAT" },
  { value: "IN-02", label: "IN-02 · Bizak India Delhi",    meta: "Delhi office",        code: "IN02", loc: "DEL" },
  { value: "IN-03", label: "IN-03 · Bizak India Kolkata",  meta: "Kolkata office",      code: "IN03", loc: "KOL" },
  { value: "BD-01", label: "BD-01 · Bizak Bangladesh",     meta: "Dhaka office",        code: "BD01", loc: "DHK" },
  { value: "LK-01", label: "LK-01 · Bizak Sri Lanka",      meta: "Colombo office",      code: "LK01", loc: "CMB" },
  { value: "AE-01", label: "AE-01 · Bizak Middle East",    meta: "Dubai office",        code: "AE01", loc: "DXB" },
  { value: "SG-01", label: "SG-01 · Bizak APAC",           meta: "Singapore office",    code: "SG01", loc: "SIN" },
  { value: "GB-01", label: "GB-01 · Bizak UK",             meta: "London office",       code: "GB01", loc: "LON" },
  { value: "US-01", label: "US-01 · Bizak Americas",       meta: "New York office",     code: "US01", loc: "NYC" },
];

type Period = { value: string; label: string; meta: string };

const PERIODS: Period[] = [
  { value: "FY83",     label: "FY 2082/83 · full year", meta: "Shrawan – Ashar" },
  { value: "83-04",    label: "Shrawan 2082",  meta: "Period 01 · Jul–Aug 2025" },
  { value: "83-05",    label: "Bhadra 2082",   meta: "Period 02 · Aug–Sep 2025" },
  { value: "83-06",    label: "Ashoj 2082",    meta: "Period 03 · Sep–Oct 2025" },
  { value: "83-07",    label: "Kartik 2082",   meta: "Period 04 · Oct–Nov 2025" },
  { value: "83-08",    label: "Mangsir 2082",  meta: "Period 05 · Nov–Dec 2025" },
  { value: "83-09",    label: "Poush 2082",    meta: "Period 06 · Dec–Jan 2026" },
  { value: "83-10",    label: "Magh 2082",     meta: "Period 07 · Jan–Feb 2026" },
  { value: "83-11",    label: "Falgun 2082",   meta: "Period 08 · Feb–Mar 2026" },
  { value: "83-12",    label: "Chaitra 2082",  meta: "Period 09 · Mar–Apr 2026" },
  { value: "83-01",    label: "Baisakh 2083",  meta: "Period 10 · Apr–May 2026" },
  { value: "83-02",    label: "Jestha 2083",   meta: "Period 11 · May–Jun 2026" },
  { value: "83-03",    label: "Ashar 2083",    meta: "Period 12 · Jun–Jul 2026" },
  { value: "FY82",     label: "FY 2081/82 · full year", meta: "Closed" },
  { value: "82-12",    label: "Chaitra 2081",  meta: "Closed · Mar–Apr 2025" },
  { value: "82-11",    label: "Falgun 2081",   meta: "Closed · Feb–Mar 2025" },
];

// ════════════════════════════════════════════════════════════════════════════
// RECORD MODEL + DATA-SEEDED FETCH  (records come from the backend per scope)
// ════════════════════════════════════════════════════════════════════════════

type DocRecord = {
  id: string;
  docType: string;      // read-only identity — REQUIRED (an empty value is invalid)
  code: string;
  enabled: boolean;
  prefix: string;
  suffix: string;
  digits: string;
  startNo: string;
  currentNo: string;
  maxIncrease: string;
  allowEditInitial: boolean;
  includeSub: boolean;
  includeLoc: boolean;
  validFrom: string;    // ISO
  validTo: string;      // ISO ("" = open-ended)
};

type RawDoc = {
  docType: string;
  code: string;
  enabled: boolean;
  prefix: string;
  suffix: string;
  digits: number;
  startNo: number;
  currentNo: number;
  maxIncrease: number;
  allowEditInitial: boolean;
  includeLoc: boolean;
  bValidFrom: string;   // backend "YYYY/MM/DD"
  bValidTo: string;
};

const BASE_DOCS: RawDoc[] = [
  { docType: "Sales Order",       code: "SO",  enabled: true,  prefix: "SO",  suffix: "",       digits: 7, startNo: 1,    currentNo: 1052, maxIncrease: 1, allowEditInitial: false, includeLoc: false, bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Sales Invoice",     code: "INV", enabled: true,  prefix: "INV", suffix: "/82-83", digits: 6, startNo: 1,    currentNo: 880,  maxIncrease: 1, allowEditInitial: false, includeLoc: true,  bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Sales Quotation",   code: "QT",  enabled: true,  prefix: "QT",  suffix: "",       digits: 6, startNo: 1,    currentNo: 410,  maxIncrease: 1, allowEditInitial: true,  includeLoc: false, bValidFrom: "2025/07/16", bValidTo: "" },
  { docType: "Purchase Order",    code: "PO",  enabled: true,  prefix: "PO",  suffix: "",       digits: 6, startNo: 1,    currentNo: 642,  maxIncrease: 1, allowEditInitial: false, includeLoc: false, bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Purchase Bill",     code: "PB",  enabled: true,  prefix: "PB",  suffix: "",       digits: 6, startNo: 1,    currentNo: 515,  maxIncrease: 1, allowEditInitial: false, includeLoc: true,  bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Goods Receipt",     code: "GRN", enabled: true,  prefix: "GRN", suffix: "",       digits: 5, startNo: 1,    currentNo: 388,  maxIncrease: 1, allowEditInitial: false, includeLoc: true,  bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Delivery Note",     code: "DN",  enabled: true,  prefix: "DN",  suffix: "",       digits: 6, startNo: 1,    currentNo: 274,  maxIncrease: 1, allowEditInitial: false, includeLoc: true,  bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Payment Voucher",   code: "PV",  enabled: true,  prefix: "PV",  suffix: "",       digits: 6, startNo: 1,    currentNo: 1290, maxIncrease: 1, allowEditInitial: false, includeLoc: false, bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Receipt Voucher",   code: "RV",  enabled: true,  prefix: "RV",  suffix: "",       digits: 6, startNo: 1,    currentNo: 1455, maxIncrease: 1, allowEditInitial: false, includeLoc: false, bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Journal Entry",     code: "JV",  enabled: true,  prefix: "JV",  suffix: "",       digits: 6, startNo: 1,    currentNo: 970,  maxIncrease: 1, allowEditInitial: true,  includeLoc: false, bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Credit Note",       code: "CN",  enabled: false, prefix: "CN",  suffix: "",       digits: 5, startNo: 1,    currentNo: 132,  maxIncrease: 1, allowEditInitial: false, includeLoc: false, bValidFrom: "2025/07/16", bValidTo: "2026/07/15" },
  { docType: "Stock Transfer",    code: "TRF", enabled: true,  prefix: "TRF", suffix: "",       digits: 5, startNo: 1,    currentNo: 219,  maxIncrease: 1, allowEditInitial: false, includeLoc: true,  bValidFrom: "2025/07/16", bValidTo: "" },
];

const SUB_OFFSET: Record<string, number> = {
  "NP-01": 0, "NP-02": 73, "NP-03": 41, "NP-04": 12, "NP-05": 26,
  "IN-02": 58, "IN-03": 19, "BD-01": 7, "LK-01": 3,
};

// Build the record set for a scope — the data-seeding/transform step. Branches
// embed their subsidiary code by default; one branch returns an unresolved
// identity (gates Save); one returns nothing (empty scope).
function seedFor(subValue: string): DocRecord[] {
  if (subValue === "IN-01") return []; // backend returns no schemes for this scope
  const isHQ = subValue === "NP-01";
  const offset = SUB_OFFSET[subValue] ?? 33;
  let recs: DocRecord[] = BASE_DOCS.map((d) => ({
    id: `${subValue}-${d.code}`,
    docType: d.docType,
    code: d.code,
    enabled: d.enabled,
    prefix: d.prefix,
    suffix: d.suffix,
    digits: String(d.digits),
    startNo: String(d.startNo),
    currentNo: String(d.currentNo + offset),
    maxIncrease: String(d.maxIncrease),
    allowEditInitial: d.allowEditInitial,
    includeSub: !isHQ,
    includeLoc: d.includeLoc,
    validFrom: fromBackend(d.bValidFrom),
    validTo: fromBackend(d.bValidTo),
  }));
  // Pokhara: one scheme came back without a resolved document type.
  if (subValue === "NP-02") {
    recs = recs.map((r, i) => (i === 5 ? { ...r, docType: "", enabled: true } : r));
  }
  return recs;
}

// Live preview of the next identifier this scheme will mint.
function nextNumber(r: DocRecord, sub: Subsidiary): string {
  const width = clampInt(r.digits || "0", 0, 12);
  const n = (parseInt(r.currentNo, 10) || 0) + 1;
  const core = String(n).padStart(width, "0");
  const segs: string[] = [];
  if (r.prefix) segs.push(r.prefix);
  if (r.includeSub) segs.push(sub.code);
  if (r.includeLoc) segs.push(sub.loc);
  segs.push(core);
  return segs.join("-") + (r.suffix || "");
}

const recordsEqual = (a: DocRecord[], b: DocRecord[]) => JSON.stringify(a) === JSON.stringify(b);

// ════════════════════════════════════════════════════════════════════════════
// SHARED HOOKS
// ════════════════════════════════════════════════════════════════════════════

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  return ref;
}

// Position a portal panel under an anchor; close on outside-click / Esc / scroll.
function useAnchoredPanel(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, anchorRef]);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, anchorRef, panelRef]);
  return pos;
}

// ════════════════════════════════════════════════════════════════════════════
// ATOMS  switch · cell inputs
// ════════════════════════════════════════════════════════════════════════════

function Switch({
  value, onChange, disabled, ariaLabel,
}: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors disabled:opacity-40",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          value ? "translate-x-[14px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

function GridText({
  value, onChange, placeholder, disabled, mono, align,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  disabled?: boolean; mono?: boolean; align?: "right";
}) {
  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "block w-full rounded-bz-sm bg-transparent px-1.5 py-1 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft",
        "hover:bg-bz-paper-warm/60 focus:bg-bz-paper-warm focus:outline focus:outline-1 focus:outline-bz-text",
        "disabled:cursor-not-allowed disabled:text-bz-text-soft disabled:hover:bg-transparent",
        align === "right" && "text-right",
        mono && `${NUM} tracking-[0.01em]`,
      )}
    />
  );
}

function GridNum({
  value, onChange, placeholder, disabled, max = 9,
}: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; max?: number }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, max))}
      placeholder={placeholder}
      className={cn(
        "block w-full rounded-bz-sm bg-transparent px-1.5 py-1 text-right text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft",
        `${NUM}`,
        "hover:bg-bz-paper-warm/60 focus:bg-bz-paper-warm focus:outline focus:outline-1 focus:outline-bz-text",
        "disabled:cursor-not-allowed disabled:text-bz-text-soft disabled:hover:bg-transparent",
      )}
    />
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DATE FIELD  text input (typed) + popup calendar
// ════════════════════════════════════════════════════════════════════════════

function CalendarPopover({
  anchorRef, open, onClose, value, onPick,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  value: string;
  onPick: (iso: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const pos = useAnchoredPanel(open, anchorRef, ref, onClose);
  const seed = isISO(value) ? value : TODAY_ISO;
  const [view, setView] = React.useState(() => {
    const [y, m] = seed.split("-").map(Number);
    return { y, m: m - 1 };
  });
  React.useEffect(() => {
    if (!open) return;
    const [y, m] = seed.split("-").map(Number);
    setView({ y, m: m - 1 });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open || !pos) return null;
  const { y, m } = view;
  const lead = firstWeekday(y, m);
  const total = daysInMonth(y, m);
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const prev = () => setView(m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
  const next = () => setView(m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 });

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: 244 }}
      className="z-[70] rounded-bz-md border border-bz-line bg-bz-surface p-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.24)]"
    >
      <div className="mb-2 flex items-center justify-between">
        <button onClick={prev} aria-label="Previous month" className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[12px] font-semibold text-bz-text">{MONTHS_LONG[m]} {y}</span>
        <button onClick={next} aria-label="Next month" className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="flex h-6 items-center justify-center text-[9.5px] font-semibold uppercase text-bz-text-soft">{d}</span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const iso = `${y}-${pad2(m + 1)}-${pad2(d)}`;
          const selected = iso === value;
          const today = iso === TODAY_ISO;
          return (
            <button
              key={i}
              onClick={() => { onPick(iso); onClose(); }}
              className={cn(
                "flex h-7 items-center justify-center rounded-bz-sm text-[11.5px] tabular-nums transition-colors",
                selected ? "bg-bz-fire font-semibold text-bz-olive"
                  : today ? "font-semibold text-bz-text ring-1 ring-inset ring-bz-line hover:bg-bz-paper-warm"
                  : "text-bz-text hover:bg-bz-paper-warm",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-bz-line-soft pt-2">
        <button onClick={() => { onPick(""); onClose(); }} className="text-[11px] font-medium text-bz-text-muted hover:text-bz-text">Clear</button>
        <button onClick={() => { onPick(TODAY_ISO); onClose(); }} className="text-[11px] font-medium text-bz-text-muted hover:text-bz-text">Today</button>
      </div>
    </div>,
    document.body,
  );
}

function DateField({
  value, onChange, disabled, compact,
}: { value: string; onChange: (iso: string) => void; disabled?: boolean; compact?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(value);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { setText(value); }, [value]);

  const commit = () => {
    const parsed = parseTyped(text);
    if (parsed === null) setText(value); // unparseable → revert
    else onChange(parsed);
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") { commit(); (e.target as HTMLInputElement).blur(); } }}
        placeholder="YYYY-MM-DD"
        title={value ? fmtFriendly(value) : undefined}
        className={cn(
          "w-full rounded-bz-sm border bg-transparent py-1 pl-1.5 pr-6 text-[11.5px] tabular-nums tracking-[0.01em] text-bz-text outline-none placeholder:text-bz-text-soft",
          "focus:bg-bz-paper-warm focus:outline-none disabled:cursor-not-allowed disabled:text-bz-text-soft",
          compact ? "border-transparent hover:bg-bz-paper-warm/60 focus:border-bz-text" : "h-9 border-bz-line-soft bg-bz-surface px-3 pr-8 text-[13px] hover:border-bz-line focus:border-bz-text",
        )}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open calendar"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-bz-sm text-bz-text-muted hover:text-bz-text disabled:opacity-40",
          compact ? "right-0.5 size-5" : "right-2 size-6",
        )}
      >
        <Calendar size={compact ? 12 : 13} />
      </button>
      <CalendarPopover anchorRef={wrapRef} open={open} onClose={() => setOpen(false)} value={value} onPick={onChange} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCOPE SELECT  searchable · keyboard-navigable · lazy load-more · clearable
// ════════════════════════════════════════════════════════════════════════════

type ScopeOption = { value: string; label: string; meta?: string };
const PAGE_SIZE = 7;

function ScopeDropdown({
  anchorRef, open, onClose, options, value, onSelect,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  options: ScopeOption[];
  value: string | null;
  onSelect: (v: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pos = useAnchoredPanel(open, anchorRef, ref, onClose);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [hi, setHi] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    setRaw(""); setQuery(""); setPages(1); setHi(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, [open]);

  // debounced type-to-filter
  React.useEffect(() => {
    const t = window.setTimeout(() => { setQuery(raw.trim().toLowerCase()); setPages(1); setHi(0); }, 200);
    return () => window.clearTimeout(t);
  }, [raw]);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query) || (o.meta?.toLowerCase().includes(query) ?? false))
    : options;
  const visible = filtered.slice(0, pages * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  // keep the keyboard-highlighted row in view
  React.useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('[data-hi="true"]')?.scrollIntoView({ block: "nearest" });
  }, [hi, open]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setLoading(true);
      window.setTimeout(() => { setPages((p) => p + 1); setLoading(false); }, 420);
    }
  };

  const choose = (v: string) => { onSelect(v); onClose(); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => Math.min(visible.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (visible[hi]) choose(visible[hi].value); }
  };

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 280) }}
      className="z-[60] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
    >
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input
            ref={inputRef}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type to filter…"
            className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {raw && (
            <button onClick={() => setRaw("")} aria-label="Clear" className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface">
              <X size={10} />
            </button>
          )}
        </div>
      </div>
      <div ref={listRef} onScroll={onScroll} className="max-h-[264px] overflow-y-auto py-1">
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-[11.5px] text-bz-text-muted">
            {query ? `No matches for “${raw}”.` : "No options available."}
          </p>
        ) : (
          visible.map((o, i) => {
            const selected = o.value === value;
            const active = i === hi;
            return (
              <button
                key={o.value}
                data-hi={active || undefined}
                onMouseEnter={() => setHi(i)}
                onClick={() => choose(o.value)}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left",
                  active ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm/60",
                  selected && !active && "bg-bz-fire/[0.06]",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] text-bz-text">{o.label}</p>
                  {o.meta && <p className="mt-0.5 truncate text-[10.5px] text-bz-text-muted">{o.meta}</p>}
                </div>
                {selected && <Check size={12} className="mt-0.5 shrink-0 text-bz-text" />}
              </button>
            );
          })
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-3 text-bz-text-muted">
            <Loader2 size={12} className="animate-spin text-bz-fire" />
            <span className="text-[11px]">Loading more…</span>
          </div>
        )}
        {!loading && !hasMore && visible.length > 0 && (
          <p className="px-3 py-2 text-center text-[10.5px] text-bz-text-soft">
            {filtered.length} option{filtered.length === 1 ? "" : "s"} · end of list
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}

function ScopeSelect({
  icon: Icon, label, value, options, placeholder, clearable, disabled, onChange, ariaLabel,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | null;
  options: ScopeOption[];
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  onChange: (v: string | null) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const selected = value ? options.find((o) => o.value === value) : null;
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
        <Icon size={11} className="text-bz-text-muted" /> {label}
      </p>
      <div className="relative">
        <button
          ref={btnRef}
          disabled={disabled}
          aria-label={ariaLabel ?? label}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-bz-md border px-3 text-left text-[13px] transition-colors",
            disabled
              ? "cursor-not-allowed border-bz-line-soft bg-bz-paper-warm text-bz-text-soft"
              : open
              ? "border-bz-text bg-bz-surface text-bz-text"
              : "border-bz-line-soft bg-bz-surface text-bz-text hover:border-bz-line",
          )}
        >
          <span className={cn("min-w-0 flex-1 truncate", !selected && "text-bz-text-muted")}>
            {selected ? selected.label : (placeholder ?? "Select…")}
          </span>
          {clearable && selected && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={12} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
        </button>
        <ScopeDropdown
          anchorRef={btnRef}
          open={open}
          onClose={() => setOpen(false)}
          options={options}
          value={value}
          onSelect={(v) => onChange(v)}
        />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER  identity + live count + tenant-capability menu
// ════════════════════════════════════════════════════════════════════════════

function PageHeader({
  count, scopeLabel, multiOrg, onToggleMultiOrg,
}: { count: number; scopeLabel: string; multiOrg: boolean; onToggleMultiOrg: (v: boolean) => void }) {
  return (
    <header className="border-b border-bz-line bg-bz-paper px-4 pb-5 pt-5 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-bz-sm bg-bz-deep text-bz-paper">
              <Hash size={11} strokeWidth={2.2} />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">Setup · Document numbering</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Auto Number</h1>
            <span className={cn("inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold text-bz-text-muted", NUM)}>
              {count} {count === 1 ? "scheme" : "schemes"}
            </span>
          </div>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-bz-text-muted">
            Define how identifiers are generated for each document type in the active scope — affixes, digit padding,
            counters and validity. Edit every scheme inline, then commit them all in one save.
          </p>
        </div>
        <TenantMenu multiOrg={multiOrg} onToggleMultiOrg={onToggleMultiOrg} />
      </div>
    </header>
  );
}

function TenantMenu({ multiOrg, onToggleMultiOrg }: { multiOrg: boolean; onToggleMultiOrg: (v: boolean) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-bz-md border px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm",
          open ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface",
        )}
      >
        <Settings2 size={14} /> Tenant
        <ChevronDown size={11} className="text-bz-text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-[44px] z-30 w-72 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface p-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <div className="flex items-start gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-bz-text">Multiple organisations</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-bz-text-muted">
                When off, the subsidiary scope is hidden and numbering defaults to the primary organisation.
              </p>
            </div>
            <Switch value={multiOrg} onChange={onToggleMultiOrg} ariaLabel="Multiple organisations" />
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCOPE BAR  subsidiary (reloads) + period (deferred) + reload
// ════════════════════════════════════════════════════════════════════════════

function ScopeBar({
  multiOrg, subsidiary, onSubsidiary, period, onPeriod, pendingPeriod, reloading, onReload,
}: {
  multiOrg: boolean;
  subsidiary: string;
  onSubsidiary: (v: string) => void;
  period: string | null;
  onPeriod: (v: string | null) => void;
  pendingPeriod: boolean;
  reloading: boolean;
  onReload: () => void;
}) {
  const subOptions: ScopeOption[] = SUBSIDIARIES.map((s) => ({ value: s.value, label: s.label, meta: s.meta }));
  return (
    <div className="border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3.5 md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          {multiOrg && (
            <ScopeSelect
              icon={Building2}
              label="Subsidiary"
              value={subsidiary}
              options={subOptions}
              onChange={(v) => v && onSubsidiary(v)}
              disabled={reloading}
              ariaLabel="Subsidiary scope"
            />
          )}
          <ScopeSelect
            icon={CalendarRange}
            label="Posting period"
            value={period}
            options={PERIODS}
            placeholder="Select posting period…"
            clearable
            disabled={reloading}
            onChange={onPeriod}
            ariaLabel="Posting period scope"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {pendingPeriod && (
            <span className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-fire/[0.16] px-2.5 py-1 text-[11px] font-medium text-bz-text">
              <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
              Period changed — reload to apply
            </span>
          )}
          <button
            onClick={onReload}
            disabled={reloading}
            title="Re-fetch this scope's numbering rules from the server. Discards any unsaved edits."
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-bz-md border px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-50",
              pendingPeriod ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface",
            )}
          >
            <RotateCw size={13} className={cn(reloading && "animate-spin")} />
            <span className="hidden sm:inline">Reload</span>
          </button>
        </div>
      </div>
      {multiOrg ? (
        <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-bz-text-soft">
          <Info size={11} /> Changing the subsidiary reloads every scheme. The period is recorded and applied on the next reload.
        </p>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-bz-text-soft">
          <Info size={11} /> Single-organisation tenant — numbering applies to the primary organisation. The period is applied on the next reload.
        </p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EDITOR  the wide grid (desktop) + record cards (mobile)
// ════════════════════════════════════════════════════════════════════════════

const GROUPS: { label: string; span: number; sticky?: boolean }[] = [
  { label: "Identity", span: 1, sticky: true },
  { label: "On", span: 1 },
  { label: "Format", span: 3 },
  { label: "Counters", span: 3 },
  { label: "Preview", span: 1 },
  { label: "Number composition", span: 3 },
  { label: "Validity", span: 2 },
];

const COLS: { label: string; w: number; align?: "right" | "center"; req?: boolean }[] = [
  { label: "Document type", w: 196, req: true },
  { label: "Enabled", w: 72, align: "center" },
  { label: "Prefix", w: 92 },
  { label: "Suffix", w: 96 },
  { label: "Digits", w: 64, align: "right" },
  { label: "Start #", w: 88, align: "right" },
  { label: "Current #", w: 96, align: "right" },
  { label: "Max ↑", w: 74, align: "right" },
  { label: "Next number", w: 196 },
  { label: "Edit init.", w: 70, align: "center" },
  { label: "Incl. sub", w: 70, align: "center" },
  { label: "Incl. loc", w: 70, align: "center" },
  { label: "Valid from", w: 132 },
  { label: "Valid to", w: 132 },
];

const STICKY = "sticky left-0 z-20 shadow-[2px_0_4px_-2px_rgba(15,20,17,0.10)]";

function GridRow({
  r, sub, onPatch,
}: { r: DocRecord; sub: Subsidiary; onPatch: (id: string, patch: Partial<DocRecord>) => void }) {
  const off = !r.enabled;
  const invalid = !r.docType.trim();
  const set = (patch: Partial<DocRecord>) => onPatch(r.id, patch);
  const rowBg = invalid ? "bg-[#FBE7E5]/50" : off ? "bg-bz-paper-warm/30" : "bg-bz-surface";
  // sticky column needs an opaque fill so scrolled cells don't bleed through
  const stickyBg = invalid ? "bg-[#FBE7E5]" : off ? "bg-bz-paper-warm" : "bg-bz-surface";
  const cellNum = "px-1.5 py-1.5";

  return (
    <tr className={cn("border-b border-bz-line-soft", rowBg)}>
      {/* identity (sticky) */}
      <td className={cn(STICKY, "px-3 py-2", stickyBg)} style={{ width: COLS[0].w }}>
        {invalid ? (
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={13} className="shrink-0 text-[#C0413A]" />
            <span className="text-[11.5px] font-medium text-[#9A2E29]">Unresolved type</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={cn("flex h-5 min-w-[34px] items-center justify-center rounded-bz-sm px-1 text-[10px] font-bold tracking-wide", off ? "bg-bz-paper-warm text-bz-text-soft" : "bg-bz-deep text-bz-paper")}>
              {r.code}
            </span>
            <span className={cn("truncate text-[12.5px] font-medium", off ? "text-bz-text-muted" : "text-bz-text")}>{r.docType}</span>
          </div>
        )}
      </td>
      {/* enabled */}
      <td className={cn(cellNum, "text-center")}>
        <Switch value={r.enabled} onChange={(v) => set({ enabled: v })} ariaLabel={`Enable ${r.docType || "scheme"}`} />
      </td>
      {/* format */}
      <td className={cellNum}><GridText value={r.prefix} onChange={(v) => set({ prefix: v })} placeholder="—" disabled={off} mono /></td>
      <td className={cellNum}><GridText value={r.suffix} onChange={(v) => set({ suffix: v })} placeholder="—" disabled={off} mono /></td>
      <td className={cellNum}><GridNum value={r.digits} onChange={(v) => set({ digits: v })} placeholder="0" disabled={off} max={2} /></td>
      {/* counters */}
      <td className={cellNum}><GridNum value={r.startNo} onChange={(v) => set({ startNo: v })} placeholder="0" disabled={off || !r.allowEditInitial} /></td>
      <td className={cellNum}><GridNum value={r.currentNo} onChange={(v) => set({ currentNo: v })} placeholder="0" disabled={off} /></td>
      <td className={cellNum}><GridNum value={r.maxIncrease} onChange={(v) => set({ maxIncrease: v })} placeholder="1" disabled={off} max={4} /></td>
      {/* preview */}
      <td className={cn("px-2 py-1.5", off ? "bg-bz-paper-warm/20" : "bg-bz-fire/[0.05]")} style={{ width: COLS[8].w }}>
        {off ? (
          <span className="text-[11.5px] text-bz-text-soft">disabled</span>
        ) : (
          <span className={cn("truncate text-[12px] font-semibold tracking-[0.01em] text-bz-text", NUM)} title={nextNumber(r, sub)}>
            {nextNumber(r, sub)}
          </span>
        )}
      </td>
      {/* composition */}
      <td className={cn(cellNum, "text-center")}><Switch value={r.allowEditInitial} onChange={(v) => set({ allowEditInitial: v })} disabled={off} ariaLabel="Allow editing the initial number" /></td>
      <td className={cn(cellNum, "text-center")}><Switch value={r.includeSub} onChange={(v) => set({ includeSub: v })} disabled={off} ariaLabel="Include subsidiary" /></td>
      <td className={cn(cellNum, "text-center")}><Switch value={r.includeLoc} onChange={(v) => set({ includeLoc: v })} disabled={off} ariaLabel="Include location" /></td>
      {/* validity */}
      <td className={cellNum}><DateField value={r.validFrom} onChange={(v) => set({ validFrom: v })} disabled={off} compact /></td>
      <td className={cellNum}><DateField value={r.validTo} onChange={(v) => set({ validTo: v })} disabled={off} compact /></td>
    </tr>
  );
}

function EditorGrid({
  records, sub, onPatch,
}: { records: DocRecord[]; sub: Subsidiary; onPatch: (id: string, patch: Partial<DocRecord>) => void }) {
  const headBg = "bg-bz-paper-warm";
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="border-collapse text-left" style={{ minWidth: COLS.reduce((s, c) => s + c.w, 0) }}>
        <colgroup>{COLS.map((c, i) => <col key={i} style={{ width: c.w }} />)}</colgroup>
        <thead>
          {/* group row */}
          <tr className={cn("border-b border-bz-line", headBg)}>
            {GROUPS.map((g, i) => (
              <th
                key={i}
                colSpan={g.span}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-bz-text-soft",
                  i > 0 && "border-l border-bz-line-soft",
                  g.sticky && cn(STICKY, headBg),
                )}
              >
                {g.label}
              </th>
            ))}
          </tr>
          {/* column row */}
          <tr className={cn("border-b border-bz-line", headBg)}>
            {COLS.map((c, i) => (
              <th
                key={i}
                className={cn(
                  "px-3 py-2 text-[10px] font-medium uppercase tracking-[0.05em] text-bz-text-muted",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                  i === 0 && cn(STICKY, headBg),
                )}
              >
                {c.label}{c.req && <span className="ml-0.5 text-bz-text">*</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => <GridRow key={r.id} r={r} sub={sub} onPatch={onPatch} />)}
        </tbody>
      </table>
    </div>
  );
}

// ── mobile record cards ───────────────────────────────────────────────────────

function MobileField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">{label}</p>
      {children}
    </div>
  );
}

function MobileToggle({ label, value, onChange, disabled }: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2">
      <span className={cn("text-[12px]", disabled ? "text-bz-text-soft" : "text-bz-text")}>{label}</span>
      <Switch value={value} onChange={onChange} disabled={disabled} ariaLabel={label} />
    </div>
  );
}

function RecordCard({
  r, sub, onPatch,
}: { r: DocRecord; sub: Subsidiary; onPatch: (id: string, patch: Partial<DocRecord>) => void }) {
  const off = !r.enabled;
  const invalid = !r.docType.trim();
  const set = (patch: Partial<DocRecord>) => onPatch(r.id, patch);
  const inputCls = "h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[13px] text-bz-text outline-none focus:border-bz-text disabled:bg-bz-paper-warm disabled:text-bz-text-soft";
  return (
    <div className={cn("rounded-bz-lg border bg-bz-surface", invalid ? "border-[#C0413A]/40" : "border-bz-line-soft")}>
      {/* card header */}
      <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {invalid ? (
            <><AlertTriangle size={14} className="shrink-0 text-[#C0413A]" /><span className="text-[13px] font-semibold text-[#9A2E29]">Unresolved type</span></>
          ) : (
            <>
              <span className={cn("flex h-5 min-w-[34px] items-center justify-center rounded-bz-sm px-1 text-[10px] font-bold tracking-wide", off ? "bg-bz-paper-warm text-bz-text-soft" : "bg-bz-deep text-bz-paper")}>{r.code}</span>
              <span className={cn("truncate text-[13.5px] font-semibold", off ? "text-bz-text-muted" : "text-bz-text")}>{r.docType}</span>
            </>
          )}
        </div>
        <Switch value={r.enabled} onChange={(v) => set({ enabled: v })} ariaLabel={`Enable ${r.docType || "scheme"}`} />
      </div>

      {/* live preview */}
      <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft bg-bz-fire/[0.05] px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">Next number</span>
        <span className={cn("truncate text-[13px] font-semibold tracking-[0.01em]", off ? "text-bz-text-soft" : "text-bz-text", NUM)}>
          {off ? "disabled" : nextNumber(r, sub)}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <MobileField label="Prefix"><input value={r.prefix} disabled={off} onChange={(e) => set({ prefix: e.target.value })} placeholder="—" className={cn(inputCls, NUM)} /></MobileField>
          <MobileField label="Suffix"><input value={r.suffix} disabled={off} onChange={(e) => set({ suffix: e.target.value })} placeholder="—" className={cn(inputCls, NUM)} /></MobileField>
          <MobileField label="Digits"><input value={r.digits} disabled={off} inputMode="numeric" onChange={(e) => set({ digits: e.target.value.replace(/[^\d]/g, "").slice(0, 2) })} className={cn(inputCls, "text-right", NUM)} /></MobileField>
          <MobileField label="Max increase"><input value={r.maxIncrease} disabled={off} inputMode="numeric" onChange={(e) => set({ maxIncrease: e.target.value.replace(/[^\d]/g, "").slice(0, 4) })} className={cn(inputCls, "text-right", NUM)} /></MobileField>
          <MobileField label="Start #"><input value={r.startNo} disabled={off || !r.allowEditInitial} inputMode="numeric" onChange={(e) => set({ startNo: e.target.value.replace(/[^\d]/g, "") })} className={cn(inputCls, "text-right", NUM)} /></MobileField>
          <MobileField label="Current #"><input value={r.currentNo} disabled={off} inputMode="numeric" onChange={(e) => set({ currentNo: e.target.value.replace(/[^\d]/g, "") })} className={cn(inputCls, "text-right", NUM)} /></MobileField>
        </div>

        <div className="space-y-2">
          <MobileToggle label="Allow editing the initial number" value={r.allowEditInitial} onChange={(v) => set({ allowEditInitial: v })} disabled={off} />
          <MobileToggle label="Include subsidiary in number" value={r.includeSub} onChange={(v) => set({ includeSub: v })} disabled={off} />
          <MobileToggle label="Include location in number" value={r.includeLoc} onChange={(v) => set({ includeLoc: v })} disabled={off} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MobileField label="Valid from"><DateField value={r.validFrom} onChange={(v) => set({ validFrom: v })} disabled={off} /></MobileField>
          <MobileField label="Valid to"><DateField value={r.validTo} onChange={(v) => set({ validTo: v })} disabled={off} /></MobileField>
        </div>
      </div>
    </div>
  );
}

// ── empty / reloading states ──────────────────────────────────────────────────

function ReloadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-20 text-center">
      <Loader2 size={20} className="animate-spin text-bz-fire" />
      <p className="text-[13px] font-medium text-bz-text-muted">Loading numbering schemes for this scope…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <PackageOpen size={22} />
      </span>
      <p className="text-[14px] font-semibold text-bz-text">No numbering schemes in this scope</p>
      <p className="max-w-sm text-[12px] text-bz-text-muted">
        The selected scope returned no document-numbering rules. Pick another subsidiary or period, or reload to try again.
      </p>
    </div>
  );
}

function EditorCard({
  records, sub, reloading, onPatch,
}: { records: DocRecord[]; sub: Subsidiary; reloading: boolean; onPatch: (id: string, patch: Partial<DocRecord>) => void }) {
  return (
    <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3 md:px-5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[13px] font-semibold tracking-tight text-bz-text">Numbering schemes</h2>
          <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>· {records.length} {records.length === 1 ? "type" : "types"}</span>
        </div>
        <p className="hidden items-center gap-1.5 text-[10.5px] text-bz-text-soft lg:flex">
          <ChevronLeft size={11} /> Scroll to pan all fields <ChevronRight size={11} />
        </p>
      </div>

      {reloading ? (
        <ReloadingState />
      ) : records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <EditorGrid records={records} sub={sub} onPatch={onPatch} />
          <div className="flex flex-col gap-3 p-3 lg:hidden">
            {records.map((r) => <RecordCard key={r.id} r={r} sub={sub} onPatch={onPatch} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMMIT BAR  (docked — the primary action lives here, always visible)
// ════════════════════════════════════════════════════════════════════════════

function CommitBar({
  saving, reloading, dirty, invalidCount, count, scopeLabel, canSave, onDiscard, onSave,
}: {
  saving: boolean;
  reloading: boolean;
  dirty: boolean;
  invalidCount: number;
  count: number;
  scopeLabel: string;
  canSave: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <p className="flex min-w-0 items-center gap-2 text-[11.5px] text-bz-text-muted">
        {saving ? (
          <><Loader2 size={12} className="shrink-0 animate-spin text-bz-fire" /> Saving every scheme…</>
        ) : reloading ? (
          <><Loader2 size={12} className="shrink-0 animate-spin text-bz-fire" /> Reloading scope…</>
        ) : invalidCount > 0 ? (
          <><AlertTriangle size={12} className="shrink-0 text-[#C0413A]" /><span className="truncate text-[#9A2E29]"><span className={NUM}>{invalidCount}</span> {invalidCount === 1 ? "scheme is" : "schemes are"} missing a document type</span></>
        ) : count === 0 ? (
          <><CircleSlash size={12} className="shrink-0 text-bz-text-soft" /> Nothing to save in this scope</>
        ) : dirty ? (
          <><span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" /><span className="truncate">Unsaved changes · <span className={cn("text-bz-text", NUM)}>{count}</span> schemes in {scopeLabel}</span></>
        ) : (
          <><Check size={12} className="shrink-0 text-bz-leaf-deep" /><span className="truncate">All schemes saved · <span className={cn("text-bz-text", NUM)}>{count}</span> in {scopeLabel}</span></>
        )}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onDiscard}
          disabled={!dirty || saving || reloading}
          className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Discard
        </button>
        {saving ? (
          <span className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark opacity-90">
            <Loader2 size={13} className="animate-spin" /> Posting…
          </span>
        ) : (
          <button
            onClick={onSave}
            disabled={!canSave}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50"
          >
            <Check size={13} /> Save all schemes
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST  (success only — failures are intentionally silent)
// ════════════════════════════════════════════════════════════════════════════

type ToastState = { message: string; id: number } | null;

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className="flex size-7 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22]">
          <Check size={13} className="text-bz-leaf-deep" />
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function AutoNumberDesignPage() {
  // tenant capability (conditional subsidiary scope)
  const [multiOrg, setMultiOrg] = React.useState(true);

  // scope: subsidiary auto-selects the first option (no placeholder configured);
  // period uses a clearable placeholder and is DEFERRED until reload.
  const [subsidiary, setSubsidiary] = React.useState<string>(SUBSIDIARIES[0].value);
  const [period, setPeriod] = React.useState<string | null>(null);
  const [committedPeriod, setCommittedPeriod] = React.useState<string | null>(null);

  // records (data-seeded) + a snapshot for dirty / discard
  const [records, setRecords] = React.useState<DocRecord[]>(() => seedFor(SUBSIDIARIES[0].value));
  const [snapshot, setSnapshot] = React.useState<DocRecord[]>(() => seedFor(SUBSIDIARIES[0].value));

  // flow
  const [reloading, setReloading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const showToast = (message: string) => setToast({ message, id: ++toastId.current });

  const activeSub = React.useMemo(
    () => SUBSIDIARIES.find((s) => s.value === subsidiary) ?? SUBSIDIARIES[0],
    [subsidiary],
  );
  const scopeLabel = multiOrg ? activeSub.value : "primary org";

  // Wholesale reload — rebuilds the record set from the backend for (sub, period),
  // discarding any unsaved edits. Materialises the deferred period.
  const reload = React.useCallback((sub: string, per: string | null) => {
    setReloading(true);
    window.setTimeout(() => {
      const recs = seedFor(sub);
      setRecords(recs);
      setSnapshot(recs);
      setCommittedPeriod(per);
      setReloading(false);
    }, 650);
  }, []);

  // Subsidiary selection RELOADS immediately (asymmetry #1).
  const onSubsidiary = (v: string) => { setSubsidiary(v); reload(v, period); };
  // Period selection only RECORDS the value (asymmetry #2 — deferred).
  const onPeriod = (v: string | null) => setPeriod(v);
  const onReload = () => reload(subsidiary, period);

  const onToggleMultiOrg = (v: boolean) => {
    setMultiOrg(v);
    if (!v && subsidiary !== SUBSIDIARIES[0].value) {
      setSubsidiary(SUBSIDIARIES[0].value);
      reload(SUBSIDIARIES[0].value, period);
    }
  };

  const patch = (id: string, p: Partial<DocRecord>) =>
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));

  // derived
  const dirty = React.useMemo(() => !recordsEqual(records, snapshot), [records, snapshot]);
  const invalidCount = React.useMemo(() => records.filter((r) => !r.docType.trim()).length, [records]);
  const pendingPeriod = period !== committedPeriod;
  const canSave = invalidCount === 0 && records.length > 0 && !saving && !reloading;

  // Save persists the whole collection in one payload. Success → toast; the
  // record set is left in place and still editable. Failures are silent.
  const handleSave = React.useCallback(() => {
    if (invalidCount !== 0 || records.length === 0 || saving || reloading) return;
    setSaving(true);
    window.setTimeout(() => {
      // payload would convert ISO dates back to backend form here:
      //   records.map(r => ({ ...r, validFrom: toBackend(r.validFrom), validTo: toBackend(r.validTo) }))
      void toBackend;
      setSaving(false);
      setSnapshot(records);
      showToast(`Saved ${records.length} numbering ${records.length === 1 ? "scheme" : "schemes"} for ${scopeLabel}.`);
    }, 900);
  }, [invalidCount, records, saving, reloading, scopeLabel]);

  const handleDiscard = () => setRecords(snapshot);

  // Cmd/Ctrl+S to save
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); handleSave(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSave]);

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Administration</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Auto Number</span>
        </>
      }
      overlay={
        <>
          <CommitBar
            saving={saving}
            reloading={reloading}
            dirty={dirty}
            invalidCount={invalidCount}
            count={records.length}
            scopeLabel={scopeLabel}
            canSave={canSave}
            onDiscard={handleDiscard}
            onSave={handleSave}
          />
          <Toast toast={toast} onDismiss={() => setToast(null)} />
        </>
      }
    >
      <PageHeader count={records.length} scopeLabel={scopeLabel} multiOrg={multiOrg} onToggleMultiOrg={onToggleMultiOrg} />
      <ScopeBar
        multiOrg={multiOrg}
        subsidiary={subsidiary}
        onSubsidiary={onSubsidiary}
        period={period}
        onPeriod={onPeriod}
        pendingPeriod={pendingPeriod}
        reloading={reloading}
        onReload={onReload}
      />
      <div className="px-4 pb-10 pt-5 md:px-6">
        <EditorCard records={records} sub={activeSub} reloading={reloading} onPatch={patch} />
      </div>
    </AppShell>
  );
}
