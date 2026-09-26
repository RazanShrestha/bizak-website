import * as React from "react";
import { cn } from "../../ui/utils";
import { BTN, Dialog, GHOST, NUM } from "../../sales/bzw";
import { useStore } from "../../sales/store";
import { useMedia } from "../../sales/orders";
import { Grid, fmtDay, fmtDayMonth, fmtRate, inverseOf, outlierNote, pctChange, useStagedRows } from "../kit";
import type { GridColumn, GridHandle, RowState } from "../kit";
import { currencyStore, foreignBases, isInUse, latestRate, rateUnit } from "../seed/currencies";
import { restore, saveRate, snapshot } from "./currencyActions";
import type { Toast } from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// UPDATE TODAY'S RATES — every in-use currency at once (spec §4.3 ②)
//
// One row per (currency, base it is foreign to where it is used). Today is
// prefilled with the last rate and the first one is selected; ↵ moves down;
// past ±5 % the change turns amber with the typo guard in its title. Only the
// rows the reader changed are written, one dated row each (today's row is
// updated instead while no document took it). No "Fill suggestions" in v1 (D-2).
// ════════════════════════════════════════════════════════════════════════════

type Row = { id: string; from: string; to: string; code: string; name: string; against: string; last: number | null; lastDate: string | null; today: number | null; usedToday: number };

export function UpdateRatesDialog({ open, onClose, today, show }: { open: boolean; onClose: () => void; today: string; show: Toast }) {
  const st = useStore(currencyStore);
  const initial = React.useMemo<Row[]>(() => {
    if (!open) return [];
    const out: Row[] = [];
    for (const c of st.currencies) {
      if (c.archived || !isInUse(st, c)) continue;
      for (const b of foreignBases(st, c)) {
        const last = latestRate(st, c.id, b);
        const todayRow = st.rates.find((r) => r.from === c.id && r.to === b && r.date === today);
        out.push({
          id: `${c.id}>${b}`,
          from: c.id,
          to: b,
          code: rateUnit(c),
          name: c.name,
          against: rateUnit(st.currencies.find((x) => x.id === b)),
          last: last?.rate ?? null,
          lastDate: last?.date ?? null,
          today: last?.rate ?? null,
          usedToday: todayRow?.used ?? 0,
        });
      }
    }
    return out.sort((a, b) => a.code.localeCompare(b.code));
    // Built once per opening: the grid owns the draft from there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return open ? <Body key={initial.map((r) => r.id).join("|")} initial={initial} onClose={onClose} today={today} show={show} /> : null;
}

function Body({ initial, onClose, today, show }: { initial: Row[]; onClose: () => void; today: string; show: Toast }) {
  const staged = useStagedRows<Row>(initial);
  const gridRef = React.useRef<GridHandle>(null);
  const [tried, setTried] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);

  React.useEffect(() => {
    const first = initial[0];
    if (first) window.setTimeout(() => gridRef.current?.focusCell(first.id, "today", true), 30);
  }, [initial]);

  const touched = staged.changes.edited;
  const errorOf = (r: Row): string | null => {
    if (!staged.rowState(r).dirty) return null;
    if (!(r.today !== null && r.today > 0)) return "Enter a rate above 0.";
    if (r.usedToday > 0) return `The rate for ${fmtDayMonth(today)} is used by ${r.usedToday} document${r.usedToday === 1 ? "" : "s"}, so it can't change.`;
    return null;
  };

  const columns: GridColumn<Row>[] = [
    {
      key: "code",
      label: "Currency",
      width: "minmax(92px,1fr)",
      kind: "readonly",
      render: (r) => (
        <span className="inline-flex min-w-0 items-baseline gap-1.5">
          <span className="font-semibold">{r.code}</span>
          {r.name !== r.code && <span className="truncate text-[11px] text-bz-text-soft">{r.name}</span>}
        </span>
      ),
    },
    { key: "against", label: "Against", width: "60px", kind: "readonly", render: (r) => <span className="truncate text-bz-text-muted">{r.against}</span> },
    {
      key: "last",
      label: "Last rate",
      width: "116px",
      kind: "readonly",
      align: "right",
      title: (r) => (r.lastDate ? `${fmtRate(r.last)} on ${fmtDay(r.lastDate)}` : "No rate yet"),
      render: (r) => (r.last === null ? <span className="text-bz-text-soft">No rate</span> : <span>{fmtRate(r.last)} <span className="text-[10.5px] text-bz-text-soft">· {fmtDayMonth(r.lastDate)}</span></span>),
    },
    { key: "today", label: "Today", width: "92px", kind: "number", placeholder: "Rate", format: (v) => fmtRate(v as number), render: (r) => <span className={cn(r.today && outlierNote(r.today, r.last) && "font-semibold text-bz-amber-ink")}>{fmtRate(r.today)}</span>, title: (r) => (r.today ? outlierNote(r.today, r.last) ?? pctChange(r.today, r.last)?.text : undefined) },
    {
      key: "change",
      label: "Change",
      width: "72px",
      kind: "readonly",
      align: "right",
      title: (r) => (r.today ? outlierNote(r.today, r.last) ?? undefined : undefined),
      render: (r) => {
        const c = r.today ? pctChange(r.today, r.last) : null;
        if (!c) return <span className="text-bz-text-soft">—</span>;
        const typo = r.today ? outlierNote(r.today, r.last) : null;
        return <span className={cn("text-[11.5px]", typo ? "font-semibold text-bz-amber-ink" : "text-bz-text-muted")}>{c.text}</span>;
      },
    },
    { key: "inverse", label: "Inverse", width: "72px", kind: "readonly", align: "right", title: (r) => (r.today ? `1 ${r.against} = ${inverseOf(r.today)} ${r.code}` : undefined), render: (r) => <span className="text-bz-text-muted">{r.today ? inverseOf(r.today) : "—"}</span> },
  ];

  // A phone keeps what the reader types against: the currency, its last rate and today's (change % in the title).
  const narrow = !useMedia("(min-width: 640px)");
  const shown = narrow ? columns.filter((c) => c.key === "code" || c.key === "last" || c.key === "today") : columns;
  const rowState = (r: Row): RowState => ({ ...staged.rowState(r), error: tried || staged.rowState(r).dirty ? errorOf(r) : null });

  const save = () => {
    setTried(true);
    if (!touched.length) return setRefusal("Change at least one rate.");
    const bad = touched.map(errorOf).find(Boolean);
    if (bad) return setRefusal(bad);
    const before = snapshot();
    for (const r of touched) {
      const e = saveRate({ from: r.from, to: r.to, date: today, rate: r.today! });
      if (e) {
        restore(before);
        return setRefusal(e);
      }
    }
    onClose();
    show("success", touched.length === 1 ? `${touched[0].code} rate saved` : `${touched.length} rates saved`, { label: "Undo", run: () => restore(before) }, 8000);
  };

  return (
    <Dialog
      open
      size="wide"
      eyebrow={fmtDay(today)}
      title="Update today's rates"
      onClose={onClose}
      foot={
        <>
          {refusal && (
            <p role="alert" className="m-0 mr-auto text-[11.5px] text-bz-red">
              {refusal}
            </p>
          )}
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            {touched.length ? `Save ${touched.length} rate${touched.length === 1 ? "" : "s"}` : "Save rates"}
          </button>
        </>
      }
    >
      {initial.length === 0 ? (
        <p className="m-0 text-[12.5px] text-bz-text-muted">No currency in use is foreign to a base.</p>
      ) : (
        <>
          <Grid<Row> ariaLabel="Today's rates" columns={shown} rows={staged.rows} mode="staged" rowState={rowState} onCell={(id, k, v) => (staged.setCell(id, k, v), setRefusal(null))} gridRef={gridRef} minWidth={narrow ? 0 : 560} scrollX={!narrow} />
          <p className={cn("m-0 mt-2 text-[11px] text-bz-text-soft", NUM)}>Only the rates you change are saved, each dated {fmtDay(today)}. ↵ moves down.</p>
        </>
      )}
    </Dialog>
  );
}
