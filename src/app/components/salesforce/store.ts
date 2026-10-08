import { ordersStore, useStore } from "../sales/store";
import {
  ACTIVITIES,
  DEFAULT_PORTAL,
  MODULES,
  SAMPLE_ANNOUNCEMENTS,
  SAMPLE_BRANDING,
  SAMPLE_CAMPAIGNS,
  SAMPLE_CLAIMS,
  SAMPLE_CUSTOMERS,
  SAMPLE_CUSTOMER_TYPES,
  SAMPLE_EVENTS,
  SAMPLE_HUB_ORDERS,
  SAMPLE_LEDGER,
  SAMPLE_PINGS,
  SAMPLE_ROUTES,
  SAMPLE_ROUTE_PLAN,
  routesFromPlan,
  SAMPLE_PLAYBOOKS,
  SAMPLE_POSM,
  SAMPLE_PRODUCTS,
  SAMPLE_REPS,
  SAMPLE_SCHEMES,
  SAMPLE_TARGETS,
  SAMPLE_VISITS,
} from "./data";
import type {
  Activity,
  Announcement,
  BrandingJob,
  Campaign,
  Claim,
  Customer,
  CustomerType,
  FieldSettings,
  LocationPing,
  HubOrder,
  LedgerEntry,
  LogRow,
  ModuleKey,
  Note,
  Opportunity,
  PlanEntry,
  Route,
  RoutePlan,
  Playbook,
  PortalSettings,
  PosmItem,
  Product,
  Quote,
  Rep,
  Scheme,
  SecondarySale,
  SfEvent,
  Target,
  Visit,
} from "./data";
import { dropSaved, persistentStore, readSaved } from "./persist";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE v2 · STORES — "the server" of the prototype
//
// One store per record set, shared by every page — the company side, the rep
// app and the dealer portal — so an order a dealer places appears in the
// Orders hub, a type edited in Setup prices the next cart, and so on. Every
// store is persistent (persist.ts) and starts EMPTY unless the user loaded the
// sample business. Pages never import SAMPLE_* data directly.
// ════════════════════════════════════════════════════════════════════════════

const copy = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

// ── Setup ───────────────────────────────────────────────────────────────────
export const modulesStore = persistentStore<{ key: ModuleKey; name: string; blurb: string; on: boolean }[]>("modules", copy(MODULES));
export const typesStore = persistentStore<CustomerType[]>("types", [], () => copy(SAMPLE_CUSTOMER_TYPES));
/** The activity library: the built-in steps plus any the tenant adds (custom forms, documents). */
export const activitiesStore = persistentStore<Activity[]>("activities", copy(ACTIVITIES));
export const playbooksStore = persistentStore<Playbook[]>("playbooks", [], () => copy(SAMPLE_PLAYBOOKS));
export const portalSettingsStore = persistentStore<PortalSettings>("portal.settings", copy(DEFAULT_PORTAL), () => ({ ...copy(DEFAULT_PORTAL), brand: "Bizak Nepal · Dealer portal" }));
export const announcementsStore = persistentStore<Announcement[]>("announcements", [], () => copy(SAMPLE_ANNOUNCEMENTS));

// ── Masters ─────────────────────────────────────────────────────────────────
export const productsStore = persistentStore<Product[]>("products", [], () => copy(SAMPLE_PRODUCTS));
export const repsStore = persistentStore<Rep[]>("reps", [], () => copy(SAMPLE_REPS));
export const customersStore = persistentStore<Customer[]>("customers", [], () => copy(SAMPLE_CUSTOMERS));
export const targetsStore = persistentStore<Target[]>("targets", [], () => copy(SAMPLE_TARGETS));

// ── Selling ─────────────────────────────────────────────────────────────────
export const schemesStore = persistentStore<Scheme[]>("schemes", [], () => copy(SAMPLE_SCHEMES));
export const hubStore = persistentStore<HubOrder[]>("hub", [], () => copy(SAMPLE_HUB_ORDERS));
/** Superseded by opportunities + estimates (decision #27); kept only so old saved requests can be converted. */
export const quotesStore = persistentStore<Quote[]>("quotes", []);
/** The estimate that answers an opportunity is the sales desk's own (decision #32): there is no estimate store here. */
export const opportunitiesStore = persistentStore<Opportunity[]>("opportunities", []);
/** Invoices, receipts, credit notes and opening balances — what every customer owes is counted from here. */
export const ledgerStore = persistentStore<LedgerEntry[]>("ledger", [], () => copy(SAMPLE_LEDGER));

// ── Field ───────────────────────────────────────────────────────────────────
/** Routes, and which rep runs which route on which weekday (owner decision #28). */
export const routesStore = persistentStore<Route[]>("routes", [], () => copy(SAMPLE_ROUTES));
export const routePlanStore = persistentStore<RoutePlan[]>("routePlan", [], () => copy(SAMPLE_ROUTE_PLAN));

/**
 * Before decision #28 the plan was saved per customer (key "plan"). Whatever was saved that way is turned into
 * routes once, and the old key dropped. `LEGACY_PLAN_IDS` lets the cadence anchors follow (field-data.ts).
 */
export const LEGACY_PLAN_IDS: Record<string, string> = (() => {
  const old = readSaved<PlanEntry[]>("plan");
  if (!old) return {};
  dropSaved("plan");
  if (!old.length || routesStore.get().length) return {};
  const made = routesFromPlan(old, (id) => customersStore.get().find((c) => c.id === id)?.city.trim());
  routesStore.set(() => made.routes);
  routePlanStore.set(() => made.plans);
  return made.ids;
})();

const derivePlan = (): PlanEntry[] => {
  const routes = routesStore.get();
  return routePlanStore.get().flatMap((p) => (routes.find((r) => r.id === p.routeId)?.stops ?? []).map((s) => ({ id: `${p.id}:${s.customerId}`, repId: p.repId, customerId: s.customerId, day: p.day, every: s.every, routeId: p.routeId, planId: p.id })));
};
/**
 * Who is due with whom on which weekday — one row per stop of every planned route, in route order. Read-only: it
 * follows `routesStore` and `routePlanStore`; change the plan through `routes.ts`.
 */
export const planStore = (() => {
  let state = derivePlan();
  const listeners = new Set<() => void>();
  const refresh = () => {
    state = derivePlan();
    listeners.forEach((l) => l());
  };
  routesStore.subscribe(refresh);
  routePlanStore.subscribe(refresh);
  return {
    get: () => state,
    set: (_fn: (s: PlanEntry[]) => PlanEntry[]) => console.warn("[sf2] planStore is derived from routes; plan through routes.ts"),
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
})();
export const visitsStore = persistentStore<Visit[]>("visits", [], () => copy(SAMPLE_VISITS));
/** Every GPS reading the rep app took — the office's "where are my reps". */
export const locationsStore = persistentStore<LocationPing[]>("field.locations", [], () => copy(SAMPLE_PINGS));
/** How close (metres) a rep must be to an outlet to count as "at the shop". */
export const fieldSettingsStore = persistentStore<FieldSettings>("field.settings", { geofenceMetres: 150 });

// ── Growth and money ────────────────────────────────────────────────────────
export const campaignsStore = persistentStore<Campaign[]>("campaigns", [], () => copy(SAMPLE_CAMPAIGNS));
export const brandingStore = persistentStore<BrandingJob[]>("branding", [], () => copy(SAMPLE_BRANDING));
export const posmStore = persistentStore<PosmItem[]>("posm", [], () => copy(SAMPLE_POSM));
export const eventsStore = persistentStore<SfEvent[]>("events", [], () => copy(SAMPLE_EVENTS));
export const claimsStore = persistentStore<Claim[]>("claims", [], () => copy(SAMPLE_CLAIMS));

// ── Dealer portal ───────────────────────────────────────────────────────────
/** Who is signed in to the dealer portal. The prototype has no passwords: the tester picks a customer and user. */
export const portalSessionStore = persistentStore<{ customerId: string | null; userName: string | null }>("portal.session", { customerId: null, userName: null });
/** One cart per dealer, keyed by customer id. */
export const cartsStore = persistentStore<Record<string, { productId: string; qty: number; price?: number }[]>>("portal.carts", {});
/** What dealers sold to their own customers (secondary sales). */
export const secondaryStore = persistentStore<SecondarySale[]>("secondary", []);

// ── Rep app ─────────────────────────────────────────────────────────────────
/** Which rep is using the rep app. */
export const repSessionStore = persistentStore<{ repId: string | null }>("rep.session", { repId: null });

// ── Records: History and Notes, keyed by record id (SO-…, C-…, SCH-…) ───────
export const historyStore = persistentStore<Record<string, LogRow[]>>("history", {});
export const notesStore = persistentStore<Record<string, Note[]>>("notes", {});

// ── Orders saved before decision #31 ────────────────────────────────────────

/**
 * Until owner decision #31 an order had a number of its own (ORD-…) next to its sales order's (`soNo`). An order saved
 * that way takes the number of the sales order Sales force wrote for it — one that had none yet takes the next free
 * number — and whatever was filed under the old number follows: the visit that took it, its history and notes, the
 * estimate and opportunity it came from, a claim about it, its bill. It runs here, before any module reads these
 * stores, and a load with nothing left to convert writes nothing. `LEGACY_ORDER_IDS` (old number → new) lets a store
 * kept in another module follow (dealer/portal.ts).
 */
export const LEGACY_ORDER_IDS: Record<string, string> = (() => {
  type Saved = HubOrder & { soNo?: string | null };
  const ids: Record<string, string> = {};
  // The sample set was renumbered the same way (data.ts): ORD-2210 is SO-4210 there.
  const inSample = (id: string) => {
    const m = /^ORD-2(\d{3})$/.exec(id);
    return m ? `SO-4${m[1]}` : null;
  };
  const hub = hubStore.get() as Saved[];
  // The sales orders Sales force wrote (bridge.ts keeps them). The sample set's old `soNo`s were never written: on the
  // desk those numbers are the desk mockup's own orders, for other customers.
  const wrote = readSaved<{ no: string; customerId: string; memo?: string }[]>("sales.orders") ?? [];
  // Saved the old way: under a number of its own, or under one that is not its sales order's.
  const old = hub.filter((o) => !o.id.startsWith("SO-") || (!!o.soNo && o.soNo !== o.id)).sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
  if (old.length) {
    const taken = new Set([...ordersStore.get().map((o) => o.no), ...wrote.map((o) => o.no), ...hub.map((o) => o.id)]);
    const given = new Set<string>();
    const next = () => {
      const nums = [...taken, ...given].filter((no) => /^SO-\d+$/.test(no)).map((no) => Number(no.slice(3)));
      return `SO-${Math.max(5000, ...nums) + 1}`;
    };
    for (const o of old) {
      const own = o.soNo && wrote.some((x) => x.no === o.soNo && x.customerId === o.customerId) ? o.soNo : null;
      const sample = inSample(o.id);
      // Its sales order's number, unless another order holds it.
      const id = own && !given.has(own) && !hub.some((h) => h !== o && h.id === own) ? own : o.id.startsWith("SO-") ? o.id : sample && !taken.has(sample) && !given.has(sample) ? sample : next();
      given.add(id);
      if (id === o.id) continue;
      ids[o.id] = id;
      // A sample store that was never saved already names the order by its sample number.
      if (sample && sample !== id) ids[sample] = id;
    }
    hubStore.set((hs) => (hs as Saved[]).map(({ soNo: _soNo, ...o }) => ({ ...o, id: ids[o.id] ?? o.id })));
  }
  // An order converted on an earlier load, with a store that still names it the old way: its sales order kept the old
  // number in its memo ("From ORD-0012 · Dealer portal · …").
  for (const so of wrote) {
    const was = /^From (ORD-\d+) · /m.exec(so.memo ?? "")?.[1];
    if (was && !ids[was] && hubStore.get().some((o) => o.id === so.no)) ids[was] = so.no;
  }
  // And the sample orders, which were never saved (they load renumbered) while a store that names them was.
  for (const o of hubStore.get()) {
    const m = /^SO-4(\d{3})$/.exec(o.id);
    if (m && !ids[`ORD-2${m[1]}`]) ids[`ORD-2${m[1]}`] = o.id;
  }

  /** Saves a store only when a row did change, so a load with nothing to convert writes nothing. */
  const follow = <T>(store: { get: () => T[]; set: (fn: (s: T[]) => T[]) => void }, fn: (x: T) => T) => {
    const was = store.get();
    const now = was.map(fn);
    if (now.some((x, i) => x !== was[i])) store.set(() => now);
  };
  const moved = <T extends { orderId: string | null }>(x: T): T => (x.orderId && ids[x.orderId] ? { ...x, orderId: ids[x.orderId] } : x);
  const rekeyed = <T>(m: Record<string, T[]>) => {
    const out: Record<string, T[]> = {};
    for (const [key, rows] of Object.entries(m)) out[ids[key] ?? key] = [...(out[ids[key] ?? key] ?? []), ...rows];
    return out;
  };
  // A claim names its order in its basis ("Order ORD-0012."), a bill in its note.
  const named = (text: string) => text.replace(/\bOrder (ORD-[\w-]+)/g, (all, id: string) => (ids[id] ? `Order ${ids[id]}` : all));

  // The order step's result opens with the order's number.
  follow(visitsStore, (v) => {
    const was = v.orderId;
    const id = was ? ids[was] : undefined;
    return was && id ? { ...v, orderId: id, acts: v.acts.map((a) => (a.result.startsWith(was) ? { ...a, result: id + a.result.slice(was.length) } : a)) } : v;
  });
  if (Object.keys(historyStore.get()).some((key) => ids[key])) historyStore.set(rekeyed);
  if (Object.keys(notesStore.get()).some((key) => ids[key])) notesStore.set(rekeyed);
  // An estimate saved before decision #32 names its order too: estimates.ts follows as it moves it to the sales desk.
  follow(opportunitiesStore, moved);
  follow(quotesStore, moved);
  follow(claimsStore, (c) => (named(c.basis) === c.basis ? c : { ...c, basis: named(c.basis) }));
  follow(ledgerStore, (r) => (r.note && named(r.note) !== r.note ? { ...r, note: named(r.note) } : r));
  return ids;
})();

export { useStore };
