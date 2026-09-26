import * as React from "react";
import { useNavigate } from "react-router";
import { Barcode as BarcodeIcon, Boxes, ChevronDown, ChevronRight, Clock3, Grid2x2, Package, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { GHOST_SM, INPUT, NUM, PLAIN_BTN, Segmented, Select } from "../../sales/bzw";
import type { SelectOption, ToastMsg } from "../../sales/bzw";
import { AmountInput } from "../../sales/parts";
import { LINK, MasterSheet } from "../kit";
import { CATEGORIES, LEDGERS, itemsStore, newRowId, newItemId } from "../seed/items";
import type { Costing, Item, ItemType, LedgerKind, SubType } from "../seed/items";
import { AxesEditor, combos, countLine, generateFamily } from "./AxesDialog";
import type { Axis } from "./AxesDialog";
import {
  ME,
  TYPE_LABEL,
  codeTakenBy,
  getItem,
  hasUnits,
  latency,
  ledgerName,
  ledgersFor,
  nowIso,
  preferenceLedger,
  taxOptions,
  unitName,
  unitsFor,
  useBaseCode,
  useFlag,
} from "./model";

// ════════════════════════════════════════════════════════════════════════════
// NEW ITEM (spec §3.4) — a right sheet over the desk, type first.
//
//   • What is it? Four cards; Discount, Item group and Kit behind "Other
//     types". Nothing is preselected on a first use; afterwards the last type
//     used is (USER_STATE `view.masters-item-create`) — never a silent
//     Non-inventory. The base unit likewise: the last one used, marked so,
//     else blank and required — never a silent "Box".
//   • Accounts are one "Posts to …" line from Preference Setup; Change opens
//     the pickers in place.
//   • Matrix item: the axes with every combination ticked (D-7) and a live
//     count; Create saves the template, then generates with the full axis set.
//   • Create and open → the page ("Finish setting up"); Create and add another
//     keeps type, unit, category and tax. Duplicate / Copy setup fill the sheet
//     with the D-9 set; name and code stay blank. An unfinished sheet survives
//     a close as a draft (USER_STATE `draft.masters-item-create`).
// ════════════════════════════════════════════════════════════════════════════

type Kind = "inventory" | "service" | "non_inventory" | "matrix" | "discount" | "item_group" | "kit";
const CARDS: { kind: Kind; label: string; sub: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { kind: "inventory", label: "Stock item", sub: "Tracked in stock", icon: Boxes as unknown as React.ComponentType<{ size?: number }> },
  { kind: "service", label: "Service", sub: "Time or work", icon: Clock3 as unknown as React.ComponentType<{ size?: number }> },
  { kind: "non_inventory", label: "Non-stock", sub: "Bought or sold, not counted", icon: Package as unknown as React.ComponentType<{ size?: number }> },
  { kind: "matrix", label: "Matrix item", sub: "Sizes, colours…", icon: Grid2x2 as unknown as React.ComponentType<{ size?: number }> },
];
const OTHER: { kind: Kind; label: string }[] = [
  { kind: "discount", label: "Discount" },
  { kind: "item_group", label: "Item group" },
  { kind: "kit", label: "Kit" },
];
const typeOf = (k: Kind): ItemType => (k === "matrix" ? "inventory" : k);

type Draft = {
  kind: Kind | null;
  name: string;
  code: string;
  category_id: string | null;
  brand_id: string | null;
  unit_id: string | null;
  tax_id: string | null;
  sell: number;
  buy: number;
  sub_type: SubType;
  costing: Costing;
  ledgers: Partial<Record<LedgerKind, string | null>>;
  axes: Axis[];
  barcode: string | null;
  /** D-9's copied set, when the sheet was filled from Duplicate / Copy setup. */
  copied: Partial<Item> | null;
  copiedFrom: string | null;
};

const LAST_KEY = "view.masters-item-create";
const DRAFT_KEY = "draft.masters-item-create";
// The app keeps these in USER_STATE (server-backed); the mockup's stand-in is the browser's storage.
const readLast = (): { kind?: Kind; unit_id?: string } => {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY) ?? "{}");
  } catch {
    return {};
  }
};
const writeLast = (v: { kind: Kind; unit_id: string | null }) => {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(v));
  } catch {
    /* private window */
  }
};
const readDraft = (): Draft | null => {
  try {
    const d = localStorage.getItem(DRAFT_KEY);
    return d ? (JSON.parse(d) as Draft) : null;
  } catch {
    return null;
  }
};
const writeDraft = (d: Draft | null) => {
  try {
    if (d) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* private window */
  }
};

const blank = (): Draft => {
  const last = readLast();
  return {
    kind: last.kind ?? null,
    name: "",
    code: "",
    category_id: null,
    brand_id: null,
    unit_id: last.unit_id ?? null,
    tax_id: null,
    sell: 0,
    buy: 0,
    sub_type: "resale",
    costing: "FIFO",
    ledgers: {},
    axes: [],
    barcode: null,
    copied: null,
    copiedFrom: null,
  };
};

/** D-9: what Duplicate / Copy setup carries — never stock, cost layers, code, barcodes, files, history or variants. */
function copySet(src: Item): Partial<Item> {
  const { type, sub_type, subscription, unit_id, purchase_unit_id, sales_unit_id, stock_unit_id, consumption_unit_id, conversions, sales_rate, purchase_rate, discount_allowed, discount_pct, discount_amt, min_sale_qty, max_sale_qty, grant_commission, tax_id, taxable, wh_tax, non_posting, income_id, expense_id, asset_id, cogs_id, costing, serial, batch, shelf_life, has_warranty, warranty, end_of_life, storage, cold_chain, controlled, reorder, safety, min_order, max_order, lead_days, vendor_id, category_id, brand_id, orgs, apply_to_child, custom, description, hs_code } = src;
  return {
    type, sub_type, subscription, unit_id, purchase_unit_id, sales_unit_id, stock_unit_id, consumption_unit_id,
    conversions: conversions.map((c) => ({ ...c, id: newRowId("cv") })),
    sales_rate, purchase_rate, discount_allowed, discount_pct, discount_amt, min_sale_qty, max_sale_qty, grant_commission,
    tax_id, taxable, wh_tax, non_posting, income_id, expense_id, asset_id, cogs_id, costing, serial, batch, shelf_life, has_warranty, warranty,
    end_of_life, storage, cold_chain, controlled, reorder, safety, min_order, max_order, lead_days, vendor_id, category_id, brand_id, orgs, apply_to_child, custom, description, hs_code,
    // A duplicated template copies its axes, not its children.
    axes: src.axes ? src.axes.map((a) => ({ ...a, value_ids: [...a.value_ids] })) : null,
  };
}
function fromItem(src: Item, asDuplicate: boolean): Draft {
  const c = copySet(src);
  return {
    kind: src.axes ? "matrix" : (src.type as Kind),
    name: asDuplicate ? `${src.name} (copy)` : "",
    code: "",
    category_id: src.category_id,
    brand_id: src.brand_id,
    unit_id: src.unit_id,
    tax_id: src.tax_id,
    sell: src.sales_rate,
    buy: src.purchase_rate,
    sub_type: src.sub_type ?? "resale",
    costing: src.costing ?? "FIFO",
    ledgers: { income: src.income_id, expense: src.expense_id, asset: src.asset_id, cogs: src.cogs_id },
    axes: src.axes ?? [],
    barcode: null,
    copied: c,
    copiedFrom: src.id,
  };
}

type Show = (kind: ToastMsg["kind"], text: string, action?: ToastMsg["action"], duration?: number) => void;

/**
 * `use`: opened from a document's item picker ("New item “Blue Mug”", spec §5.2 Create and use) — the
 * typed text is the name, the commit is "Create and use", and the new item goes back to the line
 * instead of opening its page. No draft is kept: the document is the draft.
 */
export type CreateUse = { name: string; onCreated: (id: string) => void };

export function ItemCreateSheet({ org, show, onClose, use }: { org: string; show: Show; onClose: () => void; use?: CreateUse }) {
  const navigate = useNavigate();
  const code = useBaseCode(org);
  const genFail = useFlag("genfail");
  // A document's URL carries its own params (`?copy=` on a desk) — the create sheet reads none of them there.
  const params = React.useMemo(() => new URLSearchParams(use ? "" : window.location.search), []);
  const copyId = params.get("copy");
  const dupSrc = copyId ? getItem(copyId) : null;
  const seeded = React.useMemo<Draft>(() => {
    if (dupSrc) return fromItem(dupSrc, true);
    const d = blank();
    const t = params.get("type") as Kind | null;
    if (t && [...CARDS, ...OTHER].some((c) => c.kind === t)) d.kind = t;
    d.name = use ? use.name : params.get("name") ?? "";
    d.barcode = params.get("barcode");
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [f, setF] = React.useState<Draft>(seeded);
  const [draftOffer, setDraftOffer] = React.useState<Draft | null>(() => (use || dupSrc || params.get("barcode") ? null : readDraft()));
  const [otherOpen, setOtherOpen] = React.useState(!!f.kind && OTHER.some((o) => o.kind === f.kind));
  const [accountsOpen, setAccountsOpen] = React.useState(false);
  const [costingOpen, setCostingOpen] = React.useState(false);
  const [tried, setTried] = React.useState(false);
  const [busy, setBusy] = React.useState<null | "saving" | "variants">(null);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState<{ id: string; name: string } | null>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const lastUnit = readLast().unit_id;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setF((d) => ({ ...d, [k]: v }));
    setRefusal(null);
  };
  const touched = f.name.trim() !== "" || f.code.trim() !== "" || f.sell > 0 || f.buy > 0 || f.axes.length > 0;

  // The draft rides along while the sheet is open, so an accidental close keeps it.
  React.useEffect(() => {
    if (use || draftOffer || dupSrc) return;
    const t = window.setTimeout(() => writeDraft(touched ? f : null), 300);
    return () => window.clearTimeout(t);
  }, [f, touched, draftOffer, dupSrc, use]);

  React.useEffect(() => {
    const t = window.setTimeout(() => nameRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, []);

  const all = itemsStore.get();
  const type = f.kind ? typeOf(f.kind) : null;
  const sub: SubType = type === "inventory" ? null : f.sub_type;
  const needs = type ? ledgersFor(type, sub) : [];
  const ledgerOf = (k: LedgerKind) => (k in f.ledgers ? f.ledgers[k] ?? null : preferenceLedger(k));
  const taken = f.code.trim() ? codeTakenBy(all, f.code) : null;
  const units = unitsFor([org]);
  const unitsNeeded = !!type && hasUnits({ type } as Item);

  const errors: Record<string, string> = {};
  if (tried && !f.kind) errors.kind = "Choose what it is.";
  if (tried && !f.name.trim()) errors.name = "A name is required.";
  if (f.name.length > 200) errors.name = "Keep the name under 200 characters.";
  if (taken) errors.code = `Code already used by ${taken.name}.`;
  if (tried && unitsNeeded && !f.unit_id) errors.unit = "Choose a base unit.";
  if (tried && f.kind === "matrix" && combos(f.axes.filter((a) => a.attribute_id)).length === 0) errors.axes = "Pick at least one attribute and value.";

  const build = (): Item => {
    const id = newItemId();
    const when = nowIso();
    const t = typeOf(f.kind!);
    const base = f.copied ?? {};
    return {
      ...(emptyItem() as Item),
      ...base,
      id,
      code: f.code.trim() || null,
      name: f.name.trim(),
      type: t,
      sub_type: t === "inventory" ? null : f.sub_type,
      category_id: f.category_id,
      brand_id: f.brand_id,
      unit_id: unitsNeeded ? f.unit_id : null,
      tax_id: f.tax_id,
      taxable: !!f.tax_id,
      sales_rate: f.sell,
      purchase_rate: f.buy,
      costing: t === "inventory" ? f.costing : null,
      income_id: needs.some((n) => n.kind === "income") ? ledgerOf("income") : base.income_id ?? null,
      expense_id: needs.some((n) => n.kind === "expense") ? ledgerOf("expense") : base.expense_id ?? null,
      asset_id: needs.some((n) => n.kind === "asset") ? ledgerOf("asset") : base.asset_id ?? null,
      cogs_id: needs.some((n) => n.kind === "cogs") ? ledgerOf("cogs") : base.cogs_id ?? null,
      axes: null,
      barcodes: f.barcode ? [{ id: newRowId("bc"), barcode: f.barcode, unit_id: f.unit_id, price: null, discount: null }] : [],
      orgs: base.orgs ?? [org],
      history: [{ id: newRowId("h"), who: ME, when, kind: "created" }],
      created: { by: ME, on: when },
      modified: { by: ME, on: when },
    };
  };

  const validate = () => {
    setTried(true);
    const first = !f.kind ? "Choose what it is." : !f.name.trim() ? "A name is required." : taken ? `Code already used by ${taken.name}.` : unitsNeeded && !f.unit_id ? "Choose a base unit." : f.kind === "matrix" && combos(f.axes.filter((a) => a.attribute_id)).length === 0 ? "Pick at least one attribute and value." : null;
    if (first) {
      // The sentence is said ONCE, under its field (it is an alert there); the foot stays for the
      // server's own refusals — the same sentence in both places was announced twice (review §16.2 #5).
      // Save refuses AND takes the reader to what it names (spec §3.3 save model): the type cards,
      // or the control of the first field carrying a sentence.
      window.setTimeout(() => {
        const root = nameRef.current?.closest<HTMLElement>("[data-bzw-sheet]");
        if (!root) return;
        const target = !f.kind
          ? root.querySelector<HTMLElement>("button[aria-pressed]")
          : root.querySelector<HTMLElement>("label [role=alert]")?.closest("label")?.querySelector<HTMLElement>("input, button, textarea");
        target?.focus();
      }, 0);
    }
    return !first;
  };

  const create = async (andAnother: boolean) => {
    if (busy || !validate()) return;
    setBusy("saving");
    await latency(500);
    const it = build();
    itemsStore.set((xs) => [...xs, it]);
    writeLast({ kind: f.kind!, unit_id: f.unit_id });
    if (!use) writeDraft(null);
    let variantsNote = "";
    if (f.kind === "matrix") {
      setBusy("variants");
      await latency(700);
      if (genFail) {
        // The template stays; the generate call failed — say so and point at its page.
        setBusy(null);
        setFailed({ id: it.id, name: it.name });
        return;
      }
      const r = generateFamily(it.id, f.axes.filter((a) => a.attribute_id));
      variantsNote = `${r.created.length} variants created`;
    }
    setBusy(null);
    const qs = org ? `?org=${org}&new=1` : "?new=1";
    if (use) {
      // Back to the document: the page opens only on request, in a new tab so the draft survives.
      show("success", `${it.name} created`, { label: "Open", run: () => window.open(`/design/masters/items/${it.id}/page${qs}`, "_blank") });
      use.onCreated(it.id);
      return;
    }
    if (andAnother) {
      show("success", `${it.name} created`, { label: "Open", run: () => navigate(`/design/masters/items/${it.id}/page${qs}`) });
      // The next item is usually a sibling: keep type, unit, category and tax.
      setF((d) => ({ ...blank(), kind: d.kind, unit_id: d.unit_id, category_id: d.category_id, tax_id: d.tax_id, sub_type: d.sub_type, costing: d.costing, ledgers: d.ledgers, axes: d.kind === "matrix" ? d.axes : [] }));
      setTried(false);
      window.setTimeout(() => nameRef.current?.focus(), 30);
      return;
    }
    navigate(`/design/masters/items/${it.id}/page${qs}`);
    if (dupSrc || f.copiedFrom) show("success", "Stock, barcodes and code were not copied.");
    else show("success", variantsNote || `${it.name} created`);
  };

  const close = () => {
    // A touched sheet leaves its draft behind (the resume offer next time).
    if (touched && !dupSrc && !use) writeDraft(f);
    onClose();
  };

  const copyFrom = (id: string) => {
    const src = getItem(id);
    if (!src) return;
    setF((d) => ({ ...fromItem(src, false), name: d.name, code: d.code, barcode: d.barcode }));
    setOtherOpen(OTHER.some((o) => o.kind === (src.axes ? "matrix" : src.type)));
    show("info", `Setup copied from ${src.name}`);
  };

  const cardBtn = (c: { kind: Kind; label: string; sub?: string; icon?: React.ComponentType<{ size?: number }> }) => {
    const on = f.kind === c.kind;
    const Icon = c.icon;
    return (
      <button
        key={c.kind}
        type="button"
        aria-pressed={on}
        onClick={() => set("kind", c.kind)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-bz-md border px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire",
          on ? "border-bz-fire bg-bz-fire/15" : "border-bz-line-soft bg-bz-surface hover:bg-bz-paper-warm",
        )}
      >
        {Icon && (
          <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-bz-sm", on ? "bg-bz-fire/30 text-bz-text" : "bg-bz-paper-warm text-bz-text-muted")}>
            <Icon size={14} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-bz-text">{c.label}</span>
          {c.sub && <span className="mt-0.5 block truncate text-[11px] text-bz-text-muted">{c.sub}</span>}
        </span>
      </button>
    );
  };

  const field = (label: string, children: React.ReactNode, o: { required?: boolean; error?: string; hint?: React.ReactNode; className?: string } = {}) => (
    <label className={cn("flex min-w-0 flex-col gap-1", o.className)}>
      <span className="text-[11.5px] font-semibold text-bz-text">
        {label}
        {o.required && <span className="ml-0.5 text-bz-red">*</span>}
      </span>
      {children}
      {o.error ? (
        <span role="alert" className="text-[10.5px] leading-snug text-bz-red">
          {o.error}
        </span>
      ) : (
        o.hint && <span className="text-[10.5px] leading-snug text-bz-text-soft">{o.hint}</span>
      )}
    </label>
  );
  const FS = "h-9 w-full justify-between rounded-bz-md border-bz-line bg-bz-paper px-3 text-[12.5px] font-normal hover:border-bz-text-soft";

  return (
    <MasterSheet
      mode={use ? "use" : "create"}
      width={520}
      title={dupSrc ? "Duplicate item" : "New item"}
      eyebrow={dupSrc ? `From ${dupSrc.name}` : undefined}
      onClose={close}
      dirty={false}
      onCommit={() => create(false)}
      secondary={use ? undefined : { label: "Create and add another", run: () => create(true) }}
      commitLabel={busy === "variants" ? "Creating variants…" : busy ? "Creating…" : use ? "Create and use" : "Create and open"}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
    >
      <div className="flex flex-col gap-4 px-5 py-4">
        {draftOffer && (
          <div className="flex flex-wrap items-center gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2.5 text-[12px] text-bz-text">
            <span className="min-w-0 flex-1">
              Continue the item you started?
              {draftOffer.name && <span className="text-bz-text-muted"> · {draftOffer.name}</span>}
            </span>
            <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => (setF(draftOffer), setOtherOpen(!!draftOffer.kind && OTHER.some((o) => o.kind === draftOffer.kind)), setDraftOffer(null))}>
              Continue
            </button>
            <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => (writeDraft(null), setDraftOffer(null))}>
              Start over
            </button>
          </div>
        )}
        {failed && (
          <div role="alert" className="rounded-bz-md bg-bz-red-soft px-3 py-2.5 text-[12px] text-bz-red">
            Template created. Variants weren't —{" "}
            <button
              type="button"
              className={cn(LINK, "text-bz-red")}
              onClick={() => (use ? window.open(`/design/masters/items/${failed.id}/page${org ? `?org=${org}` : ""}#variants`, "_blank") : navigate(`/design/masters/items/${failed.id}/page${org ? `?org=${org}` : ""}#variants`))}
            >
              retry on its page
            </button>
            .
          </div>
        )}

        <section>
          <p className="m-0 mb-2 text-[12px] font-semibold text-bz-text">What is it?</p>
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">{CARDS.map(cardBtn)}</div>
          <button type="button" onClick={() => setOtherOpen((v) => !v)} aria-expanded={otherOpen} className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text">
            {otherOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Other types
          </button>
          {otherOpen && <div className="mt-2 grid grid-cols-3 gap-2">{OTHER.map(cardBtn)}</div>}
          {errors.kind && (
            <p role="alert" className="m-0 mt-1.5 text-[10.5px] text-bz-red">
              {errors.kind}
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field(
            "Name",
            <input ref={nameRef} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Blue Mug" className={cn(INPUT, errors.name && "border-bz-red-mark")} />,
            { required: true, error: errors.name, className: "sm:col-span-2" },
          )}
          {field("Code / SKU", <input value={f.code} onChange={(e) => set("code", e.target.value)} placeholder="Optional, like MUG-BLU" className={cn(INPUT, errors.code && "border-bz-red-mark")} />, {
            error: errors.code,
            hint: f.code.trim() && !taken ? <span className="text-bz-pos-deep">✓ Unique</span> : undefined,
          })}
          {field(
            "Category",
            <Select
              trigger="ghost"
              className={FS}
              label={CATEGORIES.find((c) => c.id === f.category_id)?.name ?? <span className="text-bz-text-soft">Uncategorised</span>}
              value={f.category_id ?? ""}
              onChange={(v) => set("category_id", v || null)}
              options={[{ value: "", label: "Uncategorised" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.name }))]}
              width={240}
            />,
          )}
          {unitsNeeded &&
            field(
              "Base unit",
              <Select
                trigger="ghost"
                className={cn(FS, errors.unit && "border-bz-red-mark")}
                label={f.unit_id ? unitName(f.unit_id) : <span className="text-bz-text-soft">Choose a unit</span>}
                value={f.unit_id}
                onChange={(v) => set("unit_id", v)}
                options={units.map((u) => ({ value: u.id, label: u.name, hint: u.code }))}
                width={240}
              />,
              { required: true, error: errors.unit, hint: f.unit_id && f.unit_id === lastUnit && !f.copiedFrom ? "Last used" : undefined },
            )}
          {field(
            "Tax",
            <Select
              trigger="ghost"
              className={FS}
              label={taxOptions().find((t) => t.id === f.tax_id)?.name ?? <span className="text-bz-text-soft">None</span>}
              value={f.tax_id ?? ""}
              onChange={(v) => set("tax_id", v || null)}
              options={[{ value: "", label: "None" }, ...taxOptions().map((t) => ({ value: t.id, label: t.name, meta: `${t.rate}%` }))]}
              width={260}
            />,
          )}
          {(type === "service" || type === "non_inventory" || type === "discount") &&
            field(
              "Used for",
              <Segmented
                size="sm"
                value={f.sub_type ?? "resale"}
                onChange={(v) => set("sub_type", v as SubType)}
                options={[
                  { value: "resale", label: "Selling & buying" },
                  { value: "sale", label: "Selling" },
                  { value: "purchase", label: "Buying" },
                ]}
              />,
              { className: "sm:col-span-2" },
            )}
          {field(
            "Sell price",
            <span className="relative block">
              <AmountInput ariaLabel="Sell price" value={f.sell} onChange={(n) => set("sell", n)} className={cn("h-9 text-[12.5px]", code && "pl-12")} />
              {code && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">{code}</span>}
            </span>,
            { hint: f.sell > 0 && f.buy > f.sell ? <span className="text-bz-amber-ink">Below purchase price.</span> : undefined },
          )}
          {field(
            "Purchase price",
            <span className="relative block">
              <AmountInput ariaLabel="Purchase price" value={f.buy} onChange={(n) => set("buy", n)} className={cn("h-9 text-[12.5px]", code && "pl-12")} />
              {code && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">{code}</span>}
            </span>,
          )}
        </section>

        {f.kind === "matrix" && (
          <section>
            <p className="m-0 mb-2 text-[12px] font-semibold text-bz-text">Axes</p>
            <AxesEditor axes={f.axes.length ? f.axes : [{ attribute_id: "", value_ids: [] }]} onChange={(a) => set("axes", a)} />
            <p className={cn("m-0 mt-2 text-[12px] font-medium", errors.axes ? "text-bz-red" : "text-bz-text", NUM)} role="status">
              {errors.axes ?? countLine(f.axes.filter((a) => a.attribute_id))}
            </p>
          </section>
        )}

        {type && (needs.length > 0 || type === "inventory") && (
          <section className="flex flex-col gap-2 rounded-bz-md border border-bz-line-soft px-3 py-2.5 text-[12px]">
            {needs.length > 0 && (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="w-[64px] shrink-0 text-bz-text-muted">Posts to</span>
                  <span className="min-w-0 flex-1 text-bz-text">
                    {needs.map((n) => ledgerName(ledgerOf(n.kind)) ?? <span key={n.kind} className="text-bz-red">{n.kind in f.ledgers ? `${n.label.replace(" account", "")} not set — choose one.` : `No default ${n.kind} account — choose one.`}</span>).reduce<React.ReactNode[]>((acc, x, i) => (i ? [...acc, " · ", x] : [x]), [])}
                  </span>
                  <button type="button" className={cn(LINK, "text-[11.5px]")} onClick={() => setAccountsOpen((v) => !v)}>
                    {accountsOpen ? "Done" : "Change"}
                  </button>
                </div>
                {accountsOpen && (
                  <div className="mt-2 grid grid-cols-1 gap-2 pl-[72px] sm:grid-cols-2">
                    {needs.map((n) => (
                      <div key={n.kind} className="flex min-w-0 flex-col gap-1">
                        <span className="text-[11px] font-semibold text-bz-text-muted">{n.label}</span>
                        <Select
                          trigger="ghost"
                          className={cn(FS, "h-8")}
                          label={ledgerName(ledgerOf(n.kind)) ?? <span className="text-bz-text-soft">Choose…</span>}
                          value={ledgerOf(n.kind)}
                          onChange={(v) => set("ledgers", { ...f.ledgers, [n.kind]: v })}
                          options={LEDGERS.filter((l) => l.kind === n.kind || (n.kind === "expense" && l.kind === "cogs")).map((l) => ({ value: l.id, label: l.name, hint: l.id === preferenceLedger(n.kind) ? "Preference default" : undefined }))}
                          width={240}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {type === "inventory" && (
              <div className="flex items-baseline gap-2">
                <span className="w-[64px] shrink-0 text-bz-text-muted">Costing</span>
                {costingOpen ? (
                  <Segmented size="sm" value={f.costing} onChange={(v) => set("costing", v as Costing)} options={(["FIFO", "LIFO", "Average", "Standard"] as Costing[]).map((c) => ({ value: c, label: c }))} />
                ) : (
                  <span className="min-w-0 flex-1 text-bz-text">{f.costing}</span>
                )}
                <button type="button" className={cn(LINK, "ml-auto text-[11.5px]")} onClick={() => setCostingOpen((v) => !v)}>
                  {costingOpen ? "Done" : "Change"}
                </button>
              </div>
            )}
          </section>
        )}

        {f.barcode && (
          <p className={cn("m-0 flex items-center gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2 text-[12px] text-bz-text", NUM)}>
            <BarcodeIcon size={13} className="text-bz-text-muted" />
            Barcode {f.barcode} is added with it.
            <button type="button" className={cn(PLAIN_BTN, "ml-auto")} onClick={() => set("barcode", null)} aria-label="Don't add the barcode">
              <X size={12} />
            </button>
          </p>
        )}

        {f.copiedFrom && (
          <p className="m-0 text-[11.5px] text-bz-text-muted">
            Setup from {getItem(f.copiedFrom)?.name}: units, prices, tax, accounts, costing, tracking, reorder, category and subsidiaries.{" "}
            <span className="text-bz-text-soft">Not stock, barcodes, code, files{f.kind === "matrix" ? " or variants — its axes are ready to generate" : ""}.</span>
          </p>
        )}

        {!dupSrc && !use && (
          <div className="flex items-center gap-2">
            <Select
              trigger="plain"
              value={null}
              onChange={copyFrom}
              options={all
                .filter((x) => !x.archived && !x.parent_id)
                .map<SelectOption>((x) => ({ value: x.id, label: x.name, hint: [x.code, TYPE_LABEL[x.type]].filter(Boolean).join(" · ") }))}
              width={300}
              searchable
              placeholder="Name or code"
            >
              <span className={cn(LINK, "text-[12px]")}>Copy setup from an item…</span>
            </Select>
          </div>
        )}
      </div>
    </MasterSheet>
  );
}

function emptyItem(): Omit<Item, "id" | "code" | "name" | "type"> {
  return {
    short_cut: null,
    sub_type: null,
    subscription: false,
    archived: false,
    parent_id: null,
    axes: null,
    values: null,
    category_id: null,
    brand_id: null,
    description: null,
    sales_description: null,
    purchase_description: null,
    hs_code: null,
    weight: null,
    manufacturer: null,
    mpn: null,
    country: null,
    unit_id: null,
    purchase_unit_id: null,
    sales_unit_id: null,
    stock_unit_id: null,
    consumption_unit_id: null,
    conversions: [],
    sales_rate: 0,
    purchase_rate: 0,
    discount_allowed: false,
    discount_pct: 0,
    discount_amt: 0,
    min_sale_qty: null,
    max_sale_qty: null,
    grant_commission: true,
    tax_id: null,
    taxable: false,
    wh_tax: null,
    non_posting: false,
    income_id: null,
    expense_id: null,
    asset_id: null,
    cogs_id: null,
    other_ledgers: [],
    costing: null,
    reorder: null,
    safety: null,
    min_order: null,
    max_order: null,
    lead_days: null,
    vendor_id: null,
    serial: false,
    batch: false,
    shelf_life: null,
    has_warranty: false,
    warranty: null,
    end_of_life: null,
    storage: null,
    cold_chain: false,
    controlled: false,
    barcodes: [],
    orgs: [],
    apply_to_child: false,
    custom: {},
    image: null,
    files: [],
    stock: [],
    unit_cost: null,
    has_movements: false,
    open_lines: [],
    sold_30d: null,
    movements: [],
    usage: 0,
    pos_prices: 0,
    history: [],
    created: { by: ME, on: nowIso() },
    modified: { by: ME, on: nowIso() },
  };
}
