import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowRightLeft, ChevronDown, ChevronRight, CalendarPlus, Footprints, Map as MapIcon, MoreHorizontal, Phone, Plus, RefreshCw, Rows3, SlidersHorizontal, UserRound } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, CARD, Chip, Empty, GHOST_SM, ICON_BTN, Kbd, LABEL, MenuItem, MenuSep, NUM, Popover, SearchField, Segmented, Select, SkeletonRows, Stat, Statline, ToastHost, useToast } from "../sales/bzw";
import { Failed } from "../masters/kit/marks";
import { useKeys, useMedia } from "../sales/orders";
import { personById } from "../productivity/shared";
import { FIELD_NOW, FIELD_TODAY, REPS, STATUS_META, fmtDay, handOver, nextWorkday, pct, repDay, toMin, whenOf } from "./model";
import type { RepDay } from "./model";
import { DayStepper, Money, OfCount, RouteChip, SfmFrame, StopLegend, StopStrip, TodayLink, useField, useSheetLinks } from "./kit";
import { FieldMap } from "./map";
import type { MapPin, MapRep, MapTrail } from "./map";
import { GivePop, PlanRoutePop } from "./planning";
import { DayPanel } from "./day";
import { SheetHost } from "./sheets";

// ════════════════════════════════════════════════════════════════════════════
// TODAY — is the field covered, and who needs me?
//
// One row per rep, banded by what the day is waiting for (needs you · in the
// field · closed · off), each row a complete read of the rep-day: where they
// are, the stop strip, orders, money. The map sits beside the list as its
// companion (≥1280px) — hovering a row lights that rep's stops; opening a rep
// puts the day panel where the map was. Any date works: yesterday is the
// day-close review, tomorrow is a preview of the plan.
//
// Replaces: Salesman On Map, Party On Map, Salesman Person Location, Today's
// Visit Report and the per-day EOD screens (research/01 §2).
// ════════════════════════════════════════════════════════════════════════════

type Band = { key: string; label: string; alarm?: boolean; collapsed?: boolean; rows: RepDay[] };

export function TodayPage() {
  const { repId } = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const { ctx } = useField();
  const wide = useMedia("(min-width: 1280px)");
  const { toast, show, dismiss } = useToast();
  const sheets = useSheetLinks();
  const date = search.get("day") ?? FIELD_TODAY;
  const flag = (k: string) => search.get(k) === "1";
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(flag("fail"));
  React.useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), flag("slow") ? 2400 : 380);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const [q, setQ] = React.useState("");
  const [pick, setPick] = React.useState<string | null>(null);
  const [sub, setSub] = React.useState<string[]>([]);
  const [view, setView] = React.useState<"list" | "map">("list");
  const [hot, setHot] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set(["off"]));
  const [refreshedAt, setRefreshedAt] = React.useState(FIELD_NOW);
  const [refreshing, setRefreshing] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const setDate = (d: string) => {
    const p = new URLSearchParams(search);
    if (d === FIELD_TODAY) p.delete("day");
    else p.set("day", d);
    navigate({ pathname: `/design/sfm/today${repId ? `/${repId}` : ""}`, search: p.toString() ? `?${p}` : "" });
  };
  const openRep = (id: string | null) => navigate({ pathname: `/design/sfm/today${id ? `/${id}` : ""}`, search: search.toString() ? `?${search}` : "" });
  const openVisit = (visitId: string) => navigate(`/design/sfm/visits/${visitId}`);
  const notify = (text: string, undo?: () => void) => show(undo ? "success" : "info", text, undo ? { label: "Undo", run: undo } : undefined);

  const empty = flag("empty");
  const all = React.useMemo(() => (empty ? [] : REPS.map((r) => repDay(r.id, date, ctx))), [ctx, date, empty]);
  const when = whenOf(date);

  const picks: { key: string; label: string; test: (d: RepDay) => boolean; value: React.ReactNode; danger?: boolean; title?: string }[] = [
    { key: "needs", label: "Needs you", test: (d) => d.needsYou, value: all.filter((d) => d.needsYou).length, danger: all.some((d) => d.needsYou), title: "Not started, route with no one, behind, idle, day not closed" },
    ...(when !== "future"
      ? [
          { key: "field", label: "In the field", test: (d: RepDay) => ["at-stop", "in-field", "behind", "idle", "done"].includes(d.status), value: all.filter((d) => ["at-stop", "in-field", "behind", "idle", "done"].includes(d.status)).length },
          { key: "closed", label: "Closed", test: (d: RepDay) => d.status === "closed", value: `${all.filter((d) => d.status === "closed").length} of ${all.filter((d) => d.visits.length).length}` },
        ]
      : []),
  ];
  const planned = all.reduce((s, d) => s + d.figures.planned, 0);
  const visited = all.reduce((s, d) => s + d.figures.visited, 0);
  const unplanned = all.reduce((s, d) => s + d.figures.unplanned, 0);
  const productive = all.reduce((s, d) => s + d.figures.productive, 0);
  const value = all.reduce((s, d) => s + d.figures.value, 0);
  const received = all.reduce((s, d) => s + d.figures.received, 0);

  const rows = all.filter((d) => {
    if (sub.length && !sub.includes(d.rep.subsidiaryId)) return false;
    if (q && !`${d.rep.name} ${d.routes.map((r) => `${r.id} ${r.name}`).join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
    const p = picks.find((x) => x.key === pick);
    return p ? p.test(d) : true;
  });
  const bands: Band[] = [
    { key: "needs", label: "Needs you", alarm: true, rows: rows.filter((d) => d.needsYou) },
    { key: "field", label: when === "future" ? "Planned" : "In the field", rows: rows.filter((d) => !d.needsYou && ["at-stop", "in-field", "behind", "idle", "done", "planned"].includes(d.status)) },
    { key: "closed", label: "Day closed", rows: rows.filter((d) => !d.needsYou && d.status === "closed") },
    { key: "off", label: "Off", collapsed: true, rows: rows.filter((d) => !d.needsYou && ["leave", "off", "no-plan"].includes(d.status)) },
  ].filter((b) => b.rows.length);
  const walk = bands.filter((b) => !collapsed.has(b.key)).flatMap((b) => b.rows);

  const open = repId ? all.find((d) => d.rep.id === repId) ?? null : null;
  const step = (dir: 1 | -1) => {
    if (!walk.length) return;
    const i = open ? walk.findIndex((d) => d.rep.id === open.rep.id) : -1;
    openRep(walk[(i + dir + walk.length) % walk.length].rep.id);
  };
  useKeys({
    "/": (e) => (e.preventDefault(), searchRef.current?.focus()),
    j: () => step(1),
    k: () => step(-1),
    escape: () => (open ? openRep(null) : pick ? setPick(null) : undefined),
  });

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => (setRefreshing(false), setRefreshedAt(FIELD_NOW), notify("Up to date — last fix 14:08")), 600);
  };

  // ── Map layers: every shown rep's stops; the hot or open rep's trail ──
  // One subsidiary's ground at a time — Kathmandu and Pokhara in one frame shrink every pin to a dot.
  const subsShown = Array.from(new Set(rows.map((d) => d.rep.subsidiaryId)));
  const [mapSubPick, setMapSub] = React.useState<string | null>(null);
  const mapSub = open ? open.rep.subsidiaryId : sub.length === 1 ? sub[0] : mapSubPick && subsShown.includes(mapSubPick) ? mapSubPick : subsShown.includes("NP-01") ? "NP-01" : subsShown[0];
  const mapRows = open ? [open] : rows.filter((d) => d.rep.subsidiaryId === mapSub);
  const pins: MapPin[] = mapRows.flatMap((d) => [
    ...d.stops.map((s, i) => ({ id: `${d.rep.id}:${s.party.id}`, lat: s.party.lat, lng: s.party.lng, tone: d.routes.find((r) => r.id === s.routeId)?.tone ?? null, kind: s.state, label: s.party.name, sub: `${d.rep.name.split(" ")[0]} · stop ${i + 1}`, group: d.rep.id })),
    ...d.unplanned.map((u) => ({ id: `${d.rep.id}:u:${u.party.id}`, lat: u.party.lat, lng: u.party.lng, tone: null, kind: "unplanned" as const, label: u.party.name, sub: `${d.rep.name.split(" ")[0]} · unplanned`, group: d.rep.id })),
  ]);
  const reps: MapRep[] = when === "future" ? [] : mapRows.filter((d) => d.fixes.length).map((d) => {
    const f = d.fixes[d.fixes.length - 1];
    return { id: d.rep.id, lat: f.at[0], lng: f.at[1], initials: d.rep.initials, stale: when !== "today" || toMin(FIELD_NOW) - toMin(f.t) > 45, label: d.rep.name, sub: `Last fix ${f.t}` };
  });
  const trailFor = hot && hot.startsWith("EMP-") ? hot : open?.rep.id;
  const trails: MapTrail[] = mapRows.filter((d) => d.rep.id === trailFor && d.fixes.length > 1).map((d) => ({ id: d.rep.id, points: d.fixes.map((f) => f.at), tone: d.routes[0]?.tone ?? null }));
  const showMapCol = wide && !open;
  const onlyMap = !wide && view === "map" && !open;

  const shell = {
    docked: wide,
    full: false,
    position: open ? { index: Math.max(0, walk.findIndex((d) => d.rep.id === open.rep.id)), total: walk.length } : null,
    onPrev: () => step(-1),
    onNext: () => step(1),
    onToggleFull: () => {},
    onClose: () => openRep(null),
    show,
  };

  return (
    <SfmFrame tab="today">
      <div className="flex h-full min-h-0">
        <div className={cn("min-w-0 flex-1 overflow-y-auto [scrollbar-width:thin]", onlyMap && "hidden")}>
          <div className="border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">
            <Statline>
              {picks.map((p) => (
                <Stat key={p.key} label={p.label} value={p.value} danger={p.danger} title={p.title} active={pick === p.key} onPick={() => setPick(pick === p.key ? null : p.key)} />
              ))}
              {when !== "future" ? (
                <>
                  <Stat label="Visits" value={<OfCount n={visited} of={planned} />} meter={pct(visited, planned)} sub={unplanned ? `+${unplanned} unplanned` : undefined} title="Planned stops visited, of planned. Unplanned visits are counted apart and never as compliance." />
                  <Stat label="Productive" value={productive} sub={`${pct(productive, visited + unplanned)}%`} title="Visits where the rep has an order for that party that day" />
                  <Stat label="Orders" value={<Money value={value} />} />
                  <Stat label="Received" value={<Money value={received} />} title="All receipts the reps took — collected once tagged to invoices, advance until then" />
                </>
              ) : (
                <Stat label="Stops planned" value={planned} />
              )}
            </Statline>
          </div>

          <div className="sticky top-0 z-30 border-b border-bz-line bg-bz-paper">
            <div className="flex flex-wrap items-center gap-2 px-4 py-2 md:px-6">
              <DayStepper date={date} onChange={setDate} />
              <TodayLink date={date} onToday={() => setDate(FIELD_TODAY)} />
              <div className="min-w-[160px] flex-1 md:max-w-[240px]">
                <SearchField ref={searchRef} value={q} onChange={setQ} placeholder="Rep or route" hint="/" />
              </div>
              <Select
                multiple
                label="Subsidiary"
                icon={SlidersHorizontal}
                badge={sub.length}
                applied={sub.length > 0}
                value={sub}
                onChange={setSub}
                options={[
                  { value: "NP-01", label: "Bizak Nepal", hint: "Kathmandu valley" },
                  { value: "NP-02", label: "Bizak Gandaki", hint: "Pokhara" },
                ]}
                width={240}
              />
              <div className="ml-auto flex items-center gap-2">
                {when === "today" && (
                  <span className={cn("hidden text-[11px] text-bz-text-soft sm:inline", NUM)} title="Fixes arrive about every 15 minutes; freshness is banded, never a live-to-the-second reading">
                    Updated {refreshedAt}
                  </span>
                )}
                {when === "today" && (
                  <button type="button" className={ICON_BTN} onClick={refresh} title="Refresh" aria-label="Refresh">
                    <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                  </button>
                )}
                {!wide && (
                  <Segmented
                    size="sm"
                    value={view}
                    onChange={(v) => setView(v as "list" | "map")}
                    options={[
                      { value: "list", label: <Rows3 size={12} />, title: "List" },
                      { value: "map", label: <MapIcon size={12} />, title: "Map" },
                    ]}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="p-4 pb-24 md:p-6 md:pb-24">
            {loading ? (
              <div className={cn(CARD, "overflow-hidden")}>
                <SkeletonRows rows={7} text="Reading the field…" />
              </div>
            ) : failed ? (
              <div className={CARD}>
                <Failed text="Couldn't read the field for this day." onRetry={() => setFailed(false)} />
              </div>
            ) : all.length === 0 ? (
              <div className={CARD}>
                <Empty title="No sales reps yet." icon={UserRound} action={<span className="text-[12px] text-bz-text-muted">Mark an employee as a sales rep (Employee › Sales rep) and they appear here.</span>} />
              </div>
            ) : rows.length === 0 ? (
              <div className={CARD}>
                <Empty title="No rep matches." action={<button type="button" className={GHOST_SM} onClick={() => (setQ(""), setPick(null), setSub([]))}>Clear all</button>} />
              </div>
            ) : (
              <>
                <div className={cn(CARD, "overflow-hidden transition-opacity", refreshing && "opacity-55")}>
                  {bands.map((b) => {
                    const shut = collapsed.has(b.key) ? !b.collapsed : !!b.collapsed;
                    return (
                      <section key={b.key}>
                        <button
                          type="button"
                          onClick={() => setCollapsed((s) => {
                            const n = new Set(s);
                            if (n.has(b.key)) n.delete(b.key);
                            else n.add(b.key);
                            return n;
                          })}
                          className={cn("flex w-full items-center gap-2 border-b border-bz-line-soft px-3 py-2 text-left", b.alarm ? "bg-bz-red-soft" : "bg-bz-paper-warm/60")}
                        >
                          {shut ? <ChevronRight size={13} className="text-bz-text-soft" /> : <ChevronDown size={13} className="text-bz-text-soft" />}
                          <h3 className={cn("m-0 text-[12.5px] font-semibold", b.alarm ? "text-bz-red" : "text-bz-text")}>{b.label}</h3>
                          <span className={cn("rounded-bz-sm bg-bz-surface/70 px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>{b.rows.length}</span>
                        </button>
                        {!shut && b.rows.map((d) => <RepRow key={d.rep.id} d={d} active={open?.rep.id === d.rep.id} hot={hot === d.rep.id} onHot={setHot} onOpen={() => openRep(d.rep.id)} notify={notify} compact={!!open && wide} />)}
                      </section>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <StopLegend />
                  <span className="text-[10.5px] text-bz-text-soft">
                    <Kbd>J</Kbd> <Kbd>K</Kbd> walk · <Kbd>←</Kbd> <Kbd>→</Kbd> day · <Kbd>T</Kbd> today
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {(showMapCol || onlyMap) && !loading && (
          <div className={cn("relative h-full min-h-0 border-l border-bz-line", onlyMap ? "flex-1" : "w-[42%] max-w-[720px] shrink-0")}>
            <FieldMap
              pins={pins}
              reps={reps}
              trails={trails}
              hot={hot}
              onHot={setHot}
              onPick={(id) => sheets.openParty(id.split(":").pop()!)}
              onPickRep={(id) => openRep(id)}
              caption={
                <span className="pointer-events-auto inline-flex items-center gap-2">
                  <span>
                    {when === "future" ? "Planned stops" : "Stops"} · {mapRows.length} {mapRows.length === 1 ? "rep" : "reps"}
                  </span>
                  {subsShown.length > 1 && !open && (
                    <Segmented
                      size="sm"
                      value={mapSub}
                      onChange={(v) => setMapSub(v)}
                      options={subsShown.map((s) => ({ value: s, label: s === "NP-02" ? "Pokhara" : "Kathmandu", count: rows.filter((d) => d.rep.subsidiaryId === s).length }))}
                    />
                  )}
                </span>
              }
              empty={when === "future" ? "Nothing planned on this day." : "No stops on this day."}
            />
          </div>
        )}

        {open && (
          <>
            {!wide && <div className="absolute inset-0 z-40 bg-bz-olive-dark/25" onClick={() => openRep(null)} />}
            <div className={cn(wide ? "relative h-full min-h-0 w-[720px] shrink-0" : "absolute inset-y-0 right-0 z-50 w-full max-w-[720px]")}>
              <DayPanel key={`${open.rep.id}${date}`} repId={open.rep.id} date={date} shell={shell} notify={notify} onOpenVisit={openVisit} />
            </div>
          </>
        )}
      </div>
      <SheetHost onOpenDay={(id, d) => navigate(`/design/sfm/today/${id}${d !== FIELD_TODAY ? `?day=${d}` : ""}`)} onOpenVisit={openVisit} />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SfmFrame>
  );
}

// ── The rep row ─────────────────────────────────────────────────────────────

function RepRow({ d, active, hot, onHot, onOpen, notify, compact }: { d: RepDay; active: boolean; hot: boolean; onHot: (id: string | null) => void; onOpen: () => void; notify: (t: string, undo?: () => void) => void; compact: boolean }) {
  const sheets = useSheetLinks();
  const navigate = useNavigate();
  const more = React.useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = React.useState(false);
  const [pop, setPop] = React.useState<"give" | "plan" | null>(null);
  const meta = STATUS_META[d.status];
  const f = d.figures;
  const when = d.when;
  const open = d.stops.filter((s) => s.state === "pending" || s.state === "missed");
  const openPlans = d.plans.filter((p) => open.some((s) => s.routeId === p.routeId));
  const tomorrow = nextWorkday(d.date);
  const moveRest = () => {
    const undos: (() => void)[] = [];
    let moved = 0;
    for (const p of openPlans) {
      const r = handOver(p.id, { repId: d.rep.id, date: tomorrow });
      if (!r.ok) return notify("why" in r ? r.why : "Couldn't move it.");
      moved += r.moved;
      undos.push(r.undo);
    }
    notify(`${moved} stops moved to ${fmtDay(tomorrow)}`, () => undos.forEach((u) => u()));
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && onOpen()}
      onMouseEnter={() => onHot(d.rep.id)}
      onMouseLeave={() => onHot(null)}
      onFocus={() => onHot(d.rep.id)}
      className={cn(
        "group relative grid cursor-pointer items-center gap-x-4 gap-y-1 border-b border-bz-line-soft px-3 py-2.5 transition-colors last:border-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire",
        compact ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(200px,1.3fr)_minmax(150px,1fr)_120px_110px_32px]",
        active ? "bg-bz-fire/10" : hot ? "bg-bz-paper-warm" : "bg-bz-surface hover:bg-bz-paper-warm",
      )}
    >
      {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-bz-fire" />}
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={(e) => (e.stopPropagation(), sheets.openRep(d.rep.id))}
          className="shrink-0 rounded-bz-pill focus-visible:outline-2 focus-visible:outline-bz-fire"
          title={`Open ${d.rep.name}`}
        >
          <Avatar person={personById(d.rep.id)} size={30} />
        </button>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[12.5px] font-semibold text-bz-text">{d.rep.name}</span>
            <Chip tone={meta.tone}>{d.status === "idle" ? `Idle ${d.line.split("for ")[1]?.split(" ·")[0] ?? ""}` : meta.label}</Chip>
          </div>
          <p className={cn("m-0 mt-0.5 truncate text-[11px]", d.needsYou ? "text-bz-red" : "text-bz-text-muted")}>{d.line}</p>
        </div>
      </div>

      {!compact && (
        <div className="hidden min-w-0 flex-col gap-1 md:flex">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {d.routes.length ? d.routes.map((r) => <RouteChip key={r.id} route={r} tight onClick={(e) => (e.stopPropagation(), navigate(`/design/sfm/routes/${r.id}`))} />) : <span className="text-[11px] text-bz-text-soft">—</span>}
          </div>
          {d.stops.length > 0 && (
            <div className="flex items-center gap-2">
              <StopStrip stops={d.stops.map((s, i) => ({ state: s.state, title: `${i + 1}. ${s.party.name}${s.visit ? ` · ${s.visit.in}${s.visit.out ? `–${s.visit.out}` : ""}` : ""}${s.orders.length ? ` · ${s.orders.map((o) => o.no).join(", ")}` : s.visit?.noOrderReason ? ` · no order (${s.visit.noOrderReason})` : ""}` }))} unplanned={d.unplanned.map((u) => ({ title: `${u.party.name} · unplanned · ${u.visit.in}`, productive: u.productive }))} />
              {when !== "future" && <OfCount n={f.visited} of={f.planned} className="text-[11px]" />}
            </div>
          )}
        </div>
      )}

      {!compact && (
        <div className="hidden text-right md:block">
          {when === "future" ? (
            <span className="text-[11px] text-bz-text-soft">{f.planned ? `${f.planned} stops` : ""}</span>
          ) : (
            <>
              <Money value={f.value} className="block text-[12.5px] font-semibold text-bz-text" />
              <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{f.orders ? `${f.orders} order${f.orders === 1 ? "" : "s"} · ${f.productive} productive` : "no orders"}</span>
            </>
          )}
        </div>
      )}
      {!compact && (
        <div className="hidden text-right md:block">
          {when !== "future" &&
            (f.received ? (
              <>
                <Money value={f.received} className="block text-[12px] text-bz-text" code={false} />
                <span className="block text-[10.5px] text-bz-text-soft">received</span>
              </>
            ) : (
              <span className="text-[11px] text-bz-text-soft">—</span>
            ))}
        </div>
      )}

      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <button ref={more} type="button" className={cn(ICON_BTN, "opacity-40 group-hover:opacity-100 focus-visible:opacity-100", menu && "opacity-100")} onClick={() => setMenu(true)} title="More" aria-label={`More for ${d.rep.name}`}>
          <MoreHorizontal size={15} />
        </button>
        <Popover open={menu} anchor={more.current} onClose={() => setMenu(false)} align="right" width={250}>
          <MenuItem icon={Footprints} onClick={() => (setMenu(false), onOpen())} kbd="↵">
            Open day
          </MenuItem>
          {d.plans.length > 0 && when !== "past" && (
            <MenuItem icon={ArrowRightLeft} onClick={() => (setMenu(false), setPop("give"))} hint={d.visits.length ? "The stops not reached yet" : "The whole route"}>
              {d.visits.length ? "Give the rest to…" : "Give route to…"}
            </MenuItem>
          )}
          {openPlans.length > 0 && when !== "past" && (
            <MenuItem icon={CalendarPlus} onClick={() => (setMenu(false), moveRest())} hint={`${open.length} stops go to ${fmtDay(tomorrow)}`}>
              Move the rest to {fmtDay(tomorrow).split(" ")[0]}
            </MenuItem>
          )}
          {when !== "past" && !d.leave && (
            <MenuItem icon={Plus} onClick={() => (setMenu(false), setPop("plan"))}>
              Add a route {when === "today" ? "today" : "this day"}
            </MenuItem>
          )}
          <MenuSep />
          <MenuItem icon={Phone} onClick={() => (setMenu(false), (window.location.href = `tel:${d.rep.phone}`))} hint={d.rep.phone}>
            Call
          </MenuItem>
          <MenuItem icon={UserRound} onClick={() => (setMenu(false), sheets.openRep(d.rep.id))}>
            Open rep
          </MenuItem>
        </Popover>
        {pop === "give" && <GivePop open anchor={more.current} onClose={() => setPop(null)} planIds={d.plans.map((p) => p.id)} notify={notify} />}
        {pop === "plan" && <PlanRoutePop open anchor={more.current} onClose={() => setPop(null)} repId={d.rep.id} date={d.date} notify={notify} />}
      </div>

      {/* Below md the strip and money drop under the name, so a phone still reads the whole day. */}
      {!compact && d.stops.length > 0 && (
        <div className="col-span-2 flex items-center justify-between gap-2 pl-[40px] md:hidden">
          <StopStrip stops={d.stops.map((s) => ({ state: s.state, title: s.party.name }))} unplanned={d.unplanned.map((u) => ({ title: u.party.name, productive: u.productive }))} size={8} />
          {when !== "future" && <Money value={f.value} className="text-[11.5px] font-semibold" code={false} />}
        </div>
      )}
      {compact && (
        <div className="col-span-2 flex items-center gap-2 pl-[40px]">
          <StopStrip stops={d.stops.map((s) => ({ state: s.state, title: s.party.name }))} unplanned={d.unplanned.map((u) => ({ title: u.party.name, productive: u.productive }))} size={7} />
        </div>
      )}
    </div>
  );
}

export { LABEL };
