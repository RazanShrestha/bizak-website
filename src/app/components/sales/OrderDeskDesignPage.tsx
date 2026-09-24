import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CalendarClock, ListTree, Printer, ReceiptText, ShieldCheck, Table2, Truck } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, CountMark, NUM } from "./bzw";
import {
  Amount,
  CUSTOMERS,
  ExpectedMark,
  JourneyMark,
  LOCATIONS,
  ME,
  Order,
  PEOPLE,
  QUEUES,
  STAGE_TONE,
  TODAY,
  customerById,
  daysBetween,
  fmtQty,
  fmtShort,
  isLate,
  isOpen,
  itemById,
  lineNet,
  locationById,
  needsMyApproval,
  nextOrderNo,
  orderTotal,
  personById,
  progressOf,
  queueOf,
  readyToInvoice,
  remainingToDeliver,
  stageLabel,
  stageOf,
} from "./orders";
import { SUBSIDIARIES, subsidiaryById } from "./master";
import { ordersStore, useStore } from "./store";
import { SalesNav, addChildDoc, approveOrder, deleteOrder, ev, estimatesStore, orderedQty, updateOrder } from "./flow";
import { ComposerResult, OrderComposer } from "./OrderComposer";
import { DateCell, DocDesk, ExpandLines, PanelCtx } from "./DocDesk";
import { OrderPanel } from "./OrderPanel";
import { pendingOn, unitsLabel } from "./FulfilSheet";

// ════════════════════════════════════════════════════════════════════════════
// SALES ORDERS · THE DESK
//
// One surface replaces list · view · create · update · copy · from-estimate ·
// deliver-from-order · invoice-from-order as places a user has to GO. The URL
// still names the record (/design/sales/orders/SO-1047), so a link in a
// notification or a note opens exactly what it points at.
//
// Why these three views and not a board:
//   Queue     — orders grouped by what they are WAITING FOR. An order's stage is
//               derived from documents, so it is read, never dragged: a board
//               would offer a gesture ("drop into Invoiced") with no honest
//               meaning. Approvers see theirs first, the warehouse reads To
//               deliver, finance reads To invoice.
//   Schedule  — open orders by the date they were PROMISED. The warehouse plans
//               the week from it; late is the one bucket that earns red.
//   Register  — every order, flat, sorted, dense. The lookup and export view.
//
// The status filters are separate axes — approval, fulfilment, billing — the
// way the stored FULFILL_STATUS and INVOICE_STATUS are separate columns.
// ════════════════════════════════════════════════════════════════════════════

const BASE = "/design/sales/orders";

function nextVerb(o: Order, go: (m: string) => void) {
  const s = stageOf(o);
  if (s === "approval" && needsMyApproval(o)) return { label: "Review", icon: ShieldCheck, run: () => go("") };
  if ((s === "deliver" || s === "delivering") && o.lines.some((l) => remainingToDeliver(l) - pendingOn(o, l, "delivery") > 0)) return { label: "Deliver", icon: Truck, run: () => go("deliver") };
  if ((s === "delivering" || s === "invoice") && o.lines.some((l) => readyToInvoice(l) - pendingOn(o, l, "invoice") > 0)) return { label: "Invoice", icon: ReceiptText, run: () => go("invoice") };
  return null;
}

function scheduleBand(o: Order) {
  if (!o.expected) return "none";
  const d = daysBetween(TODAY, o.expected);
  if (d < 0) return "late";
  if (d <= 6) return "week";
  if (d <= 13) return "next";
  return "later";
}

const npr = (os: Order[]) => <Amount value={os.reduce((s, o) => s + orderTotal(o) * o.exchangeRate, 0)} currency="NPR" />;

export function OrderDeskDesignPage() {
  const all = useStore(ordersStore);
  const orders = React.useMemo(() => all.filter((o) => !o.direct), [all]);
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(id);
  }, []);

  const open = orders.filter((o) => isOpen(o) && stageOf(o) !== "rejected");
  const toInvoice = (o: Order) => ["delivering", "invoice"].includes(stageOf(o)) && o.lines.some((l) => readyToInvoice(l) - pendingOn(o, l, "invoice") > 0);
  const toDeliver = (o: Order) => ["deliver", "delivering"].includes(stageOf(o));
  const fulfil = (o: Order) => (progressOf(o).deliveredPct >= 100 ? "full" : progressOf(o).deliveredPct > 0 ? "part" : "none");
  const billing = (o: Order) => (progressOf(o).invoicedPct >= 100 ? "full" : progressOf(o).invoicedPct > 0 ? "part" : "none");

  // ── Composer → order ────────────────────────────────────────────────────
  const fromResult = (r: ComposerResult) => ({
    subsidiaryId: r.subsidiaryId,
    customerId: r.customerId,
    date: r.date,
    expected: r.expected,
    locationId: r.locationId,
    repId: r.repId,
    termId: r.termId,
    due: r.due,
    customerPo: r.customerPo,
    currency: r.currency,
    exchangeRate: r.exchangeRate,
    billingAddress: r.billingAddress,
    memo: r.memo,
    dims: r.dims,
    custom: r.custom,
    lines: r.lines,
    attachments: r.attachments,
  });

  const create = (r: ComposerResult, source: Order["source"], ctx: PanelCtx) => {
    const no = nextOrderNo(all.filter((o) => o.no.startsWith("SO-")));
    // A discount routes to review — the shape a WORKFLOW_TRANSITION_RULES condition takes.
    const review = r.lines.some((l) => l.discountPct > 0 || l.discountAmt);
    const created: Order = {
      ...fromResult(r),
      id: no,
      no,
      source,
      approval: review ? { state: "pending", stateName: "Manager review", approverId: ME.id, since: TODAY } : { state: "approved", byId: ME.id, on: TODAY },
      closed: false,
      cancelled: null,
      docs: [],
      comments: r.notes,
      created: { byId: ME.id, on: TODAY },
      audit: [],
      history: [ev(source ? `created the order from ${source.no}` : "created the order"), ...(review ? [ev("sent it to Manager review")] : [])],
      advance: 0,
    };
    ordersStore.set((os) => [created, ...os]);
    ctx.go(no);
    ctx.show("success", review ? `${no} created · sent to Manager review` : `${no} created`);
  };

  const saveEdit = (o: Order, r: ComposerResult, ctx: PanelCtx) => {
    const next = fromResult(r);
    const grew = o.approval.state === "approved" && r.total > orderTotal(o) + 0.005;
    const resubmit = grew || o.approval.state === "rejected";
    const changed: [string, string, string][] = [];
    if (o.expected !== next.expected) changed.push(["Expected delivery", o.expected ? fmtShort(o.expected) : "—", next.expected ? fmtShort(next.expected) : "—"]);
    if (Math.abs(orderTotal(o) - r.total) > 0.005) changed.push(["Total", orderTotal(o).toLocaleString("en-US", { minimumFractionDigits: 2 }), r.total.toLocaleString("en-US", { minimumFractionDigits: 2 })]);
    if (o.customerPo !== next.customerPo) changed.push(["Customer PO", o.customerPo ?? "—", next.customerPo ?? "—"]);
    updateOrder(o.no, (x) => ({
      ...x,
      ...next,
      approval: resubmit ? { state: "pending", stateName: "Manager review", approverId: ME.id, since: TODAY } : x.approval,
      comments: [...x.comments, ...r.notes],
      audit: [...changed.map(([field, from, to]) => ({ when: ev("").when, whoId: ME.id, field, from, to })), ...x.audit],
      history: [...x.history, ev(resubmit ? "edited the order and sent it to Manager review" : "edited the order")],
    }));
    ctx.go(o.no);
    ctx.show("success", resubmit ? `${o.no} saved · back in Manager review` : `${o.no} saved`);
  };

  const composeNew = (ctx: PanelCtx) => {
    const estNo = search.get("estimate");
    const est = estNo ? estimatesStore.get().find((e) => e.no === estNo) : undefined;
    const copy = search.get("copy");
    const src = copy ? orders.find((o) => o.no === copy) : undefined;
    const onCancel = (kept: boolean) => {
      if (est) navigate(`/design/sales/estimates/${est.no}`);
      else ctx.go(src ? src.no : null);
      if (kept) ctx.show("info", "Draft kept", { label: "Resume", run: () => ctx.go("new") });
    };
    if (est) {
      // Only what the estimate has not already been ordered for (one estimate, many orders).
      const lines = est.lines.map((l) => ({ ...l, id: `${l.id}-o`, qty: l.qty - orderedQty(orders, est, l) })).filter((l) => l.qty > 0);
      return (
        <OrderComposer
          key={`est-${est.no}`}
          noun="order"
          title="New sales order"
          source={{ no: est.no, label: "Estimate" }}
          lockCustomer
          lockSubsidiary
          seed={{
            subsidiaryId: est.subsidiaryId,
            customerId: est.customerId,
            date: TODAY,
            expected: est.expectedClose,
            locationId: est.locationId,
            repId: est.repId,
            termId: est.termId,
            currency: est.currency,
            exchangeRate: est.exchangeRate,
            memo: est.memo,
            dims: est.dims,
            custom: est.custom,
            lines,
          }}
          primaryLabel="Create order"
          orders={orders}
          onCancel={onCancel}
          onSave={(r) => create(r, { kind: "Estimate", no: est.no }, ctx)}
        />
      );
    }
    return (
      <OrderComposer
        key={src ? `copy-${src.no}` : "new"}
        noun="order"
        title={src ? `Copy of ${src.no}` : "New sales order"}
        source={src ? { no: src.no, label: "Copied from" } : undefined}
        draft={!src}
        seed={src ? { ...src, date: TODAY, expected: null, due: null, customerPo: null, attachments: [], lines: src.lines.map((l, i) => ({ ...l, id: `cp-${i}`, delivered: 0, invoiced: 0 })) } : {}}
        primaryLabel="Create order"
        orders={orders}
        onCancel={onCancel}
        onSave={(r) => create(r, null, ctx)}
      />
    );
  };

  // ── Bulk — sequential work, reported as a split ─────────────────────────
  const bulkApprove = (rows: Order[]) => {
    const skipped: string[] = [];
    let done = 0;
    rows.forEach((o) => (needsMyApproval(o) ? (approveOrder(o.no), done++) : skipped.push(`${o.no} isn't waiting on you`)));
    return { done, skipped, verb: "approved" };
  };
  const bulkDeliver = (rows: Order[]) => {
    const skipped: string[] = [];
    let done = 0;
    rows.forEach((o) => {
      const left = o.lines.filter((l) => remainingToDeliver(l) - pendingOn(o, l, "delivery") > 0);
      if (!toDeliver(o) || !left.length) return skipped.push(`${o.no} has nothing to deliver`);
      if (left.some((l) => itemById(l.itemId)?.lotTracked || itemById(l.itemId)?.serialTracked)) return skipped.push(`${o.no} needs batches or serials entered`);
      const short = left.find((l) => Object.keys(itemById(l.itemId)!.onHand).length > 0 && (itemById(l.itemId)!.onHand[o.locationId] ?? 0) < remainingToDeliver(l));
      if (short) return skipped.push(`${o.no} is short at ${locationById(o.locationId)?.name}`);
      addChildDoc(o.no, { kind: "delivery", date: TODAY, state: "approved", byId: ME.id, locationId: o.locationId, lines: left.map((l) => ({ lineId: l.id, qty: remainingToDeliver(l) - pendingOn(o, l, "delivery") })) });
      done++;
    });
    return { done, skipped, verb: "delivered" };
  };
  const bulkInvoice = (rows: Order[]) => {
    const skipped: string[] = [];
    let done = 0;
    rows.forEach((o) => {
      const ready = o.lines.filter((l) => readyToInvoice(l) - pendingOn(o, l, "invoice") > 0);
      if (!ready.length) return skipped.push(`${o.no} has nothing delivered to bill`);
      addChildDoc(o.no, { kind: "invoice", date: TODAY, due: o.due ?? TODAY, state: "approved", byId: ME.id, custom: o.custom, lines: ready.map((l) => ({ lineId: l.id, qty: readyToInvoice(l) - pendingOn(o, l, "invoice") })) });
      done++;
    });
    return { done, skipped, verb: "invoiced" };
  };

  return (
    <DocDesk<Order>
      section="sales/orders"
      nav={<SalesNav current="orders" />}
      noun={["order", "orders"]}
      fullModes={["invoice"]}
      rows={orders}
      loading={loading}
      noOf={(o) => o.no}
      dateOf={(o) => o.date}
      searchText={(o) => `${o.no} ${customerById(o.customerId)!.name} ${customerById(o.customerId)!.code} ${o.customerPo ?? ""} ${o.lines.map((l) => itemById(l.itemId)?.name).join(" ")}`}
      stats={[
        { label: "Open", value: open.length, title: "Approved or waiting, not yet complete" },
        { label: "Open value", value: npr(open) },
      ]}
      picks={[
        { key: "mine", label: "Needs you", value: orders.filter(needsMyApproval).length, test: needsMyApproval, title: "Waiting on your approval" },
        { key: "late", label: "Late", value: orders.filter(isLate).length, danger: orders.some(isLate), test: isLate, title: "Promised date passed, still undelivered" },
        { key: "deliver", label: "To deliver", value: orders.filter(toDeliver).length, test: toDeliver },
        { key: "invoice", label: "To invoice", value: orders.filter(toInvoice).length, test: toInvoice },
      ]}
      views={[
        {
          key: "queue",
          label: "Queue",
          icon: ListTree,
          groups: (os) =>
            QUEUES.map((g) => {
              const rows = os.filter((o) => queueOf(o) === g.key);
              return { key: g.key, label: g.label, rows, collapsed: g.defaultCollapsed, right: npr(rows), icon: g.key === "mine" ? <ShieldCheck size={12} className="text-bz-text-muted" /> : undefined };
            }),
        },
        {
          key: "schedule",
          label: "Schedule",
          icon: CalendarClock,
          groups: (os) => {
            const live = os.filter((o) => isOpen(o) && ["approval", "deliver", "delivering"].includes(stageOf(o))).sort((a, b) => (a.expected ?? "9999").localeCompare(b.expected ?? "9999"));
            return [
              { key: "late", label: "Late", alarm: true, empty: "Nothing late." },
              { key: "week", label: "This week", empty: "Nothing due this week." },
              { key: "next", label: "Next week" },
              { key: "later", label: "Later" },
              { key: "none", label: "No date" },
            ].map((b) => {
              const rows = live.filter((o) => scheduleBand(o) === b.key);
              return { ...b, rows, right: rows.length ? unitsLabel(rows.flatMap((o) => o.lines.filter((l) => remainingToDeliver(l) > 0).map((l) => ({ unit: l.unit ?? itemById(l.itemId)!.unit, qty: remainingToDeliver(l) })))) + " to ship" : undefined };
            });
          },
        },
        { key: "register", label: "Register", icon: Table2, groups: (os) => [{ key: "all", label: "", rows: os, right: npr(os) }] },
      ]}
      filters={[
        ...SUBSIDIARIES.map((s) => ({ value: `sub:${s.id}`, label: s.name, group: "Subsidiary", test: (o: Order) => o.subsidiaryId === s.id })),
        ...LOCATIONS.map((l) => ({ value: `loc:${l.id}`, label: l.name, group: "Deliver from", test: (o: Order) => o.locationId === l.id })),
        { value: "ap:pending", label: "Pending approval", group: "Approval", test: (o: Order) => o.approval.state === "pending" },
        { value: "ap:approved", label: "Approved", group: "Approval", test: (o: Order) => o.approval.state === "approved" },
        { value: "ap:rejected", label: "Sent back", group: "Approval", test: (o: Order) => o.approval.state === "rejected" },
        { value: "fu:none", label: "Not delivered", group: "Fulfilment", test: (o: Order) => fulfil(o) === "none" },
        { value: "fu:part", label: "Partly delivered", group: "Fulfilment", test: (o: Order) => fulfil(o) === "part" },
        { value: "fu:full", label: "Delivered", group: "Fulfilment", test: (o: Order) => fulfil(o) === "full" },
        { value: "bi:none", label: "Not invoiced", group: "Billing", test: (o: Order) => billing(o) === "none" },
        { value: "bi:part", label: "Partly invoiced", group: "Billing", test: (o: Order) => billing(o) === "part" },
        { value: "bi:full", label: "Invoiced", group: "Billing", test: (o: Order) => billing(o) === "full" },
        { value: "st:closed", label: "Closed or cancelled", group: "Lifecycle", test: (o: Order) => o.closed || !!o.cancelled },
        ...PEOPLE.map((p) => ({ value: `rep:${p.id}`, label: p.name, group: "Sales rep", test: (o: Order) => o.repId === p.id })),
        ...CUSTOMERS.map((c) => ({ value: `cus:${c.id}`, label: c.name, hint: c.code, group: "Customer", test: (o: Order) => o.customerId === c.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (o) => o.date + o.no, desc: true },
        { key: "old", label: "Oldest", by: (o) => o.date + o.no },
        { key: "exp", label: "Expected date", by: (o) => o.expected ?? "9999" },
        { key: "amt", label: "Amount", by: (o) => orderTotal(o) * o.exchangeRate, desc: true },
        { key: "cus", label: "Customer", by: (o) => customerById(o.customerId)!.name },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (o) => <DateCell iso={o.date} /> },
        { key: "exp", label: "Expected", width: "76px", render: (o) => <ExpectedMark o={o} /> },
        { key: "rep", label: "Rep", width: "24px", render: (o) => <Avatar person={o.repId ? personById(o.repId) : undefined} size={20} /> },
        { key: "prog", label: "Progress", width: "72px", render: (o) => <JourneyMark o={o} width={68} /> },
      ]}
      primary={(o) => {
        const p = progressOf(o);
        return {
          title: (
            <span className="flex items-center gap-2">
              <span className="truncate">{customerById(o.customerId)!.name}</span>
              {p.pendingDeliveries + p.pendingInvoices > 0 && (
                <span className="hidden lg:inline" title="A document is awaiting approval">
                  <CountMark>{p.pendingDeliveries + p.pendingInvoices} pending</CountMark>
                </span>
              )}
            </span>
          ),
          sub: (
            <>
              {subsidiaryById(o.subsidiaryId).name} · {o.lines.length} line{o.lines.length === 1 ? "" : "s"}
            </>
          ),
          subOnDesktop: true,
        };
      }}
      amount={(o) => ({
        value: <Amount value={orderTotal(o)} currency={o.currency !== "NPR" ? o.currency : undefined} />,
        sub: <span className={STAGE_TONE[stageOf(o)] === "danger" ? "text-bz-red" : undefined}>{stageLabel(o)}</span>,
      })}
      rowVerb={(o) => nextVerb(o, (m) => navigate(m ? `${BASE}/${o.no}?do=${m}` : `${BASE}/${o.no}`))}
      renderExpand={(o) => (
        <ExpandLines
          rows={o.lines.map((l) => ({
            name: itemById(l.itemId)!.name,
            note: `${fmtQty(l.delivered)} delivered · ${fmtQty(l.invoiced)} invoiced`,
            qty: `${fmtQty(l.qty)} ${l.unit ?? itemById(l.itemId)!.unit}`,
            amount: <Amount value={lineNet(l)} />,
          }))}
        />
      )}
      bulk={[
        { label: "Approve", icon: ShieldCheck, enabled: (rs) => rs.some(needsMyApproval), run: bulkApprove },
        { label: "Deliver all left", icon: Truck, enabled: (rs) => rs.some(toDeliver), run: bulkDeliver, title: "Delivers everything left, from each order's own warehouse" },
        { label: "Invoice delivered", icon: ReceiptText, enabled: (rs) => rs.some(toInvoice), run: bulkInvoice },
        { label: "Print", icon: Printer, enabled: () => true, run: (rs) => ({ done: rs.length, skipped: [], verb: "sent to the printer" }) },
      ]}
      onDelete={(rs) => {
        const skipped: string[] = [];
        let done = 0;
        rs.forEach((o) => (o.docs.length ? skipped.push(`${o.no} has deliveries or invoices`) : (deleteOrder(o.no), done++)));
        return { done, skipped };
      }}
      newLabel="New order"
      onNew={() => navigate(`${BASE}/new`)}
      renderNew={composeNew}
      renderPanel={(o, ctx) =>
        ctx.mode === "edit" ? (
          <OrderComposer
            key={`edit-${o.no}`}
            noun="order"
            title={`Edit ${o.no}`}
            seed={o}
            editing={{ approved: o.approval.state === "approved", baseTotal: orderTotal(o), hasProgress: o.docs.length > 0 }}
            lockCustomer={o.docs.length > 0}
            lockSubsidiary
            primaryLabel="Save changes"
            orders={orders}
            onCancel={() => ctx.go(o.no)}
            onSave={(r) => saveEdit(o, r, ctx)}
          />
        ) : (
          <OrderPanel key={o.no} order={o} ctx={ctx} />
        )
      }
    />
  );
}

export { cn, NUM };
