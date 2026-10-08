import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Checkbox, Kbd, NUM, PLAIN_BTN, Portal, Select } from "../sales/bzw";
import type { SelectOption } from "../sales/bzw";
import { FX_VARS, HEAD_BTN, PANEL } from "./fx";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE · the list kit — a roomy table, and how a record opens from it
//
// Every list of the module is the same four parts: a search field, a table
// with air in it, a glass bar that appears when rows are ticked, and a sheet
// that floats over the page with the record in it. Nothing here knows what a
// row is — the page says what each column draws.
// ════════════════════════════════════════════════════════════════════════════

type IconType = React.ComponentType<{ size?: number; className?: string }>;

/** The bzw `Select` trigger at this language's control height — pass as its `className`. */
export const FX_CONTROL = "h-9 px-3 text-[12.5px]";

// ── Search ──────────────────────────────────────────────────────────────────

/** The list's search field. Same props as the bzw `SearchField`. */
export const FxSearch = React.forwardRef<HTMLInputElement, { value: string; onChange: (v: string) => void; placeholder: string; className?: string; hint?: string }>(function FxSearch({ value, onChange, placeholder, className, hint }, ref) {
  return (
    <label className={cn("relative block", className)}>
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-soft" />
      <input
        ref={ref}
        value={value}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
        placeholder={placeholder}
        className="block h-9 w-full rounded-[10px] border border-bz-line-soft bg-bz-surface pl-9 pr-9 text-[13px] text-bz-text outline-none transition-colors placeholder:text-bz-text-soft hover:border-bz-line focus:border-bz-text-soft"
      />
      {value ? (
        <button type="button" onClick={() => onChange("")} className={cn(PLAIN_BTN, "absolute right-3 top-1/2 -translate-y-1/2")} aria-label="Clear search">
          <X size={13} />
        </button>
      ) : (
        hint && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
            <Kbd>{hint}</Kbd>
          </span>
        )
      )}
    </label>
  );
});

// ── Table ───────────────────────────────────────────────────────────────────

export type FxBreak = 640 | 768 | 1024 | 1280 | 1536;
const BREAKS: FxBreak[] = [640, 768, 1024, 1280, 1536];

export type FxColumn<R> = {
  key: string;
  label: string;
  /** A grid track: "92px", "minmax(0,2fr)". */
  width: string;
  align?: "right";
  render: (row: R) => React.ReactNode;
  /** The column leaves below this window width; what must survive goes in the primary column's second line. */
  hideBelow?: FxBreak;
  /**
   * What the column is on a phone, where a row is a card: `primary` leads it (default: the first column), `figure`
   * sits at its right (default: the last), `state` goes under the primary. Every other column leaves.
   */
  role?: "primary" | "figure" | "state";
};

/** `run` gets the click, so a verb can anchor a menu to its button. */
export type FxVerb = { label: string; icon?: IconType; run: (e: React.MouseEvent<HTMLButtonElement>) => void };
/** A run of rows under one quiet label: its name, how many, and — at the right — what they come to. */
export type FxGroup = { key: string; label: string; right?: React.ReactNode; danger?: boolean };

export type FxTableProps<R> = {
  rows: R[];
  idOf: (row: R) => string;
  columns: FxColumn<R>[];
  /** What the table lists, for a screen reader. */
  label?: string;
  /** A click on the row, or Enter on it. */
  onOpen?: (row: R) => void;
  /** The row whose record is open. The table turns to its page and keeps it in view. */
  current?: string | null;
  /** Giving `onSelect` adds the tick column. */
  selected?: ReadonlySet<string>;
  onSelect?: (next: Set<string>) => void;
  /** What a row's tick names — "Select SO-5012". Defaults to the id. */
  rowLabel?: (row: R) => string;
  /**
   * The row's one next step. It appears over the right end of the row on hover or focus, on a short fade of the row's
   * own colour, so no track is kept empty for it (from 1024px; a touch screen opens the row).
   */
  verb?: (row: R) => FxVerb | null;
  /** Rows that follow each other with the same key sit under one quiet label. Sort the rows by group first. */
  groupOf?: (row: R) => FxGroup;
  /** Shown in the card when there are no rows — see `FxEmpty`. */
  empty?: React.ReactNode;
  pageSize?: number;
  /** Give both to own the page (to keep it in the address); leave out and the table keeps it. */
  page?: number;
  onPage?: (page: number) => void;
  /** ["order", "orders"] — the footer reads "7 orders" when one page holds them all. */
  noun?: [string, string];
  /** Beside the range in the footer — a total. */
  footer?: React.ReactNode;
  /** J / K / ↑ / ↓ pressed with nothing focused land on the table. One table per page; turn it off while a sheet is open. */
  keys?: boolean;
  className?: string;
};

const NONE: ReadonlySet<string> = new Set();
// A row's colour is a variable, so what floats over its end (the verb) can fade into exactly that colour.
const ROW_REST = "[--fx-row:var(--bz-surface)] hover:[--fx-row:color-mix(in_srgb,var(--bz-paper-warm)_50%,var(--bz-surface))]";
const ROW_ON = "[--fx-row:color-mix(in_srgb,var(--fx-accent)_14%,var(--bz-surface))]";
const ROW_TICK = "[--fx-row:color-mix(in_srgb,var(--fx-accent)_9%,var(--bz-surface))]";

/** The widest break the window has reached; 0 below 640. Re-renders only when that changes. */
function useBreak(): number {
  const read = () => (typeof window === "undefined" ? 1280 : BREAKS.reduce<number>((at, b) => (window.innerWidth >= b ? b : at), 0));
  const [at, setAt] = React.useState(read);
  React.useEffect(() => {
    const on = () => setAt(read());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return at;
}

/** 1 2 3 … 9 — the ends, the page and its neighbours. */
function pageList(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => keep.add(p));
  if (page >= pages - 2) [pages - 1, pages - 2, pages - 3].forEach((p) => keep.add(p));
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of [...keep].filter((x) => x >= 1 && x <= pages).sort((a, b) => a - b)) {
    if (p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

const CHIP = "flex size-7 shrink-0 items-center justify-center rounded-[8px] border text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-bz-fire disabled:pointer-events-none disabled:opacity-40";
const CHIP_OFF = "border-bz-line-soft text-bz-text-muted hover:border-bz-line hover:bg-bz-paper-warm hover:text-bz-text";
const CHIP_ON = "border-bz-line bg-bz-paper-warm font-semibold text-bz-text";

/**
 * The module's table: a card of 52px rows under a plain grey header. A row opens its record; a tick puts it in the
 * selection; the open row carries the accent edge. Below 640px a row is a card — who, how much, and its state.
 */
export function FxTable<R>({
  rows,
  idOf,
  columns,
  label,
  onOpen,
  current = null,
  selected,
  onSelect,
  rowLabel,
  verb,
  groupOf,
  empty,
  pageSize = 12,
  page: pageProp,
  onPage,
  noun,
  footer,
  keys = true,
  className,
}: FxTableProps<R>) {
  const at = useBreak();
  const card = at < 640;
  const selectable = !!onSelect;
  const picked = selected ?? NONE;

  // ── Pages ──
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const [ownPage, setOwnPage] = React.useState(1);
  const page = Math.min(pages, Math.max(1, pageProp ?? ownPage));
  const setPage = (p: number) => {
    const n = Math.min(pages, Math.max(1, p));
    if (onPage) onPage(n);
    else setOwnPage(n);
  };
  // The owner's page can fall off the end when the rows shrink (a filter, a decided row): tell it where we are.
  React.useEffect(() => {
    if (pageProp !== undefined && pageProp !== page) onPage?.(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageProp, page]);
  const shown = rows.slice((page - 1) * pageSize, page * pageSize);

  // ── The row cursor ──
  const refs = React.useRef(new Map<string, HTMLDivElement>());
  const [cursor, setCursor] = React.useState<string | null>(null);
  const tabStop = shown.some((r) => idOf(r) === cursor) ? cursor : shown[0] ? idOf(shown[0]) : null;
  const pending = React.useRef<"first" | "last" | null>(null);
  const live = React.useRef({ shown, tabStop, idOf, rows, page, pageSize });
  live.current = { shown, tabStop, idOf, rows, page, pageSize };

  // A step past the end of a page turned it: the cursor lands on the row it was heading for.
  React.useEffect(() => {
    const to = pending.current;
    pending.current = null;
    const row = to === "first" ? shown[0] : to === "last" ? shown[shown.length - 1] : undefined;
    if (row) refs.current.get(idOf(row))?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // A record that has just opened brings its row's page up, and the row into view. Only when it opens: after that
  // the reader may turn the pages freely.
  const opened = React.useRef<string | null>(null);
  React.useEffect(() => {
    const fresh = opened.current !== current;
    opened.current = current;
    if (!current) return;
    const l = live.current;
    const i = l.rows.findIndex((r) => l.idOf(r) === current);
    if (i < 0) return;
    const p = Math.floor(i / l.pageSize) + 1;
    if (p === l.page) refs.current.get(current)?.scrollIntoView({ block: "nearest" });
    else if (fresh) setPage(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, page]);

  React.useEffect(() => {
    if (!keys) return;
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const arrow = k === "arrowdown" || k === "arrowup";
      if (!arrow && k !== "j" && k !== "k") return;
      const a = document.activeElement as HTMLElement | null;
      const free = !a || a === document.body;
      // A row answers its own keys; a field is being typed in; an arrow belongs to whatever holds focus.
      if (a?.closest("[data-fx-row]") || (a && (["INPUT", "TEXTAREA", "SELECT"].includes(a.tagName) || a.isContentEditable)) || (arrow && !free)) return;
      if (document.querySelector("[data-bzw-dialog], [data-bzw-popover], [data-fx-sheet]")) return;
      const l = live.current;
      if (!l.tabStop) return;
      e.preventDefault();
      refs.current.get(l.tabStop)?.focus();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [keys]);

  const tick = (id: string, on?: boolean) => {
    if (!onSelect) return;
    const n = new Set(picked);
    if (on ?? !n.has(id)) n.add(id);
    else n.delete(id);
    onSelect(n);
  };
  const move = (i: number, d: 1 | -1) => {
    const next = shown[i + d];
    if (next) return refs.current.get(idOf(next))?.focus();
    if (d === 1 && page < pages) (pending.current = "first"), setPage(page + 1);
    if (d === -1 && page > 1) (pending.current = "last"), setPage(page - 1);
  };
  const onRowKey = (e: React.KeyboardEvent<HTMLDivElement>, row: R, i: number) => {
    // A control inside the row keeps its own keys.
    if (e.target !== e.currentTarget || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "arrowdown" || k === "j") (e.preventDefault(), move(i, 1));
    else if (k === "arrowup" || k === "k") (e.preventDefault(), move(i, -1));
    else if (k === "enter" && onOpen) (e.preventDefault(), onOpen(row));
    else if (k === " " && selectable) (e.preventDefault(), tick(idOf(row)));
  };

  // ── Columns ──
  const cols = columns.filter((c) => !c.hideBelow || at >= c.hideBelow);
  const showVerb = !!verb && at >= 1024;
  const template = [selectable ? "20px" : null, ...cols.map((c) => c.width)].filter(Boolean).join(" ");
  const primary = columns.find((c) => c.role === "primary") ?? columns[0];
  const figure = columns.find((c) => c.role === "figure") ?? columns[columns.length - 1];
  const state = columns.find((c) => c.role === "state");
  const cardTemplate = `${selectable ? "20px " : ""}minmax(0,1fr) auto`;

  const groupSize = new Map<string, number>();
  if (groupOf) for (const r of rows) groupSize.set(groupOf(r).key, (groupSize.get(groupOf(r).key) ?? 0) + 1);

  const shownIds = shown.map(idOf);
  const nTicked = shownIds.filter((id) => picked.has(id)).length;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(rows.length, page * pageSize);
  const range = pages > 1 ? `${first}–${last} of ${rows.length}` : noun ? `${rows.length} ${rows.length === 1 ? noun[0] : noun[1]}` : `${rows.length} of ${rows.length}`;

  if (rows.length === 0) return <section className={cn(PANEL, "overflow-hidden", className)}>{empty}</section>;

  return (
    <section className={cn(PANEL, "min-w-0 overflow-hidden", className)}>
      <div role="table" aria-label={label} aria-rowcount={rows.length}>
        {!card && (
          <div role="row" className="grid h-10 items-center gap-x-4 border-b border-bz-line-soft px-4 text-[12px] text-bz-text-soft" style={{ gridTemplateColumns: template }}>
            {selectable && (
              <span role="columnheader" className="flex items-center">
                <Checkbox on={nTicked > 0 && nTicked === shownIds.length} mixed={nTicked > 0 && nTicked < shownIds.length} onChange={(v) => onSelect?.(new Set(v ? [...picked, ...shownIds] : [...picked].filter((id) => !shownIds.includes(id))))} label="Select all on this page" />
              </span>
            )}
            {cols.map((c) => (
              <span key={c.key} role="columnheader" className={cn("min-w-0 truncate", c.align === "right" && "text-right")}>
                {c.label}
              </span>
            ))}
          </div>
        )}

        {shown.map((row, i) => {
          const id = idOf(row);
          const on = id === current;
          const ticked = picked.has(id);
          const g = groupOf?.(row);
          const headed = g && (i === 0 || groupOf!(shown[i - 1]).key !== g.key);
          const v = showVerb ? verb!(row) : null;
          const box = selectable && (
            <span role="cell" className={cn("flex items-center", card && "pt-0.5")} onClick={(e) => e.stopPropagation()}>
              <Checkbox on={ticked} onChange={(val) => tick(id, val)} label={`Select ${rowLabel?.(row) ?? id}`} tabIndex={-1} />
            </span>
          );
          return (
            <React.Fragment key={id}>
              {headed && (
                <div className={cn("flex h-9 items-center gap-2 border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 text-[12px] font-medium", g.danger ? "text-bz-red" : "text-bz-text-muted")}>
                  {g.label}
                  <span className={cn("font-normal text-bz-text-soft", NUM)}>{groupSize.get(g.key)}</span>
                  {g.right && <span className={cn("ml-auto whitespace-nowrap font-normal text-bz-text-soft", NUM)}>{g.right}</span>}
                </div>
              )}
              <div
                ref={(el) => {
                  if (el) refs.current.set(id, el);
                  else refs.current.delete(id);
                }}
                role="row"
                data-fx-row=""
                tabIndex={id === tabStop ? 0 : -1}
                aria-selected={selectable ? ticked : undefined}
                aria-current={on || undefined}
                onClick={onOpen ? () => onOpen(row) : undefined}
                onFocus={() => setCursor(id)}
                onKeyDown={(e) => onRowKey(e, row, i)}
                className={cn(
                  "group relative grid gap-x-4 border-b border-bz-line-soft bg-[var(--fx-row)] px-4 text-[13px] text-bz-text transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire",
                  card ? "items-start gap-x-3 gap-y-2 py-3" : "min-h-[52px] items-center py-2",
                  onOpen && "cursor-pointer",
                  on ? ROW_ON : ticked ? ROW_TICK : ROW_REST,
                )}
                style={{ gridTemplateColumns: card ? cardTemplate : template }}
              >
                {on && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-[var(--fx-accent)]" />}
                {box}
                {card ? (
                  <>
                    <span role="cell" className="min-w-0">
                      {primary.render(row)}
                    </span>
                    {figure !== primary && (
                      <span role="cell" className="min-w-0 max-w-[46vw] text-right">
                        {figure.render(row)}
                      </span>
                    )}
                    {state && (
                      <span role="cell" className="min-w-0" style={{ gridColumn: selectable ? "2 / -1" : "1 / -1" }}>
                        {state.render(row)}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {cols.map((c) => (
                      <span key={c.key} role="cell" className={cn("min-w-0 truncate", c.align === "right" && "text-right")}>
                        {c.render(row)}
                      </span>
                    ))}
                    {v && (
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pl-12 pr-4 opacity-0 transition-opacity [background:linear-gradient(to_right,transparent,var(--fx-row)_40px)] group-hover:opacity-100 group-focus-visible:opacity-100 has-[:focus-visible]:opacity-100">
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={(e) => (e.stopPropagation(), v.run(e))}
                          className="pointer-events-auto inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text transition-colors hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire"
                        >
                          {v.icon && <v.icon size={12} className="text-bz-text-muted" />}
                          {v.label}
                        </button>
                      </span>
                    )}
                  </>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <footer className="flex min-h-[52px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
        <span className={cn("text-[12px] text-bz-text-soft", NUM)}>{range}</span>
        {footer}
        {pages > 1 && (
          <nav aria-label="Pages" className="ml-auto flex items-center gap-1">
            <button type="button" className={cn(CHIP, CHIP_OFF)} disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
              <ChevronLeft size={14} />
            </button>
            {pageList(page, pages).map((p, i) =>
              p === "gap" ? (
                <span key={`gap-${i}`} aria-hidden className="w-4 text-center text-[12px] text-bz-text-soft">
                  …
                </span>
              ) : (
                <button key={p} type="button" className={cn(CHIP, NUM, p === page ? CHIP_ON : CHIP_OFF)} aria-current={p === page ? "page" : undefined} aria-label={`Page ${p}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ),
            )}
            <button type="button" className={cn(CHIP, CHIP_OFF)} disabled={page === pages} onClick={() => setPage(page + 1)} aria-label="Next page">
              <ChevronRight size={14} />
            </button>
          </nav>
        )}
      </footer>
    </section>
  );
}

/** What a table shows when it has no rows: one sentence and, at most, the way out. */
export function FxEmpty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="m-0 text-[13px] text-bz-text-muted">{title}</p>
      {children && <div className="flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

// ── Bulk ────────────────────────────────────────────────────────────────────

export type FxBulkAction = {
  label: string;
  icon?: IconType;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  /** The one that commits — the dark/lime button. */
  primary?: boolean;
  /** The action needs one value first (assign to a rep): the button opens a picker and `onPick` gets the choice. */
  choose?: { options: SelectOption[]; placeholder?: string; onPick: (value: string) => void };
};

/**
 * Ticked rows are a mode: a glass bar floats at the bottom of the page with what can be done to them. Place it in
 * the page's own `relative` body (not in the scrolling part). `note` reports the last run — "2 approved · 1 skipped".
 */
export function FxBulk({ count, actions, onClear, note }: { count: number; actions: FxBulkAction[]; onClear: () => void; note?: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div role="toolbar" aria-label="Selected rows" className="pointer-events-auto flex max-w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] border border-bz-line-soft bg-[var(--fx-glass)] py-2 pl-4 pr-2 shadow-[var(--bz-shadow-panel)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
        <span className={cn("whitespace-nowrap text-[13px] font-semibold text-bz-text", NUM)}>{count} selected</span>
        {note && <span className={cn("whitespace-nowrap text-[12px] text-bz-amber-ink", NUM)}>{note}</span>}
        <span aria-hidden className="h-4 w-px bg-bz-line" />
        <div className="flex flex-wrap items-center gap-1.5">
          {actions.map((a) =>
            a.choose ? (
              <Select key={a.label} trigger="plain" title={a.title} disabled={a.disabled} value={null} options={a.choose.options} placeholder={a.choose.placeholder} width={240} onChange={a.choose.onPick}>
                <span className={cn(HEAD_BTN, "h-8")}>
                  {a.icon && <a.icon size={13} />}
                  {a.label}
                  <ChevronDown size={12} className="text-bz-text-soft" />
                </span>
              </Select>
            ) : (
              <button key={a.label} type="button" title={a.title} disabled={a.disabled} onClick={a.onClick} className={a.primary ? cn(BTN, "h-8 px-3 text-[12.5px]") : cn(HEAD_BTN, "h-8 disabled:pointer-events-none disabled:opacity-45")}>
                {a.icon && <a.icon size={13} />}
                {a.label}
              </button>
            ),
          )}
          <button type="button" onClick={onClear} className="inline-flex h-8 items-center rounded-bz-md px-2.5 text-[12.5px] font-medium text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sheet ───────────────────────────────────────────────────────────────────

type SheetBox = { x: number; y: number; w: number; h: number };
/** Where the reader last left the sheet, and how big — kept for the session, so the next record opens in the same place. */
const sheetMemo: { box: SheetBox | null } = { box: null };
const SHEET_MIN = { w: 420, h: 300 };
/** How much of the sheet must stay on screen, so it can always be grabbed again. */
const SHEET_KEEP = 120;

type SheetEdge = "l" | "r" | "b" | "bl" | "br";
const EDGE: Record<SheetEdge, string> = {
  l: "inset-y-3 left-0 w-1.5 cursor-ew-resize",
  r: "inset-y-3 right-0 w-1.5 cursor-ew-resize",
  b: "inset-x-3 bottom-0 h-1.5 cursor-ns-resize",
  bl: "bottom-0 left-0 size-3.5 cursor-nesw-resize",
  br: "bottom-0 right-0 size-3.5 cursor-nwse-resize",
};

/**
 * How a record opens in this language: a WINDOW floating over the page — not a docked column and not a modal.
 * It opens at the right of the page; the grip along its top drags it anywhere in the app (over the page head and
 * the top bar too), any edge or corner resizes it, and a double-click on the grip puts it back. The list behind
 * stays live: pick another row and the window shows it. Where it was left, and its size, are kept for the session.
 * `guard` (a form with unsaved work) makes it modal: a scrim, and neither Esc nor the scrim closes it.
 * Below 768px it is simply full-screen.
 */
export function FxSheet({ onClose, wide, guard, label, children }: { onClose: () => void; /** ~880px, for a form or a record read at length. */ wide?: boolean; guard?: boolean; label?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const anchor = React.useRef<HTMLDivElement>(null);
  const live = React.useRef({ onClose, guard });
  live.current = { onClose, guard };
  /** The page body the sheet belongs to — where it docks when it has not been moved. */
  const [host, setHost] = React.useState<{ left: number; top: number; right: number; bottom: number } | null>(null);
  const [view, setView] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  const [box, setBoxState] = React.useState<SheetBox | null>(sheetMemo.box);
  const [moving, setMoving] = React.useState(false);
  const setBox = (b: SheetBox | null) => ((sheetMemo.box = b), setBoxState(b));

  React.useLayoutEffect(() => {
    const el = anchor.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setHost({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
      setView({ w: window.innerWidth, h: window.innerHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => (ro.disconnect(), window.removeEventListener("resize", measure));
  }, []);

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || live.current.guard) return;
      // A menu, a dialog or a field being edited closes first; the sheet waits for the next Esc.
      if (document.querySelector("[data-bzw-dialog], [data-bzw-popover]") || (e.target as Element | null)?.closest?.("[data-bzw-editing]")) return;
      live.current.onClose();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  // The sheet takes focus as it opens (unless a field inside already did) and hands it back to the row it came from.
  React.useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const p = ref.current;
      if (p && !p.contains(document.activeElement)) p.focus({ preventScroll: true });
    }, 0);
    return () => {
      window.clearTimeout(t);
      window.setTimeout(() => {
        const a = document.activeElement;
        if (opener && opener !== document.body && opener.isConnected && (!a || a === document.body)) opener.focus({ preventScroll: true });
      }, 0);
    };
  }, []);

  const phone = view.w < 768;
  const want = wide ? 880 : 640;
  // Docked: at the right of the page body, 12px in from its edges.
  const home: SheetBox | null = host && { w: Math.max(320, Math.min(want, host.right - host.left - 24)), h: Math.max(SHEET_MIN.h, host.bottom - host.top - 24), x: 0, y: host.top + 12 };
  if (home && host) home.x = host.right - 12 - home.w;
  const clamp = (b: SheetBox): SheetBox => {
    const w = Math.max(SHEET_MIN.w, Math.min(b.w, view.w - 16));
    const h = Math.max(SHEET_MIN.h, Math.min(b.h, view.h - 16));
    return { w, h, x: Math.max(SHEET_KEEP - w, Math.min(b.x, view.w - SHEET_KEEP)), y: Math.max(4, Math.min(b.y, view.h - 44)) };
  };
  // A moved sheet keeps its place and size; a record that asks for the wide sheet widens it (leftwards) if it is narrower.
  const cur = box ? clamp(wide && box.w < want ? { ...box, w: Math.min(want, view.w - 16), x: box.x - (Math.min(want, view.w - 16) - box.w) } : box) : home;

  const track = (e: React.PointerEvent, to: (dx: number, dy: number, from: SheetBox) => SheetBox) => {
    if (e.button !== 0 || !cur) return;
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY, from: cur };
    setMoving(true);
    const move = (m: PointerEvent) => setBox(clamp(to(m.clientX - start.x, m.clientY - start.y, start.from)));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setMoving(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const drag = (e: React.PointerEvent) => track(e, (dx, dy, f) => ({ ...f, x: f.x + dx, y: f.y + dy }));
  const resize = (edge: SheetEdge) => (e: React.PointerEvent) =>
    track(e, (dx, dy, f) => {
      const b = { ...f };
      if (edge.includes("l")) {
        b.w = Math.max(SHEET_MIN.w, f.w - dx);
        b.x = f.x + (f.w - b.w);
      }
      if (edge.includes("r")) b.w = Math.max(SHEET_MIN.w, f.w + dx);
      if (edge.includes("b")) b.h = Math.max(SHEET_MIN.h, f.h + dy);
      return b;
    });

  return (
    <>
      {/* Marks the page body: the sheet itself is drawn at the frame's top layer so it can go anywhere. */}
      <div ref={anchor} aria-hidden className="pointer-events-none absolute inset-0" />
      <Portal>
        <div className={FX_VARS}>
          {guard && <div aria-hidden className="fixed inset-0 z-[1000] bg-bz-section-b/60 animate-in fade-in duration-150" />}
          {cur && (
            <div
              ref={ref}
              role="dialog"
              aria-label={label}
              tabIndex={-1}
              data-fx-sheet=""
              style={phone ? undefined : { left: cur.x, top: cur.y, width: cur.w, height: cur.h }}
              className={cn(
                "fixed z-[1001] flex flex-col overflow-hidden bg-bz-surface text-bz-text outline-none animate-in fade-in",
                phone ? "inset-0" : "rounded-[14px] border shadow-[var(--bz-shadow-panel)]",
                !phone && (moving ? "select-none border-bz-line" : "border-bz-line-soft"),
                !phone && !box && "slide-in-from-right-4",
              )}
            >
              {!phone && (
                <div onPointerDown={drag} onDoubleClick={() => setBox(null)} title={box ? "Drag to move · double-click to put it back" : "Drag to move"} className={cn("group flex h-4 shrink-0 touch-none items-center justify-center", moving ? "cursor-grabbing" : "cursor-grab")}>
                  <span className={cn("h-1 w-10 rounded-bz-pill transition-colors", moving ? "bg-bz-text-soft" : "bg-bz-line group-hover:bg-bz-text-soft")} />
                </div>
              )}
              {/* A hosted record panel draws a docked edge or its own shadow; the sheet already is both. */}
              <div className="min-h-0 flex-1 [&>section]:border-l-0 [&>section]:shadow-none">{children}</div>
              {!phone && (Object.keys(EDGE) as SheetEdge[]).map((k) => <div key={k} onPointerDown={resize(k)} aria-hidden className={cn("absolute z-10 touch-none", EDGE[k])} />)}
              {!phone && (
                <svg aria-hidden viewBox="0 0 10 10" className="pointer-events-none absolute bottom-1 right-1 size-2.5 text-bz-text-soft">
                  <path d="M9 3 3 9M9 6.5 6.5 9" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
            </div>
          )}
        </div>
      </Portal>
    </>
  );
}
