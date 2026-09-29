import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, X } from "lucide-react";
import { cn } from "../ui/utils";
import { Field, NUM, Select, TEXTAREA } from "../sales/bzw";
import { useStore } from "../sales/store";
import { PRODUCTS, SF_NOW, SF_TODAY } from "../salesforce/data";
import { day, dayTime, npr, priceFor, productById } from "../salesforce/engine";
import { Dot, EmptyNote, Fact, Money, ProductThumb, Section } from "../salesforce/ui";
import { DealerShell } from "./shell";
import { Drawer, LIME, PageHead, QtyStepper, RecordFoot } from "./kit";
import { COMPANY, acceptQuote, dealer, dpPath, nextNo, notify, portalUserName, quotesStore } from "./portal";
import type { Quote } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// QUOTATIONS — ask for a price on a big or special order
//
// A request here becomes an estimate on the company's side; once it is priced
// the dealer accepts it and the items land in the cart. The quoted prices ride
// along as a reference on the order (the engine has no per-order price
// override yet — see the report).
// ════════════════════════════════════════════════════════════════════════════

const STATE: Record<Quote["status"], { label: string; tone: "good" | "warn" | "info" }> = {
  requested: { label: "Waiting for our price", tone: "warn" },
  quoted: { label: "Priced", tone: "info" },
  accepted: { label: "Accepted", tone: "good" },
};
const quotedTotal = (q: Quote) => q.lines.reduce((s, l) => s + (l.price ?? 0) * l.qty, 0);

type DraftLine = { productId: string | null; qty: number };

export function DealerQuotesPage() {
  const quotes = useStore(quotesStore);
  const [params, setParams] = useSearchParams();
  const openId = params.get("id");
  const setOpenId = (id: string | null) => setParams(id ? { id } : {}, { replace: !id });
  const [lines, setLines] = React.useState<DraftLine[]>([{ productId: null, qty: 10 }]);
  const [note, setNote] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const open = quotes.find((q) => q.id === openId) ?? null;

  const good = lines.filter((l) => l.productId && l.qty > 0);
  const send = () => {
    setTried(true);
    if (!good.length) return;
    const id = nextNo(quotesStore.get().map((q) => q.id), "QR-", 3);
    quotesStore.set((qs) => [{ id, at: `${SF_TODAY} ${SF_NOW}`, byName: portalUserName(), lines: good.map((l) => ({ productId: l.productId!, qty: l.qty, price: null })), note: note.trim(), status: "requested", estimateNo: null, validTill: null, reply: null, orderId: null, quotedOn: null, acceptedAt: null }, ...qs]);
    notify(`Request ${id} sent — ${COMPANY} usually replies within a day`);
    setLines([{ productId: null, qty: 10 }]);
    setNote("");
    setTried(false);
  };

  return (
    <DealerShell page="quotes">
      <PageHead title="Quotations" sub={`For a big or special order, ask ${COMPANY} for a price. Once we reply, accept it and it goes straight to your cart.`} />

      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Section title="Ask for a price">
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {lines.map((l, i) => {
              const p = l.productId ? productById(l.productId) : null;
              return (
                <li key={i} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <Select
                      trigger="ghost"
                      className={cn("h-10 w-full justify-between text-[12.5px]", tried && !l.productId && i === 0 && "border-bz-red-mark")}
                      value={l.productId}
                      onChange={(v) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, productId: v } : x)))}
                      label={p ? p.name : "Choose an item"}
                      options={PRODUCTS.map((x) => ({ value: x.id, label: x.name, hint: `${x.pack} · NPR ${npr(priceFor(x, dealer()))} now`, group: x.brand, disabled: lines.some((y, j) => j !== i && y.productId === x.id) }))}
                      width={320}
                      searchable
                    />
                  </div>
                  <QtyStepper value={l.qty} onChange={(v) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, qty: Math.max(1, v) } : x)))} unit={p?.unit} compact />
                  <button type="button" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} className="flex size-10 shrink-0 items-center justify-center rounded-bz-md text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-30" aria-label="Remove this item">
                    <X size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => setLines((ls) => [...ls, { productId: null, qty: 10 }])} className="mt-3 inline-flex h-10 items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">
            <Plus size={14} /> Add an item
          </button>
          <Field label="Tell us about the order" className="mt-4">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Who it is for, when you need it, the price you are hoping for…" className={cn(TEXTAREA, "min-h-[84px] bg-bz-surface")} />
          </Field>
          {tried && !good.length && <p className="m-0 mt-2 text-[11.5px] text-bz-red">Choose at least one item.</p>}
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={send} className={LIME}>
              Send request
            </button>
          </div>
        </Section>

        <Section title="Your requests" count={quotes.length}>
          {quotes.length === 0 ? (
            <EmptyNote>No requests yet.</EmptyNote>
          ) : (
            <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
              {quotes.map((q) => (
                <li key={q.id}>
                  <button type="button" onClick={() => setOpenId(q.id)} className="flex min-h-[64px] w-full items-center gap-3 px-1 py-3 text-left hover:bg-bz-paper-warm/60">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-medium text-bz-text">{q.id}</span>
                      <span className="block truncate text-[11px] text-bz-text-soft">
                        {day(q.at)} · {q.lines.map((l) => productById(l.productId).name).join(", ")}
                      </span>
                      <span className="mt-1 block">
                        <Dot tone={STATE[q.status].tone}>{STATE[q.status].label}</Dot>
                      </span>
                    </span>
                    {q.status !== "requested" && <Money value={quotedTotal(q)} code={false} className="shrink-0 text-[12.5px] font-medium text-bz-text" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <QuoteDrawer q={open} onClose={() => setOpenId(null)} />
    </DealerShell>
  );
}

function QuoteDrawer({ q, onClose }: { q: Quote | null; onClose: () => void }) {
  const navigate = useNavigate();
  const d = dealer();
  const expired = !!q?.validTill && q.validTill < SF_TODAY;
  const canAccept = q?.status === "quoted" && !expired;
  return (
    <Drawer
      open={!!q}
      onClose={onClose}
      eyebrow="Quotation"
      title={q?.id ?? ""}
      foot={
        canAccept && q ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                acceptQuote(q);
                notify(`${q.id} accepted — the items are in your cart`);
                navigate(dpPath("order"));
              }}
              className={cn(LIME, "w-full sm:w-auto")}
            >
              Accept and add to cart
            </button>
          </div>
        ) : undefined
      }
    >
      {q && (
        <>
          <p className="m-0 mb-5 flex flex-wrap items-center gap-2 text-[12px] text-bz-text-muted">
            <Dot tone={STATE[q.status].tone}>{STATE[q.status].label}</Dot>
            {q.status === "requested" && `${COMPANY} will reply with an estimate.`}
            {q.status === "quoted" && (expired ? `This price ran out on ${day(q.validTill!)}. Ask again for a fresh one.` : `Held until ${day(q.validTill!)}.`)}
            {q.status === "accepted" && (q.orderId ? `Ordered as ${q.orderId}.` : "You accepted this price.")}
          </p>
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {q.lines.map((l) => {
              const p = productById(l.productId);
              const usual = priceFor(p, d);
              return (
                <li key={l.productId} className="flex min-h-[56px] items-center gap-3 py-2.5">
                  <ProductThumb product={p} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-bz-text">{p.name}</span>
                    <span className={cn("block text-[11px] text-bz-text-soft", NUM)}>
                      {l.qty} {p.unit}s{l.price !== null ? ` × NPR ${npr(l.price)}` : ""}
                      {l.price !== null && l.price < usual && <span className="text-bz-pos-deep"> · usually {npr(usual)}</span>}
                    </span>
                  </span>
                  {l.price !== null ? <Money value={l.price * l.qty} code={false} className="text-[12.5px] text-bz-text" /> : <span className="text-[11px] text-bz-text-soft">—</span>}
                </li>
              );
            })}
          </ul>
          {q.status !== "requested" && (
            <p className={cn("m-0 mt-3 text-right text-[12.5px] text-bz-text", NUM)}>
              <span className="mr-2 text-bz-text-muted">Before VAT</span>
              <Money value={quotedTotal(q)} className="font-semibold" />
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
            <Fact label="Asked by">{q.byName}</Fact>
            <Fact label="Asked on">{dayTime(q.at)}</Fact>
            {q.estimateNo && <Fact label="Our estimate">{q.estimateNo}</Fact>}
            {q.quotedOn && <Fact label="Priced on">{day(q.quotedOn)}</Fact>}
          </div>
          {q.note && (
            <>
              <p className="m-0 mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Your note</p>
              <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-bz-text">{q.note}</p>
            </>
          )}
          {q.reply && (
            <>
              <p className="m-0 mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Our reply</p>
              <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-bz-text">{q.reply}</p>
            </>
          )}
          <RecordFoot
            stacked
            recordId={q.id}
            history={[
              { when: q.at, who: q.byName, what: "asked for a price" },
              ...(q.quotedOn ? [{ when: `${q.quotedOn} 12:00`, who: COMPANY, what: `sent estimate ${q.estimateNo ?? ""}`.trim() }] : []),
              ...(q.acceptedAt ? [{ when: q.acceptedAt, who: d.name, what: `accepted the price${q.orderId ? ` — order ${q.orderId}` : ""}` }] : []),
            ]}
          />
        </>
      )}
    </Drawer>
  );
}
