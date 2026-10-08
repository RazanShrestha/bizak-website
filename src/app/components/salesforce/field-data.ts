import { SF_TODAY } from "./data";
import type { ActResult, Cadence, Customer, HubOrder, PlanEntry, Playbook, Rep, Target, Visit, VisitState } from "./data";
import { customerById, typeOf } from "./engine";
import { evaluateHub, forShopName, isFirstOrder, outletOf } from "./orders-parts";
import { persistentStore } from "./persist";
import { activitiesStore, campaignsStore, customersStore, hubStore, ledgerStore, planStore, playbooksStore, repsStore, routePlanStore, schemesStore, visitsStore, LEGACY_PLAN_IDS } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// FIELD · HELPERS over the shared stores (no seed of its own)
//
// Everything the field pages, Team, Insights and the rep app show is counted
// here from planStore, visitsStore and hubStore: a rep's day, the beat, target
// actuals. Helpers read the stores with .get(), so a component must subscribe
// to the stores it depends on — `useFieldStores` (field-kit) does that in one go.
// ════════════════════════════════════════════════════════════════════════════

// ── Calendar (ISO dates, read as UTC so a timezone never shifts a weekday) ──

const MS_DAY = 86_400_000;
const utc = (d: string) => Date.parse(`${d.slice(0, 10)}T00:00:00Z`);
const isoOf = (t: number) => new Date(t).toISOString().slice(0, 10);

export const addDays = (d: string, n: number) => isoOf(utc(d) + n * MS_DAY);
/** 1 = Monday … 7 = Sunday. */
export const weekdayOf = (d: string) => {
  const w = new Date(utc(d)).getUTCDay();
  return w === 0 ? 7 : w;
};
export const mondayOf = (d: string) => addDays(d, 1 - weekdayOf(d));
/** Weeks since Monday 1 Jan 2024 — the counter "every other week" and "every 4 weeks" step on. */
export const weekNo = (d: string) => Math.round((utc(mondayOf(d)) - utc("2024-01-01")) / (7 * MS_DAY));
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** The working week: reps are planned Monday to Saturday. */
export const DAYS = [
  { n: 1, short: "Mon", label: "Monday" },
  { n: 2, short: "Tue", label: "Tuesday" },
  { n: 3, short: "Wed", label: "Wednesday" },
  { n: 4, short: "Thu", label: "Thursday" },
  { n: 5, short: "Fri", label: "Friday" },
  { n: 6, short: "Sat", label: "Saturday" },
] as const;
export const dayLabel = (n: number) => DAYS.find((d) => d.n === n)?.label ?? "Sunday";
export const dateOfDay = (weekOf: string, n: number) => addDays(mondayOf(weekOf), n - 1);
export const TODAY_DAY = weekdayOf(SF_TODAY);
export const THIS_MONTH = SF_TODAY.slice(0, 7);

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "September 2026" from "2026-09". */
export const monthLabel = (m: string) => `${MON[Number(m.slice(5, 7)) - 1] ?? m} ${m.slice(0, 4)}`;
/** "Fri 4 Sep" from an ISO date. */
export function shortDay(d: string) {
  return `${DAYS.find((x) => x.n === weekdayOf(d))?.short ?? "Sun"} ${Number(d.slice(8, 10))} ${MON[Number(d.slice(5, 7)) - 1]?.slice(0, 3) ?? ""}`;
}

// ── Cadence ─────────────────────────────────────────────────────────────────

export const EVERY_LABEL: Record<Cadence, string> = { 1: "Every week", 2: "Every other week", 4: "Every 4 weeks" };
export const EVERY_SHORT: Record<Cadence, string> = { 1: "weekly", 2: "fortnightly", 4: "monthly" };

/**
 * The week an entry was added — "every other week" and "every 4 weeks" count from it, so a new entry is due in the
 * week it was planned. PlanEntry has no such field; entries without an anchor count from week 0.
 */
export const planStartStore = persistentStore<Record<string, number>>("field.planStart", {});
// A per-customer plan saved before routes (decision #28) was turned into routes on load; its anchors follow.
if (Object.keys(LEGACY_PLAN_IDS).length) planStartStore.set((m) => Object.fromEntries(Object.entries(m).map(([id, week]) => [LEGACY_PLAN_IDS[id] ?? id, week])));

/** Does this entry's cadence put it on the beat in the week of `date`? */
export function inWeek(e: PlanEntry, date: string) {
  if (e.every === 1) return true;
  return mod(weekNo(date) - (planStartStore.get()[e.id] ?? 0), e.every) === 0;
}
export const dueOn = (e: PlanEntry, date: string) => weekdayOf(date) === e.day && inWeek(e, date);
/** Visits in four weeks that plan entries give. */
export const visitsIn4w = (entries: PlanEntry[]) => entries.reduce((s, e) => s + 4 / e.every, 0);

// ── People and places ───────────────────────────────────────────────────────

export const repById = (id: string | null | undefined) => repsStore.get().find((r) => r.id === id);
export const repName = (id: string | null | undefined) => repById(id)?.name ?? (id ? "Removed rep" : "No rep");
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

/** The customers on the routes planned for a rep (`planStore` holds one row per stop of every planned route). */
const onRepRoutes = (repId: string) => new Set(planStore.get().filter((e) => e.repId === repId).map((e) => e.customerId));

/**
 * Where a rep works, as one short line: the city most of the customers on the rep's routes are in, then how many
 * other cities — "Kathmandu" or "Pokhara +2". "No routes" before a route is planned for the rep.
 */
export function repArea(r: Rep): string {
  // Counted from the plan itself: a route with no customers yet is still one of the rep's routes.
  const routes = new Set(routePlanStore.get().filter((p) => p.repId === r.id).map((p) => p.routeId)).size;
  if (!routes) return "No routes";
  const on = onRepRoutes(r.id);
  const tally = new Map<string, number>();
  for (const c of customersStore.get()) if (on.has(c.id) && c.city?.trim()) tally.set(c.city.trim(), (tally.get(c.city.trim()) ?? 0) + 1);
  const cities = [...tally].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([city]) => city);
  // Routes whose customers have no city on record still say something true.
  if (!cities.length) return `${routes} ${routes === 1 ? "route" : "routes"}`;
  return `${cities[0]}${cities.length > 1 ? ` +${cities.length - 1}` : ""}`;
}

/** A rep's customers, by name: the ones the rep owns, and every customer on a route planned for the rep. */
export function repCustomers(rep: Rep | undefined): Customer[] {
  if (!rep) return [];
  const on = onRepRoutes(rep.id);
  return customersStore
    .get()
    .filter((c) => c.repId === rep.id || on.has(c.id))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ── Playbook ────────────────────────────────────────────────────────────────

/** One-word label of a built-in activity for tick rows. */
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
export const activityOf = (id: string) => activitiesStore.get().find((a) => a.id === id);
export const activityName = (id: string) => activityOf(id)?.name ?? "Removed step";
export const actShort = (id: string) => ACT_SHORT[id] ?? activityOf(id)?.name ?? "Step";

export const playbookOf = (c: Customer | undefined): Playbook | null => {
  const id = typeOf(c).playbookId;
  return id ? (playbooksStore.get().find((p) => p.id === id) ?? null) : null;
};

/** With no playbook for the customer's type, a visit offers just these two. */
export const DEFAULT_ACTS = ["AC-ORD", "AC-COL"];

/**
 * The steps of a visit to `c` on `date`: its type's playbook, filtered by each item's "when" — weekly and monthly
 * items drop out once done in that week or month, campaign items only show while a live campaign covers the type.
 */
export function actsFor(c: Customer | undefined, date: string = SF_TODAY): { acts: ActResult[]; playbook: Playbook | null } {
  const pb = playbookOf(c);
  if (!c || !pb) return { acts: DEFAULT_ACTS.map((activityId) => ({ activityId, required: false, geofence: false, done: false, result: "" })), playbook: null };
  const doneSince = (activityId: string, from: string) => visitsStore.get().some((v) => v.customerId === c.id && v.date >= from && v.date <= date && v.acts.some((a) => a.activityId === activityId && a.done));
  const campaignOn = campaignsStore.get().some((k) => k.status === "live" && date >= k.from && date <= k.to && (!k.audience.typeIds.length || k.audience.typeIds.includes(c.typeId)));
  const acts = pb.items
    .filter((i) => {
      if (i.when === "weekly") return !doneSince(i.activityId, mondayOf(date));
      if (i.when === "monthly") return !doneSince(i.activityId, `${date.slice(0, 7)}-01`);
      if (i.when === "during campaign") return campaignOn;
      return true;
    })
    .map((i) => ({ activityId: i.activityId, required: i.required, geofence: i.geofence, done: false, result: "" }));
  return { acts, playbook: pb };
}

// ── Visits ──────────────────────────────────────────────────────────────────

export type OutletStatus = "to-visit" | VisitState;
export const OUTLET_STATUS: Record<OutletStatus, { label: string; tone: "good" | "warn" | "neutral" | "info" }> = {
  "to-visit": { label: "To visit", tone: "neutral" },
  "in-progress": { label: "In progress", tone: "info" },
  done: { label: "Done", tone: "good" },
  skipped: { label: "Skipped", tone: "warn" },
};

export const withOrder = (v: Visit) => !!v.orderId;
/** Visits with an order ÷ visits finished (skips don't count). null = no finished visit yet. */
export function strikeRate(visits: Visit[]) {
  const calls = visits.filter((v) => v.state === "done");
  return calls.length ? Math.round((calls.filter(withOrder).length / calls.length) * 100) : null;
}
export const visitById = (id: string | undefined) => visitsStore.get().find((v) => v.id === id);
export const orderById = (id: string | null | undefined) => (id ? hubStore.get().find((o) => o.id === id) : undefined);

/**
 * "billed to Sagarmatha Distributors for Laxmi Store" when the order went to the shop's distributor (decision #26),
 * "" for a direct order. The visit's customer is the shop; the order's customer is then the distributor.
 */
export function billedToText(o: HubOrder | undefined): string {
  const shop = o ? forShopName(o) : undefined;
  return o && shop ? `billed to ${customerById(o.customerId)?.name ?? "a removed distributor"} for ${shop}` : "";
}
/** "SO-5012" or "SO-5012 · billed to Sagarmatha Distributors for Laxmi Store". */
export function visitOrderText(v: Visit): string {
  if (!v.orderId) return "";
  const b = billedToText(orderById(v.orderId));
  return b ? `${v.orderId} · ${b}` : v.orderId;
}

/** One line of what a visit came to. */
export function outcomeOf(v: Visit): string {
  if (v.state === "skipped") return `Skipped · ${v.skipReason ?? "no reason"}`;
  if (v.state === "in-progress") return `Here since ${v.checkIn ?? "—"}`;
  if (v.orderId) return `Order ${visitOrderText(v)}`;
  if (v.noOrderReason) return `No order · ${v.noOrderReason}`;
  return "Visited";
}

/** Local rule: the counts a rep takes on a visit are kept by visit id (no shared store holds them). */
export const stockCountsStore = persistentStore<Record<string, Record<string, number>>>("field.stockCounts", {});

// ── Orders ──────────────────────────────────────────────────────────────────

/** The one first-order rule and hub pricing live with the Orders hub (orders-parts). */
export { evaluateHub, isFirstOrder, outletOf };

/** An order's value: what the hub billed for an approved order (its invoice), otherwise the hub's pricing. */
export function orderTotal(o: HubOrder) {
  if (o.status === "approved") {
    const inv = ledgerStore.get().find((r) => r.kind === "Invoice" && r.doc === o.id && r.customerId === o.customerId);
    if (inv) return inv.debit;
  }
  return evaluateHub(o, schemesStore.get()).total;
}

// ── A rep's day ─────────────────────────────────────────────────────────────

/** `routeId` = the route this stop is on today (absent for an unplanned visit). */
export type Stop = { customerId: string; entry: PlanEntry | null; visit: Visit | null; status: OutletStatus; routeId?: string };
export type DayStatus = "no-beat" | "not-started" | "at-outlet" | "on-beat" | "done";
export const DAY_STATUS: Record<DayStatus, { label: string; tone: "good" | "warn" | "neutral" | "info" | "off" }> = {
  "no-beat": { label: "No route today", tone: "off" },
  "not-started": { label: "Not started", tone: "warn" },
  "at-outlet": { label: "At an outlet", tone: "info" },
  "on-beat": { label: "On the route", tone: "good" },
  done: { label: "Route done", tone: "good" },
};
export type RepDay = {
  rep: Rep;
  date: string;
  stops: Stop[];
  planned: number;
  visited: number;
  visits: Visit[];
  current: Visit | null;
  lastCheckIn: string | null;
  orders: HubOrder[];
  orderValue: number;
  status: DayStatus;
};

/** The plan entries on a rep's beat for `date`. */
export function beatOn(repId: string, date: string = SF_TODAY): PlanEntry[] {
  return planStore.get().filter((e) => e.repId === repId && dueOn(e, date));
}

/** A rep's day, computed from the plan and the visits: who is due, who was seen, what was ordered. */
export function repDay(rep: Rep, date: string = SF_TODAY): RepDay {
  const visits = visitsStore.get().filter((v) => v.repId === rep.id && v.date === date);
  const latest = (customerId: string) => [...visits].reverse().find((v) => v.customerId === customerId) ?? null;
  const stops: Stop[] = [];
  for (const e of beatOn(rep.id, date)) {
    if (stops.some((s) => s.customerId === e.customerId)) continue;
    const v = latest(e.customerId);
    stops.push({ customerId: e.customerId, entry: e, visit: v, status: v ? v.state : "to-visit", routeId: e.routeId });
  }
  for (const v of visits) {
    if (stops.some((s) => s.customerId === v.customerId)) continue;
    const last = latest(v.customerId);
    stops.push({ customerId: v.customerId, entry: null, visit: last, status: last?.state ?? "done" });
  }
  const planned = stops.filter((s) => s.entry).length;
  const visited = stops.filter((s) => s.entry && s.status === "done").length;
  const current = visits.find((v) => v.state === "in-progress") ?? null;
  const ins = visits
    .map((v) => v.checkIn)
    .filter((x): x is string => !!x)
    .sort();
  const orders = hubStore.get().filter((o) => o.repId === rep.id && o.source === "rep" && o.at.startsWith(date) && o.status !== "rejected");
  const open = stops.filter((s) => s.entry && s.status === "to-visit").length;
  const status: DayStatus = current ? "at-outlet" : !visits.length ? (planned ? "not-started" : "no-beat") : planned && !open ? "done" : "on-beat";
  return { rep, date, stops, planned, visited, visits, current, lastCheckIn: ins[ins.length - 1] ?? null, orders, orderValue: orders.reduce((s, o) => s + orderTotal(o), 0), status };
}

// ── Targets ─────────────────────────────────────────────────────────────────

export type Actuals = { sales: number; orders: number; outlets: number; newOutlets: number };

/**
 * Counted, never stored: sales = approved orders credited to the rep in the month (valued by the engine) — an order
 * billed to a shop's distributor counts too, it is the rep's order; outlets = distinct customers the rep finished a
 * visit at; new outlets = shops whose first order came from this rep in the month, direct or through a distributor
 * (keyed by the shop, so a distributor billed for a shop is not a new outlet of its own).
 */
export function repActuals(repId: string, month: string = THIS_MONTH): Actuals {
  const hub = hubStore.get();
  const approved = hub.filter((o) => o.status === "approved" && o.repId === repId && o.at.startsWith(month));
  const outlets = new Set(visitsStore.get().filter((v) => v.repId === repId && v.date.startsWith(month) && v.state === "done").map((v) => v.customerId)).size;
  const firsts = new Map<string, HubOrder>();
  for (const o of hub.filter((x) => x.status !== "rejected").sort((a, b) => a.at.localeCompare(b.at))) if (!firsts.has(outletOf(o))) firsts.set(outletOf(o), o);
  const newOutlets = [...firsts.values()].filter((o) => o.at.startsWith(month) && o.repId === repId && o.source === "rep").length;
  return { sales: approved.reduce((s, o) => s + orderTotal(o), 0), orders: approved.length, outlets, newOutlets };
}

/** Local rule (report only, owner decision #22). */
export const INCENTIVE_RULE = "Incentive is NPR 500 per new outlet plus 2% of sales above the sales target. It is a report; nothing is paid from here.";
export function incentiveOf(t: Target | undefined, a: Actuals) {
  const over = t && t.salesTarget > 0 ? Math.max(0, a.sales - t.salesTarget) * 0.02 : 0;
  return Math.round(500 * a.newOutlets + over);
}

export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
