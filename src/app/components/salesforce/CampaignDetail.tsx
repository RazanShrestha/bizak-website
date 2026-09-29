import * as React from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, MenuItem, NUM, Popover, ToastHost, useToast } from "../sales/bzw";
import { useStore } from "../sales/store";
import { CAMPAIGNS, CUSTOMER_TYPES, SF_TODAY } from "./data";
import type { BrandingJob, Campaign, Scheme, SfEvent } from "./data";
import { day, npr } from "./engine";
import { brandingStore, campaignsStore, customersStore, eventsStore, schemesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, EmptyNote, Figures, List, Money, Page, PageIntro, Progress, Row, Section, TypeMark } from "./ui";
import {
  CAMPAIGN_LABEL,
  CAMPAIGN_TONE,
  EVENT_LABEL,
  KIND_WORD,
  SCHEME_LABEL,
  SCHEME_TONE,
  STAGE_LABEL,
  STAGE_TONE,
  RecordActivity,
  RecordNoteFoot,
  addDays,
  campaignBrandStore,
  campaignName,
  customerName,
  daysBetween,
  inTerritories,
  linkToCampaign,
  posmStore,
  schemeSpend,
  schemeText,
  seasonOf,
  stamp,
  territoryName,
} from "./activationKit";
import type { LinkKind } from "./activationKit";

// ════════════════════════════════════════════════════════════════════════════
// A CAMPAIGN — the container, as a page
//
// Its goal and spend on one line, then what it holds (schemes, branding jobs,
// events, field work), who it is for, where the money went, and its days.
// Spend rolls up from the children (research/C §4.3): a scheme's utilisation,
// the POSM cost of approved jobs, the cost of its events.
// ════════════════════════════════════════════════════════════════════════════

type Bucket = { key: LinkKind; label: string; spent: number; committed: number };

export function campaignSpend(c: Campaign, schemes: Scheme[], branding: BrandingJob[], events: SfEvent[]) {
  const posm = posmStore.get();
  const jobCost = (b: BrandingJob) => (posm.find((p) => p.id === b.posmId)?.cost ?? 0) * b.qty;
  const mySchemes = schemes.filter((s) => s.campaignId === c.id);
  const myJobs = branding.filter((b) => b.campaignId === c.id);
  const myEvents = events.filter((e) => e.campaignId === c.id);
  const buckets: Bucket[] = [
    { key: "scheme", label: "Schemes", spent: mySchemes.reduce((s, x) => s + schemeSpend(x), 0), committed: 0 },
    {
      key: "branding",
      label: "Branding",
      spent: myJobs.filter((b) => b.stage === "installing" || b.stage === "installed").reduce((s, b) => s + jobCost(b), 0),
      committed: myJobs.filter((b) => b.stage === "approved").reduce((s, b) => s + jobCost(b), 0),
    },
    {
      key: "event",
      label: "Events",
      spent: myEvents.filter((e) => e.status === "done").reduce((s, e) => s + e.cost, 0),
      committed: myEvents.filter((e) => e.status !== "done").reduce((s, e) => s + e.cost, 0),
    },
  ];
  return { buckets, spent: buckets.reduce((s, b) => s + b.spent, 0), committed: buckets.reduce((s, b) => s + b.committed, 0) };
}

const SEEDED = new Set(CAMPAIGNS.map((c) => c.id));

export function CampaignDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const campaigns = useStore(campaignsStore);
  const schemes = useStore(schemesStore);
  const branding = useStore(brandingStore);
  const events = useStore(eventsStore);
  const customers = useStore(customersStore);
  const posm = useStore(posmStore);
  const brands = useStore(campaignBrandStore);
  const { toast, show, dismiss } = useToast();
  const [menuAt, setMenuAt] = React.useState<HTMLElement | null>(null);
  const [picker, setPicker] = React.useState<{ kind: LinkKind; at: HTMLElement } | null>(null);

  const c = campaigns.find((x) => x.id === id);
  if (!c) {
    return (
      <SfShell page="campaigns">
        <Page>
          <EmptyNote
            action={
              <Link to={sfPath("campaigns")} className="text-[12px] font-medium text-bz-text underline underline-offset-2">
                All campaigns
              </Link>
            }
          >
            This campaign doesn't exist or was removed.
          </EmptyNote>
        </Page>
      </SfShell>
    );
  }

  const mySchemes = schemes.filter((s) => s.campaignId === c.id);
  const myJobs = branding.filter((b) => b.campaignId === c.id);
  const myEvents = events.filter((e) => e.campaignId === c.id).sort((a, b) => a.date.localeCompare(b.date));
  const money = campaignSpend(c, schemes, branding, events);
  const left = c.budget - money.spent - money.committed;
  const total = daysBetween(c.from, c.to) + 1;
  const dayNo = daysBetween(c.from, SF_TODAY) + 1;
  const matching = customers.filter((x) => (!c.audience.typeIds.length || c.audience.typeIds.includes(x.typeId)) && inTerritories(x.territoryId, c.audience.territoryIds));

  const attach = (kind: LinkKind, itemId: string, label: string) => {
    const list: { id: string; campaignId: string | null }[] = kind === "scheme" ? schemesStore.get() : kind === "branding" ? brandingStore.get() : eventsStore.get();
    const before = list.find((x) => x.id === itemId)?.campaignId ?? null;
    linkToCampaign(kind, itemId, c.id, label);
    setPicker(null);
    show("success", `Added ${label} to this campaign.`, { label: "Undo", run: () => linkToCampaign(kind, itemId, before, label) });
  };
  const detach = (kind: LinkKind, itemId: string, label: string) => {
    linkToCampaign(kind, itemId, null, label);
    show("info", `Took ${label} out of this campaign.`, { label: "Undo", run: () => linkToCampaign(kind, itemId, c.id, label) });
  };
  const addLink = (kind: LinkKind) => (
    <button type="button" onClick={(e) => setPicker({ kind, at: e.currentTarget })} className="inline-flex items-center gap-1 text-[11.5px] text-bz-text-soft hover:text-bz-text">
      <Plus size={12} /> Add
    </button>
  );
  const removeVerb = (kind: LinkKind, itemId: string, label: string) => (
    <button type="button" onClick={() => detach(kind, itemId, label)} className="h-7 rounded-bz-md px-2 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
      Remove
    </button>
  );

  const seed = SEEDED.has(c.id)
    ? [
        { id: `${c.id}-h1`, whoId: c.owner, when: stamp(addDays(c.from, -21), "11:30"), what: "created the campaign" },
        { id: `${c.id}-h2`, whoId: "EMP-118", when: stamp(addDays(c.from, -14), "15:05"), what: `approved the budget of NPR ${npr(c.budget)}` },
        ...(c.status === "live" || c.status === "ended" ? [{ id: `${c.id}-h3`, whoId: c.owner, when: stamp(c.from, "08:00"), what: "started the campaign" }] : []),
        ...(c.status === "ended" ? [{ id: `${c.id}-h4`, whoId: c.owner, when: stamp(c.to, "18:00"), what: "closed the campaign" }] : []),
      ]
    : [];

  return (
    <SfShell page="campaigns" title={c.name}>
      <Page>
        <Link to={sfPath("campaigns")} className="mb-4 inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-soft hover:text-bz-text">
          <ArrowLeft size={12} /> Campaigns
        </Link>
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-bz-text-muted">
          <Dot tone={CAMPAIGN_TONE[c.status]}>{CAMPAIGN_LABEL[c.status]}</Dot>
          <span className={NUM}>
            {day(c.from)} – {day(c.to)}
          </span>
          {brands[c.id] && <span>{brands[c.id]}</span>}
          <span>{seasonOf(c.from)}</span>
          <span className="text-bz-text-soft">{c.id}</span>
        </div>
        <PageIntro
          actions={
            <button type="button" className={BTN} onClick={(e) => setMenuAt(e.currentTarget)}>
              <Plus size={13} /> Add to this campaign
            </button>
          }
        >
          {c.objective || "No goal written yet."}
        </PageIntro>
        <Popover open={!!menuAt} anchor={menuAt} onClose={() => setMenuAt(null)} align="right" width={220}>
          {(
            [
              ["scheme", "A scheme", "Its budget joins this campaign's spend"],
              ["branding", "A branding job", "Sign boards, standees, coolers"],
              ["event", "An event", "A meet, launch or sampling day"],
            ] as const
          ).map(([kind, label, hint]) => (
            <MenuItem
              key={kind}
              hint={hint}
              onClick={() => {
                const at = menuAt!;
                setMenuAt(null);
                setPicker({ kind, at });
              }}
            >
              {label}
            </MenuItem>
          ))}
        </Popover>
        {picker && <AttachPicker kind={picker.kind} anchor={picker.at} campaign={c} onClose={() => setPicker(null)} onPick={attach} />}

        <Figures
          items={[
            ...c.kpi.map((k) => ({
              label: k.label,
              value: (
                <>
                  {npr(k.actual)} <span className="text-[11.5px] font-normal text-bz-text-soft">/ {npr(k.target)}</span>
                </>
              ),
              sub: `${k.unit} · ${Math.round((k.actual / Math.max(1, k.target)) * 100)}% of target`,
            })),
            {
              label: "Spent",
              value: <Money value={money.spent} />,
              sub: `of NPR ${npr(c.budget)} · ${Math.round((money.spent / Math.max(1, c.budget)) * 100)}%`,
              tone: money.spent > c.budget ? ("danger" as const) : undefined,
            },
          ]}
        />

        <Section title="Days" className="mt-12" hint={dayNo < 1 ? `starts in ${1 - dayNo} days` : dayNo > total ? `ran ${total} days` : `day ${dayNo} of ${total}`}>
          <Timeline c={c} schemes={mySchemes} events={myEvents} jobs={myJobs} />
        </Section>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <Section title="Schemes" count={mySchemes.length} action={addLink("scheme")}>
              {mySchemes.length === 0 ? (
                <EmptyNote>No schemes in this campaign.</EmptyNote>
              ) : (
                <List>
                  {mySchemes.map((s) => (
                    <Row
                      key={s.id}
                      onClick={() => navigate(`/design/salesforce/schemes/${s.id}`)}
                      title={s.name}
                      sub={schemeText(s)}
                      meta={[
                        s.budget ? (
                          <span key="b" className="inline-block w-[110px]">
                            <Progress pct={(s.budget.used / s.budget.total) * 100} tone={s.budget.used / s.budget.total > 0.85 ? "warn" : "good"} />
                            <span className={cn("mt-1 block text-[11px] text-bz-text-soft", NUM)}>{Math.round((s.budget.used / s.budget.total) * 100)}% of budget</span>
                          </span>
                        ) : (
                          <span key="b" className="inline-block w-[110px] text-bz-text-soft">
                            No budget cap
                          </span>
                        ),
                      ]}
                      trail={<Dot tone={SCHEME_TONE[s.status]}>{SCHEME_LABEL[s.status]}</Dot>}
                      action={removeVerb("scheme", s.id, s.name)}
                    />
                  ))}
                </List>
              )}
            </Section>

            <Section title="Branding jobs" count={myJobs.length} action={addLink("branding")}>
              {myJobs.length === 0 ? (
                <EmptyNote>No branding jobs in this campaign.</EmptyNote>
              ) : (
                <List>
                  {myJobs.map((b) => {
                    const p = posm.find((x) => x.id === b.posmId);
                    return (
                      <Row
                        key={b.id}
                        onClick={() => navigate(sfPath(`branding/${b.id}`))}
                        title={customerName(b.customerId)}
                        sub={`${p?.name ?? b.posmId} × ${b.qty}`}
                        meta={[<Money key="m" value={(p?.cost ?? 0) * b.qty} className="text-bz-text-muted" />]}
                        trail={<Dot tone={STAGE_TONE[b.stage]}>{STAGE_LABEL[b.stage]}</Dot>}
                        action={removeVerb("branding", b.id, b.id)}
                      />
                    );
                  })}
                </List>
              )}
            </Section>

            <Section title="Events" count={myEvents.length} action={addLink("event")}>
              {myEvents.length === 0 ? (
                <EmptyNote>No events in this campaign.</EmptyNote>
              ) : (
                <List>
                  {myEvents.map((e) => (
                    <Row
                      key={e.id}
                      onClick={() => navigate(sfPath(`events/${e.id}`))}
                      title={e.name}
                      sub={`${e.kind} · ${e.place}`}
                      meta={[<span key="d" className={NUM}>{day(e.date)}</span>]}
                      trail={<Dot tone={e.status === "done" ? "off" : "info"}>{EVENT_LABEL[e.status]}</Dot>}
                      action={removeVerb("event", e.id, e.name)}
                    />
                  ))}
                </List>
              )}
            </Section>

            {c.tasks.length > 0 && (
              <Section title="Field work" count={c.tasks.length} hint="added to reps' visits while the campaign runs">
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {c.tasks.map((t) => (
                    <li key={t.title}>
                      <div className="mb-1.5 flex items-baseline gap-2 text-[12px]">
                        <span className="min-w-0 flex-1 truncate text-bz-text">{t.title}</span>
                        <span className="text-[11px] text-bz-text-soft">{t.activity}</span>
                        <span className={cn("shrink-0 text-bz-text-muted", NUM)}>
                          {npr(t.done)} / {npr(t.total)}
                        </span>
                      </div>
                      <Progress pct={(t.done / Math.max(1, t.total)) * 100} />
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          <div>
            <Section title="Spend vs budget" hint={`NPR ${npr(c.budget)}`}>
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {money.buckets.map((b) => (
                  <li key={b.key}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[12px]">
                      <span className="text-bz-text">{b.label}</span>
                      <span className={cn("text-bz-text-muted", NUM)}>
                        <Money value={b.spent} code={false} />
                        {b.committed > 0 && <span className="text-bz-text-soft"> + {npr(b.committed)} committed</span>}
                      </span>
                    </div>
                    <Progress pct={(b.spent / Math.max(1, c.budget)) * 100} />
                  </li>
                ))}
              </ul>
              <p className={cn("m-0 mt-5 text-[11.5px]", left < 0 ? "text-bz-red" : "text-bz-text-soft", NUM)}>
                {left < 0 ? `Over budget by NPR ${npr(-left)} once committed costs land.` : `NPR ${npr(left)} left after committed costs.`}
              </p>
            </Section>

            <Section title="Who it is for" hint={c.audience.outlets ? `${npr(c.audience.outlets)} outlets` : undefined}>
              {c.audience.typeIds.length === 0 && c.audience.territoryIds.length === 0 ? (
                <p className="m-0 text-[12px] text-bz-text-soft">Every customer. Narrow it by type or territory when the schemes need it.</p>
              ) : (
                <>
                  <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Customer types</p>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {(c.audience.typeIds.length ? c.audience.typeIds : CUSTOMER_TYPES.map((t) => t.id)).map((tid) => {
                      const t = CUSTOMER_TYPES.find((x) => x.id === tid);
                      if (!t) return null;
                      return (
                        <li key={tid} className="flex items-center justify-between gap-2">
                          <TypeMark name={t.plural} color={t.color} />
                          <span className={cn("text-[11.5px] text-bz-text-soft", NUM)}>{matching.filter((x) => x.typeId === tid).length}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="m-0 mb-2 mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Territories</p>
                  <p className="m-0 text-[12px] text-bz-text">{c.audience.territoryIds.length ? c.audience.territoryIds.map(territoryName).join(", ") : "All territories"}</p>
                  <p className="m-0 mt-4 text-[11px] text-bz-text-soft">{matching.length} customers on file match.</p>
                </>
              )}
            </Section>
          </div>
        </div>

        <div className="mt-14 overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          <RecordActivity subject={`campaign:${c.id}`} seed={seed} />
          <RecordNoteFoot subject={`campaign:${c.id}`} />
        </div>
      </Page>
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SfShell>
  );
}

// ── Picker: attach an existing item ─────────────────────────────────────────

function AttachPicker({ kind, anchor, campaign, onClose, onPick }: { kind: LinkKind; anchor: HTMLElement; campaign: Campaign; onClose: () => void; onPick: (kind: LinkKind, id: string, label: string) => void }) {
  const schemes = useStore(schemesStore);
  const branding = useStore(brandingStore);
  const events = useStore(eventsStore);
  const posm = useStore(posmStore);
  const [q, setQ] = React.useState("");
  const elsewhere = (cid: string | null) => (cid ? `in ${campaignName(cid)}` : null);
  const options: { id: string; label: string; hint: string }[] =
    kind === "scheme"
      ? schemes
          .filter((s) => s.campaignId !== campaign.id && s.status !== "ended")
          .map((s) => ({ id: s.id, label: s.name, hint: [schemeText(s), elsewhere(s.campaignId)].filter(Boolean).join(" · ") }))
      : kind === "branding"
        ? branding
            .filter((b) => b.campaignId !== campaign.id && b.stage !== "rejected")
            .map((b) => ({ id: b.id, label: customerName(b.customerId), hint: [`${posm.find((p) => p.id === b.posmId)?.name ?? b.posmId} × ${b.qty}`, STAGE_LABEL[b.stage], elsewhere(b.campaignId)].filter(Boolean).join(" · ") }))
        : events
            .filter((e) => e.campaignId !== campaign.id)
            .map((e) => ({ id: e.id, label: e.name, hint: [day(e.date), e.place, elsewhere(e.campaignId)].filter(Boolean).join(" · ") }));
  const shown = q ? options.filter((o) => `${o.label} ${o.hint}`.toLowerCase().includes(q.toLowerCase())) : options;
  return (
    <Popover open anchor={anchor} onClose={onClose} align="right" width={320}>
      <p className="m-0 px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Add a {KIND_WORD[kind]}</p>
      {options.length > 5 && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          aria-label="Search"
          className="mx-1 mb-1 block h-8 w-[calc(100%-8px)] rounded-bz-md border border-bz-line bg-bz-paper px-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
        />
      )}
      {shown.length === 0 && <p className="m-0 px-2 py-3 text-[11.5px] text-bz-text-soft">{options.length ? "No match." : `Every ${KIND_WORD[kind]} is already here.`}</p>}
      {shown.map((o) => (
        <MenuItem key={o.id} hint={o.hint} onClick={() => onPick(kind, o.id, kind === "branding" ? o.id : o.label)}>
          {o.label}
        </MenuItem>
      ))}
    </Popover>
  );
}

// ── Timeline: the campaign's days, plain divs ───────────────────────────────

function Timeline({ c, schemes, events, jobs }: { c: Campaign; schemes: Scheme[]; events: SfEvent[]; jobs: BrandingJob[] }) {
  const total = daysBetween(c.from, c.to) + 1;
  const at = (iso: string) => Math.max(0, Math.min(100, (daysBetween(c.from, iso) / total) * 100));
  const span = (from: string, to: string) => ({ left: `${at(from < c.from ? c.from : from)}%`, width: `${Math.max(1, at(addDays(to > c.to ? c.to : to, 1)) - at(from < c.from ? c.from : from))}%` });
  const todayIn = SF_TODAY >= c.from && SF_TODAY <= c.to;
  const months: { label: string; left: number }[] = [];
  for (let d = c.from; d <= c.to; d = addDays(d, 1)) if (d === c.from || d.endsWith("-01")) months.push({ label: day(d), left: at(d) });
  const installs = jobs.filter((j) => j.installedOn && j.installedOn >= c.from && j.installedOn <= c.to);

  const Track = ({ children }: { children: React.ReactNode }) => (
    <div className="relative h-5">
      {todayIn && <span className="absolute inset-y-0 w-px bg-bz-text-muted" style={{ left: `${at(SF_TODAY)}%` }} />}
      {children}
    </div>
  );
  const Bar = ({ from, to, strong }: { from: string; to: string; strong?: boolean }) => (
    <span className={cn("absolute top-1/2 h-1.5 -translate-y-1/2 rounded-bz-pill", strong ? "bg-bz-text-soft" : "bg-bz-line")} style={span(from, to)} />
  );
  const Label = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
    <span className="min-w-0 truncate text-[11.5px] text-bz-text-muted">
      {children}
      {sub && <span className="ml-1.5 text-[10.5px] text-bz-text-soft">{sub}</span>}
    </span>
  );

  return (
    <div className="grid grid-cols-1 items-center gap-x-5 gap-y-1.5 sm:grid-cols-[200px_minmax(0,1fr)]">
      <span className="hidden sm:block" />
      <div className="relative h-4 text-[10px] text-bz-text-soft">
        {months.map((m) => (
          <span key={m.label} className={cn("absolute whitespace-nowrap", NUM)} style={{ left: `${m.left}%` }}>
            {m.label}
          </span>
        ))}
      </div>

      <Label>Campaign</Label>
      <Track>
        <Bar from={c.from} to={c.to} />
        {SF_TODAY >= c.from && <Bar from={c.from} to={SF_TODAY < c.to ? SF_TODAY : c.to} strong />}
      </Track>

      {schemes.map((s) => (
        <React.Fragment key={s.id}>
          <Label sub={`${day(s.from)} – ${day(s.to)}`}>{s.name}</Label>
          <Track>
            <Bar from={s.from} to={s.to} strong={s.status === "live"} />
          </Track>
        </React.Fragment>
      ))}

      {(events.length > 0 || installs.length > 0) && (
        <>
          <Label>Events and installs</Label>
          <Track>
            {events.map((e) => (
              <span key={e.id} title={`${e.name} · ${day(e.date)}`} className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-bz-pill border-2 border-bz-surface bg-bz-text" style={{ left: `${at(e.date)}%` }} />
            ))}
            {installs.map((j) => (
              <span key={j.id} title={`${j.id} installed · ${day(j.installedOn!)}`} className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-bz-pill bg-bz-text-soft" style={{ left: `${at(j.installedOn!)}%` }} />
            ))}
          </Track>
        </>
      )}
      <span className="hidden sm:block" />
      <p className="m-0 mt-1 text-[10.5px] text-bz-text-soft">{todayIn ? "The line is today. " : ""}Dots are events, ticks are finished installs. The darker part of a bar has already run.</p>
    </div>
  );
}
