import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Inbox,
  Keyboard,
  ListTree,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Plus,
  Printer,
  ReceiptText,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  Truck,
  ArrowDownUp,
  Download,
} from "lucide-react";
import { cn } from "../ui/utils";
import { AppFrame } from "./AppFrame";
import {
  Avatar,
  BTN,
  BulkBar,
  BulkBtn,
  CARD,
  Checkbox,
  CountMark,
  Chip,
  Clear,
  Empty,
  GHOST_SM,
  ICON_BTN,
  Kbd,
  LABEL,
  MenuItem,
  NUM,
  Popover,
  SearchField,
  Select,
  SkeletonRows,
  Stat,
  Statline,
  Tabs,
  ToastHost,
  useToast,
} from "./bzw";
import {
  Amount,
  CUSTOMERS,
  ExpectedMark,
  JourneyMark,
  LOCATIONS,
  ME,
  Order,
  PEOPLE,
  QUEUES,
  QueueKey,
  SEED_ORDERS,
  STAGE_TONE,
  TODAY,
  addDays,
  customerById,
  daysBetween,
  fmtQty,
  fmtShort,
  isLate,
  isOpen,
  itemById,
  locationById,
  needsMyApproval,
  nextOrderNo,
  orderTotal,
  personById,
  progressOf,
  queueOf,
  readyToInvoice,
  remainingToDeliver,
  stageLabel,
  stageOf,
  useKeys,
  useMedia,
} from "./orders";
import { OrderPanel, PanelMode } from "./OrderPanel";
import { ordersStore, useStore } from "./store";
import { SalesNav, estimatesStore, orderedQty } from "./flow";
import { OrderComposer, ComposerMode } from "./OrderComposer";
import { DeliveryPayload, InvoicePayload, pendingOn, unitsLabel } from "./FulfilSheet";

// ════════════════════════════════════════════════════════════════════════════
// SALES ORDERS · THE DESK
//
// One surface replaces list · view · create · update · copy · from-estimate ·
// deliver-from-order · invoice-from-order as places a user has to GO. The URL
// still names the record (/design/sales/orders/SO-1047), so a link in a
// notification or a comment opens exactly what it points at.
//
// Why these three views and not a board:
//   Queue     — orders grouped by what they are WAITING FOR. An order's stage is
//               derived from documents, so it is read, never dragged: a board
//               would offer a gesture ("drop into Invoiced") that has no honest
//               meaning. The queue answers "what needs doing" for everyone:
//               approvers see theirs first, the warehouse reads To deliver,
//               finance reads To invoice.
//   Schedule  — open orders by the date they were PROMISED. The warehouse plans
//               the week from it; late is the one bucket that earns red.
//   Register  — every order, flat, sortable, dense. The lookup and export view.
//
// Content & density (app rule, 2026-09-14): the top bar carries the title; the
// figures are ONE statline whose items are also filters; errors and empty
// states are one line; nothing says what the page is.
// ════════════════════════════════════════════════════════════════════════════

type View = "queue" | "schedule" | "register";
type Pick = "mine" | "late" | "deliver" | "invoice" | null;
type Filters = { customers: string[]; reps: string[]; locations: string[]; stages: QueueKey[] };
const NO_FILTERS: Filters = { customers: [], reps: [], locations: [], stages: [] };
type SortKey = "no" | "date" | "customer" | "expected" | "amount" | "stage";

const BASE = "/design/sales/orders";

export function OrderDeskDesignPage() {
  const params = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const wide = useMedia("(min-width: 1280px)");

  const orders = useStore(ordersStore);
  const setOrders = (next: Order[] | ((o: Order[]) => Order[])) => ordersStore.set((cur) => (typeof next === "function" ? next(cur) : next));
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<View>("queue");
  const [q, setQ] = React.useState("");
  const [filters, setFilters] = React.useState<Filters>(NO_FILTERS);
  const [pick, setPick] = React.useState<Pick>(() => {
    const p = new URLSearchParams(window.location.search).get("pick");
    return p === "deliver" || p === "invoice" || p === "mine" || p === "late" ? p : null;
  });
  const [collapsed, setCollapsed] = React.useState<Set<QueueKey | string>>(() => new Set(QUEUES.filter((x) => x.defaultCollapsed).map((x) => x.key)));
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [full, setFull] = React.useState(false);
  const [keysOpen, setKeysOpen] = React.useState(false);
  const [bulkNote, setBulkNote] = React.useState<string | null>(null);
  const keysRef = React.useRef<HTMLButtonElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const { toast, show, dismiss } = useToast();

  React.useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(id);
  }, []);

  // ── Route → what is open ────────────────────────────────────────────────
  const openNo = params.no ?? null;
  const composing: ComposerMode | null = React.useMemo(() => {
    if (openNo === "new") {
      const estNo = search.get("estimate");
      const est = estNo ? estimatesStore.get().find((e) => e.no === estNo) : undefined;
      if (est) {
        // Only what the estimate has not already been ordered for (one estimate, many orders).
        const lines = est.lines
          .map((l) => ({ ...l, qty: l.qty - orderedQty(orders, est, l) }))
          .filter((l) => l.qty > 0);
        const base: Order = {
          ...SEED_ORDERS[0],
          id: "draft",
          no: "draft",
          customerId: est.customerId,
          date: TODAY,
          expected: est.expectedClose,
          locationId: est.locationId,
          repId: est.repId,
          termId: est.termId,
          customerPo: null,
          memo: est.memo,
          source: null,
          docs: [],
          dims: {},
          attachments: [],
          comments: [],
          history: [],
          lines,
        };
        return { kind: "copy", from: base, source: { kind: "Estimate", no: est.no } };
      }
      const from = search.get("copy");
      const src = from ? orders.find((o) => o.no === from) : undefined;
      return src ? { kind: "copy", from: src } : { kind: "new" };
    }
    if (openNo && search.get("do") === "edit") {
      const o = orders.find((x) => x.no === openNo);
      return o ? { kind: "edit", order: o } : null;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNo, search]);
  const openOrder = openNo && openNo !== "new" ? orders.find((o) => o.no === openNo) ?? null : null;
  const doParam = search.get("do");
  const mode: PanelMode = doParam === "deliver" || doParam === "invoice" ? doParam : "view";
  const panelOpen = !!composing || !!openOrder;
  const docked = wide && panelOpen;
  const panelFull = !!composing || full;

  const go = (no: string | null, extra?: Record<string, string>) => {
    const qs = extra ? `?${new URLSearchParams(extra).toString()}` : "";
    navigate(no ? `${BASE}/${no}${qs}` : BASE);
  };

  // ── Narrowing ───────────────────────────────────────────────────────────
  const counts = React.useMemo(() => {
    const open = orders.filter((o) => isOpen(o) && stageOf(o) !== "rejected");
    return {
      open: open.length,
      value: open.reduce((s, o) => s + orderTotal(o) * o.exchangeRate, 0),
      mine: orders.filter(needsMyApproval).length,
      late: orders.filter(isLate).length,
      deliver: orders.filter((o) => ["deliver", "delivering"].includes(stageOf(o))).length,
      invoice: orders.filter((o) => ["delivering", "invoice"].includes(stageOf(o)) && o.lines.some((l) => readyToInvoice(l) - pendingOn(o, l, "invoice") > 0)).length,
    };
  }, [orders]);

  const visible = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      const c = customerById(o.customerId)!;
      if (needle && !`${o.no} ${c.name} ${c.code} ${o.customerPo ?? ""} ${o.lines.map((l) => itemById(l.itemId)?.name).join(" ")}`.toLowerCase().includes(needle)) return false;
      if (filters.customers.length && !filters.customers.includes(o.customerId)) return false;
      if (filters.reps.length && !filters.reps.includes(o.repId ?? "")) return false;
      if (filters.locations.length && !filters.locations.includes(o.locationId)) return false;
      if (filters.stages.length && !filters.stages.includes(queueOf(o))) return false;
      if (pick === "mine" && !needsMyApproval(o)) return false;
      if (pick === "late" && !isLate(o)) return false;
      if (pick === "deliver" && !["deliver", "delivering"].includes(stageOf(o))) return false;
      if (pick === "invoice" && !(["delivering", "invoice"].includes(stageOf(o)) && o.lines.some((l) => readyToInvoice(l) > 0))) return false;
      return true;
    });
  }, [orders, q, filters, pick]);

  const sorted = React.useMemo(() => {
    const val = (o: Order): string | number => {
      switch (sort.key) {
        case "no": return o.no;
        case "date": return o.date;
        case "customer": return customerById(o.customerId)!.name;
        case "expected": return o.expected ?? "9999";
        case "amount": return orderTotal(o) * o.exchangeRate;
        case "stage": return QUEUES.findIndex((x) => x.key === queueOf(o));
      }
    };
    return [...visible].sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * sort.dir);
  }, [visible, sort]);

  // The order J/K walks is the order the reader SEES.
  const walk = React.useMemo(() => {
    if (view === "register") return sorted;
    if (view === "schedule") return scheduleBuckets(sorted).flatMap((b) => (collapsed.has(`s:${b.key}`) ? [] : b.rows));
    return QUEUES.flatMap((g) => (collapsed.has(g.key) ? [] : sorted.filter((o) => queueOf(o) === g.key)));
  }, [view, sorted, collapsed]);
  const position = openOrder ? { index: Math.max(0, walk.findIndex((o) => o.id === openOrder.id)), total: walk.length } : null;
  const step = (d: 1 | -1) => {
    if (!walk.length) return;
    const i = openOrder ? walk.findIndex((o) => o.id === openOrder.id) : -1;
    const next = walk[(i + d + walk.length) % walk.length];
    go(next.no);
  };

  const nFilters = filters.customers.length + filters.reps.length + filters.locations.length + filters.stages.length;
  const clearAll = () => {
    setFilters(NO_FILTERS);
    setPick(null);
    setQ("");
  };

  // ── Writes ──────────────────────────────────────────────────────────────
  const now = () => {
    const d = new Date();
    return `${fmtShort(TODAY)}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const update = (id: string, fn: (o: Order) => Order) => setOrders((os) => os.map((o) => (o.id === id ? fn(o) : o)));
  const hist = (o: Order, what: string): Order => ({ ...o, history: [...o.history, { id: `h${Date.now()}${Math.random()}`, whoId: ME.id, when: now(), what }] });

  const approve = (o: Order) => {
    update(o.id, (x) => hist({ ...x, approval: { state: "approved", byId: ME.id, on: TODAY } }, "approved it"));
    show("success", `${o.no} approved`, walk.length > 1 ? { label: "Next", run: () => step(1) } : undefined);
  };
  const reject = (o: Order, reason: string) => {
    update(o.id, (x) => hist({ ...x, approval: { state: "rejected", byId: ME.id, on: TODAY, reason } }, `rejected it — “${reason}”`));
    show("info", `${o.no} sent back to ${personById(o.repId ?? "")?.name ?? "the rep"}`);
  };

  const docNo = (kind: "delivery" | "invoice") => {
    const all = orders.flatMap((o) => o.docs).filter((d) => d.kind === kind);
    const n = Math.max(0, ...all.map((d) => Number(d.no.replace(/\D/g, ""))));
    return `${kind === "delivery" ? "DN" : "INV"}-${String(n + 1).padStart(4, "0")}`;
  };

  const deliver = (o: Order, p: DeliveryPayload, thenInvoice: boolean) => {
    const no = docNo("delivery");
    update(o.id, (x) =>
      hist(
        {
          ...x,
          lines: x.lines.map((l) => {
            const d = p.lines.find((y) => y.lineId === l.id);
            return d ? { ...l, delivered: l.delivered + d.qty } : l;
          }),
          docs: [...x.docs, { id: `D${Date.now()}`, kind: "delivery", no, date: p.date, state: "approved", byId: ME.id, locationId: p.locationId, truck: p.vehicle || undefined, lines: p.lines.map((y) => ({ lineId: y.lineId, qty: y.qty })) }],
        },
        `delivered ${no} (${p.lines.length} line${p.lines.length === 1 ? "" : "s"})`,
      ),
    );
    if (thenInvoice) {
      go(o.no, { do: "invoice" });
      show("success", `${no} created — now the invoice`);
    } else {
      go(o.no);
      show("success", `${no} created · ${unitsLabel(p.lines.map((y) => ({ unit: itemById(o.lines.find((l) => l.id === y.lineId)!.itemId)!.unit, qty: y.qty })))} from ${locationById(p.locationId)?.name}`);
    }
  };

  const invoice = (o: Order, p: InvoicePayload) => {
    const no = docNo("invoice");
    update(o.id, (x) =>
      hist(
        {
          ...x,
          lines: x.lines.map((l) => {
            const d = p.lines.find((y) => y.lineId === l.id);
            return d ? { ...l, invoiced: l.invoiced + d.qty } : l;
          }),
          docs: [...x.docs, { id: `D${Date.now()}`, kind: "invoice", no, date: p.date, due: p.due, state: "approved", byId: ME.id, lines: p.lines }],
        },
        `invoiced ${no}`,
      ),
    );
    go(o.no);
    show("success", `${no} created · due ${fmtShort(p.due)}`);
  };

  const save = (draft: Omit<Order, "id" | "no"> & { id?: string; no?: string }) => {
    if (draft.id) {
      const prev = orders.find((o) => o.id === draft.id)!;
      const needsReapproval = prev.approval.state === "approved" && orderTotal(draft as Order) > orderTotal(prev) + 0.005;
      const next = hist(
        {
          ...(draft as Order),
          approval: needsReapproval ? { state: "pending", stateName: "Manager review", approverId: ME.id, since: TODAY } : prev.approval.state === "rejected" ? { state: "pending", stateName: "Manager review", approverId: ME.id, since: TODAY } : draft.approval,
        },
        needsReapproval || prev.approval.state === "rejected" ? "edited the order and sent it to Manager review" : "edited the order",
      );
      update(prev.id, () => next);
      go(prev.no);
      show("success", needsReapproval ? `${prev.no} saved · back in Manager review` : `${prev.no} saved`);
      return;
    }
    const no = nextOrderNo(orders);
    // A discount routes to review — the shape a WORKFLOW_TRANSITION_RULES condition takes.
    const review = draft.lines.some((l) => l.discountPct > 0);
    const created: Order = hist(
      {
        ...(draft as Order),
        id: no,
        no,
        approval: review ? { state: "pending", stateName: "Manager review", approverId: ME.id, since: TODAY } : { state: "approved", byId: ME.id, on: TODAY },
      },
      review ? "created the order and sent it to Manager review" : "created the order",
    );
    setOrders((os) => [created, ...os]);
    go(no);
    show("success", review ? `${no} created · sent to Manager review` : `${no} created`);
  };

  // ── Bulk — sequential work, reported as a split, never as "done" ────────
  const pickedOrders = orders.filter((o) => selected.has(o.id));
  const bulk = (verb: "approve" | "deliver" | "invoice") => {
    let done = 0;
    const skipped: string[] = [];
    const skippedIds = new Set<string>();
    const next = orders.map((o) => {
      if (!selected.has(o.id)) return o;
      if (verb === "approve") {
        if (!needsMyApproval(o)) return skippedIds.add(o.id), skipped.push(`${o.no} isn't waiting on you`), o;
        done++;
        return hist({ ...o, approval: { state: "approved", byId: ME.id, on: TODAY } }, "approved it");
      }
      if (verb === "deliver") {
        const open = o.lines.filter((l) => remainingToDeliver(l) - pendingOn(o, l, "delivery") > 0);
        if (!["deliver", "delivering"].includes(stageOf(o)) || !open.length) return skippedIds.add(o.id), skipped.push(`${o.no} has nothing to deliver`), o;
        if (open.some((l) => itemById(l.itemId)?.lotTracked)) return skippedIds.add(o.id), skipped.push(`${o.no} needs lots picked`), o;
        const short = open.find((l) => {
          const it = itemById(l.itemId)!;
          return Object.keys(it.onHand).length > 0 && (it.onHand[o.locationId] ?? 0) < remainingToDeliver(l);
        });
        if (short) return skippedIds.add(o.id), skipped.push(`${o.no} is short at ${locationById(o.locationId)?.name}`), o;
        done++;
        const lines = open.map((l) => ({ lineId: l.id, qty: remainingToDeliver(l) - pendingOn(o, l, "delivery") }));
        const no = `DN-${String(400 + done)}`;
        return hist(
          {
            ...o,
            lines: o.lines.map((l) => ({ ...l, delivered: l.delivered + (lines.find((x) => x.lineId === l.id)?.qty ?? 0) })),
            docs: [...o.docs, { id: `D${Date.now()}${done}`, kind: "delivery", no, date: TODAY, state: "approved", byId: ME.id, locationId: o.locationId, lines }],
          },
          `delivered ${no} in bulk`,
        );
      }
      const ready = o.lines.filter((l) => readyToInvoice(l) - pendingOn(o, l, "invoice") > 0);
      if (!ready.length) return skippedIds.add(o.id), skipped.push(`${o.no} has nothing delivered to bill`), o;
      done++;
      const lines = ready.map((l) => ({ lineId: l.id, qty: readyToInvoice(l) - pendingOn(o, l, "invoice") }));
      const no = `INV-${String(8900 + done)}`;
      return hist(
        {
          ...o,
          lines: o.lines.map((l) => ({ ...l, invoiced: l.invoiced + (lines.find((x) => x.lineId === l.id)?.qty ?? 0) })),
          docs: [...o.docs, { id: `D${Date.now()}${done}`, kind: "invoice", no, date: TODAY, state: "approved", byId: ME.id, lines }],
        },
        `invoiced ${no} in bulk`,
      );
    });
    setOrders(next);
    const verbed = verb === "approve" ? "approved" : verb === "deliver" ? "delivered" : "invoiced";
    if (skipped.length) {
      // Keep only what was skipped selected — those are the orders still to open.
      setSelected(skippedIds);
      setBulkNote(`${done} ${verbed} · ${skipped.length} skipped`);
      show("error", `${done} ${verbed}. Skipped: ${skipped.join("; ")}.`, undefined, 0);
    } else {
      setBulkNote(null);
      setSelected(new Set());
      show("success", `${done} order${done === 1 ? "" : "s"} ${verbed}`);
    }
  };

  // ── Keys ────────────────────────────────────────────────────────────────
  useKeys({
    n: () => !composing && go("new"),
    "/": (e) => (e.preventDefault(), searchRef.current?.focus()),
    j: () => !composing && mode === "view" && step(1),
    k: () => !composing && mode === "view" && step(-1),
    escape: () => {
      if (composing) return;
      if (mode !== "view" && openOrder) return go(openOrder.no);
      if (panelOpen) return go(null);
      if (selected.size) setSelected(new Set());
    },
  });

  // ── Render ──────────────────────────────────────────────────────────────
  const filterOptions = [
    ...QUEUES.map((x) => ({ value: `stage:${x.key}`, label: x.label, group: "Stage" })),
    ...CUSTOMERS.map((c) => ({ value: `customer:${c.id}`, label: c.name, hint: c.code, group: "Customer" })),
    ...PEOPLE.map((p) => ({ value: `rep:${p.id}`, label: p.name, person: p, group: "Sales rep" })),
    ...LOCATIONS.map((l) => ({ value: `location:${l.id}`, label: l.name, group: "Deliver from" })),
  ];
  const filterValue = [
    ...filters.stages.map((x) => `stage:${x}`),
    ...filters.customers.map((x) => `customer:${x}`),
    ...filters.reps.map((x) => `rep:${x}`),
    ...filters.locations.map((x) => `location:${x}`),
  ];
  const applyFilterValue = (v: string[]) => {
    const take = (p: string) => v.filter((x) => x.startsWith(`${p}:`)).map((x) => x.slice(p.length + 1));
    setFilters({ stages: take("stage") as QueueKey[], customers: take("customer"), reps: take("rep"), locations: take("location") });
  };

  const chips = [
    ...filters.stages.map((x) => ({ key: `stage:${x}`, label: QUEUES.find((y) => y.key === x)!.label })),
    ...filters.customers.map((x) => ({ key: `customer:${x}`, label: customerById(x)!.name })),
    ...filters.reps.map((x) => ({ key: `rep:${x}`, label: personById(x)!.name })),
    ...filters.locations.map((x) => ({ key: `location:${x}`, label: locationById(x)!.name })),
  ];

  const compact = docked && !panelFull;
  const listHidden = docked && panelFull;

  const rowProps = (o: Order) => ({
    order: o,
    compact,
    active: openOrder?.id === o.id,
    selected: selected.has(o.id),
    onSelect: (v: boolean) =>
      setSelected((s) => {
        const n = new Set(s);
        if (v) n.add(o.id);
        else n.delete(o.id);
        setBulkNote(null);
        return n;
      }),
    onOpen: () => go(o.no),
    onDo: (m: "deliver" | "invoice" | "view") => go(o.no, m === "view" ? undefined : { do: m }),
  });

  return (
    <AppFrame title="Sales" titleAside={<SalesNav current="orders" />}>
      <div className="flex h-full min-h-0">
        {/* ── The list side ─────────────────────────────────────────────── */}
        <div className={cn("min-w-0 flex-1 overflow-y-auto [scrollbar-width:thin]", listHidden && "hidden")}>
          {/* Statline — context, and each figure is also a filter */}
          <div className="border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <Statline>
                <Stat label="Open" value={counts.open} title="Approved or waiting, not yet complete" />
                <Stat label="Open value" value={<Amount value={counts.value} currency="NPR" className="[&>span:last-child]:hidden" />} />
                <Stat label="Needs you" value={counts.mine} active={pick === "mine"} onPick={() => setPick(pick === "mine" ? null : "mine")} title="Waiting on your approval" />
                <Stat label="Late" value={counts.late} danger={counts.late > 0} active={pick === "late"} onPick={() => setPick(pick === "late" ? null : "late")} title="Promised date passed, still undelivered" />
                <Stat label="To deliver" value={counts.deliver} active={pick === "deliver"} onPick={() => setPick(pick === "deliver" ? null : "deliver")} />
                <Stat label="To invoice" value={counts.invoice} active={pick === "invoice"} onPick={() => setPick(pick === "invoice" ? null : "invoice")} />
              </Statline>
            </div>
          </div>

          {/* Sticky band — tabs over the toolbar */}
          <div className="sticky top-0 z-30 border-b border-bz-line bg-bz-paper">
            <div className="px-3 md:px-5">
              <Tabs
                value={view}
                onChange={setView}
                tabs={[
                  { value: "queue", label: "Queue", icon: ListTree },
                  { value: "schedule", label: "Schedule", icon: CalendarClock },
                  { value: "register", label: "Register", icon: Table2 },
                ]}
                tail={
                  <>
                    <button ref={keysRef} type="button" className={ICON_BTN} onClick={() => setKeysOpen(true)} title="Keyboard shortcuts">
                      <Keyboard size={14} />
                    </button>
                    <button type="button" className={cn(ICON_BTN, "hidden md:inline-flex")} title="Export">
                      <Download size={14} />
                    </button>
                  </>
                }
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-bz-line-soft px-4 py-2 md:px-6">
              <SearchField ref={searchRef} value={q} onChange={setQ} placeholder="Order, customer, PO or item" hint="/" className="min-w-[180px] flex-1 md:max-w-[300px]" />
              <Select
                multiple
                label="Filter"
                icon={SlidersHorizontal}
                badge={nFilters}
                applied={nFilters > 0}
                value={filterValue}
                onChange={applyFilterValue}
                options={filterOptions}
                width={290}
                placeholder="Filter by stage, customer, rep…"
              />
              {view !== "schedule" && (
                <Select
                  label={{ date: "Newest", no: "Order no.", customer: "Customer", expected: "Expected date", amount: "Amount", stage: "Stage" }[sort.key]}
                  icon={ArrowDownUp}
                  value={sort.key}
                  onChange={(v) => setSort({ key: v as SortKey, dir: v === "date" || v === "amount" ? -1 : 1 })}
                  width={200}
                  options={[
                    { value: "date", label: "Newest" },
                    { value: "expected", label: "Expected date" },
                    { value: "amount", label: "Amount" },
                    { value: "customer", label: "Customer" },
                  ]}
                />
              )}
              <button type="button" className={cn(BTN, "ml-auto")} onClick={() => go("new")}>
                <Plus size={13} /> New order <Kbd>N</Kbd>
              </button>
            </div>
            {(chips.length > 0 || pick || q) && (
              <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2 md:px-6">
                <span className={cn("text-[11px] text-bz-text-soft", NUM)}>
                  {visible.length} of {orders.length}
                </span>
                {pick && (
                  <FilterChip onRemove={() => setPick(null)}>
                    {{ mine: "Needs you", late: "Late", deliver: "To deliver", invoice: "To invoice" }[pick]}
                  </FilterChip>
                )}
                {chips.map((c) => (
                  <FilterChip key={c.key} onRemove={() => applyFilterValue(filterValue.filter((x) => x !== c.key))}>
                    {c.label}
                  </FilterChip>
                ))}
                <Clear onClear={clearAll} />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-4 pb-28 md:p-6 md:pb-28">
            {loading ? (
              <div className={cn(CARD, "overflow-hidden")}>
                <SkeletonRows />
              </div>
            ) : visible.length === 0 ? (
              <div className={CARD}>
                {orders.length === 0 ? (
                  <Empty
                    title="No sales orders yet."
                    action={
                      <button type="button" className={BTN} onClick={() => go("new")}>
                        <Plus size={13} /> New order
                      </button>
                    }
                  />
                ) : (
                  <Empty icon={SearchX} title="No orders match." action={<Clear onClear={clearAll} />} />
                )}
              </div>
            ) : view === "queue" ? (
              <QueueView
                orders={sorted}
                collapsed={collapsed}
                onToggle={(k) => setCollapsed((s) => toggleIn(s, k))}
                selected={selected}
                onSelectMany={(ids, v) => setSelected((s) => { const n = new Set(s); ids.forEach((id) => (v ? n.add(id) : n.delete(id))); return n; })}
                compact={compact}
                row={rowProps}
              />
            ) : view === "schedule" ? (
              <ScheduleView orders={sorted} collapsed={collapsed} onToggle={(k) => setCollapsed((s) => toggleIn(s, k))} row={rowProps} />
            ) : (
              <RegisterView orders={sorted} sort={sort} onSort={(key) => setSort((s) => ({ key, dir: s.key === key ? ((s.dir * -1) as 1 | -1) : key === "amount" || key === "date" ? -1 : 1 }))} row={rowProps} compact={compact} />
            )}
          </div>
        </div>

        {/* ── The panel side ────────────────────────────────────────────── */}
        {panelOpen && (
          <>
            {!docked && <div className="absolute inset-0 z-40 bg-bz-olive-dark/25" onClick={() => !composing && go(null)} />}
            <div
              className={cn(
                docked ? cn("relative h-full min-h-0 shrink-0", panelFull ? "flex-1" : "w-[720px]") : "absolute inset-y-0 right-0 z-50 w-full",
                !docked && (composing ? "max-w-none" : "max-w-[720px]"),
              )}
            >
              {composing ? (
                <OrderComposer
                  key={composing.kind === "edit" ? `edit-${composing.order.id}` : composing.kind === "copy" ? `copy-${composing.source?.no ?? composing.from.id}` : "new"}
                  mode={composing}
                  orders={orders}
                  onCancel={(draftKept) => {
                    if (composing.kind === "edit") go(composing.order.no);
                    else go(null);
                    if (draftKept) show("info", "Draft kept", { label: "Resume", run: () => go("new") });
                  }}
                  onSave={save}
                />
              ) : (
                openOrder && (
                  <OrderPanel
                    order={openOrder}
                    mode={mode}
                    docked={docked}
                    full={full}
                    position={position}
                    onMode={(m) => go(openOrder.no, m === "view" ? undefined : { do: m })}
                    onToggleFull={() => setFull((v) => !v)}
                    onClose={() => go(null)}
                    onPrev={() => step(-1)}
                    onNext={() => step(1)}
                    onEdit={() => go(openOrder.no, { do: "edit" })}
                    onApprove={() => approve(openOrder)}
                    onReject={(r) => reject(openOrder, r)}
                    onDeliver={(p, then) => deliver(openOrder, p, then)}
                    onInvoice={(p) => invoice(openOrder, p)}
                    onComment={(body) => update(openOrder.id, (x) => ({ ...x, comments: [...x.comments, { id: `c${Date.now()}`, authorId: ME.id, when: now(), body }] }))}
                    onAttach={() => update(openOrder.id, (x) => ({ ...x, attachments: [...x.attachments, { name: `scan-${x.attachments.length + 1}.pdf`, size: "96 KB" }] }))}
                    onCopy={() => navigate(`${BASE}/new?copy=${openOrder.no}`)}
                    onCloseOrder={() => {
                      update(openOrder.id, (x) => hist({ ...x, closed: true }, "closed the order"));
                      show("info", `${openOrder.no} closed`);
                    }}
                    onCancelOrder={(reason) => {
                      update(openOrder.id, (x) => hist({ ...x, cancelled: { reason, on: TODAY } }, `cancelled the order — “${reason}”`));
                      show("info", `${openOrder.no} cancelled`);
                    }}
                    onPrint={() => show("info", `Preparing ${openOrder.no} for print…`)}
                  />
                )
              )}
            </div>
          </>
        )}
      </div>

      <Popover open={keysOpen} anchor={keysRef.current} onClose={() => setKeysOpen(false)} align="right" width={250}>
        <p className={cn(LABEL, "m-0 px-2 pb-1 pt-1.5")}>Keyboard</p>
        {[
          ["N", "New order"],
          ["/", "Search"],
          ["J / K", "Next / previous order"],
          ["A", "Approve"],
          ["D", "Deliver"],
          ["I", "Invoice"],
          ["E", "Edit"],
          ["⌘↵", "Save / create"],
          ["Esc", "Back / close"],
        ].map(([k, label]) => (
          <div key={k} className="flex items-center justify-between px-2 py-1 text-[12px] text-bz-text">
            {label} <Kbd>{k}</Kbd>
          </div>
        ))}
      </Popover>

      <BulkBar count={selected.size} onClear={() => (setSelected(new Set()), setBulkNote(null))} note={bulkNote}>
        <BulkBtn onClick={() => bulk("approve")} disabled={!pickedOrders.some(needsMyApproval)}>
          <ShieldCheck size={12} /> Approve
        </BulkBtn>
        <BulkBtn onClick={() => bulk("deliver")} disabled={!pickedOrders.some((o) => ["deliver", "delivering"].includes(stageOf(o)))} title="Delivers everything left, from each order's own warehouse">
          <Truck size={12} /> Deliver all left
        </BulkBtn>
        <BulkBtn onClick={() => bulk("invoice")} disabled={!pickedOrders.some((o) => o.lines.some((l) => readyToInvoice(l) > 0))}>
          <ReceiptText size={12} /> Invoice delivered
        </BulkBtn>
        <BulkBtn onClick={() => show("info", `Preparing ${selected.size} orders for print…`)}>
          <Printer size={12} /> Print
        </BulkBtn>
      </BulkBar>

      <ToastHost toast={toast} onDismiss={dismiss} lifted={selected.size > 0} />
    </AppFrame>
  );
}

const toggleIn = <T,>(s: Set<T>, k: T) => {
  const n = new Set(s);
  if (n.has(k)) n.delete(k);
  else n.add(k);
  return n;
};

function FilterChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-surface py-0.5 pl-2 pr-1 text-[11px] font-medium text-bz-text">
      {children}
      <button type="button" onClick={onRemove} className="flex size-4 items-center justify-center rounded-[4px] text-[13px] leading-none text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text" aria-label="Remove filter">
        ×
      </button>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROW — one order, the same in every view
// ════════════════════════════════════════════════════════════════════════════

type RowProps = {
  order: Order;
  compact: boolean;
  active: boolean;
  selected: boolean;
  onSelect: (v: boolean) => void;
  onOpen: () => void;
  onDo: (m: "deliver" | "invoice" | "view") => void;
  meta?: React.ReactNode;
};

const COLS = "grid-cols-[20px_76px_minmax(0,1fr)_88px_28px_76px_132px_92px]";
const COLS_COMPACT = "grid-cols-[20px_68px_minmax(0,1fr)_116px]";

/** The one verb this order is waiting for, revealed on hover. */
function nextVerb(o: Order): { label: string; m: "deliver" | "invoice" | "view"; icon: React.ComponentType<{ size?: number }> } | null {
  const s = stageOf(o);
  if (s === "approval" && needsMyApproval(o)) return { label: "Review", m: "view", icon: ShieldCheck };
  if ((s === "deliver" || s === "delivering") && o.lines.some((l) => remainingToDeliver(l) - pendingOn(o, l, "delivery") > 0)) return { label: "Deliver", m: "deliver", icon: Truck };
  if ((s === "delivering" || s === "invoice") && o.lines.some((l) => readyToInvoice(l) - pendingOn(o, l, "invoice") > 0)) return { label: "Invoice", m: "invoice", icon: ReceiptText };
  return null;
}

function OrderRow({ order: o, compact, active, selected, onSelect, onOpen, onDo, meta }: RowProps) {
  const c = customerById(o.customerId)!;
  const verb = nextVerb(o);
  const p = progressOf(o);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={cn(
        "group relative grid cursor-pointer items-center gap-3 border-b border-bz-line-soft px-3 py-2.5 transition-colors last:border-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire",
        compact ? COLS_COMPACT : "grid-cols-[20px_minmax(0,1fr)_auto] md:grid-cols-[20px_76px_minmax(0,1fr)_88px_28px_76px_132px_92px]",
        active || selected ? "bg-bz-fire/10" : "bg-bz-surface hover:bg-bz-paper-warm",
      )}
    >
      {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-bz-fire" />}
      <span className={cn(selected ? "opacity-100" : "opacity-40 group-hover:opacity-100")}>
        <Checkbox on={selected} onChange={onSelect} label={`Select ${o.no}`} />
      </span>

      {/* Order no. — its own column from md */}
      <span className={cn("hidden text-[11.5px] font-medium text-bz-text-muted md:block", NUM, compact && "block")}>{o.no}</span>

      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-[12.5px] text-bz-text">{c.name}</span>
          {p.pendingDeliveries + p.pendingInvoices > 0 && !compact && (
            <span title="A document is awaiting approval">
              <CountMark>{p.pendingDeliveries + p.pendingInvoices} pending</CountMark>
            </span>
          )}
        </span>
        <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM, !compact && !meta && "md:hidden")}>
          <span className="md:hidden">{o.no} · </span>
          {meta ?? (
            <>
              {o.lines.length} line{o.lines.length === 1 ? "" : "s"}
              {compact && (
                <>
                  {" · "}
                  <ExpectedMark o={o} quiet />
                </>
              )}
            </>
          )}
        </span>
      </span>

      {!compact && (
        <>
          <span className="hidden md:block">
            <ExpectedMark o={o} />
          </span>
          <span className="hidden md:block">{o.repId ? <Avatar person={personById(o.repId)} size={20} /> : <Avatar person={undefined} size={20} />}</span>
          <span className="hidden md:block">
            <JourneyMark o={o} width={68} />
          </span>
        </>
      )}

      <span className="text-right">
        <span className="block text-[12.5px] font-semibold text-bz-text">
          <Amount value={orderTotal(o)} currency={o.currency !== "NPR" ? o.currency : undefined} />
        </span>
        {(compact || !verb) && <StageText o={o} />}
      </span>

      {!compact && (
        <span className="hidden justify-end md:flex" onClick={(e) => e.stopPropagation()}>
          {verb ? (
            <button type="button" onClick={() => onDo(verb.m)} className={cn(GHOST_SM, "h-7 px-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100")}>
              <verb.icon size={11} /> {verb.label}
            </button>
          ) : (
            <span className="text-bz-text-soft">
              <ChevronRight size={13} />
            </span>
          )}
        </span>
      )}
    </div>
  );
}

function StageText({ o }: { o: Order }) {
  const tone = STAGE_TONE[stageOf(o)];
  return (
    <span className={cn("block text-[10.5px]", tone === "danger" ? "text-bz-red" : "text-bz-text-soft")}>{stageLabel(o)}</span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// QUEUE — grouped by what each order is waiting for
// ════════════════════════════════════════════════════════════════════════════

function QueueView({
  orders,
  collapsed,
  onToggle,
  selected,
  onSelectMany,
  compact,
  row,
}: {
  orders: Order[];
  collapsed: Set<string>;
  onToggle: (k: string) => void;
  selected: Set<string>;
  onSelectMany: (ids: string[], v: boolean) => void;
  compact: boolean;
  row: (o: Order) => RowProps;
}) {
  const groups = QUEUES.map((g) => ({ ...g, rows: orders.filter((o) => queueOf(o) === g.key) })).filter((g) => g.rows.length > 0);
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      {!compact && (
        <div className={cn("hidden items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 md:grid", COLS, LABEL)}>
          <span />
          <span>Order</span>
          <span>Customer</span>
          <span>Expected</span>
          <span title="Sales rep">Rep</span>
          <span title="Delivered · invoiced">Progress</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
      )}
      {groups.map((g) => {
        const isCollapsed = collapsed.has(g.key);
        const ids = g.rows.map((o) => o.id);
        const nSel = ids.filter((id) => selected.has(id)).length;
        const value = g.rows.reduce((s, o) => s + orderTotal(o) * o.exchangeRate, 0);
        const mine = g.key === "mine";
        return (
          <section key={g.key}>
            <div className={cn("flex items-center gap-2 border-b border-bz-line-soft px-3 py-2", "bg-bz-paper-warm/60")}>
              <Checkbox on={nSel === ids.length} mixed={nSel > 0 && nSel < ids.length} onChange={(v) => onSelectMany(ids, v)} label={`Select all in ${g.label}`} />
              <button type="button" onClick={() => onToggle(g.key)} className="inline-flex min-w-0 items-center gap-1.5 text-left">
                {isCollapsed ? <ChevronRight size={13} className="text-bz-text-soft" /> : <ChevronDown size={13} className="text-bz-text-soft" />}
                {mine && <ShieldCheck size={12} className="text-bz-text-muted" />}
                <h3 className="m-0 truncate text-[12.5px] font-semibold text-bz-text">{g.label}</h3>
                <span className={cn("rounded-bz-sm bg-bz-surface/70 px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>{g.rows.length}</span>
              </button>
              <span className="ml-auto text-[11px] text-bz-text-soft">
                <Amount value={value} currency="NPR" />
              </span>
            </div>
            {!isCollapsed && g.rows.map((o) => <OrderRow key={o.id} {...row(o)} />)}
          </section>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCHEDULE — open orders by the date they were promised
// ════════════════════════════════════════════════════════════════════════════

function scheduleBuckets(orders: Order[]) {
  const live = orders.filter((o) => isOpen(o) && ["approval", "deliver", "delivering"].includes(stageOf(o)));
  const band = (o: Order) => {
    if (!o.expected) return "none";
    const d = daysBetween(TODAY, o.expected);
    if (d < 0) return "late";
    if (d <= 6) return "week";
    if (d <= 13) return "next";
    return "later";
  };
  return [
    { key: "late", label: "Late" },
    { key: "week", label: "This week" },
    { key: "next", label: "Next week" },
    { key: "later", label: "Later" },
    { key: "none", label: "No date" },
  ].map((b) => ({ ...b, rows: live.filter((o) => band(o) === b.key).sort((a, c) => (a.expected ?? "").localeCompare(c.expected ?? "")) }));
}

function ScheduleView({ orders, collapsed, onToggle, row }: { orders: Order[]; collapsed: Set<string>; onToggle: (k: string) => void; row: (o: Order) => RowProps }) {
  const buckets = scheduleBuckets(orders);
  return (
    <div className="flex flex-col gap-3">
      {buckets.map((b) => {
        const k = `s:${b.key}`;
        const isCollapsed = collapsed.has(k);
        const alarm = b.key === "late" && b.rows.length > 0;
        const units = b.rows.reduce((s, o) => s + o.lines.reduce((a, l) => a + remainingToDeliver(l), 0), 0);
        return (
          <section key={b.key} className={cn(CARD, "overflow-hidden")}>
            <div className={cn("flex items-center gap-2 border-b border-bz-line-soft px-3.5 py-2.5", alarm ? "bg-bz-red-soft" : "bg-bz-surface")}>
              <button type="button" onClick={() => onToggle(k)} className="inline-flex items-center gap-1.5">
                {isCollapsed ? <ChevronRight size={13} className="text-bz-text-soft" /> : <ChevronDown size={13} className="text-bz-text-soft" />}
                <h3 className={cn("m-0 text-[12.5px] font-semibold", alarm ? "text-bz-red" : "text-bz-text")}>{b.label}</h3>
                <span className={cn("rounded-bz-sm bg-bz-surface/70 px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>{b.rows.length}</span>
              </button>
              {b.rows.length > 0 && <span className={cn("ml-auto text-[11px] text-bz-text-soft", NUM)}>{b.rows.length} order{b.rows.length === 1 ? "" : "s"} to ship</span>}
            </div>
            {!isCollapsed &&
              (b.rows.length === 0 ? (
                <p className="m-0 px-3.5 py-3 text-[11.5px] text-bz-text-soft">{b.key === "late" ? "Nothing late." : "Nothing due."}</p>
              ) : (
                b.rows.map((o) => {
                  const left = o.lines.reduce((s, l) => s + remainingToDeliver(l), 0);
                  return (
                    <OrderRow
                      key={o.id}
                      {...row(o)}
                      meta={
                        <>
                          {o.expected ? fmtShort(o.expected) : "No date"} · {unitsLabel(o.lines.filter((l) => remainingToDeliver(l) > 0).map((l) => ({ unit: itemById(l.itemId)!.unit, qty: remainingToDeliver(l) })))} from {locationById(o.locationId)?.name}
                          {stageOf(o) === "approval" && " · not approved yet"}
                        </>
                      }
                    />
                  );
                })
              ))}
          </section>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REGISTER — flat, sortable, dense
// ════════════════════════════════════════════════════════════════════════════

function RegisterView({
  orders,
  sort,
  onSort,
  row,
  compact,
}: {
  orders: Order[];
  sort: { key: SortKey; dir: 1 | -1 };
  onSort: (k: SortKey) => void;
  row: (o: Order) => RowProps;
  compact: boolean;
}) {
  const total = orders.reduce((s, o) => s + orderTotal(o) * o.exchangeRate, 0);
  const Th = ({ k, children, right, className }: { k?: SortKey; children: React.ReactNode; right?: boolean; className?: string }) => (
    <th className={cn("sticky top-0 z-[2] whitespace-nowrap border-b border-bz-line bg-bz-paper-warm px-3 py-2 font-bold", LABEL, right ? "text-right" : "text-left", className)}>
      {k ? (
        <button type="button" onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 uppercase hover:text-bz-text", sort.key === k && "text-bz-text")}>
          {children}
          {sort.key === k && (sort.dir === 1 ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
        </button>
      ) : (
        children
      )}
    </th>
  );
  return (
    <div className={cn(CARD, "overflow-x-auto")}>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <Th className="w-[34px]"> </Th>
            <Th k="no">Order</Th>
            <Th k="date" className={cn(compact && "hidden")}>Date</Th>
            <Th k="customer">Customer</Th>
            <Th className={cn("hidden lg:table-cell", compact && "lg:hidden")}>Rep</Th>
            <Th className={cn("hidden lg:table-cell", compact && "lg:hidden")}>From</Th>
            <Th k="expected" className={cn(compact && "hidden")}>Expected</Th>
            <Th k="stage">Stage</Th>
            <Th className={cn("hidden md:table-cell", compact && "md:hidden")}>Progress</Th>
            <Th k="amount" right>
              Amount
            </Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const r = row(o);
            const c = customerById(o.customerId)!;
            return (
              <tr key={o.id} onClick={r.onOpen} className={cn("cursor-pointer align-top transition-colors", r.active || r.selected ? "bg-bz-fire/10" : "bg-bz-surface hover:bg-bz-paper-warm")}>
                <td className="border-b border-bz-line-soft px-3 py-2.5">
                  <Checkbox on={r.selected} onChange={r.onSelect} label={`Select ${o.no}`} />
                </td>
                <td className={cn("whitespace-nowrap border-b border-bz-line-soft px-3 py-2.5 font-medium text-bz-text", NUM)}>{o.no}</td>
                <td className={cn("whitespace-nowrap border-b border-bz-line-soft px-3 py-2.5 text-bz-text-muted", NUM, compact && "hidden")}>{fmtShort(o.date)}</td>
                <td className="max-w-[260px] border-b border-bz-line-soft px-3 py-2.5">
                  <span className="block truncate text-bz-text">{c.name}</span>
                  {o.customerPo && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>PO {o.customerPo}</span>}
                </td>
                <td className={cn("hidden border-b border-bz-line-soft px-3 py-2.5 lg:table-cell", compact && "lg:hidden")}>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-bz-text-muted">
                    <Avatar person={o.repId ? personById(o.repId) : undefined} size={18} />
                    {o.repId ? personById(o.repId)?.name.split(" ")[0] : "—"}
                  </span>
                </td>
                <td className={cn("hidden whitespace-nowrap border-b border-bz-line-soft px-3 py-2.5 text-bz-text-muted lg:table-cell", compact && "lg:hidden")}>{locationById(o.locationId)?.name}</td>
                <td className={cn("whitespace-nowrap border-b border-bz-line-soft px-3 py-2.5", compact && "hidden")}>
                  <ExpectedMark o={o} />
                </td>
                <td className="whitespace-nowrap border-b border-bz-line-soft px-3 py-2.5">
                  <Chip tone={STAGE_TONE[stageOf(o)]}>{stageLabel(o)}</Chip>
                </td>
                <td className={cn("hidden border-b border-bz-line-soft px-3 py-2.5 md:table-cell", compact && "md:hidden")}>
                  <JourneyMark o={o} width={72} />
                </td>
                <td className="whitespace-nowrap border-b border-bz-line-soft px-3 py-2.5 text-right font-semibold text-bz-text">
                  <Amount value={orderTotal(o)} currency={o.currency !== "NPR" ? o.currency : undefined} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={cn("flex items-center justify-between border-t border-bz-line-soft px-3 py-2 text-[11.5px] text-bz-text-muted", NUM)}>
        <span>
          {orders.length} order{orders.length === 1 ? "" : "s"}
        </span>
        <span>
          Total <span className="font-semibold text-bz-text"><Amount value={total} currency="NPR" /></span>
        </span>
      </div>
    </div>
  );
}

