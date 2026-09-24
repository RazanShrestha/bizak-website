import * as React from "react";
import { useNavigate } from "react-router";
import { Ban, CircleCheck, ListTree, PackageCheck, Pencil, Printer, ReceiptText, ShieldCheck, Trash2, Truck, Warehouse } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DocLink, MenuItem, MenuSep, NUM } from "./bzw";
import { Amount, CUSTOMERS, LOCATIONS, ME, TODAY, daysBetween, fmtQty, fmtShort, itemById, lineGross, locationById, personById, readyToInvoice, useKeys } from "./orders";
import { SUBSIDIARIES, subsidiaryById } from "./master";
import { Cell, NoteFoot, WorkflowActions, useLifecycle } from "./parts";
import { ActivityList, Block, CustomerTitle, DetailsBlock, LinesTable, MoneyList, RecordSections, RecordShell, StepCard } from "./record";
import { DateCell, DocDesk, ExpandLines, PanelCtx } from "./DocDesk";
import { SalesNav, DocRef, approveChildDoc, attachChildDoc, cancelChildDoc, deleteChildDoc, docLines, docStatus, noteChildDoc, rejectChildDoc, replaceChildDoc, useSales } from "./flow";
import { DeliverySheet, pendingOn, unitsLabel } from "./FulfilSheet";
import { glDelivery } from "./gl";

// ════════════════════════════════════════════════════════════════════════════
// DELIVERIES — what left, or is waiting to leave, the warehouse
//
// A delivery is created from its order (the order's Deliver step), so this
// desk has no blank composer: "Deliver an order" goes to the orders waiting to
// ship. What happens HERE is approval — the moment stock actually moves and
// the order counts the units — the hand-off to invoicing, and corrections
// (edit, cancel — which puts the stock back — or delete while pending).
//
// No dispatch status is drawn: CHALLAN stores the driver and the vehicle, not
// whether it has left the gate.
// ════════════════════════════════════════════════════════════════════════════

const valueOf = (r: DocRef) => docLines(r).reduce((s, x) => s + lineGross({ ...x.line, qty: x.qty, discountAmt: x.line.discountAmt ? (x.line.discountAmt * x.qty) / x.line.qty : undefined }), 0);
const units = (r: DocRef) => unitsLabel(docLines(r).map((x) => ({ unit: x.line.unit ?? itemById(x.line.itemId)!.unit, qty: x.qty })));

export function DeliveriesDesk() {
  const { deliveries } = useSales();
  const navigate = useNavigate();
  const rows = React.useMemo(() => [...deliveries].sort((a, b) => b.doc.date.localeCompare(a.doc.date) || b.doc.no.localeCompare(a.doc.no)), [deliveries]);
  const live = (r: DocRef) => !r.doc.cancelled;
  const pending = (r: DocRef) => live(r) && r.doc.state === "pending" && !r.doc.rejected;
  const pendingMine = (r: DocRef) => pending(r) && r.doc.approverId === ME.id;
  const billable = (r: DocRef) => live(r) && r.doc.state === "approved" && r.order.lines.some((l) => readyToInvoice(l) - pendingOn(r.order, l, "invoice") > 0);
  const where = (r: DocRef) => r.doc.locationId ?? r.order.locationId;

  return (
    <DocDesk<DocRef>
      section="sales/deliveries"
      nav={<SalesNav current="deliveries" />}
      noun={["delivery", "deliveries"]}
      rows={rows}
      noOf={(r) => r.doc.no}
      dateOf={(r) => r.doc.date}
      searchText={(r) => `${r.doc.no} ${r.order.no} ${r.customer.name} ${r.doc.truck ?? ""} ${r.doc.driver ?? ""} ${docLines(r).map((x) => itemById(x.line.itemId)?.name).join(" ")}`}
      stats={[{ label: "Delivered · 7 days", value: rows.filter((r) => live(r) && r.doc.state === "approved" && daysBetween(r.doc.date, TODAY) <= 7).length }]}
      picks={[
        { key: "mine", label: "Needs you", value: rows.filter(pendingMine).length, test: pendingMine },
        { key: "bill", label: "Not invoiced", value: rows.filter(billable).length, test: billable, title: "Its order has delivered units not yet billed" },
      ]}
      views={[
        {
          key: "state",
          label: "By state",
          icon: ListTree,
          groups: (rs) => [
            { key: "mine", label: "Needs your approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: rs.filter(pendingMine) },
            { key: "pending", label: "Waiting for approval", rows: rs.filter((r) => pending(r) && !pendingMine(r)) },
            { key: "rejected", label: "Sent back", rows: rs.filter((r) => live(r) && !!r.doc.rejected) },
            { key: "week", label: "Delivered this week", rows: rs.filter((r) => live(r) && r.doc.state === "approved" && daysBetween(r.doc.date, TODAY) <= 7) },
            { key: "earlier", label: "Earlier", collapsed: true, rows: rs.filter((r) => live(r) && r.doc.state === "approved" && daysBetween(r.doc.date, TODAY) > 7) },
            { key: "cancelled", label: "Cancelled", collapsed: true, rows: rs.filter((r) => !live(r)) },
          ],
        },
        {
          key: "where",
          label: "By warehouse",
          icon: Warehouse,
          groups: (rs) => LOCATIONS.map((l) => ({ key: l.id, label: l.name, rows: rs.filter((r) => where(r) === l.id) })),
        },
      ]}
      filters={[
        ...SUBSIDIARIES.map((s) => ({ value: `sub:${s.id}`, label: s.name, group: "Subsidiary", test: (r: DocRef) => r.order.subsidiaryId === s.id })),
        ...LOCATIONS.map((l) => ({ value: `loc:${l.id}`, label: l.name, group: "Delivered from", test: (r: DocRef) => where(r) === l.id })),
        { value: "st:pending", label: "Awaiting approval", group: "Status", test: pending },
        { value: "st:approved", label: "Approved", group: "Status", test: (r: DocRef) => live(r) && r.doc.state === "approved" },
        { value: "st:rejected", label: "Sent back", group: "Status", test: (r: DocRef) => !!r.doc.rejected },
        { value: "st:cancelled", label: "Cancelled", group: "Status", test: (r: DocRef) => !live(r) },
        { value: "bi:open", label: "Not invoiced", group: "Billing", test: billable },
        ...CUSTOMERS.map((c) => ({ value: `cus:${c.id}`, label: c.name, hint: c.code, group: "Customer", test: (r: DocRef) => r.order.customerId === c.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (r) => r.doc.date + r.doc.no, desc: true },
        { key: "old", label: "Oldest", by: (r) => r.doc.date + r.doc.no },
        { key: "val", label: "Value", by: valueOf, desc: true },
        { key: "cus", label: "Customer", by: (r) => r.customer.name },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (r) => <DateCell iso={r.doc.date} /> },
        { key: "order", label: "Order", width: "72px", render: (r) => <span className={NUM}>{r.order.no}</span> },
        { key: "from", label: "From", width: "104px", render: (r) => locationById(where(r))?.name },
        { key: "state", label: "Status", width: "124px", render: (r) => { const s = docStatus(r.doc); return <Chip tone={s.tone}>{s.label}</Chip>; } },
      ]}
      primary={(r) => ({ title: r.customer.name, sub: units(r), subOnDesktop: true })}
      amount={(r) => ({ value: <Amount value={valueOf(r)} />, sub: `${r.doc.lines.length} line${r.doc.lines.length === 1 ? "" : "s"}` })}
      rowVerb={(r) =>
        pendingMine(r)
          ? { label: "Approve", icon: PackageCheck, run: () => approveChildDoc(r.order.no, r.doc.no) }
          : billable(r)
            ? { label: "Invoice", icon: ReceiptText, run: () => navigate(`/design/sales/orders/${r.order.no}?do=invoice`) }
            : null
      }
      renderExpand={(r) => (
        <ExpandLines
          rows={docLines(r).map((x) => {
            const b = r.doc.batches?.filter((y) => y.lineId === x.lineId).map((y) => y.batch);
            const s = r.doc.serials?.find((y) => y.lineId === x.lineId)?.serials;
            return { name: itemById(x.line.itemId)!.name, note: b?.length ? `Batch ${b.join(", ")}` : s?.length ? `${s.length} serials` : undefined, qty: `${fmtQty(x.qty)} ${x.line.unit ?? itemById(x.line.itemId)!.unit}`, amount: <Amount value={lineGross({ ...x.line, qty: x.qty })} /> };
          })}
        />
      )}
      bulk={[
        {
          label: "Approve",
          icon: PackageCheck,
          enabled: (rs) => rs.some(pendingMine),
          run: (rs) => {
            const skipped: string[] = [];
            let done = 0;
            rs.forEach((r) => (pendingMine(r) ? (approveChildDoc(r.order.no, r.doc.no), done++) : skipped.push(`${r.doc.no} isn't waiting on you`)));
            return { done, skipped, verb: "approved" };
          },
        },
        { label: "Print notes", icon: Printer, enabled: () => true, run: (rs) => ({ done: rs.length, skipped: [], verb: "sent to the printer" }) },
      ]}
      onDelete={(rs) => {
        const skipped: string[] = [];
        let done = 0;
        rs.forEach((r) => (r.doc.state === "approved" && !r.doc.cancelled ? skipped.push(`${r.doc.no} has moved stock — cancel it instead`) : (deleteChildDoc(r.order.no, r.doc.no), done++)));
        return { done, skipped };
      }}
      newLabel="Deliver an order"
      onNew={() => navigate("/design/sales/orders?pick=deliver")}
      renderPanel={(r, ctx) => <DeliveryPanel key={r.doc.no} r={r} ctx={ctx} />}
    />
  );
}

function DeliveryPanel({ r, ctx }: { r: DocRef; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const life = useLifecycle(r.doc.no);
  const lines = docLines(r);
  const loc = locationById(r.doc.locationId ?? r.order.locationId)?.name;
  const invoices = r.order.docs.filter((d) => d.kind === "invoice" && !d.cancelled);
  const billable = !r.doc.cancelled && r.doc.state === "approved" && r.order.lines.some((l) => readyToInvoice(l) - pendingOn(r.order, l, "invoice") > 0);
  const mine = !r.doc.cancelled && !r.doc.rejected && r.doc.state === "pending" && r.doc.approverId === ME.id;
  const status = docStatus(r.doc);
  const canEdit = !r.doc.cancelled && invoices.length === 0;
  const counted = r.doc.state === "approved" && !r.doc.cancelled;
  const history = r.order.history.filter((h) => h.what.includes(r.doc.no));

  useKeys({ e: () => ctx.mode !== "edit" && canEdit && ctx.go(r.doc.no, { do: "edit" }) });

  if (ctx.mode === "edit")
    return (
      <RecordShell ctx={ctx} no={r.doc.no} back={{ label: r.doc.no, onClick: () => ctx.go(r.doc.no) }} title={`Edit ${r.doc.no}`} meta={[<span key="c">{r.customer.name}</span>, <span key="o">{r.order.no}</span>]}>
        <div className="flex h-full min-h-0 flex-col">
          <DeliverySheet order={r.order} existing={r.doc} onCancel={() => ctx.go(r.doc.no)} onCommit={(p) => (replaceChildDoc(r.order.no, r.doc.no, p), ctx.go(r.doc.no), ctx.show("success", `${r.doc.no} saved`))} />
        </div>
      </RecordShell>
    );

  let step: React.ReactNode;
  if (r.doc.cancelled) step = <StepCard tone="quiet" icon={<Ban size={15} />} title={`Cancelled · ${fmtShort(r.doc.cancelled.on)}`} sub={`“${r.doc.cancelled.reason}” · the stock went back to ${loc}.`} />;
  else if (r.doc.rejected)
    step = (
      <StepCard
        tone="danger"
        icon={<Ban size={15} />}
        title={`Sent back by ${personById(r.doc.rejected.byId)?.name}`}
        sub={<span className="text-bz-text">“{r.doc.rejected.reason}”</span>}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => ctx.go(r.doc.no, { do: "edit" })}>
            <Pencil size={12} /> Revise and resubmit
          </button>
        }
      />
    );
  else if (r.doc.state === "pending")
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        tone={mine ? "plain" : "quiet"}
        title={mine ? "Waiting on your approval" : <span className="inline-flex items-center gap-1.5">Waiting on <Avatar person={personById(r.doc.approverId ?? "")} size={16} /> {personById(r.doc.approverId ?? "")?.name}</span>}
        sub={`Stock leaves ${loc} and counts on ${r.order.no} when it is released.`}
        actions={mine && <WorkflowActions no={r.doc.no} stateName="Dispatch approval" onApprove={() => (approveChildDoc(r.order.no, r.doc.no), ctx.show("success", `${r.doc.no} released · stock moved`))} onReject={(x) => (rejectChildDoc(r.order.no, r.doc.no, x), ctx.show("info", `${r.doc.no} sent back`))} />}
      />
    );
  else if (billable)
    step = (
      <StepCard
        icon={<ReceiptText size={15} />}
        title="Ready to invoice"
        sub={`Billed against ${r.order.no}'s lines, so the order and this delivery stay in step.`}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => navigate(`/design/sales/orders/${r.order.no}?do=invoice`)}>
            <ReceiptText size={13} /> Invoice
          </button>
        }
      />
    );
  else step = <StepCard tone="done" icon={<CircleCheck size={15} />} title="Delivered and invoiced" sub={`Everything delivered on ${r.order.no} is billed.`} />;

  return (
    <RecordShell
      ctx={ctx}
      no={r.doc.no}
      printNo={r.doc.no}
      chips={<Chip tone={status.tone}>{status.label}</Chip>}
      title={<CustomerTitle name={r.customer.name} onOpen={() => ctx.show("info", `Opens ${r.customer.name}'s customer record`)} />}
      amount={<span className="text-[13px] font-medium text-bz-text-muted">{units(r)}</span>}
      meta={[
        <span key="d" className={NUM}>{fmtShort(r.doc.date)}</span>,
        <span key="l">from {loc}</span>,
        <span key="s">{subsidiaryById(r.order.subsidiaryId).name}</span>,
        <DocLink key="o" no={r.order.no} kind="Order" onClick={() => navigate(`/design/sales/orders/${r.order.no}`)} />,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={ReceiptText} disabled={!billable} onClick={() => (close(), navigate(`/design/sales/orders/${r.order.no}?do=invoice`))}>
            Invoice the order
          </MenuItem>
          <MenuItem icon={Pencil} kbd="E" disabled={!canEdit} hint={!canEdit && !r.doc.cancelled ? "Already invoiced against its order" : undefined} onClick={() => (close(), ctx.go(r.doc.no, { do: "edit" }))}>
            Edit delivery
          </MenuItem>
          <MenuItem icon={Truck} onClick={() => (close(), navigate(`/design/sales/orders/${r.order.no}?do=deliver`))}>
            Deliver more from {r.order.no}
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Ban} disabled={!!r.doc.cancelled} onClick={() => (close(), life.open("cancel"))}>
            Cancel delivery…
          </MenuItem>
          <MenuItem icon={Trash2} danger disabled={counted} hint={counted ? "Stock has moved — cancel it instead" : undefined} onClick={() => (close(), life.open("delete"))}>
            Delete delivery…
          </MenuItem>
        </>
      )}
      foot={<NoteFoot onSend={(n) => noteChildDoc(r.order.no, r.doc.no, n)} />}
    >
      {step}

      <Block title="Lines" count={lines.length}>
        <LinesTable
          qtyLabel="Delivered"
          rows={lines.map((x) => {
            const b = r.doc.batches?.filter((y) => y.lineId === x.lineId) ?? [];
            const loose = r.doc.serials?.find((y) => y.lineId === x.lineId && !y.batch)?.serials ?? [];
            const serialsOf = (batch: string) => r.doc.serials?.find((y) => y.lineId === x.lineId && y.batch === batch)?.serials ?? [];
            return {
              line: x.line,
              qty: x.qty,
              sub: `${fmtQty(x.line.qty)} ordered`,
              detail:
                b.length || loose.length ? (
                  <div className={cn("flex flex-wrap gap-1.5 text-[10.5px] text-bz-text-muted", NUM)}>
                    {b.map((y) => {
                      const sn = serialsOf(y.batch);
                      return (
                        <span key={y.batch} className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-px" title={sn.length ? sn.join(", ") : undefined}>
                          {y.batch} · {fmtQty(y.qty)}
                          {y.expiry && <span className="text-bz-text-soft"> · exp {fmtShort(y.expiry)}</span>}
                          {sn.length > 0 && (
                            <span className="text-bz-text-soft">
                              {" "}· S/N {sn[0]}
                              {sn.length > 1 && ` – ${sn[sn.length - 1]}`}
                            </span>
                          )}
                        </span>
                      );
                    })}
                    {loose.length > 0 && (
                      <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-px" title={loose.join(", ")}>
                        S/N {loose[0]}
                        {loose.length > 1 && ` – ${loose[loose.length - 1]}`} · {loose.length}
                      </span>
                    )}
                  </div>
                ) : undefined,
            };
          })}
        />
        <MoneyList rows={[{ label: "Value at order rates", value: <Amount value={valueOf(r)} currency={r.order.currency} />, strong: true }]} />
      </Block>

      <DetailsBlock
        subsidiaryId={r.order.subsidiaryId}
        dates={[["Delivery date", r.doc.date]]}
        custom={r.doc.custom ?? r.order.custom}
        memo={r.doc.memo}
        lead={
          <>
            <Cell label="Deliver to">
              {r.customer.name}
              <span className="block text-[10.5px] text-bz-text-soft">{r.doc.address ?? r.customer.address}</span>
            </Cell>
            <Cell label="From">{loc}</Cell>
            <Cell label="Driver">{r.doc.driver ?? <span className="text-bz-text-soft">—</span>}</Cell>
            <Cell label="Vehicle no.">{r.doc.truck ? <span className={NUM}>{r.doc.truck}</span> : <span className="text-bz-text-soft">—</span>}</Cell>
          </>
        }
      />

      <RecordSections
        no={r.doc.no}
        files={r.doc.attachments ?? []}
        onAttach={() => (attachChildDoc(r.order.no, r.doc.no), ctx.show("success", "File added"))}
        onToast={(t) => ctx.show("info", t)}
        created={{ byId: r.doc.byId, on: r.doc.date }}
        history={history}
        audit={r.doc.audit ?? []}
        gl={glDelivery(r)}
      />
      <ActivityList comments={r.doc.comments ?? []} history={history} />

      {life.dialogs({
        cancelBody: counted ? `The ${units(r)} go back into ${loc} and ${r.order.no} counts them as undelivered again.` : "It never moved stock, so nothing is reversed.",
        onCancel: (x) => (cancelChildDoc(r.order.no, r.doc.no, x), ctx.show("info", `${r.doc.no} cancelled`)),
        onDelete: () => (deleteChildDoc(r.order.no, r.doc.no), ctx.go(null), ctx.show("info", `${r.doc.no} deleted`)),
      })}
    </RecordShell>
  );
}

export { LOCATIONS, SUBSIDIARIES };
