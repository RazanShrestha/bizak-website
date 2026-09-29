import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Dialog, Field, GHOST, INPUT, NUM, NumberField, Select, ToastHost, useToast } from "../sales/bzw";
import type { ToastMsg } from "../sales/bzw";
import { useStore } from "../sales/store";
import type { HistoryEvent } from "../sales/orders";
import { EVENTS, SF_TODAY } from "./data";
import type { SfEvent } from "./data";
import { day, daysUntil, npr } from "./engine";
import { campaignsStore, eventsStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, EmptyNote, Fact, Figures, List, Money, Page, PageIntro, Row, Section, SidePanel } from "./ui";
import { EVENT_LABEL, ME_ID, RecordActivity, RecordNoteFoot, addDays, logChange, stamp } from "./activationKit";

// ════════════════════════════════════════════════════════════════════════════
// EVENTS — retailer meets, launches, sampling, dealer conferences
//
// The existing MAST_EVENT_SETUP + EVENT_ATTENDEE, extended with cost, a
// campaign and what the event brought in (research/C §6). The page answers two
// questions: what is coming up, and was the last one worth its cost.
// ════════════════════════════════════════════════════════════════════════════

type Show = (kind: ToastMsg["kind"], text: string, action?: ToastMsg["action"]) => void;
const KINDS: SfEvent["kind"][] = ["Retailer meet", "Launch", "Sampling", "Dealer conference"];

const isPast = (e: SfEvent) => e.status === "done" || e.date < SF_TODAY;
/** Past, or today, and nobody has recorded who came. */
const needsAttendance = (e: SfEvent) => e.date <= SF_TODAY && e.attended === null;
const statusOf = (e: SfEvent): { tone: "good" | "info" | "warn" | "off"; label: string } =>
  needsAttendance(e) ? { tone: "warn", label: "Attendance due" } : e.status === "done" ? { tone: "off", label: EVENT_LABEL.done } : e.status === "live" ? { tone: "good", label: EVENT_LABEL.live } : { tone: "info", label: EVENT_LABEL.planned };
const whenText = (iso: string) => {
  const n = daysUntil(iso);
  return n === 0 ? "today" : n === 1 ? "tomorrow" : n > 1 ? `in ${n} days` : n === -1 ? "yesterday" : `${-n} days ago`;
};

export function EventsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const events = useStore(eventsStore);
  const { toast, show, dismiss } = useToast();
  const [creating, setCreating] = React.useState(false);

  const upcoming = events.filter((e) => !isPast(e)).sort((a, b) => a.date.localeCompare(b.date));
  const past = events.filter(isPast).sort((a, b) => b.date.localeCompare(a.date));
  const next = upcoming[0];
  const done = events.filter((e) => e.status === "done");
  const open = id ? events.find((e) => e.id === id) : undefined;
  const close = React.useCallback(() => navigate(sfPath("events")), [navigate]);

  const rows = (list: SfEvent[]) => (
    <List>
      {list.map((e) => {
        const st = statusOf(e);
        return (
          <Row
            key={e.id}
            active={e.id === id}
            onClick={() => navigate(sfPath(`events/${e.id}`))}
            title={e.name}
            sub={
              <>
                {e.kind} · {e.place}
                <span className={open ? undefined : "md:hidden"}>
                  {" · "}
                  {day(e.date)}
                </span>
              </>
            }
            meta={open ? [] : [
              <span key="d" className={cn("inline-block w-[150px]", NUM)}>
                {day(e.date)} <span className="text-bz-text-soft">· {whenText(e.date)}</span>
              </span>,
            ]}
            trail={
              <span className="inline-block w-[112px] text-left">
                <Dot tone={st.tone}>{st.label}</Dot>
              </span>
            }
          />
        );
      })}
    </List>
  );

  return (
    <SfShell page="events" panel={open ? <EventPanel event={open} onClose={close} show={show} /> : null}>
      <Page width="full" className="max-w-[1160px]">
        <PageIntro
          actions={
            <button type="button" className={BTN} onClick={() => setCreating(true)}>
              <Plus size={13} /> New event
            </button>
          }
        >
          Retailer meets, launches and sampling — who came, and what it brought in.
        </PageIntro>

        <Figures
          items={[
            { label: "Next event", value: next ? day(next.date) : "—", sub: next ? next.name : "Nothing planned", onClick: next ? () => navigate(sfPath(`events/${next.id}`)) : undefined },
            { label: "Confirmed", value: upcoming.reduce((s, e) => s + e.confirmed, 0), sub: `of ${npr(upcoming.reduce((s, e) => s + e.invited, 0))} invited, coming up` },
            { label: "Spent on past events", value: <Money value={done.reduce((s, e) => s + e.cost, 0)} /> },
            { label: "Orders taken", value: done.reduce((s, e) => s + e.orders, 0), sub: `${done.reduce((s, e) => s + e.leads, 0)} leads` },
          ]}
        />

        <Section title="Upcoming" count={upcoming.length} className="mt-12">
          {upcoming.length ? (
            rows(upcoming)
          ) : (
            <EmptyNote
              action={
                <button type="button" className={GHOST} onClick={() => setCreating(true)}>
                  New event
                </button>
              }
            >
              Nothing planned.
            </EmptyNote>
          )}
        </Section>

        <Section title="Past" count={past.length}>
          {past.length ? rows(past) : <EmptyNote>No past events yet.</EmptyNote>}
        </Section>
      </Page>
      <NewEventDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(eid) => {
          show("success", "Event added.");
          navigate(sfPath(`events/${eid}`));
        }}
      />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SfShell>
  );
}

// ── The event ───────────────────────────────────────────────────────────────

function EventPanel({ event: e, onClose, show }: { event: SfEvent; onClose: () => void; show: Show }) {
  const campaigns = useStore(campaignsStore);
  const [marking, setMarking] = React.useState(false);
  const campaign = campaigns.find((c) => c.id === e.campaignId);
  const st = statusOf(e);
  const walkIn = e.invited === 0;
  const perOrder = e.orders ? e.cost / e.orders : null;
  const perHead = e.attended ? e.cost / e.attended : null;

  const steps = walkIn
    ? [{ label: "People reached", n: e.attended }]
    : [
        { label: "Invited", n: e.invited as number | null },
        { label: "Confirmed", n: e.confirmed as number | null },
        { label: "Attended", n: e.attended },
      ];
  const top = Math.max(1, ...steps.map((s) => s.n ?? 0));

  return (
    <SidePanel
      open
      onClose={onClose}
      width={560}
      eyebrow={`Event · ${e.id} · ${e.kind}`}
      title={e.name}
      meta={
        <>
          <Dot tone={st.tone}>{st.label}</Dot>
          <span className={NUM}>
            {day(e.date)} · {whenText(e.date)}
          </span>
          <span className="truncate">{e.place}</span>
        </>
      }
      foot={
        <div className="-mx-6 -my-3 [&>div]:border-t-0">
          <RecordNoteFoot subject={`event:${e.id}`} />
        </div>
      }
    >
      {needsAttendance(e) && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button type="button" className={BTN} onClick={() => setMarking(true)}>
            Mark attended
          </button>
          <span className="text-[11px] text-bz-text-soft">Record who came, orders taken and leads.</span>
        </div>
      )}

      <Section title={walkIn ? "Reach" : "Invitations"} className="mt-6" hint={walkIn ? "walk-in event, no invitations" : undefined}>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {steps.map((s) => (
            <li key={s.label} className="grid grid-cols-[88px_minmax(0,1fr)_48px] items-center gap-3">
              <span className="text-[11.5px] text-bz-text-muted">{s.label}</span>
              <span className="block h-2 overflow-hidden rounded-bz-pill bg-bz-line-soft">
                {s.n !== null && <span className="block h-full rounded-bz-pill bg-bz-text-soft" style={{ width: `${(s.n / top) * 100}%` }} />}
              </span>
              <span className={cn("text-right text-[12px] font-medium text-bz-text", NUM)}>{s.n === null ? "—" : npr(s.n)}</span>
            </li>
          ))}
        </ul>
        {!walkIn && e.attended === null && e.invited > 0 && (
          <p className={cn("m-0 mt-3 text-[11px] text-bz-text-soft", NUM)}>{Math.round((e.confirmed / e.invited) * 100)}% have confirmed so far.</p>
        )}
      </Section>

      <Section title="Cost and return">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Fact label="Cost">
            <Money value={e.cost} />
          </Fact>
          <Fact label="Orders taken">
            <span className={NUM}>{e.status === "done" ? e.orders : "—"}</span>
          </Fact>
          <Fact label="Leads">
            <span className={NUM}>{e.status === "done" ? e.leads : "—"}</span>
          </Fact>
          <Fact label="Cost per order">{perOrder ? <Money value={perOrder} /> : <span className="text-bz-text-soft">—</span>}</Fact>
          <Fact label={walkIn ? "Cost per person" : "Cost per attendee"}>{perHead ? <Money value={perHead} /> : <span className="text-bz-text-soft">—</span>}</Fact>
          <Fact label="Campaign">
            {campaign ? (
              <Link to={sfPath(`campaigns/${campaign.id}`)} className="underline decoration-bz-line underline-offset-2 hover:decoration-bz-text">
                {campaign.name}
              </Link>
            ) : (
              <span className="text-bz-text-soft">None</span>
            )}
          </Fact>
        </div>
      </Section>

      <div className="-mx-6 mt-8 border-t border-bz-line-soft px-1">
        <RecordActivity subject={`event:${e.id}`} seed={seedHistory(e.id)} />
      </div>

      <MarkAttendedDialog open={marking} event={e} onClose={() => setMarking(false)} show={show} />
    </SidePanel>
  );
}

function MarkAttendedDialog({ open, event: e, onClose, show }: { open: boolean; event: SfEvent; onClose: () => void; show: Show }) {
  const [attended, setAttended] = React.useState(0);
  const [orders, setOrders] = React.useState(0);
  const [leads, setLeads] = React.useState(0);
  React.useEffect(() => {
    if (!open) return;
    setAttended(e.confirmed);
    setOrders(0);
    setLeads(0);
  }, [open, e.confirmed]);

  const save = () => {
    eventsStore.set((es) => es.map((x) => (x.id === e.id ? { ...x, status: "done", attended, orders, leads } : x)));
    logChange(`event:${e.id}`, `recorded ${attended} attended · ${orders} orders, ${leads} leads`);
    show("success", "Attendance saved.");
    onClose();
  };

  return (
    <Dialog
      open={open}
      size="sm"
      title="Mark attended"
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
      <div className="flex flex-col gap-4">
        <Field label={e.invited ? "Attended" : "People reached"} hint={e.invited ? `${e.confirmed} confirmed of ${e.invited} invited.` : undefined}>
          <NumberField value={attended} onChange={setAttended} min={0} max={e.invited || undefined} className="w-32" ariaLabel="Attended" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Orders taken">
            <NumberField value={orders} onChange={setOrders} min={0} className="w-full" ariaLabel="Orders taken" />
          </Field>
          <Field label="Leads">
            <NumberField value={leads} onChange={setLeads} min={0} className="w-full" ariaLabel="Leads" />
          </Field>
        </div>
      </div>
    </Dialog>
  );
}

// ── New event ───────────────────────────────────────────────────────────────

function NewEventDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const campaigns = useStore(campaignsStore);
  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState<SfEvent["kind"]>("Retailer meet");
  const [date, setDate] = React.useState(addDays(SF_TODAY, 14));
  const [place, setPlace] = React.useState("");
  const [invited, setInvited] = React.useState(0);
  const [cost, setCost] = React.useState("");
  const [campaignId, setCampaignId] = React.useState<string>("none");
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setKind("Retailer meet");
    setDate(addDays(SF_TODAY, 14));
    setPlace("");
    setInvited(0);
    setCost("");
    setCampaignId("none");
    setTried(false);
  }, [open]);

  const missing = !name.trim() || !date || !place.trim();
  const create = () => {
    setTried(true);
    if (missing) return;
    const taken = new Set(eventsStore.get().map((x) => x.id));
    let n = 45;
    while (taken.has(`EV-${n}`)) n++;
    const id = `EV-${n}`;
    const cid = campaignId === "none" ? null : campaignId;
    const ev: SfEvent = { id, name: name.trim(), kind, date, place: place.trim(), status: "planned", invited, confirmed: 0, attended: null, cost: Number(cost.replace(/[^\d]/g, "")) || 0, orders: 0, leads: 0, campaignId: cid };
    eventsStore.set((es) => [...es, ev]);
    if (cid) campaignsStore.set((cs) => cs.map((c) => (c.id === cid ? { ...c, eventIds: [...c.eventIds, id] } : c)));
    logChange(`event:${id}`, "created the event");
    if (cid) logChange(`campaign:${cid}`, `added the event ${ev.name}`);
    onClose();
    onCreated(id);
  };

  const live = campaigns.filter((c) => c.status !== "ended");
  return (
    <Dialog
      open={open}
      title="New event"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={create}>
            Add event
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Name" required>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Butwal retailer meet" className={INPUT} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kind">
            <Select trigger="ghost" className="h-9 w-full justify-between" value={kind} onChange={(v) => setKind(v as SfEvent["kind"])} label={kind} options={KINDS.map((k) => ({ value: k, label: k }))} />
          </Field>
          <Field label="Date" required>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} />
          </Field>
        </div>
        <Field label="Place" required>
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Venue, town" className={INPUT} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Invitations" hint="0 for a walk-in event.">
            <NumberField value={invited} onChange={setInvited} min={0} className="w-full" ariaLabel="Invitations" />
          </Field>
          <Field label="Budget (NPR)">
            <input inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="50,000" className={cn(INPUT, NUM)} />
          </Field>
        </div>
        <Field label="Campaign">
          <Select
            trigger="ghost"
            className="h-9 w-full justify-between"
            value={campaignId}
            onChange={setCampaignId}
            label={campaignId === "none" ? "None" : live.find((c) => c.id === campaignId)?.name ?? campaignId}
            options={[{ value: "none", label: "None" }, ...live.map((c) => ({ value: c.id, label: c.name, hint: `${day(c.from)} – ${day(c.to)}` }))]}
          />
        </Field>
        {tried && missing && <p className="m-0 text-[11.5px] text-bz-red">Add a name, a date and a place.</p>}
      </div>
    </Dialog>
  );
}

/** The past of a seeded event, from its SEED state (a change made here writes its own line). */
function seedHistory(id: string): HistoryEvent[] {
  const e = EVENTS.find((x) => x.id === id);
  if (!e) return [];
  return [
    { id: `${id}-h1`, whoId: ME_ID, when: stamp(addDays(e.date, -30), "11:00"), what: "created the event" },
    ...(e.invited ? [{ id: `${id}-h2`, whoId: ME_ID, when: stamp(addDays(e.date, -21), "15:30"), what: `sent ${e.invited} invitations` }] : []),
    ...(e.status === "done" && e.attended !== null ? [{ id: `${id}-h3`, whoId: "EMP-321", when: stamp(e.date, "20:10"), what: `recorded ${e.attended} attended · ${e.orders} orders, ${e.leads} leads` }] : []),
  ];
}

export const EVENTS_ROUTES = [
  { path: "design/salesforce/events", Component: EventsPage },
  { path: "design/salesforce/events/:id", Component: EventsPage },
];
