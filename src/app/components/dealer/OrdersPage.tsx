import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, FileText, Gift, Truck } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { day, dayTime, npr } from "../salesforce/engine";
import { Dot, EmptyNote, Fact, Flag, Money, ProductThumb, Section } from "../salesforce/ui";
import { DealerShell } from "./shell";
import { LIME, MiniTrack, PageHead, Pills, RecordFoot, SOFT, Tracker } from "./kit";
import { COMPANY, addToCart, dpPath, isOpen, onTheWayLine, orderState, snapshotOf, useDealerOrders } from "./portal";
import type { DealerOrder } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// ORDERS — everything the dealer has ordered, and where each one is
//
// A dealer thinks "where is my stuff", not "what is the document state": each
// order reads Placed → Approved → Packed → On the way → Delivered. Its detail
// keeps the prices and offers it was placed with (the snapshot), links the
// sales documents, and offers Reorder and Raise a claim.
// ════════════════════════════════════════════════════════════════════════════

type Filter = "open" | "done" | "all";

export function DealerOrdersPage() {
  const { id } = useParams();
  return id ? <OrderDetail id={id} /> : <OrdersList />;
}

function OrdersList() {
  const orders = useDealerOrders();
  const [f, setF] = React.useState<Filter>("open");
  const open = orders.filter(isOpen);
  const done = orders.filter((o) => !isOpen(o));
  const shown = f === "open" ? open : f === "done" ? done : orders;
  return (
    <DealerShell page="orders">
      <PageHead
        title="Your orders"
        sub="Tap an order to see where it is, what it cost and its bills."
        actions={
          <Link to={dpPath("order")} className={LIME}>
            New order
          </Link>
        }
      />
      <Pills<Filter>
        value={f}
        onChange={setF}
        options={[
          { value: "open", label: "Open", count: open.length },
          { value: "done", label: "Delivered or closed", count: done.length },
          { value: "all", label: "All", count: orders.length },
        ]}
      />
      <div className="mt-6">
        {shown.length === 0 ? (
          <EmptyNote
            action={
              <Link to={dpPath("order")} className={SOFT}>
                Place an order
              </Link>
            }
          >
            No open orders right now.
          </EmptyNote>
        ) : (
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {shown.map((o) => (
              <OrderRow key={o.id} o={o} />
            ))}
          </ul>
        )}
      </div>
    </DealerShell>
  );
}

function OrderRow({ o }: { o: DealerOrder }) {
  const st = orderState(o);
  const ev = snapshotOf(o.id, o.lines, o.at);
  return (
    <li>
      <Link to={dpPath(`orders/${o.id}`)} className="grid min-h-[64px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-1 py-3 hover:bg-bz-paper-warm/60 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_120px]">
        <span className="min-w-0">
          <span className="block text-[12.5px] font-medium text-bz-text">{o.id}</span>
          <span className={cn("block truncate text-[11px] text-bz-text-soft", NUM)}>
            {dayTime(o.at)} · {o.lines.length} items · by {o.byName.split(" ")[0]}
          </span>
        </span>
        <span className="col-start-1 row-start-2 flex items-center gap-2.5 md:col-start-2 md:row-start-1">
          <Dot tone={st.tone}>{st.label}</Dot>
          <span className="hidden sm:inline-flex">
            <MiniTrack stage={o.stage} declined={o.declined} />
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
  const orders = useDealerOrders();
  const o = orders.find((x) => x.id === id);
  if (!o)
    return (
      <DealerShell page="orders">
        <EmptyNote
          action={
            <Link to={dpPath("orders")} className={SOFT}>
              All orders
            </Link>
          }
        >
          We can't find order {id}.
        </EmptyNote>
      </DealerShell>
    );

  const ev = snapshotOf(o.id, o.lines, o.at);
  const st = orderState(o);
  const paid = ev.lines.filter((l) => !l.free);
  const free = ev.lines.filter((l) => l.free);
  const history = [
    { when: o.at, who: o.byName, what: `placed the order in the portal${o.soNo ? ` — sales order ${o.soNo}` : ""}` },
    ...(o.declined ? [{ when: o.at, who: COMPANY, what: `did not accept it${o.reason ? ` — ${o.reason}` : ""}` }] : []),
    ...(o.steps[1] ? [{ when: o.steps[1], who: COMPANY, what: "approved it" }] : []),
    ...(o.steps[2] ? [{ when: o.steps[2], who: `${COMPANY} warehouse`, what: "packed it" }] : []),
    ...(o.steps[3] ? [{ when: o.steps[3], who: COMPANY, what: `sent it${o.vehicle ? ` on ${o.vehicle}` : ""}${o.invoiceNo ? ` with invoice ${o.invoiceNo}` : ""}` }] : []),
    ...(o.steps[4] ? [{ when: o.steps[4], who: "Driver", what: "delivered it and took a signature" }] : []),
  ];
  const docs = [
    { label: "Sales order", no: o.soNo, pending: "Once approved" },
    { label: "Delivery note", no: o.deliveryNo, pending: "When it leaves our warehouse" },
    { label: "Invoice", no: o.invoiceNo, pending: "When it leaves our warehouse" },
  ];

  return (
    <DealerShell page="orders">
      <Link to={dpPath("orders")} className="-ml-1 mb-4 inline-flex h-10 items-center gap-1.5 px-1 text-[12px] text-bz-text-muted hover:text-bz-text">
        <ArrowLeft size={14} /> All orders
      </Link>
      <PageHead
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            Order {o.id} <Dot tone={st.tone}>{st.label}</Dot>
          </span>
        }
        sub={`Placed ${dayTime(o.at)} by ${o.byName}${o.deliverBy ? ` · wanted by ${day(o.deliverBy)}` : ""}`}
        actions={
          <>
            {o.stage >= 3 && (
              <button type="button" onClick={() => navigate(`${dpPath("claims")}?order=${o.id}`)} className={SOFT}>
                Raise a claim or return
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                addToCart(o.lines);
                navigate(dpPath("order"));
              }}
              className={LIME}
            >
              Reorder
            </button>
          </>
        }
      />

      {o.declined && (
        <p className="m-0 mb-6 flex flex-wrap items-center gap-2 text-[12px] text-bz-text-muted">
          <Flag>Not accepted</Flag> {o.reason ?? `${COMPANY} could not take this order.`} Call your sales rep if this looks wrong.
        </p>
      )}
      {!o.declined && o.stage === 0 && (
        <p className="m-0 mb-6 text-[12px] text-bz-text-muted">
          {o.hubStatus === "review" ? `${COMPANY} is checking your credit before approving. Paying overdue invoices speeds this up.` : `${COMPANY} is checking stock and prices. Most orders are approved within the hour.`}
        </p>
      )}

      <Tracker stage={o.stage} steps={o.steps} declined={o.declined} waiting={o.stage === 0 && o.hubStatus === "review"} />

      {o.stage === 3 && (
        <div className="mt-8 flex flex-wrap items-start gap-x-10 gap-y-4 rounded-bz-lg bg-bz-paper-warm px-5 py-4">
          <Truck size={18} className="mt-1 text-bz-text-muted" />
          <Fact label="Arrives">{o.eta ?? onTheWayLine(o)}</Fact>
          {o.vehicle && <Fact label="Vehicle">{o.vehicle}</Fact>}
          {o.driver && <Fact label="Driver">{o.driver}</Fact>}
        </div>
      )}

      <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Section title="What you ordered" count={paid.length}>
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {paid.map((l) => (
              <li key={l.product.id} className="flex min-h-[56px] items-center gap-3 py-2.5">
                <ProductThumb product={l.product} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-bz-text">{l.product.name}</span>
                  <span className={cn("block text-[11px] text-bz-text-soft", NUM)}>
                    {l.qty} {l.product.unit}s × NPR {npr(l.price)}
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
            <dd className="m-0 text-right text-bz-text">{npr(ev.gross)}</dd>
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
          <Section title="Offers you got">
            {ev.applied.length === 0 ? (
              <p className="m-0 text-[12px] text-bz-text-muted">No offer applied to this order.</p>
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
              {docs.map((d) => (
                <li key={d.label} className="flex min-h-[48px] items-center gap-3 py-2">
                  <FileText size={14} className={d.no ? "text-bz-text-muted" : "text-bz-line"} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] text-bz-text">{d.label}</span>
                    <span className="block text-[11px] text-bz-text-soft">{d.no ?? d.pending}</span>
                  </span>
                  {d.no && (
                    <button type="button" disabled title="PDFs come with the app" className="text-[11.5px] font-medium text-bz-text-soft disabled:cursor-not-allowed">
                      PDF
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Section>

          {o.note && (
            <Section title="Your note">
              <p className="m-0 text-[12px] leading-relaxed text-bz-text-muted">{o.note}</p>
            </Section>
          )}
        </div>
      </div>

      <RecordFoot recordId={o.id} history={history} />
    </DealerShell>
  );
}
