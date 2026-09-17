import * as React from "react";
import { ChevronRight, Lock, Truck, ReceiptText } from "lucide-react";
import { cn } from "../ui/utils";
import { Amount, Order, OrderLine, LOCATIONS, LOTS, TODAY, addDays, fmtQty, fmtShort, itemById, lineNet, locationById, readyToInvoice, remainingToDeliver, remainingToInvoice, termById, totalsOf } from "./orders";
import { BTN, Checkbox, GHOST, INPUT_SM, LABEL, NUM, NumberField, Refusal, Select, Switch, Kbd } from "./bzw";

// ════════════════════════════════════════════════════════════════════════════
// FULFIL SHEET — deliver or invoice without leaving the order
//
// Today an order reaches its invoice through at least five full page loads
// (list → view → delivery form → delivery view → back → invoice form). This is
// that whole trip as one step inside the panel, pre-filled from what is LEFT:
//
//   • quantities default to what remains — minus anything already sitting on a
//     document that is awaiting approval, so the same units are never put on
//     two deliveries (or billed twice) while an approver is away;
//   • lot-tracked lines are allocated first-expiry-first-out and stay editable;
//   • a line the chosen warehouse cannot cover says so beside the line, and the
//     commit REFUSES with the reason — it is never a silently disabled button;
//   • "Invoice it next" chains straight into the invoice sheet. The invoice
//     still points at the ORDER lines, never at the delivery (see orders.tsx
//     rule 3).
//
// A full delivery form still exists for the rare case this cannot express
// (bins, serials per unit, freight) — the sheet links to it, it does not
// pretend to be it.
// ════════════════════════════════════════════════════════════════════════════

export type DeliveryPayload = {
  locationId: string;
  date: string;
  vehicle: string;
  lines: { lineId: string; qty: number; lots?: { lot: string; qty: number }[] }[];
};

export type InvoicePayload = { date: string; due: string; lines: { lineId: string; qty: number }[] };

/** Units of this line already on a document of `kind` that is awaiting approval. */
export function pendingOn(o: Order, l: OrderLine, kind: "delivery" | "invoice") {
  return o.docs
    .filter((d) => d.kind === kind && d.state === "pending")
    .reduce((s, d) => s + d.lines.filter((x) => x.lineId === l.id).reduce((a, x) => a + x.qty, 0), 0);
}

/** "30 pkg + 30 hrs" — quantities of different units are never added together. */
export function unitsLabel(parts: { unit: string; qty: number }[]) {
  const by = new Map<string, number>();
  parts.forEach((p) => by.set(p.unit, (by.get(p.unit) ?? 0) + p.qty));
  return [...by].map(([u, q]) => `${fmtQty(q)} ${u}`).join(" + ");
}

const isStock = (l: OrderLine) => Object.keys(itemById(l.itemId)?.onHand ?? {}).length > 0;

/** First-expiry-first-out; lots without an expiry go last. */
function allocate(itemId: string, locationId: string, need: number) {
  const lots = locationId === "L-KTM" ? [...(LOTS[itemId] ?? [])] : [];
  lots.sort((a, b) => (a.expiry ?? "9999").localeCompare(b.expiry ?? "9999"));
  let left = need;
  return lots.map((lot) => {
    const take = Math.max(0, Math.min(lot.qty, left));
    left -= take;
    return { ...lot, take };
  });
}

export function FulfilSheet({
  order,
  kind,
  onCancel,
  onDeliver,
  onInvoice,
}: {
  order: Order;
  kind: "delivery" | "invoice";
  onCancel: () => void;
  onDeliver: (p: DeliveryPayload, thenInvoice: boolean) => void;
  onInvoice: (p: InvoicePayload) => void;
}) {
  return kind === "delivery" ? <DeliverySheet order={order} onCancel={onCancel} onCommit={onDeliver} /> : <InvoiceSheet order={order} onCancel={onCancel} onCommit={onInvoice} />;
}

// ── Delivery ────────────────────────────────────────────────────────────────

type Lot = { lot: string; expiry: string | null; qty: number; take: number };

function DeliverySheet({ order, onCancel, onCommit }: { order: Order; onCancel: () => void; onCommit: (p: DeliveryPayload, thenInvoice: boolean) => void }) {
  const [locationId, setLocationId] = React.useState(order.locationId);
  const [date, setDate] = React.useState(TODAY);
  const [vehicle, setVehicle] = React.useState("");
  const [thenInvoice, setThenInvoice] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);

  const open = order.lines.map((l) => ({ l, left: Math.max(0, remainingToDeliver(l) - pendingOn(order, l, "delivery")), pend: pendingOn(order, l, "delivery") }));

  const defaults = React.useCallback(
    (loc: string) => {
      const qty: Record<string, number> = {};
      const lots: Record<string, Lot[]> = {};
      for (const { l, left } of open) {
        const it = itemById(l.itemId)!;
        if (it.lotTracked) {
          lots[l.id] = allocate(l.itemId, loc, left);
          qty[l.id] = lots[l.id].reduce((s, x) => s + x.take, 0);
        } else if (isStock(l)) {
          qty[l.id] = Math.min(left, it.onHand[loc] ?? 0);
        } else {
          qty[l.id] = left;
        }
      }
      return { qty, lots };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order],
  );

  const [state, setState] = React.useState(() => defaults(order.locationId));
  const changeLocation = (loc: string) => {
    setLocationId(loc);
    setState(defaults(loc));
    setRefusal(null);
  };

  const setQty = (lineId: string, v: number) => setState((s) => ({ ...s, qty: { ...s.qty, [lineId]: v } }));
  const setLotTake = (lineId: string, lot: string, v: number) =>
    setState((s) => {
      const lots = (s.lots[lineId] ?? []).map((x) => (x.lot === lot ? { ...x, take: Math.max(0, Math.min(x.qty, v)) } : x));
      return { lots: { ...s.lots, [lineId]: lots }, qty: { ...s.qty, [lineId]: lots.reduce((a, x) => a + x.take, 0) } };
    });

  const rows = open.filter((r) => r.left > 0 || r.pend > 0);
  const lines = rows.filter((r) => (state.qty[r.l.id] ?? 0) > 0);
  const units = lines.reduce((s, r) => s + state.qty[r.l.id], 0);
  const locName = locationById(locationId)?.name;

  const commit = () => {
    if (lines.length === 0) return setRefusal("Nothing to deliver. Set a quantity on at least one line.");
    for (const { l, left } of rows) {
      const q = state.qty[l.id] ?? 0;
      const it = itemById(l.itemId)!;
      if (q > left) return setRefusal(`Only ${fmtQty(left)} left to deliver on ${it.name}.`);
      if (isStock(l) && !it.lotTracked && q > (it.onHand[locationId] ?? 0)) return setRefusal(`Only ${fmtQty(it.onHand[locationId] ?? 0)} on hand at ${locName} for ${it.name}.`);
    }
    onCommit(
      {
        locationId,
        date,
        vehicle,
        lines: lines.map((r) => ({
          lineId: r.l.id,
          qty: state.qty[r.l.id],
          lots: state.lots[r.l.id]?.filter((x) => x.take > 0).map((x) => ({ lot: x.lot, qty: x.take })),
        })),
      },
      thenInvoice,
    );
  };

  return (
    <SheetFrame
      onCommit={commit}
      foot={
        <>
          <span className={cn("text-[12px] text-bz-text-muted", NUM)}>
            <span className="font-semibold text-bz-text">{lines.length}</span> line{lines.length === 1 ? "" : "s"}
            {units > 0 && <> · {unitsLabel(lines.map((r) => ({ unit: itemById(r.l.itemId)!.unit, qty: state.qty[r.l.id] })))}</>}
          </span>
          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-[11.5px] text-bz-text-muted" title="Opens the invoice for these units as soon as the delivery is saved">
            <Checkbox on={thenInvoice} onChange={setThenInvoice} label="Invoice it next" /> Invoice it next
          </label>
          <button type="button" className={GHOST} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={commit}>
            <Truck size={13} /> Create delivery <Kbd>⌘↵</Kbd>
          </button>
        </>
      }
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
    >
      <div className="grid grid-cols-1 gap-3 px-5 pt-4 sm:grid-cols-3">
        <SheetField label="Deliver from">
          <Select
            trigger="ghost"
            className="h-8 w-full justify-between"
            label={locName}
            value={locationId}
            onChange={changeLocation}
            width={220}
            options={LOCATIONS.map((l) => ({ value: l.id, label: l.name }))}
          />
        </SheetField>
        <SheetField label="Delivery date">
          <input type="date" value={date} max={TODAY} onChange={(e) => setDate(e.target.value)} className={cn(INPUT_SM, NUM)} />
        </SheetField>
        <SheetField label="Vehicle no." optional>
          <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="Ba 2 Kha 4417" className={INPUT_SM} />
        </SheetField>
      </div>

      <div className="flex items-center gap-2 px-5 pb-2 pt-5">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">What goes on this delivery</h3>
        <button type="button" className="ml-auto text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={() => setState(defaults(locationId))}>
          Fill what's left
        </button>
        <button
          type="button"
          className="text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text"
          onClick={() => setState((s) => ({ qty: Object.fromEntries(Object.keys(s.qty).map((k) => [k, 0])), lots: Object.fromEntries(Object.entries(s.lots).map(([k, v]) => [k, v.map((x) => ({ ...x, take: 0 }))])) }))}
        >
          Clear quantities
        </button>
      </div>

      <div className="px-5 pb-5">
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          <div className={cn("hidden grid-cols-[minmax(0,1fr)_72px_84px_118px] items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
            <span>Item</span>
            <span className="text-right">Left</span>
            <span className="text-right">On hand</span>
            <span className="text-center">Deliver now</span>
          </div>
          {rows.map(({ l, left, pend }) => {
            const it = itemById(l.itemId)!;
            const stock = isStock(l);
            const onHand = it.onHand[locationId] ?? 0;
            const q = state.qty[l.id] ?? 0;
            const short = stock && !it.lotTracked && left > onHand;
            const lots = state.lots[l.id];
            const over = q > left || (stock && !it.lotTracked && q > onHand);
            return (
              <div key={l.id} className={cn("border-b border-bz-line-soft last:border-0", left === 0 && "bg-bz-paper")}>
                <div className="grid grid-cols-[minmax(0,1fr)_118px] items-center gap-3 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_72px_84px_118px]">
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] text-bz-text">{it.name}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {fmtQty(l.delivered)} of {fmtQty(l.qty)} {it.unit} delivered
                      <span className="sm:hidden"> · {fmtQty(left)} left{stock ? ` · ${fmtQty(onHand)} on hand` : ""}</span>
                      {pend > 0 && <span className="text-bz-text-muted"> · {fmtQty(pend)} on a delivery awaiting approval</span>}
                    </span>
                  </span>
                  <span className={cn("hidden text-right text-[12.5px] text-bz-text sm:block", NUM)}>{fmtQty(left)}</span>
                  <span className={cn("hidden text-right text-[12px] sm:block", NUM, !stock ? "text-bz-text-soft" : short || onHand === 0 ? "font-semibold text-bz-red" : "text-bz-text-muted")}>
                    {stock ? fmtQty(onHand) : "Service"}
                  </span>
                  <span className="flex justify-center">
                    {left === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-bz-text-soft" title="Everything left is on a delivery awaiting approval">
                        <Lock size={11} /> Pending
                      </span>
                    ) : it.lotTracked ? (
                      <span className={cn("text-[12.5px] font-semibold text-bz-text", NUM)} title="Set by the lots below">
                        {fmtQty(q)}
                      </span>
                    ) : (
                      <NumberField value={q} onChange={(v) => setQty(l.id, v)} max={left} invalid={over} className="w-[104px]" ariaLabel={`Deliver now — ${it.name}`} />
                    )}
                  </span>
                </div>
                {it.lotTracked && left > 0 && (
                  <div className="px-3 pb-2.5">
                    {lots && lots.length > 0 ? (
                      <div className="ml-3 flex flex-col gap-1 border-l border-bz-line-soft pl-3">
                        {lots.map((x) => (
                          <div key={x.lot} className="grid grid-cols-[minmax(0,1fr)_90px_104px] items-center gap-3">
                            <span className={cn("truncate text-[11.5px] text-bz-text", NUM)}>
                              {x.lot}
                              <span className="ml-2 text-bz-text-soft">{x.expiry ? `exp ${fmtShort(x.expiry)}` : "no expiry"}</span>
                            </span>
                            <span className={cn("text-right text-[11px] text-bz-text-soft", NUM)}>{fmtQty(x.qty)} in lot</span>
                            <NumberField value={x.take} onChange={(v) => setLotTake(l.id, x.lot, v)} max={x.qty} className="h-7 w-[104px]" ariaLabel={`Take from ${x.lot}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="m-0 ml-3 border-l border-bz-line-soft pl-3 text-[11px] text-bz-red">No lots of this item at {locName}.</p>
                    )}
                  </div>
                )}
                {short && q > 0 && left > 0 && (
                  <p className="m-0 px-3 pb-2 text-[10.5px] text-bz-text-muted">
                    {locName} can cover {fmtQty(onHand)} of {fmtQty(left)} — the rest stays on the order.
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="m-0 mt-3 text-[10.5px] text-bz-text-soft">
          Bins, serial numbers or freight?{" "}
          <button type="button" className="font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text">
            Use the full delivery form <ChevronRight size={10} className="inline" />
          </button>
        </p>
      </div>
    </SheetFrame>
  );
}

// ── Invoice ─────────────────────────────────────────────────────────────────

function InvoiceSheet({ order, onCancel, onCommit }: { order: Order; onCancel: () => void; onCommit: (p: InvoicePayload) => void }) {
  const term = termById(order.termId);
  const [date, setDate] = React.useState(TODAY);
  const [due, setDue] = React.useState(addDays(TODAY, term?.days ?? 0));
  const [undelivered, setUndelivered] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);

  const cap = (l: OrderLine, inc: boolean) => Math.max(0, (inc ? remainingToInvoice(l) : readyToInvoice(l)) - pendingOn(order, l, "invoice"));
  const [qty, setQty] = React.useState<Record<string, number>>(() => Object.fromEntries(order.lines.map((l) => [l.id, cap(l, false)])));

  const toggleUndelivered = (v: boolean) => {
    setUndelivered(v);
    setQty(Object.fromEntries(order.lines.map((l) => [l.id, cap(l, v)])));
    setRefusal(null);
  };

  const rows = order.lines.filter((l) => remainingToInvoice(l) > 0);
  const chosen = rows.filter((l) => (qty[l.id] ?? 0) > 0);
  const t = totalsOf(chosen.map((l) => ({ ...l, qty: qty[l.id] })));

  const commit = () => {
    if (chosen.length === 0) return setRefusal("Nothing to invoice. Set a quantity on at least one line.");
    for (const l of rows) {
      const max = cap(l, undelivered);
      if ((qty[l.id] ?? 0) > max) return setRefusal(`Only ${fmtQty(max)} of ${itemById(l.itemId)?.name} can be invoiced${undelivered ? "" : " — the rest isn't delivered yet"}.`);
    }
    if (due < date) return setRefusal("The due date can't be before the invoice date.");
    onCommit({ date, due, lines: chosen.map((l) => ({ lineId: l.id, qty: qty[l.id] })) });
  };

  return (
    <SheetFrame
      onCommit={commit}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      foot={
        <>
          <span className={cn("text-[12px] text-bz-text-muted", NUM)}>
            <span className="font-semibold text-bz-text">{chosen.length}</span> line{chosen.length === 1 ? "" : "s"} · <span className="text-[13px] font-semibold text-bz-text"><Amount value={t.total} currency={order.currency} /></span>
          </span>
          <button type="button" className={cn(GHOST, "ml-auto")} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={commit}>
            <ReceiptText size={13} /> Create invoice <Kbd>⌘↵</Kbd>
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 px-5 pt-4 sm:grid-cols-3">
        <SheetField label="Invoice date">
          <input type="date" value={date} max={TODAY} onChange={(e) => (setDate(e.target.value), setDue(addDays(e.target.value, term?.days ?? 0)))} className={cn(INPUT_SM, NUM)} />
        </SheetField>
        <SheetField label={`Due · ${term?.name ?? "—"}`}>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={cn(INPUT_SM, NUM)} />
        </SheetField>
        <SheetField label="Bill undelivered too">
          <span className="flex h-8 items-center gap-2 text-[11.5px] text-bz-text-muted">
            <Switch on={undelivered} onChange={toggleUndelivered} label="Bill undelivered quantities" />
            {undelivered ? "Ordered, not yet billed" : "Delivered, not yet billed"}
          </span>
        </SheetField>
      </div>

      <div className="px-5 pb-5 pt-5">
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          <div className={cn("hidden grid-cols-[minmax(0,1fr)_64px_64px_118px_108px] items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
            <span>Item</span>
            <span className="text-right">Deliv.</span>
            <span className="text-right">Billed</span>
            <span className="text-center">Invoice now</span>
            <span className="text-right">Net</span>
          </div>
          {rows.map((l) => {
            const it = itemById(l.itemId)!;
            const max = cap(l, undelivered);
            const pend = pendingOn(order, l, "invoice");
            const q = qty[l.id] ?? 0;
            return (
              <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_118px] items-center gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0 sm:grid-cols-[minmax(0,1fr)_64px_64px_118px_108px]">
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] text-bz-text">{it.name}</span>
                  <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                    {fmtQty(l.qty)} {it.unit} ordered · <Amount value={l.rate} className="text-bz-text-soft" /> each
                    {pend > 0 && <span className="text-bz-text-muted"> · {fmtQty(pend)} on an invoice awaiting approval</span>}
                  </span>
                </span>
                <span className={cn("hidden text-right text-[12px] text-bz-text-muted sm:block", NUM)}>{isStock(l) ? fmtQty(l.delivered) : "—"}</span>
                <span className={cn("hidden text-right text-[12px] text-bz-text-muted sm:block", NUM)}>{fmtQty(l.invoiced)}</span>
                <span className="flex justify-center">
                  {max === 0 && q === 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-bz-text-soft" title={pend ? "Already on an invoice awaiting approval" : "Nothing delivered to bill yet"}>
                      <Lock size={11} /> {pend ? "Pending" : "Not delivered"}
                    </span>
                  ) : (
                    <NumberField value={q} onChange={(v) => setQty((s) => ({ ...s, [l.id]: v }))} max={max} invalid={q > max} className="w-[104px]" ariaLabel={`Invoice now — ${it.name}`} />
                  )}
                </span>
                <span className="hidden text-right text-[12.5px] font-semibold text-bz-text sm:block">
                  <Amount value={lineNet({ ...l, qty: q })} />
                </span>
              </div>
            );
          })}
        </div>

        <dl className="ml-auto mt-3 grid w-full max-w-[280px] grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-[12px]">
          <dt className="text-bz-text-muted">Subtotal</dt>
          <dd className="m-0 text-right text-bz-text"><Amount value={t.subtotal} /></dd>
          {t.discount > 0 && (
            <>
              <dt className="text-bz-text-muted">Discount</dt>
              <dd className="m-0 text-right text-bz-text">−<Amount value={t.discount} /></dd>
            </>
          )}
          <dt className="text-bz-text-muted">VAT 13%</dt>
          <dd className="m-0 text-right text-bz-text"><Amount value={t.tax} /></dd>
          <dt className="mt-1 border-t border-bz-line-soft pt-2 font-semibold text-bz-text">Invoice total</dt>
          <dd className="m-0 mt-1 border-t border-bz-line-soft pt-2 text-right text-[13px] font-semibold text-bz-text"><Amount value={t.total} currency={order.currency} /></dd>
        </dl>
      </div>
    </SheetFrame>
  );
}

// ── Shared frame: scrolling body over a docked foot, ⌘↵ commits ─────────────

function SheetFrame({ children, foot, onCommit, refusal, onDismissRefusal }: { children: React.ReactNode; foot: React.ReactNode; onCommit: () => void; refusal: string | null; onDismissRefusal: () => void }) {
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onCommit();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onCommit]);
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">{children}</div>
      <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
        {refusal && <Refusal text={refusal} onDismiss={onDismissRefusal} sticky className="mb-2.5" />}
        <div className="flex flex-wrap items-center gap-2">{foot}</div>
      </div>
    </>
  );
}

function SheetField({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[11.5px] font-semibold text-bz-text">
        {label}
        {optional && <span className="ml-1 font-normal text-bz-text-soft">optional</span>}
      </span>
      {children}
    </div>
  );
}
