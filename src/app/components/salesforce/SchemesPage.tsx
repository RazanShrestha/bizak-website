import * as React from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { Ban, CalendarClock, CircleCheck, Copy, ListTree, Pause, Pencil, Play, Table2, TriangleAlert } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, DocLink, GHOST_SM, MenuItem, MenuSep, Meter, NUM, Stat, Statline } from "../sales/bzw";
import type { Tone } from "../sales/bzw";
import type { Column, PanelCtx } from "../sales/DocDesk";
import { Amount, useMedia } from "../sales/orders";
import { Cell, CellGrid, ConfirmDialog, RelatedSection } from "../sales/parts";
import { Block, RecordShell, StepCard } from "../sales/record";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Claim, Scheme, SchemeStatus } from "./data";
import { customerById, day, evaluate, npr } from "./engine";
import { STATUS_META, isFirstOrder } from "./orders-parts";
import { logEvent } from "./records";
import { campaignsStore, claimsStore, hubStore, schemesStore, typesStore } from "./store";
import { FxDesk, pillTone } from "./fx-desk";
import { SfActivity, SfNoteFoot, TypeMark, chipTone, sfPath } from "./sf";
import { APPLIES_TEXT, MECHANICS, STATUS, addDaysIso, audienceText, mechanicLabel, periodText, ruleText, schemeExtrasStore } from "./schemes-kit";
import { SchemeComposer } from "./scheme-builder";

// ════════════════════════════════════════════════════════════════════════════
// GROWTH · SCHEMES — the offers the one engine applies
//
// A `FxDesk` grouped by lifecycle, each row the scheme's sentence and its
// budget burn; the record adds who it is for, how it stacks and the orders it
// actually touched — worked out by `evaluate`, the same call the Orders desk
// prices with, so the two can never disagree. Writing one (new, copy, edit) is
// the composer in scheme-builder.tsx, which takes the page.
// ════════════════════════════════════════════════════════════════════════════

const CLAIM_STATUS: Record<Claim["status"], { label: string; tone: Tone }> = {
  submitted: { label: "Submitted", tone: "pending" },
  approved: { label: "Approved", tone: "partial" },
  settled: { label: "Settled", tone: "positive" },
  rejected: { label: "Rejected", tone: "neutral" },
};

const budgetPct = (s: Scheme) => (s.budget && s.budget.total ? (s.budget.used / s.budget.total) * 100 : 0);
const budgetText = (b: NonNullable<Scheme["budget"]>) => (b.kind === "value" ? `NPR ${npr(b.used)} of ${npr(b.total)}` : `${npr(b.used)} of ${npr(b.total)} units`);

/** Budget used, as a thin meter and its figure. From 90% both turn red together — one fact, one colour. */
function BudgetMark({ s }: { s: Scheme }) {
  const pct = budgetPct(s);
  const hot = pct >= 90;
  return (
    <span className={cn("inline-flex items-center gap-2", NUM, hot && "text-bz-red")}>
      <Meter pct={pct} thin danger={hot} className="w-10 shrink-0" />
      {Math.round(pct)}%
    </span>
  );
}

// ── Lifecycle ───────────────────────────────────────────────────────────────

function setStatus(s: Scheme, status: SchemeStatus, what: string) {
  schemesStore.set((list) => list.map((x) => (x.id === s.id ? { ...x, status, to: status === "ended" && x.to > SF_TODAY ? SF_TODAY : x.to } : x)));
  logEvent(s.id, what);
}

/** The state's one action — the row verb, the step card and the bulk bar all run this. `run` answers with the toast. */
function nextStep(s: Scheme): { label: string; icon: React.ComponentType<{ size?: number }>; run: () => string } | null {
  if (s.status === "draft") {
    const to = s.from > SF_TODAY ? "scheduled" : "live";
    return { label: "Publish", icon: Play, run: () => (setStatus(s, to, "made the offer live"), `${s.id} ${to === "live" ? "published" : "scheduled"}`) };
  }
  if (s.status === "live") return { label: "Pause", icon: Pause, run: () => (setStatus(s, "paused", "paused the offer"), `${s.id} paused`) };
  if (s.status === "paused") return { label: "Resume", icon: Play, run: () => (setStatus(s, "live", "resumed the offer"), `${s.id} resumed`) };
  return null;
}

const bulkStep = (label: "Pause" | "Resume", from: SchemeStatus, verb: string) => ({
  label,
  icon: label === "Pause" ? Pause : Play,
  enabled: (rs: Scheme[]) => rs.some((s) => s.status === from),
  run: (rs: Scheme[]) => {
    const skipped: string[] = [];
    let done = 0;
    rs.forEach((s) => {
      if (s.status === from) {
        nextStep(s)?.run();
        done++;
      } else skipped.push(`${s.id} is ${STATUS[s.status].label.toLowerCase()}`);
    });
    return { done, skipped, verb };
  },
});

// ── The desk ────────────────────────────────────────────────────────────────

const is = (st: SchemeStatus) => (s: Scheme) => s.status === st;
const nearEnd = (s: Scheme) => s.status === "live" && !!s.budget && budgetPct(s) >= 85;
const endingSoon = (s: Scheme) => s.status === "live" && s.to >= SF_TODAY && s.to <= addDaysIso(SF_TODAY, 30);

export function SchemesPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const schemes = useStore(schemesStore);
  const campaigns = useStore(campaignsStore);
  const types = useStore(typesStore);
  // The name column never collapses: the lower-value columns leave as the list narrows.
  const roomy = useMedia("(min-width: 1180px)");
  const mid = useMedia("(min-width: 900px)");
  const toast = React.useRef<PanelCtx["show"] | null>(null);

  const live = schemes.filter(is("live"));
  const spend = live.filter((s) => s.budget?.kind === "value").reduce((a, s) => a + (s.budget?.used ?? 0), 0);
  const campaignName = (s: Scheme) => campaigns.find((c) => c.id === s.campaignId)?.name ?? "";

  const columns: Column<Scheme>[] = [
    ...(roomy ? [{ key: "for", label: "For", width: "150px", render: (s: Scheme) => audienceText(s) }] : []),
    ...(mid ? [{ key: "period", label: "Period", width: "112px", render: (s: Scheme) => <span className={NUM}>{periodText(s.from, s.to)}</span> }] : []),
  ];

  return (
    <FxDesk<Scheme>
      place="schemes"
      section="salesforce/schemes"
      noun={["scheme", "schemes"]}
      rows={schemes}
      noOf={(s) => s.id}
      showPeriod={false}
      partyLabel="Scheme"
      amountLabel="Budget"
      numberWidth="76px"
      rowLabel={(s) => s.name}
      searchText={(s) => `${s.id} ${s.name} ${ruleText(s.mechanic)} ${mechanicLabel(s.mechanic.kind)} ${audienceText(s)} ${campaignName(s)}`}
      searchPlaceholder="Number, name or product"
      stats={[{ label: "Spent", value: <Amount value={spend} currency="NPR" />, title: "Used from the money budgets of live schemes" }]}
      picks={[
        { key: "live", label: "Live", value: live.length, test: is("live") },
        { key: "budget", label: "Almost out of budget", value: schemes.filter(nearEnd).length, test: nearEnd, danger: schemes.some(nearEnd), title: "Live, with 85% of the budget used or more" },
        { key: "ending", label: "Ending soon", value: schemes.filter(endingSoon).length, test: endingSoon, title: "Live, and ends within 30 days" },
      ]}
      views={[
        {
          key: "status",
          label: "By status",
          icon: ListTree,
          groups: (rs) => [
            { key: "live", label: "Live", rows: rs.filter(is("live")), empty: "Nothing live." },
            { key: "scheduled", label: "Scheduled", rows: rs.filter(is("scheduled")) },
            { key: "draft", label: "Draft", rows: rs.filter(is("draft")) },
            { key: "paused", label: "Paused", rows: rs.filter(is("paused")) },
            { key: "ended", label: "Ended", collapsed: true, rows: rs.filter(is("ended")) },
          ],
        },
        { key: "register", label: "Register", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
      ]}
      filters={[
        ...(Object.keys(STATUS) as SchemeStatus[]).map((st) => ({ value: `st:${st}`, label: STATUS[st].label, group: "Status", test: is(st) })),
        ...MECHANICS.filter((m) => schemes.some((s) => s.mechanic.kind === m.kind)).map((m) => ({ value: `k:${m.kind}`, label: m.label, group: "Mechanic", test: (s: Scheme) => s.mechanic.kind === m.kind })),
        ...types.map((t) => ({ value: `t:${t.id}`, label: t.plural, group: "Customer type", test: (s: Scheme) => !s.typeIds.length || s.typeIds.includes(t.id) })),
        ...campaigns.filter((c) => schemes.some((s) => s.campaignId === c.id)).map((c) => ({ value: `c:${c.id}`, label: c.name, group: "Campaign", test: (s: Scheme) => s.campaignId === c.id })),
      ]}
      sorts={[
        { key: "priority", label: "Priority", by: (s) => s.priority },
        { key: "ends", label: "Ending first", by: (s) => s.to },
        { key: "name", label: "Name", by: (s) => s.name.toLowerCase() },
      ]}
      columns={columns}
      primary={(s) => ({ title: s.name, sub: ruleText(s.mechanic), subOnDesktop: true })}
      status={(s) => ({ label: STATUS[s.status].label, tone: pillTone(STATUS[s.status].tone) })}
      amount={(s) => (s.budget ? { value: <BudgetMark s={s} />, sub: budgetText(s.budget) } : { value: <span className="font-normal text-bz-text-soft">No limit</span> })}
      rowVerb={(s) => {
        const step = nextStep(s);
        return step && { label: step.label, icon: step.icon, run: () => toast.current?.("success", step.run()) };
      }}
      bulk={[bulkStep("Pause", "live", "paused"), bulkStep("Resume", "paused", "resumed")]}
      newLabel="New scheme"
      onNew={() => navigate(sfPath("schemes/new"))}
      formFull
      renderNew={(ctx) => <SchemeComposer key={`new:${search.get("copy") ?? ""}`} ctx={ctx} />}
      renderPanel={(s, ctx) => (ctx.mode === "edit" ? <SchemeComposer key={`edit:${s.id}`} ctx={ctx} original={s} /> : <SchemePanel key={s.id} s={s} ctx={ctx} />)}
      renderExtra={(api) => ((toast.current = api.show), null)}
    />
  );
}

// ── The record ──────────────────────────────────────────────────────────────

/** The hub orders a scheme applied on, priced with every scheme exactly as the hub prices them. */
function useTouched(s: Scheme | undefined) {
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  return React.useMemo(() => {
    if (!s || s.applies !== "order") return [];
    return hub
      .filter((o) => o.status !== "rejected")
      .map((o) => {
        const ev = evaluate(o.customerId, o.lines, schemes, { date: o.at.slice(0, 10), firstOrder: isFirstOrder(o, hub) });
        const a = ev.applied.find((x) => x.schemeId === s.id);
        return a ? { o, total: ev.total, benefit: a.benefit, text: a.text } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [s, hub, schemes]);
}

function SchemePanel({ s, ctx }: { s: Scheme; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const campaigns = useStore(campaignsStore);
  const claims = useStore(claimsStore);
  const types = useStore(typesStore);
  const extras = useStore(schemeExtrasStore)[s.id];
  const touched = useTouched(s);
  const [ending, setEnding] = React.useState(false);
  const campaign = campaigns.find((c) => c.id === s.campaignId);
  const linkedClaims = claims.filter((c) => c.schemeId === s.id);

  const touchedValue = touched.reduce((a, t) => a + t.total, 0);
  const touchedBenefit = touched.reduce((a, t) => a + t.benefit, 0);
  const forTypes = types.filter((t) => s.typeIds.includes(t.id));
  const missingTypes = s.typeIds.length - forTypes.length;
  const b = s.budget;
  const left = b ? b.total - b.used : 0;
  const figure = (n: number) => (b?.kind === "value" ? <Amount value={n} /> : `${npr(n)} units`);

  const edit = () => ctx.go(s.id, { do: "edit" });
  const duplicate = () => ctx.go("new", { copy: s.id });
  const step = nextStep(s);
  const act = () => step && ctx.show("success", step.run());
  const ends = s.to < SF_TODAY ? `Ended ${day(s.to)}` : `Ends ${day(s.to)}`;

  const card =
    s.status === "draft" ? (
      <StepCard
        icon={<Pencil size={15} />}
        title="Draft"
        sub={s.from > SF_TODAY ? `Starts ${day(s.from)}` : ends}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={act}>
            <Play size={13} /> Publish
          </button>
        }
      />
    ) : s.status === "live" ? (
      <StepCard
        tone={b && left <= 0 ? "danger" : "done"}
        icon={b && left <= 0 ? <TriangleAlert size={15} /> : <CircleCheck size={15} />}
        title={b && left <= 0 ? "Budget used up" : "Live"}
        sub={b && left <= 0 ? "Orders no longer get it." : ends}
        actions={
          <button type="button" className={GHOST_SM} onClick={act}>
            <Pause size={12} /> Pause
          </button>
        }
      />
    ) : s.status === "paused" ? (
      <StepCard
        icon={<Pause size={15} />}
        title="Paused"
        sub={ends}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={act}>
            <Play size={13} /> Resume
          </button>
        }
      />
    ) : s.status === "scheduled" ? (
      <StepCard
        icon={<CalendarClock size={15} />}
        title="Scheduled"
        sub={`Starts ${day(s.from)}`}
        actions={
          <button type="button" className={GHOST_SM} onClick={edit}>
            <Pencil size={12} /> Edit
          </button>
        }
      />
    ) : (
      <StepCard
        tone="quiet"
        icon={<Ban size={15} />}
        title="Ended"
        sub={day(s.to)}
        actions={
          <button type="button" className={GHOST_SM} onClick={duplicate}>
            <Copy size={12} /> Duplicate
          </button>
        }
      />
    );

  const related =
    s.applies === "order"
      ? touched.map((t) => ({ no: t.o.id, kind: "Order", date: t.o.at.slice(0, 10), party: customerById(t.o.customerId)?.name ?? "Deleted customer", status: STATUS_META[t.o.status].label, tone: chipTone(STATUS_META[t.o.status].tone) }))
      : linkedClaims.map((c) => ({ no: c.id, kind: "Claim", date: c.raisedOn, party: customerById(c.party)?.name ?? c.party, status: CLAIM_STATUS[c.status].label, tone: CLAIM_STATUS[c.status].tone }));

  return (
    <RecordShell
      ctx={ctx}
      no={s.id}
      chips={<Chip tone={chipTone(STATUS[s.status].tone)}>{STATUS[s.status].label}</Chip>}
      title={s.name}
      meta={[
        <span key="k">{mechanicLabel(s.mechanic.kind)}</span>,
        <span key="p" className={NUM}>
          {periodText(s.from, s.to)}
        </span>,
        ...(campaign ? [<DocLink key="c" no={campaign.id} kind={campaign.name} onClick={() => navigate(sfPath(`campaigns/${campaign.id}`))} />] : []),
      ]}
      menu={(close) => (
        <>
          {s.status !== "ended" && (
            <MenuItem icon={Pencil} onClick={() => (close(), edit())}>
              Edit
            </MenuItem>
          )}
          <MenuItem icon={Copy} onClick={() => (close(), duplicate())}>
            Duplicate
          </MenuItem>
          {s.status !== "ended" && s.status !== "draft" && (
            <>
              <MenuSep />
              <MenuItem icon={Ban} danger onClick={() => (close(), setEnding(true))}>
                End scheme…
              </MenuItem>
            </>
          )}
        </>
      )}
      foot={<SfNoteFoot id={s.id} />}
    >
      {card}

      <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
        <Statline className="pt-3">
          <Stat label="Budget" value={!b ? "No limit" : b.kind === "value" ? <Amount value={b.total} currency="NPR" /> : `${npr(b.total)} units`} />
          {b && <Stat label="Used" value={<BudgetMark s={s} />} sub={figure(b.used)} />}
          {b && <Stat label="Left" value={left <= 0 ? "None" : figure(left)} danger={left <= 0} />}
          {touched.length > 0 && <Stat label="Orders" value={touched.length} />}
          {touched.length > 0 && <Stat label="Order value" value={<Amount value={touchedValue} />} />}
          {touched.length > 0 && <Stat label="Benefit given" value={<Amount value={touchedBenefit} />} />}
        </Statline>
      </div>

      <Block title="Rule">
        <p className="m-0 mb-2.5 text-[12.5px] leading-relaxed text-bz-text">{ruleText(s.mechanic)}.</p>
        <CellGrid>
          <Cell label="Mechanic">
            {mechanicLabel(s.mechanic.kind)}
            <span className="block text-[10.5px] text-bz-text-soft">{APPLIES_TEXT[s.applies]}</span>
          </Cell>
          <Cell label="Period">
            <span className={NUM}>{periodText(s.from, s.to)}</span>
          </Cell>
          <Cell label="Customer types">
            {s.typeIds.length ? (
              <span className="flex flex-col gap-1">
                {forTypes.map((t) => (
                  <TypeMark key={t.id} name={t.plural} color={t.color} className="text-[12px] text-bz-text" />
                ))}
                {missingTypes > 0 && (
                  <span className="text-[10.5px] text-bz-text-soft">
                    {missingTypes} deleted type{missingTypes > 1 ? "s" : ""}
                  </span>
                )}
              </span>
            ) : (
              "Every type"
            )}
          </Cell>
          <Cell label="Tiers">{s.tiers.length ? s.tiers.map((t) => `Tier ${t}`).join(", ") : "Every tier"}</Cell>
          <Cell label="Priority">
            <span className={NUM} title="Lower is checked first">
              {s.priority}
            </span>
          </Cell>
          <Cell label="With other schemes">
            <span title={s.exclusive ? "Schemes checked after it are skipped on that order" : "Other schemes can apply on the same order"}>{s.exclusive ? "Exclusive" : "Stacks"}</span>
          </Cell>
          <Cell label="Max per customer">{extras?.maxPerCustomer ? `${extras.maxPerCustomer} ${extras.maxPerCustomer === 1 ? "time" : "times"}` : "No limit"}</Cell>
        </CellGrid>
      </Block>

      {(s.applies === "order" || s.applies === "claim") && (
        <div className="border-b border-bz-line-soft">
          <RelatedSection rows={related} onOpen={(no) => navigate(sfPath(`${s.applies === "claim" ? "claims" : "orders"}/${no}`))} />
        </div>
      )}

      <SfActivity ids={[s.id]} />

      <ConfirmDialog
        open={ending}
        eyebrow={s.id}
        title={`End ${s.name}?`}
        body="New orders stop getting it today. Orders that already have it keep it."
        confirm="End scheme"
        danger
        onClose={() => setEnding(false)}
        onConfirm={() => {
          setEnding(false);
          setStatus(s, "ended", "ended the offer");
          ctx.show("success", `${s.id} ended`);
        }}
      />
    </RecordShell>
  );
}

/** The old edit address — the composer is now the record's edit mode on the desk. */
function SchemeEditRedirect() {
  const { no } = useParams();
  return <Navigate to={`${sfPath(`schemes/${no}`)}?do=edit`} replace />;
}

export const SCHEMES_ROUTES = [
  { path: "design/salesforce/schemes", Component: SchemesPage },
  { path: "design/salesforce/schemes/:no", Component: SchemesPage },
  { path: "design/salesforce/schemes/:no/edit", Component: SchemeEditRedirect },
];
