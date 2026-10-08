import * as React from "react";
import { Plus, RotateCcw, X } from "lucide-react";
import { cn } from "../ui/utils";
import { CARD, Field, INPUT, NUM, Select, TEXTAREA } from "../sales/bzw";
import { freeQtyOf, isChargeLine, lineName, requestEstimateChanges } from "../sales/estimate-offer";
import type { ChangeAsk, EstimateChangeRequest, EstimateVersion } from "../sales/estimate-offer";
import type { Estimate } from "../sales/flow";
import { termById } from "../sales/orders";
import type { OrderLine } from "../sales/orders";
import { useStore } from "../sales/store";
import { SF_TODAY } from "../salesforce/data";
import { npr, priceFor, productById } from "../salesforce/engine";
import { productsStore } from "../salesforce/store";
import { LIME, QtyStepper, SOFT } from "./kit";
import { addDays, notify, useDealer } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// ASK FOR CHANGES — the dealer's reply to a version
//
// The same table the estimate is read in, with its numbers as boxes. Only the
// company prices (sales/estimate-offer.ts): the dealer never edits the estimate,
// it says what it wants different. Every box starts at the version's own value
// and marks itself once it differs; only what differs goes into the request.
// ════════════════════════════════════════════════════════════════════════════

type LineAsk = { qty: string; price: string; disc: string; free: string; remove: boolean };
type AddLine = { productId: string | null; qty: number };
type Ask = Pick<EstimateChangeRequest, "asks" | "terms">;

const PAD = "px-4 md:px-5";
/** On a phone the name takes its own row and the four boxes share the next one. */
const COLS = "grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_32px] items-start gap-x-2 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_72px_96px_64px_64px_36px] sm:gap-x-3";

/** What the dealer can ask about: every line but the free goods, which are asked for on the line they come with. */
const askable = (v: EstimateVersion) => v.lines.filter((l) => !l.freeOf);
/** The payment wording the dealer reads: what was written, else the name of the term. */
const paymentOf = (v: EstimateVersion) => v.terms.paymentNote.trim() || termById(v.termId)?.name || "";
/**
 * The discount the dealer answers is a percentage. A discount given as an amount reads as its percentage of the line,
 * so the box always starts at what the dealer is shown.
 */
const pctOf = (l: OrderLine) => (l.discountAmt && l.qty * l.rate > 0 ? Math.round((l.discountAmt / (l.qty * l.rate)) * 1000) / 10 : l.discountPct);

const seedLine = (v: EstimateVersion, l: OrderLine): LineAsk => ({ qty: String(l.qty), price: String(l.rate), disc: String(pctOf(l)), free: String(freeQtyOf(v.lines, l.id)), remove: false });
/** What was typed, as a number — undefined for an empty box, which asks for nothing. */
const typed = (s: string) => (s.trim() === "" || !Number.isFinite(Number(s)) ? undefined : Number(s));

function buildAsk(v: EstimateVersion, lines: LineAsk[], add: AddLine[], t: { payment: string; deliverBy: string }): Ask {
  const asks: ChangeAsk[] = [];
  askable(v).forEach((l, i) => {
    const a = lines[i];
    if (!a) return;
    if (a.remove) {
      asks.push({ action: "remove", lineId: l.id });
      return;
    }
    const x: Extract<ChangeAsk, { action: "change" }> = { action: "change", lineId: l.id };
    const qty = typed(a.qty);
    const price = typed(a.price);
    const disc = typed(a.disc);
    const free = typed(a.free);
    if (qty !== undefined && qty !== l.qty) x.qty = qty;
    if (price !== undefined && price !== l.rate) x.rate = price;
    if (disc !== undefined && Math.min(100, disc) !== pctOf(l)) x.discountPct = Math.min(100, disc);
    if (free !== undefined && free !== freeQtyOf(v.lines, l.id)) x.freeQty = free;
    if (Object.keys(x).length > 2) asks.push(x);
  });
  for (const a of add) if (a.productId && a.qty > 0) asks.push({ action: "add", itemId: a.productId, qty: a.qty });
  const terms: Ask["terms"] = {};
  if (t.payment.trim() && t.payment.trim() !== paymentOf(v)) terms.paymentNote = t.payment.trim();
  if (t.deliverBy !== (v.terms.deliverBy ?? "")) terms.deliverBy = t.deliverBy || null;
  return { asks, terms };
}

/** One number the dealer may want different. It marks itself once it differs from the estimate. */
function Want({ label, value, was, onChange, decimal }: { label: string; value: string; was: number; onChange: (v: string) => void; decimal?: boolean }) {
  const n = typed(value);
  const changed = n !== undefined && n !== was;
  return (
    <span className="block">
      <input
        inputMode={decimal ? "decimal" : "numeric"}
        aria-label={label}
        value={value}
        placeholder={String(was)}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => onChange(e.target.value.replace(decimal ? /[^\d.]/g : /\D/g, ""))}
        className={cn(INPUT, "h-9 w-full bg-bz-surface px-2 text-right text-[12.5px]", NUM, changed && "border-bz-text bg-bz-fire/20 font-semibold")}
      />
      {changed && <span className={cn("mt-0.5 block text-right text-[10.5px] text-bz-text-soft", NUM)}>was {was.toLocaleString("en-US")}</span>}
    </span>
  );
}

export function AskForm({ est, v, onCancel, onSent }: { est: Estimate; v: EstimateVersion; onCancel: () => void; onSent: () => void }) {
  const s = useDealer();
  const products = useStore(productsStore);
  const shown = askable(v);
  const [lines, setLines] = React.useState<LineAsk[]>(() => shown.map((l) => seedLine(v, l)));
  const [add, setAdd] = React.useState<AddLine[]>([]);
  const [payment, setPayment] = React.useState(paymentOf(v));
  const [deliverBy, setDeliverBy] = React.useState(v.terms.deliverBy ?? "");
  const [message, setMessage] = React.useState("");

  const ask = buildAsk(v, lines, add, { payment, deliverBy });
  const canSend = ask.asks.length > 0 || Object.keys(ask.terms).length > 0 || message.trim().length > 0;

  const patch = (i: number, p: Partial<LineAsk>) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const patchAdd = (i: number, p: Partial<AddLine>) => setAdd((as) => as.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const onEstimate = (productId: string) => shown.some((l) => l.itemId === productId);
  const canAdd = products.some((p) => !onEstimate(p.id) && !add.some((a) => a.productId === p.id));

  const send = () => {
    if (!canSend) return;
    const res = requestEstimateChanges(est.no, { via: "portal", byName: s.userName, message, ...ask });
    if (res.ok === false) {
      notify(res.refusal, "error");
      onCancel();
      return;
    }
    notify(`Sent to ${s.company}`);
    onSent();
  };

  return (
    <article className={cn(CARD, "overflow-hidden")} aria-label={`Ask for changes on version ${v.no}`}>
      <header className={cn("border-b border-bz-line-soft py-3.5", PAD)}>
        <h2 className="m-0 text-[13px] font-semibold text-bz-text">
          Ask for changes
          <span className="ml-1.5 font-normal text-bz-text-muted">to version {v.no}</span>
        </h2>
      </header>

      <div className={cn(COLS, "border-b border-bz-line-soft py-2 text-[11px] text-bz-text-soft", PAD)}>
        <span className="col-span-full sm:col-span-1">Item</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Price</span>
        <span className="text-right">Disc %</span>
        <span className="text-right">Free</span>
        <span />
      </div>
      <ul className={cn("m-0 list-none divide-y divide-bz-line-soft p-0", PAD)}>
        {shown.map((l, i) => {
          const a = lines[i];
          if (!a) return null;
          const charge = isChargeLine(l);
          return (
            <li key={l.id} className={cn(COLS, "py-2.5")}>
              <span className={cn("col-span-full min-w-0 self-center text-[12.5px] font-medium sm:col-span-1", a.remove ? "text-bz-text-soft line-through" : "text-bz-text")}>{lineName(l)}</span>
              {a.remove ? (
                <span className="col-span-4 self-center text-right text-[11.5px] text-bz-text-muted">Take it off</span>
              ) : (
                <>
                  {charge ? <span /> : <Want label={`Quantity of ${lineName(l)}`} value={a.qty} was={l.qty} onChange={(x) => patch(i, { qty: x })} />}
                  <Want label={`Price of ${lineName(l)}`} value={a.price} was={l.rate} onChange={(x) => patch(i, { price: x })} />
                  {charge ? <span /> : <Want label={`Discount percent on ${lineName(l)}`} value={a.disc} was={pctOf(l)} onChange={(x) => patch(i, { disc: x })} decimal />}
                  {charge ? <span /> : <Want label={`Free quantity of ${lineName(l)}`} value={a.free} was={freeQtyOf(v.lines, l.id)} onChange={(x) => patch(i, { free: x })} />}
                </>
              )}
              <button
                type="button"
                onClick={() => patch(i, { remove: !a.remove })}
                title={a.remove ? "Keep it" : "Take it off"}
                aria-label={a.remove ? `Keep ${lineName(l)}` : `Take ${lineName(l)} off`}
                className="flex size-9 items-center justify-center justify-self-end rounded-bz-md text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text"
              >
                {a.remove ? <RotateCcw size={14} /> : <X size={14} />}
              </button>
            </li>
          );
        })}
        {add.map((a, i) => {
          const p = a.productId ? productById(a.productId) : null;
          return (
            <li key={`add-${i}`} className="flex items-center gap-2 py-2.5">
              <div className="min-w-0 flex-1">
                <Select
                  trigger="ghost"
                  className="h-9 w-full justify-between text-[12.5px]"
                  value={a.productId}
                  onChange={(x) => patchAdd(i, { productId: x })}
                  label={p ? p.name : "Choose a product"}
                  options={products.map((x) => ({
                    value: x.id,
                    label: x.name,
                    hint: onEstimate(x.id) ? "Already on it" : `NPR ${npr(priceFor(x, s.c))}`,
                    group: x.brand || undefined,
                    disabled: onEstimate(x.id) || add.some((y, j) => j !== i && y.productId === x.id),
                  }))}
                  width={320}
                  searchable
                />
              </div>
              <QtyStepper value={a.qty} onChange={(x) => patchAdd(i, { qty: Math.max(1, x) })} unit={p?.unit} compact />
              <button type="button" onClick={() => setAdd((as) => as.filter((_, j) => j !== i))} className="flex size-9 shrink-0 items-center justify-center rounded-bz-md text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text" aria-label="Do not add this product">
                <X size={14} />
              </button>
            </li>
          );
        })}
      </ul>
      {canAdd && (
        <div className={cn("border-t border-bz-line-soft", PAD)}>
          <button type="button" onClick={() => setAdd((as) => [...as, { productId: null, qty: 1 }])} className="inline-flex h-10 items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">
            <Plus size={14} /> Add a product
          </button>
        </div>
      )}

      <div className={cn("grid gap-4 border-t border-bz-line-soft py-4 sm:grid-cols-2", PAD)}>
        <Field label="Payment">
          <input value={payment} onChange={(e) => setPayment(e.target.value)} className={cn(INPUT, "h-10 bg-bz-surface")} />
        </Field>
        <Field label="Needed by">
          <input type="date" value={deliverBy} min={addDays(SF_TODAY, 1)} onChange={(e) => setDeliverBy(e.target.value)} className={cn(INPUT, "h-10 bg-bz-surface")} />
        </Field>
        <Field label="Message" className="sm:col-span-2">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Optional" className={cn(TEXTAREA, "min-h-[72px] bg-bz-surface")} />
        </Field>
      </div>

      <footer className={cn("flex flex-wrap items-center justify-end gap-2 border-t border-bz-line-soft py-3.5", PAD)}>
        <button type="button" onClick={onCancel} className={SOFT}>
          Cancel
        </button>
        <button type="button" disabled={!canSend} onClick={send} className={LIME}>
          Send
        </button>
      </footer>
    </article>
  );
}
