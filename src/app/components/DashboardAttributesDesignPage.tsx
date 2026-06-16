import * as React from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Minus,
  GripVertical,
  ChevronsRight,
  ChevronsLeft,
  ArrowLeftRight,
  Check,
  Loader2,
  Inbox,
  Sparkles,
  Table2,
  Gauge,
  BellRing,
  LayoutGrid,
  SlidersHorizontal,
  CornerDownRight,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD SECTIONS · ATTRIBUTE ASSIGNMENT (shuttle / transfer picker)
//
// Primary action: curate WHICH attributes a dashboard section shows, and in
// WHAT ORDER. The whole screen is built around one move: shuttle attributes
// between "Available" and "Selected" until the Selected set (ordered) is right,
// then commit.
//
// Layout decision:
//   • Host page = a calm "Dashboard Sections" configurator. Each section card
//     previews its assigned attributes (in order) and carries the trigger that
//     opens the dialog seeded from THAT section. A header demo button opens the
//     canonical one too — "show it from any button".
//   • The dialog itself is the centre of gravity: two connected collections,
//     live counts, bulk move-all / return-all, per-row +/- (which never starts a
//     drag), drag between & within lists, double-click to move, contextual empty
//     states, and a dual-mode footer (persist-and-close vs confirm-and-handoff).
//
// Two invocation modes are exercised by the seed:
//   • persist  — live dashboard cards. Save writes to the backend (spinner),
//     then hands the ordered set back to the card (chips update) and closes.
//   • handoff  — a draft section inside an unsaved dashboard. Apply emits the
//     ordered set straight to the parent draft (no persistence) and closes.
// In both modes the payload is the ORDERED selected collection.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";

// ════════════════════════════════════════════════════════════════════════════
// MODEL
// ════════════════════════════════════════════════════════════════════════════

type ListName = "available" | "selected";

/**
 * An attribute carries a working id (dwId) used while the dialog is open and a
 * persisted id (savedId) written to the backend. Pre-commit normalization copies
 * dwId → savedId for every selected item — a data-flow transform, not UI.
 */
type Attr = { dwId: string; savedId: string | null; name: string };

type SectionType = "table" | "kpi" | "action" | "widget";
type SubmitMode = "persist" | "handoff";

type Section = {
  id: string;
  name: string;
  type: SectionType;
  blurb: string;
  mode: SubmitMode;
  draft?: boolean; // unsaved (handoff) section
  permitted: string[]; // full permitted pool for this section
  assigned: string[]; // currently selected, in order
};

const SECTION_META: Record<
  SectionType,
  { label: string; Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }
> = {
  table: { label: "Data table", Icon: Table2 },
  kpi: { label: "KPI row", Icon: Gauge },
  action: { label: "Action center", Icon: BellRing },
  widget: { label: "Widget", Icon: LayoutGrid },
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ════════════════════════════════════════════════════════════════════════════
// SEED — four sections with distinct attribute pools and mixed submit modes
// ════════════════════════════════════════════════════════════════════════════

const SEED_SECTIONS: Section[] = [
  {
    id: "sec-orders",
    name: "Recent Sales Orders",
    type: "table",
    blurb: "The live order book on the operations dashboard.",
    mode: "persist",
    permitted: [
      "Order #", "Customer", "Subsidiary", "Location", "Sales Rep", "Order Date",
      "Delivery Date", "Status", "Approval", "Fulfilment", "Billing", "Amount",
      "Tax", "Discount", "Currency", "Payment Terms", "Item Count", "Channel",
      "Priority", "Created By",
    ],
    assigned: ["Order #", "Customer", "Order Date", "Status", "Amount"],
  },
  {
    id: "sec-kpis",
    name: "Sales KPIs",
    type: "kpi",
    blurb: "The headline number row at the top of the dashboard.",
    mode: "persist",
    permitted: [
      "Total order value", "Orders this month", "Avg order value", "Pending approvals",
      "Delivered %", "Unbilled orders", "Overdue invoices", "New customers",
      "Cancelled orders", "Top location", "Gross margin", "Quotations open",
    ],
    assigned: ["Total order value", "Orders this month", "Pending approvals", "Delivered %"],
  },
  {
    id: "sec-action",
    name: "Action Center",
    type: "action",
    blurb: "The reminder card that nudges the team to act.",
    mode: "persist",
    permitted: [
      "Pending approvals", "Overdue deliveries", "Unbilled orders", "Credit-limit breaches",
      "Expiring quotations", "Low-stock items", "Failed payments", "Returns to review",
      "Reorder alerts",
    ],
    assigned: [
      "Pending approvals", "Overdue deliveries", "Unbilled orders",
      "Credit-limit breaches", "Expiring quotations", "Low-stock items",
    ],
  },
  {
    id: "sec-inventory",
    name: "Inventory Snapshot",
    type: "widget",
    blurb: "A new widget on an unsaved dashboard draft.",
    mode: "handoff",
    draft: true,
    permitted: [
      "On-hand value", "Items below reorder", "Top moving SKU", "Slow movers",
      "Warehouse fill %", "Pending transfers", "Stock variance", "Batch expiries",
    ],
    assigned: [], // opens with an empty Selected list → shows the contextual empty state
  },
];

// Build the two seeded collections for a section (assigned → selected, the rest
// of the permitted pool → available). Mirrors the dialog's initial backend load.
function seedCollections(section: Section): { available: Attr[]; selected: Attr[] } {
  const selected: Attr[] = section.assigned.map((name) => ({
    dwId: `${section.id}:${slug(name)}`,
    savedId: `${section.id}:${slug(name)}`, // already persisted
    name,
  }));
  const assignedSet = new Set(section.assigned);
  const available: Attr[] = section.permitted
    .filter((name) => !assignedSet.has(name))
    .map((name) => ({ dwId: `${section.id}:${slug(name)}`, savedId: null, name }));
  return { available, selected };
}

// ════════════════════════════════════════════════════════════════════════════
// SHUTTLE REDUCER — the two collections always stay complementary
// ════════════════════════════════════════════════════════════════════════════

type ShuttleState = { available: Attr[]; selected: Attr[] };

type ShuttleAction =
  | { type: "INIT"; available: Attr[]; selected: Attr[] }
  | { type: "MOVE_ONE"; id: string; from: ListName }
  | { type: "BULK"; from: ListName }
  | { type: "DROP"; id: string; from: ListName; to: ListName; index: number };

const other = (l: ListName): ListName => (l === "available" ? "selected" : "available");

function shuttleReducer(s: ShuttleState, a: ShuttleAction): ShuttleState {
  switch (a.type) {
    case "INIT":
      return { available: a.available, selected: a.selected };

    case "MOVE_ONE": {
      const src = s[a.from];
      const item = src.find((x) => x.dwId === a.id);
      if (!item) return s;
      const dst = other(a.from);
      return {
        ...s,
        [a.from]: src.filter((x) => x.dwId !== a.id),
        [dst]: [...s[dst], item],
      };
    }

    case "BULK": {
      if (s[a.from].length === 0) return s;
      const dst = other(a.from);
      return { ...s, [a.from]: [], [dst]: [...s[dst], ...s[a.from]] };
    }

    case "DROP": {
      const item = s[a.from].find((x) => x.dwId === a.id);
      if (!item) return s;

      if (a.from === a.to) {
        // in-place reorder
        const cur = s[a.from].findIndex((x) => x.dwId === a.id);
        if (a.index === cur || a.index === cur + 1) return s; // no-op
        const arr = s[a.from].filter((x) => x.dwId !== a.id);
        const idx = a.index > cur ? a.index - 1 : a.index;
        arr.splice(idx, 0, item);
        return { ...s, [a.from]: arr };
      }

      // cross-list move at a position
      const fromArr = s[a.from].filter((x) => x.dwId !== a.id);
      const toArr = [...s[a.to]];
      toArr.splice(Math.min(a.index, toArr.length), 0, item);
      return { ...s, [a.from]: fromArr, [a.to]: toArr };
    }
  }
}

// Pre-commit normalization: copy each selected item's working id into its
// persisted id, then emit the ordered names — the committed payload.
function normalizeForCommit(selected: Attr[]): { committed: Attr[]; order: string[] } {
  const committed = selected.map((a) => ({ ...a, savedId: a.dwId }));
  return { committed, order: committed.map((a) => a.name) };
}

// ════════════════════════════════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════════════════════════════════

function useBodyScrollLock(active: boolean) {
  React.useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

function CountPill({ n, tone }: { n: number; tone: ListName }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded-bz-pill px-1.5 text-[11px] font-semibold transition-colors",
        NUM,
        tone === "selected" ? "bg-bz-fire/[0.22] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted",
      )}
    >
      {n}
    </span>
  );
}

function DropLine() {
  return (
    <div className="relative my-0.5 h-0" aria-hidden>
      <div className="absolute inset-x-1 -top-[3px] h-[2px] rounded-bz-pill bg-bz-fire" />
      <div className="absolute -left-0.5 -top-[6px] size-2 rounded-bz-pill bg-bz-fire" />
    </div>
  );
}

// ── attribute row ──
function AttributeRow({
  attr,
  list,
  dragging,
  armed,
  onArm,
  onDisarm,
  onDragStart,
  onDragEnd,
  onMove,
  rowRef,
}: {
  attr: Attr;
  list: ListName;
  dragging: boolean;
  armed: boolean;
  onArm: () => void;
  onDisarm: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMove: () => void;
  rowRef: (el: HTMLDivElement | null) => void;
}) {
  const inSelected = list === "selected";
  return (
    <div
      ref={rowRef}
      draggable={armed}
      onDragStart={onDragStart}
      onDragEnd={() => {
        onDragEnd();
        onDisarm();
      }}
      onDoubleClick={onMove}
      title={attr.name}
      className={cn(
        "group relative flex h-10 select-none items-center gap-1.5 rounded-bz-md border pl-1 pr-1.5 transition-colors",
        inSelected
          ? "border-bz-line-soft bg-bz-surface hover:border-bz-line"
          : "border-transparent bg-bz-surface/70 hover:border-bz-line-soft hover:bg-bz-surface",
        dragging && "opacity-40",
      )}
    >
      {/* active accent (selected collection only) */}
      {inSelected && (
        <span
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-bz-pill bg-bz-fire"
          aria-hidden
        />
      )}

      {/* drag handle — the only affordance that arms a drag */}
      <span
        onMouseDown={onArm}
        onMouseUp={onDisarm}
        onMouseLeave={onDisarm}
        className="flex h-full w-5 cursor-grab items-center justify-center text-bz-text-soft opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder or move"
      >
        <GripVertical size={13} strokeWidth={1.8} />
      </span>

      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-bz-text">
        {attr.name}
      </span>

      {/* per-row move action — stops drag-arming on press so it never drags */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onMove();
        }}
        aria-label={inSelected ? `Remove ${attr.name}` : `Add ${attr.name}`}
        title={inSelected ? "Remove from selected" : "Add to selected"}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-bz-sm border transition-colors",
          inSelected
            ? "border-transparent text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]"
            : "border-transparent text-bz-text-soft hover:border-bz-line hover:bg-bz-fire/[0.18] hover:text-bz-text",
        )}
      >
        {inSelected ? <Minus size={13} /> : <Plus size={13} />}
      </button>
    </div>
  );
}

// ── empty-collection indicator (contextual wording per side) ──
function EmptyCollection({ list }: { list: ListName }) {
  const available = list === "available";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-8 text-center">
      <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-soft">
        {available ? <Check size={15} className="text-bz-leaf-deep" /> : <Inbox size={15} />}
      </span>
      <p className="text-[12.5px] font-semibold text-bz-text">
        {available ? "Everything's added" : "Nothing selected yet"}
      </p>
      <p className="max-w-[200px] text-[11px] leading-relaxed text-bz-text-muted">
        {available
          ? "Every permitted attribute is now on the right. Drag any back to remove it."
          : "Add attributes from the left — drag them across, or use the + on each row."}
      </p>
    </div>
  );
}

// ── one collection panel ──
function CollectionPanel({
  list,
  label,
  items,
  draggingId,
  armedId,
  dropIndex,
  onArm,
  onDisarm,
  onRowDragStart,
  onRowDragEnd,
  onPanelDragOver,
  onPanelDrop,
  onMoveItem,
  onBulk,
  setRowRef,
}: {
  list: ListName;
  label: string;
  items: Attr[];
  draggingId: string | null;
  armedId: string | null;
  dropIndex: number | null;
  onArm: (id: string) => void;
  onDisarm: () => void;
  onRowDragStart: (e: React.DragEvent, id: string, from: ListName) => void;
  onRowDragEnd: () => void;
  onPanelDragOver: (e: React.DragEvent, list: ListName) => void;
  onPanelDrop: (e: React.DragEvent, list: ListName) => void;
  onMoveItem: (id: string, from: ListName) => void;
  onBulk: (from: ListName) => void;
  setRowRef: (list: ListName, id: string) => (el: HTMLDivElement | null) => void;
}) {
  const empty = items.length === 0;
  const bulkIcon = list === "available" ? ChevronsRight : ChevronsLeft;
  const BulkIcon = bulkIcon;
  const bulkLabel = list === "available" ? "Add all" : "Remove all";

  return (
    <div className="flex min-h-0 flex-col md:flex-1">
      {/* header: label + live count + conditional bulk-move */}
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">{label}</span>
          <CountPill n={items.length} tone={list} />
        </div>
        {!empty && (
          <button
            type="button"
            onClick={() => onBulk(list)}
            className="inline-flex items-center gap-1 rounded-bz-sm px-1.5 py-1 text-[11px] font-semibold text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text"
          >
            {list === "selected" && <BulkIcon size={13} />}
            {bulkLabel}
            {list === "available" && <BulkIcon size={13} />}
          </button>
        )}
      </div>

      {/* scrollable list / empty state — also the drop zone */}
      <div
        onDragOver={(e) => onPanelDragOver(e, list)}
        onDrop={(e) => onPanelDrop(e, list)}
        className={cn(
          "h-[280px] overflow-y-auto rounded-bz-md border bg-bz-paper-warm/40 p-1.5 transition-colors md:h-auto md:min-h-0 md:flex-1",
          draggingId ? "border-dashed border-bz-line" : "border-bz-line-soft",
        )}
      >
        {empty ? (
          <EmptyCollection list={list} />
        ) : (
          <div className="flex flex-col gap-1">
            {items.map((attr, idx) => (
              <React.Fragment key={attr.dwId}>
                {dropIndex === idx && draggingId !== attr.dwId && <DropLine />}
                <AttributeRow
                  attr={attr}
                  list={list}
                  dragging={draggingId === attr.dwId}
                  armed={armedId === attr.dwId}
                  onArm={() => onArm(attr.dwId)}
                  onDisarm={onDisarm}
                  onDragStart={(e) => onRowDragStart(e, attr.dwId, list)}
                  onDragEnd={onRowDragEnd}
                  onMove={() => onMoveItem(attr.dwId, list)}
                  rowRef={setRowRef(list, attr.dwId)}
                />
              </React.Fragment>
            ))}
            {dropIndex === items.length && <DropLine />}
          </div>
        )}
      </div>
    </div>
  );
}

// ── connector between the two panels (communicates "connected") ──
function Connector() {
  return (
    <div className="flex shrink-0 items-center justify-center md:w-12 md:flex-col">
      <div className="hidden w-px flex-1 bg-bz-line-soft md:block" />
      <div className="h-px flex-1 bg-bz-line-soft md:hidden" />
      <span className="mx-3 my-2 flex size-7 items-center justify-center rounded-bz-pill border border-bz-line-soft bg-bz-surface text-bz-text-muted shadow-[0_1px_2px_rgba(15,20,17,0.06)]">
        <ArrowLeftRight size={12} />
      </span>
      <div className="hidden w-px flex-1 bg-bz-line-soft md:block" />
      <div className="h-px flex-1 bg-bz-line-soft md:hidden" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// THE DIALOG
// ════════════════════════════════════════════════════════════════════════════

function AttributeAssignmentDialog({
  section,
  open,
  onClose,
  onCommit,
}: {
  section: Section | null;
  open: boolean;
  onClose: () => void;
  onCommit: (order: string[]) => void;
}) {
  const [state, dispatch] = React.useReducer(shuttleReducer, { available: [], selected: [] });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [shown, setShown] = React.useState(false);

  // connected drag-and-drop state
  const [armedId, setArmedId] = React.useState<string | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const dragFrom = React.useRef<ListName | null>(null);
  const [drop, setDrop] = React.useState<{ list: ListName; index: number } | null>(null);
  const rowRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  useBodyScrollLock(open);

  // entrance transition
  React.useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // initial data load — re-seed every time the dialog opens for a section
  React.useEffect(() => {
    if (!open || !section) return;
    setLoading(true);
    setSaving(false);
    setArmedId(null);
    setDraggingId(null);
    setDrop(null);
    rowRefs.current.clear();
    const t = window.setTimeout(() => {
      const seeded = seedCollections(section);
      dispatch({ type: "INIT", available: seeded.available, selected: seeded.selected });
      setLoading(false);
    }, 460);
    return () => window.clearTimeout(t);
  }, [open, section]);

  // esc to dismiss
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const setRowRef = (list: ListName, id: string) => (el: HTMLDivElement | null) => {
    const key = `${list}:${id}`;
    if (el) rowRefs.current.set(key, el);
    else rowRefs.current.delete(key);
  };

  function onRowDragStart(e: React.DragEvent, id: string, from: ListName) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
    dragFrom.current = from;
  }

  function onPanelDragOver(e: React.DragEvent, list: ListName) {
    if (!draggingId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const items = state[list];
    let index = items.length;
    for (let i = 0; i < items.length; i++) {
      const el = rowRefs.current.get(`${list}:${items[i].dwId}`);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        index = i;
        break;
      }
    }
    setDrop((prev) => (prev && prev.list === list && prev.index === index ? prev : { list, index }));
  }

  function onPanelDrop(e: React.DragEvent, list: ListName) {
    if (!draggingId || !dragFrom.current) return;
    e.preventDefault();
    const index = drop && drop.list === list ? drop.index : state[list].length;
    dispatch({ type: "DROP", id: draggingId, from: dragFrom.current, to: list, index });
    onRowDragEnd();
  }

  function onRowDragEnd() {
    setDraggingId(null);
    setDrop(null);
    setArmedId(null);
    dragFrom.current = null;
  }

  function handleCommit() {
    if (!section) return;
    const { order } = normalizeForCommit(state.selected);
    if (section.mode === "persist") {
      // persist-and-close: write, then on success hand back + close
      setSaving(true);
      window.setTimeout(() => {
        setSaving(false);
        onCommit(order);
        onClose();
      }, 760);
    } else {
      // confirm-and-handoff: emit straight to the parent draft + close
      onCommit(order);
      onClose();
    }
  }

  if (!open || !section) return null;

  const meta = SECTION_META[section.type];
  const SectionIcon = meta.Icon;
  const selCount = state.selected.length;
  const primaryLabel = section.mode === "persist" ? "Save changes" : "Apply to dashboard";
  const footerNote =
    section.mode === "persist" ? "Writes to this dashboard card" : "Returns to the dashboard draft — saved later";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
      {/* scrim — solid translucent olive, no gradient */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-bz-olive/45 backdrop-blur-[2px] transition-opacity duration-200",
          shown ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />

      {/* panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assign attributes"
        className={cn(
          "relative flex max-h-[88vh] w-[min(940px,100%)] flex-col overflow-hidden rounded-bz-xl border border-bz-line bg-bz-surface shadow-[0_40px_120px_-28px_rgba(8,14,11,0.5)] transition-all duration-200",
          shown ? "opacity-100 scale-100" : "opacity-0 scale-[0.985]",
        )}
      >
        {/* 1 · heading region + dismiss */}
        <div className="flex items-start gap-3 border-b border-bz-line-soft px-5 py-4 md:px-6">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-fire/[0.20] text-bz-text">
            <SlidersHorizontal size={16} strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="text-[16px] font-semibold tracking-tight text-bz-text">Assign attributes</h2>
              <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-medium text-bz-text-muted">
                <SectionIcon size={11} strokeWidth={1.9} /> {meta.label}
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-bz-text-muted">
              Curate what <span className="font-medium text-bz-text">{section.name}</span> displays. Drag items
              between the lists or double-click to move them — the order on the right is the order they appear.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close without saving"
            className="flex size-8 shrink-0 items-center justify-center rounded-bz-md text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2 · the shuttle */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:overflow-hidden md:px-6 md:py-5">
          {loading ? (
            <DialogLoading />
          ) : (
            <div className="flex flex-col gap-3 md:h-[440px] md:flex-row md:gap-0">
              <CollectionPanel
                list="available"
                label="Available"
                items={state.available}
                draggingId={draggingId}
                armedId={armedId}
                dropIndex={drop?.list === "available" ? drop.index : null}
                onArm={setArmedId}
                onDisarm={() => setArmedId(null)}
                onRowDragStart={onRowDragStart}
                onRowDragEnd={onRowDragEnd}
                onPanelDragOver={onPanelDragOver}
                onPanelDrop={onPanelDrop}
                onMoveItem={(id, from) => dispatch({ type: "MOVE_ONE", id, from })}
                onBulk={(from) => dispatch({ type: "BULK", from })}
                setRowRef={setRowRef}
              />
              <Connector />
              <CollectionPanel
                list="selected"
                label="Selected"
                items={state.selected}
                draggingId={draggingId}
                armedId={armedId}
                dropIndex={drop?.list === "selected" ? drop.index : null}
                onArm={setArmedId}
                onDisarm={() => setArmedId(null)}
                onRowDragStart={onRowDragStart}
                onRowDragEnd={onRowDragEnd}
                onPanelDragOver={onPanelDragOver}
                onPanelDrop={onPanelDrop}
                onMoveItem={(id, from) => dispatch({ type: "MOVE_ONE", id, from })}
                onBulk={(from) => dispatch({ type: "BULK", from })}
                setRowRef={setRowRef}
              />
            </div>
          )}
        </div>

        {/* 3 · footer actions */}
        <div className="flex items-center justify-between gap-3 border-t border-bz-line-soft bg-bz-paper-warm/30 px-5 py-3.5 md:px-6">
          <p className={cn("hidden text-[11.5px] text-bz-text-muted sm:block", NUM)}>
            <span className="font-semibold text-bz-text">{selCount}</span>{" "}
            {selCount === 1 ? "attribute" : "attributes"} selected · {footerNote}
          </p>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md border border-bz-line bg-bz-surface px-4 text-[12.5px] font-semibold text-bz-text transition-colors hover:bg-bz-paper-warm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCommit}
              disabled={saving}
              className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? "Saving…" : primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── dialog loading state (initial backend fetch) ──
function DialogLoading() {
  return (
    <div className="flex flex-col gap-3 md:h-[440px] md:flex-row md:gap-0">
      {[0, 1].map((col) => (
        <React.Fragment key={col}>
          {col === 1 && <Connector />}
          <div className="flex min-h-0 flex-col md:flex-1">
            <div className="mb-2 flex items-center justify-between px-0.5">
              <div className="h-3 w-20 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
              <div className="h-5 w-6 animate-pulse rounded-bz-pill bg-bz-paper-warm" />
            </div>
            <div className="h-[280px] rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-1.5 md:h-auto md:min-h-0 md:flex-1">
              <div className="flex flex-col gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex h-10 items-center gap-2 rounded-bz-md bg-bz-surface px-2">
                    <div className="size-4 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
                    <div
                      className="h-3 animate-pulse rounded-bz-sm bg-bz-paper-warm"
                      style={{ width: `${50 + ((i * 13) % 35)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HOST — dashboard-section cards (each one triggers the dialog)
// ════════════════════════════════════════════════════════════════════════════

function SectionCard({ section, onConfigure }: { section: Section; onConfigure: () => void }) {
  const meta = SECTION_META[section.type];
  const Icon = meta.Icon;
  const shown = section.assigned.slice(0, 6);
  const extra = section.assigned.length - shown.length;

  return (
    <div className="flex flex-col rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4 transition-colors hover:border-bz-line">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[14px] font-semibold text-bz-text">{section.name}</h3>
            {section.draft ? (
              <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-leaf/50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text">
                Draft
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-fire/[0.18] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text">
                <span className="size-1.5 rounded-bz-pill bg-bz-leaf-deep" /> Live
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11.5px] text-bz-text-muted">
            {meta.label} · {section.blurb}
          </p>
        </div>
      </div>

      {/* assigned attributes, in order */}
      <div className="mt-3.5 min-h-[58px] rounded-bz-md border border-dashed border-bz-line-soft bg-bz-paper-warm/40 p-2.5">
        {section.assigned.length === 0 ? (
          <p className="flex h-full items-center gap-1.5 px-1 text-[11.5px] text-bz-text-soft">
            <CornerDownRight size={12} /> No attributes yet — configure to add some.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {shown.map((name, i) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-surface px-2 py-1 text-[11px] font-medium text-bz-text shadow-[0_1px_1px_rgba(15,20,17,0.04)]"
              >
                <span className={cn("text-[9px] font-bold text-bz-text-soft", NUM)}>{i + 1}</span>
                {name}
              </span>
            ))}
            {extra > 0 && (
              <span className={cn("inline-flex items-center rounded-bz-sm px-2 py-1 text-[11px] font-medium text-bz-text-muted", NUM)}>
                +{extra} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={cn("text-[11px] text-bz-text-muted", NUM)}>
          <span className="font-semibold text-bz-text">{section.assigned.length}</span> of {section.permitted.length}{" "}
          attributes
        </span>
        <button
          type="button"
          onClick={onConfigure}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text transition-colors hover:bg-bz-paper-warm"
        >
          <SlidersHorizontal size={13} /> Configure attributes
        </button>
      </div>
    </div>
  );
}

// ── docked toast (mirrors the app toast pattern) ──
function Toast({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(t);
  }, [message, onDismiss]);
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className="flex size-7 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22]">
          <Check size={13} className="text-bz-leaf-deep" />
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{message}</p>
        <button
          onClick={onDismiss}
          className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
          aria-label="Dismiss"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function DashboardAttributesDesignPage() {
  const [sections, setSections] = React.useState<Section[]>(SEED_SECTIONS);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const activeSection = activeId ? sections.find((s) => s.id === activeId) ?? null : null;

  const openFor = (id: string) => {
    setActiveId(id);
    setOpen(true);
  };

  // commit handler — the ordered selected set is the payload in BOTH modes
  const handleCommit = (order: string[]) => {
    if (!activeSection) return;
    setSections((prev) => prev.map((s) => (s.id === activeSection.id ? { ...s, assigned: order } : s)));
    setToast(
      activeSection.mode === "persist"
        ? `Updated “${activeSection.name}” — ${order.length} ${order.length === 1 ? "attribute" : "attributes"}`
        : `Handed ${order.length} ${order.length === 1 ? "attribute" : "attributes"} to the dashboard draft`,
    );
  };

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Customize</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Dashboard Sections</span>
        </>
      }
      overlay={<Toast message={toast} onDismiss={() => setToast(null)} />}
    >
      {/* page header */}
      <header className="px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Dashboard Sections</h1>
            <p className="mt-1 max-w-xl text-[12.5px] text-bz-text-muted">
              Choose which attributes each section of your dashboard surfaces. The order you set is the order it
              renders.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openFor(sections[0].id)}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95"
          >
            <Sparkles size={14} /> Configure attributes
          </button>
        </div>
      </header>

      {/* section cards — each one is a trigger */}
      <div className="px-4 pb-12 md:px-8">
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {sections.map((s) => (
            <SectionCard key={s.id} section={s} onConfigure={() => openFor(s.id)} />
          ))}
        </div>
      </div>

      <AttributeAssignmentDialog
        section={activeSection}
        open={open}
        onClose={() => setOpen(false)}
        onCommit={handleCommit}
      />
    </AppShell>
  );
}
