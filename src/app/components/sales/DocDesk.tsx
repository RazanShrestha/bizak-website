import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronDown, ChevronRight, Plus, SearchX, SlidersHorizontal } from "lucide-react";
import { cn } from "../ui/utils";
import { AppFrame } from "./AppFrame";
import { BTN, CARD, Clear, Empty, GHOST_SM, Kbd, LABEL, NUM, SearchField, Select, Stat, Statline, Tabs, ToastHost, ToastMsg, useToast } from "./bzw";
import { CUSTOMERS, useKeys, useMedia } from "./orders";
import { SalesNav, SectionKey } from "./flow";
import type { ShellCtx } from "./record";

// ════════════════════════════════════════════════════════════════════════════
// DOC DESK — the list side every sales document shares
//
// The order desk is the reference; this is its grammar generalised so that
// estimates, deliveries, invoices, receipts and returns cannot drift from it:
// a statline whose figures are also filters, views that GROUP by what the
// document is waiting for, one search, one customer filter, rows that reveal
// their one next verb on hover, and the record docked beside the list.
// ════════════════════════════════════════════════════════════════════════════

export type Column<T> = { key: string; label: string; width: string; align?: "right"; render: (r: T) => React.ReactNode };
export type Group<T> = { key: string; label: string; rows: T[]; right?: React.ReactNode; alarm?: boolean; icon?: React.ReactNode; collapsed?: boolean; empty?: string };
export type View<T> = { key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; groups: (rows: T[]) => Group<T>[] };
export type Pick<T> = { key: string; label: string; value: React.ReactNode; test: (r: T) => boolean; danger?: boolean; title?: string };
export type PanelCtx = ShellCtx & { show: (kind: ToastMsg["kind"], text: string, action?: ToastMsg["action"], duration?: number) => void; go: (no: string | null) => void };

export function DocDesk<T>({
  section,
  rows,
  noOf,
  customerOf,
  searchText,
  stats = [],
  picks = [],
  views,
  columns,
  primary,
  amount,
  rowVerb,
  newLabel,
  onNew,
  renderPanel,
  renderNew,
}: {
  section: SectionKey;
  rows: T[];
  noOf: (r: T) => string;
  customerOf: (r: T) => string;
  searchText: (r: T) => string;
  stats?: { label: string; value: React.ReactNode; title?: string }[];
  picks?: Pick<T>[];
  views: View<T>[];
  columns: Column<T>[];
  primary: (r: T) => { title: React.ReactNode; sub?: React.ReactNode; subOnDesktop?: boolean };
  amount: (r: T) => { value: React.ReactNode; sub?: React.ReactNode };
  rowVerb?: (r: T) => { label: string; icon: React.ComponentType<{ size?: number }>; run: () => void } | null;
  newLabel?: string;
  onNew?: () => void;
  renderPanel: (r: T, ctx: PanelCtx) => React.ReactNode;
  renderNew?: (ctx: PanelCtx) => React.ReactNode;
}) {
  const base = `/design/sales/${section}`;
  const { no } = useParams();
  const navigate = useNavigate();
  const wide = useMedia("(min-width: 1280px)");
  const { toast, show, dismiss } = useToast();
  const searchRef = React.useRef<HTMLInputElement>(null);

  const [view, setView] = React.useState(views[0].key);
  const [q, setQ] = React.useState("");
  const [pick, setPick] = React.useState<string | null>(null);
  const [customers, setCustomers] = React.useState<string[]>([]);
  const [full, setFull] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  const go = (n: string | null) => navigate(n ? `${base}/${n}` : base);

  const visible = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const p = picks.find((x) => x.key === pick);
    return rows.filter((r) => (!needle || searchText(r).toLowerCase().includes(needle)) && (!customers.length || customers.includes(customerOf(r))) && (!p || p.test(r)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, pick, customers]);

  const current = views.find((v) => v.key === view) ?? views[0];
  const groups = current.groups(visible).filter((g) => g.rows.length > 0 || g.empty);
  const isCollapsed = (g: Group<T>) => (collapsed.has(`${view}:${g.key}`) ? !g.collapsed : !!g.collapsed);
  const walk = groups.flatMap((g) => (isCollapsed(g) ? [] : g.rows));

  const open = no && no !== "new" ? rows.find((r) => noOf(r) === no) ?? null : null;
  const composing = no === "new" && !!renderNew;
  const panelOpen = !!open || composing;
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
    j: () => !composing && step(1),
    k: () => !composing && step(-1),
    n: () => onNew && !composing && onNew(),
    escape: () => panelOpen && !composing && go(null),
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
  };

  const template = compact ? "84px minmax(0,1fr) 132px" : ["84px", "minmax(0,1fr)", ...columns.map((c) => c.width), "132px", "96px"].join(" ");
  const anyFilter = !!pick || !!q || customers.length > 0;

  return (
    <AppFrame title="Sales" titleAside={<SalesNav current={section} />}>
      <div className="flex h-full min-h-0">
        <div className={cn("min-w-0 flex-1 overflow-y-auto [scrollbar-width:thin]", docked && panelFull && "hidden")}>
          {(stats.length > 0 || picks.length > 0) && (
            <div className="border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">
              <Statline>
                {stats.map((s) => (
                  <Stat key={s.label} label={s.label} value={s.value} title={s.title} />
                ))}
                {picks.map((p) => (
                  <Stat
                    key={p.key}
                    label={p.label}
                    value={p.value}
                    danger={p.danger}
                    title={p.title}
                    active={pick === p.key}
                    onPick={() => setPick(pick === p.key ? null : p.key)}
                  />
                ))}
              </Statline>
            </div>
          )}

          <div className="sticky top-0 z-30 border-b border-bz-line bg-bz-paper">
            {views.length > 1 && (
              <div className="px-3 md:px-5">
                <Tabs value={view} onChange={setView} tabs={views.map((v) => ({ value: v.key, label: v.label, icon: v.icon }))} />
              </div>
            )}
            <div className={cn("flex flex-wrap items-center gap-2 px-4 py-2 md:px-6", views.length > 1 && "border-t border-bz-line-soft")}>
              <SearchField ref={searchRef} value={q} onChange={setQ} placeholder="Number, customer or item" hint="/" className="min-w-[180px] flex-1 md:max-w-[300px]" />
              <Select
                multiple
                label="Customer"
                icon={SlidersHorizontal}
                badge={customers.length}
                applied={customers.length > 0}
                value={customers}
                onChange={setCustomers}
                width={280}
                options={CUSTOMERS.map((c) => ({ value: c.id, label: c.name, hint: c.code }))}
              />
              {onNew && newLabel && (
                <button type="button" className={cn(BTN, "ml-auto")} onClick={onNew}>
                  <Plus size={13} /> {newLabel} <Kbd>N</Kbd>
                </button>
              )}
            </div>
            {anyFilter && (
              <div className="flex flex-wrap items-center gap-2 px-4 pb-2 text-[11px] text-bz-text-soft md:px-6">
                <span className={NUM}>
                  {visible.length} of {rows.length}
                </span>
                <Clear onClear={() => (setQ(""), setPick(null), setCustomers([]))} />
              </div>
            )}
          </div>

          <div className="p-4 pb-24 md:p-6 md:pb-24">
            {visible.length === 0 ? (
              <div className={CARD}>
                <Empty icon={SearchX} title={rows.length ? "Nothing matches." : "Nothing here yet."} action={anyFilter ? <Clear onClear={() => (setQ(""), setPick(null), setCustomers([]))} /> : undefined} />
              </div>
            ) : (
              <div className={cn(CARD, "overflow-hidden")}>
                {!compact && (
                  <div className={cn("hidden items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 md:grid", LABEL)} style={{ gridTemplateColumns: template }}>
                    <span>No.</span>
                    <span>Customer</span>
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
                  const headed = groups.length > 1 || g.label;
                  return (
                    <section key={g.key}>
                      {headed && (
                        <div className={cn("flex items-center gap-2 border-b border-bz-line-soft px-3 py-2", g.alarm && g.rows.length ? "bg-bz-red-soft" : "bg-bz-paper-warm/60")}>
                          <button
                            type="button"
                            onClick={() => setCollapsed((s) => { const n = new Set(s); const k = `${view}:${g.key}`; n.has(k) ? n.delete(k) : n.add(k); return n; })}
                            className="inline-flex min-w-0 items-center gap-1.5 text-left"
                          >
                            {shut ? <ChevronRight size={13} className="text-bz-text-soft" /> : <ChevronDown size={13} className="text-bz-text-soft" />}
                            {g.icon}
                            <h3 className={cn("m-0 truncate text-[12.5px] font-semibold", g.alarm && g.rows.length ? "text-bz-red" : "text-bz-text")}>{g.label}</h3>
                            <span className={cn("rounded-bz-sm bg-bz-surface/70 px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>{g.rows.length}</span>
                          </button>
                          {g.right && <span className="ml-auto text-[11px] text-bz-text-soft">{g.right}</span>}
                        </div>
                      )}
                      {!shut && g.rows.length === 0 && g.empty && <p className="m-0 border-b border-bz-line-soft px-3.5 py-3 text-[11.5px] text-bz-text-soft">{g.empty}</p>}
                      {!shut &&
                        g.rows.map((r) => {
                          const n = noOf(r);
                          const p = primary(r);
                          const a = amount(r);
                          const verb = rowVerb?.(r);
                          const active = open && noOf(open) === n;
                          return (
                            <div
                              key={n}
                              role="button"
                              tabIndex={0}
                              onClick={() => go(n)}
                              onKeyDown={(e) => e.key === "Enter" && go(n)}
                              className={cn(
                                "group relative grid cursor-pointer items-center gap-3 border-b border-bz-line-soft px-3 py-2.5 transition-colors last:border-0 max-md:!grid-cols-[minmax(0,1fr)_auto]",
                                active ? "bg-bz-fire/10" : "bg-bz-surface hover:bg-bz-paper-warm",
                              )}
                              style={{ gridTemplateColumns: template }}
                            >
                              {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-bz-fire" />}
                              <span className={cn("hidden text-[11.5px] font-medium text-bz-text-muted md:block", NUM)}>{n}</span>
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
                              <span className="text-right">
                                <span className="block text-[12.5px] font-semibold text-bz-text">{a.value}</span>
                                {a.sub && <span className="block text-[10.5px] text-bz-text-soft">{a.sub}</span>}
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
              {composing ? renderNew!(ctx) : open && renderPanel(open, ctx)}
            </div>
          </>
        )}
      </div>
      <ToastHost toast={toast} onDismiss={dismiss} />
    </AppFrame>
  );
}
