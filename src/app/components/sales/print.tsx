import * as React from "react";
import { useParams, useSearchParams } from "react-router";
import { Download, FileText, Minus, Plus, Printer, Receipt as ReceiptIcon, ScrollText, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, GHOST, GHOST_SM, LABEL, NUM, Portal, Switch } from "./bzw";
import { Order, TAX_LABEL, customerById, itemById, lineGross, lineNet, locationById, personById, termById, totalsOf, TODAY } from "./orders";
import { Subsidiary, amountInWords, bsDate, bsLong, methodById, subsidiaryById, tdsById } from "./master";
import { creditLines, creditTotals, docLines, docTotals, receiptAdvance, receiptTds, useSales } from "./flow";

// ════════════════════════════════════════════════════════════════════════════
// PRINT — every sales record, on paper
//
// One model (buildPrint) turns any record into what a printed document needs;
// the templates only lay it out. Three templates, because three real uses:
//
//   Classic A4   the everyday document — quiet, typographic, brand kept to a
//                mark and a hairline; reads in black and white.
//   Tax invoice  the IRD layout for Nepal: seller & buyer PAN, AD + BS dates,
//                HS codes, taxable / non-taxable / VAT split, amount in words,
//                and the reprint label ("Copy of original — 2").
//   Receipt 80mm a counter slip for a cash sale or a payment receipt.
//
// The preview is a sheet on a desk, with the template and a few options beside
// it — not a settings page. "Print" opens the bare page, which prints clean.
// ════════════════════════════════════════════════════════════════════════════

export type Template = "classic" | "ird" | "slip";

type Row = { sn: number; code: string; name: string; desc?: string; hs: string; qty: number; unit: string; rate: number; disc: number; tax: string; amount: number; note?: string };

export type PrintModel = {
  kind: "invoice" | "order" | "estimate" | "delivery" | "receipt" | "credit";
  title: string;
  no: string;
  date: string;
  company: Subsidiary;
  party: { label: string; name: string; pan: string; address: string };
  shipTo?: { label: string; name: string; address: string };
  meta: [string, string][];
  rows: Row[];
  priced: boolean;
  totals: { label: string; value: number; strong?: boolean; minus?: boolean }[];
  currency: string;
  words: number;
  memo?: string;
  payment?: [string, string][];
  allocations?: { no: string; amount: number; tds: number }[];
  signatures: string[];
  draft?: string;
  reprints: number;
};

const shortDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export function buildPrint(no: string, data: ReturnType<typeof useSales>): PrintModel | null {
  const { orders, estimates, receipts, credits, invoices } = data;
  const rowsOf = (lines: { line: Order["lines"][number]; qty: number }[]): Row[] =>
    lines.map(({ line, qty }, i) => {
      const it = itemById(line.itemId)!;
      const scaled = { ...line, qty, discountAmt: line.discountAmt ? (line.discountAmt * qty) / line.qty : undefined };
      return { sn: i + 1, code: it.code, name: it.name, desc: line.description, hs: it.hs, qty, unit: line.unit ?? it.unit, rate: line.rate, disc: line.qty * line.rate - lineGross({ ...line }) ? (line.qty * line.rate - lineGross(line)) * (qty / line.qty) : 0, tax: TAX_LABEL[line.tax], amount: lineGross(scaled) };
    });
  const money = (t: ReturnType<typeof totalsOf>, extra: PrintModel["totals"] = []) => [
    { label: "Sub total", value: t.subtotal },
    ...(t.discount ? [{ label: "Discount", value: t.discount, minus: true }] : []),
    ...(t.bill ? [{ label: "Bill discount", value: t.bill, minus: true }] : []),
    ...t.byTax.map((x) => ({ label: x.tax ? `${x.label} on ${x.base.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : `${x.label}`, value: x.tax ? x.tax : x.base })),
    { label: "Total", value: t.total, strong: true },
    ...extra,
  ];

  const est = estimates.find((e) => e.no === no);
  if (est) {
    const c = customerById(est.customerId)!;
    const t = totalsOf(est.lines);
    return {
      kind: "estimate", title: "Quotation", no, date: est.date, company: subsidiaryById(est.subsidiaryId),
      party: { label: "Quoted to", name: c.name, pan: c.pan, address: c.address },
      meta: [["Valid till", est.validTill ? shortDate(est.validTill) : "—"], ["Payment term", termById(est.termId)?.name ?? "—"], ["Sales rep", personById(est.repId)?.name ?? "—"], ["Currency", est.currency]],
      rows: rowsOf(est.lines.map((l) => ({ line: l, qty: l.qty }))), priced: true, totals: money(t),
      currency: est.currency, words: t.total, memo: est.memo, signatures: ["Prepared by", "Authorised signatory"], draft: est.approval.state === "pending" ? "Pending approval" : undefined, reprints: 0,
    };
  }

  const order = orders.find((o) => o.no === no && !o.direct);
  if (order) {
    const c = customerById(order.customerId)!;
    const t = totalsOf(order.lines);
    return {
      kind: "order", title: "Sales order", no, date: order.date, company: subsidiaryById(order.subsidiaryId),
      party: { label: "Customer", name: c.name, pan: c.pan, address: order.billingAddress },
      shipTo: { label: "Deliver from", name: locationById(order.locationId)?.name ?? "", address: order.expected ? `Expected ${shortDate(order.expected)}` : "" },
      meta: [["Customer PO", order.customerPo ?? "—"], ["Payment term", termById(order.termId)?.name ?? "—"], ["Sales rep", order.repId ? personById(order.repId)?.name ?? "—" : "—"], ["Reference", order.source?.no ?? "—"]],
      rows: rowsOf(order.lines.map((l) => ({ line: l, qty: l.qty }))), priced: true, totals: money(t),
      currency: order.currency, words: t.total, memo: order.memo, signatures: ["Prepared by", "Approved by", "Customer acceptance"], draft: order.approval.state === "pending" ? "Pending approval" : undefined, reprints: 0,
    };
  }

  const inv = invoices.find((v) => v.doc.no === no);
  if (inv) {
    const c = inv.customer;
    const p = inv.doc.paidAtSave;
    return {
      kind: "invoice", title: "Tax invoice", no, date: inv.doc.date, company: subsidiaryById(inv.order.subsidiaryId),
      party: { label: "Bill to", name: c.name, pan: c.pan, address: inv.doc.address ?? inv.order.billingAddress },
      meta: [["Due date", inv.doc.due ? shortDate(inv.doc.due) : "—"], ["Payment term", termById(inv.order.termId)?.name ?? "—"], ["Order ref", inv.order.direct ? "Counter sale" : inv.order.no], ["Sales rep", inv.order.repId ? personById(inv.order.repId)?.name ?? "—" : "—"]],
      rows: rowsOf(docLines(inv)), priced: true,
      totals: money(inv.totals, [...(inv.totals.tds ? [{ label: `TDS · ${tdsById(inv.doc.tdsCode)?.name}`, value: inv.totals.tds, minus: true }, { label: "Receivable", value: inv.totals.receivable, strong: true }] : [])]),
      currency: inv.order.currency, words: inv.total, memo: inv.doc.memo || inv.order.memo,
      payment: p ? [["Paid", `${methodById(p.methodId).name} · ${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`], ["Deposited to", p.depositTo]] : [["Pay to", "Nabil Bank Ltd · A/c 0145 0172 2210 · Tripureshwor"], ["Reference", no]],
      signatures: ["Prepared by", "Authorised signatory", "Received by"], draft: inv.doc.state === "pending" ? "Pending approval" : inv.doc.cancelled ? "Cancelled" : undefined, reprints: 1,
    };
  }

  const del = orders.flatMap((o) => o.docs.filter((d) => d.kind === "delivery").map((doc) => ({ doc, order: o, customer: customerById(o.customerId)! }))).find((r) => r.doc.no === no);
  if (del) {
    return {
      kind: "delivery", title: "Delivery note", no, date: del.doc.date, company: subsidiaryById(del.order.subsidiaryId),
      party: { label: "Deliver to", name: del.customer.name, pan: del.customer.pan, address: del.doc.address ?? del.customer.address },
      shipTo: { label: "Dispatched from", name: locationById(del.doc.locationId ?? del.order.locationId)?.name ?? "", address: "" },
      meta: [["Order ref", del.order.no], ["Customer PO", del.order.customerPo ?? "—"], ["Vehicle", del.doc.truck ?? "—"], ["Driver", del.doc.driver ?? "—"]],
      rows: rowsOf(docLines(del)).map((r, i) => {
        const x = docLines(del)[i];
        const batches = del.doc.batches?.filter((b) => b.lineId === x.lineId) ?? [];
        const sn = (batch?: string) => del.doc.serials?.find((s) => s.lineId === x.lineId && s.batch === batch)?.serials ?? [];
        const range = (list: string[]) => (list.length > 1 ? `${list[0]}–${list[list.length - 1]}` : list[0]);
        const loose = sn(undefined);
        if (batches.length)
          return { ...r, note: batches.map((b) => `Batch ${b.batch}${sn(b.batch).length ? ` · S/N ${range(sn(b.batch))}` : ""}`).join(" · ") };
        return { ...r, note: loose.length ? `S/N ${range(loose)}` : `${x.line.qty} ordered` };
      }),
      priced: false, totals: [], currency: del.order.currency, words: 0, memo: del.doc.memo,
      signatures: ["Dispatched by", "Driver", "Received in good condition"], draft: del.doc.state === "pending" ? "Pending approval" : undefined, reprints: 0,
    };
  }

  const r = receipts.find((x) => x.no === no);
  if (r) {
    const c = customerById(r.customerId)!;
    const m = methodById(r.methodId);
    return {
      kind: "receipt", title: "Payment receipt", no, date: r.date, company: subsidiaryById(r.subsidiaryId),
      party: { label: "Received from", name: c.name, pan: c.pan, address: c.address },
      meta: [["Method", m.name], ...m.fields.filter((f) => r.methodFields[f.key]).map((f) => [f.label, r.methodFields[f.key]] as [string, string]), ["Deposited to", r.depositTo]],
      rows: [], priced: true, allocations: r.allocations.map((a) => ({ no: a.invoiceNo, amount: a.amount, tds: a.tds ?? 0 })),
      totals: [{ label: "Applied to invoices", value: r.allocations.reduce((s, a) => s + a.amount, 0) }, ...(receiptTds(r) ? [{ label: "TDS withheld", value: receiptTds(r) }] : []), ...(receiptAdvance(r) ? [{ label: "Kept as advance", value: receiptAdvance(r) }] : []), { label: "Amount received", value: r.amount, strong: true }],
      currency: r.currency, words: r.amount, memo: r.memo, signatures: ["Received by", "Authorised signatory"], draft: r.state === "pending" ? "Pending approval" : undefined, reprints: 0,
    };
  }

  const cm = credits.find((x) => x.no === no);
  if (cm) {
    const c = customerById(cm.customerId)!;
    const t = creditTotals(orders, cm);
    return {
      kind: "credit", title: "Credit note", no, date: cm.date, company: subsidiaryById(cm.subsidiaryId),
      party: { label: "Credit to", name: c.name, pan: c.pan, address: c.address },
      meta: [["Against invoice", cm.invoiceNo], ["Reason", cm.reason], ["Returned to", locationById(cm.locationId)?.name ?? "—"], ["Order ref", cm.orderNo]],
      rows: rowsOf(creditLines(orders, cm)), priced: true, totals: money(t), currency: "NPR", words: t.total, memo: cm.memo,
      signatures: ["Prepared by", "Authorised signatory"], draft: cm.state === "pending" ? "Pending approval" : undefined, reprints: 0,
    };
  }
  return null;
}

// ── Templates ───────────────────────────────────────────────────────────────

type Opts = { bs: boolean; hs: boolean; prices: boolean; signatures: boolean };

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Mark({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-[7px] bg-bz-olive font-bold text-bz-fire" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      b
    </span>
  );
}

function Classic({ m, o }: { m: PrintModel; o: Opts }) {
  const priced = m.priced && o.prices && m.rows.length > 0;
  return (
    <div className="relative flex min-h-full flex-col px-[54px] pb-[40px] pt-[48px] text-[11px] leading-[1.45] text-bz-text">
      {m.draft && (
        <span className="pointer-events-none absolute right-[54px] top-[150px] rotate-[-8deg] rounded border-2 border-bz-red/40 px-2 py-0.5 text-[13px] font-bold uppercase tracking-[0.18em] text-bz-red/50">{m.draft}</span>
      )}
      {/* Head */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-3">
          <Mark />
          <div>
            <p className="m-0 text-[14px] font-semibold tracking-tight">{m.company.name}</p>
            <p className="m-0 text-bz-text-muted">{m.company.address}</p>
            <p className={cn("m-0 text-bz-text-muted", NUM)}>PAN {m.company.pan} · {m.company.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-bz-text-soft">{m.title}</p>
          <p className={cn("m-0 mt-1 text-[20px] font-semibold tracking-tight", NUM)}>{m.no}</p>
          <p className={cn("m-0 text-bz-text-muted", NUM)}>
            {shortDate(m.date)}
            {o.bs && <span className="text-bz-text-soft"> · BS {bsDate(m.date)}</span>}
          </p>
        </div>
      </div>

      <div className="mt-7 h-px bg-bz-text" />

      {/* Parties & meta */}
      <div className="mt-5 grid grid-cols-[1.2fr_1fr_1fr] gap-6">
        <div>
          <p className="m-0 mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-bz-text-soft">{m.party.label}</p>
          <p className="m-0 text-[12px] font-semibold">{m.party.name}</p>
          <p className="m-0 text-bz-text-muted">{m.party.address}</p>
          {m.party.pan !== "—" && <p className={cn("m-0 text-bz-text-muted", NUM)}>PAN {m.party.pan}</p>}
        </div>
        {m.shipTo ? (
          <div>
            <p className="m-0 mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-bz-text-soft">{m.shipTo.label}</p>
            <p className="m-0 font-medium">{m.shipTo.name}</p>
            {m.shipTo.address && <p className="m-0 text-bz-text-muted">{m.shipTo.address}</p>}
          </div>
        ) : (
          <div />
        )}
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          {m.meta.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-bz-text-soft">{k}</dt>
              <dd className={cn("m-0 text-right font-medium", NUM)}>{v}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>

      {/* Lines */}
      {m.rows.length > 0 && (
        <table className="mt-7 w-full border-collapse">
          <thead>
            <tr className="border-b border-bz-text text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
              <th className="w-6 py-1.5 font-semibold">#</th>
              <th className="py-1.5 font-semibold">Item</th>
              {o.hs && <th className="w-[62px] py-1.5 font-semibold">HS code</th>}
              <th className="w-[70px] py-1.5 text-right font-semibold">Qty</th>
              {priced && <th className="w-[80px] py-1.5 text-right font-semibold">Rate</th>}
              {priced && <th className="w-[70px] py-1.5 text-right font-semibold">Disc.</th>}
              {priced ? <th className="w-[92px] py-1.5 text-right font-semibold">Amount</th> : <th className="w-[140px] py-1.5 text-right font-semibold">Detail</th>}
            </tr>
          </thead>
          <tbody>
            {m.rows.map((r) => (
              <tr key={r.sn} className="border-b border-bz-line-soft align-top">
                <td className={cn("py-2 text-bz-text-soft", NUM)}>{r.sn}</td>
                <td className="py-2 pr-3">
                  <span className="font-medium">{r.name}</span>
                  <span className={cn("block text-[9.5px] text-bz-text-soft", NUM)}>
                    {r.code}
                    {r.desc && ` · ${r.desc}`}
                    {priced && r.tax !== "VAT 13%" && ` · ${r.tax}`}
                  </span>
                </td>
                {o.hs && <td className={cn("py-2 text-bz-text-muted", NUM)}>{r.hs}</td>}
                <td className={cn("py-2 text-right", NUM)}>
                  {r.qty.toLocaleString("en-US")} <span className="text-bz-text-soft">{r.unit}</span>
                </td>
                {priced && <td className={cn("py-2 text-right", NUM)}>{fmt(r.rate)}</td>}
                {priced && <td className={cn("py-2 text-right text-bz-text-muted", NUM)}>{r.disc ? fmt(r.disc) : "—"}</td>}
                {priced ? <td className={cn("py-2 text-right font-medium", NUM)}>{fmt(r.amount)}</td> : <td className={cn("py-2 text-right text-bz-text-muted", NUM)}>{r.note}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {m.allocations && (
        <table className="mt-7 w-full border-collapse">
          <thead>
            <tr className="border-b border-bz-text text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
              <th className="py-1.5 font-semibold">Applied to invoice</th>
              <th className="w-[110px] py-1.5 text-right font-semibold">TDS</th>
              <th className="w-[120px] py-1.5 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {m.allocations.map((a) => (
              <tr key={a.no} className="border-b border-bz-line-soft">
                <td className={cn("py-2 font-medium", NUM)}>{a.no}</td>
                <td className={cn("py-2 text-right text-bz-text-muted", NUM)}>{a.tds ? fmt(a.tds) : "—"}</td>
                <td className={cn("py-2 text-right font-medium", NUM)}>{fmt(a.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Totals & words */}
      {(m.totals.length > 0 || m.payment) && (
        <div className="mt-5 grid grid-cols-[1fr_260px] gap-8">
          <div className="flex flex-col gap-3">
            {m.words > 0 && (
              <div>
                <p className="m-0 mb-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-bz-text-soft">In words</p>
                <p className="m-0 italic">{amountInWords(m.words, m.currency)}</p>
              </div>
            )}
            {m.payment && (
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                {m.payment.map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt className="text-bz-text-soft">{k}</dt>
                    <dd className={cn("m-0", NUM)}>{v}</dd>
                  </React.Fragment>
                ))}
              </dl>
            )}
          </div>
          {m.totals.length > 0 && o.prices && (
            <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
              {m.totals.map((t, i) => (
                <React.Fragment key={i}>
                  <dt className={cn(t.strong ? "border-t border-bz-text pt-1.5 text-[12px] font-semibold" : "text-bz-text-muted")}>{t.label}</dt>
                  <dd className={cn("m-0 text-right", NUM, t.strong ? "border-t border-bz-text pt-1.5 text-[12px] font-semibold" : "")}>
                    {t.strong && <span className="mr-1 text-[9px] text-bz-text-soft">{m.currency}</span>}
                    {t.minus ? "−" : ""}
                    {fmt(t.value)}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          )}
        </div>
      )}

      {m.memo && (
        <div className="mt-6 rounded-[6px] bg-bz-paper-warm px-3 py-2">
          <p className="m-0 mb-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-bz-text-soft">Note</p>
          <p className="m-0">{m.memo}</p>
        </div>
      )}

      <div className="flex-1" />

      {o.signatures && (
        <div className="mt-12 grid gap-8" style={{ gridTemplateColumns: `repeat(${m.signatures.length}, minmax(0,1fr))` }}>
          {m.signatures.map((s) => (
            <div key={s} className="border-t border-bz-line pt-1.5 text-[10px] text-bz-text-muted">
              {s}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex items-center justify-between border-t border-bz-line-soft pt-2 text-[9px] text-bz-text-soft">
        <span>Thank you for your business.</span>
        <span className={NUM}>
          {m.no} · Page 1 of 1 · Printed {shortDate(TODAY)}
        </span>
      </div>
    </div>
  );
}

/** Nepal IRD layout — the fields a VAT invoice has to carry, nothing decorative. */
function Ird({ m, o }: { m: PrintModel; o: Opts }) {
  const taxable = m.totals.filter((t) => /VAT/.test(t.label));
  const nonTax = m.totals.filter((t) => /Exempt|Zero/.test(t.label));
  const total = m.totals.find((t) => t.strong && t.label === "Total");
  return (
    <div className="relative flex min-h-full flex-col px-[48px] pb-[36px] pt-[40px] text-[10.5px] leading-[1.45] text-bz-text">
      <div className="flex items-start justify-between text-[9.5px] text-bz-text-muted">
        <span className={NUM}>PAN {m.company.pan}</span>
        <span className="font-semibold uppercase tracking-[0.12em]">{m.reprints > 0 ? `Copy of original — ${m.reprints + 1}` : "Original"}</span>
      </div>
      <div className="mt-2 text-center">
        <p className="m-0 text-[16px] font-semibold tracking-tight">{m.company.name}</p>
        <p className="m-0 text-bz-text-muted">{m.company.address} · {m.company.phone}</p>
        <p className="m-0 mt-3 inline-block border-y border-bz-text px-4 py-0.5 text-[12px] font-bold uppercase tracking-[0.28em]">{m.kind === "credit" ? "Credit note" : m.kind === "invoice" ? "Tax invoice" : m.title}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-6 border border-bz-text px-3 py-2.5">
        <dl className="m-0 grid grid-cols-[92px_1fr] gap-y-0.5">
          <dt className="text-bz-text-muted">Buyer's name</dt>
          <dd className="m-0 font-semibold">{m.party.name}</dd>
          <dt className="text-bz-text-muted">Address</dt>
          <dd className="m-0">{m.party.address}</dd>
          <dt className="text-bz-text-muted">Buyer's PAN</dt>
          <dd className={cn("m-0", NUM)}>{m.party.pan}</dd>
        </dl>
        <dl className="m-0 grid grid-cols-[104px_1fr] gap-y-0.5">
          <dt className="text-bz-text-muted">{m.kind === "credit" ? "Credit note no." : "Invoice no."}</dt>
          <dd className={cn("m-0 font-semibold", NUM)}>{m.no}</dd>
          <dt className="text-bz-text-muted">Date (AD)</dt>
          <dd className={cn("m-0", NUM)}>{shortDate(m.date)}</dd>
          <dt className="text-bz-text-muted">Date (BS)</dt>
          <dd className={cn("m-0", NUM)}>{bsLong(m.date)}</dd>
          {m.meta.slice(0, 2).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-bz-text-muted">{k}</dt>
              <dd className={cn("m-0", NUM)}>{v}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>

      <table className="mt-4 w-full border-collapse border border-bz-text">
        <thead>
          <tr className="bg-bz-paper-warm text-[9.5px] font-semibold">
            {["S.N.", "HS code", "Description", "Qty", "Unit", "Rate", "Amount"].map((h, i) => (
              <th key={h} className={cn("border border-bz-text px-1.5 py-1 font-semibold", i >= 3 && i !== 4 ? "text-right" : "text-left")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {m.rows.map((r) => (
            <tr key={r.sn} className="align-top">
              <td className={cn("border-x border-bz-text px-1.5 py-1", NUM)}>{r.sn}</td>
              <td className={cn("border-x border-bz-text px-1.5 py-1", NUM)}>{r.hs}</td>
              <td className="border-x border-bz-text px-1.5 py-1">
                {r.name}
                {r.tax !== "VAT 13%" && <span className="text-bz-text-muted"> ({r.tax})</span>}
              </td>
              <td className={cn("border-x border-bz-text px-1.5 py-1 text-right", NUM)}>{r.qty.toLocaleString("en-US")}</td>
              <td className="border-x border-bz-text px-1.5 py-1">{r.unit}</td>
              <td className={cn("border-x border-bz-text px-1.5 py-1 text-right", NUM)}>{fmt(r.rate)}</td>
              <td className={cn("border-x border-bz-text px-1.5 py-1 text-right", NUM)}>{fmt(r.amount + r.disc)}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 6 - m.rows.length) }).map((_, i) => (
            <tr key={`pad${i}`}>
              {Array.from({ length: 7 }).map((__, j) => (
                <td key={j} className="h-5 border-x border-bz-text" />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-[1fr_250px] border-x border-b border-bz-text">
        <div className="border-r border-bz-text px-2 py-1.5">
          <p className="m-0 text-bz-text-muted">In words:</p>
          <p className="m-0 font-medium">{amountInWords(m.words, m.currency)}</p>
        </div>
        <dl className="m-0 grid grid-cols-[1fr_auto]">
          {[
            ["Sub total", m.totals.find((t) => t.label === "Sub total")?.value ?? 0],
            ["Discount", (m.totals.find((t) => t.label === "Discount")?.value ?? 0) + (m.totals.find((t) => t.label === "Bill discount")?.value ?? 0)],
            ["Non-taxable", nonTax.reduce((s, t) => s + t.value, 0)],
            ["Taxable amount", taxable.reduce((s, t) => s + t.value / 0.13, 0)],
            ["VAT 13%", taxable.reduce((s, t) => s + t.value, 0)],
          ].map(([k, v]) => (
            <React.Fragment key={k as string}>
              <dt className="border-b border-bz-line px-2 py-0.5 text-bz-text-muted">{k}</dt>
              <dd className={cn("m-0 border-b border-bz-line px-2 py-0.5 text-right", NUM)}>{fmt(v as number)}</dd>
            </React.Fragment>
          ))}
          <dt className="px-2 py-1 text-[11.5px] font-bold">Grand total</dt>
          <dd className={cn("m-0 px-2 py-1 text-right text-[11.5px] font-bold", NUM)}>{fmt(total?.value ?? 0)}</dd>
        </dl>
      </div>

      {m.payment && (
        <p className={cn("m-0 mt-3 text-bz-text-muted", NUM)}>
          {m.payment.map(([k, v]) => `${k}: ${v}`).join("   ·   ")}
        </p>
      )}

      <div className="flex-1" />
      <div className="mt-14 grid grid-cols-3 gap-8 text-[9.5px] text-bz-text-muted">
        <div className="border-t border-bz-text pt-1">Prepared by</div>
        <div className="border-t border-bz-text pt-1">Checked by</div>
        <div className="border-t border-bz-text pt-1 text-right">For {m.company.name}</div>
      </div>
      <p className={cn("m-0 mt-4 text-center text-[8.5px] text-bz-text-soft", NUM)}>
        Printed by {personById("EMP-101")?.name} on {shortDate(TODAY)} · BS {bsDate(TODAY)} · This invoice is computer generated.
      </p>
    </div>
  );
}

/** 80 mm counter slip. */
function Slip({ m }: { m: PrintModel; o: Opts }) {
  const total = m.totals.find((t) => t.strong);
  return (
    <div className="mx-auto w-[302px] px-4 py-5 font-mono text-[10.5px] leading-[1.5] text-bz-text">
      <div className="text-center">
        <Mark size={22} />
        <p className="m-0 mt-1 font-sans text-[12px] font-semibold">{m.company.name}</p>
        <p className="m-0 text-bz-text-muted">{m.company.address}</p>
        <p className="m-0 text-bz-text-muted">PAN {m.company.pan}</p>
        <p className="m-0 mt-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em]">{m.title}</p>
      </div>
      <div className="my-2 border-t border-dashed border-bz-text" />
      <p className="m-0 flex justify-between"><span>{m.no}</span><span>{shortDate(m.date)}</span></p>
      <p className="m-0 truncate">{m.party.name}</p>
      <div className="my-2 border-t border-dashed border-bz-text" />
      {m.rows.map((r) => (
        <div key={r.sn}>
          <p className="m-0 truncate">{r.name}</p>
          <p className="m-0 flex justify-between text-bz-text-muted">
            <span>{r.qty} {r.unit} × {fmt(r.rate)}</span>
            <span className="text-bz-text">{fmt(r.amount)}</span>
          </p>
        </div>
      ))}
      {m.allocations?.map((a) => (
        <p key={a.no} className="m-0 flex justify-between"><span>{a.no}</span><span>{fmt(a.amount)}</span></p>
      ))}
      <div className="my-2 border-t border-dashed border-bz-text" />
      {m.totals.slice(0, total ? m.totals.indexOf(total) : undefined).map((t) => (
        <p key={t.label} className="m-0 flex justify-between text-bz-text-muted"><span className="truncate pr-2">{t.label}</span><span>{t.minus ? "−" : ""}{fmt(t.value)}</span></p>
      ))}
      {total && <p className="m-0 mt-1 flex justify-between text-[12.5px] font-bold"><span>TOTAL {m.currency}</span><span>{fmt(total.value)}</span></p>}
      {total && m.totals.slice(m.totals.indexOf(total) + 1).map((t) => (
        <p key={t.label} className="m-0 flex justify-between text-bz-text-muted"><span className="truncate pr-2">{t.label}</span><span>{t.minus ? "−" : ""}{fmt(t.value)}</span></p>
      ))}
      {m.payment && <p className="m-0 mt-1 text-bz-text-muted">{m.payment[0][1]}</p>}
      <div className="my-2 border-t border-dashed border-bz-text" />
      <p className="m-0 text-center text-bz-text-muted">Thank you — please visit again</p>
    </div>
  );
}

export const TEMPLATES: { id: Template; name: string; hint: string; icon: React.ComponentType<{ size?: number }>; for: PrintModel["kind"][] }[] = [
  { id: "classic", name: "Classic A4", hint: "Everyday document", icon: FileText, for: ["invoice", "order", "estimate", "delivery", "receipt", "credit"] },
  { id: "ird", name: "Tax invoice (IRD)", hint: "Nepal VAT format", icon: ScrollText, for: ["invoice", "credit"] },
  { id: "slip", name: "Receipt 80 mm", hint: "Counter printer", icon: ReceiptIcon, for: ["invoice", "receipt"] },
];

export function PrintSheet({ model, template, opts, scale = 1 }: { model: PrintModel; template: Template; opts: Opts; scale?: number }) {
  const slip = template === "slip";
  return (
    <div className="bzw-light" style={{ width: (slip ? 302 : 794) * scale, height: slip ? undefined : 1123 * scale }}>
      <div
        className="origin-top-left bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_-12px_rgba(0,0,0,0.25)] print:shadow-none"
        style={{ width: slip ? 302 : 794, minHeight: slip ? undefined : 1123, transform: `scale(${scale})`, fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {template === "ird" ? <Ird m={model} o={opts} /> : slip ? <Slip m={model} o={opts} /> : <Classic m={model} o={opts} />}
      </div>
    </div>
  );
}

// ── Preview — a sheet on a desk, choices beside it ──────────────────────────

export function PrintPreview({ no, open, onClose, onToast }: { no: string; open: boolean; onClose: () => void; onToast: (t: string) => void }) {
  const data = useSales();
  const model = React.useMemo(() => buildPrint(no, data), [no, data]);
  const allowed = TEMPLATES.filter((t) => model && t.for.includes(model.kind));
  const [template, setTemplate] = React.useState<Template>(model?.kind === "invoice" ? "ird" : "classic");
  const [opts, setOpts] = React.useState<Opts>({ bs: true, hs: model?.kind !== "estimate", prices: true, signatures: true });
  const [zoom, setZoom] = React.useState(0.78);

  React.useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && (e.stopPropagation(), onClose());
    window.addEventListener("keydown", on, true);
    return () => window.removeEventListener("keydown", on, true);
  }, [open, onClose]);

  if (!open || !model) return null;
  const t = allowed.find((x) => x.id === template) ? template : "classic";

  return (
    <Portal>
      <div className="fixed inset-0 z-[1065] flex flex-col bg-bz-section-b">
        <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-bz-line bg-bz-paper px-4">
          <Printer size={15} className="text-bz-text-muted" />
          <span className="text-[13px] font-semibold text-bz-text">Print {model.no}</span>
          <span className="text-[11.5px] text-bz-text-soft">{model.title}</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-bz-md border border-bz-line-soft bg-bz-surface px-1 sm:flex">
              <button type="button" className="flex size-7 items-center justify-center text-bz-text-muted hover:text-bz-text" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} aria-label="Zoom out">
                <Minus size={12} />
              </button>
              <span className={cn("w-10 text-center text-[11px] text-bz-text-muted", NUM)}>{Math.round(zoom * 100)}%</span>
              <button type="button" className="flex size-7 items-center justify-center text-bz-text-muted hover:text-bz-text" onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))} aria-label="Zoom in">
                <Plus size={12} />
              </button>
            </div>
            <button type="button" className={GHOST} onClick={() => onToast(`${model.no}.pdf downloaded`)}>
              <Download size={13} /> PDF
            </button>
            <button
              type="button"
              className={BTN}
              onClick={() => {
                // The print tab has its own copy of the design data; hand it the record as it is now.
                try {
                  localStorage.setItem("bzw.print", JSON.stringify(model));
                } catch {
                  /* falls back to the seed */
                }
                window.open(`/design/sales/print/${model.no}?t=${t}&bs=${+opts.bs}&hs=${+opts.hs}&p=${+opts.prices}&s=${+opts.signatures}`, "_blank");
              }}
            >
              <Printer size={13} /> Print
            </button>
            <button type="button" className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" onClick={onClose} aria-label="Close preview">
              <X size={15} />
            </button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-auto p-6 [scrollbar-width:thin]">
            <div className="mx-auto w-fit">
              <PrintSheet model={model} template={t} opts={opts} scale={zoom} />
            </div>
          </div>
          <aside className="hidden w-[280px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-bz-line bg-bz-paper p-4 md:flex">
            <div>
              <p className={cn(LABEL, "m-0 mb-2")}>Template</p>
              <div className="flex flex-col gap-1.5">
                {allowed.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => setTemplate(x.id)}
                    className={cn("flex items-center gap-2.5 rounded-bz-md border px-2.5 py-2 text-left transition-colors", t === x.id ? "border-bz-text-muted bg-bz-fire/10" : "border-bz-line-soft bg-bz-surface hover:bg-bz-paper-warm")}
                  >
                    <span className="flex size-8 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
                      <x.icon size={15} />
                    </span>
                    <span>
                      <span className="block text-[12px] font-semibold text-bz-text">{x.name}</span>
                      <span className="block text-[11px] text-bz-text-soft">{x.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
              <button type="button" className={cn(GHOST_SM, "mt-2 w-full")} onClick={() => onToast("Opens Print Builder")}>
                Edit templates in Print Builder
              </button>
            </div>
            {t !== "slip" && (
              <div>
                <p className={cn(LABEL, "m-0 mb-2")}>Show</p>
                {(
                  [
                    ["bs", "BS dates"],
                    ["hs", "HS codes"],
                    ["prices", model.kind === "delivery" ? "Prices (hidden on delivery notes)" : "Prices and totals"],
                    ["signatures", "Signature lines"],
                  ] as const
                )
                  .filter(([k]) => !(t === "ird" && (k === "bs" || k === "hs")))
                  .map(([k, label]) => (
                    <label key={k} className="flex items-center justify-between py-1.5 text-[12px] text-bz-text">
                      {label}
                      <Switch on={opts[k]} onChange={(v) => setOpts((s) => ({ ...s, [k]: v }))} label={label} />
                    </label>
                  ))}
              </div>
            )}
            {model.draft && (
              <p className="m-0 rounded-bz-md bg-bz-paper-warm px-3 py-2 text-[11.5px] text-bz-text-muted">
                Prints with a “{model.draft}” stamp until it is approved.
              </p>
            )}
            {t === "ird" && <p className="m-0 text-[11px] text-bz-text-soft">Reprints are counted and labelled, as IRD requires.</p>}
          </aside>
        </div>
      </div>
    </Portal>
  );
}

// ── The bare page the Print button opens ────────────────────────────────────

export function PrintPage() {
  const { no } = useParams();
  const [q] = useSearchParams();
  const data = useSales();
  const handed = React.useMemo(() => {
    try {
      const m = JSON.parse(localStorage.getItem("bzw.print") ?? "null") as PrintModel | null;
      return m && m.no === no ? m : null;
    } catch {
      return null;
    }
  }, [no]);
  const model = handed ?? (no ? buildPrint(no, data) : null);
  React.useEffect(() => {
    document.title = `${no} · Print`;
  }, [no]);
  if (!model) return <p className="p-8 text-[13px]">Nothing to print for {no}.</p>;
  const t = (q.get("t") as Template) ?? "classic";
  const opts: Opts = { bs: q.get("bs") !== "0", hs: q.get("hs") !== "0", prices: q.get("p") !== "0", signatures: q.get("s") !== "0" };
  return (
    <div className="bzw-light min-h-screen bg-[#e9e9e4] py-8 print:bg-white print:py-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@page { size: ${t === "slip" ? "80mm auto" : "A4"}; margin: 0 } @media print { body { background: white } }`}</style>
      <div className="mx-auto mb-4 flex w-[794px] items-center gap-2 print:hidden">
        <span className="text-[12px] text-[#5A6053]">{model.title} · {model.no}</span>
        <button type="button" className={cn(BTN, "ml-auto")} onClick={() => window.print()}>
          <Printer size={13} /> Print
        </button>
      </div>
      <div className="mx-auto w-fit">
        <PrintSheet model={model} template={t} opts={opts} />
      </div>
    </div>
  );
}

export { customerById, lineNet };
