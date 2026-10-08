import { declineEstimateOffer, estimateSeed } from "../sales/estimate-offer";
import { SF_NOW, SF_TODAY } from "./data";
import type { OppSource, OppStage, Opportunity, RfqLine } from "./data";
import { customerById, priceFor, productById, typeOf } from "./engine";
import { adoptLegacyEstimates, estimatesOf, openEstimateOf } from "./estimates";
import type { LegacyEstimate } from "./estimates";
import { nextId } from "./persist";
import { STAFF_NAME, logEvent } from "./records";
import { opportunitiesStore, quotesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// DEALS — opportunities (owner decisions #27, #32)
//
// THE ONE PLACE an opportunity's own rules live; the Sales force pages and the
// dealer portal only call these, so both sides always agree.
//
//   portal RFQ, or one a rep or the office logs ──▶ Opportunity (new)
//   Create estimate ──▶ the sales desk's own estimate form, with what was asked for on it
//   the estimate is sent, answered, accepted, declined ──▶ the opportunity's stage follows it (estimates.ts)
//   the tenant gives the deal up ──▶ opportunity "lost", its estimate in play closed as lost
//
// The estimate we answer with is the sales desk's (sales/flow.tsx, sales/estimate-offer.ts): Sales force has none of
// its own. Nobody types a stage — it is read from the estimate, except for "lost" and "reopen" below.
// ════════════════════════════════════════════════════════════════════════════

export const STAGE_LABEL: Record<OppStage, string> = { new: "New request", proposal: "Estimate sent", negotiation: "In negotiation", won: "Won", lost: "Lost" };
export const STAGE_TONE: Record<OppStage, "warn" | "info" | "good" | "off"> = { new: "warn", proposal: "info", negotiation: "info", won: "good", lost: "off" };
export const STAGES: OppStage[] = ["new", "proposal", "negotiation", "won", "lost"];
export const SOURCE_TEXT: Record<OppSource, string> = { "portal-rfq": "Dealer portal request", rep: "Logged by a rep", office: "Logged by the office" };

const stamp = () => `${SF_TODAY} ${SF_NOW}`;
const addDaysIso = (iso: string, days: number) => new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);

export const opportunityById = (id: string | null | undefined) => opportunitiesStore.get().find((o) => o.id === id);

const setOpp = (id: string, patch: Partial<Opportunity>) => opportunitiesStore.set((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));

// ── Opportunities ───────────────────────────────────────────────────────────

const guessValue = (customerId: string, lines: RfqLine[]) => {
  const c = customerById(customerId);
  return lines.reduce((s, l) => s + priceFor(productById(l.productId), c) * l.qty, 0);
};
const titleFor = (lines: RfqLine[]) => {
  if (!lines.length) return "Price request";
  const first = productById(lines[0].productId).name;
  return lines.length > 1 ? `${first} + ${lines.length - 1} more` : `${lines[0].qty} × ${first}`;
};

/** A dealer's price request on the portal. It goes only to the tenant, as a new opportunity. */
export function createRfq(customerId: string, byName: string, input: { lines: RfqLine[]; note: string; deliverBy: string | null; paymentWish: string | null; title?: string }): Opportunity {
  const all = opportunitiesStore.get();
  const lines = input.lines.filter((l) => l.qty > 0);
  const o: Opportunity = {
    id: nextId("OPP-", all.map((x) => x.id), 4),
    customerId,
    title: input.title?.trim() || titleFor(lines),
    source: "portal-rfq",
    rfqNo: nextId("RFQ-", all.map((x) => x.rfqNo ?? ""), 4),
    request: { lines, note: input.note.trim(), deliverBy: input.deliverBy, paymentWish: input.paymentWish?.trim() || null, byName, at: stamp() },
    repId: customerById(customerId)?.repId ?? null,
    stage: "new",
    expectedValue: guessValue(customerId, lines),
    expectedClose: input.deliverBy,
    createdAt: stamp(),
    lostReason: null,
    orderId: null,
  };
  opportunitiesStore.set((os) => [o, ...os]);
  logEvent(o.id, `asked for a price on the dealer portal (${o.rfqNo})`, byName);
  logEvent(customerId, `asked for a price — ${o.rfqNo}: ${o.title}`, byName);
  return o;
}

/** An opportunity the tenant logs itself (a rep heard of a deal, the office took a call). */
export function createOpportunity(input: { customerId: string; title: string; source: Exclude<OppSource, "portal-rfq">; lines: RfqLine[]; note: string; expectedValue?: number; expectedClose: string | null; byName?: string }): Opportunity {
  const all = opportunitiesStore.get();
  const by = input.byName ?? STAFF_NAME;
  const lines = input.lines.filter((l) => l.qty > 0);
  const o: Opportunity = {
    id: nextId("OPP-", all.map((x) => x.id), 4),
    customerId: input.customerId,
    title: input.title.trim() || titleFor(lines),
    source: input.source,
    rfqNo: null,
    request: lines.length || input.note.trim() ? { lines, note: input.note.trim(), deliverBy: input.expectedClose, paymentWish: null, byName: by, at: stamp() } : null,
    repId: customerById(input.customerId)?.repId ?? null,
    stage: "new",
    expectedValue: input.expectedValue ?? guessValue(input.customerId, lines),
    expectedClose: input.expectedClose,
    createdAt: stamp(),
    lostReason: null,
    orderId: null,
  };
  opportunitiesStore.set((os) => [o, ...os]);
  logEvent(o.id, "logged the opportunity", by);
  logEvent(o.customerId, `opportunity ${o.id}: ${o.title}`, by);
  return o;
}

/**
 * Give an opportunity up. Its estimate still in play is closed as lost with the same reason — after the opportunity,
 * so that the watcher (estimates.ts) finds the two already agree and adds no line of its own.
 */
export function markLost(opportunityId: string, reason: string, by: string = STAFF_NAME) {
  const o = opportunityById(opportunityId);
  if (!o) return;
  const why = reason.trim();
  setOpp(o.id, { stage: "lost", lostReason: why });
  logEvent(o.id, `marked it lost — “${why}”`, by);
  const open = openEstimateOf(o.id);
  if (open) declineEstimateOffer(open.no, { by: "us", byName: by, reason: why });
}

/** A lost opportunity is back in play. A declined estimate stays closed: the next offer is a new estimate. */
export function reopenOpportunity(opportunityId: string, by: string = STAFF_NAME) {
  const o = opportunityById(opportunityId);
  if (!o || o.stage !== "lost") return;
  setOpp(o.id, { stage: estimatesOf(o.id).some((e) => !e.cancelled) ? "negotiation" : "new", lostReason: null });
  logEvent(o.id, "reopened it", by);
}

/**
 * Where an opportunity's estimate is made: the sales desk's own estimate form, opened for the customer with its rep
 * named and what was asked for already on it, at the customer's usual price. The lines do not fit in a link, so they
 * are left for the form to take (sales/estimate-offer `estimateSeed`) — call this when the user asks, not while drawing.
 */
export function estimatePathFor(o: Opportunity): string {
  const c = customerById(o.customerId);
  const repId = c?.repId ?? o.repId;
  estimateSeed.current = {
    customerId: o.customerId,
    repId,
    opportunity: o.id,
    deliverBy: o.request?.deliverBy ?? null,
    lines: (o.request?.lines ?? []).map((l) => ({ itemId: l.productId, qty: l.qty, rate: priceFor(productById(l.productId), c), ...(l.note ? { note: l.note } : {}) })),
  };
  return `/design/sales/estimates/new?${new URLSearchParams({ cust: o.customerId, ...(repId ? { rep: repId } : {}), opportunity: o.id }).toString()}`;
}

// ── One-time: the old "quotation requests" become opportunities ─────────────

(function convertOldQuotes() {
  const old = quotesStore.get();
  if (!old.length || opportunitiesStore.get().length) return;
  // A request that was already answered had its estimate; it goes to the sales desk like any old estimate (estimates.ts).
  const answered: LegacyEstimate[] = [];
  for (const q of [...old].reverse()) {
    const c = customerById(q.customerId);
    const lines: RfqLine[] = q.lines.map((l) => ({ productId: l.productId, qty: l.qty }));
    const oppId = nextId("OPP-", opportunitiesStore.get().map((x) => x.id), 4);
    const stage: OppStage = q.status === "requested" ? "new" : q.status === "quoted" ? "proposal" : q.status === "accepted" ? "won" : "lost";
    const opp: Opportunity = { id: oppId, customerId: q.customerId, title: titleFor(lines), source: "portal-rfq", rfqNo: q.id, request: { lines, note: q.note, deliverBy: null, paymentWish: null, byName: q.byName, at: q.at }, repId: c?.repId ?? null, stage, expectedValue: guessValue(q.customerId, lines), expectedClose: null, createdAt: q.at, lostReason: q.status === "declined" ? q.reply : null, orderId: q.orderId };
    opportunitiesStore.set((os) => [opp, ...os]);
    if (q.status === "quoted" || q.status === "accepted") {
      const at = `${q.quotedOn ?? q.at.slice(0, 10)} 00:00`;
      const days = typeOf(c).creditDays;
      answered.unshift({
        id: q.estimateNo ?? "",
        opportunityId: oppId,
        customerId: q.customerId,
        status: q.status === "accepted" ? "accepted" : "sent",
        versions: [
          {
            no: 1,
            at,
            by: STAFF_NAME,
            lines: q.lines.map((l) => ({ productId: l.productId, qty: l.qty, unitPrice: l.price ?? priceFor(productById(l.productId), c), discountPct: 0, freeQty: 0, note: "" })),
            charges: [],
            terms: { paymentDays: days, payment: days > 0 ? `Net ${days} days` : "Cash on delivery", delivery: "Delivered to your address", deliverBy: null, validTill: q.validTill ?? addDaysIso(SF_TODAY, 14), applyOffers: false },
            message: q.reply ?? "",
          },
        ],
        requests: [],
        acceptedVersion: q.status === "accepted" ? 1 : null,
        declineReason: null,
        orderId: q.orderId,
        createdAt: at,
      });
    }
  }
  quotesStore.set(() => []);
  if (answered.length) adoptLegacyEstimates(answered);
})();
