import * as React from "react";
import { ChevronDown, ChevronRight, Lock, Plus, RotateCcw, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { Checkbox, LABEL, NUM, PLAIN_BTN, Select, SkeletonRows } from "../../sales/bzw";
import type { SelectOption } from "../../sales/bzw";
import { TODAY } from "../../sales/orders";
import { fmtDay, isIsoDay, parseNum, stepDate } from "./util";

// ════════════════════════════════════════════════════════════════════════════
// GRID — the one editable table of the masters (spec §6.3 #1, `<bzw-grid>`)
//
// The composer's line table, promoted: unit conversions, barcodes, variants,
// dated rates and every small-master table are this one component, so a user
// who has typed into one knows them all.
//
//   • WAI-ARIA grid keys: ONE Tab stop (roving tabindex); arrows move; Enter /
//     F2 edit; typing starts an edit and replaces; Esc cancels the cell and a
//     second Esc leaves the grid; Tab / ⇧Tab move while editing; Ctrl+D (or
//     Alt+↓) fills down; Delete marks a saved row for removal, drops a new one;
//     ⇧Space selects the row.
//   • Modes: `staged` (every cell edit goes to the host's dirty set — a page
//     or a sheet saves it) · `row-commit` (a row's edits are held until Enter
//     commits the row, or the cursor leaves it — tier-3 masters) · `readonly`.
//   • The waiting add row (`ghost`) commits on Enter in its last cell and a
//     fresh one takes the cursor.
//   • A row's refusal is a SIBLING line under the row, never a cell of it
//     (bzw trap 20), with a red edge on the row.
//   • Tracks come from `--bzw-grid-cols` — the property the Angular port sets.
// ════════════════════════════════════════════════════════════════════════════

export type GridMode = "staged" | "row-commit" | "readonly";
export type CellValue = string | number | null;
export type GridRowBase = { id: string };

export type GridColumn<R> = {
  /** The row field this column reads and writes. */
  key: string;
  label: React.ReactNode;
  /** A grid track: "120px", "minmax(0,1fr)". */
  width: string;
  kind?: "text" | "number" | "date" | "select" | "readonly";
  align?: "right";
  options?: SelectOption[] | ((r: R) => SelectOption[]);
  /** The select panel's width. */
  menuWidth?: number;
  placeholder?: string;
  /** The read face. Defaults to the value (a date as "25 Sep 2026", a number through `format`). */
  render?: (r: R) => React.ReactNode;
  format?: (v: CellValue) => string;
  /** The value is not this row's own (inherited from a template) — soft ink. */
  muted?: (r: R) => boolean;
  /** This one cell can't change on this row; the whole-row lock is `RowState.locked`. */
  locked?: (r: R) => boolean;
  title?: (r: R) => string | undefined;
};

export type RowState = {
  isNew?: boolean;
  dirty?: boolean;
  /** Struck through until Save. */
  removed?: boolean;
  /** true, or the one-line reason ("Used by 12 documents — add a new dated rate instead."). */
  locked?: boolean | string;
  /** The host's or the server's sentence for this row, shown verbatim under it. */
  error?: string | null;
};

export type GridGroup = {
  key: string;
  label: React.ReactNode;
  rowIds: string[];
  /** A server count when the band holds more than the rows fetched. */
  count?: number;
  /** Starts collapsed (Available, Archived). */
  collapsed?: boolean;
  /** Shown open whatever the reader toggled — a search opens the bands it matches. */
  forceOpen?: boolean;
  /** A red band (Negative stock). */
  alarm?: boolean;
  /** A quiet qualifier after the count ("not used by anything"). */
  note?: string;
  /** The band's own control — a group edit ("Set price"). */
  right?: React.ReactNode;
};

export type GridHandle = {
  /** Put the cursor on a cell — optionally editing it. Works for a row the host has just added. */
  focusCell: (rowId: string, colKey: string, edit?: boolean) => void;
  focusGhost: (colKey?: string) => void;
};

export type GridProps<R extends GridRowBase> = {
  columns: GridColumn<R>[];
  rows: R[];
  ariaLabel: string;
  mode?: GridMode;
  rowState?: (r: R) => RowState;
  /** staged: one cell changed. */
  onCell?: (id: string, key: string, value: CellValue) => void;
  /** row-commit: the row's held edits; answer a refusal sentence (the row reverts) or null. */
  onCommitRow?: (id: string, patch: Record<string, CellValue>) => string | null;
  /** Delete / ×: a saved row toggles its removal, a new one is dropped — the host decides. */
  onRemove?: (id: string) => void;
  /**
   * The waiting add row. `onAdd` answers a refusal sentence (the typed values stay) or null; `{ text, col }`
   * also names the cell the sentence is about, and the cursor goes there to fix it.
   */
  ghost?: { blank: () => R; label: string; position?: "top" | "bottom"; onAdd: (row: R) => GhostRefusal };
  /** readonly rows that open something (a tier-2 sheet): Enter or a click. */
  onOpenRow?: (r: R) => void;
  /** Single keys on a focused row whose cell isn't typed into — `R` opens the rate popover. */
  rowKeys?: Record<string, (r: R) => void>;
  /** A trailing control per row (the hub's ⋯). */
  rowAction?: (r: R) => React.ReactNode;
  selectable?: boolean;
  selected?: Set<string>;
  onSelect?: (ids: Set<string>) => void;
  /** The row whose record is open beside the grid (a hub sheet) — the desk's lime edge and wash. */
  current?: string | null;
  groups?: GridGroup[];
  foot?: React.ReactNode;
  /** One line under the add row when there are no rows ("No conversions yet."). */
  empty?: string;
  loading?: boolean;
  loadingText?: string;
  /** Where the sticky head stops, inside its scroller. */
  stickyTop?: number;
  /** Below md the grid scrolls sideways inside itself rather than squeezing its columns. */
  minWidth?: number;
  /** Scroll sideways at every width (a wide grid in a 480px sheet). The head then stops being sticky. */
  scrollX?: boolean;
  /** Drop the grid's own border — it sits in a card that already draws one. */
  bare?: boolean;
  gridRef?: React.Ref<GridHandle>;
  today?: string;
  className?: string;
  /**
   * A hierarchy (departments): the FIRST column indents by depth and carries a caret; on that column
   * → opens a folded branch and ← folds an open one (the treegrid keys). The host passes only the rows
   * of open branches, in tree order.
   */
  tree?: GridTree<R>;
};

export type GhostRefusal = string | { text: string; col?: string } | null;

export type GridTree<R> = { depth: (r: R) => number; hasChildren: (r: R) => boolean; open: (r: R) => boolean; onToggle: (r: R) => void };

type NavRow<R> = { key: string; kind: "group"; group: GridGroup } | { key: string; kind: "row"; row: R } | { key: "ghost"; kind: "ghost" };
type Editing = { nav: string; col: string; draft: string; token: number; selectAll: boolean };

// The composer's cell (OrderComposer.tsx:1090): transparent until hovered, a border while it is typed in.
const FACE = "flex h-8 min-w-0 items-center rounded-bz-sm border border-transparent px-2 text-[12.5px] text-bz-text outline-none";
const RING = "focus:outline-2 focus:-outline-offset-2 focus:outline-bz-fire";
const INPUT_CELL = "h-8 w-full min-w-0 rounded-bz-sm border border-bz-text-muted bg-bz-surface px-2 text-[12.5px] text-bz-text outline-none";

const valueOf = (r: object, key: string): CellValue => {
  const v = (r as Record<string, unknown>)[key];
  return typeof v === "number" || typeof v === "string" ? v : null;
};
const asText = (v: CellValue) => (v === null || v === undefined ? "" : String(v));
const labelText = (c: { label: React.ReactNode; key: string }) => (typeof c.label === "string" ? c.label : c.key);
const printable = (e: React.KeyboardEvent) => e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

function parseCell(kind: string, raw: string, before: CellValue): CellValue {
  if (kind === "number") return parseNum(raw);
  if (kind === "date") {
    const t = raw.trim();
    if (t === "") return null;
    if (isIsoDay(t)) return t;
    const ms = Date.parse(t);
    if (Number.isNaN(ms)) return before;
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return raw;
}

export function Grid<R extends GridRowBase>(props: GridProps<R>) {
  const {
    columns,
    rows,
    ariaLabel,
    mode = "staged",
    rowState,
    onCell,
    onCommitRow,
    onRemove,
    ghost,
    onOpenRow,
    rowKeys,
    rowAction,
    selectable,
    selected,
    onSelect,
    current,
    groups,
    foot,
    empty,
    loading,
    loadingText = "Loading…",
    stickyTop = 0,
    minWidth = 560,
    scrollX,
    bare,
    gridRef,
    today = TODAY,
    className,
    tree,
  } = props;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  const [active, setActive] = React.useState<{ nav: string; col: string } | null>(null);
  const editRef = React.useRef<Editing | null>(null);
  const tokenRef = React.useRef(0);
  const focusedToken = React.useRef(-1);
  // Held edits of ONE row in row-commit mode, and the add row's draft. Refs, not state: an Enter that
  // commits a cell and then the row reads both in the same handler.
  const bufferRef = React.useRef<{ id: string; patch: Record<string, CellValue> } | null>(null);
  const ghostRef = React.useRef<R | null>(ghost ? ghost.blank() : null);
  // A grid first drawn without an add row (read only, or reused by a host) gets one when `ghost` arrives.
  if (ghost && !ghostRef.current) ghostRef.current = ghost.blank();
  const [ghostErr, setGhostErr] = React.useState<string | null>(null);
  const [refused, setRefused] = React.useState<Record<string, string>>({});
  const [toggled, setToggled] = React.useState<Set<string>>(new Set());
  // `fallback`: where the cursor goes if the cell is gone after the render (its row was dropped).
  const pending = React.useRef<{ nav: string; col: string; edit?: boolean; tries: number; fallback?: { nav: string; col: string } } | null>(null);
  const selectOpen = React.useRef(false);

  const setEditing = (e: Editing | null) => {
    editRef.current = e;
    force();
  };
  const editing = editRef.current;

  const byId = React.useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const isShut = (g: GridGroup) => !g.forceOpen && (toggled.has(g.key) ? !g.collapsed : !!g.collapsed);
  const ghostAt = ghost ? ghost.position ?? "bottom" : null;

  const nav: NavRow<R>[] = [];
  if (ghostAt === "top") nav.push({ key: "ghost", kind: "ghost" });
  if (groups) {
    for (const g of groups) {
      nav.push({ key: `g:${g.key}`, kind: "group", group: g });
      if (!isShut(g)) for (const id of g.rowIds) {
        const r = byId.get(id);
        if (r) nav.push({ key: `r:${id}`, kind: "row", row: r });
      }
    }
  } else rows.forEach((r) => nav.push({ key: `r:${r.id}`, kind: "row", row: r }));
  if (ghostAt === "bottom") nav.push({ key: "ghost", kind: "ghost" });

  const stateOf = (r: R): RowState => rowState?.(r) ?? {};
  const viewOf = (n: NavRow<R>): R | null => {
    if (n.kind === "ghost") return ghostRef.current;
    if (n.kind !== "row") return null;
    const b = bufferRef.current;
    return b && b.id === n.row.id ? ({ ...n.row, ...b.patch } as R) : n.row;
  };
  const kindOf = (c: GridColumn<R>) => c.kind ?? "text";
  const canEdit = (n: NavRow<R>, c: GridColumn<R>) => {
    if (mode === "readonly" || kindOf(c) === "readonly") return false;
    if (n.kind === "ghost") return true;
    if (n.kind !== "row") return false;
    const st = stateOf(n.row);
    return !st.locked && !st.removed && !c.locked?.(n.row);
  };
  const editableCols = (n: NavRow<R>) => columns.filter((c) => canEdit(n, c));
  const colIndex = (key: string) => columns.findIndex((c) => c.key === key);
  const navIndex = (key: string) => nav.findIndex((n) => n.key === key);

  const firstCell = nav.length ? { nav: nav[0].key, col: nav[0].kind === "group" ? "" : columns[0]?.key ?? "" } : null;
  const tab = active && navIndex(active.nav) >= 0 ? active : firstCell;

  const cellEl = (navKey: string, col: string) => {
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-cell="${CSS.escape(`${navKey}|${col}`)}"]`);
    return el?.dataset.focus === "inner" ? el.querySelector<HTMLElement>("button") : el;
  };

  // Keyboard moves and newly added rows focus AFTER the render that draws them.
  React.useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    const el = cellEl(p.nav, p.col);
    if (!el) {
      if (p.fallback && cellEl(p.fallback.nav, p.fallback.col)) {
        pending.current = null;
        setActive(p.fallback);
        cellEl(p.fallback.nav, p.fallback.col)?.focus();
        return;
      }
      if (++p.tries > 3) pending.current = null;
      return;
    }
    pending.current = null;
    if (p.edit) startEdit(p.nav, p.col);
    else el.focus();
  });

  const go = (navKey: string, col: string, edit?: boolean) => {
    setActive({ nav: navKey, col });
    pending.current = { nav: navKey, col, edit, tries: 0 };
    force();
  };

  // ── writing ───────────────────────────────────────────────────────────────

  const flushRow = () => {
    const b = bufferRef.current;
    if (!b) return;
    bufferRef.current = null;
    const err = onCommitRow?.(b.id, b.patch) ?? null;
    if (err) setRefused((m) => ({ ...m, [b.id]: err }));
    force();
  };

  const write = (navKey: string, col: string, value: CellValue) => {
    if (navKey === "ghost") {
      if (ghostRef.current) ghostRef.current = { ...ghostRef.current, [col]: value } as R;
      setGhostErr(null);
      force();
      return;
    }
    const id = navKey.slice(2);
    const row = byId.get(id);
    if (!row) return;
    if (mode === "row-commit") {
      const b = bufferRef.current;
      if (b && b.id !== id) flushRow();
      const cur = bufferRef.current?.id === id ? bufferRef.current.patch : {};
      if (value === valueOf(row, col) && !(col in cur)) return;
      bufferRef.current = { id, patch: { ...cur, [col]: value } };
      setRefused((m) => {
        if (!(id in m)) return m;
        const { [id]: _drop, ...rest } = m;
        return rest;
      });
      force();
      return;
    }
    if (value !== valueOf(row, col)) onCell?.(id, col, value);
  };

  const addGhost = () => {
    if (!ghost || !ghostRef.current) return;
    const typed = columns.some((c) => kindOf(c) !== "readonly" && asText(valueOf(ghostRef.current!, c.key)).trim() !== "");
    if (!typed) return;
    const err = ghost.onAdd(ghostRef.current);
    if (err) {
      setGhostErr(typeof err === "string" ? err : err.text);
      // The cursor goes to the cell the refusal is about ("Code PC is already used by …" → Code), editing it.
      const col = typeof err === "string" ? null : columns.find((c) => c.key === err.col);
      if (col) go("ghost", col.key, kindOf(col) !== "select");
      return;
    }
    ghostRef.current = ghost.blank();
    setGhostErr(null);
    const first = columns.find((c) => kindOf(c) !== "readonly");
    if (first) go("ghost", first.key, kindOf(first) !== "select");
  };

  // ── editing ───────────────────────────────────────────────────────────────

  const startEdit = (navKey: string, col: string, seed?: string) => {
    const n = nav.find((x) => x.key === navKey);
    const c = columns.find((x) => x.key === col);
    if (!n || !c || !canEdit(n, c)) return false;
    setActive({ nav: navKey, col });
    if (kindOf(c) === "select") {
      const el = cellEl(navKey, col);
      if (el) {
        selectOpen.current = true;
        el.click();
      }
      return true;
    }
    const v = viewOf(n);
    setEditing({ nav: navKey, col, draft: seed ?? asText(v ? valueOf(v, col) : null), token: ++tokenRef.current, selectAll: seed === undefined });
    return true;
  };

  /** then: where the cursor goes after the value is written. */
  const commitEdit = (then: "stay" | "down" | "up" | "next" | "prev" | "none") => {
    const ed = editRef.current;
    if (!ed) return;
    editRef.current = null;
    const c = columns.find((x) => x.key === ed.col);
    const n = nav.find((x) => x.key === ed.nav);
    if (c && n) {
      const v = viewOf(n);
      const before = v ? valueOf(v, ed.col) : null;
      write(ed.nav, ed.col, parseCell(kindOf(c), ed.draft, before));
    }
    force();
    if (then === "none") return;
    if (then === "stay") return go(ed.nav, ed.col);
    if (then === "down" || then === "up") return moveRow(ed.nav, ed.col, then === "down" ? 1 : -1);
    const next = walkEditable(ed.nav, ed.col, then === "next" ? 1 : -1);
    if (next) go(next.nav, next.col, true);
    else go(ed.nav, ed.col);
  };

  const cancelEdit = () => {
    const ed = editRef.current;
    if (!ed) return;
    editRef.current = null;
    go(ed.nav, ed.col);
  };

  // Row-major walk over the cells that can be typed into — Tab while editing, Enter across the add row.
  const walkEditable = (navKey: string, col: string, dir: 1 | -1) => {
    const cells: { nav: string; col: string }[] = [];
    for (const n of nav) if (n.kind !== "group") for (const c of editableCols(n)) cells.push({ nav: n.key, col: c.key });
    const i = cells.findIndex((x) => x.nav === navKey && x.col === col);
    return i < 0 ? null : cells[i + dir] ?? null;
  };

  const moveRow = (navKey: string, col: string, d: 1 | -1) => {
    const i = navIndex(navKey);
    const n = nav[i + d];
    if (!n) return go(navKey, col);
    go(n.key, n.kind === "group" ? "" : col || columns[0].key);
  };

  const fillDown = (navKey: string, col: string) => {
    const c = columns.find((x) => x.key === col);
    if (!c || kindOf(c) === "readonly") return;
    const data = nav.filter((n): n is Extract<NavRow<R>, { kind: "row" }> => n.kind === "row");
    const here = nav.find((n) => n.key === navKey);
    if (!here) return;
    const picked = mode === "staged" && selectable && selected && here.kind === "row" && selected.has(here.row.id) && selected.size > 1 ? data.filter((n) => selected.has(n.row.id)) : null;
    if (picked) {
      const v = valueOf(viewOf(picked[0])!, col);
      picked.slice(1).forEach((n) => canEdit(n, c) && write(n.key, col, v));
      return;
    }
    const above = [...nav.slice(0, navIndex(navKey))].reverse().find((n) => n.kind === "row");
    if (above && canEdit(here, c)) write(navKey, col, valueOf(viewOf(above)!, col));
  };

  React.useImperativeHandle(
    gridRef,
    () => ({
      focusCell: (rowId, colKey, edit) => go(`r:${rowId}`, colKey, edit),
      focusGhost: (colKey) => {
        const c = colKey ? columns.find((x) => x.key === colKey) : columns.find((x) => kindOf(x) !== "readonly");
        if (c) go("ghost", c.key, kindOf(c) !== "select");
      },
    }),
  );

  // ── keys ──────────────────────────────────────────────────────────────────

  const onEditKey = (e: React.KeyboardEvent<HTMLInputElement>, c: GridColumn<R>) => {
    const ed = editRef.current;
    if (!ed) return;
    const stop = () => (e.preventDefault(), e.stopPropagation());
    if (kindOf(c) === "date" && (e.key === "t" || e.key === "T" || e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey) {
      const next = stepDate(isIsoDay(ed.draft) ? ed.draft : null, e.key, today);
      if (next) (stop(), setEditing({ ...ed, draft: next, selectAll: false }));
      return;
    }
    if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "Enter")) {
      // The page's ⌘S / the sheet's ⌘↵ must save what is being typed too.
      commitEdit("none");
      return;
    }
    if (e.key === "Escape") return stop(), cancelEdit();
    if (e.key === "Enter") {
      stop();
      if (ed.nav === "ghost") {
        const cols = editableCols({ key: "ghost", kind: "ghost" });
        const last = cols[cols.length - 1]?.key === ed.col;
        commitEdit(last ? "stay" : "next");
        if (last) addGhost();
        return;
      }
      if (mode === "row-commit") {
        commitEdit("stay");
        flushRow();
        return;
      }
      return commitEdit("down");
    }
    if (e.key === "Tab") {
      const next = walkEditable(ed.nav, ed.col, e.shiftKey ? -1 : 1);
      if (next) return stop(), commitEdit(e.shiftKey ? "prev" : "next");
      commitEdit("none"); // no cell left: let Tab leave the grid
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") return stop(), commitEdit(e.key === "ArrowDown" ? "down" : "up");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Keys from a portal (a Select's search box) bubble through the React tree; they are not ours.
    if (!rootRef.current?.contains(e.target as Node)) return;
    if (editRef.current) return;
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-cell]");
    if (!cell) return;
    const [navKey, col] = (cell.dataset.cell ?? "|").split("|");
    const n = nav.find((x) => x.key === navKey);
    if (!n) return;
    const stop = () => (e.preventDefault(), e.stopPropagation());
    const ci = colIndex(col);

    if (n.kind === "group") {
      const shut = isShut(n.group);
      const toggle = () => setToggled((s) => { const t = new Set(s); t.has(n.group.key) ? t.delete(n.group.key) : t.add(n.group.key); return t; });
      if (e.key === "ArrowDown" || e.key === "ArrowUp") return stop(), moveRow(navKey, active?.col && active.col !== "" ? active.col : columns[0].key, e.key === "ArrowDown" ? 1 : -1);
      if (e.key === "Enter" || e.key === " " || (e.key === "ArrowRight" && shut) || (e.key === "ArrowLeft" && !shut)) return stop(), toggle();
      return;
    }

    const c = columns[ci];
    const row = n.kind === "row" ? n.row : null;
    if (tree && row && ci === 0 && tree.hasChildren(row) && ((e.key === "ArrowRight" && !tree.open(row)) || (e.key === "ArrowLeft" && tree.open(row)))) return stop(), tree.onToggle(row);
    if (e.key === "ArrowDown" && e.altKey) return stop(), fillDown(navKey, col);
    if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) return stop(), fillDown(navKey, col);
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        return stop(), moveRow(navKey, col, e.key === "ArrowDown" ? 1 : -1);
      case "ArrowRight":
        return stop(), go(navKey, columns[Math.min(columns.length - 1, ci + 1)].key);
      case "ArrowLeft":
        return stop(), go(navKey, columns[Math.max(0, ci - 1)].key);
      case "Home":
        return stop(), go(navKey, columns[0].key);
      case "End":
        return stop(), go(navKey, columns[columns.length - 1].key);
      case "Enter":
      case "F2":
        stop();
        if (c && startEdit(navKey, col)) return;
        if (row && bufferRef.current?.id === row.id) return flushRow();
        if (row && onOpenRow && e.key === "Enter") onOpenRow(row);
        return;
      case "Escape":
        if (row && bufferRef.current?.id === row.id) {
          stop();
          bufferRef.current = null;
          return force();
        }
        // A record open in a sheet BESIDE the grid (a hub row's sheet) is what Esc closes — and the
        // cursor stays on its row, ready for ↑ ↓. Blurring first cost a second Esc and dropped focus
        // on <body>.
        {
          const sheet = [...document.querySelectorAll("[data-bzw-sheet]")].pop();
          if (sheet && !sheet.contains(e.target as Node)) return;
        }
        stop();
        // The second Escape: out of the grid, so the next one reaches the page or the sheet.
        return (e.target as HTMLElement).blur();
      case "Delete":
        if (n.kind === "ghost") {
          stop();
          ghostRef.current = ghost?.blank() ?? null;
          setGhostErr(null);
          return force();
        }
        if (row && onRemove && mode !== "readonly" && !stateOf(row).locked) {
          stop();
          const i = navIndex(navKey);
          const near = nav[i + 1] ?? nav[i - 1];
          onRemove(row.id);
          // A saved row stays (struck through); a new one is dropped and the cursor moves to its neighbour.
          pending.current = { nav: navKey, col, tries: 0, fallback: near ? { nav: near.key, col: near.kind === "group" ? "" : col } : undefined };
          return force();
        }
        return;
    }
    if (e.key === " " && e.shiftKey && row && selectable && onSelect) {
      stop();
      const s = new Set(selected ?? []);
      s.has(row.id) ? s.delete(row.id) : s.add(row.id);
      return onSelect(s);
    }
    if (printable(e) && c) {
      if (canEdit(n, c) && kindOf(c) !== "select") return stop(), startEdit(navKey, col, e.key);
      const fn = row && rowKeys?.[e.key.toLowerCase()];
      if (fn) return stop(), fn(row!);
    }
  };

  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!rootRef.current?.contains(e.target as Node)) return;
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-cell]");
    if (!cell) return;
    const [navKey, col] = (cell.dataset.cell ?? "|").split("|");
    const b = bufferRef.current;
    if (b && navKey !== `r:${b.id}`) flushRow();
    if (!active || active.nav !== navKey || active.col !== col) setActive({ nav: navKey, col });
  };

  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const to = e.relatedTarget as Node | null;
    if (selectOpen.current || (to && rootRef.current?.contains(to))) return;
    flushRow();
  };

  // ── drawing ───────────────────────────────────────────────────────────────

  const hasAct = mode !== "readonly" || !!rowAction;
  const tracks = [selectable ? "20px" : null, ...columns.map((c) => c.width), hasAct ? (rowAction ? "56px" : "32px") : null].filter(Boolean).join(" ");
  const dataRows = nav.filter((n) => n.kind === "row") as Extract<NavRow<R>, { kind: "row" }>[];
  const allSel = selectable && dataRows.length > 0 && dataRows.every((n) => selected?.has(n.row.id));
  const someSel = selectable && dataRows.some((n) => selected?.has(n.row.id));
  const setMany = (ids: string[], on: boolean) => {
    const s = new Set(selected ?? []);
    ids.forEach((id) => (on ? s.add(id) : s.delete(id)));
    onSelect?.(s);
  };

  const cell = (n: NavRow<R>, v: R, c: GridColumn<R>, st: RowState) => {
    const key = `${n.key}|${c.key}`;
    const isTab = !!tab && tab.nav === n.key && tab.col === c.key;
    const kind = kindOf(c);
    const right = c.align === "right" || kind === "number";
    const editable = canEdit(n, c);
    const raw = valueOf(v, c.key);
    const ed = editing && editing.nav === n.key && editing.col === c.key ? editing : null;
    const soft = (n.kind === "row" && c.muted?.(v)) || st.removed;
    const strike = st.removed && "line-through decoration-bz-text-soft";
    const opts = typeof c.options === "function" ? c.options(v) : c.options ?? [];
    const placeholder = n.kind === "ghost" && c === columns.find((x) => kindOf(x) !== "readonly") ? ghost?.label : c.placeholder;
    const shown = c.render && (n.kind === "row" || raw !== null) ? c.render(v) : kind === "date" ? fmtDay(asText(raw)) : kind === "select" ? opts.find((o) => o.value === raw)?.label ?? asText(raw) : c.format && raw !== null ? c.format(raw) : asText(raw);
    const empty = raw === null || raw === "";
    // A derived / read-only figure has nothing to say about a row that does not exist yet.
    if (n.kind === "ghost" && kind === "readonly") return <span key={key} role="gridcell" aria-hidden />;
    const treeRow = tree && n.kind === "row" && c === columns[0] ? n.row : null;
    const indent = treeRow ? tree!.depth(treeRow) * 16 : 0;
    const caret = treeRow ? (
      tree!.hasChildren(treeRow) ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label={tree!.open(treeRow) ? "Fold" : "Open"}
          title={tree!.open(treeRow) ? "Fold (←)" : "Open (→)"}
          onClick={(e) => (e.stopPropagation(), tree!.onToggle(treeRow))}
          className={cn(PLAIN_BTN, "flex size-4 shrink-0 items-center justify-center")}
        >
          {tree!.open(treeRow) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      ) : (
        <span aria-hidden className="size-4 shrink-0" />
      )
    ) : null;
    const face0 =
      empty && placeholder ? (
        <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-bz-text-soft">
          {n.kind === "ghost" && placeholder === ghost?.label && <Plus size={12} className="shrink-0" />}
          {placeholder}
        </span>
      ) : (
        <span className={cn("min-w-0 truncate", strike)}>{shown}</span>
      );
    const face = treeRow ? (
      <span className="flex min-w-0 items-center gap-1" style={{ paddingLeft: indent }}>
        {caret}
        {face0}
      </span>
    ) : (
      face0
    );

    if (ed)
      return (
        <span key={key} role="gridcell" className="min-w-0" data-cell={key} style={treeRow ? { paddingLeft: indent + 20 } : undefined}>
          <input
            data-bzw-editing=""
            ref={(el) => {
              if (!el || focusedToken.current === ed.token) return;
              focusedToken.current = ed.token;
              el.focus();
              if (ed.selectAll) el.select();
              else el.setSelectionRange(el.value.length, el.value.length);
            }}
            value={ed.draft}
            inputMode={kind === "number" ? "decimal" : undefined}
            placeholder={kind === "date" ? "YYYY-MM-DD · t = today" : placeholder}
            aria-label={labelText(c)}
            onChange={(e) => setEditing({ ...editRef.current!, draft: e.target.value, selectAll: false })}
            onKeyDown={(e) => onEditKey(e, c)}
            onBlur={() => commitEdit("none")}
            className={cn(INPUT_CELL, right && "text-right", NUM)}
          />
        </span>
      );

    if (kind === "select" && editable)
      return (
        <span key={key} role="gridcell" className="min-w-0" data-cell={key} data-focus="inner" onClickCapture={() => (selectOpen.current = true)}>
          <Select
            trigger="plain"
            tabIndex={isTab ? 0 : -1}
            value={asText(raw) || null}
            options={opts}
            width={c.menuWidth ?? 220}
            searchable
            className="w-full"
            title={c.title?.(v)}
            onChange={(nv) => {
              write(n.key, c.key, nv);
              selectOpen.current = false;
              go(n.key, c.key);
            }}
            onClose={() => {
              if (!selectOpen.current) return;
              selectOpen.current = false;
              go(n.key, c.key);
            }}
          >
            <span className={cn(FACE, "w-full cursor-pointer justify-between gap-1 hover:border-bz-line-soft", soft && "text-bz-text-soft", RING)}>
              {face}
              {/* A column of chevrons at rest reads as a form, not a table: a saved row shows its ▾ on
                  hover / focus (spec §6.3 #1 "transparent until hover"); the add row keeps it, it asks for a pick. */}
              <ChevronDown size={11} className={cn("shrink-0 text-bz-text-soft", n.kind === "row" && !empty && "opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100 [@media(hover:none)]:opacity-100")} />
            </span>
          </Select>
        </span>
      );

    return (
      <div
        key={key}
        role="gridcell"
        data-cell={key}
        tabIndex={isTab ? 0 : -1}
        title={c.title?.(v) ?? (typeof shown === "string" || typeof shown === "number" ? String(shown) : undefined)}
        aria-readonly={!editable || undefined}
        onClick={(e) => {
          if (!rootRef.current?.contains(e.target as Node)) return;
          if (editable) {
            e.stopPropagation();
            startEdit(n.key, c.key);
          }
        }}
        className={cn(FACE, right && "justify-end text-right", NUM, soft ? "text-bz-text-soft" : "text-bz-text", editable && "cursor-text hover:border-bz-line-soft", RING)}
      >
        {face}
      </div>
    );
  };

  const actCell = (n: NavRow<R>, st: RowState, row: R | null) => {
    if (!hasAct) return null;
    return (
      <span role="gridcell" className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
        {row && rowAction?.(row)}
        {n.kind === "row" && row && st.removed && onRemove ? (
          <button type="button" tabIndex={-1} className={cn(PLAIN_BTN, "mx-1.5")} title="Keep this row" aria-label="Keep this row" onClick={() => onRemove(row.id)}>
            <RotateCcw size={12} />
          </button>
        ) : n.kind === "row" && st.locked ? (
          <span className="flex size-6 items-center justify-center text-bz-text-soft" title={typeof st.locked === "string" ? st.locked : "Locked"}>
            <Lock size={11} />
          </span>
        ) : n.kind === "row" && row && onRemove && mode !== "readonly" ? (
          <button
            type="button"
            tabIndex={-1}
            className={cn(PLAIN_BTN, "mx-1.5 opacity-0 focus-visible:opacity-100 group-hover/row:opacity-100")}
            title="Remove row (Delete)"
            aria-label="Remove row"
            onClick={() => onRemove(row.id)}
          >
            <X size={12} />
          </button>
        ) : n.kind === "ghost" && ghostRef.current && columns.some((c) => kindOf(c) !== "readonly" && asText(valueOf(ghostRef.current!, c.key)) !== "") ? (
          <button
            type="button"
            tabIndex={-1}
            className={cn(PLAIN_BTN, "mx-1.5")}
            title="Clear the new row"
            aria-label="Clear the new row"
            onClick={() => ((ghostRef.current = ghost?.blank() ?? null), setGhostErr(null), force())}
          >
            <X size={12} />
          </button>
        ) : null}
      </span>
    );
  };

  const errLine = (text: string, key: string) => (
    <p key={key} role="alert" className="relative m-0 border-b border-bz-line-soft bg-bz-surface py-1.5 pl-4 pr-3 text-[11.5px] leading-snug text-bz-red">
      <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-bz-red-mark" />
      {text}
    </p>
  );

  const body: React.ReactNode[] = [];
  for (const n of nav) {
    if (n.kind === "group") {
      const g = n.group;
      const shut = isShut(g);
      const isTab = !!tab && tab.nav === n.key;
      const ids = g.rowIds.filter((id) => byId.has(id));
      const nSel = ids.filter((id) => selected?.has(id)).length;
      body.push(
        <div key={n.key} role="row" className={cn("flex items-center gap-2 border-b border-bz-line-soft px-2 py-1.5", g.alarm && ids.length ? "bg-bz-red-soft" : "bg-bz-paper-warm/60")}>
          {selectable && <Checkbox tabIndex={-1} on={ids.length > 0 && nSel === ids.length} mixed={nSel > 0 && nSel < ids.length} onChange={(v) => setMany(ids, v)} label={`Select all in ${typeof g.label === "string" ? g.label : g.key}`} />}
          <div
            role="gridcell"
            data-cell={`${n.key}|`}
            tabIndex={isTab ? 0 : -1}
            aria-expanded={!shut}
            onClick={() => setToggled((s) => { const t = new Set(s); t.has(g.key) ? t.delete(g.key) : t.add(g.key); return t; })}
            className={cn("inline-flex min-w-0 cursor-pointer items-center gap-1.5 rounded-bz-sm px-1 py-0.5", RING)}
          >
            {shut ? <ChevronRight size={13} className="shrink-0 text-bz-text-soft" /> : <ChevronDown size={13} className="shrink-0 text-bz-text-soft" />}
            <span className={cn("truncate text-[12.5px] font-semibold", g.alarm && ids.length ? "text-bz-red" : "text-bz-text")}>{g.label}</span>
            <span className={cn("rounded-bz-sm bg-bz-surface/70 px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>{g.count ?? g.rowIds.length}</span>
            {g.note && <span className="truncate text-[11px] text-bz-text-soft">{g.note}</span>}
          </div>
          {g.right && <span className="ml-auto flex shrink-0 items-center gap-1.5">{g.right}</span>}
        </div>,
      );
      continue;
    }
    const row = n.kind === "row" ? n.row : null;
    const v = viewOf(n);
    if (!v) continue;
    const st = row ? stateOf(row) : {};
    const held = !!row && bufferRef.current?.id === row.id;
    const err = row ? refused[row.id] ?? st.error ?? null : ghostErr;
    const isSel = !!row && !!selected?.has(row.id);
    const isCur = !!row && current === row.id;
    const edge = err ? "bg-bz-red-mark" : st.isNew || st.dirty || st.removed || held ? "bg-bz-amber" : isCur ? "bg-bz-fire" : "";
    body.push(
      <div
        key={n.key}
        role="row"
        aria-selected={selectable ? isSel : undefined}
        onClick={(e) => {
          if (!row || !onOpenRow || !rootRef.current?.contains(e.target as Node)) return;
          onOpenRow(row);
        }}
        className={cn(
          "group/row relative grid items-center gap-1 border-b border-bz-line-soft px-2 py-1",
          n.kind === "ghost" ? "bg-bz-paper" : isSel || isCur ? "bg-bz-fire/10" : "bg-bz-surface",
          onOpenRow && row && !isCur && "cursor-pointer hover:bg-bz-paper-warm",
          st.isNew && "animate-in fade-in duration-150",
        )}
        style={{ gridTemplateColumns: "var(--bzw-grid-cols)" }}
      >
        {edge && <span aria-hidden className={cn("absolute inset-y-0 left-0 w-0.5", edge)} />}
        {selectable && (
          <span role="gridcell" className="flex items-center justify-center">
            {row ? <Checkbox tabIndex={-1} on={isSel} onChange={(on) => setMany([row.id], on)} label="Select row" /> : <Plus size={12} className="text-bz-text-soft" />}
          </span>
        )}
        {columns.map((c) => cell(n, v, c, st))}
        {actCell(n, st, row)}
      </div>,
    );
    if (err) body.push(errLine(err, `${n.key}:err`));
  }

  return (
    <div
      ref={rootRef}
      role="grid"
      aria-label={ariaLabel}
      aria-readonly={mode === "readonly" || undefined}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn("min-w-0 bg-bz-surface", scrollX ? "overflow-x-auto" : "max-md:overflow-x-auto md:overflow-clip", !bare && "rounded-bz-md border border-bz-line-soft", className)}
      style={{ ["--bzw-grid-cols" as string]: tracks }}
    >
      <div style={{ minWidth }} className={scrollX ? undefined : "md:!min-w-0"}>
        <div role="row" className={cn("sticky z-[5] grid items-center gap-1 border-b border-bz-line bg-bz-paper-warm px-2 py-1.5", LABEL)} style={{ top: stickyTop, gridTemplateColumns: "var(--bzw-grid-cols)" }}>
          {selectable && (
            <span role="columnheader" className="flex items-center justify-center">
              <Checkbox tabIndex={-1} on={!!allSel} mixed={!!someSel && !allSel} onChange={(v) => setMany(dataRows.map((n) => n.row.id), v)} label="Select all rows" />
            </span>
          )}
          {columns.map((c) => (
            <span key={c.key} role="columnheader" title={typeof c.label === "string" ? c.label : undefined} className={cn("truncate px-2", (c.align === "right" || kindOf(c) === "number") && "text-right")}>
              {c.label}
            </span>
          ))}
          {hasAct && <span aria-hidden />}
        </div>
        {loading ? (
          <SkeletonRows rows={3} text={loadingText} />
        ) : (
          <>
            {ghostAt === "top" && body.shift()}
            {ghostAt === "top" && ghostErr && body.shift()}
            {rows.length === 0 && empty && <p className="m-0 border-b border-bz-line-soft px-4 py-3 text-[11.5px] text-bz-text-soft">{empty}</p>}
            {body}
          </>
        )}
        {foot && <div className="flex flex-wrap items-center gap-2 bg-bz-paper px-3 py-2 text-[11.5px] text-bz-text-muted">{foot}</div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGED ROWS — the host's dirty set for a `staged` grid
//
// A page or sheet holds the saved rows and the draft; the grid only reports
// cell changes. `gridProps` wires the two; `changes` is what a PATCH sends
// (upsert / remove), and `accept()` makes the draft the new saved state.
// ════════════════════════════════════════════════════════════════════════════

export function useStagedRows<R extends GridRowBase>(initial: R[]) {
  const [base, setBase] = React.useState<R[]>(initial);
  const [rows, setRows] = React.useState<R[]>(initial);
  const [removed, setRemoved] = React.useState<Set<string>>(new Set());
  const baseById = React.useMemo(() => new Map(base.map((r) => [r.id, r])), [base]);

  const isNew = (id: string) => !baseById.has(id);
  const isEdited = (r: R) => {
    const b = baseById.get(r.id);
    if (!b) return false;
    return Object.keys(r).some((k) => (r as Record<string, unknown>)[k] !== (b as Record<string, unknown>)[k]);
  };

  const setCell = React.useCallback((id: string, key: string, value: CellValue) => setRows((rs) => rs.map((r) => (r.id === id ? ({ ...r, [key]: value } as R) : r))), []);
  const add = (r: R, at: "start" | "end" = "end") => setRows((rs) => (at === "start" ? [r, ...rs] : [...rs, r]));
  const remove = (id: string) => {
    if (isNew(id)) return setRows((rs) => rs.filter((r) => r.id !== id));
    setRemoved((s) => {
      const t = new Set(s);
      t.has(id) ? t.delete(id) : t.add(id);
      return t;
    });
  };
  const reset = () => (setRows(base), setRemoved(new Set()));
  const accept = () => {
    const next = rows.filter((r) => !removed.has(r.id));
    setBase(next);
    setRows(next);
    setRemoved(new Set());
  };
  /** Replace the saved state (a reload) and drop the draft. */
  const load = (next: R[]) => (setBase(next), setRows(next), setRemoved(new Set()));

  const added = rows.filter((r) => isNew(r.id));
  const edited = rows.filter((r) => !isNew(r.id) && !removed.has(r.id) && isEdited(r));
  const changes = { added, edited, removed: [...removed] };
  const count = added.length + edited.length + removed.size;
  const rowState = (r: R): RowState => ({ isNew: isNew(r.id), dirty: isNew(r.id) || isEdited(r) || removed.has(r.id), removed: removed.has(r.id) });

  return { rows, base, add, remove, reset, accept, load, setCell, changes, count, dirty: count > 0, rowState, isNew, gridProps: { rows, rowState, onCell: setCell, onRemove: remove } };
}

export type StagedRows<R extends GridRowBase> = ReturnType<typeof useStagedRows<R>>;
