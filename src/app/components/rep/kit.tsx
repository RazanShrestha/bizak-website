import * as React from "react";
import { Check, Lock, Minus, Search, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { INPUT, NUM, PLAIN_BTN, Select } from "../sales/bzw";
import type { SelectOption, Tone } from "../sales/bzw";
import type { HubStatus } from "../salesforce/data";

// ════════════════════════════════════════════════════════════════════════════
// REP APP · KIT — the bzw atoms at phone height
//
// The rep app is used standing in a shop, so every control is at least 40px
// high and a list row at least 48px. The bzw atoms that take a className are
// used as they are with an `h-10` override; the few that fix their own height
// (a menu item, the toolbar search, a Select trigger, Segmented) get a twin
// here that carries the atom's own paint. Nothing here is a new look.
// ════════════════════════════════════════════════════════════════════════════

/** The 20px band gutter of a record panel — the same one SfActivity and SfNoteFoot bring with them. */
export const PAD = "px-5";

/** A list row: full-bleed, at least 48px. */
export const ROW = cn("flex min-h-12 w-full items-center gap-3 py-2.5 text-left", PAD);
/** A row that opens something. The whole row is the target. */
export const ROW_TAP = cn(ROW, "relative bg-bz-surface transition-colors hover:bg-bz-paper-warm active:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire");
/** Rows under one head, separated by hairlines. */
export const ROWS = "m-0 list-none divide-y divide-bz-line-soft border-t border-bz-line-soft p-0";

/** The bar that holds a screen's one primary, within thumb reach. */
export const FOOT = cn("shrink-0 border-t border-bz-line bg-bz-paper pb-[max(12px,env(safe-area-inset-bottom))] pt-3", PAD);

/** A list with its head: the title and count of `Block`, then full-bleed rows. */
export function ListBlock({ title, count, right, children }: { title: string; count?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-bz-line-soft">
      <div className={cn("flex items-center gap-2 pb-2 pt-4", PAD)}>
        <h2 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h2>
        {count !== undefined && <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{count}</span>}
        {right && <div className="ml-auto flex items-center gap-1.5">{right}</div>}
      </div>
      {children}
    </section>
  );
}

/** A record head's meta line: facts separated by the 3px dot. */
export function Meta({ items, className }: { items: React.ReactNode[]; className?: string }) {
  const shown = items.filter(Boolean);
  if (!shown.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-bz-text-muted", className)}>
      {shown.map((m, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden className="size-[3px] shrink-0 rounded-bz-pill bg-bz-line" />}
          {m}
        </React.Fragment>
      ))}
    </div>
  );
}

/** A refusal under its field. */
export function Err({ children }: { children: React.ReactNode }) {
  return (
    <span role="alert" className="text-[10.5px] text-bz-red">
      {children}
    </span>
  );
}

/** One of a few, as rows a thumb can hit. The picked row reads as a picked Select option: lime wash, weight, tick. */
export function ChoiceList<T extends string>({ value, onChange, options, label, invalid }: { value: T | null; onChange: (v: T) => void; options: { value: T; label: React.ReactNode; sub?: React.ReactNode }[]; label: string; invalid?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("overflow-hidden rounded-bz-md border bg-bz-paper", invalid ? "border-bz-red-mark" : "border-bz-line")}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex min-h-11 w-full items-center gap-2 border-b border-bz-line-soft px-3 py-2 text-left text-[12.5px] text-bz-text transition-colors last:border-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire",
              on ? "bg-bz-fire/10 font-semibold" : "hover:bg-bz-paper-warm",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate">{o.label}</span>
              {o.sub && <span className="block truncate text-[11px] font-normal text-bz-text-muted">{o.sub}</span>}
            </span>
            {on && <Check size={13} className="shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

/** bzw `MenuItem` at 40px. */
export function MenuRow({ children, onClick, icon: Icon, hint }: { children: React.ReactNode; onClick: () => void; icon?: LucideIcon; hint?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-10 w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12.5px] text-bz-text transition-colors hover:bg-bz-paper-warm focus-visible:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire"
    >
      {Icon && <Icon size={13} className="shrink-0 text-bz-text-muted" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{children}</span>
        {hint && <span className="mt-px block whitespace-normal text-[11px] leading-snug text-bz-text-muted">{hint}</span>}
      </span>
    </button>
  );
}

/** bzw `Select` dressed as a 40px field (the `Picker` of network-form, one step taller). */
export function PickField({ value, onChange, options, placeholder, ariaLabel, invalid }: { value: string | null; onChange: (v: string) => void; options: SelectOption[]; placeholder: string; ariaLabel?: string; invalid?: boolean }) {
  const picked = options.find((o) => o.value === value);
  return (
    <Select
      trigger="ghost"
      width={320}
      value={value}
      onChange={onChange}
      options={options}
      title={ariaLabel}
      className={cn("h-10 w-full justify-between rounded-bz-md bg-bz-paper px-3 text-[12.5px] font-normal hover:border-bz-text-soft", invalid ? "border-bz-red-mark" : "border-bz-line")}
      label={<span className={picked ? "text-bz-text" : "text-bz-text-soft"}>{picked?.label ?? placeholder}</span>}
    />
  );
}

/** bzw `SearchField` at 40px. */
export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-soft" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={cn(INPUT, "h-10 pl-8 pr-10")} />
      {value && (
        <button type="button" onClick={() => onChange("")} className={cn(PLAIN_BTN, "absolute right-0 top-0 size-10")} aria-label="Clear search" title="Clear search">
          <X size={13} />
        </button>
      )}
    </label>
  );
}

export type StepState = "todo" | "done" | "locked" | "missed" | "left";
const STEP_WORD: Record<StepState, string> = { todo: "To do", done: "Done", locked: "At the shop only", missed: "Required, not done", left: "Not done" };

/**
 * A step's state. Locked is a dashed ring — "not yet" is not "not for you" (bzw B14). `missed` and `left` are what
 * a finished visit shows for a step that was not done.
 */
export function StepMark({ state }: { state: StepState }) {
  return (
    <span
      title={STEP_WORD[state]}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-bz-pill border",
        state === "done" && "border-bz-pos-deep bg-bz-pos-deep text-bz-surface",
        state === "todo" && "border-bz-line bg-bz-surface text-bz-text-muted",
        state === "locked" && "border-dashed border-bz-line text-bz-text-soft",
        state === "missed" && "border-bz-red-mark text-bz-red",
        state === "left" && "border-bz-line text-bz-text-soft",
      )}
    >
      {state === "done" ? <Check size={12} strokeWidth={3} /> : state === "locked" ? <Lock size={10} /> : state === "todo" ? null : <Minus size={11} />}
      <span className="sr-only">{STEP_WORD[state]}</span>
    </span>
  );
}

/** A hub order as its rep reads it — the hub's own labels ("Ready") are the office's words for its queue. */
export const ORDER_STATE: Record<HubStatus, { label: string; tone: Tone }> = {
  review: { label: "In review", tone: "pending" },
  ready: { label: "Waiting for approval", tone: "pending" },
  approved: { label: "Approved", tone: "positive" },
  rejected: { label: "Rejected", tone: "danger" },
};
