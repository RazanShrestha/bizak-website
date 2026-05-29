import * as React from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router";
import {
  // chrome / nav
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  ArrowUpRight,
  X,
  // lifecycle + status
  ShieldCheck,
  Truck,
  ReceiptText,
  AlertTriangle,
  Info,
  Lock,
  // identity / reference
  Calendar,
  CalendarClock,
  Building2,
  User,
  Tag,
  Layers,
  StickyNote,
  // body
  Boxes,
  Package,
  FileText,
  Paperclip,
  History,
  Workflow as WorkflowIcon,
  GitBranch,
  Filter,
  Check,
  Download,
  Printer,
  Pencil,
  Copy,
  Trash2,
  Ban,
  ArrowDownLeft,
  Send,
} from "lucide-react";
import { Sidebar } from "./DesignSidebar";
import { TopBar } from "./DesignTopBar";

// ════════════════════════════════════════════════════════════════════════════
// SALES ORDER · DETAIL / OVERVIEW (read-only)
//
// A "Lifecycle Command" cockpit. The screen reads top-to-bottom as:
//   identity → where it stands across 3 axes → what to do next →
//   the substance (line items + totals) that justifies it → reference & trace.
//
// Self-contained on purpose: it composes the shared Sidebar + TopBar chrome
// directly and owns its own mock data, so it does not depend on the list page.
//
// Showcased state SO-1047 · Apex Manufacturing — the maximally-nuanced case:
//   Approval  = APPROVED              (axis closed → no Approve/Reject buttons)
//   Fulfilment= PARTIALLY DELIVERED   (2 of 4 lines started · 55% by value)
//   Billing   = PARTIALLY INVOICED    (NPR 641,840 invoiced · 744,540 outstanding)
// All numbers below reconcile across the board, the per-line micro-status and
// the totals foot.
// ════════════════════════════════════════════════════════════════════════════

type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";

const DOC = {
  party: "Apex Manufacturing Pvt Ltd",
  partyMeta: "C-1029 · Industrial · Pokhara, Nepal",
  salesRep: "Priya Maharjan",
  salesRepMeta: "NP-02 · Pokhara office",
  orderDate: "May 17, 2026",
  orderDateNep: "2083/02/04",
  expectedDelivery: "May 30, 2026",
  expectedHint: "in 1 day",
  location: "Pokhara Warehouse 02",
  locationMeta: "Lekhnath · drew down stock for DLV-0788",
  subsidiary: "NP-02 · Bizak Nepal Pokhara",
  currency: "NPR",
  currencyMeta: "Nepalese Rupee · base currency",
  approvedBy: "Ramesh Adhikari · Sales Manager",
  approvedOn: "May 17, 2026",
  memo:
    "Bulk order — phase-2 install for Apex's Bharatpur plant. Confirm crane availability before scheduling the remaining deliveries.",
  source: { type: "Estimate", ref: "EST-2241" },
  billing: {
    pan: "600 455 782",
    address: "Industrial Area Sector 7, Pokhara 33700, Nepal",
    term: "Net 30",
    dueDate: "Jun 16, 2026",
  },
};

type LineRow = {
  sn: number;
  item: string;
  code: string;
  description: string;
  unit: string;
  qty: number;
  priceLevel: string;
  rate: string;
  disc: string;
  gross: string;
  tax: string;
  taxAmt: string;
  net: string;
  delivered: { label: string; tone: Tone };
  invoiced: { label: string; tone: Tone };
  lots: { batch: string; serial: string; expiry: string; date: string; qty: string }[];
};

const LINES: LineRow[] = [
  {
    sn: 1,
    item: "Industrial Coupling A-220",
    code: "ICP-A220",
    description: "Standard duty coupling, zinc-plated",
    unit: "pcs",
    qty: 12,
    priceLevel: "STD",
    rate: "18,500",
    disc: "—",
    gross: "222,000",
    tax: "VAT 13%",
    taxAmt: "28,860",
    net: "250,860",
    delivered: { label: "6 of 12 delivered", tone: "partial" },
    invoiced: { label: "Not invoiced", tone: "pending" },
    lots: [
      { batch: "BC-A220-04", serial: "—", expiry: "—", date: "May 22, 2026", qty: "6 pcs" },
    ],
  },
  {
    sn: 2,
    item: "Hydraulic Pump HP-7",
    code: "HP7-2026",
    description: "Phase-2 high-pressure pump unit",
    unit: "pcs",
    qty: 4,
    priceLevel: "STD",
    rate: "142,000",
    disc: "—",
    gross: "568,000",
    tax: "VAT 13%",
    taxAmt: "73,840",
    net: "641,840",
    delivered: { label: "Delivered", tone: "positive" },
    invoiced: { label: "Invoiced", tone: "positive" },
    lots: [
      { batch: "HP7-B12", serial: "SN-7741 → SN-7744", expiry: "—", date: "May 22, 2026", qty: "4 pcs" },
    ],
  },
  {
    sn: 3,
    item: "Mounting Plate Set",
    code: "MPS-006",
    description: "Pkg of 6 · stainless-steel mount plate",
    unit: "pkg",
    qty: 30,
    priceLevel: "BULK",
    rate: "11,200",
    disc: "—",
    gross: "336,000",
    tax: "VAT 13%",
    taxAmt: "43,680",
    net: "379,680",
    delivered: { label: "Awaiting delivery", tone: "pending" },
    invoiced: { label: "Not invoiced", tone: "pending" },
    lots: [
      { batch: "MPS-B30", serial: "—", expiry: "—", date: "Reserved", qty: "30 pkg" },
    ],
  },
  {
    sn: 4,
    item: "Service & Installation",
    code: "SVC-INS",
    description: "On-site fitting + first-run validation",
    unit: "hrs",
    qty: 1,
    priceLevel: "STD",
    rate: "114,000",
    disc: "—",
    gross: "114,000",
    tax: "Exempt",
    taxAmt: "0",
    net: "114,000",
    delivered: { label: "Not scheduled", tone: "pending" },
    invoiced: { label: "Not invoiced", tone: "pending" },
    lots: [],
  },
];

const TOTALS = {
  subtotal: "1,240,000",
  discount: "0",
  vat: "146,380",
  total: "1,386,380",
  invoiced: "641,840",
  outstanding: "744,540",
  invoicedPct: 46,
};

type Axis = {
  key: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  status: { label: string; tone: Tone };
  nodes: { label: string; state: "done" | "active" | "todo" }[];
  pct: number | null;
  caption: string;
  hint: string;
};

const AXES: Axis[] = [
  {
    key: "approval",
    title: "Approval",
    icon: ShieldCheck,
    status: { label: "Approved", tone: "positive" },
    nodes: [
      { label: "Submitted", state: "done" },
      { label: "Approved", state: "done" },
    ],
    pct: null,
    caption: "Approved by Ramesh Adhikari · May 17, 2026",
    hint: "No approval pending — fulfilment is unlocked.",
  },
  {
    key: "fulfilment",
    title: "Fulfilment",
    icon: Truck,
    status: { label: "Partially Delivered", tone: "partial" },
    nodes: [
      { label: "Ordered", state: "done" },
      { label: "Partial", state: "active" },
      { label: "Delivered", state: "todo" },
    ],
    pct: 55,
    caption: "NPR 767,270 of 1,386,380 delivered · 2 of 4 lines",
    hint: "3 lines still awaiting delivery.",
  },
  {
    key: "billing",
    title: "Billing",
    icon: ReceiptText,
    status: { label: "Partially Invoiced", tone: "partial" },
    nodes: [
      { label: "Ordered", state: "done" },
      { label: "Partial", state: "active" },
      { label: "Invoiced", state: "todo" },
    ],
    pct: 46,
    caption: "NPR 641,840 invoiced · NPR 744,540 outstanding",
    hint: "Invoice the delivered, un-billed balance (NPR 125,430).",
  },
];

type ChainNodeT = {
  kind: "source" | "current" | "down";
  type: string;
  ref: string;
  date: string;
  status: { label: string; tone: Tone };
  amount: string;
};

const CHAIN: ChainNodeT[] = [
  { kind: "source", type: "Estimate", ref: "EST-2241", date: "May 12, 2026", status: { label: "Converted", tone: "neutral" }, amount: "NPR 1,240,000" },
  { kind: "current", type: "Sales Order", ref: "SO-1047", date: "May 17, 2026", status: { label: "Approved", tone: "positive" }, amount: "NPR 1,386,380" },
  { kind: "down", type: "Delivery", ref: "DLV-0788", date: "May 22, 2026", status: { label: "Delivered", tone: "positive" }, amount: "NPR 679,000" },
  { kind: "down", type: "Invoice", ref: "INV-2046", date: "May 23, 2026", status: { label: "Open", tone: "partial" }, amount: "NPR 641,840" },
];

const RELATED = [
  { date: "May 12, 2026", type: "Estimate", doc: "EST-2241", party: "Apex Manufacturing Pvt Ltd", status: { label: "Converted", tone: "neutral" as Tone }, amount: "NPR 1,240,000", current: false },
  { date: "May 17, 2026", type: "Sales Order", doc: "SO-1047", party: "Apex Manufacturing Pvt Ltd", status: { label: "Approved", tone: "positive" as Tone }, amount: "NPR 1,386,380", current: true },
  { date: "May 22, 2026", type: "Delivery", doc: "DLV-0788", party: "Apex Manufacturing Pvt Ltd", status: { label: "Delivered", tone: "positive" as Tone }, amount: "NPR 679,000", current: false },
  { date: "May 23, 2026", type: "Invoice", doc: "INV-2046", party: "Apex Manufacturing Pvt Ltd", status: { label: "Open", tone: "partial" as Tone }, amount: "NPR 641,840", current: false },
  { date: "May 26, 2026", type: "Payment", doc: "RCP-1190", party: "Apex Manufacturing Pvt Ltd", status: { label: "Received", tone: "positive" as Tone }, amount: "NPR 300,000", current: false },
];

const REL_FILTERS = ["All", "Estimate", "Delivery", "Invoice", "Payment"] as const;

const ACTIVITY = [
  { date: "May 26, 2026", time: "3:14 PM", dir: "inbound" as const, title: "Part-payment received", memo: "Apex remitted NPR 300,000 against INV-2046 by bank transfer." },
  { date: "May 23, 2026", time: "11:02 AM", dir: "outbound" as const, title: "Invoice INV-2046 sent", memo: "First invoice for the delivered Hydraulic Pump line emailed to accounts@apexmfg.com." },
  { date: "May 22, 2026", time: "9:40 AM", dir: "outbound" as const, title: "Partial delivery dispatched", memo: "DLV-0788 dispatched from Pokhara Warehouse 02 — 4 pumps + 6 couplings." },
  { date: "May 17, 2026", time: "4:30 PM", dir: "inbound" as const, title: "Order approved", memo: "Ramesh Adhikari approved the order; fulfilment unlocked." },
];

const FILES = [
  { name: "Signed Quotation.pdf", folder: "Sales / Apex / 2026", size: "1.2 MB" },
  { name: "Apex Phase-2 Spec.docx", folder: "Engineering / Specs", size: "340 KB" },
  { name: "Delivery Note DLV-0788.pdf", folder: "Logistics / Deliveries", size: "210 KB" },
];

const CLASSIFICATION = [
  { label: "Department", value: "Sales — Pokhara", meta: "DPT-02" },
  { label: "Class", value: "Industrial", meta: "" },
  { label: "Project", value: "APEX-PH2", meta: "Apex phase-2 install" },
  { label: "Partner", value: "Apex Group", meta: "Strategic" },
];

const CUSTOM_FIELDS = [
  { label: "Plant", value: "Bharatpur · Industrial Park" },
  { label: "Commissioning by", value: "Engineering — Phase 2" },
  { label: "Reference quote", value: "QTE-APX-0188" },
  { label: "Crane required", value: "Yes" },
];

const AUDIT = {
  systemNotes: [
    { label: "Created", value: "May 17, 2026 · 2:05 PM", by: "Priya Maharjan" },
    { label: "Last modified", value: "May 23, 2026 · 11:02 AM", by: "Priya Maharjan" },
    { label: "Converted from", value: "EST-2241", by: "System" },
  ],
  activeWorkflows: [
    { name: "Fulfilment SLA", state: { label: "On track", tone: "positive" as Tone }, detail: "Expected delivery May 30 · 1 day remaining" },
    { name: "Collections follow-up", state: { label: "Scheduled", tone: "pending" as Tone }, detail: "Reminder for INV-2046 balance on the due date" },
  ],
  workflowHistory: [
    { date: "May 17, 2026 · 4:30 PM", event: "Approval workflow completed", by: "Ramesh Adhikari", result: { label: "Approved", tone: "positive" as Tone } },
    { date: "May 17, 2026 · 2:40 PM", event: "Submitted for approval", by: "Priya Maharjan", result: { label: "Pending", tone: "pending" as Tone } },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// TONE HELPERS rectangular status chips, dots, progress fills
// ════════════════════════════════════════════════════════════════════════════

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
    <span className={`inline-flex items-center gap-1.5 rounded-bz-sm px-2 py-0.5 text-[10.5px] font-medium ${CHIP_BG[tone]}`}>
      {dot && <span className={`size-1.5 rounded-bz-pill ${DOT_BG[tone]}`} />}
      {label}
    </span>
  );
}

function CompositeStatus({ compact = false }: { compact?: boolean }) {
  const parts: { label: string; tone: Tone }[] = [
    { label: compact ? "Approved" : "Approved", tone: "positive" },
    { label: compact ? "Part. Delivered" : "Partially Delivered", tone: "partial" },
    { label: compact ? "Part. Invoiced" : "Partially Invoiced", tone: "partial" },
  ];
  return (
    <div className="inline-flex items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 py-1.5">
      {parts.map((p, i) => (
        <React.Fragment key={p.label}>
          {i > 0 && <span className="text-bz-line">·</span>}
          <span className="inline-flex items-center gap-1.5">
            <span className={`size-1.5 rounded-bz-pill ${DOT_BG[p.tone]}`} />
            <span className="text-[11px] font-medium text-bz-text">{p.label}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function Avatar({ name, tone = "neutral" }: { name: string; tone?: "fire" | "neutral" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <span className={`flex size-8 shrink-0 items-center justify-center rounded-bz-pill text-[11px] font-bold text-bz-text ${tone === "fire" ? "bg-bz-fire/[0.18]" : "bg-bz-paper-warm"}`}>
      {initials}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// IDENTITY HEADER sticky action bar + scrolling identity hero
// ════════════════════════════════════════════════════════════════════════════

function StickyActionBar({
  docNo,
  onDeliver,
  onInvoice,
  onPrint,
  overflow,
}: {
  docNo: string;
  onDeliver: () => void;
  onInvoice: () => void;
  onPrint: () => void;
  overflow: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-bz-line-soft bg-bz-paper/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-2.5 md:px-6">
        <Link
          to="/design/sales-order-list"
          className="inline-flex items-center gap-1 text-[12px] text-bz-text-muted hover:text-bz-text"
        >
          <ChevronLeft size={13} />
          <span className="hidden sm:inline">Sales Order</span>
        </Link>
        <span className="hidden h-4 w-px bg-bz-line sm:block" />
        <span className="text-[13px] font-semibold tabular-nums text-bz-text">{docNo}</span>
        <span className="hidden lg:block">
          <CompositeStatus compact />
        </span>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={onDeliver}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
          >
            <Truck size={13} />
            Deliver
            <span className="hidden text-bz-text-on-dark/65 lg:inline">· 3 lines</span>
          </button>
          <button
            onClick={onInvoice}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm"
          >
            <ReceiptText size={13} />
            Invoice
            <span className="hidden text-bz-text-muted lg:inline">· NPR 125,430</span>
          </button>
          <button
            onClick={onPrint}
            aria-label="Print or export"
            className="flex size-9 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
          >
            <Printer size={14} />
          </button>
          {overflow}
        </div>
      </div>
    </div>
  );
}

function MetaInline({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className={accent ? "text-bz-leaf-deep" : "text-bz-text-muted"} />
      <div className="leading-tight">
        <p className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">{label}</p>
        <p className="text-[12.5px] font-medium text-bz-text">{value}</p>
      </div>
    </div>
  );
}

function IdentityHero({ docNo, onOpenCustomer }: { docNo: string; onOpenCustomer: () => void }) {
  return (
    <section className="px-4 pb-2 pt-6 md:px-6">
      <p className="text-[12px] text-bz-text-muted">Sales Order · Overview</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[30px] font-semibold tracking-tight tabular-nums text-bz-text">
            {docNo}
          </h1>
          <p className="mt-1.5 max-w-[560px] text-[13px] text-bz-text-muted">
            Overview of this sales order — its customer and representative, lifecycle
            status, line items and the documents around it.
          </p>
        </div>
        <CompositeStatus />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-bz-line-soft pt-4">
        <button onClick={onOpenCustomer} className="group flex items-center gap-2.5 text-left">
          <Avatar name={DOC.party} tone="fire" />
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[13.5px] font-semibold text-bz-text">
              <span className="truncate group-hover:underline">{DOC.party}</span>
              <ArrowUpRight size={12} className="shrink-0 text-bz-text-muted" />
            </p>
            <p className="text-[11px] text-bz-text-muted">{DOC.partyMeta}</p>
          </div>
        </button>

        <span className="hidden h-8 w-px bg-bz-line-soft sm:block" />

        <div className="flex items-center gap-2.5">
          <Avatar name={DOC.salesRep} />
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">Sales rep</p>
            <p className="text-[12.5px] font-medium text-bz-text">{DOC.salesRep}</p>
          </div>
        </div>

        <span className="hidden h-8 w-px bg-bz-line-soft md:block" />

        <MetaInline icon={Calendar} label="Ordered" value={DOC.orderDate} />
        <MetaInline
          icon={CalendarClock}
          label="Expected delivery"
          accent
          value={
            <>
              {DOC.expectedDelivery}{" "}
              <span className="font-semibold text-bz-leaf-deep">· {DOC.expectedHint}</span>
            </>
          }
        />
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIFECYCLE BOARD the dominant 3-axis status picture
// ════════════════════════════════════════════════════════════════════════════

function Stages({ nodes }: { nodes: Axis["nodes"] }) {
  const dotFor = (s: string) =>
    s === "done" ? "bg-bz-leaf-deep" : s === "active" ? "bg-bz-fire ring-4 ring-bz-fire/25" : "bg-bz-line";
  return (
    <div>
      <div className="flex items-center">
        {nodes.map((n, i) => (
          <React.Fragment key={n.label}>
            <span className={`size-2.5 shrink-0 rounded-bz-pill ${dotFor(n.state)}`} />
            {i < nodes.length - 1 && (
              <span
                className={`mx-1 h-px flex-1 ${nodes[i + 1].state === "todo" ? "bg-bz-line-soft" : "bg-bz-leaf-deep"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between">
        {nodes.map((n, i) => (
          <span
            key={n.label}
            className={`text-[10px] ${n.state === "active" ? "font-semibold text-bz-text" : "text-bz-text-soft"} ${
              i === 0 ? "text-left" : i === nodes.length - 1 ? "text-right" : "text-center"
            }`}
          >
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function AxisCard({ axis }: { axis: Axis }) {
  const Icon = axis.icon;
  return (
    <div className="flex flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-bz-md bg-bz-paper-warm">
            <Icon size={14} className="text-bz-text" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
            {axis.title}
          </p>
        </div>
        <StatusChip label={axis.status.label} tone={axis.status.tone} />
      </div>

      <div className="mt-5">
        <Stages nodes={axis.nodes} />
      </div>

      {axis.pct !== null && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-1.5 flex-1 overflow-hidden rounded-bz-pill bg-bz-line-soft">
            <div className="h-full bg-bz-leaf-deep" style={{ width: `${axis.pct}%` }} />
          </div>
          <span className="text-[11px] font-semibold tabular-nums text-bz-text">{axis.pct}%</span>
        </div>
      )}

      <p className="mt-4 text-[12px] font-medium tabular-nums text-bz-text">{axis.caption}</p>
      <p className="mt-1 text-[11px] text-bz-text-muted">{axis.hint}</p>
    </div>
  );
}

function LifecycleBoard() {
  return (
    <section className="px-4 py-5 md:px-6">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          Lifecycle
        </h2>
        <span className="text-[11.5px] text-bz-text-muted">
          · where this order stands across approval, fulfilment and billing
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {AXES.map((a) => (
          <AxisCard key={a.key} axis={a} />
        ))}
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
        <Info size={12} className="shrink-0" />
        Next step: deliver the 3 remaining lines, then invoice the delivered balance — billing
        can only ever bill what has been delivered.
      </p>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT-CHAIN RIBBON provenance + downstream trace
// ════════════════════════════════════════════════════════════════════════════

function ChainCard({ node, onOpen }: { node: ChainNodeT; onOpen: (ref: string) => void }) {
  const current = node.kind === "current";
  return (
    <button
      onClick={() => !current && onOpen(node.ref)}
      disabled={current}
      className={`flex min-w-[180px] flex-1 flex-col gap-1.5 rounded-bz-lg border p-3.5 text-left transition-colors ${
        current
          ? "border-bz-fire/60 bg-bz-fire/[0.08]"
          : "cursor-pointer border-bz-line-soft bg-bz-surface hover:border-bz-line hover:bg-bz-paper-warm/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">
          {node.kind === "source" ? "From" : node.kind === "current" ? "This order" : "Downstream"}
        </span>
        {!current && <ArrowUpRight size={12} className="text-bz-text-muted" />}
      </div>
      <p className="text-[12px] text-bz-text-muted">{node.type}</p>
      <p className="text-[14px] font-semibold tabular-nums text-bz-text">{node.ref}</p>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <StatusChip label={node.status.label} tone={node.status.tone} dot={false} />
        <span className="text-[11px] tabular-nums text-bz-text-muted">{node.amount}</span>
      </div>
      <p className="text-[10.5px] tabular-nums text-bz-text-soft">{node.date}</p>
    </button>
  );
}

function ChainRibbon({ onOpen, docNo }: { onOpen: (ref: string) => void; docNo: string }) {
  const chain = CHAIN.map((n) => (n.kind === "current" ? { ...n, ref: docNo } : n));
  return (
    <section className="px-4 pb-5 md:px-6">
      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-section-b/60 p-3">
        <div className="mb-2 flex items-center gap-2 px-1">
          <GitBranch size={13} className="text-bz-text-muted" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
            Document chain
          </p>
        </div>
        {/* desktop: horizontal with connectors · mobile: vertical stepper */}
        <div className="hidden items-stretch gap-2 md:flex">
          {chain.map((n, i) => (
            <React.Fragment key={n.ref}>
              <ChainCard node={n} onOpen={onOpen} />
              {i < chain.length - 1 && (
                <span className="flex items-center text-bz-text-soft">
                  <ChevronRight size={16} />
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex flex-col gap-2 md:hidden">
          {chain.map((n) => (
            <ChainCard key={n.ref} node={n} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LINE ITEMS the substance · desktop table + mobile cards + lot drill-down
// ════════════════════════════════════════════════════════════════════════════

function LotTable({ line }: { line: LineRow }) {
  return (
    <div className="overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <Package size={11} className="text-bz-text-muted" />
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">
          Inventory / lot detail
        </p>
      </div>
      <table className="w-full border-t border-bz-line-soft text-left">
        <thead>
          <tr className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">
            <th className="px-3 py-1.5 font-medium">Batch</th>
            <th className="px-3 py-1.5 font-medium">Serial</th>
            <th className="px-3 py-1.5 font-medium">Expiry</th>
            <th className="px-3 py-1.5 font-medium">Date</th>
            <th className="px-3 py-1.5 text-right font-medium">Qty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bz-line-soft">
          {line.lots.map((l, i) => (
            <tr key={i} className="text-[11px] text-bz-text">
              <td className="px-3 py-1.5 tabular-nums">{l.batch}</td>
              <td className="px-3 py-1.5 tabular-nums text-bz-text-muted">{l.serial}</td>
              <td className="px-3 py-1.5 tabular-nums text-bz-text-muted">{l.expiry}</td>
              <td className="px-3 py-1.5 tabular-nums text-bz-text-muted">{l.date}</td>
              <td className="px-3 py-1.5 text-right tabular-nums font-medium">{l.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const LINE_COLS = [
  { label: "#", align: "left" },
  { label: "Item", align: "left" },
  { label: "Unit", align: "left" },
  { label: "Qty", align: "right" },
  { label: "Rate", align: "right" },
  { label: "Disc", align: "right" },
  { label: "Gross", align: "right" },
  { label: "Tax", align: "left" },
  { label: "Tax amt", align: "right" },
  { label: "Net", align: "right" },
  { label: "", align: "left" },
] as const;

function LineItemsCard({ onOpenItem }: { onOpenItem: (item: string) => void }) {
  const [open, setOpen] = React.useState<Set<number>>(new Set());
  const toggle = (sn: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(sn) ? next.delete(sn) : next.add(sn);
      return next;
    });

  return (
    <section className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex flex-wrap items-baseline gap-2 px-5 pt-5">
        <h2 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          Line items
        </h2>
        <span className="text-[12px] text-bz-text-muted tabular-nums">· {LINES.length} items</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-bz-text-muted">
          <Boxes size={12} /> per-line delivery &amp; billing status shown on each row
        </span>
      </div>

      {/* DESKTOP TABLE */}
      <div className="mt-4 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left" style={{ minWidth: 920 }}>
            <thead>
              <tr className="border-y border-bz-line-soft">
                {LINE_COLS.map((c, i) => (
                  <th
                    key={i}
                    className={`px-3 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted ${
                      c.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bz-line-soft">
              {LINES.map((l) => {
                const isOpen = open.has(l.sn);
                const hasLots = l.lots.length > 0;
                return (
                  <React.Fragment key={l.sn}>
                    <tr className="align-top">
                      <td className="px-3 py-3 text-[11px] tabular-nums text-bz-text-muted">{l.sn}</td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => onOpenItem(l.item)}
                          className="flex items-center gap-1 text-left text-[12.5px] font-medium text-bz-text hover:underline"
                        >
                          {l.item}
                          <ArrowUpRight size={11} className="text-bz-text-muted" />
                        </button>
                        <p className="mt-0.5 text-[10.5px] text-bz-text-muted">
                          {l.code} · {l.description} · {l.priceLevel}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <StatusChip label={l.delivered.label} tone={l.delivered.tone} />
                          <StatusChip label={l.invoiced.label} tone={l.invoiced.tone} />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[11.5px] text-bz-text-muted">{l.unit}</td>
                      <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text">{l.qty}</td>
                      <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text-muted">{l.rate}</td>
                      <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text-muted">{l.disc}</td>
                      <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text-muted">{l.gross}</td>
                      <td className="px-3 py-3 text-[11px] text-bz-text-muted">{l.tax}</td>
                      <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text-muted">{l.taxAmt}</td>
                      <td className="px-3 py-3 text-right text-[12px] font-semibold tabular-nums text-bz-text">{l.net}</td>
                      <td className="px-3 py-3">
                        {hasLots ? (
                          <button
                            onClick={() => toggle(l.sn)}
                            aria-label={isOpen ? "Hide lot detail" : "Show lot detail"}
                            className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
                          >
                            {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        ) : (
                          <span className="block size-6" />
                        )}
                      </td>
                    </tr>
                    {isOpen && hasLots && (
                      <tr>
                        <td />
                        <td colSpan={LINE_COLS.length - 1} className="px-3 pb-4">
                          <LotTable line={l} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS reflow, not horizontal scroll */}
      <div className="mt-4 flex flex-col gap-3 px-4 pb-1 md:hidden">
        {LINES.map((l) => {
          const isOpen = open.has(l.sn);
          const hasLots = l.lots.length > 0;
          return (
            <div key={l.sn} className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 p-4">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => onOpenItem(l.item)} className="text-left">
                  <p className="flex items-center gap-1 text-[13px] font-semibold text-bz-text">
                    {l.item}
                    <ArrowUpRight size={11} className="text-bz-text-muted" />
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-bz-text-muted">
                    {l.code} · {l.priceLevel}
                  </p>
                </button>
                <span className="text-[13px] font-semibold tabular-nums text-bz-text">{l.net}</span>
              </div>
              <p className="mt-1.5 text-[11px] text-bz-text-muted">{l.description}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <StatusChip label={l.delivered.label} tone={l.delivered.tone} />
                <StatusChip label={l.invoiced.label} tone={l.invoiced.tone} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-y-2 border-t border-bz-line-soft pt-3 text-[11px]">
                <KV label="Qty" value={`${l.qty} ${l.unit}`} />
                <KV label="Rate" value={l.rate} />
                <KV label="Gross" value={l.gross} />
                <KV label="Disc" value={l.disc} />
                <KV label="Tax" value={`${l.tax} · ${l.taxAmt}`} />
                <KV label="Net" value={l.net} />
              </div>
              {hasLots && (
                <>
                  <button
                    onClick={() => toggle(l.sn)}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-bz-text-muted hover:text-bz-text"
                  >
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {isOpen ? "Hide" : "Show"} lot detail
                  </button>
                  {isOpen && (
                    <div className="mt-2">
                      <LotTable line={l} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ADVISORY + TOTALS */}
      <div className="mt-2 grid grid-cols-1 gap-4 border-t border-bz-line-soft px-5 py-5 lg:grid-cols-[1fr_360px]">
        <p className="inline-flex max-w-[460px] items-start gap-2 text-[11.5px] leading-relaxed text-bz-text-muted">
          <ShieldCheck size={13} className="mt-0.5 shrink-0" />
          Sales order value is based on agreed customer rates. Changes to this order may require
          re-approval from the sales manager before fulfilment or invoicing can be initiated.
        </p>

        <div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm/40">
          <TotalRow label="Subtotal" value={TOTALS.subtotal} />
          <TotalRow label="Total discount" value={`−${TOTALS.discount}`} muted />
          <TotalRow label="Total VAT / tax" value={TOTALS.vat} />
          <div className="flex items-baseline justify-between border-t border-bz-line-soft px-4 py-3.5">
            <p className="text-[12px] font-medium text-bz-text">Order total</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10.5px] font-semibold text-bz-text-muted">{DOC.currency}</span>
              <span className="text-[22px] font-semibold tabular-nums text-bz-text">{TOTALS.total}</span>
            </div>
          </div>
          {/* invoiced vs outstanding reconciliation */}
          <div className="border-t border-bz-line-soft px-4 py-3">
            <div className="mb-1.5 flex items-center justify-between text-[10.5px] text-bz-text-muted">
              <span>Invoiced</span>
              <span className="tabular-nums">{TOTALS.invoicedPct}% billed</span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-bz-pill bg-bz-line-soft">
              <div className="h-full bg-bz-leaf-deep" style={{ width: `${TOTALS.invoicedPct}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11.5px]">
              <span className="tabular-nums text-bz-text">NPR {TOTALS.invoiced} invoiced</span>
              <span className="tabular-nums font-semibold text-bz-text">NPR {TOTALS.outstanding} outstanding</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">{label}</p>
      <p className="mt-0.5 tabular-nums font-medium text-bz-text">{value}</p>
    </div>
  );
}

function TotalRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <p className="text-[12px] text-bz-text-muted">{label}</p>
      <p className={`text-[13px] tabular-nums ${muted ? "text-bz-text-muted" : "text-bz-text"}`}>{value}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE RAIL quiet read-only context
// ════════════════════════════════════════════════════════════════════════════

function RailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={13} className="text-bz-text-muted" />
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">{title}</p>
      </div>
      {children}
    </div>
  );
}

function RailRow({
  label,
  value,
  meta,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  meta?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-bz-line-soft py-2.5 first:border-t-0 first:pt-0">
      <p className="text-[11.5px] text-bz-text-muted">{label}</p>
      <div className="text-right">
        <p className={`text-[12px] font-medium ${accent ? "text-bz-leaf-deep" : "text-bz-text"}`}>{value}</p>
        {meta && <p className="text-[10px] text-bz-text-soft">{meta}</p>}
      </div>
    </div>
  );
}

function Collapsible({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-5 py-4 text-left"
      >
        <Icon size={13} className="text-bz-text-muted" />
        <span className="flex-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          {title}
        </span>
        <ChevronDown size={13} className={`text-bz-text-muted transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function ReferenceRail({ onOpen }: { onOpen: (ref: string) => void }) {
  return (
    <aside className="flex flex-col gap-3">
      <RailCard title="Customer" icon={User}>
        <button onClick={() => onOpen(DOC.party)} className="group mb-3 flex w-full items-center gap-2.5 text-left">
          <Avatar name={DOC.party} tone="fire" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[13px] font-semibold text-bz-text">
              <span className="truncate group-hover:underline">{DOC.party}</span>
              <ArrowUpRight size={11} className="shrink-0 text-bz-text-muted" />
            </p>
            <p className="text-[10.5px] text-bz-text-muted">{DOC.partyMeta}</p>
          </div>
        </button>
        <RailRow label="PAN / Tax ID" value={DOC.billing.pan} />
        <RailRow label="Payment term" value={DOC.billing.term} meta={`Due ${DOC.billing.dueDate}`} />
      </RailCard>

      <RailCard title="Logistics & dates" icon={Truck}>
        <RailRow label="Order date" value={DOC.orderDate} meta={DOC.orderDateNep} />
        <RailRow label="Expected delivery" value={DOC.expectedDelivery} meta={DOC.expectedHint} accent />
        <RailRow label="Fulfilment location" value={DOC.location} meta={DOC.locationMeta} />
      </RailCard>

      <RailCard title="Provenance" icon={FileText}>
        <button
          onClick={() => onOpen(DOC.source.ref)}
          className="flex w-full items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2.5 text-left hover:bg-bz-paper-warm"
        >
          <FileText size={14} className="shrink-0 text-bz-text-muted" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">
              Converted from {DOC.source.type.toLowerCase()}
            </p>
            <p className="text-[12.5px] font-semibold tabular-nums text-bz-text">{DOC.source.ref}</p>
          </div>
          <ArrowUpRight size={12} className="shrink-0 text-bz-text-muted" />
        </button>
      </RailCard>

      <RailCard title="Organisation" icon={Building2}>
        <RailRow label="Subsidiary" value="NP-02" meta="Bizak Nepal Pokhara" />
        <RailRow label="Currency" value={DOC.currency} meta={DOC.currencyMeta} />
      </RailCard>

      <Collapsible title="Classification" icon={Tag}>
        <div>
          {CLASSIFICATION.map((c) => (
            <RailRow key={c.label} label={c.label} value={c.value} meta={c.meta || undefined} />
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Custom fields" icon={Layers}>
        <div>
          {CUSTOM_FIELDS.map((c) => (
            <RailRow key={c.label} label={c.label} value={c.value} />
          ))}
        </div>
      </Collapsible>

      <RailCard title="Memo" icon={StickyNote}>
        <p className="text-[12px] leading-relaxed text-bz-text">{DOC.memo}</p>
      </RailCard>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LOWER TABBED PANEL related / activity / billing / files / audit
// ════════════════════════════════════════════════════════════════════════════

const TABS = [
  { key: "related", label: "Related records", icon: GitBranch },
  { key: "activity", label: "Activity log", icon: History },
  { key: "billing", label: "Billing details", icon: ReceiptText },
  { key: "files", label: "Files", icon: Paperclip },
  { key: "audit", label: "System & audit", icon: WorkflowIcon },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function LowerPanel({ onOpen, docNo }: { onOpen: (ref: string) => void; docNo: string }) {
  const [tab, setTab] = React.useState<TabKey>("related");
  return (
    <section className="px-4 pb-8 md:px-6">
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <div className="flex flex-wrap gap-0.5 border-b border-bz-line-soft px-3 md:px-4">
          {TABS.map((t) => {
            const active = t.key === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-3 text-[12px] ${
                  active ? "font-semibold text-bz-text" : "text-bz-text-muted hover:text-bz-text"
                }`}
              >
                <Icon size={13} />
                {t.label}
                {active && (
                  <span className="absolute -bottom-px left-3 right-3 h-[2px] rounded-bz-pill bg-bz-text" />
                )}
              </button>
            );
          })}
        </div>
        <div className="p-4 md:p-5">
          {tab === "related" && <RelatedTab onOpen={onOpen} docNo={docNo} />}
          {tab === "activity" && <ActivityTab />}
          {tab === "billing" && <BillingTab />}
          {tab === "files" && <FilesTab onOpen={onOpen} />}
          {tab === "audit" && <AuditTab />}
        </div>
      </div>
    </section>
  );
}

function RelatedTab({ onOpen, docNo }: { onOpen: (ref: string) => void; docNo: string }) {
  const [filter, setFilter] = React.useState<(typeof REL_FILTERS)[number]>("All");
  const rows = RELATED.filter((r) => filter === "All" || r.type === filter).map((r) =>
    r.current ? { ...r, doc: docNo } : r,
  );
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Filter size={12} className="mr-0.5 text-bz-text-muted" />
        {REL_FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-bz-sm px-2.5 py-1 text-[11px] font-medium ${
                active
                  ? "bg-bz-olive text-bz-text-on-dark"
                  : "border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth: 640 }}>
          <thead>
            <tr className="border-y border-bz-line-soft text-[10px] uppercase tracking-[0.06em] text-bz-text-muted">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Document</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
              <th className="w-8 px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-bz-line-soft">
            {rows.map((r) => (
              <tr
                key={r.doc}
                className={`${r.current ? "bg-bz-fire/[0.05]" : "hover:bg-bz-paper-warm/50"} ${r.current ? "" : "cursor-pointer"}`}
                onClick={() => !r.current && onOpen(r.doc)}
              >
                <td className="px-3 py-2.5 text-[11px] tabular-nums text-bz-text-muted">{r.date}</td>
                <td className="px-3 py-2.5 text-[11.5px] text-bz-text">{r.type}</td>
                <td className="px-3 py-2.5 text-[11.5px] font-semibold tabular-nums text-bz-text">
                  {r.doc}
                  {r.current && <span className="ml-1.5 text-[10px] font-medium text-bz-text-muted">· this order</span>}
                </td>
                <td className="px-3 py-2.5">
                  <StatusChip label={r.status.label} tone={r.status.tone} dot={false} />
                </td>
                <td className="px-3 py-2.5 text-right text-[11.5px] tabular-nums text-bz-text">{r.amount}</td>
                <td className="px-3 py-2.5">
                  {!r.current && <ArrowUpRight size={12} className="text-bz-text-muted" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="flex flex-col gap-3">
      {ACTIVITY.map((a, i) => (
        <div key={i} className="flex gap-3">
          <span
            className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md ${
              a.dir === "inbound" ? "bg-bz-fire/[0.18]" : "bg-bz-paper-warm"
            }`}
          >
            {a.dir === "inbound" ? (
              <ArrowDownLeft size={13} className="text-bz-leaf-deep" />
            ) : (
              <Send size={12} className="text-bz-text-muted" />
            )}
          </span>
          <div className="min-w-0 flex-1 border-b border-bz-line-soft pb-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-bz-text">{a.title}</p>
              <p className="text-[10.5px] tabular-nums text-bz-text-soft">
                {a.date} · {a.time}
              </p>
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bz-text-muted">{a.memo}</p>
          </div>
        </div>
      ))}
      <button className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-bz-md border border-dashed border-bz-line-soft px-3 py-2 text-[11.5px] font-medium text-bz-text-muted hover:border-bz-line hover:text-bz-text">
        <StickyNote size={12} /> Add note
      </button>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-1 md:grid-cols-2">
      <div>
        <RailRow label="Tax ID (PAN No.)" value={DOC.billing.pan} />
        <RailRow label="Payment term" value={DOC.billing.term} />
        <RailRow label="Due date" value={DOC.billing.dueDate} />
      </div>
      <div>
        <RailRow label="Billing address" value={<span className="font-normal">{DOC.billing.address}</span>} />
        <RailRow label="Invoiced to date" value={`NPR ${TOTALS.invoiced}`} />
        <RailRow label="Outstanding" value={`NPR ${TOTALS.outstanding}`} accent />
      </div>
    </div>
  );
}

function FilesTab({ onOpen }: { onOpen: (ref: string) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      {FILES.map((f) => (
        <div
          key={f.name}
          className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 px-3 py-2.5"
        >
          <FileText size={15} className="shrink-0 text-bz-text-muted" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-bz-text">{f.name}</p>
            <p className="text-[10.5px] tabular-nums text-bz-text-muted">
              {f.folder} · {f.size}
            </p>
          </div>
          <button
            onClick={() => onOpen(f.name)}
            aria-label="Download"
            className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface hover:text-bz-text"
          >
            <Download size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function AuditSub({ title }: { title: string }) {
  return (
    <p className="mb-2 mt-4 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted first:mt-0">
      {title}
    </p>
  );
}

function AuditTab() {
  return (
    <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
      <div>
        <AuditSub title="System notes" />
        {AUDIT.systemNotes.map((n) => (
          <RailRow key={n.label} label={n.label} value={n.value} meta={`by ${n.by}`} />
        ))}

        <AuditSub title="Active workflows" />
        {AUDIT.activeWorkflows.map((w) => (
          <div key={w.name} className="flex items-start justify-between gap-3 border-t border-bz-line-soft py-2.5">
            <div>
              <p className="text-[12px] font-medium text-bz-text">{w.name}</p>
              <p className="text-[10.5px] text-bz-text-muted">{w.detail}</p>
            </div>
            <StatusChip label={w.state.label} tone={w.state.tone} />
          </div>
        ))}
      </div>
      <div>
        <AuditSub title="Workflow history" />
        {AUDIT.workflowHistory.map((h, i) => (
          <div key={i} className="flex items-start justify-between gap-3 border-t border-bz-line-soft py-2.5 first:border-t-0">
            <div>
              <p className="text-[12px] font-medium text-bz-text">{h.event}</p>
              <p className="text-[10.5px] tabular-nums text-bz-text-muted">
                {h.date} · by {h.by}
              </p>
            </div>
            <StatusChip label={h.result.label} tone={h.result.tone} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERFLOW MENU normal group + separated destructive group
// ════════════════════════════════════════════════════════════════════════════

function OverflowMenu({
  editHref,
  onDuplicate,
  onCancel,
}: {
  editHref: string;
  onDuplicate: () => void;
  onCancel: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        className={`flex size-9 items-center justify-center rounded-bz-md border text-bz-text ${
          open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:bg-bz-paper-warm"
        }`}
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-[42px] z-30 w-60 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <Link
            to={editHref}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm"
          >
            <Pencil size={13} className="text-bz-text" />
            <span className="text-[12px] font-medium text-bz-text">Edit order</span>
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              onDuplicate();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm"
          >
            <Copy size={13} className="text-bz-text" />
            <span className="text-[12px] font-medium text-bz-text">Duplicate</span>
          </button>
          <MenuDisabled
            icon={Lock}
            label="Close order"
            reason="Available once fully delivered & invoiced"
          />

          <div className="my-1 h-px bg-bz-line-soft" />
          <p className="px-3.5 pb-1 pt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">
            Danger zone
          </p>
          <button
            onClick={() => {
              setOpen(false);
              onCancel();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FBE5E2]"
          >
            <Ban size={13} className="text-[#9A2E29]" />
            <span className="text-[12px] font-medium text-[#9A2E29]">Cancel order</span>
          </button>
          <MenuDisabled
            icon={Trash2}
            label="Delete order"
            reason="Approved orders with deliveries can't be deleted"
            danger
          />
        </div>
      )}
    </div>
  );
}

function MenuDisabled({
  icon: Icon,
  label,
  reason,
  danger,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  reason: string;
  danger?: boolean;
}) {
  return (
    <div className="flex cursor-not-allowed items-start gap-2.5 px-3.5 py-2.5 opacity-55" title={reason}>
      <Icon size={13} className={danger ? "text-[#9A2E29]" : "text-bz-text-muted"} />
      <div>
        <p className={`text-[12px] font-medium ${danger ? "text-[#9A2E29]" : "text-bz-text"}`}>{label}</p>
        <p className="text-[10px] text-bz-text-soft">{reason}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG deliberate handling for the destructive Cancel
// ════════════════════════════════════════════════════════════════════════════

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  docNo,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  docNo: string;
}) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-24">
      <div onClick={onClose} className="absolute inset-0 bg-bz-olive/35 backdrop-blur-[1px]" aria-hidden />
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <div className="flex items-center justify-between border-b border-bz-line-soft bg-[#FBE5E2] px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#9A2E29]" />
            <p className="text-[13px] font-semibold text-[#9A2E29]">Cancel sales order?</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-bz-sm border border-[#E9C4BF] bg-bz-surface text-[#9A2E29] hover:bg-[#FBE5E2]"
          >
            <X size={11} />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-[12.5px] leading-relaxed text-bz-text">
            Cancelling <span className="font-semibold tabular-nums">{docNo}</span> reverses the stock
            movements from delivery <span className="font-semibold">DLV-0788</span> and resets the
            source estimate <span className="font-semibold">EST-2241</span> back to open. Already-invoiced
            amounts (NPR {TOTALS.invoiced}) must be credited separately. This can't be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-4 py-3">
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
          >
            Keep order
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3.5 text-[12px] font-semibold text-white hover:opacity-95"
          >
            <Ban size={12} /> Cancel order
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST lightweight action feedback
// ════════════════════════════════════════════════════════════════════════════

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className="flex size-7 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18]">
          <Check size={13} className="text-bz-leaf-deep" />
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SHELL self-contained (Sidebar + TopBar), no dependency on the list page
// ════════════════════════════════════════════════════════════════════════════

function Breadcrumb({ docNo }: { docNo: string }) {
  return (
    <>
      <span className="text-bz-text-muted">Sales &amp; CRM</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <Link to="/design/sales-order-list" className="text-bz-text-muted hover:text-bz-text">
        Sales Order
      </Link>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold tabular-nums text-bz-text">{docNo}</span>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function SalesOrderDetailDesignPage() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const docNo = params.id ?? "SO-1047";

  const [toast, setToast] = React.useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (msg: string) => setToast(msg);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-bz-section-b text-bz-text">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar breadcrumb={<Breadcrumb docNo={docNo} />} />
        <main className="flex-1 overflow-y-auto bg-bz-section-b">
          <StickyActionBar
            docNo={docNo}
            onDeliver={() => notify("Opening the delivery flow for the 3 remaining lines…")}
            onInvoice={() => notify("Opening the invoice flow for the delivered balance (NPR 125,430)…")}
            onPrint={() => notify(`Preparing a shareable copy of ${docNo}…`)}
            overflow={
              <OverflowMenu
                editHref={`/design/sales-order-list/${docNo}/edit`}
                onDuplicate={() => notify(`${docNo} duplicated into a new draft.`)}
                onCancel={() => setCancelOpen(true)}
              />
            }
          />

          <IdentityHero docNo={docNo} onOpenCustomer={() => notify(`Opening customer ${DOC.party}…`)} />

          <LifecycleBoard />

          <ChainRibbon onOpen={(ref) => notify(`Opening ${ref}…`)} docNo={docNo} />

          <div className="grid grid-cols-1 gap-3 px-4 pb-2 md:px-6 lg:grid-cols-[1fr_340px]">
            <LineItemsCard onOpenItem={(item) => notify(`Opening item ${item}…`)} />
            <ReferenceRail onOpen={(ref) => notify(`Opening ${ref}…`)} />
          </div>

          <LowerPanel onOpen={(ref) => notify(`Opening ${ref}…`)} docNo={docNo} />
        </main>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        docNo={docNo}
        onConfirm={() => {
          setCancelOpen(false);
          navigate("/design/sales-order-list", { state: { toast: `${docNo} cancelled.` } });
        }}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
