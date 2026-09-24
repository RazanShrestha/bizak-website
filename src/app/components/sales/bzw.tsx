import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X, Inbox, TriangleAlert, Loader2 } from "lucide-react";
import { cn } from "../ui/utils";
import { PEOPLE } from "../productivity/shared";
import type { Person } from "../productivity/shared";

// ════════════════════════════════════════════════════════════════════════════
// bzw · THE APP'S CURRENT LAYER, IN REACT
//
// A port of bizak-app `custom/_bzw-*.scss` as it ships today (Sep 2026) — NOT
// of the older productivity mockup. Where the two disagree the app wins:
//   • the primary button is the ROLE token `bz-primary` (deep on paper, lime
//     on dark), because dark mode changes what that surface is;
//   • figures are a slim statline, never a strip of tiles;
//   • a menu option reads at 12.5px body ink, chosen = lime 10% wash + weight;
//   • a refusal takes itself away after ~5s with a draining bar;
//   • danger is a token (`bz-red*`), not three hex literals.
// Every portal renders INTO the frame (FrameContext), so a menu opened on a
// dark page is dark too — a portal on <body> would escape the token scope.
// ════════════════════════════════════════════════════════════════════════════

// ── Paint ───────────────────────────────────────────────────────────────────

const PRESS =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap border select-none transition-[background-color,border-color,color,opacity,transform] duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire disabled:pointer-events-none disabled:opacity-45";

/** The one commit on a surface. */
export const BTN = cn(PRESS, "h-9 rounded-bz-md border-transparent bg-bz-primary px-3.5 text-[12px] font-semibold text-bz-primary-ink hover:opacity-95");
/** The default button of the language. */
export const GHOST = cn(PRESS, "h-9 rounded-bz-md border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm");
/** A block-head / toolbar button: lighter border AND lighter weight. */
export const GHOST_SM = cn(PRESS, "h-8 rounded-bz-md border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm");
export const DANGER_BTN = cn(PRESS, "h-9 rounded-bz-md border-transparent bg-bz-red-soft px-3 text-[12px] font-semibold text-bz-red hover:opacity-90");
export const ICON_BTN = cn(PRESS, "size-8 rounded-bz-md border-transparent bg-transparent p-0 text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text");
export const ICON_BTN_SM = cn(PRESS, "size-6 rounded-bz-sm border-transparent bg-transparent p-0 text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text");
/** A bare glyph that is still a control — its hit area is grown, its box is not. */
export const PLAIN_BTN = cn(PRESS, "relative border-transparent bg-transparent p-0 text-bz-text-soft hover:text-bz-text before:absolute before:-inset-2 before:content-['']");

export const INPUT =
  "block h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper px-3 text-[12.5px] text-bz-text outline-none transition-colors placeholder:text-bz-text-soft hover:border-bz-text-soft focus:border-bz-text-muted disabled:cursor-not-allowed disabled:bg-bz-paper-warm disabled:text-bz-text-muted";
export const INPUT_SM = cn(INPUT, "h-8 px-2.5 text-[12px]");
export const TEXTAREA = cn(INPUT, "h-auto min-h-[72px] resize-y py-2 leading-relaxed");

export const LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";
export const NUM = "tabular-nums";
export const PANEL = "rounded-bz-lg border border-bz-line bg-bz-surface shadow-[var(--bz-shadow-panel)]";
export const CARD = "rounded-bz-lg border border-bz-line-soft bg-bz-surface";

// ── Frame context (portal root + theme) ─────────────────────────────────────

type FrameCtx = { portal: HTMLElement | null; dark: boolean; setDark: (v: boolean) => void };
export const FrameContext = React.createContext<FrameCtx>({ portal: null, dark: false, setDark: () => {} });

export function Portal({ children }: { children: React.ReactNode }) {
  const { portal } = React.useContext(FrameContext);
  return createPortal(children, portal ?? document.body);
}

// ── Avatar ──────────────────────────────────────────────────────────────────

const TONES = [
  "bg-bz-olive text-bz-text-on-dark",
  "bg-bz-leaf text-bz-text",
  "bg-bz-fire text-bz-olive",
  "bg-bz-paper-warm text-bz-text",
  "bg-bz-olive-soft text-bz-text-on-dark",
];
export const toneOf = (id: string) => TONES[Math.max(0, PEOPLE.findIndex((p) => p.id === id)) % TONES.length];

export function Avatar({ person, size = 20, ring }: { person: Person | undefined; size?: number; ring?: boolean }) {
  if (!person)
    return (
      <span
        title="Unassigned"
        className="inline-flex shrink-0 items-center justify-center rounded-bz-pill border border-dashed border-bz-line text-bz-text-soft"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        ?
      </span>
    );
  return (
    <span
      title={person.name}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-bz-pill font-semibold leading-none", toneOf(person.id), ring && "shadow-[0_0_0_2px_var(--bz-surface)]")}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {person.initials}
    </span>
  );
}

// ── Chip ────────────────────────────────────────────────────────────────────

export type Tone = "positive" | "partial" | "pending" | "neutral" | "danger";
const CHIP: Record<Tone, [string, string]> = {
  positive: ["bg-bz-fire/20 text-bz-text", "bg-bz-leaf-deep"],
  partial: ["bg-bz-leaf/50 text-bz-text", "bg-bz-fire"],
  pending: ["bg-bz-paper-warm text-bz-text-muted", "bg-bz-line"],
  neutral: ["bg-bz-paper-warm text-bz-text", "bg-bz-text-soft"],
  danger: ["bg-bz-red-soft text-bz-red", "bg-bz-red-mark"],
};

export function Chip({ tone, children, dot = true, className, title }: { tone: Tone; children: React.ReactNode; dot?: boolean; className?: string; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", CHIP[tone][0], className)}>
      {dot && <span className={cn("size-1.5 shrink-0 rounded-bz-pill", CHIP[tone][1])} />}
      {children}
    </span>
  );
}

/** A bordered mark pointing OUT to another document. */
export function DocLink({ no, kind, onClick }: { no: string; kind?: string; onClick?: () => void }) {
  const El = onClick ? "button" : "span";
  return (
    <El
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted",
        onClick && "hover:border-bz-line hover:text-bz-text",
      )}
    >
      <span className={NUM}>{no}</span>
      {kind && <span className="text-bz-text-soft">{kind}</span>}
    </El>
  );
}

export function CountMark({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-bz-sm px-1.5 py-0.5 text-[10px]", NUM, danger ? "bg-bz-red-soft font-semibold text-bz-red" : "bg-bz-paper-warm font-medium text-bz-text-muted")}>
      {children}
    </span>
  );
}

export function Meter({ pct, thin, className, danger }: { pct: number; thin?: boolean; className?: string; danger?: boolean }) {
  return (
    <span className={cn("block w-full overflow-hidden rounded-bz-pill bg-bz-line-soft", thin ? "h-1" : "h-1.5", className)}>
      <span className={cn("block h-full rounded-bz-pill transition-[width] duration-200", danger ? "bg-bz-red-mark" : "bg-bz-leaf-deep")} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-[4px] border border-bz-line-soft bg-bz-paper-warm px-1 text-[10px] font-medium text-bz-text-soft">
      {children}
    </kbd>
  );
}

// ── Statline ────────────────────────────────────────────────────────────────

export function Statline({ children, className }: { children: React.ReactNode; className?: string }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className={cn("flex min-h-8 flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-bz-text-muted", className)}>
      {items.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden className="-mx-2 size-[3px] shrink-0 rounded-bz-pill bg-bz-line" />}
          {c}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  danger,
  active,
  onPick,
  meter,
  title,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  danger?: boolean;
  active?: boolean;
  onPick?: () => void;
  meter?: number;
  title?: string;
}) {
  const inner = (
    <>
      <span className="text-bz-text-soft">{label}</span>
      {meter !== undefined && <Meter pct={meter} thin className="w-14" />}
      <span className={cn("text-[12.5px] font-semibold", danger ? "text-bz-red" : "text-bz-text")}>{value}</span>
      {sub && <span className="text-bz-text-soft">{sub}</span>}
    </>
  );
  if (!onPick)
    return (
      <span title={title} className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", NUM)}>
        {inner}
      </span>
    );
  return (
    <button
      type="button"
      title={title}
      onClick={onPick}
      className={cn(
        "-mx-1.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-1.5 py-0.5 text-[11.5px] leading-normal transition-colors focus-visible:outline-2 focus-visible:outline-bz-fire",
        NUM,
        active ? "bg-bz-fire/10" : "hover:bg-bz-paper-warm",
      )}
    >
      {inner}
    </button>
  );
}

// ── Tabs · segmented · search ───────────────────────────────────────────────

export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
  tail,
}: {
  value: T;
  onChange: (v: T) => void;
  tabs: { value: T; label: string; icon?: React.ComponentType<{ size?: number; className?: string }>; count?: number }[];
  tail?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const on = t.value === value;
        const Icon = t.icon;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "relative inline-flex h-11 shrink-0 items-center gap-1.5 px-3 text-[12.5px] transition-colors",
              on ? "font-semibold text-bz-text after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-bz-pill after:bg-bz-fire after:content-['']" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {Icon && <Icon size={13} className={on ? "text-bz-text" : "text-bz-text-soft"} />}
            {t.label}
            {t.count !== undefined && <span className={cn("text-[10.5px] font-medium text-bz-text-soft", NUM)}>{t.count}</span>}
          </button>
        );
      })}
      {tail && <div className="ml-auto flex shrink-0 items-center gap-1 pl-2">{tail}</div>}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; count?: number; title?: string }[];
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm transition-colors",
              size === "sm" ? "h-7 px-2 text-[11.5px]" : "h-8 px-2.5 text-[12px]",
              on ? "bg-bz-surface font-semibold text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.08)]" : "font-medium text-bz-text-muted hover:text-bz-text",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn("text-[10.5px]", on ? "text-bz-text-muted" : "text-bz-text-soft", NUM)}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export const SearchField = React.forwardRef<HTMLInputElement, { value: string; onChange: (v: string) => void; placeholder: string; className?: string; hint?: string }>(
  function SearchField({ value, onChange, placeholder, className, hint }, ref) {
    return (
      <label className={cn("relative block", className)}>
        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-soft" />
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(INPUT, "h-8 pl-[30px] pr-8 text-[12px]")}
        />
        {value ? (
          <button type="button" onClick={() => onChange("")} className={cn(PLAIN_BTN, "absolute right-2.5 top-1/2 -translate-y-1/2")} aria-label="Clear search">
            <X size={12} />
          </button>
        ) : (
          hint && <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"><Kbd>{hint}</Kbd></span>
        )}
      </label>
    );
  },
);

/** The one "put this back to nothing" control: quiet, underlined, one size. */
export function Clear({ label = "Clear all", onClear }: { label?: string; onClear: () => void }) {
  return (
    <button type="button" onClick={onClear} className="shrink-0 text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text">
      {label}
    </button>
  );
}

export function Checkbox({ on, mixed, onChange, label }: { on: boolean; mixed?: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? "mixed" : on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!on);
      }}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire",
        on || mixed ? "border-bz-olive bg-bz-olive text-bz-fire" : "border-bz-line bg-bz-surface text-transparent hover:border-bz-text-muted",
      )}
    >
      {mixed ? <span className="h-0.5 w-2 rounded-bz-pill bg-bz-fire" /> : <Check size={11} strokeWidth={3} />}
    </button>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn("relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors", on ? "border-bz-leaf-deep bg-bz-fire" : "border-bz-line bg-bz-paper-warm")}
    >
      <span className={cn("absolute size-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.25)] transition-all", on ? "left-4" : "left-0.5")} />
    </button>
  );
}

// ── Popover (anchored, flips, stays in the frame) ───────────────────────────

export function Popover({
  open,
  anchor,
  onClose,
  align = "left",
  width = 240,
  children,
  className,
}: {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
  align?: "left" | "right";
  width?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const panel = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !anchor) return setPos(null);
    const r = anchor.getBoundingClientRect();
    const left = align === "right" ? r.right - width : r.left;
    setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(left, window.innerWidth - width - 8)) });
  }, [open, anchor, align, width]);

  // Flip above when it would run off the bottom — clamping just pins it to the
  // edge and lets the list spill, which reads as "the button does nothing".
  React.useLayoutEffect(() => {
    const el = panel.current;
    if (!open || !anchor || !pos || !el) return;
    const h = el.offsetHeight;
    if (pos.top + h <= window.innerHeight - 8) return;
    const above = anchor.getBoundingClientRect().top - h - 6;
    const next = above >= 8 ? above : Math.max(8, window.innerHeight - h - 8);
    if (Math.abs(next - pos.top) > 1) setPos({ ...pos, top: next });
  }, [open, anchor, pos]);

  React.useEffect(() => {
    if (!open) return;
    const onScroll = (e: Event) => {
      const t = e.target as Node | null;
      if (t && panel.current && (panel.current === t || panel.current.contains(t))) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onClose);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open, onClose]);

  if (!open || !pos) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[1070]" onMouseDown={onClose} />
      <div
        ref={panel}
        className={cn(PANEL, "fixed z-[1071] overflow-y-auto p-1.5 text-bz-text", className)}
        style={{ top: pos.top, left: pos.left, width, maxHeight: "calc(100vh - 16px)" }}
      >
        {children}
      </div>
    </Portal>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return <p className={cn(LABEL, "px-2 pb-1 pt-1.5")}>{children}</p>;
}

export function MenuSep() {
  return <div className="my-1 border-t border-bz-line-soft" />;
}

export function MenuItem({
  children,
  onClick,
  active,
  danger,
  icon: Icon,
  hint,
  kbd,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  hint?: React.ReactNode;
  kbd?: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={cn(
        "flex w-full gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12.5px] transition-colors hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-45",
        hint ? "items-start" : "items-center",
        active ? "bg-bz-fire/10 font-semibold text-bz-text" : danger ? "text-bz-red" : "text-bz-text",
      )}
    >
      {Icon && <Icon size={13} className={cn("shrink-0", hint && "mt-0.5", danger ? "text-bz-red" : "text-bz-text-muted")} />}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{children}</span>
        {hint && <span className="mt-px block whitespace-normal text-[11px] font-normal leading-snug text-bz-text-muted">{hint}</span>}
      </span>
      {kbd && <Kbd>{kbd}</Kbd>}
      {active && <Check size={12} className="shrink-0 text-bz-text" />}
    </button>
  );
}

// ── Select — THE dropdown ───────────────────────────────────────────────────

export type SelectOption = {
  value: string;
  label: string;
  group?: string;
  hint?: string;
  meta?: React.ReactNode;
  person?: Person;
  disabled?: boolean;
};

type SelectBase = {
  options: SelectOption[];
  label?: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  trigger?: "ghost" | "field" | "plain";
  /** Custom trigger content (a chip, a person). */
  children?: React.ReactNode;
  badge?: number;
  width?: number;
  align?: "left" | "right";
  searchable?: boolean;
  placeholder?: string;
  footer?: React.ReactNode;
  applied?: boolean;
  className?: string;
  disabled?: boolean;
  title?: string;
};

export function Select(
  props: SelectBase &
    ({ multiple: true; value: string[]; onChange: (v: string[]) => void } | { multiple?: false; value: string | null; onChange: (v: string) => void }),
) {
  const { options, label, icon: Icon, trigger = "ghost", children, badge, width = 240, align = "left", footer, applied, className, disabled, title } = props;
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const searchable = props.searchable ?? options.length >= 8;
  const close = React.useCallback(() => {
    setOpen(false);
    setQ("");
  }, []);

  const picked = (v: string) => (props.multiple ? props.value.includes(v) : props.value === v);
  const choose = (v: string) => {
    if (props.multiple) {
      props.onChange(props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
    } else {
      props.onChange(v);
      close();
    }
  };

  const shown = q ? options.filter((o) => `${o.label} ${o.hint ?? ""} ${o.group ?? ""}`.toLowerCase().includes(q.toLowerCase())) : options;
  const groups: { name: string | undefined; items: SelectOption[] }[] = [];
  for (const o of shown) {
    const g = groups.find((x) => x.name === o.group);
    if (g) g.items.push(o);
    else groups.push({ name: o.group, items: [o] });
  }

  return (
    <>
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        title={title}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "inline-flex min-w-0 max-w-full items-center gap-1.5 border border-transparent text-bz-text transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-bz-fire disabled:cursor-not-allowed disabled:opacity-45",
          trigger === "ghost" &&
            cn("h-8 rounded-bz-md border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium hover:bg-bz-paper-warm", open && "border-bz-line bg-bz-paper-warm", applied && "border-bz-text-muted font-semibold"),
          trigger === "field" && cn("w-full gap-2 rounded-bz-sm px-1 py-0.5 text-left text-[12px] hover:bg-bz-paper-warm", open && "bg-bz-paper-warm"),
          trigger === "plain" && "p-0 text-[length:inherit] leading-[inherit]",
          className,
        )}
      >
        {children ?? (
          <>
            {Icon && <Icon size={12} className="shrink-0 text-bz-text-muted" />}
            {label !== undefined && <span className="min-w-0 truncate">{label}</span>}
            {!!badge && (
              <span className={cn("min-w-4 rounded-bz-pill bg-bz-fire px-1 text-center text-[10px] font-bold leading-4 text-bz-olive", NUM)}>{badge}</span>
            )}
            {trigger !== "plain" && <ChevronDown size={12} className="shrink-0 text-bz-text-soft" />}
          </>
        )}
      </button>
      <Popover open={open} anchor={ref.current} onClose={close} width={width} align={align} className="p-0">
        <div className="p-1.5">
          {searchable && (
            <div className="sticky top-0 z-[1] -mx-1.5 -mt-1.5 mb-1 flex items-center gap-1.5 border-b border-bz-line-soft bg-bz-surface px-3 py-2 text-bz-text-soft">
              <Search size={12} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={props.placeholder ?? "Search…"}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft"
              />
            </div>
          )}
          {groups.length === 0 && <p className="px-2 pb-3 pt-2 text-[11.5px] text-bz-text-soft">No match.</p>}
          {groups.map((g, gi) => (
            <div key={g.name ?? gi}>
              {g.name && <MenuLabel>{g.name}</MenuLabel>}
              {g.items.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  disabled={o.disabled}
                  onClick={() => choose(o.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12.5px] text-bz-text transition-colors hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-45",
                    picked(o.value) && "bg-bz-fire/10 font-semibold",
                  )}
                >
                  {o.person && <Avatar person={o.person} size={17} />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {o.hint && <span className="block truncate text-[11px] font-normal text-bz-text-muted">{o.hint}</span>}
                  </span>
                  {o.meta && <span className="shrink-0 text-[11px] font-normal text-bz-text-soft">{o.meta}</span>}
                  {picked(o.value) && <Check size={12} className="shrink-0" />}
                </button>
              ))}
            </div>
          ))}
        </div>
        {footer && <div className="border-t border-bz-line-soft p-1.5">{footer}</div>}
      </Popover>
    </>
  );
}

// ── Refusal — the server's sentence, verbatim, and it takes itself away ─────

export function Refusal({ text, onDismiss, sticky, className }: { text: string; onDismiss: () => void; sticky?: boolean; className?: string }) {
  const [held, setHeld] = React.useState(false);
  React.useEffect(() => {
    if (sticky || held) return;
    const id = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(id);
  }, [sticky, held, onDismiss, text]);
  return (
    <div
      role="alert"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      className={cn("relative flex items-start gap-2 overflow-hidden rounded-bz-md bg-bz-red-soft px-2.5 py-2 text-[11.5px] leading-normal text-bz-red", className)}
    >
      <TriangleAlert size={13} className="mt-px shrink-0" />
      <span className="min-w-0 flex-1">{text}</span>
      <button type="button" onClick={onDismiss} className="shrink-0 opacity-65 hover:opacity-100" aria-label="Dismiss">
        <X size={12} />
      </button>
      {!sticky && (
        <span
          key={held ? "held" : text}
          className={cn("absolute inset-x-0 bottom-0 h-0.5 origin-left bg-bz-red-mark opacity-40", !held && "animate-[bzw-life_5s_linear_forwards]")}
        />
      )}
      <style>{`@keyframes bzw-life{from{transform:scaleX(1)}to{transform:scaleX(0)}}`}</style>
    </div>
  );
}

// ── Toast — one message, replaced, never stacked ────────────────────────────

export type ToastMsg = { id: number; kind: "success" | "info" | "error"; text: string; action?: { label: string; run: () => void }; duration?: number };

export function useToast() {
  const [toast, setToast] = React.useState<ToastMsg | null>(null);
  const show = React.useCallback((kind: ToastMsg["kind"], text: string, action?: ToastMsg["action"], duration?: number) => {
    setToast({ id: Date.now(), kind, text, action, duration });
  }, []);
  React.useEffect(() => {
    if (!toast) return;
    const d = toast.duration ?? (toast.action ? 6000 : 3400);
    if (d === 0) return;
    const id = window.setTimeout(() => setToast(null), d);
    return () => window.clearTimeout(id);
  }, [toast]);
  return { toast, show, dismiss: () => setToast(null) };
}

export function ToastHost({ toast, onDismiss, lifted }: { toast: ToastMsg | null; onDismiss: () => void; lifted?: boolean }) {
  if (!toast) return null;
  return (
    <Portal>
      <div className={cn("pointer-events-none fixed left-1/2 z-[1080] w-full max-w-[420px] -translate-x-1/2 px-4", lifted ? "bottom-[88px]" : "bottom-6")}>
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-bz-lg border border-white/10 bg-bz-raised px-3.5 py-2.5 text-bz-text-on-dark shadow-[var(--bz-shadow-panel)]">
          <span className={cn("size-1.5 shrink-0 rounded-bz-pill", toast.kind === "success" ? "bg-bz-fire" : toast.kind === "error" ? "bg-bz-red-mark" : "bg-bz-leaf-deep")} />
          <p className="m-0 flex-1 text-[12px]">{toast.text}</p>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action!.run();
                onDismiss();
              }}
              className="shrink-0 rounded-bz-pill border border-white/15 px-2.5 py-0.5 text-[11.5px] font-semibold hover:bg-white/10"
            >
              {toast.action.label}
            </button>
          )}
          <button type="button" onClick={onDismiss} className="shrink-0 text-white/55 hover:text-white" aria-label="Dismiss">
            <X size={12} />
          </button>
        </div>
      </div>
    </Portal>
  );
}

// ── Bulk bar — a selection is a mode ────────────────────────────────────────

export function BulkBar({ count, children, onClear, note }: { count: number; children: React.ReactNode; onClear: () => void; note?: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <Portal>
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[1040] w-full max-w-[680px] -translate-x-1/2 px-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-bz-lg border border-white/10 bg-bz-raised px-3 py-2 text-bz-text-on-dark shadow-[var(--bz-shadow-panel)]">
          <span className={cn("rounded-bz-sm bg-bz-fire px-1.5 py-0.5 text-[11px] font-bold text-bz-olive", NUM)}>{count}</span>
          <span className="text-[12px] text-white/75">selected</span>
          {note && <span className="text-[10.5px] text-bz-fire">{note}</span>}
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {children}
            <button type="button" onClick={onClear} className="ml-1 text-[11px] font-medium text-white/55 underline underline-offset-2 hover:text-white">
              Clear selection
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export function BulkBtn({ children, onClick, disabled, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex h-7 items-center gap-1.5 rounded-bz-md bg-white/[0.08] px-2.5 text-[11.5px] font-medium transition-colors hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-45"
    >
      {children}
    </button>
  );
}

// ── Dialog — the decision that needs the page gone ──────────────────────────

export function Dialog({
  open,
  title,
  eyebrow,
  onClose,
  children,
  foot,
  size = "md",
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: React.ReactNode;
  foot: React.ReactNode;
  size?: "sm" | "md" | "wide";
}) {
  React.useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", on, true);
    return () => window.removeEventListener("keydown", on, true);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <Portal>
      <div data-bzw-dialog className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-bz-olive-dark/25" onClick={onClose} />
        <div className={cn(PANEL, "relative flex max-h-[calc(100vh-48px)] w-full flex-col", size === "sm" ? "max-w-[380px]" : size === "wide" ? "max-w-[620px]" : "max-w-[460px]")}>
          <div className="flex items-start gap-2 border-b border-bz-line-soft px-4 py-3">
            <div className="min-w-0 flex-1">
              {eyebrow && <p className={cn(LABEL, "m-0")}>{eyebrow}</p>}
              <p className="m-0 text-[13px] font-semibold text-bz-text">{title}</p>
            </div>
            <button type="button" onClick={onClose} className={PLAIN_BTN} aria-label="Close">
              <X size={14} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[12px] leading-relaxed text-bz-text-muted">{children}</div>
          <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft px-4 py-3">{foot}</div>
        </div>
      </div>
    </Portal>
  );
}

// ── Field (label over control) ──────────────────────────────────────────────

export function Field({ label, children, className, hint, required }: { label: string; children: React.ReactNode; className?: string; hint?: React.ReactNode; required?: boolean }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-[11.5px] font-semibold text-bz-text">
        {label}
        {required && <span className="ml-0.5 text-bz-red">*</span>}
      </span>
      {children}
      {hint && <span className="text-[10.5px] leading-snug text-bz-text-soft">{hint}</span>}
    </div>
  );
}

// ── States ──────────────────────────────────────────────────────────────────

export function Empty({ title, action, icon: Icon = Inbox }: { title: string; action?: React.ReactNode; icon?: React.ComponentType<{ size?: number }> }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-soft">
        <Icon size={16} />
      </span>
      <p className="m-0 text-[13px] font-semibold text-bz-text">{title}</p>
      {action && <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-bz-line-soft px-4 py-3 last:border-0">
          <span className="size-4 shrink-0 animate-pulse rounded-[4px] bg-bz-line-soft" />
          <span className="h-2.5 w-14 animate-pulse rounded-bz-pill bg-bz-line-soft" />
          <span className="h-2.5 animate-pulse rounded-bz-pill bg-bz-line-soft" style={{ width: `${28 + ((i * 13) % 30)}%` }} />
          <span className="ml-auto h-2.5 w-20 animate-pulse rounded-bz-pill bg-bz-line-soft" />
        </div>
      ))}
      <p className="flex items-center justify-center gap-2 py-3 text-[11.5px] text-bz-text-soft">
        <Loader2 size={12} className="animate-spin" /> Loading orders…
      </p>
    </div>
  );
}

// ── Number field with steppers (bzw-number) ─────────────────────────────────

export function NumberField({
  value,
  onChange,
  min = 0,
  max,
  invalid,
  className,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  invalid?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const clamp = (n: number) => Math.max(min, max === undefined ? n : Math.min(max, n));
  return (
    <span className={cn("inline-flex h-8 items-stretch overflow-hidden rounded-bz-md border bg-bz-paper transition-colors focus-within:border-bz-text-muted", invalid ? "border-bz-red-mark" : "border-bz-line hover:border-bz-text-soft", className)}>
      <button type="button" tabIndex={-1} onClick={() => onChange(clamp(value - 1))} className="w-6 shrink-0 text-[13px] text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text" aria-label="Less">
        −
      </button>
      <input
        aria-label={ariaLabel}
        inputMode="decimal"
        onFocus={(e) => e.currentTarget.select()}
        value={Number.isFinite(value) ? String(value) : ""}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/[^\d.]/g, ""));
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className={cn("w-full min-w-0 border-0 bg-transparent px-1 text-center text-[12.5px] font-semibold text-bz-text outline-none", NUM)}
      />
      <button type="button" tabIndex={-1} onClick={() => onChange(clamp(value + 1))} className="w-6 shrink-0 text-[13px] text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text" aria-label="More">
        +
      </button>
    </span>
  );
}
