import { fmtDayMonth } from "../kit";
import {
  MASTERS_ME,
  MASTER_SUBSIDIARIES,
  currencyStore,
  isCodeShaped,
  newRateId,
  rateUnit,
  subsidiaryName,
  totalUsage,
} from "../seed/currencies";
import type { Currency, CurrencyState, ExchangeRate } from "../seed/currencies";
import { documentCount } from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// CURRENCY WRITES — what the mockup's "server" does for each §8.2 endpoint
//
// Each write returns the server's refusal sentence, or null. Undo restores the
// snapshot taken before the write (the mock has one store; a real Undo is the
// inverse call). Every sentence the reader sees is here, so the port finds
// them in one place.
// ════════════════════════════════════════════════════════════════════════════

export const snapshot = () => currencyStore.get();
export const restore = (s: CurrencyState) => currencyStore.set(() => s);
const set = (fn: (s: CurrencyState) => CurrencyState) => currencyStore.set(fn);

export const USE_A_CODE = "Use a 2–5 letter code, like USD.";
/** CurrencyServiceImpl.update's duplicate refusal today, verbatim (B-C6 adds it to create and skips archived rows). */
export const DUPLICATE_CODE = "Currency with same short_cut already exists.";

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

/** A live currency (not archived, not `except`) already holding this code — case-insensitive, trimmed (B-C6). */
export const codeHolder = (st: CurrencyState, code: string, except?: string) =>
  st.currencies.find((c) => c.id !== except && !c.archived && c.shortcut.trim().toLowerCase() === code.trim().toLowerCase()) ?? null;

// ── Rates (B-C2) ────────────────────────────────────────────────────────────

/**
 * One dated rate from the popover or the bulk grid: a new row for a new date; the same date's row is
 * updated only while no document took it (§4.3).
 */
export function saveRate(r: { from: string; to: string; date: string; rate: number }): string | null {
  if (!(r.rate > 0)) return "Enter a rate above 0.";
  const st = snapshot();
  const same = st.rates.find((x) => x.from === r.from && x.to === r.to && x.date === r.date);
  if (same && same.used > 0) return `The rate for ${fmtDayMonth(r.date)} is used by ${plural(same.used, "document")}, so it can't change.`;
  set((s) => ({
    ...s,
    rates: same
      ? s.rates.map((x) => (x.id === same.id ? { ...x, rate: r.rate, by: MASTERS_ME, source: "Manual" } : x))
      : [{ id: newRateId(), from: r.from, to: r.to, date: r.date, rate: r.rate, source: "Manual", by: MASTERS_ME, created: new Date().toISOString(), used: 0 }, ...s.rates],
  }));
  return null;
}

/** The sheet's staged Rates block for one pair: added, edited (unused only) and removed (unused only) rows. */
export function applyRateChanges(
  from: string,
  to: string,
  changes: { added: { date: string | null; rate: number | null }[]; edited: { id: string; date: string | null; rate: number | null }[]; removed: string[] },
) {
  set((s) => {
    let rates: ExchangeRate[] = s.rates.filter((x) => !changes.removed.includes(x.id) || x.used > 0);
    rates = rates.map((x) => {
      const e = changes.edited.find((y) => y.id === x.id);
      return e && x.used === 0 && e.date && e.rate ? { ...x, date: e.date, rate: e.rate, by: MASTERS_ME } : x;
    });
    const added: ExchangeRate[] = changes.added
      .filter((a) => a.date && a.rate)
      .map((a) => ({ id: newRateId(), from, to, date: a.date!, rate: a.rate!, source: "Manual", by: MASTERS_ME, created: new Date().toISOString(), used: 0 }));
    return { ...s, rates: [...added, ...rates] };
  });
}

// ── The base per subsidiary (B-C1, D-4) ─────────────────────────────────────

/** The refusal the base dialog states up front once the subsidiary has posted documents (D-4). */
export function baseChangeRefusal(org: string): string | null {
  const s = MASTER_SUBSIDIARIES.find((x) => x.id === org);
  if (!s || s.posted === 0) return null;
  return `${s.name} has ${plural(s.posted, "posted document")}, so its base can't change.`;
}

export function changeBase(org: string, currencyId: string): string | null {
  const refused = baseChangeRefusal(org);
  if (refused) return refused;
  set((s) => ({
    ...s,
    base: { ...s.base, [org]: currencyId },
    // "adds membership if missing" (B-C1); the currency rows are otherwise untouched.
    currencies: s.currencies.map((c) => (c.id === currencyId && !c.orgs.includes(org) ? { ...c, orgs: [...c.orgs, org] } : c)),
  }));
  return null;
}

// ── Fix code (§4.1) ─────────────────────────────────────────────────────────

export type FixCheck =
  | { kind: "shape"; text: string }
  | { kind: "free" }
  | { kind: "archive-other"; other: Currency; text: string }
  | { kind: "used-other"; other: Currency; text: string }
  | { kind: "same" };

export function checkFixCode(st: CurrencyState, id: string, raw: string): FixCheck {
  const code = raw.trim().toUpperCase();
  if (!isCodeShaped(code)) return { kind: "shape", text: USE_A_CODE };
  const me = st.currencies.find((c) => c.id === id);
  if (me && me.shortcut.trim().toUpperCase() === code) return { kind: "same" };
  const other = codeHolder(st, code, id);
  if (!other) return { kind: "free" };
  const used = totalUsage(other);
  const baseOf = Object.entries(st.base).find(([, cid]) => cid === other.id)?.[0];
  if (used === 0 && !baseOf) return { kind: "archive-other", other, text: `${code} is used by another currency that nothing uses. Archive it and use ${code} here?` };
  const docs = documentCount(other.usage);
  return { kind: "used-other", other, text: baseOf ? `${code} is the base of ${subsidiaryName(baseOf)}.` : docs > 0 ? `${code} is used by another currency on ${plural(docs, "document")}.` : `${code} is used by another currency.` };
}

/** Two calls when the code is held by an unused row: archive that row, then write this row's SHORTCUT. */
export function fixCode(id: string, raw: string, archiveOther?: string) {
  const code = raw.trim().toUpperCase();
  set((s) => ({
    ...s,
    currencies: s.currencies.map((c) => (c.id === archiveOther ? { ...c, archived: true } : c.id === id ? { ...c, shortcut: code } : c)),
  }));
}

// ── Identity, membership, archive, delete (B-C5, B-C4) ──────────────────────

export type CurrencyDraft = Pick<Currency, "shortcut" | "name" | "symbol" | "placement" | "orgs" | "applyToChild">;

export function validateDraft(st: CurrencyState, draft: CurrencyDraft, id: string | null): { field: "code" | "name"; text: string } | null {
  const before = id ? st.currencies.find((c) => c.id === id) : null;
  const codeChanged = !before || before.shortcut.trim() !== draft.shortcut.trim();
  if (!draft.shortcut.trim()) return { field: "code", text: "Enter a code." };
  // Existing non-code rows are grandfathered (flagged "Code to fix"); a new or edited code must be one.
  if (codeChanged && !isCodeShaped(draft.shortcut)) return { field: "code", text: USE_A_CODE };
  if (codeChanged && codeHolder(st, draft.shortcut, id ?? undefined)) return { field: "code", text: DUPLICATE_CODE };
  if (!draft.name.trim()) return { field: "name", text: "A name is required." };
  return null;
}

export function saveCurrency(id: string | null, draft: CurrencyDraft): string {
  const clean = { ...draft, shortcut: isCodeShaped(draft.shortcut) ? draft.shortcut.trim().toUpperCase() : draft.shortcut, name: draft.name.trim(), symbol: draft.symbol?.trim() || null };
  if (id) {
    set((s) => ({ ...s, currencies: s.currencies.map((c) => (c.id === id ? { ...c, ...clean } : c)) }));
    return id;
  }
  const newId = String(Math.max(...currencyStore.get().currencies.map((c) => Number(c.id))) + 1);
  set((s) => ({ ...s, currencies: [...s.currencies, { id: newId, ...clean, archived: false, usage: [], usedIn: [] }] }));
  return newId;
}

/** B-C4 refuses the base currency; the reason is shown where Archive was asked for. */
export function archiveRefusal(st: CurrencyState, id: string): string | null {
  const org = Object.entries(st.base).find(([, cid]) => cid === id)?.[0];
  return org ? `It is the base of ${subsidiaryName(org)}.` : null;
}

export function setArchived(id: string, archived: boolean): string | null {
  if (archived) {
    const refused = archiveRefusal(snapshot(), id);
    if (refused) return refused;
  }
  set((s) => ({ ...s, currencies: s.currencies.map((c) => (c.id === id ? { ...c, archived } : c)) }));
  return null;
}

export const canDelete = (st: CurrencyState, c: Currency) => totalUsage(c) === 0 && !archiveRefusal(st, c.id) && !st.rates.some((r) => (r.from === c.id || r.to === c.id) && r.used > 0);

export function deleteCurrency(id: string) {
  set((s) => ({ ...s, currencies: s.currencies.filter((c) => c.id !== id), rates: s.rates.filter((r) => r.from !== id && r.to !== id) }));
}

/** "1 USD = 134.10 NPR" — the direction always spelled (§4.4). */
export const rateSentence = (st: CurrencyState, from: Currency, toId: string, rate: number, fmt: (n: number) => string) =>
  `1 ${rateUnit(from)} = ${fmt(rate)} ${rateUnit(st.currencies.find((c) => c.id === toId))}`;
