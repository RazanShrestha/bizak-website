import * as React from "react";
import { cn } from "../ui/utils";
import { GHOST_SM, NUM, TEXTAREA } from "../sales/bzw";
import { createStore, ordersStore, useStore } from "../sales/store";
import { ME, TODAY, addDays, customerById as salesCustomerById, fmtShort, termById } from "../sales/orders";
import type { Order, OrderLine } from "../sales/orders";
import { SF_NOW, SF_TODAY } from "./data";
import type { HubOrder, HubStatus, Scheme, Source } from "./data";
import { compact, customerById, dayTime, evaluate, npr, typeOf } from "./engine";
import type { Evaluation, PricedLine } from "./engine";
import { hubStore, schemesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// ORDERS HUB · KERNEL
//
// Why an order waits, and what approving it writes. The hub never prices an
// order itself: every figure comes from `evaluate`, the same call the rep app
// and the dealer portal make, so a hub order and the sales order it becomes
// can never disagree. The sales order keeps the schemes it got as a snapshot
// (memo + line descriptions) because the scheme may change tomorrow.
// ════════════════════════════════════════════════════════════════════════════

export const SOURCE_NAME: Record<Source, string> = { rep: "Rep app", portal: "Dealer portal", whatsapp: "WhatsApp", "retailer-app": "Retailer app", "back-office": "Back office" };

/** The sales header field "Sales channel" only offers these four (sales/master.tsx). */
const CHANNEL_OF: Record<Source, string> = { rep: "Field sales", portal: "Online", whatsapp: "Online", "retailer-app": "Online", "back-office": "Counter" };

export const STATUS_META: Record<HubStatus, { label: string; tone: "danger" | "info" | "good" | "off" }> = {
  review: { label: "Needs review", tone: "danger" },
  ready: { label: "Ready", tone: "info" },
  approved: { label: "Approved", tone: "good" },
  rejected: { label: "Rejected", tone: "off" },
};

// ── Why an order needs review ───────────────────────────────────────────────

export type Reason = { key: "credit" | "overdue" | "qty" | "scheme"; short: string; long: string };

/**
 * A line is unusual when it is three times what this customer (or, with no history, its customer type)
 * usually orders of that product. A secondary outlet with no history at all is unusual above 50 units.
 */
export function unusualLines(o: { id: string; customerId: string; lines: { productId: string; qty: number }[] }, hub: HubOrder[]) {
  const c = customerById(o.customerId);
  const others = hub.filter((h) => h.id !== o.id && h.status !== "rejected");
  return o.lines.flatMap((l) => {
    const qtys = (hs: HubOrder[]) => hs.flatMap((h) => h.lines.filter((x) => x.productId === l.productId).map((x) => x.qty));
    const own = qtys(others.filter((h) => h.customerId === o.customerId));
    const base = own.length ? own : qtys(others.filter((h) => customerById(h.customerId)?.typeId === c?.typeId));
    if (base.length) {
      const usual = base.reduce((s, q) => s + q, 0) / base.length;
      return l.qty >= usual * 3 && l.qty - usual >= 10 ? [{ productId: l.productId, qty: l.qty, usual: Math.round(usual) }] : [];
    }
    return typeOf(c)?.level !== "primary" && l.qty > 50 ? [{ productId: l.productId, qty: l.qty, usual: null as number | null }] : [];
  });
}

export function reasonsFor(o: { id: string; customerId: string; lines: { productId: string; qty: number }[] }, ev: Evaluation, hub: HubOrder[]): Reason[] {
  const out: Reason[] = [];
  if (ev.credit.after < 0) out.push({ key: "credit", short: `Over credit by ${compact(-ev.credit.after)}`, long: `Goes NPR ${npr(-ev.credit.after)} over the credit limit` });
  if (ev.credit.overdue > 0) out.push({ key: "overdue", short: `${compact(ev.credit.overdue)} overdue`, long: `NPR ${npr(ev.credit.overdue)} of earlier invoices is overdue` });
  const odd = unusualLines(o, hub);
  if (odd.length) out.push({ key: "qty", short: "Unusual quantity", long: `${odd.length === 1 ? "One line is" : `${odd.length} lines are`} far above what this customer usually orders` });
  const clash = ev.skipped.filter((s) => s.reason === "Another exclusive scheme applied" || s.reason === "Budget used up");
  if (clash.length) out.push({ key: "scheme", short: "Scheme conflict", long: clash.map((s) => `${s.name}: ${s.reason.toLowerCase()}`).join(" · ") });
  return out;
}

/** The credit check stops the order: a hard-stop type that is over its limit or has overdue invoices. */
export const creditStops = (ev: Evaluation) => !ev.credit.ok && ev.credit.stop === "hard";

/** Which applied schemes touched a line — the engine adds each discount per line but only tags free lines. */
export function schemesOnLine(l: PricedLine, ev: Evaluation, schemes: Scheme[]): string[] {
  if (l.free) return ev.applied.filter((a) => a.schemeId === l.schemeId).map((a) => a.name);
  const pid = l.product.id;
  return ev.applied
    .filter((a) => {
      const m = schemes.find((s) => s.id === a.schemeId)?.mechanic;
      if (!m) return false;
      if (m.kind === "slab") return m.itemIds.includes(pid);
      if (m.kind === "invoice-value" || m.kind === "first-order") return true;
      if (m.kind === "free-goods") return m.buyItemIds.includes(pid);
      if (m.kind === "combo") return m.needs.some((n) => n.itemIds.includes(pid));
      return false;
    })
    .map((a) => a.name);
}

// ── History and notes of a hub order (the mockup's CHANGE_LOG / USER_NOTE) ──

export type LogRow = { id: string; who: string; when: string; what: string };
export const logStore = createStore<Record<string, LogRow[]>>({});
export const notesStore = createStore<Record<string, LogRow[]>>({});

let seq = 0;
const nowStamp = () => `${SF_TODAY} ${SF_NOW}`;
export function logEvent(orderId: string, what: string) {
  logStore.set((m) => ({ ...m, [orderId]: [...(m[orderId] ?? []), { id: `lg${++seq}`, who: ME.name, when: nowStamp(), what }] }));
}
export function addNote(orderId: string, body: string) {
  notesStore.set((m) => ({ ...m, [orderId]: [...(m[orderId] ?? []), { id: `nt${++seq}`, who: ME.name, when: nowStamp(), what: body }] }));
}

/** What the seed already knows about an order, then what happened here. */
export function historyOf(o: HubOrder, log: LogRow[]): LogRow[] {
  const seeded: LogRow[] = [{ id: "s1", who: o.byName, when: o.at, what: `placed it through ${SOURCE_NAME[o.source].toLowerCase()}` }];
  const touched = log.some((l) => /approved|rejected/.test(l.what));
  if (!touched && o.status === "approved" && o.soNo) seeded.push({ id: "s2", who: "", when: "", what: `Approved as ${o.soNo}` });
  if (!touched && o.status === "rejected") seeded.push({ id: "s2", who: "", when: "", what: `Rejected${o.rejectReason ? ` — ${o.rejectReason}` : ""}` });
  return [...seeded, ...log];
}

// ── Approve: the hub order becomes an ordinary Bizak sales order ────────────

/** The next free SO number across the sales desk AND the numbers the hub has already handed out. */
export function nextSoNo() {
  const nums = [...ordersStore.get().map((o) => o.no), ...hubStore.get().map((h) => h.soNo ?? "")]
    .filter((n) => /^SO-\d+$/.test(n))
    .map((n) => Number(n.slice(3)));
  return `SO-${Math.max(1000, ...nums) + 1}`;
}

const locationFor = (city: string | undefined) => (city === "Pokhara" ? "L-PKR" : city === "Butwal" || city === "Bhairahawa" ? "L-BTW" : "L-KTM");
const stamp = () => `${fmtShort(TODAY)}, ${SF_NOW}`;

export function buildSalesOrder(o: HubOrder, ev: Evaluation, no: string, schemes: Scheme[], opts: { overCredit?: string; notes: LogRow[]; pending?: boolean }): Order {
  const c = customerById(o.customerId);
  const sc = salesCustomerById(o.customerId);
  const termId = sc?.termId ?? "T30";
  const locationId = locationFor(c?.city);
  const lines: OrderLine[] = ev.lines.map((l, i) => {
    const names = schemesOnLine(l, ev, schemes);
    return {
      id: `LN-${o.id}-${i + 1}`,
      itemId: l.product.id,
      description: l.free ? `Free goods — ${names.join(", ")}` : l.discount > 0 && names.length ? `Scheme: ${names.join(", ")}` : undefined,
      qty: l.qty,
      // Free goods are zero-priced lines that still move stock (blueprint §2).
      rate: l.free ? 0 : l.price,
      discountPct: 0,
      discountAmt: l.discount > 0 ? l.discount : undefined,
      tax: "VAT13",
      unit: l.product.unit,
      priceLevel: sc?.priceLevel,
      custom: {},
      delivered: 0,
      invoiced: 0,
    };
  });
  const snapshot = ev.applied.length ? `Schemes: ${ev.applied.map((a) => `${a.name} — ${a.text} (NPR ${npr(a.benefit)})`).join("; ")}.` : "No scheme applied.";
  const po = /^PO\s+(.+)$/i.exec(o.note.trim());
  const at = stamp();
  return {
    id: no,
    no,
    customerId: o.customerId,
    date: TODAY,
    expected: null,
    locationId,
    repId: o.repId,
    termId,
    customerPo: po ? po[1] : null,
    currency: "NPR",
    exchangeRate: 1,
    subsidiaryId: locationId === "L-PKR" ? "NP-02" : "NP-01",
    due: addDays(TODAY, termById(termId)?.days ?? 0),
    billingAddress: sc?.address ?? c?.city ?? "",
    custom: { channel: CHANNEL_OF[o.source] },
    created: { byId: ME.id, on: TODAY },
    audit: [],
    memo: [`From ${o.id} · ${SOURCE_NAME[o.source]} · placed by ${o.byName}.`, snapshot, po ? "" : o.note, opts.overCredit ? `Approved over credit: ${opts.overCredit}` : ""].filter(Boolean).join("\n"),
    source: null,
    approval: opts.pending ? { state: "pending", stateName: "Sales force review", approverId: ME.id, since: TODAY } : { state: "approved", byId: ME.id, on: TODAY },
    closed: false,
    cancelled: null,
    lines,
    docs: [],
    dims: {},
    attachments: [],
    comments: opts.notes.map((n, i) => ({ id: `c-${o.id}-${i}`, authorId: ME.id, when: at, body: n.what })),
    history: [
      { id: `h-${o.id}-1`, whoId: ME.id, when: at, what: `created the order from ${o.id} (${SOURCE_NAME[o.source]}, placed by ${o.byName})` },
      ...(opts.pending ? [] : [{ id: `h-${o.id}-2`, whoId: ME.id, when: at, what: opts.overCredit ? `approved it over credit — “${opts.overCredit}”` : "approved it" }]),
    ],
    advance: 0,
  };
}

/** Replace the order's SO on the desk, or add it — one SO number per hub order, from submit to approval. */
function putSalesOrder(so: Order) {
  ordersStore.set((os) => (os.some((x) => x.no === so.no) ? os.map((x) => (x.no === so.no ? so : x)) : [so, ...os]));
}

/**
 * A portal order is a real sales order from the moment the dealer submits it (owner decision #5): a pending SO,
 * which commits no stock, until the hub approves or rejects it. Returns the SO number.
 */
export function openPendingSalesOrder(o: HubOrder): string {
  const schemes = schemesStore.get();
  const no = o.soNo ?? nextSoNo();
  putSalesOrder(buildSalesOrder(o, evaluate(o.customerId, o.lines, schemes), no, schemes, { notes: notesStore.get()[o.id] ?? [], pending: true }));
  hubStore.set((hs) => hs.map((h) => (h.id === o.id ? { ...h, soNo: no } : h)));
  return no;
}

const pendingSo = (o: HubOrder) => (o.soNo ? ordersStore.get().find((x) => x.no === o.soNo && x.approval.state === "pending") : undefined);

/** Approve one hub order: write the sales order, spend the scheme budgets, mark the hub order. Returns the SO number. */
export function approveHubOrder(o: HubOrder, overCredit?: string): string {
  const schemes = schemesStore.get();
  const ev = evaluate(o.customerId, o.lines, schemes);
  const no = pendingSo(o)?.no ?? nextSoNo();
  putSalesOrder(buildSalesOrder(o, ev, no, schemes, { overCredit, notes: notesStore.get()[o.id] ?? [] }));
  // Budgets with auto-stop: what this order used counts against each scheme it got.
  schemesStore.set((ss) =>
    ss.map((s) => {
      const a = ev.applied.find((x) => x.schemeId === s.id);
      if (!a || !s.budget) return s;
      const used = s.budget.kind === "value" ? a.benefit : ev.lines.filter((l) => l.free && l.schemeId === s.id).reduce((n, l) => n + l.qty, 0);
      return { ...s, budget: { ...s.budget, used: s.budget.used + used } };
    }),
  );
  hubStore.set((hs) => hs.map((h) => (h.id === o.id ? { ...h, status: "approved", soNo: no } : h)));
  logEvent(o.id, overCredit ? `approved it over credit as ${no} — “${overCredit}”` : `approved it as ${no}`);
  return no;
}

export function rejectHubOrder(o: HubOrder, reason: string) {
  const so = pendingSo(o);
  if (so) putSalesOrder({ ...so, approval: { state: "rejected", byId: ME.id, on: TODAY, reason } });
  hubStore.set((hs) => hs.map((h) => (h.id === o.id ? { ...h, status: "rejected", rejectReason: reason } : h)));
  logEvent(o.id, `rejected it — “${reason}”`);
}

export function saveQuantities(o: HubOrder, next: { productId: string; qty: number }[], names: (id: string) => string) {
  const changes = next
    .map((l) => ({ l, was: o.lines.find((x) => x.productId === l.productId)?.qty ?? 0 }))
    .filter((x) => x.was !== x.l.qty)
    .map((x) => `${names(x.l.productId)} ${x.was} → ${x.l.qty}`);
  hubStore.set((hs) => hs.map((h) => (h.id === o.id ? { ...h, lines: next.filter((l) => l.qty > 0).map((l) => ({ ...l })) } : h)));
  const updated = hubStore.get().find((h) => h.id === o.id);
  if (updated && pendingSo(updated)) openPendingSalesOrder(updated);
  if (changes.length) logEvent(o.id, `changed quantities: ${changes.join(", ")}`);
}

/** The sales order still exists on the desk, for the same customer (the seed's SO numbers may not). */
export const soOnDesk = (soNo: string | null, customerId: string) => !!soNo && ordersStore.get().some((x) => x.no === soNo && x.customerId === customerId);

// ── Panel pieces ────────────────────────────────────────────────────────────

/** A block inside the panel: a 13px title, space above, one hairline. */
export function Block({ title, aside, children, className }: { title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("mt-7 border-t border-bz-line-soft pt-5", className)}>
      <div className="mb-3 flex items-baseline gap-2">
        <h3 className="m-0 text-[13px] font-semibold text-bz-text">{title}</h3>
        {aside && <div className="ml-auto text-[11px] text-bz-text-soft">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

export function TotalRow({ label, children, strong, soft }: { label: React.ReactNode; children: React.ReactNode; strong?: boolean; soft?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-1", strong ? "mt-1 border-t border-bz-line-soft pt-2.5 text-[13px] font-semibold text-bz-text" : soft ? "text-[11px] text-bz-text-soft" : "text-[12.5px] text-bz-text-muted")}>
      <span>{label}</span>
      <span className={cn(NUM, strong && "text-bz-text")}>{children}</span>
    </div>
  );
}

/** History (who / what / when) and the notes, at the foot of every hub order. */
export function HistoryAndNotes({ order }: { order: HubOrder }) {
  const logs = useStore(logStore)[order.id] ?? [];
  const notes = useStore(notesStore)[order.id] ?? [];
  const [draft, setDraft] = React.useState("");
  const history = historyOf(order, logs);
  const send = () => {
    if (!draft.trim()) return;
    addNote(order.id, draft.trim());
    setDraft("");
  };
  return (
    <>
      <Block title="Notes" aside={notes.length ? String(notes.length) : undefined}>
        {order.note && (
          <p className="m-0 mb-3 text-[12px] leading-relaxed text-bz-text">
            <span className="text-bz-text-soft">{order.byName}:</span> “{order.note}”
          </p>
        )}
        {notes.length > 0 && (
          <ol className="m-0 mb-3 flex list-none flex-col gap-2.5 p-0">
            {notes.map((n) => (
              <li key={n.id} className="text-[12px] leading-relaxed text-bz-text">
                <span className="block text-[11px] text-bz-text-soft">
                  {n.who} · {dayTime(n.when)}
                </span>
                {n.what}
              </li>
            ))}
          </ol>
        )}
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} placeholder="Add a note for the team" className={cn(TEXTAREA, "min-h-[56px]")} />
        <div className="mt-2 flex justify-end">
          <button type="button" className={GHOST_SM} disabled={!draft.trim()} onClick={send}>
            Add note
          </button>
        </div>
      </Block>
      <Block title="History">
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {history.map((h) => (
            <li key={h.id} className="flex items-baseline gap-2.5 text-[11.5px] text-bz-text-muted">
              <span className="size-1.5 shrink-0 translate-y-[-1px] rounded-bz-pill bg-bz-line" />
              <span className="min-w-0 flex-1">
                {h.who && <span className="font-medium text-bz-text">{h.who} </span>}
                {h.what}
              </span>
              {h.when && <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{dayTime(h.when)}</span>}
            </li>
          ))}
        </ol>
      </Block>
    </>
  );
}
