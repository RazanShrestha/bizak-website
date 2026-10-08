import { SF_TODAY } from "./data";
// Also a side effect: Sales force customers, products and sales orders reach the sales desk (every page loads the engine).
import { deskItemById } from "./bridge";
import { ordersStore } from "../sales/store";
import { customersStore, hubStore, ledgerStore, productsStore, typesStore } from "./store";
import type { Customer, CustomerType, LedgerEntry, Product, Scheme } from "./data";

// ════════════════════════════════════════════════════════════════════════════
// THE ONE ENGINE — price, schemes and credit for every channel
//
// The rep app, the dealer portal, the orders hub and the scheme simulator all
// call `evaluate`, so an order is priced the same way wherever it starts
// (research/B §8.2, research/C §8 "one server-side evaluator"). In the app this
// is `POST api/sales-engine/evaluate`; the document stores the result as a
// snapshot and never recomputes it.
// ════════════════════════════════════════════════════════════════════════════

/**
 * `price` overrides the resolved price. `fixed` = a line agreed on an accepted estimate: its price is final, so no
 * scheme touches or counts it (a fixed line at price 0 is negotiated free goods). A productId of "CHG:<label>" is a
 * charge agreed on the estimate (freight, loading…), not a product.
 */
export type CartLine = { productId: string; qty: number; price?: number; fixed?: boolean };
export type PricedLine = { product: Product; qty: number; price: number; gross: number; discount: number; net: number; free: boolean; schemeId: string | null; fixed: boolean };
export const CHARGE_PREFIX = "CHG:";
export const isCharge = (productId: string) => productId.startsWith(CHARGE_PREFIX);
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
  /**
   * limit null = no credit check; 0 = cash only (owner decision #2). `blocking` is the overdue past the type's grace
   * days — that, or going over the limit, fails the check. `stop` says what a failed check does: hard = blocked until
   * someone with the permission overrides it with a reason, soft = a warning (decisions #1, #3).
   */
  credit: { limit: number | null; outstanding: number; overdue: number; blocking: number; available: number | null; after: number | null; ok: boolean; reason: string | null; stop: "hard" | "soft" };
};

// Everything reads the live stores: a type or product edited in Setup must reach every price and credit check.
/**
 * A line whose product was deleted still renders (and prices at 0) instead of crashing a page. An item sold on the
 * sales order form that is not in the Sales force catalogue is still a real item: it keeps its own name and code.
 */
function strayProduct(id: string): Product {
  const item = deskItemById(id);
  return item
    ? { id, code: item.code, name: item.name, brand: "", category: "", unit: item.unit, pack: "", listPrice: item.rate, cost: item.cost, tone: 8 }
    : { id, code: id, name: "Deleted product", brand: "", category: "", unit: "", pack: "", listPrice: 0, cost: 0, tone: 8 };
}
export const productById = (id: string): Product =>
  isCharge(id)
    ? { id, code: "", name: id.slice(CHARGE_PREFIX.length) || "Charge", brand: "", category: "Charge", unit: "", pack: "", listPrice: 0, cost: 0, tone: 8 }
    : (productsStore.get().find((p) => p.id === id) ?? strayProduct(id));
export const customerById = (id: string | null | undefined) => customersStore.get().find((c) => c.id === id);
/** A customer with no (or a deleted) type gets list price, no portal and no credit terms. */
export const NO_TYPE: CustomerType = { id: "", name: "No type", plural: "No type", level: "direct", priceOff: 0, creditDays: 0, creditStop: "soft", graceDays: 7, portal: "none", ownCustomers: false, playbookId: null, visitsPer4w: 0, color: 8, blurb: "" };
export const typeOf = (c: Customer | undefined): CustomerType => typesStore.get().find((t) => t.id === c?.typeId) ?? NO_TYPE;

/** The customer's price: list price less its type's % (server-side price resolver — blueprint §6). */
export const priceFor = (p: Product, c: Customer | undefined) => Math.round(p.listPrice * (1 - (typeOf(c)?.priceOff ?? 0) / 100));

export function eligible(s: Scheme, c: Customer | undefined, date = SF_TODAY): string | null {
  if (!c) return "No customer";
  if (s.status !== "live" && s.status !== "scheduled") return s.status === "draft" ? "Still a draft" : s.status === "paused" ? "Paused" : "Ended";
  if (date < s.from) return `Starts ${s.from}`;
  if (date > s.to) return "Ended";
  if (s.typeIds.length && !s.typeIds.includes(c.typeId)) return `Not for ${typeOf(c).plural.toLowerCase()}`;
  if (s.tiers.length && !s.tiers.includes(c.tier)) return `Tier ${s.tiers.join("/")} only`;
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
      const fixed = !!l.fixed;
      // Negotiated free goods: shown at the customer's price, charged nothing.
      if (fixed && l.price === 0 && !isCharge(l.productId)) return { product, qty: l.qty, price: priceFor(product, c), gross: 0, discount: 0, net: 0, free: true, schemeId: null, fixed };
      const price = l.price ?? priceFor(product, c);
      return { product, qty: l.qty, price, gross: price * l.qty, discount: 0, net: price * l.qty, free: false, schemeId: null, fixed };
    });
  const applied: Applied[] = [];
  const skipped: Skipped[] = [];
  const hints: Hint[] = [];
  // Schemes only see lines that are neither free nor fixed by an estimate.
  const qtyOf = (ids: string[]) => lines.filter((l) => !l.free && !l.fixed && ids.includes(l.product.id)).reduce((s, l) => s + l.qty, 0);
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
        lines.push({ product: p, qty, price: priceFor(p, c), gross: 0, discount: 0, net: 0, free: true, schemeId: s.id, fixed: false });
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
        lines.filter((l) => !l.free && !l.fixed && m.itemIds.includes(l.product.id)).forEach((l) => {
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
        lines.push({ product: p, qty: times * m.getQty, price: priceFor(p, c), gross: 0, discount: 0, net: 0, free: true, schemeId: s.id, fixed: false });
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
      const base = lines.filter((l) => !l.free && !l.fixed).reduce((sum, l) => sum + l.net, 0);
      const min = m.kind === "invoice-value" ? m.minValue : 0;
      if (base >= min && base > 0) {
        let benefit = 0;
        lines.filter((l) => !l.free && !l.fixed).forEach((l) => {
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
  return { lines, applied, skipped, hints, gross, discount, freeValue, tax, total, credit: creditCheck(c, total, date) };
}

// ── Money: what a customer owes, counted from the ledger ────────────────────

export type OpenInvoice = { doc: string; date: string; due: string | null; amount: number; open: number; /** Days past due (negative = not due yet). */ late: number };
/** One invoice line of a receipt: what it asked to settle, and what it did. */
export type LineUse = { doc: string; amount: number; applied: number };
/**
 * Money of a receipt tagged to a sales order. `open` = not applied to that order's invoices yet (still advance).
 * `dead` = the order was rejected or cancelled: the tag has to be changed.
 */
export type TagUse = { doc: string; amount: number; open: number; dead: boolean };
/** A receipt (or credit note) that says what it is for. `free` = advance with no order tag: any invoice may take it. */
export type CreditUse = { id: string; doc: string; lines: LineUse[]; tags: TagUse[]; free: number };
export type Account = {
  outstanding: number;
  overdue: number;
  blocking: number;
  pending: number;
  invoices: OpenInvoice[];
  /** Advance tagged to sales orders and not applied yet, per order. */
  tagged: { doc: string; amount: number; dead: boolean }[];
  /** Advance with no order tag. */
  onAccount: number;
  uses: CreditUse[];
};

const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/** The prototype bills an order under the order's own number, so an invoice is "of" the order whose number it carries. */
export const invoiceOf = (invoiceDoc: string, orderNo: string) => invoiceDoc === orderNo;

/** A sales order money can no longer be for: rejected here, or cancelled or closed on the sales desk. */
export function orderDead(customerId: string, orderNo: string) {
  const h = hubStore.get().find((x) => x.id === orderNo && x.customerId === customerId);
  if (!h || h.status === "rejected") return true;
  const so = ordersStore.get().find((o) => o.no === orderNo && o.customerId === customerId);
  return !!so && (!!so.cancelled || so.closed);
}

/**
 * Outstanding = confirmed debits − confirmed credits. Pending receipts count for nothing until accounts confirm them.
 *
 * A receipt is only ever applied to invoices (owner decision #33), and which invoice is still open — so what is
 * overdue — follows from that:
 *   • a credit that names its lines settles exactly those invoices. The rest of it is ADVANCE: it lowers what the
 *     customer owes in total and settles no invoice until someone applies it. Part of the advance may be tagged to
 *     sales orders (a reference: "this much is for that order"); only that order's invoices may take a tagged amount,
 *     and the untagged rest is free for any invoice;
 *   • a credit with no lines (from before lines existed, or a credit note) settles the oldest invoice first.
 */
export function accountOf(customerId: string, ledger: LedgerEntry[] = ledgerStore.get(), date = SF_TODAY): Account {
  const rows = ledger.filter((r) => r.customerId === customerId);
  const confirmed = rows.filter((r) => !r.pending);
  const grace = typeOf(customerById(customerId)).graceDays;
  const debits = confirmed
    .filter((r) => r.debit > 0)
    .sort((a, b) => (a.due ?? a.date).localeCompare(b.due ?? b.date))
    .map((r) => ({ r, open: r.debit }));

  const uses: CreditUse[] = [];
  let pool = 0;
  for (const c of confirmed.filter((r) => r.credit > 0)) {
    if (!c.applied) {
      pool += c.credit;
      continue;
    }
    let left = c.credit;
    const lines: LineUse[] = [];
    for (const line of c.applied) {
      let rest = Math.min(line.amount, left);
      const asked = rest;
      for (const d of debits) {
        if (d.r.doc !== line.doc || rest <= 0) continue;
        const take = Math.min(rest, d.open);
        d.open -= take;
        rest -= take;
      }
      left -= asked - rest;
      lines.push({ doc: line.doc, amount: line.amount, applied: asked - rest });
    }
    const tags: TagUse[] = (c.tags ?? []).map((t) => {
      const used = lines.filter((l) => invoiceOf(l.doc, t.doc)).reduce((sum, l) => sum + l.applied, 0);
      const open = Math.min(Math.max(0, t.amount - used), left);
      left -= open;
      return { doc: t.doc, amount: t.amount, open, dead: false };
    });
    uses.push({ id: c.id, doc: c.doc, lines, tags, free: left });
  }
  for (const d of debits) {
    const take = Math.min(pool, d.open);
    d.open -= take;
    pool -= take;
  }

  // A tag is dead when its order was rejected or cancelled and no invoice of it is left to pay.
  for (const u of uses) for (const t of u.tags) t.dead = t.open > 0 && orderDead(customerId, t.doc) && !debits.some((d) => d.open > 0 && invoiceOf(d.r.doc, t.doc));

  const invoices: OpenInvoice[] = debits.filter((d) => d.open > 0).map(({ r, open }) => ({ doc: r.doc, date: r.date, due: r.due, amount: r.debit, open, late: r.due ? daysBetween(r.due, date) : 0 }));
  const tagged = new Map<string, { amount: number; dead: boolean }>();
  for (const u of uses) for (const t of u.tags) if (t.open > 0) tagged.set(t.doc, { amount: (tagged.get(t.doc)?.amount ?? 0) + t.open, dead: t.dead || !!tagged.get(t.doc)?.dead });
  return {
    outstanding: confirmed.reduce((sum, r) => sum + r.debit - r.credit, 0),
    overdue: invoices.filter((i) => i.late > 0).reduce((sum, i) => sum + i.open, 0),
    blocking: invoices.filter((i) => i.late > grace).reduce((sum, i) => sum + i.open, 0),
    pending: rows.filter((r) => r.pending).reduce((sum, r) => sum + r.credit, 0),
    invoices,
    tagged: [...tagged].map(([doc, t]) => ({ doc, ...t })),
    onAccount: uses.reduce((sum, u) => sum + u.free, 0),
    uses,
  };
}

/** The credit check for an order of `total` (the same rule for every channel). */
export function creditCheck(c: Customer | undefined, total: number, date = SF_TODAY): Evaluation["credit"] {
  const t = typeOf(c);
  const a = c ? accountOf(c.id, ledgerStore.get(), date) : { outstanding: 0, overdue: 0, blocking: 0 };
  const limit = c?.creditLimit ?? null;
  const available = limit === null ? null : Math.max(0, limit - a.outstanding);
  const after = available === null ? null : available - total;
  const reason =
    a.blocking > 0
      ? `NPR ${npr(a.blocking)} overdue for more than ${t.graceDays} days`
      : limit === 0
        ? "Cash only — no credit for this customer"
        : after !== null && after < 0
          ? `Over the credit limit by NPR ${npr(-after)}`
          : null;
  return { limit, outstanding: a.outstanding, overdue: a.overdue, blocking: a.blocking, available, after, ok: reason === null, reason, stop: t.creditStop };
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
