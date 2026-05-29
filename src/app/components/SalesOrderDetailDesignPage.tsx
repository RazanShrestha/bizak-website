import * as React from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Check,
  // lifecycle / status
  ShieldCheck,
  Truck,
  ReceiptText,
  Activity,
  AlertTriangle,
  Info,
  Lock,
  // reference
  Tag,
  StickyNote,
  // body / tabs
  Package,
  FileText,
  Paperclip,
  GitBranch,
  Filter,
  Download,
  Printer,
  Pencil,
  Copy,
  Trash2,
  Ban,
  Send,
} from "lucide-react";
import { Sidebar } from "./DesignSidebar";
import { TopBar } from "./DesignTopBar";

// ════════════════════════════════════════════════════════════════════════════
// SALES ORDER · DETAIL / OVERVIEW (read-only) — minimal redesign
//
// Principle: show each fact ONCE. A calm header (number + one status + the
// contextual action), the line items as the centre of gravity, a quiet rail
// for who/where/notes, and everything secondary (lifecycle detail, the
// document chain, activity, billing, files) folded into one tab strip.
//
// Showcased state SO-1047 · Apex Manufacturing — Approved, Partially Delivered
// (55% by value), Partially Invoiced (NPR 641,840 of 1,386,380). All numbers
// reconcile across the line table, totals and the Lifecycle tab.
// ════════════════════════════════════════════════════════════════════════════

type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";

const DOC = {
  party: "Apex Manufacturing Pvt Ltd",
  partyMeta: "C-1029 · Industrial · Pokhara",
  salesRep: "Priya Maharjan",
  salesRepMeta: "NP-02 · Pokhara office",
  status: { label: "Partially delivered & invoiced", tone: "partial" as Tone },
  orderDate: "May 17, 2026",
  orderDateNep: "2083/02/04",
  expectedDelivery: "May 30, 2026",
  expectedHint: "in 1 day",
  location: "Pokhara Warehouse 02",
  subsidiary: "NP-02 · Bizak Nepal Pokhara",
  currency: "NPR",
  source: { type: "Estimate", ref: "EST-2241" },
  memo:
    "Bulk order — phase-2 install for Apex's Bharatpur plant. Confirm crane availability before scheduling the remaining deliveries.",
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
  taxCode: string;
  taxRate: string;
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
    taxCode: "VAT",
    taxRate: "13%",
    taxAmt: "28,860",
    net: "250,860",
    delivered: { label: "6 of 12 delivered", tone: "partial" },
    invoiced: { label: "Not invoiced", tone: "pending" },
    lots: [{ batch: "BC-A220-04", serial: "—", expiry: "—", date: "May 22, 2026", qty: "6 pcs" }],
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
    taxCode: "VAT",
    taxRate: "13%",
    taxAmt: "73,840",
    net: "641,840",
    delivered: { label: "Delivered", tone: "positive" },
    invoiced: { label: "Invoiced", tone: "positive" },
    lots: [{ batch: "HP7-B12", serial: "SN-7741 → SN-7744", expiry: "—", date: "May 22, 2026", qty: "4 pcs" }],
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
    taxCode: "VAT",
    taxRate: "13%",
    taxAmt: "43,680",
    net: "379,680",
    delivered: { label: "Awaiting delivery", tone: "pending" },
    invoiced: { label: "Not invoiced", tone: "pending" },
    lots: [{ batch: "MPS-B30", serial: "—", expiry: "—", date: "Reserved", qty: "30 pkg" }],
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
    taxCode: "EXM",
    taxRate: "0%",
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
  pct: number | null;
  caption: string;
  hint: string;
  next?: boolean;
};

const AXES: Axis[] = [
  {
    key: "approval",
    title: "Approval",
    icon: ShieldCheck,
    status: { label: "Approved", tone: "positive" },
    pct: 100,
    caption: "Approved by Ramesh Adhikari · May 17, 2026",
    hint: "Fulfilment unlocked.",
  },
  {
    key: "fulfilment",
    title: "Fulfilment",
    icon: Truck,
    status: { label: "Partially delivered", tone: "partial" },
    pct: 55,
    caption: "NPR 767,270 of 1,386,380 · 2 of 4 lines",
    hint: "3 lines still awaiting delivery.",
    next: true,
  },
  {
    key: "billing",
    title: "Billing",
    icon: ReceiptText,
    status: { label: "Partially invoiced", tone: "partial" },
    pct: 46,
    caption: "NPR 641,840 invoiced · NPR 744,540 outstanding",
    hint: "Invoice the delivered, un-billed balance (NPR 125,430).",
  },
];

const RELATED = [
  { date: "May 12, 2026", type: "Estimate", doc: "EST-2241", status: { label: "Converted", tone: "neutral" as Tone }, amount: "NPR 1,240,000", current: false },
  { date: "May 17, 2026", type: "Sales Order", doc: "SO-1047", status: { label: "Approved", tone: "positive" as Tone }, amount: "NPR 1,386,380", current: true },
  { date: "May 22, 2026", type: "Delivery", doc: "DLV-0788", status: { label: "Delivered", tone: "positive" as Tone }, amount: "NPR 679,000", current: false },
  { date: "May 23, 2026", type: "Invoice", doc: "INV-2046", status: { label: "Open", tone: "partial" as Tone }, amount: "NPR 641,840", current: false },
  { date: "May 26, 2026", type: "Payment", doc: "RCP-1190", status: { label: "Received", tone: "positive" as Tone }, amount: "NPR 300,000", current: false },
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
  { label: "Department", value: "Sales — Pokhara" },
  { label: "Class", value: "Industrial" },
  { label: "Project", value: "APEX-PH2" },
  { label: "Partner", value: "Apex Group" },
];

const CUSTOM_FIELDS = [
  { label: "Plant", value: "Bharatpur · Industrial Park" },
  { label: "Commissioning by", value: "Engineering — Phase 2" },
  { label: "Reference quote", value: "QTE-APX-0188" },
  { label: "Crane required", value: "Yes" },
];

const AUDIT = {
  systemNotes: [
    { label: "Created", value: "May 17, 2026 · 2:05 PM · Priya Maharjan" },
    { label: "Last modified", value: "May 23, 2026 · 11:02 AM · Priya Maharjan" },
  ],
  workflowHistory: [
    { date: "May 17, 2026 · 4:30 PM", event: "Approval workflow completed", by: "Ramesh Adhikari", result: { label: "Approved", tone: "positive" as Tone } },
    { date: "May 17, 2026 · 2:40 PM", event: "Submitted for approval", by: "Priya Maharjan", result: { label: "Pending", tone: "pending" as Tone } },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
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
    <span className={`inline-flex items-center gap-1.5 rounded-bz-sm px-2 py-0.5 text-[11px] font-medium ${CHIP_BG[tone]}`}>
      {dot && <span className={`size-1.5 rounded-bz-pill ${DOT_BG[tone]}`} />}
      {label}
    </span>
  );
}

function Avatar({ name, tone = "neutral" }: { name: string; tone?: "fire" | "neutral" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-bz-pill text-[12px] font-bold text-bz-text ${tone === "fire" ? "bg-bz-fire/[0.18]" : "bg-bz-paper-warm"}`}>
      {initials}
    </span>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">{label}</p>
      <p className="mt-0.5 text-[12.5px] tabular-nums text-bz-text">{value}</p>
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-bz-text-muted">{children}</p>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER  number (once) · one status · contextual actions
// ════════════════════════════════════════════════════════════════════════════

function DetailHeader({
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
    <header className="border-b border-bz-line-soft bg-bz-paper px-4 pb-6 pt-6 md:px-8">
      <Link
        to="/design/sales-order-list"
        className="inline-flex items-center gap-1 text-[12px] text-bz-text-muted hover:text-bz-text"
      >
        <ChevronLeft size={13} /> Back to Sales Order
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] font-semibold tracking-tight tabular-nums text-bz-text">{docNo}</h1>
            <StatusChip label={DOC.status.label} tone={DOC.status.tone} />
          </div>
          <p className="mt-1.5 text-[13px] text-bz-text-muted">
            Sales order overview — line items, lifecycle and the records around it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onDeliver}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
          >
            <Truck size={13} /> Create Delivery
          </button>
          <button
            onClick={onInvoice}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm"
          >
            <ReceiptText size={13} /> Create Invoice
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
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LINE ITEMS  minimal table · expand reveals full breakdown + lot detail
// ════════════════════════════════════════════════════════════════════════════

function LineBreakdown({ line }: { line: LineRow }) {
  return (
    <div className="rounded-bz-md bg-bz-paper-warm/40 p-4">
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        <KV label="Price level" value={line.priceLevel} />
        <KV label="Gross" value={line.gross} />
        <KV label="Tax code" value={`${line.taxCode} · ${line.taxRate}`} />
        <KV label="Tax amount" value={line.taxAmt} />
        <KV label="Net" value={line.net} />
      </div>
      {line.lots.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <Package size={11} className="text-bz-text-muted" />
            <CardLabel>Inventory / lot detail</CardLabel>
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
              {line.lots.map((l) => (
                <tr key={l.batch} className="text-[11px] text-bz-text">
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
      )}
    </div>
  );
}

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
      <div className="flex items-baseline gap-2 px-5 pt-5">
        <CardLabel>Line items</CardLabel>
        <span className="text-[11.5px] text-bz-text-muted tabular-nums">· {LINES.length}</span>
      </div>

      {/* desktop table */}
      <div className="mt-3 hidden md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-y border-bz-line-soft text-[10px] uppercase tracking-[0.06em] text-bz-text-muted">
              <th className="px-5 py-2 font-medium">Item</th>
              <th className="px-3 py-2 text-right font-medium">Qty</th>
              <th className="px-3 py-2 text-right font-medium">Rate</th>
              <th className="px-3 py-2 text-right font-medium">Disc</th>
              <th className="px-3 py-2 text-right font-medium">Tax</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
              <th className="w-10 px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-bz-line-soft">
            {LINES.map((l) => {
              const isOpen = open.has(l.sn);
              return (
                <React.Fragment key={l.sn}>
                  <tr className="align-top">
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => onOpenItem(l.item)}
                        className="flex items-center gap-1 text-left text-[13px] font-medium text-bz-text hover:underline"
                      >
                        {l.item}
                        <ArrowUpRight size={11} className="text-bz-text-muted" />
                      </button>
                      <p className="mt-0.5 text-[11px] text-bz-text-muted">{l.code} · {l.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <StatusChip label={l.delivered.label} tone={l.delivered.tone} />
                        <StatusChip label={l.invoiced.label} tone={l.invoiced.tone} />
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right text-[12px] tabular-nums text-bz-text">{l.qty} <span className="text-bz-text-soft">{l.unit}</span></td>
                    <td className="px-3 py-3.5 text-right text-[12px] tabular-nums text-bz-text-muted">{l.rate}</td>
                    <td className="px-3 py-3.5 text-right text-[12px] tabular-nums text-bz-text-muted">{l.disc}</td>
                    <td className="px-3 py-3.5 text-right text-[12px] tabular-nums text-bz-text-muted">{l.taxRate}</td>
                    <td className="px-3 py-3.5 text-right text-[13px] font-semibold tabular-nums text-bz-text">{l.net}</td>
                    <td className="px-3 py-3.5">
                      <button
                        onClick={() => toggle(l.sn)}
                        aria-label={isOpen ? "Hide breakdown" : "Show breakdown"}
                        className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
                      >
                        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={7} className="px-5 pb-4">
                        <LineBreakdown line={l} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="mt-3 flex flex-col gap-2.5 px-4 md:hidden">
        {LINES.map((l) => {
          const isOpen = open.has(l.sn);
          return (
            <div key={l.sn} className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 p-4">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => onOpenItem(l.item)} className="text-left">
                  <p className="flex items-center gap-1 text-[13px] font-semibold text-bz-text">
                    {l.item}
                    <ArrowUpRight size={11} className="text-bz-text-muted" />
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-bz-text-muted">{l.code}</p>
                </button>
                <span className="text-[13px] font-semibold tabular-nums text-bz-text">{l.net}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <StatusChip label={l.delivered.label} tone={l.delivered.tone} />
                <StatusChip label={l.invoiced.label} tone={l.invoiced.tone} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-bz-line-soft pt-3 text-[11.5px] tabular-nums text-bz-text-muted">
                <span>{l.qty} {l.unit} × {l.rate}</span>
                <button onClick={() => toggle(l.sn)} className="inline-flex items-center gap-1 font-medium text-bz-text-muted hover:text-bz-text">
                  {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Detail
                </button>
              </div>
              {isOpen && <div className="mt-2"><LineBreakdown line={l} /></div>}
            </div>
          );
        })}
      </div>

      {/* advisory + totals */}
      <div className="mt-2 grid grid-cols-1 gap-4 border-t border-bz-line-soft px-5 py-5 lg:grid-cols-[1fr_300px]">
        <p className="inline-flex max-w-[440px] items-start gap-2 text-[11.5px] leading-relaxed text-bz-text-muted">
          <Info size={13} className="mt-0.5 shrink-0" />
          Value is based on agreed customer rates. Changes may require re-approval before fulfilment
          or invoicing.
        </p>
        <div className="space-y-2.5">
          <TotalRow label="Subtotal" value={TOTALS.subtotal} />
          <TotalRow label="Discount" value={`−${TOTALS.discount}`} muted />
          <TotalRow label="VAT / tax" value={TOTALS.vat} />
          <div className="flex items-baseline justify-between border-t border-bz-line-soft pt-3">
            <p className="text-[12px] font-medium text-bz-text">Order total</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10.5px] font-semibold text-bz-text-muted">{DOC.currency}</span>
              <span className="text-[21px] font-semibold tabular-nums text-bz-text">{TOTALS.total}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TotalRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[12px] text-bz-text-muted">{label}</p>
      <p className={`text-[13px] tabular-nums ${muted ? "text-bz-text-muted" : "text-bz-text"}`}>{value}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RAIL  parties · details · memo · more (each fact once)
// ════════════════════════════════════════════════════════════════════════════

function RailCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5 ${className}`}>{children}</div>;
}

function RailRow({ label, value, accent, onClick }: { label: string; value: React.ReactNode; accent?: boolean; onClick?: () => void }) {
  const valueEl = (
    <span className={`text-[12.5px] font-medium ${accent ? "text-bz-leaf-deep" : "text-bz-text"}`}>{value}</span>
  );
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line-soft py-2.5 first:border-t-0 first:pt-0">
      <span className="text-[11.5px] text-bz-text-muted">{label}</span>
      {onClick ? (
        <button onClick={onClick} className="inline-flex items-center gap-1 hover:underline">
          {valueEl}
          <ArrowUpRight size={11} className="text-bz-text-muted" />
        </button>
      ) : (
        valueEl
      )}
    </div>
  );
}

function ReferenceRail({ onOpen }: { onOpen: (ref: string) => void }) {
  const [more, setMore] = React.useState(false);
  return (
    <aside className="flex flex-col gap-3">
      <RailCard>
        <CardLabel>Parties</CardLabel>
        <button onClick={() => onOpen(DOC.party)} className="group mt-3 flex w-full items-center gap-3 text-left">
          <Avatar name={DOC.party} tone="fire" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[13px] font-semibold text-bz-text">
              <span className="truncate group-hover:underline">{DOC.party}</span>
              <ArrowUpRight size={11} className="shrink-0 text-bz-text-muted" />
            </p>
            <p className="text-[10.5px] text-bz-text-muted">{DOC.partyMeta}</p>
          </div>
        </button>
        <div className="mt-3 flex items-center gap-3 border-t border-bz-line-soft pt-3">
          <Avatar name={DOC.salesRep} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">Sales rep</p>
            <p className="text-[12.5px] font-medium text-bz-text">{DOC.salesRep}</p>
            <p className="text-[10.5px] text-bz-text-muted">{DOC.salesRepMeta}</p>
          </div>
        </div>
      </RailCard>

      <RailCard>
        <CardLabel>Details</CardLabel>
        <div className="mt-3">
          <RailRow label="Order date" value={DOC.orderDate} />
          <RailRow label="Expected delivery" value={<>{DOC.expectedDelivery} · {DOC.expectedHint}</>} accent />
          <RailRow label="Location" value={DOC.location} />
          <RailRow label="Subsidiary" value="NP-02" />
          <RailRow label="Currency" value={`${DOC.currency} · base`} />
          <RailRow label="Source" value={DOC.source.ref} onClick={() => onOpen(DOC.source.ref)} />
        </div>
      </RailCard>

      <RailCard>
        <CardLabel>Memo</CardLabel>
        <p className="mt-2.5 text-[12px] leading-relaxed text-bz-text">{DOC.memo}</p>
      </RailCard>

      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <button onClick={() => setMore((v) => !v)} className="flex w-full items-center gap-2 px-5 py-4 text-left">
          <Tag size={13} className="text-bz-text-muted" />
          <span className="flex-1"><CardLabel>Classification &amp; custom fields</CardLabel></span>
          <ChevronDown size={13} className={`text-bz-text-muted transition-transform ${more ? "" : "-rotate-90"}`} />
        </button>
        {more && (
          <div className="px-5 pb-5">
            {[...CLASSIFICATION, ...CUSTOM_FIELDS].map((c) => (
              <RailRow key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TABBED PANEL  lifecycle · related · activity · billing · files
// ════════════════════════════════════════════════════════════════════════════

const TABS = [
  { key: "lifecycle", label: "Lifecycle", icon: Activity },
  { key: "related", label: "Related records", icon: GitBranch },
  { key: "activity", label: "Activity", icon: Send },
  { key: "billing", label: "Billing", icon: ReceiptText },
  { key: "files", label: "Files", icon: Paperclip },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function LowerPanel({ onOpen, docNo }: { onOpen: (ref: string) => void; docNo: string }) {
  const [tab, setTab] = React.useState<TabKey>("lifecycle");
  return (
    <section className="px-4 pb-8 md:px-8">
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
                {active && <span className="absolute -bottom-px left-3 right-3 h-[2px] rounded-bz-pill bg-bz-text" />}
              </button>
            );
          })}
        </div>
        <div className="p-5 md:p-6">
          {tab === "lifecycle" && <LifecycleTab />}
          {tab === "related" && <RelatedTab onOpen={onOpen} docNo={docNo} />}
          {tab === "activity" && <ActivityTab />}
          {tab === "billing" && <BillingTab />}
          {tab === "files" && <FilesTab onOpen={onOpen} />}
        </div>
      </div>
    </section>
  );
}

function LifecycleTab() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        {AXES.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.key}
              className="flex flex-col gap-3 border-b border-bz-line-soft py-4 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-5"
            >
              <div className="flex items-center gap-2.5 sm:w-44 sm:shrink-0">
                <span className="flex size-7 items-center justify-center rounded-bz-md bg-bz-paper-warm">
                  <Icon size={14} className="text-bz-text" />
                </span>
                <span className="text-[13px] font-semibold text-bz-text">{a.title}</span>
                {a.next && (
                  <span className="rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-bz-text">
                    Next
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-1.5 flex-1 overflow-hidden rounded-bz-pill bg-bz-line-soft">
                    <div className="h-full bg-bz-leaf-deep" style={{ width: `${a.pct}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums text-bz-text">{a.pct}%</span>
                </div>
                <p className="mt-2 text-[12px] tabular-nums text-bz-text">{a.caption}</p>
                <p className="text-[11px] text-bz-text-muted">{a.hint}</p>
              </div>
              <StatusChip label={a.status.label} tone={a.status.tone} />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <CardLabel>Workflow history</CardLabel>
          <div className="mt-3">
            {AUDIT.workflowHistory.map((h) => (
              <div key={h.event} className="flex items-start justify-between gap-3 border-t border-bz-line-soft py-2.5 first:border-t-0 first:pt-0">
                <div>
                  <p className="text-[12px] font-medium text-bz-text">{h.event}</p>
                  <p className="text-[10.5px] tabular-nums text-bz-text-muted">{h.date} · {h.by}</p>
                </div>
                <StatusChip label={h.result.label} tone={h.result.tone} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <CardLabel>System notes</CardLabel>
          <div className="mt-3">
            {AUDIT.systemNotes.map((n) => (
              <div key={n.label} className="flex items-center justify-between gap-3 border-t border-bz-line-soft py-2.5 first:border-t-0 first:pt-0">
                <span className="text-[11.5px] text-bz-text-muted">{n.label}</span>
                <span className="text-[11.5px] tabular-nums text-bz-text">{n.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedTab({ onOpen, docNo }: { onOpen: (ref: string) => void; docNo: string }) {
  const [filter, setFilter] = React.useState<(typeof REL_FILTERS)[number]>("All");
  const rows = RELATED.filter((r) => filter === "All" || r.type === filter).map((r) =>
    r.current ? { ...r, doc: docNo } : r,
  );
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Filter size={12} className="mr-0.5 text-bz-text-muted" />
        {REL_FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-bz-sm px-2.5 py-1 text-[11px] font-medium ${
                active ? "bg-bz-olive text-bz-text-on-dark" : "border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-bz-line-soft text-[10px] uppercase tracking-[0.06em] text-bz-text-muted">
              <th className="py-2 pr-3 font-medium">Date</th>
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
                className={`${r.current ? "bg-bz-fire/[0.05]" : "cursor-pointer hover:bg-bz-paper-warm/50"}`}
                onClick={() => !r.current && onOpen(r.doc)}
              >
                <td className="py-3 pr-3 text-[11px] tabular-nums text-bz-text-muted">{r.date}</td>
                <td className="px-3 py-3 text-[12px] text-bz-text">{r.type}</td>
                <td className="px-3 py-3 text-[12px] font-semibold tabular-nums text-bz-text">
                  {r.doc}
                  {r.current && <span className="ml-1.5 text-[10px] font-medium text-bz-text-muted">· this order</span>}
                </td>
                <td className="px-3 py-3"><StatusChip label={r.status.label} tone={r.status.tone} dot={false} /></td>
                <td className="px-3 py-3 text-right text-[12px] tabular-nums text-bz-text">{r.amount}</td>
                <td className="px-3 py-3">{!r.current && <ArrowUpRight size={12} className="text-bz-text-muted" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {rows.map((r) => (
          <button
            key={r.doc}
            onClick={() => !r.current && onOpen(r.doc)}
            disabled={r.current}
            className={`flex flex-col gap-1.5 rounded-bz-md border p-3 text-left ${
              r.current ? "border-bz-fire/50 bg-bz-fire/[0.06]" : "border-bz-line-soft bg-bz-paper-warm/30 hover:bg-bz-paper-warm"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-bz-text-muted">{r.type}</span>
              {!r.current && <ArrowUpRight size={12} className="text-bz-text-muted" />}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold tabular-nums text-bz-text">
                {r.doc}
                {r.current && <span className="ml-1.5 text-[10px] font-medium text-bz-text-muted">· this order</span>}
              </span>
              <span className="text-[12px] tabular-nums text-bz-text">{r.amount}</span>
            </div>
            <div className="flex items-center justify-between">
              <StatusChip label={r.status.label} tone={r.status.tone} dot={false} />
              <span className="text-[10.5px] tabular-nums text-bz-text-soft">{r.date}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="flex flex-col gap-3">
      {ACTIVITY.map((a) => (
        <div key={`${a.date}-${a.time}`} className="flex gap-3">
          <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md ${a.dir === "inbound" ? "bg-bz-fire/[0.18]" : "bg-bz-paper-warm"}`}>
            {a.dir === "inbound" ? <ArrowDownLeft size={13} className="text-bz-leaf-deep" /> : <Send size={12} className="text-bz-text-muted" />}
          </span>
          <div className="min-w-0 flex-1 border-b border-bz-line-soft pb-3 last:border-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-bz-text">{a.title}</p>
              <p className="text-[10.5px] tabular-nums text-bz-text-soft">{a.date} · {a.time}</p>
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
        <RailRow label="Tax ID (PAN)" value={DOC.billing.pan} />
        <RailRow label="Payment term" value={DOC.billing.term} />
        <RailRow label="Due date" value={DOC.billing.dueDate} />
      </div>
      <div>
        <RailRow label="Billing address" value={<span className="text-right font-normal">{DOC.billing.address}</span>} />
        <RailRow label="Invoiced" value={`NPR ${TOTALS.invoiced}`} />
        <RailRow label="Outstanding" value={`NPR ${TOTALS.outstanding}`} accent />
      </div>
    </div>
  );
}

function FilesTab({ onOpen }: { onOpen: (ref: string) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      {FILES.map((f) => (
        <div key={f.name} className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 px-3 py-2.5">
          <FileText size={15} className="shrink-0 text-bz-text-muted" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-bz-text">{f.name}</p>
            <p className="text-[10.5px] tabular-nums text-bz-text-muted">{f.folder} · {f.size}</p>
          </div>
          <button onClick={() => onOpen(f.name)} aria-label="Download" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface hover:text-bz-text">
            <Download size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERFLOW MENU + CONFIRM DIALOG + TOAST
// ════════════════════════════════════════════════════════════════════════════

function OverflowMenu({ editHref, onDuplicate, onCancel }: { editHref: string; onDuplicate: () => void; onCancel: () => void }) {
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
        className={`flex size-9 items-center justify-center rounded-bz-md border text-bz-text ${open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:bg-bz-paper-warm"}`}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-[42px] z-30 w-60 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <Link to={editHref} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 hover:bg-bz-paper-warm">
            <Pencil size={13} className="text-bz-text" />
            <span className="text-[12px] font-medium text-bz-text">Edit order</span>
          </Link>
          <button onClick={() => { setOpen(false); onDuplicate(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm">
            <Copy size={13} className="text-bz-text" />
            <span className="text-[12px] font-medium text-bz-text">Duplicate</span>
          </button>
          <div className="flex cursor-not-allowed items-start gap-2.5 px-3.5 py-2.5 opacity-55" title="Available once fully delivered & invoiced">
            <Lock size={13} className="text-bz-text-muted" />
            <div>
              <p className="text-[12px] font-medium text-bz-text">Close order</p>
              <p className="text-[10px] text-bz-text-soft">Once fully delivered &amp; invoiced</p>
            </div>
          </div>
          <div className="my-1 h-px bg-bz-line-soft" />
          <button onClick={() => { setOpen(false); onCancel(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FBE5E2]">
            <Ban size={13} className="text-[#9A2E29]" />
            <span className="text-[12px] font-medium text-[#9A2E29]">Cancel order</span>
          </button>
          <div className="flex cursor-not-allowed items-start gap-2.5 px-3.5 py-2.5 opacity-55" title="Approved orders with deliveries can't be deleted">
            <Trash2 size={13} className="text-[#9A2E29]" />
            <div>
              <p className="text-[12px] font-medium text-[#9A2E29]">Delete order</p>
              <p className="text-[10px] text-bz-text-soft">Has downstream deliveries</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, docNo }: { open: boolean; onClose: () => void; onConfirm: () => void; docNo: string }) {
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
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-bz-sm border border-[#9A2E29]/25 bg-bz-surface text-[#9A2E29] hover:bg-[#FBE5E2]">
            <X size={11} />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-[12.5px] leading-relaxed text-bz-text">
            Cancelling <span className="font-semibold tabular-nums">{docNo}</span> reverses the stock movements from
            delivery <span className="font-semibold">DLV-0788</span> and resets estimate{" "}
            <span className="font-semibold">EST-2241</span> to open. Invoiced amounts (NPR {TOTALS.invoiced}) must be
            credited separately. This can't be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-4 py-3">
          <button onClick={onClose} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
            Keep order
          </button>
          <button onClick={onConfirm} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3.5 text-[12px] font-semibold text-white hover:opacity-95">
            <Ban size={12} /> Cancel order
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

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
      <span className="font-semibold text-bz-text">Sales Order</span>
    </>
  );
}

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
        <TopBar breadcrumb={<Breadcrumb />} />
        <main className="flex-1 overflow-y-auto bg-bz-section-b">
          <DetailHeader
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

          <div className="grid grid-cols-1 gap-4 px-4 py-6 md:px-8 lg:grid-cols-[1fr_320px]">
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
