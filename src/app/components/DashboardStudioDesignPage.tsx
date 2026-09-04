import * as React from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  X,
  Check,
  Loader2,
  Undo2,
  Redo2,
  History,
  Eye,
  Pencil,
  Trash2,
  Copy,
  GripVertical,
  Info,
  Ban,
  Wand2,
  Lock,
  RefreshCw,
  Maximize2,
  CalendarRange,
  Building2,
  ArrowUp,
  ArrowDown,
  BarChart3,
  ListOrdered,
  Filter,
  Crosshair,
  Bookmark,
  BookmarkPlus,
  Layers,
  Send,
  MoreHorizontal,
  Inbox,
  Sigma,
  Package,
  Wallet,
  ShoppingCart,
  Users,
  Columns3,
  Rows3,
  TriangleAlert,
  ShieldCheck,
  CornerDownRight,
  Clock3,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD STUDIO — assemble a board out of questions
//
// PRIMARY ACTION: turn a QUESTION into a TILE. Everything on this screen is
// arranged so that "add a figure" is one obvious act expressed in business
// language — never a data source, a measure identifier, an axis token, an
// aggregation, a grain or a grid coordinate.
//
// HIERARCHY (a deliberate density choice)
//   - Two columns, not three. The CANVAS (left) is the board itself, rendered
//     at real fidelity. ONE INSPECTOR (right) edits exactly ONE selected tile.
//     Nothing else on the page is editable at the same time — which is the
//     whole answer to "a hundred and fifty simultaneously live controls".
//   - The composer reads as a SENTENCE: Show <figure> as <reading> broken down
//     by <axis>. Source and aggregation are shown back as PROVENANCE, never
//     asked for.
//   - Two constraint mechanisms that used to look identical are now named,
//     separated, and each explained in one line:
//        FILTERS - "only count records where..."  (narrows what is counted)
//        FOCUS   - "narrow the answer to one..."  (pins an axis of the summary)
//
// THREE FEEDBACK MOODS, NAMED AND DISTINCT (key lives in the header):
//   - Can't answer - a refusal; replaces the tile content; the server's words.
//   - Narrowed     - a real answer with an advisory attached.
//   - Adjusted     - the tool rewrote your choice; always says what and why,
//                    always undoable. Never silent.
//
// DELIBERATE OMISSIONS (the brief records these as inert or duplicated):
//   - no device-tier switcher (two of the three tiers are never read back),
//   - no coordinate entry, no split ratios, no composition kinds,
//   - no "save arrangement as a template" — a template that strips its figures
//     produces empty frames. Complete boards live in the catalogue instead, so
//     the word "template" now names exactly one thing.
//
// STATES NOT VISIBLE ON FIRST LOAD: the board switcher reaches "Executive
// Overview" (provided + locked, declared BEFORE any effort is invested) and
// "Untitled board" (empty). Publish refuses while a broken binding is on the
// board — repair or remove the "Warehouse utilisation" tile to clear it.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";
const g = (n: number) => Math.round(n).toLocaleString("en-US");

function compact(n: number): string {
  const a = Math.abs(n);
  const strip = (x: number) => x.toFixed(1).replace(/\.0$/, "");
  if (a >= 1e9) return strip(n / 1e9) + "B";
  if (a >= 1e6) return strip(n / 1e6) + "M";
  if (a >= 1e3) return strip(n / 1e3) + "K";
  return g(n);
}

// ════════════════════════════════════════════════════════════════════════════
// MODEL — readings, axes, filterable fields, and the QUESTION CATALOGUE
// ════════════════════════════════════════════════════════════════════════════

type IconType = React.ComponentType<{ size?: number; className?: string }>;

type ReadingId = "number" | "trend" | "rank" | "split" | "table";

const READINGS: { id: ReadingId; label: string; hint: string; icon: IconType }[] = [
  { id: "number", label: "One number", hint: "A single headline figure for the whole range.", icon: Sigma },
  { id: "trend", label: "Over time", hint: "The same figure, period by period.", icon: BarChart3 },
  { id: "rank", label: "Ranked list", hint: "Highest to lowest, one row per value.", icon: ListOrdered },
  { id: "split", label: "Composition", hint: "One bar showing how the total divides.", icon: Columns3 },
  { id: "table", label: "Records", hint: "The underlying rows, not a summary.", icon: Rows3 },
];
const readingOf = (id: ReadingId) => READINGS.find((r) => r.id === id)!;

type AxisKind = "category" | "date" | "place";
type Axis = { label: string; kind: AxisKind; values: string[]; slow?: boolean };

const AXES: Record<string, Axis> = {
  customer: {
    label: "Customer",
    kind: "category",
    values: [
      "Everest Retail",
      "Himalayan Java",
      "Sagarmatha Bank",
      "Annapurna Foods",
      "Bagmati Traders",
      "Lumbini Agro",
      "Pokhara Motors",
    ],
  },
  branch: { label: "Branch", kind: "place", values: ["Kathmandu", "Pokhara", "Biratnagar", "Butwal", "Nepalgunj"] },
  sales_person: {
    label: "Sales person",
    kind: "category",
    values: ["A. Shrestha", "R. Gurung", "S. Tamang", "P. Adhikari", "M. Rai"],
  },
  month: { label: "Month", kind: "date", values: [] },
  status: { label: "Status", kind: "category", values: ["Draft", "Pending approval", "Approved", "Cancelled"] },
  warehouse: {
    label: "Warehouse",
    kind: "category",
    values: ["Balaju Central", "Teku Bonded", "Pokhara Depot", "Birgunj Transit"],
    slow: true,
  },
  item_group: {
    label: "Item group",
    kind: "category",
    values: ["Beverages", "Packaging", "Dry goods", "Spares", "Consumables"],
  },
  supplier: {
    label: "Supplier",
    kind: "category",
    values: ["Nepal Packaging", "Terai Mills", "Indo-Nepal Freight", "Kailash Spares"],
  },
  department: {
    label: "Department",
    kind: "category",
    values: ["Sales", "Warehouse", "Finance", "Support", "Delivery"],
  },
};

type FieldType = "choice" | "text" | "number" | "date" | "yesno";
type FieldDef = { label: string; type: FieldType; choices?: string[]; slow?: boolean };

const FIELDS: Record<string, FieldDef> = {
  status: { label: "Document status", type: "choice", choices: AXES.status.values },
  branch: { label: "Branch", type: "choice", choices: AXES.branch.values },
  customer_group: { label: "Customer group", type: "choice", choices: ["Retail", "Wholesale", "Distributor", "Government"] },
  warehouse: { label: "Warehouse", type: "choice", choices: AXES.warehouse.values, slow: true },
  item_group: { label: "Item group", type: "choice", choices: AXES.item_group.values },
  currency: { label: "Currency", type: "choice", choices: ["NPR", "USD", "INR"] },
  amount: { label: "Document total", type: "number" },
  overdue_days: { label: "Days overdue", type: "number" },
  posted_on: { label: "Posted on", type: "date" },
  is_export: { label: "Export sale", type: "yesno" },
  remarks: { label: "Remarks", type: "text" },
};

const COMPARATORS: Record<FieldType, { id: string; label: string; pair?: boolean; none?: boolean }[]> = {
  choice: [
    { id: "is", label: "is" },
    { id: "is_not", label: "is not" },
    { id: "is_empty", label: "is empty", none: true },
  ],
  text: [
    { id: "contains", label: "contains" },
    { id: "is", label: "is exactly" },
    { id: "starts", label: "starts with" },
    { id: "is_empty", label: "is empty", none: true },
  ],
  number: [
    { id: "is", label: "is" },
    { id: "gt", label: "is more than" },
    { id: "lt", label: "is less than" },
    { id: "between", label: "is between", pair: true },
  ],
  date: [
    { id: "on", label: "is on" },
    { id: "before", label: "is before" },
    { id: "after", label: "is after" },
    { id: "between", label: "is between", pair: true },
  ],
  yesno: [{ id: "is", label: "is" }],
};

type Unit = "money" | "count" | "days" | "percent";

export type Figure = {
  id: string;
  question: string;
  label: string;
  area: string;
  areaIcon: IconType;
  /** shown back as provenance — never asked for */
  source: string;
  unit: Unit;
  readings: ReadingId[];
  axes: string[];
  fields: string[];
  /** a figure that was promoted to "reusable" from a tile */
  saved?: boolean;
  usedBy?: number;
};

export const FIGURES: Figure[] = [
  {
    id: "invoiced",
    question: "How much did we invoice?",
    label: "Invoiced amount",
    area: "Sales",
    areaIcon: ShoppingCart,
    source: "Sales Invoice · documents",
    unit: "money",
    readings: ["number", "trend", "rank", "split"],
    axes: ["customer", "branch", "sales_person", "month"],
    fields: ["status", "branch", "customer_group", "currency", "amount", "posted_on", "is_export"],
  },
  {
    id: "order_value",
    question: "What is the order book worth?",
    label: "Open order value",
    area: "Sales",
    areaIcon: ShoppingCart,
    source: "Sales Order · documents",
    unit: "money",
    readings: ["number", "trend", "rank", "split", "table"],
    axes: ["customer", "branch", "status", "month"],
    fields: ["status", "branch", "customer_group", "amount", "posted_on"],
  },
  {
    id: "order_count",
    question: "How many orders did we take?",
    label: "Order count",
    area: "Sales",
    areaIcon: ShoppingCart,
    source: "Sales Order · documents",
    unit: "count",
    readings: ["number", "trend", "rank", "split", "table"],
    axes: ["customer", "branch", "sales_person", "status", "month"],
    fields: ["status", "branch", "customer_group", "posted_on"],
  },
  {
    id: "collected",
    question: "How much did customers pay us?",
    label: "Collections",
    area: "Finance",
    areaIcon: Wallet,
    source: "Receipt · documents",
    unit: "money",
    readings: ["number", "trend", "rank", "split"],
    axes: ["customer", "branch", "month"],
    fields: ["branch", "currency", "amount", "posted_on"],
  },
  {
    id: "overdue",
    question: "How much is overdue?",
    label: "Overdue receivable",
    area: "Finance",
    areaIcon: Wallet,
    source: "Sales Invoice · outstanding balance",
    unit: "money",
    readings: ["number", "rank", "split", "table"],
    axes: ["customer", "branch", "sales_person"],
    fields: ["branch", "customer_group", "overdue_days", "amount"],
  },
  {
    id: "days_to_pay",
    question: "How long do customers take to pay?",
    label: "Average days to pay",
    area: "Finance",
    areaIcon: Clock3,
    source: "Sales Invoice · settlement",
    unit: "days",
    readings: ["number", "trend", "rank"],
    axes: ["customer", "branch", "month"],
    fields: ["branch", "customer_group", "overdue_days"],
  },
  {
    id: "stock_value",
    question: "What is our stock worth?",
    label: "Stock value",
    area: "Inventory",
    areaIcon: Package,
    source: "Stock Ledger · balances",
    unit: "money",
    readings: ["number", "rank", "split", "table"],
    axes: ["warehouse", "item_group", "branch"],
    fields: ["warehouse", "item_group", "branch", "amount"],
  },
  {
    id: "below_reorder",
    question: "Which items are below their reorder point?",
    label: "Items below reorder point",
    area: "Inventory",
    areaIcon: Package,
    source: "Item · stock levels",
    unit: "count",
    readings: ["table", "number", "rank"],
    axes: ["warehouse", "item_group"],
    fields: ["warehouse", "item_group"],
  },
  {
    id: "stock_ageing",
    question: "How old is the stock we are holding?",
    label: "Stock ageing",
    area: "Inventory",
    areaIcon: Package,
    source: "Stock Ledger · ageing buckets",
    unit: "money",
    readings: ["split", "rank", "number"],
    axes: ["warehouse", "item_group"],
    fields: ["warehouse", "item_group"],
  },
  {
    id: "spend",
    question: "How much did we spend with suppliers?",
    label: "Supplier spend",
    area: "Purchasing",
    areaIcon: Package,
    source: "Purchase Invoice · documents",
    unit: "money",
    readings: ["number", "trend", "rank", "split"],
    axes: ["supplier", "branch", "item_group", "month"],
    fields: ["status", "branch", "currency", "amount", "posted_on"],
  },
  {
    id: "po_open",
    question: "How many purchase orders are still open?",
    label: "Open purchase orders",
    area: "Purchasing",
    areaIcon: Package,
    source: "Purchase Order · documents",
    unit: "count",
    readings: ["number", "trend", "rank", "table"],
    axes: ["supplier", "branch", "status"],
    fields: ["status", "branch"],
  },
  {
    id: "headcount",
    question: "How many people are on the payroll?",
    label: "Headcount",
    area: "People",
    areaIcon: Users,
    source: "Employee · active records",
    unit: "count",
    readings: ["number", "split", "rank", "table"],
    axes: ["department", "branch"],
    fields: ["branch"],
  },
  {
    id: "attendance",
    question: "What share of scheduled hours were worked?",
    label: "Attendance rate",
    area: "People",
    areaIcon: Users,
    source: "Attendance · daily entries",
    unit: "percent",
    readings: ["number", "trend", "rank"],
    axes: ["department", "branch", "month"],
    fields: ["branch"],
  },
  {
    id: "gross_margin",
    question: "What is our gross margin?",
    label: "Gross margin %",
    area: "Saved figures",
    areaIcon: Bookmark,
    source: "Revenue ÷ cost of sales · defined once, reused",
    unit: "percent",
    readings: ["number", "trend", "rank"],
    axes: ["item_group", "branch", "month"],
    fields: ["branch", "item_group"],
    saved: true,
    usedBy: 3,
  },
  {
    id: "rev_per_head",
    question: "How much revenue per employee?",
    label: "Revenue per employee",
    area: "Saved figures",
    areaIcon: Bookmark,
    source: "Invoiced amount ÷ headcount · defined once, reused",
    unit: "money",
    readings: ["number", "trend", "rank"],
    axes: ["department", "branch", "month"],
    fields: ["branch"],
    saved: true,
    usedBy: 1,
  },
];

const figureOf = (id: string | null) => (id ? FIGURES.find((f) => f.id === id) ?? null : null);

// ════════════════════════════════════════════════════════════════════════════
// BOARD MODEL — one flat level: a board holds sections, a section holds tiles.
// (The engine's bands / composition units / receptacles have no shipped
// instance beyond the trivial path, so the surface does not expose them.)
// ════════════════════════════════════════════════════════════════════════════

type Mood = "ok" | "narrowed" | "refused";
/** columns out of 12 */
type Width = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
/** rows of the board grid */
type Height = 1 | 2 | 3 | 4;
type Scope = "board" | "this_month" | "last_month" | "this_quarter" | "this_year" | "last_12";

const SCOPES: { id: Scope; label: string; explain: string }[] = [
  { id: "board", label: "Follow the board", explain: "Whoever reads the board picks the range, and this tile follows it." },
  { id: "this_month", label: "This month", explain: "Always this calendar month, whatever the board is set to." },
  { id: "last_month", label: "Last month", explain: "Always the previous calendar month, whatever the board is set to." },
  { id: "this_quarter", label: "This quarter", explain: "Always the current quarter, whatever the board is set to." },
  { id: "this_year", label: "This fiscal year", explain: "Always the current fiscal year, whatever the board is set to." },
  { id: "last_12", label: "Rolling 12 months", explain: "Always the last twelve months, whatever the board is set to." },
];
const scopeOf = (id: Scope) => SCOPES.find((s) => s.id === id)!;

type FilterRow = { id: string; field: string; op: string; value: string; value2: string };
type FocusRow = { id: string; axis: string; value: string };

type Tile = {
  id: string;
  figureId: string | null;
  /** a binding that no longer resolves — rendered as a stand-in, blocks publish */
  broken?: boolean;
  reading: ReadingId;
  title: string;
  width: Width;
  height: Height;
  breakdown: string | null;
  grain: "day" | "week" | "month" | "quarter";
  filters: FilterRow[];
  focus: FocusRow[];
  scope: Scope;
  format: "auto" | "plain" | "compact";
  currency: "NPR" | "USD" | "INR";
  limit: number;
  mood: Mood;
  note?: string;
};

type Section = { id: string; title: string; tiles: Tile[] };
type Board = { id: string; name: string; provided: boolean; locked: boolean; version: number; sections: Section[] };

let uid = 0;
const nid = (p: string) => `${p}-${(uid++).toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

function makeTile(patch: Partial<Tile> = {}): Tile {
  return {
    id: nid("t"),
    figureId: null,
    reading: "number",
    title: "",
    width: 3,
    height: 1,
    breakdown: null,
    grain: "month",
    filters: [],
    focus: [],
    scope: "board",
    format: "auto",
    currency: "NPR",
    limit: 8,
    mood: "ok",
    ...patch,
  };
}

const BOARD_OPS: Board = {
  id: "bd-ops",
  name: "Trading — Monthly Command",
  provided: false,
  locked: false,
  version: 12,
  sections: [
    {
      id: "s-money",
      title: "Money",
      tiles: [
        makeTile({ id: "t1", figureId: "invoiced", reading: "number", width: 3 }),
        makeTile({ id: "t2", figureId: "collected", reading: "number", width: 3 }),
        makeTile({
          id: "t3",
          figureId: "overdue",
          reading: "number",
          width: 3,
          mood: "narrowed",
          filters: [{ id: "f1", field: "customer_group", op: "is", value: "Wholesale", value2: "" }],
          note: "The customer-group filter could not be applied to this figure, so the answer covers every customer group.",
        }),
        makeTile({
          id: "t4",
          figureId: "days_to_pay",
          reading: "number",
          width: 3,
          mood: "refused",
          note: "This figure needs a settlement date. Nothing in the selected range has been settled yet, so there is nothing to measure.",
        }),
        makeTile({ id: "t5", figureId: "invoiced", reading: "trend", width: 6, height: 2, breakdown: "month", title: "Invoiced by month" }),
        makeTile({ id: "t6", figureId: "overdue", reading: "rank", width: 6, height: 2, breakdown: "customer", limit: 7, title: "Who owes us the most" }),
      ],
    },
    {
      id: "s-stock",
      title: "Stock & supply",
      tiles: [
        makeTile({ id: "t7", figureId: "stock_value", reading: "split", width: 6, breakdown: "item_group", title: "Stock value by group" }),
        makeTile({ id: "t8", figureId: "below_reorder", reading: "table", width: 6, limit: 5 }),
        makeTile({ id: "t9", figureId: "gross_margin", reading: "number", width: 4 }),
        makeTile({ id: "t10", figureId: null, width: 4 }),
        makeTile({ id: "t11", figureId: "figure-88", broken: true, width: 4, title: "Warehouse utilisation" }),
      ],
    },
  ],
};

const BOARD_EXEC: Board = {
  id: "bd-exec",
  name: "Executive Overview",
  provided: true,
  locked: true,
  version: 4,
  sections: [
    {
      id: "e-1",
      title: "Group performance",
      tiles: [
        makeTile({ id: "e1", figureId: "invoiced", reading: "number", width: 4 }),
        makeTile({ id: "e2", figureId: "spend", reading: "number", width: 4 }),
        makeTile({ id: "e3", figureId: "gross_margin", reading: "number", width: 4 }),
        makeTile({ id: "e4", figureId: "invoiced", reading: "rank", width: 8, breakdown: "branch", limit: 5, title: "Branch league table" }),
        makeTile({ id: "e5", figureId: "headcount", reading: "split", width: 4, breakdown: "department" }),
      ],
    },
  ],
};

const BOARD_EMPTY: Board = {
  id: "bd-new",
  name: "Untitled board",
  provided: false,
  locked: false,
  version: 0,
  sections: [{ id: "n-1", title: "Section 1", tiles: [] }],
};

const BOARDS: Board[] = [BOARD_OPS, BOARD_EXEC, BOARD_EMPTY];

type BoardVersion = { n: number; when: string; who: string; note: string };
const VERSIONS: Record<string, BoardVersion[]> = {
  "bd-ops": [
    { n: 12, when: "Today, 09:14", who: "You", note: "Added “Who owes us the most”, widened the trend tile." },
    { n: 11, when: "Sep 1, 16:40", who: "You", note: "Split the board into Money and Stock & supply." },
    { n: 10, when: "Aug 28, 11:02", who: "R. Gurung", note: "Replaced the receivables table with a ranked list." },
    { n: 9, when: "Aug 12, 08:55", who: "You", note: "First working version." },
  ],
  "bd-exec": [{ n: 4, when: "Aug 30, 10:00", who: "Bizak", note: "Published by your provider." }],
  "bd-new": [],
};

// ════════════════════════════════════════════════════════════════════════════
// ANSWER ENGINE — deterministic per configuration, so a tile always reconciles
// with itself and a composition always sums back to its own headline.
// ════════════════════════════════════════════════════════════════════════════

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const unit01 = (s: string) => (hash(s) % 100000) / 100000;

const BASE: Record<Unit, number> = { money: 41_800_000, count: 1_180, days: 34, percent: 3800 };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function grainLabels(grain: Tile["grain"]): string[] {
  if (grain === "quarter") return ["Q1", "Q2", "Q3", "Q4"];
  if (grain === "week") return ["W31", "W32", "W33", "W34", "W35", "W36", "W37", "W38"];
  if (grain === "day") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return MONTHS.slice(0, 9);
}

type Answer = { total: number; prev: number; rows: { label: string; value: number }[] };

function tileAnswer(tile: Tile, fig: Figure): Answer {
  const seed = `${tile.id}|${fig.id}|${tile.breakdown ?? "-"}|${tile.reading}|${tile.filters.length}|${tile.focus.length}`;
  const total = Math.round(BASE[fig.unit] * (0.55 + unit01(seed) * 0.9));
  const prev = Math.round(total * (0.74 + unit01(seed + "p") * 0.44));

  const axis = tile.breakdown ? AXES[tile.breakdown] : null;
  const labels =
    axis && axis.kind === "date"
      ? grainLabels(tile.grain)
      : axis
        ? axis.values
        : fig.axes[0]
          ? AXES[fig.axes[0]].values
          : [];

  let rows = labels.map((label) => ({ label, value: 0.1 + unit01(seed + label) }));
  if (tile.reading === "rank" || tile.reading === "split") rows.sort((a, b) => b.value - a.value);
  rows = rows.slice(0, Math.max(2, tile.limit));

  const sum = rows.reduce((a, r) => a + r.value, 0) || 1;
  const scaled = rows.map((r) => ({ label: r.label, value: Math.round((r.value / sum) * total) }));
  const drift = total - scaled.reduce((a, r) => a + r.value, 0);
  if (scaled.length) scaled[0].value += drift;

  return { total, prev, rows: scaled };
}

function fmtFigure(n: number, tile: Tile, unit: Unit): string {
  if (tile.format === "plain") return g(n);
  if (unit === "percent") return `${(n / 100).toFixed(1)}%`;
  if (unit === "days") return `${Math.round(n)} days`;
  if (unit === "money") return `${tile.currency} ${compact(n)}`;
  return tile.format === "compact" ? compact(n) : g(n);
}

const tileTitle = (tile: Tile, fig: Figure | null) => tile.title.trim() || fig?.label || "Untitled tile";

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

export function Popover({
  anchorRef,
  open,
  onClose,
  align = "start",
  width,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  align?: "start" | "end";
  width?: number;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; right: number; w: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, right: window.innerWidth - r.right, w: r.width });
  }, [open, anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    // Scrolling FOLLOWS the anchor rather than dismissing the popover. A scroll
    // that starts inside the popover (its own option list) is ignored entirely;
    // the popover only closes once its anchor has left the viewport.
    const reposition = (e?: Event) => {
      const t = e?.target;
      if (t instanceof Node && ref.current?.contains(t)) return;
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) {
        onClose();
        return;
      }
      setPos({ top: r.bottom + 6, left: r.left, right: window.innerWidth - r.right, w: r.width });
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;
  const style: React.CSSProperties = {
    position: "fixed",
    top: pos.top,
    width: width ?? Math.max(pos.w, 240),
    maxWidth: "calc(100vw - 24px)",
  };
  if (align === "end") style.right = pos.right;
  else style.left = pos.left;

  return createPortal(
    <div
      ref={ref}
      style={style}
      className="z-[70] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.24)]"
    >
      {children}
    </div>,
    document.body,
  );
}

function Labelled({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-[11px] leading-[1.5] text-bz-text-muted">{hint}</p>}
    </div>
  );
}

const ChipTrigger = React.forwardRef<
  HTMLButtonElement,
  {
    value?: string | null;
    placeholder: string;
    onClick: () => void;
    tone?: "default" | "hero";
    disabled?: boolean;
    icon?: IconType;
  }
>(function ChipTriggerImpl({ value, placeholder, onClick, tone = "default", disabled, icon: Icon }, ref) {
  const filled = !!value;
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        tone === "hero" ? "min-h-10 py-2" : "h-8",
        filled
          ? "border-bz-line bg-bz-surface text-bz-text hover:border-bz-text-soft"
          : "border-dashed border-bz-line bg-bz-paper-warm text-bz-text-muted hover:border-bz-text-soft",
      )}
    >
      {Icon && <Icon size={13} className={cn("shrink-0", filled ? "text-bz-text-muted" : "text-bz-text-soft")} />}
      <span className={cn("min-w-0 flex-1 truncate", tone === "hero" ? "text-[13.5px] font-semibold" : "text-[12px]")}>
        {value || placeholder}
      </span>
      <ChevronDown size={12} className="shrink-0 text-bz-text-soft" />
    </button>
  );
});

function MiniInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-8 w-full rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[12px] text-bz-text placeholder:text-bz-text-soft focus:border-bz-text-soft focus:outline-none",
        type === "number" ? NUM : "",
      )}
    />
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
  icon: Icon,
  title,
  danger,
  active,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: IconType;
  title?: string;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-bz-md border px-2.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "border-bz-line-soft bg-bz-surface text-[#9A2E29] hover:bg-[#FBE5E2]"
          : active
            ? "border-bz-text bg-bz-paper-warm text-bz-text"
            : "border-bz-line-soft bg-bz-surface text-bz-text hover:bg-bz-paper-warm",
        !children && "w-8 justify-center px-0",
      )}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
}

function InspectorSection({
  title,
  icon: Icon,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: IconType;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-bz-line-soft last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-bz-paper-warm/50"
      >
        <Icon size={12} className="shrink-0 text-bz-text-soft" />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-muted">{title}</span>
        {badge}
        <ChevronDown size={12} className={cn("ml-auto shrink-0 text-bz-text-soft transition-transform", open ? "" : "-rotate-90")} />
      </button>
      {open && <div className="flex flex-col gap-3.5 px-4 pb-4 pt-0.5">{children}</div>}
    </div>
  );
}

// ── the three feedback moods, as one reusable notice ────────────────────────

export type MoodKind = "refused" | "narrowed" | "adjusted";

const MOOD_META: Record<MoodKind, { title: string; wrap: string; head: string; icon: IconType; iconClass: string }> = {
  refused: {
    title: "Can't answer",
    wrap: "border-[#EFC6C0] bg-[#FBE5E2]",
    head: "text-[#9A2E29]",
    icon: Ban,
    iconClass: "text-[#9A2E29]",
  },
  narrowed: {
    title: "Narrowed",
    wrap: "border-bz-leaf-deep/45 bg-bz-leaf/40",
    head: "text-bz-text",
    icon: Info,
    iconClass: "text-bz-text-muted",
  },
  adjusted: {
    title: "Adjusted",
    wrap: "border-bz-fire bg-bz-fire/[0.22]",
    head: "text-bz-text",
    icon: Wand2,
    iconClass: "text-bz-text",
  },
};

export function MoodNotice({
  mood,
  title,
  children,
  action,
}: {
  mood: MoodKind;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const m = MOOD_META[mood];
  const Icon = m.icon;
  return (
    <div className={cn("rounded-bz-md border px-3 py-2.5", m.wrap)}>
      <p className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]", m.head)}>
        <Icon size={11} className={m.iconClass} />
        {title ?? m.title}
      </p>
      <div className="mt-1.5 text-[11.5px] leading-[1.55] text-bz-text">{children}</div>
      {action && <div className="mt-2.5 flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TILE FACES — flat bars only, no gradients, no donuts, no sparklines
// ════════════════════════════════════════════════════════════════════════════

const SEGMENT_TONES = ["bg-bz-fire", "bg-bz-leaf-deep", "bg-bz-leaf", "bg-bz-olive-soft", "bg-bz-line", "bg-bz-text-soft"];

function NumberFace({ tile, fig, ans }: { tile: Tile; fig: Figure; ans: Answer }) {
  const delta = ans.prev ? ((ans.total - ans.prev) / ans.prev) * 100 : 0;
  const up = delta >= 0;
  return (
    <div className="flex flex-1 flex-col justify-center px-4 pb-4">
      <p className={cn("text-[27px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>
        {fmtFigure(ans.total, tile, fig.unit)}
      </p>
      <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-bz-text-muted">
        {up ? <ArrowUp size={11} className="text-bz-leaf-deep" /> : <ArrowDown size={11} className="text-[#C0413A]" />}
        <span className={cn("font-semibold text-bz-text", NUM)}>{Math.abs(delta).toFixed(1)}%</span>
        <span>vs the previous range</span>
      </p>
    </div>
  );
}

function TrendFace({ tile, fig, ans }: { tile: Tile; fig: Figure; ans: Answer }) {
  const max = Math.max(...ans.rows.map((r) => r.value), 1);
  return (
    <div className="flex flex-1 flex-col justify-end px-4 pb-4">
      <p className={cn("mb-3 text-[19px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>
        {fmtFigure(ans.total, tile, fig.unit)}
      </p>
      <div className="flex min-h-[92px] flex-1 items-end gap-1.5">
        {ans.rows.map((r, i) => (
          <div key={r.label} className="flex h-full flex-1 flex-col justify-end">
            <div
              className={cn("w-full rounded-t-bz-sm", i === ans.rows.length - 1 ? "bg-bz-fire" : "bg-bz-leaf")}
              style={{ height: `${Math.max(6, (r.value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {ans.rows.map((r) => (
          <span key={r.label} className={cn("flex-1 text-center text-[9.5px] text-bz-text-soft", NUM)}>
            {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function RankFace({ tile, fig, ans }: { tile: Tile; fig: Figure; ans: Answer }) {
  const max = Math.max(...ans.rows.map((r) => r.value), 1);
  return (
    <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4">
      {ans.rows.map((r, i) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[11.5px] text-bz-text">{r.label}</span>
            <span className={cn("shrink-0 text-[11.5px] font-semibold text-bz-text", NUM)}>
              {fmtFigure(r.value, tile, fig.unit)}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-bz-pill bg-bz-paper-warm">
            <div
              className={cn("h-full rounded-bz-pill", i === 0 ? "bg-bz-fire" : "bg-bz-leaf")}
              style={{ width: `${Math.max(4, (r.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SplitFace({ tile, fig, ans }: { tile: Tile; fig: Figure; ans: Answer }) {
  const total = ans.rows.reduce((a, r) => a + r.value, 0) || 1;
  return (
    <div className="flex flex-1 flex-col px-4 pb-4">
      <p className={cn("text-[19px] font-semibold leading-none tracking-tight text-bz-text", NUM)}>
        {fmtFigure(ans.total, tile, fig.unit)}
      </p>
      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-bz-pill">
        {ans.rows.map((r, i) => (
          <div
            key={r.label}
            className={SEGMENT_TONES[i % SEGMENT_TONES.length]}
            style={{ width: `${(r.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {ans.rows.map((r, i) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className={cn("size-1.5 shrink-0 rounded-bz-pill", SEGMENT_TONES[i % SEGMENT_TONES.length])} />
            <span className="min-w-0 flex-1 truncate text-[11px] text-bz-text-muted">{r.label}</span>
            <span className={cn("shrink-0 text-[11px] font-medium text-bz-text", NUM)}>
              {((r.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableFace({ tile, fig, ans }: { tile: Tile; fig: Figure; ans: Answer }) {
  return (
    <div className="flex-1 px-4 pb-4">
      <div className="overflow-x-auto rounded-bz-md border border-bz-line-soft">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-bz-line-soft bg-bz-paper-warm">
              <th className="px-2.5 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                {tile.breakdown ? AXES[tile.breakdown].label : "Record"}
              </th>
              <th className="px-2.5 py-1.5 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                {fig.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {ans.rows.map((r, i) => (
              <tr key={r.label} className={cn("border-b border-bz-line-soft last:border-b-0", i % 2 ? "bg-bz-paper-warm/50" : "")}>
                <td className="truncate px-2.5 py-1.5 text-[11.5px] text-bz-text">{r.label}</td>
                <td className={cn("px-2.5 py-1.5 text-right text-[11.5px] font-medium text-bz-text", NUM)}>
                  {fmtFigure(r.value, tile, fig.unit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TileFace({ tile, fig }: { tile: Tile; fig: Figure }) {
  const ans = React.useMemo(() => tileAnswer(tile, fig), [tile, fig]);
  if (tile.reading === "trend") return <TrendFace tile={tile} fig={fig} ans={ans} />;
  if (tile.reading === "rank") return <RankFace tile={tile} fig={fig} ans={ans} />;
  if (tile.reading === "split") return <SplitFace tile={tile} fig={fig} ans={ans} />;
  if (tile.reading === "table") return <TableFace tile={tile} fig={fig} ans={ans} />;
  return <NumberFace tile={tile} fig={fig} ans={ans} />;
}

// ════════════════════════════════════════════════════════════════════════════
// BOARD STATE — one reducer owns the board, the selection, undo/redo and the
// "Adjusted" notice, so every cascade can say what it just rewrote.
// ════════════════════════════════════════════════════════════════════════════

type Adjust = { id: number; changes: string[] } | null;

type State = {
  board: Board;
  past: Board[];
  future: Board[];
  dirty: boolean;
  selected: string | null;
  adjust: Adjust;
};

type Action =
  | { t: "load"; board: Board }
  | { t: "select"; id: string | null }
  | { t: "rename"; name: string }
  | { t: "patchTile"; id: string; patch: Partial<Tile>; changes?: string[] }
  | { t: "setFigure"; id: string; figureId: string }
  | { t: "addTile"; sectionId: string }
  | { t: "dupTile"; id: string }
  | { t: "removeTile"; id: string }
  | { t: "moveTile"; id: string; toSection: string; toIndex: number }
  | { t: "nudgeTile"; id: string; dir: -1 | 1 }
  | { t: "addSection" }
  | { t: "renameSection"; id: string; title: string }
  | { t: "removeSection"; id: string }
  | { t: "undo" }
  | { t: "redo" }
  | { t: "saved" }
  | { t: "restore"; version: number }
  | { t: "dismissAdjust" };

let adjustSeq = 0;

const allTiles = (b: Board) => b.sections.flatMap((s) => s.tiles);
const findTile = (b: Board, id: string) => allTiles(b).find((t) => t.id === id) ?? null;

function mapSections(b: Board, fn: (s: Section) => Section): Board {
  return { ...b, sections: b.sections.map(fn) };
}
function mapTile(b: Board, id: string, fn: (t: Tile) => Tile): Board {
  return mapSections(b, (s) => ({ ...s, tiles: s.tiles.map((t) => (t.id === id ? fn(t) : t)) }));
}
function cloneTile(t: Tile): Tile {
  return {
    ...t,
    id: nid("t"),
    filters: t.filters.map((f) => ({ ...f, id: nid("f") })),
    focus: t.focus.map((f) => ({ ...f, id: nid("k") })),
  };
}

/** Everything a change of figure invalidates, stated in the person's own terms. */
function recomposeForFigure(tile: Tile, next: Figure): { tile: Tile; changes: string[] } {
  const changes: string[] = [];
  let reading = tile.reading;
  if (!next.readings.includes(reading)) {
    reading = next.readings[0];
    changes.push(`“${readingOf(tile.reading).label}” isn’t available for this figure, so it now reads as “${readingOf(reading).label}”.`);
  }
  let breakdown = tile.breakdown;
  if (breakdown && !next.axes.includes(breakdown)) {
    changes.push(`The breakdown by ${AXES[breakdown].label} was removed — this figure can’t be split that way.`);
    breakdown = null;
  }
  const keptFilters = tile.filters.filter((f) => next.fields.includes(f.field));
  if (keptFilters.length !== tile.filters.length) {
    const dropped = tile.filters.filter((f) => !next.fields.includes(f.field)).map((f) => FIELDS[f.field].label);
    changes.push(`${dropped.length === 1 ? "One filter was" : `${dropped.length} filters were`} removed (${dropped.join(", ")}) — not available on this figure.`);
  }
  const keptFocus = tile.focus.filter((f) => next.axes.includes(f.axis));
  if (keptFocus.length !== tile.focus.length) {
    changes.push("The focus you had set was removed — this figure doesn’t carry that breakdown.");
  }
  return {
    tile: { ...tile, figureId: next.id, broken: false, reading, breakdown, filters: keptFilters, focus: keptFocus, mood: "ok", note: undefined },
    changes,
  };
}

function push(s: State, board: Board, extra: Partial<State> = {}): State {
  return { ...s, past: [...s.past, s.board].slice(-60), future: [], board, dirty: true, ...extra };
}

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case "load":
      return { board: a.board, past: [], future: [], dirty: false, selected: null, adjust: null };

    case "select":
      return { ...s, selected: a.id };

    // Renaming commits on its own, so it takes no history step and never marks
    // the board dirty — the component owns its in-flight / settled state.
    case "rename":
      return { ...s, board: { ...s.board, name: a.name } };

    case "patchTile": {
      const board = mapTile(s.board, a.id, (t) => ({ ...t, ...a.patch }));
      return push(s, board, a.changes?.length ? { adjust: { id: ++adjustSeq, changes: a.changes } } : { adjust: null });
    }

    case "setFigure": {
      const tile = findTile(s.board, a.id);
      const next = figureOf(a.figureId);
      if (!tile || !next) return s;
      const { tile: recomposed, changes } = recomposeForFigure(tile, next);
      const board = mapTile(s.board, a.id, () => recomposed);
      return push(s, board, { adjust: changes.length ? { id: ++adjustSeq, changes } : null });
    }

    case "addTile": {
      const tile = makeTile({ width: 4 });
      const board = mapSections(s.board, (sec) => (sec.id === a.sectionId ? { ...sec, tiles: [...sec.tiles, tile] } : sec));
      return push(s, board, { selected: tile.id, adjust: null });
    }

    case "dupTile": {
      const src = findTile(s.board, a.id);
      if (!src) return s;
      const copy = cloneTile(src);
      const board = mapSections(s.board, (sec) => {
        const i = sec.tiles.findIndex((t) => t.id === a.id);
        if (i < 0) return sec;
        const tiles = [...sec.tiles];
        tiles.splice(i + 1, 0, copy);
        return { ...sec, tiles };
      });
      return push(s, board, { selected: copy.id, adjust: null });
    }

    case "removeTile": {
      const board = mapSections(s.board, (sec) => ({ ...sec, tiles: sec.tiles.filter((t) => t.id !== a.id) }));
      return push(s, board, { selected: s.selected === a.id ? null : s.selected, adjust: null });
    }

    case "moveTile": {
      const tile = findTile(s.board, a.id);
      if (!tile) return s;
      const stripped = mapSections(s.board, (sec) => ({ ...sec, tiles: sec.tiles.filter((t) => t.id !== a.id) }));
      const board = mapSections(stripped, (sec) => {
        if (sec.id !== a.toSection) return sec;
        const tiles = [...sec.tiles];
        tiles.splice(Math.max(0, Math.min(a.toIndex, tiles.length)), 0, tile);
        return { ...sec, tiles };
      });
      return push(s, board, { adjust: null });
    }

    case "nudgeTile": {
      const board = mapSections(s.board, (sec) => {
        const i = sec.tiles.findIndex((t) => t.id === a.id);
        if (i < 0) return sec;
        const j = i + a.dir;
        if (j < 0 || j >= sec.tiles.length) return sec;
        const tiles = [...sec.tiles];
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        return { ...sec, tiles };
      });
      if (board === s.board) return s;
      return push(s, board, { adjust: null });
    }

    case "addSection": {
      const sec: Section = { id: nid("s"), title: `Section ${s.board.sections.length + 1}`, tiles: [] };
      return push(s, { ...s.board, sections: [...s.board.sections, sec] }, { adjust: null });
    }

    case "renameSection":
      return push(s, mapSections(s.board, (sec) => (sec.id === a.id ? { ...sec, title: a.title } : sec)), { adjust: null });

    case "removeSection":
      return push(s, { ...s.board, sections: s.board.sections.filter((sec) => sec.id !== a.id) }, { selected: null, adjust: null });

    case "undo": {
      if (!s.past.length) return s;
      const prev = s.past[s.past.length - 1];
      return { ...s, board: prev, past: s.past.slice(0, -1), future: [s.board, ...s.future].slice(0, 60), dirty: true, adjust: null };
    }

    case "redo": {
      if (!s.future.length) return s;
      const next = s.future[0];
      return { ...s, board: next, past: [...s.past, s.board].slice(-60), future: s.future.slice(1), dirty: true, adjust: null };
    }

    case "saved":
      return { ...s, dirty: false, past: [], future: [], adjust: null };

    case "restore": {
      // a restore is one step-back away from being undone
      const restored: Board = {
        ...s.board,
        version: a.version,
        sections: s.board.sections.map((sec) => ({ ...sec, tiles: sec.tiles.map((t) => ({ ...t })) })),
      };
      return push(s, restored, { adjust: null, selected: null });
    }

    case "dismissAdjust":
      return { ...s, adjust: null };

    default:
      return s;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// TILE CARD — the same component paints the canvas and the reading surface
// ════════════════════════════════════════════════════════════════════════════

// NOTE: written as arbitrary grid-column / grid-row utilities on purpose. The
// legacy `.col-span-12` / `.col-span-4` rules in style.css are UNLAYERED, so
// they beat Tailwind's layered responsive variants and would pin every tile to
// full width. Every literal is spelled out so Tailwind can generate the class.
const SPAN: Record<Width, string> = {
  1: "[grid-column:span_12] sm:[grid-column:span_6] xl:[grid-column:span_1]",
  2: "[grid-column:span_12] sm:[grid-column:span_6] xl:[grid-column:span_2]",
  3: "[grid-column:span_12] sm:[grid-column:span_6] xl:[grid-column:span_3]",
  4: "[grid-column:span_12] sm:[grid-column:span_6] xl:[grid-column:span_4]",
  5: "[grid-column:span_12] sm:[grid-column:span_6] xl:[grid-column:span_5]",
  6: "[grid-column:span_12] lg:[grid-column:span_6]",
  7: "[grid-column:span_12] xl:[grid-column:span_7]",
  8: "[grid-column:span_12] xl:[grid-column:span_8]",
  9: "[grid-column:span_12] xl:[grid-column:span_9]",
  10: "[grid-column:span_12] xl:[grid-column:span_10]",
  11: "[grid-column:span_12] xl:[grid-column:span_11]",
  12: "[grid-column:span_12]",
};

// Row spans apply from lg up only — below that every tile is a full-width,
// content-height card, and a 3-row-tall number would just be empty space.
const ROWSPAN: Record<Height, string> = {
  1: "",
  2: "lg:[grid-row:span_2]",
  3: "lg:[grid-row:span_3]",
  4: "lg:[grid-row:span_4]",
};

const WIDTH_WORD: Partial<Record<Width, string>> = {
  3: "a quarter",
  4: "a third",
  6: "half",
  8: "two thirds",
  9: "three quarters",
  12: "the full width",
};

/** the board's row height floor — a tile 2 rows tall gets at least twice this */
const ROW_MIN = "lg:[grid-auto-rows:minmax(168px,auto)]";

// ── SIZE PICKER  drag-free 12 × 4 footprint chooser ────────────────────────
// Sizing used to be four preset buttons, which could not express "3 columns by
// 3 rows". This shows the actual board grid and asks the person to point at the
// bottom-right corner of the tile they want — no coordinates, no ratios.
function SizePicker({
  width,
  height,
  onChange,
}: {
  width: Width;
  height: Height;
  onChange: (w: Width, h: Height) => void;
}) {
  const [hover, setHover] = React.useState<{ w: Width; h: Height } | null>(null);
  const w = hover?.w ?? width;
  const h = hover?.h ?? height;
  return (
    <div>
      <div
        onMouseLeave={() => setHover(null)}
        className="grid w-full grid-cols-12 gap-[2px] rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-1.5"
      >
        {Array.from({ length: 48 }).map((_, i) => {
          const col = ((i % 12) + 1) as Width;
          const row = (Math.floor(i / 12) + 1) as Height;
          const inPreview = col <= w && row <= h;
          const inCurrent = col <= width && row <= height;
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover({ w: col, h: row })}
              onFocus={() => setHover({ w: col, h: row })}
              onClick={() => { onChange(col, row); setHover(null); }}
              aria-label={`${col} ${col === 1 ? "column" : "columns"} by ${row} ${row === 1 ? "row" : "rows"}`}
              className={cn(
                "h-4 rounded-[2px] transition-colors",
                inPreview ? "bg-bz-fire" : inCurrent ? "bg-bz-leaf" : "bg-bz-surface hover:bg-bz-leaf/60",
              )}
            />
          );
        })}
      </div>
      <p className="mt-1.5 text-[11.5px] text-bz-text-muted">
        <span className={cn("font-semibold text-bz-text", NUM)}>
          {w} × {h}
        </span>{" "}
        — {w} {w === 1 ? "column" : "columns"}
        {WIDTH_WORD[w] ? ` (${WIDTH_WORD[w]} of the board)` : ""}, {h} {h === 1 ? "row" : "rows"} tall.
      </p>
    </div>
  );
}

function TileMenu({
  open,
  anchorRef,
  onClose,
  sections,
  currentSection,
  onConfigure,
  onDuplicate,
  onMove,
  onRemove,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  sections: Section[];
  currentSection: string;
  onConfigure: () => void;
  onDuplicate: () => void;
  onMove: (sectionId: string) => void;
  onRemove: () => void;
}) {
  const item = "flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-bz-text hover:bg-bz-paper-warm";
  return (
    <Popover anchorRef={anchorRef} open={open} onClose={onClose} align="end" width={224}>
      <div className="py-1">
        <button className={item} onClick={() => { onConfigure(); onClose(); }}>
          <Pencil size={12} className="text-bz-text-muted" /> Edit this tile
        </button>
        <button className={item} onClick={() => { onDuplicate(); onClose(); }}>
          <Copy size={12} className="text-bz-text-muted" /> Duplicate
        </button>
        {sections.length > 1 && (
          <>
            <p className="mt-1 border-t border-bz-line-soft px-3 pb-1 pt-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
              Move to section
            </p>
            {sections
              .filter((s) => s.id !== currentSection)
              .map((s) => (
                <button key={s.id} className={item} onClick={() => { onMove(s.id); onClose(); }}>
                  <CornerDownRight size={12} className="text-bz-text-muted" />
                  <span className="truncate">{s.title}</span>
                </button>
              ))}
          </>
        )}
        <button
          className={cn(item, "mt-1 border-t border-bz-line-soft pt-2 text-[#9A2E29]")}
          onClick={() => { onRemove(); onClose(); }}
        >
          <Trash2 size={12} /> Remove tile
        </button>
      </div>
    </Popover>
  );
}

function TileCard({
  tile,
  mode,
  selected,
  locked,
  sections,
  sectionId,
  onSelect,
  dispatch,
  onExpand,
  dragHandlers,
  dropTarget,
}: {
  tile: Tile;
  mode: "edit" | "read";
  selected: boolean;
  locked: boolean;
  sections: Section[];
  sectionId: string;
  onSelect: () => void;
  dispatch: React.Dispatch<Action>;
  onExpand?: () => void;
  dragHandlers?: React.HTMLAttributes<HTMLDivElement> & { draggable?: boolean };
  dropTarget?: boolean;
}) {
  const fig = figureOf(tile.figureId);
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const broken = !!tile.broken || (!!tile.figureId && !fig);
  const editable = mode === "edit" && !locked;

  const refreshOne = () => {
    setBusy(true);
    window.setTimeout(() => setBusy(false), 700);
  };

  return (
    <div
      {...dragHandlers}
      onClick={editable ? onSelect : undefined}
      className={cn(
        SPAN[tile.width],
        ROWSPAN[tile.height],
        "group flex min-h-[168px] flex-col overflow-hidden rounded-bz-lg border bg-bz-surface transition-colors",
        selected && editable ? "border-bz-text ring-1 ring-bz-text" : "border-bz-line-soft",
        dropTarget && "border-bz-fire ring-2 ring-bz-fire",
        editable && "cursor-pointer hover:border-bz-line",
      )}
    >
      {/* head */}
      <div className="flex items-start gap-2 px-4 pb-2.5 pt-3.5">
        {editable && (
          <GripVertical
            size={13}
            className="mt-0.5 shrink-0 cursor-grab text-bz-line opacity-0 transition-opacity group-hover:opacity-100"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold leading-tight text-bz-text">{tileTitle(tile, fig)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[10.5px] text-bz-text-soft">
            {fig?.saved && <Bookmark size={9} className="shrink-0 text-bz-text-soft" />}
            <span className="truncate">
              {broken ? "Binding unresolved" : fig ? `${readingOf(tile.reading).label}${tile.breakdown ? ` · by ${AXES[tile.breakdown].label}` : ""}` : "Nothing chosen yet"}
            </span>
          </p>
        </div>
        {mode === "read" ? (
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={refreshOne}
              aria-label="Refresh this tile"
              className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
            >
              <RefreshCw size={11} className={busy ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onExpand}
              aria-label="Expand this tile"
              className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
            >
              <Maximize2 size={11} />
            </button>
          </div>
        ) : editable ? (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 [&:has(:focus)]:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); dispatch({ t: "nudgeTile", id: tile.id, dir: -1 }); }}
              aria-label="Move earlier"
              className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
            >
              <ChevronDown size={12} className="rotate-90" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); dispatch({ t: "nudgeTile", id: tile.id, dir: 1 }); }}
              aria-label="Move later"
              className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
            >
              <ChevronDown size={12} className="-rotate-90" />
            </button>
            <button
              ref={menuRef}
              onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }}
              aria-label="Tile actions"
              className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
            >
              <MoreHorizontal size={12} />
            </button>
          </div>
        ) : null}
      </div>

      {/* body */}
      {broken ? (
        <div className="flex flex-1 flex-col justify-center gap-2 px-4 pb-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-muted">
            <TriangleAlert size={11} /> Figure not found
          </p>
          <p className="text-[11.5px] leading-[1.5] text-bz-text-muted">
            The saved figure this tile points at no longer exists. Pick a new one, or remove the tile.
          </p>
          {editable && (
            <div className="mt-1 flex gap-2">
              <GhostButton onClick={onSelect}>Pick a figure</GhostButton>
              <GhostButton danger icon={Trash2} onClick={() => dispatch({ t: "removeTile", id: tile.id })}>
                Remove
              </GhostButton>
            </div>
          )}
        </div>
      ) : !fig ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 pb-5">
          <p className="text-center text-[11.5px] leading-[1.5] text-bz-text-muted">
            {editable ? "This tile is empty." : "Nothing has been chosen for this tile."}
          </p>
          {editable && (
            <button
              onClick={onSelect}
              className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
            >
              <Plus size={12} /> Choose what it shows
            </button>
          )}
        </div>
      ) : tile.mood === "refused" ? (
        <div className="flex-1 px-4 pb-4">
          <MoodNotice mood="refused">{tile.note}</MoodNotice>
        </div>
      ) : busy ? (
        <div className="flex flex-1 items-center justify-center pb-4">
          <Loader2 size={16} className="animate-spin text-bz-text-soft" />
        </div>
      ) : (
        <>
          <TileFace tile={tile} fig={fig} />
          {tile.mood === "narrowed" && tile.note && (
            <div className="mx-4 mb-4 flex items-start gap-1.5 rounded-bz-sm bg-bz-leaf/40 px-2.5 py-2">
              <Info size={11} className="mt-px shrink-0 text-bz-text-muted" />
              <p className="text-[10.5px] leading-[1.5] text-bz-text-muted">
                <span className="font-semibold uppercase tracking-[0.1em] text-bz-text">Narrowed · </span>
                {tile.note}
              </p>
            </div>
          )}
        </>
      )}

      {editable && (
        <TileMenu
          open={menu}
          anchorRef={menuRef}
          onClose={() => setMenu(false)}
          sections={sections}
          currentSection={sectionId}
          onConfigure={onSelect}
          onDuplicate={() => dispatch({ t: "dupTile", id: tile.id })}
          onMove={(sid) => dispatch({ t: "moveTile", id: tile.id, toSection: sid, toIndex: 999 })}
          onRemove={() => dispatch({ t: "removeTile", id: tile.id })}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DEPENDENT LOOKUPS — a chooser that cannot be filled says so and offers a
// retry. It never degrades into a free-text box over codes nobody can know.
// ════════════════════════════════════════════════════════════════════════════

const lookupAttempts = new Map<string, number>();

type Lookup = { status: "loading" | "ready" | "failed"; values: string[]; retry: () => void };

function useValues(key: string | null, provided?: string[], slow?: boolean): Lookup {
  const [state, setState] = React.useState<{ status: "loading" | "ready" | "failed"; values: string[] }>({
    status: "loading",
    values: [],
  });
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    if (!key) {
      setState({ status: "ready", values: [] });
      return;
    }
    setState({ status: "loading", values: [] });
    const attempts = (lookupAttempts.get(key) ?? 0) + 1;
    lookupAttempts.set(key, attempts);
    const willFail = !!slow && attempts === 1;
    const id = window.setTimeout(
      () => setState(willFail ? { status: "failed", values: [] } : { status: "ready", values: provided ?? [] }),
      willFail ? 850 : 380,
    );
    return () => window.clearTimeout(id);
  }, [key, nonce, slow, provided]);

  return { ...state, retry: () => setNonce((n) => n + 1) };
}

function ValueChooser({
  lookup,
  value,
  onChange,
  placeholder,
  whatFor,
}: {
  lookup: Lookup;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  whatFor: string;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  if (lookup.status === "loading") {
    return (
      <div className="flex h-8 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-2.5 text-[12px] text-bz-text-muted">
        <Loader2 size={12} className="animate-spin text-bz-text-soft" /> Loading {whatFor}…
      </div>
    );
  }
  if (lookup.status === "failed") {
    return (
      <div className="rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm px-2.5 py-2">
        <p className="text-[11.5px] leading-[1.5] text-bz-text-muted">
          The list of {whatFor} could not be loaded, so there is nothing safe to choose from yet.
        </p>
        <button
          type="button"
          onClick={lookup.retry}
          className="mt-1.5 inline-flex h-7 items-center gap-1.5 rounded-bz-sm border border-bz-line bg-bz-surface px-2 text-[11.5px] font-semibold text-bz-text hover:bg-bz-paper-warm"
        >
          <RefreshCw size={11} /> Try again
        </button>
      </div>
    );
  }
  if (!lookup.values.length) {
    return (
      <div className="flex h-8 items-center rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm px-2.5 text-[11.5px] text-bz-text-muted">
        No {whatFor} exist yet.
      </div>
    );
  }
  return (
    <>
      <ChipTrigger ref={ref} value={value} placeholder={placeholder} onClick={() => setOpen((o) => !o)} />
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)}>
        <div className="max-h-64 overflow-y-auto py-1">
          {lookup.values.map((v) => (
            <button
              key={v}
              onClick={() => { onChange(v); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-bz-text hover:bg-bz-paper-warm"
            >
              <Check size={12} className={cn("shrink-0", v === value ? "text-bz-leaf-deep" : "opacity-0")} />
              <span className="truncate">{v}</span>
            </button>
          ))}
        </div>
      </Popover>
    </>
  );
}

export function SimplePicker<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  icon,
  width,
}: {
  value: T | null;
  options: { id: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
  placeholder: string;
  icon?: IconType;
  width?: number;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const current = options.find((o) => o.id === value);
  return (
    <>
      <ChipTrigger ref={ref} value={current?.label ?? null} placeholder={placeholder} onClick={() => setOpen((o) => !o)} icon={icon} />
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)} width={width}>
        <div className="max-h-72 overflow-y-auto py-1">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => { onChange(o.id); setOpen(false); }}
              className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm"
            >
              <Check size={12} className={cn("mt-0.5 shrink-0", o.id === value ? "text-bz-leaf-deep" : "opacity-0")} />
              <span className="min-w-0">
                <span className="block truncate text-[12px] text-bz-text">{o.label}</span>
                {o.hint && <span className="mt-0.5 block text-[11px] leading-[1.45] text-bz-text-muted">{o.hint}</span>}
              </span>
            </button>
          ))}
        </div>
      </Popover>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIGURE PICKER — a catalogue of QUESTIONS, grouped by business area. The
// source, the aggregation and the identifier never appear as something to pick.
// ════════════════════════════════════════════════════════════════════════════

function FigurePicker({
  open,
  anchorRef,
  onClose,
  value,
  onPick,
  promoted,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  value: string | null;
  onPick: (id: string) => void;
  promoted: Set<string>;
}) {
  const [q, setQ] = React.useState("");
  React.useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const term = q.trim().toLowerCase();
  const matches = FIGURES.filter(
    (f) => !term || f.question.toLowerCase().includes(term) || f.label.toLowerCase().includes(term) || f.area.toLowerCase().includes(term),
  );
  const areas = Array.from(new Set(matches.map((f) => f.area)));
  areas.sort((a, b) => (a === "Saved figures" ? -1 : b === "Saved figures" ? 1 : 0));

  return (
    <Popover anchorRef={anchorRef} open={open} onClose={onClose} width={360}>
      <div className="flex items-center gap-2 border-b border-bz-line-soft px-3 py-2">
        <Search size={12} className="shrink-0 text-bz-text-soft" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask for a figure — “overdue”, “stock”, “invoiced”…"
          className="h-6 w-full bg-transparent text-[12px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
        />
      </div>
      <div className="max-h-[340px] overflow-y-auto">
        {!matches.length ? (
          <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
            <Search size={16} className="text-bz-text-soft" />
            <p className="text-[12px] font-medium text-bz-text">Nothing matches “{q}”.</p>
            <p className="text-[11px] leading-[1.5] text-bz-text-muted">
              Try a plainer word — the catalogue is written as questions, not as field names.
            </p>
          </div>
        ) : (
          areas.map((area) => {
            const rows = matches.filter((f) => f.area === area);
            const Icon = rows[0].areaIcon;
            return (
              <div key={area}>
                <p className="sticky top-0 flex items-center gap-1.5 bg-bz-paper-warm px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                  <Icon size={10} /> {area}
                </p>
                {rows.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { onPick(f.id); onClose(); }}
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-bz-paper-warm"
                  >
                    <Check size={12} className={cn("mt-0.5 shrink-0", f.id === value ? "text-bz-leaf-deep" : "opacity-0")} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="min-w-0 truncate text-[12.5px] font-medium text-bz-text">{f.question}</span>
                        {(f.saved || promoted.has(f.id)) && <Bookmark size={10} className="shrink-0 text-bz-text-soft" />}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-bz-text-muted">{f.source}</span>
                    </span>
                  </button>
                ))}
              </div>
            );
          })
        )}
      </div>
      <div className="border-t border-bz-line-soft bg-bz-paper-warm px-3 py-2">
        <p className="text-[10.5px] leading-[1.5] text-bz-text-muted">
          Only figures you are allowed to read are listed. Saved figures are the ones your team defined once and reuse.
        </p>
      </div>
    </Popover>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FILTER / FOCUS ROWS
//
// Two mechanisms that used to look identical. They now sit in separate blocks,
// carry different verbs, and each states in one line what it actually does.
// ════════════════════════════════════════════════════════════════════════════

/** constraints the engine accepts but cannot apply to a given figure */
const UNAPPLIED: Record<string, string[]> = {
  overdue: ["customer_group"],
  stock_value: ["branch"],
  gross_margin: ["branch"],
};
const isUnapplied = (figId: string, field: string) => (UNAPPLIED[figId] ?? []).includes(field);

function FilterRowEditor({
  row,
  fig,
  onChange,
  onRemove,
}: {
  row: FilterRow;
  fig: Figure;
  onChange: (patch: Partial<FilterRow>) => void;
  onRemove: () => void;
}) {
  const def = FIELDS[row.field];
  const ops = COMPARATORS[def.type];
  const op = ops.find((o) => o.id === row.op) ?? ops[0];
  const lookup = useValues(def.type === "choice" ? `field:${row.field}` : null, def.choices, def.slow);
  const ignored = isUnapplied(fig.id, row.field);

  return (
    <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/60 p-2.5">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-bz-text">{def.label}</p>
        <button
          onClick={onRemove}
          aria-label="Remove filter"
          className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"
        >
          <X size={11} />
        </button>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <SimplePicker
          value={op.id}
          options={ops.map((o) => ({ id: o.id, label: o.label }))}
          onChange={(id) => onChange({ op: id })}
          placeholder="Comparison"
        />
        {!op.none && (
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              {def.type === "choice" ? (
                <ValueChooser
                  lookup={lookup}
                  value={row.value}
                  onChange={(v) => onChange({ value: v })}
                  placeholder={`Choose a ${def.label.toLowerCase()}`}
                  whatFor={def.label.toLowerCase() + " values"}
                />
              ) : def.type === "yesno" ? (
                <SimplePicker
                  value={row.value || "Yes"}
                  options={[{ id: "Yes", label: "Yes" }, { id: "No", label: "No" }]}
                  onChange={(v) => onChange({ value: v })}
                  placeholder="Yes or no"
                />
              ) : (
                <MiniInput
                  value={row.value}
                  onChange={(v) => onChange({ value: v })}
                  type={def.type === "number" ? "number" : def.type === "date" ? "date" : "text"}
                  placeholder={def.type === "text" ? "Type a value" : undefined}
                />
              )}
            </div>
            {op.pair && (
              <div className="min-w-0 flex-1">
                <MiniInput
                  value={row.value2}
                  onChange={(v) => onChange({ value2: v })}
                  type={def.type === "number" ? "number" : "date"}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {ignored && (
        <div className="mt-2">
          <MoodNotice mood="narrowed" title="Will be ignored">
            {fig.label} is summarised before {def.label.toLowerCase()} is known, so this filter cannot be applied. The tile will
            answer for every {def.label.toLowerCase()}.
          </MoodNotice>
        </div>
      )}
    </div>
  );
}

function FocusRowEditor({
  row,
  fig,
  onChange,
  onRemove,
}: {
  row: FocusRow;
  fig: Figure;
  onChange: (patch: Partial<FocusRow>) => void;
  onRemove: () => void;
}) {
  const axis = AXES[row.axis];
  const lookup = useValues(`axis:${row.axis}`, axis.values, axis.slow);
  return (
    <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/60 p-2.5">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-bz-text">Only {axis.label.toLowerCase()}</p>
        <button
          onClick={onRemove}
          aria-label="Remove focus"
          className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"
        >
          <X size={11} />
        </button>
      </div>
      <div className="mt-2">
        <ValueChooser
          lookup={lookup}
          value={row.value}
          onChange={(v) => onChange({ value: v })}
          placeholder={`Choose a ${axis.label.toLowerCase()}`}
          whatFor={axis.label.toLowerCase() + " values"}
        />
      </div>
      {!fig.axes.includes(row.axis) && (
        <p className="mt-2 text-[11px] text-bz-text-muted">This figure no longer carries that breakdown.</p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// THE COMPOSER — the inspector that turns a question into a tile.
// Reads as a sentence; every block says what it does in one line.
// ════════════════════════════════════════════════════════════════════════════

function Composer({
  tile,
  sectionTitle,
  dispatch,
  adjust,
  promoted,
  onPromote,
  onToast,
}: {
  tile: Tile;
  sectionTitle: string;
  dispatch: React.Dispatch<Action>;
  adjust: Adjust;
  promoted: Set<string>;
  onPromote: (figId: string, name: string) => void;
  onToast: (msg: string) => void;
}) {
  const fig = figureOf(tile.figureId);
  const figRef = React.useRef<HTMLButtonElement>(null);
  const [figOpen, setFigOpen] = React.useState(!tile.figureId);
  const [promoting, setPromoting] = React.useState(false);
  const [promoteName, setPromoteName] = React.useState("");

  React.useEffect(() => {
    setFigOpen(false);
    setPromoting(false);
  }, [tile.id]);

  const patch = (p: Partial<Tile>, changes?: string[]) => dispatch({ t: "patchTile", id: tile.id, patch: p, changes });

  // ── unbound: the composer IS the chooser ──────────────────────────────────
  if (!fig) {
    return (
      <div className="flex flex-col">
        <div className="border-b border-bz-line-soft px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">New tile · {sectionTitle}</p>
          <p className="mt-2 text-[15px] font-semibold tracking-tight text-bz-text">What do you want to know?</p>
          <p className="mt-1.5 text-[11.5px] leading-[1.55] text-bz-text-muted">
            Pick the question. Everything after this — where the number comes from and how it is worked out — is decided for you
            and shown back so you can check it.
          </p>
          <div className="mt-3.5">
            <ChipTrigger
              ref={figRef}
              tone="hero"
              icon={Search}
              value={null}
              placeholder="Choose a question…"
              onClick={() => setFigOpen((o) => !o)}
            />
          </div>
          {tile.broken && (
            <div className="mt-3">
              <MoodNotice mood="refused" title="Binding lost">
                This tile pointed at a saved figure that has since been deleted. Choosing a question here repairs it.
              </MoodNotice>
            </div>
          )}
        </div>
        <FigurePicker
          open={figOpen}
          anchorRef={figRef}
          onClose={() => setFigOpen(false)}
          value={null}
          promoted={promoted}
          onPick={(id) => dispatch({ t: "setFigure", id: tile.id, figureId: id })}
        />
        <div className="px-4 py-4">
          <GhostButton danger icon={Trash2} onClick={() => dispatch({ t: "removeTile", id: tile.id })}>
            Remove this tile
          </GhostButton>
        </div>
      </div>
    );
  }

  const readings = READINGS.filter((r) => fig.readings.includes(r.id));
  const dateAxis = fig.axes.find((a) => AXES[a].kind === "date") ?? null;
  const flatAxes = fig.axes.filter((a) => AXES[a].kind !== "date");
  const showsBreakdown = tile.reading !== "number";
  const showsLimit = tile.reading !== "number";
  const isSaved = fig.saved || promoted.has(fig.id);

  function changeReading(next: ReadingId) {
    const changes: string[] = [];
    const p: Partial<Tile> = { reading: next };
    if (next === "number" && tile.breakdown) {
      changes.push(`One number can’t be split, so the breakdown by ${AXES[tile.breakdown].label} was dropped.`);
      p.breakdown = null;
    }
    if (next === "trend" && (!tile.breakdown || AXES[tile.breakdown].kind !== "date")) {
      if (dateAxis) {
        p.breakdown = dateAxis;
        changes.push(`Reading over time needs a period, so the breakdown is now ${AXES[dateAxis].label}.`);
      }
    }
    if ((next === "rank" || next === "split") && tile.breakdown && AXES[tile.breakdown].kind === "date" && flatAxes.length) {
      p.breakdown = flatAxes[0];
      changes.push(`A ${readingOf(next).label.toLowerCase()} needs something to compare, so it is now split by ${AXES[flatAxes[0]].label}.`);
    }
    patch(p, changes);
  }

  return (
    <div className="flex flex-col">
      {/* ── the question ─────────────────────────────────────────────────── */}
      <div className="border-b border-bz-line-soft px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Editing · {sectionTitle}</p>
        <p className="mt-2 mb-2.5 text-[11.5px] text-bz-text-muted">Show me…</p>
        <ChipTrigger
          ref={figRef}
          tone="hero"
          value={fig.question}
          placeholder="Choose a question…"
          onClick={() => setFigOpen((o) => !o)}
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[11px] text-bz-text-muted">Reads {fig.source}</span>
          {isSaved && (
            <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted">
              <Bookmark size={9} /> Reusable{fig.usedBy ? ` · used by ${fig.usedBy}` : ""}
            </span>
          )}
        </div>

        {adjust && (
          <div className="mt-3">
            <MoodNotice
              mood="adjusted"
              action={
                <>
                  <button
                    onClick={() => dispatch({ t: "undo" })}
                    className="inline-flex h-7 items-center gap-1.5 rounded-bz-sm border border-bz-text bg-bz-surface px-2 text-[11.5px] font-semibold text-bz-text"
                  >
                    <Undo2 size={11} /> Undo that
                  </button>
                  <button
                    onClick={() => dispatch({ t: "dismissAdjust" })}
                    className="inline-flex h-7 items-center rounded-bz-sm px-2 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-surface"
                  >
                    Keep it
                  </button>
                </>
              }
            >
              <ul className="flex flex-col gap-1">
                {adjust.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </MoodNotice>
          </div>
        )}

        {!isSaved && !promoting && (
          <button
            onClick={() => { setPromoting(true); setPromoteName(fig.label); }}
            className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"
          >
            <BookmarkPlus size={11} /> Save this figure for reuse
          </button>
        )}
        {promoting && (
          <div className="mt-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-2.5">
            <p className="text-[11.5px] leading-[1.5] text-bz-text-muted">
              Saving it makes this exact definition available to every board, under a name of your choosing.
            </p>
            <div className="mt-2 flex gap-2">
              <MiniInput value={promoteName} onChange={setPromoteName} placeholder="Name this figure" />
              <button
                onClick={() => {
                  onPromote(fig.id, promoteName.trim() || fig.label);
                  setPromoting(false);
                  onToast(`“${promoteName.trim() || fig.label}” is now a reusable figure.`);
                }}
                className="inline-flex h-8 shrink-0 items-center rounded-bz-md bg-bz-deep px-3 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
              >
                Save
              </button>
              <GhostButton onClick={() => setPromoting(false)}>Cancel</GhostButton>
            </div>
          </div>
        )}
      </div>

      <FigurePicker
        open={figOpen}
        anchorRef={figRef}
        onClose={() => setFigOpen(false)}
        value={fig.id}
        promoted={promoted}
        onPick={(id) => dispatch({ t: "setFigure", id: tile.id, figureId: id })}
      />

      {/* ── how it reads ─────────────────────────────────────────────────── */}
      <InspectorSection title="How it should read" icon={BarChart3}>
        <div className="grid grid-cols-2 gap-2">
          {readings.map((r) => {
            const active = r.id === tile.reading;
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => changeReading(r.id)}
                className={cn(
                  "flex flex-col gap-1.5 rounded-bz-md border px-2.5 py-2.5 text-left transition-colors",
                  active ? "border-bz-text bg-bz-fire/[0.18]" : "border-bz-line-soft bg-bz-surface hover:bg-bz-paper-warm",
                )}
              >
                <Icon size={13} className="text-bz-text-muted" />
                <span className="text-[12px] font-medium text-bz-text">{r.label}</span>
                <span className="text-[10.5px] leading-[1.4] text-bz-text-muted">{r.hint}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] leading-[1.5] text-bz-text-muted">
          Only the readings this figure can actually answer are listed — {fig.label.toLowerCase()} supports{" "}
          <span className="font-medium text-bz-text">{readings.length}</span> of the {READINGS.length}.
        </p>
      </InspectorSection>

      {/* ── breakdown ────────────────────────────────────────────────────── */}
      {showsBreakdown && (
        <InspectorSection title="Broken down by" icon={Layers}>
          {tile.reading === "trend" ? (
            <>
              <Labelled label="Period" hint="A trend is always read across time.">
                <div className="grid grid-cols-4 gap-1 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
                  {(["day", "week", "month", "quarter"] as const).map((gr) => (
                    <button
                      key={gr}
                      onClick={() => patch({ grain: gr, breakdown: dateAxis })}
                      className={cn(
                        "h-7 rounded-bz-sm text-[11.5px] font-medium capitalize transition-colors",
                        tile.grain === gr ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
                      )}
                    >
                      {gr}
                    </button>
                  ))}
                </div>
              </Labelled>
            </>
          ) : (
            <Labelled label="Split by" hint="One row or one segment for each value.">
              <SimplePicker
                value={tile.breakdown}
                options={flatAxes.map((a) => ({ id: a, label: AXES[a].label }))}
                onChange={(a) => patch({ breakdown: a })}
                placeholder="Nothing — one combined answer"
                icon={Layers}
              />
            </Labelled>
          )}
        </InspectorSection>
      )}

      {/* ── filters ──────────────────────────────────────────────────────── */}
      <InspectorSection
        title="Filters"
        icon={Filter}
        badge={
          tile.filters.length ? (
            <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text", NUM)}>
              {tile.filters.length}
            </span>
          ) : undefined
        }
      >
        <p className="text-[11.5px] leading-[1.55] text-bz-text-muted">
          <span className="font-semibold text-bz-text">Only count records where…</span> — this decides which records go into the
          figure at all.
        </p>
        {tile.filters.map((row) => (
          <FilterRowEditor
            key={row.id}
            row={row}
            fig={fig}
            onChange={(p) => patch({ filters: tile.filters.map((f) => (f.id === row.id ? { ...f, ...p } : f)) })}
            onRemove={() => patch({ filters: tile.filters.filter((f) => f.id !== row.id) })}
          />
        ))}
        <AddRowPicker
          label="Add a filter"
          options={fig.fields
            .filter((f) => !tile.filters.some((r) => r.field === f))
            .map((f) => ({ id: f, label: FIELDS[f].label }))}
          emptyLabel="Every field on this figure is already filtered."
          onPick={(field) =>
            patch({
              filters: [
                ...tile.filters,
                { id: nid("f"), field, op: COMPARATORS[FIELDS[field].type][0].id, value: "", value2: "" },
              ],
            })
          }
        />
      </InspectorSection>

      {/* ── focus ────────────────────────────────────────────────────────── */}
      {tile.reading !== "table" && (
        <InspectorSection
          title="Focus"
          icon={Crosshair}
          defaultOpen={tile.focus.length > 0}
          badge={
            tile.focus.length ? (
              <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-bz-text", NUM)}>
                {tile.focus.length}
              </span>
            ) : undefined
          }
        >
          <p className="text-[11.5px] leading-[1.55] text-bz-text-muted">
            <span className="font-semibold text-bz-text">Narrow the answer to one…</span> — the figure is still worked out across
            everything, then this picks one slice of the result to show.
          </p>
          {tile.focus.map((row) => (
            <FocusRowEditor
              key={row.id}
              row={row}
              fig={fig}
              onChange={(p) => patch({ focus: tile.focus.map((f) => (f.id === row.id ? { ...f, ...p } : f)) })}
              onRemove={() => patch({ focus: tile.focus.filter((f) => f.id !== row.id) })}
            />
          ))}
          <AddRowPicker
            label="Add a focus"
            options={flatAxes.filter((a) => !tile.focus.some((r) => r.axis === a)).map((a) => ({ id: a, label: AXES[a].label }))}
            emptyLabel="This figure has no further breakdowns to focus on."
            onPick={(axis) => patch({ focus: [...tile.focus, { id: nid("k"), axis, value: "" }] })}
          />
        </InspectorSection>
      )}

      {/* ── date range ───────────────────────────────────────────────────── */}
      <InspectorSection title="Date range" icon={CalendarRange}>
        <SimplePicker
          value={tile.scope}
          options={SCOPES.map((s) => ({ id: s.id, label: s.label, hint: s.explain }))}
          onChange={(s) => patch({ scope: s })}
          placeholder="Choose a range"
          icon={CalendarRange}
          width={320}
        />
        <p className="text-[11.5px] leading-[1.55] text-bz-text-muted">{scopeOf(tile.scope).explain}</p>
      </InspectorSection>

      {/* ── appearance ───────────────────────────────────────────────────── */}
      <InspectorSection title="Appearance" icon={Pencil} defaultOpen={false}>
        <Labelled label="Title" hint={`Left blank, the tile is called “${fig.label}”.`}>
          <MiniInput value={tile.title} onChange={(v) => patch({ title: v })} placeholder={fig.label} />
        </Labelled>

        <Labelled
          label="Size on the board"
          hint="Point at the bottom-right corner of the space you want. On phones every tile is full width and as tall as it needs to be, whatever you choose here."
        >
          <SizePicker width={tile.width} height={tile.height} onChange={(w, h) => patch({ width: w, height: h })} />
        </Labelled>

        {showsLimit && (
          <Labelled
            label="How many entries"
            hint={
              tile.reading === "trend"
                ? "On a time reading this keeps the most recent periods, not the largest."
                : "Keeps the highest values and drops the rest."
            }
          >
            <MiniInput
              type="number"
              value={String(tile.limit)}
              onChange={(v) => patch({ limit: Math.max(2, Math.min(25, Number(v) || 2)) })}
            />
          </Labelled>
        )}

        <Labelled label="Number format">
          <SimplePicker
            value={tile.format}
            options={[
              { id: "auto" as const, label: "Automatic", hint: `Formatted the way ${fig.label.toLowerCase()} is normally read.` },
              { id: "compact" as const, label: "Shortened", hint: "1.2M instead of 1,240,000." },
              { id: "plain" as const, label: "Plain number", hint: "No unit, no shortening." },
            ]}
            onChange={(f) => patch({ format: f })}
            placeholder="Automatic"
            width={300}
          />
        </Labelled>

        {fig.unit === "money" && tile.format !== "plain" && (
          <Labelled label="Currency">
            <SimplePicker
              value={tile.currency}
              options={[
                { id: "NPR" as const, label: "NPR · Nepalese rupee" },
                { id: "USD" as const, label: "USD · US dollar" },
                { id: "INR" as const, label: "INR · Indian rupee" },
              ]}
              onChange={(c) => patch({ currency: c })}
              placeholder="Choose a currency"
            />
          </Labelled>
        )}
      </InspectorSection>

      <div className="flex gap-2 px-4 py-4">
        <GhostButton icon={Copy} onClick={() => dispatch({ t: "dupTile", id: tile.id })}>
          Duplicate
        </GhostButton>
        <GhostButton danger icon={Trash2} onClick={() => dispatch({ t: "removeTile", id: tile.id })}>
          Remove
        </GhostButton>
      </div>
    </div>
  );
}

function AddRowPicker({
  label,
  options,
  emptyLabel,
  onPick,
}: {
  label: string;
  options: { id: string; label: string }[];
  emptyLabel: string;
  onPick: (id: string) => void;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  if (!options.length) return <p className="text-[11px] text-bz-text-soft">{emptyLabel}</p>;
  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 items-center gap-1.5 self-start rounded-bz-md border border-dashed border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
      >
        <Plus size={12} /> {label}
      </button>
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)} width={240}>
        <div className="max-h-64 overflow-y-auto py-1">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => { onPick(o.id); setOpen(false); }}
              className="flex w-full items-center px-3 py-1.5 text-left text-[12px] text-bz-text hover:bg-bz-paper-warm"
            >
              {o.label}
            </button>
          ))}
        </div>
      </Popover>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BOARD PANEL — what the inspector shows when nothing is selected
// ════════════════════════════════════════════════════════════════════════════

function FeedbackKey() {
  const rows: { mood: MoodKind; what: string }[] = [
    { mood: "refused", what: "The server would not answer. The tile shows why instead of a figure." },
    { mood: "narrowed", what: "A real answer arrived, but something you asked for was clamped or skipped." },
    { mood: "adjusted", what: "The studio rewrote one of your choices because an earlier one made it impossible. Always undoable." },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => {
        const m = MOOD_META[r.mood];
        const Icon = m.icon;
        return (
          <div key={r.mood} className="flex gap-2.5">
            <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-bz-sm border", m.wrap)}>
              <Icon size={10} className={m.iconClass} />
            </span>
            <span className="min-w-0">
              <span className="block text-[11.5px] font-semibold text-bz-text">{m.title}</span>
              <span className="mt-0.5 block text-[11px] leading-[1.5] text-bz-text-muted">{r.what}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BoardPanel({
  board,
  locked,
  dispatch,
  onSelect,
}: {
  board: Board;
  locked: boolean;
  dispatch: React.Dispatch<Action>;
  onSelect: (id: string) => void;
}) {
  const tiles = allTiles(board);
  const bound = tiles.filter((t) => t.figureId && !t.broken);
  const unresolved = tiles.filter((t) => t.broken);
  const empty = tiles.filter((t) => !t.figureId && !t.broken);
  const figuresUsed = new Set(bound.map((t) => t.figureId)).size;

  const Row = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-baseline justify-between border-b border-bz-line-soft py-1.5 last:border-b-0">
      <span className="text-[11.5px] text-bz-text-muted">{label}</span>
      <span className={cn("text-[12.5px] font-semibold text-bz-text", NUM)}>{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="border-b border-bz-line-soft px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">This board</p>
        <p className="mt-2 text-[11.5px] leading-[1.55] text-bz-text-muted">
          Select any tile to edit it. Only one tile is editable at a time — that is deliberate.
        </p>
        <div className="mt-3">
          <Row label="Sections" value={board.sections.length} />
          <Row label="Tiles" value={tiles.length} />
          <Row label="Distinct figures" value={figuresUsed} />
          <Row label="Empty tiles" value={empty.length} />
        </div>
        {!locked && (
          <button
            onClick={() => dispatch({ t: "addTile", sectionId: board.sections[0]?.id ?? "" })}
            disabled={!board.sections.length}
            className="mt-3.5 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-3 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50"
          >
            <Plus size={12} /> Add a tile
          </button>
        )}
      </div>

      {unresolved.length > 0 && (
        <div className="border-b border-bz-line-soft px-4 py-4">
          <MoodNotice
            mood="refused"
            title="Unresolved binding"
            action={
              <button
                onClick={() => onSelect(unresolved[0].id)}
                className="inline-flex h-7 items-center gap-1.5 rounded-bz-sm border border-[#C0413A]/40 bg-bz-surface px-2 text-[11.5px] font-semibold text-[#9A2E29]"
              >
                Fix “{tileTitle(unresolved[0], null)}”
              </button>
            }
          >
            {unresolved.length === 1 ? "One tile points" : `${unresolved.length} tiles point`} at a figure that no longer exists.
            The board cannot be published until{" "}
            {unresolved.length === 1 ? "it is repaired or removed" : "they are repaired or removed"}.
          </MoodNotice>
        </div>
      )}

      <InspectorSection title="What the colours mean" icon={Info} defaultOpen>
        <FeedbackKey />
      </InspectorSection>

      <InspectorSection title="Reusable figures" icon={Bookmark} defaultOpen={false}>
        <p className="text-[11.5px] leading-[1.55] text-bz-text-muted">
          A figure becomes reusable from the tile that first asked for it — open a tile and choose “Save this figure for reuse”.
          There is one place they live.
        </p>
        <Link
          to="/design/dashboards"
          className="inline-flex h-8 items-center gap-1.5 self-start rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
        >
          <Bookmark size={12} /> Open saved figures
        </Link>
      </InspectorSection>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DIALOGS + TOAST
// ════════════════════════════════════════════════════════════════════════════

export function Modal({ onClose, children, width = 460 }: { onClose: () => void; children: React.ReactNode; width?: number }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-bz-olive-dark/45 px-4 py-8">
      <div
        style={{ maxWidth: width }}
        className="max-h-full w-full overflow-y-auto rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_28px_70px_-28px_rgba(15,20,17,0.4)]"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export type ConfirmSpec = {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
};

export function ConfirmDialog({ spec, onClose }: { spec: ConfirmSpec; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="px-5 py-4">
        <p className="text-[14.5px] font-semibold tracking-tight text-bz-text">{spec.title}</p>
        <div className="mt-2 text-[12.5px] leading-[1.6] text-bz-text-muted">{spec.body}</div>
      </div>
      <div className="flex justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <button
          onClick={() => { spec.onConfirm(); onClose(); }}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-bz-md px-3.5 text-[12px] font-semibold",
            spec.danger ? "bg-[#9A2E29] text-white hover:opacity-95" : "bg-bz-deep text-bz-text-on-dark hover:opacity-95",
          )}
        >
          {spec.confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Toast({ text, onDismiss }: { text: string | null; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!text) return;
    const t = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(t);
  }, [text, onDismiss]);
  if (!text) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[76px] z-[75] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className="flex size-7 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22]">
          <Check size={13} className="text-bz-leaf-deep" />
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{text}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

function VersionDrawer({
  board,
  dirty,
  onClose,
  onRestore,
}: {
  board: Board;
  dirty: boolean;
  onClose: () => void;
  onRestore: (n: number) => void;
}) {
  const versions = VERSIONS[board.id] ?? [];
  return (
    <Modal onClose={onClose} width={520}>
      <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-4">
        <div>
          <p className="text-[14.5px] font-semibold tracking-tight text-bz-text">Published versions</p>
          <p className="mt-1 text-[11.5px] text-bz-text-muted">
            Restoring brings back that version's tiles as well as its arrangement. Anything you have added since is kept alongside.
          </p>
        </div>
        <button onClick={onClose} aria-label="Close" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={13} />
        </button>
      </div>
      {dirty && (
        <div className="px-5 pt-4">
          <MoodNotice mood="narrowed" title="Uncommitted work">
            You have changes that have not been published. Restoring replaces them on the canvas — one undo brings them back.
          </MoodNotice>
        </div>
      )}
      <div className="px-5 py-4">
        {!versions.length ? (
          <div className="flex flex-col items-center gap-1.5 py-8 text-center">
            <History size={18} className="text-bz-text-soft" />
            <p className="text-[12.5px] font-medium text-bz-text">This board has never been published.</p>
            <p className="text-[11.5px] text-bz-text-muted">Publish it once and every later change gets its own entry here.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {versions.map((v) => (
              <div key={v.n} className="flex items-start gap-3 border-b border-bz-line-soft py-3 last:border-b-0">
                <span className={cn("mt-0.5 w-8 shrink-0 text-[12px] font-semibold text-bz-text", NUM)}>v{v.n}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] text-bz-text">{v.note}</p>
                  <p className="mt-1 text-[11px] text-bz-text-muted">
                    {v.when} · {v.who}
                  </p>
                </div>
                {v.n === board.version ? (
                  <span className="mt-0.5 shrink-0 rounded-bz-sm bg-bz-fire/[0.18] px-2 py-0.5 text-[10.5px] font-semibold text-bz-text">
                    Current
                  </span>
                ) : (
                  <GhostButton onClick={() => { onRestore(v.n); onClose(); }}>Restore</GhostButton>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER — identity (renames on its own), board switcher, mode, history
// ════════════════════════════════════════════════════════════════════════════

function BoardSwitcher({ current, onPick }: { current: Board; onPick: (id: string) => void }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        ref={ref}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 max-w-full items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
      >
        <Layers size={12} className="shrink-0 text-bz-text-muted" />
        <span className="truncate">Switch board</span>
        <ChevronDown size={12} className="shrink-0 text-bz-text-soft" />
      </button>
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)} align="end" width={280}>
        <div className="py-1">
          {BOARDS.map((b) => (
            <button
              key={b.id}
              onClick={() => { onPick(b.id); setOpen(false); }}
              className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm"
            >
              <Check size={12} className={cn("mt-0.5 shrink-0", b.id === current.id ? "text-bz-leaf-deep" : "opacity-0")} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-bz-text">{b.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-bz-text-muted">
                  {b.locked && <Lock size={9} />}
                  {b.locked ? "Provided · read-only" : allTiles(b).length ? `${allTiles(b).length} tiles` : "Empty"}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Popover>
    </>
  );
}

function FeedbackKeyButton() {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        ref={ref}
        onClick={() => setOpen((o) => !o)}
        title="What the colours mean"
        aria-label="What the colours mean"
        className="inline-flex size-8 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text hover:bg-bz-paper-warm"
      >
        <Info size={12} />
      </button>
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)} align="end" width={310}>
        <div className="px-3.5 py-3.5">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Three kinds of feedback</p>
          <FeedbackKey />
        </div>
      </Popover>
    </>
  );
}

function StudioHeader({
  board,
  locked,
  mode,
  setMode,
  dirty,
  canUndo,
  canRedo,
  dispatch,
  onSwitch,
  onVersions,
  onAddTile,
  onLeave,
  nameDraft,
  setNameDraft,
  nameStatus,
  commitName,
}: {
  board: Board;
  locked: boolean;
  mode: "edit" | "read";
  setMode: (m: "edit" | "read") => void;
  dirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  dispatch: React.Dispatch<Action>;
  onSwitch: (id: string) => void;
  onVersions: () => void;
  onAddTile: () => void;
  onLeave: () => void;
  nameDraft: string;
  setNameDraft: (v: string) => void;
  nameStatus: "idle" | "saving" | "saved";
  commitName: () => void;
}) {
  const tiles = allTiles(board);
  return (
    <div className="border-b border-bz-line bg-bz-paper">
      <div className="px-4 pt-4 md:px-6">
        <button onClick={onLeave} className="inline-flex items-center gap-1 text-[11.5px] text-bz-text-muted hover:text-bz-text">
          <ChevronDown size={12} className="rotate-90" /> All dashboards
        </button>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {locked ? (
                <h1 className="truncate text-[23px] font-semibold tracking-tight text-bz-text">{board.name}</h1>
              ) : (
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  aria-label="Board name"
                  className="w-full min-w-0 max-w-[520px] rounded-bz-sm border border-transparent bg-transparent px-1 py-0.5 text-[23px] font-semibold tracking-tight text-bz-text hover:border-bz-line-soft focus:border-bz-line focus:bg-bz-surface focus:outline-none"
                />
              )}
              {nameStatus === "saving" && <Loader2 size={13} className="shrink-0 animate-spin text-bz-text-soft" />}
              {nameStatus === "saved" && (
                <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-bz-text-muted">
                  <Check size={11} className="text-bz-leaf-deep" /> Name saved
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 px-1 text-[11.5px] text-bz-text-muted">
              <span className={NUM}>
                {tiles.length} {tiles.length === 1 ? "tile" : "tiles"}
              </span>
              <span className="text-bz-text-soft">·</span>
              <span className={NUM}>
                {board.sections.length} {board.sections.length === 1 ? "section" : "sections"}
              </span>
              <span className="text-bz-text-soft">·</span>
              <span>{board.version ? `Published v${board.version}` : "Never published"}</span>
              {locked && (
                <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-semibold text-bz-text">
                  <Lock size={9} /> Provided
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <BoardSwitcher current={board} onPick={onSwitch} />
            {!locked && (
              <button
                onClick={onAddTile}
                className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
              >
                <Plus size={12} /> Add a tile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-bz-line-soft px-4 py-2.5 md:px-6">
        <div className="flex rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
          {(["edit", "read"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-bz-sm px-2.5 text-[12px] font-medium transition-colors",
                mode === m ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
              )}
            >
              {m === "edit" ? <Pencil size={11} /> : <Eye size={11} />}
              {m === "edit" ? "Assemble" : "Read it"}
            </button>
          ))}
        </div>

        {mode === "edit" && !locked && (
          <>
            <span className="mx-0.5 h-5 w-px bg-bz-line-soft" />
            <GhostButton icon={Undo2} title="Undo" disabled={!canUndo} onClick={() => dispatch({ t: "undo" })} />
            <GhostButton icon={Redo2} title="Redo" disabled={!canRedo} onClick={() => dispatch({ t: "redo" })} />
            <GhostButton icon={Plus} onClick={() => dispatch({ t: "addSection" })}>
              Section
            </GhostButton>
          </>
        )}

        <span className="mx-0.5 h-5 w-px bg-bz-line-soft" />
        <GhostButton icon={History} onClick={onVersions}>
          Versions
        </GhostButton>
        <FeedbackKeyButton />

        {dirty && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
            <span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Unsaved changes
          </span>
        )}
      </div>

      {locked && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-bz-line-soft bg-bz-paper-warm px-4 py-3 md:px-6">
          <Lock size={13} className="shrink-0 text-bz-text-muted" />
          <p className="min-w-0 flex-1 text-[12px] leading-[1.55] text-bz-text">
            <span className="font-semibold">This board came from your provider and is read-only.</span> Nothing here can be
            changed or published. Take an editable copy if you want to rearrange it.
          </p>
          <GhostButton icon={Copy}>Make an editable copy</GhostButton>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CANVAS
// ════════════════════════════════════════════════════════════════════════════

function SectionHeader({
  section,
  locked,
  dispatch,
  onRemove,
}: {
  section: Section;
  locked: boolean;
  dispatch: React.Dispatch<Action>;
  onRemove: () => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {locked ? (
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-bz-text">{section.title}</h2>
      ) : (
        <input
          value={section.title}
          onChange={(e) => dispatch({ t: "renameSection", id: section.id, title: e.target.value })}
          aria-label="Section title"
          className="min-w-0 max-w-[280px] flex-1 rounded-bz-sm border border-transparent bg-transparent px-1 py-0.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-bz-text hover:border-bz-line-soft focus:border-bz-line focus:bg-bz-surface focus:outline-none sm:flex-none"
        />
      )}
      <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-semibold text-bz-text-muted", NUM)}>
        {section.tiles.length}
      </span>
      {!locked && (
        <div className="ml-auto flex items-center gap-2">
          <GhostButton icon={Plus} onClick={() => dispatch({ t: "addTile", sectionId: section.id })}>
            Add tile
          </GhostButton>
          <GhostButton icon={Trash2} title="Remove section" danger onClick={onRemove} />
        </div>
      )}
    </div>
  );
}

function Canvas({
  board,
  locked,
  selected,
  dispatch,
  onSelect,
  onRemoveSection,
}: {
  board: Board;
  locked: boolean;
  selected: string | null;
  dispatch: React.Dispatch<Action>;
  onSelect: (id: string) => void;
  onRemoveSection: (s: Section) => void;
}) {
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  if (!allTiles(board).length && board.sections.length <= 1) {
    return (
      <div className="rounded-bz-lg border border-dashed border-bz-line bg-bz-surface px-6 py-14 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-bz-pill bg-bz-paper-warm">
          <Inbox size={18} className="text-bz-text-soft" />
        </span>
        <p className="mt-3.5 text-[15px] font-semibold tracking-tight text-bz-text">Nothing on this board yet</p>
        <p className="mx-auto mt-1.5 max-w-[380px] text-[12.5px] leading-[1.6] text-bz-text-muted">
          Start with a question you actually ask — “how much did we invoice last month”, “which items are sitting in stock”. The
          studio works out where the number comes from.
        </p>
        {!locked && (
          <button
            onClick={() => dispatch({ t: "addTile", sectionId: board.sections[0]?.id ?? "" })}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95"
          >
            <Plus size={13} /> Add the first tile
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {board.sections.map((section) => (
        <section key={section.id}>
          <SectionHeader section={section} locked={locked} dispatch={dispatch} onRemove={() => onRemoveSection(section)} />
          {section.tiles.length ? (
            <div className={cn("grid grid-cols-12 gap-3.5", ROW_MIN)}>
              {section.tiles.map((tile, index) => (
                <TileCard
                  key={tile.id}
                  tile={tile}
                  mode="edit"
                  locked={locked}
                  selected={selected === tile.id}
                  sections={board.sections}
                  sectionId={section.id}
                  onSelect={() => onSelect(tile.id)}
                  dispatch={dispatch}
                  dropTarget={overId === tile.id && dragId !== tile.id}
                  dragHandlers={
                    locked
                      ? undefined
                      : {
                          draggable: true,
                          onDragStart: () => setDragId(tile.id),
                          onDragEnd: () => { setDragId(null); setOverId(null); },
                          onDragOver: (e) => { e.preventDefault(); if (dragId) setOverId(tile.id); },
                          onDragLeave: () => setOverId((o) => (o === tile.id ? null : o)),
                          onDrop: (e) => {
                            e.preventDefault();
                            if (dragId && dragId !== tile.id) {
                              dispatch({ t: "moveTile", id: dragId, toSection: section.id, toIndex: index });
                            }
                            setDragId(null);
                            setOverId(null);
                          },
                        }
                  }
                />
              ))}
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) dispatch({ t: "moveTile", id: dragId, toSection: section.id, toIndex: 0 });
                setDragId(null);
              }}
              className="rounded-bz-lg border border-dashed border-bz-line bg-bz-surface px-5 py-9 text-center"
            >
              <p className="text-[12.5px] font-medium text-bz-text">This section is empty.</p>
              <p className="mt-1 text-[11.5px] text-bz-text-muted">Add a tile, or drag one in from another section.</p>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function CanvasSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[0, 1].map((s) => (
        <div key={s}>
          <div className="mb-3 h-3.5 w-32 rounded-bz-sm bg-bz-line-soft" />
          <div className="grid grid-cols-12 gap-3.5">
            {([3, 3, 3, 3, 6, 6] as Width[]).map((w, i) => (
              <div key={i} className={cn(SPAN[w], "h-[168px] rounded-bz-lg border border-bz-line-soft bg-bz-surface")}>
                <div className="flex h-full flex-col gap-3 p-4">
                  <div className="h-3 w-2/3 rounded-bz-sm bg-bz-line-soft" />
                  <div className="h-2 w-1/3 rounded-bz-sm bg-bz-border-soft" />
                  <div className="mt-auto h-6 w-1/2 rounded-bz-sm bg-bz-line-soft" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// READING SURFACE — the same tiles, scoped while reading. No edit affordance
// here by design; assembly is reached from the dashboard library.
// ════════════════════════════════════════════════════════════════════════════

const RANGES: { id: string; label: string }[] = [
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "this_quarter", label: "This quarter" },
  { id: "this_year", label: "This fiscal year" },
  { id: "last_12", label: "Last 12 months" },
  { id: "custom", label: "Sep 1 – Sep 4, 2026" },
];

const BRANCHES: { id: string; label: string; allowed: boolean }[] = [
  { id: "all", label: "All branches I can see", allowed: true },
  { id: "ktm", label: "Kathmandu", allowed: true },
  { id: "pkr", label: "Pokhara", allowed: true },
  { id: "brt", label: "Biratnagar", allowed: true },
  { id: "btw", label: "Butwal", allowed: false },
];

function ReadingView({
  board,
  dispatch,
  onExpand,
}: {
  board: Board;
  dispatch: React.Dispatch<Action>;
  onExpand: (t: Tile) => void;
}) {
  const [range, setRange] = React.useState("this_month");
  const [branch, setBranch] = React.useState("all");
  const [refreshing, setRefreshing] = React.useState(false);

  const asked = BRANCHES.find((b) => b.id === branch)!;
  const effective = asked.allowed ? asked : BRANCHES[0];
  const rangeLabel = RANGES.find((r) => r.id === range)!.label.toLowerCase();

  const refreshAll = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <>
      <div className="border-b border-bz-line bg-bz-paper px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-[200px]">
            <SimplePicker
              value={range}
              options={RANGES.map((r) => ({ id: r.id, label: r.label }))}
              onChange={setRange}
              placeholder="Date range"
              icon={CalendarRange}
            />
          </div>
          <div className="w-full sm:w-[220px]">
            <SimplePicker
              value={branch}
              options={BRANCHES.map((b) => ({ id: b.id, label: b.label, hint: b.allowed ? undefined : "Not in your access" }))}
              onChange={setBranch}
              placeholder="Branch"
              icon={Building2}
            />
          </div>
          <GhostButton icon={RefreshCw} onClick={refreshAll}>
            Refresh all
          </GhostButton>
        </div>
        <p className="mt-2.5 text-[12px] leading-[1.55] text-bz-text-muted">
          You are looking at <span className="font-semibold text-bz-text">{board.name}</span> for{" "}
          <span className="font-semibold text-bz-text">{rangeLabel}</span>, covering{" "}
          <span className="font-semibold text-bz-text">{effective.label.toLowerCase()}</span>.
          {!asked.allowed && ` ${asked.label} is not in your access, so your own branches are shown instead.`}
        </p>
      </div>

      <div className="px-4 py-6 md:px-6">
        {!allTiles(board).length ? (
          <div className="rounded-bz-lg border border-dashed border-bz-line bg-bz-surface px-6 py-14 text-center">
            <p className="text-[15px] font-semibold tracking-tight text-bz-text">There is nothing on this board yet</p>
            <p className="mx-auto mt-1.5 max-w-[360px] text-[12.5px] leading-[1.6] text-bz-text-muted">
              Switch to Assemble and add the first question you want answered.
            </p>
          </div>
        ) : (
          <div className={cn("flex flex-col gap-8 transition-opacity", refreshing && "pointer-events-none opacity-55")}>
            {board.sections.map((section) => (
              <section key={section.id}>
                <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-bz-text">{section.title}</h2>
                <div className={cn("grid grid-cols-12 gap-3.5", ROW_MIN)}>
                  {section.tiles.map((tile) => (
                    <TileCard
                      key={tile.id}
                      tile={tile}
                      mode="read"
                      locked
                      selected={false}
                      sections={board.sections}
                      sectionId={section.id}
                      onSelect={() => {}}
                      dispatch={dispatch}
                      onExpand={() => onExpand(tile)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMMIT FOOTER — nothing is autosaved, so leaving is the destructive act and
// the footer says so out loud.
// ════════════════════════════════════════════════════════════════════════════

function CommitFooter({
  locked,
  dirty,
  saving,
  unresolved,
  version,
  onPublish,
  onDiscard,
}: {
  locked: boolean;
  dirty: boolean;
  saving: boolean;
  unresolved: number;
  version: number;
  onPublish: () => void;
  onDiscard: () => void;
}) {
  const blocked = unresolved > 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <p className="flex min-w-0 items-center gap-2 text-[11.5px] text-bz-text-muted">
        {locked ? (
          <>
            <Lock size={12} className="shrink-0 text-bz-text-soft" />
            <span className="truncate">Read-only — this board is published and maintained by your provider.</span>
          </>
        ) : saving ? (
          <>
            <Loader2 size={12} className="shrink-0 animate-spin text-bz-fire" />
            Publishing the board…
          </>
        ) : blocked ? (
          <>
            <Ban size={12} className="shrink-0 text-[#C0413A]" />
            <span className="truncate">
              <span className="font-semibold text-[#9A2E29]">Can’t publish · </span>
              <span className={NUM}>{unresolved}</span> {unresolved === 1 ? "tile points" : "tiles point"} at a figure that no
              longer exists.
            </span>
          </>
        ) : dirty ? (
          <>
            <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />
            <span className="truncate">Unsaved changes — nothing is stored until you publish. Leaving discards them.</span>
          </>
        ) : (
          <>
            <ShieldCheck size={12} className="shrink-0 text-bz-leaf-deep" />
            <span className="truncate">
              {version ? `Everything published · version ${version}.` : "Never published — add a tile and publish when it's ready."}
            </span>
          </>
        )}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <GhostButton onClick={onDiscard} disabled={locked || !dirty || saving}>
          Discard changes
        </GhostButton>
        <button
          onClick={onPublish}
          disabled={locked || !dirty || saving || blocked}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-45"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Publish changes
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

const cloneBoard = (b: Board): Board => ({
  ...b,
  sections: b.sections.map((s) => ({
    ...s,
    tiles: s.tiles.map((t) => ({ ...t, filters: t.filters.map((f) => ({ ...f })), focus: t.focus.map((f) => ({ ...f })) })),
  })),
});

export function DashboardStudioDesignPage() {
  const navigate = useNavigate();
  const [state, dispatch] = React.useReducer(reducer, null, (): State => ({
    board: cloneBoard(BOARD_OPS),
    past: [],
    future: [],
    dirty: false,
    selected: null,
    adjust: null,
  }));

  const [mode, setMode] = React.useState<"edit" | "read">("edit");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<ConfirmSpec | null>(null);
  const [versionsOpen, setVersionsOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Tile | null>(null);
  const [promoted, setPromoted] = React.useState<Set<string>>(() => new Set());

  const [nameDraft, setNameDraft] = React.useState(state.board.name);
  const [nameStatus, setNameStatus] = React.useState<"idle" | "saving" | "saved">("idle");

  const inspectorRef = React.useRef<HTMLDivElement>(null);

  const { board, selected, dirty, adjust } = state;
  const locked = board.locked;
  const tiles = allTiles(board);
  const unresolved = React.useMemo(() => tiles.filter((t) => t.broken).length, [tiles]);

  const selectedTile = selected ? findTile(board, selected) : null;
  const selectedSection = selected ? board.sections.find((s) => s.tiles.some((t) => t.id === selected)) ?? null : null;

  // ── board identity: renames on its own, independent of the board's own save
  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(board.name);
      return;
    }
    if (trimmed === board.name) return;
    dispatch({ t: "rename", name: trimmed });
    setNameStatus("saving");
    window.setTimeout(() => {
      setNameStatus("saved");
      window.setTimeout(() => setNameStatus("idle"), 2200);
    }, 650);
  };

  const loadBoard = React.useCallback((id: string) => {
    const next = BOARDS.find((b) => b.id === id);
    if (!next) return;
    setLoading(true);
    window.setTimeout(() => {
      dispatch({ t: "load", board: cloneBoard(next) });
      setNameDraft(next.name);
      setNameStatus("idle");
      setLoading(false);
    }, 620);
  }, []);

  const switchBoard = (id: string) => {
    if (id === board.id) return;
    if (dirty) {
      setConfirm({
        title: "Leave without publishing?",
        body: (
          <>
            This board has changes that were never published. Opening another board throws them away — there is no autosave and
            no draft.
          </>
        ),
        confirmLabel: "Discard and switch",
        danger: true,
        onConfirm: () => loadBoard(id),
      });
      return;
    }
    loadBoard(id);
  };

  const leave = () => {
    if (dirty) {
      setConfirm({
        title: "Leave without publishing?",
        body: <>Your changes are held here only. Leaving this screen discards every one of them.</>,
        confirmLabel: "Discard and leave",
        danger: true,
        onConfirm: () => navigate("/design/dashboards"),
      });
      return;
    }
    navigate("/design/dashboards");
  };

  const publish = () => {
    if (locked || !dirty || unresolved) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      dispatch({ t: "saved" });
      setToast(`“${board.name}” published · ${tiles.length} tiles`);
    }, 950);
  };

  const discard = () => {
    setConfirm({
      title: "Discard every change?",
      body: <>The board goes back to the last published version. This cannot be undone once confirmed.</>,
      confirmLabel: "Discard changes",
      danger: true,
      onConfirm: () => {
        loadBoard(board.id);
        setToast("Reverted to the last published version.");
      },
    });
  };

  const removeSection = (section: Section) => {
    const n = section.tiles.filter((t) => t.figureId).length;
    setConfirm({
      title: `Remove “${section.title}”?`,
      body: (
        <>
          {n ? (
            <>
              <span className={cn("font-semibold text-bz-text", NUM)}>{n}</span> configured{" "}
              {n === 1 ? "tile goes" : "tiles go"} with it, along with everything you set up on{" "}
              {n === 1 ? "it" : "them"}. One undo brings the whole section back.
            </>
          ) : (
            <>This section has no tiles in it. One undo brings it back.</>
          )}
        </>
      ),
      confirmLabel: "Remove section",
      danger: true,
      onConfirm: () => dispatch({ t: "removeSection", id: section.id }),
    });
  };

  const addTileToFirstSection = () => {
    const target = board.sections[board.sections.length - 1] ?? board.sections[0];
    if (target) dispatch({ t: "addTile", sectionId: target.id });
  };

  const select = (id: string) => {
    dispatch({ t: "select", id });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.setTimeout(() => inspectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  };

  // Cmd/Ctrl+Z / Shift+Z, Cmd/Ctrl+S
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z") {
        e.preventDefault();
        dispatch({ t: e.shiftKey ? "redo" : "undo" });
      } else if (k === "s") {
        e.preventDefault();
        publish();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Dashboards</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Studio</span>
        </>
      }
      overlay={
        <>
          {mode === "edit" && (
            <CommitFooter
              locked={locked}
              dirty={dirty}
              saving={saving}
              unresolved={unresolved}
              version={board.version}
              onPublish={publish}
              onDiscard={discard}
            />
          )}
          <Toast text={toast} onDismiss={() => setToast(null)} />
          {confirm && <ConfirmDialog spec={confirm} onClose={() => setConfirm(null)} />}
          {versionsOpen && (
            <VersionDrawer
              board={board}
              dirty={dirty}
              onClose={() => setVersionsOpen(false)}
              onRestore={(n) => {
                dispatch({ t: "restore", version: n });
                setToast(`Version ${n} restored — undo once to change your mind.`);
              }}
            />
          )}
          {expanded && (
            <Modal onClose={() => setExpanded(null)} width={760}>
              <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft px-4 py-3">
                <p className="truncate text-[13px] font-semibold text-bz-text">
                  {tileTitle(expanded, figureOf(expanded.figureId))}
                </p>
                <button
                  onClick={() => setExpanded(null)}
                  aria-label="Close"
                  className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="grid grid-cols-12 p-4">
                <TileCard
                  tile={{ ...expanded, width: 12, height: 1 }}
                  mode="read"
                  locked
                  selected={false}
                  sections={board.sections}
                  sectionId=""
                  onSelect={() => {}}
                  dispatch={dispatch}
                />
              </div>
            </Modal>
          )}
        </>
      }
    >
      <StudioHeader
        board={board}
        locked={locked}
        mode={mode}
        setMode={setMode}
        dirty={dirty}
        canUndo={state.past.length > 0}
        canRedo={state.future.length > 0}
        dispatch={dispatch}
        onSwitch={switchBoard}
        onVersions={() => setVersionsOpen(true)}
        onAddTile={addTileToFirstSection}
        onLeave={leave}
        nameDraft={nameDraft}
        setNameDraft={setNameDraft}
        nameStatus={nameStatus}
        commitName={commitName}
      />

      {mode === "read" ? (
        <ReadingView board={board} dispatch={dispatch} onExpand={(t) => setExpanded(t)} />
      ) : (
        <div className="grid grid-cols-1 gap-5 px-4 pb-24 pt-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0">
            {loading ? (
              <CanvasSkeleton />
            ) : (
              <Canvas
                board={board}
                locked={locked}
                selected={selected}
                dispatch={dispatch}
                onSelect={select}
                onRemoveSection={removeSection}
              />
            )}
          </div>

          <div ref={inspectorRef} className="min-w-0">
            <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface lg:sticky lg:top-5 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
              {loading ? (
                <div className="flex items-center gap-2 px-4 py-8 text-[12px] text-bz-text-muted">
                  <Loader2 size={13} className="animate-spin text-bz-text-soft" /> Loading the board…
                </div>
              ) : locked ? (
                <div className="px-4 py-6">
                  <MoodNotice mood="refused" title="Read-only">
                    Every change to a provided board is refused by the server, so nothing here can be edited. Take an editable
                    copy first — you will get your own board, and the published original stays untouched.
                  </MoodNotice>
                  <div className="mt-3">
                    <GhostButton icon={Copy}>Make an editable copy</GhostButton>
                  </div>
                </div>
              ) : selectedTile && selectedSection ? (
                <Composer
                  tile={selectedTile}
                  sectionTitle={selectedSection.title}
                  dispatch={dispatch}
                  adjust={adjust}
                  promoted={promoted}
                  onPromote={(figId) => setPromoted((p) => new Set(p).add(figId))}
                  onToast={setToast}
                />
              ) : (
                <BoardPanel board={board} locked={locked} dispatch={dispatch} onSelect={select} />
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
