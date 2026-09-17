import * as React from "react";
import { useNavigate } from "react-router";
import { Banknote, CircleCheck, Landmark, ListTree, ReceiptText, ShieldCheck, Undo2, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DANGER_BTN, GHOST, MenuItem, NUM, Select } from "./bzw";
import { Amount, ME, TODAY, customerById, daysBetween, fmtShort, personById } from "./orders";
import { Block, Cell, DocRow } from "./OrderPanel";
import { DocDesk, PanelCtx } from "./DocDesk";
import { ActivityList, MoneyList, RecordShell, StepCard } from "./record";
import {
  BANKS,
  CreditMemo,
  InvoiceView,
  Receipt,
  applyCredit,
  approveCredit,
  approveReceipt,
  creditApplied,
  creditValue,
  hrefFor,
  postReceipt,
  useSales,
} from "./flow";
import { ReceiptSheet } from "./MoneySheets";
import { LinesTable } from "./record";

// ════════════════════════════════════════════════════════════════════════════
// RECEIPTS — money in, and where it went
//
// A receipt is only ever read as: who paid, how, how much, and which invoices
// it settled. Cash and cheques are UNDEPOSITED until someone posts them to a
// bank — the one piece of work this desk carries — so that is its lead group.
// ════════════════════════════════════════════════════════════════════════════

export function ReceiptsDesk() {
  const { receipts, invoices } = useSales();
  const navigate = useNavigate();
  const rows = React.useMemo(() => [...receipts].sort((a, b) => b.date.localeCompare(a.date)), [receipts]);
  const undeposited = (r: Receipt) => r.state === "approved" && !r.posted;
  const month = rows.filter((r) => r.state === "approved" && daysBetween(r.date, TODAY) <= 30);

  return (
    <DocDesk<Receipt>
      section="receipts"
      rows={rows}
      noOf={(r) => r.no}
      customerOf={(r) => r.customerId}
      searchText={(r) => `${r.no} ${customerById(r.customerId)?.name} ${r.chequeNo ?? ""} ${r.reference ?? ""} ${r.allocations.map((a) => a.invoiceNo).join(" ")}`}
      stats={[{ label: "Received · 30 days", value: <Amount value={month.reduce((s, r) => s + r.amount, 0)} currency="NPR" /> }]}
      picks={[
        { key: "undeposited", label: "Undeposited", value: <Amount value={rows.filter(undeposited).reduce((s, r) => s + r.amount, 0)} />, test: undeposited, title: "Cash and cheques not yet posted to a bank" },
        { key: "pending", label: "Awaiting approval", value: rows.filter((r) => r.state === "pending").length, test: (r) => r.state === "pending" },
      ]}
      views={[
        {
          key: "state",
          label: "By state",
          icon: ListTree,
          groups: (rs) => [
            { key: "pending", label: "Awaiting approval", rows: rs.filter((r) => r.state === "pending") },
            { key: "undeposited", label: "Undeposited", rows: rs.filter(undeposited), right: <Amount value={rs.filter(undeposited).reduce((s, r) => s + r.amount, 0)} currency="NPR" /> },
            { key: "posted", label: "Posted", rows: rs.filter((r) => r.state === "approved" && r.posted) },
          ],
        },
        {
          key: "customer",
          label: "By customer",
          icon: Users,
          groups: (rs) => Array.from(new Set(rs.map((r) => r.customerId))).map((id) => ({ key: id, label: customerById(id)!.name, rows: rs.filter((r) => r.customerId === id) })),
        },
      ]}
      columns={[
        { key: "mode", label: "How", width: "110px", render: (r) => r.mode },
        { key: "for", label: "Applied to", width: "150px", render: (r) => <span className={NUM}>{r.allocations.map((a) => a.invoiceNo).join(", ")}</span> },
        { key: "date", label: "Date", width: "72px", render: (r) => <span className={NUM}>{fmtShort(r.date)}</span> },
        { key: "state", label: "Status", width: "124px", render: (r) => <ReceiptChip r={r} /> },
      ]}
      primary={(r) => ({ title: customerById(r.customerId)!.name, sub: `${r.mode} · ${r.allocations.map((a) => a.invoiceNo).join(", ")}` })}
      amount={(r) => ({ value: <Amount value={r.amount} />, sub: undeposited(r) ? "Undeposited" : undefined })}
      rowVerb={(r) => (undeposited(r) ? { label: "Deposit", icon: Landmark, run: () => navigate(hrefFor(r.no)) } : null)}
      newLabel="Receive payment"
      onNew={() => navigate("/design/sales/receipts/new")}
      renderNew={(ctx) => (
        <RecordShell ctx={{ ...ctx, docked: ctx.docked, full: false }} no="New receipt" title="Receive payment" back={{ label: "Receipts", onClick: () => ctx.go(null) }}>
          <div className="flex h-full min-h-0 flex-col">
            <ReceiptSheet
              onCancel={() => ctx.go(null)}
              onDone={(no) => {
                ctx.go(no);
                ctx.show("success", `${no} recorded`);
              }}
            />
          </div>
        </RecordShell>
      )}
      renderPanel={(r, ctx) => <ReceiptPanel key={r.no} r={r} ctx={ctx} invoices={invoices} />}
    />
  );
}

function ReceiptChip({ r }: { r: Receipt }) {
  if (r.state === "pending") return <Chip tone="pending">Awaiting approval</Chip>;
  return r.posted ? <Chip tone="positive">Posted</Chip> : <Chip tone="partial">Undeposited</Chip>;
}

function ReceiptPanel({ r, ctx, invoices }: { r: Receipt; ctx: PanelCtx; invoices: InvoiceView[] }) {
  const navigate = useNavigate();
  const [bank, setBank] = React.useState(BANKS[0]);
  const customer = customerById(r.customerId)!;
  const mine = r.state === "pending";

  let step: React.ReactNode;
  if (r.state === "pending") {
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        title="Waiting on approval"
        sub="It doesn't reduce what the customer owes until it is approved."
        actions={
          mine && (
            <button type="button" className={cn(BTN, "h-8")} onClick={() => (approveReceipt(r.no), ctx.show("success", `${r.no} approved`))}>
              Approve
            </button>
          )
        }
      />
    );
  } else if (!r.posted) {
    step = (
      <StepCard
        icon={<Landmark size={15} />}
        title={r.mode === "Cheque" ? `Cheque ${r.chequeNo} not deposited` : "Cash not deposited"}
        sub={r.mode === "Cheque" && r.chequeDate ? `Dated ${fmtShort(r.chequeDate)}` : "Post it once it is in the bank."}
        actions={
          <>
            <Select trigger="ghost" label={bank.split(" · ")[0]} value={bank} onChange={setBank} width={280} options={BANKS.map((b) => ({ value: b, label: b }))} />
            <button type="button" className={cn(BTN, "h-8")} onClick={() => (postReceipt(r.no, bank), ctx.show("success", `${r.no} posted to ${bank.split(" · ")[0]}`))}>
              Deposit
            </button>
          </>
        }
      />
    );
  } else {
    step = <StepCard icon={<CircleCheck size={15} />} tone="done" title={`Posted${r.bank ? ` to ${r.bank.split(" · ")[0]}` : ""}`} />;
  }

  return (
    <RecordShell
      ctx={ctx}
      no={r.no}
      chips={<ReceiptChip r={r} />}
      title={customer.name}
      amount={<Amount value={r.amount} currency={customer.currency} />}
      meta={[<span key="d" className={NUM}>{fmtShort(r.date)}</span>, <span key="m">{r.mode}</span>, <span key="b" className="inline-flex items-center gap-1.5"><Avatar person={personById(r.byId)} size={16} /> {personById(r.byId)?.name}</span>]}
      onPrint={() => ctx.show("info", `Preparing ${r.no} for print…`)}
      menu={(close) => (
        <MenuItem icon={ReceiptText} onClick={() => (close(), ctx.show("info", `Preparing ${r.no} for print…`))}>
          Print receipt
        </MenuItem>
      )}
    >
      {step}
      <Block title="Applied to" count={r.allocations.length}>
        <div className="flex flex-col gap-1.5">
          {r.allocations.map((a) => {
            const v = invoices.find((x) => x.doc.no === a.invoiceNo);
            return (
              <DocRow
                key={a.invoiceNo}
                icon={ReceiptText}
                no={a.invoiceNo}
                kind="Invoice"
                meta={<><Amount value={a.amount} />{v && <> · {v.balance <= 0.005 ? "settled" : <>still <Amount value={v.balance} /> due</>}</>}</>}
                chip={v ? <Chip tone={v.balance <= 0.005 ? "positive" : v.overdueDays ? "danger" : "neutral"}>{v.balance <= 0.005 ? "Paid" : v.overdueDays ? "Overdue" : "Open"}</Chip> : null}
                onClick={() => navigate(hrefFor(a.invoiceNo))}
              />
            );
          })}
        </div>
      </Block>
      <Block title="Payment">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-line-soft sm:grid-cols-2">
          <Cell label="How">{r.mode}</Cell>
          <Cell label="Received"><span className={NUM}>{fmtShort(r.date)}</span></Cell>
          {r.mode === "Bank transfer" && <Cell label="Into">{r.bank}</Cell>}
          {r.reference && <Cell label="Reference"><span className={NUM}>{r.reference}</span></Cell>}
          {r.mode === "Cheque" && <Cell label="Cheque no."><span className={NUM}>{r.chequeNo}</span></Cell>}
          {r.mode === "Cheque" && <Cell label="Cheque date"><span className={NUM}>{r.chequeDate ? fmtShort(r.chequeDate) : "—"}</span></Cell>}
          {r.memo && <Cell label="Memo" wide>{r.memo}</Cell>}
        </div>
      </Block>
      <ActivityList comments={[]} history={r.history} />
    </RecordShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RETURNS — credit memos: goods back, credit out
//
// Raised from an invoice (its Return goods step), so like deliveries there is
// no blank composer: "New return" goes to the invoices it can be raised from.
// What happens here is approval (stock comes back and the credit counts) and
// putting any credit that is still open to use.
// ════════════════════════════════════════════════════════════════════════════

export function ReturnsDesk() {
  const { credits, orders, invoices } = useSales();
  const navigate = useNavigate();
  const rows = React.useMemo(() => [...credits].sort((a, b) => b.date.localeCompare(a.date)), [credits]);
  const open = (c: CreditMemo) => c.state === "approved" && creditValue(orders, c) - creditApplied(c) > 0.005;
  const mine = (c: CreditMemo) => c.state === "pending" && c.approverId === ME.id;

  return (
    <DocDesk<CreditMemo>
      section="returns"
      rows={rows}
      noOf={(c) => c.no}
      customerOf={(c) => c.customerId}
      searchText={(c) => `${c.no} ${c.invoiceNo} ${c.orderNo} ${customerById(c.customerId)?.name} ${c.reason}`}
      picks={[
        { key: "mine", label: "Needs you", value: rows.filter(mine).length, test: mine },
        { key: "open", label: "Open credit", value: <Amount value={rows.filter(open).reduce((s, c) => s + creditValue(orders, c) - creditApplied(c), 0)} />, test: open },
      ]}
      views={[
        {
          key: "state",
          label: "By state",
          icon: ListTree,
          groups: (cs) => [
            { key: "mine", label: "Needs your approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: cs.filter(mine) },
            { key: "pending", label: "Awaiting approval", rows: cs.filter((c) => c.state === "pending" && !mine(c)) },
            { key: "open", label: "Open credit", rows: cs.filter(open) },
            { key: "applied", label: "Fully applied", rows: cs.filter((c) => c.state === "approved" && !open(c)) },
          ],
        },
      ]}
      columns={[
        { key: "inv", label: "Invoice", width: "84px", render: (c) => <span className={NUM}>{c.invoiceNo}</span> },
        { key: "why", label: "Reason", width: "150px", render: (c) => c.reason },
        { key: "date", label: "Date", width: "72px", render: (c) => <span className={NUM}>{fmtShort(c.date)}</span> },
        { key: "state", label: "Status", width: "124px", render: (c) => <CreditChip c={c} open={open(c)} /> },
      ]}
      primary={(c) => ({ title: customerById(c.customerId)!.name, sub: `${c.invoiceNo} · ${c.reason}` })}
      amount={(c) => ({ value: <Amount value={creditValue(orders, c)} />, sub: open(c) ? <>open <Amount value={creditValue(orders, c) - creditApplied(c)} className="text-bz-text-soft" /></> : undefined })}
      rowVerb={(c) => (mine(c) ? { label: "Approve", icon: ShieldCheck, run: () => approveCredit(c.no) } : null)}
      newLabel="Return from an invoice"
      onNew={() => navigate("/design/sales/invoices")}
      renderPanel={(c, ctx) => <ReturnPanel key={c.no} c={c} ctx={ctx} invoices={invoices} value={creditValue(orders, c)} />}
    />
  );
}

function CreditChip({ c, open }: { c: CreditMemo; open: boolean }) {
  if (c.state === "pending") return <Chip tone="pending">Awaiting approval</Chip>;
  return open ? <Chip tone="partial">Open credit</Chip> : <Chip tone="positive">Applied</Chip>;
}

function ReturnPanel({ c, ctx, invoices, value }: { c: CreditMemo; ctx: PanelCtx; invoices: InvoiceView[]; value: number }) {
  const navigate = useNavigate();
  const { orders } = useSales();
  const customer = customerById(c.customerId)!;
  const order = orders.find((o) => o.no === c.orderNo);
  const openCredit = Math.max(0, value - creditApplied(c));
  const targets = invoices.filter((v) => v.order.customerId === c.customerId && v.doc.state === "approved" && v.balance > 0.005);
  const [target, setTarget] = React.useState<string | null>(targets[0]?.doc.no ?? null);
  const isOpen = c.state === "approved" && openCredit > 0.005;

  let step: React.ReactNode;
  if (c.state === "pending") {
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        title={c.approverId === ME.id ? "Waiting on your approval" : "Waiting on approval"}
        sub={`Approving returns the goods to stock and credits ${c.invoiceNo}.`}
        actions={
          c.approverId === ME.id && (
            <>
              <button type="button" className={cn(DANGER_BTN, "h-8")} onClick={() => ctx.show("info", `${c.no} sent back`)}>
                Reject
              </button>
              <button type="button" className={cn(BTN, "h-8")} onClick={() => (approveCredit(c.no), ctx.show("success", `${c.no} approved · stock returned`))}>
                Approve
              </button>
            </>
          )
        }
      />
    );
  } else if (isOpen) {
    const t = targets.find((v) => v.doc.no === target);
    step = (
      <StepCard
        icon={<Undo2 size={15} />}
        title={<><Amount value={openCredit} /> credit still open</>}
        sub={targets.length ? "Apply it to another invoice from this customer, or refund it." : "Nothing else is due from this customer — refund it."}
        actions={
          <>
            <button type="button" className={GHOST} onClick={() => ctx.show("info", "Refunds are a customer refund document — opens there.")}>
              Refund
            </button>
            {targets.length > 0 && (
              <>
                <Select trigger="ghost" label={target ?? "Invoice"} value={target} onChange={setTarget} width={260} options={targets.map((v) => ({ value: v.doc.no, label: v.doc.no, meta: <Amount value={v.balance} /> }))} />
                <button
                  type="button"
                  className={cn(BTN, "h-8")}
                  onClick={() => {
                    if (!t) return;
                    const amt = Math.round(Math.min(openCredit, t.balance) * 100) / 100;
                    applyCredit(c.no, t.doc.no, amt);
                    ctx.show("success", `${amt.toLocaleString("en-US")} applied to ${t.doc.no}`);
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
  } else {
    step = <StepCard icon={<CircleCheck size={15} />} tone="done" title="Credit fully applied" sub="The goods are back in stock." />;
  }

  return (
    <RecordShell
      ctx={ctx}
      no={c.no}
      chips={<CreditChip c={c} open={isOpen} />}
      title={customer.name}
      amount={<Amount value={value} currency={customer.currency} />}
      meta={[<span key="d" className={NUM}>{fmtShort(c.date)}</span>, <span key="r">{c.reason}</span>, <span key="i" className={NUM}>{c.invoiceNo}</span>]}
      onPrint={() => ctx.show("info", `Preparing credit note ${c.no}…`)}
      menu={(close) => (
        <MenuItem icon={Banknote} onClick={() => (close(), ctx.show("info", "Refunds are a customer refund document — opens there."))}>
          Refund open credit
        </MenuItem>
      )}
    >
      {step}
      <Block title="Returned" count={c.lines.length}>
        {order && <LinesTable qtyLabel="Returned" rows={c.lines.map((x) => ({ line: order.lines.find((l) => l.id === x.lineId)!, qty: x.qty, sub: c.state === "approved" ? "back in stock" : "stock on approval" })).filter((x) => !!x.line)} />}
      </Block>
      <Block title="Credit">
        <MoneyList
          className="mt-0 max-w-none"
          rows={[
            { label: "Credit total", value: <Amount value={value} /> },
            ...c.applications.map((a) => ({ label: <>Applied to <button type="button" className="font-medium text-bz-text underline underline-offset-2" onClick={() => navigate(hrefFor(a.invoiceNo))}>{a.invoiceNo}</button></>, value: <>−<Amount value={a.amount} /></> })),
            { label: "Open credit", value: <Amount value={openCredit} />, strong: true },
          ]}
        />
      </Block>
      <Block title="Documents" count={2}>
        <div className="flex flex-col gap-1.5">
          <DocRow icon={ReceiptText} no={c.invoiceNo} kind="Invoice" meta="Returned against" chip={<Chip tone="neutral" dot={false}>Source</Chip>} onClick={() => navigate(hrefFor(c.invoiceNo))} />
          <DocRow icon={ReceiptText} no={c.orderNo} kind="Order" meta={order ? fmtShort(order.date) : ""} chip={<Chip tone="neutral" dot={false}>Order</Chip>} onClick={() => navigate(hrefFor(c.orderNo))} />
        </div>
      </Block>
      <ActivityList comments={[]} history={c.history} />
    </RecordShell>
  );
}
