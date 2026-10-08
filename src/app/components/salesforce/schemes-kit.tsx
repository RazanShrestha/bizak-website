import * as React from "react";
import { Block } from "../sales/record";
import { SF_TODAY } from "./data";
import type { Scheme, SchemeMechanic, SchemeStatus } from "./data";
import { day, npr, productById } from "./engine";
import type { CartLine } from "./engine";
import { persistentStore } from "./persist";
import { productsStore, typesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// SCHEMES · CLAIMS — shared words
//
// A scheme is read as ONE plain sentence everywhere (list row, panel, builder,
// claim check), so the sentence is written once, here. Every name comes from
// the live stores — a product or type the user created, renamed or deleted
// shows as it is now.
// ════════════════════════════════════════════════════════════════════════════

export type MechanicKind = SchemeMechanic["kind"];

export const MECHANICS: { kind: MechanicKind; label: string; example: string; applies: Scheme["applies"] }[] = [
  { kind: "free-goods", label: "Free goods", example: "Buy 10 cases, get 1 free", applies: "order" },
  { kind: "slab", label: "Quantity slab", example: "3% at 50, 5% at 100, 7% at 200", applies: "order" },
  { kind: "combo", label: "Combo", example: "Buy juice and biscuits, get tea free", applies: "order" },
  { kind: "invoice-value", label: "Order value", example: "2% off orders over 1 lakh", applies: "order" },
  { kind: "first-order", label: "First order", example: "5% off a new customer's first order", applies: "order" },
  { kind: "target-rebate", label: "Target rebate", example: "3% back on reaching the quarter's target", applies: "period" },
  { kind: "display", label: "Display", example: "NPR 1,500 a month for a chiller display", applies: "claim" },
  { kind: "early-payment", label: "Early payment", example: "2% off when paid within 7 days", applies: "payment" },
];
export const mechanicLabel = (k: MechanicKind) => MECHANICS.find((m) => m.kind === k)?.label ?? k;

export const APPLIES_TEXT: Record<Scheme["applies"], string> = {
  order: "Applied on the order by the engine",
  period: "Worked out after the period, settled by credit note",
  claim: "Paid on a claim after photo proof",
  payment: "Given when the invoice is paid",
};

/** A fresh rule of this kind, filled with the tenant's own first products (none yet = empty, the builder asks). */
export function defaultMechanic(kind: MechanicKind): SchemeMechanic {
  const ids = productsStore.get().map((p) => p.id);
  const first = ids.slice(0, 1);
  switch (kind) {
    case "free-goods":
      return { kind, buyItemIds: first, buyQty: 10, getItemId: "same", getQty: 1 };
    case "slab":
      return { kind, itemIds: first, slabs: [{ minQty: 50, pct: 3 }, { minQty: 100, pct: 5 }] };
    case "combo":
      return { kind, needs: [{ itemIds: first, qty: 5 }, { itemIds: ids.slice(1, 2), qty: 5 }], getItemId: ids[2] ?? ids[0] ?? "", getQty: 1 };
    case "invoice-value":
      return { kind, minValue: 100_000, pct: 2 };
    case "first-order":
      return { kind, pct: 5 };
    case "target-rebate":
      return { kind, target: 3_000_000, pct: 3, period: "This quarter" };
    case "display":
      return { kind, amount: 1_500, per: "month" };
    case "early-payment":
      return { kind, pct: 2, withinDays: 7 };
  }
}

// ── Words ───────────────────────────────────────────────────────────────────

const unitWord = (unit: string, n: number) => (!unit ? (n === 1 ? "unit" : "units") : unit === "case" && n !== 1 ? "cases" : unit);

/** "Himal Fresh Mango 1L", "any Crunchy", "Chau Chau Chicken 70g or Chau Chau Veg 70g", "3 products". */
export function itemsText(ids: string[]): string {
  if (!ids.length) return "no product yet";
  const products = productsStore.get();
  const set = new Set(ids);
  const same = (list: string[]) => list.length > 1 && list.length === set.size && list.every((id) => set.has(id));
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  for (const b of brands) if (same(products.filter((p) => p.brand === b).map((p) => p.id))) return `any ${b}`;
  const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
  for (const c of cats) if (same(products.filter((p) => p.category === c).map((p) => p.id))) return `any ${c.toLowerCase()}`;
  if (ids.length <= 2) return ids.map((id) => productById(id).name).join(" or ");
  const ps = ids.map(productById);
  const oneBrand = !!ps[0].brand && ps.every((p) => p.brand === ps[0].brand);
  return oneBrand ? `${ids.length} ${ps[0].brand} products` : `${ids.length} products`;
}

const unitOf = (ids: string[]) => (ids.length ? productById(ids[0]).unit : "");

/** The scheme as one sentence a shop owner would understand. */
export function ruleText(m: SchemeMechanic): string {
  switch (m.kind) {
    case "free-goods": {
      const u = unitOf(m.buyItemIds);
      const get = m.getItemId === "same" ? "free" : `${unitWord(productById(m.getItemId).unit, m.getQty)} of ${productById(m.getItemId).name} free`;
      return `Buy ${m.buyQty} ${unitWord(u, m.buyQty)} of ${itemsText(m.buyItemIds)}, get ${m.getQty} ${get}`;
    }
    case "slab": {
      const s = [...m.slabs].sort((a, b) => a.minQty - b.minQty);
      if (!s.length) return `A slab on ${itemsText(m.itemIds)}`;
      return `${s.map((x, i) => (i === 0 ? `${x.pct}% off from ${x.minQty}` : `${x.pct}% from ${x.minQty}`)).join(", ")} ${unitWord(unitOf(m.itemIds), 2)} of ${itemsText(m.itemIds)}`;
    }
    case "combo": {
      const needs = m.needs.map((n) => `${n.qty} of ${itemsText(n.itemIds)}`).join(" and ");
      const p = m.getItemId ? productById(m.getItemId) : null;
      return `Buy ${needs}, get ${m.getQty} ${p ? `${unitWord(p.unit, m.getQty)} of ${p.name}` : "of a product"} free`;
    }
    case "invoice-value":
      return `${m.pct}% off any order over NPR ${npr(m.minValue)}`;
    case "first-order":
      return `${m.pct}% off a customer's first order`;
    case "target-rebate":
      return `${m.pct}% back when purchases reach NPR ${npr(m.target)} in ${m.period}`;
    case "display":
      return `NPR ${npr(m.amount)} a ${m.per} for keeping the display up, paid on photo proof`;
    case "early-payment":
      return `${m.pct}% off when the invoice is paid within ${m.withinDays} days`;
  }
}

export const typeName = (id: string) => typesStore.get().find((t) => t.id === id)?.plural ?? "Deleted type";

/** Who it's for, short: "Retailers, wholesalers · tier A". */
export function audienceText(s: Pick<Scheme, "typeIds" | "tiers">): string {
  const parts: string[] = [];
  const types = s.typeIds.map(typeName);
  parts.push(!types.length ? "Every customer" : types.length > 2 ? `${types.slice(0, 2).join(", ")} +${types.length - 2}` : types.join(", "));
  if (s.tiers.length) parts.push(`tier ${s.tiers.join("/")}`);
  return parts.join(" · ");
}

/** The smallest cart that earns the scheme once — the simulator's starting cart and the claim check's "one qualifying order". */
export function qualifyingCart(m: SchemeMechanic): CartLine[] {
  switch (m.kind) {
    case "free-goods":
      return m.buyItemIds.length ? [{ productId: m.buyItemIds[0], qty: m.buyQty }] : [];
    case "slab": {
      const first = [...m.slabs].sort((a, b) => a.minQty - b.minQty)[0];
      return m.itemIds.length && first ? [{ productId: m.itemIds[0], qty: first.minQty }] : [];
    }
    case "combo":
      return m.needs.filter((n) => n.itemIds.length).map((n) => ({ productId: n.itemIds[0], qty: n.qty }));
    default:
      return [];
  }
}

export const STATUS: Record<SchemeStatus, { label: string; tone: "good" | "warn" | "neutral" | "info" | "off" }> = {
  live: { label: "Live", tone: "good" },
  scheduled: { label: "Scheduled", tone: "info" },
  draft: { label: "Draft", tone: "neutral" },
  paused: { label: "Paused", tone: "warn" },
  ended: { label: "Ended", tone: "off" },
};

export const periodText = (from: string, to: string) => {
  const yr = (iso: string) => (iso.slice(0, 4) !== SF_TODAY.slice(0, 4) ? ` ${iso.slice(0, 4)}` : "");
  return `${day(from)}${yr(from)} – ${day(to)}${yr(to)}`;
};

/** Extras the Scheme type has no field for yet (see the report's proposed diff). */
export const schemeExtrasStore = persistentStore<Record<string, { maxPerCustomer: number | null }>>("growth.schemeExtras", {});

export const addDaysIso = (iso: string, n: number) => {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};

/** A band inside a record panel — the bzw `Block` under the name the claims panel already imports. */
export function PanelSection({ title, count, children, action }: { title: string; count?: number; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Block title={title} count={count} right={action}>
      {children}
    </Block>
  );
}
