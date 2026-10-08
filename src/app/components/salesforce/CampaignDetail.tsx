import * as React from "react";
import { useNavigate } from "react-router";
import { Pencil, Plus, Target, X } from "lucide-react";
import { cn } from "../ui/utils";
import { Chip, Dialog, GHOST, GHOST_SM, ICON_BTN_SM, LABEL, MenuItem, Meter, NUM, SearchField, Segmented, Select, Stat, Statline } from "../sales/bzw";
import type { Tone } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { Amount, useKeys } from "../sales/orders";
import { Cell, CellGrid, Section } from "../sales/parts";
import { Block, MoneyList, RecordShell } from "../sales/record";
import { useStore } from "../sales/store";
import { fmtDay } from "../masters/kit";
import { SF_TODAY } from "./data";
import type { BrandingJob, Campaign, Scheme, SfEvent } from "./data";
import { day, npr } from "./engine";
import { brandingStore, customersStore, eventsStore, hubStore, posmStore, schemesStore, typesStore } from "./store";
import { SfActivity, SfNoteFoot, TypeMark, chipTone, sfPath } from "./sf";
import {
  CAMPAIGN_LABEL,
  CAMPAIGN_TONE,
  EVENT_LABEL,
  KIND_WORD,
  MEASURE_HINT,
  MEASURE_LABEL,
  SCHEME_LABEL,
  SCHEME_TONE,
  STAGE_LABEL,
  STAGE_TONE,
  addDays,
  audienceOf,
  campaignName,
  campaignOrders,
  customerName,
  daysBetween,
  jobCost,
  kpiActual,
  kpiScope,
  kpisStore,
  linkToCampaign,
  schemeText,
} from "./activationKit";
import type { Bucket, Kpi, LinkKind } from "./activationKit";
import { CampaignSheet, KpiDialog } from "./campaign-forms";

// ════════════════════════════════════════════════════════════════════════════
// A CAMPAIGN — the record, in the desk's panel
//
// What it is for (its goals, counted from approved orders and installs), what
// it costs (spend rolls up from what it holds: a scheme's budget use, the POSM
// cost of its branding jobs, the cost of its events — research/C §4.3), what
// it holds, and the orders it counted. ⤢ in the head gives it the page.
// ════════════════════════════════════════════════════════════════════════════

export type Goal = { k: Kpi; actual: number; pct: number };
export type CampaignRow = {
  c: Campaign;
  /** The status today — a dated campaign is planned, live or over by its dates (`statusNow`). */
  st: Campaign["status"];
  brand: string;
  money: { buckets: Bucket[]; spent: number; committed: number };
  goals: Goal[];
};

const ROW_FOCUS = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire";
const TABLE = "overflow-hidden rounded-bz-md border border-bz-line-soft";
const GOAL_COLS = "grid-cols-[minmax(0,1fr)_132px] sm:grid-cols-[minmax(0,1fr)_112px_96px_104px]";
const ITEM_COLS = "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_112px_100px]";
const ORDER_COLS = "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[64px_96px_minmax(0,1fr)_112px]";
const QUIET_LINK = "text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text";
/** Rows of a list shown before "Show all" — a campaign can hold a branding job for every outlet. */
const SHORT = 5;

const NEW_PATH: Record<LinkKind, string> = { scheme: "schemes/new", branding: "branding/new", event: "events/new" };
const KIND_TITLE: Record<LinkKind, string> = { scheme: "Schemes", branding: "Branding jobs", event: "Events" };

export function CampaignPanel({ r, ctx }: { r: CampaignRow; ctx: PanelCtx }) {
  return ctx.mode === "edit" ? <EditCampaign c={r.c} ctx={ctx} /> : <CampaignRecord r={r} ctx={ctx} />;
}

export function NewCampaign({ ctx }: { ctx: PanelCtx }) {
  return (
    <RecordShell ctx={ctx} no="" back={{ label: "Campaigns", onClick: () => ctx.go(null) }} title="New campaign">
      <div className="flex h-full min-h-0 flex-col">
        <CampaignSheet onCancel={() => ctx.go(null)} onSaved={(id) => (ctx.show("success", `${id} created`), ctx.go(id))} />
      </div>
    </RecordShell>
  );
}

function EditCampaign({ c, ctx }: { c: Campaign; ctx: PanelCtx }) {
  return (
    <RecordShell ctx={ctx} no={c.id} back={{ label: c.id, onClick: () => ctx.go(c.id) }} title="Edit campaign" meta={[<span key="n">{c.name}</span>]}>
      <div className="flex h-full min-h-0 flex-col">
        <CampaignSheet campaign={c} onCancel={() => ctx.go(c.id)} onSaved={() => (ctx.go(c.id), ctx.show("success", `${c.id} saved`))} />
      </div>
    </RecordShell>
  );
}

// ── The record ──────────────────────────────────────────────────────────────

type Item = { id: string; title: string; sub: string; figure: React.ReactNode; status: string; tone: Tone; /** What history calls it. */ label: string };

function CampaignRecord({ r, ctx }: { r: CampaignRow; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const schemes = useStore(schemesStore);
  const branding = useStore(brandingStore);
  const events = useStore(eventsStore);
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const hub = useStore(hubStore);
  const posm = useStore(posmStore);
  const kpisAll = useStore(kpisStore);
  const [kpiOpen, setKpiOpen] = React.useState<{ kpi?: Kpi } | null>(null);
  const [linking, setLinking] = React.useState(false);
  const [showAll, setShowAll] = React.useState<LinkKind[]>([]);

  const { c, st: status, money } = r;
  const kpis = kpisAll[c.id] ?? [];
  const mySchemes = schemes.filter((s) => s.campaignId === c.id);
  const myJobs = branding.filter((b) => b.campaignId === c.id);
  const myEvents = events.filter((e) => e.campaignId === c.id).sort((a, b) => a.date.localeCompare(b.date));
  const orders = campaignOrders(c, hub).sort((a, b) => b.order.at.localeCompare(a.order.at));
  const orderValue = orders.reduce((s, o) => s + o.value, 0);
  const left = c.budget - money.spent - money.committed;
  const over = money.spent > c.budget;
  const spentPct = Math.round((money.spent / Math.max(1, c.budget)) * 100);
  const total = daysBetween(c.from, c.to) + 1;
  const dayNo = daysBetween(c.from, SF_TODAY) + 1;
  // A draft has no days yet, and one ended by hand is not "on day 4".
  const dayText = status === "draft" ? null : dayNo < 1 ? `starts in ${1 - dayNo} ${1 - dayNo === 1 ? "day" : "days"}` : dayNo > total ? `ran ${total} ${total === 1 ? "day" : "days"}` : status === "ended" ? null : `day ${dayNo} of ${total}`;
  const matching = audienceOf(c, customers);

  const edit = () => ctx.go(c.id, { do: "edit" });
  useKeys({ e: () => !kpiOpen && !linking && edit() });

  const attach = (kind: LinkKind, itemId: string, label: string) => {
    const list: { id: string; campaignId: string | null }[] = kind === "scheme" ? schemesStore.get() : kind === "branding" ? brandingStore.get() : eventsStore.get();
    const before = list.find((x) => x.id === itemId)?.campaignId ?? null;
    linkToCampaign(kind, itemId, c.id, label);
    setLinking(false);
    ctx.show("success", `Added ${label} to this campaign.`, { label: "Undo", run: () => linkToCampaign(kind, itemId, before, label) });
  };
  const detach = (kind: LinkKind, itemId: string, label: string) => {
    linkToCampaign(kind, itemId, null, label);
    ctx.show("info", `Took ${label} out of this campaign.`, { label: "Undo", run: () => linkToCampaign(kind, itemId, c.id, label) });
  };

  const lists: { kind: LinkKind; items: Item[] }[] = [
    {
      kind: "scheme",
      items: mySchemes.map((s) => ({ id: s.id, title: s.name, sub: schemeText(s), figure: <BudgetUse s={s} />, status: SCHEME_LABEL[s.status], tone: chipTone(SCHEME_TONE[s.status]), label: s.name })),
    },
    {
      kind: "branding",
      items: myJobs.map((b) => ({
        id: b.id,
        title: customerName(b.customerId),
        sub: `${posm.find((x) => x.id === b.posmId)?.name ?? "Deleted POSM item"} × ${b.qty}`,
        figure: <Amount value={jobCost(b)} />,
        status: STAGE_LABEL[b.stage],
        tone: chipTone(STAGE_TONE[b.stage]),
        label: b.id,
      })),
    },
    {
      kind: "event",
      items: myEvents.map((e) => ({ id: e.id, title: e.name, sub: `${e.kind} · ${e.place}`, figure: <span className={NUM}>{day(e.date)}</span>, status: EVENT_LABEL[e.status], tone: chipTone(e.status === "done" ? "off" : "info"), label: e.name })),
    },
  ];
  const held = lists.reduce((n, l) => n + l.items.length, 0);

  return (
    <RecordShell
      ctx={ctx}
      no={c.id}
      chips={<Chip tone={chipTone(CAMPAIGN_TONE[status])}>{CAMPAIGN_LABEL[status]}</Chip>}
      title={c.name}
      meta={[
        <span key="d" className={NUM}>
          {day(c.from)} – {day(c.to)}
        </span>,
        ...(dayText ? [<span key="n">{dayText}</span>] : []),
        ...(r.brand ? [<span key="b">{r.brand}</span>] : []),
        <span key="a" className={NUM} title="Customers in its audience">
          {npr(matching.length)} {matching.length === 1 ? "customer" : "customers"}
        </span>,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} onClick={() => (close(), edit())}>
            Edit campaign
          </MenuItem>
          <MenuItem icon={Target} onClick={() => (close(), setKpiOpen({}))}>
            Add goal…
          </MenuItem>
        </>
      )}
      foot={<SfNoteFoot id={c.id} />}
    >
      <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
        <Statline className="pt-3">
          <Stat label="Budget" value={<Amount value={c.budget} currency="NPR" />} />
          <Stat label="Spent" value={<Amount value={money.spent} />} meter={over ? undefined : spentPct} sub={`${spentPct}%`} danger={over} />
          <Stat label="Committed" value={<Amount value={money.committed} />} title="Approved branding and events still to come" />
          <Stat label="Sales so far" value={<Amount value={orderValue} />} title={`${orders.length} approved ${orders.length === 1 ? "order" : "orders"} in its dates and audience, before tax`} />
        </Statline>
      </div>

      <Block
        title="Goals"
        count={kpis.length}
        right={
          <button type="button" className={GHOST_SM} onClick={() => setKpiOpen({})}>
            <Plus size={12} /> Add goal
          </button>
        }
      >
        {c.objective && <p className="m-0 mb-3 text-[12px] leading-relaxed text-bz-text-muted">{c.objective}</p>}
        {kpis.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No goals yet.</p>
        ) : (
          <div className={TABLE}>
            <div className={cn("hidden items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", GOAL_COLS, LABEL)}>
              <span>Goal</span>
              <span className="text-right">Target</span>
              <span className="text-right">So far</span>
              <span>Reached</span>
            </div>
            {kpis.map((k) => {
              const actual = kpiActual(k, c, orders, branding);
              const pct = (actual / Math.max(1, k.target)) * 100;
              const scope = [MEASURE_LABEL[k.measure], kpiScope(k)].filter((x) => x && x !== k.label).join(" · ");
              return (
                <button
                  key={k.id}
                  type="button"
                  title={MEASURE_HINT[k.measure]}
                  onClick={() => setKpiOpen({ kpi: k })}
                  className={cn("grid w-full items-center gap-3 border-b border-bz-line-soft px-3 py-2 text-left transition-colors last:border-0 hover:bg-bz-paper-warm", ROW_FOCUS, GOAL_COLS)}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] text-bz-text">{k.label}</span>
                    {scope && <span className="block truncate text-[10.5px] text-bz-text-soft">{scope}</span>}
                  </span>
                  <span className={cn("hidden text-right text-[12px] text-bz-text-muted sm:block", NUM)}>
                    {npr(k.target)} <span className="text-[10.5px] text-bz-text-soft">{k.unit}</span>
                  </span>
                  <span className={cn("hidden text-right text-[12px] text-bz-text sm:block", NUM)}>{npr(actual)}</span>
                  <span className="min-w-0">
                    <Meter thin pct={pct} />
                    <span className={cn("mt-1 block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {Math.round(pct)}%
                      <span className="sm:hidden">
                        {" "}
                        · {npr(actual)} / {npr(k.target)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Block>

      <Block title="Budget">
        <MoneyList
          className="mt-0"
          rows={[
            { label: "Budget", value: <Amount value={c.budget} /> },
            ...money.buckets.flatMap((b) => [
              { label: b.label, value: <Less value={b.spent} /> },
              ...(b.committed > 0 ? [{ label: `${b.label}, committed`, value: <Less value={b.committed} />, soft: true }] : []),
            ]),
            { label: left < 0 ? "Over budget" : "Left", value: <Amount value={Math.abs(left)} currency="NPR" />, strong: true, danger: left < 0 },
          ]}
        />
      </Block>

      <Block
        title="What's in it"
        count={held}
        right={
          <Select
            trigger="ghost"
            icon={Plus}
            label="Add"
            value={null}
            align="right"
            width={240}
            searchable={false}
            options={[
              { value: "scheme", label: "New scheme" },
              { value: "branding", label: "New branding request" },
              { value: "event", label: "New event" },
              { value: "link", label: "Something you already have…" },
            ]}
            onChange={(v) => (v === "link" ? setLinking(true) : navigate(`${sfPath(NEW_PATH[v as LinkKind])}?campaign=${c.id}`))}
          />
        }
      >
        {held === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Nothing in it yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {lists
              .filter((l) => l.items.length > 0)
              .map((l) => {
                const open = showAll.includes(l.kind);
                const shown = open ? l.items : l.items.slice(0, SHORT);
                return (
                  <div key={l.kind}>
                    <p className={cn(LABEL, "m-0 mb-1.5 flex items-center gap-1.5")}>
                      {KIND_TITLE[l.kind]} <span className={NUM}>{l.items.length}</span>
                    </p>
                    <div className={TABLE}>
                      {shown.map((it) => (
                        <div key={it.id} className="flex items-center border-b border-bz-line-soft last:border-0 hover:bg-bz-paper-warm">
                          <button type="button" onClick={() => navigate(sfPath(`${l.kind === "scheme" ? "schemes" : l.kind === "branding" ? "branding" : "events"}/${it.id}`))} className={cn("grid min-w-0 flex-1 items-center gap-3 py-2 pl-3 pr-2 text-left", ROW_FOCUS, ITEM_COLS)}>
                            <span className="min-w-0">
                              <span className="block truncate text-[12.5px] text-bz-text">{it.title}</span>
                              <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{it.sub}</span>
                            </span>
                            <span className="hidden min-w-0 text-[11.5px] text-bz-text-muted sm:block">{it.figure}</span>
                            <span>
                              <Chip tone={it.tone}>{it.status}</Chip>
                            </span>
                          </button>
                          <button type="button" className={cn(ICON_BTN_SM, "mr-2 shrink-0")} onClick={() => detach(l.kind, it.id, it.label)} title="Take out of this campaign" aria-label={`Take ${it.title} out of this campaign`}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {l.items.length > SHORT && (
                      <button type="button" className={cn(QUIET_LINK, "mt-1.5")} onClick={() => setShowAll((s) => (open ? s.filter((k) => k !== l.kind) : [...s, l.kind]))}>
                        {open ? "Show fewer" : `Show all ${l.items.length}`}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        )}
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
          <Cell label="Period">
            <span className={NUM}>
              {fmtDay(c.from)} – {fmtDay(c.to)}
            </span>
            <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
              {total} {total === 1 ? "day" : "days"}
            </span>
          </Cell>
          <Cell label="Brand">{r.brand || <span className="text-bz-text-soft">—</span>}</Cell>
          <Cell label="Customer types">
            {c.audience.typeIds.length === 0 ? (
              "Every type"
            ) : (
              <span className="flex flex-col gap-1.5">
                {c.audience.typeIds.map((tid) => {
                  const t = types.find((x) => x.id === tid);
                  return (
                    <span key={tid} className="flex items-center justify-between gap-2">
                      {t ? <TypeMark name={t.plural} color={t.color} /> : <span className="text-[11.5px] text-bz-text-soft">Deleted type</span>}
                      <span className={cn("text-[11.5px] text-bz-text-soft", NUM)}>{matching.filter((x) => x.typeId === tid).length}</span>
                    </span>
                  );
                })}
              </span>
            )}
          </Cell>
        </CellGrid>
      </Block>

      <div className="border-b border-bz-line-soft">
        <Section title="Orders" count={orders.length} summary={orders.length ? <Amount value={orderValue} /> : "None"}>
          {orders.length === 0 ? (
            <p className="m-0 text-[11.5px] text-bz-text-soft">No approved orders in its dates and audience yet.</p>
          ) : (
            <>
              <div className={TABLE}>
                <div className={cn("hidden gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", ORDER_COLS, LABEL)}>
                  <span>Date</span>
                  <span>Order</span>
                  <span>Customer</span>
                  <span className="text-right">Value</span>
                </div>
                {orders.slice(0, 8).map(({ order: o, value }) => {
                  const units = o.lines.reduce((n, l) => n + l.qty, 0);
                  return (
                    <button key={o.id} type="button" onClick={() => navigate(sfPath(`orders/${o.id}`))} className={cn("grid w-full items-center gap-3 border-b border-bz-line-soft px-3 py-2 text-left text-[12px] last:border-0 hover:bg-bz-paper-warm", ROW_FOCUS, ORDER_COLS)}>
                      <span className={cn("hidden text-bz-text-muted sm:block", NUM)}>{day(o.at)}</span>
                      <span className={cn("hidden font-medium text-bz-text sm:block", NUM)}>{o.id}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-bz-text">{customerName(o.customerId)}</span>
                        <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                          <span className="sm:hidden">
                            {o.id} · {day(o.at)} ·{" "}
                          </span>
                          {units} {units === 1 ? "unit" : "units"}
                        </span>
                      </span>
                      <span className="text-right font-semibold text-bz-text">
                        <Amount value={value} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {orders.length > 8 && <p className={cn("m-0 mt-2 text-[11px] text-bz-text-soft", NUM)}>and {orders.length - 8} more.</p>}
            </>
          )}
        </Section>
        <Section title="Timeline" summary={dayText ?? `${total} ${total === 1 ? "day" : "days"}`}>
          <Timeline c={c} schemes={mySchemes} events={myEvents} jobs={myJobs} />
        </Section>
      </div>

      <SfActivity ids={[c.id]} />

      <KpiDialog open={!!kpiOpen} campaignId={c.id} kpi={kpiOpen?.kpi} onClose={() => setKpiOpen(null)} />
      <LinkDialog open={linking} campaign={c} onClose={() => setLinking(false)} onPick={attach} />
    </RecordShell>
  );
}

/** A deduction in a ladder: the minus is typed, so nothing reads "−0.00". */
function Less({ value }: { value: number }) {
  return value > 0 ? (
    <>
      −<Amount value={value} />
    </>
  ) : (
    <Amount value={0} />
  );
}

function BudgetUse({ s }: { s: Scheme }) {
  if (!s.budget || s.budget.total <= 0) return <span className="text-bz-text-soft">No budget cap</span>;
  const use = s.budget.used / s.budget.total;
  return (
    <>
      <Meter thin pct={use * 100} danger={use > 1} />
      <span className={cn("mt-1 block text-[10.5px]", use > 1 ? "text-bz-red" : "text-bz-text-soft", NUM)}>{Math.round(use * 100)}% of budget</span>
    </>
  );
}

// ── Link something that exists already ──────────────────────────────────────

function LinkDialog({ open, campaign, onClose, onPick }: { open: boolean; campaign: Campaign; onClose: () => void; onPick: (kind: LinkKind, id: string, label: string) => void }) {
  const schemes = useStore(schemesStore);
  const branding = useStore(brandingStore);
  const events = useStore(eventsStore);
  const posm = useStore(posmStore);
  const [kind, setKind] = React.useState<LinkKind>("scheme");
  const [q, setQ] = React.useState("");
  const elsewhere = (cid: string | null) => (cid ? `in ${campaignName(cid)}` : null);
  const all: Record<LinkKind, { id: string; label: string; hint: string }[]> = {
    scheme: schemes
      .filter((s) => s.campaignId !== campaign.id && s.status !== "ended")
      .map((s) => ({ id: s.id, label: s.name, hint: [schemeText(s), elsewhere(s.campaignId)].filter(Boolean).join(" · ") })),
    branding: branding
      .filter((b) => b.campaignId !== campaign.id && b.stage !== "rejected")
      .map((b) => ({ id: b.id, label: customerName(b.customerId), hint: [`${posm.find((p) => p.id === b.posmId)?.name ?? "Deleted POSM item"} × ${b.qty}`, STAGE_LABEL[b.stage], elsewhere(b.campaignId)].filter(Boolean).join(" · ") })),
    event: events.filter((e) => e.campaignId !== campaign.id).map((e) => ({ id: e.id, label: e.name, hint: [day(e.date), e.place, elsewhere(e.campaignId)].filter(Boolean).join(" · ") })),
  };
  // It opens on the first kind that has something to add.
  React.useEffect(() => {
    if (!open) return;
    setQ("");
    setKind((["scheme", "branding", "event"] as const).find((k) => all[k].length > 0) ?? "scheme");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const options = all[kind];
  const shown = q ? options.filter((o) => `${o.label} ${o.hint}`.toLowerCase().includes(q.toLowerCase())) : options;
  return (
    <Dialog
      open={open}
      eyebrow={campaign.id}
      title="Add something you already have"
      onClose={onClose}
      foot={
        <button type="button" className={GHOST} onClick={onClose}>
          Cancel
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        <div>
          <Segmented<LinkKind> size="sm" value={kind} onChange={(k) => (setKind(k), setQ(""))} options={(["scheme", "branding", "event"] as const).map((k) => ({ value: k, label: KIND_TITLE[k], count: all[k].length }))} />
        </div>
        {options.length > SHORT && <SearchField value={q} onChange={setQ} placeholder="Search" />}
        {shown.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">{options.length ? "No match." : `No ${KIND_WORD[kind]}s to add.`}</p>
        ) : (
          <div className={cn(TABLE, "max-h-[320px] overflow-y-auto [scrollbar-width:thin]")}>
            {shown.map((o) => (
              <button key={o.id} type="button" onClick={() => onPick(kind, o.id, kind === "branding" ? o.id : o.label)} className={cn("block w-full border-b border-bz-line-soft px-3 py-2 text-left last:border-0 hover:bg-bz-paper-warm", ROW_FOCUS)}>
                <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{o.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}

// ── Timeline: the campaign's days, plain divs ───────────────────────────────

function Timeline({ c, schemes, events, jobs }: { c: Campaign; schemes: Scheme[]; events: SfEvent[]; jobs: BrandingJob[] }) {
  const total = daysBetween(c.from, c.to) + 1;
  const at = (iso: string) => Math.max(0, Math.min(100, (daysBetween(c.from, iso) / total) * 100));
  const span = (from: string, to: string) => ({ left: `${at(from < c.from ? c.from : from)}%`, width: `${Math.max(1, at(addDays(to > c.to ? c.to : to, 1)) - at(from < c.from ? c.from : from))}%` });
  const todayIn = SF_TODAY >= c.from && SF_TODAY <= c.to;
  const months: { label: string; left: number }[] = [];
  // A long campaign would print a label a day; month starts are enough.
  for (let d = c.from, n = 0; d <= c.to && n < 800; d = addDays(d, 1), n++) if (d === c.from || d.endsWith("-01")) months.push({ label: day(d), left: at(d) });
  const installs = jobs.filter((j) => j.installedOn && j.installedOn >= c.from && j.installedOn <= c.to);

  const track = (children: React.ReactNode) => (
    <div className="relative h-5">
      {todayIn && <span title="Today" className="absolute inset-y-0 w-px bg-bz-text-muted" style={{ left: `${at(SF_TODAY)}%` }} />}
      {children}
    </div>
  );
  // The darker part of a bar has already run.
  const bar = (from: string, to: string, strong?: boolean) => <span className={cn("absolute top-1/2 h-1.5 -translate-y-1/2 rounded-bz-pill", strong ? "bg-bz-text-soft" : "bg-bz-line")} style={span(from, to)} />;
  const label = (text: string, sub?: string) => (
    <span className="min-w-0 truncate text-[11.5px] text-bz-text-muted">
      {text}
      {sub && <span className={cn("ml-1.5 text-[10.5px] text-bz-text-soft", NUM)}>{sub}</span>}
    </span>
  );

  return (
    <div className="grid grid-cols-1 items-center gap-x-4 gap-y-1.5 sm:grid-cols-[200px_minmax(0,1fr)]">
      <span className="hidden sm:block" />
      <div className="relative h-4 overflow-hidden text-[10px] text-bz-text-soft">
        {months.map((m) => (
          <span key={m.label} className={cn("absolute whitespace-nowrap", NUM)} style={{ left: `${m.left}%` }}>
            {m.label}
          </span>
        ))}
      </div>

      {label("Campaign")}
      {track(
        <>
          {bar(c.from, c.to)}
          {SF_TODAY >= c.from && bar(c.from, SF_TODAY < c.to ? SF_TODAY : c.to, true)}
        </>,
      )}

      {schemes.map((s) => (
        <React.Fragment key={s.id}>
          {label(s.name, `${day(s.from)} – ${day(s.to)}`)}
          {track(bar(s.from, s.to, s.status === "live"))}
        </React.Fragment>
      ))}

      {(events.length > 0 || installs.length > 0) && (
        <>
          {label("Events and installs")}
          {track(
            <>
              {events.map((e) => (
                <span key={e.id} title={`${e.name} · ${day(e.date)}`} className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-bz-pill bg-bz-text shadow-[0_0_0_2px_var(--bz-surface)]" style={{ left: `${at(e.date)}%` }} />
              ))}
              {installs.map((j) => (
                <span key={j.id} title={`${j.id} installed · ${day(j.installedOn!)}`} className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-bz-pill bg-bz-text-soft" style={{ left: `${at(j.installedOn!)}%` }} />
              ))}
            </>,
          )}
        </>
      )}
    </div>
  );
}
