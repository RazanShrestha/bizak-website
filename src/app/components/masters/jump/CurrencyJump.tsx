import * as React from "react";
import { cn } from "../../ui/utils";
import { GHOST_SM, NUM } from "../../sales/bzw";
import { useStore } from "../../sales/store";
import { LINK, RatePop, SheetContext, fmtDayMonth, fmtRate } from "../kit";
import { currencyStore, latestRate, rateEffectiveOn, rateUnit } from "../seed/currencies";
import type { Currency } from "../seed/currencies";
import { CurrencySheet } from "../hub/CurrencySheet";
import { saveRate, snapshot, restore } from "../hub/currencyActions";
import type { Toast } from "../hub/shared";

// ════════════════════════════════════════════════════════════════════════════
// CURRENCY JUMP — the currency master opened from a document's Currency chip
// (spec §5.3, D-1). The SAME sheet the hub docks, with:
//
//   • "On this invoice": the rate the document carries (entered / the rate on
//     its date / stored), and the rate EFFECTIVE ON THE DOCUMENT'S DATE — the
//     newest row dated on or before it — with "Use this rate on the invoice"
//     when the two differ (a draft only: a saved document keeps its rate, R9);
//   • no row on or before the date: "Add rate for 12 Sep" (the rate popover,
//     dated the document's day);
//   • the Rates block against the DOCUMENT's base (its subsidiary's — B-F6),
//     so a Pokhara Branch invoice reads rates to HTG;
//   • on the base itself: identity only, "This is <subsidiary>'s base currency."
// ════════════════════════════════════════════════════════════════════════════

export type FxState = {
  /** The document's currency (masters row) and its subsidiary's base. */
  cur: Currency;
  base: Currency | null;
  /** The document's own subsidiary name, as the document shows it. */
  subsidiary: string;
  date: string;
  /** What the document carries now; 0 = blank. */
  rate: number;
  source: "prefill" | "typed" | "seed";
  /** A saved document (an edit) keeps its stored rate — nothing is offered. */
  stored: boolean;
};

export function CurrencyJump({ fx, noun, today, readOnly, show, onUse, onClose }: { fx: FxState; noun: string; today: string; readOnly: boolean; show: Toast; onUse: (rate: number) => void; onClose: () => void }) {
  const st = useStore(currencyStore);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const [adding, setAdding] = React.useState(false);
  const isBase = !!fx.base && fx.base.id === fx.cur.id;
  const eff = !isBase && fx.base ? rateEffectiveOn(st, fx.cur.id, fx.base.id, fx.date) : null;
  const from = rateUnit(fx.cur);
  const to = rateUnit(fx.base);
  const day = fmtDayMonth(fx.date);
  const differs = !!eff && Math.abs(eff.rate - fx.rate) > 0.000001;

  const context = isBase ? (
    <p className="m-0 text-[12px] text-bz-text">This is {fx.subsidiary}'s base currency.</p>
  ) : (
    <SheetContext
      title={`On this ${noun}`}
      rows={[
        <span key="doc" className={NUM}>
          {fx.rate > 0 ? (
            <>
              1 {from} = <span className="font-semibold">{fmtRate(fx.rate)}</span> {to}{" "}
              <span className="text-bz-text-muted">({fx.stored ? "stored" : fx.source === "prefill" && eff && !differs ? `rate on ${fmtDayMonth(eff.date)}` : "entered"})</span>
            </>
          ) : (
            <span className="text-bz-red">No rate yet — the {noun} needs one.</span>
          )}
        </span>,
        eff ? (
          <span key="eff" className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", NUM)}>
            <span>
              Rate on {day}: <span className="font-semibold">{fmtRate(eff.rate)}</span>
              {eff.date !== fx.date && <span className="text-bz-text-muted"> · the {fmtDayMonth(eff.date)} row</span>}
            </span>
            {differs && !fx.stored && !readOnly && (
              <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => onUse(eff.rate)}>
                Use this rate on the {noun}
              </button>
            )}
          </span>
        ) : (
          <span key="none" className="flex flex-wrap items-center gap-x-2">
            <span className="text-bz-text-muted">No rate on or before {day}.</span>
            {!readOnly && (
              <button ref={addRef} type="button" className={cn(LINK, "text-[12px]")} onClick={() => setAdding(true)}>
                Add rate for {day}
              </button>
            )}
          </span>
        ),
      ]}
    />
  );

  return (
    <>
      <CurrencySheet
        id={fx.cur.id}
        docked={false}
        readOnly={readOnly}
        today={today}
        show={show}
        onClose={onClose}
        onCreated={() => {}}
        onFixCode={(id) => window.open(`/design/masters/currencies/${id}`, "_blank")}
        use={{
          context,
          bases: fx.base ? [fx.base.id] : [],
          door: { label: "Open currency page", onOpen: () => window.open(`/design/masters/currencies/${fx.cur.id}`, "_blank") },
        }}
      />
      {fx.base && (
        <RatePop
          open={adding}
          anchor={addRef.current}
          onClose={() => setAdding(false)}
          from={from}
          to={to}
          last={(() => {
            const l = latestRate(st, fx.cur.id, fx.base.id);
            return l ? { rate: l.rate, date: l.date } : null;
          })()}
          today={today}
          date={fx.date}
          onSave={(r) => {
            const before = snapshot();
            const err = saveRate({ from: fx.cur.id, to: fx.base!.id, date: r.date, rate: r.rate });
            if (!err) show("success", `${from} rate saved`, { label: "Undo", run: () => restore(before) }, 8000);
            return err;
          }}
        />
      )}
    </>
  );
}
