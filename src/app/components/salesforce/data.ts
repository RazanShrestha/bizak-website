// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE v2 · SEED — plain data, no imports
//
// The sales seed (sales/orders.tsx) imports CUSTOMERS and ITEMS from here, so a
// dealer's portal order approved in the Orders hub becomes a real SO-… on the
// sales desk. Nothing here imports another module (a cycle would leave one side
// undefined at load).
//
// What each shape stands for in the app (SFM-V2-BLUEPRINT §4):
//   CustomerType   new master — decides price list, credit policy, playbook, portal, DMS
//   Customer       the existing VISIT customer + type, parent ("served by"), tier, territory, rep
//   Territory      the existing AREA tree (Region › Area › Territory)
//   Product        ITEM + brand + category
//   Scheme         the new scheme master (replaces the POS-only BRANDING_SCHEME)
//   HubOrder       a SALES_ORDER before approval, with its source channel
// ════════════════════════════════════════════════════════════════════════════

export const SF_TODAY = "2026-09-04";
export const SF_NOW = "14:10";

// ── Customer types ──────────────────────────────────────────────────────────

export type Level = "primary" | "secondary" | "direct";
export type Portal = "dealer" | "retailer" | "none";
export type CustomerType = {
  id: string;
  name: string;
  plural: string;
  level: Level;
  /** % off the list price — the type's default price list. */
  priceOff: number;
  creditDays: number;
  /** hard = the order is refused over the limit; soft = it goes to review. */
  creditStop: "hard" | "soft";
  portal: Portal;
  /** The customer sells on to its own customers (DMS — secondary sales). */
  ownCustomers: boolean;
  playbookId: string | null;
  /** Visits per 4 weeks; 0 = not visited by reps. */
  visitsPer4w: number;
  color: number;
  blurb: string;
};

export const CUSTOMER_TYPES: CustomerType[] = [
  { id: "T-SS", name: "Super-stockist", plural: "Super-stockists", level: "primary", priceOff: 16, creditDays: 45, creditStop: "soft", portal: "dealer", ownCustomers: true, playbookId: "PB-DIST", visitsPer4w: 2, color: 1, blurb: "Regional bulk node that supplies distributors." },
  { id: "T-DIST", name: "Distributor", plural: "Distributors", level: "primary", priceOff: 12, creditDays: 30, creditStop: "soft", portal: "dealer", ownCustomers: true, playbookId: "PB-DIST", visitsPer4w: 4, color: 2, blurb: "Buys from you, stocks, and sells to retailers in its territory." },
  { id: "T-DEAL", name: "Dealer", plural: "Dealers", level: "primary", priceOff: 9, creditDays: 21, creditStop: "hard", portal: "dealer", ownCustomers: false, playbookId: "PB-DEAL", visitsPer4w: 4, color: 3, blurb: "Buys direct and sells to shops and end customers." },
  { id: "T-WHOL", name: "Wholesaler", plural: "Wholesalers", level: "secondary", priceOff: 6, creditDays: 15, creditStop: "hard", portal: "dealer", ownCustomers: false, playbookId: "PB-RET", visitsPer4w: 4, color: 4, blurb: "Bulk buyer that serves smaller shops." },
  { id: "T-RET", name: "Retailer", plural: "Retailers", level: "secondary", priceOff: 0, creditDays: 7, creditStop: "hard", portal: "retailer", ownCustomers: false, playbookId: "PB-RET", visitsPer4w: 4, color: 5, blurb: "Independent shop — visited by reps, served by a distributor." },
  { id: "T-MT", name: "Modern trade", plural: "Modern trade", level: "primary", priceOff: 10, creditDays: 45, creditStop: "soft", portal: "none", ownCustomers: false, playbookId: "PB-MT", visitsPer4w: 8, color: 6, blurb: "Supermarket chains — central buying, merchandisers in store." },
  { id: "T-HRC", name: "HoReCa", plural: "HoReCa", level: "direct", priceOff: 4, creditDays: 15, creditStop: "soft", portal: "none", ownCustomers: false, playbookId: "PB-HRC", visitsPer4w: 2, color: 7, blurb: "Hotels, restaurants and caterers." },
  { id: "T-INST", name: "Institution", plural: "Institutions", level: "direct", priceOff: 0, creditDays: 30, creditStop: "soft", portal: "none", ownCustomers: false, playbookId: null, visitsPer4w: 1, color: 8, blurb: "Offices, schools, hospitals — buy by quotation." },
];

// ── Territories (the AREA tree) ─────────────────────────────────────────────

export type Territory = { id: string; name: string; parentId: string | null; level: "region" | "area" | "territory" };
export const TERRITORIES: Territory[] = [
  { id: "R-BAG", name: "Bagmati", parentId: null, level: "region" },
  { id: "A-KTM", name: "Kathmandu", parentId: "R-BAG", level: "area" },
  { id: "A-LTP", name: "Lalitpur & Bhaktapur", parentId: "R-BAG", level: "area" },
  { id: "T-KTW", name: "Kathmandu West", parentId: "A-KTM", level: "territory" },
  { id: "T-KTC", name: "Kathmandu Core", parentId: "A-KTM", level: "territory" },
  { id: "T-KTE", name: "Kathmandu East", parentId: "A-KTM", level: "territory" },
  { id: "T-PAT", name: "Patan", parentId: "A-LTP", level: "territory" },
  { id: "T-BKT", name: "Bhaktapur", parentId: "A-LTP", level: "territory" },
  { id: "R-GAN", name: "Gandaki", parentId: null, level: "region" },
  { id: "A-PKR", name: "Pokhara", parentId: "R-GAN", level: "area" },
  { id: "T-PKL", name: "Lakeside", parentId: "A-PKR", level: "territory" },
  { id: "T-PKC", name: "Pokhara City", parentId: "A-PKR", level: "territory" },
  { id: "R-LUM", name: "Lumbini", parentId: null, level: "region" },
  { id: "A-BTW", name: "Butwal", parentId: "R-LUM", level: "area" },
  { id: "T-BTW", name: "Butwal", parentId: "A-BTW", level: "territory" },
  { id: "T-BHW", name: "Bhairahawa", parentId: "A-BTW", level: "territory" },
];

// ── People ──────────────────────────────────────────────────────────────────

export type Rep = { id: string; name: string; initials: string; role: "Sales rep" | "Merchandiser" | "Area manager"; territoryIds: string[]; phone: string };
export const REPS: Rep[] = [
  { id: "EMP-301", name: "Arun Rai", initials: "AR", role: "Sales rep", territoryIds: ["T-KTW"], phone: "9800000301" },
  { id: "EMP-302", name: "Bina Thapa", initials: "BT", role: "Sales rep", territoryIds: ["T-KTC"], phone: "9800000302" },
  { id: "EMP-313", name: "Esha Lama", initials: "EL", role: "Sales rep", territoryIds: ["T-PAT", "T-BKT"], phone: "9800000313" },
  { id: "EMP-314", name: "Farah Shah", initials: "FS", role: "Merchandiser", territoryIds: ["T-KTE", "T-KTC"], phone: "9800000314" },
  { id: "EMP-375", name: "Rajesh Shrestha", initials: "RS", role: "Area manager", territoryIds: ["T-KTW", "T-KTC", "T-KTE"], phone: "9800000375" },
  { id: "EMP-320", name: "Sujan Tamang", initials: "ST", role: "Sales rep", territoryIds: ["T-KTE"], phone: "9800000320" },
  { id: "EMP-321", name: "Pooja Gurung", initials: "PG", role: "Sales rep", territoryIds: ["T-PKL", "T-PKC", "T-BTW", "T-BHW"], phone: "9800000321" },
];

// ── Products and price lists ────────────────────────────────────────────────

export type Product = { id: string; code: string; name: string; brand: string; category: string; unit: string; pack: string; listPrice: number; cost: number; tone: number };
export const BRANDS = ["Himal Fresh", "Crunchy", "Ujjwal", "Chiya Ghar", "Pani", "Chau Chau"] as const;
export const PRODUCTS: Product[] = [
  { id: "P-101", code: "HF-MNG-1L", name: "Himal Fresh Mango 1L", brand: "Himal Fresh", category: "Beverages", unit: "case", pack: "12 × 1L", listPrice: 1_680, cost: 1_240, tone: 5 },
  { id: "P-102", code: "HF-LIT-1L", name: "Himal Fresh Litchi 1L", brand: "Himal Fresh", category: "Beverages", unit: "case", pack: "12 × 1L", listPrice: 1_680, cost: 1_240, tone: 4 },
  { id: "P-103", code: "HF-MNG-200", name: "Himal Fresh Mango 200ml", brand: "Himal Fresh", category: "Beverages", unit: "case", pack: "27 × 200ml", listPrice: 945, cost: 700, tone: 5 },
  { id: "P-111", code: "CR-GLU-100", name: "Crunchy Glucose 100g", brand: "Crunchy", category: "Biscuits", unit: "ctn", pack: "48 × 100g", listPrice: 960, cost: 720, tone: 3 },
  { id: "P-112", code: "CR-CRM-75", name: "Crunchy Cream Chocolate 75g", brand: "Crunchy", category: "Biscuits", unit: "ctn", pack: "36 × 75g", listPrice: 1_080, cost: 790, tone: 8 },
  { id: "P-113", code: "CR-DIG-200", name: "Crunchy Digestive 200g", brand: "Crunchy", category: "Biscuits", unit: "ctn", pack: "24 × 200g", listPrice: 1_320, cost: 980, tone: 3 },
  { id: "P-121", code: "UJ-DTG-1K", name: "Ujjwal Detergent 1kg", brand: "Ujjwal", category: "Home care", unit: "ctn", pack: "10 × 1kg", listPrice: 2_050, cost: 1_560, tone: 2 },
  { id: "P-122", code: "UJ-BAR-150", name: "Ujjwal Washing Bar 150g", brand: "Ujjwal", category: "Home care", unit: "ctn", pack: "60 × 150g", listPrice: 1_500, cost: 1_120, tone: 2 },
  { id: "P-123", code: "UJ-SOAP-100", name: "Ujjwal Bathing Soap 100g", brand: "Ujjwal", category: "Personal care", unit: "ctn", pack: "48 × 100g", listPrice: 2_400, cost: 1_850, tone: 7 },
  { id: "P-131", code: "CG-TEA-500", name: "Chiya Ghar Black Tea 500g", brand: "Chiya Ghar", category: "Tea", unit: "ctn", pack: "20 × 500g", listPrice: 7_400, cost: 5_600, tone: 6 },
  { id: "P-132", code: "CG-TEA-100", name: "Chiya Ghar Black Tea 100g", brand: "Chiya Ghar", category: "Tea", unit: "ctn", pack: "60 × 100g", listPrice: 4_620, cost: 3_450, tone: 6 },
  { id: "P-141", code: "PN-1L", name: "Pani Mineral Water 1L", brand: "Pani", category: "Water", unit: "case", pack: "12 × 1L", listPrice: 300, cost: 210, tone: 1 },
  { id: "P-142", code: "PN-500", name: "Pani Mineral Water 500ml", brand: "Pani", category: "Water", unit: "case", pack: "24 × 500ml", listPrice: 360, cost: 250, tone: 1 },
  { id: "P-151", code: "CC-CHK-70", name: "Chau Chau Chicken 70g", brand: "Chau Chau", category: "Noodles", unit: "ctn", pack: "30 × 70g", listPrice: 690, cost: 520, tone: 3 },
  { id: "P-152", code: "CC-VEG-70", name: "Chau Chau Veg 70g", brand: "Chau Chau", category: "Noodles", unit: "ctn", pack: "30 × 70g", listPrice: 660, cost: 500, tone: 6 },
  { id: "P-153", code: "CC-CUP-60", name: "Chau Chau Cup Noodles 60g", brand: "Chau Chau", category: "Noodles", unit: "ctn", pack: "24 × 60g", listPrice: 1_150, cost: 860, tone: 8 },
];

// ── Customers ───────────────────────────────────────────────────────────────

export type Customer = {
  id: string;
  code: string;
  name: string;
  typeId: string;
  /** "Served by" — the distributor that bills this customer (secondary sales). null = the company bills it. */
  parentId: string | null;
  tier: "A" | "B" | "C";
  territoryId: string;
  repId: string | null;
  city: string;
  phone: string;
  creditLimit: number;
  outstanding: number;
  overdue: number;
  since: string;
  portalUsers: { name: string; role: "Owner" | "Buyer" | "Accounts"; lastSeen: string | null }[];
  status: "active" | "onboarding" | "on hold";
};

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PRIMARY: Omit<Customer, "code" | "since" | "status">[] = [
  { id: "C-5001", name: "Sagarmatha Distributors", typeId: "T-DIST", parentId: null, tier: "A", territoryId: "T-BTW", repId: "EMP-321", city: "Butwal", phone: "071-540221", creditLimit: 1_500_000, outstanding: 984_300, overdue: 221_900, portalUsers: [{ name: "Ramesh Adhikari", role: "Owner", lastSeen: "2026-09-04" }, { name: "Sita Adhikari", role: "Accounts", lastSeen: "2026-09-02" }, { name: "Kiran Thapa", role: "Buyer", lastSeen: "2026-09-04" }] },
  { id: "C-5002", name: "Kathmandu Valley Traders", typeId: "T-DIST", parentId: null, tier: "A", territoryId: "T-KTC", repId: "EMP-302", city: "Kathmandu", phone: "01-4251190", creditLimit: 2_000_000, outstanding: 1_912_000, overdue: 356_000, portalUsers: [{ name: "Bikash Joshi", role: "Owner", lastSeen: "2026-09-03" }] },
  { id: "C-5003", name: "Machhapuchhre Suppliers", typeId: "T-DIST", parentId: null, tier: "B", territoryId: "T-PKC", repId: "EMP-321", city: "Pokhara", phone: "061-462015", creditLimit: 900_000, outstanding: 412_500, overdue: 0, portalUsers: [{ name: "Gita Gurung", role: "Owner", lastSeen: "2026-08-29" }] },
  { id: "C-5004", name: "Patan Merchandise House", typeId: "T-DIST", parentId: null, tier: "B", territoryId: "T-PAT", repId: "EMP-313", city: "Lalitpur", phone: "01-5522840", creditLimit: 1_000_000, outstanding: 220_000, overdue: 0, portalUsers: [] },
  { id: "C-5010", name: "Everest Super Stockist", typeId: "T-SS", parentId: null, tier: "A", territoryId: "T-KTW", repId: "EMP-375", city: "Kathmandu", phone: "01-4671122", creditLimit: 5_000_000, outstanding: 2_860_000, overdue: 0, portalUsers: [{ name: "Anil Shrestha", role: "Owner", lastSeen: "2026-09-04" }] },
  { id: "C-5020", name: "Bhaktapur Dealers Pvt. Ltd.", typeId: "T-DEAL", parentId: null, tier: "A", territoryId: "T-BKT", repId: "EMP-313", city: "Bhaktapur", phone: "01-6611450", creditLimit: 600_000, outstanding: 598_000, overdue: 42_000, portalUsers: [{ name: "Suman Prajapati", role: "Owner", lastSeen: "2026-09-01" }] },
  { id: "C-5021", name: "Lakeside Trading Co.", typeId: "T-DEAL", parentId: null, tier: "B", territoryId: "T-PKL", repId: "EMP-321", city: "Pokhara", phone: "061-463377", creditLimit: 400_000, outstanding: 96_000, overdue: 0, portalUsers: [{ name: "Deepak KC", role: "Owner", lastSeen: null }] },
  { id: "C-5022", name: "Kalanki Wholesale Dealer", typeId: "T-DEAL", parentId: null, tier: "B", territoryId: "T-KTW", repId: "EMP-301", city: "Kathmandu", phone: "01-4280911", creditLimit: 500_000, outstanding: 188_000, overdue: 0, portalUsers: [] },
  { id: "C-5023", name: "Chabahil Distributors & Dealers", typeId: "T-DEAL", parentId: null, tier: "C", territoryId: "T-KTE", repId: "EMP-320", city: "Kathmandu", phone: "01-4470312", creditLimit: 300_000, outstanding: 0, overdue: 0, portalUsers: [] },
  { id: "C-5030", name: "Bishal Mart Chain", typeId: "T-MT", parentId: null, tier: "A", territoryId: "T-KTC", repId: "EMP-375", city: "Kathmandu", phone: "01-4228800", creditLimit: 3_000_000, outstanding: 1_240_000, overdue: 0, portalUsers: [] },
  { id: "C-5031", name: "Saleways Fresh", typeId: "T-MT", parentId: null, tier: "A", territoryId: "T-PAT", repId: "EMP-314", city: "Lalitpur", phone: "01-5541312", creditLimit: 2_000_000, outstanding: 650_000, overdue: 0, portalUsers: [] },
  { id: "C-5040", name: "Hotel Annapurna View", typeId: "T-HRC", parentId: null, tier: "A", territoryId: "T-PKL", repId: "EMP-321", city: "Pokhara", phone: "061-465220", creditLimit: 250_000, outstanding: 64_000, overdue: 0, portalUsers: [] },
  { id: "C-5041", name: "Thamel Kitchen Café", typeId: "T-HRC", parentId: null, tier: "B", territoryId: "T-KTC", repId: "EMP-302", city: "Kathmandu", phone: "01-4700189", creditLimit: 120_000, outstanding: 18_500, overdue: 0, portalUsers: [] },
  { id: "C-5042", name: "Newa Banquet & Caterers", typeId: "T-HRC", parentId: null, tier: "B", territoryId: "T-PAT", repId: "EMP-313", city: "Lalitpur", phone: "01-5530090", creditLimit: 200_000, outstanding: 0, overdue: 0, portalUsers: [] },
  { id: "C-5050", name: "Sunrise Boarding School", typeId: "T-INST", parentId: null, tier: "B", territoryId: "T-KTE", repId: "EMP-375", city: "Kathmandu", phone: "01-4910234", creditLimit: 300_000, outstanding: 0, overdue: 0, portalUsers: [] },
  { id: "C-5051", name: "Om Hospital Canteen", typeId: "T-INST", parentId: null, tier: "C", territoryId: "T-KTC", repId: "EMP-375", city: "Kathmandu", phone: "01-4476225", creditLimit: 150_000, outstanding: 22_000, overdue: 22_000, portalUsers: [] },
];

const SHOP = ["Shree Ganesh", "Laxmi", "Om Shanti", "Annapurna", "Sita Ram", "Durga", "Himal", "Pashupati", "Kalika", "Buddha", "Tara", "Janaki", "Mitra", "Sunrise", "Gorkha", "Muna", "Srijana", "Krishna", "Bagmati", "Newa", "Hari Om", "Chandra", "Bhawani", "Sahara", "Shiva Shakti", "Ujjwal", "Sabitri", "Dipak", "Maya", "Rara", "Kanchan", "Mahalaxmi", "Saraswati", "Bishnu", "Amrit", "Phewa", "Sagun", "Dhaulagiri", "Nilgiri", "Mustang"];
const KIND = ["Kirana Pasal", "General Store", "Mart", "Grocery", "Suppliers", "Bhandar", "Store", "Traders"];
const CITY: Record<string, string> = { "T-KTW": "Kathmandu", "T-KTC": "Kathmandu", "T-KTE": "Kathmandu", "T-PAT": "Lalitpur", "T-BKT": "Bhaktapur", "T-PKL": "Pokhara", "T-PKC": "Pokhara", "T-BTW": "Butwal", "T-BHW": "Bhairahawa" };
const SERVED_BY: Record<string, string> = { "T-KTW": "C-5002", "T-KTC": "C-5002", "T-KTE": "C-5002", "T-PAT": "C-5004", "T-BKT": "C-5004", "T-PKL": "C-5003", "T-PKC": "C-5003", "T-BTW": "C-5001", "T-BHW": "C-5001" };
const REP_OF: Record<string, string> = { "T-KTW": "EMP-301", "T-KTC": "EMP-302", "T-KTE": "EMP-320", "T-PAT": "EMP-313", "T-BKT": "EMP-313", "T-PKL": "EMP-321", "T-PKC": "EMP-321", "T-BTW": "EMP-321", "T-BHW": "EMP-321" };

function buildCustomers(): Customer[] {
  const r = prng(29092026);
  const out: Customer[] = PRIMARY.map((c, i) => ({ ...c, code: c.id, since: `202${3 + (i % 3)}-0${1 + (i % 9)}-1${i % 9}`, status: c.id === "C-5023" ? "onboarding" : c.id === "C-5051" ? "on hold" : "active" }));
  const terr = Object.keys(CITY);
  let n = 6001;
  const used = new Set<string>();
  for (let i = 0; i < 64; i++) {
    const t = terr[i % terr.length];
    let name = "";
    for (let k = 0; k < 30 && (!name || used.has(name)); k++) name = `${SHOP[Math.floor(r() * SHOP.length)]} ${KIND[Math.floor(r() * KIND.length)]}`;
    used.add(name);
    const wholesale = i % 9 === 4;
    const tier = r() < 0.2 ? "A" : r() < 0.6 ? "B" : "C";
    out.push({
      id: `C-${n}`,
      code: `C-${n}`,
      name: wholesale ? name.replace(/(Kirana Pasal|General Store|Grocery|Store|Mart)$/, "Wholesale") : name,
      typeId: wholesale ? "T-WHOL" : "T-RET",
      parentId: SERVED_BY[t],
      tier,
      territoryId: t,
      repId: REP_OF[t],
      city: CITY[t],
      phone: `98${String(41000000 + Math.floor(r() * 8999999))}`,
      creditLimit: wholesale ? 150_000 : tier === "A" ? 60_000 : 30_000,
      outstanding: Math.round((r() * (wholesale ? 90_000 : 25_000)) / 100) * 100,
      overdue: r() < 0.15 ? Math.round((r() * 12_000) / 100) * 100 : 0,
      since: `202${4 + Math.floor(r() * 3)}-0${1 + Math.floor(r() * 8)}-1${Math.floor(r() * 9)}`,
      portalUsers: wholesale && r() < 0.5 ? [{ name: "Owner", role: "Owner", lastSeen: "2026-09-02" }] : [],
      status: i === 7 ? "onboarding" : "active",
    });
    n++;
  }
  return out;
}
export const CUSTOMERS: Customer[] = buildCustomers();

// ── Schemes ─────────────────────────────────────────────────────────────────

export type SchemeMechanic =
  | { kind: "free-goods"; buyItemIds: string[]; buyQty: number; getItemId: string | "same"; getQty: number }
  | { kind: "slab"; itemIds: string[]; slabs: { minQty: number; pct: number }[] }
  | { kind: "combo"; needs: { itemIds: string[]; qty: number }[]; getItemId: string; getQty: number }
  | { kind: "invoice-value"; minValue: number; pct: number }
  | { kind: "first-order"; pct: number }
  | { kind: "target-rebate"; target: number; pct: number; period: string }
  | { kind: "display"; amount: number; per: "month" }
  | { kind: "early-payment"; pct: number; withinDays: number };

export type SchemeStatus = "live" | "scheduled" | "draft" | "ended" | "paused";
export type Scheme = {
  id: string;
  name: string;
  mechanic: SchemeMechanic;
  typeIds: string[];
  tiers: ("A" | "B" | "C")[];
  territoryIds: string[];
  from: string;
  to: string;
  status: SchemeStatus;
  priority: number;
  exclusive: boolean;
  budget: { kind: "value" | "qty"; total: number; used: number } | null;
  campaignId: string | null;
  applies: "order" | "period" | "claim" | "payment";
  owner: string;
};

export const SCHEMES: Scheme[] = [
  { id: "SCH-021", name: "Buy 10 get 1 — Mango 1L", mechanic: { kind: "free-goods", buyItemIds: ["P-101"], buyQty: 10, getItemId: "same", getQty: 1 }, typeIds: ["T-RET", "T-WHOL"], tiers: [], territoryIds: [], from: "2026-09-01", to: "2026-10-31", status: "live", priority: 10, exclusive: false, budget: { kind: "qty", total: 800, used: 312 }, campaignId: "CMP-07", applies: "order", owner: "EMP-101" },
  { id: "SCH-022", name: "Crunchy volume slab", mechanic: { kind: "slab", itemIds: ["P-111", "P-112", "P-113"], slabs: [{ minQty: 50, pct: 3 }, { minQty: 100, pct: 5 }, { minQty: 200, pct: 7 }] }, typeIds: ["T-DIST", "T-SS"], tiers: [], territoryIds: [], from: "2026-08-01", to: "2026-12-31", status: "live", priority: 20, exclusive: false, budget: { kind: "value", total: 900_000, used: 412_300 }, campaignId: null, applies: "order", owner: "EMP-101" },
  { id: "SCH-023", name: "Dashain combo — Mango + Crunchy", mechanic: { kind: "combo", needs: [{ itemIds: ["P-101", "P-102"], qty: 5 }, { itemIds: ["P-111", "P-112", "P-113"], qty: 5 }], getItemId: "P-132", getQty: 1 }, typeIds: ["T-RET", "T-WHOL", "T-DEAL", "T-DIST"], tiers: [], territoryIds: [], from: "2026-09-15", to: "2026-10-20", status: "scheduled", priority: 15, exclusive: false, budget: { kind: "qty", total: 1_200, used: 0 }, campaignId: "CMP-07", applies: "order", owner: "EMP-101" },
  { id: "SCH-024", name: "2% off orders over 1 lakh", mechanic: { kind: "invoice-value", minValue: 100_000, pct: 2 }, typeIds: ["T-DEAL", "T-DIST", "T-SS"], tiers: [], territoryIds: [], from: "2026-07-17", to: "2027-07-16", status: "live", priority: 90, exclusive: false, budget: null, campaignId: null, applies: "order", owner: "EMP-118" },
  { id: "SCH-025", name: "Welcome 5% — first order", mechanic: { kind: "first-order", pct: 5 }, typeIds: ["T-RET", "T-WHOL"], tiers: [], territoryIds: [], from: "2026-07-17", to: "2027-07-16", status: "live", priority: 5, exclusive: true, budget: { kind: "value", total: 150_000, used: 38_200 }, campaignId: null, applies: "order", owner: "EMP-101" },
  { id: "SCH-026", name: "Quarterly target rebate 3%", mechanic: { kind: "target-rebate", target: 3_000_000, pct: 3, period: "Jul – Sep 2026" }, typeIds: ["T-DIST"], tiers: ["A", "B"], territoryIds: [], from: "2026-07-01", to: "2026-09-30", status: "live", priority: 50, exclusive: false, budget: { kind: "value", total: 400_000, used: 0 }, campaignId: null, applies: "period", owner: "EMP-118" },
  { id: "SCH-027", name: "Mango chiller display", mechanic: { kind: "display", amount: 1_500, per: "month" }, typeIds: ["T-RET"], tiers: ["A"], territoryIds: [], from: "2026-09-01", to: "2026-11-30", status: "live", priority: 40, exclusive: false, budget: { kind: "value", total: 180_000, used: 42_000 }, campaignId: "CMP-07", applies: "claim", owner: "EMP-101" },
  { id: "SCH-028", name: "Pay in 7 days — 2% off", mechanic: { kind: "early-payment", pct: 2, withinDays: 7 }, typeIds: ["T-DEAL", "T-DIST"], tiers: [], territoryIds: [], from: "2026-07-17", to: "2027-07-16", status: "live", priority: 60, exclusive: false, budget: null, campaignId: null, applies: "payment", owner: "EMP-118" },
  { id: "SCH-019", name: "Monsoon noodles 4+1", mechanic: { kind: "free-goods", buyItemIds: ["P-151", "P-152"], buyQty: 4, getItemId: "same", getQty: 1 }, typeIds: ["T-RET"], tiers: [], territoryIds: [], from: "2026-06-15", to: "2026-08-31", status: "ended", priority: 10, exclusive: false, budget: { kind: "qty", total: 600, used: 588 }, campaignId: null, applies: "order", owner: "EMP-101" },
  { id: "SCH-029", name: "Cup noodles launch 8%", mechanic: { kind: "slab", itemIds: ["P-153"], slabs: [{ minQty: 5, pct: 8 }] }, typeIds: ["T-RET", "T-WHOL", "T-MT"], tiers: [], territoryIds: [], from: "2026-10-01", to: "2026-10-31", status: "draft", priority: 12, exclusive: false, budget: { kind: "value", total: 120_000, used: 0 }, campaignId: "CMP-08", applies: "order", owner: "EMP-101" },
];

// ── Orders hub ──────────────────────────────────────────────────────────────

export type Source = "rep" | "portal" | "whatsapp" | "retailer-app" | "back-office";
export type HubStatus = "review" | "ready" | "approved" | "rejected";
export type HubOrder = {
  id: string;
  customerId: string;
  source: Source;
  byName: string;
  repId: string | null;
  at: string; // "2026-09-04 11:20"
  lines: { productId: string; qty: number; price?: number }[];
  note: string;
  status: HubStatus;
  soNo: string | null;
  rejectReason?: string;
};

export const HUB_ORDERS: HubOrder[] = [
  { id: "ORD-2208", customerId: "C-5001", source: "portal", byName: "Kiran Thapa", repId: "EMP-321", at: "2026-09-04 13:42", lines: [{ productId: "P-101", qty: 60 }, { productId: "P-111", qty: 120 }, { productId: "P-121", qty: 40 }, { productId: "P-141", qty: 200 }], note: "Please send before Dashain rush.", status: "review", soNo: null },
  { id: "ORD-2207", customerId: "C-5002", source: "portal", byName: "Bikash Joshi", repId: "EMP-302", at: "2026-09-04 12:15", lines: [{ productId: "P-111", qty: 220 }, { productId: "P-112", qty: 80 }, { productId: "P-151", qty: 150 }], note: "", status: "review", soNo: null },
  { id: "ORD-2206", customerId: "C-6004", source: "rep", byName: "Arun Rai", repId: "EMP-301", at: "2026-09-04 11:58", lines: [{ productId: "P-101", qty: 10 }, { productId: "P-151", qty: 6 }], note: "", status: "ready", soNo: null },
  { id: "ORD-2205", customerId: "C-5020", source: "whatsapp", byName: "Suman Prajapati", repId: "EMP-313", at: "2026-09-04 11:10", lines: [{ productId: "P-121", qty: 30 }, { productId: "P-122", qty: 25 }, { productId: "P-123", qty: 12 }], note: "Sent on WhatsApp, confirmed by Esha.", status: "review", soNo: null },
  { id: "ORD-2204", customerId: "C-6013", source: "retailer-app", byName: "Owner", repId: "EMP-320", at: "2026-09-04 10:36", lines: [{ productId: "P-141", qty: 20 }, { productId: "P-142", qty: 10 }], note: "", status: "ready", soNo: null },
  { id: "ORD-2203", customerId: "C-5030", source: "back-office", byName: "Sneha Maharjan", repId: "EMP-375", at: "2026-09-04 10:05", lines: [{ productId: "P-101", qty: 80 }, { productId: "P-102", qty: 60 }, { productId: "P-113", qty: 40 }], note: "PO BMC/2083/0917", status: "ready", soNo: null },
  { id: "ORD-2202", customerId: "C-6021", source: "rep", byName: "Bina Thapa", repId: "EMP-302", at: "2026-09-04 09:52", lines: [{ productId: "P-111", qty: 8 }, { productId: "P-131", qty: 1 }], note: "", status: "approved", soNo: "SO-1091" },
  { id: "ORD-2201", customerId: "C-5040", source: "rep", byName: "Pooja Gurung", repId: "EMP-321", at: "2026-09-03 17:20", lines: [{ productId: "P-141", qty: 40 }, { productId: "P-131", qty: 2 }], note: "", status: "approved", soNo: "SO-1090" },
  { id: "ORD-2200", customerId: "C-5051", source: "rep", byName: "Rajesh Shrestha", repId: "EMP-375", at: "2026-09-03 15:44", lines: [{ productId: "P-131", qty: 3 }], note: "", status: "review", soNo: null },
  { id: "ORD-2199", customerId: "C-6030", source: "rep", byName: "Esha Lama", repId: "EMP-313", at: "2026-09-03 14:03", lines: [{ productId: "P-101", qty: 22 }], note: "", status: "approved", soNo: "SO-1089" },
  { id: "ORD-2198", customerId: "C-6011", source: "retailer-app", byName: "Owner", repId: "EMP-301", at: "2026-09-03 12:41", lines: [{ productId: "P-152", qty: 4 }], note: "", status: "rejected", soNo: null, rejectReason: "Duplicate of ORD-2194." },
  { id: "ORD-2197", customerId: "C-5010", source: "portal", byName: "Anil Shrestha", repId: "EMP-375", at: "2026-09-03 11:02", lines: [{ productId: "P-101", qty: 300 }, { productId: "P-111", qty: 400 }, { productId: "P-121", qty: 150 }], note: "", status: "approved", soNo: "SO-1088" },
];

// ── Campaigns, branding, events, claims ─────────────────────────────────────

export type Campaign = {
  id: string;
  name: string;
  objective: string;
  status: "live" | "planned" | "ended" | "draft";
  from: string;
  to: string;
  audience: { typeIds: string[]; territoryIds: string[]; outlets: number };
  budget: number;
  spent: number;
  schemeIds: string[];
  brandingIds: string[];
  eventIds: string[];
  tasks: { title: string; activity: string; done: number; total: number }[];
  kpi: { label: string; target: number; actual: number; unit: string }[];
  owner: string;
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "CMP-07",
    name: "Dashain with Himal Fresh",
    objective: "Grow Himal Fresh juice volume 25% over last Dashain in general trade.",
    status: "live",
    from: "2026-09-01",
    to: "2026-10-31",
    audience: { typeIds: ["T-RET", "T-WHOL", "T-DEAL", "T-DIST"], territoryIds: ["R-BAG", "R-GAN"], outlets: 412 },
    budget: 1_200_000,
    spent: 486_000,
    schemeIds: ["SCH-021", "SCH-023", "SCH-027"],
    brandingIds: ["BR-301", "BR-302", "BR-305"],
    eventIds: ["EV-41", "EV-43"],
    tasks: [
      { title: "Photo of the Mango display", activity: "Photo audit", done: 118, total: 180 },
      { title: "Brief the outlet on the combo", activity: "Scheme briefing", done: 204, total: 412 },
    ],
    kpi: [
      { label: "Juice volume", target: 18_000, actual: 7_940, unit: "cases" },
      { label: "Outlets with display", target: 180, actual: 118, unit: "outlets" },
      { label: "New outlets billed", target: 60, actual: 21, unit: "outlets" },
    ],
    owner: "EMP-101",
  },
  {
    id: "CMP-08",
    name: "Chau Chau Cup launch",
    objective: "Place Cup Noodles in 300 outlets within October.",
    status: "planned",
    from: "2026-10-01",
    to: "2026-10-31",
    audience: { typeIds: ["T-RET", "T-WHOL", "T-MT"], territoryIds: ["A-KTM", "A-LTP"], outlets: 300 },
    budget: 650_000,
    spent: 40_000,
    schemeIds: ["SCH-029"],
    brandingIds: ["BR-306"],
    eventIds: ["EV-44"],
    tasks: [{ title: "Sample to the shop owner", activity: "Sampling", done: 0, total: 300 }],
    kpi: [
      { label: "Outlets placed", target: 300, actual: 0, unit: "outlets" },
      { label: "Cases sold", target: 2_400, actual: 0, unit: "cases" },
    ],
    owner: "EMP-101",
  },
  {
    id: "CMP-05",
    name: "Monsoon noodle push",
    objective: "Clear noodle stock at retailers during the monsoon.",
    status: "ended",
    from: "2026-06-15",
    to: "2026-08-31",
    audience: { typeIds: ["T-RET"], territoryIds: ["R-BAG"], outlets: 280 },
    budget: 300_000,
    spent: 284_500,
    schemeIds: ["SCH-019"],
    brandingIds: [],
    eventIds: [],
    tasks: [],
    kpi: [{ label: "Noodle volume", target: 6_000, actual: 6_430, unit: "ctn" }],
    owner: "EMP-101",
  },
];

export type PosmItem = { id: string; name: string; unit: string; cost: number; stock: number; vendor: string };
export const POSM: PosmItem[] = [
  { id: "PM-1", name: "Glow sign board", unit: "board", cost: 18_500, stock: 12, vendor: "Kathmandu Signs" },
  { id: "PM-2", name: "Floor standee", unit: "piece", cost: 2_400, stock: 64, vendor: "PrintHub Nepal" },
  { id: "PM-3", name: "Shelf strip", unit: "set", cost: 450, stock: 380, vendor: "PrintHub Nepal" },
  { id: "PM-4", name: "Visi-cooler (200L)", unit: "cooler", cost: 62_000, stock: 5, vendor: "Coolex Traders" },
  { id: "PM-5", name: "Wall painting", unit: "wall", cost: 14_000, stock: 0, vendor: "Brush & Co." },
  { id: "PM-6", name: "Counter top dispenser", unit: "piece", cost: 1_200, stock: 140, vendor: "PrintHub Nepal" },
];

export type BrandingStage = "requested" | "approved" | "installing" | "installed" | "rejected";
export type BrandingJob = { id: string; customerId: string; posmId: string; qty: number; stage: BrandingStage; requestedBy: string; requestedOn: string; campaignId: string | null; proof: boolean; note: string; installedOn: string | null };
export const BRANDING: BrandingJob[] = [
  { id: "BR-301", customerId: "C-6004", posmId: "PM-4", qty: 1, stage: "installed", requestedBy: "Arun Rai", requestedOn: "2026-08-22", campaignId: "CMP-07", proof: true, note: "Chiller near the counter.", installedOn: "2026-08-30" },
  { id: "BR-302", customerId: "C-6011", posmId: "PM-2", qty: 2, stage: "installing", requestedBy: "Arun Rai", requestedOn: "2026-08-28", campaignId: "CMP-07", proof: false, note: "", installedOn: null },
  { id: "BR-303", customerId: "C-5001", posmId: "PM-1", qty: 1, stage: "requested", requestedBy: "Ramesh Adhikari (portal)", requestedOn: "2026-09-03", campaignId: null, proof: false, note: "New warehouse front.", installedOn: null },
  { id: "BR-304", customerId: "C-6021", posmId: "PM-3", qty: 4, stage: "approved", requestedBy: "Bina Thapa", requestedOn: "2026-09-02", campaignId: null, proof: false, note: "", installedOn: null },
  { id: "BR-305", customerId: "C-6030", posmId: "PM-5", qty: 1, stage: "requested", requestedBy: "Esha Lama", requestedOn: "2026-09-04", campaignId: "CMP-07", proof: false, note: "Side wall facing the main road.", installedOn: null },
  { id: "BR-306", customerId: "C-5030", posmId: "PM-6", qty: 20, stage: "approved", requestedBy: "Rajesh Shrestha", requestedOn: "2026-09-01", campaignId: "CMP-08", proof: false, note: "All 4 branches.", installedOn: null },
  { id: "BR-298", customerId: "C-6040", posmId: "PM-2", qty: 1, stage: "rejected", requestedBy: "Sujan Tamang", requestedOn: "2026-08-19", campaignId: null, proof: false, note: "Shop too small for a standee.", installedOn: null },
];

export type SfEvent = { id: string; name: string; kind: "Retailer meet" | "Launch" | "Sampling" | "Dealer conference"; date: string; place: string; status: "planned" | "done" | "live"; invited: number; confirmed: number; attended: number | null; cost: number; orders: number; leads: number; campaignId: string | null };
export const EVENTS: SfEvent[] = [
  { id: "EV-41", name: "Pokhara retailer meet", kind: "Retailer meet", date: "2026-09-12", place: "Hotel Annapurna View, Pokhara", status: "planned", invited: 120, confirmed: 74, attended: null, cost: 95_000, orders: 0, leads: 0, campaignId: "CMP-07" },
  { id: "EV-43", name: "Dashain sampling — New Road", kind: "Sampling", date: "2026-09-05", place: "New Road gate, Kathmandu", status: "planned", invited: 0, confirmed: 0, attended: null, cost: 40_000, orders: 0, leads: 0, campaignId: "CMP-07" },
  { id: "EV-44", name: "Cup Noodles launch", kind: "Launch", date: "2026-10-02", place: "Hotel Yak & Yeti, Kathmandu", status: "planned", invited: 60, confirmed: 18, attended: null, cost: 180_000, orders: 0, leads: 0, campaignId: "CMP-08" },
  { id: "EV-42", name: "Butwal retailer meet", kind: "Retailer meet", date: "2026-09-02", place: "Hotel Nirvana, Butwal", status: "planned", invited: 80, confirmed: 52, attended: null, cost: 70_000, orders: 0, leads: 0, campaignId: null },
  { id: "EV-39", name: "Distributor conference 2083", kind: "Dealer conference", date: "2026-08-20", place: "Butwal", status: "done", invited: 14, confirmed: 13, attended: 12, cost: 210_000, orders: 9, leads: 2, campaignId: null },
];

export type ClaimKind = "Scheme" | "Display" | "Damage" | "Price difference" | "Expense";
export type Claim = { id: string; kind: ClaimKind; party: string; partyKind: "customer" | "rep"; amount: number; raisedOn: string; status: "submitted" | "approved" | "settled" | "rejected"; basis: string; schemeId: string | null; settledBy: string | null };
export const CLAIMS: Claim[] = [
  { id: "CL-551", kind: "Scheme", party: "C-5001", partyKind: "customer", amount: 38_400, raisedOn: "2026-09-02", status: "submitted", basis: "Free goods given to 42 retailers under SCH-021 (secondary sales 1–2 Sep).", schemeId: "SCH-021", settledBy: null },
  { id: "CL-550", kind: "Display", party: "C-6004", partyKind: "customer", amount: 1_500, raisedOn: "2026-09-01", status: "approved", basis: "Chiller display, Aug — 3 photos verified.", schemeId: "SCH-027", settledBy: null },
  { id: "CL-549", kind: "Damage", party: "C-5020", partyKind: "customer", amount: 12_600, raisedOn: "2026-08-30", status: "submitted", basis: "6 ctn Crunchy Glucose crushed in transit (DN-0341), 4 photos.", schemeId: null, settledBy: null },
  { id: "CL-548", kind: "Expense", party: "EMP-321", partyKind: "rep", amount: 4_850, raisedOn: "2026-08-31", status: "submitted", basis: "Travel Pokhara–Butwal, 2 nights (bills attached).", schemeId: null, settledBy: null },
  { id: "CL-547", kind: "Scheme", party: "C-5002", partyKind: "customer", amount: 61_200, raisedOn: "2026-08-25", status: "settled", basis: "SCH-019 free goods given to retailers, Jul.", schemeId: "SCH-019", settledBy: "CM-0212" },
  { id: "CL-546", kind: "Price difference", party: "C-5003", partyKind: "customer", amount: 9_300, raisedOn: "2026-08-22", status: "rejected", basis: "Stock held at old price.", schemeId: null, settledBy: null },
  { id: "CL-545", kind: "Display", party: "C-6030", partyKind: "customer", amount: 1_500, raisedOn: "2026-09-01", status: "submitted", basis: "Chiller display, Aug — 1 photo, blurred.", schemeId: "SCH-027", settledBy: null },
];

// ── Playbooks (configurable visit work) ─────────────────────────────────────

export type ActivityKind = "order" | "collection" | "return" | "stock-count" | "photo" | "form" | "branding-audit" | "scheme-briefing" | "document" | "task" | "sampling";
export type Activity = { id: string; name: string; kind: ActivityKind; detail: string };
export const ACTIVITIES: Activity[] = [
  { id: "AC-ORD", name: "Take an order", kind: "order", detail: "Sales order, priced and schemed by the engine" },
  { id: "AC-COL", name: "Collect payment", kind: "collection", detail: "Customer receipt against open invoices" },
  { id: "AC-RET", name: "Take back damages", kind: "return", detail: "Return request → credit memo" },
  { id: "AC-STK", name: "Count stock on shelf", kind: "stock-count", detail: "Quantity per product, drives suggested order" },
  { id: "AC-PHO", name: "Photo of the shelf", kind: "photo", detail: "1–3 photos, geo-stamped" },
  { id: "AC-CMP", name: "Competitor prices", kind: "form", detail: "Form: competitor brand, price, offer" },
  { id: "AC-BRA", name: "Check branding", kind: "branding-audit", detail: "Is the POSM up and clean? photo" },
  { id: "AC-SCH", name: "Brief on offers", kind: "scheme-briefing", detail: "Show the schemes this outlet qualifies for" },
  { id: "AC-EST", name: "Give a quotation", kind: "document", detail: "Any Bizak document — here an estimate" },
  { id: "AC-DLV", name: "Confirm a delivery", kind: "document", detail: "Any Bizak document — delivery sign-off" },
  { id: "AC-SMP", name: "Hand out samples", kind: "sampling", detail: "Quantity given, feedback" },
  { id: "AC-SEC", name: "Record secondary sales", kind: "form", detail: "Distributor's sales to retailers since the last visit" },
];

export type PlaybookItem = { activityId: string; required: boolean; geofence: boolean; when: "every visit" | "weekly" | "monthly" | "during campaign" };
export type Playbook = { id: string; name: string; forTypeIds: string[]; items: PlaybookItem[] };
export const PLAYBOOKS: Playbook[] = [
  {
    id: "PB-RET",
    name: "Retail visit",
    forTypeIds: ["T-RET", "T-WHOL"],
    items: [
      { activityId: "AC-STK", required: true, geofence: true, when: "every visit" },
      { activityId: "AC-ORD", required: true, geofence: true, when: "every visit" },
      { activityId: "AC-COL", required: false, geofence: false, when: "every visit" },
      { activityId: "AC-SCH", required: false, geofence: false, when: "every visit" },
      { activityId: "AC-PHO", required: true, geofence: true, when: "during campaign" },
      { activityId: "AC-CMP", required: false, geofence: false, when: "monthly" },
    ],
  },
  {
    id: "PB-DIST",
    name: "Distributor review",
    forTypeIds: ["T-DIST", "T-SS"],
    items: [
      { activityId: "AC-SEC", required: true, geofence: false, when: "weekly" },
      { activityId: "AC-STK", required: true, geofence: true, when: "weekly" },
      { activityId: "AC-ORD", required: false, geofence: false, when: "every visit" },
      { activityId: "AC-COL", required: false, geofence: false, when: "every visit" },
    ],
  },
  {
    id: "PB-DEAL",
    name: "Dealer visit",
    forTypeIds: ["T-DEAL"],
    items: [
      { activityId: "AC-ORD", required: true, geofence: true, when: "every visit" },
      { activityId: "AC-COL", required: false, geofence: false, when: "every visit" },
      { activityId: "AC-BRA", required: false, geofence: true, when: "monthly" },
    ],
  },
  {
    id: "PB-MT",
    name: "Store merchandising",
    forTypeIds: ["T-MT"],
    items: [
      { activityId: "AC-STK", required: true, geofence: true, when: "every visit" },
      { activityId: "AC-PHO", required: true, geofence: true, when: "every visit" },
      { activityId: "AC-BRA", required: true, geofence: true, when: "weekly" },
      { activityId: "AC-CMP", required: false, geofence: false, when: "weekly" },
    ],
  },
  {
    id: "PB-HRC",
    name: "HoReCa call",
    forTypeIds: ["T-HRC"],
    items: [
      { activityId: "AC-ORD", required: true, geofence: false, when: "every visit" },
      { activityId: "AC-SMP", required: false, geofence: false, when: "during campaign" },
      { activityId: "AC-EST", required: false, geofence: false, when: "every visit" },
    ],
  },
];

// ── Modules (per tenant) ────────────────────────────────────────────────────

export type ModuleKey = "field" | "orders" | "dealer-portal" | "retailer-app" | "schemes" | "campaigns" | "branding" | "events" | "claims" | "targets" | "expenses" | "secondary" | "van-sales";
export const MODULES: { key: ModuleKey; name: string; blurb: string; on: boolean }[] = [
  { key: "field", name: "Field visits", blurb: "Journey plans, check-ins and playbooks for reps", on: true },
  { key: "orders", name: "Orders hub", blurb: "One queue for orders from every channel", on: true },
  { key: "dealer-portal", name: "Dealer portal", blurb: "Dealers order, pay, claim and report online", on: true },
  { key: "retailer-app", name: "Retailer app", blurb: "Retailers order from their distributor", on: false },
  { key: "schemes", name: "Schemes", blurb: "Trade promotions applied on every order", on: true },
  { key: "campaigns", name: "Campaigns", blurb: "Group schemes, branding, events and tasks around a goal", on: true },
  { key: "branding", name: "Branding (POSM)", blurb: "Sign boards, standees and coolers — request to audit", on: true },
  { key: "events", name: "Events", blurb: "Retailer meets, launches and sampling", on: true },
  { key: "claims", name: "Claims", blurb: "Scheme, damage, display and expense claims", on: true },
  { key: "targets", name: "Targets & incentives", blurb: "Monthly targets, incentives and leaderboard", on: true },
  { key: "expenses", name: "Travel expenses", blurb: "Daily and travel allowance claims", on: false },
  { key: "secondary", name: "Secondary sales", blurb: "Distributors report their sales and stock", on: true },
  { key: "van-sales", name: "Van sales", blurb: "Sell and deliver from the van", on: false },
];

// ── Targets ─────────────────────────────────────────────────────────────────

export type Target = { repId: string; month: string; salesTarget: number; salesActual: number; outletsTarget: number; outletsActual: number; newOutlets: number; incentive: number };
export const TARGETS: Target[] = [
  { repId: "EMP-301", month: "Sep 2026", salesTarget: 1_600_000, salesActual: 512_000, outletsTarget: 90, outletsActual: 34, newOutlets: 2, incentive: 0 },
  { repId: "EMP-302", month: "Sep 2026", salesTarget: 1_800_000, salesActual: 468_000, outletsTarget: 95, outletsActual: 30, newOutlets: 1, incentive: 0 },
  { repId: "EMP-313", month: "Sep 2026", salesTarget: 1_400_000, salesActual: 301_000, outletsTarget: 80, outletsActual: 18, newOutlets: 0, incentive: 0 },
  { repId: "EMP-314", month: "Sep 2026", salesTarget: 900_000, salesActual: 262_000, outletsTarget: 60, outletsActual: 26, newOutlets: 0, incentive: 0 },
  { repId: "EMP-320", month: "Sep 2026", salesTarget: 1_200_000, salesActual: 390_000, outletsTarget: 85, outletsActual: 31, newOutlets: 3, incentive: 0 },
  { repId: "EMP-321", month: "Sep 2026", salesTarget: 2_200_000, salesActual: 820_000, outletsTarget: 110, outletsActual: 41, newOutlets: 4, incentive: 0 },
];

// ── The logged-in dealer (Dealer portal persona) ────────────────────────────

export const DEALER_ID = "C-5001";
export type LedgerRow = { date: string; doc: string; kind: "Invoice" | "Receipt" | "Credit note" | "Opening"; debit: number; credit: number; due: string | null };
export const DEALER_LEDGER: LedgerRow[] = [
  { date: "2026-07-17", doc: "Opening balance", kind: "Opening", debit: 612_000, credit: 0, due: null },
  { date: "2026-07-22", doc: "INV-8702", kind: "Invoice", debit: 284_500, credit: 0, due: "2026-08-21" },
  { date: "2026-07-30", doc: "RCP-0301", kind: "Receipt", debit: 0, credit: 400_000, due: null },
  { date: "2026-08-06", doc: "INV-8744", kind: "Invoice", debit: 336_200, credit: 0, due: "2026-09-05" },
  { date: "2026-08-12", doc: "CM-0205", kind: "Credit note", debit: 0, credit: 24_600, due: null },
  { date: "2026-08-19", doc: "INV-8790", kind: "Invoice", debit: 198_400, credit: 0, due: "2026-09-18" },
  { date: "2026-08-25", doc: "RCP-0352", kind: "Receipt", debit: 0, credit: 250_000, due: null },
  { date: "2026-09-01", doc: "INV-8831", kind: "Invoice", debit: 227_800, credit: 0, due: "2026-10-01" },
];
export const DEALER_SECONDARY: { month: string; value: number; retailers: number }[] = [
  { month: "Jun", value: 1_420_000, retailers: 118 },
  { month: "Jul", value: 1_610_000, retailers: 124 },
  { month: "Aug", value: 1_880_000, retailers: 131 },
  { month: "Sep", value: 420_000, retailers: 64 },
];
export const DEALER_STOCK: { productId: string; onHand: number; avgDaily: number }[] = [
  { productId: "P-101", onHand: 42, avgDaily: 6 },
  { productId: "P-102", onHand: 18, avgDaily: 2 },
  { productId: "P-111", onHand: 96, avgDaily: 9 },
  { productId: "P-112", onHand: 11, avgDaily: 3 },
  { productId: "P-121", onHand: 25, avgDaily: 2 },
  { productId: "P-141", onHand: 160, avgDaily: 14 },
  { productId: "P-151", onHand: 7, avgDaily: 4 },
  { productId: "P-131", onHand: 3, avgDaily: 1 },
];
export const ANNOUNCEMENTS: { id: string; title: string; body: string; date: string }[] = [
  { id: "AN-3", title: "Dashain combo starts 15 Sep", body: "Buy 5 Himal Fresh and 5 Crunchy cartons, get a Chiya Ghar 100g carton free.", date: "2026-09-03" },
  { id: "AN-2", title: "Price change on Pani 500ml", body: "New list price NPR 360 per case from 1 Sep.", date: "2026-08-28" },
  { id: "AN-1", title: "Pokhara retailer meet, 12 Sep", body: "Bring your top retailers — we cover the dinner.", date: "2026-08-26" },
];
