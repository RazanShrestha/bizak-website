import type { Cadence, Customer, Route, RoutePlan, Visit } from "./data";
import { customerById, typeOf } from "./engine";
import { DAYS, TODAY_DAY, dayLabel, planStartStore, repName, weekNo } from "./field-data";
import { nextId } from "./persist";
import { logEvent } from "./records";
import { customersStore, planStore, routePlanStore, routesStore } from "./store";
import { SF_TODAY } from "./data";

// ════════════════════════════════════════════════════════════════════════════
// ROUTES — the one rules module for routes and the plan (owner decision #28)
//
// A ROUTE is a named, ordered group of customers — its name and its stops,
// nothing else. The PLAN gives a route to a rep on a weekday. Who is due on a
// given day is derived from those two (store.ts `planStore`), never stored —
// so moving a route to another day, or handing it to another rep, moves every
// customer on it at once. Pages call these functions; they do not write the
// stores.
// ════════════════════════════════════════════════════════════════════════════

export const routeById = (id: string | null | undefined) => (id ? routesStore.get().find((r) => r.id === id) : undefined);
export const routeName = (id: string | null | undefined) => routeById(id)?.name ?? (id ? "Removed route" : "No route");
/** The routes a customer is on — usually one. */
export const routesOfCustomer = (customerId: string): Route[] => routesStore.get().filter((r) => r.stops.some((s) => s.customerId === customerId));
/** Where a route is planned: which rep, which weekday. */
export const plansOfRoute = (routeId: string): RoutePlan[] =>
  routePlanStore
    .get()
    .filter((p) => p.routeId === routeId)
    .sort((a, b) => a.day - b.day);
/** A rep's routes on a weekday (1 = Monday … 6 = Saturday), in the order they were planned. */
export const plansOfRep = (repId: string, day?: number): RoutePlan[] => routePlanStore.get().filter((p) => p.repId === repId && (day === undefined || p.day === day));

/** How often a customer should be on its route's run, from its type's visits per 4 weeks. */
export function cadenceFor(c: Customer | undefined): Cadence {
  const per4w = c ? typeOf(c).visitsPer4w : 0;
  return per4w >= 4 ? 1 : per4w >= 2 ? 2 : 4;
}

/** "Mon · Pooja", "Mon, Thu · Pooja", "Not planned". */
export function plannedText(routeId: string): string {
  const plans = plansOfRoute(routeId);
  if (!plans.length) return "Not planned";
  const reps = [...new Set(plans.map((p) => p.repId))];
  return reps.map((r) => `${plans.filter((p) => p.repId === r).map((p) => dayLabel(p.day).slice(0, 3)).join(", ")} · ${repName(r).split(" ")[0]}`).join("; ");
}

/** Visits in four weeks that the plan gives a customer (a weekly stop on a route run twice a week = 8). */
export const plannedPer4w = (customerId: string) =>
  planStore
    .get()
    .filter((e) => e.customerId === customerId)
    .reduce((s, e) => s + 4 / e.every, 0);

/** The route a visit belongs to: the one recorded on it, else the rep's planned route that day holding that customer. */
export function routeOfVisit(v: Pick<Visit, "routeId" | "repId" | "customerId" | "date">): Route | undefined {
  // A recorded null means "taken off any route"; only a visit from before routes existed (no field) is looked up.
  if (v.routeId !== undefined) return routeById(v.routeId);
  const day = new Date(`${v.date}T00:00:00Z`).getUTCDay() || 7;
  return plansOfRep(v.repId, day)
    .map((p) => routeById(p.routeId))
    .find((r) => r?.stops.some((s) => s.customerId === v.customerId));
}
/** The route a rep would be running for this customer today — what a new visit records. */
export const routeForVisitToday = (repId: string, customerId: string) => routeOfVisit({ repId, customerId, date: SF_TODAY, routeId: undefined })?.id ?? null;
/** A visit's route id — recorded, else looked up — so a route since removed can be told from "no route". */
export const routeIdOfVisit = (v: Pick<Visit, "routeId" | "repId" | "customerId" | "date">) => (v.routeId !== undefined ? v.routeId : (routeOfVisit(v)?.id ?? null));

// ── Routes ──────────────────────────────────────────────────────────────────

const clean = (s: string) => s.trim().replace(/\s+/g, " ");
const nameTaken = (name: string, except?: string) => routesStore.get().some((r) => r.id !== except && r.name.toLowerCase() === name.toLowerCase());
const patch = (id: string, fn: (r: Route) => Route) => routesStore.set((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));

/** A refusal sentence, or the new route. */
export function createRoute(input: { name: string; customerIds?: string[] }): { route?: Route; refusal?: string } {
  const name = clean(input.name);
  if (!name) return { refusal: "Give the route a name." };
  if (nameTaken(name)) return { refusal: `There is already a route called ${name}.` };
  const route: Route = { id: nextId("RT-", routesStore.get().map((r) => r.id), 2), name, stops: (input.customerIds ?? []).map((id) => ({ customerId: id, every: cadenceFor(customerById(id)) })) };
  routesStore.set((rs) => [...rs, route]);
  for (const s of route.stops) logEvent(s.customerId, `was put on the route ${route.name}`);
  logEvent(route.id, `created the route${route.stops.length ? ` with ${route.stops.length} ${route.stops.length === 1 ? "customer" : "customers"}` : ""}`);
  return { route };
}

export function renameRoute(id: string, to: string): string | null {
  const r = routeById(id);
  const name = clean(to);
  if (!r || name === r.name) return null;
  if (!name) return "Give the route a name.";
  if (nameTaken(name, id)) return `There is already a route called ${name}.`;
  patch(id, (x) => ({ ...x, name }));
  logEvent(id, `renamed the route from ${r.name} to ${name}`);
  return null;
}

/** Add a customer to the end of a route. Refuses a customer already on it. */
export function addStop(routeId: string, customerId: string, every?: Cadence): string | null {
  const r = routeById(routeId);
  const c = customerById(customerId);
  if (!r || !c) return "Choose a customer.";
  if (r.stops.some((s) => s.customerId === customerId)) return `${c.name} is already on ${r.name}.`;
  patch(routeId, (x) => ({ ...x, stops: [...x.stops, { customerId, every: every ?? cadenceFor(c) }] }));
  // A fortnightly or monthly stop counts from the week it joined, on every day the route already runs.
  const week = weekNo(SF_TODAY);
  planStartStore.set((m) => ({ ...m, ...Object.fromEntries(plansOfRoute(routeId).map((p) => [`${p.id}:${customerId}`, week])) }));
  logEvent(routeId, `added ${c.name} to the route`);
  logEvent(customerId, `was put on the route ${r.name}`);
  return null;
}

export function removeStop(routeId: string, customerId: string) {
  const r = routeById(routeId);
  if (!r || !r.stops.some((s) => s.customerId === customerId)) return;
  patch(routeId, (x) => ({ ...x, stops: x.stops.filter((s) => s.customerId !== customerId) }));
  const name = customerById(customerId)?.name ?? "a removed customer";
  logEvent(routeId, `took ${name} off the route`);
  logEvent(customerId, `was taken off the route ${r.name}`);
}

/** Put a stop back exactly where it was (the Undo of `removeStop`). */
export function restoreStop(routeId: string, stop: Route["stops"][number], index: number) {
  if (!routeById(routeId) || routeById(routeId)!.stops.some((s) => s.customerId === stop.customerId)) return;
  patch(routeId, (x) => ({ ...x, stops: [...x.stops.slice(0, index), stop, ...x.stops.slice(index)] }));
  logEvent(routeId, `put ${customerById(stop.customerId)?.name ?? "a customer"} back on the route`);
  logEvent(stop.customerId, `was put back on the route ${routeName(routeId)}`);
}

/** Change the visit order: move the stop at `from` so it sits at `to`. */
export function moveStop(routeId: string, from: number, to: number) {
  const r = routeById(routeId);
  if (!r || from === to || from < 0 || to < 0 || from >= r.stops.length || to >= r.stops.length) return;
  const stops = [...r.stops];
  const [s] = stops.splice(from, 1);
  stops.splice(to, 0, s);
  patch(routeId, (x) => ({ ...x, stops }));
  logEvent(routeId, `moved ${customerById(s.customerId)?.name ?? "a customer"} to stop ${to + 1}`);
}

export function setStopEvery(routeId: string, customerId: string, every: Cadence) {
  const r = routeById(routeId);
  const s = r?.stops.find((x) => x.customerId === customerId);
  if (!r || !s || s.every === every) return;
  patch(routeId, (x) => ({ ...x, stops: x.stops.map((st) => (st.customerId === customerId ? { ...st, every } : st)) }));
  const week = weekNo(SF_TODAY);
  planStartStore.set((m) => ({ ...m, ...Object.fromEntries(plansOfRoute(routeId).map((p) => [`${p.id}:${customerId}`, week])) }));
  logEvent(routeId, `set ${customerById(customerId)?.name ?? "a customer"} to ${every === 1 ? "every week" : every === 2 ? "every other week" : "every 4 weeks"}`);
}

/** Move a customer from the route(s) it is on to another route, at the end. */
export function moveCustomerToRoute(customerId: string, toRouteId: string): string | null {
  const to = routeById(toRouteId);
  if (!to) return "Choose a route.";
  if (to.stops.some((s) => s.customerId === customerId)) return null;
  const keep = routesOfCustomer(customerId)[0]?.stops.find((s) => s.customerId === customerId)?.every;
  for (const r of routesOfCustomer(customerId)) removeStop(r.id, customerId);
  return addStop(toRouteId, customerId, keep);
}

/** Deleting a route takes it off the plan too. Returns what was removed, for an Undo. */
export function deleteRoute(id: string): { route: Route; plans: RoutePlan[] } | null {
  const route = routeById(id);
  if (!route) return null;
  const plans = plansOfRoute(id);
  routePlanStore.set((ps) => ps.filter((p) => p.routeId !== id));
  routesStore.set((rs) => rs.filter((r) => r.id !== id));
  logEvent(id, `deleted the route ${route.name}${plans.length ? ` and took it off the plan (${plans.length} ${plans.length === 1 ? "day" : "days"})` : ""}`);
  return { route, plans };
}
export function restoreRoute(x: { route: Route; plans: RoutePlan[] }) {
  if (routeById(x.route.id)) return;
  routesStore.set((rs) => [...rs, x.route]);
  routePlanStore.set((ps) => [...ps, ...x.plans.filter((p) => !ps.some((q) => q.id === p.id))]);
  logEvent(x.route.id, "restored the route");
}

// ── The plan: a route, a rep, a weekday ─────────────────────────────────────

const clash = (routeId: string, repId: string, day: number, except?: string) => routePlanStore.get().some((p) => p.id !== except && p.routeId === routeId && p.repId === repId && p.day === day);
const anchor = (planId: string, routeId: string) => {
  const week = weekNo(SF_TODAY);
  planStartStore.set((m) => ({ ...m, ...Object.fromEntries((routeById(routeId)?.stops ?? []).map((s) => [`${planId}:${s.customerId}`, week])) }));
};

/** Give a route to a rep on a weekday. Refuses the same route twice on one day for one rep. */
export function planRoute(routeId: string, repId: string, day: number): { plan?: RoutePlan; refusal?: string } {
  const r = routeById(routeId);
  if (!r) return { refusal: "Choose a route." };
  if (!repId) return { refusal: "Choose a rep." };
  if (!DAYS.some((d) => d.n === day)) return { refusal: "Choose a day." };
  if (clash(routeId, repId, day)) return { refusal: `${r.name} is already on ${repName(repId).split(" ")[0]}'s ${dayLabel(day)}.` };
  const plan: RoutePlan = { id: nextId("RP-", routePlanStore.get().map((p) => p.id), 3), routeId, repId, day };
  routePlanStore.set((ps) => [...ps, plan]);
  anchor(plan.id, routeId);
  logEvent(routeId, `planned for ${repName(repId)} on ${dayLabel(day)}s`);
  logEvent(repId, `was given the route ${r.name} on ${dayLabel(day)}s`);
  return { plan };
}

/** Returns what was taken off, with its place among the plans, so an Undo puts it back where it was. */
export function unplanRoute(planId: string): (RoutePlan & { index: number }) | null {
  const index = routePlanStore.get().findIndex((x) => x.id === planId);
  const p = routePlanStore.get()[index];
  if (!p) return null;
  routePlanStore.set((ps) => ps.filter((x) => x.id !== planId));
  logEvent(p.routeId, `taken off ${repName(p.repId)}'s ${dayLabel(p.day)}`);
  logEvent(p.repId, `no longer runs ${routeName(p.routeId)} on ${dayLabel(p.day)}s`);
  return { ...p, index };
}
export function restorePlan(taken: RoutePlan & { index?: number }) {
  const { index, ...p } = taken;
  if (routePlanStore.get().some((x) => x.id === p.id) || clash(p.routeId, p.repId, p.day)) return;
  routePlanStore.set((ps) => (index == null || index > ps.length ? [...ps, p] : [...ps.slice(0, index), p, ...ps.slice(index)]));
  logEvent(p.routeId, `put back on ${repName(p.repId)}'s ${dayLabel(p.day)}`);
}

/** Move a planned route to another weekday (same rep). */
export function movePlan(planId: string, day: number): string | null {
  const p = routePlanStore.get().find((x) => x.id === planId);
  if (!p || p.day === day) return null;
  if (clash(p.routeId, p.repId, day, planId)) return `${routeName(p.routeId)} is already on ${repName(p.repId).split(" ")[0]}'s ${dayLabel(day)}.`;
  routePlanStore.set((ps) => ps.map((x) => (x.id === planId ? { ...x, day } : x)));
  logEvent(p.routeId, `moved from ${dayLabel(p.day)} to ${dayLabel(day)} for ${repName(p.repId)}`);
  return null;
}

/** Hand a planned route to another rep (same weekday) — every customer on it goes with it. */
export function givePlan(planId: string, repId: string): string | null {
  const p = routePlanStore.get().find((x) => x.id === planId);
  if (!p || p.repId === repId) return null;
  if (clash(p.routeId, repId, p.day, planId)) return `${routeName(p.routeId)} is already on ${repName(repId).split(" ")[0]}'s ${dayLabel(p.day)}.`;
  routePlanStore.set((ps) => ps.map((x) => (x.id === planId ? { ...x, repId } : x)));
  logEvent(p.routeId, `handed from ${repName(p.repId)} to ${repName(repId)} on ${dayLabel(p.day)}s`);
  logEvent(repId, `was given the route ${routeName(p.routeId)} on ${dayLabel(p.day)}s`);
  logEvent(p.repId, `handed the route ${routeName(p.routeId)} to ${repName(repId)}`);
  return null;
}

/** When a rep is removed, their days come off the plan; the routes themselves stay. */
export function unplanRep(repId: string) {
  routePlanStore.set((ps) => ps.filter((p) => p.repId !== repId));
}

// ── Coverage ────────────────────────────────────────────────────────────────

export type Gap = { customer: Customer; asked: number; planned: number; routes: Route[]; kind: "no-route" | "not-planned" | "short" };
/**
 * Who is not covered: a customer whose type asks for visits and who is on no route, on a route nobody runs, or is
 * planned less often than the type asks. Customers whose type asks for no visits are left out.
 */
export function coverageGaps(customers: Customer[] = customersStore.get()): Gap[] {
  const gaps: Gap[] = [];
  for (const c of customers) {
    const asked = typeOf(c).visitsPer4w;
    if (!asked) continue;
    const routes = routesOfCustomer(c.id);
    const planned = plannedPer4w(c.id);
    if (!routes.length) gaps.push({ customer: c, asked, planned, routes, kind: "no-route" });
    else if (!planned) gaps.push({ customer: c, asked, planned, routes, kind: "not-planned" });
    else if (planned < asked) gaps.push({ customer: c, asked, planned, routes, kind: "short" });
  }
  const rank = { "no-route": 0, "not-planned": 1, short: 2 };
  return gaps.sort((a, b) => rank[a.kind] - rank[b.kind] || a.customer.name.localeCompare(b.customer.name));
}

/** Is today one of this plan's days? */
export const runsToday = (p: RoutePlan) => p.day === TODAY_DAY;
