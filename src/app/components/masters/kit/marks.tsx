import * as React from "react";
import { Check, Copy, Lock as LockGlyph, Pencil, RotateCcw, TriangleAlert } from "lucide-react";
import { cn } from "../../ui/utils";
import { GHOST_SM, MenuItem, MenuLabel, NUM, PLAIN_BTN, Popover } from "../../sales/bzw";

// ════════════════════════════════════════════════════════════════════════════
// MARKS — the small adornments every master surface shares (spec §6.3 #9-12, 15)
//
//   Lock       a field that can't change, and why — a read face, never a
//              disabled control (D-8: "Locked · this item has stock movements.")
//   Source     where a value the user did not type came from; ↺ on an override;
//              "Not set — invoices will refuse" + "Use default: X" when missing
//   Usage      a count that is a door; "Not used" at 0
//   CopyText   a code with ⧉ on hover; click copies; a tick for 1.2 s
//   LineOffer  "Use on this line": one sentence, the new value first
//   Failed     "couldn't load" — never the same picture as "nothing matched"
// ════════════════════════════════════════════════════════════════════════════

/** `.bzw-link` — an inline text link inside prose; takes the size of the text around it. */
export const LINK =
  "inline border-0 bg-transparent p-0 font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-bz-fire";

export const LOCKED_BY_MOVEMENT = "Locked · this item has stock movements.";

/**
 * A value that can't change here. With children it is the field's read face plus the glyph and the
 * one soft line under it; `compact` is the glyph alone (the reason in its title) for a tight line.
 */
export function Lock({ children, reason = LOCKED_BY_MOVEMENT, compact, className }: { children?: React.ReactNode; reason?: string; compact?: boolean; className?: string }) {
  if (compact)
    return (
      <span className={cn("inline-flex items-center gap-1 text-bz-text", className)} title={reason}>
        {children}
        <LockGlyph size={11} className="shrink-0 text-bz-text-soft" aria-label={reason} />
      </span>
    );
  return (
    <div className={cn("min-w-0", className)}>
      {children !== undefined && (
        <div className="flex min-h-8 items-center gap-1.5 text-[12.5px] text-bz-text">
          <span className="min-w-0 truncate">{children}</span>
          <LockGlyph size={11} className="shrink-0 text-bz-text-soft" aria-hidden />
        </div>
      )}
      <p className={cn("m-0 flex items-center gap-1 text-[11px] leading-snug text-bz-text-soft", children === undefined && "min-h-8")}>
        {children === undefined && <LockGlyph size={11} className="shrink-0" aria-hidden />}
        {reason}
      </p>
    </div>
  );
}

export type SourceProps =
  /** A value the record did not type: "from template", "from Preference Setup", "item price". */
  | { kind: "inherited"; from: string; className?: string }
  /** The record overrides what it would inherit: ↺ puts the inherited value back. */
  | { kind: "override"; resetLabel: string; onReset: () => void; className?: string; /** -1 inside a grid, which owns one Tab stop. */ tabIndex?: number }
  /** Nothing set where posting needs something. */
  | { kind: "missing"; text?: string; useDefault?: { label: string; onUse: () => void }; className?: string };

export function Source(p: SourceProps) {
  if (p.kind === "inherited") return <span className={cn("whitespace-nowrap text-[11px] text-bz-text-soft", p.className)}>{p.from}</span>;
  if (p.kind === "override")
    return (
      <button
        type="button"
        tabIndex={p.tabIndex}
        onClick={(e) => (e.stopPropagation(), p.onReset())}
        title={p.resetLabel}
        aria-label={p.resetLabel}
        className={cn(PLAIN_BTN, "mx-1 text-bz-text-muted", p.className)}
      >
        <RotateCcw size={11} />
      </button>
    );
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] leading-snug", p.className)}>
      <span className="font-medium text-bz-red">{p.text ?? "Not set — invoices will refuse"}</span>
      {p.useDefault && (
        <button type="button" onClick={p.useDefault.onUse} className={LINK}>
          Use default: {p.useDefault.label}
        </button>
      )}
    </span>
  );
}

export type UsageCount = { label: string; count: number; onOpen?: () => void };

/** A usage count that is a door to what uses the record. "Not used" at 0 — a 0 that can't be opened is not a button. */
export function Usage({ counts, className, noun = "documents", tabIndex }: { counts: UsageCount[]; className?: string; noun?: string; /** -1 inside a grid, which owns one Tab stop. */ tabIndex?: number }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const total = counts.reduce((s, c) => s + c.count, 0);
  if (total === 0) return <span className={cn("text-[11.5px] text-bz-text-soft", className)}>Not used</span>;
  const shown = counts.filter((c) => c.count > 0);
  return (
    <>
      <button
        ref={ref}
        type="button"
        tabIndex={tabIndex}
        onClick={(e) => (e.stopPropagation(), setOpen(true))}
        title={shown.map((c) => `${c.label} ${c.count}`).join(" · ")}
        className={cn(
          "-mx-1 inline-flex items-center rounded-bz-sm px-1 py-0.5 text-[12px] font-medium text-bz-text underline decoration-bz-line underline-offset-2 hover:bg-bz-paper-warm hover:decoration-bz-text-soft focus-visible:outline-2 focus-visible:outline-bz-fire",
          NUM,
          className,
        )}
      >
        {total.toLocaleString("en-US")}
      </button>
      <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} align="right" width={240}>
        <MenuLabel>
          Used by {total.toLocaleString("en-US")} {noun}
        </MenuLabel>
        {shown.map((c) =>
          c.onOpen ? (
            <MenuItem key={c.label} onClick={() => (setOpen(false), c.onOpen?.())}>
              <span className="flex items-center justify-between gap-3">
                {c.label}
                <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>{c.count.toLocaleString("en-US")}</span>
              </span>
            </MenuItem>
          ) : (
            // No list to open for this table: a plain line, not a greyed-out button that looks broken.
            <p key={c.label} className="m-0 flex items-center justify-between gap-3 px-2 py-1.5 text-[12.5px] text-bz-text">
              {c.label}
              <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>{c.count.toLocaleString("en-US")}</span>
            </p>
          ),
        )}
      </Popover>
    </>
  );
}

/** A code, SKU or barcode: ⧉ on hover, a click copies, the glyph ticks for 1.2 s. */
export function CopyText({ text, className, onCopied }: { text: string; className?: string; onCopied?: () => void }) {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setDone(false), 1200);
    return () => window.clearTimeout(id);
  }, [done]);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        onCopied?.();
      }}
      title={`Copy ${text}`}
      className={cn("group/copy relative -mx-1 inline-flex max-w-full items-center rounded-bz-sm px-1 text-left hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire", NUM, className)}
    >
      <span className="min-w-0 truncate">{text}</span>
      {/* The glyph sits outside the text's box, so a code in a sentence or a meta line keeps its spacing. */}
      {done ? (
        <Check size={11} className="absolute left-full top-1/2 -translate-y-1/2 text-bz-pos-deep" aria-hidden />
      ) : (
        <Copy size={11} className="absolute left-full top-1/2 -translate-y-1/2 text-bz-text-soft opacity-0 transition-opacity group-hover/copy:opacity-100 group-focus-visible/copy:opacity-100" aria-hidden />
      )}
      <span aria-live="polite" className="sr-only">
        {done ? "Copied" : ""}
      </span>
    </button>
  );
}

/**
 * A master changed after a line quoted it — offered, never written into the line. The new value
 * is the first button. One offer per line; the host drops it on either choice or an edit.
 */
export function LineOffer({ text, use, keep, className }: { text: React.ReactNode; use: { label: string; onClick: () => void }; keep: { label: string; onClick: () => void }; className?: string }) {
  return (
    <div role="status" className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-bz-md bg-bz-paper-warm px-2.5 py-1.5 text-[11.5px] text-bz-text-muted", className)}>
      <span className={cn("min-w-0 flex-1", NUM)}>{text}</span>
      <span className="flex shrink-0 items-center gap-1.5">
        <button type="button" className={cn(GHOST_SM, "h-7", NUM)} onClick={use.onClick}>
          {use.label}
        </button>
        <button type="button" className={cn(GHOST_SM, "h-7", NUM)} onClick={keep.onClick}>
          {keep.label}
        </button>
      </span>
    </div>
  );
}

/**
 * `<bzw-edit-trigger>` (already in the app): the pencil beside a master a document quotes — it opens
 * that master's sheet. `reveal` hides it until its row (a `group`) is hovered or holds focus; a touch
 * screen always shows it. The glyph is 12px in a 24px hit area.
 */
export function EditTrigger({ label, onEdit, reveal, className }: { label: string; onEdit: (anchor: HTMLButtonElement) => void; reveal?: boolean; className?: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => (e.stopPropagation(), onEdit(e.currentTarget))}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-bz-sm border-0 bg-transparent p-0 text-bz-text-soft transition-opacity hover:bg-bz-paper-warm hover:text-bz-text focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-bz-fire",
        reveal && "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100",
        className,
      )}
    >
      <Pencil size={12} aria-hidden />
    </button>
  );
}

/** `.bzw-failed` — a read that did not come back: one sentence + Retry. `compact` inside a card or block. */
export function Failed({ text, onRetry, compact, className }: { text: string; onRetry?: () => void; compact?: boolean; className?: string }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-2 text-center", compact ? "p-4" : "px-4 py-8", className)}>
      <span className={cn("flex items-center justify-center rounded-bz-pill bg-bz-red-soft text-bz-red", compact ? "size-7" : "size-9")}>
        <TriangleAlert size={compact ? 13 : 15} />
      </span>
      <p className="m-0 text-[12.5px] font-medium text-bz-text">{text}</p>
      {onRetry && <Retry onClick={onRetry} />}
    </div>
  );
}

/** `.bzw-retry` — retry the one read that failed, where it failed. */
export function Retry({ onClick, label = "Retry" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-bz-sm bg-bz-red-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-bz-red transition-opacity hover:opacity-85 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-bz-fire"
    >
      {label}
    </button>
  );
}
