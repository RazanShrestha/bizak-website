import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Archive, ArrowRightLeft, Ban, CircleCheck, Copy, ListTree, Pencil, ShieldCheck, Target, Trash2, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DocLink, GHOST_SM, Kbd, MenuItem, MenuSep, NUM, Select } from "./bzw";
import { Amount, CUSTOMERS, LOCATIONS, ME, PEOPLE, TODAY, customerById, daysBetween, fmtQty, fmtShort, itemById, lineNet, locationById, personById, termById, totalsOf, useKeys } from "./orders";
import { SUBSIDIARIES, subsidiaryById } from "./master";
import { Cell, NoteFoot, ReasonDialog, WorkflowActions, useLifecycle } from "./parts";
import { ActivityList, Block, CustomerTitle, DetailsBlock, LinesTable, MoneyList, RecordSections, RecordShell, StepCard, totalsRows } from "./record";
import { DateCell, DocDesk, ExpandLines, PanelCtx } from "./DocDesk";
import {
  SalesNav,
  ESTIMATE_LABEL,
  ESTIMATE_STATUSES,
  ESTIMATE_TONE,
  Estimate,
  addEstimate,
  approveEstimate,
  attachEstimate,
  cancelEstimate,
  deleteEstimate,
  estimateNeedsMe,
  estimateStage,
  ev,
  isExpired,
  moveEstimate,
  noteEstimate,
  orderedQty,
  ordersFrom,
  rejectEstimate,
  updateEstimate,
  useSales,
} from "./flow";
import { ComposerResult, OrderComposer } from "./OrderComposer";

// ════════════════════════════════════════════════════════════════════════════
// ESTIMATES — the start of the flow
//
// An estimate is read by one question: will it become an order? The queue is
// its pipeline, and the record's next step is Convert to order, which opens
// the SAME composer as a new order pre-filled with whatever has not been
// ordered yet (one estimate can be ordered in parts). "Ordered" is never a
// button — it is what an order made from it says.
//
// Two readings sit side by side and are never merged: the rep's PIPELINE
// status and likelihood (their judgement, edited in place), and the derived
// stage (approval · open · partly ordered · ordered). Valid till is the date
// the prices stop holding — past it, the estimate says so before it converts.
// ════════════════════════════════════════════════════════════════════════════

const BASE = "/design/sales/estimates";

export function EstimatesDesk() {
  const { estimates, orders } = useSales();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const rows = React.useMemo(() => [...estimates].sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no)), [estimates]);
  const stage = (e: Estimate) => estimateStage(orders, e);
  const value = (e: Estimate) => totalsOf(e.lines).total;
  const isOpen = (e: Estimate) => ["open", "partly"].includes(stage(e));
  const weighted = rows.filter(isOpen).reduce((s, e) => s + value(e) * e.exchangeRate * (e.probability / 100), 0);

  const fields = (r: ComposerResult) => ({
    subsidiaryId: r.subsidiaryId,
    customerId: r.customerId,
    date: r.date,
    validTill: r.validTill,
    expectedClose: r.expected,
    status: r.status as Estimate["status"],
    probability: r.probability,
    repId: r.repId ?? ME.id,
    locationId: r.locationId,
    termId: r.termId,
    currency: r.currency,
    exchangeRate: r.exchangeRate,
    memo: r.memo,
    lines: r.lines,
    dims: r.dims,
    custom: r.custom,
    attachments: r.attachments,
  });

  const composeNew = (ctx: PanelCtx) => {
    const copy = search.get("copy");
    const src = copy ? estimates.find((e) => e.no === copy) : undefined;
    return (
      <OrderComposer
        key={src ? `copy-${src.no}` : "new"}
        noun="estimate"
        title={src ? `Copy of ${src.no}` : "New estimate"}
        source={src ? { no: src.no, label: "Copied from" } : undefined}
        draft={!src}
        seed={src ? { ...src, date: TODAY, validTill: null, expected: src.expectedClose, attachments: [], lines: src.lines.map((l, i) => ({ ...l, id: `ce-${i}` })) } : {}}
        primaryLabel="Create estimate"
        orders={orders}
        onCancel={(kept) => (ctx.go(src ? src.no : null), kept && ctx.show("info", "Draft kept", { label: "Resume", run: () => ctx.go("new") }))}
        onSave={(r) => {
          const discounted = r.lines.some((l) => l.discountPct > 5);
          const no = addEstimate({
            ...fields(r),
            opportunity: null,
            approval: discounted ? { state: "pending", stateName: "Manager review", approverId: ME.id, since: TODAY } : { state: "approved", byId: ME.id, on: TODAY },
            closed: null,
            cancelled: null,
          });
          if (r.notes.length) updateEstimate(no, (e) => ({ ...e, comments: r.notes }));
          ctx.go(no);
          ctx.show("success", discounted ? `${no} created · sent to Manager review` : `${no} created`);
        }}
      />
    );
  };

  return (
    <DocDesk<Estimate>
      section="sales/estimates"
      nav={<SalesNav current="estimates" />}
      noun={["estimate", "estimates"]}
      rows={rows}
      noOf={(e) => e.no}
      dateOf={(e) => e.date}
      searchText={(e) => `${e.no} ${customerById(e.customerId)?.name} ${e.status} ${e.opportunity ?? ""} ${e.lines.map((l) => itemById(l.itemId)?.name).join(" ")}`}
      stats={[
        { label: "Open value", value: <Amount value={rows.filter(isOpen).reduce((s, e) => s + value(e) * e.exchangeRate, 0)} currency="NPR" /> },
        { label: "Weighted", value: <Amount value={weighted} currency="NPR" />, title: "Open value × each estimate's likelihood" },
      ]}
      picks={[
        { key: "mine", label: "Needs you", value: rows.filter(estimateNeedsMe).length, test: estimateNeedsMe },
        { key: "expiring", label: "Expiring this week", value: rows.filter((e) => isOpen(e) && !!e.validTill && daysBetween(TODAY, e.validTill) >= 0 && daysBetween(TODAY, e.validTill) <= 7).length, test: (e) => isOpen(e) && !!e.validTill && daysBetween(TODAY, e.validTill) >= 0 && daysBetween(TODAY, e.validTill) <= 7 },
        { key: "expired", label: "Expired", value: rows.filter((e) => isOpen(e) && isExpired(e)).length, test: (e) => isOpen(e) && isExpired(e), title: "Still open, but the prices no longer hold" },
      ]}
      views={[
        {
          key: "state",
          label: "Pipeline",
          icon: ListTree,
          groups: (es) => [
            { key: "mine", label: "Needs your approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: es.filter(estimateNeedsMe) },
            { key: "approval", label: "Waiting for approval", rows: es.filter((e) => stage(e) === "approval" && !estimateNeedsMe(e)) },
            ...ESTIMATE_STATUSES.map((st) => {
              const r = es.filter((e) => stage(e) === "open" && e.status === st);
              return { key: st, label: st, rows: r, right: r.length ? <Amount value={r.reduce((s, e) => s + value(e) * e.exchangeRate, 0)} currency="NPR" /> : undefined };
            }),
            { key: "partly", label: "Partly ordered", rows: es.filter((e) => stage(e) === "partly") },
            { key: "ordered", label: "Ordered", collapsed: true, rows: es.filter((e) => stage(e) === "ordered") },
            { key: "closed", label: "Closed, rejected & cancelled", collapsed: true, rows: es.filter((e) => ["closed", "cancelled", "rejected"].includes(stage(e))) },
          ],
        },
        {
          key: "rep",
          label: "By rep",
          icon: Users,
          groups: (es) => PEOPLE.map((p) => ({ key: p.id, label: p.name, rows: es.filter((e) => e.repId === p.id) })),
        },
      ]}
      filters={[
        ...SUBSIDIARIES.map((s) => ({ value: `sub:${s.id}`, label: s.name, group: "Subsidiary", test: (e: Estimate) => e.subsidiaryId === s.id })),
        ...LOCATIONS.map((l) => ({ value: `loc:${l.id}`, label: l.name, group: "Location", test: (e: Estimate) => e.locationId === l.id })),
        ...ESTIMATE_STATUSES.map((st) => ({ value: `ps:${st}`, label: st, group: "Pipeline status", test: (e: Estimate) => e.status === st })),
        { value: "st:open", label: "Open", group: "Stage", test: (e: Estimate) => stage(e) === "open" },
        { value: "st:partly", label: "Partly ordered", group: "Stage", test: (e: Estimate) => stage(e) === "partly" },
        { value: "st:ordered", label: "Ordered", group: "Stage", test: (e: Estimate) => stage(e) === "ordered" },
        { value: "st:closed", label: "Closed or cancelled", group: "Stage", test: (e: Estimate) => ["closed", "cancelled"].includes(stage(e)) },
        { value: "ap:pending", label: "Pending approval", group: "Approval", test: (e: Estimate) => e.approval.state === "pending" },
        { value: "ap:rejected", label: "Sent back", group: "Approval", test: (e: Estimate) => e.approval.state === "rejected" },
        ...PEOPLE.map((p) => ({ value: `rep:${p.id}`, label: p.name, group: "Sales rep", test: (e: Estimate) => e.repId === p.id })),
        ...CUSTOMERS.map((c) => ({ value: `cus:${c.id}`, label: c.name, hint: c.code, group: "Customer", test: (e: Estimate) => e.customerId === c.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (e) => e.date + e.no, desc: true },
        { key: "valid", label: "Valid till", by: (e) => e.validTill ?? "9999" },
        { key: "close", label: "Expected close", by: (e) => e.expectedClose ?? "9999" },
        { key: "val", label: "Value", by: (e) => value(e) * e.exchangeRate, desc: true },
        { key: "prob", label: "Likelihood", by: (e) => e.probability, desc: true },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (e) => <DateCell iso={e.date} /> },
        { key: "valid", label: "Valid till", width: "92px", render: (e) => <ValidMark e={e} open={isOpen(e)} /> },
        { key: "rep", label: "Rep", width: "24px", render: (e) => <Avatar person={personById(e.repId)} size={20} /> },
        { key: "state", label: "Stage", width: "116px", render: (e) => <StageChip e={e} stage={stage(e)} /> },
      ]}
      primary={(e) => ({ title: customerById(e.customerId)!.name, sub: <>{e.status} · {e.probability}%</>, subOnDesktop: true })}
      amount={(e) => ({ value: <Amount value={value(e)} currency={e.currency !== "NPR" ? e.currency : undefined} />, sub: `${e.lines.length} line${e.lines.length === 1 ? "" : "s"}` })}
      rowVerb={(e) => (isOpen(e) ? { label: "Convert", icon: ArrowRightLeft, run: () => navigate(`/design/sales/orders/new?estimate=${e.no}`) } : estimateNeedsMe(e) ? { label: "Review", icon: ShieldCheck, run: () => navigate(`${BASE}/${e.no}`) } : null)}
      renderExpand={(e) => <ExpandLines rows={e.lines.map((l) => ({ name: itemById(l.itemId)!.name, note: orderedQty(orders, e, l) ? `${fmtQty(orderedQty(orders, e, l))} ordered` : undefined, qty: `${fmtQty(l.qty)} ${l.unit ?? itemById(l.itemId)!.unit}`, amount: <Amount value={lineNet(l)} /> }))} />}
      bulk={[
        {
          label: "Approve",
          icon: ShieldCheck,
          enabled: (es) => es.some(estimateNeedsMe),
          run: (es) => {
            const skipped: string[] = [];
            let done = 0;
            es.forEach((e) => (estimateNeedsMe(e) ? (approveEstimate(e.no), done++) : skipped.push(`${e.no} isn't waiting on you`)));
            return { done, skipped, verb: "approved" };
          },
        },
      ]}
      onDelete={(es) => {
        const skipped: string[] = [];
        let done = 0;
        es.forEach((e) => (ordersFrom(orders, e).length ? skipped.push(`${e.no} has orders made from it`) : (deleteEstimate(e.no), done++)));
        return { done, skipped };
      }}
      newLabel="New estimate"
      onNew={() => navigate(`${BASE}/new`)}
      renderNew={composeNew}
      renderPanel={(e, ctx) =>
        ctx.mode === "edit" ? (
          <OrderComposer
            key={`edit-${e.no}`}
            noun="estimate"
            title={`Edit ${e.no}`}
            seed={{ ...e, expected: e.expectedClose }}
            editing={{ approved: e.approval.state === "approved", baseTotal: value(e), hasProgress: ordersFrom(orders, e).length > 0 }}
            lockSubsidiary
            primaryLabel="Save changes"
            orders={orders}
            onCancel={() => ctx.go(e.no)}
            onSave={(r) => {
              const resubmit = e.approval.state === "rejected";
              updateEstimate(e.no, (x) => ({ ...x, ...fields(r), comments: [...x.comments, ...r.notes], approval: resubmit ? { state: "pending", stateName: "Manager review", approverId: ME.id, since: TODAY } : x.approval }), resubmit ? "revised it and sent it to Manager review" : "edited the estimate");
              ctx.go(e.no);
              ctx.show("success", `${e.no} saved`);
            }}
          />
        ) : (
          <EstimatePanel key={e.no} e={e} ctx={ctx} />
        )
      }
    />
  );
}

function StageChip({ e, stage }: { e: Estimate; stage: ReturnType<typeof estimateStage> }) {
  return <Chip tone={ESTIMATE_TONE[stage]}>{stage === "approval" && e.approval.state === "pending" ? e.approval.stateName : ESTIMATE_LABEL[stage]}</Chip>;
}

function ValidMark({ e, open }: { e: Estimate; open: boolean }) {
  if (!e.validTill) return <span className="text-bz-text-soft">—</span>;
  const d = daysBetween(TODAY, e.validTill);
  if (open && d < 0) return <span className="font-semibold text-bz-amber">Expired</span>;
  return <span className={cn(NUM, open && d <= 3 ? "text-bz-text" : "text-bz-text-muted")}>{d === 0 && open ? "Today" : fmtShort(e.validTill)}</span>;
}

function EstimatePanel({ e, ctx }: { e: Estimate; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const { orders } = useSales();
  const life = useLifecycle(e.no);
  const [losing, setLosing] = React.useState(false);
  const customer = customerById(e.customerId)!;
  const stage = estimateStage(orders, e);
  const made = ordersFrom(orders, e);
  const t = totalsOf(e.lines);
  const open = stage === "open" || stage === "partly";
  const expired = open && isExpired(e);
  const convert = () => navigate(`/design/sales/orders/new?estimate=${e.no}`);
  const canEdit = !e.cancelled && stage !== "ordered";

  useKeys({
    o: () => open && convert(),
    e: () => canEdit && ctx.go(e.no, { do: "edit" }),
  });

  let step: React.ReactNode;
  if (stage === "approval" && e.approval.state === "pending") {
    const me = estimateNeedsMe(e);
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        tone={me ? "plain" : "quiet"}
        title={me ? "Waiting on your approval" : `Waiting on ${personById(e.approval.approverId)?.name}`}
        sub={`${e.approval.stateName} · it can't be sent or ordered until approved.`}
        actions={me && <WorkflowActions no={e.no} stateName={e.approval.stateName} onApprove={() => (approveEstimate(e.no), ctx.show("success", `${e.no} approved`))} onReject={(r) => (rejectEstimate(e.no, r), ctx.show("info", `${e.no} sent back`))} onMove={(to) => (moveEstimate(e.no, to), ctx.show("info", `${e.no} moved to ${to}`))} />}
      />
    );
  } else if (stage === "rejected" && e.approval.state === "rejected") {
    step = (
      <StepCard
        tone="danger"
        icon={<Ban size={15} />}
        title={`Sent back by ${personById(e.approval.byId)?.name}`}
        sub={<span className="text-bz-text">“{e.approval.reason}”</span>}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => ctx.go(e.no, { do: "edit" })}>
            <Pencil size={12} /> Revise and resubmit
          </button>
        }
      />
    );
  } else if (open) {
    step = (
      <StepCard
        icon={<Target size={15} />}
        tone={expired ? "danger" : "plain"}
        title={expired ? `Expired ${fmtShort(e.validTill!)} — confirm prices before converting` : stage === "partly" ? "Partly ordered" : `Valid till ${e.validTill ? fmtShort(e.validTill) : "—"}`}
        sub={
          stage === "partly" ? (
            <>
              {e.lines.filter((l) => orderedQty(orders, e, l) < l.qty).length} line(s) not ordered yet · on {made.map((o) => o.no).join(", ")}
            </>
          ) : (
            <>
              {e.expectedClose ? <>Expected to close {fmtShort(e.expectedClose)}</> : "No close date"}
            </>
          )
        }
        actions={
          <>
            <button type="button" className={GHOST_SM} onClick={() => setLosing(true)}>
              Close as lost
            </button>
            <button type="button" className={cn(BTN, "h-8")} onClick={convert}>
              <ArrowRightLeft size={13} /> {stage === "partly" ? "Order the rest" : "Convert to order"} <Kbd>O</Kbd>
            </button>
          </>
        }
      />
    );
  } else if (stage === "ordered") {
    step = <StepCard tone="done" icon={<CircleCheck size={15} />} title={`Ordered as ${made.map((o) => o.no).join(", ")}`} />;
  } else if (e.cancelled) {
    step = <StepCard tone="quiet" icon={<Ban size={15} />} title={`Cancelled · ${fmtShort(e.cancelled.on)}`} sub={`“${e.cancelled.reason}”`} />;
  } else if (e.closed) {
    step = <StepCard tone="quiet" icon={<Archive size={15} />} title={`Closed as lost · ${fmtShort(e.closed.on)}`} sub={`“${e.closed.reason}”`} />;
  } else {
    step = <StepCard tone="quiet" icon={<Archive size={15} />} title={ESTIMATE_LABEL[stage]} />;
  }

  return (
    <RecordShell
      ctx={ctx}
      no={e.no}
      printNo={e.no}
      chips={<StageChip e={e} stage={stage} />}
      title={<CustomerTitle name={customer.name} onOpen={() => ctx.show("info", `Opens ${customer.name}'s customer record`)} />}
      amount={<Amount value={t.total} currency={e.currency} />}
      meta={[
        <span key="d" className={NUM}>{fmtShort(e.date)}</span>,
        <span key="r" className="inline-flex items-center gap-1.5">
          <Avatar person={personById(e.repId)} size={16} /> {personById(e.repId)?.name}
        </span>,
        <span key="s">{subsidiaryById(e.subsidiaryId).name}</span>,
        e.opportunity ? <DocLink key="o" no={e.opportunity} kind="Opportunity" onClick={() => ctx.show("info", `${e.opportunity} opens in CRM`)} /> : null,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={ArrowRightLeft} kbd="O" disabled={!open} onClick={() => (close(), convert())}>
            Convert to order
          </MenuItem>
          <MenuItem icon={Pencil} kbd="E" disabled={!canEdit} onClick={() => (close(), ctx.go(e.no, { do: "edit" }))}>
            Edit estimate
          </MenuItem>
          <MenuItem icon={Copy} onClick={() => (close(), navigate(`${BASE}/new?copy=${e.no}`))}>
            Copy to new estimate
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Archive} disabled={!open} onClick={() => (close(), setLosing(true))}>
            Close as lost…
          </MenuItem>
          <MenuItem icon={Ban} disabled={!!e.cancelled || made.length > 0} hint={made.length ? "Has orders — close it instead" : undefined} onClick={() => (close(), life.open("cancel"))}>
            Cancel estimate…
          </MenuItem>
          <MenuItem icon={Trash2} danger disabled={made.length > 0} onClick={() => (close(), life.open("delete"))}>
            Delete estimate…
          </MenuItem>
        </>
      )}
      foot={<NoteFoot onSend={(n) => noteEstimate(e.no, n)} />}
    >
      {step}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-bz-line-soft px-5 py-3 text-[11.5px]">
        <span className="inline-flex items-center gap-1.5 text-bz-text-soft">
          Pipeline
          <Select trigger="ghost" className="h-7" label={e.status} value={e.status} disabled={!open} onChange={(v) => (updateEstimate(e.no, (x) => ({ ...x, status: v as Estimate["status"] }), `moved it to ${v}`), ctx.show("success", `Pipeline: ${v}`))} width={230} options={ESTIMATE_STATUSES.map((s) => ({ value: s, label: s }))} />
        </span>
        <span className="inline-flex items-center gap-1.5 text-bz-text-soft">
          Likelihood
          <Select trigger="ghost" className={cn("h-7", NUM)} label={`${e.probability}%`} value={String(e.probability)} disabled={!open} onChange={(v) => updateEstimate(e.no, (x) => ({ ...x, probability: Number(v) }), `set likelihood to ${v}%`)} width={120} options={[10, 25, 50, 60, 70, 80, 90, 100].map((p) => ({ value: String(p), label: `${p}%` }))} />
        </span>
        <span className="text-bz-text-soft">
          Weighted <Amount value={t.total * (e.probability / 100)} className="font-semibold text-bz-text" />
        </span>
      </div>

      <Block title="Lines" count={e.lines.length}>
        <LinesTable
          rows={e.lines.map((l) => {
            const o = orderedQty(orders, e, l);
            return { line: l, qty: l.qty, sub: made.length ? (o >= l.qty ? "ordered" : o > 0 ? `${fmtQty(o)} of ${fmtQty(l.qty)} ordered` : "not ordered") : undefined };
          })}
        />
        <MoneyList rows={totalsRows(t, { currency: e.currency, exchangeRate: e.exchangeRate })} />
      </Block>

      <DetailsBlock
        subsidiaryId={e.subsidiaryId}
        currency={e.currency}
        exchangeRate={e.exchangeRate}
        dates={[
          ["Estimate date", e.date],
          ["Valid till", e.validTill],
          ["Expected close", e.expectedClose],
        ]}
        custom={e.custom}
        dims={e.dims}
        memo={e.memo}
        right={
          canEdit && (
            <button type="button" className={GHOST_SM} onClick={() => ctx.go(e.no, { do: "edit" })}>
              <Pencil size={11} /> Edit <Kbd>E</Kbd>
            </button>
          )
        }
        lead={
          <>
            <Cell label="Customer">
              {customer.name}
              <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
                {customer.isProspect ? "Prospect" : `${customer.code} · PAN ${customer.pan}`} · {customer.priceLevel} prices
              </span>
            </Cell>
            <Cell label="Payment term">{termById(e.termId)?.name}</Cell>
            <Cell label="Would ship from">{locationById(e.locationId)?.name}</Cell>
            <Cell label="Opportunity">{e.opportunity ?? <span className="text-bz-text-soft">—</span>}</Cell>
          </>
        }
      />

      <RecordSections no={e.no} files={e.attachments} onAttach={() => (attachEstimate(e.no), ctx.show("success", "File added"))} onToast={(x) => ctx.show("info", x)} created={e.created} history={e.history} audit={e.audit} />
      <ActivityList comments={e.comments} history={e.history} />

      <ReasonDialog
        open={losing}
        eyebrow={e.no}
        title={`Close ${e.no} as lost?`}
        body="The reason feeds the pipeline report."
        confirm="Close as lost"
        danger
        onClose={() => setLosing(false)}
        onConfirm={(r) => (setLosing(false), updateEstimate(e.no, (x) => ({ ...x, closed: { reason: r, on: TODAY }, probability: 0 }), `closed it as lost — “${r}”`), ctx.show("info", `${e.no} closed`))}
      />
      {life.dialogs({
        onCancel: (r) => (cancelEstimate(e.no, r), ctx.show("info", `${e.no} cancelled`)),
        onDelete: () => (deleteEstimate(e.no), ctx.go(null), ctx.show("info", `${e.no} deleted`)),
      })}
    </RecordShell>
  );
}

export { ev };
