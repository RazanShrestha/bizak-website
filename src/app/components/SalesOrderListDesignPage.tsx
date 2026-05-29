import * as React from "react";
import { useNavigate } from "react-router";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  FileDown,
  X,
  Check,
  MoreHorizontal,
  Eye,
  Pencil,
  TrendingUp,
  Truck,
  ShieldCheck,
  MapPin,
  Building2,
  Calendar,
  Loader2,
  SearchX,
  Inbox,
  CircleSlash,
} from "lucide-react";
import { Sidebar } from "./DesignSidebar";
import { TopBar } from "./DesignTopBar";

// ════════════════════════════════════════════════════════════════════════════
// SALES ORDER · LIST (browse & act)
//
// A screen the user lands on to work with MANY orders at once. Judgement:
//   • Primary focus  = the orders table (scan / read / drill / act).
//   • Primary action = New Sales Order (the one filled button up top).
//
// Layout (top → bottom):
//   1. Header     identity + record count + create / import / export
//   2. Pulse      four read-at-a-glance tiles (value · fulfilment · approval · trend)
//   3. Browser    one surface: search + filters → applied-filter chips + sort
//                 summary → the table (or loading / empty) → progressive-load foot
//   4. Filters    a right-side drawer (every filter parameter) opened from the
//                 toolbar; applied filters surface as removable chips above the table
//
// The pulse tiles are DERIVED from the order set below (total value, fulfilment
// split, approval pipeline) so they always reconcile with what the table shows.
//
// NOTE: this file also owns the shared <AppShell> (sidebar + top bar + overlay
// slot) and the <ORDERS> seed data — both are imported by the sibling design
// pages (trial balance, the create/edit form, the custom-field builder).
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// APP SHELL  sidebar + top bar + scrollable main + an overlay slot for drawers
// ════════════════════════════════════════════════════════════════════════════

export function AppShell({
  breadcrumb,
  topBarTone = "paper",
  overlay,
  children,
}: {
  breadcrumb: React.ReactNode;
  topBarTone?: "paper" | "section";
  overlay?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex h-screen w-full overflow-hidden bg-bz-section-b text-bz-text"
      style={{ fontFamily: "var(--bz-body-font)" }}
    >
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar breadcrumb={breadcrumb} tone={topBarTone} />
        <main className="flex-1 overflow-y-auto bg-bz-section-b">{children}</main>
        {overlay}
      </div>
    </div>
  );
}

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

// ════════════════════════════════════════════════════════════════════════════
// STATUS VOCABULARY  (the same five-tone chip the SO detail page uses)
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

function StatusChip({ label, tone, dot = true }: { label: string; tone: Tone; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium ${CHIP_BG[tone]}`}>
      {dot && <span className={`size-1.5 shrink-0 rounded-bz-pill ${DOT_BG[tone]}`} />}
      {label}
    </span>
  );
}

type OrderStatus =
  | "pending"
  | "approved"
  | "partly_delivered"
  | "delivered"
  | "partly_invoiced"
  | "invoiced"
  | "closed"
  | "cancelled";

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

// An order is editable until it's locked by billing / closure / cancellation.
const isEditable = (s: OrderStatus) => !["invoiced", "closed", "cancelled"].includes(s);

// Map a lifecycle status onto the three filterable axes.
function approvalOf(s: OrderStatus) {
  if (s === "pending") return "Pending";
  if (s === "cancelled") return "Cancelled";
  return "Approved";
}
function fulfilmentOf(s: OrderStatus) {
  if (s === "cancelled") return "Cancelled";
  if (s === "pending" || s === "approved") return "Pending";
  if (s === "partly_delivered") return "Partially delivered";
  return "Delivered";
}
function billOf(s: OrderStatus) {
  if (s === "cancelled") return "Cancelled";
  if (s === "partly_invoiced") return "Partially invoiced";
  if (s === "invoiced" || s === "closed") return "Invoiced";
  return "Pending";
}

// ════════════════════════════════════════════════════════════════════════════
// DATA  line model + the order set (amounts are derived from the lines)
// ════════════════════════════════════════════════════════════════════════════

type OrderLine = {
  item: string;
  code: string;
  unit: string;
  qty: number;
  rate: number;
  priceLevel: string;
  discPct: number;
  taxCode: "VAT" | "EXM";
  taxRate: number;
};

function computeLine(l: OrderLine) {
  const gross = l.qty * l.rate;
  const discAmt = Math.round((gross * l.discPct) / 100);
  const taxable = gross - discAmt;
  const taxAmt = Math.round((taxable * l.taxRate) / 100);
  return { gross, discAmt, taxable, taxAmt, net: taxable + taxAmt };
}
const orderTotal = (lines: OrderLine[]) => lines.reduce((s, l) => s + computeLine(l).net, 0);

// compact line factory
const L = (
  item: string,
  code: string,
  unit: string,
  qty: number,
  rate: number,
  priceLevel = "Standard",
  discPct = 0,
  taxCode: "VAT" | "EXM" = "VAT",
  taxRate = 13,
): OrderLine => ({ item, code, unit, qty, rate, priceLevel, discPct, taxCode, taxRate });

export type Order = {
  id: string;
  party: string;
  partyMeta: string;
  location: string;
  subsidiary: string;
  status: OrderStatus;
  dateISO: string; // AD / Gregorian
  date: string; // AD display string (derived) — consumed by the create/edit form
  dateBS: string; // Bikram Sambat (local)
  amount: number; // total NPR (derived from lines unless explicitly set)
  lines: OrderLine[];
};

type RawOrder = Omit<Order, "amount" | "date"> & { amount?: number };

const RAW: RawOrder[] = [
  {
    id: "SO-1052", party: "Himalayan Traders", partyMeta: "C-1003 · Wholesale",
    location: "Kathmandu Warehouse", subsidiary: "NP-01 · Bizak Nepal",
    status: "pending", dateISO: "2026-05-27", dateBS: "2083/02/14",
    lines: [L("TMT Steel Rod 12mm", "TMT-12", "kg", 4200, 145, "Wholesale", 5), L("Portland Cement OPC", "CEM-OPC", "bag", 600, 980)],
  },
  {
    id: "SO-1051", party: "Everest Hardware Supplies", partyMeta: "C-1044 · Retail",
    location: "Lalitpur Store", subsidiary: "NP-01 · Bizak Nepal",
    status: "approved", dateISO: "2026-05-24", dateBS: "2083/02/11",
    lines: [L("PVC Pipe 4in", "PVC-4", "pcs", 320, 1250), L("LED Panel 40W", "LED-40", "pcs", 180, 1450), L("Safety Helmet", "SH-01", "pcs", 90, 850)],
  },
  {
    id: "SO-1050", party: "Annapurna Distributors", partyMeta: "C-1011 · Distribution",
    location: "Biratnagar Depot", subsidiary: "NP-01 · Bizak Nepal",
    status: "partly_delivered", dateISO: "2026-05-21", dateBS: "2083/02/08",
    lines: [L("Copper Wire 2.5sqmm", "CW-25", "roll", 60, 8600, "Distributor", 8), L("PVC Pipe 4in", "PVC-4", "pcs", 240, 1250)],
  },
  {
    id: "SO-1049", party: "Sagarmatha Steel Udyog", partyMeta: "C-1052 · Manufacturing",
    location: "Birgunj Hub", subsidiary: "NP-01 · Bizak Nepal",
    status: "invoiced", dateISO: "2026-05-20", dateBS: "2083/02/07",
    lines: [L("TMT Steel Rod 12mm", "TMT-12", "kg", 12000, 145, "Wholesale", 10), L("Glass Sheet 5mm", "GLS-5", "sheet", 140, 2200)],
  },
  {
    id: "SO-1048", party: "Pashupati Enterprises", partyMeta: "C-1007 · Trading",
    location: "Kathmandu Warehouse", subsidiary: "NP-01 · Bizak Nepal",
    status: "partly_invoiced", dateISO: "2026-05-19", dateBS: "2083/02/06",
    lines: [L("Diesel Generator 25kVA", "DG-25", "unit", 2, 685000), L("Service & Installation", "SVC-INS", "hrs", 16, 2500, "Standard", 0, "EXM", 0)],
  },
  {
    // ties to the SO detail page (SO-1047 · Apex) — totals reconcile (NPR 1,386,380)
    id: "SO-1047", party: "Apex Manufacturing Pvt Ltd", partyMeta: "C-1029 · Industrial",
    location: "Pokhara Warehouse 02", subsidiary: "NP-02 · Bizak Nepal Pokhara",
    status: "partly_delivered", dateISO: "2026-05-17", dateBS: "2083/02/04",
    lines: [
      L("Industrial Coupling A-220", "ICP-A220", "pcs", 12, 18500),
      L("Hydraulic Pump HP-7", "HP7", "pcs", 4, 142000),
      L("Mounting Plate Set", "MPS-006", "pkg", 30, 11200),
      L("Service & Installation", "SVC-INS", "hrs", 1, 114000, "Standard", 0, "EXM", 0),
    ],
  },
  {
    id: "SO-1046", party: "Gandaki Auto Parts", partyMeta: "C-1061 · Automotive",
    location: "Pokhara Warehouse 02", subsidiary: "NP-02 · Bizak Nepal Pokhara",
    status: "delivered", dateISO: "2026-05-15", dateBS: "2083/02/02",
    lines: [L("Copper Wire 2.5sqmm", "CW-25", "roll", 24, 8600), L("LED Panel 40W", "LED-40", "pcs", 60, 1450)],
  },
  {
    id: "SO-1045", party: "Lumbini Agro Pvt Ltd", partyMeta: "C-1018 · Agriculture",
    location: "Butwal Branch", subsidiary: "NP-01 · Bizak Nepal",
    status: "approved", dateISO: "2026-05-12", dateBS: "2083/01/30",
    lines: [L("Fertilizer Urea 50kg", "FRT-UREA", "bag", 800, 1850, "Wholesale", 0, "EXM", 0)],
  },
  {
    id: "SO-1044", party: "Bagmati Builders", partyMeta: "C-1073 · Construction",
    location: "Kathmandu Warehouse", subsidiary: "NP-01 · Bizak Nepal",
    status: "pending", dateISO: "2026-05-10", dateBS: "2083/01/28",
    lines: [L("Portland Cement OPC", "CEM-OPC", "bag", 1500, 980, "Distributor", 6), L("TMT Steel Rod 12mm", "TMT-12", "kg", 8000, 145)],
  },
  {
    id: "SO-1043", party: "Janaki Textiles", partyMeta: "C-1025 · Textile",
    location: "Biratnagar Depot", subsidiary: "NP-01 · Bizak Nepal",
    status: "cancelled", dateISO: "2026-05-08", dateBS: "2083/01/26",
    lines: [L("Cotton Fabric Roll", "CFR-10", "roll", 120, 4200)],
  },
  {
    id: "SO-1042", party: "Mechi Trade Concern", partyMeta: "C-1088 · Wholesale",
    location: "Biratnagar Depot", subsidiary: "NP-01 · Bizak Nepal",
    status: "closed", dateISO: "2026-05-05", dateBS: "2083/01/23",
    lines: [L("PVC Pipe 4in", "PVC-4", "pcs", 500, 1250, "Wholesale", 5), L("Safety Helmet", "SH-01", "pcs", 200, 850)],
  },
  {
    id: "SO-1041", party: "Karnali Pharma", partyMeta: "C-1090 · Pharma",
    location: "Kathmandu Warehouse", subsidiary: "NP-01 · Bizak Nepal",
    status: "invoiced", dateISO: "2026-05-02", dateBS: "2083/01/20",
    lines: [L("Paracetamol 500mg", "MED-PAR", "box", 1200, 320, "Standard", 0, "EXM", 0)],
  },
  {
    id: "SO-1040", party: "Pokhara Electronics", partyMeta: "C-1066 · Retail",
    location: "Pokhara Warehouse 02", subsidiary: "NP-02 · Bizak Nepal Pokhara",
    status: "partly_delivered", dateISO: "2026-04-28", dateBS: "2083/01/15",
    lines: [L("LED Panel 40W", "LED-40", "pcs", 320, 1450, "Retail"), L("Copper Wire 2.5sqmm", "CW-25", "roll", 18, 8600)],
  },
  {
    // a real order whose line items haven't been fetched — drives the
    // "No item details found" state on expand
    id: "SO-1039", party: "Bhrikuti Paper Mills", partyMeta: "C-1099 · Manufacturing",
    location: "Birgunj Hub", subsidiary: "NP-01 · Bizak Nepal",
    status: "approved", dateISO: "2026-04-24", dateBS: "2083/01/11",
    amount: 486200, lines: [],
  },
  {
    id: "SO-1038", party: "Manakamana Stores", partyMeta: "C-1102 · Retail",
    location: "Kathmandu Warehouse", subsidiary: "NP-01 · Bizak Nepal",
    status: "delivered", dateISO: "2026-04-20", dateBS: "2083/01/07",
    lines: [L("Glass Sheet 5mm", "GLS-5", "sheet", 90, 2200), L("LED Panel 40W", "LED-40", "pcs", 110, 1450)],
  },
  {
    id: "SO-1037", party: "Siddhartha Glass Works", partyMeta: "C-1110 · Industrial",
    location: "Butwal Branch", subsidiary: "NP-01 · Bizak Nepal",
    status: "partly_invoiced", dateISO: "2026-04-16", dateBS: "2083/01/03",
    lines: [L("Glass Sheet 5mm", "GLS-5", "sheet", 600, 2200, "Wholesale", 7), L("Mounting Plate Set", "MPS-006", "pkg", 40, 11200)],
  },
  {
    id: "SO-1036", party: "Dhaulagiri Cement", partyMeta: "C-1115 · Construction",
    location: "Birgunj Hub", subsidiary: "NP-01 · Bizak Nepal",
    status: "closed", dateISO: "2026-04-11", dateBS: "2082/12/28",
    lines: [L("Portland Cement OPC", "CEM-OPC", "bag", 3200, 980, "Distributor", 8)],
  },
  {
    id: "SO-1035", party: "Rara Foods Pvt Ltd", partyMeta: "C-1120 · FMCG",
    location: "Kathmandu Warehouse", subsidiary: "NP-01 · Bizak Nepal",
    status: "pending", dateISO: "2026-04-06", dateBS: "2082/12/23",
    lines: [L("Cotton Fabric Roll", "CFR-10", "roll", 40, 4200), L("Safety Helmet", "SH-01", "pcs", 150, 850, "Retail")],
  },
];

export const ORDERS: Order[] = RAW.map((o) => ({
  ...o,
  date: fmtAD(o.dateISO),
  amount: o.amount ?? orderTotal(o.lines),
}));

const dateInt = (o: Order) => toInt(o.dateISO);
const idNum = (o: Order) => Number(o.id.replace(/\D/g, ""));

// distinct option lists for the filter drawer
const SUBSIDIARIES = Array.from(new Set(ORDERS.map((o) => o.subsidiary)));
const MULTI_ENTITY = SUBSIDIARIES.length > 1;

// ── derived pulse metrics (reconcile with the table) ──
const ACTIVE_ORDERS = ORDERS.filter((o) => o.status !== "cancelled");
const TOTAL_VALUE = ACTIVE_ORDERS.reduce((s, o) => s + o.amount, 0);
const FULFIL = ACTIVE_ORDERS.reduce(
  (acc, o) => {
    const b = fulfilmentOf(o.status);
    if (b === "Delivered") acc.delivered++;
    else if (b === "Partially delivered") acc.partial++;
    else acc.pending++;
    return acc;
  },
  { delivered: 0, partial: 0, pending: 0 },
);
const FULFIL_TOTAL = FULFIL.delivered + FULFIL.partial + FULFIL.pending || 1;
const DELIVERED_PCT = Math.round((FULFIL.delivered / FULFIL_TOTAL) * 100);
const APPROVABLE = ORDERS.filter((o) => o.status !== "cancelled").length;
const APPROVED = ORDERS.filter((o) => !["pending", "cancelled"].includes(o.status)).length;
const PENDING_APPROVAL = ORDERS.filter((o) => o.status === "pending").length;
const APPROVED_PCT = Math.round((APPROVED / (APPROVABLE || 1)) * 100);
// monthly sales (last 12 months, in NPR lakh) — last 6 vs prior 6
const TREND = [58, 55, 61, 57, 63, 60, 62, 64, 61, 67, 65, 70];
const TREND_RECENT = TREND.slice(6).reduce((a, b) => a + b, 0);
const TREND_PRIOR = TREND.slice(0, 6).reduce((a, b) => a + b, 0);
const TREND_PCT = ((TREND_RECENT - TREND_PRIOR) / TREND_PRIOR) * 100;

// ════════════════════════════════════════════════════════════════════════════
// FILTER MODEL
// ════════════════════════════════════════════════════════════════════════════

type Filters = {
  subsidiary: string | null;
  location: string | null;
  party: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  datePreset: string | null;
  approval: string[];
  fulfilment: string[];
  bill: string[];
};

const EMPTY_FILTERS: Filters = {
  subsidiary: null, location: null, party: null,
  dateFrom: null, dateTo: null, datePreset: null,
  approval: [], fulfilment: [], bill: [],
};

// Default scope: the current fiscal year (every seeded order falls inside it,
// so the table opens full while still demonstrating the applied-filter chips).
const DEFAULT_FILTERS: Filters = {
  ...EMPTY_FILTERS,
  dateFrom: "2025-07-16",
  dateTo: "2026-07-15",
  datePreset: "FY 2082/83",
};

function matchesFilters(o: Order, f: Filters) {
  if (f.subsidiary && o.subsidiary !== f.subsidiary) return false;
  if (f.location && o.location !== f.location) return false;
  if (f.party && o.party !== f.party) return false;
  if (f.dateFrom && dateInt(o) < toInt(f.dateFrom)) return false;
  if (f.dateTo && dateInt(o) > toInt(f.dateTo)) return false;
  if (f.approval.length && !f.approval.includes(approvalOf(o.status))) return false;
  if (f.fulfilment.length && !f.fulfilment.includes(fulfilmentOf(o.status))) return false;
  if (f.bill.length && !f.bill.includes(billOf(o.status))) return false;
  return true;
}

type Chip = { key: string; kind: string; value: string; clear: () => void };

function buildChips(f: Filters, set: (f: Filters) => void): Chip[] {
  const chips: Chip[] = [];
  if (f.subsidiary)
    chips.push({ key: "sub", kind: "Subsidiary", value: f.subsidiary, clear: () => set({ ...f, subsidiary: null, location: null, party: null }) });
  if (f.location)
    chips.push({ key: "loc", kind: "Location", value: f.location, clear: () => set({ ...f, location: null }) });
  if (f.party)
    chips.push({ key: "party", kind: "Party", value: f.party, clear: () => set({ ...f, party: null }) });
  if (f.dateFrom || f.dateTo)
    chips.push({
      key: "date", kind: "Date",
      value: f.datePreset ?? `${f.dateFrom ? fmtAD(f.dateFrom) : "…"} – ${f.dateTo ? fmtAD(f.dateTo) : "…"}`,
      clear: () => set({ ...f, dateFrom: null, dateTo: null, datePreset: null }),
    });
  f.approval.forEach((v) =>
    chips.push({ key: `a-${v}`, kind: "Approval", value: v, clear: () => set({ ...f, approval: f.approval.filter((x) => x !== v) }) }),
  );
  f.fulfilment.forEach((v) =>
    chips.push({ key: `f-${v}`, kind: "Fulfilment", value: v, clear: () => set({ ...f, fulfilment: f.fulfilment.filter((x) => x !== v) }) }),
  );
  f.bill.forEach((v) =>
    chips.push({ key: `b-${v}`, kind: "Bill", value: v, clear: () => set({ ...f, bill: f.bill.filter((x) => x !== v) }) }),
  );
  return chips;
}

// ════════════════════════════════════════════════════════════════════════════
// HOOK
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

// ════════════════════════════════════════════════════════════════════════════
// MICRO-VIZ  thin bars only — the app's own viz language (flat, no gradients).
// Mirrors the lifecycle bars on the SO detail page; no donuts / sparklines.
// ════════════════════════════════════════════════════════════════════════════

// segmented proportion bar (fulfilment split)
function StackBar({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
      {segments.map((s, i) =>
        s.value > 0 ? <div key={i} className="h-full" style={{ width: `${(s.value / total) * 100}%`, background: s.color }} /> : null,
      )}
    </div>
  );
}

// single meter bar (approval progress · period-over-period comparison)
function MeterBar({ pct, fill }: { pct: number; fill: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
      <div className="h-full rounded-bz-pill" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: fill }} />
    </div>
  );
}

// legend item (dot + label + count)
function Leg({ color, label, n }: { color: string; label: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] text-bz-text-muted">
      <span className="size-1.5 rounded-bz-pill" style={{ background: color }} />
      {label} <span className={`font-semibold text-bz-text ${NUM}`}>{n}</span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BUTTON / MENU PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

const PRIMARY_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95";
const GHOST_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm";
const MENU_PANEL =
  "absolute right-0 top-[42px] z-30 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]";

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

// dropdown button used for Export / Import (label + caret → menu)
function CaretMenu({
  label, icon: Icon, width = "w-64", children,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  width?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className={`${GHOST_BTN} ${open ? "border-bz-text" : ""}`}>
        <Icon size={14} />
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown size={11} className="text-bz-text-muted" />
      </button>
      {open && <div className={`${MENU_PANEL} ${width}`}>{children(() => setOpen(false))}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1 · HEADER  title + live count + create / import / export
// ════════════════════════════════════════════════════════════════════════════

function PageHeader({ count, onToast }: { count: number; onToast: (m: string) => void }) {
  const navigate = useNavigate();
  return (
    <header className="px-4 pb-4 pt-5 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Sales Orders</h1>
            <span className={`inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold text-bz-text-muted ${NUM}`}>
              {count}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] text-bz-text-muted">
            Confirmed customer commitments — track approval, fulfilment and billing across the book.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CaretMenu label="Import" icon={Upload}>
            {(close) => (
              <>
                <MenuItem icon={Upload} title="Import from spreadsheet" sub="Bulk-create orders from .xlsx / .csv" onClick={() => { close(); onToast("Opening the spreadsheet import wizard…"); }} />
                <div className="my-1 h-px bg-bz-line-soft" />
                <MenuItem icon={FileDown} title="Download template" sub="Blank import sheet with the right columns" onClick={() => { close(); onToast("Downloading the sales-order import template…"); }} />
              </>
            )}
          </CaretMenu>

          <CaretMenu label="Export" icon={Download}>
            {(close) => (
              <>
                <MenuItem icon={FileText} title="Summary export" sub="One row per order" onClick={() => { close(); onToast("Exporting the order summary (one row per order)…"); }} />
                <MenuItem icon={FileSpreadsheet} title="Detailed export" sub="One row per line item" onClick={() => { close(); onToast("Exporting the detailed line-item workbook…"); }} />
              </>
            )}
          </CaretMenu>

          <button onClick={() => navigate("/design/sales-order-list/new")} className={PRIMARY_BTN}>
            <Plus size={14} /> New Sales Order
          </button>
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2 · PULSE  four compact read-at-a-glance tiles
// ════════════════════════════════════════════════════════════════════════════

function Stat({ icon: Icon, label, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-3.5">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-bz-text-muted">
        <Icon size={11} className="text-bz-text-soft" /> {label}
      </p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function PulseStrip() {
  const priorPct = Math.round((TREND_PRIOR / Math.max(TREND_PRIOR, TREND_RECENT)) * 100);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* total order value */}
      <Stat icon={TrendingUp} label="Total order value">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
          <span className="text-[11px] font-semibold text-bz-text-muted">NPR</span>
          <span className={`text-[18px] font-semibold leading-none text-bz-text ${NUM}`}>{g(TOTAL_VALUE)}</span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-bz-text-muted">
          <span className={`inline-flex items-center gap-0.5 rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 font-semibold text-bz-text ${NUM}`}>
            <TrendingUp size={10} className="text-bz-leaf-deep" /> 12.4%
          </span>
          vs last quarter
        </p>
      </Stat>

      {/* fulfilment split */}
      <Stat icon={Truck} label="Fulfilment">
        <div className="flex items-baseline gap-1">
          <span className={`text-[18px] font-semibold leading-none text-bz-text ${NUM}`}>{DELIVERED_PCT}%</span>
          <span className="text-[10.5px] text-bz-text-muted">delivered</span>
        </div>
        <div className="mt-2">
          <StackBar
            segments={[
              { value: FULFIL.delivered, color: "var(--bz-olive)" },
              { value: FULFIL.partial, color: "var(--bz-fire)" },
              { value: FULFIL.pending, color: "var(--bz-leaf-deep)" },
            ]}
          />
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5">
          <Leg color="var(--bz-olive)" label="Delivered" n={FULFIL.delivered} />
          <Leg color="var(--bz-fire)" label="Partial" n={FULFIL.partial} />
          <Leg color="var(--bz-leaf-deep)" label="Pending" n={FULFIL.pending} />
        </div>
      </Stat>

      {/* approval pipeline */}
      <Stat icon={ShieldCheck} label="Approval pipeline">
        <div className="flex items-baseline gap-1">
          <span className={`text-[18px] font-semibold leading-none text-bz-text ${NUM}`}>{APPROVED}</span>
          <span className={`text-[10.5px] text-bz-text-muted ${NUM}`}>of {APPROVABLE} approved</span>
        </div>
        <div className="mt-2"><MeterBar pct={APPROVED_PCT} fill="var(--bz-olive)" /></div>
        <p className="mt-1.5 text-[10.5px] text-bz-text-muted">
          <span className={`font-semibold text-bz-text ${NUM}`}>{PENDING_APPROVAL}</span> awaiting approval
        </p>
      </Stat>

      {/* monthly sales — last 6 mo vs prior 6 mo */}
      <Stat icon={TrendingUp} label="Monthly sales">
        <span className={`inline-flex items-center gap-1 text-[18px] font-semibold leading-none text-bz-text ${NUM}`}>
          <TrendingUp size={14} className="text-bz-leaf-deep" /> {TREND_PCT.toFixed(1)}%
        </span>
        <div className="mt-2.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-9 shrink-0 text-[9.5px] uppercase tracking-[0.05em] text-bz-text-soft">Prior</span>
            <MeterBar pct={priorPct} fill="var(--bz-leaf-deep)" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-9 shrink-0 text-[9.5px] uppercase tracking-[0.05em] text-bz-text-soft">Now</span>
            <MeterBar pct={100} fill="var(--bz-olive)" />
          </div>
        </div>
      </Stat>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3 · TOOLBAR  search + filters toggle
// ════════════════════════════════════════════════════════════════════════════

function Toolbar({
  search, setSearch, onOpenFilters, activeCount,
}: {
  search: string;
  setSearch: (v: string) => void;
  onOpenFilters: () => void;
  activeCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-bz-line-soft px-4 py-3">
      <div className="relative min-w-0 flex-1" style={{ maxWidth: 420 }}>
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order # or customer…"
          className="h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper py-2 pl-9 pr-8 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
        />
        {search && (
          <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
            <X size={12} />
          </button>
        )}
      </div>

      <button
        onClick={onOpenFilters}
        className={`relative inline-flex h-9 items-center gap-1.5 rounded-bz-md border px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm ${activeCount > 0 ? "border-bz-text bg-bz-surface" : "border-bz-line bg-bz-surface"}`}
      >
        <SlidersHorizontal size={14} />
        Filters
        {activeCount > 0 && (
          <span className={`ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire px-1 text-[10px] font-semibold text-bz-olive ${NUM}`}>
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// applied-filter chips + records / sort summary
// ════════════════════════════════════════════════════════════════════════════

function ChipBar({
  chips, onClearAll, total, sortLabel,
}: {
  chips: Chip[];
  onClearAll: () => void;
  total: number;
  sortLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-bz-line-soft px-4 py-2.5">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {chips.length > 0 ? (
          <>
            {chips.map((c) => (
              <span key={c.key} className="inline-flex items-center gap-1.5 rounded-bz-sm bg-bz-fire/[0.16] py-1 pl-2 pr-1 text-[11.5px]">
                <span className="text-bz-text-muted">{c.kind}:</span>
                <span className="font-medium text-bz-text">{c.value}</span>
                <button onClick={c.clear} aria-label={`Remove ${c.kind} filter`} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-fire/40 hover:text-bz-text">
                  <X size={11} />
                </button>
              </span>
            ))}
            <button onClick={onClearAll} className="ml-0.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">
              Clear all
            </button>
          </>
        ) : (
          <span className="text-[11.5px] text-bz-text-soft">No filters applied</span>
        )}
      </div>
      <p className={`shrink-0 text-[11.5px] text-bz-text-muted ${NUM}`}>
        <span className="font-semibold text-bz-text">{total}</span> {total === 1 ? "order" : "orders"} · {sortLabel}
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// expanded line items (with simulated fetch + empty state)
// ════════════════════════════════════════════════════════════════════════════

const ITH = "px-3 py-2 text-[9.5px] font-medium uppercase tracking-[0.06em] text-bz-text-muted whitespace-nowrap";

function ExpandedLineItems({ order, state }: { order: Order; state: "loading" | "loaded" }) {
  if (state === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <Loader2 size={15} className="animate-spin text-bz-fire" />
        <span className="text-[12px] text-bz-text-muted">Loading line items…</span>
      </div>
    );
  }
  if (order.lines.length === 0) {
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
            <th className={`${ITH} text-right`}>Qty</th>
            <th className={`${ITH} text-right`}>Rate</th>
            <th className={`${ITH} text-right`}>Disc</th>
            <th className={`${ITH} text-right`}>Gross</th>
            <th className={ITH}>Tax</th>
            <th className={`${ITH} text-right`}>Tax amt</th>
            <th className={`${ITH} text-right`}>Net</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l, i) => {
            const c = computeLine(l);
            return (
              <tr key={i} className="border-b border-bz-line-soft last:border-0">
                <td className="px-3 py-2.5">
                  <span className="text-[12px] font-medium text-bz-text">{l.item}</span>
                  <span className="ml-1.5 text-[10.5px] text-bz-text-soft">{l.code} · {l.unit}</span>
                </td>
                <td className="px-3 py-2.5 text-[11.5px] text-bz-text-muted">{l.priceLevel}</td>
                <td className={`px-3 py-2.5 text-right text-[12px] text-bz-text ${NUM}`}>{g(l.qty)}</td>
                <td className={`px-3 py-2.5 text-right text-[12px] text-bz-text-muted ${NUM}`}>{g(l.rate)}</td>
                <td className={`px-3 py-2.5 text-right text-[12px] text-bz-text-muted ${NUM}`}>{l.discPct ? `${l.discPct}%` : "—"}</td>
                <td className={`px-3 py-2.5 text-right text-[12px] text-bz-text-muted ${NUM}`}>{g(c.gross)}</td>
                <td className="px-3 py-2.5 text-[11px] text-bz-text-muted">{l.taxCode} · {l.taxRate}%</td>
                <td className={`px-3 py-2.5 text-right text-[12px] text-bz-text-muted ${NUM}`}>{c.taxAmt ? g(c.taxAmt) : "—"}</td>
                <td className={`px-3 py-2.5 text-right text-[12px] font-semibold text-bz-text ${NUM}`}>{g(c.net)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-bz-line bg-bz-paper-warm/40">
            <td colSpan={8} className="px-3 py-2.5 text-right text-[11.5px] font-medium text-bz-text-muted">Order total</td>
            <td className={`px-3 py-2.5 text-right text-[12.5px] font-semibold text-bz-text ${NUM}`}>{g(order.amount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// per-row actions (View / Edit)
// ════════════════════════════════════════════════════════════════════════════

function RowMenu({ order }: { order: Order }) {
  const [open, setOpen] = React.useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const navigate = useNavigate();
  const editable = isEditable(order.status);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="Row actions"
        className={`flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text ${open ? "bg-bz-paper-warm text-bz-text" : ""}`}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className={`${MENU_PANEL} w-40`} onClick={(e) => e.stopPropagation()}>
          <MenuItem icon={Eye} title="View order" onClick={() => { setOpen(false); navigate(`/design/sales-order-list/${order.id}`); }} />
          {editable ? (
            <MenuItem icon={Pencil} title="Edit order" onClick={() => { setOpen(false); navigate(`/design/sales-order-list/${order.id}/edit`); }} />
          ) : (
            <div className="flex cursor-not-allowed items-center gap-2.5 px-3.5 py-2.5 opacity-50" title="Locked once invoiced, closed or cancelled">
              <Pencil size={14} className="text-bz-text-muted" />
              <span className="text-[12px] font-medium text-bz-text">Edit order</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// sortable column header
// ════════════════════════════════════════════════════════════════════════════

type SortField = "id" | "date";
type Sort = { field: SortField; dir: "asc" | "desc" };

function SortHead({ label, field, sort, onSort, align = "left" }: { label: string; field: SortField; sort: Sort; onSort: (f: SortField) => void; align?: "left" | "right" }) {
  const active = sort.field === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`group inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.06em] ${active ? "text-bz-text" : "text-bz-text-muted hover:text-bz-text"} ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      {label}
      {active ? (
        sort.dir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />
      ) : (
        <ChevronsUpDown size={12} className="text-bz-text-soft" />
      )}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// the table (desktop) + cards (mobile)
// ════════════════════════════════════════════════════════════════════════════

const TD = "px-3 py-3";

function OrdersTable({
  rows, expanded, itemLoad, onToggle, onOpen, sort, onSort,
}: {
  rows: Order[];
  expanded: Set<string>;
  itemLoad: Record<string, "loading" | "loaded">;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  sort: Sort;
  onSort: (f: SortField) => void;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left" style={{ minWidth: 940 }}>
        <thead>
          <tr className="border-b border-bz-line bg-bz-paper-warm">
            <th className="w-9 px-2 py-2.5" />
            <th className="px-3 py-2.5"><SortHead label="Order #" field="id" sort={sort} onSort={onSort} /></th>
            <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Customer</th>
            <th className="px-3 py-2.5"><SortHead label="Date" field="date" sort={sort} onSort={onSort} /></th>
            <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Location</th>
            <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Status</th>
            <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Amount</th>
            <th className="w-10 px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const isOpen = expanded.has(o.id);
            const st = STATUS[o.status];
            return (
              <React.Fragment key={o.id}>
                <tr
                  onClick={() => onOpen(o.id)}
                  className="cursor-pointer border-b border-bz-line-soft hover:bg-bz-paper-warm/50"
                >
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
                  <td className={TD}>
                    <span className={`text-[12.5px] font-semibold tracking-tight text-bz-text ${NUM}`}>{o.id}</span>
                  </td>
                  <td className={TD}>
                    <span className="block text-[13px] font-medium text-bz-text">{o.party}</span>
                    <span className="block text-[10.5px] text-bz-text-muted">
                      {o.partyMeta}{MULTI_ENTITY && <span className="text-bz-text-soft"> · {o.subsidiary.split(" · ")[0]}</span>}
                    </span>
                  </td>
                  <td className={TD}>
                    <span className={`block text-[12px] text-bz-text ${NUM}`}>{fmtAD(o.dateISO)}</span>
                    <span className={`block text-[10.5px] text-bz-text-soft ${NUM}`}>BS {o.dateBS}</span>
                  </td>
                  <td className={`${TD} text-[12px] text-bz-text-muted`}>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={12} className="text-bz-text-soft" /> {o.location}
                    </span>
                  </td>
                  <td className={TD}><StatusChip label={st.label} tone={st.tone} /></td>
                  <td className={`${TD} whitespace-nowrap text-right`}>
                    <span className="text-[10px] font-semibold text-bz-text-muted">NPR </span>
                    <span className={`text-[13px] font-semibold text-bz-text ${NUM}`}>{g(o.amount)}</span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="flex justify-end"><RowMenu order={o} /></div>
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={8} className="bg-bz-paper-warm/40 px-4 py-3 md:pl-11">
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
  rows, expanded, itemLoad, onToggle, onOpen,
}: {
  rows: Order[];
  expanded: Set<string>;
  itemLoad: Record<string, "loading" | "loaded">;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 p-3 md:hidden">
      {rows.map((o) => {
        const isOpen = expanded.has(o.id);
        const st = STATUS[o.status];
        return (
          <div key={o.id} className="rounded-bz-md border border-bz-line-soft bg-bz-surface">
            <button onClick={() => onOpen(o.id)} className="block w-full p-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[13px] font-semibold tracking-tight text-bz-text ${NUM}`}>{o.id}</span>
                <StatusChip label={st.label} tone={st.tone} />
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-bz-text">{o.party}</p>
                  <p className="truncate text-[11px] text-bz-text-muted">{o.partyMeta}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-right">
                  <span className="text-[10px] font-semibold text-bz-text-muted">NPR </span>
                  <span className={`text-[14px] font-semibold text-bz-text ${NUM}`}>{g(o.amount)}</span>
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-bz-text-muted">
                <span className={`inline-flex items-center gap-1 ${NUM}`}><Calendar size={11} className="text-bz-text-soft" /> {fmtAD(o.dateISO)} · BS {o.dateBS}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={11} className="text-bz-text-soft" /> {o.location}</span>
                {MULTI_ENTITY && <span className="inline-flex items-center gap-1"><Building2 size={11} className="text-bz-text-soft" /> {o.subsidiary.split(" · ")[0]}</span>}
              </div>
            </button>
            <div className="flex items-center justify-between border-t border-bz-line-soft px-3 py-2">
              <button
                onClick={() => onToggle(o.id)}
                aria-expanded={isOpen}
                className="inline-flex items-center gap-1.5 rounded-bz-sm px-1.5 py-1 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
              >
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

// ── loading / empty / progressive-load ──

function SkeletonRows() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center gap-2 py-5 text-bz-text-muted">
        <Loader2 size={16} className="animate-spin text-bz-fire" />
        <span className="text-[12.5px] font-medium">Loading orders…</span>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-bz-line-soft px-4 py-3.5">
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

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <SearchX size={22} />
      </span>
      <p className="text-[14px] font-semibold text-bz-text">No sales orders found</p>
      <p className="max-w-sm text-[12px] text-bz-text-muted">
        {hasFilters
          ? "No orders match the current search and filters. Try widening them."
          : "There are no sales orders to show yet. Create one to get started."}
      </p>
      {hasFilters && (
        <button onClick={onClear} className={`${GHOST_BTN} mt-1`}>
          <CircleSlash size={13} /> Clear search & filters
        </button>
      )}
    </div>
  );
}

function ListFooter({
  shown, total, loadingMore, onLoadMore,
}: {
  shown: number;
  total: number;
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  const allLoaded = shown >= total;
  return (
    <div className="flex flex-col items-center gap-2 border-t border-bz-line-soft px-4 py-3.5">
      <p className={`text-[11.5px] text-bz-text-muted ${NUM}`}>
        Showing <span className="font-semibold text-bz-text">{shown}</span> of {total} orders
      </p>
      {allLoaded ? (
        <p className="inline-flex items-center gap-1.5 text-[11px] text-bz-text-soft">
          <Check size={12} className="text-bz-leaf-deep" /> All orders loaded
        </p>
      ) : (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="inline-flex items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 py-1.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-60"
        >
          {loadingMore ? <><Loader2 size={12} className="animate-spin" /> Loading more…</> : <>Load more orders</>}
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4 · FILTER DRAWER  every filter parameter (right-side overlay)
// ════════════════════════════════════════════════════════════════════════════

const DRAWER_LABEL = "flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted";

function Select({ value, options, placeholder, onChange }: { value: string | null; options: string[]; placeholder: string; onChange: (v: string | null) => void }) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-10 w-full appearance-none rounded-bz-md border border-bz-line bg-bz-paper-warm pl-3 pr-9 text-[12.5px] text-bz-text outline-none focus:border-bz-text"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bz-text-muted" />
    </div>
  );
}

function Field({ icon: Icon, label, hint, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon size={12} className="text-bz-text-muted" />
        <span className="text-[12px] font-medium text-bz-text">{label}</span>
        {hint && <span className="ml-auto text-[10px] text-bz-text-soft">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex w-full items-center gap-2.5 rounded-bz-sm px-1.5 py-1.5 text-left hover:bg-bz-paper-warm">
      <span className={`flex size-4 shrink-0 items-center justify-center rounded-[5px] border ${checked ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface"}`}>
        {checked && <Check size={11} />}
      </span>
      <span className="text-[12.5px] text-bz-text">{label}</span>
    </button>
  );
}

function CheckGroup({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (next: string[]) => void }) {
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div>
      <p className={`${DRAWER_LABEL} mb-1.5`}>{label}</p>
      <div className="flex flex-col gap-0.5">
        {options.map((o) => (
          <CheckRow key={o} label={o} checked={selected.includes(o)} onToggle={() => toggle(o)} />
        ))}
      </div>
    </div>
  );
}

const DATE_PRESETS: { label: string; from: string; to: string }[] = [
  { label: "This month", from: "2026-05-01", to: "2026-05-31" },
  { label: "This quarter", from: "2026-04-01", to: "2026-06-30" },
  { label: "FY 2082/83", from: "2025-07-16", to: "2026-07-15" },
];

function FilterDrawer({
  open, onClose, active, onApply,
}: {
  open: boolean;
  onClose: () => void;
  active: Filters;
  onApply: (f: Filters) => void;
}) {
  const [draft, setDraft] = React.useState<Filters>(active);
  React.useEffect(() => {
    if (open) setDraft(active);
  }, [open, active]);

  if (!open) return null;

  // cascade: a chosen subsidiary narrows the location & party option lists
  const scopedOrders = draft.subsidiary ? ORDERS.filter((o) => o.subsidiary === draft.subsidiary) : ORDERS;
  const locOptions = Array.from(new Set(scopedOrders.map((o) => o.location)));
  const partyOptions = Array.from(new Set(scopedOrders.map((o) => o.party)));

  const count = buildChips(draft, () => {}).length;
  const setDate = (from: string | null, to: string | null, preset: string | null) =>
    setDraft((d) => ({ ...d, dateFrom: from, dateTo: to, datePreset: preset }));

  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-10 bg-bz-olive/35 backdrop-blur-[1px]" aria-hidden />
      <aside className="absolute right-0 top-0 z-20 flex h-full w-full max-w-[420px] flex-col border-l border-bz-line-soft bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire/[0.18] text-bz-text">
              <SlidersHorizontal size={16} />
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-bz-text">Filter sales orders</p>
              <p className="text-[11.5px] text-bz-text-muted">Narrow the order book, then apply.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={15} />
          </button>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          {MULTI_ENTITY && (
            <Field icon={Building2} label="Subsidiary" hint="narrows location & party">
              <Select
                value={draft.subsidiary}
                options={SUBSIDIARIES}
                placeholder="All entities"
                onChange={(v) => setDraft((d) => ({ ...d, subsidiary: v, location: null, party: null }))}
              />
            </Field>
          )}

          <div>
            <p className={`${DRAWER_LABEL} mb-1.5`}><Calendar size={12} /> Date range</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {DATE_PRESETS.map((p) => {
                const isActive = draft.datePreset === p.label;
                return (
                  <button
                    key={p.label}
                    onClick={() => setDate(p.from, p.to, p.label)}
                    className={`rounded-bz-sm border px-2.5 py-1 text-[11px] font-medium ${isActive ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">From</p>
                <input
                  type="date"
                  value={draft.dateFrom ?? ""}
                  onChange={(e) => setDate(e.target.value || null, draft.dateTo, null)}
                  className={`h-10 w-full rounded-bz-md border border-bz-line bg-bz-paper-warm px-3 text-[12px] text-bz-text outline-none focus:border-bz-text ${NUM}`}
                />
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">To</p>
                <input
                  type="date"
                  value={draft.dateTo ?? ""}
                  onChange={(e) => setDate(draft.dateFrom, e.target.value || null, null)}
                  className={`h-10 w-full rounded-bz-md border border-bz-line bg-bz-paper-warm px-3 text-[12px] text-bz-text outline-none focus:border-bz-text ${NUM}`}
                />
              </div>
            </div>
          </div>

          <Field icon={MapPin} label="Location">
            <Select value={draft.location} options={locOptions} placeholder="All locations" onChange={(v) => setDraft((d) => ({ ...d, location: v }))} />
          </Field>

          <Field icon={Building2} label="Party / Customer">
            <Select value={draft.party} options={partyOptions} placeholder="All customers" onChange={(v) => setDraft((d) => ({ ...d, party: v }))} />
          </Field>

          <div className="h-px bg-bz-line-soft" />

          <CheckGroup label="Approval status" options={["Pending", "Approved"]} selected={draft.approval} onChange={(v) => setDraft((d) => ({ ...d, approval: v }))} />
          <CheckGroup label="Fulfilment status" options={["Pending", "Partially delivered", "Delivered"]} selected={draft.fulfilment} onChange={(v) => setDraft((d) => ({ ...d, fulfilment: v }))} />
          <CheckGroup label="Bill status" options={["Pending", "Partially invoiced", "Invoiced"]} selected={draft.bill} onChange={(v) => setDraft((d) => ({ ...d, bill: v }))} />
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm px-5 py-3.5">
          <button
            onClick={() => setDraft(EMPTY_FILTERS)}
            disabled={count === 0}
            className="text-[12px] font-medium text-bz-text-muted hover:text-bz-text disabled:opacity-40"
          >
            Clear all{count > 0 ? ` · ${count}` : ""}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
              Cancel
            </button>
            <button onClick={() => onApply(draft)} className={PRIMARY_BTN}>
              <Check size={13} /> Apply filters
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className="flex size-7 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18]"><Check size={13} className="text-bz-leaf-deep" /></span>
        <p className="text-[12.5px] font-medium text-bz-text">{message}</p>
        <button onClick={onClose} className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

function Breadcrumb() {
  return (
    <>
      <span className="text-bz-text-muted">Sales &amp; CRM</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Sales Orders</span>
    </>
  );
}

const PAGE_SIZE = 8;

export function SalesOrderListDesignPage() {
  const navigate = useNavigate();

  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [sort, setSort] = React.useState<Sort>({ field: "date", dir: "desc" });
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [itemLoad, setItemLoad] = React.useState<Record<string, "loading" | "loaded">>({});
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [listLoading, setListLoading] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);

  // initial fetch
  React.useEffect(() => {
    const t = window.setTimeout(() => setListLoading(false), 480);
    return () => window.clearTimeout(t);
  }, []);
  // auto-dismiss toast
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const notify = (m: string) => setToast(m);

  // search + filter + sort
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return ORDERS.filter((o) => {
      if (q && !o.id.toLowerCase().includes(q) && !o.party.toLowerCase().includes(q)) return false;
      return matchesFilters(o, filters);
    });
  }, [search, filters]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const cmp = sort.field === "id" ? idNum(a) - idNum(b) : dateInt(a) - dateInt(b);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sort]);

  const shown = sorted.slice(0, visible);

  const onSort = (field: SortField) =>
    setSort((s) => (s.field === field ? { field, dir: s.dir === "asc" ? "desc" : "asc" } : { field, dir: field === "date" ? "desc" : "asc" }));

  const onToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // simulate fetching this order's line items on first open
        if (!itemLoad[id]) {
          setItemLoad((m) => ({ ...m, [id]: "loading" }));
          window.setTimeout(() => setItemLoad((m) => ({ ...m, [id]: "loaded" })), 550);
        }
      }
      return next;
    });
  };

  const onLoadMore = () => {
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisible((v) => v + 8);
      setLoadingMore(false);
    }, 480);
  };

  const applyFilters = (f: Filters) => {
    setFilters(f);
    setFiltersOpen(false);
    setVisible(PAGE_SIZE);
  };
  const clearEverything = () => {
    setFilters(EMPTY_FILTERS);
    setSearch("");
    setVisible(PAGE_SIZE);
  };

  const chips = buildChips(filters, (f) => { setFilters(f); setVisible(PAGE_SIZE); });
  const activeCount = chips.length;

  const sortLabel = `sorted by ${sort.field === "date" ? "transaction date" : "order number"} (${
    sort.field === "date" ? (sort.dir === "desc" ? "newest first" : "oldest first") : sort.dir === "desc" ? "high–low" : "low–high"
  })`;

  const isEmpty = !listLoading && sorted.length === 0;

  return (
    <AppShell
      breadcrumb={<Breadcrumb />}
      overlay={<FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} active={filters} onApply={applyFilters} />}
    >
      <PageHeader count={filtered.length} onToast={notify} />

      <div className="flex flex-col gap-3 px-4 pb-8 md:px-8">
        <PulseStrip />

        <section className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          <Toolbar search={search} setSearch={setSearch} onOpenFilters={() => setFiltersOpen(true)} activeCount={activeCount} />
          <ChipBar chips={chips} onClearAll={clearEverything} total={filtered.length} sortLabel={sortLabel} />

          {listLoading ? (
            <SkeletonRows />
          ) : isEmpty ? (
            <EmptyState hasFilters={activeCount > 0 || search.trim().length > 0} onClear={clearEverything} />
          ) : (
            <>
              <OrdersTable rows={shown} expanded={expanded} itemLoad={itemLoad} onToggle={onToggle} onOpen={(id) => navigate(`/design/sales-order-list/${id}`)} sort={sort} onSort={onSort} />
              <OrderCards rows={shown} expanded={expanded} itemLoad={itemLoad} onToggle={onToggle} onOpen={(id) => navigate(`/design/sales-order-list/${id}`)} />
              <ListFooter shown={shown.length} total={sorted.length} loadingMore={loadingMore} onLoadMore={onLoadMore} />
            </>
          )}
        </section>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
