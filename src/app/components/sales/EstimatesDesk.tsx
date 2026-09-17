import * as React from "react";
import { useNavigate } from "react-router";
import { Archive, ArrowRightLeft, CircleCheck, FileText, ListTree, Pencil, ShieldCheck, Target } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DANGER_BTN, GHOST_SM, Kbd, MenuItem, NUM, Refusal, TEXTAREA } from "./bzw";
import { Amount, ME, TODAY, customerById, daysBetween, fmtQty, fmtShort, locationById, personById, stageLabel, STAGE_TONE, termById, totalsOf } from "./orders";
import { Block, Cell, DocRow } from "./OrderPanel";
import { DocDesk, PanelCtx } from "./DocDesk";
import { ActivityList, CommentFoot, LinesTable, MoneyList, RecordShell, StepCard } from "./record";
import { ESTIMATE_LABEL, ESTIMATE_TONE, Estimate, addEstimate, estimateNeedsMe, estimateStage, hrefFor, orderedQty, ordersFrom, stamp, updateEstimate, useSales } from "./flow";
import { OrderComposer } from "./OrderComposer";

// ════════════════════════════════════════════════════════════════════════════
// ESTIMATES — the start of the flow
//
// An estimate is read by one question: will it become an order? So the queue
// is open → partly ordered → ordered → closed, and the record's next step is
// Convert to order, which opens the SAME composer as a new order pre-filled
// with whatever has not been ordered yet (one estimate can be ordered in
// parts). "Ordered" is never a button — it is what an order made from it says.
// There is no expiry: Bizak stores none, so none is drawn.
// ════════════════════════════════════════════════════════════════════════════

export function EstimatesDesk() {
  const { estimates, orders } = useSales();
  const navigate = useNavigate();
  const rows = React.useMemo(() => [...estimates].sort((a, b) => b.date.localeCompare(a.date)), [estimates]);
  const stage = (e: Estimate) => estimateStage(orders, e);
  const value = (e: Estimate) => totalsOf(e.lines).total;
  const isOpen = (e: Estimate) => ["open", "partly"].includes(stage(e));

  return (
    <DocDesk<Estimate>
      section="estimates"
      rows={rows}
      noOf={(e) => e.no}
      customerOf={(e) => e.customerId}
      searchText={(e) => `${e.no} ${customerById(e.customerId)?.name}`}
      stats={[{ label: "Open value", value: <Amount value={rows.filter(isOpen).reduce((s, e) => s + value(e) * (customerById(e.customerId)?.currency === "USD" ? 133.42 : 1), 0)} currency="NPR" /> }]}
      picks={[
        { key: "mine", label: "Needs you", value: rows.filter(estimateNeedsMe).length, test: estimateNeedsMe },
        { key: "closing", label: "Closing this week", value: rows.filter((e) => isOpen(e) && e.expectedClose && daysBetween(TODAY, e.expectedClose) <= 7).length, test: (e) => isOpen(e) && !!e.expectedClose && daysBetween(TODAY, e.expectedClose) <= 7 },
      ]}
      views={[
        {
          key: "state",
          label: "Pipeline",
          icon: ListTree,
          groups: (es) => [
            { key: "mine", label: "Needs your approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: es.filter(estimateNeedsMe) },
            { key: "approval", label: "Waiting for approval", rows: es.filter((e) => stage(e) === "approval" && !estimateNeedsMe(e)) },
            { key: "open", label: "In discussion", rows: es.filter((e) => stage(e) === "open").sort((a, b) => (a.expectedClose ?? "").localeCompare(b.expectedClose ?? "")), right: <Amount value={es.filter((e) => stage(e) === "open").reduce((s, e) => s + value(e), 0)} currency="NPR" /> },
            { key: "partly", label: "Partly ordered", rows: es.filter((e) => stage(e) === "partly") },
            { key: "ordered", label: "Ordered", collapsed: true, rows: es.filter((e) => stage(e) === "ordered") },
            { key: "closed", label: "Closed & rejected", collapsed: true, rows: es.filter((e) => ["closed", "cancelled", "rejected"].includes(stage(e))) },
          ],
        },
      ]}
      columns={[
        { key: "close", label: "Expected close", width: "110px", render: (e) => <CloseMark e={e} open={isOpen(e)} /> },
        { key: "rep", label: "Rep", width: "28px", render: (e) => <Avatar person={personById(e.repId)} size={20} /> },
        { key: "state", label: "Status", width: "124px", render: (e) => <Chip tone={ESTIMATE_TONE[stage(e)]}>{stage(e) === "approval" && e.approval.state === "pending" ? e.approval.stateName : ESTIMATE_LABEL[stage(e)]}</Chip> },
      ]}
      primary={(e) => ({ title: customerById(e.customerId)!.name, sub: <CloseMark e={e} open={isOpen(e)} /> })}
      amount={(e) => ({ value: <Amount value={value(e)} currency={customerById(e.customerId)?.currency !== "NPR" ? customerById(e.customerId)?.currency : undefined} />, sub: `${e.lines.length} line${e.lines.length === 1 ? "" : "s"}` })}
      rowVerb={(e) => (isOpen(e) ? { label: "Convert", icon: ArrowRightLeft, run: () => navigate(`/design/sales/orders/new?estimate=${e.no}`) } : null)}
      newLabel="New estimate"
      onNew={() => navigate("/design/sales/estimates/new")}
      renderNew={(ctx) => (
        <OrderComposer
          mode={{ kind: "new" }}
          noun="estimate"
          orders={orders}
          onCancel={() => ctx.go(null)}
          onSave={(d) => {
            const no = addEstimate({
              customerId: d.customerId,
              date: TODAY,
              expectedClose: d.expected,
              repId: d.repId ?? ME.id,
              locationId: d.locationId,
              termId: d.termId,
              memo: d.memo,
              probability: 50,
              lines: d.lines,
              approval: { state: "approved", byId: ME.id, on: TODAY },
              closed: null,
              cancelled: null,
            });
            ctx.go(no);
            ctx.show("success", `${no} created`);
          }}
        />
      )}
      renderPanel={(e, ctx) => <EstimatePanel key={e.no} e={e} ctx={ctx} />}
    />
  );
}

function CloseMark({ e, open }: { e: Estimate; open: boolean }) {
  if (!e.expectedClose) return <span className="text-bz-text-soft">No close date</span>;
  const d = daysBetween(TODAY, e.expectedClose);
  if (open && d < 0) return <span className="font-semibold text-bz-amber">{-d}d past close date</span>;
  return <span className={cn(NUM, open ? "text-bz-text-muted" : "text-bz-text-soft")}>Close {fmtShort(e.expectedClose)}</span>;
}

function EstimatePanel({ e, ctx }: { e: Estimate; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const { orders } = useSales();
  const customer = customerById(e.customerId)!;
  const stage = estimateStage(orders, e);
  const made = ordersFrom(orders, e);
  const t = totalsOf(e.lines);
  const [closing, setClosing] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const convert = () => navigate(`/design/sales/orders/new?estimate=${e.no}`);

  let step: React.ReactNode;
  if (stage === "approval" && e.approval.state === "pending") {
    const me = estimateNeedsMe(e);
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        title={me ? "Waiting on your approval" : `Waiting on ${personById(e.approval.approverId)?.name}`}
        sub={`${e.approval.stateName} · it can't be sent or ordered until approved.`}
        tone={me ? "plain" : "quiet"}
        actions={
          me && (
            <>
              <button type="button" className={GHOST_SM} onClick={() => (updateEstimate(e.no, (x) => ({ ...x, approval: { state: "rejected", byId: ME.id, on: TODAY, reason: "Re-quote needed." } }), "rejected it"), ctx.show("info", `${e.no} sent back`))}>
                Reject
              </button>
              <button type="button" className={cn(BTN, "h-8")} onClick={() => (updateEstimate(e.no, (x) => ({ ...x, approval: { state: "approved", byId: ME.id, on: TODAY } }), "approved it"), ctx.show("success", `${e.no} approved`))}>
                Approve
              </button>
            </>
          )
        }
      />
    );
  } else if (stage === "open" || stage === "partly") {
    step = (
      <StepCard
        icon={<Target size={15} />}
        title={stage === "partly" ? "Partly ordered" : "In discussion"}
        sub={
          stage === "partly" ? (
            <>{e.lines.filter((l) => orderedQty(orders, e, l) < l.qty).length} line(s) not ordered yet · on {made.map((o) => o.no).join(", ")}</>
          ) : (
            <>{e.probability}% likely{e.expectedClose && <> · close {fmtShort(e.expectedClose)}</>}</>
          )
        }
        actions={
          !closing && (
            <>
              <button type="button" className={GHOST_SM} onClick={() => setClosing(true)}>
                Close as lost
              </button>
              <button type="button" className={cn(BTN, "h-8")} onClick={convert}>
                <ArrowRightLeft size={13} /> {stage === "partly" ? "Order the rest" : "Convert to order"} <Kbd>O</Kbd>
              </button>
            </>
          )
        }
      >
        {closing && (
          <div className="mt-1 flex flex-col gap-2">
            <textarea autoFocus value={reason} onChange={(x) => setReason(x.target.value)} placeholder="Why was it lost?" className={cn(TEXTAREA, "min-h-[56px] bg-bz-surface")} />
            {refusal && <Refusal text={refusal} onDismiss={() => setRefusal(null)} />}
            <div className="flex justify-end gap-2">
              <button type="button" className={GHOST_SM} onClick={() => setClosing(false)}>
                Back
              </button>
              <button
                type="button"
                className={cn(DANGER_BTN, "h-8")}
                onClick={() => {
                  if (!reason.trim()) return setRefusal("Say why, so the pipeline report means something.");
                  updateEstimate(e.no, (x) => ({ ...x, closed: { reason: reason.trim(), on: TODAY }, probability: 0 }), `closed it — “${reason.trim()}”`);
                  ctx.show("info", `${e.no} closed`);
                }}
              >
                Close estimate
              </button>
            </div>
          </div>
        )}
      </StepCard>
    );
  } else if (stage === "ordered") {
    step = <StepCard icon={<CircleCheck size={15} />} tone="done" title={`Ordered as ${made.map((o) => o.no).join(", ")}`} />;
  } else if (e.closed) {
    step = <StepCard icon={<Archive size={15} />} tone="quiet" title={`Closed · ${fmtShort(e.closed.on)}`} sub={`“${e.closed.reason}”`} />;
  } else {
    step = <StepCard icon={<Archive size={15} />} tone="quiet" title={ESTIMATE_LABEL[stage]} />;
  }

  React.useEffect(() => {
    const on = (x: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && ["INPUT", "TEXTAREA"].includes(el.tagName)) return;
      if (x.key.toLowerCase() === "o" && (stage === "open" || stage === "partly")) convert();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });

  return (
    <RecordShell
      ctx={ctx}
      no={e.no}
      chips={<Chip tone={ESTIMATE_TONE[stage]}>{stage === "approval" && e.approval.state === "pending" ? e.approval.stateName : ESTIMATE_LABEL[stage]}</Chip>}
      title={customer.name}
      amount={<Amount value={t.total} currency={customer.currency} />}
      meta={[
        <span key="d" className={NUM}>{fmtShort(e.date)}</span>,
        <span key="r" className="inline-flex items-center gap-1.5"><Avatar person={personById(e.repId)} size={16} /> {personById(e.repId)?.name}</span>,
        e.expectedClose ? <span key="c">Close {fmtShort(e.expectedClose)}</span> : null,
      ].filter(Boolean) as React.ReactNode[]}
      onPrint={() => ctx.show("info", `Preparing ${e.no} for print…`)}
      menu={(close) => (
        <>
          <MenuItem icon={ArrowRightLeft} disabled={!(stage === "open" || stage === "partly")} onClick={() => (close(), convert())}>
            Convert to order
          </MenuItem>
          <MenuItem icon={Pencil} onClick={() => (close(), ctx.show("info", "Edits in the same composer as orders."))}>
            Edit estimate
          </MenuItem>
          <MenuItem icon={Archive} disabled={!(stage === "open" || stage === "partly")} onClick={() => (close(), setClosing(true))}>
            Close as lost
          </MenuItem>
        </>
      )}
      foot={<CommentFoot onSend={(body) => updateEstimate(e.no, (x) => ({ ...x, comments: [...x.comments, { id: `c${Date.now()}`, authorId: ME.id, when: stamp(), body }] }))} />}
    >
      {step}
      <Block title="Lines" count={e.lines.length}>
        <LinesTable
          rows={e.lines.map((l) => {
            const o = orderedQty(orders, e, l);
            return { line: l, qty: l.qty, sub: made.length ? (o >= l.qty ? "ordered" : o > 0 ? `${fmtQty(o)} of ${fmtQty(l.qty)} ordered` : "not ordered") : undefined };
          })}
        />
        <MoneyList
          rows={[
            { label: "Subtotal", value: <Amount value={t.subtotal} /> },
            ...(t.discount > 0 ? [{ label: "Discount", value: <>−<Amount value={t.discount} /></> }] : []),
            { label: "VAT 13%", value: <Amount value={t.tax} /> },
            { label: "Total", value: <Amount value={t.total} currency={customer.currency} />, strong: true },
          ]}
        />
      </Block>
      {made.length > 0 && (
        <Block title="Orders" count={made.length}>
          <div className="flex flex-col gap-1.5">
            {made.map((o) => (
              <DocRow key={o.no} icon={FileText} no={o.no} kind="Order" meta={<span className={NUM}>{fmtShort(o.date)} · <Amount value={totalsOf(o.lines).total} /></span>} chip={<Chip tone={STAGE_TONE[stageOfSafe(o)]}>{stageLabel(o)}</Chip>} onClick={() => navigate(hrefFor(o.no))} />
            ))}
          </div>
        </Block>
      )}
      <Block title="Details">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-line-soft sm:grid-cols-2">
          <Cell label="Customer">
            {customer.name}
            <span className="block text-[10.5px] text-bz-text-soft">{customer.code} · {customer.priceLevel} prices</span>
          </Cell>
          <Cell label="Likelihood">{e.probability}%</Cell>
          <Cell label="Payment term">{termById(e.termId)?.name}</Cell>
          <Cell label="Would ship from">{locationById(e.locationId)?.name}</Cell>
          {e.memo && <Cell label="Memo" wide>{e.memo}</Cell>}
        </div>
      </Block>
      <ActivityList comments={e.comments} history={e.history} />
    </RecordShell>
  );
}

import { stageOf } from "./orders";
const stageOfSafe = stageOf;
