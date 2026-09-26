import * as React from "react";
import { Lock as LockGlyph, Plus, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { Dialog, DANGER_BTN, GHOST, GHOST_SM, NUM, Select, Switch, useToast } from "../../sales/bzw";
import { Section } from "../../sales/parts";
import { LINK } from "../kit";
import type { MasterKindConfig } from "../kit";
import { MASTER_SUBSIDIARIES, subsidiaryName } from "../seed/currencies";

// ════════════════════════════════════════════════════════════════════════════
// HUB SHARED — what every kind of the masters hub hands its config and sheet
//
//   HubCtx          the page's services: toast, the clock, the reader's
//                   rights on this kind, how to open a record
//   useKindRead     the kind's read lifecycle (first read · failed · empty),
//                   driven by the mockup's URL switches ?slow=1 ?fail=1 ?empty=1
//   SubsidiaryChips the membership map (`<X>_MAP_ORGANISATION`) as chips
//   UsedByList      B-C3's labels, one line each
//   CustomFields    the tenant's custom fields for the kind (none set up here)
//   DeleteDialog    "Delete X? This can't be undone." — offered only when unused
// ════════════════════════════════════════════════════════════════════════════

export type Toast = ReturnType<typeof useToast>["show"];

export type Perm = "full" | "read" | "none";

export type HubCtx = {
  show: Toast;
  today: string;
  /** The reader's rights on the ACTIVE kind (the mockup's `?perm=read|none`). */
  perm: Perm;
  /** Open a record of this kind (`masters/:kind/:id`), or close it (null). */
  open: (id: string | null) => void;
  /** The record open in the URL, or "new". */
  openId: string | null;
  /** Mockup read switches for the active kind. */
  read: KindRead;
};

export type KindRead = { loading: boolean; failed: boolean; empty: boolean; retry: () => void };

/** The first read of a kind: skeleton rows for a moment under `?slow=1`, a failed read under `?fail=1` until Retry. */
export function useKindRead(kind: string, search: URLSearchParams): KindRead {
  const slow = search.get("slow") === "1";
  const fail = search.get("fail") === "1";
  const empty = search.get("empty") === "1";
  const [phase, setPhase] = React.useState<"loading" | "failed" | "ready">(slow ? "loading" : fail ? "failed" : "ready");
  React.useEffect(() => {
    if (!slow) return setPhase(fail ? "failed" : "ready");
    setPhase("loading");
    const id = window.setTimeout(() => setPhase(fail ? "failed" : "ready"), 1400);
    return () => window.clearTimeout(id);
  }, [kind, slow, fail]);
  const retry = React.useCallback(() => {
    setPhase("loading");
    window.setTimeout(() => setPhase("ready"), 700);
  }, []);
  return { loading: phase === "loading", failed: phase === "failed", empty, retry };
}

/** A kind's config plus its sheet and any dialog it owns. */
export type KindBundle = {
  config: MasterKindConfig<any>;
  sheet?: (ctx: { docked: boolean }) => React.ReactNode;
  overlays?: React.ReactNode;
};

/** Labels in a usage list that are masters, not documents — "In use · 41 documents" counts only the others. */
const MASTER_LABELS = new Set(["Customers", "Vendors", "Bank accounts", "Items", "Employees", "Items (base unit)"]);
export const documentCount = (usage: { label: string; count: number }[]) => usage.filter((u) => !MASTER_LABELS.has(u.label)).reduce((s, u) => s + u.count, 0);
export const usageTotal = (usage: { label: string; count: number }[]) => usage.reduce((s, u) => s + u.count, 0);

/**
 * The sheet head's usage line. It leads with the SAME figure as the table's Used by column (every record),
 * then how many of those are documents — the head once said "41 documents" beside a column saying 46,
 * which read as a contradiction (design review §16.2 #4).
 */
export function usageMeta(usage: { label: string; count: number }[]) {
  const total = usageTotal(usage);
  const docs = documentCount(usage);
  if (total === 0) return "Not used";
  const n = total.toLocaleString("en-US");
  if (docs === total) return `Used by ${n} document${docs === 1 ? "" : "s"}`;
  return docs > 0 ? `Used by ${n} · ${docs.toLocaleString("en-US")} document${docs === 1 ? "" : "s"}` : `Used by ${n}`;
}

/** A two-column form grid inside a sheet section. */
export const FORM_GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2";

export function SubsidiaryChips({
  orgs,
  onChange,
  locked = {},
  applyToChild,
  onApplyToChild,
  readOnly,
}: {
  orgs: string[];
  onChange: (next: string[]) => void;
  /** org → why this chip can't be removed ("Base of yejagoj"). */
  locked?: Record<string, string>;
  applyToChild: boolean;
  onApplyToChild: (v: boolean) => void;
  readOnly?: boolean;
}) {
  const addable = MASTER_SUBSIDIARIES.filter((s) => !orgs.includes(s.id));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {orgs.map((o) => (
          <span key={o} className="inline-flex h-7 items-center gap-1 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm pl-2.5 pr-1 text-[12px] text-bz-text" title={locked[o]}>
            {subsidiaryName(o)}
            {locked[o] ? (
              <span className="inline-flex items-center gap-1 px-1 text-[11px] text-bz-text-soft">
                <LockGlyph size={11} aria-hidden /> {locked[o]}
              </span>
            ) : readOnly ? (
              <span className="w-1.5" />
            ) : (
              <button type="button" onClick={() => onChange(orgs.filter((x) => x !== o))} className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-bz-surface hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire" aria-label={`Remove ${subsidiaryName(o)}`} title={`Remove ${subsidiaryName(o)}`}>
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        {orgs.length === 0 && <span className="text-[12px] text-bz-text-soft">No subsidiary.</span>}
        {!readOnly && addable.length > 0 && (
          <Select trigger="ghost" className="h-7" label={<span className="inline-flex items-center gap-1"><Plus size={12} /> Add</span>} value={null} onChange={(v) => onChange([...orgs, v])} width={220} options={addable.map((s) => ({ value: s.id, label: s.name }))} />
        )}
      </div>
      <label className="flex items-center gap-2 text-[12px] text-bz-text-muted">
        {readOnly ? <span className="font-medium text-bz-text">{applyToChild ? "Yes" : "No"}</span> : <Switch on={applyToChild} onChange={onApplyToChild} label="Apply to child subsidiaries" />}
        Apply to child subsidiaries
      </label>
    </div>
  );
}

export function UsedByList({ usage }: { usage: { label: string; count: number }[] }) {
  const shown = usage.filter((u) => u.count > 0);
  if (!shown.length) return <p className="m-0 text-[12px] text-bz-text-soft">Nothing uses it yet.</p>;
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-x-6 p-0 sm:grid-cols-2">
      {shown.map((u) => (
        <li key={u.label} className="flex items-center justify-between gap-3 border-b border-bz-line-soft py-1.5 text-[12px] text-bz-text last:border-0">
          {u.label}
          <span className={cn("text-bz-text-muted", NUM)}>{u.count.toLocaleString("en-US")}</span>
        </li>
      ))}
    </ul>
  );
}

/** The tenant's custom fields for this kind (Custom Form `formType`). None are set up in this tenant. */
export function CustomFieldsSection({ formType, noun }: { formType: number; noun: string }) {
  return (
    <Section title="Custom fields" summary="None set up">
      <p className="m-0 text-[12px] text-bz-text-soft" title={`Custom Form, form type ${formType}`}>
        No custom fields for {noun} yet.
      </p>
    </Section>
  );
}

/** A quiet state band at the head of a sheet: archived, base of, view only. */
export function Band({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-bz-text">
      <span className="min-w-0 flex-1">{children}</span>
      {action}
    </div>
  );
}

export function DeleteDialog({ open, name, noun, onClose, onDelete }: { open: boolean; name: string; noun: string; onClose: () => void; onDelete: () => void }) {
  return (
    <Dialog
      open={open}
      size="sm"
      title={`Delete ${name}?`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={DANGER_BTN} onClick={onDelete}>
            Delete {noun}
          </button>
        </>
      }
    >
      This can't be undone.
    </Dialog>
  );
}

/** Foot-left quiet danger link ("Archive") / plain link ("Restore"). */
export function FootLink({ children, onClick, danger, title }: { children: React.ReactNode; onClick: () => void; danger?: boolean; title?: string }) {
  return (
    <button type="button" onClick={onClick} title={title} className={cn(LINK, "text-[12px] no-underline hover:underline", danger ? "text-bz-red hover:text-bz-red" : "")}>
      {children}
    </button>
  );
}

/** A read face for a view-only field. */
export function ReadValue({ children, soft }: { children: React.ReactNode; soft?: boolean }) {
  return <div className={cn("flex min-h-9 items-center text-[12.5px]", soft ? "text-bz-text-soft" : "text-bz-text", NUM)}>{children}</div>;
}

export { GHOST_SM };
