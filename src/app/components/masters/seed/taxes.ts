import { createStore } from "../../sales/store";

// ════════════════════════════════════════════════════════════════════════════
// TAX CODES — tier 2, a sheet (spec §4.5 Tax; SMM §3)
//
// TAX → MAST_TAX_SETUP: NAME (the code), RATE %, DESCRIPTION, the two GL
// accounts posting requires — LIABILITY_ACCOUNT_ID (sales tax: an invoice
// refuses without it) and ASSETS_ACCOUNT_ID (purchase tax: a bill refuses
// without it) — the six flags, IS_INACTIVE, the subsidiaries map.
// EFFECTIVE_FROM / VALID_TILL are not carried: phantom (nothing reads them).
//
// 12 rows like dev, including its real quirks: "ZZ-CLAUDE-MULTIORG-OK" three
// times and "ZZ-CLAUDE-CREATEPROBE2" twice (no duplicate check today — the
// Duplicate codes figure), and codes with a missing account. VAT 13's
// accounts follow spec §9.2 (dev posts it to SSF/EPF payable — wrong ledgers
// nothing warns about).
// ════════════════════════════════════════════════════════════════════════════

export type TaxFlags = {
  /** REVERSE_CHARGE */
  reverseCharge: boolean;
  /** APPLIES_TO_SERVICE_ITEMS */
  appliesToServices: boolean;
  /** EXPORT */
  export: boolean;
  /** EXEMPT */
  exempt: boolean;
  /** IS_DEFAULT */
  isDefault: boolean;
  /** EXCLUDE_FROM_VAT_REPORTS */
  excludeFromVat: boolean;
};

export type Tax = {
  id: string;
  /** NAME — the code. */
  name: string;
  /** RATE (%) */
  rate: number;
  /** DESCRIPTION */
  description: string;
  /** LIABILITY_ACCOUNT_ID → ledger name (sales tax account). */
  sales: string | null;
  /** ASSETS_ACCOUNT_ID → ledger name (purchase tax account). */
  purchase: string | null;
  flags: TaxFlags;
  archived: boolean;
  /** TAX_MAP_ORGANISATION */
  orgs: string[];
  /** APPLY_TO_CHILD */
  applyToChild?: boolean;
  /** B-C3 over TAX_ID, by table label. */
  usage: { label: string; count: number }[];
};

/** The ledgers the two account pickers offer (liability side / asset side of the chart). */
export const TAX_LEDGERS: { id: string; name: string; side: "liability" | "asset" }[] = [
  { id: "VAT Payable", name: "VAT Payable", side: "liability" },
  { id: "TDS Payable", name: "TDS Payable", side: "liability" },
  { id: "Social Security Fund (SSF) Payable", name: "Social Security Fund (SSF) Payable", side: "liability" },
  { id: "Provident Fund Payable (EPF)", name: "Provident Fund Payable (EPF)", side: "liability" },
  { id: "VAT Receivable", name: "VAT Receivable", side: "asset" },
  { id: "Advance Tax", name: "Advance Tax", side: "asset" },
];

const NO_FLAGS: TaxFlags = { reverseCharge: false, appliesToServices: false, export: false, exempt: false, isDefault: false, excludeFromVat: false };
const T = (id: string, name: string, rate: number, sales: string | null, purchase: string | null, usage: Tax["usage"], extra: Partial<Tax> = {}): Tax => ({
  id,
  name,
  rate,
  description: "",
  sales,
  purchase,
  flags: NO_FLAGS,
  archived: false,
  orgs: ["186", "194"],
  usage,
  ...extra,
});

export const TAX_SEED: Tax[] = [
  T("t-vat13", "VAT 13", 13, "VAT Payable", "VAT Receivable", [{ label: "Invoices", count: 148 }, { label: "Bills", count: 51 }, { label: "Items", count: 13 }], {
    description: "Standard VAT",
    flags: { ...NO_FLAGS, isDefault: true, appliesToServices: true },
  }),
  T("t-exempt", "Exempt", 0, "VAT Payable", "VAT Receivable", [{ label: "Invoices", count: 6 }, { label: "Items", count: 3 }], { flags: { ...NO_FLAGS, exempt: true } }),
  T("t-zero", "Zero-rated", 0, "VAT Payable", "VAT Receivable", [{ label: "Invoices", count: 2 }], { description: "Exports", flags: { ...NO_FLAGS, export: true } }),
  T("t-multi-1", "ZZ-CLAUDE-MULTIORG-OK", 13, "VAT Payable", "VAT Receivable", [{ label: "Invoices", count: 2 }]),
  T("t-multi-2", "ZZ-CLAUDE-MULTIORG-OK", 13, "VAT Payable", null, [{ label: "Bills", count: 1 }]),
  T("t-multi-3", "ZZ-CLAUDE-MULTIORG-OK", 13, "VAT Payable", "VAT Receivable", []),
  T("t-probe-1", "ZZ-CLAUDE-CREATEPROBE2", 10, "VAT Payable", "VAT Receivable", []),
  T("t-probe-2", "ZZ-CLAUDE-CREATEPROBE2", 10, "VAT Payable", "VAT Receivable", []),
  T("t-rt", "ZZ-CLAUDE-RT-TAX", 13, null, "VAT Receivable", []),
  T("t-services", "Service VAT 13", 13, "Social Security Fund (SSF) Payable", "Provident Fund Payable (EPF)", [{ label: "Invoices", count: 4 }], {
    flags: { ...NO_FLAGS, appliesToServices: true },
  }),
  T("t-rc", "Reverse charge 13", 13, "VAT Payable", "VAT Receivable", [], { flags: { ...NO_FLAGS, reverseCharge: true } }),
  T("t-vat10", "VAT 10 (old)", 10, "VAT Payable", "VAT Receivable", [{ label: "Invoices", count: 37 }], { archived: true }),
];

export const taxStore = createStore<Tax[]>(TAX_SEED);
export const taxUsed = (t: Tax) => t.usage.reduce((s, u) => s + u.count, 0);
export const missingAccounts = (t: Tax) => !t.sales || !t.purchase;
/** Codes more than one live tax holds (case-insensitive, trimmed) — B-C8 refuses new ones. */
export const duplicateOf = (all: Tax[], t: Tax) => all.filter((o) => o.id !== t.id && !o.archived && o.name.trim().toLowerCase() === t.name.trim().toLowerCase());

let seq = 0;
export const newTaxId = () => `t-new-${++seq}`;
