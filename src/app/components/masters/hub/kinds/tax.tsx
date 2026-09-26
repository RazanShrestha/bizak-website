import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "../../../ui/utils";
import { Chip, Empty, GHOST_SM, INPUT, MenuItem, MenuSep, NUM, Select, Switch, TEXTAREA } from "../../../sales/bzw";
import { Section } from "../../../sales/parts";
import { useStore } from "../../../sales/store";
import { useKeys, useMedia } from "../../../sales/orders";
import { MasterSheet, PageField, Source, parseNum } from "../../kit";
import type { GridColumn, MasterKindConfig } from "../../kit";
import { MASTER_SUBSIDIARIES } from "../../seed/currencies";
import { TAX_LEDGERS, duplicateOf, missingAccounts, newTaxId, taxStore, taxUsed } from "../../seed/taxes";
import type { Tax, TaxFlags } from "../../seed/taxes";
import { Band, CustomFieldsSection, DeleteDialog, FORM_GRID, FootLink, ReadValue, SubsidiaryChips, UsedByList, usageMeta } from "../shared";
import type { HubCtx, KindBundle, Toast } from "../shared";

// ════════════════════════════════════════════════════════════════════════════
// TAX CODES — tier 2, a sheet (spec §4.5 Tax, D-13)
//
// The two accounts are what posting needs, so an empty one reads what will
// happen — "Invoices will refuse" (sales, LIABILITY_ACCOUNT_ID) / "Bills will
// refuse" (purchase, ASSETS_ACCOUNT_ID) — in danger ink, in the table and on
// the sheet. The sheet requires both (the old form didn't; posting does).
// Changing a used tax's rate says, before Save, "Invoices saved from now on
// use 15 %." — today's behaviour kept (D-13); it claims nothing about saved
// invoices. A new or edited code another live tax holds is refused (B-C8);
// the dev tenant's existing duplicates are flagged, and saving other fields
// of one is allowed.
// ════════════════════════════════════════════════════════════════════════════

type Row = Tax & { used: number };

const FLAG_LABELS: [keyof TaxFlags, string][] = [
  ["isDefault", "Default tax code"],
  ["appliesToServices", "Applies to service items"],
  ["reverseCharge", "Reverse charge"],
  ["export", "Export"],
  ["exempt", "Exempt"],
  ["excludeFromVat", "Exclude from VAT reports"],
];

const REFUSE_SALES = "Invoices will refuse";
const REFUSE_PURCHASE = "Bills will refuse";
/** Preference Setup's default ledger for each side (the quick add fills these on add). */
const DEFAULT_SALES = "VAT Payable";
const DEFAULT_PURCHASE = "VAT Receivable";

export function useTaxKind(ctx: HubCtx): KindBundle {
  const taxes = useStore(taxStore);
  const narrow = !useMedia("(min-width: 768px)");
  const [deleting, setDeleting] = React.useState<Tax | null>(null);
  const ro = ctx.perm !== "full";
  const { show } = ctx;
  const rows: Row[] = ctx.read.empty ? [] : taxes.map((t) => ({ ...t, used: taxUsed(t) }));
  const live = rows.filter((t) => !t.archived);
  const account = (t: Row, side: "sales" | "purchase") =>
    t[side] ? <span className="truncate">{t[side]}</span> : <span className="font-medium text-bz-red">{side === "sales" ? REFUSE_SALES : REFUSE_PURCHASE}</span>;
  const codeCell = (t: Row) => {
    const dups = t.archived ? [] : duplicateOf(taxes, t);
    return (
      <span className="inline-flex min-w-0 items-center gap-1">
        <span className="truncate font-semibold">{t.name}</span>
        {dups.length > 0 && <TriangleAlert size={12} className="shrink-0 text-bz-amber" aria-label={`${dups.length} other tax code${dups.length === 1 ? " has" : "s have"} this code`} />}
      </span>
    );
  };

  const columns: GridColumn<Row>[] = narrow
    ? [
        { key: "name", label: "Code", width: "minmax(0,1.2fr)", kind: "readonly", render: codeCell },
        { key: "rate", label: "Rate", width: "52px", kind: "readonly", align: "right", render: (t) => `${t.rate} %` },
        {
          key: "accounts",
          label: "Accounts",
          width: "minmax(0,1fr)",
          kind: "readonly",
          render: (t) => (!t.sales ? account(t, "sales") : !t.purchase ? account(t, "purchase") : <span className="text-bz-text-soft">Set</span>),
        },
      ]
    : [
        { key: "name", label: "Code", width: "minmax(0,1.3fr)", kind: "readonly", render: codeCell, title: (t) => (duplicateOf(taxes, t).length && !t.archived ? `${duplicateOf(taxes, t).length + 1} tax codes are called ${t.name}` : t.description || t.name) },
        { key: "rate", label: "Rate", width: "64px", kind: "readonly", align: "right", render: (t) => `${t.rate} %` },
        { key: "sales", label: "Sales tax account", width: "minmax(0,1fr)", kind: "readonly", render: (t) => account(t, "sales") },
        { key: "purchase", label: "Purchase tax account", width: "minmax(0,1fr)", kind: "readonly", render: (t) => account(t, "purchase") },
      ];

  const archive = (t: Tax, archived: boolean) => {
    const snap = taxStore.get();
    taxStore.set((ts) => ts.map((x) => (x.id === t.id ? { ...x, archived } : x)));
    show("success", archived ? "Archived" : "Restored", { label: "Undo", run: () => taxStore.set(() => snap) }, 8000);
  };

  const config: MasterKindConfig<Row> = {
    key: "taxes",
    label: "Tax codes",
    group: "Money",
    count: live.length,
    tier: 2,
    noun: ["tax code", "tax codes"],
    rows,
    columns,
    minWidth: narrow ? 0 : undefined,
    searchText: (t) => `${t.name} ${t.description}`,
    usage: (t) => t.usage,
    usageNoun: "records",
    picks: [
      { key: "in-use", label: "In use", value: live.filter((t) => t.used > 0).length, test: (t) => !t.archived && t.used > 0 },
      { key: "missing", label: "Missing accounts", value: live.filter(missingAccounts).length, test: (t) => !t.archived && missingAccounts(t), danger: true, title: "An invoice or bill using it will refuse to post" },
      { key: "dups", label: "Duplicate codes", value: live.filter((t) => duplicateOf(taxes, t).length > 0).length, test: (t) => !t.archived && duplicateOf(taxes, t).length > 0, title: "More than one live tax code has the same code" },
      { key: "archived", label: "Archived", value: rows.filter((t) => t.archived).length, test: (t) => t.archived, showZero: true },
    ],
    filters: [
      ...MASTER_SUBSIDIARIES.map((s) => ({ value: `org:${s.id}`, label: s.name, group: "Subsidiary", test: (t: Row) => t.orgs.includes(s.id) })),
      { value: "st:active", label: "Active", group: "Status", test: (t: Row) => !t.archived },
      { value: "st:archived", label: "Archived", group: "Status", test: (t: Row) => t.archived },
    ],
    newLabel: "New tax code",
    rowMenu: (t, close) => (
      <>
        <MenuItem onClick={() => (close(), ctx.open(t.id))}>Open</MenuItem>
        {!ro && (
          <>
            <MenuSep />
            <MenuItem onClick={() => (close(), archive(t, !t.archived))}>{t.archived ? "Restore" : "Archive"}</MenuItem>
            {t.used === 0 && (
              <MenuItem danger onClick={() => (close(), setDeleting(t))}>
                Delete
              </MenuItem>
            )}
          </>
        )}
      </>
    ),
    readOnly: ro,
    denied: ctx.perm === "none",
    loading: ctx.read.loading,
    failed: ctx.read.failed,
    onRetry: ctx.read.retry,
  };

  return {
    config,
    sheet: ({ docked }) => (ctx.openId ? <TaxSheet key={ctx.openId} id={ctx.openId} docked={docked} readOnly={ro} show={show} onClose={() => ctx.open(null)} onOpen={(id) => ctx.open(id)} onDelete={setDeleting} onArchive={archive} /> : null),
    overlays: (
      <DeleteDialog
        open={!!deleting}
        name={deleting?.name ?? ""}
        noun="tax code"
        onClose={() => setDeleting(null)}
        onDelete={() => {
          const d = deleting!;
          setDeleting(null);
          taxStore.set((ts) => ts.filter((t) => t.id !== d.id));
          if (ctx.openId === d.id) ctx.open(null);
          show("success", `${d.name} deleted`);
        }}
      />
    ),
  };
}

type Draft = Pick<Tax, "name" | "description" | "sales" | "purchase" | "flags" | "orgs"> & { rate: string; applyToChild: boolean };

function TaxSheet(props: { id: string; docked: boolean; readOnly: boolean; show: Toast; onClose: () => void; onOpen: (id: string) => void; onDelete: (t: Tax) => void; onArchive: (t: Tax, archived: boolean) => void }) {
  const taxes = useStore(taxStore);
  const cur = props.id === "new" ? null : taxes.find((t) => t.id === props.id) ?? null;
  if (props.id !== "new" && !cur)
    return (
      <MasterSheet docked={props.docked} mode="view" eyebrow="Tax code" title="Tax code" onClose={props.onClose}>
        <Empty title="This tax code isn't available." />
      </MasterSheet>
    );
  return <TaxForm {...props} cur={cur} />;
}

function TaxForm({
  cur,
  id,
  docked,
  readOnly,
  show,
  onClose,
  onOpen,
  onDelete,
  onArchive,
}: {
  cur: Tax | null;
  id: string;
  docked: boolean;
  readOnly: boolean;
  show: Toast;
  onClose: () => void;
  onOpen: (id: string) => void;
  onDelete: (t: Tax) => void;
  onArchive: (t: Tax, archived: boolean) => void;
}) {
  const taxes = useStore(taxStore);
  const isNew = id === "new";
  const toDraft = (t: Tax | null): Draft =>
    t
      ? { name: t.name, description: t.description, sales: t.sales, purchase: t.purchase, flags: t.flags, orgs: t.orgs, rate: String(t.rate), applyToChild: !!t.applyToChild }
      : { name: "", description: "", sales: DEFAULT_SALES, purchase: DEFAULT_PURCHASE, flags: { reverseCharge: false, appliesToServices: false, export: false, exempt: false, isDefault: false, excludeFromVat: false }, orgs: ["186"], rate: "", applyToChild: false };
  const saved = toDraft(cur);
  const [draft, setDraft] = React.useState<Draft>(saved);
  const [tried, setTried] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => (setDraft((d) => ({ ...d, [k]: v })), setRefusal(null));

  const rate = parseNum(draft.rate);
  const codeChanged = !cur || cur.name.trim().toLowerCase() !== draft.name.trim().toLowerCase();
  const errors = {
    name: !draft.name.trim()
      ? "Enter a code."
      : codeChanged && taxes.some((t) => t.id !== cur?.id && !t.archived && t.name.trim().toLowerCase() === draft.name.trim().toLowerCase())
        ? `${draft.name.trim()} is already a tax code.`
        : null,
    rate: rate === null ? "Enter a rate." : rate < 0 ? "A rate is 0 or more." : null,
    sales: draft.sales ? null : "Choose a sales tax account.",
    purchase: draft.purchase ? null : "Choose a purchase tax account.",
  };
  const firstErr = Object.values(errors).find(Boolean) ?? null;
  const dirty = !readOnly && JSON.stringify(draft) !== JSON.stringify(saved);
  const used = cur ? taxUsed(cur) : 0;
  const rateNote = cur && used > 0 && rate !== null && rate !== cur.rate && rate >= 0 ? `Invoices saved from now on use ${rate} %.` : null;
  const dups = cur && !cur.archived ? duplicateOf(taxes, cur) : [];

  const save = () => {
    if (readOnly) return;
    setTried(true);
    if (firstErr) return setRefusal(firstErr);
    const snap = taxStore.get();
    const fields = { name: draft.name.trim(), description: draft.description.trim(), rate: rate!, sales: draft.sales, purchase: draft.purchase, flags: draft.flags, orgs: draft.orgs, applyToChild: draft.applyToChild };
    if (cur) {
      taxStore.set((ts) => ts.map((t) => (t.id === cur.id ? { ...t, ...fields } : t)));
      show("success", "Tax code saved", { label: "Undo", run: () => taxStore.set(() => snap) }, 8000);
    } else {
      const t: Tax = { id: newTaxId(), ...fields, archived: false, usage: [] };
      taxStore.set((ts) => [...ts, t]);
      show("success", `${t.name} created`, { label: "Undo", run: () => taxStore.set(() => snap) }, 8000);
      onOpen(t.id);
    }
    setTried(false);
  };
  useKeys({ "mod+s": (e) => (e.preventDefault(), save()) }, !readOnly);

  const err = (k: keyof typeof errors) => (tried ? errors[k] : null);
  const ledgerOpts = (side: "liability" | "asset") => TAX_LEDGERS.filter((l) => l.side === side).map((l) => ({ value: l.id, label: l.name }));
  const accountField = (k: "sales" | "purchase", label: string, side: "liability" | "asset", refuse: string, fallback: string) => (
    <PageField label={label} required dirty={!isNew && draft[k] !== saved[k]} error={err(k)}>
      {readOnly ? (
        draft[k] ? <ReadValue>{draft[k]}</ReadValue> : <Source kind="missing" text={`Not set — ${refuse.toLowerCase()}`} />
      ) : (
        <div className="flex flex-col gap-1">
          <Select
            trigger="ghost"
            className={cn("h-9 w-full justify-between", !draft[k] && "border-bz-red-mark")}
            label={draft[k] ?? <span className="font-normal text-bz-text-soft">Choose an account…</span>}
            value={draft[k]}
            onChange={(v) => set(k, v)}
            width={280}
            options={ledgerOpts(side)}
          />
          {!draft[k] && <Source kind="missing" text={`Not set — ${refuse.toLowerCase()}`} useDefault={{ label: fallback, onUse: () => set(k, fallback) }} />}
        </div>
      )}
    </PageField>
  );

  return (
    <MasterSheet
      docked={docked}
      mode={readOnly ? "view" : isNew ? "create" : "edit"}
      eyebrow="Tax code"
      title={isNew ? "New tax code" : cur!.name}
      meta={cur ? [`${cur.rate} %`, usageMeta(cur.usage)] : undefined}
      chips={
        cur && (readOnly || cur.archived || missingAccounts(cur) || dups.length > 0) ? (
          <>
            {missingAccounts(cur) && <Chip tone="danger">Needs accounts</Chip>}
            {dups.length > 0 && <Chip tone="pending" dot={false}>Duplicate code</Chip>}
            {cur.archived && <Chip tone="neutral" dot={false}>Archived</Chip>}
            {readOnly && <Chip tone="neutral" dot={false}>View only</Chip>}
          </>
        ) : undefined
      }
      context={
        cur?.archived ? (
          <Band action={!readOnly && <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => onArchive(cur, false)}>Restore</button>}>Archived — hidden from pickers.</Band>
        ) : dups.length > 0 ? (
          <Band>{dups.length + 1} tax codes share this code.</Band>
        ) : undefined
      }
      menu={cur && !readOnly && used === 0 ? (close) => <MenuItem danger onClick={() => (close(), onDelete(cur))}>Delete</MenuItem> : undefined}
      footLeft={cur && !readOnly && !cur.archived ? <FootLink danger onClick={() => onArchive(cur, true)} title="Hide it from pickers; documents keep it">Archive</FootLink> : undefined}
      onCommit={save}
      dirty={dirty}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      onClose={onClose}
    >
      <div className={cn(FORM_GRID, "px-5 py-4")}>
        <PageField label="Code" required dirty={!isNew && draft.name !== saved.name} error={err("name")}>
          {readOnly ? <ReadValue>{draft.name}</ReadValue> : <input autoFocus={isNew} value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="VAT 13" aria-label="Code" className={cn(INPUT, err("name") && "border-bz-red-mark")} />}
        </PageField>
        <PageField label="Rate %" required dirty={!isNew && draft.rate !== saved.rate} error={err("rate")} hint={rateNote ? <span className="text-bz-text">{rateNote}</span> : undefined}>
          {readOnly ? (
            <ReadValue>{draft.rate} %</ReadValue>
          ) : (
            <input value={draft.rate} onChange={(e) => set("rate", e.target.value)} inputMode="decimal" placeholder="13" aria-label="Rate %" className={cn(INPUT, "text-right", NUM, err("rate") && "border-bz-red-mark")} />
          )}
        </PageField>
        <PageField label="Description" className="sm:col-span-2" dirty={!isNew && draft.description !== saved.description}>
          {readOnly ? <ReadValue soft={!draft.description}>{draft.description || "—"}</ReadValue> : <textarea value={draft.description} onChange={(e) => set("description", e.target.value)} rows={2} aria-label="Description" className={cn(TEXTAREA, "min-h-[56px]")} />}
        </PageField>
      </div>
      <Section title="Accounts" summary={[draft.sales ?? REFUSE_SALES, draft.purchase ?? REFUSE_PURCHASE].join(" · ")} defaultOpen>
        <div className={FORM_GRID}>
          {accountField("sales", "Sales tax account", "liability", REFUSE_SALES, DEFAULT_SALES)}
          {accountField("purchase", "Purchase tax account", "asset", REFUSE_PURCHASE, DEFAULT_PURCHASE)}
        </div>
      </Section>
      <Section title="More" summary={FLAG_LABELS.filter(([k]) => draft.flags[k]).map(([, l]) => l).join(" · ") || "No flags"}>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {FLAG_LABELS.map(([k, l]) => (
            <li key={k} className="flex items-center justify-between gap-3 text-[12.5px] text-bz-text">
              {l}
              {readOnly ? <span className="text-bz-text-muted">{draft.flags[k] ? "Yes" : "No"}</span> : <Switch on={draft.flags[k]} onChange={(v) => set("flags", { ...draft.flags, [k]: v })} label={l} />}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Subsidiaries" summary={draft.orgs.map((o) => MASTER_SUBSIDIARIES.find((s) => s.id === o)?.name ?? o).join(" · ")}>
        <SubsidiaryChips orgs={draft.orgs} onChange={(v) => set("orgs", v)} applyToChild={draft.applyToChild} onApplyToChild={(v) => set("applyToChild", v)} readOnly={readOnly} />
      </Section>
      {cur && (
        <Section title="Used by" summary={cur.usage.filter((u) => u.count).map((u) => `${u.label} ${u.count}`).join(" · ") || "Nothing yet"}>
          <UsedByList usage={cur.usage} />
        </Section>
      )}
      <CustomFieldsSection formType={60} noun="tax codes" />
    </MasterSheet>
  );
}
