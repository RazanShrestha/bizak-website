import * as React from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { Ban, Check, CircleCheck, Clock3, ListTree, Pencil, Radio, ShieldAlert, ShieldCheck, Table2, UserRound } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, DocLink, GHOST_SM, MenuItem, MenuSep, NUM, NumberField, Stat, Statline } from "../sales/bzw";
import type { Tone } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { Amount } from "../sales/orders";
import { Cell, CellGrid, ReasonDialog, RelatedSection, Section } from "../sales/parts";
import { Block, CustomerTitle, MoneyList, RecordShell, StepCard } from "../sales/record";
import { estimatesStore } from "../sales/flow";
import { ordersStore, useStore } from "../sales/store";
import { SF_NOW, SF_TODAY } from "./data";
import type { Customer, HubOrder, HubStatus, Source } from "./data";
import { customerById, day, dayTime, isCharge, npr, productById, typeOf } from "./engine";
import type { Evaluation } from "./engine";
import { FxDesk } from "./fx-desk";
import type { FxStatus } from "./fx-desk";
import { estimatePath } from "./estimates";
import { customersStore, hubStore, ledgerStore, opportunitiesStore, repsStore, schemesStore } from "./store";
import { SfActivity, SfLines, SfNoteFoot, Who, sfPath } from "./sf";
import type { SfLine } from "./sf";
import { SOURCE_NAME, STATUS_META, approveHubOrder, creditStops, estimateRef, estimateVersionOf, evaluateHub, forShopId, forShopName, forText, newSalesOrderPath, reasonsFor, rejectHubOrder, saveQuantities, schemesOnLine, soOnDesk } from "./orders-parts";
import type { Reason } from "./orders-parts";
import { paidFor, unapplied } from "./receipts";

// ════════════════════════════════════════════════════════════════════════════
// TRADE · ORDERS — the sales orders of every channel, in one list
//
// A rep's order, a dealer's portal order and one the office made are all sales
// orders (owner decision #31): this page is the sales order list seen with its
// channel and its review reasons, priced by the one engine. An order's number
// is its sales order's; approving one here approves that sales order and bills
// it. The page is the module's list (`FxDesk`): this file says what an order
// row is and what its record (`OrderPanel`) is. The office's own orders are made on the sales desk's form.
// ════════════════════════════════════════════════════════════════════════════

type Row = { o: HubOrder; ev: Evaluation; c: Customer | undefined; reasons: Reason[] };

/** The record's chip. */
const STATUS: Record<HubStatus, { label: string; tone: Tone }> = {
  review: { label: "Needs review", tone: "danger" },
  ready: { label: "Ready", tone: "partial" },
  approved: { label: "Approved", tone: "positive" },
  rejected: { label: "Rejected", tone: "neutral" },
};
/** The list's pill; its words are `STATUS_META`'s. */
const PILL: Record<HubStatus, Omit<FxStatus, "label">> = {
  review: { tone: "bad", icon: ShieldAlert },
  ready: { tone: "warn", icon: Clock3 },
  approved: { tone: "good", icon: CircleCheck },
  rejected: { tone: "idle", icon: Ban },
};
const SOURCES = Object.keys(SOURCE_NAME) as Source[];
const sum = (rs: Row[]) => rs.reduce((s, r) => s + r.ev.total, 0);
const linesOf = (r: Row) => r.ev.lines.filter((l) => !l.free && !isCharge(l.product.id)).length;
/** Someone has to look before this can go through: it failed a check, or it is ready but stopped on credit. */
const needsLook = (r: Row) => r.o.status === "review" || (r.o.status === "ready" && creditStops(r.ev));

/** "25 min" or "2 h" for an order placed today; its day otherwise. */
function placed(at: string) {
  const [d, t] = at.split(" ");
  if (d !== SF_TODAY || !t) return day(at);
  const [h, m] = t.split(":").map(Number);
  const [nh, nm] = SF_NOW.split(":").map(Number);
  const mins = Math.max(0, nh * 60 + nm - (h * 60 + m));
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h`;
}

/**
 * `orders/new` (and `orders/new?customer=<id>`, which a customer's "New order" links to): the office's order is made on
 * the sales desk's own form, with that customer already chosen.
 */
function ToSalesOrderForm() {
  const [search] = useSearchParams();
  return <Navigate to={newSalesOrderPath(customerById(search.get("customer") ?? "")?.id)} replace />;
}

export function OrdersPage() {
  const { no } = useParams();
  return no === "new" ? <ToSalesOrderForm /> : <OrdersDesk />;
}

function OrdersDesk() {
  const navigate = useNavigate();
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  const customers = useStore(customersStore);
  const reps = useStore(repsStore);
  // The credit check reads the ledger and an estimate's lines read its version, so both re-price the list.
  const ledger = useStore(ledgerStore);
  const estimates = useStore(estimatesStore);

  const rows = React.useMemo<Row[]>(
    () =>
      [...hub]
        .sort((a, b) => b.at.localeCompare(a.at))
        .map((o) => {
          const ev = evaluateHub(o, schemes);
          return { o, ev, c: customerById(o.customerId), reasons: reasonsFor(o, ev, hub) };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hub, schemes, customers, ledger, estimates],
  );
  const is = (s: HubStatus) => (r: Row) => r.o.status === s;
  const open = (r: Row) => r.o.status === "review" || r.o.status === "ready";
  const today = (r: Row) => r.o.at.startsWith(SF_TODAY);
  const total = (rs: Row[]) => (rs.length ? <Amount value={sum(rs)} currency="NPR" /> : undefined);
  const repName = (r: Row) => reps.find((p) => p.id === r.o.repId)?.name;

  return (
    <FxDesk<Row>
      place="orders"
      section="salesforce/orders"
      noun={["order", "orders"]}
      numberLabel="Order"
      rows={rows}
      noOf={(r) => r.o.id}
      dateOf={(r) => r.o.at.slice(0, 10)}
      searchText={(r) => `${r.o.id} ${r.c?.name ?? ""} ${forShopName(r.o) ?? ""} ${r.o.byName} ${r.ev.lines.map((l) => l.product.name).join(" ")}`}
      searchPlaceholder="Order, customer or product"
      stats={[
        { label: "Open", value: rows.filter(open).length },
        { label: "Open value", value: <Amount value={sum(rows.filter(open))} currency="NPR" /> },
      ]}
      picks={[
        { key: "review", label: "To review", value: rows.filter(is("review")).length, test: is("review"), danger: true },
        { key: "ready", label: "Ready", value: rows.filter(is("ready")).length, test: is("ready") },
        { key: "approved", label: "Approved", value: rows.filter(is("approved")).length, test: is("approved") },
        { key: "rejected", label: "Rejected", value: rows.filter(is("rejected")).length, test: is("rejected") },
      ]}
      views={[
        {
          key: "queue",
          label: "Queue",
          icon: ListTree,
          groups: (rs) => [
            { key: "review", label: "Needs review", rows: rs.filter(is("review")), right: total(rs.filter(is("review"))) },
            { key: "ready", label: "Ready to approve", rows: rs.filter(is("ready")), right: total(rs.filter(is("ready"))) },
            { key: "today", label: "Approved today", rows: rs.filter((r) => is("approved")(r) && today(r)), right: total(rs.filter((r) => is("approved")(r) && today(r))) },
            { key: "earlier", label: "Approved earlier", collapsed: true, rows: rs.filter((r) => is("approved")(r) && !today(r)) },
            { key: "rejected", label: "Rejected", collapsed: true, rows: rs.filter(is("rejected")) },
          ],
        },
        {
          key: "channel",
          label: "By channel",
          icon: Radio,
          groups: (rs) => SOURCES.map((s) => ({ key: s, label: SOURCE_NAME[s], rows: rs.filter((r) => r.o.source === s), right: total(rs.filter((r) => r.o.source === s)) })).filter((g) => g.rows.length),
        },
        { key: "register", label: "Register", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
      ]}
      filters={[
        ...SOURCES.map((s) => ({ value: `src:${s}`, label: SOURCE_NAME[s], group: "Channel", test: (r: Row) => r.o.source === s })),
        ...reps.map((p) => ({ value: `rep:${p.id}`, label: p.name, group: "Rep", test: (r: Row) => r.o.repId === p.id })),
        // The earlier desk's ?pick=shop / ?pick=est land on these two.
        { value: "shop", label: "For a shop", group: "Order", hint: "Billed to the distributor that serves it", test: (r: Row) => !!forShopId(r.o) },
        { value: "est", label: "From an estimate", group: "Order", test: (r: Row) => !!r.o.estimateId },
        ...customers.map((c) => ({ value: `cus:${c.id}`, label: c.name, hint: c.code, group: "Customer", test: (r: Row) => r.o.customerId === c.id || r.o.forCustomerId === c.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (r) => r.o.at + r.o.id, desc: true },
        { key: "old", label: "Oldest", by: (r) => r.o.at + r.o.id },
        { key: "val", label: "Value", by: (r) => r.ev.total, desc: true },
        { key: "cus", label: "Customer", by: (r) => r.c?.name ?? "" },
      ]}
      columns={[
        { key: "channel", label: "Channel", width: "100px", render: (r) => SOURCE_NAME[r.o.source] },
        {
          key: "rep",
          label: "Rep",
          width: "96px",
          render: (r) => {
            const name = repName(r);
            return name ? (
              <span className="flex min-w-0 items-center gap-2">
                <Who name={name} size={20} />
                <span className="min-w-0 truncate">{name.split(" ")[0]}</span>
              </span>
            ) : (
              <span className="text-bz-text-soft">—</span>
            );
          },
        },
        { key: "placed", label: "Placed", width: "76px", render: (r) => <span title={dayTime(r.o.at)}>{placed(r.o.at)}</span> },
      ]}
      primary={(r) => ({ title: r.c?.name ?? "Removed customer", sub: [forText(r.o), typeOf(r.c).name, `${linesOf(r)} line${linesOf(r) === 1 ? "" : "s"}`].filter(Boolean).join(" · "), subOnDesktop: true })}
      status={(r) => ({ ...PILL[r.o.status], label: STATUS_META[r.o.status].label })}
      amount={(r) => ({ value: <Amount value={r.ev.total} />, sub: needsLook(r) && r.reasons[0] ? <span className="text-bz-red">{r.reasons[0].short}</span> : undefined })}
      rowVerb={(r) => (needsLook(r) ? { label: "Review", icon: ShieldCheck, run: () => navigate(sfPath(`orders/${r.o.id}`)) } : r.o.status === "ready" ? { label: "Approve", icon: Check, run: () => void approveHubOrder(r.o) } : null)}
      bulk={[
        {
          label: "Approve",
          icon: Check,
          enabled: (rs) => rs.some((r) => r.o.status === "ready" && !creditStops(r.ev)),
          run: (rs) => {
            const skipped: string[] = [];
            let done = 0;
            rs.forEach((r) => {
              if (r.o.status === "ready" && !creditStops(r.ev)) {
                approveHubOrder(r.o);
                done++;
              } else skipped.push(`${r.o.id} ${r.o.status === "review" || r.o.status === "ready" ? "needs review" : `is ${STATUS[r.o.status].label.toLowerCase()}`}`);
            });
            return { done, skipped, verb: "approved" };
          },
        },
      ]}
      newLabel="New order"
      onNew={() => navigate(newSalesOrderPath())}
      renderPanel={(r, ctx) => <OrderPanel key={r.o.id} r={r} ctx={ctx} />}
    />
  );
}

// ── The record ──────────────────────────────────────────────────────────────

function OrderPanel({ r, ctx }: { r: Row; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const schemes = useStore(schemesStore);
  const hub = useStore(hubStore);
  const reps = useStore(repsStore);
  const ledger = useStore(ledgerStore);
  const opportunities = useStore(opportunitiesStore);
  const estimates = useStore(estimatesStore);
  // The way to the sales desk shows as soon as the order's sales order is on this tab's desk (bridge.ts).
  useStore(ordersStore);
  const { o, c } = r;
  const [draft, setDraft] = React.useState<{ productId: string; qty: number }[] | null>(null);
  const [ask, setAsk] = React.useState<null | "reject" | "over">(null);

  const ev = draft ? evaluateHub({ ...o, lines: draft }, schemes) : r.ev;
  const reasons = draft ? reasonsFor({ ...o, lines: draft }, ev, hub) : r.reasons;
  const stops = creditStops(ev);
  const pending = o.status === "review" || o.status === "ready";
  const t = typeOf(c);
  const rep = reps.find((p) => p.id === o.repId);
  const shop = customerById(forShopId(o));
  const ref = estimateRef(o);
  const version = estimateVersionOf(o);
  // The sales desk's estimate, for this customer: the desk's own seed may use the same number for another.
  const estimate = estimates.find((e) => e.no === o.estimateId && e.customerId === o.customerId);
  const opportunity = opportunities.find((x) => x.id === estimate?.opportunity && x.customerId === o.customerId);
  const invoice = ledger.find((x) => x.kind === "Invoice" && x.doc === o.id);
  // What the customer has paid for this order: applied to its invoice, or tagged to it and still advance (decision #33).
  const paid = paidFor(o.customerId, o.id);
  // Rejected with a payment tagged to it: that receipt needs another order.
  const stuck = o.status === "rejected" ? unapplied(o.customerId).filter((u) => u.use.tags.some((t) => t.orderNo === o.id && t.state === "dead")) : [];
  const onDesk = soOnDesk(o.id, o.customerId);
  const cr = ev.credit;

  const approve = () => {
    if (stops) return setAsk("over");
    approveHubOrder(o);
    ctx.show("success", `${o.id} approved`);
  };

  const lines: SfLine[] = ev.lines.map((l, i) => {
    const charge = isCharge(l.product.id);
    const names = schemesOnLine(l, ev, schemes);
    const note = version?.lines.find((x) => x.itemId === l.product.id && !x.freeOf)?.note?.trim();
    const editing = draft && !l.free && !charge;
    return {
      key: `${l.product.id}-${i}`,
      name: l.product.name,
      sub: charge ? "Charge" : l.free ? (l.fixed ? `Free · agreed on ${ref}` : `Free · ${names.join(", ")}`) : [l.product.code, ref && l.fixed ? "agreed price" : "", note, names.join(", ")].filter(Boolean).join(" · "),
      qty: editing ? (
        <NumberField value={draft.find((x) => x.productId === l.product.id)?.qty ?? l.qty} onChange={(q) => setDraft((d) => (d ?? []).map((x) => (x.productId === l.product.id ? { ...x, qty: q } : x)))} ariaLabel={`Quantity of ${l.product.name}`} />
      ) : charge ? (
        ""
      ) : (
        <>
          {l.qty} <span className="text-bz-text-soft">{l.product.unit}</span>
        </>
      ),
      rate: charge || l.free ? "" : <Amount value={l.price} />,
      disc: l.discount > 0 ? <Amount value={l.discount} /> : undefined,
      net: l.free ? <span className="font-normal text-bz-text-soft">Free</span> : <Amount value={l.net} />,
    };
  });

  const charges = ev.lines.filter((l) => isCharge(l.product.id)).reduce((s, l) => s + l.net, 0);
  const money = [
    { label: "Subtotal", value: <Amount value={ev.gross - charges} /> },
    ...(ev.discount > 0 ? [{ label: "Offer discounts", value: <Amount value={-ev.discount} /> }] : []),
    ...(charges > 0 ? [{ label: "Charges", value: <Amount value={charges} /> }] : []),
    { label: "VAT 13%", value: <Amount value={ev.tax} /> },
    { label: "Total", value: <Amount value={ev.total} currency="NPR" />, strong: true },
    ...(ev.freeValue > 0 ? [{ label: "Free goods worth", value: <Amount value={ev.freeValue} />, soft: true }] : []),
  ];

  const step = draft ? (
    <StepCard
      icon={<Pencil size={15} />}
      title="Editing quantities"
      sub="Prices, offers and credit follow as you type."
      actions={
        <>
          <button type="button" className={GHOST_SM} onClick={() => setDraft(null)}>
            Cancel
          </button>
          <button type="button" className={cn(BTN, "h-8")} onClick={() => (saveQuantities(o, draft, (id) => productById(id).name), setDraft(null), ctx.show("success", "Quantities saved"))}>
            Save
          </button>
        </>
      }
    />
  ) : o.status === "review" || (o.status === "ready" && stops) ? (
    <StepCard
      tone="danger"
      icon={<ShieldAlert size={15} />}
      title={reasons[0]?.long ?? cr.reason ?? "Needs review"}
      sub={
        reasons
          .slice(1)
          .map((x) => x.long)
          .join(" · ") || undefined
      }
      actions={
        <>
          <button type="button" className={GHOST_SM} onClick={() => setAsk("reject")}>
            Reject
          </button>
          <button type="button" className={cn(BTN, "h-8")} onClick={approve}>
            <Check size={13} /> {stops ? "Approve over credit…" : "Approve"}
          </button>
        </>
      }
    />
  ) : o.status === "ready" ? (
    <StepCard
      icon={<ShieldCheck size={15} />}
      title="Ready to approve"
      sub="Passes the credit check."
      actions={
        <button type="button" className={cn(BTN, "h-8")} onClick={approve}>
          <Check size={13} /> Approve
        </button>
      }
    />
  ) : o.status === "approved" ? (
    <StepCard
      tone="done"
      icon={<CircleCheck size={15} />}
      title="Approved"
      sub={invoice ? `Billed NPR ${npr(invoice.debit)}${invoice.due ? ` · due ${day(invoice.due)}` : ""}` : undefined}
      actions={
        onDesk ? (
          <button type="button" className={GHOST_SM} onClick={() => navigate(`/design/sales/orders/${o.id}`)}>
            Open sales order
          </button>
        ) : undefined
      }
    />
  ) : (
    <StepCard
      tone="quiet"
      icon={<Ban size={15} />}
      title="Rejected"
      sub={o.rejectReason}
      actions={
        stuck.length > 0 ? (
          <button type="button" className={GHOST_SM} onClick={() => navigate(sfPath(`payments/${stuck[0].no}`))}>
            {stuck[0].no} was paid for it
          </button>
        ) : undefined
      }
    />
  );

  // The first row is this same record on the sales desk, where it is delivered and invoiced — not a second document.
  const related = [
    ...(onDesk ? [{ no: o.id, kind: "Sales order", date: o.at.slice(0, 10), party: c?.name ?? "", status: o.status === "approved" ? "Approved" : o.status === "rejected" ? "Rejected" : "Pending", tone: (o.status === "approved" ? "positive" : o.status === "rejected" ? "neutral" : "pending") as Tone }] : []),
    ...(estimate ? [{ no: estimate.no, kind: "Estimate", date: estimate.date, party: c?.name ?? "", status: o.estimateVersion ? `Version ${o.estimateVersion} accepted` : "Accepted", tone: "positive" as Tone }] : []),
    ...(opportunity ? [{ no: opportunity.id, kind: "Opportunity", date: opportunity.createdAt.slice(0, 10), party: c?.name ?? "", status: "Won", tone: "positive" as Tone }] : []),
  ];
  const openRelated = (no: string) => navigate(no.startsWith("SO-") ? `/design/sales/orders/${no}` : no.startsWith("EST-") ? estimatePath(no) : sfPath(`opportunities/${no}`));

  return (
    <RecordShell
      ctx={ctx}
      no={o.id}
      chips={<Chip tone={STATUS[o.status].tone}>{STATUS[o.status].label}</Chip>}
      title={<CustomerTitle name={c?.name ?? "Removed customer"} onOpen={() => navigate(sfPath(`customers/${o.customerId}`))} />}
      amount={<Amount value={ev.total} currency="NPR" />}
      meta={[
        <span key="d" className={NUM}>
          {day(o.at)}
        </span>,
        <span key="s">{SOURCE_NAME[o.source]}</span>,
        ...(rep
          ? [
              <span key="r" className="inline-flex items-center gap-1.5">
                <Who name={rep.name} size={16} /> {rep.name}
              </span>,
            ]
          : []),
        ...(shop ? [<span key="f">for {shop.name}</span>] : []),
        ...(ref ? [<DocLink key="e" no={`From ${ref}`} onClick={estimate ? () => navigate(estimatePath(estimate.no)) : undefined} />] : []),
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} disabled={!pending || !!o.estimateId} hint={o.estimateId ? "Agreed on the estimate" : !pending ? "Already decided" : undefined} onClick={() => (close(), setDraft(o.lines.map((l) => ({ productId: l.productId, qty: l.qty }))))}>
            Edit quantities
          </MenuItem>
          <MenuItem icon={UserRound} onClick={() => (close(), navigate(sfPath(`customers/${o.customerId}`)))}>
            Open customer
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Ban} danger disabled={!pending} onClick={() => (close(), setAsk("reject"))}>
            Reject order…
          </MenuItem>
        </>
      )}
      foot={<SfNoteFoot id={o.id} />}
    >
      {step}

      <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
        <Statline className="pt-3">
          <Stat label="Credit limit" value={cr.limit === null ? "No check" : cr.limit === 0 ? "Cash only" : <Amount value={cr.limit} />} />
          <Stat label="Owes" value={<Amount value={cr.outstanding} />} />
          {cr.overdue > 0 && <Stat label="Overdue" value={<Amount value={cr.overdue} />} danger />}
          {cr.available !== null && <Stat label="Available" value={<Amount value={cr.available} />} />}
          {pending && cr.after !== null && <Stat label="After this order" value={<Amount value={cr.after} />} danger={cr.after < 0} />}
          {paid.paid + paid.waiting > 0 && <Stat label={paid.paid > 0 ? "Paid" : "Paid · to confirm"} value={<Amount value={paid.paid || paid.waiting} />} title={paid.receipts.join(", ")} />}
        </Statline>
      </div>

      <Block title="Lines" count={ev.lines.filter((l) => !isCharge(l.product.id)).length}>
        <SfLines rows={lines} />
        <MoneyList rows={money} />
      </Block>

      {(ev.applied.length > 0 || (pending && ev.hints.length > 0)) && (
        <Block title="Offers" count={ev.applied.length}>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[12px]">
            {ev.applied.map((a) => (
              <li key={a.schemeId} className="flex items-baseline gap-3">
                <button type="button" onClick={() => navigate(sfPath(`schemes/${a.schemeId}`))} className="min-w-0 truncate text-left text-bz-text hover:underline">
                  {a.name}
                </button>
                <span className="min-w-0 flex-1 truncate text-bz-text-soft">{a.text}</span>
                <Amount value={a.benefit} className="shrink-0 text-bz-text-muted" />
              </li>
            ))}
            {pending &&
              ev.hints.map((h) => (
                <li key={h.schemeId} className="flex items-baseline gap-3 text-bz-text-soft">
                  <span className="min-w-0 truncate">{h.name}</span>
                  <span className="min-w-0 flex-1 truncate">{h.text}</span>
                </li>
              ))}
          </ul>
        </Block>
      )}

      <Block title="Details">
        <CellGrid>
          <Cell label="Customer">
            {c?.name ?? "Removed customer"}
            <span className="block text-[10.5px] text-bz-text-soft">{[t.name, c ? `Tier ${c.tier}` : "", c?.city].filter(Boolean).join(" · ")}</span>
          </Cell>
          <Cell label={shop ? "Deliver for" : "Placed by"}>
            {shop ? shop.name : o.byName}
            <span className="block text-[10.5px] text-bz-text-soft">{shop ? `placed by ${o.byName}` : SOURCE_NAME[o.source]}</span>
          </Cell>
          <Cell label="Payment">{o.terms?.payment || (t.creditDays > 0 ? `Net ${t.creditDays} days` : "Cash on delivery")}</Cell>
          <Cell label="Delivery">
            {o.terms?.delivery || <span className="text-bz-text-soft">—</span>}
            {o.terms?.deliverBy && <span className="block text-[10.5px] text-bz-text-soft">by {day(o.terms.deliverBy)}</span>}
          </Cell>
          {o.note && !o.estimateId && (
            <Cell label="Note" wide>
              {o.note}
            </Cell>
          )}
        </CellGrid>
      </Block>

      <div className="border-b border-bz-line-soft">
        {related.length > 0 && <RelatedSection rows={related} onOpen={openRelated} />}
        {pending && ev.skipped.length > 0 && (
          <Section title="Offers not applied" count={ev.skipped.length} summary={ev.skipped.map((s) => s.name).join(" · ")}>
            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[11.5px]">
              {ev.skipped.map((s) => (
                <li key={s.schemeId} className="flex gap-3">
                  <span className="min-w-0 flex-1 truncate text-bz-text">{s.name}</span>
                  <span className="shrink-0 text-bz-text-soft">{s.reason}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <SfActivity ids={[o.id]} />

      <ReasonDialog
        open={ask !== null}
        eyebrow={o.id}
        title={ask === "over" ? "Approve over credit" : "Reject order"}
        body={ask === "over" ? cr.reason : undefined}
        confirm={ask === "over" ? "Approve over credit" : "Reject order"}
        danger={ask === "reject"}
        onClose={() => setAsk(null)}
        onConfirm={(reason) => {
          if (ask === "reject") {
            rejectHubOrder(o, reason);
            ctx.show("info", `${o.id} rejected`);
          } else {
            approveHubOrder(o, reason);
            ctx.show("success", `${o.id} approved`);
          }
          setAsk(null);
        }}
      />
    </RecordShell>
  );
}

// ── For a host that is not this page (the Today queue) ──────────────────────

/** One order's record, by id. */
export function OrderPeek({ id, ctx }: { id: string; ctx: PanelCtx }) {
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  useStore(customersStore);
  useStore(ledgerStore);
  useStore(estimatesStore);
  const o = hub.find((x) => x.id === id);
  if (!o) return null;
  const ev = evaluateHub(o, schemes);
  return <OrderPanel key={o.id} r={{ o, ev, c: customerById(o.customerId), reasons: reasonsFor(o, ev, hub) }} ctx={ctx} />;
}

export const ORDERS_ROUTES = [
  { path: "design/salesforce/orders", Component: OrdersPage },
  { path: "design/salesforce/orders/:no", Component: OrdersPage },
];
