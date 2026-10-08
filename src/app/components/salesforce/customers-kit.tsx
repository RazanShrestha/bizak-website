import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../ui/utils";
import { GHOST, ICON_BTN } from "../sales/bzw";

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMERS MODULE · the few parts its three desks share
//
// Everything here is arrangement of bzw atoms: the "not available" state of a
// deep link, and the hairline list a record panel uses inside a Block or a
// Section (the lines-table wrapper and row, without the lines).
// ════════════════════════════════════════════════════════════════════════════

/** A link to a record that is gone (deleted, or a typo) — the desk's sentence, drawn as `masters/items` draws it. */
export function NotAvailable({ text, back, onBack }: { text: string; back: string; onBack: () => void }) {
  return (
    <div className="absolute inset-y-0 right-0 z-50 flex w-full max-w-[720px] flex-col border-l border-bz-line bg-bz-surface shadow-[var(--bz-shadow-panel)]">
      <div className="flex justify-end px-3 pt-3">
        <button type="button" className={ICON_BTN} onClick={onBack} title="Close (Esc)" aria-label="Close">
          <X size={15} />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-16 text-center">
        <p className="m-0 text-[13px] font-semibold text-bz-text">{text}</p>
        <button type="button" className={GHOST} onClick={onBack}>
          {back}
        </button>
      </div>
    </div>
  );
}

/** Ids deleted on this screen a moment ago: the desk closes on them instead of calling them "not available". */
const removed = new Set<string>();
export const markRemoved = (id: string) => void removed.add(id);
export const wasRemoved = (id: string | undefined) => !!id && removed.has(id);

/** The bordered box a panel list sits in — the record's lines-table wrapper. */
export function Rows({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-bz-md border border-bz-line-soft", className)}>{children}</div>;
}

/** One line of a panel list; `ROW_LINK` when the whole line opens something. */
export const ROW = "flex w-full min-w-0 items-center gap-3 border-b border-bz-line-soft px-3 py-2 text-left text-[12px] last:border-0";
export const ROW_LINK = cn(ROW, "transition-colors hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire");
/** The second, quieter line of a row or a cell. */
export const SUB = "block truncate text-[10.5px] text-bz-text-soft";
/** One-sentence empty state inside a Block or Section. */
export const NOTE = "m-0 text-[11.5px] text-bz-text-soft";
/** A quiet text link beside a block head or under a list. */
export const QUIET_LINK = "shrink-0 text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text";
