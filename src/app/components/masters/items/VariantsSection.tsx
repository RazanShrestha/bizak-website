import * as React from "react";
import { Archive, Barcode as BarcodeIcon } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, Dialog, GHOST, GHOST_SM, LABEL, NUM, Select } from "../../sales/bzw";
import type { ToastMsg } from "../../sales/bzw";
import { AmountPop, Grid, Source } from "../kit";
import type { GridColumn, GridGroup, StagedRows } from "../kit";
import { attributeById, itemsStore, newRowId, valueById } from "../seed/items";
import type { Item } from "../seed/items";
import { AxesDialog } from "./AxesDialog";
import { availableOf, childrenOf, money, negText, patchItem, taxName, unitName } from "./model";

// ════════════════════════════════════════════════════════════════════════════
// VARIANTS (spec §3.3 #7) — a template's children on the one editable grid.
//
//   • Sell / Buy edit each child's OWN rates (D-6: INITIAL_SALES_RATE /
//     INITIAL_PURCHASE_RATE, never ITEM_PRICE), staged in the page's dock and
//     saved in its one transaction (B-I3 `variants`). A rate equal to the
//     template's reads muted; a different one reads full ink with ↺.
//   • Group by any axis; a group row's "Set price" applies to its variants;
//     a selection gets the bulk bar (Set price · Set purchase price ·
//     Barcodes from codes · Archive).
//   • Edit axes, Barcodes from codes and Archive are IMMEDIATE (their own
//     confirm / Undo) — generation writes rows, it is not a field.
//   • Family drift (`family-drift` ✔, no UI today): children whose unit or
//     tax differ from the template; Apply template settings never touches
//     price (✔ matrix skill).
// ════════════════════════════════════════════════════════════════════════════

export type VarRow = { id: string; sell: number | null; buy: number | null };
type Show = (kind: ToastMsg["kind"], text: string, action?: ToastMsg["action"], duration?: number) => void;

export const variantRowsOf = (all: Item[], t: Item): VarRow[] => childrenOf(all, t.id).filter((c) => !c.archived).map((c) => ({ id: c.id, sell: c.sales_rate, buy: c.purchase_rate }));

/** Children that drifted from the template in unit or tax (`api/item-matrix/{id}/family-drift`). */
export const driftOf = (all: Item[], t: Item) => childrenOf(all, t.id).filter((c) => !c.archived && (c.unit_id !== t.unit_id || c.tax_id !== t.tax_id));

export function VariantsSection({
  template,
  all,
  staged,
  ro,
  org,
  currency,
  onOpenVariant,
  show,
}: {
  template: Item;
  all: Item[];
  staged: StagedRows<VarRow>;
  ro: boolean;
  org: string;
  currency: string | null;
  onOpenVariant: (id: string) => void;
  show: Show;
}) {
  const kids = new Map(childrenOf(all, template.id).map((c) => [c.id, c]));
  const axes = template.axes ?? [];
  const [groupBy, setGroupBy] = React.useState<string>(axes[0]?.attribute_id ?? "");
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [pop, setPop] = React.useState<{ anchor: HTMLElement; ids: string[]; side: "sell" | "buy"; title: string } | null>(null);
  const [axesOpen, setAxesOpen] = React.useState(false);
  const [driftOpen, setDriftOpen] = React.useState(false);
  const drift = driftOf(all, template);

  const valuesOf = (id: string) =>
    axes
      .map((a) => {
        const v = kids.get(id)?.values?.[a.attribute_id];
        return v ? valueById(a.attribute_id, v)?.value : null;
      })
      .filter(Boolean)
      .join(" · ");

  const columns: GridColumn<VarRow>[] = [
    { key: "values", label: "Values", width: "minmax(68px,0.6fr)", kind: "readonly", render: (r) => <span className="font-medium text-bz-text">{valuesOf(r.id)}</span> },
    {
      key: "code",
      label: "Code",
      width: "minmax(0,1.9fr)",
      kind: "readonly",
      render: (r) => (
        <button type="button" tabIndex={-1} className="min-w-0 max-w-full truncate text-left text-bz-text-muted underline decoration-bz-line underline-offset-2 hover:text-bz-text hover:decoration-bz-text-soft" onClick={(e) => (e.stopPropagation(), onOpenVariant(r.id))} title={`${kids.get(r.id)?.code ?? "No code"} — open this variant's page`}>
          {kids.get(r.id)?.code ?? "—"}
        </button>
      ),
    },
    {
      key: "barcode",
      label: "Barcode",
      width: "minmax(76px,0.8fr)",
      kind: "readonly",
      title: (r) => kids.get(r.id)?.barcodes[0]?.barcode ?? "No barcode",
      render: (r) => {
        const k = kids.get(r.id);
        const b = k?.barcodes[0]?.barcode;
        return !b ? <span className="text-bz-amber-ink">None</span> : b === k?.code ? <span className="text-bz-text-soft" title="Same as the code">= code</span> : <span className="text-bz-text-muted">{b}</span>;
      },
    },
    {
      key: "sell",
      label: "Sell",
      width: "92px",
      kind: "number",
      format: (v) => (v === null ? "—" : money(v as number)),
      muted: (r) => r.sell === template.sales_rate,
      title: (r) => (r.sell === template.sales_rate ? "Same as the template" : `Own price — the template's is ${money(template.sales_rate)}`),
      render: (r) => (
        <span className="inline-flex items-center justify-end gap-0.5">
          {!ro && r.sell !== template.sales_rate && <Source kind="override" resetLabel="Reset to template price" onReset={() => staged.setCell(r.id, "sell", template.sales_rate)} tabIndex={-1} />}
          {r.sell === null ? "—" : money(r.sell)}
        </span>
      ),
    },
    {
      key: "buy",
      label: "Buy",
      width: "88px",
      kind: "number",
      format: (v) => (v === null ? "—" : money(v as number)),
      muted: (r) => r.buy === template.purchase_rate,
      render: (r) => (
        <span className="inline-flex items-center justify-end gap-0.5">
          {!ro && r.buy !== template.purchase_rate && <Source kind="override" resetLabel="Reset to template purchase price" onReset={() => staged.setCell(r.id, "buy", template.purchase_rate)} tabIndex={-1} />}
          {r.buy === null ? "—" : money(r.buy)}
        </span>
      ),
    },
    {
      key: "available",
      label: "Stock",
      width: "64px",
      kind: "readonly",
      align: "right",
      render: (r) => {
        const k = kids.get(r.id);
        const a = k ? availableOf(all, k, org) ?? 0 : 0;
        return <span className={a < 0 ? "font-semibold text-bz-red" : undefined}>{negText(a)}{a < 0 && " neg"}</span>;
      },
    },
  ];

  const groupAttr = attributeById(groupBy);
  const groupAxis = axes.find((a) => a.attribute_id === groupBy);
  const groups: GridGroup[] | undefined =
    groupAttr && groupAxis
      ? groupAxis.value_ids
          .map((vid, i) => {
            const ids = staged.rows.filter((r) => !kids.get(r.id)?.archived && kids.get(r.id)?.values?.[groupBy] === vid).map((r) => r.id);
            return {
              key: vid,
              label: valueById(groupBy, vid)?.value ?? vid,
              rowIds: ids,
              collapsed: i > 0,
              right: ro ? undefined : (
                <button type="button" className={cn(GHOST_SM, "h-7")} onClick={(e) => setPop({ anchor: e.currentTarget, ids, side: "sell", title: `Set sell price · all ${valueById(groupBy, vid)?.value}` })}>
                  Set price
                </button>
              ),
            };
          })
          .filter((g) => g.rowIds.length > 0)
      : undefined;

  const barcodesFromCodes = (ids: string[]) => {
    const todo = ids.map((id) => kids.get(id)).filter((k): k is Item => !!k && k.barcodes.length === 0 && !!k.code);
    if (todo.length === 0) return show("info", "They all have a barcode already");
    const before = todo.map((k) => ({ id: k.id, barcodes: k.barcodes }));
    todo.forEach((k) => patchItem(k.id, { barcodes: [{ id: newRowId("bc"), barcode: k.code, unit_id: k.unit_id, price: null, discount: null }] }));
    show("success", `${todo.length} barcode${todo.length === 1 ? "" : "s"} added`, { label: "Undo", run: () => before.forEach((b) => patchItem(b.id, { barcodes: b.barcodes })) }, 8000);
  };
  const archive = (ids: string[]) => {
    ids.forEach((id) => patchItem(id, { archived: true }));
    setSel(new Set());
    show("success", `${ids.length} variant${ids.length === 1 ? "" : "s"} archived`, { label: "Undo", run: () => ids.forEach((id) => patchItem(id, { archived: false })) }, 8000);
  };

  const axesText = axes.map((a) => `${attributeById(a.attribute_id)?.name} (${a.value_ids.map((v) => valueById(a.attribute_id, v)?.value).join(", ")})`).join(" × ");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
        <span className="text-bz-text-muted">Axes</span>
        <span className="min-w-0 flex-1 text-bz-text">{axesText}</span>
        {!ro && (
          <button type="button" className={GHOST_SM} onClick={() => setAxesOpen(true)}>
            Edit axes
          </button>
        )}
      </div>
      {drift.length > 0 && (
        <p className="m-0 flex flex-wrap items-center gap-x-2 rounded-bz-md bg-bz-paper-warm px-3 py-2 text-[12px] text-bz-text-muted">
          {drift.length} variant{drift.length === 1 ? "" : "s"} differ from the template in unit or tax.
          <button type="button" className="rounded-bz-sm font-medium text-bz-text underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-bz-fire" onClick={() => setDriftOpen(true)}>
            Review
          </button>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {axes.length > 1 && (
          <Select
            trigger="ghost"
            label={<>Group by <span className="font-semibold">{groupAttr?.name ?? "None"}</span></>}
            value={groupBy}
            onChange={setGroupBy}
            options={[...axes.map((a) => ({ value: a.attribute_id, label: attributeById(a.attribute_id)?.name ?? a.attribute_id })), { value: "", label: "None" }]}
            width={240}
          />
        )}
        {sel.size > 0 && !ro && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-bz-sm bg-bz-fire/20 px-1.5 py-0.5 text-[11px] font-semibold text-bz-text", NUM)}>{sel.size} selected</span>
            <button type="button" className={GHOST_SM} onClick={(e) => setPop({ anchor: e.currentTarget, ids: [...sel], side: "sell", title: `Set sell price · ${sel.size} variant${sel.size === 1 ? "" : "s"}` })}>
              Set price
            </button>
            <button type="button" className={GHOST_SM} onClick={(e) => setPop({ anchor: e.currentTarget, ids: [...sel], side: "buy", title: `Set purchase price · ${sel.size} variant${sel.size === 1 ? "" : "s"}` })}>
              Set purchase price
            </button>
            <button type="button" className={GHOST_SM} onClick={() => barcodesFromCodes([...sel])}>
              <BarcodeIcon size={12} /> Barcodes from codes
            </button>
            <button type="button" className={GHOST_SM} onClick={() => archive([...sel])}>
              <Archive size={12} /> Archive
            </button>
          </div>
        )}
      </div>
      <Grid<VarRow>
        ariaLabel="Variants"
        mode={ro ? "readonly" : "staged"}
        columns={columns}
        rows={staged.rows.filter((r) => !kids.get(r.id)?.archived)}
        rowState={staged.rowState}
        onCell={staged.setCell}
        groups={groups}
        selectable={!ro}
        selected={sel}
        onSelect={setSel}
        stickyTop={56}
        minWidth={640}
        empty="No variants yet — edit the axes to generate them."
      />
      <AmountPop
        open={!!pop}
        anchor={pop?.anchor ?? null}
        onClose={() => setPop(null)}
        title={pop?.title ?? ""}
        label={pop?.side === "buy" ? "Purchase" : "Sell price"}
        initial={pop?.side === "buy" ? template.purchase_rate : template.sales_rate}
        suffix={currency ?? undefined}
        onApply={(n) => {
          pop?.ids.forEach((id) => staged.setCell(id, pop.side, n));
          return null;
        }}
      />
      <AxesDialog
        template={template}
        open={axesOpen}
        onClose={() => setAxesOpen(false)}
        onDone={(r) => {
          setAxesOpen(false);
          staged.load(variantRowsOf(itemsStore.get(), itemsStore.get().find((x) => x.id === template.id)!));
          show("success", r.created.length ? `${r.created.length} variant${r.created.length === 1 ? "" : "s"} created` : `${r.archived.length} variant${r.archived.length === 1 ? "" : "s"} archived`);
        }}
      />
      <Dialog
        open={driftOpen}
        title={`${drift.length} variant${drift.length === 1 ? "" : "s"} differ from the template`}
        onClose={() => setDriftOpen(false)}
        foot={
          <>
            <button type="button" className={GHOST} onClick={() => setDriftOpen(false)}>
              Close
            </button>
            {!ro && (
              <button
                type="button"
                className={BTN}
                onClick={() => {
                  const before = drift.map((d) => ({ id: d.id, unit_id: d.unit_id, tax_id: d.tax_id, taxable: d.taxable }));
                  drift.forEach((d) => patchItem(d.id, { unit_id: template.unit_id, tax_id: template.tax_id, taxable: template.taxable }));
                  setDriftOpen(false);
                  show("success", "Template settings applied", { label: "Undo", run: () => before.forEach((b) => patchItem(b.id, { unit_id: b.unit_id, tax_id: b.tax_id, taxable: b.taxable })) }, 8000);
                }}
              >
                Apply template settings
              </button>
            )}
          </>
        }
      >
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          <div className={cn("grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5", LABEL)}>
            <span>Variant</span>
            <span>Unit</span>
            <span>Tax</span>
          </div>
          {drift.map((d) => (
            <div key={d.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-bz-line-soft px-3 py-2 text-[12px] last:border-0">
              <span className="truncate text-bz-text">{valuesOf(d.id)}</span>
              <span className={d.unit_id !== template.unit_id ? "text-bz-text" : "text-bz-text-soft"}>{unitName(d.unit_id) ?? "—"}</span>
              <span className={d.tax_id !== template.tax_id ? "font-medium text-bz-text" : "text-bz-text-soft"}>{taxName(d.tax_id) ?? "None"}</span>
            </div>
          ))}
        </div>
        <p className="m-0 mt-2.5 text-[11.5px] text-bz-text-muted">
          The template has {unitName(template.unit_id)} · {taxName(template.tax_id) ?? "no tax"}. Prices are never changed.
        </p>
      </Dialog>
    </div>
  );
}
