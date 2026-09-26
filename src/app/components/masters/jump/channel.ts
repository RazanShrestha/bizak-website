import * as React from "react";
import { currencyStore } from "../seed/currencies";
import type { CurrencyState } from "../seed/currencies";
import { ITEM_SEED, itemsStore } from "../seed/items";
import type { Item } from "../seed/items";

// ════════════════════════════════════════════════════════════════════════════
// CROSS-TAB — "Open item page ↗" opens a NEW tab so the draft survives; a
// save made there comes back to the draft as an offer (spec §5.2, B-F7).
//
// The app's contract, and all it needs: when a record page saves an item it
// posts `{ kind: "item", id, fields }` on BroadcastChannel("bzk-masters");
// a composer tab turns it into the per-line offer. Nothing else crosses tabs.
//
// Mock only: each browser tab here has its OWN in-memory "server" (the
// stores), where the app has one server both tabs read. So a tab that opens
// says `hello`, and a tab holding changes answers with them (`state`) — the
// stand-in for the new tab reading the server. A change applied from another
// tab is never re-announced.
// ════════════════════════════════════════════════════════════════════════════

export type ItemSaved = { kind: "item"; id: string; fields: Partial<Item> };
type Msg = ItemSaved | { kind: "hello"; from: string } | { kind: "state"; from: string; items: Item[]; currencies: CurrencyState | null };

const NAME = "bzk-masters";
const TAB = Math.random().toString(36).slice(2);
const SEED_BY_ID = new Map(ITEM_SEED.map((x) => [x.id, x]));
const CURRENCY_SEED = currencyStore.get();

let chan: BroadcastChannel | null = null;
let applying = false;
let last = itemsStore.get();
const listeners = new Set<(m: ItemSaved) => void>();

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function changedFields(before: Item | undefined, after: Item): Partial<Item> {
  if (!before) return { ...after };
  const out: Record<string, unknown> = {};
  (Object.keys(after) as (keyof Item)[]).forEach((k) => {
    if (!same(before[k], after[k])) out[k] = after[k];
  });
  return out as Partial<Item>;
}

function applyItems(rows: { id: string; fields: Partial<Item> }[]) {
  applying = true;
  try {
    itemsStore.set((all) => {
      const next = all.map((x) => {
        const r = rows.find((y) => y.id === x.id);
        return r ? { ...x, ...r.fields } : x;
      });
      rows.forEach((r) => !all.some((x) => x.id === r.id) && next.push(r.fields as Item));
      return next;
    });
  } finally {
    applying = false;
  }
}

/** Idempotent: every surface that reads or writes items calls it (the composer, the item desk, the hub). */
export function installMastersChannel() {
  if (chan || typeof BroadcastChannel === "undefined") return;
  chan = new BroadcastChannel(NAME);

  itemsStore.subscribe(() => {
    const next = itemsStore.get();
    if (next === last) return;
    const prev = new Map(last.map((x) => [x.id, x]));
    last = next;
    if (applying) return;
    next.forEach((x) => {
      if (prev.get(x.id) === x) return;
      const fields = changedFields(prev.get(x.id), x);
      if (Object.keys(fields).length) chan?.postMessage({ kind: "item", id: x.id, fields } satisfies ItemSaved);
    });
  });

  chan.onmessage = (e: MessageEvent<Msg>) => {
    const m = e.data;
    if (!m || typeof m !== "object") return;
    if (m.kind === "item") {
      applyItems([{ id: m.id, fields: m.fields }]);
      listeners.forEach((l) => l(m));
    } else if (m.kind === "hello" && m.from !== TAB) {
      const items = itemsStore.get().filter((x) => SEED_BY_ID.get(x.id) !== x);
      const cur = currencyStore.get();
      if (items.length || cur !== CURRENCY_SEED) chan?.postMessage({ kind: "state", from: TAB, items, currencies: cur !== CURRENCY_SEED ? cur : null } satisfies Msg);
    } else if (m.kind === "state" && m.from !== TAB) {
      if (m.items.length) applyItems(m.items.map((x) => ({ id: x.id, fields: x })));
      if (m.currencies && currencyStore.get() === CURRENCY_SEED) currencyStore.set(() => m.currencies!);
    }
  };
  chan.postMessage({ kind: "hello", from: TAB } satisfies Msg);
}

/** A composer tab listens for item saves made in another tab. */
export function useItemSavedElsewhere(fn: (m: ItemSaved) => void) {
  const ref = React.useRef(fn);
  ref.current = fn;
  React.useEffect(() => {
    installMastersChannel();
    const l = (m: ItemSaved) => ref.current(m);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);
}

/** The item page's tab: announce saves, and read the opener's state on arrival. */
export function useMastersChannel() {
  React.useEffect(() => installMastersChannel(), []);
}
