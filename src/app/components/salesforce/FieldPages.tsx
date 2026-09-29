import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { Camera, Phone } from "lucide-react";
import { cn } from "../ui/utils";
import { GHOST_SM, NUM, Select } from "../sales/bzw";
import { useStore } from "../sales/store";
import { ACTIVITIES, PLAYBOOKS, REPS, SF_TODAY } from "./data";
import { day, dayTime } from "./engine";
import { hubStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, EmptyNote, Fact, Figures, Flag, List, Money, Page, PageIntro, Row, Section, SidePanel, TextTabs, TypeMark } from "./ui";
import { DAY_START_DUE, DAY_STATUS, SF_NOW_LABEL, VISITS, VISIT_DAYS, VISIT_STATE, ctype, custById, firstName, isVisited, repArea, repById, repDay, visitById, visitHistory, withOrder } from "./field-data";
import type { HistoryItem, RepDay, Visit } from "./field-data";
import { Block, DayPlot, HistoryNotes, Initials, Micro, Ticks, VisitMark, outcomeOf, shortDay } from "./field-kit";
import { PlanPage } from "./FieldPlan";

// ════════════════════════════════════════════════════════════════════════════
// FIELD — Today and Visits
//
// Today answers one question: is the field covered, and who needs me? One calm
// row per person, exceptions first; the row opens that person's day as a
// timeline of outlets with the playbook's ticks. Visits is the register of
// every check-in — today and the days before — each opening its evidence:
// check-in/out, geofence, what the playbook asked and what was done, the order.
// ════════════════════════════════════════════════════════════════════════════

const STATUS_ORDER = { "not-started": 0, idle: 1, "on-beat": 2, done: 3 } as const;

function dayLine(d: RepDay) {
  const where = `${d.checkedIn} of ${d.visits.length} outlets`;
  if (d.status === "not-started") return `${where} · due at ${DAY_START_DUE}`;
  if (d.status === "idle") return `${where} · idle since ${d.lastCheckOut}`;
  if (d.status === "done") return `${where} · closed at ${d.endedAt}`;
  return `${where} · last check-in ${d.lastCheckIn}`;
}

/** Visits with an order ÷ visits that happened (checked in, not skipped, finished). */
export function strikeRate(visits: Visit[]) {
  const calls = visits.filter((v) => v.state === "done");
  return calls.length ? Math.round((calls.filter(withOrder).length / calls.length) * 100) : 0;
}

// ── Today ───────────────────────────────────────────────────────────────────

export function TodayPage() {
  const { repId } = useParams();
  const navigate = useNavigate();
  const days = React.useMemo(() => REPS.map((r) => repDay(r.id)).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.rep.name.localeCompare(b.rep.name)), []);
  const out = days.filter((d) => d.status === "on-beat" || d.status === "idle").length;
  const all = days.flatMap((d) => d.visits);
  const planned = all.length;
  const visited = days.reduce((s, d) => s + d.checkedIn, 0);
  const value = days.reduce((s, d) => s + d.orderValue, 0);
  const orders = days.reduce((s, d) => s + d.orders, 0);
  const late = days.filter((d) => d.status === "not-started");
  const open = days.find((d) => d.rep.id === repId);

  return (
    <SfShell page="today" panel={open && <RepDayPanel key={open.rep.id} d={open} onClose={() => navigate(sfPath("today"))} />}>
      <Page width="full">
        <PageIntro>
          {SF_NOW_LABEL}. {out} of {REPS.length} people are out on their beat.
        </PageIntro>

        <Figures
          items={[
            { label: "Out now", value: `${out} of ${REPS.length}`, sub: "on their beat" },
            { label: "Outlets visited", value: `${visited} of ${planned}`, sub: "planned today" },
            { label: "Orders from visits", value: <Money value={value} />, sub: `${orders} orders`, onClick: () => navigate(sfPath("visits")) },
            { label: "Strike rate", value: `${strikeRate(all)}%`, sub: "visits with an order" },
            { label: "Not started", value: late.length, sub: `due at ${DAY_START_DUE}`, tone: late.length ? "danger" : undefined, onClick: late[0] ? () => navigate(sfPath(`today/${late[0].rep.id}`)) : undefined },
          ]}
        />

        <Section title="People" count={days.length} className="mt-12" hint="exceptions first">
          <List>
            {days.map((d) => {
              const s = DAY_STATUS[d.status];
              return (
                <Row
                  key={d.rep.id}
                  active={d.rep.id === repId}
                  onClick={() => navigate(sfPath(`today/${d.rep.id}`))}
                  lead={<Initials rep={d.rep} />}
                  title={d.rep.name}
                  sub={`${repArea(d.rep)} · ${dayLine(d)}`}
                  meta={[
                    <Dot key="s" tone={s.tone}>
                      {s.label}
                    </Dot>,
                  ]}
                  trail={
                    <span className="flex flex-col items-end gap-1">
                      {d.orderValue > 0 ? <Money value={d.orderValue} /> : <span className="text-bz-text-soft">—</span>}
                      <Dot tone={s.tone} className="md:hidden">
                        {s.label}
                      </Dot>
                    </span>
                  }
                />
              );
            })}
          </List>
          <p className="m-0 mt-4 text-[11px] text-bz-text-soft">Idle means no check-in or check-out for 90 minutes. The day is due to start at {DAY_START_DUE}.</p>
        </Section>
      </Page>
    </SfShell>
  );
}

function RepDayPanel({ d, onClose }: { d: RepDay; onClose: () => void }) {
  const navigate = useNavigate();
  const s = DAY_STATUS[d.status];
  const unplanned = d.visits.filter((v) => !v.planned).length;
  const trail: HistoryItem[] = [
    ...(d.startedAt ? [{ id: "start", who: d.rep.name, what: "started the day", when: `Today, ${d.startedAt}` }] : []),
    ...d.visits.flatMap(visitHistory),
    ...(d.status === "done" && d.endedAt ? [{ id: "end", who: d.rep.name, what: "closed the day", when: `Today, ${d.endedAt}` }] : []),
  ];
  return (
    <SidePanel
      open
      onClose={onClose}
      eyebrow={`Today · ${repArea(d.rep)}`}
      title={d.rep.name}
      meta={
        <>
          <Dot tone={s.tone}>{s.label}</Dot>
          <span className={NUM}>
            {d.checkedIn} of {d.visits.length} outlets
          </span>
          {d.startedAt && <span className={NUM}>started {d.startedAt}</span>}
          {d.orderValue > 0 && <Money value={d.orderValue} />}
        </>
      }
    >
      {d.status === "not-started" && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Flag>Not started</Flag>
          <span className="min-w-0 flex-1 text-[12px] text-bz-text-muted">
            Due at {DAY_START_DUE} · {d.visits.length} outlets are waiting.
          </span>
          <a href={`tel:${d.rep.phone}`} className={GHOST_SM}>
            <Phone size={12} /> Call {firstName(d.rep)}
          </a>
        </div>
      )}

      <DayPlot visits={d.visits} />

      <Block title="Outlets" aside={`${d.visits.length - unplanned} planned${unplanned ? ` · ${unplanned} unplanned` : ""}`}>
        <ol className="m-0 list-none p-0">
          {d.visits.map((v, i) => {
            const c = custById(v.customerId);
            const t = ctype(c);
            const openable = isVisited(v);
            return (
              <li key={v.id} className="relative flex gap-3 pb-5 last:pb-0">
                <span className={cn("w-10 shrink-0 pt-px text-right text-[11px] text-bz-text-soft", NUM)}>{v.checkIn ?? "—"}</span>
                <span className="relative flex w-3 shrink-0 justify-center pt-1">
                  {i < d.visits.length - 1 && <span className="absolute left-1/2 top-4 -bottom-5 w-px -translate-x-1/2 bg-bz-line-soft" />}
                  <VisitMark state={v.state} title={VISIT_STATE[v.state].label} />
                </span>
                <div className="min-w-0 flex-1">
                  {openable ? (
                    <button type="button" onClick={() => navigate(sfPath(`visits/${v.id}`))} className="block max-w-full truncate text-left text-[12.5px] font-medium text-bz-text hover:underline hover:underline-offset-2">
                      {c.name}
                    </button>
                  ) : (
                    <span className="block truncate text-[12.5px] font-medium text-bz-text">{c.name}</span>
                  )}
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-bz-text-soft">
                    <TypeMark name={t.name} color={t.color} className="text-[11px]" />
                    {!v.planned && <span>· Unplanned</span>}
                    <span className={cn(v.state === "missed" && "text-bz-red")}>· {outcomeOf(v)}</span>
                  </span>
                  <Ticks acts={v.acts} state={v.state} className="mt-1" />
                </div>
              </li>
            );
          })}
        </ol>
      </Block>

      <HistoryNotes recordKey={`day:${d.rep.id}:${d.date}`} seed={trail} />
    </SidePanel>
  );
}

// ── Visits ──────────────────────────────────────────────────────────────────

type VisitTab = "all" | "order" | "none" | "skipped";
const inTab = (v: Visit, t: VisitTab) =>
  t === "all" ? true : t === "order" ? withOrder(v) : t === "none" ? (v.state === "done" || v.state === "in-progress") && !withOrder(v) : v.state === "skipped" || v.state === "missed";

export function VisitsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<VisitTab>("all");
  const [when, setWhen] = React.useState<string>("all");
  const [who, setWho] = React.useState<string>("all");
  const register = React.useMemo(
    () => VISITS.filter((v) => v.state !== "pending").sort((a, b) => b.date.localeCompare(a.date) || (b.checkIn ?? "").localeCompare(a.checkIn ?? "") || a.repId.localeCompare(b.repId)),
    [],
  );
  const scoped = register.filter((v) => (when === "all" || v.date === when) && (who === "all" || v.repId === who));
  const shown = scoped.filter((v) => inTab(v, tab));
  const byDay = VISIT_DAYS.slice()
    .reverse()
    .map((d) => ({ date: d, rows: shown.filter((v) => v.date === d) }))
    .filter((g) => g.rows.length);
  const open = visitById(id);
  const calls = scoped.filter((v) => v.state === "done");

  return (
    <SfShell page="visits" panel={open && <VisitPanel key={open.id} v={open} onClose={() => navigate(sfPath("visits"))} />}>
      <Page width="full">
        <PageIntro
          actions={
            <>
              <Select
                value={when}
                onChange={setWhen}
                label={when === "all" ? "Last 3 days" : when === SF_TODAY ? "Today" : shortDay(when)}
                applied={when !== "all"}
                options={[{ value: "all", label: "Last 3 days" }, ...VISIT_DAYS.slice().reverse().map((d) => ({ value: d, label: d === SF_TODAY ? "Today" : shortDay(d) }))]}
                align="right"
                width={200}
              />
              <Select
                value={who}
                onChange={setWho}
                label={who === "all" ? "Everyone" : repById(who)?.name}
                applied={who !== "all"}
                options={[{ value: "all", label: "Everyone" }, ...REPS.map((r) => ({ value: r.id, label: r.name, hint: r.role }))]}
                align="right"
                width={220}
              />
            </>
          }
        >
          Every check-in from the field. {scoped.length} visits, {strikeRate(scoped)}% with an order{calls.length ? `, ${Math.round((calls.reduce((s, v) => s + v.minutes, 0) / calls.length) || 0)} min on average` : ""}.
        </PageIntro>

        <TextTabs<VisitTab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All", count: scoped.length },
            { value: "order", label: "With order", count: scoped.filter((v) => inTab(v, "order")).length },
            { value: "none", label: "No order", count: scoped.filter((v) => inTab(v, "none")).length },
            { value: "skipped", label: "Skipped", count: scoped.filter((v) => inTab(v, "skipped")).length },
          ]}
        />

        <div className="mt-6">
          {byDay.length === 0 && <EmptyNote>No visits match. Try another tab or day.</EmptyNote>}
          {byDay.map((g) => (
            <div key={g.date} className="mt-8 first:mt-0">
              <Micro className="mb-2 px-1">
                {g.date === SF_TODAY ? "Today" : shortDay(g.date)} · {g.rows.length}
              </Micro>
              <List>
                {g.rows.map((v) => {
                  const c = custById(v.customerId);
                  const rep = repById(v.repId);
                  const st = VISIT_STATE[v.state];
                  return (
                    <Row
                      key={v.id}
                      active={v.id === id}
                      onClick={() => navigate(sfPath(`visits/${v.id}`))}
                      lead={<VisitMark state={v.state} size={9} title={st.label} />}
                      title={c.name}
                      sub={`${rep?.name} · ${v.checkIn ? `${v.checkIn}${v.checkOut ? `–${v.checkOut}` : ", here now"}` : "no check-in"} · ${ctype(c).name}`}
                      meta={[
                        v.geofence && !v.geofence.ok ? <Flag key="g">Outside geofence</Flag> : null,
                        <Dot key="s" tone={withOrder(v) ? "good" : st.tone === "good" ? "neutral" : st.tone}>
                          {withOrder(v) ? "Order" : v.state === "done" ? "No order" : st.label}
                        </Dot>,
                      ].filter(Boolean)}
                      trail={withOrder(v) ? <Money value={v.orderValue} /> : <span className="text-bz-text-soft">—</span>}
                    />
                  );
                })}
              </List>
            </div>
          ))}
        </div>
      </Page>
    </SfShell>
  );
}

function VisitPanel({ v, onClose }: { v: Visit; onClose: () => void }) {
  const navigate = useNavigate();
  const hub = useStore(hubStore);
  const c = custById(v.customerId);
  const t = ctype(c);
  const rep = repById(v.repId);
  const pb = PLAYBOOKS.find((p) => p.id === t.playbookId);
  const hubOrder = hub.find((o) => o.id === v.orderId && o.source === "rep");
  const st = VISIT_STATE[v.state];
  return (
    <SidePanel
      open
      onClose={onClose}
      eyebrow={`Visit · ${v.id}`}
      title={c.name}
      meta={
        <>
          <TypeMark name={t.name} color={t.color} />
          <button type="button" onClick={() => navigate(sfPath(`team/${v.repId}`))} className="hover:text-bz-text hover:underline hover:underline-offset-2">
            {rep?.name}
          </button>
          <span>{v.date === SF_TODAY ? "Today" : day(v.date)}</span>
          <Dot tone={st.tone}>{st.label}</Dot>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <Fact label="Check-in">{v.checkIn ?? "—"}</Fact>
        <Fact label="Check-out">{v.checkOut ?? (v.state === "in-progress" ? "Still there" : "—")}</Fact>
        <Fact label="Time spent">{v.checkIn ? `${v.minutes} min` : "—"}</Fact>
        <Fact label="Geofence">
          {v.geofence ? (
            <Dot tone={v.geofence.ok ? "good" : "danger"}>
              {v.geofence.ok ? "Inside" : "Outside"} · {v.geofence.metres} m
            </Dot>
          ) : (
            "—"
          )}
        </Fact>
      </div>
      {!v.planned && <p className="m-0 mt-4 text-[11.5px] text-bz-text-soft">Not on {firstName(rep)}'s plan for the day — added in the field.</p>}
      {v.state === "skipped" && <p className="m-0 mt-4 text-[12px] text-bz-text-muted">Skipped: {v.skipReason}.</p>}
      {v.state === "missed" && <p className="m-0 mt-4 text-[12px] text-bz-red">Missed — planned for the day but never checked in.</p>}

      <Block title="Playbook" aside={pb?.name ?? "None for this type"}>
        {v.acts.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">{t.plural} have no visit playbook.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col divide-y divide-bz-line-soft p-0">
            {v.acts.map((a) => {
              const act = ACTIVITIES.find((x) => x.id === a.activityId);
              const open = v.state === "missed" || v.state === "skipped";
              return (
                <li key={a.activityId} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] text-bz-text">
                      {act?.name}
                      <span className="ml-2 text-[11px] text-bz-text-soft">{a.required ? "Required" : "Optional"}{a.geofence ? " · at the outlet" : ""}</span>
                    </span>
                    {a.result && <span className="mt-0.5 block text-[11px] text-bz-text-muted">{a.result}</span>}
                  </span>
                  {!open && (
                    <Dot tone={a.done ? "good" : a.required ? "danger" : "off"} className="pt-0.5">
                      {a.done ? "Done" : v.state === "in-progress" ? "Not yet" : a.required ? "Not done" : "Skipped"}
                    </Dot>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Block>

      <Block title="Order">
        {hubOrder ? (
          <button type="button" onClick={() => navigate(sfPath(`orders/${hubOrder.id}`))} className="flex w-full items-center gap-3 rounded-bz-md border border-bz-line-soft px-3 py-2.5 text-left hover:bg-bz-paper-warm">
            <span className="min-w-0 flex-1">
              <span className={cn("block text-[12.5px] font-medium text-bz-text", NUM)}>{hubOrder.id}</span>
              <span className="block text-[11px] text-bz-text-soft">
                {v.lines} lines · taken {dayTime(hubOrder.at)} · {hubOrder.soNo ? `sales order ${hubOrder.soNo}` : hubOrder.status === "review" ? "waiting for review" : hubOrder.status === "rejected" ? "rejected" : "ready to approve"}
              </span>
            </span>
            <Money value={v.orderValue} />
          </button>
        ) : v.orderValue > 0 ? (
          <p className="m-0 flex items-baseline justify-between text-[12.5px] text-bz-text">
            <span>{v.lines} lines</span>
            <Money value={v.orderValue} />
          </p>
        ) : (
          <p className="m-0 text-[12px] text-bz-text-muted">{v.noOrderReason ? `No order — ${v.noOrderReason.toLowerCase()}.` : "No order on this visit."}</p>
        )}
      </Block>

      <Block title="Photos" aside={v.photos ? `${v.photos}` : undefined}>
        {v.photos ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: v.photos }).map((_, i) => (
              <span key={i} className="flex size-16 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-soft" title={`Photo ${i + 1} · geo-stamped`}>
                <Camera size={14} />
              </span>
            ))}
          </div>
        ) : (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No photos on this visit.</p>
        )}
      </Block>

      <HistoryNotes recordKey={`visit:${v.id}`} seed={visitHistory(v)} />
    </SidePanel>
  );
}

// ── Routes ──────────────────────────────────────────────────────────────────

export const FIELD_ROUTES = [
  { path: "design/salesforce/today", Component: TodayPage },
  { path: "design/salesforce/today/:repId", Component: TodayPage },
  { path: "design/salesforce/plan", Component: PlanPage },
  { path: "design/salesforce/visits", Component: VisitsPage },
  { path: "design/salesforce/visits/:id", Component: VisitsPage },
];
