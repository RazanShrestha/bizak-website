import * as React from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, CalendarPlus, Layers, Route as RouteIcon, UserPlus, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, Meter, NUM } from "../sales/bzw";
import { DocDesk } from "../sales/DocDesk";
import type { Group } from "../sales/DocDesk";
import { personById } from "../productivity/shared";
import { FIELD_TODAY, PARTIES, REPS, WEEKDAYS, addRepToRoute, fmtDayShort, repById, routeHealth, weekOf } from "./model";
import type { RouteHealth } from "./model";
import { Money, SfmNav, StopStrip, routeColor, useField } from "./kit";
import { PlanRepPop } from "./planning";
import { SheetHost } from "./sheets";
import { NewRoutePanel, RoutePanel } from "./RoutePanel";

// ════════════════════════════════════════════════════════════════════════════
// ROUTES — every beat with its outlets, its reps and its plan, in one register
//
// The three setup screens of today (Route · Party Route Map · Salesman Route
// Map) become one register and one panel: a route is opened, and its outlets,
// its reps and its next runs are edited where they are read — one row at a
// time, so nothing hidden by a search can be dropped (research/01 P1).
// Bands say what the route is waiting for: a rep, outlets, a day this week.
// ════════════════════════════════════════════════════════════════════════════

const FLAG_LABEL: Record<RouteHealth["flags"][number], string> = {
  "no-rep": "No rep",
  "no-parties": "No outlets",
  "unplanned-week": "Not planned in 7 days",
  quiet: "No run in 30 days",
};

export function RoutesDesk() {
  const { routes, ctx } = useField();
  const navigate = useNavigate();
  const [pop, setPop] = React.useState<{ routeId: string; anchor: HTMLElement } | null>(null);
  const rows = React.useMemo(() => routes.map((r) => routeHealth(r.id, ctx)), [routes, ctx]);
  const week = weekOf(FIELD_TODAY);
  const onNoRoute = PARTIES.filter((p) => !ctx.links.some((l) => l.partyId === p.id)).length;
  const needs = (h: RouteHealth) => h.flags.some((f) => f !== "quiet");
  const flag = new URLSearchParams(window.location.search);

  return (
    <DocDesk<RouteHealth>
      module="Field sales"
      section="sfm/routes"
      nav={<SfmNav current="routes" />}
      rail="Field sales"
      rows={flag.get("empty") === "1" ? [] : rows}
      failed={flag.get("fail") === "1" ? { text: "Couldn't read the routes.", onRetry: () => navigate("/design/sfm/routes") } : undefined}
      noOf={(h) => h.route.id}
      searchText={(h) => `${h.route.id} ${h.route.name} ${h.route.description} ${h.parties.map((p) => p.name).join(" ")} ${h.reps.map((r) => r.name).join(" ")}`}
      showPeriod={false}
      noun={["route", "routes"]}
      numberLabel="Route"
      partyLabel="Name"
      amountLabel="Orders · 30 days"
      searchPlaceholder="Route, outlet or rep"
      stats={[
        { label: "Routes", value: rows.length },
        {
          label: "Outlets on no route",
          title: "Customers no route visits — open them on the Parties tab",
          value: (
            <button type="button" onClick={() => navigate("/design/sfm/parties?pick=noroute")} className={cn("font-semibold underline-offset-2 hover:underline", onNoRoute ? "text-bz-red" : "text-bz-text")}>
              {onNoRoute} →
            </button>
          ),
        },
      ]}
      picks={[
        { key: "norep", label: "No rep", value: rows.filter((h) => h.flags.includes("no-rep")).length, test: (h) => h.flags.includes("no-rep"), danger: rows.some((h) => h.flags.includes("no-rep")) },
        { key: "week", label: "Not planned in 7 days", value: rows.filter((h) => h.flags.includes("unplanned-week")).length, test: (h) => h.flags.includes("unplanned-week") },
        { key: "noparties", label: "No outlets", value: rows.filter((h) => h.flags.includes("no-parties")).length, test: (h) => h.flags.includes("no-parties") },
      ]}
      renderExtra={({ show }) => (
        <>
          {pop && <PlanRepPop open anchor={pop.anchor} onClose={() => setPop(null)} routeId={pop.routeId} notify={(t, undo) => show(undo ? "success" : "info", t, undo ? { label: "Undo", run: undo } : undefined)} />}
          <SheetHost onOpenDay={(id, d) => navigate(`/design/sfm/today/${id}${d !== FIELD_TODAY ? `?day=${d}` : ""}`)} />
        </>
      )}
      views={[
        {
          key: "health",
          label: "By health",
          icon: AlertTriangle,
          groups: (rs) =>
            [
              { key: "needs", label: "Needs attention", alarm: true, rows: rs.filter(needs) },
              { key: "active", label: "Active", rows: rs.filter((h) => !needs(h) && !h.flags.includes("quiet")) },
              { key: "quiet", label: "No run in 30 days", rows: rs.filter((h) => !needs(h) && h.flags.includes("quiet")), collapsed: true },
            ] as Group<RouteHealth>[],
        },
        {
          key: "rep",
          label: "By rep",
          icon: Users,
          groups: (rs) => [
            ...REPS.map((r) => ({ key: r.id, label: r.name, icon: <Avatar person={personById(r.id)} size={16} />, rows: rs.filter((h) => h.route.repIds.includes(r.id)) })),
            { key: "none", label: "No rep", alarm: true, rows: rs.filter((h) => !h.route.repIds.length) },
          ],
        },
        {
          key: "sub",
          label: "By subsidiary",
          icon: Layers,
          groups: (rs) => [
            { key: "NP-01", label: "Bizak Nepal · Kathmandu", rows: rs.filter((h) => h.route.subsidiaryId === "NP-01") },
            { key: "NP-02", label: "Bizak Gandaki · Pokhara", rows: rs.filter((h) => h.route.subsidiaryId === "NP-02") },
          ],
        },
      ]}
      filters={[
        { value: "sub:NP-01", label: "Bizak Nepal", group: "Subsidiary", test: (h) => h.route.subsidiaryId === "NP-01" },
        { value: "sub:NP-02", label: "Bizak Gandaki", group: "Subsidiary", test: (h) => h.route.subsidiaryId === "NP-02" },
        ...REPS.map((r) => ({ value: `rep:${r.id}`, label: r.name, group: "Rep", test: (h: RouteHealth) => h.route.repIds.includes(r.id) })),
      ]}
      sorts={[
        { key: "id", label: "Route", by: (h) => h.route.id },
        { key: "cov", label: "Lowest coverage", by: (h) => h.coverage30 },
        { key: "orders", label: "Most orders", by: (h) => h.orders30, desc: true },
        { key: "stops", label: "Most outlets", by: (h) => h.parties.length, desc: true },
      ]}
      columns={[
        { key: "stops", label: "Outlets", width: "64px", align: "right", render: (h) => <span className={cn(NUM, !h.parties.length && "text-bz-red")}>{h.parties.length}</span> },
        {
          key: "reps",
          label: "Reps",
          width: "92px",
          render: (h) =>
            h.reps.length ? (
              <span className="flex -space-x-1">
                {h.reps.map((r) => (
                  <Avatar key={r.id} person={personById(r.id)} size={20} ring />
                ))}
              </span>
            ) : (
              <span className="text-bz-red">No rep</span>
            ),
        },
        {
          key: "week",
          label: "This week",
          width: "124px",
          render: (h) => (
            <span className="inline-flex gap-[3px]" aria-label={`Planned ${h.weekPlans.length} days this week`}>
              {week.map((d, i) => {
                const on = h.weekPlans.some((p) => p.date === d);
                return (
                  <span
                    key={d}
                    title={`${WEEKDAYS[i]} ${Number(d.slice(8))}${on ? ` · ${h.weekPlans.filter((p) => p.date === d).map((p) => repById(p.repId)?.name.split(" ")[0]).join(", ")}` : ""}`}
                    className={cn("flex size-[15px] items-center justify-center rounded-[3px] text-[9px] font-semibold", on ? "text-bz-text-on-dark" : i === 6 ? "text-bz-text-soft/50" : "bg-bz-paper-warm text-bz-text-soft", d === FIELD_TODAY && "ring-1 ring-bz-text-muted")}
                    style={on ? { background: routeColor(h.route.tone) } : undefined}
                  >
                    {WEEKDAYS[i][0]}
                  </span>
                );
              })}
            </span>
          ),
        },
        {
          key: "last",
          label: "Last run",
          width: "150px",
          render: (h) =>
            h.lastRun ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <span className={cn("shrink-0 text-bz-text-muted", NUM)}>{fmtDayShort(h.lastRun.date)}</span>
                <StopStrip stops={h.lastRun.stops.filter((s) => s.routeId === h.route.id).map((s) => ({ state: s.state, title: s.party.name }))} size={6} />
              </span>
            ) : (
              <span className="text-bz-text-soft">—</span>
            ),
        },
        {
          key: "cov",
          label: "Coverage · 30 days",
          width: "120px",
          render: (h) => (
            <span className="flex items-center gap-1.5" title="Outlets on the route visited at least once in the last 30 days">
              <Meter pct={h.coverage30} thin danger={h.coverage30 < 70 && h.parties.length > 0} className="w-12" />
              <span className={cn(NUM, h.coverage30 < 70 && h.parties.length > 0 ? "text-bz-red" : "text-bz-text-muted")}>{h.parties.length ? `${h.coverage30}%` : "—"}</span>
            </span>
          ),
        },
      ]}
      primary={(h) => ({
        title: (
          <span className="inline-flex min-w-0 items-center gap-2">
            <span aria-hidden className="h-3.5 w-[3px] shrink-0 rounded-bz-pill" style={{ background: routeColor(h.route.tone) }} />
            <span className="truncate">{h.route.name}</span>
            {h.flags
              .filter((f) => f !== "quiet")
              .map((f) => (
                <span key={f} className="shrink-0 rounded-bz-sm bg-bz-red-soft px-1.5 text-[10px] font-medium text-bz-red">
                  {FLAG_LABEL[f]}
                </span>
              ))}
          </span>
        ),
        sub: h.route.description || undefined,
        subOnDesktop: true,
      })}
      amount={(h) => ({ value: h.orders30 ? <Money value={h.orders30} /> : <span className="text-bz-text-soft">—</span>, sub: h.nextRun ? `next ${h.nextRun.date === FIELD_TODAY ? "today" : fmtDayShort(h.nextRun.date)}` : h.parties.length ? "not planned" : undefined })}
      rowVerb={(h) => (h.parties.length ? { label: "Plan…", icon: CalendarPlus, run: (e) => e && setPop({ routeId: h.route.id, anchor: e.currentTarget }) } : null)}
      bulk={[
        {
          label: "Add a rep",
          icon: UserPlus,
          enabled: (rs) => rs.length > 0,
          choose: { options: REPS.map((r) => ({ value: r.id, label: r.name, person: personById(r.id) })), placeholder: "Who runs them…" },
          run: (rs, repId) => {
            const skipped = rs.filter((h) => h.route.repIds.includes(repId!)).map((h) => `${h.route.id} already has ${repById(repId!)?.name.split(" ")[0]}`);
            rs.filter((h) => !h.route.repIds.includes(repId!)).forEach((h) => addRepToRoute(h.route.id, repId!));
            return { done: rs.length - skipped.length, skipped, verb: `now run by ${repById(repId!)?.name}` };
          },
        },
      ]}
      newLabel="New route"
      onNew={() => navigate("/design/sfm/routes/new")}
      renderNew={(c) => <NewRoutePanel ctx={c} />}
      renderPanel={(h, c) => <RoutePanel routeId={h.route.id} ctx={c} />}
      keyHints={[
        ["N", "New route"],
        ["/", "Search"],
        ["J / K", "Next / previous"],
        ["Esc", "Close"],
      ]}
      emptyAction={<span className="text-[12px] text-bz-text-muted">A route is a beat: the outlets one rep visits in one day.</span>}
    />
  );
}
