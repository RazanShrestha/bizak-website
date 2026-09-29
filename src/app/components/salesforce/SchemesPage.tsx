import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Copy, Pause, Pencil, Play, Plus, Square } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, GHOST_SM, NUM, ToastHost, useToast } from "../sales/bzw";
import { useStore } from "../sales/store";
import { ConfirmDialog } from "../sales/parts";
import { CUSTOMER_TYPES, SF_TODAY } from "./data";
import type { Scheme, SchemeStatus } from "./data";
import { customerById, day, evaluate, npr } from "./engine";
import type { HistoryEvent } from "../sales/orders";
import { campaignsStore, claimsStore, hubStore, schemesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, EmptyNote, Fact, Figures, List, Money, Page, PageIntro, Progress, Row, SidePanel, TextTabs, TypeMark } from "./ui";
import { APPLIES_TEXT, PanelSection, RecordActivity, RecordNoteFoot, STATUS, addDaysIso, audienceText, logEvent, mechanicLabel, periodText, ruleText, schemeExtrasStore, stamp, territoryName } from "./schemes-kit";
import { SchemeBuilderPage } from "./scheme-builder";

// ════════════════════════════════════════════════════════════════════════════
// SCHEMES — the trade promotions the one engine applies
//
// A list by lifecycle (Live · Scheduled · Draft · Ended), each row the scheme's
// sentence and its budget burn; the panel adds who it is for, how it stacks,
// and the hub orders it actually touched — worked out by `evaluate`, the same
// call the Orders hub prices with, so the two can never disagree.
// ════════════════════════════════════════════════════════════════════════════

type Tab = "live" | "scheduled" | "draft" | "ended";
const tabOf = (s: SchemeStatus): Tab => (s === "paused" ? "live" : s);

const budgetPct = (s: Scheme) => (s.budget && s.budget.total ? (s.budget.used / s.budget.total) * 100 : 0);
const budgetText = (b: NonNullable<Scheme["budget"]>) => (b.kind === "value" ? `NPR ${npr(b.used)} of ${npr(b.total)}` : `${npr(b.used)} of ${npr(b.total)} units`);

function BudgetCell({ s }: { s: Scheme }) {
  if (!s.budget) return <span className="block w-[110px] text-[11px] font-normal text-bz-text-soft">No limit</span>;
  const pct = budgetPct(s);
  return (
    <span className="flex w-[110px] flex-col items-end gap-1">
      <span className={cn("text-[11px] font-normal text-bz-text-muted", NUM)}>{Math.round(pct)}% used</span>
      <Progress pct={pct} tone={pct >= 90 ? "danger" : pct >= 75 ? "warn" : "good"} />
    </span>
  );
}

/** The hub orders a scheme applied on, priced with every scheme exactly as the hub prices them. */
function useTouched(s: Scheme | undefined) {
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  return React.useMemo(() => {
    if (!s || s.applies !== "order") return [];
    return hub
      .filter((o) => o.status !== "rejected")
      .map((o) => {
        const ev = evaluate(o.customerId, o.lines, schemes, { date: o.at.slice(0, 10) });
        const a = ev.applied.find((x) => x.schemeId === s.id);
        return a ? { o, total: ev.total, benefit: a.benefit, text: a.text } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [s, hub, schemes]);
}

function SchemePanel({ s, onClose }: { s: Scheme; onClose: () => void }) {
  const navigate = useNavigate();
  const campaigns = useStore(campaignsStore);
  const claims = useStore(claimsStore);
  const extras = useStore(schemeExtrasStore)[s.id];
  const touched = useTouched(s);
  const [ending, setEnding] = React.useState(false);
  const { toast, show, dismiss } = useToast();
  const campaign = campaigns.find((c) => c.id === s.campaignId);
  const linkedClaims = claims.filter((c) => c.schemeId === s.id);

  const setStatus = (status: SchemeStatus, what: string) => {
    schemesStore.set((list) => list.map((x) => (x.id === s.id ? { ...x, status, to: status === "ended" && x.to > SF_TODAY ? SF_TODAY : x.to } : x)));
    logEvent(`scheme:${s.id}`, what);
    show("success", `${s.name} ${what.replace(/ the scheme$/, "")}.`);
  };

  const touchedValue = touched.reduce((a, t) => a + t.total, 0);
  const touchedBenefit = touched.reduce((a, t) => a + t.benefit, 0);
  const types = CUSTOMER_TYPES.filter((t) => s.typeIds.includes(t.id));

  return (
    <SidePanel
      open
      onClose={onClose}
      width={600}
      eyebrow={`${s.id} · ${mechanicLabel(s.mechanic.kind)}`}
      title={s.name}
      meta={
        <>
          <Dot tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Dot>
          <span className={NUM}>{periodText(s.from, s.to)}</span>
          {campaign && (
            <Link to={sfPath(`campaigns/${campaign.id}`)} className="hover:text-bz-text hover:underline">
              {campaign.name}
            </Link>
          )}
        </>
      }
      foot={<RecordNoteFoot subject={`scheme:${s.id}`} />}
    >
      <div className="flex flex-wrap gap-1.5">
        {s.status === "live" && (
          <button type="button" className={GHOST_SM} onClick={() => setStatus("paused", "paused the scheme")}>
            <Pause size={12} /> Pause
          </button>
        )}
        {s.status === "paused" && (
          <button type="button" className={GHOST_SM} onClick={() => setStatus("live", "resumed the scheme")}>
            <Play size={12} /> Resume
          </button>
        )}
        {s.status !== "ended" && (
          <button type="button" className={GHOST_SM} onClick={() => navigate(sfPath(`schemes/${s.id}/edit`))}>
            <Pencil size={12} /> Edit
          </button>
        )}
        <button type="button" className={GHOST_SM} onClick={() => navigate(`${sfPath("schemes/new")}?copy=${s.id}`)}>
          <Copy size={12} /> Duplicate
        </button>
        {s.status !== "ended" && s.status !== "draft" && (
          <button type="button" className={GHOST_SM} onClick={() => setEnding(true)}>
            <Square size={11} /> End
          </button>
        )}
      </div>

      <p className="m-0 mt-6 text-[13px] leading-relaxed text-bz-text">{ruleText(s.mechanic)}.</p>
      <p className="m-0 mt-1 text-[11px] text-bz-text-soft">{APPLIES_TEXT[s.applies]}.</p>

      <PanelSection title="Who it's for">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Fact label="Customer types">
            {types.length ? (
              <span className="flex flex-col gap-1">
                {types.map((t) => (
                  <TypeMark key={t.id} name={t.plural} color={t.color} />
                ))}
              </span>
            ) : (
              "Every type"
            )}
          </Fact>
          <Fact label="Tiers">{s.tiers.length ? s.tiers.map((t) => `Tier ${t}`).join(", ") : "Every tier"}</Fact>
          <Fact label="Territories">{s.territoryIds.length ? s.territoryIds.map(territoryName).join(", ") : "Everywhere"}</Fact>
        </div>
      </PanelSection>

      <PanelSection title="How it stacks">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Fact label="Priority">
            <span className={NUM}>{s.priority}</span> <span className="text-[11px] text-bz-text-soft">lower goes first</span>
          </Fact>
          <Fact label="With others">{s.exclusive ? "Exclusive — later schemes are skipped" : "Stacks with other schemes"}</Fact>
          <Fact label="Max per customer">{extras?.maxPerCustomer ? `${extras.maxPerCustomer} times` : "No limit"}</Fact>
        </div>
      </PanelSection>

      <PanelSection title="Budget">
        {s.budget ? (
          <>
            <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
              <span className={cn("text-bz-text", NUM)}>{budgetText(s.budget)}</span>
              <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{Math.round(budgetPct(s))}%</span>
            </div>
            <Progress pct={budgetPct(s)} tone={budgetPct(s) >= 90 ? "danger" : budgetPct(s) >= 75 ? "warn" : "good"} className="mt-2" />
            <p className="m-0 mt-2 text-[11px] text-bz-text-soft">
              {s.budget.used >= s.budget.total ? "Used up — the engine no longer applies it." : `${s.budget.kind === "value" ? `NPR ${npr(s.budget.total - s.budget.used)}` : `${npr(s.budget.total - s.budget.used)} units`} left. It stops by itself when used up.`}
            </p>
          </>
        ) : (
          <p className="m-0 text-[12.5px] text-bz-text-muted">No limit — runs until {day(s.to)}.</p>
        )}
      </PanelSection>

      {s.applies === "order" ? (
        <PanelSection title="Orders it touched" count={touched.length}>
          {touched.length === 0 ? (
            <p className="m-0 text-[12px] text-bz-text-muted">No order in the hub gets this scheme{s.status === "scheduled" ? ` yet — it starts ${day(s.from)}` : ""}.</p>
          ) : (
            <>
              <p className={cn("m-0 mb-3 text-[12px] text-bz-text-muted", NUM)}>
                {touched.length} {touched.length === 1 ? "order" : "orders"} worth <Money value={touchedValue} className="text-bz-text" />, giving <Money value={touchedBenefit} className="text-bz-text" /> in benefit.
              </p>
              <List>
                {touched.map((t) => (
                  <Row key={t.o.id} title={customerById(t.o.customerId)?.name ?? t.o.customerId} sub={`${t.o.id} · ${t.text}`} trail={<Money value={t.benefit} code={false} />} onClick={() => navigate(sfPath(`orders/${t.o.id}`))} />
                ))}
              </List>
            </>
          )}
        </PanelSection>
      ) : (
        <PanelSection title={s.applies === "claim" ? "Claims against it" : "How it is paid"} count={s.applies === "claim" ? linkedClaims.length : undefined}>
          {s.applies === "claim" ? (
            linkedClaims.length ? (
              <List>
                {linkedClaims.map((c) => (
                  <Row key={c.id} title={customerById(c.party)?.name ?? c.party} sub={`${c.id} · raised ${day(c.raisedOn)}`} trail={<Money value={c.amount} code={false} />} onClick={() => navigate(sfPath(`claims/${c.id}`))} />
                ))}
              </List>
            ) : (
              <p className="m-0 text-[12px] text-bz-text-muted">No claims yet.</p>
            )
          ) : (
            <p className="m-0 text-[12px] text-bz-text-muted">{s.applies === "period" ? "Worked out from each customer's invoices when the period closes, then settled by credit note." : "Given on the customer receipt when the invoice is paid in time."}</p>
          )}
        </PanelSection>
      )}

      <RecordActivity subject={`scheme:${s.id}`} seed={seedHistory(s)} />

      <ConfirmDialog
        open={ending}
        eyebrow={s.id}
        title="End this scheme?"
        body="New orders stop getting it today. Orders that already have it keep it."
        confirm="End scheme"
        danger
        onClose={() => setEnding(false)}
        onConfirm={() => {
          setEnding(false);
          setStatus("ended", "ended the scheme");
        }}
      />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SidePanel>
  );
}

/** What the scheme's own dates say happened before this session. */
function seedHistory(s: Scheme): HistoryEvent[] {
  const created = s.from < SF_TODAY ? addDaysIso(s.from, -7) : addDaysIso(SF_TODAY, -3);
  const out: HistoryEvent[] = [{ id: `${s.id}-h1`, whoId: s.owner, when: stamp(created, "10:05"), what: s.status === "draft" ? "saved it as a draft" : "created the scheme" }];
  if (s.status !== "draft") out.push({ id: `${s.id}-h2`, whoId: "EMP-118", when: stamp(addDaysIso(created, 1), "15:40"), what: `approved it${s.budget ? ` with a budget of ${s.budget.kind === "value" ? `NPR ${npr(s.budget.total)}` : `${npr(s.budget.total)} units`}` : ""}` });
  return out;
}

export function SchemesPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const schemes = useStore(schemesStore);
  const selected = schemes.find((s) => s.id === id);
  const [tab, setTab] = React.useState<Tab>(() => (selected ? tabOf(selected.status) : "live"));

  const counts = (t: Tab) => schemes.filter((s) => tabOf(s.status) === t).length;
  const rows = schemes.filter((s) => tabOf(s.status) === tab).sort((a, b) => a.priority - b.priority);
  const live = schemes.filter((s) => s.status === "live");
  const spend = live.filter((s) => s.budget?.kind === "value").reduce((a, s) => a + (s.budget?.used ?? 0), 0);
  const nearEnd = live.filter((s) => s.budget && budgetPct(s) >= 85);
  const endingSoon = live.filter((s) => s.to >= SF_TODAY && s.to <= addDaysIso(SF_TODAY, 30));
  const close = React.useCallback(() => navigate(sfPath("schemes")), [navigate]);

  return (
    <SfShell page="schemes" panel={selected ? <SchemePanel key={selected.id} s={selected} onClose={close} /> : undefined}>
      <Page width="full">
        <PageIntro
          actions={
            <Link to={sfPath("schemes/new")} className={BTN}>
              <Plus size={13} /> New scheme
            </Link>
          }
        >
          Trade promotions the engine applies on every order, from every channel.
        </PageIntro>

        <Figures
          items={[
            { label: "Live", value: live.length, sub: `${schemes.filter((s) => s.status === "paused").length} paused` },
            { label: "Spent this season", value: <Money value={spend} />, sub: "money budgets" },
            { label: "Almost used up", value: nearEnd.length, sub: "85% of budget or more", tone: nearEnd.length ? "danger" : undefined },
            { label: "Ending in 30 days", value: endingSoon.length, sub: endingSoon.length ? `first on ${day([...endingSoon].sort((a, b) => a.to.localeCompare(b.to))[0].to)}` : "none soon" },
          ]}
        />

        <TextTabs<Tab>
          className="mb-3 mt-10"
          value={tab}
          onChange={setTab}
          options={[
            { value: "live", label: "Live", count: counts("live") },
            { value: "scheduled", label: "Scheduled", count: counts("scheduled") },
            { value: "draft", label: "Draft", count: counts("draft") },
            { value: "ended", label: "Ended", count: counts("ended") },
          ]}
        />

        {rows.length === 0 ? (
          <EmptyNote
            action={
              <Link to={sfPath("schemes/new")} className={GHOST_SM}>
                New scheme
              </Link>
            }
          >
            No {tab} schemes.
          </EmptyNote>
        ) : (
          <List>
            {rows.map((s) => (
              <Row
                key={s.id}
                active={s.id === id}
                onClick={() => navigate(sfPath(`schemes/${s.id}`))}
                title={
                  <>
                    {s.name}
                    {s.status === "paused" && <Dot tone="warn" className="ml-2 align-middle">Paused</Dot>}
                  </>
                }
                sub={ruleText(s.mechanic)}
                meta={[
                  <span key="a" className="block w-[190px] truncate">{audienceText(s)}</span>,
                  <span key="d" className={cn("block w-[130px]", NUM)}>{periodText(s.from, s.to)}</span>,
                ]}
                trail={<BudgetCell s={s} />}
              />
            ))}
          </List>
        )}
        <p className="m-0 mt-3 text-[11px] text-bz-text-soft">Checked in priority order, lowest number first.</p>
      </Page>
    </SfShell>
  );
}

export const SCHEMES_ROUTES = [
  { path: "design/salesforce/schemes", Component: SchemesPage },
  { path: "design/salesforce/schemes/new", Component: SchemeBuilderPage },
  { path: "design/salesforce/schemes/:id", Component: SchemesPage },
  { path: "design/salesforce/schemes/:id/edit", Component: SchemeBuilderPage },
];
