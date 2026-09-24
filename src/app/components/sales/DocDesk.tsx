import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowDownUp, ChevronDown, ChevronRight, Keyboard, Plus, SearchX, SlidersHorizontal, Trash2, X } from "lucide-react";
import { cn } from "../ui/utils";
import { AppFrame } from "./AppFrame";
import { BTN, BulkBar, BulkBtn, CARD, Checkbox, Clear, Empty, GHOST_SM, ICON_BTN, Kbd, LABEL, MenuItem, NUM, Popover, SearchField, Select, SelectOption, SkeletonRows, Stat, Statline, Tabs, ToastHost, useToast } from "./bzw";
import { fmtShort, useKeys, useMedia } from "./orders";
import { bsDate } from "./master";
import { ConfirmDialog, ExportMenu, PERIODS, Period, PeriodSelect } from "./parts";
import type { ShellCtx } from "./record";

// ════════════════════════════════════════════════════════════════════════════
// DOC DESK — the list side every sales document shares
//
// One implementation for all six desks, so the list grammar cannot drift:
//
//   • a statline whose figures are also filters;
//   • views that GROUP by what the document is waiting for;
//   • one toolbar row: search · Filter (subsidiary, location, each status axis,
//     customer — one grouped menu) · period (fiscal presets or a range) · sort;
//     export sits with the view tabs, where it reads as "this list";
//   • what is applied shows as removable chips, with one Clear;
//   • a row reveals its one next verb on hover and expands to its lines;
//   • a selection is a mode: the dark bulk bar, which reports the split
//     (done · skipped and why) rather than "done";
//   • the record docks beside the list; composing and editing take the page.
// ════════════════════════════════════════════════════════════════════════════

export type Column<T> = { key: string; label: string; width: string; align?: "right"; render: (r: T) => React.ReactNode };
export type Group<T> = { key: string; label: string; rows: T[]; right?: React.ReactNode; alarm?: boolean; icon?: React.ReactNode; collapsed?: boolean; empty?: string };
export type View<T> = { key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; groups: (rows: T[]) => Group<T>[] };
export type Pick<T> = { key: string; label: string; value: React.ReactNode; test: (r: T) => boolean; danger?: boolean; title?: string };
export type FilterOption<T> = { value: string; label: string; group: string; test: (r: T) => boolean; hint?: string };
export type Sort<T> = { key: string; label: string; by: (r: T) => string | number; desc?: boolean };
export type BulkResult = { done: number; skipped: string[]; verb: string };
export type BulkAction<T> = { label: string; icon: React.ComponentType<{ size?: number }>; enabled: (rows: T[]) => boolean; run: (rows: T[]) => BulkResult; title?: string };
export type PanelCtx = ShellCtx & { go: (no: string | null, params?: Record<string, string>) => void; mode: string | null };

export function DocDesk<T>({
  module = "Sales",
  section,
  nav,
  rows,
  loading,
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
  rowVerb,
  renderExpand,
  bulk = [],
  onDelete,
  newLabel,
  onNew,
  renderPanel,
  renderNew,
  noun,
  partyLabel = "Customer",
  searchPlaceholder = "Number, customer or item",
  fullModes = [],
}: {
  /** The frame title — "Sales", "Purchasing". */
  module?: string;
  /** The path segment under /design/<module>/ that names this desk. */
  section: string;
  /** The module's own switcher, drawn beside the title. */
  nav?: React.ReactNode;
  rows: T[];
  loading?: boolean;
  noOf: (r: T) => string;
  searchText: (r: T) => string;
  dateOf: (r: T) => string;
  stats?: { label: string; value: React.ReactNode; title?: string }[];
  picks?: Pick<T>[];
  views: View<T>[];
  filters?: FilterOption<T>[];
  sorts?: Sort<T>[];
  columns: Column<T>[];
  primary: (r: T) => { title: React.ReactNode; sub?: React.ReactNode; subOnDesktop?: boolean };
  amount: (r: T) => { value: React.ReactNode; sub?: React.ReactNode };
  rowVerb?: (r: T) => { label: string; icon: React.ComponentType<{ size?: number }>; run: () => void } | null;
  renderExpand?: (r: T) => React.ReactNode;
  bulk?: BulkAction<T>[];
  /** Deletes what it can; each skipped entry starts with the document number. */
  onDelete?: (rows: T[]) => { done: number; skipped: string[] };
  newLabel?: string;
  onNew?: () => void;
  renderPanel: (r: T, ctx: PanelCtx) => React.ReactNode;
  renderNew?: (ctx: PanelCtx) => React.ReactNode;
  noun: [string, string];
  /** What the primary column is called — "Customer" on sales, "Vendor" on a purchase desk. */
  partyLabel?: string;
  searchPlaceholder?: string;
  /** `do=` modes that are a FORM, not a panel view — they take the page, like composing. */
  fullModes?: string[];
}) {
  const base = `/design/${section}`;
  const { no } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const wide = useMedia("(min-width: 1280px)");
  const { toast, show, dismiss } = useToast();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const sortRef = React.useRef<HTMLButtonElement>(null);
  const keysRef = React.useRef<HTMLButtonElement>(null);

  const [view, setView] = React.useState(views[0].key);
  const [q, setQ] = React.useState("");
  const [pick, setPick] = React.useState<string | null>(() => {
    const p = new URLSearchParams(window.location.search).get("pick");
    return picks.some((x) => x.key === p) ? p : null;
  });
  const [applied, setApplied] = React.useState<string[]>([]);
  const [period, setPeriod] = React.useState<Period>(PERIODS[0]);
  const [sortKey, setSortKey] = React.useState(sorts[0]?.key ?? "");
  const [sortOpen, setSortOpen] = React.useState(false);
  const [keysOpen, setKeysOpen] = React.useState(false);
  const [full, setFull] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkNote, setBulkNote] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const go = (n: string | null, params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    navigate(n ? `${base}/${n}${qs}` : base);
  };
  const mode = search.get("do");

  const visible = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const p = picks.find((x) => x.key === pick);
    const byGroup = new Map<string, FilterOption<T>[]>();
    filters.filter((f) => applied.includes(f.value)).forEach((f) => byGroup.set(f.group, [...(byGroup.get(f.group) ?? []), f]));
    const s = sorts.find((x) => x.key === sortKey);
    const out = rows.filter((r) => {
      if (needle && !searchText(r).toLowerCase().includes(needle)) return false;
      if (p && !p.test(r)) return false;
      // OR within a group, AND across groups — how the app's filter drawer reads.
      for (const opts of byGroup.values()) if (!opts.some((o) => o.test(r))) return false;
      const d = dateOf(r);
      if (period.from && d < period.from) return false;
      if (period.to && d > period.to) return false;
      return true;
    });
    if (s) out.sort((a, b) => (s.by(a) < s.by(b) ? -1 : s.by(a) > s.by(b) ? 1 : 0) * (s.desc ? -1 : 1));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, pick, applied, period, sortKey]);

  const current = views.find((v) => v.key === view) ?? views[0];
  const groups = current.groups(visible).filter((g) => g.rows.length > 0 || g.empty);
  const isCollapsed = (g: Group<T>) => (collapsed.has(`${view}:${g.key}`) ? !g.collapsed : !!g.collapsed);
  const walk = groups.flatMap((g) => (isCollapsed(g) ? [] : g.rows));

  const open = no && no !== "new" ? rows.find((r) => noOf(r) === no) ?? null : null;
  const composing = (no === "new" && !!renderNew) || (!!open && !!mode && (mode === "edit" || fullModes.includes(mode)));
  const panelOpen = !!open || (no === "new" && !!renderNew);
  const docked = wide && panelOpen;
  const panelFull = composing || full;
  const compact = docked && !panelFull;

  const step = (d: 1 | -1) => {
    if (!walk.length) return;
    const i = open ? walk.findIndex((r) => noOf(r) === noOf(open)) : -1;
    go(noOf(walk[(i + d + walk.length) % walk.length]));
  };

  useKeys({
    "/": (e) => (e.preventDefault(), searchRef.current?.focus()),
    j: () => !composing && !mode && step(1),
    k: () => !composing && !mode && step(-1),
    n: () => onNew && !composing && onNew(),
    escape: () => {
      if (composing) return;
      if (open && mode) return go(noOf(open));
      if (panelOpen) return go(null);
      if (selected.size) setSelected(new Set());
    },
  });

  const ctx: PanelCtx = {
    docked,
    full: panelFull,
    position: open ? { index: Math.max(0, walk.findIndex((r) => noOf(r) === noOf(open))), total: walk.length } : null,
    onPrev: () => step(-1),
    onNext: () => step(1),
    onToggleFull: () => setFull((v) => !v),
    onClose: () => go(null),
    show,
    go,
    mode,
  };

  const chips = filters.filter((f) => applied.includes(f.value));
  const anyFilter = !!pick || !!q || chips.length > 0 || period.key !== "all";
  const clearAll = () => (setQ(""), setPick(null), setApplied([]), setPeriod(PERIODS[0]));
  const pickedRows = rows.filter((r) => selected.has(noOf(r)));
  const report = (res: BulkResult) => {
    if (res.skipped.length) {
      setSelected(new Set(res.skipped.map((s) => s.split(" ")[0])));
      setBulkNote(`${res.done} ${res.verb} · ${res.skipped.length} skipped`);
      show("error", `${res.done} ${res.verb}. Skipped: ${res.skipped.join("; ")}.`, undefined, 0);
    } else {
      setSelected(new Set());
      setBulkNote(null);
      show("success", `${res.done} ${res.done === 1 ? noun[0] : noun[1]} ${res.verb}`);
    }
  };
  const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, k: string, on?: boolean) =>
    set((s) => {
      const n = new Set(s);
      if (on ?? !n.has(k)) n.add(k);
      else n.delete(k);
      return n;
    });

  const template = compact ? "20px 84px minmax(0,1fr) 132px" : ["20px", "96px", "minmax(0,1fr)", ...columns.map((c) => c.width), "132px", "92px"].join(" ");
  const sort = sorts.find((s) => s.key === sortKey);
  const filterOptions: SelectOption[] = filters.map((f) => ({ value: f.value, label: f.label, group: f.group, hint: f.hint }));

  return (
    <AppFrame title={module} titleAside={nav}>
      <div className="flex h-full min-h-0">
        <div className={cn("min-w-0 flex-1 overflow-y-auto [scrollbar-width:thin]", docked && panelFull && "hidden")}>
          {(stats.length > 0 || picks.length > 0) && (
            <div className="border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">
              <Statline>
                {stats.map((s) => (
                  <Stat key={s.label} label={s.label} value={s.value} title={s.title} />
                ))}
                {picks.map((p) => (
                  <Stat key={p.key} label={p.label} value={p.value} danger={p.danger} title={p.title} active={pick === p.key} onPick={() => setPick(pick === p.key ? null : p.key)} />
                ))}
              </Statline>
            </div>
          )}

          <div className="sticky top-0 z-30 border-b border-bz-line bg-bz-paper">
            <div className="flex items-center px-3 md:px-5">
              <div className="min-w-0 flex-1">
                {views.length > 1 ? <Tabs value={view} onChange={setView} tabs={views.map((v) => ({ value: v.key, label: v.label, icon: v.icon }))} /> : <div className="flex h-11 items-center px-1 text-[12.5px] font-semibold text-bz-text">{views[0].label}</div>}
              </div>
              <div className="flex shrink-0 items-center gap-0.5 pl-2">
                <button ref={keysRef} type="button" className={cn(ICON_BTN, "hidden md:inline-flex")} onClick={() => setKeysOpen(true)} title="Keyboard shortcuts">
                  <Keyboard size={14} />
                </button>
                <ExportMenu onExport={(k) => show("success", `${k === "summary" ? "Summary" : "Item detail"} of ${visible.length} ${noun[1]} exported to Excel`)} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-bz-line-soft px-4 py-2 md:px-6">
              <SearchField ref={searchRef} value={q} onChange={setQ} placeholder={searchPlaceholder} hint="/" className="min-w-[180px] flex-1 md:max-w-[260px]" />
              {filters.length > 0 && <Select multiple label="Filter" icon={SlidersHorizontal} badge={chips.length} applied={chips.length > 0} value={applied} onChange={setApplied} width={290} options={filterOptions} placeholder="Subsidiary, location, status…" />}
              <PeriodSelect value={period} onChange={setPeriod} />
              {sorts.length > 0 && (
                <>
                  <button ref={sortRef} type="button" onClick={() => setSortOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm" title="Sort">
                    <ArrowDownUp size={12} className="text-bz-text-muted" /> <span className="hidden sm:inline">{sort?.label}</span>
                  </button>
                  <Popover open={sortOpen} anchor={sortRef.current} onClose={() => setSortOpen(false)} width={200}>
                    {sorts.map((s) => (
                      <MenuItem key={s.key} active={s.key === sortKey} onClick={() => (setSortKey(s.key), setSortOpen(false))}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Popover>
                </>
              )}
              {onNew && newLabel && (
                <button type="button" className={cn(BTN, "ml-auto")} onClick={onNew}>
                  <Plus size={13} /> {newLabel} <Kbd>N</Kbd>
                </button>
              )}
            </div>
            {anyFilter && (
              <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2 md:px-6">
                <span className={cn("mr-0.5 text-[11px] text-bz-text-soft", NUM)}>
                  {visible.length} of {rows.length}
                </span>
                {pick && <FilterChip onRemove={() => setPick(null)}>{picks.find((p) => p.key === pick)?.label}</FilterChip>}
                {period.key !== "all" && <FilterChip onRemove={() => setPeriod(PERIODS[0])}>{period.key === "custom" ? "Custom dates" : period.label}</FilterChip>}
                {q && <FilterChip onRemove={() => setQ("")}>“{q}”</FilterChip>}
                {chips.map((c) => (
                  <FilterChip key={c.value} onRemove={() => setApplied((a) => a.filter((x) => x !== c.value))}>
                    <span className="text-bz-text-soft">{c.group} ·</span> {c.label}
                  </FilterChip>
                ))}
                <Clear onClear={clearAll} />
              </div>
            )}
          </div>

          <div className="p-4 pb-24 md:p-6 md:pb-24">
            {loading ? (
              <div className={cn(CARD, "overflow-hidden")}>
                <SkeletonRows />
              </div>
            ) : visible.length === 0 ? (
              <div className={CARD}>
                <Empty
                  icon={rows.length ? SearchX : undefined}
                  title={rows.length ? `No ${noun[1]} match.` : `No ${noun[1]} yet.`}
                  action={anyFilter ? <Clear onClear={clearAll} /> : onNew && newLabel ? <button type="button" className={BTN} onClick={onNew}><Plus size={13} /> {newLabel}</button> : undefined}
                />
              </div>
            ) : (
              <div className={cn(CARD, "overflow-hidden")}>
                {!compact && (
                  <div className={cn("hidden items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 md:grid", LABEL)} style={{ gridTemplateColumns: template }}>
                    <span>
                      <Checkbox
                        on={walk.length > 0 && walk.every((r) => selected.has(noOf(r)))}
                        mixed={walk.some((r) => selected.has(noOf(r))) && !walk.every((r) => selected.has(noOf(r)))}
                        onChange={(v) => (setBulkNote(null), setSelected(v ? new Set(walk.map(noOf)) : new Set()))}
                        label="Select all shown"
                      />
                    </span>
                    <span>No.</span>
                    <span>{partyLabel}</span>
                    {columns.map((c) => (
                      <span key={c.key} className={c.align === "right" ? "text-right" : ""}>
                        {c.label}
                      </span>
                    ))}
                    <span className="text-right">Amount</span>
                    <span />
                  </div>
                )}
                {groups.map((g) => {
                  const shut = isCollapsed(g);
                  const headed = groups.length > 1 || !!g.label;
                  const ids = g.rows.map(noOf);
                  const nSel = ids.filter((id) => selected.has(id)).length;
                  return (
                    <section key={g.key}>
                      {headed && (
                        <div className={cn("flex items-center gap-2 border-b border-bz-line-soft px-3 py-2", g.alarm && g.rows.length ? "bg-bz-red-soft" : "bg-bz-paper-warm/60")}>
                          <Checkbox on={ids.length > 0 && nSel === ids.length} mixed={nSel > 0 && nSel < ids.length} onChange={(v) => (setBulkNote(null), setSelected((s) => { const n = new Set(s); ids.forEach((id) => (v ? n.add(id) : n.delete(id))); return n; }))} label={`Select all in ${g.label}`} />
                          <button type="button" onClick={() => toggle(setCollapsed, `${view}:${g.key}`)} className="inline-flex min-w-0 items-center gap-1.5 text-left">
                            {shut ? <ChevronRight size={13} className="text-bz-text-soft" /> : <ChevronDown size={13} className="text-bz-text-soft" />}
                            {g.icon}
                            <h3 className={cn("m-0 truncate text-[12.5px] font-semibold", g.alarm && g.rows.length ? "text-bz-red" : "text-bz-text")}>{g.label}</h3>
                            <span className={cn("rounded-bz-sm bg-bz-surface/70 px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>{g.rows.length}</span>
                          </button>
                          {g.right && <span className="ml-auto whitespace-nowrap text-[11px] text-bz-text-soft">{g.right}</span>}
                        </div>
                      )}
                      {!shut && g.rows.length === 0 && g.empty && <p className="m-0 border-b border-bz-line-soft px-3.5 py-3 text-[11.5px] text-bz-text-soft">{g.empty}</p>}
                      {!shut &&
                        g.rows.map((r) => {
                          const n = noOf(r);
                          const p = primary(r);
                          const a = amount(r);
                          const verb = rowVerb?.(r);
                          const active = !!open && noOf(open) === n;
                          const isSel = selected.has(n);
                          const isExp = expanded.has(n) && !compact;
                          return (
                            <div key={n} className="border-b border-bz-line-soft last:border-0">
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => go(n)}
                                onKeyDown={(e) => e.key === "Enter" && go(n)}
                                className={cn(
                                  "group relative grid cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire max-md:!grid-cols-[20px_minmax(0,1fr)_auto]",
                                  active || isSel ? "bg-bz-fire/10" : "bg-bz-surface hover:bg-bz-paper-warm",
                                )}
                                style={{ gridTemplateColumns: template }}
                              >
                                {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-bz-fire" />}
                                <span className={cn(isSel ? "opacity-100" : "opacity-40 group-hover:opacity-100")}>
                                  <Checkbox on={isSel} onChange={(v) => (setBulkNote(null), toggle(setSelected, n, v))} label={`Select ${n}`} />
                                </span>
                                <span className={cn("hidden items-center gap-1 text-[11.5px] font-medium text-bz-text-muted md:flex", NUM)}>
                                  {renderExpand && !compact && (
                                    <button
                                      type="button"
                                      onClick={(e) => (e.stopPropagation(), toggle(setExpanded, n))}
                                      className="-ml-1 flex size-4 shrink-0 items-center justify-center rounded-[4px] text-bz-text-soft hover:bg-bz-line-soft hover:text-bz-text"
                                      aria-label={isExp ? "Hide lines" : "Show lines"}
                                      title={isExp ? "Hide lines" : "Show lines"}
                                    >
                                      <ChevronRight size={11} className={cn("transition-transform", isExp && "rotate-90")} />
                                    </button>
                                  )}
                                  {n}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-[12.5px] text-bz-text">{p.title}</span>
                                  <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM, !compact && !p.subOnDesktop && "md:hidden", compact && !p.sub && "hidden")}>
                                    <span className="md:hidden">{n}</span>
                                    {p.sub && (
                                      <>
                                        <span className="md:hidden"> · </span>
                                        {p.sub}
                                      </>
                                    )}
                                  </span>
                                </span>
                                {!compact &&
                                  columns.map((c) => (
                                    <span key={c.key} className={cn("hidden min-w-0 truncate text-[11.5px] text-bz-text-muted md:block", c.align === "right" && "text-right")}>
                                      {c.render(r)}
                                    </span>
                                  ))}
                                <span className="min-w-0 text-right">
                                  <span className="block text-[12.5px] font-semibold text-bz-text">{a.value}</span>
                                  {a.sub && <span className="block truncate text-[10.5px] text-bz-text-soft">{a.sub}</span>}
                                </span>
                                {!compact && (
                                  <span className="hidden justify-end md:flex" onClick={(e) => e.stopPropagation()}>
                                    {verb ? (
                                      <button type="button" onClick={verb.run} className={cn(GHOST_SM, "h-7 px-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100")}>
                                        <verb.icon size={11} /> {verb.label}
                                      </button>
                                    ) : (
                                      <ChevronRight size={13} className="text-bz-text-soft" />
                                    )}
                                  </span>
                                )}
                              </div>
                              {isExp && renderExpand && <div className="hidden border-t border-dashed border-bz-line-soft bg-bz-paper py-2 pl-[128px] pr-[104px] md:block">{renderExpand(r)}</div>}
                            </div>
                          );
                        })}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {panelOpen && (
          <>
            {!docked && <div className="absolute inset-0 z-40 bg-bz-olive-dark/25" onClick={() => !composing && go(null)} />}
            <div className={cn(docked ? cn("relative h-full min-h-0 shrink-0", panelFull ? "flex-1" : "w-[720px]") : "absolute inset-y-0 right-0 z-50 w-full", !docked && !composing && "max-w-[720px]")}>
              {no === "new" && renderNew ? renderNew(ctx) : open && renderPanel(open, ctx)}
            </div>
          </>
        )}
      </div>

      <Popover open={keysOpen} anchor={keysRef.current} onClose={() => setKeysOpen(false)} align="right" width={250}>
        <p className={cn(LABEL, "m-0 px-2 pb-1 pt-1.5")}>Keyboard</p>
        {[
          ["N", "New"],
          ["/", "Search"],
          ["J / K", "Next / previous"],
          ["A", "Approve"],
          ["E", "Edit"],
          ["⌘P", "Print"],
          ["⌘↵", "Save"],
          ["Esc", "Back / close"],
        ].map(([k, label]) => (
          <div key={k} className="flex items-center justify-between px-2 py-1 text-[12px] text-bz-text">
            {label} <Kbd>{k}</Kbd>
          </div>
        ))}
      </Popover>

      <BulkBar count={selected.size} onClear={() => (setSelected(new Set()), setBulkNote(null))} note={bulkNote}>
        {bulk.map((b) => (
          <BulkBtn key={b.label} title={b.title} disabled={!b.enabled(pickedRows)} onClick={() => report(b.run(pickedRows))}>
            <b.icon size={12} /> {b.label}
          </BulkBtn>
        ))}
        {onDelete && (
          <BulkBtn onClick={() => setConfirmDelete(true)}>
            <Trash2 size={12} /> Delete
          </BulkBtn>
        )}
      </BulkBar>
      <ConfirmDialog
        open={confirmDelete}
        eyebrow={`${selected.size} selected`}
        title={`Delete ${selected.size} ${selected.size === 1 ? noun[0] : noun[1]}?`}
        body="Anything already delivered, billed or paid against is skipped. The rest can't be recovered."
        confirm="Delete"
        danger
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          if (onDelete) report({ ...onDelete(pickedRows), verb: "deleted" });
        }}
      />
      <ToastHost toast={toast} onDismiss={dismiss} lifted={selected.size > 0} />
    </AppFrame>
  );
}

function FilterChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-surface py-0.5 pl-2 pr-1 text-[11px] font-medium text-bz-text">
      {children}
      <button type="button" onClick={onRemove} className="flex size-4 items-center justify-center rounded-[4px] text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text" aria-label="Remove filter">
        <X size={10} />
      </button>
    </span>
  );
}

/** The expanded row: the document's lines, one quiet line each. */
export function ExpandLines({ rows }: { rows: { name: string; qty: string; amount: React.ReactNode; note?: string }[] }) {
  return (
    <div className="flex flex-col gap-1">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_120px_120px] gap-3 text-[11.5px]">
          <span className="truncate text-bz-text">
            {r.name}
            {r.note && <span className="ml-2 text-bz-text-soft">{r.note}</span>}
          </span>
          <span className={cn("text-right text-bz-text-muted", NUM)}>{r.qty}</span>
          <span className="text-right text-bz-text-muted">{r.amount}</span>
        </div>
      ))}
    </div>
  );
}

/** A list date: AD over its BS date, the way the app's grids show both. */
export function DateCell({ iso }: { iso: string }) {
  return (
    <span className={cn("inline-flex flex-col leading-tight", NUM)}>
      <span className="text-bz-text-muted">{fmtShort(iso)}</span>
      <span className="text-[10px] text-bz-text-soft">{bsDate(iso)}</span>
    </span>
  );
}
