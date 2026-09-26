import * as React from "react";
import { useBlocker } from "react-router";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Lock, TriangleAlert } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, CARD, Dialog, Field, GHOST, GHOST_SM, ICON_BTN, Kbd, NUM, PANEL, Refusal, Select, Stat, Statline } from "../../sales/bzw";
import { useKeys, useMedia } from "../../sales/orders";
import { mod } from "./util";

// ════════════════════════════════════════════════════════════════════════════
// RECORD PAGE — a master at full width, every section (spec §3.3, §6.3 #2-4)
//
//   head      back · image · name · meta · chips · primary action · ⋯ · ‹ ›;
//             it scrolls away and a slim sticky bar takes its place
//   band      a quiet state band (Archived, Variant of …)
//   facts     one statline, ≤ 6 figures, each a door
//   body      section rail (scroll-spy) · the form · the related column
//   dock      Discard / Save ⌘S, only while something is staged
//
// The page is its own scroller (AppFrame's <main> does not scroll), so every
// sticky piece sticks inside it. Below 1280px the related column folds: its
// first two blocks become a band under the facts, the rest follow the form;
// below 768px the rail becomes a "Jump to section" select.
// ════════════════════════════════════════════════════════════════════════════

export type SectionMark = { kind: "error" } | { kind: "setup" } | { kind: "count"; n: number } | { kind: "empty" } | { kind: "lock" };
export type PageSection = { id: string; label: string; mark?: SectionMark };

const STICKY_BAR = 48;
/** Where a section lands under the slim bar when the rail scrolls to it. */
const SECTION_OFFSET = STICKY_BAR + 16;

// ── Facts ───────────────────────────────────────────────────────────────────

export type Fact = { key: string; label: string; value: React.ReactNode; sub?: React.ReactNode; danger?: boolean; title?: string; onOpen?: () => void };

/** The facts band: the Statline atom, ≤ 6 figures, each a door. While it loads the values are skeleton ink, never a spinner. */
export function Facts({ facts, loading, className }: { facts: Fact[]; loading?: boolean; className?: string }) {
  return (
    <Statline className={className}>
      {facts.slice(0, 6).map((f) => (
        <Stat
          key={f.key}
          label={f.label}
          value={loading ? <span aria-label="Loading" className="inline-block h-2.5 w-10 animate-pulse rounded-bz-pill bg-bz-line-soft align-middle" /> : f.value}
          sub={loading ? undefined : f.sub}
          danger={!loading && f.danger}
          title={f.title}
          onPick={loading ? undefined : f.onOpen}
        />
      ))}
    </Statline>
  );
}

// ── Section nav ─────────────────────────────────────────────────────────────

function Mark({ mark }: { mark?: SectionMark }) {
  if (!mark) return null;
  switch (mark.kind) {
    case "error":
      return <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-red-mark" title="Something here needs fixing" aria-label="needs fixing" />;
    case "setup":
      return <TriangleAlert size={11} className="shrink-0 text-bz-amber" aria-label="needs setup" />;
    case "count":
      return <span className={cn("shrink-0 text-[10.5px] text-bz-text-muted", NUM)}>{mark.n}</span>;
    case "empty":
      return (
        <span className="shrink-0 text-[10.5px] text-bz-text-muted" title="Not set up">
          —
        </span>
      );
    case "lock":
      return <Lock size={10} className="shrink-0 text-bz-text-soft" aria-label="has a locked field" />;
  }
}

/** The rail: one entry per section that applies, the current one a 2px lime bar + weight (never a filled row). */
export function SectionNav({ sections, current, onGo, className }: { sections: PageSection[]; current: string | null; onGo: (id: string) => void; className?: string }) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const [bar, setBar] = React.useState<{ top: number; height: number } | null>(null);
  React.useLayoutEffect(() => {
    const el = current ? listRef.current?.querySelector<HTMLElement>(`[data-sec="${CSS.escape(current)}"]`) : null;
    setBar(el ? { top: el.offsetTop, height: el.offsetHeight } : null);
  }, [current, sections]);
  return (
    <nav aria-label="Sections" className={cn("relative", className)}>
      <span aria-hidden className="absolute left-0 w-0.5 rounded-bz-pill bg-bz-line-soft" style={{ top: 0, bottom: 0 }} />
      {bar && <span aria-hidden className="absolute left-0 w-0.5 rounded-bz-pill bg-bz-fire transition-[top,height] duration-150" style={bar} />}
      <ul ref={listRef} className="m-0 flex list-none flex-col p-0">
        {sections.map((s) => {
          const on = s.id === current;
          return (
            <li key={s.id} data-sec={s.id}>
              <button
                type="button"
                onClick={() => onGo(s.id)}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-bz-sm py-1.5 pl-3.5 pr-2 text-left text-[12px] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire",
                  on ? "font-semibold text-bz-text" : "text-bz-text-muted hover:text-bz-text",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                <Mark mark={s.mark} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ── Sections and fields ─────────────────────────────────────────────────────

/** One section of the form: a card, its 12px heading with its own actions on the right. */
export function RecordSection({
  id,
  title,
  right,
  children,
  collapsible,
  collapsed,
  onToggle,
  className,
}: {
  id: string;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  /** Advanced groups fold; a host remembering the state per user (USER_STATE) passes onToggle. */
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
}) {
  // Controlled when the host remembers the fold (onToggle); otherwise `collapsed` is where it starts.
  const [own, setOwn] = React.useState(!!collapsed);
  const shut = collapsible ? (onToggle ? !!collapsed : own) : false;
  return (
    <section id={id} data-record-section="" className={cn(CARD, "min-w-0", className)} style={{ scrollMarginTop: SECTION_OFFSET }}>
      <div className="flex min-h-11 items-center gap-2 px-5 pb-1 pt-2.5">
        {collapsible ? (
          <button type="button" aria-expanded={!shut} onClick={() => (onToggle ? onToggle(!shut) : setOwn(!shut))} className="-ml-1 inline-flex items-center gap-1.5 rounded-bz-sm px-1 py-0.5 text-left focus-visible:outline-2 focus-visible:outline-bz-fire">
            {shut ? <ChevronRight size={13} className="text-bz-text-soft" /> : <ChevronDown size={13} className="text-bz-text-soft" />}
            <h2 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h2>
          </button>
        ) : (
          <h2 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h2>
        )}
        {right && <div className="ml-auto flex items-center gap-1.5">{right}</div>}
      </div>
      {!shut && <div className="px-5 pb-5 pt-1">{children}</div>}
    </section>
  );
}

/**
 * A staged field on the page: the Field atom's label, an amber dot while it holds an unsaved change,
 * and the refusal right under it (`.bzw-err`). `fieldKey` is what the dock's list scrolls to.
 */
export function PageField({
  label,
  fieldKey,
  dirty,
  error,
  hint,
  required,
  aside,
  children,
  className,
}: {
  label: string;
  fieldKey?: string;
  dirty?: boolean;
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
  /** Beside the label: a Source mark, a field-history clock. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-field={fieldKey} className={cn("min-w-0", className)} style={{ scrollMarginTop: SECTION_OFFSET + 8 }}>
      <Field
        label={
          <span className="inline-flex items-center gap-1.5">
            <span>
              {label}
              {required && <span className="ml-0.5 text-bz-red">*</span>}
            </span>
            {dirty && <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-amber" title="Changed — not saved yet" aria-label="changed" />}
            {aside && <span className="ml-auto font-normal">{aside}</span>}
          </span>
        }
        hint={
          error ? (
            <span role="alert" className="text-bz-red">
              {error}
            </span>
          ) : (
            hint
          )
        }
      >
        {children}
      </Field>
    </div>
  );
}

/** A block of the related column (`.bzw-card--inset`): a card on the 16px gutter. */
export function RelatedBlock({ title, right, children, className }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn(CARD, "min-w-0", className)}>
      <div className="flex min-h-10 items-center gap-2 px-4 pt-2">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h3>
        {right && <div className="ml-auto flex items-center gap-1.5">{right}</div>}
      </div>
      <div className="px-4 pb-4 pt-1 text-[12px] text-bz-text">{children}</div>
    </section>
  );
}

/**
 * Scroll a record page to a field (`PageField fieldKey`) and focus its control — the dock's change
 * list and a refused Save use it. Scrolls the page's own scroller only, never the frame around it.
 */
export function goToField(key: string, within: ParentNode = document) {
  const el = within.querySelector<HTMLElement>(`[data-field="${CSS.escape(key)}"]`);
  const root = el?.closest<HTMLElement>("[data-record-scroller]");
  if (!el || !root) return;
  const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - SECTION_OFFSET - 24;
  root.scrollTo({ top, behavior: "smooth" });
  el.querySelector<HTMLElement>("input, textarea, select, button")?.focus({ preventScroll: true });
}

// ── Save dock ───────────────────────────────────────────────────────────────

export type StagedChange = { key: string; label: string; onGo?: () => void };

/**
 * The one commit of a page, up only while something is staged. ⌘S saves from anywhere on the page —
 * inside a field too; ⌘↵ saves and goes back when the host gives `onSaveAndBack`. Save is never
 * disabled: it refuses and names the field (the host's refusal goes in the dock).
 */
export function SaveDock({
  changes,
  onSave,
  onDiscard,
  onSaveAndBack,
  busy,
  refusal,
  refusalAction,
  onDismissRefusal,
  saveLabel = "Save",
}: {
  changes: StagedChange[];
  onSave: () => void;
  onDiscard: () => void;
  onSaveAndBack?: () => void;
  busy?: boolean;
  /** The server's sentence, verbatim — a 409 conflict stays until it is answered. */
  refusal?: string | null;
  /** The answer beside it — the conflict's "Reload". */
  refusalAction?: { label: string; onClick: () => void };
  onDismissRefusal?: () => void;
  saveLabel?: string;
}) {
  const dirty = changes.length > 0;
  const fns = React.useRef({ onSave, onSaveAndBack, dirty, busy });
  fns.current = { onSave, onSaveAndBack, dirty, busy };
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        // The browser's "save page" is never what a reader on a record page means.
        e.preventDefault();
        if (fns.current.dirty && !fns.current.busy) fns.current.onSave();
      } else if (k === "enter" && fns.current.onSaveAndBack && fns.current.dirty && !fns.current.busy) {
        e.preventDefault();
        fns.current.onSaveAndBack();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);
  if (!dirty && !busy) return null;
  const n = changes.length;
  return (
    <div className="sticky bottom-0 z-30 border-t border-bz-line bg-bz-paper animate-in slide-in-from-bottom-2 fade-in duration-150">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 md:px-6">
        <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-amber" aria-hidden />
        <div className="group/dock relative min-w-0">
          <button type="button" className="rounded-bz-sm px-0.5 text-[12px] font-semibold text-bz-text hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-bz-fire" aria-haspopup="true">
            {busy ? "Saving…" : `${n} unsaved change${n === 1 ? "" : "s"}`}
          </button>
          {/* The list sits on a padded bridge so the pointer can cross from the count to it. */}
          <div className="invisible absolute bottom-full left-0 z-10 pb-2 opacity-0 transition-opacity duration-150 group-focus-within/dock:visible group-focus-within/dock:opacity-100 group-hover/dock:visible group-hover/dock:opacity-100">
            <ul className={cn(PANEL, "m-0 w-[240px] list-none p-1.5")}>
              {changes.map((c) => (
                <li key={c.key}>
                  <button type="button" onClick={c.onGo} className="flex w-full items-center rounded-bz-sm px-2 py-1.5 text-left text-[12.5px] text-bz-text hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire">
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <span className="hidden min-w-0 flex-1 truncate text-[11.5px] text-bz-text-soft sm:block">{changes.map((c) => c.label).join(" · ")}</span>
        {refusal && (
          <div className="flex w-full items-center gap-2 sm:order-last">
            <Refusal text={refusal} sticky onDismiss={onDismissRefusal ?? (() => {})} className="min-w-0 flex-1 py-1.5" />
            {refusalAction && (
              <button type="button" className={GHOST_SM} onClick={refusalAction.onClick}>
                {refusalAction.label}
              </button>
            )}
          </div>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button type="button" className={GHOST} onClick={onDiscard} disabled={busy}>
            Discard
          </button>
          <button type="button" className={BTN} onClick={onSave} title={`Save (${mod("S")})`}>
            {busy && <Loader2 size={13} className="animate-spin" />}
            {saveLabel}
            <span className="hidden sm:inline-flex">
              <Kbd>{mod("S")}</Kbd>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Leave guard ─────────────────────────────────────────────────────────────

/**
 * In-app navigation with staged changes asks first (Keep editing · Discard · Save and leave); a
 * browser unload gets `beforeunload`. Record-to-record walks (J/K, ‹ ›) are navigations, so they
 * are guarded too. `confirm(fn)` guards an in-page step that is not a navigation (closing a peek).
 * `onSave` answers false when it refused — the reader stays.
 */
export function useUnsavedGuard({ dirty, labels, onSave, onDiscard }: { dirty: boolean; labels: string[]; onSave: () => boolean | void; onDiscard: () => void }) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  const [then, setThen] = React.useState<null | (() => void)>(null);
  // The blocker object is new on every render; only its state change may open the question.
  const blockerRef = React.useRef(blocker);
  blockerRef.current = blocker;
  React.useEffect(() => {
    if (blocker.state === "blocked") setThen(() => () => blockerRef.current.proceed?.());
  }, [blocker.state]);

  React.useEffect(() => {
    if (!dirty) return;
    const on = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", on);
    return () => window.removeEventListener("beforeunload", on);
  }, [dirty]);

  const confirm = (fn: () => void) => (dirty ? setThen(() => fn) : fn());
  const keep = () => {
    if (blockerRef.current.state === "blocked") blockerRef.current.reset?.();
    setThen(null);
  };
  const leave = (fn: (() => void) | null) => {
    setThen(null);
    fn?.();
  };
  const n = labels.length;

  const dialog = (
    <Dialog
      open={!!then}
      size="sm"
      title={`Leave with ${n} unsaved change${n === 1 ? "" : "s"}?`}
      onClose={keep}
      foot={
        <>
          <button type="button" className={cn(GHOST, "mr-auto")} onClick={keep}>
            Keep editing
          </button>
          <button type="button" className={GHOST} onClick={() => (onDiscard(), leave(then))}>
            Discard
          </button>
          <button type="button" className={BTN} onClick={() => (onSave() === false ? keep() : leave(then))}>
            Save and leave
          </button>
        </>
      }
    >
      <p className="m-0 text-[12px] text-bz-text-muted">{labels.join(" · ")}</p>
    </Dialog>
  );
  return { dialog, confirm };
}

// ── The page ────────────────────────────────────────────────────────────────

export function RecordPage({
  back,
  image,
  title,
  meta,
  chips,
  actions,
  walk,
  band,
  facts,
  sections,
  related = [],
  children,
  dock,
  keys,
  railNote,
  className,
}: {
  back?: { label: string; onClick: () => void };
  /** The record's picture tile (40px) — the template's for a variant. */
  image?: React.ReactNode;
  title: React.ReactNode;
  /** code ⧉ · type · unit · category — joined by the atom's dots. */
  meta?: React.ReactNode[];
  chips?: React.ReactNode;
  /** The primary quick action and ⋯. */
  actions?: React.ReactNode;
  walk?: { position?: { index: number; total: number }; onPrev: () => void; onNext: () => void };
  band?: React.ReactNode;
  facts?: React.ReactNode;
  sections: PageSection[];
  /** The related column's blocks, in order (RelatedBlock). */
  related?: React.ReactNode[];
  children: React.ReactNode;
  dock?: React.ReactNode;
  /** Page shortcuts (`c` copy code, `.` actions, `escape` back) — never while typing. J/K walk comes with `walk`. */
  keys?: Record<string, (e: KeyboardEvent) => void>;
  /** A quiet note under the rail ("Finish setting up" after a create); above the form below 768px. */
  railNote?: React.ReactNode;
  className?: string;
}) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const headRef = React.useRef<HTMLElement>(null);
  const wide = useMedia("(min-width: 1280px)");
  const [stuck, setStuck] = React.useState(false);
  const [current, setCurrent] = React.useState<string | null>(sections[0]?.id ?? null);
  const ids = sections.map((s) => s.id).join("|");

  // The slim bar takes over once the head has scrolled out of the page's own scroller.
  React.useEffect(() => {
    const root = scroller.current;
    const head = headRef.current;
    if (!root || !head) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { root, threshold: 0 });
    io.observe(head);
    return () => io.disconnect();
  }, []);

  // Scroll-spy: the current section is the last one whose top has passed under the slim bar;
  // at the very bottom it is the last section, however short.
  React.useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const els = sections.map((s) => root.querySelector<HTMLElement>(`#${CSS.escape(s.id)}`)).filter((x): x is HTMLElement => !!x);
    if (!els.length) return;
    const compute = () => {
      const line = root.getBoundingClientRect().top + SECTION_OFFSET + 8;
      let cur = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      if (root.scrollTop + root.clientHeight >= root.scrollHeight - 2) cur = els[els.length - 1].id;
      setCurrent(cur);
    };
    const io = new IntersectionObserver(compute, { root, threshold: Array.from({ length: 11 }, (_, i) => i / 10) });
    els.forEach((el) => io.observe(el));
    compute();
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  const goTo = React.useCallback((id: string) => {
    const root = scroller.current;
    const el = root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!root || !el) return;
    const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - SECTION_OFFSET;
    root.scrollTo({ top, behavior: "smooth" });
    setCurrent(id);
  }, []);

  // ⌥↑ / ⌥↓ walk the sections, even from inside a field.
  const secRef = React.useRef({ sections, current, goTo });
  secRef.current = { sections, current, goTo };
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
      const { sections: s, current: c, goTo: g } = secRef.current;
      const i = s.findIndex((x) => x.id === c);
      const next = s[Math.max(0, Math.min(s.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))];
      if (next) (e.preventDefault(), g(next.id));
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  useKeys({ ...(walk ? { j: () => walk.onNext(), k: () => walk.onPrev() } : {}), ...keys });

  const walkButtons = walk && (
    <span className="flex items-center">
      {walk.position && (
        <span className={cn("mr-1 hidden text-[10.5px] text-bz-text-soft sm:inline", NUM)}>
          {walk.position.index + 1} / {walk.position.total}
        </span>
      )}
      <button type="button" className={ICON_BTN} onClick={walk.onPrev} title="Previous (K)" aria-label="Previous">
        <ChevronLeft size={15} />
      </button>
      <button type="button" className={ICON_BTN} onClick={walk.onNext} title="Next (J)" aria-label="Next">
        <ChevronRight size={15} />
      </button>
    </span>
  );

  const metaLine = (items?: React.ReactNode[]) =>
    items &&
    items.filter(Boolean).length > 0 && (
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-bz-text-muted">
        {items.filter(Boolean).map((m, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span aria-hidden className="size-[3px] shrink-0 rounded-bz-pill bg-bz-line" />}
            {m}
          </React.Fragment>
        ))}
      </div>
    );

  const top = wide ? [] : related.slice(0, 2);
  const rest = wide ? [] : related.slice(2);
  const currentLabel = sections.find((s) => s.id === current)?.label ?? "";

  return (
    <div ref={scroller} data-record-scroller="" className={cn("relative h-full overflow-y-auto bg-bz-section-b [scrollbar-width:thin]", className)}>
      {/* ── the slim bar: zero height in the flow, drawn over the page once the head is gone ── */}
      <div className="sticky top-0 z-40 h-0">
        <div
          aria-hidden={!stuck}
          className={cn(
            "absolute inset-x-0 top-0 flex items-center gap-3 border-b border-bz-line bg-bz-paper px-4 shadow-[var(--bz-shadow-card)] transition-opacity duration-150 md:px-6",
            stuck ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          style={{ height: STICKY_BAR }}
        >
          {back && (
            <button type="button" tabIndex={stuck ? 0 : -1} onClick={back.onClick} className={cn(ICON_BTN, "-ml-1.5")} title={back.label} aria-label={back.label}>
              <ChevronLeft size={15} />
            </button>
          )}
          <span className="min-w-0 truncate text-[13px] font-semibold text-bz-text">{title}</span>
          <span className="hidden min-w-0 items-center gap-1.5 overflow-hidden md:flex">{chips}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5">
            {stuck && actions}
            {stuck && walkButtons}
          </span>
        </div>
      </div>

      <header ref={headRef} className="border-b border-bz-line bg-bz-paper px-4 pb-3.5 pt-3 md:px-6">
        {back && (
          <button type="button" onClick={back.onClick} className="-ml-1.5 mb-1.5 inline-flex h-7 items-center gap-1 rounded-bz-md px-1.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire">
            <ChevronLeft size={13} /> {back.label}
          </button>
        )}
        <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
          {image && <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-paper-warm text-bz-text-soft">{image}</span>}
          <div className="min-w-[160px] flex-1 basis-[180px]">
            <h1 className="m-0 truncate text-[17px] font-semibold leading-snug tracking-tight text-bz-text">{title}</h1>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              {metaLine(meta)}
              {chips && <span className="flex flex-wrap items-center gap-1.5">{chips}</span>}
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {actions}
            {walkButtons}
          </div>
        </div>
      </header>

      {band && <div className="border-b border-bz-line-soft bg-bz-paper-warm px-4 py-2 text-[12px] text-bz-text md:px-6">{band}</div>}
      {facts && <div className="border-b border-bz-line bg-bz-paper px-4 py-1.5 md:px-6">{facts}</div>}

      {top.length > 0 && <div className="grid grid-cols-1 gap-4 px-4 pt-4 sm:grid-cols-2 md:px-6">{top}</div>}

      <div className="grid grid-cols-1 gap-4 px-4 pb-10 pt-4 md:grid-cols-[180px_minmax(0,1fr)] md:gap-6 md:px-6 md:pt-6 xl:grid-cols-[200px_minmax(0,760px)_320px]">
        <div className="hidden md:block">
          <div className="sticky" style={{ top: SECTION_OFFSET }}>
            <SectionNav sections={sections} current={current} onGo={goTo} />
            {railNote && <div className="mt-4 pl-3.5 pr-2 text-[11.5px] leading-snug text-bz-text-muted">{railNote}</div>}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="sticky z-20 md:hidden" style={{ top: STICKY_BAR + 8 }}>
            <Select trigger="ghost" className="h-9 w-full justify-between bg-bz-surface" label={`Jump to section · ${currentLabel}`} value={current} onChange={goTo} options={sections.map((s) => ({ value: s.id, label: s.label }))} width={260} />
          </div>
          {railNote && <div className="rounded-bz-md bg-bz-paper-warm px-3 py-2 text-[11.5px] leading-snug text-bz-text-muted md:hidden">{railNote}</div>}
          {children}
          {rest}
        </div>
        {wide && related.length > 0 && (
          <aside className="sticky flex max-h-[calc(100vh-150px)] flex-col gap-4 self-start overflow-y-auto [scrollbar-width:thin]" style={{ top: SECTION_OFFSET }}>
            {related}
          </aside>
        )}
      </div>

      {dock}
    </div>
  );
}
