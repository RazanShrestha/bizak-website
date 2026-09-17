import * as React from "react";
import { useNavigate } from "react-router";
import { AlarmClock, Banknote, CircleCheck, Clock3, Plus, Printer, ReceiptText, ShieldCheck, Undo2, Users, Wallet } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DocLink, GHOST_SM, Kbd, MenuItem, NUM } from "./bzw";
import { Amount, ME, TODAY, daysBetween, fmtShort, personById, termById } from "./orders";
import { Block, Cell, DocRow } from "./OrderPanel";
import { DocDesk, PanelCtx } from "./DocDesk";
import { ActivityList, LinesTable, MoneyList, RecordShell, StepCard } from "./record";
import { INVOICE_LABEL, InvoiceView, approveChildDoc, docLines, hrefFor, invoiceTone, useSales } from "./flow";
import { ReceiptSheet, ReturnSheet } from "./MoneySheets";

// ════════════════════════════════════════════════════════════════════════════
// INVOICES — what is owed, and getting it paid
//
// Receivables is the default view because that is the question an invoice
// list is opened to answer: what is overdue, what falls due this week, what
// is settled. Overdue is the one group that earns red, and only with rows.
// The record puts the MONEY first (total · paid · credited · balance), then
// the one next step: approve it, take a payment, or nothing.
// ════════════════════════════════════════════════════════════════════════════

export function InvoicesDesk() {
  const { invoices, receipts, credits } = useSales();
  const navigate = useNavigate();
  const rows = React.useMemo(() => [...invoices].sort((a, b) => b.doc.date.localeCompare(a.doc.date)), [invoices]);

  const open = rows.filter((v) => v.doc.state === "approved" && v.balance > 0.005);
  const receivable = open.reduce((s, v) => s + v.balance * v.order.exchangeRate, 0);
  const overdue = open.filter((v) => v.overdueDays > 0);
  const week = open.filter((v) => v.overdueDays === 0 && v.doc.due && daysBetween(TODAY, v.doc.due) <= 7);

  return (
    <DocDesk<InvoiceView>
      section="invoices"
      rows={rows}
      noOf={(v) => v.doc.no}
      customerOf={(v) => v.order.customerId}
      searchText={(v) => `${v.doc.no} ${v.order.no} ${v.customer.name}`}
      stats={[{ label: "Receivable", value: <Amount value={receivable} currency="NPR" /> }]}
      picks={[
        { key: "overdue", label: "Overdue", value: overdue.length, danger: overdue.length > 0, test: (v) => v.overdueDays > 0 },
        { key: "week", label: "Due this week", value: week.length, test: (v) => week.includes(v) },
        { key: "approval", label: "Pending approval", value: rows.filter((v) => v.doc.state === "pending").length, test: (v) => v.doc.state === "pending" },
      ]}
      views={[
        {
          key: "due",
          label: "Receivables",
          icon: Wallet,
          groups: (vs) => [
            { key: "approval", label: "Pending approval", rows: vs.filter((v) => v.doc.state === "pending") },
            { key: "overdue", label: "Overdue", alarm: true, rows: vs.filter((v) => v.overdueDays > 0).sort((a, b) => b.overdueDays - a.overdueDays), right: sum(vs.filter((v) => v.overdueDays > 0)) },
            {
              key: "due",
              label: "Due",
              rows: vs.filter((v) => v.doc.state === "approved" && v.balance > 0.005 && v.overdueDays === 0).sort((a, b) => (a.doc.due ?? "").localeCompare(b.doc.due ?? "")),
              right: sum(vs.filter((v) => v.doc.state === "approved" && v.balance > 0.005 && v.overdueDays === 0)),
            },
            { key: "paid", label: "Paid", collapsed: true, rows: vs.filter((v) => v.doc.state === "approved" && v.balance <= 0.005 && v.stage !== "returned") },
            { key: "returned", label: "Returned", collapsed: true, rows: vs.filter((v) => v.stage === "returned") },
          ],
        },
        {
          key: "customer",
          label: "By customer",
          icon: Users,
          groups: (vs) =>
            Array.from(new Set(vs.map((v) => v.order.customerId))).map((id) => {
              const mine = vs.filter((v) => v.order.customerId === id);
              return { key: id, label: mine[0].customer.name, rows: mine, right: sum(mine.filter((v) => v.balance > 0.005)) };
            }),
        },
      ]}
      columns={[
        { key: "order", label: "Order", width: "84px", render: (v) => <span className={NUM}>{v.order.no}</span> },
        { key: "due", label: "Due", width: "110px", render: (v) => <DueMark v={v} /> },
        { key: "state", label: "Status", width: "124px", render: (v) => <Chip tone={invoiceTone(v)}>{INVOICE_LABEL[v.stage]}</Chip> },
      ]}
      primary={(v) => ({ title: v.customer.name, sub: <DueMark v={v} plain /> })}
      amount={(v) => ({
        value: <Amount value={v.balance > 0.005 ? v.balance : v.total} currency={v.order.currency !== "NPR" ? v.order.currency : undefined} />,
        sub: v.balance > 0.005 && v.balance < v.total - 0.005 ? <>of <Amount value={v.total} className="text-bz-text-soft" /></> : v.balance <= 0.005 ? INVOICE_LABEL[v.stage] : undefined,
      })}
      rowVerb={(v) => (v.doc.state === "approved" && v.balance > 0.005 ? { label: "Receive", icon: Banknote, run: () => navigate(`/design/sales/invoices/${v.doc.no}?do=receive`) } : null)}
      newLabel="Invoice an order"
      onNew={() => navigate("/design/sales/orders?pick=invoice")}
      renderPanel={(v, ctx) => <InvoicePanel key={v.doc.no} v={v} ctx={ctx} receiptsFor={receipts.filter((r) => r.allocations.some((a) => a.invoiceNo === v.doc.no))} creditsFor={credits.filter((c) => c.invoiceNo === v.doc.no || c.applications.some((a) => a.invoiceNo === v.doc.no))} />}
    />
  );
}

const sum = (vs: InvoiceView[]) => <Amount value={vs.reduce((s, v) => s + v.balance * v.order.exchangeRate, 0)} currency="NPR" />;

function DueMark({ v, plain }: { v: InvoiceView; plain?: boolean }) {
  if (v.doc.state === "pending") return <span className="text-bz-text-soft">Awaiting approval</span>;
  if (v.balance <= 0.005) return <span className="text-bz-text-soft">{plain ? `Settled · ${v.order.no}` : "—"}</span>;
  if (v.overdueDays > 0) return <span className="font-semibold text-bz-red">{v.overdueDays}d overdue</span>;
  if (!v.doc.due) return <span className="text-bz-text-soft">No due date</span>;
  const d = daysBetween(TODAY, v.doc.due);
  return <span className={cn(NUM, d <= 7 ? "text-bz-text" : "text-bz-text-muted")}>{d === 0 ? "Due today" : `Due ${fmtShort(v.doc.due)}`}</span>;
}

function InvoicePanel({ v, ctx, receiptsFor, creditsFor }: { v: InvoiceView; ctx: PanelCtx; receiptsFor: ReturnType<typeof useSales>["receipts"]; creditsFor: ReturnType<typeof useSales>["credits"] }) {
  const navigate = useNavigate();
  const [sheet, setSheet] = React.useState<"receive" | "return" | null>(() => (new URLSearchParams(window.location.search).get("do") === "receive" ? "receive" : null));
  const term = termById(v.order.termId);

  if (sheet) {
    return (
      <RecordShell
        ctx={ctx}
        no={v.doc.no}
        back={{ label: v.doc.no, onClick: () => setSheet(null) }}
        title={sheet === "receive" ? "Receive payment" : "Return goods"}
        meta={[<span key="c">{v.customer.name}</span>, <span key="b">Balance <Amount value={v.balance} /></span>]}
      >
        <div className="flex h-full min-h-0 flex-col">
          {sheet === "receive" ? (
            <ReceiptSheet
              customerId={v.order.customerId}
              invoiceNo={v.doc.no}
              onCancel={() => setSheet(null)}
              onDone={(no) => {
                setSheet(null);
                ctx.show("success", `${no} recorded`, { label: "Open", run: () => navigate(hrefFor(no)) });
              }}
            />
          ) : (
            <ReturnSheet
              invoice={v}
              onCancel={() => setSheet(null)}
              onDone={(no) => {
                setSheet(null);
                ctx.show("success", `${no} raised · waiting on your approval`, { label: "Open", run: () => navigate(hrefFor(no)) });
              }}
            />
          )}
        </div>
      </RecordShell>
    );
  }

  const canReturn = v.doc.state === "approved" && v.stage !== "returned";
  let step: React.ReactNode;
  if (v.doc.state === "pending") {
    const mine = v.doc.approverId === ME.id;
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        title={mine ? "Waiting on your approval" : <span className="inline-flex items-center gap-1.5">Waiting on <Avatar person={personById(v.doc.approverId ?? "")} size={16} /> {personById(v.doc.approverId ?? "")?.name}</span>}
        sub="Nothing posts to the ledger until it is approved."
        tone={mine ? "plain" : "quiet"}
        actions={
          mine && (
            <button type="button" className={cn(BTN, "h-8")} onClick={() => (approveChildDoc(v.order.no, v.doc.no), ctx.show("success", `${v.doc.no} approved`))}>
              Approve
            </button>
          )
        }
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
              <button type="button" className={GHOST_SM} onClick={() => setSheet("return")}>
                <Undo2 size={12} /> Return goods
              </button>
            )}
            <button type="button" className={cn(BTN, "h-8")} onClick={() => setSheet("receive")}>
              <Banknote size={13} /> Receive payment <Kbd>R</Kbd>
            </button>
          </>
        }
      />
    );
  } else {
    step = (
      <StepCard
        icon={<CircleCheck size={15} />}
        tone="done"
        title={v.stage === "returned" ? "Returned in full" : "Paid in full"}
        sub={v.returned > 0 && v.stage !== "returned" ? <><Amount value={v.returned} /> of it came back as a return</> : undefined}
        actions={
          canReturn && (
            <button type="button" className={GHOST_SM} onClick={() => setSheet("return")}>
              <Undo2 size={12} /> Return goods
            </button>
          )
        }
      />
    );
  }

  return (
    <RecordShell
      ctx={ctx}
      no={v.doc.no}
      chips={<Chip tone={invoiceTone(v)}>{v.overdueDays > 0 ? `${INVOICE_LABEL[v.stage]} · overdue` : INVOICE_LABEL[v.stage]}</Chip>}
      title={v.customer.name}
      amount={<Amount value={v.total} currency={v.order.currency} />}
      meta={[
        <span key="d" className={NUM}>{fmtShort(v.doc.date)}</span>,
        <span key="t">{term?.name}</span>,
        <DocLink key="o" no={v.order.no} kind="Order" onClick={() => navigate(hrefFor(v.order.no))} />,
      ]}
      onPrint={() => ctx.show("info", `Preparing ${v.doc.no} for print…`)}
      menu={(close) => (
        <>
          <MenuItem icon={Banknote} disabled={!(v.doc.state === "approved" && v.balance > 0.005)} onClick={() => (close(), setSheet("receive"))}>
            Receive payment
          </MenuItem>
          <MenuItem icon={Undo2} disabled={!canReturn} onClick={() => (close(), setSheet("return"))}>
            Return goods
          </MenuItem>
          <MenuItem icon={Printer} onClick={() => (close(), ctx.show("info", `Preparing ${v.doc.no} for print…`))}>
            Print
          </MenuItem>
        </>
      )}
    >
      <KeyR onPress={() => v.doc.state === "approved" && v.balance > 0.005 && setSheet("receive")} />
      {step}

      <Block title="Money">
        <MoneyList
          className="mt-0 max-w-none"
          rows={[
            { label: "Invoice total", value: <Amount value={v.total} /> },
            { label: `Paid${receiptsFor.filter((r) => r.state === "approved").length ? ` · ${receiptsFor.filter((r) => r.state === "approved").length} receipt${receiptsFor.length === 1 ? "" : "s"}` : ""}`, value: v.paid ? <>−<Amount value={v.paid} /></> : "—" },
            ...(v.credited > 0 ? [{ label: "Credited by returns", value: <>−<Amount value={v.credited} /></> }] : []),
            { label: "Balance", value: <Amount value={v.balance} currency={v.order.currency} />, strong: true, danger: v.overdueDays > 0 },
          ]}
        />
      </Block>

      <Block title="Lines" count={v.doc.lines.length}>
        <LinesTable rows={docLines(v).map((x) => ({ line: x.line, qty: x.qty }))} />
      </Block>

      <Block title="Documents" count={receiptsFor.length + creditsFor.length + 1}>
        <div className="flex flex-col gap-1.5">
          <DocRow icon={ReceiptText} no={v.order.no} kind="Order" meta={<span className={NUM}>{fmtShort(v.order.date)}</span>} chip={<Chip tone="neutral" dot={false}>Source</Chip>} onClick={() => navigate(hrefFor(v.order.no))} />
          {receiptsFor.map((r) => (
            <DocRow
              key={r.no}
              icon={Banknote}
              no={r.no}
              kind="Receipt"
              meta={<>{r.mode} · <Amount value={r.allocations.find((a) => a.invoiceNo === v.doc.no)?.amount ?? 0} /></>}
              chip={r.state === "pending" ? <Chip tone="pending">Awaiting approval</Chip> : <Chip tone={r.posted ? "positive" : "partial"}>{r.posted ? "Posted" : "Undeposited"}</Chip>}
              onClick={() => navigate(hrefFor(r.no))}
            />
          ))}
          {creditsFor.map((c) => (
            <DocRow key={c.no} icon={Undo2} no={c.no} kind="Return" meta={c.reason} chip={c.state === "pending" ? <Chip tone="pending">Awaiting approval</Chip> : <Chip tone="positive">Approved</Chip>} onClick={() => navigate(hrefFor(c.no))} />
          ))}
        </div>
      </Block>

      <Block title="Details">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-line-soft sm:grid-cols-2">
          <Cell label="Customer">
            {v.customer.name}
            <span className="block text-[10.5px] text-bz-text-soft">PAN {v.customer.pan}</span>
          </Cell>
          <Cell label="Terms">
            {term?.name}
            <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>Due {v.doc.due ? fmtShort(v.doc.due) : "—"}</span>
          </Cell>
          <Cell label="Invoice date"><span className={NUM}>{fmtShort(v.doc.date)}</span></Cell>
          <Cell label="Raised by">
            <span className="inline-flex items-center gap-1.5"><Avatar person={personById(v.doc.byId)} size={18} /> {personById(v.doc.byId)?.name}</span>
          </Cell>
        </div>
      </Block>

      <ActivityList comments={[]} history={v.order.history.filter((h) => h.what.includes(v.doc.no))} />
    </RecordShell>
  );
}

function KeyR({ onPress }: { onPress: () => void }) {
  const ref = React.useRef(onPress);
  ref.current = onPress;
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey) ref.current();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);
  return null;
}

export { Plus };
