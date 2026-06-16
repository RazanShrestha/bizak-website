import * as React from "react";
import { createPortal } from "react-dom";
import {
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Search,
  X,
  Check,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Coins,
  Ruler,
  Hash,
  SlidersHorizontal,
  ArrowLeftRight,
  Briefcase,
  Landmark,
  Store,
  ShieldAlert,
  Eye,
  Lock,
  Sparkles,
  Info,
  Tag,
  CreditCard,
  ShieldCheck,
  Banknote,
  User,
  Wallet,
  Ban,
  Building2,
  Factory,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// WORKSPACE PREFERENCES · GLOBAL DEFAULTS  (role-reactive settings editor)
//
// PRIMARY ACTION = fill in a sectioned settings editor and save it. Everything
// orbits that one editor:
//   • TENANT  → the editor IS the page (one always-present live default set),
//               plus a tenant-only POS section and a danger-zone deletion.
//   • HOST    → the same editor wrapped in a browse-then-edit flow over many
//               reusable preference *templates* (each scoped to country +
//               industry), with scope multi-pickers and no POS section.
//
// CENTRE OF GRAVITY = a settings master-detail: a section-nav rail on the left,
// the active section's fields on the right, a docked save footer below. The
// host's records browser is an OUTER state the same editor swaps into.
//
// One session-identity decision (host vs tenant) governs which regions and
// sections exist, which controls appear, and the entire save flow. A discreet
// "Preview as" switch lets a reviewer flip between the two whole experiences
// (in the real product this is resolved from the signed-in identity).
//
// Built in the app design language (AppShell + bz-* tokens) — a sibling of the
// Custom-Form builder and Role & Permission manager. Interactive states present:
// loading / empty / no-results / disabled / selected / reloading / posting,
// lazy-hydrated picker values, cascading option reloads, deferred default-fill,
// and typed-name destructive confirmation.
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// FORMAT
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA  the "back-office" pools every server-paginated picker draws
// from. Ledger pickers all share ONE chart-of-accounts fetch with group /
// non-postable rows filtered out (the cross-cutting "shared option source").
// ════════════════════════════════════════════════════════════════════════════

type Opt = { id: string; label: string; sub?: string; flag?: string };

const CURRENCIES: Opt[] = [
  { id: "NPR", label: "NPR", sub: "Nepalese Rupee" },
  { id: "USD", label: "USD", sub: "US Dollar" },
  { id: "INR", label: "INR", sub: "Indian Rupee" },
  { id: "EUR", label: "EUR", sub: "Euro" },
  { id: "GBP", label: "GBP", sub: "Pound Sterling" },
  { id: "AED", label: "AED", sub: "UAE Dirham" },
  { id: "SGD", label: "SGD", sub: "Singapore Dollar" },
  { id: "AUD", label: "AUD", sub: "Australian Dollar" },
  { id: "JPY", label: "JPY", sub: "Japanese Yen" },
  { id: "CNY", label: "CNY", sub: "Chinese Yuan" },
  { id: "BDT", label: "BDT", sub: "Bangladeshi Taka" },
  { id: "LKR", label: "LKR", sub: "Sri Lankan Rupee" },
  { id: "CAD", label: "CAD", sub: "Canadian Dollar" },
  { id: "ZAR", label: "ZAR", sub: "South African Rand" },
];

const COUNTRIES: Opt[] = [
  { id: "np", label: "Nepal", flag: "🇳🇵" },
  { id: "in", label: "India", flag: "🇮🇳" },
  { id: "us", label: "United States", flag: "🇺🇸" },
  { id: "gb", label: "United Kingdom", flag: "🇬🇧" },
  { id: "ae", label: "United Arab Emirates", flag: "🇦🇪" },
  { id: "sg", label: "Singapore", flag: "🇸🇬" },
  { id: "au", label: "Australia", flag: "🇦🇺" },
  { id: "de", label: "Germany", flag: "🇩🇪" },
  { id: "fr", label: "France", flag: "🇫🇷" },
  { id: "jp", label: "Japan", flag: "🇯🇵" },
  { id: "cn", label: "China", flag: "🇨🇳" },
  { id: "bd", label: "Bangladesh", flag: "🇧🇩" },
  { id: "lk", label: "Sri Lanka", flag: "🇱🇰" },
  { id: "bt", label: "Bhutan", flag: "🇧🇹" },
  { id: "ca", label: "Canada", flag: "🇨🇦" },
  { id: "za", label: "South Africa", flag: "🇿🇦" },
];

const INDUSTRIES: Opt[] = [
  { id: "retail", label: "Retail" },
  { id: "wholesale", label: "Wholesale" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "distribution", label: "Distribution" },
  { id: "hospitality", label: "Hospitality" },
  { id: "construction", label: "Construction" },
  { id: "pharma", label: "Pharmaceuticals" },
  { id: "agriculture", label: "Agriculture" },
  { id: "services", label: "Professional Services" },
  { id: "automotive", label: "Automotive" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
];

const UNITS: Opt[] = [
  { id: "km", label: "Kilometer", sub: "km" },
  { id: "m", label: "Meter", sub: "m" },
  { id: "mi", label: "Mile", sub: "mi" },
  { id: "ft", label: "Foot", sub: "ft" },
  { id: "yd", label: "Yard", sub: "yd" },
  { id: "nmi", label: "Nautical Mile", sub: "NM" },
];

const PAYMENT_TERMS: Opt[] = [
  { id: "due", label: "Due on Receipt" },
  { id: "net15", label: "Net 15" },
  { id: "net30", label: "Net 30" },
  { id: "net45", label: "Net 45" },
  { id: "net60", label: "Net 60" },
  { id: "cod", label: "Cash on Delivery" },
  { id: "2-10", label: "2/10 Net 30", sub: "Early-payment discount" },
  { id: "adv50", label: "50% Advance", sub: "Balance on delivery" },
];

const PRICE_LISTS: Opt[] = [
  { id: "std-sell", label: "Standard Selling" },
  { id: "std-buy", label: "Standard Buying" },
  { id: "wholesale", label: "Wholesale" },
  { id: "retail", label: "Retail" },
  { id: "distributor", label: "Distributor" },
  { id: "export", label: "Export" },
];

const ROLES: Opt[] = [
  { id: "fin-mgr", label: "Finance Manager" },
  { id: "acct-lead", label: "Accounts Lead" },
  { id: "branch-mgr", label: "Branch Manager" },
  { id: "regional", label: "Regional Director" },
  { id: "ops-head", label: "Operations Head" },
  { id: "credit-ctrl", label: "Credit Controller" },
  { id: "treasury", label: "Treasury Officer" },
  { id: "ceo", label: "Chief Executive" },
];

// One chart-of-accounts fetch — group / non-postable rows are filtered out so
// every ledger picker searches the same postable set.
type LedgerRaw = Opt & { group?: boolean };
const LEDGER_RAW: LedgerRaw[] = [
  { id: "grp-assets", label: "Application of Funds (Assets)", group: true },
  { id: "grp-ca", label: "Current Assets", group: true },
  { id: "led-cash", label: "Cash — NP", sub: "1101" },
  { id: "led-petty", label: "Petty Cash — NP", sub: "1102" },
  { id: "led-nabil", label: "Nabil Bank — 0123", sub: "1111" },
  { id: "led-nic", label: "NIC Asia — 8842", sub: "1112" },
  { id: "led-ar", label: "Accounts Receivable — NP", sub: "1201" },
  { id: "led-advance", label: "Employee Advances — NP", sub: "1401" },
  { id: "grp-liab", label: "Sources of Funds (Liabilities)", group: true },
  { id: "led-ap", label: "Accounts Payable — NP", sub: "2101" },
  { id: "led-vat", label: "VAT Payable — NP", sub: "2201" },
  { id: "led-tds", label: "TDS Payable — NP", sub: "2202" },
  { id: "led-salary", label: "Salary Payable — NP", sub: "2301" },
  { id: "grp-income", label: "Income", group: true },
  { id: "led-sales", label: "Sales — NP", sub: "4101" },
  { id: "grp-exp", label: "Expenses", group: true },
  { id: "led-cogs", label: "Cost of Goods Sold — NP", sub: "5001" },
  { id: "led-discount", label: "Discount Allowed — NP", sub: "5101" },
  { id: "led-bankchg", label: "Bank Charges — NP", sub: "5201" },
  { id: "led-roundoff", label: "Round Off — NP", sub: "5901" },
  { id: "led-exch", label: "Exchange Gain / Loss — NP", sub: "5902" },
];
const LEDGER: Opt[] = LEDGER_RAW.filter((l) => !l.group).map(({ group, ...o }) => o);
const DEFAULT_TDS_PAYABLE = "led-tds"; // system default for deferred auto-fill

const POS_CUSTOMERS: Opt[] = [
  { id: "walkin", label: "Walk-in Customer" },
  { id: "counter", label: "Counter Sales" },
  { id: "cash-cust", label: "Cash Customer" },
];
const POS_METHODS: Opt[] = [
  { id: "cash", label: "Cash" },
  { id: "card", label: "Card" },
  { id: "esewa", label: "eSewa" },
  { id: "khalti", label: "Khalti" },
  { id: "fonepay", label: "FonePay" },
  { id: "bank", label: "Bank Transfer" },
];
const POS_WAREHOUSES: Opt[] = [
  { id: "ktm-store", label: "Kathmandu Store" },
  { id: "lalitpur", label: "Lalitpur Counter" },
  { id: "pokhara", label: "Pokhara Outlet" },
  { id: "main-wh", label: "Main Warehouse — NP" },
];

const optLabel = (pool: Opt[], id: string | null): string =>
  (id && pool.find((o) => o.id === id)?.label) || "";

// ════════════════════════════════════════════════════════════════════════════
// FIXED-CHOICE OPTION SETS  (deletion policy · auto-numbering strategy)
// ════════════════════════════════════════════════════════════════════════════

type DeletionKey = "trash" | "permanent" | "block";
const DELETION_POLICIES: { key: DeletionKey; label: string; desc: string; Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }[] = [
  { key: "trash", label: "Move to Trash", desc: "Soft-delete — recoverable from Trash for a grace period.", Icon: Trash2 },
  { key: "permanent", label: "Delete permanently", desc: "Removed immediately, with no recovery.", Icon: Ban },
  { key: "block", label: "Block deletion", desc: "Records can only be cancelled, never deleted.", Icon: Lock },
];

type NumberingKey = "series" | "increment" | "auto_reset" | "manual";
const NUMBERING_STRATEGIES: { key: NumberingKey; label: string; desc: string }[] = [
  { key: "series", label: "Naming Series", desc: "Prefix + incrementing number (SO-#####)." },
  { key: "increment", label: "Auto-increment", desc: "One global counter across the document." },
  { key: "auto_reset", label: "Counter with reset", desc: "Resets to 1 once a threshold is passed." },
  { key: "manual", label: "Manual", desc: "User types each document number." },
];

const PRECISION_OPTIONS: Opt[] = [
  { id: "__system__", label: "System Default", sub: "Inherit platform precision" },
  { id: "2", label: "2 places", sub: "0.00" },
  { id: "3", label: "3 places", sub: "0.000" },
  { id: "4", label: "4 places", sub: "0.0000" },
  { id: "6", label: "6 places", sub: "0.000000" },
  { id: "9", label: "9 places", sub: "0.000000000" },
];

// ════════════════════════════════════════════════════════════════════════════
// SETTINGS MODEL  — the working draft the editor binds to
// ════════════════════════════════════════════════════════════════════════════

type Settings = {
  // general / global
  currency: string | null;
  country: string | null;
  distanceUnit: string | null;
  precision: string; // client list — "__system__" by default
  numbering: NumberingKey;
  numberingThreshold?: number; // conditional — only for "auto_reset"
  showCurrencySymbol: boolean;
  disableRoundedTotal: boolean;
  hideAmountInWords: boolean;
  // buying & selling
  paymentTerms: string | null;
  sellingPriceList: string | null;
  buyingPriceList: string | null;
  creditApprovalRole: string | null;
  // HR / payroll
  payrollPayable: string | null;
  employeeAdvance: string | null;
  workingHours?: number;
  retirementAge?: number;
  // accounting (shared ledger pool)
  bankAccount: string | null;
  cashAccount: string | null;
  receivable: string | null;
  payable: string | null;
  roundOff: string | null;
  withholdingPayable: string | null; // deferred default-fill target
  exchangeGainLoss: string | null;
  adoptDefaultCoA: boolean; // lockable when CoA already inserted
  budgetOverdueCheck: boolean;
  // record deletion
  deletionPolicy: DeletionKey;
  // point of sale (tenant only)
  posCustomer: string | null;
  posPaymentMethod: string | null;
  posWarehouse: string | null;
};

function makeDefaults(): Settings {
  return {
    currency: null, country: null, distanceUnit: null, precision: "__system__",
    numbering: "series", numberingThreshold: undefined,
    showCurrencySymbol: true, disableRoundedTotal: false, hideAmountInWords: false,
    paymentTerms: null, sellingPriceList: null, buyingPriceList: null, creditApprovalRole: null,
    payrollPayable: null, employeeAdvance: null, workingHours: undefined, retirementAge: undefined,
    bankAccount: null, cashAccount: null, receivable: null, payable: null, roundOff: null,
    withholdingPayable: null, exchangeGainLoss: null, adoptDefaultCoA: false, budgetOverdueCheck: false,
    deletionPolicy: "trash",
    posCustomer: null, posPaymentMethod: null, posWarehouse: null,
  };
}

// The tenant's single live default set (seeded — pre-set picker values lazily
// hydrate their labels on first load).
const TENANT_LIVE: Settings = {
  ...makeDefaults(),
  currency: "NPR", country: "np", distanceUnit: "km", precision: "2",
  numbering: "series", showCurrencySymbol: true,
  paymentTerms: "net30", sellingPriceList: "std-sell", buyingPriceList: "std-buy", creditApprovalRole: "fin-mgr",
  payrollPayable: "led-salary", employeeAdvance: "led-advance", workingHours: 40, retirementAge: 58,
  bankAccount: "led-nabil", cashAccount: "led-cash", receivable: "led-ar", payable: "led-ap",
  roundOff: "led-roundoff", withholdingPayable: null, exchangeGainLoss: "led-exch",
  adoptDefaultCoA: true, budgetOverdueCheck: true,
  deletionPolicy: "trash",
  posCustomer: "walkin", posPaymentMethod: "cash", posWarehouse: "ktm-store",
};
// On the tenant workspace the default CoA has already been inserted → its
// "adopt" toggle is locked on (the lockable-flag precondition).
const TENANT_COA_INSERTED = true;
const WORKSPACE_NAME = "Bizak Nepal";
const WORKSPACE_USERS = 14;

// ════════════════════════════════════════════════════════════════════════════
// HOST TEMPLATE RECORDS  (browse-then-edit pool)
// ════════════════════════════════════════════════════════════════════════════

type Template = {
  id: string;
  countries: string[]; // scope — empty = "Any"
  industries: string[]; // scope — empty = "Any"
  settings: Settings;
};

const tpl = (id: string, countries: string[], industries: string[], patch: Partial<Settings>): Template => ({
  id, countries, industries, settings: { ...makeDefaults(), ...patch },
});

const SEED_TEMPLATES: Template[] = [
  tpl("TPL-1001", ["np"], ["retail", "wholesale"], { currency: "NPR", country: "np", precision: "2", paymentTerms: "net30", deletionPolicy: "trash", receivable: "led-ar", payable: "led-ap" }),
  tpl("TPL-1002", ["np"], ["manufacturing"], { currency: "NPR", country: "np", precision: "3", numbering: "auto_reset", numberingThreshold: 9999, deletionPolicy: "block" }),
  tpl("TPL-1003", ["in"], [], { currency: "INR", country: "in", precision: "2", paymentTerms: "net45" }),
  tpl("TPL-1004", [], ["hospitality"], { currency: "USD", precision: "2", deletionPolicy: "permanent" }),
  tpl("TPL-1005", ["us", "ca"], ["retail"], { currency: "USD", country: "us", precision: "2", paymentTerms: "due" }),
  tpl("TPL-1006", [], [], { currency: "USD", precision: "3", numbering: "increment" }),
];

// data-driven label transforms — scope IDs → human names; unscoped → "Any"
function scopeNames(ids: string[], pool: Opt[]): string[] {
  return ids.map((id) => pool.find((o) => o.id === id)?.label ?? id);
}
function precisionLabel(p: string): string {
  return p === "__system__" ? "Default" : p;
}
// one-line readable description for a confirmation prompt
function describeTemplate(t: Template): string {
  const c = t.countries.length ? scopeNames(t.countries, COUNTRIES).join(", ") : "Any country";
  const i = t.industries.length ? scopeNames(t.industries, INDUSTRIES).join(", ") : "Any industry";
  return `${c} · ${i} — ${t.settings.currency ?? "—"}, precision ${precisionLabel(t.settings.precision)}`;
}

// ════════════════════════════════════════════════════════════════════════════
// SMALL UTILITIES
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

// Lazy hydration — a pre-existing saved picker value fetches its label on first
// load so the field reads as "filled". Values picked by the user are marked
// seen immediately, so only seeded values ever shimmer.
const HYDRATED = new Set<string>();
function markSeen(id: string) {
  HYDRATED.add(id);
}
function useLazyLabel(value: string | null) {
  const [hydrating, setHydrating] = React.useState(false);
  React.useEffect(() => {
    if (!value || HYDRATED.has(value)) {
      setHydrating(false);
      return;
    }
    setHydrating(true);
    const t = window.setTimeout(() => {
      HYDRATED.add(value);
      setHydrating(false);
    }, 480);
    return () => window.clearTimeout(t);
  }, [value]);
  return hydrating;
}

// ════════════════════════════════════════════════════════════════════════════
// BUTTON PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

const PRIMARY_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12.5px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-40";

// ════════════════════════════════════════════════════════════════════════════
// ATOMS  switch · tooltip · field label · radio cards · toggle row · number field
// ════════════════════════════════════════════════════════════════════════════

function Switch({
  value, onChange, disabled, ariaLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
        disabled && "cursor-not-allowed opacity-60",
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

// icon-only action with a hover tooltip bubble
function IconTip({
  label, onClick, danger, icon: Icon,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <span className="group/tip relative inline-flex">
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        aria-label={label}
        className={cn(
          "flex size-7 items-center justify-center rounded-bz-sm border border-transparent text-bz-text-muted transition-colors",
          danger ? "hover:border-[#C0413A]/30 hover:bg-[#FBE7E5] hover:text-[#9A2E29]" : "hover:border-bz-line-soft hover:bg-bz-paper-warm hover:text-bz-text",
        )}
      >
        <Icon size={14} />
      </button>
      <span className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-bz-sm bg-bz-deep px-1.5 py-1 text-[10px] font-medium text-bz-text-on-dark opacity-0 transition-opacity group-hover/tip:opacity-100">
        {label}
      </span>
    </span>
  );
}

function FieldLabel({
  label, hint, required, note,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  note?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label className="text-[11.5px] font-medium text-bz-text-muted">
        {label}
        {required && <span className="ml-0.5 text-[#C0413A]">*</span>}
      </label>
      {note ? note : hint ? <span className="text-[10px] text-bz-text-soft">{hint}</span> : null}
    </div>
  );
}

function AutoFilledNote() {
  return (
    <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-fire/[0.18] px-1.5 py-0.5 text-[9.5px] font-semibold text-bz-text">
      <Sparkles size={9} className="text-bz-leaf-deep" /> Auto-filled
    </span>
  );
}

// two-column responsive field grid; children may add `sm:col-span-2`
function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>;
}

function RadioCards<T extends string>({
  options, value, onChange,
}: {
  options: { key: T; label: string; desc: string; Icon?: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((o) => {
        const active = o.key === value;
        const Icon = o.Icon;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            aria-pressed={active}
            className={cn(
              "relative flex flex-col gap-1.5 rounded-bz-md border p-3 text-left transition-colors",
              active ? "border-bz-text bg-bz-fire/[0.06]" : "border-bz-line-soft bg-bz-surface hover:border-bz-line hover:bg-bz-paper-warm/40",
            )}
          >
            <span className="flex items-center justify-between">
              <span className={cn("flex size-6 items-center justify-center rounded-bz-sm", active ? "bg-bz-deep text-bz-paper" : "bg-bz-paper-warm text-bz-text-muted")}>
                {Icon ? <Icon size={13} strokeWidth={1.8} /> : <Hash size={13} />}
              </span>
              <span className={cn("flex size-4 items-center justify-center rounded-bz-pill border transition-colors", active ? "border-bz-text bg-bz-text text-bz-paper" : "border-bz-line")}>
                {active && <Check size={10} strokeWidth={3} />}
              </span>
            </span>
            <span className="text-[12.5px] font-semibold text-bz-text">{o.label}</span>
            <span className="text-[10.5px] leading-snug text-bz-text-muted">{o.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  title, desc, value, onChange, locked, lockNote,
}: {
  title: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
  lockNote?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[12.5px] font-medium text-bz-text">
          {title}
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-paper-warm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">
              <Lock size={9} /> Locked
            </span>
          )}
        </p>
        {(locked && lockNote ? lockNote : desc) && (
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-bz-text-soft">{locked && lockNote ? lockNote : desc}</p>
        )}
      </div>
      <Switch value={value} onChange={onChange} disabled={locked} ariaLabel={title} />
    </div>
  );
}

function NumberField({
  label, hint, value, onChange, suffix, min, max, placeholder,
}: {
  label: string;
  hint?: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  suffix?: string;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div className="flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 focus-within:border-bz-text">
        <input
          type="number"
          value={value ?? ""}
          min={min}
          max={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          className={`h-full w-full bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft ${NUM}`}
        />
        {suffix && <span className="ml-2 shrink-0 text-[11px] text-bz-text-soft">{suffix}</span>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REF FIELD  server-paginated single-select: debounced type-to-search,
// infinite-scroll pagination, focus-reset+reload, lazy-hydrated saved value,
// placeholder / loading / empty / disabled / reloading states.
// ════════════════════════════════════════════════════════════════════════════

const PAGE = 6;

function RefField({
  label, hint, required, value, onChange, pool, placeholder, icon: Icon, disabled, reloading, note,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  value: string | null;
  onChange: (v: string | null) => void;
  pool: Opt[];
  placeholder: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  disabled?: boolean;
  reloading?: boolean;
  note?: React.ReactNode;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const current = pool.find((o) => o.id === value) ?? null;
  const hydrating = useLazyLabel(value);

  return (
    <div>
      <FieldLabel label={label} hint={hint} required={required} note={note} />
      <button
        ref={btnRef}
        type="button"
        disabled={disabled || reloading}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border bg-bz-surface px-3 text-left transition-colors",
          open ? "border-bz-text" : "border-bz-line-soft hover:border-bz-line",
          (disabled || reloading) && "cursor-not-allowed opacity-60",
        )}
      >
        {Icon && <Icon size={13} className="shrink-0 text-bz-text-muted" />}
        <span className="min-w-0 flex-1 truncate text-[13px]">
          {reloading ? (
            <span className="inline-flex items-center gap-1.5 text-bz-text-muted">
              <Loader2 size={11} className="animate-spin text-bz-fire" /> Reloading options…
            </span>
          ) : hydrating ? (
            <span className="inline-block h-3 w-28 animate-pulse rounded-bz-sm bg-bz-paper-warm align-middle" />
          ) : current ? (
            <span className="text-bz-text">{current.label}{current.sub && <span className="ml-1.5 text-[11px] text-bz-text-soft">{current.sub}</span>}</span>
          ) : (
            <span className="text-bz-text-soft">{placeholder}</span>
          )}
        </span>
        {value && !reloading && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="flex size-5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
          >
            <X size={11} />
          </span>
        )}
        <ChevronDown size={12} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      <RefDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)} pool={pool} value={value} onPick={onChange} />
    </div>
  );
}

function RefDropdown({
  anchorRef, open, onClose, pool, value, onPick,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  pool: Opt[];
  value: string | null;
  onPick: (v: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false); // initial / search
  const [loadingMore, setLoadingMore] = React.useState(false);

  // position + reset on open (focus resets and reloads the list)
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    setRaw("");
    setQuery("");
    setPages(1);
  }, [open, anchorRef]);

  // debounced search (server-resolved) — and the initial reload on open
  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = window.setTimeout(() => {
      setQuery(raw.trim().toLowerCase());
      setPages(1);
      setLoading(false);
    }, raw ? 260 : 300);
    return () => window.clearTimeout(t);
  }, [raw, open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose();
    };
    const onScroll = (e: Event) => {
      if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  const filtered = query
    ? pool.filter((o) => o.label.toLowerCase().includes(query) || (o.sub ?? "").toLowerCase().includes(query))
    : pool;
  const visible = filtered.slice(0, pages * PAGE);
  const hasMore = visible.length < filtered.length;

  const onListScroll = () => {
    const el = listRef.current;
    if (!el || loading || loadingMore || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setLoadingMore(true);
      window.setTimeout(() => {
        setPages((p) => p + 1);
        setLoadingMore(false);
      }, 420);
    }
  };

  const pick = (id: string) => { markSeen(id); onPick(id); onClose(); };

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 240) }}
      className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
    >
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
          <Search size={11} className="shrink-0 text-bz-text-muted" />
          <input
            autoFocus
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {raw && (
            <button onClick={() => setRaw("")} aria-label="Clear" className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface">
              <X size={10} />
            </button>
          )}
        </div>
      </div>
      <div ref={listRef} onScroll={onListScroll} className="max-h-[244px] overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-bz-text-muted">
            <Loader2 size={13} className="animate-spin text-bz-fire" />
            <span className="text-[11.5px]">Loading…</span>
          </div>
        ) : visible.length === 0 ? (
          <p className="px-3 py-8 text-center text-[11.5px] text-bz-text-muted">No matches{raw ? ` for “${raw}”` : ""}.</p>
        ) : (
          <>
            {visible.map((o) => {
              const selected = o.id === value;
              return (
                <button
                  key={o.id}
                  onClick={() => pick(o.id)}
                  className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}
                >
                  {o.flag ? (
                    <span className="text-[14px] leading-none">{o.flag}</span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                    {o.sub && <span className={`block truncate text-[10.5px] text-bz-text-soft ${NUM}`}>{o.sub}</span>}
                  </span>
                  {selected && <Check size={12} className="shrink-0 text-bz-text" />}
                </button>
              );
            })}
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-2.5 text-bz-text-muted">
                <Loader2 size={11} className="animate-spin text-bz-fire" />
                <span className="text-[10.5px]">Loading more…</span>
              </div>
            )}
            {!loadingMore && !hasMore && (
              <p className={`px-3 py-2 text-center text-[10px] text-bz-text-soft ${NUM}`}>
                {filtered.length} {filtered.length === 1 ? "result" : "results"} · end of list
              </p>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIST FIELD  client-filtered single-select held in memory (e.g. precision).
// ════════════════════════════════════════════════════════════════════════════

function ListField({
  label, hint, value, onChange, options, disabled,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  disabled?: boolean;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [q, setQ] = React.useState("");
  const current = options.find((o) => o.id === value) ?? null;

  React.useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    setQ("");
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current && !btnRef.current.contains(t) && !(t instanceof Element && t.closest("[data-listpop]"))) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const query = q.trim().toLowerCase();
  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query) || (o.sub ?? "").toLowerCase().includes(query)) : options;

  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border bg-bz-surface px-3 text-left transition-colors",
          open ? "border-bz-text" : "border-bz-line-soft hover:border-bz-line",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="min-w-0 flex-1 truncate text-[13px] text-bz-text">
          {current ? current.label : <span className="text-bz-text-soft">Select…</span>}
          {current?.sub && <span className="ml-1.5 text-[11px] text-bz-text-soft">{current.sub}</span>}
        </span>
        <ChevronDown size={12} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && pos && createPortal(
        <div
          data-listpop
          style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 200) }}
          className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
        >
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={11} className="shrink-0 text-bz-text-muted" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-[11.5px] text-bz-text-muted">No matches.</p>
            ) : (
              filtered.map((o) => {
                const selected = o.id === value;
                return (
                  <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }} className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                      {o.sub && <span className={`block truncate text-[10.5px] text-bz-text-soft ${NUM}`}>{o.sub}</span>}
                    </span>
                    {selected && <Check size={12} className="shrink-0 text-bz-text" />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCOPE PICKER  multi-select chip control (host edit) — searchable, removable
// chips with overflow collapse, clear-all; change cascades a ledger reload.
// ════════════════════════════════════════════════════════════════════════════

const SCOPE_VISIBLE = 3;

function ScopePicker({
  label, pool, values, onChange, placeholder, icon: Icon,
}: {
  label: string;
  pool: Opt[];
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const btnRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [q, setQ] = React.useState("");
  const [showAll, setShowAll] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    setQ("");
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current && !btnRef.current.contains(t) && !(t instanceof Element && t.closest("[data-scopepop]"))) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const toggle = (id: string) => onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  const query = q.trim().toLowerCase();
  const filtered = query ? pool.filter((o) => o.label.toLowerCase().includes(query)) : pool;
  const selectedOpts = values.map((id) => pool.find((o) => o.id === id)).filter(Boolean) as Opt[];
  const shown = showAll ? selectedOpts : selectedOpts.slice(0, SCOPE_VISIBLE);
  const overflow = selectedOpts.length - shown.length;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-[11.5px] font-medium text-bz-text-muted">{label}</label>
        {values.length > 0 && (
          <button onClick={() => onChange([])} className="text-[10px] font-medium text-bz-text-muted hover:text-bz-text">Clear all</button>
        )}
      </div>
      <div
        ref={btnRef}
        className={cn(
          "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-bz-md border bg-bz-surface px-2 py-1.5 transition-colors",
          open ? "border-bz-text" : "border-bz-line-soft hover:border-bz-line",
        )}
      >
        <Icon size={13} className="ml-1 shrink-0 text-bz-text-muted" />
        {selectedOpts.length === 0 ? (
          <button onClick={() => setOpen(true)} className="flex-1 py-0.5 text-left text-[12.5px] text-bz-text-soft">{placeholder}</button>
        ) : (
          <>
            {shown.map((o) => (
              <span key={o.id} className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm py-0.5 pl-1.5 pr-1 text-[11.5px] text-bz-text">
                {o.flag && <span className="text-[12px] leading-none">{o.flag}</span>}
                {o.label}
                <button onClick={() => toggle(o.id)} aria-label={`Remove ${o.label}`} className="flex size-3.5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/60 hover:text-bz-text">
                  <X size={9} />
                </button>
              </span>
            ))}
            {overflow > 0 && (
              <button onClick={() => setShowAll(true)} className={`inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[11px] font-semibold text-bz-text-muted hover:text-bz-text ${NUM}`}>+{overflow}</button>
            )}
            {showAll && selectedOpts.length > SCOPE_VISIBLE && (
              <button onClick={() => setShowAll(false)} className="text-[10.5px] font-medium text-bz-text-muted hover:text-bz-text">less</button>
            )}
          </>
        )}
        <button onClick={() => setOpen((v) => !v)} aria-label={`Add ${label}`} className="ml-auto flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <Plus size={13} />
        </button>
      </div>
      {open && pos && createPortal(
        <div
          data-scopepop
          style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 220) }}
          className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
        >
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={11} className="shrink-0 text-bz-text-muted" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${label.toLowerCase()}…`} className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-[11.5px] text-bz-text-muted">No matches.</p>
            ) : (
              filtered.map((o) => {
                const on = values.includes(o.id);
                return (
                  <button key={o.id} onClick={() => toggle(o.id)} className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm", on && "bg-bz-fire/[0.06]")}>
                    <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-bz-sm border", on ? "border-bz-text bg-bz-text text-bz-paper" : "border-bz-line")}>
                      {on && <Check size={10} strokeWidth={3} />}
                    </span>
                    {o.flag && <span className="text-[14px] leading-none">{o.flag}</span>}
                    <span className="flex-1 truncate text-[12.5px] text-bz-text">{o.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION METADATA  the switchable named concerns
// ════════════════════════════════════════════════════════════════════════════

type SectionKey = "general" | "trade" | "hr" | "accounting" | "deletion" | "pos" | "danger";

type SectionMeta = {
  key: SectionKey;
  label: string;
  blurb: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};

const SECTIONS: Record<SectionKey, SectionMeta> = {
  general: { key: "general", label: "General", blurb: "Currency, units & numbering", desc: "Company-wide currency, measurement, precision and document-numbering defaults.", Icon: SlidersHorizontal },
  trade: { key: "trade", label: "Buying & Selling", blurb: "Terms & price lists", desc: "Default payment terms, price lists and the approval role for credit limits.", Icon: ArrowLeftRight },
  hr: { key: "hr", label: "HR & Payroll", blurb: "Payroll defaults", desc: "Default payroll accounts and standard people-policy values.", Icon: Briefcase },
  accounting: { key: "accounting", label: "Accounting", blurb: "Ledger & account mapping", desc: "Map company-wide defaults to ledger accounts. Every picker draws from one chart-of-accounts fetch.", Icon: Landmark },
  deletion: { key: "deletion", label: "Deletion Policy", blurb: "How records are removed", desc: "Decide what happens when a user deletes a record across the workspace.", Icon: Trash2 },
  pos: { key: "pos", label: "Point of Sale", blurb: "Counter defaults", desc: "Defaults the POS terminal uses for customer, payment and warehouse.", Icon: Store },
  danger: { key: "danger", label: "Danger Zone", blurb: "Irreversible actions", desc: "Irreversible workspace-level actions. Proceed with care.", Icon: ShieldAlert },
};

// section ordering by role (POS + Danger are tenant-only; POS references
// tenant-specific entities so it never appears for host templates)
const HOST_SECTIONS: SectionKey[] = ["general", "trade", "hr", "accounting", "deletion"];
const TENANT_SECTIONS: SectionKey[] = ["general", "trade", "hr", "accounting", "deletion", "pos"];

// ════════════════════════════════════════════════════════════════════════════
// SECTION CARD SHELL
// ════════════════════════════════════════════════════════════════════════════

function SectionCard({
  meta, danger, right, children,
}: {
  meta: SectionMeta;
  danger?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const Icon = meta.Icon;
  return (
    <section className={cn("overflow-hidden rounded-bz-lg border bg-bz-surface", danger ? "border-[#C0413A]/30" : "border-bz-line-soft")}>
      <header className={cn("flex items-start gap-3 border-b px-5 py-4", danger ? "border-[#C0413A]/20 bg-[#FBE5E2]/30" : "border-bz-line-soft bg-bz-paper-warm/30")}>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md", danger ? "bg-[#C0413A] text-white" : "bg-bz-deep text-bz-paper")}>
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={cn("text-[15px] font-semibold tracking-tight", danger ? "text-[#9A2E29]" : "text-bz-text")}>{meta.label}</h2>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{meta.desc}</p>
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function FlagGroup({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line-soft">{children}</div>;
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">{children}</p>;
}

// shared bag of editor context handed to every section
type SectionCtx = {
  draft: Settings;
  patch: (p: Partial<Settings>) => void;
  ledgerReloading: boolean;
  autoFilled: Set<keyof Settings>;
  coaLocked: boolean;
  onDeleteWorkspace: () => void;
};

// ════════════════════════════════════════════════════════════════════════════
// SECTION — GENERAL
// ════════════════════════════════════════════════════════════════════════════

function GeneralSection({ ctx }: { ctx: SectionCtx }) {
  const { draft, patch } = ctx;
  return (
    <SectionCard meta={SECTIONS.general}>
      <FieldGrid>
        <RefField label="Default Currency" required value={draft.currency} onChange={(v) => patch({ currency: v })} pool={CURRENCIES} placeholder="Select a currency" icon={Coins} />
        <RefField label="Default Country" value={draft.country} onChange={(v) => patch({ country: v })} pool={COUNTRIES} placeholder="Select a country" icon={Globe} />
        <RefField label="Distance Unit" value={draft.distanceUnit} onChange={(v) => patch({ distanceUnit: v })} pool={UNITS} placeholder="Select a unit" icon={Ruler} />
        <ListField label="Number Precision" hint="float places" value={draft.precision} onChange={(v) => patch({ precision: v })} options={PRECISION_OPTIONS} />
      </FieldGrid>

      <div className="mt-6">
        <SubLabel>Document auto-numbering</SubLabel>
        <RadioCards
          options={NUMBERING_STRATEGIES}
          value={draft.numbering}
          onChange={(v) => patch({ numbering: v, ...(v === "auto_reset" && draft.numberingThreshold === undefined ? { numberingThreshold: 9999 } : {}) })}
        />
        {/* conditionally-revealed dependent field */}
        {draft.numbering === "auto_reset" && (
          <div className="mt-3 flex flex-col gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3.5 sm:flex-row sm:items-end sm:gap-4">
            <div className="sm:w-52">
              <NumberField label="Reset threshold" value={draft.numberingThreshold} onChange={(v) => patch({ numberingThreshold: v })} placeholder="9999" min={1} />
            </div>
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-bz-text-muted sm:pb-2.5">
              <Info size={12} className="mt-0.5 shrink-0 text-bz-text-soft" />
              When the running counter passes this value it resets to 1 and a new series block begins.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <SubLabel>Display behaviour</SubLabel>
        <FlagGroup>
          <ToggleRow title="Show currency symbol" desc="Print the currency symbol alongside amounts on documents." value={draft.showCurrencySymbol} onChange={(v) => patch({ showCurrencySymbol: v })} />
          <ToggleRow title="Disable rounded total" desc="Suppress automatic rounding of grand totals." value={draft.disableRoundedTotal} onChange={(v) => patch({ disableRoundedTotal: v })} />
          <ToggleRow title="Hide amount in words" desc="Omit the spelled-out amount line on printed documents." value={draft.hideAmountInWords} onChange={(v) => patch({ hideAmountInWords: v })} />
        </FlagGroup>
      </div>
    </SectionCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION — BUYING & SELLING
// ════════════════════════════════════════════════════════════════════════════

function TradeSection({ ctx }: { ctx: SectionCtx }) {
  const { draft, patch } = ctx;
  return (
    <SectionCard meta={SECTIONS.trade}>
      <FieldGrid>
        <RefField label="Default Payment Terms" value={draft.paymentTerms} onChange={(v) => patch({ paymentTerms: v })} pool={PAYMENT_TERMS} placeholder="Select payment terms" icon={CreditCard} />
        <RefField label="Credit-limit Approval Role" value={draft.creditApprovalRole} onChange={(v) => patch({ creditApprovalRole: v })} pool={ROLES} placeholder="Select a role" icon={ShieldCheck} />
        <RefField label="Default Selling Price List" value={draft.sellingPriceList} onChange={(v) => patch({ sellingPriceList: v })} pool={PRICE_LISTS} placeholder="Select a price list" icon={Tag} />
        <RefField label="Default Buying Price List" value={draft.buyingPriceList} onChange={(v) => patch({ buyingPriceList: v })} pool={PRICE_LISTS} placeholder="Select a price list" icon={Tag} />
      </FieldGrid>
    </SectionCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION — HR & PAYROLL
// ════════════════════════════════════════════════════════════════════════════

function HrSection({ ctx }: { ctx: SectionCtx }) {
  const { draft, patch, ledgerReloading } = ctx;
  return (
    <SectionCard meta={SECTIONS.hr}>
      <FieldGrid>
        <RefField label="Payroll Payable Account" value={draft.payrollPayable} onChange={(v) => patch({ payrollPayable: v })} pool={LEDGER} placeholder="Select an account" icon={Banknote} reloading={ledgerReloading} />
        <RefField label="Employee Advance Account" value={draft.employeeAdvance} onChange={(v) => patch({ employeeAdvance: v })} pool={LEDGER} placeholder="Select an account" icon={Banknote} reloading={ledgerReloading} />
        <NumberField label="Standard Working Hours" hint="per week" value={draft.workingHours} onChange={(v) => patch({ workingHours: v })} suffix="hrs" min={0} max={80} placeholder="40" />
        <NumberField label="Retirement Age" value={draft.retirementAge} onChange={(v) => patch({ retirementAge: v })} suffix="yrs" min={40} max={75} placeholder="58" />
      </FieldGrid>
    </SectionCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION — ACCOUNTING  (all ledger pickers share one fetch; deferred fill;
// cascading reload on scope change)
// ════════════════════════════════════════════════════════════════════════════

function AccountingSection({ ctx }: { ctx: SectionCtx }) {
  const { draft, patch, ledgerReloading, autoFilled, coaLocked } = ctx;
  return (
    <SectionCard
      meta={SECTIONS.accounting}
      right={
        ledgerReloading ? (
          <span className="hidden items-center gap-1.5 rounded-bz-pill bg-bz-fire/[0.14] px-2.5 py-1 text-[10.5px] font-medium text-bz-text sm:inline-flex">
            <Loader2 size={11} className="animate-spin text-bz-fire" /> Reloading for scope
          </span>
        ) : null
      }
    >
      <FieldGrid>
        <RefField label="Default Bank Account" value={draft.bankAccount} onChange={(v) => patch({ bankAccount: v })} pool={LEDGER} placeholder="Select an account" icon={Landmark} reloading={ledgerReloading} />
        <RefField label="Default Cash Account" value={draft.cashAccount} onChange={(v) => patch({ cashAccount: v })} pool={LEDGER} placeholder="Select an account" icon={Banknote} reloading={ledgerReloading} />
        <RefField label="Default Receivable" value={draft.receivable} onChange={(v) => patch({ receivable: v })} pool={LEDGER} placeholder="Select an account" icon={Landmark} reloading={ledgerReloading} />
        <RefField label="Default Payable" value={draft.payable} onChange={(v) => patch({ payable: v })} pool={LEDGER} placeholder="Select an account" icon={Landmark} reloading={ledgerReloading} />
        <RefField label="Round-off Account" value={draft.roundOff} onChange={(v) => patch({ roundOff: v })} pool={LEDGER} placeholder="Select an account" icon={Landmark} reloading={ledgerReloading} />
        <RefField
          label="Withholding (TDS) Payable"
          value={draft.withholdingPayable}
          onChange={(v) => patch({ withholdingPayable: v })}
          pool={LEDGER}
          placeholder="Select an account"
          icon={Landmark}
          reloading={ledgerReloading}
          note={autoFilled.has("withholdingPayable") ? <AutoFilledNote /> : undefined}
        />
        <RefField label="Exchange Gain / Loss" value={draft.exchangeGainLoss} onChange={(v) => patch({ exchangeGainLoss: v })} pool={LEDGER} placeholder="Select an account" icon={ArrowLeftRight} reloading={ledgerReloading} />
      </FieldGrid>

      <div className="mt-6">
        <SubLabel>Accounting behaviour</SubLabel>
        <FlagGroup>
          <ToggleRow
            title="Adopt default Chart of Accounts"
            desc="Insert Bizak's standard chart of accounts for this scope."
            lockNote="The default chart of accounts has already been inserted for this workspace."
            value={draft.adoptDefaultCoA}
            onChange={(v) => patch({ adoptDefaultCoA: v })}
            locked={coaLocked}
          />
          <ToggleRow title="Check budget on actuals" desc="Warn (or block) when a transaction pushes spend over the budget for its account." value={draft.budgetOverdueCheck} onChange={(v) => patch({ budgetOverdueCheck: v })} />
        </FlagGroup>
      </div>
    </SectionCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION — DELETION POLICY
// ════════════════════════════════════════════════════════════════════════════

function DeletionSection({ ctx }: { ctx: SectionCtx }) {
  const { draft, patch } = ctx;
  return (
    <SectionCard meta={SECTIONS.deletion}>
      <RadioCards options={DELETION_POLICIES} value={draft.deletionPolicy} onChange={(v) => patch({ deletionPolicy: v })} />
    </SectionCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION — POINT OF SALE  (tenant only)
// ════════════════════════════════════════════════════════════════════════════

function PosSection({ ctx }: { ctx: SectionCtx }) {
  const { draft, patch } = ctx;
  return (
    <SectionCard meta={SECTIONS.pos}>
      <FieldGrid>
        <RefField label="Default POS Customer" value={draft.posCustomer} onChange={(v) => patch({ posCustomer: v })} pool={POS_CUSTOMERS} placeholder="Select a customer" icon={User} />
        <RefField label="Default Payment Method" value={draft.posPaymentMethod} onChange={(v) => patch({ posPaymentMethod: v })} pool={POS_METHODS} placeholder="Select a method" icon={Wallet} />
        <RefField label="Default Warehouse" value={draft.posWarehouse} onChange={(v) => patch({ posWarehouse: v })} pool={POS_WAREHOUSES} placeholder="Select a warehouse" icon={Store} />
      </FieldGrid>
    </SectionCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION — DANGER ZONE  (tenant only)
// ════════════════════════════════════════════════════════════════════════════

function DangerSection({ ctx }: { ctx: SectionCtx }) {
  return (
    <SectionCard meta={SECTIONS.danger} danger>
      <div className="flex flex-col gap-4 rounded-bz-md border border-[#C0413A]/25 bg-[#FBE5E2]/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#9A2E29]">Delete this workspace</p>
          <p className="mt-1 max-w-md text-[11.5px] leading-relaxed text-bz-text-muted">
            Takes <span className="font-semibold text-bz-text">{WORKSPACE_NAME}</span> offline and signs out all {WORKSPACE_USERS} members. Data stays recoverable for 30 days, then is permanently removed.
          </p>
        </div>
        <button
          onClick={ctx.onDeleteWorkspace}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-bz-md bg-[#C0413A] px-3.5 text-[12.5px] font-semibold text-white hover:bg-[#9A2E29]"
        >
          <Trash2 size={14} /> Delete workspace
        </button>
      </div>
    </SectionCard>
  );
}

function renderSection(key: SectionKey, ctx: SectionCtx) {
  switch (key) {
    case "general": return <GeneralSection ctx={ctx} />;
    case "trade": return <TradeSection ctx={ctx} />;
    case "hr": return <HrSection ctx={ctx} />;
    case "accounting": return <AccountingSection ctx={ctx} />;
    case "deletion": return <DeletionSection ctx={ctx} />;
    case "pos": return <PosSection ctx={ctx} />;
    case "danger": return <DangerSection ctx={ctx} />;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION NAVIGATION  desktop rail + mobile strip; live per-section counts
// ════════════════════════════════════════════════════════════════════════════

// count of configured (non-default) values per section — reconciles with data
function sectionCount(key: SectionKey, s: Settings): number {
  switch (key) {
    case "general":
      return [s.currency, s.country, s.distanceUnit].filter(Boolean).length + (s.precision !== "__system__" ? 1 : 0) + (s.numbering !== "series" ? 1 : 0);
    case "trade":
      return [s.paymentTerms, s.creditApprovalRole, s.sellingPriceList, s.buyingPriceList].filter(Boolean).length;
    case "hr":
      return [s.payrollPayable, s.employeeAdvance].filter(Boolean).length + (s.workingHours != null ? 1 : 0) + (s.retirementAge != null ? 1 : 0);
    case "accounting":
      return [s.bankAccount, s.cashAccount, s.receivable, s.payable, s.roundOff, s.withholdingPayable, s.exchangeGainLoss].filter(Boolean).length;
    case "deletion":
      return s.deletionPolicy !== "trash" ? 1 : 0;
    case "pos":
      return [s.posCustomer, s.posPaymentMethod, s.posWarehouse].filter(Boolean).length;
    case "danger":
      return 0;
  }
}

function NavItem({
  meta, active, count, onSelect, danger,
}: {
  meta: SectionMeta;
  active: boolean;
  count: number;
  onSelect: () => void;
  danger?: boolean;
}) {
  const Icon = meta.Icon;
  return (
    <button
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group relative flex items-center gap-3 rounded-bz-md border py-2.5 pl-3 pr-2.5 text-left transition-colors",
        active
          ? danger
            ? "border-[#C0413A]/40 bg-[#FBE5E2]/40 shadow-[0_1px_2px_rgba(15,20,17,0.04)]"
            : "border-bz-text bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.06)]"
          : "border-transparent hover:border-bz-line-soft hover:bg-bz-paper-warm/50",
      )}
    >
      <span className={cn("absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-bz-pill transition-opacity", danger ? "bg-[#C0413A]" : "bg-bz-fire", active ? "opacity-100" : "opacity-0")} aria-hidden />
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-bz-md", active ? (danger ? "bg-[#C0413A] text-white" : "bg-bz-deep text-bz-paper") : danger ? "bg-[#FBE7E5] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text-muted group-hover:text-bz-text")}>
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-[13px] font-semibold", danger ? "text-[#9A2E29]" : "text-bz-text")}>{meta.label}</span>
        <span className="block truncate text-[10.5px] text-bz-text-muted">{meta.blurb}</span>
      </span>
      {count > 0 && (
        <span className={`flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire/[0.2] px-1 text-[10px] font-semibold text-bz-text ${NUM}`}>{count}</span>
      )}
    </button>
  );
}

function SectionRail({
  role, sectionKeys, active, onSelect, settings, scope, onDeleteSelectDanger,
}: {
  role: Role;
  sectionKeys: SectionKey[];
  active: SectionKey;
  onSelect: (k: SectionKey) => void;
  settings: Settings;
  scope?: React.ReactNode;
  onDeleteSelectDanger: () => void;
}) {
  return (
    <aside className="hidden flex-col gap-4 lg:sticky lg:top-5 lg:flex lg:self-start">
      {scope}
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface p-2">
        <p className="px-2 pb-1.5 pt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Sections</p>
        <div className="flex flex-col gap-1">
          {sectionKeys.map((k) => (
            <NavItem key={k} meta={SECTIONS[k]} active={active === k} count={sectionCount(k, settings)} onSelect={() => onSelect(k)} />
          ))}
        </div>
        {role === "tenant" && (
          <>
            <div className="my-2 h-px bg-bz-line-soft" />
            <NavItem meta={SECTIONS.danger} active={active === "danger"} count={0} danger onSelect={onDeleteSelectDanger} />
          </>
        )}
      </div>
    </aside>
  );
}

function SectionStrip({
  role, sectionKeys, active, onSelect, settings,
}: {
  role: Role;
  sectionKeys: SectionKey[];
  active: SectionKey;
  onSelect: (k: SectionKey) => void;
  settings: Settings;
}) {
  const keys: SectionKey[] = role === "tenant" ? [...sectionKeys, "danger"] : sectionKeys;
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
      {keys.map((k) => {
        const meta = SECTIONS[k];
        const Icon = meta.Icon;
        const on = active === k;
        const danger = k === "danger";
        const count = sectionCount(k, settings);
        return (
          <button
            key={k}
            onClick={() => onSelect(k)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-bz-pill border px-3 text-[12px] font-medium transition-colors",
              on
                ? danger ? "border-[#C0413A] bg-[#C0413A] text-white" : "border-bz-deep bg-bz-deep text-bz-paper"
                : danger ? "border-[#C0413A]/30 bg-bz-surface text-[#9A2E29]" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:text-bz-text",
            )}
          >
            <Icon size={13} /> {meta.label}
            {count > 0 && <span className={`ml-0.5 ${NUM} ${on ? "opacity-80" : "text-bz-text-soft"}`}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCOPE CARD  (host edit) — the template's "applies to" identity in the rail
// ════════════════════════════════════════════════════════════════════════════

function ScopeCard({
  countries, industries, onCountries, onIndustries,
}: {
  countries: string[];
  industries: string[];
  onCountries: (v: string[]) => void;
  onIndustries: (v: string[]) => void;
}) {
  return (
    <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <div className="border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Applies to</p>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <ScopePicker label="Countries" pool={COUNTRIES} values={countries} onChange={onCountries} placeholder="Any country" icon={Globe} />
        <ScopePicker label="Industries" pool={INDUSTRIES} values={industries} onChange={onIndustries} placeholder="Any industry" icon={Factory} />
        <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-bz-text-soft">
          <Info size={11} className="mt-0.5 shrink-0" />
          Both optional — empty means the template applies to <span className="font-medium text-bz-text-muted">Any</span>. Changing scope reloads the account options.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EDITOR BODY  scope rail + section nav + active section
// ════════════════════════════════════════════════════════════════════════════

function EditorBody({
  role, sectionKeys, activeSection, setActiveSection, scopeNode, ctx, settings, onSelectDanger,
}: {
  role: Role;
  sectionKeys: SectionKey[];
  activeSection: SectionKey;
  setActiveSection: (k: SectionKey) => void;
  scopeNode?: React.ReactNode;
  ctx: SectionCtx;
  settings: Settings;
  onSelectDanger: () => void;
}) {
  return (
    <div className="px-4 pb-28 pt-4 md:px-6">
      <SectionStrip role={role} sectionKeys={sectionKeys} active={activeSection} onSelect={setActiveSection} settings={settings} />
      {scopeNode && <div className="mt-3 lg:hidden">{scopeNode}</div>}
      <div className="mt-4 grid grid-cols-1 gap-5 lg:mt-0 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <SectionRail
          role={role}
          sectionKeys={sectionKeys}
          active={activeSection}
          onSelect={setActiveSection}
          settings={settings}
          scope={scopeNode}
          onDeleteSelectDanger={onSelectDanger}
        />
        <div className="min-w-0">{renderSection(activeSection, ctx)}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROLE
// ════════════════════════════════════════════════════════════════════════════

type Role = "host" | "tenant";

// ════════════════════════════════════════════════════════════════════════════
// FILTER SELECT  compact client-filtered single-select with an "Any" entry
// ════════════════════════════════════════════════════════════════════════════

function FilterSelect({
  icon: Icon, value, onChange, options, anyLabel,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  anyLabel: string;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [q, setQ] = React.useState("");
  const current = options.find((o) => o.id === value) ?? null;

  React.useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    setQ("");
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current && !btnRef.current.contains(t) && !(t instanceof Element && t.closest("[data-filterpop]"))) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open]);

  const query = q.trim().toLowerCase();
  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query)) : options;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-bz-md border bg-bz-surface px-3 text-[12.5px] transition-colors",
          open ? "border-bz-text" : "border-bz-line bg-bz-surface hover:bg-bz-paper-warm",
        )}
      >
        <Icon size={13} className="text-bz-text-muted" />
        <span className={current ? "font-medium text-bz-text" : "text-bz-text-soft"}>{current ? current.label : anyLabel}</span>
        <ChevronDown size={11} className={cn("text-bz-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && pos && createPortal(
        <div data-filterpop style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 200) }} className="z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          <div className="border-b border-bz-line-soft p-2">
            <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
              <Search size={11} className="shrink-0 text-bz-text-muted" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted" />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            <button onClick={() => { onChange(""); setOpen(false); }} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm", value === "" && "bg-bz-fire/[0.06]")}>
              <span className="flex-1 text-[12.5px] text-bz-text">{anyLabel}</span>
              {value === "" && <Check size={12} className="text-bz-text" />}
            </button>
            <div className="my-1 h-px bg-bz-line-soft" />
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-[11.5px] text-bz-text-muted">No matches.</p>
            ) : filtered.map((o) => {
              const sel = o.id === value;
              return (
                <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }} className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm", sel && "bg-bz-fire/[0.06]")}>
                  {o.flag && <span className="text-[14px] leading-none">{o.flag}</span>}
                  <span className="flex-1 truncate text-[12.5px] text-bz-text">{o.label}</span>
                  {sel && <Check size={12} className="shrink-0 text-bz-text" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HOST BROWSE — scope chips · template card · grid · loading / empty / no-results
// ════════════════════════════════════════════════════════════════════════════

function ScopeChips({ ids, pool, anyLabel }: { ids: string[]; pool: Opt[]; anyLabel: string }) {
  if (ids.length === 0) {
    return <span className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-2 py-0.5 text-[11px] font-medium text-bz-text-soft">{anyLabel}</span>;
  }
  const opts = ids.map((id) => pool.find((o) => o.id === id)).filter(Boolean) as Opt[];
  const shown = opts.slice(0, 3);
  const overflow = opts.length - shown.length;
  return (
    <>
      {shown.map((o) => (
        <span key={o.id} className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-2 py-0.5 text-[11px] font-medium text-bz-text">
          {o.flag && <span className="text-[12px] leading-none">{o.flag}</span>}
          {o.label}
        </span>
      ))}
      {overflow > 0 && <span className={`inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[11px] font-semibold text-bz-text-muted ${NUM}`}>+{overflow}</span>}
    </>
  );
}

function TemplateCard({ t, onEdit, onDelete }: { t: Template; onEdit: () => void; onDelete: () => void }) {
  return (
    <div
      onClick={onEdit}
      role="button"
      className="group flex cursor-pointer flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 transition-colors hover:border-bz-line hover:shadow-[0_8px_24px_-16px_rgba(15,20,17,0.18)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-[12.5px] font-semibold tracking-tight text-bz-text ${NUM}`}>{t.id}</span>
        <div className="-mr-1 -mt-1 flex items-center opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
          <IconTip label="Edit template" icon={Pencil} onClick={onEdit} />
          <IconTip label="Delete template" icon={Trash2} danger onClick={onDelete} />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Countries</span>
          <ScopeChips ids={t.countries} pool={COUNTRIES} anyLabel="Any" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">Industries</span>
          <ScopeChips ids={t.industries} pool={INDUSTRIES} anyLabel="Any" />
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-4 border-t border-bz-line-soft pt-3">
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Currency</p>
          <p className={`mt-0.5 text-[12.5px] font-semibold text-bz-text ${NUM}`}>{t.settings.currency ?? "—"}</p>
        </div>
        <span className="h-7 w-px bg-bz-line-soft" />
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Precision</p>
          <p className={`mt-0.5 text-[12.5px] font-semibold text-bz-text ${NUM}`}>{precisionLabel(t.settings.precision)}</p>
        </div>
        <span className="h-7 w-px bg-bz-line-soft" />
        <div className="min-w-0">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Deletion</p>
          <p className="mt-0.5 truncate text-[12.5px] font-medium text-bz-text">{DELETION_POLICIES.find((d) => d.key === t.settings.deletionPolicy)?.label}</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
          <div className="h-3 w-16 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="mt-3 h-4 w-40 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="mt-2 h-4 w-28 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="mt-4 h-7 w-full animate-pulse rounded-bz-sm bg-bz-paper-warm" />
        </div>
      ))}
    </div>
  );
}

function BrowseView({
  templates, filtered, loading, fCountry, fIndustry, searchRaw, onCountry, onIndustry, onSearchRaw, onSubmitSearch, onClearFilters, onCreate, onEdit, onDelete,
}: {
  templates: Template[];
  filtered: Template[];
  loading: boolean;
  fCountry: string;
  fIndustry: string;
  searchRaw: string;
  onCountry: (v: string) => void;
  onIndustry: (v: string) => void;
  onSearchRaw: (v: string) => void;
  onSubmitSearch: () => void;
  onClearFilters: () => void;
  onCreate: () => void;
  onEdit: (t: Template) => void;
  onDelete: (t: Template) => void;
}) {
  const hasFilters = !!fCountry || !!fIndustry || !!searchRaw;
  return (
    <div className="px-4 pb-12 md:px-6">
      {/* filter toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-bz-line-soft py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmitSearch(); }}
          className="relative min-w-0 flex-1"
          style={{ maxWidth: 360 }}
        >
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-muted" />
          <input
            value={searchRaw}
            onChange={(e) => onSearchRaw(e.target.value)}
            placeholder="Search templates… (press Enter)"
            className="h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper py-2 pl-9 pr-8 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
          />
          {searchRaw && (
            <button type="button" onClick={() => { onSearchRaw(""); onSubmitSearch(); }} aria-label="Clear" className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
              <X size={12} />
            </button>
          )}
        </form>
        <FilterSelect icon={Globe} value={fCountry} onChange={onCountry} options={COUNTRIES} anyLabel="Any country" />
        <FilterSelect icon={Factory} value={fIndustry} onChange={onIndustry} options={INDUSTRIES} anyLabel="Any industry" />
        {hasFilters && (
          <button onClick={onClearFilters} className="text-[12px] font-medium text-bz-text-muted hover:text-bz-text">Clear</button>
        )}
        <span className={`ml-auto text-[11.5px] text-bz-text-muted ${NUM}`}>
          <span className="font-semibold text-bz-text">{filtered.length}</span> of {templates.length} {templates.length === 1 ? "template" : "templates"}
        </span>
      </div>

      {/* records */}
      <div className="pt-4">
        {loading ? (
          <SkeletonCards />
        ) : templates.length === 0 ? (
          <EmptyBlock
            icon={SlidersHorizontal}
            title="No preference templates yet"
            body="Create your first reusable default-preference template, scoped to the countries and industries it should apply to."
            action={<button onClick={onCreate} className={PRIMARY_BTN}><Plus size={14} /> New template</button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyBlock
            icon={Search}
            title="No templates match"
            body="Nothing matches the current filters. Try widening the country, industry or search."
            action={<button onClick={onClearFilters} className={GHOST_BTN}><X size={13} /> Clear filters</button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => (
              <TemplateCard key={t.id} t={t} onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyBlock({
  icon: Icon, title, body, action,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-bz-lg border border-dashed border-bz-line bg-bz-surface/60 px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Icon size={22} /></span>
      <p className="text-[14px] font-semibold text-bz-text">{title}</p>
      <p className="max-w-sm text-[12px] leading-relaxed text-bz-text-muted">{body}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DIALOGS  modal shell · delete-template confirm · typed-name workspace delete
// ════════════════════════════════════════════════════════════════════════════

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bz-olive-dark/40" onClick={onClose} />
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_80px_-30px_rgba(15,20,17,0.4)]">
        {children}
      </div>
    </div>,
    document.body,
  );
}

function ConfirmDeleteTemplate({ template, onCancel, onConfirm }: { template: Template | null; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal open={!!template} onClose={onCancel}>
      {template && (
        <>
          <div className="flex items-start gap-3 p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-[#FBE7E5] text-[#9A2E29]"><Trash2 size={17} /></span>
            <div className="min-w-0">
              <h3 className="text-[14.5px] font-semibold text-bz-text">Delete preference template?</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-bz-text-muted">
                <span className={`font-semibold text-bz-text ${NUM}`}>{template.id}</span> — {describeTemplate(template)}. This can't be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/30 px-5 py-3">
            <button onClick={onCancel} className={GHOST_BTN}>Cancel</button>
            <button onClick={onConfirm} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-[#C0413A] px-3.5 text-[12.5px] font-semibold text-white hover:bg-[#9A2E29]"><Trash2 size={14} /> Delete template</button>
          </div>
        </>
      )}
    </Modal>
  );
}

function DeleteWorkspaceDialog({ open, onClose, onConfirmed }: { open: boolean; onClose: () => void; onConfirmed: () => void }) {
  const [typed, setTyped] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  React.useEffect(() => { if (open) { setTyped(""); setPosting(false); } }, [open]);
  const match = typed.trim() === WORKSPACE_NAME;
  const confirm = () => {
    if (!match || posting) return;
    setPosting(true);
    window.setTimeout(() => { onConfirmed(); }, 1100);
  };
  return (
    <Modal open={open} onClose={posting ? () => {} : onClose}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-[#C0413A] text-white"><AlertTriangle size={17} /></span>
          <div className="min-w-0">
            <h3 className="text-[14.5px] font-semibold text-[#9A2E29]">Delete this workspace</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-bz-text-muted">
              This takes <span className="font-semibold text-bz-text">{WORKSPACE_NAME}</span> offline and signs out all {WORKSPACE_USERS} members. Data stays recoverable for 30 days, then is permanently deleted.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-[11.5px] font-medium text-bz-text-muted">Type <span className="font-semibold text-bz-text">{WORKSPACE_NAME}</span> to confirm</label>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={posting}
            placeholder={WORKSPACE_NAME}
            className="mt-1.5 h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-[#C0413A] disabled:opacity-60"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/30 px-5 py-3">
        <button onClick={onClose} disabled={posting} className={GHOST_BTN}>Cancel</button>
        <button
          onClick={confirm}
          disabled={!match || posting}
          className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-[#C0413A] px-3.5 text-[12.5px] font-semibold text-white hover:bg-[#9A2E29] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {posting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {posting ? "Deleting…" : "Delete workspace"}
        </button>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

type ToastState = { kind: "success" | "error"; message: string; id: number } | null;

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const ok = toast.kind === "success";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", ok ? "bg-bz-fire/[0.22]" : "bg-[#FBE7E5]")}>
          {ok ? <Check size={13} className="text-bz-leaf-deep" /> : <Ban size={12} className="text-[#9A2E29]" />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={11} /></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED FOOTER  (edit context — content scrolls above it)
// ════════════════════════════════════════════════════════════════════════════

function ActionFooter({
  role, saving, dirty, onDiscard, onSave, canSave,
}: {
  role: Role;
  saving: boolean;
  dirty: boolean;
  onDiscard: () => void;
  onSave: () => void;
  canSave: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <p className="flex min-w-0 items-center gap-2 text-[11.5px] text-bz-text-muted">
        {saving ? (
          <><Loader2 size={12} className="shrink-0 animate-spin text-bz-fire" /> Saving…</>
        ) : dirty ? (
          <><span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" /> <span className="truncate">Unsaved changes</span></>
        ) : (
          <><Check size={12} className="shrink-0 text-bz-leaf-deep" /> <span className="truncate">{role === "tenant" ? "Global defaults are up to date" : "Template is up to date"}</span></>
        )}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={onDiscard} disabled={!dirty || saving} className="inline-flex h-8 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40">Discard</button>
        <button onClick={onSave} disabled={!canSave || saving} className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          {role === "tenant" ? "Save defaults" : "Save template"}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PREVIEW SWITCH  flip between the two whole role experiences (demo affordance)
// ════════════════════════════════════════════════════════════════════════════

function PreviewSwitch({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-bz-pill border border-bz-line-soft bg-bz-surface py-1 pl-2.5 pr-1">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">
        <Eye size={11} /> Preview
      </span>
      <div className="flex rounded-bz-pill bg-bz-paper-warm p-0.5">
        {(["tenant", "host"] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={cn("h-6 rounded-bz-pill px-2.5 text-[11px] font-semibold capitalize transition-colors", role === r ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.08)]" : "text-bz-text-muted hover:text-bz-text")}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE HEADER  contextual title + status + preview switch + per-view actions
// ════════════════════════════════════════════════════════════════════════════

function PageHeader({
  role, hostMode, editId, count, onRole, onBack, onCreate,
}: {
  role: Role;
  hostMode: "browse" | "edit";
  editId: string | null;
  count: number;
  onRole: (r: Role) => void;
  onBack: () => void;
  onCreate: () => void;
}) {
  const isHostEdit = role === "host" && hostMode === "edit";
  const title = role === "tenant" ? "Global Defaults" : hostMode === "browse" ? "Default Templates" : editId ? "Edit template" : "New template";
  const Icon = role === "tenant" ? SlidersHorizontal : Building2;

  return (
    <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-5 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 items-center gap-3">
          {isHostEdit && (
            <button onClick={onBack} aria-label="Back to templates" className="flex size-9 shrink-0 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
              <ArrowLeft size={15} />
            </button>
          )}
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper"><Icon size={17} strokeWidth={1.8} /></span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[21px] font-semibold tracking-tight text-bz-text">{title}</h1>
              {role === "tenant" ? (
                <span className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-fire/[0.18] px-2 py-0.5 text-[10.5px] font-semibold text-bz-text">
                  <span className="size-1.5 rounded-bz-pill bg-bz-leaf-deep" /> Live · this workspace
                </span>
              ) : hostMode === "browse" ? (
                <span className={`inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[11px] font-semibold text-bz-text-muted ${NUM}`}>{count}</span>
              ) : (
                <span className={`inline-flex items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-medium text-bz-text-muted ${NUM}`}>{editId ?? "Unsaved draft"}</span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] text-bz-text-muted">
              {role === "tenant"
                ? "Company-wide accounting, currency, numbering and POS defaults for your workspace."
                : hostMode === "browse"
                  ? "Author reusable default-preference templates, scoped by country and industry."
                  : "Declare the scope this template applies to, then set its defaults."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <PreviewSwitch role={role} onChange={onRole} />
          {role === "host" && hostMode === "browse" && (
            <button onClick={onCreate} className={PRIMARY_BTN}><Plus size={14} /> New template</button>
          )}
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT  the role-reactive controller (the single session-identity decision)
// ════════════════════════════════════════════════════════════════════════════

export function PreferencesDesignPage() {
  const [role, setRole] = React.useState<Role>("tenant");

  // host records
  const [templates, setTemplates] = React.useState<Template[]>(SEED_TEMPLATES);
  const [hostMode, setHostMode] = React.useState<"browse" | "edit">("browse");
  const [editId, setEditId] = React.useState<string | null>(null);

  // host filters (pickers re-query immediately; text on submit)
  const [fCountry, setFCountry] = React.useState("");
  const [fIndustry, setFIndustry] = React.useState("");
  const [searchRaw, setSearchRaw] = React.useState("");
  const [appliedSearch, setAppliedSearch] = React.useState("");
  const [browseLoading, setBrowseLoading] = React.useState(false);

  // tenant live set
  const [tenantSettings, setTenantSettings] = React.useState<Settings>(() => ({ ...TENANT_LIVE }));

  // editor working state
  const [draft, setDraft] = React.useState<Settings>(() => ({ ...TENANT_LIVE }));
  const snapshotRef = React.useRef<Settings>({ ...TENANT_LIVE });
  const [scopeCountries, setScopeCountries] = React.useState<string[]>([]);
  const [scopeIndustries, setScopeIndustries] = React.useState<string[]>([]);
  const [activeSection, setActiveSection] = React.useState<SectionKey>("general");
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // reactive editor behaviours
  const [ledgerReloading, setLedgerReloading] = React.useState(false);
  const [autoFilled, setAutoFilled] = React.useState<Set<keyof Settings>>(new Set());
  const accountingFilledRef = React.useRef(false);

  // flow surfaces
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const showToast = (kind: "success" | "error", message: string) => setToast({ kind, message, id: ++toastId.current });
  const [confirmTemplate, setConfirmTemplate] = React.useState<Template | null>(null);
  const [deleteWsOpen, setDeleteWsOpen] = React.useState(false);

  const sectionKeys = role === "host" ? HOST_SECTIONS : TENANT_SECTIONS;
  const coaLocked = role === "tenant" && TENANT_COA_INSERTED;
  const inEditor = role === "tenant" || hostMode === "edit";

  // ── load a settings set into the editor ──
  const loadEditor = React.useCallback((settings: Settings, countries: string[], industries: string[], id: string | null) => {
    const clone = { ...settings };
    setDraft(clone);
    snapshotRef.current = { ...settings };
    setScopeCountries(countries);
    setScopeIndustries(industries);
    setEditId(id);
    setActiveSection("general");
    setDirty(false);
    setAutoFilled(new Set());
    accountingFilledRef.current = false;
  }, []);

  // ── patch the draft (clears the auto-filled flag if the user edits it) ──
  const patch = React.useCallback((p: Partial<Settings>) => {
    setDraft((d) => ({ ...d, ...p }));
    setDirty(true);
    if ("withholdingPayable" in p) setAutoFilled((s) => { const n = new Set(s); n.delete("withholdingPayable"); return n; });
  }, []);

  // ── deferred default-fill: entering Accounting fills empty withholding from
  //    the system default, only if it exists in the loaded ledger set ──
  React.useEffect(() => {
    if (activeSection !== "accounting" || ledgerReloading || accountingFilledRef.current) return;
    accountingFilledRef.current = true;
    if (draft.withholdingPayable == null && LEDGER.some((l) => l.id === DEFAULT_TDS_PAYABLE)) {
      setDraft((d) => (d.withholdingPayable == null ? { ...d, withholdingPayable: DEFAULT_TDS_PAYABLE } : d));
      setAutoFilled((s) => new Set(s).add("withholdingPayable"));
      setDirty(true);
    }
  }, [activeSection, ledgerReloading, draft.withholdingPayable]);

  // ── cascading reload: scope change re-fetches the ledger options ──
  const reloadLedgerForScope = React.useCallback(() => {
    setLedgerReloading(true);
    accountingFilledRef.current = false; // re-run the deferred fill against the new set
    window.setTimeout(() => setLedgerReloading(false), 720);
  }, []);
  const onScopeCountries = (v: string[]) => { setScopeCountries(v); setDirty(true); reloadLedgerForScope(); };
  const onScopeIndustries = (v: string[]) => { setScopeIndustries(v); setDirty(true); reloadLedgerForScope(); };

  // ── browse filtering (server-driven feel: brief load on change) ──
  React.useEffect(() => {
    if (role !== "host" || hostMode !== "browse") return;
    setBrowseLoading(true);
    const t = window.setTimeout(() => setBrowseLoading(false), 340);
    return () => window.clearTimeout(t);
  }, [role, hostMode, fCountry, fIndustry, appliedSearch]);

  const filteredTemplates = React.useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    return templates.filter((t) => {
      if (fCountry && !t.countries.includes(fCountry)) return false;
      if (fIndustry && !t.industries.includes(fIndustry)) return false;
      if (q) {
        const hay = [t.id, t.settings.currency ?? "", ...scopeNames(t.countries, COUNTRIES), ...scopeNames(t.industries, INDUSTRIES)].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [templates, fCountry, fIndustry, appliedSearch]);

  // ── role switch (the single decision that swaps whole experiences) ──
  const switchRole = (r: Role) => {
    if (r === role) return;
    setRole(r);
    if (r === "tenant") {
      loadEditor(tenantSettings, [], [], null);
    } else {
      setHostMode("browse");
      setDirty(false);
    }
  };

  // ── host browse actions ──
  const createNew = () => { setHostMode("edit"); loadEditor(makeDefaults(), [], [], null); };
  const editTemplate = (t: Template) => { setHostMode("edit"); loadEditor(t.settings, t.countries, t.industries, t.id); };
  const backToBrowse = () => { setHostMode("browse"); setEditId(null); setDirty(false); };
  const clearFilters = () => { setFCountry(""); setFIndustry(""); setSearchRaw(""); setAppliedSearch(""); };
  const confirmDeleteTemplate = () => {
    if (!confirmTemplate) return;
    const id = confirmTemplate.id;
    setTemplates((ts) => ts.filter((t) => t.id !== id));
    setConfirmTemplate(null);
    showToast("success", `Template ${id} deleted.`);
  };

  // ── save (role-branched) ──
  const canSave = dirty && !!draft.currency;
  const handleSave = React.useCallback(() => {
    if (saving) return;
    if (!draft.currency) { showToast("error", "Set a default currency before saving."); setActiveSection("general"); return; }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setDirty(false);
      snapshotRef.current = { ...draft };
      if (role === "host") {
        const id = editId ?? `TPL-${1000 + templates.length + 1}`;
        const record: Template = { id, countries: scopeCountries, industries: scopeIndustries, settings: { ...draft } };
        setTemplates((ts) => (editId ? ts.map((t) => (t.id === editId ? record : t)) : [record, ...ts]));
        setHostMode("browse");
        setEditId(null);
        showToast("success", `Template ${id} saved · ${scopeCountries.length || "any"} ${scopeCountries.length === 1 ? "country" : "countries"}, ${scopeIndustries.length || "any"} ${scopeIndustries.length === 1 ? "industry" : "industries"}.`);
      } else {
        setTenantSettings({ ...draft });
        showToast("success", "Global defaults saved · reference data refreshed.");
      }
    }, 900);
  }, [saving, draft, role, editId, templates.length, scopeCountries, scopeIndustries]);

  const handleDiscard = () => {
    setDraft({ ...snapshotRef.current });
    setDirty(false);
    setAutoFilled(new Set());
    accountingFilledRef.current = false;
    showToast("success", "Changes discarded.");
  };

  // Cmd/Ctrl+S in the editor
  React.useEffect(() => {
    if (!inEditor) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); handleSave(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [inEditor, handleSave]);

  const ctx: SectionCtx = {
    draft, patch, ledgerReloading, autoFilled, coaLocked,
    onDeleteWorkspace: () => setDeleteWsOpen(true),
  };

  const scopeNode = role === "host" && hostMode === "edit"
    ? <ScopeCard countries={scopeCountries} industries={scopeIndustries} onCountries={onScopeCountries} onIndustries={onScopeIndustries} />
    : undefined;

  const breadcrumb = role === "tenant"
    ? (<><span className="text-bz-text-muted">Settings</span><ChevronRight size={11} className="text-bz-text-soft" /><span className="font-semibold text-bz-text">Global Defaults</span></>)
    : (<>
        <span className="text-bz-text-muted">Platform</span>
        <ChevronRight size={11} className="text-bz-text-soft" />
        {hostMode === "edit" ? (
          <>
            <button onClick={backToBrowse} className="text-bz-text-muted hover:text-bz-text">Default Templates</button>
            <ChevronRight size={11} className="text-bz-text-soft" />
            <span className="font-semibold text-bz-text">{editId ? "Edit" : "New"}</span>
          </>
        ) : (
          <span className="font-semibold text-bz-text">Default Templates</span>
        )}
      </>);

  return (
    <AppShell
      breadcrumb={breadcrumb}
      overlay={
        <>
          {inEditor && (
            <ActionFooter role={role} saving={saving} dirty={dirty} canSave={canSave} onDiscard={handleDiscard} onSave={handleSave} />
          )}
          <Toast toast={toast} onDismiss={() => setToast(null)} />
          <ConfirmDeleteTemplate template={confirmTemplate} onCancel={() => setConfirmTemplate(null)} onConfirm={confirmDeleteTemplate} />
          <DeleteWorkspaceDialog
            open={deleteWsOpen}
            onClose={() => setDeleteWsOpen(false)}
            onConfirmed={() => { setDeleteWsOpen(false); showToast("success", `${WORKSPACE_NAME} scheduled for deletion · recoverable for 30 days. Signing out…`); }}
          />
        </>
      }
    >
      <PageHeader
        role={role}
        hostMode={hostMode}
        editId={editId}
        count={filteredTemplates.length}
        onRole={switchRole}
        onBack={backToBrowse}
        onCreate={createNew}
      />

      {role === "host" && hostMode === "browse" ? (
        <BrowseView
          templates={templates}
          filtered={filteredTemplates}
          loading={browseLoading}
          fCountry={fCountry}
          fIndustry={fIndustry}
          searchRaw={searchRaw}
          onCountry={setFCountry}
          onIndustry={setFIndustry}
          onSearchRaw={setSearchRaw}
          onSubmitSearch={() => setAppliedSearch(searchRaw)}
          onClearFilters={clearFilters}
          onCreate={createNew}
          onEdit={editTemplate}
          onDelete={(t) => setConfirmTemplate(t)}
        />
      ) : (
        <EditorBody
          role={role}
          sectionKeys={sectionKeys}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          scopeNode={scopeNode}
          ctx={ctx}
          settings={draft}
          onSelectDanger={() => setActiveSection("danger")}
        />
      )}
    </AppShell>
  );
}

