import * as React from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Check, Gift, Megaphone, Package, ShoppingCart, Truck } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { SF_NOW, SF_TODAY } from "../salesforce/data";
import { day, daysUntil, evaluate, npr, priceFor, productById } from "../salesforce/engine";
import { announcementsStore, ledgerStore, schemesStore } from "../salesforce/store";
import { Dot, Figures, Money, Progress, ProductThumb, Section } from "../salesforce/ui";
import type { Figure } from "../salesforce/ui";
import { DealerShell, pagesFor } from "./shell";
import { LIME_LG, MiniTrack, ShopMark, SOFT } from "./kit";
import { PayDialog, stuckPayments } from "./pay";
import { addToCart, billedBetween, dpPath, isFirstOrder, liveFor, schemeSentence, useAccount, useCart, useDealer, useDealerOrders, useDealerRequests, usualItems } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// DEALER HOME — money first
//
// What the dealer can spend, what it owes and when, then one action: order.
// Below: what is on its way, its usual items one tap from the cart, the offers
// that apply today and the company's news.
// ════════════════════════════════════════════════════════════════════════════

const hour = Number(SF_NOW.slice(0, 2));
const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
const longDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

export function DealerHomePage() {
  return (
    <DealerShell page="home">
      <Home />
    </DealerShell>
  );
}

function Home() {
  const navigate = useNavigate();
  const s = useDealer();
  const d = s.c;
  const pages = pagesFor(s);
  const acct = useAccount(d);
  const orders = useDealerOrders(d.id, s.company);
  const toAnswer = useDealerRequests(d.id, s.company).filter((r) => r.state === "received" || r.state === "new-version");
  const schemes = useStore(schemesStore);
  const news = useStore(announcementsStore);
  const ledger = useStore(ledgerStore);
  const cart = useCart(d.id);
  const [pay, setPay] = React.useState(false);

  const canPay = s.settings.can.pay;
  // A payment for an order that was not accepted has to be given another order (decision #33). Read with the ledger.
  const stuck = pages.has("account") ? stuckPayments(d.id) : [];
  const onWay = orders.filter((o) => o.open);
  const usual = usualItems(orders).slice(0, 5);
  const offers = liveFor(schemes, d);
  const cartEv = React.useMemo(() => evaluate(d.id, cart, schemes, { firstOrder: isFirstOrder(d.id) }), [d.id, cart, schemes]);
  const cartCount = cart.filter((l) => l.qty > 0).length;
  const late = acct.invoices.filter((i) => i.late > 0).sort((a, b) => b.late - a.late)[0];
  const latestNews = [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  const c = acct.credit;
  const spend: Figure =
    c.limit === null
      ? { label: "You can spend", value: "No limit", sub: "No credit limit set" }
      : c.limit === 0
        ? { label: "You can spend", value: "Cash only", sub: "Orders are paid up front" }
        : { label: "You can spend", value: <Money value={c.available ?? 0} />, sub: `of NPR ${npr(c.limit)} credit` };
  const figures: Figure[] = [
    { ...spend, onClick: pages.has("account") ? () => navigate(dpPath("account")) : undefined },
    { label: acct.outstanding < 0 ? "In credit" : "You owe", value: <Money value={Math.abs(acct.outstanding)} />, sub: acct.outstanding < 0 ? "Paid ahead — it goes on your next bill" : acct.invoices.length ? `${acct.invoices.length} open ${acct.invoices.length === 1 ? "bill" : "bills"}` : "Nothing open", onClick: pages.has("account") ? () => navigate(dpPath("account")) : undefined },
    { label: "Overdue", value: <Money value={acct.overdue} />, sub: late ? `${late.doc} · ${late.late} days late` : "Nothing late", tone: acct.overdue > 0 ? "danger" : undefined, onClick: canPay && acct.overdue > 0 ? () => setPay(true) : undefined },
    acct.nextDue?.due
      ? { label: "Next payment", value: <Money value={acct.nextDue.open} />, sub: `${acct.nextDue.doc} · due ${daysUntil(acct.nextDue.due) === 0 ? "today" : daysUntil(acct.nextDue.due) === 1 ? "tomorrow" : day(acct.nextDue.due)}`, onClick: canPay ? () => setPay(true) : undefined }
      : { label: "Next payment", value: "—", sub: "Nothing due" },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="m-0 text-[17px] font-semibold tracking-tight text-bz-text">
          {greeting}, {s.first}
        </h1>
        <p className="m-0 mt-1 text-[12.5px] text-bz-text-muted">
          {d.name} · {longDate(SF_TODAY)}
        </p>
      </div>

      <Figures items={figures} />

      {pages.has("order") && (
        <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link to={dpPath("order")} className={LIME_LG}>
            <ShoppingCart size={16} /> Place an order
          </Link>
          {cartCount > 0 && (
            <span className="text-[12px] text-bz-text-muted">
              Your cart has {cartCount} {cartCount === 1 ? "item" : "items"} · <Money value={cartEv.total} className="font-medium text-bz-text" />
            </span>
          )}
        </div>
      )}
      {!c.ok && c.reason && (
        <p className="m-0 mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-bz-text-muted">
          <Dot tone="danger">{c.reason}.</Dot>
          New orders wait for approval.
          {canPay && acct.invoices.length > 0 && (
            <button type="button" onClick={() => setPay(true)} className="font-semibold text-bz-text underline underline-offset-2 hover:opacity-75">
              Pay now
            </button>
          )}
        </p>
      )}

      {toAnswer.length > 0 && (
        <Link to={dpPath(toAnswer.length === 1 ? `requests/${toAnswer[0].key}` : "requests")} className="mt-4 flex min-h-[40px] items-center gap-2 text-[12px] text-bz-text-muted hover:text-bz-text">
          <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-amber" aria-hidden />
          <span className="min-w-0">
            <span className="font-semibold text-bz-text">{toAnswer.length === 1 ? `Estimate ${toAnswer[0].est?.no ?? toAnswer[0].key}` : `${toAnswer.length} estimates`}</span> from {s.company} {toAnswer.length === 1 ? "is" : "are"} waiting for your answer
          </span>
          <ArrowRight size={13} className="shrink-0" />
        </Link>
      )}

      {stuck.length > 0 && (
        <Link to={dpPath("account")} className="mt-4 flex min-h-[40px] items-center gap-2 text-[12px] text-bz-text-muted hover:text-bz-text">
          <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-red-mark" aria-hidden />
          <span className="min-w-0">
            <span className="font-semibold text-bz-text">{stuck.length === 1 ? `Payment ${stuck[0].no}` : `${stuck.length} payments`}</span> {stuck.length === 1 ? "needs" : "need"} another order
          </span>
          <ArrowRight size={13} className="shrink-0" />
        </Link>
      )}

      <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <Section title="Your open orders" count={onWay.length} action={<Link to={dpPath("orders")} className="text-[11.5px] text-bz-text-soft hover:text-bz-text">All orders</Link>}>
            {onWay.length === 0 ? (
              <p className="m-0 text-[12.5px] text-bz-text-muted">No open orders. Your next order shows here until it is delivered.</p>
            ) : (
              <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
                {onWay.map((o) => (
                  <li key={o.id}>
                    <Link to={dpPath(`orders/${o.id}`)} className="flex min-h-[64px] items-center gap-3.5 px-1 py-3 hover:bg-bz-paper-warm/60">
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-pill", o.reached >= 2 ? "bg-bz-fire/25 text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>{o.reached >= 2 ? <Truck size={15} /> : <Package size={15} />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-[12.5px] font-medium text-bz-text">{o.id}</span>
                          <MiniTrack steps={o.steps.length} reached={o.reached} declined={o.declined} />
                        </span>
                        <ShopMark o={o} className="mt-0.5" />
                        <span className={cn("mt-0.5 block truncate text-[11px]", o.tone === "warn" ? "text-bz-amber-ink" : "text-bz-text-soft")}>{o.line}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {pages.has("order") && (
            <Section
              title="Reorder your usual"
              action={
                usual.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(d.id, usual.filter((u) => !cart.some((x) => x.productId === u.productId)).map((u) => ({ productId: u.productId, qty: u.lastQty })));
                      navigate(dpPath("order"));
                    }}
                    className="text-[11.5px] font-medium text-bz-text-soft hover:text-bz-text"
                  >
                    Add all to cart
                  </button>
                )
              }
            >
              {usual.length === 0 ? (
                <p className="m-0 text-[12.5px] text-bz-text-muted">What you order twice or more shows here, ready to add again.</p>
              ) : (
                <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
                  {usual.map((u) => {
                    const p = productById(u.productId);
                    const inCart = cart.find((x) => x.productId === u.productId);
                    return (
                      <li key={u.productId} className="flex min-h-[60px] items-center gap-3 px-1 py-2.5">
                        <ProductThumb product={p} size={36} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-medium text-bz-text">{p.name}</span>
                          <span className={cn("block text-[11px] text-bz-text-soft", NUM)}>
                            Usually {u.lastQty} {p.unit}s · NPR {npr(priceFor(p, d))} each
                          </span>
                        </span>
                        {inCart ? (
                          <span className="inline-flex h-10 shrink-0 items-center gap-1 px-2 text-[11.5px] text-bz-text-muted">
                            <Check size={13} /> {inCart.qty} in cart
                          </span>
                        ) : (
                          <button type="button" onClick={() => addToCart(d.id, [{ productId: u.productId, qty: u.lastQty }])} className={cn(SOFT, "shrink-0")}>
                            Add {u.lastQty}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>
          )}
        </div>

        <div>
          <Section title="Offers for you now" count={offers.length} action={<Link to={dpPath("offers")} className="text-[11.5px] text-bz-text-soft hover:text-bz-text">All offers</Link>}>
            {offers.length === 0 ? (
              <p className="m-0 text-[12.5px] text-bz-text-muted">No offers for you today. New ones show here and apply in your cart by themselves.</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-6 p-0">
                {offers.slice(0, 4).map((x) => {
                  const hint = cartEv.hints.find((h) => h.schemeId === x.id);
                  const got = cartEv.applied.find((a) => a.schemeId === x.id);
                  const m = x.mechanic;
                  const rebate = m.kind === "target-rebate" && m.target > 0 ? billedBetween(ledger, d.id, x.from, x.to) / m.target : null;
                  return (
                    <li key={x.id} className="flex gap-3">
                      <Gift size={15} className="mt-0.5 shrink-0 text-bz-text-soft" />
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[12.5px] font-medium text-bz-text">{x.name}</p>
                        <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{schemeSentence(x)}</p>
                        {got && <p className="m-0 mt-1.5 text-[11px] font-medium text-bz-pos-deep">In your cart: {got.text}</p>}
                        {!got && hint && (
                          <div className="mt-2">
                            <Progress pct={hint.progress * 100} />
                            <p className="m-0 mt-1 text-[11px] text-bz-text-soft">In your cart: {hint.text.charAt(0).toLowerCase() + hint.text.slice(1)}</p>
                          </div>
                        )}
                        {rebate !== null && (
                          <div className="mt-2">
                            <Progress pct={rebate * 100} tone="warn" />
                            <p className={cn("m-0 mt-1 text-[11px] text-bz-text-soft", NUM)}>
                              {Math.min(100, Math.round(rebate * 100))}% of the way · ends {day(x.to)}
                            </p>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title={`News from ${s.company}`}>
            {latestNews.length === 0 ? (
              <p className="m-0 text-[12.5px] text-bz-text-muted">No news yet. Announcements from {s.company} show here.</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-5 p-0">
                {latestNews.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <Megaphone size={15} className="mt-0.5 shrink-0 text-bz-text-soft" />
                    <div className="min-w-0">
                      <p className="m-0 text-[12.5px] font-medium text-bz-text">{a.title}</p>
                      <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{a.body}</p>
                      <p className="m-0 mt-1 text-[10.5px] text-bz-text-soft">{day(a.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {s.settings.can.rfq && (
            <Link to={dpPath("requests/new")} className="mt-10 inline-flex items-center gap-1.5 text-[12px] text-bz-text-muted hover:text-bz-text">
              Big or special order? Ask for a price <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {canPay && <PayDialog open={pay} onClose={() => setPay(false)} />}
    </>
  );
}
