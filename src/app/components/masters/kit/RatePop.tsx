import * as React from "react";
import { CalendarDays, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, INPUT_SM, Kbd, NUM, PLAIN_BTN, Popover } from "../../sales/bzw";
import { Grid, useStagedRows } from "./Grid";
import type { GridColumn, GridHandle, RowState } from "./Grid";
import { LINK } from "./marks";
import { fmtDay, fmtDayMonth, fmtRate, inverseOf, isIsoDay, parseNum, pctChange, stepDate } from "./util";

// ════════════════════════════════════════════════════════════════════════════
// DATED RATES — rates are rows, never overwrites (spec §4.2-4.4, B-C2, D-1..D-3)
//
//   DateField   an effective date: `t` today, ↑ / ↓ one day, the picker on click
//   RatePop     "Rate for 25 Sep 2026" from a table row or `R` (§4.3 ①)
//   DatedRates  the sheet's Rates block: newest first; a row a document used
//               is 🔒 ("add a new dated rate instead"); an unused one is
//               editable in place and removable; Add rate inserts a row
//               dated today, prefilled with the latest rate, rate focused
//
// Every rate spells its direction ("1 USD = 133.42 NPR") and shows the inverse.
// Manual only in v1 (D-2): no suggestion line.
// ════════════════════════════════════════════════════════════════════════════

/** A typo guard: past ±5 % the change turns amber and says what it would mean. */
export const OUTLIER_PCT = 5;
export function outlierNote(next: number, prev: number | null | undefined) {
  const c = pctChange(next, prev);
  if (!c || Math.abs(c.pct) <= OUTLIER_PCT || !prev) return null;
  const x = next / prev;
  const times = x >= 2 ? `${Math.round(x)}× the last rate` : x <= 0.5 ? `1/${Math.round(1 / x)} of the last rate` : `${c.text} on the last rate`;
  return `Is ${fmtRate(next)} right? It is ${times}.`;
}

export function DateField({ value, onChange, today, ariaLabel = "Effective date", className }: { value: string; onChange: (iso: string) => void; today: string; ariaLabel?: string; className?: string }) {
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <label className={cn(INPUT_SM, "relative flex w-[150px] cursor-pointer items-center gap-2 focus-within:border-bz-text-muted", className)} title={`${ariaLabel} — t today, ↑ ↓ a day`}>
      <CalendarDays size={12} className="shrink-0 text-bz-text-soft" />
      <span className={cn("min-w-0 flex-1 truncate", NUM)}>{fmtDay(value)}</span>
      <input
        ref={ref}
        type="date"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        onClick={() => ref.current?.showPicker?.()}
        onKeyDown={(e) => {
          const next = stepDate(value, e.key, today);
          if (next && !e.altKey && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onChange(next);
          }
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}

export function RatePop({
  open,
  anchor,
  onClose,
  from,
  to,
  last,
  today,
  date: startDate,
  onSave,
}: {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
  /** "USD" — the currency whose rate this is. */
  from: string;
  /** "NPR" — the base it is against. */
  to: string;
  /** The rate in force before this one, to prefill and to measure the change against. */
  last?: { rate: number; date: string } | null;
  today: string;
  /** The effective date it opens on (default today) — a document's date, from "Add rate for 12 Sep". */
  date?: string;
  /** Answer the refusal sentence ("There is already a rate for 25 Sep. Edit that one.") or null. */
  onSave: (r: { rate: number; date: string }) => string | null;
}) {
  const [raw, setRaw] = React.useState("");
  const [date, setDate] = React.useState(today);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Prefill once per opening — a host re-rendering with a fresh `last` object must not wipe the typing.
  const seed = React.useRef({ last, today, startDate });
  seed.current = { last, today, startDate };
  React.useEffect(() => {
    if (!open) return;
    setRaw(seed.current.last ? String(seed.current.last.rate) : "");
    setDate(seed.current.startDate ?? seed.current.today);
    setRefusal(null);
    const id = window.setTimeout(() => inputRef.current?.select(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const rate = parseNum(raw);
  const change = rate ? pctChange(rate, last?.rate) : null;
  const typo = rate ? outlierNote(rate, last?.rate) : null;
  const save = () => {
    if (!rate || rate <= 0) return setRefusal("Enter a rate above 0.");
    if (!isIsoDay(date)) return setRefusal("Choose the effective date.");
    const err = onSave({ rate, date });
    if (err) setRefusal(err);
    else onClose();
  };

  return (
    <Popover open={open} anchor={anchor} onClose={onClose} width={300} className="p-0">
      <div
        className="p-3"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            save();
          }
        }}
      >
        <div className="mb-2.5 flex items-start gap-2">
          <p className="m-0 min-w-0 flex-1 text-[13px] font-semibold text-bz-text">Rate for {fmtDay(date)}</p>
          <button type="button" className={PLAIN_BTN} onClick={onClose} aria-label="Close" title="Close (Esc)">
            <X size={14} />
          </button>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-bz-text-muted">
          <span className={cn("shrink-0", NUM)}>1 {from} =</span>
          <input
            ref={inputRef}
            autoFocus
            inputMode="decimal"
            aria-label={`Rate, 1 ${from} in ${to}`}
            value={raw}
            onChange={(e) => (setRaw(e.target.value), setRefusal(null))}
            className={cn(INPUT_SM, "w-[120px] text-right font-semibold", NUM, refusal && "border-bz-red-mark")}
          />
          {/* A base without a code is named ("Nepalese Rupee") — it truncates rather than leave the popover. */}
          <span className="min-w-0 truncate" title={to}>
            {to}
          </span>
        </label>
        <div className={cn("mt-1.5 flex items-center gap-2 text-[11.5px] text-bz-text-soft", NUM)}>
          <span className="min-w-0 flex-1 truncate">
            1 {to} = {rate ? inverseOf(rate) : "—"} {from}
          </span>
          {change && (
            <span className={cn("shrink-0", typo ? "font-semibold text-bz-amber-ink" : "text-bz-text-muted")} title={typo ?? `Against ${fmtRate(last?.rate)} on ${fmtDay(last?.date)}`}>
              {change.text}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11.5px] text-bz-text-muted">Effective</span>
          <DateField value={date} onChange={(d) => (setDate(d), setRefusal(null))} today={today} />
        </div>
        {refusal && (
          <p role="alert" className="m-0 mt-2 text-[11.5px] leading-snug text-bz-red">
            {refusal}
          </p>
        )}
        <div className="mt-3 flex justify-end">
          <button type="button" className={cn(BTN, "h-8")} onClick={save}>
            Save rate <Kbd>↵</Kbd>
          </button>
        </div>
      </div>
    </Popover>
  );
}

// ── The Rates block ─────────────────────────────────────────────────────────

export type DatedRate = {
  id: string;
  /** Effective date (`DATE`, not `CREATED_DATE`). */
  date: string | null;
  rate: number | null;
  source: "Manual" | "Import" | "Suggested";
  /** Who entered it. */
  by: string;
  /** Documents that took this row (B-C2). */
  used: number;
};

let seq = 0;

/** The Rates block's state: the staged rows, the validation the sheet refuses on, and Add rate. */
export function useDatedRates(initial: DatedRate[], { today, by }: { today: string; by: string }) {
  const staged = useStagedRows<DatedRate>(initial);
  const gridRef = React.useRef<GridHandle>(null);

  // Rules the sheet checks on Save (and shows on a row the moment it is new or changed).
  const errors = React.useMemo(() => {
    const out: Record<string, string> = {};
    const live = staged.rows.filter((r) => !staged.changes.removed.includes(r.id));
    for (const r of live) {
      const st = staged.rowState(r);
      if (!st.dirty) continue;
      if (!r.date) out[r.id] = "Enter a date.";
      else if (!(r.rate !== null && r.rate > 0)) out[r.id] = "Enter a rate above 0.";
      else if (live.some((o) => o.id !== r.id && o.date === r.date)) out[r.id] = `There is already a rate for ${fmtDayMonth(r.date)}. Edit that one.`;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staged.rows, staged.changes.removed.join("|")]);

  const latest = staged.rows.filter((r) => r.rate && r.date).sort((a, b) => (b.date! < a.date! ? -1 : 1))[0];
  const add = () => {
    const row: DatedRate = { id: `new-rate-${++seq}`, date: today, rate: latest?.rate ?? null, source: "Manual", by, used: 0 };
    staged.add(row, "start");
    gridRef.current?.focusCell(row.id, "rate", true);
  };

  return { staged, errors, add, gridRef, valid: Object.keys(errors).length === 0 };
}

export function DatedRates({
  rates,
  from,
  to,
  today,
  shown = 3,
  readOnly,
}: {
  rates: ReturnType<typeof useDatedRates>;
  from: string;
  to: string;
  today: string;
  /** Saved rows shown before "Show N older". */
  shown?: number;
  /** No Update right: the history reads, nothing edits. */
  readOnly?: boolean;
}) {
  const { staged, errors, gridRef } = rates;
  const [all, setAll] = React.useState(false);
  const fresh = staged.rows.filter((r) => staged.isNew(r.id));
  const saved = staged.rows.filter((r) => !staged.isNew(r.id));
  const rows = all ? staged.rows : [...fresh, ...saved.slice(0, shown)];
  const hidden = saved.length - Math.min(saved.length, shown);

  // The change a row makes against the next older row — measured from the saved history.
  const olderThan = (r: DatedRate) =>
    staged.rows
      .filter((o) => o.id !== r.id && o.date && r.date && o.date < r.date && o.rate)
      .sort((a, b) => (a.date! < b.date! ? 1 : -1))[0];

  const columns: GridColumn<DatedRate>[] = [
    { key: "date", label: "Effective", width: "96px", kind: "date" },
    {
      key: "rate",
      // The base lives in the head, not after every figure (design review §16.2 #2): "1 USD in NPR".
      label: `1 ${from} in ${to}`,
      width: "minmax(0,1fr)",
      kind: "number",
      render: (r) => {
        const prev = olderThan(r);
        const c = r.rate && staged.rowState(r).dirty ? pctChange(r.rate, prev?.rate) : null;
        const typo = r.rate && staged.rowState(r).dirty ? outlierNote(r.rate, prev?.rate) : null;
        return (
          // The change sits UNDER the figure, not beside it: in the 480px sheet the column is ~70px wide.
          <span className="inline-flex flex-col items-end leading-tight">
            <span>{r.rate !== null ? fmtRate(r.rate) : ""}</span>
            {c && (
              <span className={cn("text-[10px]", typo ? "font-semibold text-bz-amber-ink" : "text-bz-text-soft")} title={typo ?? undefined}>
                {c.text}
              </span>
            )}
          </span>
        );
      },
    },
    { key: "inverse", label: `1 ${to} in ${from}`, width: "88px", kind: "readonly", align: "right", title: (r) => (r.rate ? `1 ${to} = ${inverseOf(r.rate)} ${from}` : undefined), render: (r) => <span className="text-bz-text-muted">{r.rate ? inverseOf(r.rate) : "—"}</span> },
    // No Source column in v1: every rate is Manual (D-2). An imported row says so in its By cell.
    {
      key: "by",
      label: "By",
      width: "52px",
      kind: "readonly",
      title: (r) => (r.source === "Manual" ? r.by : `${r.by} · ${r.source}`),
      render: (r) => (
        <span className="inline-flex min-w-0 items-center gap-1">
          <span className="truncate">{r.by}</span>
          {r.source !== "Manual" && <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1 text-[10px] text-bz-text-muted">{r.source}</span>}
        </span>
      ),
    },
    { key: "used", label: "Used", width: "52px", kind: "readonly", align: "right" },
  ];

  const rowState = (r: DatedRate): RowState => ({
    ...staged.rowState(r),
    locked: r.used > 0 ? `Used by ${r.used} document${r.used === 1 ? "" : "s"} — add a new dated rate instead.` : false,
    error: errors[r.id] ?? null,
  });

  return (
    <Grid<DatedRate>
      ariaLabel={`${from} rates in ${to}`}
      columns={columns}
      rows={rows}
      mode={readOnly ? "readonly" : "staged"}
      rowState={rowState}
      onCell={staged.setCell}
      onRemove={readOnly ? undefined : staged.remove}
      gridRef={gridRef}
      today={today}
      minWidth={420}
      scrollX
      empty="No rates yet."
      foot={
        hidden > 0 || all ? (
          <button type="button" className={LINK} onClick={() => setAll((v) => !v)}>
            {all ? "Show fewer" : `Show ${hidden} older`}
          </button>
        ) : undefined
      }
    />
  );
}
