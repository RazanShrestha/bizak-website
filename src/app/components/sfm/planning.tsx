import * as React from "react";
import { ArrowRight, Check, Repeat, UserPlus } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, GHOST, GHOST_SM, INPUT_SM, LABEL, MenuLabel, NUM, Popover, Refusal, Segmented } from "../sales/bzw";
import { personById } from "../productivity/shared";
import {
  FIELD_TODAY,
  REPS,
  addRepToRoute,
  dayAdd,
  fmtDay,
  fmtDayShort,
  isWorkday,
  leaveOf,
  movePlan,
  partiesOf,
  planRoute,
  plansStore,
  repById,
  repDay,
  routeById,
  routesStore,
  undoMove,
  weekdayIdx,
  holidayOn,
} from "./model";
import type { FieldPlan } from "./model";
import { RouteChip, useField } from "./kit";

// ════════════════════════════════════════════════════════════════════════════
// PLANNING POPOVERS — the two questions every plan edit asks
//
//   "Which route?"  for a rep and a day (a Plan cell, Today's "Add a route")
//   "Who, which days?" for a route (a Routes row, the route panel)
//   "Give to whom?" for a plan that has to change hands (leave, a late start)
//
// Each write is ONE incremental call (model rule 4). A day the rep is on leave,
// a holiday or the weekly off is never silently shifted — it is skipped and
// named in the result, the rule the Employee Plan calendar already follows.
// ════════════════════════════════════════════════════════════════════════════

export type Notify = (text: string, undo?: () => void) => void;

type Repeat = "once" | "weekly" | "fortnightly";

function repeatDates(start: string, repeat: Repeat, until: string) {
  if (repeat === "once") return [start];
  const step = repeat === "weekly" ? 7 : 14;
  const out: string[] = [];
  for (let d = start; d <= until; d = dayAdd(d, step)) out.push(d);
  return out;
}

function summarise(added: FieldPlan[], skipped: { date: string; why: string }[]) {
  const a = added.length === 1 ? fmtDay(added[0].date) : `${added.length} days`;
  const s = skipped.length ? ` · skipped ${skipped.map((x) => `${fmtDayShort(x.date)} (${x.why})`).join(", ")}` : "";
  return added.length ? `Planned ${a}${s}` : `Nothing planned${s}`;
}

/** "Which route?" — for one rep on one day. The rep's own routes first; another route asks to add it to his set. */
export function PlanRoutePop({ open, anchor, onClose, repId, date, notify }: { open: boolean; anchor: HTMLElement | null; onClose: () => void; repId: string; date: string; notify: Notify }) {
  const { routes, plans } = useField();
  const rep = repById(repId)!;
  const [repeat, setRepeat] = React.useState<Repeat>("once");
  const [until, setUntil] = React.useState(dayAdd(date, 27));
  const [ask, setAsk] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (open) (setRepeat("once"), setUntil(dayAdd(date, 27)), setAsk(null));
  }, [open, date]);
  const sub = rep.subsidiaryId;
  const his = routes.filter((r) => r.subsidiaryId === sub && r.repIds.includes(repId));
  const others = routes.filter((r) => r.subsidiaryId === sub && !r.repIds.includes(repId) && partiesOf(r.id).length > 0);
  const planned = new Set(plans.filter((p) => p.repId === repId && p.date === date).map((p) => p.routeId));
  const commit = (routeId: string) => {
    const { added, skipped } = planRoute(repId, routeId, repeatDates(date, repeat, until));
    onClose();
    notify(`${summarise(added, skipped)} · ${routeById(routeId)?.id} for ${rep.name.split(" ")[0]}`, added.length ? () => plansStore.set((ps) => ps.filter((p) => !added.some((a) => a.id === p.id))) : undefined);
  };
  const pick = (routeId: string) => (his.some((r) => r.id === routeId) ? commit(routeId) : setAsk(routeId));
  const leave = leaveOf(repId, date);
  return (
    <Popover open={open} anchor={anchor} onClose={onClose} width={300}>
      <div className="px-2 pb-1 pt-1.5">
        <p className="m-0 text-[12px] font-semibold text-bz-text">
          Plan {rep.name.split(" ")[0]} · {fmtDay(date)}
        </p>
        {leave && <p className="m-0 mt-0.5 text-[11px] text-bz-red">{leave.status === "approved" ? `On leave (${leave.type}) — a plan will be refused.` : `Leave requested (${leave.type}).`}</p>}
      </div>
      {ask ? (
        <div className="px-2 pb-2">
          <p className="m-0 text-[12px] leading-relaxed text-bz-text">
            {rep.name.split(" ")[0]} doesn't run <b>{routeById(ask)?.id}</b> yet. Add it to his routes and plan it?
          </p>
          <div className="mt-2.5 flex justify-end gap-2">
            <button type="button" className={GHOST_SM} onClick={() => setAsk(null)}>
              Back
            </button>
            <button
              type="button"
              className={cn(BTN, "h-8 px-3")}
              onClick={() => {
                addRepToRoute(ask, repId);
                commit(ask);
              }}
            >
              <UserPlus size={12} /> Add and plan
            </button>
          </div>
        </div>
      ) : (
        <>
          <MenuLabel>{`${rep.name.split(" ")[0]}'s routes`}</MenuLabel>
          {his.length === 0 && <p className="m-0 px-2 pb-1 text-[11.5px] text-bz-text-soft">None yet.</p>}
          {his.map((r) => (
            <RouteOption key={r.id} routeId={r.id} planned={planned.has(r.id)} onPick={() => pick(r.id)} />
          ))}
          {others.length > 0 && <MenuLabel>Other routes</MenuLabel>}
          <div className="max-h-[180px] overflow-y-auto">
            {others.map((r) => (
              <RouteOption key={r.id} routeId={r.id} planned={planned.has(r.id)} onPick={() => pick(r.id)} other />
            ))}
          </div>
          <div className="mt-1 border-t border-bz-line-soft px-2 pb-1.5 pt-2">
            <p className={cn(LABEL, "m-0 mb-1.5")}>Repeat</p>
            <Segmented
              size="sm"
              value={repeat}
              onChange={(v) => setRepeat(v as Repeat)}
              options={[
                { value: "once", label: "Once" },
                { value: "weekly", label: "Every week" },
                { value: "fortnightly", label: "Every 2 weeks" },
              ]}
            />
            {repeat !== "once" && (
              <label className="mt-2 flex items-center gap-2 text-[11.5px] text-bz-text-muted">
                until
                <input type="date" value={until} min={date} onChange={(e) => e.target.value && setUntil(e.target.value)} className={cn(INPUT_SM, "w-[150px]")} />
              </label>
            )}
            {repeat !== "once" && <p className="m-0 mt-1.5 text-[10.5px] text-bz-text-soft">Leave, holidays and the weekly off are skipped, not moved.</p>}
          </div>
        </>
      )}
    </Popover>
  );
}

function RouteOption({ routeId, planned, onPick, other }: { routeId: string; planned: boolean; onPick: () => void; other?: boolean }) {
  const r = routeById(routeId)!;
  const n = partiesOf(routeId).length;
  return (
    <button
      type="button"
      disabled={planned}
      onClick={onPick}
      className="flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12px] hover:bg-bz-paper-warm focus-visible:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire disabled:cursor-not-allowed disabled:opacity-50"
      title={planned ? "Already planned that day" : other ? `Not one of his routes — asks to add it` : undefined}
    >
      <RouteChip route={r} tight />
      <span className="min-w-0 flex-1 truncate text-bz-text">{r.name}</span>
      <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{planned ? "planned" : `${n} stops`}</span>
    </button>
  );
}

/** "Who, which days?" — for one route. Its own reps first; days are the next two weeks' workdays. */
export function PlanRepPop({ open, anchor, onClose, routeId, notify, initialDate }: { open: boolean; anchor: HTMLElement | null; onClose: () => void; routeId: string; notify: Notify; initialDate?: string }) {
  const { routes, plans } = useField();
  const route = routes.find((r) => r.id === routeId);
  const [repId, setRepId] = React.useState<string | null>(null);
  const [days, setDays] = React.useState<string[]>([]);
  const [weekly, setWeekly] = React.useState(false);
  const [until, setUntil] = React.useState(dayAdd(FIELD_TODAY, 34));
  const [refusal, setRefusal] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!open || !route) return;
    // Sending someone on a given day: default to a rep who is free that day (no plan, no leave), the route's own first.
    const pool = [...REPS.filter((r) => route.repIds.includes(r.id)), ...REPS.filter((r) => !route.repIds.includes(r.id) && r.subsidiaryId === route.subsidiaryId)];
    const free = initialDate ? pool.find((r) => !plans.some((p) => p.repId === r.id && p.date === initialDate) && !(leaveOf(r.id, initialDate)?.status === "approved")) : undefined;
    setRepId(free?.id ?? route.repIds[0] ?? null);
    setDays(initialDate ? [initialDate] : []);
    setWeekly(false);
    setRefusal(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, routeId]);
  if (!route) return null;
  const candidates = [...REPS.filter((r) => route.repIds.includes(r.id)), ...REPS.filter((r) => !route.repIds.includes(r.id) && r.subsidiaryId === route.subsidiaryId)];
  const horizon = Array.from({ length: 14 }, (_, i) => dayAdd(FIELD_TODAY, i)).filter(isWorkday);
  const commit = () => {
    if (!repId) return setRefusal("Pick who runs it.");
    if (!days.length) return setRefusal("Pick at least one day.");
    const all = weekly ? days.flatMap((d) => repeatDates(d, "weekly", until)) : days;
    if (!route.repIds.includes(repId)) addRepToRoute(route.id, repId);
    const { added, skipped } = planRoute(repId, route.id, all);
    onClose();
    notify(`${summarise(added, skipped)} · ${route.id} for ${repById(repId)?.name.split(" ")[0]}`, added.length ? () => plansStore.set((ps) => ps.filter((p) => !added.some((a) => a.id === p.id))) : undefined);
  };
  return (
    <Popover open={open} anchor={anchor} onClose={onClose} width={340}>
      <div className="px-2 pb-1.5 pt-1.5">
        <p className="m-0 flex items-center gap-2 text-[12px] font-semibold text-bz-text">
          Plan <RouteChip route={route} tight />
          <span className="truncate font-normal text-bz-text-muted">{route.name}</span>
        </p>
      </div>
      <MenuLabel>Who runs it</MenuLabel>
      <div className="flex flex-wrap gap-1.5 px-2 pb-2">
        {candidates.map((r) => {
          const off = initialDate && leaveOf(r.id, initialDate)?.status === "approved";
          const busy = initialDate ? plans.filter((p) => p.repId === r.id && p.date === initialDate).map((p) => p.routeId) : [];
          return (
            <button
              key={r.id}
              type="button"
              disabled={!!off}
              onClick={() => setRepId(r.id)}
              className={cn("inline-flex items-center gap-1.5 rounded-bz-pill border py-0.5 pl-0.5 pr-2 text-[11.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-45", repId === r.id ? "border-bz-text-muted bg-bz-fire/15 font-semibold text-bz-text" : "border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm")}
              title={off ? "On leave that day" : `${route.repIds.includes(r.id) ? `Runs ${route.id}` : `Doesn't run ${route.id} yet — will be added`}${busy.length ? ` · already on ${busy.join(", ")} that day` : initialDate ? " · free that day" : ""}`}
            >
              <Avatar person={personById(r.id)} size={18} />
              {r.name.split(" ")[0]}
              {off ? <span className="text-[10px] text-bz-text-soft">leave</span> : busy.length ? <span className="text-[10px] text-bz-text-soft">busy</span> : initialDate ? <span className="text-[10px] text-bz-pos-deep">free</span> : null}
              {!route.repIds.includes(r.id) && <span className="text-[10px] text-bz-text-soft">+</span>}
            </button>
          );
        })}
      </div>
      <MenuLabel>Days · next two weeks</MenuLabel>
      <div className="grid grid-cols-6 gap-1 px-2 pb-2">
        {horizon.map((d) => {
          const on = days.includes(d);
          const busy = repId ? plans.some((p) => p.repId === repId && p.date === d) : false;
          const already = repId ? plans.some((p) => p.repId === repId && p.routeId === route.id && p.date === d) : false;
          const lv = repId ? leaveOf(repId, d) : null;
          return (
            <button
              key={d}
              type="button"
              disabled={already || lv?.status === "approved"}
              onClick={() => setDays((x) => (on ? x.filter((y) => y !== d) : [...x, d]))}
              className={cn(
                "flex flex-col items-center rounded-bz-sm border py-1 text-[10.5px] leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                on ? "border-bz-text-muted bg-bz-fire/15 font-semibold text-bz-text" : "border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm",
                d === FIELD_TODAY && !on && "border-bz-text-soft",
              )}
              title={already ? "Already planned" : lv ? `${lv.status === "approved" ? "On leave" : "Leave requested"}` : busy ? "Has another route that day" : fmtDay(d)}
            >
              <span>{fmtDay(d).slice(0, 3)}</span>
              <span className={cn("font-semibold", NUM)}>{Number(d.slice(8))}</span>
              {busy && !already && <span aria-hidden className="mt-0.5 size-1 rounded-bz-pill bg-bz-text-soft" />}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 border-t border-bz-line-soft px-2 pb-1 pt-2">
        <button type="button" onClick={() => setWeekly((v) => !v)} className={cn(GHOST_SM, "h-7", weekly && "border-bz-text-muted font-semibold")} aria-pressed={weekly}>
          <Repeat size={11} /> Every week
        </button>
        {weekly && (
          <label className="flex items-center gap-1.5 text-[11px] text-bz-text-muted">
            until <input type="date" value={until} onChange={(e) => e.target.value && setUntil(e.target.value)} className={cn(INPUT_SM, "h-7 w-[136px]")} />
          </label>
        )}
      </div>
      {refusal && <Refusal text={refusal} onDismiss={() => setRefusal(null)} className="mx-2 mt-2" />}
      <div className="flex justify-end gap-2 px-2 pb-1.5 pt-2.5">
        <button type="button" className={GHOST_SM} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={cn(BTN, "h-8 px-3")} onClick={commit}>
          <Check size={12} /> Plan {days.length > 1 || weekly ? `${weekly ? "weekly" : `${days.length} days`}` : ""}
        </button>
      </div>
    </Popover>
  );
}

/**
 * "Give to whom?" — one or more plans change hands. Reps free that day come
 * first; a busy rep shows his load so the manager can see what he is adding to.
 * The plan row is UPDATED (PATCH repId), so the history reads "gave RT-09 to …".
 */
export function GivePop({ open, anchor, onClose, planIds, notify, title }: { open: boolean; anchor: HTMLElement | null; onClose: () => void; planIds: string[]; notify: Notify; title?: string }) {
  const { plans, ctx } = useField();
  const picked = plans.filter((p) => planIds.includes(p.id));
  const [refusal, setRefusal] = React.useState<string | null>(null);
  React.useEffect(() => setRefusal(null), [open]);
  if (!picked.length) return null;
  const date = picked[0].date;
  const owner = picked[0].repId;
  const sub = repById(owner)?.subsidiaryId;
  const rows = REPS.filter((r) => r.id !== owner && r.subsidiaryId === sub).map((r) => {
    const d = repDay(r.id, date, ctx);
    const lv = leaveOf(r.id, date);
    const free = !d.plans.length && !lv;
    return { rep: r, day: d, lv, free };
  });
  const give = (repId: string) => {
    const done: { id: string; from: FieldPlan }[] = [];
    for (const p of picked) {
      const res = movePlan(p.id, { repId });
      if (!res.ok) return setRefusal("why" in res ? res.why : "Couldn't give it.");
      done.push({ id: p.id, from: res.from });
    }
    if (!picked.every((p) => routeById(p.routeId)?.repIds.includes(repId))) picked.forEach((p) => !routeById(p.routeId)?.repIds.includes(repId) && addRepToRoute(p.routeId, repId));
    onClose();
    notify(`${picked.map((p) => routeById(p.routeId)?.id).join(", ")} on ${fmtDay(date)} given to ${repById(repId)?.name}`, () => done.forEach((d) => undoMove(d.id, d.from)));
  };
  const Row = ({ r }: { r: (typeof rows)[number] }) => (
    <button
      type="button"
      disabled={r.lv?.status === "approved"}
      onClick={() => give(r.rep.id)}
      className="flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left hover:bg-bz-paper-warm focus-visible:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Avatar person={personById(r.rep.id)} size={20} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] text-bz-text">{r.rep.name}</span>
        <span className="block truncate text-[10.5px] text-bz-text-soft">
          {r.lv ? (r.lv.status === "approved" ? "On leave" : "Leave requested") : r.free ? "Free that day" : `${r.day.routes.map((x) => x.id).join(", ")} · ${r.day.figures.planned} stops${date === FIELD_TODAY ? ` · ${r.day.figures.visited} done` : ""}`}
        </span>
      </span>
      <ArrowRight size={12} className="shrink-0 text-bz-text-soft" />
    </button>
  );
  const free = rows.filter((r) => r.free);
  const busy = rows.filter((r) => !r.free);
  return (
    <Popover open={open} anchor={anchor} onClose={onClose} width={290}>
      <div className="px-2 pb-1 pt-1.5">
        <p className="m-0 text-[12px] font-semibold text-bz-text">{title ?? `Give ${picked.map((p) => routeById(p.routeId)?.id).join(", ")} to…`}</p>
        <p className="m-0 mt-0.5 text-[11px] text-bz-text-muted">{fmtDay(date)}{holidayOn(date) ? ` · ${holidayOn(date)!.name}` : ""} · {weekdayIdx(date) === 6 ? "weekly off" : `${picked.reduce((s, p) => s + partiesOf(p.routeId).length, 0)} stops`}</p>
      </div>
      {free.length > 0 && <MenuLabel>Free that day</MenuLabel>}
      {free.map((r) => (
        <Row key={r.rep.id} r={r} />
      ))}
      {busy.length > 0 && <MenuLabel>Also working</MenuLabel>}
      {busy.map((r) => (
        <Row key={r.rep.id} r={r} />
      ))}
      {refusal && <Refusal text={refusal} onDismiss={() => setRefusal(null)} className="mx-1 mt-1.5" />}
    </Popover>
  );
}

export { GHOST };
