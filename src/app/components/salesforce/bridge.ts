import { PEOPLE } from "../productivity/shared";
import { offerClock } from "../sales/estimate-offer";
import { CUSTOMERS as SALES_CUSTOMERS, ITEMS as SALES_ITEMS } from "../sales/orders";
import type { Customer as SalesCustomer, Item as SalesItem, Order } from "../sales/orders";
import { ordersStore } from "../sales/store";
import { SF_NOW, SF_TODAY } from "./data";
import { persistentStore } from "./persist";
import { customersStore, productsStore, repsStore, typesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// BRIDGE — Sales force ⇄ the sales desk (/design/sales/orders)
//
// In Bizak there is ONE customer master, ONE item master and ONE sales order.
// The sales desk mockup has its own seed, so this file (1) adds every Sales
// force customer and product to the desk's CUSTOMERS / ITEMS lists as they are
// created or edited, and (2) keeps the sales orders Sales force writes in
// localStorage and puts them on the desk — after a reload, and in every other
// tab the prototype is open in.
// ════════════════════════════════════════════════════════════════════════════

const TERM_DAYS: [number, string][] = [
  [0, "T0"],
  [7, "T7"],
  [15, "T15"],
  [30, "T30"],
  [45, "T45"],
];
const termFor = (days: number) => [...TERM_DAYS].reverse().find(([d]) => days >= d)?.[1] ?? "T0";

function syncMasters() {
  const types = typesStore.get();
  for (const c of customersStore.get()) {
    const t = types.find((x) => x.id === c.typeId);
    const row: SalesCustomer = { id: c.id, code: c.code, name: c.name, pan: "—", address: c.city, termId: termFor(t?.creditDays ?? 0), currency: "NPR", priceLevel: t?.name ?? "Standard", repId: c.repId ?? undefined };
    const i = SALES_CUSTOMERS.findIndex((x) => x.id === c.id);
    if (i >= 0) SALES_CUSTOMERS[i] = row;
    else SALES_CUSTOMERS.push(row);
  }
  // A rep is an employee: the sales order form's "Sales rep" picker must be able to name the customer's rep.
  for (const r of repsStore.get()) {
    const row = { id: r.id, name: r.name, initials: r.initials, team: r.role === "Sales rep" ? "Field sales" : r.role };
    const i = PEOPLE.findIndex((x) => x.id === r.id);
    if (i >= 0) PEOPLE[i] = row;
    else PEOPLE.push(row);
  }
  for (const p of productsStore.get()) {
    const row: SalesItem = { id: p.id, code: p.code, name: p.name, unit: p.unit, rate: p.listPrice, cost: p.cost, hs: "—", tax: "VAT13", onHand: { "L-KTM": 900, "L-PKR": 260, "L-BTW": 180 } };
    const i = SALES_ITEMS.findIndex((x) => x.id === p.id);
    if (i >= 0) SALES_ITEMS[i] = row;
    else SALES_ITEMS.push(row);
  }
}
syncMasters();

// The estimate's rules run on the customer's clock (owner decision #32): the desk mockup's day stands still, and a
// dealer reading an estimate on the portal must agree with the desk on what "expired" means. `SF_NOW` is live.
offerClock.today = () => SF_TODAY;
offerClock.now = () => `${SF_TODAY} ${SF_NOW}`;

/** An item of the sales desk by id — a sales order made there may carry an item that is not a Sales force product. */
export const deskItemById = (id: string) => SALES_ITEMS.find((x) => x.id === id);

customersStore.subscribe(syncMasters);
productsStore.subscribe(syncMasters);
typesStore.subscribe(syncMasters);
repsStore.subscribe(syncMasters);

/**
 * The sales orders of Sales force's customers — every order from every channel is one (owner decision #31), waiting,
 * approved or rejected — kept across reloads.
 */
const sfOrdersStore = persistentStore<Order[]>("sales.orders", []);

/** The desk mockup's own numbers: a saved order never takes the place of one of these. */
const SEED_NOS = new Set(ordersStore.get().map((o) => o.no));
ordersStore.set((os) => [...sfOrdersStore.get().filter((x) => !os.some((o) => o.no === x.no)), ...os]);

// An SO created here and then delivered or edited on the sales desk keeps that change too.
ordersStore.subscribe(() => {
  const saved = sfOrdersStore.get();
  if (!saved.length) return;
  const now = saved.map((x) => ordersStore.get().find((o) => o.no === x.no) ?? x);
  if (now.some((o, i) => o !== saved[i])) sfOrdersStore.set(() => now);
});

let followingOtherTab = false;
/** True while a sales order another tab saved is being put on this tab's desk — nobody decided anything on this desk. */
export const deskFollowsOtherTab = () => followingOtherTab;

// The prototype runs in several tabs (persist.ts). An order placed in the rep app or the dealer portal, or decided
// in another tab, is on that tab's desk only; what it saved reaches this tab's desk here. This tab's own changes
// never arrive this way: they are on the desk before they are saved.
sfOrdersStore.subscribe(() => {
  const desk = ordersStore.get();
  const theirs = sfOrdersStore.get().filter((x) => !SEED_NOS.has(x.no) && desk.find((o) => o.no === x.no) !== x);
  if (!theirs.length) return;
  followingOtherTab = true;
  try {
    ordersStore.set((os) => [...theirs.filter((x) => !os.some((o) => o.no === x.no)), ...os.map((o) => theirs.find((x) => x.no === o.no) ?? o)]);
  } finally {
    followingOtherTab = false;
  }
});

/** Put a Sales force sales order on the desk (add or replace by number) and keep it. */
export function putSalesOrder(so: Order) {
  // The desk first, so that what is saved next already matches it (see the listener above).
  ordersStore.set((os) => (os.some((x) => x.no === so.no) ? os.map((x) => (x.no === so.no ? so : x)) : [so, ...os]));
  sfOrdersStore.set((list) => (list.some((x) => x.no === so.no) ? list.map((x) => (x.no === so.no ? so : x)) : [so, ...list]));
}
