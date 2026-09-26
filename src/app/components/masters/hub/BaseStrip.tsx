import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, Dialog, Field, GHOST, GHOST_SM, LABEL, NUM, Select } from "../../sales/bzw";
import { useStore } from "../../sales/store";
import { MASTER_SUBSIDIARIES, baseOfOrg, currencyLabel, currencyStore, isCodeShaped } from "../seed/currencies";
import type { Currency } from "../seed/currencies";
import { baseChangeRefusal, changeBase, restore, snapshot } from "./currencyActions";
import type { Toast } from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// BASE STRIP — the ONE place a subsidiary's base currency is stated and
// changed (spec §4.1, D-4, B-C1). One row per subsidiary the reader can reach.
//
// No currency sheet or form carries a base toggle any more: the three
// meanings "Base" had (any org / session org / home flag, SMM §1.7) end here.
// A base whose code is not code-shaped (dev 186: "Nepalese Rupee") shows ⚠
// and Fix code. Change… opens the dialog; once the subsidiary has posted
// documents the dialog states the server's refusal with the count and offers
// no commit.
// ════════════════════════════════════════════════════════════════════════════

/** "HTG · Haitian Gourde", or the name alone when it has no code. */
export function codeAndName(c: Currency | undefined) {
  if (!c) return "—";
  const label = currencyLabel(c);
  return label && label !== c.name ? `${label} · ${c.name}` : c.name;
}

export function BaseStrip({ onFixCode, readOnly, show }: { onFixCode: (currencyId: string) => void; readOnly?: boolean; show: Toast }) {
  const st = useStore(currencyStore);
  const [changing, setChanging] = React.useState<string | null>(null);
  return (
    <div>
      <p className={cn(LABEL, "m-0 mb-1.5")}>Base currency</p>
      <ul className="m-0 flex list-none flex-col p-0">
        {MASTER_SUBSIDIARIES.map((s) => {
          const base = baseOfOrg(st, s.id);
          const bad = !!base && !isCodeShaped(base.shortcut);
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-bz-line-soft py-1.5 last:border-0 sm:flex-nowrap">
              <span className="w-full truncate text-[12.5px] font-medium text-bz-text sm:w-[180px] sm:shrink-0">{s.name}</span>
              <span className="flex min-w-0 flex-1 items-center gap-2 text-[12.5px] text-bz-text">
                <span className={cn("truncate", NUM)}>{codeAndName(base)}</span>
                {bad && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-bz-amber-ink" title="Its code is not a code, so amounts print without one.">
                    <TriangleAlert size={12} aria-hidden /> not a code
                  </span>
                )}
              </span>
              {!readOnly && (
                <span className="ml-auto flex shrink-0 items-center gap-1.5">
                  {bad && base && (
                    <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => onFixCode(base.id)}>
                      Fix code
                    </button>
                  )}
                  <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => setChanging(s.id)} title={`Change ${s.name}'s base currency`}>
                    Change…
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <ChangeBaseDialog org={changing} onClose={() => setChanging(null)} show={show} />
    </div>
  );
}

function ChangeBaseDialog({ org, onClose, show }: { org: string | null; onClose: () => void; show: Toast }) {
  const st = useStore(currencyStore);
  const [pick, setPick] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  React.useEffect(() => {
    setPick(null);
    setErr(null);
  }, [org]);
  const sub = MASTER_SUBSIDIARIES.find((s) => s.id === org);
  const base = org ? baseOfOrg(st, org) : undefined;
  const refused = org ? baseChangeRefusal(org) : null;
  const options = st.currencies
    .filter((c) => !c.archived && c.id !== base?.id)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: c.id, label: codeAndName(c) }));
  const chosen = st.currencies.find((c) => c.id === pick);
  const commit = () => {
    if (!org || !sub) return;
    if (!pick) return setErr("Choose a currency.");
    const before = snapshot();
    const e = changeBase(org, pick);
    if (e) return setErr(e);
    onClose();
    show("success", `${sub.name}'s base is now ${currencyLabel(chosen) ?? chosen?.name}`, { label: "Undo", run: () => restore(before) }, 8000);
  };
  return (
    <Dialog
      open={!!org}
      eyebrow={sub?.name}
      title="Change base currency"
      onClose={onClose}
      foot={
        refused ? (
          <button type="button" className={GHOST} onClick={onClose}>
            Close
          </button>
        ) : (
          <>
            <button type="button" className={GHOST} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={BTN} onClick={commit}>
              Change base
            </button>
          </>
        )
      }
    >
      {refused ? (
        <p role="alert" className="m-0 flex items-start gap-2 text-[12.5px] text-bz-text">
          <TriangleAlert size={14} className="mt-0.5 shrink-0 text-bz-red" aria-hidden />
          <span>{refused}</span>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <Field
            label={
              <>
                Change {sub?.name}'s base from {currencyLabel(base) ?? base?.name} to
              </>
            }
            hint={err ? <span className="text-bz-red">{err}</span> : undefined}
          >
            <Select
              trigger="ghost"
              className="h-9 w-full justify-between"
              label={chosen ? codeAndName(chosen) : <span className="font-normal text-bz-text-soft">Choose a currency…</span>}
              value={pick}
              onChange={(v) => (setPick(v), setErr(null))}
              width={320}
              searchable
              options={options}
            />
          </Field>
          <p className="m-0 text-[12px] text-bz-text-muted">Totals in {sub?.name} are shown in the new currency. Posted documents keep their rates.</p>
        </div>
      )}
    </Dialog>
  );
}
