import * as React from "react";
import { useNavigate } from "react-router";
import { Ban, Banknote, Check, CircleCheck, Clock3, ListTree, Table2, UserRound, Wallet } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, GHOST_SM, LABEL, MenuItem, MenuSep, NUM, Stat, Statline } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { Amount } from "../sales/orders";
import { Cell, CellGrid, ReasonDialog } from "../sales/parts";
import type { ReceiptMoney } from "../sales/flow";
import { ReceiptMoneyView, receiptTask } from "../sales/receipt-use";
import { Block, CustomerTitle, RecordShell, StepCard } from "../sales/record";
import { ordersStore, useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Customer, LedgerEntry, PayMethod } from "./data";
import { accountOf, customerById, day, npr } from "./engine";
import { confirmReceipt, linkedDiscounts, newReceiptPath, receiptOnDesk, receiptPath, receiptMoney, receiptTodo, rejectReceipt, senderOf } from "./receipts";
import { customersStore, hubStore, ledgerStore, repsStore, typesStore } from "./store";
import { FxDate, FxDesk } from "./fx-desk";
import { SfActivity, SfNoteFoot, sfPath } from "./sf";
import { METHOD_LABEL, senderText } from "./sell-kit";

// ════════════════════════════════════════════════════════════════════════════
// TRADE · RECEIPTS — the customer receipts of our customers
//
// A payment IS the sales desk's customer receipt (owner decision #31): the
// number here is the receipt's own, and there is no second record. A dealer's
// bank transfer or cheque sent on the portal, and a rep's cash collection,
// arrive as receipts waiting for approval: they count for nothing until
// accounts confirm them here (decision #17). Confirming approves the receipt,
// so the customer's outstanding drops and their credit frees up; rejecting
// sends it back and says why on the customer's history. What the office
// receives itself is recorded on the sales desk's own receipt form.
//
// A receipt is only ever applied to invoices, and nothing is applied by itself
// (decision #33). A receipt may say which sales orders its money is for; once
// such an order is invoiced the receipt waits here TO APPLY, and when the order
// was rejected or cancelled it waits with an ORDER TO CHANGE. Both are done on
// the customer receipt's own edit form.
//
// The list reads the customer's account — the ledger's Receipt rows, which
// follow the desk's receipts — and every decision goes through receipts.ts.
// ════════════════════════════════════════════════════════════════════════════

/** The rules live in receipts.ts; other pages take them from here as before. */
export { confirmReceipt, linkedDiscounts };

const METHODS: PayMethod[] = ["bank", "cheque", "cash", "wallet"];
const VIA = { rep: "A rep", portal: "The portal", office: "The office" } as const;

const discountOf = (r: LedgerEntry, ledger: LedgerEntry[]) => linkedDiscounts(r, ledger).reduce((s, x) => s + x.credit, 0);

type Settled = { key: string; doc: string; due: string | null; amount: number; applied: number; left: number };

/**
 * The account without this receipt (and its discount) and with it — `accountOf` read twice, never a second copy of
 * the ledger maths. The invoices whose open amount drops between the two are the ones it settles.
 */
function effect(r: LedgerEntry, ledger: LedgerEntry[]) {
  const c = customerById(r.customerId);
  const ids = new Set([r.id, ...linkedDiscounts(r, ledger).map((x) => x.id)]);
  const without = accountOf(r.customerId, ledger.map((x) => (ids.has(x.id) ? { ...x, pending: true } : x)));
  const withIt = accountOf(r.customerId, ledger.map((x) => (ids.has(x.id) ? { ...x, pending: false } : x)));
  const limit = c?.creditLimit ?? null;
  const openAfter = new Map(withIt.invoices.map((i) => [`${i.doc}|${i.date}`, i.open]));
  const settles: Settled[] = without.invoices
    .map((i) => {
      const key = `${i.doc}|${i.date}`;
      const left = openAfter.get(key) ?? 0;
      return { key, doc: i.doc, due: i.due, amount: i.amount, applied: i.open - left, left };
    })
    .filter((s) => s.applied > 0);
  return {
    limit,
    outBefore: without.outstanding,
    outAfter: withIt.outstanding,
    overdue: (r.pending ? without : withIt).overdue,
    before: limit === null ? null : Math.max(0, limit - without.outstanding),
    after: limit === null ? null : Math.max(0, limit - withIt.outstanding),
    settles,
  };
}

/** `todo` = what the office still has to do with it. */
type Row = { r: LedgerEntry; c: Customer | undefined; disc: number; fx: ReturnType<typeof effect>; todo: "retag" | "apply" | null };
const rowOf = (r: LedgerEntry, ledger: LedgerEntry[]): Row => ({ r, c: customerById(r.customerId), disc: discountOf(r, ledger), fx: effect(r, ledger), todo: receiptTodo(r.customerId, r.doc) });

const sum = (rs: Row[]) => rs.reduce((s, x) => s + x.r.credit, 0);
const isPending = (x: Row) => !!x.r.pending;
const thisMonth = (x: Row) => !x.r.pending && x.r.date.slice(0, 7) === SF_TODAY.slice(0, 7);
const toRetag = (x: Row) => x.todo === "retag";
const toApply = (x: Row) => x.todo === "apply";
const count = (n: number) => `${n} ${n === 1 ? "receipt" : "receipts"}`;

export function PaymentsPage() {
  const navigate = useNavigate();
  const ledger = useStore(ledgerStore);
  const customers = useStore(customersStore);
  // Who sent a receipt is read from the reps, and what is overdue from the type's grace days.
  const reps = useStore(repsStore);
  const types = useStore(typesStore);
  // An order rejected here, or cancelled on the sales desk, changes what a receipt tagged to it has to do.
  const hub = useStore(hubStore);
  const deskOrders = useStore(ordersStore);

  const rows = React.useMemo<Row[]>(
    () =>
      ledger
        .filter((r) => r.kind === "Receipt")
        .sort((a, b) => b.date.localeCompare(a.date) || b.doc.localeCompare(a.doc))
        .map((r) => rowOf(r, ledger)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ledger, customers, reps, types, hub, deskOrders],
  );
  const total = (rs: Row[]) => (rs.length ? <Amount value={sum(rs)} currency="NPR" /> : undefined);
  const payers = customers.filter((c) => rows.some((x) => x.r.customerId === c.id));

  return (
    <FxDesk<Row>
      place="payments"
      section="salesforce/payments"
      noun={["receipt", "receipts"]}
      rows={rows}
      noOf={(x) => x.r.doc}
      numberOf={(x) => x.r.doc}
      numberWidth="88px"
      rowLabel={(x) => x.r.doc}
      dateOf={(x) => x.r.date}
      searchText={(x) => `${x.r.doc} ${x.c?.name ?? ""} ${x.r.reference ?? ""} ${x.r.by ?? ""} ${x.r.method ? METHOD_LABEL[x.r.method] : ""}`}
      searchPlaceholder="Number, customer or reference"
      picks={[
        { key: "pending", label: "To confirm", value: <Amount value={sum(rows.filter(isPending))} currency="NPR" />, test: isPending, title: count(rows.filter(isPending).length) },
        { key: "retag", label: "Order to change", value: rows.filter(toRetag).length, test: toRetag, danger: rows.some(toRetag), title: "The order it is for was rejected or cancelled, or needs no more money" },
        { key: "apply", label: "To apply", value: rows.filter(toApply).length, test: toApply, title: "Its order is invoiced, or an invoice is open" },
        { key: "month", label: "Confirmed this month", value: <Amount value={sum(rows.filter(thisMonth))} currency="NPR" />, test: thisMonth, title: count(rows.filter(thisMonth).length) },
      ]}
      views={[
        {
          key: "queue",
          label: "Queue",
          icon: ListTree,
          groups: (rs) => [
            { key: "pending", label: "To confirm", rows: rs.filter(isPending), right: total(rs.filter(isPending)), empty: "Nothing to confirm." },
            { key: "retag", label: "Order to change", alarm: true, rows: rs.filter((x) => !isPending(x) && toRetag(x)) },
            { key: "apply", label: "To apply", rows: rs.filter((x) => !isPending(x) && toApply(x)) },
            { key: "month", label: "Confirmed this month", rows: rs.filter((x) => thisMonth(x) && !x.todo), right: total(rs.filter((x) => thisMonth(x) && !x.todo)) },
            { key: "earlier", label: "Confirmed earlier", collapsed: true, rows: rs.filter((x) => !isPending(x) && !thisMonth(x) && !x.todo) },
          ],
        },
        { key: "register", label: "Register", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
      ]}
      filters={[
        { value: "st:pending", label: "To confirm", group: "Status", test: isPending },
        { value: "st:confirmed", label: "Confirmed", group: "Status", test: (x: Row) => !isPending(x) },
        { value: "st:retag", label: "Order to change", group: "Status", test: toRetag },
        { value: "st:apply", label: "To apply", group: "Status", test: toApply },
        ...METHODS.map((m) => ({ value: `m:${m}`, label: METHOD_LABEL[m], group: "Method", test: (x: Row) => x.r.method === m })),
        ...(Object.keys(VIA) as (keyof typeof VIA)[]).map((v) => ({ value: `via:${v}`, label: VIA[v], group: "From", test: (x: Row) => senderOf(x.r)?.via === v })),
        ...payers.map((c) => ({ value: `cus:${c.id}`, label: c.name, hint: c.code, group: "Customer", test: (x: Row) => x.r.customerId === c.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (x) => x.r.date + x.r.doc, desc: true },
        { key: "old", label: "Oldest", by: (x) => x.r.date + x.r.doc },
        { key: "val", label: "Amount", by: (x) => x.r.credit, desc: true },
        { key: "cus", label: "Customer", by: (x) => x.c?.name ?? "" },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (x) => <FxDate iso={x.r.date} /> },
        { key: "method", label: "Method", width: "96px", render: (x) => (x.r.method ? METHOD_LABEL[x.r.method] : <span className="text-bz-text-soft">—</span>) },
      ]}
      primary={(x) => ({
        title: x.c?.name ?? "Removed customer",
        sub: [x.r.reference ? `ref ${x.r.reference}` : "", senderText(x.r), x.disc ? `includes NPR ${npr(x.disc)} early-payment discount` : ""].filter(Boolean).join(" · "),
        subOnDesktop: true,
      })}
      status={(x) =>
        x.r.pending
          ? { label: "To confirm", tone: "warn", icon: Clock3 }
          : x.todo === "retag"
            ? { label: "Order to change", tone: "bad", icon: Ban }
            : x.todo === "apply"
              ? { label: "To apply", tone: "warn", icon: Banknote }
              : { label: "Confirmed", tone: "good", icon: CircleCheck }
      }
      amount={(x) => ({ value: <Amount value={x.r.credit} /> })}
      rowVerb={(x) => (x.r.pending ? { label: "Confirm", icon: Check, run: () => confirmReceipt(x.r.doc) } : null)}
      bulk={[
        {
          label: "Confirm",
          icon: Check,
          enabled: (rs) => rs.some(isPending),
          run: (rs) => {
            const skipped: string[] = [];
            const skippedIds: string[] = [];
            let done = 0;
            rs.forEach((x) => {
              if (x.r.pending) {
                confirmReceipt(x.r.doc);
                done++;
              } else {
                skipped.push(`${x.r.doc} is already confirmed`);
                skippedIds.push(x.r.doc);
              }
            });
            return { done, skipped, verb: "confirmed", skippedIds };
          },
        },
      ]}
      newLabel="New receipt"
      onNew={() => navigate(newReceiptPath())}
      renderPanel={(x, ctx) => <PaymentPanel key={x.r.id} row={x} ctx={ctx} />}
    />
  );
}

// ── The record: one receipt ─────────────────────────────────────────────────

function PaymentPanel({ row, ctx }: { row: Row; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const ledger = useStore(ledgerStore);
  const [rejecting, setRejecting] = React.useState(false);
  const { r, c, disc, fx } = row;
  // Where its money goes — the orders it is for and the invoices it is applied to — read and changed here, pot by pot.
  const money: ReceiptMoney | null = r.applied ? receiptMoney(r.customerId, r.doc) : null;
  const waits = money ? receiptTask(money, !r.pending) !== null : false;
  const sender = senderOf(r);
  const discounts = linkedDiscounts(r, ledger);
  const openCustomer = () => navigate(sfPath(`customers/${r.customerId}`));
  const openReceipt = receiptOnDesk(r.doc, r.customerId) ? (
    <button type="button" className={GHOST_SM} onClick={() => navigate(receiptPath(r.doc))}>
      Open customer receipt
    </button>
  ) : undefined;

  const confirm = () => {
    confirmReceipt(r.doc);
    ctx.show("success", `${r.doc} confirmed`);
  };

  // The record's own step and the account figures; with a receipt that names its orders they sit under what waits.
  const head = (
    <>
          {r.pending ? (
            <StepCard
              icon={<Wallet size={15} />}
              title="Waiting to be confirmed"
              sub={disc > 0 ? `Its NPR ${npr(disc)} early-payment discount is confirmed or rejected with it.` : undefined}
              actions={
                <>
                  {openReceipt}
                  <button type="button" className={GHOST_SM} onClick={() => setRejecting(true)}>
                    Reject
                  </button>
                  <button type="button" className={cn(BTN, "h-8")} onClick={confirm}>
                    <Check size={13} /> Confirm
                  </button>
                </>
              }
            />
          ) : waits ? null : (
            <StepCard tone="done" icon={<CircleCheck size={15} />} title="Confirmed" sub={`Counts on ${c?.name ?? "the customer"}'s account.`} actions={openReceipt} />
          )}

          <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
            <Statline className="pt-3">
              <Stat label="Credit limit" value={fx.limit === null ? "No check" : fx.limit === 0 ? "Cash only" : <Amount value={fx.limit} />} />
              <Stat label="Owes" value={<Amount value={r.pending ? fx.outBefore : fx.outAfter} />} />
              {fx.overdue > 0 && <Stat label="Overdue" value={<Amount value={fx.overdue} />} danger />}
              {r.pending && fx.before !== null && <Stat label="Available" value={<Amount value={fx.before} />} />}
              {!r.pending && fx.after !== null && <Stat label="Available" value={<Amount value={fx.after} />} />}
              {r.pending && (fx.after === null ? <Stat label="Owes after" value={<Amount value={fx.outAfter} />} title="What the customer owes once this counts" /> : <Stat label="Available after" value={<Amount value={fx.after} />} title="Credit available once this counts" />)}
              {!r.pending && (fx.before === null ? <Stat label="Owed before" value={<Amount value={fx.outBefore} />} title="What the customer owed without this payment" /> : <Stat label="Available before" value={<Amount value={fx.before} />} title="Credit available without this payment" />)}
            </Statline>
          </div>
    </>
  );

  return (
    <RecordShell
      ctx={ctx}
      no={r.doc}
      chips={<Chip tone={r.pending ? "pending" : row.todo === "retag" ? "danger" : row.todo === "apply" ? "partial" : "positive"}>{r.pending ? "To confirm" : row.todo === "retag" ? "Order to change" : row.todo === "apply" ? "To apply" : "Confirmed"}</Chip>}
      title={c ? <CustomerTitle name={c.name} onOpen={openCustomer} /> : "Removed customer"}
      amount={<Amount value={r.credit} currency="NPR" />}
      meta={[
        <span key="d" className={NUM}>
          {day(r.date)}
        </span>,
        ...(r.method ? [<span key="m">{METHOD_LABEL[r.method]}</span>] : []),
        ...(sender ? [<span key="s">{senderText(r).replace(/^\w/, (x) => x.toUpperCase())}</span>] : []),
      ]}
      menu={
        c || r.pending
          ? (close) => (
              <>
                {c && (
                  <MenuItem icon={UserRound} onClick={() => (close(), openCustomer())}>
                    Open customer
                  </MenuItem>
                )}
                {c && r.pending && <MenuSep />}
                {r.pending && (
                  <MenuItem icon={Ban} danger onClick={() => (close(), setRejecting(true))}>
                    Reject receipt…
                  </MenuItem>
                )}
              </>
            )
          : undefined
      }
      foot={<SfNoteFoot id={r.id} />}
    >
      {money ? (
        <ReceiptMoneyView money={money} approved={!r.pending} top={head} onOrder={(no) => navigate(sfPath(`orders/${no}`))} show={ctx.show} />
      ) : (
        <>
          {head}
        <Block title={r.pending ? "Settles" : "Settled"} count={fx.settles.length}>
          {fx.settles.length === 0 ? (
            <p className="m-0 text-[11.5px] text-bz-text-soft">No open invoice to settle.</p>
          ) : (
            <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
              <div className={cn("hidden grid-cols-[minmax(0,1fr)_104px_104px] gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
                <span>Invoice</span>
                <span className="text-right">{r.pending ? "Settles" : "Settled"}</span>
                <span className="text-right">Still due</span>
              </div>
              {fx.settles.map((s) => (
                <div key={s.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-bz-line-soft px-3 py-2 text-[12px] last:border-0 sm:grid-cols-[minmax(0,1fr)_104px_104px]">
                  <span className="min-w-0">
                    <span className={cn("block truncate font-medium text-bz-text", NUM)}>{s.doc}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {s.due ? `due ${day(s.due)} · ` : ""}of {npr(s.amount)}
                    </span>
                  </span>
                  <span className="text-right font-semibold text-bz-text">
                    <Amount value={s.applied} />
                  </span>
                  <span className="hidden text-right sm:block">{s.left > 0 ? <Amount value={s.left} className="text-bz-text-muted" /> : <Chip tone="positive">Paid</Chip>}</span>
                </div>
              ))}
            </div>
          )}
        </Block>
        </>
      )}

      <Block title="Details">
        <CellGrid>
          <Cell label="Method">{r.method ? METHOD_LABEL[r.method] : <span className="text-bz-text-soft">—</span>}</Cell>
          <Cell label="Reference">{r.reference ? <span className={NUM}>{r.reference}</span> : <span className="text-bz-text-soft">—</span>}</Cell>
          <Cell label="From">
            {sender ? sender.name : <span className="text-bz-text-soft">—</span>}
            {sender && <span className="block text-[10.5px] text-bz-text-soft">{sender.via === "rep" ? "Collected by a rep" : sender.via === "portal" ? "Sent on the portal" : "Recorded in the office"}</span>}
          </Cell>
          {disc > 0 && (
            <Cell label="Early-payment discount">
              <Amount value={disc} />
              <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{discounts.map((x) => x.doc).join(", ")}</span>
            </Cell>
          )}
          {r.note && (
            <Cell label="Note" wide>
              {r.note}
            </Cell>
          )}
        </CellGrid>
      </Block>

      <SfActivity ids={[r.id, r.doc]} />

      <ReasonDialog
        open={rejecting}
        eyebrow={r.doc}
        title={`Reject ${r.doc}?`}
        body={`It is removed and ${c?.name ?? "the customer"} still owes the money.`}
        confirm="Reject receipt"
        danger
        onClose={() => setRejecting(false)}
        onConfirm={(reason) => {
          setRejecting(false);
          rejectReceipt(r.doc, reason);
          ctx.show("info", `${r.doc} rejected`);
          ctx.go(null);
        }}
      />
    </RecordShell>
  );
}

// ── For a host that is not this page (the Today queue) ──────────────────────

/** One receipt's record, by its number. */
export function PaymentPeek({ id, ctx }: { id: string; ctx: PanelCtx }) {
  const ledger = useStore(ledgerStore);
  useStore(customersStore);
  useStore(repsStore);
  useStore(typesStore);
  useStore(hubStore);
  useStore(ordersStore);
  const r = ledger.find((x) => x.kind === "Receipt" && x.doc === id);
  if (!r) return null;
  return <PaymentPanel key={r.id} row={rowOf(r, ledger)} ctx={ctx} />;
}

export const PAYMENTS_ROUTES = [
  { path: "design/salesforce/payments", Component: PaymentsPage },
  { path: "design/salesforce/payments/:no", Component: PaymentsPage },
];
