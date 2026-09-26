import * as React from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowUpRight, ChevronDown, ChevronRight, History as HistoryIcon, MoreHorizontal, Plus, Printer, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, Chip, Dialog, GHOST, GHOST_SM, ICON_BTN, INPUT, LABEL, NUM, PLAIN_BTN, Popover, Segmented, Select, Switch, TEXTAREA } from "../../sales/bzw";
import type { SelectOption } from "../../sales/bzw";
import { AmountInput, FilesSection } from "../../sales/parts";
import type { PanelCtx } from "../../sales/DocDesk";
import { VENDORS } from "../../purchase/receipts";
import { CopyText, Facts, Failed, Grid, LINK, Lock, PageField, RecordPage, RecordSection, RelatedBlock, SaveDock, Source, goToField, useStagedRows, useUnsavedGuard } from "../kit";
import type { Fact, GridColumn, PageSection, RowState, SectionMark, StagedChange } from "../kit";
import { BRANDS, CATEGORIES, ITEM_CUSTOM_FIELDS, LEDGERS, PRICE_LEVELS, WH_TAXES, categoryName, newRowId, valueById } from "../seed/items";
import { MASTER_SUBSIDIARIES } from "../seed/currencies";
import type { Barcode, Conversion, Costing, Item, ItemType, LedgerKind, SubType } from "../seed/items";
import { ActionsMenu, ItemImage, PrimaryAction, SkeletonLines, useSummary, HistoryLines } from "./ItemPeek";
import { actionsFor, useItemActions } from "./actions";
import { VariantsSection, variantRowsOf } from "./VariantsSection";
import type { VarRow } from "./VariantsSection";
import { AxesDialog } from "./AxesDialog";
import {
  FIELD_LABEL,
  ME,
  OPEN_LABEL,
  SUB_LABEL,
  TYPE_LABEL,
  accountsMissing,
  availableOf,
  childrenOf,
  codeTakenBy,
  effImage,
  effLedger,
  effRate,
  hasUnits,
  isStock,
  isTemplate,
  isVariant,
  latency,
  ledgerName,
  ledgersFor,
  locationName,
  missingBarcodes,
  money,
  negText,
  nowIso,
  openCounts,
  openLinesOf,
  orgName,
  patchItem,
  preferenceLedger,
  qty,
  restoreItem,
  sameCode,
  shortDate,
  signed,
  stockIn,
  taxName,
  taxOptions,
  templateOf,
  typeText,
  unitName,
  unitsFor,
  useBaseCode,
  useItems,
  valuesLong,
  valuesText,
  worstLocation,
} from "./model";

// ════════════════════════════════════════════════════════════════════════════
// THE RECORD PAGE (spec §3.3) — the same item at full width, every section.
//
//   • Every field is staged; ONE dock commits them as a PATCH (B-I3) with the
//     conversions, barcodes and variant rates in the same transaction. Save
//     is never disabled: it refuses, names the field, marks the rail and
//     scrolls there. After Save the page stays; an Undo when only scalar
//     fields changed.
//   • Image, files, variant generation, archive / restore are immediate and
//     say so ("Saved as you add") — they never wait for the dock.
//   • Type, base unit, costing and serial / batch lock after the first stock
//     movement (D-8) — a read face, a 🔒 and the reason, never a disabled
//     control. Values the record did not type show where they come from.
//   • Sections that don't apply to the type are absent, not greyed.
// ════════════════════════════════════════════════════════════════════════════

/** The scalar columns the page stages (FIELD_LABEL names each). */
const PAGE_KEYS = (Object.keys(FIELD_LABEL) as (keyof Item)[]).filter((k) => !["archived", "conversions", "barcodes"].includes(k));
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Which section a field (or a staged collection) lives in — a refusal marks that rail entry. */
const SECTION_OF: Record<string, string> = {
  name: "essentials",
  code: "essentials",
  unit_id: "units",
  conversions: "units",
  sales_rate: "prices",
  purchase_rate: "prices",
  barcodes: "barcodes",
  orgs: "subsidiaries",
};
const sectionOf = (k: string) => (k.startsWith("custom.") ? "custom" : SECTION_OF[k] ?? "essentials");

/** A field select that reads like an input (the Select atom, re-sized to the field register). */
const FIELD_SELECT = "h-9 w-full justify-between rounded-bz-md border-bz-line bg-bz-paper px-3 text-[12.5px] font-normal hover:border-bz-text-soft";
const COSTINGS: Costing[] = ["FIFO", "LIFO", "Average", "Standard"];

function ReadFace({ children, soft }: { children: React.ReactNode; soft?: boolean }) {
  return <div className={cn("flex min-h-9 items-center text-[12.5px]", soft ? "text-bz-text-soft" : "text-bz-text")}>{children}</div>;
}

/** An advanced group inside a section ("More details"): folds, remembered per user in the app (view.masters-item-page). */
function Fold({ label, open, onToggle, count, children }: { label: string; open: boolean; onToggle: () => void; count?: number; children: React.ReactNode }) {
  return (
    <div className="mt-4 border-t border-bz-line-soft pt-3">
      <button type="button" aria-expanded={open} onClick={onToggle} className="-ml-1 inline-flex items-center gap-1.5 rounded-bz-sm px-1 py-0.5 text-[12px] font-semibold text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire">
        {open ? <ChevronDown size={13} className="text-bz-text-soft" /> : <ChevronRight size={13} className="text-bz-text-soft" />}
        {label}
        {!open && count !== undefined && <span className="font-normal text-bz-text-soft">{count ? `${count} set` : "none set"}</span>}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function ItemPage({ item, ctx, org, viewOnly, conflict, isNew }: { item: Item; ctx: PanelCtx; org: string; viewOnly: boolean; conflict: boolean; isNew: boolean }) {
  const all = useItems();
  const navigate = useNavigate();
  const location = useLocation();
  const { run } = useItemActions();
  const code = useBaseCode(org);
  const summary = useSummary(item.id);
  const ro = viewOnly;
  const host = React.useRef<HTMLDivElement>(null);

  const tpl = isTemplate(item);
  const variant = isVariant(item);
  const parent = templateOf(all, item);
  const locked = item.has_movements;

  const [form, setForm] = React.useState<Item>(item);
  const conv = useStagedRows<Conversion>(item.conversions);
  const bars = useStagedRows<Barcode>(item.barcodes);
  const vars = useStagedRows<VarRow>(tpl ? variantRowsOf(all, item) : []);
  const [tried, setTried] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [refusal, setRefusal] = React.useState<{ text: string; conflict?: boolean } | null>(null);
  const [conflictArmed, setConflictArmed] = React.useState(conflict);
  const [rereading, setRereading] = React.useState(false);
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [axesOpen, setAxesOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const [folds, setFolds] = React.useState<Record<string, boolean>>({});
  const [hist, setHist] = React.useState<{ kind: "all" | "changes" | "notes"; field?: string }>({ kind: "all" });
  const [stockOrg, setStockOrg] = React.useState(org);
  const fold = (k: string) => setFolds((f) => ({ ...f, [k]: !f[k] }));

  const set = <K extends keyof Item>(k: K, v: Item[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setRefusal(null);
  };
  const changed = PAGE_KEYS.filter((k) => !same(form[k], item[k]));
  const dirtyK = (k: keyof Item) => !same(form[k], item[k]);
  const dirty = changed.length > 0 || conv.dirty || bars.dirty || vars.dirty;

  // The stored record changed (a save, an Undo, the peek, a reload): every field this page has not
  // touched takes the stored value; what the reader staged stays staged.
  const prevItem = React.useRef(item);
  React.useEffect(() => {
    const prev = prevItem.current;
    prevItem.current = item;
    if (prev === item) return;
    setForm((f) => {
      const next = { ...item } as Item;
      (Object.keys(f) as (keyof Item)[]).forEach((k) => {
        if (!same(f[k], prev[k])) (next as Record<string, unknown>)[k] = f[k];
      });
      return next;
    });
    if (!conv.dirty) conv.load(item.conversions);
    if (!bars.dirty) bars.load(item.barcodes);
    if (tpl && !vars.dirty) vars.load(variantRowsOf(all, item));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  // The browser tab reads the record's name (spec §7).
  React.useEffect(() => {
    const t = window.setTimeout(() => (document.title = `${item.name} · Bizak`), 0);
    return () => window.clearTimeout(t);
  }, [item.name]);

  const scrollToSection = (id: string) => {
    const root = host.current?.querySelector<HTMLElement>("[data-record-scroller]");
    const el = root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!root || !el) return;
    root.scrollTo({ top: el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 64, behavior: "smooth" });
  };
  // `#prices` — the page opens at the section the peek (or a link) names.
  React.useEffect(() => {
    const id = location.hash.replace("#", "");
    if (!id) return;
    const t = window.setTimeout(() => scrollToSection(id), 60);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const kept = (k: string) => {
    const p = new URLSearchParams();
    const o = new URLSearchParams(location.search).get("org");
    if (o) p.set("org", o);
    ["viewonly", "conflict", "slow", "sumfail"].forEach((f) => new URLSearchParams(location.search).get(f) && p.set(f, "1"));
    const qs = p.toString();
    return `/design/masters/items/${k}${qs ? `?${qs}` : ""}`;
  };
  const toPeek = () => navigate(kept(item.id));
  const toPage = (id: string, hash?: string) => navigate(`${kept(`${id}/page`)}${hash ? `#${hash}` : ""}`);

  // ── Validation (after the first Save attempt, or live where the server checks live) ──
  const taken = !sameCode(form.code, item.code) ? codeTakenBy(all, form.code, item.id) : null;
  const existingDup = !taken && form.code && sameCode(form.code, item.code) ? codeTakenBy(all, form.code, item.id) : null;
  const nameTwin = form.name.trim() ? all.find((x) => x.id !== item.id && x.name.trim().toLowerCase() === form.name.trim().toLowerCase()) : null;
  const convRows = conv.rows.filter((r) => !conv.changes.removed.includes(r.id));
  const barRows = bars.rows.filter((r) => !bars.changes.removed.includes(r.id));
  const otherBarcodes = all.filter((x) => x.id !== item.id).flatMap((x) => x.barcodes.map((b) => ({ code: (b.barcode ?? "").trim().toLowerCase(), by: x.name })));
  const barErr = (r: Barcode): string | null => {
    const c = (r.barcode ?? "").trim().toLowerCase();
    if (!c) return "Enter a barcode.";
    const other = otherBarcodes.find((o) => o.code === c);
    if (other) return `This barcode is already used by ${other.by}.`;
    if (barRows.filter((x) => (x.barcode ?? "").trim().toLowerCase() === c).length > 1) return "This barcode is listed twice.";
    return null;
  };
  const convErr = (r: Conversion): string | null => {
    if (!r.unit_id) return "Choose a unit.";
    if (!(r.rate !== null && r.rate > 0)) return "Enter a number above 0.";
    if (r.unit_id === form.unit_id) return "That is the base unit.";
    if (convRows.filter((x) => x.unit_id === r.unit_id).length > 1) return `${unitName(r.unit_id)} is already listed.`;
    return null;
  };
  const removedOrgs = item.orgs.filter((o) => !form.orgs.includes(o));
  const orgRefusal = removedOrgs.map((o) => (stockIn(item, o).some((r) => r.on_hand !== 0) || item.usage > 0 ? o : null)).find(Boolean);

  const errors: Record<string, string> = {};
  if (tried && !form.name.trim()) errors.name = "A name is required.";
  if (form.name.length > 200) errors.name = "Keep the name under 200 characters.";
  if (taken) errors.code = `Code already used by ${taken.name}.`;
  if (tried && hasUnits(form) && !form.unit_id) errors.unit_id = "Choose a base unit.";
  if (form.sales_rate < 0) errors.sales_rate = "A price is 0 or more.";
  if (form.purchase_rate < 0) errors.purchase_rate = "A price is 0 or more.";
  if (tried) {
    ITEM_CUSTOM_FIELDS.filter((f) => f.required && !form.custom[f.key]?.trim()).forEach((f) => (errors[`custom.${f.key}`] = `Fill ${f.label}.`));
    if (convRows.some((r) => convErr(r))) errors.conversions = convErr(convRows.find((r) => convErr(r))!)!;
    if (barRows.some((r) => barErr(r))) errors.barcodes = barErr(barRows.find((r) => barErr(r))!)!;
    if (orgRefusal) errors.orgs = `${orgName(orgRefusal)} has stock or documents with this item, so it can't be removed.`;
  }
  const errSections = new Set(Object.keys(errors).map(sectionOf));

  // ── The dock's change list ──
  const goField = (k: string) => host.current && goToField(k, host.current);
  const changes: StagedChange[] = [
    ...changed.filter((k) => k !== "custom").map((k) => ({ key: String(k), label: FIELD_LABEL[k] ?? String(k), onGo: () => goField(String(k)) })),
    ...(dirtyK("custom") ? ITEM_CUSTOM_FIELDS.filter((f) => (form.custom[f.key] ?? "") !== (item.custom[f.key] ?? "")).map((f) => ({ key: `custom.${f.key}`, label: f.label, onGo: () => goField(`custom.${f.key}`) })) : []),
    ...(conv.dirty ? [{ key: "conversions", label: `${conv.count} conversion${conv.count === 1 ? "" : "s"}`, onGo: () => goField("conversions") }] : []),
    ...(bars.dirty ? [{ key: "barcodes", label: `${bars.count} barcode${bars.count === 1 ? "" : "s"}`, onGo: () => goField("barcodes") }] : []),
    ...(vars.dirty ? [{ key: "variants", label: `${vars.count} variant price${vars.count === 1 ? "" : "s"}`, onGo: () => scrollToSection("variants") }] : []),
  ];

  const discard = () => {
    setForm(item);
    conv.reset();
    bars.reset();
    vars.reset();
    setTried(false);
    setRefusal(null);
  };

  const save = (): boolean => {
    setTried(true);
    // Recompute with `tried` on — the state update has not landed in this closure yet.
    const e: [string, string][] = [];
    if (!form.name.trim()) e.push(["name", "A name is required."]);
    if (form.name.length > 200) e.push(["name", "Keep the name under 200 characters."]);
    if (taken) e.push(["code", `Code already used by ${taken.name}.`]);
    if (hasUnits(form) && !form.unit_id) e.push(["unit_id", "Choose a base unit."]);
    if (form.sales_rate < 0) e.push(["sales_rate", "A price is 0 or more."]);
    const bad = convRows.find((r) => convErr(r));
    if (bad) e.push(["conversions", convErr(bad)!]);
    const badB = barRows.find((r) => barErr(r));
    if (badB) e.push(["barcodes", barErr(badB)!]);
    if (orgRefusal) e.push(["orgs", `${orgName(orgRefusal)} has stock or documents with this item, so it can't be removed.`]);
    ITEM_CUSTOM_FIELDS.filter((f) => f.required && !form.custom[f.key]?.trim()).forEach((f) => e.push([`custom.${f.key}`, `Fill ${f.label}.`]));
    if (e.length) {
      setRefusal({ text: e[0][1] });
      window.setTimeout(() => goField(e[0][0]), 30);
      return false;
    }
    if (conflictArmed) {
      // `?conflict=1`: the PATCH carries expected_modified_date; someone saved first → 409, naming who.
      setConflictArmed(false);
      setRefusal({ text: "Sneha Maharjan saved this item at 14:02.", conflict: true });
      return false;
    }
    setBusy(true);
    const scalarOnly = !conv.dirty && !bars.dirty && !vars.dirty;
    const fields: Partial<Item> = {};
    changed.forEach((k) => ((fields as Record<string, unknown>)[k] = form[k]));
    if (conv.dirty) fields.conversions = convRows;
    // Blank barcode price = the item's price: stored as null, never 0 (a 0 scans at 0).
    if (bars.dirty) fields.barcodes = barRows.map((b) => ({ ...b, barcode: (b.barcode ?? "").trim(), price: b.price === 0 ? null : b.price }));
    const varEdits = [...vars.changes.edited];
    window.setTimeout(() => {
      const before = patchItem(item.id, fields);
      varEdits.forEach((v) => patchItem(v.id, { sales_rate: v.sell ?? 0, purchase_rate: v.buy ?? 0 }));
      conv.accept();
      bars.accept();
      vars.accept();
      setBusy(false);
      setTried(false);
      setRefusal(null);
      setRereading(true);
      window.setTimeout(() => setRereading(false), 600);
      ctx.show("success", "Item saved", scalarOnly && before ? { label: "Undo", run: () => restoreItem(before) } : undefined, scalarOnly ? 8000 : undefined);
    }, 650);
    return true;
  };

  /** The 409's Reload: their values for the fields you did not touch; yours stay staged. */
  const reload = () => {
    const theirs: Partial<Item> = !changed.includes("description") ? { description: `${item.description ?? ""}${item.description ? " " : ""}Sold by the box of 12.`.trim() } : { hs_code: "6109.10" };
    patchItem(item.id, theirs, "Sneha Maharjan");
    setForm((f) => ({ ...f, ...theirs }));
    setRefusal(null);
    ctx.show("info", "Reloaded · your changes are still staged");
  };

  const guard = useUnsavedGuard({ dirty: dirty && !ro, labels: changes.map((c) => c.label), onSave: save, onDiscard: discard });

  // ── Lookups for this record ──
  const unitOpts = (exclude?: string | null): SelectOption[] => unitsFor(form.orgs).filter((u) => u.id !== exclude).map((u) => ({ value: u.id, label: u.name, hint: u.code }));
  const baseName = unitName(form.unit_id) ?? "base unit";
  const sideUnits: SelectOption[] = [form.unit_id, ...convRows.map((c) => c.unit_id)].filter((u): u is string => !!u).map((u) => ({ value: u, label: unitName(u) ?? u }));
  const actions = actionsFor(all, item, org, !ro);
  const needs = ledgersFor(form.type, form.sub_type);
  const stockish = isStock(form) && !tpl;
  const kids = tpl ? childrenOf(all, item.id).filter((c) => !c.archived) : [];
  const sell = effRate(all, { ...item, sales_rate: form.sales_rate }, "sales_rate");
  const avail = availableOf(all, item, org);
  const open = openCounts(item);
  const worst = worstLocation(item, org);
  const margin = item.unit_cost && form.sales_rate ? Math.round(((form.sales_rate - item.unit_cost) / form.sales_rate) * 100) : null;
  const showBarcodes = hasUnits(form);
  const showCustom = ITEM_CUSTOM_FIELDS.length > 0;
  const canMatrix = isStock(form) && !variant && !tpl && !locked;

  // ── Rail ──
  const mark = (id: string, fallback?: SectionMark): SectionMark | undefined => (errSections.has(id) ? { kind: "error" } : fallback);
  const sections: PageSection[] = [
    { id: "essentials", label: "Essentials", mark: mark("essentials", locked || tpl ? { kind: "lock" } : undefined) },
    ...(hasUnits(form) ? [{ id: "units", label: "Units", mark: mark("units", form.unit_id ? { kind: "count", n: 1 + convRows.length } : { kind: "empty" }) }] : []),
    { id: "prices", label: "Prices", mark: mark("prices", form.sales_rate || form.purchase_rate || variant ? undefined : { kind: "empty" }) },
    ...(form.type !== "item_group" && form.type !== "kit"
      ? [{ id: "tax", label: "Tax & accounts", mark: mark("tax", accountsMissing(all, { ...item, ...form }) ? { kind: "setup" } : undefined) }]
      : []),
    ...(stockish ? [{ id: "stock", label: "Stock", mark: mark("stock", locked ? { kind: "lock" } : form.reorder === null ? { kind: "empty" } : undefined) }] : []),
    ...(stockish
      ? [{ id: "tracking", label: "Tracking", mark: mark("tracking", form.serial || form.batch ? { kind: "count", n: Number(form.serial) + Number(form.batch) } : locked ? { kind: "lock" } : { kind: "empty" }) }]
      : []),
    ...(tpl || canMatrix ? [{ id: "variants", label: "Variants", mark: tpl ? ({ kind: "count", n: kids.length } as SectionMark) : ({ kind: "empty" } as SectionMark) }] : []),
    ...(showBarcodes
      ? [{ id: "barcodes", label: "Barcodes", mark: mark("barcodes", tpl ? { kind: "count", n: kids.filter((k) => k.barcodes.length).length } : barRows.length ? { kind: "count", n: barRows.length } : { kind: "empty" }) }]
      : []),
    { id: "subsidiaries", label: "Subsidiaries", mark: mark("subsidiaries", { kind: "count", n: form.orgs.length }) },
    ...(showCustom ? [{ id: "custom", label: "Custom fields", mark: mark("custom", Object.values(form.custom).some(Boolean) ? undefined : { kind: "empty" }) }] : []),
    { id: "files", label: "Files", mark: item.files.length ? { kind: "count", n: item.files.length } : { kind: "empty" } },
    { id: "history", label: "History" },
  ];

  // ── Facts (≤ 6, each a door) ──
  const facts: Fact[] = (() => {
    if (tpl) {
      const rates = kids.map((k) => effRate(all, k, "sales_rate").value).filter((n) => n > 0);
      const lo = Math.min(...rates, item.sales_rate);
      const hi = Math.max(...rates, item.sales_rate);
      const mb = missingBarcodes(all, item);
      return [
        { key: "variants", label: "Variants", value: kids.length, onOpen: () => scrollToSection("variants") },
        { key: "avail", label: "Available", value: negText(avail ?? 0), sub: (avail ?? 0) < 0 ? "neg" : undefined, danger: (avail ?? 0) < 0, title: "Family total, on hand less committed", onOpen: () => scrollToSection("variants") },
        { key: "sell", label: "Sell", value: lo === hi ? money(hi) : `${money(lo)}–${money(hi)}`, onOpen: () => scrollToSection("variants") },
        { key: "bc", label: "Missing barcodes", value: mb, danger: mb > 0, onOpen: () => scrollToSection("variants") },
      ];
    }
    if (stockish) {
      const fresh = !item.has_movements && allZero(item);
      return [
        fresh
          ? { key: "avail", label: "Available", value: "—", sub: "Add opening stock", title: "Opens an inventory adjustment for this item", onOpen: () => run("adjust", item) }
          : {
              key: "avail",
              label: "Available",
              value: avail === null ? "—" : negText(avail),
              sub: avail !== null && avail < 0 ? "neg" : undefined,
              danger: avail !== null && avail < 0,
              title: worst ? `More went out than came in at ${worst.name}.` : "On hand less committed, all locations",
              onOpen: () => scrollToSection("stock"),
            },
        { key: "order", label: "On order", value: open.onOrder ? qty(open.onOrder) : "—", title: "Open purchase order lines", onOpen: () => scrollToSection("stock") },
        { key: "cost", label: "Unit cost", value: item.unit_cost ? money(item.unit_cost) : "—", title: "Inventory valuation", onOpen: () => ctx.show("info", "Inventory valuation opens (report)") },
        { key: "sell", label: "Sell", value: sell.value ? money(sell.value) : "—", onOpen: () => scrollToSection("prices") },
        { key: "margin", label: "Margin", value: margin === null ? "—" : `${margin}%`, title: "Sell price less unit cost, as a share of the sell price", onOpen: () => scrollToSection("prices") },
        { key: "reorder", label: "Reorder at", value: item.reorder === null ? "—" : qty(item.reorder), danger: item.reorder !== null && avail !== null && avail < item.reorder, onOpen: () => goField("reorder") },
      ];
    }
    return [
      { key: "sell", label: "Sell", value: sell.value ? money(sell.value) : "—", onOpen: () => scrollToSection("prices") },
      { key: "buy", label: "Buy", value: item.purchase_rate ? money(item.purchase_rate) : "—", onOpen: () => scrollToSection("prices") },
      ...(item.sold_30d ? [{ key: "sold", label: "Sold 30 days", value: qty(item.sold_30d.qty), sub: money(item.sold_30d.amount) }] : []),
      { key: "open", label: "Open orders", value: open.deliver + open.invoice || "—", onOpen: () => scrollToSection("history") },
    ];
  })();

  // ── Field helpers (called, never mounted as components — an input must keep its focus) ──
  const textF = (k: "name" | "code" | "short_cut" | "hs_code" | "weight" | "manufacturer" | "mpn" | "country" | "sales_description" | "purchase_description" | "warranty" | "storage", label: string, o: { required?: boolean; hint?: React.ReactNode; className?: string; placeholder?: string } = {}) => (
    <PageField label={label} fieldKey={k} required={o.required} dirty={dirtyK(k)} error={errors[k]} hint={o.hint} className={o.className}>
      {ro ? (
        <ReadFace soft={!form[k]}>{(form[k] as string | null) || "—"}</ReadFace>
      ) : (
        <input
          value={(form[k] as string | null) ?? ""}
          placeholder={o.placeholder}
          aria-invalid={!!errors[k] || undefined}
          onChange={(e) => set(k, (k === "name" ? e.target.value : e.target.value || null) as Item[typeof k])}
          className={cn(INPUT, errors[k] && "border-bz-red-mark focus:border-bz-red-mark")}
        />
      )}
    </PageField>
  );
  const numF = (k: "reorder" | "safety" | "min_order" | "max_order" | "lead_days" | "min_sale_qty" | "max_sale_qty" | "shelf_life", label: string, o: { hint?: React.ReactNode; suffix?: string } = {}) => (
    <PageField label={label} fieldKey={k} dirty={dirtyK(k)} error={errors[k]} hint={o.hint}>
      {ro ? (
        <ReadFace soft={form[k] === null}>{form[k] === null ? "—" : `${qty(form[k] as number)}${o.suffix ? ` ${o.suffix}` : ""}`}</ReadFace>
      ) : (
        <span className="relative block">
          <input
            inputMode="decimal"
            value={form[k] === null ? "" : String(form[k])}
            onChange={(e) => {
              const t = e.target.value.replace(/[^\d.]/g, "");
              set(k, (t === "" ? null : Number(t)) as Item[typeof k]);
            }}
            className={cn(INPUT, "text-right", o.suffix && "pr-14", NUM)}
          />
          {o.suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-bz-text-soft">{o.suffix}</span>}
        </span>
      )}
    </PageField>
  );
  const selectF = (k: keyof Item, label: string, options: SelectOption[], o: { placeholder?: React.ReactNode; hint?: React.ReactNode; aside?: React.ReactNode; required?: boolean; footer?: React.ReactNode; faceSoft?: boolean } = {}) => {
    const v = form[k] as string | null;
    const shown = options.find((x) => x.value === (v ?? ""))?.label;
    return (
      <PageField label={label} fieldKey={String(k)} required={o.required} dirty={dirtyK(k)} error={errors[String(k)]} hint={o.hint} aside={o.aside}>
        {ro ? (
          <ReadFace soft={!shown || o.faceSoft}>{shown ?? o.placeholder ?? "—"}</ReadFace>
        ) : (
          <Select
            trigger="ghost"
            className={cn(FIELD_SELECT, errors[String(k)] && "border-bz-red-mark")}
            label={shown ? <span className={o.faceSoft ? "text-bz-text-soft" : undefined}>{shown}</span> : <span className="text-bz-text-soft">{o.placeholder ?? "Choose…"}</span>}
            value={v ?? ""}
            onChange={(nv) => set(k, (nv === "" ? null : nv) as Item[typeof k])}
            options={options}
            width={280}
            footer={o.footer}
          />
        )}
      </PageField>
    );
  };
  const switchF = (k: "subscription" | "discount_allowed" | "grant_commission" | "non_posting" | "has_warranty" | "cold_chain" | "controlled" | "apply_to_child", label: string, hint?: string) => (
    <div data-field={k} className="flex min-h-9 items-center gap-2.5">
      {ro ? <span className="text-[12.5px] text-bz-text">{form[k] ? "Yes" : "No"}</span> : <Switch on={!!form[k]} onChange={(v) => set(k, v)} label={label} />}
      <span className="text-[12px] text-bz-text">
        {label}
        {hint && <span className="block text-[10.5px] text-bz-text-soft">{hint}</span>}
      </span>
      {dirtyK(k) && <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-amber" title="Changed — not saved yet" />}
    </div>
  );
  const moneyF = (k: "sales_rate" | "purchase_rate", label: string, o: { aside?: React.ReactNode; hint?: React.ReactNode } = {}) => (
    <PageField label={label} fieldKey={k} dirty={dirtyK(k)} error={errors[k]} hint={o.hint} aside={o.aside}>
      {ro ? (
        <ReadFace>{form[k] ? `${code ? `${code} ` : ""}${money(form[k])}` : "—"}</ReadFace>
      ) : (
        <span className="relative block">
          <AmountInput ariaLabel={label} value={form[k]} onChange={(n) => set(k, n)} invalid={!!errors[k]} className={cn("h-9 text-[12.5px]", code && "pl-12")} />
          {code && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">{code}</span>}
        </span>
      )}
    </PageField>
  );

  // ── Accounts ──
  const ledgerOpts = (kind: LedgerKind): SelectOption[] =>
    LEDGERS.filter((l) => l.kind === kind || (kind === "expense" && l.kind === "cogs")).map((l) => ({ value: l.id, label: l.name, hint: l.id === preferenceLedger(kind) ? "Preference default" : undefined }));
  const accountF = (kind: LedgerKind, label: string, refuse: string) => {
    const k = `${kind}_id` as "income_id" | "expense_id" | "asset_id" | "cogs_id";
    const own = form[k];
    const eff = effLedger(all, { ...item, [k]: own }, kind);
    const inherited = !own && eff.source === "template";
    const missing = !eff.value;
    return (
      <PageField
        key={kind}
        label={label}
        fieldKey={k}
        dirty={dirtyK(k)}
        aside={inherited ? <Source kind="inherited" from="from template" /> : own && variant && parent?.[k] ? <Source kind="override" resetLabel="Reset to the template's account" onReset={() => set(k, null)} /> : undefined}
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
            options={ledgerOpts(kind)}
            width={280}
          />
        )}
      </PageField>
    );
  };
  const keptAccounts = (["income", "expense", "asset", "cogs"] as LedgerKind[]).filter((kind) => !needs.some((n) => n.kind === kind) && form[`${kind}_id` as "income_id"]);

  // ── Grids ──
  const convCols: GridColumn<Conversion>[] = [
    { key: "unit_id", label: "Unit", width: "minmax(0,1fr)", kind: "select", options: () => unitOpts(form.unit_id), placeholder: "Choose…", menuWidth: 240 },
    { key: "rate", label: `= N ${baseName}`, width: "112px", kind: "number", format: (v) => qty(v as number) },
    {
      key: "example",
      label: "Example",
      width: "minmax(0,1.2fr)",
      kind: "readonly",
      render: (r) => (r.unit_id && r.rate ? <span className="text-bz-text-muted">3 {unitName(r.unit_id)} = {qty(Math.round(3 * r.rate * 10_000) / 10_000)} {baseName}</span> : ""),
    },
  ];
  const barCols: GridColumn<Barcode>[] = [
    { key: "barcode", label: "Barcode", width: "minmax(0,1.4fr)", placeholder: "Scan or type" },
    { key: "unit_id", label: "Unit", width: "minmax(0,0.8fr)", kind: "select", options: () => sideUnits, menuWidth: 200 },
    { key: "price", label: "Price", width: "112px", kind: "number", placeholder: "Item price", format: (v) => money(v as number), title: (r) => (r.price === null ? "Blank — scans at the item's price" : undefined) },
    { key: "discount", label: "Discount", width: "92px", kind: "number", placeholder: "—", format: (v) => money(v as number) },
  ];
  const barState = (r: Barcode): RowState => ({ ...bars.rowState(r), error: tried ? barErr(r) : null });
  const convState = (r: Conversion): RowState => ({ ...conv.rowState(r), error: tried ? convErr(r) : null });

  const customHas = Object.values(form.custom).filter(Boolean).length;
  const history = item.history.filter((h) => (hist.kind === "all" ? true : hist.kind === "notes" ? h.kind === "note" : h.kind === "change")).filter((h) => !hist.field || h.field === hist.field);

  // ── Related column ──
  const stockRows = stockIn(item, stockOrg);
  const related: React.ReactNode[] = [];
  if (stockish)
    related.push(
      <RelatedBlock
        key="stock"
        title="Stock by location"
        right={
          item.orgs.length > 1 ? (
            <Select trigger="ghost" className="h-7" value={stockOrg} onChange={setStockOrg} label={`In ${orgName(stockOrg)}`} options={item.orgs.map((o) => ({ value: o, label: orgName(o) }))} width={200} align="right" />
          ) : undefined
        }
      >
        {summary.loading ? (
          <SkeletonLines />
        ) : summary.failed ? (
          <Failed compact text="Couldn't load stock." onRetry={summary.retry} />
        ) : stockRows.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No stock in {orgName(stockOrg)} yet.</p>
        ) : (
          <div className={cn("grid grid-cols-[minmax(0,1fr)_60px_76px] gap-x-2 gap-y-1.5 text-[11.5px]", NUM)}>
            <span className={LABEL}>Location</span>
            <span className={cn(LABEL, "whitespace-nowrap text-right")}>On hand</span>
            <span className={cn(LABEL, "whitespace-nowrap text-right")}>Available</span>
            {stockRows.map((r) => (
              <React.Fragment key={r.location_id}>
                <span className="truncate text-bz-text" title={`${r.name}${r.committed ? ` · ${qty(r.committed)} committed` : ""}`}>
                  {r.name}
                </span>
                <span className={cn("text-right", r.on_hand < 0 ? "text-bz-red" : "text-bz-text")}>{negText(r.on_hand)}</span>
                <span className={cn("text-right", r.available < 0 ? "font-semibold text-bz-red" : "text-bz-text")}>
                  {negText(r.available)}
                  {r.available < 0 && " neg"}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </RelatedBlock>,
    );
  if (tpl) related.push(<FamilyStock key="family" template={item} all={all} org={org} loading={summary.loading} failed={summary.failed} onRetry={summary.retry} />);
  related.push(
    <RelatedBlock key="open" title="Open documents">
      {summary.loading ? (
        <SkeletonLines n={2} />
      ) : summary.failed ? (
        <Failed compact text="Couldn't load open documents." onRetry={summary.retry} />
      ) : (
        <>
          <p className={cn("m-0 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-bz-text-muted", NUM)}>
            {(["deliver", "invoice", "receive", "transfer"] as const).map((k) => (
              <span key={k}>
                {OPEN_LABEL[k]} <span className="font-semibold text-bz-text">{open[k]}</span>
              </span>
            ))}
          </p>
          {openLinesOf(item).length > 0 && (
            <div className="mt-2 flex flex-col">
              {openLinesOf(item)
                .slice(0, 5)
                .map((l, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => (l.href ? navigate(l.href) : ctx.show("info", `${l.doc} opens`))}
                    className={cn("-mx-1 grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-2 rounded-bz-sm px-1 py-1 text-left text-[11.5px] hover:bg-bz-paper-warm", NUM)}
                  >
                    <span className="font-medium text-bz-text">{l.doc}</span>
                    <span className="truncate text-bz-text-muted">
                      {OPEN_LABEL[l.kind]} · {l.party}
                    </span>
                    <span className="text-bz-text">{qty(l.qty)}</span>
                  </button>
                ))}
            </div>
          )}
        </>
      )}
    </RelatedBlock>,
  );
  if (stockish)
    related.push(
      <RelatedBlock
        key="moves"
        title="Recent movements"
        right={
          <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => run("movements", item)}>
            All <ArrowUpRight size={11} />
          </button>
        }
      >
        {summary.loading ? (
          <SkeletonLines n={2} />
        ) : item.movements.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">None yet.</p>
        ) : (
          <div className={cn("grid grid-cols-[40px_minmax(0,1fr)_36px] gap-x-2 gap-y-1 text-[11.5px]", NUM)}>
            {item.movements.slice(0, 5).map((m) => (
              <React.Fragment key={m.doc}>
                <span className="text-bz-text-soft">{shortDate(m.date)}</span>
                <span className="truncate text-bz-text" title={`${m.kind} · ${locationName(m.location_id)} · bal ${negText(m.balance)}`}>
                  {m.doc} <span className="text-bz-text-muted">{m.kind}</span>
                </span>
                <span className="text-right text-bz-text">{signed(m.qty)}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </RelatedBlock>,
    );
  related.push(
    <RelatedBlock
      key="changes"
      title="Last changes"
      right={
        <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => (setHist({ kind: "all" }), scrollToSection("history"))}>
          All
        </button>
      }
    >
      <HistoryLines entries={item.history.slice(0, 3)} />
    </RelatedBlock>,
  );

  // ── Head ──
  const headActions = (
    <>
      {!item.archived && <PrimaryAction item={item} actions={actions} />}
      <button ref={menuRef} type="button" className={ICON_BTN} onClick={() => setMenuOpen(true)} title="More actions (.)" aria-label="More actions">
        <MoreHorizontal size={15} />
      </button>
    </>
  );
  const siblings = variant && parent ? childrenOf(all, parent.id).filter((c) => !c.archived) : [];
  const band =
    item.archived || (variant && parent) ? (
      <div className="flex flex-col gap-2">
        {item.archived && (
          <span className="flex flex-wrap items-center gap-3">
            Archived — hidden from pickers.
            {!ro && (
              <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => run("restore", item)}>
                Restore
              </button>
            )}
          </span>
        )}
        {variant && parent && (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span>
              Variant of{" "}
              <button type="button" className="font-semibold underline decoration-bz-line underline-offset-2 hover:decoration-bz-text-soft" onClick={() => toPage(parent.id, "variants")}>
                {parent.name}
              </button>
              <span className="text-bz-text-muted"> · {valuesLong(all, item)}</span>
            </span>
            <span className="flex flex-wrap gap-1">
              {siblings.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-current={s.id === item.id ? "page" : undefined}
                  onClick={() => s.id !== item.id && toPage(s.id, location.hash.replace("#", ""))}
                  className={cn(
                    "inline-flex h-6 items-center rounded-bz-sm border px-1.5 text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-bz-fire",
                    s.id === item.id ? "border-bz-text-muted bg-bz-fire/10 font-semibold text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:text-bz-text",
                  )}
                >
                  {valuesText(all, s)}
                </button>
              ))}
            </span>
          </span>
        )}
      </div>
    ) : undefined;

  return (
    <div ref={host} className="h-full">
      <RecordPage
        back={{ label: "Items", onClick: toPeek }}
        image={<ItemImage state={effImage(all, item)} />}
        title={item.name}
        meta={[
          item.code ? <CopyText key="c" text={item.code} onCopied={() => ctx.show("success", "Copied")} /> : <span key="c" className="text-bz-text-soft">No code</span>,
          typeText(item),
          tpl ? `${kids.length} variants` : null,
          unitName(item.unit_id),
          categoryName(item.category_id),
        ]}
        chips={
          <>
            {variant && <Chip tone="neutral" dot={false}>Variant</Chip>}
            {item.archived && <Chip tone="neutral" dot={false}>Archived</Chip>}
            {ro && <Chip tone="neutral" dot={false}>View only</Chip>}
            {accountsMissing(all, item) && (
              <button type="button" onClick={() => scrollToSection("tax")} className="rounded-bz-sm focus-visible:outline-2 focus-visible:outline-bz-fire" title="Open Tax & accounts">
                <Chip tone="danger">Needs accounts</Chip>
              </button>
            )}
            {(existingDup || taken) && (
              <button type="button" onClick={() => goField("code")} className="rounded-bz-sm focus-visible:outline-2 focus-visible:outline-bz-fire" title="Another item holds this code">
                <Chip tone="danger">Duplicate code</Chip>
              </button>
            )}
          </>
        }
        actions={headActions}
        walk={{
          position: ctx.position ?? undefined,
          onPrev: () => {
            const n = ctx.neighbour(-1);
            if (n) toPage(n);
          },
          onNext: () => {
            const n = ctx.neighbour(1);
            if (n) toPage(n);
          },
        }}
        band={band}
        facts={
          summary.failed ? (
            <span className="flex min-h-8 items-center gap-2 text-[11.5px] text-bz-text-muted">
              Couldn't load stock.
              <button type="button" className={cn(GHOST_SM, "h-6 px-2 text-[11px]")} onClick={summary.retry}>
                Retry
              </button>
            </span>
          ) : (
            <Facts facts={facts} loading={summary.loading} className={cn("transition-opacity duration-150", rereading && "opacity-55")} />
          )
        }
        sections={sections}
        related={related}
        railNote={isNew ? <><span className="font-semibold text-bz-text">Finish setting up.</span> Sections marked — are still empty.</> : undefined}
        keys={{
          c: () => item.code && (navigator.clipboard?.writeText(item.code).catch(() => {}), ctx.show("success", "Copied")),
          ".": () => setMenuOpen(true),
          escape: (e) => {
            if (document.querySelector("[data-bzw-dialog], [data-bzw-popover]")) return;
            e.preventDefault();
            toPeek();
          },
        }}
        dock={
          ro ? undefined : (
            <SaveDock
              changes={changes}
              busy={busy}
              onSave={save}
              onDiscard={discard}
              onSaveAndBack={() => save() && toPeek()}
              refusal={refusal?.text}
              refusalAction={refusal?.conflict ? { label: "Reload", onClick: reload } : undefined}
              onDismissRefusal={() => setRefusal(null)}
            />
          )
        }
      >
        {/* ── 1 · Essentials ─────────────────────────────────────────────── */}
        <RecordSection id="essentials" title="Essentials">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 sm:col-span-2">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-paper-warm text-bz-text-soft">
                <ItemImage state={effImage(all, item)} size={18} />
              </span>
              <div className="min-w-0 text-[11.5px] text-bz-text-muted">
                {variant ? (
                  <span>The template's picture.</span>
                ) : effImage(all, item) === "missing" ? (
                  <span className="text-bz-red">Image file is missing.</span>
                ) : effImage(all, item) === "set" ? (
                  <span>Picture set.</span>
                ) : (
                  <span>No picture yet.</span>
                )}
                {!variant && !ro && (
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={cn(GHOST_SM, "h-7")}
                      onClick={async () => {
                        await latency(300);
                        const prev = item.image;
                        patchItem(item.id, { image: "set" });
                        ctx.show("success", "Image saved", { label: "Undo", run: () => patchItem(item.id, { image: prev }) }, 8000);
                      }}
                    >
                      {item.image ? "Change image" : "Add image"}
                    </button>
                    <span className="text-bz-text-soft">Saved as you add</span>
                  </span>
                )}
              </div>
            </div>
            {textF("name", "Name", { required: true, className: "sm:col-span-2", hint: !errors.name && nameTwin ? "Another item has this name." : undefined })}
            {variant ? (
              <PageField label="Code / SKU" fieldKey="code" hint="Set by the template">
                <ReadFace soft>{item.code ?? "—"}</ReadFace>
              </PageField>
            ) : (
              textF("code", "Code / SKU", {
                placeholder: "Optional, like MUG-BLU",
                hint: errors.code ? undefined : existingDup ? (
                  <span className="text-bz-amber-ink">Also held by {existingDup.name}. It saves as it is; a new code must be unique.</span>
                ) : form.code && !sameCode(form.code, item.code) ? (
                  <span className="text-bz-pos-deep">✓ Unique</span>
                ) : undefined,
              })
            )}
            <PageField label="Type">
              {locked || tpl || variant ? (
                <Lock reason={locked ? undefined : tpl ? "Locked · the template has variants." : "Set by the template."}>
                  {TYPE_LABEL[form.type]}
                  {tpl ? " · template" : ""}
                </Lock>
              ) : (
                <div className="flex min-h-9 items-center gap-2.5 text-[12.5px] text-bz-text">
                  {TYPE_LABEL[form.type]}
                  {dirtyK("type") && <span className="size-1.5 rounded-bz-pill bg-bz-amber" />}
                  {!ro && (
                    <button type="button" className={cn(LINK, "text-[12px]")} onClick={() => setTypeOpen(true)}>
                      Change type…
                    </button>
                  )}
                </div>
              )}
            </PageField>
            {!isStock(form) && form.type !== "item_group" && form.type !== "kit" && (
              <PageField label="Used for" fieldKey="sub_type" dirty={dirtyK("sub_type")}>
                {ro ? (
                  <ReadFace>{SUB_LABEL[form.sub_type ?? "resale"]}</ReadFace>
                ) : (
                  <Segmented
                    size="sm"
                    value={form.sub_type ?? "resale"}
                    onChange={(v) => set("sub_type", v as SubType)}
                    options={[
                      { value: "resale", label: "Selling & buying" },
                      { value: "sale", label: "Selling" },
                      { value: "purchase", label: "Buying" },
                    ]}
                  />
                )}
              </PageField>
            )}
            {form.type === "service" && switchF("subscription", "Subscription revenue item", "Offered in subscription plans")}
            {selectF("category_id", "Category", [{ value: "", label: "Uncategorised" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.name }))], {
              placeholder: "Uncategorised",
              footer: (
                <button type="button" className="flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12.5px] text-bz-text hover:bg-bz-paper-warm" onClick={() => ctx.show("info", "Categories open in Masters (legacy page)")}>
                  <Plus size={12} /> New category…
                </button>
              ),
            })}
            {selectF("brand_id", "Brand", [{ value: "", label: "None" }, ...BRANDS.map((b) => ({ value: b.id, label: b.name }))], { placeholder: "None" })}
            <PageField label="Description" fieldKey="description" dirty={dirtyK("description")} className="sm:col-span-2">
              {ro ? (
                <ReadFace soft={!form.description}>{form.description || "—"}</ReadFace>
              ) : (
                <textarea value={form.description ?? ""} rows={2} onChange={(e) => set("description", e.target.value || null)} className={cn(TEXTAREA, "min-h-[60px]")} />
              )}
            </PageField>
            {textF("hs_code", "HS code")}
          </div>
          <Fold label="More details" open={!!folds.more} onToggle={() => fold("more")} count={[form.short_cut, form.sales_description, form.purchase_description, form.weight, form.manufacturer, form.mpn, form.country].filter(Boolean).length}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {textF("short_cut", "Short name")}
              {textF("weight", "Weight", { placeholder: "2.5 kg" })}
              {textF("sales_description", "Sales description", { className: "sm:col-span-2" })}
              {textF("purchase_description", "Purchase description", { className: "sm:col-span-2" })}
              {textF("manufacturer", "Manufacturer")}
              {textF("mpn", "MPN")}
              {textF("country", "Country of manufacture")}
            </div>
          </Fold>
        </RecordSection>

        {/* ── 2 · Units & conversions ────────────────────────────────────── */}
        {hasUnits(form) && (
          <RecordSection id="units" title="Units & conversions">
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {locked || variant ? (
                <PageField label="Base unit" required>
                  <Lock reason={locked ? undefined : "Set by the template."}>{unitName(form.unit_id)}</Lock>
                </PageField>
              ) : (
                selectF("unit_id", "Base unit", unitOpts(), { required: true, placeholder: "Choose a base unit" })
              )}
            </div>
            <div data-field="conversions">
              <Grid<Conversion>
                ariaLabel="Unit conversions"
                mode={ro ? "readonly" : "staged"}
                columns={convCols}
                rows={conv.rows}
                rowState={convState}
                onCell={conv.setCell}
                onRemove={conv.remove}
                ghost={
                  ro
                    ? undefined
                    : {
                        blank: () => ({ id: "ghost", unit_id: null, rate: null }),
                        label: "Add a unit",
                        onAdd: (r) => {
                          if (!r.unit_id) return "Choose a unit.";
                          if (!(r.rate !== null && r.rate > 0)) return "Enter a number above 0.";
                          if (r.unit_id === form.unit_id) return "That is the base unit.";
                          if (convRows.some((x) => x.unit_id === r.unit_id)) return `${unitName(r.unit_id)} is already listed.`;
                          conv.add({ ...r, id: newRowId("cv") });
                          return null;
                        },
                      }
                }
                empty="No conversions yet."
                stickyTop={56}
                minWidth={480}
              />
              {errors.conversions && <p className="m-0 mt-1.5 text-[11px] text-bz-red">{errors.conversions}</p>}
              <p className="m-0 mt-2 text-[11px] text-bz-text-soft">A document in a unit with no conversion moves stock 1:1.</p>
            </div>
            {convRows.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-bz-line-soft pt-3 sm:grid-cols-2">
                {selectF("purchase_unit_id", "Purchase unit", sideUnits, { placeholder: baseName })}
                {selectF("sales_unit_id", "Sales unit", sideUnits, { placeholder: baseName })}
                {selectF("stock_unit_id", "Stock unit", sideUnits, { placeholder: baseName })}
                {selectF("consumption_unit_id", "Consumption unit", sideUnits, { placeholder: baseName })}
              </div>
            )}
          </RecordSection>
        )}

        {/* ── 3 · Prices ─────────────────────────────────────────────────── */}
        <RecordSection id="prices" title="Prices">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {moneyF("sales_rate", "Sell price", {
              aside: (
                <button type="button" className={cn(PLAIN_BTN, "text-bz-text-soft")} title="Sell price history" aria-label="Sell price history" onClick={() => (setHist({ kind: "changes", field: "Sell price" }), scrollToSection("history"))}>
                  <HistoryIcon size={11} />
                </button>
              ),
              hint: variant && parent && form.sales_rate === parent.sales_rate ? <Source kind="inherited" from={`Same as the template · ${money(parent.sales_rate)}`} /> : form.sales_rate > 0 && form.purchase_rate > form.sales_rate ? <span className="text-bz-amber-ink">Below purchase price.</span> : undefined,
            })}
            {moneyF("purchase_rate", "Purchase price")}
          </div>
          {margin !== null && item.unit_cost !== null && (
            <p className={cn("m-0 mt-3 text-[12px] text-bz-text-muted", NUM)}>
              Margin <span className="font-semibold text-bz-text">{margin}%</span> at unit cost {money(item.unit_cost)}
            </p>
          )}
          <div className="mt-3 rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
            <p className={cn("m-0 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-bz-text-muted", NUM)}>
              <span className="text-bz-text-soft">At price levels</span>
              {PRICE_LEVELS.map((l) => (
                <span key={l.id}>
                  {l.name} {l.discount}% <span className="font-medium text-bz-text">{form.sales_rate ? money((form.sales_rate * (100 - l.discount)) / 100) : "—"}</span>
                </span>
              ))}
            </p>
            <p className="m-0 mt-1 text-[11px] text-bz-text-soft">
              Price levels are percentages set in{" "}
              <button type="button" className={LINK} onClick={() => ctx.show("info", "Price levels open in Masters (legacy page)")}>
                Masters ▸ Price levels
              </button>
              .
            </p>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">{switchF("discount_allowed", "Discount allowed")}</div>
            {form.discount_allowed && (
              <>
                <PageField label="Default discount %" fieldKey="discount_pct" dirty={dirtyK("discount_pct")}>
                  <input
                    inputMode="decimal"
                    disabled={ro}
                    value={form.discount_pct ? String(form.discount_pct) : ""}
                    onChange={(e) => {
                      const p = Number(e.target.value.replace(/[^\d.]/g, "")) || 0;
                      setForm((f) => ({ ...f, discount_pct: p, discount_amt: Math.round(((f.sales_rate * p) / 100) * 100) / 100 }));
                    }}
                    className={cn(INPUT, "text-right", NUM)}
                  />
                </PageField>
                <PageField label="Default discount" fieldKey="discount_amt" dirty={dirtyK("discount_amt")} hint="Either one — the other follows the sell price.">
                  <AmountInput
                    ariaLabel="Default discount"
                    value={form.discount_amt}
                    onChange={(n) => setForm((f) => ({ ...f, discount_amt: n, discount_pct: f.sales_rate ? Math.round((n / f.sales_rate) * 10_000) / 100 : 0 }))}
                    className="h-9 text-[12.5px]"
                  />
                </PageField>
              </>
            )}
          </div>
          <Fold label="More" open={!!folds.prices} onToggle={() => fold("prices")} count={[form.min_sale_qty, form.max_sale_qty].filter((x) => x !== null).length}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {numF("min_sale_qty", "Min sale qty")}
              {numF("max_sale_qty", "Max sale qty")}
              <div className="sm:col-span-2">{switchF("grant_commission", "Grant commission")}</div>
            </div>
          </Fold>
          <div className="mt-4 flex flex-col gap-1.5 border-t border-bz-line-soft pt-3 text-[12px] text-bz-text-muted">
            {barRows.filter((b) => b.price !== null && b.price > 0).length > 0 && (
              <span>
                {barRows.filter((b) => b.price !== null && b.price > 0).length} barcode{barRows.filter((b) => b.price !== null && b.price > 0).length === 1 ? " carries its" : "s carry their"} own price —{" "}
                <button type="button" className={LINK} onClick={() => scrollToSection("barcodes")}>
                  see Barcodes
                </button>
              </span>
            )}
            <span>
              POS price list: {item.pos_prices ? `${item.pos_prices} price${item.pos_prices === 1 ? "" : "s"}` : "none"} ·{" "}
              <button type="button" className={cn(LINK, "inline-flex items-center gap-0.5")} onClick={() => ctx.show("info", "Item prices open (legacy page) — read by POS only")}>
                Open price list <ArrowUpRight size={11} />
              </button>
            </span>
          </div>
        </RecordSection>

        {/* ── 4 · Tax & accounts ─────────────────────────────────────────── */}
        {form.type !== "item_group" && form.type !== "kit" && (
          <RecordSection id="tax" title="Tax & accounts">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PageField
                label="Tax code"
                fieldKey="tax_id"
                dirty={dirtyK("tax_id")}
                hint={!form.tax_id && form.taxable ? <span className="text-bz-red">Taxable with no code — bills at 13 %. Pick a code or None.</span> : undefined}
              >
                {ro ? (
                  <ReadFace soft={!form.tax_id}>{taxName(form.tax_id) ?? "None"}</ReadFace>
                ) : (
                  <Select
                    trigger="ghost"
                    className={FIELD_SELECT}
                    label={taxName(form.tax_id) ?? <span className="text-bz-text-soft">None</span>}
                    value={form.tax_id ?? ""}
                    onChange={(v) => setForm((f) => ({ ...f, tax_id: v || null, taxable: !!v }))}
                    options={[{ value: "", label: "None" }, ...taxOptions().map((t) => ({ value: t.id, label: t.name, meta: `${t.rate}%` }))]}
                    width={280}
                  />
                )}
              </PageField>
            </div>
            {needs.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-bz-line-soft pt-3 sm:grid-cols-2">
                <p className={cn(LABEL, "m-0 sm:col-span-2")}>Posts to</p>
                {needs.map((n) => accountF(n.kind, n.label, n.refuse))}
              </div>
            )}
            {keptAccounts.length > 0 && (
              <p className="m-0 mt-3 text-[11.5px] text-bz-text-soft">
                Kept, not used by this type: {keptAccounts.map((k) => `${k === "cogs" ? "COGS" : k[0].toUpperCase() + k.slice(1)} · ${ledgerName(form[`${k}_id` as "income_id"])}`).join(" · ")}
              </p>
            )}
            {item.other_ledgers.length > 0 && (
              <div className="mt-3 text-[12px]">
                {item.other_ledgers.map((l) => (
                  <p key={l.label} className="m-0 flex gap-3 text-bz-text-muted">
                    <span className="w-[120px] shrink-0">{l.label}</span>
                    <span className="text-bz-text">{ledgerName(l.ledger_id)}</span>
                  </p>
                ))}
              </div>
            )}
            <Fold label="More" open={!!folds.tax} onToggle={() => fold("tax")} count={[form.wh_tax, form.non_posting || null].filter(Boolean).length}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectF("wh_tax", "Withholding tax", [{ value: "", label: "None" }, ...WH_TAXES.map((w) => ({ value: w.id, label: w.name }))], { placeholder: "None" })}
                <div className="flex items-end">{switchF("non_posting", "Non-posting")}</div>
              </div>
            </Fold>
          </RecordSection>
        )}

        {/* ── 5 · Stock & reordering ─────────────────────────────────────── */}
        {stockish && (
          <RecordSection id="stock" title="Stock & reordering">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {locked ? (
                <PageField label="Costing method">
                  <Lock>{form.costing ?? "FIFO"}</Lock>
                </PageField>
              ) : (
                selectF("costing", "Costing method", COSTINGS.map((c) => ({ value: c, label: c })))
              )}
              {numF("reorder", "Reorder point", { hint: "For all locations", suffix: unitName(form.unit_id) ?? undefined })}
              {numF("safety", "Safety stock", { suffix: unitName(form.unit_id) ?? undefined })}
              {numF("lead_days", "Lead time", { suffix: "days" })}
              {numF("min_order", "Min order qty")}
              {numF("max_order", "Max order qty")}
              {selectF("vendor_id", "Preferred vendor", [{ value: "", label: "None" }, ...VENDORS.map((v) => ({ value: v.id, label: v.name, hint: v.code }))], { placeholder: "None" })}
            </div>
          </RecordSection>
        )}

        {/* ── 6 · Tracking ───────────────────────────────────────────────── */}
        {stockish && (
          <RecordSection id="tracking" title="Tracking">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {locked ? (
                <>
                  <PageField label="Serial numbers">
                    <Lock>{form.serial ? "On" : "Off"}</Lock>
                  </PageField>
                  <PageField label="Batches">
                    <Lock>{form.batch ? "On" : "Off"}</Lock>
                  </PageField>
                </>
              ) : (
                <>
                  <div data-field="serial" className="flex min-h-9 items-center gap-2.5">
                    {ro ? <span className="text-[12.5px]">{form.serial ? "On" : "Off"}</span> : <Switch on={form.serial} onChange={(v) => set("serial", v)} label="Serial numbers" />}
                    <span className="text-[12px] text-bz-text">Serial numbers</span>
                  </div>
                  <div data-field="batch" className="flex min-h-9 items-center gap-2.5">
                    {ro ? <span className="text-[12.5px]">{form.batch ? "On" : "Off"}</span> : <Switch on={form.batch} onChange={(v) => set("batch", v)} label="Batches" />}
                    <span className="text-[12px] text-bz-text">Batches</span>
                  </div>
                </>
              )}
              {numF("shelf_life", "Shelf life", { suffix: "days" })}
              <PageField label="End of life" fieldKey="end_of_life" dirty={dirtyK("end_of_life")}>
                {ro ? (
                  <ReadFace soft={!form.end_of_life}>{form.end_of_life ? shortDate(form.end_of_life) : "—"}</ReadFace>
                ) : (
                  <input type="date" value={form.end_of_life ?? ""} onChange={(e) => set("end_of_life", e.target.value || null)} className={cn(INPUT, NUM)} />
                )}
              </PageField>
              {switchF("has_warranty", "Warranty")}
              {form.has_warranty && textF("warranty", "Warranty period", { placeholder: "1 year" })}
            </div>
            <Fold label="Storage & handling" open={!!folds.storage} onToggle={() => fold("storage")} count={[form.storage, form.cold_chain || null, form.controlled || null].filter(Boolean).length}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {textF("storage", "Storage condition", { className: "sm:col-span-2", placeholder: "Cool, dry place" })}
                {switchF("cold_chain", "Cold chain")}
                {switchF("controlled", "Controlled")}
              </div>
            </Fold>
          </RecordSection>
        )}

        {/* ── 7 · Variants ───────────────────────────────────────────────── */}
        {tpl && (
          <RecordSection id="variants" title="Variants">
            <VariantsSection template={item} all={all} staged={vars} ro={ro} org={org} currency={code} onOpenVariant={(id) => toPage(id)} show={ctx.show} />
          </RecordSection>
        )}
        {canMatrix && (
          <RecordSection id="variants" title="Variants">
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-bz-text-muted">
              Not a matrix item.
              {!ro && (
                <button type="button" className={GHOST_SM} onClick={() => setAxesOpen(true)}>
                  Make this a matrix item
                </button>
              )}
            </div>
            <AxesDialog
              template={item}
              open={axesOpen}
              onClose={() => setAxesOpen(false)}
              onDone={(r) => (setAxesOpen(false), ctx.show("success", `${r.created.length} variants created`))}
            />
          </RecordSection>
        )}

        {/* ── 8 · Barcodes ───────────────────────────────────────────────── */}
        {showBarcodes && (
          <RecordSection
            id="barcodes"
            title="Barcodes"
            right={
              !tpl && barRows.length > 0 ? (
                <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => run("labels", item)}>
                  <Printer size={12} /> Print labels
                </button>
              ) : undefined
            }
          >
            {tpl ? (
              <>
                <Grid<Item>
                  ariaLabel="Variant barcodes"
                  mode="readonly"
                  rows={kids}
                  columns={[
                    { key: "values", label: "Variant", width: "minmax(0,0.8fr)", kind: "readonly", render: (r) => valuesText(all, r) },
                    { key: "barcode", label: "Barcode", width: "minmax(0,1.4fr)", kind: "readonly", render: (r) => r.barcodes[0]?.barcode ?? <span className="text-bz-text-soft">None</span> },
                    { key: "unit", label: "Unit", width: "minmax(0,0.6fr)", kind: "readonly", render: (r) => unitName(r.barcodes[0]?.unit_id ?? r.unit_id) },
                  ]}
                  onOpenRow={(r) => toPage(r.id, "barcodes")}
                  minWidth={420}
                />
                <p className="m-0 mt-2 text-[11px] text-bz-text-soft">A template's barcode can't be scanned — each variant carries its own.</p>
              </>
            ) : (
              <div data-field="barcodes">
                <Grid<Barcode>
                  ariaLabel="Barcodes"
                  mode={ro ? "readonly" : "staged"}
                  columns={barCols}
                  rows={bars.rows}
                  rowState={barState}
                  onCell={bars.setCell}
                  onRemove={bars.remove}
                  ghost={
                    ro
                      ? undefined
                      : {
                          blank: () => ({ id: "ghost", barcode: null, unit_id: form.sales_unit_id ?? form.unit_id, price: null, discount: null }),
                          label: "Add a barcode",
                          onAdd: (r) => {
                            const err = barErr({ ...r, id: "__new" });
                            if (err) return err;
                            bars.add({ ...r, id: newRowId("bc"), barcode: (r.barcode ?? "").trim() });
                            return null;
                          },
                        }
                  }
                  empty="No barcodes."
                  stickyTop={56}
                  minWidth={520}
                  foot={
                    ro ? undefined : (
                      <button
                        type="button"
                        className={cn(LINK, "text-[11.5px]")}
                        onClick={() => {
                          if (!form.code) return ctx.show("info", "Give the item a code first");
                          if (barRows.some((b) => sameCode(b.barcode, form.code))) return ctx.show("info", "The code is already a barcode");
                          bars.add({ id: newRowId("bc"), barcode: form.code, unit_id: form.unit_id, price: null, discount: null });
                        }}
                      >
                        Add from code
                      </button>
                    )
                  }
                />
                {errors.barcodes && <p className="m-0 mt-1.5 text-[11px] text-bz-red">{errors.barcodes}</p>}
                <p className="m-0 mt-2 text-[11px] text-bz-text-soft">A blank price scans at the item's price.</p>
              </div>
            )}
          </RecordSection>
        )}

        {/* ── 9 · Subsidiaries ───────────────────────────────────────────── */}
        <RecordSection id="subsidiaries" title="Subsidiaries">
          <div data-field="orgs" className="flex flex-wrap items-center gap-1.5">
            {form.orgs.map((o) => (
              <span key={o} className="inline-flex h-7 items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm pl-2 pr-1 text-[12px] font-medium text-bz-text">
                {orgName(o)}
                {!ro && !variant && form.orgs.length > 1 && (
                  <button type="button" className="flex size-5 items-center justify-center rounded-[4px] text-bz-text-soft hover:bg-bz-surface hover:text-bz-text" onClick={() => set("orgs", form.orgs.filter((x) => x !== o))} aria-label={`Remove ${orgName(o)}`}>
                    <X size={11} />
                  </button>
                )}
              </span>
            ))}
            {!ro && !variant && MASTER_SUBSIDIARIES.some((s) => !form.orgs.includes(s.id)) && (
              <Select
                trigger="ghost"
                className="h-7"
                icon={Plus as unknown as React.ComponentType<{ size?: number; className?: string }>}
                label="Add"
                value={null}
                onChange={(v) => set("orgs", [...form.orgs, v])}
                options={MASTER_SUBSIDIARIES.filter((s) => !form.orgs.includes(s.id)).map((s) => ({ value: s.id, label: s.name }))}
                width={220}
              />
            )}
            {dirtyK("orgs") && <span className="size-1.5 rounded-bz-pill bg-bz-amber" title="Changed — not saved yet" />}
          </div>
          {errors.orgs && <p className="m-0 mt-1.5 text-[11px] text-bz-red">{errors.orgs}</p>}
          <div className="mt-3">{variant ? <p className="m-0 text-[12px] text-bz-text-soft">Follows the template.</p> : switchF("apply_to_child", "Apply to child subsidiaries")}</div>
        </RecordSection>

        {/* ── 10 · Custom fields ─────────────────────────────────────────── */}
        {showCustom && (
          <RecordSection id="custom" title="Custom fields" right={<span className="text-[11px] text-bz-text-soft">{customHas ? `${customHas} set` : "None set"}</span>}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ITEM_CUSTOM_FIELDS.map((f) => {
                const v = form.custom[f.key] ?? "";
                const setV = (nv: string) => set("custom", { ...form.custom, [f.key]: nv });
                const err = errors[`custom.${f.key}`];
                return (
                  <PageField key={f.key} label={f.label} fieldKey={`custom.${f.key}`} required={f.required} dirty={(item.custom[f.key] ?? "") !== v} error={err}>
                    {ro ? (
                      <ReadFace soft={!v}>{v || "—"}</ReadFace>
                    ) : f.type === "select" ? (
                      <Select trigger="ghost" className={FIELD_SELECT} label={v || <span className="text-bz-text-soft">Choose…</span>} value={v || null} onChange={setV} options={(f.options ?? []).map((o) => ({ value: o, label: o }))} width={240} />
                    ) : (
                      <input value={v} onChange={(e) => setV(e.target.value)} className={cn(INPUT, err && "border-bz-red-mark")} />
                    )}
                  </PageField>
                );
              })}
            </div>
          </RecordSection>
        )}

        {/* ── 11 · Files (immediate) ─────────────────────────────────────── */}
        <RecordSection
          id="files"
          title="Files"
          right={
            !ro ? (
              <>
                <span className="hidden text-[11px] text-bz-text-soft sm:inline">Saved as you add</span>
                <button
                  type="button"
                  className={cn(GHOST_SM, "h-7")}
                  onClick={() => {
                    const name = item.files.some((f) => f.name === "spec-sheet.pdf") ? `spec-sheet-${item.files.length + 1}.pdf` : "spec-sheet.pdf";
                    patchItem(item.id, { files: [...item.files, { name, size: "240 KB", by: ME, on: shortDate(nowIso()) }] });
                    ctx.show("success", `${name} added`);
                  }}
                >
                  <Plus size={11} /> Add
                </button>
              </>
            ) : undefined
          }
        >
          <FilesSection
            bare
            files={item.files.map((f) => ({ name: f.name, size: f.size, byId: f.by, on: f.on }))}
            onAdd={() => {
              patchItem(item.id, { files: [...item.files, { name: "spec-sheet.pdf", size: "240 KB", by: ME, on: shortDate(nowIso()) }] });
              ctx.show("success", "spec-sheet.pdf added");
            }}
            onRemove={
              ro
                ? undefined
                : (name) => {
                    const prev = item.files;
                    patchItem(item.id, { files: item.files.filter((f) => f.name !== name) });
                    ctx.show("success", `${name} removed`, { label: "Undo", run: () => patchItem(item.id, { files: prev }) }, 8000);
                  }
            }
            onToast={(t) => ctx.show("info", t)}
          />
        </RecordSection>

        {/* ── 12 · History (B-I8) ────────────────────────────────────────── */}
        <RecordSection
          id="history"
          title="History"
          right={
            <Segmented
              size="sm"
              value={hist.kind}
              onChange={(v) => setHist({ kind: v })}
              options={[
                { value: "all", label: "All" },
                { value: "changes", label: "Changes" },
                { value: "notes", label: "Notes", count: item.history.filter((h) => h.kind === "note").length },
              ]}
            />
          }
        >
          {hist.field && (
            <p className="m-0 mb-2.5 flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
              Only
              <span className="inline-flex items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-surface py-0.5 pl-2 pr-1 font-medium text-bz-text">
                {hist.field}
                <button type="button" className="flex size-4 items-center justify-center rounded-[4px] text-bz-text-soft hover:bg-bz-paper-warm" onClick={() => setHist({ kind: "all" })} aria-label="Show every change">
                  <X size={10} />
                </button>
              </span>
            </p>
          )}
          <HistoryLines entries={history} empty={hist.field ? `No ${hist.field.toLowerCase()} changes yet.` : hist.kind === "notes" ? "No notes yet." : "Nothing yet."} />
          <p className={cn("m-0 mt-4 border-t border-bz-line-soft pt-3 text-[11.5px] text-bz-text-soft", NUM)}>
            Created by {item.created.by} · {shortDate(item.created.on)} · Last edited by {item.modified.by} · {shortDate(item.modified.on)}
          </p>
        </RecordSection>
      </RecordPage>

      <Popover open={menuOpen} anchor={menuRef.current} onClose={() => setMenuOpen(false)} align="right" width={220}>
        <ActionsMenu item={item} actions={actions} close={() => setMenuOpen(false)} />
      </Popover>
      <TypeDialog
        open={typeOpen}
        from={form.type}
        sub={form.sub_type}
        form={form}
        onClose={() => setTypeOpen(false)}
        onPick={(t) => {
          setTypeOpen(false);
          setForm((f) => ({ ...f, type: t, sub_type: t === "inventory" ? null : f.sub_type ?? "resale", costing: t === "inventory" ? f.costing ?? "FIFO" : null }));
        }}
      />
      {guard.dialog}
    </div>
  );
}

const allZero = (i: Item) => i.stock.every((s) => s.on_hand === 0);

/** A template's stock per variant — a size × colour table when there are two axes. */
function FamilyStock({ template, all, org, loading, failed, onRetry }: { template: Item; all: Item[]; org: string; loading: boolean; failed: boolean; onRetry: () => void }) {
  const axes = template.axes ?? [];
  const kids = childrenOf(all, template.id).filter((c) => !c.archived);
  const cell = (vals: Record<string, string>) => {
    const k = kids.find((c) => Object.entries(vals).every(([a, v]) => c.values?.[a] === v));
    return k ? availableOf(all, k, org) ?? 0 : null;
  };
  return (
    <RelatedBlock title="Stock by variant">
      {loading ? (
        <SkeletonLines />
      ) : failed ? (
        <Failed compact text="Couldn't load stock." onRetry={onRetry} />
      ) : axes.length === 2 ? (
        <div className={cn("grid gap-x-2 gap-y-1 text-[11.5px]", NUM)} style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${axes[1].value_ids.length}, minmax(0,1fr))` }}>
          <span />
          {axes[1].value_ids.map((v) => (
            <span key={v} className={cn(LABEL, "text-right")}>
              {valueLabel(axes[1].attribute_id, v)}
            </span>
          ))}
          {axes[0].value_ids.map((r) => (
            <React.Fragment key={r}>
              <span className="text-bz-text-muted">{valueLabel(axes[0].attribute_id, r)}</span>
              {axes[1].value_ids.map((c) => {
                const n = cell({ [axes[0].attribute_id]: r, [axes[1].attribute_id]: c });
                return (
                  <span key={c} className={cn("text-right", n === null ? "text-bz-text-soft" : n < 0 ? "font-semibold text-bz-red" : n === 0 ? "text-bz-text-soft" : "text-bz-text")}>
                    {n === null ? "·" : negText(n)}
                  </span>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className={cn("grid grid-cols-[minmax(0,1fr)_60px] gap-x-2 gap-y-1 text-[11.5px]", NUM)}>
          {kids.map((k) => {
            const n = availableOf(all, k, org) ?? 0;
            return (
              <React.Fragment key={k.id}>
                <span className="truncate text-bz-text-muted">{valuesText(all, k)}</span>
                <span className={cn("text-right", n < 0 ? "font-semibold text-bz-red" : "text-bz-text")}>
                  {negText(n)}
                  {n < 0 && " neg"}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </RelatedBlock>
  );
}

const valueLabel = (attr: string, id: string) => valueById(attr, id)?.value ?? id;

/** Change type… — the consequences before the click; accounts no longer used are kept, never nulled. */
function TypeDialog({ open, from, sub, form, onClose, onPick }: { open: boolean; from: ItemType; sub: SubType; form: Item; onClose: () => void; onPick: (t: ItemType) => void }) {
  const [to, setTo] = React.useState<ItemType>(from);
  React.useEffect(() => {
    if (open) setTo(from);
  }, [open, from]);
  const before = ledgersFor(from, sub).map((n) => n.kind);
  const after = ledgersFor(to, to === "inventory" ? null : sub ?? "resale").map((n) => n.kind);
  const adds = after.filter((k) => !before.includes(k));
  const drops = before.filter((k) => !after.includes(k) && form[`${k}_id` as "income_id"]);
  const name = (k: LedgerKind) => (k === "cogs" ? "COGS" : k[0].toUpperCase() + k.slice(1));
  const stockIn_ = to === "inventory" && from !== "inventory";
  const stockOut = from === "inventory" && to !== "inventory";
  const TYPES: ItemType[] = ["inventory", "service", "non_inventory", "discount", "item_group", "kit"];
  return (
    <Dialog
      open={open}
      title="Change type"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={() => onPick(to)} disabled={to === from}>
            Change to {TYPE_LABEL[to].toLowerCase()}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={to === t}
              onClick={() => setTo(t)}
              className={cn(
                "rounded-bz-md border px-3 py-2 text-left text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:outline-bz-fire",
                to === t ? "border-bz-text-muted bg-bz-fire/10 font-semibold text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text hover:bg-bz-paper-warm",
              )}
            >
              {TYPE_LABEL[t]}
              {t === from && <span className="ml-1.5 text-[11px] font-normal text-bz-text-soft">now</span>}
            </button>
          ))}
        </div>
        {to !== from && (
          <ul className="m-0 flex list-disc flex-col gap-1 pl-4 text-[12px] text-bz-text">
            {adds.length > 0 && <li>Accounts: adds {adds.map(name).join(" and ")}.</li>}
            {drops.length > 0 && <li>{drops.map(name).join(" and ")} kept on the item, not used by this type.</li>}
            {stockIn_ && <li>Stock sections appear.</li>}
            {stockOut && <li>Stock and tracking sections go away.</li>}
            <li className="text-bz-text-muted">Saved with the page's Save.</li>
          </ul>
        )}
      </div>
    </Dialog>
  );
}
