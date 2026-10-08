import * as React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { Archive, ArrowRightLeft, Ban, ChevronRight, CircleCheck, CircleX, Copy, ListTree, MessageSquare, Pencil, Send, ShieldCheck, Target, Trash2, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Checkbox, Chip, CountMark, Dialog, DocLink, Field, GHOST, GHOST_SM, INPUT, Kbd, MenuItem, MenuSep, NUM, Refusal, Select, TEXTAREA } from "./bzw";
import { Amount, CUSTOMERS, LOCATIONS, ME, PEOPLE, TODAY, addDays, customerById, daysBetween, fmtQty, fmtShort, itemById, lineNet, locationById, personById, termById, totalsOf, useKeys } from "./orders";
import type { Customer, OrderLine } from "./orders";
import { SUBSIDIARIES, levelRate, subsidiaryById } from "./master";
import { Cell, Dual, NoteFoot, ReasonDialog, WorkflowActions, useLifecycle } from "./parts";
import { ActivityList, Block, CustomerTitle, DetailsBlock, LinesTable, MoneyList, Moved, RecordSections, RecordShell, StepCard, totalsRows } from "./record";
import { DateCell, DocDesk, ExpandLines, PanelCtx } from "./DocDesk";
import {
  SalesNav,
  ESTIMATE_LABEL,
  ESTIMATE_STATUSES,
  ESTIMATE_TONE,
  Estimate,
  addEstimate,
  approveEstimate,
  attachEstimate,
  cancelEstimate,
  deleteEstimate,
  estimateNeedsMe,
  estimateStage,
  ev,
  hrefFor,
  isExpired,
  moveEstimate,
  noteEstimate,
  orderedQty,
  ordersFrom,
  rejectEstimate,
  updateEstimate,
  useSales,
} from "./flow";
import { ComposerResult, OrderComposer, itemSeedKey, readItemSeed } from "./OrderComposer";
import type { LineHint } from "./OrderComposer";
// A new document started from an item (masters spec 3.6 / 5, B-F1) is dated on the masters' clock.
import { MASTERS_TODAY } from "../masters/seed/currencies";
import {
  DEFAULT_OFFER_TERMS,
  OFFER_LABEL,
  OFFER_TONE,
  acceptEstimateOffer,
  applyChangeRequest,
  asksOn,
  changedSinceSent,
  compareVersion,
  declineEstimateOffer,
  diffVersions,
  estimateSeed,
  freeQtyOf,
  isChargeLine,
  isFreeLine,
  latestVersion,
  lineName,
  linkAcceptedOrder,
  offerClock,
  offerOf,
  offerReading,
  openRequests,
  roundsOf,
  sendEstimate,
  sentLine,
} from "./estimate-offer";
import type { EstimateOffer, EstimateSeed, OfferReading, OfferTerms } from "./estimate-offer";

// ════════════════════════════════════════════════════════════════════════════
// ESTIMATES — the start of the flow
//
// An estimate is read by one question: will it become an order? The queue is
// its pipeline, and the record's next step is Convert to order, which opens
// the SAME composer as a new order pre-filled with whatever has not been
// ordered yet (one estimate can be ordered in parts). "Ordered" is never a
// button — it is what an order made from it says.
//
// Two readings sit side by side and are never merged: the rep's PIPELINE
// status and likelihood (their judgement, edited in place), and the derived
// stage (approval · open · partly ordered · ordered). Valid till is the date
// the prices stop holding — past it, the estimate says so before it converts.
//
// An estimate is also what the customer ANSWERS (estimate-offer.ts): it is
// sent, each send is a kept version, and the customer accepts, declines or
// asks for changes. The estimate's own lines stay the working copy — an edit
// reaches the customer only when the next version is sent — so the record's
// next step reads where it stands with the customer before anything else.
// ════════════════════════════════════════════════════════════════════════════

const BASE = "/design/sales/estimates";

/** A Sales force opportunity opens there. The desk knows the address, never the module. */
const opportunityHref = (id: string) => (/^OPP-/.test(id) ? `/design/salesforce/opportunities/${id}` : null);

/** Where the estimate stands with the customer. Until it is sent it reads as it always did. */
const standing = (e: Estimate): OfferReading => (latestVersion(e) ? offerReading(e) : "not-sent");
const STANDINGS: OfferReading[] = ["not-sent", "sent", "changes-requested", "accepted", "declined", "expired"];
function standingWords(e: Estimate) {
  const s = standing(e);
  if (s === "not-sent") return null;
  if (s === "sent") return `Sent v${latestVersion(e)!.no}`;
  if (s === "declined" && offerOf(e).declined?.by === "us") return "Closed as lost";
  return OFFER_LABEL[s];
}

/** "2026-09-04 14:10", the way the desk writes a moment. */
const whenOf = (at: string) => `${fmtShort(at.slice(0, 10))}, ${at.slice(11, 16)}`;

const isFree = (l: OrderLine) => isFreeLine(l) || (l.rate === 0 && !isChargeLine(l));
/** Free goods sit right under the paid line they come with. */
function inOrder(lines: OrderLine[]) {
  const tied = lines.filter((l) => l.freeOf && lines.some((p) => p.id === l.freeOf));
  return lines.filter((l) => !tied.includes(l)).flatMap((l) => [l, ...tied.filter((f) => f.freeOf === l.id)]);
}
const notSent = (terms: OfferTerms): EstimateOffer => ({ status: "not-sent", terms, versions: [], requests: [], accepted: null, declined: null });

/** The lines another screen handed over, as the composer's seed: the rate it named, else the item's. */
const seedLines = (s: EstimateSeed, c: Customer | undefined): OrderLine[] =>
  s.lines.flatMap((l, i) => {
    const it = itemById(l.itemId);
    return it && l.qty > 0 ? [{ id: `seed-${i}`, itemId: it.id, qty: l.qty, rate: l.rate ?? it.rate, discountPct: 0, tax: c?.taxCode ?? it.tax, unit: it.unit, note: l.note, custom: {}, delivered: 0, invoiced: 0 }] : [];
  });

export function EstimatesDesk() {
  const { estimates, orders } = useSales();
  const navigate = useNavigate();
  const { no: openNo } = useParams();
  const [search] = useSearchParams();
  const rows = React.useMemo(() => [...estimates].sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no)), [estimates]);
  const stage = (e: Estimate) => estimateStage(orders, e);
  const value = (e: Estimate) => totalsOf(e.lines).total;
  const isOpen = (e: Estimate) => ["open", "partly"].includes(stage(e));
  /** The customer asked for changes: the next move is ours. */
  const asked = (e: Estimate) => isOpen(e) && offerOf(e).status === "changes-requested";
  const weighted = rows.filter(isOpen).reduce((s, e) => s + value(e) * e.exchangeRate * (e.probability / 100), 0);

  // A new estimate another screen started (`estimateSeed`): its lines are taken ONCE and held only while that form
  // is open, so the next plain "New estimate" starts empty.
  const [handed, setHanded] = React.useState<EstimateSeed | null>(null);
  const given = estimateSeed.current ?? handed;
  React.useEffect(() => {
    const s = estimateSeed.current;
    estimateSeed.current = null;
    if (openNo !== "new") setHanded(null);
    else if (s) setHanded(s);
  });

  const fields = (r: ComposerResult) => ({
    subsidiaryId: r.subsidiaryId,
    customerId: r.customerId,
    date: r.date,
    validTill: r.validTill,
    expectedClose: r.expected,
    status: r.status as Estimate["status"],
    probability: r.probability,
    repId: r.repId ?? ME.id,
    locationId: r.locationId,
    termId: r.termId,
    currency: r.currency,
    exchangeRate: r.exchangeRate,
    memo: r.memo,
    // A free line is tied to its paid line: once that line is gone, or the free one is given a price, the tie goes too.
    lines: r.lines.map((l) => (l.freeOf && (l.rate > 0 || !r.lines.some((p) => p.id === l.freeOf)) ? { ...l, freeOf: undefined } : l)),
    dims: r.dims,
    custom: r.custom,
    attachments: r.attachments,
  });

  const composeNew = (ctx: PanelCtx) => {
    const copy = search.get("copy");
    const src = copy ? estimates.find((e) => e.no === copy) : undefined;
    const itemSeed = src ? null : readItemSeed(search);
    // Started from an opportunity: `?cust=&rep=&opportunity=` say whose estimate it is (a reload still knows), the
    // lines are handed over.
    const plain = !src && !itemSeed;
    const urlCust = search.get("cust");
    const start = plain && given && (!urlCust || urlCust === given.customerId) ? given : null;
    const cust = plain ? customerById(urlCust ?? start?.customerId) : undefined;
    const rep = search.get("rep") ?? start?.repId;
    const repId = rep && personById(rep) ? rep : cust?.repId;
    const opportunity = plain ? search.get("opportunity") ?? start?.opportunity ?? null : null;
    const oppHref = opportunity ? opportunityHref(opportunity) : null;
    // The terms a copy starts from, or the delivery date the customer asked for: the Send dialog opens with them.
    const terms = start?.deliverBy ? { ...DEFAULT_OFFER_TERMS, deliverBy: start.deliverBy } : src?.offer ? { ...src.offer.terms } : null;
    return (
      <OrderComposer
        key={src ? `copy-${src.no}` : `new${itemSeedKey(itemSeed)}${cust?.id ?? ""}${repId ?? ""}${opportunity ?? ""}${start ? "-lines" : ""}`}
        // Answering a customer is dated on the clock the offer rules run on, so "valid till" and "expired" agree with it.
        today={src ? undefined : cust || opportunity ? offerClock.today() : MASTERS_TODAY}
        itemSeed={itemSeed}
        noun="estimate"
        title={src ? `Copy of ${src.no}` : "New estimate"}
        source={src ? { no: src.no, label: "Copied from" } : opportunity ? { no: opportunity, label: "Opportunity" } : undefined}
        draft={!src}
        seed={
          src
            ? {
                ...src,
                date: TODAY,
                validTill: null,
                expected: src.expectedClose,
                attachments: [],
                lines: src.lines.map((l, i) => ({ ...l, id: `ce-${i}`, freeOf: l.freeOf ? `ce-${src.lines.findIndex((p) => p.id === l.freeOf)}` : undefined })),
              }
            : cust
              ? { customerId: cust.id, repId, termId: cust.termId, currency: cust.currency, lines: start ? seedLines(start, cust) : undefined }
              : {}
        }
        primaryLabel="Create estimate"
        orders={orders}
        onCancel={(kept) => {
          setHanded(null);
          if (oppHref) return navigate(oppHref);
          ctx.go(src ? src.no : null);
          if (kept) ctx.show("info", "Draft kept", { label: "Resume", run: () => ctx.go("new") });
        }}
        onSave={(r) => {
          const discounted = r.lines.some((l) => l.discountPct > 5);
          const no = addEstimate({
            ...fields(r),
            opportunity,
            approval: discounted ? { state: "pending", stateName: "Manager review", approverId: ME.id, since: TODAY } : { state: "approved", byId: ME.id, on: TODAY },
            closed: null,
            cancelled: null,
            ...(terms ? { offer: notSent(terms) } : {}),
          });
          if (r.notes.length) updateEstimate(no, (e) => ({ ...e, comments: r.notes }));
          if (opportunity) updateEstimate(no, (e) => ({ ...e, history: [ev(`created the estimate from ${opportunity}`)] }));
          setHanded(null);
          ctx.go(no);
          ctx.show("success", discounted ? `${no} created · sent to Manager review` : `${no} created`);
        }}
      />
    );
  };

  return (
    <DocDesk<Estimate>
      section="sales/estimates"
      nav={<SalesNav current="estimates" />}
      noun={["estimate", "estimates"]}
      rows={rows}
      noOf={(e) => e.no}
      dateOf={(e) => e.date}
      searchText={(e) => `${e.no} ${customerById(e.customerId)?.name} ${e.status} ${e.opportunity ?? ""} ${e.lines.map((l) => itemById(l.itemId)?.name).join(" ")}`}
      stats={[
        { label: "Open value", value: <Amount value={rows.filter(isOpen).reduce((s, e) => s + value(e) * e.exchangeRate, 0)} currency="NPR" /> },
        { label: "Weighted", value: <Amount value={weighted} currency="NPR" />, title: "Open value × each estimate's likelihood" },
      ]}
      picks={[
        { key: "mine", label: "Needs you", value: rows.filter(estimateNeedsMe).length, test: estimateNeedsMe },
        { key: "asked", label: "Changes asked", value: rows.filter(asked).length, test: asked, title: "The customer asked for changes — the next version is ours to send" },
        { key: "expiring", label: "Expiring this week", value: rows.filter((e) => isOpen(e) && !!e.validTill && daysBetween(TODAY, e.validTill) >= 0 && daysBetween(TODAY, e.validTill) <= 7).length, test: (e) => isOpen(e) && !!e.validTill && daysBetween(TODAY, e.validTill) >= 0 && daysBetween(TODAY, e.validTill) <= 7 },
        { key: "expired", label: "Expired", value: rows.filter((e) => isOpen(e) && isExpired(e)).length, test: (e) => isOpen(e) && isExpired(e), title: "Still open, but the prices no longer hold" },
      ]}
      views={[
        {
          key: "state",
          label: "Pipeline",
          icon: ListTree,
          groups: (es) => [
            { key: "mine", label: "Needs your approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: es.filter(estimateNeedsMe) },
            { key: "approval", label: "Waiting for approval", rows: es.filter((e) => stage(e) === "approval" && !estimateNeedsMe(e)) },
            // Waiting on us, whatever the rep's pipeline status says: these rows leave their status band until answered.
            { key: "asked", label: "Customer asked for changes", icon: <MessageSquare size={12} className="text-bz-text-muted" />, rows: es.filter(asked) },
            ...ESTIMATE_STATUSES.map((st) => {
              const r = es.filter((e) => stage(e) === "open" && e.status === st && !asked(e));
              return { key: st, label: st, rows: r, right: r.length ? <Amount value={r.reduce((s, e) => s + value(e) * e.exchangeRate, 0)} currency="NPR" /> : undefined };
            }),
            { key: "partly", label: "Partly ordered", rows: es.filter((e) => stage(e) === "partly" && !asked(e)) },
            { key: "ordered", label: "Ordered", collapsed: true, rows: es.filter((e) => stage(e) === "ordered") },
            { key: "closed", label: "Closed, rejected & cancelled", collapsed: true, rows: es.filter((e) => ["closed", "cancelled", "rejected"].includes(stage(e))) },
          ],
        },
        {
          key: "rep",
          label: "By rep",
          icon: Users,
          groups: (es) => PEOPLE.map((p) => ({ key: p.id, label: p.name, rows: es.filter((e) => e.repId === p.id) })),
        },
      ]}
      filters={[
        ...SUBSIDIARIES.map((s) => ({ value: `sub:${s.id}`, label: s.name, group: "Subsidiary", test: (e: Estimate) => e.subsidiaryId === s.id })),
        ...LOCATIONS.map((l) => ({ value: `loc:${l.id}`, label: l.name, group: "Location", test: (e: Estimate) => e.locationId === l.id })),
        ...ESTIMATE_STATUSES.map((st) => ({ value: `ps:${st}`, label: st, group: "Pipeline status", test: (e: Estimate) => e.status === st })),
        { value: "st:open", label: "Open", group: "Stage", test: (e: Estimate) => stage(e) === "open" },
        { value: "st:partly", label: "Partly ordered", group: "Stage", test: (e: Estimate) => stage(e) === "partly" },
        { value: "st:ordered", label: "Ordered", group: "Stage", test: (e: Estimate) => stage(e) === "ordered" },
        { value: "st:closed", label: "Closed or cancelled", group: "Stage", test: (e: Estimate) => ["closed", "cancelled"].includes(stage(e)) },
        { value: "ap:pending", label: "Pending approval", group: "Approval", test: (e: Estimate) => e.approval.state === "pending" },
        { value: "ap:rejected", label: "Sent back", group: "Approval", test: (e: Estimate) => e.approval.state === "rejected" },
        ...STANDINGS.map((s) => ({ value: `of:${s}`, label: OFFER_LABEL[s], group: "Sent to customer", test: (e: Estimate) => standing(e) === s })),
        ...PEOPLE.map((p) => ({ value: `rep:${p.id}`, label: p.name, group: "Sales rep", test: (e: Estimate) => e.repId === p.id })),
        ...CUSTOMERS.map((c) => ({ value: `cus:${c.id}`, label: c.name, hint: c.code, group: "Customer", test: (e: Estimate) => e.customerId === c.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (e) => e.date + e.no, desc: true },
        { key: "valid", label: "Valid till", by: (e) => e.validTill ?? "9999" },
        { key: "close", label: "Expected close", by: (e) => e.expectedClose ?? "9999" },
        { key: "val", label: "Value", by: (e) => value(e) * e.exchangeRate, desc: true },
        { key: "prob", label: "Likelihood", by: (e) => e.probability, desc: true },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (e) => <DateCell iso={e.date} /> },
        { key: "valid", label: "Valid till", width: "92px", render: (e) => <ValidMark e={e} open={isOpen(e)} /> },
        { key: "rep", label: "Rep", width: "24px", render: (e) => <Avatar person={personById(e.repId)} size={20} /> },
        { key: "state", label: "Stage", width: "116px", render: (e) => <StageChip e={e} stage={stage(e)} /> },
      ]}
      primary={(e) => {
        const words = standingWords(e);
        return { title: customerById(e.customerId)!.name, sub: <>{e.status} · {e.probability}%{words && <> · {words}</>}</>, subOnDesktop: true };
      }}
      amount={(e) => ({ value: <Amount value={value(e)} currency={e.currency !== "NPR" ? e.currency : undefined} />, sub: `${e.lines.length} line${e.lines.length === 1 ? "" : "s"}` })}
      rowVerb={(e) =>
        asked(e)
          ? { label: "Review", icon: MessageSquare, run: () => navigate(`${BASE}/${e.no}`) }
          : isOpen(e)
            ? { label: "Convert", icon: ArrowRightLeft, run: () => navigate(`/design/sales/orders/new?estimate=${e.no}`) }
            : estimateNeedsMe(e)
              ? { label: "Review", icon: ShieldCheck, run: () => navigate(`${BASE}/${e.no}`) }
              : null
      }
      renderExpand={(e) => (
        <ExpandLines
          rows={inOrder(e.lines).map((l) => ({
            name: lineName(l),
            note: [isFree(l) && "Free", orderedQty(orders, e, l) ? `${fmtQty(orderedQty(orders, e, l))} ordered` : null].filter(Boolean).join(" · ") || undefined,
            qty: `${fmtQty(l.qty)} ${l.unit ?? itemById(l.itemId)!.unit}`,
            amount: <Amount value={lineNet(l)} />,
          }))}
        />
      )}
      bulk={[
        {
          label: "Approve",
          icon: ShieldCheck,
          enabled: (es) => es.some(estimateNeedsMe),
          run: (es) => {
            const skipped: string[] = [];
            let done = 0;
            es.forEach((e) => (estimateNeedsMe(e) ? (approveEstimate(e.no), done++) : skipped.push(`${e.no} isn't waiting on you`)));
            return { done, skipped, verb: "approved" };
          },
        },
      ]}
      onDelete={(es) => {
        const skipped: string[] = [];
        let done = 0;
        es.forEach((e) => (ordersFrom(orders, e).length ? skipped.push(`${e.no} has orders made from it`) : (deleteEstimate(e.no), done++)));
        return { done, skipped };
      }}
      newLabel="New estimate"
      onNew={() => navigate(`${BASE}/new`)}
      renderNew={composeNew}
      renderPanel={(e, ctx) =>
        ctx.mode === "edit" ? (
          <OrderComposer
            key={`edit-${e.no}`}
            noun="estimate"
            title={`Edit ${e.no}`}
            seed={{ ...e, expected: e.expectedClose }}
            lineHints={editHints(e)}
            notice={<Answering e={e} />}
            editing={{ approved: e.approval.state === "approved", baseTotal: value(e), hasProgress: ordersFrom(orders, e).length > 0 }}
            lockSubsidiary
            primaryLabel="Save changes"
            orders={orders}
            onCancel={() => ctx.go(e.no)}
            onSave={(r) => {
              const resubmit = e.approval.state === "rejected";
              updateEstimate(e.no, (x) => ({ ...x, ...fields(r), comments: [...x.comments, ...r.notes], approval: resubmit ? { state: "pending", stateName: "Manager review", approverId: ME.id, since: TODAY } : x.approval }), resubmit ? "revised it and sent it to Manager review" : "edited the estimate");
              ctx.go(e.no);
              ctx.show("success", `${e.no} saved`);
            }}
          />
        ) : (
          <EstimatePanel key={e.no} e={e} ctx={ctx} />
        )
      }
    />
  );
}

function StageChip({ e, stage }: { e: Estimate; stage: ReturnType<typeof estimateStage> }) {
  return <Chip tone={ESTIMATE_TONE[stage]}>{stage === "approval" && e.approval.state === "pending" ? e.approval.stateName : ESTIMATE_LABEL[stage]}</Chip>;
}

function ValidMark({ e, open }: { e: Estimate; open: boolean }) {
  if (!e.validTill) return <span className="text-bz-text-soft">—</span>;
  const d = daysBetween(TODAY, e.validTill);
  if (open && d < 0) return <span className="font-semibold text-bz-amber">Expired</span>;
  return <span className={cn(NUM, open && d <= 3 ? "text-bz-text" : "text-bz-text-muted")}>{d === 0 && open ? "Today" : fmtShort(e.validTill)}</span>;
}

function EstimatePanel({ e, ctx }: { e: Estimate; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const { orders } = useSales();
  const life = useLifecycle(e.no);
  const [dialog, setDialog] = React.useState<null | "send" | "accept" | "decline" | "lose">(null);
  const customer = customerById(e.customerId)!;
  const stage = estimateStage(orders, e);
  const made = ordersFrom(orders, e);
  const t = totalsOf(e.lines);
  const open = stage === "open" || stage === "partly";
  const expired = open && isExpired(e);
  const convert = () => navigate(`/design/sales/orders/new?estimate=${e.no}`);
  const convertLabel = stage === "partly" ? "Order the rest" : "Convert to order";

  const offer = offerOf(e);
  const last = latestVersion(e);
  const reading = standing(e);
  const asks = openRequests(e);
  const changed = changedSinceSent(e);
  const accepted = offer.status === "accepted";
  /** The customer still owes an answer. */
  const waiting = !e.cancelled && (offer.status === "sent" || offer.status === "changes-requested");
  const canSend = open && !accepted;
  // What the customer accepted is what gets ordered: an accepted estimate is copied, not edited.
  const canEdit = !e.cancelled && stage !== "ordered" && !accepted;
  const sendLabel = last ? `Send version ${last.no + 1}` : "Send to customer";
  const oppHref = e.opportunity ? opportunityHref(e.opportunity) : null;

  useKeys({
    o: () => open && !dialog && convert(),
    e: () => canEdit && !dialog && ctx.go(e.no, { do: "edit" }),
  });

  // Accepted with no order tied yet (Convert to order made it): the card names the order from then on.
  const orderToLink = offer.accepted && !offer.accepted.orderNo ? made[0]?.no : undefined;
  React.useEffect(() => {
    if (orderToLink) linkAcceptedOrder(e.no, orderToLink);
  }, [e.no, orderToLink]);

  /** Everything the customer asked for, put on the working copy — then the form opens so we adjust it and save. */
  const applyAsked = () => {
    const level = customer.priceLevel !== "Standard" ? customer.priceLevel : undefined;
    const next = asks.reduce<Estimate>((cur, r) => {
      const a = applyChangeRequest(cur, r, (id) => levelRate(itemById(id)?.rate ?? 0, level));
      return { ...cur, lines: a.lines, validTill: a.validTill, offer: { ...offerOf(cur), terms: a.terms } };
    }, e);
    updateEstimate(e.no, (x) => ({ ...x, lines: next.lines, validTill: next.validTill, offer: next.offer }), "applied the changes the customer asked for");
    ctx.go(e.no, { do: "edit" });
  };

  const close = (by: "customer" | "us", reason: string) => {
    const r = declineEstimateOffer(e.no, by === "customer" ? { by, via: "office", byName: customer.name, reason } : { by, byName: ME.name, reason });
    if (r.ok === false) ctx.show("error", r.refusal);
    else ctx.show("info", by === "customer" ? `${e.no} declined` : `${e.no} closed`);
  };

  const sendButton = (primary: boolean) => (
    <button type="button" className={primary ? cn(BTN, "h-8") : GHOST_SM} onClick={() => setDialog("send")}>
      <Send size={primary ? 13 : 12} /> {sendLabel}
    </button>
  );
  const convertButton = (primary: boolean) => (
    <button type="button" className={primary ? cn(BTN, "h-8") : GHOST_SM} onClick={convert}>
      <ArrowRightLeft size={primary ? 13 : 12} /> {convertLabel} <Kbd>O</Kbd>
    </button>
  );
  let step: React.ReactNode;
  if (stage === "approval" && e.approval.state === "pending") {
    const me = estimateNeedsMe(e);
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        tone={me ? "plain" : "quiet"}
        title={me ? "Waiting on your approval" : `Waiting on ${personById(e.approval.approverId)?.name}`}
        sub={`${e.approval.stateName} · it can't be sent or ordered until approved.`}
        actions={me && <WorkflowActions no={e.no} stateName={e.approval.stateName} onApprove={() => (approveEstimate(e.no), ctx.show("success", `${e.no} approved`))} onReject={(r) => (rejectEstimate(e.no, r), ctx.show("info", `${e.no} sent back`))} onMove={(to) => (moveEstimate(e.no, to), ctx.show("info", `${e.no} moved to ${to}`))} />}
      />
    );
  } else if (stage === "rejected" && e.approval.state === "rejected") {
    step = (
      <StepCard
        tone="danger"
        icon={<Ban size={15} />}
        title={`Sent back by ${personById(e.approval.byId)?.name}`}
        sub={<span className="text-bz-text">“{e.approval.reason}”</span>}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => ctx.go(e.no, { do: "edit" })}>
            <Pencil size={12} /> Revise and resubmit
          </button>
        }
      />
    );
  } else if (e.cancelled) {
    step = <StepCard tone="quiet" icon={<Ban size={15} />} title={`Cancelled · ${fmtShort(e.cancelled.on)}`} sub={`“${e.cancelled.reason}”`} />;
  } else if (offer.accepted) {
    const a = offer.accepted;
    step = (
      <StepCard
        tone="done"
        icon={<CircleCheck size={15} />}
        title={`Accepted · version ${a.version}`}
        sub={`By ${a.byName} on ${fmtShort(a.at.slice(0, 10))} · ${a.via === "portal" ? "on the portal" : "recorded by us"}`}
        actions={
          <>
            {a.orderNo && <DocLink no={a.orderNo} kind="Sales order" onClick={() => navigate(hrefFor(a.orderNo!))} />}
            {open && convertButton(true)}
          </>
        }
      />
    );
  } else if (stage === "ordered") {
    step = <StepCard tone="done" icon={<CircleCheck size={15} />} title={`Ordered as ${made.map((o) => o.no).join(", ")}`} />;
  } else if (e.closed) {
    const d = offer.declined;
    step =
      d?.by === "customer" ? (
        <StepCard tone="quiet" icon={<Archive size={15} />} title={`Declined by ${d.byName} · ${fmtShort(e.closed.on)}`} sub={d.reason ? `“${d.reason}”` : undefined} />
      ) : (
        <StepCard tone="quiet" icon={<Archive size={15} />} title={`Closed as lost · ${fmtShort(e.closed.on)}`} sub={`“${e.closed.reason}”${d ? ` · ${d.byName}` : ""}`} />
      );
  } else if (open && last && reading === "expired") {
    step = (
      <StepCard
        tone="danger"
        icon={<Target size={15} />}
        title={`Version ${last.no} expired · ${fmtShort(last.validTill)}`}
        actions={
          <>
            {asks.length > 0 && !changed && (
              <button type="button" className={GHOST_SM} onClick={applyAsked}>
                <Pencil size={11} /> Apply and edit
              </button>
            )}
            {sendButton(true)}
          </>
        }
      />
    );
  } else if (open && last && offer.status === "changes-requested") {
    step = changed ? (
      <StepCard
        icon={<MessageSquare size={15} />}
        title={<span className="text-bz-amber">Edited since version {last.no}</span>}
        sub="Not sent yet."
        actions={
          <>
            <button type="button" className={GHOST_SM} onClick={() => ctx.go(e.no, { do: "edit" })}>
              <Pencil size={11} /> Edit <Kbd>E</Kbd>
            </button>
            {sendButton(true)}
          </>
        }
      />
    ) : (
      <StepCard
        icon={<MessageSquare size={15} />}
        title={`${asks[asks.length - 1]?.byName ?? customer.name} asked for changes`}
        actions={
          <>
            {sendButton(false)}
            <button type="button" className={cn(BTN, "h-8")} onClick={applyAsked}>
              <Pencil size={12} /> Apply and edit
            </button>
          </>
        }
      />
    );
  } else if (open && last) {
    step = changed ? (
      <StepCard
        icon={<Send size={15} />}
        title={<span className="text-bz-amber">Edited since version {last.no}</span>}
        sub="Not sent yet."
        actions={sendButton(true)}
      />
    ) : (
      <StepCard
        icon={<Send size={15} />}
        title={`Version ${last.no} sent · valid till ${fmtShort(last.validTill)}`}
        sub={`Waiting for ${customer.name}.`}
        actions={
          <>
            <button type="button" className={GHOST_SM} onClick={() => setDialog("decline")}>
              Record declined
            </button>
            <button type="button" className={cn(BTN, "h-8")} onClick={() => setDialog("accept")}>
              <CircleCheck size={13} /> Record accepted
            </button>
          </>
        }
      />
    );
  } else if (stage === "partly") {
    step = (
      <StepCard
        icon={<Target size={15} />}
        tone={expired ? "danger" : "plain"}
        title={expired ? `Expired ${fmtShort(e.validTill!)} — confirm prices before converting` : "Partly ordered"}
        sub={
          <>
            {e.lines.filter((l) => orderedQty(orders, e, l) < l.qty).length} line(s) not ordered yet · on {made.map((o) => o.no).join(", ")}
          </>
        }
        actions={
          <>
            <button type="button" className={GHOST_SM} onClick={() => setDialog("lose")}>
              Close as lost
            </button>
            {convertButton(true)}
          </>
        }
      />
    );
  } else if (open) {
    step = (
      <StepCard
        icon={<Send size={15} />}
        tone={expired ? "danger" : "plain"}
        title="Not sent yet"
        sub={
          e.validTill ? (
            <>
              {expired ? `Expired ${fmtShort(e.validTill)} — confirm prices before converting` : `Valid till ${fmtShort(e.validTill)}`}
              {e.expectedClose && <> · expected to close {fmtShort(e.expectedClose)}</>}
            </>
          ) : (
            "Set a valid-till date when you send it."
          )
        }
        actions={
          <>
            {convertButton(false)}
            {sendButton(true)}
          </>
        }
      />
    );
  } else {
    step = <StepCard tone="quiet" icon={<Archive size={15} />} title={ESTIMATE_LABEL[stage]} />;
  }

  const words = standingWords(e);

  return (
    <RecordShell
      ctx={ctx}
      no={e.no}
      printNo={e.no}
      chips={
        <>
          <StageChip e={e} stage={stage} />
          {/* A declined estimate is closed: the stage chip already says so. */}
          {words && reading !== "declined" && <Chip tone={OFFER_TONE[reading]}>{words}</Chip>}
        </>
      }
      title={<CustomerTitle name={customer.name} onOpen={() => ctx.show("info", `Opens ${customer.name}'s customer record`)} />}
      amount={<Amount value={t.total} currency={e.currency} />}
      meta={[
        <span key="d" className={NUM}>{fmtShort(e.date)}</span>,
        <span key="r" className="inline-flex items-center gap-1.5">
          <Avatar person={personById(e.repId)} size={16} /> {personById(e.repId)?.name}
        </span>,
        <span key="s">{subsidiaryById(e.subsidiaryId).name}</span>,
        e.opportunity ? <DocLink key="o" no={e.opportunity} kind="Opportunity" onClick={() => (oppHref ? navigate(oppHref) : ctx.show("info", `${e.opportunity} opens in CRM`))} /> : null,
      ]}
      menu={(shut) => (
        <>
          <MenuItem icon={Send} disabled={!canSend} onClick={() => (shut(), setDialog("send"))}>
            {sendLabel}…
          </MenuItem>
          <MenuItem icon={ArrowRightLeft} kbd="O" disabled={!open} onClick={() => (shut(), convert())}>
            Convert to order
          </MenuItem>
          <MenuItem icon={Pencil} kbd="E" disabled={!canEdit} hint={accepted ? "Accepted — copy it to change it" : undefined} onClick={() => (shut(), ctx.go(e.no, { do: "edit" }))}>
            Edit estimate
          </MenuItem>
          <MenuItem icon={Copy} onClick={() => (shut(), navigate(`${BASE}/new?copy=${e.no}`))}>
            Copy to new estimate
          </MenuItem>
          <MenuSep />
          <MenuItem
            icon={CircleCheck}
            disabled={!waiting || changed || reading === "expired"}
            hint={!waiting ? undefined : changed ? "Send the new version first" : reading === "expired" ? "Expired — send a new version first" : undefined}
            onClick={() => (shut(), setDialog("accept"))}
          >
            Record accepted…
          </MenuItem>
          <MenuItem icon={CircleX} disabled={!waiting} onClick={() => (shut(), setDialog("decline"))}>
            Record declined…
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Archive} disabled={!open || accepted} onClick={() => (shut(), setDialog("lose"))}>
            Close as lost…
          </MenuItem>
          <MenuItem icon={Ban} disabled={!!e.cancelled || made.length > 0} hint={made.length ? "Has orders — close it instead" : undefined} onClick={() => (shut(), life.open("cancel"))}>
            Cancel estimate…
          </MenuItem>
          <MenuItem icon={Trash2} danger disabled={made.length > 0} onClick={() => (shut(), life.open("delete"))}>
            Delete estimate…
          </MenuItem>
        </>
      )}
      foot={<NoteFoot onSend={(n) => noteEstimate(e.no, n)} />}
    >
      {step}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-bz-line-soft px-5 py-3 text-[11.5px]">
        <span className="inline-flex items-center gap-1.5 text-bz-text-soft">
          Pipeline
          <Select trigger="ghost" className="h-7" label={e.status} value={e.status} disabled={!open} onChange={(v) => (updateEstimate(e.no, (x) => ({ ...x, status: v as Estimate["status"] }), `moved it to ${v}`), ctx.show("success", `Pipeline: ${v}`))} width={230} options={ESTIMATE_STATUSES.map((s) => ({ value: s, label: s }))} />
        </span>
        <span className="inline-flex items-center gap-1.5 text-bz-text-soft">
          Likelihood
          <Select trigger="ghost" className={cn("h-7", NUM)} label={`${e.probability}%`} value={String(e.probability)} disabled={!open} onChange={(v) => updateEstimate(e.no, (x) => ({ ...x, probability: Number(v) }), `set likelihood to ${v}%`)} width={120} options={[10, 25, 50, 60, 70, 80, 90, 100].map((p) => ({ value: String(p), label: `${p}%` }))} />
        </span>
        <span className="text-bz-text-soft">
          Weighted <Amount value={t.total * (e.probability / 100)} className="font-semibold text-bz-text" />
        </span>
      </div>

      <OfferLines e={e} />

      <DetailsBlock
        subsidiaryId={e.subsidiaryId}
        currency={e.currency}
        exchangeRate={e.exchangeRate}
        dates={[
          ["Estimate date", e.date],
          ["Valid till", e.validTill],
          ["Expected close", e.expectedClose],
        ]}
        custom={e.custom}
        dims={e.dims}
        memo={e.memo}
        right={
          canEdit && (
            <button type="button" className={GHOST_SM} onClick={() => ctx.go(e.no, { do: "edit" })}>
              <Pencil size={11} /> Edit <Kbd>E</Kbd>
            </button>
          )
        }
        lead={
          <>
            <Cell label="Customer">
              {customer.name}
              <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
                {customer.isProspect ? "Prospect" : `${customer.code} · PAN ${customer.pan}`} · {customer.priceLevel} prices
              </span>
            </Cell>
            <Cell label="Payment term">
              {termById(e.termId)?.name}
              {offer.terms.paymentNote && <span className="block text-[10.5px] text-bz-text-soft">{offer.terms.paymentNote}</span>}
            </Cell>
            {offer.terms.deliveryTerms && <Cell label="Delivery">{offer.terms.deliveryTerms}</Cell>}
            {offer.terms.deliverBy && (
              <Cell label="Deliver by">
                <Dual iso={offer.terms.deliverBy} />
              </Cell>
            )}
            {last && <Cell label="Offers">{offer.terms.applyOffers ? "Running offers apply on top" : "Prices are final"}</Cell>}
            <Cell label="Would ship from">{locationById(e.locationId)?.name}</Cell>
            <Cell label="Opportunity">
              {!e.opportunity ? (
                <span className="text-bz-text-soft">—</span>
              ) : oppHref ? (
                <Link to={oppHref} className={cn("font-medium text-bz-text underline underline-offset-2", NUM)}>
                  {e.opportunity}
                </Link>
              ) : (
                e.opportunity
              )}
            </Cell>
          </>
        }
      />

      <RecordSections no={e.no} files={e.attachments} onAttach={() => (attachEstimate(e.no), ctx.show("success", "File added"))} onToast={(x) => ctx.show("info", x)} created={e.created} history={e.history} audit={e.audit} />
      <ActivityList comments={e.comments} history={e.history} />

      {dialog === "send" && <SendDialog e={e} onClose={() => setDialog(null)} onSent={(n) => (setDialog(null), ctx.show("success", n === 1 ? `${e.no} sent` : `Version ${n} sent`))} />}
      {dialog === "accept" && <AcceptDialog e={e} name={customer.name} onClose={() => setDialog(null)} onDone={() => (setDialog(null), ctx.show("success", `${e.no} accepted`))} />}
      <ReasonDialog
        open={dialog === "decline"}
        eyebrow={e.no}
        title={`Record ${e.no} as declined?`}
        body="The estimate is closed with the customer's reason."
        confirm="Record declined"
        danger
        onClose={() => setDialog(null)}
        onConfirm={(r) => (setDialog(null), close("customer", r))}
      />
      <ReasonDialog
        open={dialog === "lose"}
        eyebrow={e.no}
        title={`Close ${e.no} as lost?`}
        body="The reason feeds the pipeline report."
        confirm="Close as lost"
        danger
        onClose={() => setDialog(null)}
        onConfirm={(r) => (setDialog(null), close("us", r))}
      />
      {life.dialogs({
        onCancel: (r) => (cancelEstimate(e.no, r), ctx.show("info", `${e.no} cancelled`)),
        onDelete: () => (deleteEstimate(e.no), ctx.go(null), ctx.show("info", `${e.no} deleted`)),
      })}
    </RecordShell>
  );
}

// ── Editing an estimate the customer has already seen ───────────────────────

/**
 * What each line of the working copy is read against in the form: the line as the customer last saw it, and what the
 * customer asked for on it. The form marks every number that differs and names both under it, so answering a request
 * is done against the request, not from memory.
 */
function editHints(e: Estimate): Record<string, LineHint> | undefined {
  const last = latestVersion(e);
  if (!last) return undefined;
  const asks = asksOn(e, last.no, true);
  const out: Record<string, LineHint> = {};
  for (const l of e.lines) {
    if (l.freeOf) {
      // Free goods are asked for, and were sent, on the paid line they come with.
      const paidNow = e.lines.find((x) => x.id === l.freeOf);
      const paidSent = paidNow ? sentLine(paidNow, last) : undefined;
      const was = paidSent ? freeQtyOf(last.lines, paidSent.id) : 0;
      const ask = paidSent ? asks.byLine.get(paidSent.id) : undefined;
      out[l.id] = { mark: "Free", sent: was > 0 ? { qty: was } : undefined, asked: ask?.free !== undefined ? { qty: ask.free } : undefined };
      continue;
    }
    const sent = sentLine(l, last);
    const ask = sent ? asks.byLine.get(sent.id) : undefined;
    const add = sent ? undefined : asks.added.find((a) => a.itemId === l.itemId);
    out[l.id] = {
      mark: ask?.remove ? "Asked to remove" : !sent ? (add ? "Asked to add" : `New since version ${last.no}`) : undefined,
      markAsked: !!ask?.remove || !!add,
      sent: sent ? { qty: sent.qty, rate: sent.rate, discountPct: sent.discountPct } : undefined,
      asked: ask && !ask.remove ? { qty: ask.qty, rate: ask.rate, discountPct: ask.discountPct } : add ? { qty: add.qty } : undefined,
    };
  }
  return out;
}

/** Above the form's lines: whose request this edit answers, in their words, and what they asked that is not a line. */
function Answering({ e }: { e: Estimate }) {
  const last = latestVersion(e);
  if (!last) return null;
  const asks = asksOn(e, last.no, true);
  const r = asks.requests[asks.requests.length - 1];
  if (!r) return <p className="m-0 text-[11.5px] text-bz-text-soft">Marked: what differs from version {last.no}.</p>;
  // A line the customer wanted off is gone from the form once the request is applied: it is named here instead.
  const removed = [...asks.byLine].filter(([id, a]) => a.remove && !e.lines.some((l) => l.id === id || sentLine(l, last)?.id === id)).map(([id]) => last.lines.find((l) => l.id === id));
  const also = [
    ...removed.filter((l): l is OrderLine => !!l).map((l) => `${lineName(l)} removed`),
    asks.terms.paymentNote && `payment ${asks.terms.paymentNote}`,
    asks.terms.deliveryTerms && `delivery ${asks.terms.deliveryTerms}`,
    asks.terms.deliverBy && `deliver by ${fmtShort(asks.terms.deliverBy)}`,
    asks.terms.validTill && `valid till ${fmtShort(asks.terms.validTill)}`,
  ].filter(Boolean);
  return (
    <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper px-3 py-2.5">
      <p className="m-0 text-[12px] font-medium text-bz-text">
        {r.byName} asked for changes
        <span className={cn("ml-1.5 font-normal text-bz-text-soft", NUM)}>
          version {r.onVersion} · {whenOf(r.at)}
        </span>
      </p>
      {asks.messages.map((m, i) => (
        <p key={i} className="m-0 mt-1 text-[12px] text-bz-text">
          “{m.text}”
        </p>
      ))}
      {also.length > 0 && <p className={cn("m-0 mt-1 text-[11.5px] font-medium text-bz-amber", NUM)}>Also asked: {also.join(" · ")}</p>}
    </div>
  );
}

// ── The lines, and the back-and-forth they went through ─────────────────────

type Step = { kind: "draft" } | { kind: "version"; no: number } | { kind: "request"; id: string };
const sameStep = (a: Step, b: Step) => a.kind === b.kind && (a.kind === "draft" || (a.kind === "version" && b.kind === "version" && a.no === b.no) || (a.kind === "request" && b.kind === "request" && a.id === b.id));

/**
 * One table, one row of steps. The steps are the whole negotiation — each version sent, each thing the customer
 * asked, and the working copy while it differs from what was last sent — and the table is the step that is picked.
 * What moved since the step before is marked on the number itself, and what the customer asked sits under the number
 * it asked about: nobody reads a list of sentences to find a change.
 */
function OfferLines({ e }: { e: Estimate }) {
  const { orders } = useSales();
  const offer = offerOf(e);
  const last = latestVersion(e);
  const made = ordersFrom(orders, e);
  const edited = !!last && changedSinceSent(e) && !offer.accepted;
  const waiting = openRequests(e);
  const newest: Step = !last || edited ? { kind: "draft" } : waiting.length ? { kind: "request", id: waiting[waiting.length - 1].id } : { kind: "version", no: last.no };
  const [picked, setPicked] = React.useState<Step | null>(null);
  // Anything new — a version, a request, an edit — shows itself.
  const moved = `${e.no}:${offer.versions.length}:${offer.requests.length}:${edited}`;
  React.useEffect(() => setPicked(null), [moved]);
  const step = picked ?? newest;

  const request = step.kind === "request" ? offer.requests.find((r) => r.id === step.id) : undefined;
  const v = step.kind === "draft" ? undefined : offer.versions.find((x) => x.no === (step.kind === "version" ? step.no : request?.onVersion));
  const lines = v ? v.lines : e.lines;
  const before = step.kind === "draft" ? last : step.kind === "version" ? offer.versions.find((x) => x.no === step.no - 1) : undefined;
  const asks = request ? asksOn({ ...e, offer: { ...offer, requests: [request] } }, request.onVersion) : null;
  const rows = compareVersion({ lines }, before);
  const t = totalsOf(lines);
  const wasTotal = before ? totalsOf(before.lines).total : undefined;
  const current = sameStep(step, newest);

  const steps: { step: Step; label: string; amount?: number }[] = roundsOf(e).map((r) =>
    r.kind === "version" ? { step: { kind: "version", no: r.version.no }, label: `Version ${r.version.no}`, amount: r.version.total } : { step: { kind: "request", id: r.request.id }, label: "Changes asked" },
  );
  if (last && edited) steps.push({ step: { kind: "draft" }, label: "Not sent", amount: totalsOf(e.lines).total });

  const askedTerms = asks
    ? [asks.terms.paymentNote && `payment ${asks.terms.paymentNote}`, asks.terms.deliveryTerms && `delivery ${asks.terms.deliveryTerms}`, asks.terms.deliverBy && `deliver by ${fmtShort(asks.terms.deliverBy)}`, asks.terms.validTill && `valid till ${fmtShort(asks.terms.validTill)}`].filter(Boolean)
    : [];
  const message = request ? request.message : v?.message;

  return (
    <Block title="Lines" count={rows.filter((x) => x.state !== "removed").length}>
      {steps.length > 1 && (
        <div className="mb-2.5 flex flex-wrap items-center gap-x-1 gap-y-1.5" aria-label="Steps so far">
          {steps.map((x, i) => {
            const on = sameStep(x.step, step);
            return (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={11} className="shrink-0 text-bz-text-soft" aria-hidden />}
                <button
                  type="button"
                  aria-current={on ? "step" : undefined}
                  onClick={() => setPicked(x.step)}
                  className={cn("inline-flex h-6 items-center gap-1.5 rounded-bz-pill border px-2.5 text-[11px] transition-colors", on ? "border-bz-text bg-bz-text font-medium text-bz-surface" : "border-bz-line text-bz-text-muted hover:border-bz-text-soft hover:text-bz-text")}
                >
                  {x.label}
                  {x.amount !== undefined && <span className={cn(NUM, on ? "opacity-70" : "text-bz-text-soft")}>{Math.round(x.amount).toLocaleString("en-US")}</span>}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
      {last && (
        <p className={cn("m-0 mb-2 text-[11px] text-bz-text-soft", NUM)}>
          {request ? `${request.byName} · ${whenOf(request.at)}${request.via === "portal" ? " · on the portal" : ""}` : v ? `Sent ${whenOf(v.at)} by ${v.byName} · valid till ${fmtShort(v.validTill)}` : "Not sent yet"}
          {v && !request && offer.accepted?.version === v.no && " · accepted"}
        </p>
      )}
      {message && <p className="m-0 mb-2 text-[12px] text-bz-text">“{message}”</p>}

      <LinesTable
        rows={rows.map((x) => {
          const l = x.line;
          const ask = asks?.byLine.get(l.id);
          const unit = l.unit ?? itemById(l.itemId)?.unit ?? "";
          const o = orderedQty(orders, e, l);
          const free = x.free > 0 || x.was.free !== undefined;
          return {
            line: l,
            qty: l.qty,
            gone: x.state === "removed",
            name: isChargeLine(l) ? lineName(l) : undefined,
            mark:
              x.state === "new" ? <CountMark>New</CountMark> : x.state === "removed" ? <CountMark>Removed</CountMark> : ask?.remove ? <CountMark>Asked to remove</CountMark> : l.rate === 0 && !isChargeLine(l) ? <CountMark>Free</CountMark> : undefined,
            was: { qty: x.was.qty, rate: x.was.rate, disc: x.was.discountPct !== undefined ? `${x.was.discountPct}%` : undefined },
            asked: ask ? { qty: ask.qty, rate: ask.rate, disc: ask.discountPct !== undefined ? `${ask.discountPct}%` : undefined } : undefined,
            sub: current && made.length ? (o >= l.qty ? "ordered" : o > 0 ? `${fmtQty(o)} of ${fmtQty(l.qty)} ordered` : "not ordered") : undefined,
            detail:
              free || l.note || ask?.free !== undefined || ask?.note ? (
                <p className={cn("m-0 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-bz-text-muted", NUM)}>
                  {free && (
                    <span className={cn(x.free === 0 && "line-through")}>
                      {/* Free goods that were not there before are simply new; a struck "0" would say nothing. */}
                      <Moved was={x.was.free ? fmtQty(x.was.free) : undefined}>
                        <span className={cn(x.was.free === 0 && "rounded-[4px] bg-bz-fire/25 px-1 font-semibold text-bz-text")}>
                          {fmtQty(x.free || x.was.free || 0)} {unit} free
                        </span>
                      </Moved>
                    </span>
                  )}
                  {ask?.free !== undefined && <span className="font-medium text-bz-amber">asked {fmtQty(ask.free)} free</span>}
                  {l.note && <span>Note: {l.note}</span>}
                  {ask?.note && <span className="text-bz-amber">“{ask.note}”</span>}
                </p>
              ) : undefined,
          };
        })}
      />
      {asks && (asks.added.length > 0 || askedTerms.length > 0) && (
        <p className={cn("m-0 mt-2 text-[11.5px] font-medium text-bz-amber", NUM)}>
          {[...asks.added.map((a) => `add ${fmtQty(a.qty)} ${itemById(a.itemId)?.name ?? "an item"}`), ...askedTerms].join(" · ").replace(/^./, (c) => `Asked: ${c}`)}
        </p>
      )}
      <MoneyList
        rows={totalsRows(t, { currency: v?.currency ?? e.currency, exchangeRate: e.exchangeRate }).map((r) =>
          r.strong && wasTotal !== undefined && Math.round(wasTotal) !== Math.round(t.total)
            ? {
                ...r,
                value: (
                  <>
                    <s className="mr-1.5 text-[11px] font-normal text-bz-text-soft">
                      <Amount value={wasTotal} />
                    </s>
                    {r.value}
                  </>
                ),
              }
            : r,
        )}
      />
    </Block>
  );
}

// ── Dialogs ─────────────────────────────────────────────────────────────────

/** Send the estimate as it stands. The terms are set here and nowhere else; a refusal is the rule's own sentence. */
function SendDialog({ e, onClose, onSent }: { e: Estimate; onClose: () => void; onSent: (version: number) => void }) {
  const last = latestVersion(e);
  const n = offerOf(e).versions.length + 1;
  const today = offerClock.today();
  const [message, setMessage] = React.useState("");
  const [validTill, setValidTill] = React.useState(e.validTill && e.validTill >= today ? e.validTill : addDays(today, 14));
  const [terms, setTerms] = React.useState<OfferTerms>(offerOf(e).terms);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const set = (p: Partial<OfferTerms>) => setTerms((x) => ({ ...x, ...p }));
  // What the customer will be told changed: the last version against the working copy as it would be sent now.
  const changes = last ? diffVersions(last, { no: n, at: "", byName: "", message: "", answers: null, validTill, termId: e.termId, currency: e.currency, terms, lines: e.lines, total: totalsOf(e.lines).total }) : [];
  const send = () => {
    const asked = openRequests(e);
    const r = sendEstimate(e.no, { message, validTill, terms: { ...terms, paymentNote: terms.paymentNote.trim(), deliveryTerms: terms.deliveryTerms.trim() }, answers: asked[asked.length - 1]?.id ?? null });
    if (r.ok === false) setRefusal(r.refusal);
    else onSent(r.version.no);
  };
  return (
    <Dialog
      open
      eyebrow={e.no}
      title={last ? `Send version ${n}` : "Send to customer"}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={send}>
            <Send size={13} /> {last ? `Send version ${n}` : "Send"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {refusal && <Refusal text={refusal} onDismiss={() => setRefusal(null)} sticky />}
        {last && changes.length === 0 && <p className="m-0 text-[11.5px] text-bz-amber">Nothing changed since version {last.no}.</p>}
        <Field label="Message to the customer">
          <textarea autoFocus value={message} onChange={(x) => setMessage(x.target.value)} className={cn(TEXTAREA, "min-h-[64px]")} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Valid till" required>
            <input type="date" value={validTill} min={today} onChange={(x) => setValidTill(x.target.value)} className={cn(INPUT, NUM)} />
          </Field>
          <Field
            label={
              <>
                Deliver by <span className="ml-1 font-normal text-bz-text-soft">optional</span>
              </>
            }
          >
            <input type="date" value={terms.deliverBy ?? ""} min={today} onChange={(x) => set({ deliverBy: x.target.value || null })} className={cn(INPUT, NUM)} />
          </Field>
          <Field label="Payment" hint={`What the customer reads. The due date still follows ${termById(e.termId)?.name ?? "the payment term"}.`}>
            <input value={terms.paymentNote} onChange={(x) => set({ paymentNote: x.target.value })} placeholder={termById(e.termId)?.name} className={INPUT} />
          </Field>
          <Field label="Delivery">
            <input value={terms.deliveryTerms} onChange={(x) => set({ deliveryTerms: x.target.value })} placeholder="Delivered to your address" className={INPUT} />
          </Field>
        </div>
        <label className="inline-flex items-center gap-2 text-[12px] text-bz-text">
          <Checkbox on={terms.applyOffers} onChange={(v) => set({ applyOffers: v })} label="Running offers still apply on top of these prices" />
          Running offers still apply on top of these prices
        </label>
      </div>
    </Dialog>
  );
}

/** The customer said yes to us, not on the portal: record it against the version they were shown. */
function AcceptDialog({ e, name, onClose, onDone }: { e: Estimate; name: string; onClose: () => void; onDone: () => void }) {
  const [byName, setByName] = React.useState(name);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const accept = () => {
    const r = acceptEstimateOffer(e.no, { via: "office", byName: byName.trim() || name });
    if (r.ok === false) setRefusal(r.refusal);
    else onDone();
  };
  return (
    <Dialog
      open
      size="sm"
      eyebrow={e.no}
      title={`Record version ${latestVersion(e)?.no ?? 1} as accepted?`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Keep it
          </button>
          <button type="button" className={BTN} onClick={accept}>
            Record accepted
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {refusal && <Refusal text={refusal} onDismiss={() => setRefusal(null)} sticky />}
        <Field label="Who accepted">
          <input autoFocus value={byName} onFocus={(x) => x.currentTarget.select()} onChange={(x) => setByName(x.target.value)} onKeyDown={(x) => x.key === "Enter" && accept()} className={INPUT} />
        </Field>
      </div>
    </Dialog>
  );
}

export { ev };
