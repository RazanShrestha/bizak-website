import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowUpRight, CalendarDays, MessageSquare, Plus, ReceiptText, Search, Smartphone, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Dialog, GHOST, NUM } from "../sales/bzw";
import { useKeys, useMedia } from "../sales/orders";
import { useStore } from "../sales/store";
import { SF_NOW, SF_TODAY } from "./data";
import type { HubOrder, LocationPing, Visit } from "./data";
import { customerById } from "./engine";
import { DAY_STATUS, orderById, orderTotal, outcomeOf, repDay, shortDay, strikeRate, withOrder } from "./field-data";
import type { DayStatus, OutletStatus, RepDay, Stop } from "./field-data";
import { useFieldStores } from "./field-kit";
import { Float, HEAD_BTN, MapCanvas, MapDot, MapLabel, PANEL, PANEL_TITLE, StatusPill, inkOf, short } from "./fx";
import type { Ink, MapInset, MapPoint, PillTone } from "./fx";
import { PING_KIND, distanceMetres, fenceState, fenceText, fmtDistance, lastPing, needsAudit, pingsOf, placeOf, placeText } from "./geo";
import { MapLink } from "./geo-kit";
import { STATUS_META, forShopId } from "./orders-parts";
import { openQuickAdd } from "./quickadd";
import { routeById, routeName } from "./routes";
import { SfActivity, SfNoteFoot, SfShell, Who, sfPath } from "./sf";
import { ledgerStore, notesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// FIELD · LIVE — the field now, on a map
//
// The map is the page. Each rep stands where their phone last reported, in a
// ring that says how their day is going; the reps are listed on a panel that
// floats at the left, in the order they need a look; a card at the bottom right
// reads the day — the whole team's, or the picked rep's: four figures, the day
// on a time axis, the stops under the route each is on. Everything is counted
// from the plan, the visits and the readings the rep app took (`repDay`).
// Below 1024px nothing floats: map, card and list stack in a scrolling page.
// ════════════════════════════════════════════════════════════════════════════

const REP_APP = "/design/rep";

/** Who needs a look first. */
const DAY_ORDER: Record<DayStatus, number> = { "not-started": 0, "at-outlet": 1, "on-beat": 2, done: 3, "no-beat": 4 };
/** A day's state as a fill or an outline in one of three inks — lime is moving, amber is waiting, grey is over. */
const STATE: Record<DayStatus, { ink: Ink; hollow?: boolean; tone: PillTone }> = {
  "not-started": { ink: "amber", tone: "warn" },
  "at-outlet": { ink: "accent", tone: "good" },
  "on-beat": { ink: "accent", hollow: true, tone: "good" },
  done: { ink: "soft", tone: "idle" },
  "no-beat": { ink: "soft", hollow: true, tone: "idle" },
};

const WASH = "bg-[color-mix(in_srgb,var(--fx-accent)_12%,transparent)]";
const RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire";
const ICON = cn("flex size-7 shrink-0 items-center justify-center rounded-bz-md text-bz-text-soft transition-colors hover:bg-bz-paper-warm hover:text-bz-text", RING);
const FOOT_BTN = cn(HEAD_BTN, "h-8 px-2.5 text-[12px]");
/** Four figures in a row (2 x 2 on a phone); the money column is the widest. */
const FIGS = "grid shrink-0 grid-cols-2 gap-x-3 gap-y-4 px-4 pb-4 sm:grid-cols-[1fr_1fr_1.3fr_0.9fr]";
const QUIET = "text-[11.5px] font-medium text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline";

type Spot = { lat: number; lng: number };

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const mins = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const clock = (p: LocationPing) => p.at.slice(11, 16);

// ── Freshness ───────────────────────────────────────────────────────────────

/** Under this many minutes a reading is "Live"; past `STALE` its pin fades. */
const LIVE = 5;
const STALE = 30;
/** Minutes since a reading taken today (another tab's clock can run a minute ahead: never negative). */
const ageOf = (p: LocationPing) => Math.max(0, mins(SF_NOW) - mins(clock(p)));
function freshOf(p: LocationPing) {
  const age = ageOf(p);
  return age < LIVE ? "Live" : age < 60 ? `${age} min ago` : clock(p);
}

/** Re-render every 30 s: `SF_NOW` is a live binding, so "now", "12 min ago" and "Live" move by themselves. */
function useTick(ms = 30_000) {
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    const t = window.setInterval(tick, ms);
    return () => window.clearInterval(t);
  }, [ms]);
}

/** An element's size, from the moment it mounts. */
function useSize<T extends HTMLElement>() {
  const [el, setEl] = React.useState<T | null>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    if (!el) return;
    const read = () => setSize((s) => (s.w === el.offsetWidth && s.h === el.offsetHeight ? s : { w: el.offsetWidth, h: el.offsetHeight }));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, size] as const;
}

// ── A rep's day, in words ───────────────────────────────────────────────────

/** The one sentence under a rep's name. */
function sentenceOf(d: RepDay, seen: LocationPing | undefined): React.ReactNode {
  if (d.current) return `At ${customerById(d.current.customerId)?.name ?? "a removed customer"} · since ${d.current.checkIn ?? "—"}`;
  if (d.status === "not-started")
    return (
      <>
        <span className="text-bz-amber-ink">Not started</span> · {d.planned} to visit
      </>
    );
  if (d.status === "no-beat") return "No route today";
  if (d.status === "done") return `Beat done · ${d.visited} of ${d.planned}`;
  const count = d.planned ? `${d.visited} of ${plural(d.planned, "visit")}` : plural(d.visits.length, "unplanned visit");
  return `${count} · ${seen ? `last seen ${clock(seen)}` : d.lastCheckIn ? `last check-in ${d.lastCheckIn}` : "no location yet"}`;
}

type StopGroup = { routeId: string | null; stops: Stop[]; done: number };
/**
 * The day's stops under the route each is on, routes in the order they are run; visits off today's routes come last.
 * Inside a route: the stops in the order they happened, then the ones skipped unseen, then what is still to visit, in
 * route order.
 */
function byRoute(d: RepDay): StopGroup[] {
  const at = (s: Stop) => s.visit?.checkIn ?? "";
  const groups: StopGroup[] = [];
  for (const s of d.stops) {
    const routeId = s.routeId ?? null;
    const g = groups.find((x) => x.routeId === routeId);
    if (g) g.stops.push(s);
    else groups.push({ routeId, stops: [s], done: 0 });
  }
  return [...groups.filter((g) => g.routeId), ...groups.filter((g) => !g.routeId)].map((g) => ({
    routeId: g.routeId,
    stops: [...g.stops.filter((s) => at(s)).sort((a, b) => at(a).localeCompare(at(b))), ...g.stops.filter((s) => s.visit && !at(s)), ...g.stops.filter((s) => !s.visit)],
    done: g.stops.filter((s) => s.status === "done").length,
  }));
}

/** The day as a line on the map: through today's visits in time order, on to where the rep is now, then — dashed — the stops still to visit, in route order. */
function routeOf(d: RepDay, seen: LocationPing | undefined): { lat: number; lng: number; dashed?: boolean }[] {
  const shop = (id: string): Spot | null => customerById(id)?.location ?? null;
  const fix = (v: Visit): Spot | null => (v.geofence?.lat != null && v.geofence.lng != null ? { lat: v.geofence.lat, lng: v.geofence.lng } : null);
  const calls = d.visits.filter((v) => v.checkIn).sort((a, b) => a.checkIn!.localeCompare(b.checkIn!));
  const path: { lat: number; lng: number; dashed?: boolean }[] = [];
  for (const v of calls) {
    const p = shop(v.customerId) ?? fix(v);
    if (p) path.push({ lat: p.lat, lng: p.lng });
  }
  const last = calls[calls.length - 1];
  const from: Spot | null = path[path.length - 1] ?? null;
  // The last reading is a leg of its own only when it was taken after the last visit began, away from that shop.
  if (seen && !d.current && (!last || clock(seen) >= (last.checkOut ?? last.checkIn!)) && (!from || distanceMetres(seen, from) > 60)) path.push({ lat: seen.lat, lng: seen.lng });
  // `d.stops` is in route order (routes as planned for the day, then each route's visit order): the plan, not the nearest shop, says who is next.
  for (const s of d.stops) {
    const p = s.status === "to-visit" ? shop(s.customerId) : null;
    if (p) path.push({ lat: p.lat, lng: p.lng, dashed: true });
  }
  return path;
}

/** How wide and tall a set of places is on the map's projection (world px at zoom 0), never quite zero. */
function spanOf(places: Spot[]) {
  if (!places.length) return null;
  const y = (lat: number) => {
    const sin = Math.sin((lat * Math.PI) / 180);
    return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 256;
  };
  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);
  return { w: Math.max(1e-7, ((Math.max(...lngs) - Math.min(...lngs)) / 360) * 256), h: Math.max(1e-7, y(Math.min(...lats)) - y(Math.max(...lats))) };
}

// ── Marks ───────────────────────────────────────────────────────────────────

/** One visit, the same on the time axis and in the list: lime = an order, grey = none, a lime ring = there now, amber = skipped, hollow = to come. */
function markStyle(status: OutletStatus, order: boolean): React.CSSProperties {
  if (status === "to-visit") return { background: "var(--bz-surface)", boxShadow: "inset 0 0 0 1.5px var(--bz-text-soft)" };
  if (status === "in-progress") return { background: "var(--bz-surface)", boxShadow: `inset 0 0 0 2px ${inkOf("accent")}` };
  return { background: inkOf(status === "skipped" ? "amber" : order ? "accent" : "soft") };
}

/** The small state dot on a rep's avatar. */
function StateDot({ status }: { status: DayStatus }) {
  const st = STATE[status];
  return (
    <span
      title={DAY_STATUS[status].label}
      className="absolute -bottom-0.5 -right-0.5 size-[11px] rounded-bz-pill"
      style={{ background: st.hollow ? "var(--bz-surface)" : inkOf(st.ink), boxShadow: `${st.hollow ? `inset 0 0 0 2px ${inkOf(st.ink)}, ` : ""}0 0 0 2px var(--bz-surface)` }}
    />
  );
}

/** A rep on the map: the avatar sits on the reading itself, in a ring of the day's ink; the name and how fresh the reading is hang under it. */
function RepPin({ d, seen, picked, dim, onPick }: { d: RepDay; seen: LocationPing; picked: boolean; dim: boolean; onPick: () => void }) {
  const live = ageOf(seen) < LIVE;
  const here = d.current ? customerById(d.current.customerId)?.name : null;
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={picked}
      title={`${d.rep.name} · ${here ? `at ${here}` : DAY_STATUS[d.status].label} · seen ${clock(seen)} · ± ${seen.accuracy} m`}
      className={cn("relative block rounded-bz-pill transition-opacity", RING, !picked && (dim || ageOf(seen) > STALE) && "opacity-50 hover:opacity-100")}
    >
      {live && <span className="absolute inset-0 animate-ping rounded-bz-pill motion-reduce:hidden" style={{ background: inkOf("accent"), opacity: 0.4 }} />}
      <span className="relative block rounded-bz-pill bg-bz-surface p-[2px]" style={{ boxShadow: `0 0 0 2px ${inkOf(STATE[d.status].ink)}` }}>
        <Who name={d.rep.name} size={picked ? 32 : 28} />
      </span>
      <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2">
        <MapLabel on={picked}>
          {d.rep.name.split(" ")[0]}
          <span className={cn("ml-1.5 text-[10px] font-normal", live ? "text-bz-pos-deep" : "text-bz-text-soft", NUM)}>{freshOf(seen)}</span>
        </MapLabel>
      </span>
    </button>
  );
}

// ── The page ────────────────────────────────────────────────────────────────

export function LivePage() {
  const { repId } = useParams();
  const navigate = useNavigate();
  const s = useFieldStores();
  // An approved order is valued by its invoice, so the figures move when one is billed.
  useStore(ledgerStore);
  const notes = useStore(notesStore);
  useTick();
  const floating = useMedia("(min-width: 1024px)");
  const roomy = useMedia("(min-width: 1280px)");
  const [q, setQ] = React.useState("");
  const [log, setLog] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [boxRef, box] = useSize<HTMLDivElement>();
  const [cardRef, card] = useSize<HTMLDivElement>();

  const days = s.reps.map((r) => repDay(r)).sort((a, b) => DAY_ORDER[a.status] - DAY_ORDER[b.status] || a.rep.name.localeCompare(b.rep.name));
  const seenOf = new Map(days.map((d) => [d.rep.id, lastPing(d.rep.id, SF_TODAY)] as const));
  const open = days.find((d) => d.rep.id === repId) ?? null;
  const word = q.trim().toLowerCase();
  const shown = word ? days.filter((d) => d.rep.name.toLowerCase().includes(word)) : days;

  const go = (id: string | null) => navigate(sfPath(id ? `today/${id}` : "today"));
  const pick = (id: string) => go(open?.rep.id === id ? null : id);
  const step = (by: 1 | -1) => {
    const list = shown.length ? shown : days;
    if (!list.length) return;
    const i = open ? list.indexOf(open) : -1;
    go(list[i < 0 ? (by === 1 ? 0 : list.length - 1) : (i + by + list.length) % list.length].rep.id);
  };
  useKeys(
    {
      j: () => step(1),
      k: () => step(-1),
      "/": (e) => {
        e.preventDefault();
        searchRef.current?.focus();
      },
      escape: () => {
        // Esc gives up the nearest thing first: the search being typed, then the pick.
        if (document.activeElement === searchRef.current) {
          if (q) setQ("");
          else searchRef.current?.blur();
        } else if (open) go(null);
      },
    },
    !log,
  );

  // The picked row follows the pick when it came from a pin or the keyboard.
  const rowRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (floating) rowRef.current?.scrollIntoView({ block: "nearest" });
  }, [open?.rep.id, floating]);

  // ── The team's day ──
  const visitsToday = days.flatMap((d) => d.visits);
  const out = days.filter((d) => d.visits.length > 0).length;
  const planned = days.reduce((n, d) => n + d.planned, 0);
  const visited = days.reduce((n, d) => n + d.visited, 0);
  const value = days.reduce((n, d) => n + d.orderValue, 0);
  const orderCount = days.reduce((n, d) => n + d.orders.length, 0);
  const strike = strikeRate(visitsToday);
  const finished = visitsToday.filter((v) => v.state === "done").length;
  const notStarted = days.filter((d) => d.status === "not-started");
  const idle = !visitsToday.length && !planned;

  // ── The map ──
  const points: MapPoint[] = [];
  const focus: Spot[] = [];
  const drawn = new Set<string>();
  for (const d of open ? [open] : days) {
    for (const stop of d.stops) {
      const c = customerById(stop.customerId);
      if (!c?.location || drawn.has(c.id)) continue;
      drawn.add(c.id);
      const v = stop.visit;
      const here = !!open && open.current?.customerId === c.id;
      const ink: Ink = stop.status === "skipped" ? "amber" : stop.status === "in-progress" || v?.orderId ? "accent" : "soft";
      const title = `${c.name} · ${v ? outcomeOf(v) : "To visit"}`;
      const dot = <MapDot ink={ink} hollow={stop.status === "to-visit" || stop.status === "skipped"} size={open ? 10 : 8} title={open ? title : `${title} · ${d.rep.name}`} />;
      points.push({
        key: `c:${c.id}`,
        lat: c.location.lat,
        lng: c.location.lng,
        z: here ? 4 : 2,
        node: open ? (
          <Link to={sfPath(v ? `visits/${v.id}` : `customers/${c.id}`)} aria-label={title} className={cn("relative block rounded-bz-pill", RING)}>
            {dot}
            {here && (
              <span className="absolute bottom-full left-1/2 mb-4 -translate-x-1/2">
                <MapLabel on>{c.name}</MapLabel>
              </span>
            )}
          </Link>
        ) : (
          <button type="button" onClick={() => pick(d.rep.id)} aria-label={`${title} · ${d.rep.name}`} className={cn("block rounded-bz-pill", RING)}>
            {dot}
          </button>
        ),
      });
      focus.push(c.location);
    }
  }
  for (const d of days) {
    const seen = seenOf.get(d.rep.id);
    if (!seen) continue;
    const picked = open === d;
    points.push({ key: `r:${d.rep.id}`, lat: seen.lat, lng: seen.lng, z: picked ? 8 : 5, node: <RepPin d={d} seen={seen} picked={picked} dim={!!open && !picked} onPick={() => pick(d.rep.id)} /> });
    if (!open || picked) focus.push(seen);
  }
  // Nobody is out and nothing is planned: show where the shops are, so the map is not an empty country.
  if (!points.length) {
    for (const c of s.customers) {
      if (!c.location) continue;
      points.push({ key: `c:${c.id}`, lat: c.location.lat, lng: c.location.lng, node: <MapDot ink="soft" size={8} title={c.name} /> });
      focus.push(c.location);
    }
  }
  const path = open ? routeOf(open, seenOf.get(open.rep.id)) : undefined;

  // What the floating panels cover. Two parts of the map stay free — the column between the panels, and the band
  // above the card — and the focus is framed in the one that shows it larger (the column, unless the band is
  // clearly better: it does not move when the card grows).
  const PAD = floating ? 52 : 44;
  const L = 24 + 320 + 12;
  const R = 24 + (roomy ? 460 : 400) + 12;
  const hasCard = days.length > 0;
  const under = Math.ceil((card.h + 28) / 40) * 40;
  const span = spanOf(focus.length ? focus : points);
  const room = (w: number, h: number) => {
    const rw = Math.max(0, w - PAD * 2);
    const rh = Math.max(0, h - PAD * 2);
    return span ? Math.min(rw / span.w, rh / span.h) : rw * rh;
  };
  const band = hasCard && box.w > 0 && room(box.w - L - 24, box.h - under) > room(box.w - L - R, box.h) * 1.15;
  const below = band ? under : 0;
  const inset = React.useMemo<MapInset | undefined>(() => (!floating ? undefined : !hasCard ? { left: L } : below ? { left: L, right: 24, bottom: below } : { left: L, right: R }), [floating, hasCard, below, L, R]);

  const map = (className: string, children?: React.ReactNode) => (
    <MapCanvas
      points={points}
      focus={focus.length ? focus : undefined}
      focusKey={`${open?.rep.id ?? "all"}|${focus.length > 0}|${floating ? `${below}|${roomy}` : "stacked"}`}
      path={path}
      pad={PAD}
      inset={inset}
      controls={floating ? "right-4 top-3 md:right-6" : undefined}
      onGroundClick={open ? () => go(null) : undefined}
      className={className}
    >
      {points.length === 0 && (
        <Float className={cn("top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 py-2 pl-4 pr-2", floating ? "left-[calc(50%+90px)]" : "left-1/2")}>
          <span className="whitespace-nowrap text-[13px] text-bz-text">No locations yet.</span>
          <Link to={sfPath("customers")} className={FOOT_BTN}>
            Customers
          </Link>
        </Float>
      )}
      {children}
    </MapCanvas>
  );

  const reps = (
    <Shell
      floating={floating}
      className="bottom-4 left-4 top-3 w-[320px] md:left-6"
      title="Reps"
      right={days.length > 0 && <span className={cn("mr-1.5 text-[11px] text-bz-text-soft", NUM)}>{`${out} of ${days.length} out`}</span>}
    >
      {days.length === 0 ? (
        <div className="px-4 pb-4">
          <p className="m-0 mb-3 text-[13px] text-bz-text-muted">No reps yet.</p>
          <button type="button" className={BTN} onClick={() => openQuickAdd("rep")}>
            <Plus size={13} /> New rep
          </button>
        </div>
      ) : (
        <>
          <label className="relative mx-3 mb-2 block shrink-0">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-soft" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reps"
              aria-label="Search reps"
              className="block h-9 w-full rounded-[10px] border border-bz-line-soft bg-bz-surface pl-9 pr-3 text-[13px] text-bz-text outline-none transition-colors placeholder:text-bz-text-soft hover:border-bz-line focus:border-bz-text-muted"
            />
          </label>
          <ul className={cn("m-0 list-none px-1.5 pb-2", floating && "min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]")}>
            {shown.length === 0 && <li className="px-2.5 py-2 text-[12px] text-bz-text-soft">No rep by that name.</li>}
            {shown.map((d) => {
              const picked = open === d;
              return (
                <li key={d.rep.id}>
                  <button
                    ref={picked ? rowRef : undefined}
                    type="button"
                    onClick={() => pick(d.rep.id)}
                    aria-pressed={picked}
                    className={cn("flex w-full min-w-0 items-center gap-3 rounded-[10px] px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire", picked ? WASH : "hover:bg-bz-paper-warm")}
                  >
                    <span className="relative shrink-0">
                      <Who name={d.rep.name} size={32} />
                      <StateDot status={d.status} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-bz-text">{d.rep.name}</span>
                      <span className={cn("block truncate text-[11.5px] text-bz-text-soft", NUM)}>{sentenceOf(d, seenOf.get(d.rep.id))}</span>
                    </span>
                    <span className={cn("shrink-0 text-[13px]", d.orders.length ? "font-semibold text-bz-text" : "text-bz-text-soft", NUM)} title={d.orders.length ? `${plural(d.orders.length, "order")} today` : "No order yet today"}>
                      {d.orders.length ? short(d.orderValue) : "—"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Shell>
  );

  const cardAt = cn("bottom-4 right-4 max-h-[calc(100%-72px)] md:right-6", roomy ? "w-[460px]" : "w-[400px]");
  const day = !hasCard ? null : open ? (
    <Shell
      floating={floating}
      innerRef={cardRef}
      className={cardAt}
      lead={<Who name={open.rep.name} size={22} />}
      title={`${open.rep.name} today`}
      right={
        <>
          <StatusPill tone={STATE[open.status].tone}>{DAY_STATUS[open.status].label}</StatusPill>
          <Link to={sfPath(`team/${open.rep.id}`)} className={ICON} aria-label="Open rep" title="Open rep">
            <ArrowUpRight size={14} />
          </Link>
          <button type="button" onClick={() => go(null)} className={ICON} aria-label="Close" title="Back to the team (Esc)">
            <X size={14} />
          </button>
        </>
      }
    >
      <RepDayBody d={open} seen={seenOf.get(open.rep.id)} teamStrike={strike} floating={floating} roomy={roomy} noteCount={[open.rep.id, ...open.visits.map((v) => v.id)].reduce((n, id) => n + (notes[id]?.length ?? 0), 0)} onLog={() => setLog(true)} />
    </Shell>
  ) : (
    <Shell
      floating={floating}
      innerRef={cardRef}
      className={cardAt}
      title="The team today"
      right={
        <Link to={sfPath("team")} className={ICON} aria-label="Open reps" title="Open reps">
          <ArrowUpRight size={14} />
        </Link>
      }
    >
      <div className={FIGS}>
        <Fig
          label="In the field"
          value={out}
          of={days.length}
          title="Reps with a visit today"
          sub={
            notStarted.length > 0 ? (
              <button type="button" onClick={() => go(notStarted[0].rep.id)} className="text-bz-amber-ink underline-offset-2 hover:underline" title={`Have a route today, no visit yet: ${notStarted.map((d) => d.rep.name).join(", ")}`}>
                {notStarted.length} not started
              </button>
            ) : planned ? (
              "all started"
            ) : (
              "no routes today"
            )
          }
        />
        <Fig label="Visits" value={visited} of={planned} title="Outlets visited, on today's routes" sub={planned > visited ? `${planned - visited} to go` : planned ? "all visited" : "none planned"} />
        <Fig
          label="Orders"
          unit="NPR"
          value={short(value)}
          title="Orders reps took today"
          sub={
            orderCount ? (
              <Link to={sfPath("visits")} className="underline-offset-2 hover:underline">
                {plural(orderCount, "order")}
              </Link>
            ) : (
              "none yet"
            )
          }
        />
        <Fig label="Strike rate" value={strike === null ? "—" : `${strike}%`} title="Finished visits with an order" sub={finished ? `${visitsToday.filter(withOrder).length} of ${finished}` : "none finished"} />
      </div>
      {idle && <p className="m-0 px-4 pb-3 text-[12px] text-bz-text-soft">No routes or visits today.</p>}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-bz-line-soft px-4 py-3">
        <Link to={sfPath("plan")} className={idle ? cn(BTN, "h-8") : FOOT_BTN}>
          {idle ? "Plan a week" : "Plan the week"}
        </Link>
        <Link to={sfPath("visits")} className={FOOT_BTN}>
          All visits
        </Link>
      </div>
    </Shell>
  );

  return (
    <SfShell
      current="live"
      actions={
        <>
          <span className={cn(HEAD_BTN, "pointer-events-none")}>
            <CalendarDays size={14} className="text-bz-text-muted" />
            {shortDay(SF_TODAY)}
            <span className={cn("text-bz-text-soft", NUM)}>{SF_NOW}</span>
          </span>
          <Link to={REP_APP} className={HEAD_BTN}>
            <Smartphone size={14} className="text-bz-text-muted" />
            Rep app
            <ArrowUpRight size={13} className="text-bz-text-soft" />
          </Link>
        </>
      }
    >
      {floating ? (
        <div ref={boxRef} className="absolute inset-0">
          {map(
            "size-full border-t border-bz-line-soft",
            <>
              {reps}
              {day}
            </>,
          )}
        </div>
      ) : (
        <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
          <div className="grid grid-cols-1 gap-3">
            {map("h-[46vh] min-h-[280px] rounded-[14px] border border-bz-line-soft")}
            {day}
            {reps}
          </div>
        </div>
      )}
      {open && log && <DayLog d={open} onClose={() => setLog(false)} />}
    </SfShell>
  );
}

/**
 * A panel of this page: glass on the map when it floats (`className` places it), an ordinary panel when the page is
 * stacked. The title row is `Panel`'s.
 */
function Shell({ floating, className, innerRef, lead, title, right, children }: { floating: boolean; className?: string; innerRef?: (el: HTMLDivElement | null) => void; lead?: React.ReactNode; title: string; right?: React.ReactNode; children: React.ReactNode }) {
  const body = (
    <div ref={innerRef} className="flex min-h-0 flex-1 select-text flex-col">
      <header className="flex min-h-[46px] shrink-0 items-center gap-2 pl-4 pr-2.5">
        {lead}
        <h2 className={cn(PANEL_TITLE, "min-w-0 flex-1 truncate")}>{title}</h2>
        {right}
      </header>
      {children}
    </div>
  );
  return floating ? <Float className={cn("flex flex-col", className)}>{body}</Float> : <section className={cn(PANEL, "flex min-w-0 flex-col overflow-hidden")}>{body}</section>;
}

/** One figure of the day: what it is, how much, and one quiet line under it. */
function Fig({ label, unit, value, of, sub, title }: { label: string; unit?: string; value: React.ReactNode; of?: number; sub?: React.ReactNode; title?: string }) {
  return (
    <div className="min-w-0" title={title}>
      <p className="m-0 truncate text-[11px] text-bz-text-soft">{label}</p>
      <p className={cn("m-0 mt-2 flex items-baseline gap-1 whitespace-nowrap text-[22px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>
        {unit && <span className="text-[11px] font-medium tracking-normal text-bz-text-soft">{unit}</span>}
        {value}
        {of !== undefined && <span className="text-[12px] font-medium tracking-normal text-bz-text-soft">of {of}</span>}
      </p>
      <p className={cn("m-0 mt-1.5 truncate text-[11px] leading-tight text-bz-text-soft", NUM)}>{sub}</p>
    </div>
  );
}

// ── The picked rep's day ────────────────────────────────────────────────────

function RepDayBody({ d, seen, teamStrike, floating, roomy, noteCount, onLog }: { d: RepDay; seen: LocationPing | undefined; teamStrike: number | null; floating: boolean; roomy: boolean; noteCount: number; onLog: () => void }) {
  const first = d.rep.name.split(" ")[0];
  const beat = d.stops.map((x) => x.customerId);
  const here = d.current ? (customerById(d.current.customerId)?.name ?? "a removed customer") : null;
  const strike = strikeRate(d.visits);
  const taken = d.visits.filter(withOrder).length;
  const finished = d.visits.filter((v) => v.state === "done").length;
  const unplanned = d.stops.length - d.planned;
  const groups = byRoute(d);
  // An order the rep took today that no visit on the list names — still theirs, still today's.
  const loose = d.orders.filter((o) => !d.visits.some((v) => v.orderId === o.id));
  const readings = pingsOf(d.rep.id, d.date).length;

  return (
    <>
      <p className="m-0 -mt-1 flex shrink-0 items-center gap-2 px-4 pb-3 text-[12px] text-bz-text-muted">
        {d.current ? (
          <>
            <span className="min-w-0 truncate">
              At {here} since <span className={NUM}>{d.current.checkIn ?? "—"}</span>
            </span>
            <Link to={sfPath(`visits/${d.current.id}`)} className={cn(QUIET, "shrink-0")}>
              Open visit
            </Link>
          </>
        ) : seen ? (
          <>
            <span className={cn("min-w-0 truncate", NUM)} title={`${placeText(placeOf(seen, beat))} · ± ${seen.accuracy} m`}>
              Last seen {clock(seen)} · {placeText(placeOf(seen, beat))}
            </span>
            <button type="button" onClick={onLog} className={cn(QUIET, "shrink-0")} title="Every location reading today">
              {plural(readings, "reading")}
            </button>
            <MapLink p={seen} className="shrink-0">
              Map
            </MapLink>
          </>
        ) : (
          <span>{d.stops.length ? "No location yet." : "No route today."}</span>
        )}
      </p>

      <div className={FIGS}>
        <Fig label="Visits" value={d.planned ? d.visited : finished} of={d.planned || undefined} title="Outlets visited, on today's route" sub={unplanned > 0 ? `${unplanned} unplanned` : d.lastCheckIn ? `last at ${d.lastCheckIn}` : d.planned ? "none yet" : "no route"} />
        <Fig label="With an order" value={taken} title="Visits that took an order" sub={finished > taken ? `${finished - taken} without` : finished ? "every visit" : "none finished"} />
        <Fig label="Orders" unit="NPR" value={short(d.orderValue)} title="Orders taken today" sub={d.orders.length ? plural(d.orders.length, "order") : "none yet"} />
        <Fig label="Strike rate" value={strike === null ? "—" : `${strike}%`} title="Finished visits with an order" sub={teamStrike === null ? "no team rate" : `team ${teamStrike}%`} />
      </div>

      {d.visits.some((v) => v.checkIn) && <DayStrip d={d} />}

      {(groups.length > 0 || loose.length > 0) && (
        // Five stops (three on a narrow window) under one route head, then it scrolls.
        <div className={cn("border-t border-bz-line-soft", floating && cn("min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]", roomy ? "max-h-[266px]" : "max-h-[172px]"))}>
          {groups.length > 0 && (
            <ol className="m-0 list-none p-0">
              {groups.map((g) => (
                <React.Fragment key={g.routeId ?? "off"}>
                  <RouteHead g={g} />
                  {g.stops.map((stop) => (
                    <StopRow key={stop.customerId} stop={stop} seen={seen} />
                  ))}
                </React.Fragment>
              ))}
            </ol>
          )}
          {loose.length > 0 && (
            <ul className={cn("m-0 list-none p-0", groups.length > 0 && "border-t border-bz-line-soft")}>
              {loose.map((o) => (
                <OrderRow key={o.id} o={o} />
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-bz-line-soft px-4 py-3">
        <Link to={sfPath(`plan/${d.rep.id}`)} className={d.status === "no-beat" ? cn(BTN, "h-8") : FOOT_BTN}>
          Plan {first}'s week
        </Link>
        <Link to={sfPath("visits")} className={FOOT_BTN}>
          All visits
        </Link>
        <button type="button" onClick={onLog} className={cn(QUIET, "ml-auto inline-flex items-center gap-1.5")} title="Notes, history and today's locations">
          <MessageSquare size={13} />
          Notes
          {noteCount > 0 && <span className={cn("text-bz-text-soft", NUM)}>{noteCount}</span>}
        </button>
      </div>
    </>
  );
}

/** The day on a time axis: a mark from each check-in to its check-out, a line at now, and what is still to come after it. */
function DayStrip({ d }: { d: RepDay }) {
  const calls = d.visits
    .filter((v) => v.checkIn)
    .map((v) => ({ v, a: mins(v.checkIn!), b: v.checkOut ? mins(v.checkOut) : null }))
    .sort((x, y) => x.a - y.a);
  const now = mins(SF_NOW);
  // 08 to 18, stretched to the hour when the day began earlier or ran later.
  const from = Math.min(8 * 60, ...calls.map((c) => Math.floor(c.a / 60) * 60));
  const to = Math.max(18 * 60, ...calls.map((c) => Math.ceil((c.b ?? c.a) / 60) * 60));
  const x = (m: number) => ((Math.min(to, Math.max(from, m)) - from) / (to - from)) * 100;
  const showNow = now >= from && now <= to;
  // Stops still to visit have no time yet: they are spread over what is left of the day, as a count, not a schedule.
  const todo = d.stops.filter((s) => s.status === "to-visit").length;
  const start = Math.max(from, Math.min(to, now));
  const slots = to - start >= 30 ? Array.from({ length: todo }, (_, i) => start + ((i + 1) * (to - start)) / (todo + 1)) : [];
  const hours = Array.from({ length: Math.floor((to - from) / 120) + 1 }, (_, i) => from + i * 120);
  const end = Math.max(...calls.map((c) => c.b ?? (showNow ? now : c.a)));

  return (
    <div className="shrink-0 px-4 pb-3">
      <div className="relative h-4">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-bz-line" />
        <span className="absolute top-1/2 h-px -translate-y-1/2" style={{ left: `${x(calls[0].a)}%`, width: `${x(end) - x(calls[0].a)}%`, background: inkOf("accent") }} />
        {calls.map(({ v, a, b }) => (
          <span
            key={v.id}
            title={`${v.checkIn}${v.checkOut ? `–${v.checkOut}` : ""} · ${customerById(v.customerId)?.name ?? "Removed customer"} · ${outcomeOf(v)}`}
            className="absolute top-1/2 h-[9px] min-w-[9px] -translate-y-1/2 rounded-bz-pill"
            style={{ left: `${x(a)}%`, width: `${Math.max(0, x(b ?? (v.state === "in-progress" && showNow ? now : a)) - x(a))}%`, ...markStyle(v.state, !!v.orderId) }}
          />
        ))}
        {slots.map((m, i) => (
          <span key={i} title="To visit" className="absolute top-1/2 size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-bz-pill" style={{ left: `${x(m)}%`, ...markStyle("to-visit", false) }} />
        ))}
        {showNow && <span title={`Now · ${SF_NOW}`} className="absolute inset-y-0 w-px bg-bz-text" style={{ left: `${x(now)}%` }} />}
      </div>
      <div className={cn("relative mt-1.5 h-3 text-[10.5px] leading-none text-bz-text-soft", NUM)}>
        {hours.map((h, i) => (
          <span key={h} className="absolute top-0" style={{ left: `${x(h)}%`, transform: i === 0 ? undefined : h >= to ? "translateX(-100%)" : "translateX(-50%)" }}>
            {String(h / 60).padStart(2, "0")}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A route's quiet head in the stops list: its name (the door to the route), and how many of its stops due today are done. */
function RouteHead({ g }: { g: StopGroup }) {
  const name = g.routeId ? routeName(g.routeId) : "Not on today's routes";
  const text = "min-w-0 truncate text-[12px] font-semibold text-bz-text";
  return (
    <li className="flex min-h-[30px] items-center justify-between gap-3 border-b border-bz-line-soft px-4 py-1">
      {g.routeId && routeById(g.routeId) ? (
        <Link to={sfPath(`routes/${g.routeId}`)} className={cn(text, "underline-offset-2 hover:underline")}>
          {name}
        </Link>
      ) : (
        <span className={text}>{name}</span>
      )}
      <span className={cn("shrink-0 text-[11.5px] text-bz-text-soft", NUM)}>{g.routeId ? `${g.done} of ${g.stops.length}` : g.stops.length}</span>
    </li>
  );
}

/** A stop: when, the shop (the visit once there is one, the customer until then), what it came to, and the order it took. */
function StopRow({ stop, seen }: { stop: Stop; seen: LocationPing | undefined }) {
  const c = customerById(stop.customerId);
  const v = stop.visit;
  const o = v?.orderId ? orderById(v.orderId) : undefined;
  const name = c?.name ?? "Removed customer";
  const audit = v && needsAudit(v) ? (fenceState(v.geofence) === "away" ? "Away" : "No GPS") : null;
  const far = !v && seen && c?.location ? ` · ${fmtDistance(distanceMetres(seen, c.location))} away` : "";
  const line = v ? outcomeOf(v) : `To visit${far}`;
  const to = v ? sfPath(`visits/${v.id}`) : c ? sfPath(`customers/${c.id}`) : null;
  return (
    <li className="flex min-h-[47px] items-center gap-3 border-b border-bz-line-soft px-4 py-1.5 last:border-0">
      <span className={cn("w-9 shrink-0 text-[11.5px] text-bz-text-soft", NUM)}>{v?.checkIn ?? "—"}</span>
      <span className="size-[9px] shrink-0 rounded-bz-pill" style={markStyle(stop.status, !!v?.orderId)} />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-baseline gap-2">
          {to ? (
            <Link to={to} className="min-w-0 truncate text-[13px] text-bz-text underline-offset-2 hover:underline">
              {name}
            </Link>
          ) : (
            <span className="min-w-0 truncate text-[13px] text-bz-text">{name}</span>
          )}
          {audit && (
            <span className="shrink-0 text-[11px] font-medium text-bz-amber-ink" title={fenceText(v?.geofence ?? null)}>
              {audit}
            </span>
          )}
        </span>
        <span className={cn("block truncate text-[11.5px] text-bz-text-soft", NUM)} title={line}>
          {line}
        </span>
      </span>
      {o && <OrderFigure o={o} />}
    </li>
  );
}

/** What an order came to, and where it stands in the hub. The figure is the door to the order. */
function OrderFigure({ o }: { o: HubOrder }) {
  const total = orderTotal(o);
  return (
    <Link to={sfPath(`orders/${o.id}`)} className="group shrink-0 text-right" title={`${o.id} · ${o.at.slice(11, 16)} · NPR ${Math.round(total).toLocaleString("en-US")}`}>
      <span className={cn("block text-[13px] font-semibold text-bz-text underline-offset-2 group-hover:underline", NUM)}>{short(total)}</span>
      <span className={cn("block text-[11px]", o.status === "review" ? "text-bz-red" : "text-bz-text-soft")}>{STATUS_META[o.status].label}</span>
    </Link>
  );
}

function OrderRow({ o }: { o: HubOrder }) {
  const shop = customerById(forShopId(o) ?? o.customerId)?.name ?? "Removed customer";
  const billed = forShopId(o) ? ` · billed to ${customerById(o.customerId)?.name ?? "a removed distributor"}` : "";
  return (
    <li className="flex min-h-[47px] items-center gap-3 border-b border-bz-line-soft px-4 py-1.5 last:border-0">
      <span className={cn("w-9 shrink-0 text-[11.5px] text-bz-text-soft", NUM)}>{o.at.slice(11, 16)}</span>
      <ReceiptText size={11} className="-mx-px shrink-0 text-bz-text-soft" />
      <span className="min-w-0 flex-1">
        <Link to={sfPath(`orders/${o.id}`)} className="block truncate text-[13px] text-bz-text underline-offset-2 hover:underline">
          {shop}
        </Link>
        <span className={cn("block truncate text-[11.5px] text-bz-text-soft", NUM)}>
          Order {o.id}
          {billed}
        </span>
      </span>
      <OrderFigure o={o} />
    </li>
  );
}

/** The rep's day as a record: every location reading, then the notes and history of the rep and of today's visits. */
function DayLog({ d, onClose }: { d: RepDay; onClose: () => void }) {
  const trail = pingsOf(d.rep.id, d.date);
  const last = trail[trail.length - 1];
  const beat = d.stops.map((x) => x.customerId);
  return (
    <Dialog
      open
      size="wide"
      eyebrow={shortDay(d.date)}
      title={d.rep.name}
      onClose={onClose}
      foot={
        <>
          <Link to={sfPath(`team/${d.rep.id}`)} className={GHOST}>
            Open rep
          </Link>
          <button type="button" className={GHOST} onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div className="-m-4">
        <section className="border-b border-bz-line-soft px-5 py-4">
          <div className="mb-2.5 flex items-center gap-2">
            <h3 className="m-0 text-[12px] font-semibold text-bz-text">Locations</h3>
            {trail.length > 0 && <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{trail.length}</span>}
            {last && <MapLink p={last} className="ml-auto" />}
          </div>
          {trail.length === 0 ? (
            <p className="m-0 text-[11.5px] text-bz-text-soft">No location yet.</p>
          ) : (
            <ol className="m-0 flex list-none flex-col gap-2 p-0">
              {trail.map((p) => (
                <li key={p.id} className="flex items-baseline gap-3 text-[11.5px]">
                  <span className={cn("w-10 shrink-0 text-right text-bz-text-soft", NUM)}>{clock(p)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="text-bz-text">{PING_KIND[p.kind]}</span>
                    <span className="text-bz-text-muted"> · {placeText(placeOf(p, beat))}</span>
                    <span className={cn("text-bz-text-soft", NUM)}> · ± {p.accuracy} m</span>
                  </span>
                  <MapLink p={p} className="shrink-0">
                    Map
                  </MapLink>
                </li>
              ))}
            </ol>
          )}
        </section>
        <SfActivity ids={[d.rep.id, ...d.visits.map((v) => v.id)]} />
        <div className="sticky bottom-0 z-[1]">
          <SfNoteFoot id={d.rep.id} />
        </div>
      </div>
    </Dialog>
  );
}
