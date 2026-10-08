import * as React from "react";
import { cn } from "../ui/utils";
import { Plus } from "lucide-react";
import { Chip, LABEL, MenuItem, NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import type { ActResult, Rep } from "./data";
import { DAY_STATUS, OUTLET_STATUS, actShort, planStartStore, stockCountsStore } from "./field-data";
import type { DayStatus, OutletStatus } from "./field-data";
import { Who, chipTone } from "./sf";
import {
  activitiesStore,
  campaignsStore,
  customersStore,
  fieldSettingsStore,
  hubStore,
  locationsStore,
  planStore,
  playbooksStore,
  repsStore,
  schemesStore,
  targetsStore,
  typesStore,
  visitsStore,
} from "./store";

// ════════════════════════════════════════════════════════════════════════════
// FIELD · SMALL PARTS shared by Today, Plan, Visits, Reps, Targets, Insights
// and the rep app.
// ════════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to every store the field helpers read. The helpers use `.get()`, so a page calls this once and
 * re-renders whenever a plan, visit, order or master changes.
 */
export function useFieldStores() {
  return {
    reps: useStore(repsStore),
    customers: useStore(customersStore),
    types: useStore(typesStore),
    plan: useStore(planStore),
    planStart: useStore(planStartStore),
    visits: useStore(visitsStore),
    hub: useStore(hubStore),
    schemes: useStore(schemesStore),
    playbooks: useStore(playbooksStore),
    activities: useStore(activitiesStore),
    campaigns: useStore(campaignsStore),
    targets: useStore(targetsStore),
    counts: useStore(stockCountsStore),
    locations: useStore(locationsStore),
    fieldSettings: useStore(fieldSettingsStore),
  };
}

/** A rep's avatar — the same disc `Who` draws, so a rep reads the same on every desk and in the rep app. */
export function Initials({ rep, size = 28, className }: { rep: Pick<Rep, "name" | "initials"> | undefined; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0", className)} aria-hidden>
      <Who name={rep?.name} size={size} />
    </span>
  );
}

/** The micro label (10px caps) — a caption inside a block. */
export function Micro({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn(LABEL, "m-0", className)}>{children}</p>;
}

/** A record band: a 12px title, an aside on the right, one hairline beneath (the anatomy of `sales/record` Block). */
export function Block({ title, aside, children, className }: { title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("border-b border-bz-line-soft px-5 py-4", className)}>
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h3>
        {aside && <div className="ml-auto text-[11px] text-bz-text-soft">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/** "Order ✓  Stock ✓  Photo –" — what the visit asked for and what was done. */
export function Ticks({ acts, className }: { acts: ActResult[]; className?: string }) {
  if (!acts.length) return null;
  return (
    <span className={cn("flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px]", className)}>
      {acts.map((a, i) => (
        <span key={`${a.activityId}-${i}`} className={cn("whitespace-nowrap", a.done ? "text-bz-text-muted" : "text-bz-text-soft")} title={a.required ? "Required" : "Optional"}>
          {actShort(a.activityId)}
          <span className={cn("ml-1", a.done ? "text-bz-pos-deep" : a.required ? "text-bz-red" : "text-bz-text-soft")}>{a.done ? "✓" : "–"}</span>
        </span>
      ))}
    </span>
  );
}

/** The mark on a day's timeline, in the Chip's dot tones: leaf = done, lime = here now, amber = skipped, hollow = not yet. */
export function VisitMark({ status, size = 10 }: { status: OutletStatus; size?: number }) {
  const cls = {
    done: "border-bz-leaf-deep bg-bz-leaf-deep",
    "in-progress": "border-bz-leaf-deep bg-bz-fire",
    skipped: "border-bz-amber bg-bz-amber",
    "to-visit": "border-bz-line bg-bz-surface",
  }[status];
  return <span title={OUTLET_STATUS[status].label} className={cn("inline-block shrink-0 rounded-bz-pill border", cls)} style={{ width: size, height: size }} />;
}

/** A visit's state as the one status mark. */
export function VisitChip({ status }: { status: OutletStatus }) {
  const st = OUTLET_STATUS[status];
  return <Chip tone={chipTone(st.tone)}>{st.label}</Chip>;
}

/** A rep's day as the one status mark. */
export function DayChip({ status }: { status: DayStatus }) {
  const st = DAY_STATUS[status];
  return <Chip tone={chipTone(st.tone)}>{st.label}</Chip>;
}

/** A thin horizontal read: label and figure on one line, a 4px meter beneath. No chart library. */
export function BarLine({ label, figure, pct, sub, tone = "good" }: { label: React.ReactNode; figure: React.ReactNode; pct: number; sub?: React.ReactNode; tone?: "good" | "warn" | "danger" }) {
  return (
    <div>
      <span className="mb-1.5 flex items-baseline justify-between gap-3 text-[12px]">
        <span className="min-w-0 truncate text-bz-text">{label}</span>
        <span className={cn("shrink-0 text-[11.5px] text-bz-text-muted", NUM)}>{figure}</span>
      </span>
      <span className="block h-1 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
        <span className={cn("block h-full rounded-bz-pill transition-[width] duration-200", tone === "danger" ? "bg-bz-red-mark" : tone === "warn" ? "bg-bz-amber" : "bg-bz-leaf-deep")} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </span>
      {sub && <span className="mt-1 block text-[10.5px] text-bz-text-soft">{sub}</span>}
    </div>
  );
}

/** "New …" at the foot of a picker — the glyph rides inside the label (bzw MenuItem types its icon narrower than lucide's). */
export function AddMenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <MenuItem onClick={onClick}>
      <span className="inline-flex items-center gap-2">
        <Plus size={13} className="shrink-0 text-bz-text-muted" />
        {children}
      </span>
    </MenuItem>
  );
}
