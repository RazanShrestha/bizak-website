import { createStore } from "../../sales/store";

// ════════════════════════════════════════════════════════════════════════════
// LOCATIONS — tier 2, a sheet (spec §4.5 Location; SMM §5.1)
//
// LOCATION → MAST_INVENTORY_LOCATION_SETUP. Shown: LOCATION_NAME (≤ 100, the
// entity's limit), LOCATION_TYPE (None 0 / Store 1 / Warehouse 2), ADDRESS
// (required), PARENT_ID, DESCRIPTION, and in "More" the prefixes, capacities,
// THRESSHOLD (sic), FISCAL_YEAR text, LATITUDE / LONGITUDE. Not shown:
// IS_INVENTORY_AVAILABLE and USE_BINS — nothing reads them (dead switches).
//
// Rows: the sales mockup's three (so documents and the master agree) and the
// dev tenant's ZZ-CLAUDE locations the item master's dev items stock at.
// `itemsInStock` is what the availability read would answer (the sheet's
// "Holds stock of N items").
// ════════════════════════════════════════════════════════════════════════════

export type LocationType = "none" | "store" | "warehouse";

export type MasterLocation = {
  id: string;
  /** LOCATION_NAME */
  name: string;
  /** LOCATION_TYPE */
  type: LocationType;
  /** ADDRESS */
  address: string;
  /** PARENT_ID */
  parent: string | null;
  /** DESCRIPTION */
  description: string;
  /** DOCUMENT_NUMBER_PREFIX */
  docPrefix: string;
  /** TRANSACTION_NUMBER_PREFIX */
  txnPrefix: string;
  /** MIN_STORAGE_CAPACITY / MAX_STORAGE_CAPACITY */
  minCapacity: number | null;
  maxCapacity: number | null;
  /** THRESSHOLD */
  threshold: number | null;
  /** FISCAL_YEAR — free text. */
  fiscalYear: string;
  /** LATITUDE / LONGITUDE */
  latitude: number | null;
  longitude: number | null;
  /** IS_INACTIVE */
  archived: boolean;
  /** LOCATION_MAP_ORGANISATION */
  orgs: string[];
  /** APPLY_TO_CHILD */
  applyToChild?: boolean;
  /** B-C3 over LOCATION_ID, by table label. */
  usage: { label: string; count: number }[];
  /** Items with stock here (the availability read). */
  itemsInStock: number;
};

export const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: "warehouse", label: "Warehouse" },
  { value: "store", label: "Store" },
  { value: "none", label: "None" },
];

const L = (p: Partial<MasterLocation> & Pick<MasterLocation, "id" | "name" | "type" | "address">): MasterLocation => ({
  parent: null,
  description: "",
  docPrefix: "",
  txnPrefix: "",
  minCapacity: null,
  maxCapacity: null,
  threshold: null,
  fiscalYear: "",
  latitude: null,
  longitude: null,
  archived: false,
  orgs: ["186"],
  usage: [],
  itemsInStock: 0,
  ...p,
});

export const LOCATION_SEED: MasterLocation[] = [
  L({ id: "L-KTM", name: "Kathmandu WH", type: "warehouse", address: "Balaju Industrial Area, Kathmandu", docPrefix: "KTM", txnPrefix: "KTM-", maxCapacity: 12000, threshold: 80, fiscalYear: "2083/84", latitude: 27.7349, longitude: 85.3042, usage: [{ label: "Deliveries", count: 212 }, { label: "Invoices", count: 180 }, { label: "Item receipts", count: 64 }], itemsInStock: 32 }),
  L({ id: "L-PKR", name: "Pokhara depot", type: "warehouse", address: "Lakeside-6, Pokhara", orgs: ["194"], docPrefix: "PKR", usage: [{ label: "Deliveries", count: 58 }, { label: "Invoices", count: 41 }], itemsInStock: 11 }),
  L({ id: "L-BTW", name: "Butwal depot", type: "warehouse", address: "Traffic Chowk, Butwal", usage: [{ label: "Deliveries", count: 37 }, { label: "Transfer orders", count: 9 }], itemsInStock: 6 }),
  L({ id: "L-MAIN", name: "Main Store", type: "store", address: "Tripureshwor, Kathmandu", parent: "L-KTM", description: "Counter sales", usage: [{ label: "Invoices", count: 96 }, { label: "Receipts", count: 70 }], itemsInStock: 18 }),
  L({ id: "L-WH1E", name: "ZZ-CLAUDE-QA-WH1 East", type: "warehouse", address: "QA — East wing", usage: [{ label: "Deliveries", count: 4 }, { label: "Inventory adjustments", count: 2 }], itemsInStock: 1 }),
  L({ id: "L-A186", name: "ZZ-CLAUDE-LOC-A186", type: "warehouse", address: "QA — Block A", usage: [{ label: "Item receipts", count: 3 }], itemsInStock: 1 }),
  L({ id: "L-B186", name: "ZZ-CLAUDE-LOC-B186", type: "none", address: "QA — Block B", parent: "L-A186", usage: [], itemsInStock: 0 }),
  L({ id: "L-OLD", name: "Old Thamel shop", type: "store", address: "Thamel, Kathmandu", archived: true, usage: [{ label: "Invoices", count: 12 }], itemsInStock: 0 }),
];

export const locationStore = createStore<MasterLocation[]>(LOCATION_SEED);
export const locationUsed = (l: MasterLocation) => l.usage.reduce((s, u) => s + u.count, 0);

/** B-C8 adds the check the location save lacks today (no cycle, no self-parent). */
export const LOCATION_CYCLE = "A location can't sit under itself or one of its own sub-locations.";

let seq = 0;
export const newLocationId = () => `L-NEW-${++seq}`;
