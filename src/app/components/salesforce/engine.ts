import { CUSTOMER_TYPES, PRODUCTS, SF_TODAY, TERRITORIES } from "./data";
import { customersStore, typesStore } from "./store";
import type { Customer, Product, Scheme } from "./data";

// ════════════════════════════════════════════════════════════════════════════
// THE ONE ENGINE — price, schemes and credit for every channel
//
// The rep app, the dealer portal, the orders hub and the scheme simulator all
// call `evaluate`, so an order is priced the same way wherever it starts
// (research/B §8.2, research/C §8 "one server-side evaluator"). In the app this
// is `POST api/sales-engine/evaluate`; the document stores the result as a
// snapshot and never recomputes it.
// ════════════════════════════════════════════════════════════════════════════

/** `price` overrides the resolved price — a quotation the customer accepted. */
export type CartLine = { productId: string; qty: number; price?: number };
export type PricedLine = { product: Product; qty: number; price: number; gross: number; discount: number; net: number; free: boolean; schemeId: string | null };
export type Applied = { schemeId: string; name: string; benefit: number; text: string };
export type Skipped = { schemeId: string; name: string; reason: string };
export type Hint = { schemeId: string; name: string; text: string; progress: number };
export type Evaluation = {
  lines: PricedLine[];
  applied: Applied[];
  skipped: Skipped[];
  hints: Hint[];
  gross: number;
  discount: number;
  freeValue: number;
  tax: number;
  total: number;
  credit: { limit: number; outstanding: number; overdue: number; available: number; after: number; ok: boolean; stop: "hard" | "soft" };
};

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;
// Read the live stores, not the seed: a type or customer edited in Setup must reach every price and credit check.
export const customerById = (id: string | null | undefined) => customersStore.get().find((c) => c.id === id);
export const typeOf = (c: Customer | undefined) => typesStore.get().find((t) => t.id === c?.typeId) ?? CUSTOMER_TYPES[CUSTOMER_TYPES.length - 1];

/** The customer's price: list price less its type's % (server-side price resolver — blueprint §6). */
export const priceFor = (p: Product, c: Customer | undefined) => Math.round(p.listPrice * (1 - (typeOf(c)?.priceOff ?? 0) / 100));

/** A scheme for a region reaches every area and territory under it. */
function inTerritories(territoryId: string, roots: string[]) {
  for (let t: string | null = territoryId; t; t = TERRITORIES.find((x) => x.id === t)?.parentId ?? null) if (roots.includes(t)) return true;
  return false;
}

export function eligible(s: Scheme, c: Customer | undefined, date = SF_TODAY): string | null {
  if (!c) return "No customer";
  if (s.status !== "live" && s.status !== "scheduled") return s.status === "draft" ? "Still a draft" : s.status === "paused" ? "Paused" : "Ended";
  if (date < s.from) return `Starts ${s.from}`;
  if (date > s.to) return "Ended";
  if (s.typeIds.length && !s.typeIds.includes(c.typeId)) return `Not for ${typeOf(c).plural.toLowerCase()}`;
  if (s.tiers.length && !s.tiers.includes(c.tier)) return `Tier ${s.tiers.join("/")} only`;
  if (s.territoryIds.length && !inTerritories(c.territoryId, s.territoryIds)) return "Not in its territories";
  if (s.budget && s.budget.used >= s.budget.total) return "Budget used up";
  return null;
}

const TAX = 0.13;

export function evaluate(customerId: string, cart: CartLine[], schemes: Scheme[], opts: { date?: string; firstOrder?: boolean } = {}): Evaluation {
  const c = customerById(customerId);
  const date = opts.date ?? SF_TODAY;
  const lines: PricedLine[] = cart
    .filter((l) => l.qty > 0)
    .map((l) => {
      const product = productById(l.productId);
      const price = l.price ?? priceFor(product, c);
      return { product, qty: l.qty, price, gross: price * l.qty, discount: 0, net: price * l.qty, free: false, schemeId: null };
    });
  const applied: Applied[] = [];
  const skipped: Skipped[] = [];
  const hints: Hint[] = [];
  const qtyOf = (ids: string[]) => lines.filter((l) => !l.free && ids.includes(l.product.id)).reduce((s, l) => s + l.qty, 0);
  let exclusiveTaken = false;

  const ordered = [...schemes].filter((s) => s.applies === "order").sort((a, b) => a.priority - b.priority);
  for (const s of ordered) {
    const why = eligible(s, c, date);
    if (why) {
      if (s.status === "live" || s.status === "scheduled") skipped.push({ schemeId: s.id, name: s.name, reason: why });
      continue;
    }
    if (exclusiveTaken) {
      skipped.push({ schemeId: s.id, name: s.name, reason: "Another exclusive scheme applied" });
      continue;
    }
    const m = s.mechanic;
    if (m.kind === "free-goods") {
      const q = qtyOf(m.buyItemIds);
      const times = Math.floor(q / m.buyQty);
      if (times > 0) {
        const getId = m.getItemId === "same" ? lines.find((l) => m.buyItemIds.includes(l.product.id))!.product.id : m.getItemId;
        const p = productById(getId);
        const qty = times * m.getQty;
        lines.push({ product: p, qty, price: priceFor(p, c), gross: 0, discount: 0, net: 0, free: true, schemeId: s.id });
        applied.push({ schemeId: s.id, name: s.name, benefit: qty * priceFor(p, c), text: `${qty} ${p.unit} ${p.name} free` });
      }
      const next = (times + 1) * m.buyQty - q;
      if (q > 0 && next > 0 && next <= Math.max(3, m.buyQty / 2)) hints.push({ schemeId: s.id, name: s.name, text: `Add ${next} more to get ${m.getQty} more free`, progress: (q % m.buyQty) / m.buyQty });
      if (q === 0) skipped.push({ schemeId: s.id, name: s.name, reason: `Buy ${m.buyQty} to qualify` });
    } else if (m.kind === "slab") {
      const q = qtyOf(m.itemIds);
      const slab = [...m.slabs].reverse().find((x) => q >= x.minQty);
      const nextSlab = m.slabs.find((x) => q < x.minQty);
      if (slab) {
        let benefit = 0;
        lines.filter((l) => !l.free && m.itemIds.includes(l.product.id)).forEach((l) => {
          const d = Math.round((l.gross * slab.pct) / 100);
          l.discount += d;
          l.net -= d;
          benefit += d;
        });
        applied.push({ schemeId: s.id, name: s.name, benefit, text: `${slab.pct}% off on ${q} units` });
      } else if (q === 0) skipped.push({ schemeId: s.id, name: s.name, reason: `Buy ${m.slabs[0].minQty} to qualify` });
      if (nextSlab && q > 0) hints.push({ schemeId: s.id, name: s.name, text: `Add ${nextSlab.minQty - q} more for ${nextSlab.pct}% off`, progress: q / nextSlab.minQty });
    } else if (m.kind === "combo") {
      const times = Math.min(...m.needs.map((n) => Math.floor(qtyOf(n.itemIds) / n.qty)));
      if (times > 0) {
        const p = productById(m.getItemId);
        lines.push({ product: p, qty: times * m.getQty, price: priceFor(p, c), gross: 0, discount: 0, net: 0, free: true, schemeId: s.id });
        applied.push({ schemeId: s.id, name: s.name, benefit: times * m.getQty * priceFor(p, c), text: `${times * m.getQty} ${p.unit} ${p.name} free` });
      } else {
        const short = m.needs.map((n) => Math.max(0, n.qty - qtyOf(n.itemIds)));
        if (short.some((x) => x < m.needs[0].qty)) hints.push({ schemeId: s.id, name: s.name, text: `Add ${short.filter(Boolean).join(" + ")} more to unlock the combo`, progress: 1 - short.reduce((a, b) => a + b, 0) / m.needs.reduce((a, n) => a + n.qty, 0) });
        else skipped.push({ schemeId: s.id, name: s.name, reason: "Needs both items" });
      }
    } else if (m.kind === "invoice-value" || m.kind === "first-order") {
      if (m.kind === "first-order" && !opts.firstOrder) {
        skipped.push({ schemeId: s.id, name: s.name, reason: "Only on a first order" });
        continue;
      }
      const base = lines.filter((l) => !l.free).reduce((sum, l) => sum + l.net, 0);
      const min = m.kind === "invoice-value" ? m.minValue : 0;
      if (base >= min && base > 0) {
        let benefit = 0;
        lines.filter((l) => !l.free).forEach((l) => {
          const d = Math.round((l.net * m.pct) / 100);
          l.discount += d;
          l.net -= d;
          benefit += d;
        });
        applied.push({ schemeId: s.id, name: s.name, benefit, text: `${m.pct}% off the order` });
      } else if (m.kind === "invoice-value" && base > 0) {
        hints.push({ schemeId: s.id, name: s.name, text: `Add NPR ${Math.round(m.minValue - base).toLocaleString("en-US")} more for ${m.pct}% off`, progress: base / m.minValue });
      }
    }
    if (s.exclusive && applied.some((a) => a.schemeId === s.id)) exclusiveTaken = true;
  }

  const gross = lines.filter((l) => !l.free).reduce((s, l) => s + l.gross, 0);
  const discount = lines.reduce((s, l) => s + l.discount, 0);
  const freeValue = lines.filter((l) => l.free).reduce((s, l) => s + l.qty * l.price, 0);
  const taxable = gross - discount;
  const tax = Math.round(taxable * TAX);
  const total = taxable + tax;
  const t = typeOf(c);
  const limit = c?.creditLimit ?? 0;
  const outstanding = c?.outstanding ?? 0;
  const available = Math.max(0, limit - outstanding);
  const after = available - total;
  return { lines, applied, skipped, hints, gross, discount, freeValue, tax, total, credit: { limit, outstanding, overdue: c?.overdue ?? 0, available, after, ok: after >= 0 && !(c?.overdue ?? 0), stop: t?.creditStop ?? "soft" } };
}

// ── Formatting ──────────────────────────────────────────────────────────────

export const npr = (n: number) => Math.round(n).toLocaleString("en-US");
export function compact(n: number) {
  if (Math.abs(n) >= 100_000) return `${(n / 100_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}L`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(Math.round(n));
}
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function day(iso: string) {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MON[m - 1]}`;
}
export function dayTime(s: string) {
  const d = s.slice(0, 10);
  const t = s.slice(11, 16);
  return `${d === SF_TODAY ? "Today" : day(d)}${t ? `, ${t}` : ""}`;
}
export const daysUntil = (iso: string) => Math.round((Date.parse(iso) - Date.parse(SF_TODAY)) / 86_400_000);
