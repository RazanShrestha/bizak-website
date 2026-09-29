import * as React from "react";
import { useNavigate } from "react-router";
import { CalendarPlus, Check, Copy, GripVertical, MapPin, MoreHorizontal, Pencil, Plus, Route as RouteIcon, Search, ShoppingCart, Trash2, UserPlus, X, Footprints, Send } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, CARD, Field, GHOST, GHOST_SM, ICON_BTN, INPUT, INPUT_SM, LABEL, MenuItem, MenuLabel, MenuSep, NUM, PLAIN_BTN, Popover, Refusal, Segmented, Select, Stat, Statline, TEXTAREA } from "../sales/bzw";
import { RecordShell, StepCard } from "../sales/record";
import { Section } from "../sales/parts";
import { SheetFrame } from "../sales/FulfilSheet";
import type { PanelCtx } from "../sales/DocDesk";
import { personById } from "../productivity/shared";
import {
  FIELD_TODAY,
  PARTIES,
  REPS,
  WEEKDAYS,
  addPartiesToRoute,
  addRepToRoute,
  createRoute,
  dayAdd,
  fmtDay,
  fmtDayShort,
  isWorkday,
  leaveOf,
  partyCoverage,
  pct,
  planRoute,
  plansStore,
  removePartyFromRoute,
  removeRepFromRoute,
  renameRoute,
  repById,
  resequence,
  restorePartyLink,
  routeById,
  routeHealth,
  routesOfParty,
} from "./model";
import type { FieldParty } from "./model";
import { Money, RouteChip, StopStrip, routeColor, useField, useSheetLinks } from "./kit";
import { FieldMap } from "./map";
import { PlanRepPop } from "./planning";
import { Activity, ActivityFoot, stageChip } from "./sheets";

// ════════════════════════════════════════════════════════════════════════════
// THE ROUTE PANEL — a beat, everything about it, editable where it is read
//
//   head     route · flags · name · orders in 30 days · outlets, reps, run days
//   step     what the route is waiting for (a rep, outlets, a day) — or when it runs next
//   outlets  in stop order: drag to re-sequence (proposal D-3), add from a picker that
//            puts "on no route" first, remove one at a time with Undo
//   reps     who may run it (MAP_SALESMAN_ROUTE), one at a time
//   plan     the next 14 days as cells; an empty one plans the route that day
//   runs     the last six runs as stop strips
//   sections map of the outlets · history & notes
// ════════════════════════════════════════════════════════════════════════════

export function RoutePanel({ routeId, ctx }: { routeId: string; ctx: PanelCtx }) {
  const { ctx: fctx } = useField();
  const navigate = useNavigate();
  const sheets = useSheetLinks();
  const h = routeHealth(routeId, fctx);
  const r = h.route;
  const [renaming, setRenaming] = React.useState(false);
  const [name, setName] = React.useState(r.name);
  const [desc, setDesc] = React.useState(r.description);
  const [pop, setPop] = React.useState<{ kind: "plan" | "add"; anchor: HTMLElement; date?: string } | null>(null);
  const [dragFrom, setDragFrom] = React.useState<number | null>(null);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const notify = (t: string, undo?: () => void) => ctx.show(undo ? "success" : "info", t, undo ? { label: "Undo", run: undo } : undefined);
  React.useEffect(() => (setName(r.name), setDesc(r.description), setRenaming(false)), [routeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = Array.from({ length: 14 }, (_, i) => dayAdd(FIELD_TODAY, i));
  const plansAhead = fctx.plans.filter((p) => p.routeId === routeId && p.date >= FIELD_TODAY && p.date <= days[13]);
  const runDays = Array.from(new Set(plansAhead.map((p) => WEEKDAYS[new Date(p.date).getUTCDay()]))).join(" & ");
  const todayPlan = fctx.plans.find((p) => p.routeId === routeId && p.date === FIELD_TODAY);

  const step = (() => {
    if (!h.parties.length)
      return (
        <StepCard
          tone="plain"
          icon={<MapPin size={15} />}
          title="No outlets yet"
          sub="Add the outlets this route visits — the ones on no route come first."
          actions={
            <button type="button" className={BTN} onClick={(e) => setPop({ kind: "add", anchor: e.currentTarget })}>
              <Plus size={13} /> Add outlets
            </button>
          }
        />
      );
    if (!h.reps.length)
      return (
        <StepCard
          tone="danger"
          icon={<UserPlus size={15} />}
          title="No rep runs this route"
          sub={`${h.parties.length} outlets with nobody to visit them.`}
          actions={
            <Select value={null} onChange={(v) => (addRepToRoute(r.id, v), notify(`${repById(v)?.name} now runs ${r.id}`, () => removeRepFromRoute(r.id, v)))} options={REPS.filter((x) => x.subsidiaryId === r.subsidiaryId).map((x) => ({ value: x.id, label: x.name, person: personById(x.id), hint: `${fctx.routes.filter((y) => y.repIds.includes(x.id)).length} routes` }))} width={240} align="right" trigger="plain">
              <span className={BTN}>
                <UserPlus size={13} /> Add a rep
              </span>
            </Select>
          }
        />
      );
    if (h.flags.includes("unplanned-week"))
      return (
        <StepCard
          tone="plain"
          icon={<CalendarPlus size={15} />}
          title="Not planned in 7 days"
          sub={h.nextRun ? `Next run ${fmtDay(h.nextRun.date)}.` : "No day ahead either."}
          actions={
            <button type="button" className={BTN} onClick={(e) => setPop({ kind: "plan", anchor: e.currentTarget })}>
              <CalendarPlus size={13} /> Plan…
            </button>
          }
        />
      );
    return (
      <StepCard
        tone="quiet"
        icon={<Footprints size={15} />}
        title={todayPlan ? `Running today · ${repById(todayPlan.repId)?.name}` : h.nextRun ? `Next run ${fmtDay(h.nextRun.date)} · ${repById(h.nextRun.repId)?.name}` : "Nothing ahead"}
        sub={todayPlan ? undefined : "Need it covered today?"}
        actions={
          todayPlan ? (
            <button type="button" className={GHOST_SM} onClick={() => navigate(`/design/sfm/today/${todayPlan.repId}`)}>
              Open the day
            </button>
          ) : (
            <button type="button" className={GHOST} onClick={(e) => setPop({ kind: "plan", anchor: e.currentTarget, date: FIELD_TODAY })}>
              <Send size={13} /> Send someone today
            </button>
          )
        }
      />
    );
  })();

  const pins = h.parties.map((p, i) => {
    const cov = partyCoverage(p.id, fctx.links, fctx.orders);
    return { id: p.id, lat: p.lat, lng: p.lng, tone: r.tone, kind: cov.daysSince !== null && cov.daysSince <= 7 ? ("productive" as const) : cov.band === "overdue" ? ("missed" as const) : ("pending" as const), label: `${i + 1}. ${p.name}`, sub: cov.lastVisit ? `last visit ${fmtDayShort(cov.lastVisit.date)}` : "never visited", seq: i + 1 };
  });

  return (
    <RecordShell
      ctx={ctx}
      no={r.id}
      chips={
        <>
          {h.flags.includes("no-rep") && <Chip tone="danger">No rep</Chip>}
          {h.flags.includes("unplanned-week") && <Chip tone="pending">Not planned in 7 days</Chip>}
          {h.flags.includes("quiet") && <Chip tone="pending">No run in 30 days</Chip>}
        </>
      }
      title={
        renaming ? (
          <span className="flex flex-col gap-1.5">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={50} className={cn(INPUT, "h-8 text-[14px] font-semibold")} aria-label="Route name" onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), setRenaming(false))} />
            <input value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} placeholder="Where it goes, where to park…" className={INPUT_SM} aria-label="Description" />
            <span className="flex gap-2">
              <button type="button" className={cn(BTN, "h-8")} disabled={!name.trim()} onClick={() => (renameRoute(r.id, name.trim(), desc.trim()), setRenaming(false), notify("Route saved"))}>
                <Check size={12} /> Save
              </button>
              <button type="button" className={cn(GHOST, "h-8")} onClick={() => (setName(r.name), setDesc(r.description), setRenaming(false))}>
                Cancel
              </button>
            </span>
          </span>
        ) : (
          <span className="group inline-flex items-center gap-2">
            <span aria-hidden className="h-4 w-[3px] shrink-0 rounded-bz-pill" style={{ background: routeColor(r.tone) }} />
            {r.name}
            <button type="button" className={cn(PLAIN_BTN, "opacity-0 group-hover:opacity-100 focus-visible:opacity-100")} onClick={() => setRenaming(true)} aria-label="Rename" title="Rename">
              <Pencil size={12} />
            </button>
          </span>
        )
      }
      amount={h.orders30 ? <Money value={h.orders30} /> : undefined}
      meta={[`${h.parties.length} outlets`, h.reps.length ? h.reps.map((x) => x.name.split(" ")[0]).join(", ") : "no rep", runDays ? `runs ${runDays}` : "not planned ahead", r.description || null, r.subsidiaryId === "NP-02" ? "Bizak Gandaki" : null]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} onClick={() => (close(), setRenaming(true))}>
            Rename
          </MenuItem>
          <MenuItem icon={CalendarPlus} onClick={() => (close(), navigate(`/design/sfm/plan`))}>
            Open in Plan
          </MenuItem>
          <MenuItem icon={Copy} onClick={() => (close(), notify(`In the app this starts a new route with ${r.id}'s outlets and reps.`))}>
            Duplicate route
          </MenuItem>
          <MenuSep />
          <MenuItem
            icon={Trash2}
            danger
            onClick={() => {
              close();
              const ahead = fctx.plans.filter((p) => p.routeId === r.id && p.date >= FIELD_TODAY).length;
              notify(ahead ? `${r.id} has ${ahead} planned days. Remove them first.` : `${r.id} can be deleted — in the mockup it stays.`);
            }}
          >
            Delete route
          </MenuItem>
        </>
      )}
      foot={<ActivityFoot subject={`route:${r.id}`} />}
    >
      {step}

      <div className="px-5 pt-3">
        <Statline>
          <Stat label="Coverage · 30 days" value={`${h.coverage30}%`} meter={h.coverage30} title="Outlets visited at least once in the last 30 days" />
          <Stat label="Runs · 30 days" value={fctx.plans.filter((p) => p.routeId === r.id && p.date <= FIELD_TODAY && p.date >= dayAdd(FIELD_TODAY, -30)).length} />
          <Stat label="Orders · 30 days" value={<Money value={h.orders30} />} />
        </Statline>
      </div>

      {/* ── Outlets, in stop order ── */}
      <section className="border-b border-bz-line-soft px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="m-0 text-[12px] font-semibold text-bz-text">Outlets</h3>
          <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{h.parties.length}</span>
          <span className="text-[10.5px] text-bz-text-soft">in stop order · drag to reorder</span>
          <button ref={addRef} type="button" className={cn(GHOST_SM, "ml-auto")} onClick={(e) => setPop({ kind: "add", anchor: e.currentTarget })}>
            <Plus size={12} /> Add outlets
          </button>
        </div>
        {h.parties.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No outlets yet.</p>
        ) : (
          <ol className="m-0 list-none p-0">
            {h.parties.map((p, i) => (
              <OutletRow
                key={p.id}
                party={p}
                index={i}
                routeId={r.id}
                dragging={dragFrom === i}
                onDragStart={() => setDragFrom(i)}
                onDragEnd={() => setDragFrom(null)}
                onDropAt={(to) => {
                  if (dragFrom === null || dragFrom === to) return;
                  const ids = h.parties.map((x) => x.id);
                  const [m] = ids.splice(dragFrom, 1);
                  ids.splice(to, 0, m);
                  const before = h.parties.map((x) => x.id);
                  resequence(r.id, ids);
                  setDragFrom(null);
                  notify(`${h.parties[dragFrom].name} is now stop ${to + 1}`, () => resequence(r.id, before));
                }}
                onOpen={() => sheets.openParty(p.id)}
                onOrder={() => navigate(`/design/sales/orders/new?cust=${p.id}${r.repIds[0] ? `&rep=${r.repIds[0]}` : ""}&day=${FIELD_TODAY}`)}
                onRemove={() => {
                  const link = removePartyFromRoute(r.id, p.id);
                  if (link) notify(`${p.name} removed from ${r.id}${routesOfParty(p.id).length ? "" : " — it is on no route now"}`, () => restorePartyLink(link));
                }}
                onMove={(toRoute) => {
                  const link = removePartyFromRoute(r.id, p.id);
                  addPartiesToRoute(toRoute, [p.id]);
                  notify(`${p.name} moved to ${toRoute}`, () => (removePartyFromRoute(toRoute, p.id), link && restorePartyLink(link)));
                }}
              />
            ))}
          </ol>
        )}
      </section>

      {/* ── Reps ── */}
      <section className="border-b border-bz-line-soft px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="m-0 text-[12px] font-semibold text-bz-text">Reps who run it</h3>
          <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{h.reps.length}</span>
          <div className="ml-auto">
            <Select
              value={null}
              onChange={(v) => (addRepToRoute(r.id, v), notify(`${repById(v)?.name} now runs ${r.id}`, () => removeRepFromRoute(r.id, v)))}
              options={REPS.filter((x) => x.subsidiaryId === r.subsidiaryId && !r.repIds.includes(x.id)).map((x) => ({ value: x.id, label: x.name, person: personById(x.id), hint: `${fctx.routes.filter((y) => y.repIds.includes(x.id)).length} routes` }))}
              width={240}
              align="right"
              label="Add rep"
              icon={UserPlus}
            />
          </div>
        </div>
        {h.reps.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-red">Nobody runs this route.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {h.reps.map((x) => (
              <span key={x.id} className="group inline-flex items-center gap-1.5 rounded-bz-pill border border-bz-line-soft bg-bz-surface py-0.5 pl-0.5 pr-1.5">
                <button type="button" onClick={() => sheets.openRep(x.id)} className="inline-flex items-center gap-1.5 text-[12px] text-bz-text hover:underline">
                  <Avatar person={personById(x.id)} size={20} /> {x.name}
                </button>
                <button type="button" className={cn(PLAIN_BTN, "opacity-40 group-hover:opacity-100")} aria-label={`Remove ${x.name}`} title="Stop running this route — planned days stay" onClick={() => (removeRepFromRoute(r.id, x.id), notify(`${x.name.split(" ")[0]} no longer runs ${r.id} — his planned days stay`, () => addRepToRoute(r.id, x.id)))}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── The next 14 days ── */}
      <section className="border-b border-bz-line-soft px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="m-0 text-[12px] font-semibold text-bz-text">Next 14 days</h3>
          <button type="button" className={cn(GHOST_SM, "ml-auto")} onClick={(e) => setPop({ kind: "plan", anchor: e.currentTarget })} disabled={!h.parties.length}>
            <CalendarPlus size={12} /> Plan…
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const ps = plansAhead.filter((p) => p.date === d);
            const off = !isWorkday(d);
            return (
              <button
                key={d}
                type="button"
                disabled={off || (!ps.length && !h.parties.length)}
                onClick={(e) => (ps.length ? navigate(`/design/sfm/plan?week=${d}`) : setPop({ kind: "plan", anchor: e.currentTarget, date: d }))}
                className={cn("flex min-h-[48px] flex-col items-start gap-1 rounded-bz-sm border px-1.5 py-1 text-left transition-colors", d === FIELD_TODAY ? "border-bz-text-soft" : "border-bz-line-soft", off ? "bg-bz-paper-warm/60" : "bg-bz-paper hover:border-bz-line", !ps.length && !off && "hover:bg-bz-surface")}
                title={off ? "Weekly off / holiday" : ps.length ? ps.map((p) => repById(p.repId)?.name).join(", ") : `Plan ${r.id} on ${fmtDay(d)}`}
              >
                <span className={cn("text-[10px] font-semibold text-bz-text-soft", NUM)}>
                  {WEEKDAYS[new Date(d).getUTCDay()]} {Number(d.slice(8))}
                </span>
                {ps.map((p) => (
                  <span key={p.id} className="inline-flex items-center gap-1">
                    <Avatar person={personById(p.repId)} size={16} />
                    {p.partyIds && <span className="text-[9.5px] text-bz-text-soft">part</span>}
                  </span>
                ))}
                {!ps.length && !off && <Plus size={11} className="text-bz-text-soft" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Recent runs ── */}
      <section className="border-b border-bz-line-soft px-5 py-4">
        <h3 className="m-0 mb-2 text-[12px] font-semibold text-bz-text">Recent runs</h3>
        {h.runs.filter((x) => x.date < FIELD_TODAY || x.visits.length).length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Not run yet.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {h.runs
              .filter((x) => x.date < FIELD_TODAY || x.visits.length)
              .map((x) => {
                const mine = x.stops.filter((s) => s.routeId === r.id);
                const v = mine.filter((s) => s.state === "productive" || s.state === "visited").length;
                const value = x.orders.filter((o) => !o.cancelled && mine.some((s) => s.party.id === o.partyId)).reduce((s, o) => s + o.value, 0);
                return (
                  <li key={`${x.rep.id}${x.date}`}>
                    <button type="button" onClick={() => navigate(`/design/sfm/today/${x.rep.id}${x.date !== FIELD_TODAY ? `?day=${x.date}` : ""}`)} className="grid w-full grid-cols-[70px_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-bz-line-soft py-1.5 text-left text-[11.5px] last:border-0 hover:bg-bz-paper-warm">
                      <span className={cn("text-bz-text-muted", NUM)}>{x.date === FIELD_TODAY ? "Today" : fmtDayShort(x.date)}</span>
                      <span className="flex min-w-0 items-center gap-2">
                        <Avatar person={personById(x.rep.id)} size={16} />
                        <StopStrip stops={mine.map((s) => ({ state: s.state, title: s.party.name }))} size={7} />
                      </span>
                      <span className={cn("text-bz-text-muted", NUM)}>
                        {v}/{mine.length}
                      </span>
                      <span className="w-[90px] text-right">{value ? <Money value={value} code={false} /> : <span className="text-bz-text-soft">—</span>}</span>
                    </button>
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      <Section title="Map of the outlets" summary={`${h.parties.length} outlets`} defaultOpen={ctx.full}>
        <div className="h-[280px] overflow-hidden rounded-bz-md border border-bz-line-soft">
          <FieldMap compact pins={pins} trails={h.parties.length > 1 ? [{ id: "seq", points: h.parties.map((p) => [p.lat, p.lng] as [number, number]), tone: r.tone, faint: true }] : []} onPick={(id) => sheets.openParty(id)} empty="No outlets on this route yet." />
        </div>
        <p className="m-0 mt-1.5 text-[10.5px] text-bz-text-soft">The faint line joins the outlets in stop order. Full rings were visited this week; red ones not in 30 days.</p>
      </Section>

      <Activity subject={`route:${r.id}`} />

      {pop?.kind === "plan" && <PlanRepPop open anchor={pop.anchor} onClose={() => setPop(null)} routeId={r.id} notify={notify} initialDate={pop.date} />}
      {pop?.kind === "add" && <OutletPicker anchor={pop.anchor} routeId={r.id} onClose={() => setPop(null)} notify={notify} />}
    </RecordShell>
  );
}

function OutletRow({
  party,
  index,
  routeId,
  dragging,
  onDragStart,
  onDragEnd,
  onDropAt,
  onOpen,
  onOrder,
  onRemove,
  onMove,
}: {
  party: FieldParty;
  index: number;
  routeId: string;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropAt: (i: number) => void;
  onOpen: () => void;
  onOrder: () => void;
  onRemove: () => void;
  onMove: (routeId: string) => void;
}) {
  const { links, orders, routes } = useField();
  const cov = partyCoverage(party.id, links, orders);
  const [over, setOver] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const ref = React.useRef<HTMLButtonElement>(null);
  const others = routes.filter((x) => x.id !== routeId && x.subsidiaryId === party.subsidiaryId && x.repIds.length);
  return (
    <li
      draggable
      onDragStart={(e) => (e.dataTransfer.setData("text/plain", party.id), (e.dataTransfer.effectAllowed = "move"), onDragStart())}
      onDragEnd={onDragEnd}
      onDragOver={(e) => (e.preventDefault(), setOver(true))}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => (e.preventDefault(), setOver(false), onDropAt(index))}
      className={cn("group flex items-center gap-2 border-b border-bz-line-soft py-1.5 last:border-0", dragging && "opacity-40", over && "border-t-2 border-t-bz-fire")}
    >
      <GripVertical size={12} className="shrink-0 cursor-grab text-bz-text-soft opacity-40 group-hover:opacity-100" />
      <span className={cn("w-5 shrink-0 text-right text-[11px] font-semibold text-bz-text-soft", NUM)}>{index + 1}</span>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[12.5px] text-bz-text hover:underline hover:underline-offset-2">{party.name}</span>
        <span className="block truncate text-[10.5px] text-bz-text-soft">
          {party.area} · {cov.lastVisit ? `visited ${cov.daysSince === 0 ? "today" : `${cov.daysSince}d ago`}` : "never visited"}
          {cov.lastOrder ? ` · last order ${fmtDayShort(cov.lastOrder.date)}` : ""}
        </span>
      </button>
      {party.stage !== "customer" && stageChip(party.stage)}
      {cov.band === "overdue" && cov.lastVisit && <span className="shrink-0 text-[10.5px] font-medium text-bz-red">overdue</span>}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button type="button" className={cn(GHOST_SM, "h-7 px-2")} onClick={onOrder} title="New sales order for this outlet">
          <ShoppingCart size={11} />
        </button>
        <button ref={ref} type="button" className={cn(ICON_BTN, "size-7")} onClick={() => setMenu(true)} aria-label={`More for ${party.name}`}>
          <MoreHorizontal size={13} />
        </button>
      </div>
      <Popover open={menu} anchor={ref.current} onClose={() => setMenu(false)} align="right" width={250}>
        <MenuItem icon={Footprints} onClick={() => (setMenu(false), onOpen())}>
          Open outlet
        </MenuItem>
        {others.length > 0 && <MenuLabel>Move to route</MenuLabel>}
        <div className="max-h-[160px] overflow-y-auto">
          {others.map((x) => (
            <MenuItem key={x.id} icon={RouteIcon} onClick={() => (setMenu(false), onMove(x.id))}>
              {x.id} {x.name}
            </MenuItem>
          ))}
        </div>
        <MenuSep />
        <MenuItem icon={Trash2} danger onClick={() => (setMenu(false), onRemove())}>
          Remove from route
        </MenuItem>
      </Popover>
    </li>
  );
}

/** Add outlets to a route: search, tick, add. "On no route" first — the gap this is usually for. */
export function OutletPicker({ anchor, routeId, onClose, notify }: { anchor: HTMLElement; routeId: string; onClose: () => void; notify: (t: string, undo?: () => void) => void }) {
  const { links } = useField();
  const r = routeById(routeId)!;
  const [q, setQ] = React.useState("");
  const [ticked, setTicked] = React.useState<string[]>([]);
  const on = new Set(links.filter((l) => l.routeId === routeId).map((l) => l.partyId));
  const candidates = PARTIES.filter((p) => p.subsidiaryId === r.subsidiaryId && !on.has(p.id) && (!q || `${p.name} ${p.area} ${p.code}`.toLowerCase().includes(q.toLowerCase())));
  const loose = candidates.filter((p) => !links.some((l) => l.partyId === p.id));
  const placed = candidates.filter((p) => links.some((l) => l.partyId === p.id));
  const Row = ({ p }: { p: FieldParty }) => {
    const t = ticked.includes(p.id);
    const rs = routesOfParty(p.id, links);
    return (
      <button type="button" onClick={() => setTicked((x) => (t ? x.filter((y) => y !== p.id) : [...x, p.id]))} className={cn("flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left hover:bg-bz-paper-warm", t && "bg-bz-fire/10")} aria-pressed={t}>
        <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-[4px] border", t ? "border-bz-olive bg-bz-olive text-bz-fire" : "border-bz-line")}>{t && <Check size={11} strokeWidth={3} />}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] text-bz-text">{p.name}</span>
          <span className="block truncate text-[10.5px] text-bz-text-soft">
            {p.area}
            {rs.length ? ` · on ${rs.map((x) => x.id).join(", ")}` : ""}
          </span>
        </span>
        {p.stage !== "customer" && stageChip(p.stage)}
      </button>
    );
  };
  return (
    <Popover open anchor={anchor} onClose={onClose} width={340} align="right" className="p-0">
      <div className="sticky top-0 z-[1] flex items-center gap-1.5 border-b border-bz-line-soft bg-bz-surface px-3 py-2 text-bz-text-soft">
        <Search size={12} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an outlet…" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft" />
      </div>
      <div className="max-h-[300px] overflow-y-auto p-1.5">
        {loose.length > 0 && <MenuLabel>{`On no route · ${loose.length}`}</MenuLabel>}
        {loose.map((p) => (
          <Row key={p.id} p={p} />
        ))}
        {placed.length > 0 && <MenuLabel>On other routes — adds, doesn't move</MenuLabel>}
        {placed.slice(0, 40).map((p) => (
          <Row key={p.id} p={p} />
        ))}
        {!candidates.length && <p className="m-0 px-2 py-3 text-[11.5px] text-bz-text-soft">No match.</p>}
      </div>
      <div className="flex items-center gap-2 border-t border-bz-line-soft px-3 py-2">
        <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{ticked.length} ticked</span>
        <button type="button" className={cn(GHOST_SM, "ml-auto")} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={cn(BTN, "h-8 px-3")}
          disabled={!ticked.length}
          onClick={() => {
            const n = addPartiesToRoute(routeId, ticked);
            onClose();
            notify(`${n} outlet${n === 1 ? "" : "s"} added to ${routeId} — at the end of the stop order`, () => ticked.forEach((id) => removePartyFromRoute(routeId, id)));
          }}
        >
          Add {ticked.length || ""}
        </button>
      </div>
    </Popover>
  );
}

// ── New route ───────────────────────────────────────────────────────────────

/**
 * One sheet instead of four screens: name → outlets → who runs it → which weekdays. One commit creates the route,
 * its outlet map, its rep map and four weeks of plan (today: ~39 clicks across Route, Party Route Map, Salesman
 * Route Map and Employee Plan — research/01 §7).
 */
export function NewRoutePanel({ ctx }: { ctx: PanelCtx }) {
  const { links, routes, plans: fplans } = useField();
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [sub, setSub] = React.useState("NP-01");
  const [q, setQ] = React.useState("");
  const [parties, setParties] = React.useState<string[]>([]);
  const [reps, setReps] = React.useState<string[]>([]);
  const [weekdays, setWeekdays] = React.useState<number[]>([]);
  const [by, setBy] = React.useState<string | null>(null);
  const [weeks, setWeeks] = React.useState("4");
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const dup = routes.some((r) => r.name.trim().toLowerCase() === name.trim().toLowerCase() && r.subsidiaryId === sub);
  const pool = PARTIES.filter((p) => p.subsidiaryId === sub && (!q || `${p.name} ${p.area}`.toLowerCase().includes(q.toLowerCase())));
  const loose = pool.filter((p) => !links.some((l) => l.partyId === p.id));
  const placed = pool.filter((p) => links.some((l) => l.partyId === p.id));
  const areaGroups = Array.from(new Set(loose.map((p) => p.area)));
  const commit = () => {
    if (!name.trim()) return setRefusal("Name the route.");
    if (dup) return setRefusal(`A route called “${name.trim()}” already exists.`);
    if (weekdays.length && !by) return setRefusal("Pick who runs it on those days.");
    const res = createRoute({ name: name.trim(), description: desc.trim(), subsidiaryId: sub, partyIds: parties, repIds: Array.from(new Set([...reps, ...(by ? [by] : [])])), weekdays, byRepId: by, weeks: Number(weeks) });
    ctx.show("success", `${res.route.id} ${res.route.name} created · ${parties.length} outlets${res.planned ? ` · ${res.planned} days planned` : ""}`);
    navigate(`/design/sfm/routes/${res.route.id}`);
  };
  const ticked = (id: string) => parties.includes(id);
  const tick = (id: string) => setParties((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  const repOpts = REPS.filter((r) => r.subsidiaryId === sub);
  return (
    <section className="flex h-full min-h-0 flex-col bg-bz-surface">
      <header className="shrink-0 border-b border-bz-line-soft px-5 pb-3 pt-3">
        <div className="mx-auto w-full max-w-[760px]">
        <div className="flex items-center gap-2">
          <p className={cn(LABEL, "m-0")}>New route</p>
          <button type="button" className={cn(ICON_BTN, "ml-auto")} onClick={ctx.onClose} aria-label="Close" title="Close (Esc)">
            <X size={15} />
          </button>
        </div>
        <h2 className="m-0 mt-1 text-[17px] font-semibold tracking-tight text-bz-text">{name.trim() || "A new beat"}</h2>
        <p className="m-0 mt-1 text-[11.5px] text-bz-text-muted">{[`${parties.length} outlets`, reps.length || by ? Array.from(new Set([...reps, ...(by ? [by] : [])])).map((id) => repById(id)?.name.split(" ")[0]).join(", ") : "no rep yet", weekdays.length ? `runs ${weekdays.map((d) => WEEKDAYS[d]).join(" & ")}` : "not planned"].join(" · ")}</p>
        </div>
      </header>
      <SheetFrame
        onCommit={commit}
        refusal={refusal}
        onDismissRefusal={() => setRefusal(null)}
        foot={
          <div className="mx-auto flex w-full max-w-[760px] items-center justify-end gap-2">
            <button type="button" className={GHOST} onClick={ctx.onClose}>
              Cancel
            </button>
            <button type="button" className={BTN} onClick={commit} title="Create route (⌘↵)">
              <RouteIcon size={13} /> Create route
            </button>
          </div>
        }
      >
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Field label="Name" required hint={dup ? <span className="text-bz-red">A route with this name exists.</span> : "Up to 50 characters — what the reps call it."}>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="e.g. Kalimati – Teku" className={INPUT} />
            </Field>
            <Field label="Subsidiary">
              <Segmented value={sub} onChange={(v) => (setSub(v), setParties([]), setReps([]), setBy(null))} options={[{ value: "NP-01", label: "Bizak Nepal" }, { value: "NP-02", label: "Gandaki" }]} />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} placeholder="Where it starts, where to park…" className={cn(TEXTAREA, "min-h-[52px]")} />
          </Field>

          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[11.5px] font-semibold text-bz-text">Outlets</span>
              <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{parties.length} ticked · stop order = the order you tick</span>
            </div>
            <div className={cn(CARD, "overflow-hidden")}>
              <div className="flex items-center gap-1.5 border-b border-bz-line-soft px-3 py-2 text-bz-text-soft">
                <Search size={12} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an outlet or area…" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft" />
              </div>
              <div className="max-h-[260px] overflow-y-auto p-1.5">
                {loose.length > 0 && (
                  <div className="flex items-center gap-2 px-2 pb-1 pt-1.5">
                    <p className={cn(LABEL, "m-0")}>On no route · {loose.length}</p>
                    <button type="button" className="ml-auto text-[10.5px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={() => setParties((x) => Array.from(new Set([...x, ...loose.map((p) => p.id)])))}>
                      Tick all
                    </button>
                  </div>
                )}
                {areaGroups.length > 1 && loose.length > 6 && <p className="m-0 px-2 pb-1 text-[10.5px] text-bz-text-soft">Areas: {areaGroups.join(", ")}</p>}
                {loose.map((p) => (
                  <PickRow key={p.id} p={p} on={ticked(p.id)} order={parties.indexOf(p.id)} onTick={() => tick(p.id)} />
                ))}
                {placed.length > 0 && <p className={cn(LABEL, "m-0 px-2 pb-1 pt-2")}>On other routes — adds, doesn't move</p>}
                {placed.slice(0, 60).map((p) => (
                  <PickRow key={p.id} p={p} on={ticked(p.id)} order={parties.indexOf(p.id)} onTick={() => tick(p.id)} routes={routesOfParty(p.id, links).map((x) => x.id)} />
                ))}
              </div>
            </div>
          </div>

          <Field label="Reps who run it" hint="They can be planned on it; add more later.">
            <div className="flex flex-wrap gap-1.5">
              {repOpts.map((r) => {
                const on = reps.includes(r.id);
                return (
                  <button key={r.id} type="button" onClick={() => setReps((x) => (on ? x.filter((y) => y !== r.id) : [...x, r.id]))} aria-pressed={on} className={cn("inline-flex items-center gap-1.5 rounded-bz-pill border py-0.5 pl-0.5 pr-2 text-[11.5px] transition-colors", on ? "border-bz-text-muted bg-bz-fire/15 font-semibold text-bz-text" : "border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm")}>
                    <Avatar person={personById(r.id)} size={18} /> {r.name}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className={cn(CARD, "px-3.5 py-3")}>
            <p className="m-0 text-[11.5px] font-semibold text-bz-text">Plan it now <span className="font-normal text-bz-text-soft">— optional</span></p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-bz-text-muted">
              Every
              <span className="inline-flex gap-1">
                {[0, 1, 2, 3, 4, 5].map((d) => {
                  const on = weekdays.includes(d);
                  return (
                    <button key={d} type="button" aria-pressed={on} onClick={() => setWeekdays((x) => (on ? x.filter((y) => y !== d) : [...x, d].sort()))} className={cn("h-7 min-w-9 rounded-bz-sm border px-1.5 text-[11px] font-medium transition-colors", on ? "border-bz-text-muted bg-bz-fire/15 font-semibold text-bz-text" : "border-bz-line-soft hover:bg-bz-paper-warm")}>
                      {WEEKDAYS[d]}
                    </button>
                  );
                })}
              </span>
              by
              <Select value={by} onChange={setBy} options={repOpts.map((r) => ({ value: r.id, label: r.name, person: personById(r.id) }))} placeholder="Find a rep" width={220} trigger="ghost" label={by ? repById(by)?.name : "a rep"} />
              for
              <Segmented size="sm" value={weeks} onChange={setWeeks} options={[{ value: "2", label: "2 weeks" }, { value: "4", label: "4 weeks" }, { value: "8", label: "8 weeks" }]} />
            </div>
            {weekdays.length > 0 && by && (
              <p className="m-0 mt-2 text-[10.5px] text-bz-text-soft">
                {(() => {
                  const dates: string[] = [];
                  for (let i = 1; i <= Number(weeks) * 7; i++) {
                    const d = dayAdd(FIELD_TODAY, i);
                    if (weekdays.includes(new Date(d).getUTCDay())) dates.push(d);
                  }
                  const blocked = dates.filter((d) => !isWorkday(d) || leaveOf(by, d)?.status === "approved");
                  const busy = dates.filter((d) => !blocked.includes(d) && fplans.some((p) => p.repId === by && p.date === d)).length;
                  return `${dates.length - blocked.length} days from ${fmtDay(dates[0])}${blocked.length ? ` · ${blocked.length} skipped (leave or holiday)` : ""}${busy ? ` · on ${busy} of them ${repById(by)?.name.split(" ")[0]} already runs another route` : ""}.`;
                })()}
              </p>
            )}
          </div>
        </div>
      </SheetFrame>
    </section>
  );
}

function PickRow({ p, on, order, onTick, routes }: { p: FieldParty; on: boolean; order: number; onTick: () => void; routes?: string[] }) {
  return (
    <button type="button" onClick={onTick} aria-pressed={on} className={cn("flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left hover:bg-bz-paper-warm", on && "bg-bz-fire/10")}>
      <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-[4px] border text-[9px] font-bold", on ? "border-bz-olive bg-bz-olive text-bz-fire" : "border-bz-line")}>{on ? order + 1 : ""}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] text-bz-text">{p.name}</span>
        <span className="block truncate text-[10.5px] text-bz-text-soft">
          {p.area}
          {routes?.length ? ` · on ${routes.join(", ")}` : ""}
        </span>
      </span>
      {p.stage !== "customer" && stageChip(p.stage)}
    </button>
  );
}

export { pct, planRoute, plansStore, RouteChip };
