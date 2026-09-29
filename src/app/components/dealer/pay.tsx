import * as React from "react";
import { Building2, Landmark, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { Checkbox, Dialog, Field, INPUT, NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { SF_TODAY } from "../salesforce/data";
import { day, daysUntil, eligible, npr } from "../salesforce/engine";
import { schemesStore } from "../salesforce/store";
import { Money } from "../salesforce/ui";
import { LIME, PhotoSlot, SOFT } from "./kit";
import { COMPANY, METHOD_LABEL, addDays, dealer, notify, recordPayment, useAccount } from "./portal";
import type { OpenInvoice, PayMethod } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// PAY NOW — choose invoices, an amount and a way to pay
//
// No card fields, ever. Release 1 is a bank transfer or cheque with proof, recorded
// as waiting for the company to confirm it (a customer receipt pending check).
// eSewa / Khalti come later (owner decision #17), so the wallet is shown, not offered.
// ════════════════════════════════════════════════════════════════════════════

const METHODS: { value: PayMethod; icon: LucideIcon; help: string }[] = [
  { value: "bank", icon: Landmark, help: `Transfer to ${COMPANY} Pvt. Ltd. · Nabil Bank, Butwal · A/c 0101 0171 2233. It counts once we see it in the bank.` },
  { value: "cheque", icon: Building2, help: "Hand the cheque to your sales rep or drop it at the Butwal depot. It counts once it clears." },
];
const WALLET_SOON = { icon: Smartphone, label: "eSewa / Khalti" };

export function PayDialog({ open, onClose, preselect }: { open: boolean; onClose: () => void; preselect?: string[] }) {
  const acct = useAccount();
  const schemes = useStore(schemesStore);
  const early = schemes.find((s) => s.mechanic.kind === "early-payment" && eligible(s, dealer()) === null);
  const em = early?.mechanic.kind === "early-payment" ? early.mechanic : null;

  const [picked, setPicked] = React.useState<string[]>([]);
  const [amount, setAmount] = React.useState(0);
  const [touched, setTouched] = React.useState(false);
  const [method, setMethod] = React.useState<PayMethod>("bank");
  const [reference, setReference] = React.useState("");
  const [photos, setPhotos] = React.useState(0);

  // An invoice paid in full inside the scheme's window gets its early-payment discount.
  const discountOf = (inv: OpenInvoice) => (em && -daysUntil(inv.date) <= em.withinDays && inv.open === inv.amount ? Math.round((inv.open * em.pct) / 100) : 0);
  const chosen = acct.open.filter((i) => picked.includes(i.doc));
  const full = chosen.reduce((s, i) => s + i.open, 0);
  const discounts = chosen.map((i) => ({ doc: i.doc, amount: discountOf(i) })).filter((d) => d.amount > 0);
  const disc = discounts.reduce((s, d) => s + d.amount, 0);
  const due = full - disc;
  const pay = touched ? amount : due;
  const fullPay = pay >= due;

  React.useEffect(() => {
    if (!open) return;
    const start = preselect?.length ? preselect : acct.open.filter((i) => i.late > 0).map((i) => i.doc);
    setPicked(start.length ? start : acct.open.slice(0, 1).map((i) => i.doc));
    setTouched(false);
    setMethod("bank");
    setReference("");
    setPhotos(0);
    // Reset only as the dialog opens; the account changing underneath must not wipe a choice in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const valid = chosen.length > 0 && pay > 0 && pay <= due;
  const submit = () => {
    if (!valid) return;
    const rcp = recordPayment({ invoices: chosen, amount: pay, method, reference: reference.trim(), discounts: fullPay ? discounts : [] });
    notify(`Payment of NPR ${npr(pay)} sent to ${COMPANY} to confirm — ${rcp.doc}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      eyebrow="Pay now"
      title="Pay your invoices"
      size="wide"
      foot={
        <>
          <button type="button" onClick={onClose} className={SOFT}>
            Cancel
          </button>
          <button type="button" disabled={!valid} onClick={submit} className={LIME}>
            Send NPR {npr(pay)}
          </button>
        </>
      }
    >
      <p className="m-0 mb-2 text-[11.5px] font-semibold text-bz-text">Which invoices</p>
      {acct.open.length === 0 && <p className="m-0 text-[12px]">Nothing to pay — you are all settled.</p>}
      <ul className="m-0 flex list-none flex-col divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
        {acct.open.map((inv) => {
          const on = picked.includes(inv.doc);
          const d = discountOf(inv);
          return (
            <li key={inv.doc}>
              <label className="flex min-h-[52px] cursor-pointer items-center gap-3 py-2">
                <Checkbox on={on} onChange={(v) => {
                    setPicked((p) => (v ? [...p, inv.doc] : p.filter((x) => x !== inv.doc)));
                    setTouched(false);
                  }} label={inv.doc} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium text-bz-text">{inv.doc}</span>
                  <span className={cn("block text-[11px]", inv.late > 0 ? "text-bz-red" : "text-bz-text-soft")}>
                    {inv.late > 0 ? `${inv.late} days late` : inv.late === 0 ? "Due today" : `Due ${day(inv.due!)}`}
                    {d > 0 && <span className="text-bz-text-soft"> · pay in full by {day(addDays(inv.date, em!.withinDays))} and save NPR {npr(d)}</span>}
                    {inv.waiting > 0 && <span className="text-bz-text-soft"> · NPR {npr(inv.waiting)} already sent</span>}
                  </span>
                </span>
                <Money value={inv.open} className="text-[12.5px] font-medium text-bz-text" />
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Amount" hint={disc > 0 && fullPay ? `Includes NPR ${npr(disc)} off for paying early.` : pay < due ? "Part payment — it settles the oldest invoice first." : undefined}>
          <span className="relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">NPR</span>
            <input
              inputMode="numeric"
              value={pay ? pay.toLocaleString("en-US") : ""}
              onChange={(e) => {
                setTouched(true);
                setAmount(Number(e.target.value.replace(/\D/g, "")) || 0);
              }}
              className={cn(INPUT, "h-10 bg-bz-surface pl-11 text-[13px] font-semibold", NUM, pay > due && "border-bz-red-mark")}
              aria-label="Amount to pay"
            />
          </span>
          {pay > due && <span className="text-[10.5px] text-bz-red">That is more than these invoices add up to.</span>}
        </Field>
        <div className="flex flex-col justify-end text-[11.5px] text-bz-text-muted">
          <span>
            Selected <Money value={full} className="font-medium text-bz-text" />
          </span>
        </div>
      </div>

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
          <WALLET_SOON.icon size={15} />
          {WALLET_SOON.label}
          <span className="ml-auto text-[10.5px]">Coming soon</span>
        </span>
      </div>
      <p className="m-0 mt-2 text-[11.5px] leading-relaxed text-bz-text-muted">{METHODS.find((m) => m.value === method)!.help}</p>
      <div className="mt-4 flex flex-col gap-4">
        <Field label={method === "bank" ? "Transfer reference" : "Cheque number"} hint="Optional — it helps us match your payment.">
          <input value={reference} onChange={(e) => setReference(e.target.value)} className={cn(INPUT, "h-10 bg-bz-surface")} />
        </Field>
        <Field label="Proof of payment">
          <PhotoSlot count={photos} onAdd={() => setPhotos((n) => Math.min(3, n + 1))} onClear={() => setPhotos(0)} label={method === "bank" ? "Add the bank slip" : "Add a photo of the cheque"} />
        </Field>
      </div>
      <p className="m-0 mt-5 text-[10.5px] text-bz-text-soft">Sent on {day(SF_TODAY)}. It shows on your statement as waiting until {COMPANY} confirms it.</p>
    </Dialog>
  );
}
