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
  AlertTriangle,
  Info,
  Lock,
  GitBranch,
  // lifecycle
  ShieldCheck,
  Truck,
  ReceiptText,
  PauseCircle,
  // body / tabs
  Package,
  Activity,
  Send,
  Paperclip,
  FileText,
  FileImage,
  FileType2,
  Download,
  Eye,
  Filter,
  History,
  Cog,
  Workflow as WorkflowIcon,
  StickyNote,
  // reference / fields
  Tag,
  SlidersHorizontal,
  Printer,
  Pencil,
  Copy,
  Trash2,
  Ban,
  Loader2,
  Inbox,
  MapPin,
  Building2,
  CalendarDays,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// SALES ORDER · RECORD (read-only, lifecycle-driven)
//
// PRIMARY ACTION — *advance this order*. The page is read-only, but every verb
// in the brief is a lifecycle move (transition / deliver / invoice / print /
// edit / copy / close / cancel / delete). So the centre of gravity is the
// reactive ACTION CLUSTER in the header, governed by ONE set of lifecycle
// flags. Change the order's state and the status indicator, the tracker, the
// transition buttons, the deliver/invoice buttons and the menu items all
// recompute together (the shared-gating behaviour).
//
// HIERARCHY (invented for this page, not the minimal detail sibling):
//   1. Command header   doc# · live status indicator (+ workflow marker) · actions
//   2. Lifecycle tracker  3-stage mini-tracker (approval → fulfilment → invoicing),
//                         meters live, a "Next" highlight; → banner when held/cancelled
//   3. Tabbed body      the brief's literal tab set; tabs never unmount (state
//                       retained); related/system-info self-fetch lazily
//   4. Persistent rail  client-computed totals · parties · details (conditional
//                       fields) · classification + custom-fields collapsibles
//
// Showcased state: SO-1047 · Apex Manufacturing — workflow Approved, Partially
// delivered (55% by value), Partially invoiced (NPR 641,840 of 1,386,380). All
// money reconciles: subtotal/discount/VAT/total are summed from the lines on
// the client, not read from a field.
// ════════════════════════════════════════════════════════════════════════════

type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";

// ── house formatting (Inter only; differentiate numbers with tabular-nums) ──
const NUM = "tabular-nums";
const round2 = (n: number) => Math.round(n * 100) / 100;
// money: normalise to ≤2 dp, strip trailing zero-decimals, group with commas.
const money = (n: number) => round2(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
const dash = (v: React.ReactNode) =>
  v === null || v === undefined || v === "" ? "—" : v;
// parse a date-only ("YYYY-MM-DD") or local datetime ("YYYY-MM-DDTHH:mm") string
// in LOCAL time, so a bare date never shifts a day in UTC-negative timezones.
function parseLocalDate(s: string): Date {
  const [datePart, timePart] = s.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart ?? "").split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
}

// ════════════════════════════════════════════════════════════════════════════
// 1 · LIFECYCLE MODEL  one flag-set governs status + every action
// ════════════════════════════════════════════════════════════════════════════

type Fulfilment = "pending" | "partial" | "delivered";
type Invoicing = "pending" | "partial" | "invoiced";

type Lifecycle = {
  closed: boolean;
  cancelled: boolean;
  fulfilment: Fulfilment;
  invoice: Invoicing;
  workflowApplied: boolean;
  workflowState: string;
};

const INITIAL_LC: Lifecycle = {
  closed: false,
  cancelled: false,
  fulfilment: "partial",
  invoice: "partial",
  workflowApplied: true,
  workflowState: "Approved",
};

// Data-driven transition graph (stands in for the workflow service). The count
// and labels of the transition buttons come from here, never hardcoded in JSX.
type Transition = { label: string; to: string };
const WORKFLOW: Record<string, Transition[]> = {
  "Pending Approval": [
    { label: "Approve", to: "Approved" },
    { label: "Reject", to: "Rejected" },
  ],
  Approved: [
    { label: "Put On Hold", to: "On Hold" },
    { label: "Reopen for Review", to: "Pending Approval" },
  ],
  "On Hold": [{ label: "Resume", to: "Approved" }],
  Rejected: [{ label: "Resubmit", to: "Pending Approval" }],
};

// value → variant transform for the status indicator.
function statusVariant(state: string): Tone {
  const s = state.toLowerCase();
  if (s.includes("cancel") || s.includes("reject")) return "danger";
  if (s.includes("close")) return "neutral";
  if (s.includes("hold") || s.includes("pending")) return "pending";
  if (s.includes("approved") || s.includes("delivered") || s.includes("invoiced")) return "positive";
  if (s.includes("partial")) return "partial";
  return "neutral";
}

function derivedLabel(f: Fulfilment, i: Invoicing): string {
  if (i === "invoiced") return "Invoiced";
  if (f === "delivered") return "Delivered";
  if (f === "partial" || i === "partial") return "In progress";
  return "Open";
}

// the live status indicator string (present only when a status exists),
// with a marker when it originates from an applied workflow.
function liveStatus(lc: Lifecycle): { label: string; tone: Tone; fromWorkflow: boolean } {
  if (lc.cancelled) return { label: "Cancelled", tone: "danger", fromWorkflow: false };
  if (lc.closed) return { label: "Closed", tone: "neutral", fromWorkflow: false };
  if (lc.workflowApplied && lc.workflowState)
    return { label: lc.workflowState, tone: statusVariant(lc.workflowState), fromWorkflow: true };
  const label = derivedLabel(lc.fulfilment, lc.invoice);
  return { label, tone: statusVariant(label), fromWorkflow: false };
}

type Gates = {
  open: boolean;
  approvedByWorkflow: boolean;
  canDeliver: boolean;
  canInvoice: boolean;
  canEdit: boolean;
  canClose: boolean;
  canCancel: boolean;
};

function gatesOf(lc: Lifecycle): Gates {
  const open = !lc.closed && !lc.cancelled;
  const approvedByWorkflow = !lc.workflowApplied || lc.workflowState === "Approved";
  return {
    open,
    approvedByWorkflow,
    canDeliver: open && approvedByWorkflow && lc.fulfilment !== "delivered",
    canInvoice: open && lc.fulfilment !== "pending" && lc.invoice !== "invoiced",
    canEdit: open && approvedByWorkflow && lc.fulfilment !== "delivered" && lc.invoice !== "invoiced",
    canClose: open && lc.fulfilment === "delivered" && lc.invoice === "invoiced",
    canCancel: open,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 2 · DOCUMENT DATA  (amounts derived from the lines on the client)
// ════════════════════════════════════════════════════════════════════════════

const DOC = {
  party: "Apex Manufacturing Pvt Ltd",
  partyMeta: "C-1029 · Industrial",
  salesRep: "Priya Maharjan",
  salesRepMeta: "NP-02 · Pokhara office",
  orderDate: "May 17, 2026",
  orderDateNep: "2083/02/04",
  expectedDelivery: "May 30, 2026",
  location: "Pokhara Warehouse 02",
  subsidiary: "NP-02 · Bizak Nepal Pokhara",
  memo:
    "Bulk order — phase-2 install for Apex's Bharatpur plant. Confirm crane availability before scheduling the remaining deliveries.",
  // base currency → exchangeRate 1, so the currency / rate rows stay hidden
  // (foreign-currency conditional fields). subsidiary shows because multi-org.
  currency: "NPR",
  exchangeRate: 1,
  source: { type: "Estimate", ref: "EST-2241", href: "/design/sales-order-list/SO-1047" },
  billing: {
    pan: "600 455 782",
    address: "Industrial Area Sector 7, Pokhara 33700, Nepal",
    term: "Net 30",
    dueDate: "Jun 16, 2026",
  },
};

const MULTI_ORG = true; // subsidiary readout gated on this

type Lot = Record<string, string>; // tolerant of mixed-casing keys from the backend
type Line = {
  sn: number;
  item: string;
  code: string;
  description: string;
  unit: string;
  qty: number;
  priceLevel: string;
  rate: number;
  discPct: number;
  taxCode: "VAT" | "EXM";
  taxRate: number;
  delivered: { label: string; tone: Tone };
  invoiced: { label: string; tone: Tone };
  lots: Lot[];
};

const LINES: Line[] = [
  {
    sn: 1,
    item: "Industrial Coupling A-220",
    code: "ICP-A220",
    description: "Standard duty coupling, zinc-plated",
    unit: "pcs",
    qty: 12,
    priceLevel: "Standard",
    rate: 18500,
    discPct: 0,
    taxCode: "VAT",
    taxRate: 13,
    delivered: { label: "6 of 12 delivered", tone: "partial" },
    invoiced: { label: "Not invoiced", tone: "pending" },
    // capitalised keys — exercises the tolerant lot renderer
    lots: [{ Batch: "BC-A220-04", Date: "May 22, 2026", Qty: "6 pcs", Mfg: "Jan 2026" }],
  },
  {
    sn: 2,
    item: "Hydraulic Pump HP-7",
    code: "HP7-2026",
    description: "Phase-2 high-pressure pump unit",
    unit: "pcs",
    qty: 4,
    priceLevel: "Standard",
    rate: 142000,
    discPct: 0,
    taxCode: "VAT",
    taxRate: 13,
    delivered: { label: "Delivered", tone: "positive" },
    invoiced: { label: "Invoiced", tone: "positive" },
    // lowercase keys
    lots: [{ batch: "HP7-B12", serial: "SN-7741 → SN-7744", date: "May 22, 2026", qty: "4 pcs" }],
  },
  {
    sn: 3,
    item: "Mounting Plate Set",
    code: "MPS-006",
    description: "Pkg of 6 · stainless-steel mount plate",
    unit: "pkg",
    qty: 30,
    priceLevel: "Bulk",
    rate: 11200,
    discPct: 0,
    taxCode: "VAT",
    taxRate: 13,
    delivered: { label: "Awaiting delivery", tone: "pending" },
    invoiced: { label: "Not invoiced", tone: "pending" },
    lots: [{ batch: "MPS-B30", date: "Reserved", qty: "30 pkg" }],
  },
  {
    sn: 4,
    item: "Service & Installation",
    code: "SVC-INS",
    description: "On-site fitting + first-run validation",
    unit: "hrs",
    qty: 1,
    priceLevel: "Standard",
    rate: 114000,
    discPct: 0,
    taxCode: "EXM",
    taxRate: 0,
    delivered: { label: "Not scheduled", tone: "pending" },
    invoiced: { label: "Not invoiced", tone: "pending" },
    lots: [], // no inventory detail → no expand affordance
  },
];

function computeLine(l: Line) {
  const gross = l.qty * l.rate;
  const discAmt = round2((gross * (l.discPct || 0)) / 100);
  const taxable = gross - discAmt;
  const taxAmt = round2((taxable * (l.taxRate || 0)) / 100);
  return { gross, discAmt, taxable, taxAmt, net: taxable + taxAmt };
}

// ── activity / files / classification / custom fields / audit seed ──

const ACTIVITY = [
  { date: "May 26, 2026", time: "3:14 PM", dir: "inbound" as const, title: "Part-payment received", memo: "Apex remitted NPR 300,000 against INV-2046 by bank transfer." },
  { date: "May 23, 2026", time: "11:02 AM", dir: "outbound" as const, title: "Invoice INV-2046 sent", memo: "First invoice for the delivered Hydraulic Pump line emailed to accounts@apexmfg.com." },
  { date: "May 22, 2026", time: "9:40 AM", dir: "outbound" as const, title: "Partial delivery dispatched", memo: "DLV-0788 dispatched from Pokhara Warehouse 02 — 4 pumps + 6 couplings." },
  { date: "May 17, 2026", time: "4:30 PM", dir: "inbound" as const, title: "Order approved", memo: "Ramesh Adhikari approved the order; fulfilment unlocked." },
];

type FileKind = "pdf" | "image" | "text" | "doc";
type FileRow = { name: string; folder: string; size: string; kind: FileKind; willFail?: boolean };
const FILES: FileRow[] = [
  { name: "Signed Quotation.pdf", folder: "Sales / Apex / 2026", size: "1.2 MB", kind: "pdf" },
  { name: "Apex Phase-2 Spec.docx", folder: "Engineering / Specs", size: "340 KB", kind: "doc" },
  { name: "Site Photo — Bay 3.jpg", folder: "Logistics / Site", size: "2.1 MB", kind: "image" },
  { name: "Delivery Note DLV-0788.pdf", folder: "Logistics / Deliveries", size: "210 KB", kind: "pdf", willFail: true },
  { name: "Crane Plan.txt", folder: "Engineering / Rigging", size: "8 KB", kind: "text" },
];
const PREVIEWABLE: FileKind[] = ["pdf", "image", "text"];

const CLASSIFICATION = [
  { label: "Department", value: "Sales — Pokhara" },
  { label: "Class", value: "Industrial" },
  { label: "Project", value: "APEX-PH2" },
  { label: "Partner", value: "Apex Group" },
];

// admin-defined custom fields — rendered by type, ordered by `order`, dash for
// empty lookups. Covers every type the renderer must switch on.
type CFType = "number" | "text" | "date" | "datetime" | "time" | "percent" | "checkbox" | "multiline" | "lookup" | "multilookup";
type CustomField = { id: string; label: string; type: CFType; value: unknown; order: number };
const CUSTOM_FIELDS: CustomField[] = [
  { id: "plant", label: "Plant", type: "lookup", value: "Bharatpur · Industrial Park", order: 1 },
  { id: "crane", label: "Crane required", type: "checkbox", value: true, order: 2 },
  { id: "commission", label: "Commissioning date", type: "date", value: "2026-06-20", order: 3 },
  { id: "sitevisit", label: "Site visit", type: "datetime", value: "2026-06-18T10:30", order: 4 },
  { id: "cutover", label: "Cutover window", type: "time", value: "14:00", order: 5 },
  { id: "progress", label: "Install completion", type: "percent", value: 55, order: 6 },
  { id: "poref", label: "Customer PO ref", type: "text", value: "PO-APX-7741", order: 7 },
  { id: "crews", label: "Partner crews", type: "multilookup", value: ["Apex Group", "Pokhara Rigging"], order: 8 },
  { id: "risk", label: "Risk weighting", type: "number", value: 3.5, order: 9 },
  { id: "scope", label: "Scope notes", type: "multiline", value: "Phase 2 of 3.\nLifting plan signed off.\nAwaiting crane slot from vendor." , order: 10 },
  { id: "secondary", label: "Secondary contact", type: "lookup", value: null, order: 11 }, // empty lookup → dash
];

const SYS_NOTES = [
  { label: "Created", value: "May 17, 2026 · 2:05 PM · Priya Maharjan" },
  { label: "Last modified", value: "May 23, 2026 · 11:02 AM · Priya Maharjan" },
  { label: "Internal ID", value: "txn_8841029" },
  { label: "Record type", value: "salesorder" },
];
const ACTIVE_WORKFLOWS_SEED = [
  { id: "wf1", name: "Sales Order Approval", state: "Approved", started: "May 17, 2026 · 2:40 PM", tone: "positive" as Tone },
  { id: "wf2", name: "Credit-Limit Check", state: "Monitoring", started: "May 17, 2026 · 2:41 PM", tone: "pending" as Tone },
];
const WORKFLOW_HISTORY = [
  { date: "May 17, 2026 · 4:30 PM", event: "Approval workflow completed", by: "Ramesh Adhikari", result: { label: "Approved", tone: "positive" as Tone } },
  { date: "May 17, 2026 · 2:40 PM", event: "Submitted for approval", by: "Priya Maharjan", result: { label: "Pending", tone: "pending" as Tone } },
];

type RelatedRow = { date: string; type: string; doc: string; party: string; status: { label: string; tone: Tone }; href?: string; current?: boolean };
const RELATED: RelatedRow[] = [
  { date: "May 12, 2026", type: "Estimate", doc: "EST-2241", party: "Apex Manufacturing", status: { label: "Converted", tone: "neutral" }, href: "/design/sales-order-list/SO-1047" },
  { date: "May 17, 2026", type: "Sales Order", doc: "SO-1047", party: "Apex Manufacturing", status: { label: "Approved", tone: "positive" }, current: true },
  { date: "May 22, 2026", type: "Delivery", doc: "DLV-0788", party: "Apex Manufacturing", status: { label: "Delivered", tone: "positive" }, href: "/design/sales-order-list/SO-1047" },
  { date: "May 23, 2026", type: "Invoice", doc: "INV-2046", party: "Apex Manufacturing", status: { label: "Open", tone: "partial" }, href: "/design/sales-order-list/SO-1047" },
  { date: "May 26, 2026", type: "Payment", doc: "RCP-1190", party: "Apex Manufacturing", status: { label: "Received", tone: "positive" } },
];
const REL_TYPES = ["All", "Estimate", "Sales Order", "Delivery", "Invoice", "Payment", "Return"] as const;

// ════════════════════════════════════════════════════════════════════════════
// 3 · ATOMS
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
const METER_FILL: Record<Tone, string> = {
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

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-bz-text-muted">{children}</p>;
}

function Avatar({ name, tone = "neutral" }: { name: string; tone?: "fire" | "neutral" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-bz-pill text-[12px] font-bold text-bz-text ${tone === "fire" ? "bg-bz-fire/[0.18]" : "bg-bz-paper-warm"}`}>
      {initials}
    </span>
  );
}

function RailCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5 ${className}`}>{children}</div>;
}

function RailRow({ label, value, accent, onClick }: { label: string; value: React.ReactNode; accent?: boolean; onClick?: () => void }) {
  const valueEl = <span className={`text-right text-[12.5px] font-medium leading-snug ${accent ? "text-bz-leaf-deep" : "text-bz-text"} ${NUM}`}>{value}</span>;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line-soft py-2.5 first:border-t-0 first:pt-0">
      <span className="shrink-0 text-[11.5px] text-bz-text-muted">{label}</span>
      {onClick ? (
        <button onClick={onClick} className="inline-flex min-w-0 items-center gap-1 hover:underline">
          <span className="truncate">{valueEl}</span>
          <ArrowUpRight size={11} className="shrink-0 text-bz-text-muted" />
        </button>
      ) : (
        valueEl
      )}
    </div>
  );
}

const PRIMARY_BTN = "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:pointer-events-none disabled:opacity-50";
const GHOST_BTN = "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:pointer-events-none disabled:opacity-50";
const ICON_BTN = "flex size-9 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text";

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);
  return ref;
}

// ════════════════════════════════════════════════════════════════════════════
// 4 · COMMAND HEADER  doc# · status indicator · reactive action cluster
// ════════════════════════════════════════════════════════════════════════════

type Action = { key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; onClick: () => void; workflow?: boolean };

function CommandHeader({
  docNo, status, busy, primary, ghosts, onPrint, menu,
}: {
  docNo: string;
  status: { label: string; tone: Tone; fromWorkflow: boolean };
  busy: boolean;
  primary: Action | null;
  ghosts: Action[];
  onPrint: () => void;
  menu: React.ReactNode;
}) {
  return (
    <header className="border-b border-bz-line-soft bg-bz-paper px-4 pb-5 pt-5 md:px-8">
      <Link to="/design/sales-order-list" className="inline-flex items-center gap-1 text-[12px] text-bz-text-muted hover:text-bz-text">
        <ChevronLeft size={13} /> Back to Sales Orders
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className={`text-[26px] font-semibold tracking-tight text-bz-text ${NUM}`}>{docNo}</h1>
            <span className="inline-flex items-center gap-1.5">
              <StatusChip label={status.label} tone={status.tone} />
              {status.fromWorkflow && (
                <span
                  title="State set by an applied workflow"
                  className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted"
                >
                  <GitBranch size={10} /> Workflow
                </span>
              )}
            </span>
          </div>
          <p className="mt-1.5 text-[13px] text-bz-text-muted">Sales order record — line items, lifecycle and every document around it.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* the primary lifecycle move leads the cluster (filled, first) */}
          {primary && (
            <button onClick={primary.onClick} disabled={busy} className={PRIMARY_BTN}>
              {busy ? <Loader2 size={13} className="animate-spin" /> : <primary.icon size={13} />}
              {primary.label}
            </button>
          )}

          {/* data-driven transition / secondary-progression actions — inline on
              ≥sm after a divider, folded into the More menu on mobile. Count +
              labels come from the workflow service, not hardcoded. */}
          {ghosts.length > 0 && <span className="hidden h-5 w-px bg-bz-line-soft sm:block" />}
          {ghosts.map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.key} onClick={a.onClick} disabled={busy} className={`${GHOST_BTN} hidden sm:inline-flex`}>
                {a.workflow ? <GitBranch size={12} className="text-bz-text-muted" /> : <Icon size={13} />}
                {a.label}
              </button>
            );
          })}

          <button onClick={onPrint} aria-label="Print order" className={ICON_BTN}><Printer size={14} /></button>
          {menu}
        </div>
      </div>
    </header>
  );
}

// secondary-action menu (item 5) + the mobile-folded ghost actions
function OverflowMenu({
  gates, busy, editHref, mobileActions, onCopy, onClose, onCancel, onDelete,
}: {
  gates: Gates;
  busy: boolean;
  editHref: string;
  mobileActions: Action[];
  onCopy: () => void;
  onClose: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const close = () => setOpen(false);

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
        <div className="absolute right-0 top-[44px] z-30 w-64 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          {/* mobile-only: the inline ghost actions, so nothing is lost on small screens */}
          {mobileActions.length > 0 && (
            <div className="sm:hidden">
              {mobileActions.map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.key} disabled={busy} onClick={() => { close(); a.onClick(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm disabled:opacity-50">
                    {a.workflow ? <GitBranch size={13} className="text-bz-text-muted" /> : <Icon size={13} className="text-bz-text" />}
                    <span className="text-[12px] font-medium text-bz-text">{a.label}</span>
                  </button>
                );
              })}
              <div className="my-1 h-px bg-bz-line-soft" />
            </div>
          )}

          {gates.canEdit ? (
            <Link to={editHref} onClick={close} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 hover:bg-bz-paper-warm">
              <Pencil size={13} className="text-bz-text" />
              <span className="text-[12px] font-medium text-bz-text">Edit order</span>
            </Link>
          ) : (
            <div className="flex cursor-not-allowed items-start gap-2.5 px-3.5 py-2.5 opacity-55" title="Locked once the order is fully delivered or invoiced">
              <Lock size={13} className="mt-0.5 text-bz-text-muted" />
              <div>
                <p className="text-[12px] font-medium text-bz-text">Edit order</p>
                <p className="text-[10px] text-bz-text-soft">Locked once delivered &amp; invoiced</p>
              </div>
            </div>
          )}

          <button onClick={() => { close(); onCopy(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm">
            <Copy size={13} className="text-bz-text" />
            <span className="text-[12px] font-medium text-bz-text">Copy to new order</span>
          </button>

          {gates.canClose ? (
            <button onClick={() => { close(); onClose(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm">
              <Check size={13} className="text-bz-text" />
              <span className="text-[12px] font-medium text-bz-text">Close order</span>
            </button>
          ) : (
            <div className="flex cursor-not-allowed items-start gap-2.5 px-3.5 py-2.5 opacity-55" title="Available once fully delivered & invoiced">
              <Lock size={13} className="mt-0.5 text-bz-text-muted" />
              <div>
                <p className="text-[12px] font-medium text-bz-text">Close order</p>
                <p className="text-[10px] text-bz-text-soft">Once fully delivered &amp; invoiced</p>
              </div>
            </div>
          )}

          <div className="my-1 h-px bg-bz-line-soft" />

          {gates.canCancel && (
            <button onClick={() => { close(); onCancel(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FBE5E2]">
              <Ban size={13} className="text-[#9A2E29]" />
              <span className="text-[12px] font-medium text-[#9A2E29]">Cancel order</span>
            </button>
          )}
          <button onClick={() => { close(); onDelete(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-[#FBE5E2]">
            <Trash2 size={13} className="text-[#9A2E29]" />
            <span className="text-[12px] font-medium text-[#9A2E29]">Delete order</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5 · LIFECYCLE TRACKER  3 live stages + Next highlight → banner when held
// ════════════════════════════════════════════════════════════════════════════

type Stage = {
  key: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  pct: number;
  chip: { label: string; tone: Tone };
  caption: string;
  locked?: boolean;
  next?: boolean;
};

function trackerStages(lc: Lifecycle, gates: Gates): Stage[] {
  const approval: Stage = {
    key: "approval",
    title: "Approval",
    icon: ShieldCheck,
    pct: lc.workflowApplied ? (lc.workflowState === "Pending Approval" ? 40 : 100) : 100,
    chip: lc.workflowApplied ? { label: lc.workflowState, tone: statusVariant(lc.workflowState) } : { label: "Approved", tone: "positive" },
    caption: lc.workflowState === "Pending Approval" ? "Awaiting approver" : lc.workflowState === "Rejected" ? "Rejected — resubmit to continue" : "Approved · Ramesh Adhikari",
  };
  const fpct = { pending: 0, partial: 55, delivered: 100 } as const;
  const fulfilment: Stage = {
    key: "fulfilment",
    title: "Fulfilment",
    icon: Truck,
    pct: fpct[lc.fulfilment],
    chip:
      lc.fulfilment === "delivered" ? { label: "Delivered", tone: "positive" }
      : lc.fulfilment === "partial" ? { label: "Partially delivered", tone: "partial" }
      : { label: "Not delivered", tone: "pending" },
    caption: lc.fulfilment === "partial" ? "NPR 767,270 of 1,386,380 · 2 of 4 lines started" : lc.fulfilment === "delivered" ? "All 4 lines delivered" : "No deliveries yet",
    locked: !gates.approvedByWorkflow,
    next: gates.canDeliver,
  };
  const ipct = { pending: 0, partial: 46, invoiced: 100 } as const;
  const invoicing: Stage = {
    key: "invoicing",
    title: "Invoicing",
    icon: ReceiptText,
    pct: ipct[lc.invoice],
    chip:
      lc.invoice === "invoiced" ? { label: "Invoiced", tone: "positive" }
      : lc.invoice === "partial" ? { label: "Partially invoiced", tone: "partial" }
      : { label: "Not invoiced", tone: "pending" },
    caption: lc.invoice === "partial" ? "NPR 641,840 invoiced · 744,540 due" : lc.invoice === "invoiced" ? "Fully invoiced" : "Nothing billed yet",
    locked: !gates.approvedByWorkflow,
    next: !gates.canDeliver && gates.canInvoice,
  };
  return [approval, fulfilment, invoicing];
}

function LifecycleTracker({ lc, gates }: { lc: Lifecycle; gates: Gates }) {
  if (lc.cancelled) {
    return (
      <Banner tone="danger" icon={Ban} title="Order cancelled" body="Stock movements have been reversed and the source estimate reset to open. Invoiced amounts must be credited separately." />
    );
  }
  if (lc.closed) {
    return <Banner tone="neutral" icon={Check} title="Order closed" body="This order is fully delivered and invoiced. It is locked to further changes." />;
  }

  const stages = trackerStages(lc, gates);
  const held = lc.workflowApplied && lc.workflowState === "On Hold";
  const nextHint = gates.canDeliver
    ? "Next — deliver the 2 remaining lines"
    : gates.canInvoice
    ? "Next — invoice the delivered, un-billed balance"
    : held
    ? "On hold — resume the workflow to continue"
    : "Awaiting approval to progress";

  return (
    <div className="flex flex-col gap-4">
      {held && (
        <Banner
          tone="pending"
          icon={PauseCircle}
          title="Order on hold"
          body="Resume the approval workflow to continue fulfilment and invoicing."
        />
      )}
      <section className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 md:p-5">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <CardLabel>Lifecycle</CardLabel>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-bz-text-muted">
          <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
          {nextHint}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-line-soft sm:grid-cols-3">
        {stages.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className={cn("bg-bz-surface p-3.5", s.locked && "opacity-55")}>
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-bz-sm bg-bz-paper-warm">
                  <Icon size={12} className="text-bz-text" />
                </span>
                <span className="text-[12px] font-semibold text-bz-text">{s.title}</span>
                {s.next && <span className="rounded-bz-sm bg-bz-fire/[0.18] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-bz-text">Next</span>}
                {s.locked && <Lock size={11} className="text-bz-text-soft" />}
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-bz-pill bg-bz-line-soft">
                  <div className={cn("h-full rounded-bz-pill", METER_FILL[s.chip.tone])} style={{ width: `${s.pct}%` }} />
                </div>
                <span className={`text-[10.5px] font-semibold text-bz-text ${NUM}`}>{s.pct}%</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <StatusChip label={s.chip.label} tone={s.chip.tone} dot={false} />
              </div>
              <p className={`mt-1.5 text-[10.5px] text-bz-text-muted ${NUM}`}>{s.caption}</p>
            </div>
          );
        })}
      </div>
      </section>
    </div>
  );
}

function Banner({ tone, icon: Icon, title, body }: { tone: Tone; icon: React.ComponentType<{ size?: number; className?: string }>; title: string; body: string }) {
  const danger = tone === "danger";
  return (
    <section className={cn("flex items-start gap-3 rounded-bz-lg border p-4 md:p-5", danger ? "border-[#F0C9C4] bg-[#FBE7E5]" : "border-bz-line-soft bg-bz-surface")}>
      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md", danger ? "bg-[#F6D5D1]" : "bg-bz-paper-warm")}>
        <Icon size={14} className={danger ? "text-[#9A2E29]" : "text-bz-text"} />
      </span>
      <div>
        <p className={cn("text-[13px] font-semibold", danger ? "text-[#9A2E29]" : "text-bz-text")}>{title}</p>
        <p className={cn("mt-0.5 text-[11.5px] leading-relaxed", danger ? "text-[#9A2E29]/85" : "text-bz-text-muted")}>{body}</p>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6 · LINE ITEMS TAB  full breakdown · per-line inventory · advisory
// ════════════════════════════════════════════════════════════════════════════

const TH = "px-3 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted whitespace-nowrap";

function lotField(lot: Lot, ...keys: string[]) {
  for (const k of keys) {
    const v = lot[k] ?? lot[k.toLowerCase()] ?? lot[k.toUpperCase()] ?? lot[k.charAt(0).toUpperCase() + k.slice(1)];
    if (v !== undefined && v !== "") return v;
  }
  return "—";
}

function InventoryBreakdown({ lots }: { lots: Lot[] }) {
  const hasMfg = lots.some((l) => lotField(l, "mfg", "manufacture", "manufactured") !== "—");
  return (
    <div className="overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
      <div className="flex items-center gap-1.5 border-b border-bz-line-soft px-3 py-2">
        <Package size={11} className="text-bz-text-muted" />
        <CardLabel>Inventory / lot detail</CardLabel>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-bz-line-soft text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">
              <th className="px-3 py-1.5 font-medium">Batch</th>
              <th className="px-3 py-1.5 font-medium">Serial</th>
              <th className="px-3 py-1.5 font-medium">Expiry</th>
              {hasMfg && <th className="px-3 py-1.5 font-medium">Mfg date</th>}
              <th className="px-3 py-1.5 font-medium">Date</th>
              <th className="px-3 py-1.5 text-right font-medium">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bz-line-soft">
            {lots.map((l, i) => (
              <tr key={i} className={`text-[11px] text-bz-text ${NUM}`}>
                <td className="px-3 py-1.5">{lotField(l, "batch")}</td>
                <td className="px-3 py-1.5 text-bz-text-muted">{lotField(l, "serial")}</td>
                <td className="px-3 py-1.5 text-bz-text-muted">{lotField(l, "expiry")}</td>
                {hasMfg && <td className="px-3 py-1.5 text-bz-text-muted">{lotField(l, "mfg", "manufacture")}</td>}
                <td className="px-3 py-1.5 text-bz-text-muted">{lotField(l, "date")}</td>
                <td className="px-3 py-1.5 text-right font-medium">{lotField(l, "qty")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LineItemsTab({ onOpenItem, currency }: { onOpenItem: (item: string) => void; currency: string }) {
  const [open, setOpen] = React.useState<Set<number>>(new Set());
  const toggle = (sn: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(sn)) next.delete(sn); else next.add(sn);
      return next;
    });

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <CardLabel>Line items</CardLabel>
        <span className={`text-[11.5px] text-bz-text-muted ${NUM}`}>· {LINES.length}</span>
      </div>

      {/* desktop table (wide → horizontal scroll) */}
      <div className="hidden overflow-x-auto rounded-bz-md border border-bz-line-soft md:block">
        <table className="w-full min-w-[940px] border-collapse text-left">
          <thead>
            <tr className="border-b border-bz-line-soft bg-bz-paper-warm/60">
              <th className={TH}>Item</th>
              <th className={`${TH} text-right`}>Qty</th>
              <th className={TH}>Price level</th>
              <th className={`${TH} text-right`}>Rate</th>
              <th className={`${TH} text-right`}>Disc</th>
              <th className={`${TH} text-right`}>Gross</th>
              <th className={TH}>Tax</th>
              <th className={`${TH} text-right`}>Tax amt</th>
              <th className={`${TH} text-right`}>Net</th>
              <th className="w-9 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-bz-line-soft">
            {LINES.map((l) => {
              const c = computeLine(l);
              const isOpen = open.has(l.sn);
              const hasLots = l.lots.length > 0;
              return (
                <React.Fragment key={l.sn}>
                  <tr className="align-top">
                    <td className="px-3 py-3">
                      <button onClick={() => onOpenItem(l.item)} className="flex items-center gap-1 text-left text-[12.5px] font-medium text-bz-text hover:underline">
                        {l.item}
                        <ArrowUpRight size={11} className="text-bz-text-muted" />
                      </button>
                      <p className="mt-0.5 text-[10.5px] text-bz-text-muted">{l.code} · {l.unit} · {l.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <StatusChip label={l.delivered.label} tone={l.delivered.tone} dot={false} />
                        <StatusChip label={l.invoiced.label} tone={l.invoiced.tone} dot={false} />
                      </div>
                    </td>
                    <td className={`px-3 py-3 text-right text-[12px] text-bz-text ${NUM}`}>{l.qty}</td>
                    <td className="px-3 py-3 text-[11.5px] text-bz-text-muted">{l.priceLevel}</td>
                    <td className={`px-3 py-3 text-right text-[12px] text-bz-text-muted ${NUM}`}>{money(l.rate)}</td>
                    <td className={`px-3 py-3 text-right text-[12px] text-bz-text-muted ${NUM}`}>
                      {l.discPct ? <>{l.discPct}%<span className="block text-[10px] text-bz-text-soft">{money(c.discAmt)}</span></> : "—"}
                    </td>
                    <td className={`px-3 py-3 text-right text-[12px] text-bz-text-muted ${NUM}`}>{money(c.gross)}</td>
                    <td className={`px-3 py-3 text-[11px] text-bz-text-muted ${NUM}`}>{l.taxCode} · {l.taxRate}%</td>
                    <td className={`px-3 py-3 text-right text-[12px] text-bz-text-muted ${NUM}`}>{c.taxAmt ? money(c.taxAmt) : "—"}</td>
                    <td className={`px-3 py-3 text-right text-[13px] font-semibold text-bz-text ${NUM}`}>{money(c.net)}</td>
                    <td className="px-2 py-3">
                      {hasLots && (
                        <button onClick={() => toggle(l.sn)} aria-label={isOpen ? "Hide inventory" : "Show inventory"} className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
                          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isOpen && hasLots && (
                    <tr>
                      <td colSpan={10} className="bg-bz-paper-warm/40 px-3 py-3">
                        <InventoryBreakdown lots={l.lots} />
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
      <div className="flex flex-col gap-2.5 md:hidden">
        {LINES.map((l) => {
          const c = computeLine(l);
          const isOpen = open.has(l.sn);
          const hasLots = l.lots.length > 0;
          return (
            <div key={l.sn} className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 p-4">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => onOpenItem(l.item)} className="min-w-0 text-left">
                  <p className="flex items-center gap-1 text-[13px] font-semibold text-bz-text">{l.item}<ArrowUpRight size={11} className="shrink-0 text-bz-text-muted" /></p>
                  <p className="mt-0.5 text-[10.5px] text-bz-text-muted">{l.code} · {l.description}</p>
                </button>
                <span className={`shrink-0 text-[13px] font-semibold text-bz-text ${NUM}`}>{money(c.net)}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <StatusChip label={l.delivered.label} tone={l.delivered.tone} dot={false} />
                <StatusChip label={l.invoiced.label} tone={l.invoiced.tone} dot={false} />
              </div>
              <div className={`mt-3 flex items-center justify-between border-t border-bz-line-soft pt-3 text-[11.5px] text-bz-text-muted ${NUM}`}>
                <span>{l.qty} {l.unit} × {money(l.rate)} · {l.taxCode} {l.taxRate}%</span>
                {hasLots && (
                  <button onClick={() => toggle(l.sn)} className="inline-flex items-center gap-1 font-medium text-bz-text-muted hover:text-bz-text">
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Lots
                  </button>
                )}
              </div>
              {isOpen && hasLots && <div className="mt-2"><InventoryBreakdown lots={l.lots} /></div>}
            </div>
          );
        })}
      </div>

      {/* advisory note (item 23) */}
      <p className="mt-4 inline-flex items-start gap-2 text-[11.5px] leading-relaxed text-bz-text-muted">
        <Info size={13} className="mt-0.5 shrink-0" />
        Values are based on agreed customer rates. Changes to this order may require re-approval before it can be fulfilled or invoiced.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7 · ACTIVITY · BILLING · ATTACHMENTS TABS
// ════════════════════════════════════════════════════════════════════════════

function ActivityTab() {
  return (
    <div className="flex flex-col gap-3">
      <CardLabel>Activity &amp; notes</CardLabel>
      {ACTIVITY.map((a) => (
        <div key={`${a.date}-${a.time}`} className="flex gap-3">
          <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md ${a.dir === "inbound" ? "bg-bz-fire/[0.18]" : "bg-bz-paper-warm"}`}>
            {a.dir === "inbound" ? <ArrowDownLeft size={13} className="text-bz-leaf-deep" /> : <Send size={12} className="text-bz-text-muted" />}
          </span>
          <div className="min-w-0 flex-1 border-b border-bz-line-soft pb-3 last:border-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-bz-text">{a.title}</p>
              <p className={`text-[10.5px] text-bz-text-soft ${NUM}`}>{a.date} · {a.time} · {a.dir}</p>
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bz-text-muted">{a.memo}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BillingTab() {
  return (
    <div>
      <CardLabel>Billing details</CardLabel>
      <div className="mt-3 grid grid-cols-1 gap-x-10 md:grid-cols-2">
        <div>
          <RailRow label="Tax ID (PAN)" value={dash(DOC.billing.pan)} />
          <RailRow label="Payment term" value={dash(DOC.billing.term)} />
          <RailRow label="Due date" value={dash(DOC.billing.dueDate)} />
        </div>
        <div>
          <RailRow label="Invoiced" value={`NPR ${money(641840)}`} />
          <RailRow label="Outstanding" value={`NPR ${money(744540)}`} accent />
        </div>
      </div>
      <div className="mt-4 border-t border-bz-line-soft pt-4">
        <p className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">Billing address</p>
        <p className="mt-1 text-[12.5px] text-bz-text">{dash(DOC.billing.address)}</p>
      </div>
    </div>
  );
}

const FILE_ICON: Record<FileKind, React.ComponentType<{ size?: number; className?: string }>> = {
  pdf: FileText,
  image: FileImage,
  text: FileType2,
  doc: FileText,
};

function AttachmentsTab({ onDownload, onPreview }: { onDownload: (f: FileRow) => void; onPreview: (f: FileRow) => void }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <CardLabel>Attachments</CardLabel>
        <span className={`text-[11.5px] text-bz-text-muted ${NUM}`}>· {FILES.length}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {FILES.map((f) => {
          const Icon = FILE_ICON[f.kind];
          const previewable = PREVIEWABLE.includes(f.kind);
          return (
            <div key={f.name} className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 px-3 py-2.5">
              <Icon size={16} className="shrink-0 text-bz-text-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-bz-text">{f.name}</p>
                <p className={`text-[10.5px] text-bz-text-muted ${NUM}`}>{f.folder} · {f.size}</p>
              </div>
              {previewable && (
                <button onClick={() => onPreview(f)} aria-label={`Preview ${f.name}`} className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface hover:text-bz-text">
                  <Eye size={14} />
                </button>
              )}
              <button onClick={() => onDownload(f)} aria-label={`Download ${f.name}`} className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface hover:text-bz-text">
                <Download size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8 · RELATED RECORDS TAB  self-fetching · filter · loading / empty
// ════════════════════════════════════════════════════════════════════════════

function FetchState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12">
      <Loader2 size={15} className="animate-spin text-bz-fire" />
      <span className="text-[12px] text-bz-text-muted">{label}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Icon size={20} /></span>
      <p className="text-[13px] font-semibold text-bz-text">{title}</p>
      <p className="max-w-xs text-[11.5px] text-bz-text-muted">{body}</p>
    </div>
  );
}

function RelatedTab({ active, onOpen, docNo }: { active: boolean; onOpen: (r: RelatedRow) => void; docNo: string }) {
  const [state, setState] = React.useState<"idle" | "loading" | "loaded">("idle");
  const [filter, setFilter] = React.useState<(typeof REL_TYPES)[number]>("All");

  React.useEffect(() => {
    if (active && state === "idle") {
      setState("loading");
      const t = setTimeout(() => setState("loaded"), 650);
      return () => clearTimeout(t);
    }
  }, [active, state]);

  const rows = RELATED.filter((r) => filter === "All" || r.type === filter).map((r) => (r.current ? { ...r, doc: docNo } : r));

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-2">
        <CardLabel>Related records</CardLabel>
        {state === "loaded" && <span className={`text-[11.5px] text-bz-text-muted ${NUM}`}>· {rows.length}</span>}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Filter size={12} className="mr-0.5 text-bz-text-muted" />
        {REL_TYPES.map((f) => {
          const isActive = f === filter;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-bz-sm px-2.5 py-1 text-[11px] font-medium ${isActive ? "bg-bz-olive text-bz-text-on-dark" : "border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"}`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {state !== "loaded" ? (
        <FetchState label="Loading related records…" />
      ) : rows.length === 0 ? (
        <EmptyState icon={Inbox} title="No related records" body={`No ${filter} documents are linked to this order yet.`} />
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-bz-line-soft text-[10px] uppercase tracking-[0.06em] text-bz-text-muted">
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Document</th>
                  <th className="px-3 py-2 font-medium">Party</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="w-8 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-bz-line-soft">
                {rows.map((r) => {
                  const linkable = !r.current && !!r.href;
                  return (
                    <tr key={r.doc} className={r.current ? "bg-bz-fire/[0.05]" : linkable ? "cursor-pointer hover:bg-bz-paper-warm/50" : ""} onClick={() => linkable && onOpen(r)}>
                      <td className={`py-3 pr-3 text-[11px] text-bz-text-muted ${NUM}`}>{r.date}</td>
                      <td className="px-3 py-3 text-[12px] text-bz-text">{r.type}</td>
                      <td className={`px-3 py-3 text-[12px] font-semibold text-bz-text ${NUM}`}>
                        {linkable ? <span className="inline-flex items-center gap-1 hover:underline">{r.doc}<ArrowUpRight size={11} className="text-bz-text-muted" /></span> : r.doc}
                        {r.current && <span className="ml-1.5 text-[10px] font-medium text-bz-text-muted">· this order</span>}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-bz-text-muted">{r.party}</td>
                      <td className="px-3 py-3"><StatusChip label={r.status.label} tone={r.status.tone} dot={false} /></td>
                      <td className="px-3 py-3">{linkable && <ArrowUpRight size={12} className="text-bz-text-muted" />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {rows.map((r) => {
              const linkable = !r.current && !!r.href;
              return (
                <button
                  key={r.doc}
                  onClick={() => linkable && onOpen(r)}
                  disabled={!linkable}
                  className={`flex flex-col gap-1.5 rounded-bz-md border p-3 text-left ${r.current ? "border-bz-fire/50 bg-bz-fire/[0.06]" : "border-bz-line-soft bg-bz-paper-warm/30"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-bz-text-muted">{r.type}</span>
                    {linkable && <ArrowUpRight size={12} className="text-bz-text-muted" />}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[13px] font-semibold text-bz-text ${NUM}`}>{r.doc}{r.current && <span className="ml-1.5 text-[10px] font-medium text-bz-text-muted">· this order</span>}</span>
                    <StatusChip label={r.status.label} tone={r.status.tone} dot={false} />
                  </div>
                  <span className={`text-[10.5px] text-bz-text-soft ${NUM}`}>{r.date} · {r.party}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9 · SYSTEM INFORMATION TAB  self-fetching · notes / workflows / history
// ════════════════════════════════════════════════════════════════════════════

const SYS_SUBTABS = [
  { key: "notes", label: "System notes", icon: Cog },
  { key: "active", label: "Active workflows", icon: WorkflowIcon },
  { key: "history", label: "Workflow history", icon: History },
] as const;
type SysSub = (typeof SYS_SUBTABS)[number]["key"];

function SystemInfoTab({ active, onCancelWorkflow }: { active: boolean; onCancelWorkflow: (name: string) => void }) {
  const [state, setState] = React.useState<"idle" | "loading" | "loaded">("idle");
  const [sub, setSub] = React.useState<SysSub>("notes");
  const [activeWf, setActiveWf] = React.useState(ACTIVE_WORKFLOWS_SEED);

  React.useEffect(() => {
    if (active && state === "idle") {
      setState("loading");
      const t = setTimeout(() => setState("loaded"), 650);
      return () => clearTimeout(t);
    }
  }, [active, state]);

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-2">
        <CardLabel>System information</CardLabel>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {SYS_SUBTABS.map((s) => {
          const isActive = s.key === sub;
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setSub(s.key)}
              className={`inline-flex items-center gap-1.5 rounded-bz-sm px-2.5 py-1.5 text-[11.5px] font-medium ${isActive ? "bg-bz-olive text-bz-text-on-dark" : "border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"}`}
            >
              <Icon size={12} /> {s.label}
            </button>
          );
        })}
      </div>

      {state !== "loaded" ? (
        <FetchState label="Loading system information…" />
      ) : sub === "notes" ? (
        <div className="max-w-md">
          {SYS_NOTES.map((n) => (
            <RailRow key={n.label} label={n.label} value={n.value} />
          ))}
        </div>
      ) : sub === "active" ? (
        activeWf.length === 0 ? (
          <EmptyState icon={WorkflowIcon} title="No active workflows" body="There are no workflow instances currently running on this order." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {activeWf.map((w) => (
              <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/30 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-bz-text">{w.name}</p>
                  <p className={`text-[10.5px] text-bz-text-muted ${NUM}`}>Started {w.started}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip label={w.state} tone={w.tone} />
                  <button
                    onClick={() => { setActiveWf((prev) => prev.filter((x) => x.id !== w.id)); onCancelWorkflow(w.name); }}
                    className="inline-flex h-7 items-center gap-1 rounded-bz-sm border border-[#9A2E29]/25 bg-bz-surface px-2 text-[11px] font-medium text-[#9A2E29] hover:bg-[#FBE5E2]"
                  >
                    <Ban size={11} /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          {WORKFLOW_HISTORY.map((h) => (
            <div key={h.event} className="flex items-start justify-between gap-3 border-t border-bz-line-soft py-2.5 first:border-t-0 first:pt-0">
              <div>
                <p className="text-[12px] font-medium text-bz-text">{h.event}</p>
                <p className={`text-[10.5px] text-bz-text-muted ${NUM}`}>{h.date} · {h.by}</p>
              </div>
              <StatusChip label={h.result.label} tone={h.result.tone} dot={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 10 · TABBED PANEL  brief's literal tab set; inactive tabs keep their state
// ════════════════════════════════════════════════════════════════════════════

const TABS = [
  { key: "lines", label: "Line items", icon: Package },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "billing", label: "Billing", icon: ReceiptText },
  { key: "files", label: "Attachments", icon: Paperclip },
  { key: "related", label: "Related records", icon: GitBranch },
  { key: "system", label: "System information", icon: Cog },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function TabbedPanel({
  docNo, currency, onOpenItem, onOpenRelated, onDownload, onPreview, onCancelWorkflow,
}: {
  docNo: string;
  currency: string;
  onOpenItem: (item: string) => void;
  onOpenRelated: (r: RelatedRow) => void;
  onDownload: (f: FileRow) => void;
  onPreview: (f: FileRow) => void;
  onCancelWorkflow: (name: string) => void;
}) {
  const [tab, setTab] = React.useState<TabKey>("lines");
  return (
    <section className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex gap-0.5 overflow-x-auto border-b border-bz-line-soft px-3 md:px-4">
        {TABS.map((t) => {
          const isActive = t.key === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              title={t.label}
              className={`relative inline-flex shrink-0 items-center gap-1.5 px-3 py-3 text-[12px] ${isActive ? "font-semibold text-bz-text" : "text-bz-text-muted hover:text-bz-text"}`}
            >
              <Icon size={13} /><span className="hidden sm:inline">{t.label}</span>
              {isActive && <span className="absolute -bottom-px left-2 right-2 h-[2px] rounded-bz-pill bg-bz-text sm:left-3 sm:right-3" />}
            </button>
          );
        })}
      </div>
      {/* all panels stay mounted (state retained); inactive ones are hidden */}
      <div className="p-5 md:p-6">
        <div className={cn(tab !== "lines" && "hidden")}><LineItemsTab onOpenItem={onOpenItem} currency={currency} /></div>
        <div className={cn(tab !== "activity" && "hidden")}><ActivityTab /></div>
        <div className={cn(tab !== "billing" && "hidden")}><BillingTab /></div>
        <div className={cn(tab !== "files" && "hidden")}><AttachmentsTab onDownload={onDownload} onPreview={onPreview} /></div>
        <div className={cn(tab !== "related" && "hidden")}><RelatedTab active={tab === "related"} onOpen={onOpenRelated} docNo={docNo} /></div>
        <div className={cn(tab !== "system" && "hidden")}><SystemInfoTab active={tab === "system"} onCancelWorkflow={onCancelWorkflow} /></div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 11 · RAIL  totals · parties · details · classification · custom fields
// ════════════════════════════════════════════════════════════════════════════

function TotalsCard({ currency }: { currency: string }) {
  const totals = React.useMemo(() => {
    let subtotal = 0, discount = 0, tax = 0, total = 0;
    for (const l of LINES) {
      const c = computeLine(l);
      subtotal += c.gross; discount += c.discAmt; tax += c.taxAmt; total += c.net;
    }
    return { subtotal, discount, tax, total };
  }, []);
  return (
    <RailCard>
      <div className="flex items-center justify-between">
        <CardLabel>Order total</CardLabel>
        <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text-muted">{currency}</span>
      </div>
      <div className="mt-3 space-y-2.5">
        <div className="flex items-center justify-between"><span className="text-[12px] text-bz-text-muted">Subtotal</span><span className={`text-[12.5px] text-bz-text ${NUM}`}>{money(totals.subtotal)}</span></div>
        <div className="flex items-center justify-between"><span className="text-[12px] text-bz-text-muted">Discount</span><span className={`text-[12.5px] text-bz-text-muted ${NUM}`}>{totals.discount ? `−${money(totals.discount)}` : "—"}</span></div>
        <div className="flex items-center justify-between"><span className="text-[12px] text-bz-text-muted">VAT / tax</span><span className={`text-[12.5px] text-bz-text ${NUM}`}>{money(totals.tax)}</span></div>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-t border-bz-line-soft pt-3">
        <span className="text-[12px] font-medium text-bz-text">Grand total</span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-[10.5px] font-semibold text-bz-text-muted">{currency}</span>
          <span className={`text-[20px] font-semibold text-bz-text ${NUM}`}>{money(totals.total)}</span>
        </span>
      </div>
    </RailCard>
  );
}

function PartiesCard({ onOpen }: { onOpen: (label: string) => void }) {
  return (
    <RailCard>
      <CardLabel>Parties</CardLabel>
      <button onClick={() => onOpen(DOC.party)} className="group mt-3 flex w-full items-center gap-3 text-left">
        <Avatar name={DOC.party} tone="fire" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[13px] font-semibold text-bz-text">
            <span className="truncate group-hover:underline">{DOC.party}</span>
            <ArrowUpRight size={11} className="shrink-0 text-bz-text-muted" />
          </p>
          <p className="text-[10.5px] text-bz-text-muted">{dash(DOC.partyMeta)}</p>
        </div>
      </button>
      <div className="mt-3 flex items-center gap-3 border-t border-bz-line-soft pt-3">
        <Avatar name={DOC.salesRep} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">Sales rep</p>
          <p className="text-[12.5px] font-medium text-bz-text">{dash(DOC.salesRep)}</p>
          <p className="text-[10.5px] text-bz-text-muted">{dash(DOC.salesRepMeta)}</p>
        </div>
      </div>
    </RailCard>
  );
}

function DetailsCard({ onOpenSource }: { onOpenSource: () => void }) {
  const foreign = DOC.exchangeRate !== 1; // conditional: currency/rate only for foreign currency
  return (
    <RailCard>
      <CardLabel>Details</CardLabel>
      <div className="mt-3">
        <RailRow label="Order date" value={<span className="inline-flex items-center gap-1.5"><CalendarDays size={12} className="text-bz-text-soft" />{dash(DOC.orderDate)}</span>} />
        <RailRow label="Expected delivery" value={dash(DOC.expectedDelivery)} accent />
        <RailRow label="Location" value={<span className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-bz-text-soft" />{dash(DOC.location)}</span>} />
        {MULTI_ORG && <RailRow label="Subsidiary" value={<span className="inline-flex items-center gap-1.5"><Building2 size={12} className="text-bz-text-soft" />{dash(DOC.subsidiary.split(" · ")[0])}</span>} />}
        {foreign && <RailRow label="Currency" value={dash(DOC.currency)} />}
        {foreign && <RailRow label="Exchange rate" value={money(DOC.exchangeRate)} />}
        {/* source document — navigable when a target exists, plain text otherwise */}
        {DOC.source.href ? (
          <RailRow label={`Source ${DOC.source.type.toLowerCase()}`} value={dash(DOC.source.ref)} onClick={onOpenSource} />
        ) : (
          <RailRow label={`Source ${DOC.source.type.toLowerCase()}`} value={dash(DOC.source.ref)} />
        )}
      </div>
      <div className="mt-4 border-t border-bz-line-soft pt-3">
        <p className="text-[10px] uppercase tracking-[0.06em] text-bz-text-soft">Memo</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-bz-text">{dash(DOC.memo)}</p>
      </div>
    </RailCard>
  );
}

function Collapsible({ icon: Icon, title, defaultOpen = false, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-5 py-4 text-left">
        <Icon size={13} className="text-bz-text-muted" />
        <span className="flex-1"><CardLabel>{title}</CardLabel></span>
        <ChevronDown size={13} className={`text-bz-text-muted transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// custom-field renderer — switches display per type, dash for empty lookups
function CustomFieldValue({ field }: { field: CustomField }) {
  const v = field.value;
  const empty = v === null || v === undefined || v === "";
  switch (field.type) {
    case "number":
      return <span className={NUM}>{empty ? "—" : Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>;
    case "percent":
      return <span className={NUM}>{empty ? "—" : `${v}%`}</span>;
    case "date":
      return <span className={NUM}>{empty ? "—" : parseLocalDate(String(v)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>;
    case "datetime":
      return <span className={NUM}>{empty ? "—" : parseLocalDate(String(v)).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>;
    case "time":
      return <span className={NUM}>{empty ? "—" : String(v)}</span>;
    case "checkbox":
      return v ? (
        <span className="inline-flex items-center gap-1 text-bz-leaf-deep"><Check size={13} /> Yes</span>
      ) : (
        <span className="text-bz-text-muted">No</span>
      );
    case "multiline":
      return <span className="block whitespace-pre-line text-right text-[12px] font-normal leading-relaxed">{empty ? "—" : String(v)}</span>;
    case "multilookup": {
      const arr = Array.isArray(v) ? v : [];
      return arr.length === 0 ? <span>—</span> : (
        <span className="flex flex-wrap justify-end gap-1">
          {arr.map((x) => <span key={String(x)} className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text">{String(x)}</span>)}
        </span>
      );
    }
    case "lookup":
    case "text":
    default:
      return <span>{empty ? "—" : String(v)}</span>;
  }
}

function CustomFieldsCard() {
  const ordered = [...CUSTOM_FIELDS].sort((a, b) => a.order - b.order);
  return (
    <Collapsible icon={SlidersHorizontal} title="Custom fields">
      <div className="-mt-1">
        {ordered.map((f) => (
          <div key={f.id} className="flex items-start justify-between gap-3 border-t border-bz-line-soft py-2.5 first:border-t-0 first:pt-0">
            <span className="shrink-0 text-[11.5px] text-bz-text-muted">{f.label}</span>
            <span className="min-w-0 text-right text-[12.5px] font-medium text-bz-text"><CustomFieldValue field={f} /></span>
          </div>
        ))}
      </div>
    </Collapsible>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 12 · DIALOGS + TOAST + PREVIEW (portal)
// ════════════════════════════════════════════════════════════════════════════

type ConfirmState = { title: string; message: React.ReactNode; confirmLabel: string; danger: boolean; onConfirm: () => void };

function ConfirmDialog({ state, onClose }: { state: ConfirmState | null; onClose: () => void }) {
  if (!state) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-24">
      <div onClick={onClose} className="absolute inset-0 bg-bz-olive/35 backdrop-blur-[1px]" aria-hidden />
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <div className={cn("flex items-center justify-between border-b px-4 py-3", state.danger ? "border-bz-line-soft bg-[#FBE5E2]" : "border-bz-line-soft bg-bz-paper")}>
          <div className="flex items-center gap-2">
            {state.danger ? <AlertTriangle size={15} className="text-[#9A2E29]" /> : <Info size={15} className="text-bz-text-muted" />}
            <p className={cn("text-[13px] font-semibold", state.danger ? "text-[#9A2E29]" : "text-bz-text")}>{state.title}</p>
          </div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
        </div>
        <div className="px-4 py-4"><div className="text-[12.5px] leading-relaxed text-bz-text">{state.message}</div></div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-4 py-3">
          <button onClick={onClose} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">Dismiss</button>
          <button
            onClick={() => { state.onConfirm(); onClose(); }}
            className={cn("inline-flex h-9 items-center gap-1.5 rounded-bz-md px-3.5 text-[12px] font-semibold", state.danger ? "bg-[#9A2E29] text-bz-text-on-dark hover:opacity-95" : "bg-bz-deep text-bz-text-on-dark hover:opacity-95")}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const MIN_REASON = 10;

function ReasonDialog({ open, docNo, onClose, onConfirm }: { open: boolean; docNo: string; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  React.useEffect(() => { if (open) { setReason(""); setTouched(false); } }, [open]);
  if (!open) return null;
  const invalid = reason.trim().length < MIN_REASON;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-24">
      <div onClick={onClose} className="absolute inset-0 bg-bz-olive/35 backdrop-blur-[1px]" aria-hidden />
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <div className="flex items-center justify-between border-b border-bz-line-soft bg-[#FBE5E2] px-4 py-3">
          <div className="flex items-center gap-2"><Ban size={15} className="text-[#9A2E29]" /><p className="text-[13px] font-semibold text-[#9A2E29]">Cancel sales order?</p></div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-bz-sm text-[#9A2E29] hover:bg-[#F6D5D1]"><X size={11} /></button>
        </div>
        <div className="px-4 py-4">
          <p className="text-[12.5px] leading-relaxed text-bz-text">
            Cancelling <span className={`font-semibold ${NUM}`}>{docNo}</span> reverses its stock movements and resets the source estimate to open. This can't be undone.
          </p>
          <label className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">Reason for cancellation</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={3}
            placeholder="e.g. Customer cancelled the phase-2 expansion; order superseded by SO-1061."
            className={cn("mt-1.5 w-full resize-none rounded-bz-md border bg-bz-paper px-3 py-2 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft", touched && invalid ? "border-[#C0413A] focus:border-[#C0413A]" : "border-bz-line focus:border-bz-text-muted")}
          />
          <div className="mt-1 flex items-center justify-between">
            {touched && invalid ? (
              <span className="text-[11px] font-medium text-[#9A2E29]">Please give at least {MIN_REASON} characters.</span>
            ) : (
              <span className="text-[10.5px] text-bz-text-soft">Recorded on the audit trail.</span>
            )}
            <span className={`text-[10.5px] ${NUM} ${invalid ? "text-bz-text-soft" : "text-bz-leaf-deep"}`}>{reason.trim().length}/{MIN_REASON}</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-4 py-3">
          <button onClick={onClose} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">Keep order</button>
          <button
            onClick={() => { if (!invalid) onConfirm(reason.trim()); else setTouched(true); }}
            disabled={invalid}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <Ban size={12} /> Cancel order
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PreviewModal({ file, onClose }: { file: FileRow | null; onClose: () => void }) {
  if (!file) return null;
  const Icon = FILE_ICON[file.kind];
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-16">
      <div onClick={onClose} className="absolute inset-0 bg-bz-olive/40 backdrop-blur-[1px]" aria-hidden />
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <div className="flex items-center justify-between border-b border-bz-line-soft bg-bz-paper px-4 py-3">
          <div className="flex min-w-0 items-center gap-2"><Icon size={15} className="shrink-0 text-bz-text-muted" /><p className="truncate text-[13px] font-semibold text-bz-text">{file.name}</p></div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 bg-bz-paper-warm/40 px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-bz-lg bg-bz-surface text-bz-text-muted"><Icon size={26} /></span>
          <p className="text-[12.5px] font-medium text-bz-text">{file.kind.toUpperCase()} preview</p>
          <p className={`text-[11px] text-bz-text-muted ${NUM}`}>{file.folder} · {file.size}</p>
        </div>
        <div className="flex items-center justify-end border-t border-bz-line-soft bg-bz-paper px-4 py-3">
          <button onClick={onClose} className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">Close preview</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Toast({ toast, onClose }: { toast: { msg: string; tone: "success" | "warning" }; onClose: () => void }) {
  const warning = toast.tone === "warning";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[92vw] items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-pill", warning ? "bg-[#FBE5E2]" : "bg-bz-fire/[0.18]")}>
          {warning ? <AlertTriangle size={13} className="text-[#9A2E29]" /> : <Check size={13} className="text-bz-leaf-deep" />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.msg}</p>
        <button onClick={onClose} className="ml-2 flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 13 · GATED RENDER  full-page skeleton until the order resolves
// ════════════════════════════════════════════════════════════════════════════

const SK = "animate-pulse rounded-bz-sm bg-bz-paper-warm";

function PageSkeleton() {
  return (
    <>
      <header className="border-b border-bz-line-soft bg-bz-paper px-4 pb-5 pt-5 md:px-8">
        <div className={`h-3 w-32 ${SK}`} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className={`h-7 w-28 ${SK}`} /><div className={`h-5 w-32 ${SK}`} /></div>
          <div className="flex gap-2"><div className={`h-9 w-28 ${SK}`} /><div className={`h-9 w-9 ${SK}`} /><div className={`h-9 w-9 ${SK}`} /></div>
        </div>
      </header>
      <div className="px-4 py-5 md:px-8">
        <div className={`h-28 w-full ${SK}`} />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className={`h-[460px] w-full ${SK}`} />
          <div className="flex flex-col gap-4"><div className={`h-44 w-full ${SK}`} /><div className={`h-40 w-full ${SK}`} /></div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 pb-10 text-bz-text-muted">
        <Loader2 size={15} className="animate-spin text-bz-fire" />
        <span className="text-[12px] font-medium">Loading order…</span>
      </div>
    </>
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
      <span className="font-semibold text-bz-text">Order Record</span>
    </>
  );
}

export function SalesOrderRecordDesignPage() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const docNo = params.id ?? "SO-1047";

  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [lc, setLc] = React.useState<Lifecycle>(INITIAL_LC);
  const [toast, setToast] = React.useState<{ msg: string; tone: "success" | "warning" } | null>(null);
  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null);
  const [reasonOpen, setReasonOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<FileRow | null>(null);

  // gated render — nothing shows until the order resolves
  React.useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, []);

  // auto-dismiss toast
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = React.useCallback((msg: string, tone: "success" | "warning" = "success") => setToast({ msg, tone }), []);

  const status = liveStatus(lc);
  const gates = gatesOf(lc);
  // a cancelled / closed order's workflow is inactive — no transitions offered
  const transitions = lc.workflowApplied && gates.open ? WORKFLOW[lc.workflowState] ?? [] : [];

  // a workflow transition POSTs, toasts, then "reloads" so everything recomputes
  const applyTransition = (t: Transition) => {
    setBusy(true);
    notify(`Applying “${t.label}”…`);
    setTimeout(() => {
      setLc((prev) => ({ ...prev, workflowState: t.to }));
      setBusy(false);
      notify(`Order moved to “${t.to}”.`);
    }, 750);
  };

  // progression actions advance the lifecycle in-place so the tracker, status
  // indicator and the whole action cluster recompute live (shared gating demo).
  const onDeliver = () => {
    const fulfilment: Fulfilment = lc.fulfilment === "pending" ? "partial" : "delivered";
    setLc((p) => ({ ...p, fulfilment }));
    notify(fulfilment === "delivered" ? "Delivery created — all lines now delivered." : "Delivery created — fulfilment updated.");
  };
  const onInvoice = () => {
    const invoice: Invoicing = lc.invoice === "pending" ? "partial" : "invoiced";
    setLc((p) => ({ ...p, invoice }));
    notify(invoice === "invoiced" ? "Invoice created — order fully invoiced." : "Invoice created — billing updated.");
  };
  const onPrint = () => notify(`Print view for ${docNo} opened in a new tab.`);
  const onCopy = () => notify(`${docNo} copied into a new draft order.`);

  // build the action cluster from state (data-driven)
  const progression: Action[] = [];
  if (gates.canDeliver) progression.push({ key: "deliver", label: "Create Delivery", icon: Truck, onClick: onDeliver });
  if (gates.canInvoice) progression.push({ key: "invoice", label: "Create Invoice", icon: ReceiptText, onClick: onInvoice });
  const transitionActions: Action[] = transitions.map((t) => ({ key: `wf-${t.to}`, label: t.label, icon: GitBranch, onClick: () => applyTransition(t), workflow: true }));

  // When the workflow still needs a decision (held / pending / rejected) the
  // transition leads the cluster — matching the on-hold banner and the dimmed
  // tracker. Otherwise the progression move (deliver / invoice) leads.
  const needsWorkflow = lc.workflowApplied && !gates.approvedByWorkflow && transitionActions.length > 0;
  let primary: Action | null;
  let ghosts: Action[];
  if (needsWorkflow) {
    primary = transitionActions[0];
    ghosts = [...transitionActions.slice(1), ...progression];
  } else if (progression.length) {
    primary = progression[0];
    ghosts = [...progression.slice(1), ...transitionActions];
  } else if (transitionActions.length) {
    primary = transitionActions[0];
    ghosts = transitionActions.slice(1);
  } else {
    primary = null;
    ghosts = [];
  }

  // close / cancel / delete flows
  const onClose = () =>
    setConfirm({
      title: "Close order?",
      message: <>Closing <span className={`font-semibold ${NUM}`}>{docNo}</span> marks it complete and locks it to further changes. You can still view it and its documents.</>,
      confirmLabel: "Close order",
      danger: false,
      onConfirm: () => { setLc((p) => ({ ...p, closed: true })); notify(`${docNo} closed.`); },
    });
  const onDelete = () =>
    setConfirm({
      title: "Delete order?",
      message: <>Deleting <span className={`font-semibold ${NUM}`}>{docNo}</span> permanently removes the record. This can't be undone.</>,
      confirmLabel: "Delete order",
      danger: true,
      onConfirm: () => { notify(`${docNo} deleted.`, "warning"); navigate("/design/sales-order-list"); },
    });

  // attachment download — one file simulates a fetch failure → warning toast
  const onDownload = (f: FileRow) => {
    if (f.willFail) notify(`Couldn't fetch “${f.name}”. Try again in a moment.`, "warning");
    else notify(`Downloading “${f.name}”…`);
  };

  return (
    <AppShell
      breadcrumb={<Breadcrumb />}
      overlay={
        <>
          <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
          <ReasonDialog
            open={reasonOpen}
            docNo={docNo}
            onClose={() => setReasonOpen(false)}
            onConfirm={(reason) => { setReasonOpen(false); setLc((p) => ({ ...p, cancelled: true })); notify(`${docNo} cancelled — ${reason}`, "warning"); }}
          />
          <PreviewModal file={preview} onClose={() => setPreview(null)} />
          {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
        </>
      }
    >
      {!loaded ? (
        <PageSkeleton />
      ) : (
        <>
          <CommandHeader
            docNo={docNo}
            status={status}
            busy={busy}
            primary={primary}
            ghosts={ghosts}
            onPrint={onPrint}
            menu={
              <OverflowMenu
                gates={gates}
                busy={busy}
                editHref={`/design/sales-order-list/${docNo}/edit`}
                mobileActions={ghosts}
                onCopy={onCopy}
                onClose={onClose}
                onCancel={() => setReasonOpen(true)}
                onDelete={onDelete}
              />
            }
          />

          <div className="px-4 py-5 md:px-8">
            <LifecycleTracker lc={lc} gates={gates} />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                <TabbedPanel
                  docNo={docNo}
                  currency={DOC.currency}
                  onOpenItem={(item) => notify(`Opening item “${item}” in a new tab…`)}
                  onOpenRelated={(r) => notify(`Opening ${r.type} ${r.doc} in a new tab…`)}
                  onDownload={onDownload}
                  onPreview={(f) => setPreview(f)}
                  onCancelWorkflow={(name) => notify(`Workflow “${name}” cancelled.`, "warning")}
                />
              </div>

              <aside className="flex flex-col gap-4">
                <TotalsCard currency={DOC.currency} />
                <PartiesCard onOpen={(label) => notify(`Opening “${label}” in a new tab…`)} />
                <DetailsCard onOpenSource={() => notify(`Opening ${DOC.source.type} ${DOC.source.ref} in a new tab…`)} />
                <Collapsible icon={Tag} title="Classification">
                  <div className="-mt-1">
                    {CLASSIFICATION.map((c) => (
                      <RailRow key={c.label} label={c.label} value={dash(c.value)} />
                    ))}
                  </div>
                </Collapsible>
                {/* custom-fields disclosure present only when custom fields exist */}
                {CUSTOM_FIELDS.length > 0 && <CustomFieldsCard />}
              </aside>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
