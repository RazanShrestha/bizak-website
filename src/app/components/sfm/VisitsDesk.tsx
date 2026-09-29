import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CalendarDays, Camera, CircleCheck, ClipboardList, Clock, FileDown, Footprints, LogIn, LogOut, MapPin, ShoppingCart, UserRound, Route as RouteIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DocLink, GHOST_SM, LABEL, MenuItem, MenuSep, NUM } from "../sales/bzw";
import { Block, KV, RecordShell, StepCard } from "../sales/record";
import { itemById } from "../sales/orders";
import { daysBetween, personById } from "../productivity/shared";
import { DocDesk } from "../sales/DocDesk";
import type { Group, PanelCtx } from "../sales/DocDesk";
import { SUBSIDIARIES } from "../sales/master";
import { FIELD_NOW, FIELD_TODAY, REPS, fmtDay, fmtDayShort, partyById, partyCoverage, pct, relDayName, repById, repDay, routesOfParty, toMin } from "./model";
import type { DayOrder, DayReceipt, FieldParty, FieldRep, FieldRoute, FieldVisit, RepDay } from "./model";
import { FIELD_VISITS } from "./seed";
import { Money, RouteChip, SfmNav, routeColor, useField, useSheetLinks } from "./kit";
import { FieldMap } from "./map";
import type { MapPin as MapPinT } from "./map";
import { Activity, ActivityFoot, SheetHost, stageChip } from "./sheets";

// ════════════════════════════════════════════════════════════════════════════
// VISITS — every check-in, and what came of it (spec §7)
//
// One row per VISITED_ROUTE entry up to today. Everything that is not stored on
// the visit is DERIVED from its rep-day (model.repDay), never guessed:
//   planned     the party is a stop on a route planned for the rep that day
//   productive  the rep has a live sales order for that party that day — an
//               inference, because SALES_ORDER carries no visit id
//   far         the check-in fix is > 300 m from the party's saved position,
//               and only when the party has one
// Replaces Customer Visit Summary / Detail / In Out, Customer Visit By Sales
// Rep (+Summary), Salesman Activity Report and Party Stock (research/01 §2).
// ════════════════════════════════════════════════════════════════════════════

const FAR_M = 300;
const SHORT_MIN = 2;
const PRODUCTIVE_TIP = "An order by the rep for this party that day. Orders are not linked to visits in the app, so this is inferred.";

type VisitRow = {
  v: FieldVisit;
  party: FieldParty;
  rep: FieldRep;
  route: FieldRoute | null;
  planned: boolean;
  orders: DayOrder[];
  cancelled: DayOrder[];
  receipts: DayReceipt[];
  productive: boolean;
  value: number;
  received: number;
  here: boolean;
  /** Minutes in the outlet; running for a visit still open today; null when the check-out is missing. */
  dwell: number | null;
  distIn: number | null;
  distOut: number | null;
  far: boolean;
};

/** Great-circle distance in metres. */
function metres(a: [number, number], b: [number, number]) {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const fmtM = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);
const hasPos = (p: FieldParty) => Number.isFinite(p.lat) && Number.isFinite(p.lng);
const firstName = (rep: FieldRep | undefined) => rep?.name.split(" ")[0] ?? "—";
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** The "Sep 4, 13:58" form the activity list sorts by. */
const stamp = (date: string, t: string) => `${MON[Number(date.slice(5, 7)) - 1]} ${Number(date.slice(8))}, ${t}`;
const newOrderHref = (r: VisitRow) => `/design/sales/orders/new?cust=${r.party.id}&rep=${r.rep.id}&day=${r.v.date}`;

function deriveRow(v: FieldVisit, d: RepDay): VisitRow | null {
  const party = partyById(v.partyId);
  if (!party) return null;
  const stop = d.stops.find((s) => s.party.id === v.partyId) ?? null;
  const route = stop ? d.routes.find((r) => r.id === stop.routeId) ?? null : null;
  const mine = d.orders.filter((o) => o.partyId === v.partyId);
  const orders = mine.filter((o) => !o.cancelled);
  const receipts = d.receipts.filter((x) => x.partyId === v.partyId);
  const here = !v.out && v.date === FIELD_TODAY;
  const dwell = v.out ? toMin(v.out) - toMin(v.in) : here ? toMin(FIELD_NOW) - toMin(v.in) : null;
  const pos = hasPos(party);
  const distIn = pos ? metres(v.inAt, [party.lat, party.lng]) : null;
  const distOut = pos && v.outAt ? metres(v.outAt, [party.lat, party.lng]) : null;
  return {
    v,
    party,
    rep: d.rep,
    route,
    planned: !!stop,
    orders,
    cancelled: mine.filter((o) => o.cancelled),
    receipts,
    productive: orders.length > 0,
    value: orders.reduce((s, o) => s + o.value, 0),
    received: receipts.reduce((s, x) => s + x.amount, 0),
    here,
    dwell,
    distIn,
    distOut,
    far: distIn !== null && distIn > FAR_M,
  };
}

const isShort = (r: VisitRow) => !!r.v.out && r.dwell !== null && r.dwell < SHORT_MIN;
const noOrder = (r: VisitRow) => !r.here && !r.productive;

export function VisitsDesk() {
  const { routes, links, plans, orders, receipts } = useField();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const flag = (k: string) => search.get(k) === "1";
  const empty = flag("empty");
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(flag("fail"));
  React.useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), flag("slow") ? 2400 : 380);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = React.useMemo(() => {
    if (empty) return [] as VisitRow[];
    const ctx = { routes, links, plans, orders, receipts };
    // One rep-day read per rep and date, shared by every visit of that day.
    const days = new Map<string, RepDay>();
    const dayOf = (repId: string, date: string) => {
      const k = `${repId}|${date}`;
      let d = days.get(k);
      if (!d) days.set(k, (d = repDay(repId, date, ctx)));
      return d;
    };
    return FIELD_VISITS.filter((v) => v.date <= FIELD_TODAY && repById(v.repId))
      .map((v) => deriveRow(v, dayOf(v.repId, v.date)))
      .filter((r): r is VisitRow => !!r)
      .sort((a, b) => (b.v.date + b.v.in).localeCompare(a.v.date + a.v.in));
  }, [routes, links, plans, orders, receipts, empty]);

  const finished = rows.filter((r) => !r.here);
  const productiveN = finished.filter((r) => r.productive).length;
  const visitedRoutes = routes.filter((rt) => rows.some((r) => r.route?.id === rt.id));

  const dayGroups = (rs: VisitRow[]): Group<VisitRow>[] => {
    const dates = Array.from(new Set(rs.map((r) => r.v.date))).sort((a, b) => b.localeCompare(a));
    return dates.map((date) => {
      const inDay = rs.filter((r) => r.v.date === date);
      const rel = relDayName(date);
      return {
        key: date,
        label: rel === fmtDay(date) ? rel : `${rel} · ${fmtDay(date)}`,
        icon: <CalendarDays size={12} className="text-bz-text-muted" />,
        collapsed: daysBetween(date, FIELD_TODAY) > 7,
        right: <DayRight rows={inDay} />,
        rows: inDay,
      };
    });
  };

  return (
    <DocDesk<VisitRow>
      // Performance drills in with ?reps= (the rep sheet owns ?rep=), applied as the Rep filter on arrival.
      initialFilters={search.getAll("reps").flatMap((x) => x.split(",")).filter(Boolean).map((id) => `rep:${id}`)}
      module="Field sales"
      section="sfm/visits"
      nav={<SfmNav current="visits" />}
      rail="Field sales"
      noun={["visit", "visits"]}
      rows={rows}
      loading={loading}
      failed={failed ? { text: "Couldn't read the visits.", onRetry: () => setFailed(false) } : undefined}
      noOf={(r) => r.v.id}
      numberOf={(r) => (
        <>
          {r.v.in}
          {r.v.date !== FIELD_TODAY && <span className="ml-1 text-[10px] font-normal text-bz-text-soft">{fmtDayShort(r.v.date)}</span>}
        </>
      )}
      numberLabel="Time"
      partyLabel="Party"
      amountLabel="Order value"
      dateOf={(r) => r.v.date}
      searchText={(r) => `${r.v.id} ${r.party.name} ${r.party.code} ${r.party.area} ${r.rep.name} ${r.route ? `${r.route.id} ${r.route.name}` : "unplanned"} ${r.orders.map((o) => o.no).join(" ")} ${r.receipts.map((x) => x.no).join(" ")} ${r.v.noOrderReason ?? ""}`}
      searchPlaceholder="Party, rep, route or order"
      stats={[
        { label: "Visits", value: rows.length, title: "Check-ins on record, up to today" },
        { label: "Productive", value: `${pct(productiveN, finished.length)}%`, title: `Finished visits with an order by the rep for that party that day ÷ finished visits. Orders are not linked to visits in the app, so this is inferred.` },
      ]}
      picks={[
        { key: "unplanned", label: "Unplanned", value: rows.filter((r) => !r.planned).length, test: (r) => !r.planned, title: "Check-ins at parties not on the day's routes — never counted as compliance" },
        { key: "short", label: "Short stays", value: rows.filter(isShort).length, danger: rows.some(isShort), test: isShort, title: `Checked out less than ${SHORT_MIN} minutes after checking in` },
        { key: "far", label: "Far from the outlet", value: rows.filter((r) => r.far).length, danger: rows.some((r) => r.far), test: (r) => r.far, title: `Check-in more than ${FAR_M} m from the party's saved position (only parties with a position)` },
        { key: "noorder", label: "No order", value: rows.filter(noOrder).length, test: noOrder, title: "Finished visits with no order by the rep for that party that day" },
      ]}
      views={[
        { key: "day", label: "By day", icon: CalendarDays, groups: dayGroups },
        {
          key: "rep",
          label: "By rep",
          icon: UserRound,
          groups: (rs) =>
            REPS.map((rep) => {
              const mine = rs.filter((r) => r.rep.id === rep.id);
              return { key: rep.id, label: rep.name, icon: <Avatar person={personById(rep.id)} size={16} />, right: <DayRight rows={mine} />, rows: mine };
            }),
        },
        {
          key: "route",
          label: "By route",
          icon: RouteIcon,
          groups: (rs) => [
            ...routes.map((rt) => {
              const on = rs.filter((r) => r.route?.id === rt.id);
              return {
                key: rt.id,
                label: `${rt.id} ${rt.name}`,
                icon: <span aria-hidden className="h-3 w-[3px] shrink-0 rounded-bz-pill" style={{ background: routeColor(rt.tone) }} />,
                right: <DayRight rows={on} />,
                rows: on,
              };
            }),
            { key: "unplanned", label: "Unplanned", right: <DayRight rows={rs.filter((r) => !r.planned)} />, rows: rs.filter((r) => !r.planned) },
          ],
        },
      ]}
      filters={[
        ...REPS.map((rep) => ({ value: `rep:${rep.id}`, label: rep.name, group: "Rep", test: (r: VisitRow) => r.rep.id === rep.id })),
        ...visitedRoutes.map((rt) => ({ value: `rt:${rt.id}`, label: `${rt.id} ${rt.name}`, group: "Route", test: (r: VisitRow) => r.route?.id === rt.id })),
        { value: "out:ordered", label: "Ordered", group: "Outcome", test: (r: VisitRow) => r.productive },
        { value: "out:none", label: "No order", group: "Outcome", test: noOrder },
        { value: "out:received", label: "Received", group: "Outcome", test: (r: VisitRow) => r.receipts.length > 0 },
        { value: "plan:yes", label: "Planned", group: "Plan", test: (r: VisitRow) => r.planned },
        { value: "plan:no", label: "Unplanned", group: "Plan", test: (r: VisitRow) => !r.planned },
        ...SUBSIDIARIES.map((s) => ({ value: `sub:${s.id}`, label: s.name, group: "Subsidiary", test: (r: VisitRow) => r.party.subsidiaryId === s.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest first", by: (r) => r.v.date + r.v.in, desc: true },
        { key: "stay", label: "Longest stay", by: (r) => r.dwell ?? -1, desc: true },
        { key: "value", label: "Order value", by: (r) => r.value, desc: true },
      ]}
      columns={[
        { key: "rep", label: "Rep", width: "112px", render: (r) => <RepCell rep={r.rep} /> },
        { key: "route", label: "Route", width: "92px", render: (r) => (r.route ? <RouteChip route={r.route} tight /> : <UnplannedMark />) },
        { key: "stay", label: "Stay", width: "68px", render: (r) => <StayCell r={r} /> },
        { key: "outcome", label: "Outcome", width: "200px", render: (r) => <OutcomeCell r={r} /> },
      ]}
      primary={(r) => ({ title: r.party.name, sub: r.party.area, subOnDesktop: true })}
      amount={(r) => ({
        value: r.value ? <Money value={r.value} /> : <span className="font-normal text-bz-text-soft">—</span>,
        sub: r.received ? <>received <Money value={r.received} code={false} /></> : undefined,
      })}
      rowVerb={(r) => (r.productive ? null : { label: "New order", icon: ShoppingCart, run: () => navigate(newOrderHref(r)) })}
      bulk={[{ label: "Export", icon: FileDown, enabled: (rs) => rs.length > 0, run: (rs) => ({ done: rs.length, skipped: [], verb: "exported to Excel" }) }]}
      keyHints={[
        ["/", "Search"],
        ["J / K", "Next / previous"],
        ["Esc", "Close"],
      ]}
      emptyAction={<span className="text-[12px] text-bz-text-muted">Check-ins from the field app appear here.</span>}
      renderPanel={(r, ctx) => <VisitPanel key={r.v.id} r={r} ctx={ctx} />}
      renderExtra={({ go }) => <SheetHost onOpenDay={(id, d) => navigate(`/design/sfm/today/${id}?day=${d}`)} onOpenVisit={(id) => go(id)} />}
    />
  );
}

// ── Cells ───────────────────────────────────────────────────────────────────

function DayRight({ rows }: { rows: VisitRow[] }) {
  const done = rows.filter((r) => !r.here);
  const prod = done.filter((r) => r.productive).length;
  const value = rows.reduce((s, r) => s + r.value, 0);
  if (!rows.length) return null;
  return (
    <span className={NUM} title={PRODUCTIVE_TIP}>
      {prod} of {done.length} ordered · <Money value={value} code={false} />
    </span>
  );
}

function RepCell({ rep }: { rep: FieldRep }) {
  const sheets = useSheetLinks();
  return (
    <button
      type="button"
      onClick={(e) => (e.stopPropagation(), sheets.openRep(rep.id))}
      className="inline-flex max-w-full items-center gap-1.5 rounded-bz-sm text-left text-bz-text hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-bz-fire"
      title={`Open ${rep.name}`}
    >
      <Avatar person={personById(rep.id)} size={18} />
      <span className="truncate">{firstName(rep)}</span>
    </button>
  );
}

function UnplannedMark() {
  return (
    <span className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted" title="The party was not on the rep's routes that day">
      Unplanned
    </span>
  );
}

function StayCell({ r }: { r: VisitRow }) {
  if (r.here) return <span className={cn("text-bz-pos-deep", NUM)}>there now</span>;
  if (r.dwell === null) return <span className="text-bz-text-soft" title="No check-out recorded">—</span>;
  return (
    <span className={cn(NUM, isShort(r) && "font-semibold text-bz-red")} title={`${r.v.in} → ${r.v.out}`}>
      {r.dwell} min
    </span>
  );
}

function OutcomeCell({ r }: { r: VisitRow }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 overflow-hidden">
      {r.orders.map((o) => (
        <DocLink key={o.no} no={o.no} />
      ))}
      {r.here && !r.productive && <span className="truncate text-bz-pos-deep">At the outlet</span>}
      {noOrder(r) && <span className="truncate">{r.v.noOrderReason ? `No order — ${r.v.noOrderReason}` : "No order"}</span>}
      {r.far && (
        <span className="inline-flex shrink-0 items-center gap-0.5 text-bz-red" title={`Checked in ${fmtM(r.distIn!)} from the outlet`}>
          <MapPin size={11} /> {fmtM(r.distIn!)}
        </span>
      )}
      {r.v.photos > 0 && (
        <span className={cn("inline-flex shrink-0 items-center gap-0.5 text-bz-text-soft", NUM)} title={`${r.v.photos} photo${r.v.photos === 1 ? "" : "s"}`}>
          <Camera size={11} /> {r.v.photos}
        </span>
      )}
    </span>
  );
}

// ── The visit panel ─────────────────────────────────────────────────────────

function VisitPanel({ r, ctx }: { r: VisitRow; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const sheets = useSheetLinks();
  const { links, orders } = useField();
  const { v, party, rep, route } = r;
  const cov = partyCoverage(party.id, links, orders);
  const partyRoutes = routesOfParty(party.id, links);
  const newOrder = () => navigate(newOrderHref(r));
  const openDay = () => navigate(`/design/sfm/today/${rep.id}?day=${v.date}`);
  const openDoc = (no: string, inStore: boolean, kind: "orders" | "receipts") =>
    inStore ? navigate(`/design/sales/${kind}/${no}`) : ctx.show("info", `${no} is older than this mockup's sales data — in the app it opens the ${kind === "orders" ? "sales order" : "receipt"}.`);
  const stayText = r.here ? `${v.in} → there now · ${r.dwell} min` : v.out ? `${v.in} → ${v.out} · ${r.dwell} min` : `${v.in} → no check-out`;

  let step: React.ReactNode;
  if (r.productive)
    step = (
      <StepCard
        tone="done"
        icon={<CircleCheck size={15} />}
        title={`Ordered — ${r.orders.map((o) => o.no).join(", ")}`}
        sub={<span title={PRODUCTIVE_TIP}>An order by {firstName(rep)} for this party that day.</span>}
      />
    );
  else if (r.here) step = <StepCard tone="quiet" icon={<Clock size={15} />} title={`There now since ${v.in}`} sub={`${r.dwell} min so far. The outcome shows once ${firstName(rep)} checks out.`} />;
  else
    step = (
      <StepCard
        icon={<ShoppingCart size={15} />}
        title={v.noOrderReason ? `No order — ${v.noOrderReason}` : "No order"}
        sub={r.cancelled.length ? `${r.cancelled.map((o) => o.no).join(", ")} was cancelled afterwards.` : undefined}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={newOrder}>
            <ShoppingCart size={13} /> New order for this party
          </button>
        }
      />
    );

  const pins: MapPinT[] = hasPos(party)
    ? [{ id: party.id, lat: party.lat, lng: party.lng, tone: route?.tone ?? null, kind: !r.planned ? "unplanned" : r.here ? "here" : r.productive ? "productive" : "visited", label: party.name, sub: party.area }]
    : [];
  const fixes: [number, number][] = [v.inAt, ...(v.outAt ? [v.outAt] : [])];
  const history = [
    { id: `${v.id}-in`, whoId: rep.id, when: stamp(v.date, v.in), what: `checked in at ${party.name}` },
    ...(v.out ? [{ id: `${v.id}-out`, whoId: rep.id, when: stamp(v.date, v.out), what: "checked out" }] : []),
  ];

  return (
    <RecordShell
      ctx={ctx}
      no={`${fmtDay(v.date)} · ${v.in}`}
      chips={
        <>
          {r.planned ? <Chip tone="neutral">Planned</Chip> : <Chip tone="pending" title="The party was not on the rep's routes that day">Unplanned</Chip>}
          {r.productive ? (
            <Chip tone="positive" title={PRODUCTIVE_TIP}>
              Productive
            </Chip>
          ) : r.here ? (
            <Chip tone="partial">There now</Chip>
          ) : (
            <Chip tone="pending">No order</Chip>
          )}
        </>
      }
      title={
        <button type="button" className="text-left hover:underline hover:underline-offset-4" onClick={() => sheets.openParty(party.id)} title="Open the party">
          {party.name}
        </button>
      }
      amount={r.value ? <Money value={r.value} /> : undefined}
      meta={[
        <button key="rep" type="button" className="inline-flex items-center gap-1.5 hover:text-bz-text" onClick={() => sheets.openRep(rep.id)} title="Open the rep">
          <Avatar person={personById(rep.id)} size={16} /> {rep.name}
        </button>,
        route ? <RouteChip key="rt" route={route} onClick={() => navigate(`/design/sfm/routes/${route.id}`)} /> : <UnplannedMark key="rt" />,
        <span key="t" className={NUM}>
          {stayText}
        </span>,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={ShoppingCart} onClick={() => (close(), newOrder())}>
            New order for this party
          </MenuItem>
          <MenuItem icon={Footprints} onClick={() => (close(), openDay())}>
            Open {firstName(rep)}'s day
          </MenuItem>
          <MenuSep />
          <MenuItem icon={MapPin} onClick={() => (close(), sheets.openParty(party.id))}>
            Open party
          </MenuItem>
          <MenuItem icon={UserRound} onClick={() => (close(), sheets.openRep(rep.id))}>
            Open rep
          </MenuItem>
        </>
      )}
      foot={<ActivityFoot subject={`visit:${v.id}`} />}
    >
      {step}

      <Block title="Check-in and out">
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          <FixRow icon={<LogIn size={11} />} label="In" t={v.in} party={party} dist={r.distIn} />
          {v.out ? <FixRow icon={<LogOut size={11} />} label="Out" t={v.out} party={party} dist={r.distOut} /> : <FixRow icon={<LogOut size={11} />} label="Out" t="—" party={party} dist={null} note={r.here ? "Still there" : "No check-out recorded"} />}
        </div>
        <div className="mt-2.5 h-[200px] overflow-hidden rounded-bz-md border border-bz-line-soft">
          <FieldMap compact pins={pins} trails={[{ id: v.id, points: fixes, tone: route?.tone ?? null }]} onPick={() => sheets.openParty(party.id)} empty="No location for this visit." />
        </div>
        <p className="m-0 mt-1.5 text-[10.5px] text-bz-text-soft">{hasPos(party) ? "The pin is the outlet's saved position; the dots are the check-in and check-out fixes." : "This party has no saved position, so the distance can't be measured."}</p>
      </Block>

      <Block title="What happened">
        <WhatHappened r={r} openDoc={openDoc} />
      </Block>

      <Block title="Party" right={<button type="button" className={GHOST_SM} onClick={() => sheets.openParty(party.id)}>Open party</button>}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12px] sm:grid-cols-3">
          <KV label="Stage" value={stageChip(party.stage)} />
          <KV label="Area" value={party.area} />
          <KV label="Code" value={<span className={NUM}>{party.code}</span>} />
          <KV
            label="Routes"
            value={
              partyRoutes.length ? (
                <span className="inline-flex flex-wrap gap-1">
                  {partyRoutes.map((rt) => (
                    <RouteChip key={rt.id} route={rt} tight onClick={() => navigate(`/design/sfm/routes/${rt.id}`)} />
                  ))}
                </span>
              ) : (
                <span className="text-bz-red">On no route</span>
              )
            }
          />
          <KV
            label="Rep"
            value={
              party.repId ? (
                <button type="button" className="inline-flex items-center gap-1.5 hover:underline hover:underline-offset-2" onClick={() => sheets.openRep(party.repId!)}>
                  <Avatar person={personById(party.repId)} size={16} /> {repById(party.repId)?.name}
                </button>
              ) : (
                <span className="text-bz-text-soft">—</span>
              )
            }
          />
          <KV
            label="Last order"
            value={
              cov.lastOrder ? (
                <span className="inline-flex items-center gap-1.5">
                  <DocLink no={cov.lastOrder.no} onClick={() => openDoc(cov.lastOrder!.no, orders.some((o) => o.no === cov.lastOrder!.no), "orders")} />
                  <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{fmtDayShort(cov.lastOrder.date)}</span>
                </span>
              ) : (
                <span className="text-bz-text-soft">None</span>
              )
            }
          />
        </div>
      </Block>

      <div className="border-b border-bz-line-soft px-5 py-3">
        <button type="button" onClick={openDay} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-bz-text underline underline-offset-2 hover:text-bz-text-muted">
          <Footprints size={12} /> Open {firstName(rep)}'s day · {fmtDay(v.date)}
        </button>
      </div>

      <Activity subject={`visit:${v.id}`} extraHistory={history} />
    </RecordShell>
  );
}

function FixRow({ icon, label, t, party, dist, note }: { icon: React.ReactNode; label: string; t: string; party: FieldParty; dist: number | null; note?: string }) {
  const far = dist !== null && dist > FAR_M;
  return (
    <div className="grid grid-cols-[18px_34px_48px_minmax(0,1fr)_auto] items-center gap-2 border-b border-bz-line-soft px-3 py-2 text-[12px] last:border-0">
      <span className="flex size-4 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted">{icon}</span>
      <span className="text-bz-text-muted">{label}</span>
      <span className={cn("font-semibold text-bz-text", NUM)}>{t}</span>
      <span className="min-w-0 truncate text-bz-text-muted">{note ?? `near ${party.area}`}</span>
      <span className={cn("text-right text-[11.5px]", NUM, far ? "font-semibold text-bz-red" : "text-bz-text-soft")} title={far ? `More than ${FAR_M} m from the outlet's saved position` : undefined}>
        {dist !== null ? `${fmtM(dist)} from the outlet` : ""}
      </span>
    </div>
  );
}

function WhatHappened({ r, openDoc }: { r: VisitRow; openDoc: (no: string, inStore: boolean, kind: "orders" | "receipts") => void }) {
  const { v } = r;
  const nothing = !r.orders.length && !r.receipts.length && !v.shelf.length && !v.photos && !v.remarks;
  if (nothing) return <p className="m-0 text-[11.5px] text-bz-text-soft">{r.here ? "Nothing recorded yet." : v.noOrderReason ? `No order — ${v.noOrderReason}. Nothing else recorded.` : "Nothing recorded."}</p>;
  return (
    <div className="flex flex-col gap-3">
      {r.orders.length > 0 && (
        <div>
          <p className={cn(LABEL, "m-0 mb-1.5")}>Orders</p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {r.orders.map((o) => (
              <li key={o.no} className="flex items-center gap-2 text-[12px]" title={PRODUCTIVE_TIP}>
                <DocLink no={o.no} kind="Sales order" onClick={() => openDoc(o.no, o.inStore, "orders")} />
                <span className={cn("text-[11px] text-bz-text-soft", NUM)}>
                  {o.lines} line{o.lines === 1 ? "" : "s"}
                  {o.time && ` · ${o.time}`}
                </span>
                <Money value={o.value} className="ml-auto text-[12px] font-semibold text-bz-text" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {r.receipts.length > 0 && (
        <div>
          <p className={cn(LABEL, "m-0 mb-1.5")}>Receipts</p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {r.receipts.map((x) => (
              <li key={x.no} className="flex items-center gap-2 text-[12px]">
                <DocLink no={x.no} kind="Receipt" onClick={() => openDoc(x.no, x.inStore, "receipts")} />
                <span className="text-[11px] text-bz-text-soft" title="Collected once back office tags it to an invoice; advance until then">
                  {x.tagged >= x.amount ? "tagged to invoices" : x.tagged > 0 ? <>part tagged · <Money value={x.amount - x.tagged} code={false} /> advance until tagged</> : "advance until tagged"}
                </span>
                <Money value={x.amount} className="ml-auto text-[12px] font-semibold text-bz-text" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {v.shelf.length > 0 && (
        <div>
          <p className={cn(LABEL, "m-0 mb-1.5 inline-flex items-center gap-1")}>
            <ClipboardList size={11} /> Shelf count
          </p>
          <div className="max-w-[360px] overflow-hidden rounded-bz-md border border-bz-line-soft">
            <div className={cn("grid grid-cols-[minmax(0,1fr)_72px] gap-2 border-b border-bz-line-soft bg-bz-paper-warm px-3 py-1", LABEL)}>
              <span>Item</span>
              <span className="text-right">On shelf</span>
            </div>
            {v.shelf.map((l) => {
              const it = itemById(l.itemId);
              return (
                <div key={l.itemId} className="grid grid-cols-[minmax(0,1fr)_72px] gap-2 border-b border-bz-line-soft px-3 py-1 text-[11.5px] last:border-0">
                  <span className="truncate text-bz-text">{it?.name ?? l.itemId}</span>
                  <span className={cn("text-right text-bz-text", NUM)}>
                    {l.qty} <span className="text-[10.5px] text-bz-text-soft">{it?.unit}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {v.photos > 0 && (
        <div>
          <p className={cn(LABEL, "m-0 mb-1.5")}>Photos · {v.photos}</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: v.photos }, (_, i) => (
              <span key={i} className="flex size-16 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm text-bz-text-soft" title={`Photo ${i + 1}`}>
                <Camera size={16} />
              </span>
            ))}
          </div>
        </div>
      )}
      {v.remarks && (
        <div>
          <p className={cn(LABEL, "m-0 mb-1")}>Remarks</p>
          <p className="m-0 text-[12px] text-bz-text">“{v.remarks}”</p>
        </div>
      )}
    </div>
  );
}
