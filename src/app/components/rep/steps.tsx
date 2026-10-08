import * as React from "react";
import { Link } from "react-router";
import { Camera, Check, SearchX } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, Empty, Field, GHOST, INPUT, LABEL, Meter, NUM, NumberField, Stat, Statline, Tabs } from "../sales/bzw";
import { Amount } from "../sales/orders";
import { MoneyList } from "../sales/record";
import { useStore } from "../sales/store";
import { STAGE_LABEL, STAGE_TONE } from "../salesforce/activationKit";
import { SF_NOW, SF_TODAY } from "../salesforce/data";
import type { Customer, Rep, Visit } from "../salesforce/data";
import { accountOf, day, eligible, evaluate, npr, priceFor } from "../salesforce/engine";
import { activityName, billedToText, isFirstOrder, orderTotal, stockCountsStore } from "../salesforce/field-data";
import { placeHubOrder } from "../salesforce/orders-parts";
import { nextId } from "../salesforce/persist";
import { takeReceipt } from "../salesforce/receipts";
import { logEvent } from "../salesforce/records";
import { ProductThumb, chipTone, sfPath } from "../salesforce/sf";
import { brandingStore, customersStore, hubStore, ledgerStore, posmStore, productsStore, schemesStore, visitsStore } from "../salesforce/store";
import { ChoiceList, Err, ListBlock, Meta, ORDER_STATE, PAD, PickField, ROW, ROWS, SearchBox } from "./kit";
import { Sheet, repToast } from "./shell";

// ════════════════════════════════════════════════════════════════════════════
// REP APP · STEPS — each opens as a full-height sheet over the visit
//
// Take an order → a sales order (SO-…, source "rep"), pending until the office
// approves it, priced and credit-checked by the one engine. At a shop a distributor serves, the rep picks who it is billed
// to (decision #26): the distributor (for the shop) or the shop direct — and
// price, offers and credit follow the one billed. Collect payment → the sales desk's customer receipt
// (RCP-…), waiting until accounts confirm it in Receipts. Count stock, request branding, brief on offers, take a photo,
// or tick a plain step with a short result. Each completes its playbook step
// and writes History.
// ════════════════════════════════════════════════════════════════════════════

export type StepProps = { visit: Visit; customer: Customer; rep: Rep; index: number; onClose: () => void };
/** A step that asks nothing of the customer record still opens when the customer was removed. */
export type PlainStepProps = Omit<StepProps, "customer"> & { customer: Customer | undefined; locked: boolean };

export function patchVisit(id: string, fn: (v: Visit) => Visit) {
  visitsStore.set((list) => list.map((v) => (v.id === id ? fn(v) : v)));
}

/** Tick step `index` of a visit with a short result, and say so in the visit's history. */
export function completeStep(visit: Visit, index: number, result: string, who: string, done = true) {
  patchVisit(visit.id, (v) => ({ ...v, acts: v.acts.map((a, i) => (i === index ? { ...a, done, result } : a)) }));
  const name = activityName(visit.acts[index]?.activityId ?? "");
  logEvent(visit.id, done ? `did "${name}"${result ? `: ${result}` : ""}` : `un-ticked "${name}"`, who);
}

const stamp = () => `${SF_TODAY} ${SF_NOW}`;
const TALL = "h-11 w-full";
/** Why a step that needs the rep at the shop will not open or change while the geofence says otherwise. */
export const AT_SHOP_ONLY = "At the shop only";

/** Search over a list inside a sheet: it stays in reach while the rows scroll under it. */
function StickyBar({ children }: { children: React.ReactNode }) {
  return <div className="sticky top-0 z-10 border-b border-bz-line-soft bg-bz-surface">{children}</div>;
}

// ── Take an order ───────────────────────────────────────────────────────────

export function OrderSheet({ visit, customer, rep, index, onClose }: StepProps) {
  const products = useStore(productsStore);
  const schemes = useStore(schemesStore);
  const hub = useStore(hubStore);
  const customers = useStore(customersStore);
  useStore(ledgerStore);
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [q, setQ] = React.useState("");
  const [note, setNote] = React.useState("");
  const [showCart, setShowCart] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  // The distributor that serves this shop, if it still exists. Billing it is the default.
  const parent = customer.parentId && customer.parentId !== customer.id ? customers.find((c) => c.id === customer.parentId) : undefined;
  const [via, setVia] = React.useState<"parent" | "direct">("parent");
  const billTo = parent && via === "parent" ? parent : customer;
  const throughParent = billTo.id !== customer.id;

  const lines = Object.entries(cart)
    .filter(([, n]) => n > 0)
    .map(([productId, qty]) => ({ productId, qty }));
  const firstOrder = isFirstOrder({ customerId: billTo.id }, hub);
  const ev = evaluate(billTo.id, lines, schemes, { firstOrder });
  const shown = products
    .filter((p) => !showCart || (cart[p.id] ?? 0) > 0)
    .filter((p) => !q.trim() || `${p.name} ${p.code} ${p.brand} ${p.category}`.toLowerCase().includes(q.trim().toLowerCase()));
  const existing = visit.orderId ? hub.find((o) => o.id === visit.orderId) : undefined;

  const submit = () => {
    if (!lines.length) return setRefusal("Add at least one product.");
    const { id } = placeHubOrder({
      customerId: billTo.id,
      forCustomerId: throughParent ? customer.id : null,
      source: "rep",
      byName: rep.name,
      repId: rep.id,
      at: stamp(),
      lines,
      note: note.trim(),
      status: ev.credit.ok ? "ready" : "review",
    });
    const billed = throughParent ? `for ${customer.name}, billed to ${billTo.name}` : "";
    const result = `${id}${throughParent ? ` · billed to ${billTo.name}` : ""} · NPR ${npr(ev.total)}${ev.credit.ok ? "" : " · needs review"}`;
    patchVisit(visit.id, (v) => ({ ...v, orderId: id }));
    if (throughParent) {
      // Ticked here rather than through completeStep so the visit's history names who was billed.
      patchVisit(visit.id, (v) => ({ ...v, acts: v.acts.map((a, i) => (i === index ? { ...a, done: true, result } : a)) }));
      logEvent(visit.id, `took an order ${billed} (${id})`, rep.name);
    } else completeStep(visit, index, result, rep.name);
    logEvent(id, `took the order on visit ${visit.id}${billed ? `, ${billed}` : ""}${ev.credit.ok ? "" : `. Credit check: ${ev.credit.reason}`}`, rep.name);
    logEvent(customer.id, `order ${id} taken by ${rep.name} on a visit${throughParent ? `, billed to ${billTo.name}` : ""}`, rep.name);
    if (throughParent) logEvent(billTo.id, `order ${id} for ${customer.name} taken by ${rep.name}`, rep.name);
    repToast(ev.credit.ok ? `${id} sent to the office` : `${id} sent · the office reviews it first`);
    onClose();
  };

  if (existing) {
    const st = ORDER_STATE[existing.status];
    const billed = billedToText(existing);
    return (
      <Sheet title="Order" sub={customer.name} onClose={onClose}>
        <div className={cn("border-b border-bz-line-soft py-3", PAD)}>
          <div className="flex items-center gap-2">
            <span className={cn("text-[11px] font-semibold text-bz-text-soft", NUM)}>{existing.id}</span>
            <Chip tone={st.tone}>{st.label}</Chip>
            <Amount value={orderTotal(existing)} currency="NPR" className="ml-auto text-[12.5px] font-semibold text-bz-text" />
          </div>
          <Meta className="mt-1.5" items={[billed && billed.replace(/^b/, "B"), existing.status === "rejected" && existing.rejectReason]} />
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      title="Take an order"
      sub={customer.name}
      onClose={onClose}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      foot={
        products.length === 0 ? undefined : (
          <div className="flex flex-col gap-2">
            {lines.length > 0 && !ev.credit.ok && (
              <p role="status" className="m-0 text-[11.5px] leading-snug text-bz-red">
                {throughParent ? `${billTo.name}: ` : ""}
                {ev.credit.reason}. {ev.credit.stop === "hard" ? "The office must approve it before it is billed." : "The office reviews it before it is billed."}
              </p>
            )}
            <div className="flex items-center gap-3">
              <span className="min-w-0 flex-1">
                <span className={cn(LABEL, "block")}>Total incl. VAT</span>
                <Amount value={ev.total} currency="NPR" className="text-[17px] font-semibold text-bz-text" />
              </span>
              <button type="button" className={cn(BTN, "h-11 px-5")} onClick={submit}>
                Send order
              </button>
            </div>
          </div>
        )
      }
    >
      {products.length === 0 ? (
        <Empty
          title="No products yet."
          action={
            <Link to={sfPath("products")} className={cn(GHOST, "h-10")}>
              Add products
            </Link>
          }
        />
      ) : (
        <>
          {parent && (
            <div className={cn("border-b border-bz-line-soft py-3", PAD)}>
              <Field label="Bill to">
                <ChoiceList<"parent" | "direct">
                  label="Bill to"
                  value={via}
                  onChange={setVia}
                  options={[
                    { value: "parent", label: parent.name, sub: `For ${customer.name}` },
                    { value: "direct", label: customer.name, sub: "Direct" },
                  ]}
                />
              </Field>
            </div>
          )}
          {(ev.applied.length > 0 || ev.hints.length > 0) && (
            <div className={cn("flex flex-col gap-2 border-b border-bz-line-soft py-3", PAD)}>
              {ev.applied.map((a) => (
                <p key={a.schemeId} className="m-0 flex items-start gap-2 text-[12px] text-bz-text">
                  <Check size={13} className="mt-0.5 shrink-0 text-bz-pos-deep" />
                  <span className="min-w-0 flex-1">
                    {a.text} <span className="text-bz-text-soft">· {a.name}</span>
                  </span>
                </p>
              ))}
              {ev.hints.map((h) => (
                <div key={h.schemeId}>
                  <p className="m-0 mb-1 text-[12px] text-bz-text-muted">
                    {h.text} <span className="text-bz-text-soft">· {h.name}</span>
                  </p>
                  <Meter pct={h.progress * 100} thin />
                </div>
              ))}
            </div>
          )}

          <StickyBar>
            <div className="px-2">
              <Tabs<"all" | "cart">
                value={showCart ? "cart" : "all"}
                onChange={(v) => setShowCart(v === "cart")}
                tabs={[
                  { value: "all", label: "All products" },
                  { value: "cart", label: "In order", count: lines.length || undefined },
                ]}
              />
            </div>
            <div className={cn("pb-2", PAD)}>
              <SearchBox value={q} onChange={setQ} placeholder="Search products" />
            </div>
          </StickyBar>

          {shown.length === 0 ? (
            showCart && !q.trim() ? (
              <Empty title="Nothing in the order yet." />
            ) : (
              <Empty title="No products match." icon={SearchX} />
            )
          ) : (
            <ul className={cn(ROWS, "border-t-0")}>
              {shown.map((p) => {
                const free = ev.lines.filter((l) => l.free && l.product.id === p.id).reduce((n, l) => n + l.qty, 0);
                return (
                  <li key={p.id} className={ROW}>
                    <ProductThumb product={p} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] text-bz-text">{p.name}</span>
                      <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                        {p.pack || p.unit} · <Amount value={priceFor(p, billTo)} />
                        {free > 0 && <span className="text-bz-pos-deep"> · +{free} free</span>}
                      </span>
                    </span>
                    <NumberField value={cart[p.id] ?? 0} onChange={(n) => (setRefusal(null), setCart((c) => ({ ...c, [p.id]: Math.max(0, Math.round(n)) })))} className="h-10 w-[112px]" ariaLabel={`Quantity of ${p.name}`} />
                  </li>
                );
              })}
            </ul>
          )}

          {lines.length > 0 && (
            <div className={cn("border-t border-bz-line-soft pb-4 pt-1", PAD)}>
              <MoneyList
                rows={[
                  { label: "Gross", value: <Amount value={ev.gross} /> },
                  ...(ev.discount > 0 ? [{ label: "Scheme discount", value: <Amount value={-ev.discount} /> }] : []),
                  ...(ev.freeValue > 0 ? [{ label: "Free goods (value)", value: <Amount value={ev.freeValue} />, soft: true }] : []),
                  { label: "VAT", value: <Amount value={ev.tax} /> },
                ]}
              />
              {ev.credit.limit !== null && (
                <p className="m-0 mt-2 text-right text-[11px] text-bz-text-soft">
                  {throughParent ? `${billTo.name}: ` : ""}credit left <Amount value={ev.credit.available ?? 0} className="text-bz-text-muted" /> of <Amount value={ev.credit.limit} />
                </p>
              )}
            </div>
          )}

          <div className={cn("border-t border-bz-line-soft py-4", PAD)}>
            <Field label="Note for the office">
              <input className={cn(INPUT, "h-10")} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
            </Field>
          </div>
        </>
      )}
    </Sheet>
  );
}

// ── Collect payment ─────────────────────────────────────────────────────────

export function CollectSheet({ visit, customer, rep, index, onClose }: StepProps) {
  const ledger = useStore(ledgerStore);
  const a = accountOf(customer.id, ledger);
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState<"cash" | "cheque">("cash");
  const [reference, setReference] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const value = Math.round(Number(amount.replace(/[^\d.]/g, "")) || 0);
  const noAmount = value <= 0;
  const noCheque = method === "cheque" && reference.trim().length === 0;
  const ok = !noAmount && !noCheque;

  const save = () => {
    if (!ok) return setTried(true);
    const { no } = takeReceipt({ customerId: customer.id, amount: value, method, reference, via: "rep", by: rep.name, repId: rep.id, pending: true, visitId: visit.id, tags: [] });
    completeStep(visit, index, `${no} · NPR ${npr(value)} ${method} · waiting for accounts`, rep.name);
    logEvent(customer.id, `${rep.name} collected NPR ${npr(value)} in ${method} (${no}); accounts to confirm`, rep.name);
    logEvent(no, `collected by ${rep.name} on visit ${visit.id}`, rep.name);
    repToast(`${no} saved · accounts confirm it`);
    onClose();
  };

  return (
    <Sheet
      title="Collect payment"
      sub={customer.name}
      onClose={onClose}
      foot={
        <button type="button" className={cn(BTN, TALL)} onClick={save}>
          Save receipt
        </button>
      }
    >
      <div className={cn("border-b border-bz-line bg-bz-paper py-2", PAD)}>
        <Statline>
          <Stat label="Owes" value={<Amount value={a.outstanding} />} />
          {a.overdue > 0 && <Stat label="Overdue" value={<Amount value={a.overdue} />} danger />}
          {a.pending > 0 && <Stat label="Waiting" value={<Amount value={a.pending} />} title="Receipts accounts have not confirmed yet" />}
        </Statline>
      </div>
      <div className={cn("flex flex-col gap-4 py-4", PAD)}>
        <Field label="Amount (NPR)" required hint={value > a.outstanding && a.outstanding > 0 ? "More than they owe. The rest stays as an advance." : undefined}>
          <input autoFocus inputMode="numeric" className={cn(INPUT, "h-11 text-[17px] font-semibold", NUM, tried && noAmount && "border-bz-red-mark")} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" aria-invalid={tried && noAmount} />
          {tried && noAmount && <Err>Enter the amount received.</Err>}
        </Field>
        <Field label="Paid by">
          <ChoiceList<"cash" | "cheque">
            label="Paid by"
            value={method}
            onChange={setMethod}
            options={[
              { value: "cash", label: "Cash" },
              { value: "cheque", label: "Cheque" },
            ]}
          />
        </Field>
        <Field label={method === "cheque" ? "Cheque number" : "Reference"} required={method === "cheque"}>
          <input className={cn(INPUT, "h-10", tried && noCheque && "border-bz-red-mark")} value={reference} onChange={(e) => setReference(e.target.value)} placeholder={method === "cheque" ? "004512, Nabil Bank" : "Optional"} aria-invalid={tried && noCheque} />
          {tried && noCheque && <Err>Enter the cheque number.</Err>}
        </Field>
      </div>
    </Sheet>
  );
}

// ── Count stock ─────────────────────────────────────────────────────────────

export function StockSheet({ visit, customer, rep, index, onClose }: StepProps) {
  const products = useStore(productsStore);
  const saved = useStore(stockCountsStore)[visit.id] ?? {};
  const [counts, setCounts] = React.useState<Record<string, number>>(saved);
  const [q, setQ] = React.useState("");
  const n = Object.values(counts).filter((x) => x > 0).length;
  const shown = products.filter((p) => !q.trim() || `${p.name} ${p.code} ${p.brand}`.toLowerCase().includes(q.trim().toLowerCase()));

  const save = () => {
    stockCountsStore.set((m) => ({ ...m, [visit.id]: Object.fromEntries(Object.entries(counts).filter(([, x]) => x > 0)) }));
    completeStep(visit, index, n ? `Counted ${n} product${n === 1 ? "" : "s"}` : "Shelf empty", rep.name);
    onClose();
  };
  return (
    <Sheet
      title="Count stock"
      sub={customer.name}
      onClose={onClose}
      foot={
        products.length === 0 ? undefined : (
          <button type="button" className={cn(BTN, TALL)} onClick={save}>
            {n ? `Save ${n} count${n === 1 ? "" : "s"}` : "Save as shelf empty"}
          </button>
        )
      }
    >
      {products.length === 0 ? (
        <Empty title="No products to count yet." />
      ) : (
        <>
          <StickyBar>
            <div className={cn("py-2", PAD)}>
              <SearchBox value={q} onChange={setQ} placeholder="Search products" />
            </div>
          </StickyBar>
          {shown.length === 0 ? (
            <Empty title="No products match." icon={SearchX} />
          ) : (
            <ul className={cn(ROWS, "border-t-0")}>
              {shown.map((p) => (
                <li key={p.id} className={ROW}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-bz-text">{p.name}</span>
                    <span className="block text-[10.5px] text-bz-text-soft">{p.unit || "units"} on the shelf</span>
                  </span>
                  <NumberField value={counts[p.id] ?? 0} onChange={(x) => setCounts((c) => ({ ...c, [p.id]: Math.max(0, Math.round(x)) }))} className="h-10 w-[112px]" ariaLabel={`Count of ${p.name}`} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Sheet>
  );
}

// ── Request branding ────────────────────────────────────────────────────────

export function BrandingSheet({ visit, customer, rep, index, onClose }: StepProps) {
  const posm = useStore(posmStore);
  const branding = useStore(brandingStore);
  const [posmId, setPosmId] = React.useState<string | null>(posm[0]?.id ?? null);
  const [qty, setQty] = React.useState(1);
  const [note, setNote] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const item = posm.find((x) => x.id === posmId);
  const already = branding.filter((b) => b.customerId === customer.id && b.stage !== "rejected");
  const ticked = !!visit.acts[index]?.done;

  const request = () => {
    if (!item || qty < 1) return setTried(true);
    const id = nextId("BR-", branding.map((b) => b.id), 3);
    brandingStore.set((b) => [...b, { id, customerId: customer.id, posmId: item.id, qty, stage: "requested", requestedBy: rep.name, requestedOn: SF_TODAY, campaignId: null, proof: false, note: note.trim(), installedOn: null }]);
    completeStep(visit, index, `Asked for ${qty} × ${item.name} (${id})`, rep.name);
    logEvent(id, `requested by ${rep.name} on visit ${visit.id}`, rep.name);
    logEvent(customer.id, `${rep.name} asked for ${qty} × ${item.name} (${id})`, rep.name);
    repToast(`${id} sent to Branding`);
    onClose();
  };
  const inPlace = () => {
    completeStep(visit, index, "Branding in place", rep.name);
    onClose();
  };
  const undo = () => {
    completeStep(visit, index, "", rep.name, false);
    onClose();
  };

  return (
    <Sheet
      title="Branding"
      sub={customer.name}
      onClose={onClose}
      foot={
        <div className="flex gap-2">
          {ticked ? (
            <button type="button" className={cn(GHOST, "h-11 flex-1")} onClick={undo}>
              Mark not done
            </button>
          ) : (
            <button type="button" className={cn(GHOST, "h-11 flex-1")} onClick={inPlace}>
              All in place
            </button>
          )}
          {posm.length > 0 && (
            <button type="button" className={cn(BTN, "h-11 flex-1")} onClick={request}>
              Request
            </button>
          )}
        </div>
      }
    >
      {already.length > 0 && (
        <ListBlock title="At this shop" count={already.length}>
          <ul className={ROWS}>
            {already.map((b) => (
              <li key={b.id} className={ROW}>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-bz-text">
                  {b.qty} × {posm.find((x) => x.id === b.posmId)?.name ?? "Removed item"}
                </span>
                <Chip tone={chipTone(STAGE_TONE[b.stage])}>{STAGE_LABEL[b.stage]}</Chip>
              </li>
            ))}
          </ul>
        </ListBlock>
      )}
      {posm.length === 0 ? (
        <Empty
          title="No branding items to request yet."
          action={
            <Link to={sfPath("branding")} className={cn(GHOST, "h-10")}>
              Open Branding
            </Link>
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 py-4", PAD)}>
          <Field label="Item" required>
            <PickField value={posmId} onChange={setPosmId} placeholder="Choose an item" ariaLabel="Item" invalid={tried && !item} options={posm.map((x) => ({ value: x.id, label: x.name, hint: `${x.stock} ${x.unit}${x.stock === 1 ? "" : "s"} in stock` }))} />
            {tried && !item && <Err>Choose an item.</Err>}
          </Field>
          <Field label="Quantity">
            <NumberField value={qty} onChange={(n) => setQty(Math.max(1, Math.round(n)))} min={1} className="h-10 w-[128px]" ariaLabel="Quantity" />
          </Field>
          <Field label="Where">
            <input className={cn(INPUT, "h-10")} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Side wall facing the road" />
          </Field>
        </div>
      )}
    </Sheet>
  );
}

// ── Brief on offers ─────────────────────────────────────────────────────────

export function OffersSheet({ visit, customer, rep, index, onClose }: StepProps) {
  const schemes = useStore(schemesStore);
  const live = schemes.filter((s) => s.status === "live" && !eligible(s, customer));
  const ticked = !!visit.acts[index]?.done;
  const done = () => {
    completeStep(visit, index, live.length ? `Briefed on ${live.length} offer${live.length === 1 ? "" : "s"}` : "No offers to brief", rep.name);
    onClose();
  };
  const undo = () => {
    completeStep(visit, index, "", rep.name, false);
    onClose();
  };
  return (
    <Sheet
      title="Offers for this shop"
      sub={customer.name}
      onClose={onClose}
      foot={
        ticked ? (
          <button type="button" className={cn(GHOST, TALL)} onClick={undo}>
            Mark not done
          </button>
        ) : (
          <button type="button" className={cn(BTN, TALL)} onClick={done}>
            {live.length ? "Briefed" : "Done"}
          </button>
        )
      }
    >
      {live.length === 0 ? (
        <Empty title="No offers for this customer today." />
      ) : (
        <ul className={cn(ROWS, "border-b border-t-0")}>
          {live.map((s) => (
            <li key={s.id} className={ROW}>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] text-bz-text">{s.name}</span>
                <span className="block text-[10.5px] text-bz-text-soft">
                  Until {day(s.to)}
                  {s.exclusive ? " · does not combine with other offers" : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

// ── Take a photo ────────────────────────────────────────────────────────────

/** Each press adds one photo to the visit and ticks the step with the count. The sheet stays open for the next one. */
export function PhotoSheet({ visit, customer, rep, index, locked, onClose }: PlainStepProps) {
  const add = () => {
    if (locked) return;
    const n = visit.photos + 1;
    patchVisit(visit.id, (v) => ({ ...v, photos: v.photos + 1 }));
    completeStep(visit, index, `${n} photo${n === 1 ? "" : "s"}`, rep.name);
  };
  return (
    <Sheet
      title={activityName(visit.acts[index]?.activityId ?? "")}
      sub={customer?.name}
      onClose={onClose}
      foot={
        locked ? undefined : (
          <button type="button" className={cn(BTN, TALL)} onClick={add}>
            <Camera size={14} /> {visit.photos ? "Add another photo" : "Take photo"}
          </button>
        )
      }
    >
      <Empty icon={Camera} title={visit.photos ? `${visit.photos} photo${visit.photos === 1 ? "" : "s"} on this visit` : "No photos yet."} />
      {locked && <p className={cn("m-0 text-center text-[11.5px] text-bz-red", PAD)}>{AT_SHOP_ONLY}</p>}
    </Sheet>
  );
}

// ── A plain step: tick it, with a short result ──────────────────────────────

export function PlainSheet({ visit, customer, rep, index, locked, onClose }: PlainStepProps) {
  const a = visit.acts[index];
  const [result, setResult] = React.useState(a?.result ?? "");
  const done = () => {
    if (locked) return;
    completeStep(visit, index, result.trim(), rep.name);
    onClose();
  };
  const undo = () => {
    if (locked) return;
    completeStep(visit, index, "", rep.name, false);
    onClose();
  };
  return (
    <Sheet
      title={activityName(a?.activityId ?? "")}
      sub={customer?.name}
      onClose={onClose}
      foot={
        locked ? undefined : a?.done ? (
          <button type="button" className={cn(GHOST, TALL)} onClick={undo}>
            Mark not done
          </button>
        ) : (
          <button type="button" className={cn(BTN, TALL)} onClick={done}>
            Mark done
          </button>
        )
      }
    >
      <div className={cn("flex flex-col gap-2 py-4", PAD)}>
        {a?.done ? (
          <div className="flex items-center gap-2">
            <Chip tone="positive">Done</Chip>
            {a.result && <span className="min-w-0 flex-1 text-[12.5px] text-bz-text">{a.result}</span>}
          </div>
        ) : (
          <Field label="Result">
            <input autoFocus className={cn(INPUT, "h-10")} value={result} onChange={(e) => setResult(e.target.value)} placeholder="Optional" onKeyDown={(e) => e.key === "Enter" && done()} />
          </Field>
        )}
        {locked && <p className="m-0 text-[11.5px] text-bz-red">{AT_SHOP_ONLY}</p>}
      </div>
    </Sheet>
  );
}
