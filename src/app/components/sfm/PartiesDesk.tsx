import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { MapPin, Route as RouteIcon, ShoppingCart, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, MenuItem, MenuLabel, NUM, Popover } from "../sales/bzw";
import { DocDesk } from "../sales/DocDesk";
import { personById } from "../productivity/shared";
import { FIELD_TODAY, PARTIES, REPS, addPartiesToRoute, dayAdd, fmtDayShort, partyCoverage, removePartyFromRoute, routeById } from "./model";
import type { PartyCoverage } from "./model";
import { Money, RouteChip, SfmNav, useField } from "./kit";
import { PartySheet, SheetHost, stageChip } from "./sheets";

// ════════════════════════════════════════════════════════════════════════════
// PARTIES — coverage of the outlets: who is on no route, who is overdue
//
// Nothing in today's SFM answers "which customers does nobody visit?" — Party
// On Map shows only today's routes (research/01 §2.20). This register bands the
// field's parties by coverage, and the fix is on the row: add it to a route,
// singly or in bulk. A party opens as the same sheet used everywhere, docked.
// ════════════════════════════════════════════════════════════════════════════

export function PartiesDesk() {
  const { links, ctx, routes } = useField();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [pop, setPop] = React.useState<{ partyId: string; anchor: HTMLElement } | null>(null);
  const rows = React.useMemo(() => PARTIES.map((p) => partyCoverage(p.id, links, ctx.orders)), [links, ctx.orders]);
  const fresh = (c: PartyCoverage) => c.party.createdOn >= dayAdd(FIELD_TODAY, -30);
  const flag = (k: string) => search.get(k) === "1";
  const routeOpts = routes.filter((r) => r.repIds.length).map((r) => ({ value: r.id, label: `${r.id} ${r.name}`, hint: `${links.filter((l) => l.routeId === r.id).length} outlets · ${r.subsidiaryId === "NP-02" ? "Gandaki" : "Nepal"}` }));

  return (
    <DocDesk<PartyCoverage>
      module="Field sales"
      section="sfm/parties"
      nav={<SfmNav current="parties" />}
      rail="Field sales"
      rows={flag("empty") ? [] : rows}
      failed={flag("fail") ? { text: "Couldn't read the parties.", onRetry: () => navigate("/design/sfm/parties") } : undefined}
      loading={flag("slow")}
      noOf={(c) => c.party.id}
      searchText={(c) => `${c.party.code} ${c.party.name} ${c.party.area} ${c.routes.map((r) => r.id).join(" ")}`}
      showPeriod={false}
      noun={["party", "parties"]}
      numberLabel="Code"
      partyLabel="Party"
      amountLabel="Orders · 90 days"
      searchPlaceholder="Party, area or route"
      stats={[{ label: "Parties", value: rows.length }]}
      picks={[
        { key: "noroute", label: "On no route", value: rows.filter((c) => c.band === "no-route").length, test: (c) => c.band === "no-route", danger: true, title: "Nobody is planned to visit them" },
        { key: "overdue", label: "Not visited in 30 days", value: rows.filter((c) => c.band === "overdue").length, test: (c) => c.band === "overdue", danger: true },
        { key: "week", label: "Visited this week", value: rows.filter((c) => c.daysSince !== null && c.daysSince <= 6).length, test: (c) => c.daysSince !== null && c.daysSince <= 6 },
        { key: "new", label: "New in 30 days", value: rows.filter(fresh).length, test: fresh, title: "Leads and prospects the reps added" },
      ]}
      views={[
        {
          key: "coverage",
          label: "By coverage",
          icon: MapPin,
          groups: (rs) => [
            { key: "noroute", label: "On no route", alarm: true, rows: rs.filter((c) => c.band === "no-route") },
            { key: "overdue", label: "Not visited in 30 days", alarm: true, rows: rs.filter((c) => c.band === "overdue") },
            { key: "covered", label: "Covered", rows: rs.filter((c) => c.band === "covered") },
          ],
        },
        {
          key: "route",
          label: "By route",
          icon: RouteIcon,
          groups: (rs) => [
            { key: "none", label: "On no route", alarm: true, rows: rs.filter((c) => !c.routes.length) },
            ...routes.map((r) => ({ key: r.id, label: `${r.id} ${r.name}`, rows: rs.filter((c) => c.routes.some((x) => x.id === r.id)), collapsed: true })),
          ],
        },
        {
          key: "rep",
          label: "By rep",
          icon: Users,
          groups: (rs) => [...REPS.map((r) => ({ key: r.id, label: r.name, icon: <Avatar person={personById(r.id)} size={16} />, rows: rs.filter((c) => c.party.repId === r.id), collapsed: true })), { key: "none", label: "No rep", rows: rs.filter((c) => !c.party.repId) }],
        },
      ]}
      filters={[
        { value: "sub:NP-01", label: "Bizak Nepal", group: "Subsidiary", test: (c) => c.party.subsidiaryId === "NP-01" },
        { value: "sub:NP-02", label: "Bizak Gandaki", group: "Subsidiary", test: (c) => c.party.subsidiaryId === "NP-02" },
        { value: "st:customer", label: "Customer", group: "Stage", test: (c) => c.party.stage === "customer" },
        { value: "st:prospect", label: "Prospect", group: "Stage", test: (c) => c.party.stage === "prospect" },
        { value: "st:lead", label: "Lead", group: "Stage", test: (c) => c.party.stage === "lead" },
        ...REPS.map((r) => ({ value: `rep:${r.id}`, label: r.name, group: "Rep", test: (c: PartyCoverage) => c.party.repId === r.id })),
      ]}
      sorts={[
        { key: "since", label: "Longest since a visit", by: (c) => (c.daysSince === null ? 9999 : c.daysSince), desc: true },
        { key: "name", label: "Name", by: (c) => c.party.name },
        { key: "orders", label: "Most orders", by: (c) => c.orders90, desc: true },
      ]}
      columns={[
        { key: "stage", label: "Stage", width: "84px", render: (c) => stageChip(c.party.stage) },
        {
          key: "routes",
          label: "Routes",
          width: "150px",
          render: (c) =>
            c.routes.length ? (
              <span className="flex min-w-0 flex-wrap gap-1">
                {c.routes.map((r) => (
                  <RouteChip key={r.id} route={r} tight />
                ))}
              </span>
            ) : (
              <span className="font-medium text-bz-red">On no route</span>
            ),
        },
        { key: "rep", label: "Rep", width: "44px", render: (c) => (c.party.repId ? <Avatar person={personById(c.party.repId)} size={20} /> : <span className="text-bz-text-soft">—</span>) },
        {
          key: "visit",
          label: "Last visit",
          width: "96px",
          render: (c) => <span className={cn(NUM, c.daysSince === null || c.daysSince > 30 ? "font-medium text-bz-red" : "text-bz-text-muted")}>{c.daysSince === null ? "Never" : c.daysSince === 0 ? "Today" : `${c.daysSince} days ago`}</span>,
        },
        { key: "order", label: "Last order", width: "84px", render: (c) => <span className={NUM}>{c.lastOrder ? fmtDayShort(c.lastOrder.date) : "—"}</span> },
      ]}
      primary={(c) => ({ title: c.party.name, sub: c.party.area, subOnDesktop: true })}
      amount={(c) => ({ value: c.orders90 ? <Money value={c.orders90} /> : <span className="text-bz-text-soft">—</span> })}
      rowVerb={(c) =>
        !c.routes.length
          ? { label: "Add to route", icon: RouteIcon, run: (e) => e && setPop({ partyId: c.party.id, anchor: e.currentTarget }) }
          : { label: "Order", icon: ShoppingCart, run: () => navigate(`/design/sales/orders/new?cust=${c.party.id}${c.party.repId ? `&rep=${c.party.repId}` : ""}&day=${FIELD_TODAY}`) }
      }
      bulk={[
        {
          label: "Add to route",
          icon: RouteIcon,
          enabled: (rs) => rs.length > 0,
          choose: { options: routeOpts, placeholder: "Find a route…" },
          run: (rs, routeId) => {
            const rt = routeById(routeId!)!;
            const wrongSub = rs.filter((c) => c.party.subsidiaryId !== rt.subsidiaryId).map((c) => `${c.party.code} is in another subsidiary`);
            const already = rs.filter((c) => c.routes.some((r) => r.id === routeId)).map((c) => `${c.party.code} is already on ${routeId}`);
            const ok = rs.filter((c) => c.party.subsidiaryId === rt.subsidiaryId && !c.routes.some((r) => r.id === routeId)).map((c) => c.party.id);
            addPartiesToRoute(routeId!, ok);
            return { done: ok.length, skipped: [...wrongSub, ...already], verb: `added to ${routeId}`, skippedIds: rs.filter((c) => !ok.includes(c.party.id)).map((c) => c.party.id) };
          },
        },
      ]}
      renderPanel={(c, pctx) => (
        <PartySheet partyId={c.party.id} onClose={pctx.onClose} docked onOpenVisit={(id) => navigate(`/design/sfm/visits/${id}`)} />
      )}
      renderExtra={({ show }) => (
        <>
          {pop && (
            <RoutePickPop
              anchor={pop.anchor}
              partyId={pop.partyId}
              onClose={() => setPop(null)}
              onPick={(routeId) => {
                addPartiesToRoute(routeId, [pop.partyId]);
                show("success", `Added to ${routeId}`, { label: "Undo", run: () => removePartyFromRoute(routeId, pop.partyId) });
                setPop(null);
              }}
            />
          )}
          <SheetHost onOpenDay={(id, d) => navigate(`/design/sfm/today/${id}${d !== FIELD_TODAY ? `?day=${d}` : ""}`)} />
        </>
      )}
      keyHints={[
        ["/", "Search"],
        ["J / K", "Next / previous"],
        ["X", "Select"],
        ["Esc", "Close"],
      ]}
      cursorKeys
    />
  );
}

/** Which route should visit this party — routes that already pass nearby (same area) first. */
function RoutePickPop({ anchor, partyId, onClose, onPick }: { anchor: HTMLElement; partyId: string; onClose: () => void; onPick: (routeId: string) => void }) {
  const { routes, links } = useField();
  const p = PARTIES.find((x) => x.id === partyId)!;
  const near = (rId: string) => {
    const ps = links.filter((l) => l.routeId === rId).map((l) => PARTIES.find((x) => x.id === l.partyId)!);
    if (!ps.length) return Infinity;
    return Math.min(...ps.map((x) => Math.hypot(x.lat - p.lat, (x.lng - p.lng) * 0.89))) * 111;
  };
  const list = routes
    .filter((r) => r.subsidiaryId === p.subsidiaryId && links.some((l) => l.routeId === r.id))
    .map((r) => ({ r, km: near(r.id) }))
    .sort((a, b) => a.km - b.km);
  return (
    <OutletRouteMenu anchor={anchor} onClose={onClose} title={`Add ${p.name} to…`} items={list.map(({ r, km }) => ({ id: r.id, label: `${r.id} ${r.name}`, hint: `${km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`} from its nearest outlet · ${r.repIds.map((x) => personById(x)?.name.split(" ")[0]).join(", ") || "no rep"}` }))} onPick={onPick} />
  );
}

function OutletRouteMenu({ anchor, onClose, title, items, onPick }: { anchor: HTMLElement; onClose: () => void; title: string; items: { id: string; label: string; hint: string }[]; onPick: (id: string) => void }) {
  return (
    <Popover open anchor={anchor} onClose={onClose} width={300} align="right">
      <MenuLabel>{title}</MenuLabel>
      <p className="m-0 px-2 pb-1 text-[10.5px] text-bz-text-soft">Nearest routes first.</p>
      <div className="max-h-[280px] overflow-y-auto">
        {items.map((it) => (
          <MenuItem key={it.id} icon={RouteIcon} hint={it.hint} onClick={() => onPick(it.id)}>
            {it.label}
          </MenuItem>
        ))}
      </div>
    </Popover>
  );
}

