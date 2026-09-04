import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Info, Search, X, Check, Loader2, AlertTriangle, Ban, RotateCcw, Inbox, FlaskConical } from "lucide-react";
import { cn } from "../ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// TIMESHEET · SHARED KERNEL
//
// One module, seven surfaces. Everything the surfaces must agree on lives here:
//   • the hours grammar        (parse · normalise · format · the absence mark)
//   • the lifecycle vocabulary (open-ended labels + a fixed severity ladder)
//   • the explain-don't-flag   (click-opened reason popover, touch-safe)
//   • the money grant          (measures are ABSENT, never hidden)
//   • the seed universe        (people · clients · projects · activities · days)
//
// Two rules from the brief are encoded structurally rather than by convention:
//   1. THE TIMESHEET STORES HOURS, NEVER MONEY. Monetary fields are optional on
//      every type; a grant-less viewer gets `undefined`, not 0 — see `Money`.
//   2. NOTHING IS SILENTLY DROPPED. Defects carry a reason and a way out, and
//      `Nil` (—) is visually distinct from a real zero everywhere.
// ════════════════════════════════════════════════════════════════════════════

export const NUM = "tabular-nums";

export const PRIMARY_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-45";
export const GHOST_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:opacity-45";
export const GHOST_BTN_SM =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-45";
export const LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft";
export const CARD = "rounded-bz-lg border border-bz-line-soft bg-bz-surface";
export const SHADOW = "shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]";
export const INPUT =
  "h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper px-3 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted";

// ════════════════════════════════════════════════════════════════════════════
// HOURS GRAMMAR
// ════════════════════════════════════════════════════════════════════════════

/** The organisation's rounding increment. Applied SERVER-SIDE on save only. */
export const HOUR_INCREMENT = 0.25;
export const MAX_DAY_HOURS = 24;

export const ACCEPTED_HOURS_FORMS = "7 · 7.5 · 7:30 · 7h30m · 45m";

/**
 * Forgiving parse of a typed hours value. Returns null when unreadable —
 * the caller then states the refusal and reverts the cell.
 */
export function parseHours(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (s === "") return 0; // clearing a cell is a legitimate act meaning zero
  // 7:30
  let m = s.match(/^(\d{1,2}):([0-5]?\d)$/);
  if (m) return Number(m[1]) + Number(m[2]) / 60;
  // 7h30m · 7h · 30m · 7hr
  m = s.match(/^(?:(\d{1,2})h(?:r|rs)?)?(?:(\d{1,2})m(?:in)?)?$/);
  if (m && (m[1] || m[2])) return Number(m[1] ?? 0) + Number(m[2] ?? 0) / 60;
  // 7 · 7.5 · .5
  m = s.match(/^(\d{0,2}(?:\.\d{1,2})?)$/);
  if (m && m[1] !== "") return Number(m[1]);
  return null;
}

/** Server-side rounding to the organisation's increment. */
export const roundToIncrement = (n: number) => Math.round(n / HOUR_INCREMENT) * HOUR_INCREMENT;

export const fmtH = (n: number) => n.toFixed(2);
/** Compact form for dense cells: 7.5 not 7.50, blank stays blank. */
export const fmtHShort = (n: number) => (n === 0 ? "" : String(Number(n.toFixed(2))));
export const g = (n: number) => n.toLocaleString("en-US");
export const money = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
export function fmtDateShort(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}
export function weekdayOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
export const dayNum = (iso: string) => Number(iso.split("-")[2]);

// ════════════════════════════════════════════════════════════════════════════
// ABSENCE CONVENTION
// A genuine zero prints as 0.00. Not-applicable prints as —. Unresolvable
// (a money measure the viewer has no grant for, a difference that cannot be
// derived) prints as its own worded mark. The three never look alike.
// ════════════════════════════════════════════════════════════════════════════

export function Nil({ className }: { className?: string }) {
  return <span className={cn("text-bz-text-soft", className)} aria-label="not applicable">—</span>;
}

export function Unresolved({ label = "not priced" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-soft">
      {label}
    </span>
  );
}

/** Renders an hours measure: real zeros stay legible, absent measures do not. */
export function H({ v, className, dim }: { v: number | undefined; className?: string; dim?: boolean }) {
  if (v === undefined) return <Nil />;
  return (
    <span className={cn(NUM, dim && v === 0 ? "text-bz-text-soft" : "text-bz-text", className)}>{fmtH(v)}</span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIFECYCLE VOCABULARY  —  open-ended labels, five fixed severities
//
// The label may be organisation-defined text (a workflow state), so nothing
// keys off the string. Severity is what the design reads. Severity is SEMANTIC
// and is never the brand/primary emphasis.
// ════════════════════════════════════════════════════════════════════════════

export type Severity = "settled" | "progress" | "attention" | "blocked" | "neutral";

const SEV_CHIP: Record<Severity, string> = {
  settled: "bg-bz-fire/[0.18] text-bz-text",
  progress: "bg-bz-leaf/50 text-bz-text",
  attention: "bg-[#FBE5E2] text-[#9A2E29]",
  blocked: "bg-bz-olive text-bz-text-on-dark",
  neutral: "bg-bz-paper-warm text-bz-text-muted",
};
const SEV_DOT: Record<Severity, string> = {
  settled: "bg-bz-leaf-deep",
  progress: "bg-bz-fire",
  attention: "bg-[#C0413A]",
  blocked: "bg-white/45",
  neutral: "bg-bz-line",
};

export function StateChip({ label, severity, size = "md" }: { label: string; severity: Severity; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-bz-sm font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[10.5px]" : "px-2 py-0.5 text-[11px]",
        SEV_CHIP[severity],
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-bz-pill", SEV_DOT[severity])} />
      <span className="truncate">{label}</span>
    </span>
  );
}

export type DocState = { label: string; severity: Severity };

/** The shape every surface resolves a lifecycle state from. */
export type DocFacts = {
  voided?: boolean;
  workflowState?: string | null; // organisation-defined text — anything
  sentBack?: boolean;
  submittedISO?: string | null; // unset ⇒ not yet submitted (there is no "draft")
  endorsed?: boolean;
  consumption?: "open" | "partly_invoiced" | "invoiced" | "not_chargeable";
};

/**
 * ONE precedence, used by every surface:
 * voided ▸ workflow state ▸ sent back ▸ not yet submitted ▸ awaiting
 * endorsement ▸ downstream consumption state.
 */
export function resolveState(f: DocFacts): DocState {
  if (f.voided) return { label: "Voided", severity: "blocked" };
  if (f.workflowState) return { label: f.workflowState, severity: "progress" };
  if (f.sentBack) return { label: "Sent back", severity: "attention" };
  if (!f.submittedISO) return { label: "Not submitted", severity: "neutral" };
  if (!f.endorsed) return { label: "Awaiting endorsement", severity: "progress" };
  switch (f.consumption ?? "open") {
    case "invoiced": return { label: "Fully invoiced", severity: "settled" };
    case "partly_invoiced": return { label: "Partly invoiced", severity: "progress" };
    case "not_chargeable": return { label: "Not chargeable", severity: "neutral" };
    default: return { label: "Approved · open", severity: "settled" };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPLAIN, DON'T MERELY FLAG
// Every defect reason opens on CLICK (touch-safe), states the reason in a full
// sentence, and — when there is one — names the specific way out.
// ════════════════════════════════════════════════════════════════════════════

type ExplainTone = "neutral" | "attention" | "blocked";

const EXPLAIN_ICON: Record<ExplainTone, string> = {
  neutral: "bg-bz-paper-warm text-bz-text-muted",
  attention: "bg-[#FBE5E2] text-[#9A2E29]",
  blocked: "bg-bz-olive/[0.08] text-bz-text",
};

export function Explain({
  children,
  className,
  title,
  body,
  exit,
  tone = "neutral",
  ariaLabel,
  width = 292,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  body: string;
  exit?: string;
  tone?: ExplainTone;
  ariaLabel?: string;
  width?: number;
}) {
  const anchor = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);

  const open = pos !== null;
  const place = () => {
    const r = anchor.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    const below = r.bottom + 8;
    const top = below + 190 > window.innerHeight ? Math.max(8, r.top - 8 - 190) : below;
    setPos({ top, left });
  };

  React.useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => {
      if (panel.current?.contains(e.target as Node)) return;
      if (anchor.current?.contains(e.target as Node)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={anchor}
        type="button"
        aria-label={ariaLabel ?? title}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          open ? setPos(null) : place();
        }}
        className={cn("text-left", className)}
      >
        {children}
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={panel}
            style={{ position: "fixed", top: pos.top, left: pos.left, width }}
            className={cn("z-[80] rounded-bz-md border border-bz-line bg-bz-surface p-3.5", SHADOW)}
          >
            <div className="flex items-start gap-2.5">
              <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-bz-sm", EXPLAIN_ICON[tone])}>
                {tone === "neutral" ? <Info size={12} /> : tone === "attention" ? <AlertTriangle size={12} /> : <Ban size={12} />}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-bz-text">{title}</p>
                <p className="mt-1 text-[11.5px] leading-[1.55] text-bz-text-muted">{body}</p>
                {exit && (
                  <p className="mt-2 border-t border-bz-line-soft pt-2 text-[11.5px] leading-[1.5] text-bz-text">
                    <span className={LABEL}>Way out</span>
                    <span className="mt-1 block">{exit}</span>
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/** The default trigger: a small circled "i" that reads as tappable. */
export function ExplainDot(props: Omit<React.ComponentProps<typeof Explain>, "children" | "className">) {
  return (
    <Explain
      {...props}
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-bz-pill border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-bz-text-muted hover:text-bz-text"
    >
      <Info size={9} />
    </Explain>
  );
}

/** A defect chip whose whole body opens the reason. */
export function DefectChip({
  label,
  tone = "attention",
  title,
  body,
  exit,
}: {
  label: string;
  tone?: ExplainTone;
  title: string;
  body: string;
  exit?: string;
}) {
  return (
    <Explain
      title={title}
      body={body}
      exit={exit}
      tone={tone}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-bz-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em]",
        tone === "attention"
          ? "bg-[#FBE5E2] text-[#9A2E29] hover:bg-[#F7D8D4]"
          : tone === "blocked"
          ? "bg-bz-olive text-bz-text-on-dark hover:opacity-90"
          : "bg-bz-paper-warm text-bz-text-muted hover:bg-bz-line-soft",
      )}
    >
      {label}
      <Info size={9} className="opacity-70" />
    </Explain>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONTROLS
// ════════════════════════════════════════════════════════════════════════════

export function Switch({
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!value);
      }}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
        disabled && "cursor-not-allowed opacity-45",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute size-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          value ? "translate-x-[14px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-0.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[7px] font-medium transition-colors",
              size === "sm" ? "h-6 px-2 text-[11px]" : "h-7 px-2.5 text-[11.5px]",
              active ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn(NUM, "text-[10px]", active ? "text-bz-text-muted" : "text-bz-text-soft")}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  disabled,
  ariaLabel,
  indeterminate,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  indeterminate?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
        checked || indeterminate ? "border-bz-olive bg-bz-olive text-bz-text-on-dark" : "border-bz-line bg-bz-surface hover:border-bz-text-muted",
        disabled && "cursor-not-allowed border-bz-line-soft bg-bz-paper-warm opacity-60 hover:border-bz-line-soft",
      )}
    >
      {indeterminate ? <span className="h-0.5 w-2 rounded-bz-pill bg-bz-text-on-dark" /> : checked ? <Check size={11} /> : null}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SEARCHABLE LOOKUP OVER A LARGE POPULATION
// Queries as you type (debounced), reveals its full list on focus, extends on
// scroll. Serves both as a narrowing control and as an identity control inside
// the hours matrix.
// ════════════════════════════════════════════════════════════════════════════

export type LookupOption = { id: string; label: string; meta?: string; disabled?: boolean };

const LOOKUP_PAGE = 8;

export function Lookup({
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder = "Type to search…",
  clearLabel,
  className,
  width,
  disabled,
  emptyIcon,
}: {
  value: string | null;
  options: LookupOption[];
  onChange: (id: string | null) => void;
  placeholder: string;
  searchPlaceholder?: string;
  clearLabel?: string;
  className?: string;
  width?: number;
  disabled?: boolean;
  emptyIcon?: React.ReactNode;
}) {
  const anchor = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [raw, setRaw] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState(1);
  const [fetching, setFetching] = React.useState(false);

  const open = pos !== null;
  const selected = options.find((o) => o.id === value) ?? null;

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setQuery(raw.trim().toLowerCase());
      setPages(1);
    }, 220);
    return () => window.clearTimeout(t);
  }, [raw]);

  React.useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => {
      if (panel.current?.contains(e.target as Node)) return;
      if (anchor.current?.contains(e.target as Node)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openPanel = () => {
    const r = anchor.current?.getBoundingClientRect();
    if (!r) return;
    const w = width ?? Math.max(r.width, 264);
    setPos({ top: Math.min(r.bottom + 6, window.innerHeight - 300), left: Math.min(r.left, window.innerWidth - w - 8), width: w });
    setRaw("");
    setQuery("");
    setPages(1);
  };

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query) || o.id.toLowerCase().includes(query) || (o.meta ?? "").toLowerCase().includes(query))
    : options;
  const visible = filtered.slice(0, pages * LOOKUP_PAGE);
  const hasMore = visible.length < filtered.length;

  const onScroll = () => {
    const el = listRef.current;
    if (!el || fetching || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setFetching(true);
      window.setTimeout(() => {
        setPages((p) => p + 1);
        setFetching(false);
      }, 380);
    }
  };

  return (
    <>
      <button
        ref={anchor}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setPos(null) : openPanel())}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border bg-bz-paper px-2.5 text-left",
          open ? "border-bz-text-muted" : "border-bz-line hover:bg-bz-paper-warm",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <Search size={12} className="shrink-0 text-bz-text-soft" />
        <span className="min-w-0 flex-1 truncate">
          {selected ? (
            <>
              <span className="text-[12.5px] text-bz-text">{selected.label}</span>
              {selected.meta && <span className="ml-1.5 text-[10.5px] text-bz-text-soft">{selected.meta}</span>}
            </>
          ) : (
            <span className="text-[12.5px] text-bz-text-soft">{placeholder}</span>
          )}
        </span>
        {selected && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line-soft"
          >
            <X size={11} />
          </span>
        )}
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panel}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width }}
            className={cn("z-[80] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface", SHADOW)}
          >
            <div className="border-b border-bz-line-soft p-2">
              <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2">
                <Search size={11} className="shrink-0 text-bz-text-muted" />
                <input
                  autoFocus
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
                />
                {raw && (
                  <button onClick={() => setRaw("")} className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface">
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
            <div ref={listRef} onScroll={onScroll} className="max-h-[248px] overflow-y-auto py-1">
              {clearLabel && (
                <>
                  <button
                    onClick={() => {
                      onChange(null);
                      setPos(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm"
                  >
                    <span className="flex size-5 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted">
                      {emptyIcon ?? <X size={10} />}
                    </span>
                    <span className="flex-1 text-[12.5px] text-bz-text">{clearLabel}</span>
                    {value === null && <Check size={12} className="text-bz-text" />}
                  </button>
                  <div className="my-1 h-px bg-bz-line-soft" />
                </>
              )}
              {visible.length === 0 ? (
                <p className="px-3 py-6 text-center text-[11.5px] text-bz-text-muted">Nothing matches “{raw}”.</p>
              ) : (
                visible.map((o) => (
                  <button
                    key={o.id}
                    disabled={o.disabled}
                    onClick={() => {
                      onChange(o.id);
                      setPos(null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-45",
                      o.id === value && "bg-bz-fire/[0.08]",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] text-bz-text">{o.label}</span>
                      {o.meta && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{o.meta}</span>}
                    </span>
                    {o.id === value && <Check size={12} className="shrink-0 text-bz-text" />}
                  </button>
                ))
              )}
              {fetching && (
                <p className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] text-bz-text-muted">
                  <Loader2 size={11} className="animate-spin text-bz-fire" /> Fetching more…
                </p>
              )}
              {!fetching && hasMore && (
                <p className={cn("px-3 py-2 text-center text-[10.5px] text-bz-text-soft", NUM)}>
                  {visible.length} of {filtered.length} — scroll for more
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MICRO-VIZ  (flat thin bars only)
// ════════════════════════════════════════════════════════════════════════════

export function MeterBar({ pct, fill, track = "bg-bz-line-soft", height = "h-1.5" }: { pct: number; fill: string; track?: string; height?: string }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-bz-pill", track, height)}>
      <div className="h-full rounded-bz-pill" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: fill }} />
    </div>
  );
}

export function StackBar({ segments, height = "h-1.5" }: { segments: { value: number; color: string }[]; height?: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className={cn("flex w-full overflow-hidden rounded-bz-pill bg-bz-line-soft", height)}>
      {segments.map((s, i) => (s.value > 0 ? <div key={i} className="h-full" style={{ width: `${(s.value / total) * 100}%`, background: s.color }} /> : null))}
    </div>
  );
}

export function Leg({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] text-bz-text-muted">
      <span className="size-1.5 rounded-bz-pill" style={{ background: color }} />
      {label} <span className={cn("font-semibold text-bz-text", NUM)}>{value}</span>
    </span>
  );
}

/** A read-at-a-glance tile. `tone="quiet"` marks a deliberately subordinate measure. */
export function Tile({
  label,
  hint,
  tone = "normal",
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  tone?: "normal" | "quiet" | "attention";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-bz-lg border p-3.5",
        tone === "attention" ? "border-[#F0CFCB] bg-[#FDF3F2]" : tone === "quiet" ? "border-bz-line-soft bg-bz-paper-warm/60" : "border-bz-line-soft bg-bz-surface",
      )}
    >
      <div className="flex items-center gap-1.5">
        <p className={cn(LABEL, "truncate")}>{label}</p>
        {hint}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function BigNum({ value, unit, tone }: { value: string; unit?: string; tone?: "attention" | "quiet" }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      <span
        className={cn(
          "text-[19px] font-semibold leading-none",
          NUM,
          tone === "attention" ? "text-[#9A2E29]" : tone === "quiet" ? "text-bz-text-muted" : "text-bz-text",
        )}
      >
        {value}
      </span>
      {unit && <span className="text-[10.5px] text-bz-text-muted">{unit}</span>}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// READING STATES  —  loading / empty / no-match / FAILED (its own honest state)
// ════════════════════════════════════════════════════════════════════════════

export type ReadState = "loading" | "ready" | "empty" | "failed";

export function LoadingRows({ rows = 6, label = "Loading…" }: { rows?: number; label?: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center gap-2 py-5 text-bz-text-muted">
        <Loader2 size={15} className="animate-spin text-bz-fire" />
        <span className="text-[12.5px] font-medium">{label}</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-bz-line-soft px-4 py-3.5">
          <div className="h-3 w-16 shrink-0 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="h-3 flex-1 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="hidden h-3 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm sm:block" />
          <div className="h-5 w-24 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
        </div>
      ))}
    </div>
  );
}

export function StateBlock({
  icon,
  title,
  body,
  action,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
  action?: React.ReactNode;
  tone?: "neutral" | "positive" | "danger";
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center md:py-20">
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-bz-md",
          tone === "positive" ? "bg-bz-fire/[0.18] text-bz-text" : tone === "danger" ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text-muted",
        )}
      >
        {icon}
      </span>
      <p className="text-[14px] font-semibold text-bz-text">{title}</p>
      <div className="max-w-sm text-[12px] leading-[1.6] text-bz-text-muted">{body}</div>
      {action}
    </div>
  );
}

/**
 * The dedicated failure state. Today a failed read is indistinguishable from an
 * empty one everywhere in this module — this is the design's answer to that.
 */
export function FailedBlock({ what, onRetry, detail }: { what: string; onRetry: () => void; detail?: string }) {
  return (
    <StateBlock
      tone="danger"
      icon={<AlertTriangle size={22} />}
      title={`Couldn’t load ${what}`}
      body={
        <>
          Nothing below is current — this is a failed read, not an empty result.
          {detail && <span className="mt-1.5 block rounded-bz-sm bg-bz-paper-warm px-2 py-1.5 text-[11px] text-bz-text">{detail}</span>}
        </>
      }
      action={
        <button onClick={onRetry} className={cn(GHOST_BTN, "mt-1")}>
          <RotateCcw size={13} /> Try again
        </button>
      }
    />
  );
}

export function EmptyBlock({ title, body, action }: { title: string; body: React.ReactNode; action?: React.ReactNode }) {
  return <StateBlock icon={<Inbox size={22} />} title={title} body={body} action={action} />;
}

// ════════════════════════════════════════════════════════════════════════════
// VOLUME READOUT  —  a capped fetch is stated, never implied
// ════════════════════════════════════════════════════════════════════════════

export function VolumeFoot({
  shown,
  total,
  noun,
  onMore,
  loadingMore,
  note,
}: {
  shown: number;
  total: number;
  noun: string;
  onMore?: () => void;
  loadingMore?: boolean;
  note?: string;
}) {
  const all = shown >= total;
  return (
    <div className="flex flex-col items-center gap-2 border-t border-bz-line-soft px-4 py-3.5">
      <p className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
        Showing <span className="font-semibold text-bz-text">{shown}</span> of {total} {noun}
      </p>
      {all ? (
        <p className="inline-flex items-center gap-1.5 text-[11px] text-bz-text-soft">
          <Check size={12} className="text-bz-leaf-deep" /> Everything in range is loaded
        </p>
      ) : (
        <>
          {onMore && (
            <button onClick={onMore} disabled={loadingMore} className={GHOST_BTN_SM}>
              {loadingMore ? (
                <>
                  <Loader2 size={11} className="animate-spin" /> Fetching…
                </>
              ) : (
                `Fetch the next ${Math.min(total - shown, 10)}`
              )}
            </button>
          )}
          {note && <p className="max-w-sm text-center text-[10.5px] text-bz-text-soft">{note}</p>}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SEQUENTIAL BULK RUNNER  —  one at a time, live progress, honest completion
// A failure on one entry never aborts the rest; the completion message reports
// the split and lists the DISTINCT failure reasons. Both bulk surfaces use it.
// ════════════════════════════════════════════════════════════════════════════

export type BulkRun = {
  total: number;
  done: number;
  ok: number;
  failed: { id: string; reason: string }[];
  finished: boolean;
  verb: string;
};

export function useBulkRunner() {
  const [run, setRun] = React.useState<BulkRun | null>(null);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const start = (
    ids: string[],
    verb: string,
    resolveOne: (id: string) => string | null, // null ⇒ success, string ⇒ refusal reason
    onEach?: (id: string, reason: string | null) => void,
  ) => {
    setRun({ total: ids.length, done: 0, ok: 0, failed: [], finished: false, verb });
    ids.forEach((id, i) => {
      const t = window.setTimeout(() => {
        const reason = resolveOne(id);
        onEach?.(id, reason);
        setRun((r) =>
          r
            ? {
                ...r,
                done: r.done + 1,
                ok: r.ok + (reason ? 0 : 1),
                failed: reason ? [...r.failed, { id, reason }] : r.failed,
                finished: r.done + 1 >= r.total,
              }
            : r,
        );
      }, 420 * (i + 1));
      timers.current.push(t);
    });
  };

  return { run, start, clear: () => setRun(null) };
}

export function BulkProgress({ run, onDismiss }: { run: BulkRun; onDismiss: () => void }) {
  const pct = Math.round((run.done / Math.max(1, run.total)) * 100);
  const reasons = Array.from(new Set(run.failed.map((f) => f.reason)));
  return (
    <div className="border-t border-bz-line bg-bz-paper px-4 py-3 md:px-6">
      {!run.finished ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 text-[12px] text-bz-text">
              <Loader2 size={13} className="shrink-0 animate-spin text-bz-fire" />
              <span className="truncate">
                {run.verb} — <span className={cn("font-semibold", NUM)}>{run.done}</span> of{" "}
                <span className={NUM}>{run.total}</span> done,{" "}
                <span className={NUM}>{run.total - run.done}</span> to go
              </span>
            </p>
            <span className={cn("shrink-0 text-[12px] font-semibold text-bz-text", NUM)}>{pct}%</span>
          </div>
          <div className="mt-2">
            <MeterBar pct={pct} fill="var(--bz-olive)" />
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[12.5px] font-medium text-bz-text">
              {run.failed.length === 0 ? (
                <>
                  <Check size={13} className="text-bz-leaf-deep" /> {run.verb} finished — all{" "}
                  <span className={NUM}>{run.ok}</span> succeeded.
                </>
              ) : (
                <>
                  <AlertTriangle size={13} className="text-[#C0413A]" /> {run.verb} finished —{" "}
                  <span className={NUM}>{run.ok}</span> succeeded, <span className={NUM}>{run.failed.length}</span> refused.
                </>
              )}
            </p>
            {reasons.length > 0 && (
              <ul className="mt-1.5 flex flex-col gap-1">
                {reasons.map((r) => (
                  <li key={r} className="flex items-start gap-1.5 text-[11.5px] leading-[1.5] text-bz-text-muted">
                    <span className="mt-1.5 size-1 shrink-0 rounded-bz-pill bg-[#C0413A]" />
                    <span>
                      {r}{" "}
                      <span className={cn("text-bz-text-soft", NUM)}>
                        ({run.failed.filter((f) => f.reason === r).map((f) => f.id).join(", ")})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={onDismiss} className={GHOST_BTN_SM}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM  +  TOAST
// ════════════════════════════════════════════════════════════════════════════

export function Confirm({
  open,
  title,
  body,
  confirmLabel,
  tone = "danger",
  onCancel,
  onConfirm,
  extra,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  tone?: "danger" | "normal";
  onCancel: () => void;
  onConfirm: () => void;
  extra?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div onClick={onCancel} className="absolute inset-0 bg-bz-olive/40 backdrop-blur-[2px]" aria-hidden />
      <div role="dialog" aria-modal className={cn("relative w-full max-w-[420px] rounded-bz-lg border border-bz-line bg-bz-surface p-5", SHADOW)}>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-bz-md",
              tone === "danger" ? "bg-[#FBE5E2] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text",
            )}
          >
            {tone === "danger" ? <AlertTriangle size={16} /> : <Info size={16} />}
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-bz-text">{title}</p>
            <div className="mt-1.5 text-[12px] leading-[1.6] text-bz-text-muted">{body}</div>
          </div>
        </div>
        {extra && <div className="mt-4">{extra}</div>}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onCancel} className={GHOST_BTN}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-bz-md px-3.5 text-[12px] font-semibold",
              tone === "danger" ? "bg-[#9A2E29] text-white hover:opacity-95" : "bg-bz-deep text-bz-text-on-dark hover:opacity-95",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export type ToastState = { kind: "success" | "error" | "info"; message: string; id: number } | null;

export function Toast({ toast, onDismiss, offset = "bottom-20" }: { toast: ToastState; onDismiss: () => void; offset?: string }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4600);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  return (
    <div className={cn("pointer-events-none fixed inset-x-0 z-[70] flex justify-center px-4", offset)}>
      <div className={cn("pointer-events-auto flex max-w-[560px] items-start gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5", SHADOW)}>
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-pill",
            toast.kind === "error" ? "bg-[#FBE7E5]" : toast.kind === "info" ? "bg-bz-paper-warm" : "bg-bz-fire/[0.22]",
          )}
        >
          {toast.kind === "error" ? <Ban size={12} className="text-[#9A2E29]" /> : toast.kind === "info" ? <Info size={12} className="text-bz-text-muted" /> : <Check size={13} className="text-bz-leaf-deep" />}
        </span>
        <p className="text-[12.5px] leading-[1.5] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<ToastState>(null);
  const show = React.useCallback((kind: "success" | "error" | "info", message: string) => setToast({ kind, message, id: Date.now() }), []);
  return { toast, show, clear: () => setToast(null) };
}

// ════════════════════════════════════════════════════════════════════════════
// STATE PREVIEW  —  a design-preview affordance, not product chrome.
// Every state named in the brief must be reachable in the mock; this is how.
// ════════════════════════════════════════════════════════════════════════════

export function StatePreview<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const anchor = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const open = pos !== null;

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panel.current?.contains(e.target as Node) || anchor.current?.contains(e.target as Node)) return;
      setPos(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <>
      <button
        ref={anchor}
        type="button"
        title="Preview a state"
        aria-label="Preview a state"
        onClick={() => {
          if (open) return setPos(null);
          const r = anchor.current?.getBoundingClientRect();
          if (r) setPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 232) });
        }}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-bz-md border text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
          open ? "border-bz-text-muted bg-bz-paper-warm" : "border-bz-line-soft bg-bz-surface",
        )}
      >
        <FlaskConical size={13} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={panel}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: 224 }}
            className={cn("z-[80] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1", SHADOW)}
          >
            <p className={cn(LABEL, "px-3 pb-1 pt-1.5")}>Preview a state</p>
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setPos(null);
                }}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm", o.value === value && "bg-bz-fire/[0.08]")}
              >
                <span className="flex-1 text-[12px] text-bz-text">{o.label}</span>
                {o.value === value && <Check size={12} className="text-bz-text" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MONEY GRANT
// Monetary measures are ABSENT from the data for a viewer without the grant —
// never present-and-hidden. The toggle below simulates the two viewer shapes.
// ════════════════════════════════════════════════════════════════════════════

export function GrantToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-1.5">
      <span className={cn(LABEL, "whitespace-nowrap")}>Money grant</span>
      <Switch value={value} onChange={onChange} ariaLabel="Preview with or without the money grant" />
      <span className={cn("whitespace-nowrap text-[11px] font-medium", value ? "text-bz-text" : "text-bz-text-muted")}>
        {value ? "on" : "off"}
      </span>
      <ExplainDot
        title="Two honest shapes"
        body="Monetary measures are decided by the viewer's grant and communicated by the data simply not containing them. Without the grant the rates, amounts and budgets are absent — not blanked out, not zeroed — and the reading stays complete on hours alone."
        exit="Flip this switch to preview the surface exactly as a filer (who never receives money) sees it."
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BREADCRUMB
// ════════════════════════════════════════════════════════════════════════════

export function Crumb({ page }: { page: string }) {
  return (
    <>
      <span className="text-bz-text-muted">Timesheets</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">{page}</span>
    </>
  );
}

/** Every surface announces itself in the surrounding chrome while it is open. */
export function useDocumentTitle(title: string) {
  React.useEffect(() => {
    const prev = document.title;
    document.title = `${title} · Bizak`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}

// ════════════════════════════════════════════════════════════════════════════
// SEED UNIVERSE  —  one cast, shared by all seven surfaces so the readings
// reconcile with each other (a person's hours here are that person's hours
// there). NPR, Bizak Nepal, Bikram Sambat period labels.
// ════════════════════════════════════════════════════════════════════════════

export type Person = { id: string; name: string; team: string };

export const PEOPLE: Person[] = [
  { id: "EMP-0142", name: "Anjali Shrestha", team: "Delivery · Kathmandu" },
  { id: "EMP-0157", name: "Bibek Gurung", team: "Delivery · Kathmandu" },
  { id: "EMP-0163", name: "Sunita Rai", team: "Design · Lalitpur" },
  { id: "EMP-0171", name: "Prakash Thapa", team: "Delivery · Pokhara" },
  { id: "EMP-0188", name: "Nisha Karki", team: "Quality · Kathmandu" },
  { id: "EMP-0194", name: "Rajesh Maharjan", team: "Delivery · Kathmandu" },
  { id: "EMP-0203", name: "Kritika Adhikari", team: "Support · Lalitpur" },
  { id: "EMP-0209", name: "Dipesh Lama", team: "Delivery · Pokhara" },
  { id: "EMP-0215", name: "Sabina Tamang", team: "Consulting · Kathmandu" },
  { id: "EMP-0221", name: "Manish Poudel", team: "Delivery · Biratnagar" },
  { id: "EMP-0230", name: "Rita Bhattarai", team: "Consulting · Kathmandu" },
  { id: "EMP-0238", name: "Suraj Khadka", team: "Quality · Kathmandu" },
  { id: "EMP-0244", name: "Pooja Basnet", team: "Design · Lalitpur" },
  { id: "EMP-0251", name: "Nabin Shakya", team: "Support · Kathmandu" },
];

export const personById = (id: string) => PEOPLE.find((p) => p.id === id);
export const ME = PEOPLE[0]; // the filer whose own record surface A shows

export const PEOPLE_OPTIONS: LookupOption[] = PEOPLE.map((p) => ({ id: p.id, label: p.name, meta: `${p.id} · ${p.team}` }));

export type Client = { id: string; name: string };
export const CLIENTS: Client[] = [
  { id: "C-1029", name: "Apex Manufacturing Pvt Ltd" },
  { id: "C-1003", name: "Himalayan Traders" },
  { id: "C-1044", name: "Everest Hardware Supplies" },
  { id: "C-1011", name: "Annapurna Distributors" },
];
export const clientById = (id: string) => CLIENTS.find((c) => c.id === id);

export type Project = { id: string; name: string; clientId: string | null; parent: string | null; budget?: number };

export const PROJECTS: Project[] = [
  { id: "PRJ-014", name: "Apex ERP Rollout", clientId: "C-1029", parent: null, budget: 4800000 },
  { id: "PRJ-014-1", name: "Phase 1 · Finance", clientId: "C-1029", parent: "PRJ-014", budget: 2100000 },
  { id: "PRJ-014-2", name: "Phase 2 · Inventory", clientId: "C-1029", parent: "PRJ-014", budget: 1700000 },
  { id: "PRJ-014-2-A", name: "Warehouse cutover", clientId: "C-1029", parent: "PRJ-014-2", budget: 640000 },
  { id: "PRJ-021", name: "Himalayan POS Deployment", clientId: "C-1003", parent: null, budget: 1650000 },
  { id: "PRJ-030", name: "Everest Portal Revamp", clientId: "C-1044", parent: null, budget: 950000 },
  { id: "PRJ-002", name: "Internal R&D", clientId: null, parent: null, budget: 1200000 },
];
export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);
export const PROJECT_OPTIONS: LookupOption[] = PROJECTS.map((p) => ({
  id: p.id,
  label: p.name,
  meta: `${p.id}${p.clientId ? ` · ${clientById(p.clientId)?.name}` : " · internal"}`,
}));

export type Task = { id: string; name: string; projectId: string | null; completed?: boolean };

export const TASKS: Task[] = [
  { id: "TSK-4410", name: "Chart of accounts migration", projectId: "PRJ-014-1" },
  { id: "TSK-4421", name: "Opening balance reconciliation", projectId: "PRJ-014-1" },
  { id: "TSK-4437", name: "Stock take procedure", projectId: "PRJ-014-2" },
  { id: "TSK-4455", name: "Warehouse bin mapping", projectId: "PRJ-014-2-A" },
  { id: "TSK-4489", name: "Sprint 14 — POS receipts", projectId: "PRJ-021" },
  { id: "TSK-4494", name: "Terminal hardware pilot", projectId: "PRJ-021", completed: true },
  { id: "TSK-4502", name: "Client training — batch 2", projectId: "PRJ-030" },
  { id: "TSK-4517", name: "Accessibility audit", projectId: null },
  { id: "TSK-4523", name: "Support rota — May", projectId: null },
  { id: "TSK-4530", name: "Costing engine spike", projectId: "PRJ-002" },
];
export const taskById = (id: string) => TASKS.find((t) => t.id === id);
export const TASK_OPTIONS: LookupOption[] = TASKS.map((t) => ({
  id: t.id,
  label: t.name,
  meta: `${t.id}${t.projectId ? ` · ${projectById(t.projectId)?.name}` : " · no project"}${t.completed ? " · completed" : ""}`,
}));

export type Activity = { id: string; name: string; sellable: boolean };

export const ACTIVITIES: Activity[] = [
  { id: "ACT-DEV", name: "Development", sellable: true },
  { id: "ACT-CON", name: "Consulting", sellable: true },
  { id: "ACT-MIG", name: "Data migration", sellable: true },
  { id: "ACT-TRN", name: "Training", sellable: true },
  { id: "ACT-QA", name: "QA testing", sellable: true },
  { id: "ACT-PM", name: "Project management", sellable: true },
  { id: "ACT-SUP", name: "Support", sellable: true },
  { id: "ACT-TRV", name: "Travel", sellable: false },
  { id: "ACT-ADM", name: "Internal admin", sellable: false },
];
export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id);

// ── the working calendar ────────────────────────────────────────────────────
// NOTHING here is derived in code: the week starts on Sunday because THIS
// organisation says so, Saturday is the single non-working day because THIS
// organisation says so, and the period is a Bikram Sambat month whose name and
// length cannot be computed from a Gregorian date.

export type Day = {
  iso: string;
  bs: number; // day-of-month in the local calendar
  expected: number;
  holiday?: string;
  leave?: string;
  nonWorking?: string;
};

function mkDay(iso: string, bs: number, expected: number, extra: Partial<Day> = {}): Day {
  return { iso, bs, expected, ...extra };
}

/** Jestha 2083 — 31 days, 15 May → 14 Jun 2026. */
export const PERIOD_DAYS: Day[] = [
  mkDay("2026-05-15", 1, 8),
  mkDay("2026-05-16", 2, 0, { nonWorking: "Saturday is this organisation's weekly off day." }),
  mkDay("2026-05-17", 3, 8),
  mkDay("2026-05-18", 4, 8),
  mkDay("2026-05-19", 5, 8),
  mkDay("2026-05-20", 6, 8),
  mkDay("2026-05-21", 7, 8),
  mkDay("2026-05-22", 8, 8),
  mkDay("2026-05-23", 9, 0, { nonWorking: "Saturday is this organisation's weekly off day." }),
  mkDay("2026-05-24", 10, 8),
  mkDay("2026-05-25", 11, 8),
  mkDay("2026-05-26", 12, 8),
  mkDay("2026-05-27", 13, 8),
  mkDay("2026-05-28", 14, 8),
  mkDay("2026-05-29", 15, 0, { holiday: "Republic Day (Ganatantra Diwas) — a public holiday on the company calendar." }),
  mkDay("2026-05-30", 16, 0, { nonWorking: "Saturday is this organisation's weekly off day." }),
  mkDay("2026-05-31", 17, 8),
  mkDay("2026-06-01", 18, 8),
  mkDay("2026-06-02", 19, 8),
  mkDay("2026-06-03", 20, 8),
  mkDay("2026-06-04", 21, 0, { leave: "Annual leave — approved by Rajesh Maharjan on 12 Baishakh." }),
  mkDay("2026-06-05", 22, 0, { leave: "Annual leave — approved by Rajesh Maharjan on 12 Baishakh." }),
  mkDay("2026-06-06", 23, 0, { nonWorking: "Saturday is this organisation's weekly off day." }),
  mkDay("2026-06-07", 24, 8),
  mkDay("2026-06-08", 25, 8),
  mkDay("2026-06-09", 26, 8),
  mkDay("2026-06-10", 27, 8),
  mkDay("2026-06-11", 28, 8),
  mkDay("2026-06-12", 29, 8),
  mkDay("2026-06-13", 30, 0, { nonWorking: "Saturday is this organisation's weekly off day." }),
  mkDay("2026-06-14", 31, 8),
];

export const PERIOD_LABEL = "Jestha 2083";
export const PERIOD_RANGE = "15 May – 14 Jun 2026";
export const PERIOD_EXPECTED = PERIOD_DAYS.reduce((s, d) => s + d.expected, 0);

/**
 * Week-sized stretches. The organisation's week starts on Sunday, so the first
 * and last stretches are partial — which is exactly why stretch boundaries are
 * data and not arithmetic.
 */
export type Stretch = { key: string; label: string; days: Day[] };

export function buildStretches(days: Day[]): Stretch[] {
  const out: Stretch[] = [];
  let cur: Day[] = [];
  days.forEach((d) => {
    if (weekdayOf(d.iso) === "Sun" && cur.length) {
      out.push({ key: `w${out.length + 1}`, label: `Week ${out.length + 1}`, days: cur });
      cur = [];
    }
    cur.push(d);
  });
  if (cur.length) out.push({ key: `w${out.length + 1}`, label: `Week ${out.length + 1}`, days: cur });
  return out;
}

export const dayByIso = (iso: string) => PERIOD_DAYS.find((d) => d.iso === iso);
export const isNonWorking = (d: Day) => d.expected === 0;
