import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Dialog, Field, GHOST, NUM, Popover, Refusal, Select, ToastHost, useToast } from "../sales/bzw";
import { useMedia } from "../sales/orders";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Customer, PlanEntry, Rep, Route, RoutePlan, Visit } from "./data";
import { customerById, day as dayMonth, typeOf } from "./engine";
import { DAYS, EVERY_LABEL, EVERY_SHORT, TODAY_DAY, addDays, dateOfDay, dayLabel, dueOn, outcomeOf, repArea, repCustomers, visitsIn4w, weekNo } from "./field-data";
import { useFieldStores } from "./field-kit";
import { PANEL, PANEL_TITLE, Panel, PillTabs, TickBar, inkOf } from "./fx";
import { FxEmpty } from "./fx-table";
import { Picker } from "./network-form";
import { openQuickAdd } from "./quickadd";
import { addStop, coverageGaps, givePlan, movePlan, planRoute, plannedText, plansOfRep, plansOfRoute, removeStop, restorePlan, routeName, unplanRoute } from "./routes";
import { SfShell, TypeMark, Who, idColor, sfPath } from "./sf";
import { routePlanStore, routesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// FIELD · PLAN — one rep's week as a board of routes, with who is left out
//
// The plan is routes on days (owner decision #28): a route is a named, ordered
// group of customers, and a plan gives it to a rep on a weekday. So a day
// column holds route cards, each with its customers in visit order; moving a
// card to another day, or handing it to another rep, moves all of them at
// once. A day that has come says what came of each stop. Beside the board: the
// customers nobody is planned to visit often enough, and the week's load by
// day. Every write goes through `routes.ts`; this page keeps no rule of its own.
// ════════════════════════════════════════════════════════════════════════════

const r1 = (n: number) => Math.round(n * 10) / 10;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const firstOf = (name: string) => name.split(" ")[0];
/** An open route card shows its first stops; the rest are behind "+n more". */
const PEEK = 3;
/** A route card is shut (its header only), open to its first stops, or showing every stop. */
type Fold = "closed" | "peek" | "all";

type Adding = { day?: number; routeId?: string };
type When = "past" | "today" | "future";
/** One stop of a planned route: its derived entry, whether its cadence falls in the week shown, and what came of it. */
type StopRow = { e: PlanEntry; c: Customer | undefined; due: boolean; visit: Visit | null; missed: boolean };
/** One route on one weekday: the plan, its route, its stops in visit order, and how many are due in the week shown. */
type RouteCard = { plan: RoutePlan; route: Route | undefined; stops: StopRow[]; due: number };
type DayCol = { n: number; short: string; label: string; date: string; when: When; cards: RouteCard[]; unplanned: Visit[]; planned: number; visited: number; recorded: boolean };
type Drag = { id: string; name: string; from: number; x: number; y: number; over: number | null };

const RING = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire";
const WASH = "bg-[color-mix(in_srgb,var(--fx-accent)_12%,transparent)]";
/** Today's column: the accent, barely there — opaque, so the day head can stay put over the cards. */
const TODAY_BG = "bg-[color-mix(in_srgb,var(--fx-accent)_7%,var(--bz-surface))]";
const WARM = "bg-[color-mix(in_srgb,var(--bz-paper-warm)_50%,var(--bz-surface))]";
const WARM_HOVER = "hover:bg-[color-mix(in_srgb,var(--bz-paper-warm)_50%,var(--bz-surface))]";
const COUNT = cn("mr-1.5 text-[11px] text-bz-text-soft", NUM);
const VERB = "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text transition-colors hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire";
const MENU_ROW = cn("flex h-9 w-full items-center gap-2.5 rounded-bz-md px-2.5 text-left text-[13px] transition-colors hover:bg-bz-paper-warm", RING);
const MENU_LABEL = "m-0 px-2.5 pb-1 pt-1.5 text-[11.5px] text-bz-text-soft";
const AMBER_WORD = "ml-auto shrink-0 pl-1 text-[11px] font-medium text-bz-amber-ink";
const CARD_BTN = cn("flex shrink-0 items-center justify-center rounded-[6px] text-bz-text-soft transition-colors hover:bg-bz-paper-warm hover:text-bz-text", RING);
/** The line that joins a route's stops, drawn one row at a time. */
const RAIL = "pointer-events-none absolute left-[14px] w-0 border-l border-bz-line";

// ── Dragging a route to another day (a mouse shortcut for "Move to") ────────

/**
 * A route card dragged by its header follows the pointer; let go over another day's column and the route moves there.
 * Touch keeps the menu: a finger on the board is a scroll. `moved` is true for the click that ends a drag, so it opens nothing.
 */
function useDayDrag(drop: (planId: string, day: number) => void) {
  const [drag, setDrag] = React.useState<Drag | null>(null);
  const moved = React.useRef(false);
  const live = React.useRef(drop);
  live.current = drop;
  const start = (ev: React.PointerEvent<HTMLElement>, p: RoutePlan, name: string) => {
    if (ev.pointerType !== "mouse" || ev.button !== 0) return;
    const from = { x: ev.clientX, y: ev.clientY };
    let on = false;
    let over: number | null = null;
    const dayAt = (x: number, y: number) => Number(document.elementFromPoint(x, y)?.closest("[data-plan-day]")?.getAttribute("data-plan-day")) || null;
    const move = (m: PointerEvent) => {
      if (!on && Math.hypot(m.clientX - from.x, m.clientY - from.y) < 6) return;
      on = true;
      over = dayAt(m.clientX, m.clientY);
      setDrag({ id: p.id, name, from: p.day, x: m.clientX, y: m.clientY, over });
    };
    const end = (commit: boolean) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", key, true);
      if (!on) return;
      moved.current = true;
      window.setTimeout(() => (moved.current = false), 0);
      setDrag(null);
      if (commit && over && over !== p.day) live.current(p.id, over);
    };
    const up = () => end(true);
    const cancel = () => end(false);
    const key = (k: KeyboardEvent) => {
      if (k.key !== "Escape" || !on) return;
      k.stopPropagation();
      end(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", key, true);
  };
  return { drag, start, moved };
}

// ── The page ────────────────────────────────────────────────────────────────

export function PlanPage() {
  const { repId } = useParams();
  const navigate = useNavigate();
  const s = useFieldStores();
  const routes = useStore(routesStore);
  // The helpers below read the plan with `.get()`; this keeps the page in step with it.
  useStore(routePlanStore);
  // Six columns cannot survive a phone: below 640px the board is one day at a time.
  const board = useMedia("(min-width: 640px)");
  const { toast, show, dismiss } = useToast();
  const rep = s.reps.find((r) => r.id === repId) ?? s.reps[0];
  const [adding, setAdding] = React.useState<Adding | null>(null);
  const [week, setWeek] = React.useState(0);
  const [dayPick, setDayPick] = React.useState<number>(TODAY_DAY <= 6 ? TODAY_DAY : 1);
  /** The cards the reader opened or folded by hand, by plan id; the rest follow the rule in `isOpen`. */
  const [folds, setFolds] = React.useState<Record<string, Fold>>({});
  const newRep = () => openQuickAdd("rep", { onCreated: (id) => navigate(sfPath(`plan/${id}`)) });
  const move = (planId: string, day: number) => {
    const no = movePlan(planId, day);
    if (no) show("error", no);
  };
  const { drag, start, moved } = useDayDrag(move);

  if (!rep) {
    return (
      <SfShell current="plan">
        <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
          <Panel flush>
            <FxEmpty title="No reps yet.">
              <button type="button" className={BTN} onClick={newRep}>
                <Plus size={14} /> New rep
              </button>
            </FxEmpty>
          </Panel>
        </div>
      </SfShell>
    );
  }

  const first = firstOf(rep.name);
  const plans = plansOfRep(rep.id);
  const entries = s.plan.filter((e) => e.repId === rep.id);
  const pool = repCustomers(rep);
  /** The customers this rep can visit whose type asks for visits — what "covered" is counted against. */
  const asking = pool.filter((c) => typeOf(c).visitsPer4w > 0);
  const gaps = coverageGaps(pool);
  const covered = asking.length - gaps.length;
  const asked4w = asking.reduce((n, c) => n + typeOf(c).visitsPer4w, 0);
  const planned4w = visitsIn4w(entries);
  const kinds = { none: gaps.filter((g) => g.kind === "no-route").length, idle: gaps.filter((g) => g.kind === "not-planned").length, short: gaps.filter((g) => g.kind === "short").length };
  const mine = new Set(plans.map((p) => p.routeId));

  const weekOf = addDays(SF_TODAY, week * 7);
  const thisWeek = week === 0;

  const cols: DayCol[] = DAYS.map((d) => {
    const date = dateOfDay(weekOf, d.n);
    const when: When = date < SF_TODAY ? "past" : date === SF_TODAY ? "today" : "future";
    const visits = when === "future" ? [] : s.visits.filter((v) => v.repId === rep.id && v.date === date);
    const latest = (customerId: string) => [...visits].reverse().find((v) => v.customerId === customerId) ?? null;
    const cards = plans
      .filter((p) => p.day === d.n)
      .map((plan): RouteCard => {
        // The derived entries keep the route's own order, which is the order the rep walks it.
        const stops = entries
          .filter((e) => e.planId === plan.id)
          .map((e): StopRow => {
            const due = dueOn(e, date);
            const visit = latest(e.customerId);
            // "Missed" is said only of a day the rep was out on, and never of a week before the stop was planned.
            const missed = !visit && due && when === "past" && visits.length > 0 && weekNo(date) >= (s.planStart[e.id] ?? -Infinity);
            return { e, c: customerById(e.customerId), due, visit, missed };
          });
        return { plan, route: routes.find((r) => r.id === plan.routeId), stops, due: stops.filter((x) => x.due).length };
      });
    const all = cards.flatMap((k) => k.stops);
    const onDay = new Set(all.map((x) => x.e.customerId));
    // A customer on two of the day's routes is one visit.
    const dueIds = new Set(all.filter((x) => x.due).map((x) => x.e.customerId));
    const unplanned = Array.from(new Set(visits.filter((v) => !onDay.has(v.customerId)).map((v) => v.customerId))).map((id) => latest(id)!);
    return { ...d, date, when, cards, unplanned, planned: dueIds.size, visited: [...dueIds].filter((id) => latest(id)?.state === "done").length, recorded: visits.length > 0 };
  });
  const heaviest = Math.max(0, ...cols.map((c) => c.planned));

  const openAdd = (preset: Adding = {}) => setAdding(board ? preset : { day: dayPick, ...preset });
  const hand = (plan: RoutePlan, to: Rep) => {
    const no = givePlan(plan.id, to.id);
    if (no) return show("error", no);
    show("success", `${routeName(plan.routeId)} handed to ${to.name}.`, {
      label: "Undo",
      run: () => {
        const back = givePlan(plan.id, plan.repId);
        // The toast closes itself after its action; a refusal is said once it has.
        if (back) window.setTimeout(() => show("error", back), 0);
      },
    });
  };
  const takeOff = (plan: RoutePlan) => {
    const gone = unplanRoute(plan.id);
    if (gone) show("info", `${routeName(gone.routeId)} taken off ${dayLabel(gone.day)}.`, { label: "Undo", run: () => restorePlan(gone) });
  };
  const putOnRoute = (c: Customer, routeId: string) => {
    const no = addStop(routeId, c.id);
    if (no) return show("error", no);
    show("success", `${c.name} is on ${routeName(routeId)}.`, { label: "Undo", run: () => removeStop(routeId, c.id) });
  };
  const added = (plan: RoutePlan) => {
    if (plan.repId === rep.id) return setDayPick(plan.day);
    const to = s.reps.find((r) => r.id === plan.repId);
    show("success", `${routeName(plan.routeId)} is on ${to ? `${firstOf(to.name)}'s ` : ""}${dayLabel(plan.day)}.`, { label: "Show", run: () => navigate(sfPath(`plan/${plan.repId}`)) });
  };

  const column = (col: DayCol, single?: boolean) => (
    <DayColumn key={col.n} col={col} single={single} over={!!drag && drag.over === col.n && drag.from !== col.n} onAdd={() => setAdding({ day: col.n })}>
      {col.cards.map((card) => {
        // A card starts open to its first stops. On a phone it is its header until tapped — unless it is the day's
        // only route, where shutting it would hide the whole day.
        const fold: Fold = folds[card.plan.id] ?? (single && col.cards.length > 1 ? "closed" : "peek");
        return (
          <RouteCardView
            key={card.plan.id}
            card={card}
            reps={s.reps}
            thisWeek={thisWeek}
            phone={single}
            fold={fold}
            onFold={(to) => setFolds((f) => ({ ...f, [card.plan.id]: to }))}
            dragging={drag?.id === card.plan.id}
            onGrab={single ? undefined : start}
            moved={moved}
            onMove={(day) => move(card.plan.id, day)}
            onHand={(to) => hand(card.plan, to)}
            onTakeOff={() => takeOff(card.plan)}
          />
        );
      })}
      {col.unplanned.map((v) => (
        <UnplannedCard key={v.id} v={v} />
      ))}
    </DayColumn>
  );

  return (
    <SfShell
      current="plan"
      meta={
        <>
          <Meta label="Routes" value={plans.length} title={`Routes on ${first}'s week, one for each day it runs`} />
          <Meta dot label="Customers covered" value={`${covered} of ${asking.length}`} title={`Planned as often as their type asks, of the customers ${first} owns or has on a route`} />
          {gaps.length > 0 && <Meta dot warn label="Not covered" value={gaps.length} title={`${kinds.none} on no route · ${kinds.idle} on a route nobody runs · ${kinds.short} planned less often than their type asks`} />}
        </>
      }
      actions={
        <>
          <WeekStepper label={thisWeek ? "This week" : `${dayMonth(dateOfDay(weekOf, 1))} – ${dayMonth(dateOfDay(weekOf, 6))}`} thisWeek={thisWeek} onStep={(by) => setWeek((w) => w + by)} onReset={() => setWeek(0)} />
          <button type="button" className={BTN} onClick={() => openAdd()}>
            <Plus size={14} /> Add to plan
          </button>
        </>
      }
    >
      <div className={cn("h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6 xl:overflow-hidden xl:pb-5", drag && "select-none")}>
        <div className="grid grid-cols-1 gap-3 xl:h-full xl:grid-cols-[minmax(0,1fr)_320px] xl:grid-rows-[minmax(0,1fr)]">
          {/* ── The week ── */}
          <section aria-label={`${rep.name}'s week`} className={cn(PANEL, "flex min-h-0 min-w-0 flex-col overflow-hidden")}>
            <RepFaces reps={s.reps} current={rep.id} countOf={(r) => plansOfRep(r.id).length} onPick={(id) => navigate(sfPath(`plan/${id}`))} onNew={newRep} />
            {board ? (
              <div className="min-h-0 flex-1 overflow-auto [scrollbar-width:thin] max-xl:max-h-[70vh]">
                <div className="grid min-h-full min-w-[840px] grid-cols-6 px-1.5 pb-1.5 lg:min-w-0">{cols.map((col) => column(col))}</div>
              </div>
            ) : (
              <>
                <div className="px-3 pb-1 pt-3">
                  <PillTabs value={String(dayPick)} onChange={(v) => setDayPick(Number(v))} options={DAYS.map((d) => ({ value: String(d.n), label: d.short, title: d.label }))} />
                </div>
                {column(cols.find((c) => c.n === dayPick) ?? cols[0], true)}
              </>
            )}
          </section>

          <div className="grid min-h-0 min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:flex xl:flex-col xl:overflow-y-auto xl:[scrollbar-width:none]">
            {/* ── Who is left out ── */}
            <section className={cn(PANEL, "flex min-w-0 flex-col overflow-hidden xl:min-h-[220px] xl:flex-1")}>
              <header className="flex min-h-[46px] shrink-0 items-center gap-2 pl-4 pr-2.5">
                <h2 className={cn(PANEL_TITLE, "min-w-0 flex-1 truncate")}>Not covered</h2>
                {gaps.length > 0 && <span className={COUNT}>{gaps.length}</span>}
              </header>
              {pool.length === 0 ? (
                <div className="px-4 pb-4">
                  <p className="m-0 mb-3 text-[12px] text-bz-text-soft">{rep.name} has no customers yet.</p>
                  <button type="button" className={VERB} onClick={() => openAdd()}>
                    Give {first} a route
                  </button>
                </div>
              ) : gaps.length === 0 ? (
                <p className="m-0 flex items-center gap-2 px-4 pb-4 text-[12px] text-bz-text-soft">
                  {asking.length > 0 && <Check size={13} className="shrink-0" />}
                  {asking.length > 0 ? "Every customer is planned as often as its type asks." : `None of ${first}'s customers ask for visits.`}
                </p>
              ) : (
                <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-0 [scrollbar-width:thin] max-xl:max-h-[416px]">
                  {gaps.map((g) => {
                    const c = g.customer;
                    const t = typeOf(c);
                    const r: Route | undefined = g.routes[0];
                    return (
                      <li key={c.id} className="flex min-h-[52px] items-center gap-3 border-t border-bz-line-soft px-4 py-2" title={`${c.city ? `${c.city} · ` : ""}${r1(g.planned)} of ${g.asked} visits in 4 weeks`}>
                        <span className="min-w-0 flex-1">
                          <Link to={sfPath(`customers/${c.id}`)} className="block truncate text-[13px] text-bz-text underline-offset-2 hover:underline">
                            {c.name}
                          </Link>
                          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11.5px] text-bz-text-soft">
                            <TypeMark name={t.name} color={t.color} />
                            <span aria-hidden>·</span>
                            <span className={cn("min-w-0 truncate", g.kind !== "short" && "text-bz-amber-ink", NUM)} title={g.kind === "not-planned" && r ? `${r.name} is on nobody's week` : undefined}>
                              {g.kind === "no-route" ? "on no route" : g.kind === "not-planned" ? `not planned: ${r?.name ?? "its route"}` : `needs ${r1(g.asked - g.planned)} more`}
                            </span>
                          </span>
                        </span>
                        {g.kind === "no-route" ? (
                          <RoutePick customer={c} routes={routes} mine={mine} first={first} onPick={(id) => putOnRoute(c, id)} />
                        ) : g.kind === "not-planned" ? (
                          <button type="button" className={VERB} aria-label={`Plan ${r?.name ?? "the route"}`} onClick={() => openAdd({ routeId: r?.id })}>
                            Plan route
                          </button>
                        ) : (
                          r && (
                            <Link to={sfPath(`routes/${r.id}`)} title={`Open ${r.name}`} className="max-w-[116px] shrink-0 truncate text-[12px] font-medium text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline">
                              {r.name}
                            </Link>
                          )
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* ── The load ── */}
            <Panel title={`${first}'s week`} right={<span className={COUNT}>{thisWeek ? "this week" : `week of ${dayMonth(dateOfDay(weekOf, 1))}`}</span>} className="xl:shrink-0">
              {plans.length === 0 ? (
                <>
                  <p className="m-0 mb-3 text-[12px] text-bz-text-soft">{rep.name} has no routes yet.</p>
                  <button type="button" className={VERB} onClick={() => openAdd()}>
                    Add to plan
                  </button>
                </>
              ) : (
                <>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {cols.map((col) => (
                      <li key={col.n} className="grid grid-cols-[30px_minmax(0,1fr)_18px] items-center gap-3 text-[12px]" title={`${col.label} · ${plural(col.planned, "customer")} due`}>
                        <span className={col.when === "today" ? "font-semibold text-bz-text" : "text-bz-text-muted"}>{col.short}</span>
                        <TickBar pct={heaviest ? (col.planned / heaviest) * 100 : 0} ink="accent" ticks={22} />
                        <span className={cn("text-right", col.planned ? "font-semibold text-bz-text" : "text-bz-text-soft", NUM)}>{col.planned}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t border-bz-line-soft pt-3.5">
                    <p className="m-0 flex items-baseline justify-between gap-3 text-[12px]" title={`On ${first}'s routes, of what the customer types ask`}>
                      <span className="text-bz-text-muted">Visits in 4 weeks</span>
                      <span className={cn("font-semibold text-bz-text", NUM)}>
                        {Math.round(planned4w)} <span className="font-normal text-bz-text-soft">of {asked4w}</span>
                      </span>
                    </p>
                    <TickBar pct={asked4w ? (planned4w / asked4w) * 100 : 0} ink={planned4w + 0.01 >= asked4w ? "accent" : "amber"} ticks={32} className="mt-2" />
                    <p className="m-0 mt-3 flex items-baseline justify-between gap-3 text-[12px]" title="Planned as often as their type asks">
                      <span className="text-bz-text-muted">Customers covered</span>
                      <span className={cn("font-semibold text-bz-text", NUM)}>
                        {covered} <span className="font-normal text-bz-text-soft">of {asking.length}</span>
                      </span>
                    </p>
                  </div>
                </>
              )}
            </Panel>
          </div>
        </div>
      </div>

      {drag && (
        <div aria-hidden className="pointer-events-none fixed z-[1090] flex max-w-[240px] -translate-x-1/2 -translate-y-[calc(100%+10px)] items-center gap-2 rounded-[10px] border border-bz-line bg-bz-surface px-2.5 py-2 text-[13px] font-semibold text-bz-text shadow-[var(--bz-shadow-panel)]" style={{ left: drag.x, top: drag.y }}>
          <span className="min-w-0 truncate">{drag.name}</span>
          {drag.over && drag.over !== drag.from && <span className="shrink-0 text-[11.5px] font-normal text-bz-text-soft">to {dayLabel(drag.over)}</span>}
        </div>
      )}
      {adding && <AddDialog rep={rep} reps={s.reps} routes={routes} preset={adding} onClose={() => setAdding(null)} onAdded={added} onNewRoute={() => navigate(sfPath("routes/new"))} />}
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SfShell>
  );
}

// ── The head ────────────────────────────────────────────────────────────────

/** One figure on the page head's quiet line. */
function Meta({ label, value, title, dot, warn }: { label: string; value: React.ReactNode; title?: string; dot?: boolean; warn?: boolean }) {
  return (
    <span title={title} className="inline-flex items-center gap-1.5 whitespace-nowrap max-md:hidden">
      {dot && <span aria-hidden className="mr-1.5 size-[3px] rounded-bz-pill bg-bz-line" />}
      <span className={warn ? "text-bz-amber-ink" : "text-bz-text-soft"}>{label}</span>
      <span className={cn("font-semibold", warn ? "text-bz-amber-ink" : "text-bz-text")}>{value}</span>
    </span>
  );
}

/** Which week the board shows. It changes the dates and which stops are due; it creates nothing. */
function WeekStepper({ label, thisWeek, onStep, onReset }: { label: string; thisWeek: boolean; onStep: (by: 1 | -1) => void; onReset: () => void }) {
  const ARROW = cn("flex h-full w-8 items-center justify-center text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text", RING);
  return (
    <div className="inline-flex h-9 shrink-0 items-stretch overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
      <button type="button" className={ARROW} onClick={() => onStep(-1)} title="Previous week" aria-label="Previous week">
        <ChevronLeft size={15} />
      </button>
      <button type="button" onClick={onReset} title={thisWeek ? undefined : "Back to this week"} className={cn("min-w-[104px] px-1.5 text-center text-[12.5px] font-medium text-bz-text transition-colors hover:bg-bz-paper-warm", RING, NUM)}>
        {label}
      </button>
      <button type="button" className={ARROW} onClick={() => onStep(1)} title="Next week" aria-label="Next week">
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ── The board ───────────────────────────────────────────────────────────────

/** Whose week this is: the reps as faces, each with the routes on its week. The picked one carries the wash and the accent edge. */
function RepFaces({ reps, current, countOf, onPick, onNew }: { reps: Rep[]; current: string; countOf: (r: Rep) => number; onPick: (id: string) => void; onNew: () => void }) {
  const picked = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    picked.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [current]);
  // Two reps who share a first name are told apart by the whole of it.
  const firsts = reps.map((r) => firstOf(r.name));
  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-bz-line-soft px-2 py-2 [scrollbar-width:none]">
      {reps.map((r) => {
        const on = r.id === current;
        const n = countOf(r);
        const f = firstOf(r.name);
        return (
          <button
            key={r.id}
            ref={on ? picked : undefined}
            type="button"
            onClick={() => onPick(r.id)}
            aria-pressed={on}
            title={`${r.name} · ${r.role} · ${repArea(r)}`}
            className={cn("relative flex shrink-0 items-center gap-2.5 overflow-hidden rounded-[10px] py-1.5 pl-3 pr-3.5 text-left transition-colors", RING, on ? WASH : "hover:bg-bz-paper-warm")}
          >
            {on && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-[var(--fx-accent)]" />}
            <Who name={r.name} size={32} />
            <span className="min-w-0">
              <span className={cn("block whitespace-nowrap text-[13px] text-bz-text", on ? "font-semibold" : "font-medium")}>{firsts.filter((x) => x === f).length > 1 ? r.name : f}</span>
              <span className={cn("block whitespace-nowrap text-[11.5px] text-bz-text-soft", NUM)}>{n ? plural(n, "route") : "No routes"}</span>
            </span>
          </button>
        );
      })}
      <button type="button" onClick={onNew} className={cn("flex shrink-0 items-center gap-2.5 rounded-[10px] py-1.5 pl-3 pr-3.5 text-[12.5px] font-medium text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text", RING)}>
        <span className="flex size-8 items-center justify-center rounded-bz-pill border border-dashed border-bz-line">
          <Plus size={14} />
        </span>
        New rep
      </button>
    </div>
  );
}

/** What the column head says of its day: who is due ahead, who was visited once the day has come. */
function headOf(col: DayCol): { text: string; warn?: boolean; title: string } {
  const n = col.planned;
  if (!n) {
    if (col.unplanned.length) return { text: `${col.unplanned.length} unplanned`, title: "Visits made with nothing planned" };
    return col.cards.length ? { text: "None due", title: "No customer on these routes is due that week" } : { text: "No routes", title: "No route runs that day" };
  }
  if (col.when === "future") return { text: plural(n, "visit"), title: "Customers due that day" };
  if (col.when === "today") return { text: `${col.visited} of ${n}`, title: "Visited so far today" };
  if (!col.recorded) return { text: `${n} planned`, title: "No visit was recorded that day" };
  return { text: `${col.visited} of ${n}`, warn: col.visited < n, title: "Visited, of the visits planned" };
}

/** One weekday: its head, its routes, and the way to add one. On the board it is also where a dragged route lands. */
function DayColumn({ col, single, over, onAdd, children }: { col: DayCol; /** The phone's one-day view. */ single?: boolean; over?: boolean; onAdd?: () => void; children: React.ReactNode }) {
  const today = col.when === "today";
  const head = headOf(col);
  return (
    <div data-plan-day={single ? undefined : col.n} className={cn("relative flex min-w-0 flex-col", today ? TODAY_BG : "bg-bz-surface", !single && "rounded-b-[10px]")}>
      <div className={cn("flex h-10 shrink-0 items-center gap-1.5 bg-inherit", single ? "px-4" : "sticky top-0 z-[1] px-3")} title={`${col.label} ${dayMonth(col.date)}${today ? " · today" : ""}`}>
        {today && <span aria-hidden className="size-1.5 shrink-0 rounded-bz-pill bg-[var(--fx-accent)]" />}
        <h3 className="m-0 whitespace-nowrap text-[13px] font-semibold text-bz-text">
          {single ? col.label : col.short} <span className={NUM}>{single ? dayMonth(col.date) : Number(col.date.slice(8, 10))}</span>
        </h3>
        <span title={head.title} className={cn("ml-auto min-w-0 truncate text-[11.5px]", head.warn ? "text-bz-amber-ink" : "text-bz-text-soft", NUM)}>
          {head.text}
        </span>
      </div>
      <div className={cn("flex flex-col gap-1.5", single ? "px-3 pb-3" : "px-1 pb-1")}>
        {children}
        {onAdd && (
          <button type="button" onClick={onAdd} aria-label={`Add a route on ${col.label}`} className={cn("flex h-8 w-full items-center justify-center gap-1 rounded-[10px] text-[12px] font-medium text-bz-text-soft transition-colors hover:bg-bz-paper-warm hover:text-bz-text", RING)}>
            <Plus size={13} /> Add
          </button>
        )}
      </div>
      {over && <span aria-hidden className="pointer-events-none absolute inset-0 z-[2] rounded-[10px] border-[1.5px] border-dashed border-[var(--fx-accent)] bg-[color-mix(in_srgb,var(--fx-accent)_8%,transparent)]" />}
    </div>
  );
}

/**
 * One route on one day: its name and how many of its customers are due, then the customers in visit order. On the
 * board the header opens the menu (move, hand over, open, take off) and is the handle to drag it by; on a phone it
 * opens and folds the card, and the menu is behind the dots.
 */
function RouteCardView({
  card,
  reps,
  thisWeek,
  phone,
  fold,
  onFold,
  dragging,
  onGrab,
  moved,
  onMove,
  onHand,
  onTakeOff,
}: {
  card: RouteCard;
  reps: Rep[];
  thisWeek: boolean;
  phone?: boolean;
  fold: Fold;
  onFold: (to: Fold) => void;
  dragging?: boolean;
  onGrab?: (ev: React.PointerEvent<HTMLElement>, p: RoutePlan, name: string) => void;
  moved: React.RefObject<boolean>;
  onMove: (day: number) => void;
  onHand: (to: Rep) => void;
  onTakeOff: () => void;
}) {
  const head = React.useRef<HTMLDivElement>(null);
  const [menu, setMenu] = React.useState(false);
  const { plan, route, stops, due } = card;
  const n = stops.length;
  const name = route?.name ?? "Removed route";
  const wk = thisWeek ? "this week" : "that week";
  const open = fold !== "closed";
  // Shut = the header alone. Open = the first stops and "+n more". Every stop only once the reader asks for them.
  const shown = fold === "closed" ? [] : fold === "all" ? stops : stops.slice(0, PEEK);
  const more = n - shown.length;
  const toggle = () => onFold(open ? "closed" : "peek");
  const others = reps.filter((r) => r.id !== plan.repId);
  const runs = route ? plansOfRoute(route.id).length : 0;
  const day = DAYS.find((d) => d.n === plan.day);
  const close = () => setMenu(false);

  return (
    <div className={cn("@container min-w-0 overflow-hidden rounded-[10px] border bg-bz-surface transition-[border-color,opacity]", menu ? "border-bz-line" : "border-bz-line-soft hover:border-bz-line", dragging && "opacity-40")}>
      <div ref={head} className={cn("flex items-start transition-colors", WARM_HOVER, menu && WARM)}>
        <button
          type="button"
          onPointerDown={onGrab ? (ev) => onGrab(ev, plan, name) : undefined}
          onClick={() => {
            if (moved.current) return;
            if (phone) toggle();
            else setMenu(true);
          }}
          aria-haspopup={phone ? undefined : "menu"}
          aria-expanded={phone ? open : menu}
          title={n ? `${name} · ${plural(n, "customer")} · ${due} due ${wk}` : `${name} · no customers yet`}
          aria-label={`${name}, ${dayLabel(plan.day)}, ${plural(n, "customer")}, ${due} due ${wk}`}
          className={cn("flex min-w-0 flex-1 select-none flex-col py-2 pl-2.5 pr-1 text-left", RING)}
        >
          <span className={cn("line-clamp-2 text-[13px] font-semibold leading-[17px] [overflow-wrap:anywhere]", route ? "text-bz-text" : "text-bz-text-soft")}>{name}</span>
          <span className={cn("mt-0.5 block truncate text-[11.5px] leading-[15px] text-bz-text-soft", NUM)}>
            {n === 0 ? (
              "No customers yet"
            ) : (
              <>
                {/* A narrow column says it in three words; the whole of it comes back when there is room. */}
                <span className="@min-[200px]:hidden">
                  {due} of {n} due
                </span>
                <span className="hidden @min-[200px]:inline">
                  {plural(n, "customer")} · {due} due {wk}
                </span>
              </>
            )}
          </span>
        </button>
        <span className={cn("flex shrink-0 items-center", phone ? "flex-row-reverse gap-1 pr-2 pt-2" : "flex-col gap-px pr-1 pt-1.5")}>
          <button type="button" onClick={() => setMenu(true)} aria-haspopup="menu" aria-expanded={menu} aria-label={`${name}: move, hand over, open or take off`} title="Move, hand over, open or take off" className={cn(CARD_BTN, phone ? "size-8" : "size-[22px]")}>
            <MoreHorizontal size={15} />
          </button>
          {n > 0 && (
            <button type="button" onClick={toggle} aria-expanded={open} aria-label={open ? `Close ${name}` : `Open ${name}`} title={open ? "Close" : "Open"} className={cn(CARD_BTN, phone ? "size-8" : "size-[22px]")}>
              <ChevronDown size={14} className={cn("transition-transform duration-150", !open && "-rotate-90")} />
            </button>
          )}
        </span>
      </div>

      {shown.length > 0 && (
        <ul className="m-0 list-none border-t border-bz-line-soft p-0 py-1">
          {shown.map((x, i) => (
            <StopLine key={x.e.id} x={x} first={i === 0} last={i === shown.length - 1 && more === 0} off={`not ${wk}`} />
          ))}
          {more > 0 && (
            <li className="relative">
              <span aria-hidden className={cn(RAIL, "top-0 h-[9px] border-dashed")} />
              <button type="button" onClick={() => onFold("all")} title="Show every customer" className={cn("flex h-7 w-full items-center pl-[26px] pr-2.5 text-left text-[11.5px] font-medium text-bz-text-soft transition-colors hover:text-bz-text", RING, NUM)}>
                +{more} more
              </button>
            </li>
          )}
          {fold === "all" && n > PEEK && (
            <li>
              <button type="button" onClick={() => onFold("peek")} className={cn("flex h-7 w-full items-center pl-[26px] pr-2.5 text-left text-[11.5px] font-medium text-bz-text-soft transition-colors hover:text-bz-text", RING)}>
                Show fewer
              </button>
            </li>
          )}
        </ul>
      )}

      <Popover open={menu} anchor={head.current} onClose={close} width={264}>
        <div className="px-2.5 pb-2 pt-1.5">
          <p className={cn("m-0 truncate text-[13px] font-semibold", route ? "text-bz-text" : "text-bz-text-soft")}>{name}</p>
          <p className={cn("m-0 mt-0.5 truncate text-[11.5px] text-bz-text-soft", NUM)}>{plural(n, "customer")}</p>
          {/* A route that runs on other days, or with other reps, says where. */}
          {route && runs > 1 && <p className="m-0 mt-0.5 truncate text-[11.5px] text-bz-text-soft">{plannedText(route.id)}</p>}
        </div>
        <div className="my-1 border-t border-bz-line-soft" />
        <p className={MENU_LABEL}>Move to</p>
        <div className="grid grid-cols-6 gap-1 px-1 pb-1">
          {DAYS.map((d) => {
            const on = d.n === plan.day;
            return (
              <button
                key={d.n}
                type="button"
                data-picked={on ? "" : undefined}
                aria-pressed={on}
                title={d.label}
                onClick={() => (close(), onMove(d.n))}
                className={cn("flex h-9 items-center justify-center rounded-bz-md text-[12.5px] transition-colors", RING, on ? "bg-bz-paper-warm font-semibold text-bz-text" : "font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text")}
              >
                {d.short}
              </button>
            );
          })}
        </div>
        {others.length > 0 && (
          <>
            <p className={MENU_LABEL}>Hand to</p>
            <div className="max-h-[188px] overflow-y-auto [scrollbar-width:thin]">
              {others.map((r) => {
                const busy = plansOfRep(r.id, plan.day).length;
                return (
                  <button key={r.id} type="button" title={`${r.role} · ${repArea(r)}`} onClick={() => (close(), onHand(r))} className={cn(MENU_ROW, "text-bz-text")}>
                    <Who name={r.name} size={22} />
                    <span className="min-w-0 flex-1 truncate">{r.name}</span>
                    <span className={cn("shrink-0 text-[11.5px] text-bz-text-soft", NUM)}>{busy ? `${plural(busy, "route")} on ${day?.short ?? "that day"}` : `Free on ${day?.short ?? "that day"}`}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div className="my-1 border-t border-bz-line-soft" />
        {route && (
          <Link to={sfPath(`routes/${route.id}`)} onClick={close} className={cn(MENU_ROW, "text-bz-text")}>
            <span className="min-w-0 flex-1 truncate">Open route</span>
            <ArrowUpRight size={14} className="shrink-0 text-bz-text-soft" />
          </Link>
        )}
        <button type="button" onClick={() => (close(), onTakeOff())} className={cn(MENU_ROW, "text-bz-red")}>
          Take off the plan
        </button>
      </Popover>
    </div>
  );
}

/** What came of a stop, as its mark on the route's line: an order, a visit without one, the rep there now, a skip — or not yet. */
function markOf(x: StopRow): React.CSSProperties {
  const v = x.visit;
  if (v) {
    if (v.state === "skipped") return { background: inkOf("amber") };
    if (v.state === "in-progress") return { background: "var(--bz-surface)", boxShadow: `inset 0 0 0 2px ${inkOf("accent")}` };
    return { background: inkOf(v.orderId ? "accent" : "soft") };
  }
  if (x.missed) return { background: "var(--bz-surface)", boxShadow: `inset 0 0 0 1.5px ${inkOf("amber")}` };
  return x.due ? { background: "var(--bz-surface)", boxShadow: "inset 0 0 0 1.5px var(--bz-line)" } : { background: "var(--bz-surface)" };
}

/**
 * One stop of a route: the customer, its type and how often it is on the run. It opens the customer. A stop that is
 * not due in the week shown is faint and its line dashed; once the day has come, its mark says what happened, and
 * the mark of a stop that was visited opens that visit.
 */
function StopLine({ x, first, last, off }: { x: StopRow; first: boolean; last: boolean; off: string }) {
  const { e, c, due, visit } = x;
  const t = typeOf(c);
  const name = c?.name ?? "Removed customer";
  const word = visit ? (visit.state === "skipped" ? "Skipped" : null) : x.missed ? "Missed" : null;
  const said = visit ? outcomeOf(visit) : x.missed ? "Planned, and not visited" : null;
  const row = cn("block py-[5px] pl-[26px] pr-2.5 transition-colors", RING);
  const mark = "absolute left-[10px] top-[9px] size-[9px] rounded-bz-pill";
  const body = (
    <>
      <span className={cn("line-clamp-2 text-[13px] leading-[17px] [overflow-wrap:anywhere]", c ? "text-bz-text" : "text-bz-text-soft")}>{name}</span>
      <span className="mt-px flex min-w-0 items-center gap-1.5 text-[11.5px] leading-[15px] text-bz-text-soft">
        {c && (
          <>
            {/* A narrow column keeps the type as its colour alone; the name comes back when there is room. */}
            <TypeMark name={t.name} color={t.color} className="hidden shrink-0 @min-[200px]:inline-flex" />
            <span aria-hidden className="size-2 shrink-0 rounded-[3px] @min-[200px]:hidden" style={{ background: idColor(t.color) }} />
            <span aria-hidden className="hidden @min-[200px]:inline">
              ·
            </span>
          </>
        )}
        <span className="min-w-0 truncate">
          {EVERY_SHORT[e.every]}
          {!due && <span className="hidden @min-[260px]:inline"> · {off}</span>}
        </span>
        {word && (
          <span className={AMBER_WORD} title={said ?? undefined}>
            {word}
          </span>
        )}
      </span>
    </>
  );
  return (
    <li className={cn("relative", !due && "opacity-60 transition-opacity focus-within:opacity-100 hover:opacity-100")}>
      {c ? (
        <Link to={sfPath(`customers/${c.id}`)} title={`${name} · ${EVERY_LABEL[e.every]}${due ? "" : ` · ${off}`}${said ? ` · ${said}` : ""}`} className={cn(row, WARM_HOVER)}>
          {body}
        </Link>
      ) : (
        <div className={row}>{body}</div>
      )}
      {!first && <span aria-hidden className={cn(RAIL, "top-0 h-[9px]", !due && "border-dashed")} />}
      {!last && <span aria-hidden className={cn(RAIL, "bottom-0 top-[18px]", !due && "border-dashed")} />}
      {visit ? (
        <Link to={sfPath(`visits/${visit.id}`)} title={`${outcomeOf(visit)} · open the visit`} aria-label={`Open the visit to ${name}: ${outcomeOf(visit)}`} className={cn(mark, "transition-transform before:absolute before:-inset-1.5 before:content-[''] hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire")} style={markOf(x)} />
      ) : (
        <span aria-hidden title={said ?? undefined} className={cn(mark, "pointer-events-none", !due && "border border-dashed border-bz-line")} style={markOf(x)} />
      )}
    </li>
  );
}

/** A visit the rep made with nothing planned for it that day: shown faintly, and it opens the visit. */
function UnplannedCard({ v }: { v: Visit }) {
  const name = customerById(v.customerId)?.name ?? "Removed customer";
  return (
    <Link to={sfPath(`visits/${v.id}`)} title={`${name} · unplanned · ${outcomeOf(v)}`} className={cn("flex min-h-[48px] min-w-0 flex-col justify-center rounded-[10px] bg-bz-paper-warm/50 px-2.5 py-[7px] transition-colors hover:bg-bz-paper-warm", RING)}>
      <span className="line-clamp-2 text-[13px] leading-[17px] text-bz-text-muted [overflow-wrap:anywhere]">{name}</span>
      <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11.5px] leading-[15px] text-bz-text-soft">
        <span className="min-w-0 truncate">Unplanned</span>
        {v.state === "skipped" ? <span className={AMBER_WORD}>Skipped</span> : <span className="ml-auto size-[9px] shrink-0 rounded-bz-pill" style={v.state === "in-progress" ? { background: "var(--bz-surface)", boxShadow: `inset 0 0 0 2px ${inkOf("accent")}` } : { background: inkOf(v.orderId ? "accent" : "soft") }} />}
      </span>
    </Link>
  );
}

// ── Not covered: put a customer on a route ──────────────────────────────────

/** The one verb of a customer on no route: pick the route it joins — this rep's own routes first. */
function RoutePick({ customer, routes, mine, first, onPick }: { customer: Customer; routes: Route[]; mine: Set<string>; first: string; onPick: (routeId: string) => void }) {
  if (!routes.length)
    return (
      <Link to={sfPath("routes/new")} className={VERB}>
        New route
      </Link>
    );
  const own = `${first}'s routes`;
  const options = routes
    .map((r) => ({ value: r.id, label: r.name, hint: `${plural(r.stops.length, "customer")} · ${plannedText(r.id)}`, group: mine.size ? (mine.has(r.id) ? own : "Other routes") : undefined }))
    .sort((a, b) => (a.group === b.group ? a.label.localeCompare(b.label) : a.group === own ? -1 : 1));
  return (
    <Select
      trigger="plain"
      className="shrink-0 rounded-[8px]"
      value={null}
      options={options}
      width={288}
      align="right"
      placeholder="Find a route"
      title={`Put ${customer.name} on a route`}
      onChange={onPick}
      footer={
        <Link to={sfPath("routes/new")} className={cn(MENU_ROW, "h-8 text-[12.5px] text-bz-text")}>
          <Plus size={13} className="shrink-0 text-bz-text-muted" />
          New route
        </Link>
      }
    >
      <span className={VERB}>Add to a route</span>
    </Select>
  );
}

// ── Add to the plan ─────────────────────────────────────────────────────────

/** Give a route to a rep on a weekday. `planRoute` decides; what it refuses is said here, in its own words. */
function AddDialog({ rep, reps, routes, preset, onClose, onAdded, onNewRoute }: { rep: Rep; reps: Rep[]; routes: Route[]; preset: Adding; onClose: () => void; onAdded: (plan: RoutePlan) => void; onNewRoute: () => void }) {
  const [routeId, setRouteId] = React.useState<string | null>(preset.routeId ?? null);
  const [repId, setRepId] = React.useState<string>(rep.id);
  const [day, setDay] = React.useState<number>(preset.day ?? (TODAY_DAY <= 6 ? TODAY_DAY : 1));
  const [error, setError] = React.useState<string | null>(null);
  const who = reps.find((r) => r.id === repId) ?? rep;
  const route = routes.find((r) => r.id === routeId);
  const onWeek = new Set(plansOfRep(who.id).map((p) => p.routeId));
  const fresh = `Not on ${firstOf(who.name)}'s week yet`;
  const there = `On ${firstOf(who.name)}'s week`;

  const save = () => {
    const done = planRoute(routeId ?? "", who.id, day);
    if (!done.plan) return setError(done.refusal ?? "Choose a route.");
    onAdded(done.plan);
    onClose();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Add to the plan"
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            Add to plan
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Route" required hint={route ? `${plural(route.stops.length, "customer")} · ${plannedText(route.id)}` : undefined}>
          <Picker
            value={routeId}
            onChange={(id) => (setRouteId(id), setError(null))}
            placeholder="Pick a route"
            ariaLabel="Route"
            options={routes
              .map((r) => ({ value: r.id, label: r.name, hint: plural(r.stops.length, "customer"), group: onWeek.has(r.id) ? there : fresh }))
              .sort((a, b) => (a.group === b.group ? a.label.localeCompare(b.label) : a.group === fresh ? -1 : 1))}
            addLabel="New route"
            onAdd={() => (onClose(), onNewRoute())}
          />
        </Field>
        <Field label="Rep" required>
          <Picker value={who.id} onChange={(id) => (setRepId(id), setError(null))} placeholder="Pick a rep" ariaLabel="Rep" options={reps.map((r) => ({ value: r.id, label: r.name, hint: `${r.role} · ${repArea(r)}` }))} />
        </Field>
        <Field label="Day">
          <PillTabs className="self-start" value={String(day)} onChange={(v) => (setDay(Number(v)), setError(null))} options={DAYS.map((d) => ({ value: String(d.n), label: d.short, title: d.label }))} />
        </Field>
        {error && <Refusal text={error} onDismiss={() => setError(null)} sticky />}
      </div>
    </Dialog>
  );
}
