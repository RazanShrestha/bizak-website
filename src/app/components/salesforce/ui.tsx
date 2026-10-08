import * as React from "react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import type { Product } from "./data";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE v2 · QUIET KIT
//
// The v1 screens read as "clogged" (owner, 2026-09-29). These pieces are the
// same bzw tokens spent differently: more space, fewer boxes, one strong line
// per row, colour only where it carries a meaning (DESIGN-DIRECTION.md).
// ════════════════════════════════════════════════════════════════════════════

/** A page's content column. `narrow` for forms and settings, `wide` for overviews, `full` for lists with a panel. */
export function Page({ children, width = "wide", className }: { children: React.ReactNode; width?: "narrow" | "wide" | "full"; className?: string }) {
  return (
    <div className={cn("mx-auto w-full px-4 pb-24 pt-6 md:px-8 md:pt-8", width === "narrow" ? "max-w-[760px]" : width === "wide" ? "max-w-[1160px]" : "", className)}>{children}</div>
  );
}

/** One line under the top bar's title: what this page is for, and its one or two actions. */
export function PageIntro({ children, actions }: { children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end gap-3">
      {children && <p className="m-0 min-w-0 flex-1 text-[12.5px] leading-relaxed text-bz-text-muted">{children}</p>}
      {actions && <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export type Figure = { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "danger" | "good"; onClick?: () => void; title?: string };
/** The page's figures, calm: micro label above, the value below, hairlines between. Never tiles. */
export function Figures({ items, className }: { items: Figure[]; className?: string }) {
  // A divided row needs room for every figure; narrower than that it is a plain grid, so no figure wraps with a
  // divider hanging in front of it.
  return (
    <div className={cn("grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4 lg:flex lg:flex-wrap lg:gap-x-0 lg:gap-y-4", className)}>
      {items.map((f, i) => {
        const body = (
          <>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">{f.label}</span>
            <span className={cn("mt-1.5 block text-[17px] font-semibold tracking-tight", NUM, f.tone === "danger" ? "text-bz-red" : "text-bz-text")}>{f.value}</span>
            {f.sub && <span className="mt-0.5 block text-[11px] text-bz-text-soft">{f.sub}</span>}
          </>
        );
        return (
          <div key={f.label} className={cn("min-w-0 lg:pr-8", i > 0 && "lg:border-l lg:border-bz-line-soft lg:pl-8")} title={f.title}>
            {f.onClick ? (
              <button type="button" onClick={f.onClick} className="block rounded-bz-sm text-left transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bz-fire">
                {body}
              </button>
            ) : (
              body
            )}
          </div>
        );
      })}
    </div>
  );
}

/** A section: a title line with an optional count and one quiet action, then content. Space, not boxes. */
export function Section({ title, count, action, children, className, hint }: { title: string; count?: number; action?: React.ReactNode; children: React.ReactNode; className?: string; hint?: string }) {
  return (
    <section className={cn("mt-10 first:mt-0", className)}>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="m-0 text-[13px] font-semibold text-bz-text">{title}</h2>
        {count !== undefined && <span className={cn("text-[11.5px] text-bz-text-soft", NUM)}>{count}</span>}
        {hint && <span className="text-[11px] text-bz-text-soft">· {hint}</span>}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}

/** A quiet list: rows separated by hairlines, no card around the rows unless `boxed`. */
export function List({ children, boxed, className }: { children: React.ReactNode; boxed?: boolean; className?: string }) {
  return <div className={cn("divide-y divide-bz-line-soft", boxed ? "overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface" : "border-y border-bz-line-soft", className)}>{children}</div>;
}

/**
 * One row: a leading mark, one strong line and one soft line, up to three short meta cells, and a trailing
 * figure. `action` shows on hover only — never a row of buttons.
 */
export function Row({
  lead,
  title,
  sub,
  meta = [],
  trail,
  action,
  onClick,
  active,
  className,
}: {
  lead?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  meta?: React.ReactNode[];
  trail?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => onClick && e.key === "Enter" && e.target === e.currentTarget && onClick()}
      className={cn(
        "group relative flex min-h-[56px] items-center gap-3.5 px-1 py-3 transition-colors",
        onClick && "cursor-pointer hover:bg-bz-paper-warm/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire",
        active && "bg-bz-fire/10",
        className,
      )}
    >
      {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-bz-fire" />}
      {lead && <span className="shrink-0 pl-2">{lead}</span>}
      <span className={cn("min-w-0 flex-1", !lead && "pl-2")}>
        <span className="block truncate text-[12.5px] font-medium text-bz-text">{title}</span>
        {sub && <span className="mt-0.5 block truncate text-[11px] text-bz-text-soft">{sub}</span>}
      </span>
      {meta.map((m, i) => (
        <span key={i} className="hidden shrink-0 text-[11.5px] text-bz-text-muted md:block">
          {m}
        </span>
      ))}
      {trail && <span className={cn("shrink-0 pr-2 text-right text-[12.5px] font-medium text-bz-text", NUM)}>{trail}</span>}
      {action && (
        <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-bz-md bg-bz-surface/95 pl-2 opacity-0 shadow-[-12px_0_12px_var(--bz-surface)] transition-opacity group-hover:flex group-hover:opacity-100 group-focus-within:flex group-focus-within:opacity-100" onClick={(e) => e.stopPropagation()}>
          {action}
        </span>
      )}
    </div>
  );
}

/** Status as a small dot and words — a filled chip is only for the thing that needs action. */
export function Dot({ tone = "neutral", children, className }: { tone?: "good" | "warn" | "danger" | "neutral" | "info" | "off"; children: React.ReactNode; className?: string }) {
  const c = { good: "bg-bz-pos-deep", warn: "bg-bz-amber", danger: "bg-bz-red-mark", neutral: "bg-bz-text-soft", info: "bg-bz-leaf-deep", off: "bg-bz-line" }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-[11.5px]", tone === "danger" ? "text-bz-red" : "text-bz-text-muted", className)}>
      <span className={cn("size-1.5 shrink-0 rounded-bz-pill", c)} />
      {children}
    </span>
  );
}

/** Needs action — the one loud mark. */
export function Flag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-bz-sm bg-bz-red-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-bz-red">{children}</span>;
}

export function Money({ value, className, code = true, sign }: { value: number; className?: string; code?: boolean; sign?: boolean }) {
  return (
    <span className={cn("whitespace-nowrap", NUM, className)}>
      {code && <span className="mr-1 text-[0.78em] font-medium text-bz-text-soft">NPR</span>}
      {sign && value > 0 ? "+" : ""}
      {Math.round(value).toLocaleString("en-US")}
    </span>
  );
}

/** A thin progress line — for budgets, targets and slabs. */
export function Progress({ pct, tone = "good", className }: { pct: number; tone?: "good" | "warn" | "danger"; className?: string }) {
  return (
    <span className={cn("block h-1 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft", className)}>
      <span className={cn("block h-full rounded-bz-pill", tone === "danger" ? "bg-bz-red-mark" : tone === "warn" ? "bg-bz-amber" : "bg-bz-pos-deep")} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </span>
  );
}

/** Identity colour of a customer type or brand (the categorical tokens — never a status). */
export const idColor = (n: number) => `var(--bz-route-${((n - 1) % 8) + 1})`;

export function TypeMark({ name, color, className }: { name: string; color: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-[11.5px] text-bz-text-muted", className)}>
      <span className="size-2 shrink-0 rounded-[3px]" style={{ background: idColor(color) }} />
      {name}
    </span>
  );
}

/** A product's picture stand-in: its brand colour and initials, calm enough to repeat in a grid. */
export function ProductThumb({ product, size = 40 }: { product: Product; size?: number }) {
  const initials = product.brand
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-bz-md text-[11px] font-bold tracking-wide text-bz-text-on-dark"
      style={{ width: size, height: size, background: idColor(product.tone), fontSize: Math.round(size * 0.28) }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/** One line + one action. */
export function EmptyNote({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-10 text-center">
      <p className="m-0 text-[12.5px] text-bz-text-muted">{children}</p>
      {action}
    </div>
  );
}

/** A label/value pair for detail panels — label soft above, value below. */
export function Fact({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">{label}</span>
      <span className="mt-1 block text-[12.5px] text-bz-text">{children}</span>
    </div>
  );
}

/** A right-hand detail panel for any register: docked at ≥ 1280 px, an overlay below. */
export function SidePanel({ open, onClose, eyebrow, title, meta, actions, children, foot, width = 560 }: { open: boolean; onClose: () => void; eyebrow?: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; foot?: React.ReactNode; width?: number }) {
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
    <>
      <div className="absolute inset-0 z-40 bg-bz-olive-dark/20 xl:hidden" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 z-50 flex w-full flex-col border-l border-bz-line bg-bz-surface shadow-[var(--bz-shadow-panel)] xl:relative xl:z-0 xl:shadow-none" style={{ maxWidth: width }}>
        <header className="shrink-0 px-6 pb-4 pt-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {eyebrow && <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">{eyebrow}</p>}
              <h2 className="m-0 text-[17px] font-semibold leading-snug tracking-tight text-bz-text">{title}</h2>
              {meta && <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-bz-text-muted">{meta}</div>}
            </div>
            <div className="-mr-2 flex shrink-0 items-center gap-1">
              {actions}
              <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" aria-label="Close" title="Close (Esc)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 [scrollbar-width:thin]">{children}</div>
        {foot && <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-6 py-3">{foot}</div>}
      </aside>
    </>
  );
}

/** A segmented filter that reads like text: "All · Needs review 3 · Ready 4". */
export function TextTabs<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number; danger?: boolean }[]; className?: string }) {
  return (
    // One line that scrolls sideways: a wrapped or squeezed tab row reads as clutter, on a phone and beside an open panel.
    <div className={cn("flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)} role="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-bz-pill px-3 text-[12px] transition-colors", on ? "bg-bz-text font-semibold text-bz-surface" : "text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text")}
          >
            {o.label}
            {o.count !== undefined && o.count > 0 && <span className={cn("text-[10.5px]", NUM, on ? "opacity-70" : o.danger ? "font-semibold text-bz-red" : "text-bz-text-soft")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
