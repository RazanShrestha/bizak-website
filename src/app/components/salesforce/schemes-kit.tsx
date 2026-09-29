import * as React from "react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { createStore, useStore } from "../sales/store";
import { ActivityList } from "../sales/record";
import { NoteFoot } from "../sales/parts";
import type { Comment, HistoryEvent } from "../sales/orders";
import { CUSTOMER_TYPES, PRODUCTS, SF_NOW, SF_TODAY, TERRITORIES } from "./data";
import type { Customer, Scheme, SchemeMechanic, SchemeStatus } from "./data";
import { day, npr, productById } from "./engine";
import type { CartLine } from "./engine";

// ════════════════════════════════════════════════════════════════════════════
// SCHEMES · CLAIMS — shared words and the record foot
//
// A scheme is read as ONE plain sentence everywhere (list row, panel, builder,
// claim check), so the sentence is written once, here. History + Notes is the
// repo-wide record rule, drawn with the sales desk's own ActivityList/NoteFoot.
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
export const mechanicLabel = (k: MechanicKind) => MECHANICS.find((m) => m.kind === k)!.label;

export const APPLIES_TEXT: Record<Scheme["applies"], string> = {
  order: "Applied on the order by the engine",
  period: "Worked out after the period, settled by credit note",
  claim: "Paid on a claim after photo proof",
  payment: "Given when the invoice is paid",
};

export function defaultMechanic(kind: MechanicKind): SchemeMechanic {
  switch (kind) {
    case "free-goods":
      return { kind, buyItemIds: ["P-101"], buyQty: 10, getItemId: "same", getQty: 1 };
    case "slab":
      return { kind, itemIds: ["P-111", "P-112", "P-113"], slabs: [{ minQty: 50, pct: 3 }, { minQty: 100, pct: 5 }] };
    case "combo":
      return { kind, needs: [{ itemIds: ["P-101"], qty: 5 }, { itemIds: ["P-111"], qty: 5 }], getItemId: "P-132", getQty: 1 };
    case "invoice-value":
      return { kind, minValue: 100_000, pct: 2 };
    case "first-order":
      return { kind, pct: 5 };
    case "target-rebate":
      return { kind, target: 3_000_000, pct: 3, period: "Oct – Dec 2026" };
    case "display":
      return { kind, amount: 1_500, per: "month" };
    case "early-payment":
      return { kind, pct: 2, withinDays: 7 };
  }
}

// ── Words ───────────────────────────────────────────────────────────────────

const unitWord = (unit: string, n: number) => (unit === "case" && n !== 1 ? "cases" : unit);

/** "Himal Fresh Mango 1L", "any Crunchy", "Chau Chau Chicken 70g or Chau Chau Veg 70g", "3 products". */
export function itemsText(ids: string[]): string {
  if (!ids.length) return "no product yet";
  const set = new Set(ids);
  const same = (list: string[]) => list.length === set.size && list.every((id) => set.has(id));
  const brands = [...new Set(PRODUCTS.map((p) => p.brand))];
  for (const b of brands) if (same(PRODUCTS.filter((p) => p.brand === b).map((p) => p.id))) return `any ${b}`;
  const cats = [...new Set(PRODUCTS.map((p) => p.category))];
  for (const c of cats) if (same(PRODUCTS.filter((p) => p.category === c).map((p) => p.id))) return `any ${c.toLowerCase()}`;
  if (ids.length <= 2) return ids.map((id) => productById(id).name).join(" or ");
  const ps = ids.map(productById);
  const oneBrand = ps.every((p) => p.brand === ps[0].brand);
  return oneBrand ? `${ids.length} ${ps[0].brand} products` : `${ids.length} products`;
}

const unitOf = (ids: string[]) => (ids.length ? productById(ids[0]).unit : "unit");

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
      const p = productById(m.getItemId);
      return `Buy ${needs}, get ${m.getQty} ${unitWord(p.unit, m.getQty)} of ${p.name} free`;
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

const typeName = (id: string) => CUSTOMER_TYPES.find((t) => t.id === id)?.plural ?? id;
export const territoryName = (id: string) => TERRITORIES.find((t) => t.id === id)?.name ?? id;

/** Who it's for, short: "Retailers, wholesalers · tier A · Pokhara". */
export function audienceText(s: Pick<Scheme, "typeIds" | "tiers" | "territoryIds">): string {
  const parts: string[] = [];
  const types = s.typeIds.map(typeName);
  parts.push(!types.length ? "Every customer" : types.length > 2 ? `${types.slice(0, 2).join(", ")} +${types.length - 2}` : types.join(", "));
  if (s.tiers.length) parts.push(`tier ${s.tiers.join("/")}`);
  if (s.territoryIds.length) parts.push(s.territoryIds.length > 2 ? `${s.territoryIds.length} territories` : s.territoryIds.map(territoryName).join(", "));
  return parts.join(" · ");
}

/** Is the customer inside one of the scheme's territories (or any of their parents)? The engine does not check this yet. */
export function inTerritory(s: Pick<Scheme, "territoryIds">, c: Customer | undefined): boolean {
  if (!s.territoryIds.length || !c) return true;
  let t: string | null = c.territoryId;
  while (t) {
    if (s.territoryIds.includes(t)) return true;
    t = TERRITORIES.find((x) => x.id === t)?.parentId ?? null;
  }
  return false;
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
export const schemeExtrasStore = createStore<Record<string, { maxPerCustomer: number | null }>>({});

// ── History + Notes ─────────────────────────────────────────────────────────
// The sales desk's own timeline and note line (ActivityList, NoteFoot); only the
// rows live here, keyed by subject: `scheme:SCH-021`, `claim:CL-551`. "who" is a
// PEOPLE id — ActivityList names people by it.

export const ME_ID = "EMP-101";
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** ActivityList sorts on "Sep 4, 14:10" — every stamp keeps that shape. */
export function stamp(iso: string, time = "09:00") {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${MON[m - 1]} ${d}, ${time}`;
}
export const nowStamp = () => stamp(SF_TODAY, SF_NOW);
export const addDaysIso = (iso: string, n: number) => {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};

type Note = Comment & { subject: string };
type Change = HistoryEvent & { subject: string };
export const growthNotesStore = createStore<Note[]>([
  { id: "gn-1", subject: "scheme:SCH-021", authorId: "EMP-118", when: "Sep 2, 11:30", body: "Budget is in cases, not value. Top-up only after the Dashain review." },
  { id: "gn-2", subject: "claim:CL-551", authorId: "EMP-101", when: "Sep 3, 09:15", body: "Asked Ramesh for the retailer-wise list — 42 looks high for Butwal." },
]);
export const growthChangesStore = createStore<Change[]>([]);

let seq = 1;
export function logEvent(subject: string, what: string) {
  growthChangesStore.set((cs) => [...cs, { id: `gc-${seq++}`, subject, whoId: ME_ID, when: nowStamp(), what }]);
}

/** History (seeded from the record, then every change made here) and notes, interleaved. Sits in a SidePanel body. */
export function RecordActivity({ subject, seed }: { subject: string; seed: HistoryEvent[] }) {
  const notes = useStore(growthNotesStore);
  const changes = useStore(growthChangesStore);
  return (
    <div className="-mx-6 mt-8 border-t border-bz-line-soft px-1">
      <ActivityList comments={notes.filter((n) => n.subject === subject)} history={[...seed, ...changes.filter((c) => c.subject === subject)]} />
    </div>
  );
}

/** The note line — a SidePanel `foot`. */
export function RecordNoteFoot({ subject }: { subject: string }) {
  return (
    <div className="-mx-6 -my-3 [&>div]:border-t-0">
      <NoteFoot onSend={(n) => growthNotesStore.set((ns) => [...ns, { id: `gn-${Date.now().toString(36)}-${seq++}`, subject, authorId: ME_ID, when: nowStamp(), body: n.body, title: n.title, direction: n.direction }])} />
    </div>
  );
}

/** A section inside a panel: 13px title, content, space — no box. */
export function PanelSection({ title, count, children, action }: { title: string; count?: number; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-bz-line-soft pt-5">
      <div className="mb-3 flex items-baseline gap-2">
        <h3 className="m-0 text-[13px] font-semibold text-bz-text">{title}</h3>
        {count !== undefined && <span className={cn("text-[11.5px] text-bz-text-soft", NUM)}>{count}</span>}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}
