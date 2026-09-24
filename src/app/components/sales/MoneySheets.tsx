import * as React from "react";
import { Banknote, Undo2 } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Checkbox, GHOST, INPUT_SM, Kbd, LABEL, NUM, NumberField, Select, Switch } from "./bzw";
import { Amount, CUSTOMERS, LOCATIONS, ME, PEOPLE, TAX_LABEL, TODAY, customerById, fmtQty, fmtShort, itemById, lineGross, locationById, personById, totalsOf } from "./orders";
import { CURRENCIES, DEPOSIT_LEDGERS, PAYMENT_METHODS, SUBSIDIARIES, TDS_CODES, methodById, subsidiaryById, tdsById } from "./master";
import { CreditMemo, InvoiceView, RETURN_REASONS, Receipt, addCredit, addReceipt, creditsStore, docLines, replaceCredit, replaceReceipt, useSales } from "./flow";
import { AmountInput, ChipRow, DateChip, MiniLabel, MoreFields, PickChip, Sep, TermChip, TextChip } from "./parts";
import { SheetFrame } from "./FulfilSheet";
import { MoneyList, totalsRows } from "./record";

// ════════════════════════════════════════════════════════════════════════════
// MONEY SHEETS — receive a payment, return goods
//
// Both open INSIDE a record (an invoice, the receipts desk, a return) and both
// follow the fulfil sheet's rules: defaults from what is left, the reason
// beside the figure it concerns, and a commit that refuses rather than greys.
//
// Receive payment
//   • the method comes from the payment-method master and brings its own
//     fields (a cheque asks for bank and number; Fonepay for a transaction ID);
//   • "Deposit to" is undeposited funds or straight into a ledger;
//   • the amount is applied oldest-due-first while Auto apply is on, and every
//     line stays editable; TDS the customer withheld is set PER INVOICE;
//   • anything not applied is kept as the customer's ADVANCE — said in the
//     foot, never silently accepted; a TDS-only receipt (amount 0) is allowed.
// Return
//   • quantities are capped at what was invoiced and not already returned; the
//     line keeps its rate, discount and tax code, so the credit is exact;
//   • the credit comes off this invoice's balance first; stock returns when
//     the return is approved, because it is linked to the invoice.
// ════════════════════════════════════════════════════════════════════════════

const money = (n: number) => Math.round(n * 100) / 100;

// ── Receive payment ─────────────────────────────────────────────────────────

type Alloc = { amount: number; tds: boolean; tdsCode: string; tdsAmount: number };

export function ReceiptSheet({ customerId: fixed, invoiceNo, existing, onCancel, onDone }: { customerId?: string; invoiceNo?: string; existing?: Receipt; onCancel: () => void; onDone: (no: string) => void }) {
  const { invoices } = useSales();
  const [customerId, setCustomerId] = React.useState<string | null>(existing?.customerId ?? fixed ?? null);
  const customer = customerById(customerId);
  const [subsidiaryId, setSubsidiaryId] = React.useState(existing?.subsidiaryId ?? invoices.find((v) => v.doc.no === invoiceNo)?.order.subsidiaryId ?? "NP-01");
  const [date, setDate] = React.useState(existing?.date ?? TODAY);
  const [methodId, setMethodId] = React.useState(existing?.methodId ?? "BANK");
  const [fields, setFields] = React.useState<Record<string, string>>(existing?.methodFields ?? {});
  const [depositTo, setDepositTo] = React.useState(existing?.depositTo ?? DEPOSIT_LEDGERS[2]);
  const [currency, setCurrency] = React.useState(existing?.currency ?? customer?.currency ?? "NPR");
  const [rate, setRate] = React.useState(existing?.exchangeRate ?? 1);
  const [memo, setMemo] = React.useState(existing?.memo ?? "");
  const [custom, setCustom] = React.useState<Record<string, string>>(existing?.custom ?? { channel: "Field sales" });
  const [auto, setAuto] = React.useState(!existing);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);
  const method = methodById(methodId);

  const mine = (no: string) => existing?.allocations.find((a) => a.invoiceNo === no);
  const open = React.useMemo(
    () =>
      invoices
        .filter((v) => v.order.customerId === customerId && v.doc.state === "approved" && !v.doc.cancelled && (v.balance - v.pendingPaid > 0.005 || mine(v.doc.no)))
        .sort((a, b) => (a.doc.no === invoiceNo ? -1 : b.doc.no === invoiceNo ? 1 : (a.doc.due ?? "").localeCompare(b.doc.due ?? ""))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invoices, customerId, invoiceNo],
  );
  // Editing: this receipt's own allocations are already in the balance, so add them back.
  const room = (v: InvoiceView) => money(v.balance - v.pendingPaid + (existing?.state === "approved" ? (mine(v.doc.no)?.amount ?? 0) + (mine(v.doc.no)?.tds ?? 0) : 0));
  const tdsFor = (v: InvoiceView, code: string) => money((v.totals.gross - v.totals.bill) * (tdsById(code)?.rate ?? 0));

  const fill = (amt: number, current: Record<string, Alloc>) => {
    let left = amt;
    const next: Record<string, Alloc> = {};
    for (const v of open) {
      const a = current[v.doc.no] ?? { amount: 0, tds: false, tdsCode: TDS_CODES[0].id, tdsAmount: 0 };
      const take = Math.max(0, Math.min(room(v) - (a.tds ? a.tdsAmount : 0), left));
      next[v.doc.no] = { ...a, amount: money(take) };
      left -= take;
    }
    return next;
  };

  const seedAlloc = (): Record<string, Alloc> =>
    Object.fromEntries(open.map((v) => {
      const m = mine(v.doc.no);
      return [v.doc.no, { amount: m?.amount ?? 0, tds: !!m?.tds, tdsCode: m?.tdsCode ?? TDS_CODES[0].id, tdsAmount: m?.tds ?? 0 }];
    }));
  const focus = open.find((v) => v.doc.no === invoiceNo);
  const [amount, setAmount] = React.useState(existing?.amount ?? (focus ? room(focus) : 0));
  const [alloc, setAlloc] = React.useState<Record<string, Alloc>>(() => (existing ? seedAlloc() : fill(focus ? room(focus) : 0, {})));

  React.useEffect(() => {
    if (fixed || existing || !customerId) return;
    const c = customerById(customerId)!;
    setCurrency(c.currency);
    setRate(CURRENCIES.find((x) => x.code === c.currency)?.rate ?? 1);
    const total = open.reduce((s, v) => s + room(v), 0);
    setAmount(money(total));
    setAlloc(fill(total, {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const patch = (no: string, p: Partial<Alloc>) =>
    setAlloc((s) => {
      const next = { ...s, [no]: { ...s[no], ...p } };
      return auto && ("tds" in p || "tdsCode" in p || "tdsAmount" in p) ? fill(amount, next) : next;
    });

  const applied = money(Object.values(alloc).reduce((s, a) => s + (a.amount || 0), 0));
  const tds = money(Object.values(alloc).reduce((s, a) => s + (a.tds ? a.tdsAmount : 0), 0));
  const advance = money(amount - applied);

  const commit = () => {
    setTried(true);
    if (!customerId) return setRefusal("Choose the customer who paid.");
    if (!(amount > 0) && !(tds > 0)) return setRefusal("Enter the amount received, or the TDS withheld.");
    const miss = method.fields.filter((f) => f.required && !fields[f.key]).map((f) => f.label.toLowerCase());
    if (miss.length) return setRefusal(`Add the ${miss.join(" and ")}.`);
    for (const v of open) {
      const a = alloc[v.doc.no];
      if (a && a.amount + (a.tds ? a.tdsAmount : 0) > room(v) + 0.005) return setRefusal(`Only ${room(v).toLocaleString("en-US", { minimumFractionDigits: 2 })} is due on ${v.doc.no}.`);
    }
    if (applied > amount + 0.005) return setRefusal("You've applied more than was received.");
    if (currency !== "NPR" && !(rate > 0)) return setRefusal("Enter the exchange rate.");
    const payload = {
      subsidiaryId,
      customerId,
      date,
      methodId,
      methodFields: fields,
      depositTo,
      currency,
      exchangeRate: currency === "NPR" ? 1 : rate,
      amount,
      allocations: open
        .filter((v) => (alloc[v.doc.no]?.amount ?? 0) > 0 || alloc[v.doc.no]?.tds)
        .map((v) => {
          const a = alloc[v.doc.no];
          return { invoiceNo: v.doc.no, amount: a.amount, ...(a.tds ? { tdsCode: a.tdsCode, tds: a.tdsAmount } : {}) };
        }),
      memo,
      custom,
    };
    if (existing) {
      replaceReceipt(existing.no, { ...payload, posted: depositTo !== "Undeposited funds" });
      return onDone(existing.no);
    }
    onDone(addReceipt({ ...payload, state: "approved", posted: depositTo !== "Undeposited funds", cancelled: null, dims: {}, byId: ME.id, sourceOrder: open[0]?.order.no ?? null, attachments: [] }));
  };

  return (
    <SheetFrame
      onCommit={commit}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      foot={
        <>
          <span className={cn("min-w-0 text-[12px] text-bz-text-muted", NUM)}>
            Applied <span className="font-semibold text-bz-text"><Amount value={applied} /></span>
            {tds > 0 && <> · TDS <Amount value={tds} /></>}
            {advance > 0.005 && customerId && (
              <span className="ml-1.5 font-medium text-bz-text" title="Not applied to an invoice — it stays on the customer's account">
                · <Amount value={advance} /> kept as advance
              </span>
            )}
          </span>
          <button type="button" className={cn(GHOST, "ml-auto")} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={commit}>
            <Banknote size={13} /> {existing ? "Save receipt" : "Record receipt"} <Kbd>⌘↵</Kbd>
          </button>
        </>
      }
    >
      <div className="px-5 pt-4">
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-bz-text-muted">Amount received{currency !== "NPR" ? ` (${currency})` : ""}</span>
            <AmountInput
              value={amount}
              onChange={(n) => {
                setAmount(n);
                if (auto) setAlloc((s) => fill(n, s));
              }}
              className="h-10 w-[190px] text-left text-[18px] font-semibold tracking-tight"
            />
          </label>
          {!fixed && (
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[11px] font-semibold text-bz-text-muted">Received from</span>
              <Select
                trigger="ghost"
                className={cn("h-10 w-full justify-between text-[13px]", tried && !customerId && "border-bz-red-mark")}
                label={customer ? customer.name : <span className="font-normal text-bz-text-soft">Choose a customer</span>}
                value={customerId}
                disabled={!!existing}
                onChange={(v) => (setCustomerId(v), setRefusal(null))}
                width={320}
                options={CUSTOMERS.filter((c) => !c.isProspect).map((c) => ({ value: c.id, label: c.name, hint: `${c.code} · PAN ${c.pan}` }))}
              />
            </label>
          )}
        </div>

        <ChipRow className="mt-3">
          <TermChip label="On">
            <DateChip value={date} max={TODAY} onChange={setDate} />
          </TermChip>
          <Sep />
          <TermChip label="By">
            <PickChip label={method.name} value={methodId} onChange={(v) => (setMethodId(v), setFields({}), setDepositTo(v === "BANK" ? DEPOSIT_LEDGERS[2] : "Undeposited funds"))} options={PAYMENT_METHODS.map((x) => ({ value: x.id, label: x.name }))} />
          </TermChip>
          {method.fields.map((f) =>
            f.type === "date" ? (
              <TermChip key={f.key} label={f.label.toLowerCase()}>
                <DateChip value={fields[f.key] || null} onChange={(v) => setFields((s) => ({ ...s, [f.key]: v }))} />
              </TermChip>
            ) : (
              <TermChip key={f.key} label={f.label.toLowerCase()}>
                <TextChip value={fields[f.key] ?? ""} onChange={(v) => setFields((s) => ({ ...s, [f.key]: v }))} placeholder={f.required ? "required" : "none"} width={f.key === "bank" ? 150 : 110} />
              </TermChip>
            ),
          )}
          <Sep />
          <TermChip label="Into">
            <PickChip label={depositTo.split(" · ")[0]} value={depositTo} onChange={setDepositTo} options={DEPOSIT_LEDGERS.map((d) => ({ value: d, label: d }))} width={270} />
          </TermChip>
          <Sep />
          <TermChip label="For">
            <PickChip label={subsidiaryById(subsidiaryId).name} value={subsidiaryId} onChange={setSubsidiaryId} options={SUBSIDIARIES.map((s) => ({ value: s.id, label: s.name, hint: s.id }))} width={260} />
          </TermChip>
          <TermChip label="Currency">
            <PickChip label={currency} value={currency} onChange={(c) => (setCurrency(c), setRate(CURRENCIES.find((x) => x.code === c)?.rate ?? 1))} options={CURRENCIES.map((c) => ({ value: c.code, label: c.code, hint: c.name }))} width={200} />
          </TermChip>
          {currency !== "NPR" && (
            <TermChip label="@">
              <TextChip value={String(rate || "")} onChange={(v) => setRate(Number(v.replace(/[^\d.]/g, "")) || 0)} placeholder="rate" width={72} />
            </TermChip>
          )}
        </ChipRow>
      </div>

      <div className="px-5 pb-5 pt-5">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="m-0 text-[12px] font-semibold text-bz-text">Apply to invoices</h3>
          {open.length > 0 && (
            <label className="ml-auto inline-flex items-center gap-2 text-[11.5px] text-bz-text-muted" title="Oldest due first">
              Auto apply <Switch on={auto} onChange={(v) => (setAuto(v), v && setAlloc((s) => fill(amount, s)))} label="Auto apply" />
            </label>
          )}
        </div>
        {!customerId ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Choose a customer to see what they owe.</p>
        ) : open.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Nothing is due from this customer. The whole amount is kept as an advance.</p>
        ) : (
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
            <div className={cn("hidden grid-cols-[minmax(0,1fr)_104px_104px_60px_116px] items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
              <span>Invoice</span>
              <span className="text-right">Original</span>
              <span className="text-right">Due</span>
              <span className="text-center">TDS</span>
              <span className="text-right">Apply</span>
            </div>
            {open.map((v) => {
              const a = alloc[v.doc.no] ?? { amount: 0, tds: false, tdsCode: TDS_CODES[0].id, tdsAmount: 0 };
              const over = a.amount + (a.tds ? a.tdsAmount : 0) > room(v) + 0.005;
              return (
                <div key={v.doc.no} className="border-b border-bz-line-soft last:border-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_44px_116px] items-center gap-3 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_104px_104px_60px_116px]">
                    <span className="min-w-0">
                      <span className={cn("block text-[12.5px] font-medium text-bz-text", NUM)}>
                        {v.doc.no}
                        {v.overdueDays > 0 && <span className="ml-2 text-[10.5px] font-semibold text-bz-red">{v.overdueDays}d overdue</span>}
                      </span>
                      <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                        Invoice · {fmtShort(v.doc.date)} · due {v.doc.due ? fmtShort(v.doc.due) : "—"}
                        <span className="sm:hidden"> · <Amount value={room(v)} className="text-bz-text-soft" /> due</span>
                        {v.pendingPaid > 0 && ` · ${v.pendingPaid.toLocaleString("en-US")} on a receipt awaiting approval`}
                      </span>
                    </span>
                    <span className="hidden text-right text-[12px] text-bz-text-muted sm:block">
                      <Amount value={v.total} />
                    </span>
                    <span className="hidden text-right text-[12.5px] text-bz-text sm:block">
                      <Amount value={room(v)} />
                    </span>
                    <span className="flex justify-center">
                      <Checkbox on={a.tds} onChange={(on) => patch(v.doc.no, { tds: on, tdsAmount: on ? tdsFor(v, a.tdsCode) : 0 })} label={`TDS on ${v.doc.no}`} />
                    </span>
                    <AmountInput ariaLabel={`Apply to ${v.doc.no}`} value={a.amount} invalid={over} onChange={(n) => (setAuto(false), patch(v.doc.no, { amount: n }))} />
                  </div>
                  {a.tds && (
                    <div className="flex flex-wrap items-center justify-end gap-2 bg-bz-paper px-3 pb-2 pt-1.5">
                      <span className="text-[11px] text-bz-text-muted">TDS withheld</span>
                      <Select trigger="ghost" className="h-7" label={tdsById(a.tdsCode)?.name} value={a.tdsCode} onChange={(c) => patch(v.doc.no, { tdsCode: c, tdsAmount: tdsFor(v, c) })} width={200} align="right" options={TDS_CODES.map((x) => ({ value: x.id, label: x.name }))} />
                      <AmountInput ariaLabel={`TDS on ${v.doc.no}`} value={a.tdsAmount} onChange={(n) => patch(v.doc.no, { tdsAmount: n })} className="h-7 w-[116px]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
      <MoreFields memo={memo} onMemo={setMemo} custom={custom} onCustom={setCustom} tried={tried}>
        <MiniLabel label="Currency">
          <Select trigger="ghost" className="h-8 w-full justify-between" label={currency} value={currency} onChange={(c) => (setCurrency(c), setRate(CURRENCIES.find((x) => x.code === c)?.rate ?? 1))} width={200} options={CURRENCIES.map((c) => ({ value: c.code, label: c.code, hint: c.name }))} />
        </MiniLabel>
      </MoreFields>
    </SheetFrame>
  );
}

// ── Return goods ────────────────────────────────────────────────────────────

export function ReturnSheet({ invoice, existing, onCancel, onDone }: { invoice: InvoiceView; existing?: CreditMemo; onCancel: () => void; onDone: (no: string) => void }) {
  const credits = React.useSyncExternalStore(creditsStore.subscribe, creditsStore.get, creditsStore.get);
  const lines = docLines(invoice);
  const alreadyBack = (lineId: string) =>
    credits.filter((c) => c.invoiceNo === invoice.doc.no && !c.cancelled && c.no !== existing?.no).reduce((s, c) => s + c.lines.filter((x) => x.lineId === lineId).reduce((a, x) => a + x.qty, 0), 0);
  const [qty, setQty] = React.useState<Record<string, number>>(() => Object.fromEntries(existing?.lines.map((x) => [x.lineId, x.qty]) ?? []));
  const [date, setDate] = React.useState(existing?.date ?? TODAY);
  const [reason, setReason] = React.useState(existing?.reason ?? RETURN_REASONS[0]);
  const [locationId, setLocationId] = React.useState(existing?.locationId ?? invoice.doc.locationId ?? invoice.order.locationId);
  const [repId, setRepId] = React.useState<string | null>(existing?.repId ?? invoice.order.repId);
  const [memo, setMemo] = React.useState(existing?.memo ?? "");
  const [custom, setCustom] = React.useState<Record<string, string>>(existing?.custom ?? { ...invoice.order.custom });
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);

  const scaled = (x: (typeof lines)[number], q: number) => ({ ...x.line, qty: q, discountAmt: x.line.discountAmt ? (x.line.discountAmt * q) / x.line.qty : undefined });
  const chosen = lines.filter((x) => (qty[x.lineId] ?? 0) > 0);
  const t = totalsOf(chosen.map((x) => scaled(x, qty[x.lineId])));
  const toBalance = Math.min(t.total, invoice.balance + (existing?.applications.find((a) => a.invoiceNo === invoice.doc.no)?.amount ?? 0));

  const commit = () => {
    setTried(true);
    if (!chosen.length) return setRefusal("Nothing to return. Set a quantity on at least one line.");
    for (const x of lines) {
      const max = x.qty - alreadyBack(x.lineId);
      if ((qty[x.lineId] ?? 0) > max) return setRefusal(`Only ${fmtQty(max)} of ${itemById(x.line.itemId)?.name} can come back on this invoice.`);
    }
    if (!custom.channel) return setRefusal("Choose a sales channel.");
    const payload = {
      date,
      reason,
      memo,
      repId,
      locationId,
      custom,
      lines: chosen.map((x) => ({ lineId: x.lineId, qty: qty[x.lineId] })),
      applications: toBalance > 0 ? [{ invoiceNo: invoice.doc.no, amount: money(toBalance) }] : [],
    };
    if (existing) {
      replaceCredit(existing.no, payload);
      return onDone(existing.no);
    }
    onDone(
      addCredit({
        ...payload,
        subsidiaryId: invoice.order.subsidiaryId,
        customerId: invoice.order.customerId,
        invoiceNo: invoice.doc.no,
        orderNo: invoice.order.no,
        state: "pending",
        approverId: ME.id,
        refunded: 0,
        cancelled: null,
        dims: {},
        byId: ME.id,
        attachments: [],
      }),
    );
  };

  return (
    <SheetFrame
      onCommit={commit}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      foot={
        <>
          <span className="text-[11.5px] text-bz-text-muted">Credits the invoice. The goods come back on a receipt.</span>
          <button type="button" className={cn(GHOST, "ml-auto")} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={commit}>
            <Undo2 size={13} /> {existing ? "Save return" : "Raise return"} <Kbd>⌘↵</Kbd>
          </button>
        </>
      }
    >
      <div className="px-5">
        <ChipRow className="border-t-0">
          <TermChip label="Date">
            <DateChip value={date} min={invoice.doc.date} max={TODAY} onChange={setDate} />
          </TermChip>
          <Sep />
          <TermChip label="Why">
            <PickChip label={reason} value={reason} onChange={setReason} options={RETURN_REASONS.map((r) => ({ value: r, label: r }))} width={240} />
          </TermChip>
          <Sep />
          <TermChip label="Back into">
            <PickChip label={locationById(locationId)?.name ?? ""} value={locationId} onChange={setLocationId} options={LOCATIONS.map((l) => ({ value: l.id, label: l.name }))} />
          </TermChip>
          <TermChip label="Rep">
            <PickChip label={repId ? personById(repId)!.name : "None"} value={repId} onChange={setRepId} options={PEOPLE.map((p) => ({ value: p.id, label: p.name }))} width={240} />
          </TermChip>
        </ChipRow>
      </div>
      <div className="px-5 pb-5 pt-5">
        <h3 className="m-0 mb-2 text-[12px] font-semibold text-bz-text">What comes back</h3>
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          <div className={cn("hidden grid-cols-[minmax(0,1fr)_64px_112px_92px_100px] items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
            <span>Item</span>
            <span className="text-right">Invoiced</span>
            <span className="text-center">Return</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Credit</span>
          </div>
          {lines.map((x) => {
            const it = itemById(x.line.itemId)!;
            const max = x.qty - alreadyBack(x.lineId);
            const q = qty[x.lineId] ?? 0;
            return (
              <div key={x.lineId} className="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0 sm:grid-cols-[minmax(0,1fr)_64px_112px_92px_100px]">
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] text-bz-text">{it.name}</span>
                  <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                    {it.code}
                    {x.line.discountPct > 0 && ` · ${x.line.discountPct}% off`}
                    {` · ${TAX_LABEL[x.line.tax]}`}
                    {max < x.qty && ` · ${fmtQty(x.qty - max)} already returned`}
                  </span>
                </span>
                <span className={cn("hidden text-right text-[12px] text-bz-text-muted sm:block", NUM)}>
                  {fmtQty(x.qty)} {x.line.unit ?? it.unit}
                </span>
                <span className="flex justify-center">
                  <NumberField value={q} onChange={(v) => setQty((s) => ({ ...s, [x.lineId]: v }))} max={max} invalid={q > max} className="w-[104px]" ariaLabel={`Return — ${it.name}`} />
                </span>
                <span className="hidden text-right text-[12px] text-bz-text-muted sm:block">
                  <Amount value={x.line.rate} />
                </span>
                <span className="hidden text-right text-[12.5px] font-semibold text-bz-text sm:block">
                  <Amount value={lineGross(scaled(x, q))} />
                </span>
              </div>
            );
          })}
        </div>

        <MoneyList
          rows={[
            ...totalsRows(t, { currency: invoice.order.currency, exchangeRate: invoice.order.exchangeRate, totalLabel: "Credit total" }),
            { label: `Off ${invoice.doc.no}'s balance`, value: <Amount value={toBalance} /> },
            ...(t.total - toBalance > 0.005 ? [{ label: "Open credit", value: <Amount value={t.total - toBalance} />, soft: true }] : []),
          ]}
        />
      </div>
      <MoreFields memo={memo} onMemo={setMemo} custom={custom} onCustom={setCustom} tried={tried} />
    </SheetFrame>
  );
}
