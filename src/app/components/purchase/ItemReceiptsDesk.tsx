import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Ban, Boxes, CircleCheck, FileText, ListTree, PackageCheck, Pencil, Printer, ReceiptText, ShieldCheck, Trash2, Truck, Undo2, Warehouse } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, CARD, Chip, DocLink, GHOST_SM, Kbd, LABEL, MenuItem, MenuSep, NUM, Tone } from "../sales/bzw";
import { Amount, LOCATIONS, ME, OrderLine, TODAY, customerById, daysBetween, fmtQty, fmtShort, itemById, lineGross, locationById, personById, totalsOf, useKeys } from "../sales/orders";
import { SUBSIDIARIES, subsidiaryById } from "../sales/master";
import { Cell, NoteFoot, WorkflowActions, useLifecycle } from "../sales/parts";
import { ActivityList, Block, DetailsBlock, LinesTable, MoneyList, RecordSections, RecordShell, StepCard, totalsRows } from "../sales/record";
import { DateCell, DocDesk, ExpandLines, PanelCtx } from "../sales/DocDesk";
import { useSales } from "../sales/flow";
import {
  ItemReceipt,
  ReceiptSource,
  VENDORS,
  addReceipt,
  approveReceipt,
  attachReceipt,
  cancelReceipt,
  deleteReceipt,
  noteReceipt,
  poById,
  purchaseOrdersStore,
  receiptStatus,
  receivableFrom,
  receiveStage,
  rejectReceipt,
  replaceReceipt,
  returnsAwaitingGoods,
  useReceipts,
  usePurchaseOrders,
  vendorById,
} from "./receipts";
import { ReceiveSheet } from "./ReceiveSheet";

// ════════════════════════════════════════════════════════════════════════════
// PURCHASING · ITEM RECEIPTS
//
// The one desk in this mockup for the purchase side, because it is the hinge
// the sales flow now leans on: a sales return credits the customer, and the
// GOODS come back here. A receipt is never blank — it is always received
// against a purchase order or a return, so "Receive items" asks which, then
// opens the same sheet.
//
// What the app's receipt screen cannot show today, and this does:
//   • ordered · already in · receiving now, per line, capped at what is left
//     (the live screen shows one pre-netted quantity and caps nothing);
//   • batch and expiry in the line instead of behind a dialog, with an expired
//     batch refused by name;
//   • the two statuses kept apart — RECEIVING (which lives on the order) and
//     BILLING (FORM_STATUS: Open · Partly billed · Billed), which is the
//     receipt's own and is about Enter Bill, not about goods.
// ════════════════════════════════════════════════════════════════════════════

const BASE = "/design/purchase/item-receipts";

export function PurchaseNav({ current }: { current: string }) {
  const tabs = [
    { key: "item-receipts", label: "Item receipts", href: BASE },
    { key: "orders", label: "Purchase orders", href: "" },
    { key: "bills", label: "Bills", href: "" },
  ];
  return (
    <nav className="-mb-px ml-2 flex h-full min-w-0 items-stretch gap-0.5 overflow-x-auto [scrollbar-width:none]" aria-label="Purchasing">
      {tabs.map((t) =>
        t.href ? (
          <Link
            key={t.key}
            to={t.href}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 px-2.5 text-[12.5px] transition-colors",
              t.key === current ? "font-semibold text-bz-text after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:rounded-bz-pill after:bg-bz-fire after:content-['']" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {t.label}
          </Link>
        ) : (
          <span key={t.key} className="inline-flex shrink-0 items-center px-2.5 text-[12.5px] text-bz-text-soft" title="Not part of this mockup">
            {t.label}
          </span>
        ),
      )}
    </nav>
  );
}

const partyOf = (r: ItemReceipt) => (r.source.kind === "purchase" ? vendorById(r.partyId)?.name : customerById(r.partyId)?.name) ?? "—";
const sourceLabel = (s: ReceiptSource) => (s.kind === "purchase" ? "Purchase order" : "Sales return");
const receiptTotals = (r: ItemReceipt) => totalsOf(r.lines.map((l) => ({ qty: l.qty, rate: l.rate, discountPct: l.discountPct, tax: l.tax })));
const units = (r: ItemReceipt) => r.lines.reduce((s, l) => s + l.qty, 0);

/** DR the item's asset account; CR what the goods are owed against — the receipt is the ONLY stock posting in the flow. */
function glReceipt(r: ItemReceipt) {
  if (r.state !== "approved" || r.cancelled) return [];
  const goods = r.lines.reduce((s, l) => s + lineGross({ qty: l.qty, rate: l.rate, discountPct: l.discountPct }) * r.exchangeRate, 0);
  const rows = [{ account: "Inventory · item asset account", debit: goods, credit: 0 }];
  if (r.transportAmount > 0 && r.costAllocation !== "None") rows.push({ account: `Inventory · freight ${r.costAllocation.toLowerCase()}`, debit: r.transportAmount, credit: 0 });
  if (r.source.kind === "purchase") {
    rows.push({ account: "Accrued purchase", debit: 0, credit: goods });
    if (r.transportAmount > 0 && r.costAllocation !== "None") rows.push({ account: "Freight & duty payable", debit: 0, credit: r.transportAmount });
  } else {
    rows.push({ account: "Customer return variance", debit: 0, credit: goods });
  }
  return rows;
}

export function ItemReceiptsDesk() {
  const receipts = useReceipts();
  const orders = usePurchaseOrders();
  const { credits } = useSales();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const rows = React.useMemo(() => [...receipts].sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no)), [receipts]);

  const live = (r: ItemReceipt) => !r.cancelled;
  const pending = (r: ItemReceipt) => live(r) && r.state === "pending" && !r.rejected;
  const pendingMine = (r: ItemReceipt) => pending(r) && r.approverId === ME.id;
  const toBill = (r: ItemReceipt) => live(r) && r.state === "approved" && r.billing !== "Billed" && r.source.kind === "purchase";
  const waiting = returnsAwaitingGoods(credits);

  const openPos = orders.filter((p) => !p.closed && receivableFrom({ kind: "purchase", no: p.no }).some((l) => l.left > 0));

  const seedFor = (source: ReceiptSource) => {
    if (source.kind === "purchase") {
      const po = poById(source.no)!;
      return { party: { id: po.vendorId, name: vendorById(po.vendorId)!.name }, defaults: { subsidiaryId: po.subsidiaryId, locationId: po.locationId, currency: po.currency, exchangeRate: po.exchangeRate, custom: po.custom } };
    }
    const c = credits.find((x) => x.no === source.no)!;
    return { party: { id: c.customerId, name: customerById(c.customerId)!.name }, defaults: { subsidiaryId: c.subsidiaryId, locationId: c.locationId, currency: "NPR", exchangeRate: 1, custom: c.custom } };
  };

  const compose = (ctx: PanelCtx) => {
    const po = search.get("po");
    const ret = search.get("return");
    const source: ReceiptSource | null = po ? { kind: "purchase", no: po } : ret ? { kind: "return", no: ret } : null;
    if (!source) return <SourcePicker ctx={ctx} pos={openPos.map((p) => ({ no: p.no, party: vendorById(p.vendorId)!.name, date: p.date, left: receivableFrom({ kind: "purchase", no: p.no }) }))} returns={waiting.map((c) => ({ no: c.no, party: customerById(c.customerId)!.name, date: c.date, left: receivableFrom({ kind: "return", no: c.no }), invoiceNo: c.invoiceNo }))} />;
    const { party, defaults } = seedFor(source);
    return (
      <RecordShell ctx={{ ...ctx, full: true }} no="New receipt" title={`Receive against ${source.no}`} meta={[<span key="p">{party.name}</span>, <span key="k">{sourceLabel(source)}</span>]} back={{ label: "Item receipts", onClick: () => ctx.go(null) }}>
        <div className="flex h-full min-h-0 flex-col">
          <ReceiveSheet
            source={source}
            party={party}
            defaults={defaults}
            onCancel={() => ctx.go(null)}
            onCommit={(p) => {
              const no = addReceipt({ ...p, source, partyId: party.id, state: "pending", approverId: ME.id, cancelled: null, billing: "Open", vendorBillNo: null, byId: ME.id, attachments: [], lines: p.lines.map((l, i) => ({ ...l, id: `IRL-${Date.now()}-${i}` })) });
              ctx.go(no);
              ctx.show("success", `${no} raised · waiting on approval before the stock counts`);
            }}
          />
        </div>
      </RecordShell>
    );
  };

  return (
    <DocDesk<ItemReceipt>
      module="Purchasing"
      section="purchase/item-receipts"
      nav={<PurchaseNav current="item-receipts" />}
      noun={["receipt", "receipts"]}
      partyLabel="Vendor or customer"
      searchPlaceholder="Receipt, order, vendor or item"
      rows={rows}
      noOf={(r) => r.no}
      dateOf={(r) => r.date}
      searchText={(r) => `${r.no} ${r.source.no} ${partyOf(r)} ${r.truckNo} ${r.vendorRef} ${r.vendorBillNo ?? ""} ${r.lines.map((l) => itemById(l.itemId)?.name).join(" ")}`}
      stats={[
        { label: "Received · 30 days", value: rows.filter((r) => live(r) && r.state === "approved" && daysBetween(r.date, TODAY) <= 30).length },
        { label: "Returns awaiting goods", value: waiting.length, title: "Approved sales returns whose stock has not come back yet" },
      ]}
      picks={[
        { key: "mine", label: "Needs you", value: rows.filter(pendingMine).length, test: pendingMine },
        { key: "bill", label: "To bill", value: rows.filter(toBill).length, test: toBill, title: "Received, not yet billed by the vendor" },
        { key: "ret", label: "From returns", value: rows.filter((r) => r.source.kind === "return").length, test: (r) => r.source.kind === "return" },
      ]}
      views={[
        {
          key: "state",
          label: "By state",
          icon: ListTree,
          groups: (rs) => [
            { key: "mine", label: "Needs your approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: rs.filter(pendingMine) },
            { key: "pending", label: "Waiting for approval", rows: rs.filter((r) => pending(r) && !pendingMine(r)) },
            { key: "rejected", label: "Sent back", rows: rs.filter((r) => live(r) && !!r.rejected) },
            { key: "week", label: "Received this week", rows: rs.filter((r) => live(r) && r.state === "approved" && daysBetween(r.date, TODAY) <= 7) },
            { key: "earlier", label: "Earlier", collapsed: true, rows: rs.filter((r) => live(r) && r.state === "approved" && daysBetween(r.date, TODAY) > 7) },
            { key: "cancelled", label: "Cancelled", collapsed: true, rows: rs.filter((r) => !live(r)) },
          ],
        },
        {
          key: "source",
          label: "By source",
          icon: FileText,
          groups: (rs) => [
            { key: "po", label: "Against purchase orders", rows: rs.filter((r) => r.source.kind === "purchase") },
            { key: "ret", label: "Against sales returns", rows: rs.filter((r) => r.source.kind === "return"), empty: "No goods have come back on a return yet." },
          ],
        },
        { key: "where", label: "By warehouse", icon: Warehouse, groups: (rs) => LOCATIONS.map((l) => ({ key: l.id, label: l.name, rows: rs.filter((r) => r.locationId === l.id) })) },
      ]}
      filters={[
        ...SUBSIDIARIES.map((s) => ({ value: `sub:${s.id}`, label: s.name, group: "Subsidiary", test: (r: ItemReceipt) => r.subsidiaryId === s.id })),
        ...LOCATIONS.map((l) => ({ value: `loc:${l.id}`, label: l.name, group: "Received into", test: (r: ItemReceipt) => r.locationId === l.id })),
        { value: "st:pending", label: "Awaiting approval", group: "Status", test: pending },
        { value: "st:approved", label: "Received", group: "Status", test: (r: ItemReceipt) => live(r) && r.state === "approved" },
        { value: "st:rejected", label: "Sent back", group: "Status", test: (r: ItemReceipt) => !!r.rejected },
        { value: "st:cancelled", label: "Cancelled", group: "Status", test: (r: ItemReceipt) => !live(r) },
        { value: "bi:open", label: "Not billed", group: "Billing", test: (r: ItemReceipt) => r.billing === "Open" },
        { value: "bi:part", label: "Partly billed", group: "Billing", test: (r: ItemReceipt) => r.billing === "Partly billed" },
        { value: "bi:done", label: "Billed", group: "Billing", test: (r: ItemReceipt) => r.billing === "Billed" },
        { value: "src:po", label: "Purchase order", group: "Source", test: (r: ItemReceipt) => r.source.kind === "purchase" },
        { value: "src:ret", label: "Sales return", group: "Source", test: (r: ItemReceipt) => r.source.kind === "return" },
        ...VENDORS.map((v) => ({ value: `v:${v.id}`, label: v.name, hint: v.code, group: "Vendor", test: (r: ItemReceipt) => r.partyId === v.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (r) => r.date + r.no, desc: true },
        { key: "old", label: "Oldest", by: (r) => r.date + r.no },
        { key: "val", label: "Value", by: (r) => receiptTotals(r).total * r.exchangeRate, desc: true },
        { key: "party", label: "Party", by: partyOf },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (r) => <DateCell iso={r.date} /> },
        { key: "src", label: "Against", width: "104px", render: (r) => <span className={cn("inline-flex items-center gap-1", NUM)}>{r.source.kind === "return" ? <Undo2 size={10} className="text-bz-text-soft" /> : null}{r.source.no}</span> },
        { key: "into", label: "Into", width: "100px", render: (r) => locationById(r.locationId)?.name },
        { key: "bill", label: "Billing", width: "86px", render: (r) => (r.source.kind === "return" ? <span className="text-bz-text-soft">—</span> : <span className={r.billing === "Billed" ? "text-bz-text-muted" : "text-bz-text"}>{r.billing}</span>) },
        { key: "state", label: "Status", width: "118px", render: (r) => { const s = receiptStatus(r); return <Chip tone={s.tone as Tone}>{s.label}</Chip>; } },
      ]}
      primary={(r) => ({ title: partyOf(r), sub: <>{fmtQty(units(r))} units · {subsidiaryById(r.subsidiaryId).name}</>, subOnDesktop: true })}
      amount={(r) => ({ value: <Amount value={receiptTotals(r).total} currency={r.currency !== "NPR" ? r.currency : undefined} />, sub: `${r.lines.length} line${r.lines.length === 1 ? "" : "s"}` })}
      rowVerb={(r) => (pendingMine(r) ? { label: "Approve", icon: PackageCheck, run: () => approveReceipt(r.no) } : toBill(r) ? { label: "Bill", icon: ReceiptText, run: () => navigate(`${BASE}/${r.no}`) } : null)}
      renderExpand={(r) => (
        <ExpandLines
          rows={r.lines.map((l) => {
            const b = r.batches.filter((x) => x.lineId === l.refLineId).map((x) => x.batch);
            const s = r.serials.filter((x) => x.lineId === l.refLineId).flatMap((x) => x.serials);
            return { name: itemById(l.itemId)!.name, note: b.length ? `Batch ${b.join(", ")}` : s.length ? `${s.length} serials` : undefined, qty: `${fmtQty(l.qty)} ${l.unit}`, amount: <Amount value={lineGross({ qty: l.qty, rate: l.rate, discountPct: l.discountPct })} /> };
          })}
        />
      )}
      bulk={[
        {
          label: "Approve",
          icon: PackageCheck,
          enabled: (rs) => rs.some(pendingMine),
          run: (rs) => {
            const skipped: string[] = [];
            let done = 0;
            rs.forEach((r) => (pendingMine(r) ? (approveReceipt(r.no), done++) : skipped.push(`${r.no} isn't waiting on you`)));
            return { done, skipped, verb: "approved" };
          },
        },
        { label: "Print GRN", icon: Printer, enabled: () => true, run: (rs) => ({ done: rs.length, skipped: [], verb: "sent to the printer" }) },
      ]}
      onDelete={(rs) => {
        const skipped: string[] = [];
        let done = 0;
        rs.forEach((r) => (r.state === "approved" && !r.cancelled ? skipped.push(`${r.no} has taken stock in — cancel it instead`) : (deleteReceipt(r.no), done++)));
        return { done, skipped };
      }}
      newLabel="Receive items"
      onNew={() => navigate(`${BASE}/new`)}
      renderNew={compose}
      renderPanel={(r, ctx) => <ReceiptPanel key={r.no} r={r} ctx={ctx} />}
    />
  );
}

/** "Receive items" asks WHAT is arriving before it asks what is in the box. */
function SourcePicker({
  ctx,
  pos,
  returns,
}: {
  ctx: PanelCtx;
  pos: { no: string; party: string; date: string; left: ReturnType<typeof receivableFrom> }[];
  returns: { no: string; party: string; date: string; invoiceNo: string; left: ReturnType<typeof receivableFrom> }[];
}) {
  const navigate = useNavigate();
  const Row = ({ no, party, date, left, kind, sub }: { no: string; party: string; date: string; left: ReturnType<typeof receivableFrom>; kind: "po" | "return"; sub: string }) => {
    const units = left.reduce((s, l) => s + l.left, 0);
    return (
      <button
        type="button"
        onClick={() => navigate(`${BASE}/new?${kind === "po" ? "po" : "return"}=${no}`)}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-bz-line-soft px-3.5 py-2.5 text-left last:border-0 hover:bg-bz-paper-warm"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className={cn("text-[12.5px] font-semibold text-bz-text", NUM)}>{no}</span>
            <span className="truncate text-[12.5px] text-bz-text-muted">{party}</span>
          </span>
          <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
            {fmtShort(date)} · {sub}
          </span>
        </span>
        <span className={cn("whitespace-nowrap text-right text-[11.5px] text-bz-text-muted", NUM)}>{fmtQty(units)} units to receive</span>
      </button>
    );
  };
  return (
    <RecordShell ctx={{ ...ctx, full: true }} no="New receipt" title="What is arriving?" back={{ label: "Item receipts", onClick: () => ctx.go(null) }}>
      <div className="mx-auto w-full max-w-[860px] px-5 py-5">
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex items-center gap-2 border-b border-bz-line-soft bg-bz-paper-warm/60 px-3.5 py-2">
            <Truck size={12} className="text-bz-text-muted" />
            <h3 className="m-0 text-[12.5px] font-semibold text-bz-text">Purchase orders waiting on goods</h3>
            <span className={cn("ml-auto text-[11px] text-bz-text-soft", NUM)}>{pos.length}</span>
          </div>
          {pos.length === 0 ? <p className="m-0 px-3.5 py-3 text-[11.5px] text-bz-text-soft">Every order has been received.</p> : pos.map((p) => <Row key={p.no} {...p} kind="po" sub={`${p.left.filter((l) => l.left > 0).length} line(s) outstanding`} />)}
        </section>

        <section className={cn(CARD, "mt-4 overflow-hidden")}>
          <div className="flex items-center gap-2 border-b border-bz-line-soft bg-bz-paper-warm/60 px-3.5 py-2">
            <Undo2 size={12} className="text-bz-text-muted" />
            <h3 className="m-0 text-[12.5px] font-semibold text-bz-text">Sales returns waiting on goods</h3>
            <span className={cn("ml-auto text-[11px] text-bz-text-soft", NUM)}>{returns.length}</span>
          </div>
          {returns.length === 0 ? (
            <p className="m-0 px-3.5 py-3 text-[11.5px] text-bz-text-soft">Nothing is coming back.</p>
          ) : (
            returns.map((r) => <Row key={r.no} {...r} kind="return" sub={`credited on ${r.invoiceNo}`} />)
          )}
        </section>
      </div>
    </RecordShell>
  );
}

function ReceiptPanel({ r, ctx }: { r: ItemReceipt; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const life = useLifecycle(r.no);
  const status = receiptStatus(r);
  const party = partyOf(r);
  const mine = r.state === "pending" && !r.rejected && !r.cancelled && r.approverId === ME.id;
  const counted = r.state === "approved" && !r.cancelled;
  const canEdit = !r.cancelled && r.billing === "Open";
  const t = receiptTotals(r);
  const seedParty = { id: r.partyId, name: party };

  useKeys({ e: () => ctx.mode !== "edit" && canEdit && ctx.go(r.no, { do: "edit" }) });

  if (ctx.mode === "edit")
    return (
      <RecordShell ctx={ctx} no={r.no} back={{ label: r.no, onClick: () => ctx.go(r.no) }} title={`Edit ${r.no}`} meta={[<span key="p">{party}</span>, <span key="s">{r.source.no}</span>]}>
        <div className="flex h-full min-h-0 flex-col">
          <ReceiveSheet
            source={r.source}
            party={seedParty}
            existing={r}
            defaults={{ subsidiaryId: r.subsidiaryId, locationId: r.locationId, currency: r.currency, exchangeRate: r.exchangeRate, custom: r.custom }}
            onCancel={() => ctx.go(r.no)}
            onCommit={(p) => {
              replaceReceipt(r.no, { ...p, lines: p.lines.map((l, i) => ({ ...l, id: `IRL-${Date.now()}-${i}` })) });
              ctx.go(r.no);
              ctx.show("success", `${r.no} saved`);
            }}
          />
        </div>
      </RecordShell>
    );

  let step: React.ReactNode;
  if (r.cancelled) step = <StepCard tone="quiet" icon={<Ban size={15} />} title={`Cancelled · ${fmtShort(r.cancelled.on)}`} sub={`“${r.cancelled.reason}” · the stock and its postings were reversed.`} />;
  else if (r.rejected)
    step = (
      <StepCard
        tone="danger"
        icon={<Ban size={15} />}
        title={`Sent back by ${personById(r.rejected.byId)?.name}`}
        sub={<span className="text-bz-text">“{r.rejected.reason}”</span>}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => ctx.go(r.no, { do: "edit" })}>
            <Pencil size={12} /> Revise and resubmit
          </button>
        }
      />
    );
  else if (r.state === "pending")
    step = (
      <StepCard
        icon={<ShieldCheck size={15} />}
        tone={mine ? "plain" : "quiet"}
        title={mine ? "Waiting on your approval" : <span className="inline-flex items-center gap-1.5">Waiting on <Avatar person={personById(r.approverId ?? "")} size={16} /> {personById(r.approverId ?? "")?.name}</span>}
        sub={`Stock lands in ${locationById(r.locationId)?.name} when it is approved.`}
        actions={mine && <WorkflowActions no={r.no} stateName="Dispatch approval" onApprove={() => (approveReceipt(r.no), ctx.show("success", `${r.no} approved · stock taken in`))} onReject={(x) => (rejectReceipt(r.no, x), ctx.show("info", `${r.no} sent back`))} />}
      />
    );
  else if (r.source.kind === "return")
    step = <StepCard tone="done" icon={<CircleCheck size={15} />} title={`Back in stock at ${locationById(r.locationId)?.name}`} sub={<>Credited on {r.source.no}.</>} />;
  else if (r.billing !== "Billed")
    step = (
      <StepCard
        icon={<ReceiptText size={15} />}
        title={r.billing === "Open" ? "Received, not yet billed" : "Partly billed"}
        sub={<>The vendor's bill lands against this receipt{r.vendorBillNo ? ` · ${r.vendorBillNo}` : ""}.</>}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => ctx.show("info", `Opens Enter Bill against ${r.no} — the purchase module's own screen`)}>
            <ReceiptText size={13} /> Enter bill
          </button>
        }
      />
    );
  else step = <StepCard tone="done" icon={<CircleCheck size={15} />} title={`Billed · ${r.vendorBillNo ?? ""}`}  />;

  const lines: { line: OrderLine; qty: number; sub?: React.ReactNode; detail?: React.ReactNode }[] = r.lines.map((l) => {
    const b = r.batches.filter((x) => x.lineId === l.refLineId);
    const serialsOf = (batch?: string) => r.serials.find((x) => x.lineId === l.refLineId && x.batch === batch)?.serials ?? [];
    const loose = serialsOf(undefined);
    return {
      line: { id: l.id, itemId: l.itemId, qty: l.qty, rate: l.rate, discountPct: l.discountPct, tax: l.tax, unit: l.unit, delivered: 0, invoiced: 0, custom: l.custom, description: l.description },
      qty: l.qty,
      sub: locationById(l.locationId)?.name,
      detail:
        b.length || loose.length ? (
          <div className={cn("flex flex-wrap gap-1.5 text-[10.5px] text-bz-text-muted", NUM)}>
            {b.map((y) => {
              const sn = serialsOf(y.batch);
              return (
                <span key={y.batch} className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-px" title={sn.length ? sn.join(", ") : undefined}>
                  {y.batch} · {fmtQty(y.qty)}
                  {y.expiry && <span className="text-bz-text-soft"> · exp {fmtShort(y.expiry)}</span>}
                  {sn.length > 0 && (
                    <span className="text-bz-text-soft">
                      {" "}· S/N {sn[0]}
                      {sn.length > 1 && ` – ${sn[sn.length - 1]}`}
                    </span>
                  )}
                </span>
              );
            })}
            {loose.length > 0 && (
              <span className="rounded-bz-sm bg-bz-paper-warm px-1.5 py-px" title={loose.join(", ")}>
                S/N {loose[0]}
                {loose.length > 1 && ` – ${loose[loose.length - 1]}`} · {loose.length}
              </span>
            )}
          </div>
        ) : undefined,
    };
  });

  return (
    <RecordShell
      ctx={ctx}
      no={r.no}
      chips={
        <>
          <Chip tone={status.tone as Tone}>{status.label}</Chip>
          {counted && r.source.kind === "purchase" && <Chip tone={r.billing === "Billed" ? "positive" : "partial"} dot={false} className="hidden sm:inline-flex">{r.billing}</Chip>}
        </>
      }
      title={party}
      amount={<Amount value={t.total} currency={r.currency} />}
      meta={[
        <span key="d" className={NUM}>{fmtShort(r.date)}</span>,
        <span key="l">into {locationById(r.locationId)?.name}</span>,
        <span key="s">{subsidiaryById(r.subsidiaryId).name}</span>,
        <DocLink key="src" no={r.source.no} kind={sourceLabel(r.source)} onClick={() => (r.source.kind === "return" ? navigate(`/design/sales/returns/${r.source.no}`) : ctx.show("info", `${r.source.no} opens in Purchase orders`))} />,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} kbd="E" disabled={!canEdit} hint={!canEdit && !r.cancelled ? "Already billed" : undefined} onClick={() => (close(), ctx.go(r.no, { do: "edit" }))}>
            Edit receipt
          </MenuItem>
          <MenuItem icon={ReceiptText} disabled={!(counted && r.source.kind === "purchase" && r.billing !== "Billed")} onClick={() => (close(), ctx.show("info", `Opens Enter Bill against ${r.no}`))}>
            Enter bill
          </MenuItem>
          <MenuItem icon={Boxes} disabled={r.source.kind !== "purchase"} onClick={() => (close(), navigate(`${BASE}/new?po=${r.source.no}`))}>
            Receive more from {r.source.no}
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Ban} disabled={!!r.cancelled || r.billing !== "Open"} hint={r.billing !== "Open" && !r.cancelled ? "Cancel its bill first" : undefined} onClick={() => (close(), life.open("cancel"))}>
            Cancel receipt…
          </MenuItem>
          <MenuItem icon={Trash2} danger disabled={counted} hint={counted ? "Stock has come in — cancel it instead" : undefined} onClick={() => (close(), life.open("delete"))}>
            Delete receipt…
          </MenuItem>
        </>
      )}
      foot={<NoteFoot onSend={(n) => noteReceipt(r.no, n)} />}
    >
      {step}

      <Block title="Lines" count={r.lines.length}>
        <LinesTable qtyLabel="Received" rows={lines} />
        <MoneyList
          rows={[
            ...totalsRows(t, { currency: r.currency, exchangeRate: r.exchangeRate, totalLabel: "Goods value" }),
            ...(r.transportAmount ? [{ label: `Freight · ${r.costAllocation.toLowerCase()}`, value: <Amount value={r.transportAmount} /> }, { label: "Landed value", value: <Amount value={t.total + r.transportAmount} currency={r.currency} />, strong: true }] : []),
          ]}
        />
      </Block>

      <DetailsBlock
        subsidiaryId={r.subsidiaryId}
        currency={r.currency}
        exchangeRate={r.exchangeRate}
        dates={[["Receipt date", r.date], ...(r.ppDate ? ([["PP date", r.ppDate]] as [string, string][]) : [])]}
        custom={r.custom}
        dims={r.dims}
        memo={r.memo}
        right={
          canEdit && (
            <button type="button" className={GHOST_SM} onClick={() => ctx.go(r.no, { do: "edit" })}>
              <Pencil size={11} /> Edit <Kbd>E</Kbd>
            </button>
          )
        }
        lead={
          <>
            <Cell label={r.source.kind === "purchase" ? "Vendor" : "Returned by"}>
              {party}
              <span className="block text-[10.5px] text-bz-text-soft">{r.source.kind === "purchase" ? vendorById(r.partyId)?.contact : customerById(r.partyId)?.address}</span>
            </Cell>
            <Cell label="Received against">
              <span className={NUM}>{r.source.no}</span>
              <span className="block text-[10.5px] text-bz-text-soft">{sourceLabel(r.source)}</span>
            </Cell>
            <Cell label="Received into">{locationById(r.locationId)?.name}</Cell>
            <Cell label="Received by">
              <span className="inline-flex items-center gap-1.5">
                <Avatar person={personById(r.byId)} size={18} /> {personById(r.byId)?.name}
              </span>
            </Cell>
            {(r.transporter || r.truckNo || r.driver) && (
              <Cell label="Transport" wide>
                {[r.transporter, r.truckNo, r.driver].filter(Boolean).join(" · ")}
                {r.transportAmount > 0 && <span className="block text-[10.5px] text-bz-text-soft">Freight <Amount value={r.transportAmount} /> · allocated {r.costAllocation.toLowerCase()}</span>}
              </Cell>
            )}
            {r.vendorRef && <Cell label="Supplier's note">{r.vendorRef}</Cell>}
            {r.vendorBillNo && <Cell label="Vendor bill">{r.vendorBillNo}</Cell>}
            {(r.ppNumber || r.lc || r.ciNumber) && (
              <Cell label="Import papers" wide>
                {[r.ppNumber && `PP ${r.ppNumber}`, r.lc && `LC ${r.lc}`, r.ciNumber && `CI ${r.ciNumber}`].filter(Boolean).join(" · ")}
              </Cell>
            )}
          </>
        }
      />

      <RecordSections
        no={r.no}
        files={r.attachments}
        onAttach={() => (attachReceipt(r.no), ctx.show("success", "File added"))}
        onToast={(x) => ctx.show("info", x)}
        created={r.created}
        history={r.history}
        audit={r.audit}
        gl={glReceipt(r)}
      />
      <ActivityList comments={r.comments} history={r.history} />

      {life.dialogs({
        cancelBody: counted ? `The ${fmtQty(units(r))} units leave ${locationById(r.locationId)?.name} again and the asset posting is reversed.` : "It never took stock in, so nothing is reversed.",
        onCancel: (x) => (cancelReceipt(r.no, x), ctx.show("info", `${r.no} cancelled`)),
        onDelete: () => (deleteReceipt(r.no), ctx.go(null), ctx.show("info", `${r.no} deleted`)),
      })}
    </RecordShell>
  );
}

export { purchaseOrdersStore, receiveStage, LABEL };
