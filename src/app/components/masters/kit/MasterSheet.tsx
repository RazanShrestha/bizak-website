import * as React from "react";
import { ArrowUpRight, MoreHorizontal, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, GHOST, ICON_BTN, Kbd, LABEL, Popover, Portal } from "../../sales/bzw";
import { SheetFrame } from "../../sales/FulfilSheet";
import { LINK } from "./marks";
import { mod } from "./util";

// ════════════════════════════════════════════════════════════════════════════
// MASTER SHEET — one right sheet for every master (spec §4.2, §5, §6.3 #6)
//
// The hub opens a tier-2 record in it, the item desk creates in it, and a
// document line jumps into it — the SAME component, so a reader who edits a
// price from an invoice line is on the item's own surface: same head, same
// section names, same save words.
//
//   head     eyebrow ("Item · line 2") · title · meta · chips, then ↗ door,
//            ⋯, and × LAST (bzw trap 32)
//   context  a warm band of the host's read-only facts ("On this invoice")
//   body     sections (the parts `Section` / `Block` grammar)
//   foot     left slot (Archive / the page door) · Cancel · the commit
//
// ⌘↵ commits, ⇧⌘↵ runs the second commit (Create and add another). Esc
// closes — and asks inline first when something is typed.
//
// `docked`: a flex child beside a table (the host places it ≥1280px).
// Otherwise it floats at the right over a 10 % dim that does NOT take the
// pointer, so the document behind stays readable and scrollable (§5.1);
// it portals into the frame, so dark mode reaches it, and it slides in
// with no resting transform (ATOMS §12).
// ════════════════════════════════════════════════════════════════════════════

export type SheetMode = "view" | "edit" | "create" | "use";

const COMMIT: Record<SheetMode, string | null> = { view: null, edit: "Save", create: "Create and open", use: "Create and use" };

export function MasterSheet({
  onClose,
  docked,
  width = 480,
  mode,
  eyebrow,
  title,
  meta,
  chips,
  image,
  door,
  footDoor,
  menu,
  context,
  children,
  footLeft,
  commitLabel,
  onCommit,
  secondary,
  dirty,
  refusal,
  onDismissRefusal,
}: {
  onClose: () => void;
  docked?: boolean;
  /** 480 for a record, 520 for the create sheet. */
  width?: number;
  mode: SheetMode;
  eyebrow?: string;
  title: React.ReactNode;
  meta?: React.ReactNode[];
  chips?: React.ReactNode;
  image?: React.ReactNode;
  /** The record's full page ("Open item page") — always a new tab from a document. */
  door?: { label: string; onOpen: () => void };
  /** Repeat the door as a link at the foot's left (the jump sheet does). */
  footDoor?: boolean;
  menu?: (close: () => void) => React.ReactNode;
  context?: React.ReactNode;
  children: React.ReactNode;
  footLeft?: React.ReactNode;
  commitLabel?: string;
  onCommit?: () => void;
  /** The second commit — "Create and add another" (⇧⌘↵). */
  secondary?: { label: string; run: () => void };
  dirty?: boolean;
  refusal?: string | null;
  onDismissRefusal?: () => void;
}) {
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const selfRef = React.useRef<HTMLElement>(null);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [asking, setAsking] = React.useState(false);
  const label = commitLabel ?? COMMIT[mode];
  const doorLabel = door && (dirty ? `Save and open ${door.label.replace(/^Open /, "")}` : door.label);

  const tryClose = React.useCallback(() => (dirty ? setAsking(true) : onClose()), [dirty, onClose]);
  React.useEffect(() => {
    if (!dirty) setAsking(false);
  }, [dirty]);

  // Esc — bubble phase, so a cell or inline field being edited, a popover or a dialog on top answers first.
  const escRef = React.useRef({ tryClose, asking });
  escRef.current = { tryClose, asking };
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if ((e.target as Element | null)?.closest?.("[data-bzw-editing]") || document.querySelector("[data-bzw-dialog]")) return;
      // Two sheets can be up (a docked hub sheet and a jump sheet over it): only the last one answers.
      const sheets = document.querySelectorAll("[data-bzw-sheet]");
      if (sheets[sheets.length - 1] !== selfRef.current) return;
      e.preventDefault();
      if (escRef.current.asking) return setAsking(false);
      escRef.current.tryClose();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const runDoor = () => {
    if (!door) return;
    if (dirty && onCommit) onCommit();
    door.onOpen();
  };

  const foot = asking ? (
    <>
      <span className="mr-auto text-[12px] font-semibold text-bz-text">Discard changes?</span>
      <button type="button" className={GHOST} onClick={() => setAsking(false)}>
        Keep editing
      </button>
      <button type="button" className={GHOST} onClick={onClose}>
        Discard
      </button>
    </>
  ) : (
    <>
      {footLeft || (footDoor && door) ? (
        <div className="mr-auto flex min-w-0 items-center gap-3">
          {footLeft}
          {footDoor && door && (
            <button type="button" className={cn(LINK, "inline-flex items-center gap-1 text-[12px]")} onClick={runDoor}>
              {doorLabel} <ArrowUpRight size={12} />
            </button>
          )}
        </div>
      ) : (
        <span aria-hidden className="mr-auto max-sm:hidden" />
      )}
      {/* Below 640px the commit takes its own full-width row UNDER the others — wrapped as it came, it
          sat alone at the left of a second line, the one place a thumb does not look for it. */}
      <button type="button" className={cn(GHOST, "max-sm:flex-1")} onClick={tryClose}>
        {label ? "Cancel" : "Close"}
      </button>
      {label && secondary && (
        <button type="button" className={cn(GHOST, "max-sm:flex-1")} onClick={secondary.run} title={`${secondary.label} (⇧${mod("↵")})`}>
          {secondary.label}
        </button>
      )}
      {label && onCommit && (
        <button type="button" className={cn(BTN, "max-sm:w-full")} onClick={onCommit} title={`${label} (${mod("↵")})`}>
          {label}
          <span className="hidden sm:inline-flex">
            <Kbd>{mod("↵")}</Kbd>
          </span>
        </button>
      )}
    </>
  );

  const panel = (
    <section
      ref={selfRef}
      data-bzw-sheet=""
      aria-label={typeof title === "string" ? title : eyebrow}
      className={cn(
        "flex h-full min-h-0 flex-col bg-bz-surface",
        docked ? "shrink-0 border-l border-bz-line" : "pointer-events-auto relative w-full border-l border-bz-line shadow-[var(--bz-shadow-panel)] animate-in slide-in-from-right duration-300",
      )}
      style={docked ? { width } : { maxWidth: width }}
    >
      <header className="shrink-0 border-b border-bz-line-soft px-5 pb-3.5 pt-3">
        <div className="flex items-start gap-3">
          {image && <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-paper-warm text-bz-text-soft">{image}</span>}
          <div className="min-w-0 flex-1">
            {eyebrow && <p className={cn(LABEL, "m-0 mb-0.5")}>{eyebrow}</p>}
            <h2 className="m-0 truncate text-[17px] font-semibold leading-snug tracking-tight text-bz-text">{title}</h2>
            {meta && meta.filter(Boolean).length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-bz-text-muted">
                {meta.filter(Boolean).map((m, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span aria-hidden className="size-[3px] shrink-0 rounded-bz-pill bg-bz-line" />}
                    {m}
                  </React.Fragment>
                ))}
              </div>
            )}
            {chips && <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{chips}</div>}
          </div>
          <div className="-mr-1.5 -mt-0.5 flex shrink-0 items-center gap-0.5">
            {door && (
              <button type="button" className={ICON_BTN} onClick={runDoor} title={`${doorLabel} (new tab)`} aria-label={doorLabel}>
                <ArrowUpRight size={15} />
              </button>
            )}
            {menu && (
              <button ref={moreRef} type="button" className={ICON_BTN} onClick={() => setMoreOpen(true)} title="More" aria-label="More">
                <MoreHorizontal size={15} />
              </button>
            )}
            <button type="button" className={ICON_BTN} onClick={tryClose} title="Close (Esc)" aria-label="Close">
              <X size={15} />
            </button>
          </div>
        </div>
        {menu && (
          <Popover open={moreOpen} anchor={moreRef.current} onClose={() => setMoreOpen(false)} align="right" width={220}>
            {menu(() => setMoreOpen(false))}
          </Popover>
        )}
      </header>
      <SheetFrame
        onCommit={(e) => {
          const sheets = document.querySelectorAll("[data-bzw-sheet]");
          if (asking || !label || sheets[sheets.length - 1] !== selfRef.current) return;
          if (e?.shiftKey) secondary?.run();
          else onCommit?.();
        }}
        refusal={refusal ?? null}
        onDismissRefusal={onDismissRefusal ?? (() => {})}
        foot={foot}
      >
        {context && <div className="border-b border-bz-line-soft bg-bz-paper-warm px-5 py-3 text-[12px] text-bz-text">{context}</div>}
        {children}
      </SheetFrame>
    </section>
  );

  if (docked) return panel;
  return (
    <Portal>
      <div className="pointer-events-none fixed inset-0 z-[1050] flex justify-end">
        <div aria-hidden className="absolute inset-0 bg-bz-olive-dark/10 animate-in fade-in duration-200" />
        {panel}
      </div>
    </Portal>
  );
}

/** The warm context band's lines: "On this invoice" facts, one per line. */
export function SheetContext({ title, rows }: { title: string; rows: React.ReactNode[] }) {
  return (
    <div>
      <p className={cn(LABEL, "m-0 mb-1.5")}>{title}</p>
      <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[12px] text-bz-text">
        {rows.filter(Boolean).map((r, i) => (
          <li key={i} className="min-w-0">
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
