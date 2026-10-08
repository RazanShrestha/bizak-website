import * as React from "react";
import { Check, Search, Store, X } from "lucide-react";
import { Link } from "react-router";
import { cn } from "../ui/utils";
import { BTN, GHOST, INPUT, LABEL, NUM, PLAIN_BTN, Portal } from "../sales/bzw";
import { dayTime } from "../salesforce/engine";
import type { Evaluation } from "../salesforce/engine";
import { Money, Progress } from "../salesforce/ui";
import { dpPath, forShopMark, useDealer } from "./portal";
import type { DealerOrder, Step } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// DEALER PORTAL · KIT — the portal's own pieces, built on the bzw tokens
//
// Dealers are not ERP users: controls are 40px tall, one lime commit per
// surface, words over codes. The salesforce quiet kit (ui.tsx) is reused for
// figures, rows, dots and money; what is here is what a shop owner needs that
// the company side does not — a qty stepper, a bottom sheet, an order tracker.
// ════════════════════════════════════════════════════════════════════════════

/** The one commit on a surface — bzw's primary (dark on light, lime on dark) at the portal's touch height. */
export const LIME = cn(BTN, "h-10 px-4 text-[12.5px]");
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
    <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
      <div className="inline-flex items-center gap-0.5 rounded-[11px] border border-bz-line-soft bg-bz-paper p-[3px]" role="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] px-3.5 text-[12.5px] transition-colors md:h-8", on ? "bg-bz-paper-warm font-semibold text-bz-text" : "font-medium text-bz-text-muted hover:text-bz-text")}
          >
            {o.label}
            {o.count !== undefined && o.count > 0 && <span className={cn("text-[11px]", NUM, on ? "text-bz-text-muted" : "text-bz-text-soft")}>{o.count}</span>}
          </button>
        );
      })}
      </div>
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

/** Placed → Approved → Delivered. Across on a wide screen, down on a phone. */
export function Tracker({ steps, reached, declined, waiting }: { steps: Step[]; reached: number; declined?: boolean; waiting?: boolean }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-0 p-0 md:flex-row">
      {steps.map((s, i) => {
        const done = !declined && i <= reached;
        const current = !declined && i === reached;
        return (
          <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0 md:flex-1 md:flex-col md:gap-2 md:pb-0">
            {i < steps.length - 1 && <span aria-hidden className={cn("absolute left-[11px] top-6 h-[calc(100%-24px)] w-px md:left-6 md:top-[11px] md:h-px md:w-[calc(100%-24px)]", !declined && i < reached ? "bg-bz-pos-deep" : "bg-bz-line")} />}
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
              <span className={cn("block text-[12.5px]", done ? "font-semibold text-bz-text" : "text-bz-text-muted")}>{current && waiting ? "Waiting for approval" : s.label}</span>
              <span className={cn("block text-[11px] text-bz-text-soft", NUM)}>{s.at && done ? dayTime(s.at) : " "}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** A thin stepped line for a list row: how far along an order is. */
export function MiniTrack({ steps, reached, declined }: { steps: number; reached: number; declined?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: steps }).map((_, i) => (
        <span key={i} className={cn("h-1 w-3.5 rounded-bz-pill", declined ? "bg-bz-red-mark/60" : i <= reached ? "bg-bz-pos-deep" : "bg-bz-line")} />
      ))}
    </span>
  );
}

/** "For Laxmi Store · ordered by your rep Pooja Gurung" on an order our rep took at a shop the dealer serves. */
export function ShopMark({ o, className }: { o: DealerOrder; className?: string }) {
  const text = forShopMark(o);
  if (!text) return null;
  return (
    <span className={cn("flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-bz-text-muted", className)}>
      <Store size={12} className="shrink-0 text-bz-text-soft" aria-hidden />
      <span className="truncate">{text}</span>
    </span>
  );
}

/** "You can spend … / left after this order …" — the engine's credit check for a cart or an estimate, in words. */
export function CreditLine({ ev }: { ev: Evaluation }) {
  const { company } = useDealer();
  const c = ev.credit;
  if (c.limit === null) return <p className="m-0 text-[11.5px] text-bz-text-muted">No credit limit on your account.</p>;
  if (c.limit === 0) return <p className="m-0 text-[11.5px] text-bz-text-muted">Your account is cash only — {company} approves each order.</p>;
  const available = c.available ?? 0;
  const after = c.after ?? 0;
  const used = available > 0 ? (ev.total / available) * 100 : 100;
  return (
    <div>
      <div className={cn("mb-1.5 flex items-baseline justify-between text-[11.5px]", NUM)}>
        <span className="text-bz-text-muted">You can spend</span>
        <Money value={available} className="text-bz-text" />
      </div>
      <Progress pct={used} tone={after < 0 ? "danger" : used > 80 ? "warn" : "good"} />
      <div className={cn("mt-1.5 flex items-baseline justify-between text-[11.5px]", NUM)}>
        <span className="text-bz-text-muted">Left after this order</span>
        <Money value={after} className={after < 0 ? "font-semibold text-bz-red" : "text-bz-text"} />
      </div>
    </div>
  );
}

/** A page this dealer's settings switch off — reached by an old link. */
export function Unavailable({ what }: { what: string }) {
  return (
    <div className="mx-auto max-w-[520px] py-16 text-center">
      <p className="m-0 text-[13px] font-semibold text-bz-text">{what} is not open for your account.</p>
      <p className="m-0 mt-1 text-[12px] text-bz-text-muted">Ask your sales rep if you need it.</p>
      <Link to={dpPath()} className={cn(SOFT, "mt-5")}>
        Back to home
      </Link>
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
