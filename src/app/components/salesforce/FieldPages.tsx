import * as React from "react";
import { Link, useNavigate } from "react-router";
import { Ban, CalendarDays, CircleCheck, CircleSlash, MapPin, ReceiptText, Smartphone, Table2, UserRound, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { Chip, DocLink, GHOST, GHOST_SM, MenuItem, NUM, Stat, Statline } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { Amount } from "../sales/orders";
import { RelatedSection } from "../sales/parts";
import { Block, CustomerTitle, RecordShell, StepCard } from "../sales/record";
import { SF_TODAY } from "./data";
import type { Customer, HubOrder, LocationPing, Visit } from "./data";
import { STATUS_META } from "./orders-parts";
import { customerById, productById, typeOf } from "./engine";
import { OUTLET_STATUS, activityName, addDays, billedToText, mondayOf, orderById, orderTotal, repById, repName, shortDay, strikeRate, visitOrderText } from "./field-data";
import { VisitChip, useFieldStores } from "./field-kit";
import { FENCE_LABEL, PING_KIND, coordsText, distanceMetres, fenceState, fenceText, fmtDistance, needsAudit, osmEmbedUrl, pingsOfVisit } from "./geo";
import { MapEmbed, MapLink } from "./geo-kit";
import { PlanPage } from "./FieldPlan";
import { LivePage } from "./LivePage";
import { FxDate, FxDesk, pillTone } from "./fx-desk";
import { routeById, routeName, routeOfVisit } from "./routes";
import { SfActivity, SfNoteFoot, TypeMark, Who, chipTone, sfPath } from "./sf";

// ════════════════════════════════════════════════════════════════════════════
// FIELD — Visits (company side), and the Field routes
//
// Visits reads only what reps do in the rep app: the register of every
// check-in as a desk, each opening its evidence (steps, geofence, the order it
// took). Live — the field now, on a map — is `LivePage`; Plan is `FieldPlan`.
// ════════════════════════════════════════════════════════════════════════════

export const REP_APP = "/design/rep";

/** The hub's own status words, so an order reads the same here as in Orders. */
const HUB_STATUS = STATUS_META;

// ── Visits ──────────────────────────────────────────────────────────────────

/** Readings in time order: when, what kind, where in shop terms, how sure, and the point on a map. */
function PingList({ pings, where }: { pings: LocationPing[]; where: (p: LocationPing) => string }) {
  return (
    <ol className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
      {pings.map((p) => (
        <li key={p.id} className="flex items-baseline gap-3 text-[11.5px]">
          <span className={cn("w-10 shrink-0 text-right text-bz-text-soft", NUM)}>{p.at.slice(11, 16)}</span>
          <span className="min-w-0 flex-1">
            <span className="text-bz-text">{PING_KIND[p.kind]}</span>
            <span className="text-bz-text-muted"> · {where(p)}</span>
            <span className={cn("text-bz-text-soft", NUM)}> · ± {p.accuracy} m</span>
          </span>
          <MapLink p={p} className="shrink-0">
            Map
          </MapLink>
        </li>
      ))}
    </ol>
  );
}

type VisitTab = "in-progress" | "order" | "none" | "skipped" | "audit";
const inTab = (v: Visit, t: VisitTab) => (t === "in-progress" ? v.state === "in-progress" : t === "order" ? !!v.orderId : t === "none" ? v.state === "done" && !v.orderId : t === "audit" ? needsAudit(v) : v.state === "skipped");
/** The small mark on a visit the manager should look at. */
const auditMark = (v: Visit) => (needsAudit(v) ? (fenceState(v.geofence) === "away" ? "Away" : "No GPS") : null);
type When = "today" | "week" | "month";
const inWhen = (v: Visit, w: When) => (w === "today" ? v.date === SF_TODAY : w === "week" ? v.date >= mondayOf(SF_TODAY) && v.date <= addDays(mondayOf(SF_TODAY), 6) : v.date.startsWith(SF_TODAY.slice(0, 7)));
/** The band a visit sits in on the By day view: the nearest window that holds it. */
const dayBand = (v: Visit) => (inWhen(v, "today") ? "today" : inWhen(v, "week") ? "week" : inWhen(v, "month") ? "month" : "older");

/** `routeId`: the route the visit was on — the one recorded on it (kept when that route was removed since), else the rep's planned route that day. */
type VRow = { v: Visit; c: Customer | undefined; o: HubOrder | undefined; total: number | null; rep: string; routeId: string | null };

export function VisitsPage() {
  const s = useFieldStores();
  const rows: VRow[] = s.visits.map((v) => {
    const o = orderById(v.orderId);
    return { v, c: customerById(v.customerId), o, total: o ? orderTotal(o) : null, rep: repName(v.repId), routeId: v.routeId ?? routeOfVisit(v)?.id ?? null };
  });
  const routesVisited = Array.from(new Set(rows.flatMap((r) => (r.routeId && routeById(r.routeId) ? [r.routeId] : [])))).sort((a, b) => routeName(a).localeCompare(routeName(b)));
  const onRemovedRoute = (r: VRow) => !!r.routeId && !routeById(r.routeId);
  const sum = (rs: VRow[]) => rs.reduce((n, r) => n + (r.total ?? 0), 0);
  const total = (rs: VRow[]) => (sum(rs) > 0 ? <Amount value={sum(rs)} currency="NPR" /> : undefined);
  const count = (t: VisitTab) => rows.filter((r) => inTab(r.v, t)).length;
  const strike = strikeRate(s.visits);
  const stamp = (r: VRow) => `${r.v.date} ${r.v.checkIn ?? ""} ${r.v.id}`;
  const band = (rs: VRow[], b: ReturnType<typeof dayBand>) => rs.filter((r) => dayBand(r.v) === b);

  return (
    <FxDesk<VRow>
      place="visits"
      section="salesforce/visits"
      noun={["visit", "visits"]}
      rows={rows}
      noOf={(r) => r.v.id}
      dateOf={(r) => r.v.date}
      searchText={(r) => `${r.v.id} ${r.c?.name ?? ""} ${r.rep} ${r.v.orderId ?? ""}`}
      searchPlaceholder="Visit, customer or rep"
      numberLabel="Visit"
      amountLabel="Order"
      stats={[
        { label: "Visits", value: rows.length },
        { label: "Strike rate", value: strike === null ? "—" : `${strike}%`, title: "Finished visits with an order" },
      ]}
      picks={[
        { key: "in-progress", label: "In progress", value: count("in-progress"), test: (r) => inTab(r.v, "in-progress") },
        { key: "order", label: "With an order", value: count("order"), test: (r) => inTab(r.v, "order") },
        { key: "none", label: "No order", value: count("none"), test: (r) => inTab(r.v, "none"), title: "Finished without an order" },
        { key: "skipped", label: "Skipped", value: count("skipped"), test: (r) => inTab(r.v, "skipped") },
        { key: "audit", label: "Away or no GPS", value: count("audit"), test: (r) => inTab(r.v, "audit"), danger: count("audit") > 0, title: "Checked in away from the shop, or without GPS" },
      ]}
      views={[
        {
          key: "day",
          label: "By day",
          icon: CalendarDays,
          groups: (rs) => [
            { key: "today", label: "Today", rows: band(rs, "today"), right: total(band(rs, "today")), empty: "No visits today." },
            { key: "week", label: "Earlier this week", rows: band(rs, "week"), right: total(band(rs, "week")) },
            { key: "month", label: "Earlier this month", rows: band(rs, "month"), right: total(band(rs, "month")) },
            { key: "older", label: "Older", collapsed: true, rows: band(rs, "older") },
          ],
        },
        {
          key: "rep",
          label: "By rep",
          icon: Users,
          groups: (rs) =>
            Array.from(new Set(rs.map((r) => r.v.repId)))
              .map((id) => ({ key: id, label: repName(id), icon: <Who name={repById(id)?.name} size={16} />, rows: rs.filter((r) => r.v.repId === id), right: total(rs.filter((r) => r.v.repId === id)) }))
              .sort((a, b) => a.label.localeCompare(b.label)),
        },
        { key: "register", label: "Register", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
      ]}
      filters={[
        ...s.reps.map((p) => ({ value: `rep:${p.id}`, label: p.name, group: "Rep", test: (r: VRow) => r.v.repId === p.id })),
        { value: "when:today", label: "Today", group: "When", test: (r: VRow) => inWhen(r.v, "today") },
        { value: "when:week", label: "This week", group: "When", test: (r: VRow) => inWhen(r.v, "week") },
        { value: "when:month", label: "This month", group: "When", test: (r: VRow) => inWhen(r.v, "month") },
        { value: "plan:on", label: "On the beat", group: "Plan", test: (r: VRow) => r.v.planned },
        { value: "plan:off", label: "Unplanned", group: "Plan", test: (r: VRow) => !r.v.planned },
        ...routesVisited.map((id) => ({ value: `route:${id}`, label: routeName(id), group: "Route", test: (r: VRow) => r.routeId === id })),
        ...(rows.some(onRemovedRoute) ? [{ value: "route:removed", label: "Removed route", group: "Route", test: onRemovedRoute }] : []),
        { value: "route:none", label: "No route", group: "Route", test: (r: VRow) => !r.routeId },
      ]}
      sorts={[
        { key: "new", label: "Newest", by: stamp, desc: true },
        { key: "old", label: "Oldest", by: stamp },
        { key: "cus", label: "Customer", by: (r) => r.c?.name ?? "" },
        { key: "rep", label: "Rep", by: (r) => r.rep },
        { key: "val", label: "Order value", by: (r) => r.total ?? 0, desc: true },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (r) => <FxDate iso={r.v.date} /> },
        { key: "rep", label: "Rep", width: "24px", render: (r) => <Who name={repById(r.v.repId)?.name} /> },
      ]}
      primary={(r) => ({ title: r.c?.name ?? "Removed customer", sub: [r.rep, r.v.checkIn, r.routeId ? routeName(r.routeId) : "", r.v.planned ? "" : "unplanned", r.o ? visitOrderText(r.v) : ""].filter(Boolean).join(" · "), subOnDesktop: true })}
      status={(r) => ({ label: OUTLET_STATUS[r.v.state].label, tone: pillTone(OUTLET_STATUS[r.v.state].tone) })}
      statusLabel="Outcome"
      // The desk's own "When" filter is its date filter.
      showPeriod={false}
      amount={(r) => ({
        value: r.total !== null ? <Amount value={r.total} /> : <span className="font-normal text-bz-text-soft">—</span>,
        sub: auditMark(r.v) ? <span className="text-bz-amber-ink">{auditMark(r.v)}</span> : r.total === null && r.v.state === "done" ? "No order" : undefined,
      })}
      emptyAction={
        <Link to={REP_APP} className={GHOST}>
          <Smartphone size={13} /> Open the rep app
        </Link>
      }
      renderPanel={(r, ctx) => <VisitPanel key={r.v.id} r={r} ctx={ctx} />}
    />
  );
}

function VisitPanel({ r, ctx }: { r: VRow; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const s = useFieldStores();
  const { v, c, o } = r;
  const t = typeOf(c);
  const counts = Object.entries(s.counts[v.id] ?? {}).filter(([, n]) => n > 0);
  const rep = repById(v.repId);
  const route = routeById(r.routeId);
  const fs = fenceState(v.geofence);
  const mark = auditMark(v);
  const done = v.acts.filter((a) => a.done).length;
  const openOrder = () => o && navigate(sfPath(`orders/${o.id}`));

  const step =
    v.state === "skipped" ? (
      <StepCard tone="quiet" icon={<Ban size={15} />} title="Skipped" sub={v.skipReason ?? "No reason given."} />
    ) : o ? (
      <StepCard
        tone={v.state === "done" ? "done" : "plain"}
        icon={<CircleCheck size={15} />}
        title={`Order ${o.id}`}
        sub={[
          HUB_STATUS[o.status].label,
          billedToText(o),
          `${o.lines.length} line${o.lines.length === 1 ? "" : "s"}`,
          `${o.lines
            .slice(0, 2)
            .map((l) => productById(l.productId).name)
            .join(", ")}${o.lines.length > 2 ? "…" : ""}`,
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <button type="button" className={GHOST_SM} onClick={openOrder}>
            Open order
          </button>
        }
      />
    ) : v.orderId ? (
      <StepCard tone="quiet" icon={<CircleSlash size={15} />} title={`Order ${v.orderId} was removed`} />
    ) : v.state === "in-progress" ? (
      <StepCard icon={<MapPin size={15} />} title={`Here since ${v.checkIn ?? "—"}`} sub="No order yet." />
    ) : (
      <StepCard tone="quiet" icon={<CircleSlash size={15} />} title="No order" sub={v.noOrderReason ?? undefined} />
    );

  return (
    <RecordShell
      ctx={ctx}
      no={v.id}
      chips={
        <>
          <VisitChip status={v.state} />
          {mark && (
            <Chip tone={chipTone("warn")} dot={false} title={fenceText(v.geofence)}>
              {mark}
            </Chip>
          )}
        </>
      }
      title={c ? <CustomerTitle name={c.name} onOpen={() => navigate(sfPath(`customers/${c.id}`))} /> : "Removed customer"}
      amount={r.total !== null ? <Amount value={r.total} currency="NPR" /> : undefined}
      meta={[
        <span key="d" className={NUM}>
          {shortDay(v.date)}
        </span>,
        <span key="r" className="inline-flex items-center gap-1.5">
          <Who name={rep?.name} size={16} /> {r.rep}
        </span>,
        ...(c ? [<TypeMark key="t" name={t.name} color={t.color} />] : []),
        <span key="p">{v.planned ? "On the beat" : "Unplanned"}</span>,
        ...(o ? [<DocLink key="o" no={o.id} kind="Order" onClick={openOrder} />] : []),
      ]}
      menu={(close) => (
        <>
          {c && (
            <MenuItem icon={UserRound} onClick={() => (close(), navigate(sfPath(`customers/${c.id}`)))}>
              Open customer
            </MenuItem>
          )}
          {rep && (
            <MenuItem icon={Users} onClick={() => (close(), navigate(sfPath(`team/${rep.id}`)))}>
              Open rep
            </MenuItem>
          )}
          {o && (
            <MenuItem icon={ReceiptText} onClick={() => (close(), openOrder())}>
              Open order
            </MenuItem>
          )}
        </>
      )}
      foot={<SfNoteFoot id={v.id} />}
    >
      {step}

      <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
        <Statline className="pt-3">
          <Stat
            label="Route"
            value={
              route ? (
                <Link to={sfPath(`routes/${route.id}`)} title={route.name} className="inline-block max-w-[220px] truncate align-bottom hover:underline hover:underline-offset-4">
                  {route.name}
                </Link>
              ) : (
                <span className="font-normal text-bz-text-soft">{r.routeId ? "Removed route" : "Not on a route"}</span>
              )
            }
          />
          <Stat label="Check in" value={v.checkIn ?? "—"} />
          <Stat label="Check out" value={v.checkOut ?? "—"} />
          <Stat label="Location" value={fs ? FENCE_LABEL[fs].label : "—"} sub={v.geofence?.metres != null ? fmtDistance(v.geofence.metres) : undefined} danger={needsAudit(v)} title={fenceText(v.geofence)} />
          <Stat label="Steps" value={`${done} of ${v.acts.length}`} />
          <Stat label="Photos" value={v.photos} />
        </Statline>
      </div>

      <VisitLocation v={v} />

      <Block title="Steps" count={v.acts.length}>
        {v.acts.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No steps on this visit.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {v.acts.map((a, i) => (
              <li key={`${a.activityId}-${i}`} className="flex gap-2.5 text-[12px]">
                <span className={cn("w-3 shrink-0 text-center", a.done ? "text-bz-pos-deep" : a.required ? "text-bz-red" : "text-bz-text-soft")} title={a.done ? "Done" : "Not done"}>
                  {a.done ? "✓" : "–"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-bz-text">{activityName(a.activityId)}</span>
                  <span className="ml-1.5 text-[10.5px] text-bz-text-soft">
                    {a.required ? "required" : "optional"}
                    {a.geofence && " · at the shop"}
                  </span>
                  {a.result && <span className="block text-[11.5px] text-bz-text-muted">{a.result}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Block>

      {counts.length > 0 && (
        <Block title="Stock on the shelf" count={counts.length}>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {counts.map(([pid, n]) => (
              <li key={pid} className="flex items-baseline justify-between gap-3 text-[12px]">
                <span className="min-w-0 truncate text-bz-text">{productById(pid).name}</span>
                <span className={cn("shrink-0 text-bz-text-muted", NUM)}>
                  {n} {productById(pid).unit}
                </span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {o && (
        <div className="border-b border-bz-line-soft">
          <RelatedSection
            rows={[{ no: o.id, kind: "Order", date: o.at.slice(0, 10), party: customerById(o.customerId)?.name ?? "", status: HUB_STATUS[o.status].label, tone: chipTone(HUB_STATUS[o.status].tone) }]}
            onOpen={(no) => navigate(sfPath(`orders/${no}`))}
          />
        </div>
      )}

      <SfActivity ids={[v.id, ...(v.orderId ? [v.orderId] : [])]} />
    </RecordShell>
  );
}

/** Where the rep was: the check-in fix against the shop, its accuracy, and every reading taken on the visit. */
function VisitLocation({ v }: { v: Visit }) {
  const g = v.geofence;
  const fs = fenceState(g);
  const c = customerById(v.customerId);
  const fix = g?.lat != null && g?.lng != null ? { lat: g.lat, lng: g.lng } : null;
  const pings = pingsOfVisit(v.id);
  let line: React.ReactNode;
  if (!fs || !g) line = "Not checked in.";
  else if (fs === "at") line = g.metres ? `At the shop, ${fmtDistance(g.metres)} from its saved location.` : fix ? "At the shop. Its location was saved from this check-in." : "At the shop.";
  else if (fs === "away") line = <span className="text-bz-amber-ink">Away, {fmtDistance(g.metres ?? 0)} from the shop's saved location.</span>;
  else if (fs === "unmeasured") line = c?.location && fix ? `The shop had no saved location then. It is ${fmtDistance(distanceMetres(fix, c.location))} from the location saved since.` : "The shop had no saved location to measure from.";
  else if (fs === "manual") line = <span className="text-bz-amber-ink">No GPS. The rep said they were there.</span>;
  else line = <span className="text-bz-amber-ink">No GPS fix, and the rep did not say they were at the shop.</span>;
  return (
    <Block title="Location" right={fix ? <MapLink p={fix} /> : undefined}>
      <p className="m-0 text-[12px] text-bz-text">{line}</p>
      {fix && (
        <p className={cn("m-0 mt-1 text-[10.5px] text-bz-text-soft", NUM)}>
          Checked in at {coordsText(fix)}
          {g?.accuracy != null && ` · GPS ± ${g.accuracy} m`}
        </p>
      )}
      {fix && <MapEmbed src={osmEmbedUrl(fix.lat, fix.lng)} title={`Map: where ${v.id} was checked in`} className="mt-3" />}
      {pings.length > 0 && <PingList pings={pings} where={(p) => (c?.location ? `${fmtDistance(distanceMetres(p, c.location))} from the shop` : "shop has no location")} />}
    </Block>
  );
}

// ── Routes ──────────────────────────────────────────────────────────────────

export const FIELD_ROUTES = [
  { path: "design/salesforce/today", Component: LivePage },
  { path: "design/salesforce/today/:repId", Component: LivePage },
  { path: "design/salesforce/plan", Component: PlanPage },
  { path: "design/salesforce/plan/:repId", Component: PlanPage },
  { path: "design/salesforce/visits", Component: VisitsPage },
  { path: "design/salesforce/visits/:no", Component: VisitsPage },
];
