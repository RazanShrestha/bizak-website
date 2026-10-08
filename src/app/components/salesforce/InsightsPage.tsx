import * as React from "react";
import { Link } from "react-router";
import { Crosshair, Receipt, ShoppingBag, Store, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import type { Customer, Source, Visit } from "./data";
import { NO_TYPE, customerById, day, npr, typeOf } from "./engine";
import { THIS_MONTH, evaluateHub, monthLabel, orderTotal, pct, strikeRate } from "./field-data";
import { forShopId } from "./orders-parts";
import { useFieldStores } from "./field-kit";
import { Kpi, Panel, PillTabs, Ring, TickBar, inkOf, short } from "./fx";
import type { Ink } from "./fx";
import { FxEmpty } from "./fx-table";
import { ledgerStore, productsStore } from "./store";
import { SfShell, TypeMark, Who, sfPath } from "./sf";

// ════════════════════════════════════════════════════════════════════════════
// TEAM · INSIGHTS — counted from the stores, nothing invented
//
// Primary sales = orders the hub approved, priced by the engine. Orders for
// served shops = those approved orders a rep billed to a shop's distributor
// (decision #26). A dealer's own notebook on the portal is theirs alone and is
// never read here. Strike rate = finished visits that took an order. Scheme
// spend = the benefit the engine gave on approved orders inside each scheme's
// own dates.
//
// Four figures, then each breakdown as a panel: a small chart and its rows.
// A click on a channel, a customer type or a rep narrows the whole page to
// that slice — the three an order row carries — and the slice sits in the
// head as a pill to take off again. A breakdown keeps all of its own rows
// while its slice is on, so the reader can step to the next one.
// ════════════════════════════════════════════════════════════════════════════

const SOURCE: Record<Source, string> = { rep: "Reps", portal: "Dealer portal", whatsapp: "WhatsApp", "retailer-app": "Retailer app", "back-office": "Back office" };
/** The channels are kinds, not grades: the identity inks tell them apart, as on the Overview. */
const SOURCE_INK: Record<Source, Ink> = { rep: "accent", portal: "indigo", "back-office": "soft", whatsapp: "teal", "retailer-app": "ochre" };
type Period = "month" | "all";

/** What a click can narrow the page by. */
type Dim = "channel" | "type" | "rep";
type Filter = Partial<Record<Dim, string>>;
const DIMS: Dim[] = ["channel", "type", "rep"];
const DIM_NAME: Record<Dim, string> = { channel: "Channel", type: "Customer type", rep: "Rep" };

const typeKey = (c: Customer | undefined) => typeOf(c).id || "none";
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

type Group = { key: string; label: string; sub?: string; value: number; n: number };
function groupBy<T>(rows: T[], key: (r: T) => { key: string; label: string; sub?: string }, value: (r: T) => number): Group[] {
  const m = new Map<string, Group>();
  for (const r of rows) {
    const k = key(r);
    const g = m.get(k.key) ?? { key: k.key, label: k.label, sub: k.sub, value: 0, n: 0 };
    g.value += value(r);
    g.n += 1;
    m.set(k.key, g);
  }
  return [...m.values()].sort((a, b) => b.value - a.value);
}

// ── A breakdown's rows ──────────────────────────────────────────────────────

const ROW = "-mx-2 grid w-[calc(100%+1rem)] items-center gap-3 rounded-[10px] px-2 py-2 text-left";
const ROW_BAR = "grid-cols-[minmax(0,1fr)_72px_84px] sm:grid-cols-[minmax(0,1fr)_minmax(96px,200px)_96px]";
const ROW_LIVE = "transition-[background-color,opacity] hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire";
const ROW_ON = "bg-[color-mix(in_srgb,var(--fx-accent)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--fx-accent)_16%,transparent)]";

/** A tick bar that keeps its ticks readable: fewer of them in a phone's narrow track. */
function Bar({ pct: p, ink = "accent" }: { pct: number; ink?: Ink }) {
  return (
    <>
      <TickBar pct={p} ink={ink} ticks={12} className="sm:hidden" />
      <TickBar pct={p} ink={ink} className="hidden sm:flex" />
    </>
  );
}

/** One row of a breakdown: what it is, its bar, its figure. With `onClick` it narrows the page to itself. */
function Row({
  lead,
  name,
  sub,
  bar,
  figure,
  small,
  warn,
  title,
  on,
  dim,
  onClick,
}: {
  lead?: React.ReactNode;
  name: React.ReactNode;
  sub?: React.ReactNode;
  /** Left out, the row is a name and its figure — the panel's chart is drawn beside the rows. */
  bar?: { pct: number; ink?: Ink };
  figure: React.ReactNode;
  small?: React.ReactNode;
  warn?: "amber" | "red";
  title?: string;
  /** The page is narrowed to this row. */
  on?: boolean;
  /** The page is narrowed to another row of this breakdown. */
  dim?: boolean;
  onClick?: () => void;
}) {
  const cls = cn(ROW, bar ? ROW_BAR : "grid-cols-[minmax(0,1fr)_auto]", onClick && ROW_LIVE, on && ROW_ON, dim && "opacity-50 hover:opacity-100");
  const cells = (
    <>
      <span className="flex min-w-0 items-center gap-2.5">
        {lead}
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-[13px] text-bz-text", on && "font-semibold")}>{name}</span>
          {sub && <span className={cn("block truncate text-[11px] text-bz-text-soft", NUM)}>{sub}</span>}
        </span>
      </span>
      {bar && <Bar pct={bar.pct} ink={bar.ink} />}
      <span className={cn("min-w-0 text-right", NUM)}>
        <span className={cn("block truncate text-[13px] font-semibold", warn === "amber" ? "text-bz-amber-ink" : warn === "red" ? "text-bz-red" : "text-bz-text")}>{figure}</span>
        {small && <span className="block truncate text-[11px] text-bz-text-soft">{small}</span>}
      </span>
    </>
  );
  return onClick ? (
    <button type="button" aria-pressed={!!on} title={title} onClick={onClick} className={cls}>
      {cells}
    </button>
  ) : (
    <div title={title} className={cls}>
      {cells}
    </div>
  );
}

/** A panel's rows. A long list shows its first six — and the one the page is narrowed to — until asked for the rest. */
function Rows<T>({ items, idOf, pinned, limit = 6, children }: { items: T[]; idOf: (x: T) => string; pinned?: (x: T) => boolean; limit?: number; children: (x: T) => React.ReactNode }) {
  const [all, setAll] = React.useState(false);
  const shown = all || items.length <= limit ? items : items.filter((x, i) => i < limit || pinned?.(x));
  return (
    <div className="min-w-0 flex-1">
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {shown.map((x) => (
          <li key={idOf(x)}>{children(x)}</li>
        ))}
      </ul>
      {items.length > limit && (
        <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className={cn("-ml-2 mt-1.5 inline-flex h-7 items-center rounded-bz-md px-2 text-[12px] font-medium text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire", NUM)}>
          {all ? "Show fewer" : `Show all ${items.length}`}
        </button>
      )}
    </div>
  );
}

const None = ({ children }: { children: React.ReactNode }) => <p className="m-0 text-[12px] text-bz-text-soft">{children}</p>;
/** A quiet word at the right of a panel's title. */
const Aside = ({ children, className }: { children: React.ReactNode; className?: string }) => <span className={cn("mr-1.5 whitespace-nowrap text-[11px] text-bz-text-soft", NUM, className)}>{children}</span>;

/** A figure over its caption — the scheme row's spend and sales. */
function Fig({ value, cap, className, red }: { value: React.ReactNode; cap: React.ReactNode; className?: string; red?: boolean }) {
  return (
    <span className={cn("min-w-0 text-right", NUM, className)}>
      <span className={cn("block truncate text-[13px] font-semibold", red ? "text-bz-red" : "text-bz-text")}>{value}</span>
      <span className="block truncate text-[11px] text-bz-text-soft">{cap}</span>
    </span>
  );
}

// ── The page ────────────────────────────────────────────────────────────────

export function InsightsPage() {
  const s = useFieldStores();
  useStore(productsStore);
  useStore(ledgerStore);
  const [period, setPeriod] = React.useState<Period>("month");
  const [filter, setFilter] = React.useState<Filter>({});
  const active = DIMS.filter((d) => filter[d]);
  const narrowed = active.length > 0;
  const inPeriod = (date: string) => period === "all" || date.startsWith(THIS_MONTH);

  /** Narrow the page to a row; the same row again lets go of it. */
  const toggle = (dim: Dim, key: string) =>
    setFilter((f) => {
      const next = { ...f };
      if (next[dim] === key) delete next[dim];
      else next[dim] = key;
      return next;
    });

  // Esc takes every slice off, unless something on top of the page has the key.
  React.useEffect(() => {
    if (!narrowed) return;
    const on = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || document.querySelector("[data-bzw-dialog], [data-bzw-popover], [data-fx-sheet]")) return;
      setFilter({});
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [narrowed]);

  // Every approved order once: its value is what the hub billed; the evaluation says which schemes it used.
  const priced = s.hub
    .filter((o) => o.status === "approved")
    .map((o) => {
      const c = customerById(o.customerId);
      return { o, total: orderTotal(o), ev: evaluateHub(o, s.schemes), c, type: typeKey(c) };
    });
  type Priced = (typeof priced)[number];

  // A breakdown is counted with every slice but its own (`skip`), so its other rows stay to be picked.
  const orderOk = (x: Priced, skip?: Dim) =>
    (skip === "channel" || !filter.channel || x.o.source === filter.channel) &&
    (skip === "type" || !filter.type || x.type === filter.type) &&
    (skip === "rep" || !filter.rep || x.o.repId === filter.rep);
  // A visit has no channel: it is read by the type of customer it was to and who made it.
  const visitOk = (v: Visit, skip?: Dim) => (skip === "type" || !filter.type || typeKey(customerById(v.customerId)) === filter.type) && (skip === "rep" || !filter.rep || v.repId === filter.rep);

  const scoped = priced.filter((x) => inPeriod(x.o.at));
  const approved = scoped.filter((x) => orderOk(x));
  const primary = approved.reduce((n, x) => n + x.total, 0);
  const served = approved.filter((x) => forShopId(x.o));
  const servedValue = served.reduce((n, x) => n + x.total, 0);
  const visitsIn = s.visits.filter((v) => inPeriod(v.date));
  const visits = visitsIn.filter((v) => visitOk(v));
  const strike = strikeRate(visits);

  const tabs = (
    <PillTabs<Period>
      value={period}
      onChange={setPeriod}
      options={[
        { value: "month", label: "This month", title: monthLabel(THIS_MONTH) },
        { value: "all", label: "All time" },
      ]}
    />
  );

  if (!priced.length && !s.visits.length) {
    return (
      <SfShell current="insights">
        <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
          <Panel>
            <FxEmpty title="No orders or visits yet.">
              <Link to={sfPath("orders")} className={BTN}>
                Open orders
              </Link>
            </FxEmpty>
          </Panel>
        </div>
      </SfShell>
    );
  }

  const byChannel = groupBy(
    scoped.filter((x) => orderOk(x, "channel")),
    (x) => ({ key: x.o.source, label: SOURCE[x.o.source] }),
    (x) => x.total,
  );
  const byType = groupBy(
    scoped.filter((x) => orderOk(x, "type")),
    (x) => ({ key: x.type, label: typeOf(x.c).name }),
    (x) => x.total,
  );
  const byDistributor = groupBy(
    served,
    (x) => ({ key: x.o.customerId, label: x.c?.name ?? "Removed customer" }),
    (x) => x.total,
  );
  const byShop = groupBy(
    served,
    (x) => {
      const id = forShopId(x.o) ?? "";
      const d = x.c?.name;
      return { key: id, label: customerById(id)?.name ?? "Removed shop", sub: d ? `through ${d}` : undefined };
    },
    (x) => x.total,
  );

  const repVisits = visitsIn.filter((v) => visitOk(v, "rep"));
  const reps = s.reps
    .map((r) => {
      const mine = repVisits.filter((v) => v.repId === r.id);
      return { r, n: mine.filter((v) => v.state === "done").length, orders: mine.filter((v) => v.orderId).length, rate: strikeRate(mine) };
    })
    .filter((x) => x.n > 0)
    .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));

  // A scheme is read over its own dates, not the page's period; the slices still apply.
  const sliced = priced.filter((x) => orderOk(x));
  const schemes = s.schemes
    .filter((sc) => sc.applies === "order")
    .map((sc) => {
      const within = sliced.filter((x) => x.o.at.slice(0, 10) >= sc.from && x.o.at.slice(0, 10) <= sc.to);
      const used = within.filter((x) => x.ev.applied.some((a) => a.schemeId === sc.id));
      const spend = used.reduce((n, x) => n + x.ev.applied.filter((a) => a.schemeId === sc.id).reduce((m, a) => m + a.benefit, 0), 0);
      const sales = within.reduce((n, x) => n + x.total, 0);
      return { sc, spend, sales, orders: used.length, periodOrders: within.length };
    })
    .filter((x) => x.periodOrders > 0 || x.sc.status === "live")
    .sort((a, b) => b.spend - a.spend);

  const label = period === "month" ? monthLabel(THIS_MONTH) : "all time";
  const visitOrders = visits.filter((v) => v.orderId).length;
  const visitsDone = visits.filter((v) => v.state === "done").length;
  const noOrders = `No approved orders in ${label}.`;
  const sumOf = (gs: Group[]) => gs.reduce((n, g) => n + g.value, 0);
  const maxOf = (gs: Group[]) => Math.max(1, ...gs.map((g) => g.value));

  /** What a slice is called, on its pill — a record that has since been removed still names itself. */
  const nameOf = (dim: Dim, key: string) =>
    dim === "channel"
      ? (SOURCE[key as Source] ?? key)
      : dim === "type"
        ? (s.types.find((t) => t.id === key)?.name ?? NO_TYPE.name)
        : (s.reps.find((r) => r.id === key)?.name ?? "Removed rep");

  /** Orders, on the slice this page is on (the list there knows channels and reps). */
  const ordersTo = (...more: string[]) => {
    const p = new URLSearchParams({ pick: "approved" });
    for (const f of [...(filter.channel ? [`src:${filter.channel}`] : []), ...(filter.rep ? [`rep:${filter.rep}`] : []), ...more]) p.append("f", f);
    return `${sfPath("orders")}?${p.toString()}`;
  };

  /** Value · share · orders — the row of a sales breakdown. */
  const salesRow = (g: Group, gs: Group[], opts: { dim?: Dim; lead?: React.ReactNode; name?: React.ReactNode; bar?: boolean } = {}) => {
    const total = sumOf(gs);
    const picked = opts.dim ? filter[opts.dim] : undefined;
    return (
      <Row
        lead={opts.lead}
        name={opts.name ?? g.label}
        sub={g.sub}
        bar={opts.bar === false ? undefined : { pct: (g.value / maxOf(gs)) * 100 }}
        figure={short(g.value)}
        small={`${pct(g.value, total)}% · ${plural(g.n, "order")}`}
        title={`NPR ${npr(g.value)}`}
        on={!!picked && picked === g.key}
        dim={!!picked && picked !== g.key}
        onClick={opts.dim ? () => toggle(opts.dim!, g.key) : undefined}
      />
    );
  };

  const channelTotal = sumOf(byChannel);

  return (
    <SfShell
      current="insights"
      actions={
        <>
          {active.map((d) => {
            const name = nameOf(d, filter[d]!);
            return (
              <span key={d} title={DIM_NAME[d]} className="inline-flex h-9 max-w-[220px] items-center gap-1 rounded-bz-md border border-[color-mix(in_srgb,var(--fx-accent)_32%,transparent)] bg-[color-mix(in_srgb,var(--fx-accent)_10%,transparent)] pl-3 pr-1.5 text-[12.5px] font-medium text-bz-text">
                <span className="min-w-0 truncate">{name}</span>
                <button type="button" onClick={() => toggle(d, filter[d]!)} title="Remove (Esc removes all)" aria-label={`Remove ${name}`} className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire">
                  <X size={13} />
                </button>
              </span>
            );
          })}
          {tabs}
        </>
      }
    >
      <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
        <div className="grid grid-cols-1 gap-3">
          {/* ── Four figures ── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={ShoppingBag} label="Primary sales" unit="NPR" value={short(primary)} note={plural(approved.length, "order")} title={`Approved orders, as billed: NPR ${npr(primary)}. Opens Orders.`} to={ordersTo()} />
            <Kpi
              icon={Store}
              label="For served shops"
              unit="NPR"
              value={short(servedValue)}
              extra={primary > 0 && servedValue > 0 && <TickBar pct={pct(servedValue, primary)} ink="accent" ticks={18} className="w-24" />}
              note={primary > 0 && servedValue > 0 ? `${pct(servedValue, primary)}% of sales · ${plural(served.length, "order")}` : plural(served.length, "order")}
              title={`Approved orders billed to the distributor that serves the shop: NPR ${npr(servedValue)}. Opens them in Orders.`}
              to={ordersTo("shop")}
            />
            <Kpi
              icon={Crosshair}
              label="Strike rate"
              value={strike === null ? "—" : `${strike}%`}
              extra={strike !== null && <TickBar pct={strike} ink="accent" ticks={18} className="w-24" />}
              note={`${visitOrders} of ${plural(visitsDone, "visit")}${filter.channel ? " · all channels" : ""}`}
              title={`Finished visits that took an order${filter.channel ? " — a visit has no channel, so this figure is not narrowed by it" : ""}. Opens Visits.`}
              to={sfPath("visits")}
            />
            <Kpi icon={Receipt} label="Average order" unit={approved.length ? "NPR" : undefined} value={approved.length ? short(primary / approved.length) : "—"} note="per approved order" title={`Primary sales across approved orders${approved.length ? `: NPR ${npr(primary / approved.length)}` : ""}. Opens Orders.`} to={ordersTo()} />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {/* ── By channel: a ring, and its rows ── */}
            <Panel title="By channel">
              {byChannel.length === 0 ? (
                <None>{noOrders}</None>
              ) : (
                <div className="flex flex-col items-center gap-x-6 gap-y-3 sm:flex-row">
                  <Ring parts={byChannel.map((g) => ({ name: g.label, value: g.value, ink: SOURCE_INK[g.key as Source] ?? "soft" }))} size={132}>
                    <span className={cn("text-[20px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>{short(channelTotal)}</span>
                    <span className={cn("mt-1 text-[10.5px] text-bz-text-soft", NUM)}>NPR · {plural(byChannel.reduce((n, g) => n + g.n, 0), "order")}</span>
                  </Ring>
                  <div className="w-full min-w-0 flex-1">
                    <Rows items={byChannel} idOf={(g) => g.key} pinned={(g) => g.key === filter.channel}>
                      {(g) => salesRow(g, byChannel, { dim: "channel", bar: false, lead: <span className="size-2 shrink-0 rounded-bz-pill" style={{ background: inkOf(SOURCE_INK[g.key as Source] ?? "soft") }} /> })}
                    </Rows>
                  </div>
                </div>
              )}
            </Panel>

            {/* ── By customer type ── */}
            <Panel title="By customer type">
              {byType.length === 0 ? (
                <None>{noOrders}</None>
              ) : (
                <Rows items={byType} idOf={(g) => g.key} pinned={(g) => g.key === filter.type}>
                  {(g) => salesRow(g, byType, { dim: "type", name: <TypeMark name={g.label} color={s.types.find((t) => t.id === g.key)?.color ?? NO_TYPE.color} className="text-[13px] text-bz-text" /> })}
                </Rows>
              )}
            </Panel>

            {/* ── Strike rate by rep: the full width, like the schemes under it ── */}
            <Panel title="Strike rate by rep" className="xl:col-span-2" right={filter.channel ? <Aside>all channels</Aside> : undefined}>
              {reps.length === 0 ? (
                <None>{`No finished visits in ${label}.`}</None>
              ) : (
                <Rows items={reps} idOf={(x) => x.r.id} pinned={(x) => x.r.id === filter.rep}>
                  {(x) => {
                    const rate = x.rate ?? 0;
                    const low = rate < 40;
                    return (
                      <Row
                        lead={<Who name={x.r.name} size={24} />}
                        name={x.r.name}
                        bar={{ pct: rate, ink: low ? "amber" : "accent" }}
                        figure={`${rate}%`}
                        small={`${x.orders} of ${x.n}`}
                        warn={low ? "amber" : undefined}
                        title={`${plural(x.orders, "order")} from ${plural(x.n, "finished visit")}`}
                        on={filter.rep === x.r.id}
                        dim={!!filter.rep && filter.rep !== x.r.id}
                        onClick={() => toggle("rep", x.r.id)}
                      />
                    );
                  }}
                </Rows>
              )}
            </Panel>

            {/* ── Scheme spend against the sales in its dates ── */}
            <Panel title="Scheme spend vs sales" className="xl:col-span-2" right={<Aside className="max-sm:hidden">over each scheme's own dates</Aside>}>
              {schemes.length === 0 ? (
                <None>No order schemes yet.</None>
              ) : (
                <Rows items={schemes} idOf={(x) => x.sc.id}>
                  {({ sc, spend, sales, orders, periodOrders }) => {
                    const share = sales ? (spend / sales) * 100 : 0;
                    const of = sales ? `${share.toFixed(1)}%` : "—";
                    const heavy = !!sales && spend / sales > 0.1;
                    return (
                      <Link
                        to={sfPath(`schemes/${sc.id}`)}
                        title={`NPR ${npr(spend)} given on ${plural(orders, "order")}, against NPR ${npr(sales)} of sales in its dates. The bar is full at 20% of sales.`}
                        className={cn(ROW, ROW_LIVE, "group grid-cols-[minmax(0,1fr)_72px_84px] md:grid-cols-[minmax(0,1fr)_minmax(96px,200px)_80px_80px_112px]")}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] text-bz-text group-hover:underline group-hover:underline-offset-2">{sc.name}</span>
                          <span className={cn("block truncate text-[11px] text-bz-text-soft", NUM)}>
                            {day(sc.from)} to {day(sc.to)}
                            <span className="md:hidden">
                              {" "}
                              · used on {orders} of {periodOrders}
                            </span>
                          </span>
                        </span>
                        <TickBar pct={share * 5} ink={heavy ? "red" : "accent"} ticks={12} className="md:hidden" />
                        <TickBar pct={share * 5} ink={heavy ? "red" : "accent"} className="hidden md:flex" />
                        <Fig value={short(spend)} cap="spend" className="hidden md:block" />
                        <Fig value={short(sales)} cap="sales" className="hidden md:block" />
                        <Fig
                          value={of}
                          red={heavy}
                          cap={
                            <>
                              <span className="hidden md:inline">
                                used on {orders} of {periodOrders}
                              </span>
                              <span className="md:hidden">
                                {short(spend)} of {short(sales)}
                              </span>
                            </>
                          }
                        />
                      </Link>
                    );
                  }}
                </Rows>
              )}
            </Panel>

            {/* ── Served shops ── */}
            <Panel title="Served shops — by distributor">
              {byDistributor.length === 0 ? (
                <None>{`None in ${label}.`}</None>
              ) : (
                <Rows items={byDistributor} idOf={(g) => g.key}>
                  {(g) => salesRow(g, byDistributor)}
                </Rows>
              )}
            </Panel>
            <Panel title="Served shops — by shop">
              {byShop.length === 0 ? (
                <None>{`None in ${label}.`}</None>
              ) : (
                <Rows items={byShop} idOf={(g) => g.key}>
                  {(g) => salesRow(g, byShop)}
                </Rows>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </SfShell>
  );
}

export const INSIGHTS_ROUTES = [{ path: "design/salesforce/insights", Component: InsightsPage }];
