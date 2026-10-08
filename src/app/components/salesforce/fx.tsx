import * as React from "react";
import { Link } from "react-router";
import { ArrowDown, ArrowUp, ArrowUpRight, Locate, Minus, Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { FrameContext, NUM } from "../sales/bzw";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE · the visual kit — bzw, extended
//
// Sales force is watched as much as it is worked: a day in the field, a month
// against target, a season's budget. So this layer adds what the transaction
// pages never needed — a panel with air in it, a figure you can read from the
// door, small honest charts, and a map as a canvas — drawn with bzw's own
// ink: the neutral ground, hairlines, Inter, and lime as the one accent. Every
// colour is a token; dark and light are the same components.
// ════════════════════════════════════════════════════════════════════════════

/** The chart inks. Lime is the accent on dark; on light paper it is too pale to read, so the leaf green stands in. */
export const FX_VARS = "[--fx-accent:var(--bz-positive)] [.bzw-dark_&]:[--fx-accent:var(--bz-fire)] [--fx-glass:color-mix(in_srgb,var(--bz-surface)_86%,transparent)]";
export type Ink = "accent" | "pos" | "amber" | "red" | "soft" | "teal" | "indigo" | "ochre";
/** accent / amber / red grade a thing; teal, indigo and ochre only tell kinds apart (bzw's identity hues). */
const INK: Record<Ink, string> = { accent: "var(--fx-accent)", pos: "var(--bz-positive)", amber: "var(--bz-amber)", red: "var(--bz-red-mark)", soft: "var(--bz-text-soft)", teal: "var(--bz-route-1)", indigo: "var(--bz-route-2)", ochre: "var(--bz-route-5)" };
export const inkOf = (i: Ink) => INK[i];
/** How good a share is, as an ink: the chart says it without a legend. */
export const inkFor = (pct: number): Ink => (pct >= 70 ? "accent" : pct >= 40 ? "amber" : "red");

/** True from the frame after mount: a chart draws at zero, then grows to its value once. */
function useReady() {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return ready;
}

// ── Panel ───────────────────────────────────────────────────────────────────

export const PANEL = "rounded-[14px] border border-bz-line-soft bg-bz-surface";
export const PANEL_TITLE = "m-0 text-[13px] font-semibold text-bz-text";
const OPEN = "flex size-7 shrink-0 items-center justify-center rounded-bz-md text-bz-text-soft transition-colors hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire";

/** A card with air in it: a title row (icon · title · a right slot · the door to the full place) over its body. */
export function Panel({
  title,
  icon: Icon,
  to,
  right,
  children,
  className,
  flush,
}: {
  title?: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  /** Where the whole of this lives. */
  to?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** The body brings its own padding (a list, a map). */
  flush?: boolean;
}) {
  return (
    <section className={cn(PANEL, "flex min-w-0 flex-col overflow-hidden", className)}>
      {title && (
        <header className="flex min-h-[46px] shrink-0 items-center gap-2 pl-4 pr-2.5">
          {Icon && <Icon size={14} className="shrink-0 text-bz-text-muted" />}
          <h2 className={cn(PANEL_TITLE, "min-w-0 flex-1 truncate")}>{title}</h2>
          {right}
          {to && (
            <Link to={to} className={OPEN} aria-label="Open">
              <ArrowUpRight size={14} />
            </Link>
          )}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", !flush && "px-4 pb-4", !flush && !title && "pt-4")}>{children}</div>
    </section>
  );
}

// ── Figures ─────────────────────────────────────────────────────────────────

export type DeltaOf = { dir: "up" | "down" | "flat"; good: boolean; text: string };

/** now against before, as a direction and whether that direction is good news. */
export function deltaOf(now: number, before: number, word: string, lowerIsBetter = false): DeltaOf | undefined {
  if (!before && !now) return undefined;
  if (!before) return { dir: "up", good: !lowerIsBetter, text: `none ${word}` };
  const pct = Math.round(((now - before) / before) * 100);
  const dir = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  // Past a few hundred per cent the percentage stops meaning anything; say what it was instead.
  return { dir, good: dir === "flat" ? true : (dir === "up") !== lowerIsBetter, text: Math.abs(pct) > 300 ? `${short(before)} ${word.replace(/^vs /, "")}` : `${Math.abs(pct)}% ${word}` };
}

export function Delta({ d }: { d: DeltaOf }) {
  const Icon = d.dir === "up" ? ArrowUp : d.dir === "down" ? ArrowDown : Minus;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] text-bz-text-soft", NUM)}>
      <span className="flex size-3.5 items-center justify-center rounded-bz-pill" style={{ background: d.dir === "flat" ? "var(--bz-line)" : d.good ? "var(--fx-accent)" : "var(--bz-red-mark)", color: "var(--bz-section-b)" }}>
        <Icon size={9} strokeWidth={3} />
      </span>
      {d.text}
    </span>
  );
}

/** One figure you can read from the door: what it is, how much, and which way it is going. The whole card is the door. */
export function Kpi({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  note,
  extra,
  danger,
  to,
  title,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  /** A quiet word before the figure — a currency code. */
  unit?: string;
  delta?: DeltaOf;
  note?: React.ReactNode;
  /** A small picture of the figure, above its trend: a `Spark`, a `TickBar`, faces. */
  extra?: React.ReactNode;
  danger?: boolean;
  /** Where the whole of it lives. Left out, the card is a figure and not a door: no arrow, no hover. */
  to?: string;
  /** How the figure is counted, on hover. */
  title?: string;
}) {
  const body = (
    <>
      <span className="flex items-center gap-2">
        <Icon size={14} className="shrink-0 text-bz-text-muted" />
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-bz-text">{label}</span>
        {to && <ArrowUpRight size={14} className="shrink-0 text-bz-text-soft transition-colors group-hover:text-bz-text" />}
      </span>
      <span className="flex items-end justify-between gap-3">
        <span className={cn("min-w-0 truncate text-[28px] font-semibold leading-none tracking-tight", danger ? "text-bz-red" : "text-bz-text", NUM)}>
          {unit && <span className="mr-1.5 text-[12px] font-medium tracking-normal text-bz-text-soft">{unit}</span>}
          {value}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2">
          {extra}
          {delta ? <Delta d={delta} /> : note ? <span className={cn("whitespace-nowrap text-[11px] text-bz-text-soft", NUM)}>{note}</span> : null}
        </span>
      </span>
    </>
  );
  const box = cn(PANEL, "group flex min-h-[124px] min-w-0 flex-col justify-between p-4");
  if (!to)
    return (
      <div title={title} className={box}>
        {body}
      </div>
    );
  return (
    <Link to={to} title={title} className={cn(box, "transition-colors hover:border-bz-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire")}>
      {body}
    </Link>
  );
}

/** "12.4L", "38K", "950" — a figure short enough to sit at 28px. */
export function short(n: number) {
  const a = Math.abs(n);
  if (a >= 1e7) return `${(n / 1e7).toFixed(a >= 1e8 ? 0 : 1)}Cr`;
  if (a >= 1e5) return `${(n / 1e5).toFixed(a >= 1e6 ? 1 : 2).replace(/\.?0+$/, "")}L`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(Math.round(n));
}

// ── Charts ──────────────────────────────────────────────────────────────────

/** The last few values as a row of small bars; the latest is in full ink. */
export function Spark({ values, ink = "accent", className }: { values: number[]; ink?: Ink; className?: string }) {
  const ready = useReady();
  const max = Math.max(1, ...values);
  return (
    <span className={cn("flex h-7 items-end gap-[3px]", className)} aria-hidden>
      {values.map((v, i) => (
        <span key={i} className="w-[5px] rounded-t-bz-pill transition-[height] duration-500 ease-out" style={{ height: ready ? `${Math.max(v ? 12 : 6, (v / max) * 100)}%` : "6%", background: v ? inkOf(ink) : "var(--bz-line)", opacity: i === values.length - 1 || !v ? 1 : 0.45 }} />
      ))}
    </span>
  );
}

/** A share as a dial of ticks: how far round says how much; its ink says how good. */
export function Gauge({ pct, ink, label, className }: { pct: number; ink?: Ink; label?: React.ReactNode; className?: string }) {
  const N = 26;
  const p = Math.max(0, Math.min(100, pct));
  const lit = Math.round((p / 100) * N);
  const color = inkOf(ink ?? inkFor(p));
  return (
    <span className={cn("relative block w-[92px]", className)}>
      <svg viewBox="0 0 96 54" className="block w-full" aria-hidden>
        {Array.from({ length: N }, (_, i) => {
          const a = Math.PI - (i / (N - 1)) * Math.PI;
          const c = Math.cos(a);
          const s = Math.sin(a);
          return <line key={i} x1={48 + 32 * c} y1={50 - 32 * s} x2={48 + 44 * c} y2={50 - 44 * s} strokeWidth={2.2} strokeLinecap="round" stroke={i < lit ? color : "var(--bz-line)"} />;
        })}
      </svg>
      <span className={cn("absolute inset-x-0 bottom-0 text-center text-[12.5px] font-semibold text-bz-text", NUM)}>{label ?? `${Math.round(p)}%`}</span>
    </span>
  );
}

/** Thin bars on a shared axis, one group per label. The last-but-`current` group is today's and is drawn in full ink. */
export function Bars({ labels, series, current, height = 148, format = short }: { labels: string[]; series: { name: string; ink: Ink; values: number[] }[]; current?: number; height?: number; format?: (n: number) => string }) {
  const ready = useReady();
  const [hover, setHover] = React.useState<number | null>(null);
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step).reverse();
  const lit = hover ?? current;
  return (
    <div>
      <div className="flex gap-3" style={{ height }}>
        <div className={cn("flex w-8 shrink-0 flex-col justify-between text-right text-[10.5px] leading-none text-bz-text-soft", NUM)}>
          {ticks.map((t) => (
            <span key={t}>{t ? format(t) : "0"}</span>
          ))}
        </div>
        <div className="relative flex min-w-0 flex-1 items-end" onMouseLeave={() => setHover(null)}>
          {ticks.map((t, i) => (
            <span key={t} className="absolute inset-x-0 border-t border-dashed border-bz-line-soft" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }} />
          ))}
          {labels.map((l, i) => (
            <div key={l + i} onMouseEnter={() => setHover(i)} className={cn("relative flex h-full min-w-0 flex-1 items-end justify-center gap-[3px] rounded-t-bz-sm transition-colors", hover === i && "bg-bz-paper-warm/50")}>
              {series.map((s) => (
                <span
                  key={s.name}
                  className="w-[5px] max-w-[22%] rounded-t-bz-pill transition-[height,opacity] duration-500 ease-out"
                  style={{ height: ready ? `${((s.values[i] ?? 0) / top) * 100}%` : 0, minHeight: s.values[i] ? 2 : 0, background: inkOf(s.ink), opacity: lit === undefined || lit === i ? 1 : 0.5 }}
                />
              ))}
              {hover === i && (
                <span className={cn("pointer-events-none absolute top-1 z-10 flex flex-col gap-0.5 whitespace-nowrap rounded-[8px] border border-bz-line-soft bg-[var(--fx-glass)] px-2 py-1.5 text-[11px] shadow-[var(--bz-shadow-panel)] backdrop-blur-md", i < labels.length / 2 ? "left-1/2" : "right-1/2", NUM)}>
                  {[...series].reverse().map((s) => (
                    <span key={s.name} className="flex items-center gap-1.5 text-bz-text-muted">
                      <span className="size-1.5 rounded-bz-pill" style={{ background: inkOf(s.ink) }} />
                      {s.name}
                      <span className="ml-auto pl-3 font-semibold text-bz-text">{format(s.values[i] ?? 0)}</span>
                    </span>
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex gap-3">
        <span className="w-8 shrink-0" />
        <div className="flex min-w-0 flex-1">
          {labels.map((l, i) => (
            <span key={l + i} className={cn("min-w-0 flex-1 truncate text-center text-[10.5px]", lit === i ? "font-semibold text-bz-text" : "text-bz-text-soft")}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function niceStep(max: number) {
  const raw = max / 3;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const f = raw / mag;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * mag;
}

/** The names of a chart's inks. */
export function Legend({ items, className }: { items: { name: string; ink: Ink }[]; className?: string }) {
  return (
    <span className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-bz-text-muted", className)}>
      {items.map((x) => (
        <span key={x.name} className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-bz-pill" style={{ background: inkOf(x.ink) }} />
          {x.name}
        </span>
      ))}
    </span>
  );
}

/** Parts of a whole as a ring, with what the ring holds at its centre. */
export function Ring({ parts, size = 132, children }: { parts: { name: string; value: number; ink: Ink }[]; size?: number; children?: React.ReactNode }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const R = 46;
  const C = 2 * Math.PI * R;
  const gap = parts.filter((p) => p.value > 0).length > 1 ? 5 : 0;
  const ready = useReady();
  let at = 0;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 108 108" className="block size-full -rotate-90" aria-hidden>
        <circle cx={54} cy={54} r={R} fill="none" strokeWidth={8} stroke="var(--bz-line-soft)" />
        {total > 0 &&
          parts.map((p) => {
            const len = (p.value / total) * C;
            const seg = <circle key={p.name} cx={54} cy={54} r={R} fill="none" strokeWidth={8} strokeLinecap="round" stroke={inkOf(p.ink)} strokeDasharray={`${ready ? Math.max(0.5, len - gap) : 0.5} ${C}`} strokeDashoffset={-at} className="transition-[stroke-dasharray] duration-700 ease-out" />;
            at += len;
            return p.value > 0 ? seg : null;
          })}
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</span>
    </span>
  );
}

/** A share as a run of ticks — a budget used, a target reached — that reads at a glance down a list. */
export function TickBar({ pct, ink, ticks = 32, className }: { pct: number; ink?: Ink; ticks?: number; className?: string }) {
  const p = Math.max(0, Math.min(100, pct));
  const lit = Math.round((p / 100) * ticks);
  const color = inkOf(ink ?? inkFor(p));
  return (
    <span className={cn("flex h-3 items-stretch gap-[2px]", className)} aria-hidden>
      {Array.from({ length: ticks }, (_, i) => (
        <span key={i} className="min-w-0 flex-1 rounded-[1px]" style={{ background: i < lit ? color : "var(--bz-line-soft)", opacity: i < lit ? 0.35 + 0.65 * ((i + 1) / Math.max(1, lit)) : 1 }} />
      ))}
    </span>
  );
}

/** Levels side by side as stacked ticks: the height is the amount, and the ink deepens as it rises. */
export function Columns({ items, rows = 14, height = 132, format = short }: { items: { name: string; value: number }[]; rows?: number; height?: number; format?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((x) => x.value));
  return (
    <div className="flex items-end gap-3">
      {items.map((x) => {
        const lit = Math.round((x.value / max) * rows);
        return (
          <div key={x.name} className="flex min-w-0 max-w-[64px] flex-1 flex-col items-center gap-1.5" title={`${x.name} · ${format(x.value)}`}>
            <div className="flex w-full max-w-[26px] flex-col-reverse gap-[2px] rounded-bz-md bg-bz-paper-warm/60 p-[3px]" style={{ height }}>
              {Array.from({ length: rows }, (_, i) => (
                <span key={i} className="min-h-0 flex-1 rounded-[2px]" style={{ background: i < lit ? inkOf("accent") : "transparent", opacity: i < lit ? 0.4 + 0.6 * ((i + 1) / rows) : 1 }} />
              ))}
            </div>
            <span className="w-full truncate text-center text-[10.5px] text-bz-text-soft">{x.name}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

/** A set of places or views as pills in a quiet tray — the page's own switch. An option with `to` is a link. */
export function PillTabs<T extends string>({ value, onChange, options, className }: { value: T; onChange?: (v: T) => void; options: { value: T; label: string; count?: number; danger?: boolean; to?: string; title?: string }[]; className?: string }) {
  return (
    <div role="tablist" className={cn("inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-[11px] border border-bz-line-soft bg-bz-surface p-[3px] [scrollbar-width:none]", className)}>
      {options.map((o) => {
        const on = o.value === value;
        const cls = cn(
          "inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-[8px] px-3 text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:outline-bz-fire",
          on ? "bg-bz-paper-warm font-semibold text-bz-text" : "font-medium text-bz-text-muted hover:text-bz-text",
        );
        const body = (
          <>
            {o.label}
            {!!o.count && <span className={cn("min-w-4 rounded-bz-pill px-1 text-center text-[10px] font-semibold leading-4", NUM, o.danger ? "bg-bz-red-soft text-bz-red" : "bg-bz-line-soft text-bz-text-muted")}>{o.count}</span>}
          </>
        );
        return o.to ? (
          <Link key={o.value} to={o.to} role="tab" aria-selected={on} title={o.title} className={cls}>
            {body}
          </Link>
        ) : (
          <button key={o.value} type="button" role="tab" aria-selected={on} title={o.title} onClick={() => onChange?.(o.value)} className={cls}>
            {body}
          </button>
        );
      })}
    </div>
  );
}

/** A quiet action in a page head: a bordered chip with an icon. */
export const HEAD_BTN = "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[12.5px] font-medium text-bz-text transition-colors hover:border-bz-line hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire";

export type PillTone = "good" | "warn" | "bad" | "idle";
const PILL: Record<PillTone, string> = {
  good: "border-[color-mix(in_srgb,var(--fx-accent)_32%,transparent)] bg-[color-mix(in_srgb,var(--fx-accent)_10%,transparent)] text-bz-pos-deep",
  warn: "border-[color-mix(in_srgb,var(--bz-amber)_36%,transparent)] bg-[color-mix(in_srgb,var(--bz-amber)_10%,transparent)] text-bz-amber-ink",
  bad: "border-[color-mix(in_srgb,var(--bz-red-mark)_36%,transparent)] bg-[color-mix(in_srgb,var(--bz-red-mark)_10%,transparent)] text-bz-red",
  idle: "border-bz-line-soft bg-bz-paper-warm/50 text-bz-text-muted",
};

/** A state, as a small tinted pill with its own glyph. */
export function StatusPill({ tone, icon: Icon, children, title }: { tone: PillTone; icon?: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[7px] border px-2 text-[11.5px] font-medium", PILL[tone])}>
      {Icon && <Icon size={12} className="shrink-0" />}
      {children}
    </span>
  );
}

// ── Map ─────────────────────────────────────────────────────────────────────

export type MapPoint = { key: string; lat: number; lng: number; node: React.ReactNode; z?: number };
type View = { lat: number; lng: number; zoom: number };

const TILE = 256;
const worldX = (lng: number, z: number) => ((lng + 180) / 360) * TILE * 2 ** z;
const worldY = (lat: number, z: number) => {
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * 2 ** z;
};
const lngAt = (x: number, z: number) => (x / (TILE * 2 ** z)) * 360 - 180;
const latAt = (y: number, z: number) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / (TILE * 2 ** z)))) * 180) / Math.PI;

/** Nepal, when there is nothing to show yet. */
const HOME: View = { lat: 28.1, lng: 84.1, zoom: 7 };

/** The room floating panels take on each side of a map, in px. The focus is framed in what they leave free. */
export type MapInset = { top?: number; right?: number; bottom?: number; left?: number };

function fit(points: { lat: number; lng: number }[], w: number, h: number, pad: number, inset?: MapInset): View {
  if (!points.length || !w || !h) return HOME;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const box = { n: Math.max(...lats), s: Math.min(...lats), e: Math.max(...lngs), w: Math.min(...lngs) };
  if (inset) {
    // Fit the box into the part of the canvas no panel covers, then shift the centre so it sits in the middle of that part.
    const i = { top: inset.top ?? 0, right: inset.right ?? 0, bottom: inset.bottom ?? 0, left: inset.left ?? 0 };
    const fw = Math.max(48, w - i.left - i.right - pad * 2);
    const fh = Math.max(48, h - i.top - i.bottom - pad * 2);
    let z = 15;
    for (; z > 3; z--) {
      if (worldX(box.e, z) - worldX(box.w, z) <= fw && worldY(box.s, z) - worldY(box.n, z) <= fh) break;
    }
    return { lat: latAt((worldY(box.n, z) + worldY(box.s, z)) / 2 + (i.bottom - i.top) / 2, z), lng: lngAt((worldX(box.e, z) + worldX(box.w, z)) / 2 + (i.right - i.left) / 2, z), zoom: z };
  }
  let zoom = 15;
  for (; zoom > 3; zoom--) {
    if (worldX(box.e, zoom) - worldX(box.w, zoom) <= w - pad * 2 && worldY(box.s, zoom) - worldY(box.n, zoom) <= h - pad * 2) break;
  }
  return { lat: latAt((worldY(box.n, zoom) + worldY(box.s, zoom)) / 2, zoom), lng: (box.e + box.w) / 2, zoom };
}

/**
 * A map as a canvas: real tiles under the page's own markers, and room for panels to float over it (`children`).
 * `focus` is what to bring into view — change it to re-frame (the picked rep, a route); `pad` keeps it clear of
 * floating panels. `path` joins points with an arc, in order; a dashed arc is a leg not yet travelled.
 * `inset` is the room the floating panels take on each side, so the focus is framed in what they leave free;
 * `controls` moves the zoom buttons out from under a panel; `onGroundClick` is a click on the map itself, not a drag.
 */
export function MapCanvas({
  points,
  focus,
  focusKey,
  path,
  pad = 72,
  inset,
  controls,
  onGroundClick,
  className,
  children,
}: {
  points: MapPoint[];
  /** The places to frame; defaults to every point. */
  focus?: { lat: number; lng: number }[];
  /** Re-frame when this changes. */
  focusKey?: string;
  path?: { lat: number; lng: number; dashed?: boolean }[];
  pad?: number;
  /** What the floating panels cover, per side: the focus is framed in the rest. */
  inset?: MapInset;
  /** Where the zoom buttons sit (position classes); bottom right when left out. */
  controls?: string;
  /** A click on the map itself: the reader let go of whatever was picked. */
  onGroundClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const { dark } = React.useContext(FrameContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const [view, setView] = React.useState<View>(HOME);
  const drag = React.useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const frame = React.useCallback(() => setView(fit(focus?.length ? focus : points, size.w, size.h, pad, inset)), [focus, points, size.w, size.h, pad, inset]);
  // Frame once the canvas has a size, and again whenever the reader asks for something else.
  const framed = React.useRef("");
  React.useEffect(() => {
    const key = `${focusKey ?? ""}|${size.w > 0}|${points.length > 0}`;
    if (!size.w || framed.current === key) return;
    framed.current = key;
    frame();
  }, [focusKey, size.w, points.length, frame]);

  const z = view.zoom;
  const left = worldX(view.lng, z) - size.w / 2;
  const top = worldY(view.lat, z) - size.h / 2;
  const tiles: { x: number; y: number }[] = [];
  if (size.w) {
    const n = 2 ** z;
    for (let x = Math.floor(left / TILE); x <= Math.floor((left + size.w) / TILE); x++) for (let y = Math.max(0, Math.floor(top / TILE)); y <= Math.min(n - 1, Math.floor((top + size.h) / TILE)); y++) tiles.push({ x, y });
  }
  const at = (p: { lat: number; lng: number }) => ({ x: worldX(p.lng, z) - left, y: worldY(p.lat, z) - top });
  const zoomBy = (d: number) => setView((v) => ({ ...v, zoom: Math.max(3, Math.min(16, v.zoom + d)) }));
  // A canvas map — land, water and roads in greys, drawn to sit under data — with the place names as a second,
  // fainter layer, so the page's own markers are what the eye finds.
  // One tile set serves both themes — the dark canvas, inverted for light — because the light set has holes in
  // its coverage (whole tiles come back blank).
  const layer = (name: string, x: number, y: number) => `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_${name}/MapServer/tile/${z}/${y}/${x}`;
  const tone = dark ? "brightness(0.6) contrast(1.22)" : "invert(1) hue-rotate(180deg) brightness(1.24) contrast(0.8)";

  const legs = (path ?? []).slice(1).map((b, i) => {
    const p = at(path![i]);
    const q = at(b);
    const lift = Math.min(90, Math.hypot(q.x - p.x, q.y - p.y) * 0.22);
    return { d: `M${p.x},${p.y} Q${(p.x + q.x) / 2},${(p.y + q.y) / 2 - lift} ${q.x},${q.y}`, dashed: b.dashed, key: i };
  });

  return (
    <div
      ref={ref}
      className={cn("relative touch-none select-none overflow-hidden bg-bz-map-land", className)}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-map-ui]")) return;
        drag.current = { x: e.clientX, y: e.clientY, cx: worldX(view.lng, z), cy: worldY(view.lat, z) };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (d) setView({ zoom: z, lng: lngAt(d.cx - (e.clientX - d.x), z), lat: latAt(d.cy - (e.clientY - d.y), z) });
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (d && onGroundClick && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) onGroundClick();
      }}
      onPointerCancel={() => (drag.current = null)}
    >
      <div className="absolute inset-0 cursor-grab active:cursor-grabbing" aria-hidden>
        {tiles.map((t) => {
          const n = 2 ** z;
          const x = ((t.x % n) + n) % n;
          const box = { left: t.x * TILE - left, top: t.y * TILE - top, width: TILE, height: TILE };
          return (
            <React.Fragment key={`${dark}/${z}/${t.x}/${t.y}`}>
              <img src={layer("Base", x, t.y)} alt="" draggable={false} className="absolute max-w-none" style={{ ...box, filter: tone }} />
              <img src={layer("Reference", x, t.y)} alt="" draggable={false} className="absolute max-w-none opacity-60" style={{ ...box, filter: dark ? undefined : "invert(1)" }} />
            </React.Fragment>
          );
        })}
      </div>
      {legs.length > 0 && (
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          {legs.map((l) => (
            <path key={l.key} d={l.d} fill="none" stroke={l.dashed ? "var(--bz-text-muted)" : "var(--fx-accent)"} strokeWidth={1.5} strokeDasharray={l.dashed ? "4 5" : undefined} strokeLinecap="round" />
          ))}
        </svg>
      )}
      {size.w > 0 &&
        points.map((p) => {
          const q = at(p);
          if (q.x < -60 || q.y < -60 || q.x > size.w + 60 || q.y > size.h + 60) return null;
          return (
            <div key={p.key} data-map-ui className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: q.x, top: q.y, zIndex: p.z ?? 1 }}>
              {p.node}
            </div>
          );
        })}
      <div data-map-ui className={cn("absolute z-20 flex items-center gap-1 rounded-[10px] border border-bz-line-soft bg-[var(--fx-glass)] p-1 backdrop-blur-md", controls ?? "bottom-3 right-3")}>
        {(
          [
            ["Zoom in", Plus, () => zoomBy(1)],
            ["Zoom out", Minus, () => zoomBy(-1)],
            ["Fit", Locate, frame],
          ] as const
        ).map(([label, Icon, run]) => (
          <button key={label} type="button" title={label} aria-label={label} onClick={run} className="flex size-7 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <Icon size={14} />
          </button>
        ))}
      </div>
      <span data-map-ui className="absolute bottom-1 left-2 z-10 text-[9.5px] text-bz-text-soft">
        © Esri · OpenStreetMap
      </span>
      {children}
    </div>
  );
}

/** A panel that floats over a map: glass, so the ground shows through. Give it its position. */
export function Float({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div data-map-ui className={cn("absolute z-30 overflow-hidden rounded-[14px] border border-bz-line-soft bg-[var(--fx-glass)] shadow-[var(--bz-shadow-panel)] backdrop-blur-md", className)}>
      {children}
    </div>
  );
}

/** A place's name, pinned to the map. `on` is the one in focus. */
export function MapLabel({ children, on }: { children: React.ReactNode; on?: boolean }) {
  return (
    <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-[8px] border px-2 text-[11px] font-medium shadow-[var(--bz-shadow-panel)]", on ? "border-[color-mix(in_srgb,var(--fx-accent)_50%,transparent)] bg-[color-mix(in_srgb,var(--fx-accent)_22%,var(--bz-surface))] text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text")}>
      {children}
    </span>
  );
}

/** A spot on the map: a dot with a soft halo. Hollow = not yet (a shop still to visit). */
export function MapDot({ ink = "accent", hollow, size = 10, title }: { ink?: Ink; hollow?: boolean; size?: number; title?: string }) {
  return (
    <span title={title} className="flex items-center justify-center rounded-bz-pill" style={{ width: size + 10, height: size + 10, background: `color-mix(in srgb, ${inkOf(ink)} 18%, transparent)` }}>
      <span className="rounded-bz-pill" style={{ width: size, height: size, background: hollow ? "var(--bz-surface)" : inkOf(ink), boxShadow: hollow ? `inset 0 0 0 2px ${inkOf(ink)}` : "0 0 0 2px var(--bz-surface)" }} />
    </span>
  );
}
