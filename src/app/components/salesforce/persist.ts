import { createStore } from "../sales/store";

// ════════════════════════════════════════════════════════════════════════════
// PERSISTENCE — the prototype keeps what the user builds
//
// Every Sales force / dealer portal store is a `persistentStore`: it loads from
// localStorage on start and saves on every change, so the flow survives a
// reload. A store starts from its CLEAN value (usually empty) unless the user
// chose "Load sample data", in which case it starts from its SAMPLE value.
// Storage can be missing or full (private window, quota) — every access is
// guarded and the prototype then simply runs in memory.
// ════════════════════════════════════════════════════════════════════════════

const PREFIX = "sf2:";
/** Bump when a stored shape changes incompatibly — old saves are then ignored, not crashed on. */
const VERSION = "1";
const MODE_KEY = `${PREFIX}mode`;
const VERSION_KEY = `${PREFIX}version`;

export type DataMode = "clean" | "sample";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

(() => {
  const ls = storage();
  if (!ls) return;
  try {
    if (ls.getItem(VERSION_KEY) !== VERSION) {
      for (const k of Object.keys(ls)) if (k.startsWith(PREFIX)) ls.removeItem(k);
      ls.setItem(VERSION_KEY, VERSION);
    }
  } catch {
    /* storage unavailable — in-memory only */
  }
})();

export function dataMode(): DataMode {
  try {
    return storage()?.getItem(MODE_KEY) === "sample" ? "sample" : "clean";
  } catch {
    return "clean";
  }
}

function read<T>(key: string): T | undefined {
  try {
    const raw = storage()?.getItem(PREFIX + key);
    return raw == null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}

/** What an earlier version of the prototype saved under `key` — for a one-time conversion, never for normal reads. */
export const readSaved = <T,>(key: string): T | undefined => read<T>(key);
export function dropSaved(key: string) {
  try {
    storage()?.removeItem(PREFIX + key);
  } catch {
    /* nothing to drop */
  }
}

function write(key: string, value: unknown) {
  try {
    storage()?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota or private mode — keep going in memory */
  }
}

const STORES = new Map<string, { set: (fn: (s: never) => unknown) => void }>();
/** True while a change from another tab is being applied — it must not be written back. */
let fromOtherTab = false;

// The prototype runs in several tabs at once (Sales force, rep app, dealer portal). Without this, each tab keeps the
// data it loaded with, and a location saved in one tab is invisible to the rep app open in another. The `storage`
// event fires only in the OTHER tabs, so applying it here never loops.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key || !e.key.startsWith(PREFIX)) return;
    // Another tab chose Start clean / Load sample: every store changes at once, so start over from storage.
    if (e.key === MODE_KEY || e.key === VERSION_KEY) {
      window.location.reload();
      return;
    }
    const store = STORES.get(e.key.slice(PREFIX.length));
    if (!store || e.newValue == null) return;
    try {
      const value = JSON.parse(e.newValue);
      fromOtherTab = true;
      store.set(() => value as never);
    } catch {
      /* a half-written value — the next change brings it in */
    } finally {
      fromOtherTab = false;
    }
  });
}

/**
 * A store that survives a reload and stays in step across tabs. `key` must be unique across the prototype
 * (e.g. "customers", "portal.cart"). `sample` is used only in sample mode, and only when nothing is saved yet.
 */
export function persistentStore<T>(key: string, clean: T, sample?: () => T) {
  if (STORES.has(key)) console.warn(`[sf2] persistentStore key used twice: ${key}`);
  const saved = read<T>(key);
  const initial = saved !== undefined ? saved : dataMode() === "sample" && sample ? sample() : clean;
  const store = createStore<T>(initial);
  store.subscribe(() => {
    if (!fromOtherTab) write(key, store.get());
  });
  STORES.set(key, store as unknown as { set: (fn: (s: never) => unknown) => void });
  return store;
}

/** Wipe everything the prototype saved and start again — clean (empty) or with the sample business. */
export function resetPrototype(mode: DataMode) {
  const ls = storage();
  try {
    if (ls) {
      for (const k of Object.keys(ls)) if (k.startsWith(PREFIX)) ls.removeItem(k);
      ls.setItem(VERSION_KEY, VERSION);
      ls.setItem(MODE_KEY, mode);
    }
  } catch {
    /* nothing saved to clear */
  }
  window.location.reload();
}

/** The next id in a series: nextId("C-", ["C-001", "C-007"]) → "C-008". */
export function nextId(prefix: string, existing: string[], width = 3) {
  const n = existing.filter((x) => x.startsWith(prefix)).map((x) => Number(x.slice(prefix.length).replace(/\D.*$/, "")) || 0);
  return `${prefix}${String(Math.max(0, ...n) + 1).padStart(width, "0")}`;
}
