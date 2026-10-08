import * as React from "react";
import { Ban, Banknote, Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, Dialog, GHOST, GHOST_SM, NUM } from "./bzw";
import type { Tone } from "./bzw";
import { Amount, fmtShort } from "./orders";
import type { ReceiptMoney, ReceiptOrderPot, ReceiptTagUse } from "./flow";
import { AmountInput } from "./parts";
import { Block, MoneyList, StepCard } from "./record";

// ════════════════════════════════════════════════════════════════════════════
// WHERE A RECEIPT'S MONEY GOES — pot by pot (decision #33)
//
// A receipt is only ever applied to invoices. It may also say which SALES
// ORDERS its money is for. The record shows the money the way a person thinks
// of it — each order it is for, with THAT ORDER'S invoice only, then the money
// for no order — so every rupee sits in one place and the next step sits
// beside it: Apply on the order's invoice, Move when the order is gone, Put on
// an order / Apply to an invoice for the money for no order. A list of every
// open order or invoice appears only when someone asks to choose one.
//
// Nothing is applied by itself; the receipt form only takes the money in.
// Shared by the receipt's record on the sales desk and in Sales force.
// ════════════════════════════════════════════════════════════════════════════

export const RECEIPT_TAG: Record<ReceiptTagUse["state"], { label: string; tone: Tone }> = {
  waiting: { label: "Not invoiced yet", tone: "pending" },
  invoiced: { label: "To apply", tone: "partial" },
  applied: { label: "Applied", tone: "positive" },
  spare: { label: "Needs no more", tone: "danger" },
  dead: { label: "Rejected or cancelled", tone: "danger" },
};

type Show = (kind: "success" | "info" | "error", text: string) => void;
type Task = { kind: "move"; pot: ReceiptOrderPot } | { kind: "apply"; pot: ReceiptOrderPot } | { kind: "loose" } | null;

const gone = (p: ReceiptOrderPot) => p.state === "dead" || p.state === "spare";
const canApply = (p: ReceiptOrderPot) => p.invoices.reduce((sum, i) => sum + i.canApply, 0);
const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The one thing waiting on the receipt, if any. Moving a reference can be done before approval; applying cannot. */
export function receiptTask(m: ReceiptMoney, approved: boolean): Task {
  const bad = m.orders.find((p) => gone(p) && p.open > 0.005);
  if (bad) return { kind: "move", pot: bad };
  if (!approved) return null;
  const ready = m.orders.find((p) => canApply(p) > 0.005);
  if (ready) return { kind: "apply", pot: ready };
  return m.loose.open > 0.005 && m.invoiceChoices.length > 0 ? { kind: "loose" } : null;
}

/** The receipt's money: what waits (a card), then `top` (the record's own step), then the pots. */
export function ReceiptMoneyView({ money: m, approved, top, onOrder, show }: { money: ReceiptMoney; approved: boolean; top?: React.ReactNode; onOrder: (orderNo: string) => void; show: Show }) {
  const [placing, setPlacing] = React.useState<{ from: string | null } | null>(null);
  const [applying, setApplying] = React.useState(false);
  const task = receiptTask(m, approved);
  /** The early-payment discount on one invoice — a credit note sent with this receipt. */
  const discountOn = (invoiceNo: string) => m.discount?.invoices.filter((x) => x.invoiceNo === invoiceNo).reduce((sum, x) => sum + x.amount, 0) ?? 0;
  const applied = m.orders.reduce((sum, p) => sum + p.invoices.reduce((n, i) => n + i.applied, 0), 0) + m.loose.invoices.reduce((sum, i) => sum + i.applied, 0);
  const advance = m.loose.open + m.orders.reduce((sum, p) => sum + p.open, 0);

  const applyPot = (p: ReceiptOrderPot) => {
    let total = 0;
    for (const i of p.invoices) {
      if (i.canApply <= 0) continue;
      const refusal = m.apply(i.invoiceNo, i.canApply);
      if (refusal) return show("error", refusal);
      total += i.canApply;
    }
    show("success", `${fmt(total)} applied to ${p.orderNo}'s invoice`);
  };
  const applyOne = (invoiceNo: string, amount: number) => {
    const refusal = m.apply(invoiceNo, amount);
    show(refusal ? "error" : "success", refusal ?? `${fmt(amount)} applied to ${invoiceNo}`);
  };
  const undo = (invoiceNo: string) => {
    const refusal = m.unapply(invoiceNo);
    show(refusal ? "error" : "info", refusal ?? `Taken off ${invoiceNo}`);
  };
  /** Take an order off the receipt: what was not applied becomes money for no order. */
  const takeOff = (orderNo: string) => {
    const p = m.orders.find((x) => x.orderNo === orderNo);
    if (!p) return;
    const kept = p.amount - p.open;
    const refusal = m.setOrders([...m.orders.filter((x) => x.orderNo !== orderNo).map((x) => ({ orderNo: x.orderNo, amount: x.amount })), ...(kept > 0.005 ? [{ orderNo, amount: kept }] : [])]);
    show(refusal ? "error" : "info", refusal ?? `${orderNo} taken off — ${fmt(p.open)} is for no order now`);
  };

  return (
    <>
      {task?.kind === "move" && (
        <StepCard
          tone="danger"
          icon={<Ban size={15} />}
          title={`${task.pot.orderNo} ${task.pot.state === "dead" ? "was rejected or cancelled" : "needs no more money"}`}
          sub={
            <>
              <Amount value={task.pot.open} /> of this receipt is for it.
            </>
          }
          actions={
            m.orderChoices.length > 0 ? (
              <button type="button" className={cn(BTN, "h-8")} onClick={() => setPlacing({ from: task.pot.orderNo })}>
                Move to another order
              </button>
            ) : (
              <button type="button" className={cn(BTN, "h-8")} onClick={() => takeOff(task.pot.orderNo)}>
                Take it off the order
              </button>
            )
          }
        />
      )}
      {task?.kind === "apply" && (
        <StepCard
          icon={<Banknote size={15} />}
          title={`${task.pot.orderNo} is invoiced`}
          sub={
            <>
              <Amount value={canApply(task.pot)} /> of this receipt can go on its invoice
              {task.pot.discount ? (
                <>
                  , with a <Amount value={task.pot.discount.amount} /> early-payment discount
                </>
              ) : null}
              .
            </>
          }
          actions={
            <button type="button" className={cn(BTN, "h-8")} onClick={() => applyPot(task.pot)}>
              <Banknote size={12} /> Apply
            </button>
          }
        />
      )}
      {task?.kind === "loose" && (
        <StepCard
          icon={<Banknote size={15} />}
          title={
            <>
              <Amount value={m.loose.open} /> is not for any order
            </>
          }
          sub="An invoice is open."
          actions={
            <button type="button" className={cn(BTN, "h-8")} onClick={() => setApplying(true)}>
              Apply to an invoice
            </button>
          }
        />
      )}
      {top}

      <Block
        title="For orders"
        count={m.orders.length}
        right={
          m.loose.open > 0.005 &&
          m.orderChoices.length > 0 && (
            <button type="button" className={GHOST_SM} onClick={() => setPlacing({ from: null })}>
              <Plus size={12} /> Add an order
            </button>
          )
        }
      >
        {m.orders.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Not for any order.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {m.orders.map((p) => (
              <div key={p.orderNo} className={cn("overflow-hidden rounded-bz-md border", gone(p) && p.open > 0.005 ? "border-bz-red-mark/50" : "border-bz-line-soft")}>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-3 py-2 text-[12px]">
                  <button type="button" onClick={() => onOrder(p.orderNo)} className={cn("font-semibold text-bz-text underline-offset-2 hover:underline", NUM)}>
                    {p.orderNo}
                  </button>
                  <Chip tone={RECEIPT_TAG[p.state].tone}>{RECEIPT_TAG[p.state].label}</Chip>
                  <Amount value={p.amount} className="ml-auto font-semibold text-bz-text" />
                </div>
                {gone(p) && p.open > 0.005 ? (
                  <div className="flex flex-wrap items-center gap-2 border-t border-bz-line-soft bg-bz-red-soft/40 px-3 py-2 text-[11.5px]">
                    <span className="text-bz-red">
                      <Amount value={p.open} /> needs another order
                    </span>
                    <span className="ml-auto flex gap-1.5">
                      {m.orderChoices.length > 0 && (
                        <button type="button" className={GHOST_SM} onClick={() => setPlacing({ from: p.orderNo })}>
                          Move
                        </button>
                      )}
                      <button type="button" className={GHOST_SM} onClick={() => takeOff(p.orderNo)}>
                        Take it off
                      </button>
                    </span>
                  </div>
                ) : p.invoices.length === 0 ? (
                  <p className="m-0 border-t border-bz-line-soft px-3 py-2 text-[11.5px] text-bz-text-soft">No invoice yet. The money waits for it.</p>
                ) : (
                  p.invoices.map((i) => (
                    <div key={i.invoiceNo} className="flex min-h-[40px] flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-bz-line-soft px-3 py-1.5 text-[12px]">
                      <span className="text-bz-text-muted">
                        Invoice <span className={cn("font-medium text-bz-text", NUM)}>{i.invoiceNo}</span>
                      </span>
                      {discountOn(i.invoiceNo) > 0 && (
                        <span className="text-bz-text-muted">
                          · discount <Amount value={discountOn(i.invoiceNo)} className="font-medium text-bz-text" />
                        </span>
                      )}
                      {p.discount?.invoiceNo === i.invoiceNo && (
                        <span className="text-bz-text-muted">
                          · early-payment discount <Amount value={p.discount.amount} className="font-medium text-bz-text" /> with the Apply
                        </span>
                      )}
                      {i.applied > 0.005 && (
                        <span className="text-bz-text-muted">
                          · applied <Amount value={i.applied} className="font-medium text-bz-text" />{" "}
                          <button type="button" onClick={() => undo(i.invoiceNo)} className="text-[11px] text-bz-text-soft underline underline-offset-2 hover:text-bz-text">
                            Undo
                          </button>
                        </span>
                      )}
                      <span className="ml-auto">
                        {i.canApply > 0.005 ? (
                          approved ? (
                            <button type="button" className={GHOST_SM} onClick={() => applyOne(i.invoiceNo, i.canApply)}>
                              Apply <Amount value={i.canApply} />
                            </button>
                          ) : (
                            <span className="text-[11px] text-bz-text-soft">Apply once approved</span>
                          )
                        ) : i.applied > 0.005 ? null : (
                          <span className="text-[11px] text-bz-text-soft">Paid</span>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </Block>

      {m.loose.amount > 0.005 && (
        <Block title="Not for any order" right={<Amount value={m.loose.amount} className="text-[12px] font-semibold text-bz-text" />}>
          {m.loose.invoices.map((i) => (
            <div key={i.invoiceNo} className="flex min-h-[36px] flex-wrap items-center gap-x-2.5 border-b border-bz-line-soft text-[12px]">
              <span className="text-bz-text-muted">
                Invoice <span className={cn("font-medium text-bz-text", NUM)}>{i.invoiceNo}</span>
                {discountOn(i.invoiceNo) > 0 && (
                  <>
                    {" "}
                    · discount <Amount value={discountOn(i.invoiceNo)} className="font-medium text-bz-text" />
                  </>
                )}{" "}
                · applied <Amount value={i.applied} className="font-medium text-bz-text" />
              </span>
              <button type="button" onClick={() => undo(i.invoiceNo)} className="ml-auto text-[11px] text-bz-text-soft underline underline-offset-2 hover:text-bz-text">
                Undo
              </button>
            </div>
          ))}
          {m.loose.open > 0.005 ? (
            <div className="flex min-h-[40px] flex-wrap items-center gap-2 pt-1 text-[12px]">
              <span className="text-bz-text-muted">
                <Amount value={m.loose.open} className="font-medium text-bz-text" /> not applied
              </span>
              <span className="ml-auto flex flex-wrap gap-1.5">
                {m.orderChoices.length > 0 && (
                  <button type="button" className={GHOST_SM} onClick={() => setPlacing({ from: null })}>
                    Put on an order
                  </button>
                )}
                {approved && m.invoiceChoices.length > 0 && (
                  <button type="button" className={GHOST_SM} onClick={() => setApplying(true)}>
                    Apply to an invoice
                  </button>
                )}
              </span>
            </div>
          ) : null}
        </Block>
      )}

      {m.discount && (
        <Block title="Early-payment discount" right={<Amount value={m.discount.amount} className="text-[12px] font-semibold text-bz-text" />}>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px]">
            <span className="text-bz-text-muted">
              Credit note <span className={cn("font-medium text-bz-text", NUM)}>{m.discount.no}</span> on {m.discount.invoices.map((x) => x.invoiceNo).join(", ")}
            </span>
            <span className="ml-auto">
              {m.discount.pending ? <Chip tone="pending">Waits for this receipt</Chip> : <Chip tone="positive">On the bill</Chip>}
            </span>
          </div>
          <p className="m-0 mt-1.5 text-[11px] text-bz-text-soft">
            {m.discount.pending ? "Approving the receipt approves it and puts it on the bill. Rejecting the receipt removes it." : "The order's discount, on its first invoice. It counts as paid there and is not part of this receipt."}
          </p>
        </Block>
      )}

      <div className="border-b border-bz-line-soft px-5 py-3">
        <MoneyList
          rows={[
            { label: "Applied to invoices", value: <Amount value={applied} /> },
            ...(advance > 0.005 ? [{ label: "Still advance", value: <Amount value={advance} /> }] : []),
            { label: "Amount received", value: <Amount value={m.received} />, strong: true },
          ]}
        />
      </div>

      <PlaceDialog m={m} from={placing?.from ?? null} open={!!placing} onClose={() => setPlacing(null)} show={show} />
      <ApplyDialog m={m} open={applying} onClose={() => setApplying(false)} show={show} />
    </>
  );
}

// ── Choosing, only when asked ───────────────────────────────────────────────

const ROW = "flex w-full min-h-[48px] items-center gap-3 border-b border-bz-line-soft px-3 py-2 text-left text-[12px] last:border-0";

/** Put money on an order: the money for no order, or (`from`) the money of an order that is gone. */
function PlaceDialog({ m, from, open, onClose, show }: { m: ReceiptMoney; from: string | null; open: boolean; onClose: () => void; show: Show }) {
  const pot = from ? m.orders.find((p) => p.orderNo === from) : undefined;
  const available = pot ? pot.open : m.loose.open;
  const choices = m.orderChoices.filter((c) => c.orderNo !== from);
  const [pick, setPick] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState(0);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const choose = (no: string | null) => {
    setPick(no);
    setAmount(Math.min(available, choices.find((c) => c.orderNo === no)?.need ?? 0));
    setRefusal(null);
  };
  React.useEffect(() => {
    if (open) choose(choices[0]?.orderNo ?? null);
    // Chosen as the dialog opens; the receipt changing underneath must not undo a choice in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, from]);

  const save = () => {
    if (!pick) return;
    if (!(amount > 0)) return setRefusal("Enter an amount.");
    if (amount > available + 0.005) return setRefusal(`Only ${fmt(available)} can be placed.`);
    const tags = m.orders.filter((p) => p.orderNo !== from).map((p) => ({ orderNo: p.orderNo, amount: p.amount }));
    if (pot && pot.amount - pot.open > 0.005) tags.push({ orderNo: pot.orderNo, amount: pot.amount - pot.open });
    const at = tags.find((t) => t.orderNo === pick);
    if (at) at.amount += amount;
    else tags.push({ orderNo: pick, amount });
    const said = m.setOrders(tags);
    if (said) return setRefusal(said);
    show("success", `${fmt(amount)} is for ${pick} now`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={from ? `From ${from}` : "Not for any order"}
      title={`Put ${fmt(available)} on an order`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save} disabled={!pick}>
            Save
          </button>
        </>
      }
    >
      {choices.length === 0 ? (
        <p className="m-0 text-[12px] text-bz-text-muted">No open order needs money.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft" role="radiogroup" aria-label="Order">
            {choices.map((c) => (
              <button key={c.orderNo} type="button" role="radio" aria-checked={pick === c.orderNo} onClick={() => choose(c.orderNo)} className={cn(ROW, pick === c.orderNo ? "bg-bz-fire/10" : "hover:bg-bz-paper-warm")}>
                <span className={cn("size-3.5 shrink-0 rounded-bz-pill border", pick === c.orderNo ? "border-[4px] border-bz-text" : "border-bz-line")} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block font-medium text-bz-text", NUM)}>{c.orderNo}</span>
                  <span className="block text-[10.5px] text-bz-text-soft">{c.invoiced ? "Invoiced" : "Not invoiced yet"}</span>
                </span>
                <span className="text-[11px] text-bz-text-muted">
                  needs <Amount value={c.need} className="font-medium text-bz-text" />
                </span>
              </button>
            ))}
          </div>
          <label className="mt-4 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-bz-text-muted">Amount</span>
            <AmountInput value={amount} onChange={(n) => (setAmount(n), setRefusal(null))} invalid={amount > available + 0.005} className="h-9 w-[180px] text-left font-semibold" />
          </label>
          {amount < available - 0.005 && amount > 0 && <p className="m-0 mt-2 text-[11px] text-bz-text-soft">The rest stays for no order.</p>}
        </>
      )}
      {refusal && <p className="m-0 mt-2 text-[11.5px] text-bz-red">{refusal}</p>}
    </Dialog>
  );
}

/** Apply the money for no order to one invoice. */
function ApplyDialog({ m, open, onClose, show }: { m: ReceiptMoney; open: boolean; onClose: () => void; show: Show }) {
  const [pick, setPick] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState(0);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const choose = (no: string | null) => {
    setPick(no);
    setAmount(Math.min(m.loose.open, m.invoiceChoices.find((c) => c.invoiceNo === no)?.room ?? 0));
    setRefusal(null);
  };
  React.useEffect(() => {
    if (open) choose(m.invoiceChoices[0]?.invoiceNo ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = () => {
    if (!pick) return;
    if (amount > m.loose.open + 0.005) return setRefusal(`Only ${fmt(m.loose.open)} is for no order.`);
    const said = m.apply(pick, amount);
    if (said) return setRefusal(said);
    show("success", `${fmt(amount)} applied to ${pick}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow="Not for any order"
      title={`Apply ${fmt(m.loose.open)} to an invoice`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save} disabled={!pick}>
            Apply
          </button>
        </>
      }
    >
      {m.invoiceChoices.length === 0 ? (
        <p className="m-0 text-[12px] text-bz-text-muted">No invoice is open.</p>
      ) : (
        <>
          <div className="max-h-[300px] overflow-auto rounded-bz-md border border-bz-line-soft" role="radiogroup" aria-label="Invoice">
            {m.invoiceChoices.map((c) => (
              <button key={c.invoiceNo} type="button" role="radio" aria-checked={pick === c.invoiceNo} onClick={() => choose(c.invoiceNo)} className={cn(ROW, pick === c.invoiceNo ? "bg-bz-fire/10" : "hover:bg-bz-paper-warm")}>
                <span className={cn("size-3.5 shrink-0 rounded-bz-pill border", pick === c.invoiceNo ? "border-[4px] border-bz-text" : "border-bz-line")} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block font-medium text-bz-text", NUM)}>{c.invoiceNo}</span>
                  {c.due && <span className="block text-[10.5px] text-bz-text-soft">Due {fmtShort(c.due)}</span>}
                </span>
                <span className="text-[11px] text-bz-text-muted">
                  open <Amount value={c.room} className="font-medium text-bz-text" />
                </span>
              </button>
            ))}
          </div>
          <label className="mt-4 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-bz-text-muted">Amount</span>
            <AmountInput value={amount} onChange={(n) => (setAmount(n), setRefusal(null))} className="h-9 w-[180px] text-left font-semibold" />
          </label>
        </>
      )}
      {refusal && <p className="m-0 mt-2 text-[11.5px] text-bz-red">{refusal}</p>}
    </Dialog>
  );
}

/** On the receipt form: where the money goes is not chosen there. A short read of it, and where to change it. */
export function ReceiptMoneyNote({ money: m, saved }: { money: ReceiptMoney | null; saved: boolean }) {
  const parts = m ? [...m.orders.map((p) => ({ key: p.orderNo, label: `For ${p.orderNo}`, value: p.amount })), ...(m.loose.amount > 0.005 && m.orders.length ? [{ key: "-", label: "Not for any order", value: m.loose.amount }] : [])] : [];
  return (
    <div>
      <h3 className="m-0 mb-2 text-[12px] font-semibold text-bz-text">Orders and invoices</h3>
      {parts.length > 0 && (
        <ul className={cn("m-0 mb-2 list-none overflow-hidden rounded-bz-md border border-bz-line-soft p-0 text-[12px]", NUM)}>
          {parts.map((x) => (
            <li key={x.key} className="flex items-center justify-between gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0">
              <span className="text-bz-text">{x.label}</span>
              <Amount value={x.value} className="font-medium text-bz-text" />
            </li>
          ))}
        </ul>
      )}
      <p className="m-0 text-[11.5px] text-bz-text-soft">{saved ? "Change them on the receipt." : "Once it is recorded, choose them on the receipt."}</p>
    </div>
  );
}
