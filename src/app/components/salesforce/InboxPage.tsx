import * as React from "react";
import { Navigate, useNavigate } from "react-router";
import { Banknote, Check, FilePlus2, FileText, ListTree, Megaphone, Pencil, ReceiptText, ShieldCheck, ShoppingBag, Tag, Wallet } from "lucide-react";
import type { PanelCtx } from "../sales/DocDesk";
import { latestVersion, openRequests } from "../sales/estimate-offer";
import { estimatesStore } from "../sales/flow";
import { Amount } from "../sales/orders";
import { useStore } from "../sales/store";
import { SF_NOW, SF_TODAY } from "./data";
import { customerName, posmName } from "./activationKit";
import { RequestPeek, approve as approveRequest } from "./BrandingPage";
import { ClaimPeek, partyName } from "./ClaimsPage";
import { estimatePathFor } from "./deals";
import { customerById } from "./engine";
import { estimatePath, estimatesToAnswer, openEstimateOf } from "./estimates";
import { FxDesk } from "./fx-desk";
import { OpportunityPeek } from "./OpportunitiesPage";
import { OrderPeek } from "./OrdersPage";
import { SOURCE_NAME, approveHubOrder, creditStops, evaluateHub, forText, reasonsFor } from "./orders-parts";
import { PaymentPeek, confirmReceipt } from "./PaymentsPage";
import { receiptPath, receiptTodo, receiptTodoText } from "./receipts";
import { METHOD_LABEL } from "./sell-kit";
import { sfPath } from "./sf";
import { brandingStore, claimsStore, customersStore, hubStore, ledgerStore, opportunitiesStore, posmStore, productsStore, repsStore, schemesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// TRADE · TO DECIDE — everything that waits for a decision, in one place
//
// A sales office decides many small things a day: an order over its credit, a
// payment a dealer sent, a claim, a price request, a sign board. They are the
// same job — look, decide, next — so they are ONE list, the module's list
// (`FxDesk`), with a pill on each row saying what it is. A row opens that
// kind's own record; deciding takes the row out, and the record that was open
// hands over to the row that took its place. An estimate the customer asked to
// change is answered where it lives — on the sales desk — so its row goes there.
// ════════════════════════════════════════════════════════════════════════════

// ── The queue ───────────────────────────────────────────────────────────────

type Kind = "order" | "payment" | "claim" | "opportunity" | "estimate" | "branding";
export type Item = { key: string; kind: Kind; id: string; title: string; sub: string; danger?: boolean; amount?: number; when: string };
export type Group = { key: string; label: string; items: Item[] };

/** Where each kind lives, for a record's own links out of the queue. An estimate has no record here: it opens on the sales desk. */
const PLACE: Record<Exclude<Kind, "estimate">, string> = { order: "orders", payment: "payments", claim: "claims", opportunity: "opportunities", branding: "branding" };

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "12 min", "3 h", "Yesterday", "4 d" — how long it has waited. */
export function waited(when: string) {
  const [d, t] = when.split(" ");
  const days = Math.round((Date.parse(SF_TODAY) - Date.parse(d)) / 86_400_000);
  if (days <= 0) {
    if (!t) return "Today";
    const [h, m] = t.split(":").map(Number);
    const [nh, nm] = SF_NOW.split(":").map(Number);
    const mins = Math.max(0, nh * 60 + nm - (h * 60 + m));
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h`;
  }
  return days === 1 ? "Yesterday" : `${days} d`;
}

export function useQueue(): Group[] {
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  const ledger = useStore(ledgerStore);
  const claims = useStore(claimsStore);
  const opportunities = useStore(opportunitiesStore);
  const estimates = useStore(estimatesStore);
  const branding = useStore(brandingStore);
  const posm = useStore(posmStore);
  useStore(customersStore);
  useStore(repsStore);
  useStore(productsStore);

  return React.useMemo(() => {
    const oldest = (a: Item, b: Item) => a.when.localeCompare(b.when);
    const order = (o: (typeof hub)[number]): Item => {
      const ev = evaluateHub(o, schemes);
      const why = reasonsFor(o, ev, hub);
      return {
        key: `order:${o.id}`,
        kind: "order",
        id: o.id,
        title: `${customerById(o.customerId)?.name ?? "Removed customer"}${forText(o) ? ` ${forText(o)}` : ""}`,
        sub: o.status === "review" && why.length ? why.map((r) => r.short).join(" · ") : `${SOURCE_NAME[o.source]} · ${plural(o.lines.length, "line")}`,
        danger: o.status === "review",
        amount: ev.total,
        when: o.at,
      };
    };
    const groups: Group[] = [
      { key: "review", label: "Orders to review", items: hub.filter((o) => o.status === "review").map(order) },
      { key: "ready", label: "Orders to approve", items: hub.filter((o) => o.status === "ready").map(order) },
      {
        key: "pay",
        label: "Receipts to confirm",
        // An early-payment credit note waits too, but it is confirmed or rejected with its receipt.
        items: ledger
          .filter((r) => r.pending && r.kind === "Receipt")
          .map((r) => ({
            key: `payment:${r.doc}`,
            kind: "payment" as const,
            id: r.doc,
            title: customerById(r.customerId)?.name ?? "Removed customer",
            sub: [r.method ? METHOD_LABEL[r.method] : null, r.reference || null, r.by ? `by ${r.by}` : null].filter(Boolean).join(" · ") || r.doc,
            amount: r.credit,
            when: r.date,
          })),
      },
      // A confirmed receipt is applied by hand (decision #33): one whose order is now invoiced waits to be applied,
      // and one whose order was rejected or cancelled waits for another order.
      ...(["retag", "apply"] as const).map((todo) => ({
        key: todo,
        label: todo === "retag" ? "Receipts with an order to change" : "Receipts to apply",
        items: ledger
          .filter((r) => r.kind === "Receipt" && !r.pending && receiptTodo(r.customerId, r.doc) === todo)
          .map((r) => ({
            key: `payment:${r.doc}`,
            kind: "payment" as const,
            id: r.doc,
            title: customerById(r.customerId)?.name ?? "Removed customer",
            sub: receiptTodoText(r.customerId, r.doc),
            danger: todo === "retag",
            amount: r.credit,
            when: r.date,
          })),
      })),
      {
        key: "claims",
        label: "Claims to decide",
        items: claims.filter((c) => c.status === "submitted").map((c) => ({ key: `claim:${c.id}`, kind: "claim" as const, id: c.id, title: partyName(c), sub: `${c.kind} · ${c.basis}`, amount: c.amount, when: c.raisedOn })),
      },
      {
        key: "settle",
        label: "Claims to settle",
        items: claims.filter((c) => c.status === "approved").map((c) => ({ key: `claim:${c.id}`, kind: "claim" as const, id: c.id, title: partyName(c), sub: `${c.kind} · approved`, amount: c.amount, when: c.raisedOn })),
      },
      {
        key: "requests",
        label: "Price requests",
        items: opportunities
          .filter((o) => o.stage === "new")
          .map((o) => ({
            key: `opportunity:${o.id}`,
            kind: "opportunity" as const,
            id: o.id,
            title: customerById(o.customerId)?.name ?? "Removed customer",
            sub: o.request?.lines.length ? `${o.title || "Price request"} · ${plural(o.request.lines.length, "product")}` : o.title || "Price request",
            amount: o.expectedValue || undefined,
            when: o.createdAt,
          })),
      },
      {
        key: "revise",
        label: "Estimate changes asked",
        items: estimatesToAnswer(estimates).map((e) => {
          const v = latestVersion(e);
          const asked = openRequests(e).slice(-1)[0];
          return { key: `estimate:${e.no}`, kind: "estimate" as const, id: e.no, title: customerById(e.customerId)?.name ?? "Removed customer", sub: `Changes asked on version ${asked?.onVersion ?? v?.no ?? 1}`, amount: v?.total, when: asked?.at ?? v?.at ?? e.date };
        }),
      },
      {
        key: "branding",
        label: "Branding requests",
        items: branding
          .filter((b) => b.stage === "requested")
          .map((b) => {
            const p = posm.find((x) => x.id === b.posmId);
            return { key: `branding:${b.id}`, kind: "branding" as const, id: b.id, title: customerName(b.customerId), sub: `${posmName(b.posmId)} × ${b.qty}`, amount: (p?.cost ?? 0) * b.qty || undefined, when: b.requestedOn };
          }),
      },
    ];
    return groups.map((g) => ({ ...g, items: [...g.items].sort(oldest) })).filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hub, schemes, ledger, claims, opportunities, estimates, branding, posm]);
}

// ── The page ────────────────────────────────────────────────────────────────

const KIND: Record<Kind, { label: string; tab: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  order: { label: "Order", tab: "Orders", icon: ShoppingBag },
  payment: { label: "Receipt", tab: "Receipts", icon: Wallet },
  claim: { label: "Claim", tab: "Claims", icon: ReceiptText },
  opportunity: { label: "Price request", tab: "Price requests", icon: Tag },
  estimate: { label: "Estimate", tab: "Estimates", icon: FileText },
  branding: { label: "Branding", tab: "Branding", icon: Megaphone },
};
const KINDS = Object.keys(KIND) as Kind[];

export function InboxPage() {
  const navigate = useNavigate();
  const groups = useQueue();
  const items = groups.flatMap((g) => g.items);
  const groupKey = new Map(groups.flatMap((g) => g.items.map((i) => [i.key, g.key] as const)));

  /**
   * The row's one step: the decision itself where one click is safe — by the function the kind's own list calls —
   * and otherwise the way into the record.
   */
  const verb = (i: Item, go: PanelCtx["go"]) => {
    if (i.kind === "order") {
      const o = hubStore.get().find((x) => x.id === i.id);
      if (o && o.status === "ready" && !creditStops(evaluateHub(o))) return { label: "Approve", icon: Check, run: () => void approveHubOrder(o) };
    }
    if (i.kind === "payment") {
      const r = ledgerStore.get().find((x) => x.kind === "Receipt" && x.doc === i.id);
      if (r?.pending) return { label: "Confirm", icon: Check, run: () => confirmReceipt(r.doc) };
      const todo = r ? receiptTodo(r.customerId, r.doc) : null;
      if (r && todo === "retag") return { label: "Change", icon: Pencil, run: () => navigate(`${receiptPath(r.doc)}?do=edit`) };
      if (r && todo === "apply") return { label: "Apply", icon: Banknote, run: () => navigate(`${receiptPath(r.doc)}?do=edit&apply=1`) };
    }
    if (i.kind === "branding") {
      const j = brandingStore.get().find((x) => x.id === i.id);
      const m = posmStore.get().find((x) => x.id === j?.posmId);
      if (j && m && m.stock >= j.qty) return { label: "Approve", icon: Check, run: () => void approveRequest(j) };
    }
    if (i.kind === "opportunity") {
      const o = opportunitiesStore.get().find((x) => x.id === i.id);
      const open = o && openEstimateOf(o.id);
      // One estimate in play per opportunity: started but not sent yet, it is opened, not made again.
      if (open) return { label: "Open", icon: FileText, run: () => navigate(estimatePath(open.no)) };
      if (o) return { label: "Estimate", icon: FilePlus2, run: () => navigate(estimatePathFor(o)) };
    }
    if (i.kind === "estimate") return { label: "Answer", icon: FileText, run: () => navigate(estimatePath(i.id)) };
    return { label: "Review", icon: ShieldCheck, run: () => go(i.key) };
  };

  /** A record's own links (its form, its other modes) belong to its own list, not to the queue. */
  const own = (i: Item, ctx: PanelCtx): PanelCtx => ({
    ...ctx,
    mode: null,
    go: (no, params) => {
      if (!no) return ctx.go(null);
      const q = params ? `?${new URLSearchParams(params).toString()}` : "";
      navigate(i.kind === "estimate" ? estimatePath(no) : `${sfPath(`${PLACE[i.kind]}/${no}`)}${q}`);
    },
    neighbour: (d) => {
      const k = ctx.neighbour(d);
      return k ? k.slice(k.indexOf(":") + 1) : null;
    },
  });

  return (
    <FxDesk<Item>
      place="inbox"
      section="salesforce/inbox"
      openParam="open"
      handover
      noun={["decision", "decisions"]}
      emptyText="Nothing is waiting."
      lead="status"
      statusLabel="Kind"
      partyLabel="From"
      rows={items}
      noOf={(i) => i.key}
      rowLabel={(i) => `${KIND[i.kind].label} ${i.id}`}
      searchText={(i) => `${i.id} ${i.title} ${i.sub} ${KIND[i.kind].label}`}
      searchPlaceholder="Name, number or reason"
      picks={KINDS.filter((k) => items.some((i) => i.kind === k)).map((k) => ({
        key: k,
        label: KIND[k].tab,
        value: items.filter((i) => i.kind === k).length,
        test: (i: Item) => i.kind === k,
        danger: items.some((i) => i.kind === k && i.danger),
      }))}
      views={[{ key: "queue", label: "", icon: ListTree, groups: (rs) => groups.map((g) => ({ key: g.key, label: g.label, alarm: g.key === "review", rows: rs.filter((i) => groupKey.get(i.key) === g.key) })) }]}
      sorts={[
        { key: "wait", label: "Waiting longest", by: (i) => i.when },
        { key: "val", label: "Amount", by: (i) => i.amount ?? 0, desc: true },
      ]}
      columns={[{ key: "wait", label: "Waiting", width: "84px", render: (i) => waited(i.when) }]}
      primary={(i) => ({
        title: i.title,
        sub: (
          <>
            <span className={i.danger ? "text-bz-red" : undefined}>{i.sub}</span>
            <span className="lg:hidden"> · {waited(i.when)}</span>
          </>
        ),
        subOnDesktop: true,
      })}
      status={(i) => ({ label: KIND[i.kind].label, tone: "idle", icon: KIND[i.kind].icon })}
      amount={(i) => ({ value: i.amount !== undefined ? <Amount value={i.amount} /> : <span className="font-normal text-bz-text-soft">—</span> })}
      rowVerb={verb}
      // A queue is worked, not exported.
      exportMenu={<></>}
      renderPanel={(i, ctx) => (
        <React.Fragment key={i.key}>
          {i.kind === "order" && <OrderPeek id={i.id} ctx={own(i, ctx)} />}
          {i.kind === "payment" && <PaymentPeek id={i.id} ctx={own(i, ctx)} />}
          {i.kind === "claim" && <ClaimPeek id={i.id} ctx={own(i, ctx)} />}
          {i.kind === "opportunity" && <OpportunityPeek id={i.id} ctx={own(i, ctx)} />}
          {i.kind === "estimate" && <Navigate to={estimatePath(i.id)} replace />}
          {i.kind === "branding" && <RequestPeek id={i.id} ctx={own(i, ctx)} />}
        </React.Fragment>
      )}
    />
  );
}
