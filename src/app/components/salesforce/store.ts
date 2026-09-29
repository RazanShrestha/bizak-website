import { createStore, useStore } from "../sales/store";
import { BRANDING, CAMPAIGNS, CLAIMS, CUSTOMERS, CUSTOMER_TYPES, EVENTS, HUB_ORDERS, MODULES, PLAYBOOKS, POSM, SCHEMES } from "./data";
import type { BrandingJob, Campaign, Claim, Customer, CustomerType, HubOrder, Playbook, PosmItem, Scheme, SfEvent } from "./data";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE v2 · STORES — "the server" of the mockup
//
// One in-memory store per record set, shared by every page (company side and
// dealer portal), so an order a dealer places appears in the Orders hub, a
// scheme edited in the builder prices the next cart, and so on.
// ════════════════════════════════════════════════════════════════════════════

export const schemesStore = createStore<Scheme[]>(SCHEMES.map((s) => ({ ...s, budget: s.budget ? { ...s.budget } : null })));
export const hubStore = createStore<HubOrder[]>(HUB_ORDERS.map((o) => ({ ...o, lines: o.lines.map((l) => ({ ...l })) })));
export const customersStore = createStore<Customer[]>(CUSTOMERS);
export const typesStore = createStore<CustomerType[]>(CUSTOMER_TYPES.map((t) => ({ ...t })));
export const campaignsStore = createStore<Campaign[]>(CAMPAIGNS);
export const brandingStore = createStore<BrandingJob[]>(BRANDING.map((b) => ({ ...b })));
export const posmStore = createStore<PosmItem[]>(POSM.map((p) => ({ ...p })));
export const eventsStore = createStore<SfEvent[]>(EVENTS);
export const claimsStore = createStore<Claim[]>(CLAIMS.map((c) => ({ ...c })));
export const playbooksStore = createStore<Playbook[]>(PLAYBOOKS.map((p) => ({ ...p, items: p.items.map((i) => ({ ...i })) })));
export const modulesStore = createStore(MODULES.map((m) => ({ ...m })));

/** The dealer portal's cart (the logged-in dealer). */
export const cartStore = createStore<{ productId: string; qty: number; price?: number }[]>([
  { productId: "P-101", qty: 8 },
  { productId: "P-111", qty: 40 },
]);

export { useStore };
