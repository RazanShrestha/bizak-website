import * as React from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Plus, X } from "lucide-react";
import { cn } from "../ui/utils";
import { Field, INPUT, NUM, Select, TEXTAREA } from "../sales/bzw";
import { isChargeLine, latestVersion } from "../sales/estimate-offer";
import { useStore } from "../sales/store";
import { SF_TODAY } from "../salesforce/data";
import { createRfq } from "../salesforce/deals";
import { day, npr, priceFor, productById } from "../salesforce/engine";
import { versionDue } from "../salesforce/estimates";
import { productsStore } from "../salesforce/store";
import { Dot, EmptyNote, Money } from "../salesforce/ui";
import { DealerShell, pagesFor } from "./shell";
import { LIME, PageHead, Pills, QtyStepper, SOFT, Unavailable } from "./kit";
import { addDays, dpPath, findRequest, notify, useDealer, useDealerRequests } from "./portal";
import type { DealerRequest } from "./portal";
import { RequestDetail } from "./request-detail";

// ════════════════════════════════════════════════════════════════════════════
// PRICE REQUESTS — ask for a price, then settle it on an estimate
//
// A request sent here is an opportunity for the company (owner decision #27).
// It answers with an estimate — the sales desk's own (decision #32); the dealer
// accepts it, declines it or asks for changes, and every answer from the company
// is a new version. Accepting makes the order — nothing goes through the cart.
// The rules are the desk's (sales/estimate-offer.ts); this page only reads them.
// The list also carries estimates the company sent without being asked.
// ════════════════════════════════════════════════════════════════════════════

export function DealerRequestsPage() {
  const { id } = useParams();
  return <DealerShell page="requests">{id ? <RequestDetail key={id} id={id} /> : <RequestsList />}</DealerShell>;
}

export function DealerNewRequestPage() {
  return (
    <DealerShell page="requests">
      <NewRequest />
    </DealerShell>
  );
}

// ── The list ────────────────────────────────────────────────────────────────

type Filter = "all" | "open" | "closed";

function RequestsList() {
  const s = useDealer();
  const all = useDealerRequests(s.c.id, s.company);
  const [params] = useSearchParams();
  const [f, setF] = React.useState<Filter>("all");
  if (!pagesFor(s).has("requests")) return <Unavailable what="Asking for a price" />;

  // A link saved before price requests replaced quotations reads …/quotes?id=QR-001.
  const old = findRequest(all, params.get("id"));
  if (old) return <Navigate to={dpPath(`requests/${old.key}`)} replace />;

  const canAsk = s.settings.can.rfq;
  const open = all.filter((r) => r.open);
  const closed = all.filter((r) => !r.open);
  const toAnswer = all.filter((r) => r.state === "received" || r.state === "new-version");
  const shown = f === "open" ? open : f === "closed" ? closed : all;

  return (
    <>
      <PageHead
        title="Price requests"
        sub={canAsk ? `Ask ${s.company} for a price on a big or special order. They reply with an estimate you can accept, decline or ask to change.` : `Estimates ${s.company} sent you. Accept one, decline it or ask for changes.`}
        actions={
          canAsk && (
            <Link to={dpPath("requests/new")} className={LIME}>
              New price request
            </Link>
          )
        }
      />
      {toAnswer.length > 0 && (
        <p className="m-0 mb-6 text-[12.5px] text-bz-text-muted">
          <span className="font-semibold text-bz-text">{toAnswer.length === 1 ? "1 estimate" : `${toAnswer.length} estimates`}</span> {toAnswer.length === 1 ? "is" : "are"} waiting for your answer.
        </p>
      )}
      {all.length > 0 && (
        <Pills<Filter>
          value={f}
          onChange={setF}
          options={[
            { value: "all", label: "All", count: all.length },
            { value: "open", label: "Open", count: open.length },
            { value: "closed", label: "Closed", count: closed.length },
          ]}
        />
      )}
      <div className="mt-6">
        {shown.length === 0 ? (
          <EmptyNote
            action={
              canAsk && (
                <Link to={dpPath("requests/new")} className={SOFT}>
                  Ask for a price
                </Link>
              )
            }
          >
            {all.length === 0 ? `Your price requests show here, with ${s.company}'s estimate once it replies.` : "Nothing in this list."}
          </EmptyNote>
        ) : (
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {shown.map((r) => (
              <RequestRow key={r.opp?.id ?? r.key} r={r} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function RequestRow({ r }: { r: DealerRequest }) {
  const s = useDealer();
  const v = r.est ? latestVersion(r.est) : null;
  const total = v ? versionDue(s.c.id, v) : null;
  return (
    <li>
      <Link to={dpPath(`requests/${r.key}`)} className="grid min-h-[64px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-1 py-3 hover:bg-bz-paper-warm/60 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_120px]">
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-medium text-bz-text">
            {r.key} · {r.title}
          </span>
          <span className={cn("block truncate text-[11px] text-bz-text-soft", NUM)}>
            {day(r.at)}
            {r.asked && r.est && v ? ` · estimate ${r.est.no}, version ${v.no}` : ""}
            {!r.asked && v ? ` · version ${v.no}` : ""}
          </span>
        </span>
        <span className="col-start-1 row-start-2 min-w-0 md:col-start-2 md:row-start-1">
          <Dot tone={r.tone}>{r.label}</Dot>
        </span>
        <span className="col-start-2 row-span-2 row-start-1 text-right md:col-start-3 md:row-span-1">
          {total !== null ? <Money value={total} code={false} className="text-[12.5px] font-medium text-bz-text" /> : <span className="text-[11px] text-bz-text-soft">No price yet</span>}
        </span>
      </Link>
    </li>
  );
}

// ── A new price request ─────────────────────────────────────────────────────

type DraftLine = { productId: string | null; qty: number; note: string };
const blank = (): DraftLine => ({ productId: null, qty: 10, note: "" });

/** "Ask again with the same items": the lines of the estimate that ran out, or of the request it answered. */
function seedFrom(r: DealerRequest | undefined, productIds: string[]) {
  const v = r?.est ? latestVersion(r.est) : null;
  const asked = r?.asked ? r.opp?.request : null;
  // The goods that were priced: free goods and charges were the company's to offer, not the dealer's to ask for.
  const priced = v?.lines.filter((l) => !l.freeOf && l.rate > 0 && !isChargeLine(l));
  const from: DraftLine[] = priced ? priced.map((l) => ({ productId: l.itemId, qty: l.qty, note: l.note ?? "" })) : (asked?.lines ?? []).map((l) => ({ productId: l.productId, qty: l.qty, note: l.note ?? "" }));
  const lines = from.filter((l) => l.qty > 0 && !!l.productId && productIds.includes(l.productId));
  const wanted = v?.terms.deliverBy ?? asked?.deliverBy ?? "";
  return {
    lines: lines.length ? lines : [blank()],
    deliverBy: wanted > SF_TODAY ? wanted : "",
    wish: asked?.paymentWish ?? "",
    message: r?.est && v && r.state === "expired" ? `The same items as estimate ${r.est.no}, which ran out on ${day(v.validTill)}.` : "",
  };
}

function NewRequest() {
  const navigate = useNavigate();
  const s = useDealer();
  const d = s.c;
  const products = useStore(productsStore);
  const all = useDealerRequests(d.id, s.company);
  const [params] = useSearchParams();
  const [seed] = React.useState(() =>
    seedFrom(
      findRequest(all, params.get("from")),
      products.map((p) => p.id),
    ),
  );
  const [lines, setLines] = React.useState<DraftLine[]>(seed.lines);
  const [deliverBy, setDeliverBy] = React.useState(seed.deliverBy);
  const [wish, setWish] = React.useState(seed.wish);
  const [message, setMessage] = React.useState(seed.message);
  const [tried, setTried] = React.useState(false);
  if (!s.settings.can.rfq) return <Unavailable what="Asking for a price" />;

  const patch = (i: number, p: Partial<DraftLine>) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const good = lines.filter((l): l is DraftLine & { productId: string } => !!l.productId && l.qty > 0);
  const send = () => {
    setTried(true);
    if (!good.length) return;
    const o = createRfq(d.id, s.userName, {
      lines: good.map((l) => ({ productId: l.productId, qty: l.qty, ...(l.note.trim() ? { note: l.note.trim() } : {}) })),
      note: message,
      deliverBy: deliverBy || null,
      paymentWish: wish.trim() || null,
    });
    const no = o.rfqNo ?? o.id;
    notify(`Price request ${no} sent to ${s.company}`);
    navigate(dpPath(`requests/${no}`));
  };

  return (
    <>
      <Link to={dpPath("requests")} className="-ml-1 mb-4 inline-flex h-10 items-center gap-1.5 px-1 text-[12px] text-bz-text-muted hover:text-bz-text">
        <ArrowLeft size={14} /> All price requests
      </Link>
      <PageHead title="New price request" sub={`It goes to ${s.company}. They reply with an estimate you can accept, decline or ask to change.`} />

      {products.length === 0 ? (
        <EmptyNote>There are no products to ask about yet.</EmptyNote>
      ) : (
        <div className="max-w-[640px]">
          <h2 className="m-0 mb-1 text-[13px] font-semibold text-bz-text">What do you need?</h2>
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {lines.map((l, i) => {
              const p = l.productId ? productById(l.productId) : null;
              return (
                <li key={i} className="flex flex-col gap-2 py-3">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <Select
                        trigger="ghost"
                        className={cn("h-10 w-full justify-between text-[12.5px]", tried && !good.length && !l.productId && "border-bz-red-mark")}
                        value={l.productId}
                        onChange={(v) => patch(i, { productId: v })}
                        label={p ? p.name : "Choose a product"}
                        options={products.map((x) => ({ value: x.id, label: x.name, hint: `${x.pack ? `${x.pack} · ` : ""}NPR ${npr(priceFor(x, d))} now`, group: x.brand || undefined, disabled: lines.some((y, j) => j !== i && y.productId === x.id) }))}
                        width={320}
                        searchable
                      />
                    </div>
                    <QtyStepper value={l.qty} onChange={(v) => patch(i, { qty: Math.max(1, v) })} unit={p?.unit} compact />
                    <button type="button" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} className="flex size-10 shrink-0 items-center justify-center rounded-bz-md text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-30" aria-label="Remove this product">
                      <X size={14} />
                    </button>
                  </div>
                  <input value={l.note} onChange={(e) => patch(i, { note: e.target.value })} placeholder="Size, flavour or packing (optional)" aria-label="Note for this product" className={cn(INPUT, "h-10 bg-bz-surface")} />
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => setLines((ls) => [...ls, blank()])} className="mt-2 inline-flex h-10 items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">
            <Plus size={14} /> Add a product
          </button>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Needed by" hint="Optional">
              <input type="date" value={deliverBy} min={addDays(SF_TODAY, 1)} onChange={(e) => setDeliverBy(e.target.value)} className={cn(INPUT, "h-10 bg-bz-surface")} />
            </Field>
            <Field label="Payment terms you'd like" hint="Optional">
              <input value={wish} onChange={(e) => setWish(e.target.value)} placeholder="45 days credit, part in advance…" className={cn(INPUT, "h-10 bg-bz-surface")} />
            </Field>
          </div>
          <Field label="Message" className="mt-4">
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Who it is for, the price you are hoping for…" className={cn(TEXTAREA, "min-h-[84px] bg-bz-surface")} />
          </Field>

          {tried && !good.length && <p className="m-0 mt-3 text-[11.5px] text-bz-red">Choose at least one product.</p>}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
            <Link to={dpPath("requests")} className={SOFT}>
              Cancel
            </Link>
            <button type="button" onClick={send} className={cn(LIME, "flex-1 sm:flex-none")}>
              Send request
            </button>
          </div>
        </div>
      )}
    </>
  );
}
