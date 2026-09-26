import { addDays } from "../../sales/orders";

// ════════════════════════════════════════════════════════════════════════════
// KIT UTIL — the small rules more than one kit piece needs
// ════════════════════════════════════════════════════════════════════════════

export const MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
/** The modifier as a reader sees it in a Kbd or a title: "⌘S" / "Ctrl S". */
export const mod = (key: string) => (MAC ? `⌘${key}` : `Ctrl ${key}`);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "25 Sep 2026" — the masters spec writes every effective date this way. */
export function fmtDay(iso: string | null | undefined) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "25 Sep" — a date inside a sentence ("There is already a rate for 25 Sep."). */
export function fmtDayMonth(iso: string | null | undefined) {
  if (!iso) return "";
  const [, m, d] = iso.split("-").map(Number);
  return m && d ? `${d} ${MONTHS[m - 1]}` : iso;
}

export const isIsoDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/**
 * The date keys every date field in the masters honours (spec §7 "Dates"):
 * `t` today, ↑ / ↓ one day. Returns the new value, or null when the key is not one of them.
 */
export function stepDate(iso: string | null, key: string, today: string): string | null {
  if (key === "t" || key === "T") return today;
  const base = iso && isIsoDay(iso) ? iso : today;
  if (key === "ArrowUp") return addDays(base, 1);
  if (key === "ArrowDown") return addDays(base, -1);
  return null;
}

/**
 * A rate's inverse — "1 NPR = 0.0074571 USD". Spec §4.2 says "7 significant digits" in words but every
 * example it draws (0.0074571 · 0.0074951 · 0.0075301) is 5; the examples are followed (Kit as built).
 */
export function inverseOf(rate: number) {
  if (!(rate > 0)) return "—";
  return String(Number((1 / rate).toPrecision(5)));
}

/** "+0.51 %" / "−1.20 %" — the change a new rate makes against the one before it. */
export function pctChange(next: number, prev: number | null | undefined) {
  if (!(next > 0) || !prev || !(prev > 0)) return null;
  const p = ((next - prev) / prev) * 100;
  const sign = p > 0 ? "+" : p < 0 ? "−" : "±";
  return { text: `${sign}${Math.abs(p).toFixed(2)} %`, pct: p };
}

/** A rate as it is typed and read: two decimals at least, more when the rate has them. */
export function fmtRate(n: number | null | undefined) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

/** A typed figure: commas and spaces dropped; blank or not a number → null. */
export function parseNum(raw: string): number | null {
  const t = raw.replace(/[,\s]/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
