import * as React from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Check, Gift, Megaphone, Package, ShoppingCart, Truck } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { ANNOUNCEMENTS, DEALER_ID, SF_NOW } from "../salesforce/data";
import { day, daysUntil, dayTime, evaluate, npr, priceFor, productById } from "../salesforce/engine";
import { cartStore, schemesStore } from "../salesforce/store";
import { Dot, Figures, Money, Progress, ProductThumb, Section } from "../salesforce/ui";
import { DealerShell } from "./shell";
import { LIME_LG, MiniTrack, SOFT } from "./kit";
import { PayDialog } from "./pay";
import { COMPANY, addToCart, dealer, dpPath, isOpen, liveForMe, onTheWayLine, orderState, purchasedBetween, schemeSentence, snapshotOf, useAccount, useDealerOrders, usePortalUser, usualItems } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// DEALER HOME — money first (DSP-PLAN "Home")
//
// What the dealer can spend, what it owes and when, then one action: order.
// Below: what is on its way, the offers that apply today, the company's news,
// and its usual items one tap from the cart.
// ════════════════════════════════════════════════════════════════════════════

const hour = Number(SF_NOW.slice(0, 2));
const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

export function DealerHomePage() {
  const navigate = useNavigate();
  const user = usePortalUser();
  const acct = useAccount();
  const orders = useDealerOrders();
  const schemes = useStore(schemesStore);
  const cart = useStore(cartStore);
  const [pay, setPay] = React.useState(false);

  const d = dealer();
  const onWay = orders.filter(isOpen);
  const usual = usualItems(orders).slice(0, 5);
  const offers = liveForMe(schemes);
  const cartEv = React.useMemo(() => evaluate(DEALER_ID, cart, schemes), [cart, schemes]);
  const cartCount = cart.filter((l) => l.qty > 0).length;
  const late = acct.open.filter((i) => i.late > 0).sort((a, b) => b.late - a.late)[0];

  return (
    <DealerShell page="home">
      <div className="mb-8">
        <h1 className="m-0 text-[17px] font-semibold tracking-tight text-bz-text">
          {greeting}, {user.first}
        </h1>
        <p className="m-0 mt-1 text-[12.5px] text-bz-text-muted">{d.name} · Friday, 4 September</p>
      </div>

      <Figures
        items={[
          { label: "You can spend", value: <Money value={acct.available} />, sub: `of NPR ${npr(acct.limit)} credit`, onClick: () => navigate(dpPath("account")) },
          { label: "You owe", value: <Money value={acct.balance} />, sub: `${acct.open.length} open invoices`, onClick: () => navigate(dpPath("account")) },
          { label: "Overdue", value: <Money value={acct.overdue} />, sub: late ? `${late.doc} · ${late.late} days late` : "Nothing late", tone: acct.overdue > 0 ? "danger" : undefined, onClick: () => setPay(true) },
          acct.nextDue
            ? { label: "Next payment", value: <Money value={acct.nextDue.open} />, sub: `${acct.nextDue.doc} · due ${daysUntil(acct.nextDue.due!) === 1 ? "tomorrow" : day(acct.nextDue.due!)}`, onClick: () => setPay(true) }
            : { label: "Next payment", value: "—", sub: "Nothing due" },
        ]}
      />

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
      {acct.overdue > 0 && (
        <p className="m-0 mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-bz-text-muted">
          <Dot tone="danger">NPR {npr(acct.overdue)} is overdue.</Dot>
          New orders wait for approval until it is paid.
          <button type="button" onClick={() => setPay(true)} className="font-semibold text-bz-text underline underline-offset-2 hover:opacity-75">
            Pay now
          </button>
        </p>
      )}

      <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <Section title="On the way to you" count={onWay.length} action={<Link to={dpPath("orders")} className="text-[11.5px] text-bz-text-soft hover:text-bz-text">All orders</Link>}>
            {onWay.length === 0 ? (
              <p className="m-0 text-[12.5px] text-bz-text-muted">Nothing on the way. Your next order shows here.</p>
            ) : (
              <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
                {onWay.map((o) => {
                  const st = orderState(o);
                  const total = snapshotOf(o.id, o.lines, o.at).total;
                  return (
                    <li key={o.id}>
                      <Link to={dpPath(`orders/${o.id}`)} className="flex min-h-[64px] items-center gap-3.5 px-1 py-3 hover:bg-bz-paper-warm/60">
                        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-bz-pill", o.stage === 3 ? "bg-bz-fire/25 text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>{o.stage === 3 ? <Truck size={15} /> : <Package size={15} />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-[12.5px] font-medium text-bz-text">{o.id}</span>
                            <MiniTrack stage={o.stage} />
                          </span>
                          <span className={cn("mt-0.5 block truncate text-[11px]", st.tone === "warn" ? "text-bz-amber-ink" : "text-bz-text-soft")}>{onTheWayLine(o)}</span>
                        </span>
                        <Money value={total} code={false} className="shrink-0 text-[12.5px] font-medium text-bz-text" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section
            title="Reorder your usual"
            action={
              usual.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    addToCart(usual.filter((u) => !cart.some((c) => c.productId === u.productId)).map((u) => ({ productId: u.productId, qty: u.lastQty })));
                    navigate(dpPath("order"));
                  }}
                  className="text-[11.5px] font-medium text-bz-text-soft hover:text-bz-text"
                >
                  Add all to cart
                </button>
              )
            }
          >
            <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
              {usual.map((u) => {
                const p = productById(u.productId);
                const inCart = cart.find((c) => c.productId === u.productId);
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
                      <button type="button" onClick={() => addToCart([{ productId: u.productId, qty: u.lastQty }])} className={cn(SOFT, "shrink-0")}>
                        Add {u.lastQty}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>

        <div>
          <Section title="Offers for you now" count={offers.length} action={<Link to={dpPath("offers")} className="text-[11.5px] text-bz-text-soft hover:text-bz-text">All offers</Link>}>
            <ul className="m-0 flex list-none flex-col gap-6 p-0">
              {offers.slice(0, 4).map((s) => {
                const hint = cartEv.hints.find((h) => h.schemeId === s.id);
                const got = cartEv.applied.find((a) => a.schemeId === s.id);
                const m = s.mechanic;
                const rebate = m.kind === "target-rebate" ? purchasedBetween(s.from, s.to) / m.target : null;
                return (
                  <li key={s.id} className="flex gap-3">
                    <Gift size={15} className="mt-0.5 shrink-0 text-bz-text-soft" />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-[12.5px] font-medium text-bz-text">{s.name}</p>
                      <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{schemeSentence(s)}</p>
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
                            {Math.round(rebate * 100)}% of the way · ends {day(s.to)}
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title={`News from ${COMPANY}`}>
            <ul className="m-0 flex list-none flex-col gap-5 p-0">
              {ANNOUNCEMENTS.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <Megaphone size={15} className="mt-0.5 shrink-0 text-bz-text-soft" />
                  <div className="min-w-0">
                    <p className="m-0 text-[12.5px] font-medium text-bz-text">{a.title}</p>
                    <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{a.body}</p>
                    <p className="m-0 mt-1 text-[10.5px] text-bz-text-soft">{dayTime(a.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Link to={dpPath("quotes")} className="mt-10 inline-flex items-center gap-1.5 text-[12px] text-bz-text-muted hover:text-bz-text">
            Big or special order? Ask for a quotation <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <PayDialog open={pay} onClose={() => setPay(false)} />
    </DealerShell>
  );
}
