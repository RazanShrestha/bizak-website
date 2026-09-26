import * as React from "react";
import { Boxes, ImageOff, SearchX } from "lucide-react";
import { cn } from "../../ui/utils";
import { Clear, Dialog, GHOST, Kbd, LABEL, NUM } from "../../sales/bzw";

// ════════════════════════════════════════════════════════════════════════════
// VARIANT PICKER — choose one child of a matrix template (BZW-ATOMS §13b,
// `<bzw-variant-picker>` / `.bzw-varpick`; the website had no port of it).
//
//   head   the template's picture tile (the boxes glyph when there is none —
//          never a stand-in picture), name, "code · N variants"
//   tools  a search (name, code, barcode, value, abbreviation; every typed
//          word must hit) and, for a family of 7+, one row of toggle chips
//          per axis: OR within an axis, AND across; a chip that would leave
//          no row is disabled before it is clicked
//   list   one row per variant: each axis value · code (+ barcode when it
//          differs) · stock (amber at 0, danger below — still pickable) ·
//          rate. ONE cursor: the pointer moves it, so hover and keyboard
//          never show two rows
//   keys   in the search box: ↑ / ↓, Home / End, ↵ picks, Esc closes
// ════════════════════════════════════════════════════════════════════════════

export type PickableVariant = {
  id: string;
  /** One value per axis, in axis order. */
  values: { value: string; abbr: string }[];
  code: string | null;
  barcode: string | null;
  name: string;
  /** ON_HAND in the document's organisation (the matrix read). */
  stock: number;
  rate: number;
};

export function VariantPicker({
  open,
  template,
  axes,
  variants,
  currency,
  unit,
  onPick,
  onClose,
}: {
  open: boolean;
  template: { name: string; code: string | null; image?: "set" | "missing" | null };
  axes: string[];
  variants: PickableVariant[];
  /** The rate's code — none when the base has no code-shaped label. */
  currency?: string | null;
  unit?: string | null;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = React.useState("");
  const [facets, setFacets] = React.useState<Record<number, Set<string>>>({});
  const [cursor, setCursor] = React.useState(0);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setQ("");
    setFacets({});
    setCursor(0);
    const id = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hay = (v: PickableVariant) => [v.name, v.code ?? "", v.barcode ?? "", ...v.values.flatMap((x) => [x.value, x.abbr])].join(" ").toLowerCase();
  const passes = (v: PickableVariant, skipAxis?: number) =>
    words.every((w) => hay(v).includes(w)) && Object.entries(facets).every(([ax, set]) => Number(ax) === skipAxis || set.size === 0 || set.has(v.values[Number(ax)]?.value));
  const shown = variants.filter((v) => passes(v));
  React.useEffect(() => setCursor((c) => Math.min(c, Math.max(0, shown.length - 1))), [shown.length]);

  const usedValues = axes.map((_, i) => Array.from(new Set(variants.map((v) => v.values[i]?.value).filter(Boolean))) as string[]);
  const showFacets = variants.length >= 7;

  const toggle = (axis: number, value: string, fromPointer: boolean) => {
    setFacets((f) => {
      const s = new Set(f[axis] ?? []);
      s.has(value) ? s.delete(value) : s.add(value);
      return { ...f, [axis]: s };
    });
    if (fromPointer) searchRef.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, Math.min(shown.length - 1, c + (e.key === "ArrowDown" ? 1 : -1))));
    } else if (e.key === "Home") {
      e.preventDefault();
      setCursor(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setCursor(shown.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[cursor]) onPick(shown[cursor].id);
    }
  };

  React.useLayoutEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-vp="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const cols = [...axes.map(() => "minmax(56px,0.7fr)"), "minmax(0,1.4fr)", "72px", "96px"].join(" ");
  const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Dialog
      open={open}
      size="wide"
      eyebrow="Choose a variant"
      title={template.name}
      onClose={onClose}
      foot={
        <>
          <span className="mr-auto hidden items-center gap-1.5 text-[11px] text-bz-text-soft sm:flex">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> move · <Kbd>↵</Kbd> pick · <Kbd>Esc</Kbd> close
          </span>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
        </>
      }
    >
      <div className="-mx-4 -mt-4 flex h-[min(520px,calc(100vh-200px))] flex-col">
        <div className="flex items-center gap-3 border-b border-bz-line-soft px-4 py-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm text-bz-text-soft" title={template.image === "missing" ? "Image file is missing." : undefined}>
            {template.image === "missing" ? <ImageOff size={18} /> : <Boxes size={18} />}
          </span>
          <p className={cn("m-0 min-w-0 flex-1 truncate text-[11.5px] text-bz-text-muted", NUM)}>
            {template.code ?? "—"} · {variants.length} variants
          </p>
        </div>
        <div className="flex flex-col gap-2 border-b border-bz-line-soft px-4 py-3">
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => (setQ(e.target.value), setCursor(0))}
            onKeyDown={onKey}
            placeholder="Value, code or barcode"
            aria-label="Search variants"
            className="h-8 w-full rounded-bz-md border border-bz-line bg-bz-paper px-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
          />
          {showFacets &&
            axes.map((a, i) =>
              usedValues[i].length > 1 ? (
                <div key={a} className="flex flex-wrap items-center gap-1.5">
                  <span className={cn(LABEL, "mr-1 w-full truncate sm:w-auto sm:max-w-[160px]")}>{a}</span>
                  {usedValues[i].map((val) => {
                    const on = !!facets[i]?.has(val);
                    const dead = !on && !variants.some((v) => v.values[i]?.value === val && passes(v, i));
                    return (
                      <button
                        key={val}
                        type="button"
                        aria-pressed={on}
                        disabled={dead}
                        onClick={(e) => toggle(i, val, e.detail > 0)}
                        className={cn(
                          "inline-flex h-7 items-center rounded-bz-md border px-2.5 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-bz-fire disabled:cursor-not-allowed disabled:opacity-40",
                          on ? "border-bz-text-muted bg-bz-fire/10 font-semibold text-bz-text" : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:text-bz-text",
                        )}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              ) : null,
            )}
        </div>
        <div ref={listRef} role="listbox" aria-label="Variants" className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
          <div className={cn("sticky top-0 z-[1] hidden gap-2 border-b border-bz-line bg-bz-paper-warm px-4 py-1.5 sm:grid", LABEL)} style={{ gridTemplateColumns: cols }}>
            {axes.map((a) => (
              <span key={a} className="truncate">
                {a}
              </span>
            ))}
            <span>Code</span>
            <span className="text-right">In stock</span>
            <span className="text-right">Rate</span>
          </div>
          {shown.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <SearchX size={16} className="text-bz-text-soft" />
              <p className="m-0 text-[12.5px] font-medium text-bz-text">{q ? `No variant matches “${q}”.` : "No variant matches."}</p>
              <Clear label="Clear filters" onClear={() => (setQ(""), setFacets({}), searchRef.current?.focus())} />
            </div>
          ) : (
            shown.map((v, i) => {
              const on = i === cursor;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={on}
                  data-vp={i}
                  onMouseMove={() => cursor !== i && setCursor(i)}
                  onClick={() => onPick(v.id)}
                  className={cn("relative grid w-full items-center gap-x-2 gap-y-0.5 border-b border-bz-line-soft px-4 py-2 text-left text-[12.5px] max-sm:!grid-cols-[minmax(0,1fr)_auto]", on ? "bg-bz-fire/10" : "bg-bz-surface")}
                  style={{ gridTemplateColumns: cols }}
                >
                  {on && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-bz-fire" />}
                  {v.values.map((x, k) => (
                    <span key={k} className="truncate font-medium text-bz-text max-sm:hidden">
                      {x.value}
                    </span>
                  ))}
                  <span className="truncate font-medium text-bz-text sm:hidden">{v.values.map((x) => x.value).join(" · ")}</span>
                  <span className={cn("min-w-0 truncate text-[11.5px] text-bz-text-muted max-sm:order-3", NUM)}>
                    {v.code ?? "—"}
                    {v.barcode && v.barcode !== v.code && <span className="ml-1.5 text-bz-text-soft">{v.barcode}</span>}
                  </span>
                  <span className={cn("text-right text-[12px] max-sm:order-4", NUM, v.stock < 0 ? "font-semibold text-bz-red" : v.stock === 0 ? "text-bz-amber-ink" : "text-bz-text")}>
                    {v.stock < 0 ? `−${Math.abs(v.stock)} neg` : v.stock}
                  </span>
                  <span className={cn("text-right font-semibold text-bz-text max-sm:order-2", NUM)}>
                    {currency && <span className="mr-1 text-[10.5px] font-medium text-bz-text-soft">{currency}</span>}
                    {money(v.rate)}
                    {unit && <span className="ml-1 text-[10.5px] font-normal text-bz-text-soft">/ {unit}</span>}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}
