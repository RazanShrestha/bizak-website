import * as React from "react";
import { ChevronUp, MoreHorizontal, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, ICON_BTN, MenuItem, NUM, Popover } from "../sales/bzw";
import type { useToast } from "../sales/bzw";
import { useKeys } from "../sales/orders";
import { HEAD_BTN } from "./fx";
import { FxSheet } from "./fx-table";
import { playbooksStore, typesStore } from "./store";
import { sfPath } from "./sf";

// ════════════════════════════════════════════════════════════════════════════
// SALES SETUP · what its five places share
//
// Setup is an area of Sales force like any other: `SfShell` frames it, the gear
// in the top bar and the title's chevron move between its places. Two of them
// are lists of records (customer types, playbooks) — a roomy table, and the
// record as a FORM in the floating sheet. Three are settings (modules, the
// dealer portal, prototype data) — panels of 52px rows. The parts here are the
// form's: the sheet's frame, a titled group, a field, a choice, a setting row,
// and the glass bar that holds staged changes.
//
// A type follows ONE playbook. The link is stored twice in the seed
// (CustomerType.playbookId and Playbook.forTypeIds), so every write goes
// through `linkPlaybook` and the two can never disagree.
// ════════════════════════════════════════════════════════════════════════════

export type SetupKind = "types" | "playbooks" | "modules" | "portal" | "data";
export const SETUP_KINDS: SetupKind[] = ["types", "playbooks", "modules", "portal", "data"];
export const isSetupKind = (k: string | undefined): k is SetupKind => SETUP_KINDS.includes(k as SetupKind);

/** `setup/:kind[/:no]` — `no` is a record's id, or "new". */
export const setupPath = (kind: SetupKind, no?: string | null) => sfPath(`setup/${kind}${no ? `/${encodeURIComponent(no)}` : ""}`);

export type Toast = ReturnType<typeof useToast>["show"];
/** What the page hands a list place: the record open in the address, and how to open another (null closes). */
export type ListPlaceProps = { openId: string | null; open: (id: string | null) => void };

/** Put `typeIds` on playbook `pbId` (or on none), taking them off any other playbook. */
export function linkPlaybook(typeIds: string[], pbId: string | null) {
  playbooksStore.set((ps) =>
    ps.map((p) => {
      const rest = p.forTypeIds.filter((t) => !typeIds.includes(t));
      return p.id === pbId ? { ...p, forTypeIds: [...rest, ...typeIds] } : rest.length === p.forTypeIds.length ? p : { ...p, forTypeIds: rest };
    }),
  );
  typesStore.set((ts) => ts.map((t) => (typeIds.includes(t.id) ? { ...t, playbookId: pbId } : t)));
}

/** A menu or a dialog is up: the page's keys are not for it. */
export const overlayUp = () => !!document.querySelector("[data-bzw-dialog], [data-bzw-popover]");

// ── The form sheet ──────────────────────────────────────────────────────────

/**
 * A record as a form, in the floating sheet: a title row (the name, ⋯, ✕), the groups, and a foot with the one
 * commit. Unsaved work makes the sheet modal, and closing it then asks first — in the foot, not in a dialog.
 * Without `onSave` it is a reader (a record that is gone) and has no foot.
 */
export function FormSheet({
  label,
  title,
  lead,
  meta,
  menu,
  dirty = false,
  fresh,
  onSave,
  onClose,
  children,
}: {
  label: string;
  title: React.ReactNode;
  /** The record's mark, before its name. */
  lead?: React.ReactNode;
  /** One quiet line under the name. */
  meta?: React.ReactNode;
  menu?: (close: () => void) => React.ReactNode;
  dirty?: boolean;
  /** A record not saved yet: Save is offered before anything is typed. */
  fresh?: boolean;
  onSave?: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [asking, setAsking] = React.useState(false);
  const can = !!fresh || dirty;
  React.useEffect(() => {
    if (!dirty) setAsking(false);
  }, [dirty]);
  const tryClose = () => (dirty ? setAsking(true) : onClose());
  const commit = (e: KeyboardEvent) => {
    if (!onSave) return;
    e.preventDefault();
    if (can && !overlayUp()) onSave();
  };
  useKeys({
    "mod+s": commit,
    "mod+enter": commit,
    // The sheet itself answers Esc while nothing is unsaved; with unsaved work Esc asks instead of closing.
    escape: (e) => {
      if (!dirty || overlayUp() || (e.target as Element | null)?.closest?.("[data-bzw-editing]")) return;
      setAsking((v) => !v);
    },
  });

  return (
    <FxSheet onClose={onClose} guard={dirty} label={label}>
      <section className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-start gap-3 border-b border-bz-line-soft px-5 pb-4 pt-2.5 max-md:pt-4">
          {lead && <span className="mt-[6px] shrink-0">{lead}</span>}
          <div className="min-w-0 flex-1">
            <h2 className="m-0 truncate text-[17px] font-semibold leading-snug tracking-tight text-bz-text">{title}</h2>
            {meta && <div className={cn("mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-bz-text-muted", NUM)}>{meta}</div>}
          </div>
          <div className="-mr-1.5 -mt-1 flex shrink-0 items-center gap-0.5">
            {menu && (
              <button ref={moreRef} type="button" className={ICON_BTN} onClick={() => setMoreOpen(true)} title="More" aria-label="More" aria-haspopup="menu" aria-expanded={moreOpen}>
                <MoreHorizontal size={15} />
              </button>
            )}
            <button type="button" className={ICON_BTN} onClick={tryClose} title="Close (Esc)" aria-label="Close">
              <X size={15} />
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">{children}</div>
        {onSave && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
            {asking ? (
              <>
                <span className="mr-auto text-[13px] font-semibold text-bz-text">Discard changes?</span>
                <button type="button" className={HEAD_BTN} onClick={() => setAsking(false)}>
                  Keep editing
                </button>
                <button type="button" className={HEAD_BTN} onClick={onClose}>
                  Discard
                </button>
              </>
            ) : (
              <>
                {dirty && <span className="mr-auto text-[12px] text-bz-text-soft">Unsaved changes</span>}
                <button type="button" className={HEAD_BTN} onClick={tryClose}>
                  {can ? "Cancel" : "Close"}
                </button>
                <button type="button" className={cn(BTN, "min-w-[76px]")} disabled={!can} onClick={onSave} title="Save (Ctrl S)">
                  Save
                </button>
              </>
            )}
          </footer>
        )}
      </section>
      {menu && (
        <Popover open={moreOpen} anchor={moreRef.current} onClose={() => setMoreOpen(false)} align="right" width={200}>
          {menu(() => setMoreOpen(false))}
        </Popover>
      )}
    </FxSheet>
  );
}

/** The groups of a form, with air between them. */
export const GROUPS = "flex flex-col gap-8 px-5 pb-7 pt-5";
/** Two fields side by side; one below 640px. */
export const FIELDS = "grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2";

/** A short titled group of fields. */
export function Group({ title, count, right, children }: { title: React.ReactNode; count?: number; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <header className="mb-2.5 flex min-h-6 items-center gap-2">
        <h3 className="m-0 text-[13px] font-semibold text-bz-text">{title}</h3>
        {count !== undefined && count > 0 && <span className={cn("text-[12px] text-bz-text-soft", NUM)}>{count}</span>}
        {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
      </header>
      {children}
    </section>
  );
}

/** A value differs from what is saved. */
export function ChangedDot() {
  return <span title="Changed, not saved yet" className="size-1.5 shrink-0 rounded-bz-pill bg-[var(--fx-accent)]" />;
}

/**
 * A field: its 12px label over a 36px control. Not a <label> — a group of buttons inside one would be pressed by a
 * click on the words — so the control names itself with `aria-label`. `field` is the key `goToField` finds it by.
 */
export function FField({
  label,
  required,
  changed,
  error,
  aside,
  title,
  field,
  className,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  changed?: boolean;
  error?: string | null;
  /** At the label's right — a counter. */
  aside?: React.ReactNode;
  title?: string;
  field?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-field={field} className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span title={title} className="flex min-h-[18px] flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] font-medium text-bz-text-muted">
        <span>
          {label}
          {required && <span className="ml-0.5 text-bz-red">*</span>}
        </span>
        {changed && <ChangedDot />}
        {aside && <span className={cn("ml-auto whitespace-nowrap font-normal text-bz-text-soft", NUM)}>{aside}</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="text-[11.5px] leading-snug text-bz-red">
          {error}
        </span>
      )}
    </div>
  );
}

/** One of a few, as pills in a quiet tray — the form's own `PillTabs`, 36px like a field. */
export function Choice<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; title?: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full items-center gap-0.5 self-start overflow-x-auto rounded-[10px] border border-bz-line-soft bg-bz-paper-warm p-[3px] [scrollbar-width:none]">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-[7px] px-3 text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:outline-bz-fire",
              on ? "bg-bz-surface font-semibold text-bz-text shadow-[inset_0_0_0_1px_var(--bz-line)]" : "font-medium text-bz-text-muted hover:text-bz-text",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A setting as a row of a panel: what it is at the left (with, at most, one quiet line under it), its control at
 * the right. 52px; a hairline above, so a run of them reads as a list under the panel's title.
 */
export function SettingRow({
  label,
  sub,
  title,
  changed,
  quiet,
  field,
  children,
}: {
  label: React.ReactNode;
  sub?: React.ReactNode;
  title?: string;
  changed?: boolean;
  /** The setting is off or out of reach: its name steps back. */
  quiet?: boolean;
  field?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-field={field} title={title} className="flex min-h-[52px] items-center gap-4 border-t border-bz-line-soft px-4 py-2">
      <span className="min-w-0 flex-1">
        <span className={cn("flex items-center gap-1.5 text-[13px]", quiet ? "text-bz-text-muted" : "text-bz-text")}>
          <span className="min-w-0">{label}</span>
          {changed && <ChangedDot />}
        </span>
        {sub && <span className="mt-0.5 block text-[11.5px] leading-snug text-bz-text-soft">{sub}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-3">{children}</span>
    </div>
  );
}

/** Bring a field into view and put the cursor in it — a refusal's field, a staged change. */
export function goToField(field: string) {
  const el = document.querySelector<HTMLElement>(`[data-field="${field}"]`);
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  el.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
}

export type StagedChange = { key: string; label: string; field: string };

/**
 * Settings that are staged, not saved as they are touched: a glass bar floats at the bottom of the page while
 * something differs from what is saved. The count opens the list of what changed; each goes to its field.
 * Place it in the page's own `relative` body, as `FxBulk` is.
 */
export function SaveBar({ changes, onSave, onDiscard }: { changes: StagedChange[]; onSave: () => void; onDiscard: () => void }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const n = changes.length;
  if (n === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div role="toolbar" aria-label="Unsaved changes" className="pointer-events-auto flex max-w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] border border-bz-line-soft bg-[var(--fx-glass)] py-2 pl-2 pr-2 shadow-[var(--bz-shadow-panel)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
        <button
          ref={ref}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="menu"
          aria-expanded={open}
          title="What changed"
          className={cn("inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-bz-md px-2 text-[13px] font-semibold text-bz-text transition-colors hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire", NUM)}
        >
          {n} {n === 1 ? "change" : "changes"}
          <ChevronUp size={13} className={cn("text-bz-text-soft transition-transform", open && "rotate-180")} />
        </button>
        <span aria-hidden className="h-4 w-px bg-bz-line" />
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onDiscard} className="inline-flex h-8 items-center rounded-bz-md px-2.5 text-[12.5px] font-medium text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire">
            Discard
          </button>
          <button type="button" onClick={onSave} title="Save (Ctrl S)" className={cn(BTN, "h-8 px-3 text-[12.5px]")}>
            Save
          </button>
        </div>
      </div>
      <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} width={240}>
        {changes.map((c) => (
          <MenuItem key={c.key} onClick={() => (setOpen(false), goToField(c.field))}>
            {c.label}
          </MenuItem>
        ))}
      </Popover>
    </div>
  );
}
