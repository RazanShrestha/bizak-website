import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "../../ui/utils";
import { Chip, Empty, GHOST_SM, INPUT, MenuItem, NUM, Segmented } from "../../sales/bzw";
import { Section } from "../../sales/parts";
import { useStore } from "../../sales/store";
import { useKeys } from "../../sales/orders";
import { CopyText, DatedRates, LINK, MasterSheet, PageField, useDatedRates } from "../kit";
import type { DatedRate } from "../kit";
import { MASTERS_ME, baseOrgsOf, currencyLabel, currencyStore, foreignBases, isCodeShaped, ratesOf, rateUnit, subsidiaryName } from "../seed/currencies";
import type { Currency, CurrencyState } from "../seed/currencies";
import { codeAndName } from "./BaseStrip";
import { applyRateChanges, archiveRefusal, canDelete, deleteCurrency, restore, saveCurrency, setArchived, snapshot, validateDraft } from "./currencyActions";
import { Band, CustomFieldsSection, DeleteDialog, FORM_GRID, FootLink, ReadValue, SubsidiaryChips, UsedByList, usageMeta } from "./shared";
import type { Toast } from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// CURRENCY SHEET — tier 2 (spec §4.2), `masters/currencies/:id`, docked 480px
// beside the table from 1280px, floating below.
//
//   identity      Code* (SHORTCUT, upper-cased on blur), Name*, Symbol,
//                 Placement with a live preview. No decimals / ISO / country:
//                 there are no such columns.
//   rates         the dated history against each base it is foreign to
//                 ("to NPR / to HTG" only with two); a row a document took is
//                 🔒; Add rate dates today, prefilled, rate focused. A base's
//                 own sheet has no Rates: "Base currency of yejagoj."
//   subsidiaries  membership chips; where it is the base the chip is 🔒 and
//                 has no × — the base flag is never written from here.
//   used by       B-C3's labels.
//
// ONE explicit Save (⌘↵ / ⌘S) sends identity, the membership delta and the
// rate rows together (B-C5 + B-C2). Cancel with changes asks inline. Archive
// (foot, left) is refused for a base, reason inline; Delete is in ⋯ only when
// nothing uses it and it is nobody's base.
// ════════════════════════════════════════════════════════════════════════════

const toDated = (st: CurrencyState, from: string, to: string): DatedRate[] => ratesOf(st, from, to).map((r) => ({ id: r.id, date: r.date, rate: r.rate, source: r.source, by: r.by, used: r.used }));

/**
 * Opened from a document (spec §5.3, the currency jump): the SAME sheet, with the document's facts in
 * its context band, the rates scoped to the document's base, and the page door opening a new tab.
 */
export type CurrencyUse = {
  /** "On this invoice" — replaces the sheet's own state band. */
  context: React.ReactNode;
  /** The document's base: the Rates block shows rates against it, even when the currency is another subsidiary's base. */
  bases: string[];
  door: { label: string; onOpen: () => void };
};

export function CurrencySheet({ id, docked, readOnly, today, show, onClose, onCreated, onFixCode, use }: { id: string; docked: boolean; readOnly: boolean; today: string; show: Toast; onClose: () => void; onCreated: (id: string) => void; onFixCode: (id: string) => void; use?: CurrencyUse }) {
  const st = useStore(currencyStore);
  const cur = id === "new" ? null : st.currencies.find((c) => c.id === id) ?? null;
  if (id !== "new" && !cur)
    return (
      <MasterSheet docked={docked} mode="view" eyebrow="Currency" title="Currency" onClose={onClose}>
        <Empty title="This currency isn't available." />
      </MasterSheet>
    );
  // A fresh form per record: the draft never leaks from one currency into the next.
  return <CurrencyForm key={id} cur={cur} docked={docked} readOnly={readOnly} today={today} show={show} onClose={onClose} onCreated={onCreated} onFixCode={onFixCode} use={use} />;
}

function CurrencyForm({ cur, docked, readOnly, today, show, onClose, onCreated, onFixCode, use }: { cur: Currency | null; docked: boolean; readOnly: boolean; today: string; show: Toast; onClose: () => void; onCreated: (id: string) => void; onFixCode: (id: string) => void; use?: CurrencyUse }) {
  const st = useStore(currencyStore);
  const isNew = !cur;
  const blank = { shortcut: "", name: "", symbol: null as string | null, placement: "before" as const, orgs: ["186"], applyToChild: false };
  const saved = cur ? { shortcut: cur.shortcut, name: cur.name, symbol: cur.symbol, placement: cur.placement, orgs: cur.orgs, applyToChild: cur.applyToChild } : blank;
  const [draft, setDraft] = React.useState(saved);
  const [tried, setTried] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const baseOrgs = cur ? baseOrgsOf(st, cur.id) : [];
  const isBase = baseOrgs.length > 0;
  // The bases it is foreign to — from the SAVED record (a new one: the default subsidiary's base).
  const bases = use ? use.bases.filter((b) => b !== cur?.id) : cur ? foreignBases(st, cur) : [st.base[blank.orgs[0]]].filter(Boolean);
  const [toIdx, setToIdx] = React.useState(0);
  const fromId = cur?.id ?? "new";
  const r0 = useDatedRates(bases[0] ? toDated(st, fromId, bases[0]) : [], { today, by: MASTERS_ME });
  const r1 = useDatedRates(bases[1] ? toDated(st, fromId, bases[1]) : [], { today, by: MASTERS_ME });
  const blocks = [r0, r1].slice(0, bases.length);
  const rates = blocks[toIdx] ?? r0;

  // Rates saved elsewhere (the popover, the bulk dialog) reach an unedited block.
  const liveKey = bases.map((b) => JSON.stringify(toDated(st, fromId, b))).join("|");
  React.useEffect(() => {
    bases.forEach((b, i) => {
      const blk = [r0, r1][i];
      if (!blk.staged.dirty) blk.staged.load(toDated(st, fromId, b));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveKey]);

  const identityDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const ratesDirty = blocks.some((b) => b.staged.dirty);
  const dirty = !readOnly && (identityDirty || ratesDirty);
  const invalid = validateDraft(st, draft, cur?.id ?? null);
  const showErr = (field: "code" | "name") => (tried && invalid?.field === field ? invalid.text : null);
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => (setDraft((d) => ({ ...d, [k]: v })), setRefusal(null));

  const save = (andNew = false) => {
    if (readOnly) return;
    setTried(true);
    if (invalid) return setRefusal(invalid.text);
    const rateErr = blocks.map((b) => Object.values(b.errors)[0]).find(Boolean);
    if (rateErr) return setRefusal(rateErr);
    const before = snapshot();
    const newId = saveCurrency(cur?.id ?? null, draft);
    bases.forEach((b, i) => {
      const blk = blocks[i];
      if (!blk?.staged.dirty) return;
      applyRateChanges(newId, b, { added: blk.staged.changes.added, edited: blk.staged.changes.edited, removed: blk.staged.changes.removed });
      blk.staged.accept();
    });
    setTried(false);
    const label = isCodeShaped(draft.shortcut) ? draft.shortcut.trim().toUpperCase() : draft.name;
    if (isNew) {
      show("success", `${label} created`, { label: "Undo", run: () => restore(before) }, 8000);
      if (andNew) {
        setDraft(blank);
        r0.staged.load([]);
      } else onCreated(newId);
    } else show("success", "Currency saved", { label: "Undo", run: () => restore(before) }, 8000);
  };
  useKeys({ "mod+s": (e) => (e.preventDefault(), save()) }, !readOnly);

  const archive = () => {
    if (!cur) return;
    const refused = archiveRefusal(st, cur.id);
    if (refused) return setRefusal(refused);
    const before = snapshot();
    setArchived(cur.id, true);
    show("success", "Archived", { label: "Undo", run: () => restore(before) }, 8000);
  };
  const unarchive = () => {
    if (!cur) return;
    const before = snapshot();
    setArchived(cur.id, false);
    show("success", "Restored", { label: "Undo", run: () => restore(before) }, 8000);
  };

  const label = cur ? currencyLabel(cur) : null;
  const title = isNew ? "New currency" : label && label !== cur!.name ? `${label} · ${cur!.name}` : cur!.name;
  const symbolNote = (() => {
    const s = draft.symbol?.trim();
    if (!s) return undefined;
    if (s.toLowerCase() === draft.name.trim().toLowerCase()) return "Same as the name, so it isn't printed.";
    if (s.length > 4) return "A symbol longer than 4 characters isn't printed.";
    return undefined;
  })();
  const printable = !!draft.symbol?.trim() && !symbolNote;
  const preview = printable ? (draft.placement === "before" ? `${draft.symbol!.trim()}1,250.00` : `1,250.00 ${draft.symbol!.trim()}`) : "1,250.00";
  const codeGrandfathered = !!cur && !isCodeShaped(cur.shortcut) && draft.shortcut === cur.shortcut;
  const mode = readOnly ? "view" : isNew ? "create" : use ? "use" : "edit";
  const toCur = st.currencies.find((c) => c.id === bases[toIdx]);
  const fromUnit = isCodeShaped(draft.shortcut) ? draft.shortcut.trim().toUpperCase() : cur ? rateUnit(cur) : "—";

  return (
    <MasterSheet
      docked={docked}
      mode={mode}
      commitLabel={use && !readOnly ? "Save" : undefined}
      door={use?.door}
      footDoor={!!use}
      eyebrow="Currency"
      title={title}
      meta={cur ? [label ? <CopyText key="c" text={label} onCopied={() => show("success", "Copied")} /> : null, usageMeta(cur.usage)] : undefined}
      chips={
        (readOnly || cur?.archived || isBase) && (
          <>
            {isBase && baseOrgs.map((o) => <Chip key={o} tone="neutral" dot={false}>Base · {subsidiaryName(o)}</Chip>)}
            {cur?.archived && <Chip tone="neutral" dot={false}>Archived</Chip>}
            {readOnly && <Chip tone="neutral" dot={false}>View only</Chip>}
          </>
        )
      }
      context={
        use ? (
          <>
            {use.context}
            {cur?.archived && (
              <div className="mt-2">
                <Band action={!readOnly && <button type="button" className={cn(GHOST_SM, "h-7")} onClick={unarchive}>Restore</button>}>Archived — hidden from pickers.</Band>
              </div>
            )}
          </>
        ) : cur?.archived ? (
          <Band action={!readOnly && <button type="button" className={cn(GHOST_SM, "h-7")} onClick={unarchive}>Restore</button>}>Archived — hidden from pickers.</Band>
        ) : isBase ? (
          <Band>Base currency of {baseOrgs.map(subsidiaryName).join(" and ")}.</Band>
        ) : undefined
      }
      menu={
        cur && !readOnly && canDelete(st, cur)
          ? (close) => (
              <MenuItem danger onClick={() => (close(), setDeleting(true))}>
                Delete
              </MenuItem>
            )
          : undefined
      }
      footLeft={
        cur && !readOnly && !cur.archived ? (
          <FootLink danger onClick={archive} title={archiveRefusal(st, cur.id) ?? "Hide it from pickers; documents keep it"}>
            Archive
          </FootLink>
        ) : undefined
      }
      onCommit={() => save()}
      secondary={isNew ? { label: "Create and add another", run: () => save(true) } : undefined}
      dirty={dirty}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      onClose={onClose}
    >
      <div className={cn(FORM_GRID, "px-5 py-4")}>
        <PageField
          label="Code"
          required
          dirty={!isNew && draft.shortcut !== saved.shortcut}
          error={showErr("code")}
          hint={
            codeGrandfathered ? (
              <span className="text-bz-amber-ink">
                Not a code — amounts print without one.{" "}
                {!readOnly && cur && (
                  <button type="button" className={cn(LINK, "text-[10.5px] text-bz-amber-ink hover:text-bz-amber-ink")} onClick={() => onFixCode(cur.id)}>
                    Fix code
                  </button>
                )}
              </span>
            ) : undefined
          }
        >
          {readOnly ? (
            <ReadValue>{draft.shortcut}</ReadValue>
          ) : (
            <input
              autoFocus={isNew}
              value={draft.shortcut}
              onChange={(e) => set("shortcut", e.target.value)}
              onBlur={() => isCodeShaped(draft.shortcut) && set("shortcut", draft.shortcut.trim().toUpperCase())}
              placeholder="USD"
              aria-label="Code"
              className={cn(INPUT, showErr("code") && "border-bz-red-mark")}
            />
          )}
        </PageField>
        <PageField label="Name" required dirty={!isNew && draft.name !== saved.name} error={showErr("name")}>
          {readOnly ? <ReadValue>{draft.name}</ReadValue> : <input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="US Dollar" aria-label="Name" className={cn(INPUT, showErr("name") && "border-bz-red-mark")} />}
        </PageField>
        <PageField label="Symbol" dirty={!isNew && draft.symbol !== saved.symbol} hint={symbolNote ? <span className="text-bz-amber-ink">{symbolNote}</span> : undefined}>
          {readOnly ? <ReadValue soft={!draft.symbol}>{draft.symbol || "—"}</ReadValue> : <input value={draft.symbol ?? ""} onChange={(e) => set("symbol", e.target.value || null)} placeholder="$" aria-label="Symbol" className={INPUT} />}
        </PageField>
        <PageField label="Placement" dirty={!isNew && draft.placement !== saved.placement}>
          <div className="flex min-h-9 items-center gap-2">
            {readOnly ? (
              <span className="text-[12.5px] text-bz-text">{draft.placement === "before" ? "Before" : "After"}</span>
            ) : (
              <Segmented size="sm" value={draft.placement} onChange={(v) => set("placement", v)} options={[{ value: "before", label: "Before" }, { value: "after", label: "After" }]} />
            )}
            <span className={cn("truncate text-[12px] text-bz-text-muted", NUM)} title="How an amount prints">
              {preview}
            </span>
          </div>
        </PageField>
      </div>

      {(!isBase || !!use) && bases.length > 0 && (
        <Section
          title="Rates"
          summary={`to ${rateUnit(toCur)}`}
          defaultOpen
          right={
            <>
              {bases.length > 1 && (
                <Segmented
                  size="sm"
                  value={String(toIdx)}
                  onChange={(v) => setToIdx(Number(v))}
                  options={bases.map((b, i) => ({ value: String(i), label: `to ${rateUnit(st.currencies.find((c) => c.id === b))}` }))}
                />
              )}
              {!readOnly && !cur?.archived && (
                <button type="button" className={GHOST_SM} onClick={rates.add} title="Add a dated rate (today)">
                  <Plus size={11} /> Add rate
                </button>
              )}
            </>
          }
        >
          <DatedRates rates={rates} from={fromUnit} to={rateUnit(toCur)} today={today} readOnly={readOnly || cur?.archived} />
          {bases.length === 1 && <p className="m-0 mt-2 text-[11px] text-bz-text-soft">A document takes the rate effective on its own date.</p>}
        </Section>
      )}

      <Section title="Subsidiaries" summary={draft.orgs.map(subsidiaryName).join(" · ")} defaultOpen={isNew}>
        <SubsidiaryChips
          orgs={draft.orgs}
          onChange={(v) => set("orgs", v)}
          locked={Object.fromEntries(baseOrgs.map((o) => [o, `Base of ${subsidiaryName(o)}`]))}
          applyToChild={draft.applyToChild}
          onApplyToChild={(v) => set("applyToChild", v)}
          readOnly={readOnly}
        />
      </Section>

      {cur && (
        <Section title="Used by" summary={cur.usage.filter((u) => u.count).map((u) => `${u.label} ${u.count}`).join(" · ") || "Nothing yet"}>
          <UsedByList usage={cur.usage} />
        </Section>
      )}
      <CustomFieldsSection formType={58} noun="currencies" />

      {cur && (
        <DeleteDialog
          open={deleting}
          name={codeAndName(cur)}
          noun="currency"
          onClose={() => setDeleting(false)}
          onDelete={() => {
            setDeleting(false);
            deleteCurrency(cur.id);
            onClose();
            show("success", `${label ?? cur.name} deleted`);
          }}
        />
      )}
    </MasterSheet>
  );
}
