import * as React from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
  Check,
  Search,
  Calendar,
  Building2,
  FileText,
  ArrowUpRight,
  Loader2,
  Info,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { AppShell, ORDERS } from "./SalesOrderListDesignPage";

// ════════════════════════════════════════════════════════════════════════════
// TYPES + MOCK STATE seed data for both modes
// ════════════════════════════════════════════════════════════════════════════

type Mode = "create" | "edit";

type LineRow = {
  sn: number;
  item: string;
  description: string;
  unit: string;
  qty: string;
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

type FormData = {
  documentNo: string;
  subsidiary: string;
  party: string;
  partyMeta: string;
  salesRep: string;
  salesRepMeta: string;
  sourceDoc: { type: string; ref: string } | null;
  date: string;
  expectedDelivery: string;
  supplierPo: string;
  location: string;
  currency: string;
  exchangeRate: string;
  memo: string;
  // classification
  department: string;
  clazz: string;
  project: string;
  partner: string;
  // billing
  taxId: string;
  address: string;
  term: string;
  dueDate: string;
  // lines + totals
  lines: LineRow[];
  subtotal: string;
  discount: string;
  vat: string;
  total: string;
};

const EMPTY_LINE = (sn: number): LineRow => ({
  sn,
  item: "",
  description: "",
  unit: "",
  qty: "",
  priceLevel: "",
  rate: "",
  discPct: "",
  discAmt: "",
  gross: "0",
  taxCode: "",
  taxPct: "",
  taxAmt: "0",
  net: "0",
});

const CREATE_DATA: FormData = {
  documentNo: "(auto-generated on save)",
  subsidiary: "NP-01 · Bizak Nepal",
  party: "",
  partyMeta: "",
  salesRep: "",
  salesRepMeta: "",
  sourceDoc: null,
  date: "May 20, 2026",
  expectedDelivery: "",
  supplierPo: "",
  location: "",
  currency: "NPR",
  exchangeRate: "1.0000",
  memo: "",
  department: "",
  clazz: "",
  project: "",
  partner: "",
  taxId: "—",
  address: "—",
  term: "Net 30",
  dueDate: "Jun 19, 2026",
  lines: [EMPTY_LINE(1)],
  subtotal: "0",
  discount: "0",
  vat: "0",
  total: "0",
};

const EDIT_BASE: FormData = {
  documentNo: "SO-1047",
  subsidiary: "NP-02 · Bizak Nepal Pokhara",
  party: "Apex Manufacturing Pvt Ltd",
  partyMeta: "Industrial · Pokhara · Nepal",
  salesRep: "Priya Maharjan",
  salesRepMeta: "NP-02 · Pokhara office",
  sourceDoc: { type: "Estimate", ref: "EST-2241" },
  date: "May 17, 2026",
  expectedDelivery: "May 30, 2026",
  supplierPo: "APX-PO-9921",
  location: "Pokhara Warehouse 02",
  currency: "NPR",
  exchangeRate: "1.0000",
  memo: "Bulk order — phase-2 install for Apex's Bharatpur plant. Confirm crane availability before fulfillment.",
  department: "Sales — Pokhara",
  clazz: "Industrial",
  project: "APEX-PH2",
  partner: "",
  taxId: "600 455 782",
  address: "Industrial Area Sector 7, Pokhara 33700, Nepal",
  term: "Net 30",
  dueDate: "Jun 16, 2026",
  lines: [
    { sn: 1, item: "Industrial Coupling A-220",    description: "Standard duty coupling, zinc-plated",   unit: "pcs", qty: "12", priceLevel: "STD",  rate: "18,500",  discPct: "0",   discAmt: "0",      gross: "222,000",   taxCode: "VAT", taxPct: "13", taxAmt: "28,860",  net: "250,860" },
    { sn: 2, item: "Hydraulic Pump HP-7",           description: "Phase-2 high-pressure pump unit",        unit: "pcs", qty: "4",  priceLevel: "STD",  rate: "142,000", discPct: "2.5", discAmt: "14,200", gross: "553,800",   taxCode: "VAT", taxPct: "13", taxAmt: "71,994",  net: "625,794" },
    { sn: 3, item: "Mounting Plate Set",            description: "Pkg of 6 · stainless-steel mount plate", unit: "pkg", qty: "30", priceLevel: "BULK", rate: "11,200",  discPct: "0",   discAmt: "0",      gross: "336,000",   taxCode: "VAT", taxPct: "13", taxAmt: "43,680",  net: "379,680" },
    { sn: 4, item: "Service & Installation",         description: "On-site fitting + first-run validation", unit: "hrs", qty: "1",  priceLevel: "STD",  rate: "114,000", discPct: "0",   discAmt: "0",      gross: "114,000",   taxCode: "EXM", taxPct: "0",  taxAmt: "0",       net: "114,000" },
  ],
  subtotal: "1,225,800",
  discount: "14,200",
  vat: "28,400",
  total: "1,240,000",
};

function getFormData(mode: Mode, id?: string): FormData {
  if (mode === "create") return CREATE_DATA;
  const order = ORDERS.find((o) => o.id === id);
  if (!order) return EDIT_BASE;
  return {
    ...EDIT_BASE,
    documentNo: order.id,
    party: order.party,
    date: order.date,
    location: order.location,
    subsidiary: `${order.subsidiary} · Bizak`,
  };
}

const CUSTOMER_OPTIONS = [
  { name: "Apex Manufacturing Pvt Ltd", code: "C-1029", meta: "Industrial · Pokhara"      },
  { name: "Helio Distribution",         code: "C-2218", meta: "Distribution · Biratnagar" },
  { name: "Himalayan Beverages Co.",    code: "C-3104", meta: "FMCG · Kathmandu"          },
  { name: "Northwind Retail",           code: "C-4422", meta: "Retail · Lalitpur"         },
  { name: "Sagar Trading House",        code: "C-5781", meta: "Trading · Bharatpur"       },
];

// ════════════════════════════════════════════════════════════════════════════
// FIELD ATOMS calm, low-chrome inputs / lookups / pickers
// ════════════════════════════════════════════════════════════════════════════

function FieldLabel({
  label,
  required,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <p className="text-[11px] text-bz-text-muted">
        {label}
        {required && <span className="ml-0.5 text-bz-text">*</span>}
      </p>
      {hint && <p className="text-[10px] text-bz-text-soft">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  placeholder,
  readOnly,
  tabularNums,
}: {
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  tabularNums?: boolean;
}) {
  return (
    <input
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`h-9 w-full rounded-bz-md border px-3 text-[13px] outline-none transition-colors focus:border-bz-text ${
        readOnly
          ? "cursor-not-allowed border-bz-line-soft bg-bz-paper-warm text-bz-text-muted"
          : "border-bz-line-soft bg-bz-surface text-bz-text"
      } ${tabularNums ? "tabular-nums" : ""}`}
    />
  );
}

function TextareaInput({
  value,
  placeholder,
  rows = 3,
}: {
  value: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      defaultValue={value}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2 text-[13px] leading-relaxed text-bz-text outline-none transition-colors focus:border-bz-text"
    />
  );
}

function LookupInput({
  value,
  placeholder,
  onClick,
  readOnly,
}: {
  value: string;
  placeholder?: string;
  onClick?: () => void;
  readOnly?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={readOnly}
      className={`flex h-9 w-full items-center justify-between gap-2 rounded-bz-md border border-bz-line-soft px-3 text-left text-[13px] outline-none transition-colors hover:border-bz-line focus:border-bz-text ${
        readOnly
          ? "cursor-not-allowed bg-bz-paper-warm text-bz-text-muted"
          : "bg-bz-surface text-bz-text"
      }`}
    >
      <span className={`flex-1 truncate ${!value ? "text-bz-text-muted" : ""}`}>
        {value || placeholder}
      </span>
      {!readOnly && <ChevronDown size={12} className="shrink-0 text-bz-text-muted" />}
    </button>
  );
}

function DateInput({ value, placeholder }: { value: string; placeholder?: string }) {
  return (
    <button className="flex h-9 w-full items-center justify-between gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-left text-[13px] outline-none transition-colors hover:border-bz-line focus:border-bz-text">
      <span className={`flex-1 truncate ${!value ? "text-bz-text-muted" : "text-bz-text"}`}>
        {value || placeholder}
      </span>
      <Calendar size={12} className="shrink-0 text-bz-text-muted" />
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER AREA back link, title, subtitle, save button + more menu
// ════════════════════════════════════════════════════════════════════════════

function HeaderArea({
  mode,
  data,
  posting,
  onSave,
  onReset,
}: {
  mode: Mode;
  data: FormData;
  posting: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  const title = mode === "create" ? "New Sales Order" : `Update · ${data.documentNo}`;
  const subtitle =
    mode === "create"
      ? "Capture order details, line items and submit for approval."
      : "Edit fields below. Saving preserves the order's audit trail.";

  return (
    <div className="border-b border-bz-line-soft bg-bz-paper px-4 pb-5 pt-6 md:px-8">
      <Link
        to={mode === "edit" ? `/design/sales-order-list/${data.documentNo}` : "/design/sales-order-list"}
        className="inline-flex items-center gap-1 text-[11.5px] text-bz-text-muted hover:text-bz-text"
      >
        <ChevronLeft size={11} />
        {mode === "edit" ? `Back to ${data.documentNo}` : "Back to Sales Order"}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold tracking-tight text-bz-text">
            {title}
          </h1>
          <p className="mt-1 text-[13.5px] text-bz-text-muted">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={mode === "edit" ? `/design/sales-order-list/${data.documentNo}` : "/design/sales-order-list"}
            className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
          >
            Cancel
          </Link>
          <button
            onClick={onSave}
            disabled={posting}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark disabled:opacity-60"
          >
            {posting && <Loader2 size={12} className="animate-spin" />}
            {posting ? "Posting…" : mode === "create" ? "Finalize & Save" : "Save Changes"}
          </button>
          <FormMoreMenu mode={mode} onReset={onReset} />
        </div>
      </div>
    </div>
  );
}

function FormMoreMenu({ mode, onReset }: { mode: Mode; onReset: () => void }) {
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

  // Edit mode has no menu items — hide the trigger.
  if (mode === "edit") return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 items-center justify-center rounded-bz-md border px-2.5 text-bz-text ${
          open
            ? "border-bz-text bg-bz-surface"
            : "border-bz-line-soft bg-bz-surface hover:bg-bz-paper-warm"
        }`}
        aria-label="More actions"
      >
        <MoreHorizontal size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-[42px] z-30 w-52 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.18)]">
          <button
            onClick={() => {
              setOpen(false);
              onReset();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bz-paper-warm"
          >
            <RotateCcw size={13} strokeWidth={1.7} className="text-bz-text" />
            <span className="text-[12px] font-medium text-bz-text">Reset form</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LEFT RAIL one card, internal section dividers
// ════════════════════════════════════════════════════════════════════════════

function LeftRail({
  data,
  onCustomerClick,
  onSalesRepClick,
}: {
  data: FormData;
  onCustomerClick: () => void;
  onSalesRepClick: () => void;
}) {
  return (
    <aside className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      {/* Sales Overview */}
      <div className="px-5 py-5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          Sales overview
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-bz-text-muted">
          Pick the customer, sales rep and source — the rest of the form will adapt to the
          customer's defaults.
        </p>
      </div>

      {/* Customer */}
      <RailSection label="Customer" required>
        <PickerRow
          onClick={onCustomerClick}
          placeholder="Select customer…"
          primary={data.party}
          meta={data.partyMeta}
          avatarTone="fire"
        />
      </RailSection>

      {/* Sales Rep */}
      <RailSection label="Sales representative">
        <PickerRow
          onClick={onSalesRepClick}
          placeholder="Assign sales rep…"
          primary={data.salesRep}
          meta={data.salesRepMeta}
          avatarTone="neutral"
        />
      </RailSection>

      {/* Linked / source document */}
      <RailSection label="Source document">
        {data.sourceDoc ? (
          <button className="flex w-full items-center gap-2.5 text-left">
            <FileText size={13} className="shrink-0 text-bz-text-muted" />
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] uppercase tracking-[0.06em] text-bz-text-soft">
                {data.sourceDoc.type} · source
              </p>
              <p className="mt-0.5 truncate text-[12.5px] font-semibold tabular-nums text-bz-text">
                {data.sourceDoc.ref}
              </p>
            </div>
            <ArrowUpRight size={12} className="shrink-0 text-bz-text-muted" />
          </button>
        ) : (
          <p className="text-[12px] text-bz-text-muted">— not from another document</p>
        )}
      </RailSection>
    </aside>
  );
}

function RailSection({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-bz-line-soft px-5 py-4">
      <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
        {label}
        {required && <span className="ml-0.5 text-bz-text">*</span>}
      </p>
      {children}
    </div>
  );
}

function PickerRow({
  onClick,
  primary,
  meta,
  placeholder,
  avatarTone,
}: {
  onClick: () => void;
  primary: string;
  meta: string;
  placeholder: string;
  avatarTone: "fire" | "neutral";
}) {
  const has = !!primary;
  return (
    <button
      onClick={onClick}
      className="-mx-2 -my-1 flex w-[calc(100%+1rem)] items-start gap-3 rounded-bz-md px-2 py-1 text-left hover:bg-bz-paper-warm/60"
    >
      {has ? (
        <Avatar text={primary} tone={avatarTone} />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-pill border border-dashed border-bz-line bg-bz-paper-warm text-bz-text-muted">
          <Plus size={12} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {has ? (
          <>
            <p className="truncate text-[13px] font-semibold text-bz-text">{primary}</p>
            <p className="mt-0.5 text-[11px] text-bz-text-muted">{meta}</p>
          </>
        ) : (
          <p className="text-[12.5px] text-bz-text-muted">{placeholder}</p>
        )}
      </div>
      <ChevronRight size={12} className="mt-1 shrink-0 text-bz-text-muted" />
    </button>
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
// PRIMARY INFORMATION CARD field grid + classification + custom fields
// ════════════════════════════════════════════════════════════════════════════

function PrimaryInformationCard({
  mode,
  data,
  onLookup,
}: {
  mode: Mode;
  data: FormData;
  onLookup: (field: string) => void;
}) {
  const [open, setOpen] = React.useState<"class" | "custom" | null>("class");
  const multiSubsidiary = true;
  const hasCustomFields = true;

  return (
    <section className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="px-6 pt-5">
        <h2 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          Primary information
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-5 px-6 pb-6 pt-5 md:grid-cols-2">
        <Field label="Document No.">
          <TextInput value={data.documentNo} readOnly tabularNums />
        </Field>

        {multiSubsidiary && (
          <Field
            label="Subsidiary"
            required={mode === "create"}
            hint={mode === "edit" ? "read-only" : "cascades — wipes form"}
          >
            <LookupInput
              value={data.subsidiary}
              placeholder="Select subsidiary…"
              onClick={() => onLookup("subsidiary")}
              readOnly={mode === "edit"}
            />
          </Field>
        )}

        <Field label="Date" required>
          <DateInput value={data.date} />
        </Field>

        <Field label="Expected delivery">
          <DateInput value={data.expectedDelivery} placeholder="Pick a date…" />
        </Field>

        <Field label="Supplier PO #">
          <TextInput
            value={data.supplierPo}
            placeholder="External reference"
            tabularNums
          />
        </Field>

        <Field label="Location" required>
          <LookupInput
            value={data.location}
            placeholder="Select location…"
            onClick={() => onLookup("location")}
          />
        </Field>

        <Field label="Currency" required>
          <LookupInput
            value={data.currency}
            placeholder="Select currency…"
            onClick={() => onLookup("currency")}
          />
        </Field>

        <Field label="Exchange rate" required>
          <TextInput value={data.exchangeRate} tabularNums />
        </Field>

        <div className="md:col-span-2">
          <FieldLabel label="Memo" />
          <TextareaInput
            value={data.memo}
            placeholder="Add an internal note — visible on the order detail view."
            rows={3}
          />
        </div>
      </div>

      <CollapsiblePanel
        title="Classification"
        open={open === "class"}
        onToggle={() => setOpen(open === "class" ? null : "class")}
      >
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
          <Field label="Department">
            <LookupInput
              value={data.department}
              placeholder="Select department…"
              onClick={() => onLookup("department")}
            />
          </Field>
          <Field label="Class">
            <LookupInput
              value={data.clazz}
              placeholder="Select class…"
              onClick={() => onLookup("class")}
            />
          </Field>
          <Field label="Project">
            <LookupInput
              value={data.project}
              placeholder="Select project…"
              onClick={() => onLookup("project")}
            />
          </Field>
          <Field label="Partner">
            <LookupInput
              value={data.partner}
              placeholder="Select partner…"
              onClick={() => onLookup("partner")}
            />
          </Field>
        </div>
      </CollapsiblePanel>

      {hasCustomFields && (
        <CollapsiblePanel
          title="Custom fields"
          open={open === "custom"}
          onToggle={() => setOpen(open === "custom" ? null : "custom")}
        >
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
            <Field label="Plant">
              <TextInput value={mode === "edit" ? "Bharatpur · Industrial Park" : ""} placeholder="Plant" />
            </Field>
            <Field label="Commissioning by">
              <TextInput value={mode === "edit" ? "Engineering — Phase 2" : ""} placeholder="Team" />
            </Field>
            <Field label="Reference quote">
              <TextInput value={mode === "edit" ? "QTE-APX-0188" : ""} placeholder="QTE-…" tabularNums />
            </Field>
            <Field label="Crane required">
              <LookupInput
                value={mode === "edit" ? "Yes" : ""}
                placeholder="Yes / No"
                onClick={() => onLookup("crane")}
              />
            </Field>
          </div>
        </CollapsiblePanel>
      )}
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} hint={hint} />
      {children}
    </div>
  );
}

function CollapsiblePanel({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
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
// ITEMS SECTION tabs + editable grid + add row
// ════════════════════════════════════════════════════════════════════════════

const TABS = [
  { key: "item",     label: "Item"     },
  { key: "activity", label: "Activity" },
  { key: "billing",  label: "Billing"  },
  { key: "files",    label: "Files"    },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function ItemsSection({
  mode,
  data,
  onDeleteRow,
  onAddRow,
  onItemPicker,
}: {
  mode: Mode;
  data: FormData;
  onDeleteRow: (sn: number) => void;
  onAddRow: () => void;
  onItemPicker: (sn: number) => void;
}) {
  const [tab, setTab] = React.useState<TabKey>("item");
  return (
    <section className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="flex flex-wrap items-baseline gap-3 px-6 pt-5">
        <h2 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
          Items specification
        </h2>
        <span className="text-[12px] text-bz-text-muted tabular-nums">
          · {data.lines.length} {data.lines.length === 1 ? "line" : "lines"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-0.5 border-b border-bz-line-soft px-4 md:px-6">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-2.5 py-2 text-[12px] ${
                active ? "font-semibold text-bz-text" : "text-bz-text-muted hover:text-bz-text"
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
        {tab === "item" && (
          <ItemGrid
            lines={data.lines}
            onDeleteRow={onDeleteRow}
            onAddRow={onAddRow}
            onItemPicker={onItemPicker}
          />
        )}
        {tab === "activity" && <ActivityTab mode={mode} />}
        {tab === "billing"  && <BillingTab  data={data} />}
        {tab === "files"    && <FilesTab    />}
      </div>
    </section>
  );
}

// ── ITEM GRID editable cells ─────────────────────────────────────────────────

const GRID_COLS = [
  { label: "S.N",         width: 38,  align: "left"  as const },
  { label: "Item",        width: 170, align: "left"  as const, required: true },
  { label: "Description", width: 180, align: "left"  as const },
  { label: "Unit",        width: 64,  align: "left"  as const },
  { label: "Qty",         width: 64,  align: "right" as const, required: true },
  { label: "Price Lv.",   width: 72,  align: "left"  as const },
  { label: "Rate",        width: 96,  align: "right" as const },
  { label: "Disc %",      width: 62,  align: "right" as const },
  { label: "Disc",        width: 90,  align: "right" as const },
  { label: "Gross",       width: 104, align: "right" as const, computed: true },
  { label: "Tax",         width: 64,  align: "left"  as const },
  { label: "Tax %",       width: 62,  align: "right" as const },
  { label: "Tax Amt",     width: 94,  align: "right" as const, computed: true },
  { label: "Net",         width: 110, align: "right" as const, computed: true },
  { label: "",            width: 44,  align: "left"  as const },
];

function ItemGrid({
  lines,
  onDeleteRow,
  onAddRow,
  onItemPicker,
}: {
  lines: LineRow[];
  onDeleteRow: (sn: number) => void;
  onAddRow: () => void;
  onItemPicker: (sn: number) => void;
}) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth: 1320 }}>
          <thead>
            <tr className="border-y border-bz-line-soft">
              {GRID_COLS.map((c, i) => (
                <th
                  key={i}
                  className={`px-2 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted ${
                    c.align === "right" ? "text-right" : ""
                  }`}
                  style={{ width: c.width }}
                >
                  {c.label}
                  {c.required && <span className="ml-0.5 text-bz-text">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-bz-line-soft">
            {lines.map((l) => (
              <tr key={l.sn} className="group">
                <td className="px-2 py-1.5 text-[11px] tabular-nums text-bz-text-muted">{l.sn}</td>
                <td className="px-2 py-1.5">
                  <CellLookup
                    value={l.item}
                    placeholder="Pick item…"
                    onClick={() => onItemPicker(l.sn)}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <CellInput value={l.description} placeholder="—" />
                </td>
                <td className="px-2 py-1.5">
                  <CellLookup value={l.unit} placeholder="Unit" onClick={() => onItemPicker(l.sn)} />
                </td>
                <td className="px-2 py-1.5">
                  <CellInput value={l.qty} placeholder="0" align="right" />
                </td>
                <td className="px-2 py-1.5">
                  <CellLookup value={l.priceLevel} placeholder="—" onClick={() => onItemPicker(l.sn)} />
                </td>
                <td className="px-2 py-1.5">
                  <CellInput value={l.rate} placeholder="0" align="right" />
                </td>
                <td className="px-2 py-1.5">
                  <CellInput value={l.discPct} placeholder="0" align="right" />
                </td>
                <td className="px-2 py-1.5">
                  <CellInput value={l.discAmt} placeholder="0" align="right" />
                </td>
                <td className="px-2 py-1.5 text-right text-[11.5px] tabular-nums text-bz-text-muted">
                  {l.gross}
                </td>
                <td className="px-2 py-1.5">
                  <CellLookup value={l.taxCode} placeholder="—" onClick={() => onItemPicker(l.sn)} />
                </td>
                <td className="px-2 py-1.5">
                  <CellInput value={l.taxPct} placeholder="0" align="right" />
                </td>
                <td className="px-2 py-1.5 text-right text-[11.5px] tabular-nums text-bz-text-muted">
                  {l.taxAmt}
                </td>
                <td className="px-2 py-1.5 text-right text-[12px] font-semibold tabular-nums text-bz-text">
                  {l.net}
                </td>
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => onDeleteRow(l.sn)}
                    aria-label="Delete line"
                    className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-soft opacity-0 transition-opacity hover:bg-[#FBE5E2] hover:text-[#9A2E29] group-hover:opacity-100"
                  >
                    <Trash2 size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onAddRow}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line-soft py-2.5 text-[12px] font-medium text-bz-text-muted hover:border-bz-line hover:bg-bz-paper-warm/40 hover:text-bz-text"
      >
        <Plus size={13} /> Add row
      </button>
    </div>
  );
}

function CellInput({
  value,
  placeholder,
  align,
}: {
  value: string;
  placeholder?: string;
  align?: "right";
}) {
  return (
    <input
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      className={`block w-full rounded-bz-sm bg-transparent px-1.5 py-1 text-[11.5px] text-bz-text outline-none placeholder:text-bz-text-soft hover:bg-bz-paper-warm/50 focus:bg-bz-paper-warm focus:outline focus:outline-1 focus:outline-bz-text ${
        align === "right" ? "text-right tabular-nums" : ""
      }`}
    />
  );
}

function CellLookup({
  value,
  placeholder,
  onClick,
}: {
  value: string;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-1 rounded-bz-sm bg-transparent px-1.5 py-1 text-left text-[11.5px] hover:bg-bz-paper-warm/50"
    >
      <span className={`truncate ${value ? "text-bz-text" : "text-bz-text-soft"}`}>
        {value || placeholder}
      </span>
      <ChevronDown size={9} className="shrink-0 text-bz-text-soft" />
    </button>
  );
}

// ── ACTIVITY TAB ───────────────────────────────────────────────────────────

function ActivityTab({ mode }: { mode: Mode }) {
  return (
    <div className="flex flex-col gap-4">
      <FieldLabel label="Add a note" />
      <TextareaInput
        value=""
        placeholder="Internal note — visible on the activity log of this order."
        rows={3}
      />
      {mode === "edit" && (
        <div className="rounded-bz-md bg-bz-paper-warm/60 px-4 py-3 text-[11.5px] text-bz-text-muted">
          Existing activity (4 entries) will continue to be visible on the detail view —
          notes added here append to that log.
        </div>
      )}
    </div>
  );
}

// ── BILLING TAB ────────────────────────────────────────────────────────────

function BillingTab({ data }: { data: FormData }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
      <Field label="Tax ID (PAN No)" hint="from customer">
        <TextInput value={data.taxId} readOnly tabularNums />
      </Field>
      <Field label="Term">
        <LookupInput value={data.term} placeholder="Select term…" onClick={() => undefined} />
      </Field>
      <div className="md:col-span-2">
        <FieldLabel label="Address" hint="from customer" />
        <TextareaInput value={data.address} rows={2} />
      </div>
      <Field label="Due date" hint="auto from term">
        <DateInput value={data.dueDate} />
      </Field>
    </div>
  );
}

// ── FILES TAB ──────────────────────────────────────────────────────────────

const FILE_ROWS = [
  { name: "Signed Quotation.pdf",       size: "1.2 MB", by: "Priya Maharjan" },
  { name: "Apex Phase-2 Spec.docx",     size: "340 KB", by: "Omar T."        },
];

function FilesTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-2 rounded-bz-md border border-dashed border-bz-line-soft bg-bz-paper-warm/40 px-4 py-8 text-center">
        <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-surface">
          <Plus size={15} className="text-bz-text-muted" />
        </span>
        <p className="text-[12.5px] font-semibold text-bz-text">Drop files to attach</p>
        <p className="text-[11px] text-bz-text-muted">
          or{" "}
          <span className="font-semibold text-bz-text underline decoration-bz-line underline-offset-2">
            browse
          </span>
        </p>
      </div>

      {FILE_ROWS.map((f) => (
        <div
          key={f.name}
          className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2.5"
        >
          <FileText size={14} className="shrink-0 text-bz-text-muted" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-bz-text">{f.name}</p>
            <p className="mt-0.5 text-[10.5px] text-bz-text-muted tabular-nums">
              {f.size} · {f.by}
            </p>
          </div>
          <button className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-[#FBE5E2] hover:text-[#9A2E29]">
            <X size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY FOOTER
// ════════════════════════════════════════════════════════════════════════════

function SummaryFooter({ data }: { data: FormData }) {
  return (
    <section className="flex flex-col gap-3 lg:items-end">
      <p className="inline-flex items-start gap-1.5 text-[11.5px] text-bz-text-muted">
        <ShieldCheck size={11} className="mt-0.5 shrink-0" />
        Order value is built from agreed customer rates — changes after approval may trigger
        re-approval.
      </p>

      <div className="w-full rounded-bz-lg border border-bz-line-soft bg-bz-surface lg:w-[360px]">
        <SummaryRow label="Subtotal" value={data.subtotal} />
        <SummaryRow label="Discount" value={<span className="text-bz-text-muted">−{data.discount}</span>} />
        <SummaryRow label="VAT / Tax" value={data.vat} />
        <div className="flex items-baseline justify-between border-t border-bz-line-soft px-5 py-4">
          <p className="text-[12px] font-medium text-bz-text">Order total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[10.5px] font-semibold text-bz-text-muted">{data.currency}</span>
            <span className="text-[22px] font-semibold tabular-nums text-bz-text">
              {data.total}
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
// STICKY BOTTOM BAR validity, line count, running total, save action
// ════════════════════════════════════════════════════════════════════════════

function StickyBottomBar({
  mode,
  data,
  posting,
  onSave,
  isValid,
}: {
  mode: Mode;
  data: FormData;
  posting: boolean;
  onSave: () => void;
  isValid: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-20 mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-bz-line-soft bg-bz-paper/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-bz-text-muted">
        <span className="inline-flex items-center gap-1.5">
          {isValid ? (
            <>
              <Check size={12} className="text-bz-leaf-deep" />
              <span className="font-medium text-bz-text">Form ready</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12} className="text-[#9A2E29]" />
              <span className="font-medium text-[#9A2E29]">
                Required fields missing
              </span>
            </>
          )}
        </span>
        <span className="hidden sm:inline">
          · {data.lines.length} {data.lines.length === 1 ? "line" : "lines"}
        </span>
        <span className="hidden md:inline">
          · Order total{" "}
          <span className="font-semibold text-bz-text">
            {data.currency} {data.total}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={mode === "edit" ? `/design/sales-order-list/${data.documentNo}` : "/design/sales-order-list"}
          className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
        >
          Cancel
        </Link>
        <button
          onClick={onSave}
          disabled={posting || !isValid}
          className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark disabled:opacity-60"
        >
          {posting && <Loader2 size={12} className="animate-spin" />}
          {posting ? "Posting…" : mode === "create" ? "Finalize & Save" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DIALOGS Customer picker + Advanced search + Reset confirm
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
      <div className="absolute inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 pt-16">
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
  maxWidth = 520,
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
      <div className="flex items-center justify-between border-b border-bz-line-soft bg-bz-paper-warm px-4 py-3">
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
      <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-4 py-3">
        {footer}
      </div>
    </div>
  );
}

function CustomerPickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string, meta: string) => void;
}) {
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
        footer={
          <>
            <button className="mr-auto inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
              <Briefcase size={11} /> Add new
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
              <Search size={11} /> Advanced search
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="mb-3 flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
          <Search size={12} className="text-bz-text-muted" />
          <span className="text-[12px] text-bz-text-muted">Search customers…</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {CUSTOMER_OPTIONS.map((c) => (
            <button
              key={c.code}
              onClick={() => onSelect(c.name, c.meta)}
              className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 py-2.5 text-left hover:bg-bz-surface"
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
            </button>
          ))}
        </div>
      </DialogShell>
    </DialogOverlay>
  );
}

function AdvancedSearchDialog({
  open,
  onClose,
  field,
}: {
  open: boolean;
  onClose: () => void;
  field: string;
}) {
  return (
    <DialogOverlay open={open} onClose={onClose}>
      <DialogShell
        title="Advanced search"
        badge={
          <span className="inline-flex items-center rounded-bz-pill bg-bz-fire/[0.18] px-2 py-0.5 text-[10px] font-semibold text-bz-text">
            {field}
          </span>
        }
        onClose={onClose}
        footer={
          <>
            <button
              onClick={onClose}
              className="mr-auto inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              <Plus size={11} /> Create new
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark"
            >
              Use selection
            </button>
          </>
        }
      >
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
            <Search size={12} className="text-bz-text-muted" />
            <span className="text-[12px] text-bz-text-muted">Query…</span>
          </div>
          <div className="flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
            <Building2 size={12} className="text-bz-text-muted" />
            <span className="text-[12px] text-bz-text-muted">Filter…</span>
            <ChevronDown size={11} className="ml-auto text-bz-text-muted" />
          </div>
        </div>
        <div className="flex h-40 items-center justify-center rounded-bz-md border border-dashed border-bz-line-soft bg-bz-paper-warm/40 text-[12px] text-bz-text-muted">
          Results table mounts here.
        </div>
      </DialogShell>
    </DialogOverlay>
  );
}

function ResetConfirmDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogOverlay open={open} onClose={onClose}>
      <DialogShell
        title="Reset form"
        badge={
          <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10px] font-semibold text-bz-text-muted">
            Confirm action
          </span>
        }
        onClose={onClose}
        maxWidth={440}
        footer={
          <>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark"
            >
              <RotateCcw size={11} /> Reset
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm">
            <Info size={15} className="text-bz-text-muted" />
          </div>
          <p className="text-[12.5px] leading-relaxed text-bz-text">
            Every field you have edited will return to its default value. Line items will be
            cleared. There's no undo.
          </p>
        </div>
      </DialogShell>
    </DialogOverlay>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE composition
// ════════════════════════════════════════════════════════════════════════════

export function SalesOrderFormDesignPage({ mode }: { mode: Mode }) {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [data, setData] = React.useState<FormData>(() =>
    getFormData(mode, params.id),
  );
  const [posting, setPosting] = React.useState(false);
  const [customerOpen, setCustomerOpen] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState<string | null>(null);
  const [resetOpen, setResetOpen] = React.useState(false);

  const isValid =
    data.party.length > 0 &&
    data.date.length > 0 &&
    data.location.length > 0 &&
    data.currency.length > 0 &&
    data.exchangeRate.length > 0 &&
    data.lines.length > 0;

  function handleSave() {
    if (!isValid || posting) return;
    setPosting(true);
    setTimeout(() => {
      const toast =
        mode === "create"
          ? "Sales order created successfully"
          : `${data.documentNo} updated successfully`;
      navigate("/design/sales-order-list", { state: { toast } });
    }, 800);
  }

  function handleReset() {
    setData(CREATE_DATA);
    setResetOpen(false);
  }

  function handleAddRow() {
    setData((d) => ({ ...d, lines: [...d.lines, EMPTY_LINE(d.lines.length + 1)] }));
  }

  function handleDeleteRow(sn: number) {
    setData((d) => ({
      ...d,
      lines: d.lines
        .filter((l) => l.sn !== sn)
        .map((l, i) => ({ ...l, sn: i + 1 })),
    }));
  }

  return (
    <AppShell
      breadcrumb={<FormBreadcrumb mode={mode} />}
      overlay={
        <>
          <CustomerPickerDialog
            open={customerOpen}
            onClose={() => setCustomerOpen(false)}
            onSelect={(name, meta) => {
              setData((d) => ({ ...d, party: name, partyMeta: meta }));
              setCustomerOpen(false);
            }}
          />
          <AdvancedSearchDialog
            open={!!advancedOpen}
            onClose={() => setAdvancedOpen(null)}
            field={advancedOpen ?? ""}
          />
          <ResetConfirmDialog
            open={resetOpen}
            onClose={() => setResetOpen(false)}
            onConfirm={handleReset}
          />
        </>
      }
    >
      <HeaderArea
        mode={mode}
        data={data}
        posting={posting}
        onSave={handleSave}
        onReset={() => setResetOpen(true)}
      />

      <div className="grid grid-cols-1 gap-6 px-4 py-7 md:px-8 lg:grid-cols-[300px_1fr]">
        <LeftRail
          data={data}
          onCustomerClick={() => setCustomerOpen(true)}
          onSalesRepClick={() => setAdvancedOpen("Sales Rep")}
        />
        <div className="flex min-w-0 flex-col gap-6">
          <PrimaryInformationCard
            mode={mode}
            data={data}
            onLookup={(field) => setAdvancedOpen(field)}
          />
          <ItemsSection
            mode={mode}
            data={data}
            onDeleteRow={handleDeleteRow}
            onAddRow={handleAddRow}
            onItemPicker={(sn) => setAdvancedOpen(`Item · line ${sn}`)}
          />
          <SummaryFooter data={data} />
        </div>
      </div>

      <StickyBottomBar
        mode={mode}
        data={data}
        posting={posting}
        onSave={handleSave}
        isValid={isValid}
      />
    </AppShell>
  );
}

function FormBreadcrumb({ mode }: { mode: Mode }) {
  return (
    <>
      <span className="text-bz-text-muted">Sales &amp; CRM</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <Link to="/design/sales-order-list" className="text-bz-text-muted hover:text-bz-text">
        Sales Order
      </Link>
      {mode === "edit" && (
        <>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Update</span>
        </>
      )}
    </>
  );
}
