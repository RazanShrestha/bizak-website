import { createStore, ordersStore } from "../sales/store";
import { receiptsStore } from "../sales/flow";
import { totalsOf } from "../sales/orders";
import type { Order } from "../sales/orders";
import type { Receipt } from "../sales/flow";
import {
  FIELD_CLOSES,
  FIELD_FIXES,
  FIELD_HOLIDAYS,
  FIELD_LEAVES,
  FIELD_NOW,
  FIELD_ORDERS,
  FIELD_PARTIES,
  FIELD_PLANS,
  FIELD_PUNCHES,
  FIELD_RECEIPTS,
  FIELD_REPS,
  FIELD_ROUTES,
  FIELD_TODAY,
  FIELD_VISITS,
  WEEKLY_OFF,
  dayAdd,
  holidayOn,
  toClock,
  toMin,
  weekdayIdx,
} from "./seed";
import type { FieldClose, FieldFix, FieldParty, FieldPlan, FieldRep, FieldRoute, FieldVisit } from "./seed";

// ════════════════════════════════════════════════════════════════════════════
// FIELD SALES · KERNEL
//
// Every tab reads the field through these derivations, so a rep-day, a route's
// health or a party's coverage cannot mean one thing on Today and another on
// Performance. The rules, each paid for by a finding in research/:
//
//   1. PLANNED vs ACTUAL is three states, never two: a planned stop is visited
//      or missed, and a visit to a party that was not on the day's routes is
//      UNPLANNED — counted, shown, and never counted as compliance.
//   2. A VISIT IS NOT LINKED TO ITS ORDER in the app (SALES_ORDER has no visit
//      id). "Productive" is inferred: the rep has a live order for that party
//      that day. Every label that relies on it says so in its tooltip.
//   3. A REP'S ORDER follows EODServiceImpl.OwnedBy: SALES_REP_ID when set,
//      else CREATED_BY. Money is summed in BASE currency (amount × rate), which
//      the EOD report does not do today (research/02 §8 #5).
//   4. EDITS ARE INCREMENTAL. A plan, a party-on-route or a rep-on-route is
//      added, moved or removed ONE row at a time — never a replace-all that can
//      drop what the screen does not show (research/01 P1).
//   5. NOTHING IS INVENTED. What the app does not store is marked `needs:`.
// ════════════════════════════════════════════════════════════════════════════

export { FIELD_TODAY, FIELD_NOW, WEEKLY_OFF, dayAdd, weekdayIdx, toMin, toClock, holidayOn };
export type { FieldRep, FieldRoute, FieldParty, FieldPlan, FieldVisit };

// ── Stores (the server, in the mockup) ──────────────────────────────────────

export type PartyOnRoute = { partyId: string; routeId: string; seq: number };
export type Note = { id: string; subject: string; authorId: string; when: string; body: string };
export type Change = { id: string; subject: string; whoId: string; when: string; what: string };

export const routesStore = createStore<FieldRoute[]>(FIELD_ROUTES.map((r) => ({ ...r, repIds: [...r.repIds] })));
export const partyRoutesStore = createStore<PartyOnRoute[]>(
  FIELD_ROUTES.flatMap((rt) => FIELD_PARTIES.filter((p) => p.routeId === rt.id).map((p, i) => ({ partyId: p.id, routeId: rt.id, seq: i + 1 }))),
);
export const plansStore = createStore<FieldPlan[]>(FIELD_PLANS.map((p) => ({ ...p })));
/** Notes and history per subject key: `day:EMP-301:2026-09-04`, `route:RT-01`, `rep:EMP-301`, `visit:V-5001`, `party:C-3001`. */
export const notesStore = createStore<Note[]>([
  { id: "n1", subject: "day:EMP-302:2026-09-04", authorId: "EMP-101", when: "Sep 4, 11:02", body: "Bina called — bike puncture at Teku, started late. Asked her to drop the last two stops if needed." },
  { id: "n2", subject: "route:RT-19", authorId: "EMP-101", when: "Aug 29, 16:40", body: "Kirtipur has no rep since Esha moved to Patan. Sujan can take it once Gongabu settles." },
  { id: "n3", subject: "rep:EMP-320", authorId: "EMP-101", when: "Sep 1, 18:10", body: "Missed the whole day — phone off. Talked to him; watch his first check-ins this week." },
]);
export const changesStore = createStore<Change[]>([
  { id: "c1", subject: "route:RT-19", whoId: "EMP-101", when: "Jul 31, 10:15", what: "removed Esha Lama from the route" },
  { id: "c2", subject: "route:RT-20", whoId: "EMP-101", when: "Sep 3, 12:40", what: "created the route" },
  { id: "c3", subject: "day:EMP-313:2026-09-04", whoId: "EMP-101", when: "Sep 2, 17:05", what: "planned RT-09 Mangal Bazar – Patan" },
  { id: "c4", subject: "rep:EMP-313", whoId: "EMP-118", when: "Sep 2, 18:30", what: "approved sick leave for Sep 3 – 5" },
]);

let seq = 1;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;
const stamp = () => `Sep 4, ${FIELD_NOW}`;
export const ME_ID = "EMP-101";
export function logChange(subject: string, what: string) {
  changesStore.set((cs) => [...cs, { id: uid("chg"), subject, whoId: ME_ID, when: stamp(), what }]);
}
export function addNote(subject: string, body: string) {
  notesStore.set((ns) => [...ns, { id: uid("note"), subject, authorId: ME_ID, when: stamp(), body }]);
}

// ── Lookups ─────────────────────────────────────────────────────────────────

export const REPS = FIELD_REPS;
export const repById = (id: string | null | undefined) => FIELD_REPS.find((r) => r.id === id);
export const routeById = (id: string | null | undefined) => routesStore.get().find((r) => r.id === id);
export const partyById = (id: string | null | undefined) => FIELD_PARTIES.find((p) => p.id === id);
export const PARTIES = FIELD_PARTIES;

/** A route's parties, in stop order (needs: MAP_PARTY_ROUTE.SEQUENCE — proposal D-3; today's order is insertion). */
export function partiesOf(routeId: string, links = partyRoutesStore.get()) {
  return links
    .filter((l) => l.routeId === routeId)
    .sort((a, b) => a.seq - b.seq)
    .map((l) => partyById(l.partyId)!)
    .filter(Boolean);
}
export const routesOfParty = (partyId: string, links = partyRoutesStore.get()) => links.filter((l) => l.partyId === partyId).map((l) => routeById(l.routeId)!).filter(Boolean);
export const routesOfRep = (repId: string, routes = routesStore.get()) => routes.filter((r) => r.repIds.includes(repId));

export const leaveOf = (repId: string, date: string) => FIELD_LEAVES.find((l) => l.repId === repId && l.from <= date && l.to >= date) ?? null;
export const isWorkday = (date: string) => weekdayIdx(date) !== WEEKLY_OFF && !holidayOn(date);

// ── Clock ───────────────────────────────────────────────────────────────────

export type When = "past" | "today" | "future";
export const whenOf = (date: string): When => (date < FIELD_TODAY ? "past" : date === FIELD_TODAY ? "today" : "future");
/** Minutes since midnight that count as "now" for a day: live for today, the whole day for the past. */
const nowFor = (date: string) => (whenOf(date) === "today" ? toMin(FIELD_NOW) : whenOf(date) === "past" ? 24 * 60 : 0);

// ── Money in base currency ──────────────────────────────────────────────────

export const orderValue = (o: Order) => Math.round(totalsOf(o.lines).total * (o.exchangeRate || 1));

export type DayOrder = { no: string; partyId: string; value: number; lines: number; time: string | null; cancelled: boolean; inStore: boolean };
export type DayReceipt = { no: string; partyId: string; amount: number; tagged: number; time: string | null; inStore: boolean };

/** The rep's orders that day — the sales store first (today's are real SO-…), then the older seed figures. */
export function ordersOf(repId: string, date: string, orders: Order[] = ordersStore.get()): DayOrder[] {
  // OwnedBy: SALES_REP_ID wins; CREATED_BY only when no rep is set.
  const live = orders
    .filter((o) => !o.direct && o.date === date && (o.repId ? o.repId === repId : o.created.byId === repId))
    .map((o) => ({ no: o.no, partyId: o.customerId, value: orderValue(o), lines: o.lines.length, time: timeFromHistory(o.history), cancelled: !!o.cancelled, inStore: true }));
  const seen = new Set(live.map((o) => o.no));
  const hist = FIELD_ORDERS.filter((o) => o.repId === repId && o.date === date && !seen.has(o.no)).map((o) => ({
    no: o.no,
    partyId: o.partyId,
    value: o.value,
    lines: o.lines.length,
    time: o.time,
    cancelled: !!o.cancelled,
    inStore: false,
  }));
  return [...live, ...hist];
}
export function receiptsOf(repId: string, date: string, receipts: Receipt[] = receiptsStore.get()): DayReceipt[] {
  const live = receipts
    .filter((r) => r.date === date && r.byId === repId && !r.cancelled)
    .map((r) => ({ no: r.no, partyId: r.customerId, amount: Math.round(r.amount * (r.exchangeRate || 1)), tagged: r.allocations.reduce((s, a) => s + a.amount, 0), time: timeFromHistory(r.history), inStore: true }));
  const seen = new Set(live.map((r) => r.no));
  const hist = FIELD_RECEIPTS.filter((r) => r.repId === repId && r.date === date && !seen.has(r.no)).map((r) => ({ no: r.no, partyId: r.partyId, amount: r.amount, tagged: r.tagged, time: r.time, inStore: false }));
  return [...live, ...hist];
}
function timeFromHistory(h: { when: string }[]) {
  const m = /(\d{2}):(\d{2})/.exec(h[0]?.when ?? "");
  return m ? `${m[1]}:${m[2]}` : null;
}

// ── The rep-day ─────────────────────────────────────────────────────────────

export type StopState = "productive" | "visited" | "pending" | "missed" | "here";
export type Stop = {
  party: FieldParty;
  routeId: string;
  planned: true;
  state: StopState;
  visit: FieldVisit | null;
  orders: DayOrder[];
  receipts: DayReceipt[];
};
export type Unplanned = { party: FieldParty; visit: FieldVisit; productive: boolean; orders: DayOrder[]; receipts: DayReceipt[] };

export type DayStatus =
  | "not-started"
  | "no-plan"
  | "leave-plan" // planned, but the rep is on leave — the route has no one
  | "at-stop"
  | "idle"
  | "behind"
  | "in-field"
  | "done" // worked, not closed yet (evening)
  | "not-closed" // a past day that was never closed
  | "absent" // a past planned day with no punch and no visit
  | "closed"
  | "leave"
  | "off"
  | "planned"; // a future day

export type RepDay = {
  rep: FieldRep;
  date: string;
  when: When;
  plans: FieldPlan[];
  routes: FieldRoute[];
  leave: ReturnType<typeof leaveOf>;
  holiday: ReturnType<typeof holidayOn>;
  stops: Stop[];
  unplanned: Unplanned[];
  visits: FieldVisit[];
  orders: DayOrder[];
  receipts: DayReceipt[];
  punch: { in: string; out: string | null; place: string } | null;
  close: FieldClose | null;
  fixes: FieldFix[];
  status: DayStatus;
  /** One sentence: what is true now, or why the row needs you. */
  line: string;
  needsYou: boolean;
  figures: {
    planned: number;
    visited: number;
    unplanned: number;
    missed: number;
    productive: number;
    orders: number;
    value: number;
    received: number;
    collected: number;
    advance: number;
    firstIn: string | null;
    lastOut: string | null;
    inMarketMin: number;
    behindBy: number;
  };
};

const IDLE_MIN = 45;
/** Stops behind a straight-line pace (start → 18:00) before a rep counts as behind. */
const BEHIND_AT = 2;
const WORK_END = toMin("18:00");

export function repDay(repId: string, date: string, ctx: { plans?: FieldPlan[]; links?: PartyOnRoute[]; routes?: FieldRoute[]; orders?: Order[]; receipts?: Receipt[] } = {}): RepDay {
  const rep = repById(repId)!;
  const when = whenOf(date);
  const plans = (ctx.plans ?? plansStore.get()).filter((p) => p.repId === repId && p.date === date);
  const allRoutes = ctx.routes ?? routesStore.get();
  const routes = plans.map((p) => allRoutes.find((r) => r.id === p.routeId)!).filter(Boolean);
  const leave = leaveOf(repId, date);
  const holiday = holidayOn(date);
  const visits = when === "future" ? [] : FIELD_VISITS.filter((v) => v.repId === repId && v.date === date).sort((a, b) => a.in.localeCompare(b.in));
  const orders = when === "future" ? [] : ordersOf(repId, date, ctx.orders);
  const receipts = when === "future" ? [] : receiptsOf(repId, date, ctx.receipts);
  const live = orders.filter((o) => !o.cancelled);
  const punch = FIELD_PUNCHES.find((p) => p.repId === repId && p.date === date) ?? null;
  const close = FIELD_CLOSES.find((c) => c.repId === repId && c.date === date) ?? null;
  const fixes = FIELD_FIXES.filter((f) => f.repId === repId && f.date === date).sort((a, b) => a.t.localeCompare(b.t));
  const now = nowFor(date);

  const plannedIds = new Set<string>();
  const stops: Stop[] = [];
  for (const p of plans) {
    const onRoute = partiesOf(p.routeId, ctx.links);
    for (const party of p.partyIds ? onRoute.filter((x) => p.partyIds!.includes(x.id)) : onRoute) {
      if (plannedIds.has(party.id)) continue;
      plannedIds.add(party.id);
      const visit = visits.find((v) => v.partyId === party.id) ?? null;
      const os = live.filter((o) => o.partyId === party.id);
      const rs = receipts.filter((x) => x.partyId === party.id);
      let state: StopState = "pending";
      if (visit && !visit.out && when === "today") state = "here";
      else if (visit) state = os.length ? "productive" : "visited";
      else if (when === "past" || close || (when === "today" && leave)) state = "missed";
      stops.push({ party, routeId: p.routeId, planned: true, state, visit, orders: os, receipts: rs });
    }
  }
  const unplanned: Unplanned[] = visits
    .filter((v) => !plannedIds.has(v.partyId))
    .map((v) => {
      const os = live.filter((o) => o.partyId === v.partyId);
      return { party: partyById(v.partyId)!, visit: v, productive: os.length > 0, orders: os, receipts: receipts.filter((x) => x.partyId === v.partyId) };
    });

  const visited = stops.filter((s) => s.state === "productive" || s.state === "visited").length;
  const productive = stops.filter((s) => s.state === "productive").length + unplanned.filter((u) => u.productive).length;
  const firstIn = [punch?.in, visits[0]?.in].filter(Boolean).sort()[0] ?? null;
  const outs = visits.map((v) => v.out).filter((x): x is string => !!x).sort();
  const lastOut = outs[outs.length - 1] ?? null;
  const lastActivity = Math.max(
    ...[lastOut, ...visits.filter((v) => !v.out).map((v) => v.in), fixes[fixes.length - 1]?.t, punch?.in].filter((x): x is string => !!x).map(toMin),
    -1,
  );
  const received = receipts.reduce((s, x) => s + x.amount, 0);
  const collected = receipts.reduce((s, x) => s + Math.min(x.tagged, x.amount), 0);
  // Expected progress: a straight line from the rep's start to 18:00 over the planned stops.
  const start = toMin(rep.start);
  const expected = when === "today" && stops.length ? Math.floor(stops.length * Math.max(0, Math.min(1, (now - start) / (WORK_END - start)))) : 0;
  const behindBy = Math.max(0, expected - visited);

  let status: DayStatus;
  let line = "";
  const here = visits.find((v) => !v.out);
  const routeName = routes[0]?.name ?? "";
  if (when === "future") {
    if (leave) (status = "leave"), (line = `${leave.status === "pending" ? "Leave requested" : "On leave"} · ${leave.type}`);
    else if (holiday) (status = "off"), (line = holiday.name);
    else if (!isWorkday(date)) (status = "off"), (line = "Weekly off");
    else if (plans.length) (status = "planned"), (line = `${stops.length} stops planned`);
    else (status = "no-plan"), (line = "No route planned");
  } else if (leave && leave.status === "approved") {
    if (plans.length && !visits.length) (status = "leave-plan"), (line = `On leave — ${routeName} has no one ${when === "today" ? "today" : "that day"}`);
    else (status = "leave"), (line = `On leave · ${leave.type}`);
  } else if (holiday) (status = "off"), (line = holiday.name);
  else if (!isWorkday(date)) (status = "off"), (line = "Weekly off");
  else if (close) (status = "closed"), (line = `Closed ${close.closedAt}${close.remarks ? ` · “${close.remarks}”` : ""}`);
  else if (!plans.length && !visits.length) (status = "no-plan"), (line = "No route planned");
  else if (!punch && !visits.length) {
    if (when === "past") (status = "absent"), (line = "Planned, but didn't start");
    else if (now >= start) (status = "not-started"), (line = `Not started — due ${rep.start}`);
    else (status = "planned"), (line = `Starts ${rep.start}`);
  } else if (when === "past") (status = "not-closed"), (line = `Worked until ${lastOut ?? "—"} · day not closed`);
  // Behind plan wins even while the rep stands in an outlet: the day will not fit, and that is the manager's call.
  else if (behindBy >= BEHIND_AT && now < WORK_END) (status = "behind"), (line = `${behindBy} behind plan · ${here ? `at ${partyById(here.partyId)?.name} since ${here.in}` : `last visit ${lastOut ?? "—"}`}`);
  else if (here) (status = "at-stop"), (line = `At ${partyById(here.partyId)?.name} · ${now - toMin(here.in)} min`);
  else if (now - lastActivity > IDLE_MIN && now < WORK_END) (status = "idle"), (line = `No activity for ${fmtDur(now - lastActivity)} · last ${toClock(lastActivity)}`);
  else if (now >= WORK_END + 60) (status = "done"), (line = `Last visit ${lastOut ?? "—"} · not closed yet`);
  else (status = "in-field"), (line = `Last visit ${lastOut ?? "—"}${punch ? ` · started ${punch.in}` : ""}`);

  const needsYou = ["not-started", "leave-plan", "idle", "behind", "not-closed", "absent"].includes(status) || (when === "future" && status === "no-plan") || (when === "today" && status === "no-plan");

  return {
    rep,
    date,
    when,
    plans,
    routes,
    leave,
    holiday,
    stops,
    unplanned,
    visits,
    orders,
    receipts,
    punch,
    close,
    fixes,
    status,
    line,
    needsYou,
    figures: {
      planned: stops.length,
      visited,
      unplanned: unplanned.length,
      missed: stops.filter((s) => s.state === "missed").length,
      productive,
      orders: live.length,
      value: live.reduce((s, o) => s + o.value, 0),
      received,
      collected,
      advance: received - collected,
      firstIn,
      lastOut,
      inMarketMin: firstIn && lastOut ? toMin(lastOut) - toMin(firstIn) : firstIn && when === "today" ? now - toMin(firstIn) : 0,
      behindBy,
    },
  };
}

export const fmtDur = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m` : `${min} min`);

export const STATUS_META: Record<DayStatus, { label: string; tone: "positive" | "partial" | "pending" | "neutral" | "danger" }> = {
  "not-started": { label: "Not started", tone: "danger" },
  "no-plan": { label: "No route", tone: "pending" },
  "leave-plan": { label: "On leave · route open", tone: "danger" },
  "at-stop": { label: "At a stop", tone: "positive" },
  idle: { label: "Idle", tone: "danger" },
  behind: { label: "Behind", tone: "danger" },
  "in-field": { label: "In the field", tone: "partial" },
  done: { label: "Done", tone: "partial" },
  "not-closed": { label: "Not closed", tone: "danger" },
  absent: { label: "Didn't start", tone: "danger" },
  closed: { label: "Closed", tone: "positive" },
  leave: { label: "On leave", tone: "neutral" },
  off: { label: "Off", tone: "pending" },
  planned: { label: "Planned", tone: "pending" },
};

// ── Routes: health ──────────────────────────────────────────────────────────

export type RouteHealth = {
  route: FieldRoute;
  parties: FieldParty[];
  reps: FieldRep[];
  weekPlans: FieldPlan[];
  nextRun: FieldPlan | null;
  lastRun: RepDay | null;
  runs: RepDay[];
  coverage30: number; // % of the route's parties visited in the last 30 days
  orders30: number;
  flags: ("no-rep" | "no-parties" | "unplanned-week" | "quiet")[];
};

export function weekOf(date: string) {
  const start = dayAdd(date, -weekdayIdx(date));
  return Array.from({ length: 7 }, (_, i) => dayAdd(start, i));
}

export function routeHealth(routeId: string, ctx: { plans?: FieldPlan[]; links?: PartyOnRoute[]; routes?: FieldRoute[]; orders?: Order[] } = {}): RouteHealth {
  const routes = ctx.routes ?? routesStore.get();
  const route = routes.find((r) => r.id === routeId)!;
  const plans = (ctx.plans ?? plansStore.get()).filter((p) => p.routeId === routeId);
  const parties = partiesOf(routeId, ctx.links);
  const reps = route.repIds.map((id) => repById(id)!).filter(Boolean);
  const week = weekOf(FIELD_TODAY);
  const weekPlans = plans.filter((p) => p.date >= week[0] && p.date <= week[6]);
  const nextRun = plans.filter((p) => p.date >= FIELD_TODAY).sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
  const past = plans.filter((p) => p.date <= FIELD_TODAY).sort((a, b) => b.date.localeCompare(a.date));
  const runs = past.slice(0, 6).map((p) => repDay(p.repId, p.date, ctx));
  const lastRun = runs.find((r) => r.visits.length > 0) ?? null;
  const from = dayAdd(FIELD_TODAY, -30);
  const seen = new Set(FIELD_VISITS.filter((v) => v.date >= from && v.date <= FIELD_TODAY && parties.some((p) => p.id === v.partyId)).map((v) => v.partyId));
  const coverage30 = parties.length ? Math.round((seen.size / parties.length) * 100) : 0;
  const ids = new Set(parties.map((p) => p.id));
  const orders30 = [...(ctx.orders ?? ordersStore.get()).filter((o) => !o.direct && !o.cancelled && o.date >= from && ids.has(o.customerId)).map(orderValue), ...FIELD_ORDERS.filter((o) => o.date >= from && o.date < FIELD_TODAY && ids.has(o.partyId) && !o.cancelled).map((o) => o.value)].reduce((s, v) => s + v, 0);
  const flags: RouteHealth["flags"] = [];
  if (!reps.length) flags.push("no-rep");
  if (!parties.length) flags.push("no-parties");
  // "Not planned" looks ahead a rolling week, not at the calendar week — on a Friday the calendar week is over.
  const ahead = plans.some((p) => p.date >= FIELD_TODAY && p.date <= dayAdd(FIELD_TODAY, 6));
  if (parties.length && !ahead) flags.push("unplanned-week");
  // A route younger than the window has not had the chance to run in it.
  if (parties.length && route.createdOn < from && !past.some((p) => p.date >= from)) flags.push("quiet");
  return { route, parties, reps, weekPlans, nextRun, lastRun, runs, coverage30, orders30, flags };
}

// ── Parties: coverage ───────────────────────────────────────────────────────

export type PartyCoverage = {
  party: FieldParty;
  routes: FieldRoute[];
  lastVisit: FieldVisit | null;
  daysSince: number | null;
  visits30: number;
  lastOrder: { no: string; date: string; value: number } | null;
  orders90: number;
  band: "no-route" | "overdue" | "covered";
};

export function partyCoverage(partyId: string, links = partyRoutesStore.get(), orders: Order[] = ordersStore.get()): PartyCoverage {
  const party = partyById(partyId)!;
  const routes = routesOfParty(partyId, links);
  const vs = FIELD_VISITS.filter((v) => v.partyId === partyId && v.date <= FIELD_TODAY).sort((a, b) => (a.date + a.in).localeCompare(b.date + b.in));
  const lastVisit = vs[vs.length - 1] ?? null;
  const daysSince = lastVisit ? Math.round((Date.parse(FIELD_TODAY) - Date.parse(lastVisit.date)) / 86_400_000) : null;
  const from30 = dayAdd(FIELD_TODAY, -30);
  const from90 = dayAdd(FIELD_TODAY, -90);
  const all = [
    ...orders.filter((o) => !o.direct && !o.cancelled && o.customerId === partyId).map((o) => ({ no: o.no, date: o.date, value: orderValue(o) })),
    ...FIELD_ORDERS.filter((o) => o.partyId === partyId && !o.cancelled && o.date < FIELD_TODAY).map((o) => ({ no: o.no, date: o.date, value: o.value })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const lastOrder = all[all.length - 1] ?? null;
  const band: PartyCoverage["band"] = !routes.length ? "no-route" : daysSince === null || daysSince > 30 ? "overdue" : "covered";
  return { party, routes, lastVisit, daysSince, visits30: vs.filter((v) => v.date >= from30).length, lastOrder, orders90: all.filter((o) => o.date >= from90).reduce((s, o) => s + o.value, 0), band };
}

// ── Writes (each is one row — rule 4) ───────────────────────────────────────

const planKey = (p: { repId: string; routeId: string; date: string }) => `${p.repId}|${p.routeId}|${p.date}`;

/** Plan a route for a rep on days; returns what was added and what was skipped, and why (never shifted). */
export function planRoute(repId: string, routeId: string, dates: string[]) {
  const existing = new Set(plansStore.get().map(planKey));
  const added: FieldPlan[] = [];
  const skipped: { date: string; why: string }[] = [];
  const rep = repById(repId)!;
  for (const date of dates) {
    const leave = leaveOf(repId, date);
    if (leave && leave.status === "approved") skipped.push({ date, why: `${rep.name.split(" ")[0]} is on leave` });
    else if (holidayOn(date)) skipped.push({ date, why: holidayOn(date)!.name });
    else if (!isWorkday(date)) skipped.push({ date, why: "weekly off" });
    else if (existing.has(planKey({ repId, routeId, date }))) skipped.push({ date, why: "already planned" });
    else added.push({ id: uid("RP"), repId, routeId, date, createdBy: ME_ID });
  }
  if (added.length) {
    plansStore.set((ps) => [...ps, ...added]);
    const rt = routeById(routeId);
    added.forEach((p) => logChange(`day:${repId}:${p.date}`, `planned ${rt?.id} ${rt?.name}`));
    logChange(`route:${routeId}`, `planned ${added.length === 1 ? fmtDay(added[0].date) : `${added.length} days`} for ${rep.name}`);
  }
  return { added, skipped };
}

export function removePlan(planId: string) {
  const p = plansStore.get().find((x) => x.id === planId);
  if (!p) return null;
  plansStore.set((ps) => ps.filter((x) => x.id !== planId));
  logChange(`day:${p.repId}:${p.date}`, `removed ${routeById(p.routeId)?.id} from the day`);
  return p;
}
export function restorePlan(p: FieldPlan) {
  plansStore.set((ps) => [...ps, p]);
  logChange(`day:${p.repId}:${p.date}`, `put ${routeById(p.routeId)?.id} back on the day`);
}

/** Move a plan to another rep and/or day — one row updated (PATCH), not delete + save. */
export function movePlan(planId: string, to: { repId?: string; date?: string }): { ok: true; from: FieldPlan } | { ok: false; why: string } {
  const p = plansStore.get().find((x) => x.id === planId);
  if (!p) return { ok: false, why: "That plan is gone." };
  const repId = to.repId ?? p.repId;
  const date = to.date ?? p.date;
  const rep = repById(repId)!;
  const leave = leaveOf(repId, date);
  if (leave && leave.status === "approved") return { ok: false, why: `${rep.name} is on leave on ${fmtDay(date)}.` };
  if (holidayOn(date)) return { ok: false, why: `${fmtDay(date)} is ${holidayOn(date)!.name}.` };
  if (!isWorkday(date)) return { ok: false, why: `${fmtDay(date)} is the weekly off.` };
  if (plansStore.get().some((x) => x.id !== p.id && x.repId === repId && x.routeId === p.routeId && x.date === date)) return { ok: false, why: `${rep.name.split(" ")[0]} already has ${routeById(p.routeId)?.id} on ${fmtDay(date)}.` };
  plansStore.set((ps) => ps.map((x) => (x.id === planId ? { ...x, repId, date } : x)));
  const rt = routeById(p.routeId);
  if (repId !== p.repId) {
    logChange(`day:${p.repId}:${p.date}`, `gave ${rt?.id} to ${rep.name}`);
    logChange(`day:${repId}:${date}`, `took over ${rt?.id} from ${repById(p.repId)?.name}`);
  } else logChange(`day:${repId}:${date}`, `moved ${rt?.id} from ${fmtDay(p.date)}`);
  return { ok: true, from: { ...p } };
}
export function undoMove(planId: string, from: FieldPlan) {
  plansStore.set((ps) => ps.map((x) => (x.id === planId ? { ...x, repId: from.repId, date: from.date } : x)));
}

/**
 * Hand the stops a rep has not reached to someone else (or to himself on another day). The plan he is on keeps
 * what he visited; a new plan carries the rest (ROUTE_PLAN.PARTY_IDS). Returns an undo.
 */
export function handOver(planId: string, to: { repId: string; date: string }): { ok: true; moved: number; undo: () => void } | { ok: false; why: string } {
  const p = plansStore.get().find((x) => x.id === planId);
  if (!p) return { ok: false, why: "That plan is gone." };
  const rep = repById(to.repId)!;
  const leave = leaveOf(to.repId, to.date);
  if (leave && leave.status === "approved") return { ok: false, why: `${rep.name} is on leave on ${fmtDay(to.date)}.` };
  if (!isWorkday(to.date)) return { ok: false, why: `${fmtDay(to.date)} is ${holidayOn(to.date)?.name ?? "the weekly off"}.` };
  const day = repDay(p.repId, p.date);
  const mine = day.stops.filter((s) => s.routeId === p.routeId);
  const kept = mine.filter((s) => s.state === "productive" || s.state === "visited" || s.state === "here").map((s) => s.party.id);
  const rest = mine.filter((s) => !kept.includes(s.party.id)).map((s) => s.party.id);
  if (!rest.length) return { ok: false, why: "Every stop on it is already visited." };
  const before = { ...p };
  const fresh: FieldPlan = { id: uid("RP"), repId: to.repId, routeId: p.routeId, date: to.date, createdBy: ME_ID, partyIds: rest, note: `${rest.length} stops carried from ${repById(p.repId)?.name.split(" ")[0]}, ${fmtDay(p.date)}` };
  plansStore.set((ps) => [...(kept.length ? ps.map((x) => (x.id === planId ? { ...x, partyIds: kept } : x)) : ps.filter((x) => x.id !== planId)), fresh]);
  const rt = routeById(p.routeId);
  const who = to.repId === p.repId ? `to ${fmtDay(to.date)}` : `to ${rep.name}${to.date !== p.date ? `, ${fmtDay(to.date)}` : ""}`;
  logChange(`day:${p.repId}:${p.date}`, `handed ${rest.length} stops of ${rt?.id} ${who}`);
  logChange(`day:${to.repId}:${to.date}`, `took ${rest.length} stops of ${rt?.id} from ${repById(p.repId)?.name}`);
  return {
    ok: true,
    moved: rest.length,
    undo: () => plansStore.set((ps) => [...ps.filter((x) => x.id !== fresh.id && x.id !== planId), before]),
  };
}

/** The next workday after a date (skips the weekly off and holidays). */
export function nextWorkday(date: string) {
  let d = dayAdd(date, 1);
  for (let i = 0; i < 10 && !isWorkday(d); i++) d = dayAdd(d, 1);
  return d;
}

export function addRepToRoute(routeId: string, repId: string) {
  routesStore.set((rs) => rs.map((r) => (r.id === routeId && !r.repIds.includes(repId) ? { ...r, repIds: [...r.repIds, repId] } : r)));
  logChange(`route:${routeId}`, `added ${repById(repId)?.name} to the route`);
  logChange(`rep:${repId}`, `now runs ${routeById(routeId)?.id} ${routeById(routeId)?.name}`);
}
export function removeRepFromRoute(routeId: string, repId: string) {
  routesStore.set((rs) => rs.map((r) => (r.id === routeId ? { ...r, repIds: r.repIds.filter((x) => x !== repId) } : r)));
  logChange(`route:${routeId}`, `removed ${repById(repId)?.name} from the route`);
  logChange(`rep:${repId}`, `no longer runs ${routeById(routeId)?.id}`);
}

export function addPartiesToRoute(routeId: string, partyIds: string[]) {
  const links = partyRoutesStore.get();
  const have = new Set(links.filter((l) => l.routeId === routeId).map((l) => l.partyId));
  let max = Math.max(0, ...links.filter((l) => l.routeId === routeId).map((l) => l.seq));
  const fresh = partyIds.filter((id) => !have.has(id)).map((partyId) => ({ partyId, routeId, seq: ++max }));
  if (!fresh.length) return 0;
  partyRoutesStore.set((ls) => [...ls, ...fresh]);
  logChange(`route:${routeId}`, `added ${fresh.length === 1 ? partyById(fresh[0].partyId)?.name : `${fresh.length} parties`}`);
  fresh.forEach((f) => logChange(`party:${f.partyId}`, `added to ${routeById(routeId)?.id} ${routeById(routeId)?.name}`));
  return fresh.length;
}
export function removePartyFromRoute(routeId: string, partyId: string) {
  const link = partyRoutesStore.get().find((l) => l.routeId === routeId && l.partyId === partyId);
  if (!link) return null;
  partyRoutesStore.set((ls) => ls.filter((l) => l !== link));
  logChange(`route:${routeId}`, `removed ${partyById(partyId)?.name}`);
  logChange(`party:${partyId}`, `removed from ${routeById(routeId)?.id}`);
  return link;
}
export function restorePartyLink(link: PartyOnRoute) {
  partyRoutesStore.set((ls) => [...ls, link]);
  logChange(`route:${link.routeId}`, `put ${partyById(link.partyId)?.name} back`);
}
/** Stop order (proposal D-3): renumber the route's links in the order given. */
export function resequence(routeId: string, partyIds: string[]) {
  partyRoutesStore.set((ls) => ls.map((l) => (l.routeId === routeId ? { ...l, seq: partyIds.indexOf(l.partyId) + 1 || l.seq } : l)));
  logChange(`route:${routeId}`, "changed the stop order");
}

export function createRoute(r: { name: string; description: string; subsidiaryId: string; partyIds: string[]; repIds: string[]; weekdays: number[]; byRepId: string | null; weeks: number }) {
  const routes = routesStore.get();
  const n = Math.max(...routes.map((x) => Number(x.id.slice(3)))) + 1;
  const id = `RT-${String(n).padStart(2, "0")}`;
  const sameSub = routes.filter((x) => x.subsidiaryId === r.subsidiaryId).length;
  const route: FieldRoute = { id, name: r.name, description: r.description, subsidiaryId: r.subsidiaryId, tone: (sameSub % 8) + 1, repIds: r.repIds, center: [27.7, 85.32], createdOn: FIELD_TODAY };
  routesStore.set((rs) => [...rs, route]);
  logChange(`route:${id}`, "created the route");
  if (r.partyIds.length) addPartiesToRoute(id, r.partyIds);
  let planned = 0;
  if (r.byRepId && r.weekdays.length) {
    const days: string[] = [];
    for (let i = 1; i <= r.weeks * 7; i++) {
      const d = dayAdd(FIELD_TODAY, i);
      if (r.weekdays.includes(weekdayIdx(d))) days.push(d);
    }
    planned = planRoute(r.byRepId, id, days).added.length;
  }
  return { route, planned };
}

export function renameRoute(routeId: string, name: string, description: string) {
  routesStore.set((rs) => rs.map((r) => (r.id === routeId ? { ...r, name, description } : r)));
  logChange(`route:${routeId}`, `renamed it to ${name}`);
}

// ── Formatting ──────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS = WD;
export function fmtDay(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${WD[weekdayIdx(iso)]} ${d} ${MONTHS[m - 1]}`;
}
export function fmtDayShort(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}
export function relDayName(iso: string) {
  const diff = Math.round((Date.parse(iso) - Date.parse(FIELD_TODAY)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  return fmtDay(iso);
}
export const money = (n: number) => Math.round(n).toLocaleString("en-US");
/** Compact money for tight cells: 1,84,300 → 184.3K; ≥ 1 lakh reads as lakh (the way the field talks). */
export function moneyShort(n: number) {
  if (n >= 100_000) return `${(n / 100_000).toFixed(n >= 1_000_000 ? 1 : 2).replace(/\.?0+$/, "")}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(Math.round(n));
}
export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
