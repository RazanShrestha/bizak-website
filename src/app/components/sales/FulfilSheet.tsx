import * as React from "react";
import { Lock, Plus, Truck, X } from "lucide-react";
import { cn } from "../ui/utils";
import { Amount, ChildDoc, Order, OrderLine, LOCATIONS, LOTS, TODAY, customerById, fmtQty, fmtShort, itemById, lineGross, locationById, pendingOn, remainingToDeliver } from "./orders";
import { availableSerials, serialOutOn } from "./stock";
import { BTN, Checkbox, GHOST, INPUT_SM, Kbd, LABEL, NUM, NumberField, PLAIN_BTN, Refusal, Select } from "./bzw";
import { AddressField, ChipRow, DateChip, MiniLabel, MoreFields, PickChip, SerialField, Sep, TermChip, TextChip, serialRun } from "./parts";

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
//   • lot-tracked lines are allocated first-expiry-first-out from the lots on
//     hand, and a new batch (number · mfg · expiry) can be added beside them;
//     serial-tracked lines take one serial per unit — scanned, or generated as
//     a range from the first number;
//   • a line the warehouse cannot cover says so beside the line, and the commit
//     REFUSES with the reason — it is never a silently disabled button;
//   • the same sheet EDITS a delivery: what that delivery already holds is
//     added back to what is "left", so it can be kept or changed.
//
// Invoicing an order is not here — an invoice is a document with money on it,
// so it is written in the composer, the one invoice form (see OrderComposer,
// "billing mode"). This file is the warehouse's half of the flow.
// ════════════════════════════════════════════════════════════════════════════

export type DeliveryPayload = Pick<ChildDoc, "locationId" | "date" | "driver" | "truck" | "memo" | "custom" | "address" | "batches" | "serials"> & { lines: { lineId: string; qty: number }[] };
export type InvoicePayload = Pick<ChildDoc, "date" | "due" | "memo" | "custom" | "address" | "billDiscount" | "billOnNet" | "tdsCode" | "paidAtSave"> & { lines: { lineId: string; qty: number }[] };

export { pendingOn };

/** "30 pkg + 30 hrs" — quantities of different units are never added together. */
export function unitsLabel(parts: { unit: string; qty: number }[]) {
  const by = new Map<string, number>();
  parts.forEach((p) => by.set(p.unit, (by.get(p.unit) ?? 0) + p.qty));
  return [...by].map(([u, q]) => `${fmtQty(q)} ${u}`).join(" + ");
}

const isStock = (l: OrderLine) => Object.keys(itemById(l.itemId)?.onHand ?? {}).length > 0;
const onDoc = (d: ChildDoc | undefined, lineId: string) => d?.lines.filter((x) => x.lineId === lineId).reduce((s, x) => s + x.qty, 0) ?? 0;
const valueOf = (l: OrderLine, qty: number) => lineGross({ ...l, qty, discountAmt: l.discountAmt ? (l.discountAmt * qty) / l.qty : undefined });

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

export { serialRun as serialRange };

// ── Delivery ────────────────────────────────────────────────────────────────

type Lot = { lot: string; expiry: string | null; qty: number; take: number };
type NewBatch = { key: string; batch: string; mfg: string; expiry: string; qty: number };

export function DeliverySheet({ order, existing, onCancel, onCommit }: { order: Order; existing?: ChildDoc; onCancel: () => void; onCommit: (p: DeliveryPayload, thenInvoice: boolean) => void }) {
  const [locationId, setLocationId] = React.useState(existing?.locationId ?? order.locationId);
  const [date, setDate] = React.useState(existing?.date ?? TODAY);
  const [driver, setDriver] = React.useState(existing?.driver ?? "");
  const [vehicle, setVehicle] = React.useState(existing?.truck ?? "");
  const [memo, setMemo] = React.useState(existing?.memo ?? "");
  const [custom, setCustom] = React.useState<Record<string, string>>(existing?.custom ?? { ...order.custom });
  const [address, setAddress] = React.useState(existing?.address ?? "");
  const [thenInvoice, setThenInvoice] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);

  const counted = existing?.state === "approved";
  const open = order.lines.map((l) => {
    const mine = onDoc(existing, l.id);
    const pend = pendingOn(order, l, "delivery", existing?.no);
    return { l, left: Math.max(0, remainingToDeliver(l) + (counted ? mine : 0) - pend), pend, mine };
  });

  const defaults = React.useCallback(
    (loc: string) => {
      const qty: Record<string, number> = {};
      const lots: Record<string, Lot[]> = {};
      const serials: Record<string, string[]> = {};
      for (const { l, left, mine } of open) {
        const it = itemById(l.itemId)!;
        if (existing) {
          qty[l.id] = mine;
          lots[l.id] = allocate(l.itemId, loc, 0);
          existing.serials?.filter((s) => s.lineId === l.id).forEach((s) => (serials[serialKey(l.id, s.batch)] = s.serials));
        } else if (it.lotTracked) {
          lots[l.id] = allocate(l.itemId, loc, left);
          qty[l.id] = lots[l.id].reduce((s, x) => s + x.take, 0);
        } else if (isStock(l)) {
          qty[l.id] = Math.min(left, it.onHand[loc] ?? 0);
          serials[l.id] = [];
        } else {
          qty[l.id] = left;
        }
      }
      const batches: Record<string, NewBatch[]> = {};
      existing?.batches?.forEach((b, i) => (batches[b.lineId] = [...(batches[b.lineId] ?? []), { key: `b${i}`, batch: b.batch, mfg: b.mfg ?? "", expiry: b.expiry ?? "", qty: b.qty }]));
      return { qty, lots, serials, batches };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order, existing],
  );

  const [state, setState] = React.useState(() => defaults(locationId));
  const changeLocation = (loc: string) => {
    setLocationId(loc);
    setState(defaults(loc));
    setRefusal(null);
  };

  const lotSum = (lineId: string, s = state) => (s.lots[lineId] ?? []).reduce((a, x) => a + x.take, 0) + (s.batches[lineId] ?? []).reduce((a, x) => a + x.qty, 0);
  const setQty = (lineId: string, v: number) => setState((s) => ({ ...s, qty: { ...s.qty, [lineId]: v } }));
  const setLotTake = (lineId: string, lot: string, v: number) =>
    setState((s) => {
      const next = { ...s, lots: { ...s.lots, [lineId]: (s.lots[lineId] ?? []).map((x) => (x.lot === lot ? { ...x, take: Math.max(0, Math.min(x.qty, v)) } : x)) } };
      return { ...next, qty: { ...next.qty, [lineId]: lotSum(lineId, next) } };
    });
  const setBatch = (lineId: string, key: string, p: Partial<NewBatch> | null) =>
    setState((s) => {
      const list = s.batches[lineId] ?? [];
      const batches = { ...s.batches, [lineId]: p === null ? list.filter((b) => b.key !== key) : list.some((b) => b.key === key) ? list.map((b) => (b.key === key ? { ...b, ...p } : b)) : [...list, { key, batch: "", mfg: "", expiry: "", qty: 0, ...p }] };
      const next = { ...s, batches };
      return { ...next, qty: { ...next.qty, [lineId]: lotSum(lineId, next) } };
    });
  /** A serial-only line counts its serials; on a batch line the batches set the quantity. */
  const setSerials = (lineId: string, batch: string | undefined, list: string[]) =>
    setState((s) => {
      const serials = { ...s.serials, [serialKey(lineId, batch)]: list };
      return { ...s, serials, qty: batch === undefined ? { ...s.qty, [lineId]: list.length } : s.qty };
    });

  const shipTo = customerById(order.customerId)!.address;
  /** Every batch leaving on this line — picked from stock, or typed in as new. */
  const batchesOf = (lineId: string) => [
    ...(state.lots[lineId] ?? []).filter((x) => x.take > 0).map((x) => ({ batch: x.lot, qty: x.take })),
    ...(state.batches[lineId] ?? []).filter((x) => x.qty > 0).map((x) => ({ batch: x.batch.trim(), qty: x.qty })),
  ];
  const rows = open.filter((r) => r.left > 0 || r.pend > 0);
  const lines = rows.filter((r) => (state.qty[r.l.id] ?? 0) > 0);
  const value = lines.reduce((s, r) => s + valueOf(r.l, state.qty[r.l.id]), 0);
  const locName = locationById(locationId)?.name;

  const commit = () => {
    setTried(true);
    if (lines.length === 0) return setRefusal("Nothing to deliver. Set a quantity on at least one line.");
    for (const { l, left } of rows) {
      const q = state.qty[l.id] ?? 0;
      const it = itemById(l.itemId)!;
      if (q > left) return setRefusal(`Only ${fmtQty(left)} left to deliver on ${it.name}.`);
      if (isStock(l) && !it.lotTracked && q > (it.onHand[locationId] ?? 0) + (counted ? onDoc(existing, l.id) : 0)) return setRefusal(`Only ${fmtQty(it.onHand[locationId] ?? 0)} on hand at ${locName} for ${it.name}.`);
      if (it.lotTracked && q > 0 && (state.batches[l.id] ?? []).some((b) => b.qty > 0 && !b.batch.trim())) return setRefusal(`Give the new batch on ${it.name} a number.`);
      if (it.serialTracked && q > 0) {
        if (it.lotTracked) {
          for (const b of batchesOf(l.id)) {
            const n = state.serials[serialKey(l.id, b.batch)]?.length ?? 0;
            if (b.qty > 0 && n !== b.qty) return setRefusal(`Batch ${b.batch || "—"} of ${it.name} needs ${fmtQty(b.qty)} serial numbers — ${n} entered.`);
          }
        } else if ((state.serials[l.id]?.length ?? 0) !== q) {
          return setRefusal(`${it.name} needs ${fmtQty(q)} serial numbers — ${state.serials[l.id]?.length ?? 0} entered.`);
        }
        // A unit leaves once: anything already on another delivery is refused by name.
        const picked = Object.entries(state.serials)
          .filter(([k]) => k === l.id || k.startsWith(`${l.id}|`))
          .flatMap(([, v]) => v);
        const gone = picked.map((x) => ({ x, on: serialOutOn(l.itemId, x, existing?.no) })).find((y) => y.on);
        if (gone) return setRefusal(`${gone.x} already went out on ${gone.on}. Pick another unit.`);
      }
    }
    if (!custom.channel) return setRefusal("Choose a sales channel.");
    onCommit(
      {
        locationId,
        date,
        driver: driver.trim() || undefined,
        truck: vehicle.trim() || undefined,
        memo: memo.trim() || undefined,
        custom,
        address: address.trim() && address.trim() !== shipTo ? address.trim() : undefined,
        lines: lines.map((r) => ({ lineId: r.l.id, qty: state.qty[r.l.id] })),
        batches: lines.flatMap((r) => [
          ...(state.lots[r.l.id] ?? []).filter((x) => x.take > 0).map((x) => ({ lineId: r.l.id, batch: x.lot, mfg: null, expiry: x.expiry, qty: x.take })),
          ...(state.batches[r.l.id] ?? []).filter((x) => x.qty > 0).map((x) => ({ lineId: r.l.id, batch: x.batch.trim(), mfg: x.mfg || null, expiry: x.expiry || null, qty: x.qty })),
        ]),
        serials: lines
          .filter((r) => itemById(r.l.itemId)?.serialTracked)
          .flatMap((r) =>
            itemById(r.l.itemId)!.lotTracked
              ? batchesOf(r.l.id)
                  .filter((b) => b.qty > 0)
                  .map((b) => ({ lineId: r.l.id, batch: b.batch, serials: state.serials[serialKey(r.l.id, b.batch)] ?? [] }))
              : [{ lineId: r.l.id, serials: state.serials[r.l.id] ?? [] }],
          ),
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
            {lines.length > 0 && <> · {unitsLabel(lines.map((r) => ({ unit: r.l.unit ?? itemById(r.l.itemId)!.unit, qty: state.qty[r.l.id] })))}</>}
            {value > 0 && <> · <Amount value={value} className="font-semibold text-bz-text" /></>}
          </span>
          {!existing && (
            <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-[11.5px] text-bz-text-muted" title="Opens the invoice for these units as soon as the delivery is saved">
              <Checkbox on={thenInvoice} onChange={setThenInvoice} label="Invoice it next" /> Invoice it next
            </label>
          )}
          <button type="button" className={cn(GHOST, existing && "ml-auto")} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={commit}>
            <Truck size={13} /> {existing ? "Save delivery" : "Create delivery"} <Kbd>⌘↵</Kbd>
          </button>
        </>
      }
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
    >
      <div className="px-5">
        <ChipRow className="border-t-0">
          <TermChip label="Date">
            <DateChip value={date} max={TODAY} onChange={setDate} />
          </TermChip>
          <Sep />
          <TermChip label="From">
            <PickChip label={locName} value={locationId} onChange={changeLocation} options={LOCATIONS.map((l) => ({ value: l.id, label: l.name }))} />
          </TermChip>
          <TermChip label="To">
            <AddressField label="Deliver to" className="max-w-[240px] px-1.5 py-1" value={address || shipTo} fallback={shipTo} onChange={(v) => setAddress(v === shipTo ? "" : v)} />
          </TermChip>
          <Sep />
          <TermChip label="Driver">
            <TextChip value={driver} onChange={setDriver} placeholder="none" width={100} />
          </TermChip>
          <TermChip label="Vehicle">
            <TextChip value={vehicle} onChange={setVehicle} placeholder="none" width={104} />
          </TermChip>
        </ChipRow>
      </div>

      <div className="flex items-center gap-3 px-5 pb-2 pt-4">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">What ships</h3>
        <button type="button" className="ml-auto text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={() => setState(defaults(locationId))}>
          {existing ? "Reset" : "Fill what's left"}
        </button>
        <button
          type="button"
          className="text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text"
          onClick={() => setState((s) => ({ ...s, qty: Object.fromEntries(Object.keys(s.qty).map((k) => [k, 0])), lots: Object.fromEntries(Object.entries(s.lots).map(([k, v]) => [k, v.map((x) => ({ ...x, take: 0 }))])), batches: {}, serials: {} }))}
        >
          Clear
        </button>
      </div>

      <div className="px-5 pb-5">
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          <div className={cn("hidden grid-cols-[minmax(0,1fr)_60px_72px_112px_100px] items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
            <span>Item</span>
            <span className="text-right">Left</span>
            <span className="text-right">On hand</span>
            <span className="text-center">Deliver now</span>
            <span className="text-right">Value</span>
          </div>
          {rows.map(({ l, left, pend }) => {
            const it = itemById(l.itemId)!;
            const unit = l.unit ?? it.unit;
            const stock = isStock(l);
            const onHand = it.onHand[locationId] ?? 0;
            const q = state.qty[l.id] ?? 0;
            const short = stock && !it.lotTracked && left > onHand;
            const lots = state.lots[l.id] ?? [];
            const over = q > left || (stock && !it.lotTracked && !existing && q > onHand);
            return (
              <div key={l.id} className={cn("border-b border-bz-line-soft last:border-0", left === 0 && "bg-bz-paper")}>
                <div className="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_60px_72px_112px_100px]">
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] text-bz-text">{it.name}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {fmtQty(l.delivered)} of {fmtQty(l.qty)} {unit} delivered · <Amount value={l.rate} className="text-bz-text-soft" /> each
                      <span className="sm:hidden"> · {fmtQty(left)} left{stock ? ` · ${fmtQty(onHand)} on hand` : ""}</span>
                      {pend > 0 && <span className="text-bz-text-muted"> · {fmtQty(pend)} awaiting approval</span>}
                    </span>
                  </span>
                  <span className={cn("hidden text-right text-[12.5px] text-bz-text sm:block", NUM)}>{fmtQty(left)}</span>
                  <span className={cn("hidden text-right text-[12px] sm:block", NUM, !stock ? "text-bz-text-soft" : short || onHand === 0 ? "font-semibold text-bz-red" : "text-bz-text-muted")}>{stock ? fmtQty(onHand) : "Service"}</span>
                  <span className="flex justify-center">
                    {left === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-bz-text-soft" title="Everything left is on a delivery awaiting approval">
                        <Lock size={11} /> Pending
                      </span>
                    ) : it.lotTracked ? (
                      <span className={cn("text-[12.5px] font-semibold", NUM, over ? "text-bz-red" : "text-bz-text")} title="The sum of the batches below">
                        {fmtQty(q)}
                      </span>
                    ) : (
                      <NumberField value={q} onChange={(v) => setQty(l.id, v)} max={left} invalid={over} className="w-[104px]" ariaLabel={`Deliver now — ${it.name}`} />
                    )}
                  </span>
                  <span className="hidden text-right text-[12.5px] font-semibold text-bz-text sm:block">{q > 0 ? <Amount value={valueOf(l, q)} /> : <span className="font-normal text-bz-text-soft">—</span>}</span>
                </div>

                {it.lotTracked && left > 0 && (
                  <div className="px-3 pb-2.5">
                    <div className="ml-3 flex flex-col gap-1 border-l border-bz-line-soft pl-3">
                      {lots.map((x) => (
                        <div key={x.lot}>
                          <div className="grid grid-cols-[minmax(0,1fr)_80px_104px] items-center gap-3">
                            <span className={cn("truncate text-[11.5px] text-bz-text", NUM)}>
                              {x.lot}
                              <span className="ml-2 text-bz-text-soft">{x.expiry ? `exp ${fmtShort(x.expiry)}` : "no expiry"}</span>
                            </span>
                            <span className={cn("text-right text-[11px] text-bz-text-soft", NUM)}>{fmtQty(x.qty)} in lot</span>
                            <NumberField value={x.take} onChange={(v) => setLotTake(l.id, x.lot, v)} max={x.qty} className="h-7 w-[104px]" ariaLabel={`Take from ${x.lot}`} />
                          </div>
                          {it.serialTracked && x.take > 0 && (
                            <SerialField
                              key={`${x.lot}-${x.take}`}
                              qty={x.take}
                              code={it.code}
                              value={state.serials[serialKey(l.id, x.lot)] ?? []}
                              options={availableSerials(l.itemId, locationId, x.lot, existing?.no)}
                              invalid={tried && (state.serials[serialKey(l.id, x.lot)]?.length ?? 0) !== x.take}
                              onChange={(s) => setSerials(l.id, x.lot, s)}
                            />
                          )}
                        </div>
                      ))}
                      {lots.length === 0 && (state.batches[l.id] ?? []).length === 0 && <p className="m-0 text-[11px] text-bz-text-muted">No batches of this item at {locName}.</p>}
                      {(state.batches[l.id] ?? []).map((b) => (
                        <div key={b.key} className="grid grid-cols-[minmax(0,1fr)_104px_20px] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_152px_152px_104px_20px]">
                          <input value={b.batch} onChange={(e) => setBatch(l.id, b.key, { batch: e.target.value })} placeholder="New batch no." className={cn(INPUT_SM, "h-7 text-[11.5px]", NUM, tried && b.qty > 0 && !b.batch.trim() && "border-bz-red-mark")} aria-label="Batch number" />
                          <label className="hidden items-center gap-1 sm:flex">
                            <span className="shrink-0 text-[10px] text-bz-text-soft">Made</span>
                            <input type="date" value={b.mfg} onChange={(e) => setBatch(l.id, b.key, { mfg: e.target.value })} className={cn(INPUT_SM, "h-7 min-w-0 px-1.5 text-[11px]", NUM)} aria-label="Manufactured" />
                          </label>
                          <label className="hidden items-center gap-1 sm:flex">
                            <span className="shrink-0 text-[10px] text-bz-text-soft">Expires</span>
                            <input type="date" value={b.expiry} onChange={(e) => setBatch(l.id, b.key, { expiry: e.target.value })} className={cn(INPUT_SM, "h-7 min-w-0 px-1.5 text-[11px]", NUM)} aria-label="Expiry" />
                          </label>
                          <NumberField value={b.qty} onChange={(v) => setBatch(l.id, b.key, { qty: v })} className="h-7 w-[104px]" ariaLabel="Batch quantity" />
                          <button type="button" className={PLAIN_BTN} onClick={() => setBatch(l.id, b.key, null)} aria-label="Remove batch">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {it.serialTracked &&
                        (state.batches[l.id] ?? [])
                          .filter((b) => b.qty > 0 && b.batch.trim())
                          .map((b) => (
                            <SerialField
                              key={`${b.key}-${b.qty}`}
                              qty={b.qty}
                              code={it.code}
                              label={`Batch ${b.batch.trim()}`}
                              value={state.serials[serialKey(l.id, b.batch.trim())] ?? []}
                              invalid={tried && (state.serials[serialKey(l.id, b.batch.trim())]?.length ?? 0) !== b.qty}
                              onChange={(s) => setSerials(l.id, b.batch.trim(), s)}
                            />
                          ))}
                      <button type="button" onClick={() => setBatch(l.id, `n${Date.now()}`, { qty: Math.max(0, left - q) })} className="inline-flex w-fit items-center gap-1 py-0.5 text-[11px] font-medium text-bz-text-muted hover:text-bz-text">
                        <Plus size={11} /> New batch
                      </button>
                    </div>
                  </div>
                )}

                {it.serialTracked && it.lotTracked && left > 0 && (
                  <div className="px-3 pb-2">
                    <div className="ml-3 border-l border-bz-line-soft pl-3">
                      <ScanToBatch
                        code={it.code}
                        options={availableSerials(l.itemId, locationId, undefined, existing?.no)}
                        taken={Object.entries(state.serials).filter(([k]) => k.startsWith(`${l.id}|`)).flatMap(([, v]) => v)}
                        onPick={(hit) => {
                          // Put the unit in its own batch: take one more from that lot, and tick the serial.
                          const lot = (state.lots[l.id] ?? []).find((x) => x.lot === hit.batch);
                          if (!lot) return;
                          setLotTake(l.id, hit.batch!, Math.min(lot.qty, lot.take + 1));
                          const key = serialKey(l.id, hit.batch);
                          const have = state.serials[key] ?? [];
                          if (!have.includes(hit.serial)) setSerials(l.id, hit.batch, [...have, hit.serial]);
                        }}
                      />
                    </div>
                  </div>
                )}

                {it.serialTracked && !it.lotTracked && q > 0 && (
                  <div className="px-3 pb-2.5">
                    <div className="ml-3 border-l border-bz-line-soft pl-3">
                      <SerialField key={`${l.id}-${q}`} qty={q} code={it.code} value={state.serials[l.id] ?? []} options={availableSerials(l.itemId, locationId, undefined, existing?.no)} invalid={tried && (state.serials[l.id]?.length ?? 0) !== q} onChange={(s) => setSerials(l.id, undefined, s)} />
                    </div>
                  </div>
                )}

                {short && q > 0 && left > 0 && !existing && (
                  <p className="m-0 px-3 pb-2 text-[10.5px] text-bz-text-muted">
                    {locName} can cover {fmtQty(onHand)} of {fmtQty(left)} — the rest stays on the order.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <MoreFields memo={memo} onMemo={setMemo} custom={custom} onCustom={setCustom} tried={tried} />
    </SheetFrame>
  );
}

/** The key a line's serials are held under — per line, or per batch when it has both. */
const serialKey = (lineId: string, batch?: string) => (batch === undefined ? lineId : `${lineId}|${batch}`);

/**
 * Scan first, sort out the batch after. A serial names its own batch, so the
 * receiver never has to know which run a unit came from — the batch row takes
 * one more and the serial ticks itself.
 */
function ScanToBatch({ code, options, taken, onPick }: { code: string; options: { serial: string; batch?: string }[]; taken: string[]; onPick: (hit: { serial: string; batch?: string }) => void }) {
  const [scan, setScan] = React.useState("");
  const [miss, setMiss] = React.useState<string | null>(null);
  const left = options.filter((o) => !taken.includes(o.serial));
  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <input
        value={scan}
        onChange={(e) => (setScan(e.target.value), setMiss(null))}
        onKeyDown={(e) => {
          if (e.key !== "Enter" || !scan.trim()) return;
          e.preventDefault();
          const hit = left.find((o) => o.serial.toLowerCase() === scan.trim().toLowerCase());
          if (!hit) return setMiss(scan.trim());
          onPick(hit);
          setScan("");
        }}
        placeholder={`Scan a serial — ${code}-0001`}
        className={cn(INPUT_SM, "h-7 w-[190px] text-[11.5px]", NUM, miss && "border-bz-red-mark")}
        aria-label="Scan a serial to pick its batch"
      />
      {miss ? <span className="text-[10.5px] text-bz-red">{miss} isn't on the shelf here.</span> : <span className="text-[10.5px] text-bz-text-soft">the batch follows the serial</span>}
    </div>
  );
}

// ── Shared frame: scrolling body over a docked foot, ⌘↵ commits ─────────────

export function SheetFrame({ children, foot, onCommit, refusal, onDismissRefusal }: { children: React.ReactNode; foot: React.ReactNode; onCommit: () => void; refusal: string | null; onDismissRefusal: () => void }) {
  const ref = React.useRef(onCommit);
  ref.current = onCommit;
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">{children}</div>
      <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
        {refusal && <Refusal text={refusal} onDismiss={onDismissRefusal} className="mb-2.5" />}
        <div className="flex flex-wrap items-center gap-2">{foot}</div>
      </div>
    </>
  );
}
