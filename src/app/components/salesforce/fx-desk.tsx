import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowDownUp, ChevronDown, Download, FileSpreadsheet, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, MenuItem, MenuLabel, MenuSep, NUM, Popover, Select, ToastHost, useToast } from "../sales/bzw";
import type { SelectOption } from "../sales/bzw";
import type { BulkAction, BulkResult, Column, FilterOption, PanelCtx, Pick as DeskPick, Sort, View } from "../sales/DocDesk";
import { bsDate } from "../sales/master";
import { addDays, fmtShort, useKeys } from "../sales/orders";
import { ConfirmDialog } from "../sales/parts";
import { SF_TODAY } from "./data";
import { HEAD_BTN, PillTabs, StatusPill } from "./fx";
import type { PillTone } from "./fx";
import { FX_CONTROL, FxBulk, FxEmpty, FxSearch, FxSheet, FxTable } from "./fx-table";
import type { FxBreak, FxBulkAction, FxColumn, FxGroup } from "./fx-table";
import { SfShell } from "./sf";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE · the list page — one shape for every list of the module
//
// A title with the list's figures beside it, one row of controls (the picks as
// pill tabs · search · one Filter · one Sort), a roomy table, and the record in
// a sheet that floats over it. A page says WHAT it lists — the same config the
// transaction desk (`sales/DocDesk`) takes — and never how it is laid out, so
// Orders, Claims, Customers and the rest cannot drift apart.
// ════════════════════════════════════════════════════════════════════════════

type IconType = React.ComponentType<{ size?: number; className?: string }>;

/** A row's state, as the list's pill. */
export type FxStatus = { label: string; tone: PillTone; icon?: IconType };

/** Any of the module's tone words (the bzw `Chip`'s, the older label maps') as a pill tone. */
export const pillTone = (t: string | null | undefined): PillTone => (t === "good" || t === "positive" ? "good" : t === "warn" || t === "partial" || t === "pending" || t === "info" ? "warn" : t === "danger" || t === "bad" ? "bad" : "idle");

/** A second line a page draws inside its own primary cell (a tree node, a product beside its picture). */
export const FX_SUB = "block truncate text-[11.5px] font-normal text-bz-text-soft tabular-nums";

/** A list date: AD over its BS date, the way the app's grids show both. */
export function FxDate({ iso }: { iso: string }) {
  return (
    <span className={cn("inline-flex flex-col leading-tight", NUM)}>
      <span>{fmtShort(iso)}</span>
      <span className="text-[11px] text-bz-text-soft">{bsDate(iso)}</span>
    </span>
  );
}

export type FxDeskProps<T> = {
  /** The `SfShell` place this list is. */
  place: string;
  /** The page title, when it is not the place's own name. */
  title?: React.ReactNode;
  /** The path under /design/ that names this list — "salesforce/orders". */
  section: string;
  rows: T[];
  noOf: (r: T) => string;
  searchText: (r: T) => string;
  /** With it (and `showPeriod`), the Filter gets a Date group. */
  dateOf?: (r: T) => string;
  /** Figures beside the title. */
  stats?: { label: string; value: React.ReactNode; title?: string }[];
  /** The pill tabs: All, then each pick with its live count. A pick whose figure is not a count shows it beside the title. */
  picks?: DeskPick<T>[];
  /** With more than one, the Sort menu also chooses how the rows are grouped. */
  views: View<T>[];
  filters?: FilterOption<T>[];
  sorts?: Sort<T>[];
  columns: Column<T>[];
  primary: (r: T) => { title: React.ReactNode; sub?: React.ReactNode; subOnDesktop?: boolean };
  amount: (r: T) => { value: React.ReactNode; sub?: React.ReactNode };
  /** The row's state as a pill, in its own column before the figure (under the name on a phone). */
  status?: (r: T) => FxStatus | null;
  statusLabel?: string;
  /** What leads a row: its number, or — in a queue of mixed things, where the pill says what each row is — the pill. */
  lead?: "number" | "status";
  /** The row's one next step. `go` opens a record of this list, keeping what the list is showing. */
  rowVerb?: (r: T, go: PanelCtx["go"]) => { label: string; icon: React.ComponentType<{ size?: number }>; run: (e?: React.MouseEvent<HTMLButtonElement>) => void } | null;
  bulk?: BulkAction<T>[];
  filterPlaceholder?: string;
  onDelete?: (rows: T[]) => { done: number; skipped: string[] };
  newLabel?: string;
  onNew?: () => void;
  renderPanel: (r: T, ctx: PanelCtx) => React.ReactNode;
  renderNew?: (ctx: PanelCtx) => React.ReactNode;
  /** The desk's form (New, and `do=edit`) is a composer that needs the page. Otherwise it opens in a wide sheet that holds on to unsaved work. */
  formFull?: boolean;
  noun: [string, string];
  partyLabel?: string;
  searchPlaceholder?: string;
  /** `do=` modes that always take the page (a version editor). `edit` follows `formFull`. */
  fullModes?: string[];
  numberLabel?: string;
  amountLabel?: string;
  /** A list with no date in the document sense (a master) leaves the Date group out. */
  showPeriod?: boolean;
  numberOf?: (r: T) => React.ReactNode;
  /** The empty list's sentence, when "No <nouns> yet." is not it. */
  emptyText?: string;
  /** The empty list's second action. */
  emptyAction?: React.ReactNode;
  /** Replaces the Export chip in the page head. */
  exportMenu?: React.ReactNode;
  /** Query params carried on every navigation the list makes. */
  keepParams?: string[];
  /** Host-owned dialogs and sheets, rendered inside the frame so the theme and the toasts reach them. */
  renderExtra?: (api: { show: PanelCtx["show"]; go: PanelCtx["go"] }) => React.ReactNode;
  numberWidth?: string;
  rowLabel?: (r: T) => string;
  /** Filter values a link arrived with — applied on arrival. */
  initialFilters?: string[];
  /** A switch between sibling lists of one place, drawn first in the controls row. */
  viewTabs?: React.ReactNode;
  /** The open record lives in this query param instead of the path — for a place that has one route. */
  openParam?: string;
  /** A queue: when the open row leaves the list (it was decided), the sheet moves to the row that took its place. */
  handover?: boolean;
  pageSize?: number;
  /** The record is worked in, not just read (a route being built): its sheet opens wide. The reader can still narrow it. */
  recordWide?: boolean;
};

type DeskState = { pick: string | null; q: string; f: string[]; view: string; sort: string; page: number };
// `by` is the view (how the rows are grouped) — not "view", which a page may use for its own switch.
const OWN_KEYS = ["pick", "q", "f", "by", "sort", "page"];
const ALL = "__all";

const DATES: { value: string; label: string; test: (d: string) => boolean }[] = [
  { value: "date:today", label: "Today", test: (d) => d === SF_TODAY },
  { value: "date:7", label: "Last 7 days", test: (d) => d <= SF_TODAY && d >= addDays(SF_TODAY, -6) },
  { value: "date:30", label: "Last 30 days", test: (d) => d <= SF_TODAY && d >= addDays(SF_TODAY, -29) },
  { value: "date:month", label: "This month", test: (d) => d.slice(0, 7) === SF_TODAY.slice(0, 7) },
];

// ── Column tracks ──
// The transaction desk's tracks were cut for 11.5px text; this scale needs a little more, and shares what is left
// over between the columns instead of giving it all to the name.
const px = (w: string) => {
  const m = /^\s*(\d+(?:\.\d+)?)px\s*$/.exec(w);
  return m ? Number(m[1]) : null;
};
const roomy = (w: string) => {
  const n = px(w);
  return n === null ? w : n <= 32 ? `${n}px` : `${Math.round(n * 1.16)}px`;
};
const flexTrack = (w: string) => {
  const n = px(roomy(w));
  return n === null ? w : n <= 32 ? `${n}px` : `minmax(${n}px,${(n / 100).toFixed(2)}fr)`;
};
const GAP = 16;
/** The rail and the page gutters: what a window's width loses before the table. */
const CHROME = 106;
const NAME_MIN = 240;
const STATUS_W = 132;
const AMOUNT_W = 136;

export function FxDesk<T>({
  place,
  title,
  section,
  rows,
  noOf,
  searchText,
  dateOf,
  stats = [],
  picks = [],
  views,
  filters = [],
  sorts = [],
  columns,
  primary,
  amount,
  status,
  statusLabel = "Status",
  lead = "number",
  rowVerb,
  bulk = [],
  filterPlaceholder = "Filter",
  onDelete,
  newLabel,
  onNew,
  renderPanel,
  renderNew,
  formFull,
  noun,
  partyLabel = "Customer",
  searchPlaceholder = "Number, customer or item",
  fullModes = [],
  numberLabel = "No.",
  amountLabel = "Amount",
  showPeriod = true,
  numberOf,
  emptyText,
  emptyAction,
  exportMenu,
  keepParams = [],
  renderExtra,
  numberWidth,
  rowLabel,
  initialFilters,
  viewTabs,
  openParam,
  handover,
  pageSize = 12,
  recordWide,
}: FxDeskProps<T>) {
  const base = `/design/${section}`;
  const params = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const { toast, show, dismiss } = useToast();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const sortRef = React.useRef<HTMLButtonElement>(null);
  const exportRef = React.useRef<HTMLButtonElement>(null);
  const [sortOpen, setSortOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [wide, setWide] = React.useState(!!recordWide);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkNote, setBulkNote] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // ── What the list is showing — kept in the address, so closing a record (or a reload) finds it as it was ──
  const known = (v: string) => filters.some((f) => f.value === v);
  const [st, setSt] = React.useState<DeskState>(() => {
    const pick = search.get("pick");
    const isPick = picks.some((p) => p.key === pick);
    const view = search.get("by");
    const sort = search.get("sort");
    // An older link's ?pick= may name what is a filter here.
    const f = [...search.getAll("f"), ...(initialFilters ?? []).filter(known), ...(pick && !isPick && known(pick) ? [pick] : [])];
    return {
      pick: isPick ? pick : null,
      q: search.get("q") ?? "",
      f: Array.from(new Set(f)),
      view: views.find((v) => v.key === view)?.key ?? views[0].key,
      sort: sorts.find((s) => s.key === sort)?.key ?? sorts[0]?.key ?? "",
      page: Math.max(1, Math.floor(Number(search.get("page"))) || 1),
    };
  });
  /** Any change to what is listed starts again from the first page. */
  const set = (patch: Partial<DeskState>) => setSt((s) => ({ ...s, page: 1, ...patch }));
  const write = (s: DeskState, keep?: URLSearchParams) => {
    const p = new URLSearchParams(keep);
    OWN_KEYS.forEach((k) => p.delete(k));
    if (s.pick) p.set("pick", s.pick);
    if (s.q.trim()) p.set("q", s.q.trim());
    s.f.forEach((v) => p.append("f", v));
    if (s.view !== views[0].key) p.set("by", s.view);
    if (sorts[0] && s.sort !== sorts[0].key) p.set("sort", s.sort);
    if (s.page > 1) p.set("page", String(s.page));
    return p.toString();
  };
  const qs = write(st, search);
  React.useEffect(() => {
    if (qs !== search.toString()) setSearch(new URLSearchParams(qs), { replace: true });
  }, [qs, search, setSearch]);
  // A link followed while the list is already up: apply the filters it brings, keep what is applied.
  const arrived = (initialFilters ?? []).join("|");
  React.useEffect(() => {
    if (!arrived) return;
    setSt((s) => ({ ...s, page: 1, f: Array.from(new Set([...s.f, ...arrived.split("|").filter(known)])) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrived]);

  // ── Narrow, sort, group ──
  const dated = showPeriod && !!dateOf;
  const applied = st.f.filter((v) => known(v) || (dated && DATES.some((d) => d.value === v)));
  // A pick can leave while it is chosen (a queue's last row of a kind is decided): the list then shows All.
  const pick = picks.find((p) => p.key === st.pick);
  const narrowed = !!pick || !!st.q.trim() || applied.length > 0;
  const needle = st.q.trim().toLowerCase();
  const byGroup = new Map<string, ((r: T) => boolean)[]>();
  for (const v of applied) {
    const f = filters.find((x) => x.value === v);
    const d = DATES.find((x) => x.value === v);
    const [group, test] = f ? [f.group, f.test] : ["\u0000date", (r: T) => d!.test(dateOf!(r))];
    byGroup.set(group, [...(byGroup.get(group) ?? []), test]);
  }
  const visible = rows.filter((r) => {
    if (pick && !pick.test(r)) return false;
    // Options of one group are alternatives; the groups narrow each other.
    for (const tests of byGroup.values()) if (!tests.some((t) => t(r))) return false;
    return !needle || searchText(r).toLowerCase().includes(needle);
  });
  const sort = sorts.find((s) => s.key === st.sort);
  if (sort) visible.sort((a, b) => (sort.by(a) < sort.by(b) ? -1 : sort.by(a) > sort.by(b) ? 1 : 0) * (sort.desc ? -1 : 1));

  const view = views.find((v) => v.key === st.view) ?? views[0];
  const bands = view.groups(visible, narrowed).filter((g) => g.rows.length > 0);
  // A band that the desk kept folded away simply comes last.
  const groups = [...bands.filter((g) => !g.collapsed), ...bands.filter((g) => g.collapsed)];
  const groupOfId = new Map<string, FxGroup>();
  const ordered: T[] = [];
  for (const g of groups)
    for (const r of g.rows) {
      const id = noOf(r);
      if (groupOfId.has(id)) continue;
      groupOfId.set(id, { key: g.key, label: g.label, right: g.right, danger: g.alarm });
      ordered.push(r);
    }
  const headed = groups.length > 1;

  // ── The record: a sheet, or — for a form — the page ──
  const no = openParam ? (search.get(openParam) ?? undefined) : params.no;
  const mode = search.get("do");
  const isNew = no === "new" && !!renderNew;
  const open = no && no !== "new" ? (rows.find((r) => noOf(r) === no) ?? null) : null;
  /** A form is up: a new record, or this one being edited. */
  const form = isNew || (!!open && mode === "edit");
  const fullPage = (!!open && !!mode && fullModes.includes(mode)) || (form && !!formFull);
  const sheet = !fullPage && (!!open || isNew);

  const nav = (n: string | null, extra?: Record<string, string>, replace?: boolean) => {
    const p = new URLSearchParams(write(st));
    keepParams.forEach((k) => {
      const v = search.get(k);
      if (v) p.set(k, v);
    });
    if (extra) Object.entries(extra).forEach(([k, v]) => p.set(k, v));
    if (openParam && n) p.set(openParam, n);
    const q = p.toString();
    navigate(`${openParam || !n ? base : `${base}/${n}`}${q ? `?${q}` : ""}`, { replace });
  };
  const go = (n: string | null, extra?: Record<string, string>) => nav(n, extra);

  const at = open ? ordered.findIndex((r) => noOf(r) === noOf(open)) : -1;
  // Its place in the list is remembered: a row that leaves once decided hands over to the one that took its place.
  const place_ = React.useRef(0);
  if (at >= 0) place_.current = at;
  const neighbour = (d: 1 | -1) => {
    const n = ordered.length;
    if (!n) return null;
    if (at >= 0) return noOf(ordered[(at + d + n) % n]);
    return noOf(ordered[Math.min(n - 1, Math.max(0, d === 1 ? place_.current : place_.current - 1))]);
  };
  const step = (d: 1 | -1) => {
    const id = neighbour(d);
    if (id && (!open || id !== noOf(open))) go(id);
  };
  const lastOpen = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (open) {
      lastOpen.current = noOf(open);
      return;
    }
    if (!handover || !no || no === "new" || lastOpen.current !== no) return;
    lastOpen.current = null;
    const next = ordered[Math.min(place_.current, ordered.length - 1)];
    nav(next ? noOf(next) : null, undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, no]);

  const ctx: PanelCtx = {
    // The sheet is the record's edge; "docked" is only what makes the record offer its wider view.
    docked: true,
    full: wide,
    position: open && ordered.length ? { index: at >= 0 ? at : Math.min(place_.current, ordered.length - 1), total: ordered.length } : null,
    onPrev: () => step(-1),
    onNext: () => step(1),
    onToggleFull: () => setWide((v) => !v),
    onClose: () => go(null),
    show,
    go,
    mode,
    neighbour,
  };
  /** A form: nothing to widen, no neighbours to walk. */
  const formCtx: PanelCtx = { ...ctx, docked: false, full: true };

  // ── A selection ──
  const selectable = bulk.length > 0 || !!onDelete;
  const pickedRows = rows.filter((r) => selected.has(noOf(r)));
  const clearTicks = () => (setSelected(new Set()), setBulkNote(null));
  const report = (res: BulkResult) => {
    if (res.skipped.length) {
      // What was skipped stays ticked, so it can be seen and dealt with.
      setSelected(new Set(res.skippedIds ?? res.skipped.map((s) => s.split(" ")[0])));
      setBulkNote(`${res.done} ${res.verb} · ${res.skipped.length} skipped`);
      show("error", `${res.done} ${res.verb}. Skipped: ${res.skipped.join("; ")}.`, undefined, 0);
    } else {
      clearTicks();
      show("success", `${res.done} ${res.done === 1 ? noun[0] : noun[1]} ${res.verb}`);
    }
  };
  const firstPlain = bulk.find((b) => !b.choose && !b.hidden?.(pickedRows));
  const bulkActions: FxBulkAction[] = [
    ...bulk
      .filter((b) => !b.hidden?.(pickedRows))
      .map<FxBulkAction>((b) => ({
        label: b.label,
        icon: b.icon,
        title: b.title,
        disabled: !b.enabled(pickedRows),
        primary: b === firstPlain,
        onClick: b.choose ? undefined : () => report(b.run(pickedRows)),
        choose: b.choose ? { options: b.choose.options, placeholder: b.choose.placeholder, onPick: (v) => report(b.run(pickedRows, v)) } : undefined,
      })),
    ...(onDelete ? [{ label: "Delete", icon: Trash2, onClick: () => setConfirmDelete(true) }] : []),
  ];

  /** A menu or a dialog is up: the page's keys are not for it. */
  const busy = () => !!document.querySelector("[data-bzw-dialog], [data-bzw-popover]");
  const held = fullPage || form;
  useKeys({
    "/": (e) => {
      if (held || busy()) return;
      e.preventDefault();
      searchRef.current?.focus();
    },
    n: () => onNew && !held && !busy() && onNew(),
    // With a record open J / K walk the list as filtered, sorted and grouped; with none open they move the table's row cursor.
    j: () => open && !held && !mode && !busy() && step(1),
    k: () => open && !held && !mode && !busy() && step(-1),
    escape: () => !sheet && !held && !busy() && selected.size > 0 && clearTicks(),
  });

  // ── Columns ──
  const numberTrack = numberWidth ? roomy(numberWidth) : "100px";
  const pillLeads = lead === "status" && !!status;
  let need = 32 + (selectable ? 20 + GAP : 0) + (pillLeads ? 0 : (px(numberTrack) ?? 100) + GAP) + NAME_MIN + (status ? STATUS_W + GAP : 0) + AMOUNT_W + GAP;
  // A column shows from the first width at which it, and every column before it, still leaves the name room.
  const showFrom: FxBreak[] = columns.map((c) => {
    need += (px(roomy(c.width)) ?? 120) + GAP;
    return need <= 1024 - CHROME ? 1024 : need <= 1280 - CHROME ? 1280 : 1536;
  });
  const statusColumn: FxColumn<T>[] = status
    ? [
        {
          key: "__status",
          label: statusLabel,
          width: `${STATUS_W}px`,
          role: "state",
          render: (r) => {
            const s = status(r);
            return s ? (
              <span className="flex">
                <StatusPill tone={s.tone} icon={s.icon}>
                  {s.label}
                </StatusPill>
              </span>
            ) : null;
          },
        },
      ]
    : [];
  const fxColumns: FxColumn<T>[] = [
    ...(pillLeads ? statusColumn : [{ key: "__no", label: numberLabel, width: numberTrack, hideBelow: 768 as const, render: (r: T) => <span className={cn("text-bz-text-muted", NUM)}>{numberOf ? numberOf(r) : noOf(r)}</span> }]),
    {
      key: "__name",
      label: partyLabel,
      width: "minmax(0,3fr)",
      role: "primary",
      render: (r) => {
        const p = primary(r);
        return (
          <span className="block min-w-0 leading-snug">
            <span className="block truncate font-semibold text-bz-text">{p.title}</span>
            {/* Below the widths that show them, the number and the columns' gist move down here; on a phone the line may wrap. */}
            <span className={cn("block truncate text-[11.5px] text-bz-text-soft max-sm:whitespace-normal", !p.sub ? "md:hidden" : !p.subOnDesktop && "lg:hidden")}>
              {!pillLeads && (
                <span className={cn("md:hidden", NUM)}>
                  {numberOf ? numberOf(r) : noOf(r)}
                  {p.sub ? " · " : ""}
                </span>
              )}
              {p.sub}
            </span>
          </span>
        );
      },
    },
    ...columns.map<FxColumn<T>>((c, i) => ({ key: c.key, label: c.label, width: flexTrack(c.width), align: c.align, hideBelow: showFrom[i], render: (r) => <span className="text-bz-text-muted">{c.render(r)}</span> })),
    ...(pillLeads ? [] : statusColumn),
    {
      key: "__amount",
      label: amountLabel,
      width: `${AMOUNT_W}px`,
      align: "right",
      role: "figure",
      render: (r) => {
        const a = amount(r);
        return (
          <span className="block min-w-0 leading-snug">
            <span className="block truncate font-semibold text-bz-text">{a.value}</span>
            {a.sub && <span className="block truncate text-[11px] text-bz-text-soft">{a.sub}</span>}
          </span>
        );
      },
    },
  ];

  // ── The controls row ──
  const clearAll = () => set({ pick: null, q: "", f: [] });
  const filterOptions: SelectOption[] = [...filters.map((f) => ({ value: f.value, label: f.label, group: f.group, hint: f.hint })), ...(dated ? DATES.map((d) => ({ value: d.value, label: d.label, group: "Date" })) : [])];
  const tabs = picks.length > 0 && (
    <PillTabs
      value={pick?.key ?? ALL}
      onChange={(v) => set({ pick: v === ALL ? null : v })}
      options={[{ value: ALL, label: "All" }, ...picks.map((p) => ({ value: p.key, label: p.label, count: rows.filter(p.test).length, danger: p.danger, title: p.title }))]}
    />
  );
  const hasTabs = !!viewTabs || picks.length > 0;
  const figures = [...stats.map((s) => ({ key: `s:${s.label}`, label: s.label, value: s.value, title: s.title })), ...picks.filter((p) => typeof p.value !== "number").map((p) => ({ key: `p:${p.key}`, label: p.label, value: p.value, title: p.title }))];
  const newButton = onNew && newLabel && (
    <button type="button" className={BTN} onClick={onNew}>
      <Plus size={14} /> {newLabel}
    </button>
  );
  const exported = (kind: string) => (setExportOpen(false), show("success", `${kind} of ${ordered.length} ${noun[1]} exported to Excel`));

  const empty =
    rows.length === 0 ? (
      <FxEmpty title={emptyText ?? `No ${noun[1]} yet.`}>
        {newButton}
        {emptyAction}
      </FxEmpty>
    ) : (
      <FxEmpty title="Nothing matches.">
        <button type="button" className={HEAD_BTN} onClick={clearAll}>
          Clear
        </button>
      </FxEmpty>
    );

  return (
    <SfShell
      current={place}
      title={title}
      head={!fullPage}
      meta={
        figures.length > 0 && rows.length > 0
          ? figures.map((m, i) => (
              <span key={m.key} title={m.title} className="inline-flex items-center gap-1.5 whitespace-nowrap max-md:hidden">
                {i > 0 && <span aria-hidden className="mr-1.5 size-[3px] rounded-bz-pill bg-bz-line" />}
                <span className="text-bz-text-soft">{m.label}</span>
                <span className="font-semibold text-bz-text">{m.value}</span>
              </span>
            ))
          : undefined
      }
      actions={
        <>
          {exportMenu ??
            (rows.length > 0 && (
              <>
                <button ref={exportRef} type="button" className={cn(HEAD_BTN, "w-9 justify-center px-0")} title="Export" aria-label="Export" onClick={() => setExportOpen(true)}>
                  <Download size={14} className="text-bz-text-muted" />
                </button>
                <Popover open={exportOpen} anchor={exportRef.current} onClose={() => setExportOpen(false)} align="right" width={240}>
                  <MenuItem icon={FileSpreadsheet} hint="One row per record, as listed" onClick={() => exported("Summary")}>
                    Summary (Excel)
                  </MenuItem>
                  <MenuItem icon={FileSpreadsheet} hint="One row per line item" onClick={() => exported("Item detail")}>
                    Item detail (Excel)
                  </MenuItem>
                </Popover>
              </>
            ))}
          {newButton}
        </>
      }
    >
      <div className="relative h-full min-h-0">
        {fullPage ? (
          <div className="absolute inset-0 bg-bz-surface [&>section]:shadow-none">{isNew ? renderNew?.(formCtx) : open && renderPanel(open, formCtx)}</div>
        ) : (
          <>
            <div className={cn("h-full overflow-y-auto px-4 [scrollbar-width:thin] md:px-6", selected.size > 0 ? "pb-24" : "pb-8")}>
              <div className="flex flex-col gap-3">
                {(rows.length > 0 || viewTabs) && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {viewTabs}
                    {rows.length > 0 && tabs}
                    {rows.length > 0 && (
                      <div className={cn("flex w-full flex-wrap items-center gap-2 xl:w-auto", hasTabs && "xl:ml-auto")}>
                        <FxSearch ref={searchRef} value={st.q} onChange={(q) => set({ q })} placeholder={searchPlaceholder} hint="/" className="w-full sm:w-auto sm:min-w-[180px] sm:flex-1 xl:w-[260px] xl:flex-none" />
                        {filterOptions.length > 0 && <Select multiple label="Filter" icon={SlidersHorizontal} className={FX_CONTROL} badge={applied.length} applied={applied.length > 0} value={applied} onChange={(f) => set({ f })} width={290} options={filterOptions} placeholder={filterPlaceholder} />}
                        {(sorts.length > 0 || views.length > 1) && (
                          <>
                            <button ref={sortRef} type="button" title={views.length > 1 ? "Sort and view" : "Sort"} aria-haspopup="menu" onClick={() => setSortOpen(true)} className={cn(HEAD_BTN, "gap-1.5")}>
                              <ArrowDownUp size={12} className="text-bz-text-muted" />
                              <span className="max-sm:hidden">{sort?.label ?? view.label}</span>
                              <ChevronDown size={12} className="text-bz-text-soft" />
                            </button>
                            <Popover open={sortOpen} anchor={sortRef.current} onClose={() => setSortOpen(false)} align="right" width={210}>
                              {sorts.length > 0 && <MenuLabel>Sort by</MenuLabel>}
                              {sorts.map((s) => (
                                <MenuItem key={s.key} active={s.key === st.sort} onClick={() => (set({ sort: s.key }), setSortOpen(false))}>
                                  {s.label}
                                </MenuItem>
                              ))}
                              {views.length > 1 && (
                                <>
                                  {sorts.length > 0 && <MenuSep />}
                                  <MenuLabel>View</MenuLabel>
                                  {views.map((v) => (
                                    <MenuItem key={v.key} icon={v.icon} active={v.key === view.key} onClick={() => (set({ view: v.key }), setSortOpen(false))}>
                                      {v.label}
                                    </MenuItem>
                                  ))}
                                </>
                              )}
                            </Popover>
                          </>
                        )}
                        {narrowed && (
                          <button type="button" onClick={clearAll} className="inline-flex h-9 items-center rounded-bz-md px-2 text-[12.5px] font-medium text-bz-text-muted transition-colors hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire">
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <FxTable<T>
                  label={noun[1]}
                  rows={ordered}
                  idOf={noOf}
                  columns={fxColumns}
                  noun={noun}
                  onOpen={(r) => go(noOf(r))}
                  current={open ? noOf(open) : null}
                  selected={selectable ? selected : undefined}
                  onSelect={selectable ? (next) => (setBulkNote(null), setSelected(next)) : undefined}
                  rowLabel={rowLabel}
                  verb={rowVerb ? (r) => rowVerb(r, go) : undefined}
                  groupOf={headed ? (r) => groupOfId.get(noOf(r)) ?? { key: "", label: "" } : undefined}
                  page={st.page}
                  onPage={(page) => setSt((s) => ({ ...s, page }))}
                  pageSize={pageSize}
                  keys={!sheet}
                  empty={empty}
                />
              </div>
            </div>

            <FxBulk count={selected.size} note={bulkNote} onClear={clearTicks} actions={bulkActions} />

            {sheet && (
              <FxSheet wide={form || wide} guard={form} label={isNew ? newLabel : open ? (rowLabel?.(open) ?? noOf(open)) : undefined} onClose={() => (open && mode ? go(noOf(open)) : go(null))}>
                {isNew ? renderNew?.(formCtx) : open && renderPanel(open, form ? formCtx : ctx)}
              </FxSheet>
            )}
          </>
        )}

        <ConfirmDialog
          open={confirmDelete}
          eyebrow={`${selected.size} selected`}
          title={`Delete ${selected.size} ${selected.size === 1 ? noun[0] : noun[1]}?`}
          body="Anything already used elsewhere is skipped. The rest can't be recovered."
          confirm="Delete"
          danger
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            if (onDelete) report({ ...onDelete(pickedRows), verb: "deleted" });
          }}
        />
        {renderExtra?.({ show, go })}
        <ToastHost toast={toast} onDismiss={dismiss} lifted={selected.size > 0} />
      </div>
    </SfShell>
  );
}
