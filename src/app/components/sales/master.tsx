// ════════════════════════════════════════════════════════════════════════════
// SALES MASTERS — the lookups every sales document draws from
//
// Mirrors what the app's pickers are bound to: subsidiaries (every document
// belongs to one, and every lookup is scoped to it), the currency master with
// an editable rate, price levels that re-price a line, the tenant's own custom
// fields, the payment-method master with fields that depend on its type, the
// deposit-to ledgers, TDS codes and the dimension lists.
// ════════════════════════════════════════════════════════════════════════════

export type Subsidiary = { id: string; name: string; pan: string; address: string; phone: string };
export const SUBSIDIARIES: Subsidiary[] = [
  { id: "NP-01", name: "Bizak Nepal Pvt. Ltd.", pan: "609812345", address: "Tripureshwor, Kathmandu", phone: "01-4102233" },
  { id: "NP-02", name: "Bizak Gandaki", pan: "609812346", address: "Lakeside, Pokhara", phone: "061-465510" },
];
export const subsidiaryById = (id: string) => SUBSIDIARIES.find((s) => s.id === id) ?? SUBSIDIARIES[0];

export const CURRENCIES = [
  { code: "NPR", name: "Nepalese Rupee", rate: 1 },
  { code: "USD", name: "US Dollar", rate: 133.42 },
  { code: "INR", name: "Indian Rupee", rate: 1.6 },
];

/** A price level re-prices the item rate; typing a rate clears the level. */
export const PRICE_LEVELS = [
  { id: "Standard", pct: 0 },
  { id: "Retail", pct: 5 },
  { id: "Wholesale", pct: -5 },
  { id: "Dealer", pct: -8 },
];
export const levelRate = (base: number, level: string | undefined) => {
  const p = PRICE_LEVELS.find((x) => x.id === level)?.pct ?? 0;
  return Math.round(base * (1 + p / 100) * 100) / 100;
};

export type FieldDef = { key: string; label: string; type: "text" | "select" | "date"; options?: string[]; required?: boolean };

/** The tenant's own fields (Custom Form). Header and line sets are separate. */
export const HEADER_FIELDS: FieldDef[] = [
  { key: "channel", label: "Sales channel", type: "select", options: ["Field sales", "Counter", "Online", "Distributor"], required: true },
  { key: "instructions", label: "Delivery instructions", type: "text" },
];
export const LINE_FIELDS: FieldDef[] = [
  { key: "batchRef", label: "Batch ref", type: "text" },
  { key: "rack", label: "Rack", type: "text" },
];

export type PayMethod = { id: string; name: string; kind: "cash" | "cheque" | "bank" | "wallet"; fields: FieldDef[] };
export const PAYMENT_METHODS: PayMethod[] = [
  { id: "CASH", name: "Cash", kind: "cash", fields: [] },
  {
    id: "CHQ",
    name: "Cheque",
    kind: "cheque",
    fields: [
      { key: "bank", label: "Drawee bank", type: "text", required: true },
      { key: "chequeNo", label: "Cheque no.", type: "text", required: true },
      { key: "chequeDate", label: "Cheque date", type: "date" },
    ],
  },
  { id: "BANK", name: "Bank transfer", kind: "bank", fields: [{ key: "reference", label: "Bank reference", type: "text" }] },
  { id: "FONEPAY", name: "Fonepay QR", kind: "wallet", fields: [{ key: "txn", label: "Transaction ID", type: "text", required: true }] },
];
export const methodById = (id: string) => PAYMENT_METHODS.find((m) => m.id === id) ?? PAYMENT_METHODS[0];

/** "Deposit to" — undeposited funds, or straight into a cash-equivalent ledger. */
export const DEPOSIT_LEDGERS = ["Undeposited funds", "Cash in hand · Kathmandu", "Nabil Bank · 0145-xx-221", "Himalayan Bank · 0192-xx-887", "NIC Asia · 3310-xx-015"];

export const TDS_CODES = [
  { id: "TDS-SVC", name: "Service fee 1.5%", rate: 0.015 },
  { id: "TDS-CON", name: "Contract 1.5%", rate: 0.015 },
  { id: "TDS-RENT", name: "Rent 10%", rate: 0.1 },
];
export const tdsById = (id: string | null | undefined) => TDS_CODES.find((t) => t.id === id);

export const DIMENSIONS: { key: "department" | "class" | "project" | "partner"; label: string; options: string[] }[] = [
  { key: "department", label: "Department", options: ["Enterprise sales", "Industrial", "Retail", "Export"] },
  { key: "class", label: "Class", options: ["Capital goods", "Consumables", "Services"] },
  { key: "project", label: "Project", options: ["NTC Branch Wi-Fi", "Everest Retail — ERP Rollout", "Pokhara Warehouse Fit-out"] },
  { key: "partner", label: "Partner", options: ["Himal Logistics", "Sagarmatha Distributors"] },
];

export const BILL_DISCOUNT_BASES = ["On gross", "On net"] as const;

// ── Bikram Sambat ───────────────────────────────────────────────────────────
// Month lengths for the years the seed spans. Calibrated against the live app
// (Aug 23, 2026 → BS 2083/05/07; Aug 13, 2026 → 2083/04/28).

const BS_YEARS: { year: number; start: string; months: number[] }[] = [
  { year: 2082, start: "2025-04-14", months: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30] },
  { year: 2083, start: "2026-04-14", months: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30] },
  { year: 2084, start: "2027-04-14", months: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30] },
];
const BS_MONTH = ["Baishakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Asoj", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];

function bsParts(iso: string) {
  const t = Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  const y = [...BS_YEARS].reverse().find((b) => Date.UTC(+b.start.slice(0, 4), +b.start.slice(5, 7) - 1, +b.start.slice(8, 10)) <= t);
  if (!y) return null;
  let days = Math.round((t - Date.UTC(+y.start.slice(0, 4), +y.start.slice(5, 7) - 1, +y.start.slice(8, 10))) / 86_400_000);
  let m = 0;
  while (m < 11 && days >= y.months[m]) days -= y.months[m++];
  return { year: y.year, month: m + 1, day: days + 1 };
}

/** "2083/05/19" — the form the app prints under an AD date. */
export function bsDate(iso: string | null | undefined) {
  if (!iso) return "";
  const p = bsParts(iso);
  return p ? `${p.year}/${String(p.month).padStart(2, "0")}/${String(p.day).padStart(2, "0")}` : "";
}
/** "19 Bhadra 2083" — for print. */
export function bsLong(iso: string | null | undefined) {
  if (!iso) return "";
  const p = bsParts(iso);
  return p ? `${p.day} ${BS_MONTH[p.month - 1]} ${p.year}` : "";
}

// ── Workflow ────────────────────────────────────────────────────────────────
// A tenant's workflow defines its own actions per state (Workflow Setup). The
// design draws whatever the state offers — never a fixed Approve / Reject.

export type WorkflowAction = { label: string; kind: "approve" | "reject" | "move"; to?: string; hint?: string };
export const WORKFLOW_ACTIONS: Record<string, WorkflowAction[]> = {
  "Manager review": [
    { label: "Approve", kind: "approve" },
    { label: "Send back", kind: "reject", hint: "Returns it to the rep with your reason" },
    { label: "Escalate to Finance", kind: "move", to: "Finance check", hint: "Moves it to Finance check" },
  ],
  "Finance check": [
    { label: "Clear", kind: "approve" },
    { label: "Hold", kind: "reject", hint: "Holds it with your reason" },
  ],
  "Dispatch approval": [
    { label: "Release", kind: "approve" },
    { label: "Reject", kind: "reject" },
  ],
  "Pending approval": [
    { label: "Approve", kind: "approve" },
    { label: "Reject", kind: "reject" },
  ],
};
export const actionsFor = (stateName: string | undefined) => WORKFLOW_ACTIONS[stateName ?? ""] ?? WORKFLOW_ACTIONS["Pending approval"];

/** Numbers in words — the print footer. Nepali grouping (lakh, crore). */
export function amountInWords(n: number, currency = "NPR") {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x: number) => (x < 20 ? ones[x] : `${tens[Math.floor(x / 10)]}${x % 10 ? ` ${ones[x % 10]}` : ""}`);
  const three = (x: number) => `${x >= 100 ? `${ones[Math.floor(x / 100)]} Hundred${x % 100 ? " " : ""}` : ""}${x % 100 ? two(x % 100) : ""}`;
  const words = (x: number): string => {
    if (x === 0) return "Zero";
    const parts: string[] = [];
    const crore = Math.floor(x / 10_000_000);
    const lakh = Math.floor((x % 10_000_000) / 100_000);
    const thousand = Math.floor((x % 100_000) / 1000);
    const rest = x % 1000;
    if (crore) parts.push(`${words(crore)} Crore`);
    if (lakh) parts.push(`${two(lakh)} Lakh`);
    if (thousand) parts.push(`${two(thousand)} Thousand`);
    if (rest) parts.push(three(rest));
    return parts.join(" ");
  };
  const whole = Math.floor(n);
  const paisa = Math.round((n - whole) * 100);
  const unit = currency === "NPR" ? ["Rupees", "Paisa"] : [currency, "Cents"];
  return `${unit[0]} ${words(whole)}${paisa ? ` and ${two(paisa)} ${unit[1]}` : ""} only`;
}
