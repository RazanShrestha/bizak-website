import * as React from "react";
import { ArrowUpRight, Lock as LockGlyph, MoreHorizontal, Plus, SearchX, SlidersHorizontal, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, CARD, Clear, Empty, ICON_BTN_SM, Kbd, NUM, Popover, SearchField, Select, Stat, Statline } from "../../sales/bzw";
import type { FilterOption } from "../../sales/DocDesk";
import { useKeys, useMedia } from "../../sales/orders";
import { Grid } from "./Grid";
import type { CellValue, GhostRefusal, GridColumn, GridGroup, GridHandle, GridRowBase, GridTree } from "./Grid";
import { Failed, Usage } from "./marks";
import type { UsageCount } from "./marks";

// ════════════════════════════════════════════════════════════════════════════
// MASTERS HUB — every tier-2 and tier-3 master in one page (spec §2.2, §4, §6.3 #7-8)
//
//   list    the kinds, grouped (Items · Money · Organisation), with server
//           counts; the current one carries the lime bar; a kind not
//           redesigned yet shows ↗ and opens its old page
//   main    statline (each figure a pick) · the kind's defining strip ·
//           toolbar (search · the kind's tools · + New) · the master table
//   sheet   a tier-2 record opens in the MasterSheet, docked ≥1280px
//
// A kind is a CONFIG, not a component: its columns, bands, picks, tier and
// handlers. Tier 3 edits in the row (Enter commits the row); tier 2 opens its
// sheet. The same table, toolbar, usage column and bands serve both, which is
// what "currency matches the other small masters" means.
// ════════════════════════════════════════════════════════════════════════════

export type MasterRow = GridRowBase & { archived?: boolean; used?: number };

export type MasterPick<R> = { key: string; label: string; value: number; test: (r: R) => boolean; danger?: boolean; amber?: boolean; title?: string; showZero?: boolean };

export type MasterKindConfig<R extends MasterRow = MasterRow> = {
  key: string;
  label: string;
  /** The list's group caption: "Items", "Money", "Organisation". */
  group: string;
  /** The server's count for the list. */
  count?: number;
  /** A kind not redesigned yet: listed, and opens its old page (↗). */
  legacyHref?: string;
  tier?: 2 | 3;
  noun?: [string, string];
  rows?: R[];
  columns?: GridColumn<R>[];
  searchText?: (r: R) => string;
  searchPlaceholder?: string;
  /** Statline figures, each a filter. Zero hides unless `showZero` (Archived). */
  picks?: MasterPick<R>[];
  /** Bands; default In use · Available (collapsed) · Archived (collapsed). */
  bands?: (rows: R[]) => GridGroup[];
  /** The Used by column — a door; no column when absent. */
  usage?: (r: R) => UsageCount[];
  /** What the usage popover counts ("Used by 46 records") — a list that mixes documents and masters is not "documents". */
  usageNoun?: string;
  /** The defining strip above the table (the currencies' base strip). */
  strip?: React.ReactNode;
  /** Extra toolbar controls ("Update today's rates"). */
  tools?: React.ReactNode;
  newLabel?: string;
  /** tier 3: the add row. */
  blank?: () => R;
  addLabel?: string;
  /** A refusal sentence, or `{ text, col }` naming the cell it is about (the cursor goes there). */
  onAdd?: (r: R) => GhostRefusal;
  onCommitRow?: (id: string, patch: Record<string, CellValue>) => string | null;
  /** Row ⋯ — Archive / Restore, Delete when unused, Open. */
  rowMenu?: (r: R, close: () => void) => React.ReactNode;
  rowKeys?: Record<string, (r: R) => void>;
  loading?: boolean;
  failed?: boolean;
  onRetry?: () => void;
  /** The toolbar's Filter (the desk's `FilterOption`s): OR inside a group, AND across groups, applied ones as chips. */
  filters?: FilterOption<R>[];
  /** A hierarchy drawn in the first column (departments). */
  tree?: GridTree<R>;
  /** The table's min width before it scrolls sideways (default the grid's 560; 0 when the host drops columns to fit). */
  minWidth?: number;
  /** No Update / Create right: no add row, no New, rows read only (a tier-2 sheet opens as "View only"). */
  readOnly?: boolean;
  /** No Read right: hidden from the list; opened by URL, the page says so. */
  denied?: boolean;
};

/** The default bands: what is used, what nothing uses (folded — the onboarding-seeded rows), and the archive. */
export function usageBands<R extends MasterRow>(rows: R[]): GridGroup[] {
  return [
    { key: "in-use", label: "In use", rowIds: rows.filter((r) => !r.archived && (r.used ?? 0) > 0).map((r) => r.id) },
    { key: "available", label: "Available", rowIds: rows.filter((r) => !r.archived && !(r.used ?? 0)).map((r) => r.id), collapsed: true, note: "not used by anything" },
    { key: "archived", label: "Archived", rowIds: rows.filter((r) => r.archived).map((r) => r.id), collapsed: true },
  ];
}

// Empty's `icon` is typed for a plain component; a lucide forwardRef icon trips the propTypes check.
const NoMatchIcon = ({ size }: { size?: number }) => <SearchX size={size} />;
const DeniedIcon = ({ size }: { size?: number }) => <LockGlyph size={size} />;
const FilterIcon = ({ size, className }: { size?: number; className?: string }) => <SlidersHorizontal size={size} className={className} />;

/** Below 1024px the kinds list becomes this picker at the head of the toolbar (spec §4.1). */
function KindSelect({ kinds, config, onPick }: { kinds: MasterKindConfig<any>[]; config: MasterKindConfig<any>; onPick: (k: MasterKindConfig<any>) => void }) {
  return (
    <Select
      trigger="ghost"
      label={config.label}
      value={config.key}
      onChange={(v) => onPick(kinds.find((k) => k.key === v)!)}
      width={240}
      options={kinds.filter((k) => !k.denied).map((k) => ({ value: k.key, label: k.label, group: k.group, meta: k.legacyHref ? "↗" : k.count }))}
    />
  );
}

/** The desk's filter chip (DocDesk `FilterChip`), one per applied narrowing. */
function HubChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-surface py-0.5 pl-2 pr-1 text-[11px] font-medium text-bz-text">
      {children}
      <button type="button" onClick={onRemove} className="flex size-4 items-center justify-center rounded-[4px] text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire" aria-label="Remove filter" title="Remove filter">
        <X size={10} />
      </button>
    </span>
  );
}

function RowMenu<R>({ r, menu }: { r: R; menu: (r: R, close: () => void) => React.ReactNode }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button ref={ref} type="button" tabIndex={-1} className={cn(ICON_BTN_SM, "opacity-60 group-hover/row:opacity-100")} onClick={() => setOpen(true)} title="More" aria-label="More">
        <MoreHorizontal size={14} />
      </button>
      <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} align="right" width={200}>
        {menu(r, () => setOpen(false))}
      </Popover>
    </>
  );
}

/** The kind's table: the Grid in row-commit (tier 3) or open-a-sheet (tier 2) mode, banded, with the usage column and the row ⋯. */
export function MasterTable<R extends MasterRow>({
  config,
  rows,
  searching,
  current,
  onOpenRow,
  gridRef,
}: {
  config: MasterKindConfig<R>;
  /** Rows after search and picks. */
  rows: R[];
  searching?: boolean;
  current?: string | null;
  onOpenRow?: (r: R) => void;
  gridRef?: React.Ref<GridHandle>;
}) {
  const tier = config.tier ?? 3;
  const usageCol: GridColumn<R>[] = config.usage
    ? [{ key: "used", label: "Used by", width: "84px", kind: "readonly", align: "right", render: (r) => <Usage counts={config.usage!(r)} tabIndex={-1} noun={config.usageNoun} /> }]
    : [];
  const columns = [...(config.columns ?? []), ...usageCol];
  // A search opens the bands it matches; the band holding the open record is never folded over it.
  const bands = (config.bands ?? usageBands)(rows).map((g) => ((searching && g.rowIds.length) || (current && g.rowIds.includes(current)) ? { ...g, forceOpen: true } : g));
  const shown = bands.filter((g) => g.rowIds.length > 0 || g.key === "archived");
  const n = config.noun ?? ["record", "records"];
  return (
    <Grid<R>
      ariaLabel={config.label}
      columns={columns}
      rows={rows}
      groups={shown}
      mode={tier === 2 || config.readOnly ? "readonly" : "row-commit"}
      onCommitRow={config.onCommitRow}
      ghost={tier === 3 && !config.readOnly && config.blank && config.onAdd ? { blank: config.blank, label: config.addLabel ?? `Add a ${n[0]}`, position: "top", onAdd: config.onAdd } : undefined}
      onOpenRow={tier === 2 ? onOpenRow : undefined}
      rowKeys={config.rowKeys}
      rowAction={config.rowMenu ? (r) => <RowMenu r={r} menu={config.rowMenu!} /> : undefined}
      current={current}
      empty={rows.length === 0 && !searching ? `No ${n[1]} yet.` : undefined}
      loading={config.loading}
      loadingText={`Loading ${n[1]}…`}
      gridRef={gridRef}
      tree={config.tree}
      minWidth={config.minWidth}
      bare
    />
  );
}

export function MastersHub({
  kinds,
  active,
  onPick,
  openId,
  onOpen,
  sheet,
  className,
  query,
  onQuery,
}: {
  kinds: MasterKindConfig<any>[];
  active: string;
  /** A list pick — the host routes (`masters/:kind`); a legacy kind goes to its old page. */
  onPick: (kind: MasterKindConfig<any>) => void;
  /** The record whose sheet is open (`masters/:kind/:id`), or "new". */
  openId?: string | null;
  onOpen: (id: string | null) => void;
  /** The open record's MasterSheet; `docked` says where it will sit. */
  sheet?: (ctx: { docked: boolean }) => React.ReactNode;
  className?: string;
  /**
   * Controlled search and statline pick — the host keeps them in the URL (`?q=`, `?pick=`, the desk
   * deep-link contract, bzw trap 30). Without it the hub keeps them itself and drops them on a kind change.
   */
  query?: { q: string; pick: string | null };
  onQuery?: (next: { q: string; pick: string | null }) => void;
}) {
  const config = kinds.find((k) => k.key === active) ?? kinds[0];
  const wide = useMedia("(min-width: 1280px)");
  const large = useMedia("(min-width: 1024px)");
  const [ownQ, setOwnQ] = React.useState("");
  const [ownPick, setOwnPick] = React.useState<string | null>(null);
  const [applied, setApplied] = React.useState<string[]>([]);
  const q = query ? query.q : ownQ;
  const pick = query ? query.pick : ownPick;
  const setQ = (v: string) => (query ? onQuery?.({ q: v, pick }) : setOwnQ(v));
  const setPick = (v: string | null) => (query ? onQuery?.({ q, pick: v }) : setOwnPick(v));
  const searchRef = React.useRef<HTMLInputElement>(null);
  const gridRef = React.useRef<GridHandle>(null);

  React.useEffect(() => {
    setOwnQ("");
    setOwnPick(null);
    setApplied([]);
  }, [active]);

  const all = (config.rows ?? []) as MasterRow[];
  const needle = q.trim().toLowerCase();
  const p = config.picks?.find((x) => x.key === pick);
  const filters = (config.filters ?? []) as FilterOption<MasterRow>[];
  const chips = filters.filter((f) => applied.includes(f.value));
  const byGroup = new Map<string, FilterOption<MasterRow>[]>();
  chips.forEach((f) => byGroup.set(f.group, [...(byGroup.get(f.group) ?? []), f]));
  const rows = all.filter(
    (r) => (!needle || (config.searchText?.(r) ?? "").toLowerCase().includes(needle)) && (!p || p.test(r)) && [...byGroup.values()].every((fs) => fs.some((f) => f.test(r))),
  );
  const narrowed = !!needle || !!p || chips.length > 0;
  const clearAll = () => {
    setApplied([]);
    if (query) onQuery?.({ q: "", pick: null });
    else (setOwnQ(""), setOwnPick(null));
  };
  const tier = config.tier ?? 3;
  const n = config.noun ?? ["record", "records"];
  const canNew = !!config.newLabel && !config.legacyHref && !config.readOnly && !config.denied;
  const isNew = () => (tier === 2 ? onOpen("new") : gridRef.current?.focusGhost());

  useKeys({
    "/": (e) => (e.preventDefault(), searchRef.current?.focus()),
    n: () => canNew && isNew(),
    // Esc is the sheet's: it asks first when something is typed.
  });

  const groups: { name: string; items: MasterKindConfig<any>[] }[] = [];
  for (const k of kinds) {
    if (k.denied) continue; // a kind the reader can't read is not listed (spec §2.2)
    const g = groups.find((x) => x.name === k.group);
    if (g) g.items.push(k);
    else groups.push({ name: k.group, items: [k] });
  }
  // The figures come from the same read as the table: none while it loads or after it failed.
  const picks = config.loading || config.failed ? [] : (config.picks ?? []).filter((x) => x.value > 0 || x.showZero);
  const sheetOpen = !!openId && !!sheet;

  return (
    <div className={cn("flex h-full min-h-0", className)}>
      {/* ── the kinds ─────────────────────────────────────────────────── */}
      {large && (
        <nav aria-label="Masters" className="w-[220px] shrink-0 overflow-y-auto border-r border-bz-line bg-bz-paper px-2 py-3 [scrollbar-width:thin]">
          {groups.map((g) => (
            <div key={g.name} className="mb-3">
              <p className="m-0 px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">{g.name}</p>
              <ul className="m-0 list-none p-0">
                {g.items.map((k) => {
                  const on = k.key === config.key;
                  return (
                    <li key={k.key}>
                      <button
                        type="button"
                        onClick={() => onPick(k)}
                        aria-current={on ? "page" : undefined}
                        title={k.legacyHref ? `${k.label} — opens its current page` : undefined}
                        className={cn(
                          "relative flex w-full items-center gap-2 rounded-bz-sm py-1.5 pl-3 pr-2 text-left text-[12.5px] transition-colors hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire",
                          on ? "font-semibold text-bz-text" : "text-bz-text-muted hover:text-bz-text",
                        )}
                      >
                        {on && <span aria-hidden className="absolute inset-y-1 left-0 w-0.5 rounded-bz-pill bg-bz-fire" />}
                        <span className="min-w-0 flex-1 truncate">{k.label}</span>
                        {k.legacyHref ? <ArrowUpRight size={12} className="shrink-0 text-bz-text-soft" aria-label="opens its current page" /> : k.count !== undefined && <span className={cn("shrink-0 text-[11px] font-normal text-bz-text-soft", NUM)}>{k.count}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      )}

      {/* ── the kind's page ───────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        {config.denied ? (
          <>
            {!large && (
              <div className="border-b border-bz-line bg-bz-paper px-4 py-2">
                <KindSelect kinds={kinds} config={config} onPick={onPick} />
              </div>
            )}
            <div className="p-4 md:p-6">
              <div className={CARD}>
                <Empty icon={DeniedIcon} title={`You don't have access to ${n[1]}.`} />
              </div>
            </div>
          </>
        ) : (
          <>
        {picks.length > 0 && (
          <div className="border-b border-bz-line bg-bz-paper px-4 py-1.5 md:px-6">
            <Statline>
              {picks.map((x) => (
                <Stat key={x.key} label={x.label} value={<span className={cn(x.amber && x.value > 0 && "text-bz-amber-ink")}>{x.value}</span>} danger={x.danger && x.value > 0} title={x.title} active={pick === x.key} onPick={() => setPick(pick === x.key ? null : x.key)} />
              ))}
            </Statline>
          </div>
        )}
        {config.strip && <div className="border-b border-bz-line bg-bz-surface px-4 py-3 md:px-6">{config.strip}</div>}
        <div className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">
          {!large && <KindSelect kinds={kinds} config={config} onPick={onPick} />}
          <SearchField ref={searchRef} value={q} onChange={setQ} placeholder={config.searchPlaceholder ?? "Code or name"} hint="/" className="min-w-[160px] flex-1 md:max-w-[260px]" />
          {filters.length > 0 && !config.failed && (
            <Select
              multiple
              label="Filter"
              icon={FilterIcon}
              badge={chips.length}
              applied={chips.length > 0}
              value={applied}
              onChange={setApplied}
              width={260}
              options={filters.map((f) => ({ value: f.value, label: f.label, group: f.group, hint: f.hint }))}
            />
          )}
          {!config.failed && config.tools}
          {canNew && (
            <button type="button" className={cn(BTN, "ml-auto h-8")} onClick={isNew} title={`${config.newLabel} (N)`}>
              <Plus size={13} /> {config.newLabel} <Kbd>N</Kbd>
            </button>
          )}
        </div>
        {narrowed && (
          <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3 md:px-6">
            <span className={cn("mr-0.5 text-[11px] text-bz-text-soft", NUM)}>
              {rows.length} of {all.length}
            </span>
            {p && <HubChip onRemove={() => setPick(null)}>{p.label}</HubChip>}
            {needle && <HubChip onRemove={() => setQ("")}>“{q.trim()}”</HubChip>}
            {chips.map((c) => (
              <HubChip key={c.value} onRemove={() => setApplied((a) => a.filter((x) => x !== c.value))}>
                <span className="text-bz-text-soft">{c.group} ·</span> {c.label}
              </HubChip>
            ))}
            <Clear onClear={clearAll} />
          </div>
        )}
        <div className="p-4 pb-24 md:p-6 md:pb-24">
          {config.failed ? (
            <div className={CARD}>
              <Failed text={`Couldn't load ${n[1]}.`} onRetry={config.onRetry} />
            </div>
          ) : !config.loading && rows.length === 0 && narrowed ? (
            <div className={CARD}>
              <Empty icon={NoMatchIcon} title={`No ${n[1]} match.`} action={<Clear onClear={clearAll} />} />
            </div>
          ) : !config.loading && all.length === 0 && tier === 2 ? (
            <div className={CARD}>
              <Empty
                title={`No ${n[1]} yet.`}
                action={
                  canNew ? (
                    <button type="button" className={BTN} onClick={isNew}>
                      <Plus size={13} /> {config.newLabel}
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className={cn(CARD, "overflow-clip")}>
              <MasterTable key={config.key} config={config} rows={rows} searching={narrowed} current={openId && openId !== "new" ? openId : null} onOpenRow={(r) => onOpen(r.id)} gridRef={gridRef} />
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* ── the sheet: beside the table from 1280px; floating below that (the sheet portals itself) ── */}
      {sheetOpen && sheet!({ docked: wide })}
    </div>
  );
}
