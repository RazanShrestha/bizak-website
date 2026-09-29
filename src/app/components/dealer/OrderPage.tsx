import * as React from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Gift, RotateCcw, Sparkles, X } from "lucide-react";
import { cn } from "../ui/utils";
import { CARD, Field, INPUT, NUM, TEXTAREA } from "../sales/bzw";
import { useStore } from "../sales/store";
import { BRANDS, DEALER_ID, PRODUCTS, SF_TODAY } from "../salesforce/data";
import { evaluate, npr, priceFor, productById, typeOf } from "../salesforce/engine";
import type { Evaluation } from "../salesforce/engine";
import { cartStore, customersStore, schemesStore } from "../salesforce/store";
import { EmptyNote, Money, Progress, ProductThumb, idColor } from "../salesforce/ui";
import { DealerShell } from "./shell";
import { Drawer, LIME, PageHead, Pills, QtyStepper, SearchBox, SOFT } from "./kit";
import { PayDialog } from "./pay";
import { COMPANY, addDays, addToCart, dealer, dpPath, draftStore, liveForMe, notify, quotesStore, schemeItemIds, schemeTag, setQty, submitOrder, useAccount, useDealerOrders, usualItems } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// ORDER — the catalogue at the dealer's own price, and a live cart
//
// Every figure in the cart comes from salesforce/engine `evaluate` — the same
// call the rep app and the Orders hub make — so the schemes, free goods, hints
// and credit check a dealer sees are exactly what the company will see.
// Submitting sends a portal order to the Orders hub (a sales order for us).
// ════════════════════════════════════════════════════════════════════════════

export function DealerOrderPage() {
  const cart = useStore(cartStore);
  const schemes = useStore(schemesStore);
  const customers = useStore(customersStore);
  const orders = useDealerOrders();
  const d = dealer();
  // `customers` changes when a payment frees credit; the engine reads the same customer object.
  const ev = React.useMemo(() => evaluate(DEALER_ID, cart, schemes), [cart, schemes, customers]);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("all");
  const [sheet, setSheet] = React.useState(false);
  const [pay, setPay] = React.useState(false);

  const live = liveForMe(schemes);
  const usual = usualItems(orders);
  const cats = [...new Set(PRODUCTS.map((p) => p.category))];
  const needle = q.trim().toLowerCase();
  const shown = PRODUCTS.filter((p) => (cat === "all" ? true : cat === "usual" ? usual.some((u) => u.productId === p.id) : p.category === cat)).filter((p) => !needle || `${p.name} ${p.code} ${p.brand} ${p.category}`.toLowerCase().includes(needle));
  const groups = BRANDS.map((b) => ({ brand: b, items: shown.filter((p) => p.brand === b) })).filter((g) => g.items.length);
  const qtyOf = (id: string) => cart.find((l) => l.productId === id)?.qty ?? 0;
  const last = orders.find((o) => !o.declined);
  const paidLines = ev.lines.filter((l) => !l.free);

  return (
    <DealerShell page="order">
      <PageHead
        title="Place an order"
        sub={`Prices are yours as a ${typeOf(d).name.toLowerCase()}, before 13% VAT. Offers apply by themselves.`}
        actions={
          last && (
            <button type="button" onClick={() => addToCart(last.lines)} className={SOFT}>
              <RotateCcw size={14} /> Reorder {last.id}
            </button>
          )
        }
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-col gap-3">
            <SearchBox value={q} onChange={setQ} placeholder="Search by name, code or brand" />
            <Pills value={cat} onChange={setCat} options={[{ value: "all", label: "All" }, { value: "usual", label: "Your usual", count: usual.length }, ...cats.map((c) => ({ value: c, label: c }))]} />
          </div>

          {groups.length === 0 && (
            <div className="mt-8">
              <EmptyNote
                action={
                  <button type="button" onClick={() => {
                      setQ("");
                      setCat("all");
                    }} className={SOFT}>
                    Show everything
                  </button>
                }
              >
                Nothing matches “{q}”.
              </EmptyNote>
            </div>
          )}

          {groups.map((g) => (
            <section key={g.brand} className="mt-9">
              <h2 className="m-0 mb-1 flex items-center gap-2 text-[13px] font-semibold text-bz-text">
                <span className="size-2 rounded-[3px]" style={{ background: idColor(g.items[0].tone) }} />
                {g.brand}
                <span className={cn("text-[11.5px] font-normal text-bz-text-soft", NUM)}>{g.items.length}</span>
              </h2>
              <ul className="m-0 list-none divide-y divide-bz-line-soft border-b border-bz-line-soft p-0">
                {g.items.map((p) => {
                  const tags = live.filter((s) => schemeItemIds(s).includes(p.id)).map((s) => ({ id: s.id, name: s.name, tag: schemeTag(s) }));
                  return (
                    <li key={p.id} className="flex min-h-[68px] items-center gap-3 py-3">
                      <ProductThumb product={p} size={44} />
                      <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-[12.5px] font-medium text-bz-text">{p.name}</p>
                        <p className={cn("m-0 mt-0.5 text-[11px] text-bz-text-soft", NUM)}>
                          {p.pack} · <span className="font-semibold text-bz-text">NPR {npr(priceFor(p, d))}</span> a {p.unit}
                        </p>
                        {tags.map((t) => (
                          <span key={t.id} title={t.name} className="mt-1.5 inline-flex items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text">
                            <Gift size={11} className="text-bz-pos-deep" /> {t.tag}
                          </span>
                        ))}
                      </div>
                      <QtyStepper value={qtyOf(p.id)} onChange={(v) => setQty(p.id, v)} unit={p.unit} compact />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <Link to={dpPath("quotes")} className="mt-10 inline-flex items-center gap-1.5 text-[12px] text-bz-text-muted hover:text-bz-text">
            Need a special price for a big order? Ask for a quotation <ArrowRight size={13} />
          </Link>
        </div>

        <aside className="hidden lg:block">
          <div className={cn(CARD, "sticky top-[88px] flex max-h-[calc(100vh-112px)] flex-col")}>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-5 [scrollbar-width:thin]">
              <h2 className="m-0 mb-3 text-[13px] font-semibold text-bz-text">
                Your order {paidLines.length > 0 && <span className={cn("ml-1 text-[11.5px] font-normal text-bz-text-soft", NUM)}>{paidLines.length}</span>}
              </h2>
              <CartBody ev={ev} />
            </div>
            {paidLines.length > 0 && (
              <div className="border-t border-bz-line-soft px-5 py-4">
                <CartSubmit ev={ev} onPay={() => setPay(true)} />
              </div>
            )}
          </div>
        </aside>
      </div>

      {paidLines.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-bz-line-soft bg-bz-surface/95 backdrop-blur md:bottom-0 lg:hidden">
          <div className="mx-auto flex max-w-[1080px] items-center gap-3 px-4 py-2.5 md:px-8">
            <div className="min-w-0 flex-1">
              <p className={cn("m-0 text-[12.5px] font-semibold text-bz-text", NUM)}>
                {paidLines.length} {paidLines.length === 1 ? "item" : "items"} · <Money value={ev.total} />
              </p>
              <p className={cn("m-0 truncate text-[11px]", ev.credit.ok ? "text-bz-text-soft" : "text-bz-red")}>
                {!ev.credit.ok ? "Needs approval — tap to see why" : ev.applied.length ? `${ev.applied.length} ${ev.applied.length === 1 ? "offer" : "offers"} applied` : "Includes 13% VAT"}
              </p>
            </div>
            <button type="button" onClick={() => setSheet(true)} className={LIME}>
              Review order
            </button>
          </div>
        </div>
      )}

      <Drawer open={sheet} onClose={() => setSheet(false)} eyebrow={d.name} title="Your order" foot={paidLines.length > 0 && <CartSubmit ev={ev} onPay={() => setPay(true)} />}>
        <CartBody ev={ev} />
      </Drawer>
      <PayDialog open={pay} onClose={() => setPay(false)} />
    </DealerShell>
  );
}

// ── The cart ────────────────────────────────────────────────────────────────

function CartBody({ ev }: { ev: Evaluation }) {
  const draft = useStore(draftStore);
  const quotes = useStore(quotesStore);
  const schemes = useStore(schemesStore);
  const cart = useStore(cartStore);
  const d = dealer();
  const paid = ev.lines.filter((l) => !l.free);
  const free = ev.lines.filter((l) => l.free);
  const quote = draft.quoteId ? quotes.find((x) => x.id === draft.quoteId) : null;

  if (!paid.length) return <p className="m-0 py-6 text-center text-[12px] text-bz-text-muted">Your cart is empty. Add items from the list.</p>;

  const quoteSaving = quote ? quote.lines.reduce((s, l) => s + (l.price === null ? 0 : (priceFor(productById(l.productId), d) - l.price) * l.qty), 0) : 0;
  const nudge = (schemeId: string, text: string) => {
    const n = Number(/^Add (\d+) more/.exec(text)?.[1] ?? 0);
    const s = schemes.find((x) => x.id === schemeId);
    if (!n || !s) return null;
    const ids = schemeItemIds(s);
    const target = [...cart].filter((l) => ids.includes(l.productId)).sort((a, b) => b.qty - a.qty)[0]?.productId ?? ids[0];
    return { n, target };
  };

  return (
    <div className="flex flex-col gap-6">
      {quote && (
        <div className="flex items-start gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2.5 text-[11.5px] text-bz-text-muted">
          <span className="min-w-0 flex-1">
            From quotation <span className="font-semibold text-bz-text">{quote.id}</span>. {COMPANY} applies the quoted prices when it confirms{quoteSaving > 0 ? ` — about NPR ${npr(quoteSaving)} less than shown here` : ""}.
          </span>
          <button type="button" onClick={() => draftStore.set((x) => ({ ...x, quoteId: null }))} className="shrink-0 text-bz-text-soft hover:text-bz-text" aria-label="Not from this quotation">
            <X size={13} />
          </button>
        </div>
      )}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {paid.map((l) => (
          <li key={l.product.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-[12.5px] font-medium text-bz-text">{l.product.name}</p>
              <p className={cn("m-0 text-[11px] text-bz-text-soft", NUM)}>
                NPR {npr(l.price)} × {l.qty}
                {l.discount > 0 && <span className="text-bz-pos-deep"> · −{npr(l.discount)}</span>}
              </p>
            </div>
            <QtyStepper value={l.qty} onChange={(v) => setQty(l.product.id, v)} unit={l.product.unit} compact />
          </li>
        ))}
        {free.map((l, i) => (
          <li key={`free-${i}`} className="flex items-center gap-3">
            <Gift size={14} className="shrink-0 text-bz-pos-deep" />
            <p className="m-0 min-w-0 flex-1 truncate text-[12px] text-bz-text">
              {l.qty} {l.product.unit} {l.product.name}
            </p>
            <span className="text-[11px] font-semibold text-bz-pos-deep">Free</span>
          </li>
        ))}
      </ul>

      {ev.hints.length > 0 && (
        <div className="flex flex-col gap-3">
          {ev.hints.map((h) => {
            const act = nudge(h.schemeId, h.text);
            return (
              <div key={h.schemeId} className="flex items-center gap-3">
                <Sparkles size={14} className="shrink-0 text-bz-amber" />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[12px] font-medium text-bz-text">{h.text}</p>
                  <p className="m-0 mb-1 text-[10.5px] text-bz-text-soft">{h.name}</p>
                  <Progress pct={h.progress * 100} tone="warn" />
                </div>
                {act && (
                  <button type="button" onClick={() => setQty(act.target, (cart.find((c) => c.productId === act.target)?.qty ?? 0) + act.n)} className={cn(SOFT, "h-9 shrink-0 px-2.5")} title={`Add ${act.n} ${productById(act.target).name}`}>
                    +{act.n}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {ev.applied.length > 0 && (
        <div>
          <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Offers applied</p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {ev.applied.map((a) => (
              <li key={a.schemeId} className="flex items-baseline gap-2 text-[11.5px]">
                <span className="min-w-0 flex-1 text-bz-text">
                  {a.name} <span className="text-bz-text-soft">· {a.text}</span>
                </span>
                <span className={cn("shrink-0 text-bz-pos-deep", NUM)}>{npr(a.benefit)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className={cn("m-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-[12px]", NUM)}>
        <dt className="text-bz-text-muted">Items</dt>
        <dd className="m-0 text-right text-bz-text">{npr(ev.gross)}</dd>
        {ev.discount > 0 && (
          <>
            <dt className="text-bz-text-muted">Offer discounts</dt>
            <dd className="m-0 text-right text-bz-pos-deep">−{npr(ev.discount)}</dd>
          </>
        )}
        {ev.freeValue > 0 && (
          <>
            <dt className="text-bz-text-muted">Free goods worth</dt>
            <dd className="m-0 text-right text-bz-text-soft">{npr(ev.freeValue)}</dd>
          </>
        )}
        <dt className="text-bz-text-muted">VAT 13%</dt>
        <dd className="m-0 text-right text-bz-text">{npr(ev.tax)}</dd>
        <dt className="mt-1.5 border-t border-bz-line-soft pt-2 text-[12.5px] font-semibold text-bz-text">Total</dt>
        <dd className="m-0 mt-1.5 border-t border-bz-line-soft pt-2 text-right text-[17px] font-semibold text-bz-text">
          <Money value={ev.total} />
        </dd>
      </dl>

      <CreditLine ev={ev} />

      <div className="flex flex-col gap-3">
        <Field label="Deliver by">
          <input type="date" value={draft.deliverBy} min={addDays(SF_TODAY, 1)} onChange={(e) => draftStore.set((x) => ({ ...x, deliverBy: e.target.value }))} className={cn(INPUT, "h-10 bg-bz-surface")} />
        </Field>
        <Field label="Note for us">
          <textarea value={draft.note} onChange={(e) => draftStore.set((x) => ({ ...x, note: e.target.value }))} placeholder="Gate timing, who to call…" className={cn(TEXTAREA, "min-h-[60px] bg-bz-surface")} />
        </Field>
      </div>
    </div>
  );
}

function CreditLine({ ev }: { ev: Evaluation }) {
  const c = ev.credit;
  const used = c.available > 0 ? (ev.total / c.available) * 100 : 100;
  return (
    <div>
      <div className={cn("mb-1.5 flex items-baseline justify-between text-[11.5px]", NUM)}>
        <span className="text-bz-text-muted">You can spend</span>
        <Money value={c.available} className="text-bz-text" />
      </div>
      <Progress pct={used} tone={c.after < 0 ? "danger" : used > 80 ? "warn" : "good"} />
      <div className={cn("mt-1.5 flex items-baseline justify-between text-[11.5px]", NUM)}>
        <span className="text-bz-text-muted">Left after this order</span>
        <Money value={c.after} className={c.after < 0 ? "font-semibold text-bz-red" : "text-bz-text"} />
      </div>
    </div>
  );
}

function CartSubmit({ ev, onPay }: { ev: Evaluation; onPay: () => void }) {
  const navigate = useNavigate();
  const cart = useStore(cartStore);
  const draft = useStore(draftStore);
  const acct = useAccount();
  const c = ev.credit;
  const blocked = !c.ok && c.stop === "hard";
  const overdue = acct.overdue > 0 ? acct.overdue : c.overdue;
  const why = c.ok
    ? null
    : blocked
      ? c.overdue > 0
        ? `You have NPR ${npr(overdue)} overdue. Pay it to place this order.`
        : `This is NPR ${npr(-c.after)} more than you can spend. Pay first to place it.`
      : c.overdue > 0
        ? `You have NPR ${npr(overdue)} overdue, so ${COMPANY} approves this order first.`
        : `This is NPR ${npr(-c.after)} more than you can spend, so it needs approval.`;
  const ready = ev.lines.some((l) => !l.free) && !!draft.deliverBy;

  const submit = () => {
    const o = submitOrder(ev, cart);
    notify(o.status === "review" ? `Order ${o.id} sent for approval` : o.status === "approved" ? `Order ${o.id} placed and approved` : `Order ${o.id} placed`);
    navigate(dpPath(`orders/${o.id}`));
  };

  return (
    <div className="flex flex-col gap-3">
      {why && <p className="m-0 text-[11.5px] leading-relaxed text-bz-red">{why}</p>}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {!c.ok && (
          <button type="button" onClick={onPay} className={blocked ? LIME : SOFT}>
            Pay now
          </button>
        )}
        {!blocked && (
          <button type="button" disabled={!ready} onClick={submit} className={cn(LIME, "flex-1 sm:flex-none")}>
            {c.ok ? "Place order" : "Submit for approval"}
          </button>
        )}
      </div>
    </div>
  );
}
