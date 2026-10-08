import * as React from "react";
import { Building2, Landmark, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { Checkbox, Dialog, Field, INPUT, NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { SF_TODAY } from "../salesforce/data";
import type { PayMethod } from "../salesforce/data";
import { day, eligible, npr } from "../salesforce/engine";
import { invoiceTargets, orderTargets, receiptMoney, unapplied } from "../salesforce/receipts";
import { hubStore, ledgerStore, schemesStore } from "../salesforce/store";
import { Money } from "../salesforce/ui";
import { LIME, PhotoSlot, SOFT } from "./kit";
import { METHOD_LABEL, addDays, cap, daysBetween, notify, recordPayment, useDealer } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// PAY — say which orders the money is for, how much, and how it is paid
//
// What a dealer sends is a customer receipt (the sales desk's own, RCP-…). A
// receipt is only ever applied to invoices, and it is the company that applies
// it. The dealer only says which ORDERS the money is for (owner decision #33):
// each ticked order is tagged on the receipt with an amount. The money stays an
// advance on the dealer's account until the company puts it on that order's
// bill. Money over what is ticked is for no order; the dealer can give it an
// order later — `ChooseOrderDialog`, one amount at a time, which is also where
// a payment for an order that was not accepted is moved to another one.
//
// No card fields, ever. Release 1 is a bank transfer or cheque with proof, and
// nothing counts until the company confirms it (decisions #17, #31).
// ════════════════════════════════════════════════════════════════════════════

type Method = Extract<PayMethod, "bank" | "cheque">;
const METHODS: { value: Method; icon: LucideIcon }[] = [
  { value: "bank", icon: Landmark },
  { value: "cheque", icon: Building2 },
];

/** One thing a payment can be for: a sales order (tagged on the receipt), or an old bill with no order (named in its note). */
type PayRow = { doc: string; order: boolean; date: string; due: string | null; billed: boolean; total: number; open: number };

function usePayRows(customerId: string): PayRow[] {
  const ledger = useStore(ledgerStore);
  const hub = useStore(hubStore);
  return React.useMemo(() => {
    const bill = (no: string) => ledger.find((r) => r.customerId === customerId && r.kind === "Invoice" && !r.pending && r.doc === no);
    const bills: PayRow[] = invoiceTargets(customerId)
      .filter((b) => !b.orderNo)
      .map((b) => ({ doc: b.invoiceNo, order: false, date: b.date, due: b.due, billed: true, total: b.total, open: b.open }));
    const orders: PayRow[] = orderTargets(customerId).map((t) => ({ doc: t.orderNo, order: true, date: bill(t.orderNo)?.date ?? t.date, due: bill(t.orderNo)?.due ?? null, billed: t.invoiced, total: t.total, open: t.need }));
    // Bills first, the one due soonest on top; then orders that are not billed yet.
    return [...bills, ...orders].sort((x, y) => Number(y.billed) - Number(x.billed) || (x.due ?? x.date).localeCompare(y.due ?? y.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, ledger, hub]);
}

export function PayDialog({ open, onClose, preselect }: { open: boolean; onClose: () => void; preselect?: string[] }) {
  const s = useDealer();
  const schemes = useStore(schemesStore);
  const ledger = useStore(ledgerStore);
  const rows = usePayRows(s.c.id);
  const early = schemes.find((x) => x.mechanic.kind === "early-payment" && eligible(x, s.c) === null);
  const em = early?.mechanic.kind === "early-payment" ? early.mechanic : null;

  // Paid already, for no order, and not on a bill yet: said above the list so a bill is not paid twice.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loose = React.useMemo(() => unapplied(s.c.id).reduce((sum, u) => sum + u.use.free, 0), [s.c.id, ledger]);

  const [picked, setPicked] = React.useState<string[]>([]);
  const [amount, setAmount] = React.useState(0);
  const [touched, setTouched] = React.useState(false);
  const [method, setMethod] = React.useState<Method>("bank");
  const [reference, setReference] = React.useState("");
  const [photos, setPhotos] = React.useState(0);
  const [tried, setTried] = React.useState(false);

  // An order paid in full in time earns the early-payment discount (decision #34). Billed and inside the window, the
  // dealer can send the bill less the discount; the company gives the discount when it puts the money on the bill.
  // Not billed yet, the dealer pays the order's total and gets the discount back as credit then.
  const discountOf = (t: PayRow) => (em && t.order && t.billed && daysBetween(t.date, SF_TODAY) <= em.withinDays && t.open === t.total ? Math.round((t.open * em.pct) / 100) : 0);
  const chosen = rows.filter((t) => picked.includes(t.doc));
  const full = chosen.reduce((sum, t) => sum + t.open, 0);
  const discounts = chosen.map((t) => ({ doc: t.doc, amount: discountOf(t) })).filter((d) => d.amount > 0);
  const disc = discounts.reduce((sum, d) => sum + d.amount, 0);
  const due = full - disc;
  const pay = touched ? amount : due;
  const fullPay = pay >= due;
  const extra = Math.max(0, pay - due);

  React.useEffect(() => {
    if (!open) return;
    const late = rows.filter((t) => t.due && daysBetween(t.due, SF_TODAY) > 0).map((t) => t.doc);
    const wanted = preselect?.filter((doc) => rows.some((t) => t.doc === doc));
    setPicked(wanted?.length ? wanted : late.length ? late : rows.slice(0, 1).map((t) => t.doc));
    setTouched(false);
    setMethod("bank");
    setReference("");
    setPhotos(0);
    setTried(false);
    // Reset only as the dialog opens; the account changing underneath must not wipe a choice in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /** The amount over what was ticked, in the order listed: each takes what it needs, the rest is for no order. */
  const spread = () => {
    let left = pay;
    return chosen.flatMap((t) => {
      const take = Math.min(left, t.open - (fullPay ? discountOf(t) : 0));
      left -= take;
      return take > 0 ? [{ row: t, amount: take }] : [];
    });
  };

  const valid = pay > 0 && photos > 0;
  const submit = () => {
    setTried(true);
    if (!valid) return;
    const parts = spread();
    const named = parts.filter((p) => !p.row.order).map((p) => p.row.doc);
    const rcp = recordPayment(s, {
      amount: pay,
      method,
      reference: reference.trim(),
      tags: parts.filter((p) => p.row.order).map((p) => ({ doc: p.row.doc, amount: p.amount })),
      note: named.length ? `For ${named.join(", ")}.` : undefined,
    });
    notify(`${rcp.no} sent — ${s.company} confirms it`);
    onClose();
  };

  const hint = extra > 0 ? `NPR ${npr(extra)} extra is for no order yet.` : disc > 0 && fullPay ? `Includes NPR ${npr(disc)} off for paying early.` : pay < due ? "Part payment — the first one ticked is paid first." : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      eyebrow="Pay now"
      title="What are you paying for?"
      size="wide"
      foot={
        <>
          <button type="button" onClick={onClose} className={SOFT}>
            Cancel
          </button>
          <button type="button" onClick={submit} className={LIME}>
            Send NPR {npr(pay)}
          </button>
        </>
      }
    >
      {loose > 0 && <p className={cn("m-0 mb-3 text-[12px] text-bz-text-muted", NUM)}>NPR {npr(loose)} you already paid is not on a bill yet.</p>}
      {rows.length === 0 ? (
        <p className="m-0 text-[12px] text-bz-text-muted">Nothing is open. What you send is kept on your account.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
          {rows.map((t) => {
            const on = picked.includes(t.doc);
            const d = discountOf(t);
            const late = t.due ? daysBetween(t.due, SF_TODAY) : 0;
            return (
              <li key={t.doc}>
                <label className="flex min-h-[52px] cursor-pointer items-center gap-3 py-2">
                  <Checkbox
                    on={on}
                    onChange={(v) => {
                      setPicked((p) => (v ? [...p, t.doc] : p.filter((x) => x !== t.doc)));
                      setTouched(false);
                    }}
                    label={t.doc}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[12.5px] font-medium text-bz-text", NUM)}>{t.doc}</span>
                    <span className={cn("block text-[11px]", late > 0 ? "text-bz-red" : "text-bz-text-soft")}>
                      {!t.billed ? "Order · not billed yet" : late > 0 ? `${late} days late` : t.due ? `Due ${day(t.due)}` : `Billed ${day(t.date)}`}
                      {d > 0 && em && <span className="text-bz-text-soft"> · save NPR {npr(d)} by {day(addDays(t.date, em.withinDays))}</span>}
                      {em && t.order && !t.billed && t.open === t.total && <span className="text-bz-text-soft"> · {em.pct}% back if paid in full</span>}
                    </span>
                  </span>
                  <Money value={t.open} className="text-[12.5px] font-medium text-bz-text" />
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <Field label="Amount" className="mt-5 sm:max-w-[260px]" hint={hint}>
        <span className="relative block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">NPR</span>
          <input
            inputMode="numeric"
            value={pay ? Math.round(pay).toLocaleString("en-US") : ""}
            onChange={(e) => {
              setTouched(true);
              setAmount(Number(e.target.value.replace(/\D/g, "")) || 0);
            }}
            className={cn(INPUT, "h-10 bg-bz-surface pl-11 text-[13px] font-semibold", NUM, tried && pay <= 0 && "border-bz-red-mark")}
            aria-label="Amount"
          />
        </span>
      </Field>

      <p className="m-0 mb-2 mt-5 text-[11.5px] font-semibold text-bz-text">How you pay</p>
      <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">
        {METHODS.map((m) => {
          const on = m.value === method;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setMethod(m.value)}
              className={cn("flex h-11 items-center gap-2 rounded-bz-md border px-3 text-left text-[12.5px] transition-colors", on ? "border-bz-text bg-bz-fire/10 font-semibold text-bz-text" : "border-bz-line text-bz-text-muted hover:bg-bz-paper-warm")}
            >
              <m.icon size={15} className={on ? "text-bz-text" : "text-bz-text-soft"} />
              {METHOD_LABEL[m.value]}
            </button>
          );
        })}
        <span className="flex h-11 items-center gap-2 rounded-bz-md border border-dashed border-bz-line px-3 text-[12.5px] text-bz-text-soft" aria-disabled="true">
          <Smartphone size={15} />
          {METHOD_LABEL.wallet}
          <span className="ml-auto text-[10.5px]">Coming soon</span>
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={method === "bank" ? "Transfer reference" : "Cheque number"} hint="Optional">
          <input value={reference} onChange={(e) => setReference(e.target.value)} className={cn(INPUT, "h-10 bg-bz-surface")} />
        </Field>
        <Field label="Proof of payment" required>
          <PhotoSlot count={photos} onAdd={() => setPhotos((n) => Math.min(3, n + 1))} onClear={() => setPhotos(0)} label={method === "bank" ? "Add the bank slip" : "Add a photo of the cheque"} />
          {tried && photos === 0 && <span className="text-[10.5px] text-bz-red">Add the proof.</span>}
        </Field>
      </div>
    </Dialog>
  );
}

// ── Which orders a payment is for ───────────────────────────────────────────

/** A payment whose order was not accepted, or needs no more money: it has to be given another order. */
export const stuckPayments = (customerId: string) => unapplied(customerId).filter((u) => u.use.tags.some((t) => t.state === "dead" || t.state === "spare"));

/**
 * Put one amount of a payment on one order: the money for no order, or (`from`) the money of an order that was not
 * accepted or is already paid. Only orders that still need money are offered, and only when the dealer asks.
 */
export function ChooseOrderDialog({ pick, onClose }: { pick: { receiptNo: string; from: string | null } | null; onClose: () => void }) {
  const s = useDealer();
  const ledger = useStore(ledgerStore);
  const hub = useStore(hubStore);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const m = React.useMemo(() => (pick ? receiptMoney(s.c.id, pick.receiptNo, { name: s.userName, via: "portal" }) : null), [pick, s.c.id, s.userName, ledger, hub]);
  const pot = pick?.from ? m?.orders.find((p) => p.orderNo === pick.from) : undefined;
  const available = pot ? pot.open : (m?.loose.open ?? 0);
  const choices = (m?.orderChoices ?? []).filter((c) => c.orderNo !== pick?.from);
  const [chosen, setChosen] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState(0);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const choose = (no: string | null) => {
    setChosen(no);
    setAmount(Math.min(available, choices.find((c) => c.orderNo === no)?.need ?? 0));
    setRefusal(null);
  };
  React.useEffect(() => {
    if (pick) choose(choices[0]?.orderNo ?? null);
    // Chosen as the dialog opens only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick]);

  const save = () => {
    if (!m || !chosen) return;
    if (!(amount > 0)) return setRefusal("Enter an amount.");
    if (amount > available) return setRefusal(`Only NPR ${npr(available)} can be moved.`);
    const tags = m.orders.filter((p) => p.orderNo !== pick?.from).map((p) => ({ orderNo: p.orderNo, amount: p.amount }));
    if (pot && pot.amount - pot.open > 0) tags.push({ orderNo: pot.orderNo, amount: pot.amount - pot.open });
    const at = tags.find((t) => t.orderNo === chosen);
    if (at) at.amount += amount;
    else tags.push({ orderNo: chosen, amount });
    const said = m.setOrders(tags);
    if (said) return setRefusal(said);
    notify(`NPR ${npr(amount)} is for ${chosen} now`);
    onClose();
  };
  /** Take the money off an order that is gone: it is for no order then, and the company puts it on a bill. */
  const release = () => {
    if (!m || !pot) return;
    const kept = pot.amount - pot.open;
    const said = m.setOrders([...m.orders.filter((p) => p.orderNo !== pot.orderNo).map((p) => ({ orderNo: p.orderNo, amount: p.amount })), ...(kept > 0 ? [{ orderNo: pot.orderNo, amount: kept }] : [])]);
    if (said) return setRefusal(said);
    notify(`NPR ${npr(pot.open)} is for no order now`);
    onClose();
  };

  return (
    <Dialog
      open={!!pick}
      onClose={onClose}
      eyebrow={pick ? `${pick.receiptNo} · NPR ${npr(available)}` : ""}
      title="Which order is it for?"
      foot={
        <>
          <button type="button" onClick={onClose} className={SOFT}>
            Cancel
          </button>
          {pot && (
            <button type="button" onClick={release} className={SOFT}>
              Keep it for no order
            </button>
          )}
          {choices.length > 0 && (
            <button type="button" onClick={save} className={LIME}>
              Save
            </button>
          )}
        </>
      }
    >
      {choices.length === 0 ? (
        <p className="m-0 text-[12px] text-bz-text-muted">No open order needs it. {cap(s.company)} puts it on your bills.</p>
      ) : (
        <>
          <ul className="m-0 flex list-none flex-col divide-y divide-bz-line-soft border-y border-bz-line-soft p-0" role="radiogroup" aria-label="Order">
            {choices.map((c) => (
              <li key={c.orderNo}>
                <button type="button" role="radio" aria-checked={chosen === c.orderNo} onClick={() => choose(c.orderNo)} className="flex min-h-[52px] w-full items-center gap-3 py-2 text-left">
                  <span className={cn("size-4 shrink-0 rounded-bz-pill border", chosen === c.orderNo ? "border-[5px] border-bz-text" : "border-bz-line")} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[12.5px] font-medium text-bz-text", NUM)}>{c.orderNo}</span>
                    <span className="block text-[11px] text-bz-text-soft">{c.invoiced ? "Billed" : "Not billed yet"}</span>
                  </span>
                  <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>needs NPR {npr(c.need)}</span>
                </button>
              </li>
            ))}
          </ul>
          <Field label="Amount" className="mt-5 sm:max-w-[260px]" hint={amount > 0 && amount < available ? `NPR ${npr(available - amount)} stays for no order.` : undefined}>
            <span className="relative block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">NPR</span>
              <input
                inputMode="numeric"
                value={amount ? Math.round(amount).toLocaleString("en-US") : ""}
                onChange={(e) => (setRefusal(null), setAmount(Number(e.target.value.replace(/\D/g, "")) || 0))}
                className={cn(INPUT, "h-10 bg-bz-surface pl-11 text-[13px] font-semibold", NUM, amount > available && "border-bz-red-mark")}
                aria-label="Amount"
              />
            </span>
          </Field>
        </>
      )}
      {refusal && <p className="m-0 mt-2 text-[11.5px] text-bz-red">{refusal}</p>}
    </Dialog>
  );
}
