import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, FileText, Gift } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { day, dayTime, isCharge, npr } from "../salesforce/engine";
import { RecordFoot } from "../salesforce/records";
import { Dot, EmptyNote, Fact, Flag, Money, ProductThumb, Section } from "../salesforce/ui";
import { DealerShell, pagesFor } from "./shell";
import { LIME, MiniTrack, PageHead, Pills, ShopMark, SOFT, Tracker } from "./kit";
import { useStore } from "../sales/store";
import { orderTargets, paidFor, unapplied } from "../salesforce/receipts";
import { ledgerStore } from "../salesforce/store";
import { ChooseOrderDialog, PayDialog } from "./pay";
import { addToCart, boughtLines, cap, dpPath, snapshotOf, useDealer, useDealerOrders } from "./portal";
import type { DealerOrder } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// ORDERS — everything the dealer has ordered, and where each one is
//
// The list is the company's Orders filtered to this dealer: each one is the
// sales order itself, under the same number (owner decision #31). A dealer
// thinks "where is my stuff": each order reads Placed → Approved → Delivered.
// Past approval the steps come from the sales desk — until a delivery is made
// there, it honestly says "Approved — <company> will deliver". The detail keeps
// the prices and offers it was placed with (the snapshot). An order our rep took
// at a shop this dealer serves is still the dealer's own purchase, billed to it;
// it only carries a "For <shop>" mark (owner decision #26). An order that came
// from an accepted estimate (decision #27) says so and shows the terms agreed
// there; its charges read as charges and its agreed free goods as "Free".
// ════════════════════════════════════════════════════════════════════════════

type Filter = "open" | "done" | "all" | "shops";

export function DealerOrdersPage() {
  const { id } = useParams();
  return <DealerShell page="orders">{id ? <OrderDetail id={id} /> : <OrdersList />}</DealerShell>;
}

function OrdersList() {
  const s = useDealer();
  const orders = useDealerOrders(s.c.id, s.company);
  const [f, setF] = React.useState<Filter>("open");
  const canOrder = pagesFor(s).has("order");
  const open = orders.filter((o) => o.open);
  const done = orders.filter((o) => !o.open);
  const forShops = orders.filter((o) => o.forShop);
  const shown = f === "open" ? open : f === "done" ? done : f === "shops" ? forShops : orders;
  return (
    <>
      <PageHead
        title="Your orders"
        sub="Every order you or your sales rep placed. Tap one to see where it is."
        actions={
          canOrder && (
            <Link to={dpPath("order")} className={LIME}>
              New order
            </Link>
          )
        }
      />
      {orders.length > 0 && (
        <Pills<Filter>
          value={f}
          onChange={setF}
          options={[
            { value: "open", label: "Open", count: open.length },
            { value: "done", label: "Delivered or closed", count: done.length },
            { value: "all", label: "All", count: orders.length },
            ...(forShops.length > 0 || f === "shops" ? [{ value: "shops" as const, label: "For my shops", count: forShops.length }] : []),
          ]}
        />
      )}
      <div className="mt-6">
        {shown.length === 0 ? (
          <EmptyNote
            action={
              canOrder && (
                <Link to={dpPath("order")} className={SOFT}>
                  Place an order
                </Link>
              )
            }
          >
            {orders.length === 0 ? "Your orders show here once you place one." : f === "open" ? "No open orders right now." : f === "shops" ? "No orders for your shops yet." : "Nothing here yet."}
          </EmptyNote>
        ) : (
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {shown.map((o) => (
              <OrderRow key={o.id} o={o} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function OrderRow({ o }: { o: DealerOrder }) {
  const ev = snapshotOf(o.hub);
  const items = boughtLines(o.lines).length;
  return (
    <li>
      <Link to={dpPath(`orders/${o.id}`)} className="grid min-h-[64px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-1 py-3 hover:bg-bz-paper-warm/60 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_120px]">
        <span className="min-w-0">
          <span className="block text-[12.5px] font-medium text-bz-text">{o.id}</span>
          <span className={cn("block truncate text-[11px] text-bz-text-soft", NUM)}>
            {dayTime(o.at)} · {items} {items === 1 ? "item" : "items"}
            {!o.forShop && ` · by ${o.byName.split(" ")[0]}`}
            {o.hub.estimateId && ` · from ${o.hub.estimateId}`}
          </span>
          <ShopMark o={o} className="mt-0.5" />
        </span>
        <span className="col-start-1 row-start-2 flex items-center gap-2.5 md:col-start-2 md:row-start-1">
          <Dot tone={o.tone}>{o.label}</Dot>
          <span className="hidden sm:inline-flex">
            <MiniTrack steps={o.steps.length} reached={o.reached} declined={o.declined} />
          </span>
        </span>
        <span className="col-start-2 row-span-2 row-start-1 text-right md:col-start-3 md:row-span-1">
          <Money value={ev.total} code={false} className="text-[12.5px] font-medium text-bz-text" />
        </span>
      </Link>
    </li>
  );
}

function OrderDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const s = useDealer();
  const pages = pagesFor(s);
  const orders = useDealerOrders(s.c.id, s.company);
  const ledger = useStore(ledgerStore);
  const [paying, setPaying] = React.useState(false);
  const [choosing, setChoosing] = React.useState<{ receiptNo: string; from: string | null } | null>(null);
  const o = orders.find((x) => x.id === id);
  if (!o)
    return (
      <EmptyNote
        action={
          <Link to={dpPath("orders")} className={SOFT}>
            All orders
          </Link>
        }
      >
        We can't find order {id} on your account.
      </EmptyNote>
    );

  const ev = snapshotOf(o.hub);
  // "CHG:" lines are charges agreed on the estimate (freight, loading…), not products.
  const charges = ev.lines.filter((l) => isCharge(l.product.id));
  const chargeTotal = charges.reduce((sum, l) => sum + l.net, 0);
  const paid = ev.lines.filter((l) => !l.free && !isCharge(l.product.id));
  const free = ev.lines.filter((l) => l.free);
  const est = o.hub.estimateId ?? null;
  const terms = o.hub.terms ?? null;
  // What was paid for this order: payments that name it, on its bill or not yet (decision #33).
  const money = paidFor(s.c.id, o.id, ledger);
  const toPay = orderTargets(s.c.id).find((t) => t.orderNo === o.id)?.need ?? 0;
  // Not accepted with a payment for it: that payment needs another order.
  const stuck = o.declined ? unapplied(s.c.id).filter((u) => u.use.tags.some((t) => t.orderNo === o.id && t.state === "dead")) : [];
  const docs = [
    { label: "Delivery note", no: o.deliveries.map((x) => x.no).join(", ") || null, pending: "When it leaves the warehouse" },
    { label: "Invoice", no: o.invoices.map((x) => x.no).join(", ") || null, pending: "When it is billed" },
    { label: "Payment", no: money.paid + money.waiting > 0 ? `${[money.paid > 0 && `NPR ${npr(money.paid)} paid`, money.waiting > 0 && `NPR ${npr(money.waiting)} waiting to be confirmed`].filter(Boolean).join(" · ")} · ${money.receipts.join(", ")}` : null, pending: "Not paid yet" },
  ];

  return (
    <>
      <Link to={dpPath("orders")} className="-ml-1 mb-4 inline-flex h-10 items-center gap-1.5 px-1 text-[12px] text-bz-text-muted hover:text-bz-text">
        <ArrowLeft size={14} /> All orders
      </Link>
      <PageHead
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            Order {o.id} <Dot tone={o.tone}>{o.label}</Dot>
          </span>
        }
        sub={
          <>
            <ShopMark o={o} className="mb-0.5 text-[12px]" />
            {est && (
              <span className="mb-0.5 block">
                From estimate{" "}
                <Link to={dpPath(`requests/${est}`)} className="font-medium text-bz-text underline underline-offset-2 hover:opacity-75">
                  {est}
                </Link>
                {o.hub.estimateVersion ? ` version ${o.hub.estimateVersion}` : ""}
              </span>
            )}
            {`Placed ${dayTime(o.at)}${o.forShop ? "" : ` by ${o.byName}`}${o.deliverBy ? ` · wanted by ${day(o.deliverBy)}` : ""}`}
          </>
        }
        actions={
          <>
            {o.reached >= 2 && pages.has("claims") && (
              <button type="button" onClick={() => navigate(`${dpPath("claims")}?order=${o.id}`)} className={SOFT}>
                Raise a claim
              </button>
            )}
            {pages.has("order") && (
              <button
                type="button"
                onClick={() => {
                  addToCart(s.c.id, boughtLines(o.lines));
                  navigate(dpPath("order"));
                }}
                className={toPay > 0 && s.settings.can.pay ? SOFT : LIME}
              >
                Reorder
              </button>
            )}
            {toPay > 0 && s.settings.can.pay && (
              <button type="button" onClick={() => setPaying(true)} className={LIME}>
                Pay NPR {npr(toPay)}
              </button>
            )}
          </>
        }
      />

      {o.forShop && (
        <p className="m-0 mb-6 text-[12px] leading-relaxed text-bz-text-muted">
          Our rep took this order at {o.forShop.name} for you to supply. You are billed for it and you deliver it to {o.forShop.name}.
        </p>
      )}
      {o.declined && (
        <p className="m-0 mb-6 flex flex-wrap items-center gap-2 text-[12px] text-bz-text-muted">
          <Flag>Not accepted</Flag> {o.hub.rejectReason ?? `${cap(s.company)} could not take this order.`} Call your sales rep if this looks wrong.
        </p>
      )}
      {stuck.length > 0 && s.settings.can.pay && (
        <p className="m-0 mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-bz-text-muted">
          You paid for this order with {stuck.map((u) => u.no).join(", ")}.
          <button type="button" onClick={() => setChoosing({ receiptNo: stuck[0].no, from: o.id })} className="font-semibold text-bz-text underline underline-offset-2 hover:opacity-75">
            Choose another order
          </button>
        </p>
      )}
      {!o.declined && o.reached === 0 && (
        <p className="m-0 mb-6 text-[12px] text-bz-text-muted">
          {o.waiting ? `${cap(s.company)} approves this order first because of your credit. Paying what is overdue speeds it up.` : `${cap(s.company)} is checking stock and prices before approving it.`}
        </p>
      )}
      {!o.declined && o.reached === 1 && o.open && <p className="m-0 mb-6 text-[12px] text-bz-text-muted">{o.line}.</p>}

      <Tracker steps={o.steps} reached={o.reached} declined={o.declined} waiting={o.waiting} />

      <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Section title="What you ordered" count={paid.length}>
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {paid.map((l) => (
              <li key={l.product.id} className="flex min-h-[56px] items-center gap-3 py-2.5">
                <ProductThumb product={l.product} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-bz-text">{l.product.name}</span>
                  <span className={cn("block text-[11px] text-bz-text-soft", NUM)}>
                    {l.qty} {l.product.unit || "unit"}s × NPR {npr(l.price)}
                    {l.discount > 0 && <span className="text-bz-pos-deep"> · −{npr(l.discount)}</span>}
                  </span>
                </span>
                <Money value={l.net} code={false} className="text-[12.5px] text-bz-text" />
              </li>
            ))}
            {free.map((l, i) => (
              <li key={`f${i}`} className="flex min-h-[48px] items-center gap-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center">
                  <Gift size={15} className="text-bz-pos-deep" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">
                  {l.qty} {l.product.unit} {l.product.name}
                </span>
                <span className="text-[11px] font-semibold text-bz-pos-deep">Free</span>
              </li>
            ))}
          </ul>
          <dl className={cn("m-0 mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-[12px] md:ml-auto md:max-w-[280px]", NUM)}>
            <dt className="text-bz-text-muted">Items</dt>
            <dd className="m-0 text-right text-bz-text">{npr(ev.gross - chargeTotal)}</dd>
            {charges.map((c, i) => (
              <React.Fragment key={`c${i}`}>
                <dt className="text-bz-text-muted">{c.product.name}</dt>
                <dd className="m-0 text-right text-bz-text">{npr(c.net)}</dd>
              </React.Fragment>
            ))}
            {ev.discount > 0 && (
              <>
                <dt className="text-bz-text-muted">Offer discounts</dt>
                <dd className="m-0 text-right text-bz-pos-deep">−{npr(ev.discount)}</dd>
              </>
            )}
            <dt className="text-bz-text-muted">VAT 13%</dt>
            <dd className="m-0 text-right text-bz-text">{npr(ev.tax)}</dd>
            <dt className="mt-1 border-t border-bz-line-soft pt-2 font-semibold text-bz-text">Total</dt>
            <dd className="m-0 mt-1 border-t border-bz-line-soft pt-2 text-right text-[13px] font-semibold text-bz-text">
              <Money value={ev.total} />
            </dd>
          </dl>
        </Section>

        <div>
          {est && (
            <Section title="Agreed on the estimate">
              {terms ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Fact label="Payment">{terms.payment || "Not set"}</Fact>
                  <Fact label="Delivery">{[terms.delivery, terms.deliverBy ? `by ${day(terms.deliverBy)}` : ""].filter(Boolean).join(", ") || "Not set"}</Fact>
                </div>
              ) : (
                <p className="m-0 text-[12px] text-bz-text-muted">The prices are the ones you accepted.</p>
              )}
              <Link to={dpPath(`requests/${est}`)} className="mt-3 inline-flex min-h-[32px] items-center text-[11.5px] font-semibold text-bz-text underline underline-offset-2 hover:opacity-75">
                See estimate {est}
              </Link>
            </Section>
          )}

          <Section title="Offers you got">
            {ev.applied.length === 0 ? (
              <p className="m-0 text-[12px] text-bz-text-muted">{est ? "The prices are as agreed on the estimate. No offer on top." : "No offer applied to this order."}</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {ev.applied.map((a) => (
                  <li key={a.schemeId} className="flex items-baseline gap-2">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-medium text-bz-text">{a.name}</span>
                      <span className="block text-[11px] text-bz-text-soft">{a.text}</span>
                    </span>
                    <Money value={a.benefit} code={false} className="text-[12px] text-bz-pos-deep" />
                  </li>
                ))}
              </ul>
            )}
            <p className="m-0 mt-3 text-[10.5px] text-bz-text-soft">Kept as they were when you ordered — a later change to an offer does not change this order.</p>
          </Section>

          <Section title="Documents">
            <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
              {docs.map((x) => (
                <li key={x.label} className="flex min-h-[48px] items-center gap-3 py-2">
                  <FileText size={14} className={x.no ? "text-bz-text-muted" : "text-bz-line"} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] text-bz-text">{x.label}</span>
                    <span className="block truncate text-[11px] text-bz-text-soft">{x.no ?? x.pending}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {o.note && !est && (
            <Section title={o.hub.source === "portal" ? "Your note" : "Note"}>
              <p className="m-0 text-[12px] leading-relaxed text-bz-text-muted">{o.note}</p>
            </Section>
          )}
        </div>
      </div>

      <RecordFoot recordId={o.id} audience="portal" author={s.userName} className="mt-12" />
      <PayDialog open={paying} preselect={[o.id]} onClose={() => setPaying(false)} />
      <ChooseOrderDialog pick={choosing} onClose={() => setChoosing(null)} />
    </>
  );
}
