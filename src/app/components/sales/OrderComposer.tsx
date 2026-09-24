import * as React from "react";
import { Building2, ChevronDown, ChevronRight, CircleAlert, CircleCheck, Lock, Plus, Repeat2, ScanBarcode, Search, X, Paperclip, MessageSquarePlus, Trash2 } from "lucide-react";
import { cn } from "../ui/utils";
import {
  Amount,
  Attachment,
  CUSTOMERS,
  ChildDoc,
  Comment,
  Customer,
  ITEMS,
  LOCATIONS,
  ME,
  Order,
  OrderLine,
  PEOPLE,
  TAX_CODES,
  TAX_LABEL,
  TERMS,
  TODAY,
  TaxCode,
  addDays,
  customerById,
  fmtQty,
  fmtShort,
  itemById,
  lastOrderFor,
  lineDiscount,
  lineGross,
  lineNet,
  lineTax,
  locationById,
  openOrdersFor,
  personById,
  termById,
  totalsOf,
  unitsOf,
} from "./orders";
import { Avatar, BTN, Dialog, DocLink, GHOST, GHOST_SM, ICON_BTN, INPUT, INPUT_SM, Kbd, LABEL, NUM, PANEL, Popover, Portal, Refusal, Segmented, Select, Switch, TEXTAREA } from "./bzw";
import { BILL_DISCOUNT_BASES, CURRENCIES, DEPOSIT_LEDGERS, DIMENSIONS, HEADER_FIELDS, LINE_FIELDS, PAYMENT_METHODS, PRICE_LEVELS, SUBSIDIARIES, TDS_CODES, bsDate, levelRate, methodById, subsidiaryById, tdsById } from "./master";
import { AddressField, AdvancedSearch, AmountInput, ChipFace, ChipRow, ConfirmDialog, CustomFieldInput, DateChip, Sep, TermChip } from "./parts";

// ════════════════════════════════════════════════════════════════════════════
// COMPOSER — orders, estimates and invoices are written in ONE surface
//
// Today there are near-identical forms per document and per entry point
// (create · update · copy · from-estimate · from-opportunity · direct invoice).
// Here there is one composer; what differs is only its NOUN, its SEED and its
// LOCKS. It is written like a document, top to bottom, in the order a sale is
// actually taken: who → the terms (defaulted from the customer, so they cost
// no clicks) → the lines → the money → everything else, folded away.
//
//   • The whole line lives in one row: item · qty + unit · rate · discount
//     (% or Rs) · tax code · net. The rest of the line — description, HS code,
//     price level, gross, tax amount and the tenant's line fields — opens under
//     the row instead of widening the grid past a laptop screen.
//   • Keyboard first: item → Enter → qty → Enter → next line. One empty line
//     always waits. A scanner types a code + Enter; a repeat scan adds one.
//   • Never a disabled save: it refuses and names what is missing, and a
//     server refusal (a closed period) is shown in the server's own words.
// ════════════════════════════════════════════════════════════════════════════

export type ComposerNoun = "order" | "estimate" | "invoice";

type Draft = {
  key: string;
  lineId?: string;
  itemId: string | null;
  qty: number;
  unit: string;
  rate: number;
  priceLevel?: string;
  discMode: "pct" | "amt";
  discountPct: number;
  discountAmt: number;
  tax: TaxCode;
  description: string;
  custom: Record<string, string>;
  delivered: number;
  invoiced: number;
  /** Set only in billing mode: what this order line allows on this invoice. */
  bill?: BillLine;
};

/** An order line offered to an invoice: what is delivered, billed, and billable now. */
export type BillLine = { line: OrderLine; qty: number; ready: number; all: number; delivered: number; billed: number };

let keySeq = 0;
const blank = (): Draft => ({ key: `k${++keySeq}`, itemId: null, qty: 1, unit: "", rate: 0, discMode: "pct", discountPct: 0, discountAmt: 0, tax: "VAT13", description: "", custom: {}, delivered: 0, invoiced: 0 });
const fromLine = (l: OrderLine, keepProgress: boolean): Draft => ({
  key: `k${++keySeq}`,
  lineId: keepProgress ? l.id : undefined,
  itemId: l.itemId,
  qty: l.qty,
  unit: l.unit ?? itemById(l.itemId)?.unit ?? "",
  rate: l.rate,
  priceLevel: l.priceLevel,
  discMode: l.discountAmt ? "amt" : "pct",
  discountPct: l.discountPct,
  discountAmt: l.discountAmt ?? 0,
  tax: l.tax,
  description: l.description ?? "",
  custom: { ...(l.custom ?? {}) },
  delivered: keepProgress ? l.delivered : 0,
  invoiced: keepProgress ? l.invoiced : 0,
});
const asMath = (l: Draft) => ({ qty: l.qty, rate: l.rate, discountPct: l.discMode === "pct" ? l.discountPct : 0, discountAmt: l.discMode === "amt" ? l.discountAmt : 0, tax: l.tax });

export type ComposerSeed = Partial<{
  subsidiaryId: string;
  customerId: string | null;
  billingAddress: string;
  date: string;
  expected: string | null;
  validTill: string | null;
  status: string;
  probability: number;
  locationId: string;
  repId: string | null;
  termId: string;
  due: string | null;
  customerPo: string | null;
  currency: string;
  exchangeRate: number;
  memo: string;
  dims: Order["dims"];
  custom: Record<string, string>;
  lines: OrderLine[];
  attachments: Attachment[];
  billDiscount: number;
  billOnNet: boolean;
  tdsCode: string | null;
  paidAtSave: ChildDoc["paidAtSave"] | null;
}>;

export type ComposerResult = {
  subsidiaryId: string;
  customerId: string;
  billingAddress: string;
  date: string;
  expected: string | null;
  validTill: string | null;
  status: string;
  probability: number;
  locationId: string;
  repId: string | null;
  termId: string;
  due: string | null;
  customerPo: string | null;
  currency: string;
  exchangeRate: number;
  memo: string;
  dims: Order["dims"];
  custom: Record<string, string>;
  lines: OrderLine[];
  attachments: Attachment[];
  notes: Comment[];
  billDiscount: number;
  billOnNet: boolean;
  tdsCode: string | null;
  paidAtSave: ChildDoc["paidAtSave"] | null;
  total: number;
};

export const ESTIMATE_STATUS_OPTIONS = ["In discussion", "Identified decision maker", "Proposal", "In negotiation", "Purchasing"];

export function OrderComposer({
  noun,
  title,
  seed = {},
  source,
  editing,
  lockCustomer,
  lockSubsidiary,
  billing,
  draft,
  primaryLabel,
  orders,
  onCancel,
  onSave,
}: {
  noun: ComposerNoun;
  title: string;
  seed?: ComposerSeed;
  source?: { no: string; label: string };
  editing?: { approved: boolean; baseTotal: number; hasProgress: boolean };
  lockCustomer?: boolean;
  lockSubsidiary?: boolean;
  /**
   * Billing mode — the invoice bills an ORDER. The lines come from the order
   * and stay locked to it (item, rate, discount and tax belong to the order);
   * only how much of each line is billed is set here, capped by what has been
   * delivered and not yet billed.
   */
  billing?: { orderNo: string; lines: BillLine[] };
  draft?: boolean;
  primaryLabel: string;
  orders: Order[];
  onCancel: (draftKept: boolean) => void;
  onSave: (r: ComposerResult) => void;
}) {
  const [subsidiaryId, setSubsidiaryId] = React.useState(seed.subsidiaryId ?? "NP-01");
  const [customerId, setCustomerId] = React.useState<string | null>(seed.customerId ?? null);
  /** Empty means "whatever the customer record says" — an override is only ever stored when it differs. */
  const [billTo, setBillTo] = React.useState(seed.billingAddress ?? "");
  const [date, setDate] = React.useState(seed.date ?? TODAY);
  const [locationId, setLocationId] = React.useState(seed.locationId ?? "L-KTM");
  const [expected, setExpected] = React.useState<string>(seed.expected ?? addDays(TODAY, 7));
  const [validTill, setValidTill] = React.useState<string>(seed.validTill ?? addDays(TODAY, 15));
  const [status, setStatus] = React.useState(seed.status ?? "In discussion");
  const [probability, setProbability] = React.useState(seed.probability ?? 50);
  const [termId, setTermId] = React.useState(seed.termId ?? "T30");
  const [due, setDue] = React.useState<string | null>(seed.due ?? null);
  const [dueTouched, setDueTouched] = React.useState(!!seed.due);
  const [repId, setRepId] = React.useState<string | null>(seed.repId ?? ME.id);
  const [customerPo, setCustomerPo] = React.useState(seed.customerPo ?? "");
  const [currency, setCurrency] = React.useState(seed.currency ?? "NPR");
  const [rate, setRate] = React.useState(seed.exchangeRate ?? 1);
  const [memo, setMemo] = React.useState(seed.memo ?? "");
  const [dims, setDims] = React.useState<Order["dims"]>(seed.dims ?? {});
  const [custom, setCustom] = React.useState<Record<string, string>>(seed.custom ?? { channel: "Field sales" });
  const [files, setFiles] = React.useState<Attachment[]>(seed.attachments ?? []);
  const [notes, setNotes] = React.useState<Comment[]>([]);
  const [lines, setLines] = React.useState<Draft[]>(() =>
    billing
      ? billing.lines.map((b) => ({ ...fromLine(b.line, true), qty: b.qty, bill: b }))
      : [...(seed.lines?.map((l) => fromLine(l, !!editing)) ?? []), blank()],
  );
  /** Billing mode: bill what is ordered, not only what has left the warehouse. */
  const [undelivered, setUndelivered] = React.useState(false);
  const capOf = (l: Draft) => (l.bill ? (undelivered ? l.bill.all : l.bill.ready) : Infinity);
  const [billDiscount, setBillDiscount] = React.useState(seed.billDiscount ?? 0);
  const [billOnNet, setBillOnNet] = React.useState(seed.billOnNet ?? false);
  const [tdsCode, setTdsCode] = React.useState<string | null>(seed.tdsCode ?? null);
  const [paidNow, setPaidNow] = React.useState(!!seed.paidAtSave);
  const [payMethod, setPayMethod] = React.useState(seed.paidAtSave?.methodId ?? "CASH");
  const [payFields, setPayFields] = React.useState<Record<string, string>>(seed.paidAtSave?.fields ?? {});
  const [payTo, setPayTo] = React.useState(seed.paidAtSave?.depositTo ?? DEPOSIT_LEDGERS[1]);
  const [payAmount, setPayAmount] = React.useState<number | null>(seed.paidAtSave?.amount ?? null);
  const [moreOpen, setMoreOpen] = React.useState(!!(seed.memo || Object.values(seed.dims ?? {}).some(Boolean)));
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);
  const [saved, setSaved] = React.useState<"idle" | "saving" | "saved">("idle");
  const [search, setSearch] = React.useState<null | "customer" | "item">(null);
  const [switchTo, setSwitchTo] = React.useState<string | null>(null);
  const [scan, setScan] = React.useState<string | null>(null);
  const dirty = React.useRef(false);

  const customer = customerById(customerId);
  const itemRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const qtyRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const customerRef = React.useRef<HTMLInputElement>(null);
  const moreRef = React.useRef<HTMLDivElement>(null);
  const touch = () => (dirty.current = true);

  React.useEffect(() => {
    if (!draft || !dirty.current) return;
    setSaved("saving");
    const id = window.setTimeout(() => setSaved("saved"), 700);
    return () => window.clearTimeout(id);
  }, [draft, customerId, lines, expected, termId, repId, customerPo, memo, dims, locationId, custom, billDiscount, tdsCode, paidNow]);

  const term = termById(termId);
  const autoDue = addDays(date, term?.days ?? 0);
  const dueShown = dueTouched && due ? due : autoDue;

  const pickCustomer = (c: Customer) => {
    touch();
    setCustomerId(c.id);
    setBillTo("");
    setTermId(c.termId);
    setCurrency(c.currency);
    setRate(CURRENCIES.find((x) => x.code === c.currency)?.rate ?? 1);
    if (c.repId) setRepId(c.repId);
    setLines((ls) => ls.map((l) => (l.itemId ? { ...l, tax: c.taxCode ?? itemById(l.itemId)!.tax } : l)));
    window.setTimeout(() => itemRefs.current[lines[0]?.key]?.focus(), 0);
  };

  const patch = (key: string, p: Partial<Draft>) => {
    touch();
    setLines((ls) => {
      const next = ls.map((l) => (l.key === key ? { ...l, ...p } : l));
      if (!billing && next[next.length - 1].itemId) next.push(blank());
      return next;
    });
  };
  const removeLine = (key: string) => {
    touch();
    setLines((ls) => {
      const next = ls.filter((l) => l.key !== key);
      return next.length && !next[next.length - 1].itemId ? next : [...next, blank()];
    });
  };
  const fillItem = (key: string, itemId: string) => {
    const it = itemById(itemId)!;
    const level = customer?.priceLevel && customer.priceLevel !== "Standard" ? customer.priceLevel : undefined;
    patch(key, { itemId, unit: it.unit, qty: 1, rate: levelRate(it.rate, level), priceLevel: level, tax: customer?.taxCode ?? it.tax, discountPct: 0, discountAmt: 0 });
  };
  const scanCode = (code: string) => {
    const it = ITEMS.find((i) => i.code.toLowerCase() === code.trim().toLowerCase());
    if (!it) return setRefusal(`No item has the barcode “${code}”.`);
    const existing = lines.find((l) => l.itemId === it.id);
    if (existing) patch(existing.key, { qty: existing.qty + 1 });
    else fillItem(lines[lines.length - 1].key, it.id);
  };

  const filled = lines.filter((l) => l.itemId);
  const totals = totalsOf(filled.map(asMath), { billDiscount: noun === "invoice" ? billDiscount : 0, onNet: billOnNet, tdsRate: noun === "invoice" ? tdsById(tdsCode)?.rate : 0 });
  const payNow = payAmount ?? totals.receivable;

  const missing: { label: string; focus: () => void }[] = [];
  if (!customer) missing.push({ label: "a customer", focus: () => customerRef.current?.focus() });
  if (filled.length === 0) missing.push({ label: "at least one line", focus: () => itemRefs.current[lines[0].key]?.focus() });
  filled.forEach((l, i) => {
    if (!(l.qty >= 0.00001)) missing.push({ label: `a quantity on line ${i + 1}`, focus: () => qtyRefs.current[l.key]?.focus() });
    if (!(l.rate > 0)) missing.push({ label: `a rate on line ${i + 1}`, focus: () => qtyRefs.current[l.key]?.focus() });
    if (!billing && l.qty < l.delivered) missing.push({ label: `line ${i + 1} can't go below the ${fmtQty(l.delivered)} delivered`, focus: () => qtyRefs.current[l.key]?.focus() });
  });
  HEADER_FIELDS.filter((f) => f.required && !custom[f.key]).forEach((f) => missing.push({ label: f.label.toLowerCase(), focus: () => (setMoreOpen(true), window.setTimeout(() => moreRef.current?.scrollIntoView({ block: "center" }), 0)) }));
  if (noun === "invoice" && paidNow) {
    methodById(payMethod).fields.filter((f) => f.required && !payFields[f.key]).forEach((f) => missing.push({ label: f.label.toLowerCase(), focus: () => {} }));
    if (payNow > totals.receivable + 0.005) missing.push({ label: "a payment no larger than the invoice", focus: () => {} });
  }

  const reapproval = !!editing && editing.approved && totals.total > editing.baseTotal + 0.005;

  const save = () => {
    setTried(true);
    if (missing.length) {
      setRefusal(`Add ${missing.map((m) => m.label).join(", ")}.`);
      missing[0].focus();
      return;
    }
    const over = filled.find((l) => l.qty > capOf(l) + 0.005);
    if (over) {
      const it = itemById(over.itemId!);
      qtyRefs.current[over.key]?.focus();
      return setRefusal(`Only ${fmtQty(capOf(over))} of ${it?.name} can be invoiced${undelivered ? "" : " — the rest isn't delivered yet"}.`);
    }
    // The server's own words for a posting date in a closed period.
    if (date < "2026-07-17") return setRefusal(`Asar 2083 is a closed period. Choose a date on or after 1 Shrawan 2083 (Jul 17, 2026).`);
    onSave({
      subsidiaryId,
      customerId: customer!.id,
      billingAddress: (billTo.trim() || customer!.address),
      date,
      expected: noun === "order" ? expected || null : noun === "estimate" ? expected || null : null,
      validTill: noun === "estimate" ? validTill || null : null,
      status,
      probability,
      locationId,
      repId,
      termId,
      due: noun === "estimate" ? null : dueShown,
      customerPo: customerPo.trim() || null,
      currency,
      exchangeRate: currency === "NPR" ? 1 : rate,
      memo,
      dims,
      custom,
      lines: filled.map((l, i) => ({
        id: l.lineId ?? `LN-N${Date.now()}-${i}`,
        itemId: l.itemId!,
        qty: l.qty,
        unit: l.unit,
        rate: l.rate,
        priceLevel: l.priceLevel,
        discountPct: l.discMode === "pct" ? l.discountPct : 0,
        discountAmt: l.discMode === "amt" && l.discountAmt ? l.discountAmt : undefined,
        tax: l.tax,
        description: l.description || undefined,
        custom: l.custom,
        delivered: l.delivered,
        invoiced: l.invoiced,
      })),
      attachments: files,
      notes,
      billDiscount: noun === "invoice" ? billDiscount : 0,
      billOnNet,
      tdsCode: noun === "invoice" ? tdsCode : null,
      paidAtSave: noun === "invoice" && paidNow ? { methodId: payMethod, fields: payFields, amount: payNow, depositTo: payTo } : null,
      total: totals.total,
    });
  };

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "Enter" || e.key.toLowerCase() === "s")) {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });

  const last = customer && noun === "order" && !editing && !source ? lastOrderFor(orders, customer.id) : undefined;
  const fieldCount = [memo && 1, Object.values(dims).filter(Boolean).length, Object.values(custom).filter(Boolean).length, files.length, notes.length].reduce<number>((s, x) => s + (Number(x) || 0), 0);
  const forLabel = noun === "estimate" ? "Estimate for" : noun === "invoice" ? "Bill to" : "Order for";

  return (
    <section className="flex h-full min-h-0 flex-col bg-bz-surface" aria-label="Composer">
      {/* ── Head ───────────────────────────────────────────────────────── */}
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-bz-line-soft px-5 py-2.5">
        <span className="text-[11px] font-semibold text-bz-text-soft">{title}</span>
        {source && <DocLink no={source.no} kind={source.label} />}
        {draft && saved !== "idle" && (
          <span className="inline-flex items-center gap-1 text-[11px] text-bz-text-soft">
            <CircleCheck size={11} className={saved === "saved" ? "text-bz-pos-deep" : "text-bz-text-soft"} />
            {saved === "saving" ? "Saving draft…" : "Draft saved"}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Select
            trigger="plain"
            value={subsidiaryId}
            disabled={lockSubsidiary}
            title={lockSubsidiary ? "Fixed once the document exists" : "Subsidiary"}
            onChange={(v) => (v !== subsidiaryId && filled.length ? setSwitchTo(v) : (touch(), setSubsidiaryId(v)))}
            width={260}
            options={SUBSIDIARIES.map((s) => ({ value: s.id, label: s.name, hint: `${s.id} · ${s.address}` }))}
          >
            <span className="inline-flex h-8 items-center gap-1.5 rounded-bz-md px-2 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm">
              <Building2 size={12} className="text-bz-text-muted" /> {subsidiaryById(subsidiaryId).name}
              {lockSubsidiary ? <Lock size={10} className="text-bz-text-soft" /> : <ChevronDown size={11} className="text-bz-text-soft" />}
            </span>
          </Select>
          <button type="button" className={ICON_BTN} onClick={() => onCancel(!!draft && dirty.current)} title="Close (Esc)">
            <X size={15} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className="mx-auto w-full max-w-[1080px] px-5 pb-10 pt-5">
          {/* ── 1 · Who ──────────────────────────────────────────────── */}
          {customer ? (
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className={cn(LABEL, "m-0 mb-1")}>{forLabel}</p>
                <div className="flex items-center gap-2">
                  <h2 className="m-0 truncate text-[20px] font-semibold tracking-tight text-bz-text">{customer.name}</h2>
                  {lockCustomer || editing?.hasProgress ? (
                    <span title="Fixed — something already points at this customer" className="text-bz-text-soft">
                      <Lock size={13} />
                    </span>
                  ) : (
                    <button type="button" className="text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={() => (touch(), setCustomerId(null))}>
                      Change
                    </button>
                  )}
                </div>
                <p className={cn("m-0 mt-0.5 text-[11.5px] text-bz-text-muted", NUM)}>
                  {customer.code} · PAN {customer.pan} ·{" "}
                  <AddressField label="Bill to" value={billTo || customer.address} fallback={customer.address} onChange={(v) => (touch(), setBillTo(v === customer.address ? "" : v))} /> · {customer.priceLevel} prices
                  {customer.taxCode && ` · ${TAX_LABEL[customer.taxCode]}`}
                  {openOrdersFor(orders, customer.id) > 0 && ` · ${openOrdersFor(orders, customer.id)} open order${openOrdersFor(orders, customer.id) === 1 ? "" : "s"}`}
                </p>
              </div>
              {last && (
                <button type="button" className={GHOST_SM} onClick={() => (touch(), setLines([...last.lines.map((l) => fromLine(l, false)), blank()]))} title={`Replaces the lines with ${last.no}'s`}>
                  <Repeat2 size={12} /> Repeat {last.no} · {fmtShort(last.date)}
                </button>
              )}
            </div>
          ) : (
            <CustomerPicker inputRef={customerRef} label={forLabel} orders={orders} onPick={pickCustomer} invalid={tried} onAdvanced={() => setSearch("customer")} />
          )}

          {/* ── 2 · Terms, as one line ───────────────────────────────── */}
          <ChipRow>
            <TermChip label="Date">
              <DateChip value={date} max={TODAY} onChange={(v) => (touch(), setDate(v))} />
            </TermChip>
            {noun === "estimate" && (
              <>
                <TermChip label="Valid till">
                  <DateChip value={validTill} min={date} onChange={(v) => (touch(), setValidTill(v))} />
                </TermChip>
                <Sep />
                <TermChip label="Status">
                  <Select trigger="plain" value={status} onChange={(v) => (touch(), setStatus(v))} width={230} options={ESTIMATE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}>
                    <ChipFace>{status}</ChipFace>
                  </Select>
                </TermChip>
                <TermChip label="Likely">
                  <input
                    inputMode="numeric"
                    value={probability}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => (touch(), setProbability(Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0)))}
                    className={cn("h-7 w-[46px] rounded-bz-sm border border-transparent bg-transparent px-1.5 text-right text-[12px] font-medium text-bz-text outline-none hover:bg-bz-paper-warm focus:border-bz-line focus:bg-bz-surface", NUM)}
                  />
                  <span className="text-bz-text-soft">%</span>
                </TermChip>
              </>
            )}
            <Sep />
            <TermChip label={noun === "order" ? "Deliver from" : "Location"}>
              <Select trigger="plain" value={locationId} onChange={(v) => (touch(), setLocationId(v))} width={220} options={LOCATIONS.map((l) => ({ value: l.id, label: l.name, hint: l.id === "L-KTM" ? "Default from Preferences" : undefined }))}>
                <ChipFace>{locationById(locationId)?.name}</ChipFace>
              </Select>
            </TermChip>
            {noun !== "invoice" && (
              <TermChip label={noun === "order" ? "by" : "Close by"}>
                <DateChip value={expected} min={date} onChange={(v) => (touch(), setExpected(v))} />
              </TermChip>
            )}
            <Sep />
            <TermChip label="Term">
              <Select trigger="plain" value={termId} onChange={(v) => (touch(), setTermId(v), setDueTouched(false))} width={200} options={TERMS.map((t) => ({ value: t.id, label: t.name, hint: t.id === customer?.termId ? "Customer's default" : undefined }))}>
                <ChipFace>{term?.name}</ChipFace>
              </Select>
            </TermChip>
            {noun !== "estimate" && (
              <TermChip label="due">
                <DateChip value={dueShown} min={date} onChange={(v) => (touch(), setDue(v), setDueTouched(true))} />
              </TermChip>
            )}
            <Sep />
            <TermChip label="Rep">
              <Select trigger="plain" value={repId} onChange={(v) => (touch(), setRepId(v))} width={240} options={PEOPLE.map((p) => ({ value: p.id, label: p.name, hint: p.team, person: p }))}>
                <ChipFace>
                  <Avatar person={repId ? personById(repId) : undefined} size={16} /> {repId ? personById(repId)?.name : "None"}
                </ChipFace>
              </Select>
            </TermChip>
            {noun === "order" && (
              <>
                <Sep />
                <TermChip label="Customer PO">
                  <input
                    value={customerPo}
                    onChange={(e) => (touch(), setCustomerPo(e.target.value))}
                    placeholder="none"
                    className={cn("h-7 w-[110px] rounded-bz-sm border border-transparent bg-transparent px-1.5 text-[12px] font-medium text-bz-text outline-none placeholder:font-normal placeholder:text-bz-text-soft hover:bg-bz-paper-warm focus:border-bz-line focus:bg-bz-surface", NUM)}
                  />
                </TermChip>
              </>
            )}
            <Sep />
            <TermChip label="Currency">
              <Select trigger="plain" value={currency} onChange={(v) => (touch(), setCurrency(v), setRate(CURRENCIES.find((c) => c.code === v)?.rate ?? 1))} width={220} options={CURRENCIES.map((c) => ({ value: c.code, label: c.code, hint: c.name }))}>
                <ChipFace>{currency}</ChipFace>
              </Select>
              {currency !== "NPR" && (
                <label className="inline-flex items-center gap-0.5 text-bz-text-soft">
                  @
                  <input
                    inputMode="decimal"
                    aria-label="Exchange rate"
                    value={rate}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => (touch(), setRate(Number(e.target.value.replace(/[^\d.]/g, "")) || 0))}
                    className={cn("h-7 w-[64px] rounded-bz-sm border border-transparent bg-transparent px-1.5 text-[12px] font-medium text-bz-text outline-none hover:bg-bz-paper-warm focus:border-bz-line focus:bg-bz-surface", NUM, tried && !(rate > 0) && "border-bz-red-mark")}
                  />
                </label>
              )}
            </TermChip>
          </ChipRow>

          {/* ── 3 · Lines ────────────────────────────────────────────── */}
          <div className="mt-5">
            <div className="hidden grid-cols-[24px_minmax(0,1fr)_132px_104px_92px_104px_112px_52px] items-center gap-2 px-2 pb-1.5 md:grid">
              <span className={LABEL}>#</span>
              <span className={LABEL}>Item</span>
              <span className={cn(LABEL, "text-right")}>Qty · Unit</span>
              <span className={cn(LABEL, "text-right")}>Rate</span>
              <span className={cn(LABEL, "text-right")}>Discount</span>
              <span className={LABEL}>Tax</span>
              <span className={cn(LABEL, "text-right")}>Net</span>
              <span />
            </div>
            <div className="overflow-visible rounded-bz-md border border-bz-line-soft">
              {lines.map((l, i) => (
                <LineRow
                  key={l.key}
                  n={i + 1}
                  line={l}
                  cap={capOf(l)}
                  isGhost={!l.itemId}
                  locationId={locationId}
                  itemRef={(el) => (itemRefs.current[l.key] = el)}
                  qtyRef={(el) => (qtyRefs.current[l.key] = el)}
                  flagged={tried}
                  onPatch={(p) => patch(l.key, p)}
                  onPickItem={(id) => (fillItem(l.key, id), window.setTimeout(() => qtyRefs.current[l.key]?.focus(), 0))}
                  onAdvanced={() => setSearch("item")}
                  onRemove={() => removeLine(l.key)}
                  onNext={() => {
                    const nextKey = lines[i + 1]?.key;
                    window.setTimeout(() => (nextKey ? itemRefs.current[nextKey] : itemRefs.current[lines[lines.length - 1].key])?.focus(), 0);
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
              {billing ? (
                <label className="inline-flex items-center gap-2 text-[11.5px] text-bz-text-muted" title="Bill quantities that have not been delivered yet">
                  <Switch
                    on={undelivered}
                    onChange={(v) => {
                      touch();
                      setUndelivered(v);
                      setLines((ls) => ls.map((l) => (l.bill ? { ...l, qty: v ? l.bill.all : l.bill.ready } : l)));
                    }}
                    label="Bill undelivered too"
                  />
                  Bill undelivered too
                  <span className="text-bz-text-soft">· {undelivered ? "ordered, not yet billed" : "delivered, not yet billed"}</span>
                </label>
              ) : scan === null ? (
                <button type="button" className={GHOST_SM} onClick={() => setScan("")}>
                  <ScanBarcode size={12} /> Scan
                </button>
              ) : (
                <label className="relative">
                  <ScanBarcode size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-soft" />
                  <input
                    autoFocus
                    value={scan}
                    onChange={(e) => setScan(e.target.value)}
                    onBlur={() => !scan && setScan(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && scan) (e.preventDefault(), scanCode(scan), setScan(""));
                      if (e.key === "Escape") setScan(null);
                    }}
                    placeholder="Scan or type a code — e.g. PVC-110"
                    className={cn(INPUT_SM, "w-[250px] pl-7")}
                  />
                </label>
              )}
              <span className="text-[10.5px] text-bz-text-soft">
                {billing ? <>Lines belong to <span className={NUM}>{billing.orderNo}</span> · <Kbd>⌘↵</Kbd> saves</> : <><Kbd>↵</Kbd> moves on · <Kbd>⌘↵</Kbd> saves</>}
              </span>
            </div>

            {/* ── 4 · Money ─────────────────────────────────────────── */}
            <div className={cn("mt-4 grid grid-cols-1 gap-4", noun === "invoice" && "md:grid-cols-[minmax(0,1fr)_340px]")}>
              {noun === "invoice" && (
                <div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper p-3.5">
                  <div className="flex items-center gap-2">
                    <h3 className="m-0 text-[12px] font-semibold text-bz-text">Payment</h3>
                    <div className="ml-auto">
                      <Segmented size="sm" value={paidNow ? "now" : "credit"} onChange={(v) => (touch(), setPaidNow(v === "now"))} options={[{ value: "credit", label: "On credit" }, { value: "now", label: "Paid now" }]} />
                    </div>
                  </div>
                  {!paidNow ? (
                    <p className="m-0 mt-2 text-[11.5px] text-bz-text-muted">
                      Due {fmtShort(dueShown)} · receive it later from the invoice.
                    </p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <MiniField label="Method">
                        <Select trigger="ghost" className="h-8 w-full justify-between" label={methodById(payMethod).name} value={payMethod} onChange={(v) => (touch(), setPayMethod(v), setPayFields({}))} width={220} options={PAYMENT_METHODS.map((m) => ({ value: m.id, label: m.name }))} />
                      </MiniField>
                      <MiniField label="Deposit to">
                        <Select trigger="ghost" className="h-8 w-full justify-between" label={payTo.split(" · ")[0]} value={payTo} onChange={(v) => (touch(), setPayTo(v))} width={260} options={DEPOSIT_LEDGERS.map((d) => ({ value: d, label: d }))} />
                      </MiniField>
                      {methodById(payMethod).fields.map((f) => (
                        <MiniField key={f.key} label={f.label} required={f.required}>
                          <CustomFieldInput def={f} compact value={payFields[f.key] ?? ""} invalid={tried && f.required && !payFields[f.key]} onChange={(v) => (touch(), setPayFields((s) => ({ ...s, [f.key]: v })))} />
                        </MiniField>
                      ))}
                      <MiniField label="Amount received">
                        <AmountInput value={Math.round(payNow * 100) / 100} onChange={(n) => (touch(), setPayAmount(n))} className="font-semibold" />
                      </MiniField>
                    </div>
                  )}
                </div>
              )}

              <dl className={cn("m-0 grid w-full grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-[12px]", noun !== "invoice" && "ml-auto max-w-[340px]")}>
                <dt className="text-bz-text-muted">Subtotal</dt>
                <dd className="m-0 text-right text-bz-text"><Amount value={totals.subtotal} /></dd>
                {totals.discount > 0 && (
                  <>
                    <dt className="text-bz-text-muted">Line discounts</dt>
                    <dd className="m-0 text-right text-bz-text">−<Amount value={totals.discount} /></dd>
                  </>
                )}
                {noun === "invoice" && (
                  <>
                    <dt className="flex items-center gap-1.5 text-bz-text-muted">
                      Bill discount
                      <Segmented size="sm" value={billOnNet ? "net" : "gross"} onChange={(v) => (touch(), setBillOnNet(v === "net"))} options={[{ value: "gross", label: BILL_DISCOUNT_BASES[0].replace("On ", "") }, { value: "net", label: BILL_DISCOUNT_BASES[1].replace("On ", "") }]} />
                    </dt>
                    <dd className="m-0 text-right">
                      <AmountInput ariaLabel="Bill discount" value={billDiscount} onChange={(n) => (touch(), setBillDiscount(n))} className="h-7 w-[104px]" />
                    </dd>
                  </>
                )}
                {totals.byTax.map((t) => (
                  <React.Fragment key={t.code}>
                    <dt className="text-bz-text-muted">
                      {t.label} <span className="text-bz-text-soft">on <Amount value={t.base} className="text-bz-text-soft" /></span>
                    </dt>
                    <dd className="m-0 text-right text-bz-text"><Amount value={t.tax} /></dd>
                  </React.Fragment>
                ))}
                <dt className="mt-1 border-t border-bz-line-soft pt-2 text-[12.5px] font-semibold text-bz-text">Total</dt>
                <dd className="m-0 mt-1 border-t border-bz-line-soft pt-2 text-right text-[14px] font-semibold text-bz-text">
                  <Amount value={totals.total} currency={currency} />
                </dd>
                {currency !== "NPR" && (
                  <dd className="col-span-2 m-0 text-right text-[10.5px] text-bz-text-soft">
                    ≈ <Amount value={totals.total * rate} currency="NPR" /> at {rate}
                  </dd>
                )}
                {noun === "invoice" && (
                  <>
                    <dt className="flex items-center gap-1.5 text-bz-text-muted">
                      TDS
                      <Select trigger="plain" value={tdsCode ?? "none"} onChange={(v) => (touch(), setTdsCode(v === "none" ? null : v))} width={220} options={[{ value: "none", label: "None" }, ...TDS_CODES.map((t) => ({ value: t.id, label: t.name }))]}>
                        <ChipFace>{tdsById(tdsCode)?.name ?? "None"}</ChipFace>
                      </Select>
                    </dt>
                    <dd className="m-0 text-right text-bz-text">{totals.tds ? <>−<Amount value={totals.tds} /></> : "—"}</dd>
                    {totals.tds > 0 && (
                      <>
                        <dt className="font-semibold text-bz-text">Receivable</dt>
                        <dd className="m-0 text-right font-semibold text-bz-text"><Amount value={totals.receivable} currency={currency} /></dd>
                      </>
                    )}
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* ── 5 · More ─────────────────────────────────────────────── */}
          <div ref={moreRef} className="mt-6 border-t border-bz-line-soft pt-3">
            <button type="button" onClick={() => setMoreOpen((v) => !v)} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-bz-text">
              {moreOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Memo, classification, custom fields, notes & files
              {!moreOpen && <span className="font-normal text-bz-text-soft">{fieldCount ? `${fieldCount} set` : "none set"}</span>}
            </button>
            {moreOpen && (
              <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <MiniField label="Memo">
                    <textarea value={memo} onChange={(e) => (touch(), setMemo(e.target.value))} placeholder="Printed on the document" className={cn(TEXTAREA, "min-h-[72px]")} />
                  </MiniField>
                  <div>
                    <p className={cn(LABEL, "m-0 mb-2")}>Custom fields</p>
                    <div className="grid grid-cols-2 gap-3">
                      {HEADER_FIELDS.map((f) => (
                        <MiniField key={f.key} label={f.label} required={f.required}>
                          <CustomFieldInput def={f} compact value={custom[f.key] ?? ""} invalid={tried && f.required && !custom[f.key]} onChange={(v) => (touch(), setCustom((s) => ({ ...s, [f.key]: v })))} />
                        </MiniField>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className={cn(LABEL, "m-0 mb-2")}>Classification</p>
                    <div className="grid grid-cols-2 gap-3">
                      {DIMENSIONS.map((d) => (
                        <MiniField key={d.key} label={d.label}>
                          <Select
                            trigger="ghost"
                            className="h-8 w-full justify-between"
                            label={dims[d.key] ?? <span className="font-normal text-bz-text-soft">None</span>}
                            value={dims[d.key] ?? null}
                            onChange={(v) => (touch(), setDims((s) => ({ ...s, [d.key]: v === "__none" ? undefined : v })))}
                            width={260}
                            options={[{ value: "__none", label: "None" }, ...d.options.map((o) => ({ value: o, label: o }))]}
                            footer={
                              <button type="button" className="flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12px] text-bz-text-muted hover:bg-bz-paper-warm">
                                <Plus size={12} /> New {d.label.toLowerCase()}
                              </button>
                            }
                          />
                        </MiniField>
                      ))}
                    </div>
                  </div>
                  <NotesEditor notes={notes} onChange={(n) => (touch(), setNotes(n))} />
                  <div>
                    <p className={cn(LABEL, "m-0 mb-2")}>Files</p>
                    {files.map((f) => (
                      <div key={f.name} className="flex items-center gap-2 rounded-bz-sm px-1 py-1 text-[12px]">
                        <Paperclip size={12} className="text-bz-text-soft" />
                        <span className="min-w-0 flex-1 truncate text-bz-text">{f.name}</span>
                        <span className="text-[10.5px] text-bz-text-soft">{f.size}</span>
                        <button type="button" className="text-bz-text-soft hover:text-bz-text" onClick={() => setFiles((fs) => fs.filter((x) => x.name !== f.name))} aria-label="Remove">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => (touch(), setFiles((fs) => [...fs, { name: `customer-po-${fs.length + 1}.pdf`, size: "164 KB", byId: ME.id, on: "Just now" }]))}
                      className="w-full rounded-bz-md border border-dashed border-bz-line px-3 py-2.5 text-[11.5px] text-bz-text-soft hover:border-bz-text-soft hover:text-bz-text-muted"
                    >
                      Drop files here, or browse
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dock ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
        {refusal && <Refusal text={refusal} onDismiss={() => setRefusal(null)} sticky className="mx-auto mb-2.5 max-w-[1080px]" />}
        <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-x-3 gap-y-2">
          <span className={cn("text-[12px] text-bz-text-muted", NUM)}>
            <span className="font-semibold text-bz-text">{filled.length}</span> line{filled.length === 1 ? "" : "s"} ·{" "}
            <span className="text-[13px] font-semibold text-bz-text">
              <Amount value={totals.total} currency={currency} />
            </span>
          </span>
          {missing.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
              <span className="size-1.5 rounded-bz-pill bg-bz-leaf-deep" /> Ready
            </span>
          ) : (
            <span className="inline-flex min-w-0 flex-wrap items-center gap-1.5 text-[11.5px] text-bz-text-soft">
              <CircleAlert size={12} /> Needs{" "}
              {missing.slice(0, 2).map((m, i) => (
                <button key={i} type="button" onClick={m.focus} className="font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text">
                  {m.label}
                </button>
              ))}
              {missing.length > 2 && <span>+{missing.length - 2}</span>}
            </span>
          )}
          {reapproval && <span className="text-[11.5px] font-medium text-bz-amber">Saving sends it back for approval</span>}
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className={GHOST} onClick={() => onCancel(!!draft && dirty.current)}>
              Cancel
            </button>
            <button type="button" className={BTN} onClick={save}>
              {primaryLabel} <Kbd>⌘↵</Kbd>
            </button>
          </div>
        </div>
      </div>

      <AdvancedSearch
        open={search !== null}
        kind={search ?? "customer"}
        onClose={() => setSearch(null)}
        onPick={(id) => {
          if (search === "customer") pickCustomer(customerById(id)!);
          else fillItem(lines[lines.length - 1].key, id);
        }}
      />
      <ConfirmDialog
        open={switchTo !== null}
        eyebrow="Subsidiary"
        title={`Switch to ${switchTo ? subsidiaryById(switchTo).name : ""}?`}
        body="Customers, items, locations and taxes are scoped to the subsidiary, so the lines are cleared."
        confirm="Switch and clear lines"
        onClose={() => setSwitchTo(null)}
        onConfirm={() => {
          touch();
          setSubsidiaryId(switchTo!);
          setLines([blank()]);
          setSwitchTo(null);
        }}
      />
    </section>
  );
}

function MiniField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11.5px] font-semibold text-bz-text">
        {label}
        {required && <span className="ml-0.5 text-bz-red">*</span>}
      </span>
      {children}
    </label>
  );
}

function NotesEditor({ notes, onChange }: { notes: Comment[]; onChange: (n: Comment[]) => void }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [direction, setDirection] = React.useState<"Inbound" | "Outbound">("Outbound");
  const [body, setBody] = React.useState("");
  return (
    <div>
      <p className={cn(LABEL, "m-0 mb-2")}>Notes</p>
      {notes.map((n) => (
        <div key={n.id} className="mb-1.5 flex items-start gap-2 rounded-bz-sm bg-bz-paper px-2 py-1.5 text-[11.5px]">
          <span className="min-w-0 flex-1">
            <span className="font-medium text-bz-text">{n.title || "Note"}</span> <span className="text-bz-text-soft">· {n.direction}</span>
            <span className="block text-bz-text-muted">{n.body}</span>
          </span>
          <button type="button" className="text-bz-text-soft hover:text-bz-text" onClick={() => onChange(notes.filter((x) => x.id !== n.id))} aria-label="Remove note">
            <Trash2 size={11} />
          </button>
        </div>
      ))}
      {open ? (
        <div className="flex flex-col gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={cn(INPUT_SM, "min-w-[140px] flex-1")} />
            <Segmented size="sm" value={direction} onChange={setDirection} options={[{ value: "Outbound", label: "Outbound" }, { value: "Inbound", label: "Inbound" }]} />
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What was said or agreed" className={cn(TEXTAREA, "min-h-[52px]")} />
          <div className="flex justify-end gap-2">
            <button type="button" className={GHOST_SM} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className={cn(BTN, "h-8")}
              onClick={() => {
                if (!body.trim()) return;
                onChange([...notes, { id: `n${Date.now()}`, authorId: ME.id, when: "Just now", title: title.trim() || undefined, direction, body: body.trim() }]);
                setTitle("");
                setBody("");
                setOpen(false);
              }}
            >
              Add note
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={GHOST_SM} onClick={() => setOpen(true)}>
          <MessageSquarePlus size={12} /> Add note
        </button>
      )}
    </div>
  );
}

// ── Customer picker — recent first, prospects included, two doors out ───────

function CustomerPicker({ orders, onPick, inputRef, invalid, label, onAdvanced }: { orders: Order[]; onPick: (c: Customer) => void; inputRef: React.RefObject<HTMLInputElement>; invalid: boolean; label: string; onAdvanced: () => void }) {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState("");
  const [pan, setPan] = React.useState("");

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const recentIds = Array.from(new Set([...orders].sort((a, b) => b.date.localeCompare(a.date)).map((o) => o.customerId))).slice(0, 4);
  const list = q ? CUSTOMERS.filter((c) => `${c.name} ${c.code} ${c.pan}`.toLowerCase().includes(q.toLowerCase())) : recentIds.map((id) => customerById(id)!).filter(Boolean);

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center">
        <p className={cn(LABEL, "m-0")}>{label}</p>
        <button type="button" onClick={onAdvanced} className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text">
          <Search size={10} /> Advanced search
        </button>
      </div>
      <label className="relative block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-soft" />
        <input
          ref={inputRef}
          value={q}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onChange={(e) => (setQ(e.target.value), setHi(0), setOpen(true))}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setHi((h) => Math.min(h + 1, list.length - 1)));
            if (e.key === "ArrowUp") (e.preventDefault(), setHi((h) => Math.max(h - 1, 0)));
            if (e.key === "Enter" && list[hi]) (e.preventDefault(), onPick(list[hi]));
          }}
          placeholder="Customer name, code or PAN"
          className={cn(INPUT, "h-11 pl-9 text-[15px]", invalid && "border-bz-red-mark")}
        />
      </label>
      {open && (
        <div className={cn(PANEL, "absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden p-1.5")}>
          {!q && <p className={cn(LABEL, "m-0 px-2 pb-1 pt-1")}>Recent</p>}
          {list.length === 0 && <p className="m-0 px-2 py-2 text-[12px] text-bz-text-soft">No customer matches “{q}”.</p>}
          {list.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHi(i)}
              onClick={() => onPick(c)}
              className={cn("flex w-full items-center gap-3 rounded-bz-sm px-2 py-2 text-left", i === hi ? "bg-bz-paper-warm" : "")}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-bz-text">{c.name}</span>
                <span className={cn("block truncate text-[11px] text-bz-text-muted", NUM)}>
                  {c.code} · {c.address}
                </span>
              </span>
              <span className="shrink-0 text-[11px] text-bz-text-soft">
                {termById(c.termId)?.name} · {c.currency}
              </span>
              {c.isProspect ? (
                <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted">Prospect</span>
              ) : (
                openOrdersFor(orders, c.id) > 0 && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{openOrdersFor(orders, c.id)} open</span>
              )}
            </button>
          ))}
          <div className="mt-1 border-t border-bz-line-soft pt-1">
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => (setName(q), setCreating(true))} className="flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12px] text-bz-text-muted hover:bg-bz-paper-warm">
              <Plus size={12} /> New customer{q && <> “{q}”</>}
            </button>
          </div>
        </div>
      )}
      <Dialog
        open={creating}
        eyebrow="Add new"
        title="New customer"
        onClose={() => setCreating(false)}
        foot={
          <>
            <button type="button" className={GHOST} onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button
              type="button"
              className={BTN}
              onClick={() => {
                if (!name.trim()) return;
                const c: Customer = { id: `C-N${CUSTOMERS.length + 1}`, code: `C-${1200 + CUSTOMERS.length}`, name: name.trim(), pan: pan || "—", address: "—", termId: "T15", currency: "NPR", priceLevel: "Standard" };
                CUSTOMERS.push(c);
                setCreating(false);
                onPick(c);
              }}
            >
              Create and use
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniField label="Name" required>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={INPUT_SM} />
          </MiniField>
          <MiniField label="PAN">
            <input value={pan} onChange={(e) => setPan(e.target.value)} className={cn(INPUT_SM, NUM)} />
          </MiniField>
        </div>
        <p className="m-0 mt-3 text-[11px] text-bz-text-soft">The rest is filled in on the customer record.</p>
      </Dialog>
    </div>
  );
}

// ── One line ────────────────────────────────────────────────────────────────

function LineRow({
  n,
  line,
  cap,
  isGhost,
  locationId,
  itemRef,
  qtyRef,
  flagged,
  onPatch,
  onPickItem,
  onAdvanced,
  onRemove,
  onNext,
}: {
  n: number;
  line: Draft;
  cap: number;
  isGhost: boolean;
  locationId: string;
  itemRef: (el: HTMLInputElement | null) => void;
  qtyRef: (el: HTMLInputElement | null) => void;
  flagged: boolean;
  onPatch: (p: Partial<Draft>) => void;
  onPickItem: (id: string) => void;
  onAdvanced: () => void;
  onRemove: () => void;
  onNext: () => void;
}) {
  const it = line.itemId ? itemById(line.itemId) : undefined;
  const bill = line.bill;
  const locked = !!bill || line.delivered > 0 || line.invoiced > 0;
  const over = !!bill && line.qty > cap + 0.005;
  const [expanded, setExpanded] = React.useState(false);
  const cell = "h-8 w-full rounded-bz-sm border border-transparent bg-transparent px-2 text-[12.5px] text-bz-text outline-none transition-colors hover:border-bz-line-soft focus:border-bz-text-muted focus:bg-bz-surface";
  const math = asMath(line);
  const factor = it ? unitsOf(it).find((u) => u.code === line.unit)?.factor ?? 1 : 1;
  const onHand = it ? it.onHand[locationId] : undefined;
  const short = it && onHand !== undefined && Object.keys(it.onHand).length > 0 && (line.qty - line.delivered) * factor > onHand;
  const hasExtra = !!(line.description || line.priceLevel || Object.values(line.custom).some(Boolean));

  return (
    <div className={cn("group border-b border-bz-line-soft last:border-0", isGhost ? "bg-bz-paper" : "bg-bz-surface")}>
      <div className="grid grid-cols-[24px_minmax(0,1fr)] items-center gap-2 px-2 py-1.5 md:grid-cols-[24px_minmax(0,1fr)_132px_104px_92px_104px_112px_52px]">
        <span className={cn("text-center text-[11px] text-bz-text-soft", NUM)}>{isGhost ? <Plus size={12} className="mx-auto" /> : n}</span>

        <ItemPicker value={it} inputRef={itemRef} locationId={locationId} placeholder={isGhost ? "Add an item — name or code" : "Item"} disabled={locked} onPick={(i) => onPickItem(i.id)} onAdvanced={onAdvanced} />

        {!isGhost && it && (
          <>
            <span className="col-span-2 grid grid-cols-[1.2fr_1fr_0.9fr_1fr] gap-2 pl-[32px] md:contents">
              <span className="flex items-center">
                <input
                  ref={qtyRef}
                  inputMode="decimal"
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label={`Quantity, line ${n}`}
                  value={line.qty || ""}
                  onChange={(e) => onPatch({ qty: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onNext())}
                  className={cn(cell, "min-w-0 flex-1 text-right", NUM, (over || (flagged && (!(line.qty >= 0.00001) || (!bill && line.qty < line.delivered)))) && "border-bz-red-mark")}
                />
                <Select
                  trigger="plain"
                  value={line.unit}
                  onChange={(u) => {
                    const f = unitsOf(it).find((x) => x.code === u)?.factor ?? 1;
                    onPatch({ unit: u, rate: Math.round(levelRate(it.rate, line.priceLevel) * f * 100) / 100 });
                  }}
                  width={170}
                  options={unitsOf(it).map((u) => ({ value: u.code, label: u.code, hint: u.factor === 1 ? "Base unit" : u.factor > 1 ? `${u.factor} ${it.unit}` : `1/${Math.round(1 / u.factor)} ${it.unit}` }))}
                >
                  <span className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-bz-sm px-1 text-[11px] text-bz-text-muted hover:bg-bz-paper-warm">
                    {line.unit}
                    {unitsOf(it).length > 1 && <ChevronDown size={10} className="text-bz-text-soft" />}
                  </span>
                </Select>
              </span>
              {bill ? (
                <span className={cn("flex h-8 items-center justify-end px-2 text-[12.5px] text-bz-text", NUM)} title="The order's rate">
                  <Amount value={line.rate} />
                </span>
              ) : (
              <input
                inputMode="decimal"
                onFocus={(e) => e.currentTarget.select()}
                aria-label={`Rate, line ${n}`}
                value={line.rate || ""}
                title={line.priceLevel ? `${line.priceLevel} price — typing a rate clears it` : undefined}
                onChange={(e) => onPatch({ rate: Number(e.target.value.replace(/[^\d.]/g, "")) || 0, priceLevel: undefined })}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onNext())}
                className={cn(cell, "text-right", NUM, flagged && !(line.rate > 0) && "border-bz-red-mark")}
              />
              )}
              {bill ? (
                <span className={cn("flex h-8 items-center justify-end px-2 text-[12px] text-bz-text-muted", NUM)}>
                  {lineDiscount(math) ? <Amount value={lineDiscount(math)} /> : "—"}
                </span>
              ) : (
              <span className="flex items-center">
                <input
                  inputMode="decimal"
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label={`Discount, line ${n}`}
                  value={(line.discMode === "pct" ? line.discountPct : line.discountAmt) || ""}
                  placeholder="—"
                  onChange={(e) => {
                    const v = Number(e.target.value.replace(/[^\d.]/g, "")) || 0;
                    // % and Rs clear each other; a discount at or above the gross resets.
                    if (line.discMode === "pct") onPatch({ discountPct: Math.min(100, v), discountAmt: 0 });
                    else onPatch({ discountAmt: v >= line.qty * line.rate ? 0 : v, discountPct: 0 });
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onNext())}
                  className={cn(cell, "min-w-0 flex-1 px-1.5 text-right placeholder:text-bz-text-soft", NUM)}
                />
                <button
                  type="button"
                  onClick={() => onPatch({ discMode: line.discMode === "pct" ? "amt" : "pct", discountPct: 0, discountAmt: 0 })}
                  className="h-8 shrink-0 rounded-bz-sm px-1 text-[11px] text-bz-text-muted hover:bg-bz-paper-warm"
                  title="Switch between % and Rs"
                >
                  {line.discMode === "pct" ? "%" : "Rs"}
                </button>
              </span>
              )}
              {bill ? (
                <span className="flex h-8 items-center px-2 text-[12px] text-bz-text-muted">{TAX_LABEL[line.tax]}</span>
              ) : (
              <Select trigger="plain" value={line.tax} onChange={(v) => onPatch({ tax: v as TaxCode })} width={200} options={TAX_CODES.map((t) => ({ value: t.id, label: t.label }))} footer={<button type="button" className="flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12px] text-bz-text-muted hover:bg-bz-paper-warm"><Plus size={12} /> New tax code</button>}>
                <span className="inline-flex h-8 w-full items-center justify-between gap-1 rounded-bz-sm px-2 text-[12px] text-bz-text hover:bg-bz-paper-warm">
                  <span className="truncate">{TAX_LABEL[line.tax]}</span> <ChevronDown size={11} className="shrink-0 text-bz-text-soft" />
                </span>
              </Select>
              )}
            </span>
            <span className="hidden text-right text-[12.5px] font-semibold text-bz-text md:block">
              <Amount value={lineNet(math)} />
            </span>
            <span className="hidden items-center justify-end gap-0.5 md:flex">
              <button type="button" onClick={() => setExpanded((v) => !v)} className={cn("flex size-6 items-center justify-center rounded-bz-sm hover:bg-bz-paper-warm hover:text-bz-text", hasExtra || expanded ? "text-bz-text-muted" : "text-bz-text-soft opacity-0 group-hover:opacity-100")} title="Line details">
                <ChevronDown size={12} className={cn("transition-transform", expanded && "rotate-180")} />
              </button>
              {locked ? (
                <span className="flex size-6 items-center justify-center text-bz-text-soft" title={bill ? "The order owns this line — set how much of it is billed" : `${fmtQty(line.delivered)} delivered — this line can't be removed`}>
                  <Lock size={11} />
                </span>
              ) : (
                <button type="button" onClick={onRemove} className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-soft opacity-0 hover:bg-bz-paper-warm hover:text-bz-text group-hover:opacity-100" title="Remove line">
                  <X size={12} />
                </button>
              )}
            </span>
          </>
        )}
      </div>
      {!isGhost && it && (short || locked || line.priceLevel || line.discMode === "amt") && !expanded && (
        <p className={cn("m-0 px-2 pb-1.5 pl-[42px] text-[10.5px]", over ? "text-bz-red" : "text-bz-text-soft", NUM)}>
          {[
            bill && `${fmtQty(bill.delivered)} delivered · ${fmtQty(bill.billed)} billed · ${fmtQty(cap)} can be billed now`,
            !bill && locked && `${fmtQty(line.delivered)} delivered · ${fmtQty(line.invoiced)} invoiced`,
            line.priceLevel && `${line.priceLevel} price`,
            short && <span key="s" className="text-bz-amber">{fmtQty(onHand ?? 0)} {it.unit} on hand at {locationById(locationId)?.name}</span>,
          ]
            .filter(Boolean)
            .map((x, i) => (
              <React.Fragment key={i}>
                {i > 0 && " · "}
                {x}
              </React.Fragment>
            ))}
        </p>
      )}
      {expanded && !isGhost && it && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-dashed border-bz-line-soft bg-bz-paper px-3 py-3 pl-[42px] md:grid-cols-6">
          <label className="col-span-2 flex flex-col gap-1 md:col-span-3">
            <span className={LABEL}>Description</span>
            <input value={line.description} onChange={(e) => onPatch({ description: e.target.value })} placeholder={`${it.name} — printed on the document`} className={cn(INPUT_SM)} />
          </label>
          <div className="flex flex-col gap-1">
            <span className={LABEL}>HS code</span>
            <span className={cn("h-8 leading-8 text-[12px] text-bz-text-muted", NUM)}>{it.hs}</span>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <span className={LABEL}>Price level</span>
            <Select
              trigger="ghost"
              className="h-8 w-full justify-between"
              label={line.priceLevel ?? <span className="font-normal text-bz-text-soft">Custom rate</span>}
              value={line.priceLevel ?? null}
              onChange={(v) => onPatch({ priceLevel: v, rate: Math.round(levelRate(it.rate, v) * factor * 100) / 100 })}
              width={220}
              options={PRICE_LEVELS.map((p) => ({ value: p.id, label: p.id, meta: <Amount value={levelRate(it.rate, p.id) * factor} className="text-bz-text-soft" /> }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Gross</span>
            <span className="h-8 leading-8 text-[12px] text-bz-text"><Amount value={lineGross(math)} /></span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Discount</span>
            <span className="h-8 leading-8 text-[12px] text-bz-text">{lineDiscount(math) ? <Amount value={lineDiscount(math)} /> : "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={LABEL}>{TAX_LABEL[line.tax]}</span>
            <span className="h-8 leading-8 text-[12px] text-bz-text"><Amount value={lineTax(math)} /></span>
          </div>
          {LINE_FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className={LABEL}>{f.label}</span>
              <CustomFieldInput def={f} compact value={line.custom[f.key] ?? ""} onChange={(v) => onPatch({ custom: { ...line.custom, [f.key]: v } })} />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemPicker({
  value,
  inputRef,
  locationId,
  placeholder,
  disabled,
  onPick,
  onAdvanced,
}: {
  value: ReturnType<typeof itemById>;
  inputRef: (el: HTMLInputElement | null) => void;
  locationId: string;
  placeholder: string;
  disabled?: boolean;
  onPick: (i: NonNullable<ReturnType<typeof itemById>>) => void;
  onAdvanced: () => void;
}) {
  const [q, setQ] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  const el = React.useRef<HTMLInputElement | null>(null);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const shown = focus ? (q ? ITEMS.filter((i) => `${i.name} ${i.code} ${i.hs}`.toLowerCase().includes(q.toLowerCase())) : ITEMS).slice(0, 7) : [];

  React.useLayoutEffect(() => {
    if (focus && el.current) setRect(el.current.getBoundingClientRect());
  }, [focus, q]);

  const pick = (i: NonNullable<ReturnType<typeof itemById>>) => {
    onPick(i);
    setQ("");
    setFocus(false);
  };

  return (
    <>
      <input
        ref={(node) => {
          el.current = node;
          inputRef(node);
        }}
        disabled={disabled}
        title={disabled ? "Delivered or invoiced — the item can't change" : value ? `${value.name} · ${value.code}` : undefined}
        value={focus ? q : value ? value.name : ""}
        placeholder={focus && value ? value.name : placeholder}
        onFocus={() => (setFocus(true), setHi(0))}
        onBlur={() => window.setTimeout(() => (setFocus(false), setQ("")), 150)}
        onChange={(e) => (setQ(e.target.value), setHi(0))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") (e.preventDefault(), setHi((h) => Math.min(h + 1, shown.length - 1)));
          if (e.key === "ArrowUp") (e.preventDefault(), setHi((h) => Math.max(h - 1, 0)));
          if (e.key === "Enter" && shown[hi]) (e.preventDefault(), pick(shown[hi]));
          if (e.key === "Escape") e.currentTarget.blur();
        }}
        className="h-8 w-full min-w-0 truncate rounded-bz-sm border border-transparent bg-transparent px-2 text-[12.5px] text-bz-text outline-none transition-colors placeholder:text-bz-text-soft hover:border-bz-line-soft focus:border-bz-text-muted focus:bg-bz-surface disabled:cursor-not-allowed disabled:text-bz-text-muted"
      />
      {focus && rect && (
        <Portal>
          <div className={cn(PANEL, "fixed z-[1071] p-1.5")} style={{ top: Math.min(rect.bottom + 4, window.innerHeight - 380), left: rect.left, width: Math.max(rect.width, 440) }}>
            {shown.length === 0 && <p className="m-0 px-2 py-2 text-[12px] text-bz-text-soft">No item matches “{q}”.</p>}
            {shown.map((i, idx) => {
              const stock = Object.keys(i.onHand).length > 0;
              const oh = i.onHand[locationId] ?? 0;
              return (
                <button
                  key={i.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHi(idx)}
                  onClick={() => pick(i)}
                  className={cn("flex w-full items-center gap-3 rounded-bz-sm px-2 py-1.5 text-left", idx === hi && "bg-bz-paper-warm")}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-bz-text">{i.name}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {i.code} · HS {i.hs} · {i.unit}
                      {i.lotTracked && " · lot-tracked"}
                      {i.serialTracked && " · serials"}
                    </span>
                  </span>
                  <span className={cn("shrink-0 text-right text-[11px]", NUM)}>
                    <Amount value={i.rate} className="text-bz-text" />
                    <span className={cn("block text-[10.5px]", !stock ? "text-bz-text-soft" : oh === 0 ? "font-semibold text-bz-red" : "text-bz-text-muted")}>
                      {stock ? `${fmtQty(oh)} at ${locationById(locationId)?.name}` : "service"}
                    </span>
                  </span>
                </button>
              );
            })}
            <div className="mt-1 flex items-center border-t border-bz-line-soft px-1 pt-1">
              <button type="button" onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 rounded-bz-sm px-2 py-1.5 text-[12px] text-bz-text-muted hover:bg-bz-paper-warm">
                <Plus size={12} /> New item
              </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => (setFocus(false), onAdvanced())} className="ml-auto flex items-center gap-1.5 rounded-bz-sm px-2 py-1.5 text-[12px] text-bz-text-muted hover:bg-bz-paper-warm">
                <Search size={11} /> Advanced search
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
