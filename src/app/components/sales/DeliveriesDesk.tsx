import * as React from "react";
import { useNavigate } from "react-router";
import { CalendarClock, CircleCheck, ListTree, PackageCheck, ReceiptText, ShieldCheck, Truck } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, Chip, DocLink, GHOST_SM, Kbd, MenuItem, NUM } from "./bzw";
import { Amount, ME, TODAY, daysBetween, fmtQty, fmtShort, itemById, locationById, personById, readyToInvoice } from "./orders";
import { Block, Cell, DocRow } from "./OrderPanel";
import { DocDesk, PanelCtx } from "./DocDesk";
import { ActivityList, LinesTable, RecordShell, StepCard } from "./record";
import { DocRef, approveChildDoc, docLines, docValue, hrefFor, invoiceViews, useSales } from "./flow";
import { unitsLabel, pendingOn } from "./FulfilSheet";

// ════════════════════════════════════════════════════════════════════════════
// DELIVERIES — what left, or is waiting to leave, the warehouse
//
// A delivery is created from its order (the order's Deliver step), so this
// desk has no composer of its own: "New delivery" goes to the orders that are
// waiting to ship. What happens HERE is approval — the moment stock actually
// moves and the order counts the units — and the hand-off to invoicing.
//
// No dispatch status is drawn: CHALLAN stores the driver and the truck, not
// whether it has left the gate.
// ════════════════════════════════════════════════════════════════════════════

export function DeliveriesDesk() {
  const { deliveries, orders, receipts, credits } = useSales();
  const navigate = useNavigate();
  const rows = React.useMemo(() => [...deliveries].sort((a, b) => b.doc.date.localeCompare(a.doc.date)), [deliveries]);
  const pendingMine = (r: DocRef) => r.doc.state === "pending" && r.doc.approverId === ME.id;
  const units = (r: DocRef) => unitsLabel(docLines(r).map((x) => ({ unit: itemById(x.line.itemId)!.unit, qty: x.qty })));

  return (
    <DocDesk<DocRef>
      section="deliveries"
      rows={rows}
      noOf={(r) => r.doc.no}
      customerOf={(r) => r.order.customerId}
      searchText={(r) => `${r.doc.no} ${r.order.no} ${r.customer.name} ${r.doc.truck ?? ""} ${r.doc.driver ?? ""}`}
      stats={[{ label: "This week", value: rows.filter((r) => r.doc.state === "approved" && daysBetween(r.doc.date, TODAY) <= 7).length, title: "Approved deliveries in the last 7 days" }]}
      picks={[
        { key: "mine", label: "Needs you", value: rows.filter(pendingMine).length, test: pendingMine },
        { key: "pending", label: "Awaiting approval", value: rows.filter((r) => r.doc.state === "pending").length, test: (r) => r.doc.state === "pending" },
      ]}
      views={[
        {
          key: "state",
          label: "By state",
          icon: ListTree,
          groups: (rs) => [
            { key: "mine", label: "Needs your approval", icon: <ShieldCheck size={12} className="text-bz-text-muted" />, rows: rs.filter(pendingMine) },
            { key: "pending", label: "Awaiting approval", rows: rs.filter((r) => r.doc.state === "pending" && !pendingMine(r)) },
            { key: "week", label: "Delivered this week", rows: rs.filter((r) => r.doc.state === "approved" && daysBetween(r.doc.date, TODAY) <= 7) },
            { key: "earlier", label: "Earlier", collapsed: true, rows: rs.filter((r) => r.doc.state === "approved" && daysBetween(r.doc.date, TODAY) > 7) },
          ],
        },
        {
          key: "where",
          label: "By warehouse",
          icon: CalendarClock,
          groups: (rs) =>
            Array.from(new Set(rs.map((r) => r.doc.locationId ?? r.order.locationId))).map((id) => ({
              key: id,
              label: locationById(id)?.name ?? id,
              rows: rs.filter((r) => (r.doc.locationId ?? r.order.locationId) === id),
            })),
        },
      ]}
      columns={[
        { key: "order", label: "Order", width: "84px", render: (r) => <span className={NUM}>{r.order.no}</span> },
        { key: "from", label: "From", width: "116px", render: (r) => locationById(r.doc.locationId ?? r.order.locationId)?.name },
        { key: "date", label: "Date", width: "72px", render: (r) => <span className={NUM}>{fmtShort(r.doc.date)}</span> },
        { key: "state", label: "Status", width: "132px", render: (r) => (r.doc.state === "pending" ? <Chip tone="pending">Awaiting approval</Chip> : <Chip tone="positive">Approved</Chip>) },
      ]}
      primary={(r) => ({ title: r.customer.name, sub: units(r), subOnDesktop: true })}
      amount={(r) => ({ value: <Amount value={docValue(r)} />, sub: `${r.doc.lines.length} line${r.doc.lines.length === 1 ? "" : "s"}` })}
      rowVerb={(r) =>
        pendingMine(r)
          ? { label: "Approve", icon: ShieldCheck, run: () => approveChildDoc(r.order.no, r.doc.no) }
          : r.doc.state === "approved" && r.order.lines.some((l) => readyToInvoice(l) - pendingOn(r.order, l, "invoice") > 0)
            ? { label: "Invoice", icon: ReceiptText, run: () => navigate(`/design/sales/orders/${r.order.no}?do=invoice`) }
            : null
      }
      newLabel="Deliver an order"
      onNew={() => navigate("/design/sales/orders?pick=deliver")}
      renderPanel={(r, ctx) => <DeliveryPanel key={r.doc.no} r={r} ctx={ctx} invoiceStages={invoiceViews(orders, receipts, credits)} />}
    />
  );
}

function DeliveryPanel({ r, ctx, invoiceStages }: { r: DocRef; ctx: PanelCtx; invoiceStages: ReturnType<typeof invoiceViews> }) {
  const navigate = useNavigate();
  const lines = docLines(r);
  const loc = locationById(r.doc.locationId ?? r.order.locationId)?.name;
  const invoices = r.order.docs.filter((d) => d.kind === "invoice");
  const billable = r.order.lines.some((l) => readyToInvoice(l) - pendingOn(r.order, l, "invoice") > 0);
  const mine = r.doc.state === "pending" && r.doc.approverId === ME.id;

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && ["INPUT", "TEXTAREA"].includes(el.tagName)) return;
      if (e.key.toLowerCase() === "a" && mine) (approveChildDoc(r.order.no, r.doc.no), ctx.show("success", `${r.doc.no} approved · stock moved`));
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [mine, r.doc.no, r.order.no, ctx]);

  return (
    <RecordShell
      ctx={ctx}
      no={r.doc.no}
      chips={r.doc.state === "pending" ? <Chip tone="pending">Awaiting approval</Chip> : <Chip tone="positive">Approved</Chip>}
      title={r.customer.name}
      amount={<span className="text-[13px] font-medium text-bz-text-muted">{unitsLabel(lines.map((x) => ({ unit: itemById(x.line.itemId)!.unit, qty: x.qty })))}</span>}
      meta={[
        <span key="d" className={NUM}>{fmtShort(r.doc.date)}</span>,
        <span key="l">from {loc}</span>,
        <DocLink key="o" no={r.order.no} kind="Order" onClick={() => navigate(hrefFor(r.order.no))} />,
      ]}
      onPrint={() => ctx.show("info", `Preparing delivery note ${r.doc.no}…`)}
      menu={(close) => (
        <>
          <MenuItem icon={ReceiptText} disabled={!billable || r.doc.state !== "approved"} onClick={() => (close(), navigate(`/design/sales/orders/${r.order.no}?do=invoice`))}>
            Invoice the order
          </MenuItem>
          <MenuItem icon={Truck} onClick={() => (close(), ctx.show("info", `Preparing delivery note ${r.doc.no}…`))}>
            Print delivery note
          </MenuItem>
        </>
      )}
    >
      {r.doc.state === "pending" ? (
        <StepCard
          icon={<ShieldCheck size={15} />}
          title={mine ? "Waiting on your approval" : <span className="inline-flex items-center gap-1.5">Waiting on <Avatar person={personById(r.doc.approverId ?? "")} size={16} /> {personById(r.doc.approverId ?? "")?.name}</span>}
          sub={`Stock leaves ${loc} and counts on ${r.order.no} when it is approved.`}
          tone={mine ? "plain" : "quiet"}
          actions={
            mine && (
              <button type="button" className={cn(BTN, "h-8")} onClick={() => (approveChildDoc(r.order.no, r.doc.no), ctx.show("success", `${r.doc.no} approved · stock moved`))}>
                <PackageCheck size={13} /> Approve <Kbd>A</Kbd>
              </button>
            )
          }
        />
      ) : billable ? (
        <StepCard
          icon={<ReceiptText size={15} />}
          title="Ready to invoice"
          sub={`Invoiced against ${r.order.no}'s lines, so the order and this delivery stay in step.`}
          actions={
            <button type="button" className={cn(BTN, "h-8")} onClick={() => navigate(`/design/sales/orders/${r.order.no}?do=invoice`)}>
              <ReceiptText size={13} /> Invoice
            </button>
          }
        />
      ) : (
        <StepCard icon={<CircleCheck size={15} />} tone="done" title="Delivered and invoiced" sub={`Everything delivered on ${r.order.no} is billed.`} />
      )}

      <Block title="Lines" count={lines.length}>
        <LinesTable
          qtyLabel="Delivered"
          rows={lines.map((x) => ({ line: x.line, qty: x.qty, sub: `${fmtQty(x.line.qty)} ordered` }))}
        />
      </Block>

      <Block title="Transport">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-line-soft sm:grid-cols-2">
          <Cell label="From">{loc}</Cell>
          <Cell label="Date"><span className={NUM}>{fmtShort(r.doc.date)}</span></Cell>
          <Cell label="Driver">{r.doc.driver ?? <span className="text-bz-text-soft">—</span>}</Cell>
          <Cell label="Truck no.">{r.doc.truck ? <span className={NUM}>{r.doc.truck}</span> : <span className="text-bz-text-soft">—</span>}</Cell>
          <Cell label="Deliver to" wide>
            {r.customer.name}
            <span className="block text-[10.5px] text-bz-text-soft">{r.customer.address}</span>
          </Cell>
        </div>
      </Block>

      <Block title="Documents" count={1 + invoices.length}>
        <div className="flex flex-col gap-1.5">
          <DocRow icon={ReceiptText} no={r.order.no} kind="Order" meta={<span className={NUM}>{fmtShort(r.order.date)}</span>} chip={<Chip tone="neutral" dot={false}>Source</Chip>} onClick={() => navigate(hrefFor(r.order.no))} />
          {invoices.map((d) => {
            const v = invoiceStages.find((x) => x.doc.no === d.no);
            return (
              <DocRow
                key={d.no}
                icon={ReceiptText}
                no={d.no}
                kind="Invoice"
                meta={<>on the order · {fmtShort(d.date)}</>}
                chip={d.state === "pending" ? <Chip tone="pending">Awaiting approval</Chip> : <Chip tone={v && v.balance <= 0.005 ? "positive" : "neutral"}>{v && v.balance <= 0.005 ? "Paid" : "Not paid"}</Chip>}
                onClick={() => navigate(hrefFor(d.no))}
              />
            );
          })}
        </div>
      </Block>

      <ActivityList comments={[]} history={r.order.history.filter((h) => h.what.includes(r.doc.no))} />
    </RecordShell>
  );
}

export { GHOST_SM };
