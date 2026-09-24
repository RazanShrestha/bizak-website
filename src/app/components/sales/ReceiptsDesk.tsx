import * as React from "react";
import { useNavigate } from "react-router";
import { Ban, Banknote, CircleCheck, Landmark, ListTree, PackageCheck, Pencil, Printer, ShieldCheck, Trash2, Undo2, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DocLink, Field, GHOST, INPUT_SM, LABEL, MenuItem, MenuSep, NUM, Dialog, Select } from "./bzw";
import { Amount, CUSTOMERS, LOCATIONS, ME, TODAY, customerById, daysBetween, fmtQty, fmtShort, itemById, locationById, personById, useKeys } from "./orders";
import { DEPOSIT_LEDGERS, PAYMENT_METHODS, SUBSIDIARIES, methodById, subsidiaryById, tdsById } from "./master";
import { AmountInput, Cell, CellGrid, NoteFoot, WorkflowActions, useLifecycle } from "./parts";
import { ActivityList, Block, CustomerTitle, DetailsBlock, LinesTable, MoneyList, RecordSections, RecordShell, StepCard, totalsRows } from "./record";
import { DateCell, DocDesk, ExpandLines, PanelCtx } from "./DocDesk";
import {
  SalesNav,
  CreditMemo,
  Receipt,
  applyCredit,
  approveCredit,
  approveReceipt,
  attachCredit,
  attachReceipt,
  cancelCredit,
  cancelReceipt,
  creditApplied,
  creditLines,
  creditTotals,
  creditValue,
  deleteCredit,
  deleteReceipt,
  docStatus,
  noteCredit,
  noteReceipt,
  postReceipt,
  receiptAdvance,
  receiptApplied,
  receiptTds,
  refundCredit,
  rejectCredit,
  rejectReceipt,
  useSales,
} from "./flow";
import { ReceiptSheet, ReturnSheet } from "./MoneySheets";
import { addReceipt as addItemReceipt, receiptsForReturn, receivedFor, receiveStage } from "../purchase/receipts";
import { ReceiveSheet } from "../purchase/ReceiveSheet";
import { glCredit, glReceipt } from "./gl";

// ════════════════════════════════════════════════════════════════════════════
// RECEIPTS — money in, and where it went
//
// A receipt is read as: who paid, how, how much, which invoices it settled,
// what TDS they withheld, and what is left over as their advance. Money that
// went to undeposited funds waits until someone posts it to a bank — the one
// piece of routine work this desk carries — so that is its lead group.
// ════════════════════════════════════════════════════════════════════════════

const receiptLabel = (r: Receipt) => (r.cancelled || r.rejected || r.state === "pending" ? docStatus(r) : r.posted ? { label: "Posted", tone: "positive" as const } : { label: "Undeposited", tone: "partial" as const });

export function ReceiptsDesk() {
  const { receipts } = useSales();
  const navigate = useNavigate();
  const rows = React.useMemo(() => [...receipts].sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no)), [receipts]);
  const live = (r: Receipt) => !r.cancelled;
  const undeposited = (r: Receipt) => live(r) && r.state === "approved" && !r.posted;
  const pending = (r: Receipt) => live(r) && r.state === "pending" && !r.rejected;
  const advance = (r: Receipt) => live(r) && r.state === "approved" && receiptAdvance(r) > 0.005;
  const month = rows.filter((r) => live(r) && r.state === "approved" && daysBetween(r.date, TODAY) <= 30);

  return (
    <DocDesk<Receipt>
      section="sales/receipts"
      nav={<SalesNav current="receipts" />}
      noun={["receipt", "receipts"]}
      rows={rows}
      noOf={(r) => r.no}
      dateOf={(r) => r.date}
      searchText={(r) => `${r.no} ${customerById(r.customerId)?.name} ${Object.values(r.methodFields).join(" ")} ${r.allocations.map((a) => a.invoiceNo).join(" ")}`}
      stats={[{ label: "Received · 30 days", value: <Amount value={month.reduce((s, r) => s + r.amount * r.exchangeRate, 0)} currency="NPR" /> }]}
      picks={[
        { key: "undeposited", label: "Undeposited", value: <Amount value={rows.filter(undeposited).reduce((s, r) => s + r.amount, 0)} />, test: undeposited, title: "Cash and cheques not yet posted to a bank" },
        { key: "pending", label: "Needs you", value: rows.filter(pending).length, test: pending },
        { key: "advance", label: "With advance", value: rows.filter(advance).length, test: advance, title: "Part of the money isn't applied to an invoice yet" },
      ]}
      views={[
        {
          key: "state",
          label: "By state",
          icon: ListTree,
          groups: (rs) => [
            { key: "pending", label: "Waiting for approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: rs.filter(pending) },
            { key: "rejected", label: "Sent back", rows: rs.filter((r) => live(r) && !!r.rejected) },
            { key: "undeposited", label: "Undeposited", rows: rs.filter(undeposited), right: <Amount value={rs.filter(undeposited).reduce((s, r) => s + r.amount, 0)} currency="NPR" /> },
            { key: "posted", label: "Posted", rows: rs.filter((r) => live(r) && r.state === "approved" && r.posted) },
            { key: "cancelled", label: "Cancelled", collapsed: true, rows: rs.filter((r) => !live(r)) },
          ],
        },
        {
          key: "customer",
          label: "By customer",
          icon: Users,
          groups: (rs) => Array.from(new Set(rs.map((r) => r.customerId))).map((id) => ({ key: id, label: customerById(id)!.name, rows: rs.filter((r) => r.customerId === id) })),
        },
      ]}
      filters={[
        ...SUBSIDIARIES.map((s) => ({ value: `sub:${s.id}`, label: s.name, group: "Subsidiary", test: (r: Receipt) => r.subsidiaryId === s.id })),
        ...PAYMENT_METHODS.map((m) => ({ value: `m:${m.id}`, label: m.name, group: "Method", test: (r: Receipt) => r.methodId === m.id })),
        { value: "st:pending", label: "Awaiting approval", group: "Status", test: pending },
        { value: "st:undeposited", label: "Undeposited", group: "Status", test: undeposited },
        { value: "st:posted", label: "Posted", group: "Status", test: (r: Receipt) => live(r) && r.state === "approved" && r.posted },
        { value: "st:cancelled", label: "Cancelled", group: "Status", test: (r: Receipt) => !live(r) },
        { value: "ad:yes", label: "Has an advance", group: "Application", test: advance },
        { value: "ad:tds", label: "TDS withheld", group: "Application", test: (r: Receipt) => receiptTds(r) > 0 },
        ...CUSTOMERS.map((c) => ({ value: `cus:${c.id}`, label: c.name, hint: c.code, group: "Customer", test: (r: Receipt) => r.customerId === c.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (r) => r.date + r.no, desc: true },
        { key: "amt", label: "Amount", by: (r) => r.amount * r.exchangeRate, desc: true },
        { key: "cus", label: "Customer", by: (r) => customerById(r.customerId)!.name },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (r) => <DateCell iso={r.date} /> },
        { key: "how", label: "Method", width: "96px", render: (r) => methodById(r.methodId).name },
        { key: "for", label: "Applied to", width: "112px", render: (r) => <span className={NUM}>{r.allocations.map((a) => a.invoiceNo).join(", ") || "Advance"}</span> },
        { key: "state", label: "Status", width: "116px", render: (r) => { const s = receiptLabel(r); return <Chip tone={s.tone}>{s.label}</Chip>; } },
      ]}
      primary={(r) => ({ title: customerById(r.customerId)!.name, sub: <>{methodById(r.methodId).name} · {subsidiaryById(r.subsidiaryId).name}</>, subOnDesktop: true })}
      amount={(r) => ({ value: <Amount value={r.amount} currency={r.currency !== "NPR" ? r.currency : undefined} />, sub: advance(r) ? <><Amount value={receiptAdvance(r)} className="text-bz-text-soft" /> advance</> : receiptTds(r) ? <>+ TDS <Amount value={receiptTds(r)} className="text-bz-text-soft" /></> : undefined })}
      rowVerb={(r) => (undeposited(r) ? { label: "Deposit", icon: Landmark, run: () => navigate(`/design/sales/receipts/${r.no}`) } : null)}
      renderExpand={(r) => (
        <ExpandLines rows={[...r.allocations.map((a) => ({ name: a.invoiceNo, note: a.tds ? `TDS ${a.tds.toLocaleString("en-US")}` : undefined, qty: "applied", amount: <Amount value={a.amount} /> })), ...(receiptAdvance(r) > 0.005 ? [{ name: "Advance", qty: "unapplied", amount: <Amount value={receiptAdvance(r)} /> }] : [])]} />
      )}
      bulk={[
        {
          label: "Deposit",
          icon: Landmark,
          title: "Posts them to Nabil Bank",
          enabled: (rs) => rs.some(undeposited),
          run: (rs) => {
            const skipped: string[] = [];
            let done = 0;
            rs.forEach((r) => (undeposited(r) ? (postReceipt(r.no, DEPOSIT_LEDGERS[2]), done++) : skipped.push(`${r.no} isn't undeposited`)));
            return { done, skipped, verb: "deposited" };
          },
        },
        { label: "Print", icon: Printer, enabled: () => true, run: (rs) => ({ done: rs.length, skipped: [], verb: "sent to the printer" }) },
      ]}
      onDelete={(rs) => {
        const skipped: string[] = [];
        let done = 0;
        rs.forEach((r) => (r.state === "approved" && r.posted && !r.cancelled ? skipped.push(`${r.no} is posted — cancel it instead`) : (deleteReceipt(r.no), done++)));
        return { done, skipped };
      }}
      newLabel="Receive payment"
      onNew={() => navigate("/design/sales/receipts/new")}
      renderNew={(ctx) => (
        <RecordShell ctx={{ ...ctx, full: false }} no="New receipt" title="Receive payment" back={{ label: "Receipts", onClick: () => ctx.go(null) }}>
          <div className="flex h-full min-h-0 flex-col">
            <ReceiptSheet onCancel={() => ctx.go(null)} onDone={(no) => (ctx.go(no), ctx.show("success", `${no} recorded`))} />
          </div>
        </RecordShell>
      )}
      renderPanel={(r, ctx) => <ReceiptPanel key={r.no} r={r} ctx={ctx} />}
    />
  );
}

function ReceiptPanel({ r, ctx }: { r: Receipt; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const { invoices } = useSales();
  const life = useLifecycle(r.no);
  const [bank, setBank] = React.useState(DEPOSIT_LEDGERS[2]);
  const customer = customerById(r.customerId)!;
  const method = methodById(r.methodId);
  const status = receiptLabel(r);
  const adv = receiptAdvance(r);
  const tds = receiptTds(r);
  const counted = r.state === "approved" && !r.cancelled;

  useKeys({ e: () => ctx.mode !== "edit" && !r.cancelled && ctx.go(r.no, { do: "edit" }) });

  if (ctx.mode === "edit")
    return (
      <RecordShell ctx={ctx} no={r.no} back={{ label: r.no, onClick: () => ctx.go(r.no) }} title={`Edit ${r.no}`} meta={[<span key="c">{customer.name}</span>]}>
        <div className="flex h-full min-h-0 flex-col">
          <ReceiptSheet customerId={r.customerId} existing={r} onCancel={() => ctx.go(r.no)} onDone={() => (ctx.go(r.no), ctx.show("success", `${r.no} saved`))} />
        </div>
      </RecordShell>
    );

  let step: React.ReactNode;
  if (r.cancelled) step = <StepCard tone="quiet" icon={<Ban size={15} />} title={`Cancelled · ${fmtShort(r.cancelled.on)}`} sub={`“${r.cancelled.reason}” · the invoices it paid are open again.`} />;
  else if (r.rejected)
    step = (
      <StepCard
        tone="danger"
        icon={<Ban size={15} />}
        title={`Sent back by ${personById(r.rejected.byId)?.name}`}
        sub={<span className="text-bz-text">“{r.rejected.reason}”</span>}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => ctx.go(r.no, { do: "edit" })}>
            <Pencil size={12} /> Revise and resubmit
          </button>
        }
      />
    );
  else if (r.state === "pending")
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        title="Waiting on your approval"
        sub="It doesn't reduce what the customer owes until it is approved."
        actions={<WorkflowActions no={r.no} stateName="Pending approval" onApprove={() => (approveReceipt(r.no), ctx.show("success", `${r.no} approved`))} onReject={(x) => (rejectReceipt(r.no, x), ctx.show("info", `${r.no} sent back`))} />}
      />
    );
  else if (!r.posted)
    step = (
      <StepCard
        icon={<Landmark size={15} />}
        title={r.methodId === "CHQ" ? `Cheque ${r.methodFields.chequeNo ?? ""} not deposited` : `${method.name} not deposited`}
        sub={r.methodId === "CHQ" && r.methodFields.chequeDate ? `Dated ${fmtShort(r.methodFields.chequeDate)} · in undeposited funds` : "In undeposited funds until it is posted to a bank."}
        actions={
          <>
            <Select trigger="ghost" label={bank.split(" · ")[0]} value={bank} onChange={setBank} width={280} align="right" options={DEPOSIT_LEDGERS.filter((d) => d !== "Undeposited funds").map((b) => ({ value: b, label: b }))} />
            <button type="button" className={cn(BTN, "h-8")} onClick={() => (postReceipt(r.no, bank), ctx.show("success", `${r.no} posted to ${bank.split(" · ")[0]}`))}>
              Deposit
            </button>
          </>
        }
      />
    );
  else step = <StepCard tone="done" icon={<CircleCheck size={15} />} title={`Posted to ${r.depositTo.split(" · ")[0]}`} sub={adv > 0.005 ? <><Amount value={adv} /> is kept as {customer.name.split(" ")[0]}'s advance.</> : undefined} />;

  return (
    <RecordShell
      ctx={ctx}
      no={r.no}
      printNo={r.no}
      chips={<Chip tone={status.tone}>{status.label}</Chip>}
      title={<CustomerTitle name={customer.name} onOpen={() => ctx.show("info", `Opens ${customer.name}'s customer record`)} />}
      amount={<Amount value={r.amount} currency={r.currency} />}
      meta={[
        <span key="d" className={NUM}>{fmtShort(r.date)}</span>,
        <span key="m">{method.name}</span>,
        <span key="s">{subsidiaryById(r.subsidiaryId).name}</span>,
        <span key="b" className="inline-flex items-center gap-1.5">
          <Avatar person={personById(r.byId)} size={16} /> {personById(r.byId)?.name}
        </span>,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} kbd="E" disabled={!!r.cancelled} onClick={() => (close(), ctx.go(r.no, { do: "edit" }))}>
            Edit receipt
          </MenuItem>
          <MenuItem icon={Landmark} disabled={!(counted && !r.posted)} onClick={() => (close(), postReceipt(r.no, bank), ctx.show("success", `${r.no} posted to ${bank.split(" · ")[0]}`))}>
            Deposit to {bank.split(" · ")[0]}
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Ban} disabled={!!r.cancelled} onClick={() => (close(), life.open("cancel"))}>
            Cancel receipt…
          </MenuItem>
          <MenuItem icon={Trash2} danger disabled={counted && r.posted} hint={counted && r.posted ? "Posted to a bank — cancel it instead" : undefined} onClick={() => (close(), life.open("delete"))}>
            Delete receipt…
          </MenuItem>
        </>
      )}
      foot={<NoteFoot onSend={(n) => noteReceipt(r.no, n)} />}
    >
      {step}

      <Block title="Applied to" count={r.allocations.length}>
        {r.allocations.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Not applied to an invoice — it is all advance.</p>
        ) : (
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
            <div className={cn("hidden grid-cols-[minmax(0,1fr)_104px_104px_104px] gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
              <span>Invoice</span>
              <span className="text-right">TDS</span>
              <span className="text-right">Applied</span>
              <span className="text-right">Still due</span>
            </div>
            {r.allocations.map((a) => {
              const v = invoices.find((x) => x.doc.no === a.invoiceNo);
              return (
                <button key={a.invoiceNo} type="button" onClick={() => navigate(`/design/sales/invoices/${a.invoiceNo}`)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-bz-line-soft px-3 py-2 text-left text-[12px] last:border-0 hover:bg-bz-paper-warm sm:grid-cols-[minmax(0,1fr)_104px_104px_104px]">
                  <span className="min-w-0">
                    <span className={cn("block font-medium text-bz-text", NUM)}>{a.invoiceNo}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {v ? `${fmtShort(v.doc.date)} · of ${v.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : ""}
                      {a.tdsCode && ` · ${tdsById(a.tdsCode)?.name}`}
                    </span>
                  </span>
                  <span className="hidden text-right text-bz-text-muted sm:block">{a.tds ? <Amount value={a.tds} /> : "—"}</span>
                  <span className="text-right font-semibold text-bz-text">
                    <Amount value={a.amount} />
                  </span>
                  <span className="hidden text-right sm:block">{v ? v.balance <= 0.005 ? <Chip tone="positive">Paid</Chip> : <Amount value={v.balance} className={v.overdueDays ? "text-bz-red" : "text-bz-text-muted"} /> : null}</span>
                </button>
              );
            })}
          </div>
        )}
        <MoneyList
          rows={[
            { label: "Applied to invoices", value: <Amount value={receiptApplied(r)} /> },
            ...(tds > 0 ? [{ label: "TDS withheld (not cash)", value: <Amount value={tds} />, soft: true }] : []),
            ...(adv > 0.005 ? [{ label: "Kept as advance", value: <Amount value={adv} /> }] : []),
            { label: "Amount received", value: <Amount value={r.amount} currency={r.currency} />, strong: true },
            ...(r.currency !== "NPR" ? [{ label: `at ${r.exchangeRate}`, value: <>≈ <Amount value={r.amount * r.exchangeRate} currency="NPR" /></>, soft: true }] : []),
          ]}
        />
      </Block>

      <DetailsBlock
        subsidiaryId={r.subsidiaryId}
        currency={r.currency}
        exchangeRate={r.exchangeRate}
        dates={[["Received on", r.date]]}
        custom={r.custom}
        dims={r.dims}
        memo={r.memo}
        lead={
          <>
            <Cell label="Method">{method.name}</Cell>
            <Cell label="Deposit to">{r.depositTo}</Cell>
            {method.fields.map((f) => (
              <Cell key={f.key} label={f.label}>
                {r.methodFields[f.key] ? <span className={NUM}>{f.type === "date" ? fmtShort(r.methodFields[f.key]) : r.methodFields[f.key]}</span> : <span className="text-bz-text-soft">—</span>}
              </Cell>
            ))}
          </>
        }
      />

      <RecordSections no={r.no} files={r.attachments} onAttach={() => (attachReceipt(r.no), ctx.show("success", "File added"))} onToast={(t) => ctx.show("info", t)} created={r.created} history={r.history} audit={r.audit} gl={glReceipt(r)} />
      <ActivityList comments={r.comments} history={r.history} />

      {life.dialogs({
        cancelBody: "The invoices it paid become due again, and its ledger postings are reversed.",
        onCancel: (x) => (cancelReceipt(r.no, x), ctx.show("info", `${r.no} cancelled`)),
        onDelete: () => (deleteReceipt(r.no), ctx.go(null), ctx.show("info", `${r.no} deleted`)),
      })}
    </RecordShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RETURNS — credit memos: goods back, credit out
//
// Raised from an invoice (its Return goods step), so like deliveries there is
// no blank composer: "Return from an invoice" goes to the invoices it can be
// raised from. What happens here is approval (stock comes back and the credit
// counts) and putting any open credit to use — applied to another invoice,
// or refunded.
// ════════════════════════════════════════════════════════════════════════════

export function ReturnsDesk() {
  const { credits, orders } = useSales();
  const navigate = useNavigate();
  const rows = React.useMemo(() => [...credits].sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no)), [credits]);
  const live = (c: CreditMemo) => !c.cancelled;
  const open = (c: CreditMemo) => live(c) && c.state === "approved" && creditValue(orders, c) - creditApplied(c) > 0.005;
  const mine = (c: CreditMemo) => live(c) && c.state === "pending" && !c.rejected && c.approverId === ME.id;
  const chip = (c: CreditMemo) => (c.cancelled || c.rejected || c.state === "pending" ? docStatus(c) : open(c) ? { label: "Open credit", tone: "partial" as const } : { label: "Applied", tone: "positive" as const });
  /** A return credits the customer; the GOODS come back on an item receipt, which is a different question. */
  const goods = (c: CreditMemo) => (c.state !== "approved" || c.cancelled ? null : receiveStage({ kind: "return", no: c.no }));
  const awaitingGoods = (c: CreditMemo) => goods(c) !== null && goods(c) !== "full";

  return (
    <DocDesk<CreditMemo>
      section="sales/returns"
      nav={<SalesNav current="returns" />}
      noun={["return", "returns"]}
      rows={rows}
      noOf={(c) => c.no}
      dateOf={(c) => c.date}
      searchText={(c) => `${c.no} ${c.invoiceNo} ${c.orderNo} ${customerById(c.customerId)?.name} ${c.reason}`}
      picks={[
        { key: "mine", label: "Needs you", value: rows.filter(mine).length, test: mine },
        { key: "open", label: "Open credit", value: <Amount value={rows.filter(open).reduce((s, c) => s + creditValue(orders, c) - creditApplied(c), 0)} />, test: open },
        { key: "goods", label: "Goods not back", value: rows.filter(awaitingGoods).length, test: awaitingGoods, title: "Approved, but the stock has not been received yet" },
      ]}
      views={[
        {
          key: "state",
          label: "By state",
          icon: ListTree,
          groups: (cs) => [
            { key: "mine", label: "Needs your approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: cs.filter(mine) },
            { key: "pending", label: "Waiting for approval", rows: cs.filter((c) => live(c) && c.state === "pending" && !mine(c)) },
            { key: "open", label: "Open credit", rows: cs.filter(open) },
            { key: "applied", label: "Fully applied", rows: cs.filter((c) => live(c) && c.state === "approved" && !open(c)) },
            { key: "cancelled", label: "Cancelled", collapsed: true, rows: cs.filter((c) => !live(c)) },
          ],
        },
      ]}
      filters={[
        ...SUBSIDIARIES.map((s) => ({ value: `sub:${s.id}`, label: s.name, group: "Subsidiary", test: (c: CreditMemo) => c.subsidiaryId === s.id })),
        ...LOCATIONS.map((l) => ({ value: `loc:${l.id}`, label: l.name, group: "Returned to", test: (c: CreditMemo) => c.locationId === l.id })),
        { value: "st:pending", label: "Awaiting approval", group: "Status", test: (c: CreditMemo) => live(c) && c.state === "pending" },
        { value: "st:open", label: "Open credit", group: "Status", test: open },
        { value: "st:applied", label: "Applied", group: "Status", test: (c: CreditMemo) => live(c) && c.state === "approved" && !open(c) },
        { value: "st:cancelled", label: "Cancelled", group: "Status", test: (c: CreditMemo) => !live(c) },
        { value: "g:out", label: "Goods not back", group: "Goods", test: awaitingGoods },
        { value: "g:in", label: "Goods received", group: "Goods", test: (c: CreditMemo) => goods(c) === "full" },
        ...CUSTOMERS.map((x) => ({ value: `cus:${x.id}`, label: x.name, hint: x.code, group: "Customer", test: (c: CreditMemo) => c.customerId === x.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (c) => c.date + c.no, desc: true },
        { key: "val", label: "Credit", by: (c) => creditValue(orders, c), desc: true },
        { key: "cus", label: "Customer", by: (c) => customerById(c.customerId)!.name },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (c) => <DateCell iso={c.date} /> },
        { key: "inv", label: "Invoice", width: "76px", render: (c) => <span className={NUM}>{c.invoiceNo}</span> },
        { key: "why", label: "Reason", width: "112px", render: (c) => c.reason },
        { key: "goods", label: "Goods", width: "92px", render: (c) => { const g = goods(c); return g === null ? <span className="text-bz-text-soft">—</span> : g === "full" ? <span className="text-bz-text-muted">Back in stock</span> : <span className="text-bz-text">{g === "partly" ? "Partly back" : "Not back"}</span>; } },
        { key: "state", label: "Status", width: "116px", render: (c) => { const s = chip(c); return <Chip tone={s.tone}>{s.label}</Chip>; } },
      ]}
      primary={(c) => ({ title: customerById(c.customerId)!.name, sub: <>{c.invoiceNo} · {c.reason}</> })}
      amount={(c) => ({ value: <Amount value={creditValue(orders, c)} />, sub: open(c) ? <>open <Amount value={creditValue(orders, c) - creditApplied(c)} className="text-bz-text-soft" /></> : undefined })}
      rowVerb={(c) => (mine(c) ? { label: "Approve", icon: ShieldCheck, run: () => approveCredit(c.no) } : null)}
      renderExpand={(c) => <ExpandLines rows={creditLines(orders, c).map((x) => ({ name: itemById(x.line.itemId)!.name, qty: `${fmtQty(x.qty)} ${x.line.unit ?? itemById(x.line.itemId)!.unit}`, amount: <Amount value={x.qty * x.line.rate} /> }))} />}
      bulk={[
        {
          label: "Approve",
          icon: ShieldCheck,
          enabled: (cs) => cs.some(mine),
          run: (cs) => {
            const skipped: string[] = [];
            let done = 0;
            cs.forEach((c) => (mine(c) ? (approveCredit(c.no), done++) : skipped.push(`${c.no} isn't waiting on you`)));
            return { done, skipped, verb: "approved" };
          },
        },
      ]}
      onDelete={(cs) => {
        const skipped: string[] = [];
        let done = 0;
        cs.forEach((c) => (c.state === "approved" && !c.cancelled ? skipped.push(`${c.no} returned stock — cancel it instead`) : (deleteCredit(c.no), done++)));
        return { done, skipped };
      }}
      newLabel="Return from an invoice"
      onNew={() => navigate("/design/sales/invoices")}
      renderPanel={(c, ctx) => <ReturnPanel key={c.no} c={c} ctx={ctx} />}
    />
  );
}

function ReturnPanel({ c, ctx }: { c: CreditMemo; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const { orders, invoices } = useSales();
  const life = useLifecycle(c.no);
  const customer = customerById(c.customerId)!;
  const t = creditTotals(orders, c);
  const value = t.total;
  const openCredit = Math.max(0, value - creditApplied(c));
  const targets = invoices.filter((v) => v.order.customerId === c.customerId && v.doc.state === "approved" && !v.doc.cancelled && v.balance > 0.005);
  const [target, setTarget] = React.useState<string | null>(targets[0]?.doc.no ?? null);
  const [refunding, setRefunding] = React.useState(false);
  const isOpen = !c.cancelled && c.state === "approved" && openCredit > 0.005;
  const received = c.state === "approved" && !c.cancelled ? receiveStage({ kind: "return", no: c.no }) : null;
  const goodsLeft = received !== null && received !== "full";
  const receipts = receiptsForReturn(c.no);
  const counted = c.state === "approved" && !c.cancelled;
  const invoice = invoices.find((v) => v.doc.no === c.invoiceNo);
  const s = c.cancelled || c.rejected || c.state === "pending" ? docStatus(c) : isOpen ? { label: "Open credit", tone: "partial" as const } : { label: "Applied", tone: "positive" as const };

  useKeys({ e: () => ctx.mode !== "edit" && !c.cancelled && ctx.go(c.no, { do: "edit" }) });

  if (ctx.mode === "receive" && goodsLeft)
    return (
      <RecordShell ctx={ctx} no={c.no} back={{ label: c.no, onClick: () => ctx.go(c.no) }} title="Receive returned goods" meta={[<span key="c">{customer.name}</span>, <span key="i">{c.invoiceNo}</span>]}>
        <div className="flex h-full min-h-0 flex-col">
          <ReceiveSheet
            source={{ kind: "return", no: c.no }}
            party={{ id: c.customerId, name: customer.name }}
            defaults={{ subsidiaryId: c.subsidiaryId, locationId: c.locationId, currency: "NPR", exchangeRate: 1, custom: c.custom }}
            onCancel={() => ctx.go(c.no)}
            onCommit={(p) => {
              const no = addItemReceipt({
                ...p,
                source: { kind: "return", no: c.no },
                partyId: c.customerId,
                state: "pending",
                approverId: ME.id,
                cancelled: null,
                billing: "Open",
                vendorBillNo: null,
                byId: ME.id,
                attachments: [],
                lines: p.lines.map((l, i) => ({ ...l, id: `IRL-${Date.now()}-${i}` })),
              });
              ctx.go(c.no);
              ctx.show("success", `${no} raised · stock counts once it is approved`, { label: "Open", run: () => navigate(`/design/purchase/item-receipts/${no}`) });
            }}
          />
        </div>
      </RecordShell>
    );

  if (ctx.mode === "edit" && invoice)
    return (
      <RecordShell ctx={ctx} no={c.no} back={{ label: c.no, onClick: () => ctx.go(c.no) }} title={`Edit ${c.no}`} meta={[<span key="c">{customer.name}</span>, <span key="i">{c.invoiceNo}</span>]}>
        <div className="flex h-full min-h-0 flex-col">
          <ReturnSheet invoice={invoice} existing={c} onCancel={() => ctx.go(c.no)} onDone={() => (ctx.go(c.no), ctx.show("success", `${c.no} saved`))} />
        </div>
      </RecordShell>
    );

  let step: React.ReactNode;
  if (c.cancelled) step = <StepCard tone="quiet" icon={<Ban size={15} />} title={`Cancelled · ${fmtShort(c.cancelled.on)}`} sub={`“${c.cancelled.reason}”`} />;
  else if (c.rejected)
    step = (
      <StepCard
        tone="danger"
        icon={<Ban size={15} />}
        title={`Sent back by ${personById(c.rejected.byId)?.name}`}
        sub={<span className="text-bz-text">“{c.rejected.reason}”</span>}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => ctx.go(c.no, { do: "edit" })}>
            <Pencil size={12} /> Revise and resubmit
          </button>
        }
      />
    );
  else if (c.state === "pending")
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        tone={c.approverId === ME.id ? "plain" : "quiet"}
        title={c.approverId === ME.id ? "Waiting on your approval" : "Waiting on approval"}
        sub={`Credits ${c.invoiceNo}. Goods come back separately.`}
        actions={c.approverId === ME.id && <WorkflowActions no={c.no} stateName="Pending approval" onApprove={() => (approveCredit(c.no), ctx.show("success", `${c.no} approved · credit posted`))} onReject={(x) => (rejectCredit(c.no, x), ctx.show("info", `${c.no} sent back`))} />}
      />
    );
  else if (goodsLeft) {
    step = (
      <StepCard
        icon={<PackageCheck size={15} />}
        title={received === "partly" ? "Some of the goods are still out" : "Goods haven't come back yet"}
        sub="Credited already — the goods come back on an item receipt."
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => ctx.go(c.no, { do: "receive" })}>
            <PackageCheck size={13} /> Receive items
          </button>
        }
      />
    );
  } else if (isOpen) {
    const tv = targets.find((v) => v.doc.no === target);
    step = (
      <StepCard
        icon={<Undo2 size={15} />}
        title={
          <>
            <Amount value={openCredit} /> credit still open
          </>
        }
        sub={targets.length ? "Apply it to another invoice from this customer, or refund it." : "Nothing else is due from this customer — refund it."}
        actions={
          <>
            <button type="button" className={cn(GHOST, "h-8")} onClick={() => setRefunding(true)}>
              <Banknote size={12} /> Refund
            </button>
            {targets.length > 0 && (
              <>
                <Select trigger="ghost" label={target ?? "Invoice"} value={target} onChange={setTarget} width={260} align="right" options={targets.map((v) => ({ value: v.doc.no, label: v.doc.no, meta: <Amount value={v.balance} /> }))} />
                <button
                  type="button"
                  className={cn(BTN, "h-8")}
                  onClick={() => {
                    if (!tv) return;
                    const amt = Math.round(Math.min(openCredit, tv.balance) * 100) / 100;
                    applyCredit(c.no, tv.doc.no, amt);
                    ctx.show("success", `${amt.toLocaleString("en-US")} applied to ${tv.doc.no}`);
                  }}
                >
                  Apply
                </button>
              </>
            )}
          </>
        }
      />
    );
  } else step = <StepCard tone="done" icon={<CircleCheck size={15} />} title={c.refunded >= value - 0.005 ? "Refunded in full" : c.refunded ? "Credit used — part refunded" : "Credit fully applied"} sub={received === "full" ? "The goods came back on an item receipt." : undefined} />;

  return (
    <RecordShell
      ctx={ctx}
      no={c.no}
      printNo={c.no}
      chips={<Chip tone={s.tone}>{s.label}</Chip>}
      title={<CustomerTitle name={customer.name} onOpen={() => ctx.show("info", `Opens ${customer.name}'s customer record`)} />}
      amount={<Amount value={value} currency={invoice?.order.currency ?? "NPR"} />}
      meta={[
        <span key="d" className={NUM}>{fmtShort(c.date)}</span>,
        <span key="r">{c.reason}</span>,
        <span key="s">{subsidiaryById(c.subsidiaryId).name}</span>,
        <DocLink key="i" no={c.invoiceNo} kind="Invoice" onClick={() => navigate(`/design/sales/invoices/${c.invoiceNo}`)} />,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} kbd="E" disabled={!!c.cancelled || c.applications.some((a) => a.invoiceNo !== c.invoiceNo)} onClick={() => (close(), ctx.go(c.no, { do: "edit" }))}>
            Edit return
          </MenuItem>
          <MenuItem icon={PackageCheck} disabled={!goodsLeft} onClick={() => (close(), ctx.go(c.no, { do: "receive" }))}>
            Receive returned goods
          </MenuItem>
          <MenuItem icon={Banknote} disabled={!isOpen} onClick={() => (close(), setRefunding(true))}>
            Refund open credit
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Ban} disabled={!!c.cancelled} onClick={() => (close(), life.open("cancel"))}>
            Cancel return…
          </MenuItem>
          <MenuItem icon={Trash2} danger disabled={counted} hint={counted ? "Stock has come back — cancel it instead" : undefined} onClick={() => (close(), life.open("delete"))}>
            Delete return…
          </MenuItem>
        </>
      )}
      foot={<NoteFoot onSend={(n) => noteCredit(c.no, n)} />}
    >
      {step}
      <Block title="Returned" count={c.lines.length}>
        <LinesTable
          qtyLabel="Credited"
          rows={creditLines(orders, c).map((x) => {
            const stock = !!Object.keys(itemById(x.line.itemId)!.onHand).length;
            const back = receivedFor(c.no, x.lineId);
            return { line: x.line, qty: x.qty, sub: !stock || received === null ? undefined : back >= x.qty ? "back in stock" : back > 0 ? `${fmtQty(back)} of ${fmtQty(x.qty)} back` : "not back yet" };
          })}
        />
        <MoneyList
          rows={[
            ...totalsRows(t, { currency: invoice?.order.currency ?? "NPR", exchangeRate: invoice?.order.exchangeRate ?? 1, totalLabel: "Credit total" }),
            ...c.applications.map((a) => ({
              label: (
                <>
                  Applied to{" "}
                  <button type="button" className="font-medium text-bz-text underline underline-offset-2" onClick={() => navigate(`/design/sales/invoices/${a.invoiceNo}`)}>
                    {a.invoiceNo}
                  </button>
                </>
              ),
              value: <>−<Amount value={a.amount} /></>,
            })),
            ...(c.refunded ? [{ label: "Refunded", value: <>−<Amount value={c.refunded} /></> }] : []),
            { label: "Open credit", value: <Amount value={openCredit} />, strong: true },
          ]}
        />
      </Block>

      {received !== null && (
      <Block title="Goods" count={receipts.length}>
        {receipts.length === 0 && <p className="m-0 text-[11.5px] text-bz-text-soft">Nothing back yet.</p>}
{receipts.length > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            {receipts.map((x) => (
              <button key={x.no} type="button" onClick={() => navigate(`/design/purchase/item-receipts/${x.no}`)} className="flex items-center gap-2 rounded-bz-sm px-1 py-1 text-left text-[12px] hover:bg-bz-paper-warm">
                <PackageCheck size={12} className="text-bz-text-muted" />
                <span className={cn("font-medium text-bz-text", NUM)}>{x.no}</span>
                <span className="text-bz-text-soft">{fmtShort(x.date)} · into {locationById(x.locationId)?.name}</span>
                <span className={cn("ml-auto text-[11px] text-bz-text-muted", NUM)}>{fmtQty(x.lines.reduce((s, l) => s + l.qty, 0))} units</span>
              </button>
            ))}
          </div>
        )}
      </Block>
      )}

      <DetailsBlock
        subsidiaryId={c.subsidiaryId}
        dates={[["Return date", c.date]]}
        custom={c.custom}
        dims={c.dims}
        memo={c.memo}
        lead={
          <>
            <Cell label="Against invoice">
              <span className={NUM}>{c.invoiceNo}</span>
              <span className="block text-[10.5px] text-bz-text-soft">Order {c.orderNo}</span>
            </Cell>
            <Cell label="Reason">{c.reason}</Cell>
            <Cell label="Returned to">{locationById(c.locationId)?.name}</Cell>
            <Cell label="Sales rep">{c.repId ? personById(c.repId)?.name : <span className="text-bz-text-soft">—</span>}</Cell>
          </>
        }
      />

      <RecordSections no={c.no} files={c.attachments} onAttach={() => (attachCredit(c.no), ctx.show("success", "File added"))} onToast={(x) => ctx.show("info", x)} created={c.created} history={c.history} audit={c.audit} gl={glCredit(orders, c)} />
      <ActivityList comments={c.comments} history={c.history} />

      <RefundDialog open={refunding} no={c.no} max={openCredit} onClose={() => setRefunding(false)} onRefund={(amt, from) => (setRefunding(false), refundCredit(c.no, amt), ctx.show("success", `${amt.toLocaleString("en-US")} refunded from ${from.split(" · ")[0]}`))} />
      {life.dialogs({
        cancelBody: counted ? "The goods leave stock again and the credit is withdrawn from the invoices it was applied to." : "It never moved stock, so nothing is reversed.",
        onCancel: (x) => (cancelCredit(c.no, x), ctx.show("info", `${c.no} cancelled`)),
        onDelete: () => (deleteCredit(c.no), ctx.go(null), ctx.show("info", `${c.no} deleted`)),
      })}
    </RecordShell>
  );
}

function RefundDialog({ open, no, max, onClose, onRefund }: { open: boolean; no: string; max: number; onClose: () => void; onRefund: (amount: number, from: string) => void }) {
  const [amount, setAmount] = React.useState(max);
  const [from, setFrom] = React.useState(DEPOSIT_LEDGERS[1]);
  React.useEffect(() => {
    if (open) setAmount(Math.round(max * 100) / 100);
  }, [open, max]);
  const over = amount > max + 0.005;
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={no}
      title="Refund open credit"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Keep it
          </button>
          <button type="button" className={BTN} onClick={() => amount > 0 && !over && onRefund(amount, from)}>
            <Banknote size={13} /> Refund
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Amount" hint={over ? <span className="text-bz-red">Only {max.toLocaleString("en-US", { minimumFractionDigits: 2 })} is open.</span> : undefined}>
          <AmountInput value={amount} onChange={setAmount} invalid={over} className="text-[14px] font-semibold" />
        </Field>
        <Field label="Paid from">
          <Select trigger="ghost" className="h-8 w-full justify-between" label={from} value={from} onChange={setFrom} width={300} options={DEPOSIT_LEDGERS.filter((d) => d !== "Undeposited funds").map((d) => ({ value: d, label: d }))} />
        </Field>
      </div>
    </Dialog>
  );
}

export { TODAY };
