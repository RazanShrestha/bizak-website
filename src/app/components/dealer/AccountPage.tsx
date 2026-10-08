import * as React from "react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { day, npr } from "../salesforce/engine";
import { customersStore, hubStore } from "../salesforce/store";
import { receiptMoney, unapplied } from "../salesforce/receipts";
import { Dot, EmptyNote, Figures, Flag, Money, Section } from "../salesforce/ui";
import type { Figure } from "../salesforce/ui";
import { DealerShell, pagesFor } from "./shell";
import { LIME, PageHead, SOFT, Unavailable } from "./kit";
import { ChooseOrderDialog, PayDialog } from "./pay";
import { METHOD_LABEL, shopOfInvoice, useAccount, useDealer } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNT — the statement, what is late, and Pay now
//
// The statement is this dealer's rows of the one customer ledger, newest at the
// top with a running balance. Ageing and open bills come from engine.accountOf,
// the same count the company's credit check uses. A payment the dealer sent
// shows as waiting and changes nothing until the company confirms it. A payment
// lowers what the dealer owes at once, but a bill stays open until the company
// puts the payment on it (decision #33): until then it is listed as paid and
// not on a bill yet, with the orders it is for — which the dealer can change.
// ════════════════════════════════════════════════════════════════════════════

const AGE_TONE = ["bg-bz-line", "bg-bz-amber", "bg-bz-red-mark", "bg-bz-red"];

export function DealerAccountPage() {
  return (
    <DealerShell page="account">
      <Account />
    </DealerShell>
  );
}

function Account() {
  const s = useDealer();
  const acct = useAccount(s.c);
  const hub = useStore(hubStore);
  const customers = useStore(customersStore);
  const [pay, setPay] = React.useState<{ open: boolean; preselect?: string[] }>({ open: false });
  const [choosing, setChoosing] = React.useState<{ receiptNo: string; from: string | null } | null>(null);
  if (!pagesFor(s).has("account")) return <Unavailable what="Your account" />;
  const { statement: canStatement, pay: canPay } = s.settings.can;
  const owed = acct.ageing.reduce((sum, a) => sum + a.amount, 0);
  const rows = [...acct.statement].reverse();
  // Payments the company has not put on a bill yet. `acct` changes with the ledger, so this is read again with it.
  const waiting = unapplied(s.c.id);
  /** Paid for this bill's order and not applied yet. The portal shows a bill under its order's number. */
  const paidFor = (doc: string) => acct.tagged.find((t) => t.doc === doc)?.amount ?? 0;
  const c = acct.credit;
  // An invoice for an order our rep took at a shop this dealer serves says which shop (owner decision #26).
  const forShop = (doc: string) => {
    const row = acct.statement.find((r) => r.kind === "Invoice" && r.doc === doc);
    const shop = row ? shopOfInvoice(row, hub, customers) : null;
    return shop ? ` · for ${shop}` : "";
  };

  const figures: Figure[] = [
    { label: acct.outstanding < 0 ? "In credit" : "You owe", value: <Money value={Math.abs(acct.outstanding)} />, sub: acct.outstanding < 0 ? "Paid ahead — it goes on your next bill" : acct.invoices.length ? `${acct.invoices.length} open ${acct.invoices.length === 1 ? "bill" : "bills"}` : "Nothing open" },
    { label: "Overdue", value: <Money value={acct.overdue} />, sub: acct.overdue > 0 ? "Pay to keep ordering freely" : "Nothing late", tone: acct.overdue > 0 ? "danger" : undefined },
    c.limit === null
      ? { label: "You can spend", value: "No limit", sub: "No credit limit set" }
      : c.limit === 0
        ? { label: "You can spend", value: "Cash only", sub: "Orders are paid up front" }
        : { label: "You can spend", value: <Money value={c.available ?? 0} />, sub: `of NPR ${npr(c.limit)} credit` },
    acct.pending > 0
      ? { label: "Waiting to confirm", value: <Money value={acct.pending} />, sub: `${acct.pendingRows.length} ${acct.pendingRows.length === 1 ? "payment" : "payments"} you sent` }
      : { label: "Credit days", value: `${s.type.creditDays} days`, sub: "from the bill date" },
  ];

  return (
    <>
      <PageHead
        title="Your account"
        sub={`What you owe ${s.company}, and every bill and payment on your account.`}
        actions={
          canPay && (
            <button type="button" onClick={() => setPay({ open: true })} className={LIME}>
              Pay now
            </button>
          )
        }
      />

      <Figures items={figures} />
      {waiting.length > 0 && (
        <Section title="Paid, not on a bill yet" count={waiting.length} className="mt-10">
          <ul className={cn("m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0", NUM)}>
            {waiting.map((u) => {
              const m = receiptMoney(s.c.id, u.no);
              if (!m) return null;
              const pots = m.orders.filter((p) => p.open > 0);
              return (
                <li key={u.no} className="px-1 py-3">
                  <span className="flex items-baseline gap-3">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-bz-text">{u.no}</span>
                    <span className="text-[11px] text-bz-text-soft">
                      {day(u.date)} · paid <Money value={m.received} code={false} className="text-bz-text-muted" />
                    </span>
                  </span>
                  {u.pending && (
                    <span className="mt-0.5 block">
                      <Dot tone="warn">Waiting for {s.company} to confirm</Dot>
                    </span>
                  )}
                  <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
                    {pots.map((p) => {
                      const gone = p.state === "dead" || p.state === "spare";
                      return (
                        <li key={p.orderNo} className="flex min-h-[40px] flex-wrap items-center gap-x-3 gap-y-1 rounded-bz-md bg-bz-paper-warm/60 px-3 py-1.5">
                          <span className="min-w-0 flex-1">
                            <span className="block text-[12px] text-bz-text">For {p.orderNo}</span>
                            <span className="block text-[11px] text-bz-text-soft">
                              {gone ? <Flag>{p.state === "dead" ? "Not accepted" : "Already paid"}</Flag> : p.state === "invoiced" ? `${s.company} is putting it on the bill` : "Waiting for the bill"}
                            </span>
                          </span>
                          <Money value={p.open} code={false} className="text-[12.5px] font-medium text-bz-text" />
                          {p.discount && (
                            <span className="basis-full text-[11px] text-bz-pos-deep">
                              Early-payment discount NPR {npr(p.discount.amount)} — you get it when {s.company} puts your payment on the bill
                            </span>
                          )}
                          {gone && canPay && (
                            <button type="button" onClick={() => setChoosing({ receiptNo: u.no, from: p.orderNo })} className={cn(SOFT, "h-9 px-3")}>
                              Choose another order
                            </button>
                          )}
                        </li>
                      );
                    })}
                    {m.discount && (
                      <li className="flex min-h-[40px] flex-wrap items-center gap-x-3 gap-y-1 rounded-bz-md bg-bz-paper-warm/60 px-3 py-1.5">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] text-bz-text">Early-payment discount</span>
                          <span className="block text-[11px] text-bz-text-soft">
                            {m.discount.no} · {m.discount.pending ? `confirmed with this payment` : `on ${m.discount.invoices.map((x) => x.invoiceNo).join(", ")}`}
                          </span>
                        </span>
                        <Money value={m.discount.amount} code={false} className="text-[12.5px] font-medium text-bz-pos-deep" />
                      </li>
                    )}
                    {m.loose.open > 0 && (
                      <li className="flex min-h-[40px] flex-wrap items-center gap-x-3 gap-y-1 rounded-bz-md bg-bz-paper-warm/60 px-3 py-1.5">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] text-bz-text">Not for any order</span>
                          <span className="block text-[11px] text-bz-text-soft">{s.company} puts it on your bills</span>
                        </span>
                        <Money value={m.loose.open} code={false} className="text-[12.5px] font-medium text-bz-text" />
                        {canPay && m.orderChoices.length > 0 && (
                          <button type="button" onClick={() => setChoosing({ receiptNo: u.no, from: null })} className={cn(SOFT, "h-9 px-3")}>
                            Choose an order
                          </button>
                        )}
                      </li>
                    )}
                  </ul>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Section title={canStatement ? "What you owe, by age" : "Open bills"} className="mt-12">
        {acct.invoices.length === 0 ? (
          <p className="m-0 text-[12.5px] text-bz-text-muted">Nothing open — you are all settled.</p>
        ) : (
          <>
            {canStatement && (
              <>
                <div className="flex h-2.5 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft" aria-hidden>
                  {acct.ageing.map((a, i) => (a.amount > 0 ? <span key={a.label} className={AGE_TONE[i]} style={{ width: `${(a.amount / Math.max(1, owed)) * 100}%` }} /> : null))}
                </div>
                <dl className="m-0 mt-4 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                  {acct.ageing.map((a, i) => (
                    <div key={a.label} className="min-w-0">
                      <dt className="flex items-center gap-1.5 text-[11px] text-bz-text-soft">
                        <span className={cn("size-2 shrink-0 rounded-[3px]", AGE_TONE[i])} />
                        {a.label}
                      </dt>
                      <dd className={cn("m-0 mt-1 text-[13px] font-semibold", NUM, i > 0 && a.amount > 0 ? "text-bz-red" : "text-bz-text")}>
                        <Money value={a.amount} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
            <ul className={cn("m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0", canStatement && "mt-6")}>
              {acct.invoices.map((inv) => (
                <li key={inv.doc} className="flex min-h-[56px] items-center gap-3 px-1 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-bz-text">{inv.doc}</span>
                    <span className="block text-[11px] text-bz-text-soft">
                      Billed {day(inv.date)}
                      {forShop(inv.doc)}
                      {inv.open < inv.amount && ` · NPR ${npr(inv.amount - inv.open)} paid`}
                      {paidFor(inv.doc) > 0 && ` · NPR ${npr(paidFor(inv.doc))} paid, not on it yet`}
                    </span>
                  </span>
                  <span className="hidden sm:block">{inv.late > 0 ? <Dot tone="danger">{inv.late} days late</Dot> : inv.late === 0 ? <Dot tone="warn">Due today</Dot> : <Dot tone="neutral">Due {inv.due ? day(inv.due) : "—"}</Dot>}</span>
                  <Money value={inv.open} code={false} className="w-[84px] text-right text-[12.5px] font-medium text-bz-text" />
                  {canPay && inv.open - paidFor(inv.doc) > 0 && (
                    <button type="button" onClick={() => setPay({ open: true, preselect: [inv.doc] })} className={cn(SOFT, "h-9 px-3")}>
                      Pay
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      {canStatement && (
        <Section title="Statement" count={rows.length} hint="newest first" className="mt-14">
          {rows.length === 0 ? (
            <EmptyNote>Your bills and payments show here once {s.company} bills an order.</EmptyNote>
          ) : (
            <>
              <div className="hidden grid-cols-[88px_minmax(0,1fr)_120px_120px] gap-4 border-b border-bz-line-soft px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft md:grid">
                <span>Date</span>
                <span>Document</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Balance</span>
              </div>
              <ul className="m-0 list-none divide-y divide-bz-line-soft border-b border-bz-line-soft p-0 max-md:border-t">
                {rows.map((r) => {
                  const amount = r.debit - r.credit;
                  const shop = shopOfInvoice(r, hub, customers);
                  return (
                    <li key={r.id} className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-2.5 md:grid-cols-[88px_minmax(0,1fr)_120px_120px]">
                      <span className={cn("hidden text-[12px] text-bz-text-muted md:block", NUM)}>{day(r.date)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-[12.5px] font-medium text-bz-text">{r.doc}</span>
                        <span className="block truncate text-[11px] text-bz-text-soft">
                          <span className="md:hidden">{day(r.date)} · </span>
                          {r.kind}
                          {shop && ` for ${shop}`}
                          {r.method && ` · ${METHOD_LABEL[r.method]}`}
                          {r.reference && ` · ${r.reference}`}
                          {r.kind === "Receipt" && r.tags && r.tags.length > 0 && ` · for ${r.tags.map((l) => l.doc).join(", ")}`}
                          {r.due && r.kind !== "Opening" && ` · due ${day(r.due)}`}
                        </span>
                        {r.pending && (
                          <span className="mt-0.5 block">
                            <Dot tone="warn">Waiting for {s.company} to confirm</Dot>
                          </span>
                        )}
                      </span>
                      <span className={cn("text-right text-[12.5px]", NUM, amount < 0 ? "text-bz-pos-deep" : "text-bz-text", r.pending && "opacity-60")}>
                        {amount < 0 ? "−" : ""}
                        {npr(Math.abs(amount))}
                        <span className={cn("block text-[11px] text-bz-text-soft md:hidden", NUM)}>{r.pending ? "not counted yet" : `bal. ${npr(r.balance)}`}</span>
                      </span>
                      <span className={cn("hidden text-right text-[12.5px] font-medium text-bz-text md:block", NUM)}>{r.pending ? "—" : npr(r.balance)}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Section>
      )}

      {canPay && <PayDialog open={pay.open} preselect={pay.preselect} onClose={() => setPay((p) => ({ ...p, open: false }))} />}
      {canPay && <ChooseOrderDialog pick={choosing} onClose={() => setChoosing(null)} />}
    </>
  );
}
