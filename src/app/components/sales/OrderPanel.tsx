import * as React from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check as CheckIcon,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Copy,
  FileText,
  Lock,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Printer,
  ReceiptText,
  Send,
  ShieldCheck,
  Trash2,
  Truck,
  X,
  Ban,
  Archive,
  Clock3,
  Plus,
} from "lucide-react";
import { cn } from "../ui/utils";
import {
  Avatar,
  BTN,
  Chip,
  CountMark,
  DANGER_BTN,
  DocLink,
  GHOST,
  GHOST_SM,
  ICON_BTN,
  Kbd,
  LABEL,
  MenuItem,
  MenuSep,
  NUM,
  PLAIN_BTN,
  Popover,
  Refusal,
  Segmented,
  Stat,
  Statline,
  TEXTAREA,
  Dialog,
  Field,
} from "./bzw";
import {
  Amount,
  ChildDoc,
  ExpectedMark,
  ME,
  Order,
  OrderLine,
  STAGE_TONE,
  TAX_LABEL,
  TODAY,
  customerById,
  daysBetween,
  fmtQty,
  fmtShort,
  isLate,
  itemById,
  lineDiscount,
  lineGross,
  lineNet,
  lineTax,
  locationById,
  needsMyApproval,
  personById,
  progressOf,
  readyToInvoice,
  remainingToDeliver,
  stageLabel,
  stageOf,
  termById,
  totalsOf,
  useKeys,
} from "./orders";
import { FulfilSheet, DeliveryPayload, InvoicePayload, pendingOn } from "./FulfilSheet";
import { useNavigate } from "react-router";
import { hrefFor } from "./flow";

// ════════════════════════════════════════════════════════════════════════════
// ORDER PANEL — the record, opened beside the queue it came from
//
// The task drawer's grammar, re-cut for a document:
//
//   • WIDER, AND DOCKED. A task is read in 520px over a scrim; an order has
//     money, lines and a lifecycle, and the reader is usually working a queue
//     (approve, next, approve). So from 1280px the panel docks beside the list
//     with no scrim — the list stays live, the open row stays lit, J/K walks
//     it — and it can take the whole page for a long order.
//   • THE NEXT STEP IS THE FIRST THING IN IT. What the order is waiting for
//     (your approval · someone else's · a delivery · an invoice) and the one
//     button that does it. Deliver and Invoice open IN the panel, pre-filled
//     from what is left — they are the page hops this design removes.
//   • BLOCKS, NOT TABS. Lines, documents, details, files and conversation are
//     one scroll in the order a real conversation about an order takes. Tabs
//     hid payment terms and dimensions from everyone who did not click them.
//   • READ HERE, EDIT IN THE COMPOSER. Conversation and files are always live;
//     the DOCUMENT changes through Edit → one explicit Save, because a save can
//     re-number, re-price, move stock or send the order back for approval.
//     Per-field autosave is right for a task and wrong for a ledger document.
// ════════════════════════════════════════════════════════════════════════════

export type PanelMode = "view" | "deliver" | "invoice";

export function OrderPanel({
  order,
  mode,
  docked,
  full,
  position,
  onMode,
  onToggleFull,
  onClose,
  onPrev,
  onNext,
  onEdit,
  onApprove,
  onReject,
  onDeliver,
  onInvoice,
  onComment,
  onAttach,
  onCopy,
  onCloseOrder,
  onCancelOrder,
  onPrint,
}: {
  order: Order;
  mode: PanelMode;
  docked: boolean;
  full: boolean;
  position: { index: number; total: number } | null;
  onMode: (m: PanelMode) => void;
  onToggleFull: () => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEdit: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onDeliver: (p: DeliveryPayload, thenInvoice: boolean) => void;
  onInvoice: (p: InvoicePayload) => void;
  onComment: (body: string) => void;
  onAttach: () => void;
  onCopy: () => void;
  onCloseOrder: () => void;
  onCancelOrder: (reason: string) => void;
  onPrint: () => void;
}) {
  const customer = customerById(order.customerId)!;
  const stage = stageOf(order);
  const p = progressOf(order);
  const totals = totalsOf(order.lines);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const [doc, setDoc] = React.useState<ChildDoc | null>(null);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  React.useEffect(() => {
    setDoc(null);
    bodyRef.current?.scrollTo({ top: 0 });
  }, [order.id, mode]);

  const canEdit = stage !== "cancelled" && stage !== "closed" && stage !== "complete";
  const canDeliver = ["deliver", "delivering"].includes(stage) && order.lines.some((l) => remainingToDeliver(l) - pendingOn(order, l, "delivery") > 0);
  const canInvoice = ["delivering", "invoice"].includes(stage) && order.lines.some((l) => readyToInvoice(l) - pendingOn(order, l, "invoice") > 0);

  useKeys(
    {
      a: () => mode === "view" && needsMyApproval(order) && onApprove(),
      d: () => mode === "view" && canDeliver && onMode("deliver"),
      i: () => mode === "view" && canInvoice && onMode("invoice"),
      e: () => mode === "view" && canEdit && onEdit(),
    },
    true,
  );

  const sheet = mode !== "view";

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col bg-bz-surface",
        docked && !full && "border-l border-bz-line",
        !docked && "shadow-[var(--bz-shadow-panel)]",
      )}
      aria-label={`Sales order ${order.no}`}
    >
      {/* ── Head ───────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-bz-line-soft px-5 pb-3.5 pt-3">
        <div className="flex items-center gap-2">
          {sheet || doc ? (
            <button
              type="button"
              onClick={() => (doc ? setDoc(null) : onMode("view"))}
              className="-ml-1.5 inline-flex h-7 items-center gap-1 rounded-bz-md px-1.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
            >
              <ArrowLeft size={13} /> {order.no}
            </button>
          ) : (
            <span className={cn("whitespace-nowrap text-[11px] font-semibold text-bz-text-soft", NUM)}>{order.no}</span>
          )}
          {!sheet && !doc && <Chip tone={STAGE_TONE[stage]}>{stageLabel(order)}</Chip>}
          {!sheet && !doc && p.pendingDeliveries > 0 && (
            <Chip tone="pending" dot={false} className="hidden sm:inline-flex" title="Awaiting approval — stock has not moved yet">
              {p.pendingDeliveries} delivery awaiting approval
            </Chip>
          )}
          {!sheet && !doc && p.pendingInvoices > 0 && (
            <Chip tone="pending" dot={false} className="hidden sm:inline-flex" title="Awaiting approval — nothing has posted yet">
              {p.pendingInvoices} invoice awaiting approval
            </Chip>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {position && !sheet && (
              <>
                <span className={cn("mr-1 hidden text-[10.5px] text-bz-text-soft sm:inline", NUM)}>
                  {position.index + 1} / {position.total}
                </span>
                <button type="button" className={cn(ICON_BTN, "hidden sm:inline-flex")} onClick={onPrev} title="Previous order (K)">
                  <ChevronLeft size={15} />
                </button>
                <button type="button" className={cn(ICON_BTN, "hidden sm:inline-flex")} onClick={onNext} title="Next order (J)">
                  <ChevronRight size={15} />
                </button>
              </>
            )}
            {!sheet && (
              <button type="button" className={cn(ICON_BTN, "hidden sm:inline-flex")} onClick={onPrint} title="Print">
                <Printer size={14} />
              </button>
            )}
            {docked && (
              <button type="button" className={cn(ICON_BTN, "hidden md:inline-flex")} onClick={onToggleFull} title={full ? "Back beside the list" : "Full page"}>
                {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}
            {!sheet && (
              <button ref={moreRef} type="button" className={ICON_BTN} onClick={() => setMoreOpen(true)} title="More">
                <MoreHorizontal size={15} />
              </button>
            )}
            <button type="button" className={ICON_BTN} onClick={onClose} title="Close (Esc)">
              <X size={15} />
            </button>
          </div>
        </div>

        <Popover open={moreOpen} anchor={moreRef.current} onClose={() => setMoreOpen(false)} align="right" width={230}>
          <MenuItem icon={Pencil} kbd="E" disabled={!canEdit} onClick={() => (setMoreOpen(false), onEdit())}>
            Edit order
          </MenuItem>
          <MenuItem icon={Copy} onClick={() => (setMoreOpen(false), onCopy())}>
            Copy to new order
          </MenuItem>
          <MenuItem icon={Printer} onClick={() => (setMoreOpen(false), onPrint())}>
            Print
          </MenuItem>
          <MenuSep />
          <MenuItem
            icon={Archive}
            disabled={!(stage === "delivering" || stage === "invoice")}
            title="Stops what is left from being delivered or invoiced"
            hint={stage === "delivering" || stage === "invoice" ? "Nothing more will be delivered or billed" : undefined}
            onClick={() => (setMoreOpen(false), onCloseOrder())}
          >
            Close order
          </MenuItem>
          <MenuItem icon={Ban} danger disabled={p.deliveredPct > 0 || p.invoicedPct > 0 || stage === "cancelled"} title={p.deliveredPct > 0 ? "Delivered orders are closed, not cancelled" : undefined} onClick={() => (setMoreOpen(false), setCancelOpen(true))}>
            Cancel order…
          </MenuItem>
        </Popover>

        {!sheet && !doc && (
          <>
            <div className="mt-2 flex items-start gap-3">
              <h2 className="m-0 min-w-0 flex-1 text-[17px] font-semibold leading-snug tracking-tight text-bz-text">
                <button type="button" className="group inline text-left hover:underline hover:underline-offset-4" title="Open customer">
                  {customer.name}
                  <ArrowUpRight size={13} className="ml-1 inline align-[-1px] text-bz-text-soft opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </h2>
              <p className="m-0 shrink-0 text-right text-[17px] font-semibold tracking-tight text-bz-text">
                <Amount value={totals.total} currency={order.currency} />
              </p>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-bz-text-muted">
              <span className={NUM}>{fmtShort(order.date)}</span>
              <Dot />
              {order.repId ? (
                <span className="inline-flex items-center gap-1.5">
                  <Avatar person={personById(order.repId)} size={16} />
                  {personById(order.repId)?.name}
                </span>
              ) : (
                <span className="text-bz-text-soft">No sales rep</span>
              )}
              <Dot />
              <span>{locationById(order.locationId)?.name}</span>
              {order.customerPo && (
                <>
                  <Dot />
                  <span title="Customer's purchase order">
                    PO <span className={cn("text-bz-text", NUM)}>{order.customerPo}</span>
                  </span>
                </>
              )}
              {order.source && (
                <>
                  <Dot />
                  <DocLink no={order.source.no} kind={order.source.kind} />
                </>
              )}
            </div>
          </>
        )}
        {sheet && (
          <div className="mt-2">
            <h2 className="m-0 text-[17px] font-semibold tracking-tight text-bz-text">{mode === "deliver" ? "New delivery" : "New invoice"}</h2>
            <p className="m-0 mt-0.5 text-[11.5px] text-bz-text-muted">
              {customer.name} · <span className={NUM}>{order.no}</span>
            </p>
          </div>
        )}
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      {sheet ? (
        <FulfilSheet
          key={`${order.id}-${mode}`}
          order={order}
          kind={mode === "deliver" ? "delivery" : "invoice"}
          onCancel={() => onMode("view")}
          onDeliver={onDeliver}
          onInvoice={onInvoice}
        />
      ) : doc ? (
        <ChildDocView order={order} doc={doc} />
      ) : (
        <>
          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
            <NextStep
              order={order}
              canDeliver={canDeliver}
              canInvoice={canInvoice}
              onApprove={onApprove}
              onReject={onReject}
              onDeliver={() => onMode("deliver")}
              onInvoice={() => onMode("invoice")}
              onEdit={onEdit}
            />

            <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
              <Journey order={order} />
            </div>

            <LinesBlock order={order} totals={totals} />
            <DocsBlock order={order} onOpen={setDoc} />
            <DetailsBlock order={order} canEdit={canEdit} onEdit={onEdit} />
            <FilesBlock order={order} onAttach={onAttach} />
            <ActivityBlock order={order} />
          </div>
          <Composer onSend={onComment} />
        </>
      )}

      <Dialog
        open={cancelOpen}
        size="sm"
        eyebrow={order.no}
        title="Cancel this order?"
        onClose={() => setCancelOpen(false)}
        foot={
          <>
            <button type="button" className={GHOST} onClick={() => setCancelOpen(false)}>
              Keep it
            </button>
            <button
              type="button"
              className={DANGER_BTN}
              onClick={() => {
                if (!cancelReason.trim()) return;
                onCancelOrder(cancelReason.trim());
                setCancelOpen(false);
                setCancelReason("");
              }}
            >
              Cancel order
            </button>
          </>
        }
      >
        <Field label="Reason" required hint="Shown on the order and in its history.">
          <textarea autoFocus value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className={cn(TEXTAREA, "min-h-[64px]")} placeholder="Customer withdrew, duplicate…" />
        </Field>
      </Dialog>
    </section>
  );
}

export const Dot = () => <span aria-hidden className="size-[3px] rounded-bz-pill bg-bz-line" />;

// ── Next step ───────────────────────────────────────────────────────────────

function NextStep({
  order,
  canDeliver,
  canInvoice,
  onApprove,
  onReject,
  onDeliver,
  onInvoice,
  onEdit,
}: {
  order: Order;
  canDeliver: boolean;
  canInvoice: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onDeliver: () => void;
  onInvoice: () => void;
  onEdit: () => void;
}) {
  const stage = stageOf(order);
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [refusal, setRefusal] = React.useState<string | null>(null);
  React.useEffect(() => {
    setRejecting(false);
    setReason("");
    setRefusal(null);
  }, [order.id]);

  const loc = locationById(order.locationId)?.name;
  const openLines = order.lines.filter((l) => remainingToDeliver(l) - pendingOn(order, l, "delivery") > 0);
  const openUnits = openLines.reduce((s, l) => s + remainingToDeliver(l) - pendingOn(order, l, "delivery"), 0);
  const lots = openLines.filter((l) => itemById(l.itemId)?.lotTracked).length;
  const billable = order.lines.reduce((s, l) => s + lineNet({ ...l, qty: Math.max(0, readyToInvoice(l) - pendingOn(order, l, "invoice")) }), 0);

  let icon: React.ReactNode;
  let title: React.ReactNode;
  let sub: React.ReactNode = null;
  let actions: React.ReactNode = null;
  let tone: "plain" | "danger" | "quiet" = "plain";

  if (stage === "approval" && order.approval.state === "pending") {
    const days = daysBetween(order.approval.since, TODAY);
    const approver = personById(order.approval.approverId);
    const discounted = order.lines.filter((l) => l.discountPct > 0);
    const why = discounted.length ? discounted.map((l) => `${l.discountPct}% off ${itemById(l.itemId)?.name}`).join(" · ") : null;
    icon = <ShieldCheck size={15} />;
    if (needsMyApproval(order)) {
      title = "Waiting on your approval";
      sub = (
        <>
          {order.approval.stateName} · {days === 0 ? "today" : `${days}d`}
          {why && <span className="block text-bz-text">{why}</span>}
        </>
      );
      actions = rejecting ? null : (
        <>
          <button type="button" className={GHOST_SM} onClick={() => setRejecting(true)}>
            Reject
          </button>
          <button type="button" className={cn(BTN, "h-8")} onClick={onApprove}>
            <CheckIcon size={13} /> Approve <Kbd>A</Kbd>
          </button>
        </>
      );
    } else {
      title = (
        <span className="inline-flex items-center gap-1.5">
          Waiting on <Avatar person={approver} size={16} /> {approver?.name}
        </span>
      );
      sub = `${order.approval.stateName} · ${days === 0 ? "since today" : `${days} days`}`;
      tone = "quiet";
    }
  } else if (stage === "rejected" && order.approval.state === "rejected") {
    icon = <Ban size={15} />;
    title = `Rejected by ${personById(order.approval.byId)?.name} · ${fmtShort(order.approval.on)}`;
    sub = <span className="text-bz-text">“{order.approval.reason}”</span>;
    tone = "danger";
    actions = (
      <button type="button" className={cn(BTN, "h-8")} onClick={onEdit}>
        <Pencil size={12} /> Revise and resubmit
      </button>
    );
  } else if (canDeliver) {
    icon = <Truck size={15} />;
    title = stage === "delivering" ? `${openLines.length} line${openLines.length === 1 ? "" : "s"} still to deliver` : "Ready to deliver";
    sub = `${openLines.map((l) => `${fmtQty(remainingToDeliver(l) - pendingOn(order, l, "delivery"))} ${itemById(l.itemId)?.unit}`).join(" + ")} from ${loc}${lots ? ` · ${lots} need lots picked` : ""}`;
    actions = (
      <>
        {canInvoice && (
          <button type="button" className={GHOST_SM} onClick={onInvoice}>
            Invoice delivered
          </button>
        )}
        <button type="button" className={cn(BTN, "h-8")} onClick={onDeliver}>
          <Truck size={13} /> {stage === "delivering" ? "Deliver the rest" : "Deliver"} <Kbd>D</Kbd>
        </button>
      </>
    );
  } else if (canInvoice) {
    icon = <ReceiptText size={15} />;
    title = "Ready to invoice";
    sub = (
      <>
        <Amount value={billable} currency={order.currency} /> delivered and not billed
      </>
    );
    actions = (
      <button type="button" className={cn(BTN, "h-8")} onClick={onInvoice}>
        <ReceiptText size={13} /> Invoice <Kbd>I</Kbd>
      </button>
    );
  } else if (stage === "complete") {
    icon = <CircleCheck size={15} />;
    title = "Delivered and invoiced";
    tone = "quiet";
  } else if (stage === "cancelled" && order.cancelled) {
    icon = <Ban size={15} />;
    title = `Cancelled · ${fmtShort(order.cancelled.on)}`;
    sub = `“${order.cancelled.reason}”`;
    tone = "quiet";
  } else if (stage === "closed") {
    const never = order.lines.reduce((s, l) => s + remainingToDeliver(l), 0);
    icon = <Archive size={15} />;
    title = "Closed";
    sub = never ? `${fmtQty(never)} units were never delivered` : null;
    tone = "quiet";
  } else {
    // Everything open is already on a document awaiting approval.
    const pending = order.docs.filter((d) => d.state === "pending");
    icon = <Clock3 size={15} />;
    title = pending.length ? `Waiting on ${pending.map((d) => d.no).join(", ")}` : "Nothing left to do";
    sub = pending.length ? "Everything left is on it. It moves when that document is approved." : null;
    tone = "quiet";
  }

  return (
    <div className="px-5 pt-4">
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-bz-lg border px-3.5 py-3",
          tone === "danger" ? "border-transparent bg-bz-red-soft" : tone === "quiet" ? "border-bz-line-soft bg-bz-paper" : "border-bz-line bg-bz-paper",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-bz-md",
            tone === "danger" ? "bg-bz-surface/60 text-bz-red" : stageOf(order) === "complete" ? "bg-bz-fire/20 text-bz-text" : "bg-bz-paper-warm text-bz-text-muted",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("m-0 text-[12.5px] font-semibold", tone === "danger" ? "text-bz-red" : "text-bz-text")}>{title}</p>
          {sub && <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{sub}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        {rejecting && (
          <div className="flex w-full flex-col gap-2">
            <textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why? The rep sees this on the order." className={cn(TEXTAREA, "min-h-[56px] bg-bz-surface")} />
            {refusal && <Refusal text={refusal} onDismiss={() => setRefusal(null)} />}
            <div className="flex items-center justify-end gap-2">
              <button type="button" className={GHOST_SM} onClick={() => setRejecting(false)}>
                Back
              </button>
              <button
                type="button"
                className={cn(DANGER_BTN, "h-8")}
                onClick={() => (reason.trim() ? onReject(reason.trim()) : setRefusal("Give a reason so the rep can revise the order."))}
              >
                Reject order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Approval · delivered · invoiced as ONE statline — context, not tiles. */
function Journey({ order }: { order: Order }) {
  const p = progressOf(order);
  const stage = stageOf(order);
  const a = order.approval;
  const qty = order.lines.reduce((s, l) => s + l.qty, 0);
  const del = order.lines.reduce((s, l) => s + Math.min(l.delivered, l.qty), 0);
  const inv = order.lines.reduce((s, l) => s + Math.min(l.invoiced, l.qty), 0);
  const blocked = stage === "approval" || stage === "rejected";
  return (
    <Statline className="pt-3">
      <Stat
        label="Approval"
        value={
          a.state === "approved" ? (
            <span className="inline-flex items-center gap-1">
              <CheckIcon size={12} className="text-bz-pos-deep" /> {personById(a.byId)?.name.split(" ")[0]}
            </span>
          ) : a.state === "pending" ? (
            a.stateName
          ) : a.state === "rejected" ? (
            "Rejected"
          ) : (
            "Not required"
          )
        }
        danger={a.state === "rejected"}
      />
      <Stat label="Delivered" value={blocked ? "—" : `${p.deliveredPct}%`} meter={blocked ? undefined : p.deliveredPct} sub={blocked ? undefined : `${fmtQty(del)}/${fmtQty(qty)}`} />
      <Stat label="Invoiced" value={blocked ? "—" : `${p.invoicedPct}%`} meter={blocked ? undefined : p.invoicedPct} sub={blocked ? undefined : `${fmtQty(inv)}/${fmtQty(qty)}`} />
      {isLate(order) && <Stat label="Expected" value={<ExpectedMark o={order} />} />}
    </Statline>
  );
}

// ── Blocks ──────────────────────────────────────────────────────────────────

export function Block({ title, count, right, children }: { title: string; count?: number; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-bz-line-soft px-5 py-4 last:border-0">
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h3>
        {count !== undefined && <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{count}</span>}
        {right && <div className="ml-auto flex items-center gap-1.5">{right}</div>}
      </div>
      {children}
    </section>
  );
}

function LinesBlock({ order, totals }: { order: Order; totals: ReturnType<typeof totalsOf> }) {
  const [detail, setDetail] = React.useState<"summary" | "detail">("summary");
  const [open, setOpen] = React.useState<string | null>(null);
  const detailed = detail === "detail";
  const cols = detailed
    ? "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_64px_92px_56px_64px_108px]"
    : "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_64px_100px_116px]";
  const blocked = ["approval", "rejected"].includes(stageOf(order));

  return (
    <Block
      title="Lines"
      count={order.lines.length}
      right={
        <Segmented
          size="sm"
          value={detail}
          onChange={setDetail}
          options={[
            { value: "summary", label: "Summary" },
            { value: "detail", label: "Tax & discount" },
          ]}
        />
      }
    >
      <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
        <div className={cn("hidden items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", cols, LABEL)}>
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          {detailed && <span className="text-right">Disc</span>}
          {detailed && <span className="text-right">Tax</span>}
          <span className="text-right">Net</span>
        </div>
        {order.lines.map((l) => {
          const it = itemById(l.itemId)!;
          const pend = pendingOn(order, l, "delivery");
          const isOpen = open === l.id;
          return (
            <div key={l.id} className="border-b border-bz-line-soft last:border-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : l.id)}
                className={cn("grid w-full items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-bz-paper-warm", cols, isOpen && "bg-bz-paper-warm")}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <ChevronRight size={11} className={cn("shrink-0 text-bz-text-soft transition-transform", isOpen && "rotate-90")} />
                    <span className="truncate text-[12.5px] text-bz-text">{it.name}</span>
                  </span>
                  <span className={cn("ml-[17px] block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                    {it.code}
                    {!blocked && Object.keys(it.onHand).length > 0 && (
                      <>
                        {" · "}
                        <span className={l.delivered >= l.qty ? "text-bz-pos-deep" : l.delivered > 0 ? "text-bz-text-muted" : ""}>
                          {fmtQty(Math.min(l.delivered, l.qty))} of {fmtQty(l.qty)} delivered
                        </span>
                        {" · "}
                        {fmtQty(Math.min(l.invoiced, l.qty))} invoiced
                        {pend > 0 && <span className="text-bz-text-muted"> · +{fmtQty(pend)} awaiting approval</span>}
                      </>
                    )}
                    {!blocked && Object.keys(it.onHand).length === 0 && <> · service · {fmtQty(Math.min(l.invoiced, l.qty))} invoiced</>}
                  </span>
                </span>
                <span className={cn("hidden text-right text-[12.5px] text-bz-text sm:block", NUM)}>
                  {fmtQty(l.qty)} <span className="text-[10.5px] text-bz-text-soft">{it.unit}</span>
                </span>
                <span className="hidden text-right text-[12.5px] text-bz-text sm:block">
                  <Amount value={l.rate} />
                </span>
                {detailed && <span className={cn("hidden text-right text-[12px] sm:block", NUM, l.discountPct ? "text-bz-text" : "text-bz-text-soft")}>{l.discountPct ? `${l.discountPct}%` : "—"}</span>}
                {detailed && <span className="hidden text-right text-[11.5px] text-bz-text-muted sm:block">{TAX_LABEL[l.tax].replace("VAT ", "")}</span>}
                <span className="text-right text-[12.5px] font-semibold text-bz-text">
                  <Amount value={lineNet(l)} />
                  <span className={cn("block text-[10.5px] font-normal text-bz-text-soft sm:hidden", NUM)}>
                    {fmtQty(l.qty)} {it.unit} × <Amount value={l.rate} className="text-bz-text-soft" />
                  </span>
                </span>
              </button>
              {isOpen && <LineBreakdown order={order} line={l} />}
            </div>
          );
        })}
      </div>

      <dl className="ml-auto mt-3 grid w-full max-w-[300px] grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-[12px]">
        <dt className="text-bz-text-muted">Subtotal</dt>
        <dd className="m-0 text-right text-bz-text">
          <Amount value={totals.subtotal} />
        </dd>
        {totals.discount > 0 && (
          <>
            <dt className="text-bz-text-muted">Discount</dt>
            <dd className="m-0 text-right text-bz-text">
              −<Amount value={totals.discount} />
            </dd>
          </>
        )}
        <dt className="text-bz-text-muted">VAT 13% on <Amount value={totals.taxable} className="text-bz-text-muted" /></dt>
        <dd className="m-0 text-right text-bz-text">
          <Amount value={totals.tax} />
        </dd>
        <dt className="mt-1 border-t border-bz-line-soft pt-2 text-[12.5px] font-semibold text-bz-text">Total</dt>
        <dd className="m-0 mt-1 border-t border-bz-line-soft pt-2 text-right text-[13px] font-semibold text-bz-text">
          <Amount value={totals.total} currency={order.currency} />
        </dd>
        {order.currency !== "NPR" && (
          <dd className="col-span-2 m-0 text-right text-[10.5px] text-bz-text-soft">
            ≈ <Amount value={totals.total * order.exchangeRate} currency="NPR" /> at {order.exchangeRate}
          </dd>
        )}
        {order.advance > 0 && (
          <>
            <dt className="text-bz-text-muted">Advance received</dt>
            <dd className="m-0 text-right text-bz-text">
              −<Amount value={order.advance} />
            </dd>
            <dt className="font-semibold text-bz-text">Balance</dt>
            <dd className="m-0 text-right font-semibold text-bz-text">
              <Amount value={totals.total - order.advance} />
            </dd>
          </>
        )}
      </dl>
    </Block>
  );
}

function LineBreakdown({ order, line }: { order: Order; line: OrderLine }) {
  const customer = customerById(order.customerId)!;
  const docs = order.docs.filter((d) => d.lines.some((x) => x.lineId === line.id));
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 bg-bz-paper px-3 pb-3 pl-[29px] pt-1 text-[11.5px] sm:grid-cols-4">
      <KV label="Price level" value={customer.priceLevel} />
      <KV label="Gross" value={<Amount value={lineGross(line)} />} />
      <KV label="Discount" value={line.discountPct ? <><Amount value={lineDiscount(line)} /> <span className="text-bz-text-soft">({line.discountPct}%)</span></> : "—"} />
      <KV label={TAX_LABEL[line.tax]} value={<Amount value={lineTax(line)} />} />
      {line.description && <KV label="Description" value={line.description} className="col-span-full" />}
      {docs.length > 0 && (
        <div className="col-span-full flex flex-wrap items-center gap-1.5">
          <span className={LABEL}>On</span>
          {docs.map((d) => (
            <DocLink key={d.id} no={`${d.no} · ${fmtQty(d.lines.find((x) => x.lineId === line.id)!.qty)}`} kind={d.state === "pending" ? "awaiting approval" : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

export function KV({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className={cn(LABEL, "m-0 mb-0.5")}>{label}</p>
      <p className="m-0 truncate text-bz-text">{value}</p>
    </div>
  );
}

const docValue = (order: Order, d: ChildDoc) =>
  d.lines.reduce((s, x) => {
    const l = order.lines.find((y) => y.id === x.lineId);
    return l ? s + lineNet({ ...l, qty: x.qty }) : s;
  }, 0);

function DocsBlock({ order, onOpen }: { order: Order; onOpen: (d: ChildDoc) => void }) {
  const docs = [...order.docs].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <Block title="Documents" count={docs.length + (order.source ? 1 : 0)}>
      {docs.length === 0 && !order.source && <p className="m-0 text-[11.5px] text-bz-text-soft">No deliveries or invoices yet.</p>}
      <div className="flex flex-col gap-1.5">
        {order.source && (
          <SourceRow no={order.source.no} kind={order.source.kind} />
        )}
        {docs.map((d) => {
          const units = d.lines.reduce((s, x) => s + x.qty, 0);
          return (
            <DocRow
              key={d.id}
              icon={d.kind === "delivery" ? Truck : ReceiptText}
              no={d.no}
              kind={d.kind === "delivery" ? "Delivery" : "Invoice"}
              meta={
                <>
                  <span className={NUM}>{fmtShort(d.date)}</span>
                  {d.lines.length > 0 && (
                    <>
                      {" · "}
                      {d.kind === "delivery" ? (
                        `${d.lines.length} line${d.lines.length === 1 ? "" : "s"} · ${fmtQty(units)} units`
                      ) : (
                        <Amount value={docValue(order, d)} />
                      )}
                    </>
                  )}
                </>
              }
              chip={d.state === "pending" ? <Chip tone="pending">Awaiting approval</Chip> : <Chip tone="positive">Approved</Chip>}
              onClick={() => onOpen(d)}
            />
          );
        })}
      </div>
    </Block>
  );
}

export function DocRow({
  icon: Icon,
  no,
  kind,
  meta,
  chip,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  no: string;
  kind: string;
  meta: React.ReactNode;
  chip: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-2 text-left transition-colors hover:border-bz-line hover:bg-bz-paper-warm"
    >
      <Icon size={13} className="shrink-0 text-bz-text-muted" />
      <span className={cn("text-[12px] font-semibold text-bz-text", NUM)}>{no}</span>
      <span className="text-[11.5px] text-bz-text-soft">{kind}</span>
      <span className="min-w-0 flex-1 truncate text-[11.5px] text-bz-text-muted">{meta}</span>
      {chip}
      <ChevronRight size={13} className="shrink-0 text-bz-text-soft group-hover:text-bz-text" />
    </button>
  );
}

function DetailsBlock({ order, canEdit, onEdit }: { order: Order; canEdit: boolean; onEdit: () => void }) {
  const customer = customerById(order.customerId)!;
  const term = termById(order.termId);
  const rep = order.repId ? personById(order.repId) : undefined;
  const dims = Object.entries(order.dims).filter(([, v]) => !!v) as [string, string][];
  const DIM_LABEL: Record<string, string> = { department: "Department", class: "Class", project: "Project", partner: "Partner" };
  return (
    <Block
      title="Details"
      right={
        canEdit && (
          <button type="button" className={GHOST_SM} onClick={onEdit}>
            <Pencil size={11} /> Edit <Kbd>E</Kbd>
          </button>
        )
      }
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-line-soft sm:grid-cols-2">
        <Cell label="Customer">
          {customer.name}
          <span className="block text-[10.5px] text-bz-text-soft">
            {customer.code} · PAN {customer.pan}
          </span>
        </Cell>
        <Cell label="Payment term">
          {term?.name}
          <span className="block text-[10.5px] text-bz-text-soft">Invoices fall due {term?.days ? `${term.days} days after they are raised` : "on receipt"}</span>
        </Cell>
        <Cell label="Sales rep">
          {rep ? (
            <span className="inline-flex items-center gap-1.5">
              <Avatar person={rep} size={18} /> {rep.name}
            </span>
          ) : (
            <span className="text-bz-text-soft">—</span>
          )}
        </Cell>
        <Cell label="Deliver from">{locationById(order.locationId)?.name}</Cell>
        <Cell label="Order date">
          <span className={NUM}>{fmtShort(order.date)}, {order.date.slice(0, 4)}</span>
        </Cell>
        <Cell label="Expected delivery">
          {order.expected ? (
            <span className="inline-flex items-center gap-2">
              <span className={NUM}>{fmtShort(order.expected)}</span>
              {isLate(order) && <ExpectedMark o={order} />}
            </span>
          ) : (
            <span className="text-bz-text-soft">—</span>
          )}
        </Cell>
        <Cell label="Currency">
          {order.currency}
          {order.currency !== "NPR" && <span className={cn("ml-1 text-bz-text-soft", NUM)}>@ {order.exchangeRate}</span>}
        </Cell>
        <Cell label="Customer PO">{order.customerPo ?? <span className="text-bz-text-soft">—</span>}</Cell>
        {dims.map(([k, v]) => (
          <Cell key={k} label={DIM_LABEL[k]}>
            {v}
          </Cell>
        ))}
        {order.memo && (
          <Cell label="Memo" wide>
            <span className="whitespace-pre-wrap leading-relaxed">{order.memo}</span>
          </Cell>
        )}
      </div>
      {dims.length < 4 && canEdit && (
        <p className="m-0 mt-2 text-[10.5px] text-bz-text-soft">
          {4 - dims.length} dimension{4 - dims.length === 1 ? "" : "s"} not set ·{" "}
          <button type="button" className="font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={onEdit}>
            Set in edit
          </button>
        </p>
      )}
    </Block>
  );
}

export function Cell({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("min-w-0 bg-bz-surface px-3 py-2.5", wide && "sm:col-span-2")}>
      <p className={cn(LABEL, "m-0 mb-1")}>{label}</p>
      <div className="text-[12px] text-bz-text">{children}</div>
    </div>
  );
}

function FilesBlock({ order, onAttach }: { order: Order; onAttach: () => void }) {
  return (
    <Block
      title="Files"
      count={order.attachments.length}
      right={
        <button type="button" className={GHOST_SM} onClick={onAttach}>
          <Plus size={11} /> Add file
        </button>
      }
    >
      {order.attachments.length === 0 ? (
        <button type="button" onClick={onAttach} className="w-full rounded-bz-md border border-dashed border-bz-line px-3 py-3 text-[11.5px] text-bz-text-soft hover:border-bz-text-soft hover:text-bz-text-muted">
          Drop the customer's PO or drawings here
        </button>
      ) : (
        <div className="flex flex-col">
          {order.attachments.map((f) => (
            <div key={f.name} className="group flex items-center gap-2 rounded-bz-sm px-1 py-1.5 hover:bg-bz-paper-warm">
              <Paperclip size={12} className="shrink-0 text-bz-text-soft" />
              <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">{f.name}</span>
              <span className={cn("text-[10.5px] text-bz-text-soft", NUM)}>{f.size}</span>
              <button type="button" className={cn(PLAIN_BTN, "opacity-0 group-hover:opacity-100")} aria-label="Remove file">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Block>
  );
}

const MONTH: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const whenKey = (w: string) => {
  const m = /^(\w{3}) (\d+), (\d+):(\d+)/.exec(w);
  if (!m) return w === "Just now" ? 99_99_99_99 : 0;
  return MONTH[m[1]] * 1_000_000 + Number(m[2]) * 10_000 + Number(m[3]) * 100 + Number(m[4]);
};

function ActivityBlock({ order }: { order: Order }) {
  const [show, setShow] = React.useState<"all" | "comments" | "history">("all");
  const items = [
    ...order.comments.map((c) => ({ kind: "comment" as const, key: c.id, when: c.when, whoId: c.authorId, body: c.body })),
    ...order.history.map((h) => ({ kind: "history" as const, key: h.id, when: h.when, whoId: h.whoId, body: h.what })),
  ]
    .filter((x) => show === "all" || (show === "comments" ? x.kind === "comment" : x.kind === "history"))
    .sort((a, b) => whenKey(a.when) - whenKey(b.when));

  return (
    <Block
      title="Activity"
      right={
        <Segmented
          size="sm"
          value={show}
          onChange={setShow}
          options={[
            { value: "all", label: "All" },
            { value: "comments", label: "Comments", count: order.comments.length },
            { value: "history", label: "History" },
          ]}
        />
      }
    >
      {items.length === 0 && <p className="m-0 text-[11.5px] text-bz-text-soft">{show === "comments" ? "No comments yet." : "Nothing yet."}</p>}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((x) =>
          x.kind === "comment" ? (
            <li key={x.key} className="flex gap-2.5">
              <Avatar person={personById(x.whoId)} size={22} />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[11.5px]">
                  <span className="font-semibold text-bz-text">{personById(x.whoId)?.name}</span>
                  <span className={cn("ml-2 text-bz-text-soft", NUM)}>{x.when}</span>
                </p>
                <p className="m-0 mt-0.5 whitespace-pre-wrap text-[12px] leading-relaxed text-bz-text">{renderMentions(x.body)}</p>
              </div>
            </li>
          ) : (
            <li key={x.key} className="flex items-center gap-2.5 pl-[7px] text-[11.5px] text-bz-text-muted">
              <span className="size-2 shrink-0 rounded-bz-pill border border-bz-line bg-bz-surface" />
              <span className="min-w-0 flex-1">
                <span className="font-medium text-bz-text">{personById(x.whoId)?.name}</span> {x.body}
              </span>
              <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{x.when}</span>
            </li>
          ),
        )}
      </ol>
    </Block>
  );
}

/** `@Name` renders as a person tag. needs: order comments to carry mention tokens (USER_NOTE is plain text today). */
function renderMentions(body: string) {
  const parts = body.split(/(@[A-Z][a-z]+(?: [A-Z][a-z]+)?)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="rounded-bz-sm bg-bz-fire/20 px-1 font-medium text-bz-text">
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

function Composer({ onSend }: { onSend: (body: string) => void }) {
  const [body, setBody] = React.useState("");
  const send = () => {
    if (!body.trim()) return;
    onSend(body.trim());
    setBody("");
  };
  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-bz-line-soft bg-bz-paper px-5 py-2.5">
      <Avatar person={ME} size={24} />
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
        placeholder="Comment… @ to mention"
        className="h-8 min-w-0 flex-1 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft hover:border-bz-text-soft focus:border-bz-text-muted"
      />
      <button type="button" onClick={send} disabled={!body.trim()} className={cn(BTN, "h-8 px-3")}>
        <Send size={12} /> Send
      </button>
    </div>
  );
}

// ── A child document, read inside the panel (the back arrow returns) ────────

function ChildDocView({ order, doc }: { order: Order; doc: ChildDoc }) {
  const navigate = useNavigate();
  const by = personById(doc.byId);
  const rows = doc.lines.map((x) => ({ x, l: order.lines.find((l) => l.id === x.lineId) })).filter((r): r is { x: { lineId: string; qty: number }; l: OrderLine } => !!r.l);
  const total = rows.reduce((s, r) => s + lineNet({ ...r.l, qty: r.x.qty }), 0);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="px-5 pt-4">
        <div className="flex items-center gap-2">
          {doc.kind === "delivery" ? <Truck size={15} className="text-bz-text-muted" /> : <ReceiptText size={15} className="text-bz-text-muted" />}
          <span className={cn("text-[15px] font-semibold text-bz-text", NUM)}>{doc.no}</span>
          {doc.state === "pending" ? <Chip tone="pending">Awaiting approval</Chip> : <Chip tone="positive">Approved</Chip>}
          <button type="button" className={cn(GHOST_SM, "ml-auto")} onClick={() => navigate(hrefFor(doc.no))}>
            Open full record <ArrowUpRight size={11} />
          </button>
        </div>
        <p className="m-0 mt-1 text-[11.5px] text-bz-text-muted">
          {doc.kind === "delivery" ? "Delivered" : "Invoiced"} {fmtShort(doc.date)} by {by?.name}
          {doc.locationId && ` · from ${locationById(doc.locationId)?.name}`}
        </p>
        {doc.state === "pending" && (
          <p className="m-0 mt-2 rounded-bz-md bg-bz-paper-warm px-3 py-2 text-[11.5px] text-bz-text-muted">
            <Lock size={11} className="mr-1 inline align-[-1px]" />
            {doc.kind === "delivery" ? "Stock moves when this delivery is approved." : "Posts to the ledger when this invoice is approved."}
          </p>
        )}
      </div>
      <div className="px-5 py-4">
        {rows.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Line detail is on the full record.</p>
        ) : (
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
            <div className={cn("grid grid-cols-[minmax(0,1fr)_80px_120px] gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5", LABEL)}>
              <span>Item</span>
              <span className="text-right">Qty</span>
              <span className="text-right">{doc.kind === "invoice" ? "Net" : "Of ordered"}</span>
            </div>
            {rows.map(({ x, l }) => (
              <div key={x.lineId} className="grid grid-cols-[minmax(0,1fr)_80px_120px] gap-3 border-b border-bz-line-soft px-3 py-2 text-[12.5px] last:border-0">
                <span className="truncate text-bz-text">{itemById(l.itemId)?.name}</span>
                <span className={cn("text-right text-bz-text", NUM)}>{fmtQty(x.qty)}</span>
                <span className={cn("text-right text-bz-text-muted", NUM)}>{doc.kind === "invoice" ? <Amount value={lineNet({ ...l, qty: x.qty })} /> : `${fmtQty(l.qty)}`}</span>
              </div>
            ))}
          </div>
        )}
        {doc.kind === "invoice" && rows.length > 0 && (
          <p className="m-0 mt-3 text-right text-[13px] font-semibold text-bz-text">
            <Amount value={total} currency={order.currency} />
          </p>
        )}
      </div>
    </div>
  );
}


function SourceRow({ no, kind }: { no: string; kind: string }) {
  const navigate = useNavigate();
  return <DocRow icon={FileText} no={no} kind={kind} meta="Source" chip={<Chip tone="neutral" dot={false}>Converted</Chip>} onClick={() => navigate(hrefFor(no))} />;
}
