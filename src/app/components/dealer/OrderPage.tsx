import * as React from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Gift, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "../ui/utils";
import { CARD, Field, INPUT, NUM, TEXTAREA } from "../sales/bzw";
import { useStore } from "../sales/store";
import { SF_NOW, SF_TODAY } from "../salesforce/data";
import { evaluate, npr, priceFor, productById } from "../salesforce/engine";
import type { Evaluation } from "../salesforce/engine";
import { customersStore, hubStore, ledgerStore, productsStore, schemesStore } from "../salesforce/store";
import { EmptyNote, Money, Progress, ProductThumb, idColor } from "../salesforce/ui";
import { DealerShell, pagesFor } from "./shell";
import { CreditLine, Drawer, LIME, PageHead, Pills, QtyStepper, SearchBox, SOFT, Unavailable } from "./kit";
import { PayDialog } from "./pay";
import { addDays, addToCart, boughtLines, cap, dpPath, isFirstOrder, liveFor, notify, schemeItemIds, schemeTag, setDraft, setQty, submitOrder, useCart, useDealer, useDealerOrders, useDraft, usualItems } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// ORDER — the catalogue at the dealer's own price, and a live cart
//
// Every figure in the cart comes from salesforce/engine `evaluate` — the same
// call the rep app and the Orders hub make — so the schemes, free goods, hints
// and credit check a dealer sees are exactly what the company will see.
// Submitting places a sales order — pending until the company approves it.
// ════════════════════════════════════════════════════════════════════════════

export function DealerOrderPage() {
  return (
    <DealerShell page="order">
      <OrderInner />
    </DealerShell>
  );
}

/** One evaluation of this dealer's cart, recounted whenever a price, scheme, balance or the cart changes. */
function useCartEvaluation() {
  const s = useDealer();
  const cart = useCart(s.c.id);
  const schemes = useStore(schemesStore);
  const products = useStore(productsStore);
  const ledger = useStore(ledgerStore);
  const customers = useStore(customersStore);
  const hub = useStore(hubStore);
  const first = isFirstOrder(s.c.id, hub);
  // The engine reads products, customers and the ledger from the stores; they are listed so an edit recounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => evaluate(s.c.id, cart, schemes, { firstOrder: first }), [s.c.id, cart, schemes, products, ledger, customers, first, s.type]);
}

function OrderInner() {
  const s = useDealer();
  const d = s.c;
  const cart = useCart(d.id);
  const schemes = useStore(schemesStore);
  const products = useStore(productsStore);
  const orders = useDealerOrders(d.id, s.company);
  const ev = useCartEvaluation();
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("all");
  const [sheet, setSheet] = React.useState(false);
  const [pay, setPay] = React.useState(false);
  if (!pagesFor(s).has("order")) return <Unavailable what="Ordering online" />;

  const live = liveFor(schemes, d);
  const usual = usualItems(orders);
  const cats = [...new Set(products.map((p) => p.category || "Other"))].sort();
  const needle = q.trim().toLowerCase();
  const shown = products
    .filter((p) => (cat === "all" ? true : cat === "usual" ? usual.some((u) => u.productId === p.id) : (p.category || "Other") === cat))
    .filter((p) => !needle || `${p.name} ${p.code} ${p.brand} ${p.category}`.toLowerCase().includes(needle));
  const brands = [...new Set(shown.map((p) => p.brand || "Other"))].sort();
  const groups = brands.map((b) => ({ brand: b, items: shown.filter((p) => (p.brand || "Other") === b) }));
  const qtyOf = (id: string) => cart.find((l) => l.productId === id)?.qty ?? 0;
  const last = orders.find((o) => !o.declined);
  const paidLines = ev.lines.filter((l) => !l.free);

  return (
    <>
      <PageHead
        title="Place an order"
        sub={`Prices are yours as a ${s.type.name.toLowerCase()}, before 13% VAT. Offers apply by themselves.`}
        actions={
          last && (
            <button type="button" onClick={() => addToCart(d.id, boughtLines(last.lines))} className={SOFT}>
              <RotateCcw size={14} /> Reorder {last.id}
            </button>
          )
        }
      />

      {products.length === 0 ? (
        <EmptyNote
          action={
            <Link to="/design/salesforce/products" className={SOFT}>
              Add products in Sales force
            </Link>
          }
        >
          There is nothing to order yet — {s.company} has not listed any products.
        </EmptyNote>
      ) : (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <div className="min-w-0">
            <div className="flex flex-col gap-3">
              <SearchBox value={q} onChange={setQ} placeholder="Search by name, code or brand" />
              <Pills value={cat} onChange={setCat} options={[{ value: "all", label: "All" }, ...(usual.length ? [{ value: "usual", label: "Your usual", count: usual.length }] : []), ...cats.map((c) => ({ value: c, label: c }))]} />
            </div>

            {groups.length === 0 && (
              <div className="mt-8">
                <EmptyNote
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setQ("");
                        setCat("all");
                      }}
                      className={SOFT}
                    >
                      Show everything
                    </button>
                  }
                >
                  Nothing matches{q ? ` “${q}”` : " this filter"}.
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
                    const tags = live.filter((x) => schemeItemIds(x).includes(p.id)).map((x) => ({ id: x.id, name: x.name, tag: schemeTag(x) }));
                    return (
                      <li key={p.id} className="flex min-h-[68px] items-center gap-3 py-3">
                        <ProductThumb product={p} size={44} />
                        <div className="min-w-0 flex-1">
                          <p className="m-0 truncate text-[12.5px] font-medium text-bz-text">{p.name}</p>
                          <p className={cn("m-0 mt-0.5 text-[11px] text-bz-text-soft", NUM)}>
                            {p.pack && `${p.pack} · `}
                            <span className="font-semibold text-bz-text">NPR {npr(priceFor(p, d))}</span> a {p.unit || "unit"}
                          </p>
                          {tags
                            .filter((t) => t.tag)
                            .map((t) => (
                              <span key={t.id} title={t.name} className="mr-1.5 mt-1.5 inline-flex items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text">
                                <Gift size={11} className="text-bz-pos-deep" /> {t.tag}
                              </span>
                            ))}
                        </div>
                        <QtyStepper value={qtyOf(p.id)} onChange={(v) => setQty(d.id, p.id, v)} unit={p.unit} compact />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            {s.settings.can.rfq && (
              <Link to={dpPath("requests/new")} className="mt-10 inline-flex items-center gap-1.5 text-[12px] text-bz-text-muted hover:text-bz-text">
                Need a special price for a big order? Ask for a price <ArrowRight size={13} />
              </Link>
            )}
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
      )}

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
      {s.settings.can.pay && <PayDialog open={pay} onClose={() => setPay(false)} />}
    </>
  );
}

// ── The cart ────────────────────────────────────────────────────────────────

function CartBody({ ev }: { ev: Evaluation }) {
  const s = useDealer();
  const d = s.c;
  const draft = useDraft(d.id);
  const schemes = useStore(schemesStore);
  const cart = useCart(d.id);
  const paid = ev.lines.filter((l) => !l.free);
  const free = ev.lines.filter((l) => l.free);

  if (!paid.length) return <p className="m-0 py-6 text-center text-[12px] text-bz-text-muted">Your cart is empty. Add items from the list.</p>;

  const nudge = (schemeId: string, text: string) => {
    const n = Number(/^Add (\d+) more/.exec(text)?.[1] ?? 0);
    const x = schemes.find((y) => y.id === schemeId);
    if (!n || !x) return null;
    const ids = schemeItemIds(x);
    const target = [...cart].filter((l) => ids.includes(l.productId)).sort((a, b) => b.qty - a.qty)[0]?.productId ?? ids[0];
    return target ? { n, target } : null;
  };

  return (
    <div className="flex flex-col gap-6">
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
            <QtyStepper value={l.qty} onChange={(v) => setQty(d.id, l.product.id, v)} unit={l.product.unit} compact />
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
                  <button type="button" onClick={() => setQty(d.id, act.target, (cart.find((c) => c.productId === act.target)?.qty ?? 0) + act.n)} className={cn(SOFT, "h-9 shrink-0 px-2.5")} title={`Add ${act.n} ${productById(act.target).name}`}>
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
          <input type="date" value={draft.deliverBy} min={addDays(SF_TODAY, 1)} onChange={(e) => setDraft(d.id, { deliverBy: e.target.value })} className={cn(INPUT, "h-10 bg-bz-surface")} />
        </Field>
        <Field label="Note for us">
          <textarea value={draft.note} onChange={(e) => setDraft(d.id, { note: e.target.value })} placeholder="Gate timing, who to call…" className={cn(TEXTAREA, "min-h-[60px] bg-bz-surface")} />
        </Field>
      </div>
    </div>
  );
}

function CartSubmit({ ev, onPay }: { ev: Evaluation; onPay: () => void }) {
  const navigate = useNavigate();
  const s = useDealer();
  const cart = useCart(s.c.id);
  const draft = useDraft(s.c.id);
  const { minOrder, autoApproveUpTo, cutoff, can } = s.settings;
  const c = ev.credit;
  const short = minOrder > 0 && ev.total < minOrder;
  const ready = ev.lines.some((l) => !l.free) && !!draft.deliverBy && !short;
  const autoOk = c.ok && ev.total <= autoApproveUpTo;
  const late = cutoff && SF_NOW > cutoff;

  const submit = () => {
    if (!ready) return;
    const o = submitOrder(s, ev, cart, draft);
    notify(
      o.status === "approved"
        ? `Order ${o.id} placed and approved`
        : o.status === "review"
          ? `Order ${o.id} sent — ${s.company} approves it first`
          : `Order ${o.id} placed — ${s.company} will check it`,
    );
    navigate(dpPath(`orders/${o.id}`));
  };

  return (
    <div className="flex flex-col gap-3">
      {!c.ok && c.reason && (
        <p className="m-0 text-[11.5px] leading-relaxed text-bz-red">
          {c.reason}. {c.stop === "hard" ? `${cap(s.company)} has to approve this order — paying first is quickest.` : `${cap(s.company)} approves this order first.`}
        </p>
      )}
      {c.ok && !autoOk && <p className="m-0 text-[11.5px] leading-relaxed text-bz-text-muted">Orders over NPR {npr(autoApproveUpTo)} are checked by {s.company} before they are approved.</p>}
      {short && <p className="m-0 text-[11.5px] leading-relaxed text-bz-text-muted">The smallest order is NPR {npr(minOrder)}. Add NPR {npr(minOrder - ev.total)} more.</p>}
      {late && <p className="m-0 text-[11px] text-bz-text-soft">Orders after {cutoff} are handled the next working day.</p>}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {!c.ok && can.pay && (
          <button type="button" onClick={onPay} className={SOFT}>
            Pay now
          </button>
        )}
        <button type="button" disabled={!ready} onClick={submit} className={cn(LIME, "flex-1 sm:flex-none")}>
          {c.ok ? "Place order" : "Send for approval"}
        </button>
      </div>
    </div>
  );
}
