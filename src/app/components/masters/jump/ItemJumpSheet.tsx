import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../ui/utils";
import { Chip, Empty, GHOST_SM, INPUT, NUM, Select } from "../../sales/bzw";
import type { SelectOption } from "../../sales/bzw";
import { AmountInput, Section } from "../../sales/parts";
import { TAX_LABEL, itemById, locationById } from "../../sales/orders";
import type { Customer, TaxCode } from "../../sales/orders";
import { PRICE_LEVELS } from "../../sales/master";
import { CopyText, LINK, LOCKED_BY_MOVEMENT, Lock, MasterSheet, PageField, SheetContext, Source } from "../kit";
import { CATEGORIES, LEDGERS } from "../seed/items";
import type { Item, LedgerKind } from "../seed/items";
import { ItemImage } from "../items/ItemPeek";
import {
  FIELD_LABEL,
  TYPE_LABEL,
  allStockRows,
  codeTakenBy,
  effLedger,
  effRate,
  isStock,
  isVariant,
  ledgerName,
  ledgersFor,
  money,
  negText,
  patchItem,
  preferenceLedger,
  qty,
  taxName,
  templateOf,
  unitName,
  useBaseCode,
  useItems,
  valuesLong,
} from "../items/model";
import { DOCUMENT_TAX_IDS } from "./bridge";
import { pricedRate } from "./offers";

// ════════════════════════════════════════════════════════════════════════════
// ITEM JUMP SHEET — the item master opened from a composer line (spec §5.2)
//
// The item's OWN surface — the head, section names and field faces of its
// page — over the document, which stays visible behind a 10 % dim. On top, a
// warm "On this invoice" band says what THIS document does with the item:
// the customer and their price level, what is on hand where it ships from,
// the line as typed, and what the composer's own pricing gives.
//
//   editable   Prices · Tax & accounts · Essentials (name, code, category)
//   read       type, base unit, costing — 🔒 when stock moved, else a door
//              to the page; units, barcodes and variants live on the page
//   Save       PATCH of the changed fields (B-I3); the composer then OFFERS
//              the new price / tax to every line holding the item
//   ↗ door     the page in a NEW tab at the section last touched here
//
// Mock switches read by the composer: ?perm=read (view only) ·
// ?savefail=1 (the first Save fails) · ?conflict=1 (the first Save meets a
// newer save by someone else — Reload keeps your edits).
// ════════════════════════════════════════════════════════════════════════════

export type JumpLine = { no: number; qty: number; unit: string; rate: number; tax: TaxCode; priceLevel?: string; locked: boolean };
type Form = Pick<Item, "name" | "code" | "category_id" | "sales_rate" | "purchase_rate" | "tax_id" | "taxable" | "income_id" | "expense_id" | "asset_id" | "cogs_id">;
const KEYS: (keyof Form)[] = ["name", "code", "category_id", "sales_rate", "purchase_rate", "tax_id", "taxable", "income_id", "expense_id", "asset_id", "cogs_id"];
const pick = (i: Item): Form => Object.fromEntries(KEYS.map((k) => [k, i[k]])) as Form;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const FIELD_SELECT = "h-9 w-full justify-between rounded-bz-md border-bz-line bg-bz-paper px-3 text-[12.5px] font-normal hover:border-bz-text-soft";

export type JumpFlags = { readOnly: boolean; failFirst: boolean; conflictFirst: boolean };

export function ItemJumpSheet({
  itemId,
  line,
  noun,
  customer,
  locationId,
  org,
  flags,
  onClose,
  onSaved,
  onOpenPage,
}: {
  itemId: string;
  line: JumpLine;
  noun: "invoice" | "order" | "estimate";
  customer: Customer | undefined;
  locationId: string;
  /** The masters org the document is in (NP-01 → 186). */
  org: string;
  flags: JumpFlags;
  onClose: () => void;
  /** Saved: the composer offers the change to its lines and toasts an Undo. */
  onSaved: (fields: Partial<Item>, before: Item) => void;
  /** The record page in a new tab, at `section`. */
  onOpenPage: (section: string) => void;
}) {
  const all = useItems();
  const item = all.find((x) => x.id === itemId) ?? null;
  if (!item)
    return (
      <MasterSheet mode="view" eyebrow={`Item · line ${line.no}`} title="Item" onClose={onClose}>
        <Empty title="This item isn't available." />
      </MasterSheet>
    );
  return <JumpForm key={item.id} item={item} all={all} line={line} noun={noun} customer={customer} locationId={locationId} org={org} flags={flags} onClose={onClose} onSaved={onSaved} onOpenPage={onOpenPage} />;
}

function JumpForm({
  item,
  all,
  line,
  noun,
  customer,
  locationId,
  org,
  flags,
  onClose,
  onSaved,
  onOpenPage,
}: {
  item: Item;
  all: Item[];
  line: JumpLine;
  noun: "invoice" | "order" | "estimate";
  customer: Customer | undefined;
  locationId: string;
  org: string;
  flags: JumpFlags;
  onClose: () => void;
  onSaved: (fields: Partial<Item>, before: Item) => void;
  onOpenPage: (section: string) => void;
}) {
  const ro = flags.readOnly;
  const code = useBaseCode(org);
  const [form, setForm] = React.useState<Form>(() => pick(item));
  const [tried, setTried] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [conflict, setConflict] = React.useState(false);
  const failArmed = React.useRef(flags.failFirst);
  const conflictArmed = React.useRef(flags.conflictFirst);
  const [section, setSection] = React.useState("prices");
  const bodyRef = React.useRef<HTMLDivElement>(null);

  // The stored item changed (a save in another tab, an Undo): untouched fields take it; staged ones stay.
  const prevItem = React.useRef(item);
  React.useEffect(() => {
    const prev = prevItem.current;
    prevItem.current = item;
    if (prev === item) return;
    setForm((f) => {
      const next = pick(item);
      KEYS.forEach((k) => {
        if (!same(f[k], prev[k])) (next as Record<string, unknown>)[k] = f[k];
      });
      return next;
    });
  }, [item]);

  // Keyboard users land in the sheet: the sell price (a view-only sheet: its close).
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const sheets = document.querySelectorAll<HTMLElement>("[data-bzw-sheet]");
      const me = sheets[sheets.length - 1];
      (me?.querySelector<HTMLElement>("[data-autofocus] input") ?? me?.querySelector<HTMLElement>('button[aria-label="Close"]'))?.focus();
    }, 60);
    return () => window.clearTimeout(t);
  }, []);

  const changed = KEYS.filter((k) => !same(form[k], item[k]));
  const dirty = !ro && changed.length > 0;
  const dirtyRef = React.useRef(dirty);
  dirtyRef.current = dirty;
  const savedOk = React.useRef(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => (setForm((f) => ({ ...f, [k]: v })), setRefusal(null));

  const variant = isVariant(item);
  const parent = templateOf(all, item);
  const locked = item.has_movements;
  const taken = form.code && form.code !== item.code ? codeTakenBy(all, form.code, item.id) : null;
  const errors: Partial<Record<keyof Form, string>> = {};
  if (tried && !form.name.trim()) errors.name = "A name is required.";
  if (form.name.length > 200) errors.name = "Keep the name under 200 characters.";
  if (taken) errors.code = `Code already used by ${taken.name}.`;
  if (form.sales_rate < 0) errors.sales_rate = "A price is 0 or more.";
  if (form.purchase_rate < 0) errors.purchase_rate = "A price is 0 or more.";

  const save = () => {
    savedOk.current = false;
    if (ro) return;
    if (!changed.length) return onClose();
    setTried(true);
    const first = !form.name.trim() ? "A name is required." : taken ? `Code already used by ${taken.name}.` : form.sales_rate < 0 || form.purchase_rate < 0 ? "A price is 0 or more." : null;
    if (first) return setRefusal(first);
    if (conflictArmed.current) {
      // The PATCH carries expected_modified_date; someone saved first → 409, naming who.
      conflictArmed.current = false;
      return setConflict(true);
    }
    if (failArmed.current) {
      failArmed.current = false;
      return setRefusal("Couldn't save — the server didn't answer. Try again.");
    }
    const fields: Partial<Item> = {};
    changed.forEach((k) => ((fields as Record<string, unknown>)[k] = form[k]));
    const before = patchItem(item.id, fields);
    if (!before) return setRefusal("This item isn't available.");
    savedOk.current = true;
    setConflict(false);
    onSaved(fields, before);
  };

  /** 409's Reload: their value for a field you did not touch; yours stay staged. */
  const reload = () => {
    const theirs: Partial<Item> = !changed.includes("purchase_rate") ? { purchase_rate: Math.round((item.purchase_rate || 100) * 1.05 * 100) / 100 } : { category_id: item.category_id ?? "c-industrial" };
    patchItem(item.id, theirs, "Sneha Maharjan");
    setConflict(false);
  };

  // ── What the document does with the item ──
  const sell = effRate(all, { ...item, sales_rate: form.sales_rate }, "sales_rate").value;
  const savedSell = effRate(all, item, "sales_rate").value;
  const level = line.priceLevel && PRICE_LEVELS.find((p) => p.id === line.priceLevel);
  const priced = pricedRate({ itemId: item.id, unit: line.unit, priceLevel: line.priceLevel }, savedSell);
  const stockRow = isStock(item) ? allStockRows(item).find((r) => r.location_id === locationId) : undefined;
  const avail = stockRow ? stockRow.on_hand - stockRow.committed : 0;
  const locName = locationById(locationId)?.name ?? locationId;
  // The unit as the document writes it ("pcs"), so the band and the line read alike.
  const baseUnit = itemById(item.id)?.unit ?? unitName(item.unit_id) ?? "—";
  const context = (
    <SheetContext
      title={`On this ${noun}`}
      rows={[
        customer ? (
          <span key="c">
            {customer.name} <span className="text-bz-text-muted">· {customer.priceLevel} prices{level && level.pct ? ` ${level.pct > 0 ? "+" : "−"}${Math.abs(level.pct)} %` : ""}</span>
          </span>
        ) : (
          <span key="c" className="text-bz-text-muted">No customer yet — the item price applies.</span>
        ),
        isStock(item) ? (
          <span key="s" className={NUM}>
            Available at {locName} <span className={cn("font-semibold", avail < 0 ? "text-bz-red" : avail === 0 ? "text-bz-amber-ink" : "text-bz-text")}>{negText(avail)}{avail < 0 ? " neg" : ""}</span> {baseUnit}
          </span>
        ) : null,
        <span key="l" className={NUM}>
          Line {line.no} · {qty(line.qty)} {line.unit} at <span className="font-semibold">{money(line.rate)}</span> · {TAX_LABEL[line.tax]}
          {line.locked && <span className="text-bz-text-muted"> · delivered or billed — the line keeps its values</span>}
        </span>,
        <span key="p" className={cn("text-bz-text-muted", NUM)}>
          Item price {money(savedSell)}
          {level && level.pct ? ` · ${level.id} ${level.pct > 0 ? "+" : "−"}${Math.abs(level.pct)} % = ${money(priced)}` : ""}
          {Math.abs(priced - line.rate) < 0.005 ? " — the line uses it" : ` — the line has ${money(line.rate)}`}
        </span>,
        customer?.taxCode ? (
          <span key="t" className="text-bz-text-muted">
            {customer.name}'s tax {TAX_LABEL[customer.taxCode]} applies, not the item's.
          </span>
        ) : null,
      ]}
    />
  );

  // ── Fields ──
  const moneyF = (k: "sales_rate" | "purchase_rate", label: string, hint?: React.ReactNode, auto?: boolean) => (
    <PageField label={label} fieldKey={k} dirty={!same(form[k], item[k])} error={errors[k]} hint={hint}>
      {ro ? (
        <ReadFace>{form[k] ? `${code ? `${code} ` : ""}${money(form[k])}` : "—"}</ReadFace>
      ) : (
        <span className="relative block" data-autofocus={auto ? "" : undefined}>
          <AmountInput ariaLabel={label} value={form[k]} onChange={(n) => set(k, n)} invalid={!!errors[k]} className={cn("h-9 text-[12.5px]", code && "pl-12")} />
          {code && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">{code}</span>}
        </span>
      )}
    </PageField>
  );
  const needs = ledgersFor(item.type, item.sub_type);
  const accountF = (kind: LedgerKind, label: string, refuse: string) => {
    const k = `${kind}_id` as "income_id" | "expense_id" | "asset_id" | "cogs_id";
    const own = form[k];
    const eff = effLedger(all, { ...item, [k]: own }, kind);
    const inherited = !own && eff.source === "template";
    const missing = !eff.value;
    const opts: SelectOption[] = LEDGERS.filter((l) => l.kind === kind || (kind === "expense" && l.kind === "cogs")).map((l) => ({ value: l.id, label: l.name, hint: l.id === preferenceLedger(kind) ? "Preference default" : undefined }));
    return (
      <PageField
        key={kind}
        label={label}
        fieldKey={k}
        dirty={!same(own, item[k])}
        aside={inherited ? <Source kind="inherited" from="from template" /> : undefined}
        hint={missing ? <Source kind="missing" text={refuse} useDefault={ro ? undefined : { label: ledgerName(preferenceLedger(kind)) ?? "", onUse: () => set(k, preferenceLedger(kind)) }} /> : undefined}
      >
        {ro ? (
          <ReadFace soft={!own}>{ledgerName(eff.value) ?? "Not set"}</ReadFace>
        ) : (
          <Select
            trigger="ghost"
            className={cn(FIELD_SELECT, missing && "border-bz-red-mark")}
            label={own ? ledgerName(own) : inherited ? <span className="text-bz-text-soft">{ledgerName(eff.value)}</span> : <span className="text-bz-text-soft">Choose an account…</span>}
            value={own}
            onChange={(v) => set(k, v)}
            options={opts}
            width={280}
          />
        )}
      </PageField>
    );
  };
  const pageLink = (label: string, sec: string) => (
    <button type="button" className={cn(LINK, "inline-flex items-center gap-0.5 text-[11px]")} onClick={() => onOpenPage(sec)}>
      {label} <ArrowUpRight size={11} />
    </button>
  );
  const taxOpts: SelectOption[] = [{ value: "", label: "None" }, ...DOCUMENT_TAX_IDS.map((id) => ({ value: id, label: taxName(id) ?? id }))];

  return (
    <MasterSheet
      mode={ro ? "view" : "use"}
      commitLabel={ro ? undefined : "Save"}
      eyebrow={`Item · line ${line.no}`}
      title={item.name}
      image={<ItemImage state={variant ? parent?.image ?? null : item.image} />}
      meta={[
        item.code ? <CopyText key="c" text={item.code} /> : <span key="c" className="text-bz-text-soft">No code</span>,
        `${TYPE_LABEL[item.type]}${item.costing ? ` · ${item.costing}` : ""}`,
      ]}
      chips={
        (ro || item.archived || variant) && (
          <>
            {variant && parent && <Chip tone="neutral" dot={false}>Variant of {parent.name}</Chip>}
            {item.archived && <Chip tone="pending" dot={false}>Archived</Chip>}
            {ro && <Chip tone="neutral" dot={false}>View only</Chip>}
          </>
        )
      }
      door={{
        label: "Open item page",
        onOpen: () => {
          // "Save and open": the page opens only when the save went through.
          if (dirtyRef.current && !savedOk.current) return;
          onOpenPage(section);
        },
      }}
      footDoor
      context={
        <>
          {context}
          {item.archived && <p className="m-0 mt-2 text-[11.5px] text-bz-text-muted">Archived — hidden from pickers. Documents keep it.</p>}
          {variant && parent && <p className="m-0 mt-2 text-[11.5px] text-bz-text-muted">{valuesLong(all, item)} · priced on its own (D-6)</p>}
        </>
      }
      onCommit={save}
      dirty={dirty}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      onClose={onClose}
    >
      {conflict && (
        <div role="alert" className="flex flex-wrap items-center gap-2 border-b border-bz-line-soft bg-bz-red-soft px-5 py-2.5 text-[12px] text-bz-red">
          <span className="min-w-0 flex-1">Sneha Maharjan saved this item at 14:02.</span>
          <button type="button" className={cn(GHOST_SM, "h-7")} onClick={reload}>
            Reload
          </button>
        </div>
      )}
      <div
        ref={bodyRef}
        onFocusCapture={(e) => {
          const s = (e.target as Element).closest?.("[data-jump-sec]")?.getAttribute("data-jump-sec");
          if (s) setSection(s);
        }}
      >
        <Section title="Prices" summary={money(sell)} defaultOpen>
          <div data-jump-sec="prices" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {moneyF(
              "sales_rate",
              FIELD_LABEL.sales_rate ?? "Sell price",
              !same(form.sales_rate, item.sales_rate) ? (
                <span className={NUM}>was {money(item.sales_rate)}</span>
              ) : form.sales_rate > 0 && form.purchase_rate > form.sales_rate ? (
                <span className="text-bz-amber-ink">Below purchase price.</span>
              ) : variant && parent && form.sales_rate === parent.sales_rate ? (
                <Source kind="inherited" from={`Same as the template · ${money(parent.sales_rate)}`} />
              ) : undefined,
              true,
            )}
            {moneyF("purchase_rate", FIELD_LABEL.purchase_rate ?? "Purchase price")}
          </div>
        </Section>

        {item.type !== "item_group" && item.type !== "kit" && (
          <Section title="Tax & accounts" summary={[taxName(form.tax_id) ?? "No tax", needs.some((n) => !effLedger(all, { ...item, ...form }, n.kind).value) ? "accounts missing" : null].filter(Boolean).join(" · ")} defaultOpen>
            <div data-jump-sec="tax" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PageField label="Tax code" fieldKey="tax_id" dirty={!same(form.tax_id, item.tax_id)} hint={!form.tax_id && form.taxable ? <span className="text-bz-red">Taxable with no code — bills at 13 %. Pick a code or None.</span> : undefined}>
                {ro ? (
                  <ReadFace soft={!form.tax_id}>{taxName(form.tax_id) ?? "None"}</ReadFace>
                ) : (
                  <Select
                    trigger="ghost"
                    className={FIELD_SELECT}
                    label={taxName(form.tax_id) ?? <span className="text-bz-text-soft">None</span>}
                    value={form.tax_id ?? ""}
                    onChange={(v) => setForm((f) => ({ ...f, tax_id: v || null, taxable: !!v }))}
                    options={taxOpts}
                    width={260}
                  />
                )}
              </PageField>
              {needs.map((n) => accountF(n.kind, n.label, n.refuse))}
            </div>
          </Section>
        )}

        <Section title="Essentials" summary={[form.code, TYPE_LABEL[item.type]].filter(Boolean).join(" · ")}>
          <div data-jump-sec="essentials" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PageField label="Name" fieldKey="name" required dirty={!same(form.name, item.name)} error={errors.name} className="sm:col-span-2">
              {ro ? <ReadFace>{form.name}</ReadFace> : <input value={form.name} onChange={(e) => set("name", e.target.value)} aria-label="Name" className={cn(INPUT, errors.name && "border-bz-red-mark")} />}
            </PageField>
            <PageField label="Code / SKU" fieldKey="code" dirty={!same(form.code, item.code)} error={errors.code} hint={variant ? "Set by the template" : undefined}>
              {ro || variant ? (
                <ReadFace soft={!form.code}>{form.code || "—"}</ReadFace>
              ) : (
                <input value={form.code ?? ""} onChange={(e) => set("code", e.target.value || null)} aria-label="Code / SKU" className={cn(INPUT, NUM, errors.code && "border-bz-red-mark")} />
              )}
            </PageField>
            <PageField label="Category" fieldKey="category_id" dirty={!same(form.category_id, item.category_id)}>
              {ro ? (
                <ReadFace soft={!form.category_id}>{CATEGORIES.find((c) => c.id === form.category_id)?.name ?? "Uncategorised"}</ReadFace>
              ) : (
                <Select
                  trigger="ghost"
                  className={FIELD_SELECT}
                  label={CATEGORIES.find((c) => c.id === form.category_id)?.name ?? <span className="text-bz-text-soft">Uncategorised</span>}
                  value={form.category_id ?? ""}
                  onChange={(v) => set("category_id", v || null)}
                  options={[{ value: "", label: "Uncategorised" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.name }))]}
                  width={240}
                />
              )}
            </PageField>
            <PageField label="Type">{locked ? <Lock>{TYPE_LABEL[item.type]}</Lock> : <ReadFace>{TYPE_LABEL[item.type]} <span className="ml-2">{pageLink("Change on the item page", "essentials")}</span></ReadFace>}</PageField>
            <PageField label="Base unit">{locked ? <Lock>{baseUnit}</Lock> : <ReadFace>{baseUnit}</ReadFace>}</PageField>
            {isStock(item) && <PageField label="Costing">{locked ? <Lock reason={LOCKED_BY_MOVEMENT}>{item.costing}</Lock> : <ReadFace>{item.costing}</ReadFace>}</PageField>}
          </div>
          <p className="m-0 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-bz-text-muted">
            <span>
              Units &amp; conversions · {1 + item.conversions.length} {pageLink("page", "units")}
            </span>
            <span>
              Barcodes · {item.barcodes.length} {pageLink("page", "barcodes")}
            </span>
          </p>
        </Section>
      </div>
    </MasterSheet>
  );
}

function ReadFace({ children, soft }: { children: React.ReactNode; soft?: boolean }) {
  return <div className={cn("flex min-h-9 items-center text-[12.5px]", soft ? "text-bz-text-soft" : "text-bz-text", NUM)}>{children}</div>;
}
