import { SF_TODAY } from "./data";
import type { Customer, CustomerType, HubOrder, Level, Playbook, Portal, Product, Rep, Scheme, SchemeMechanic } from "./data";
import { eligible, evaluate, npr } from "./engine";

// ════════════════════════════════════════════════════════════════════════════
// NETWORK · derivations shared by Customers, Products and Setup
//
// Everything here reads what it is given (or the live store) — never sample
// data. "Served by" is `customer.parentId` and nothing else. Every helper
// survives a missing record (a deleted type, rep or parent).
// ════════════════════════════════════════════════════════════════════════════

// ── The trade tree ──────────────────────────────────────────────────────────

export const childrenOf = (id: string, customers: Customer[]) => customers.filter((c) => c.parentId === id);

/** Every customer under `id`, at any depth (a super-stockist's distributors and their retailers). */
export function descendantsOf(id: string, customers: Customer[]): Customer[] {
  const out: Customer[] = [];
  const seen = new Set<string>([id]);
  const walk = (pid: string) => {
    for (const k of childrenOf(pid, customers)) {
      if (seen.has(k.id)) continue;
      seen.add(k.id);
      out.push(k);
      walk(k.id);
    }
  };
  walk(id);
  return out;
}

// ── Types ───────────────────────────────────────────────────────────────────

export const LEVEL_LABEL: Record<Level, string> = { primary: "Primary", secondary: "Secondary", direct: "Direct" };
export const LEVEL_HINT: Record<Level, string> = {
  primary: "Buys from you and sells on",
  secondary: "Buys from your distributors",
  direct: "Buys from you for its own use",
};
export const PORTAL_LABEL: Record<Portal, string> = { dealer: "Dealer portal", retailer: "Retailer app", none: "No portal" };

/** The next identity colour for a new type (1–8). */
export const nextColor = (types: CustomerType[]) => (types.length % 8) + 1;

/** "What a <type> gets", as one sentence — the whole policy a type carries. */
export function getsSentence(t: CustomerType, playbooks: Playbook[]) {
  const pb = playbooks.find((p) => p.id === t.playbookId);
  const parts = [
    t.priceOff ? `buys at ${t.priceOff}% off the list price` : "buys at the list price",
    `gets ${t.creditDays} days' credit — an order over the limit, or with a bill more than ${t.graceDays} days overdue, ${t.creditStop === "hard" ? "is blocked" : "gets a warning"}`,
    t.portal === "dealer" ? "can order and pay on the dealer portal" : t.portal === "retailer" ? "orders from its distributor on the retailer app" : "has no portal",
  ];
  if (t.ownCustomers) parts.push("sells to customers of its own");
  parts.push(t.visitsPer4w ? `is visited ${t.visitsPer4w === 1 ? "once" : `${t.visitsPer4w} times`} every 4 weeks${pb ? ` on the ${pb.name} playbook` : ""}` : "is not visited by reps");
  const last = parts.pop();
  return `A ${(t.name || "customer").toLowerCase()} ${parts.join(", ")} and ${last}.`;
}

// ── Reps ────────────────────────────────────────────────────────────────────

export const repById = (id: string | null | undefined, reps: Rep[]) => (id ? reps.find((r) => r.id === id) : undefined);
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// ── Schemes ─────────────────────────────────────────────────────────────────

export function mechanicText(m: SchemeMechanic) {
  switch (m.kind) {
    case "free-goods":
      return `Buy ${m.buyQty}, get ${m.getQty} free`;
    case "slab":
      return m.slabs.map((s) => `${s.minQty}+ → ${s.pct}%`).join(" · ");
    case "combo":
      return `Combo of ${m.needs.length} lines, ${m.getQty} free`;
    case "invoice-value":
      return `${m.pct}% off orders over NPR ${npr(m.minValue)}`;
    case "first-order":
      return `${m.pct}% off the first order`;
    case "target-rebate":
      return `${m.pct}% rebate on NPR ${npr(m.target)} (${m.period})`;
    case "display":
      return `NPR ${npr(m.amount)} a ${m.per} for a display`;
    case "early-payment":
      return `${m.pct}% off if paid in ${m.withinDays} days`;
  }
}

/** The product ids a scheme names; null = it works on the whole order, whatever is in it. */
export function schemeProductIds(m: SchemeMechanic): string[] | null {
  switch (m.kind) {
    case "free-goods":
      return [...m.buyItemIds, ...(m.getItemId === "same" ? [] : [m.getItemId])];
    case "slab":
      return m.itemIds;
    case "combo":
      return [...m.needs.flatMap((n) => n.itemIds), m.getItemId];
    default:
      return null;
  }
}

/** The schemes a customer gets today: live, and it qualifies (the engine's own rule). */
export const schemesNow = (c: Customer, schemes: Scheme[]) => schemes.filter((s) => s.status === "live" && eligible(s, c) === null);

// ── Money and status ────────────────────────────────────────────────────────

/** This month's hub orders that are not rejected, valued by the one engine. */
export function monthValue(orders: HubOrder[], customerIds: Set<string>, schemes: Scheme[]) {
  const month = SF_TODAY.slice(0, 7);
  return orders
    .filter((o) => o.at.slice(0, 7) === month && o.status !== "rejected" && customerIds.has(o.customerId))
    .reduce((s, o) => s + evaluate(o.customerId, o.lines, schemes).total, 0);
}

export const STATUS_TONE: Record<Customer["status"], "good" | "warn" | "danger"> = { active: "good", onboarding: "warn", "on hold": "danger" };
export const STATUS_LABEL: Record<Customer["status"], string> = { active: "Active", onboarding: "Onboarding", "on hold": "On hold" };

/** "No check", "Cash only" or the amount — how a credit limit reads (owner decision #2). */
export const limitText = (limit: number | null) => (limit === null ? "No credit check" : limit === 0 ? "Cash only" : `NPR ${npr(limit)}`);

/** A stand-in customer of one type — how the engine prices a product "for a distributor". */
export const customerOfType = (typeId: string): Customer => ({
  id: "",
  code: "",
  name: "",
  typeId,
  parentId: null,
  tier: "B",
  repId: null,
  city: "",
  phone: "",
  creditLimit: null,
  since: SF_TODAY,
  portalUsers: [],
  status: "active",
});

// ── Products ────────────────────────────────────────────────────────────────

/** Products grouped by brand, brands A–Z, products by name. */
export function byBrand(products: Product[]) {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const b = p.brand.trim() || "No brand";
    map.set(b, [...(map.get(b) ?? []), p]);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([brand, items]) => ({ brand, items: [...items].sort((x, y) => x.name.localeCompare(y.name)) }));
}

/** A brand keeps one colour: an existing brand's tone, else the next one. */
export function toneForBrand(brand: string, products: Product[]) {
  const same = products.find((p) => p.brand.trim().toLowerCase() === brand.trim().toLowerCase());
  if (same) return same.tone;
  const brands = new Set(products.map((p) => p.brand.trim().toLowerCase()));
  return (brands.size % 8) + 1;
}
