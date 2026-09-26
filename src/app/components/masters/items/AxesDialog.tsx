import * as React from "react";
import { Plus, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, Dialog, GHOST, GHOST_SM, NUM, PLAIN_BTN, Select } from "../../sales/bzw";
import { ATTRIBUTES, attributeById, itemsStore, newItemId, newRowId, valueById } from "../seed/items";
import type { Item } from "../seed/items";
import { ME, childrenOf, nowIso } from "./model";

// ════════════════════════════════════════════════════════════════════════════
// AXES — a matrix item's attributes and ticked values (spec §3.3 Variants,
// §3.4 Matrix item). The editor is shared by the create sheet and the page's
// "Edit axes" dialog. Every combination starts ticked; untick to skip (D-7).
// At most 3 axes (✔ UI rule).
//
// Generation is IMMEDIATE (its own confirm), never staged in the dock, and it
// ALWAYS sends the full axis set — `generate` replaces the template's axes, so
// a partial set would drop the axes left out (the reconcile trap, matrix skill).
// A value removed from an axis archives its variants (`deactivate_removed`).
// ════════════════════════════════════════════════════════════════════════════

export type Axis = { attribute_id: string; value_ids: string[] };
export const MAX_AXES = 3;

/** Every ticked combination, in axis order. */
export function combos(axes: Axis[]): Record<string, string>[] {
  const live = axes.filter((a) => a.value_ids.length > 0);
  if (live.length === 0) return [];
  return live.reduce<Record<string, string>[]>((acc, a) => acc.flatMap((c) => a.value_ids.map((v) => ({ ...c, [a.attribute_id]: v }))), [{}]);
}
const keyOf = (v: Record<string, string>, axes: Axis[]) => axes.map((a) => v[a.attribute_id] ?? "").join("|");

/** "12 variants: S, M, L, XL × Red, Blue, Black" — the live count. */
export function countLine(axes: Axis[]) {
  const n = combos(axes).length;
  const parts = axes.filter((a) => a.value_ids.length).map((a) => a.value_ids.map((v) => valueById(a.attribute_id, v)?.value).join(", "));
  return n === 0 ? "No variants yet — tick at least one value." : `${n} variant${n === 1 ? "" : "s"}: ${parts.join(" × ")}`;
}

/** The generate preview (`api/item-matrix/preview` ✔): what is added and what is archived. */
export function previewOf(all: Item[], template: Item, axes: Axis[]) {
  const kids = childrenOf(all, template.id).filter((c) => !c.archived);
  const want = combos(axes);
  const have = new Set(kids.map((k) => keyOf(k.values ?? {}, axes)));
  const wantKeys = new Set(want.map((w) => keyOf(w, axes)));
  const adds = want.filter((w) => !have.has(keyOf(w, axes)));
  // A child whose combination is gone — including every child when an axis is added or removed.
  const removes = kids.filter((k) => !wantKeys.has(keyOf(k.values ?? {}, axes)) || Object.keys(k.values ?? {}).length !== axes.filter((a) => a.value_ids.length).length);
  return { adds, removes };
}

/** "Adds 3 variants (XXL × Red, Blue, Black)." */
export function describeAdds(adds: Record<string, string>[], axes: Axis[]) {
  if (adds.length === 0) return "";
  const cols = axes.filter((a) => a.value_ids.length).map((a) => Array.from(new Set(adds.map((x) => x[a.attribute_id]))).map((v) => valueById(a.attribute_id, v)?.value ?? v));
  const shape = cols.reduce((n, c) => n * c.length, 1) === adds.length ? `(${cols.map((c) => c.join(", ")).join(" × ")})` : "";
  return `Adds ${adds.length} variant${adds.length === 1 ? "" : "s"}${shape ? ` ${shape}` : ""}.`;
}

/**
 * `generate`: new children coded `{template}-{ABBR}-{ABBR}`, named `{template}-{Value}-{Value}`, priced at
 * the template's rates (seeded once — skill "Pricing a variant"), barcode = code (auto_barcode), unit /
 * tax / category / costing from the template; removed combinations archived. Returns the new ids.
 */
export function generateFamily(templateId: string, axes: Axis[]): { created: string[]; archived: string[] } {
  const all = itemsStore.get();
  const t = all.find((x) => x.id === templateId);
  if (!t) return { created: [], archived: [] };
  const { adds, removes } = previewOf(all, { ...t, axes }, axes);
  const when = nowIso();
  const created: Item[] = adds.map((v) => {
    const vals = axes.filter((a) => a.value_ids.length).map((a) => valueById(a.attribute_id, v[a.attribute_id])!);
    const code = `${t.code ?? t.name}-${vals.map((x) => x.abbr).join("-")}`;
    return {
      ...t,
      id: newItemId(),
      code,
      name: `${t.name}-${vals.map((x) => x.value).join("-")}`,
      parent_id: t.id,
      axes: null,
      values: v,
      income_id: null,
      expense_id: null,
      asset_id: null,
      cogs_id: null,
      image: null,
      files: [],
      barcodes: [{ id: newRowId("bc"), barcode: code, unit_id: t.unit_id, price: null, discount: null }],
      stock: [],
      movements: [],
      open_lines: [],
      has_movements: false,
      usage: 0,
      sold_30d: null,
      history: [{ id: newRowId("h"), who: ME, when, kind: "created" }],
      created: { by: ME, on: when },
      modified: { by: ME, on: when },
    };
  });
  const gone = new Set(removes.map((r) => r.id));
  itemsStore.set((xs) => [...xs.map((x) => (x.id === t.id ? { ...x, axes, modified: { by: ME, on: when } } : gone.has(x.id) ? { ...x, archived: true } : x)), ...created]);
  return { created: created.map((c) => c.id), archived: [...gone] };
}

/** Attribute pickers (max 3) + value chips, every value ticked when an attribute is picked (D-7). */
export function AxesEditor({ axes, onChange, locked }: { axes: Axis[]; onChange: (a: Axis[]) => void; /** Attributes already generated can't be swapped for another here. */ locked?: string[] }) {
  const used = axes.map((a) => a.attribute_id);
  const set = (i: number, a: Axis) => onChange(axes.map((x, k) => (k === i ? a : x)));
  return (
    <div className="flex flex-col gap-2.5">
      {axes.map((a, i) => {
        const attr = attributeById(a.attribute_id);
        const isLocked = locked?.includes(a.attribute_id);
        return (
          <div key={`${a.attribute_id}-${i}`} className="flex flex-col gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-paper px-3 py-2.5">
            <div className="flex items-center gap-2">
              {isLocked ? (
                <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-bz-text">{attr?.name}</span>
              ) : (
                <Select
                  trigger="ghost"
                  className="h-8 min-w-0 flex-1 justify-between"
                  label={attr?.name ?? <span className="font-normal text-bz-text-soft">Choose an attribute…</span>}
                  value={a.attribute_id || null}
                  onChange={(v) => set(i, { attribute_id: v, value_ids: attributeById(v)?.values.map((x) => x.id) ?? [] })}
                  options={ATTRIBUTES.filter((x) => x.id === a.attribute_id || !used.includes(x.id)).map((x) => ({ value: x.id, label: x.name, hint: x.values.map((v) => v.value).join(", ") }))}
                  width={280}
                />
              )}
              <button type="button" className={cn(PLAIN_BTN, "mx-1")} onClick={() => onChange(axes.filter((_, k) => k !== i))} title="Remove this axis" aria-label="Remove this axis">
                <X size={13} />
              </button>
            </div>
            {attr && (
              <div className="flex flex-wrap gap-1.5">
                {attr.values.map((v) => {
                  const on = a.value_ids.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set(i, { ...a, value_ids: on ? a.value_ids.filter((x) => x !== v.id) : attr.values.filter((x) => x.id === v.id || a.value_ids.includes(x.id)).map((x) => x.id) })}
                      className={cn(
                        "inline-flex h-7 items-center gap-1 rounded-bz-md border px-2.5 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-bz-fire",
                        on ? "border-bz-text-muted bg-bz-fire/10 font-semibold text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-soft line-through decoration-bz-line hover:text-bz-text",
                      )}
                      title={on ? `Skip ${v.value}` : `Include ${v.value}`}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {axes.length < MAX_AXES && (
        <button type="button" className={cn(GHOST_SM, "self-start")} onClick={() => onChange([...axes, { attribute_id: "", value_ids: [] }])}>
          <Plus size={12} /> Add an axis
        </button>
      )}
    </div>
  );
}

/** The page's "Edit axes": the full set, a preview of what it adds / archives, then generate. */
export function AxesDialog({ template, open, onClose, onDone }: { template: Item; open: boolean; onClose: () => void; onDone: (r: { created: string[]; archived: string[] }) => void }) {
  const all = itemsStore.get();
  const [axes, setAxes] = React.useState<Axis[]>(template.axes ?? []);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (open) setAxes(template.axes ?? [{ attribute_id: "", value_ids: [] }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const clean = axes.filter((a) => a.attribute_id);
  const { adds, removes } = previewOf(all, template, clean);
  const moved = removes.some((r) => r.has_movements);
  const nothing = adds.length === 0 && removes.length === 0;
  const generate = () => {
    setBusy(true);
    window.setTimeout(() => {
      const r = generateFamily(template.id, clean);
      setBusy(false);
      onDone(r);
    }, 600);
  };
  return (
    <Dialog
      open={open}
      size="wide"
      eyebrow={template.axes ? "Edit axes" : "Make this a matrix item"}
      title={template.name}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={generate} disabled={nothing || busy || combos(clean).length === 0}>
            {busy ? "Creating variants…" : adds.length ? `Add ${adds.length} variant${adds.length === 1 ? "" : "s"}` : "Apply"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <AxesEditor axes={axes} onChange={setAxes} locked={(template.axes ?? []).map((a) => a.attribute_id)} />
        <div className={cn("rounded-bz-md bg-bz-paper-warm px-3 py-2.5 text-[12px] leading-relaxed text-bz-text", NUM)} role="status">
          <p className="m-0 font-semibold">{countLine(clean)}</p>
          <p className="m-0 mt-0.5 text-bz-text-muted">
            {nothing ? "No change." : describeAdds(adds, clean)}{" "}
            {removes.length === 0
              ? nothing
                ? ""
                : "Nothing is removed."
              : `${removes.length} variant${removes.length === 1 ? "" : "s"} will be archived${moved ? " — they have stock movements." : "."}`}
          </p>
        </div>
        <p className="m-0 text-[11px] text-bz-text-soft">Applies at once — not part of Save.</p>
      </div>
    </Dialog>
  );
}
