import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, Kbd, PLAIN_BTN, Popover } from "../../sales/bzw";
import { AmountInput } from "../../sales/parts";

// ════════════════════════════════════════════════════════════════════════════
// AMOUNT POP — one figure, applied to a selection (spec §3.3 Variants: "bulk
// set price — a popover with one amount, applies to the selection"; the same
// popover serves a group row's edit). Enter applies; the host answers a
// refusal sentence or null.
// ════════════════════════════════════════════════════════════════════════════

export function AmountPop({
  open,
  anchor,
  onClose,
  title,
  label,
  initial = 0,
  suffix,
  commitLabel = "Apply",
  onApply,
}: {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
  /** "Set sell price · 3 variants" */
  title: string;
  label: string;
  initial?: number;
  /** The currency code after the field. */
  suffix?: string;
  commitLabel?: string;
  onApply: (n: number) => string | null;
}) {
  const [value, setValue] = React.useState(initial);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const wrap = React.useRef<HTMLDivElement>(null);
  const seed = React.useRef(initial);
  seed.current = initial;

  React.useEffect(() => {
    if (!open) return;
    setValue(seed.current);
    setRefusal(null);
    const id = window.setTimeout(() => wrap.current?.querySelector("input")?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const apply = () => {
    if (!(value >= 0)) return setRefusal("A price is 0 or more.");
    const err = onApply(value);
    if (err) setRefusal(err);
    else onClose();
  };

  return (
    <Popover open={open} anchor={anchor} onClose={onClose} width={260} className="p-0">
      <div
        ref={wrap}
        className="p-3"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
            e.preventDefault();
            apply();
          }
        }}
      >
        <div className="mb-2.5 flex items-start gap-2">
          <p className="m-0 min-w-0 flex-1 truncate text-[13px] font-semibold text-bz-text">{title}</p>
          <button type="button" className={PLAIN_BTN} onClick={onClose} aria-label="Close" title="Close (Esc)">
            <X size={14} />
          </button>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-bz-text-muted">
          <span className="w-[72px] shrink-0">{label}</span>
          <AmountInput ariaLabel={label} value={value} onChange={(n) => (setValue(n), setRefusal(null))} invalid={!!refusal} className="w-[120px] font-semibold" />
          {suffix && <span className="shrink-0 text-[11px] text-bz-text-soft">{suffix}</span>}
        </label>
        {refusal && (
          <p role="alert" className="m-0 mt-2 text-[11.5px] leading-snug text-bz-red">
            {refusal}
          </p>
        )}
        <div className="mt-3 flex justify-end">
          <button type="button" className={cn(BTN, "h-8")} onClick={apply}>
            {commitLabel} <Kbd>↵</Kbd>
          </button>
        </div>
      </div>
    </Popover>
  );
}
