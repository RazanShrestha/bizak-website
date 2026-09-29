import * as React from "react";
import { Download } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { day, npr, typeOf } from "../salesforce/engine";
import { Dot, Figures, Money, Section } from "../salesforce/ui";
import { DealerShell } from "./shell";
import { LIME, PageHead, SOFT } from "./kit";
import { PayDialog } from "./pay";
import { COMPANY, METHOD_LABEL, dealer, useAccount } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNT — the statement, what is late, and Pay now
//
// The statement is the customer ledger as the dealer reads it: newest at the
// top, a running balance, receipts it sent still waiting for us marked as such.
// The ageing strip is one bar, not a chart.
// ════════════════════════════════════════════════════════════════════════════

const AGE_TONE = ["bg-bz-line", "bg-bz-amber", "bg-bz-red-mark", "bg-bz-red"];

export function DealerAccountPage() {
  const acct = useAccount();
  const [pay, setPay] = React.useState<{ open: boolean; preselect?: string[] }>({ open: false });
  const owed = acct.ageing.reduce((s, a) => s + a.amount, 0);
  const rows = [...acct.statement].reverse();

  return (
    <DealerShell page="account">
      <PageHead
        title="Your account"
        sub={`What you owe ${COMPANY}, and every bill and payment since the year opened.`}
        actions={
          <>
            <button type="button" disabled title="Statement PDFs come with the app" className={SOFT}>
              <Download size={14} /> Download statement
            </button>
            <button type="button" onClick={() => setPay({ open: true })} className={LIME}>
              Pay now
            </button>
          </>
        }
      />

      <Figures
        items={[
          { label: "You owe", value: <Money value={acct.balance} />, sub: `${acct.open.length} open invoices` },
          { label: "Overdue", value: <Money value={acct.overdue} />, sub: acct.overdue > 0 ? "Pay to keep ordering freely" : "Nothing late", tone: acct.overdue > 0 ? "danger" : undefined },
          { label: "You can spend", value: <Money value={acct.available} />, sub: `of NPR ${npr(acct.limit)} credit` },
          acct.pending.length
            ? { label: "Waiting to confirm", value: <Money value={acct.pending.reduce((s, r) => s + r.credit, 0)} />, sub: `${acct.pending.length} payment${acct.pending.length === 1 ? "" : "s"} you sent` }
            : { label: "Credit days", value: `${typeOf(dealer()).creditDays} days`, sub: "from the invoice date" },
        ]}
      />

      <Section title="What you owe, by age" className="mt-12">
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

        {acct.open.length > 0 && (
          <ul className="m-0 mt-6 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {acct.open.map((inv) => (
              <li key={inv.doc} className="flex min-h-[56px] items-center gap-3 px-1 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium text-bz-text">{inv.doc}</span>
                  <span className="block text-[11px] text-bz-text-soft">
                    Billed {day(inv.date)}
                    {inv.open < inv.amount && ` · NPR ${npr(inv.amount - inv.open)} paid`}
                    {inv.waiting > 0 && ` · NPR ${npr(inv.waiting)} waiting to confirm`}
                  </span>
                </span>
                <span className="hidden sm:block">
                  {inv.late > 0 ? <Dot tone="danger">{inv.late} days late</Dot> : inv.late === 0 ? <Dot tone="warn">Due today</Dot> : <Dot tone="neutral">Due {day(inv.due!)}</Dot>}
                </span>
                <Money value={inv.open} code={false} className="w-[84px] text-right text-[12.5px] font-medium text-bz-text" />
                <button type="button" onClick={() => setPay({ open: true, preselect: [inv.doc] })} className={cn(SOFT, "h-9 px-3")}>
                  Pay
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Statement" count={rows.length} hint="newest first" className="mt-14">
        <div className="hidden grid-cols-[88px_minmax(0,1fr)_120px_120px] gap-4 border-b border-bz-line-soft px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft md:grid">
          <span>Date</span>
          <span>Document</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Balance</span>
        </div>
        <ul className="m-0 list-none divide-y divide-bz-line-soft border-b border-bz-line-soft p-0 max-md:border-t">
          {rows.map((r) => {
            const amount = r.debit - r.credit;
            return (
              <li key={r.id} className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-2.5 md:grid-cols-[88px_minmax(0,1fr)_120px_120px]">
                <span className={cn("hidden text-[12px] text-bz-text-muted md:block", NUM)}>{day(r.date)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-bz-text">{r.doc}</span>
                  <span className="block truncate text-[11px] text-bz-text-soft">
                    <span className="md:hidden">{day(r.date)} · </span>
                    {r.kind}
                    {r.method && ` · ${METHOD_LABEL[r.method]}`}
                    {r.reference && ` · ${r.reference}`}
                    {r.due && ` · due ${day(r.due)}`}
                  </span>
                  {r.pending && (
                    <span className="mt-0.5 block">
                      <Dot tone="warn">Waiting for {COMPANY} to confirm</Dot>
                    </span>
                  )}
                </span>
                <span className={cn("text-right text-[12.5px]", NUM, amount < 0 ? "text-bz-pos-deep" : "text-bz-text", r.pending && "opacity-60")}>
                  {amount < 0 ? "−" : ""}
                  {npr(Math.abs(amount))}
                  <span className={cn("block text-[11px] text-bz-text-soft md:hidden", NUM)}>bal. {npr(r.balance)}</span>
                </span>
                <span className={cn("hidden text-right text-[12.5px] font-medium text-bz-text md:block", NUM)}>{r.pending ? "—" : npr(r.balance)}</span>
              </li>
            );
          })}
        </ul>
        <p className="m-0 mt-3 text-[11px] text-bz-text-soft">A payment still waiting for us shows here but does not lower your balance until we confirm it.</p>
      </Section>

      <PayDialog open={pay.open} preselect={pay.preselect} onClose={() => setPay({ open: false })} />
    </DealerShell>
  );
}
