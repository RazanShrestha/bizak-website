// ════════════════════════════════════════════════════════════════════════════
// CRON — a five-field expression engine for the scheduled-jobs page
//
// Times are WALL-CLOCK minutes in the job's own time zone, carried in UTC Date
// fields so no host time zone or DST shift can move a run. A zone here is a
// fixed offset; the page only ever needs "what does 02:00 there look like".
//
// Day-of-month and day-of-week follow Vixie cron: when BOTH are restricted a
// day matches if EITHER does — "0 9 1 * 1" is the 1st AND every Monday. That
// is the rule people most often get wrong when reading an expression back.
// ════════════════════════════════════════════════════════════════════════════

export const FIELDS = [
  { key: "minute", label: "Minute", min: 0, max: 59 },
  { key: "hour", label: "Hour", min: 0, max: 23 },
  { key: "dom", label: "Day", min: 1, max: 31 },
  { key: "month", label: "Month", min: 1, max: 12 },
  { key: "dow", label: "Weekday", min: 0, max: 6 },
] as const;

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const NAMES: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export type Parsed = { sets: Set<number>[]; restricted: boolean[] };
export type ParseResult = { ok: true; cron: Parsed } | { ok: false; field: number; error: string };

function num(tok: string, fi: number): number | null {
  const t = tok.toLowerCase();
  if (t in NAMES) return NAMES[t];
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return fi === 4 && n === 7 ? 0 : n;
}

export function parseCron(expr: string): ParseResult {
  const parts = expr.trim().split(/\s+/).filter(Boolean);
  if (parts.length !== 5) return { ok: false, field: Math.min(parts.length, 4), error: `Needs 5 fields; this has ${parts.length}.` };
  const sets: Set<number>[] = [];
  const restricted: boolean[] = [];
  for (let fi = 0; fi < 5; fi++) {
    const { min, max, label } = FIELDS[fi];
    const set = new Set<number>();
    for (const piece of parts[fi].split(",")) {
      const [range, stepRaw] = piece.split("/");
      const step = stepRaw === undefined ? 1 : Number(stepRaw);
      if (!Number.isInteger(step) || step < 1) return { ok: false, field: fi, error: `${label}: “/${stepRaw}” is not a valid step.` };
      let lo: number | null;
      let hi: number | null;
      if (range === "*") [lo, hi] = [min, max];
      else if (range.includes("-")) {
        const [a, b] = range.split("-");
        [lo, hi] = [num(a, fi), num(b, fi)];
      } else {
        lo = num(range, fi);
        hi = stepRaw === undefined ? lo : max;
      }
      if (lo === null || hi === null) return { ok: false, field: fi, error: `${label}: “${piece}” is not a value.` };
      if (lo < min || hi > max || lo > hi) return { ok: false, field: fi, error: `${label} must be between ${min} and ${max}.` };
      for (let v = lo; v <= hi; v += step) set.add(v);
    }
    sets.push(set);
    restricted.push(parts[fi] !== "*");
  }
  return { ok: true, cron: { sets, restricted } };
}

// ── Next runs ───────────────────────────────────────────────────────────────

const dayMatches = (c: Parsed, d: Date) => {
  const dom = c.sets[2].has(d.getUTCDate());
  const dow = c.sets[4].has(d.getUTCDay());
  if (c.restricted[2] && c.restricted[4]) return dom || dow;
  return dom && dow;
};

/** The next `count` run times strictly after `from` (wall-clock ms). */
export function nextRuns(c: Parsed, from: number, count: number): number[] {
  const out: number[] = [];
  const d = new Date(Math.floor(from / 60000) * 60000 + 60000);
  let guard = 0;
  while (out.length < count && guard++ < 200000) {
    if (d.getUTCFullYear() > new Date(from).getUTCFullYear() + 8) break;
    if (!c.sets[3].has(d.getUTCMonth() + 1)) {
      d.setUTCMonth(d.getUTCMonth() + 1, 1);
      d.setUTCHours(0, 0, 0, 0);
    } else if (!dayMatches(c, d)) {
      d.setUTCDate(d.getUTCDate() + 1);
      d.setUTCHours(0, 0, 0, 0);
    } else if (!c.sets[1].has(d.getUTCHours())) {
      d.setUTCHours(d.getUTCHours() + 1, 0, 0, 0);
    } else if (!c.sets[0].has(d.getUTCMinutes())) {
      d.setUTCMinutes(d.getUTCMinutes() + 1, 0, 0);
    } else {
      out.push(d.getTime());
      d.setUTCMinutes(d.getUTCMinutes() + 1, 0, 0);
    }
  }
  return out;
}

/** Runs in (from, to], oldest first — how the history is seeded. */
export function runsBetween(c: Parsed, from: number, to: number, cap = 400): number[] {
  return nextRuns(c, from, cap).filter((t) => t <= to);
}

// ── Reading an expression back as a sentence ────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");
export const clock = (h: number, m: number) => `${pad(h)}:${pad(m)}`;

function listWords(values: number[], names: string[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const contiguous = sorted.length > 2 && sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
  if (contiguous) return `${names[sorted[0]]} to ${names[sorted[sorted.length - 1]]}`;
  if (sorted.length === 1) return names[sorted[0]];
  return `${sorted.slice(0, -1).map((v) => names[v]).join(", ")} and ${names[sorted[sorted.length - 1]]}`;
}

const ordinal = (n: number) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${s}`;
};

function stepOf(part: string) {
  const m = /^\*\/(\d+)$/.exec(part);
  return m ? Number(m[1]) : null;
}

export function describe(expr: string): string {
  const r = parseCron(expr);
  if (!r.ok) return "Not a valid schedule";
  const [mi, ho, dm, mo, dw] = expr.trim().split(/\s+/);
  const c = r.cron;
  const mins = [...c.sets[0]].sort((a, b) => a - b);
  const hours = [...c.sets[1]].sort((a, b) => a - b);

  let time: string;
  const minStep = stepOf(mi);
  const hourStep = stepOf(ho);
  if (mi === "*" && ho === "*") time = "Every minute";
  else if (minStep && ho === "*") time = `Every ${minStep} minutes`;
  else if (minStep) time = `Every ${minStep} minutes between ${clock(hours[0], 0)} and ${clock(hours[hours.length - 1], 59)}`;
  else if (mins.length === 1 && ho === "*") time = mins[0] === 0 ? "Every hour" : `Every hour at :${pad(mins[0])}`;
  else if (mins.length === 1 && hourStep) time = `Every ${hourStep} hours at :${pad(mins[0])}`;
  else if (mins.length === 1 && hours.length <= 4) time = `At ${hours.map((h) => clock(h, mins[0])).join(", ")}`;
  else if (mins.length === 1) time = `At :${pad(mins[0])} past ${hours.length} hours`;
  else time = `At ${mins.length} minutes of ${ho === "*" ? "every hour" : `${hours.length} hours`}`;

  const days: string[] = [];
  if (dm !== "*") days.push(`on the ${listWords([...c.sets[2]], Array.from({ length: 32 }, (_, i) => ordinal(i)))}`);
  if (dw !== "*") {
    const set = [...c.sets[4]];
    const weekdays = set.length === 5 && [1, 2, 3, 4, 5].every((d) => c.sets[4].has(d));
    days.push(weekdays ? "on weekdays" : set.length === 2 && c.sets[4].has(0) && c.sets[4].has(6) ? "on weekends" : `on ${listWords(set, DAY_LONG)}`);
  }
  const monthPart = mo === "*" ? (dm !== "*" && dw === "*" ? " of every month" : "") : ` in ${listWords([...c.sets[3]], ["", ...MONTH_SHORT])}`;
  const everyDay = !days.length && mo === "*" && time.startsWith("At ") ? ", every day" : "";
  return `${time}${everyDay}${days.length ? ` ${days.join(" or ")}` : ""}${monthPart}`;
}

// ── Builder ⇄ expression ────────────────────────────────────────────────────

export type Mode = "once" | "interval" | "hourly" | "daily" | "weekly" | "monthly" | "custom";

export type Builder = {
  mode: Mode;
  every: number;
  unit: "minutes" | "hours";
  minute: number;
  hour: number;
  weekdays: number[];
  monthDay: number;
  /** YYYY-MM-DD, used by "once" only — cron has no year, so a one-off is not an expression. */
  date: string;
  custom: string;
};

/** The single run of a "once" schedule, as wall-clock ms; null when the date is unusable. */
export function onceMs(b: Pick<Builder, "date" | "hour" | "minute">): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(b.date);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], b.hour, b.minute) : null;
}

export function describeBuilder(b: Builder): string {
  if (b.mode !== "once") return describe(toExpr(b));
  const at = onceMs(b);
  return at === null ? "Once, date not set" : `Once, on ${fmtRun(at)} ${new Date(at).getUTCFullYear()} at ${fmtClock(at)}`;
}

/** [1,2,3,4,5,0] → "0,1-5" — the form a person would type. */
function compact(values: number[]) {
  const v = [...new Set(values)].sort((a, b) => a - b);
  const out: string[] = [];
  for (let i = 0; i < v.length; ) {
    let j = i;
    while (j + 1 < v.length && v[j + 1] === v[j] + 1) j++;
    out.push(j - i >= 2 ? `${v[i]}-${v[j]}` : v.slice(i, j + 1).join(","));
    i = j + 1;
  }
  return out.join(",");
}

export function toExpr(b: Builder): string {
  switch (b.mode) {
    case "once": {
      // Only ever used to seed Custom when switching modes; it repeats yearly.
      const at = onceMs(b);
      return at === null ? `${b.minute} ${b.hour} * * *` : `${b.minute} ${b.hour} ${new Date(at).getUTCDate()} ${new Date(at).getUTCMonth() + 1} *`;
    }
    case "interval":
      return b.unit === "minutes" ? `*/${b.every} * * * *` : `0 */${b.every} * * *`;
    case "hourly":
      return `${b.minute} * * * *`;
    case "daily":
      return `${b.minute} ${b.hour} * * *`;
    case "weekly":
      return `${b.minute} ${b.hour} * * ${b.weekdays.length ? compact(b.weekdays) : "*"}`;
    case "monthly":
      return `${b.minute} ${b.hour} ${b.monthDay} * *`;
    case "custom":
      return b.custom.trim().replace(/\s+/g, " ");
  }
}

export const EXAMPLES: { expr: string; label: string }[] = [
  { expr: "*/15 * * * *", label: "Every 15 minutes" },
  { expr: "0 9-18 * * 1-5", label: "Hourly in office hours" },
  { expr: "30 1 * * 0", label: "Sundays at 01:30" },
  { expr: "0 6 1,15 * *", label: "1st and 15th at 06:00" },
  { expr: "0 0 1 1,4,7,10 *", label: "Quarter start at midnight" },
];

// ── Zones (fixed offsets) ───────────────────────────────────────────────────

export const ZONES = [
  { id: "Asia/Kathmandu", label: "Kathmandu", offset: 345 },
  { id: "Asia/Kolkata", label: "Kolkata", offset: 330 },
  { id: "Asia/Dubai", label: "Dubai", offset: 240 },
  { id: "UTC", label: "UTC", offset: 0 },
  { id: "Europe/London", label: "London", offset: 60 },
  { id: "America/New_York", label: "New York", offset: -240 },
];

export const zoneById = (id: string) => ZONES.find((z) => z.id === id) ?? ZONES[0];

export const offsetLabel = (mins: number) => {
  const sign = mins < 0 ? "−" : "+";
  const a = Math.abs(mins);
  return `UTC${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
};

// ── Formatting ──────────────────────────────────────────────────────────────

export function fmtRun(ms: number) {
  const d = new Date(ms);
  return `${DAY_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]}`;
}
export const fmtClock = (ms: number) => {
  const d = new Date(ms);
  return clock(d.getUTCHours(), d.getUTCMinutes());
};

export function fmtIn(ms: number) {
  const m = Math.round(Math.abs(ms) / 60000);
  const ago = ms < 0;
  let s: string;
  if (m < 1) s = "now";
  else if (m < 60) s = `${m}m`;
  else if (m < 60 * 24) s = `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`;
  else {
    const days = Math.floor(m / 1440);
    const h = Math.floor((m % 1440) / 60);
    s = `${days}d${h ? ` ${h}h` : ""}`;
  }
  if (s === "now") return s;
  return ago ? `${s} ago` : `in ${s}`;
}

export function fmtDuration(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}
