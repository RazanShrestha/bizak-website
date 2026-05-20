import * as React from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Printer,
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  Copy,
  Lock,
  Trash2,
  AlertTriangle,
  Check,
  X,
  FileText,
  Receipt,
  Truck,
  Info,
  Briefcase,
  Layers,
  Eye,
  Download,
  Search,
  PauseCircle,
  RotateCcw,
} from "lucide-react";
import { AppShell, ORDERS } from "./SalesOrderListDesignPage";

// ════════════════════════════════════════════════════════════════════════════
// DETAIL DATA — base = SO-1047 (Approved, Partial Fulfill, Partial Bill).
// Overrides per ID flip the workflow state + visibility flags.
// ════════════════════════════════════════════════════════════════════════════

type Line = {
  sn: number;
  item: string;
  itemCode: string;
  description: string;
  unit: string;
  qty: number;
  priceLevel: string;
  rate: string;
  discPct: string;
  discAmt: string;
  gross: string;
  taxCode: string;
  taxPct: string;
  taxAmt: string;
  net: string;
};

type InventoryDetailRow = {
  n: number;
  batch: string;
  serial: string;
  expiry: string;
  date: string;
  qty: number;
};

type WorkflowAction = {
  label: string;
  tone: "approve" | "reject" | "neutral";
};

type DetailData = {
  id: string;
  party: string;
  partyMeta: string;
  salesRep: string;
  salesRepMeta: string;
  sourceEstimate: string | null;

  // header
  date: string;
  subsidiary: string;
  expectedDelivery: string;
  supplierPo: string;
  location: string;
  currency: string;
  exchangeRate: string;
  memo: string;

  // classification
  clazz: string;
  department: string;
  project: string;
  partner: string;

  // statuses + visibility flags
  isApproved: boolean;
  isClosed: boolean;
  workflowConfigured: boolean;
  workflowState: string;
  orderStatus: string;
  fulfillment: string;
  billing: string;

  // workflow actions
  workflowActions: WorkflowAction[];

  // action bar permissions
  canConvertInvoice: boolean;
  canConvertFulfillment: boolean;
  canEdit: boolean;
  canClose: boolean;
  canDelete: boolean;

  // tenant + entity flags
  multiSubsidiary: boolean;
  hasCustomFields: boolean;

  // lines & inventory
  lines: Line[];
  inventoryDetail: Record<number, InventoryDetailRow[]>;

  // totals
  subtotal: string;
  discount: string;
  vat: string;
  total: string;

  // audit
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
  internalId: string;
};

const SO_1047_LINES_FULL: Line[] = [
  { sn: 1, item: "Industrial Coupling A-220",    itemCode: "ICP-A220",  description: "Standard duty coupling, zinc-plated", unit: "pcs", qty: 12, priceLevel: "STD",  rate: "18,500",  discPct: "0",   discAmt: "0",       gross: "222,000",   taxCode: "VAT", taxPct: "13", taxAmt: "28,860",  net: "250,860"   },
  { sn: 2, item: "Hydraulic Pump HP-7",           itemCode: "HP7-2026", description: "Phase-2 high-pressure pump unit",      unit: "pcs", qty:  4, priceLevel: "STD",  rate: "142,000", discPct: "2.5", discAmt: "14,200",  gross: "553,800",   taxCode: "VAT", taxPct: "13", taxAmt: "71,994",  net: "625,794"   },
  { sn: 3, item: "Mounting Plate Set",            itemCode: "MPS-006",  description: "Pkg of 6 · stainless-steel mount plate", unit: "pkg", qty: 30, priceLevel: "BULK", rate: "11,200",  discPct: "0",   discAmt: "0",       gross: "336,000",   taxCode: "VAT", taxPct: "13", taxAmt: "43,680",  net: "379,680"   },
  { sn: 4, item: "Service & Installation",         itemCode: "SVC-INS",  description: "On-site fitting + first-run validation", unit: "hrs", qty:  1, priceLevel: "STD",  rate: "114,000", discPct: "0",   discAmt: "0",       gross: "114,000",   taxCode: "EXM", taxPct: "0",  taxAmt: "0",       net: "114,000"   },
];

const SO_1047_INVENTORY: Record<number, InventoryDetailRow[]> = {
  2: [
    { n: 1, batch: "B-2026-A", serial: "HP7-2026-0188", expiry: "—", date: "May 17, 2026", qty: 1 },
    { n: 2, batch: "B-2026-A", serial: "HP7-2026-0189", expiry: "—", date: "May 17, 2026", qty: 1 },
    { n: 3, batch: "B-2026-A", serial: "HP7-2026-0190", expiry: "—", date: "May 17, 2026", qty: 1 },
    { n: 4, batch: "B-2026-A", serial: "HP7-2026-0191", expiry: "—", date: "May 17, 2026", qty: 1 },
  ],
};

const BASE_DETAIL: DetailData = {
  id: "SO-1047",
  party: "Apex Manufacturing Pvt Ltd",
  partyMeta: "Industrial · Pokhara · Nepal",
  salesRep: "Priya Maharjan",
  salesRepMeta: "NP-02 · Pokhara office",
  sourceEstimate: "EST-2241",

  date: "May 17, 2026",
  subsidiary: "NP-02 · Bizak Nepal Pokhara",
  expectedDelivery: "May 30, 2026",
  supplierPo: "APX-PO-9921",
  location: "Pokhara Warehouse 02",
  currency: "NPR",
  exchangeRate: "1.0000",
  memo: "Bulk order — phase-2 install for Apex's Bharatpur plant. Confirm crane availability before fulfillment.",

  clazz: "Industrial",
  department: "Sales — Pokhara",
  project: "APEX-PH2",
  partner: "—",

  isApproved: true,
  isClosed: false,
  workflowConfigured: true,
  workflowState: "Approved",
  orderStatus: "Open",
  fulfillment: "Partial Fulfill",
  billing: "Partial Bill",

  workflowActions: [{ label: "Hold", tone: "neutral" }],

  canConvertInvoice: true,
  canConvertFulfillment: true,
  canEdit: false,
  canClose: true,
  canDelete: false,

  multiSubsidiary: true,
  hasCustomFields: true,

  lines: SO_1047_LINES_FULL,
  inventoryDetail: SO_1047_INVENTORY,

  subtotal: "NPR 1,225,800",
  discount: "NPR 14,200",
  vat: "NPR 28,400",
  total: "NPR 1,240,000",

  createdBy: "Priya Maharjan",
  createdAt: "May 17, 2026 · 11:05:24",
  modifiedBy: "Manas Singh",
  modifiedAt: "May 18, 2026 · 14:22:18",
  internalId: "000001047",
};

const DETAIL_OVERRIDES: Record<string, Partial<DetailData>> = {
  "SO-1048": {
    isApproved: false,
    workflowState: "Pending Approval",
    fulfillment: "Pending Deliver",
    billing: "Pending Bill",
    workflowActions: [
      { label: "Approve", tone: "approve" },
      { label: "Reject",  tone: "reject"  },
    ],
    canConvertInvoice: false,
    canConvertFulfillment: false,
    canEdit: true,
    canClose: false,
    canDelete: true,
  },
  "SO-1046": {
    fulfillment: "Delivered",
    billing: "Invoiced",
    workflowActions: [],
    canConvertInvoice: false,
    canConvertFulfillment: false,
  },
  "SO-1045": {
    isApproved: false,
    workflowState: "Rejected",
    fulfillment: "Pending Deliver",
    billing: "Pending Bill",
    workflowActions: [{ label: "Re-submit", tone: "approve" }],
    canConvertInvoice: false,
    canConvertFulfillment: false,
    canEdit: true,
    canClose: false,
    canDelete: true,
  },
};

function getDetail(id: string): DetailData {
  const order = ORDERS.find((o) => o.id === id);
  const overrides = DETAIL_OVERRIDES[id] ?? {};
  return {
    ...BASE_DETAIL,
    ...overrides,
    id,
    party: order?.party ?? BASE_DETAIL.party,
    date: order?.date ?? BASE_DETAIL.date,
    location: order?.location ?? BASE_DETAIL.location,
    subsidiary: order ? `${order.subsidiary} · Bizak` : BASE_DETAIL.subsidiary,
    fulfillment: order?.fulfill ?? BASE_DETAIL.fulfillment,
    billing: order?.bill ?? BASE_DETAIL.billing,
    workflowState:
      overrides.workflowState ??
      (order?.approval === "Approved" ? "Approved" :
       order?.approval === "Rejected" ? "Rejected" :
       order?.approval === "Pending"  ? "Pending Approval" :
                                        BASE_DETAIL.workflowState),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED visual atoms
// ════════════════════════════════════════════════════════════════════════════

function StatusInline({
  kind,
  label,
  tone,
}: {
  kind: string;
  label: string;
  tone: "fire" | "leaf" | "neutral" | "danger";
}) {
  const dot =
    tone === "fire"    ? "bg-bz-leaf-deep" :
    tone === "leaf"    ? "bg-bz-fire"      :
    tone === "danger"  ? "bg-[#C0413A]"    :
                         "bg-bz-text-soft";
  return (
    <span className="inline-flex items-center gap-2 text-[12.5px]">
      <span className="text-bz-text-muted">{kind}</span>
      <span className={`size-1.5 rounded-bz-pill ${dot}`} />
      <span className="font-medium text-bz-text">{label}</span>
    </span>
  );
}

function FieldCell({ label, value, full }: { label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-[11px] text-bz-text-muted">
        {label}
      </p>
      <p className="mt-1 text-[13px] text-bz-text">{value}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BREADCRUMB clickable trail back to the list
// ════════════════════════════════════════════════════════════════════════════

function DetailBreadcrumb({ id }: { id: string }) {
  return (
    <>
      <span className="text-bz-text-muted">Sales &amp; CRM</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <Link to="/design/sales-order-list" className="text-bz-text-muted hover:text-bz-text">
        Sales Order
      </Link>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">View · {id}</span>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER BANNER back · title + party · status badges
// ════════════════════════════════════════════════════════════════════════════

function HeaderArea({
  d,
  onClose,
  onDelete,
}: {
  d: DetailData;
  onClose: () => void;
  onDelete: () => void;
}) {
  const showFulfill      = d.isApproved;
  const showBilling      = d.isApproved && !d.isClosed;
  const showWorkflow     = d.workflowConfigured;
  const showOrderStatus  = !d.workflowConfigured && d.workflowState !== "Approved";

  const prominentWorkflow = d.workflowActions.filter((a) => a.tone !== "neutral");

  return (
    <div className="border-b border-bz-line-soft bg-bz-paper px-4 pb-5 pt-6 md:px-8">
      <Link
        to="/design/sales-order-list"
        className="inline-flex items-center gap-1 text-[11.5px] text-bz-text-muted hover:text-bz-text"
      >
        <ChevronLeft size={11} />
        Sales Order
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[26px] font-semibold tracking-tight text-bz-text tabular-nums">
              {d.id}
            </h1>
            {d.isClosed && (
              <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10px] font-semibold text-bz-text-muted">
                <Lock size={9} /> Closed
              </span>
            )}
          </div>
          <p className="mt-1 text-[13.5px] text-bz-text-muted">
            {d.party}
            <span className="mx-2 text-bz-text-soft">·</span>
            Created {d.createdAt.split("·")[0].trim()}
          </p>
        </div>

        {/* Actions — at most two prominent buttons, then a More menu */}
        <div className="flex flex-wrap items-center gap-2">
          {prominentWorkflow.map((a) => (
            <WorkflowButton key={a.label} action={a} />
          ))}
          {d.canConvertFulfillment && (
            <button className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark">
              <Truck size={13} />
              Convert to Fulfillment
            </button>
          )}
          {d.canConvertInvoice && (
            <button className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
              <Receipt size={13} />
              Convert to Invoice
            </button>
          )}
          <MoreMenu d={d} onClose={onClose} onDelete={onDelete} />
        </div>
      </div>

      {/* Status row inline pills */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        {showWorkflow && (
          <StatusInline
            kind="Workflow"
            label={d.workflowState}
            tone={
              d.workflowState === "Approved" ? "fire"   :
              d.workflowState === "Rejected" ? "danger" :
                                               "neutral"
            }
          />
        )}
        {showOrderStatus && (
          <StatusInline kind="Order" label={d.orderStatus} tone="neutral" />
        )}
        {showFulfill && (
          <StatusInline
            kind="Fulfillment"
            label={d.fulfillment}
            tone={
              d.fulfillment === "Delivered"       ? "fire" :
              d.fulfillment === "Partial Fulfill" ? "leaf" :
                                                    "neutral"
            }
          />
        )}
        {showBilling && (
          <StatusInline
            kind="Billing"
            label={d.billing}
            tone={
              d.billing === "Invoiced"     ? "fire" :
              d.billing === "Partial Bill" ? "leaf" :
                                             "neutral"
            }
          />
        )}
      </div>
    </div>
  );
}

function MoreMenu({
  d,
  onClose,
  onDelete,
}: {
  d: DetailData;
  onClose: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const neutralWorkflow = d.workflowActions.filter((a) => a.tone === "neutral");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 items-center justify-center rounded-bz-md border px-2.5 text-bz-text ${
          open
            ? "border-bz-text bg-bz-surface"
            : "border-bz-line bg-bz-surface hover:bg-bz-paper-warm"
        }`}
        aria-label="More actions"
      >
        <MoreHorizontal size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-[42px] z-30 w-60 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <MoreItem icon={Printer} label="Print" />
          {neutralWorkflow.map((a) => (
            <MoreItem
              key={a.label}
              icon={a.label === "Hold" ? PauseCircle : RotateCcw}
              label={a.label}
            />
          ))}
          <div className="border-t border-bz-line-soft" />
          <MoreItem
            icon={Pencil}
            label="Edit"
            onClick={() => {
              setOpen(false);
              navigate(`/design/sales-order-list/${d.id}/edit`);
            }}
          />
          <MoreItem icon={Copy} label="Copy / Duplicate" />
          {d.canClose && (
            <MoreItem
              icon={Lock}
              label="Close order"
              onClick={() => {
                setOpen(false);
                onClose();
              }}
            />
          )}
          <div className="border-t border-bz-line-soft" />
          <MoreItem
            icon={Trash2}
            label="Delete"
            tone="danger"
            disabled={!d.canDelete}
            hint={!d.canDelete ? "Approved order — cannot delete" : undefined}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ACTION BAR workflow buttons + convert + print + more menu
// ════════════════════════════════════════════════════════════════════════════

function WorkflowButton({ action }: { action: WorkflowAction }) {
  if (action.tone === "approve") {
    return (
      <button className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark">
        <Check size={13} />
        {action.label}
      </button>
    );
  }
  if (action.tone === "reject") {
    return (
      <button className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-[#C0413A]/40 bg-[#FBE5E2] px-3.5 text-[12px] font-semibold text-[#9A2E29]">
        <X size={13} />
        {action.label}
      </button>
    );
  }
  return (
    <button className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper">
      {action.label === "Hold" ? <PauseCircle size={13} /> : <RotateCcw size={13} />}
      {action.label}
    </button>
  );
}

function MoreItem({
  icon: Icon,
  label,
  hint,
  tone,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  hint?: string;
  tone?: "danger";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left ${
        disabled ? "cursor-not-allowed" : "hover:bg-bz-paper-warm"
      }`}
    >
      <Icon
        size={13}
        className={
          disabled ? "text-bz-text-soft" :
          tone === "danger" ? "text-[#9A2E29]" :
                               "text-bz-text"
        }
        strokeWidth={1.7}
      />
      <div className="flex-1">
        <p
          className={`text-[12px] font-medium ${
            disabled ? "text-bz-text-soft" :
            tone === "danger" ? "text-[#9A2E29]" :
                                 "text-bz-text"
          }`}
        >
          {label}
        </p>
        {hint && (
          <p className="mt-0.5 text-[10px] text-bz-text-muted">{hint}</p>
        )}
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LEFT RAIL sales overview + customer + sales rep + linked documents
// ════════════════════════════════════════════════════════════════════════════

function LeftRail({
  d,
  onCustomerClick,
}: {
  d: DetailData;
  onCustomerClick: () => void;
}) {
  return (
    <aside className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      {/* Sales Overview */}
      <div className="px-5 py-5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          Sales overview
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-bz-text-muted">
          View and manage every detail of this sales order — line items, fulfillment, billing and approvals.
        </p>
      </div>

      {/* Customer */}
      <RailSection label="Customer">
        <button
          onClick={onCustomerClick}
          className="-mx-2 -my-1 flex w-[calc(100%+1rem)] items-start gap-3 rounded-bz-md px-2 py-1 text-left hover:bg-bz-paper-warm/60"
        >
          <Avatar text={d.party} tone="fire" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-bz-text">{d.party}</p>
            <p className="mt-0.5 text-[11px] text-bz-text-muted">{d.partyMeta}</p>
          </div>
          <ChevronRight size={12} className="mt-1 shrink-0 text-bz-text-muted" />
        </button>
      </RailSection>

      {/* Sales Rep */}
      <RailSection label="Sales representative">
        <div className="flex items-start gap-3">
          <Avatar text={d.salesRep} tone="neutral" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-bz-text">{d.salesRep}</p>
            <p className="mt-0.5 text-[11px] text-bz-text-muted">{d.salesRepMeta}</p>
          </div>
        </div>
      </RailSection>

      {/* Linked Documents */}
      <RailSection label="Linked documents">
        {d.sourceEstimate ? (
          <button className="flex w-full items-center gap-2.5 text-left">
            <FileText size={13} className="shrink-0 text-bz-text-muted" />
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] uppercase tracking-[0.06em] text-bz-text-soft">
                Estimate · source
              </p>
              <p className="mt-0.5 truncate text-[12.5px] font-semibold tabular-nums text-bz-text">
                {d.sourceEstimate}
              </p>
            </div>
            <ArrowUpRight size={12} className="shrink-0 text-bz-text-muted" />
          </button>
        ) : (
          <p className="text-[11.5px] text-bz-text-muted">No linked documents yet.</p>
        )}
      </RailSection>
    </aside>
  );
}

function RailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-bz-line-soft px-5 py-4">
      <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

function Avatar({ text, tone }: { text: string; tone: "fire" | "neutral" }) {
  const initials = text.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-bz-pill text-[11px] font-bold text-bz-text ${
        tone === "fire" ? "bg-bz-fire/[0.18]" : "bg-bz-paper-warm"
      }`}
    >
      {initials}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PRIMARY INFORMATION CARD field grid + collapsible classification + custom
// ════════════════════════════════════════════════════════════════════════════

function PrimaryInformation({ d }: { d: DetailData }) {
  const [classOpen, setClassOpen] = React.useState(true);
  const [customOpen, setCustomOpen] = React.useState(false);

  return (
    <section className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex items-center justify-between px-6 pt-5">
        <h2 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          Primary information
        </h2>
        <button
          disabled={!d.canEdit}
          className={`inline-flex h-7 items-center gap-1.5 rounded-bz-sm px-2 text-[11px] font-medium ${
            d.canEdit
              ? "text-bz-text hover:bg-bz-paper-warm"
              : "cursor-not-allowed text-bz-text-soft"
          }`}
        >
          <Pencil size={11} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-5 px-6 pb-6 pt-5 md:grid-cols-2">
        <FieldCell label="Document No."     value={<span className="tabular-nums font-semibold">{d.id}</span>} />
        {d.multiSubsidiary && (
          <FieldCell label="Subsidiary"     value={d.subsidiary} />
        )}
        <FieldCell label="Date"             value={d.date} />
        <FieldCell label="Expected delivery" value={d.expectedDelivery} />
        <FieldCell label="Supplier PO #"   value={<span className="tabular-nums">{d.supplierPo}</span>} />
        <FieldCell label="Location"         value={d.location} />
        <FieldCell label="Currency"         value={
          <span className="inline-flex items-center gap-1.5">
            {d.currency}
            <span className="text-[10.5px] text-bz-text-soft">Base</span>
          </span>
        } />
        <FieldCell label="Exchange rate"   value={<span className="tabular-nums">{d.exchangeRate}</span>} />
        <FieldCell
          label="Memo"
          full
          value={<span className="leading-relaxed text-bz-text">{d.memo}</span>}
        />
      </div>

      <CollapsiblePanel
        open={classOpen}
        onToggle={() => setClassOpen((v) => !v)}
        title="Classification"
      >
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
          <FieldCell label="Class"      value={d.clazz} />
          <FieldCell label="Department" value={d.department} />
          <FieldCell label="Project"    value={<span className="tabular-nums">{d.project}</span>} />
          <FieldCell label="Partner"    value={d.partner} />
        </div>
      </CollapsiblePanel>

      {d.hasCustomFields && (
        <CollapsiblePanel
          open={customOpen}
          onToggle={() => setCustomOpen((v) => !v)}
          title="Custom fields"
        >
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
            <FieldCell label="Plant"            value="Bharatpur · Industrial Park" />
            <FieldCell label="Commissioning by" value="Engineering — Phase 2" />
            <FieldCell
              label="Crane required"
              value={
                <span className="inline-flex items-center gap-1 text-bz-text">
                  <Check size={12} className="text-bz-leaf-deep" /> Yes
                </span>
              }
            />
            <FieldCell label="Reference quote" value={<span className="tabular-nums">QTE-APX-0188</span>} />
          </div>
        </CollapsiblePanel>
      )}
    </section>
  );
}

function CollapsiblePanel({
  open,
  onToggle,
  title,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-bz-line-soft px-6">
      <button
        onClick={onToggle}
        className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded-bz-sm py-3 text-left hover:bg-bz-paper-warm/40"
      >
        <span className="flex-1 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          {title}
        </span>
        <ChevronDown
          size={13}
          className={`text-bz-text-muted transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && <div className="pb-5 pt-1">{children}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ITEMS SECTION tab bar + item table + other tab placeholders
// ════════════════════════════════════════════════════════════════════════════

const TABS = [
  { key: "item",     label: "Item"                },
  { key: "activity", label: "Activity"            },
  { key: "billing",  label: "Billing"             },
  { key: "files",    label: "Files"               },
  { key: "related",  label: "Related Record"      },
  { key: "system",   label: "System Information"  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function ItemsSection({ d }: { d: DetailData }) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("item");

  return (
    <section className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex flex-wrap items-baseline gap-3 px-6 pt-5">
        <h2 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          Items
        </h2>
        <span className="text-[12px] text-bz-text-muted tabular-nums">
          · {d.lines.length} {d.lines.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Tabs text-only, underline indicator on hover/active */}
      <div className="mt-4 flex flex-wrap gap-0.5 border-b border-bz-line-soft px-4 md:px-6">
        {TABS.map((t) => {
          const active = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative px-2.5 py-2 text-[12px] ${
                active
                  ? "font-semibold text-bz-text"
                  : "text-bz-text-muted hover:text-bz-text"
              }`}
            >
              {t.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute -bottom-px left-2.5 right-2.5 h-[2px] rounded-bz-pill bg-bz-text"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-5 md:px-6">
        {activeTab === "item"     && <ItemTab     d={d} />}
        {activeTab === "activity" && <ActivityTab />}
        {activeTab === "billing"  && <BillingTab  />}
        {activeTab === "files"    && <FilesTab    />}
        {activeTab === "related"  && <RelatedTab  />}
        {activeTab === "system"   && <SystemTab   d={d} />}
      </div>
    </section>
  );
}

// ── ITEM TAB ───────────────────────────────────────────────────────────────

const ITEM_COLS: { label: string; align?: "right" | "left"; width?: number }[] = [
  { label: "",            width: 44  },
  { label: "S.N",         width: 42  },
  { label: "Item",        width: 160 },
  { label: "Description", width: 170 },
  { label: "Unit",        width: 56  },
  { label: "Qty",         align: "right", width: 64 },
  { label: "Price Lv.",   width: 74  },
  { label: "Rate",        align: "right", width: 96  },
  { label: "Disc %",      align: "right", width: 64  },
  { label: "Disc",        align: "right", width: 90  },
  { label: "Gross",       align: "right", width: 104 },
  { label: "Tax",         width: 62  },
  { label: "Tax %",       align: "right", width: 64  },
  { label: "Tax Amt",     align: "right", width: 94  },
  { label: "Net",         align: "right", width: 112 },
];

function ItemTab({ d }: { d: DetailData }) {
  const [expanded, setExpanded] = React.useState<Set<number>>(new Set([2]));

  function toggle(sn: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(sn)) next.delete(sn);
      else next.add(sn);
      return next;
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left" style={{ minWidth: 1280 }}>
        <thead>
          <tr className="border-y border-bz-line-soft">
            {ITEM_COLS.map((c, i) => (
              <th
                key={i}
                className={`px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted ${
                  c.align === "right" ? "text-right" : ""
                }`}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
          <tbody className="divide-y divide-bz-line-soft">
            {d.lines.map((l) => {
              const hasDetail = !!d.inventoryDetail[l.sn];
              const isExpanded = expanded.has(l.sn);
              return (
                <React.Fragment key={l.sn}>
                  <tr className={isExpanded ? "bg-bz-fire/[0.04]" : ""}>
                    <td className="px-3 py-3">
                      {hasDetail ? (
                        <button
                          onClick={() => toggle(l.sn)}
                          className="flex size-6 items-center justify-center rounded-bz-sm border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"
                        >
                          {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </button>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-[11px] tabular-nums text-bz-text-muted">{l.sn}</td>
                    <td className="px-3 py-3">
                      <button className="block max-w-[160px] truncate text-left text-[12px] font-semibold text-bz-text underline decoration-bz-line decoration-dotted underline-offset-2 hover:text-bz-fire">
                        {l.item}
                      </button>
                      <span className="block text-[10px] tabular-nums text-bz-text-muted">{l.itemCode}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block max-w-[170px] truncate text-[11.5px] text-bz-text-muted">
                        {l.description}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[11.5px] text-bz-text-muted">{l.unit}</td>
                    <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text">{l.qty}</td>
                    <td className="px-3 py-3 text-[10.5px] font-semibold text-bz-text-muted">{l.priceLevel}</td>
                    <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text">{l.rate}</td>
                    <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text-muted">{l.discPct}</td>
                    <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text-muted">{l.discAmt}</td>
                    <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text">{l.gross}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex h-5 items-center rounded-bz-sm bg-bz-paper-warm px-1.5 text-[10px] font-semibold text-bz-text-muted">
                        {l.taxCode}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text-muted">{l.taxPct}</td>
                    <td className="px-3 py-3 text-right text-[11.5px] tabular-nums text-bz-text">{l.taxAmt}</td>
                    <td className="px-3 py-3 text-right text-[12px] font-semibold tabular-nums text-bz-text">{l.net}</td>
                  </tr>
                  {isExpanded && hasDetail && (
                    <tr className="bg-bz-fire/[0.04]">
                      <td colSpan={ITEM_COLS.length} className="px-3 pb-4 pt-1">
                        <InventoryDetailTable rows={d.inventoryDetail[l.sn]} />
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

function InventoryDetailTable({ rows }: { rows: InventoryDetailRow[] }) {
  return (
    <div className="ml-10 rounded-bz-md border border-bz-line-soft bg-bz-surface">
      <div className="flex items-center justify-between border-b border-bz-line-soft px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Layers size={11} className="text-bz-text-muted" />
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">
            Inventory detail · {rows.length} batches
          </p>
        </div>
      </div>
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-bz-line-soft bg-bz-paper">
            <th className="w-10 px-3 py-2 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">#</th>
            <th className="px-3 py-2 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">Batch No</th>
            <th className="px-3 py-2 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">Serial No</th>
            <th className="w-24 px-3 py-2 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">Expiry</th>
            <th className="w-32 px-3 py-2 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">Date</th>
            <th className="w-16 px-3 py-2 text-right text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">Qty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bz-line-soft">
          {rows.map((r) => (
            <tr key={r.n}>
              <td className="px-3 py-2 text-[11px] tabular-nums text-bz-text-muted">{r.n}</td>
              <td className="px-3 py-2 text-[11.5px] tabular-nums text-bz-text">{r.batch}</td>
              <td className="px-3 py-2 text-[11.5px] tabular-nums text-bz-text">{r.serial}</td>
              <td className="px-3 py-2 text-[11.5px] text-bz-text-muted">{r.expiry}</td>
              <td className="px-3 py-2 text-[11.5px] tabular-nums text-bz-text-muted">{r.date}</td>
              <td className="px-3 py-2 text-right text-[11.5px] tabular-nums text-bz-text">{r.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── ACTIVITY TAB ───────────────────────────────────────────────────────────

const ACTIVITY_EVENTS = [
  { when: "May 18, 2026 · 14:22", actor: "Manas Singh",     event: "Approved the order",                                  type: "approve" },
  { when: "May 18, 2026 · 13:48", actor: "Priya Maharjan",  event: "Submitted for approval",                              type: "submit"  },
  { when: "May 18, 2026 · 09:14", actor: "Priya Maharjan",  event: "Updated delivery date to May 30, 2026",               type: "edit"    },
  { when: "May 17, 2026 · 11:05", actor: "Priya Maharjan",  event: "Created the order from Estimate EST-2241",            type: "create"  },
] as const;

function ActivityTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[11.5px] text-bz-text-muted">
          Every state change and user note on this order, in order of most recent.
        </p>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm">
          <Pencil size={11} /> Add note
        </button>
      </div>

      <div className="relative pl-5">
        <span aria-hidden className="absolute left-1.5 top-2 bottom-2 w-px bg-bz-line" />
        <div className="flex flex-col gap-4">
          {ACTIVITY_EVENTS.map((e, i) => (
            <div key={i} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[19px] top-1.5 size-3 rounded-bz-pill ring-2 ring-bz-surface ${
                  e.type === "approve" ? "bg-bz-leaf-deep" :
                  e.type === "submit"  ? "bg-bz-fire"      :
                                         "bg-bz-text-soft"
                }`}
              />
              <p className="text-[11px] tabular-nums text-bz-text-muted">{e.when}</p>
              <p className="mt-0.5 text-[12.5px] text-bz-text">
                <span className="font-semibold">{e.actor}</span> · {e.event}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── BILLING TAB ────────────────────────────────────────────────────────────

function BillingTab() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
      <FieldCell label="Tax ID (PAN No)" value={<span className="tabular-nums">600 455 782</span>} />
      <FieldCell label="Term"            value="Net 30" />
      <FieldCell
        label="Address"
        full
        value={<span className="leading-relaxed">Industrial Area Sector 7, Pokhara 33700, Nepal</span>}
      />
      <FieldCell label="Due date" value="Jun 16, 2026" />
      <FieldCell label="Outstanding" value={<span className="font-semibold tabular-nums">NPR 620,000</span>} />
    </div>
  );
}

// ── FILES TAB ──────────────────────────────────────────────────────────────

const FILES = [
  { ext: "PDF",  name: "Signed Quotation.pdf",     size: "1.2 MB", by: "Priya Maharjan", date: "May 17, 2026" },
  { ext: "DOCX", name: "Apex Phase-2 Spec.docx",   size: "340 KB", by: "Omar T.",        date: "May 16, 2026" },
  { ext: "XLSX", name: "Delivery Schedule.xlsx",   size: "820 KB", by: "Priya Maharjan", date: "May 17, 2026" },
  { ext: "JPG",  name: "Site Photos — Bharatpur.jpg", size: "4.1 MB", by: "David R.",     date: "May 12, 2026" },
];

const EXT_TONE: Record<string, string> = {
  PDF:  "bg-[#E45F4A] text-white",
  DOCX: "bg-[#3F7BC4] text-white",
  XLSX: "bg-bz-leaf-deep text-white",
  JPG:  "bg-bz-fire text-bz-olive",
};

function FilesTab() {
  return (
    <div className="flex flex-col gap-2">
      {FILES.map((f) => (
        <div
          key={f.name}
          className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 py-2.5"
        >
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-bz-sm text-[9.5px] font-bold tracking-[0.05em] ${EXT_TONE[f.ext] ?? "bg-bz-paper-warm text-bz-text-muted"}`}>
            {f.ext}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-bz-text">{f.name}</p>
            <p className="mt-0.5 text-[10.5px] text-bz-text-muted tabular-nums">
              {f.size} · {f.by} · {f.date}
            </p>
          </div>
          <button className="flex size-7 items-center justify-center rounded-bz-sm border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm">
            <Eye size={12} />
          </button>
          <button className="flex size-7 items-center justify-center rounded-bz-sm border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm">
            <Download size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── RELATED TAB ────────────────────────────────────────────────────────────

const RELATED = [
  { type: "Estimate",     ref: "EST-2241", note: "Source · approved", amount: "NPR 1,240,000", date: "May 16, 2026" },
  { type: "Fulfillment",  ref: "FUL-882",  note: "Partial · Pump HP-7", amount: "NPR 625,794",  date: "May 19, 2026" },
  { type: "Invoice",      ref: "INV-3120", note: "Partial bill",      amount: "NPR 620,000",  date: "May 19, 2026" },
];

function RelatedTab() {
  return (
    <div className="flex flex-col gap-2">
      {RELATED.map((r) => (
        <button
          key={r.ref}
          className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 py-2.5 text-left hover:bg-bz-surface"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-sm bg-bz-surface">
            <FileText size={14} className="text-bz-text" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">
                {r.type}
              </p>
              <span className="text-[10px] tabular-nums text-bz-text-muted">{r.date}</span>
            </div>
            <p className="mt-0.5 truncate text-[12.5px] font-semibold tabular-nums text-bz-text">
              {r.ref}
            </p>
            <p className="mt-0.5 truncate text-[10.5px] text-bz-text-muted">{r.note}</p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <span className="text-[12px] font-semibold tabular-nums text-bz-text">{r.amount}</span>
            <ArrowUpRight size={11} className="text-bz-text-muted" />
          </div>
        </button>
      ))}
    </div>
  );
}

// ── SYSTEM INFO TAB ───────────────────────────────────────────────────────

function SystemTab({ d }: { d: DetailData }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
      <FieldCell label="Created by"   value={<><span className="font-semibold">{d.createdBy}</span> · Sales Rep, NP-02</>} />
      <FieldCell label="Created date" value={<span className="tabular-nums">{d.createdAt}</span>} />
      <FieldCell label="Modified by"  value={<><span className="font-semibold">{d.modifiedBy}</span> · Admin</>} />
      <FieldCell label="Modified date" value={<span className="tabular-nums">{d.modifiedAt}</span>} />
      <FieldCell label="Internal ID"  value={<span className="tabular-nums">{d.internalId}</span>} />
      <FieldCell label="Document type" value="Sales Order" />
      <FieldCell label="Workflow"     value="Standard 3-tier approval" full />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY FOOTER under the items section
// ════════════════════════════════════════════════════════════════════════════

function ItemsSummaryFooter({ d }: { d: DetailData }) {
  return (
    <section className="flex flex-col gap-3 lg:items-end">
      <p className="inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
        <Info size={11} />
        Changes to the order value may trigger re-approval.
      </p>

      <div className="w-full rounded-bz-lg border border-bz-line-soft bg-bz-surface lg:w-[360px]">
        <SummaryRow label="Subtotal"  value={d.subtotal} />
        <SummaryRow label="Discount"  value={<span className="text-bz-text-muted">−{d.discount.replace("NPR ", "NPR ")}</span>} />
        <SummaryRow label="VAT / Tax" value={d.vat} />
        <div className="flex items-baseline justify-between border-t border-bz-line-soft px-5 py-4">
          <p className="text-[12px] font-medium text-bz-text">Invoice total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[10.5px] font-semibold text-bz-text-muted">{d.currency}</span>
            <span className="text-[22px] font-semibold tabular-nums text-bz-text">
              {d.total.replace("NPR ", "")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <p className="text-[12px] text-bz-text-muted">{label}</p>
      <p className="text-[13px] tabular-nums text-bz-text">{value}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DIALOGS Close confirm · Delete confirm · Customer picker
// ════════════════════════════════════════════════════════════════════════════

function DialogOverlay({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        className="absolute inset-0 z-30 bg-bz-olive/35 backdrop-blur-[1px]"
        aria-hidden
      />
      <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
        {children}
      </div>
    </>
  );
}

function DialogShell({
  title,
  badge,
  onClose,
  children,
  footer,
  maxWidth = 480,
}: {
  title: string;
  badge?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  maxWidth?: number;
}) {
  return (
    <div
      className="w-full overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]"
      style={{ maxWidth }}
    >
      <div className="flex items-center justify-between border-b border-bz-line bg-bz-paper-warm px-4 py-3">
        <div className="flex items-center gap-2.5">
          <p className="text-[13px] font-semibold text-bz-text">{title}</p>
          {badge}
        </div>
        <button
          onClick={onClose}
          className="flex size-7 items-center justify-center rounded-bz-sm border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <X size={11} />
        </button>
      </div>
      <div className="px-4 py-4">{children}</div>
      <div className="flex items-center justify-end gap-2 border-t border-bz-line bg-bz-paper px-4 py-3">
        {footer}
      </div>
    </div>
  );
}

function CloseConfirmDialog({ open, onClose, id }: { open: boolean; onClose: () => void; id: string }) {
  return (
    <DialogOverlay open={open} onClose={onClose}>
      <DialogShell
        title={`Close ${id}`}
        badge={
          <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10px] font-semibold text-bz-text-muted">
            <Lock size={9} /> Confirm action
          </span>
        }
        onClose={onClose}
        footer={
          <>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark"
            >
              <Lock size={11} /> Close order
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-fire/[0.18]">
            <Lock size={15} className="text-bz-text" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-bz-text">
              Close {id} for {BASE_DETAIL.party}?
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-bz-text-muted">
              Closing the order prevents further fulfillment or invoicing. Already-posted invoices remain intact and an audit entry is recorded.
            </p>
          </div>
        </div>
      </DialogShell>
    </DialogOverlay>
  );
}

function DeleteConfirmDialog({ open, onClose, id }: { open: boolean; onClose: () => void; id: string }) {
  return (
    <DialogOverlay open={open} onClose={onClose}>
      <DialogShell
        title={`Delete ${id}`}
        badge={
          <span className="inline-flex items-center gap-1 rounded-bz-pill bg-[#FBE5E2] px-2 py-0.5 text-[10px] font-semibold text-[#9A2E29]">
            Destructive
          </span>
        }
        onClose={onClose}
        footer={
          <>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3.5 text-[12px] font-semibold text-white"
            >
              <Trash2 size={11} /> Delete order
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-[#FBE5E2]">
            <AlertTriangle size={15} className="text-[#9A2E29]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-bz-text">
              Permanently delete {id}?
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-bz-text-muted">
              The order, its line items and any draft fulfillments will be removed. Already-posted invoices stay on the ledger; an audit entry is recorded.
            </p>
          </div>
        </div>
      </DialogShell>
    </DialogOverlay>
  );
}

const CUSTOMER_OPTIONS = [
  { name: "Apex Manufacturing Pvt Ltd", code: "C-1029", meta: "Industrial · Pokhara",   active: true  },
  { name: "Helio Distribution",         code: "C-2218", meta: "Distribution · Biratnagar", active: false },
  { name: "Himalayan Beverages Co.",    code: "C-3104", meta: "FMCG · Kathmandu",       active: false },
  { name: "Northwind Retail",           code: "C-4422", meta: "Retail · Lalitpur",      active: false },
  { name: "Sagar Trading House",        code: "C-5781", meta: "Trading · Bharatpur",    active: false },
];

function CustomerPickerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <DialogOverlay open={open} onClose={onClose}>
      <DialogShell
        title="Select customer"
        badge={
          <span className="inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10px] font-semibold text-bz-text-muted">
            Picker
          </span>
        }
        onClose={onClose}
        maxWidth={520}
        footer={
          <>
            <button
              onClick={onClose}
              className="mr-auto inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              <Briefcase size={11} /> New customer
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark"
            >
              Use customer
            </button>
          </>
        }
      >
        <div className="mb-3 flex h-9 items-center gap-2 rounded-bz-md border border-bz-line bg-bz-paper-warm px-3">
          <Search size={12} className="text-bz-text-muted" />
          <span className="text-[12px] text-bz-text-muted">Search customers…</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {CUSTOMER_OPTIONS.map((c) => (
            <button
              key={c.code}
              className={`flex items-center gap-3 rounded-bz-md border px-3 py-2.5 text-left ${
                c.active
                  ? "border-bz-fire/40 bg-bz-fire/[0.06]"
                  : "border-bz-line-soft bg-bz-paper-warm hover:bg-bz-surface"
              }`}
            >
              <span className="flex size-8 items-center justify-center rounded-bz-pill bg-bz-fire/[0.18] text-[10.5px] font-bold text-bz-text">
                {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-bz-text">{c.name}</p>
                <p className="mt-0.5 text-[10.5px] text-bz-text-muted tabular-nums">
                  {c.code} · {c.meta}
                </p>
              </div>
              {c.active && <Check size={13} className="text-bz-text" />}
            </button>
          ))}
        </div>
      </DialogShell>
    </DialogOverlay>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE composition
// ════════════════════════════════════════════════════════════════════════════

export function SalesOrderDetailDesignPage() {
  const { id } = useParams<{ id: string }>();
  const d = getDetail(id ?? "SO-1047");

  const [closeOpen, setCloseOpen]       = React.useState(false);
  const [deleteOpen, setDeleteOpen]     = React.useState(false);
  const [customerOpen, setCustomerOpen] = React.useState(false);

  return (
    <AppShell
      breadcrumb={<DetailBreadcrumb id={d.id} />}
      overlay={
        <>
          <CloseConfirmDialog  open={closeOpen}    onClose={() => setCloseOpen(false)}    id={d.id} />
          <DeleteConfirmDialog open={deleteOpen}   onClose={() => setDeleteOpen(false)}   id={d.id} />
          <CustomerPickerDialog open={customerOpen} onClose={() => setCustomerOpen(false)} />
        </>
      }
    >
      <HeaderArea
        d={d}
        onClose={() => setCloseOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <div className="grid grid-cols-1 gap-6 px-4 py-7 md:px-8 lg:grid-cols-[300px_1fr]">
        <LeftRail d={d} onCustomerClick={() => setCustomerOpen(true)} />
        <div className="flex min-w-0 flex-col gap-6">
          <PrimaryInformation d={d} />
          <ItemsSection d={d} />
          <ItemsSummaryFooter d={d} />
        </div>
      </div>
    </AppShell>
  );
}
