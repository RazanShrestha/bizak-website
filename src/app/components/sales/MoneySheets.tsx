import * as React from "react";
import { Banknote, Landmark, ReceiptText, Undo2 } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, GHOST, INPUT_SM, Kbd, LABEL, NUM, NumberField, Refusal, Segmented, Select, TEXTAREA } from "./bzw";
import { Amount, CUSTOMERS, LOCATIONS, ME, TODAY, customerById, fmtQty, fmtShort, itemById, lineNet, locationById, totalsOf } from "./orders";
import { BANKS, InvoiceView, PayMode, RETURN_REASONS, addCredit, addReceipt, creditsStore, docLines, useSales } from "./flow";

// ════════════════════════════════════════════════════════════════════════════
// MONEY SHEETS — receive a payment, return goods
//
// Both open INSIDE a record (an invoice, a receipt desk, a return desk) and
// both follow the fulfil sheet's rules: defaults from what is left, the reason
// beside the figure it concerns, and a commit that refuses rather than greys.
//
// Receive payment: the amount is APPLIED to the customer's open invoices,
//   oldest due first, and every figure stays editable. A receipt must be
//   fully applied — Bizak has no customer-credit record for an unapplied
//   remainder (CUSTOMER_DEPOSIT is its own document), so the sheet says so
//   instead of quietly accepting money nothing will ever point at.
// Return: quantities are capped at what was invoiced and not already
//   returned; the credit is applied to this invoice's balance first. It
//   restocks because it is linked to the invoice, and posts on approval.
// ════════════════════════════════════════════════════════════════════════════

function Foot({ refusal, onDismiss, children }: { refusal: string | null; onDismiss: () => void; children: React.ReactNode }) {
  return (
    <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
      {refusal && <Refusal text={refusal} onDismiss={onDismiss} sticky className="mb-2.5" />}
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function F({ label, children, optional, className }: { label: string; children: React.ReactNode; optional?: boolean; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-[11.5px] font-semibold text-bz-text">
        {label}
        {optional && <span className="ml-1 font-normal text-bz-text-soft">optional</span>}
      </span>
      {children}
    </div>
  );
}

function useCommitKey(fn: () => void) {
  const ref = React.useRef(fn);
  ref.current = fn;
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);
}

// ── Receive payment ─────────────────────────────────────────────────────────

export function ReceiptSheet({ customerId: fixed, invoiceNo, onCancel, onDone }: { customerId?: string; invoiceNo?: string; onCancel: () => void; onDone: (no: string) => void }) {
  const { invoices } = useSales();
  const [customerId, setCustomerId] = React.useState<string | null>(fixed ?? null);
  const [date, setDate] = React.useState(TODAY);
  const [mode, setMode] = React.useState<PayMode>("Bank transfer");
  const [bank, setBank] = React.useState(BANKS[0]);
  const [chequeNo, setChequeNo] = React.useState("");
  const [chequeDate, setChequeDate] = React.useState(TODAY);
  const [reference, setReference] = React.useState("");
  const [memo, setMemo] = React.useState("");
  const [refusal, setRefusal] = React.useState<string | null>(null);

  const open = React.useMemo(
    () =>
      invoices
        .filter((v) => v.order.customerId === customerId && v.doc.state === "approved" && v.balance - v.pendingPaid > 0.005)
        .sort((a, b) => (a.doc.no === invoiceNo ? -1 : b.doc.no === invoiceNo ? 1 : (a.doc.due ?? "").localeCompare(b.doc.due ?? ""))),
    [invoices, customerId, invoiceNo],
  );
  const room = (v: InvoiceView) => Math.round((v.balance - v.pendingPaid) * 100) / 100;

  const autoFill = (amt: number) => {
    let left = amt;
    const next: Record<string, number> = {};
    for (const v of open) {
      const take = Math.max(0, Math.min(room(v), left));
      next[v.doc.no] = Math.round(take * 100) / 100;
      left -= take;
    }
    return next;
  };
  const focus = open.find((v) => v.doc.no === invoiceNo) ?? open[0];
  const initialAmount = invoiceNo && focus ? room(focus) : 0;
  const [amount, setAmount] = React.useState(initialAmount);
  const [apply, setApply] = React.useState<Record<string, number>>(() => autoFill(initialAmount));
  React.useEffect(() => {
    if (!fixed && customerId) {
      const total = open.reduce((s, v) => s + room(v), 0);
      setAmount(total);
      setApply(autoFill(total));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const applied = Object.values(apply).reduce((s, x) => s + (x || 0), 0);
  const unapplied = Math.round((amount - applied) * 100) / 100;

  const commit = () => {
    if (!customerId) return setRefusal("Choose the customer who paid.");
    if (!(amount > 0)) return setRefusal("Enter the amount received.");
    for (const v of open) if ((apply[v.doc.no] ?? 0) > room(v) + 0.005) return setRefusal(`Only ${room(v).toLocaleString("en-US")} is due on ${v.doc.no}.`);
    if (applied > amount + 0.005) return setRefusal("You've applied more than was received.");
    if (unapplied > 0.005) return setRefusal(`${unapplied.toLocaleString("en-US", { minimumFractionDigits: 2 })} isn't applied to an invoice. Apply it or lower the amount.`);
    if (mode === "Cheque" && !chequeNo.trim()) return setRefusal("Enter the cheque number.");
    const no = addReceipt({
      customerId,
      date,
      mode,
      bank: mode === "Bank transfer" ? bank : null,
      chequeNo: mode === "Cheque" ? chequeNo.trim() : null,
      chequeDate: mode === "Cheque" ? chequeDate : null,
      reference: reference.trim() || null,
      amount,
      allocations: open.filter((v) => (apply[v.doc.no] ?? 0) > 0).map((v) => ({ invoiceNo: v.doc.no, amount: apply[v.doc.no] })),
      state: "approved",
      posted: mode === "Bank transfer",
      byId: ME.id,
      memo,
    });
    onDone(no);
  };
  useCommitKey(commit);

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className="grid grid-cols-1 gap-3 px-5 pt-4 sm:grid-cols-2">
          {!fixed && (
            <F label="Received from" className="sm:col-span-2">
              <Select
                trigger="ghost"
                className="h-9 w-full justify-between text-[12.5px]"
                label={customerId ? customerById(customerId)?.name : <span className="font-normal text-bz-text-soft">Choose a customer</span>}
                value={customerId}
                onChange={(v) => (setCustomerId(v), setRefusal(null))}
                width={320}
                options={CUSTOMERS.map((c) => ({ value: c.id, label: c.name, hint: c.code }))}
              />
            </F>
          )}
          <F label="Amount received">
            <input
              inputMode="decimal"
              value={amount || ""}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/[^\d.]/g, "")) || 0;
                setAmount(n);
                setApply(autoFill(n));
              }}
              placeholder="0.00"
              className={cn(INPUT_SM, "h-9 text-[15px] font-semibold", NUM)}
            />
          </F>
          <F label="Received on">
            <input type="date" value={date} max={TODAY} onChange={(e) => setDate(e.target.value)} className={cn(INPUT_SM, "h-9", NUM)} />
          </F>
        </div>

        <div className="px-5 pt-4">
          <span className="text-[11.5px] font-semibold text-bz-text">How</span>
          <div className="mt-1">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: "Bank transfer", label: <><Landmark size={12} /> Bank transfer</> },
                { value: "Cheque", label: <><ReceiptText size={12} /> Cheque</> },
                { value: "Cash", label: <><Banknote size={12} /> Cash</> },
              ]}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mode === "Bank transfer" && (
              <>
                <F label="Into">
                  <Select trigger="ghost" className="h-8 w-full justify-between" label={bank} value={bank} onChange={setBank} width={280} options={BANKS.map((b) => ({ value: b, label: b }))} />
                </F>
                <F label="Transaction reference" optional>
                  <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Bank's reference" className={INPUT_SM} />
                </F>
              </>
            )}
            {mode === "Cheque" && (
              <>
                <F label="Cheque no.">
                  <input value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} className={cn(INPUT_SM, NUM)} />
                </F>
                <F label="Cheque date">
                  <input type="date" value={chequeDate} onChange={(e) => setChequeDate(e.target.value)} className={cn(INPUT_SM, NUM)} />
                </F>
              </>
            )}
          </div>
          {mode !== "Bank transfer" && <p className="m-0 mt-2 text-[10.5px] text-bz-text-soft">Stays undeposited until you post it to a bank.</p>}
        </div>

        <div className="px-5 pb-5 pt-5">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="m-0 text-[12px] font-semibold text-bz-text">Apply to invoices</h3>
            {open.length > 0 && (
              <button type="button" className="ml-auto text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={() => setApply(autoFill(amount))}>
                Oldest first
              </button>
            )}
          </div>
          {!customerId ? (
            <p className="m-0 text-[11.5px] text-bz-text-soft">Choose a customer to see what they owe.</p>
          ) : open.length === 0 ? (
            <p className="m-0 text-[11.5px] text-bz-text-soft">Nothing is due from this customer.</p>
          ) : (
            <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
              <div className={cn("hidden grid-cols-[minmax(0,1fr)_120px_128px] items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
                <span>Invoice</span>
                <span className="text-right">Due</span>
                <span className="text-right">Apply</span>
              </div>
              {open.map((v) => (
                <div key={v.doc.no} className="grid grid-cols-[minmax(0,1fr)_128px] items-center gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0 sm:grid-cols-[minmax(0,1fr)_120px_128px]">
                  <span className="min-w-0">
                    <span className={cn("block text-[12.5px] font-medium text-bz-text", NUM)}>
                      {v.doc.no}
                      {v.overdueDays > 0 && <span className="ml-2 text-[10.5px] font-semibold text-bz-red">{v.overdueDays}d overdue</span>}
                    </span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {v.order.no} · due {v.doc.due ? fmtShort(v.doc.due) : "—"}
                      {v.pendingPaid > 0 && ` · ${v.pendingPaid.toLocaleString("en-US")} on a receipt awaiting approval`}
                    </span>
                  </span>
                  <span className="hidden text-right text-[12.5px] text-bz-text sm:block">
                    <Amount value={room(v)} />
                  </span>
                  <input
                    inputMode="decimal"
                    aria-label={`Apply to ${v.doc.no}`}
                    value={apply[v.doc.no] || ""}
                    placeholder="0.00"
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setApply((s) => ({ ...s, [v.doc.no]: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 }))}
                    className={cn(INPUT_SM, "text-right", NUM, (apply[v.doc.no] ?? 0) > room(v) + 0.005 && "border-bz-red-mark")}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <F label="Memo" optional>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} className={cn(TEXTAREA, "min-h-[56px]")} />
            </F>
          </div>
        </div>
      </div>
      <Foot refusal={refusal} onDismiss={() => setRefusal(null)}>
        <span className={cn("text-[12px] text-bz-text-muted", NUM)}>
          Applied <span className="font-semibold text-bz-text"><Amount value={applied} /></span> of <Amount value={amount} />
          {unapplied > 0.005 && <span className="ml-2 font-semibold text-bz-amber">{unapplied.toLocaleString("en-US", { minimumFractionDigits: 2 })} not applied</span>}
        </span>
        <button type="button" className={cn(GHOST, "ml-auto")} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={BTN} onClick={commit}>
          <Banknote size={13} /> Record receipt <Kbd>⌘↵</Kbd>
        </button>
      </Foot>
    </>
  );
}

// ── Return goods ────────────────────────────────────────────────────────────

export function ReturnSheet({ invoice, onCancel, onDone }: { invoice: InvoiceView; onCancel: () => void; onDone: (no: string) => void }) {
  const credits = React.useSyncExternalStore(creditsStore.subscribe, creditsStore.get, creditsStore.get);
  const lines = docLines(invoice);
  const alreadyBack = (lineId: string) =>
    credits.filter((c) => c.invoiceNo === invoice.doc.no && c.state !== undefined).reduce((s, c) => s + c.lines.filter((x) => x.lineId === lineId).reduce((a, x) => a + x.qty, 0), 0);
  const [qty, setQty] = React.useState<Record<string, number>>({});
  const [reason, setReason] = React.useState(RETURN_REASONS[0]);
  const [locationId, setLocationId] = React.useState(invoice.order.locationId);
  const [refusal, setRefusal] = React.useState<string | null>(null);

  const chosen = lines.filter((x) => (qty[x.lineId] ?? 0) > 0);
  const t = totalsOf(chosen.map((x) => ({ ...x.line, qty: qty[x.lineId] })));
  const toBalance = Math.min(t.total, invoice.balance);

  const commit = () => {
    if (!chosen.length) return setRefusal("Nothing to return. Set a quantity on at least one line.");
    for (const x of lines) {
      const max = x.qty - alreadyBack(x.lineId);
      if ((qty[x.lineId] ?? 0) > max) return setRefusal(`Only ${fmtQty(max)} of ${itemById(x.line.itemId)?.name} can come back on this invoice.`);
    }
    const no = addCredit({
      customerId: invoice.order.customerId,
      invoiceNo: invoice.doc.no,
      orderNo: invoice.order.no,
      date: TODAY,
      reason,
      lines: chosen.map((x) => ({ lineId: x.lineId, qty: qty[x.lineId] })),
      locationId,
      state: "pending",
      approverId: ME.id,
      applications: toBalance > 0 ? [{ invoiceNo: invoice.doc.no, amount: Math.round(toBalance * 100) / 100 }] : [],
      byId: ME.id,
    });
    onDone(no);
  };
  useCommitKey(commit);

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className="grid grid-cols-1 gap-3 px-5 pt-4 sm:grid-cols-2">
          <F label="Why">
            <Select trigger="ghost" className="h-8 w-full justify-between" label={reason} value={reason} onChange={setReason} width={240} options={RETURN_REASONS.map((r) => ({ value: r, label: r }))} />
          </F>
          <F label="Back into">
            <Select trigger="ghost" className="h-8 w-full justify-between" label={locationById(locationId)?.name} value={locationId} onChange={setLocationId} width={220} options={LOCATIONS.map((l) => ({ value: l.id, label: l.name }))} />
          </F>
        </div>
        <div className="px-5 pb-5 pt-5">
          <h3 className="m-0 mb-2 text-[12px] font-semibold text-bz-text">What's coming back</h3>
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
            <div className={cn("hidden grid-cols-[minmax(0,1fr)_72px_118px_108px] items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
              <span>Item</span>
              <span className="text-right">Invoiced</span>
              <span className="text-center">Return</span>
              <span className="text-right">Credit</span>
            </div>
            {lines.map((x) => {
              const it = itemById(x.line.itemId)!;
              const max = x.qty - alreadyBack(x.lineId);
              const q = qty[x.lineId] ?? 0;
              return (
                <div key={x.lineId} className="grid grid-cols-[minmax(0,1fr)_118px] items-center gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0 sm:grid-cols-[minmax(0,1fr)_72px_118px_108px]">
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] text-bz-text">{it.name}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {it.code}
                      {max < x.qty && ` · ${fmtQty(x.qty - max)} already returned`}
                    </span>
                  </span>
                  <span className={cn("hidden text-right text-[12px] text-bz-text-muted sm:block", NUM)}>
                    {fmtQty(x.qty)} {it.unit}
                  </span>
                  <span className="flex justify-center">
                    <NumberField value={q} onChange={(v) => setQty((s) => ({ ...s, [x.lineId]: v }))} max={max} invalid={q > max} className="w-[104px]" ariaLabel={`Return — ${it.name}`} />
                  </span>
                  <span className="hidden text-right text-[12.5px] font-semibold text-bz-text sm:block">
                    <Amount value={lineNet({ ...x.line, qty: q })} />
                  </span>
                </div>
              );
            })}
          </div>

          <dl className="ml-auto mt-3 grid w-full max-w-[320px] grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-[12px]">
            <dt className="text-bz-text-muted">Credit</dt>
            <dd className="m-0 text-right font-semibold text-bz-text"><Amount value={t.total} /></dd>
            <dt className="text-bz-text-muted">Off {invoice.doc.no}'s balance</dt>
            <dd className="m-0 text-right text-bz-text"><Amount value={toBalance} /></dd>
            {t.total - toBalance > 0.005 && (
              <>
                <dt className="text-bz-text-muted">Open credit</dt>
                <dd className="m-0 text-right text-bz-text"><Amount value={t.total - toBalance} /></dd>
              </>
            )}
          </dl>
          {t.total - toBalance > 0.005 && (
            <p className="m-0 mt-2 text-right text-[10.5px] text-bz-text-soft">Apply the open credit to another invoice, or refund it from the return.</p>
          )}
        </div>
      </div>
      <Foot refusal={refusal} onDismiss={() => setRefusal(null)}>
        <span className="text-[11.5px] text-bz-text-muted">Stock returns to {locationById(locationId)?.name} when approved.</span>
        <button type="button" className={cn(GHOST, "ml-auto")} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={BTN} onClick={commit}>
          <Undo2 size={13} /> Raise return <Kbd>⌘↵</Kbd>
        </button>
      </Foot>
    </>
  );
}
