import * as React from "react";
import { useNavigate } from "react-router";
import {
  Archive,
  ArchiveRestore,
  ArrowLeftRight,
  ClipboardList,
  Copy,
  FileText,
  History,
  PackagePlus,
  Printer,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, DANGER_BTN, Dialog, GHOST, LABEL, NUM, NumberField, Segmented } from "../../sales/bzw";
import type { SelectOption, ToastMsg } from "../../sales/bzw";
import { CUSTOMERS } from "../../sales/orders";
import { ordersStore } from "../../sales/store";
import { AskFirst, VariantPicker } from "../kit";
import type { PickableVariant } from "../kit";
import { attributeById, itemsStore, valueById } from "../seed/items";
import type { Item } from "../seed/items";
import {
  baseCode,
  childrenOf,
  effRate,
  getItem,
  isStock,
  isTemplate,
  locationsOf,
  money,
  onHandOf,
  patchItem,
  purchasable,
  sellable,
  templateOf,
  unitName,
} from "./model";

// ════════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS (spec §3.6) — one list, drawn by the desk row, the peek and
// the page. A document action opens the document; the item never holds a
// typed quantity (no "adjust stock" field here). New order / invoice /
// estimate ask first (customer + quantity, both skippable); a template asks
// for its variant before that. Archive / restore / delete are immediate
// commits with their own dialog, never staged in the page's dock.
// ════════════════════════════════════════════════════════════════════════════

export type ActionKey = "order" | "invoice" | "estimate" | "po" | "receive" | "adjust" | "transfer" | "movements" | "labels" | "duplicate" | "archive" | "restore" | "delete";
type Icon = React.ComponentType<{ size?: number; className?: string }>;
export type ActionDef = { key: ActionKey; label: string; icon: Icon; danger?: boolean; title?: string };

const I = (c: unknown) => c as Icon;
export const ACTION: Record<ActionKey, ActionDef> = {
  order: { key: "order", label: "New sales order", icon: I(ShoppingCart) },
  invoice: { key: "invoice", label: "New invoice", icon: I(Receipt) },
  estimate: { key: "estimate", label: "New estimate", icon: I(FileText) },
  po: { key: "po", label: "New purchase order", icon: I(ShoppingBag) },
  receive: { key: "receive", label: "Receive stock", icon: I(PackagePlus) },
  adjust: { key: "adjust", label: "Adjust stock", icon: I(SlidersHorizontal) },
  transfer: { key: "transfer", label: "Transfer", icon: I(ArrowLeftRight) },
  movements: { key: "movements", label: "View movements", icon: I(History) },
  labels: { key: "labels", label: "Print labels", icon: I(Printer) },
  duplicate: { key: "duplicate", label: "Duplicate", icon: I(Copy) },
  archive: { key: "archive", label: "Archive", icon: I(Archive) },
  restore: { key: "restore", label: "Restore", icon: I(ArchiveRestore) },
  delete: { key: "delete", label: "Delete", icon: I(Trash2), danger: true },
};

/** Delete only when nothing uses it and no stock ever moved (✔ DeleteAsync rules); a template counts its family. */
export function canDelete(all: Item[], i: Item) {
  const family = isTemplate(i) ? [i, ...childrenOf(all, i.id)] : [i];
  return family.every((x) => x.usage === 0 && !x.has_movements);
}
const hasBarcodes = (all: Item[], i: Item) => (isTemplate(i) ? childrenOf(all, i.id).some((c) => c.barcodes.length > 0) : i.barcodes.length > 0);

/**
 * Every action the item offers, in order: the primary first. Hidden, never disabled — an action a type
 * can't use is absent (no Adjust stock on a service). `canUpdate` false (view only) drops archive/restore.
 */
export function actionsFor(all: Item[], i: Item, org: string, canUpdate = true): ActionDef[] {
  const out: ActionDef[] = [];
  const live = !i.archived;
  const stock = isStock(i) && !isTemplate(i);
  const tpl = isTemplate(i);
  if (live && sellable(i)) out.push(ACTION.order, ACTION.invoice, ACTION.estimate);
  if (live && purchasable(i) && i.type !== "discount") out.push(ACTION.po);
  if (live && stock) out.push(ACTION.receive, ACTION.adjust);
  if (live && stock && locationsOf(org).length >= 2) out.push(ACTION.transfer);
  if (stock || (tpl && isStock(i))) out.push(ACTION.movements);
  if (hasBarcodes(all, i)) out.push(ACTION.labels);
  out.push(ACTION.duplicate);
  if (canUpdate) out.push(i.archived ? ACTION.restore : ACTION.archive);
  if (canUpdate && canDelete(all, i)) out.push(ACTION.delete);
  return out;
}

/** A template's live variants as the variant picker lists them — shared by the quick actions and the composer (spec §5.2). */
export function pickableVariants(all: Item[], tpl: Item, org: string): PickableVariant[] {
  return childrenOf(all, tpl.id)
    .filter((c) => !c.archived)
    .map((c) => ({
      id: c.id,
      values: (tpl.axes ?? []).map((a) => {
        const v = valueById(a.attribute_id, c.values?.[a.attribute_id] ?? "");
        return { value: v?.value ?? "—", abbr: v?.abbr ?? "" };
      }),
      code: c.code,
      barcode: c.barcodes[0]?.barcode ?? null,
      name: c.name,
      stock: onHandOf(all, c, org) ?? 0,
      rate: effRate(all, c, "sales_rate").value,
    }));
}

// ── The request a surface raises, and the layer that answers it ─────────────

type Req = { key: ActionKey; id: string; anchor: HTMLElement | null; variantId?: string | null; picking?: boolean };
type Ctx = { run: (key: ActionKey, item: Item, anchor?: HTMLElement | null) => void; req: Req | null; set: (r: Req | null) => void; labelsFor: Item[] | null; setLabels: (items: Item[] | null) => void };
const ActionsCtx = React.createContext<Ctx | null>(null);

export function ItemActionsProvider({ children }: { children: React.ReactNode }) {
  const [req, set] = React.useState<Req | null>(null);
  const [labelsFor, setLabels] = React.useState<Item[] | null>(null);
  const run = React.useCallback((key: ActionKey, item: Item, anchor?: HTMLElement | null) => {
    if (key === "labels") return setLabels([item]);
    set({ key, id: item.id, anchor: anchor ?? null, picking: isTemplate(item) && (key === "order" || key === "invoice" || key === "estimate") });
  }, []);
  const value = React.useMemo(() => ({ run, req, set, labelsFor, setLabels }), [run, req, labelsFor]);
  return <ActionsCtx.Provider value={value}>{children}</ActionsCtx.Provider>;
}
export function useItemActions() {
  const c = React.useContext(ActionsCtx);
  if (!c) throw new Error("useItemActions outside ItemActionsProvider");
  return c;
}

const DOC_PATH: Partial<Record<ActionKey, string>> = { order: "orders", invoice: "invoices", estimate: "estimates" };
const LEGACY: Partial<Record<ActionKey, string>> = {
  po: "New purchase order",
  receive: "Receive stock",
  adjust: "Inventory adjustment",
  transfer: "Transfer order",
  movements: "Inventory movement detail",
};

type Show = (kind: ToastMsg["kind"], text: string, action?: ToastMsg["action"], duration?: number) => void;

/** Rendered inside the frame (DocDesk `renderExtra`), so the popover, dialogs and toasts are themed. */
export function ItemActionsLayer({ show, org, onAfterDelete }: { show: Show; org: string; onAfterDelete: (id: string) => void }) {
  const { req, set, labelsFor, setLabels } = useItemActions();
  const navigate = useNavigate();
  const all = itemsStore.get();
  const item = req ? getItem(req.id) : null;
  const close = () => set(null);

  React.useEffect(() => {
    if (!req || !item) return;
    const legacy = LEGACY[req.key];
    if (legacy) {
      set(null);
      // These are the app's legacy pages (spec §3.6) — the mockup has none of them to open.
      show("info", `${legacy} opens with ${item.name} (legacy page)`);
    } else if (req.key === "duplicate") {
      set(null);
      navigate(`/design/masters/items/new?copy=${item.id}${org ? `&org=${org}` : ""}`);
    } else if (req.key === "restore") {
      set(null);
      const family = [item, ...childrenOf(all, item.id)];
      family.forEach((x) => patchItem(x.id, { archived: false }));
      show("success", "Restored", { label: "Undo", run: () => family.forEach((x) => patchItem(x.id, { archived: true })) }, 8000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req]);

  if (!req && !labelsFor) return null;

  // ── New order / invoice / estimate ──
  const docKey = req && DOC_PATH[req.key] ? req.key : null;
  const tpl = item && isTemplate(item) ? item : item ? templateOf(all, item) : null;
  const chosen = req?.variantId ? getItem(req.variantId) : null;
  const target = chosen ?? (item && !isTemplate(item) ? item : null);
  const units = target ?? item;
  const unitOpts: SelectOption[] = units
    ? [units.unit_id, ...units.conversions.map((c) => c.unit_id)].filter((u): u is string => !!u).map((u) => ({ value: u, label: unitName(u) ?? u }))
    : [];
  // "Recent customers of THIS item first" — the customers whose orders carry it (B-I9's nice slice).
  const recent = new Set(ordersStore.get().filter((o) => o.lines.some((l) => l.itemId === (target?.id ?? item?.id))).map((o) => o.customerId));
  const customers: SelectOption[] = [
    ...CUSTOMERS.filter((c) => recent.has(c.id)).map((c) => ({ value: c.id, label: c.name, hint: c.code, group: "Bought this item" })),
    ...CUSTOMERS.filter((c) => !recent.has(c.id)).map((c) => ({ value: c.id, label: c.name, hint: c.code, group: recent.size ? "All customers" : undefined })),
  ];
  const variants = tpl ? pickableVariants(all, tpl, org) : [];

  const docLabel = req?.key === "invoice" ? "invoice" : req?.key === "estimate" ? "estimate" : "sales order";
  const start = (r: { customerId: string | null; qty: number | null; unit: string; variantId: string | null }) => {
    const id = r.variantId ?? target?.id ?? item?.id;
    const p = new URLSearchParams();
    if (id) p.set("item", id);
    if (r.qty) p.set("qty", String(r.qty));
    if (r.unit) p.set("unit", r.unit);
    if (r.customerId) p.set("cust", r.customerId);
    close();
    navigate(`/design/sales/${DOC_PATH[req!.key]}/new?${p.toString()}`);
  };

  // ── Archive / delete ──
  const family = item ? [item, ...(isTemplate(item) ? childrenOf(all, item.id) : [])] : [];
  const usage = family.reduce((s, x) => s + x.usage, 0);
  const archive = () => {
    if (!item) return;
    family.forEach((x) => patchItem(x.id, { archived: true }));
    close();
    show("success", "Archived", { label: "Undo", run: () => family.forEach((x) => patchItem(x.id, { archived: false })) }, 8000);
  };
  const remove = () => {
    if (!item) return;
    const ids = new Set(family.map((x) => x.id));
    itemsStore.set((xs) => xs.filter((x) => !ids.has(x.id)));
    close();
    show("success", `${item.name} deleted`);
    onAfterDelete(item.id);
  };

  return (
    <>
      {item && docKey && tpl && (
        <VariantPicker
          open={!!req?.picking}
          template={{ name: tpl.name, code: tpl.code, image: tpl.image }}
          axes={(tpl.axes ?? []).map((a) => attributeById(a.attribute_id)?.name ?? a.attribute_id)}
          variants={variants}
          currency={baseCode(org)}
          unit={unitName(tpl.unit_id)}
          onPick={(vid) => set({ ...req!, variantId: vid, picking: false })}
          onClose={() => (req?.variantId ? set({ ...req!, picking: false }) : close())}
        />
      )}
      {item && docKey && (
        <AskFirst
          open={!req?.picking && (!tpl || !!req?.variantId || !isTemplate(item))}
          anchor={req?.anchor && document.body.contains(req.anchor) ? req.anchor : null}
          onClose={close}
          title={`New ${docLabel} · ${(chosen ?? item).name}`}
          customers={customers}
          units={unitOpts}
          unit={(target ?? item).sales_unit_id ?? (target ?? item).unit_id ?? ""}
          variant={tpl ? { id: req?.variantId ?? null, label: chosen ? chosen.name.replace(`${tpl.name}-`, "") : null, onChoose: () => set({ ...req!, picking: true }) } : undefined}
          commitLabel={`Start ${docLabel === "sales order" ? "order" : docLabel}`}
          onStart={start}
        />
      )}
      <Dialog
        open={!!item && req?.key === "archive"}
        size="sm"
        title={`Archive ${item?.name ?? ""}?`}
        onClose={close}
        foot={
          <>
            <button type="button" className={GHOST} onClick={close}>
              Keep it
            </button>
            <button type="button" className={BTN} onClick={archive}>
              Archive item
            </button>
          </>
        }
      >
        <p className="m-0 text-[12px] leading-relaxed text-bz-text-muted">
          {usage > 0 ? `Used on ${usage.toLocaleString("en-US")} document${usage === 1 ? "" : "s"}. ` : ""}It disappears from pickers; documents keep it.
          {item && isTemplate(item) && family.length > 1 && ` Its ${family.length - 1} variants are archived too.`}
        </p>
      </Dialog>
      <Dialog
        open={!!item && req?.key === "delete"}
        size="sm"
        title={`Delete ${item?.name ?? ""}?`}
        onClose={close}
        foot={
          <>
            <button type="button" className={GHOST} onClick={close}>
              Keep it
            </button>
            <button type="button" className={DANGER_BTN} onClick={remove}>
              Delete item
            </button>
          </>
        }
      >
        <p className="m-0 text-[12px] leading-relaxed text-bz-text-muted">
          {item && isTemplate(item) && family.length > 1 ? `Deletes the template and its ${family.length - 1} variants. ` : ""}This can't be undone.
        </p>
      </Dialog>
      <LabelDialog items={labelsFor} org={org} onClose={() => setLabels(null)} show={show} />
    </>
  );
}

// ── Print labels (LabelPrintDialogComponent, bzw skin) ──────────────────────

const STOCKS = [
  { id: "38x25-2up", label: "38×25 · 2-up" },
  { id: "38x25-3up", label: "38×25 · 3-up" },
  { id: "50x25", label: "50×25" },
  { id: "80roll", label: "80mm roll" },
];

function LabelDialog({ items, org, onClose, show }: { items: Item[] | null; org: string; onClose: () => void; show: Show }) {
  const all = itemsStore.get();
  const rows = React.useMemo(() => {
    if (!items) return [];
    const flat = items.flatMap((i) => (isTemplate(i) ? childrenOf(all, i.id) : [i]));
    return flat.flatMap((i) => i.barcodes.filter((b) => b.barcode).map((b) => ({ key: b.id, name: i.name, barcode: b.barcode!, rate: b.price ?? effRate(all, i, "sales_rate").value })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  const [stock, setStock] = React.useState(STOCKS[0].id);
  const [qtys, setQtys] = React.useState<Record<string, number>>({});
  React.useEffect(() => setQtys({}), [items]);
  const total = rows.reduce((s, r) => s + (qtys[r.key] ?? 1), 0);
  const first = rows[0];
  const code = baseCode(org);
  return (
    <Dialog
      open={!!items}
      size="wide"
      eyebrow="Print labels"
      title={items && items.length === 1 ? items[0].name : `${items?.length ?? 0} items`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={() => (onClose(), show("success", `${total} label${total === 1 ? "" : "s"} sent to the printer`))} disabled={total === 0}>
            <Printer size={13} /> Print {total}
          </button>
        </>
      }
    >
      {rows.length === 0 ? (
        <p className="m-0 text-[12px] text-bz-text-muted">No barcodes to print.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11.5px] font-semibold text-bz-text">Label stock</span>
            <Segmented size="sm" value={stock} onChange={setStock} options={STOCKS.map((s) => ({ value: s.id, label: s.label }))} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div className="max-h-[260px] overflow-y-auto rounded-bz-md border border-bz-line-soft [scrollbar-width:thin]">
              <div className={cn("sticky top-0 grid grid-cols-[minmax(0,1fr)_104px] gap-2 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5", LABEL)}>
                <span>Barcode</span>
                <span className="text-right">Labels</span>
              </div>
              {rows.map((r) => (
                <div key={r.key} className="grid grid-cols-[minmax(0,1fr)_104px] items-center gap-2 border-b border-bz-line-soft px-3 py-1.5 last:border-0">
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] text-bz-text">{r.name}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{r.barcode}</span>
                  </span>
                  <NumberField value={qtys[r.key] ?? 1} onChange={(n) => setQtys((q) => ({ ...q, [r.key]: n }))} ariaLabel={`Labels for ${r.barcode}`} className="w-[104px]" />
                </div>
              ))}
            </div>
            {first && (
              <div>
                <p className={cn(LABEL, "m-0 mb-1.5")}>Preview</p>
                <div className="flex aspect-[38/25] w-full flex-col items-center justify-center gap-1 rounded-bz-sm border border-bz-line bg-bz-surface p-2 text-bz-text">
                  <span className="w-full truncate text-center text-[10.5px] font-semibold">{first.name}</span>
                  <span aria-hidden className="h-7 w-full" style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--bz-text) 0 1px, transparent 1px 3px, var(--bz-text) 3px 5px, transparent 5px 6px)" }} />
                  <span className={cn("text-[10px]", NUM)}>{first.barcode}</span>
                  {first.rate > 0 && <span className={cn("text-[10px]", NUM)}>{code ? `${code} ` : ""}{money(first.rate)}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
