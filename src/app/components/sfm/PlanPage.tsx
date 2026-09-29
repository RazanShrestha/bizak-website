import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowRightLeft, CalendarRange, ChevronLeft, ChevronRight, Copy, GripVertical, MoreHorizontal, PanelRightClose, PanelRightOpen, Plus, Repeat, SlidersHorizontal, Trash2, Footprints, UserRound, Route as RouteIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BulkBar, BulkBtn, CARD, Empty, GHOST_SM, ICON_BTN, INPUT_SM, Kbd, LABEL, MenuItem, MenuSep, NUM, Popover, SearchField, Segmented, Select, SkeletonRows, Stat, Statline, ToastHost, useToast } from "../sales/bzw";
import { Failed } from "../masters/kit/marks";
import { useKeys } from "../sales/orders";
import { personById } from "../productivity/shared";
import {
  FIELD_TODAY,
  REPS,
  WEEKDAYS,
  dayAdd,
  fmtDay,
  fmtDayShort,
  holidayOn,
  isWorkday,
  leaveOf,
  movePlan,
  partiesOf,
  pct,
  planRoute,
  plansStore,
  removePlan,
  repById,
  repDay,
  restorePlan,
  routeById,
  routeHealth,
  undoMove,
  weekOf,
  whenOf,
  addRepToRoute,
} from "./model";
import type { FieldPlan } from "./model";
import { RouteChip, SfmFrame, StopStrip, TodayLink, routeColor, useField, useSheetLinks } from "./kit";
import { GivePop, PlanRoutePop, PlanRepPop } from "./planning";
import { SheetHost } from "./sheets";

// ════════════════════════════════════════════════════════════════════════════
// PLAN — who runs which route on which day, for everyone at once
//
// The dispatch-board archetype (Dynamics schedule board, research/04 P2): reps
// as rows, days as columns, a tray of routes with their week count. Planning
// is emptying the tray. Every gesture is one incremental write (model rule 4)
// and every refusal is said where it happened — a drop on a leave day, a
// holiday, a duplicate — never a silent shift.
//
// Replaces the one-rep, one-month, current-year calendar (Employee Plan) and
// the plan half of Salesman Route Map (research/01 §2.3, §2.4).
// ════════════════════════════════════════════════════════════════════════════

type Drag = { kind: "plan"; id: string } | { kind: "route"; id: string };
const DRAG_MIME = "application/x-bzw-sfm";

export function PlanPage() {
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const { plans, routes, ctx } = useField();
  const sheets = useSheetLinks();
  const { toast, show, dismiss } = useToast();
  const flag = (k: string) => search.get(k) === "1";
  const anchor = search.get("week") ?? FIELD_TODAY;
  const focus = search.get("focus");
  const [span, setSpan] = React.useState<"1" | "2">("1");
  const days = React.useMemo(() => {
    const w = weekOf(anchor);
    return span === "2" ? [...w, ...weekOf(dayAdd(w[0], 7))] : w;
  }, [anchor, span]);
  const [q, setQ] = React.useState("");
  const [sub, setSub] = React.useState<string[]>(["NP-01"]);
  const [pick, setPick] = React.useState<string | null>(null);
  const [tray, setTray] = React.useState(true);
  const [trayQ, setTrayQ] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [cellPop, setCellPop] = React.useState<{ repId: string; date: string; anchor: HTMLElement } | null>(null);
  const [chipPop, setChipPop] = React.useState<{ planId: string; anchor: HTMLElement } | null>(null);
  const [givePop, setGivePop] = React.useState<{ planIds: string[]; anchor: HTMLElement } | null>(null);
  const [routePop, setRoutePop] = React.useState<{ routeId: string; anchor: HTMLElement } | null>(null);
  const [refusal, setRefusal] = React.useState<{ key: string; text: string } | null>(null);
  const [over, setOver] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(flag("fail"));
  const rowRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  React.useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), flag("slow") ? 2400 : 320);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (!focus || loading) return;
    rowRefs.current[focus]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focus, loading]);
  React.useEffect(() => {
    if (!refusal) return;
    const id = window.setTimeout(() => setRefusal(null), 3800);
    return () => window.clearTimeout(id);
  }, [refusal]);

  const setWeek = (d: string) => {
    const p = new URLSearchParams(search);
    if (weekOf(d)[0] === weekOf(FIELD_TODAY)[0]) p.delete("week");
    else p.set("week", d);
    setSearch(p);
  };
  const notify = (text: string, undo?: () => void) => show(undo ? "success" : "info", text, undo ? { label: "Undo", run: undo } : undefined);
  const refuse = (key: string, text: string) => setRefusal({ key, text });

  const reps = REPS.filter((r) => (!sub.length || sub.includes(r.subsidiaryId)) && (!q || r.name.toLowerCase().includes(q.toLowerCase())));
  const workdays = days.filter(isWorkday);
  const cellPlans = (repId: string, date: string) => plans.filter((p) => p.repId === repId && p.date === date);

  // ── Figures for the visible span ──
  const slots = reps.flatMap((r) => workdays.filter((d) => !(leaveOf(r.id, d)?.status === "approved")).map((d) => ({ r, d })));
  const plannedSlots = slots.filter(({ r, d }) => cellPlans(r.id, d).length > 0);
  const openSlots = slots.filter(({ r, d }) => !cellPlans(r.id, d).length && d >= FIELD_TODAY);
  const onLeave = reps.flatMap((r) => workdays.filter((d) => leaveOf(r.id, d)?.status === "approved" && cellPlans(r.id, d).length > 0).map((d) => ({ r, d })));
  const subRoutes = routes.filter((rt) => !sub.length || sub.includes(rt.subsidiaryId));
  const inSpan = (rtId: string) => plans.filter((p) => p.routeId === rtId && days.includes(p.date)).length;
  const unplannedRoutes = subRoutes.filter((rt) => partiesOf(rt.id).length > 0 && inSpan(rt.id) === 0);
  const coveredParties = new Set(plans.filter((p) => days.includes(p.date) && reps.some((r) => r.id === p.repId)).flatMap((p) => (p.partyIds ?? partiesOf(p.routeId).map((x) => x.id))));
  const allParties = new Set(subRoutes.flatMap((rt) => partiesOf(rt.id).map((x) => x.id)));

  const rowFilter = (repId: string) => {
    if (pick === "open") return openSlots.some((s) => s.r.id === repId);
    if (pick === "leave") return onLeave.some((s) => s.r.id === repId);
    return true;
  };
  const shownReps = reps.filter((r) => rowFilter(r.id));

  // ── Writes ──
  const drop = (repId: string, date: string, data: Drag, copy: boolean) => {
    const key = `${repId}|${date}`;
    if (data.kind === "route") {
      const rt = routeById(data.id)!;
      if (!rt.repIds.includes(repId)) {
        // One click does both: the rep gets the route and the day (spec §4.1).
        addRepToRoute(rt.id, repId);
      }
      const { added, skipped } = planRoute(repId, data.id, [date]);
      if (!added.length) return refuse(key, skipped[0] ? `${fmtDay(date)}: ${skipped[0].why}.` : "Nothing planned.");
      return notify(`${rt.id} planned for ${repById(repId)?.name.split(" ")[0]}, ${fmtDay(date)}${!rt.repIds.includes(repId) ? " — added to his routes" : ""}`, () => plansStore.set((ps) => ps.filter((p) => p.id !== added[0].id)));
    }
    const p = plans.find((x) => x.id === data.id);
    if (!p || (p.repId === repId && p.date === date)) return;
    if (copy) {
      const { added, skipped } = planRoute(repId, p.routeId, [date]);
      if (!added.length) return refuse(key, `${fmtDay(date)}: ${skipped[0]?.why ?? "not planned"}.`);
      return notify(`${routeById(p.routeId)?.id} copied to ${fmtDay(date)}`, () => plansStore.set((ps) => ps.filter((x) => x.id !== added[0].id)));
    }
    const res = movePlan(p.id, { repId, date });
    if (!res.ok) return refuse(key, "why" in res ? res.why : "Can't move it there.");
    notify(`${routeById(p.routeId)?.id} moved to ${repId !== p.repId ? `${repById(repId)?.name.split(" ")[0]}, ` : ""}${fmtDay(date)}`, () => undoMove(p.id, res.from));
  };

  const bulkMove = (by: number) => {
    const done: { id: string; from: FieldPlan }[] = [];
    const skipped: string[] = [];
    for (const id of selected) {
      const p = plans.find((x) => x.id === id);
      if (!p) continue;
      const res = movePlan(id, { date: dayAdd(p.date, by) });
      if (res.ok) done.push({ id, from: res.from });
      else skipped.push(`${routeById(p.routeId)?.id} ${fmtDayShort(p.date)} (${"why" in res ? res.why.replace(/\.$/, "") : "refused"})`);
    }
    setSelected(new Set(skipped.length ? [...selected].filter((id) => !done.some((d) => d.id === id)) : []));
    notify(`${done.length} moved ${by > 0 ? "forward" : "back"} ${Math.abs(by)} day${Math.abs(by) === 1 ? "" : "s"}${skipped.length ? ` · skipped ${skipped.join("; ")}` : ""}`, done.length ? () => done.forEach((d) => undoMove(d.id, d.from)) : undefined);
  };
  const bulkRemove = () => {
    const gone = [...selected].map((id) => removePlan(id)).filter((p): p is FieldPlan => !!p);
    setSelected(new Set());
    notify(`${gone.length} plan${gone.length === 1 ? "" : "s"} removed`, () => gone.forEach(restorePlan));
  };
  const copyWeek = (repIds: string[]) => {
    const from = weekOf(days[0]).map((d) => dayAdd(d, -7));
    const added: string[] = [];
    const skipped: string[] = [];
    for (const repId of repIds)
      from.forEach((d, i) =>
        plans
          .filter((p) => p.repId === repId && p.date === d)
          .forEach((p) => {
            const r = planRoute(repId, p.routeId, [weekOf(days[0])[i]]);
            added.push(...r.added.map((a) => a.id));
            r.skipped.filter((s) => s.why !== "already planned").forEach((s) => skipped.push(`${repById(repId)?.name.split(" ")[0]} ${fmtDayShort(s.date)} (${s.why})`));
          }),
      );
    notify(added.length ? `Copied last week: ${added.length} planned${skipped.length ? ` · skipped ${skipped.join("; ")}` : ""}` : "Nothing to copy — this week already matches last week.", added.length ? () => plansStore.set((ps) => ps.filter((p) => !added.includes(p.id))) : undefined);
  };
  const clearWeek = (repId: string) => {
    const gone = plans.filter((p) => p.repId === repId && days.includes(p.date) && p.date >= FIELD_TODAY).map((p) => removePlan(p.id)).filter((p): p is FieldPlan => !!p);
    notify(`${gone.length} plan${gone.length === 1 ? "" : "s"} cleared for ${repById(repId)?.name.split(" ")[0]}`, gone.length ? () => gone.forEach(restorePlan) : undefined);
  };

  useKeys({
    escape: () => (selected.size ? setSelected(new Set()) : pick ? setPick(null) : undefined),
  });
  const [copyOpen, setCopyOpen] = React.useState(false);
  const copyRef = React.useRef<HTMLButtonElement>(null);

  const label = `${fmtDayShort(days[0])} – ${fmtDayShort(days[days.length - 1])}`;
  /** "5 of 6 out · 1 on leave" — a plan on a leave day is not a rep out. */
  const dayHead = (d: string) => {
    const leave = reps.filter((r) => leaveOf(r.id, d)?.status === "approved").length;
    const out = reps.filter((r) => cellPlans(r.id, d).length && !(leaveOf(r.id, d)?.status === "approved")).length;
    return `${out} of ${reps.length} out${leave ? ` · ${leave} on leave` : ""}`;
  };
  // Viewing this week alone: say what next week still lacks, one click away (the tab's badge counts it).
  const nextWeek = weekOf(dayAdd(weekOf(FIELD_TODAY)[0], 7));
  const nextOpen = span === "1" && weekOf(days[0])[0] === weekOf(FIELD_TODAY)[0] ? reps.reduce((s, r) => s + nextWeek.filter((d) => isWorkday(d) && !cellPlans(r.id, d).length && !(leaveOf(r.id, d)?.status === "approved")).length, 0) : 0;
  const colTemplate = `minmax(168px,200px) repeat(${days.length}, minmax(${span === "2" ? 88 : 116}px, 1fr))`;

  return (
    <SfmFrame tab="plan">
      <div className="flex h-full min-h-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">
            <Statline>
              <Stat label="Rep-days planned" value={`${plannedSlots.length} of ${slots.length}`} meter={pct(plannedSlots.length, slots.length)} title="Workdays in view, leave excluded" />
              <Stat label="Not planned" value={openSlots.length} danger={openSlots.length > 0} active={pick === "open"} onPick={() => setPick(pick === "open" ? null : "open")} title="Workdays from today with no route" />
              {nextOpen > 0 && <Stat label="Next week" value={`${nextOpen} not planned`} danger onPick={() => setWeek(nextWeek[0])} title="Open next week" />}
              <Stat label="Plans on leave days" value={onLeave.length} danger={onLeave.length > 0} active={pick === "leave"} onPick={() => setPick(pick === "leave" ? null : "leave")} title="Leave approved after the day was planned — the route has no one" />
              <Stat label="Routes not planned" value={unplannedRoutes.length} danger={unplannedRoutes.length > 0} onPick={() => (setTray(true), setTrayQ(""))} title="Routes with outlets and no day in view — they sit at the top of the tray" />
              <Stat label="Outlets covered" value={`${[...allParties].filter((x) => coveredParties.has(x)).length} of ${allParties.size}`} meter={pct([...allParties].filter((x) => coveredParties.has(x)).length, allParties.size)} />
            </Statline>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">
            <div className="inline-flex h-8 items-stretch overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
              <button type="button" className="flex w-7 items-center justify-center text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" onClick={() => setWeek(dayAdd(days[0], -7))} aria-label="Previous week" title="Previous week">
                <ChevronLeft size={14} />
              </button>
              <span className={cn("flex items-center gap-1.5 border-x border-bz-line-soft px-2.5 text-[12px] font-semibold text-bz-text", NUM)}>
                <CalendarRange size={12} className="text-bz-text-muted" /> {label}
              </span>
              <button type="button" className="flex w-7 items-center justify-center text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" onClick={() => setWeek(dayAdd(days[0], 7))} aria-label="Next week" title="Next week">
                <ChevronRight size={14} />
              </button>
            </div>
            <TodayLink date={weekOf(days[0])[0] === weekOf(FIELD_TODAY)[0] ? FIELD_TODAY : days[0]} onToday={() => setWeek(FIELD_TODAY)} />
            <Segmented size="sm" value={span} onChange={(v) => setSpan(v as "1" | "2")} options={[{ value: "1", label: "Week" }, { value: "2", label: "2 weeks" }]} />
            <div className="min-w-[150px] flex-1 md:max-w-[200px]">
              <SearchField value={q} onChange={setQ} placeholder="Find a rep" />
            </div>
            <Select multiple label="Subsidiary" icon={SlidersHorizontal} badge={sub.length} applied={sub.length > 0} value={sub} onChange={setSub} options={[{ value: "NP-01", label: "Bizak Nepal" }, { value: "NP-02", label: "Bizak Gandaki" }]} width={220} />
            <div className="ml-auto flex items-center gap-1.5">
              <button ref={copyRef} type="button" className={GHOST_SM} onClick={() => setCopyOpen(true)} title="Plan this week the way last week ran">
                <Copy size={12} /> Copy last week
              </button>
              <button type="button" className={cn(ICON_BTN, "hidden lg:inline-flex")} onClick={() => setTray((v) => !v)} title={tray ? "Hide the routes tray" : "Show the routes tray"} aria-label="Routes tray">
                {tray ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
              </button>
            </div>
            <Popover open={copyOpen} anchor={copyRef.current} onClose={() => setCopyOpen(false)} align="right" width={250}>
              <MenuItem icon={Copy} onClick={() => (setCopyOpen(false), copyWeek(shownReps.map((r) => r.id)))} hint="Leave, holidays and what is already planned are skipped">
                Every rep shown ({shownReps.length})
              </MenuItem>
              <MenuSep />
              {shownReps.map((r) => (
                <MenuItem key={r.id} onClick={() => (setCopyOpen(false), copyWeek([r.id]))}>
                  {r.name}
                </MenuItem>
              ))}
            </Popover>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4 pb-24 md:p-6 md:pb-24 [scrollbar-width:thin]">
            {loading ? (
              <div className={cn(CARD, "overflow-hidden")}>
                <SkeletonRows rows={7} text="Reading the plan…" />
              </div>
            ) : failed ? (
              <div className={CARD}>
                <Failed text="Couldn't read the plan." onRetry={() => setFailed(false)} />
              </div>
            ) : flag("empty") || !reps.length ? (
              <div className={CARD}>
                <Empty title={flag("empty") ? "No sales reps yet." : "No rep matches."} icon={UserRound} />
              </div>
            ) : (
              <div className={cn(CARD, "min-w-max overflow-hidden lg:min-w-0")}>
                {/* Head: the days */}
                <div className="sticky top-0 z-20 grid border-b border-bz-line bg-bz-paper-warm" style={{ gridTemplateColumns: colTemplate }}>
                  <div className={cn(LABEL, "flex items-center px-3 py-2")}>Rep</div>
                  {days.map((d) => {
                    const hol = holidayOn(d);
                    const off = !isWorkday(d);
                    return (
                      <div key={d} className={cn("border-l border-bz-line-soft px-2 py-1.5", d === FIELD_TODAY && "bg-bz-fire/15")}>
                        <p className={cn("m-0 text-[11px] font-semibold", d === FIELD_TODAY ? "text-bz-text" : off ? "text-bz-text-soft" : "text-bz-text-muted", NUM)}>
                          {WEEKDAYS[new Date(d).getUTCDay()]} {Number(d.slice(8))}
                          {d === FIELD_TODAY && <span className="ml-1 text-[10px] font-medium text-bz-text-muted">today</span>}
                        </p>
                        <p className="m-0 truncate text-[10px] text-bz-text-soft">{hol ? hol.name : off ? "Weekly off" : dayHead(d)}</p>
                      </div>
                    );
                  })}
                </div>
                {shownReps.map((r) => (
                  <div key={r.id} ref={(el) => (rowRefs.current[r.id] = el)} className={cn("grid border-b border-bz-line-soft last:border-0", focus === r.id && "bg-bz-fire/5")} style={{ gridTemplateColumns: colTemplate }}>
                    <RepHead repId={r.id} onOpen={() => sheets.openRep(r.id)} onCopy={() => copyWeek([r.id])} onClear={() => clearWeek(r.id)} />
                    {days.map((d) => {
                      const key = `${r.id}|${d}`;
                      const ps = cellPlans(r.id, d);
                      const lv = leaveOf(r.id, d);
                      const off = !isWorkday(d);
                      const w = whenOf(d);
                      const day = w !== "future" && ps.length ? repDay(r.id, d, ctx) : null;
                      return (
                        <div
                          key={d}
                          onDragOver={(e) => {
                            if (w === "past" || off) return;
                            e.preventDefault();
                            e.dataTransfer.dropEffect = e.altKey ? "copy" : "move";
                            setOver(key);
                          }}
                          onDragLeave={() => setOver((o) => (o === key ? null : o))}
                          onDrop={(e) => {
                            e.preventDefault();
                            setOver(null);
                            try {
                              drop(r.id, d, JSON.parse(e.dataTransfer.getData(DRAG_MIME)) as Drag, e.altKey);
                            } catch {
                              /* not ours */
                            }
                          }}
                          className={cn(
                            "group relative flex min-h-[64px] flex-col gap-1 border-l border-bz-line-soft p-1.5",
                            d === FIELD_TODAY && "bg-bz-fire/[0.06]",
                            off && "bg-bz-paper-warm/70",
                            w === "past" && "bg-bz-paper/60",
                            lv && "bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--bz-line-soft)_6px_7px)]",
                            over === key && "outline outline-2 -outline-offset-2 outline-bz-fire",
                          )}
                        >
                          {lv && <span className={cn("text-[10px] font-medium", lv.status === "approved" ? "text-bz-text-muted" : "text-bz-text-soft")}>{lv.status === "approved" ? "On leave" : "Leave requested"}</span>}
                          {ps.map((p) => (
                            <PlanChip
                              key={p.id}
                              plan={p}
                              selected={selected.has(p.id)}
                              conflict={lv?.status === "approved"}
                              draggable={w !== "past"}
                              strip={day ? day.stops.filter((s) => s.routeId === p.routeId) : null}
                              onClick={(e) => {
                                if (e.shiftKey || e.metaKey || e.ctrlKey) {
                                  setSelected((s) => {
                                    const n = new Set(s);
                                    if (n.has(p.id)) n.delete(p.id);
                                    else n.add(p.id);
                                    return n;
                                  });
                                } else setChipPop({ planId: p.id, anchor: e.currentTarget });
                              }}
                            />
                          ))}
                          {!ps.length && !off && !lv && w !== "past" && (
                            <button
                              type="button"
                              onClick={(e) => setCellPop({ repId: r.id, date: d, anchor: e.currentTarget })}
                              className="flex flex-1 items-center justify-center rounded-bz-sm border border-dashed border-transparent text-[11px] text-bz-text-soft opacity-0 transition-opacity hover:border-bz-line hover:text-bz-text group-hover:opacity-100 focus-visible:opacity-100"
                              aria-label={`Plan ${r.name} on ${fmtDay(d)}`}
                            >
                              <Plus size={12} /> Plan
                            </button>
                          )}
                          {!ps.length && w === "past" && !off && !lv && <span className="text-[10px] text-bz-text-soft">—</span>}
                          {refusal?.key === key && <span role="alert" className="absolute inset-x-1 bottom-1 z-10 rounded-bz-sm bg-bz-red-soft px-1.5 py-1 text-[10.5px] leading-snug text-bz-red shadow-sm">{refusal.text}</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
            {!loading && (
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-bz-text-soft">
                <span>Drag a route from the tray or a chip to another day · <Kbd>Alt</Kbd> copies</span>
                <span><Kbd>⇧</Kbd> click chips to select several</span>
                <span>Past days show what happened</span>
              </p>
            )}
          </div>
        </div>

        {tray && (
          <RouteTray
            routes={subRoutes}
            q={trayQ}
            onQ={setTrayQ}
            countIn={inSpan}
            onPlan={(routeId, anchor) => setRoutePop({ routeId, anchor })}
            onOpen={(routeId) => navigate(`/design/sfm/routes/${routeId}`)}
          />
        )}
      </div>

      {cellPop && <PlanRoutePop open anchor={cellPop.anchor} onClose={() => setCellPop(null)} repId={cellPop.repId} date={cellPop.date} notify={notify} />}
      {chipPop && (
        <ChipPop
          planId={chipPop.planId}
          anchor={chipPop.anchor}
          onClose={() => setChipPop(null)}
          notify={notify}
          onGive={() => (setChipPop(null), setGivePop({ planIds: [chipPop.planId], anchor: chipPop.anchor }))}
        />
      )}
      {givePop && <GivePop open anchor={givePop.anchor} onClose={() => setGivePop(null)} planIds={givePop.planIds} notify={notify} />}
      {routePop && <PlanRepPop open anchor={routePop.anchor} onClose={() => setRoutePop(null)} routeId={routePop.routeId} notify={notify} />}

      <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
        <BulkBtn onClick={() => bulkMove(-1)}>− 1 day</BulkBtn>
        <BulkBtn onClick={() => bulkMove(1)}>+ 1 day</BulkBtn>
        <BulkBtn onClick={() => bulkMove(7)}>+ 1 week</BulkBtn>
        <Select
          trigger="plain"
          value={null}
          width={240}
          placeholder="Give to…"
          options={REPS.map((r) => ({ value: r.id, label: r.name, person: personById(r.id) }))}
          onChange={(repId) => {
            const done: { id: string; from: FieldPlan }[] = [];
            const skipped: string[] = [];
            for (const id of selected) {
              const res = movePlan(id, { repId });
              if (res.ok) done.push({ id, from: res.from });
              else skipped.push("why" in res ? res.why : id);
            }
            setSelected(new Set());
            notify(`${done.length} given to ${repById(repId)?.name}${skipped.length ? ` · skipped: ${skipped.join(" ")}` : ""}`, done.length ? () => done.forEach((d) => undoMove(d.id, d.from)) : undefined);
          }}
        >
          <span className="inline-flex h-7 items-center gap-1.5 rounded-bz-md bg-white/[0.08] px-2.5 text-[11.5px] font-medium text-bz-text-on-dark hover:bg-white/[0.14]">
            <ArrowRightLeft size={12} /> Give to…
          </span>
        </Select>
        <BulkBtn onClick={bulkRemove}>
          <Trash2 size={12} /> Remove
        </BulkBtn>
      </BulkBar>
      <SheetHost onOpenDay={(id, d) => navigate(`/design/sfm/today/${id}${d !== FIELD_TODAY ? `?day=${d}` : ""}`)} />
      <ToastHost toast={toast} onDismiss={dismiss} lifted={selected.size > 0} />
    </SfmFrame>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function RepHead({ repId, onOpen, onCopy, onClear }: { repId: string; onOpen: () => void; onCopy: () => void; onClear: () => void }) {
  const { routes } = useField();
  const ref = React.useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = React.useState(false);
  const rep = repById(repId)!;
  const n = routes.filter((r) => r.repIds.includes(repId)).length;
  return (
    <div className="group/head sticky left-0 z-10 flex items-center gap-2 bg-bz-surface px-3 py-2">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-2 text-left" title={`Open ${rep.name}`}>
        <Avatar person={personById(repId)} size={26} />
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold text-bz-text hover:underline hover:underline-offset-2">{rep.name}</span>
          <span className="block text-[10.5px] text-bz-text-soft">{n} route{n === 1 ? "" : "s"}</span>
        </span>
      </button>
      <button ref={ref} type="button" className={cn(ICON_BTN, "size-6 opacity-0 group-hover/head:opacity-100 focus-visible:opacity-100", menu && "opacity-100")} onClick={() => setMenu(true)} aria-label={`More for ${rep.name}`}>
        <MoreHorizontal size={13} />
      </button>
      <Popover open={menu} anchor={ref.current} onClose={() => setMenu(false)} width={220}>
        <MenuItem icon={Copy} onClick={() => (setMenu(false), onCopy())}>
          Copy last week
        </MenuItem>
        <MenuItem icon={Trash2} onClick={() => (setMenu(false), onClear())} hint="From today on — past days stay" danger>
          Clear this week
        </MenuItem>
        <MenuSep />
        <MenuItem icon={UserRound} onClick={() => (setMenu(false), onOpen())}>
          Open rep
        </MenuItem>
      </Popover>
    </div>
  );
}

function PlanChip({ plan, selected, conflict, draggable, strip, onClick }: { plan: FieldPlan; selected: boolean; conflict: boolean; draggable: boolean; strip: { state: import("./model").StopState; party: { name: string } }[] | null; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const r = routeById(plan.routeId);
  if (!r) return null;
  const n = plan.partyIds?.length ?? partiesOf(r.id).length;
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_MIME, JSON.stringify({ kind: "plan", id: plan.id } satisfies Drag));
        e.dataTransfer.effectAllowed = "copyMove";
      }}
      onClick={onClick}
      title={`${r.id} ${r.name} · ${n} stops${plan.note ? ` · ${plan.note}` : ""}${conflict ? " · on leave — give it to someone" : ""}`}
      className={cn(
        "flex w-full min-w-0 flex-col gap-1 rounded-bz-sm border bg-bz-surface px-1.5 py-1 text-left transition-shadow hover:shadow-[0_1px_4px_rgba(15,20,17,0.12)] focus-visible:outline-2 focus-visible:outline-bz-fire",
        selected ? "border-bz-text-muted ring-2 ring-bz-fire" : conflict ? "border-bz-red-mark" : "border-bz-line-soft",
        draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span aria-hidden className="h-3.5 w-[3px] shrink-0 rounded-bz-pill" style={{ background: routeColor(r.tone) }} />
        <span className={cn("shrink-0 text-[10.5px] font-semibold text-bz-text-muted", NUM)}>{r.id}</span>
        <span className="min-w-0 truncate text-[11px] text-bz-text">{r.name}</span>
      </span>
      {strip ? (
        <StopStrip stops={strip.map((s) => ({ state: s.state, title: s.party.name }))} size={6} />
      ) : (
        <span className={cn("text-[10px]", conflict ? "text-bz-red" : "text-bz-text-soft")}>{conflict ? "On leave · give it" : `${n} stops${plan.partyIds ? " (part)" : ""}`}</span>
      )}
    </button>
  );
}

function ChipPop({ planId, anchor, onClose, notify, onGive }: { planId: string; anchor: HTMLElement; onClose: () => void; notify: (t: string, undo?: () => void) => void; onGive: (anchor: HTMLElement) => void }) {
  const { plans, ctx } = useField();
  const navigate = useNavigate();
  const p = plans.find((x) => x.id === planId);
  const [repeat, setRepeat] = React.useState(false);
  const [until, setUntil] = React.useState(() => (p ? dayAdd(p.date, 28) : FIELD_TODAY));
  const [moving, setMoving] = React.useState(false);
  const [to, setTo] = React.useState(p?.date ?? FIELD_TODAY);
  const giveRef = React.useRef<HTMLButtonElement>(null);
  if (!p) return null;
  const r = routeById(p.routeId)!;
  const h = routeHealth(r.id, ctx);
  const w = whenOf(p.date);
  const lastRun = h.runs.find((x) => x.visits.length && x.date < p.date);
  const rep = repById(p.repId)!;
  return (
    <Popover open anchor={anchor} onClose={onClose} width={290}>
      <div className="px-2 pb-2 pt-1.5">
        <div className="flex items-center gap-1.5">
          <RouteChip route={r} tight />
          <span className="min-w-0 truncate text-[12.5px] font-semibold text-bz-text">{r.name}</span>
        </div>
        <p className="m-0 mt-1 text-[11px] text-bz-text-muted">
          {rep.name} · {fmtDay(p.date)} · {p.partyIds?.length ?? h.parties.length} stops
        </p>
        {p.note && <p className="m-0 mt-0.5 text-[11px] text-bz-text-soft">{p.note}</p>}
        {lastRun && (
          <p className="m-0 mt-1.5 flex items-center gap-1.5 text-[11px] text-bz-text-soft">
            Last run {fmtDayShort(lastRun.date)}: <StopStrip stops={lastRun.stops.filter((s) => s.routeId === r.id).map((s) => ({ state: s.state, title: s.party.name }))} size={6} />
          </p>
        )}
      </div>
      {w !== "future" && (
        <MenuItem icon={Footprints} onClick={() => (onClose(), navigate(`/design/sfm/today/${p.repId}${p.date !== FIELD_TODAY ? `?day=${p.date}` : ""}`))}>
          Open the day
        </MenuItem>
      )}
      <MenuItem icon={RouteIcon} onClick={() => (onClose(), navigate(`/design/sfm/routes/${r.id}`))}>
        Open route
      </MenuItem>
      {w !== "past" && (
        <>
          <MenuSep />
          <button ref={giveRef} type="button" className="flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12.5px] text-bz-text hover:bg-bz-paper-warm" onClick={() => giveRef.current && onGive(giveRef.current)}>
            <ArrowRightLeft size={13} className="text-bz-text-muted" /> Give to…
          </button>
          {moving ? (
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <input type="date" value={to} min={FIELD_TODAY} onChange={(e) => e.target.value && setTo(e.target.value)} className={cn(INPUT_SM, "h-7 flex-1")} aria-label="Move to" />
              <button
                type="button"
                className={cn(GHOST_SM, "h-7")}
                onClick={() => {
                  const res = movePlan(p.id, { date: to });
                  onClose();
                  if (!res.ok) notify("why" in res ? res.why : "Can't move it there.");
                  else notify(`${r.id} moved to ${fmtDay(to)}`, () => undoMove(p.id, res.from));
                }}
              >
                Move
              </button>
            </div>
          ) : (
            <MenuItem icon={CalendarRange} onClick={() => setMoving(true)}>
              Move to another day…
            </MenuItem>
          )}
          {repeat ? (
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <span className="text-[11px] text-bz-text-muted">Weekly until</span>
              <input type="date" value={until} min={p.date} onChange={(e) => e.target.value && setUntil(e.target.value)} className={cn(INPUT_SM, "h-7 flex-1")} aria-label="Repeat until" />
              <button
                type="button"
                className={cn(GHOST_SM, "h-7")}
                onClick={() => {
                  const dates: string[] = [];
                  for (let d = dayAdd(p.date, 7); d <= until; d = dayAdd(d, 7)) dates.push(d);
                  const { added, skipped } = planRoute(p.repId, p.routeId, dates);
                  onClose();
                  notify(`${added.length} weeks planned${skipped.length ? ` · skipped ${skipped.map((s) => `${fmtDayShort(s.date)} (${s.why})`).join(", ")}` : ""}`, added.length ? () => plansStore.set((ps) => ps.filter((x) => !added.some((a) => a.id === x.id))) : undefined);
                }}
              >
                Plan
              </button>
            </div>
          ) : (
            <MenuItem icon={Repeat} onClick={() => setRepeat(true)}>
              Repeat every week…
            </MenuItem>
          )}
          <MenuSep />
          <MenuItem
            icon={Trash2}
            danger
            onClick={() => {
              const gone = removePlan(p.id);
              onClose();
              if (gone) notify(`${r.id} removed from ${rep.name.split(" ")[0]}, ${fmtDay(p.date)}`, () => restorePlan(gone));
            }}
          >
            Remove
          </MenuItem>
        </>
      )}
    </Popover>
  );
}

function RouteTray({ routes, q, onQ, countIn, onPlan, onOpen }: { routes: import("./model").FieldRoute[]; q: string; onQ: (v: string) => void; countIn: (id: string) => number; onPlan: (routeId: string, anchor: HTMLElement) => void; onOpen: (routeId: string) => void }) {
  const shown = routes
    .filter((r) => !q || `${r.id} ${r.name}`.toLowerCase().includes(q.toLowerCase()))
    .map((r) => ({ r, n: countIn(r.id), stops: partiesOf(r.id).length }))
    .sort((a, b) => (a.stops === 0 ? 1 : 0) - (b.stops === 0 ? 1 : 0) || a.n - b.n || a.r.id.localeCompare(b.r.id));
  const idle = shown.filter((x) => x.n === 0 && x.stops > 0).length;
  return (
    <aside className="hidden h-full min-h-0 w-[264px] shrink-0 flex-col border-l border-bz-line bg-bz-paper lg:flex" aria-label="Routes">
      <div className="border-b border-bz-line-soft px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-[12px] font-semibold text-bz-text">Routes</h3>
          {idle > 0 && <span className={cn("rounded-bz-pill bg-bz-red-soft px-1.5 text-[10px] font-semibold leading-4 text-bz-red", NUM)} title="Not planned in view">{idle} not planned</span>}
        </div>
        <p className="m-0 mt-0.5 text-[10.5px] text-bz-text-soft">Drag onto a rep's day.</p>
        <SearchField className="mt-2" value={q} onChange={onQ} placeholder="Find a route" />
      </div>
      <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-2 [scrollbar-width:thin]">
        {shown.map(({ r, n, stops }) => (
          <li
            key={r.id}
            draggable={stops > 0}
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_MIME, JSON.stringify({ kind: "route", id: r.id } satisfies Drag));
              e.dataTransfer.effectAllowed = "copy";
            }}
            className={cn("group mb-1 flex items-start gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2 py-1.5", stops > 0 ? "cursor-grab active:cursor-grabbing hover:border-bz-line" : "opacity-60")}
          >
            <GripVertical size={12} className="mt-0.5 shrink-0 text-bz-text-soft" />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <span aria-hidden className="h-3 w-[3px] shrink-0 rounded-bz-pill" style={{ background: routeColor(r.tone) }} />
                <button type="button" onClick={() => onOpen(r.id)} className="min-w-0 truncate text-left text-[11.5px] font-medium text-bz-text hover:underline">
                  <span className={cn("mr-1 text-bz-text-muted", NUM)}>{r.id}</span>
                  {r.name}
                </button>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-bz-text-soft">
                <span className={NUM}>{stops} stops</span>·
                <span className={cn(NUM, n === 0 && stops > 0 && "font-semibold text-bz-red")}>{stops === 0 ? "no outlets yet" : `×${n} in view`}</span>
                <span className="ml-auto flex -space-x-1">
                  {r.repIds.slice(0, 3).map((id) => (
                    <Avatar key={id} person={personById(id)} size={15} ring />
                  ))}
                  {!r.repIds.length && <span className="text-bz-red">no rep</span>}
                </span>
              </div>
            </div>
            {stops > 0 && (
              <button type="button" className={cn(ICON_BTN, "size-6 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100")} onClick={(e) => onPlan(r.id, e.currentTarget)} title="Plan it" aria-label={`Plan ${r.id}`}>
                <Plus size={12} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
