import * as React from "react";
import { Check, Search, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, GHOST, INPUT, LABEL, NUM, PLAIN_BTN, Portal, TEXTAREA } from "../sales/bzw";
import { dayTime } from "../salesforce/engine";
import { useStore } from "../sales/store";
import { STEPS, addNote, notesStore } from "./portal";
import type { Stage } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// DEALER PORTAL · KIT — the portal's own pieces, built on the bzw tokens
//
// Dealers are not ERP users: controls are 40px tall, one lime commit per
// surface, words over codes. The salesforce quiet kit (ui.tsx) is reused for
// figures, rows, dots and money; what is here is what a shop owner needs that
// the company side does not — a qty stepper, a bottom sheet, an order tracker.
// ════════════════════════════════════════════════════════════════════════════

/** The one commit on a surface — lime in both themes (the portal is the tenant's brand, not the ERP). */
export const LIME = cn(BTN, "h-10 bg-bz-fire px-4 text-[12.5px] text-bz-olive hover:opacity-90");
export const LIME_LG = cn(LIME, "h-11 px-5 text-[13px]");
export const SOFT = cn(GHOST, "h-10 px-3.5 text-[12.5px]");

export function PageHead({ title, sub, actions }: { title: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end gap-x-6 gap-y-4">
      <div className="min-w-0 flex-1">
        <h1 className="m-0 text-[17px] font-semibold tracking-tight text-bz-text">{title}</h1>
        {sub && <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-bz-text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** − qty + at touch size. Zero shows as a plain "Add". */
export function QtyStepper({ value, onChange, unit, compact }: { value: number; onChange: (v: number) => void; unit?: string; compact?: boolean }) {
  if (value <= 0)
    return (
      <button type="button" onClick={() => onChange(1)} className={cn(SOFT, compact ? "w-[104px]" : "w-[120px]")}>
        Add
      </button>
    );
  return (
    <span className={cn("inline-flex h-10 items-stretch overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface focus-within:border-bz-text-muted", compact ? "w-[104px]" : "w-[120px]")}>
      <button type="button" onClick={() => onChange(value - 1)} className="w-9 shrink-0 text-[16px] text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" aria-label="One less">
        −
      </button>
      <input
        aria-label={unit ? `Quantity in ${unit}s` : "Quantity"}
        inputMode="numeric"
        onFocus={(e) => e.currentTarget.select()}
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        className={cn("w-full min-w-0 border-0 bg-transparent px-0 text-center text-[13px] font-semibold text-bz-text outline-none", NUM)}
      />
      <button type="button" onClick={() => onChange(value + 1)} className="w-9 shrink-0 text-[16px] text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" aria-label="One more">
        +
      </button>
    </span>
  );
}

/** Pill filters at touch size. */
export function Pills<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cn("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-bz-pill px-4 text-[12.5px] transition-colors md:h-9", on ? "bg-bz-text font-semibold text-bz-surface" : "border border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text")}
          >
            {o.label}
            {o.count !== undefined && o.count > 0 && <span className={cn("text-[11px]", NUM, on ? "opacity-70" : "text-bz-text-soft")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-soft" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(INPUT, "h-10 bg-bz-surface pl-9 pr-9 text-[12.5px]")} />
      {value && (
        <button type="button" onClick={() => onChange("")} className={cn(PLAIN_BTN, "absolute right-3 top-1/2 -translate-y-1/2")} aria-label="Clear search">
          <X size={13} />
        </button>
      )}
    </label>
  );
}

/**
 * A sheet: from the bottom on a phone, from the right on a wider screen. It portals into the portal's frame so
 * it takes the dark tokens with it.
 */
export function Drawer({ open, onClose, eyebrow, title, children, foot }: { open: boolean; onClose: () => void; eyebrow?: React.ReactNode; title: React.ReactNode; children: React.ReactNode; foot?: React.ReactNode }) {
  React.useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("[data-bzw-popover], [data-bzw-dialog]")) return;
      onClose();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[1050] bg-bz-olive-dark/30" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-[1051] flex max-h-[90vh] flex-col rounded-t-bz-xl border-t border-bz-line bg-bz-surface text-bz-text shadow-[var(--bz-shadow-panel)] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[460px] md:rounded-none md:border-l md:border-t-0"
      >
        <span className="mx-auto mt-2 block h-1 w-10 shrink-0 rounded-bz-pill bg-bz-line md:hidden" aria-hidden />
        <header className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-4 md:px-6 md:pt-6">
          <div className="min-w-0 flex-1">
            {eyebrow && <p className={cn(LABEL, "m-0 mb-1")}>{eyebrow}</p>}
            <h2 className="m-0 text-[17px] font-semibold leading-snug tracking-tight text-bz-text">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="-mr-2 flex size-10 shrink-0 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 [scrollbar-width:thin] md:px-6">{children}</div>
        {foot && <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-5 py-3 md:px-6">{foot}</div>}
      </aside>
    </Portal>
  );
}

/** Placed → Approved → Packed → On the way → Delivered. Across on a wide screen, down on a phone. */
export function Tracker({ stage, steps, declined, waiting }: { stage: Stage; steps: (string | null)[]; declined?: boolean; waiting?: boolean }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-0 p-0 md:flex-row">
      {STEPS.map((label, i) => {
        const done = !declined && i <= stage;
        const current = !declined && i === stage;
        const at = steps[i];
        return (
          <li key={label} className="relative flex gap-3 pb-5 last:pb-0 md:flex-1 md:flex-col md:gap-2 md:pb-0">
            {i < STEPS.length - 1 && <span aria-hidden className={cn("absolute left-[11px] top-6 h-[calc(100%-24px)] w-px md:left-6 md:top-[11px] md:h-px md:w-[calc(100%-24px)]", !declined && i < stage ? "bg-bz-pos-deep" : "bg-bz-line")} />}
            <span
              className={cn(
                "relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-bz-pill border text-[10px] font-semibold",
                done && !current && "border-bz-pos-deep bg-bz-pos-deep text-bz-surface",
                current && (waiting ? "border-bz-amber bg-bz-surface text-bz-amber-ink" : "border-bz-text bg-bz-fire text-bz-olive"),
                !done && "border-bz-line bg-bz-surface text-bz-text-soft",
              )}
            >
              {done && !current ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span className="min-w-0 md:pr-3">
              <span className={cn("block text-[12.5px]", done ? "font-semibold text-bz-text" : "text-bz-text-muted")}>{current && waiting ? "Waiting for approval" : label}</span>
              <span className={cn("block text-[11px] text-bz-text-soft", NUM)}>{at && done ? dayTime(at) : " "}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** A thin stepped line for a list row: how far along an order is. */
export function MiniTrack({ stage, declined }: { stage: Stage; declined?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {STEPS.map((s, i) => (
        <span key={s} className={cn("h-1 w-3.5 rounded-bz-pill", declined ? "bg-bz-red-mark/60" : i <= stage ? "bg-bz-pos-deep" : "bg-bz-line")} />
      ))}
    </span>
  );
}

/**
 * History and Notes at the foot of every record. The app's shared reader (`<bzw-record-history>`) is keyed to
 * employees; a portal user is not one, so this is the dealer's quiet local copy of the same idea.
 */
export function RecordFoot({ recordId, history, stacked }: { recordId: string; history: { when: string; who: string; what: string }[]; /** One column — inside a sheet. */ stacked?: boolean }) {
  const notes = useStore(notesStore)[recordId] ?? [];
  const [draft, setDraft] = React.useState("");
  const sorted = [...history].sort((a, b) => b.when.localeCompare(a.when));
  return (
    <div className={cn("grid gap-10 border-t border-bz-line-soft", stacked ? "mt-8 pt-6" : "mt-12 pt-8 md:grid-cols-2")}>
      <section>
        <h2 className="m-0 mb-3 text-[13px] font-semibold text-bz-text">History</h2>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {sorted.map((h, i) => (
            <li key={i} className="flex gap-2.5 text-[11.5px]">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-bz-pill bg-bz-line" />
              <span className="min-w-0 flex-1 text-bz-text-muted">
                <span className="font-medium text-bz-text">{h.who}</span> {h.what}
                <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{dayTime(h.when)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="m-0 mb-3 text-[13px] font-semibold text-bz-text">
          Notes {notes.length > 0 && <span className={cn("ml-1 text-[11.5px] font-normal text-bz-text-soft", NUM)}>{notes.length}</span>}
        </h2>
        {notes.length === 0 && <p className="m-0 mb-3 text-[11.5px] text-bz-text-soft">No notes yet. Bizak Nepal sees what you write here.</p>}
        <ol className="m-0 mb-3 flex list-none flex-col gap-3 p-0">
          {notes.map((n) => (
            <li key={n.id} className="text-[12px]">
              <span className="text-[11px] text-bz-text-soft">
                <span className="font-semibold text-bz-text">{n.who}</span> · {dayTime(n.when)}
              </span>
              <p className="m-0 mt-0.5 whitespace-pre-wrap leading-relaxed text-bz-text">{n.body}</p>
            </li>
          ))}
        </ol>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a note for Bizak Nepal" className={cn(TEXTAREA, "min-h-[64px] bg-bz-surface")} aria-label="New note" />
        <button
          type="button"
          disabled={!draft.trim()}
          onClick={() => {
            addNote(recordId, draft.trim());
            setDraft("");
          }}
          className={cn(SOFT, "mt-2")}
        >
          Add note
        </button>
      </section>
    </div>
  );
}

/** A dashed "add photos" stand-in — the prototype keeps a count, not files. */
export function PhotoSlot({ count, onAdd, onClear, label = "Add photos" }: { count: number; onAdd: () => void; onClear: () => void; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="flex size-14 items-center justify-center rounded-bz-md bg-bz-paper-warm text-[10px] text-bz-text-soft">
          Photo {i + 1}
        </span>
      ))}
      <button type="button" onClick={onAdd} className="flex h-14 items-center justify-center rounded-bz-md border border-dashed border-bz-line px-4 text-[12px] text-bz-text-muted hover:border-bz-text-soft hover:text-bz-text">
        {label}
      </button>
      {count > 0 && (
        <button type="button" onClick={onClear} className="text-[11px] text-bz-text-soft underline underline-offset-2 hover:text-bz-text">
          Remove all
        </button>
      )}
    </div>
  );
}
