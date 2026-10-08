import * as React from "react";
import { useNavigate } from "react-router";
import { ChevronRight, MapPin, Plus, SearchX, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, Empty, GHOST, NUM, Stat, Statline } from "../sales/bzw";
import { Amount } from "../sales/orders";
import { useStore } from "../sales/store";
import { SF_TODAY } from "../salesforce/data";
import type { Customer, Rep, Visit } from "../salesforce/data";
import { customerById, day, typeOf } from "../salesforce/engine";
import { OUTLET_STATUS, THIS_MONTH, TODAY_DAY, dayLabel, pct, repActuals, repCustomers, repDay } from "../salesforce/field-data";
import type { OutletStatus, Stop } from "../salesforce/field-data";
import { VisitMark, useFieldStores } from "../salesforce/field-kit";
import { distanceMetres, fmtDistance, geoHelp, lastPing, placeOf, placeText, recordPing } from "../salesforce/geo";
import type { GeoPoint } from "../salesforce/geo";
import { Finding, useLocate } from "../salesforce/geo-kit";
import { routeName } from "../salesforce/routes";
import { TypeMark, chipTone } from "../salesforce/sf";
import { ledgerStore } from "../salesforce/store";
import { ListBlock, PAD, ROWS, ROW_TAP, SearchBox } from "./kit";
import { RepShell, Sheet, SignIn, repPath, repToast, useRep } from "./shell";

// ════════════════════════════════════════════════════════════════════════════
// REP APP · TODAY — the rep's routes for the day, and any other customer they may visit
//
// Today's routes is the routes planned for this rep on today's weekday, in the
// order they were planned; under each, the customers whose cadence falls in this
// week, in the route's visit order (field-data.repDay). "Visit another customer"
// covers everyone else the rep owns or has on a route.
// ════════════════════════════════════════════════════════════════════════════

/** How far a shop is from where the rep last was today — nothing when either end is unknown. */
const distanceTo = (c: Customer | undefined, from: GeoPoint | undefined) => (c?.location && from ? fmtDistance(distanceMetres(from, c.location)) : null);

type RouteGroup = { routeId: string | null; stops: Stop[] };
/** The day's stops under the route each is on, routes and stops in the order `repDay` gives them; customers visited off today's routes come last. */
function byRoute(stops: Stop[]): RouteGroup[] {
  const groups: RouteGroup[] = [];
  for (const x of stops) {
    const routeId = x.routeId ?? null;
    const g = groups.find((y) => y.routeId === routeId);
    if (g) g.stops.push(x);
    else groups.push({ routeId, stops: [x] });
  }
  return [...groups.filter((g) => g.routeId), ...groups.filter((g) => !g.routeId)];
}

/**
 * One customer: its place on its route, the visit mark, name, type and where — then its status once a visit exists,
 * the distance while it is still to visit.
 */
function OutletRow({ c, n, status, distance, onOpen }: { c: Customer | undefined; n?: number; status: OutletStatus | null; distance: string | null; onOpen: () => void }) {
  const t = typeOf(c);
  const here = status === "in-progress";
  const waiting = !status || status === "to-visit";
  return (
    <li>
      <button type="button" onClick={onOpen} className={cn(ROW_TAP, here && "bg-bz-fire/10 hover:bg-bz-fire/10")}>
        {here && <span className="absolute inset-y-0 left-0 w-0.5 bg-bz-fire" />}
        {n !== undefined && <span className={cn("w-4 shrink-0 text-right text-[11px] text-bz-text-soft", NUM)}>{n}</span>}
        {status && <VisitMark status={status} />}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] text-bz-text">{c?.name ?? "Removed customer"}</span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10.5px] text-bz-text-soft">
            <TypeMark name={t.name} color={t.color} className="text-[10.5px] text-bz-text-soft" />
            {c?.city && <span className="truncate">· {c.city}</span>}
          </span>
        </span>
        {waiting ? (
          <>
            {distance && <span className={cn("shrink-0 text-[11px] text-bz-text-muted", NUM)}>{distance}</span>}
            <ChevronRight size={13} className="shrink-0 text-bz-text-soft" />
          </>
        ) : (
          <Chip tone={chipTone(OUTLET_STATUS[status].tone)}>{OUTLET_STATUS[status].label}</Chip>
        )}
      </button>
    </li>
  );
}

/** Where the office last saw the rep today, and a way to tell it again. */
function ShareLocation({ rep, current, beatIds }: { rep: Rep; current: Visit | null; beatIds: string[] }) {
  const { busy, error, locate } = useLocate();
  const last = lastPing(rep.id, SF_TODAY);
  const share = async () => {
    const fix = await locate();
    if (!fix) return;
    recordPing({ repId: rep.id, fix, kind: "update", visitId: current?.id ?? null, customerId: current?.customerId ?? null });
    repToast("Location shared");
  };
  return (
    <div className={cn("flex items-center gap-2.5 border-b border-bz-line-soft py-2", PAD)}>
      <MapPin size={13} className="shrink-0 text-bz-text-soft" />
      <div className="min-w-0 flex-1 text-[11.5px] leading-snug text-bz-text-muted">
        {busy ? (
          <Finding />
        ) : last ? (
          <>
            <span className={NUM}>{last.at.slice(11, 16)}</span> · {placeText(placeOf(last, beatIds))}
          </>
        ) : (
          "Location not shared today."
        )}
        {error && (
          <p role="alert" className="m-0 mt-0.5 text-[11px] text-bz-red">
            {geoHelp(error)}
          </p>
        )}
      </div>
      <button type="button" className={cn(GHOST, "h-10 shrink-0")} onClick={share} disabled={busy}>
        Share location
      </button>
    </div>
  );
}

/** Everyone the rep may visit who is not on today's beat. */
function OtherCustomers({ customers, total, from, onOpen, onClose }: { customers: Customer[]; total: number; from: GeoPoint | undefined; onOpen: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = React.useState("");
  const others = customers.filter((c) => !q.trim() || `${c.name} ${c.city} ${c.code}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Sheet title="Visit another customer" onClose={onClose}>
      {total === 0 ? (
        <Empty title="No customers assigned to you yet." icon={Users} />
      ) : customers.length === 0 ? (
        <Empty title="Everyone is on today's routes." icon={Users} />
      ) : (
        <>
          <div className={cn("sticky top-0 z-10 border-b border-bz-line-soft bg-bz-surface py-2", PAD)}>
            <SearchBox value={q} onChange={setQ} placeholder="Search your customers" />
          </div>
          {others.length === 0 ? (
            <Empty title="No customers match." icon={SearchX} />
          ) : (
            <ul className={cn(ROWS, "border-t-0")}>
              {others.slice(0, 40).map((c) => (
                <OutletRow key={c.id} c={c} status={null} distance={distanceTo(c, from)} onOpen={() => onOpen(c.id)} />
              ))}
            </ul>
          )}
          {others.length > 40 && <p className={cn("m-0 border-t border-bz-line-soft py-3 text-[11px] text-bz-text-soft", PAD)}>Showing 40 of {others.length}</p>}
        </>
      )}
    </Sheet>
  );
}

export function RepTodayPage() {
  const rep = useRep();
  const navigate = useNavigate();
  const s = useFieldStores();
  const ledger = useStore(ledgerStore);
  const [picking, setPicking] = React.useState(false);

  if (!rep) {
    return (
      <RepShell title="Rep app">
        <SignIn />
      </RepShell>
    );
  }

  const d = repDay(rep);
  const pool = repCustomers(rep);
  const offBeat = pool.filter((c) => !d.stops.some((x) => x.customerId === c.id));
  const collected = ledger.filter((r) => r.kind === "Receipt" && r.by === rep.name && r.date === SF_TODAY).reduce((n, r) => n + r.credit, 0);
  const open = (id: string) => navigate(repPath(`visit/${id}`));
  const current = d.current ? customerById(d.current.customerId) : undefined;
  const target = s.targets.find((t) => t.repId === rep.id && t.month === THIS_MONTH);
  const reached = target && target.salesTarget > 0 ? pct(repActuals(rep.id).sales, target.salesTarget) : null;
  const from = lastPing(rep.id, SF_TODAY);
  const another = (
    <button type="button" onClick={() => setPicking(true)} className={cn(GHOST, "h-10")}>
      <Plus size={13} /> Visit another customer
    </button>
  );

  return (
    <RepShell
      title="Today"
      sub={`${dayLabel(TODAY_DAY)} ${day(SF_TODAY)} · ${rep.name}`}
      foot={
        d.current ? (
          <button type="button" className={cn(BTN, "h-11 w-full")} onClick={() => open(d.current!.id)}>
            Continue at {current?.name ?? "your open visit"}
          </button>
        ) : undefined
      }
      sheet={picking ? <OtherCustomers customers={offBeat} total={pool.length} from={from} onOpen={open} onClose={() => setPicking(false)} /> : null}
    >
      <div className={cn("border-b border-bz-line bg-bz-paper py-2", PAD)}>
        <Statline>
          <Stat label="Visited" value={d.visited} sub={`of ${d.planned}`} title="Customers on today's routes with a finished visit" />
          <Stat label="Sales" value={<Amount value={d.orderValue} />} title="Orders you took today, in NPR" />
          {collected > 0 && <Stat label="Collected" value={<Amount value={collected} />} title="Payments you collected today, in NPR" />}
          {reached !== null && <Stat label="Target" meter={reached} value={`${reached}%`} title="This month's approved sales against your sales target" />}
        </Statline>
      </div>

      <ShareLocation rep={rep} current={d.current} beatIds={d.stops.map((x) => x.customerId)} />

      <ListBlock title="Today's routes" count={d.stops.length}>
        {d.stops.length === 0 ? (
          <Empty title="No route today." action={another} />
        ) : (
          byRoute(d.stops).map((g) => (
            <section key={g.routeId ?? "off"}>
              {/* The route's head: a quiet band in the list, not a card. The count is done of due today. */}
              <div className={cn("flex min-h-8 items-center gap-2 border-t border-bz-line-soft bg-bz-paper", PAD)}>
                <h3 className="m-0 min-w-0 flex-1 truncate text-[12px] font-semibold text-bz-text">{g.routeId ? routeName(g.routeId) : "Not on today's routes"}</h3>
                <span className={cn("shrink-0 text-[11px] text-bz-text-soft", NUM)}>{g.routeId ? `${g.stops.filter((x) => x.status === "done").length} of ${g.stops.length}` : g.stops.length}</span>
              </div>
              <ol className={ROWS}>
                {g.stops.map((x, i) => (
                  <OutletRow key={x.customerId} c={customerById(x.customerId)} n={i + 1} status={x.status} distance={distanceTo(customerById(x.customerId), from)} onOpen={() => open(x.visit?.id ?? x.customerId)} />
                ))}
              </ol>
            </section>
          ))
        )}
      </ListBlock>
      {d.stops.length > 0 && <div className={cn("py-3", PAD)}>{another}</div>}
    </RepShell>
  );
}
