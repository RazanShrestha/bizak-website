import * as React from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { cn } from "../../ui/utils";
import { INPUT_SM, NUM, Select } from "../../sales/bzw";
import type { SelectOption } from "../../sales/bzw";
import { AmountInput } from "../../sales/parts";
import { parseNum } from "./util";

// ════════════════════════════════════════════════════════════════════════════
// INLINE FIELD — the peek's click-to-edit (spec §3.2, §6.3 #5, `<bzw-inline-field>`)
//
//   read     reads as text; the pencil shows on hover / focus (`.bzw-fieldbtn`)
//   editing  the real control, focused and selected; Enter commits ONE field,
//            Esc cancels, and blur keeps the edit open — a financial field is
//            never saved by clicking somewhere else
//   saving   the typed value at once, in pending ink, with a spinner
//   saved    a 600 ms leaf tick
//   refused  the server's sentence under it; the editor reopens holding what
//            was typed, while the stored value stays what it was
//
// The host PATCHes in `onCommit` (answering a refusal sentence or null) and
// toasts "Sell price saved · Undo".
// ════════════════════════════════════════════════════════════════════════════

export type InlineValue = string | number | null;
type Phase = "read" | "editing" | "saving" | "saved";

export function InlineField({
  label,
  value,
  display,
  editor = "text",
  options,
  placeholder = "—",
  suffix,
  onCommit,
  readOnly,
  className,
  buttonRef,
}: {
  /** Names the control for assistive tech ("Sell price"); the visible label is the host's. */
  label: string;
  value: InlineValue;
  /** The read face when the raw value is not what a reader should see (money, a looked-up name). */
  display?: React.ReactNode;
  editor?: "text" | "number" | "amount" | "select";
  options?: SelectOption[];
  placeholder?: string;
  /** A unit or code after the value ("NPR", "Piece"). */
  suffix?: React.ReactNode;
  onCommit: (v: InlineValue) => string | null | Promise<string | null>;
  readOnly?: boolean;
  className?: string;
  /** The read face, so the peek's `E` can focus the first field. */
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  const [phase, setPhase] = React.useState<Phase>("read");
  const [draft, setDraft] = React.useState<InlineValue>(value);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const wrap = React.useRef<HTMLSpanElement>(null);
  // Leaving the editor (Enter, Esc) puts the cursor back on the read face, not on the page body.
  const faceRef = React.useRef<HTMLButtonElement | null>(null);
  const refocus = React.useRef(false);
  React.useLayoutEffect(() => {
    if (phase !== "editing" && refocus.current && faceRef.current) {
      refocus.current = false;
      faceRef.current.focus();
    }
  }, [phase]);
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (phase !== "saved") return;
    const id = window.setTimeout(() => alive.current && setPhase("read"), 600);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Focus and select the control as the edit opens (AmountInput selects itself on focus).
  React.useLayoutEffect(() => {
    if (phase !== "editing") return;
    const input = wrap.current?.querySelector("input");
    if (input && document.activeElement !== input) {
      input.focus();
      input.select();
    }
  }, [phase]);

  const open = () => {
    if (readOnly) return;
    setDraft(value);
    setRefusal(null);
    setPhase("editing");
  };

  const commit = (v: InlineValue) => {
    if (v === value) {
      setPhase("read");
      return;
    }
    setDraft(v);
    setPhase("saving");
    Promise.resolve(onCommit(v)).then((err) => {
      if (!alive.current) return;
      if (err) {
        setRefusal(err);
        setPhase("editing");
      } else {
        setRefusal(null);
        setPhase("saved");
      }
    });
  };

  const typed = (): InlineValue => {
    if (editor === "number" || editor === "amount") return typeof draft === "number" ? draft : parseNum(String(draft ?? ""));
    return typeof draft === "string" ? draft.trim() : draft;
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      refocus.current = true;
      commit(typed());
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      refocus.current = true;
      setRefusal(null);
      setPhase("read");
    }
  };

  const face = (v: InlineValue, pending: boolean) => {
    const empty = v === null || v === "" || (typeof v === "number" && Number.isNaN(v));
    const shown = pending ? (editor === "select" ? options?.find((o) => o.value === v)?.label ?? v : editor === "amount" && typeof v === "number" ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : v) : display ?? (editor === "select" ? options?.find((o) => o.value === v)?.label ?? v : v);
    return empty && !pending ? <span className="text-bz-text-soft">{placeholder}</span> : <span className={cn("min-w-0 truncate", NUM)}>{shown}</span>;
  };

  if (phase === "editing" && editor !== "select")
    return (
      <span ref={wrap} data-bzw-editing="" className={cn("flex min-w-0 flex-col gap-1", className)} onKeyDown={onKey}>
        <span className="flex min-w-0 items-center gap-1.5">
          {editor === "amount" ? (
            <AmountInput ariaLabel={label} value={typeof draft === "number" ? draft : parseNum(String(draft ?? "")) ?? 0} onChange={(n) => setDraft(n)} invalid={!!refusal} className={cn("w-[140px] font-semibold", refusal && "focus:border-bz-red-mark")} />
          ) : (
            <input
              aria-label={label}
              value={draft ?? ""}
              inputMode={editor === "number" ? "decimal" : undefined}
              onChange={(e) => setDraft(e.target.value)}
              className={cn(INPUT_SM, "w-[180px]", editor === "number" && "text-right", NUM, refusal && "border-bz-red-mark focus:border-bz-red-mark")}
            />
          )}
          {suffix && <span className="shrink-0 text-[11px] text-bz-text-soft">{suffix}</span>}
        </span>
        {refusal && (
          <span role="alert" className="text-[11px] leading-snug text-bz-red">
            {refusal}
          </span>
        )}
      </span>
    );

  const inner = (
    <>
      {/* The control's name comes first so a screen reader hears "Sell price, 250.00" — an aria-label would hide the value. */}
      <span className="sr-only">{label}: </span>
      {phase === "saving" ? face(draft, true) : face(value, false)}
      {suffix && !(value === null || value === "") && <span className="shrink-0 text-[11px] text-bz-text-soft">{suffix}</span>}
      <span className="ml-auto flex shrink-0 items-center">
        {phase === "saving" ? (
          <Loader2 size={12} className="animate-spin text-bz-text-soft" aria-label="Saving" />
        ) : phase === "saved" ? (
          <Check size={12} className="text-bz-leaf-deep" aria-label="Saved" />
        ) : readOnly ? null : (
          <Pencil size={11} className="text-bz-text-soft opacity-0 transition-opacity group-hover/if:opacity-100 group-focus-visible/if:opacity-100" aria-hidden />
        )}
      </span>
    </>
  );

  const faceClass = cn(
    "group/if flex w-full min-w-0 items-center gap-1.5 rounded-bz-sm border-0 bg-transparent px-1 py-0.5 text-left text-[12px] text-bz-text transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-bz-fire",
    !readOnly && "cursor-pointer hover:bg-bz-paper-warm",
    phase === "saving" && "animate-pulse text-bz-text-muted",
  );

  if (editor === "select" && !readOnly)
    return (
      <span className={cn("flex min-w-0 flex-col gap-1", className)} data-bzw-editing={phase === "editing" ? "" : undefined}>
        <Select
          trigger="plain"
          title={readOnly ? undefined : "Click to change"}
          value={value === null ? null : String(value)}
          options={options ?? []}
          className="w-full"
          onChange={(v) => commit(v)}
          onClose={() => phase === "editing" && setPhase("read")}
        >
          <span className={faceClass}>{inner}</span>
        </Select>
        {refusal && (
          <span role="alert" className="text-[11px] leading-snug text-bz-red">
            {refusal}
          </span>
        )}
      </span>
    );

  return (
    <span className={cn("flex min-w-0", className)}>
      <button
        ref={(el) => {
          faceRef.current = el;
          if (typeof buttonRef === "function") buttonRef(el);
          else if (buttonRef) (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        }}
        type="button" title={readOnly ? undefined : "Click to change"} aria-busy={phase === "saving" || undefined} onClick={() => phase !== "saving" && open()} className={faceClass}>
        {inner}
      </button>
    </span>
  );
}
