import * as React from "react";
import { createPortal } from "react-dom";
import {
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Check,
  Loader2,
  Info,
  ShieldCheck,
  ShieldOff,
  Building2,
  UserRound,
  Globe2,
  Network,
  RefreshCw,
  TriangleAlert,
  SearchX,
  UserSearch,
  ListChecks,
  Layers,
  Ban,
  RotateCcw,
  MoreHorizontal,
  Wand2,
  Zap,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// DATA SCOPE MATRIX  ·  row-level visibility administration
//
// PRIMARY ACTION = author a scope level for one (target, document-type)
// pairing — done hundreds of times — and then be able to TRUST it.
//
// The page's whole problem is that its output is INVISIBLE: a rule that does
// nothing looks exactly like a rule that works. So the hierarchy is:
//
//   1. TRUST BAND      the three things that decide whether ANY rule below
//                      means anything — is the engine armed · is the
//                      supervisor tree healthy · do the live rules have
//                      integrity problems. Read first, because each one can
//                      invalidate everything under it.
//   2. POPULATION RAIL the target coordinate. Four precedence tiers, the
//                      precedence statement for the selected one, then the
//                      targets in it — each annotated with live rules AND
//                      unsaved edits, so the single cross-tier edit buffer is
//                      finally visible instead of hidden.
//   3. ASSIGNMENT      the document-type coordinate, for ONE target at a time.
//                      127 × N is not a readable matrix; one target at a time
//                      keeps every pairing a single legible decision.
//   4. DOCKED FOOTER   the one commit, the unsaved readout, the context readout.
//   5. VERIFY DRAWER   the only truth-telling capability — deliberately OUTSIDE
//                      the assignment card so it stays live while that loads.
//
// Integrity this adds over the surface it replaces: arming, both bulk
// assignments and the individual-tier cascade are confirmed; the named-list
// editor refuses to save until the stored list has reconciled; a resolution
// entry that fails says so instead of pending forever; every silent load
// failure gets a voice.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";
const CARD = "rounded-bz-lg border border-bz-line-soft bg-bz-surface";

// ════════════════════════════════════════════════════════════════════════════
// DOMAIN · scope levels (six answers to "how much?", ranked by permissiveness)
// ════════════════════════════════════════════════════════════════════════════

type Level = "own" | "picked" | "subordinates" | "dept" | "org" | "all";

type LevelMeta = {
  key: Level;
  rank: number;
  short: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};

const LEVELS: LevelMeta[] = [
  { key: "own",          rank: 1, short: "Own records",    label: "Own records only",            desc: "Only rows this viewer owns. The narrowest answer.",                                                   Icon: UserRound },
  { key: "picked",       rank: 2, short: "Named people",   label: "A hand-picked set of people", desc: "Only rows owned by people named on this exact pairing. Naming them is a separate, second step.",     Icon: ListChecks },
  { key: "subordinates", rank: 3, short: "Self + reports", label: "Self and everyone beneath",   desc: "Their own rows plus everyone below them in the supervisor tree.",                                      Icon: Network },
  { key: "dept",         rank: 4, short: "Department",     label: "Own department and below",    desc: "Their department and every department beneath it.",                                                    Icon: Building2 },
  { key: "org",          rank: 5, short: "Organisation",   label: "Entire organisation",         desc: "Everything in the organisation. The default — a pairing sitting here is not a live rule.",            Icon: Globe2 },
  { key: "all",          rank: 6, short: "Whole tenant",   label: "Everything in the tenant",    desc: "Every organisation in the tenant. Wider than the default, and still a live rule.",                     Icon: Layers },
];

const LEVEL_BY = Object.fromEntries(LEVELS.map((l) => [l.key, l])) as Record<Level, LevelMeta>;
const DEFAULT_LEVEL: Level = "org";

/** Three-valued nothing — unset, explicitly default, or a live rule. Never collapse. */
type Valuation = "unset" | "default" | "rule";
const valuationOf = (v: Level | undefined): Valuation =>
  v === undefined ? "unset" : v === DEFAULT_LEVEL ? "default" : "rule";

// ════════════════════════════════════════════════════════════════════════════
// DOMAIN · precedence tiers
// ════════════════════════════════════════════════════════════════════════════

type Tier = "tenant" | "role" | "department" | "individual";

const TIER_META: Record<
  Tier,
  {
    label: string;
    unit: string;
    Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    precedence: string;
    gist: string;
    explain: string;
  }
> = {
  tenant: {
    label: "Every user",
    unit: "fallback",
    Icon: Globe2,
    precedence: "Lowest precedence",
    gist: "anything more specific overrides it",
    explain:
      "Applies only when nothing more specific matches the viewer. Any role, department or individual rule on the same document type overrides it outright.",
  },
  role: {
    label: "Roles",
    unit: "role",
    Icon: ShieldCheck,
    precedence: "Third precedence",
    gist: "additive — the widest role wins",
    explain:
      "Roles are additive: when a viewer holds several roles that each carry a rule, the WIDEST of them wins — holding an extra role can never cost someone visibility. Any department or individual rule overrides all of them.",
  },
  department: {
    label: "Departments",
    unit: "department",
    Icon: Building2,
    precedence: "Second precedence",
    gist: "the nearest department wins",
    explain:
      "The NEAREST department in the viewer's ancestry wins — a rule on a child department overrides its parent's however wide the parent's is. Only an individual rule beats a department rule.",
  },
  individual: {
    label: "Named individuals",
    unit: "person",
    Icon: UserRound,
    precedence: "Highest precedence",
    gist: "overrides everything above it",
    explain:
      "A rule naming a person overrides every department, role and tenant-wide rule on that document type — even when it is far narrower than the policy above it, and even when nobody remembers writing it.",
  },
};

const TIER_ORDER: Tier[] = ["tenant", "role", "department", "individual"];

// ════════════════════════════════════════════════════════════════════════════
// DATA · targets  (departments carry a parent, so ancestry is real)
// ════════════════════════════════════════════════════════════════════════════

type Dept = { id: string; name: string; parent: string | null };

const DEPARTMENTS: Dept[] = [
  { id: "d1", name: "Executive Office",     parent: null },
  { id: "d2", name: "Finance",              parent: "d1" },
  { id: "d3", name: "Accounts Payable",     parent: "d2" },
  { id: "d4", name: "Accounts Receivable",  parent: "d2" },
  { id: "d5", name: "Sales & Distribution", parent: "d1" },
  { id: "d6", name: "Kathmandu Branch",     parent: "d5" },
  { id: "d7", name: "Pokhara Branch",       parent: "d5" },
  { id: "d8", name: "Supply Chain",         parent: "d1" },
  { id: "d9", name: "People & Culture",     parent: "d1" },
];

const ROLES = [
  { id: "ro1", name: "Tenant Administrator" },
  { id: "ro2", name: "Finance Controller" },
  { id: "ro3", name: "Accounts Officer" },
  { id: "ro4", name: "Sales Manager" },
  { id: "ro5", name: "Sales Representative" },
  { id: "ro6", name: "Store Keeper" },
  { id: "ro7", name: "HR Officer" },
  { id: "ro8", name: "Auditor" },
  { id: "ro9", name: "Branch Operations Manager" },
];

type User = { id: string; name: string; dept: string; roles: string[] };

const USERS: User[] = [
  { id: "u1",  name: "Anjali Shrestha", dept: "d2", roles: ["ro2"] },
  { id: "u2",  name: "Bikash Thapa",    dept: "d3", roles: ["ro3"] },
  { id: "u3",  name: "Sunita Gurung",   dept: "d4", roles: ["ro3"] },
  { id: "u4",  name: "Rajesh Maharjan", dept: "d5", roles: ["ro4"] },
  { id: "u5",  name: "Pratima Rai",     dept: "d6", roles: ["ro5"] },
  { id: "u6",  name: "Nabin Karki",     dept: "d7", roles: ["ro5"] },
  { id: "u7",  name: "Sabina Tamang",   dept: "d8", roles: ["ro6"] },
  { id: "u8",  name: "Deepak Adhikari", dept: "d9", roles: ["ro7"] },
  { id: "u9",  name: "Manisha Basnet",  dept: "d1", roles: ["ro8"] },
  { id: "u10", name: "Suresh Poudel",   dept: "d6", roles: ["ro9", "ro5"] },
  { id: "u11", name: "Kiran Lama",      dept: "d3", roles: ["ro3", "ro8"] },
  { id: "u12", name: "Rekha Bhattarai", dept: "d6", roles: ["ro5"] },
  { id: "u13", name: "Prakash Joshi",   dept: "d1", roles: ["ro1"] },
  { id: "u14", name: "Nisha Dahal",     dept: "d9", roles: ["ro7"] },
];

const DEPT_BY = new Map(DEPARTMENTS.map((d) => [d.id, d]));
const ROLE_BY = new Map(ROLES.map((r) => [r.id, r]));
const USER_BY = new Map(USERS.map((u) => [u.id, u]));

/** Nearest-first walk up the department ancestry. */
function deptAncestry(deptId: string): string[] {
  const out: string[] = [];
  let cur: string | null = deptId;
  while (cur) {
    out.push(cur);
    cur = DEPT_BY.get(cur)?.parent ?? null;
  }
  return out;
}
const deptDepth = (id: string) => deptAncestry(id).length - 1;

const TENANT_TARGET_ID = "__everyone__";

type Target = { id: string; name: string; sub?: string; depth?: number };

function targetsFor(tier: Tier): Target[] {
  if (tier === "tenant") return [{ id: TENANT_TARGET_ID, name: "Every user", sub: "Tenant-wide fallback" }];
  if (tier === "role") return ROLES.map((r) => ({ id: r.id, name: r.name }));
  if (tier === "department")
    return DEPARTMENTS.map((d) => ({
      id: d.id,
      name: d.name,
      sub: d.parent ? `under ${DEPT_BY.get(d.parent)?.name ?? ""}` : "root department",
      depth: deptDepth(d.id),
    }));
  return USERS.map((u) => ({
    id: u.id,
    name: u.name,
    sub: `${DEPT_BY.get(u.dept)?.name ?? ""} · ${u.roles.map((r) => ROLE_BY.get(r)?.name).join(", ")}`,
  }));
}

// ════════════════════════════════════════════════════════════════════════════
// DATA · the document-type catalogue
//
// `enforced: false` means the engine stores a rule here faithfully and NOTHING
// applies it. About half the catalogue is in that state. It is the single most
// dangerous fact on the page, so it is never hidden and never inferred.
// ════════════════════════════════════════════════════════════════════════════

type DocType = { id: string; label: string; enforced: boolean };

const E = true;
const N = false;
const doc = (id: string, label: string, enforced: boolean): DocType => ({ id, label, enforced });

const CATALOGUE: DocType[] = [
  // Sales & CRM
  doc("quotation", "Quotation", E),
  doc("sales_order", "Sales Order", E),
  doc("sales_invoice", "Sales Invoice", E),
  doc("sales_return", "Sales Return", E),
  doc("credit_note", "Credit Note", N),
  doc("delivery_note", "Delivery Note", E),
  doc("proforma_invoice", "Proforma Invoice", N),
  doc("customer", "Customer", E),
  doc("customer_group", "Customer Group", N),
  doc("price_list", "Price List", N),
  doc("discount_scheme", "Discount Scheme", N),
  doc("sales_person", "Sales Person", E),
  doc("sales_target", "Sales Target", E),
  doc("commission_plan", "Commission Plan", N),
  doc("route_plan", "Route Plan", E),
  doc("customer_visit", "Customer Visit", E),
  doc("lead", "Lead", E),
  doc("opportunity", "Opportunity", E),
  // Purchasing
  doc("purchase_requisition", "Purchase Requisition", E),
  doc("rfq", "Request for Quotation", N),
  doc("supplier_quotation", "Supplier Quotation", N),
  doc("purchase_order", "Purchase Order", E),
  doc("purchase_bill", "Purchase Bill", E),
  doc("purchase_return", "Purchase Return", E),
  doc("debit_note", "Debit Note", N),
  doc("goods_receipt", "Goods Receipt Note", E),
  doc("supplier", "Supplier", E),
  doc("supplier_group", "Supplier Group", N),
  doc("landed_cost", "Landed Cost Voucher", N),
  // Inventory
  doc("item", "Item", E),
  doc("item_group", "Item Group", N),
  doc("item_variant", "Item Variant", N),
  doc("batch", "Batch", N),
  doc("serial_number", "Serial Number", N),
  doc("warehouse", "Warehouse", E),
  doc("stock_transfer", "Stock Transfer", E),
  doc("stock_adjustment", "Stock Adjustment", E),
  doc("stock_reconciliation", "Stock Reconciliation", E),
  doc("opening_stock", "Opening Stock", N),
  doc("reorder_rule", "Reorder Rule", N),
  doc("stock_ledger", "Stock Ledger Entry", N),
  doc("packing_slip", "Packing Slip", E),
  // Manufacturing
  doc("bom", "Bill of Materials", N),
  doc("routing", "Routing", N),
  doc("work_order", "Work Order", E),
  doc("job_card", "Job Card", E),
  doc("production_plan", "Production Plan", E),
  doc("material_request", "Material Request", E),
  doc("scrap_entry", "Scrap Entry", N),
  doc("work_centre", "Work Centre", N),
  doc("quality_inspection", "Quality Inspection", E),
  // Finance
  doc("journal_entry", "Journal Entry", E),
  doc("payment_entry", "Payment Entry", E),
  doc("receipt_voucher", "Receipt Voucher", E),
  doc("payment_voucher", "Payment Voucher", E),
  doc("contra_entry", "Contra Entry", N),
  doc("bank_account", "Bank Account", E),
  doc("bank_statement", "Bank Statement", E),
  doc("bank_reconciliation", "Bank Reconciliation", E),
  doc("chart_of_accounts", "Chart of Accounts", N),
  doc("cost_centre", "Cost Centre", N),
  doc("budget", "Budget", E),
  doc("fiscal_year", "Fiscal Year", N),
  doc("accounting_period", "Accounting Period", N),
  doc("exchange_rate", "Exchange Rate", N),
  doc("tax_template", "Tax Template", N),
  doc("tds_deduction", "TDS Deduction", E),
  doc("vat_return", "VAT Return", E),
  doc("fixed_asset", "Fixed Asset", E),
  doc("asset_depreciation", "Asset Depreciation", N),
  doc("asset_disposal", "Asset Disposal", E),
  doc("loan", "Loan", E),
  doc("loan_repayment", "Loan Repayment", E),
  doc("advance_payment", "Advance Payment", E),
  doc("cheque_register", "Cheque Register", N),
  doc("petty_cash", "Petty Cash Voucher", E),
  doc("expense_claim", "Expense Claim", E),
  doc("vendor_payment_run", "Vendor Payment Run", N),
  // HR
  doc("employee", "Employee", E),
  doc("employee_onboarding", "Employee Onboarding", E),
  doc("employee_separation", "Employee Separation", E),
  doc("department", "Department", N),
  doc("designation", "Designation", N),
  doc("attendance", "Attendance", E),
  doc("leave_application", "Leave Application", E),
  doc("leave_type", "Leave Type", N),
  doc("leave_balance", "Leave Balance", E),
  doc("holiday_list", "Holiday List", N),
  doc("shift_assignment", "Shift Assignment", E),
  doc("overtime_request", "Overtime Request", E),
  doc("payroll_run", "Payroll Run", E),
  doc("salary_structure", "Salary Structure", E),
  doc("salary_slip", "Salary Slip", E),
  doc("staff_advance", "Staff Advance", E),
  doc("provident_fund", "Provident Fund", N),
  doc("gratuity", "Gratuity", N),
  doc("appraisal", "Appraisal", E),
  doc("training_record", "Training Record", N),
  doc("grievance", "Grievance", E),
  // Projects & time
  doc("project", "Project", E),
  doc("project_task", "Project Task", E),
  doc("timesheet", "Timesheet", E),
  doc("time_entry", "Time Entry", E),
  doc("milestone", "Milestone", N),
  doc("project_budget", "Project Budget", N),
  doc("billable_summary", "Billable Summary", N),
  // Support
  doc("support_ticket", "Support Ticket", E),
  doc("ticket_comment", "Ticket Comment", N),
  // Point of sale
  doc("pos_terminal", "POS Terminal", N),
  doc("pos_session", "POS Session", E),
  doc("pos_sale", "POS Sale", E),
  doc("pos_refund", "POS Refund", E),
  doc("cash_drawer_count", "Cash Drawer Count", E),
  // Subscriptions
  doc("subscription_plan", "Subscription Plan", N),
  doc("party_subscription", "Party Subscription", E),
  doc("subscription_invoice", "Subscription Invoice", E),
  // Administration
  doc("user", "User", E),
  doc("role", "Role", N),
  doc("custom_form", "Custom Form", N),
  doc("custom_field", "Custom Field", N),
  doc("dashboard_board", "Dashboard Board", E),
  doc("report_definition", "Report Definition", N),
  doc("audit_log", "Audit Log Entry", E),
  doc("workflow_definition", "Workflow Definition", N),
  doc("number_series", "Number Series", N),
  doc("notification_rule", "Notification Rule", N),
  doc("cabinet_document", "File Cabinet Document", E),
];

const DOC_BY = new Map(CATALOGUE.map((d) => [d.id, d]));
const TOTAL_DOCS = CATALOGUE.length;

// ════════════════════════════════════════════════════════════════════════════
// DATA · the stored rule set  (what the server holds — never the buffer)
// ════════════════════════════════════════════════════════════════════════════

const pk = (tier: Tier, targetId: string, docId: string) => `${tier}|${targetId}|${docId}`;
const unpk = (key: string) => {
  const [tier, targetId, docId] = key.split("|");
  return { tier: tier as Tier, targetId, docId };
};

function buildStoredRules(): Map<string, Level> {
  const m = new Map<string, Level>();
  const set = (tier: Tier, t: string, d: string, l: Level) => m.set(pk(tier, t, d), l);

  // tenant-wide fallback
  set("tenant", TENANT_TARGET_ID, "sales_order", "dept");
  set("tenant", TENANT_TARGET_ID, "sales_invoice", "dept");
  set("tenant", TENANT_TARGET_ID, "employee", "own");
  set("tenant", TENANT_TARGET_ID, "salary_slip", "own");
  set("tenant", TENANT_TARGET_ID, "leave_application", "subordinates");
  set("tenant", TENANT_TARGET_ID, "expense_claim", "subordinates");
  set("tenant", TENANT_TARGET_ID, "support_ticket", "org"); // explicit default, not a live rule
  set("tenant", TENANT_TARGET_ID, "credit_note", "dept");   // a rule on an UNENFORCED type

  // roles
  set("role", "ro5", "sales_order", "own");
  set("role", "ro5", "quotation", "own");
  set("role", "ro5", "customer", "own");
  set("role", "ro5", "sales_invoice", "own");
  set("role", "ro5", "customer_visit", "own");
  set("role", "ro4", "sales_order", "subordinates");
  set("role", "ro4", "customer", "dept");
  set("role", "ro4", "sales_target", "subordinates");
  set("role", "ro3", "purchase_bill", "dept");
  set("role", "ro3", "journal_entry", "own");
  set("role", "ro7", "employee", "dept");
  set("role", "ro7", "salary_slip", "picked"); // committed, list is EMPTY → blackout
  set("role", "ro7", "payroll_run", "dept");
  set("role", "ro8", "journal_entry", "all");
  set("role", "ro8", "payment_entry", "all");
  set("role", "ro8", "audit_log", "all");
  set("role", "ro6", "stock_transfer", "dept");
  set("role", "ro9", "sales_order", "dept");
  set("role", "ro2", "budget", "org"); // explicit default

  // departments
  set("department", "d6", "sales_order", "dept");
  set("department", "d6", "stock_transfer", "dept");
  set("department", "d6", "delivery_note", "dept");
  set("department", "d2", "journal_entry", "dept");
  set("department", "d2", "payment_entry", "dept");
  set("department", "d2", "bank_statement", "picked"); // committed, list has 3 people
  set("department", "d9", "employee", "org"); // explicit default
  set("department", "d9", "salary_slip", "dept");
  set("department", "d3", "purchase_bill", "own");

  // named individuals
  set("individual", "u9", "sales_order", "all");
  set("individual", "u9", "journal_entry", "all");
  set("individual", "u9", "employee", "own");
  set("individual", "u10", "sales_order", "subordinates");
  set("individual", "u10", "customer", "dept");
  set("individual", "u2", "purchase_bill", "own");

  return m;
}

/** Named lists live under a COMMITTED pairing — the key is the pairing, not the target. */
function buildStoredLists(): Map<string, string[]> {
  return new Map<string, string[]>([
    [pk("role", "ro7", "salary_slip"), []], // committed with nobody named → total blackout
    [pk("department", "d2", "bank_statement"), ["u1", "u2", "u11"]],
  ]);
}

// ════════════════════════════════════════════════════════════════════════════
// DOMAIN · the resolver  (the same ladder the engine walks, run client-side so
// the Verify drawer reconciles with the rules shown on the page)
// ════════════════════════════════════════════════════════════════════════════

type DecidedBy = "individual" | "department" | "role" | "tenant" | "default";

const DECIDED_LABEL: Record<DecidedBy, string> = {
  individual: "Named individual",
  department: "Department",
  role: "Role",
  tenant: "Every user",
  default: "Nothing matched",
};

type Resolved = { level: Level; by: DecidedBy; via: string | null; seatCapped: boolean };

function resolveFor(user: User, docId: string, stored: Map<string, Level>): Resolved {
  const ind = stored.get(pk("individual", user.id, docId));
  if (ind !== undefined) return { level: ind, by: "individual", via: user.name, seatCapped: false };

  for (const d of deptAncestry(user.dept)) {
    const v = stored.get(pk("department", d, docId));
    if (v !== undefined) return { level: v, by: "department", via: DEPT_BY.get(d)?.name ?? d, seatCapped: false };
  }

  let widest: { level: Level; via: string } | null = null;
  for (const r of user.roles) {
    const v = stored.get(pk("role", r, docId));
    if (v === undefined) continue;
    if (!widest || LEVEL_BY[v].rank > LEVEL_BY[widest.level].rank) {
      widest = { level: v, via: ROLE_BY.get(r)?.name ?? r };
    }
  }
  if (widest) return { level: widest.level, by: "role", via: widest.via, seatCapped: false };

  const ten = stored.get(pk("tenant", TENANT_TARGET_ID, docId));
  if (ten !== undefined) return { level: ten, by: "tenant", via: null, seatCapped: false };

  // The seat-class ceiling is live plumbing but currently open for every class,
  // so this flag is always false today. The state exists; the data does not.
  return { level: DEFAULT_LEVEL, by: "default", via: null, seatCapped: false };
}

// ════════════════════════════════════════════════════════════════════════════
// DOMAIN · supervisor-tree health  (a first-class STATE, not just an action)
// ════════════════════════════════════════════════════════════════════════════

type TreeStatus = "empty" | "stale" | "healthy";

type TreeHealth = {
  status: TreeStatus;
  rows: number;
  links: number;
  noLogin: number;
  brokenChains: number;
  checkedAt: string;
  diagnosis: string;
};

const TREE_SEED: TreeHealth = {
  status: "empty",
  rows: 0,
  links: 131,
  noLogin: 9,
  brokenChains: 3,
  checkedAt: "today, 09:14",
  diagnosis:
    "The derived tree holds ZERO rows. Every rule set to “Self and everyone beneath” currently resolves to nothing at all — those viewers see an empty list, not their own records. 131 supervisor links exist on employee records but none have been flattened.",
};

const TREE_AFTER_REBUILD: TreeHealth = {
  status: "healthy",
  rows: 142,
  links: 131,
  noLogin: 9,
  brokenChains: 0,
  checkedAt: "just now",
  diagnosis:
    "142 ancestry rows written from 131 supervisor links. No broken chains. 9 employees have no login account and can never be a viewer, which is expected. “Self and everyone beneath” is usable.",
};

const TREE_LABEL: Record<TreeStatus, string> = { empty: "Unusable", stale: "Stale", healthy: "Healthy" };

// ════════════════════════════════════════════════════════════════════════════
// DOMAIN · per-pairing integrity issues
//
// A live rule can be a lie in four different ways. Each one is named, counted,
// and filterable — because "looks configured" is the failure this page exists
// to prevent.
// ════════════════════════════════════════════════════════════════════════════

type IssueKind = "unenforced" | "blackout" | "uncommitted" | "tree";

const ISSUE_META: Record<IssueKind, { label: string; short: string; tone: "danger" | "warn"; blurb: string }> = {
  unenforced: {
    label: "Stored but never applied",
    short: "Not enforced",
    tone: "warn",
    blurb:
      "This document type is not wired into the visibility engine. The rule will be saved exactly as written and read by nothing. It is not protection.",
  },
  blackout: {
    label: "Named list is empty",
    short: "Blackout",
    tone: "danger",
    blurb:
      "The pairing is committed on “A hand-picked set of people” with nobody named. That is a total blackout — these viewers see zero rows, not all rows.",
  },
  uncommitted: {
    label: "Nobody can be named yet",
    short: "Commit first",
    tone: "warn",
    blurb:
      "The list is stored as children of the rule record, and that record does not exist until this pairing is committed. Commit, then come back and name the people.",
  },
  tree: {
    label: "Supervisor tree is unusable",
    short: "Tree unusable",
    tone: "danger",
    blurb:
      "“Self and everyone beneath” reads the derived supervisor tree. That tree is currently empty, so this rule resolves to nothing at all. Rebuild it first.",
  },
};

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

function Switch({
  value,
  onChange,
  size = "sm",
  ariaLabel,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const dims = size === "md" ? "h-5 w-9" : "h-[18px] w-8";
  const knob = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-bz-pill border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        dims,
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          knob,
          value ? (size === "md" ? "translate-x-[18px]" : "translate-x-[14px]") : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <span className={cn("font-semibold text-bz-text", NUM)}>{n.toLocaleString("en-US")}</span>;
}

function GhostButton({
  children,
  onClick,
  disabled,
  className,
  title,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
  autoFocus,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex h-8 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-2.5", className)}>
      <Search size={12} className="shrink-0 text-bz-text-muted" />
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
      />
      {value && (
        <button onClick={() => onChange("")} aria-label="Clear" className="flex size-4 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface">
          <X size={10} />
        </button>
      )}
    </div>
  );
}

/** Small info affordance — an explanation available on demand, never a tooltip-only fact. */
function InfoDot({ text, tone = "muted" }: { text: string; tone?: "muted" | "warn" | "danger" }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label="Explain"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-bz-pill transition-colors",
          tone === "danger" ? "text-[#9A2E29] hover:bg-[#F6D3CE]" : tone === "warn" ? "text-bz-leaf-deep hover:bg-bz-leaf/50" : "text-bz-text-soft hover:bg-bz-paper-warm",
        )}
      >
        <Info size={11} />
      </button>
      <Anchored open={open} anchorRef={ref} onClose={() => setOpen(false)} width={296}>
        <p className="px-3 py-2.5 text-[11.5px] leading-[1.55] text-bz-text-muted">{text}</p>
      </Anchored>
    </>
  );
}

/** Portal-anchored floating panel: outside-click, Esc and scroll all close it. */
function Anchored({
  open,
  anchorRef,
  onClose,
  width,
  align = "start",
  children,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  width?: number;
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; w: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    const r = anchorRef.current.getBoundingClientRect();
    const w = width ?? Math.max(r.width, 240);
    const left = align === "end" ? r.right - w : r.left;
    setPos({
      top: Math.min(r.bottom + 6, window.innerHeight - 24),
      left: Math.max(8, Math.min(left, window.innerWidth - w - 8)),
      w,
    });
  }, [open, anchorRef, width, align]);

  React.useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    // Close when the PAGE scrolls out from under the anchor — but never when the
    // scroll came from inside the panel's own list.
    const scroll = (e: Event) => {
      const t = e.target as Node | null;
      if (t && ref.current && (ref.current === t || ref.current.contains(t))) return;
      onClose();
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scroll, true);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;
  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.w }}
      className="z-[70] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.26)]"
    >
      {children}
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCOPE CONTROL  ·  the three-valued per-pairing assignment
// ════════════════════════════════════════════════════════════════════════════

function ScopeButton({
  value,
  edited,
  onPick,
  onClear,
  disabled,
  compact,
}: {
  value: Level | undefined;
  edited: boolean;
  onPick: (l: Level) => void;
  onClear: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLButtonElement>(null);
  const val = valuationOf(value);
  const meta = value ? LEVEL_BY[value] : null;
  const Icon = meta?.Icon;

  return (
    <>
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex h-8 min-w-0 items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          compact ? "w-full" : "flex-1 sm:w-[212px] sm:flex-none",
          val === "unset" && "border-dashed border-bz-line bg-bz-surface text-bz-text-soft hover:border-bz-text-soft",
          val === "default" && "border-bz-line-soft bg-bz-paper-warm text-bz-text-muted hover:border-bz-line",
          val === "rule" && "border-bz-fire bg-bz-fire/[0.18] text-bz-text hover:bg-bz-fire/[0.26]",
        )}
      >
        {val === "unset" ? (
          <span className="size-3 shrink-0 rounded-bz-pill border border-dashed border-bz-text-soft" />
        ) : Icon ? (
          <Icon size={12} className="shrink-0" />
        ) : null}
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
          {val === "unset" ? "Not set" : meta?.short}
        </span>
        {val === "default" && <span className={cn("shrink-0 rounded-bz-sm bg-bz-surface px-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft")}>default</span>}
        {edited && <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire ring-2 ring-bz-surface" title="Unsaved edit" />}
        <ChevronDown size={11} className="shrink-0 opacity-50" />
      </button>

      <Anchored open={open} anchorRef={ref} onClose={() => setOpen(false)} width={318}>
        <div className="max-h-[380px] overflow-y-auto py-1">
          <button
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            className="flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm"
          >
            <span className="mt-[3px] size-3 shrink-0 rounded-bz-pill border border-dashed border-bz-text-soft" />
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium text-bz-text">Not set</span>
              <span className="block text-[11px] leading-[1.45] text-bz-text-muted">No rule record at all — different from an explicit “Entire organisation”.</span>
            </span>
            {value === undefined && <Check size={12} className="mt-0.5 shrink-0 text-bz-text" />}
          </button>
          <div className="my-1 h-px bg-bz-line-soft" />
          <p className={cn(LABEL, "px-3 pb-1 pt-1.5")}>Narrowest first</p>
          {LEVELS.map((l) => {
            const selected = value === l.key;
            const LIcon = l.Icon;
            return (
              <button
                key={l.key}
                onClick={() => {
                  onPick(l.key);
                  setOpen(false);
                }}
                className={cn("flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.08]")}
              >
                <span className="mt-[1px] flex size-4 shrink-0 items-center justify-center text-bz-text-muted">
                  <LIcon size={12} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-medium text-bz-text">{l.label}</span>
                    {l.key === DEFAULT_LEVEL && (
                      <span className="rounded-bz-sm bg-bz-paper-warm px-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">default</span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-[1.45] text-bz-text-muted">{l.desc}</span>
                </span>
                {selected && <Check size={12} className="mt-0.5 shrink-0 text-bz-text" />}
              </button>
            );
          })}
        </div>
      </Anchored>
    </>
  );
}

/** The bulk-assignment menu — an ACTION list, never a value that reads back. */
function BulkMenu({
  label,
  title,
  hint,
  onPick,
  disabled,
  icon,
  align = "end",
}: {
  label: string;
  title: string;
  hint: string;
  onPick: (l: Level | null) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  align?: "start" | "end";
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-40"
      >
        {icon}
        {label}
        <ChevronDown size={11} className="opacity-50" />
      </button>
      <Anchored open={open} anchorRef={ref} onClose={() => setOpen(false)} width={300} align={align}>
        <div className="border-b border-bz-line-soft px-3 py-2.5">
          <p className="text-[12px] font-semibold text-bz-text">{title}</p>
          <p className="mt-0.5 text-[11px] leading-[1.45] text-bz-text-muted">{hint}</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto py-1">
          {LEVELS.map((l) => {
            const LIcon = l.Icon;
            return (
              <button
                key={l.key}
                onClick={() => {
                  onPick(l.key);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm"
              >
                <LIcon size={12} className="shrink-0 text-bz-text-muted" />
                <span className="flex-1 truncate text-[12.5px] text-bz-text">{l.label}</span>
                {l.key === DEFAULT_LEVEL && (
                  <span className="rounded-bz-sm bg-bz-paper-warm px-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">default</span>
                )}
              </button>
            );
          })}
          <div className="my-1 h-px bg-bz-line-soft" />
          <button
            onClick={() => {
              onPick(null);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bz-paper-warm"
          >
            <span className="size-3 shrink-0 rounded-bz-pill border border-dashed border-bz-text-soft" />
            <span className="flex-1 text-[12.5px] text-bz-text">Clear every rule (unset)</span>
          </button>
        </div>
      </Anchored>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TRUST BAND  ·  arming · supervisor-tree health · rule integrity
//
// The first thing on the page, because each cell can invalidate everything
// authored below it — but deliberately QUIET. Three cells of one hairline
// instrument strip, no filled panels: state is carried by a single dot and one
// short clause, and the long diagnosis opens on demand under the strip. Colour
// stays a signal here rather than a surface.
// ════════════════════════════════════════════════════════════════════════════

type Health = "ok" | "warn" | "danger";

const HEALTH_DOT: Record<Health, string> = {
  ok: "bg-bz-leaf-deep",
  warn: "bg-bz-fire",
  danger: "bg-[#C0413A]",
};

function TrustCell({
  label,
  tone,
  headline,
  action,
  children,
}: {
  label: string;
  tone: Health;
  headline: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 px-4 py-3.5">
      <div className="flex min-h-[20px] items-center justify-between gap-3">
        <p className={LABEL}>{label}</p>
        {action}
      </div>
      <p className="flex items-start gap-2 text-[13px] font-semibold leading-[1.4] text-bz-text">
        <span className={cn("mt-[6px] size-1.5 shrink-0 rounded-bz-pill", HEALTH_DOT[tone])} />
        <span className="min-w-0">{headline}</span>
      </p>
      {children}
    </div>
  );
}

/** The open-on-demand affordance — quiet by default, never a button-looking button. */
function MoreLink({ open, onClick, children }: { open: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-medium text-bz-text-muted transition-colors hover:text-bz-text"
    >
      {children}
      <ChevronDown size={10} className={cn("transition-transform", open && "rotate-180")} />
    </button>
  );
}

function TrustBand({
  armed,
  arming,
  onToggleArm,
  tree,
  onRebuild,
  rebuilding,
  issueCounts,
  totalIssues,
  activeIssue,
  liveRules,
  onOpenVerify,
  onJumpToIssue,
}: {
  armed: boolean;
  arming: boolean;
  onToggleArm: (next: boolean) => void;
  tree: TreeHealth;
  onRebuild: () => void;
  rebuilding: boolean;
  issueCounts: Record<IssueKind, number>;
  totalIssues: number;
  activeIssue: IssueKind | null;
  liveRules: number;
  onOpenVerify: () => void;
  onJumpToIssue: (k: IssueKind) => void;
}) {
  const [detail, setDetail] = React.useState<"enforcement" | "tree" | null>(null);
  const toggle = (k: "enforcement" | "tree") => setDetail((d) => (d === k ? null : k));

  const treeTone: Health = tree.status === "healthy" ? "ok" : tree.status === "stale" ? "warn" : "danger";

  return (
    <div className="border-b border-bz-line bg-bz-paper px-4 pb-5 pt-5 md:px-6">
      {/* identity */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className={LABEL}>Access control · read visibility</p>
          <h1 className="mt-1.5 text-[22px] font-semibold tracking-tight text-bz-text md:text-[25px]">Data Scope Matrix</h1>
          <p className="mt-1 max-w-[68ch] text-[12.5px] leading-[1.5] text-bz-text-muted">
            How many rows of each document type a population may <span className="font-medium text-bz-text">see</span>. Never who may create, edit or
            delete — those are separate systems.
          </p>
        </div>
        <button
          onClick={onOpenVerify}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95"
        >
          <UserSearch size={13} />
          Verify what someone sees
        </button>
      </div>

      {/* the instrument strip */}
      <div className="mt-4 overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        <div className="grid grid-cols-1 divide-y divide-bz-line-soft lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {/* ── enforcement ─────────────────────────────────────────────── */}
          <TrustCell
            label="Enforcement"
            tone={armed ? "ok" : "warn"}
            headline={armed ? "Armed — every committed rule is live" : "Not armed — nothing here applies"}
            action={
              <span className="flex items-center gap-2">
                {arming && <Loader2 size={11} className="animate-spin text-bz-fire" />}
                <Switch value={armed} onChange={onToggleArm} disabled={arming} ariaLabel="Arm row-level visibility for this tenant" />
              </span>
            }
          >
            <p className="text-[11.5px] leading-[1.5] text-bz-text-muted">
              <Count n={liveRules} /> rules {armed ? "applied tenant-wide" : "stored, applied by nothing"}.{" "}
              <MoreLink open={detail === "enforcement"} onClick={() => toggle("enforcement")}>
                What arming does
              </MoreLink>
            </p>
          </TrustCell>

          {/* ── supervisor tree ─────────────────────────────────────────── */}
          <TrustCell
            label="Supervisor tree"
            tone={treeTone}
            headline={
              <>
                {TREE_LABEL[tree.status]} · <span className={NUM}>{tree.rows}</span> ancestry rows
              </>
            }
            action={
              <button
                onClick={onRebuild}
                disabled={rebuilding}
                className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2 text-[11px] font-medium text-bz-text-muted transition-colors hover:border-bz-line hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-50"
              >
                {rebuilding ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                {rebuilding ? "Rebuilding…" : "Rebuild"}
              </button>
            }
          >
            <p className="text-[11.5px] leading-[1.5] text-bz-text-muted">
              <span className={NUM}>{tree.links}</span> links · <span className={NUM}>{tree.brokenChains}</span> broken · checked {tree.checkedAt}.{" "}
              <MoreLink open={detail === "tree"} onClick={() => toggle("tree")}>
                Diagnosis
              </MoreLink>
            </p>
          </TrustCell>

          {/* ── rule integrity ──────────────────────────────────────────── */}
          <TrustCell
            label="Rule integrity"
            tone={totalIssues > 0 ? "danger" : "ok"}
            headline={
              totalIssues > 0 ? (
                <>
                  <span className={NUM}>{totalIssues}</span> of <span className={NUM}>{liveRules}</span> rules do not mean what they look like
                </>
              ) : (
                <>
                  All <span className={NUM}>{liveRules}</span> live rules check out
                </>
              )
            }
          >
            {totalIssues > 0 ? (
              <div className="flex flex-wrap gap-1">
                {(Object.keys(ISSUE_META) as IssueKind[])
                  .filter((k) => issueCounts[k] > 0)
                  .map((k) => {
                    const on = activeIssue === k;
                    return (
                      <button
                        key={k}
                        onClick={() => onJumpToIssue(k)}
                        title={`${ISSUE_META[k].label} — ${ISSUE_META[k].blurb}`}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-bz-sm border px-1.5 py-0.5 text-[11px] transition-colors",
                          on
                            ? "border-bz-fire bg-bz-fire/[0.18] text-bz-text"
                            : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
                        )}
                      >
                        <span className={cn("size-1.5 rounded-bz-pill", ISSUE_META[k].tone === "danger" ? "bg-[#C0413A]" : "bg-bz-fire")} />
                        {ISSUE_META[k].short}
                        <span className={cn("font-semibold text-bz-text", NUM)}>{issueCounts[k]}</span>
                      </button>
                    );
                  })}
              </div>
            ) : (
              <p className="text-[11.5px] leading-[1.5] text-bz-text-muted">Nothing inert, no empty list, no broken dependency.</p>
            )}
          </TrustCell>
        </div>

        {/* one shared detail drawer — the strip itself keeps a constant height */}
        {detail && (
          <div className="flex items-start justify-between gap-4 border-t border-bz-line-soft bg-bz-paper-warm px-4 py-3">
            {detail === "enforcement" ? (
              <p className="max-w-[96ch] text-[11.5px] leading-[1.6] text-bz-text-muted">
                {armed ? (
                  <>
                    All <Count n={liveRules} /> committed rules are being applied right now. Historical rows with no recorded owner stay visible for
                    most document types but disappear for HR ones. Rules on unenforced document types remain inert.
                  </>
                ) : (
                  <>
                    Rules are stored faithfully and applied by nothing. Arming turns all <Count n={liveRules} /> on at once, everywhere — there is no
                    staged or per-module rollout. Historical rows with no recorded owner stay visible for most document types but disappear for HR
                    ones, so the risk is highest at the moment the switch is flipped.
                  </>
                )}
              </p>
            ) : (
              <div className="min-w-0">
                <p className="max-w-[96ch] text-[11.5px] leading-[1.6] text-bz-text-muted">{tree.diagnosis}</p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-bz-text-muted">
                  <span>
                    Rows written <Count n={tree.rows} />
                  </span>
                  <span>
                    Supervisor links <Count n={tree.links} />
                  </span>
                  <span>
                    Employees with no login <Count n={tree.noLogin} />
                  </span>
                  <span>
                    Broken chains <Count n={tree.brokenChains} />
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => setDetail(null)}
              aria-label="Close"
              className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-bz-surface hover:text-bz-text"
            >
              <X size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPULATION RAIL  ·  tier selector · precedence statement · target list
// ════════════════════════════════════════════════════════════════════════════

function TierRow({
  tier,
  active,
  count,
  loading,
  failed,
  rules,
  pending,
  onSelect,
  onRetry,
}: {
  tier: Tier;
  active: boolean;
  count: number;
  loading: boolean;
  failed: boolean;
  rules: number;
  pending: number;
  onSelect: () => void;
  onRetry: () => void;
}) {
  const m = TIER_META[tier];
  const Icon = m.Icon;
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-bz-md border px-2.5 py-2 text-left transition-colors",
        active ? "border-bz-fire bg-bz-fire/[0.14]" : "border-transparent hover:bg-bz-paper-warm",
      )}
    >
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-sm", active ? "bg-bz-fire/[0.3] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>
        <Icon size={13} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[12.5px] font-medium text-bz-text">{m.label}</span>
          {pending > 0 && (
            <span className={cn("rounded-bz-pill bg-bz-fire px-1.5 text-[10px] font-bold text-bz-text", NUM)} title={`${pending} unsaved edits under this population`}>
              {pending}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-bz-text-muted">
          {loading ? (
            <>
              <Loader2 size={9} className="animate-spin" /> loading…
            </>
          ) : failed ? (
            <span className="text-[#9A2E29]">could not load</span>
          ) : (
            <>
              <span className={NUM}>{count}</span> {tier === "tenant" ? "fallback" : count === 1 ? m.unit : `${m.unit}s`}
              {rules > 0 && (
                <>
                  {" · "}
                  <span className={NUM}>{rules}</span> with rules
                </>
              )}
            </>
          )}
        </span>
      </span>
      {failed && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              onRetry();
            }
          }}
          className="shrink-0 rounded-bz-sm bg-[#FBE7E5] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#9A2E29] hover:bg-[#F6D3CE]"
        >
          Retry
        </span>
      )}
    </button>
  );
}

function PopulationRail({
  tier,
  onTier,
  tierCounts,
  tierLoading,
  tierFailed,
  onRetryDepartments,
  tierRuleTargets,
  tierPending,
  targets,
  selectedTarget,
  onSelectTarget,
  targetRuleCount,
  targetPendingCount,
  configuredIndividuals,
  pendingByTier,
}: {
  tier: Tier;
  onTier: (t: Tier) => void;
  tierCounts: Record<Tier, number>;
  tierLoading: Record<Tier, boolean>;
  tierFailed: Record<Tier, boolean>;
  onRetryDepartments: () => void;
  tierRuleTargets: Record<Tier, number>;
  tierPending: Record<Tier, number>;
  targets: Target[];
  selectedTarget: string | null;
  onSelectTarget: (id: string | null) => void;
  targetRuleCount: (id: string) => number;
  targetPendingCount: (id: string) => number;
  configuredIndividuals: number;
  pendingByTier: { tier: Tier; n: number }[];
}) {
  const [q, setQ] = React.useState("");
  const [ruleOpen, setRuleOpen] = React.useState(false);
  React.useEffect(() => setQ(""), [tier]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return targets;
    return targets.filter((t) => t.name.toLowerCase().includes(s) || (t.sub ?? "").toLowerCase().includes(s));
  }, [targets, q]);

  const m = TIER_META[tier];
  const crossTier = pendingByTier.filter((p) => p.tier !== tier && p.n > 0);

  return (
    <div className="flex flex-col gap-3">
      {/* tier selector */}
      <div className={cn(CARD, "p-2.5")}>
        <p className={cn(LABEL, "px-1 pb-1.5")}>Who the rule is written against</p>
        <div className="flex flex-col gap-0.5">
          {TIER_ORDER.map((t) => (
            <TierRow
              key={t}
              tier={t}
              active={t === tier}
              count={tierCounts[t]}
              loading={tierLoading[t]}
              failed={tierFailed[t]}
              rules={tierRuleTargets[t]}
              pending={tierPending[t]}
              onSelect={() => onTier(t)}
              onRetry={onRetryDepartments}
            />
          ))}
        </div>

        {/* component 2 — the precedence statement, the only place override semantics live */}
        <div className="mt-2.5 overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-paper-warm">
          <button
            onClick={() => setRuleOpen((o) => !o)}
            className="flex w-full items-center gap-1.5 px-3 py-2 text-left hover:bg-bz-line-soft/40"
          >
            <Layers size={11} className="shrink-0 text-bz-text-muted" />
            <span className="min-w-0 flex-1 truncate text-[11px] text-bz-text">
              <span className="font-semibold">{m.precedence}</span>
              <span className="text-bz-text-muted"> — {m.gist}</span>
            </span>
            <ChevronDown size={11} className={cn("shrink-0 text-bz-text-muted transition-transform", ruleOpen && "rotate-180")} />
          </button>
          {ruleOpen && (
            <div className="border-t border-bz-line-soft px-3 pb-2.5 pt-2">
              <p className="text-[11.5px] leading-[1.55] text-bz-text-muted">{m.explain}</p>
              <p className="mt-2 border-t border-bz-line-soft pt-2 text-[11px] leading-[1.5] text-bz-text-soft">
                Within a tier the widest rule wins. Between tiers the narrower-scoped tier wins — even when it is more restrictive.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* target list */}
      <div className={cn(CARD, "flex min-h-0 flex-col")}>
        <div className="flex items-center justify-between gap-2 border-b border-bz-line-soft px-3 py-2.5">
          <p className={LABEL}>{tier === "tenant" ? "Target" : `Pick a ${m.unit}`}</p>
          {tier === "individual" && configuredIndividuals > 0 && (
            <span className={cn("rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-semibold text-bz-text-muted", NUM)}>
              {configuredIndividuals} configured
            </span>
          )}
        </div>

        {tier !== "tenant" && (
          <div className="px-3 pt-2.5">
            <SearchField value={q} onChange={setQ} placeholder={`Search ${m.unit}s…`} />
          </div>
        )}

        {tierFailed[tier] ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="flex size-9 items-center justify-center rounded-bz-pill bg-[#FBE7E5] text-[#9A2E29]">
              <Ban size={15} />
            </span>
            <p className="text-[12.5px] font-medium text-bz-text">Departments could not be loaded</p>
            <p className="max-w-[30ch] text-[11.5px] leading-[1.5] text-bz-text-muted">
              The other populations loaded fine — this one request failed on its own. Nothing you have authored is lost.
            </p>
            <GhostButton onClick={onRetryDepartments} className="mt-1">
              <RefreshCw size={11} /> Retry
            </GhostButton>
          </div>
        ) : tierLoading[tier] ? (
          <div className="flex flex-col gap-1.5 p-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-bz-md bg-bz-paper-warm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
            <SearchX size={17} className="text-bz-text-soft" />
            <p className="text-[12px] text-bz-text-muted">
              No {m.unit} matches “{q}”.
            </p>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto p-2 lg:max-h-[calc(100vh-430px)]">
            <div className="flex flex-col gap-0.5">
              {filtered.map((t) => {
                const active = t.id === selectedTarget;
                const rules = targetRuleCount(t.id);
                const pend = targetPendingCount(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTarget(t.id)}
                    style={t.depth ? { paddingLeft: 10 + t.depth * 12 } : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-bz-md border px-2.5 py-2 text-left transition-colors",
                      active ? "border-bz-fire bg-bz-fire/[0.14]" : "border-transparent hover:bg-bz-paper-warm",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-bz-text">{t.name}</span>
                      {t.sub && <span className="mt-0.5 block truncate text-[11px] text-bz-text-muted">{t.sub}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {rules > 0 && (
                        <span className={cn("rounded-bz-pill bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text-muted", NUM)} title={`${rules} stored rules`}>
                          {rules}
                        </span>
                      )}
                      {pend > 0 && (
                        <span className={cn("rounded-bz-pill bg-bz-fire px-1.5 py-0.5 text-[10px] font-bold text-bz-text", NUM)} title={`${pend} unsaved edits`}>
                          +{pend}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tier === "individual" && selectedTarget && (
          <div className="border-t border-bz-line-soft px-3 py-2">
            <button onClick={() => onSelectTarget(null)} className="text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* the shared buffer, finally visible */}
      {crossTier.length > 0 && (
        <div className="rounded-bz-lg border border-bz-fire bg-bz-fire/[0.14] p-3">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-bz-text">
            <Zap size={11} />
            Unsaved edits outside this population
          </p>
          <p className="mt-1 text-[11.5px] leading-[1.5] text-bz-text-muted">
            One commit writes every population at once. These will be saved too, even though you cannot see them from here.
          </p>
          <div className="mt-2 flex flex-col gap-1">
            {crossTier.map((p) => (
              <button
                key={p.tier}
                onClick={() => onTier(p.tier)}
                className="flex items-center justify-between rounded-bz-sm bg-bz-surface px-2 py-1.5 text-left hover:bg-bz-paper-warm"
              >
                <span className="text-[11.5px] text-bz-text">{TIER_META[p.tier].label}</span>
                <span className={cn("text-[11.5px] font-semibold text-bz-text", NUM)}>{p.n}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ASSIGNMENT SURFACE  ·  one target × the document-type catalogue
// ════════════════════════════════════════════════════════════════════════════

type RowIssue = { kind: IssueKind };

function DocRow({
  doc,
  value,
  edited,
  issues,
  namedCount,
  canOpenList,
  onPick,
  onClear,
  onOpenList,
  transposeLabel,
  onTranspose,
  disabled,
}: {
  doc: DocType;
  value: Level | undefined;
  edited: boolean;
  issues: RowIssue[];
  namedCount: number | null;
  canOpenList: boolean;
  onPick: (l: Level) => void;
  onClear: () => void;
  onOpenList: () => void;
  transposeLabel: string | null;
  onTranspose: (l: Level | null) => void;
  disabled?: boolean;
}) {
  const worst = issues.find((i) => ISSUE_META[i.kind].tone === "danger") ?? issues[0] ?? null;
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 border-b border-bz-line-soft px-3 py-3 last:border-b-0 md:flex-row md:items-center md:gap-3 md:px-4",
        worst && ISSUE_META[worst.kind].tone === "danger" && "bg-[#FBE7E5]/45",
      )}
    >
      {/* identity */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[12.5px] font-medium text-bz-text">{doc.label}</span>
          {!doc.enforced && (
            <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">
              Not enforced
              <InfoDot text="Nothing in the product reads a scope rule for this document type. A rule here is stored faithfully and applied by nothing — it is not protection. It is still committed, still bulk-assigned and still resolved, so it will look configured everywhere else." />
            </span>
          )}
        </div>
        {worst && (
          <p
            className={cn(
              "mt-1 flex items-start gap-1.5 text-[11px] leading-[1.45]",
              ISSUE_META[worst.kind].tone === "danger" ? "text-[#9A2E29]" : "text-bz-text-muted",
            )}
          >
            <TriangleAlert size={11} className="mt-[1px] shrink-0" />
            <span>
              <span className="font-semibold">{ISSUE_META[worst.kind].label}.</span> {ISSUE_META[worst.kind].blurb}
            </span>
          </p>
        )}
      </div>

      {/* value + named-list opener */}
      <div className="flex w-full shrink-0 flex-wrap items-center gap-2 md:w-auto md:flex-nowrap">
        <ScopeButton value={value} edited={edited} onPick={onPick} onClear={onClear} disabled={disabled} />

        {value === "picked" && (
          <button
            onClick={onOpenList}
            disabled={disabled}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-bz-md border px-2.5 text-[11.5px] font-medium transition-colors disabled:opacity-50",
              canOpenList
                ? namedCount === 0
                  ? "border-[#E9BDB7] bg-[#FBE7E5] text-[#9A2E29] hover:bg-[#F6D3CE]"
                  : "border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm"
                : "border-dashed border-bz-line bg-bz-surface text-bz-text-soft hover:bg-bz-paper-warm",
            )}
            title={canOpenList ? "Name the people this pairing can see" : "Commit this pairing first — the list is stored under the rule record"}
          >
            <ListChecks size={11} />
            {canOpenList ? (
              <>
                <span className={NUM}>{namedCount ?? 0}</span> named
              </>
            ) : (
              "Commit first"
            )}
          </button>
        )}

        {/* transpose bulk — only when the tier holds more than one target */}
        {transposeLabel && (
          <BulkMenu
            label=""
            icon={<MoreHorizontal size={13} />}
            title={`Apply to ${transposeLabel}`}
            hint={`Sets ${doc.label} to one level for every ${transposeLabel}. No undo — it lands in the unsaved buffer and is written on the next commit.`}
            onPick={onTranspose}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

function SurfaceSkeleton() {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 flex-1 animate-pulse rounded-bz-sm bg-bz-paper-warm" style={{ maxWidth: `${40 + ((i * 13) % 40)}%` }} />
            <div className="h-8 w-[180px] animate-pulse rounded-bz-md bg-bz-paper-warm" />
          </div>
        ))}
      </div>
      <p className="mt-5 flex items-center justify-center gap-2 text-[11.5px] text-bz-text-muted">
        <Loader2 size={12} className="animate-spin text-bz-fire" />
        Loading the catalogue and the stored rules…
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VERIFY DRAWER  ·  effective-access resolution
// Kept out of the assignment card on purpose: it must stay usable while that
// card is loading, and permanently usable if a load ever fails.
// ════════════════════════════════════════════════════════════════════════════

type EntryState = { status: "pending" } | { status: "done"; res: Resolved } | { status: "failed" };

function SubjectPicker({ value, onChange }: { value: string | null; onChange: (id: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const ref = React.useRef<HTMLButtonElement>(null);
  const u = value ? USER_BY.get(value) : null;
  const list = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? USERS.filter((x) => x.name.toLowerCase().includes(s)) : USERS;
  }, [q]);
  return (
    <>
      <button
        ref={ref}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center gap-2 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-left hover:bg-bz-paper-warm"
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-[9px] font-bold text-bz-text-muted">
          {u ? u.name.split(" ").map((w) => w[0]).join("").slice(0, 2) : "—"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-bz-text">{u ? u.name : "Choose someone to resolve"}</span>
          {u && <span className="block truncate text-[10.5px] text-bz-text-muted">{DEPT_BY.get(u.dept)?.name}</span>}
        </span>
        <ChevronDown size={11} className="shrink-0 text-bz-text-muted" />
      </button>
      <Anchored open={open} anchorRef={ref} onClose={() => setOpen(false)}>
        <div className="border-b border-bz-line-soft p-2">
          <SearchField value={q} onChange={setQ} placeholder="Search people…" autoFocus />
        </div>
        <div className="max-h-[280px] overflow-y-auto py-1">
          {list.length === 0 ? (
            <p className="px-3 py-6 text-center text-[11.5px] text-bz-text-muted">Nobody matches “{q}”.</p>
          ) : (
            list.map((x) => (
              <button
                key={x.id}
                onClick={() => {
                  onChange(x.id);
                  setOpen(false);
                }}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm", x.id === value && "bg-bz-fire/[0.08]")}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-bz-text">{x.name}</span>
                  <span className="block truncate text-[10.5px] text-bz-text-muted">
                    {DEPT_BY.get(x.dept)?.name} · {x.roles.map((r) => ROLE_BY.get(r)?.name).join(", ")}
                  </span>
                </span>
                {x.id === value && <Check size={12} className="shrink-0 text-bz-text" />}
              </button>
            ))
          )}
        </div>
      </Anchored>
    </>
  );
}

function VerifyDrawer({
  open,
  onClose,
  subject,
  onSubject,
  entries,
  onRun,
  onRetryEntry,
  running,
  dirtyCount,
  armed,
}: {
  open: boolean;
  onClose: () => void;
  subject: string | null;
  onSubject: (id: string) => void;
  entries: Map<string, EntryState> | null;
  onRun: () => void;
  onRetryEntry: (docId: string) => void;
  running: boolean;
  dirtyCount: number;
  armed: boolean;
}) {
  const [onlyRestricted, setOnlyRestricted] = React.useState(false);
  if (!open) return null;

  const resolvedCount = entries ? Array.from(entries.values()).filter((e) => e.status === "done").length : 0;
  const failedCount = entries ? Array.from(entries.values()).filter((e) => e.status === "failed").length : 0;
  const pendingCount = entries ? Array.from(entries.values()).filter((e) => e.status === "pending").length : 0;

  const visible = CATALOGUE.filter((d) => {
    if (!entries) return true;
    if (!onlyRestricted) return true;
    const e = entries.get(d.id);
    return !e || e.status !== "done" || e.res.level !== DEFAULT_LEVEL;
  });

  return createPortal(
    <>
      <div onClick={onClose} className="fixed inset-0 z-[75] bg-bz-olive/35" aria-hidden />
      <aside className="fixed right-0 top-0 z-[76] flex h-full w-full max-w-[540px] flex-col border-l border-bz-line-soft bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.28)]">
        <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire/[0.20] text-bz-text">
              <UserSearch size={16} />
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-bz-text">Effective access</p>
              <p className="text-[11.5px] text-bz-text-muted">What this person actually sees, and what decided it.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={15} />
          </button>
        </div>

        <div className="border-b border-bz-line-soft px-5 py-3.5">
          <p className={cn(LABEL, "pb-1.5")}>Subject</p>
          <SubjectPicker value={subject} onChange={onSubject} />
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={onRun}
              disabled={!subject || running}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-3 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-40"
            >
              {running ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              {running ? "Resolving…" : `Resolve all ${TOTAL_DOCS} document types`}
            </button>
            {entries && (
              <GhostButton onClick={() => setOnlyRestricted((v) => !v)} className={cn(onlyRestricted && "border-bz-fire bg-bz-fire/[0.18]")}>
                Only restricted
              </GhostButton>
            )}
          </div>

          {dirtyCount > 0 && (
            <p className="mt-2.5 flex items-start gap-1.5 rounded-bz-md bg-bz-leaf/35 px-2.5 py-2 text-[11px] leading-[1.5] text-bz-text">
              <Info size={11} className="mt-[1px] shrink-0" />
              Resolves against <span className="font-semibold">stored</span> rules. Your {dirtyCount} unsaved edits are not reflected here.
            </p>
          )}
          {!armed && (
            <p className="mt-2 flex items-start gap-1.5 rounded-bz-md bg-bz-paper-warm px-2.5 py-2 text-[11px] leading-[1.5] text-bz-text-muted">
              <ShieldOff size={11} className="mt-[1px] shrink-0" />
              Enforcement is off, so what this person sees today is everything. The results below are what they WOULD see once armed.
            </p>
          )}
        </div>

        {/* progress */}
        {entries && (
          <div className="flex items-center gap-3 border-b border-bz-line-soft bg-bz-paper-warm px-5 py-2">
            <div className="h-1 flex-1 overflow-hidden rounded-bz-pill bg-bz-line-soft">
              <div className="h-full rounded-bz-pill bg-bz-fire transition-[width] duration-200" style={{ width: `${Math.round(((resolvedCount + failedCount) / TOTAL_DOCS) * 100)}%` }} />
            </div>
            <p className={cn("shrink-0 text-[11px] text-bz-text-muted", NUM)}>
              {resolvedCount} resolved
              {pendingCount > 0 && ` · ${pendingCount} pending`}
              {failedCount > 0 && <span className="font-semibold text-[#9A2E29]"> · {failedCount} failed</span>}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {!subject ? (
            <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
              <span className="flex size-11 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted">
                <UserRound size={19} />
              </span>
              <p className="text-[13px] font-medium text-bz-text">Choose someone first</p>
              <p className="max-w-[36ch] text-[11.5px] leading-[1.55] text-bz-text-muted">Resolution runs per person. There is nothing to resolve until a subject is named.</p>
            </div>
          ) : !entries ? (
            <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
              <span className="flex size-11 items-center justify-center rounded-bz-pill bg-bz-fire/[0.20] text-bz-text">
                <Zap size={19} />
              </span>
              <p className="text-[13px] font-medium text-bz-text">Not run yet</p>
              <p className="max-w-[40ch] text-[11.5px] leading-[1.55] text-bz-text-muted">
                Every one of the {TOTAL_DOCS} document types is resolved separately against the precedence ladder. Results land one at a time and in
                no particular order.
              </p>
            </div>
          ) : (
            <div>
              {visible.map((d) => {
                const e = entries.get(d.id);
                return <VerifyRow key={d.id} doc={d} entry={e} onRetry={() => onRetryEntry(d.id)} />;
              })}
              {visible.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-8 py-14 text-center">
                  <ShieldCheck size={19} className="text-bz-leaf-deep" />
                  <p className="text-[12.5px] font-medium text-bz-text">Nothing is restricted for this person</p>
                  <p className="max-w-[34ch] text-[11.5px] leading-[1.5] text-bz-text-muted">Every document type resolved to the unrestricted default.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body,
  );
}

function VerifyRow({ doc, entry, onRetry }: { doc: DocType; entry: EntryState | undefined; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-bz-line-soft px-5 py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[12px] text-bz-text">
          <span className="truncate">{doc.label}</span>
          {!doc.enforced && <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">not enforced</span>}
        </p>
        {entry?.status === "done" && (
          <p className="mt-0.5 truncate text-[10.5px] text-bz-text-muted">
            Decided by {DECIDED_LABEL[entry.res.by]}
            {entry.res.via ? ` · ${entry.res.via}` : ""}
            {entry.res.seatCapped ? " · narrowed by seat class" : ""}
          </p>
        )}
      </div>
      <div className="shrink-0">
        {!entry || entry.status === "pending" ? (
          <span className="flex h-6 w-[132px] items-center justify-center gap-1.5 rounded-bz-sm bg-bz-paper-warm text-[10.5px] text-bz-text-soft">
            <Loader2 size={10} className="animate-spin" /> resolving…
          </span>
        ) : entry.status === "failed" ? (
          <button
            onClick={onRetry}
            className="flex h-6 w-[132px] items-center justify-center gap-1.5 rounded-bz-sm bg-[#FBE7E5] text-[10.5px] font-semibold text-[#9A2E29] hover:bg-[#F6D3CE]"
            title="This request failed. It is not a result — retry it."
          >
            <TriangleAlert size={10} /> failed · retry
          </button>
        ) : (
          <span
            className={cn(
              "flex h-6 w-[132px] items-center justify-center gap-1.5 rounded-bz-sm px-2 text-[10.5px] font-medium",
              entry.res.level === DEFAULT_LEVEL ? "bg-bz-paper-warm text-bz-text-muted" : "bg-bz-fire/[0.22] text-bz-text",
            )}
          >
            {LEVEL_BY[entry.res.level].short}
          </span>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NAMED-LIST EDITOR  ·  a focused editor over ONE pairing
// The reconciliation hazard is designed against: it will not let you save
// until the stored list has actually arrived.
// ════════════════════════════════════════════════════════════════════════════

type ListEditorTarget = { key: string; docLabel: string; targetLabel: string; tier: Tier };

function NamedListEditor({
  target,
  onClose,
  stored,
  onSave,
  saving,
  error,
}: {
  target: ListEditorTarget;
  onClose: () => void;
  stored: string[] | null; // null = not reconciled yet
  onSave: (ids: string[]) => void;
  saving: boolean;
  error: string | null;
}) {
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [q, setQ] = React.useState("");
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const reconciled = stored !== null;

  // the stored selection arrives a moment after the editor opens
  React.useEffect(() => {
    if (stored) setSel(new Set(stored));
  }, [stored]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? USERS.filter((u) => u.name.toLowerCase().includes(s)) : USERS;
  }, [q]);

  const hiddenSelected = React.useMemo(() => {
    const vis = new Set(filtered.map((u) => u.id));
    return Array.from(sel).filter((id) => !vis.has(id)).length;
  }, [filtered, sel]);

  const changed = reconciled && (sel.size !== stored!.length || stored!.some((id) => !sel.has(id)));

  const attemptClose = () => {
    if (changed) setConfirmDiscard(true);
    else onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(15,20,17,0.34)] px-3 py-3 sm:items-center sm:px-4 sm:py-8">
      <div className="flex max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_28px_64px_-24px_rgba(15,20,17,0.4)]">
        <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-4">
          <div className="min-w-0">
            <p className={LABEL}>Named people · one pairing only</p>
            <p className="mt-1 truncate text-[14.5px] font-semibold text-bz-text">{target.docLabel}</p>
            <p className="mt-0.5 truncate text-[11.5px] text-bz-text-muted">
              {TIER_META[target.tier].label} · {target.targetLabel}
            </p>
          </div>
          <button onClick={attemptClose} aria-label="Close" className="flex size-8 shrink-0 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={15} />
          </button>
        </div>

        {/* the not-yet-reconciled window */}
        {!reconciled && (
          <p className="flex items-center gap-2 border-b border-bz-line-soft bg-bz-leaf/35 px-5 py-2.5 text-[11.5px] leading-[1.5] text-bz-text">
            <Loader2 size={12} className="shrink-0 animate-spin" />
            Loading the stored list. Saving now would replace it with nothing, so saving is held until it arrives.
          </p>
        )}

        <div className="border-b border-bz-line-soft px-5 py-3">
          <SearchField value={q} onChange={setQ} placeholder="Search people…" />
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-bz-text-muted">
            <span>
              <Count n={sel.size} /> selected
            </span>
            {hiddenSelected > 0 && (
              <span className="text-bz-text-soft">
                <span className={NUM}>{hiddenSelected}</span> hidden by the search — still saved
              </span>
            )}
          </p>
        </div>

        <div className="min-h-[180px] flex-1 overflow-y-auto">
          {!reconciled ? (
            <div className="flex flex-col gap-1.5 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 animate-pulse rounded-bz-md bg-bz-paper-warm" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-6 py-12 text-center">
              <SearchX size={17} className="text-bz-text-soft" />
              <p className="text-[12.5px] font-medium text-bz-text">Nobody matches “{q}”</p>
              <p className="text-[11.5px] text-bz-text-muted">Clearing the search never changes who is selected.</p>
            </div>
          ) : (
            filtered.map((u) => {
              const on = sel.has(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() =>
                    setSel((s) => {
                      const n = new Set(s);
                      if (n.has(u.id)) n.delete(u.id);
                      else n.add(u.id);
                      return n;
                    })
                  }
                  className={cn("flex w-full items-center gap-2.5 border-b border-bz-line-soft px-5 py-2.5 text-left last:border-b-0 hover:bg-bz-paper-warm", on && "bg-bz-fire/[0.08]")}
                >
                  <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-bz-sm border", on ? "border-bz-fire bg-bz-fire text-bz-text" : "border-bz-line bg-bz-surface")}>
                    {on && <Check size={10} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-bz-text">{u.name}</span>
                    <span className="block truncate text-[10.5px] text-bz-text-muted">
                      {DEPT_BY.get(u.dept)?.name} · {u.roles.map((r) => ROLE_BY.get(r)?.name).join(", ")}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        {reconciled && sel.size === 0 && (
          <p className="flex items-start gap-2 border-t border-[#E9BDB7] bg-[#FBE7E5] px-5 py-2.5 text-[11.5px] leading-[1.5] text-[#9A2E29]">
            <TriangleAlert size={12} className="mt-[1px] shrink-0" />
            <span>
              <span className="font-semibold">Saving with nobody named is a total blackout.</span> These viewers will see zero rows of {target.docLabel} —
              not all rows.
            </span>
          </p>
        )}

        {error && (
          <p className="flex items-start gap-2 border-t border-[#E9BDB7] bg-[#FBE7E5] px-5 py-2.5 text-[11.5px] leading-[1.5] text-[#9A2E29]">
            <Ban size={12} className="mt-[1px] shrink-0" />
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
          <p className="text-[11px] leading-[1.45] text-bz-text-muted">Saved on its own, not with the rest of the page.</p>
          <div className="flex shrink-0 items-center gap-2">
            <GhostButton onClick={attemptClose} disabled={saving}>
              Cancel
            </GhostButton>
            <button
              onClick={() => onSave(Array.from(sel))}
              disabled={!reconciled || saving}
              className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-40"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Replace list
            </button>
          </div>
        </div>
      </div>

      {confirmDiscard && (
        <ConfirmDialog
          tone="danger"
          title="Discard the names you changed?"
          confirmLabel="Discard changes"
          body={
            <p>
              This editor writes on its own — nothing you changed here is in the page's unsaved buffer. Closing now loses it with no way back.
            </p>
          }
          onCancel={() => setConfirmDiscard(false)}
          onConfirm={() => {
            setConfirmDiscard(false);
            onClose();
          }}
        />
      )}
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG  ·  the integrity this surface previously did not have
// ════════════════════════════════════════════════════════════════════════════

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  tone = "normal",
  onConfirm,
  onCancel,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  tone?: "normal" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  React.useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onCancel]);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[rgba(15,20,17,0.38)] px-3 py-3 sm:items-center sm:px-4">
      <div className="w-full max-w-[460px] overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_28px_64px_-24px_rgba(15,20,17,0.4)]">
        <div className="flex items-start gap-3 px-5 pb-3 pt-5">
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-md", tone === "danger" ? "bg-[#FBE7E5] text-[#9A2E29]" : "bg-bz-fire/[0.20] text-bz-text")}>
            <TriangleAlert size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[14.5px] font-semibold leading-snug text-bz-text">{title}</p>
            <div className="mt-1.5 space-y-2 text-[12px] leading-[1.55] text-bz-text-muted">{body}</div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <button
            onClick={onConfirm}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-bz-md px-3.5 text-[12px] font-semibold",
              tone === "danger" ? "bg-[#9A2E29] text-bz-text-on-dark hover:opacity-95" : "bg-bz-deep text-bz-text-on-dark hover:opacity-95",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMMIT FOOTER  ·  one write · unsaved readout · authoring-context readout
// ════════════════════════════════════════════════════════════════════════════

function CommitFooter({
  tier,
  targetCount,
  dirty,
  pendingByTier,
  saving,
  onCommit,
  onDiscard,
}: {
  tier: Tier;
  targetCount: number;
  dirty: number;
  pendingByTier: { tier: Tier; n: number }[];
  saving: boolean;
  onCommit: () => void;
  onDiscard: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLButtonElement>(null);
  const spread = pendingByTier.filter((p) => p.n > 0);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        {/* authoring-context readout */}
        <p className="flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
          <Layers size={12} className="shrink-0 text-bz-text-soft" />
          Authoring <span className="font-medium text-bz-text">{TIER_META[tier].label}</span>
          <span className="text-bz-text-soft">·</span>
          <span className={NUM}>{targetCount}</span> {tier === "tenant" ? "target" : targetCount === 1 ? TIER_META[tier].unit : `${TIER_META[tier].unit}s`}
        </p>

        {/* unsaved-state readout */}
        {saving ? (
          <p className="flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
            <Loader2 size={12} className="animate-spin text-bz-fire" /> Writing every population in one commit…
          </p>
        ) : dirty > 0 ? (
          <button
            ref={ref}
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-bz-sm px-1.5 py-0.5 text-[11.5px] text-bz-text-muted hover:bg-bz-paper-warm"
          >
            <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />
            <span className="font-semibold text-bz-text">
              <span className={NUM}>{dirty}</span> unsaved
            </span>
            across <span className={NUM}>{spread.length}</span> population{spread.length === 1 ? "" : "s"}
            <ChevronDown size={11} className="opacity-60" />
          </button>
        ) : (
          <p className="flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
            <ShieldCheck size={12} className="shrink-0 text-bz-leaf-deep" /> Everything is stored.
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <GhostButton onClick={onDiscard} disabled={dirty === 0 || saving}>
          <RotateCcw size={11} /> Discard all
        </GhostButton>
        <button
          onClick={onCommit}
          disabled={dirty === 0 || saving}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-40"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Commit {dirty > 0 ? dirty : ""} change{dirty === 1 ? "" : "s"}
        </button>
      </div>

      <Anchored open={open} anchorRef={ref} onClose={() => setOpen(false)} width={300}>
        <div className="border-b border-bz-line-soft px-3 py-2.5">
          <p className="text-[12px] font-semibold text-bz-text">One buffer, every population</p>
          <p className="mt-0.5 text-[11px] leading-[1.45] text-bz-text-muted">A single commit writes all of these, including the ones you are not looking at.</p>
        </div>
        <div className="py-1">
          {spread.map((p) => (
            <div key={p.tier} className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[12px] text-bz-text">{TIER_META[p.tier].label}</span>
              <span className={cn("text-[12px] font-semibold text-bz-text", NUM)}>{p.n}</span>
            </div>
          ))}
        </div>
      </Anchored>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST  ·  the transient message channel (every previously silent failure)
// ════════════════════════════════════════════════════════════════════════════

type ToastState = { kind: "success" | "error" | "info"; message: string; id: number } | null;

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 5200);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const err = toast.kind === "error";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[76px] z-[85] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[560px] items-start gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.26)]">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-pill", err ? "bg-[#FBE7E5]" : "bg-bz-fire/[0.22]")}>
          {err ? <Ban size={12} className="text-[#9A2E29]" /> : toast.kind === "info" ? <Info size={12} className="text-bz-text" /> : <Check size={13} className="text-bz-leaf-deep" />}
        </span>
        <p className="text-[12px] leading-[1.5] text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

type LoadKey = "arming" | "roles" | "departments" | "users" | "catalogue" | "rules";
type LoadState = "loading" | "ok" | "error";

export function DataScopeMatrixDesignPage() {
  // ── server truth ───────────────────────────────────────────────────────
  const [stored, setStored] = React.useState<Map<string, Level>>(() => new Map());
  const [lists, setLists] = React.useState<Map<string, string[]>>(() => new Map());

  // ── the one edit buffer, spanning every population tier ────────────────
  const [draft, setDraft] = React.useState<Map<string, Level>>(() => new Map());

  // ── load ledger: five uncoordinated requests + rules chained behind the
  //    catalogue. They land in any order and each can fail alone. ─────────
  const [load, setLoad] = React.useState<Record<LoadKey, LoadState>>({
    arming: "loading",
    roles: "loading",
    departments: "loading",
    users: "loading",
    catalogue: "loading",
    rules: "loading",
  });

  const [armed, setArmed] = React.useState(false);
  const [arming, setArming] = React.useState(false);
  const [tree, setTree] = React.useState<TreeHealth>(TREE_SEED);
  const [rebuilding, setRebuilding] = React.useState(false);

  const [tier, setTier] = React.useState<Tier>("tenant");
  const [targetId, setTargetId] = React.useState<string | null>(TENANT_TARGET_ID);
  const [narrow, setNarrow] = React.useState("");
  const [issueFilter, setIssueFilter] = React.useState<IssueKind | null>(null);

  const [committing, setCommitting] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const say = React.useCallback((kind: "success" | "error" | "info", message: string) => {
    setToast({ kind, message, id: ++toastId.current });
  }, []);

  // verify
  const [verifyOpen, setVerifyOpen] = React.useState(false);
  const [subject, setSubject] = React.useState<string | null>(null);
  const [entries, setEntries] = React.useState<Map<string, EntryState> | null>(null);
  const runToken = React.useRef(0);

  // named-list editor
  const [listEditor, setListEditor] = React.useState<ListEditorTarget | null>(null);
  const [listStored, setListStored] = React.useState<string[] | null>(null);
  const [listSaving, setListSaving] = React.useState(false);
  const [listError, setListError] = React.useState<string | null>(null);
  const listFailOnce = React.useRef(true);

  // confirmations
  type Pending =
    | { kind: "arm"; next: boolean }
    | { kind: "bulkTarget"; level: Level | null }
    | { kind: "bulkDoc"; level: Level | null; docId: string }
    | { kind: "cascade"; docId: string; level: Level | null }
    | { kind: "discard" };
  const [confirm, setConfirm] = React.useState<Pending | null>(null);
  const cascadeAcknowledged = React.useRef(false);

  // ── the five uncoordinated loads ───────────────────────────────────────
  React.useEffect(() => {
    const ts: number[] = [];
    const land = (k: LoadKey, ms: number, state: LoadState = "ok", after?: () => void) =>
      ts.push(
        window.setTimeout(() => {
          setLoad((l) => ({ ...l, [k]: state }));
          after?.();
        }, ms),
      );

    land("arming", 320);
    land("roles", 540);
    land("users", 760);
    land("catalogue", 940, "ok", () => {
      // stored rules are chained behind the catalogue
      ts.push(
        window.setTimeout(() => {
          const s = buildStoredRules();
          setStored(s);
          setDraft(new Map(s));
          setLists(buildStoredLists());
          setLoad((l) => ({ ...l, rules: "ok" }));
        }, 680),
      );
    });
    // one request fails on its own — the rest of the page stays usable
    land("departments", 1180, "error", () => say("error", "Departments could not be loaded. Every other population loaded normally — retry it from the population list."));

    return () => ts.forEach(window.clearTimeout);
  }, [say]);

  const retryDepartments = () => {
    setLoad((l) => ({ ...l, departments: "loading" }));
    window.setTimeout(() => {
      setLoad((l) => ({ ...l, departments: "ok" }));
      say("success", "Departments loaded.");
    }, 700);
  };

  // ── derived: targets, counts, buffer ───────────────────────────────────
  // Each tier's targets come from its own request. A tier whose request has not
  // landed (or failed) simply has none — the rest of the page carries on.
  const targets = React.useMemo(() => {
    if (tier === "tenant") return targetsFor("tenant");
    const src: LoadKey = tier === "role" ? "roles" : tier === "department" ? "departments" : "users";
    return load[src] === "ok" ? targetsFor(tier) : [];
  }, [tier, load]);

  const tierLoading: Record<Tier, boolean> = {
    tenant: false,
    role: load.roles === "loading",
    department: load.departments === "loading",
    individual: load.users === "loading",
  };
  const tierFailed: Record<Tier, boolean> = {
    tenant: false,
    role: load.roles === "error",
    department: load.departments === "error",
    individual: load.users === "error",
  };
  const tierCounts: Record<Tier, number> = {
    tenant: 1,
    role: load.roles === "ok" ? ROLES.length : 0,
    department: load.departments === "ok" ? DEPARTMENTS.length : 0,
    individual: load.users === "ok" ? USERS.length : 0,
  };

  /** Every key whose draft value differs from the stored value. */
  const dirtyKeys = React.useMemo(() => {
    const out: string[] = [];
    const seen = new Set<string>();
    draft.forEach((v, k) => {
      seen.add(k);
      if (stored.get(k) !== v) out.push(k);
    });
    stored.forEach((_v, k) => {
      if (!seen.has(k)) out.push(k); // cleared to unset
    });
    return out;
  }, [draft, stored]);

  const pendingByTier = React.useMemo(() => {
    const m: Record<Tier, number> = { tenant: 0, role: 0, department: 0, individual: 0 };
    dirtyKeys.forEach((k) => {
      m[unpk(k).tier] += 1;
    });
    return TIER_ORDER.map((t) => ({ tier: t, n: m[t] }));
  }, [dirtyKeys]);

  const tierPending: Record<Tier, number> = React.useMemo(() => {
    const m: Record<Tier, number> = { tenant: 0, role: 0, department: 0, individual: 0 };
    pendingByTier.forEach((p) => (m[p.tier] = p.n));
    return m;
  }, [pendingByTier]);

  /** Targets per tier that carry at least one LIVE (non-default) stored rule. */
  const tierRuleTargets: Record<Tier, number> = React.useMemo(() => {
    const sets: Record<Tier, Set<string>> = { tenant: new Set(), role: new Set(), department: new Set(), individual: new Set() };
    stored.forEach((v, k) => {
      if (v === DEFAULT_LEVEL) return;
      const { tier: t, targetId: ti } = unpk(k);
      sets[t].add(ti);
    });
    return { tenant: sets.tenant.size, role: sets.role.size, department: sets.department.size, individual: sets.individual.size };
  }, [stored]);

  const targetRuleCount = React.useCallback(
    (id: string) => {
      let n = 0;
      stored.forEach((v, k) => {
        if (v === DEFAULT_LEVEL) return;
        const u = unpk(k);
        if (u.tier === tier && u.targetId === id) n += 1;
      });
      return n;
    },
    [stored, tier],
  );

  const targetPendingCount = React.useCallback(
    (id: string) => {
      let n = 0;
      dirtyKeys.forEach((k) => {
        const u = unpk(k);
        if (u.tier === tier && u.targetId === id) n += 1;
      });
      return n;
    },
    [dirtyKeys, tier],
  );

  const liveRuleCount = React.useMemo(() => {
    let n = 0;
    stored.forEach((v) => {
      if (v !== DEFAULT_LEVEL) n += 1;
    });
    return n;
  }, [stored]);

  // ── integrity scan over the whole stored rule set ──────────────────────
  const issuesByKey = React.useMemo(() => {
    const m = new Map<string, IssueKind[]>();
    const consider = (k: string, v: Level | undefined, committed: boolean) => {
      if (v === undefined || v === DEFAULT_LEVEL) return;
      const { docId } = unpk(k);
      const d = DOC_BY.get(docId);
      const out: IssueKind[] = [];
      if (v === "picked") {
        if (!committed) out.push("uncommitted");
        else if ((lists.get(k) ?? []).length === 0) out.push("blackout");
      }
      if (v === "subordinates" && tree.status !== "healthy") out.push("tree");
      if (d && !d.enforced) out.push("unenforced");
      if (out.length) m.set(k, out);
    };
    // the scan runs on what will BE stored — the draft — so a fix reads immediately
    draft.forEach((v, k) => consider(k, v, stored.get(k) === v));
    return m;
  }, [draft, stored, lists, tree.status]);

  const issueCounts = React.useMemo(() => {
    const c: Record<IssueKind, number> = { unenforced: 0, blackout: 0, uncommitted: 0, tree: 0 };
    issuesByKey.forEach((ks) => ks.forEach((k) => (c[k] += 1)));
    return c;
  }, [issuesByKey]);

  const totalIssues = issuesByKey.size;

  // ── individual tier: auto-choose the first person who already has rules ─
  React.useEffect(() => {
    if (tier !== "individual" || targetId !== null || load.users !== "ok") return;
    const withRules = USERS.find((u) => targetRuleCount(u.id) > 0);
    if (withRules) setTargetId(withRules.id);
  }, [tier, targetId, load.users, targetRuleCount]);

  const configuredIndividuals = tierRuleTargets.individual;

  // ── tier switching: keeps the buffer, drops the view state ─────────────
  const switchTier = (t: Tier) => {
    if (t === tier) return;
    setTier(t);
    setNarrow("");
    setIssueFilter(null);
    setEntries(null); // a resolution result must never be shown under a changed context
    setTargetId(t === "tenant" ? TENANT_TARGET_ID : t === "individual" ? null : targetsFor(t)[0]?.id ?? null);
  };

  const selectTarget = (id: string | null) => {
    setTargetId(id);
    if (tier === "individual" && id) {
      setSubject(id); // the resolution subject follows the authoring subject
      setEntries(null);
    }
  };

  // ── the narrowed view (display only — never what bulk/commit act on) ────
  const visibleDocs = React.useMemo(() => {
    const s = narrow.trim().toLowerCase();
    let list = s ? CATALOGUE.filter((d) => d.label.toLowerCase().includes(s)) : CATALOGUE;
    if (issueFilter && targetId) {
      list = list.filter((d) => (issuesByKey.get(pk(tier, targetId, d.id)) ?? []).includes(issueFilter));
    }
    return list;
  }, [narrow, issueFilter, issuesByKey, tier, targetId]);

  // ── writes into the buffer ─────────────────────────────────────────────
  const applyEdits = (edits: { key: string; level: Level | null }[]) => {
    setDraft((d) => {
      const n = new Map(d);
      edits.forEach(({ key, level }) => {
        if (level === null) n.delete(key);
        else n.set(key, level);
      });
      return n;
    });
  };

  /** The individual-tier cascade — KEPT, because the engine depends on the other
   *  tiers reading as an explicit default, but now confirmed and reported. */
  const cascadeTargets = (docId: string) => {
    const keys: string[] = [pk("tenant", TENANT_TARGET_ID, docId)];
    ROLES.forEach((r) => keys.push(pk("role", r.id, docId)));
    DEPARTMENTS.forEach((d) => keys.push(pk("department", d.id, docId)));
    return keys;
  };

  const setPairing = (docId: string, level: Level | null) => {
    if (!targetId) return;
    if (tier === "individual") {
      if (!cascadeAcknowledged.current) {
        setConfirm({ kind: "cascade", docId, level });
        return;
      }
      commitIndividualEdit(docId, level);
      return;
    }
    applyEdits([{ key: pk(tier, targetId, docId), level }]);
  };

  const commitIndividualEdit = (docId: string, level: Level | null) => {
    if (!targetId) return;
    const collateral = cascadeTargets(docId);
    applyEdits([{ key: pk("individual", targetId, docId), level }, ...collateral.map((key) => ({ key, level: DEFAULT_LEVEL as Level | null }))]);
    say(
      "info",
      `${DOC_BY.get(docId)?.label} was also reset to “Entire organisation” for the tenant-wide rule, all ${ROLES.length} roles and all ${DEPARTMENTS.length} departments — ${collateral.length} collateral edits now in the buffer.`,
    );
  };

  const bulkAcrossDocs = (level: Level | null) => {
    if (!targetId) return;
    applyEdits(CATALOGUE.map((d) => ({ key: pk(tier, targetId, d.id), level })));
    say("success", `${level === null ? "Cleared" : `Set “${LEVEL_BY[level].label}” on`} all ${TOTAL_DOCS} document types for ${currentTargetName}. Nothing is written until you commit.`);
  };

  const bulkAcrossTargets = (docId: string, level: Level | null) => {
    applyEdits(targets.map((t) => ({ key: pk(tier, t.id, docId), level })));
    say("success", `${DOC_BY.get(docId)?.label} ${level === null ? "cleared" : `set to “${LEVEL_BY[level].label}”`} for all ${targets.length} ${TIER_META[tier].unit}s. Nothing is written until you commit.`);
  };

  const currentTarget = targets.find((t) => t.id === targetId) ?? null;
  const currentTargetName = currentTarget?.name ?? "—";

  // ── commit: one write for the whole buffer, then a full re-read ────────
  const doCommit = () => {
    setCommitting(true);
    const n = dirtyKeys.length;
    window.setTimeout(() => {
      const next = new Map(draft);
      setStored(next);
      setDraft(new Map(next));
      setCommitting(false);
      cascadeAcknowledged.current = false;

      // the re-read may re-select whichever tier actually holds live rules
      const holders: Record<Tier, number> = { tenant: 0, role: 0, department: 0, individual: 0 };
      next.forEach((v, k) => {
        if (v !== DEFAULT_LEVEL) holders[unpk(k).tier] += 1;
      });
      const richest = TIER_ORDER.slice().sort((a, b) => holders[b] - holders[a])[0];
      if (holders[richest] > 0 && richest !== tier) {
        setTier(richest);
        setNarrow("");
        setIssueFilter(null);
        setTargetId(richest === "tenant" ? TENANT_TARGET_ID : richest === "individual" ? null : targetsFor(richest)[0]?.id ?? null);
        say("success", `${n} changes committed across every population. Re-read from the server put you on ${TIER_META[richest].label}, which now holds the most live rules.`);
      } else {
        say("success", `${n} changes committed across every population.`);
      }
      setEntries(null);
    }, 1100);
  };

  const doDiscard = () => {
    setDraft(new Map(stored));
    cascadeAcknowledged.current = false;
    say("success", "Every unsaved edit was dropped, in every population.");
  };

  // ── arming ─────────────────────────────────────────────────────────────
  const doArm = (next: boolean) => {
    setArming(true);
    window.setTimeout(() => {
      setArming(false);
      setArmed(next);
      say(
        "success",
        next
          ? `Enforcement is on. All ${liveRuleCount} committed rules are live tenant-wide from this moment.`
          : "Enforcement is off. Every rule is stored but applied by nothing.",
      );
    }, 850);
  };

  // ── supervisor-tree rebuild ────────────────────────────────────────────
  const doRebuild = () => {
    setRebuilding(true);
    window.setTimeout(() => {
      setTree(TREE_AFTER_REBUILD);
      setRebuilding(false);
      say(
        "success",
        `Supervisor tree rebuilt: ${TREE_AFTER_REBUILD.rows} ancestry rows from ${TREE_AFTER_REBUILD.links} supervisor links, ${TREE_AFTER_REBUILD.brokenChains} broken chains, ${TREE_AFTER_REBUILD.noLogin} employees with no login.`,
      );
    }, 1400);
  };

  // ── verify ─────────────────────────────────────────────────────────────
  const openVerify = () => {
    setVerifyOpen(true);
    if (!subject) setSubject(tier === "individual" && targetId ? targetId : USERS[0].id);
  };

  const changeSubject = (id: string) => {
    setSubject(id);
    setEntries(null); // never show a stale reading under a new name
  };

  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const resolveOne = React.useCallback(
    (docId: string, token: number, forceFail: boolean) => {
      const delay = 180 + Math.random() * 1900;
      timers.current.push(
        window.setTimeout(() => {
          if (runToken.current !== token) return;
          setEntries((prev) => {
            if (!prev) return prev;
            const n = new Map(prev);
            if (forceFail) n.set(docId, { status: "failed" });
            else {
              const u = subject ? USER_BY.get(subject) : null;
              n.set(docId, u ? { status: "done", res: resolveFor(u, docId, stored) } : { status: "failed" });
            }
            return n;
          });
        }, delay),
      );
    },
    [subject, stored],
  );

  const runResolution = () => {
    if (!subject) return;
    const token = ++runToken.current;
    // paints immediately as a full set of unresolved entries
    setEntries(new Map(CATALOGUE.map((d) => [d.id, { status: "pending" } as EntryState])));
    // a handful of requests fail — a failure must never look like a result
    const failing = new Set([CATALOGUE[11].id, CATALOGUE[47].id, CATALOGUE[93].id]);
    CATALOGUE.forEach((d) => resolveOne(d.id, token, failing.has(d.id)));
  };

  const running = entries ? Array.from(entries.values()).some((e) => e.status === "pending") : false;

  const retryEntry = (docId: string) => {
    setEntries((prev) => {
      if (!prev) return prev;
      const n = new Map(prev);
      n.set(docId, { status: "pending" });
      return n;
    });
    resolveOne(docId, runToken.current, false);
  };

  // ── named list ─────────────────────────────────────────────────────────
  const openList = (docId: string) => {
    if (!targetId) return;
    const key = pk(tier, targetId, docId);
    setListEditor({ key, docLabel: DOC_BY.get(docId)?.label ?? docId, targetLabel: currentTargetName, tier });
    setListStored(null);
    setListError(null);
    // the stored selection arrives a moment after the editor opens
    window.setTimeout(() => setListStored(lists.get(key) ?? []), 900);
  };

  const saveList = (ids: string[]) => {
    if (!listEditor) return;
    setListSaving(true);
    window.setTimeout(() => {
      setListSaving(false);
      if (listFailOnce.current) {
        listFailOnce.current = false;
        setListError("The list could not be written. Nothing was changed and your selection is still here — try again.");
        return;
      }
      setLists((m) => {
        const n = new Map(m);
        n.set(listEditor.key, ids);
        return n;
      });
      setListEditor(null);
      say("success", ids.length === 0 ? `${listEditor.docLabel}: the named list is now empty — that pairing is a blackout.` : `${listEditor.docLabel}: ${ids.length} people named.`);
    }, 950);
  };

  // ── assignment surface state ───────────────────────────────────────────
  const surfaceLoading = load.catalogue !== "ok" || load.rules !== "ok";
  const hasTarget = !!targetId && (tier === "tenant" || targets.length > 0);
  // The individual tier addresses exactly one target at a time, so there is no
  // transpose to offer there — only tiers with many simultaneous targets get it.
  const transposeLabel = tier !== "individual" && targets.length > 1 ? `${targets.length} ${TIER_META[tier].unit}s` : null;

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Access Control</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Data Scope Matrix</span>
        </>
      }
      overlay={
        <>
          <CommitFooter
            tier={tier}
            targetCount={tierCounts[tier]}
            dirty={dirtyKeys.length}
            pendingByTier={pendingByTier}
            saving={committing}
            onCommit={doCommit}
            onDiscard={() => setConfirm({ kind: "discard" })}
          />
          <Toast toast={toast} onDismiss={() => setToast(null)} />
          <VerifyDrawer
            open={verifyOpen}
            onClose={() => setVerifyOpen(false)}
            subject={subject}
            onSubject={changeSubject}
            entries={entries}
            onRun={runResolution}
            onRetryEntry={retryEntry}
            running={running}
            dirtyCount={dirtyKeys.length}
            armed={armed}
          />
          {listEditor && (
            <NamedListEditor
              target={listEditor}
              stored={listStored}
              saving={listSaving}
              error={listError}
              onSave={saveList}
              onClose={() => setListEditor(null)}
            />
          )}
          {confirm && <ConfirmHost pending={confirm} close={() => setConfirm(null)} ctx={{ armed, liveRuleCount, totalDocs: TOTAL_DOCS, narrow, visible: visibleDocs.length, targetName: currentTargetName, tier, targetCount: targets.length, dirty: dirtyKeys.length, rolesN: ROLES.length, deptsN: DEPARTMENTS.length }} run={{ arm: doArm, bulkDocs: bulkAcrossDocs, bulkTargets: bulkAcrossTargets, cascade: (docId, level) => { cascadeAcknowledged.current = true; commitIndividualEdit(docId, level); }, discard: doDiscard }} />}
        </>
      }
    >
      <TrustBand
        armed={armed}
        arming={arming}
        onToggleArm={(next) => setConfirm({ kind: "arm", next })}
        tree={tree}
        onRebuild={doRebuild}
        rebuilding={rebuilding}
        issueCounts={issueCounts}
        totalIssues={totalIssues}
        activeIssue={issueFilter}
        liveRules={liveRuleCount}
        onOpenVerify={openVerify}
        onJumpToIssue={(k) => {
          setIssueFilter((cur) => (cur === k ? null : k));
          setNarrow("");
        }}
      />

      <div
        className={cn(
          "grid grid-cols-1 gap-4 px-4 pb-16 pt-4 md:px-6 lg:grid-cols-[318px_minmax(0,1fr)] lg:items-start xl:grid-cols-[344px_minmax(0,1fr)]",
          committing && "pointer-events-none opacity-60",
        )}
      >
        <PopulationRail
          tier={tier}
          onTier={switchTier}
          tierCounts={tierCounts}
          tierLoading={tierLoading}
          tierFailed={tierFailed}
          onRetryDepartments={retryDepartments}
          tierRuleTargets={tierRuleTargets}
          tierPending={tierPending}
          targets={targets}
          selectedTarget={targetId}
          onSelectTarget={selectTarget}
          targetRuleCount={targetRuleCount}
          targetPendingCount={targetPendingCount}
          configuredIndividuals={configuredIndividuals}
          pendingByTier={pendingByTier}
        />

        {/* ── the assignment surface ───────────────────────────────────── */}
        <div className={cn(CARD, "min-w-0 overflow-hidden")}>
          {/* target identity + bulk across the full catalogue */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bz-line-soft px-4 py-3">
            <div className="min-w-0">
              <p className={LABEL}>{TIER_META[tier].label}</p>
              <p className="mt-1 truncate text-[15px] font-semibold text-bz-text">{hasTarget ? currentTargetName : "No target chosen"}</p>
              {hasTarget && (
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-bz-text-muted">
                  <span>
                    <Count n={targetRuleCount(targetId!)} /> live rules stored
                  </span>
                  {targetPendingCount(targetId!) > 0 && (
                    <>
                      <span className="text-bz-text-soft">·</span>
                      <span className="font-medium text-bz-text">
                        <span className={NUM}>{targetPendingCount(targetId!)}</span> unsaved here
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
            <BulkMenu
              label={`Set all ${TOTAL_DOCS}`}
              icon={<Wand2 size={13} />}
              title={`Every document type for ${currentTargetName}`}
              hint={`Applies one level to all ${TOTAL_DOCS} document types — the full catalogue, not the ${visibleDocs.length} shown. It lands in the unsaved buffer.`}
              onPick={(l) => setConfirm({ kind: "bulkTarget", level: l })}
              disabled={!hasTarget || surfaceLoading}
            />
          </div>

          {/* narrowing + coverage + issue filter */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-bz-line-soft bg-bz-paper-warm px-4 py-2.5">
            <SearchField value={narrow} onChange={setNarrow} placeholder="Narrow document types…" className="h-8 w-full bg-bz-surface sm:w-[240px]" />
            <p className="text-[11.5px] text-bz-text-muted">
              Showing <Count n={visibleDocs.length} /> of <Count n={TOTAL_DOCS} /> document types
            </p>
            {issueFilter && (
              <button
                onClick={() => setIssueFilter(null)}
                className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-fire px-2 py-0.5 text-[11px] font-medium text-bz-text"
              >
                {ISSUE_META[issueFilter].label}
                <X size={10} />
              </button>
            )}
            {narrow.trim() && (
              <p className="flex items-center gap-1.5 text-[11px] text-bz-text-muted">
                <Info size={11} className="shrink-0 text-bz-text-soft" />
                Narrowing changes what you see only — bulk, commit and resolve still reach all {TOTAL_DOCS}.
              </p>
            )}
          </div>

          {/* body — the ONLY region the load occlusion covers */}
          {surfaceLoading ? (
            <SurfaceSkeleton />
          ) : tierFailed[tier] ? (
            <div className="flex flex-col items-center gap-2 px-8 py-20 text-center">
              <span className="flex size-11 items-center justify-center rounded-bz-pill bg-[#FBE7E5] text-[#9A2E29]">
                <Ban size={19} />
              </span>
              <p className="text-[13px] font-medium text-bz-text">No {TIER_META[tier].unit}s to write against</p>
              <p className="max-w-[40ch] text-[11.5px] leading-[1.55] text-bz-text-muted">
                The catalogue and your stored rules loaded fine — only this population's request failed. Retry it, or switch to a population that
                loaded.
              </p>
              <GhostButton onClick={retryDepartments} className="mt-1">
                <RefreshCw size={11} /> Retry
              </GhostButton>
            </div>
          ) : !hasTarget ? (
            <div className="flex flex-col items-center gap-2 px-8 py-20 text-center">
              <span className="flex size-11 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted">
                <UserRound size={19} />
              </span>
              <p className="text-[13px] font-medium text-bz-text">Pick a person first</p>
              <p className="max-w-[38ch] text-[11.5px] leading-[1.55] text-bz-text-muted">
                Rules on this tier are written against one named individual. Until someone is chosen there is no pairing to author.
              </p>
            </div>
          ) : visibleDocs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-8 py-20 text-center">
              <SearchX size={19} className="text-bz-text-soft" />
              <p className="text-[13px] font-medium text-bz-text">
                {issueFilter ? "No rule here has that problem" : `No document type matches “${narrow}”`}
              </p>
              <p className="max-w-[38ch] text-[11.5px] leading-[1.55] text-bz-text-muted">
                {issueFilter
                  ? `${currentTargetName} has no “${ISSUE_META[issueFilter].label}” rule. Other targets may — clear the filter or switch target.`
                  : `All ${TOTAL_DOCS} are still here and still reachable by bulk assignment, commit and resolution.`}
              </p>
              <GhostButton
                onClick={() => {
                  setNarrow("");
                  setIssueFilter(null);
                }}
                className="mt-1"
              >
                Clear
              </GhostButton>
            </div>
          ) : (
            <div>
              {visibleDocs.map((d) => {
                const key = pk(tier, targetId!, d.id);
                const val = draft.get(key);
                const committed = stored.get(key);
                return (
                  <DocRow
                    key={d.id}
                    doc={d}
                    value={val}
                    edited={committed !== val}
                    issues={(issuesByKey.get(key) ?? []).map((kind) => ({ kind }))}
                    namedCount={lists.get(key)?.length ?? null}
                    canOpenList={committed === "picked"}
                    onPick={(l) => setPairing(d.id, l)}
                    onClear={() => setPairing(d.id, null)}
                    onOpenList={() => {
                      if (committed !== "picked") {
                        say("error", `${d.label}: the named list is stored under the rule record, which does not exist yet. Commit this pairing first, then name the people.`);
                        return;
                      }
                      openList(d.id);
                    }}
                    transposeLabel={transposeLabel}
                    onTranspose={(l) => setConfirm({ kind: "bulkDoc", level: l, docId: d.id })}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM HOST  ·  turns each pending intent into its own honest sentence
// ════════════════════════════════════════════════════════════════════════════

function ConfirmHost({
  pending,
  close,
  ctx,
  run,
}: {
  pending:
    | { kind: "arm"; next: boolean }
    | { kind: "bulkTarget"; level: Level | null }
    | { kind: "bulkDoc"; level: Level | null; docId: string }
    | { kind: "cascade"; docId: string; level: Level | null }
    | { kind: "discard" };
  close: () => void;
  ctx: {
    armed: boolean;
    liveRuleCount: number;
    totalDocs: number;
    narrow: string;
    visible: number;
    targetName: string;
    tier: Tier;
    targetCount: number;
    dirty: number;
    rolesN: number;
    deptsN: number;
  };
  run: {
    arm: (next: boolean) => void;
    bulkDocs: (l: Level | null) => void;
    bulkTargets: (docId: string, l: Level | null) => void;
    cascade: (docId: string, l: Level | null) => void;
    discard: () => void;
  };
}) {
  const levelName = (l: Level | null) => (l === null ? "Not set" : LEVEL_BY[l].label);

  if (pending.kind === "arm") {
    const on = pending.next;
    return (
      <ConfirmDialog
        tone="danger"
        title={on ? "Arm row-level visibility for the whole tenant?" : "Turn enforcement off for the whole tenant?"}
        confirmLabel={on ? "Arm enforcement" : "Turn off"}
        onCancel={close}
        onConfirm={() => {
          close();
          run.arm(on);
        }}
        body={
          on ? (
            <>
              <p>
                All <span className="font-semibold text-bz-text">{ctx.liveRuleCount}</span> committed rules become live at once, everywhere. There is
                no staged or per-module rollout.
              </p>
              <p>
                Historical rows with no recorded owner stay visible for most document types but <span className="font-semibold text-bz-text">disappear for HR ones</span> — payroll,
                salary slips, appraisals. This is the moment the risk is highest.
              </p>
              <p>Rules on unenforced document types stay inert. They will not begin working now.</p>
            </>
          ) : (
            <p>
              Every rule stays stored exactly as written, and none of them will be applied to anybody. Users immediately see everything again.
            </p>
          )
        }
      />
    );
  }

  if (pending.kind === "bulkTarget") {
    return (
      <ConfirmDialog
        tone="danger"
        title={`Set every document type to “${levelName(pending.level)}”?`}
        confirmLabel={`Apply to all ${ctx.totalDocs}`}
        onCancel={close}
        onConfirm={() => {
          close();
          run.bulkDocs(pending.level);
        }}
        body={
          <>
            <p>
              This writes <span className="font-semibold text-bz-text">{ctx.targetName}</span> against all{" "}
              <span className="font-semibold text-bz-text">{ctx.totalDocs}</span> document types.
            </p>
            {ctx.narrow.trim() && (
              <p className="rounded-bz-md bg-[#FBE7E5] px-2.5 py-2 text-[#9A2E29]">
                Your search is showing only {ctx.visible} of them. This action reaches all {ctx.totalDocs} — including the {ctx.totalDocs - ctx.visible} you
                cannot currently see.
              </p>
            )}
            <p>There is no undo. It lands in the unsaved buffer and is written on the next commit.</p>
          </>
        }
      />
    );
  }

  if (pending.kind === "bulkDoc") {
    return (
      <ConfirmDialog
        tone="danger"
        title={`Set ${DOC_BY.get(pending.docId)?.label} to “${levelName(pending.level)}” for every ${TIER_META[ctx.tier].unit}?`}
        confirmLabel={`Apply to all ${ctx.targetCount}`}
        onCancel={close}
        onConfirm={() => {
          close();
          run.bulkTargets(pending.docId, pending.level);
        }}
        body={
          <>
            <p>
              Overwrites whatever all <span className="font-semibold text-bz-text">{ctx.targetCount}</span> {TIER_META[ctx.tier].unit}s currently have
              for this one document type, and creates a record for the ones that had none.
            </p>
            <p>There is no undo.</p>
          </>
        }
      />
    );
  }

  if (pending.kind === "cascade") {
    return (
      <ConfirmDialog
        tone="danger"
        title="Editing one person rewrites the tiers above them"
        confirmLabel="I understand — edit anyway"
        onCancel={close}
        onConfirm={() => {
          close();
          run.cascade(pending.docId, pending.level);
        }}
        body={
          <>
            <p>
              Setting <span className="font-semibold text-bz-text">{DOC_BY.get(pending.docId)?.label}</span> for one individual also forces that same
              document type back to <span className="font-semibold text-bz-text">“Entire organisation”</span> for the tenant-wide rule, for all{" "}
              {ctx.rolesN} roles and for all {ctx.deptsN} departments.
            </p>
            <p>
              That overwrites values those tiers already had and materialises records for targets that had none — {1 + ctx.rolesN + ctx.deptsN} extra
              edits per document type you touch here.
            </p>
            <p className="text-bz-text-soft">Asked once per session. Every cascade after this is reported in a message instead.</p>
          </>
        }
      />
    );
  }

  return (
    <ConfirmDialog
      tone="danger"
      title={`Drop all ${ctx.dirty} unsaved edits?`}
      confirmLabel="Discard everything"
      onCancel={close}
      onConfirm={() => {
        close();
        run.discard();
      }}
      body={
        <p>
          The buffer spans every population, not just the one you are looking at. Discarding drops work under tiers that are not currently on
          screen.
        </p>
      }
    />
  );
}
