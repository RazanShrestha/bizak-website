import { estimatesStore, nextNo } from "../sales/flow";
import type { Estimate } from "../sales/flow";
import { CHARGE_ITEM_ID, isChargeLine, latestVersion, linkAcceptedOrder, offerOf } from "../sales/estimate-offer";
import type { ChangeAsk, EstimateChangeRequest, EstimateOffer, EstimateVersion, OfferStatus, OfferTerms } from "../sales/estimate-offer";
import { ME, fmtShort, lineGross, termById, totalsOf } from "../sales/orders";
import type { HistoryEvent, OrderLine } from "../sales/orders";
import { SF_NOW, SF_TODAY } from "./data";
import type { HubOrder, Opportunity } from "./data";
import { CHARGE_PREFIX, customerById, evaluate, npr, productById } from "./engine";
import type { CartLine, Evaluation } from "./engine";
import { approveHubOrder, isFirstOrder, locationFor, placeHubOrder, termForDays } from "./orders-parts";
import { dropSaved, persistentStore, readSaved } from "./persist";
import { STAFF_NAME, logEvent } from "./records";
import { LEGACY_ORDER_IDS, customersStore, historyStore, hubStore, notesStore, opportunitiesStore, productsStore, schemesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// ESTIMATES · KERNEL
//
// The estimate we send a customer IS the sales desk's estimate (sales/flow.tsx
// `Estimate`, EST-…), and sending it, its versions, the customer's change
// requests, accepting and declining are the desk's own rules
// (sales/estimate-offer.ts) — owner decision #32. Sales force adds no estimate
// of its own; the dealer portal answers the desk's.
//
// What Sales force keeps is the opportunity, and what it owes an accepted
// estimate: the sales order. Both FOLLOW the estimate (the watcher below), so
// an estimate sent, answered, accepted, declined or cancelled — on the sales
// desk or on the dealer portal — moves its opportunity and, once accepted,
// becomes the order, exactly once.
//
// This file is the only place that moves an opportunity because of an
// estimate, and the only one that makes the order of an accepted estimate.
// ════════════════════════════════════════════════════════════════════════════

/** The sales desk mockup seeds estimates for its own customers; only a Sales force customer's estimates are ours. */
const ours = (e: Pick<Estimate, "customerId">) => customersStore.get().some((c) => c.id === e.customerId);

export const estimatePath = (no?: string | null) => `/design/sales/estimates${no ? `/${no}` : ""}`;

const seqOf = (no: string) => Number(no.replace(/\D/g, "")) || 0;

/**
 * An opportunity's estimates on the sales desk, newest first (the desk's numbers only go up), cancelled ones last.
 * In practice one, unless a declined one was followed by a fresh start. The desk's own seed names opportunities of a
 * CRM this prototype does not have, so an estimate counts only for the opportunity's own customer.
 */
export function estimatesOf(opportunityId: string, all: Estimate[] = estimatesStore.get()) {
  const customerId = opportunitiesStore.get().find((o) => o.id === opportunityId)?.customerId;
  return all.filter((e) => e.opportunity === opportunityId && e.customerId === customerId).sort((a, b) => Number(!!a.cancelled) - Number(!!b.cancelled) || seqOf(b.no) - seqOf(a.no));
}

/** Still in play: not accepted, declined, closed as lost or cancelled. */
export const estimateOpen = (e: Estimate) => !e.cancelled && !e.closed && offerOf(e).status !== "accepted" && offerOf(e).status !== "declined";
/** The estimate still in play for an opportunity — sent or not yet — if any. */
export const openEstimateOf = (opportunityId: string, all: Estimate[] = estimatesStore.get()) => estimatesOf(opportunityId, all).find(estimateOpen);

/** What a customer was sent. An estimate that was never sent is our own business, and a cancelled one is withdrawn. */
export const sentTo = (customerId: string, all: Estimate[] = estimatesStore.get()) => all.filter((e) => e.customerId === customerId && !e.cancelled && offerOf(e).versions.length > 0);

/** Our customers' estimates the customer asked to change: each waits for a new version. */
export const estimatesToAnswer = (all: Estimate[] = estimatesStore.get()) => all.filter((e) => ours(e) && estimateOpen(e) && offerOf(e).status === "changes-requested");

// ── What a version costs the customer ───────────────────────────────────────

/**
 * A version as engine lines — THE mapping, used for what the dealer reads on the portal and for the order the version
 * becomes: a paid line at its unit price after the line's discount, free goods as a zero-priced line, a charge as a
 * "CHG:" line. With `applyOffers` off the paid lines are `fixed`, so no scheme touches them.
 */
export function versionCart(v: EstimateVersion): CartLine[] {
  return v.lines
    .filter((l) => l.qty > 0)
    .flatMap((l): CartLine[] => {
      if (isChargeLine(l)) return lineGross(l) > 0 ? [{ productId: `${CHARGE_PREFIX}${l.description?.trim() || "Charge"}`, qty: 1, price: lineGross(l), fixed: true }] : [];
      if (l.freeOf || l.rate === 0) return [{ productId: l.itemId, qty: l.qty, price: 0, fixed: true }];
      return [{ productId: l.itemId, qty: l.qty, price: Math.round((lineGross(l) / l.qty) * 100) / 100, fixed: !v.terms.applyOffers }];
    });
}

/** Priced by the one engine, so what a version shows the customer is exactly what the order it becomes will bill. */
export function priceVersion(customerId: string, v: EstimateVersion): Evaluation {
  // The same first-order rule the Orders hub uses, so a first-order offer on the estimate is the one the order gets.
  return evaluate(customerId, versionCart(v), v.terms.applyOffers ? schemesStore.get() : [], { firstOrder: isFirstOrder({ customerId }) });
}

/** What a version comes to for the customer: live offers on top when it says so, otherwise its own total. */
export const versionDue = (customerId: string, v: EstimateVersion) => (v.terms.applyOffers ? priceVersion(customerId, v).total : v.total);

// ── The opportunity and the order follow the estimate ───────────────────────

const stamp = () => `${SF_TODAY} ${SF_NOW}`;
const money = (n: number) => `NPR ${npr(n)}`;

/** The opportunity an estimate answers — ours, for the same customer. */
const opportunityOf = (e: Pick<Estimate, "opportunity" | "customerId">) => (e.opportunity ? opportunitiesStore.get().find((o) => o.id === e.opportunity && o.customerId === e.customerId) : undefined);

/** Writes only a difference, and says whether there was one. */
function moveOpportunity(id: string, patch: Partial<Opportunity>) {
  const o = opportunitiesStore.get().find((x) => x.id === id);
  if (!o || (Object.keys(patch) as (keyof Opportunity)[]).every((k) => o[k] === patch[k])) return false;
  opportunitiesStore.set((os) => os.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  return true;
}

/** Where an estimate stood at the last pass — what is compared, so that only a change is acted on. */
type Seen = { customerId: string; opportunity: string | null; status: OfferStatus; versions: number; requests: number; cancelled: boolean; orderNo: string | null; value: number };

function stateOf(e: Estimate): Seen {
  const o = offerOf(e);
  // Closed as lost on the desk's own menu is given up too, with or without the offer saying so.
  const status: OfferStatus = e.closed && o.status !== "accepted" ? "declined" : o.status;
  return { customerId: e.customerId, opportunity: e.opportunity, status, versions: o.versions.length, requests: o.requests.length, cancelled: !!e.cancelled, orderNo: o.accepted?.orderNo ?? null, value: latestVersion(e)?.total ?? totalsOf(e.lines).total };
}
const NOT_SENT = { status: "not-sent" as OfferStatus, versions: 0, requests: 0, cancelled: false };
const sameState = (a: Seen, b: Seen) => a.status === b.status && a.versions === b.versions && a.requests === b.requests && a.cancelled === b.cancelled && a.orderNo === b.orderNo && a.value === b.value && a.opportunity === b.opportunity;

/** Our estimates on the desk as the last pass saw them, by number. */
let seen = new Map<string, Seen>();

/**
 * The sales order of an accepted version, by Sales force's own order rules: the negotiated lines, charges and terms,
 * the engine's prices and credit check, pending at once (decisions #5 and #31). We already agreed every line and
 * term on the estimate, so within credit the order needs no second look; over credit it waits in Orders like any other.
 */
function orderFor(e: Estimate, v: EstimateVersion, accepted: NonNullable<EstimateOffer["accepted"]>, opp: Opportunity | undefined): HubOrder {
  const ev = priceVersion(e.customerId, v);
  const term = termById(v.termId);
  const payment = v.terms.paymentNote.trim() || term?.name || "";
  const delivery = v.terms.deliveryTerms.trim();
  const order = placeHubOrder({
    customerId: e.customerId,
    source: accepted.via === "portal" ? "portal" : "back-office",
    byName: accepted.byName,
    repId: customerById(e.customerId)?.repId ?? null,
    at: stamp(),
    lines: versionCart(v),
    note: [`From estimate ${e.no} version ${v.no}${opp?.rfqNo ? ` (${opp.rfqNo})` : ""}.`, payment ? `Payment: ${payment}.` : "", delivery || v.terms.deliverBy ? `Delivery: ${[delivery, v.terms.deliverBy ? `by ${v.terms.deliverBy}` : ""].filter(Boolean).join(", ")}.` : ""].filter(Boolean).join(" "),
    status: ev.credit.ok ? "ready" : "review",
    estimateId: e.no,
    estimateVersion: v.no,
    terms: { paymentDays: term?.days ?? 0, payment, delivery, deliverBy: v.terms.deliverBy },
  });
  logEvent(order.id, `placed from estimate ${e.no} version ${v.no}${ev.credit.ok ? "" : ` — sent to review: ${ev.credit.reason}`}`, accepted.byName);
  if (ev.credit.ok) approveHubOrder(order, undefined, "Approved on acceptance of the estimate");
  return order;
}

/**
 * Make Sales force agree with the desk's estimates of our customers. It acts on a difference only — against the
 * opportunity as it stands, and against the estimate as the last pass saw it — so it can run on every change (and
 * after its own writes) and still move, order and log each thing once:
 *   sent, one version                    → the opportunity is "Estimate sent";
 *   changes asked, or a later version    → "In negotiation";
 *   accepted                             → the sales order is made from the accepted version and tied back, the
 *                                          opportunity is won with it;
 *   declined, or closed as lost          → the opportunity is lost, with the reason;
 *   cancelled or deleted on the desk     → with no other estimate in play, the opportunity waits for one again.
 * The opportunity's value is the latest version's total (the working total until one is sent).
 * `quiet` writes no history and makes no order — the pass at load only puts things in step.
 */
function follow(quiet = false) {
  const say: (() => void)[] = [];
  /** One line per thing that happened: on the opportunity, and on the customer in the customer's own words. */
  const tell = (e: Pick<Estimate, "customerId">, opp: Opportunity | undefined, what: string, who: string, onOpportunity = what) =>
    say.push(() => {
      if (opp) logEvent(opp.id, onOpportunity, who);
      logEvent(e.customerId, what, who);
    });
  /** An estimate taken back: with none left in play, its opportunity waits for an estimate again. */
  const withdrawn = (x: Pick<Estimate, "customerId" | "opportunity">, what: string) => {
    const opp = opportunityOf(x);
    if (!opp || (opp.stage !== "proposal" && opp.stage !== "negotiation") || openEstimateOf(opp.id)) return;
    if (moveOpportunity(opp.id, { stage: estimatesOf(opp.id).some((y) => !y.cancelled) ? "negotiation" : "new" })) tell(x, opp, what, STAFF_NAME);
  };

  for (const first of estimatesStore.get().filter(ours)) {
    const now = stateOf(first);
    const known = seen.get(first.no);
    if (known && sameState(known, now)) continue;
    // At the quiet pass nothing has just happened: every estimate is as it was left.
    const was = known ?? (quiet ? now : NOT_SENT);
    const e = first;
    const o = offerOf(e);
    const opp = opportunityOf(e);

    if (now.cancelled) {
      if (!was.cancelled) withdrawn(e, `cancelled estimate ${e.no} on the sales desk${e.cancelled?.reason ? ` — “${e.cancelled.reason}”` : ""}`);
      continue;
    }

    if (now.status === "accepted" && o.accepted) {
      const v = o.versions.find((x) => x.no === o.accepted!.version) ?? latestVersion(e);
      let orderNo = o.accepted.orderNo;
      if (!orderNo && v) {
        // One order per accepted estimate: an order that already names it — placed in another tab, or before a reload — is that order.
        const placed = hubStore.get().find((h) => h.estimateId === e.no && h.customerId === e.customerId);
        const order = placed ?? (quiet ? undefined : orderFor(e, v, o.accepted, opp));
        if (order) {
          orderNo = order.id;
          linkAcceptedOrder(e.no, order.id);
        }
      }
      if (opp) moveOpportunity(opp.id, { stage: "won", lostReason: null, orderId: orderNo ?? opp.orderId, expectedValue: v?.total ?? now.value });
      if (was.status !== "accepted") tell(e, opp, `accepted ${e.no} version ${o.accepted.version}${orderNo ? ` — order ${orderNo}` : ""}`, o.accepted.byName, `won: the customer accepted ${e.no} version ${o.accepted.version}${orderNo ? ` — order ${orderNo}` : ""}`);
      continue;
    }

    if (now.status === "declined") {
      if (was.status === "declined") continue;
      const byCustomer = o.declined?.by === "customer";
      const reason = (o.declined?.reason || (byCustomer ? "" : e.closed?.reason) || "").trim();
      const who = o.declined?.byName ?? STAFF_NAME;
      const what = byCustomer ? `declined ${e.no}${reason ? ` — “${reason}”` : ""}` : `closed ${e.no} as lost${reason ? ` — “${reason}”` : ""}`;
      // Another estimate still in play, or one already accepted, keeps the opportunity where it is.
      if (!opp) tell(e, opp, what, who);
      else if (opp.stage !== "won" && !openEstimateOf(opp.id) && moveOpportunity(opp.id, { stage: "lost", lostReason: byCustomer ? `The customer declined ${e.no}${reason ? `: ${reason}` : ""}` : reason || "Closed as lost" })) tell(e, opp, what, who, byCustomer ? `the customer declined ${e.no}` : what);
      continue;
    }

    // Open — sent or not yet. Only the estimate in play speaks for its opportunity.
    if (opp && opp.stage !== "won" && openEstimateOf(opp.id)?.no === e.no) {
      if (now.versions === 0) {
        if (opp.stage !== "lost") moveOpportunity(opp.id, { expectedValue: now.value });
      } else {
        const others = estimatesOf(opp.id).some((x) => x.no !== e.no && !x.cancelled);
        moveOpportunity(opp.id, { stage: now.status === "changes-requested" || now.versions > 1 || others ? "negotiation" : "proposal", lostReason: null, expectedValue: now.value });
      }
    }
    const v = latestVersion(e);
    if (v && now.versions > was.versions) tell(e, opp, v.no === 1 ? `sent estimate ${e.no} — ${money(v.total)}` : `sent ${e.no} version ${v.no} — ${money(v.total)}`, v.byName);
    const r = o.requests[o.requests.length - 1];
    if (r && now.requests > was.requests) tell(e, opp, `asked for changes on ${e.no} version ${r.onVersion}`, r.byName, `the customer asked for changes on ${e.no} version ${r.onVersion}`);
  }

  const desk = estimatesStore.get();
  // One that is gone from the desk since the last pass was deleted there.
  for (const [no, was] of seen) if (!desk.some((e) => e.no === no)) withdrawn(was, `deleted estimate ${no} on the sales desk`);
  seen = new Map(desk.filter(ours).map((e) => [e.no, stateOf(e)]));

  if (!quiet) say.forEach((f) => f());
}

// ── Kept across a reload, and in step across tabs ───────────────────────────

/** Every desk estimate of a Sales force customer. The desk's own store is in memory; the opportunity it moves is saved. */
const sfEstimatesStore = persistentStore<Estimate[]>("sales.estimates", []);
/** True while this tab writes `sfEstimatesStore` itself — any other change to it comes from another tab. */
let keeping = false;
/** True while estimates are put on this tab's desk that nobody acted on here: another tab's, or converted old ones. */
let takingIn = false;
/** True while the watcher runs: its own writes to the desk are part of the pass, not a new change to follow. */
let following = false;

function keep() {
  const now = estimatesStore.get().filter(ours);
  const saved = sfEstimatesStore.get();
  if (now.length === saved.length && now.every((e, i) => e === saved[i])) return;
  keeping = true;
  try {
    sfEstimatesStore.set(() => now);
  } finally {
    keeping = false;
  }
}

/**
 * One pass of the watcher, then the save — in that order, so that another tab is handed the settled estimate
 * (accepted WITH its order) and never the step before it. Every page loads this file: an estimate of a shape nobody
 * foresaw must not take the three apps down with it.
 */
function settle(quiet = false) {
  if (following) return;
  following = true;
  try {
    follow(quiet);
  } catch (e) {
    console.warn("[sf2] estimates: a change on the sales desk could not be followed", e);
  } finally {
    following = false;
  }
  keep();
}

// ── Estimates saved before the estimate was the desk's ──────────────────────

// Until owner decision #32 Sales force kept an estimate of its own (key "estimates"). These are its shapes, kept only
// to read what was saved that way.
type LegacyLine = { productId: string; qty: number; unitPrice: number; discountPct: number; freeQty: number; note: string };
type LegacyTerms = { paymentDays: number; payment: string; delivery: string; deliverBy: string | null; validTill: string; applyOffers: boolean };
type LegacyVersion = { no: number; at: string; by: string; lines: LegacyLine[]; charges: { label: string; amount: number }[]; terms: LegacyTerms; message: string };
type LegacyRequest = {
  id: string;
  at: string;
  by: string;
  onVersion: number;
  message: string;
  lines: { productId: string; qty?: number; unitPrice?: number; discountPct?: number; freeQty?: number; note?: string; remove?: boolean }[];
  add: { productId: string; qty: number; note?: string }[];
  terms: Partial<Pick<LegacyTerms, "paymentDays" | "payment" | "delivery" | "deliverBy" | "validTill">>;
};
export type LegacyEstimate = {
  /** Its number then (EST-0001). Empty = it never had one. */
  id: string;
  opportunityId: string;
  customerId: string;
  status: "sent" | "changes-requested" | "accepted" | "declined" | "expired";
  versions: LegacyVersion[];
  requests: LegacyRequest[];
  acceptedVersion: number | null;
  declineReason: string | null;
  declinedBy?: "customer" | "tenant" | null;
  orderId: string | null;
  createdAt: string;
};

/** A line keeps one id through every version, as a desk line does: the product it is for. */
const legacyLineId = (no: string, productId: string) => `EL-${no}-${productId}`;

/** Old lines in desk shape: a paid line, its free quantity as a zero-rate line right after it, each charge a line on the charge item. */
function legacyLines(no: string, v: LegacyVersion): OrderLine[] {
  const line = (id: string, itemId: string, x: Partial<OrderLine>): OrderLine => ({ id, itemId, qty: 1, rate: 0, discountPct: 0, tax: "VAT13", custom: {}, delivered: 0, invoiced: 0, ...x });
  const out: OrderLine[] = [];
  for (const l of v.lines ?? []) {
    // The sales desk cannot show a line whose product was deleted since.
    if (!productsStore.get().some((p) => p.id === l.productId)) continue;
    const id = legacyLineId(no, l.productId);
    const unit = productById(l.productId).unit;
    const note = l.note?.trim();
    if (l.qty > 0) out.push(line(id, l.productId, { qty: l.qty, rate: l.unitPrice, discountPct: l.discountPct || 0, unit, ...(note ? { note } : {}) }));
    if (l.freeQty > 0) out.push(line(`${id}-F`, l.productId, { qty: l.freeQty, unit, description: "Free goods", ...(l.qty > 0 ? { freeOf: id } : {}) }));
  }
  for (const c of v.charges ?? []) {
    const label = c.label.trim();
    if (label && c.amount > 0) out.push(line(`EL-${no}-C-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, CHARGE_ITEM_ID, { description: label, rate: c.amount, unit: "" }));
  }
  return out;
}

/** The old wording "Net 30 days" says nothing the desk's term of those days does not, so only other wording is kept. */
const legacyTerms = (t: LegacyTerms): OfferTerms => ({
  paymentNote: /^net \d+ days?$/i.test((t.payment ?? "").trim()) && termById(termForDays(t.paymentDays ?? 0))?.days === t.paymentDays ? "" : (t.payment ?? ""),
  deliveryTerms: t.delivery ?? "",
  deliverBy: t.deliverBy ?? null,
  applyOffers: t.applyOffers !== false,
});

function legacyAsks(no: string, r: LegacyRequest): ChangeAsk[] {
  return [
    ...(r.lines ?? []).map(
      (x): ChangeAsk =>
        x.remove
          ? { action: "remove", lineId: legacyLineId(no, x.productId) }
          : {
              action: "change",
              lineId: legacyLineId(no, x.productId),
              ...(x.qty !== undefined ? { qty: x.qty } : {}),
              ...(x.unitPrice !== undefined ? { rate: x.unitPrice } : {}),
              ...(x.discountPct !== undefined ? { discountPct: x.discountPct } : {}),
              ...(x.freeQty !== undefined ? { freeQty: x.freeQty } : {}),
              ...(x.note !== undefined ? { note: x.note } : {}),
            },
    ),
    ...(r.add ?? []).map((a): ChangeAsk => ({ action: "add", itemId: a.productId, qty: a.qty, ...(a.note ? { note: a.note } : {}) })),
  ];
}

/** The desk estimate an old one becomes: its latest version as the working lines, every version and request kept. */
function fromLegacy(x: LegacyEstimate, no: string): Estimate {
  const c = customerById(x.customerId);
  const day = x.createdAt.slice(0, 10);
  const versions: EstimateVersion[] = x.versions.map((v) => {
    const lines = legacyLines(no, v);
    return {
      no: v.no,
      at: v.at,
      byName: v.by,
      message: v.message ?? "",
      answers: [...(x.requests ?? [])].reverse().find((r) => r.onVersion === v.no - 1)?.id ?? null,
      validTill: v.terms.validTill,
      termId: termForDays(v.terms.paymentDays ?? 0),
      currency: "NPR",
      terms: legacyTerms(v.terms),
      lines,
      total: totalsOf(lines).total,
    };
  });
  const requests: EstimateChangeRequest[] = (x.requests ?? []).map((r) => ({
    id: r.id,
    at: r.at,
    byName: r.by,
    // Only a dealer on the portal could ask then.
    via: "portal",
    onVersion: r.onVersion,
    message: r.message ?? "",
    asks: legacyAsks(no, r),
    terms: {
      ...(r.terms?.payment !== undefined ? { paymentNote: r.terms.payment } : {}),
      ...(r.terms?.delivery !== undefined ? { deliveryTerms: r.terms.delivery } : {}),
      ...(r.terms?.deliverBy !== undefined ? { deliverBy: r.terms.deliverBy } : {}),
      ...(r.terms?.validTill !== undefined ? { validTill: r.terms.validTill } : {}),
    },
    answeredVersion: versions.find((v) => v.no > r.onVersion)?.no ?? null,
  }));
  const last = versions[versions.length - 1];
  const lastAt = [...versions.map((v) => v.at), ...requests.map((r) => r.at)].sort().pop() ?? x.createdAt;
  // The order took its sales order's number when orders did (store.ts `LEGACY_ORDER_IDS`).
  const orderNo = x.orderId ? (LEGACY_ORDER_IDS[x.orderId] ?? x.orderId) : null;
  const placed = hubStore.get().find((h) => h.id === orderNo);
  const customer = c?.name ?? "The customer";
  // "Expired" is read from the valid-till date now, never stored.
  const status: OfferStatus = x.status === "expired" ? (requests.some((r) => r.answeredVersion === null) ? "changes-requested" : "sent") : x.status;
  const accepted: EstimateOffer["accepted"] = status === "accepted" ? { version: x.acceptedVersion ?? last.no, byName: placed?.byName ?? customer, via: placed && placed.source !== "portal" ? "office" : "portal", at: placed?.at ?? lastAt, orderNo } : null;
  const byCustomer = x.declinedBy === "customer";
  const declined: EstimateOffer["declined"] = status === "declined" ? { reason: x.declineReason ?? "", by: byCustomer ? "customer" : "us", byName: byCustomer ? customer : STAFF_NAME, at: lastAt } : null;

  const when = (at: string) => `${fmtShort(at.slice(0, 10))}, ${at.slice(11, 16) || "00:00"}`;
  const events: { at: string; whoId: string; what: string }[] = [
    { at: x.createdAt, whoId: ME.id, what: `created the estimate from ${x.opportunityId}` },
    ...versions.map((v) => ({ at: v.at, whoId: ME.id, what: v.no === 1 ? `sent it to the customer — ${money(v.total)}, valid till ${v.validTill}` : `sent version ${v.no} — ${money(v.total)}` })),
    ...requests.map((r) => ({ at: r.at, whoId: "customer", what: `${r.byName} (customer) asked for changes on version ${r.onVersion}${r.message ? ` — “${r.message}”` : ""}` })),
    ...(accepted ? [{ at: accepted.at, whoId: accepted.via === "portal" ? "customer" : ME.id, what: accepted.via === "portal" ? `${accepted.byName} (customer) accepted version ${accepted.version}` : `recorded that ${accepted.byName} accepted version ${accepted.version}` }] : []),
    ...(declined ? [{ at: declined.at, whoId: ME.id, what: byCustomer ? `recorded that ${declined.byName} declined it${declined.reason ? ` — “${declined.reason}”` : ""}` : `closed it as lost${declined.reason ? ` — “${declined.reason}”` : ""}` }] : []),
  ];
  const history: HistoryEvent[] = events.map((ev, i) => ({ ev, i })).sort((a, b) => a.ev.at.localeCompare(b.ev.at) || a.i - b.i).map(({ ev }, i) => ({ id: `h-${no}-${i + 1}`, whoId: ev.whoId, when: when(ev.at), what: ev.what }));

  const locationId = locationFor(c?.city);
  return {
    id: no,
    no,
    subsidiaryId: locationId === "L-PKR" ? "NP-02" : "NP-01",
    customerId: x.customerId,
    date: day,
    validTill: last.validTill,
    expectedClose: opportunitiesStore.get().find((o) => o.id === x.opportunityId)?.expectedClose ?? null,
    status: versions.length > 1 ? "In negotiation" : "Proposal",
    opportunity: x.opportunityId,
    repId: c?.repId ?? ME.id,
    locationId,
    termId: last.termId,
    currency: "NPR",
    exchangeRate: 1,
    memo: "",
    // The likelihood the desk's own estimates carry at each of these points.
    probability: accepted ? 100 : declined ? 0 : versions.length > 1 ? 40 : 60,
    lines: last.lines.map((l) => ({ ...l, custom: {} })),
    dims: {},
    custom: {},
    approval: { state: "approved", byId: ME.id, on: day },
    closed: declined ? { reason: declined.reason || (byCustomer ? "Declined by the customer" : "Closed as lost"), on: lastAt.slice(0, 10) } : null,
    cancelled: null,
    offer: { status, terms: { ...last.terms }, versions, requests, accepted, declined },
    created: { byId: ME.id, on: day },
    audit: [],
    attachments: [],
    comments: [],
    history,
  };
}

const refile = <T>(all: Record<string, T[]>, from: string, to: string): Record<string, T[]> => {
  if (from === to || !all[from]) return all;
  const { [from]: moved, ...rest } = all;
  return { ...rest, [to]: [...(rest[to] ?? []), ...moved] };
};

/** The desk already uses the number an old estimate had: it takes the desk's next number, and what was filed under the old one follows. */
function renumber(from: string, to: string) {
  if (hubStore.get().some((h) => h.estimateId === from)) hubStore.set((hs) => hs.map((h) => (h.estimateId === from ? { ...h, estimateId: to } : h)));
  const history = refile(historyStore.get(), from, to);
  if (history !== historyStore.get()) historyStore.set(() => history);
  const notes = refile(notesStore.get(), from, to);
  if (notes !== notesStore.get()) notesStore.set(() => notes);
}

/**
 * Every old estimate becomes a desk estimate, once, under its own number where the desk has not used it. An estimate
 * whose customer is gone has no place on the desk and is left behind.
 */
function convert(old: LegacyEstimate[]) {
  const made: Estimate[] = [];
  // Oldest first, as they were made: the store kept the newest first.
  for (const x of [...old].reverse()) {
    if (!x?.versions?.length || !customerById(x.customerId)) continue;
    const desk = [...made, ...estimatesStore.get()];
    const holder = x.id ? desk.find((e) => e.no === x.id) : undefined;
    // Converted on an earlier load, and saved the old way again since.
    if (holder && holder.customerId === x.customerId && holder.opportunity === x.opportunityId) continue;
    const no = x.id && !holder ? x.id : nextNo("EST-", desk.map((e) => e.no));
    made.unshift(fromLegacy(x, no));
    if (x.id && no !== x.id) renumber(x.id, no);
  }
  if (made.length) estimatesStore.set((es) => [...made, ...es]);
}

/**
 * Old estimates that reach us after load (the still older "quotation requests", which deals.ts turns into
 * opportunities first) join the desk without anything being logged, ordered or moved because of it.
 */
export function adoptLegacyEstimates(old: LegacyEstimate[]) {
  takingIn = true;
  try {
    convert(old);
  } finally {
    takingIn = false;
  }
  settle(true);
}

// ── At load, then on every change ───────────────────────────────────────────

// A saved estimate whose number the desk's seed has taken, or whose customer is gone, is left out.
estimatesStore.set((es) => [...sfEstimatesStore.get().filter((x) => ours(x) && !es.some((e) => e.no === x.no)), ...es]);
try {
  const old = readSaved<LegacyEstimate[]>("estimates");
  if (old) {
    convert(old);
    dropSaved("estimates");
  }
} catch (e) {
  console.warn("[sf2] estimates: an old estimate could not be moved to the sales desk", e);
}
settle(true);

estimatesStore.subscribe(() => {
  if (!takingIn) settle();
});

// The prototype runs in several tabs (Sales force, the sales desk, the dealer portal) and each has its own desk in
// memory: an estimate sent or answered in one must be on the desk of the others. That tab already moved the
// opportunity, made the order and wrote the history; here the estimates are only put in place.
sfEstimatesStore.subscribe(() => {
  if (keeping) return;
  const saved = sfEstimatesStore.get().filter(ours);
  takingIn = true;
  try {
    estimatesStore.set((es) => [...saved, ...es.filter((e) => !ours(e))]);
  } finally {
    takingIn = false;
  }
  seen = new Map(saved.map((e) => [e.no, stateOf(e)]));
});
