import * as React from "react";
import { useNavigate } from "react-router";
import { Archive, Ban, Building2, Check as CheckIcon, CircleCheck, Clock3, Copy, Pencil, Printer, ReceiptText, Trash2, Truck, ShieldCheck } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DocLink, GHOST_SM, Kbd, MenuItem, MenuSep, NUM, Stat, Statline } from "./bzw";
import {
  Amount,
  ExpectedMark,
  Order,
  STAGE_TONE,
  TODAY,
  customerById,
  daysBetween,
  fmtQty,
  fmtShort,
  ME,
  isLate,
  itemById,
  lineNet,
  locationById,
  addDays,
  needsMyApproval,
  pendingOn,
  personById,
  progressOf,
  readyToInvoice,
  remainingToDeliver,
  stageLabel,
  stageOf,
  termById,
  totalsOf,
  useKeys,
} from "./orders";
import { subsidiaryById } from "./master";
import { Cell, NoteFoot, WorkflowActions, useLifecycle } from "./parts";
import { ActivityList, Block, CustomerTitle, DetailsBlock, LinesTable, MoneyList, RecordSections, RecordShell, StepCard, totalsRows } from "./record";
import { DeliverySheet } from "./FulfilSheet";
import { addChildDoc, approveOrder, attachOrder, billableLines, cancelOrder, closeOrder, deleteOrder, moveOrder, noteOrder, rejectOrder } from "./flow";
import { OrderComposer } from "./OrderComposer";
import type { PanelCtx } from "./DocDesk";

// ════════════════════════════════════════════════════════════════════════════
// ORDER PANEL — the record, opened beside the queue it came from
//
// The task drawer's grammar, re-cut for a document:
//
//   • WIDER, AND DOCKED. A task is read in 520px over a scrim; an order has
//     money, lines and a lifecycle, and the reader is usually working a queue
//     (approve, next, approve). So from 1280px the panel docks beside the list
//     with no scrim — the list stays live, the open row stays lit, J/K walks
//     it — and it can take the whole page for a long order.
//   • THE NEXT STEP IS THE FIRST THING IN IT. What the order is waiting for
//     (your approval — with the tenant's own workflow actions · someone
//     else's · a delivery · an invoice) and the button that does it. Deliver
//     and Invoice open IN the panel, pre-filled from what is left.
//   • BLOCKS, NOT TABS. Lines and details are one scroll; Related records,
//     Files and System information are quiet sections under them, open on
//     demand. Tabs hid payment terms and dimensions from everyone.
//   • READ HERE, EDIT IN THE COMPOSER. Notes and files are always live; the
//     DOCUMENT changes through Edit → one explicit Save, because a save can
//     re-price, move stock or send the order back for approval.
// ════════════════════════════════════════════════════════════════════════════

export function OrderPanel({ order, ctx }: { order: Order; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const customer = customerById(order.customerId)!;
  const stage = stageOf(order);
  const p = progressOf(order);
  const totals = totalsOf(order.lines);
  const life = useLifecycle(order.no);
  const mode = ctx.mode === "deliver" || ctx.mode === "invoice" ? ctx.mode : null;

  const canEdit = !["cancelled", "closed", "complete"].includes(stage);
  const canDeliver = ["deliver", "delivering"].includes(stage) && order.lines.some((l) => remainingToDeliver(l) - pendingOn(order, l, "delivery") > 0);
  const canInvoice = ["delivering", "invoice"].includes(stage) && order.lines.some((l) => readyToInvoice(l) - pendingOn(order, l, "invoice") > 0);
  const canClose = stage === "delivering" || stage === "invoice";
  const canCancel = p.deliveredPct === 0 && p.invoicedPct === 0 && stage !== "cancelled";
  const canDelete = order.docs.length === 0;
  const edit = () => ctx.go(order.no, { do: "edit" });

  useKeys({
    d: () => !mode && canDeliver && ctx.go(order.no, { do: "deliver" }),
    i: () => !mode && canInvoice && ctx.go(order.no, { do: "invoice" }),
    e: () => !mode && canEdit && edit(),
  });

  if (mode === "invoice") {
    const term = termById(order.termId);
    return (
      <OrderComposer
        key={`bill-${order.no}`}
        noun="invoice"
        title={`Invoice ${order.no}`}
        source={{ no: order.no, label: "Sales order" }}
        lockCustomer
        lockSubsidiary
        billing={{ orderNo: order.no, lines: billableLines(order) }}
        seed={{
          subsidiaryId: order.subsidiaryId,
          customerId: order.customerId,
          billingAddress: order.billingAddress,
          date: TODAY,
          locationId: order.locationId,
          repId: order.repId,
          termId: order.termId,
          due: addDays(TODAY, term?.days ?? 0),
          currency: order.currency,
          exchangeRate: order.exchangeRate,
          dims: order.dims,
          custom: order.custom,
        }}
        primaryLabel="Create invoice"
        orders={[order]}
        onCancel={() => ctx.go(order.no)}
        onSave={(r) => {
          const no = addChildDoc(order.no, {
            kind: "invoice",
            date: r.date,
            due: r.due ?? r.date,
            state: "approved",
            byId: ME.id,
            locationId: r.locationId,
            memo: r.memo || undefined,
            custom: r.custom,
            address: r.billingAddress !== order.billingAddress ? r.billingAddress : undefined,
            billDiscount: r.billDiscount || undefined,
            billOnNet: r.billOnNet || undefined,
            tdsCode: r.tdsCode ?? undefined,
            paidAtSave: r.paidAtSave ?? undefined,
            attachments: r.attachments,
            comments: r.notes,
            lines: r.lines.map((l) => ({ lineId: l.id, qty: l.qty })),
          });
          ctx.go(order.no);
          ctx.show("success", `${no} created · due ${fmtShort(r.due ?? r.date)}`, { label: "Open", run: () => navigate(`/design/sales/invoices/${no}`) });
        }}
      />
    );
  }

  if (mode) {
    return (
      <RecordShell ctx={ctx} no={order.no} back={{ label: order.no, onClick: () => ctx.go(order.no) }} title="New delivery" meta={[<span key="c">{customer.name}</span>, <span key="s">{subsidiaryById(order.subsidiaryId).name}</span>]}>
        <div className="flex h-full min-h-0 flex-col">
          {mode === "deliver" ? (
            <DeliverySheet
              key={order.no}
              order={order}
              onCancel={() => ctx.go(order.no)}
              onCommit={(pl, thenInvoice) => {
                const no = addChildDoc(order.no, { ...pl, kind: "delivery", state: "approved", byId: ME.id });
                if (thenInvoice) {
                  ctx.go(order.no, { do: "invoice" });
                  ctx.show("success", `${no} created — now the invoice`);
                } else {
                  ctx.go(order.no);
                  ctx.show("success", `${no} created from ${locationById(pl.locationId ?? order.locationId)?.name}`, { label: "Open", run: () => navigate(`/design/sales/deliveries/${no}`) });
                }
              }}
            />
          ) : null}
        </div>
      </RecordShell>
    );
  }

  return (
    <RecordShell
      ctx={ctx}
      no={order.no}
      printNo={order.no}
      chips={
        <>
          <Chip tone={STAGE_TONE[stage]}>{stageLabel(order)}</Chip>
          {p.pendingDeliveries + p.pendingInvoices > 0 && (
            <Chip tone="pending" dot={false} className="hidden sm:inline-flex" title="Stock has not moved and nothing has posted yet">
              {p.pendingDeliveries + p.pendingInvoices} awaiting approval
            </Chip>
          )}
        </>
      }
      title={<CustomerTitle name={customer.name} onOpen={() => ctx.show("info", `Opens ${customer.name}'s customer record`)} />}
      amount={<Amount value={totals.total} currency={order.currency} />}
      meta={[
        <span key="d" className={NUM}>{fmtShort(order.date)}</span>,
        order.repId ? (
          <span key="r" className="inline-flex items-center gap-1.5">
            <Avatar person={personById(order.repId)} size={16} /> {personById(order.repId)?.name}
          </span>
        ) : null,
        <span key="s" className="inline-flex items-center gap-1" title="Subsidiary">
          <Building2 size={11} className="text-bz-text-soft" /> {subsidiaryById(order.subsidiaryId).name}
        </span>,
        order.customerPo ? (
          <span key="po" title="Customer's purchase order">
            PO <span className={cn("text-bz-text", NUM)}>{order.customerPo}</span>
          </span>
        ) : null,
        order.source ? <DocLink key="src" no={order.source.no} kind={order.source.kind} onClick={() => navigate(`/design/sales/estimates/${order.source!.no}`)} /> : null,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} kbd="E" disabled={!canEdit} onClick={() => (close(), edit())}>
            Edit order
          </MenuItem>
          <MenuItem icon={Copy} onClick={() => (close(), navigate(`/design/sales/orders/new?copy=${order.no}`))}>
            Copy to new order
          </MenuItem>
          <MenuItem icon={Truck} kbd="D" disabled={!canDeliver} onClick={() => (close(), ctx.go(order.no, { do: "deliver" }))}>
            Deliver
          </MenuItem>
          <MenuItem icon={ReceiptText} kbd="I" disabled={!canInvoice} onClick={() => (close(), ctx.go(order.no, { do: "invoice" }))}>
            Invoice
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Archive} disabled={!canClose} hint={canClose ? "Nothing more will be delivered or billed" : undefined} onClick={() => (close(), life.open("close"))}>
            Close order
          </MenuItem>
          <MenuItem icon={Ban} disabled={!canCancel} title={!canCancel && stage !== "cancelled" ? "Delivered orders are closed, not cancelled" : undefined} onClick={() => (close(), life.open("cancel"))}>
            Cancel order…
          </MenuItem>
          <MenuItem icon={Trash2} danger disabled={!canDelete} hint={!canDelete ? "Has deliveries or invoices — cancel or close it instead" : undefined} onClick={() => (close(), life.open("delete"))}>
            Delete order…
          </MenuItem>
        </>
      )}
      foot={<NoteFoot onSend={(n) => noteOrder(order.no, n)} />}
    >
      <NextStep order={order} ctx={ctx} canDeliver={canDeliver} canInvoice={canInvoice} onEdit={edit} />

      <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
        <Journey order={order} />
      </div>

      <Block title="Lines" count={order.lines.length}>
        <LinesTable
          rows={order.lines.map((l) => {
            const it = itemById(l.itemId)!;
            const blocked = stage === "approval" || stage === "rejected";
            const stock = Object.keys(it.onHand).length > 0;
            return {
              line: l,
              qty: l.qty,
              sub: blocked ? undefined : (
                <>
                  {stock && (
                    <span className={l.delivered >= l.qty ? "text-bz-pos-deep" : ""}>
                      {fmtQty(Math.min(l.delivered, l.qty))}/{fmtQty(l.qty)} out ·{" "}
                    </span>
                  )}
                  {fmtQty(Math.min(l.invoiced, l.qty))} billed
                </>
              ),
            };
          })}
        />
        <MoneyList
          rows={[
            ...totalsRows(totals, { currency: order.currency, exchangeRate: order.exchangeRate }),
            ...(order.advance > 0 ? [{ label: "Advance received", value: <>−<Amount value={order.advance} /></> }, { label: "Balance", value: <Amount value={totals.total - order.advance} currency={order.currency} /> }] : []),
          ]}
        />
      </Block>

      <DetailsBlock
        subsidiaryId={order.subsidiaryId}
        currency={order.currency}
        exchangeRate={order.exchangeRate}
        dates={[
          ["Order date", order.date],
          ["Expected delivery", order.expected],
          ["Due date", order.due],
        ]}
        custom={order.custom}
        dims={order.dims}
        memo={order.memo}
        right={
          canEdit && (
            <button type="button" className={GHOST_SM} onClick={edit}>
              <Pencil size={11} /> Edit <Kbd>E</Kbd>
            </button>
          )
        }
        lead={
          <>
            <Cell label="Customer">
              {customer.name}
              <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
                {customer.code} · PAN {customer.pan}
              </span>
            </Cell>
            <Cell label="Bill to">{order.billingAddress}</Cell>
            <Cell label="Payment term">
              {termById(order.termId)?.name}
              <span className="block text-[10.5px] text-bz-text-soft">{customer.priceLevel} prices</span>
            </Cell>
            <Cell label="Sales rep">
              {order.repId ? (
                <span className="inline-flex items-center gap-1.5">
                  <Avatar person={personById(order.repId)} size={18} /> {personById(order.repId)?.name}
                </span>
              ) : (
                <span className="text-bz-text-soft">—</span>
              )}
            </Cell>
            <Cell label="Deliver from">{locationById(order.locationId)?.name}</Cell>
            <Cell label="Customer PO">{order.customerPo ?? <span className="text-bz-text-soft">—</span>}</Cell>
          </>
        }
      />

      <RecordSections no={order.no} files={order.attachments} onAttach={() => (attachOrder(order.no), ctx.show("success", "File added"))} onToast={(t) => ctx.show("info", t)} created={order.created} history={order.history} audit={order.audit} />
      <ActivityList comments={order.comments} history={order.history} />

      {life.dialogs({
        cancelBody: "Nothing has been delivered or billed. The order stays on record as cancelled.",
        onCancel: (r) => (cancelOrder(order.no, r), ctx.show("info", `${order.no} cancelled`)),
        onClose: () => (closeOrder(order.no), ctx.show("info", `${order.no} closed`)),
        onDelete: () => (deleteOrder(order.no), ctx.go(null), ctx.show("info", `${order.no} deleted`)),
      })}
    </RecordShell>
  );
}

// ── Next step ───────────────────────────────────────────────────────────────

function NextStep({ order, ctx, canDeliver, canInvoice, onEdit }: { order: Order; ctx: PanelCtx; canDeliver: boolean; canInvoice: boolean; onEdit: () => void }) {
  const stage = stageOf(order);
  const loc = locationById(order.locationId)?.name;
  const openLines = order.lines.filter((l) => remainingToDeliver(l) - pendingOn(order, l, "delivery") > 0);
  const tracked = openLines.filter((l) => itemById(l.itemId)?.lotTracked || itemById(l.itemId)?.serialTracked).length;
  const billable = order.lines.reduce((s, l) => s + lineNet({ ...l, qty: Math.max(0, readyToInvoice(l) - pendingOn(order, l, "invoice")) }), 0);
  const deliver = () => ctx.go(order.no, { do: "deliver" });
  const invoice = () => ctx.go(order.no, { do: "invoice" });

  if (stage === "approval" && order.approval.state === "pending") {
    const a = order.approval;
    const days = daysBetween(a.since, TODAY);
    const discounted = order.lines.filter((l) => l.discountPct > 0 || l.discountAmt);
    const why = discounted.length ? discounted.map((l) => `${l.discountPct ? `${l.discountPct}%` : `Rs ${l.discountAmt?.toLocaleString("en-US")}`} off ${itemById(l.itemId)?.name}`).join(" · ") : null;
    if (needsMyApproval(order))
      return (
        <StepCard
          icon={<ShieldCheck size={15} />}
          title="Waiting on your approval"
          sub={
            <>
              {a.stateName} · {days === 0 ? "today" : `${days}d`}
              {why && <span className="block text-bz-text">{why}</span>}
            </>
          }
          actions={
            <WorkflowActions
              no={order.no}
              stateName={a.stateName}
              onApprove={() => (approveOrder(order.no), ctx.show("success", `${order.no} approved`, ctx.position && ctx.position.total > 1 ? { label: "Next", run: ctx.onNext } : undefined))}
              onReject={(r) => (rejectOrder(order.no, r), ctx.show("info", `${order.no} sent back to ${personById(order.repId ?? "")?.name ?? "the rep"}`))}
              onMove={(to) => (moveOrder(order.no, to), ctx.show("info", `${order.no} moved to ${to}`))}
            />
          }
        />
      );
    return (
      <StepCard
        tone="quiet"
        icon={<ShieldCheck size={15} />}
        title={
          <span className="inline-flex items-center gap-1.5">
            Waiting on <Avatar person={personById(a.approverId)} size={16} /> {personById(a.approverId)?.name}
          </span>
        }
        sub={`${a.stateName} · ${days === 0 ? "since today" : `${days} days`}`}
      />
    );
  }
  if (stage === "rejected" && order.approval.state === "rejected")
    return (
      <StepCard
        tone="danger"
        icon={<Ban size={15} />}
        title={`Sent back by ${personById(order.approval.byId)?.name} · ${fmtShort(order.approval.on)}`}
        sub={<span className="text-bz-text">“{order.approval.reason}”</span>}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={onEdit}>
            <Pencil size={12} /> Revise and resubmit
          </button>
        }
      />
    );
  if (canDeliver)
    return (
      <StepCard
        icon={<Truck size={15} />}
        title={stage === "delivering" ? `${openLines.length} line${openLines.length === 1 ? "" : "s"} still to deliver` : "Ready to deliver"}
        sub={`${openLines.map((l) => `${fmtQty(remainingToDeliver(l) - pendingOn(order, l, "delivery"))} ${l.unit ?? itemById(l.itemId)?.unit}`).join(" + ")} from ${loc}${tracked ? ` · ${tracked} need batches or serials` : ""}`}
        actions={
          <>
            {canInvoice && (
              <button type="button" className={GHOST_SM} onClick={invoice}>
                Invoice delivered
              </button>
            )}
            <button type="button" className={cn(BTN, "h-8")} onClick={deliver}>
              <Truck size={13} /> {stage === "delivering" ? "Deliver the rest" : "Deliver"} <Kbd>D</Kbd>
            </button>
          </>
        }
      />
    );
  if (canInvoice)
    return (
      <StepCard
        icon={<ReceiptText size={15} />}
        title="Ready to invoice"
        sub={
          <>
            <Amount value={billable} currency={order.currency} /> delivered and not billed
          </>
        }
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={invoice}>
            <ReceiptText size={13} /> Invoice <Kbd>I</Kbd>
          </button>
        }
      />
    );
  if (stage === "complete") return <StepCard tone="done" icon={<CircleCheck size={15} />} title="Delivered and invoiced" />;
  if (stage === "cancelled" && order.cancelled) return <StepCard tone="quiet" icon={<Ban size={15} />} title={`Cancelled · ${fmtShort(order.cancelled.on)}`} sub={`“${order.cancelled.reason}”`} />;
  if (stage === "closed") {
    const never = order.lines.reduce((s, l) => s + remainingToDeliver(l), 0);
    return <StepCard tone="quiet" icon={<Archive size={15} />} title="Closed" sub={never ? `${fmtQty(never)} units were never delivered` : undefined} />;
  }
  const pending = order.docs.filter((d) => d.state === "pending" && !d.cancelled);
  return (
    <StepCard
      tone="quiet"
      icon={<Clock3 size={15} />}
      title={pending.length ? `Waiting on ${pending.map((d) => d.no).join(", ")}` : "Nothing left to do"}
      sub={pending.length ? "Everything left is on it. It moves when that document is approved." : undefined}
    />
  );
}

/** Approval · delivered · invoiced as ONE statline — context, not tiles. */
function Journey({ order }: { order: Order }) {
  const p = progressOf(order);
  const stage = stageOf(order);
  const a = order.approval;
  const qty = order.lines.reduce((s, l) => s + l.qty, 0);
  const del = order.lines.reduce((s, l) => s + Math.min(l.delivered, l.qty), 0);
  const inv = order.lines.reduce((s, l) => s + Math.min(l.invoiced, l.qty), 0);
  const blocked = stage === "approval" || stage === "rejected";
  return (
    <Statline className="pt-3">
      <Stat
        label="Approval"
        value={
          a.state === "approved" ? (
            <span className="inline-flex items-center gap-1">
              <CheckIcon size={12} className="text-bz-pos-deep" /> {personById(a.byId)?.name.split(" ")[0]}
            </span>
          ) : a.state === "pending" ? (
            a.stateName
          ) : a.state === "rejected" ? (
            "Sent back"
          ) : (
            "Not required"
          )
        }
        danger={a.state === "rejected"}
      />
      <Stat label="Delivered" value={blocked ? "—" : `${p.deliveredPct}%`} meter={blocked ? undefined : p.deliveredPct} sub={blocked ? undefined : `${fmtQty(del)}/${fmtQty(qty)}`} />
      <Stat label="Invoiced" value={blocked ? "—" : `${p.invoicedPct}%`} meter={blocked ? undefined : p.invoicedPct} sub={blocked ? undefined : `${fmtQty(inv)}/${fmtQty(qty)}`} />
      {isLate(order) && <Stat label="Expected" value={<ExpectedMark o={order} />} />}
    </Statline>
  );
}

export { Printer };
