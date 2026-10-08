import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { Layers, Pencil, Plus, Table2, Tag, Tags, Trash2 } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, DANGER_BTN, Dialog, Field, GHOST, GHOST_SM, INPUT, MenuItem, MenuSep, NUM } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { SheetFrame } from "../sales/FulfilSheet";
import { Amount, useMedia } from "../sales/orders";
import { Cell, CellGrid, Section } from "../sales/parts";
import { Block, RecordShell } from "../sales/record";
import { useStore } from "../sales/store";
import type { Product, Scheme } from "./data";
import { day, npr, priceFor } from "./engine";
import { MoneyInput, SuggestInput } from "./network-form";
import { byBrand, customerOfType, mechanicText, schemeProductIds, toneForBrand } from "./network-model";
import { openQuickAdd } from "./quickadd";
import { logEvent } from "./records";
import { FX_SUB, FxDesk } from "./fx-desk";
import { ProductThumb, SfActivity, SfNoteFoot, TypeMark, sfPath } from "./sf";
import { productsStore, schemesStore, typesStore } from "./store";
import { NOTE, NotAvailable, QUIET_LINK, ROW, ROW_LINK, Rows, SUB, markRemoved, wasRemoved } from "./customers-kit";

// ════════════════════════════════════════════════════════════════════════════
// PRODUCTS — what you sell (the ITEM master, with brand and category)
//
// One desk, grouped by brand. A product carries ONE list price; every customer
// type's price is that less the type's % (engine.priceFor), so a row opens to
// the price each type pays, and the record adds the offers that name it.
// ════════════════════════════════════════════════════════════════════════════

/** The offers that name a product and have not ended — they also keep it from being deleted. */
const namedBy = (id: string, schemes: Scheme[]) => schemes.filter((s) => s.status !== "ended" && schemeProductIds(s.mechanic)?.includes(id));
const uniq = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export function ProductsPage() {
  const { no } = useParams();
  const navigate = useNavigate();
  const products = useStore(productsStore);
  const schemes = useStore(schemesStore);
  // The name column never collapses: below 1024px brand and pack leave the grid and join the sub line.
  const roomy = useMedia("(min-width: 1024px)");

  const open = (id: string) => navigate(sfPath(`products/${id}`));
  const add = () => openQuickAdd("product", { onCreated: open });
  // `products/new` is a link other desks may follow; a product is made in the quick-add dialog.
  React.useEffect(() => {
    if (no !== "new") return;
    navigate(sfPath("products"), { replace: true });
    add();
  }, [no]); // eslint-disable-line react-hooks/exhaustive-deps

  const brands = uniq(products.map((p) => p.brand));
  const categories = uniq(products.map((p) => p.category));
  const offered = new Set(products.filter((p) => namedBy(p.id, schemes).length > 0).map((p) => p.id));
  const gone = !!no && no !== "new" && !products.some((p) => p.id === no) && !wasRemoved(no);

  return (
    <FxDesk<Product>
      place="products"
      section="salesforce/products"
      noun={["product", "products"]}
      numberLabel="Code"
      numberWidth="116px"
      partyLabel="Product"
      amountLabel="List price"
      showPeriod={false}
      searchPlaceholder="Name, code, brand or category"
      rows={products}
      noOf={(p) => p.id}
      numberOf={(p) => p.code}
      rowLabel={(p) => p.name}
      searchText={(p) => `${p.name} ${p.code} ${p.brand} ${p.category}`}
      picks={[{ key: "offer", label: "In an offer", value: offered.size, test: (p) => offered.has(p.id), title: "Named by an offer that has not ended" }]}
      views={[
        { key: "brand", label: "By brand", icon: Tags, groups: (rs) => byBrand(rs).map((g) => ({ key: g.brand, label: g.brand, rows: rs.filter((p) => (p.brand.trim() || "No brand") === g.brand) })) },
        { key: "all", label: "All", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
      ]}
      filters={[
        ...brands.map((b) => ({ value: `b:${b}`, label: b, group: "Brand", test: (p: Product) => p.brand.trim() === b })),
        ...categories.map((c) => ({ value: `c:${c}`, label: c, group: "Category", test: (p: Product) => p.category.trim() === c })),
      ]}
      sorts={[
        { key: "az", label: "Name", by: (p) => p.name.toLowerCase() },
        { key: "code", label: "Code", by: (p) => p.code.toLowerCase() },
        { key: "price", label: "List price", by: (p) => p.listPrice, desc: true },
      ]}
      columns={
        roomy
          ? [
              { key: "brand", label: "Brand", width: "116px", render: (p) => p.brand || <span className="text-bz-text-soft">—</span> },
              { key: "pack", label: "Pack", width: "96px", render: (p) => (p.pack ? <span className={NUM}>{p.pack}</span> : <span className="text-bz-text-soft">—</span>) },
            ]
          : []
      }
      primary={(p) => ({
        title: (
          <span className="flex min-w-0 items-center gap-2.5">
            <ProductThumb product={p} size={26} />
            <span className="min-w-0">
              <span className="block truncate">{p.name}</span>
              <span className={FX_SUB}>{(roomy ? [p.category] : [p.brand, p.pack, p.category]).filter(Boolean).join(" · ")}</span>
            </span>
          </span>
        ),
      })}
      amount={(p) => ({ value: <Amount value={p.listPrice} />, sub: `per ${p.unit || "unit"}` })}
      bulk={[
        {
          label: "Set brand",
          icon: Tag,
          enabled: (rs) => rs.length > 0,
          hidden: () => brands.length === 0,
          choose: { options: brands.map((b) => ({ value: b, label: b })), placeholder: "Brand" },
          run: (rs, brand = "") => {
            const todo = rs.filter((p) => p.brand.trim() !== brand);
            const skip = rs.filter((p) => p.brand.trim() === brand);
            const tone = toneForBrand(brand, products);
            const ids = new Set(todo.map((p) => p.id));
            productsStore.set((ps) => ps.map((x) => (ids.has(x.id) ? { ...x, brand, tone } : x)));
            todo.forEach((p) => logEvent(p.id, `moved it from ${p.brand || "no brand"} to ${brand || "no brand"}`));
            return { done: todo.length, skipped: skip.map((p) => `${p.name} is already ${brand}`), skippedIds: skip.map((p) => p.id), verb: `moved to ${brand}` };
          },
        },
        {
          label: "Set category",
          icon: Layers,
          enabled: (rs) => rs.length > 0,
          hidden: () => categories.length === 0,
          choose: { options: categories.map((c) => ({ value: c, label: c })), placeholder: "Category" },
          run: (rs, category = "") => {
            const todo = rs.filter((p) => p.category.trim() !== category);
            const skip = rs.filter((p) => p.category.trim() === category);
            const ids = new Set(todo.map((p) => p.id));
            productsStore.set((ps) => ps.map((x) => (ids.has(x.id) ? { ...x, category } : x)));
            todo.forEach((p) => logEvent(p.id, "changed its code, category, unit or pack"));
            return { done: todo.length, skipped: skip.map((p) => `${p.name} is already in ${category}`), skippedIds: skip.map((p) => p.id), verb: `moved to ${category}` };
          },
        },
      ]}
      // It has nothing to export, so the shared Export chip stands down.
      exportMenu={<></>}
      newLabel="New product"
      onNew={add}
      renderPanel={(p, ctx) => (ctx.mode === "details" ? <ProductEdit key={`${p.id}-edit`} p={p} ctx={ctx} /> : <ProductPanel key={p.id} p={p} ctx={ctx} />)}
      renderExtra={({ go }) => gone && <NotAvailable text="This product isn't available." back="Back to products" onBack={() => go(null)} />}
    />
  );
}

// ── The record ──────────────────────────────────────────────────────────────

function ProductPanel({ p, ctx }: { p: Product; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const types = useStore(typesStore);
  const schemes = useStore(schemesStore);
  const [asking, setAsking] = React.useState(false);

  const naming = namedBy(p.id, schemes);
  const orderWide = schemes.filter((s) => s.status === "live" && schemeProductIds(s.mechanic) === null && s.applies === "order");
  const edit = () => ctx.go(p.id, { do: "details" });

  const remove = () => {
    setAsking(false);
    // Leave the record as it goes, so the desk never draws "not available" for a product just deleted.
    markRemoved(p.id);
    ctx.go(null);
    productsStore.set((ps) => ps.filter((x) => x.id !== p.id));
    logEvent(p.id, `deleted ${p.name}`);
  };

  return (
    <RecordShell
      ctx={ctx}
      no={p.code}
      image={<ProductThumb product={p} size={40} />}
      title={p.name}
      amount={<Amount value={p.listPrice} currency="NPR" />}
      meta={[p.brand || "No brand", `per ${p.unit || "unit"}`, ...(p.pack ? [<span key="k" className={NUM}>{p.pack}</span>] : []), ...(p.category ? [p.category] : [])]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} onClick={() => (close(), edit())}>
            Edit details
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Trash2} danger onClick={() => (close(), setAsking(true))}>
            Delete product…
          </MenuItem>
        </>
      )}
      foot={<SfNoteFoot id={p.id} />}
    >
      <Block
        title="Details"
        right={
          <button type="button" className={cn(GHOST_SM, "h-7")} onClick={edit}>
            <Pencil size={11} /> Edit
          </button>
        }
      >
        <CellGrid>
          <Cell label="Brand">{p.brand || <span className="text-bz-text-soft">—</span>}</Cell>
          <Cell label="Category">{p.category || <span className="text-bz-text-soft">—</span>}</Cell>
          <Cell label="List price">
            <Amount value={p.listPrice} currency="NPR" />
            <span className={SUB}>Before tax, per {p.unit || "unit"}</span>
          </Cell>
          <Cell label="Cost">
            {p.cost > 0 ? (
              <>
                <Amount value={p.cost} currency="NPR" />
                {p.listPrice > 0 && <span className={cn(SUB, NUM)}>{Math.round(((p.listPrice - p.cost) / p.listPrice) * 100)}% margin at list price</span>}
              </>
            ) : (
              <span className="text-bz-text-soft">—</span>
            )}
          </Cell>
          <Cell label="Sold by">{p.unit || <span className="text-bz-text-soft">—</span>}</Cell>
          <Cell label="Pack">{p.pack ? <span className={NUM}>{p.pack}</span> : <span className="text-bz-text-soft">—</span>}</Cell>
        </CellGrid>
      </Block>

      <Block
        title="Price by customer type"
        count={types.length}
        right={
          types.length === 0 && (
            <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => openQuickAdd("type")}>
              <Plus size={12} /> New customer type
            </button>
          )
        }
      >
        {types.length === 0 ? (
          <p className={NOTE}>Every customer pays the list price.</p>
        ) : (
          <Rows>
            {types.map((t) => (
              <div key={t.id} className={ROW}>
                <TypeMark name={t.name} color={t.color} className="min-w-0 flex-1 text-[12px] text-bz-text" />
                <span className={cn("shrink-0 text-[11.5px] text-bz-text-muted", NUM)}>{t.priceOff ? `${t.priceOff}% off` : "List price"}</span>
                <Amount value={priceFor(p, customerOfType(t.id))} className="w-[104px] shrink-0 text-right font-semibold text-bz-text" />
              </div>
            ))}
          </Rows>
        )}
      </Block>

      <div className="border-b border-bz-line-soft">
        <Section title="Offers on it" count={naming.length} summary={naming.length ? naming.map((s) => s.name).join(" · ") : "None"} defaultOpen={naming.length > 0 && naming.length <= 4}>
          {naming.length === 0 ? (
            <p className={NOTE}>No offer names this product.</p>
          ) : (
            <Rows>
              {naming.map((s) => (
                <button key={s.id} type="button" onClick={() => navigate(sfPath(`schemes/${s.id}`))} className={ROW_LINK}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-bz-text">{s.name}</span>
                    <span className={cn(SUB, NUM)}>
                      {mechanicText(s.mechanic)} · {s.status === "live" ? `until ${day(s.to)}` : s.status === "scheduled" ? `from ${day(s.from)}` : s.status}
                    </span>
                  </span>
                </button>
              ))}
            </Rows>
          )}
          {orderWide.length > 0 && <p className={cn(NOTE, "mt-2")}>{orderWide.length === 1 ? `${orderWide[0].name} also works` : `${orderWide.length} order-wide offers also work`} on any order it is in.</p>}
          <button type="button" onClick={() => navigate(sfPath("schemes"))} className={cn(QUIET_LINK, "mt-2")}>
            Open Schemes
          </button>
        </Section>
      </div>

      <SfActivity ids={[p.id]} />

      <Dialog
        open={asking}
        size="sm"
        eyebrow={p.code}
        title={naming.length ? `${p.name} can't be deleted` : `Delete ${p.name}?`}
        onClose={() => setAsking(false)}
        foot={
          naming.length ? (
            <button type="button" className={GHOST} onClick={() => setAsking(false)}>
              Close
            </button>
          ) : (
            <>
              <button type="button" className={GHOST} onClick={() => setAsking(false)}>
                Keep it
              </button>
              <button type="button" className={DANGER_BTN} onClick={remove}>
                Delete
              </button>
            </>
          )
        }
      >
        <p className="m-0 text-[12px] leading-relaxed text-bz-text-muted">
          {naming.length ? `${naming.map((s) => s.name).join(", ")} ${naming.length === 1 ? "names" : "name"} it. Take it out of the offer first.` : "It leaves the product list. Orders that already have it keep their lines."}
        </p>
      </Dialog>
    </RecordShell>
  );
}

// ── Edit, as a sheet in the panel ───────────────────────────────────────────

type Draft = Pick<Product, "name" | "code" | "brand" | "category" | "unit" | "pack" | "listPrice" | "cost">;
const draftOf = (p: Product): Draft => ({ name: p.name, code: p.code, brand: p.brand, category: p.category, unit: p.unit, pack: p.pack, listPrice: p.listPrice, cost: p.cost });

function ProductEdit({ p, ctx }: { p: Product; ctx: PanelCtx }) {
  const products = useStore(productsStore);
  const [d, setD] = React.useState<Draft>(() => draftOf(p));
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const back = () => ctx.go(p.id);

  const name = d.name.trim();
  const code = d.code.trim();
  const error = !name ? "A name is required." : d.listPrice <= 0 ? "Enter a list price above 0." : code && products.some((x) => x.id !== p.id && x.code.toLowerCase() === code.toLowerCase()) ? `Another product already has the code ${code}.` : null;

  const save = () => {
    if (error) return setRefusal(error);
    const next: Product = { ...p, ...d, name, code: code || p.id, brand: d.brand.trim(), category: d.category.trim(), unit: d.unit.trim(), pack: d.pack.trim(), tone: d.brand.trim() === p.brand ? p.tone : toneForBrand(d.brand, products.filter((x) => x.id !== p.id)) };
    productsStore.set((ps) => ps.map((x) => (x.id === p.id ? next : x)));
    const changes: string[] = [];
    if (next.name !== p.name) changes.push(`renamed it from ${p.name} to ${next.name}`);
    if (next.listPrice !== p.listPrice) changes.push(`changed the list price from NPR ${npr(p.listPrice)} to NPR ${npr(next.listPrice)}`);
    if (next.cost !== p.cost) changes.push(`changed the cost from NPR ${npr(p.cost)} to NPR ${npr(next.cost)}`);
    if (next.brand !== p.brand) changes.push(`moved it from ${p.brand || "no brand"} to ${next.brand || "no brand"}`);
    if (next.code !== p.code || next.category !== p.category || next.unit !== p.unit || next.pack !== p.pack) changes.push("changed its code, category, unit or pack");
    changes.forEach((w) => logEvent(p.id, w));
    ctx.show("success", !changes.length ? "Nothing changed" : next.listPrice !== p.listPrice ? `${next.name} saved · new orders use the new price` : `${next.name} saved`);
    back();
  };

  return (
    <RecordShell ctx={ctx} no="" back={{ label: p.code, onClick: back }} title={`Edit ${p.name}`}>
      <div className="flex h-full min-h-0 flex-col">
        <SheetFrame
          onCommit={save}
          refusal={refusal}
          onDismissRefusal={() => setRefusal(null)}
          foot={
            <>
              <button type="button" className={cn(GHOST, "ml-auto")} onClick={back}>
                Cancel
              </button>
              <button type="button" className={BTN} onClick={save}>
                Save
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
            <Field label="Name" required className="sm:col-span-2">
              <input autoFocus value={d.name} onChange={(e) => set("name", e.target.value)} className={INPUT} />
            </Field>
            <Field label="Brand">
              <SuggestInput value={d.brand} onChange={(v) => set("brand", v)} suggestions={products.map((x) => x.brand)} />
            </Field>
            <Field label="Category">
              <SuggestInput value={d.category} onChange={(v) => set("category", v)} suggestions={products.map((x) => x.category)} />
            </Field>
            <Field label="List price, before tax" required>
              <MoneyInput value={d.listPrice || null} onChange={(v) => set("listPrice", v ?? 0)} blank ariaLabel="List price" />
            </Field>
            <Field label="Cost">
              <MoneyInput value={d.cost || null} onChange={(v) => set("cost", v ?? 0)} blank ariaLabel="Cost" />
            </Field>
            <Field label="Sold by">
              <input value={d.unit} onChange={(e) => set("unit", e.target.value)} className={INPUT} placeholder="case" />
            </Field>
            <Field label="Pack">
              <input value={d.pack} onChange={(e) => set("pack", e.target.value)} className={INPUT} placeholder="12 × 1L" />
            </Field>
            <Field label="Code">
              <input value={d.code} onChange={(e) => set("code", e.target.value)} className={cn(INPUT, NUM)} />
            </Field>
          </div>
        </SheetFrame>
      </div>
    </RecordShell>
  );
}

export const PRODUCTS_ROUTES = [
  { path: "design/salesforce/products", Component: ProductsPage },
  { path: "design/salesforce/products/:no", Component: ProductsPage },
];
