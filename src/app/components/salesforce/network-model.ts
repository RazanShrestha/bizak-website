import { createStore } from "../sales/store";
import { REPS, TERRITORIES } from "./data";
import type { Customer, CustomerType, HubOrder, Level, Playbook, Portal, Scheme, SchemeMechanic, Territory } from "./data";
import { eligible, evaluate, npr } from "./engine";

// ════════════════════════════════════════════════════════════════════════════
// NETWORK · derivations shared by Customers, Territories and Setup
//
// Types are read from `typesStore` (Setup edits them), never from the static
// CUSTOMER_TYPES, so a type renamed or re-priced in Setup reads the same on
// every network page. Two seed gaps are filled here, locally:
//   • the seed links no distributor to the super-stockist, so the trade tree
//     would have an empty top. `supplyStore` supplies that one link until a
//     user changes "served by" (then the customer's own parentId wins);
//   • REPS is a constant, so rep ↔ territory assignments live in `repAreasStore`.
// ════════════════════════════════════════════════════════════════════════════

export const supplyStore = createStore<Record<string, string>>({ "C-5002": "C-5010", "C-5004": "C-5010" });
export const repAreasStore = createStore<Record<string, string[]>>(Object.fromEntries(REPS.map((r) => [r.id, [...r.territoryIds]])));

export const parentOf = (c: Customer, supply: Record<string, string>) => c.parentId ?? supply[c.id] ?? null;
export const childrenOf = (id: string, customers: Customer[], supply: Record<string, string>) => customers.filter((c) => parentOf(c, supply) === id);

/** Every customer under `id`, at any depth (a super-stockist's distributors and their retailers). */
export function descendantsOf(id: string, customers: Customer[], supply: Record<string, string>): Customer[] {
  const out: Customer[] = [];
  const walk = (pid: string, guard: number) => {
    if (guard > 6) return;
    for (const k of childrenOf(pid, customers, supply)) {
      out.push(k);
      walk(k.id, guard + 1);
    }
  };
  walk(id, 0);
  return out;
}

// ── Types ───────────────────────────────────────────────────────────────────

const UNKNOWN: CustomerType = { id: "?", name: "No type", plural: "No type", level: "direct", priceOff: 0, creditDays: 0, creditStop: "soft", portal: "none", ownCustomers: false, playbookId: null, visitsPer4w: 0, color: 8, blurb: "" };
export const typeIn = (types: CustomerType[], id: string | undefined) => types.find((t) => t.id === id) ?? UNKNOWN;

export const LEVEL_LABEL: Record<Level, string> = { primary: "Primary", secondary: "Secondary", direct: "Direct" };
export const LEVEL_HINT: Record<Level, string> = {
  primary: "Buys from you and sells on",
  secondary: "Buys from your distributors",
  direct: "Buys from you for its own use",
};
export const PORTAL_LABEL: Record<Portal, string> = { dealer: "Dealer portal", retailer: "Retailer app", none: "No portal" };

/** "What a <type> gets", as one sentence — the whole policy a type carries. */
export function getsSentence(t: CustomerType, playbooks: Playbook[]) {
  const pb = playbooks.find((p) => p.id === t.playbookId);
  const parts = [
    t.priceOff ? `buys at ${t.priceOff}% off the list price` : "buys at the list price",
    `gets ${t.creditDays} days' credit (over the limit, the order is ${t.creditStop === "hard" ? "blocked" : "sent to review"})`,
    t.portal === "dealer" ? "orders and pays on the dealer portal" : t.portal === "retailer" ? "orders from its distributor on the retailer app" : "has no portal",
  ];
  if (t.ownCustomers) parts.push("reports its sales to its own customers");
  parts.push(t.visitsPer4w ? `is visited ${t.visitsPer4w === 1 ? "once" : `${t.visitsPer4w} times`} every 4 weeks${pb ? ` on the ${pb.name} playbook` : ", with no playbook"}` : "is not visited by reps");
  const last = parts.pop();
  return `A ${t.name.toLowerCase()} ${parts.join(", ")} and ${last}.`;
}

// ── Territories ─────────────────────────────────────────────────────────────

export const terrById = (id: string | null | undefined) => TERRITORIES.find((t) => t.id === id);
export const terrChildren = (id: string | null) => TERRITORIES.filter((t) => t.parentId === id);
/** The territory-level ids at or under a node. */
export function leafTerrIds(id: string): string[] {
  const t = terrById(id);
  if (!t) return [];
  if (t.level === "territory") return [id];
  return terrChildren(id).flatMap((k) => leafTerrIds(k.id));
}
/** The node and its ancestors, root first. */
export function terrPath(id: string) {
  const out: Territory[] = [];
  let t = terrById(id);
  while (t) {
    out.unshift(t);
    t = terrById(t.parentId);
  }
  return out;
}
export const LEAF_TERRITORIES = TERRITORIES.filter((t) => t.level === "territory");

export const repsOn = (terrIds: string[], areas: Record<string, string[]>) => REPS.filter((r) => (areas[r.id] ?? []).some((t) => terrIds.includes(t)));
export const repById = (id: string | null | undefined) => REPS.find((r) => r.id === id);

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

/** The engine's eligibility, plus territory (the engine does not read it yet) and a type check that survives a type made in Setup. */
export function eligibleNow(s: Scheme, c: Customer, date?: string): string | null {
  if (s.typeIds.length && !s.typeIds.includes(c.typeId)) return "Not for this type";
  if (s.territoryIds.length && !terrPath(c.territoryId).some((t) => s.territoryIds.includes(t.id))) return "Not in this territory";
  return eligible(s, c, date);
}

// ── Money ───────────────────────────────────────────────────────────────────

export const MONTH_START = "2026-09-01";
/** This month's hub orders that are not rejected, valued by the one engine. */
export function monthValue(orders: HubOrder[], customerIds: Set<string>, schemes: Scheme[]) {
  return orders
    .filter((o) => o.at >= MONTH_START && o.status !== "rejected" && customerIds.has(o.customerId))
    .reduce((s, o) => s + evaluate(o.customerId, o.lines, schemes).total, 0);
}

export const STATUS_TONE: Record<Customer["status"], "good" | "warn" | "danger"> = { active: "good", onboarding: "warn", "on hold": "danger" };
export const STATUS_LABEL: Record<Customer["status"], string> = { active: "Active", onboarding: "Onboarding", "on hold": "On hold" };
