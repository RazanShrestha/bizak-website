import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowRight, ChevronDown, Gift, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, DANGER_BTN, Dialog, Field, GHOST, GHOST_SM, MenuItem, NUM, NumberField, PLAIN_BTN, Popover, SearchField, TEXTAREA } from "../sales/bzw";
import { useStore } from "../sales/store";
import { REPS } from "./data";
import type { HubOrder, HubStatus, Source } from "./data";
import { customerById, dayTime, evaluate, npr, priceFor, productById, typeOf } from "./engine";
import { hubStore, schemesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, EmptyNote, Fact, List, Money, Page, PageIntro, ProductThumb, Progress, Row, SidePanel, TextTabs, TypeMark, idColor } from "./ui";
import { Block, HistoryAndNotes, SOURCE_NAME, STATUS_META, TotalRow, approveHubOrder, creditStops, reasonsFor, rejectHubOrder, saveQuantities, schemesOnLine, soOnDesk } from "./orders-parts";

// ════════════════════════════════════════════════════════════════════════════
// ORDERS HUB — every channel's orders in one queue (blueprint §4.3)
//
// A rep's order, a dealer's portal order, a WhatsApp order typed in by the
// office and a retailer-app order all wait here, priced by the one engine.
// What needs a person comes first; what passes every check is one click (or
// one bulk click) from being an ordinary sales order on the sales desk.
// ════════════════════════════════════════════════════════════════════════════

type Tab = HubStatus | "all";
const TABS: { value: Tab; label: string }[] = [
  { value: "review", label: "Needs review" },
  { value: "ready", label: "Ready" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];
const SOURCES = Object.keys(SOURCE_NAME) as Source[];

type Notice = { text: string; link?: { to: string; label: string } };

export function OrdersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  const [tab, setTab] = React.useState<Tab>(() => (hub.some((o) => o.status === "review") ? "review" : "all"));
  const [q, setQ] = React.useState("");
  const [source, setSource] = React.useState<Source | "all">("all");
  const [srcOpen, setSrcOpen] = React.useState(false);
  const srcRef = React.useRef<HTMLButtonElement>(null);
  const [notice, setNotice] = React.useState<Notice | null>(null);

  const rows = React.useMemo(
    () =>
      hub
        .map((o) => {
          const ev = evaluate(o.customerId, o.lines, schemes);
          const c = customerById(o.customerId);
          return { o, ev, c, t: typeOf(c), reasons: reasonsFor(o, ev, hub) };
        })
        .sort((a, b) => b.o.at.localeCompare(a.o.at)),
    [hub, schemes],
  );

  const needle = q.trim().toLowerCase();
  const filtered = rows.filter(
    (r) => (source === "all" || r.o.source === source) && (!needle || `${r.c?.name ?? ""} ${r.o.id} ${r.o.byName} ${r.c?.city ?? ""} ${r.o.soNo ?? ""}`.toLowerCase().includes(needle)),
  );
  const count = (s: HubStatus) => filtered.filter((r) => r.o.status === s).length;
  const shown = filtered.filter((r) => tab === "all" || r.o.status === tab);
  const review = rows.filter((r) => r.o.status === "review");
  const waiting = rows.filter((r) => r.o.status === "review" || r.o.status === "ready").reduce((s, r) => s + r.ev.total, 0);
  const readyShown = shown.filter((r) => r.o.status === "ready");

  const open = id ? hub.find((o) => o.id === id) : undefined;
  const go = (orderId: string | null) => navigate(sfPath(orderId ? `orders/${orderId}` : "orders"));

  const quickApprove = (o: HubOrder) => {
    if (creditStops(evaluate(o.customerId, o.lines, schemes))) return go(o.id);
    const no = approveHubOrder(o);
    setNotice({ text: `${o.id} approved as ${no}.`, link: { to: `/design/sales/orders/${no}`, label: "Open sales order" } });
  };

  const approveAllReady = () => {
    const pass = readyShown.filter((r) => !creditStops(r.ev));
    const held = readyShown.length - pass.length;
    const nos = pass.map((r) => approveHubOrder(r.o));
    if (!nos.length) return setNotice({ text: "None approved — every ready order is over credit. Open each to decide." });
    setNotice({
      text: `${nos.length} ${nos.length === 1 ? "order" : "orders"} approved as ${nos.length === 1 ? nos[0] : `${nos[0]} to ${nos[nos.length - 1]}`}.${held ? ` ${held} left — over credit.` : ""}`,
      link: { to: nos.length === 1 ? `/design/sales/orders/${nos[0]}` : "/design/sales/orders", label: nos.length === 1 ? "Open sales order" : "Open sales orders" },
    });
  };

  return (
    <SfShell page="orders" panel={open ? <HubPanel key={open.id} order={open} onClose={() => go(null)} /> : null}>
      <Page width="full">
        <PageIntro>
          {review.length ? `${review.length} ${review.length === 1 ? "order needs" : "orders need"} you` : "Nothing needs review"} · NPR {npr(waiting)} waiting
        </PageIntro>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <TextTabs<Tab>
            value={tab}
            onChange={setTab}
            options={TABS.map((t) => ({ ...t, count: t.value === "all" ? filtered.length : count(t.value), danger: t.value === "review" }))}
          />
          <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
            <SearchField value={q} onChange={setQ} placeholder="Search orders" className="min-w-0 flex-1 sm:w-[220px] sm:flex-none" />
            <button ref={srcRef} type="button" onClick={() => setSrcOpen(true)} className={cn(GHOST_SM, "shrink-0", source !== "all" && "border-bz-text-soft")} aria-haspopup="menu">
              {source === "all" ? "All sources" : SOURCE_NAME[source]} <ChevronDown size={12} className="text-bz-text-soft" />
            </button>
            <Popover open={srcOpen} anchor={srcRef.current} onClose={() => setSrcOpen(false)} align="right" width={220} className="p-1.5">
              {(["all", ...SOURCES] as const).map((s) => (
                <MenuItem key={s} active={source === s} onClick={() => (setSource(s), setSrcOpen(false))}>
                  {s === "all" ? "All sources" : SOURCE_NAME[s]}
                  <span className={cn("ml-1.5 text-[11px] text-bz-text-soft", NUM)}>{s === "all" ? rows.length : rows.filter((r) => r.o.source === s).length}</span>
                </MenuItem>
              ))}
            </Popover>
          </div>
        </div>

        {notice && (
          <p className="m-0 mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-bz-text-muted" role="status">
            <Dot tone="good">{notice.text}</Dot>
            {notice.link && (
              <Link to={notice.link.to} className="inline-flex items-center gap-1 font-medium text-bz-text underline-offset-2 hover:underline">
                {notice.link.label} <ArrowRight size={12} />
              </Link>
            )}
            <button type="button" onClick={() => setNotice(null)} className={cn(PLAIN_BTN, "ml-auto")} aria-label="Dismiss">
              <X size={12} />
            </button>
          </p>
        )}

        {tab === "ready" && readyShown.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-[11.5px] text-bz-text-soft">
              {readyShown.length} {readyShown.length === 1 ? "order passes" : "orders pass"} every check · NPR {npr(readyShown.reduce((s, r) => s + r.ev.total, 0))}
            </span>
            <button type="button" onClick={approveAllReady} className={cn(GHOST_SM, "ml-auto")}>
              Approve all ready
            </button>
          </div>
        )}

        <div className="mt-5">
          {shown.length === 0 ? (
            needle || source !== "all" ? (
              <EmptyNote
                action={
                  <button type="button" className={GHOST_SM} onClick={() => (setQ(""), setSource("all"))}>
                    Clear search
                  </button>
                }
              >
                No orders match.
              </EmptyNote>
            ) : (
              <EmptyNote>{tab === "review" ? "Nothing needs review." : tab === "ready" ? "No orders waiting to be approved." : `No ${tab === "all" ? "" : `${STATUS_META[tab].label.toLowerCase()} `}orders.`}</EmptyNote>
            )
          ) : (
            <List>
              {shown.map(({ o, ev, c, t, reasons }) => {
                const meta = STATUS_META[o.status];
                return (
                  <Row
                    key={o.id}
                    active={o.id === id}
                    onClick={() => go(o.id)}
                    lead={<span className="block size-2 rounded-[3px]" style={{ background: idColor(t?.color ?? 1) }} aria-hidden />}
                    title={c?.name ?? o.customerId}
                    sub={
                      <>
                        {o.status === "review" && reasons.length > 0 && <span className="text-bz-red">{reasons.map((r) => r.short).join(", ")} · </span>}
                        {o.status === "rejected" && o.rejectReason && <span>{o.rejectReason} · </span>}
                        {t?.name} · {SOURCE_NAME[o.source]} · {dayTime(o.at)}
                      </>
                    }
                    meta={[
                      <span key="id" className={cn("text-bz-text-soft", NUM)}>
                        {o.soNo ?? o.id}
                      </span>,
                      <Dot key="st" tone={meta.tone} className="w-[96px]">
                        {meta.label}
                      </Dot>,
                    ]}
                    trail={
                      <>
                        <Money value={ev.total} className="block" />
                        <Dot tone={meta.tone} className="mt-0.5 md:hidden">
                          {meta.label}
                        </Dot>
                      </>
                    }
                    action={
                      o.status === "ready" ? (
                        <button type="button" className={GHOST_SM} onClick={() => quickApprove(o)}>
                          Approve
                        </button>
                      ) : undefined
                    }
                  />
                );
              })}
            </List>
          )}
        </div>
      </Page>
    </SfShell>
  );
}

// ── The record: one hub order ───────────────────────────────────────────────

function HubPanel({ order, onClose }: { order: HubOrder; onClose: () => void }) {
  const schemes = useStore(schemesStore);
  const hub = useStore(hubStore);
  const [draft, setDraft] = React.useState<{ productId: string; qty: number }[] | null>(null);
  const [ask, setAsk] = React.useState<null | "reject" | "over">(null);
  const [reason, setReason] = React.useState("");

  const lines = draft ?? order.lines;
  const ev = evaluate(order.customerId, lines, schemes);
  const c = customerById(order.customerId);
  const t = typeOf(c);
  const parent = customerById(c?.parentId);
  const rep = REPS.find((r) => r.id === order.repId);
  const reasons = reasonsFor({ ...order, lines }, ev, hub);
  const stops = creditStops(ev);
  const pending = order.status === "review" || order.status === "ready";
  const meta = STATUS_META[order.status];
  const paid = ev.lines.filter((l) => !l.free);
  const free = ev.lines.filter((l) => l.free);
  const freeSchemes = new Set(free.map((l) => l.schemeId));
  const cr = ev.credit;
  const usedPct = cr.limit ? ((cr.outstanding + ev.total) / cr.limit) * 100 : 100;

  const closeAsk = () => (setAsk(null), setReason(""));
  const approve = () => (stops ? setAsk("over") : approveHubOrder(order));
  const confirm = () => {
    if (!reason.trim()) return;
    if (ask === "reject") rejectHubOrder(order, reason.trim());
    else approveHubOrder(order, reason.trim());
    closeAsk();
  };
  const setQty = (productId: string, qty: number) => setDraft((d) => (d ?? order.lines).map((l) => (l.productId === productId ? { ...l, qty } : l)));
  const saveDraft = () => {
    if (draft) saveQuantities(order, draft, (pid) => productById(pid).name);
    setDraft(null);
  };

  const creditLine = !cr.ok
    ? stops
      ? `${t?.plural ?? "This type"} are on a hard stop, so this order can only go through as “Approve over credit”, with a reason.`
      : "Soft stop: the order came to review. You can still approve it."
    : "Within the limit, nothing overdue.";

  const foot = draft ? (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="mr-auto text-[11px] text-bz-text-soft">Prices and schemes update as you type.</span>
      <button type="button" className={GHOST} onClick={() => setDraft(null)}>
        Cancel
      </button>
      <button type="button" className={BTN} onClick={saveDraft}>
        Save quantities
      </button>
    </div>
  ) : pending ? (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button type="button" className={cn(GHOST, "mr-auto")} onClick={() => setAsk("reject")}>
        Reject
      </button>
      {order.soNo && <span className="text-[11.5px] text-bz-text-soft">{order.soNo} waits on the sales desk</span>}
      <button type="button" className={GHOST} onClick={() => setDraft(order.lines.map((l) => ({ ...l })))}>
        Edit quantities
      </button>
      <button type="button" className={BTN} onClick={approve}>
        {stops ? "Approve over credit…" : "Approve"}
      </button>
    </div>
  ) : order.status === "approved" ? (
    <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-bz-text-muted" role="status">
      <Dot tone="good">Approved as {order.soNo} — it is now a sales order.</Dot>
      {soOnDesk(order.soNo, order.customerId) && (
        <Link to={`/design/sales/orders/${order.soNo}`} className="inline-flex items-center gap-1 font-medium text-bz-text underline-offset-2 hover:underline">
          Open sales order <ArrowRight size={12} />
        </Link>
      )}
    </p>
  ) : (
    <p className="m-0 text-[12px] text-bz-text-muted">
      <Dot tone="off">Rejected{order.rejectReason ? ` — ${order.rejectReason}` : ""}</Dot>
    </p>
  );

  return (
    <SidePanel
      open
      onClose={onClose}
      width={600}
      eyebrow={`${order.id} · ${SOURCE_NAME[order.source]} · ${dayTime(order.at)}`}
      title={c?.name ?? order.customerId}
      meta={
        <>
          {t && <TypeMark name={t.name} color={t.color} />}
          <span>{parent ? `Served by ${parent.name}` : "Billed by you"}</span>
          {c && <span>Tier {c.tier} · {c.city}</span>}
          <Dot tone={meta.tone}>{meta.label}</Dot>
        </>
      }
      foot={foot}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <Fact label="Credit limit">
          <Money value={cr.limit} />
        </Fact>
        <Fact label="Outstanding">
          <Money value={cr.outstanding} />
        </Fact>
        <Fact label="Overdue">
          <Money value={cr.overdue} className={cr.overdue > 0 ? "text-bz-red" : undefined} />
        </Fact>
        <Fact label="Available">
          <Money value={cr.available} />
        </Fact>
      </div>
      <p className="m-0 mt-4 text-[11.5px] text-bz-text-soft">
        Placed by {order.byName} through {SOURCE_NAME[order.source].toLowerCase()}
        {rep ? ` · ${rep.name} owns this customer` : ""}
      </p>

      {pending && reasons.length > 0 && (
        <ul className="m-0 mt-5 flex list-none flex-col gap-1.5 rounded-bz-md bg-bz-red-soft/60 p-3">
          {reasons.map((r) => (
            <li key={r.key}>
              <Dot tone="danger" className="whitespace-normal">
                {r.long}
              </Dot>
            </li>
          ))}
        </ul>
      )}

      <Block title="Lines" aside={draft ? "Editing quantities" : `${paid.length} ${paid.length === 1 ? "line" : "lines"}${free.length ? ` · ${free.length} free` : ""}`}>
        <ul className="m-0 list-none divide-y divide-bz-line-soft p-0">
          {(draft ?? paid.map((l) => ({ productId: l.product.id, qty: l.qty }))).map((d) => {
            const p = productById(d.productId);
            const l = paid.find((x) => x.product.id === d.productId);
            const price = l?.price ?? priceFor(p, c);
            const names = l ? schemesOnLine(l, ev, schemes) : [];
            return (
              <li key={d.productId} className={cn("flex items-center gap-3 py-2.5", d.qty === 0 && "opacity-50")}>
                {/* On a phone the stepper needs the thumbnail's room. */}
                <span className={cn("shrink-0", draft && "hidden sm:block")}>
                  <ProductThumb product={p} size={32} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[12.5px] font-medium text-bz-text">{p.name}</p>
                  <p className="m-0 mt-0.5 truncate text-[11px] text-bz-text-soft">
                    <span className={NUM}>
                      {draft ? "" : `${d.qty} ${p.unit} × `}NPR {npr(price)}
                      {draft ? ` / ${p.unit}` : ""}
                    </span>
                    {d.qty === 0 && " · removed"}
                    {names.length > 0 && (
                      <span className="text-bz-text-muted">
                        {" "}
                        · <Gift size={10} className="-mt-px inline" /> {names.join(", ")}
                      </span>
                    )}
                  </p>
                </div>
                {draft && <NumberField value={d.qty} onChange={(v) => setQty(d.productId, v)} className="w-[88px] shrink-0" ariaLabel={`Quantity of ${p.name}`} />}
                <span className={cn("w-[76px] shrink-0 text-right text-[12.5px] font-medium text-bz-text", NUM)}>
                  {npr(l?.net ?? 0)}
                  {l && l.discount > 0 && <span className="block text-[10.5px] font-normal text-bz-text-soft line-through">{npr(l.gross)}</span>}
                </span>
              </li>
            );
          })}
          {free.map((l, i) => (
            <li key={`free-${i}`} className="flex items-center gap-3 py-2.5">
              <span className={cn("shrink-0", draft && "hidden sm:block")}>
                <ProductThumb product={l.product} size={32} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[12.5px] font-medium text-bz-text">{l.product.name}</p>
                <p className="m-0 mt-0.5 truncate text-[11px] text-bz-text-soft">
                  <span className={NUM}>
                    {l.qty} {l.product.unit}
                  </span>{" "}
                  free · <Gift size={10} className="-mt-px inline" /> {schemesOnLine(l, ev, schemes).join(", ")}
                </p>
              </div>
              {draft && <span className="w-[88px] shrink-0" />}
              <span className={cn("w-[76px] shrink-0 text-right text-[12.5px] font-medium text-bz-text", NUM)}>0</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Schemes applied" aside={ev.applied.length ? String(ev.applied.length) : undefined}>
        {ev.applied.length === 0 ? (
          <p className="m-0 text-[12px] text-bz-text-muted">No scheme applies to this order.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {ev.applied.map((a) => (
              <li key={a.schemeId} className="flex items-baseline gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium text-bz-text">{a.name}</span>
                  <span className="block text-[11px] text-bz-text-soft">{a.text}</span>
                </span>
                <span className="shrink-0 text-right text-[12px] text-bz-text">
                  {freeSchemes.has(a.schemeId) ? (
                    <span className="text-[11px] text-bz-text-soft">
                      worth <Money value={a.benefit} code={false} />
                    </span>
                  ) : (
                    <Money value={-a.benefit} />
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}

        {pending && ev.hints.length > 0 && (
          <div className="mt-5">
            <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Almost there</p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {ev.hints.map((h) => (
                <li key={h.schemeId}>
                  <span className="flex items-baseline gap-2 text-[12px]">
                    <span className="min-w-0 flex-1 text-bz-text">{h.text}</span>
                    <span className="shrink-0 text-[11px] text-bz-text-soft">{h.name}</span>
                  </span>
                  <Progress pct={h.progress * 100} tone="warn" className="mt-1.5" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {ev.skipped.length > 0 && (
          <div className="mt-5">
            <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Not applied</p>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {ev.skipped.map((s) => (
                <li key={s.schemeId} className="flex items-baseline gap-3 text-[11.5px]">
                  <span className="min-w-0 flex-1 truncate text-bz-text-muted">{s.name}</span>
                  <span className="shrink-0 text-bz-text-soft">{s.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Block>

      <Block title="Totals">
        <TotalRow label="Gross">{npr(ev.gross)}</TotalRow>
        {ev.discount > 0 && <TotalRow label="Scheme discount">−{npr(ev.discount)}</TotalRow>}
        <TotalRow label="VAT 13%">{npr(ev.tax)}</TotalRow>
        <TotalRow label="Total" strong>
          <Money value={ev.total} />
        </TotalRow>
        {ev.freeValue > 0 && <TotalRow label="Free goods, not charged" soft>worth {npr(ev.freeValue)}</TotalRow>}
      </Block>

      <Block title="Credit check" aside={<Dot tone={cr.ok ? "good" : stops ? "danger" : "warn"}>{cr.ok ? "Passes" : stops ? "Stopped" : "Warning"}</Dot>}>
        <div className="flex items-end gap-3">
          <Fact label="Available now">
            <Money value={cr.available} />
          </Fact>
          <ArrowRight size={13} className="mb-1 shrink-0 text-bz-text-soft" />
          <Fact label="After this order">
            <Money value={cr.after} className={cr.after < 0 ? "text-bz-red" : undefined} />
          </Fact>
        </div>
        <Progress pct={usedPct} tone={cr.after < 0 ? "danger" : usedPct > 85 ? "warn" : "good"} className="mt-3" />
        <p className="m-0 mt-2.5 text-[11.5px] leading-relaxed text-bz-text-muted">
          {cr.overdue > 0 && `NPR ${npr(cr.overdue)} is overdue. `}
          {cr.after < 0 && `This order goes NPR ${npr(-cr.after)} over the limit. `}
          {creditLine}
        </p>
      </Block>

      <HistoryAndNotes order={order} />

      <Dialog
        open={ask !== null}
        size="sm"
        eyebrow={order.id}
        title={ask === "reject" ? "Reject this order" : "Approve over credit"}
        onClose={closeAsk}
        foot={
          <>
            <button type="button" className={GHOST} onClick={closeAsk}>
              Cancel
            </button>
            <button type="button" className={ask === "reject" ? DANGER_BTN : BTN} disabled={!reason.trim()} onClick={confirm}>
              {ask === "reject" ? "Reject order" : "Approve over credit"}
            </button>
          </>
        }
      >
        {ask === "over" && (
          <p className="m-0 mb-3">
            {cr.after < 0 ? `It goes NPR ${npr(-cr.after)} over ${c?.name ?? "the customer"}'s limit` : `${c?.name ?? "The customer"} has NPR ${npr(cr.overdue)} overdue`}. The reason is kept on the sales order.
          </p>
        )}
        {ask === "reject" && <p className="m-0 mb-3">{order.byName} sees this reason.</p>}
        <Field label="Reason" required>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={ask === "reject" ? "e.g. Duplicate of ORD-2194" : "e.g. Payment of NPR 2 lakh promised on Monday"}
            className={TEXTAREA}
          />
        </Field>
      </Dialog>
    </SidePanel>
  );
}

export const ORDERS_ROUTES = [
  { path: "design/salesforce/orders", Component: OrdersPage },
  { path: "design/salesforce/orders/:id", Component: OrdersPage },
];
