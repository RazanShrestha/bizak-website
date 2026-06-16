import * as React from "react";
import { createPortal } from "react-dom";
import { Check, X, Loader2, Search, ChevronDown, Ban, Minus, Plus } from "lucide-react";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// POS KIT  shared vocabulary for the three Point-of-Sale screens
// (Setup wizard → Start Session gate → live Terminal). One currency formatter,
// one item-token mapping, one Modal/Toast/Switch/Field set, and the
// denomination cash-count widget reused by Start-Session AND the terminal's
// session-close reconciliation. Pages compose these; nothing here owns layout.
//
// House context: Bizak Nepal, NPR. The currency symbol is a single data-driven
// affordance — change CURRENCY here and every cash readout on every POS screen
// follows.
// ════════════════════════════════════════════════════════════════════════════

export const NUM = "tabular-nums";
export const CURRENCY = "Rs"; // configurable session currency symbol (NPR)

// ── money formatting (fixed 2dp, grouped) ──
export function fmt(n: number, dp = 2): string {
  return (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}
export const fmt0 = (n: number) => fmt(n, 0);
export const cur = (n: number, dp = 2) => `${CURRENCY} ${fmt(n, dp)}`;

/** Prominent money readout — small muted symbol + tabular number. */
export function Money({
  n,
  className,
  symbolClassName,
  dp = 2,
  sign,
}: {
  n: number;
  className?: string;
  symbolClassName?: string;
  dp?: number;
  sign?: "neg";
}) {
  return (
    <span className={cn("whitespace-nowrap", NUM, className)}>
      <span className={cn("font-medium text-bz-text-muted", symbolClassName)}>{CURRENCY} </span>
      {sign === "neg" ? "−" : ""}
      {fmt(Math.abs(n), dp)}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VALUE → TOKEN  every item gets a visual token: its image, or a deterministic
// initial on a cycling fallback tint (a stable hash, so the colour is stable
// per item regardless of cart position).
// ════════════════════════════════════════════════════════════════════════════

const TOKEN_TINTS = [
  { bg: "bg-bz-fire/[0.20]", fg: "text-bz-text" },
  { bg: "bg-bz-leaf/60", fg: "text-bz-text" },
  { bg: "bg-bz-paper-warm", fg: "text-bz-text-muted" },
  { bg: "bg-bz-olive/[0.10]", fg: "text-bz-olive" },
  { bg: "bg-bz-leaf-deep/30", fg: "text-bz-text" },
];

export function hashTint(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % TOKEN_TINTS.length;
}

export function ItemToken({
  name,
  seed,
  size = 34,
  className,
}: {
  name: string;
  seed?: string;
  size?: number;
  className?: string;
}) {
  const tint = TOKEN_TINTS[hashTint(seed ?? name)];
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-bz-md font-semibold", tint.bg, tint.fg, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initial}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STATUS VOCABULARY  the same five-tone chip the rest of the app uses
// ════════════════════════════════════════════════════════════════════════════

export type Tone = "positive" | "partial" | "pending" | "danger" | "neutral";

const CHIP_BG: Record<Tone, string> = {
  positive: "bg-bz-fire/[0.18] text-bz-text",
  partial: "bg-bz-leaf/50 text-bz-text",
  pending: "bg-bz-paper-warm text-bz-text-muted",
  danger: "bg-[#FBE5E2] text-[#9A2E29]",
  neutral: "bg-bz-paper-warm text-bz-text",
};
const DOT_BG: Record<Tone, string> = {
  positive: "bg-bz-leaf-deep",
  partial: "bg-bz-fire",
  pending: "bg-bz-line",
  danger: "bg-[#C0413A]",
  neutral: "bg-bz-text-soft",
};

export function StatusChip({ label, tone, dot = true, className }: { label: string; tone: Tone; dot?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-bz-sm px-2 py-0.5 text-[11px] font-medium", CHIP_BG[tone], className)}>
      {dot && <span className={cn("size-1.5 shrink-0 rounded-bz-pill", DOT_BG[tone])} />}
      {label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BUTTONS  shared class strings (className-over-style)
// ════════════════════════════════════════════════════════════════════════════

export const PRIMARY_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50";
export const GHOST_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-50";
export const SUBTLE_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md bg-bz-paper-warm px-3 text-[12.5px] font-medium text-bz-text hover:bg-bz-line/40 disabled:cursor-not-allowed disabled:opacity-50";
export const DANGER_BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-bz-md border border-[#E7B9B3] bg-[#FBE7E5] px-3 text-[12.5px] font-medium text-[#9A2E29] hover:bg-[#F8DAD6] disabled:cursor-not-allowed disabled:opacity-50";

export function Spinner({ size = 13, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn("animate-spin", className)} />;
}

/** Keyboard key-cap (Inter only — differentiated by weight/letter-spacing, not a mono swap). */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded-bz-sm border border-bz-line bg-bz-paper-warm px-1.5 text-[10.5px] font-semibold tracking-tight text-bz-text-muted",
        NUM,
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/** Tiny uppercase section label used across the POS screens. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft", className)}>{children}</p>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════════════════════════════════

export function useEscClose(open: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

export function useOutsideClose<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  return ref;
}

export function useAnchoredPos(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, [open, anchorRef]);
  return pos;
}

// ════════════════════════════════════════════════════════════════════════════
// FORM ATOMS  field shell · text / number inputs · segmented · switch · checkbox
// ════════════════════════════════════════════════════════════════════════════

const INPUT_BASE =
  "h-9 w-full rounded-bz-md border bg-bz-surface px-3 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft transition-colors";
const INPUT_OK = "border-bz-line-soft focus:border-bz-text";
const INPUT_ERR = "border-[#C0413A] focus:border-[#9A2E29]";

export function Field({
  label,
  required,
  hint,
  htmlFor,
  className,
  children,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label htmlFor={htmlFor} className="text-[11px] font-medium text-bz-text-muted">
            {label}
            {required && <span className="ml-0.5 text-bz-fire" title="Required">*</span>}
          </label>
          {hint && <span className="text-[10px] text-bz-text-soft">{hint}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  error,
  disabled,
  readOnly,
  id,
  type = "text",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={cn(INPUT_BASE, error ? INPUT_ERR : INPUT_OK, (disabled || readOnly) && "bg-bz-paper-warm text-bz-text-muted", className)}
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2 text-[13px] leading-relaxed text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
    />
  );
}

/** Numeric input with a currency / unit affordance. Clamps to >= min on blur. */
export function NumberInput({
  value,
  onChange,
  placeholder,
  error,
  disabled,
  min = 0,
  max,
  align = "left",
  prefix,
  suffix,
  id,
  size = "md",
  className,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  align?: "left" | "right";
  prefix?: string;
  suffix?: string;
  id?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [raw, setRaw] = React.useState(value == null ? "" : String(value));
  React.useEffect(() => {
    setRaw((prev) => {
      const prevNum = prev === "" || prev === "." ? undefined : Number(prev);
      if (prevNum === value || (prevNum == null && value == null)) return prev;
      return value == null ? "" : String(value);
    });
  }, [value]);
  return (
    <div
      className={cn(
        "flex items-center rounded-bz-md border bg-bz-surface px-2.5 transition-colors focus-within:border-bz-text",
        size === "sm" ? "h-8" : "h-9",
        error ? INPUT_ERR : "border-bz-line-soft",
        disabled && "bg-bz-paper-warm",
        className,
      )}
    >
      {prefix && <span className="mr-1 text-[11px] text-bz-text-soft">{prefix}</span>}
      <input
        id={id}
        inputMode="decimal"
        value={raw}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || /^\d*\.?\d*$/.test(v)) {
            setRaw(v);
            onChange(v === "" || v === "." ? undefined : Number(v));
          }
        }}
        onBlur={() => {
          if (raw === "" || raw === ".") {
            onChange(undefined);
            setRaw("");
            return;
          }
          let n = Number(raw);
          if (min != null && n < min) n = min;
          if (max != null && n > max) n = max;
          onChange(n);
          setRaw(String(n));
        }}
        className={cn(
          "h-full w-full bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft",
          NUM,
          align === "right" && "text-right",
          disabled && "text-bz-text-muted",
        )}
      />
      {suffix && <span className="ml-1 text-[11px] text-bz-text-soft">{suffix}</span>}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
}: {
  options: { id: T; label: string; icon?: React.ComponentType<{ size?: number; className?: string }> }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div className={cn("grid grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5", className)}>
      {options.map((opt) => {
        const active = opt.id === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-bz-sm font-medium transition-colors",
              size === "sm" ? "h-6 px-2 text-[11px]" : "h-7 px-3 text-[12px]",
              active ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {Icon && <Icon size={size === "sm" ? 11 : 13} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({ value, onChange, disabled, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
        disabled && "opacity-50",
      )}
    >
      <span className={cn("pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform", value ? "translate-x-[14px]" : "translate-x-[2px]")} />
    </button>
  );
}

export function Checkbox({ value, onChange, label, disabled, size = 18 }: { value: boolean; onChange: (v: boolean) => void; label?: React.ReactNode; disabled?: boolean; size?: number }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn("inline-flex items-center gap-2 text-left", disabled && "opacity-50")}
    >
      <span
        className={cn("flex shrink-0 items-center justify-center rounded-bz-sm border transition-colors", value ? "border-bz-fire bg-bz-fire text-bz-olive" : "border-bz-line bg-bz-surface text-transparent")}
        style={{ width: size, height: size }}
      >
        <Check size={Math.round(size * 0.62)} strokeWidth={3} />
      </span>
      {label && <span className="text-[12.5px] text-bz-text">{label}</span>}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIGHT SELECT  small anchored single-select (shift, payment-type, …). For the
// heavy searchable/paginated picker, pages compose their own off this pattern.
// ════════════════════════════════════════════════════════════════════════════

export type SelectOpt = { id: string; label: string; sub?: string; meta?: string };

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  error,
  size = "md",
  icon: Icon,
  className,
}: {
  value: SelectOpt | null;
  onChange: (o: SelectOpt) => void;
  options: SelectOpt[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md";
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  className?: string;
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const pos = useAnchoredPos(open, btnRef);
  const ref = React.useRef<HTMLDivElement>(null);
  useEscClose(open, () => setOpen(false));
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className={className}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-bz-md border px-2.5 text-left transition-colors",
          size === "sm" ? "h-8" : "h-9",
          disabled ? "cursor-default border-bz-line-soft bg-bz-paper-warm" : open ? "border-bz-text bg-bz-surface" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
          error && "border-[#C0413A]",
        )}
      >
        {Icon && <Icon size={size === "sm" ? 12 : 13} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("min-w-0 flex-1 truncate", NUM, size === "sm" ? "text-[12px]" : "text-[13px]", value ? "text-bz-text" : "text-bz-text-soft")}>
          {value ? value.label : placeholder}
        </span>
        {value?.meta && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{value.meta}</span>}
        {!disabled && <ChevronDown size={size === "sm" ? 12 : 13} className={cn("shrink-0 text-bz-text-muted transition-transform", open && "rotate-180")} />}
      </button>
      {open && pos && createPortal(
        <div
          ref={ref}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 220) }}
          className="z-50 max-h-[280px] overflow-y-auto rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
        >
          {options.map((o) => {
            const selected = value?.id === o.id;
            return (
              <button
                key={o.id}
                onClick={() => { onChange(o); setOpen(false); }}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bz-paper-warm", selected && "bg-bz-fire/[0.06]")}
              >
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[12.5px] text-bz-text", NUM)}>{o.label}</span>
                  {o.sub && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{o.sub}</span>}
                </span>
                {o.meta && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{o.meta}</span>}
                {selected && <Check size={13} className="shrink-0 text-bz-text" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODAL SHELL  portal · esc-close · header / scrollable body / footer
// ════════════════════════════════════════════════════════════════════════════

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  width = 460,
  children,
  footer,
  bodyClassName,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  bodyClassName?: string;
}) {
  useEscClose(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-bz-olive-dark/40 p-4 py-[6vh]" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: width }}
        className="overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_30px_70px_-20px_rgba(15,20,17,0.32)]"
      >
        <div className="flex items-start gap-3 border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-3.5">
          {Icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper">
              <Icon size={16} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-semibold tracking-tight text-bz-text">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-bz-text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
            <X size={15} />
          </button>
        </div>
        <div className={cn("max-h-[64vh] overflow-y-auto p-4", bodyClassName)}>{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper-warm/30 px-4 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

export type ToastKind = "success" | "error" | "info";
export type ToastState = { kind: ToastKind; message: string; id: number } | null;

export function useToast() {
  const [toast, setToast] = React.useState<ToastState>(null);
  const idRef = React.useRef(0);
  const show = React.useCallback((kind: ToastKind, message: string) => setToast({ kind, message, id: ++idRef.current }), []);
  const clear = React.useCallback(() => setToast(null), []);
  return { toast, show, clear };
}

export function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const ok = toast.kind === "success";
  const info = toast.kind === "info";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.24)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", ok ? "bg-bz-fire/[0.22]" : info ? "bg-bz-leaf/50" : "bg-[#FBE7E5]")}>
          {ok ? <Check size={13} className="text-bz-leaf-deep" /> : info ? <Check size={13} className="text-bz-text" /> : <Ban size={12} className="text-[#9A2E29]" />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CASH-COUNT  denomination drawer-counting widget. Shared by Start-Session
// (opening float) and the terminal's session-close reconciliation (closing
// cash). Each row subtotal = denomination × qty; the grand total is derived
// live via cashTotal(). Negative quantities clamp to zero.
// ════════════════════════════════════════════════════════════════════════════

export const DENOMINATIONS = [1000, 500, 100, 50, 20, 10, 5, 2, 1];

export type CashCounts = Record<number, number>;

export const emptyCounts = (): CashCounts => Object.fromEntries(DENOMINATIONS.map((d) => [d, 0]));

export const cashTotal = (counts: CashCounts) => DENOMINATIONS.reduce((s, d) => s + d * (counts[d] || 0), 0);

export const countedPieces = (counts: CashCounts) => DENOMINATIONS.reduce((s, d) => s + (counts[d] || 0), 0);

export function CashCount({
  counts,
  onChange,
  readOnly,
}: {
  counts: CashCounts;
  onChange: (next: CashCounts) => void;
  readOnly?: boolean;
}) {
  const setQty = (d: number, qty: number) => onChange({ ...counts, [d]: Math.max(0, Math.floor(qty || 0)) });
  const total = cashTotal(counts);
  const pieces = countedPieces(counts);
  return (
    <div className="overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-bz-line-soft bg-bz-paper-warm/60 px-3 py-2">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Denomination</span>
        <span className="px-2 text-[9.5px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Count</span>
        <span className="text-right text-[9.5px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Subtotal</span>
      </div>
      <div className="divide-y divide-bz-line-soft">
        {DENOMINATIONS.map((d) => {
          const qty = counts[d] || 0;
          const sub = d * qty;
          return (
            <div key={d} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-1.5">
              <span className={cn("text-[12.5px] font-medium text-bz-text", NUM)}>
                <span className="text-[10px] font-normal text-bz-text-soft">{CURRENCY} </span>
                {fmt0(d)}
              </span>
              {readOnly ? (
                <span className={cn("w-[88px] px-2 text-center text-[12.5px] text-bz-text-muted", NUM)}>{fmt0(qty)}</span>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQty(d, qty - 1)}
                    disabled={qty <= 0}
                    aria-label={`Less ${d}`}
                    className="flex size-6 items-center justify-center rounded-bz-sm border border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm disabled:opacity-40"
                  >
                    <Minus size={11} />
                  </button>
                  <input
                    inputMode="numeric"
                    value={qty === 0 ? "" : String(qty)}
                    placeholder="0"
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setQty(d, v === "" ? 0 : Number(v));
                    }}
                    className={cn("h-7 w-12 rounded-bz-sm border border-bz-line-soft bg-bz-surface text-center text-[12.5px] text-bz-text outline-none focus:border-bz-text", NUM)}
                  />
                  <button
                    type="button"
                    onClick={() => setQty(d, qty + 1)}
                    aria-label={`More ${d}`}
                    className="flex size-6 items-center justify-center rounded-bz-sm border border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              )}
              <span className={cn("text-right text-[12.5px]", NUM, sub > 0 ? "text-bz-text" : "text-bz-text-soft")}>{fmt0(sub)}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper-warm/50 px-3 py-2.5">
        <span className="text-[11px] text-bz-text-muted">
          <span className={cn("font-semibold text-bz-text", NUM)}>{fmt0(pieces)}</span> notes & coins
        </span>
        <span className="flex items-baseline gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">Counted</span>
          <Money n={total} dp={0} className="text-[15px] font-semibold text-bz-text" />
        </span>
      </div>
    </div>
  );
}
