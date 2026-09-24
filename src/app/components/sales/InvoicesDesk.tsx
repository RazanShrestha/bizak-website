import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AlarmClock, Ban, Banknote, CircleCheck, Clock3, Copy, Pencil, Printer, ShieldCheck, Trash2, Undo2, Users, Wallet } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DocLink, GHOST_SM, Kbd, MenuItem, MenuSep, NUM } from "./bzw";
import { Amount, CUSTOMERS, LOCATIONS, ME, Order, TODAY, customerById, daysBetween, fmtQty, fmtShort, itemById, lineGross, personById, termById, useKeys } from "./orders";
import { SUBSIDIARIES, methodById, subsidiaryById } from "./master";
import { Cell, CellGrid, NoteFoot, WorkflowActions, useLifecycle } from "./parts";
import { ActivityList, Block, CustomerTitle, DetailsBlock, LinesTable, MoneyList, RecordSections, RecordShell, StepCard, totalsRows } from "./record";
import { DateCell, DocDesk, ExpandLines, PanelCtx } from "./DocDesk";
import {
  SalesNav,
  INVOICE_LABEL,
  billableLines,
  InvoiceView,
  addDirectInvoice,
  approveChildDoc,
  attachChildDoc,
  cancelChildDoc,
  deleteChildDoc,
  deleteOrder,
  docLines,
  docStatus,
  ev,
  invoiceTone,
  noteChildDoc,
  rejectChildDoc,
  replaceChildDoc,
  updateOrder,
  useSales,
} from "./flow";
import { ComposerResult, OrderComposer } from "./OrderComposer";
import { ReceiptSheet, ReturnSheet } from "./MoneySheets";
import { glInvoice } from "./gl";

// ════════════════════════════════════════════════════════════════════════════
// INVOICES — what is owed, and getting it paid
//
// Receivables is the default view because that is the question an invoice
// list is opened to answer: what is overdue, what falls due this week, what
// is settled. Overdue is the one group that earns red, and only with rows.
//
// An invoice is raised two ways: from an order's Invoice step (billing what
// was delivered), or here with NO order — a counter sale, a service bill —
// in the same composer as orders, with payment taken at save if it was paid
// on the spot. The record puts the MONEY first (tax per code, bill discount,
// TDS, paid, credited, balance), then the one next step.
// ════════════════════════════════════════════════════════════════════════════

const BASE = "/design/sales/invoices";

export function InvoicesDesk() {
  const data = useSales();
  const { invoices, orders } = data;
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const rows = React.useMemo(() => [...invoices].sort((a, b) => b.doc.date.localeCompare(a.doc.date) || b.doc.no.localeCompare(a.doc.no)), [invoices]);

  const live = (v: InvoiceView) => v.doc.state === "approved" && !v.doc.cancelled;
  const open = rows.filter((v) => live(v) && v.balance > 0.005);
  const receivable = open.reduce((s, v) => s + v.balance * v.order.exchangeRate, 0);
  const overdue = open.filter((v) => v.overdueDays > 0);
  const week = (v: InvoiceView) => live(v) && v.balance > 0.005 && v.overdueDays === 0 && !!v.doc.due && daysBetween(TODAY, v.doc.due) <= 7;
  const pendingMine = (v: InvoiceView) => v.doc.state === "pending" && !v.doc.rejected && !v.doc.cancelled && v.doc.approverId === ME.id;
  const sum = (vs: InvoiceView[]) => <Amount value={vs.reduce((s, v) => s + v.balance * v.order.exchangeRate, 0)} currency="NPR" />;

  const direct = (r: ComposerResult): Omit<Order, "id" | "no"> => ({
    subsidiaryId: r.subsidiaryId,
    customerId: r.customerId,
    date: r.date,
    expected: null,
    locationId: r.locationId,
    repId: r.repId,
    termId: r.termId,
    due: r.due,
    customerPo: null,
    currency: r.currency,
    exchangeRate: r.exchangeRate,
    billingAddress: r.billingAddress,
    custom: r.custom,
    created: { byId: ME.id, on: TODAY },
    audit: [],
    memo: r.memo,
    source: null,
    approval: { state: "approved", byId: ME.id, on: TODAY },
    closed: false,
    cancelled: null,
    lines: r.lines,
    docs: [],
    dims: r.dims,
    attachments: [],
    comments: [],
    history: [],
    advance: 0,
  });
  const docFields = (r: ComposerResult) => ({
    kind: "invoice" as const,
    date: r.date,
    due: r.due ?? r.date,
    state: "approved" as const,
    byId: ME.id,
    locationId: r.locationId,
    address: r.billingAddress !== customerById(r.customerId)!.address ? r.billingAddress : undefined,
    memo: r.memo || undefined,
    custom: r.custom,
    billDiscount: r.billDiscount || undefined,
    billOnNet: r.billOnNet || undefined,
    tdsCode: r.tdsCode ?? undefined,
    paidAtSave: r.paidAtSave ?? undefined,
    attachments: r.attachments,
    comments: r.notes,
  });

  const composeNew = (ctx: PanelCtx) => {
    const copy = search.get("copy");
    const src = copy ? invoices.find((v) => v.doc.no === copy) : undefined;
    return (
      <OrderComposer
        key={src ? `copy-${src.doc.no}` : "new"}
        noun="invoice"
        title={src ? `Copy of ${src.doc.no}` : "New invoice · no order"}
        source={src ? { no: src.doc.no, label: "Copied from" } : undefined}
        draft={!src}
        seed={src ? { ...src.order, date: TODAY, due: null, lines: docLines(src).map((x, i) => ({ ...x.line, id: `cp-${i}`, qty: x.qty })), billDiscount: src.doc.billDiscount, billOnNet: src.doc.billOnNet, tdsCode: src.doc.tdsCode ?? null, attachments: [] } : {}}
        primaryLabel="Create invoice"
        orders={orders}
        onCancel={(kept) => (ctx.go(src ? src.doc.no : null), kept && ctx.show("info", "Draft kept", { label: "Resume", run: () => ctx.go("new") }))}
        onSave={(r) => {
          const no = addDirectInvoice(direct(r), docFields(r));
          ctx.go(no);
          ctx.show("success", r.paidAtSave ? `${no} created · paid ${methodById(r.paidAtSave.methodId).name.toLowerCase()}` : `${no} created · due ${fmtShort(r.due ?? r.date)}`);
        }}
      />
    );
  };

  return (
    <DocDesk<InvoiceView>
      section="sales/invoices"
      nav={<SalesNav current="invoices" />}
      noun={["invoice", "invoices"]}
      rows={rows}
      noOf={(v) => v.doc.no}
      dateOf={(v) => v.doc.date}
      searchText={(v) => `${v.doc.no} ${v.order.direct ? "" : v.order.no} ${v.customer.name} ${docLines(v).map((x) => itemById(x.line.itemId)?.name).join(" ")}`}
      stats={[{ label: "Receivable", value: <Amount value={receivable} currency="NPR" /> }]}
      picks={[
        { key: "overdue", label: "Overdue", value: overdue.length, danger: overdue.length > 0, test: (v) => v.overdueDays > 0 },
        { key: "week", label: "Due this week", value: rows.filter(week).length, test: week },
        { key: "approval", label: "Needs you", value: rows.filter(pendingMine).length, test: pendingMine },
      ]}
      views={[
        {
          key: "due",
          label: "Receivables",
          icon: Wallet,
          groups: (vs) => [
            { key: "approval", label: "Waiting for approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: vs.filter((v) => v.doc.state === "pending" && !v.doc.cancelled) },
            { key: "overdue", label: "Overdue", alarm: true, rows: vs.filter((v) => v.overdueDays > 0).sort((a, b) => b.overdueDays - a.overdueDays), right: sum(vs.filter((v) => v.overdueDays > 0)) },
            { key: "due", label: "Due", rows: vs.filter((v) => live(v) && v.balance > 0.005 && v.overdueDays === 0).sort((a, b) => (a.doc.due ?? "").localeCompare(b.doc.due ?? "")), right: sum(vs.filter((v) => live(v) && v.balance > 0.005 && v.overdueDays === 0)) },
            { key: "paid", label: "Paid", collapsed: true, rows: vs.filter((v) => live(v) && v.balance <= 0.005 && v.stage !== "returned") },
            { key: "returned", label: "Returned & cancelled", collapsed: true, rows: vs.filter((v) => v.stage === "returned" || v.doc.cancelled) },
          ],
        },
        {
          key: "customer",
          label: "By customer",
          icon: Users,
          groups: (vs) =>
            Array.from(new Set(vs.map((v) => v.order.customerId))).map((id) => {
              const mine = vs.filter((v) => v.order.customerId === id);
              return { key: id, label: mine[0].customer.name, rows: mine, right: sum(mine.filter((v) => live(v) && v.balance > 0.005)) };
            }),
        },
      ]}
      filters={[
        ...SUBSIDIARIES.map((s) => ({ value: `sub:${s.id}`, label: s.name, group: "Subsidiary", test: (v: InvoiceView) => v.order.subsidiaryId === s.id })),
        ...LOCATIONS.map((l) => ({ value: `loc:${l.id}`, label: l.name, group: "Location", test: (v: InvoiceView) => (v.doc.locationId ?? v.order.locationId) === l.id })),
        { value: "pay:none", label: "Not paid", group: "Payment", test: (v: InvoiceView) => v.stage === "notPaid" },
        { value: "pay:part", label: "Partly paid", group: "Payment", test: (v: InvoiceView) => v.stage === "partPaid" },
        { value: "pay:paid", label: "Paid", group: "Payment", test: (v: InvoiceView) => v.stage === "paid" },
        { value: "pay:ret", label: "Returned", group: "Payment", test: (v: InvoiceView) => v.stage === "returned" || v.stage === "partReturned" },
        { value: "ap:pending", label: "Pending approval", group: "Approval", test: (v: InvoiceView) => v.doc.state === "pending" && !v.doc.rejected },
        { value: "ap:rejected", label: "Sent back", group: "Approval", test: (v: InvoiceView) => !!v.doc.rejected },
        { value: "ap:cancelled", label: "Cancelled", group: "Approval", test: (v: InvoiceView) => !!v.doc.cancelled },
        { value: "src:order", label: "From an order", group: "Source", test: (v: InvoiceView) => !v.order.direct },
        { value: "src:direct", label: "No order", group: "Source", test: (v: InvoiceView) => !!v.order.direct },
        ...CUSTOMERS.map((c) => ({ value: `cus:${c.id}`, label: c.name, hint: c.code, group: "Customer", test: (v: InvoiceView) => v.order.customerId === c.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (v) => v.doc.date + v.doc.no, desc: true },
        { key: "due", label: "Due date", by: (v) => v.doc.due ?? "9999" },
        { key: "bal", label: "Balance", by: (v) => v.balance * v.order.exchangeRate, desc: true },
        { key: "cus", label: "Customer", by: (v) => v.customer.name },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (v) => <DateCell iso={v.doc.date} /> },
        { key: "due", label: "Due", width: "104px", render: (v) => <DueMark v={v} /> },
        { key: "state", label: "Status", width: "120px", render: (v) => <StatusChip v={v} /> },
      ]}
      primary={(v) => ({ title: v.customer.name, sub: <>{v.order.direct ? "No order" : v.order.no} · {subsidiaryById(v.order.subsidiaryId).name}</>, subOnDesktop: true })}
      amount={(v) => ({
        value: <Amount value={live(v) && v.balance > 0.005 ? v.balance : v.total} currency={v.order.currency !== "NPR" ? v.order.currency : undefined} />,
        sub: live(v) && v.balance > 0.005 && v.balance < v.total - 0.005 ? <>of <Amount value={v.total} className="text-bz-text-soft" /></> : undefined,
      })}
      rowVerb={(v) => (live(v) && v.balance > 0.005 ? { label: "Receive", icon: Banknote, run: () => navigate(`${BASE}/${v.doc.no}?do=receive`) } : pendingMine(v) ? { label: "Review", icon: ShieldCheck, run: () => navigate(`${BASE}/${v.doc.no}`) } : null)}
      renderExpand={(v) => (
        <ExpandLines rows={docLines(v).map((x) => ({ name: itemById(x.line.itemId)!.name, qty: `${fmtQty(x.qty)} ${x.line.unit ?? itemById(x.line.itemId)!.unit}`, amount: <Amount value={lineGross({ ...x.line, qty: x.qty, discountAmt: x.line.discountAmt ? (x.line.discountAmt * x.qty) / x.line.qty : undefined })} /> }))} />
      )}
      bulk={[{ label: "Print", icon: Printer, enabled: () => true, run: (vs) => ({ done: vs.length, skipped: [], verb: "sent to the printer" }) }]}
      onDelete={(vs) => {
        const skipped: string[] = [];
        let done = 0;
        vs.forEach((v) => {
          if (v.paid > 0 || v.credited > 0) return skipped.push(`${v.doc.no} has payments or returns`);
          if (v.order.direct) deleteOrder(v.order.no);
          else deleteChildDoc(v.order.no, v.doc.no);
          done++;
        });
        return { done, skipped };
      }}
      newLabel="New invoice"
      onNew={() => navigate(`${BASE}/new`)}
      renderNew={composeNew}
      renderPanel={(v, ctx) =>
        ctx.mode === "edit" ? (
          <OrderComposer
            key={`edit-${v.doc.no}`}
            noun="invoice"
            title={`Edit ${v.doc.no}`}
            source={v.order.direct ? undefined : { no: v.order.no, label: "Sales order" }}
            billing={v.order.direct ? undefined : { orderNo: v.order.no, lines: billableLines(v.order, v.doc.no) }}
            seed={{
              ...v.order,
              billingAddress: v.doc.address ?? v.order.billingAddress,
              date: v.doc.date,
              due: v.doc.due ?? null,
              memo: v.doc.memo ?? v.order.memo,
              custom: v.doc.custom ?? v.order.custom,
              // A counter sale's lines belong to the invoice itself — nothing upstream locks them.
              lines: v.order.direct ? v.order.lines.map((l) => ({ ...l, delivered: 0, invoiced: 0 })) : [],
              billDiscount: v.doc.billDiscount,
              billOnNet: v.doc.billOnNet,
              tdsCode: v.doc.tdsCode ?? null,
              paidAtSave: v.doc.paidAtSave ?? null,
              attachments: v.doc.attachments ?? [],
            }}
            editing={{ approved: v.doc.state === "approved", baseTotal: v.total, hasProgress: v.paid > 0 }}
            lockCustomer={!v.order.direct}
            lockSubsidiary
            primaryLabel="Save invoice"
            orders={orders}
            onCancel={() => ctx.go(v.doc.no)}
            onSave={(r) => {
              if (!v.order.direct) {
                replaceChildDoc(v.order.no, v.doc.no, {
                  date: r.date,
                  due: r.due ?? r.date,
                  memo: r.memo || undefined,
                  custom: r.custom,
                  address: r.billingAddress !== v.order.billingAddress ? r.billingAddress : undefined,
                  billDiscount: r.billDiscount || undefined,
                  billOnNet: r.billOnNet || undefined,
                  tdsCode: r.tdsCode ?? undefined,
                  paidAtSave: r.paidAtSave ?? undefined,
                  lines: r.lines.map((l) => ({ lineId: l.id, qty: l.qty })),
                });
                ctx.go(v.doc.no);
                return ctx.show("success", `${v.doc.no} saved`);
              }
              updateOrder(v.order.no, (o) => ({
                ...o,
                ...direct(r),
                created: o.created,
                history: [...o.history, ev(`edited ${v.doc.no}`)],
                lines: r.lines.map((l) => ({ ...l, delivered: l.qty, invoiced: l.qty })),
                docs: o.docs.map((d) => (d.no === v.doc.no ? { ...d, ...docFields(r), comments: [...(d.comments ?? []), ...r.notes], lines: r.lines.map((l) => ({ lineId: l.id, qty: l.qty })) } : d)),
              }));
              ctx.go(v.doc.no);
              ctx.show("success", `${v.doc.no} saved`);
            }}
          />
        ) : (
          <InvoicePanel key={v.doc.no} v={v} ctx={ctx} />
        )
      }
    />
  );
}

function StatusChip({ v }: { v: InvoiceView }) {
  if (v.doc.rejected || v.doc.cancelled || v.doc.state === "pending") {
    const s = docStatus(v.doc);
    return <Chip tone={s.tone}>{s.label}</Chip>;
  }
  return <Chip tone={invoiceTone(v)}>{INVOICE_LABEL[v.stage]}</Chip>;
}

function DueMark({ v }: { v: InvoiceView }) {
  if (v.doc.cancelled) return <span className="text-bz-text-soft">—</span>;
  if (v.doc.state === "pending") return <span className="text-bz-text-soft">Not posted</span>;
  if (v.balance <= 0.005) return <span className="text-bz-text-soft">Settled</span>;
  if (v.overdueDays > 0) return <span className="font-semibold text-bz-red">{v.overdueDays}d overdue</span>;
  if (!v.doc.due) return <span className="text-bz-text-soft">No due date</span>;
  const d = daysBetween(TODAY, v.doc.due);
  return <span className={cn(NUM, d <= 7 ? "text-bz-text" : "text-bz-text-muted")}>{d === 0 ? "Due today" : `Due ${fmtShort(v.doc.due)}`}</span>;
}

function InvoicePanel({ v, ctx }: { v: InvoiceView; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const { receipts, credits } = useSales();
  const life = useLifecycle(v.doc.no);
  const term = termById(v.order.termId);
  const receiptsFor = receipts.filter((r) => !r.cancelled && r.allocations.some((a) => a.invoiceNo === v.doc.no));
  const creditsFor = credits.filter((c) => !c.cancelled && (c.invoiceNo === v.doc.no || c.applications.some((a) => a.invoiceNo === v.doc.no)));
  const live = v.doc.state === "approved" && !v.doc.cancelled;
  const canReceive = live && v.balance > 0.005;
  const canReturn = live && v.stage !== "returned";
  const canEdit = !v.doc.cancelled && receiptsFor.length === 0 && creditsFor.length === 0;
  const canCancel = !v.doc.cancelled && receiptsFor.length === 0 && creditsFor.length === 0;
  const canDelete = !live || (receiptsFor.length === 0 && creditsFor.length === 0 && !v.doc.paidAtSave);
  const sheet = ctx.mode === "receive" || ctx.mode === "return" ? ctx.mode : null;
  const go = (m?: string) => ctx.go(v.doc.no, m ? { do: m } : undefined);

  useKeys({
    r: () => !sheet && canReceive && go("receive"),
    e: () => !sheet && canEdit && go("edit"),
  });

  if (sheet) {
    return (
      <RecordShell
        ctx={ctx}
        no={v.doc.no}
        back={{ label: v.doc.no, onClick: () => go() }}
        title={sheet === "receive" ? "Receive payment" : "Return goods"}
        meta={[<span key="c">{v.customer.name}</span>, <span key="b">Balance <Amount value={v.balance} /></span>]}
      >
        <div className="flex h-full min-h-0 flex-col">
          {sheet === "receive" ? (
            <ReceiptSheet customerId={v.order.customerId} invoiceNo={v.doc.no} onCancel={() => go()} onDone={(no) => (go(), ctx.show("success", `${no} recorded`, { label: "Open", run: () => navigate(`/design/sales/receipts/${no}`) }))} />
          ) : sheet === "return" ? (
            <ReturnSheet invoice={v} onCancel={() => go()} onDone={(no) => (go(), ctx.show("success", `${no} raised · waiting on your approval`, { label: "Open", run: () => navigate(`/design/sales/returns/${no}`) }))} />
          ) : null}
        </div>
      </RecordShell>
    );
  }

  let step: React.ReactNode;
  if (v.doc.cancelled) {
    step = <StepCard tone="quiet" icon={<Ban size={15} />} title={`Cancelled · ${fmtShort(v.doc.cancelled.on)}`} sub={`“${v.doc.cancelled.reason}” · its ledger postings were reversed.`} />;
  } else if (v.doc.rejected) {
    step = (
      <StepCard
        tone="danger"
        icon={<Ban size={15} />}
        title={`Sent back by ${personById(v.doc.rejected.byId)?.name}`}
        sub={<span className="text-bz-text">“{v.doc.rejected.reason}”</span>}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => go("edit")}>
            <Pencil size={12} /> Revise and resubmit
          </button>
        }
      />
    );
  } else if (v.doc.state === "pending") {
    const mine = v.doc.approverId === ME.id;
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        tone={mine ? "plain" : "quiet"}
        title={mine ? "Waiting on your approval" : <span className="inline-flex items-center gap-1.5">Waiting on <Avatar person={personById(v.doc.approverId ?? "")} size={16} /> {personById(v.doc.approverId ?? "")?.name}</span>}
        sub="Nothing posts to the ledger until it is approved."
        actions={mine && <WorkflowActions no={v.doc.no} stateName="Pending approval" onApprove={() => (approveChildDoc(v.order.no, v.doc.no), ctx.show("success", `${v.doc.no} approved · posted`))} onReject={(r) => (rejectChildDoc(v.order.no, v.doc.no, r), ctx.show("info", `${v.doc.no} sent back`))} />}
      />
    );
  } else if (v.balance > 0.005) {
    step = (
      <StepCard
        icon={v.overdueDays > 0 ? <AlarmClock size={15} /> : <Clock3 size={15} />}
        tone={v.overdueDays > 0 ? "danger" : "plain"}
        title={v.overdueDays > 0 ? `${v.overdueDays} days overdue` : v.doc.due ? `Due ${fmtShort(v.doc.due)}` : "Unpaid"}
        sub={
          <>
            <Amount value={v.balance} currency={v.order.currency} /> to collect{v.paid > 0 && " · part paid"}
            {v.pendingPaid > 0 && <> · <Amount value={v.pendingPaid} /> on a receipt awaiting approval</>}
          </>
        }
        actions={
          <>
            {canReturn && (
              <button type="button" className={GHOST_SM} onClick={() => go("return")}>
                <Undo2 size={12} /> Return goods
              </button>
            )}
            <button type="button" className={cn(BTN, "h-8")} onClick={() => go("receive")}>
              <Banknote size={13} /> Receive payment <Kbd>R</Kbd>
            </button>
          </>
        }
      />
    );
  } else {
    step = (
      <StepCard
        tone="done"
        icon={<CircleCheck size={15} />}
        title={v.stage === "returned" ? "Returned in full" : v.doc.paidAtSave && v.paid <= v.doc.paidAtSave.amount + 0.005 ? `Paid at the counter · ${methodById(v.doc.paidAtSave.methodId).name}` : "Paid in full"}
        sub={v.returned > 0 && v.stage !== "returned" ? <><Amount value={v.returned} /> of it came back as a return</> : undefined}
        actions={
          canReturn && (
            <button type="button" className={GHOST_SM} onClick={() => go("return")}>
              <Undo2 size={12} /> Return goods
            </button>
          )
        }
      />
    );
  }

  const p = v.doc.paidAtSave;
  return (
    <RecordShell
      ctx={ctx}
      no={v.doc.no}
      printNo={v.doc.no}
      chips={<StatusChip v={v} />}
      title={<CustomerTitle name={v.customer.name} onOpen={() => ctx.show("info", `Opens ${v.customer.name}'s customer record`)} />}
      amount={<Amount value={v.total} currency={v.order.currency} />}
      meta={[
        <span key="d" className={NUM}>{fmtShort(v.doc.date)}</span>,
        <span key="t">{term?.name}</span>,
        <span key="s">{subsidiaryById(v.order.subsidiaryId).name}</span>,
        v.order.direct ? <span key="o" className="text-bz-text-soft">No order</span> : <DocLink key="o" no={v.order.no} kind="Order" onClick={() => navigate(`/design/sales/orders/${v.order.no}`)} />,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Banknote} kbd="R" disabled={!canReceive} onClick={() => (close(), go("receive"))}>
            Receive payment
          </MenuItem>
          <MenuItem icon={Undo2} disabled={!canReturn} onClick={() => (close(), go("return"))}>
            Return goods
          </MenuItem>
          <MenuItem icon={Pencil} kbd="E" disabled={!canEdit} hint={!canEdit && !v.doc.cancelled ? "Has payments or returns against it" : undefined} onClick={() => (close(), go("edit"))}>
            Edit invoice
          </MenuItem>
          {v.order.direct && (
            <MenuItem icon={Copy} onClick={() => (close(), navigate(`${BASE}/new?copy=${v.doc.no}`))}>
              Copy to new invoice
            </MenuItem>
          )}
          <MenuSep />
          <MenuItem icon={Ban} disabled={!canCancel} hint={!canCancel && !v.doc.cancelled ? "Cancel its receipts and returns first" : undefined} onClick={() => (close(), life.open("cancel"))}>
            Cancel invoice…
          </MenuItem>
          <MenuItem icon={Trash2} danger disabled={!canDelete} hint={!canDelete ? "Posted with payments — cancel it instead" : undefined} onClick={() => (close(), life.open("delete"))}>
            Delete invoice…
          </MenuItem>
        </>
      )}
      foot={<NoteFoot onSend={(n) => noteChildDoc(v.order.no, v.doc.no, n)} />}
    >
      {step}

      <Block title="Money">
        <MoneyList
          className="mt-0"
          rows={[
            ...totalsRows(v.totals, { currency: v.order.currency, exchangeRate: v.order.exchangeRate, tdsCode: v.doc.tdsCode, totalLabel: "Invoice total" }),
            ...(v.paidAtSave ? [{ label: `Paid at save · ${methodById(p!.methodId).name}`, value: <>−<Amount value={v.paidAtSave} /></> }] : []),
            ...(v.paid - v.paidAtSave > 0.005 ? [{ label: `Received · ${receiptsFor.filter((r) => r.state === "approved").length} receipt${receiptsFor.length === 1 ? "" : "s"}`, value: <>−<Amount value={v.paid - v.paidAtSave} /></> }] : []),
            ...(v.tdsReceived > 0 ? [{ label: "TDS withheld on receipt", value: <>−<Amount value={v.tdsReceived} /></> }] : []),
            ...(v.credited > 0 ? [{ label: "Credited by returns", value: <>−<Amount value={v.credited} /></> }] : []),
            { label: "Balance", value: <Amount value={v.doc.cancelled ? 0 : v.balance} currency={v.order.currency} />, strong: true, danger: v.overdueDays > 0 },
          ]}
        />
      </Block>

      <Block title="Lines" count={v.doc.lines.length}>
        <LinesTable rows={docLines(v).map((x) => ({ line: x.line, qty: x.qty, sub: v.order.direct ? undefined : `${fmtQty(x.line.qty)} ordered` }))} />
      </Block>

      <DetailsBlock
        subsidiaryId={v.order.subsidiaryId}
        currency={v.order.currency}
        exchangeRate={v.order.exchangeRate}
        dates={[
          ["Invoice date", v.doc.date],
          ["Due date", v.doc.due],
        ]}
        custom={v.doc.custom ?? v.order.custom}
        dims={v.order.dims}
        memo={v.doc.memo ?? (v.order.direct ? v.order.memo : undefined)}
        lead={
          <>
            <Cell label="Customer">
              {v.customer.name}
              <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{v.customer.code} · PAN {v.customer.pan}</span>
            </Cell>
            <Cell label="Bill to">{v.doc.address ?? v.order.billingAddress}</Cell>
            <Cell label="Payment term">{term?.name}</Cell>
            {p && (
              <Cell label="Paid at save" wide>
                {methodById(p.methodId).name} · <Amount value={p.amount} /> → {p.depositTo}
                {methodById(p.methodId).fields.some((f) => p.fields[f.key]) && (
                  <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
                    {methodById(p.methodId).fields.filter((f) => p.fields[f.key]).map((f) => `${f.label} ${p.fields[f.key]}`).join(" · ")}
                  </span>
                )}
              </Cell>
            )}
            <Cell label="Raised by">
              <span className="inline-flex items-center gap-1.5">
                <Avatar person={personById(v.doc.byId)} size={18} /> {personById(v.doc.byId)?.name}
              </span>
            </Cell>
          </>
        }
      />

      <RecordSections
        no={v.doc.no}
        files={v.doc.attachments ?? []}
        onAttach={() => (attachChildDoc(v.order.no, v.doc.no), ctx.show("success", "File added"))}
        onToast={(t) => ctx.show("info", t)}
        created={{ byId: v.doc.byId, on: v.doc.date }}
        history={v.order.history.filter((h) => h.what.includes(v.doc.no) || v.order.direct)}
        audit={v.doc.audit ?? []}
        gl={glInvoice(v)}
      />
      <ActivityList comments={v.doc.comments ?? []} history={v.order.history.filter((h) => h.what.includes(v.doc.no) || v.order.direct)} />

      {life.dialogs({
        cancelBody: "Its ledger postings are reversed and it no longer counts against the order.",
        onCancel: (r) => (cancelChildDoc(v.order.no, v.doc.no, r), ctx.show("info", `${v.doc.no} cancelled`)),
        onDelete: () => (v.order.direct ? deleteOrder(v.order.no) : deleteChildDoc(v.order.no, v.doc.no), ctx.go(null), ctx.show("info", `${v.doc.no} deleted`)),
      })}
    </RecordShell>
  );
}

export { customerById };
