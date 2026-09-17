import * as React from "react";
import { Order, SEED_ORDERS } from "./orders";

// ════════════════════════════════════════════════════════════════════════════
// SALES STORE — one in-memory set shared by every sales desk
//
// The flow crosses pages (an order is delivered on Orders, billed on Invoices,
// paid on Payments), so the documents cannot live in one page's state or a
// delivery made on one desk would vanish on the next. In the app this is the
// server; here it is a module-level store read through useSyncExternalStore.
// ════════════════════════════════════════════════════════════════════════════

type Listener = () => void;

export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set: (fn: (s: T) => T) => {
      state = fn(state);
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export const ordersStore = createStore<Order[]>(SEED_ORDERS);

export function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  return React.useSyncExternalStore(store.subscribe, store.get, store.get);
}
