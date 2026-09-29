import * as React from "react";
import { useNavigate } from "react-router";
import {
  AlarmClock,
  ArrowRightLeft,
  Bell,
  Camera,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Footprints,
  LogIn,
  LogOut,
  MapPinned,
  Phone,
  Plus,
  Printer,
  ShoppingCart,
  UserRound,
  CalendarPlus,
  Route as RouteIcon,
} from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, DocLink, GHOST, GHOST_SM, LABEL, MenuItem, MenuSep, NUM, Stat, Statline } from "../sales/bzw";
import { RecordShell, StepCard } from "../sales/record";
import type { ShellCtx } from "../sales/record";
import { Section } from "../sales/parts";
import { itemById } from "../sales/orders";
import {
  FIELD_NOW,
  FIELD_TODAY,
  STATUS_META,
  fmtDay,
  fmtDur,
  handOver,
  nextWorkday,
  partyById,
  repById,
  repDay,
  routeById,
  toMin,
  whenOf,
} from "./model";
import type { RepDay, Stop, Unplanned } from "./model";
import { Money, RouteChip, StopMark, StopStrip, useField, useSheetLinks } from "./kit";
import { FieldMap } from "./map";
import type { MapPin } from "./map";
import { GivePop, PlanRoutePop } from "./planning";
import type { Notify } from "./planning";
import { Activity, ActivityFoot } from "./sheets";

// ════════════════════════════════════════════════════════════════════════════
// THE DAY PANEL — one rep, one day
//
//   head     date · status · the rep · the day's order value · routes, punch, phone
//   step     the ONE thing this day needs from the manager, with its button
//   figures  planned · visited (+ unplanned) · productive · orders · received
//   stops    the timeline: punch-in → each visit in time order (what came of it)
//            → the stops still to go (or missed) → punch-out → day close
//   sections where they went (map + trail) · day close (at close → now) ·
//            history & notes
//
// Replaces the Salesman-on-Map focus panel's ten requests with one read
// (BACKEND-NEEDS §B1) and adds what it never had: history, notes, and the
// verbs — hand the rest over, carry it to tomorrow, raise an order.
// ════════════════════════════════════════════════════════════════════════════

export function DayPanel({ repId, date, shell, notify, onOpenVisit }: { repId: string; date: string; shell: ShellCtx; notify: Notify; onOpenVisit: (visitId: string) => void }) {
  const { ctx } = useField();
  const navigate = useNavigate();
  const sheets = useSheetLinks();
  const d = repDay(repId, date, ctx);
  const rep = d.rep;
  const meta = STATUS_META[d.status];
  const [pop, setPop] = React.useState<{ kind: "give" | "plan"; anchor: HTMLElement } | null>(null);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const when = whenOf(date);
  const remaining = d.stops.filter((s) => s.state === "pending" || s.state === "missed");
  const openPlans = d.plans.filter((p) => d.stops.some((s) => s.routeId === p.routeId && (s.state === "pending" || s.state === "missed")));

  const carry = (toRep: string, toDate: string) => {
    let moved = 0;
    const undos: (() => void)[] = [];
    for (const p of openPlans) {
      const r = handOver(p.id, { repId: toRep, date: toDate });
      if (!r.ok) return notify("why" in r ? r.why : "Couldn't move it.");
      moved += r.moved;
      undos.push(r.undo);
    }
    notify(`${moved} stops moved to ${toRep === repId ? fmtDay(toDate) : `${repById(toRep)?.name.split(" ")[0]}${toDate !== date ? `, ${fmtDay(toDate)}` : ""}`}`, () => undos.forEach((u) => u()));
  };
  const tomorrow = nextWorkday(date);
  const newOrder = (partyId: string) => navigate(`/design/sales/orders/new?cust=${partyId}&rep=${repId}&day=${date}`);

  // ── The one thing to do ──
  const step = (() => {
    const stopsLeft = remaining.length;
    switch (d.status) {
      case "not-started":
        return (
          <StepCard
            tone="danger"
            icon={<AlarmClock size={15} />}
            title={`Not started — due ${rep.start}`}
            sub={`${d.figures.planned} stops on ${d.routes.map((r) => r.id).join(", ")}. No punch and no visit yet.`}
            actions={
              <>
                <a className={GHOST} href={`tel:${rep.phone}`}>
                  <Phone size={13} /> Call
                </a>
                <button type="button" className={BTN} onClick={(e) => setPop({ kind: "give", anchor: e.currentTarget })}>
                  <ArrowRightLeft size={13} /> Give route to…
                </button>
              </>
            }
          />
        );
      case "leave-plan":
        return (
          <StepCard
            tone="danger"
            icon={<UserRound size={15} />}
            title={`On leave — ${d.routes.map((r) => r.id).join(", ")} has no one`}
            sub={`${d.leave?.type} was approved after the plan was made. ${d.figures.planned} outlets expect a visit.`}
            actions={
              <button type="button" className={BTN} onClick={(e) => setPop({ kind: "give", anchor: e.currentTarget })}>
                <ArrowRightLeft size={13} /> Give route to…
              </button>
            }
          />
        );
      case "behind":
      case "idle":
        return (
          <StepCard
            tone={d.status === "idle" ? "danger" : "plain"}
            icon={<CalendarClock size={15} />}
            title={d.status === "idle" ? `No activity since ${d.line.split("last ")[1] ?? ""}` : `${stopsLeft} stops left · ${d.figures.behindBy} behind plan`}
            sub={d.status === "idle" ? `${stopsLeft} stops still to go.` : "At this pace the last stops won't be reached today."}
            actions={
              <>
                <button type="button" className={GHOST} onClick={(e) => setPop({ kind: "give", anchor: e.currentTarget })}>
                  Give the rest to…
                </button>
                <button type="button" className={BTN} onClick={() => carry(repId, tomorrow)}>
                  Move the rest to {fmtDay(tomorrow).split(" ")[0]}
                </button>
              </>
            }
          />
        );
      case "at-stop":
      case "in-field": {
        const next = d.stops.find((s) => s.state === "pending");
        const at = d.stops.find((s) => s.state === "here");
        return <StepCard tone="quiet" icon={<Footprints size={15} />} title="On track" sub={next ? `Next: ${next.party.name}, ${next.party.area} · ${stopsLeft} to go` : at ? `At the last stop — ${at.party.name}.` : "Every planned stop visited."} />;
      }
      case "not-closed":
        return (
          <StepCard
            tone="danger"
            icon={<Bell size={15} />}
            title="Day not closed"
            sub={`Worked until ${d.figures.lastOut}. Until the rep closes it, the day's figures are only live, never frozen.`}
            actions={
              <button type="button" className={BTN} onClick={() => notify(`Reminder sent to ${rep.name.split(" ")[0]} — close ${fmtDay(date)} from the app.`)}>
                <Bell size={13} /> Remind
              </button>
            }
          />
        );
      case "absent":
        return (
          <StepCard
            tone="danger"
            icon={<UserRound size={15} />}
            title="Planned, but didn't start"
            sub={`${d.figures.planned} stops on ${d.routes.map((r) => r.id).join(", ")} were not visited.`}
            actions={
              <button type="button" className={BTN} onClick={() => carry(repId, nextWorkday(FIELD_TODAY) > date ? nextWorkday(FIELD_TODAY) : tomorrow)}>
                Plan them again
              </button>
            }
          />
        );
      case "closed": {
        const drift = d.close && (d.close.collected !== d.figures.collected || d.close.orders !== d.figures.orders);
        return (
          <StepCard
            tone="done"
            icon={<CheckCircle2 size={15} />}
            title={`Closed ${d.close?.closedAt}`}
            sub={drift ? "Changed since the close — see Day close below." : d.figures.missed ? `${d.figures.missed} planned stops missed.` : "Every planned stop visited."}
            actions={
              d.figures.missed > 0 && when === "past" ? (
                <button type="button" className={GHOST} onClick={() => carry(repId, nextWorkday(FIELD_TODAY))} title="The missed stops go on the rep's next workday">
                  Plan the missed ones
                </button>
              ) : undefined
            }
          />
        );
      }
      case "no-plan":
        return (
          <StepCard
            tone="plain"
            icon={<RouteIcon size={15} />}
            title="No route planned"
            sub={when === "future" ? "Nothing on the board for this day yet." : "The rep has nowhere to be."}
            actions={
              <button type="button" className={BTN} onClick={(e) => setPop({ kind: "plan", anchor: e.currentTarget })}>
                <Plus size={13} /> Add a route
              </button>
            }
          />
        );
      case "planned":
        return <StepCard tone="quiet" icon={<CalendarClock size={15} />} title={`${d.figures.planned} stops planned`} sub={d.plans.map((p) => p.note).filter(Boolean).join(" · ") || "Starts " + rep.start} actions={<button type="button" className={GHOST_SM} onClick={(e) => setPop({ kind: "give", anchor: e.currentTarget })}>Give to…</button>} />;
      default:
        return <StepCard tone="quiet" icon={<CalendarClock size={15} />} title={d.line} />;
    }
  })();

  // ── Timeline ──
  type Row =
    | { kind: "punch"; t: string; label: string; place?: string }
    | { kind: "stop"; t: string; stop: Stop }
    | { kind: "unplanned"; t: string; u: Unplanned };
  const rows: Row[] = [];
  if (d.punch) rows.push({ kind: "punch", t: d.punch.in, label: "Punched in", place: d.punch.place });
  d.stops.filter((s) => s.visit).forEach((s) => rows.push({ kind: "stop", t: s.visit!.in, stop: s }));
  d.unplanned.forEach((u) => rows.push({ kind: "unplanned", t: u.visit.in, u }));
  rows.sort((a, b) => a.t.localeCompare(b.t));
  if (d.punch?.out) rows.push({ kind: "punch", t: d.punch.out, label: "Punched out" });
  const toGo = d.stops.filter((s) => !s.visit);

  const pins: MapPin[] = [
    ...d.stops.map((s, i) => ({ id: s.party.id, lat: s.party.lat, lng: s.party.lng, tone: routeById(s.routeId)?.tone ?? null, kind: s.state === "here" ? ("here" as const) : s.state, label: s.party.name, sub: `${i + 1} · ${s.state === "pending" ? "to go" : s.visit ? `${s.visit.in}${s.visit.out ? `–${s.visit.out}` : ""}` : "missed"}`, seq: i + 1 })),
    ...d.unplanned.map((u) => ({ id: u.party.id, lat: u.party.lat, lng: u.party.lng, tone: null, kind: "unplanned" as const, label: u.party.name, sub: `Unplanned · ${u.visit.in}` })),
  ];
  const last = d.fixes[d.fixes.length - 1];

  return (
    <RecordShell
      ctx={shell}
      no={`${fmtDay(date)}${when === "today" ? " · today" : ""}`}
      chips={<Chip tone={meta.tone}>{meta.label}</Chip>}
      title={
        <button type="button" className="hover:underline hover:underline-offset-4" onClick={() => sheets.openRep(repId)} title="Open the rep">
          {rep.name}
        </button>
      }
      amount={d.figures.value ? <Money value={d.figures.value} /> : undefined}
      meta={[
        d.routes.length ? (
          <span key="r" className="inline-flex flex-wrap items-center gap-1">
            {d.routes.map((r) => (
              <RouteChip key={r.id} route={r} onClick={() => navigate(`/design/sfm/routes/${r.id}`)} />
            ))}
          </span>
        ) : (
          "No route"
        ),
        d.punch ? `Punched in ${d.punch.in} · ${d.punch.place}` : when === "future" ? null : "No punch",
        <a key="ph" href={`tel:${rep.phone}`} className="inline-flex items-center gap-1 hover:text-bz-text">
          <Phone size={11} /> {rep.phone}
        </a>,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={CalendarPlus} onClick={() => (close(), navigate(`/design/sfm/plan?week=${date}&focus=${repId}`))}>
            Open in Plan
          </MenuItem>
          {openPlans.length > 0 && when !== "past" && (
            <MenuItem icon={ArrowRightLeft} onClick={() => (close(), carry(repId, tomorrow))}>
              Move the rest to {fmtDay(tomorrow)}
            </MenuItem>
          )}
          <MenuItem icon={Plus} onClick={() => (close(), anchorRef.current && setPop({ kind: "plan", anchor: anchorRef.current }))} disabled={when === "past" || !!d.leave} title={when === "past" ? "A past day can't be planned" : d.leave ? "On leave that day" : undefined}>
            Add a route this day…
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Printer} onClick={() => (close(), notify(`Day report for ${rep.name} · ${fmtDay(date)} sent to print.`))}>
            Print day report
          </MenuItem>
          <MenuItem icon={UserRound} onClick={() => (close(), sheets.openRep(repId))}>
            Open rep
          </MenuItem>
        </>
      )}
      foot={<ActivityFoot subject={`day:${repId}:${date}`} />}
    >
      {step}

      <div ref={anchorRef} className="px-5 pt-3">
        <Statline>
          <Stat label="Planned" value={d.figures.planned} />
          <Stat label="Visited" value={d.figures.visited} sub={d.figures.unplanned ? `+${d.figures.unplanned} unplanned` : undefined} meter={d.figures.planned ? (d.figures.visited / d.figures.planned) * 100 : undefined} title="Planned stops visited · unplanned visits counted apart" />
          <Stat label="Productive" value={d.figures.productive} title="Visits where the rep has an order for that party that day (orders are not linked to visits in the app)" />
          <Stat label="Orders" value={<Money value={d.figures.value} />} sub={d.figures.orders ? `${d.figures.orders} order${d.figures.orders === 1 ? "" : "s"}` : undefined} />
          <Stat label="Received" value={d.figures.received ? <Money value={d.figures.received} /> : "—"} title="Receipts the rep took. Collected = tagged to invoices; the rest is advance until back office tags it." />
          {d.figures.inMarketMin > 0 && <Stat label="In market" value={fmtDur(d.figures.inMarketMin)} />}
        </Statline>
      </div>

      <section className="px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="m-0 text-[12px] font-semibold text-bz-text">Stops</h3>
          <StopStrip stops={d.stops.map((s) => ({ state: s.state, title: s.party.name }))} unplanned={d.unplanned.map((u) => ({ title: u.party.name, productive: u.productive }))} size={8} />
        </div>
        {rows.length === 0 && toGo.length === 0 && <p className="m-0 text-[11.5px] text-bz-text-soft">{when === "future" ? "Nothing planned yet." : "Nothing happened this day."}</p>}
        <ol className="m-0 list-none p-0">
          {rows.map((r, i) =>
            r.kind === "punch" ? (
              <TimelineMark key={`p${i}`} t={r.t} icon={r.label === "Punched in" ? <LogIn size={11} /> : <LogOut size={11} />} text={`${r.label}${r.place ? ` · ${r.place}` : ""}`} />
            ) : r.kind === "stop" ? (
              <StopRow key={r.stop.party.id} stop={r.stop} index={d.stops.indexOf(r.stop) + 1} onParty={() => sheets.openParty(r.stop.party.id)} onVisit={() => r.stop.visit && onOpenVisit(r.stop.visit.id)} onOrder={() => newOrder(r.stop.party.id)} navigate={navigate} notify={notify} />
            ) : (
              <StopRow key={r.u.visit.id} unplanned={r.u} onParty={() => sheets.openParty(r.u.party.id)} onVisit={() => onOpenVisit(r.u.visit.id)} onOrder={() => newOrder(r.u.party.id)} navigate={navigate} notify={notify} />
            ),
          )}
        </ol>
        {toGo.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center gap-2">
              <p className={cn(LABEL, "m-0", toGo.some((s) => s.state === "missed") && "text-bz-red")}>{toGo.some((s) => s.state === "missed") ? `Not visited · ${toGo.length}` : `Still to go · ${toGo.length}`}</p>
              {openPlans.length > 0 && (
                <div className="ml-auto flex items-center gap-1.5">
                  {when !== "future" && (
                    <button type="button" className={cn(GHOST_SM, "h-7")} onClick={(e) => setPop({ kind: "give", anchor: e.currentTarget })}>
                      Give to…
                    </button>
                  )}
                  <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => carry(repId, when === "past" ? nextWorkday(FIELD_TODAY) : tomorrow)}>
                    {when === "past" ? `Plan for ${fmtDay(nextWorkday(FIELD_TODAY)).split(" ")[0]}` : `Move to ${fmtDay(tomorrow).split(" ")[0]}`}
                  </button>
                </div>
              )}
            </div>
            <ol className="m-0 list-none p-0">
              {toGo.map((s) => (
                <StopRow key={s.party.id} stop={s} index={d.stops.indexOf(s) + 1} onParty={() => sheets.openParty(s.party.id)} onOrder={() => newOrder(s.party.id)} navigate={navigate} notify={notify} />
              ))}
            </ol>
          </div>
        )}
        {d.close && <TimelineMark t={d.close.closedAt} icon={<CheckCircle2 size={11} />} text={`Closed the day${d.close.remarks ? ` · “${d.close.remarks}”` : ""}`} />}
      </section>

      <Section title="Where they went" summary={d.fixes.length ? `${d.fixes.length} fixes · last ${last?.t}` : "no location this day"} defaultOpen={when === "today"}>
        <div className="h-[260px] overflow-hidden rounded-bz-md border border-bz-line-soft">
          <FieldMap
            compact
            pins={pins}
            trails={d.fixes.length > 1 ? [{ id: repId, points: d.fixes.map((f) => f.at), tone: d.routes[0]?.tone ?? null }] : []}
            reps={last && when !== "future" ? [{ id: repId, lat: last.at[0], lng: last.at[1], initials: rep.initials, stale: when === "today" ? toMin(FIELD_NOW) - toMin(last.t) > 45 : true, label: rep.name, sub: `Last seen ${last.t}` }] : []}
            onPick={(id) => sheets.openParty(id)}
            empty="No location for this day."
          />
        </div>
        <p className="m-0 mt-1.5 text-[10.5px] text-bz-text-soft">Dots are fixes the phone sent; the dotted line between them is inferred, not travelled.</p>
      </Section>

      {when !== "future" && (
        <Section title="Day close" summary={d.close ? `closed ${d.close.closedAt}` : "not closed"}>
          {d.close ? (
            <CloseTable d={d} />
          ) : (
            <p className="m-0 text-[11.5px] text-bz-text-muted">Not closed yet. The figures above are live.</p>
          )}
        </Section>
      )}

      <Activity subject={`day:${repId}:${date}`} />

      {pop?.kind === "give" && <GivePop open anchor={pop.anchor} onClose={() => setPop(null)} planIds={d.plans.map((p) => p.id)} notify={notify} title={d.visits.length ? `Give the rest of ${d.routes.map((r) => r.id).join(", ")} to…` : undefined} />}
      {pop?.kind === "plan" && <PlanRoutePop open anchor={pop.anchor} onClose={() => setPop(null)} repId={repId} date={date} notify={notify} />}
    </RecordShell>
  );
}

function TimelineMark({ t, icon, text }: { t: string; icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-2.5 py-1.5 pl-[1px] text-[11.5px] text-bz-text-muted">
      <span className={cn("w-[38px] shrink-0 text-right text-[11px] text-bz-text-soft", NUM)}>{t}</span>
      <span className="flex size-4 shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted">{icon}</span>
      <span className="min-w-0 truncate">{text}</span>
    </li>
  );
}

function StopRow({
  stop,
  unplanned,
  index,
  onParty,
  onVisit,
  onOrder,
  navigate,
  notify,
}: {
  stop?: Stop;
  unplanned?: Unplanned;
  index?: number;
  onParty: () => void;
  onVisit?: () => void;
  onOrder: () => void;
  navigate: (to: string) => void;
  notify: Notify;
}) {
  const party = (stop?.party ?? unplanned?.party)!;
  const visit = stop?.visit ?? unplanned?.visit ?? null;
  const orders = stop?.orders ?? unplanned?.orders ?? [];
  const receipts = stop?.receipts ?? unplanned?.receipts ?? [];
  const state = stop ? stop.state : "unplanned";
  const dwell = visit?.out ? toMin(visit.out) - toMin(visit.in) : visit ? toMin(FIELD_NOW) - toMin(visit.in) : 0;
  const openDoc = (no: string, inStore: boolean, kind: "orders" | "receipts") => (inStore ? navigate(`/design/sales/${kind}/${no}`) : notify(`${no} is older than this mockup's sales data — in the app it opens the ${kind === "orders" ? "sales order" : "receipt"}.`));
  return (
    <li className="group flex gap-2.5 border-b border-bz-line-soft py-2 last:border-0">
      <span className={cn("w-[38px] shrink-0 pt-0.5 text-right text-[11px] text-bz-text-soft", NUM)}>{visit?.in ?? (index ? `#${index}` : "")}</span>
      <span className="pt-[3px]">
        <StopMark state={state} unplannedProductive={!!unplanned?.productive} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <button type="button" onClick={onParty} className="min-w-0 truncate text-left text-[12.5px] font-medium text-bz-text hover:underline hover:underline-offset-2" title="Open the party">
            {party.name}
          </button>
          <span className="shrink-0 truncate text-[11px] text-bz-text-soft">{party.area}</span>
          {unplanned && <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1 text-[10px] font-medium text-bz-text-muted">Unplanned</span>}
          {visit && (
            <button type="button" onClick={onVisit} className={cn("ml-auto shrink-0 text-[11px] text-bz-text-soft hover:text-bz-text hover:underline", NUM)} title="Open the visit">
              {visit.out ? `→ ${visit.out}` : "there now"} · {dwell} min
            </button>
          )}
        </div>
        {(visit || orders.length > 0) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-bz-text-muted">
            {orders.map((o) => (
              <DocLink key={o.no} no={o.no} kind={`NPR ${Math.round(o.value).toLocaleString("en-US")}`} onClick={() => openDoc(o.no, o.inStore, "orders")} />
            ))}
            {receipts.map((x) => (
              <DocLink key={x.no} no={x.no} kind={`received ${Math.round(x.amount).toLocaleString("en-US")}`} onClick={() => openDoc(x.no, x.inStore, "receipts")} />
            ))}
            {visit?.noOrderReason && !orders.length && <span>No order — {visit.noOrderReason}</span>}
            {visit && !visit.out && <span className="text-bz-pos-deep">There now</span>}
            {visit && visit.photos > 0 && (
              <span className="inline-flex items-center gap-0.5" title={`${visit.photos} photos`}>
                <Camera size={11} /> {visit.photos}
              </span>
            )}
            {visit && visit.shelf.length > 0 && (
              <span className="inline-flex items-center gap-0.5" title={visit.shelf.map((l) => `${itemById(l.itemId)?.name}: ${l.qty}`).join(" · ")}>
                <ClipboardList size={11} /> shelf {visit.shelf.length}
              </span>
            )}
            {visit?.remarks && <span className="italic">“{visit.remarks}”</span>}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-start gap-1 pt-px opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button type="button" onClick={onOrder} className={cn(GHOST_SM, "h-7 px-2")} title="A sales order for this outlet, with this rep">
          <ShoppingCart size={11} /> Order
        </button>
        {!visit && (
          <a href={`https://maps.google.com/?q=${party.lat},${party.lng}`} target="_blank" rel="noreferrer" className={cn(GHOST_SM, "h-7 px-2")} title="Directions to the outlet">
            <MapPinned size={11} />
          </a>
        )}
      </div>
    </li>
  );
}

function CloseTable({ d }: { d: RepDay }) {
  const c = d.close!;
  const rows: [string, React.ReactNode, React.ReactNode][] = [
    ["Orders", c.orders, d.figures.orders],
    ["Order value (incl. tax)", <Money key="a" value={c.value} code={false} />, <Money key="b" value={d.figures.value} code={false} />],
    ["Collected", <Money key="c" value={c.collected} code={false} />, <Money key="d" value={d.figures.collected} code={false} />],
    ["Advance (untagged)", <Money key="e" value={c.advance} code={false} />, <Money key="f" value={d.figures.advance} code={false} />],
    ["Visited of allocated", `${c.visited} of ${c.allocated}`, `${d.figures.visited} of ${d.figures.planned}`],
  ];
  return (
    <>
      <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
        <div className={cn("grid grid-cols-[minmax(0,1fr)_110px_110px] gap-2 border-b border-bz-line-soft bg-bz-paper-warm px-3 py-1.5", LABEL)}>
          <span />
          <span className="text-right">At close {c.closedAt}</span>
          <span className="text-right">Now</span>
        </div>
        {rows.map(([label, a, b]) => {
          const changed = String((a as React.ReactElement)?.props?.value ?? a) !== String((b as React.ReactElement)?.props?.value ?? b);
          return (
            <div key={label} className="grid grid-cols-[minmax(0,1fr)_110px_110px] gap-2 border-b border-bz-line-soft px-3 py-1.5 text-[12px] last:border-0">
              <span className="text-bz-text-muted">{label}</span>
              <span className={cn("text-right text-bz-text", NUM)}>{a}</span>
              <span className={cn("text-right", NUM, changed ? "font-semibold text-bz-amber-ink" : "text-bz-text")}>{b}</span>
            </div>
          );
        })}
      </div>
      <p className="m-0 mt-1.5 text-[10.5px] text-bz-text-soft">"Now" moves when back office tags a receipt to an invoice or an order is cancelled after the close. Changed figures are marked.</p>
      {c.remarks && <p className="m-0 mt-2 text-[12px] text-bz-text">Rep's note: “{c.remarks}”</p>}
    </>
  );
}

export { partyById };
