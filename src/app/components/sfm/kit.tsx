import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "../ui/utils";
import { AppFrame } from "../sales/AppFrame";
import { Avatar, Kbd, NUM, PLAIN_BTN } from "../sales/bzw";
import { useStore } from "../sales/store";
import { ordersStore } from "../sales/store";
import { receiptsStore } from "../sales/flow";
import { personById } from "../productivity/shared";
import {
  FIELD_TODAY,
  REPS,
  changesStore,
  dayAdd,
  fmtDay,
  isWorkday,
  notesStore,
  partyRoutesStore,
  plansStore,
  relDayName,
  repDay,
  routeHealth,
  routesStore,
  weekOf,
  PARTIES,
} from "./model";
import type { FieldRoute, StopState } from "./model";

// ════════════════════════════════════════════════════════════════════════════
// FIELD SALES KIT — the pieces every SFM tab shares
//
// The stop mark is the module's one visual word: a planned stop is ● productive,
// ◐ visited, ○ still to go, ⊘ missed; an unplanned visit is ◆ after a divider.
// Drawn the same size, in the same order, on every surface — a rep-day reads
// in one glance whether it sits in a Today row, a Plan cell or a route's runs.
// ════════════════════════════════════════════════════════════════════════════

/** Every store the field reads — one subscription point, so every tab re-derives on any write. */
export function useField() {
  const routes = useStore(routesStore);
  const links = useStore(partyRoutesStore);
  const plans = useStore(plansStore);
  const orders = useStore(ordersStore);
  const receipts = useStore(receiptsStore);
  const notes = useStore(notesStore);
  const changes = useStore(changesStore);
  return { routes, links, plans, orders, receipts, notes, changes, ctx: { routes, links, plans, orders, receipts } };
}

// ── Module frame and switcher ───────────────────────────────────────────────

export type SfmTab = "today" | "plan" | "routes" | "parties" | "visits" | "performance";
const TABS: { key: SfmTab; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "plan", label: "Plan" },
  { key: "routes", label: "Routes" },
  { key: "parties", label: "Parties" },
  { key: "visits", label: "Visits" },
  { key: "performance", label: "Performance" },
];

/** The six tabs as one module. A count is the work waiting there — never decoration. */
export function SfmNav({ current }: { current: SfmTab }) {
  const { ctx } = useField();
  const counts = React.useMemo(() => {
    const today = REPS.map((r) => repDay(r.id, FIELD_TODAY, ctx)).filter((d) => d.needsYou).length;
    const week = weekOf(dayAdd(FIELD_TODAY, 7)).filter(isWorkday);
    const unplanned = REPS.reduce((s, r) => s + week.filter((d) => !ctx.plans.some((p) => p.repId === r.id && p.date === d) && !repDay(r.id, d, ctx).leave).length, 0);
    const routes = ctx.routes.filter((rt) => routeHealth(rt.id, ctx).flags.some((f) => f === "no-rep" || f === "no-parties")).length;
    const onNoRoute = PARTIES.filter((p) => !ctx.links.some((l) => l.partyId === p.id)).length;
    return {
      today: { n: today, danger: true, title: "Need you today" },
      plan: { n: unplanned, danger: false, title: "Rep-days not planned next week" },
      routes: { n: routes, danger: false, title: "Routes with no rep or no parties" },
      parties: { n: onNoRoute, danger: false, title: "Parties on no route" },
      visits: { n: 0, danger: false, title: "" },
      performance: { n: 0, danger: false, title: "" },
    } as Record<SfmTab, { n: number; danger: boolean; title: string }>;
  }, [ctx]);
  return (
    <nav className="-mb-px ml-2 flex h-full min-w-0 items-stretch gap-0.5 overflow-x-auto [scrollbar-width:none]" aria-label="Field sales">
      {TABS.map((t) => {
        const on = t.key === current;
        const c = counts[t.key];
        return (
          <Link
            key={t.key}
            to={`/design/sfm/${t.key}`}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 px-2.5 text-[12.5px] transition-colors",
              on ? "font-semibold text-bz-text after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:rounded-bz-pill after:bg-bz-fire after:content-['']" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {t.label}
            {c.n > 0 && (
              <span title={c.title} className={cn("min-w-4 rounded-bz-pill px-1 text-center text-[10px] font-semibold leading-4", NUM, c.danger ? "bg-bz-red-soft text-bz-red" : "bg-bz-paper-warm text-bz-text-muted")}>
                {c.n}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function SfmFrame({ tab, children }: { tab: SfmTab; children: React.ReactNode }) {
  return (
    <AppFrame title="Field sales" titleAside={<SfmNav current={tab} />} rail="Field sales">
      {children}
    </AppFrame>
  );
}

// ── Route identity ──────────────────────────────────────────────────────────

export const routeColor = (tone: number) => `var(--bz-route-${((tone - 1) % 8) + 1})`;

/** A route as a chip: its identity bar, its code and (unless tight) its name. */
export function RouteChip({ route, onClick, tight, count, className, title }: { route: FieldRoute | undefined; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; tight?: boolean; count?: number; className?: string; title?: string }) {
  if (!route) return <span className="text-[11px] text-bz-text-soft">—</span>;
  const body = (
    <>
      <span aria-hidden className="h-3 w-[3px] shrink-0 rounded-bz-pill" style={{ background: routeColor(route.tone) }} />
      <span className={cn("shrink-0 font-semibold text-bz-text-muted", NUM)}>{route.id}</span>
      {!tight && <span className="min-w-0 truncate text-bz-text">{route.name}</span>}
      {count !== undefined && <span className={cn("shrink-0 text-bz-text-soft", NUM)}>· {count}</span>}
    </>
  );
  const cls = cn("inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-1.5 py-0.5 text-[11px]", className);
  if (!onClick)
    return (
      <span className={cls} title={title ?? `${route.id} ${route.name}`}>
        {body}
      </span>
    );
  return (
    <button type="button" onClick={onClick} className={cn(cls, "transition-colors hover:border-bz-line hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire")} title={title ?? `${route.id} ${route.name}`}>
      {body}
    </button>
  );
}

// ── Stop marks ──────────────────────────────────────────────────────────────

export const STOP_LABEL: Record<StopState | "unplanned", string> = {
  productive: "Visited · ordered",
  visited: "Visited · no order",
  pending: "Still to visit",
  missed: "Missed",
  here: "There now",
  unplanned: "Unplanned visit",
};

export function StopMark({ state, size = 9, title, unplannedProductive }: { state: StopState | "unplanned"; size?: number; title?: string; unplannedProductive?: boolean }) {
  const s = { width: size, height: size };
  if (state === "unplanned")
    return (
      <span title={title ?? STOP_LABEL.unplanned} className="inline-flex shrink-0 items-center justify-center" style={{ width: size + 1, height: size + 1 }}>
        <span className={cn("block rotate-45 rounded-[1.5px] border", unplannedProductive ? "border-bz-text bg-bz-text" : "border-bz-text-muted bg-bz-surface")} style={{ width: size * 0.72, height: size * 0.72 }} />
      </span>
    );
  return (
    <span
      title={title ?? STOP_LABEL[state]}
      className={cn(
        "inline-block shrink-0 rounded-bz-pill",
        state === "productive" && "bg-bz-pos-deep",
        state === "visited" && "border-[1.5px] border-bz-pos-deep bg-[linear-gradient(90deg,var(--bz-pos-deep)_50%,transparent_50%)]",
        state === "pending" && "border-[1.5px] border-bz-line bg-bz-surface",
        state === "missed" && "border-[1.5px] border-bz-red-mark bg-bz-red-soft",
        state === "here" && "border-[1.5px] border-bz-pos-deep bg-bz-fire shadow-[0_0_0_3px_color-mix(in_srgb,var(--bz-fire)_35%,transparent)]",
      )}
      style={s}
    />
  );
}

type StripStop = { state: StopState; title: string };
/** A rep-day in one line: planned stops in route order, then the unplanned visits after a divider. */
export function StopStrip({ stops, unplanned = [], size = 9, className }: { stops: StripStop[]; unplanned?: { title: string; productive: boolean }[]; size?: number; className?: string }) {
  if (!stops.length && !unplanned.length) return <span className="text-[11px] text-bz-text-soft">—</span>;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-[3px]", className)} aria-label={`${stops.filter((s) => s.state === "productive" || s.state === "visited").length} of ${stops.length} planned stops visited${unplanned.length ? `, ${unplanned.length} unplanned` : ""}`}>
      {stops.map((s, i) => (
        <StopMark key={i} state={s.state} size={size} title={s.title} />
      ))}
      {unplanned.length > 0 && <span aria-hidden className="mx-0.5 h-2.5 w-px bg-bz-line" />}
      {unplanned.map((u, i) => (
        <StopMark key={`u${i}`} state="unplanned" size={size} title={u.title} unplannedProductive={u.productive} />
      ))}
    </span>
  );
}

/** The key under a strip — shown once per page, never beside every row. */
export function StopLegend({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-bz-text-soft", className)}>
      {(["productive", "visited", "pending", "missed"] as const).map((s) => (
        <span key={s} className="inline-flex items-center gap-1">
          <StopMark state={s} size={8} /> {STOP_LABEL[s].replace("Visited · ", "")}
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <StopMark state="unplanned" size={8} /> Unplanned
      </span>
    </span>
  );
}

// ── Money ───────────────────────────────────────────────────────────────────

/** Base-currency money, whole rupees (the field talks in whole rupees; paisa only on documents). */
export function Money({ value, className, code = true, muted }: { value: number; className?: string; code?: boolean; muted?: boolean }) {
  return (
    <span className={cn("whitespace-nowrap", NUM, muted && "text-bz-text-muted", className)}>
      {code && <span className="mr-1 text-[0.78em] font-medium text-bz-text-soft">NPR</span>}
      {Math.round(value).toLocaleString("en-US")}
    </span>
  );
}

// ── People ──────────────────────────────────────────────────────────────────

export function RepName({ repId, size = 20, onOpen, sub }: { repId: string; size?: number; onOpen?: () => void; sub?: React.ReactNode }) {
  const p = personById(repId);
  const body = (
    <>
      <Avatar person={p} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] font-medium text-bz-text">{p?.name ?? "—"}</span>
        {sub && <span className="block truncate text-[10.5px] text-bz-text-soft">{sub}</span>}
      </span>
    </>
  );
  if (!onOpen) return <span className="inline-flex min-w-0 items-center gap-2">{body}</span>;
  return (
    <button type="button" onClick={onOpen} className="inline-flex min-w-0 items-center gap-2 rounded-bz-sm text-left hover:[&_span]:underline-offset-2 focus-visible:outline-2 focus-visible:outline-bz-fire" title={`Open ${p?.name}`}>
      {body}
    </button>
  );
}

// ── Day stepper ─────────────────────────────────────────────────────────────

/** ‹ Today, Fri 4 Sep › — ← / → step a day, T comes back to today, the middle opens a date field. */
export function DayStepper({ date, onChange, step = 1, label }: { date: string; onChange: (d: string) => void; step?: number; label?: string }) {
  const input = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector("[data-bzw-dialog], [data-bzw-popover]")) return;
      if (e.key === "ArrowLeft") (e.preventDefault(), onChange(dayAdd(date, -step)));
      else if (e.key === "ArrowRight") (e.preventDefault(), onChange(dayAdd(date, step)));
      else if (e.key.toLowerCase() === "t") onChange(FIELD_TODAY);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [date, onChange, step]);
  const rel = relDayName(date);
  return (
    <div className="inline-flex h-8 items-stretch overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
      <button type="button" className="flex w-7 items-center justify-center text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" onClick={() => onChange(dayAdd(date, -step))} title={`Previous (←)`} aria-label="Previous">
        <ChevronLeft size={14} />
      </button>
      <label className="relative flex cursor-pointer items-center gap-1.5 border-x border-bz-line-soft px-2.5 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm">
        <CalendarDays size={12} className="text-bz-text-muted" />
        <span className={NUM}>{label ?? (rel === fmtDay(date) ? fmtDay(date) : `${rel}, ${fmtDay(date)}`)}</span>
        <input
          ref={input}
          type="date"
          value={date}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Pick a date"
        />
      </label>
      <button type="button" className="flex w-7 items-center justify-center text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" onClick={() => onChange(dayAdd(date, step))} title={`Next (→)`} aria-label="Next">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export function TodayLink({ date, onToday }: { date: string; onToday: () => void }) {
  if (date === FIELD_TODAY) return null;
  return (
    <button type="button" onClick={onToday} className={cn(PLAIN_BTN, "text-[11.5px] font-medium text-bz-text-muted underline underline-offset-2")} title="Back to today (T)">
      Today <Kbd>T</Kbd>
    </button>
  );
}

// ── Sheets in the URL (a rep or a party opens over any tab, deep-linkable) ──

export function useSheetLinks() {
  const [search, setSearch] = useSearchParams();
  const open = (key: "rep" | "party", id: string) => {
    const p = new URLSearchParams(search);
    p.delete(key === "rep" ? "party" : "rep");
    p.set(key, id);
    setSearch(p, { replace: false });
  };
  const close = () => {
    const p = new URLSearchParams(search);
    p.delete("rep");
    p.delete("party");
    setSearch(p, { replace: false });
  };
  return { rep: search.get("rep"), party: search.get("party"), openRep: (id: string) => open("rep", id), openParty: (id: string) => open("party", id), close };
}

/** Navigates within the module, keeping the org filter a link arrived with. */
export function useSfmGo() {
  const navigate = useNavigate();
  return (path: string) => navigate(`/design/sfm/${path}`);
}

// ── Small readouts ──────────────────────────────────────────────────────────

/** "9 of 14" with the visited part in ink and the total soft. */
export function OfCount({ n, of, className }: { n: number; of: number; className?: string }) {
  return (
    <span className={cn("whitespace-nowrap text-[12px]", NUM, className)}>
      <span className="font-semibold text-bz-text">{n}</span>
      <span className="text-bz-text-soft"> of {of}</span>
    </span>
  );
}
