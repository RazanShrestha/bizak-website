import { createStore } from "../../sales/store";

// ════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS — tier 3, a tree edited in the row (spec §4.5 Department; SMM §5.3)
//
// DEPARTMENT → MAST_DEPARTMENT_SETUP: DEPARTMENT_NAME (required; the old form
// caps it at 75), DESCRIPTION, PARENT_ID, IS_INACTIVE. No code. The server
// walks the parent chain and refuses a loop with its own sentence
// (DepartmentServiceImpl, below). 11 live rows in a two-level tree, like dev.
// ════════════════════════════════════════════════════════════════════════════

export type Department = {
  id: string;
  /** DEPARTMENT_NAME */
  name: string;
  /** PARENT_ID */
  parent: string | null;
  /** DESCRIPTION */
  description: string;
  /** IS_INACTIVE */
  archived: boolean;
  /** DEPARTMENT_MAP_ORGANISATION */
  orgs: string[];
  /** B-C3 over DEPARTMENT_ID, by table label (documents, items, GL rows). */
  usage: { label: string; count: number }[];
};

const D = (id: string, name: string, parent: string | null, usage: Department["usage"], description = "", archived = false): Department => ({
  id,
  name,
  parent,
  description,
  archived,
  orgs: ["186", "194"],
  usage,
});

export const DEPARTMENT_SEED: Department[] = [
  D("d-sales", "Sales", null, [{ label: "Sales orders", count: 12 }, { label: "Invoices", count: 9 }], "All selling teams"),
  D("d-ent", "Enterprise sales", "d-sales", [{ label: "Sales orders", count: 31 }, { label: "Invoices", count: 26 }], "Key accounts, projects"),
  D("d-retail", "Retail", "d-sales", [{ label: "Invoices", count: 84 }, { label: "Receipts", count: 60 }], "Counter and walk-in"),
  D("d-ops", "Operations", null, [{ label: "Journal vouchers", count: 4 }]),
  D("d-wh", "Warehouse", "d-ops", [{ label: "Deliveries", count: 47 }, { label: "Inventory adjustments", count: 6 }]),
  D("d-log", "Logistics", "d-ops", [{ label: "Deliveries", count: 18 }]),
  D("d-proc", "Procurement", "d-ops", [{ label: "Purchase orders", count: 22 }, { label: "Bills", count: 19 }]),
  D("d-fin", "Finance", null, [{ label: "Journal vouchers", count: 41 }]),
  D("d-acc", "Accounts", "d-fin", [{ label: "Journal vouchers", count: 63 }, { label: "Payments", count: 25 }]),
  D("d-hr", "Human resources", null, [{ label: "Employees", count: 14 }]),
  D("d-admin", "Administration", null, []),
  D("d-events", "Trade fair 2025", "d-sales", [{ label: "Invoices", count: 5 }], "", true),
];

export const departmentStore = createStore<Department[]>(DEPARTMENT_SEED);
export const departmentUsed = (d: Department) => d.usage.reduce((s, u) => s + u.count, 0);

/** DepartmentServiceImpl's refusal for a move under itself or its own branch — verbatim. */
export const DEPARTMENT_CYCLE = "A department can't be moved under one of its own sub-departments.";

/** Every department under `id`, at any depth. */
export function descendantsOf(all: Department[], id: string): Department[] {
  const out: Department[] = [];
  const walk = (p: string) => all.filter((d) => d.parent === p).forEach((d) => (out.push(d), walk(d.id)));
  walk(id);
  return out;
}

let seq = 0;
export const newDepartmentId = () => `d-new-${++seq}`;
