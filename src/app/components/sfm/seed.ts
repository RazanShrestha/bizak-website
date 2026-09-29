// ════════════════════════════════════════════════════════════════════════════
// FIELD SALES SEED — plain data, no imports
//
// The sales desk's customers, items, people, orders and receipts are extended
// from this file (orders.tsx, flow.tsx, productivity/shared.tsx), so an order a
// rep took today is the same SO-… on the Today board, on the visit and on the
// sales order desk. Nothing here imports another module: the sales seed imports
// it, and a cycle would leave one side undefined at load.
//
// What each shape stands for in the app (research/02):
//   FieldRep    EMPLOYEE_SETUP where IS_SALES_REP
//   FieldRoute  MAST_ROUTE_SETUP (+ MAP_SALESMAN_ROUTE for repIds)
//   FieldParty  MAST_VISIT_SETUP (+ MAP_PARTY_ROUTE for routeId, list order = stop order — proposal D-3)
//   FieldPlan   ROUTE_PLAN, one row per rep · route · day
//   FieldVisit  VISITED_ROUTE (arrival + departure fixes), SFM_ORDER_REASON, SFM_PARTY_STOCK, files
//   FieldPunch  HR_STAFF_ATTENDANCE (in / out)
//   FieldClose  SFM_EOD (figures frozen at close)
//   FieldFix    SFM_SALESMAN_LOCATION breadcrumbs
// Invented for the mockup and marked `needs:` where they are used: the stop
// order, a rep's start time, a party's outstanding (from InvoiceSettlementService).
// ════════════════════════════════════════════════════════════════════════════

export const FIELD_TODAY = "2026-09-04"; // a Friday — the sales mockup's TODAY
export const FIELD_NOW = "14:10";
/** The tenant's weekly off (Nepal: Saturday). Week columns start on Sunday. */
export const WEEKLY_OFF = 6;

// ── Deterministic randomness (the same board on every load) ─────────────────

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Dates and times (ISO days, "HH:MM" clocks) ──────────────────────────────

export function dayAdd(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
export function weekdayIdx(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
export const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
export const toClock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.round(m) % 60).padStart(2, "0")}`;

// ── Reps ────────────────────────────────────────────────────────────────────

export type FieldRep = { id: string; name: string; initials: string; phone: string; subsidiaryId: string; start: string; since: string };

export const FIELD_REPS: FieldRep[] = [
  { id: "EMP-301", name: "Arun Rai", initials: "AR", phone: "9800000301", subsidiaryId: "NP-01", start: "09:30", since: "2024-04-14" },
  { id: "EMP-302", name: "Bina Thapa", initials: "BT", phone: "9800000302", subsidiaryId: "NP-01", start: "09:30", since: "2023-11-02" },
  { id: "EMP-313", name: "Esha Lama", initials: "EL", phone: "9800000313", subsidiaryId: "NP-01", start: "09:30", since: "2025-01-20" },
  { id: "EMP-314", name: "Farah Shah", initials: "FS", phone: "9800000314", subsidiaryId: "NP-01", start: "09:30", since: "2025-06-01" },
  { id: "EMP-375", name: "Rajesh Shrestha", initials: "RS", phone: "9800000375", subsidiaryId: "NP-01", start: "09:30", since: "2022-08-17" },
  { id: "EMP-320", name: "Sujan Tamang", initials: "ST", phone: "9800000320", subsidiaryId: "NP-01", start: "09:30", since: "2025-09-01" },
  { id: "EMP-321", name: "Pooja Gurung", initials: "PG", phone: "9800000321", subsidiaryId: "NP-02", start: "09:30", since: "2024-10-05" },
];

// ── Routes ──────────────────────────────────────────────────────────────────

export type FieldRoute = {
  id: string;
  name: string;
  description: string;
  subsidiaryId: string;
  /** Identity colour, 1–8 (`--bz-route-N`). */
  tone: number;
  repIds: string[];
  center: [number, number];
  createdOn: string;
};

type RouteDef = [id: string, name: string, description: string, lat: number, lng: number, reps: string[], sub?: string];
const ROUTE_DEFS: RouteDef[] = [
  ["RT-01", "Kalanki Chowk", "Ring road west, both sides of the chowk", 27.6935, 85.2815, ["EMP-301"]],
  ["RT-02", "Balkhu – Kuleshwor", "Balkhu market to Kuleshwor heights", 27.6865, 85.2975, ["EMP-301"]],
  ["RT-03", "Sitapaila – Swayambhu", "Uphill loop, finish at Swayambhu gate", 27.7120, 85.2830, ["EMP-301"]],
  ["RT-04", "New Road – Ason", "Wholesale lanes; park at Khichapokhari", 27.7045, 85.3105, ["EMP-302", "EMP-320"]],
  ["RT-05", "Indrachowk – Thamel", "Retail and tourist marts", 27.7135, 85.3110, ["EMP-302"]],
  ["RT-06", "Tripureshwor – Teku", "Teku wholesale, then Tripureshwor", 27.6955, 85.3080, ["EMP-302"]],
  ["RT-07", "Pulchowk – Jawalakhel", "", 27.6760, 85.3145, ["EMP-313"]],
  ["RT-08", "Lagankhel – Satdobato", "Bus park side first", 27.6660, 85.3240, ["EMP-313"]],
  ["RT-09", "Mangal Bazar – Patan", "Old town, mostly on foot", 27.6735, 85.3255, ["EMP-313"]],
  ["RT-10", "Baneshwor", "", 27.6905, 85.3355, ["EMP-314"]],
  ["RT-11", "Koteshwor – Tinkune", "", 27.6800, 85.3480, ["EMP-314"]],
  ["RT-12", "Sinamangal – Gaushala", "Airport road outlets", 27.7035, 85.3470, ["EMP-314"]],
  ["RT-13", "Chabahil – Mitrapark", "", 27.7185, 85.3455, ["EMP-375", "EMP-314"]],
  ["RT-14", "Boudha – Jorpati", "Stupa ring, then Jorpati", 27.7240, 85.3640, ["EMP-375"]],
  ["RT-15", "Thimi – Balkumari", "", 27.6760, 85.3850, ["EMP-375"]],
  ["RT-16", "Balaju – Machhapokhari", "", 27.7330, 85.3035, ["EMP-320"]],
  ["RT-17", "Gongabu – Samakhusi", "Bus park counters first", 27.7345, 85.3175, ["EMP-320"]],
  ["RT-18", "Maharajgunj – Basundhara", "", 27.7385, 85.3320, ["EMP-320"]],
  ["RT-19", "Kirtipur – Panga", "Esha's until July; waiting for a rep", 27.6710, 85.2780, []],
  ["RT-20", "Thankot", "New area — outlets not added yet", 27.6890, 85.2300, []],
  ["RT-31", "Lakeside", "Lakeside strip, Baidam end first", 28.2090, 83.9590, ["EMP-321"], "NP-02"],
  ["RT-32", "Chipledhunga – Mahendrapul", "", 28.2185, 83.9870, ["EMP-321"], "NP-02"],
  ["RT-33", "Prithvi Chowk – Srijana", "", 28.2270, 83.9820, ["EMP-321"], "NP-02"],
];

let toneBy: Record<string, number> = {};
export const FIELD_ROUTES: FieldRoute[] = ROUTE_DEFS.map(([id, name, description, lat, lng, reps, sub]) => {
  const s = sub ?? "NP-01";
  toneBy[s] = (toneBy[s] ?? 0) + 1;
  return { id, name, description, subsidiaryId: s, tone: ((toneBy[s] - 1) % 8) + 1, repIds: reps, center: [lat, lng], createdOn: id === "RT-20" ? "2026-09-03" : "2025-04-01" };
});
toneBy = {};

// ── Parties ─────────────────────────────────────────────────────────────────

export type Stage = "customer" | "prospect" | "lead";
export type FieldParty = {
  id: string;
  code: string;
  name: string;
  area: string;
  subsidiaryId: string;
  /** MAP_PARTY_ROUTE — a party may sit on more than one route; here one or none. */
  routeId: string | null;
  stage: Stage;
  lat: number;
  lng: number;
  phone: string;
  /** VISIT.SALES_REP_ID */
  repId: string | null;
  createdOn: string;
  createdBy: string | null;
  /** needs: InvoiceSettlementService per customer. */
  outstanding: number;
};

const FIRST = ["Shree Ganesh", "Laxmi", "Om Shanti", "Annapurna", "Sagarmatha", "Sita Ram", "Durga", "Himal", "Pashupati", "Kalika", "Buddha", "Everfresh", "Tara", "Janaki", "Mitra", "Sunrise", "Gorkha", "Muna", "Srijana", "Krishna", "Bagmati", "Newa", "Hari Om", "Ramailo", "Chandra", "Bhawani", "Sahara", "Shiva Shakti", "Ujjwal", "Sabitri", "Dipak", "Nabin", "Maya", "Rara", "Phewa", "Kanchan", "Mahalaxmi", "Saraswati", "Bishnu", "Amrit"];
const KIND = ["Kirana Pasal", "General Store", "Traders", "Mart", "Suppliers", "Bhandar", "Store", "Fresh Mart", "Grocery", "Departmental Store"];
const AREAS: Record<string, string[]> = {
  "RT-01": ["Kalanki", "Kalanki Chowk", "Khasibazar", "Syuchatar"],
  "RT-02": ["Balkhu", "Kuleshwor", "Balkhu Bazar", "Kalimati"],
  "RT-03": ["Sitapaila", "Swayambhu", "Dallu", "Halchowk"],
  "RT-04": ["New Road", "Ason", "Khichapokhari", "Bishal Bazar lane"],
  "RT-05": ["Indrachowk", "Thamel", "Jyatha", "Chhetrapati"],
  "RT-06": ["Tripureshwor", "Teku", "Kuleshwor", "Thapathali"],
  "RT-07": ["Pulchowk", "Jawalakhel", "Kupondole", "Sanepa"],
  "RT-08": ["Lagankhel", "Satdobato", "Kumaripati", "Mahalaxmisthan"],
  "RT-09": ["Mangal Bazar", "Patan Dhoka", "Mangalbazar", "Nag Bahal"],
  "RT-10": ["New Baneshwor", "Old Baneshwor", "Shantinagar", "Buddhanagar"],
  "RT-11": ["Koteshwor", "Tinkune", "Jadibuti", "Airport"],
  "RT-12": ["Sinamangal", "Gaushala", "Battisputali", "Pingalasthan"],
  "RT-13": ["Chabahil", "Mitrapark", "Gopikrishna", "Dhumbarahi"],
  "RT-14": ["Boudha", "Jorpati", "Tusal", "Boudha Stupa"],
  "RT-15": ["Thimi", "Balkumari", "Madhyapur", "Sanothimi"],
  "RT-16": ["Balaju", "Machhapokhari", "Banasthali", "Nayabazar"],
  "RT-17": ["Gongabu", "Samakhusi", "Buspark", "Tokha road"],
  "RT-18": ["Maharajgunj", "Basundhara", "Chakrapath", "Narayan Gopal Chowk"],
  "RT-19": ["Kirtipur", "Panga", "Naya Bazar", "Chovar"],
  "RT-31": ["Lakeside", "Baidam", "Damside", "Lakeside Street 6"],
  "RT-32": ["Chipledhunga", "Mahendrapul", "Bagar", "Newroad Pokhara"],
  "RT-33": ["Prithvi Chowk", "Srijana Chowk", "Nayabazar Pokhara", "Rambazar"],
};

function buildParties(): FieldParty[] {
  const r = rng(20260904);
  const out: FieldParty[] = [];
  const used = new Set<string>();
  let n = 3001;
  const make = (routeId: string | null, sub: string, center: [number, number], areas: string[], stage: Stage = "customer", extra: Partial<FieldParty> = {}) => {
    let name = "";
    for (let i = 0; i < 40 && (!name || used.has(name)); i++) name = `${FIRST[Math.floor(r() * FIRST.length)]} ${KIND[Math.floor(r() * KIND.length)]}`;
    used.add(name);
    const route = routeId ? FIELD_ROUTES.find((x) => x.id === routeId) : null;
    const p: FieldParty = {
      id: `C-${n}`,
      code: `C-${n}`,
      name,
      area: areas[Math.floor(r() * areas.length)],
      subsidiaryId: sub,
      routeId,
      stage,
      lat: +(center[0] + (r() - 0.5) * 0.009).toFixed(6),
      lng: +(center[1] + (r() - 0.5) * 0.011).toFixed(6),
      phone: `98${String(41000000 + Math.floor(r() * 8999999))}`,
      repId: route?.repIds[0] ?? null,
      createdOn: "2025-05-10",
      createdBy: null,
      outstanding: stage === "customer" ? Math.round((r() < 0.45 ? 0 : 2_000 + r() * 38_000) / 50) * 50 : 0,
      ...extra,
    };
    n++;
    out.push(p);
    return p;
  };
  for (const rt of FIELD_ROUTES) {
    const count = rt.id === "RT-20" ? 0 : rt.id === "RT-19" ? 7 : rt.subsidiaryId === "NP-02" ? 7 : 8;
    for (let i = 0; i < count; i++) make(rt.id, rt.subsidiaryId, rt.center, AREAS[rt.id] ?? ["Kathmandu"]);
  }
  // Parties the reps added this month — leads and prospects, some already on a route.
  const fresh: [string | null, string, Stage, string, string][] = [
    ["RT-01", "EMP-301", "lead", "2026-09-02", "Kalanki"],
    ["RT-12", "EMP-314", "prospect", "2026-08-27", "Gaushala"],
    [null, "EMP-320", "lead", "2026-09-03", "Tokha road"],
    [null, "EMP-302", "prospect", "2026-08-31", "Jyatha"],
    [null, "EMP-375", "lead", "2026-09-01", "Jorpati"],
  ];
  for (const [routeId, by, stage, on, area] of fresh) {
    const rt = routeId ? FIELD_ROUTES.find((x) => x.id === routeId)! : null;
    const center: [number, number] = rt ? rt.center : by === "EMP-320" ? [27.7395, 85.3175] : by === "EMP-302" ? [27.7110, 85.3120] : [27.7260, 85.3700];
    make(routeId, "NP-01", center, [area], stage, { createdOn: on, createdBy: by, repId: by });
  }
  // Customers who fell off every route — the coverage gap the Parties tab exists for.
  const loose: [number, number, string][] = [
    [27.7010, 85.3200, "Bagbazar"],
    [27.6990, 85.3260, "Putalisadak"],
    [27.6875, 85.3190, "Thapathali"],
    [27.7210, 85.3320, "Lazimpat"],
    [27.6650, 85.3050, "Ekantakuna"],
    [27.6930, 85.3520, "Tinkune"],
    [27.7280, 85.3210, "Samakhusi"],
    [27.6800, 85.3350, "Sankhamul"],
    [27.7070, 85.2950, "Kalimati"],
  ];
  for (const [lat, lng, area] of loose) make(null, "NP-01", [lat, lng], [area]);
  return out;
}

export const FIELD_PARTIES: FieldParty[] = buildParties();

// ── Items a field rep sells (appended to the sales mockup's ITEMS) ──────────

export type FieldItem = { id: string; code: string; name: string; unit: string; rate: number; cost: number; hs: string };
export const FIELD_ITEMS: FieldItem[] = [
  { id: "I-40", code: "JMG-1L", name: "Mango Juice 1L", unit: "case", rate: 1_680, cost: 1_290, hs: "2009.89" },
  { id: "I-41", code: "BSC-GLU", name: "Glucose Biscuit 100g", unit: "ctn", rate: 960, cost: 720, hs: "1905.31" },
  { id: "I-42", code: "DTG-1KG", name: "Detergent Powder 1kg", unit: "ctn", rate: 2_050, cost: 1_560, hs: "3402.20" },
  { id: "I-43", code: "SOP-100", name: "Bathing Soap 100g", unit: "ctn", rate: 2_400, cost: 1_850, hs: "3401.11" },
  { id: "I-44", code: "WTR-1L", name: "Mineral Water 1L", unit: "case", rate: 300, cost: 210, hs: "2201.10" },
  { id: "I-45", code: "TEA-500", name: "Black Tea 500g", unit: "pkt", rate: 390, cost: 290, hs: "0902.30" },
];
/** What a rep's order is drawn from — the sales seed's Instant Noodles (I-05) sells in the field too. */
const SELL = ["I-40", "I-41", "I-42", "I-43", "I-44", "I-45", "I-05"];
const RATE: Record<string, number> = { "I-40": 1_680, "I-41": 960, "I-42": 2_050, "I-43": 2_400, "I-44": 300, "I-45": 390, "I-05": 1_440 };

// ── Leave and holidays (api/route-plan/blocking-dates) ──────────────────────

export type FieldLeave = { repId: string; from: string; to: string; status: "approved" | "pending"; type: string };
export const FIELD_LEAVES: FieldLeave[] = [
  { repId: "EMP-313", from: "2026-09-03", to: "2026-09-05", status: "approved", type: "Sick leave" },
  { repId: "EMP-314", from: "2026-09-10", to: "2026-09-10", status: "pending", type: "Casual leave" },
  { repId: "EMP-375", from: "2026-08-26", to: "2026-08-26", status: "approved", type: "Casual leave" },
];
export const FIELD_HOLIDAYS: { date: string; name: string }[] = [{ date: "2026-09-25", name: "Indra Jatra" }];

export const leaveOn = (repId: string, date: string) => FIELD_LEAVES.find((l) => l.repId === repId && l.from <= date && l.to >= date) ?? null;
export const holidayOn = (date: string) => FIELD_HOLIDAYS.find((h) => h.date === date) ?? null;

// ── Plans ───────────────────────────────────────────────────────────────────

/**
 * `partyIds`: a plan that covers PART of its route — what a handover leaves behind ("the rest to Bina",
 * "the rest to tomorrow"). The column exists: ROUTE_PLAN.PARTY_IDS, unused today (research/02 §1.2).
 */
export type FieldPlan = { id: string; repId: string; routeId: string; date: string; createdBy: string; note?: string; partyIds?: string[] };

/** Each rep's three routes: Sun & Wed, Mon & Thu, Tue & Fri. */
const WEEK_TEMPLATE: Record<string, string[]> = {
  "EMP-301": ["RT-01", "RT-02", "RT-03"],
  "EMP-302": ["RT-04", "RT-05", "RT-06"],
  "EMP-313": ["RT-07", "RT-08", "RT-09"],
  "EMP-314": ["RT-10", "RT-11", "RT-12"],
  "EMP-375": ["RT-13", "RT-14", "RT-15"],
  "EMP-320": ["RT-16", "RT-17", "RT-18"],
  "EMP-321": ["RT-31", "RT-32", "RT-33"],
};
export const routeForDay = (repId: string, date: string) => {
  const w = weekdayIdx(date);
  if (w === WEEKLY_OFF) return null;
  return WEEK_TEMPLATE[repId]?.[w % 3] ?? null;
};

/** Plans from Sun 23 Aug to Tue 15 Sep; next week has gaps on purpose (the Plan tab's "Not planned"). */
function buildPlans(): FieldPlan[] {
  const out: FieldPlan[] = [];
  let seq = 900;
  const start = "2026-08-23";
  for (let i = 0; i < 24; i++) {
    const date = dayAdd(start, i);
    if (weekdayIdx(date) === WEEKLY_OFF || holidayOn(date)) continue;
    for (const rep of FIELD_REPS) {
      const routeId = routeForDay(rep.id, date);
      if (!routeId) continue;
      // Gaps the manager has not filled yet.
      if (date >= "2026-09-06") {
        if (rep.id === "EMP-320" && (date === "2026-09-10" || date === "2026-09-11")) continue;
        if (rep.id === "EMP-375" && date === "2026-09-09") continue;
        if (date >= "2026-09-13" && weekdayIdx(date) > 2) continue;
      }
      // Rajesh's leave was on the calendar in time; Esha's came after the plan (the "plan on a leave day" case).
      if (rep.id === "EMP-375" && date === "2026-08-26") continue;
      out.push({ id: `RP-${seq++}`, repId: rep.id, routeId, date, createdBy: "EMP-101" });
    }
  }
  return out;
}
export const FIELD_PLANS: FieldPlan[] = buildPlans();

// ── Visits, orders, receipts, punches, fixes, closes ────────────────────────

export type ShelfLine = { itemId: string; qty: number };
export type FieldVisit = {
  id: string;
  repId: string;
  partyId: string;
  /** null = an unplanned visit (the party was not on the day's route). */
  planId: string | null;
  routeId: string | null;
  date: string;
  in: string;
  /** null while the rep is still at the outlet. */
  out: string | null;
  inAt: [number, number];
  outAt: [number, number] | null;
  remarks: string;
  photos: number;
  noOrderReason: string | null;
  shelf: ShelfLine[];
};
/** A field order as the seed writes it. Today's become real sales orders (orders.tsx); older ones stay figures. */
export type FieldOrder = { no: string; partyId: string; repId: string; date: string; time: string; lines: { itemId: string; qty: number }[]; value: number; cancelled?: boolean };
export type FieldReceipt = { no: string; partyId: string; repId: string; date: string; time: string; amount: number; tagged: number; method: "CASH" | "CHQ" | "QR" };
export type FieldPunch = { repId: string; date: string; in: string; out: string | null; place: string };
export type FieldFix = { repId: string; date: string; t: string; at: [number, number] };
export type FieldClose = {
  repId: string;
  date: string;
  closedAt: string;
  remarks: string;
  /** Figures as the rep closed the day (SFM_EOD); the live ones are recomputed on read (EOD report). */
  orders: number;
  value: number;
  collected: number;
  advance: number;
  allocated: number;
  visited: number;
};

const REASONS = ["Shop closed", "Enough stock", "Owner not in", "Over credit limit", "Come next week", "Price too high"];
const REMARKS = ["", "", "", "Asked for scheme details", "New shelf near counter", "Wants delivery before Friday", "Competitor ran a 5+1 offer", "Paid part in cash", "Keen on the 1L pack"];

type DayScript = {
  punch: string | null;
  /** How many planned stops were visited, in order. */
  visited: number;
  /** Stop indexes skipped along the way (missed). */
  skip?: number[];
  /** Still at the next stop since this time. */
  atNow?: string;
  /** Unplanned visits: after which stop. */
  unplanned?: number[];
  firstAt?: string;
  pace?: number;
  lastFix?: string;
};

/** Today (Fri 4 Sep, 14:10) — the story the board tells. */
const TODAY_SCRIPT: Record<string, DayScript> = {
  "EMP-301": { punch: "09:12", visited: 6, atNow: "13:58", unplanned: [3], firstAt: "09:40", pace: 38 },
  "EMP-302": { punch: "10:38", visited: 2, atNow: "13:52", firstAt: "11:05", pace: 50 },
  "EMP-313": { punch: null, visited: 0 },
  "EMP-314": { punch: "09:05", visited: 6, atNow: "13:52", firstAt: "09:28", pace: 36 },
  "EMP-375": { punch: null, visited: 0 },
  "EMP-320": { punch: "09:25", visited: 5, firstAt: "09:50", pace: 40, lastFix: "13:15" },
  "EMP-321": { punch: "09:20", visited: 5, atNow: "14:02", skip: [2], firstAt: "09:45", pace: 42 },
};

type Built = { visits: FieldVisit[]; orders: FieldOrder[]; receipts: FieldReceipt[]; punches: FieldPunch[]; fixes: FieldFix[]; closes: FieldClose[] };

function buildActivity(): Built {
  const r = rng(777);
  const b: Built = { visits: [], orders: [], receipts: [], punches: [], fixes: [], closes: [] };
  let vSeq = 5000;
  let hist = 781; // SO-0781… for older orders, clear of the sales seed's SO-10xx
  let today = 1054; // SO-1054… today — the sales desk's next numbers (its seed ends at SO-1053)
  let rcHist = 330;
  let rcToday = 418;

  const days: string[] = [];
  for (let d = "2026-08-23"; d <= FIELD_TODAY; d = dayAdd(d, 1)) if (weekdayIdx(d) !== WEEKLY_OFF && !holidayOn(d)) days.push(d);

  for (const date of days) {
    const isToday = date === FIELD_TODAY;
    for (const rep of FIELD_REPS) {
      const plan = FIELD_PLANS.find((p) => p.repId === rep.id && p.date === date) ?? null;
      const onLeave = !!leaveOn(rep.id, date) && leaveOn(rep.id, date)!.status === "approved";
      if (onLeave || !plan) continue;
      const stops = FIELD_PARTIES.filter((p) => p.routeId === plan.routeId);
      const script: DayScript = isToday
        ? TODAY_SCRIPT[rep.id]
        : {
            punch: toClock(toMin("09:00") + Math.floor(r() * 40)),
            visited: stops.length,
            skip: stops.map((_, i) => i).filter(() => r() < 0.12),
            unplanned: r() < 0.35 ? [Math.floor(r() * stops.length)] : [],
            firstAt: toClock(toMin("09:25") + Math.floor(r() * 35)),
            pace: 34 + Math.floor(r() * 12),
          };
      // A late start one day, a no-show one day — history has the same kinds of trouble as today.
      if (!isToday && rep.id === "EMP-302" && date === "2026-09-02") script.firstAt = "10:50";
      if (!isToday && rep.id === "EMP-320" && date === "2026-09-01") (script.punch = null), (script.visited = 0);
      if (!script.punch) continue;

      const rt = FIELD_ROUTES.find((x) => x.id === plan.routeId)!;
      b.punches.push({ repId: rep.id, date, in: script.punch, out: isToday ? null : toClock(toMin("18:05") + Math.floor(r() * 50)), place: stops[0]?.area ?? rt.name });
      let clock = toMin(script.firstAt ?? "09:40");
      let last: [number, number] = [rt.center[0] + 0.002, rt.center[1] - 0.003];
      b.fixes.push({ repId: rep.id, date, t: script.punch, at: last });
      const cut = isToday ? toMin(FIELD_NOW) : 24 * 60;
      const extras = new Set(script.unplanned ?? []);

      const visit = (party: { id: string; lat: number; lng: number }, planned: boolean) => {
        // A few visits a month look wrong — a one-minute stay, a check-in from down the road. They are what the
        // Visits tab's "Short stays" and "Far from the outlet" exist to catch (picked by number, so the draw is kept).
        const odd = !isToday && vSeq % 37 === 0 ? "short" : !isToday && vSeq % 43 === 0 ? "far" : null;
        const dwell = odd === "short" ? 1 : 8 + Math.floor(r() * 18);
        const inT = clock;
        const outT = inT + dwell;
        const drift = odd === "far" ? 0.004 : 0;
        const at: [number, number] = [party.lat + (r() - 0.5) * 0.0004 + drift, party.lng + (r() - 0.5) * 0.0004 - drift * 0.4];
        const productive = r() < 0.62;
        const v: FieldVisit = {
          id: `V-${vSeq++}`,
          repId: rep.id,
          partyId: party.id,
          planId: planned ? plan.id : null,
          routeId: planned ? plan.routeId : null,
          date,
          in: toClock(inT),
          out: toClock(outT),
          inAt: at,
          outAt: [at[0] + (r() - 0.5) * 0.0002, at[1] + (r() - 0.5) * 0.0002],
          remarks: REMARKS[Math.floor(r() * REMARKS.length)],
          photos: r() < 0.4 ? 1 + Math.floor(r() * 3) : 0,
          noOrderReason: productive ? null : REASONS[Math.floor(r() * REASONS.length)],
          shelf: r() < 0.3 ? SELL.slice(0, 2 + Math.floor(r() * 3)).map((itemId) => ({ itemId, qty: 1 + Math.floor(r() * 9) })) : [],
        };
        b.visits.push(v);
        // A fix on the way in and one at the outlet (≈ every 15 min on a real phone).
        b.fixes.push({ repId: rep.id, date, t: toClock(inT - 6), at: [(last[0] + at[0]) / 2, (last[1] + at[1]) / 2] });
        b.fixes.push({ repId: rep.id, date, t: toClock(inT + 2), at });
        last = at;
        if (productive) {
          const n = 1 + Math.floor(r() * 3);
          const picked = [...SELL].sort(() => r() - 0.5).slice(0, n);
          const lines = picked.map((itemId) => ({ itemId, qty: itemId === "I-44" ? 5 + Math.floor(r() * 20) : 1 + Math.floor(r() * 6) }));
          const value = lines.reduce((s, l) => s + l.qty * RATE[l.itemId], 0) * 1.13;
          b.orders.push({ no: isToday ? `SO-${today++}` : `SO-0${hist++}`, partyId: party.id, repId: rep.id, date, time: toClock(inT + dwell - 3), lines, value: Math.round(value) });
        }
        if (r() < 0.28) {
          const amount = Math.round((3_000 + r() * 17_000) / 100) * 100;
          // Back office tags receipts to invoices later — today's are all still advance (untagged).
          const tagged = isToday ? 0 : r() < 0.6 ? amount : r() < 0.5 ? Math.round(amount / 2) : 0;
          b.receipts.push({ no: isToday ? `RCP-0${rcToday++}` : `RCP-0${rcHist++}`, partyId: party.id, repId: rep.id, date, time: toClock(outT - 1), amount, tagged, method: r() < 0.7 ? "CASH" : r() < 0.5 ? "QR" : "CHQ" });
        }
        clock = outT + (script.pace ?? 38) - dwell + Math.floor(r() * 10);
      };

      for (let i = 0; i < stops.length && i < script.visited; i++) {
        if (clock > cut) break;
        if (!(script.skip ?? []).includes(i)) visit(stops[i], true);
        if (extras.has(i)) {
          const off = FIELD_PARTIES.filter((p) => p.subsidiaryId === rt.subsidiaryId && p.routeId !== plan.routeId && Math.abs(p.lat - rt.center[0]) < 0.02 && Math.abs(p.lng - rt.center[1]) < 0.03);
          if (off.length) visit(off[Math.floor(r() * off.length)], false);
        }
      }
      // Still inside the next outlet.
      if (isToday && script.atNow) {
        const next = stops[script.visited];
        if (next) {
          const at: [number, number] = [next.lat, next.lng];
          b.visits.push({ id: `V-${vSeq++}`, repId: rep.id, partyId: next.id, planId: plan.id, routeId: plan.routeId, date, in: script.atNow, out: null, inAt: at, outAt: null, remarks: "", photos: 0, noOrderReason: null, shelf: [] });
          b.fixes.push({ repId: rep.id, date, t: toClock(toMin(script.atNow) + 4), at });
        }
      }
      if (isToday && script.lastFix) b.fixes.push({ repId: rep.id, date, t: script.lastFix, at: last });

      // Day close — everyone who worked closes, except Bina on 2 Sep and Sep 3.
      if (!isToday && !(rep.id === "EMP-302" && (date === "2026-09-03" || date === "2026-09-02"))) {
        const vs = b.visits.filter((v) => v.repId === rep.id && v.date === date);
        const os = b.orders.filter((o) => o.repId === rep.id && o.date === date && !o.cancelled);
        const rs = b.receipts.filter((x) => x.repId === rep.id && x.date === date);
        const coll = rs.reduce((s, x) => s + x.tagged, 0);
        const adv = rs.reduce((s, x) => s + x.amount - x.tagged, 0);
        b.closes.push({
          repId: rep.id,
          date,
          closedAt: toClock(toMin("17:45") + Math.floor(r() * 70)),
          remarks: r() < 0.3 ? ["Two outlets asked for the new pack", "Rain after 4 — shortened the loop", "Collected old dues at Kalanki"][Math.floor(r() * 3)] : "",
          orders: os.length,
          value: os.reduce((s, o) => s + o.value, 0),
          // Back office has tagged more since the close on some days — the "changed since close" case.
          collected: date >= "2026-09-01" && r() < 0.5 ? Math.max(0, coll - 2_000) : coll,
          advance: date >= "2026-09-01" && r() < 0.5 ? adv + 2_000 : adv,
          allocated: stops.length,
          visited: new Set(vs.filter((v) => v.planId).map((v) => v.partyId)).size,
        });
      }
    }
  }
  // One of yesterday's orders was cancelled afterwards — "orders at close → now" differ.
  const y = b.orders.find((o) => o.date === "2026-09-03" && o.repId === "EMP-314");
  if (y) y.cancelled = true;
  return b;
}

const BUILT = buildActivity();
export const FIELD_VISITS = BUILT.visits;
export const FIELD_ORDERS = BUILT.orders;
export const FIELD_RECEIPTS = BUILT.receipts;
export const FIELD_PUNCHES = BUILT.punches;
export const FIELD_FIXES = BUILT.fixes;
export const FIELD_CLOSES = BUILT.closes;

/** Today's orders and receipts — the sales seed turns these into real SO-… / RCP-… documents. */
export const FIELD_ORDERS_TODAY = FIELD_ORDERS.filter((o) => o.date === FIELD_TODAY);
export const FIELD_RECEIPTS_TODAY = FIELD_RECEIPTS.filter((x) => x.date === FIELD_TODAY);
