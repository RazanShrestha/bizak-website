import * as React from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  CalendarPlus,
  CalendarClock,
  Clock,
  MapPin,
  ListTodo,
  Check,
  Loader2,
  Trash2,
  Pencil,
  Plus,
  Maximize2,
  Inbox,
  LayoutGrid,
  List as ListIcon,
  AlertTriangle,
  Ban,
  Dot,
  ChevronRight as Caret,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// MY SCHEDULE · CALENDAR DIALOG  (browse & drill — a dismissible overlay)
//
// This is NOT a full page. It is a modal-overlay scheduler launched from the
// compact "This week" dashboard widget that the page renders. Judgement:
//   • Primary focus  = the month time-grid (scan a span of scheduled work).
//   • Primary action = drill into a day / item to view · create · edit · delete
//                      without ever leaving the overlay.
//
// One dataset, many projections. Events + tasks are "fetched" once on open,
// then bucketed by day; the grid, the list, every day's marker set, the
// per-day cap/overflow and the mobile presence-dots are all DERIVED from that
// one collection (useMemo). Switching representation or kind-filter only
// re-projects it; stepping the month only recomputes the grid window — neither
// refetches. Any create / delete inside the nested surfaces re-fetches the
// calendar AND bubbles a "changed" signal out to the opener (the widget).
//
// Surface stack (z-order):
//   dialog  → day-agenda  → entry-editor  → toast
// Each nested surface is its own dismissible scrim above the one below it.
// ════════════════════════════════════════════════════════════════════════════

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;
type Kind = "event" | "task";

// ── one item model for both kinds (optional fields are kind-specific) ──
type Item = {
  id: string;
  kind: Kind;
  title: string;
  dateISO: string; // the day it BUCKETS on (event start · task due)
  done: boolean;
  status: number; // event-status code OR task-status code
  // event-only
  location?: string;
  endISO?: string | null;
  allDay?: boolean;
  // task-only
  priority?: number;
  startISO?: string | null;
};
type Draft = Omit<Item, "id">;

// ════════════════════════════════════════════════════════════════════════════
// DATA-DRIVEN TRANSFORMS  (numeric codes → human labels · dates → day keys)
// ════════════════════════════════════════════════════════════════════════════

const EVENT_STATUS: Record<number, string> = { 0: "Tentative", 1: "Confirmed", 2: "Cancelled" };
const TASK_STATUS: Record<number, string> = { 0: "Not started", 1: "In progress", 2: "On hold", 3: "Done" };
const PRIORITY: Record<number, string> = { 0: "Low", 1: "Normal", 2: "High", 3: "Urgent" };

type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";

function statusTone(it: Item): Tone {
  if (it.kind === "event") return it.status === 1 ? "positive" : it.status === 2 ? "danger" : "pending";
  return it.status === 3 ? "positive" : it.status === 1 ? "partial" : it.status === 2 ? "pending" : "neutral";
}
const statusLabel = (it: Item) => (it.kind === "event" ? EVENT_STATUS[it.status] : TASK_STATUS[it.status]);
const priorityTone = (p: number): Tone => (p === 3 ? "danger" : p === 2 ? "partial" : "neutral");

const KIND_META: Record<Kind, { label: string; Icon: LucideIcon; dot: string; chip: string }> = {
  event: { label: "Event", Icon: CalendarRange, dot: "bg-bz-olive", chip: "bg-bz-paper-warm" },
  task: { label: "Task", Icon: ListTodo, dot: "bg-bz-fire ring-1 ring-bz-leaf-deep", chip: "bg-bz-fire/[0.16]" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad2 = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// "Today" is pinned to the seed's anchor so the mock always opens on a
// populated month regardless of the real date.
const TODAY = new Date(2026, 5, 16); // Tue, Jun 16 2026
const TODAY_KEY = keyOf(TODAY);

function fmtLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${WEEK[new Date(y, m - 1, d).getDay()]}, ${MONTHS[m - 1]} ${d}, ${y}`;
}
function fmtShort(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

// ════════════════════════════════════════════════════════════════════════════
// SEED  — one dataset, ~22 items across June 2026 (a couple spill from adjacent
// months to exercise out-of-window cells). Jun 16 holds 5 items → overflow.
// ════════════════════════════════════════════════════════════════════════════

let _seq = 0;
const ev = (
  dateISO: string,
  title: string,
  status: number,
  location: string,
  o: { done?: boolean; endISO?: string | null; allDay?: boolean } = {},
): Item => ({ id: `E-${++_seq}`, kind: "event", title, dateISO, done: o.done ?? false, status, location, endISO: o.endISO ?? null, allDay: o.allDay ?? true });
const tk = (
  dateISO: string,
  title: string,
  priority: number,
  status: number,
  o: { startISO?: string | null } = {},
): Item => ({ id: `T-${++_seq}`, kind: "task", title, dateISO, done: status === 3, status, priority, startISO: o.startISO ?? null });

const SEED: Item[] = [
  // spills from adjacent months (render in faded out-of-window cells)
  ev("2026-05-28", "Carry-over: FY budget sign-off", 1, "Kathmandu HQ"),
  tk("2026-07-01", "Draft Q3 sales targets", 2, 0),
  // June
  ev("2026-06-02", "Quarterly board review", 1, "Kathmandu HQ"),
  tk("2026-06-03", "Approve SO-1052 pricing", 2, 1),
  ev("2026-06-05", "Vendor call — Apex Manufacturing", 0, "Online · Meet"),
  tk("2026-06-08", "Reconcile NIC Asia statement", 1, 0),
  ev("2026-06-08", "Warehouse audit — Pokhara", 1, "Pokhara WH-02"),
  tk("2026-06-10", "File VAT return (Jestha)", 3, 1),
  ev("2026-06-12", "Team standup", 1, "Online · Meet", { done: true }),
  tk("2026-06-12", "Follow up Everest Hardware", 1, 3),
  // today (Jun 16) — 5 items → cap 3 + "+2 more"
  ev("2026-06-16", "Demo — Annapurna Distributors", 1, "Online · Zoom"),
  tk("2026-06-16", "Send quotation to Bagmati Builders", 2, 1),
  tk("2026-06-16", "Payroll cut-off review", 1, 0),
  ev("2026-06-16", "1:1 with Sita — Finance", 1, "Room 3 · HQ"),
  tk("2026-06-16", "Close June week-2 books", 3, 1),
  // rest of month
  tk("2026-06-17", "Inventory recount — Birgunj", 1, 0),
  ev("2026-06-18", "Onboarding — Karnali Pharma", 1, "Online · Meet"),
  tk("2026-06-22", "Renew subscription — Pro tier", 1, 0),
  ev("2026-06-22", "Branch managers sync", 1, "Kathmandu HQ"),
  ev("2026-06-24", "Dashain logistics kickoff", 0, "Kathmandu HQ"),
  tk("2026-06-26", "Audit prep checklist", 2, 3),
  ev("2026-06-30", "Month-end close review", 1, "Online · Meet"),
];

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

const CHIP_BG: Record<Tone, string> = {
  positive: "bg-bz-fire/[0.18] text-bz-text",
  partial: "bg-bz-leaf/50 text-bz-text",
  pending: "bg-bz-paper-warm text-bz-text-muted",
  danger: "bg-[#FBE5E2] text-[#9A2E29]",
  neutral: "bg-bz-paper-warm text-bz-text",
};
const DOT_BG: Record<Tone, string> = {
  positive: "bg-bz-leaf-deep",
  partial: "bg-bz-fire",
  pending: "bg-bz-line",
  danger: "bg-[#C0413A]",
  neutral: "bg-bz-text-soft",
};

function StatusChip({ label, tone, dot = true }: { label: string; tone: Tone; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[10.5px] font-medium", CHIP_BG[tone])}>
      {dot && <span className={cn("size-1.5 shrink-0 rounded-bz-pill", DOT_BG[tone])} />}
      {label}
    </span>
  );
}

function KindTag({ kind }: { kind: Kind }) {
  const m = KIND_META[kind];
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">
      <span className={cn("size-1.5 rounded-bz-pill", m.dot)} />
      {m.label}
    </span>
  );
}

// segmented control — used for the representation switch, kind filter, and the
// code-mapped selectors in the create form.
function Segmented({
  value,
  onChange,
  options,
  block,
  gridCols,
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: React.ReactNode; icon?: LucideIcon }[];
  block?: boolean;
  gridCols?: string; // when set, lay options out on a responsive grid (avoids ragged wrap for 4-option sets on mobile)
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5",
        gridCols ? cn("grid w-full gap-0.5", gridCols) : block ? "flex w-full" : "inline-flex",
      )}
    >
      {options.map((o) => {
        const on = o.value === value;
        const I = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            className={cn(
              "inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] font-medium transition-colors",
              block && !gridCols && "flex-1",
              size === "sm" ? "px-1.5 py-1 text-[11px]" : "px-2.5 py-1.5 text-[12px]",
              on ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.10)]" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {I && <I size={size === "sm" ? 12 : 13} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Switch({ value, onChange, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; ariaLabel?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          value ? "translate-x-[14px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
        {label}
        {required && <span className="text-[#C0413A]">*</span>}
        {hint && <span className="ml-auto font-medium normal-case tracking-normal text-bz-text-soft">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const INPUT =
  "h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper px-3 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted [color-scheme:light]";

const PRIMARY_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50";
const GHOST_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-50";
const DANGER_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-[#FBE5E2] px-3.5 text-[12px] font-semibold text-[#9A2E29] hover:bg-[#FBD9D5] disabled:opacity-50";

// ════════════════════════════════════════════════════════════════════════════
// 6+7 · TIME-GRID + DAY-ITEM MARKERS
// ════════════════════════════════════════════════════════════════════════════

const CAP = 3; // markers shown per day before rolling into "+N more"

function Marker({ item, onOpen }: { item: Item; onOpen: () => void }) {
  const m = KIND_META[item.kind];
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onOpen(); }}
      title={`${m.label} · ${item.title}`}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-bz-sm px-1.5 py-[3px] text-left text-[11px] leading-tight hover:brightness-[0.97]",
        m.chip,
        item.done && "opacity-60",
      )}
    >
      {item.done ? (
        <Check size={11} className="shrink-0 text-bz-leaf-deep" />
      ) : (
        <span className={cn("size-1.5 shrink-0 rounded-bz-pill", m.dot)} />
      )}
      <span className={cn("truncate font-medium text-bz-text", item.done && "text-bz-text-soft line-through")}>{item.title}</span>
    </button>
  );
}

function PresenceDots({ items }: { items: Item[] }) {
  // graceful-degradation fallback for constrained widths (mobile cells)
  const dots = [
    ...items.filter((i) => i.kind === "event").slice(0, 3).map(() => "event" as Kind),
    ...items.filter((i) => i.kind === "task").slice(0, 3).map(() => "task" as Kind),
  ].slice(0, 4);
  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-0.5 sm:hidden">
      {dots.map((k, i) => (
        <span key={i} className={cn("size-1.5 rounded-bz-pill", KIND_META[k].dot)} />
      ))}
      {items.length > dots.length && <span className="text-[8px] font-semibold tabular-nums text-bz-text-soft">+{items.length - dots.length}</span>}
    </div>
  );
}

function DayCell({
  date,
  inMonth,
  items,
  onOpenDay,
  onOpenItem,
}: {
  date: Date;
  inMonth: boolean;
  items: Item[];
  onOpenDay: () => void;
  onOpenItem: (it: Item) => void;
}) {
  const iso = keyOf(date);
  const isToday = iso === TODAY_KEY;
  const shown = items.slice(0, CAP);
  const extra = items.length - shown.length;
  return (
    <button
      type="button"
      onClick={onOpenDay}
      className={cn(
        "group flex min-h-[58px] flex-col gap-1 border-b border-r border-bz-line-soft p-1 text-left align-top last:border-r-0 sm:min-h-[104px] sm:p-1.5",
        inMonth ? "bg-bz-surface hover:bg-bz-paper-warm/60" : "bg-bz-paper-warm/40 hover:bg-bz-paper-warm/70",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex size-5 items-center justify-center rounded-bz-pill text-[11px] font-semibold tabular-nums sm:size-[22px] sm:text-[12px]",
            isToday ? "bg-bz-fire text-bz-olive" : inMonth ? "text-bz-text" : "text-bz-text-soft",
          )}
        >
          {date.getDate()}
        </span>
        {items.length > 0 && (
          <span className="hidden text-[9px] font-semibold tabular-nums text-bz-text-soft sm:inline">{items.length}</span>
        )}
      </div>

      {/* full titled markers (≥ sm) */}
      <div className="hidden flex-col gap-0.5 sm:flex">
        {shown.map((it) => (
          <Marker key={it.id} item={it} onOpen={() => onOpenItem(it)} />
        ))}
        {extra > 0 && (
          <span className="px-1 text-[10px] font-semibold text-bz-text-muted group-hover:text-bz-text tabular-nums">+{extra} more</span>
        )}
      </div>

      {/* presence dots (< sm) */}
      <PresenceDots items={items} />
    </button>
  );
}

function TimeGrid({
  cursor,
  byDay,
  onOpenDay,
  onOpenItem,
}: {
  cursor: { y: number; m: number };
  byDay: Map<string, Item[]>;
  onOpenDay: (iso: string) => void;
  onOpenItem: (it: Item) => void;
}) {
  const first = new Date(cursor.y, cursor.m, 1);
  const lead = first.getDay();
  const cells = Array.from({ length: 42 }, (_, i) => new Date(cursor.y, cursor.m, 1 - lead + i));
  return (
    <div className="overflow-hidden rounded-bz-md border-l border-t border-bz-line-soft">
      <div className="grid grid-cols-7 bg-bz-paper-warm">
        {WEEK.map((w) => (
          <div key={w} className="border-b border-r border-bz-line-soft py-1.5 text-center text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-soft last:border-r-0">
            <span className="sm:hidden">{w[0]}</span>
            <span className="hidden sm:inline">{w}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d) => {
          const iso = keyOf(d);
          return (
            <DayCell
              key={iso}
              date={d}
              inMonth={d.getMonth() === cursor.m}
              items={byDay.get(iso) ?? []}
              onOpenDay={() => onOpenDay(iso)}
              onOpenItem={onOpenItem}
            />
          );
        })}
      </div>
    </div>
  );
}

// 5 · ITEM-KIND LEGEND (grid only — static reference)
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-bz-text-muted">
      <span className="inline-flex items-center gap-1.5"><span className={cn("size-1.5 rounded-bz-pill", KIND_META.event.dot)} /> Event</span>
      <span className="inline-flex items-center gap-1.5"><span className={cn("size-1.5 rounded-bz-pill", KIND_META.task.dot)} /> Task</span>
      <span className="inline-flex items-center gap-1.5"><Check size={11} className="text-bz-leaf-deep" /> Done</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8+9 · CHRONOLOGICAL LIST + ROW + EMPTY STATE
// ════════════════════════════════════════════════════════════════════════════

function ListRow({ item, onOpen }: { item: Item; onOpen: () => void }) {
  const [, m, d] = item.dateISO.split("-").map(Number);
  const past = item.dateISO < TODAY_KEY;
  const isToday = item.dateISO === TODAY_KEY;
  const secondary =
    item.kind === "event"
      ? item.location
      : `${PRIORITY[item.priority ?? 1]} priority`;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 border-b border-bz-line-soft px-3 py-2.5 text-left last:border-b-0 hover:bg-bz-paper-warm/50"
    >
      {/* compact date indicator */}
      <span
        className={cn(
          "flex size-10 shrink-0 flex-col items-center justify-center rounded-bz-md border text-center",
          isToday ? "border-bz-fire bg-bz-fire/[0.18]" : "border-bz-line-soft bg-bz-paper-warm",
        )}
      >
        <span className="text-[8px] font-bold uppercase tracking-[0.06em] text-bz-text-soft">{MONTHS[m - 1]}</span>
        <span className={cn("text-[14px] font-semibold leading-none tabular-nums", past && !isToday ? "text-bz-text-muted" : "text-bz-text")}>{d}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {item.done && <Check size={12} className="shrink-0 text-bz-leaf-deep" />}
          <span className={cn("truncate text-[13px] font-medium", item.done ? "text-bz-text-soft line-through" : "text-bz-text")}>{item.title}</span>
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <KindTag kind={item.kind} />
          <StatusChip label={statusLabel(item)} tone={statusTone(item)} />
          {secondary && (
            <span className="inline-flex items-center gap-1 text-[10.5px] text-bz-text-muted">
              {item.kind === "event" ? <MapPin size={10} className="text-bz-text-soft" /> : <AlertTriangle size={10} className="text-bz-text-soft" />}
              {secondary}
            </span>
          )}
        </span>
      </span>
      <Caret size={14} className="shrink-0 text-bz-text-soft" />
    </button>
  );
}

function ChronoList({ items, kind, onOpenItem, onAdd }: { items: Item[]; kind: Kind; onOpenItem: (it: Item) => void; onAdd: () => void }) {
  if (items.length === 0) {
    const m = KIND_META[kind];
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
          <m.Icon size={20} />
        </span>
        <div>
          <p className="text-[13.5px] font-semibold text-bz-text">No {m.label.toLowerCase()}s scheduled</p>
          <p className="mt-1 max-w-[260px] text-[11.5px] text-bz-text-muted">Nothing here yet. Add one to start tracking your {m.label.toLowerCase()}s.</p>
        </div>
        <button onClick={onAdd} className={GHOST_BTN}>
          <Plus size={13} /> New {m.label.toLowerCase()}
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      {items.map((it) => (
        <ListRow key={it.id} item={it} onOpen={() => onOpenItem(it)} />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 11 · DAY-AGENDA SURFACE  (opens for a populated day — intent only)
// ════════════════════════════════════════════════════════════════════════════

function DayAgenda({
  dateISO,
  items,
  onClose,
  onOpenItem,
  onAdd,
}: {
  dateISO: string;
  items: Item[];
  onClose: () => void;
  onOpenItem: (it: Item) => void;
  onAdd: (kind: Kind) => void;
}) {
  return (
    <Scrim z={95} onScrim={onClose} align="center">
      <div className="relative flex max-h-[80vh] w-full max-w-[440px] flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_24px_70px_-20px_rgba(15,20,17,0.45)]">
        <header className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-4 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
              <CalendarDays size={12} /> Day agenda
            </p>
            <p className="mt-0.5 text-[14px] font-semibold tracking-tight text-bz-text tabular-nums">{fmtLong(dateISO)}</p>
          </div>
          <button onClick={onClose} aria-label="Close day" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
            <X size={14} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <Inbox size={20} className="text-bz-text-soft" />
              <p className="text-[12.5px] font-medium text-bz-text-muted">Nothing scheduled this day</p>
              <p className="text-[11px] text-bz-text-soft">Add an event or task below.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((it) => (
                <ListRow key={it.id} item={it} onOpen={() => onOpenItem(it)} />
              ))}
            </div>
          )}
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3">
          <button onClick={() => onAdd("event")} className={GHOST_BTN}>
            <CalendarPlus size={13} /> Add event
          </button>
          <button onClick={() => onAdd("task")} className={GHOST_BTN}>
            <ListTodo size={13} /> Add task
          </button>
        </footer>
      </div>
    </Scrim>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 12 · ENTRY EDITOR SURFACE  (create / detail)
// ════════════════════════════════════════════════════════════════════════════

function DefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-bz-line-soft py-2.5 last:border-b-0">
      <span className="shrink-0 text-[11px] font-medium text-bz-text-muted">{label}</span>
      <span className="min-w-0 text-right text-[12.5px] font-medium text-bz-text">{children}</span>
    </div>
  );
}

function EntryEditor({
  mode,
  initialKind,
  dateISO,
  item,
  onClose,
  onCreate,
  onDelete,
  onEditHandoff,
}: {
  mode: "create" | "detail";
  initialKind?: Kind;
  dateISO?: string;
  item?: Item;
  onClose: () => void;
  onCreate: (draft: Draft) => void;
  onDelete: (id: string) => void;
  onEditHandoff: (it: Item) => void;
}) {
  return (
    <Scrim z={100} align="center">
      <div className="relative flex max-h-[86vh] w-full max-w-[520px] flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_24px_70px_-20px_rgba(15,20,17,0.5)]">
        {mode === "create" ? (
          <CreateForm initialKind={initialKind ?? "event"} dateISO={dateISO ?? TODAY_KEY} onClose={onClose} onCreate={onCreate} />
        ) : (
          <DetailView item={item!} onClose={onClose} onDelete={onDelete} onEditHandoff={onEditHandoff} />
        )}
      </div>
    </Scrim>
  );
}

function CreateForm({ initialKind, dateISO, onClose, onCreate }: { initialKind: Kind; dateISO: string; onClose: () => void; onCreate: (d: Draft) => void }) {
  const [kind, setKind] = React.useState<Kind>(initialKind);
  const [title, setTitle] = React.useState(""); // preserved across kind switches
  const [saving, setSaving] = React.useState(false);
  const saveTimer = React.useRef<number | undefined>(undefined);
  // cancel the in-flight save if the editor is dismissed mid-round-trip (no ghost create)
  React.useEffect(() => () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); }, []);

  // event fields
  const [start, setStart] = React.useState(dateISO);
  const [end, setEnd] = React.useState(dateISO);
  const [allDay, setAllDay] = React.useState(true);
  const [location, setLocation] = React.useState("");
  const [eventStatus, setEventStatus] = React.useState(1);

  // task fields
  const [due, setDue] = React.useState(dateISO);
  const [taskStart, setTaskStart] = React.useState(dateISO);
  const [priority, setPriority] = React.useState(1);
  const [taskStatus, setTaskStatus] = React.useState(0);

  const valid = title.trim().length > 0;

  function save() {
    if (!valid || saving) return;
    setSaving(true);
    const draft: Draft =
      kind === "event"
        ? { kind, title: title.trim(), dateISO: start, done: false, status: eventStatus, location: location.trim() || "—", endISO: allDay ? null : end, allDay }
        : { kind, title: title.trim(), dateISO: due, done: taskStatus === 3, status: taskStatus, priority, startISO: taskStart };
    // simulate the save round-trip, then hand the draft up
    saveTimer.current = window.setTimeout(() => onCreate(draft), 750);
  }

  return (
    <>
      <header className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-4 py-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
            <Plus size={12} /> New item
          </p>
          <p className="mt-0.5 text-[14px] font-semibold tracking-tight text-bz-text">Add to your schedule</p>
        </div>
        <button onClick={onClose} aria-label="Cancel" disabled={saving} className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm disabled:opacity-40">
          <X size={14} />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        {/* KIND CHOOSER — reconfigures the fields below; preserves the typed title */}
        <Segmented
          block
          value={kind}
          onChange={(v) => setKind(v as Kind)}
          options={[
            { value: "event", label: "Event", icon: CalendarRange },
            { value: "task", label: "Task", icon: ListTodo },
          ]}
        />

        <Field label="Title" required>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "event" ? "e.g. Demo — Annapurna" : "e.g. Close June books"} className={INPUT} />
        </Field>

        {kind === "event" ? (
          <>
            <Field label="Status">
              <Segmented
                block
                size="sm"
                value={String(eventStatus)}
                onChange={(v) => setEventStatus(Number(v))}
                options={Object.entries(EVENT_STATUS).map(([k, v]) => ({ value: k, label: v }))}
              />
            </Field>
            <Field label="Location">
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room, address or meeting link" className={INPUT} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts">
                <input type="date" value={start} onChange={(e) => { setStart(e.target.value); if (e.target.value > end) setEnd(e.target.value); }} className={INPUT} />
              </Field>
              <Field label="Ends">
                <input type="date" disabled={allDay} min={start} value={allDay ? "" : end} onChange={(e) => setEnd(e.target.value)} className={cn(INPUT, allDay && "cursor-not-allowed opacity-50")} />
              </Field>
            </div>
            <label className="flex items-center justify-between rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 px-3 py-2.5">
              <span className="text-[12px] font-medium text-bz-text">All day · no end date</span>
              <Switch value={allDay} onChange={setAllDay} ariaLabel="All day" />
            </label>
          </>
        ) : (
          <>
            <Field label="Priority">
              <Segmented
                gridCols="grid-cols-2 sm:grid-cols-4"
                size="sm"
                value={String(priority)}
                onChange={(v) => setPriority(Number(v))}
                options={Object.entries(PRIORITY).map(([k, v]) => ({ value: k, label: v }))}
              />
            </Field>
            <Field label="Progress">
              <Segmented
                gridCols="grid-cols-2 sm:grid-cols-4"
                size="sm"
                value={String(taskStatus)}
                onChange={(v) => setTaskStatus(Number(v))}
                options={Object.entries(TASK_STATUS).map(([k, v]) => ({ value: k, label: v }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <input type="date" value={taskStart} onChange={(e) => { setTaskStart(e.target.value); if (e.target.value > due) setDue(e.target.value); }} className={INPUT} />
              </Field>
              <Field label="Due">
                <input type="date" min={taskStart} value={due} onChange={(e) => setDue(e.target.value)} className={INPUT} />
              </Field>
            </div>
          </>
        )}
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3">
        <button onClick={onClose} disabled={saving} className={GHOST_BTN}>Cancel</button>
        <button onClick={save} disabled={!valid || saving} className={PRIMARY_BTN}>
          {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={13} /> Save {KIND_META[kind].label.toLowerCase()}</>}
        </button>
      </footer>
    </>
  );
}

function DetailView({ item, onClose, onDelete, onEditHandoff }: { item: Item; onClose: () => void; onDelete: (id: string) => void; onEditHandoff: (it: Item) => void }) {
  const [loading, setLoading] = React.useState(true); // fetch-the-record state
  const [confirm, setConfirm] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const delTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(t);
  }, []);
  // cancel an in-flight delete if the editor is dismissed mid-round-trip (no phantom delete)
  React.useEffect(() => () => { if (delTimer.current) window.clearTimeout(delTimer.current); }, []);
  const m = KIND_META[item.kind];

  function del() {
    setDeleting(true);
    delTimer.current = window.setTimeout(() => onDelete(item.id), 650);
  }

  return (
    <>
      <header className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
            <m.Icon size={12} /> {m.label} details
          </p>
          <p className={cn("mt-0.5 truncate text-[14px] font-semibold tracking-tight", item.done ? "text-bz-text-muted line-through" : "text-bz-text")}>{item.title}</p>
        </div>
        <button onClick={onClose} aria-label="Close" disabled={deleting} className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm disabled:opacity-40">
          <X size={14} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-1.5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 size={15} className="animate-spin text-bz-fire" />
            <span className="text-[12px] text-bz-text-muted">Loading {m.label.toLowerCase()}…</span>
          </div>
        ) : (
          <div className="py-1">
            <DefRow label="Kind"><KindTag kind={item.kind} /></DefRow>
            <DefRow label="Status"><StatusChip label={statusLabel(item)} tone={statusTone(item)} /></DefRow>
            {item.kind === "task" ? (
              <>
                <DefRow label="Priority"><StatusChip label={PRIORITY[item.priority ?? 1]} tone={priorityTone(item.priority ?? 1)} dot={false} /></DefRow>
                {item.startISO && <DefRow label="Start"><span className="tabular-nums">{fmtLong(item.startISO)}</span></DefRow>}
                <DefRow label="Due"><span className="tabular-nums">{fmtLong(item.dateISO)}</span></DefRow>
                <DefRow label="Complete">{item.done ? "Yes" : "No"}</DefRow>
              </>
            ) : (
              <>
                <DefRow label="Location"><span className="inline-flex items-center gap-1"><MapPin size={11} className="text-bz-text-soft" />{item.location}</span></DefRow>
                <DefRow label="Starts"><span className="tabular-nums">{fmtLong(item.dateISO)}</span></DefRow>
                <DefRow label="Ends">
                  {item.allDay || !item.endISO ? <span className="inline-flex items-center gap-1 text-bz-text-muted"><Clock size={11} className="text-bz-text-soft" />All day · no end</span> : <span className="tabular-nums">{fmtLong(item.endISO)}</span>}
                </DefRow>
              </>
            )}
          </div>
        )}
      </div>

      {!loading && (
        <footer className="border-t border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3">
          {confirm ? (
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#9A2E29]">
                <AlertTriangle size={13} /> Delete this {m.label.toLowerCase()}?
              </span>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(false)} disabled={deleting} className={GHOST_BTN}>Keep</button>
                <button onClick={del} disabled={deleting} className={DANGER_BTN}>
                  {deleting ? <><Loader2 size={13} className="animate-spin" /> Deleting…</> : <><Trash2 size={13} /> Delete</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => setConfirm(true)} className="inline-flex h-9 items-center gap-1.5 rounded-bz-md px-2.5 text-[12px] font-semibold text-[#9A2E29] hover:bg-[#FBE5E2]">
                <Trash2 size={13} /> Delete
              </button>
              <button onClick={() => onEditHandoff(item)} className={PRIMARY_BTN}>
                <Pencil size={13} /> Edit in full editor
              </button>
            </div>
          )}
        </footer>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCRIM  — a full-viewport overlay layer (one per stacked surface)
// ════════════════════════════════════════════════════════════════════════════

function Scrim({ z, onScrim, align = "center", children }: { z: number; onScrim?: () => void; align?: "center" | "stretch"; children: React.ReactNode }) {
  return createPortal(
    <div className={cn("fixed inset-0 flex justify-center p-3 sm:p-6", align === "center" ? "items-center" : "items-stretch")} style={{ zIndex: z }}>
      <div className="absolute inset-0 bg-[rgba(10,16,13,0.55)]" onClick={onScrim} aria-hidden />
      {children}
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST  (transient success / error)
// ════════════════════════════════════════════════════════════════════════════

type ToastState = { kind: "success" | "error"; message: string; id: number } | null;

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 3400);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const ok = toast.kind === "success";
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.35)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", ok ? "bg-bz-fire/[0.22]" : "bg-[#FBE7E5]")}>
          {ok ? <Check size={13} className="text-bz-leaf-deep" /> : <Ban size={12} className="text-[#9A2E29]" />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1 · DISMISSIBLE DIALOG SURFACE  (orchestrates everything)
// ════════════════════════════════════════════════════════════════════════════

type EditorState = { mode: "create"; kind: Kind; dateISO: string } | { mode: "detail"; item: Item } | null;

function CalendarDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  // ── single source of truth ──
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Item[]>(SEED);
  const idRef = React.useRef(SEED.length + 100);

  // ── projections / navigation ──
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [cursor, setCursor] = React.useState({ y: TODAY.getFullYear(), m: TODAY.getMonth() });
  const [listKind, setListKind] = React.useState<Kind>("event");

  // ── nested surfaces (independent) ──
  const [agenda, setAgenda] = React.useState<string | null>(null);
  const [editor, setEditor] = React.useState<EditorState>(null);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastSeq = React.useRef(0);
  const fireToast = (kind: "success" | "error", message: string) => setToast({ kind, message, id: ++toastSeq.current });

  // initial "fetch"
  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  // body scroll lock while the overlay is open
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Esc dismisses the TOP-MOST surface
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editor) setEditor(null);
      else if (agenda) setAgenda(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor, agenda, onClose]);

  // ── derivations (recomputed from the one dataset) ──
  const byDay = React.useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const arr = map.get(it.dateISO);
      if (arr) arr.push(it);
      else map.set(it.dateISO, [it]);
    }
    // events before tasks, done last — stable per-day order
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.done === b.done ? (a.kind === b.kind ? 0 : a.kind === "event" ? -1 : 1) : a.done ? 1 : -1));
    }
    return map;
  }, [items]);

  const listItems = React.useMemo(
    () => items.filter((i) => i.kind === listKind).sort((a, b) => (a.dateISO < b.dateISO ? -1 : a.dateISO > b.dateISO ? 1 : 0)),
    [items, listKind],
  );
  const counts = React.useMemo(() => ({ event: items.filter((i) => i.kind === "event").length, task: items.filter((i) => i.kind === "task").length }), [items]);
  const monthLabel = `${MONTHS_LONG[cursor.m]} ${cursor.y}`;
  const isThisMonth = cursor.y === TODAY.getFullYear() && cursor.m === TODAY.getMonth();

  // ── refetch: re-derive after a mutation (brief loading flash) ──
  const refetch = React.useCallback(() => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 460);
  }, []);

  // ── interaction-dependent entry points ──
  const openDay = (iso: string) => {
    const has = (byDay.get(iso)?.length ?? 0) > 0;
    if (has) setAgenda(iso);
    else setEditor({ mode: "create", kind: "event", dateISO: iso }); // empty day → straight to create
  };
  const openItem = (it: Item) => setEditor({ mode: "detail", item: it });
  const openCreate = (kind: Kind, dateISO: string) => setEditor({ mode: "create", kind, dateISO });

  // ── mutations → refetch + bubble "changed" out to the opener ──
  const create = (draft: Draft) => {
    const id = `${draft.kind === "event" ? "E" : "T"}-${++idRef.current}`;
    setItems((prev) => [...prev, { ...draft, id }]);
    setEditor(null);
    fireToast("success", `${KIND_META[draft.kind].label} "${draft.title}" created`);
    onChanged();
    refetch();
  };
  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setEditor(null);
    fireToast("success", "Item deleted");
    onChanged();
    refetch();
  };
  const editHandoff = (it: Item) => {
    setEditor(null);
    fireToast("success", `Opening the full editor for "${it.title}"…`);
  };

  const step = (delta: number) => setCursor((c) => { const d = new Date(c.y, c.m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const goToday = () => setCursor({ y: TODAY.getFullYear(), m: TODAY.getMonth() });

  return (
    <>
      <Scrim z={90} onScrim={onClose} align="center">
        <div className="relative flex h-full max-h-[760px] w-full max-w-[940px] flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_30px_90px_-25px_rgba(15,20,17,0.6)]">
          {/* identity + dismiss */}
          <header className="flex items-start justify-between gap-3 border-b border-bz-line px-4 py-3 md:px-5">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                <CalendarClock size={12} /> Workspace · This week
              </p>
              <h2 className="mt-0.5 text-[18px] font-semibold tracking-tight text-bz-text md:text-[20px]">My Schedule</h2>
            </div>
            <button onClick={onClose} aria-label="Close scheduler" className="flex size-8 shrink-0 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
              <X size={16} />
            </button>
          </header>

          {/* 2 · representation switch + the secondary controls that match it */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-bz-line-soft px-4 py-2.5 md:px-5">
            <Segmented
              value={view}
              onChange={(v) => setView(v as "grid" | "list")}
              options={[
                { value: "grid", label: "Grid", icon: LayoutGrid },
                { value: "list", label: "List", icon: ListIcon },
              ]}
            />

            {view === "grid" ? (
              // 3 · TIME-PERIOD NAVIGATOR
              <div className="flex items-center gap-1">
                <button onClick={() => step(-1)} aria-label="Previous month" className="flex size-8 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm">
                  <ChevronLeft size={15} />
                </button>
                <span className="min-w-[124px] text-center text-[13px] font-semibold tracking-tight text-bz-text tabular-nums">{monthLabel}</span>
                <button onClick={() => step(1)} aria-label="Next month" className="flex size-8 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm">
                  <ChevronRight size={15} />
                </button>
                <button onClick={goToday} disabled={isThisMonth} className={cn("ml-1 inline-flex h-8 items-center gap-1 rounded-bz-md border px-2.5 text-[11.5px] font-semibold", isThisMonth ? "cursor-default border-bz-line-soft text-bz-text-soft" : "border-bz-line bg-bz-surface text-bz-text hover:bg-bz-paper-warm")}>
                  <Dot size={14} className={isThisMonth ? "text-bz-text-soft" : "text-bz-leaf-deep"} /> Today
                </button>
              </div>
            ) : (
              // 4 · ITEM-KIND FILTER
              <Segmented
                value={listKind}
                onChange={(v) => setListKind(v as Kind)}
                options={[
                  { value: "event", label: <span className="inline-flex items-center gap-1.5">Events <span className="rounded-bz-pill bg-bz-paper-warm px-1.5 text-[10px] font-semibold tabular-nums text-bz-text-muted">{counts.event}</span></span> },
                  { value: "task", label: <span className="inline-flex items-center gap-1.5">Tasks <span className="rounded-bz-pill bg-bz-paper-warm px-1.5 text-[10px] font-semibold tabular-nums text-bz-text-muted">{counts.task}</span></span> },
                ]}
              />
            )}

            <div className="ml-auto flex items-center gap-3">
              {view === "grid" && <span className="hidden lg:block"><Legend /></span>}
              <button onClick={() => openCreate("event", TODAY_KEY)} className={PRIMARY_BTN}>
                <Plus size={14} /> <span className="hidden sm:inline">New</span>
              </button>
            </div>
          </div>

          {/* content region */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-bz-section-b/40 p-3 md:p-4">
            {loading ? (
              // 10 · BUSY / LOADING STATE
              <div className="flex h-full flex-col items-center justify-center gap-2.5 py-16 text-center">
                <Loader2 size={22} className="animate-spin text-bz-fire" />
                <p className="text-[12.5px] font-medium text-bz-text-muted">Loading your schedule…</p>
                <p className="text-[11px] text-bz-text-soft">Fetching events &amp; tasks</p>
              </div>
            ) : view === "grid" ? (
              <>
                <div className="mb-2 flex items-center justify-between lg:hidden">
                  <Legend />
                </div>
                <TimeGrid cursor={cursor} byDay={byDay} onOpenDay={openDay} onOpenItem={openItem} />
              </>
            ) : (
              <div className="overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
                <ChronoList items={listItems} kind={listKind} onOpenItem={openItem} onAdd={() => openCreate(listKind, TODAY_KEY)} />
              </div>
            )}
          </div>
        </div>
      </Scrim>

      {/* 11 · day-agenda (stacked above the dialog) */}
      {agenda && (
        <DayAgenda
          dateISO={agenda}
          items={byDay.get(agenda) ?? []}
          onClose={() => setAgenda(null)}
          onOpenItem={openItem}
          onAdd={(kind) => openCreate(kind, agenda)}
        />
      )}

      {/* 12 · entry editor (top-most) */}
      {editor && (
        <EntryEditor
          mode={editor.mode}
          initialKind={editor.mode === "create" ? editor.kind : undefined}
          dateISO={editor.mode === "create" ? editor.dateISO : undefined}
          item={editor.mode === "detail" ? editor.item : undefined}
          onClose={() => setEditor(null)}
          onCreate={create}
          onDelete={remove}
          onEditHandoff={editHandoff}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LAUNCHER  — the compact "This week" dashboard widget that opens the dialog
// ════════════════════════════════════════════════════════════════════════════

function ThisWeekWidget({ onExpand, changeCount }: { onExpand: () => void; changeCount: number }) {
  // derive this-week items (today → +6 days) from the same seed
  const end = keyOf(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 7));
  const week = React.useMemo(
    () => SEED.filter((i) => i.dateISO >= TODAY_KEY && i.dateISO < end).sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1)),
    [end],
  );
  return (
    <div className="mx-auto w-full max-w-[460px]">
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[var(--bz-shadow-card)]">
        <div className="flex items-center justify-between gap-2 border-b border-bz-line-soft px-4 py-3">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
              <CalendarClock size={12} /> This week
            </p>
            <p className="mt-0.5 text-[14px] font-semibold tracking-tight text-bz-text">My Schedule</p>
          </div>
          <button onClick={onExpand} aria-label="Expand scheduler" className="flex size-8 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <Maximize2 size={14} />
          </button>
        </div>

        <div className="flex flex-col">
          {week.slice(0, 4).map((it) => (
            <button key={it.id} onClick={onExpand} className="flex items-center gap-2.5 border-b border-bz-line-soft px-4 py-2.5 text-left last:border-b-0 hover:bg-bz-paper-warm/50">
              <span className={cn("size-1.5 shrink-0 rounded-bz-pill", KIND_META[it.kind].dot)} />
              <span className={cn("min-w-0 flex-1 truncate text-[12.5px] font-medium", it.done ? "text-bz-text-soft line-through" : "text-bz-text")}>{it.title}</span>
              <span className="shrink-0 text-[10.5px] font-medium tabular-nums text-bz-text-muted">{it.dateISO === TODAY_KEY ? "Today" : fmtShort(it.dateISO)}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3">
          {changeCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-bz-leaf-deep">
              <span className="size-1.5 rounded-bz-pill bg-bz-leaf-deep" /> Updated just now
            </span>
          ) : (
            <span className="text-[11px] text-bz-text-soft tabular-nums">{week.length} upcoming</span>
          )}
          <button onClick={onExpand} className={PRIMARY_BTN}>
            <CalendarDays size={14} /> Open scheduler
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function CalendarDialogDesignPage() {
  const [open, setOpen] = React.useState(true); // auto-open so the dialog is visible immediately
  const [changeCount, setChangeCount] = React.useState(0);

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Workspace</span>
          <Caret size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">My Schedule</span>
        </>
      }
    >
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 md:py-16">
        <div className="mb-6 max-w-[460px] text-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-bz-text md:text-[24px]">This week, at a glance</h1>
          <p className="mt-1.5 text-[12.5px] text-bz-text-muted">
            A compact preview of what&apos;s scheduled. Expand it to browse every event and task in a bounded overlay — and create, edit or delete without leaving the page.
          </p>
        </div>
        <ThisWeekWidget onExpand={() => setOpen(true)} changeCount={changeCount} />
      </div>

      {open && <CalendarDialog onClose={() => setOpen(false)} onChanged={() => setChangeCount((c) => c + 1)} />}
    </AppShell>
  );
}
