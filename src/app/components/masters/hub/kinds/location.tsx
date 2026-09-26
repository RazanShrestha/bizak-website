import * as React from "react";
import { cn } from "../../../ui/utils";
import { Chip, Empty, GHOST_SM, INPUT, MenuItem, MenuSep, NUM, Segmented, Select, TEXTAREA } from "../../../sales/bzw";
import { Section } from "../../../sales/parts";
import { useStore } from "../../../sales/store";
import { useKeys, useMedia } from "../../../sales/orders";
import { MasterSheet, PageField, parseNum } from "../../kit";
import type { GridColumn, MasterKindConfig } from "../../kit";
import { MASTER_SUBSIDIARIES, subsidiaryName } from "../../seed/currencies";
import { LOCATION_CYCLE, LOCATION_TYPES, locationStore, locationUsed, newLocationId } from "../../seed/locations";
import type { LocationType, MasterLocation } from "../../seed/locations";
import { Band, CustomFieldsSection, DeleteDialog, FORM_GRID, FootLink, ReadValue, SubsidiaryChips, UsedByList, usageMeta } from "../shared";
import type { HubCtx, KindBundle, Toast } from "../shared";

// ════════════════════════════════════════════════════════════════════════════
// LOCATIONS — tier 2, a sheet (spec §4.5 Location)
//
// The sheet head states "Holds stock of 32 items" (the availability read) so
// an archive is a knowing act. Name ≤ 100 (the entity's limit, not the old
// form's 50), Type segmented, Address required, Parent refused when it would
// close a loop (B-C8 adds that check), Description; the rarely-touched
// columns sit in "More". Archive / Restore are the existing active /
// deactive endpoints once they are POSTs (B-C4).
// ════════════════════════════════════════════════════════════════════════════

type Row = MasterLocation & { used: number };
const typeLabel = (t: LocationType) => LOCATION_TYPES.find((x) => x.value === t)?.label ?? "None";

export function useLocationKind(ctx: HubCtx): KindBundle {
  const locs = useStore(locationStore);
  const narrow = !useMedia("(min-width: 768px)");
  const [deleting, setDeleting] = React.useState<MasterLocation | null>(null);
  const ro = ctx.perm !== "full";
  const { show } = ctx;
  const rows: Row[] = ctx.read.empty ? [] : locs.map((l) => ({ ...l, used: locationUsed(l) }));
  const live = rows.filter((l) => !l.archived);
  const nameOf = (id: string | null) => (id ? locs.find((l) => l.id === id)?.name ?? "—" : "—");

  const columns: GridColumn<Row>[] = narrow
    ? [
        { key: "name", label: "Name", width: "minmax(0,1fr)", kind: "readonly", render: (l) => <span className="font-semibold">{l.name}</span> },
        { key: "type", label: "Type", width: "84px", kind: "readonly", render: (l) => typeLabel(l.type) },
      ]
    : [
        { key: "name", label: "Name", width: "minmax(0,1.2fr)", kind: "readonly", render: (l) => <span className="font-semibold">{l.name}</span> },
        { key: "type", label: "Type", width: "92px", kind: "readonly", render: (l) => (l.type === "none" ? <span className="text-bz-text-soft">None</span> : typeLabel(l.type)) },
        { key: "address", label: "Address", width: "minmax(0,1.3fr)", kind: "readonly", render: (l) => <span className="truncate text-bz-text-muted">{l.address}</span> },
        { key: "parent", label: "Parent", width: "minmax(0,0.9fr)", kind: "readonly", render: (l) => (l.parent ? nameOf(l.parent) : <span className="text-bz-text-soft">—</span>) },
      ];

  const archive = (l: MasterLocation, archived: boolean) => {
    const snap = locationStore.get();
    locationStore.set((ls) => ls.map((x) => (x.id === l.id ? { ...x, archived } : x)));
    show("success", archived ? "Archived" : "Restored", { label: "Undo", run: () => locationStore.set(() => snap) }, 8000);
  };

  const config: MasterKindConfig<Row> = {
    key: "locations",
    label: "Locations",
    group: "Organisation",
    count: live.length,
    tier: 2,
    noun: ["location", "locations"],
    rows,
    columns,
    minWidth: narrow ? 0 : undefined,
    searchText: (l) => `${l.name} ${l.address}`,
    searchPlaceholder: "Name or address",
    usage: (l) => l.usage,
    usageNoun: "records",
    picks: [
      { key: "in-use", label: "In use", value: live.filter((l) => l.used > 0).length, test: (l) => !l.archived && l.used > 0 },
      { key: "stock", label: "Holding stock", value: live.filter((l) => l.itemsInStock > 0).length, test: (l) => !l.archived && l.itemsInStock > 0, title: "Locations with stock of at least one item" },
      { key: "unused", label: "Not used", value: live.filter((l) => !l.used).length, test: (l) => !l.archived && !l.used },
      { key: "archived", label: "Archived", value: rows.filter((l) => l.archived).length, test: (l) => l.archived, showZero: true },
    ],
    filters: [
      ...MASTER_SUBSIDIARIES.map((s) => ({ value: `org:${s.id}`, label: s.name, group: "Subsidiary", test: (l: Row) => l.orgs.includes(s.id) })),
      ...LOCATION_TYPES.map((t) => ({ value: `type:${t.value}`, label: t.label, group: "Type", test: (l: Row) => l.type === t.value })),
      { value: "st:active", label: "Active", group: "Status", test: (l: Row) => !l.archived },
      { value: "st:archived", label: "Archived", group: "Status", test: (l: Row) => l.archived },
    ],
    newLabel: "New location",
    rowMenu: (l, close) => (
      <>
        <MenuItem onClick={() => (close(), ctx.open(l.id))}>Open</MenuItem>
        {!ro && (
          <>
            <MenuSep />
            <MenuItem onClick={() => (close(), archive(l, !l.archived))}>{l.archived ? "Restore" : "Archive"}</MenuItem>
            {l.used === 0 && l.itemsInStock === 0 && !locs.some((x) => x.parent === l.id) && (
              <MenuItem danger onClick={() => (close(), setDeleting(l))}>
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
    sheet: ({ docked }) => (ctx.openId ? <LocationSheet key={ctx.openId} id={ctx.openId} docked={docked} readOnly={ro} show={show} onClose={() => ctx.open(null)} onOpen={(id) => ctx.open(id)} onArchive={archive} onDelete={setDeleting} /> : null),
    overlays: (
      <DeleteDialog
        open={!!deleting}
        name={deleting?.name ?? ""}
        noun="location"
        onClose={() => setDeleting(null)}
        onDelete={() => {
          const d = deleting!;
          setDeleting(null);
          locationStore.set((ls) => ls.filter((l) => l.id !== d.id));
          if (ctx.openId === d.id) ctx.open(null);
          show("success", `${d.name} deleted`);
        }}
      />
    ),
  };
}

type SheetProps = { id: string; docked: boolean; readOnly: boolean; show: Toast; onClose: () => void; onOpen: (id: string) => void; onArchive: (l: MasterLocation, archived: boolean) => void; onDelete: (l: MasterLocation) => void };

function LocationSheet(props: SheetProps) {
  const locs = useStore(locationStore);
  const cur = props.id === "new" ? null : locs.find((l) => l.id === props.id) ?? null;
  if (props.id !== "new" && !cur)
    return (
      <MasterSheet docked={props.docked} mode="view" eyebrow="Location" title="Location" onClose={props.onClose}>
        <Empty title="This location isn't available." />
      </MasterSheet>
    );
  return <LocationForm {...props} cur={cur} />;
}

type Draft = {
  name: string;
  type: LocationType;
  address: string;
  parent: string | null;
  description: string;
  docPrefix: string;
  txnPrefix: string;
  minCapacity: string;
  maxCapacity: string;
  threshold: string;
  fiscalYear: string;
  latitude: string;
  longitude: string;
  orgs: string[];
  applyToChild: boolean;
};
const s = (n: number | null) => (n === null ? "" : String(n));

function LocationForm({ cur, id, docked, readOnly, show, onClose, onOpen, onArchive, onDelete }: SheetProps & { cur: MasterLocation | null }) {
  const locs = useStore(locationStore);
  const isNew = id === "new";
  const toDraft = (l: MasterLocation | null): Draft =>
    l
      ? { name: l.name, type: l.type, address: l.address, parent: l.parent, description: l.description, docPrefix: l.docPrefix, txnPrefix: l.txnPrefix, minCapacity: s(l.minCapacity), maxCapacity: s(l.maxCapacity), threshold: s(l.threshold), fiscalYear: l.fiscalYear, latitude: s(l.latitude), longitude: s(l.longitude), orgs: l.orgs, applyToChild: !!l.applyToChild }
      : { name: "", type: "warehouse", address: "", parent: null, description: "", docPrefix: "", txnPrefix: "", minCapacity: "", maxCapacity: "", threshold: "", fiscalYear: "", latitude: "", longitude: "", orgs: ["186"], applyToChild: false };
  const saved = toDraft(cur);
  const [draft, setDraft] = React.useState<Draft>(saved);
  const [tried, setTried] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => (setDraft((d) => ({ ...d, [k]: v })), setRefusal(null));

  // B-C8: walk up from the new parent; reaching this location means a loop.
  const makesLoop = (parent: string | null) => {
    if (!parent || !cur) return false;
    const seen = new Set<string>();
    let at: string | null = parent;
    while (at && !seen.has(at)) {
      if (at === cur.id) return true;
      seen.add(at);
      at = locs.find((l) => l.id === at)?.parent ?? null;
    }
    return false;
  };
  const nums = ["minCapacity", "maxCapacity", "threshold", "latitude", "longitude"] as const;
  const badNum = nums.find((k) => draft[k].trim() !== "" && parseNum(draft[k]) === null);
  const errors = {
    name: !draft.name.trim() ? "A name is required." : draft.name.trim().length > 100 ? "Keep the name under 100 characters." : null,
    address: !draft.address.trim() ? "Enter an address." : null,
    parent: makesLoop(draft.parent) ? LOCATION_CYCLE : null,
    more: badNum ? "Enter a number." : null,
  };
  const firstErr = Object.values(errors).find(Boolean) ?? null;
  const dirty = !readOnly && JSON.stringify(draft) !== JSON.stringify(saved);
  const err = (k: keyof typeof errors) => (tried ? errors[k] : null);

  const save = () => {
    if (readOnly) return;
    setTried(true);
    if (firstErr) return setRefusal(firstErr);
    const snap = locationStore.get();
    const n = (v: string) => parseNum(v);
    const fields = {
      name: draft.name.trim(),
      type: draft.type,
      address: draft.address.trim(),
      parent: draft.parent,
      description: draft.description.trim(),
      docPrefix: draft.docPrefix.trim(),
      txnPrefix: draft.txnPrefix.trim(),
      minCapacity: n(draft.minCapacity),
      maxCapacity: n(draft.maxCapacity),
      threshold: n(draft.threshold),
      fiscalYear: draft.fiscalYear.trim(),
      latitude: n(draft.latitude),
      longitude: n(draft.longitude),
      orgs: draft.orgs,
      applyToChild: draft.applyToChild,
    };
    if (cur) {
      locationStore.set((ls) => ls.map((l) => (l.id === cur.id ? { ...l, ...fields } : l)));
      show("success", "Location saved", { label: "Undo", run: () => locationStore.set(() => snap) }, 8000);
    } else {
      const l: MasterLocation = { id: newLocationId(), ...fields, archived: false, usage: [], itemsInStock: 0 };
      locationStore.set((ls) => [...ls, l]);
      show("success", `${l.name} created`, { label: "Undo", run: () => locationStore.set(() => snap) }, 8000);
      onOpen(l.id);
    }
    setTried(false);
  };
  useKeys({ "mod+s": (e) => (e.preventDefault(), save()) }, !readOnly);

  const text = (k: keyof Draft, label: string, placeholder = "", extra?: { num?: boolean; span?: boolean }) => (
    <PageField label={label} dirty={!isNew && draft[k] !== saved[k]} className={extra?.span ? "sm:col-span-2" : undefined}>
      {readOnly ? (
        <ReadValue soft={!draft[k]}>{(draft[k] as string) || "—"}</ReadValue>
      ) : (
        <input value={draft[k] as string} onChange={(e) => set(k, e.target.value as never)} placeholder={placeholder} aria-label={label} inputMode={extra?.num ? "decimal" : undefined} className={cn(INPUT, extra?.num && cn("text-right", NUM))} />
      )}
    </PageField>
  );
  const parents = locs.filter((l) => !l.archived && l.id !== cur?.id);
  const children = cur ? locs.filter((l) => l.parent === cur.id && !l.archived) : [];

  return (
    <MasterSheet
      docked={docked}
      mode={readOnly ? "view" : isNew ? "create" : "edit"}
      eyebrow="Location"
      title={isNew ? "New location" : cur!.name}
      meta={cur ? [typeLabel(cur.type), cur.itemsInStock ? `Holds stock of ${cur.itemsInStock} item${cur.itemsInStock === 1 ? "" : "s"}` : "No stock here", usageMeta(cur.usage)] : undefined}
      chips={cur && (readOnly || cur.archived) ? <>{cur.archived && <Chip tone="neutral" dot={false}>Archived</Chip>}{readOnly && <Chip tone="neutral" dot={false}>View only</Chip>}</> : undefined}
      context={
        cur?.archived ? (
          <Band action={!readOnly && <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => onArchive(cur, false)}>Restore</button>}>Archived — hidden from pickers.</Band>
        ) : undefined
      }
      menu={cur && !readOnly && locationUsed(cur) === 0 && cur.itemsInStock === 0 && children.length === 0 ? (close) => <MenuItem danger onClick={() => (close(), onDelete(cur))}>Delete</MenuItem> : undefined}
      footLeft={cur && !readOnly && !cur.archived ? <FootLink danger onClick={() => onArchive(cur, true)} title={cur.itemsInStock ? `It holds stock of ${cur.itemsInStock} items` : "Hide it from pickers; documents keep it"}>Archive</FootLink> : undefined}
      onCommit={save}
      dirty={dirty}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      onClose={onClose}
    >
      <div className={cn(FORM_GRID, "px-5 py-4")}>
        <PageField label="Name" required className="sm:col-span-2" dirty={!isNew && draft.name !== saved.name} error={err("name")}>
          {readOnly ? <ReadValue>{draft.name}</ReadValue> : <input autoFocus={isNew} value={draft.name} onChange={(e) => set("name", e.target.value)} maxLength={120} aria-label="Name" placeholder="Kathmandu WH" className={cn(INPUT, err("name") && "border-bz-red-mark")} />}
        </PageField>
        <PageField label="Type" dirty={!isNew && draft.type !== saved.type}>
          <div className="flex min-h-9 items-center">
            {readOnly ? <span className="text-[12.5px] text-bz-text">{typeLabel(draft.type)}</span> : <Segmented size="sm" value={draft.type} onChange={(v) => set("type", v)} options={LOCATION_TYPES} />}
          </div>
        </PageField>
        <PageField label="Parent" dirty={!isNew && draft.parent !== saved.parent} error={err("parent")}>
          {readOnly ? (
            <ReadValue soft={!draft.parent}>{draft.parent ? locs.find((l) => l.id === draft.parent)?.name : "—"}</ReadValue>
          ) : (
            <Select
              trigger="ghost"
              className="h-9 w-full justify-between"
              label={draft.parent ? locs.find((l) => l.id === draft.parent)?.name : <span className="font-normal text-bz-text-soft">None</span>}
              value={draft.parent ?? "__none"}
              onChange={(v) => set("parent", v === "__none" ? null : v)}
              width={260}
              options={[{ value: "__none", label: "None" }, ...parents.map((l) => ({ value: l.id, label: l.name, hint: typeLabel(l.type) }))]}
            />
          )}
        </PageField>
        <PageField label="Address" required className="sm:col-span-2" dirty={!isNew && draft.address !== saved.address} error={err("address")}>
          {readOnly ? <ReadValue>{draft.address}</ReadValue> : <input value={draft.address} onChange={(e) => set("address", e.target.value)} aria-label="Address" placeholder="Street, city" className={cn(INPUT, err("address") && "border-bz-red-mark")} />}
        </PageField>
        <PageField label="Description" className="sm:col-span-2" dirty={!isNew && draft.description !== saved.description}>
          {readOnly ? <ReadValue soft={!draft.description}>{draft.description || "—"}</ReadValue> : <textarea value={draft.description} onChange={(e) => set("description", e.target.value)} rows={2} aria-label="Description" className={cn(TEXTAREA, "min-h-[56px]")} />}
        </PageField>
      </div>
      <Section title="More" summary={[draft.docPrefix && `Prefix ${draft.docPrefix}`, draft.maxCapacity && `Max ${draft.maxCapacity}`, draft.fiscalYear].filter(Boolean).join(" · ") || "Prefixes, capacity, map"}>
        <div className={FORM_GRID}>
          {text("docPrefix", "Document prefix", "KTM")}
          {text("txnPrefix", "Transaction prefix", "KTM-")}
          {text("minCapacity", "Min capacity", "0", { num: true })}
          {text("maxCapacity", "Max capacity", "0", { num: true })}
          {text("threshold", "Threshold", "0", { num: true })}
          {text("fiscalYear", "Fiscal year", "2083/84")}
          {text("latitude", "Latitude", "27.7172", { num: true })}
          {text("longitude", "Longitude", "85.3240", { num: true })}
        </div>
        {err("more") && <p className="m-0 mt-2 text-[11.5px] text-bz-red">{errors.more}</p>}
      </Section>
      <Section title="Subsidiaries" summary={draft.orgs.map(subsidiaryName).join(" · ")}>
        <SubsidiaryChips orgs={draft.orgs} onChange={(v) => set("orgs", v)} applyToChild={draft.applyToChild} onApplyToChild={(v) => set("applyToChild", v)} readOnly={readOnly} />
      </Section>
      {cur && (
        <Section title="Used by" summary={cur.usage.filter((u) => u.count).map((u) => `${u.label} ${u.count}`).join(" · ") || "Nothing yet"}>
          <UsedByList usage={cur.usage} />
        </Section>
      )}
      <CustomFieldsSection formType={3} noun="locations" />
    </MasterSheet>
  );
}
