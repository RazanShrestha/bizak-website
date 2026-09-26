import * as React from "react";
import { cn } from "../../ui/utils";
import { BTN, Dialog, Field, GHOST, INPUT } from "../../sales/bzw";
import { useStore } from "../../sales/store";
import { currencyStore } from "../seed/currencies";
import { checkFixCode, fixCode, restore, snapshot } from "./currencyActions";
import type { Toast } from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// FIX CODE — the dev tenant's real state, clickable (spec §4.1 "Code to fix")
//
// Org 186's base (28146) has SHORTCUT "Nepalese Rupee", so every base amount
// prints unlabelled, and the world list's NPR (28238) sits unused beside it.
// The field is prefilled with the code of the row that has the same NAME —
// the duplicate itself — and the dialog answers as the reader types:
//   • not a code                 → "Use a 2–5 letter code, like USD."
//   • free                       → Save code
//   • held by a row nothing uses → Archive it and use NPR (two calls)
//   • held by a row in use       → says so; no one-click fix (merge is D-10, later)
// ════════════════════════════════════════════════════════════════════════════

export function FixCodeDialog({ currencyId, onClose, show }: { currencyId: string | null; onClose: () => void; show: Toast }) {
  const st = useStore(currencyStore);
  const cur = st.currencies.find((c) => c.id === currencyId);
  const [code, setCode] = React.useState("");
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (!cur) return;
    const twin = st.currencies.find((c) => c.id !== cur.id && c.name.trim().toLowerCase() === cur.name.trim().toLowerCase() && /^[A-Za-z]{2,5}$/.test(c.shortcut));
    setCode(twin ? twin.shortcut : "");
    setTried(false);
    // Prefill once per opening, never while the reader types.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencyId]);

  if (!cur) return null;
  const check = checkFixCode(st, cur.id, code);
  const upper = code.trim().toUpperCase();
  const commit = () => {
    setTried(true);
    if (check.kind === "shape" || check.kind === "used-other") return;
    if (check.kind === "same") return onClose();
    const before = snapshot();
    fixCode(cur.id, upper, check.kind === "archive-other" ? check.other.id : undefined);
    onClose();
    show("success", `Code changed to ${upper}`, { label: "Undo", run: () => restore(before) }, 8000);
  };
  const message = check.kind === "shape" ? (tried || code.trim().length > 1 ? check.text : null) : check.kind === "archive-other" || check.kind === "used-other" ? check.text : null;
  const danger = check.kind === "shape" || check.kind === "used-other";

  return (
    <Dialog
      open
      eyebrow="Currency"
      title={`Fix the code of ${cur.name}`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          {check.kind !== "used-other" && (
            <button type="button" className={BTN} onClick={commit}>
              {check.kind === "archive-other" ? `Archive it and use ${upper}` : "Save code"}
            </button>
          )}
        </>
      }
    >
      <div
        className="flex flex-col gap-3"
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.preventDefault(), commit());
        }}
      >
        <p className="m-0 text-[12.5px] text-bz-text">Its code is ‘{cur.shortcut}’, so amounts print without a code.</p>
        <Field label="Code" hint={message ? <span className={danger ? "text-bz-red" : "text-bz-text-muted"}>{message}</span> : undefined}>
          <input
            autoFocus
            value={code}
            onChange={(e) => (setCode(e.target.value), setTried(false))}
            onBlur={() => setCode((c) => c.trim().toUpperCase())}
            placeholder="NPR"
            aria-label="Code"
            maxLength={5}
            className={cn(INPUT, "w-[140px] font-semibold uppercase tracking-wide", danger && message && "border-bz-red-mark")}
          />
        </Field>
      </div>
    </Dialog>
  );
}
