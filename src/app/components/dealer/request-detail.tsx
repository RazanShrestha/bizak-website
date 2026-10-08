import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ChevronRight, Gift } from "lucide-react";
import { cn } from "../ui/utils";
import { CARD, DANGER_BTN, Dialog, Field, NUM, TEXTAREA } from "../sales/bzw";
import { acceptEstimateOffer, asksOn, compareVersion, declineEstimateOffer, isChargeLine, lineName, offerOf, requestEstimateChanges, roundsOf } from "../sales/estimate-offer";
import type { AskView, EstimateChangeRequest, EstimateVersion, LineView } from "../sales/estimate-offer";
import { estimatesStore } from "../sales/flow";
import type { Estimate } from "../sales/flow";
import { lineGross, termById, totalsOf } from "../sales/orders";
import { useStore } from "../sales/store";
import { SF_TODAY } from "../salesforce/data";
import { day, daysUntil, npr, productById } from "../salesforce/engine";
import type { Evaluation } from "../salesforce/engine";
import { priceVersion, versionDue } from "../salesforce/estimates";
import { RecordFoot } from "../salesforce/records";
import { customersStore, hubStore, ledgerStore, productsStore, schemesStore, typesStore } from "../salesforce/store";
import { Dot, EmptyNote, Fact, Flag, Money, ProductThumb } from "../salesforce/ui";
import { LIME, PageHead, SOFT } from "./kit";
import { addDays, cap, dpPath, findRequest, notify, useDealer, useDealerRequests } from "./portal";
import type { DealerRequest } from "./portal";
import { AskForm } from "./request-ask";

// ════════════════════════════════════════════════════════════════════════════
// A PRICE REQUEST AND ITS ESTIMATE — the dealer's side of the negotiation
//
// One card, one row of steps. The steps are the whole back-and-forth (you asked
// → version 1 → your changes → version 2); the card is the step that is picked,
// the newest version by default. What moved between two versions is shown IN the
// table — the old value struck out beside the new one — never as sentences next
// to it, and what the dealer asked for sits on the line it asked about.
//
// The estimate is the sales desk's own (owner decision #32): the dealer only
// ever reads a VERSION, and its answers are the desk's rules
// (sales/estimate-offer.ts). Where live offers still apply on top, the figures
// are the engine's, as the order will be billed.
// ════════════════════════════════════════════════════════════════════════════

/** A version priced by the one engine, recounted when a price, an offer or the dealer's balance changes. */
function useVersionPrice(customerId: string, v: EstimateVersion | null | undefined) {
  const schemes = useStore(schemesStore);
  const products = useStore(productsStore);
  const ledger = useStore(ledgerStore);
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const hub = useStore(hubStore);
  // The engine reads these stores itself; they are listed so an edit on the company side recounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => (v ? priceVersion(customerId, v) : null), [customerId, v, schemes, products, ledger, customers, types, hub]);
}

const BACK = "-ml-1 mb-4 inline-flex h-10 items-center gap-1.5 px-1 text-[12px] text-bz-text-muted hover:text-bz-text";
const PAD = "px-4 md:px-5";
/**
 * Item · Qty · Price · Discount · Amount — the one table every step is read in. On a phone there is no room for five
 * columns: the name and the amount stay, and quantity × price · discount go on one line under the name.
 */
const COLS = "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 sm:grid-cols-[minmax(0,1fr)_72px_92px_72px_92px]";
const WIDE = "hidden text-right sm:block";
/** A line's discount as the dealer reads it: a percentage, or an amount off the line. */
const discountOf = (l: { discountPct: number; discountAmt?: number }) => (l.discountAmt ? npr(l.discountAmt) : l.discountPct ? `${l.discountPct}%` : "");

const paymentOf = (v: EstimateVersion) => [termById(v.termId)?.name, v.terms.paymentNote.trim()].filter(Boolean).join(" · ");

/** Which step of the back-and-forth the card shows. */
type Pick = { kind: "ask" } | { kind: "version"; est: string; no: number } | { kind: "request"; est: string; id: string };
const samePick = (a: Pick, b: Pick) => a.kind === b.kind && (a.kind === "ask" || (a.kind === "version" && b.kind === "version" && a.est === b.est && a.no === b.no) || (a.kind === "request" && b.kind === "request" && a.est === b.est && a.id === b.id));

export function RequestDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const s = useDealer();
  const all = useDealerRequests(s.c.id, s.company);
  const [params] = useSearchParams();
  const [asking, setAsking] = React.useState(false);
  const [dialog, setDialog] = React.useState<null | "accept" | "decline">(null);
  const [picked, setPicked] = React.useState<Pick | null>(null);

  const r = findRequest(all, id);
  // Oldest first: an estimate that was declined comes before the fresh one that followed it.
  const ests = r ? [...r.earlier, r.est].filter((e): e is Estimate => !!e).sort((a, b) => (offerOf(a).versions[0]?.at ?? a.date).localeCompare(offerOf(b).versions[0]?.at ?? b.date)) : [];
  const est = r?.est ?? null;
  const latest = est ? (offerOf(est).versions[offerOf(est).versions.length - 1] ?? null) : null;
  const newest: Pick = est && latest ? { kind: "version", est: est.no, no: latest.no } : { kind: "ask" };

  // A link may name an estimate and a version (…/requests/EST-0001?v=1); anything new from the company shows itself.
  const moved = `${est?.no ?? ""}:${est ? offerOf(est).versions.length : 0}:${est ? offerOf(est).requests.length : 0}`;
  React.useEffect(() => {
    const e = ests.find((x) => x.no === (params.get("est") ?? id));
    const no = Number(params.get("v"));
    setPicked(e && no && offerOf(e).versions.some((x) => x.no === no) ? { kind: "version", est: e.no, no } : null);
    setAsking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moved, id]);

  const pick = picked ?? newest;
  const shownEst = pick.kind === "ask" ? null : (ests.find((e) => e.no === pick.est) ?? null);
  const request = pick.kind === "request" && shownEst ? (offerOf(shownEst).requests.find((q) => q.id === pick.id) ?? null) : null;
  const v = shownEst ? (offerOf(shownEst).versions.find((x) => x.no === (pick.kind === "version" ? pick.no : request?.onVersion)) ?? null) : null;
  const prev = shownEst && v && pick.kind === "version" ? offerOf(shownEst).versions.find((x) => x.no === v.no - 1) : undefined;
  const ev = useVersionPrice(s.c.id, v);

  if (!r)
    return (
      <EmptyNote
        action={
          <Link to={dpPath("requests")} className={SOFT}>
            All price requests
          </Link>
        }
      >
        We can't find {id} on your account.
      </EmptyNote>
    );

  const onNewest = samePick(pick, newest);
  const canAnswer = r.toAnswer && onNewest && !!est && !!latest;
  const expired = r.state === "expired" && onNewest && !!est && !!latest;
  const orderNo = (est ? offerOf(est).accepted?.orderNo : null) ?? r.opp?.orderId ?? null;
  const askedToExtend = !!est && !!latest && offerOf(est).requests.some((q) => q.onVersion === latest.no && q.answeredVersion === null && !!q.terms.validTill);

  const steps: { pick: Pick; label: string; amount?: number }[] = [];
  if (r.asked && r.opp?.request) steps.push({ pick: { kind: "ask" }, label: "You asked" });
  for (const e of ests)
    for (const round of roundsOf(e)) {
      const tag = ests.length > 1 ? `${e.no} · ` : "";
      if (round.kind === "version") steps.push({ pick: { kind: "version", est: e.no, no: round.version.no }, label: `${tag}Version ${round.version.no}`, amount: versionDue(s.c.id, round.version) });
      else steps.push({ pick: { kind: "request", est: e.no, id: round.request.id }, label: "Your changes" });
    }

  const accept = () => {
    if (!est) return;
    const res = acceptEstimateOffer(est.no, { via: "portal", byName: s.userName });
    setDialog(null);
    if (res.ok === false) {
      notify(res.refusal, "error");
      return;
    }
    // The order is made as the estimate is accepted (salesforce/estimates.ts), so the estimate names it by now.
    const accepted = estimatesStore.get().find((e) => e.no === est.no)?.offer?.accepted;
    if (!accepted?.orderNo) {
      notify(`Estimate ${est.no} accepted`);
      return;
    }
    notify(hubStore.get().find((h) => h.id === accepted.orderNo)?.status === "review" ? `Order ${accepted.orderNo} sent — ${s.company} approves it first` : `Order ${accepted.orderNo} placed`);
    navigate(dpPath(`orders/${accepted.orderNo}`));
  };

  const extend = () => {
    if (!est) return;
    const till = addDays(SF_TODAY, 7);
    const res = requestEstimateChanges(est.no, { via: "portal", byName: s.userName, message: "This offer ran out. Please keep it open a little longer.", asks: [], terms: { validTill: till } });
    if (res.ok === false) notify(res.refusal, "error");
    else notify(`Asked ${s.company} to keep it open till ${day(till)}`);
  };

  /** What the newest step leaves to do, under the card: the answers, or the one way on. */
  const foot = canAnswer ? (
    <>
      {ev && !ev.credit.ok && ev.credit.reason && (
        <p className="m-0 min-w-0 flex-1 basis-[200px] text-[11.5px] leading-relaxed text-bz-red">
          {ev.credit.reason}. {cap(s.company)} approves the order first.
        </p>
      )}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setDialog("decline")} className={SOFT}>
          Decline
        </button>
        <button type="button" onClick={() => setAsking(true)} className={SOFT}>
          Ask for changes
        </button>
        <button type="button" onClick={() => setDialog("accept")} className={LIME}>
          Accept
        </button>
      </div>
    </>
  ) : !onNewest ? null : r.state === "accepted" && orderNo ? (
    <Link to={dpPath(`orders/${orderNo}`)} className={cn(LIME, "ml-auto")}>
      See order {orderNo}
    </Link>
  ) : expired ? (
    askedToExtend ? (
      <p className="m-0 text-[12px] text-bz-text-muted">You asked {s.company} to keep it open.</p>
    ) : (
      <button type="button" onClick={extend} className={cn(LIME, "ml-auto")}>
        Ask to keep it open
      </button>
    )
  ) : (r.state === "declined" || r.state === "closed") && s.settings.can.rfq ? (
    <Link to={dpPath("requests/new")} className={cn(SOFT, "ml-auto")}>
      Ask for a new price
    </Link>
  ) : null;

  return (
    <>
      <Link to={dpPath("requests")} className={BACK}>
        <ArrowLeft size={14} /> All price requests
      </Link>
      <PageHead
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {r.key} <Dot tone={r.tone}>{r.label}</Dot>
          </span>
        }
        sub={r.asked ? r.title : `From ${s.company}`}
      />

      <div className="max-w-[760px]">
        {steps.length > 1 && (
          <ol className="m-0 mb-4 flex list-none flex-wrap items-center gap-x-1 gap-y-2 p-0" aria-label="Steps so far">
            {steps.map((st, i) => {
              const on = samePick(st.pick, pick);
              return (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={13} className="shrink-0 text-bz-text-soft" aria-hidden />}
                  <button
                    type="button"
                    aria-current={on ? "step" : undefined}
                    onClick={() => (setPicked(st.pick), setAsking(false))}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-bz-pill border px-3 text-[12px] transition-colors",
                      on ? "border-bz-text bg-bz-text font-medium text-bz-surface" : "border-bz-line bg-bz-surface text-bz-text-muted hover:border-bz-text-soft hover:text-bz-text",
                    )}
                  >
                    {st.label}
                    {st.amount !== undefined && <span className={cn(NUM, on ? "opacity-70" : "text-bz-text-soft")}>{npr(st.amount)}</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {pick.kind === "ask" || !shownEst || !v || !ev ? (
          r.opp?.request ? (
            <Asked r={r} />
          ) : (
            <EmptyNote>No estimate yet.</EmptyNote>
          )
        ) : asking && canAnswer ? (
          <AskForm key={`${shownEst.no}-${v.no}`} est={shownEst} v={v} onCancel={() => setAsking(false)} onSent={() => setAsking(false)} />
        ) : (
          <OfferCard est={shownEst} v={v} prev={prev} request={request} ev={ev} live={canAnswer} ranOut={expired} foot={foot} />
        )}
      </div>

      {/* One thread for the whole request: messages written before the estimate existed stay with it. */}
      <RecordFoot recordId={r.est?.no ?? r.opp?.id ?? r.key} recordIds={r.est ? [...(r.opp ? [r.opp.id] : []), ...r.earlier.map((e) => e.no)] : undefined} audience="portal" author={s.userName} className="mt-10 max-w-[760px]" />

      {est && latest && (
        <>
          <Dialog
            open={dialog === "accept" && canAnswer}
            onClose={() => setDialog(null)}
            eyebrow={`Estimate ${est.no}`}
            title={`Accept version ${latest.no}?`}
            size="sm"
            foot={
              <>
                <button type="button" onClick={() => setDialog(null)} className={SOFT}>
                  Not yet
                </button>
                <button type="button" onClick={accept} className={LIME}>
                  Accept and order
                </button>
              </>
            }
          >
            <p className={cn("m-0 flex items-baseline justify-between gap-4 text-[12.5px] text-bz-text", NUM)}>
              It becomes your order.
              <Money value={versionDue(s.c.id, latest)} className="text-[15px] font-semibold" />
            </p>
          </Dialog>
          <DeclineDialog open={dialog === "decline" && canAnswer} est={est} onClose={() => setDialog(null)} />
        </>
      )}
    </>
  );
}

// ── What the dealer asked for in the first place ────────────────────────────

function Asked({ r }: { r: DealerRequest }) {
  const q = r.opp!.request!;
  return (
    <article className={cn(CARD, "overflow-hidden")}>
      <header className={cn("flex flex-wrap items-baseline gap-x-3 border-b border-bz-line-soft py-3.5", PAD)}>
        <h2 className="m-0 text-[13px] font-semibold text-bz-text">Your request</h2>
        <span className="ml-auto text-[11.5px] text-bz-text-soft">{day(q.at.slice(0, 10))}</span>
      </header>
      {q.note && <p className={cn("m-0 whitespace-pre-wrap border-b border-bz-line-soft py-3 text-[12.5px] leading-relaxed text-bz-text", PAD)}>“{q.note}”</p>}
      <ul className={cn("m-0 list-none divide-y divide-bz-line-soft p-0", PAD)}>
        {q.lines.map((l, i) => {
          const p = productById(l.productId);
          return (
            <li key={i} className="flex items-center gap-3 py-3">
              <ProductThumb product={p} size={28} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-bz-text">{p.name}</span>
                {l.note && <span className="block text-[11.5px] text-bz-text-muted">{l.note}</span>}
              </span>
              <span className={cn("shrink-0 text-[12.5px] text-bz-text", NUM)}>
                {l.qty} <span className="text-bz-text-soft">{p.unit}</span>
              </span>
            </li>
          );
        })}
      </ul>
      {(q.deliverBy || q.paymentWish) && (
        <div className={cn("grid grid-cols-2 gap-x-6 gap-y-3 border-t border-bz-line-soft py-3.5", PAD)}>
          {q.deliverBy && <Fact label="Needed by">{day(q.deliverBy)}</Fact>}
          {q.paymentWish && <Fact label="Payment">{q.paymentWish}</Fact>}
        </div>
      )}
    </article>
  );
}

// ── One version, with what moved in it — or what the dealer asked on it ─────

/** A value, with the earlier one struck out beside it when it moved. */
function Val({ now, was, className }: { now: React.ReactNode; was?: React.ReactNode; className?: string }) {
  if (was === undefined) return <span className={className}>{now}</span>;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline justify-end gap-x-1.5", className)}>
      <s className="text-[11px] font-normal text-bz-text-soft">{was}</s>
      <span className="rounded-[4px] bg-bz-fire/30 px-1 font-semibold text-bz-text">{now}</span>
    </span>
  );
}
/** What the dealer asked for on a value, under the value it is about. */
const Wanted = ({ children, className }: { children: React.ReactNode; className?: string }) => <span className={cn("mt-0.5 block text-[11px] font-medium text-bz-amber-ink", NUM, className)}>{children}</span>;
const Tag = ({ tone, children }: { tone: "new" | "off" | "ask"; children: React.ReactNode }) => (
  <span className={cn("ml-2 inline-block rounded-bz-sm px-1.5 py-px align-middle text-[10.5px] font-semibold", tone === "new" ? "bg-bz-fire/30 text-bz-text" : tone === "ask" ? "bg-bz-amber-soft text-bz-amber-ink" : "bg-bz-paper-warm text-bz-text-muted")}>{children}</span>
);

function OpenTill({ till, live, ranOut }: { till: string; live: boolean; ranOut: boolean }) {
  const left = daysUntil(till);
  if (ranOut) return <Flag>Ran out {day(till)}</Flag>;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-2 text-[11.5px]", live && left <= 3 ? "font-medium text-bz-amber-ink" : "text-bz-text-soft")}>
      Valid till {day(till)}
      {live && left <= 3 && <Flag>{left <= 0 ? "Ends today" : left === 1 ? "1 day left" : `${left} days left`}</Flag>}
    </span>
  );
}

function OfferCard({ est, v, prev, request, ev, live, ranOut, foot }: { est: Estimate; v: EstimateVersion; prev?: EstimateVersion; request: EstimateChangeRequest | null; ev: Evaluation; live: boolean; ranOut: boolean; foot: React.ReactNode }) {
  const s = useDealer();
  // A step of the dealer's own shows the version it asked on, unmarked, with what it asked on each line.
  const asks = request ? asksOn({ ...est, offer: { ...offerOf(est), requests: [request] } }, v.no) : null;
  const rows = compareVersion(v, request ? undefined : prev);
  const goods = rows.filter((x) => !isChargeLine(x.line));
  const charges = rows.filter((x) => isChargeLine(x.line));
  // With final prices the version's own figures stand; with offers on top the engine's do, as the order will be billed.
  const final = !v.terms.applyOffers;
  const own = totalsOf(v.lines);
  const chargeTotal = v.lines.filter(isChargeLine).reduce((sum, l) => sum + lineGross(l), 0);
  const offerFree = final ? [] : ev.lines.filter((l) => l.free && l.schemeId);
  const offerOff = (itemId: string) => (final ? 0 : (ev.lines.find((l) => !l.free && l.product.id === itemId)?.discount ?? 0));
  const due = versionDue(s.c.id, v);
  const wasDue = prev && !request ? versionDue(s.c.id, prev) : undefined;

  const terms: { label: string; now: string; was?: string; wanted?: string }[] = [];
  const term = (label: string, now: string, before: string | undefined, wanted?: string) => {
    if (now || wanted) terms.push({ label, now: now || "—", was: before !== undefined && before !== now ? before || "—" : undefined, wanted });
  };
  const old = request ? undefined : prev;
  term("Payment", paymentOf(v), old ? paymentOf(old) : undefined, asks?.terms.paymentNote);
  term("Delivery", v.terms.deliveryTerms.trim(), old ? old.terms.deliveryTerms.trim() : undefined, asks?.terms.deliveryTerms);
  term("Deliver by", v.terms.deliverBy ? day(v.terms.deliverBy) : "", old ? (old.terms.deliverBy ? day(old.terms.deliverBy) : "") : undefined, asks?.terms.deliverBy ? day(asks.terms.deliverBy) : undefined);
  if (asks?.terms.validTill) term("Valid till", day(v.validTill), undefined, day(asks.terms.validTill));

  return (
    <article className={cn(CARD, "overflow-hidden")} aria-label={`Estimate ${est.no}, version ${v.no}`}>
      <header className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-bz-line-soft py-3.5", PAD)}>
        <h2 className="m-0 text-[13px] font-semibold text-bz-text">
          {request ? "Your changes" : `Estimate ${est.no}`}
          <span className="ml-1.5 font-normal text-bz-text-muted">{request ? `to version ${v.no}` : `version ${v.no}`}</span>
        </h2>
        <span className="ml-auto">{request ? <span className="text-[11.5px] text-bz-text-soft">{day(request.at.slice(0, 10))}</span> : <OpenTill till={v.validTill} live={live} ranOut={ranOut} />}</span>
      </header>

      {(request ? request.message : v.message) && <p className={cn("m-0 whitespace-pre-wrap border-b border-bz-line-soft py-3 text-[12.5px] leading-relaxed text-bz-text", PAD)}>“{request ? request.message : v.message}”</p>}

      <div className={cn(COLS, "border-b border-bz-line-soft py-2 text-[11px] text-bz-text-soft", PAD)}>
        <span>Item</span>
        <span className={WIDE}>Qty</span>
        <span className={WIDE}>Price</span>
        <span className={WIDE}>Discount</span>
        <span className="text-right">Amount</span>
      </div>
      <ul className={cn("m-0 list-none divide-y divide-bz-line-soft p-0", PAD)}>
        {goods.map((x) => (
          <GoodsRow key={x.line.id} x={x} ask={asks?.byLine.get(x.line.id)} off={offerOff(x.line.itemId)} />
        ))}
        {charges.map((x) => {
          const gone = x.state === "removed";
          const ask = asks?.byLine.get(x.line.id);
          return (
            <li key={x.line.id} className={cn(COLS, "py-3 text-[12.5px]", gone && "text-bz-text-soft")}>
              <span className={cn("min-w-0 font-medium sm:col-span-4", gone ? "line-through" : "text-bz-text")}>
                {lineName(x.line)}
                {x.state === "new" && <Tag tone="new">New</Tag>}
                {gone && <Tag tone="off">Removed</Tag>}
                {ask?.remove && <Tag tone="ask">You asked to remove</Tag>}
              </span>
              <span className={cn("text-right", NUM)}>
                <Val now={npr(lineGross(x.line))} was={x.was.price !== undefined ? npr(x.was.price * x.line.qty) : undefined} />
                {ask?.rate !== undefined && <Wanted>you asked {npr(ask.rate)}</Wanted>}
              </span>
            </li>
          );
        })}
        {offerFree.map((l, i) => (
          <li key={`free-${i}`} className="flex items-center gap-2 py-2.5 text-[12px] text-bz-pos-deep">
            <Gift size={13} className="shrink-0" />
            <span className={cn("min-w-0 flex-1 truncate", NUM)}>
              {l.qty} {l.product.unit} {l.product.name} free with an offer
            </span>
          </li>
        ))}
        {asks?.added.map((a, i) => {
          const p = productById(a.itemId);
          return (
            <li key={`add-${i}`} className={cn(COLS, "py-3 text-[12.5px]")}>
              <span className="min-w-0 font-medium text-bz-text sm:col-span-4">
                {p.name}
                <Tag tone="ask">You asked to add</Tag>
              </span>
              <span className={cn("text-right text-bz-amber-ink", NUM)}>
                {a.qty} <span className="text-[11px]">{p.unit}</span>
              </span>
            </li>
          );
        })}
        {v.lines.length === 0 && <li className="py-4 text-[12px] text-bz-text-muted">No items on this version.</li>}
      </ul>

      <dl className={cn("m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 border-t border-bz-line-soft py-3.5 text-[12px]", NUM, PAD)}>
        <dt className="text-bz-text-muted">Items</dt>
        <dd className="m-0 text-right text-bz-text">{npr(own.subtotal - chargeTotal)}</dd>
        {own.discount > 0 && (
          <>
            <dt className="text-bz-text-muted">Discount</dt>
            <dd className="m-0 text-right text-bz-text">−{npr(own.discount)}</dd>
          </>
        )}
        {chargeTotal > 0 && (
          <>
            <dt className="text-bz-text-muted">Charges</dt>
            <dd className="m-0 text-right text-bz-text">{npr(chargeTotal)}</dd>
          </>
        )}
        {!final && ev.discount > 0 && (
          <>
            <dt className="text-bz-text-muted">Offer discounts</dt>
            <dd className="m-0 text-right text-bz-pos-deep">−{npr(ev.discount)}</dd>
          </>
        )}
        <dt className="text-bz-text-muted">VAT 13%</dt>
        <dd className="m-0 text-right text-bz-text">{npr(final ? own.tax : ev.tax)}</dd>
        <dt className="mt-1 border-t border-bz-line-soft pt-2 text-[12.5px] font-semibold text-bz-text">Total</dt>
        <dd className="m-0 mt-1 flex items-baseline justify-end gap-2 border-t border-bz-line-soft pt-2 text-[17px] font-semibold text-bz-text">
          {wasDue !== undefined && Math.round(wasDue) !== Math.round(due) && <s className="text-[11.5px] font-normal text-bz-text-soft">{npr(wasDue)}</s>}
          <Money value={due} />
        </dd>
      </dl>

      {terms.length > 0 && (
        <div className={cn("grid grid-cols-2 gap-x-6 gap-y-3 border-t border-bz-line-soft py-3.5 sm:grid-cols-3", PAD)}>
          {terms.map((t) => (
            <Fact key={t.label} label={t.label}>
              <Val now={t.now} was={t.was} className="justify-start" />
              {t.wanted && <Wanted>you asked {t.wanted}</Wanted>}
            </Fact>
          ))}
        </div>
      )}

      {foot && <footer className={cn("flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-bz-line-soft py-3.5", PAD)}>{foot}</footer>}
    </article>
  );
}

function GoodsRow({ x, ask, off }: { x: LineView; ask?: AskView; off: number }) {
  const l = x.line;
  const p = productById(l.itemId);
  const unit = l.unit || p.unit || "unit";
  const gone = x.state === "removed";
  const free = l.rate <= 0;
  const disc = discountOf(l);
  const wasDisc = x.was.discountPct !== undefined || x.was.discountAmt !== undefined ? discountOf({ discountPct: x.was.discountPct ?? l.discountPct, discountAmt: x.was.discountAmt ?? l.discountAmt }) || "0%" : undefined;
  const qty = (
    <>
      <Val now={l.qty} was={x.was.qty} /> <span className="text-[11px] text-bz-text-soft">{unit}</span>
    </>
  );
  const price = free ? <span className="font-medium text-bz-pos-deep">Free</span> : <Val now={npr(l.rate)} was={x.was.rate !== undefined ? npr(x.was.rate) : undefined} />;
  const discount = disc || wasDisc !== undefined ? <Val now={disc || "0%"} was={wasDisc} /> : null;
  // What was asked on this line, for the one line a phone has room for.
  const asked = [ask?.qty !== undefined && `${ask.qty} ${unit}`, ask?.rate !== undefined && `price ${npr(ask.rate)}`, ask?.discountPct !== undefined && `${ask.discountPct}% off`].filter(Boolean).join(" · ");
  return (
    <li className={cn(COLS, "py-3 text-[12.5px]", gone ? "text-bz-text-soft" : "text-bz-text")}>
      <span className="flex min-w-0 items-start gap-2.5">
        <span className="hidden shrink-0 sm:block">
          <ProductThumb product={p} size={28} />
        </span>
        <span className="min-w-0">
          <span className={cn("font-medium", gone && "line-through")}>{p.name}</span>
          {x.state === "new" && <Tag tone="new">New</Tag>}
          {gone && <Tag tone="off">Removed</Tag>}
          {ask?.remove && <Tag tone="ask">You asked to remove</Tag>}
          <span className={cn("mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[11.5px] text-bz-text-muted sm:hidden", NUM)}>
            {qty}
            {!free && <>× {price}</>}
            {discount && <>· {discount} off</>}
          </span>
          {asked && <Wanted className="sm:hidden">you asked {asked}</Wanted>}
          {(x.free > 0 || (x.was.free ?? 0) > 0) && (
            <span className={cn("mt-0.5 flex items-center gap-1 text-[11.5px] font-medium", NUM, x.free > 0 ? "text-bz-pos-deep" : "text-bz-text-soft line-through")}>
              <Gift size={12} className="shrink-0" />
              <span className={cn(x.was.free !== undefined && x.free > 0 && "rounded-[4px] bg-bz-fire/30 px-1 text-bz-text")}>
                {x.free > 0 ? x.free : x.was.free} {unit} free
              </span>
              {x.was.free !== undefined && x.free > 0 && x.was.free > 0 && <s className="font-normal text-bz-text-soft">{x.was.free}</s>}
            </span>
          )}
          {ask?.free !== undefined && <Wanted>you asked {ask.free} free</Wanted>}
          {off > 0 && <span className={cn("block text-[11px] text-bz-pos-deep", NUM)}>Offer −{npr(off)}</span>}
          {l.note && <span className="mt-0.5 block text-[11.5px] text-bz-text-muted">{l.note}</span>}
          {ask?.note && <Wanted>“{ask.note}”</Wanted>}
        </span>
      </span>
      <span className={cn(WIDE, NUM)}>
        {qty}
        {ask?.qty !== undefined && <Wanted>you asked {ask.qty}</Wanted>}
      </span>
      <span className={cn(WIDE, NUM)}>
        {price}
        {ask?.rate !== undefined && <Wanted>you asked {npr(ask.rate)}</Wanted>}
      </span>
      <span className={cn(WIDE, NUM, !discount && "text-bz-text-soft")}>
        {discount ?? "—"}
        {ask?.discountPct !== undefined && <Wanted>you asked {ask.discountPct}%</Wanted>}
      </span>
      <span className={cn("text-right", NUM, gone && "line-through")}>{free ? "—" : npr(lineGross(l))}</span>
    </li>
  );
}

// ── Decline ─────────────────────────────────────────────────────────────────

function DeclineDialog({ open, est, onClose }: { open: boolean; est: Estimate; onClose: () => void }) {
  const s = useDealer();
  const [reason, setReason] = React.useState("");
  React.useEffect(() => {
    if (open) setReason("");
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      eyebrow={`Estimate ${est.no}`}
      title="Decline this estimate?"
      size="sm"
      foot={
        <>
          <button type="button" onClick={onClose} className={SOFT}>
            Keep it
          </button>
          <button
            type="button"
            onClick={() => {
              const res = declineEstimateOffer(est.no, { by: "customer", via: "portal", byName: s.userName, reason });
              if (res.ok === false) notify(res.refusal, "error");
              else notify(`Estimate ${est.no} declined`, "info");
              onClose();
            }}
            className={cn(DANGER_BTN, "h-10 px-4 text-[12.5px]")}
          >
            Decline
          </button>
        </>
      }
    >
      <Field label="Why" hint="Optional">
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="The price, the delivery date, bought elsewhere…" className={cn(TEXTAREA, "min-h-[72px] bg-bz-surface")} />
      </Field>
    </Dialog>
  );
}
