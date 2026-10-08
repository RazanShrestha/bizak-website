import * as React from "react";
import { Link } from "react-router";
import { ArrowUpRight, CalendarDays, Check, Footprints, Inbox, MapPinned, ShoppingBag, Smartphone, Store, Target } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { Amount } from "../sales/orders";
import { useStore } from "../sales/store";
import { ME } from "../productivity/shared";
import { SF_NOW, SF_TODAY } from "./data";
import type { Source } from "./data";
import { customerById } from "./engine";
import { DAY_STATUS, THIS_MONTH, addDays, orderTotal, pct, repDay, shortDay } from "./field-data";
import { ruleText } from "./schemes-kit";
import type { RepDay } from "./field-data";
import { Bars, Columns, Gauge, HEAD_BTN, Kpi, Legend, MapCanvas, MapDot, Panel, Ring, Spark, TickBar, deltaOf, inkOf, short } from "./fx";
import type { Ink, MapPoint } from "./fx";
import { lastPing } from "./geo";
import { GettingStarted, guideHiddenStore, useSteps } from "./guide";
import { useQueue, waited } from "./InboxPage";
import { SfShell, Who, sfPath, useWaiting } from "./sf";
import { customersStore, hubStore, ledgerStore, locationsStore, planStore, repsStore, schemesStore, targetsStore, typesStore, visitsStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE · OVERVIEW — the day, read from the door
//
// Four figures that say how today is going, the field on a map with each rep's
// month beside it, the week's sales against last week's, where the orders came
// from, and the few things that wait for someone. Every panel is a door to the
// place that holds the whole of it.
// ════════════════════════════════════════════════════════════════════════════

export const SOURCE_LABEL: Record<Source, string> = { rep: "Reps", portal: "Dealer portal", whatsapp: "WhatsApp", "retailer-app": "Retailer app", "back-office": "Back office" };
const SOURCE_INK: Record<Source, Ink> = { rep: "accent", portal: "indigo", "back-office": "soft", whatsapp: "teal", "retailer-app": "ochre" };

const DAY_RING: Record<RepDay["status"], string> = { "at-outlet": "var(--fx-accent)", "on-beat": "var(--bz-positive)", done: "var(--bz-positive)", "not-started": "var(--bz-amber)", "no-beat": "var(--bz-line)" };

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dowOf = (iso: string) => DOW[new Date(`${iso}T00:00:00Z`).getUTCDay()];

function greeting() {
  const h = Number(SF_NOW.slice(0, 2));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function HomePage() {
  const hub = useStore(hubStore);
  const ledger = useStore(ledgerStore);
  const reps = useStore(repsStore);
  const customers = useStore(customersStore);
  const schemes = useStore(schemesStore);
  const targets = useStore(targetsStore);
  const types = useStore(typesStore);
  useStore(visitsStore);
  useStore(planStore);
  useStore(locationsStore);
  const waiting = useWaiting();
  const queue = useQueue().flatMap((g) => g.items);
  const guideHidden = useStore(guideHiddenStore);
  const steps = useSteps();
  const guide = !steps.every((s) => s.done) && !guideHidden;

  // ── Sales by day ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const live = React.useMemo(() => hub.filter((o) => o.status !== "rejected").map((o) => ({ o, total: orderTotal(o), day: o.at.slice(0, 10) })), [hub, ledger, schemes]);
  const on = (d: string) => live.filter((x) => x.day === d);
  const sum = (rows: { total: number }[]) => rows.reduce((s, x) => s + x.total, 0);
  const today = on(SF_TODAY);
  const todayValue = sum(today);
  const yesterdayValue = sum(on(addDays(SF_TODAY, -1)));
  const week = Array.from({ length: 7 }, (_, i) => addDays(SF_TODAY, i - 6));
  const thisWeek = week.map((d) => sum(on(d)));
  const lastWeek = week.map((d) => sum(on(addDays(d, -7))));

  // ── The field ──
  const days = reps.map((r) => repDay(r));
  const out = days.filter((d) => d.visits.length > 0).length;
  const planned = days.reduce((s, d) => s + d.planned, 0);
  const visited = days.reduce((s, d) => s + d.visited, 0);

  // ── The month ──
  const month = live.filter((x) => x.o.at.startsWith(THIS_MONTH) && x.o.status === "approved");
  const monthSales = sum(month);
  const monthTarget = targets.filter((t) => t.month === THIS_MONTH).reduce((s, t) => s + t.salesTarget, 0);


  // ── Where the orders came from, and which customer types bought — over 30 days, so the first of a month is not a blank ──
  const since = addDays(SF_TODAY, -29);
  const recent = live.filter((x) => x.day >= since);
  const recentSales = sum(recent);
  const sources = (Object.keys(SOURCE_LABEL) as Source[]).map((src) => ({ src, rows: recent.filter((x) => x.o.source === src) })).filter((x) => x.rows.length);
  const byType = new Map<string, number>();
  for (const x of recent) {
    const typeId = customerById(x.o.customerId)?.typeId;
    if (typeId) byType.set(typeId, (byType.get(typeId) ?? 0) + x.total);
  }
  const typeSales = types
    .map((t) => ({ name: t.plural || t.name, value: byType.get(t.id) ?? 0 }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // ── Live offers: how much of the budget is used, or — with no budget — how far through its dates it is ──
  const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
  const offers = schemes
    .filter((x) => x.status === "live")
    .map((x) => {
      const left = daysBetween(SF_TODAY, x.to);
      if (x.budget && x.budget.total > 0) {
        const used = Math.round((x.budget.used / x.budget.total) * 100);
        return { s: x, pct: used, ink: (used >= 85 ? "red" : used >= 60 ? "amber" : "accent") as Ink, text: `${used}% used`, danger: used >= 85 };
      }
      const span = Math.max(1, daysBetween(x.from, x.to));
      return { s: x, pct: Math.max(0, Math.min(100, Math.round((daysBetween(x.from, SF_TODAY) / span) * 100))), ink: "soft" as Ink, text: left >= 0 ? `${left} d left` : "ended", danger: false };
    })
    .sort((a, b) => Number(b.danger) - Number(a.danger) || b.pct - a.pct)
    .slice(0, 5);

  // ── The map: each rep where they were last seen today, and the shops on today's beats ──
  const points: MapPoint[] = [];
  const seen = new Set<string>();
  for (const d of days) {
    for (const s of d.stops) {
      const c = customerById(s.customerId);
      if (!c?.location || seen.has(c.id)) continue;
      seen.add(c.id);
      points.push({ key: `c:${c.id}`, lat: c.location.lat, lng: c.location.lng, node: <MapDot ink={s.status === "skipped" ? "soft" : "accent"} hollow={s.status === "to-visit"} size={8} title={`${c.name} · ${s.status === "to-visit" ? "to visit" : s.status}`} /> });
    }
  }
  if (!points.length) for (const c of customers) if (c.location) points.push({ key: `c:${c.id}`, lat: c.location.lat, lng: c.location.lng, node: <MapDot ink="accent" hollow size={8} title={c.name} /> });
  for (const d of days) {
    const p = lastPing(d.rep.id, SF_TODAY);
    if (!p) continue;
    const at = d.current ? customerById(d.current.customerId)?.name : null;
    points.push({
      key: `r:${d.rep.id}`,
      lat: p.lat,
      lng: p.lng,
      z: 5,
      node: (
        <Link to={sfPath(`today/${d.rep.id}`)} title={`${d.rep.name} · ${at ? `at ${at}` : DAY_STATUS[d.status].label} · seen ${p.at.slice(11, 16)}`} className="block">
          <span className="block rounded-bz-pill p-[2px]" style={{ boxShadow: `0 0 0 2px ${DAY_RING[d.status]}` }}>
            <Who name={d.rep.name} size={26} />
          </span>
        </Link>
      ),
    });
  }

  const first = ME.name.split(" ")[0];

  return (
    <SfShell
      current="today"
      title={`${greeting()}, ${first}`}
      actions={
        <>
          <span className={cn(HEAD_BTN, "pointer-events-none")}>
            <CalendarDays size={14} className="text-bz-text-muted" />
            {shortDay(SF_TODAY)}
          </span>
          <Link to="/design/rep" className={HEAD_BTN}>
            <Smartphone size={14} className="text-bz-text-muted" />
            Rep app
          </Link>
          <Link to="/design/dealer" className={HEAD_BTN}>
            <Store size={14} className="text-bz-text-muted" />
            Dealer portal
          </Link>
        </>
      }
    >
      <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
        <div className="grid grid-cols-1 gap-3">
          {/* ── Four figures ── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={ShoppingBag} label="Orders today" unit="NPR" value={short(todayValue)} extra={<Spark values={thisWeek} />} delta={deltaOf(todayValue, yesterdayValue, "vs yesterday")} note={today.length ? plural(today.length, "order") : "none yet"} to={sfPath("orders")} />
            <Kpi icon={Inbox} label="To decide" value={waiting.inbox.n} danger={waiting.inbox.danger} note={waiting.orders.n ? `${plural(waiting.orders.n, "order")} to review` : waiting.inbox.n ? "nothing urgent" : "all clear"} to={sfPath("inbox")} />
            <Kpi
              icon={Footprints}
              label="In the field"
              value={`${out}/${reps.length}`}
              extra={
                days.length > 0 && (
                  <span className="flex items-center">
                    {days.slice(0, 5).map((d) => (
                      <span key={d.rep.id} title={`${d.rep.name} · ${DAY_STATUS[d.status].label}`} className="-ml-1.5 rounded-bz-pill p-[1.5px] first:ml-0" style={{ background: "var(--bz-surface)", boxShadow: `inset 0 0 0 1.5px ${DAY_RING[d.status]}` }}>
                        <Who name={d.rep.name} size={22} />
                      </span>
                    ))}
                    {days.length > 5 && <span className={cn("ml-1.5 text-[11px] text-bz-text-soft", NUM)}>+{days.length - 5}</span>}
                  </span>
                )
              }
              note={planned ? `${visited} of ${plural(planned, "visit")}` : "no beats today"} to={sfPath("today")} />
            <Kpi icon={Target} label="This month" unit="NPR" value={short(monthSales)} extra={monthTarget > 0 && <TickBar pct={pct(monthSales, monthTarget)} ink="accent" ticks={18} className="w-24" />} note={monthTarget ? `${pct(monthSales, monthTarget)}% of ${short(monthTarget)}` : "no target set"} to={sfPath("targets")} />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]">
            {/* ── The field ── */}
            <Panel title="The field now" icon={MapPinned} to={sfPath("today")} flush>
              <div className="px-3">
                <MapCanvas points={points} className="h-[300px] rounded-[10px] border border-bz-line-soft" focusKey={String(points.length)} pad={56} />
              </div>
              {days.length > 0 ? (
                <div className="flex gap-1 overflow-x-auto px-3 pb-3 pt-3 [scrollbar-width:none]">
                  {[...days]
                    .sort((a, b) => b.planned - a.planned || b.orderValue - a.orderValue)
                    .slice(0, 6)
                    .map((d) => (
                      <Link key={d.rep.id} to={sfPath(`today/${d.rep.id}`)} className="flex w-[124px] shrink-0 flex-col items-center rounded-[10px] px-2 pb-1.5 pt-2 transition-colors hover:bg-bz-paper-warm" title={`${d.rep.name} · ${DAY_STATUS[d.status].label}${d.planned ? ` · ${d.visited} of ${d.planned} visits` : ""}`}>
                        <Gauge pct={d.planned ? pct(d.visited, d.planned) : 0} ink={d.status === "not-started" ? "amber" : "accent"} label={d.planned ? `${d.visited}/${d.planned}` : "—"} />
                        <span className="mt-1.5 flex w-full items-baseline justify-between gap-2">
                          <span className="min-w-0 truncate text-[11.5px] text-bz-text-muted">{d.rep.name.split(" ")[0]}</span>
                          <span className={cn("shrink-0 text-[11.5px] font-semibold text-bz-text", NUM)}>{d.orderValue ? short(d.orderValue) : "—"}</span>
                        </span>
                      </Link>
                    ))}
                </div>
              ) : (
                <p className="m-0 px-4 py-4 text-[12px] text-bz-text-soft">No reps yet.</p>
              )}
            </Panel>

            <div className="grid min-w-0 grid-cols-1 gap-3">
              {/* ── The week ── */}
              <Panel
                title="Sales, last 7 days"
                to={sfPath("insights")}
                right={
                  <Legend
                    items={[
                      { name: "This week", ink: "accent" },
                      { name: "Last week", ink: "soft" },
                    ]}
                    className="mr-1 hidden sm:flex"
                  />
                }
              >
                <Bars
                  labels={week.map(dowOf)}
                  current={6}
                  height={150}
                  series={[
                    { name: "Last week", ink: "soft", values: lastWeek },
                    { name: "This week", ink: "accent", values: thisWeek },
                  ]}
                />
              </Panel>

              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <Panel title="Where orders come from" to={sfPath("orders")} right={<span className="mr-1 text-[11px] text-bz-text-soft">30 days</span>}>
                  <div className="flex items-center gap-4">
                    <Ring parts={sources.map((x) => ({ name: SOURCE_LABEL[x.src], value: sum(x.rows), ink: SOURCE_INK[x.src] }))} size={116}>
                      <span className={cn("text-[20px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>{recent.length}</span>
                      <span className="mt-1 text-[10.5px] text-bz-text-soft">orders</span>
                    </Ring>
                    <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2 p-0">
                      {sources.length === 0 && <li className="text-[12px] text-bz-text-soft">No orders yet.</li>}
                      {sources.map((x) => (
                        <li key={x.src} className="flex items-center gap-2 text-[12px]">
                          <span className="size-1.5 shrink-0 rounded-bz-pill" style={{ background: inkOf(SOURCE_INK[x.src]) }} />
                          <span className="min-w-0 flex-1 truncate text-bz-text-muted">{SOURCE_LABEL[x.src]}</span>
                          <span className={cn("font-semibold text-bz-text", NUM)}>{recentSales ? Math.round((sum(x.rows) / recentSales) * 100) : 0}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Panel>
                <Panel title="Sales by customer type" to={sfPath("customers")} right={<span className="mr-1 text-[11px] text-bz-text-soft">30 days</span>}>
                  {typeSales.length ? <Columns items={typeSales} height={104} /> : <p className="m-0 text-[12px] text-bz-text-soft">No sales yet.</p>}
                </Panel>
              </div>
            </div>
          </div>

          <div className={cn("grid grid-cols-1 gap-3", guide ? "xl:grid-cols-3" : "xl:grid-cols-2")}>
            {/* ── What waits ── */}
            <Panel title="To decide" icon={Inbox} to={sfPath("inbox")} flush right={queue.length ? <span className={cn("mr-1 text-[11px] text-bz-text-soft", NUM)}>{queue.length}</span> : undefined}>
              {queue.length === 0 ? (
                <p className="m-0 flex items-center gap-2 px-4 pb-4 text-[12px] text-bz-text-soft">
                  <Check size={13} /> Nothing is waiting.
                </p>
              ) : (
                <ul className="m-0 list-none p-0">
                  {queue.slice(0, 5).map((i) => (
                    <li key={i.key}>
                      <Link to={`${sfPath("inbox")}?open=${encodeURIComponent(i.key)}`} className="group flex items-center gap-3 border-t border-bz-line-soft px-4 py-2.5 transition-colors hover:bg-bz-paper-warm">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-bz-text">{i.title}</span>
                          <span className={cn("block truncate text-[11px]", i.danger ? "text-bz-red" : "text-bz-text-soft")}>{i.sub}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          {i.amount !== undefined && <Amount value={i.amount} className="block text-[13px] font-semibold text-bz-text" />}
                          <span className={cn("block text-[11px] text-bz-text-soft", NUM)}>{waited(i.when)}</span>
                        </span>
                        <ArrowUpRight size={14} className="shrink-0 text-bz-text-soft transition-colors group-hover:text-bz-text" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* ── Live offers ── */}
            <Panel title="Live offers" to={sfPath("schemes")} right={offers.length ? <span className={cn("mr-1 text-[11px] text-bz-text-soft", NUM)}>{schemes.filter((x) => x.status === "live").length}</span> : undefined}>
              {offers.length === 0 ? (
                <p className="m-0 text-[12px] text-bz-text-soft">No offer is live.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
                  {offers.map((o) => (
                    <li key={o.s.id}>
                      <Link to={sfPath(`schemes/${o.s.id}`)} className="group grid grid-cols-[minmax(0,1fr)_minmax(80px,34%)_64px] items-center gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] text-bz-text group-hover:underline group-hover:underline-offset-2">{o.s.name}</span>
                          <span className="block truncate text-[11px] text-bz-text-soft">{ruleText(o.s.mechanic)}</span>
                        </span>
                        <TickBar pct={o.pct} ink={o.ink} ticks={24} />
                        <span className={cn("whitespace-nowrap text-right text-[11.5px] font-semibold", o.danger ? "text-bz-red" : "text-bz-text", NUM)}>{o.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {guide && <GettingStarted steps={steps} onHide={() => guideHiddenStore.set(() => true)} />}
          </div>
        </div>
      </div>
    </SfShell>
  );
}
