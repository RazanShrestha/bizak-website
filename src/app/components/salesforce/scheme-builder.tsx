import * as React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowRight, Plus, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, GHOST, GHOST_SM, INPUT, INPUT_SM, NUM, NumberField, PLAIN_BTN, Refusal, Segmented, Select, Switch } from "../sales/bzw";
import type { SelectOption } from "../sales/bzw";
import { useStore } from "../sales/store";
import { BRANDS, CUSTOMER_TYPES, PRODUCTS, SF_TODAY, TERRITORIES } from "./data";
import type { Scheme, SchemeMechanic } from "./data";
import { customerById, day, eligible, evaluate, npr, productById, typeOf } from "./engine";
import type { CartLine } from "./engine";
import { campaignsStore, customersStore, schemesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, Money, Page, PageIntro, Progress, idColor } from "./ui";
import { APPLIES_TEXT, MECHANICS, STATUS, defaultMechanic, inTerritory, itemsText, logEvent, mechanicLabel, qualifyingCart, ruleText, schemeExtrasStore } from "./schemes-kit";
import type { MechanicKind } from "./schemes-kit";

// ════════════════════════════════════════════════════════════════════════════
// SCHEME BUILDER — a calm single-column form that reads as a sentence
//
// Five steps (what, the rule, who, when and budget, rules) on the left; on the
// right a live "Try it" cart priced by the one engine with this draft among the
// live schemes, so what you see is what an order would get (research/C §7.4).
// A live scheme's rule is locked: orders already carry it, so a new rule is a
// copy (research/C §7.3 "end + copy").
// ════════════════════════════════════════════════════════════════════════════

const NEW_ID = "";

function blankScheme(): Scheme {
  return {
    id: NEW_ID,
    name: "",
    mechanic: defaultMechanic("free-goods"),
    typeIds: ["T-RET"],
    tiers: [],
    territoryIds: [],
    from: SF_TODAY,
    to: "2026-10-31",
    status: "draft",
    priority: 10,
    exclusive: false,
    budget: null,
    campaignId: null,
    applies: "order",
    owner: "EMP-101",
  };
}

const clone = (s: Scheme): Scheme => JSON.parse(JSON.stringify(s));

export function autoName(m: SchemeMechanic): string {
  if (m.kind === "free-goods") return `Buy ${m.buyQty} get ${m.getQty} — ${itemsText(m.buyItemIds)}`;
  const t = ruleText(m);
  return t.length <= 48 ? t : `${mechanicLabel(m.kind)} scheme`;
}

function validate(s: Scheme): string | null {
  const m = s.mechanic;
  const pctOk = (p: number) => p > 0 && p <= 100;
  switch (m.kind) {
    case "free-goods":
      if (!m.buyItemIds.length) return "Pick the product the customer buys.";
      if (m.buyQty < 1 || m.getQty < 1) return "Both quantities must be at least 1.";
      break;
    case "slab": {
      if (!m.itemIds.length) return "Pick the products the slab counts.";
      if (!m.slabs.length) return "Add at least one slab.";
      for (let i = 0; i < m.slabs.length; i++) {
        if (m.slabs[i].minQty < 1 || !pctOk(m.slabs[i].pct)) return "Each slab needs a quantity and a % between 0 and 100.";
        if (i > 0 && (m.slabs[i].minQty <= m.slabs[i - 1].minQty || m.slabs[i].pct <= m.slabs[i - 1].pct)) return "Each slab must start higher and give more than the one above it.";
      }
      break;
    }
    case "combo":
      if (m.needs.length < 2) return "A combo needs at least two groups.";
      if (m.needs.some((n) => !n.itemIds.length || n.qty < 1)) return "Each group needs products and a quantity.";
      if (m.getQty < 1) return "The free quantity must be at least 1.";
      break;
    case "invoice-value":
      if (m.minValue <= 0 || !pctOk(m.pct)) return "Set the order value and a % between 0 and 100.";
      break;
    case "first-order":
    case "early-payment":
      if (!pctOk(m.pct)) return "Set a % between 0 and 100.";
      if (m.kind === "early-payment" && m.withinDays < 1) return "Set the number of days.";
      break;
    case "target-rebate":
      if (m.target <= 0 || !pctOk(m.pct) || !m.period.trim()) return "Set the target, the % and the period.";
      break;
    case "display":
      if (m.amount <= 0) return "Set the monthly amount.";
      break;
  }
  if (!s.from || !s.to || s.from > s.to) return "The end date must be on or after the start date.";
  if (s.budget && s.budget.total <= 0) return "Set the budget, or choose no limit.";
  return null;
}

const nextSchemeId = (list: Scheme[]) => `SCH-${String(Math.max(0, ...list.map((s) => Number(s.id.replace(/\D/g, "")) || 0)) + 1).padStart(3, "0")}`;

// ── Small controls ──────────────────────────────────────────────────────────

const CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];
const brandIds = (b: string) => PRODUCTS.filter((p) => p.brand === b).map((p) => p.id);
const catIds = (c: string) => PRODUCTS.filter((p) => p.category === c).map((p) => p.id);
const PICKER_OPTIONS: SelectOption[] = [
  ...BRANDS.map((b) => ({ value: `b:${b}`, label: `All ${b}`, group: "Whole brand", hint: `${brandIds(b).length} products` })),
  ...CATEGORIES.map((c) => ({ value: `c:${c}`, label: `All ${c.toLowerCase()}`, group: "Whole category", hint: `${catIds(c).length} products` })),
  ...PRODUCTS.map((p) => ({ value: p.id, label: p.name, group: p.brand, hint: `${p.code} · ${p.pack}` })),
];

/** Products, a whole brand or a whole category — stored as item ids, which is what the engine reads. */
function ItemPicker({ ids, onChange, label = "Products" }: { ids: string[]; onChange: (ids: string[]) => void; label?: string }) {
  const covers = (list: string[]) => list.length > 0 && list.every((id) => ids.includes(id));
  const value = [...ids, ...BRANDS.filter((b) => covers(brandIds(b))).map((b) => `b:${b}`), ...CATEGORIES.filter((c) => covers(catIds(c))).map((c) => `c:${c}`)];
  const members = (v: string) => (v.startsWith("b:") ? brandIds(v.slice(2)) : v.startsWith("c:") ? catIds(v.slice(2)) : [v]);
  return (
    <Select
      multiple
      value={value}
      searchable
      width={300}
      options={PICKER_OPTIONS}
      placeholder="Search products, brands…"
      title={label}
      label={ids.length ? itemsText(ids) : "Pick products"}
      className="max-w-[260px]"
      onChange={(next) => {
        const set = new Set(ids);
        const added = next.find((v) => !value.includes(v));
        const removed = value.find((v) => !next.includes(v));
        if (added) members(added).forEach((id) => set.add(id));
        if (removed) members(removed).forEach((id) => set.delete(id));
        onChange(PRODUCTS.map((p) => p.id).filter((id) => set.has(id)));
      }}
    />
  );
}

function ProductPick({ value, onChange, allowSame }: { value: string; onChange: (v: string) => void; allowSame?: boolean }) {
  const options: SelectOption[] = [...(allowSame ? [{ value: "same", label: "the same product" }] : []), ...PRODUCTS.map((p) => ({ value: p.id, label: p.name, group: p.brand, hint: p.pack }))];
  return <Select value={value} onChange={onChange} options={options} searchable width={280} label={value === "same" ? "the same product" : productById(value).name} className="max-w-[240px]" />;
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

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-bz-pill border px-3 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire",
        on ? "border-bz-leaf-deep bg-bz-fire/15 font-semibold text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-bz-line hover:text-bz-text",
      )}
    >
      {children}
    </button>
  );
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-bz-line-soft pt-6 first:mt-0 first:border-0 first:pt-0">
      <div className="mb-1 flex items-baseline gap-2.5">
        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft", NUM)}>Step {n}</span>
        <h2 className="m-0 text-[13px] font-semibold text-bz-text">{title}</h2>
      </div>
      {hint && <p className="m-0 mb-4 text-[11px] text-bz-text-soft">{hint}</p>}
      <div className={cn(!hint && "mt-4")}>{children}</div>
    </section>
  );
}

/** A sentence with controls in it. */
function Sentence({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-2.5 text-[12.5px] leading-8 text-bz-text", className)}>{children}</div>;
}

const Arrow = () => <ArrowRight size={13} className="text-bz-text-soft" aria-label="then" />;

// ── Step 2: the rule, per mechanic ──────────────────────────────────────────

function RuleEditor({ m, set }: { m: SchemeMechanic; set: (m: SchemeMechanic) => void }) {
  switch (m.kind) {
    case "free-goods": {
      const unit = m.buyItemIds.length ? productById(m.buyItemIds[0]).unit : "units";
      return (
        <Sentence>
          Buy <Num label="Buy quantity" value={m.buyQty} onChange={(buyQty) => set({ ...m, buyQty })} /> {unit} of <ItemPicker ids={m.buyItemIds} onChange={(buyItemIds) => set({ ...m, buyItemIds })} />
          <Arrow /> get <Num label="Free quantity" value={m.getQty} onChange={(getQty) => set({ ...m, getQty })} /> <ProductPick allowSame value={m.getItemId} onChange={(getItemId) => set({ ...m, getItemId })} /> free
          <p className="m-0 w-full text-[11px] leading-normal text-bz-text-soft">Repeats for every full {m.buyQty} bought — {m.buyQty * 3} gives {m.getQty * 3} free.</p>
        </Sentence>
      );
    }
    case "slab": {
      const setSlab = (i: number, patch: Partial<{ minQty: number; pct: number }>) => set({ ...m, slabs: m.slabs.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
      const last = m.slabs[m.slabs.length - 1];
      return (
        <div>
          <Sentence>
            On <ItemPicker ids={m.itemIds} onChange={(itemIds) => set({ ...m, itemIds })} /> counted together, the % grows with the quantity:
          </Sentence>
          <table className="mt-3 w-full max-w-[380px] border-collapse text-[12.5px]">
            <thead>
              <tr className="text-left">
                <th className="pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">From qty</th>
                <th className="pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">% off</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {m.slabs.map((s, i) => (
                <tr key={i} className="border-t border-bz-line-soft">
                  <td className="py-1.5 pr-3">
                    <Num label={`Slab ${i + 1} quantity`} value={s.minQty} onChange={(minQty) => setSlab(i, { minQty })} />
                  </td>
                  <td className="py-1.5 pr-3">
                    <Num label={`Slab ${i + 1} percent`} value={s.pct} max={100} onChange={(pct) => setSlab(i, { pct })} />
                  </td>
                  <td className="py-1.5 text-right">
                    {m.slabs.length > 1 && (
                      <button type="button" className={PLAIN_BTN} aria-label={`Remove slab ${i + 1}`} onClick={() => set({ ...m, slabs: m.slabs.filter((_, j) => j !== i) })}>
                        <X size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className={cn(PLAIN_BTN, "mt-3 gap-1 text-[11.5px] font-medium")} onClick={() => set({ ...m, slabs: [...m.slabs, { minQty: (last?.minQty ?? 0) + 50, pct: (last?.pct ?? 0) + 1 }] })}>
            <Plus size={12} /> Add a slab
          </button>
          <p className="m-0 mt-2 text-[11px] text-bz-text-soft">The highest slab reached applies to the whole quantity.</p>
        </div>
      );
    }
    case "combo":
      return (
        <div className="flex flex-col gap-2.5">
          {m.needs.map((n, i) => (
            <Sentence key={i}>
              <span className="w-10 text-bz-text-soft">{i === 0 ? "Buy" : "and"}</span>
              <Num label={`Group ${i + 1} quantity`} value={n.qty} onChange={(qty) => set({ ...m, needs: m.needs.map((x, j) => (j === i ? { ...x, qty } : x)) })} /> of
              <ItemPicker ids={n.itemIds} onChange={(itemIds) => set({ ...m, needs: m.needs.map((x, j) => (j === i ? { ...x, itemIds } : x)) })} />
              {m.needs.length > 2 && (
                <button type="button" className={PLAIN_BTN} aria-label={`Remove group ${i + 1}`} onClick={() => set({ ...m, needs: m.needs.filter((_, j) => j !== i) })}>
                  <X size={13} />
                </button>
              )}
            </Sentence>
          ))}
          <button type="button" className={cn(PLAIN_BTN, "w-fit gap-1 text-[11.5px] font-medium")} onClick={() => set({ ...m, needs: [...m.needs, { itemIds: [], qty: 5 }] })}>
            <Plus size={12} /> Add a group
          </button>
          <Sentence className="mt-1">
            <Arrow /> get <Num label="Free quantity" value={m.getQty} onChange={(getQty) => set({ ...m, getQty })} /> <ProductPick value={m.getItemId} onChange={(getItemId) => set({ ...m, getItemId })} /> free, once for every full set
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

// ── Try it ──────────────────────────────────────────────────────────────────

function startCart(m: SchemeMechanic): CartLine[] {
  const q = qualifyingCart(m);
  if (q.length) return q.map((l) => ({ ...l }));
  if (m.kind === "invoice-value") return [{ productId: "P-131", qty: Math.max(1, Math.ceil(m.minValue / 7_000)) }];
  return [{ productId: "P-101", qty: 12 }, { productId: "P-111", qty: 20 }];
}

function Simulator({ draft }: { draft: Scheme }) {
  const customers = useStore(customersStore);
  const schemes = useStore(schemesStore);
  const firstFit = () => customers.find((c) => c.status === "active" && (draft.typeIds.length ? draft.typeIds.includes(c.typeId) : c.typeId === "T-RET"))?.id ?? customers.find((c) => c.typeId === "T-RET")!.id;
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

  const cust = customerById(custId);
  const draftId = draft.id || "DRAFT";
  const draftScheme: Scheme = { ...draft, id: draftId, name: draft.name.trim() || autoName(draft.mechanic), status: "live" };
  const date = draft.from > SF_TODAY ? draft.from : SF_TODAY;
  // A half-typed rule (a quantity of 0, a group with no products) is not handed to the engine.
  const unfinished = validate(draft);
  const all = [...schemes.filter((s) => s.id !== draft.id), ...(unfinished ? [] : [draftScheme])];
  const outside = all.filter((s) => !inTerritory(s, cust) && (s.status === "live" || s.status === "scheduled"));
  const ev = evaluate(custId, cart, all.filter((s) => inTerritory(s, cust)), { date, firstOrder });
  const skipped = [...ev.skipped, ...outside.filter((s) => s.applies === "order").map((s) => ({ schemeId: s.id, name: s.name, reason: "Not in its territories" }))];
  const mine = ev.applied.find((a) => a.schemeId === draftId);
  const myWhy = unfinished ? `Finish the rule first. ${unfinished}` : !inTerritory(draftScheme, cust) ? "Not in its territories" : skipped.find((s) => s.schemeId === draftId)?.reason ?? eligible(draftScheme, cust, date);

  let offOrder: string | null = null;
  const m = draft.mechanic;
  if (m.kind === "target-rebate") offOrder = `At the target, the rebate is NPR ${npr((m.target * m.pct) / 100)}.`;
  if (m.kind === "display") offOrder = `Paid NPR ${npr(m.amount)} a month on a display claim with photo proof.`;
  if (m.kind === "early-payment") offOrder = `Paid within ${m.withinDays} days, this order gets NPR ${npr((ev.total * m.pct) / 100)} off.`;

  const customerOptions: SelectOption[] = customers.map((c) => ({ value: c.id, label: c.name, group: typeOf(c).plural, hint: `${c.city} · tier ${c.tier}` }));
  const setQty = (i: number, qty: number) => setCart((c) => c.map((l, j) => (j === i ? { ...l, qty } : l)));

  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
      <div className="flex items-baseline gap-2">
        <h2 className="m-0 text-[13px] font-semibold text-bz-text">Try it</h2>
        <span className="text-[11px] text-bz-text-soft">priced as on {day(date)}</span>
      </div>

      <div className="mt-4">
        <Select value={custId} onChange={setCustId} options={customerOptions} searchable width={300} label={cust?.name} className="w-full justify-between" />
        {cust && (
          <p className="m-0 mt-1.5 text-[11px] text-bz-text-soft">
            {typeOf(cust).name} · tier {cust.tier} · {cust.city}
          </p>
        )}
      </div>

      <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
        {cart.map((l, i) => {
          const p = productById(l.productId);
          return (
            <li key={`${l.productId}-${i}`} className="flex items-center gap-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] text-bz-text">{p.name}</span>
                <span className="block text-[10.5px] text-bz-text-soft">{p.unit}</span>
              </span>
              <NumberField value={l.qty} onChange={(q) => setQty(i, q)} ariaLabel={`${p.name} quantity`} className="w-[92px]" />
              <button type="button" className={PLAIN_BTN} aria-label={`Remove ${p.name}`} onClick={() => setCart((c) => c.filter((_, j) => j !== i))}>
                <X size={12} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Select
          value={null}
          onChange={(id) => setCart((c) => (c.some((l) => l.productId === id) ? c : [...c, { productId: id, qty: 1 }]))}
          options={PRODUCTS.map((p) => ({ value: p.id, label: p.name, group: p.brand, hint: p.pack }))}
          searchable
          width={280}
          label="Add a product"
          icon={Plus}
        />
        <label className="ml-auto inline-flex items-center gap-2 text-[11.5px] text-bz-text-muted">
          <Switch on={firstOrder} onChange={setFirstOrder} label="First order" /> First order
        </label>
      </div>

      <div className="mt-5 border-t border-bz-line-soft pt-4">
        {draft.applies !== "order" ? (
          <p className="m-0 text-[12px] leading-relaxed text-bz-text">
            {myWhy && myWhy !== "Only on a first order" ? <Dot tone="warn">{myWhy}</Dot> : <Dot tone="info">Not on the order</Dot>}
            <span className="mt-1 block text-bz-text-muted">{APPLIES_TEXT[draft.applies]}. {offOrder}</span>
          </p>
        ) : mine ? (
          <p className="m-0 text-[12px] text-bz-text">
            <Dot tone="good">This scheme applies</Dot>
            <span className="mt-1 flex items-baseline justify-between gap-3">
              <span className="text-bz-text-muted">{mine.text}</span>
              <Money value={mine.benefit} className="font-semibold" />
            </span>
          </p>
        ) : (
          <p className="m-0 text-[12px]">
            <Dot tone="warn">This scheme does not apply</Dot>
            <span className="mt-1 block text-bz-text-muted">{myWhy ?? "The cart doesn't qualify yet."}</span>
          </p>
        )}

        {ev.applied.filter((a) => a.schemeId !== draftId).length > 0 && (
          <div className="mt-4">
            <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Also applies</p>
            {ev.applied
              .filter((a) => a.schemeId !== draftId)
              .map((a) => (
                <p key={a.schemeId} className="m-0 flex items-baseline justify-between gap-3 py-0.5 text-[11.5px]">
                  <span className="min-w-0 truncate text-bz-text">{a.name}</span>
                  <Money value={a.benefit} code={false} className="text-bz-text-muted" />
                </p>
              ))}
          </div>
        )}

        {ev.hints.length > 0 && (
          <div className="mt-4">
            <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Close to more</p>
            {ev.hints.map((h) => (
              <div key={h.schemeId} className="py-1">
                <p className="m-0 text-[11.5px] text-bz-text">{h.text}</p>
                <p className="m-0 text-[10.5px] text-bz-text-soft">{h.name}</p>
                <Progress pct={h.progress * 100} className="mt-1" />
              </div>
            ))}
          </div>
        )}

        {skipped.filter((s) => s.schemeId !== draftId).length > 0 && (
          <div className="mt-4">
            <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Skipped</p>
            {skipped
              .filter((s) => s.schemeId !== draftId)
              .map((s) => (
                <p key={s.schemeId} className="m-0 flex items-baseline justify-between gap-3 py-0.5 text-[11.5px]">
                  <span className="min-w-0 truncate text-bz-text-muted">{s.name}</span>
                  <span className="shrink-0 text-bz-text-soft">{s.reason}</span>
                </p>
              ))}
          </div>
        )}

        <dl className={cn("m-0 mt-5 grid grid-cols-[1fr_auto] gap-y-1 border-t border-bz-line-soft pt-3 text-[11.5px]", NUM)}>
          <dt className="text-bz-text-muted">Order value</dt>
          <dd className="m-0 text-right text-bz-text">{npr(ev.gross)}</dd>
          <dt className="text-bz-text-muted">Discounts</dt>
          <dd className="m-0 text-right text-bz-text">{ev.discount ? `−${npr(ev.discount)}` : "—"}</dd>
          <dt className="text-bz-text-muted">Free goods (worth)</dt>
          <dd className="m-0 text-right text-bz-text">{ev.freeValue ? npr(ev.freeValue) : "—"}</dd>
          <dt className="text-bz-text-muted">VAT 13%</dt>
          <dd className="m-0 text-right text-bz-text">{npr(ev.tax)}</dd>
          <dt className="pt-1 font-semibold text-bz-text">Total</dt>
          <dd className="m-0 pt-1 text-right font-semibold text-bz-text">
            <Money value={ev.total} />
          </dd>
        </dl>
      </div>
    </div>
  );
}

// ── The page ────────────────────────────────────────────────────────────────

export function SchemeBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const schemes = useStore(schemesStore);
  const campaigns = useStore(campaignsStore);
  const customers = useStore(customersStore);
  const extrasAll = useStore(schemeExtrasStore);

  const original = id ? schemes.find((s) => s.id === id) : undefined;
  const copyOf = !id && params.get("copy") ? schemes.find((s) => s.id === params.get("copy")) : undefined;

  const [init] = React.useState(() => {
    if (original) return { s: clone(original), max: extrasAll[original.id]?.maxPerCustomer ?? 0, json: "" };
    if (copyOf) {
      const s = { ...clone(copyOf), id: NEW_ID, name: `${copyOf.name} (copy)`, status: "draft" as const, budget: copyOf.budget ? { ...copyOf.budget, used: 0 } : null, from: SF_TODAY > copyOf.from ? SF_TODAY : copyOf.from, to: copyOf.to < SF_TODAY ? "2026-12-31" : copyOf.to };
      return { s, max: extrasAll[copyOf.id]?.maxPerCustomer ?? 0, json: "copy" };
    }
    return { s: blankScheme(), max: 0, json: "" };
  });
  const [draft, setDraft] = React.useState<Scheme>(init.s);
  const [maxPer, setMaxPer] = React.useState(init.max);
  const [error, setError] = React.useState<string | null>(null);
  const baseline = React.useRef(init.json || JSON.stringify({ d: init.s, m: init.max }));
  const dirty = JSON.stringify({ d: draft, m: maxPer }) !== baseline.current;

  if (id && !original) {
    return (
      <SfShell page="schemes" title="Scheme">
        <Page width="narrow">
          <p className="m-0 text-[12.5px] text-bz-text-muted">
            No scheme {id}.{" "}
            <Link to={sfPath("schemes")} className="font-medium text-bz-text underline underline-offset-2">
              Back to schemes
            </Link>
          </p>
        </Page>
      </SfShell>
    );
  }

  const ruleLocked = !!original && original.status !== "draft" && original.status !== "scheduled";
  const o = ruleLocked ? 1 : 0;
  const patch = (p: Partial<Scheme>) => setDraft((d) => ({ ...d, ...p }));
  const pickKind = (k: MechanicKind) => patch({ mechanic: defaultMechanic(k), applies: MECHANICS.find((x) => x.kind === k)!.applies });
  const reach = customers.filter((c) => (!draft.typeIds.length || draft.typeIds.includes(c.typeId)) && (!draft.tiers.length || draft.tiers.includes(c.tier)) && inTerritory(draft, c)).length;

  const save = (asDraft: boolean) => {
    const err = validate(draft);
    if (err) return setError(err);
    const status = asDraft
      ? "draft"
      : original && original.status !== "draft" && original.status !== "scheduled"
        ? original.status
        : draft.to < SF_TODAY
          ? "ended"
          : draft.from > SF_TODAY
            ? "scheduled"
            : "live";
    const newId = draft.id || nextSchemeId(schemesStore.get());
    const final: Scheme = { ...draft, id: newId, name: draft.name.trim() || autoName(draft.mechanic), status };
    schemesStore.set((list) => (list.some((s) => s.id === newId) ? list.map((s) => (s.id === newId ? final : s)) : [final, ...list]));
    schemeExtrasStore.set((x) => ({ ...x, [newId]: { maxPerCustomer: maxPer || null } }));
    logEvent(`scheme:${newId}`, original ? (original.status === "draft" && !asDraft ? `published the scheme (${STATUS[status].label.toLowerCase()})` : "changed the scheme") : copyOf ? `created it as a copy of ${copyOf.id}` : asDraft ? "saved it as a draft" : `created it (${STATUS[status].label.toLowerCase()})`);
    navigate(sfPath(`schemes/${newId}`));
  };

  const primary = !original || original.status === "draft" ? "Publish" : "Save changes";
  const tiers: ("A" | "B" | "C")[] = ["A", "B", "C"];
  const regions = TERRITORIES.filter((t) => t.level === "region");

  return (
    <SfShell page="schemes" title={original ? `Edit ${original.id}` : "New scheme"}>
      <Page width="wide">
        <PageIntro
          actions={
            <Link to={original ? sfPath(`schemes/${original.id}`) : sfPath("schemes")} className={GHOST_SM}>
              Cancel
            </Link>
          }
        >
          {original ? (
            <>
              <Dot tone={STATUS[original.status].tone}>{STATUS[original.status].label}</Dot> <span className="ml-2">{original.name}</span>
            </>
          ) : copyOf ? (
            `A copy of ${copyOf.name}. Change what you need, then publish.`
          ) : (
            "Build the rule as a sentence, then try it on an order."
          )}
        </PageIntro>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 max-w-[660px]">
            {ruleLocked ? (
              <Step n={1} title="The rule">
                <p className="m-0 text-[12.5px] leading-relaxed text-bz-text">{ruleText(draft.mechanic)}.</p>
                <p className="m-0 mt-2 text-[11px] text-bz-text-soft">
                  A {STATUS[original!.status].label.toLowerCase()} scheme's rule can't change — orders already carry it.{" "}
                  <Link to={`${sfPath("schemes/new")}?copy=${original!.id}`} className="font-medium text-bz-text underline underline-offset-2">
                    Duplicate it
                  </Link>{" "}
                  to change the rule.
                </p>
              </Step>
            ) : (
              <>
                <Step n={1} title="What kind of scheme">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {MECHANICS.map((x) => {
                      const on = draft.mechanic.kind === x.kind;
                      return (
                        <button
                          key={x.kind}
                          type="button"
                          aria-pressed={on}
                          onClick={() => !on && pickKind(x.kind)}
                          className={cn(
                            "rounded-bz-md border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire",
                            on ? "border-bz-leaf-deep bg-bz-fire/15" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
                          )}
                        >
                          <span className="block text-[12px] font-semibold text-bz-text">{x.label}</span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-bz-text-soft">{x.example}</span>
                        </button>
                      );
                    })}
                  </div>
                </Step>

                <Step n={2} title="The rule" hint={APPLIES_TEXT[draft.applies] + "."}>
                  <RuleEditor m={draft.mechanic} set={(mechanic) => patch({ mechanic })} />
                  <p className="m-0 mt-5 rounded-bz-md bg-bz-paper-warm px-3 py-2 text-[12px] leading-relaxed text-bz-text">{ruleText(draft.mechanic)}.</p>
                </Step>
              </>
            )}

            <Step n={3 - o} title="Who it's for" hint={`Nothing picked means everyone. Reaches ${reach} customers today.`}>
              <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Customer types</p>
              <div className="flex flex-wrap gap-1.5">
                {CUSTOMER_TYPES.map((t) => (
                  <Pill key={t.id} on={draft.typeIds.includes(t.id)} onClick={() => patch({ typeIds: toggle(draft.typeIds, t.id) })}>
                    <span className="size-2 shrink-0 rounded-[3px]" style={{ background: idColor(t.color) }} />
                    {t.plural}
                  </Pill>
                ))}
              </div>
              <p className="m-0 mb-2 mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Tiers</p>
              <div className="flex flex-wrap gap-1.5">
                {tiers.map((t) => (
                  <Pill key={t} on={draft.tiers.includes(t)} onClick={() => patch({ tiers: toggle(draft.tiers, t) })}>
                    Tier {t}
                  </Pill>
                ))}
              </div>
              <p className="m-0 mb-2 mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Territories</p>
              <div className="flex flex-col gap-2">
                {regions.map((r) => {
                  const areas = TERRITORIES.filter((a) => a.parentId === r.id).map((a) => a.id);
                  const terrs = TERRITORIES.filter((t) => t.level === "territory" && t.parentId && areas.includes(t.parentId));
                  return (
                    <div key={r.id} className="flex flex-wrap gap-1.5">
                      <Pill on={draft.territoryIds.includes(r.id)} onClick={() => patch({ territoryIds: toggle(draft.territoryIds, r.id) })}>
                        All {r.name}
                      </Pill>
                      {terrs.map((t) => (
                        <Pill key={t.id} on={draft.territoryIds.includes(t.id)} onClick={() => patch({ territoryIds: toggle(draft.territoryIds, t.id) })}>
                          {t.name}
                        </Pill>
                      ))}
                    </div>
                  );
                })}
              </div>
            </Step>

            <Step n={4 - o} title="When and budget">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[11.5px] font-semibold text-bz-text">Name on the order</span>
                  <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} placeholder={autoName(draft.mechanic)} className={INPUT} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11.5px] font-semibold text-bz-text">Starts</span>
                  <input type="date" value={draft.from} onChange={(e) => patch({ from: e.target.value })} className={cn(INPUT, NUM)} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11.5px] font-semibold text-bz-text">Ends</span>
                  <input type="date" value={draft.to} min={draft.from} onChange={(e) => patch({ to: e.target.value })} className={cn(INPUT, NUM)} />
                </label>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[11.5px] font-semibold text-bz-text">Budget</span>
                  <div className="flex flex-wrap items-center gap-3">
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
                          <span className="text-[11px] text-bz-text-soft">units free / discounted</span>
                        </span>
                      ))}
                  </div>
                  <span className="text-[10.5px] text-bz-text-soft">
                    {draft.budget ? `The scheme stops by itself when the budget is used up${draft.budget.used ? ` — ${npr(draft.budget.used)} used so far` : ""}.` : "Runs until its end date."}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[11.5px] font-semibold text-bz-text">Campaign</span>
                  <Select
                    value={draft.campaignId ?? "none"}
                    onChange={(v) => patch({ campaignId: v === "none" ? null : v })}
                    options={[{ value: "none", label: "None" }, ...campaigns.map((c) => ({ value: c.id, label: c.name, hint: `${day(c.from)} – ${day(c.to)}` }))]}
                    label={campaigns.find((c) => c.id === draft.campaignId)?.name ?? "None"}
                    className="w-fit"
                  />
                </div>
              </div>
            </Step>

            <Step n={5 - o} title="Rules">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-[170px] text-[11.5px] font-semibold text-bz-text">Priority</span>
                  <NumberField value={draft.priority} onChange={(priority) => patch({ priority })} min={1} ariaLabel="Priority" className="w-[96px]" />
                  <span className="text-[11px] text-bz-text-soft">Lower numbers are checked first.</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-[170px] text-[11.5px] font-semibold text-bz-text">With other schemes</span>
                  <Segmented
                    value={draft.exclusive ? "exclusive" : "stack"}
                    onChange={(v) => patch({ exclusive: v === "exclusive" })}
                    options={[
                      { value: "stack", label: "Stack with them" },
                      { value: "exclusive", label: "Exclusive" },
                    ]}
                  />
                  <span className="w-full text-[11px] text-bz-text-soft sm:ml-[182px]">{draft.exclusive ? "When this applies, schemes checked after it are skipped." : "Other schemes can apply on the same order."}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-[170px] text-[11.5px] font-semibold text-bz-text">Max per customer</span>
                  <NumberField value={maxPer} onChange={setMaxPer} ariaLabel="Max times per customer" className="w-[96px]" />
                  <span className="text-[11px] text-bz-text-soft">{maxPer ? `Up to ${maxPer} ${maxPer === 1 ? "time" : "times"} per customer.` : "0 means no limit."}</span>
                </div>
              </div>
            </Step>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <Simulator draft={draft} />
          </aside>
        </div>
      </Page>

      {dirty && (
        <div className="sticky bottom-0 z-10 border-t border-bz-line bg-bz-surface px-4 py-3 md:px-8">
          <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-2">
            {error ? <Refusal text={error} onDismiss={() => setError(null)} className="min-w-0 flex-1" /> : <span className="min-w-0 flex-1 text-[11.5px] text-bz-text-muted">Unsaved changes</span>}
            <button
              type="button"
              className={GHOST}
              onClick={() => {
                setDraft(clone(init.s));
                setMaxPer(init.max);
                setError(null);
                if (init.json === "copy") navigate(sfPath("schemes"));
              }}
            >
              Discard
            </button>
            {(!original || original.status === "draft") && (
              <button type="button" className={GHOST} onClick={() => save(true)}>
                Save as draft
              </button>
            )}
            <button type="button" className={BTN} onClick={() => save(false)}>
              {primary}
            </button>
          </div>
        </div>
      )}
    </SfShell>
  );
}
