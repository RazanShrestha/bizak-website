import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../ui/utils";
import { INPUT, NUM, Select } from "../sales/bzw";
import type { SelectOption } from "../sales/bzw";

// ════════════════════════════════════════════════════════════════════════════
// NETWORK · FORM PIECES — shared by the quick-add dialogs and the record panels
//
// `Picker` is the bzw Select dressed as a form field, with an optional last
// option "New <noun>" so a missing master can be created without leaving the form
// (the caller decides how: a stacked quick-add, or openQuickAdd).
// ════════════════════════════════════════════════════════════════════════════

const ADD = "__add__";
/** Every master picker ends in "New <noun>" — an older caller's "Add a rep" reads the same way. */
const newLabel = (s: string) => s.replace(/^Add an? /, "New ");
/** A Select that reads like an input. */
const FIELD_TRIGGER = "h-9 w-full justify-between rounded-bz-md border-bz-line bg-bz-paper px-3 text-[12.5px] font-normal hover:border-bz-text-soft";

export function Picker({
  value,
  onChange,
  options,
  placeholder,
  addLabel,
  onAdd,
  width = 320,
  disabled,
  ariaLabel,
}: {
  value: string | null;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder: string;
  /** e.g. "New customer type" — the picker's last option. */
  addLabel?: string;
  onAdd?: () => void;
  width?: number;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const picked = options.find((o) => o.value === value);
  const opts: SelectOption[] = [...options, ...(onAdd && addLabel ? [{ value: ADD, label: newLabel(addLabel) }] : [])];
  return (
    <Select
      trigger="ghost"
      width={width}
      className={FIELD_TRIGGER}
      value={value}
      disabled={disabled}
      title={ariaLabel}
      onChange={(v) => (v === ADD ? onAdd?.() : onChange(v))}
      label={<span className={picked ? "text-bz-text" : "text-bz-text-soft"}>{picked?.label ?? placeholder}</span>}
      options={opts}
    />
  );
}

export function MultiPicker({
  value,
  onChange,
  options,
  placeholder,
  addLabel,
  onAdd,
  width = 320,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: SelectOption[];
  placeholder: string;
  addLabel?: string;
  onAdd?: () => void;
  width?: number;
}) {
  const names = options.filter((o) => value.includes(o.value)).map((o) => o.label);
  const opts: SelectOption[] = [...options, ...(onAdd && addLabel ? [{ value: ADD, label: newLabel(addLabel) }] : [])];
  // A multi-select keeps its menu open on a pick; "New …" must close it, or the menu sits over the dialog it opened.
  const [gen, setGen] = React.useState(0);
  return (
    <Select
      key={gen}
      multiple
      trigger="ghost"
      width={width}
      className={FIELD_TRIGGER}
      value={value}
      onChange={(v) => (v.includes(ADD) ? (setGen((g) => g + 1), onAdd?.()) : onChange(v))}
      label={<span className={names.length ? "text-bz-text" : "text-bz-text-soft"}>{names.length ? names.join(", ") : placeholder}</span>}
      options={opts}
    />
  );
}

/** An amount in NPR with en-US grouping. `blank` allows an empty value (null). */
export function MoneyInput({ value, onChange, blank, placeholder = "0", autoFocus, ariaLabel }: { value: number | null; onChange: (v: number | null) => void; blank?: boolean; placeholder?: string; autoFocus?: boolean; ariaLabel?: string }) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">NPR</span>
      <input
        inputMode="numeric"
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        value={value === null ? "" : value.toLocaleString("en-US")}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d]/g, "");
          onChange(raw === "" ? (blank ? null : 0) : Number(raw));
        }}
        className={cn(INPUT, "pl-11", NUM)}
        placeholder={placeholder}
      />
    </label>
  );
}

/** A whole number field (days, %, visits). */
export function IntInput({ value, onChange, max, suffix, ariaLabel }: { value: number; onChange: (v: number) => void; max?: number; suffix?: string; ariaLabel?: string }) {
  return (
    <label className="relative block">
      <input
        inputMode="numeric"
        aria-label={ariaLabel}
        value={String(value)}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
          onChange(max === undefined ? n : Math.min(max, n));
        }}
        className={cn(INPUT, suffix && "pr-12", NUM)}
      />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-bz-text-soft">{suffix}</span>}
    </label>
  );
}

/** Free text with suggestions from what exists already (brands, categories). */
export function SuggestInput({ value, onChange, suggestions, placeholder, autoFocus }: { value: string; onChange: (v: string) => void; suggestions: string[]; placeholder?: string; autoFocus?: boolean }) {
  const q = value.trim().toLowerCase();
  const shown = [...new Set(suggestions.filter(Boolean))].filter((s) => s.toLowerCase() !== q && (!q || s.toLowerCase().includes(q))).slice(0, 6);
  return (
    <div>
      <input autoFocus={autoFocus} value={value} onChange={(e) => onChange(e.target.value)} className={INPUT} placeholder={placeholder} />
      {shown.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {shown.map((s) => (
            <button key={s} type="button" onClick={() => onChange(s)} className="rounded-bz-pill border border-bz-line-soft px-2 py-0.5 text-[11px] text-bz-text-muted hover:border-bz-line hover:text-bz-text">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** "More" — the fields a first-time user can leave alone. */
export function More({ children, label = "More", defaultOpen = false }: { children: React.ReactNode; label?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-t border-bz-line-soft pt-3">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">
        <ChevronRight size={13} className={cn("transition-transform duration-150", open && "rotate-90")} /> {label}
      </button>
      {open && <div className="mt-3 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

/** Two fields side by side from 480px up. */
export function Pair({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
