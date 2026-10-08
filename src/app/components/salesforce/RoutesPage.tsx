import * as React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowDown, ArrowUp, CalendarPlus, GripVertical, Pencil, Plus, Table2, Trash2, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, ICON_BTN, INPUT, MenuItem, MenuSep, NUM, Portal, Select } from "../sales/bzw";
import type { SelectOption } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { Amount, useKeys, useMedia } from "../sales/orders";
import { RecordShell } from "../sales/record";
import { createStore, useStore } from "../sales/store";
import type { Cadence, Customer, Route, RoutePlan } from "./data";
import { typeOf } from "./engine";
import { DAYS, EVERY_LABEL, EVERY_SHORT, dayLabel } from "./field-data";
import { HEAD_BTN, MapCanvas, MapLabel, StatusPill } from "./fx";
import type { MapPoint } from "./fx";
import { FxDesk } from "./fx-desk";
import { MultiPicker, Picker } from "./network-form";
import { monthValue } from "./network-model";
import { openQuickAdd } from "./quickadd";
import { addStop, createRoute, deleteRoute, moveCustomerToRoute, moveStop, planRoute, plannedText, removeStop, renameRoute, restorePlan, restoreRoute, restoreStop, setStopEvery, unplanRoute } from "./routes";
import { FField, FIELDS, GROUPS, Group, overlayUp } from "./setup-frame";
import { SfActivity, SfNoteFoot, TypeMark, Who, sfPath } from "./sf";
import { customersStore, hubStore, repsStore, routePlanStore, routesStore, schemesStore, typesStore } from "./store";
import { NotAvailable, markRemoved, wasRemoved } from "./customers-kit";

// ════════════════════════════════════════════════════════════════════════════
// ROUTES — how customers are walked (owner decision #28)
//
// A route is a named, ORDERED group of customers, and the plan gives a route to
// a rep on a weekday. This place is where a route is built: the list on the
// shared desk, and the route in a wide sheet — its stops on a map in visit
// order, the same stops as a list that is dragged into order, the customers
// still to add, and the days it runs.
// Every write goes through `routes.ts`; nothing here touches a store.
// ════════════════════════════════════════════════════════════════════════════

/** `cities` = the cities its customers are in, in visit order. */
type Row = { r: Route; cities: string[]; plans: RoutePlan[]; planned: string; per4w: number; value: number };

const ADD = "__add";
const CADENCES: Cadence[] = [1, 2, 4];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const andList = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const firstOf = (name: string) => name.split(" ")[0];

/** The route whose record should open with "Plan this route" already up — the list's "Plan" asks for it. */
const planAskStore = createStore<string | null>(null);

const CARD = "overflow-hidden rounded-[12px] border border-bz-line-soft";
const EMPTY = "m-0 px-4 py-6 text-center text-[13px] text-bz-text-muted";
const QUIET = "rounded-bz-sm text-left text-[12px] font-medium text-bz-text-muted underline-offset-2 transition-colors hover:text-bz-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire";
const ROW_BTN = cn(ICON_BTN, "size-7");
const WASH = "hover:bg-[color-mix(in_srgb,var(--bz-paper-warm)_50%,var(--bz-surface))]";
const HOT = "bg-[color-mix(in_srgb,var(--fx-accent)_9%,var(--bz-surface))]";

/** Where a route goes, on one line: its first two cities, then how many more — "Kathmandu · Lalitpur +1". */
const citiesText = (cities: string[]) => `${cities.slice(0, 2).join(" · ")}${cities.length > 2 ? ` +${cities.length - 2}` : ""}`;

export function RoutesPage() {
  const { no } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const routes = useStore(routesStore);
  const plans = useStore(routePlanStore);
  const customers = useStore(customersStore);
  const reps = useStore(repsStore);
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  const types = useStore(typesStore);
  // The same widths at which the desk lets the count columns, then the Planned column, into the grid.
  const roomy = useMedia("(min-width: 1024px)");
  const wide = useMedia("(min-width: 1280px)");

  const rows = React.useMemo<Row[]>(
    () => {
      const cityOf = new Map(customers.map((c) => [c.id, c.city?.trim() ?? ""]));
      return routes.map((r) => {
        const mine = plans.filter((p) => p.routeId === r.id).sort((a, b) => a.day - b.day);
        return {
          r,
          cities: [...new Set(r.stops.map((s) => cityOf.get(s.customerId) ?? "").filter(Boolean))],
          plans: mine,
          planned: plannedText(r.id),
          // Every day the route runs takes each stop as often as its own frequency says.
          per4w: mine.length * r.stops.reduce((s, x) => s + 4 / x.every, 0),
          value: monthValue(hub, new Set(r.stops.map((s) => s.customerId)), schemes),
        };
      });
    },
    // `reps` and `types` are read through the stores by plannedText and the engine.
    [routes, plans, reps, hub, schemes, customers, types], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const nameOf = new Map(customers.map((c) => [c.id, c.name]));
  const routed = new Set(routes.flatMap((r) => r.stops.map((s) => s.customerId)));
  const asked = customers.filter((c) => typeOf(c).visitsPer4w > 0);
  const unplanned = rows.filter((x) => x.plans.length === 0);

  const arrived = search.get("rep") ? [`rep:${search.get("rep")}`] : [];
  const gone = !!no && no !== "new" && !rows.some((x) => x.r.id === no) && !wasRemoved(no);

  return (
    <FxDesk<Row>
      place="routes"
      section="salesforce/routes"
      noun={["route", "routes"]}
      numberWidth="64px"
      partyLabel="Route"
      amountLabel="This month"
      showPeriod={false}
      recordWide
      searchPlaceholder="Route, city or customer"
      rows={rows}
      noOf={(x) => x.r.id}
      rowLabel={(x) => x.r.name}
      searchText={(x) => `${x.r.name} ${x.r.id} ${x.cities.join(" ")} ${x.r.stops.map((s) => nameOf.get(s.customerId) ?? "").join(" ")}`}
      initialFilters={arrived.length ? arrived : undefined}
      stats={asked.length ? [{ label: "On a route", value: `${asked.filter((c) => routed.has(c.id)).length} of ${count(asked.length, "customer")}`, title: "Customers whose type asks for visits" }] : []}
      picks={[
        { key: "unplanned", label: "Not planned", value: unplanned.length, test: (x) => x.plans.length === 0, danger: unplanned.length > 0, title: "Nobody runs it" },
        { key: "empty", label: "Empty", value: rows.filter((x) => x.r.stops.length === 0).length, test: (x) => x.r.stops.length === 0, title: "No customers on it" },
      ]}
      views={[{ key: "all", label: "All", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] }]}
      filters={reps.map((p) => ({ value: `rep:${p.id}`, label: p.name, hint: p.role, group: "Rep", test: (x: Row) => x.plans.some((q) => q.repId === p.id) }))}
      sorts={[
        { key: "az", label: "Name", by: (x) => x.r.name.toLowerCase() },
        { key: "cust", label: "Customers", by: (x) => x.r.stops.length, desc: true },
        { key: "sales", label: "Sales", by: (x) => x.value, desc: true },
      ]}
      columns={[
        { key: "cust", label: "Customers", width: "84px", align: "right", render: (x) => <span className={cn(NUM, x.r.stops.length ? "text-bz-text" : "text-bz-text-soft")}>{x.r.stops.length}</span> },
        {
          key: "visits",
          label: "Visits in 4 weeks",
          width: "116px",
          align: "right",
          render: (x) =>
            x.plans.length ? (
              <span className={cn("text-bz-text", NUM)} title={`${count(x.r.stops.length, "stop")} on ${count(x.plans.length, "day")} a week`}>
                {x.per4w}
              </span>
            ) : (
              <span className="text-bz-text-soft" title="Not planned">
                —
              </span>
            ),
        },
        {
          key: "planned",
          label: "Planned",
          width: "168px",
          render: (x) =>
            x.plans.length ? (
              <span title={x.planned}>{x.planned}</span>
            ) : (
              <span className="flex">
                <StatusPill tone="warn">Not planned</StatusPill>
              </span>
            ),
        },
      ]}
      primary={(x) => {
        // Where it goes, then what the grid drops at this width. A route with no city to name has no second line.
        const parts = [
          citiesText(x.cities),
          !roomy && count(x.r.stops.length, "customer"),
          !wide && (x.plans.length ? x.planned : <span className="text-bz-amber-ink">Not planned</span>),
        ].filter(Boolean);
        return {
          title: x.r.name,
          sub: parts.length
            ? parts.map((p, i) => (
                <React.Fragment key={i}>
                  {i > 0 && " · "}
                  {p}
                </React.Fragment>
              ))
            : undefined,
          subOnDesktop: true,
        };
      }}
      amount={(x) => ({ value: <Amount value={x.value} className={x.value ? undefined : "font-normal text-bz-text-soft"} /> })}
      // A route with customers and no day is one step from running.
      rowVerb={(x, go) => (x.r.stops.length > 0 && x.plans.length === 0 ? { label: "Plan", icon: CalendarPlus, run: () => (planAskStore.set(() => x.r.id), go(x.r.id)) } : null)}
      // It has nothing to export, so the shared Export chip stands down.
      exportMenu={<></>}
      newLabel="New route"
      onNew={() => navigate(sfPath("routes/new"))}
      renderPanel={(x, ctx) => <RoutePanel key={x.r.id} x={x} ctx={ctx} />}
      renderNew={(ctx) => <NewRoute ctx={ctx} />}
      renderExtra={({ go }) => gone && <NotAvailable text="This route isn't available." back="Back to routes" onBack={() => go(null)} />}
    />
  );
}

// ── The record ──────────────────────────────────────────────────────────────

function RoutePanel({ x, ctx }: { x: Row; ctx: PanelCtx }) {
  const route = x.r;
  const routes = useStore(routesStore);
  const customers = useStore(customersStore);
  const reps = useStore(repsStore);
  // A stop's type (its colour, and whether it asks for visits) is read through the engine.
  useStore(typesStore);
  const ask = useStore(planAskStore);
  const listRef = React.useRef<HTMLOListElement>(null);
  const planRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHot] = React.useState<string | null>(null);
  const [renaming, setRenaming] = React.useState(false);
  const [planning, setPlanning] = React.useState(false);
  const { drag, start } = useStopDrag(listRef, (from, to) => moveStop(route.id, from, to));
  // The stop under the pointer, on the list or on the map — nothing is, while a stop is being dragged over the others.
  const hot = drag ? null : hovered;
  const repName = (id: string) => reps.find((r) => r.id === id)?.name;

  React.useEffect(() => {
    if (ask !== route.id) return;
    planAskStore.set(() => null);
    setPlanning(true);
    const t = window.setTimeout(() => planRef.current?.scrollIntoView({ block: "center" }), 0);
    return () => window.clearTimeout(t);
  }, [ask, route.id]);

  // An arrow keeps the keyboard on the stop it moved, so it can be pressed again.
  const refocus = React.useRef<{ id: string; by: number } | null>(null);
  React.useEffect(() => {
    const f = refocus.current;
    if (!f) return;
    refocus.current = null;
    const row = [...(listRef.current?.querySelectorAll<HTMLElement>("[data-stop]") ?? [])].find((el) => el.dataset.stop === f.id);
    (row?.querySelector<HTMLButtonElement>(`[data-move="${f.by}"]:not(:disabled)`) ?? row?.querySelector<HTMLButtonElement>("[data-move]:not(:disabled)"))?.focus();
  });

  const byId = new Map(customers.map((c) => [c.id, c] as const));
  const stops = route.stops.map((s) => ({ s, c: byId.get(s.customerId) }));
  const here = new Set(route.stops.map((s) => s.customerId));
  /** The OTHER routes each customer is on. */
  const elsewhere = new Map<string, Route[]>();
  for (const r of routes) if (r.id !== route.id) for (const s of r.stops) elsewhere.set(s.customerId, [...(elsewhere.get(s.customerId) ?? []), r]);
  const byName = (a: Customer, b: Customer) => a.name.localeCompare(b.name);
  // Who a route is most likely for: visited by its type, and walked by nobody yet.
  const waiting = customers.filter((c) => !here.has(c.id) && !elsewhere.has(c.id) && typeOf(c).visitsPer4w > 0).sort(byName);
  const rest = customers.filter((c) => !here.has(c.id) && !waiting.includes(c)).sort(byName);

  // ── Actions ──
  const add = (id: string, tell?: boolean) => {
    const refusal = addStop(route.id, id);
    if (refusal) return ctx.show("error", refusal);
    if (tell) ctx.show("success", `${customersStore.get().find((c) => c.id === id)?.name ?? "The customer"} added`, { label: "Undo", run: () => removeStop(route.id, id) });
  };
  const pick = (v: string) => {
    if (v !== ADD) return add(v);
    openQuickAdd("customer", { onCreated: (id) => add(id, true) });
  };
  const remove = (i: number) => {
    const stop = route.stops[i];
    const name = byId.get(stop.customerId)?.name ?? "The removed customer";
    removeStop(route.id, stop.customerId);
    ctx.show("info", `${name} taken off the route`, { label: "Undo", run: () => restoreStop(route.id, stop, i) });
  };
  const step = (i: number, by: -1 | 1) => {
    refocus.current = { id: route.stops[i].customerId, by };
    moveStop(route.id, i, i + by);
  };
  const unplan = (p: RoutePlan) => {
    const was = unplanRoute(p.id);
    if (was) ctx.show("info", `${route.name} taken off ${firstOf(repName(p.repId) ?? "the removed rep")}'s ${dayLabel(p.day)}`, { label: "Undo", run: () => restorePlan(was) });
  };
  const del = () => {
    // Leave the record as it goes, so the desk never draws "not available" for a route just deleted.
    markRemoved(route.id);
    const was = deleteRoute(route.id);
    ctx.onClose();
    if (was) ctx.show("info", `${route.name} deleted`, { label: "Undo", run: () => restoreRoute(was) });
  };

  // ── The map: the stops in visit order ──
  const located = stops.flatMap((z, i) => (z.c?.location ? [{ c: z.c, at: z.c.location, n: i + 1 }] : []));
  const toRow = (id: string) => [...(listRef.current?.querySelectorAll<HTMLElement>("[data-stop]") ?? [])].find((el) => el.dataset.stop === id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  const points = located.map<MapPoint>((p) => ({
    key: `s:${p.c.id}`,
    lat: p.at.lat,
    lng: p.at.lng,
    z: hot === p.c.id ? 9 : 3,
    node: <Pin n={p.n} name={p.c.name} hot={hot === p.c.id} onHot={(on) => setHot((h) => (on ? p.c.id : h === p.c.id ? null : h))} onPick={() => toRow(p.c.id)} />,
  }));
  // Framed on who is drawn, in no order: changing the visit order does not move the map.
  const frameKey = located
    .map((p) => p.c.id)
    .sort()
    .join(",");

  return (
    <RecordShell
      ctx={ctx}
      no={route.id}
      chips={<StatusPill tone={x.plans.length ? "good" : "warn"}>{x.plans.length ? "Planned" : "Not planned"}</StatusPill>}
      title={<RouteName route={route} editing={renaming} setEditing={setRenaming} onDone={(text) => ctx.show("success", text)} />}
      meta={[
        <span key="c" className={NUM}>
          {count(stops.length, "customer")}
        </span>,
        x.plans.length > 0 && (
          <span key="v" className={NUM} title="What its stops add up to on the days it runs">
            {count(x.per4w, "visit")} in 4 weeks
          </span>
        ),
        <span key="m" title="Orders this month from its customers that were not rejected">
          This month <Amount value={x.value} currency="NPR" className="text-bz-text" />
        </span>,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} onClick={() => (close(), setRenaming(true))}>
            Rename
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Trash2} danger onClick={() => (close(), del())}>
            Delete route
          </MenuItem>
        </>
      )}
      foot={<SfNoteFoot id={route.id} />}
    >
      {points.length > 0 && (
        <div className="px-5 pt-4">
          <MapCanvas points={points} path={located.map((p) => p.at)} focusKey={frameKey} pad={36} className="h-[220px] rounded-[10px] border border-bz-line-soft max-sm:h-[180px]">
            <div data-map-ui className={cn("pointer-events-none absolute left-2.5 top-2.5 z-20 flex max-w-[calc(100%-20px)] flex-wrap gap-1.5", NUM)}>
              {located.length < stops.length && (
                <span className={MAP_NOTE}>
                  {located.length} of {stops.length} have a location
                </span>
              )}
            </div>
          </MapCanvas>
        </div>
      )}

      <div className="border-b border-bz-line-soft px-5 py-5">
        <Group title="Stops" count={stops.length} right={points.length === 0 && stops.length > 0 ? <span className="text-[12px] text-bz-text-soft">None has a location yet</span> : undefined}>
          <div className={cn(CARD, "@container")}>
            {stops.length === 0 ? (
              <p className={EMPTY}>No customers on it yet.</p>
            ) : (
              <ol ref={listRef} className={cn("relative m-0 list-none p-0", drag && "cursor-grabbing select-none")}>
                {stops.map(({ s, c }, i) => {
                  const name = c?.name ?? "Removed customer";
                  const lit = hot === s.customerId && !!c?.location;
                  const also = elsewhere.get(s.customerId) ?? [];
                  return (
                    <li
                      key={s.customerId}
                      data-stop-row=""
                      data-stop={s.customerId}
                      onMouseEnter={() => setHot(s.customerId)}
                      onMouseLeave={() => setHot((h) => (h === s.customerId ? null : h))}
                      className={cn(
                        // The sheet can be narrowed on a wide screen, so the row answers to the card's width, not the window's.
                        "group flex min-h-[52px] flex-wrap items-center gap-x-2.5 gap-y-2 border-t border-bz-line-soft py-2 pl-1.5 pr-2 transition-[background-color,opacity] first:border-t-0 @min-[540px]:flex-nowrap @min-[540px]:gap-x-3",
                        drag?.from === i ? "opacity-40" : lit ? HOT : !drag && WASH,
                      )}
                    >
                      <span aria-hidden title="Drag to change the order" onPointerDown={(e) => start(e, i, name)} className="flex h-8 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-[6px] text-bz-text-soft transition-colors hover:bg-bz-paper-warm hover:text-bz-text">
                        <GripVertical size={14} />
                      </span>
                      <StopNo n={i + 1} located={!!c?.location} hot={lit} />
                      <span className="min-w-0 flex-1 leading-snug">
                        {c ? (
                          <Link to={sfPath(`customers/${c.id}`)} title={`Open ${c.name}`} className="block truncate text-[13px] font-medium text-bz-text hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-bz-fire">
                            {c.name}
                          </Link>
                        ) : (
                          <span className="block truncate text-[13px] text-bz-text-soft">{name}</span>
                        )}
                        {c && (
                          <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-bz-text-soft">
                            <TypeMark name={typeOf(c).name} color={typeOf(c).color} className="shrink-0 text-bz-text-soft" />
                            <span className="min-w-0 truncate">{[c.city, also.length ? `also on ${also.map((r) => r.name).join(", ")}` : ""].filter(Boolean).map((t) => ` · ${t}`)}</span>
                          </span>
                        )}
                      </span>
                      {c && (
                        <span className="order-last flex w-full shrink-0 pl-16 @min-[540px]:order-none @min-[540px]:w-auto @min-[540px]:pl-0">
                          <Every name={c.name} value={s.every} onChange={(v) => setStopEvery(route.id, s.customerId, v)} />
                        </span>
                      )}
                      <span className="-mr-0.5 flex shrink-0 items-center">
                        <span className="flex items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                          <button type="button" data-move="-1" className={ROW_BTN} disabled={i === 0} onClick={() => step(i, -1)} aria-label={`Move ${name} up`} title="Move up">
                            <ArrowUp size={13} />
                          </button>
                          <button type="button" data-move="1" className={ROW_BTN} disabled={i === stops.length - 1} onClick={() => step(i, 1)} aria-label={`Move ${name} down`} title="Move down">
                            <ArrowDown size={13} />
                          </button>
                        </span>
                        <button type="button" className={cn(ROW_BTN, "hover:text-bz-red")} onClick={() => remove(i)} aria-label={`Take ${name} off the route`} title="Take off the route">
                          <X size={13} />
                        </button>
                      </span>
                    </li>
                  );
                })}
                {drag && drag.line !== null && <li aria-hidden className="pointer-events-none absolute inset-x-0 z-[2] h-0.5 -translate-y-1/2 bg-[var(--fx-accent)]" style={{ top: drag.line }} />}
              </ol>
            )}
            <div className="flex border-t border-bz-line-soft">
              <Select
                trigger="plain"
                searchable
                width={340}
                placeholder="Customer, type or route"
                value={null}
                onChange={pick}
                options={[
                  ...waiting.map((c) => ({ value: c.id, label: c.name, hint: [typeOf(c).name, c.city].filter(Boolean).join(" · "), group: "On no route" })),
                  ...rest.map((c) => {
                    const on = elsewhere.get(c.id) ?? [];
                    return { value: c.id, label: c.name, hint: on.length ? `On ${on.map((r) => r.name).join(", ")}` : [typeOf(c).name, c.city].filter(Boolean).join(" · "), group: waiting.length ? "Other customers" : "Customers" };
                  }),
                  { value: ADD, label: "New customer" },
                ]}
                className={cn("h-11 w-full gap-2.5 px-3.5 text-left text-[13px] text-bz-text-muted hover:text-bz-text focus-visible:-outline-offset-2", WASH)}
              >
                <Plus size={14} className="shrink-0 text-bz-text-soft" />
                Add a customer…
              </Select>
            </div>
          </div>
        </Group>
      </div>

      <div ref={planRef} className="border-b border-bz-line-soft px-5 py-5">
        <Group
          title="Planned"
          count={x.plans.length}
          right={
            !planning && (
              <button type="button" onClick={() => setPlanning(true)} className={cn(HEAD_BTN, "h-8 px-2.5")}>
                <CalendarPlus size={13} className="text-bz-text-muted" /> Plan this route
              </button>
            )
          }
        >
          {x.plans.length > 0 ? (
            <div className={CARD}>
              {x.plans.map((p) => {
                const who = repName(p.repId);
                return (
                  <div key={p.id} className="flex min-h-[52px] items-center gap-3 border-t border-bz-line-soft py-2 pl-3.5 pr-2 first:border-t-0">
                    <Who name={who} size={24} />
                    <span className="min-w-0 flex-1 truncate text-[13px]">
                      <span className="font-medium text-bz-text">{dayLabel(p.day)}</span>
                      <span className="text-bz-text-muted"> · {who ?? "Removed rep"}</span>
                    </span>
                    {who && (
                      <Link to={sfPath(`plan/${p.repId}`)} className={cn(QUIET, "shrink-0 whitespace-nowrap")}>
                        Open the plan
                      </Link>
                    )}
                    <button type="button" className={cn(ROW_BTN, "hover:text-bz-red")} onClick={() => unplan(p)} aria-label={`Take it off ${dayLabel(p.day)}`} title="Take it off this day">
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            !planning && <p className={cn(EMPTY, "rounded-[12px] border border-dashed border-bz-line")}>Nobody runs it yet.</p>
          )}
          {planning && <PlanForm route={route} plans={x.plans} lead={x.plans.length > 0} onClose={() => setPlanning(false)} show={ctx.show} />}
        </Group>
      </div>

      <SfActivity ids={[route.id]} />

      {drag && (
        <Portal>
          <div aria-hidden className="pointer-events-none fixed z-[1090] flex max-w-[260px] -translate-y-1/2 translate-x-4 items-center gap-2 rounded-[10px] border border-bz-line bg-bz-surface px-2.5 py-2 text-[13px] font-medium text-bz-text shadow-[var(--bz-shadow-panel)]" style={{ left: drag.x, top: drag.y }}>
            <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-[11px] font-semibold text-bz-text-muted", NUM)}>{drag.to + 1}</span>
            <span className="min-w-0 truncate">{drag.name}</span>
          </div>
        </Portal>
      )}
    </RecordShell>
  );
}

const MAP_NOTE = "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-bz-line-soft bg-[var(--fx-glass)] px-2 text-[11px] text-bz-text-muted backdrop-blur-md";

/** The route's name, renamed where it stands: a click (or the pencil) turns it into a field; Enter keeps it, Esc lets go. */
function RouteName({ route, editing, setEditing, onDone }: { route: Route; editing: boolean; setEditing: (v: boolean) => void; onDone: (text: string) => void }) {
  const [text, setText] = React.useState(route.name);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  // The field leaves the page as it settles, and leaving blurs it: a settled edit answers nothing more.
  const settled = React.useRef(false);
  React.useEffect(() => {
    if (!editing) return;
    settled.current = false;
    setText(route.name);
    setRefusal(null);
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps
  const stop = () => {
    settled.current = true;
    setEditing(false);
    setRefusal(null);
  };
  /** Enter says why a name cannot be kept and stays; leaving the field lets such a name go. */
  const commit = (leaving: boolean) => {
    if (settled.current) return;
    const was = route.name;
    const said = renameRoute(route.id, text);
    if (said && !leaving) return setRefusal(said);
    stop();
    const now = text.trim().replace(/\s+/g, " ");
    if (!said && now !== was) onDone(`Renamed to ${now}`);
  };
  if (!editing)
    return (
      <button type="button" onClick={() => setEditing(true)} title="Rename" className="group -mx-1.5 inline-flex max-w-full items-center gap-2 rounded-bz-md px-1.5 text-left transition-colors hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire">
        <span className="min-w-0 truncate">{route.name}</span>
        <Pencil size={13} className="shrink-0 text-bz-text-soft opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100" />
      </button>
    );
  return (
    <span className="-mx-1.5 block">
      <input
        autoFocus
        data-bzw-editing=""
        aria-label="Route name"
        value={text}
        onChange={(e) => (setText(e.target.value), setRefusal(null))}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => commit(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.preventDefault(), commit(false));
          else if (e.key === "Escape") (e.preventDefault(), stop());
        }}
        className={cn("block h-8 w-full rounded-bz-md border bg-bz-paper px-[5px] text-[17px] font-semibold tracking-tight text-bz-text outline-none", refusal ? "border-bz-red-mark" : "border-bz-line focus:border-bz-text-muted")}
      />
      {refusal && (
        <span role="alert" className="mt-1 block px-1.5 text-[11.5px] font-normal tracking-normal text-bz-red">
          {refusal}
        </span>
      )}
    </span>
  );
}

/** A stop's number, as its marker on the map: tinted when the stop is on the map, plain when the customer has no location yet. */
function StopNo({ n, located, hot }: { n: number; located: boolean; hot: boolean }) {
  return (
    <span
      title={located ? undefined : "No location yet — not on the map"}
      className={cn("flex size-6 shrink-0 items-center justify-center rounded-bz-pill text-[11px] font-semibold transition-colors", NUM, !located ? "bg-bz-paper-warm text-bz-text-soft" : hot ? "text-bz-olive" : "text-bz-pos-deep")}
      style={located ? { background: hot ? "var(--fx-accent)" : "color-mix(in srgb, var(--fx-accent) 16%, transparent)" } : undefined}
    >
      {n}
    </span>
  );
}

/** A stop on the map: its number in the accent ink. Under the pointer it grows and says who it is. */
function Pin({ n, name, hot, onHot, onPick }: { n: number; name: string; hot: boolean; onHot: (on: boolean) => void; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      onMouseEnter={() => onHot(true)}
      onMouseLeave={() => onHot(false)}
      onFocus={() => onHot(true)}
      onBlur={() => onHot(false)}
      aria-label={`Stop ${n}: ${name}`}
      className="relative block rounded-bz-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire"
    >
      <span className={cn("flex items-center justify-center rounded-bz-pill font-semibold text-bz-olive transition-[width,height] duration-150", NUM, hot ? "size-[26px] text-[12px]" : "size-[22px] text-[11px]")} style={{ background: "var(--fx-accent)", boxShadow: "0 0 0 2px var(--bz-surface)" }}>
        {n}
      </span>
      {hot && (
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2">
          <MapLabel on>{name}</MapLabel>
        </span>
      )}
    </button>
  );
}

/** How often the route's run takes this stop: weekly, fortnightly or monthly. */
function Every({ name, value, onChange }: { name: string; value: Cadence; onChange: (v: Cadence) => void }) {
  return (
    <span role="radiogroup" aria-label={`How often ${name} is visited`} className="inline-flex items-center gap-0.5 rounded-[9px] border border-bz-line-soft bg-bz-paper-warm p-[2px]">
      {CADENCES.map((v) => {
        const on = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            title={EVERY_LABEL[v]}
            onClick={() => onChange(v)}
            className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-[7px] px-2 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-bz-fire", on ? "bg-bz-surface font-semibold text-bz-text shadow-[inset_0_0_0_1px_var(--bz-line)]" : "font-medium text-bz-text-muted hover:text-bz-text")}
          >
            {cap(EVERY_SHORT[v])}
          </button>
        );
      })}
    </span>
  );
}

// ── Reordering by drag ──────────────────────────────────────────────────────

type StopDrag = { from: number; to: number; name: string; x: number; y: number; /** Where the stop would land, as a line's offset in the list; null when it would not move. */ line: number | null };

const scrollerOf = (el: HTMLElement): HTMLElement | null => {
  for (let p = el.parentElement; p; p = p.parentElement) if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) return p;
  return null;
};

/**
 * A stop dragged by its grip: a line shows where it would land, and letting go moves it there. The sheet scrolls
 * when the pointer nears its top or bottom, so a long route can be reordered end to end. Esc lets go without moving.
 */
function useStopDrag(listRef: React.RefObject<HTMLOListElement | null>, drop: (from: number, to: number) => void) {
  const [drag, setDrag] = React.useState<StopDrag | null>(null);
  const live = React.useRef(drop);
  live.current = drop;
  const start = (ev: React.PointerEvent<HTMLElement>, from: number, name: string) => {
    const list = listRef.current;
    if (!list || ev.button !== 0) return;
    ev.preventDefault();
    const scroller = scrollerOf(list);
    const origin = { x: ev.clientX, y: ev.clientY };
    let at = origin;
    let on = false;
    let to = from;
    let raf = 0;
    const place = () => {
      const rects = [...list.querySelectorAll<HTMLElement>("[data-stop-row]")].map((r) => r.getBoundingClientRect());
      if (!rects.length) return;
      const box = list.getBoundingClientRect();
      const slot = rects.filter((r) => at.y > r.top + r.height / 2).length;
      to = slot > from ? slot - 1 : slot;
      const edge = slot < rects.length ? rects[slot].top : rects[rects.length - 1].bottom;
      setDrag({ from, to, name, x: at.x, y: at.y, line: to === from ? null : Math.max(1, Math.min(box.height - 1, edge - box.top)) });
    };
    const creep = () => {
      raf = 0;
      if (!on || !scroller) return;
      const b = scroller.getBoundingClientRect();
      const by = at.y < b.top + 44 ? -12 : at.y > b.bottom - 44 ? 12 : 0;
      if (!by) return;
      const before = scroller.scrollTop;
      scroller.scrollTop += by;
      if (scroller.scrollTop === before) return;
      place();
      raf = requestAnimationFrame(creep);
    };
    const move = (m: PointerEvent) => {
      if (!on && Math.hypot(m.clientX - origin.x, m.clientY - origin.y) < 4) return;
      on = true;
      at = { x: m.clientX, y: m.clientY };
      place();
      if (!raf) raf = requestAnimationFrame(creep);
    };
    const end = (commit: boolean) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", key, true);
      cancelAnimationFrame(raf);
      if (!on) return;
      setDrag(null);
      if (commit && to !== from) live.current(from, to);
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
  return { drag, start };
}

// ── Planning: a rep and the days ────────────────────────────────────────────

function PlanForm({ route, plans, lead, onClose, show }: { route: Route; plans: RoutePlan[]; /** It sits under the days already planned. */ lead: boolean; onClose: () => void; show: PanelCtx["show"] }) {
  const reps = useStore(repsStore);
  // Another day is most often for the rep who already runs it.
  const [repId, setRepId] = React.useState<string | null>(() => plans[0]?.repId ?? null);
  const [days, setDays] = React.useState<number[]>([]);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const rep = reps.find((r) => r.id === repId);
  const taken = new Set(plans.filter((p) => p.repId === repId).map((p) => p.day));
  const options: SelectOption[] = [...reps].sort((a, b) => a.name.localeCompare(b.name)).map((r) => ({ value: r.id, label: r.name, hint: r.role }));

  const save = () => {
    const picked = days.filter((d) => !taken.has(d)).sort((a, b) => a - b);
    // The rule says what is missing, in its own words.
    if (!rep || !picked.length) return setRefusal(planRoute(route.id, rep ? rep.id : "", picked[0] ?? 0).refusal ?? null);
    const made: RoutePlan[] = [];
    const refused: { day: number; why: string }[] = [];
    for (const d of picked) {
      const res = planRoute(route.id, rep.id, d);
      if (res.plan) made.push(res.plan);
      else refused.push({ day: d, why: res.refusal ?? "That day could not be planned." });
    }
    if (made.length) show("success", `${route.name} planned for ${firstOf(rep.name)} on ${andList(made.map((p) => dayLabel(p.day)))}`, { label: "Undo", run: () => made.forEach((p) => unplanRoute(p.id)) });
    if (!refused.length) return onClose();
    setDays(refused.map((r) => r.day));
    setRefusal(refused[0].why);
  };

  return (
    <div className={cn("rounded-[12px] border border-bz-line p-3.5", lead && "mt-2.5")}>
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <FField label="Rep" className="w-full sm:w-[240px]">
          <Picker
            ariaLabel="Rep"
            value={rep ? rep.id : null}
            onChange={(v) => (setRepId(v), setDays([]), setRefusal(null))}
            placeholder={reps.length ? "Choose a rep" : "No reps yet"}
            options={options}
            addLabel="New rep"
            onAdd={() => openQuickAdd("rep", { onCreated: (id) => (setRepId(id), setDays([]), setRefusal(null)) })}
          />
        </FField>
        <FField label="Days">
          <div role="group" aria-label="Days" className="flex flex-wrap gap-1">
            {DAYS.map((d) => {
              const was = taken.has(d.n);
              const on = days.includes(d.n);
              return (
                <button
                  key={d.n}
                  type="button"
                  aria-pressed={on || was}
                  aria-disabled={was}
                  title={was ? `Already on ${firstOf(rep?.name ?? "this rep")}'s ${d.label}` : d.label}
                  onClick={() => !was && (setDays((ds) => (on ? ds.filter((x) => x !== d.n) : [...ds, d.n])), setRefusal(null))}
                  className={cn(
                    "inline-flex h-9 min-w-[46px] items-center justify-center rounded-bz-md border px-2.5 text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:outline-bz-fire",
                    was
                      ? "cursor-default border-transparent bg-bz-line-soft font-medium text-bz-text-soft"
                      : on
                        ? "border-[color-mix(in_srgb,var(--fx-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--fx-accent)_16%,var(--bz-surface))] font-semibold text-bz-text"
                        : "border-bz-line-soft bg-bz-surface font-medium text-bz-text-muted hover:border-bz-line hover:text-bz-text",
                  )}
                >
                  {d.short}
                </button>
              );
            })}
          </div>
        </FField>
      </div>
      <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2">
        {refusal && (
          <span role="alert" className="mr-auto text-[12px] text-bz-red">
            {refusal}
          </span>
        )}
        <button type="button" className={HEAD_BTN} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={BTN} onClick={save}>
          Plan
        </button>
      </div>
    </div>
  );
}

// ── A new route ─────────────────────────────────────────────────────────────

/**
 * `routes/new`: a name, and the customers the route starts with.
 * `?customer=<id>` (the customer's own "New route") starts the route for that customer: it moves there.
 */
function NewRoute({ ctx }: { ctx: PanelCtx }) {
  const [search] = useSearchParams();
  const customers = useStore(customersStore);
  const routes = useStore(routesStore);
  useStore(typesStore);
  const seed = customers.find((c) => c.id === search.get("customer"));
  const [name, setName] = React.useState("");
  // The customers this route starts with — the mapping itself, so it is made here and not left for later.
  const [picked, setPicked] = React.useState<string[]>([]);
  const [refusal, setRefusal] = React.useState<string | null>(null);

  const seedOn = seed ? routes.filter((r) => r.stops.some((s) => s.customerId === seed.id)) : [];
  // Customers nobody walks yet first; one already on another route says which.
  const others = customers.filter((c) => c.id !== seed?.id).map((c) => ({ c, on: routes.filter((r) => r.stops.some((st) => st.customerId === c.id)) }));
  const anyFree = others.some((o) => !o.on.length);
  const pickable = others
    .sort((a, b) => Number(a.on.length > 0) - Number(b.on.length > 0) || a.c.name.localeCompare(b.c.name))
    .map(({ c, on }) => ({ value: c.id, label: c.name, group: !on.length ? "On no route" : anyFree ? "Other customers" : "Customers", hint: on.length ? `On ${andList(on.map((r) => r.name))}` : undefined }));

  const create = () => {
    const res = createRoute({ name, customerIds: picked.filter((id) => id !== seed?.id) });
    if (!res.route) return setRefusal(res.refusal ?? "The route could not be created.");
    if (seed) moveCustomerToRoute(seed.id, res.route.id);
    ctx.show("success", `${res.route.name} created`);
    ctx.go(res.route.id);
  };
  // The sheet holds on to a form; with nothing typed yet, Esc may still close it.
  useKeys({ escape: () => !name.trim() && !overlayUp() && ctx.onClose() });

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-start gap-3 border-b border-bz-line-soft px-5 pb-4 pt-2.5 max-md:pt-4">
        <h2 className="m-0 min-w-0 flex-1 truncate text-[17px] font-semibold leading-snug tracking-tight text-bz-text">New route</h2>
        <button type="button" className={cn(ICON_BTN, "-mr-1.5 -mt-1")} onClick={ctx.onClose} title="Close" aria-label="Close">
          <X size={15} />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className={GROUPS}>
          <div className={FIELDS}>
            <FField label="Name" required>
              <input
                autoFocus
                aria-label="Name"
                value={name}
                onChange={(e) => (setName(e.target.value), setRefusal(null))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), create())}
                placeholder="Thamel loop"
                className={cn(INPUT, refusal && "border-bz-red-mark")}
              />
            </FField>
            <FField label="Customers">
              <MultiPicker
                value={picked}
                onChange={setPicked}
                placeholder={customers.length ? "Choose the customers on this route" : "No customers yet"}
                options={pickable}
                addLabel="New customer"
                onAdd={() => openQuickAdd("customer", { onCreated: (id) => setPicked((xs) => [...xs, id]) })}
                width={420}
              />
            </FField>
          </div>
          {seed && (
            <p className="-mt-3 m-0 text-[13px] text-bz-text-muted">
              <span className="font-medium text-bz-text">{seed.name}</span> {seedOn.length ? `moves here from ${andList(seedOn.map((r) => r.name))}.` : "goes on it."}
            </p>
          )}
        </div>
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
        {refusal && (
          <span role="alert" className="mr-auto text-[12px] text-bz-red">
            {refusal}
          </span>
        )}
        <button type="button" className={HEAD_BTN} onClick={ctx.onClose}>
          Cancel
        </button>
        <button type="button" className={BTN} onClick={create}>
          Create route
        </button>
      </footer>
    </section>
  );
}

export const ROUTES_ROUTES = [
  { path: "design/salesforce/routes", Component: RoutesPage },
  { path: "design/salesforce/routes/:no", Component: RoutesPage },
];
