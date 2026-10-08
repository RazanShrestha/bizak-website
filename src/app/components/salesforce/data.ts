// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE v2 · DATA MODEL + SAMPLE DATA — plain data, no imports
//
// The prototype starts CLEAN: every store is empty and the user builds the
// business step by step (Home's "Getting started"). The SAMPLE_* sets below are
// loaded only when the user picks "Load sample data" (persist.ts). Nothing here
// imports another module (a cycle would leave one side undefined at load).
//
// What each shape stands for in the app (SFM-V2-BLUEPRINT §4):
//   CustomerType   new master — decides price list, credit policy, playbook, portal, DMS
//   Customer       the existing VISIT customer + type, parent ("served by"), tier, city, rep
//   Product        ITEM + brand + category
//   Scheme         the new scheme master (replaces the POS-only BRANDING_SCHEME)
//   HubOrder       the SALES_ORDER itself, seen with its source channel and review status
// ════════════════════════════════════════════════════════════════════════════

// Sample data is a frozen Friday, 4 Sep 2026 at 14:10; a clean start runs on the real clock.
const SAMPLE_MODE = (() => {
  try {
    return localStorage.getItem("sf2:mode") === "sample";
  } catch {
    return false;
  }
})();
const pad = (n: number) => String(n).padStart(2, "0");
const NOW = new Date();
export const SF_TODAY = SAMPLE_MODE ? "2026-09-04" : `${NOW.getFullYear()}-${pad(NOW.getMonth() + 1)}-${pad(NOW.getDate())}`;
/** A live binding: on a clean start it follows the real clock, so a visit checked in at 10:02 checks out at 10:19. */
export let SF_NOW = SAMPLE_MODE ? "14:10" : `${pad(NOW.getHours())}:${pad(NOW.getMinutes())}`;
if (!SAMPLE_MODE && typeof window !== "undefined") {
  window.setInterval(() => {
    const d = new Date();
    SF_NOW = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, 15_000);
}

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
  /** Days an invoice may be overdue before new orders are stopped (owner decision #2, default 7). */
  graceDays: number;
  color: number;
  blurb: string;
};

export const SAMPLE_CUSTOMER_TYPES: CustomerType[] = [
  { id: "T-SS", name: "Super-stockist", plural: "Super-stockists", level: "primary", priceOff: 16, creditDays: 45, creditStop: "soft", graceDays: 7, portal: "dealer", ownCustomers: true, playbookId: "PB-DIST", visitsPer4w: 2, color: 1, blurb: "Regional bulk node that supplies distributors." },
  { id: "T-DIST", name: "Distributor", plural: "Distributors", level: "primary", priceOff: 12, creditDays: 30, creditStop: "soft", graceDays: 7, portal: "dealer", ownCustomers: true, playbookId: "PB-DIST", visitsPer4w: 4, color: 2, blurb: "Buys from you, stocks, and sells to the retailers around it." },
  { id: "T-DEAL", name: "Dealer", plural: "Dealers", level: "primary", priceOff: 9, creditDays: 21, creditStop: "hard", graceDays: 7, portal: "dealer", ownCustomers: false, playbookId: "PB-DEAL", visitsPer4w: 4, color: 3, blurb: "Buys direct and sells to shops and end customers." },
  { id: "T-WHOL", name: "Wholesaler", plural: "Wholesalers", level: "secondary", priceOff: 6, creditDays: 15, creditStop: "hard", graceDays: 7, portal: "dealer", ownCustomers: false, playbookId: "PB-RET", visitsPer4w: 4, color: 4, blurb: "Bulk buyer that serves smaller shops." },
  { id: "T-RET", name: "Retailer", plural: "Retailers", level: "secondary", priceOff: 0, creditDays: 7, creditStop: "hard", graceDays: 7, portal: "retailer", ownCustomers: false, playbookId: "PB-RET", visitsPer4w: 4, color: 5, blurb: "Independent shop — visited by reps, served by a distributor." },
  { id: "T-MT", name: "Modern trade", plural: "Modern trade", level: "primary", priceOff: 10, creditDays: 45, creditStop: "soft", graceDays: 7, portal: "none", ownCustomers: false, playbookId: "PB-MT", visitsPer4w: 8, color: 6, blurb: "Supermarket chains — central buying, merchandisers in store." },
  { id: "T-HRC", name: "HoReCa", plural: "HoReCa", level: "direct", priceOff: 4, creditDays: 15, creditStop: "soft", graceDays: 7, portal: "none", ownCustomers: false, playbookId: "PB-HRC", visitsPer4w: 2, color: 7, blurb: "Hotels, restaurants and caterers." },
  { id: "T-INST", name: "Institution", plural: "Institutions", level: "direct", priceOff: 0, creditDays: 30, creditStop: "soft", graceDays: 7, portal: "none", ownCustomers: false, playbookId: null, visitsPer4w: 1, color: 8, blurb: "Offices, schools, hospitals — buy by quotation." },
];

// ── People ──────────────────────────────────────────────────────────────────

export type Rep = { id: string; name: string; initials: string; role: "Sales rep" | "Merchandiser" | "Area manager"; phone: string };
export const SAMPLE_REPS: Rep[] = [
  { id: "EMP-301", name: "Arun Rai", initials: "AR", role: "Sales rep", phone: "9800000301" },
  { id: "EMP-302", name: "Bina Thapa", initials: "BT", role: "Sales rep", phone: "9800000302" },
  { id: "EMP-313", name: "Esha Lama", initials: "EL", role: "Sales rep", phone: "9800000313" },
  { id: "EMP-314", name: "Farah Shah", initials: "FS", role: "Merchandiser", phone: "9800000314" },
  { id: "EMP-375", name: "Rajesh Shrestha", initials: "RS", role: "Area manager", phone: "9800000375" },
  { id: "EMP-320", name: "Sujan Tamang", initials: "ST", role: "Sales rep", phone: "9800000320" },
  { id: "EMP-321", name: "Pooja Gurung", initials: "PG", role: "Sales rep", phone: "9800000321" },
];

// ── Products and price lists ────────────────────────────────────────────────

export type Product = { id: string; code: string; name: string; brand: string; category: string; unit: string; pack: string; listPrice: number; cost: number; tone: number };
export const SAMPLE_PRODUCTS: Product[] = [
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
  repId: string | null;
  city: string;
  phone: string;
  /** null = no credit check; 0 = cash only (owner decision #2). What it owes lives in the ledger. */
  creditLimit: number | null;
  /** Where the outlet is (WGS84). Set from the customer page or saved by a rep on a visit; the geofence measures from it. */
  location?: { lat: number; lng: number } | null;
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

/**
 * Sample customers carry opening balances, which become ledger rows (SAMPLE_LEDGER), and the market they were placed
 * in — the sample builder's own key (where a shop sits, which days it is planned); neither is part of a customer.
 */
type SampleCustomer = Customer & { outstanding: number; overdue: number; market: string };
const PRIMARY: Omit<SampleCustomer, "code" | "since" | "status">[] = [
  { id: "C-5001", name: "Sagarmatha Distributors", typeId: "T-DIST", parentId: null, tier: "A", market: "T-BTW", repId: "EMP-321", city: "Butwal", phone: "071-540221", creditLimit: 1_500_000, outstanding: 984_300, overdue: 221_900, portalUsers: [{ name: "Ramesh Adhikari", role: "Owner", lastSeen: "2026-09-04" }, { name: "Sita Adhikari", role: "Accounts", lastSeen: "2026-09-02" }, { name: "Kiran Thapa", role: "Buyer", lastSeen: "2026-09-04" }] },
  { id: "C-5002", name: "Kathmandu Valley Traders", typeId: "T-DIST", parentId: null, tier: "A", market: "T-KTC", repId: "EMP-302", city: "Kathmandu", phone: "01-4251190", creditLimit: 2_000_000, outstanding: 1_912_000, overdue: 356_000, portalUsers: [{ name: "Bikash Joshi", role: "Owner", lastSeen: "2026-09-03" }] },
  { id: "C-5003", name: "Machhapuchhre Suppliers", typeId: "T-DIST", parentId: null, tier: "B", market: "T-PKC", repId: "EMP-321", city: "Pokhara", phone: "061-462015", creditLimit: 900_000, outstanding: 412_500, overdue: 0, portalUsers: [{ name: "Gita Gurung", role: "Owner", lastSeen: "2026-08-29" }] },
  { id: "C-5004", name: "Patan Merchandise House", typeId: "T-DIST", parentId: null, tier: "B", market: "T-PAT", repId: "EMP-313", city: "Lalitpur", phone: "01-5522840", creditLimit: 1_000_000, outstanding: 220_000, overdue: 0, portalUsers: [] },
  { id: "C-5010", name: "Everest Super Stockist", typeId: "T-SS", parentId: null, tier: "A", market: "T-KTW", repId: "EMP-375", city: "Kathmandu", phone: "01-4671122", creditLimit: 5_000_000, outstanding: 2_860_000, overdue: 0, portalUsers: [{ name: "Anil Shrestha", role: "Owner", lastSeen: "2026-09-04" }] },
  { id: "C-5020", name: "Bhaktapur Dealers Pvt. Ltd.", typeId: "T-DEAL", parentId: null, tier: "A", market: "T-BKT", repId: "EMP-313", city: "Bhaktapur", phone: "01-6611450", creditLimit: 600_000, outstanding: 598_000, overdue: 42_000, portalUsers: [{ name: "Suman Prajapati", role: "Owner", lastSeen: "2026-09-01" }] },
  { id: "C-5021", name: "Lakeside Trading Co.", typeId: "T-DEAL", parentId: null, tier: "B", market: "T-PKL", repId: "EMP-321", city: "Pokhara", phone: "061-463377", creditLimit: 400_000, outstanding: 96_000, overdue: 0, portalUsers: [{ name: "Deepak KC", role: "Owner", lastSeen: null }] },
  { id: "C-5022", name: "Kalanki Wholesale Dealer", typeId: "T-DEAL", parentId: null, tier: "B", market: "T-KTW", repId: "EMP-301", city: "Kathmandu", phone: "01-4280911", creditLimit: 500_000, outstanding: 188_000, overdue: 0, portalUsers: [] },
  { id: "C-5023", name: "Chabahil Distributors & Dealers", typeId: "T-DEAL", parentId: null, tier: "C", market: "T-KTE", repId: "EMP-320", city: "Kathmandu", phone: "01-4470312", creditLimit: 300_000, outstanding: 0, overdue: 0, portalUsers: [] },
  { id: "C-5030", name: "Bishal Mart Chain", typeId: "T-MT", parentId: null, tier: "A", market: "T-KTC", repId: "EMP-375", city: "Kathmandu", phone: "01-4228800", creditLimit: 3_000_000, outstanding: 1_240_000, overdue: 0, portalUsers: [] },
  { id: "C-5031", name: "Saleways Fresh", typeId: "T-MT", parentId: null, tier: "A", market: "T-PAT", repId: "EMP-314", city: "Lalitpur", phone: "01-5541312", creditLimit: 2_000_000, outstanding: 650_000, overdue: 0, portalUsers: [] },
  { id: "C-5040", name: "Hotel Annapurna View", typeId: "T-HRC", parentId: null, tier: "A", market: "T-PKL", repId: "EMP-321", city: "Pokhara", phone: "061-465220", creditLimit: 250_000, outstanding: 64_000, overdue: 0, portalUsers: [] },
  { id: "C-5041", name: "Thamel Kitchen Café", typeId: "T-HRC", parentId: null, tier: "B", market: "T-KTC", repId: "EMP-302", city: "Kathmandu", phone: "01-4700189", creditLimit: 120_000, outstanding: 18_500, overdue: 0, portalUsers: [] },
  { id: "C-5042", name: "Newa Banquet & Caterers", typeId: "T-HRC", parentId: null, tier: "B", market: "T-PAT", repId: "EMP-313", city: "Lalitpur", phone: "01-5530090", creditLimit: 200_000, outstanding: 0, overdue: 0, portalUsers: [] },
  { id: "C-5050", name: "Sunrise Boarding School", typeId: "T-INST", parentId: null, tier: "B", market: "T-KTE", repId: "EMP-375", city: "Kathmandu", phone: "01-4910234", creditLimit: 300_000, outstanding: 0, overdue: 0, portalUsers: [] },
  { id: "C-5051", name: "Om Hospital Canteen", typeId: "T-INST", parentId: null, tier: "C", market: "T-KTC", repId: "EMP-375", city: "Kathmandu", phone: "01-4476225", creditLimit: 150_000, outstanding: 22_000, overdue: 22_000, portalUsers: [] },
];

const SHOP = ["Shree Ganesh", "Laxmi", "Om Shanti", "Annapurna", "Sita Ram", "Durga", "Himal", "Pashupati", "Kalika", "Buddha", "Tara", "Janaki", "Mitra", "Sunrise", "Gorkha", "Muna", "Srijana", "Krishna", "Bagmati", "Newa", "Hari Om", "Chandra", "Bhawani", "Sahara", "Shiva Shakti", "Ujjwal", "Sabitri", "Dipak", "Maya", "Rara", "Kanchan", "Mahalaxmi", "Saraswati", "Bishnu", "Amrit", "Phewa", "Sagun", "Dhaulagiri", "Nilgiri", "Mustang"];
const KIND = ["Kirana Pasal", "General Store", "Mart", "Grocery", "Suppliers", "Bhandar", "Store", "Traders"];
const MARKET_NAME: Record<string, string> = { "T-KTW": "Kathmandu West", "T-KTC": "Kathmandu Core", "T-KTE": "Kathmandu East", "T-PAT": "Patan", "T-BKT": "Bhaktapur", "T-PKL": "Lakeside", "T-PKC": "Pokhara City", "T-BTW": "Butwal", "T-BHW": "Bhairahawa" };
const CITY: Record<string, string> = { "T-KTW": "Kathmandu", "T-KTC": "Kathmandu", "T-KTE": "Kathmandu", "T-PAT": "Lalitpur", "T-BKT": "Bhaktapur", "T-PKL": "Pokhara", "T-PKC": "Pokhara", "T-BTW": "Butwal", "T-BHW": "Bhairahawa" };
const SERVED_BY: Record<string, string> = { "T-KTW": "C-5002", "T-KTC": "C-5002", "T-KTE": "C-5002", "T-PAT": "C-5004", "T-BKT": "C-5004", "T-PKL": "C-5003", "T-PKC": "C-5003", "T-BTW": "C-5001", "T-BHW": "C-5001" };
const REP_OF: Record<string, string> = { "T-KTW": "EMP-301", "T-KTC": "EMP-302", "T-KTE": "EMP-320", "T-PAT": "EMP-313", "T-BKT": "EMP-313", "T-PKL": "EMP-321", "T-PKC": "EMP-321", "T-BTW": "EMP-321", "T-BHW": "EMP-321" };

// Where the sample outlets are. Each market has a centre and the bearing its round of shops starts from,
// and its shops sit on a loose ring around it, a few hundred metres apart, so a rep's beat is a walkable round.
const MARKET: Record<string, [lat: number, lng: number, turn: number]> = {
  "T-KTW": [27.695, 85.2862, 0.7],
  "T-KTC": [27.7062, 85.3128, 1.75],
  "T-KTE": [27.7092, 85.3424, 4.4],
  "T-PAT": [27.6712, 85.3232, 5.6],
  "T-BKT": [27.6722, 85.4288, 2.2],
  "T-PKL": [28.2096, 83.9584, 0.3],
  "T-PKC": [28.2204, 83.9882, 3.1],
  "T-BTW": [27.7004, 83.4502, 1.2],
  "T-BHW": [27.5056, 83.4498, 5],
};
/** The primaries' own addresses, and two shops that sit on the edge of their market. */
const PLACED: Record<string, [lat: number, lng: number]> = {
  "C-5001": [27.7012, 83.4476],
  "C-5002": [27.6968, 85.3072],
  "C-5003": [28.2231, 83.9871],
  "C-5004": [27.669, 85.318],
  "C-5010": [27.6992, 85.2954],
  "C-5020": [27.6731, 85.4279],
  "C-5021": [28.2071, 83.9602],
  "C-5022": [27.6962, 85.2838],
  "C-5023": [27.7177, 85.3462],
  "C-5030": [27.7041, 85.3118],
  "C-5031": [27.6795, 85.3104],
  "C-5040": [28.2118, 83.9571],
  "C-5041": [27.7154, 85.311],
  "C-5042": [27.6781, 85.3169],
  "C-5050": [27.7035, 85.3465],
  "C-5051": [27.7112, 85.319],
  "C-6004": [27.6838, 85.3046],
  "C-6021": [27.7065, 85.3262],
};
const r6 = (n: number) => Number(n.toFixed(6));
/** A point `metres` from `from`, on a bearing in radians (0 = north, clockwise). */
function pointFrom(from: { lat: number; lng: number }, bearing: number, metres: number) {
  return { lat: r6(from.lat + (metres * Math.cos(bearing)) / 111_320), lng: r6(from.lng + (metres * Math.sin(bearing)) / (111_320 * Math.cos((from.lat * Math.PI) / 180))) };
}
/** A sample outlet's location: its own address, or the k-th place on its market's ring. */
function sampleLocation(id: string, market: string, k: number): { lat: number; lng: number } | null {
  const own = PLACED[id];
  if (own) return { lat: own[0], lng: own[1] };
  const m = MARKET[market];
  return m ? pointFrom({ lat: m[0], lng: m[1] }, m[2] + k * 0.7, 520 + 240 * Math.sin(k * 1.9 + m[2])) : null;
}

function buildCustomers(): SampleCustomer[] {
  const r = prng(29092026);
  const out: SampleCustomer[] = PRIMARY.map((c, i) => ({ ...c, code: c.id, location: sampleLocation(c.id, c.market, 0), since: `202${3 + (i % 3)}-0${1 + (i % 9)}-1${i % 9}`, status: c.id === "C-5023" ? "onboarding" : c.id === "C-5051" ? "on hold" : "active" }));
  const markets = Object.keys(CITY);
  let n = 6001;
  const used = new Set<string>();
  for (let i = 0; i < 64; i++) {
    const t = markets[i % markets.length];
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
      market: t,
      repId: REP_OF[t],
      city: CITY[t],
      phone: `98${String(41000000 + Math.floor(r() * 8999999))}`,
      creditLimit: wholesale ? 150_000 : tier === "A" ? 60_000 : 30_000,
      location: sampleLocation(`C-${n}`, t, Math.floor(i / markets.length)),
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
const SAMPLE_BOOK = buildCustomers();
export const SAMPLE_CUSTOMERS: Customer[] = SAMPLE_BOOK.map(({ outstanding: _o, overdue: _d, market: _m, ...c }) => c);

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

export const SAMPLE_SCHEMES: Scheme[] = [
  { id: "SCH-021", name: "Buy 10 get 1 — Mango 1L", mechanic: { kind: "free-goods", buyItemIds: ["P-101"], buyQty: 10, getItemId: "same", getQty: 1 }, typeIds: ["T-RET", "T-WHOL"], tiers: [], from: "2026-09-01", to: "2026-10-31", status: "live", priority: 10, exclusive: false, budget: { kind: "qty", total: 800, used: 312 }, campaignId: "CMP-07", applies: "order", owner: "EMP-101" },
  { id: "SCH-022", name: "Crunchy volume slab", mechanic: { kind: "slab", itemIds: ["P-111", "P-112", "P-113"], slabs: [{ minQty: 50, pct: 3 }, { minQty: 100, pct: 5 }, { minQty: 200, pct: 7 }] }, typeIds: ["T-DIST", "T-SS"], tiers: [], from: "2026-08-01", to: "2026-12-31", status: "live", priority: 20, exclusive: false, budget: { kind: "value", total: 900_000, used: 412_300 }, campaignId: null, applies: "order", owner: "EMP-101" },
  { id: "SCH-023", name: "Dashain combo — Mango + Crunchy", mechanic: { kind: "combo", needs: [{ itemIds: ["P-101", "P-102"], qty: 5 }, { itemIds: ["P-111", "P-112", "P-113"], qty: 5 }], getItemId: "P-132", getQty: 1 }, typeIds: ["T-RET", "T-WHOL", "T-DEAL", "T-DIST"], tiers: [], from: "2026-09-15", to: "2026-10-20", status: "scheduled", priority: 15, exclusive: false, budget: { kind: "qty", total: 1_200, used: 0 }, campaignId: "CMP-07", applies: "order", owner: "EMP-101" },
  { id: "SCH-024", name: "2% off orders over 1 lakh", mechanic: { kind: "invoice-value", minValue: 100_000, pct: 2 }, typeIds: ["T-DEAL", "T-DIST", "T-SS"], tiers: [], from: "2026-07-17", to: "2027-07-16", status: "live", priority: 90, exclusive: false, budget: null, campaignId: null, applies: "order", owner: "EMP-118" },
  { id: "SCH-025", name: "Welcome 5% — first order", mechanic: { kind: "first-order", pct: 5 }, typeIds: ["T-RET", "T-WHOL"], tiers: [], from: "2026-07-17", to: "2027-07-16", status: "live", priority: 5, exclusive: true, budget: { kind: "value", total: 150_000, used: 38_200 }, campaignId: null, applies: "order", owner: "EMP-101" },
  { id: "SCH-026", name: "Quarterly target rebate 3%", mechanic: { kind: "target-rebate", target: 3_000_000, pct: 3, period: "Jul – Sep 2026" }, typeIds: ["T-DIST"], tiers: ["A", "B"], from: "2026-07-01", to: "2026-09-30", status: "live", priority: 50, exclusive: false, budget: { kind: "value", total: 400_000, used: 0 }, campaignId: null, applies: "period", owner: "EMP-118" },
  { id: "SCH-027", name: "Mango chiller display", mechanic: { kind: "display", amount: 1_500, per: "month" }, typeIds: ["T-RET"], tiers: ["A"], from: "2026-09-01", to: "2026-11-30", status: "live", priority: 40, exclusive: false, budget: { kind: "value", total: 180_000, used: 42_000 }, campaignId: "CMP-07", applies: "claim", owner: "EMP-101" },
  { id: "SCH-028", name: "Pay in 7 days — 2% off", mechanic: { kind: "early-payment", pct: 2, withinDays: 7 }, typeIds: ["T-DEAL", "T-DIST"], tiers: [], from: "2026-07-17", to: "2027-07-16", status: "live", priority: 60, exclusive: false, budget: null, campaignId: null, applies: "payment", owner: "EMP-118" },
  { id: "SCH-019", name: "Monsoon noodles 4+1", mechanic: { kind: "free-goods", buyItemIds: ["P-151", "P-152"], buyQty: 4, getItemId: "same", getQty: 1 }, typeIds: ["T-RET"], tiers: [], from: "2026-06-15", to: "2026-08-31", status: "ended", priority: 10, exclusive: false, budget: { kind: "qty", total: 600, used: 588 }, campaignId: null, applies: "order", owner: "EMP-101" },
  { id: "SCH-029", name: "Cup noodles launch 8%", mechanic: { kind: "slab", itemIds: ["P-153"], slabs: [{ minQty: 5, pct: 8 }] }, typeIds: ["T-RET", "T-WHOL", "T-MT"], tiers: [], from: "2026-10-01", to: "2026-10-31", status: "draft", priority: 12, exclusive: false, budget: { kind: "value", total: 120_000, used: 0 }, campaignId: "CMP-08", applies: "order", owner: "EMP-101" },
];

// ── Orders hub ──────────────────────────────────────────────────────────────

export type Source = "rep" | "portal" | "whatsapp" | "retailer-app" | "back-office";
export type HubStatus = "review" | "ready" | "approved" | "rejected";
/**
 * An order from any channel IS the Bizak sales order (owner decision #31): one record, one number. This is its
 * channel and review side — who placed it and through what, and whether it still waits for a look.
 */
export type HubOrder = {
  /** The sales order's number (SO-…) — the same record the sales desk shows. */
  id: string;
  customerId: string;
  source: Source;
  byName: string;
  repId: string | null;
  at: string; // "2026-09-04 11:20"
  lines: { productId: string; qty: number; price?: number; fixed?: boolean }[];
  note: string;
  status: HubStatus;
  rejectReason?: string;
  /**
   * The shop the order was taken FOR when it is billed to the distributor that serves that shop (owner decision
   * #26). customerId is then the distributor: the order is to the distributor (its PO on the portal), priced and
   * credit-checked as the distributor, and the distributor delivers to and bills the shop in its own system.
   * null/absent = a direct order: its customer is the shop itself.
   */
  forCustomerId?: string | null;
  /** The estimate (and its accepted version) this order came from — its lines are the negotiated ones (decision #27). */
  estimateId?: string | null;
  estimateVersion?: number | null;
  /** Terms agreed on the estimate; they override the customer type's defaults for this order. */
  terms?: { paymentDays: number; payment: string; delivery: string; deliverBy: string | null } | null;
};

export const SAMPLE_HUB_ORDERS: HubOrder[] = [
  { id: "SO-4217", customerId: "C-6037", source: "rep", byName: "Arun Rai", repId: "EMP-301", at: "2026-09-04 13:45", lines: [{ productId: "P-103", qty: 8 }, { productId: "P-152", qty: 6 }], note: "", status: "approved" },
  { id: "SO-4208", customerId: "C-5001", source: "portal", byName: "Kiran Thapa", repId: "EMP-321", at: "2026-09-04 13:42", lines: [{ productId: "P-101", qty: 60 }, { productId: "P-111", qty: 120 }, { productId: "P-121", qty: 40 }, { productId: "P-141", qty: 200 }], note: "Please send before Dashain rush.", status: "review" },
  { id: "SO-4216", customerId: "C-6057", source: "rep", byName: "Sujan Tamang", repId: "EMP-320", at: "2026-09-04 12:58", lines: [{ productId: "P-123", qty: 3 }, { productId: "P-122", qty: 2 }], note: "", status: "approved" },
  { id: "SO-4207", customerId: "C-5002", source: "portal", byName: "Bikash Joshi", repId: "EMP-302", at: "2026-09-04 12:15", lines: [{ productId: "P-111", qty: 220 }, { productId: "P-112", qty: 80 }, { productId: "P-151", qty: 150 }], note: "", status: "review" },
  { id: "SO-4206", customerId: "C-6004", source: "rep", byName: "Arun Rai", repId: "EMP-301", at: "2026-09-04 11:58", lines: [{ productId: "P-101", qty: 10 }, { productId: "P-151", qty: 6 }], note: "", status: "ready" },
  { id: "SO-4215", customerId: "C-6020", source: "rep", byName: "Bina Thapa", repId: "EMP-302", at: "2026-09-04 11:48", lines: [{ productId: "P-102", qty: 6 }, { productId: "P-112", qty: 5 }], note: "", status: "approved" },
  { id: "SO-4214", customerId: "C-6039", source: "rep", byName: "Sujan Tamang", repId: "EMP-320", at: "2026-09-04 11:32", lines: [{ productId: "P-151", qty: 8 }, { productId: "P-153", qty: 2 }], note: "", status: "approved" },
  { id: "SO-4205", customerId: "C-5020", source: "whatsapp", byName: "Suman Prajapati", repId: "EMP-313", at: "2026-09-04 11:10", lines: [{ productId: "P-121", qty: 30 }, { productId: "P-122", qty: 25 }, { productId: "P-123", qty: 12 }], note: "Sent on WhatsApp, confirmed by Esha.", status: "review" },
  { id: "SO-4213", customerId: "C-6022", source: "rep", byName: "Esha Lama", repId: "EMP-313", at: "2026-09-04 11:05", lines: [{ productId: "P-131", qty: 1 }, { productId: "P-113", qty: 4 }], note: "", status: "approved" },
  { id: "SO-4212", customerId: "C-6002", source: "rep", byName: "Bina Thapa", repId: "EMP-302", at: "2026-09-04 10:37", lines: [{ productId: "P-121", qty: 4 }, { productId: "P-122", qty: 3 }], note: "", status: "approved" },
  { id: "SO-4204", customerId: "C-6013", source: "retailer-app", byName: "Owner", repId: "EMP-320", at: "2026-09-04 10:36", lines: [{ productId: "P-141", qty: 20 }, { productId: "P-142", qty: 10 }], note: "", status: "ready" },
  { id: "SO-4203", customerId: "C-5030", source: "back-office", byName: "Sneha Maharjan", repId: "EMP-375", at: "2026-09-04 10:05", lines: [{ productId: "P-101", qty: 80 }, { productId: "P-102", qty: 60 }, { productId: "P-113", qty: 40 }], note: "PO BMC/2083/0917", status: "ready" },
  { id: "SO-4211", customerId: "C-6001", source: "rep", byName: "Arun Rai", repId: "EMP-301", at: "2026-09-04 10:00", lines: [{ productId: "P-102", qty: 5 }, { productId: "P-152", qty: 4 }], note: "", status: "approved" },
  { id: "SO-4202", customerId: "C-6021", source: "rep", byName: "Bina Thapa", repId: "EMP-302", at: "2026-09-04 09:52", lines: [{ productId: "P-111", qty: 8 }, { productId: "P-131", qty: 1 }], note: "", status: "approved" },
  { id: "SO-4210", customerId: "C-5022", source: "rep", byName: "Arun Rai", repId: "EMP-301", at: "2026-09-04 09:28", lines: [{ productId: "P-101", qty: 12 }, { productId: "P-111", qty: 20 }, { productId: "P-151", qty: 15 }], note: "", status: "approved" },
  { id: "SO-4209", customerId: "C-6003", source: "rep", byName: "Sujan Tamang", repId: "EMP-320", at: "2026-09-04 09:21", lines: [{ productId: "P-101", qty: 10 }, { productId: "P-112", qty: 3 }], note: "", status: "approved" },
  { id: "SO-4201", customerId: "C-5040", source: "rep", byName: "Pooja Gurung", repId: "EMP-321", at: "2026-09-03 17:20", lines: [{ productId: "P-141", qty: 40 }, { productId: "P-131", qty: 2 }], note: "", status: "approved" },
  { id: "SO-4200", customerId: "C-5051", source: "rep", byName: "Rajesh Shrestha", repId: "EMP-375", at: "2026-09-03 15:44", lines: [{ productId: "P-131", qty: 3 }], note: "", status: "review" },
  { id: "SO-4199", customerId: "C-6030", source: "rep", byName: "Esha Lama", repId: "EMP-313", at: "2026-09-03 14:03", lines: [{ productId: "P-101", qty: 22 }], note: "", status: "approved" },
  { id: "SO-4198", customerId: "C-6011", source: "retailer-app", byName: "Owner", repId: "EMP-301", at: "2026-09-03 12:41", lines: [{ productId: "P-152", qty: 4 }], note: "", status: "rejected", rejectReason: "Duplicate of SO-4194." },
  { id: "SO-4197", customerId: "C-5010", source: "portal", byName: "Anil Shrestha", repId: "EMP-375", at: "2026-09-03 11:02", lines: [{ productId: "P-101", qty: 300 }, { productId: "P-111", qty: 400 }, { productId: "P-121", qty: 150 }], note: "", status: "approved" },
];

// ── Campaigns, branding, events, claims ─────────────────────────────────────

export type Campaign = {
  id: string;
  name: string;
  objective: string;
  status: "live" | "planned" | "ended" | "draft";
  from: string;
  to: string;
  audience: { typeIds: string[]; outlets: number };
  budget: number;
  spent: number;
  schemeIds: string[];
  brandingIds: string[];
  eventIds: string[];
  tasks: { title: string; activity: string; done: number; total: number }[];
  kpi: { label: string; target: number; actual: number; unit: string }[];
  owner: string;
};

export const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: "CMP-07",
    name: "Dashain with Himal Fresh",
    objective: "Grow Himal Fresh juice volume 25% over last Dashain in general trade.",
    status: "live",
    from: "2026-09-01",
    to: "2026-10-31",
    audience: { typeIds: ["T-RET", "T-WHOL", "T-DEAL", "T-DIST"], outlets: 412 },
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
    audience: { typeIds: ["T-RET", "T-WHOL", "T-MT"], outlets: 300 },
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
    audience: { typeIds: ["T-RET"], outlets: 280 },
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
export const SAMPLE_POSM: PosmItem[] = [
  { id: "PM-1", name: "Glow sign board", unit: "board", cost: 18_500, stock: 12, vendor: "Kathmandu Signs" },
  { id: "PM-2", name: "Floor standee", unit: "piece", cost: 2_400, stock: 64, vendor: "PrintHub Nepal" },
  { id: "PM-3", name: "Shelf strip", unit: "set", cost: 450, stock: 380, vendor: "PrintHub Nepal" },
  { id: "PM-4", name: "Visi-cooler (200L)", unit: "cooler", cost: 62_000, stock: 5, vendor: "Coolex Traders" },
  { id: "PM-5", name: "Wall painting", unit: "wall", cost: 14_000, stock: 0, vendor: "Brush & Co." },
  { id: "PM-6", name: "Counter top dispenser", unit: "piece", cost: 1_200, stock: 140, vendor: "PrintHub Nepal" },
];

export type BrandingStage = "requested" | "approved" | "installing" | "installed" | "rejected";
export type BrandingJob = { id: string; customerId: string; posmId: string; qty: number; stage: BrandingStage; requestedBy: string; requestedOn: string; campaignId: string | null; proof: boolean; note: string; installedOn: string | null };
export const SAMPLE_BRANDING: BrandingJob[] = [
  { id: "BR-301", customerId: "C-6004", posmId: "PM-4", qty: 1, stage: "installed", requestedBy: "Arun Rai", requestedOn: "2026-08-22", campaignId: "CMP-07", proof: true, note: "Chiller near the counter.", installedOn: "2026-08-30" },
  { id: "BR-302", customerId: "C-6011", posmId: "PM-2", qty: 2, stage: "installing", requestedBy: "Arun Rai", requestedOn: "2026-08-28", campaignId: "CMP-07", proof: false, note: "", installedOn: null },
  { id: "BR-303", customerId: "C-5001", posmId: "PM-1", qty: 1, stage: "requested", requestedBy: "Ramesh Adhikari (portal)", requestedOn: "2026-09-03", campaignId: null, proof: false, note: "New warehouse front.", installedOn: null },
  { id: "BR-304", customerId: "C-6021", posmId: "PM-3", qty: 4, stage: "approved", requestedBy: "Bina Thapa", requestedOn: "2026-09-02", campaignId: null, proof: false, note: "", installedOn: null },
  { id: "BR-305", customerId: "C-6030", posmId: "PM-5", qty: 1, stage: "requested", requestedBy: "Esha Lama", requestedOn: "2026-09-04", campaignId: "CMP-07", proof: false, note: "Side wall facing the main road.", installedOn: null },
  { id: "BR-306", customerId: "C-5030", posmId: "PM-6", qty: 20, stage: "approved", requestedBy: "Rajesh Shrestha", requestedOn: "2026-09-01", campaignId: "CMP-08", proof: false, note: "All 4 branches.", installedOn: null },
  { id: "BR-298", customerId: "C-6040", posmId: "PM-2", qty: 1, stage: "rejected", requestedBy: "Sujan Tamang", requestedOn: "2026-08-19", campaignId: null, proof: false, note: "Shop too small for a standee.", installedOn: null },
];

export type SfEvent = { id: string; name: string; kind: "Retailer meet" | "Launch" | "Sampling" | "Dealer conference"; date: string; place: string; status: "planned" | "done" | "live"; invited: number; confirmed: number; attended: number | null; cost: number; orders: number; leads: number; campaignId: string | null };
export const SAMPLE_EVENTS: SfEvent[] = [
  { id: "EV-41", name: "Pokhara retailer meet", kind: "Retailer meet", date: "2026-09-12", place: "Hotel Annapurna View, Pokhara", status: "planned", invited: 120, confirmed: 74, attended: null, cost: 95_000, orders: 0, leads: 0, campaignId: "CMP-07" },
  { id: "EV-43", name: "Dashain sampling — New Road", kind: "Sampling", date: "2026-09-05", place: "New Road gate, Kathmandu", status: "planned", invited: 0, confirmed: 0, attended: null, cost: 40_000, orders: 0, leads: 0, campaignId: "CMP-07" },
  { id: "EV-44", name: "Cup Noodles launch", kind: "Launch", date: "2026-10-02", place: "Hotel Yak & Yeti, Kathmandu", status: "planned", invited: 60, confirmed: 18, attended: null, cost: 180_000, orders: 0, leads: 0, campaignId: "CMP-08" },
  { id: "EV-42", name: "Butwal retailer meet", kind: "Retailer meet", date: "2026-09-02", place: "Hotel Nirvana, Butwal", status: "planned", invited: 80, confirmed: 52, attended: null, cost: 70_000, orders: 0, leads: 0, campaignId: null },
  { id: "EV-39", name: "Distributor conference 2083", kind: "Dealer conference", date: "2026-08-20", place: "Butwal", status: "done", invited: 14, confirmed: 13, attended: 12, cost: 210_000, orders: 9, leads: 2, campaignId: null },
];

export type ClaimKind = "Scheme" | "Display" | "Damage" | "Price difference" | "Expense";
export type Claim = { id: string; kind: ClaimKind; party: string; partyKind: "customer" | "rep"; amount: number; raisedOn: string; status: "submitted" | "approved" | "settled" | "rejected"; basis: string; schemeId: string | null; settledBy: string | null };
export const SAMPLE_CLAIMS: Claim[] = [
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
/** The built-in activity library — system data, present on a clean start too. */
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
  { id: "AC-SEC", name: "Ask about sales to shops", kind: "form", detail: "What the distributor says it sold since the last visit" },
];

export type PlaybookItem = { activityId: string; required: boolean; geofence: boolean; when: "every visit" | "weekly" | "monthly" | "during campaign" };
export type Playbook = { id: string; name: string; forTypeIds: string[]; items: PlaybookItem[] };
export const SAMPLE_PLAYBOOKS: Playbook[] = [
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
  { key: "secondary", name: "Dealer notebook", blurb: "Dealers keep their own sales and stock notes on the portal", on: true },
  { key: "van-sales", name: "Van sales", blurb: "Sell and deliver from the van", on: false },
];

// ── Targets ─────────────────────────────────────────────────────────────────

/** A rep's monthly target ("2026-09"). Actuals are never stored — they are counted from orders and visits. */
export type Target = { repId: string; month: string; salesTarget: number; outletsTarget: number; newOutletsTarget: number };
const SAMPLE_TARGET_ROWS = [
  { repId: "EMP-301", month: "Sep 2026", salesTarget: 1_600_000, salesActual: 512_000, outletsTarget: 90, outletsActual: 34, newOutlets: 2, incentive: 0 },
  { repId: "EMP-302", month: "Sep 2026", salesTarget: 1_800_000, salesActual: 468_000, outletsTarget: 95, outletsActual: 30, newOutlets: 1, incentive: 0 },
  { repId: "EMP-313", month: "Sep 2026", salesTarget: 1_400_000, salesActual: 301_000, outletsTarget: 80, outletsActual: 18, newOutlets: 0, incentive: 0 },
  { repId: "EMP-314", month: "Sep 2026", salesTarget: 900_000, salesActual: 262_000, outletsTarget: 60, outletsActual: 26, newOutlets: 0, incentive: 0 },
  { repId: "EMP-320", month: "Sep 2026", salesTarget: 1_200_000, salesActual: 390_000, outletsTarget: 85, outletsActual: 31, newOutlets: 3, incentive: 0 },
  { repId: "EMP-321", month: "Sep 2026", salesTarget: 2_200_000, salesActual: 820_000, outletsTarget: 110, outletsActual: 41, newOutlets: 4, incentive: 0 },
];

export const SAMPLE_TARGETS: Target[] = SAMPLE_TARGET_ROWS.map((t) => ({ repId: t.repId, month: "2026-09", salesTarget: t.salesTarget, outletsTarget: t.outletsTarget, newOutletsTarget: Math.max(3, Math.round(t.outletsTarget / 20)) }));

// ── Money: the customer ledger ──────────────────────────────────────────────

/**
 * Every rupee a customer owes or has paid. Outstanding, overdue and available credit are always COUNTED from these
 * rows (engine.accountOf), never stored on the customer. In the app these are the real invoices, receipts and credit
 * memos; the prototype bills an order when the hub approves it (a shortcut — in Bizak the invoice follows delivery).
 */
export type LedgerKind = "Opening" | "Invoice" | "Receipt" | "Credit note";
export type PayMethod = "bank" | "cheque" | "cash" | "wallet";
export type LedgerEntry = {
  id: string;
  customerId: string;
  date: string;
  doc: string;
  kind: LedgerKind;
  debit: number;
  credit: number;
  /** Invoices and openings only. */
  due: string | null;
  /**
   * A Receipt row stands for a customer receipt on the sales desk (`doc` is its number) and follows it (receipts.ts).
   * Pending = that receipt — sent by the dealer or collected by a rep — still waits for accounts to approve it; an
   * early-payment credit note is pending with its receipt. Pending rows count for nothing.
   */
  pending?: boolean;
  /**
   * The invoices this money was APPLIED to (owner decision #33). A receipt is only ever applied to invoices. What
   * its lines leave over is the customer's advance. Absent = a receipt from before lines existed: it settles the
   * oldest invoice first, as it always did.
   */
  applied?: { doc: string; amount: number }[];
  /**
   * The SALES ORDERS this money is FOR — a reference with an amount, nothing more: the money stays an advance and is
   * applied to nothing. Only that order's invoices may take a tagged amount; the untagged rest may go to any invoice.
   */
  tags?: { doc: string; amount: number }[];
  method?: PayMethod;
  reference?: string;
  by?: string;
  note?: string;
};

const SAMPLE_DEALER_ROWS: Omit<LedgerEntry, "id" | "customerId">[] = [
  { date: "2026-07-17", doc: "Opening balance", kind: "Opening", debit: 612_000, credit: 0, due: "2026-07-17" },
  { date: "2026-07-22", doc: "INV-8702", kind: "Invoice", debit: 284_500, credit: 0, due: "2026-08-21" },
  { date: "2026-07-30", doc: "RCP-0301", kind: "Receipt", debit: 0, credit: 400_000, due: null },
  { date: "2026-08-06", doc: "INV-8744", kind: "Invoice", debit: 336_200, credit: 0, due: "2026-09-05" },
  { date: "2026-08-12", doc: "CM-0205", kind: "Credit note", debit: 0, credit: 24_600, due: null },
  { date: "2026-08-19", doc: "INV-8790", kind: "Invoice", debit: 198_400, credit: 0, due: "2026-09-18" },
  { date: "2026-08-25", doc: "RCP-0352", kind: "Receipt", debit: 0, credit: 250_000, due: null },
  { date: "2026-09-01", doc: "INV-8831", kind: "Invoice", debit: 227_800, credit: 0, due: "2026-10-01" },
];

/** Opening balances for the sample book: the overdue part is an old invoice, the rest is current. */
export const SAMPLE_LEDGER: LedgerEntry[] = SAMPLE_BOOK.flatMap((c): LedgerEntry[] => {
  if (c.id === "C-5001") return SAMPLE_DEALER_ROWS.map((r, i) => ({ ...r, id: `L-${c.id}-${i}`, customerId: c.id }));
  const rows: LedgerEntry[] = [];
  if (c.overdue > 0) rows.push({ id: `L-${c.id}-o`, customerId: c.id, date: "2026-07-20", doc: "Opening balance (overdue)", kind: "Opening", debit: c.overdue, credit: 0, due: "2026-08-19" });
  if (c.outstanding - c.overdue > 0) rows.push({ id: `L-${c.id}-c`, customerId: c.id, date: "2026-08-25", doc: "Opening balance", kind: "Opening", debit: c.outstanding - c.overdue, credit: 0, due: "2026-09-24" });
  return rows;
});

// ── Field: journey plan and visits ──────────────────────────────────────────

/** every: 1 = weekly, 2 = every other week, 4 = once in four weeks. day: 1 = Monday … 6 = Saturday. */
export type Cadence = 1 | 2 | 4;
/**
 * One customer due with one rep on one weekday. Since owner decision #28 this is DERIVED — a row per stop of every
 * planned route (store.ts `planStore`) — never stored: the plan is routes on days, not customers on days.
 */
export type PlanEntry = { id: string; repId: string; customerId: string; day: number; every: Cadence; routeId?: string; planId?: string };

/** One customer on a route. `every` = how often the route's run includes it (from its type's visits per 4 weeks). */
export type RouteStop = { customerId: string; every: Cadence };
/**
 * A route — the trade's "beat": a named group of customers, in the order they are visited. A route is its name and
 * its customers, nothing else (owner decision #29).
 */
export type Route = { id: string; name: string; stops: RouteStop[] };
/** A route given to a rep on a weekday. A route may run on several days, and be handed to another rep in one move. */
export type RoutePlan = { id: string; routeId: string; repId: string; day: number };

const DAY_SHORT = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/**
 * Turns a per-customer plan (how the prototype planned before decision #28) into routes: each rep's customers on a
 * weekday become one route, in the order they were planned, named after the place most of them are in (`placeOf`).
 * `ids` maps each old entry id to the derived entry that replaces it (the cadence anchors are keyed by entry id).
 */
export function routesFromPlan(entries: PlanEntry[], placeOf: (customerId: string) => string | undefined): { routes: Route[]; plans: RoutePlan[]; ids: Record<string, string> } {
  const routes: Route[] = [];
  const plans: RoutePlan[] = [];
  const ids: Record<string, string> = {};
  const groups = new Map<string, PlanEntry[]>();
  for (const e of entries) {
    const k = `${e.repId}|${e.day}`;
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  const used = new Map<string, number>();
  [...groups.values()].forEach((group, n) => {
    const tally = new Map<string, number>();
    for (const e of group) {
      const t = placeOf(e.customerId);
      if (t) tally.set(t, (tally.get(t) ?? 0) + 1);
    }
    const place = [...tally].sort((a, b) => b[1] - a[1])[0]?.[0];
    const base = `${place || "Route"} · ${DAY_SHORT[group[0].day] ?? "day"}`;
    const seen = (used.get(base) ?? 0) + 1;
    used.set(base, seen);
    const routeId = `RT-${String(n + 1).padStart(2, "0")}`;
    const planId = `RP-${String(n + 1).padStart(3, "0")}`;
    const stops: RouteStop[] = [];
    for (const e of group) {
      if (!stops.some((s) => s.customerId === e.customerId)) stops.push({ customerId: e.customerId, every: e.every });
      ids[e.id] = `${planId}:${e.customerId}`;
    }
    routes.push({ id: routeId, name: seen > 1 ? `${base} ${seen}` : base, stops });
    plans.push({ id: planId, routeId, repId: group[0].repId, day: group[0].day });
  });
  return { routes, plans, ids };
}

export type VisitState = "in-progress" | "done" | "skipped";
export type ActResult = { activityId: string; required: boolean; geofence: boolean; done: boolean; result: string };
export type Visit = {
  id: string;
  date: string;
  repId: string;
  customerId: string;
  planned: boolean;
  state: VisitState;
  checkIn: string | null;
  checkOut: string | null;
  /**
   * Where the rep was at check-in, from the phone's GPS. `metres` = distance to the outlet's saved location (null when
   * the outlet has no location yet); `ok` = within the tenant's radius. `manual` = no GPS fix, the rep said they were
   * there — the office sees that flag.
   */
  geofence: { ok: boolean; metres: number | null; lat?: number; lng?: number; accuracy?: number; manual?: boolean } | null;
  /** The order this visit took — its sales order number (SO-…). */
  orderId: string | null;
  /** The route the rep was running when this visit began; null/absent for a visit off any route. */
  routeId?: string | null;
  noOrderReason: string | null;
  skipReason: string | null;
  acts: ActResult[];
  photos: number;
};

// ── Dealer's own business (DMS lite) ────────────────────────────────────────

/** A dealer's sale to one of its own customers, entered on the portal (owner decision #13). */
export type SecondarySale = { id: string; dealerId: string; retailerId: string | null; retailerName: string; date: string; lines: { productId: string; qty: number; price: number }[] };

// ── Quotations (RFQ → estimate) ─────────────────────────────────────────────

export type QuoteLine = { productId: string; qty: number; price: number | null };
export type Quote = {
  id: string;
  customerId: string;
  at: string;
  byName: string;
  lines: QuoteLine[];
  note: string;
  status: "requested" | "quoted" | "accepted" | "declined";
  estimateNo: string | null;
  validTill: string | null;
  reply: string | null;
  orderId: string | null;
  quotedOn: string | null;
  acceptedAt: string | null;
};

// ── Portal ──────────────────────────────────────────────────────────────────

export type PortalCan = "order" | "statement" | "pay" | "claims" | "rfq" | "dms" | "branding";
export type PortalSettings = { brand: string; can: Record<PortalCan, boolean>; autoApproveUpTo: number; minOrder: number; cutoff: string; welcome: string };
export const DEFAULT_PORTAL: PortalSettings = {
  brand: "Dealer portal",
  can: { order: true, statement: true, pay: true, claims: true, rfq: true, dms: true, branding: true },
  // Owner decision #4: within credit and at most this much → approved on arrival.
  autoApproveUpTo: 200_000,
  minOrder: 0,
  cutoff: "15:00",
  welcome: "Order, pay and track your account here.",
};

export type Announcement = { id: string; title: string; body: string; date: string };
export const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  { id: "AN-3", title: "Dashain combo starts 15 Sep", body: "Buy 5 Himal Fresh and 5 Crunchy cartons, get a Chiya Ghar 100g carton free.", date: "2026-09-03" },
  { id: "AN-2", title: "Price change on Pani 500ml", body: "New list price NPR 360 per case from 1 Sep.", date: "2026-08-28" },
  { id: "AN-1", title: "Pokhara retailer meet, 12 Sep", body: "Bring your top retailers — we cover the dinner.", date: "2026-08-26" },
];

// ── Records: History and Notes (every record has both) ──────────────────────

export type LogRow = { id: string; who: string; when: string; what: string };
/** `shared` notes are the only ones a dealer sees on the portal (owner decision #19). */
export type Note = { id: string; who: string; when: string; body: string; shared: boolean };

// ── Field: where reps are ───────────────────────────────────────────────────

/** One GPS reading from the rep app (check-in, check-out or a manual "update my location"). */
export type LocationPing = { id: string; repId: string; at: string; lat: number; lng: number; accuracy: number; kind: "check-in" | "check-out" | "update"; visitId: string | null; customerId: string | null };
export type FieldSettings = { geofenceMetres: number };

// ── Opportunities (decisions #27, #32) ──────────────────────────────────────
//
// A dealer's price request (RFQ) on the portal is an OPPORTUNITY for the tenant. The tenant answers it with an
// ESTIMATE — the sales desk's own (sales/flow.tsx `Estimate`), sent in versions, which the customer accepts, declines
// or asks to change (sales/estimate-offer.ts). The version the customer accepts becomes the tenant's sales order
// (the dealer's purchase). The opportunity's stage follows the estimate (estimates.ts).

export type OppStage = "new" | "proposal" | "negotiation" | "won" | "lost";
export type OppSource = "portal-rfq" | "rep" | "office";
export type RfqLine = { productId: string; qty: number; note?: string };
export type Opportunity = {
  id: string; // OPP-0001
  customerId: string;
  title: string;
  source: OppSource;
  /** The number the dealer sees for its request (RFQ-0001); null when the tenant logged the opportunity itself. */
  rfqNo: string | null;
  /** What was asked for. From the portal it is the dealer's RFQ; a rep or the office can note it too. */
  request: { lines: RfqLine[]; note: string; deliverBy: string | null; paymentWish: string | null; byName: string; at: string } | null;
  repId: string | null;
  stage: OppStage;
  /** The latest estimate's total, or the tenant's guess before one exists. */
  expectedValue: number;
  expectedClose: string | null;
  createdAt: string;
  lostReason: string | null;
  orderId: string | null;
};

// ── Sample field: the week's plan, and Friday 4 Sep up to 14:10 ─────────────
//
// Sample mode only (store.ts). The sample day is a Friday mid-afternoon: one rep at a shop, three on their beats,
// one finished, one not started and one with no beat. Every order a visit names is in SAMPLE_HUB_ORDERS.

const SAMPLE_DAY = "2026-09-04";

/** Friday's beat for each rep, in the order they walk it. */
const SAMPLE_BEATS: Record<string, string[]> = {
  "EMP-301": ["C-5022", "C-6001", "C-6010", "C-6019", "C-6028", "C-6037", "C-6046", "C-6055"],
  "EMP-302": ["C-6002", "C-6011", "C-6020", "C-6029", "C-6038", "C-6047", "C-6056", "C-5041"],
  "EMP-313": ["C-5042", "C-6013", "C-6022", "C-6031", "C-6040", "C-6049", "C-6058"],
  "EMP-314": ["C-5030", "C-5031", "C-6012"],
  "EMP-320": ["C-6003", "C-5023", "C-6030", "C-6039", "C-6048", "C-6057"],
  "EMP-375": ["C-5010", "C-5051", "C-5050"],
};
/** The other days each market is worked (1 = Monday); its remaining outlets take them in turn. */
const SAMPLE_OTHER_DAYS: Record<string, number[]> = { "T-KTW": [1, 3], "T-KTC": [2, 4], "T-KTE": [1, 4], "T-PAT": [1, 3], "T-BKT": [2, 4], "T-PKL": [1, 6], "T-PKC": [2, 6], "T-BTW": [3], "T-BHW": [4] };

/** `out` missing = still there; `skip` = skipped before check-in; `fix` = the check-in was away from the shop, or had no GPS. */
type SampleCall = { rep: string; c: string; in: string; out?: string; order?: string; no?: string; skip?: string; fix?: "away" | "manual" };
const SAMPLE_CALLS: SampleCall[] = [
  // Arun Rai — Kathmandu West: on the beat, six of eight, and one shop he was not due at.
  { rep: "EMP-301", c: "C-5022", in: "09:05", out: "09:31", order: "SO-4210" },
  { rep: "EMP-301", c: "C-6001", in: "09:42", out: "10:04", order: "SO-4211" },
  { rep: "EMP-301", c: "C-6010", in: "10:16", out: "10:30", no: "Has enough stock" },
  { rep: "EMP-301", c: "C-6019", in: "10:44", out: "10:52", no: "Owner not in", fix: "away" },
  { rep: "EMP-301", c: "C-6004", in: "11:34", out: "12:02", order: "SO-4206" },
  { rep: "EMP-301", c: "C-6028", in: "12:50", out: "13:12", no: "Price or offer not right" },
  { rep: "EMP-301", c: "C-6037", in: "13:26", out: "13:50", order: "SO-4217" },
  // Bina Thapa — Kathmandu Core: at a shop now.
  { rep: "EMP-302", c: "C-6021", in: "09:38", out: "09:56", order: "SO-4202" },
  { rep: "EMP-302", c: "C-6002", in: "10:14", out: "10:40", order: "SO-4212" },
  { rep: "EMP-302", c: "C-6011", in: "10:52", out: "11:07", no: "Has enough stock" },
  { rep: "EMP-302", c: "C-6020", in: "11:26", out: "11:52", order: "SO-4215" },
  { rep: "EMP-302", c: "C-6029", in: "12:55", out: "13:20", no: "Waiting for payment" },
  { rep: "EMP-302", c: "C-6038", in: "13:52" },
  // Esha Lama — Patan: one shop closed, one check-in without GPS, last seen two hours ago.
  { rep: "EMP-313", c: "C-5042", in: "09:20", out: "09:48", no: "Has enough stock" },
  { rep: "EMP-313", c: "C-6013", in: "10:05", out: "10:24", no: "Price or offer not right" },
  { rep: "EMP-313", c: "C-6022", in: "10:41", out: "11:08", order: "SO-4213" },
  { rep: "EMP-313", c: "C-6031", in: "11:22", skip: "Shop closed" },
  { rep: "EMP-313", c: "C-6040", in: "11:44", out: "12:10", no: "Owner not in" },
  { rep: "EMP-313", c: "C-6049", in: "13:05", out: "13:31", no: "Has enough stock", fix: "manual" },
  // Farah Shah — merchandiser: two stores done, on the way to the third.
  { rep: "EMP-314", c: "C-5030", in: "10:10", out: "11:25", no: "Merchandising visit" },
  { rep: "EMP-314", c: "C-5031", in: "12:20", out: "13:35", no: "Merchandising visit" },
  // Sujan Tamang — Kathmandu East: beat done.
  { rep: "EMP-320", c: "C-6003", in: "08:58", out: "09:24", order: "SO-4209" },
  { rep: "EMP-320", c: "C-5023", in: "09:40", out: "10:05", no: "Waiting for payment" },
  { rep: "EMP-320", c: "C-6030", in: "10:22", out: "10:41", no: "Has enough stock" },
  { rep: "EMP-320", c: "C-6039", in: "11:10", out: "11:36", order: "SO-4214" },
  { rep: "EMP-320", c: "C-6048", in: "12:02", out: "12:20", no: "Owner not in" },
  { rep: "EMP-320", c: "C-6057", in: "12:38", out: "13:02", order: "SO-4216" },
];
/** "Update my location" between shops: rep, time, from, to, how far along. */
const SAMPLE_ON_THE_WAY: [rep: string, time: string, from: string, to: string, along: number][] = [
  ["EMP-320", "13:58", "C-6057", "C-5023", 0.5],
  ["EMP-301", "14:02", "C-6037", "C-6046", 0.5],
  ["EMP-314", "14:07", "C-5031", "C-6012", 0.45],
];

/** What a finished step says, as the rep app words it. Steps not listed here were left (they are optional). */
const SAMPLE_STEP_TEXT: Record<string, (n: number, store: boolean) => string> = {
  "AC-STK": (n) => `Counted ${4 + (n % 5)} products`,
  "AC-PHO": (_n, store) => (store ? "3 photos" : "1 photo"),
  "AC-SCH": () => "Briefed on 2 offers",
  "AC-BRA": () => "Branding in place",
};

function metresBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** The steps of a sample visit: the customer type's playbook, ticked the way the visit went. */
function sampleActs(c: Customer | undefined, call: SampleCall, n: number): { acts: ActResult[]; photos: number } {
  const type = SAMPLE_CUSTOMER_TYPES.find((t) => t.id === c?.typeId);
  const playbook = SAMPLE_PLAYBOOKS.find((p) => p.id === type?.playbookId);
  const campaign = SAMPLE_CAMPAIGNS.some((k) => k.status === "live" && SAMPLE_DAY >= k.from && SAMPLE_DAY <= k.to && (!k.audience.typeIds.length || k.audience.typeIds.includes(c?.typeId ?? "")));
  const items: { activityId: string; required: boolean; geofence: boolean }[] = playbook
    ? playbook.items.filter((i) => i.when !== "during campaign" || campaign)
    : [
        { activityId: "AC-ORD", required: false, geofence: false },
        { activityId: "AC-COL", required: false, geofence: false },
      ];
  const store = type?.id === "T-MT";
  let photos = 0;
  const acts = items.map((i, at): ActResult => {
    const step = { activityId: i.activityId, required: i.required, geofence: i.geofence };
    const left = { ...step, done: false, result: "" };
    if (call.skip) return left;
    if (i.activityId === "AC-ORD") {
      if (call.order) return { ...step, done: true, result: call.order };
      return call.out && i.required ? { ...step, done: false, result: `Not done: ${i.geofence && call.fix === "away" ? "Was not at the shop" : (call.no ?? "No order")}` } : left;
    }
    // Still at the shop: only the first step is behind them.
    if (!call.out && at > 0) return left;
    if (i.geofence && call.fix === "away") return i.required ? { ...step, done: false, result: "Not done: Was not at the shop" } : left;
    const text = SAMPLE_STEP_TEXT[i.activityId];
    if (!text) return left;
    if (i.activityId === "AC-PHO") photos += store ? 3 : 1;
    return { ...step, done: true, result: text(n, store) };
  });
  return { acts, photos };
}

function buildSampleField(): { plan: PlanEntry[]; visits: Visit[]; pings: LocationPing[] } {
  const customer = (id: string) => SAMPLE_CUSTOMERS.find((c) => c.id === id);
  const seq = (prefix: string, n: number, width: number) => `${prefix}${String(n).padStart(width, "0")}`;

  // The plan: Friday's beats first, in walking order, then every other visited outlet on one of its market's days.
  // Friday's entries are weekly, so they are due on the sample day whatever week it falls in.
  const plan: PlanEntry[] = [];
  const add = (repId: string, customerId: string, day: number, every: Cadence) => plan.push({ id: seq("PL-", plan.length + 1, 4), repId, customerId, day, every });
  for (const [repId, beat] of Object.entries(SAMPLE_BEATS)) for (const customerId of beat) add(repId, customerId, 5, 1);
  const onFriday = new Set(Object.values(SAMPLE_BEATS).flat());
  const turn: Record<string, number> = {};
  for (const c of SAMPLE_BOOK) {
    const days = SAMPLE_OTHER_DAYS[c.market];
    const per4w = SAMPLE_CUSTOMER_TYPES.find((t) => t.id === c.typeId)?.visitsPer4w ?? 0;
    if (!c.repId || !days || !per4w || onFriday.has(c.id)) continue;
    const n = (turn[c.market] = (turn[c.market] ?? 0) + 1);
    add(c.repId, c.id, days[n % days.length], per4w >= 4 && c.tier !== "C" ? 1 : per4w >= 2 ? 2 : 4);
  }

  // The day: visits in the order they began, each with its check-in fix measured against the shop.
  const visits: Visit[] = [];
  const readings: Omit<LocationPing, "id">[] = [];
  [...SAMPLE_CALLS]
    .sort((a, b) => a.in.localeCompare(b.in))
    .forEach((call, n) => {
      const c = customer(call.c);
      const id = seq("V-", n + 1, 4);
      const { acts, photos } = sampleActs(c, call, n);
      const head = { id, date: SAMPLE_DAY, repId: call.rep, customerId: call.c, planned: (SAMPLE_BEATS[call.rep] ?? []).includes(call.c), orderId: call.order ?? null, acts, photos };
      if (call.skip) {
        visits.push({ ...head, state: "skipped", checkIn: null, checkOut: null, geofence: null, noOrderReason: null, skipReason: call.skip });
        return;
      }
      const fix = call.fix === "manual" || !c?.location ? null : pointFrom(c.location, n * 2.1, call.fix === "away" ? 384 : 9 + ((n * 7) % 26));
      const accuracy = 6 + ((n * 5) % 11);
      const metres = fix && c?.location ? Math.round(metresBetween(fix, c.location)) : null;
      // Within the tenant's 150 m, plus the fix's own error — the rule geo.ts applies to a live check-in.
      const geofence: Visit["geofence"] = fix ? { ok: (metres ?? 0) <= 150 + accuracy, metres, lat: fix.lat, lng: fix.lng, accuracy } : { ok: true, metres: null, manual: true };
      visits.push({ ...head, state: call.out ? "done" : "in-progress", checkIn: call.in, checkOut: call.out ?? null, geofence, noOrderReason: call.out && !call.order ? (call.no ?? "Other") : null, skipReason: null });
      if (!fix) return;
      readings.push({ repId: call.rep, at: `${SAMPLE_DAY} ${call.in}`, lat: fix.lat, lng: fix.lng, accuracy, kind: "check-in", visitId: id, customerId: call.c });
      if (call.out) readings.push({ repId: call.rep, at: `${SAMPLE_DAY} ${call.out}`, ...pointFrom(fix, n * 1.3 + 1, 6), accuracy: accuracy + 2, kind: "check-out", visitId: id, customerId: call.c });
    });
  for (const [repId, time, from, to, along] of SAMPLE_ON_THE_WAY) {
    const a = customer(from)?.location;
    const b = customer(to)?.location;
    if (a && b) readings.push({ repId, at: `${SAMPLE_DAY} ${time}`, lat: r6(a.lat + (b.lat - a.lat) * along), lng: r6(a.lng + (b.lng - a.lng) * along), accuracy: 11, kind: "update", visitId: null, customerId: null });
  }
  const pings = readings.sort((a, b) => a.at.localeCompare(b.at)).map((p, i): LocationPing => ({ id: seq("LP-", i + 1, 5), ...p }));
  return { plan, visits, pings };
}

const SAMPLE_FIELD = buildSampleField();
export const SAMPLE_PLAN: PlanEntry[] = SAMPLE_FIELD.plan;
const SAMPLE_ROUTED = routesFromPlan(SAMPLE_PLAN, (id) => MARKET_NAME[SAMPLE_BOOK.find((c) => c.id === id)?.market ?? ""]);
export const SAMPLE_ROUTES: Route[] = SAMPLE_ROUTED.routes;
export const SAMPLE_ROUTE_PLAN: RoutePlan[] = SAMPLE_ROUTED.plans;
export const SAMPLE_VISITS: Visit[] = SAMPLE_FIELD.visits;
export const SAMPLE_PINGS: LocationPing[] = SAMPLE_FIELD.pings;
