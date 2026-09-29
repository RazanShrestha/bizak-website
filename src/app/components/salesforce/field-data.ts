import { createStore } from "../sales/store";
import { CAMPAIGNS, CUSTOMERS, CUSTOMER_TYPES, HUB_ORDERS, PLAYBOOKS, REPS, SCHEMES, SF_NOW, SF_TODAY, TARGETS, TERRITORIES } from "./data";
import type { Customer, PlaybookItem, Rep, Target } from "./data";
import { evaluate } from "./engine";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE v2 · FIELD SEED — the journey plan, the day and the visits
//
// data.ts has no visit or beat seed, so the field pages build one here, from
// the shared customers, playbooks and hub orders, deterministically (a fixed
// PRNG — the same page every reload).
//
//   Journey plan   a weekly pattern (PJP): outlet × weekday × cadence. The
//                  cadence comes from the customer type's visitsPer4w.
//   Visits         Wed, Thu and today (Fri 4 Sep) played out from the plan.
//                  Hub orders taken by reps are pinned to the visit that took
//                  them, so a visit's order opens the real ORD-… in the hub.
//   Today          at SF_NOW (14:10) five of the seven people are out, Farah
//                  has closed her day and Rajesh has not started (Home says
//                  so — keep the two in step).
//
// The seed holds a SAMPLE of each rep's outlets, not a whole territory, so a
// small-territory rep's other weekdays are thin. That is the seed, not a rule.
// ════════════════════════════════════════════════════════════════════════════

// ── Calendar ────────────────────────────────────────────────────────────────

/** The working week around SF_TODAY (a Friday), Monday to Saturday. */
export const WEEK = [
  { date: "2026-08-31", short: "Mon", label: "Monday" },
  { date: "2026-09-01", short: "Tue", label: "Tuesday" },
  { date: "2026-09-02", short: "Wed", label: "Wednesday" },
  { date: "2026-09-03", short: "Thu", label: "Thursday" },
  { date: "2026-09-04", short: "Fri", label: "Friday" },
  { date: "2026-09-05", short: "Sat", label: "Saturday" },
] as const;
export const TODAY_IDX = WEEK.findIndex((d) => d.date === SF_TODAY);
/** Visits exist for these days (the register's range). */
export const VISIT_DAYS = [WEEK[2].date, WEEK[3].date, WEEK[4].date];
export const DAY_START_DUE = "09:30";

export const toMin = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
};
export const hm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(Math.round(min) % 60).padStart(2, "0")}`;
export const NOW_MIN = toMin(SF_NOW);

// ── Lookups ─────────────────────────────────────────────────────────────────

export const repById = (id: string | null | undefined) => REPS.find((r) => r.id === id);
export const custById = (id: string) => CUSTOMERS.find((c) => c.id === id)!;
export const ctype = (c: Customer) => CUSTOMER_TYPES.find((t) => t.id === c.typeId)!;
export const territoryName = (id: string) => TERRITORIES.find((t) => t.id === id)?.name ?? id;
/** "Kathmandu West" or "Lakeside +3" — the row's short form. */
export const repArea = (r: Rep) => `${territoryName(r.territoryIds[0])}${r.territoryIds.length > 1 ? ` +${r.territoryIds.length - 1}` : ""}`;
export function regionOf(territoryId: string) {
  let t = TERRITORIES.find((x) => x.id === territoryId);
  while (t?.parentId) t = TERRITORIES.find((x) => x.id === t!.parentId);
  return t?.id ?? null;
}
export const firstName = (r: Rep | undefined) => r?.name.split(" ")[0] ?? "";

// ── Activity words ──────────────────────────────────────────────────────────

/** The one-word label a playbook activity takes in a tick row ("Order ✓ Stock ✓ Photo –"). */
export const ACT_SHORT: Record<string, string> = {
  "AC-ORD": "Order",
  "AC-COL": "Collect",
  "AC-RET": "Return",
  "AC-STK": "Stock",
  "AC-PHO": "Photo",
  "AC-CMP": "Prices",
  "AC-BRA": "Branding",
  "AC-SCH": "Offers",
  "AC-EST": "Quote",
  "AC-DLV": "Delivery",
  "AC-SMP": "Samples",
  "AC-SEC": "Secondary",
};

/** The playbook items that apply to a visit to `c` on `date` — its type's playbook, filtered by "when". */
export function playbookItems(c: Customer, date: string): PlaybookItem[] {
  const pb = PLAYBOOKS.find((p) => p.id === ctype(c).playbookId);
  if (!pb) return [];
  const region = regionOf(c.territoryId);
  const inCampaign = CAMPAIGNS.some((k) => k.status === "live" && date >= k.from && date <= k.to && k.audience.typeIds.includes(c.typeId) && (region ? k.audience.territoryIds.includes(region) : false));
  // Every day in the seed is in the month's first week, so a monthly item is due on each of them.
  return pb.items.filter((i) => i.when !== "during campaign" || inCampaign);
}

// ── PRNG (same shape as data.ts's, which is not exported) ───────────────────

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
const between = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T,>(r: () => number, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];

// ── Outlets per person ──────────────────────────────────────────────────────

/**
 * The outlets a person works. A rep: the customers they own. A merchandiser: modern-trade stores and the best
 * shops in her territories. An area manager: his key accounts plus joint visits to good shops with his reps.
 */
export function outletsOf(rep: Rep): Customer[] {
  const visited = (c: Customer) => ctype(c).visitsPer4w > 0;
  const own = CUSTOMERS.filter((c) => c.repId === rep.id && visited(c));
  if (rep.role === "Sales rep") return own;
  const tierRank = { A: 0, B: 1, C: 2 } as const;
  const extra = CUSTOMERS.filter((c) => !own.includes(c) && visited(c) && rep.territoryIds.includes(c.territoryId) && (c.typeId === "T-MT" || c.typeId === "T-RET" || c.typeId === "T-WHOL"))
    .filter((c) => c.status === "active")
    .sort((a, b) => (a.typeId === "T-MT" ? -1 : 0) - (b.typeId === "T-MT" ? -1 : 0) || tierRank[a.tier] - tierRank[b.tier] || a.id.localeCompare(b.id));
  return [...own, ...extra.slice(0, rep.role === "Merchandiser" ? 4 : 6)];
}

/** Every: 1 = weekly, 2 = every other week, 4 = once in four weeks. */
export type Cadence = 1 | 2 | 4;
export type PlanEntry = { id: string; repId: string; customerId: string; day: number; every: Cadence };

/** Entries a type needs per week: MT twice weekly, retail weekly, HoReCa fortnightly, institutions monthly. */
export function cadenceOf(c: Customer): { count: number; every: Cadence } {
  const v = ctype(c).visitsPer4w;
  if (v >= 8) return { count: 2, every: 1 };
  if (v >= 4) return { count: 1, every: 1 };
  if (v >= 2) return { count: 1, every: 2 };
  return { count: 1, every: 4 };
}
/** Visits in four weeks that a set of plan entries gives. */
export const visitsIn4w = (entries: PlanEntry[]) => entries.reduce((s, e) => s + 4 / e.every, 0);

// Hub orders a rep took in person — pinned to that day's visit.
const REP_ORDERS = HUB_ORDERS.filter((o) => o.source === "rep" && o.repId);

/** Planned outlets on today's beat per person (Home: Rajesh — 8 outlets). */
const FRIDAY_SIZE: Record<string, number> = { "EMP-301": 7, "EMP-302": 5, "EMP-313": 7, "EMP-314": 4, "EMP-375": 8, "EMP-320": 5, "EMP-321": 9 };

/** Outlets left out of the plan on purpose — the "not planned in 4 weeks" count has to show something. */
function leftOut(rep: Rep, pool: Customer[], pinned: Set<string>): Set<string> {
  if (rep.role !== "Sales rep") return new Set();
  const n = pool.length >= 15 ? 2 : 1;
  const rank = (c: Customer) => (c.status === "onboarding" ? 0 : c.tier === "C" ? 1 : 2);
  const cands = pool.filter((c) => !pinned.has(c.id) && ctype(c).level !== "primary").sort((a, b) => rank(a) - rank(b) || b.id.localeCompare(a.id));
  return new Set(cands.slice(0, n).map((c) => c.id));
}

function buildPlan(): PlanEntry[] {
  const out: PlanEntry[] = [];
  for (const rep of REPS) {
    const pool = outletsOf(rep);
    const pins = new Map<string, number>();
    for (const o of REP_ORDERS) if (o.repId === rep.id && pool.some((c) => c.id === o.customerId)) pins.set(o.customerId, WEEK.findIndex((d) => d.date === o.at.slice(0, 10)));
    const skip = leftOut(rep, pool, new Set(pins.keys()));
    const load = [0, 0, 0, 0, 0, 0];
    const add = (c: Customer, day: number, every: Cadence) => {
      out.push({ id: `PL-${rep.id.slice(4)}-${c.id.slice(2)}-${day}`, repId: rep.id, customerId: c.id, day, every });
      load[day]++;
    };
    const second = (c: Customer, first: number) => {
      // A twice-weekly store gets its second visit at least two days from the first.
      const opts = [0, 1, 2, 3, 5].filter((d) => Math.abs(d - first) >= 2).sort((a, b) => load[a] - load[b] || a - b);
      add(c, opts[0], 1);
    };
    const planned = pool.filter((c) => !skip.has(c.id));
    for (const c of planned) {
      if (!pins.has(c.id)) continue;
      const k = cadenceOf(c);
      add(c, pins.get(c.id)!, k.every);
      if (k.count === 2) second(c, pins.get(c.id)!);
    }
    const rest = planned.filter((c) => !pins.has(c.id));
    const friday = rest.slice(0, Math.max(0, FRIDAY_SIZE[rep.id] - load[TODAY_IDX]));
    for (const c of friday) {
      const k = cadenceOf(c);
      add(c, TODAY_IDX, k.every);
      if (k.count === 2) second(c, TODAY_IDX);
    }
    for (const c of rest.slice(friday.length)) {
      const k = cadenceOf(c);
      const day = [0, 1, 2, 3, 5].sort((a, b) => load[a] - load[b] || a - b)[0];
      add(c, day, k.every);
      if (k.count === 2) second(c, day);
    }
  }
  return out;
}

export const PLAN_SEED: PlanEntry[] = buildPlan();
export const planStore = createStore<PlanEntry[]>(PLAN_SEED.map((e) => ({ ...e })));

// ── Visits ──────────────────────────────────────────────────────────────────

export type VisitState = "done" | "in-progress" | "skipped" | "pending" | "missed";
export type ActResult = { activityId: string; required: boolean; geofence: boolean; done: boolean; result: string };
export type Visit = {
  id: string;
  date: string;
  repId: string;
  customerId: string;
  seq: number;
  planned: boolean;
  state: VisitState;
  checkIn: string | null;
  checkOut: string | null;
  minutes: number;
  geofence: { ok: boolean; metres: number } | null;
  /** The hub order this visit took, when the hub holds it (ORD-…). */
  orderId: string | null;
  orderValue: number;
  lines: number;
  noOrderReason: string | null;
  skipReason: string | null;
  acts: ActResult[];
  photos: number;
};

/** How today looks at 14:10 for each person — visited = checked in (done + skipped + in progress). */
type Shape = { start: string | null; last: string | null; visited: number; skip?: number[]; progress?: boolean; closed?: string };
const TODAY_SHAPE: Record<string, Shape> = {
  "EMP-301": { start: "09:20", last: "13:52", visited: 6, progress: true },
  "EMP-302": { start: "09:37", last: "13:20", visited: 4, skip: [2] },
  "EMP-313": { start: "09:40", last: "14:02", visited: 5, progress: true },
  "EMP-314": { start: "09:05", last: "12:40", visited: 4, closed: "13:25" },
  "EMP-375": { start: null, last: null, visited: 0 },
  "EMP-320": { start: "10:05", last: "11:48", visited: 2 },
  "EMP-321": { start: "09:15", last: "13:35", visited: 6, skip: [3] },
};

const NO_ORDER = ["Stock is enough", "Owner away", "Asked for a better price", "Will order on the portal", "Cash short this week"];
const SKIPS = ["Shop closed", "Owner away", "Road blocked"];
const ORDER_RANGE: Record<string, [number, number]> = {
  "T-RET": [2_500, 18_000],
  "T-WHOL": [18_000, 64_000],
  "T-DEAL": [28_000, 96_000],
  "T-DIST": [90_000, 260_000],
  "T-SS": [180_000, 420_000],
  "T-HRC": [8_000, 32_000],
};

function resultOf(activityId: string, r: () => number, v: { orderValue: number; lines: number; noOrderReason: string | null }): string {
  switch (activityId) {
    case "AC-ORD":
      return v.orderValue > 0 ? `NPR ${Math.round(v.orderValue).toLocaleString("en-US")} · ${v.lines} lines` : `No order · ${v.noOrderReason}`;
    case "AC-COL":
      return `NPR ${(between(r, 4, 60) * 500).toLocaleString("en-US")} ${pick(r, ["cash", "cheque", "QR"])}`;
    case "AC-STK":
      return `${between(r, 6, 16)} products counted`;
    case "AC-PHO":
      return `${between(r, 1, 3)} photos`;
    case "AC-CMP":
      return `${between(r, 2, 4)} competitor prices`;
    case "AC-BRA":
      return pick(r, ["Sign board up and clean", "Standee faded — replace", "Shelf strip missing"]);
    case "AC-SCH":
      return `Briefed on ${between(r, 1, 3)} offers`;
    case "AC-EST":
      return `Estimate EST-0${between(r, 410, 460)}`;
    case "AC-SMP":
      return `${between(r, 6, 24)} packs given`;
    case "AC-SEC":
      return `NPR ${(between(r, 60, 240) * 1000).toLocaleString("en-US")} since last visit`;
    default:
      return "Done";
  }
}

/** Even check-in times from start to last, with fixed times honoured and at least 20 minutes between visits. */
function schedule(k: number, start: number, last: number, fixed: Map<number, number>, r: () => number): number[] {
  const t = Array.from({ length: k }, (_, i) => (k === 1 ? start : Math.round(start + ((last - start) * i) / (k - 1) + (i > 0 && i < k - 1 ? between(r, -6, 6) : 0))));
  fixed.forEach((at, i) => (t[i] = at));
  for (let i = 1; i < k; i++) if (!fixed.has(i)) t[i] = Math.max(t[i], t[i - 1] + 20);
  for (let i = k - 2; i >= 0; i--) if (!fixed.has(i)) t[i] = Math.min(t[i], t[i + 1] - 20);
  return t;
}

function buildVisits(): Visit[] {
  const r = prng(4092026);
  const all: Visit[] = [];
  for (const date of VISIT_DAYS) {
    const dayIdx = WEEK.findIndex((d) => d.date === date);
    const isToday = date === SF_TODAY;
    for (const rep of REPS) {
      const planned = PLAN_SEED.filter((e) => e.repId === rep.id && e.day === dayIdx).map((e) => e.customerId);
      const order: { customerId: string; planned: boolean }[] = planned.map((id) => ({ customerId: id, planned: true }));
      const hubToday = REP_ORDERS.filter((o) => o.repId === rep.id && o.at.startsWith(date));
      // A hub order taken at an outlet that is not on this person's plan is an unplanned visit.
      for (const o of hubToday) if (!planned.includes(o.customerId)) order.push({ customerId: o.customerId, planned: false });

      const shape: Shape = isToday ? TODAY_SHAPE[rep.id] : { start: hm(between(r, 548, 580)), last: null, visited: order.length };
      if (!isToday && shape.start) shape.last = hm(Math.min(toMin(shape.start) + (order.length - 1) * between(r, 44, 56), 17 * 60 + 20));
      const k = Math.min(shape.visited, order.length);
      const start = shape.start ? toMin(shape.start) : 0;
      const last = shape.last ? toMin(shape.last) : start;
      // Put each hub visit at the slot nearest its order time, and pin that slot's check-in to 14 min before it.
      const fixed = new Map<number, number>();
      const base = Array.from({ length: k }, (_, i) => (k === 1 ? start : start + ((last - start) * i) / (k - 1)));
      for (const o of hubToday) {
        const at = toMin(o.at.slice(11, 16)) - 14;
        const free = base.map((b, i) => ({ i, d: Math.abs(b - at) })).filter((x) => !fixed.has(x.i)).sort((a, b) => a.d - b.d)[0];
        if (!free) continue;
        const from = order.findIndex((x) => x.customerId === o.customerId);
        const [moved] = order.splice(from, 1);
        order.splice(free.i, 0, moved);
        fixed.set(free.i, at);
      }
      const times = k ? schedule(k, start, last, fixed, r) : [];

      order.forEach((o, i) => {
        const c = custById(o.customerId);
        const hub = hubToday.find((h) => h.customerId === c.id);
        const visited = i < k;
        const inProgress = visited && isToday && shape.progress && i === k - 1;
        const skipped = visited && (isToday ? shape.skip?.includes(i) : !hub && r() < 0.07);
        // A past day's outlet can be missed outright — no check-in at all.
        const missed = !isToday && !hub && !skipped && r() < 0.06;
        const state: VisitState = missed ? "missed" : !visited ? "pending" : skipped ? "skipped" : inProgress ? "in-progress" : "done";
        const checkIn = visited && !missed ? hm(times[i]) : null;
        const nextIn = i + 1 < k ? times[i + 1] : isToday ? (shape.closed ? toMin(shape.closed) + 10 : NOW_MIN) : times[i] + 60;
        const wanted = skipped ? between(r, 2, 5) : between(r, 14, 32);
        const minutes = inProgress ? NOW_MIN - times[i] : checkIn ? Math.max(2, Math.min(wanted, nextIn - times[i] - 6)) : 0;
        const checkOut = checkIn && !inProgress ? hm(times[i] + minutes) : null;
        const items = playbookItems(c, date);
        const ordersHere = items.some((x) => x.activityId === "AC-ORD");
        let orderValue = 0;
        let lines = 0;
        let noOrderReason: string | null = null;
        if (hub) {
          orderValue = evaluate(hub.customerId, hub.lines, SCHEMES).total;
          lines = hub.lines.length;
        } else if (state === "done" && ordersHere && r() < 0.68) {
          const [lo, hi] = ORDER_RANGE[c.typeId] ?? [5_000, 20_000];
          orderValue = Math.round(between(r, lo, hi) / 10) * 10;
          lines = between(r, 1, c.typeId === "T-RET" ? 5 : 9);
        } else if (state === "done" && ordersHere) noOrderReason = pick(r, NO_ORDER);
        const acts: ActResult[] = items.map((it) => {
          let done = false;
          if (state === "done") done = it.activityId === "AC-ORD" ? orderValue > 0 : r() < (it.required ? 0.92 : 0.5);
          if (state === "in-progress") done = it.required && r() < 0.5 && it.activityId !== "AC-ORD";
          const result = done ? resultOf(it.activityId, r, { orderValue, lines, noOrderReason }) : it.activityId === "AC-ORD" && noOrderReason ? `No order · ${noOrderReason}` : "";
          return { activityId: it.activityId, required: it.required, geofence: it.geofence, done, result };
        });
        const flag = !!checkIn && !skipped && r() < 0.11;
        all.push({
          id: `VS-${date.slice(5).replace("-", "")}-${rep.id.slice(4)}-${String(i + 1).padStart(2, "0")}`,
          date,
          repId: rep.id,
          customerId: c.id,
          seq: i + 1,
          planned: o.planned,
          state,
          checkIn,
          checkOut,
          minutes,
          geofence: checkIn ? { ok: !flag, metres: flag ? between(r, 180, 420) : between(r, 6, 58) } : null,
          orderId: hub?.id ?? null,
          orderValue,
          lines,
          noOrderReason,
          skipReason: skipped ? pick(r, SKIPS) : null,
          acts,
          photos: acts.filter((a) => a.done && (a.activityId === "AC-PHO" || a.activityId === "AC-BRA")).reduce((s) => s + between(r, 1, 3), 0),
        });
      });
    }
  }
  return all;
}

export const VISITS: Visit[] = buildVisits();
export const visitById = (id: string | undefined) => VISITS.find((v) => v.id === id);
export const isVisited = (v: Visit) => v.state === "done" || v.state === "in-progress" || v.state === "skipped";
export const withOrder = (v: Visit) => v.orderValue > 0;

// ── The day per person ──────────────────────────────────────────────────────

export type DayStatus = "on-beat" | "not-started" | "done" | "idle";
export type RepDay = {
  rep: Rep;
  date: string;
  status: DayStatus;
  visits: Visit[];
  checkedIn: number;
  startedAt: string | null;
  endedAt: string | null;
  lastCheckIn: string | null;
  lastCheckOut: string | null;
  orderValue: number;
  orders: number;
};

export const IDLE_AFTER_MIN = 90;

export function repDay(repId: string, date = SF_TODAY): RepDay {
  const rep = repById(repId)!;
  const visits = VISITS.filter((v) => v.repId === repId && v.date === date).sort((a, b) => a.seq - b.seq);
  const inn = visits.filter((v) => v.checkIn && v.state !== "skipped");
  const touched = visits.filter((v) => v.checkIn);
  const last = touched[touched.length - 1];
  const shape = date === SF_TODAY ? TODAY_SHAPE[repId] : null;
  const lastOut = [...visits].reverse().find((v) => v.checkOut)?.checkOut ?? null;
  let status: DayStatus = "done";
  if (date === SF_TODAY) {
    if (!touched.length) status = "not-started";
    else if (shape?.closed) status = "done";
    else if (!visits.some((v) => v.state === "in-progress") && lastOut && NOW_MIN - toMin(lastOut) >= IDLE_AFTER_MIN) status = "idle";
    else status = "on-beat";
  }
  return {
    rep,
    date,
    status,
    visits,
    checkedIn: inn.length,
    startedAt: touched[0] ? hm(toMin(touched[0].checkIn!) - 12) : null,
    endedAt: date === SF_TODAY ? shape?.closed ?? null : lastOut,
    lastCheckIn: last?.checkIn ?? null,
    lastCheckOut: lastOut,
    orderValue: visits.reduce((s, v) => s + v.orderValue, 0),
    orders: visits.filter(withOrder).length,
  };
}

export const DAY_STATUS: Record<DayStatus, { label: string; tone: "good" | "warn" | "danger" | "neutral" | "info" | "off" }> = {
  "on-beat": { label: "On beat", tone: "good" },
  idle: { label: "Idle", tone: "warn" },
  "not-started": { label: "Not started", tone: "danger" },
  done: { label: "Day closed", tone: "neutral" },
};

export const VISIT_STATE: Record<VisitState, { label: string; tone: "good" | "warn" | "danger" | "neutral" | "info" | "off" }> = {
  done: { label: "Done", tone: "good" },
  "in-progress": { label: "In progress", tone: "info" },
  skipped: { label: "Skipped", tone: "warn" },
  pending: { label: "Not yet", tone: "off" },
  missed: { label: "Missed", tone: "danger" },
};

// ── Targets (editable copy) ─────────────────────────────────────────────────

export type TargetRow = Target & { newTarget: number };
export const targetsStore = createStore<TargetRow[]>(TARGETS.map((t) => ({ ...t, newTarget: Math.max(3, Math.round(t.outletsTarget / 20)) })));

/** The incentive rule of the mockup: NPR 500 per new outlet, plus 2% of sales above target. */
export const INCENTIVE_RULE = "NPR 500 per new outlet, plus 2% of sales above target";
export const incentiveOf = (t: TargetRow) => t.incentive + t.newOutlets * 500 + Math.max(0, t.salesActual - t.salesTarget) * 0.02;

// ── History and notes (per record) ──────────────────────────────────────────

export type HistoryItem = { id: string; who: string; what: string; when: string };
export type NoteItem = { id: string; who: string; text: string; when: string };
export const historyStore = createStore<Record<string, HistoryItem[]>>({});
export const notesStore = createStore<Record<string, NoteItem[]>>({
  "rep:EMP-320": [{ id: "N-1", who: "Rajesh Shrestha", text: "Bike in the workshop on Thursdays — start the East beat later.", when: "2 Sep, 18:10" }],
  "rep:EMP-375": [{ id: "N-2", who: "Sneha Maharjan", text: "Joint visits with Arun on Fridays this month.", when: "1 Sep, 09:02" }],
});
let seq = 100;
export function addHistory(key: string, what: string, who = "You") {
  historyStore.set((s) => ({ ...s, [key]: [...(s[key] ?? []), { id: `H-${++seq}`, who, what, when: `Today, ${SF_NOW}` }] }));
}
export function addNote(key: string, text: string, who = "You") {
  notesStore.set((s) => ({ ...s, [key]: [...(s[key] ?? []), { id: `N-${++seq}`, who, text, when: `Today, ${SF_NOW}` }] }));
}

/** The seeded trail of a visit — who did what, when. */
export function visitHistory(v: Visit): HistoryItem[] {
  const rep = repById(v.repId)?.name ?? "Rep";
  const when = (t: string) => `${v.date === SF_TODAY ? "Today" : `${Number(v.date.slice(8))} Sep`}, ${t}`;
  const out: HistoryItem[] = [];
  if (v.checkIn) out.push({ id: `${v.id}-in`, who: rep, what: v.geofence?.ok === false ? `checked in ${v.geofence.metres} m from the outlet` : "checked in at the outlet", when: when(v.checkIn) });
  if (v.state === "skipped") out.push({ id: `${v.id}-sk`, who: rep, what: `skipped the visit — ${v.skipReason?.toLowerCase()}`, when: when(v.checkOut ?? v.checkIn ?? "") });
  if (v.orderId) {
    const o = HUB_ORDERS.find((h) => h.id === v.orderId);
    if (o) out.push({ id: `${v.id}-o`, who: rep, what: `took order ${o.id}`, when: when(o.at.slice(11, 16)) });
  } else if (v.orderValue > 0 && v.checkIn) out.push({ id: `${v.id}-o`, who: rep, what: `took an order of NPR ${Math.round(v.orderValue).toLocaleString("en-US")}`, when: when(hm(toMin(v.checkIn) + Math.max(1, v.minutes - 4))) });
  if (v.checkOut && v.state !== "skipped") out.push({ id: `${v.id}-out`, who: rep, what: "checked out", when: when(v.checkOut) });
  if (!v.planned) out.unshift({ id: `${v.id}-u`, who: rep, what: "added an unplanned visit", when: when(v.checkIn ?? "") });
  return out;
}

export const SF_NOW_LABEL = `Friday, 4 September · ${SF_NOW}`;
export { SF_TODAY, SF_NOW };
