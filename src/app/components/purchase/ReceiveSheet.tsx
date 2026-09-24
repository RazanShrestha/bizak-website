import * as React from "react";
import { PackageCheck, Plus, TriangleAlert, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, GHOST, INPUT_SM, Kbd, LABEL, NUM, NumberField, PLAIN_BTN, Select, Switch } from "../sales/bzw";
import { Amount, LOCATIONS, TAX_LABEL, TODAY, daysBetween, fmtQty, fmtShort, itemById, lineGross, locationById, totalsOf } from "../sales/orders";
import { CURRENCIES, DIMENSIONS, SUBSIDIARIES, subsidiaryById } from "../sales/master";
import { AmountInput, ChipRow, DateChip, MiniLabel, MoreFields, PickChip, Section, SerialField, Sep, TermChip, TextChip } from "../sales/parts";
import { MoneyList, totalsRows } from "../sales/record";
import { ItemReceipt, ReceiptSource, ReceivableLine, receivableFrom, vendorById } from "./receipts";
import { SheetFrame } from "../sales/FulfilSheet";
import { batchesShipped, creditsStore, serialsShipped } from "../sales/flow";
import { ordersStore } from "../sales/store";
import { customerById } from "../sales/orders";

// ════════════════════════════════════════════════════════════════════════════
// RECEIVE — the item receipt, written against what it receives
//
// The app's receipt screen shows ONE editable quantity per line, pre-netted on
// the server, with the batch and serial entry behind a dialog. A receiver
// therefore cannot see what was ordered, what already came, or what is left,
// and nothing stops them receiving more than the order. Here:
//
//   • every line shows ORDERED · ALREADY IN · RECEIVING NOW, capped at what is
//     left (minus anything on a receipt awaiting approval);
//   • what is asked for depends on where the goods come FROM:
//       a purchase  — the batch is new, so it is typed: number, made, expires;
//       a return    — the unit already exists, so nothing is typed. A serial
//                     names its own batch (MastSerialNumber.BatchId), so the
//                     receiver scans serials and the batch fills itself; an
//                     item with batches but no serials picks from the batches
//                     that actually shipped. No dates are asked for twice;
//   • an expiry in the past, or inside 30 days, says so beside the batch;
//   • a line can be left out entirely (receive nothing of it) without losing
//     its place — that is what a short shipment looks like.
// ════════════════════════════════════════════════════════════════════════════

export type ReceivePayload = Pick<
  ItemReceipt,
  "date" | "locationId" | "currency" | "exchangeRate" | "transporter" | "truckNo" | "driver" | "transportAmount" | "ppNumber" | "ppDate" | "lc" | "ciNumber" | "vendorRef" | "memo" | "remarks" | "dims" | "custom" | "costAllocation" | "subsidiaryId"
> & {
  lines: { refLineId: string; itemId: string; unit: string; qty: number; rate: number; discountPct: number; tax: ReceivableLine["tax"]; locationId: string }[];
  batches: ItemReceipt["batches"];
  serials: ItemReceipt["serials"];
};

type Batch = { key: string; batch: string; mfg: string; expiry: string; qty: number };

const serialKey = (refLineId: string, batch?: string) => (batch === undefined ? refLineId : `${refLineId}|${batch}`);

/** A batch that has expired, or is close to it, is the one thing a receiver must not wave through. */
function expiryNote(expiry: string | null | undefined) {
  if (!expiry) return null;
  const d = daysBetween(TODAY, expiry);
  if (d < 0) return { text: `Expired ${-d} days ago`, bad: true };
  if (d <= 30) return { text: `Expires in ${d} days`, bad: false };
  return null;
}

export function ReceiveSheet({
  source,
  party,
  existing,
  defaults,
  onCancel,
  onCommit,
}: {
  source: ReceiptSource;
  party: { name: string; id: string };
  existing?: ItemReceipt;
  defaults: { subsidiaryId: string; locationId: string; currency: string; exchangeRate: number; custom: Record<string, string> };
  onCancel: () => void;
  onCommit: (p: ReceivePayload) => void;
}) {
  const rows = React.useMemo(() => receivableFrom(source, existing?.no), [source, existing]);
  const fromReturn = source.kind === "return";
  /** Goods coming back can only carry a serial that actually went out. */
  const source_ = source;
  /** The batches that left on this line — a return can only bring those back. */
  const shippedBatches = React.useCallback(
    (refLineId: string) => {
      if (!fromReturn) return [];
      const credit = creditsStore.get().find((c) => c.no === source_.no);
      const order = credit ? ordersStore.get().find((o) => o.no === credit.orderNo) : undefined;
      return order ? batchesShipped(order, refLineId).map((b) => ({ lot: b.batch, expiry: b.expiry, qty: b.qty })) : [];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromReturn, source_.no],
  );
  const shippedSerials = React.useCallback(
    (refLineId: string, batch?: string) => {
      if (!fromReturn) return undefined;
      const credit = creditsStore.get().find((c) => c.no === source.no);
      const order = credit ? ordersStore.get().find((o) => o.no === credit.orderNo) : undefined;
      if (!order) return [];
      const out = serialsShipped(order, refLineId);
      return batch === undefined ? out : out.filter((x) => x.batch === batch);
    },
    [fromReturn, source.no],
  );

  const [subsidiaryId, setSubsidiaryId] = React.useState(existing?.subsidiaryId ?? defaults.subsidiaryId);
  const [locationId, setLocationId] = React.useState(existing?.locationId ?? defaults.locationId);
  const [date, setDate] = React.useState(existing?.date ?? TODAY);
  const [currency, setCurrency] = React.useState(existing?.currency ?? defaults.currency);
  const [rate, setRate] = React.useState(existing?.exchangeRate ?? defaults.exchangeRate);
  const [transporter, setTransporter] = React.useState(existing?.transporter ?? "");
  const [truckNo, setTruckNo] = React.useState(existing?.truckNo ?? "");
  const [driver, setDriver] = React.useState(existing?.driver ?? "");
  const [transportAmount, setTransportAmount] = React.useState(existing?.transportAmount ?? 0);
  const [costAllocation, setCostAllocation] = React.useState<ItemReceipt["costAllocation"]>(existing?.costAllocation ?? "By value");
  const [ppNumber, setPpNumber] = React.useState(existing?.ppNumber ?? "");
  const [ppDate, setPpDate] = React.useState(existing?.ppDate ?? "");
  const [lc, setLc] = React.useState(existing?.lc ?? "");
  const [ciNumber, setCiNumber] = React.useState(existing?.ciNumber ?? "");
  const [vendorRef, setVendorRef] = React.useState(existing?.vendorRef ?? "");
  const [memo, setMemo] = React.useState(existing?.memo ?? "");
  const [dims, setDims] = React.useState(existing?.dims ?? {});
  const [custom, setCustom] = React.useState<Record<string, string>>(existing?.custom ?? { ...defaults.custom });
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);

  const mineOn = (refLineId: string) => existing?.lines.filter((l) => l.refLineId === refLineId).reduce((s, l) => s + l.qty, 0) ?? 0;
  const capOf = (r: ReceivableLine) => r.left + (existing?.state === "approved" ? mineOn(r.refLineId) : 0);

  const seed = () => {
    const qty: Record<string, number> = {};
    const batches: Record<string, Batch[]> = {};
    const serials: Record<string, string[]> = {};
    rows.forEach((r) => {
      qty[r.refLineId] = existing ? mineOn(r.refLineId) : r.left;
      const it = itemById(r.itemId)!;
      if (existing) {
        existing.batches.filter((b) => b.lineId === r.refLineId).forEach((b, i) => (batches[r.refLineId] = [...(batches[r.refLineId] ?? []), { key: `b${i}`, batch: b.batch, mfg: b.mfg ?? "", expiry: b.expiry ?? "", qty: b.qty }]));
        existing.serials.filter((s) => s.lineId === r.refLineId).forEach((s) => (serials[serialKey(r.refLineId, s.batch)] = s.serials));
      } else if (it.lotTracked) {
        // A purchase arrives in a new batch; goods coming back arrive in the batch they left in.
        batches[r.refLineId] = fromReturn ? [] : [{ key: `n${r.refLineId}`, batch: "", mfg: "", expiry: "", qty: r.left }];
      }
    });
    return { qty, batches, serials };
  };
  const [state, setState] = React.useState(seed);

  const it = (r: ReceivableLine) => itemById(r.itemId)!;
  const batchesOf = (refLineId: string) => (state.batches[refLineId] ?? []).filter((b) => b.qty > 0);
  const lotSum = (refLineId: string, s = state) => (s.batches[refLineId] ?? []).reduce((a, b) => a + b.qty, 0);

  const setQty = (refLineId: string, v: number) => setState((s) => ({ ...s, qty: { ...s.qty, [refLineId]: v } }));
  const setBatch = (refLineId: string, key: string, p: Partial<Batch> | null) =>
    setState((s) => {
      const list = s.batches[refLineId] ?? [];
      const batches = {
        ...s.batches,
        [refLineId]: p === null ? list.filter((b) => b.key !== key) : list.some((b) => b.key === key) ? list.map((b) => (b.key === key ? { ...b, ...p } : b)) : [...list, { key, batch: "", mfg: "", expiry: "", qty: 0, ...p }],
      };
      const next = { ...s, batches };
      return { ...next, qty: { ...next.qty, [refLineId]: lotSum(refLineId, next) } };
    });
  const setSerials = (refLineId: string, batch: string | undefined, list: string[]) =>
    setState((s) => ({ ...s, serials: { ...s.serials, [serialKey(refLineId, batch)]: list }, qty: batch === undefined ? { ...s.qty, [refLineId]: list.length } : s.qty }));

  /**
   * A return of serialised goods is SERIAL-FIRST: the customer knows the
   * number on the box, not which run it came from. Picking the serials sets
   * the quantity, and the batches are read off the serials themselves.
   */
  const setReturnedSerials = (refLineId: string, list: string[]) =>
    setState((s) => {
      const from = shippedSerials(refLineId) ?? [];
      const byBatch = new Map<string, number>();
      list.forEach((x) => {
        const b = from.find((y) => y.serial === x)?.batch ?? "";
        byBatch.set(b, (byBatch.get(b) ?? 0) + 1);
      });
      return {
        ...s,
        serials: { ...s.serials, [refLineId]: list },
        qty: { ...s.qty, [refLineId]: list.length },
        batches: { ...s.batches, [refLineId]: [...byBatch].filter(([b]) => b).map(([b, qty], i) => ({ key: `r${i}`, batch: b, mfg: "", expiry: "", qty })) },
      };
    });

  const taken = rows.filter((r) => (state.qty[r.refLineId] ?? 0) > 0);
  const totals = totalsOf(taken.map((r) => ({ qty: state.qty[r.refLineId], rate: r.rate, discountPct: 0, tax: r.tax })));

  const commit = () => {
    setTried(true);
    if (!taken.length) return setRefusal("Nothing to receive. Set a quantity on at least one line.");
    for (const r of rows) {
      const q = state.qty[r.refLineId] ?? 0;
      const item = it(r);
      if (q > capOf(r) + 0.005) return setRefusal(`Only ${fmtQty(capOf(r))} of ${item.name} is left to receive on ${source.no}.`);
      if (fromReturn && item.serialTracked) {
        if ((state.serials[r.refLineId]?.length ?? 0) !== q) return setRefusal(`Pick the ${fmtQty(q)} serial numbers of ${item.name} that came back.`);
        continue;
      }
      if (item.lotTracked && q > 0) {
        const bs = batchesOf(r.refLineId);
        if (!bs.length) return setRefusal(`Give the ${item.name} coming in a batch number.`);
        if (bs.some((b) => !b.batch.trim())) return setRefusal(`One batch of ${item.name} has no number.`);
        const expired = bs.find((b) => b.expiry && daysBetween(TODAY, b.expiry) < 0);
        if (expired) return setRefusal(`Batch ${expired.batch} of ${item.name} expired on ${fmtShort(expired.expiry)}. Receive it only after the supplier confirms.`);
      }
      if (item.serialTracked && q > 0) {
        if (item.lotTracked) {
          for (const b of batchesOf(r.refLineId)) {
            const n = state.serials[serialKey(r.refLineId, b.batch.trim())]?.length ?? 0;
            if (n !== b.qty) return setRefusal(`Batch ${b.batch.trim() || "—"} of ${item.name} needs ${fmtQty(b.qty)} serial numbers — ${n} entered.`);
          }
        } else if ((state.serials[r.refLineId]?.length ?? 0) !== q) {
          return setRefusal(`${item.name} needs ${fmtQty(q)} serial numbers — ${state.serials[r.refLineId]?.length ?? 0} entered.`);
        }
      }
    }
    if (currency !== "NPR" && !(rate > 0)) return setRefusal("Enter the exchange rate.");
    onCommit({
      subsidiaryId,
      date,
      locationId,
      currency,
      exchangeRate: currency === "NPR" ? 1 : rate,
      transporter: transporter.trim(),
      truckNo: truckNo.trim(),
      driver: driver.trim(),
      transportAmount,
      costAllocation,
      ppNumber: ppNumber.trim(),
      ppDate: ppDate || null,
      lc: lc.trim(),
      ciNumber: ciNumber.trim(),
      vendorRef: vendorRef.trim(),
      memo: memo.trim(),
      remarks: "",
      dims,
      custom,
      lines: taken.map((r) => ({ refLineId: r.refLineId, itemId: r.itemId, unit: r.unit, qty: state.qty[r.refLineId], rate: r.rate, discountPct: 0, tax: r.tax, locationId })),
      batches: taken.flatMap((r) => batchesOf(r.refLineId).map((b) => ({ lineId: r.refLineId, batch: b.batch.trim(), mfg: b.mfg || null, expiry: b.expiry || null, qty: b.qty }))),
      serials: taken.flatMap((r) => {
        if (!it(r).serialTracked) return [];
        if (fromReturn) {
          // The serials were picked as one list; file each under the batch it came out of.
          const from = shippedSerials(r.refLineId) ?? [];
          const picked = state.serials[r.refLineId] ?? [];
          const groups = new Map<string, string[]>();
          picked.forEach((x) => {
            const b = from.find((y) => y.serial === x)?.batch ?? "";
            groups.set(b, [...(groups.get(b) ?? []), x]);
          });
          return [...groups].map(([batch, serials]) => ({ lineId: r.refLineId, batch: batch || undefined, serials }));
        }
        return it(r).lotTracked
          ? batchesOf(r.refLineId).map((b) => ({ lineId: r.refLineId, batch: b.batch.trim(), serials: state.serials[serialKey(r.refLineId, b.batch.trim())] ?? [] }))
          : [{ lineId: r.refLineId, serials: state.serials[r.refLineId] ?? [] }];
      }),
    });
  };

  return (
    <SheetFrame
      onCommit={commit}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      foot={
        <>
          <span className={cn("text-[12px] text-bz-text-muted", NUM)}>
            <span className="font-semibold text-bz-text">{taken.length}</span> line{taken.length === 1 ? "" : "s"} ·{" "}
            {taken.reduce((s, r) => s + state.qty[r.refLineId], 0) > 0 && <>{fmtQty(taken.reduce((s, r) => s + state.qty[r.refLineId], 0))} units · </>}
            <span className="text-[13px] font-semibold text-bz-text">
              <Amount value={totals.total} currency={currency} />
            </span>
          </span>
          <button type="button" className={cn(GHOST, "ml-auto")} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={commit}>
            <PackageCheck size={13} /> {existing ? "Save receipt" : "Receive items"} <Kbd>⌘↵</Kbd>
          </button>
        </>
      }
    >
      <div className="px-5">
        <ChipRow className="border-t-0">
          <TermChip label="Date">
            <DateChip value={date} max={TODAY} onChange={setDate} />
          </TermChip>
          <Sep />
          <TermChip label="Into">
            <PickChip label={locationById(locationId)?.name ?? ""} value={locationId} onChange={setLocationId} options={LOCATIONS.map((l) => ({ value: l.id, label: l.name }))} />
          </TermChip>
          <Sep />
          <TermChip label="For">
            <PickChip label={subsidiaryById(subsidiaryId).name} value={subsidiaryId} onChange={setSubsidiaryId} options={SUBSIDIARIES.map((x) => ({ value: x.id, label: x.name, hint: x.id }))} width={260} />
          </TermChip>
          <TermChip label="Currency">
            <PickChip label={currency} value={currency} onChange={(c) => (setCurrency(c), setRate(CURRENCIES.find((x) => x.code === c)?.rate ?? 1))} options={CURRENCIES.map((c) => ({ value: c.code, label: c.code, hint: c.name }))} width={200} />
          </TermChip>
          {currency !== "NPR" && (
            <TermChip label="@">
              <TextChip value={String(rate || "")} onChange={(v) => setRate(Number(v.replace(/[^\d.]/g, "")) || 0)} placeholder="rate" width={72} />
            </TermChip>
          )}
        </ChipRow>
      </div>

      <div className="flex items-center gap-3 px-5 pb-2 pt-4">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">What arrived</h3>
        <button type="button" className="ml-auto text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={() => setState(seed())}>
          {existing ? "Reset" : "Fill what's left"}
        </button>
        <button type="button" className="text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={() => setState((s) => ({ qty: Object.fromEntries(Object.keys(s.qty).map((k) => [k, 0])), batches: {}, serials: {} }))}>
          Clear
        </button>
      </div>

      <div className="px-5 pb-5">
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          <div className={cn("hidden grid-cols-[minmax(0,1fr)_64px_64px_112px_100px] items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
            <span>Item</span>
            <span className="text-right">Ordered</span>
            <span className="text-right">Received</span>
            <span className="text-center">Receiving now</span>
            <span className="text-right">Value</span>
          </div>
          {rows.map((r) => {
            const item = it(r);
            const q = state.qty[r.refLineId] ?? 0;
            const cap = capOf(r);
            const over = q > cap + 0.005;
            const shipped = fromReturn ? shippedBatches(r.refLineId) : [];
            return (
              <div key={r.refLineId} className={cn("border-b border-bz-line-soft last:border-0", cap === 0 && "bg-bz-paper")}>
                <div className="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_64px_64px_112px_100px]">
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] text-bz-text">{item.name}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {item.code} · <Amount value={r.rate} className="text-bz-text-soft" /> each · {TAX_LABEL[r.tax]}
                      <span className="sm:hidden">
                        {" "}· {fmtQty(r.ordered)} ordered · {fmtQty(r.received)} received
                      </span>
                      {r.pending > 0 && <span className="text-bz-text-muted"> · {fmtQty(r.pending)} on a receipt awaiting approval</span>}
                    </span>
                  </span>
                  <span className={cn("hidden text-right text-[12.5px] text-bz-text sm:block", NUM)}>{fmtQty(r.ordered)}</span>
                  <span className={cn("hidden text-right text-[12px] sm:block", NUM, r.received > 0 ? "text-bz-text-muted" : "text-bz-text-soft")}>{fmtQty(r.received)}</span>
                  <span className="flex justify-center">
                    {item.lotTracked ? (
                      <span className={cn("text-[12.5px] font-semibold", NUM, over ? "text-bz-red" : "text-bz-text")} title="The sum of the batches below">
                        {fmtQty(q)}
                      </span>
                    ) : (
                      <NumberField value={q} onChange={(v) => setQty(r.refLineId, v)} max={cap} invalid={over} className="w-[104px]" ariaLabel={`Receiving now — ${item.name}`} />
                    )}
                  </span>
                  <span className="hidden text-right text-[12.5px] font-semibold text-bz-text sm:block">{q > 0 ? <Amount value={lineGross({ qty: q, rate: r.rate, discountPct: 0 })} /> : <span className="font-normal text-bz-text-soft">—</span>}</span>
                </div>

                {/* A return of serialised goods: pick the units, the batch follows. */}
                {fromReturn && item.serialTracked && cap > 0 && (
                  <div className="px-3 pb-2.5">
                    <div className="ml-3 border-l border-bz-line-soft pl-3">
                      <SerialField
                        qty={cap}
                        code={item.code}
                        value={state.serials[r.refLineId] ?? []}
                        options={shippedSerials(r.refLineId)}
                        invalid={tried && (state.serials[r.refLineId]?.length ?? 0) !== q}
                        onChange={(list) => setReturnedSerials(r.refLineId, list)}
                      />
                      {batchesOf(r.refLineId).length > 0 && (
                        <p className={cn("m-0 text-[10.5px] text-bz-text-soft", NUM)}>
                          Back into {batchesOf(r.refLineId).map((b) => `${b.batch} · ${fmtQty(b.qty)}`).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* A return of batch-only goods: pick from what actually shipped. */}
                {fromReturn && !item.serialTracked && item.lotTracked && cap > 0 && (
                  <div className="px-3 pb-2.5">
                    <div className="ml-3 flex flex-col gap-1.5 border-l border-bz-line-soft pl-3">
                      {(state.batches[r.refLineId] ?? []).map((b) => (
                        <div key={b.key} className="grid grid-cols-[minmax(0,1fr)_104px_20px] items-center gap-2">
                          <Select
                            trigger="ghost"
                            className="h-7 w-full justify-between"
                            label={b.batch || <span className="font-normal text-bz-text-soft">Which batch came back?</span>}
                            value={b.batch || null}
                            onChange={(v) => setBatch(r.refLineId, b.key, { batch: v, expiry: shipped.find((x) => x.lot === v)?.expiry ?? "" })}
                            width={280}
                            options={shipped.map((x) => ({ value: x.lot, label: x.lot, hint: x.expiry ? `expires ${fmtShort(x.expiry)}` : "no expiry" }))}
                          />
                          <NumberField value={b.qty} onChange={(v) => setBatch(r.refLineId, b.key, { qty: v })} className="h-7 w-[104px]" ariaLabel="Batch quantity" />
                          <button type="button" className={PLAIN_BTN} onClick={() => setBatch(r.refLineId, b.key, null)} aria-label="Remove batch">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setBatch(r.refLineId, `n${Date.now()}`, { qty: Math.max(0, cap - q) })} className="inline-flex w-fit items-center gap-1 py-0.5 text-[11px] font-medium text-bz-text-muted hover:text-bz-text">
                        <Plus size={11} /> Which batch came back
                      </button>
                    </div>
                  </div>
                )}

                {/* A purchase: the batch is new, so its number and dates are typed. */}
                {!fromReturn && item.lotTracked && cap > 0 && (
                  <div className="px-3 pb-2.5">
                    <div className="ml-3 flex flex-col gap-1.5 border-l border-bz-line-soft pl-3">

                      {(state.batches[r.refLineId] ?? []).map((b) => {
                        const note = expiryNote(b.expiry);
                        return (
                          <div key={b.key}>
                            <div className="grid grid-cols-[minmax(0,1fr)_104px_20px] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_152px_152px_104px_20px]">
                              <input value={b.batch} onChange={(e) => setBatch(r.refLineId, b.key, { batch: e.target.value })} placeholder="Batch no. from the supplier" className={cn(INPUT_SM, "h-7 text-[11.5px]", NUM, tried && b.qty > 0 && !b.batch.trim() && "border-bz-red-mark")} aria-label="Batch number" />
                              <label className="hidden items-center gap-1 sm:flex">
                                <span className="shrink-0 text-[10px] text-bz-text-soft">Made</span>
                                <input type="date" value={b.mfg} onChange={(e) => setBatch(r.refLineId, b.key, { mfg: e.target.value })} className={cn(INPUT_SM, "h-7 min-w-0 px-1.5 text-[11px]", NUM)} aria-label="Manufactured" />
                              </label>
                              <label className="hidden items-center gap-1 sm:flex">
                                <span className="shrink-0 text-[10px] text-bz-text-soft">Expires</span>
                                <input type="date" value={b.expiry} onChange={(e) => setBatch(r.refLineId, b.key, { expiry: e.target.value })} className={cn(INPUT_SM, "h-7 min-w-0 px-1.5 text-[11px]", NUM, note?.bad && "border-bz-red-mark")} aria-label="Expiry" />
                              </label>
                              <NumberField value={b.qty} onChange={(v) => setBatch(r.refLineId, b.key, { qty: v })} className="h-7 w-[104px]" ariaLabel="Batch quantity" />
                              <button type="button" className={PLAIN_BTN} onClick={() => setBatch(r.refLineId, b.key, null)} aria-label="Remove batch">
                                <X size={12} />
                              </button>
                            </div>
                            {note && (
                              <p className={cn("m-0 mt-0.5 inline-flex items-center gap-1 text-[10.5px]", note.bad ? "text-bz-red" : "text-bz-amber")}>
                                <TriangleAlert size={10} /> {note.text}
                              </p>
                            )}
                            {item.serialTracked && b.qty > 0 && b.batch.trim() && (
                              <SerialField
                                key={`${b.key}-${b.qty}`}
                                qty={b.qty}
                                code={item.code}
                                label={`Batch ${b.batch.trim()}`}
                                value={state.serials[serialKey(r.refLineId, b.batch.trim())] ?? []}
                                options={undefined}
                                invalid={tried && (state.serials[serialKey(r.refLineId, b.batch.trim())]?.length ?? 0) !== b.qty}
                                onChange={(s) => setSerials(r.refLineId, b.batch.trim(), s)}
                              />
                            )}
                          </div>
                        );
                      })}
                      <button type="button" onClick={() => setBatch(r.refLineId, `n${Date.now()}`, { qty: Math.max(0, cap - q) })} className="inline-flex w-fit items-center gap-1 py-0.5 text-[11px] font-medium text-bz-text-muted hover:text-bz-text">
                        <Plus size={11} /> New batch
                      </button>
                    </div>
                  </div>
                )}

                {!fromReturn && item.serialTracked && !item.lotTracked && q > 0 && (
                  <div className="px-3 pb-2.5">
                    <div className="ml-3 border-l border-bz-line-soft pl-3">
                      <SerialField
                        key={`${r.refLineId}-${q}`}
                        qty={q}
                        code={item.code}
                        value={state.serials[r.refLineId] ?? []}
                        invalid={tried && (state.serials[r.refLineId]?.length ?? 0) !== q}
                        onChange={(s) => setSerials(r.refLineId, undefined, s)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <MoneyList
          rows={[
            ...totalsRows(totals, { currency, exchangeRate: rate, totalLabel: "Goods value" }),
            ...(transportAmount ? [{ label: `Freight · ${costAllocation.toLowerCase()}`, value: <Amount value={transportAmount} /> }, { label: "Landed value", value: <Amount value={totals.total + transportAmount} currency={currency} />, strong: true }] : []),
          ]}
        />
      </div>

      <Section title="Transport & landed cost" summary={[transporter, truckNo, transportAmount ? `freight ${transportAmount.toLocaleString("en-US")}` : ""].filter(Boolean).join(" · ") || "None"}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MiniLabel label="Transporter" optional>
            <input value={transporter} onChange={(e) => setTransporter(e.target.value)} placeholder="Himal Logistics" className={INPUT_SM} />
          </MiniLabel>
          <MiniLabel label="Vehicle no." optional>
            <input value={truckNo} onChange={(e) => setTruckNo(e.target.value)} placeholder="Ba 12 Kha 3390" className={INPUT_SM} />
          </MiniLabel>
          <MiniLabel label="Driver" optional>
            <input value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Name" className={INPUT_SM} />
          </MiniLabel>
          <MiniLabel label="Freight" optional>
            <AmountInput value={transportAmount} onChange={setTransportAmount} ariaLabel="Freight amount" />
          </MiniLabel>
          <MiniLabel label="Allocate freight">
            <Select trigger="ghost" className="h-8 w-full justify-between" label={costAllocation} value={costAllocation} onChange={(v) => setCostAllocation(v as ItemReceipt["costAllocation"])} width={220} options={[{ value: "By value", label: "By value" }, { value: "By quantity", label: "By quantity" }, { value: "None", label: "Don't allocate" }]} />
          </MiniLabel>
          <MiniLabel label="Supplier's note no." optional>
            <input value={vendorRef} onChange={(e) => setVendorRef(e.target.value)} placeholder="Their challan no." className={INPUT_SM} />
          </MiniLabel>
          <MiniLabel label="PP number" optional>
            <input value={ppNumber} onChange={(e) => setPpNumber(e.target.value)} className={cn(INPUT_SM, NUM)} />
          </MiniLabel>
          <MiniLabel label="PP date" optional>
            <input type="date" value={ppDate ?? ""} onChange={(e) => setPpDate(e.target.value)} className={cn(INPUT_SM, NUM)} />
          </MiniLabel>
          <MiniLabel label="LC number" optional>
            <input value={lc} onChange={(e) => setLc(e.target.value)} className={cn(INPUT_SM, NUM)} />
          </MiniLabel>
          <MiniLabel label="CI number" optional>
            <input value={ciNumber} onChange={(e) => setCiNumber(e.target.value)} className={cn(INPUT_SM, NUM)} />
          </MiniLabel>
        </div>
      </Section>

      <MoreFields memo={memo} onMemo={setMemo} custom={custom} onCustom={setCustom} tried={tried}>
        {DIMENSIONS.filter((d) => d.key !== "partner").map((d) => (
          <MiniLabel key={d.key} label={d.label}>
            <Select
              trigger="ghost"
              className="h-8 w-full justify-between"
              label={dims[d.key as keyof typeof dims] ?? <span className="font-normal text-bz-text-soft">None</span>}
              value={dims[d.key as keyof typeof dims] ?? null}
              onChange={(v) => setDims((s) => ({ ...s, [d.key]: v === "__none" ? undefined : v }))}
              width={240}
              options={[{ value: "__none", label: "None" }, ...d.options.map((o) => ({ value: o, label: o }))]}
            />
          </MiniLabel>
        ))}
      </MoreFields>
    </SheetFrame>
  );
}

export { vendorById, customerById };
