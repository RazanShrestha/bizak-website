import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CalendarClock, CircleCheck, ClipboardCheck, Megaphone, Pencil, ShieldAlert, Table2 } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, Dialog, DocLink, Field, GHOST, GHOST_SM, INPUT, MenuItem, MenuSep, NUM, NumberField, Select, Stat, Statline } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { SheetFrame } from "../sales/FulfilSheet";
import { Amount } from "../sales/orders";
import { Cell, CellGrid, Dual } from "../sales/parts";
import { Block, RecordShell, StepCard } from "../sales/record";
import type { ShellCtx } from "../sales/record";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Campaign, SfEvent } from "./data";
import { day, daysUntil, npr } from "./engine";
import { nextId } from "./persist";
import { logEvent } from "./records";
import { campaignsStore, eventsStore } from "./store";
import { FxDate, FxDesk, pillTone } from "./fx-desk";
import { SfActivity, SfNoteFoot, chipTone, sfPath } from "./sf";
import { EVENT_LABEL, addDays, campaignName, linkToCampaign, statusNow } from "./activationKit";
import { IntInput, MoneyInput, More, Pair, Picker } from "./network-form";

// ════════════════════════════════════════════════════════════════════════════
// GROWTH · EVENTS — retailer meets, launches, sampling, dealer conferences
//
// The existing MAST_EVENT_SETUP + EVENT_ATTENDEE, extended with cost, a
// campaign and what the event brought in (research/C §6). The desk answers two
// questions: what is coming up, and was the last one worth its cost. Dealers
// RSVP on the portal, which moves `confirmed`; everything else is entered here.
// ════════════════════════════════════════════════════════════════════════════

type Show = ShellCtx["show"];
type Status = { tone: "good" | "info" | "warn" | "off"; label: string };
type Row = { e: SfEvent; st: Status; campaign: Campaign | undefined };
const KINDS: SfEvent["kind"][] = ["Retailer meet", "Launch", "Sampling", "Dealer conference"];
const STATUS_LABELS = [EVENT_LABEL.planned, EVENT_LABEL.live, EVENT_LABEL.done, "Attendance due"];
const DASH = <span className="text-bz-text-soft">—</span>;

const isPast = (e: SfEvent) => e.status === "done" || e.date < SF_TODAY;
/** Today or past, and nobody has recorded who came. */
const needsAttendance = (e: SfEvent) => e.status !== "done" && e.date <= SF_TODAY && e.attended === null;
const statusOf = (e: SfEvent): Status =>
  needsAttendance(e) ? { tone: "warn", label: "Attendance due" } : e.status === "done" ? { tone: "off", label: EVENT_LABEL.done } : e.date === SF_TODAY || e.status === "live" ? { tone: "good", label: EVENT_LABEL.live } : { tone: "info", label: EVENT_LABEL.planned };
const whenText = (iso: string) => {
  const n = daysUntil(iso);
  return n === 0 ? "today" : n === 1 ? "tomorrow" : n > 1 ? `in ${n} days` : n === -1 ? "yesterday" : `${-n} days ago`;
};

export function EventsPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const events = useStore(eventsStore);
  const campaigns = useStore(campaignsStore);
  const [marking, setMarking] = React.useState<string | null>(null);

  // `?new=1` is retired: an old link still lands on the new event.
  React.useEffect(() => {
    if (search.get("new") !== "1") return;
    const campaign = search.get("campaign");
    navigate(`${sfPath("events/new")}${campaign ? `?campaign=${campaign}` : ""}`, { replace: true });
  }, [search, navigate]);

  const rows: Row[] = events.map((e) => ({ e, st: statusOf(e), campaign: campaigns.find((c) => c.id === e.campaignId) }));
  const upcoming = events.filter((e) => !isPast(e)).sort((a, b) => a.date.localeCompare(b.date));
  const next = upcoming[0];
  const done = events.filter((e) => e.status === "done");
  const due = events.filter(needsAttendance).length;
  const live = campaigns.filter((c) => statusNow(c, SF_TODAY) !== "ended");
  const markEvent = events.find((e) => e.id === marking);

  return (
    <FxDesk<Row>
      place="events"
      section="salesforce/events"
      noun={["event", "events"]}
      partyLabel="Event"
      amountLabel="Cost"
      rows={rows}
      noOf={(r) => r.e.id}
      rowLabel={(r) => r.e.name}
      dateOf={(r) => r.e.date}
      searchText={(r) => `${r.e.id} ${r.e.name} ${r.e.kind} ${r.e.place} ${r.campaign?.name ?? ""}`}
      searchPlaceholder="Number, name or place"
      stats={[
        {
          label: "Next event",
          title: next?.name,
          value: next ? (
            <button type="button" className="font-semibold hover:underline" onClick={() => navigate(sfPath(`events/${next.id}`))}>
              {day(next.date)}
            </button>
          ) : (
            "—"
          ),
        },
        { label: "Confirmed", value: `${npr(upcoming.reduce((s, e) => s + e.confirmed, 0))} of ${npr(upcoming.reduce((s, e) => s + e.invited, 0))}`, title: "Invitations confirmed for the events coming up" },
        { label: "Spent", value: <Amount value={done.reduce((s, e) => s + e.cost, 0)} currency="NPR" />, title: "Cost of the events marked attended" },
        { label: "Orders taken", value: done.reduce((s, e) => s + e.orders, 0) },
        { label: "Leads", value: done.reduce((s, e) => s + e.leads, 0) },
      ]}
      picks={[{ key: "due", label: "Attendance due", value: due, test: (r) => needsAttendance(r.e), danger: due > 0, title: "The day has come and nobody recorded who came" }]}
      views={[
        {
          key: "schedule",
          label: "Schedule",
          icon: CalendarClock,
          groups: (rs) => [
            { key: "due", label: "Attendance due", alarm: true, rows: rs.filter((r) => needsAttendance(r.e)) },
            { key: "up", label: "Upcoming", rows: rs.filter((r) => !needsAttendance(r.e) && !isPast(r.e)), empty: "Nothing planned." },
            { key: "past", label: "Past", rows: rs.filter((r) => !needsAttendance(r.e) && isPast(r.e)) },
          ],
        },
        { key: "register", label: "Register", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
      ]}
      filters={[
        ...STATUS_LABELS.map((s) => ({ value: `st:${s}`, label: s, group: "Status", test: (r: Row) => r.st.label === s })),
        ...KINDS.map((k) => ({ value: `kind:${k}`, label: k, group: "Kind", test: (r: Row) => r.e.kind === k })),
        ...campaigns.filter((c) => events.some((e) => e.campaignId === c.id)).map((c) => ({ value: `cmp:${c.id}`, label: c.name, group: "Campaign", test: (r: Row) => r.e.campaignId === c.id })),
        { value: "cmp:none", label: "No campaign", group: "Campaign", test: (r: Row) => !r.e.campaignId },
      ]}
      sorts={[
        // Nearest to today first: the next event leads Upcoming and the latest one leads Past.
        { key: "near", label: "Nearest date", by: (r) => Math.abs(daysUntil(r.e.date)) },
        { key: "date", label: "Date", by: (r) => r.e.date },
        { key: "cost", label: "Cost", by: (r) => r.e.cost, desc: true },
        { key: "name", label: "Name", by: (r) => r.e.name.toLowerCase() },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (r) => <FxDate iso={r.e.date} /> },
        { key: "campaign", label: "Campaign", width: "120px", render: (r) => r.campaign?.name ?? (r.e.campaignId ? "Deleted campaign" : DASH) },
      ]}
      primary={(r) => ({ title: r.e.name, sub: [r.e.kind, r.e.place].filter(Boolean).join(" · "), subOnDesktop: true })}
      status={(r) => ({ label: r.st.label, tone: pillTone(r.st.tone) })}
      amount={(r) => ({ value: <Amount value={r.e.cost} />, sub: r.e.status === "done" ? "Spent" : "Budget" })}
      rowVerb={(r) => (r.e.status !== "done" && r.e.date <= SF_TODAY ? { label: "Results", icon: ClipboardCheck, run: () => setMarking(r.e.id) } : null)}
      bulk={[
        {
          label: "Set campaign",
          icon: Megaphone,
          enabled: (rs) => rs.length > 0,
          choose: { options: [{ value: "none", label: "No campaign" }, ...live.map((c) => ({ value: c.id, label: c.name, hint: `${day(c.from)} – ${day(c.to)}` }))], placeholder: "Find a campaign…" },
          run: (rs, v) => {
            const to = !v || v === "none" ? null : v;
            const skipped = rs.filter((r) => r.e.campaignId === to).map((r) => `${r.e.id} is already there`);
            rs.filter((r) => r.e.campaignId !== to).forEach((r) => linkToCampaign("event", r.e.id, to, r.e.name));
            return { done: rs.length - skipped.length, skipped, verb: to ? `put in ${campaignName(to)}` : "taken out of their campaign" };
          },
        },
      ]}
      newLabel="New event"
      onNew={() => navigate(sfPath("events/new"))}
      renderNew={(ctx) => <EventSheet ctx={ctx} />}
      renderPanel={(r, ctx) => (ctx.mode === "edit" ? <EventSheet key={`edit-${r.e.id}`} ctx={ctx} event={r.e} /> : <EventPanel key={r.e.id} r={r} ctx={ctx} onMark={() => setMarking(r.e.id)} />)}
      renderExtra={({ show }) => markEvent && <ResultsDialog key={markEvent.id} event={markEvent} onClose={() => setMarking(null)} show={show} />}
    />
  );
}

// ── The event ───────────────────────────────────────────────────────────────

function EventPanel({ r, ctx, onMark }: { r: Row; ctx: PanelCtx; onMark: () => void }) {
  const navigate = useNavigate();
  const campaigns = useStore(campaignsStore);
  const { e, st, campaign } = r;
  const walkIn = e.invited === 0;
  const recorded = e.status === "done";
  const perOrder = recorded && e.orders ? e.cost / e.orders : null;
  const perHead = e.attended ? e.cost / e.attended : null;
  const campaignOptions = campaigns.filter((c) => c.id === e.campaignId || statusNow(c, SF_TODAY) !== "ended");
  const pct = (n: number) => (e.invited ? Math.round((n / e.invited) * 100) : 0);
  const edit = () => ctx.go(e.id, { do: "edit" });

  const step = recorded ? (
    <StepCard
      tone="done"
      icon={<CircleCheck size={15} />}
      title="Attendance recorded"
      sub={`${npr(e.attended ?? 0)} came, ${e.orders} orders, ${e.leads} leads.`}
      actions={
        <button type="button" className={GHOST_SM} onClick={onMark}>
          Change results
        </button>
      }
    />
  ) : e.date <= SF_TODAY ? (
    <StepCard
      tone={e.date < SF_TODAY ? "danger" : "plain"}
      icon={<ShieldAlert size={15} />}
      title="Attendance due"
      sub={e.date < SF_TODAY ? `The event was ${whenText(e.date)}.` : "The event is today."}
      actions={
        <button type="button" className={cn(BTN, "h-8")} onClick={onMark}>
          <ClipboardCheck size={13} /> Mark attended
        </button>
      }
    />
  ) : (
    <StepCard
      icon={<CalendarClock size={15} />}
      title={`Planned for ${day(e.date)}`}
      sub={`It is ${whenText(e.date)}.`}
      actions={
        <button type="button" className={GHOST_SM} onClick={onMark}>
          Mark attended
        </button>
      }
    />
  );

  return (
    <RecordShell
      ctx={ctx}
      no={e.id}
      chips={<Chip tone={chipTone(st.tone)}>{st.label}</Chip>}
      title={e.name}
      amount={<Amount value={e.cost} currency="NPR" />}
      meta={[
        <span key="k">{e.kind}</span>,
        <span key="d" className={NUM}>
          {day(e.date)} · {whenText(e.date)}
        </span>,
        e.place && <span key="p">{e.place}</span>,
        campaign && <DocLink key="c" no={campaign.id} kind="Campaign" onClick={() => navigate(sfPath(`campaigns/${campaign.id}`))} />,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} onClick={() => (close(), edit())}>
            Edit event
          </MenuItem>
          <MenuItem icon={ClipboardCheck} onClick={() => (close(), onMark())}>
            {recorded ? "Change results…" : "Mark attended…"}
          </MenuItem>
          {campaign && (
            <>
              <MenuSep />
              <MenuItem icon={Megaphone} onClick={() => (close(), navigate(sfPath(`campaigns/${campaign.id}`)))}>
                Open campaign
              </MenuItem>
            </>
          )}
        </>
      )}
      foot={<SfNoteFoot id={e.id} />}
    >
      {step}

      <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
        <Statline className="pt-3">
          {!walkIn && <Stat label="Invited" value={npr(e.invited)} />}
          {!walkIn && <Stat label="Confirmed" value={npr(e.confirmed)} meter={pct(e.confirmed)} sub={`${pct(e.confirmed)}%`} />}
          <Stat label={walkIn ? "People reached" : "Attended"} value={e.attended === null ? "—" : npr(e.attended)} meter={walkIn || e.attended === null ? undefined : pct(e.attended)} />
        </Statline>
      </div>

      <Block title="Cost and results">
        <CellGrid>
          <Cell label={recorded ? "Cost" : "Budget"}>
            <Amount value={e.cost} currency="NPR" />
          </Cell>
          <Cell label="Orders taken">{recorded ? <span className={NUM}>{e.orders}</span> : DASH}</Cell>
          <Cell label="Leads">{recorded ? <span className={NUM}>{e.leads}</span> : DASH}</Cell>
          <Cell label="Cost per order">{perOrder ? <Amount value={perOrder} currency="NPR" /> : DASH}</Cell>
          <Cell label={walkIn ? "Cost per person" : "Cost per attendee"}>{perHead ? <Amount value={perHead} currency="NPR" /> : DASH}</Cell>
        </CellGrid>
      </Block>

      <Block
        title="Details"
        right={
          <button type="button" className={GHOST_SM} onClick={edit}>
            <Pencil size={11} /> Edit
          </button>
        }
      >
        <CellGrid>
          <Cell label="Kind">{e.kind}</Cell>
          <Cell label="Date">
            <Dual iso={e.date} />
          </Cell>
          <Cell label="Place">{e.place || DASH}</Cell>
          <Cell label="Campaign">
            <Select
              trigger="plain"
              value={e.campaignId ?? "none"}
              onChange={(v) => linkToCampaign("event", e.id, v === "none" ? null : v, e.name)}
              label={campaign?.name ?? (e.campaignId ? "Deleted campaign" : "None")}
              options={[{ value: "none", label: "None" }, ...campaignOptions.map((c) => ({ value: c.id, label: c.name, hint: `${day(c.from)} – ${day(c.to)}` }))]}
              className="underline decoration-bz-line underline-offset-2 hover:decoration-bz-text"
            />
          </Cell>
        </CellGrid>
      </Block>

      <SfActivity ids={[e.id]} />
    </RecordShell>
  );
}

/** Mark attended: who came, what it really cost, the orders and leads it brought. */
function ResultsDialog({ event: e, onClose, show }: { event: SfEvent; onClose: () => void; show: Show }) {
  const [attended, setAttended] = React.useState(e.attended ?? e.confirmed);
  const [cost, setCost] = React.useState<number | null>(e.cost);
  const [orders, setOrders] = React.useState(e.orders);
  const [leads, setLeads] = React.useState(e.leads);
  const first = e.status !== "done";

  const save = () => {
    const costN = cost ?? 0;
    eventsStore.set((es) => es.map((x) => (x.id === e.id ? { ...x, status: "done", attended, cost: costN, orders, leads } : x)));
    logEvent(e.id, `${first ? "marked it attended" : "changed the results"} · ${attended} came, ${orders} orders, ${leads} leads${costN !== e.cost ? `, cost NPR ${npr(costN)}` : ""}`);
    show("success", first ? `${e.id} marked attended` : `${e.id} results saved`);
    onClose();
  };

  return (
    <Dialog
      open
      size="sm"
      title={first ? "Mark attended" : "Change results"}
      eyebrow={e.name}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label={e.invited ? "Attended" : "People reached"}>
            <NumberField value={attended} onChange={setAttended} min={0} className="h-9 w-full" ariaLabel={e.invited ? "Attended" : "People reached"} />
          </Field>
          <Field label="Cost">
            <MoneyInput value={cost} onChange={setCost} blank ariaLabel="Cost" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Orders taken">
            <NumberField value={orders} onChange={setOrders} min={0} className="h-9 w-full" ariaLabel="Orders taken" />
          </Field>
          <Field label="Leads">
            <NumberField value={leads} onChange={setLeads} min={0} className="h-9 w-full" ariaLabel="Leads" />
          </Field>
        </div>
      </div>
    </Dialog>
  );
}

// ── New event / edit ────────────────────────────────────────────────────────

function EventSheet({ ctx, event }: { ctx: PanelCtx; event?: SfEvent }) {
  const [search] = useSearchParams();
  const campaigns = useStore(campaignsStore);
  const [name, setName] = React.useState(event?.name ?? "");
  const [kind, setKind] = React.useState<SfEvent["kind"]>(event?.kind ?? "Retailer meet");
  const [date, setDate] = React.useState(event?.date ?? addDays(SF_TODAY, 14));
  const [place, setPlace] = React.useState(event?.place ?? "");
  const [invited, setInvited] = React.useState(event?.invited ?? 0);
  const [cost, setCost] = React.useState<number | null>(event ? event.cost : null);
  // A campaign's "New event" arrives with ?campaign=<id>.
  const [campaignId, setCampaignId] = React.useState(() => {
    const cid = event ? event.campaignId : search.get("campaign");
    return cid && campaignsStore.get().some((c) => c.id === cid) ? cid : "none";
  });
  const [preset] = React.useState(campaignId !== "none");
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);

  const close = () => ctx.go(event ? event.id : null);
  const commit = () => {
    setTried(true);
    if (!name.trim()) return setRefusal("Enter a name.");
    if (!date) return setRefusal("Pick a date.");
    if (!place.trim()) return setRefusal("Enter a place.");
    const cid = campaignId === "none" ? null : campaignId;
    const fields = { name: name.trim(), kind, date, place: place.trim(), invited, cost: cost ?? 0 };
    if (event) {
      eventsStore.set((es) => es.map((x) => (x.id === event.id ? { ...x, ...fields } : x)));
      const changed = [
        event.name !== fields.name && "name",
        event.kind !== fields.kind && "kind",
        event.date !== fields.date && `date to ${day(fields.date)}`,
        event.place !== fields.place && "place",
        event.invited !== fields.invited && `invitations to ${fields.invited}`,
        event.cost !== fields.cost && `${event.status === "done" ? "cost" : "budget"} to NPR ${npr(fields.cost)}`,
      ].filter(Boolean);
      if (changed.length) logEvent(event.id, `changed the ${changed.join(", ")}`);
      if (cid !== event.campaignId) linkToCampaign("event", event.id, cid, fields.name);
      ctx.show("success", `${event.id} saved`);
      ctx.go(event.id);
      return;
    }
    const id = nextId("EV-", eventsStore.get().map((x) => x.id));
    eventsStore.set((es) => [...es, { id, ...fields, status: "planned", confirmed: 0, attended: null, orders: 0, leads: 0, campaignId: null }]);
    logEvent(id, `created the event for ${day(date)}${fields.invited ? ` with ${fields.invited} invitations` : ""}`);
    if (cid) linkToCampaign("event", id, cid, fields.name);
    ctx.show("success", `${id} added`);
    ctx.go(id);
  };

  const options = campaigns.filter((c) => c.id === campaignId || statusNow(c, SF_TODAY) !== "ended");
  return (
    <RecordShell ctx={ctx} no="" back={{ label: event ? event.id : "Events", onClick: close }} title={event ? `Edit ${event.id}` : "New event"}>
      <div className="flex h-full min-h-0 flex-col">
        <SheetFrame
          onCommit={commit}
          refusal={refusal}
          onDismissRefusal={() => setRefusal(null)}
          foot={
            <>
              <button type="button" className={cn(GHOST, "ml-auto")} onClick={close}>
                Cancel
              </button>
              <button type="button" className={BTN} onClick={commit}>
                {event ? "Save" : "Add event"}
              </button>
            </>
          }
        >
          <div className="grid max-w-[720px] grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
            <Field label="Name" required className="sm:col-span-2">
              <input autoFocus value={name} onChange={(ev) => setName(ev.target.value)} className={cn(INPUT, tried && !name.trim() && "border-bz-red-mark")} />
            </Field>
            <Field label="Date" required>
              <input type="date" value={date} onChange={(ev) => setDate(ev.target.value)} className={cn(INPUT, NUM, tried && !date && "border-bz-red-mark")} />
            </Field>
            <Field label="Kind">
              <Picker value={kind} onChange={(v) => setKind(v as SfEvent["kind"])} placeholder="Pick a kind" ariaLabel="Kind" options={KINDS.map((k) => ({ value: k, label: k }))} />
            </Field>
            <Field label="Place" required className="sm:col-span-2">
              <input value={place} onChange={(ev) => setPlace(ev.target.value)} placeholder="Venue, town" className={cn(INPUT, tried && !place.trim() && "border-bz-red-mark")} />
            </Field>
          </div>
          <div className="max-w-[720px] px-5 pb-5">
            <More defaultOpen={!!event || preset}>
              <Pair>
                <Field label={event?.status === "done" ? "Cost" : "Budget"}>
                  <MoneyInput value={cost} onChange={setCost} blank ariaLabel={event?.status === "done" ? "Cost" : "Budget"} />
                </Field>
                <Field label="Invitations">
                  <IntInput value={invited} onChange={setInvited} ariaLabel="Invitations" />
                </Field>
              </Pair>
              <Field label="Campaign">
                <Picker
                  value={campaignId}
                  onChange={setCampaignId}
                  placeholder="No campaign"
                  ariaLabel="Campaign"
                  options={[{ value: "none", label: "No campaign" }, ...options.map((c) => ({ value: c.id, label: c.name, hint: `${day(c.from)} – ${day(c.to)}` }))]}
                />
              </Field>
            </More>
          </div>
        </SheetFrame>
      </div>
    </RecordShell>
  );
}

export const EVENTS_ROUTES = [
  { path: "design/salesforce/events", Component: EventsPage },
  { path: "design/salesforce/events/:no", Component: EventsPage },
];
