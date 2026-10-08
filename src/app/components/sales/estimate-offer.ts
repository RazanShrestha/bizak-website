import { ME, TODAY, itemById, lineGross, totalsOf } from "./orders";
import type { HistoryEvent, OrderLine } from "./orders";
import type { Tone } from "./bzw";
import { estimatesStore, stamp } from "./flow";
import type { Estimate } from "./flow";

// ════════════════════════════════════════════════════════════════════════════
// THE ESTIMATE AS AN OFFER — send, negotiate, accept (owner decisions #27, #32)
//
// An estimate the customer answers. THE ONE PLACE these rules live: the
// estimates desk, Sales force and the dealer portal only call them, so every
// side agrees on where an estimate stands.
//
//   send                       ──▶ version 1 frozen, offer "sent"
//   the customer asks changes  ──▶ a change request, offer "changes-requested"
//   edit, then send again      ──▶ version 2, 3… (earlier versions are kept)
//   the customer accepts       ──▶ offer "accepted"; the sales order is made from that version
//   declined / given up        ──▶ offer "declined", the estimate is closed
//   valid-till passes          ──▶ reads "expired" (never stored); a new version revives it
//
// Only we price: the customer never edits the estimate, it asks, and we answer
// with a new version. The estimate's own lines are always the working copy; the
// customer is only ever shown a VERSION, so an edit is invisible until it is sent.
//
// The desk runs on a frozen clock and Sales force may not, so every rule reads
// the day and the moment from `offerClock` (or from its caller).
// ════════════════════════════════════════════════════════════════════════════

/**
 * The day and the moment the offer rules run on. The desk's own (frozen) clock unless a module that owns the
 * customer side sets another: Sales force points this at its clock at load, so an estimate sent on the desk and
 * the dealer reading it on the portal agree on what "expired" means.
 */
export const offerClock = {
  today: (): string => TODAY,
  now: (): string => {
    const d = new Date();
    return `${TODAY} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  },
};

export type OfferStatus = "not-sent" | "sent" | "changes-requested" | "accepted" | "declined";

/** What is agreed besides the lines. `paymentNote` is the wording ("50% advance, rest on delivery"); the days come from the estimate's term. */
export type OfferTerms = {
  paymentNote: string;
  deliveryTerms: string;
  deliverBy: string | null;
  /** true = live offers (schemes) still apply on top of these prices; false = these prices are final. */
  applyOffers: boolean;
};

/** One send, frozen: what the customer was shown. Never edited afterwards. */
export type EstimateVersion = {
  no: number;
  /** "2026-09-04 14:10" */
  at: string;
  byName: string;
  message: string;
  /** The change request this version answers, if any. */
  answers: string | null;
  validTill: string;
  termId: string;
  currency: string;
  terms: OfferTerms;
  lines: OrderLine[];
  total: number;
};

/** One thing the customer asks about a line. `freeQty` = free units wanted with that line (0 = none). */
export type ChangeAsk =
  | { action: "change"; lineId: string; qty?: number; rate?: number; discountPct?: number; freeQty?: number; note?: string }
  | { action: "remove"; lineId: string }
  | { action: "add"; itemId: string; qty: number; note?: string };

export type EstimateChangeRequest = {
  id: string;
  at: string;
  byName: string;
  /** The customer on the portal, or staff logging what the customer said. */
  via: "portal" | "office";
  onVersion: number;
  message: string;
  asks: ChangeAsk[];
  terms: Partial<OfferTerms> & { validTill?: string };
  answeredVersion: number | null;
};

export type EstimateOffer = {
  status: OfferStatus;
  terms: OfferTerms;
  versions: EstimateVersion[];
  requests: EstimateChangeRequest[];
  accepted: { version: number; byName: string; via: "portal" | "office"; at: string; orderNo: string | null } | null;
  declined: { reason: string; by: "customer" | "us"; byName: string; at: string } | null;
};

export const DEFAULT_OFFER_TERMS: OfferTerms = { paymentNote: "", deliveryTerms: "", deliverBy: null, applyOffers: true };

/** An estimate that was never sent has no `offer`; this reads it as "not sent". */
export const offerOf = (e: Estimate): EstimateOffer => e.offer ?? { status: "not-sent", terms: DEFAULT_OFFER_TERMS, versions: [], requests: [], accepted: null, declined: null };
export const latestVersion = (e: Estimate): EstimateVersion | undefined => {
  const v = offerOf(e).versions;
  return v[v.length - 1];
};
export const openRequests = (e: Estimate) => offerOf(e).requests.filter((r) => r.answeredVersion === null);

/** Still waiting on the customer, but the date its prices hold till has passed. */
export function offerExpired(e: Estimate, today: string = offerClock.today()) {
  const o = offerOf(e);
  const v = latestVersion(e);
  return (o.status === "sent" || o.status === "changes-requested") && !!v && v.validTill < today;
}

export type OfferReading = OfferStatus | "expired";
export const offerReading = (e: Estimate, today: string = offerClock.today()): OfferReading => (offerExpired(e, today) ? "expired" : offerOf(e).status);
export const OFFER_LABEL: Record<OfferReading, string> = { "not-sent": "Not sent", sent: "Sent", "changes-requested": "Changes asked", accepted: "Accepted", declined: "Declined", expired: "Expired" };
export const OFFER_TONE: Record<OfferReading, Tone> = { "not-sent": "neutral", sent: "partial", "changes-requested": "pending", accepted: "positive", declined: "neutral", expired: "danger" };

// ── Lines ───────────────────────────────────────────────────────────────────

/**
 * A charge agreed with the customer (freight, loading…) is a line on this one non-stock item, named by the line's
 * description — so it carries to the order and the invoice like any line.
 */
export const CHARGE_ITEM_ID = "SF-CHARGE";
export const isChargeLine = (l: Pick<OrderLine, "itemId">) => l.itemId === CHARGE_ITEM_ID;

/** Free goods ride as their own zero-rate line, tied to the paid line they come with (`freeOf`). */
export const isFreeLine = (l: OrderLine) => !!l.freeOf;
export const freeQtyOf = (lines: OrderLine[], lineId: string) => lines.filter((l) => l.freeOf === lineId).reduce((s, l) => s + l.qty, 0);

const copyLines = (lines: OrderLine[]): OrderLine[] => lines.map((l) => ({ ...l, custom: l.custom ? { ...l.custom } : l.custom }));
const lineKey = (l: OrderLine) => [l.itemId, l.qty, l.rate, l.discountPct, l.discountAmt ?? 0, l.tax, l.unit ?? "", l.description ?? "", l.note ?? "", l.freeOf ?? ""].join("|");
const sameTerms = (a: OfferTerms, b: OfferTerms) => a.paymentNote === b.paymentNote && a.deliveryTerms === b.deliveryTerms && (a.deliverBy ?? "") === (b.deliverBy ?? "") && a.applyOffers === b.applyOffers;

/** The working copy no longer matches what the customer was last shown — it has to be sent again to count. */
export function changedSinceSent(e: Estimate) {
  const v = latestVersion(e);
  if (!v) return false;
  return v.termId !== e.termId || v.validTill !== (e.validTill ?? "") || !sameTerms(v.terms, offerOf(e).terms) || v.lines.length !== e.lines.length || v.lines.some((l, i) => lineKey(l) !== lineKey(e.lines[i]));
}

// ── Writing ─────────────────────────────────────────────────────────────────

type Who = { byName?: string; at?: string; today?: string };
type Result<T = unknown> = ({ ok: true } & T) | { ok: false; refusal: string };

/** A history line. A customer's act is filed under no staff member: the sentence itself names who did it. */
const event = (what: string, staff: boolean): HistoryEvent => ({ id: `h${Date.now()}${Math.random()}`, whoId: staff ? ME.id : "customer", when: stamp(), what });
const write = (no: string, fn: (e: Estimate) => Estimate, h: HistoryEvent) => estimatesStore.set((es) => es.map((e) => (e.no === no ? { ...fn(e), history: [...e.history, h] } : e)));
const find = (no: string) => estimatesStore.get().find((e) => e.no === no);
const money = (e: Pick<Estimate, "currency">, n: number) => `${e.currency} ${Math.round(n).toLocaleString("en-US")}`;
const nameOf = (itemId: string) => itemById(itemId)?.name ?? "a removed item";

/**
 * Send the estimate as it stands: freezes the next version. `validTill` becomes the estimate's valid-till date and
 * must not be in the past; `terms` become the estimate's terms. Refused while it waits for approval, once it is
 * accepted, declined, cancelled or closed, and when it has no line.
 */
export function sendEstimate(no: string, input: { message: string; validTill: string; terms: OfferTerms; answers?: string | null } & Who): Result<{ version: EstimateVersion }> {
  const e = find(no);
  if (!e) return { ok: false, refusal: "This estimate no longer exists." };
  const o = offerOf(e);
  const today = input.today ?? offerClock.today();
  if (e.cancelled) return { ok: false, refusal: "This estimate is cancelled." };
  if (e.approval.state !== "approved") return { ok: false, refusal: "Approve the estimate before sending it." };
  if (o.status === "accepted") return { ok: false, refusal: "The customer already accepted this estimate." };
  if (o.status === "declined" || e.closed) return { ok: false, refusal: "This estimate is closed. Copy it to make a new offer." };
  if (!e.lines.some((l) => l.qty > 0)) return { ok: false, refusal: "Add at least one line before sending." };
  if (!input.validTill || input.validTill < today) return { ok: false, refusal: "Set a valid-till date that is today or later." };
  const lines = copyLines(e.lines);
  const version: EstimateVersion = {
    no: o.versions.length + 1,
    at: input.at ?? offerClock.now(),
    byName: input.byName ?? ME.name,
    message: input.message.trim(),
    answers: input.answers ?? null,
    validTill: input.validTill,
    termId: e.termId,
    currency: e.currency,
    terms: { ...input.terms },
    lines,
    total: totalsOf(lines).total,
  };
  const prev = o.versions[o.versions.length - 1];
  const changes = prev ? diffVersions(prev, version) : [];
  write(
    no,
    (x) => ({
      ...x,
      validTill: input.validTill,
      offer: {
        ...offerOf(x),
        status: "sent",
        terms: { ...input.terms },
        versions: [...offerOf(x).versions, version],
        // A new version answers everything asked before it.
        requests: offerOf(x).requests.map((r) => (r.answeredVersion === null ? { ...r, answeredVersion: version.no } : r)),
      },
    }),
    event(version.no === 1 ? `sent it to the customer — ${money(e, version.total)}, valid till ${input.validTill}` : `sent version ${version.no} — ${money(e, version.total)}${changes.length ? `: ${changes.join("; ")}` : ""}`, true),
  );
  return { ok: true, version };
}

/** The customer asks for changes on the latest version — anything on it. We answer with a new version. */
export function requestEstimateChanges(no: string, input: { via: "portal" | "office"; byName: string; message: string; asks: ChangeAsk[]; terms: EstimateChangeRequest["terms"] } & Who): Result<{ request: EstimateChangeRequest }> {
  const e = find(no);
  const v = e && latestVersion(e);
  if (!e || !v) return { ok: false, refusal: "This estimate has not been sent yet." };
  const o = offerOf(e);
  // An expired estimate can still be asked about ("keep it open") — it stays expired until a new version is sent.
  if (o.status !== "sent" && o.status !== "changes-requested") return { ok: false, refusal: o.status === "accepted" ? "This estimate was already accepted." : "This estimate is closed." };
  const asks = input.asks.filter((a) => a.action !== "add" || a.qty > 0);
  if (!asks.length && !input.message.trim() && !Object.keys(input.terms).length) return { ok: false, refusal: "Say what should change." };
  const request: EstimateChangeRequest = { id: `CR-${String(o.requests.length + 1).padStart(3, "0")}`, at: input.at ?? offerClock.now(), byName: input.byName, via: input.via, onVersion: v.no, message: input.message.trim(), asks, terms: input.terms, answeredVersion: null };
  const said = askLines(request, v);
  write(
    no,
    (x) => ({ ...x, offer: { ...offerOf(x), status: "changes-requested", requests: [...offerOf(x).requests, request] } }),
    event(`${input.via === "portal" ? `${input.byName} (customer) asked` : `recorded that ${input.byName} asked`} for changes on version ${v.no}${said.length ? `: ${said.join("; ")}` : ""}${request.message ? ` — “${request.message}”` : ""}`, input.via === "office"),
  );
  return { ok: true, request };
}

/**
 * The customer accepts the latest version. Only the fact is recorded here; the sales order is made from that version
 * by whoever owns the customer's ordering (Sales force for its customers, Convert to order otherwise) and tied back
 * with `linkAcceptedOrder`.
 */
export function acceptEstimateOffer(no: string, input: { via: "portal" | "office"; byName: string } & Who): Result<{ version: EstimateVersion }> {
  const e = find(no);
  const v = e && latestVersion(e);
  if (!e || !v) return { ok: false, refusal: "This estimate has not been sent yet." };
  const o = offerOf(e);
  if (e.cancelled) return { ok: false, refusal: "This estimate is cancelled." };
  if (o.status === "accepted") return { ok: false, refusal: "This estimate was already accepted." };
  if (o.status !== "sent" && o.status !== "changes-requested") return { ok: false, refusal: "This estimate is closed." };
  if (offerExpired(e, input.today ?? offerClock.today())) return { ok: false, refusal: `This estimate expired on ${v.validTill}. Ask for a new version.` };
  if (input.via === "office" && changedSinceSent(e)) return { ok: false, refusal: `The estimate changed after version ${v.no} was sent. Send the new version first.` };
  write(
    no,
    // What was accepted is what stands: an edit made after the version was sent, which the customer never saw, goes
    // with the acceptance — or the estimate would read "partly ordered" against lines nobody agreed to.
    (x) => ({ ...x, lines: copyLines(v.lines), termId: v.termId, validTill: v.validTill, offer: { ...offerOf(x), terms: { ...v.terms }, status: "accepted", accepted: { version: v.no, byName: input.byName, via: input.via, at: input.at ?? offerClock.now(), orderNo: null } } }),
    event(input.via === "portal" ? `${input.byName} (customer) accepted version ${v.no}` : `recorded that ${input.byName} accepted version ${v.no}`, input.via === "office"),
  );
  return { ok: true, version: v };
}

/** The sales order made from the accepted version. */
export function linkAcceptedOrder(no: string, orderNo: string) {
  estimatesStore.set((es) => es.map((e) => (e.no === no && e.offer?.accepted && e.offer.accepted.orderNo !== orderNo ? { ...e, offer: { ...e.offer, accepted: { ...e.offer.accepted, orderNo } } } : e)));
}

/** The customer says no, or we give the deal up. The estimate is closed with the reason. */
export function declineEstimateOffer(no: string, input: { by: "customer" | "us"; byName: string; reason: string; via?: "portal" | "office" } & Who): Result {
  const e = find(no);
  if (!e) return { ok: false, refusal: "This estimate no longer exists." };
  const o = offerOf(e);
  if (o.status === "accepted") return { ok: false, refusal: "This estimate was already accepted." };
  if (o.status === "declined") return { ok: true };
  const reason = input.reason.trim();
  const fromPortal = input.by === "customer" && input.via === "portal";
  write(
    no,
    // A lost estimate has no likelihood left, whoever ended it — it must not weigh in the pipeline.
    (x) => ({ ...x, probability: 0, closed: { reason: reason || (input.by === "customer" ? "Declined by the customer" : "Closed as lost"), on: input.today ?? offerClock.today() }, offer: { ...offerOf(x), status: "declined", declined: { reason, by: input.by, byName: input.byName, at: input.at ?? offerClock.now() } } }),
    event(fromPortal ? `${input.byName} (customer) declined it${reason ? ` — “${reason}”` : ""}` : input.by === "customer" ? `recorded that ${input.byName} declined it${reason ? ` — “${reason}”` : ""}` : `closed it as lost${reason ? ` — “${reason}”` : ""}`, !fromPortal),
  );
  return { ok: true };
}

// ── A change request, applied ───────────────────────────────────────────────

/**
 * The estimate's lines and terms with everything the customer asked for applied — a starting point we then edit and
 * send. An added item comes in at `rateFor(itemId)` (the customer's usual price), free units as a zero-rate line.
 */
export function applyChangeRequest(e: Estimate, r: EstimateChangeRequest, rateFor: (itemId: string) => number = (id) => itemById(id)?.rate ?? 0): { lines: OrderLine[]; terms: OfferTerms; validTill: string | null } {
  let lines = copyLines(e.lines);
  let seq = 0;
  const newId = () => `EL-${r.id}-${++seq}-${Date.now().toString(36)}`;
  const setFree = (paid: OrderLine, qty: number) => {
    lines = lines.filter((l) => l.freeOf !== paid.id);
    if (qty <= 0) return;
    const at = lines.findIndex((l) => l.id === paid.id);
    lines.splice(at + 1, 0, { ...paid, id: newId(), qty, rate: 0, discountPct: 0, discountAmt: undefined, priceLevel: undefined, description: "Free goods", note: undefined, freeOf: paid.id, custom: {}, delivered: 0, invoiced: 0 });
  };
  for (const a of r.asks) {
    if (a.action === "remove") {
      lines = lines.filter((l) => l.id !== a.lineId && l.freeOf !== a.lineId);
    } else if (a.action === "change") {
      const at = lines.findIndex((l) => l.id === a.lineId);
      if (at < 0) continue;
      const was = lines[at];
      const next: OrderLine = { ...was, qty: a.qty ?? was.qty, rate: a.rate ?? was.rate, discountPct: a.discountPct ?? was.discountPct, note: a.note ?? was.note };
      // A typed rate or percentage replaces the price level and an amount discount, as it does in the composer.
      if (a.rate !== undefined && a.rate !== was.rate) next.priceLevel = undefined;
      if (a.discountPct !== undefined) next.discountAmt = undefined;
      lines[at] = next;
      if (a.freeQty !== undefined) setFree(next, a.freeQty);
    } else if (!lines.some((l) => l.itemId === a.itemId && !l.freeOf)) {
      const it = itemById(a.itemId);
      lines.push({ id: newId(), itemId: a.itemId, qty: a.qty, rate: rateFor(a.itemId), discountPct: 0, tax: it?.tax ?? "VAT13", unit: it?.unit, note: a.note, custom: {}, delivered: 0, invoiced: 0 });
    }
  }
  const { validTill, ...asked } = r.terms;
  return { lines, terms: { ...offerOf(e).terms, ...asked }, validTill: validTill ?? e.validTill };
}

// ── Reading changes in plain words ──────────────────────────────────────────

const paid = (lines: OrderLine[]) => lines.filter((l) => !l.freeOf);
/**
 * The same line in another version: by its id, else the same item (a line re-typed in the composer gets a new id).
 * Every charge is a line on the one charge item, so a charge is the same one only under the same description.
 */
const twin = (l: OrderLine, others: OrderLine[]) => others.find((x) => x.id === l.id) ?? others.find((x) => x.itemId === l.itemId && (!isChargeLine(l) || (x.description ?? "") === (l.description ?? "")));
/** The paid line of a version that a working line answers to — what the customer last saw of it. */
export const sentLine = (l: OrderLine, v: Pick<EstimateVersion, "lines">) => twin(l, paid(v.lines));
/** What a line is called: a charge by its description, anything else by its item. */
export const lineName = (l: OrderLine) => (isChargeLine(l) && l.description ? l.description : nameOf(l.itemId));
/** What one unit costs on a line, after its discount. */
export const unitNet = (l: OrderLine) => (l.qty > 0 ? lineGross(l) / l.qty : l.rate);

/** What changed from one version to the next, one short line each. */
export function diffVersions(a: EstimateVersion, b: EstimateVersion): string[] {
  const out: string[] = [];
  const m = (n: number) => `${b.currency} ${Math.round(n).toLocaleString("en-US")}`;
  const before = paid(a.lines);
  const after = paid(b.lines);
  for (const l of after) {
    const was = twin(l, before);
    const name = lineName(l);
    if (!was) {
      out.push(`Added ${name}: ${l.qty} at ${m(unitNet(l))}`);
      continue;
    }
    if (was.qty !== l.qty) out.push(`${name}: quantity ${was.qty} → ${l.qty}`);
    if (was.rate !== l.rate) out.push(`${name}: price ${m(was.rate)} → ${m(l.rate)}`);
    if (was.discountPct !== l.discountPct || (was.discountAmt ?? 0) !== (l.discountAmt ?? 0)) out.push(`${name}: discount ${was.discountAmt ? m(was.discountAmt) : `${was.discountPct}%`} → ${l.discountAmt ? m(l.discountAmt) : `${l.discountPct}%`}`);
    const f0 = freeQtyOf(a.lines, was.id);
    const f1 = freeQtyOf(b.lines, l.id);
    if (f0 !== f1) out.push(`${name}: free quantity ${f0} → ${f1}`);
    if ((was.note ?? "") !== (l.note ?? "")) out.push(`${name}: note changed`);
  }
  for (const l of before) if (!twin(l, after)) out.push(`Removed ${lineName(l)}`);
  if (a.termId !== b.termId || a.terms.paymentNote !== b.terms.paymentNote) out.push("Payment terms changed");
  if (a.terms.deliveryTerms !== b.terms.deliveryTerms) out.push(`Delivery: ${a.terms.deliveryTerms || "not set"} → ${b.terms.deliveryTerms || "not set"}`);
  if ((a.terms.deliverBy ?? "") !== (b.terms.deliverBy ?? "")) out.push(`Deliver by: ${a.terms.deliverBy ?? "not set"} → ${b.terms.deliverBy ?? "not set"}`);
  if (a.validTill !== b.validTill) out.push(`Valid till: ${a.validTill} → ${b.validTill}`);
  if (a.terms.applyOffers !== b.terms.applyOffers) out.push(b.terms.applyOffers ? "Live offers now apply on top" : "Prices are now final — offers do not apply on top");
  return out;
}

/** What a customer asked for, one short line each, against the version it was asked on. */
export function askLines(r: Pick<EstimateChangeRequest, "asks" | "terms">, on: EstimateVersion | undefined): string[] {
  const out: string[] = [];
  const m = (n: number) => `${on?.currency ?? "NPR"} ${Math.round(n).toLocaleString("en-US")}`;
  for (const a of r.asks) {
    if (a.action === "add") {
      out.push(`Add ${nameOf(a.itemId)}: ${a.qty}${a.note?.trim() ? ` — “${a.note.trim()}”` : ""}`);
      continue;
    }
    const was = on?.lines.find((l) => l.id === a.lineId);
    const name = was ? lineName(was) : "a line";
    if (a.action === "remove") {
      out.push(`Remove ${name}`);
      continue;
    }
    if (a.qty !== undefined && a.qty !== was?.qty) out.push(`${name}: quantity ${a.qty}${was ? ` (was ${was.qty})` : ""}`);
    if (a.rate !== undefined && a.rate !== was?.rate) out.push(`${name}: price ${m(a.rate)}${was ? ` (was ${m(was.rate)})` : ""}`);
    if (a.discountPct !== undefined && a.discountPct !== was?.discountPct) out.push(`${name}: discount ${a.discountPct}%${was ? ` (was ${was.discountPct}%)` : ""}`);
    const free = was && on ? freeQtyOf(on.lines, was.id) : 0;
    if (a.freeQty !== undefined && a.freeQty !== free) out.push(`${name}: ${a.freeQty} free${was ? ` (was ${free})` : ""}`);
    if (a.note !== undefined && a.note.trim() !== (was?.note ?? "").trim()) out.push(`${name}: “${a.note.trim()}”`);
  }
  const t = r.terms;
  if (t.paymentNote !== undefined) out.push(`Payment: ${t.paymentNote}`);
  if (t.deliveryTerms !== undefined) out.push(`Delivery: ${t.deliveryTerms}`);
  if (t.deliverBy !== undefined) out.push(`Deliver by ${t.deliverBy ?? "any date"}`);
  if (t.validTill !== undefined) out.push(`Keep the offer open till ${t.validTill}`);
  return out;
}

// ── One table that is both the offer and what moved in it ───────────────────
//
// A reader finds a change where the number is, not in a sentence beside the table: every screen that shows a version
// (the desk, the dealer portal) draws these rows — the current value, and the earlier one only where it differs.

export type LineView = {
  /** The line in this version; for a removed line, the line as it was. */
  line: OrderLine;
  state: "same" | "changed" | "new" | "removed";
  /** Free units that come with it in this version. */
  free: number;
  /** The earlier values, only where they differ. `price` is the unit price after the discount. */
  was: { qty?: number; rate?: number; discountPct?: number; discountAmt?: number; price?: number; free?: number };
};

/** A version's paid lines read against the version before it (none = the first version: nothing is marked). */
export function compareVersion(v: Pick<EstimateVersion, "lines">, prev?: Pick<EstimateVersion, "lines">): LineView[] {
  const now = paid(v.lines);
  if (!prev) return now.map((line) => ({ line, state: "same", free: freeQtyOf(v.lines, line.id), was: {} }));
  const before = paid(prev.lines);
  const rows: LineView[] = now.map((line) => {
    const free = freeQtyOf(v.lines, line.id);
    const old = twin(line, before);
    if (!old) return { line, state: "new", free, was: {} };
    const was: LineView["was"] = {};
    if (old.qty !== line.qty) was.qty = old.qty;
    if (old.rate !== line.rate) was.rate = old.rate;
    if (old.discountPct !== line.discountPct) was.discountPct = old.discountPct;
    if ((old.discountAmt ?? 0) !== (line.discountAmt ?? 0)) was.discountAmt = old.discountAmt ?? 0;
    if (Math.round(unitNet(old) * 100) !== Math.round(unitNet(line) * 100)) was.price = unitNet(old);
    const oldFree = freeQtyOf(prev.lines, old.id);
    if (oldFree !== free) was.free = oldFree;
    return { line, state: Object.keys(was).length ? "changed" : "same", free, was };
  });
  for (const old of before) if (!twin(old, now)) rows.push({ line: old, state: "removed", free: freeQtyOf(prev.lines, old.id), was: {} });
  return rows;
}

/** What the customer wants different on one line. */
export type AskView = { qty?: number; rate?: number; discountPct?: number; free?: number; note?: string; remove?: boolean };

/**
 * Everything asked on one version, folded per line (a later request overrides an earlier one on the same line), so it
 * can be shown on the line it is about. `open` = only what no later version has answered yet.
 */
export function asksOn(e: Estimate, versionNo: number, open = false) {
  const requests = offerOf(e).requests.filter((r) => r.onVersion === versionNo && (!open || r.answeredVersion === null));
  const on = offerOf(e).versions.find((v) => v.no === versionNo);
  const byLine = new Map<string, AskView>();
  const added: { itemId: string; qty: number; note?: string }[] = [];
  let terms: EstimateChangeRequest["terms"] = {};
  for (const r of requests) {
    for (const a of r.asks) {
      if (a.action === "add") added.push({ itemId: a.itemId, qty: a.qty, note: a.note });
      else if (a.action === "remove") byLine.set(a.lineId, { remove: true });
      else {
        // A value asked for that the version already has is not a change: it is left out, so nothing reads "asked 0%".
        const l = on?.lines.find((x) => x.id === a.lineId);
        const differs = <K extends "qty" | "rate" | "discountPct">(k: K) => a[k] !== undefined && a[k] !== l?.[k];
        byLine.set(a.lineId, {
          ...byLine.get(a.lineId),
          remove: undefined,
          ...(differs("qty") ? { qty: a.qty } : {}),
          ...(differs("rate") ? { rate: a.rate } : {}),
          ...(differs("discountPct") ? { discountPct: a.discountPct } : {}),
          ...(a.freeQty !== undefined && a.freeQty !== (on && l ? freeQtyOf(on.lines, l.id) : -1) ? { free: a.freeQty } : {}),
          ...(a.note ? { note: a.note } : {}),
        });
      }
    }
    terms = { ...terms, ...r.terms };
  }
  return { requests, byLine, added, terms, messages: requests.filter((r) => r.message).map((r) => ({ byName: r.byName, at: r.at, text: r.message })) };
}

/** The steps of the back-and-forth, in order: each version, then what was asked on it. */
export type Round = { kind: "version"; version: EstimateVersion } | { kind: "request"; request: EstimateChangeRequest };
export function roundsOf(e: Estimate): Round[] {
  const o = offerOf(e);
  return o.versions.flatMap((version): Round[] => [{ kind: "version", version }, ...o.requests.filter((r) => r.onVersion === version.no).map((request): Round => ({ kind: "request", request }))]);
}

// ── A new estimate started from somewhere else ──────────────────────────────

/**
 * What a new estimate should open with when another screen started it (an opportunity in Sales force). The lines do
 * not fit in a URL, so the starter leaves them here and the form takes them once; the customer, rep and opportunity
 * also travel in the URL (`?cust=&rep=&opportunity=`) so a reload still knows whose estimate it is.
 */
export type EstimateSeed = { customerId: string; repId?: string | null; opportunity: string | null; deliverBy?: string | null; lines: { itemId: string; qty: number; rate?: number; note?: string }[] };
export const estimateSeed: { current: EstimateSeed | null } = { current: null };
