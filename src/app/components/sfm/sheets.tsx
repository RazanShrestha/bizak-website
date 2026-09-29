import * as React from "react";
import { useNavigate } from "react-router";
import { CalendarPlus, Phone, Plus, Receipt, ShoppingCart, X, Route as RouteIcon, Footprints, Copy } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, Chip, DocLink, GHOST_SM, LABEL, MenuItem, NUM, PLAIN_BTN, Select, Stat, Statline, ToastHost, useToast } from "../sales/bzw";
import { ActivityList } from "../sales/record";
import { NoteFoot } from "../sales/parts";
import { MasterSheet } from "../masters/kit/MasterSheet";
import { personById } from "../productivity/shared";
import {
  FIELD_TODAY,
  STATUS_META,
  addNote,
  addPartiesToRoute,
  addRepToRoute,
  dayAdd,
  fmtDay,
  fmtDayShort,
  partyCoverage,
  pct,
  planRoute,
  plansStore,
  removePartyFromRoute,
  removeRepFromRoute,
  repById,
  repDay,
  restorePartyLink,
  routesOfRep,
  weekOf,
  WEEKDAYS,
  leaveOf,
  isWorkday,
} from "./model";
import { Money, RouteChip, StopMark, StopStrip, routeColor, useField, useSheetLinks } from "./kit";
import { FIELD_VISITS } from "./seed";

// ════════════════════════════════════════════════════════════════════════════
// SHEETS — a rep or a party, opened over whatever tab you are on
//
// A sheet is for the thing you consult ON THE WAY: it floats at the right over a
// 10 % dim that does not take the pointer (masters MasterSheet), so the board
// behind stays readable. Both live in the URL (`?rep=` / `?party=`), so a link
// to "Arun this week" or "this outlet" can be sent, and Back closes them.
//
// Every record carries History and Notes (owner rule 2026-09-27): the sheet's
// last block is the activity list with its note line.
// ════════════════════════════════════════════════════════════════════════════

/** Notes and history of one subject key (`rep:EMP-301`, `route:RT-01`, `day:EMP-301:2026-09-04`…). */
export function Activity({ subject, extraHistory = [] }: { subject: string; extraHistory?: { id: string; whoId: string; when: string; what: string }[] }) {
  const { notes, changes } = useField();
  const comments = notes.filter((n) => n.subject === subject).map((n) => ({ id: n.id, authorId: n.authorId, when: n.when, body: n.body }));
  const history = [...extraHistory, ...changes.filter((c) => c.subject === subject).map((c) => ({ id: c.id, whoId: c.whoId, when: c.when, what: c.what }))];
  return <ActivityList comments={comments} history={history} />;
}
export function ActivityFoot({ subject }: { subject: string }) {
  return <NoteFoot onSend={(n) => addNote(subject, n.title ? `${n.title} — ${n.body}` : n.body)} />;
}

function SheetBlock({ title, count, right, children }: { title: string; count?: number; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-bz-line-soft px-5 py-4">
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h3>
        {count !== undefined && <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{count}</span>}
        {right && <div className="ml-auto flex items-center gap-1.5">{right}</div>}
      </div>
      {children}
    </section>
  );
}

// ── Rep sheet ───────────────────────────────────────────────────────────────

export function RepSheet({ repId, onClose, onOpenDay }: { repId: string; onClose: () => void; onOpenDay: (repId: string, date: string) => void }) {
  const { routes, ctx } = useField();
  const navigate = useNavigate();
  const { toast, show, dismiss } = useToast();
  const rep = repById(repId);
  if (!rep) return null;
  const today = repDay(repId, FIELD_TODAY, ctx);
  const mine = routesOfRep(repId, routes);
  const addable = routes.filter((r) => r.subsidiaryId === rep.subsidiaryId && !r.repIds.includes(repId));
  const week = weekOf(FIELD_TODAY);
  const nextWeek = week.map((d) => dayAdd(d, 7));
  // The same window as Performance's "Last 30 days": today and the 29 days before it.
  const days30 = Array.from({ length: 30 }, (_, i) => dayAdd(FIELD_TODAY, -i)).filter(isWorkday).map((d) => repDay(repId, d, ctx));
  const worked = days30.filter((d) => d.visits.length > 0);
  const planned = days30.reduce((s, d) => s + d.figures.planned, 0);
  const visited = days30.reduce((s, d) => s + d.figures.visited, 0);
  const allVisits = days30.reduce((s, d) => s + d.figures.visited + d.figures.unplanned, 0);
  const productive = days30.reduce((s, d) => s + d.figures.productive, 0);
  const value = days30.reduce((s, d) => s + d.figures.value, 0);
  const closed = days30.filter((d) => d.close).length;
  const firstIns = worked.map((d) => d.figures.firstIn).filter((x): x is string => !!x).sort();
  const medianIn = firstIns[Math.floor(firstIns.length / 2)] ?? "—";

  const copyLastWeek = () => {
    const src = week.map((d) => ctx.plans.filter((p) => p.repId === repId && p.date === d));
    const added: string[] = [];
    let skipped = 0;
    src.forEach((ps, i) =>
      ps.forEach((p) => {
        const r = planRoute(repId, p.routeId, [nextWeek[i]]);
        added.push(...r.added.map((a) => a.id));
        skipped += r.skipped.length;
      }),
    );
    show("success", `Copied this week to next: ${added.length} planned${skipped ? ` · ${skipped} skipped` : ""}`, added.length ? { label: "Undo", run: () => plansStore.set((ps) => ps.filter((p) => !added.includes(p.id))) } : undefined);
  };

  const meta = STATUS_META[today.status];
  return (
    <MasterSheet
      mode="view"
      width={520}
      onClose={onClose}
      eyebrow="Sales rep"
      title={rep.name}
      image={<Avatar person={personById(repId)} size={40} />}
      meta={[
        <a key="p" href={`tel:${rep.phone}`} className="inline-flex items-center gap-1 hover:text-bz-text">
          <Phone size={11} /> {rep.phone}
        </a>,
        rep.subsidiaryId === "NP-02" ? "Bizak Gandaki" : "Bizak Nepal",
        `Since ${fmtDayShort(rep.since)} ${rep.since.slice(0, 4)}`,
      ]}
      chips={<Chip tone={meta.tone}>{meta.label}</Chip>}
      menu={(close) => (
        <>
          <MenuItem icon={Footprints} onClick={() => (close(), onOpenDay(repId, FIELD_TODAY))}>
            Open today
          </MenuItem>
          <MenuItem icon={CalendarPlus} onClick={() => (close(), navigate(`/design/sfm/plan?focus=${repId}`))}>
            Open in Plan
          </MenuItem>
          <MenuItem icon={Copy} onClick={() => (close(), copyLastWeek())}>
            Copy this week to next week
          </MenuItem>
        </>
      )}
    >
      <SheetBlock title="Today" right={<button type="button" className={GHOST_SM} onClick={() => onOpenDay(repId, FIELD_TODAY)}>Open day</button>}>
        <p className="m-0 text-[12px] text-bz-text">{today.line}</p>
        {today.stops.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            {today.routes.map((r) => (
              <RouteChip key={r.id} route={r} tight />
            ))}
            <StopStrip stops={today.stops.map((s) => ({ state: s.state, title: s.party.name }))} unplanned={today.unplanned.map((u) => ({ title: u.party.name, productive: u.productive }))} />
          </div>
        )}
      </SheetBlock>

      <SheetBlock
        title="Routes they run"
        count={mine.length}
        right={
          addable.length > 0 && (
            <Select
              value={null}
              onChange={(v) => (addRepToRoute(v, repId), show("success", `${rep.name.split(" ")[0]} now runs ${v}`, { label: "Undo", run: () => removeRepFromRoute(v, repId) }))}
              options={addable.map((r) => ({ value: r.id, label: `${r.id} ${r.name}`, hint: r.repIds.length ? `Also run by ${r.repIds.map((x) => repById(x)?.name.split(" ")[0]).join(", ")}` : "No rep yet" }))}
              width={280}
              align="right"
              placeholder="Find a route…"
              trigger="ghost"
              label="Add route"
              icon={Plus}
            />
          )
        }
      >
        {mine.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No routes yet — add one, or plan a route on the board.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {mine.map((r) => (
              <li key={r.id} className="group flex items-center gap-2 border-b border-bz-line-soft py-1.5 last:border-0">
                <RouteChip route={r} onClick={() => navigate(`/design/sfm/routes/${r.id}`)} />
                <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{ctx.links.filter((l) => l.routeId === r.id).length} stops</span>
                {r.repIds.length > 1 && <span className="text-[11px] text-bz-text-soft">· shared with {r.repIds.filter((x) => x !== repId).map((x) => repById(x)?.name.split(" ")[0]).join(", ")}</span>}
                <button
                  type="button"
                  className={cn(PLAIN_BTN, "ml-auto opacity-0 group-hover:opacity-100 focus-visible:opacity-100")}
                  title={`Stop ${rep.name.split(" ")[0]} running ${r.id}`}
                  aria-label={`Remove ${r.id}`}
                  onClick={() => (removeRepFromRoute(r.id, repId), show("success", `${rep.name.split(" ")[0]} no longer runs ${r.id} — his planned days stay`, { label: "Undo", run: () => addRepToRoute(r.id, repId) }))}
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SheetBlock>

      <SheetBlock title="This week" right={<button type="button" className={GHOST_SM} onClick={copyLastWeek} title="Plan next week the same way">Copy to next week</button>}>
        <WeekStrip repId={repId} days={week} onOpenDay={onOpenDay} />
        <p className={cn(LABEL, "m-0 mb-1.5 mt-3")}>Next week</p>
        <WeekStrip repId={repId} days={nextWeek} onOpenDay={onOpenDay} />
      </SheetBlock>

      <SheetBlock title="Last 30 days">
        <Statline>
          <Stat label="Days worked" value={worked.length} />
          <Stat label="Compliance" value={`${pct(visited, planned)}%`} meter={pct(visited, planned)} title="Planned stops visited ÷ planned stops" />
          <Stat label="Productive" value={`${pct(productive, allVisits)}%`} title="Visits with an order that day ÷ all visits" />
          <Stat label="Orders" value={<Money value={value} />} />
          <Stat label="First check-in" value={medianIn} sub="median" />
          <Stat label="Closed" value={`${closed} of ${worked.length}`} />
        </Statline>
      </SheetBlock>

      <Activity subject={`rep:${repId}`} />
      <ActivityFoot subject={`rep:${repId}`} />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </MasterSheet>
  );
}

function WeekStrip({ repId, days, onOpenDay }: { repId: string; days: string[]; onOpenDay: (repId: string, date: string) => void }) {
  const { ctx } = useField();
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d) => {
        const rd = repDay(repId, d, ctx);
        const lv = leaveOf(repId, d);
        const off = !isWorkday(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => onOpenDay(repId, d)}
            className={cn(
              "flex min-h-[46px] flex-col items-start gap-1 rounded-bz-sm border px-1.5 py-1 text-left transition-colors hover:border-bz-line",
              d === FIELD_TODAY ? "border-bz-text-soft bg-bz-surface" : "border-bz-line-soft bg-bz-paper",
              off && "bg-bz-paper-warm/60",
              lv && "bg-[repeating-linear-gradient(135deg,transparent_0_5px,var(--bz-line-soft)_5px_6px)]",
            )}
            title={`${fmtDay(d)} — ${rd.line}`}
          >
            <span className={cn("text-[10px] font-semibold text-bz-text-soft", NUM)}>
              {WEEKDAYS[new Date(d).getUTCDay()]} {Number(d.slice(8))}
            </span>
            {rd.routes.map((r) => (
              <span key={r.id} className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-bz-text-muted">
                <span className="h-2.5 w-[3px] rounded-bz-pill" style={{ background: routeColor(r.tone) }} />
                {r.id}
              </span>
            ))}
            {!rd.routes.length && <span className="text-[10px] text-bz-text-soft">{lv ? (lv.status === "approved" ? "Leave" : "Leave?") : off ? "Off" : "—"}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Party sheet ─────────────────────────────────────────────────────────────

const STAGE: Record<string, { label: string; tone: "neutral" | "partial" | "pending" }> = {
  customer: { label: "Customer", tone: "neutral" },
  prospect: { label: "Prospect", tone: "partial" },
  lead: { label: "Lead", tone: "pending" },
};
export const stageChip = (stage: string) => <Chip tone={STAGE[stage].tone}>{STAGE[stage].label}</Chip>;

export function PartySheet({ partyId, onClose, onOpenVisit, docked }: { partyId: string; onClose: () => void; onOpenVisit?: (visitId: string) => void; docked?: boolean }) {
  const { routes, links, ctx } = useField();
  const navigate = useNavigate();
  const { toast, show, dismiss } = useToast();
  const cov = partyCoverage(partyId, links, ctx.orders);
  const p = cov.party;
  if (!p) return null;
  const addable = routes.filter((r) => r.subsidiaryId === p.subsidiaryId && !cov.routes.some((x) => x.id === r.id));
  const lastVisits = cov.lastVisit ? PARTY_VISITS(partyId).slice(-3).reverse() : [];
  const newOrder = () => navigate(`/design/sales/orders/new?cust=${partyId}${p.repId ? `&rep=${p.repId}` : ""}&day=${FIELD_TODAY}`);
  return (
    <MasterSheet
      mode="view"
      width={docked ? 720 : 500}
      docked={docked}
      onClose={onClose}
      eyebrow={STAGE[p.stage].label}
      title={p.name}
      meta={[p.code, p.area, <a key="t" href={`tel:${p.phone}`} className="hover:text-bz-text">{p.phone}</a>]}
      chips={
        <>
          {stageChip(p.stage)}
          {cov.band === "no-route" && <Chip tone="danger">On no route</Chip>}
          {cov.band === "overdue" && <Chip tone="danger">{cov.daysSince === null ? "Never visited" : `Not visited in ${cov.daysSince} days`}</Chip>}
        </>
      }
      door={{ label: "Open customer", onOpen: () => show("info", "In the app this opens the customer record (Customers › " + p.code + ").") }}
      footLeft={
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" className={GHOST_SM} onClick={newOrder} title="A sales order for this outlet, with its rep">
            <ShoppingCart size={12} /> New order
          </button>
          <button type="button" className={GHOST_SM} onClick={() => navigate(`/design/sales/receipts?cust=${partyId}`)} title="Record money taken from this outlet">
            <Receipt size={12} /> Take a receipt
          </button>
        </div>
      }
    >
      <SheetBlock
        title="Routes"
        count={cov.routes.length}
        right={
          addable.length > 0 && (
            <Select
              value={null}
              onChange={(v) => (addPartiesToRoute(v, [partyId]), show("success", `Added to ${v}`, { label: "Undo", run: () => removePartyFromRoute(v, partyId) }))}
              options={addable.map((r) => ({ value: r.id, label: `${r.id} ${r.name}`, hint: `${links.filter((l) => l.routeId === r.id).length} stops · ${r.repIds.map((x) => repById(x)?.name.split(" ")[0]).join(", ") || "no rep"}` }))}
              width={280}
              align="right"
              placeholder="Find a route…"
              label="Add to route"
              icon={RouteIcon}
            />
          )
        }
      >
        {cov.routes.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-red">On no route — nobody is planned to visit it.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {cov.routes.map((r) => (
              <span key={r.id} className="group inline-flex items-center gap-1">
                <RouteChip route={r} onClick={() => navigate(`/design/sfm/routes/${r.id}`)} />
                <button
                  type="button"
                  className={cn(PLAIN_BTN, "opacity-0 group-hover:opacity-100 focus-visible:opacity-100")}
                  aria-label={`Remove from ${r.id}`}
                  title={`Remove from ${r.id}`}
                  onClick={() => {
                    const link = removePartyFromRoute(r.id, partyId);
                    if (link) show("success", `Removed from ${r.id}`, { label: "Undo", run: () => restorePartyLink(link) });
                  }}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="m-0 mt-2.5 flex items-center gap-2 text-[11.5px] text-bz-text-muted">
          Rep {p.repId ? <><Avatar person={personById(p.repId)} size={16} /> {repById(p.repId)?.name}</> : "— none"}
        </p>
      </SheetBlock>

      <SheetBlock title="Last visits" count={cov.visits30} right={<span className="text-[10.5px] text-bz-text-soft">in 30 days</span>}>
        {lastVisits.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No visit recorded.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {lastVisits.map((v) => {
              const d = repDay(v.repId, v.date, ctx);
              const planned = d.stops.find((s) => s.party.id === partyId);
              const un = d.unplanned.find((u) => u.visit.id === v.id);
              const state = planned ? planned.state : "unplanned";
              const os = (planned?.orders ?? un?.orders ?? []);
              return (
                <li key={v.id}>
                  <button type="button" onClick={() => onOpenVisit?.(v.id)} className="flex w-full items-center gap-2 border-b border-bz-line-soft py-1.5 text-left text-[11.5px] last:border-0 hover:bg-bz-paper-warm">
                    <StopMark state={state} unplannedProductive={!!un?.productive} />
                    <span className={cn("w-[70px] shrink-0 text-bz-text-muted", NUM)}>{fmtDayShort(v.date)} {v.in}</span>
                    <Avatar person={personById(v.repId)} size={16} />
                    <span className="min-w-0 flex-1 truncate text-bz-text">{os.length ? os.map((o) => o.no).join(", ") : v.noOrderReason ? `No order — ${v.noOrderReason}` : "Visited"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SheetBlock>

      <SheetBlock title="Money">
        <Statline>
          <Stat label="Last order" value={cov.lastOrder ? cov.lastOrder.no : "—"} sub={cov.lastOrder ? fmtDayShort(cov.lastOrder.date) : undefined} />
          <Stat label="Orders · 90 days" value={<Money value={cov.orders90} />} />
          <Stat label="Owes" value={<Money value={p.outstanding} />} danger={p.outstanding > 30_000} title="Open invoice balance — needs: InvoiceSettlementService per customer" />
        </Statline>
        {cov.lastOrder && (
          <div className="mt-2">
            <DocLink no={cov.lastOrder.no} kind="Sales order" onClick={() => navigate(`/design/sales/orders/${cov.lastOrder!.no}`)} />
          </div>
        )}
      </SheetBlock>

      <Activity subject={`party:${partyId}`} />
      <ActivityFoot subject={`party:${partyId}`} />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </MasterSheet>
  );
}

const PARTY_VISITS = (partyId: string) => FIELD_VISITS.filter((v) => v.partyId === partyId).sort((a, b) => (a.date + a.in).localeCompare(b.date + b.in));

/** Renders whichever sheet the URL names. Every SFM page mounts one. */
export function SheetHost({ onOpenDay, onOpenVisit }: { onOpenDay: (repId: string, date: string) => void; onOpenVisit?: (visitId: string) => void }) {
  const { rep, party, close } = useSheetLinks();
  if (rep) return <RepSheet repId={rep} onClose={close} onOpenDay={onOpenDay} />;
  if (party) return <PartySheet partyId={party} onClose={close} onOpenVisit={onOpenVisit} />;
  return null;
}
