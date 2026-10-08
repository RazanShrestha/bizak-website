import * as React from "react";
import { Plus, X } from "lucide-react";
import { cn } from "../ui/utils";
import { Dialog, Field, INPUT, NUM, Select } from "../sales/bzw";
import { useStore } from "../sales/store";
import { SF_TODAY } from "../salesforce/data";
import type { Customer, SecondarySale } from "../salesforce/data";
import { compact, day, npr, productById } from "../salesforce/engine";
import { nextId } from "../salesforce/persist";
import { logEvent } from "../salesforce/records";
import { customersStore, productsStore, secondaryStore } from "../salesforce/store";
import { EmptyNote, Figures, Money, ProductThumb, Section } from "../salesforce/ui";
import { DealerShell, pagesFor } from "./shell";
import { LIME, PageHead, QtyStepper, SOFT, Unavailable } from "./kit";
import { notify, stockCountsStore, toastStore, useDealer } from "./portal";
import type { StockCount } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// MY BUSINESS — the dealer's own notebook (owner decisions #13 and #26)
//
// A plain, standalone notebook: the dealer's sales to its shops and the stock
// counts it types in. Nothing here is derived from the company's orders, stock
// or books, and nothing here changes them — our sales order to the dealer is
// the dealer's purchase and lives under Orders. The only company data read is
// the product list (to name what was sold or counted) and the shops listed as
// served by this dealer, which are its own network.
// ════════════════════════════════════════════════════════════════════════════

const saleValue = (x: SecondarySale) => x.lines.reduce((s, l) => s + l.qty * l.price, 0);
const monthName = (ym: string) => new Date(`${ym}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const ROW_BTN = "flex w-full min-h-[56px] items-center gap-3 px-1 py-2.5 text-left hover:bg-bz-paper-warm/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bz-fire";

/** A removal the dealer can take back from the toast. */
function removed(text: string, undo: () => void) {
  toastStore.set(() => ({ id: Date.now(), kind: "info", text, action: { label: "Undo", run: undo } }));
}

export function DealerBusinessPage() {
  return (
    <DealerShell page="business">
      <Business />
    </DealerShell>
  );
}

type SaleOpen = { sale: SecondarySale | null; shopId: string | null } | null;
type CountOpen = { row: StockCount | null } | null;

function Business() {
  const s = useDealer();
  const d = s.c;
  const customers = useStore(customersStore);
  const products = useStore(productsStore);
  const secondary = useStore(secondaryStore);
  const counts = useStore(stockCountsStore);
  const [saleOpen, setSaleOpen] = React.useState<SaleOpen>(null);
  const [countOpen, setCountOpen] = React.useState<CountOpen>(null);
  const [allSales, setAllSales] = React.useState(false);
  const [allShops, setAllShops] = React.useState(false);
  if (!pagesFor(s).has("business")) return <Unavailable what="My business" />;

  const sales = secondary.filter((x) => x.dealerId === d.id).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const shops = customers.filter((c) => c.parentId === d.id).sort((a, b) => a.name.localeCompare(b.name));
  const stock = [...(counts[d.id] ?? [])].sort((a, b) => productById(a.productId).name.localeCompare(productById(b.productId).name));
  const lastCount = stock.reduce<string | null>((m, x) => (!m || x.countedOn > m ? x.countedOn : m), null);

  // Sales by month, newest first — only from the sales written here.
  const months = [...new Set(sales.map((x) => x.date.slice(0, 7)))].sort().reverse().slice(0, 6);
  const byMonth = months.map((m) => {
    const inMonth = sales.filter((x) => x.date.startsWith(m));
    return { month: m, value: inMonth.reduce((sum, x) => sum + saleValue(x), 0), shops: new Set(inMonth.map((x) => x.retailerId ?? x.retailerName.toLowerCase())).size };
  });
  const maxMonth = Math.max(1, ...byMonth.map((m) => m.value));
  const thisMonth = SF_TODAY.slice(0, 7);
  const soldThisMonth = byMonth.find((m) => m.month === thisMonth)?.value ?? 0;

  const lastSaleTo = (id: string) => sales.find((x) => x.retailerId === id)?.date ?? null;
  const shownSales = allSales ? sales : sales.slice(0, 8);
  const shownShops = allShops ? shops : shops.slice(0, 8);
  const newSale = (shopId: string | null = null) => setSaleOpen({ sale: null, shopId });

  return (
    <>
      <PageHead
        title="My business"
        sub={`Your own notebook for sales to your shops and your stock. Only you see it; it doesn't change anything with ${s.company}.`}
        actions={
          <>
            <button type="button" onClick={() => setCountOpen({ row: null })} className={SOFT}>
              Count stock
            </button>
            <button type="button" onClick={() => newSale()} className={LIME}>
              Record a sale
            </button>
          </>
        }
      />

      <Figures
        items={[
          { label: "Sold this month", value: <Money value={soldThisMonth} />, sub: "to your shops" },
          { label: "Sales recorded", value: sales.length, sub: sales.length ? `since ${day(sales[sales.length - 1].date)}` : "none yet" },
          { label: "Stock counted", value: stock.length, sub: lastCount ? `last on ${day(lastCount)}` : "no counts yet" },
          { label: "My shops", value: shops.length, sub: "served by you" },
        ]}
      />

      <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Section title="My sales to shops" count={sales.length}>
          {sales.length === 0 ? (
            <EmptyNote
              action={
                <button type="button" onClick={() => newSale()} className={SOFT}>
                  Record a sale
                </button>
              }
            >
              Each sale you record to one of your shops shows here.
            </EmptyNote>
          ) : (
            <>
              <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
                {shownSales.map((x) => (
                  <li key={x.id}>
                    <button type="button" onClick={() => setSaleOpen({ sale: x, shopId: x.retailerId })} className={ROW_BTN} aria-label={`Edit the sale to ${x.retailerName}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium text-bz-text">{x.retailerName}</span>
                        <span className="block truncate text-[11px] text-bz-text-soft">
                          {day(x.date)} · {x.lines.map((l) => `${l.qty} ${productById(l.productId).name}`).join(", ")}
                        </span>
                      </span>
                      <Money value={saleValue(x)} code={false} className="text-[12.5px] font-medium text-bz-text" />
                    </button>
                  </li>
                ))}
              </ul>
              {sales.length > 8 && (
                <button type="button" onClick={() => setAllSales(!allSales)} className={cn(SOFT, "mt-4")}>
                  {allSales ? "Show fewer" : `Show all ${sales.length}`}
                </button>
              )}
            </>
          )}
        </Section>

        <Section title="Sales by month">
          {byMonth.length === 0 ? (
            <p className="m-0 text-[12.5px] text-bz-text-muted">The sales you record add up here, month by month.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {byMonth.map((m) => (
                <li key={m.month}>
                  <div className={cn("mb-1.5 flex items-baseline justify-between gap-3 text-[12px]", NUM)}>
                    <span className="text-bz-text">
                      {monthName(m.month)}
                      {m.month === thisMonth && <span className="text-bz-text-soft"> · so far</span>}
                    </span>
                    <span className="text-bz-text-muted">
                      NPR {compact(m.value)} · {m.shops} {m.shops === 1 ? "shop" : "shops"}
                    </span>
                  </div>
                  <span className="block h-2 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
                    <span className={cn("block h-full rounded-bz-pill", m.month === thisMonth ? "bg-bz-leaf-deep" : "bg-bz-pos-deep")} style={{ width: `${(m.value / maxMonth) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Section title="My stock" count={stock.length}>
          {stock.length === 0 ? (
            <EmptyNote
              action={
                <button type="button" onClick={() => setCountOpen({ row: null })} className={SOFT}>
                  Count stock
                </button>
              }
            >
              Write down how much you have of each product. Your counts show here with the day you counted.
            </EmptyNote>
          ) : (
            <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
              {stock.map((x) => {
                const p = productById(x.productId);
                return (
                  <li key={x.id}>
                    <button type="button" onClick={() => setCountOpen({ row: x })} className={ROW_BTN} aria-label={`Edit the count of ${p.name}`}>
                      <ProductThumb product={p} size={32} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium text-bz-text">{p.name}</span>
                        <span className={cn("block text-[11px] text-bz-text-soft", NUM)}>Counted on {day(x.countedOn)}</span>
                      </span>
                      <span className={cn("shrink-0 text-right text-[12.5px] font-medium text-bz-text", NUM)}>
                        {x.qty} {p.unit || "unit"}
                        {x.qty === 1 ? "" : "s"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title="My shops" count={shops.length}>
          {shops.length === 0 ? (
            <p className="m-0 text-[12.5px] text-bz-text-muted">Shops listed as served by you show here. You can still record a sale to anyone by name.</p>
          ) : (
            <>
              <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
                {shownShops.map((r) => {
                  const last = lastSaleTo(r.id);
                  return (
                    <li key={r.id} className="flex min-h-[56px] items-center gap-3 px-1 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium text-bz-text">{r.name}</span>
                        <span className={cn("block truncate text-[11px] text-bz-text-soft", NUM)}>{[r.city, last ? `last sale ${day(last)}` : "no sale recorded yet"].filter(Boolean).join(" · ")}</span>
                      </span>
                      <button type="button" onClick={() => newSale(r.id)} className={cn(SOFT, "h-9 shrink-0 px-3")} aria-label={`Record a sale to ${r.name}`}>
                        Sale
                      </button>
                    </li>
                  );
                })}
              </ul>
              {shops.length > 8 && (
                <button type="button" onClick={() => setAllShops(!allShops)} className={cn(SOFT, "mt-4")}>
                  {allShops ? "Show fewer" : `Show all ${shops.length}`}
                </button>
              )}
            </>
          )}
        </Section>
      </div>

      <SaleDialog open={saleOpen} onClose={() => setSaleOpen(null)} shops={shops} hasProducts={products.length > 0} />
      <CountDialog open={countOpen} onClose={() => setCountOpen(null)} hasProducts={products.length > 0} />
    </>
  );
}

// ── A sale to a shop: new or edited ─────────────────────────────────────────

type SaleLine = { productId: string | null; qty: number; price: number };

function SaleDialog({ open, onClose, shops, hasProducts }: { open: SaleOpen; onClose: () => void; shops: Customer[]; hasProducts: boolean }) {
  const s = useDealer();
  const products = useStore(productsStore);
  const secondary = useStore(secondaryStore);
  const editing = open?.sale ?? null;
  const [shopId, setShopId] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState(SF_TODAY);
  const [lines, setLines] = React.useState<SaleLine[]>([{ productId: null, qty: 1, price: 0 }]);
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const x = open.sale;
    const known = x?.retailerId && shops.some((r) => r.id === x.retailerId) ? x.retailerId : null;
    setShopId(x ? known : open.shopId);
    setName(x && !known ? x.retailerName : "");
    setDate(x?.date ?? SF_TODAY);
    setLines(x ? x.lines.map((l) => ({ ...l })) : [{ productId: null, qty: 1, price: 0 }]);
    setTried(false);
    // Reset only when the dialog opens on a sale, not on every store change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const shop = shops.find((r) => r.id === shopId) ?? null;
  const who = shop?.name ?? name.trim();
  const good = lines.filter((l): l is SaleLine & { productId: string } => !!l.productId && l.qty > 0);
  const total = good.reduce((sum, l) => sum + l.qty * l.price, 0);
  const valid = !!who && good.length > 0 && good.every((l) => l.price > 0) && date <= SF_TODAY;
  // The dealer's own last price for a product is the starting point — never the company's price list.
  const lastPrice = (pid: string) => secondary.filter((x) => x.dealerId === s.c.id).sort((a, b) => b.date.localeCompare(a.date)).flatMap((x) => x.lines).find((l) => l.productId === pid)?.price ?? 0;

  const save = () => {
    setTried(true);
    if (!valid) return;
    const record = { retailerId: shop?.id ?? null, retailerName: who, date, lines: good.map((l) => ({ productId: l.productId, qty: l.qty, price: l.price })) };
    if (editing) {
      secondaryStore.set((xs) => xs.map((y) => (y.id === editing.id ? { ...y, ...record } : y)));
      logEvent(editing.id, `changed the sale to ${who} (NPR ${npr(total)})`, s.userName);
      notify(`Sale to ${who} saved`);
    } else {
      const id = nextId("SS-", secondaryStore.get().map((x) => x.id), 4);
      secondaryStore.set((xs) => [{ id, dealerId: s.c.id, ...record }, ...xs]);
      logEvent(id, `recorded a sale to ${who} (NPR ${npr(total)})`, s.userName);
      notify(`Sale to ${who} recorded`);
    }
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    const at = secondaryStore.get().findIndex((y) => y.id === editing.id);
    secondaryStore.set((xs) => xs.filter((y) => y.id !== editing.id));
    logEvent(editing.id, "removed the sale", s.userName);
    removed(`Sale to ${editing.retailerName} removed`, () => {
      secondaryStore.set((xs) => (xs.some((y) => y.id === editing.id) ? xs : [...xs.slice(0, Math.max(0, at)), editing, ...xs.slice(Math.max(0, at))]));
      logEvent(editing.id, "put the sale back", s.userName);
    });
    onClose();
  };

  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      eyebrow="My business"
      title={editing ? `Sale to ${editing.retailerName}` : "Record a sale to a shop"}
      size="wide"
      foot={
        <>
          {editing && (
            <button type="button" onClick={remove} className={cn(SOFT, "mr-auto text-bz-red")}>
              Remove
            </button>
          )}
          <button type="button" onClick={onClose} className={SOFT}>
            Cancel
          </button>
          <button type="button" disabled={!hasProducts} onClick={save} className={LIME}>
            Save sale{total > 0 ? ` · NPR ${npr(total)}` : ""}
          </button>
        </>
      }
    >
      {!hasProducts ? (
        <p className="m-0 text-[12px]">There are no products to record yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
            <Field label="Sold to" required>
              {shops.length > 0 && (
                <Select
                  trigger="ghost"
                  className={cn("h-10 w-full justify-between text-[12.5px]", tried && !who && "border-bz-red-mark")}
                  value={shopId}
                  onChange={(v) => {
                    setShopId(v === "__other" ? null : v);
                    if (v !== "__other") setName("");
                  }}
                  label={shop ? shop.name : name ? "Someone else" : "Choose one of your shops"}
                  options={[...shops.map((r) => ({ value: r.id, label: r.name, hint: r.city })), { value: "__other", label: "Someone else — type the name" }]}
                  width={320}
                />
              )}
              {!shop && <input value={name} onChange={(e) => setName(e.target.value)} placeholder={shops.length ? "Or type a shop's name" : "Shop's name"} className={cn(INPUT, "h-10 bg-bz-surface", shops.length > 0 && "mt-2", tried && !who && "border-bz-red-mark")} aria-label="Shop's name" />}
            </Field>
            <Field label="Date">
              <input type="date" value={date} max={SF_TODAY} onChange={(e) => setDate(e.target.value || SF_TODAY)} className={cn(INPUT, "h-10 bg-bz-surface")} />
            </Field>
          </div>

          <div>
            <p className="m-0 mb-2 text-[11.5px] font-semibold text-bz-text">What you sold</p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {lines.map((l, i) => {
                const p = l.productId ? productById(l.productId) : null;
                return (
                  <li key={i} className="flex flex-wrap items-center gap-2">
                    <div className="min-w-[180px] flex-1">
                      <Select
                        trigger="ghost"
                        className={cn("h-10 w-full justify-between text-[12.5px]", tried && i === 0 && !l.productId && "border-bz-red-mark")}
                        value={l.productId}
                        onChange={(v) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, productId: v, price: x.price || lastPrice(v) } : x)))}
                        label={p ? p.name : "Choose a product"}
                        options={products.map((x) => ({ value: x.id, label: x.name, hint: x.pack, group: x.brand || undefined, disabled: lines.some((y, j) => j !== i && y.productId === x.id) }))}
                        width={320}
                        searchable
                      />
                    </div>
                    <QtyStepper value={l.qty} onChange={(v) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, qty: Math.max(1, v) } : x)))} unit={p?.unit} compact />
                    <span className="relative block w-[120px]">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">NPR</span>
                      <input
                        inputMode="numeric"
                        value={l.price ? l.price.toLocaleString("en-US") : ""}
                        onChange={(e) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, price: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)))}
                        className={cn(INPUT, "h-10 bg-bz-surface pl-11 text-right", NUM, tried && l.productId && l.price <= 0 && "border-bz-red-mark")}
                        aria-label="Price each"
                        title="Price each"
                      />
                    </span>
                    <button type="button" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} className="flex size-10 shrink-0 items-center justify-center rounded-bz-md text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text disabled:opacity-30" aria-label="Remove this line">
                      <X size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={() => setLines((ls) => [...ls, { productId: null, qty: 1, price: 0 }])} className="mt-3 inline-flex h-10 items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">
              <Plus size={14} /> Add a product
            </button>
            <p className="m-0 mt-1 text-[11px] text-bz-text-soft">Price each, as you sold it.</p>
          </div>
          {tried && !valid && <p className="m-0 text-[11.5px] text-bz-red">Say who you sold to and add at least one product with a price.</p>}
        </div>
      )}
    </Dialog>
  );
}

// ── A stock count: one product, how many, and the day it was counted ────────

function CountDialog({ open, onClose, hasProducts }: { open: CountOpen; onClose: () => void; hasProducts: boolean }) {
  const s = useDealer();
  const products = useStore(productsStore);
  const counts = useStore(stockCountsStore);
  const editing = open?.row ?? null;
  const mine = counts[s.c.id] ?? [];
  const [productId, setProductId] = React.useState<string | null>(null);
  const [qty, setQty] = React.useState("");
  const [countedOn, setCountedOn] = React.useState(SF_TODAY);
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setProductId(open.row?.productId ?? null);
    setQty(open.row ? String(open.row.qty) : "");
    setCountedOn(open.row?.countedOn ?? SF_TODAY);
    setTried(false);
  }, [open]);

  const p = productId ? productById(productId) : null;
  const n = qty.trim() === "" ? null : Number(qty);
  const valid = !!productId && n !== null && Number.isFinite(n) && n >= 0 && countedOn <= SF_TODAY;
  // One row per product: a new count of a product already written down replaces it.
  const clash = !editing && productId ? mine.find((x) => x.productId === productId) : undefined;

  const write = (fn: (rows: StockCount[]) => StockCount[]) => stockCountsStore.set((all) => ({ ...all, [s.c.id]: fn(all[s.c.id] ?? []) }));

  const save = () => {
    setTried(true);
    if (!valid || !productId || n === null) return;
    const target = editing ?? clash;
    const id = target?.id ?? nextId("SC-", Object.values(stockCountsStore.get()).flat().map((x) => x.id), 4);
    const row: StockCount = { id, productId, qty: n, countedOn };
    // An edit may move the count to a product that already has a row — that row goes, the edited one stays.
    write((rows) => [...rows.filter((x) => x.id !== id && x.productId !== productId), row]);
    logEvent(id, `counted ${n} ${productById(productId).name} on ${day(countedOn)}`, s.userName);
    notify(`${productById(productId).name}: ${n} counted`);
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    write((rows) => rows.filter((x) => x.id !== editing.id));
    logEvent(editing.id, "removed the count", s.userName);
    removed(`Count of ${productById(editing.productId).name} removed`, () => write((rows) => (rows.some((x) => x.productId === editing.productId) ? rows : [...rows, editing])));
    onClose();
  };

  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      eyebrow="My stock"
      title={editing ? `Count of ${productById(editing.productId).name}` : "Count stock"}
      foot={
        <>
          {editing && (
            <button type="button" onClick={remove} className={cn(SOFT, "mr-auto text-bz-red")}>
              Remove
            </button>
          )}
          <button type="button" onClick={onClose} className={SOFT}>
            Cancel
          </button>
          <button type="button" disabled={!hasProducts} onClick={save} className={LIME}>
            Save count
          </button>
        </>
      }
    >
      {!hasProducts ? (
        <p className="m-0 text-[12px]">There are no products to count yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Product" required>
            <Select
              trigger="ghost"
              className={cn("h-10 w-full justify-between text-[12.5px]", tried && !productId && "border-bz-red-mark")}
              value={productId}
              onChange={setProductId}
              label={p ? p.name : "Choose a product"}
              options={products.map((x) => ({ value: x.id, label: x.name, hint: x.pack, group: x.brand || undefined }))}
              width={320}
              searchable
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={p ? `How many ${p.unit || "unit"}s` : "How many"} required>
              <input
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                className={cn(INPUT, "h-10 bg-bz-surface text-right", NUM, tried && n === null && "border-bz-red-mark")}
                aria-label="Quantity counted"
              />
            </Field>
            <Field label="Counted on">
              <input type="date" value={countedOn} max={SF_TODAY} onChange={(e) => setCountedOn(e.target.value || SF_TODAY)} className={cn(INPUT, "h-10 bg-bz-surface")} />
            </Field>
          </div>
          {clash && (
            <p className="m-0 text-[11.5px] text-bz-text-muted">
              You counted {clash.qty} on {day(clash.countedOn)}. Saving replaces that count.
            </p>
          )}
          {tried && !valid && <p className="m-0 text-[11.5px] text-bz-red">Choose a product and say how many you have.</p>}
        </div>
      )}
    </Dialog>
  );
}
