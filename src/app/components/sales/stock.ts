import { SERIALS_ON_HAND, StockSerial, itemById } from "./orders";
import { ordersStore } from "./store";
import { receiptsStore } from "../purchase/receipts";

// ════════════════════════════════════════════════════════════════════════════
// SERIAL LEDGER — a unit is in exactly one place, and only one document can
// take it out
//
// A serial is not a number on a form, it is a thing on a shelf. So the list a
// delivery picks from is not a static master: it is what is on hand, MINUS
// what is already on a delivery (approved, or waiting for approval — a unit
// promised to an approver is not available to promise again), PLUS what has
// come back on a return receipt, PLUS what a purchase receipt brought in.
//
// The live app has no equivalent: SerialNumberStatus.Sold is never written by
// anything, and the serial on an outgoing document is unvalidated free text —
// so the same unit can ship twice and nothing notices. That is the rule this
// design is showing; see docs/sales-redesign in the app repo.
// ════════════════════════════════════════════════════════════════════════════

export type SerialState = StockSerial & { outOn?: string };

/** Every serial this item has ever had, with where it is and what holds it. */
export function serialLedger(itemId: string): SerialState[] {
  const by = new Map<string, SerialState>();
  const put = (s: StockSerial) => by.set(s.serial, { ...(by.get(s.serial) ?? s), ...s, outOn: undefined });

  // On the shelf to begin with.
  (SERIALS_ON_HAND[itemId] ?? []).forEach(put);

  // A purchase receipt brings new units in; a return receipt brings old ones back.
  receiptsStore
    .get()
    .filter((r) => r.state === "approved" && !r.cancelled)
    .forEach((r) =>
      r.lines
        .filter((l) => l.itemId === itemId)
        .forEach((l) =>
          r.serials
            .filter((s) => s.lineId === l.refLineId)
            .forEach((s) => s.serials.forEach((serial) => put({ serial, batch: s.batch, locationId: r.locationId }))),
        ),
    );

  // A delivery takes a unit out — and a delivery still waiting for approval
  // holds it, so nobody promises the same box twice.
  ordersStore.get().forEach((o) =>
    o.docs
      .filter((d) => d.kind === "delivery" && !d.cancelled && !d.rejected)
      .forEach((d) =>
        (d.serials ?? []).forEach((s) => {
          const line = o.lines.find((l) => l.id === s.lineId);
          if (line?.itemId !== itemId) return;
          s.serials.forEach((serial) => {
            const at = by.get(serial);
            if (at) by.set(serial, { ...at, outOn: d.no });
          });
        }),
      ),
  );

  return [...by.values()];
}

/**
 * What a delivery can actually pick: on hand here, in this batch, not already
 * on another delivery. `except` is the delivery being edited — its own units
 * are still its to keep.
 */
export function availableSerials(itemId: string, locationId: string, batch?: string, except?: string): StockSerial[] {
  return serialLedger(itemId).filter(
    (s) => s.locationId === locationId && (batch === undefined || s.batch === batch) && (!s.outOn || s.outOn === except),
  );
}

/** The delivery a serial already left on, if any — the words a refusal needs. */
export function serialOutOn(itemId: string, serial: string, except?: string) {
  const hit = serialLedger(itemId).find((s) => s.serial === serial);
  return hit?.outOn && hit.outOn !== except ? hit.outOn : null;
}

export { itemById };
