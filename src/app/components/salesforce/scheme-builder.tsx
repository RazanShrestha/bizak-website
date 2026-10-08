import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowRight, CircleAlert, Copy, Lock, Plus, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, DocLink, Field, GHOST, GHOST_SM, ICON_BTN, ICON_BTN_SM, INPUT_SM, LABEL, Meter, NUM, NumberField, Refusal, Segmented, Select, Switch } from "../sales/bzw";
import type { SelectOption } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { Amount, ME } from "../sales/orders";
import { ChipRow, DateChip, Sep, TermChip } from "../sales/parts";
import { Block, MoneyList } from "../sales/record";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Product, Scheme, SchemeMechanic } from "./data";
import { customerById, day, eligible, evaluate, npr, productById, typeOf } from "./engine";
import type { CartLine } from "./engine";
import { linkToCampaign } from "./activationKit";
import { openQuickAdd } from "./quickadd";
import type { QuickAddKind } from "./quickadd";
import { logEvent } from "./records";
import { campaignsStore, customersStore, productsStore, schemesStore, typesStore } from "./store";
import { chipTone, sfPath } from "./sf";
import { APPLIES_TEXT, MECHANICS, STATUS, addDaysIso, defaultMechanic, itemsText, mechanicLabel, qualifyingCart, ruleText, schemeExtrasStore, typeName } from "./schemes-kit";
import type { MechanicKind } from "./schemes-kit";

// ════════════════════════════════════════════════════════════════════════════
// SCHEME COMPOSER — a scheme is written like a document
//
// The Schemes desk hosts it as its "new" surface and as a record's edit mode,
// so it takes the page the way the sales composer does: a slim head, one
// column of bands (mechanic → rule → who → when → budget → campaign) and a
// dock with the one commit. Beside the form an example order is priced by the
// one engine with this draft among the live schemes, so what it shows is what
// an order would get. A live scheme's rule is locked: orders already carry it,
// so a new rule is a copy.
// ════════════════════════════════════════════════════════════════════════════

const NEW_ID = "";

function blankScheme(): Scheme {
  return {
    id: NEW_ID,
    name: "",
    mechanic: defaultMechanic("free-goods"),
    typeIds: [],
    tiers: [],
    from: SF_TODAY,
    to: addDaysIso(SF_TODAY, 60),
    status: "draft",
    priority: 10,
    exclusive: false,
    budget: null,
    campaignId: null,
    applies: "order",
    owner: ME.id,
  };
}

const clone = (s: Scheme): Scheme => JSON.parse(JSON.stringify(s));

export function autoName(m: SchemeMechanic): string {
  if (m.kind === "free-goods") return `Buy ${m.buyQty} get ${m.getQty} — ${itemsText(m.buyItemIds)}`;
  const t = ruleText(m);
  return t.length <= 48 ? t : `${mechanicLabel(m.kind)} scheme`;
}

/** What still stops a save, and the band that answers it. */
type Need = { at: "rule" | "when" | "budget"; text: string };

function validate(s: Scheme): Need | null {
  const m = s.mechanic;
  const pctOk = (p: number) => p > 0 && p <= 100;
  const rule = (text: string): Need => ({ at: "rule", text });
  switch (m.kind) {
    case "free-goods":
      if (!m.buyItemIds.length) return rule("Pick the product the customer buys.");
      if (!m.getItemId) return rule("Pick the product given free.");
      if (m.buyQty < 1 || m.getQty < 1) return rule("Both quantities must be at least 1.");
      break;
    case "slab": {
      if (!m.itemIds.length) return rule("Pick the products the slab counts.");
      if (!m.slabs.length) return rule("Add at least one slab.");
      for (let i = 0; i < m.slabs.length; i++) {
        if (m.slabs[i].minQty < 1 || !pctOk(m.slabs[i].pct)) return rule("Each slab needs a quantity and a % between 0 and 100.");
        if (i > 0 && (m.slabs[i].minQty <= m.slabs[i - 1].minQty || m.slabs[i].pct <= m.slabs[i - 1].pct)) return rule("Each slab must start higher and give more than the one above it.");
      }
      break;
    }
    case "combo":
      if (m.needs.length < 2) return rule("A combo needs at least two groups.");
      if (m.needs.some((n) => !n.itemIds.length || n.qty < 1)) return rule("Each group needs products and a quantity.");
      if (!m.getItemId) return rule("Pick the product given free.");
      if (m.getQty < 1) return rule("The free quantity must be at least 1.");
      break;
    case "invoice-value":
      if (m.minValue <= 0 || !pctOk(m.pct)) return rule("Set the order value and a % between 0 and 100.");
      break;
    case "first-order":
    case "early-payment":
      if (!pctOk(m.pct)) return rule("Set a % between 0 and 100.");
      if (m.kind === "early-payment" && m.withinDays < 1) return rule("Set the number of days.");
      break;
    case "target-rebate":
      if (m.target <= 0 || !pctOk(m.pct) || !m.period.trim()) return rule("Set the target, the % and the period.");
      break;
    case "display":
      if (m.amount <= 0) return rule("Set the monthly amount.");
      break;
  }
  if (!s.from || !s.to || s.from > s.to) return { at: "when", text: "The end date must be on or after the start date." };
  if (s.budget && s.budget.total <= 0) return { at: "budget", text: "Set the budget, or choose no limit." };
  return null;
}

const nextSchemeId = (list: Scheme[]) => `SCH-${String(Math.max(0, ...list.map((s) => Number(s.id.replace(/\D/g, "")) || 0)) + 1).padStart(3, "0")}`;

// ── Small controls ──────────────────────────────────────────────────────────

const ADD = "__add";
/** A Select that reads like an input (the dialog rule: picker and input are one family). */
const FIELD = "h-9 w-full justify-between rounded-bz-md border-bz-line bg-bz-paper px-3 text-[12.5px] font-normal hover:border-bz-text-soft";
const brandIds = (ps: Product[], b: string) => ps.filter((p) => p.brand === b).map((p) => p.id);
const catIds = (ps: Product[], c: string) => ps.filter((p) => p.category === c).map((p) => p.id);

/** With no record of that kind yet, a picker is just the way to make the first one. */
function NewFirst({ kind, noun, onCreated }: { kind: QuickAddKind; noun: string; onCreated?: (id: string) => void }) {
  return (
    <button type="button" className={GHOST_SM} onClick={() => openQuickAdd(kind, { onCreated })}>
      <Plus size={12} /> New {noun}
    </button>
  );
}

/**
 * A multi-select that can end in "New <noun>". A multi-select keeps its menu open on a pick, so the
 * quick add would open underneath it: picking "New …" remounts the select, which closes the menu.
 */
function MultiPick({
  value,
  onChange,
  options,
  empty,
  face,
  add,
  inline,
  search,
  title,
  placeholder,
  width = 300,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: SelectOption[];
  /** What an empty selection reads as — "Every type". */
  empty: string;
  /** The face when it is not the picked options' names ("any Crunchy"). */
  face?: string;
  add?: { kind: QuickAddKind; noun: string; onCreated: (id: string) => void };
  /** Inside a sentence: a toolbar-sized trigger instead of a field. */
  inline?: boolean;
  search?: boolean;
  title?: string;
  placeholder?: string;
  width?: number;
}) {
  const [gen, setGen] = React.useState(0);
  const names =
    face ??
    options
      .filter((o) => value.includes(o.value))
      .map((o) => o.label)
      .join(", ");
  return (
    <Select
      key={gen}
      multiple
      value={value}
      width={width}
      title={title}
      placeholder={placeholder}
      searchable={search ?? options.length >= 8}
      className={inline ? "max-w-[260px]" : FIELD}
      options={add ? [...options, { value: ADD, label: `New ${add.noun}` }] : options}
      label={<span className={names ? "text-bz-text" : "text-bz-text-soft"}>{names || empty}</span>}
      onChange={(next) => {
        if (add && next.includes(ADD)) {
          setGen((g) => g + 1);
          return openQuickAdd(add.kind, { onCreated: add.onCreated });
        }
        onChange(next);
      }}
    />
  );
}

/** Products, a whole brand or a whole category — stored as item ids, which is what the engine reads. */
function ItemPicker({ ids, onChange, label = "Products" }: { ids: string[]; onChange: (ids: string[]) => void; label?: string }) {
  const products = useStore(productsStore);
  if (!products.length) return <NewFirst kind="product" noun="product" onCreated={(id) => onChange([...ids, id])} />;
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const options: SelectOption[] = [
    ...brands.filter((b) => brandIds(products, b).length > 1).map((b) => ({ value: `b:${b}`, label: `All ${b}`, group: "Whole brand", hint: `${brandIds(products, b).length} products` })),
    ...cats.filter((c) => catIds(products, c).length > 1).map((c) => ({ value: `c:${c}`, label: `All ${c.toLowerCase()}`, group: "Whole category", hint: `${catIds(products, c).length} products` })),
    ...products.map((p) => ({ value: p.id, label: p.name, group: p.brand || "Products", hint: [p.code, p.pack].filter(Boolean).join(" · ") })),
  ];
  const covers = (list: string[]) => list.length > 1 && list.every((id) => ids.includes(id));
  const value = [...ids, ...brands.filter((b) => covers(brandIds(products, b))).map((b) => `b:${b}`), ...cats.filter((c) => covers(catIds(products, c))).map((c) => `c:${c}`)];
  const members = (v: string) => (v.startsWith("b:") ? brandIds(products, v.slice(2)) : v.startsWith("c:") ? catIds(products, v.slice(2)) : [v]);
  return (
    <MultiPick
      inline
      search
      value={value}
      options={options}
      placeholder="Search products, brands…"
      title={label}
      empty="Pick products"
      face={ids.length ? itemsText(ids) : undefined}
      add={{ kind: "product", noun: "product", onCreated: (id) => onChange([...ids, id]) }}
      onChange={(next) => {
        const set = new Set(ids);
        const added = next.find((v) => !value.includes(v));
        const removed = value.find((v) => !next.includes(v));
        if (added) members(added).forEach((id) => set.add(id));
        if (removed) members(removed).forEach((id) => set.delete(id));
        onChange(products.map((p) => p.id).filter((id) => set.has(id)));
      }}
    />
  );
}

function ProductPick({ value, onChange, allowSame }: { value: string; onChange: (v: string) => void; allowSame?: boolean }) {
  const products = useStore(productsStore);
  if (!products.length && !allowSame) return <NewFirst kind="product" noun="product" onCreated={onChange} />;
  const options: SelectOption[] = [
    ...(allowSame ? [{ value: "same", label: "the same product" }] : []),
    ...products.map((p) => ({ value: p.id, label: p.name, group: p.brand || "Products", hint: p.pack })),
    { value: ADD, label: "New product" },
  ];
  return (
    <Select
      value={value}
      onChange={(v) => (v === ADD ? openQuickAdd("product", { onCreated: onChange }) : onChange(v))}
      options={options}
      searchable={options.length >= 8}
      width={280}
      label={value === "same" ? "the same product" : value ? productById(value).name : <span className="text-bz-text-soft">Pick a product</span>}
      className="max-w-[240px]"
    />
  );
}

function Num({ value, onChange, max, label, w = 88 }: { value: number; onChange: (n: number) => void; max?: number; label: string; w?: number }) {
  // min 1: a 0 quantity or % never makes a valid rule, and the steppers should not offer it.
  return (
    <span className="inline-flex shrink-0" style={{ width: w }}>
      <NumberField value={value} onChange={onChange} min={1} max={max} ariaLabel={label} className="w-full" />
    </span>
  );
}

function MoneyIn({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[11px] font-medium text-bz-text-soft">NPR</span>
      <input
        aria-label={label}
        inputMode="numeric"
        value={value ? npr(value) : ""}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        className={cn(INPUT_SM, "w-[130px] text-right font-semibold", NUM)}
      />
    </span>
  );
}

/** A sentence with controls in it. */
function Sentence({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-2 text-[12.5px] text-bz-text", className)}>{children}</div>;
}

const Arrow = () => <ArrowRight size={13} className="shrink-0 text-bz-text-soft" aria-label="then" />;

function AddRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" className={cn(GHOST_SM, "w-fit")} onClick={onClick}>
      <Plus size={12} /> {children}
    </button>
  );
}

// ── The rule, per mechanic ──────────────────────────────────────────────────

function RuleEditor({ m, set }: { m: SchemeMechanic; set: (m: SchemeMechanic) => void }) {
  switch (m.kind) {
    case "free-goods": {
      const unit = m.buyItemIds.length ? productById(m.buyItemIds[0]).unit : "units";
      return (
        <Sentence>
          Buy <Num label="Buy quantity" value={m.buyQty} onChange={(buyQty) => set({ ...m, buyQty })} /> {unit} of <ItemPicker ids={m.buyItemIds} onChange={(buyItemIds) => set({ ...m, buyItemIds })} />
          <Arrow /> get <Num label="Free quantity" value={m.getQty} onChange={(getQty) => set({ ...m, getQty })} /> <ProductPick allowSame value={m.getItemId} onChange={(getItemId) => set({ ...m, getItemId })} /> free
        </Sentence>
      );
    }
    case "slab": {
      const setSlab = (i: number, patch: Partial<{ minQty: number; pct: number }>) => set({ ...m, slabs: m.slabs.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
      const last = m.slabs[m.slabs.length - 1];
      const cols = "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_24px] items-center gap-3 px-3";
      return (
        <div className="flex flex-col gap-2.5">
          <Sentence>
            On <ItemPicker ids={m.itemIds} onChange={(itemIds) => set({ ...m, itemIds })} /> counted together
          </Sentence>
          <div className="max-w-[340px] overflow-hidden rounded-bz-md border border-bz-line-soft">
            <div className={cn(cols, LABEL, "border-b border-bz-line bg-bz-paper-warm py-1.5")}>
              <span>From qty</span>
              <span>% off</span>
              <span />
            </div>
            {m.slabs.map((s, i) => (
              <div key={i} className={cn(cols, "border-b border-bz-line-soft py-1.5 last:border-0")}>
                <Num w={104} label={`Slab ${i + 1} quantity`} value={s.minQty} onChange={(minQty) => setSlab(i, { minQty })} />
                <Num w={104} label={`Slab ${i + 1} percent`} value={s.pct} max={100} onChange={(pct) => setSlab(i, { pct })} />
                {m.slabs.length > 1 ? (
                  <button type="button" className={ICON_BTN_SM} aria-label={`Remove slab ${i + 1}`} title="Remove" onClick={() => set({ ...m, slabs: m.slabs.filter((_, j) => j !== i) })}>
                    <X size={12} />
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
          <AddRow onClick={() => set({ ...m, slabs: [...m.slabs, { minQty: (last?.minQty ?? 0) + 50, pct: (last?.pct ?? 0) + 1 }] })}>Add slab</AddRow>
        </div>
      );
    }
    case "combo":
      return (
        <div className="flex flex-col gap-2.5">
          {m.needs.map((n, i) => (
            <Sentence key={i}>
              <span className="w-8 text-bz-text-soft">{i === 0 ? "Buy" : "and"}</span>
              <Num label={`Group ${i + 1} quantity`} value={n.qty} onChange={(qty) => set({ ...m, needs: m.needs.map((x, j) => (j === i ? { ...x, qty } : x)) })} /> of
              <ItemPicker ids={n.itemIds} onChange={(itemIds) => set({ ...m, needs: m.needs.map((x, j) => (j === i ? { ...x, itemIds } : x)) })} />
              {m.needs.length > 2 && (
                <button type="button" className={ICON_BTN_SM} aria-label={`Remove group ${i + 1}`} title="Remove" onClick={() => set({ ...m, needs: m.needs.filter((_, j) => j !== i) })}>
                  <X size={12} />
                </button>
              )}
            </Sentence>
          ))}
          <AddRow onClick={() => set({ ...m, needs: [...m.needs, { itemIds: [], qty: 5 }] })}>Add group</AddRow>
          <Sentence>
            <Arrow /> get <Num label="Free quantity" value={m.getQty} onChange={(getQty) => set({ ...m, getQty })} /> <ProductPick value={m.getItemId} onChange={(getItemId) => set({ ...m, getItemId })} /> free
          </Sentence>
        </div>
      );
    case "invoice-value":
      return (
        <Sentence>
          When the order is over <MoneyIn label="Order value" value={m.minValue} onChange={(minValue) => set({ ...m, minValue })} /> <Arrow /> <Num label="Percent off" value={m.pct} max={100} onChange={(pct) => set({ ...m, pct })} /> % off the whole order
        </Sentence>
      );
    case "first-order":
      return (
        <Sentence>
          On a customer's first order <Arrow /> <Num label="Percent off" value={m.pct} max={100} onChange={(pct) => set({ ...m, pct })} /> % off the whole order
        </Sentence>
      );
    case "target-rebate":
      return (
        <Sentence>
          When purchases reach <MoneyIn label="Target" value={m.target} onChange={(target) => set({ ...m, target })} /> in
          <input aria-label="Period" value={m.period} onChange={(e) => set({ ...m, period: e.target.value })} className={cn(INPUT_SM, "w-[150px]")} placeholder="Oct – Dec 2026" />
          <Arrow /> <Num label="Percent back" value={m.pct} max={100} onChange={(pct) => set({ ...m, pct })} /> % back on all of it
        </Sentence>
      );
    case "display":
      return (
        <Sentence>
          For keeping the display up <Arrow /> pay <MoneyIn label="Monthly amount" value={m.amount} onChange={(amount) => set({ ...m, amount })} /> a month, after photo proof
        </Sentence>
      );
    case "early-payment":
      return (
        <Sentence>
          When the invoice is paid within <Num label="Days" value={m.withinDays} onChange={(withinDays) => set({ ...m, withinDays })} /> days <Arrow /> <Num label="Percent off" value={m.pct} max={100} onChange={(pct) => set({ ...m, pct })} /> % off
        </Sentence>
      );
  }
}

// ── The example order ───────────────────────────────────────────────────────

function startCart(m: SchemeMechanic): CartLine[] {
  const q = qualifyingCart(m);
  if (q.length) return q.map((l) => ({ ...l }));
  const products = productsStore.get();
  if (!products.length) return [];
  if (m.kind === "invoice-value") {
    const p = products.reduce((a, b) => (b.listPrice > a.listPrice ? b : a));
    return [{ productId: p.id, qty: Math.max(1, Math.ceil(m.minValue / Math.max(1, p.listPrice))) }];
  }
  return products.slice(0, 2).map((p) => ({ productId: p.id, qty: 10 }));
}

const PreviewHead = ({ right }: { right?: React.ReactNode }) => (
  <div className="mb-2.5 flex items-center gap-2">
    <h3 className="m-0 text-[12px] font-semibold text-bz-text">Example order</h3>
    {right}
  </div>
);

/** The example prices a real cart for a real customer, so it needs at least one of each first. */
function Preview({ draft }: { draft: Scheme }) {
  const customers = useStore(customersStore);
  const products = useStore(productsStore);
  if (!customers.length || !products.length) {
    const missing = !customers.length && !products.length ? "a customer and a product" : !customers.length ? "a customer" : "a product";
    return (
      <section className="px-5 py-4">
        <PreviewHead />
        <p className="m-0 text-[11.5px] text-bz-text-soft">Needs {missing}.</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {!customers.length && <NewFirst kind="customer" noun="customer" />}
          {!products.length && <NewFirst kind="product" noun="product" />}
        </div>
      </section>
    );
  }
  return <PreviewBody draft={draft} />;
}

function PreviewBody({ draft }: { draft: Scheme }) {
  const customers = useStore(customersStore);
  const products = useStore(productsStore);
  const schemes = useStore(schemesStore);
  const firstFit = () => (customers.find((c) => c.status === "active" && (!draft.typeIds.length || draft.typeIds.includes(c.typeId))) ?? customers[0])?.id ?? "";
  const [custId, setCustId] = React.useState(firstFit);
  const [cart, setCart] = React.useState<CartLine[]>(() => startCart(draft.mechanic));
  const [firstOrder, setFirstOrder] = React.useState(draft.mechanic.kind === "first-order");
  const kind = draft.mechanic.kind;
  React.useEffect(() => {
    setCart(startCart(draft.mechanic));
    setFirstOrder(kind === "first-order");
    // Only a new mechanic resets the cart; editing a quantity must not wipe what the user typed in the cart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  // The picked customer may have been deleted meanwhile — fall back to the first one.
  const cust = customerById(custId) ?? customers[0];
  const draftId = draft.id || "DRAFT";
  const draftScheme: Scheme = { ...draft, id: draftId, name: draft.name.trim() || autoName(draft.mechanic), status: "live" };
  const date = draft.from > SF_TODAY ? draft.from : SF_TODAY;
  // A half-typed rule (a quantity of 0, a group with no products) is not handed to the engine.
  const unfinished = validate(draft);
  const all = [...schemes.filter((s) => s.id !== draft.id), ...(unfinished ? [] : [draftScheme])];
  const ev = evaluate(cust.id, cart, all, { date, firstOrder });
  const skipped = ev.skipped.filter((s) => s.schemeId !== draftId);
  const others = ev.applied.filter((a) => a.schemeId !== draftId);
  const mine = ev.applied.find((a) => a.schemeId === draftId);
  const myWhy = unfinished ? `Finish the rule first. ${unfinished.text}` : ev.skipped.find((s) => s.schemeId === draftId)?.reason ?? eligible(draftScheme, cust, date);

  let offOrder: string | null = null;
  const m = draft.mechanic;
  if (m.kind === "target-rebate") offOrder = `At the target, the rebate is NPR ${npr((m.target * m.pct) / 100)}.`;
  if (m.kind === "display") offOrder = `Paid NPR ${npr(m.amount)} a month on a display claim with photo proof.`;
  if (m.kind === "early-payment") offOrder = `Paid within ${m.withinDays} days, this order gets NPR ${npr((ev.total * m.pct) / 100)} off.`;

  const customerOptions: SelectOption[] = customers.map((c) => ({ value: c.id, label: c.name, group: typeOf(c).plural, hint: [c.city, `tier ${c.tier}`].filter(Boolean).join(" · ") }));
  const setQty = (i: number, qty: number) => setCart((c) => c.map((l, j) => (j === i ? { ...l, qty } : l)));

  return (
    <section className="px-5 py-4">
      <PreviewHead
        right={
          <span className={cn("ml-auto text-[11px] text-bz-text-soft", NUM)} title="Priced as on this date">
            {day(date)}
          </span>
        }
      />

      <Select value={cust.id} onChange={setCustId} options={customerOptions} searchable={customerOptions.length >= 8} width={300} label={cust.name} className={FIELD} />
      <p className="m-0 mt-1 text-[10.5px] text-bz-text-soft">{[typeOf(cust).name, `tier ${cust.tier}`, cust.city].filter(Boolean).join(" · ")}</p>

      <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0">
        {cart.map((l, i) => {
          const p = productById(l.productId);
          return (
            <li key={`${l.productId}-${i}`} className="flex items-center gap-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] text-bz-text">{p.name}</span>
                <span className="block text-[10.5px] text-bz-text-soft">{p.unit}</span>
              </span>
              <NumberField value={l.qty} onChange={(q) => setQty(i, q)} ariaLabel={`${p.name} quantity`} className="w-[92px]" />
              <button type="button" className={ICON_BTN_SM} aria-label={`Remove ${p.name}`} title="Remove" onClick={() => setCart((c) => c.filter((_, j) => j !== i))}>
                <X size={12} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <Select
          value={null}
          onChange={(id) => setCart((c) => (c.some((l) => l.productId === id) ? c : [...c, { productId: id, qty: 1 }]))}
          options={products.map((p) => ({ value: p.id, label: p.name, group: p.brand || "Products", hint: p.pack }))}
          searchable={products.length >= 8}
          width={280}
          label="Add product"
          icon={Plus}
        />
        <label className="ml-auto inline-flex items-center gap-2 text-[11.5px] text-bz-text-muted">
          <Switch on={firstOrder} onChange={setFirstOrder} label="First order" /> First order
        </label>
      </div>

      <div className="mt-4 border-t border-bz-line-soft pt-3">
        {draft.applies !== "order" ? (
          <>
            <Chip tone="neutral">Not on the order</Chip>
            <p className="m-0 mt-1.5 text-[11.5px] leading-relaxed text-bz-text-muted">
              {myWhy && myWhy !== "Only on a first order" && <span className="block">{myWhy}</span>}
              {APPLIES_TEXT[draft.applies]}. {offOrder}
            </p>
          </>
        ) : mine ? (
          <>
            <Chip tone="positive">Applies</Chip>
            <p className="m-0 mt-1.5 flex items-baseline justify-between gap-3 text-[12px]">
              <span className="min-w-0 text-bz-text-muted">{mine.text}</span>
              <Amount value={mine.benefit} currency="NPR" className="shrink-0 font-semibold text-bz-text" />
            </p>
          </>
        ) : (
          <>
            <Chip tone="pending">Does not apply</Chip>
            <p className="m-0 mt-1.5 text-[11.5px] leading-relaxed text-bz-text-muted">{myWhy ?? "The cart doesn't qualify yet."}</p>
          </>
        )}

        {others.length > 0 && (
          <div className="mt-3.5">
            <p className={cn(LABEL, "m-0 mb-1")}>Also applies</p>
            {others.map((a) => (
              <p key={a.schemeId} className="m-0 flex items-baseline justify-between gap-3 py-0.5 text-[11.5px]">
                <span className="min-w-0 truncate text-bz-text">{a.name}</span>
                <Amount value={a.benefit} className="shrink-0 text-bz-text-muted" />
              </p>
            ))}
          </div>
        )}

        {ev.hints.length > 0 && (
          <div className="mt-3.5">
            <p className={cn(LABEL, "m-0 mb-1")}>Close to more</p>
            {ev.hints.map((h) => (
              <div key={h.schemeId} className="py-1">
                <p className="m-0 text-[11.5px] text-bz-text">{h.text}</p>
                <p className="m-0 text-[10.5px] text-bz-text-soft">{h.name}</p>
                <Meter pct={h.progress * 100} thin className="mt-1" />
              </div>
            ))}
          </div>
        )}

        {skipped.length > 0 && (
          <div className="mt-3.5">
            <p className={cn(LABEL, "m-0 mb-1")}>Skipped</p>
            {skipped.map((s) => (
              <p key={s.schemeId} className="m-0 flex items-baseline justify-between gap-3 py-0.5 text-[11.5px]">
                <span className="min-w-0 truncate text-bz-text-muted">{s.name}</span>
                <span className="shrink-0 text-bz-text-soft">{s.reason}</span>
              </p>
            ))}
          </div>
        )}

        <MoneyList
          className="mt-4"
          rows={[
            { label: "Order value", value: <Amount value={ev.gross} /> },
            { label: "Discounts", value: ev.discount ? <Amount value={-ev.discount} /> : "—" },
            { label: "Free goods worth", value: ev.freeValue ? <Amount value={ev.freeValue} /> : "—" },
            { label: "VAT 13%", value: <Amount value={ev.tax} /> },
            { label: "Total", value: <Amount value={ev.total} currency="NPR" />, strong: true },
          ]}
        />
      </div>
    </section>
  );
}

// ── The composer ────────────────────────────────────────────────────────────

const TIERS: ("A" | "B" | "C")[] = ["A", "B", "C"];

/** `original` = the scheme being edited; without it the composer starts blank, from `?copy=` or with `?campaign=` picked. */
export function SchemeComposer({ ctx, original }: { ctx: PanelCtx; original?: Scheme }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const schemes = useStore(schemesStore);
  const campaigns = useStore(campaignsStore);
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const extrasAll = useStore(schemeExtrasStore);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  const copyOf = !original && params.get("copy") ? schemes.find((s) => s.id === params.get("copy")) : undefined;

  const [init] = React.useState(() => {
    if (original) return { s: clone(original), max: extrasAll[original.id]?.maxPerCustomer ?? 0, json: "" };
    if (copyOf) {
      const s = { ...clone(copyOf), id: NEW_ID, name: `${copyOf.name} (copy)`, status: "draft" as const, budget: copyOf.budget ? { ...copyOf.budget, used: 0 } : null, from: SF_TODAY > copyOf.from ? SF_TODAY : copyOf.from, to: copyOf.to < SF_TODAY ? addDaysIso(SF_TODAY, 60) : copyOf.to };
      return { s, max: extrasAll[copyOf.id]?.maxPerCustomer ?? 0, json: "copy" };
    }
    // "?campaign=CMP-…" — the campaign page's "New scheme" arrives with its campaign picked.
    const fromCampaign = params.get("campaign");
    const blank = blankScheme();
    if (fromCampaign && campaigns.some((c) => c.id === fromCampaign)) return { s: { ...blank, campaignId: fromCampaign }, max: 0, json: "" };
    return { s: blank, max: 0, json: "" };
  });
  const [draft, setDraft] = React.useState<Scheme>(init.s);
  const [maxPer, setMaxPer] = React.useState(init.max);
  const [error, setError] = React.useState<string | null>(null);
  const baseline = React.useRef(init.json || JSON.stringify({ d: init.s, m: init.max }));
  const dirty = JSON.stringify({ d: draft, m: maxPer }) !== baseline.current;

  const ruleLocked = !!original && original.status !== "draft" && original.status !== "scheduled";
  const fresh = !original || original.status === "draft";
  const patch = (p: Partial<Scheme>) => (setError(null), setDraft((d) => ({ ...d, ...p })));
  const pickKind = (k: MechanicKind) => patch({ mechanic: defaultMechanic(k), applies: MECHANICS.find((x) => x.kind === k)!.applies });
  const reach = customers.filter((c) => (!draft.typeIds.length || draft.typeIds.includes(c.typeId)) && (!draft.tiers.length || draft.tiers.includes(c.tier))).length;
  const addType = (newId: string) => setDraft((d) => ({ ...d, typeIds: d.typeIds.includes(newId) ? d.typeIds : [...d.typeIds, newId] }));
  const need = validate(draft);

  const reveal = (at: Need["at"]) => bodyRef.current?.querySelector(`[data-band="${at}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  const cancel = () => (original ? ctx.go(original.id) : init.s.campaignId ? navigate(sfPath(`campaigns/${init.s.campaignId}`)) : ctx.go(null));

  const save = (asDraft: boolean) => {
    const err = validate(draft);
    if (err) {
      reveal(err.at);
      return setError(err.text);
    }
    const status = asDraft
      ? "draft"
      : original && original.status !== "draft" && original.status !== "scheduled"
        ? original.status
        : draft.to < SF_TODAY
          ? "ended"
          : draft.from > SF_TODAY
            ? "scheduled"
            : "live";
    // Nothing typed and nothing to publish: back to the record, with no "changed" line in its history.
    if (original && !dirty && status === original.status) return ctx.go(original.id);
    const newId = draft.id || nextSchemeId(schemesStore.get());
    const final: Scheme = { ...draft, id: newId, name: draft.name.trim() || autoName(draft.mechanic), status };
    // Saved with its old campaign first: linkToCampaign moves it and keeps both campaigns' schemeIds (and history) in step.
    schemesStore.set((list) => (list.some((s) => s.id === newId) ? list.map((s) => (s.id === newId ? { ...final, campaignId: original?.campaignId ?? null } : s)) : [{ ...final, campaignId: null }, ...list]));
    schemeExtrasStore.set((x) => ({ ...x, [newId]: { maxPerCustomer: maxPer || null } }));
    linkToCampaign("scheme", newId, final.campaignId, final.name);
    logEvent(newId, original ? (original.status === "draft" && !asDraft ? `made it ${STATUS[status].label.toLowerCase()}` : "changed the offer") : copyOf ? `created it as a copy of ${copyOf.id} (${STATUS[status].label.toLowerCase()})` : `created it (${STATUS[status].label.toLowerCase()})`);
    ctx.go(newId);
    ctx.show("success", `${newId} ${original ? "saved" : "created"} · ${STATUS[status].label.toLowerCase()}`);
  };

  // ⌘↵ commits, as on every composer; a quick add open over the form keeps its own keys.
  const saveRef = React.useRef(save);
  saveRef.current = save;
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "Enter" || document.querySelector("[data-bzw-dialog]")) return;
      e.preventDefault();
      saveRef.current(false);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const primary = !fresh ? "Save" : draft.to && draft.to < SF_TODAY ? "Save as ended" : draft.from > SF_TODAY ? "Schedule" : "Publish";

  // A picked type that was deleted since stays in the list, so it can still be removed.
  const typeOptions: SelectOption[] = [...types.map((t) => ({ value: t.id, label: t.plural })), ...draft.typeIds.filter((id) => !types.some((t) => t.id === id)).map((id) => ({ value: id, label: typeName(id) }))];
  const campaign = campaigns.find((c) => c.id === draft.campaignId);

  return (
    <section className={cn("flex h-full min-h-0 flex-col bg-bz-surface", !ctx.docked && "shadow-[var(--bz-shadow-panel)]")} aria-label={original ? `Edit ${original.id}` : "New scheme"}>
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-bz-line-soft px-5 py-2.5">
        <span className={cn("text-[11px] font-semibold text-bz-text-soft", NUM)}>{original ? `Edit ${original.id}` : copyOf ? "New scheme from" : "New scheme"}</span>
        {original && <Chip tone={chipTone(STATUS[original.status].tone)}>{STATUS[original.status].label}</Chip>}
        {copyOf && <DocLink no={copyOf.id} />}
        <div className="ml-auto flex items-center gap-1">
          <button type="button" className={ICON_BTN} onClick={cancel} title="Close" aria-label="Close">
            <X size={15} />
          </button>
        </div>
      </header>

      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className="mx-auto w-full max-w-[1080px] pb-10 xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="min-w-0">
            <div className="border-b border-bz-line-soft px-5 pb-3.5 pt-5">
              <p className={cn(LABEL, "m-0 mb-1")}>Name</p>
              <input
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder={autoName(draft.mechanic)}
                aria-label="Name"
                title="Shown on the order"
                className="-mx-1.5 block h-9 w-[calc(100%+12px)] rounded-bz-sm border border-transparent bg-transparent px-1.5 text-[17px] font-semibold tracking-tight text-bz-text outline-none placeholder:font-normal placeholder:text-bz-text-soft hover:bg-bz-paper-warm focus:border-bz-line focus:bg-bz-surface"
              />
            </div>

            <div data-band="rule">
              {ruleLocked ? (
                <Block
                  title="Rule"
                  right={
                    <button type="button" className={GHOST_SM} onClick={() => ctx.go("new", { copy: original!.id })}>
                      <Copy size={12} /> Duplicate
                    </button>
                  }
                >
                  <p className="m-0 text-[12.5px] leading-relaxed text-bz-text">{ruleText(draft.mechanic)}.</p>
                  <p className="m-0 mt-1.5 flex items-center gap-1.5 text-[11px] text-bz-text-soft">
                    <Lock size={11} className="shrink-0" /> Locked · orders already carry it.
                  </p>
                </Block>
              ) : (
                <>
                  <Block title="Mechanic">
                    <div className="max-w-[320px]">
                      <Select
                        value={draft.mechanic.kind}
                        onChange={(k) => k !== draft.mechanic.kind && pickKind(k as MechanicKind)}
                        searchable={false}
                        width={320}
                        className={FIELD}
                        label={mechanicLabel(draft.mechanic.kind)}
                        options={MECHANICS.map((x) => ({ value: x.kind, label: x.label, hint: x.example }))}
                      />
                    </div>
                  </Block>
                  <Block title="Rule">
                    <RuleEditor m={draft.mechanic} set={(mechanic) => patch({ mechanic })} />
                    <p className="m-0 mt-3 rounded-bz-md bg-bz-paper-warm px-3 py-2 text-[12px] leading-relaxed text-bz-text">{ruleText(draft.mechanic)}.</p>
                  </Block>
                </>
              )}
            </div>

            <Block
              title="Who gets it"
              right={
                <span className={cn("text-[11px] text-bz-text-soft", NUM)} title="Customers it reaches today">
                  {reach} {reach === 1 ? "customer" : "customers"}
                </span>
              }
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Customer types">
                  <MultiPick value={draft.typeIds} onChange={(typeIds) => patch({ typeIds })} options={typeOptions} empty="Every type" add={{ kind: "type", noun: "customer type", onCreated: addType }} />
                </Field>
                <Field label="Tiers">
                  <MultiPick value={draft.tiers} onChange={(v) => patch({ tiers: TIERS.filter((t) => v.includes(t)) })} options={TIERS.map((t) => ({ value: t, label: `Tier ${t}` }))} empty="Every tier" width={200} />
                </Field>
              </div>
            </Block>

            <div data-band="when">
              <Block title="When">
                <ChipRow className="border-y-0 py-0">
                  <TermChip label="Starts">
                    <DateChip value={draft.from || null} onChange={(from) => patch({ from })} />
                  </TermChip>
                  <Sep />
                  <TermChip label="Ends">
                    <DateChip value={draft.to || null} min={draft.from || undefined} onChange={(to) => patch({ to })} />
                  </TermChip>
                </ChipRow>
              </Block>
            </div>

            <div data-band="budget">
              <Block title="Budget and limits">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Budget" className="sm:col-span-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Segmented
                        value={draft.budget ? draft.budget.kind : "none"}
                        onChange={(v) => patch({ budget: v === "none" ? null : { kind: v, total: draft.budget?.total || (v === "qty" ? 500 : 100_000), used: draft.budget?.used ?? 0 } })}
                        options={[
                          { value: "none", label: "No limit" },
                          { value: "value", label: "Money" },
                          { value: "qty", label: "Quantity" },
                        ]}
                      />
                      {draft.budget &&
                        (draft.budget.kind === "value" ? (
                          <MoneyIn label="Budget" value={draft.budget.total} onChange={(total) => patch({ budget: { ...draft.budget!, total } })} />
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <NumberField value={draft.budget.total} onChange={(total) => patch({ budget: { ...draft.budget!, total } })} ariaLabel="Budget quantity" className="w-[110px]" />
                            <span className="text-[11.5px] text-bz-text-soft">units</span>
                          </span>
                        ))}
                      {!!draft.budget?.used && <span className={cn("text-[11.5px] text-bz-text-soft", NUM)}>{npr(draft.budget.used)} used</span>}
                    </div>
                  </Field>
                  <Field label={<span title="Lower is checked first">Priority</span>}>
                    <div>
                      <NumberField value={draft.priority} onChange={(priority) => patch({ priority })} min={1} ariaLabel="Priority" className="w-[110px]" />
                    </div>
                  </Field>
                  <Field label="Max per customer">
                    <div className="flex items-center gap-2">
                      <NumberField value={maxPer} onChange={(n) => (setError(null), setMaxPer(n))} ariaLabel="Max times per customer" className="w-[110px]" />
                      <span className="text-[11.5px] text-bz-text-soft">{maxPer ? (maxPer === 1 ? "time" : "times") : "No limit"}</span>
                    </div>
                  </Field>
                  <Field label="With other schemes" className="sm:col-span-2">
                    <div>
                      <Segmented
                        value={draft.exclusive ? "exclusive" : "stack"}
                        onChange={(v) => patch({ exclusive: v === "exclusive" })}
                        options={[
                          { value: "stack", label: "Stacks", title: "Other schemes can apply on the same order" },
                          { value: "exclusive", label: "Exclusive", title: "Schemes checked after it are skipped on that order" },
                        ]}
                      />
                    </div>
                  </Field>
                </div>
              </Block>
            </div>

            <Block title="Campaign">
              <div className="max-w-[320px]">
                <Select
                  value={draft.campaignId ?? "none"}
                  onChange={(v) => patch({ campaignId: v === "none" ? null : v })}
                  options={[{ value: "none", label: "None" }, ...campaigns.map((c) => ({ value: c.id, label: c.name, hint: `${day(c.from)} – ${day(c.to)}` }))]}
                  label={<span className={campaign ? "text-bz-text" : "text-bz-text-soft"}>{campaign?.name ?? "None"}</span>}
                  width={320}
                  className={FIELD}
                />
              </div>
            </Block>
          </div>

          <aside className="min-w-0 xl:sticky xl:top-0 xl:max-h-[calc(100vh-160px)] xl:overflow-y-auto xl:border-l xl:border-bz-line-soft xl:[scrollbar-width:thin]">
            <Preview draft={draft} />
          </aside>
        </div>
      </div>

      <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
        {error && <Refusal text={error} sticky onDismiss={() => setError(null)} className="mx-auto mb-2.5 max-w-[1080px]" />}
        <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-x-3 gap-y-2">
          {need ? (
            !error && (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[11.5px] text-bz-text-soft">
                <CircleAlert size={12} className="shrink-0" />
                <button type="button" onClick={() => reveal(need.at)} className="min-w-0 truncate text-left font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text">
                  {need.text}
                </button>
              </span>
            )
          ) : original && dirty ? (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
              <span className="size-1.5 rounded-bz-pill bg-bz-amber" /> Unsaved changes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
              <span className="size-1.5 rounded-bz-pill bg-bz-leaf-deep" /> Ready
            </span>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button type="button" className={GHOST} onClick={cancel}>
              Cancel
            </button>
            {fresh && (
              <button type="button" className={GHOST} onClick={() => save(true)}>
                Save draft
              </button>
            )}
            <button type="button" className={BTN} onClick={() => save(false)} title={`${primary} (Ctrl+Enter)`}>
              {primary}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
